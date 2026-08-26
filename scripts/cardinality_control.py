"""Is Model A's fine detail signal, or cardinality the learner overfits?

Referee 2's objection, recorded in KNOWN_ISSUES under the 2026-08-18 blind pass
and still unrun: Model A has one distinct predictor vector per site and Model B
has roughly one per coarse cell, so only the fine arm has the cardinality to
overfit. Section 2.5's claim that "identical settings cannot bias the direction
of the contrast" is already refuted by the fold reversal, and the two arms
differ in more than resolution.

THE CONTROL
-----------
Model A' carries the SAME predictor values as Model A, permuted between sites
WITHIN each coarse cell. One permutation is drawn per cell and applied to every
summer, so each site keeps its own time series and simply moves to another
location inside the cell it already belonged to. That leaves untouched:

  - the cardinality of the fine arm (one distinct vector per site),
  - the marginal distribution of every predictor,
  - each site's temporal structure,
  - every cell-by-year mean, so Model B and f are bit-identical,

and destroys only the within-cell association between a predictor and the place
it was measured. A' is therefore Model A with its fine detail rendered
uninformative while every other property that could drive a fit is held.

WHAT EACH OUTCOME MEANS, FIXED BEFORE THE RUN
---------------------------------------------
  C1. If A' scores like A (their paired interval spans zero), the fine detail
      contributes nothing the learner can use, and A's deficit against B is
      cardinality rather than resolution. Referee 2 is right, and Section 2.5
      has to be rewritten.
  C2. If A' scores clearly worse than A (paired interval excludes zero, A
      better), the fine detail is real signal the learner exploits, and the
      A-vs-B contrast is about resolution after all.

C1 is the outcome that costs the paper something, so it is stated first and the
run is not repeated until it gives the other one.

Note what this does NOT settle. A' equal to A is consistent with the fine detail
being noise AND with it being signal too weak for this learner at this n. That
is the same detection limit the rest of the paper is about, and it is why the
result is reported next to f rather than on its own.

    .venv/bin/python scripts/cardinality_control.py --seeds 20 -v
"""

from __future__ import annotations

import argparse
import logging

import numpy as np
import pandas as pd

from src.pipeline import experiment as ex
from src.pipeline import paths
from src.pipeline.zonal import CORRIDOR_ID

log = logging.getLogger("cardinality_control")

PANEL = paths.PROCESSED / "features_phase3b.parquet"
CELL_M = 25_000.0
OUT = paths.PROCESSED / "cardinality_control.csv"


def cell_of(df: pd.DataFrame, cell_m: float) -> pd.Series:
    """The same cell key ``experiment.upscale`` builds, reproduced here."""
    return (np.floor(df["x_m"] / cell_m).astype(int).astype(str) + "_" +
            np.floor(df["y_m"] / cell_m).astype(int).astype(str))


def permute_within_cells(df: pd.DataFrame, features: list[str], *,
                         cell_m: float, seed: int) -> tuple[pd.DataFrame, int]:
    """Model A': relocate each site's predictors within its own coarse cell.

    Returns the permuted panel and the number of sites that actually moved.
    Singleton cells cannot be permuted and are left alone, which is a real
    dilution of the control and is reported rather than hidden.
    """
    rng = np.random.default_rng(seed)
    site_cell = (df.assign(_cell=cell_of(df, cell_m))
                 .groupby(CORRIDOR_ID)["_cell"].first())

    mapping: dict = {}
    for _, sites in site_cell.groupby(site_cell):
        ids = sites.index.to_numpy()
        mapping.update(dict(zip(ids, ids if len(ids) < 2 else rng.permutation(ids))))
    moved = sum(1 for k, v in mapping.items() if k != v)

    # Look the donor's values up by (donor site, same year), so the time series
    # travels with the site rather than being reshuffled across summers too.
    src = df.set_index([CORRIDOR_ID, "year"])[features]
    key = pd.MultiIndex.from_arrays(
        [df[CORRIDOR_ID].map(mapping).to_numpy(), df["year"].to_numpy()])
    out = df.copy()
    out[features] = src.reindex(key).to_numpy()
    return out, moved


def one_run(df: pd.DataFrame, features: list[str], seed: int, *,
            n_repeats: int, n_blocks: int) -> dict:
    a, _ = ex.blocked_cv(df, features, n_repeats=n_repeats, n_blocks=n_blocks,
                         seed=ex.SEED + seed)
    ap_df, moved = permute_within_cells(df, features, cell_m=CELL_M, seed=seed)
    ap, _ = ex.blocked_cv(ap_df, features, n_repeats=n_repeats, n_blocks=n_blocks,
                          seed=ex.SEED + seed)
    b, _ = ex.blocked_cv(ex.upscale(df, features, cell_m=CELL_M), features,
                         n_repeats=n_repeats, n_blocks=n_blocks, seed=ex.SEED + seed)

    d_aap = ex.paired_difference(a, ap, "rmse", seed=ex.SEED + seed)
    d_ab = ex.paired_difference(a, b, "rmse", seed=ex.SEED + seed)
    return {"seed": seed, "sites_moved": moved,
            "rmse_a": float(a["rmse"].mean()), "rmse_aprime": float(ap["rmse"].mean()),
            "rmse_b": float(b["rmse"].mean()),
            "r2_a": float(a["r2"].mean()), "r2_aprime": float(ap["r2"].mean()),
            "r2_b": float(b["r2"].mean()),
            "d_a_aprime": d_aap["mean_diff"], "ci_lo_a_aprime": d_aap["ci_lo"],
            "ci_hi_a_aprime": d_aap["ci_hi"],
            "d_a_b": d_ab["mean_diff"], "ci_lo_a_b": d_ab["ci_lo"],
            "ci_hi_a_b": d_ab["ci_hi"]}


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--seeds", type=int, default=20)
    p.add_argument("--repeats", type=int, default=5)
    p.add_argument("--blocks", type=int, default=5)
    p.add_argument("--out", default=str(OUT))
    p.add_argument("-v", "--verbose", action="store_true")
    a = p.parse_args()
    logging.basicConfig(level=logging.INFO if a.verbose else logging.WARNING,
                        format="%(asctime)s %(message)s")
    logging.getLogger("src.pipeline.experiment").setLevel(logging.WARNING)

    df = pd.read_parquet(PANEL).reset_index(drop=True)
    features = ex.predictor_columns(df)["climate_only"]

    # The control is only honest if B and f really are untouched by it. Checked
    # on one draw rather than asserted, because a permutation that leaked across
    # cells would still look plausible in the output.
    probe, moved = permute_within_cells(df, features, cell_m=CELL_M, seed=0)
    f_before = ex.upscaling_diagnostics(df, features, cell_m=CELL_M)["var_removed_frac"].mean()
    f_after = ex.upscaling_diagnostics(probe, features, cell_m=CELL_M)["var_removed_frac"].mean()
    b_before = ex.upscale(df, features, cell_m=CELL_M)[features].to_numpy()
    b_after = ex.upscale(probe, features, cell_m=CELL_M)[features].to_numpy()
    drift = float(np.nanmax(np.abs(b_before - b_after)))
    print(f"invariance check: {moved}/{df[CORRIDOR_ID].nunique()} sites moved, "
          f"max |Model B drift| = {drift:.3e}, f {f_before:.4f} -> {f_after:.4f}")
    if drift > 1e-9:
        raise SystemExit("permutation changed Model B; it is not within-cell")

    rows = []
    for s in range(a.seeds):
        rows.append(one_run(df, features, s, n_repeats=a.repeats, n_blocks=a.blocks))
        r = rows[-1]
        log.info("seed %2d  RMSE A %.5f  A' %.5f  B %.5f   A-A' %+.5f [%+.5f, %+.5f]",
                 s, r["rmse_a"], r["rmse_aprime"], r["rmse_b"],
                 r["d_a_aprime"], r["ci_lo_a_aprime"], r["ci_hi_a_aprime"])
    out = pd.DataFrame(rows)
    out.to_csv(a.out, index=False)

    excl = ((out.ci_lo_a_aprime > 0) | (out.ci_hi_a_aprime < 0)).mean()
    print(f"\n=== A vs A' over {len(out)} seeds ===")
    print(f"  mean RMSE   A {out.rmse_a.mean():.5f}   A' {out.rmse_aprime.mean():.5f}"
          f"   B {out.rmse_b.mean():.5f}")
    print(f"  mean paired A - A' = {out.d_a_aprime.mean():+.5f}")
    print(f"  intervals excluding zero: {excl:.0%} of seeds")
    print(f"\n  C1 (fine detail unusable, Referee 2 right): "
          f"{'INDICATED' if excl < 0.5 else 'not indicated'}")
    print(f"  C2 (fine detail is real signal): "
          f"{'INDICATED' if excl >= 0.5 and out.d_a_aprime.mean() < 0 else 'not indicated'}")


if __name__ == "__main__":
    main()
