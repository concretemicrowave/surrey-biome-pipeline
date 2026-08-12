"""Does refitting the dry edge per summer repair the temporal validation, or void it?

The control arm for Limitations item 5 / KNOWN_ISSUES V1. `drift_diagnostic.py`
established that CDEI's failure to track moisture deficit over nine summers is
caused by the **frozen** dry edge: the line is fitted once across the whole panel,
so the panel's own canopy growth slides every point relative to it, and a
non-significant +0.014 NDVI difference becomes a 0.51 sd shift in `dry_dist`.

V1 records the obvious next move -- "refit the dry edge per period ... needs no
new data" -- as untested. This tests it, and the expected outcome is that it
FAILS, for a reason worth having on the record.

WHY IT IS EXPECTED TO FAIL. `assemble.dry_edge` fits SWCI = a + b*NDVI to the
5th percentile of SWCI in each of twelve NDVI bins -- the lower envelope of
whatever rows it is handed. Hand it one summer at a time and the line is that
summer's own envelope, so roughly 5% of polygons sit at `dry_dist` ~ 0 in every
summer, dry or wet. A network-wide dry year moves the points down and the line
down with them. The between-year level of the index is pinned flat *by
construction*, and the between-year level is exactly what the temporal
validation measures.

So the two arms bracket the problem rather than one fixing it:

  frozen  -- line fixed, panel moves  -> canopy artifact PLUS climate signal,
             confounded. The published behaviour.
  refit   -- line moves with panel    -> artifact removed, and the signal with
             it.

That prediction is testable three ways, and the script reports all three:
whether the refit collapses between-year variance (§2, §3), whether it removes
the block artifact it was meant to remove (§4), and what it does to the temporal
correlations (§5).

§6 is the reason this matters beyond a null. If the refit destroys the temporal
signal but leaves the *within-summer* corridor ranking intact, then the two arms
are not better-and-worse versions of one index -- they are a temporal instrument
that does not work and a spatial instrument that does. That is a conclusion about
what CDEI is, not a failed repair.

RLST is deliberately held frozen in both arms. `drift_diagnostic.py` already
refitted it over all nine summers and the correlation stayed null (-0.069), so
the only quantity that differs between the arms here is the dry edge itself.

WHAT THIS FOUND (2026-08-03). The prediction above is half right, and the half
that is wrong matters more than the half that is right.

  Right -- the pinning is real and large. Between-summer spread of CDEI falls to
  23.6% of frozen, and the share of total variance lying between summers falls
  from 16.49% to 0.96%. The refit also does the job it was proposed for: the
  0.52 sd block artifact drops to 0.07 sd and stops being significant
  (p = 1e-18 -> p = 0.22).

  Wrong -- the temporal correlation does not collapse with the variance. It
  GROWS: network-wide against CMD it goes +0.070 -> +0.622, and within-polygon
  +0.049 -> +0.141 (p = 1.6e-07). On magnitude alone that reads as a repair.

  It is the opposite, because THE SIGN IS INVERTED. CDEI is positive on the wet
  side, so drier summers must read LOWER. They read higher. The refit even
  inverts the published four-summer block, where the frozen arm gives the
  correct -0.677: refit gives +0.331.

The mechanism is §7. With the between-summer level pinned to ~1% of variance,
what little survives is dominated by 2018 and 2021 -- the two climatically dry
summers that read as unstressed, already flagged as unexplained in
`drift_diagnostic.py`. Refitting does not explain them; it removes the competing
variation and lets them set the trend. Under refit they rank 9th and 8th
wettest-reading of nine summers, against 4th and 2nd driest by CMD.

Two consequences for V1, and they point in opposite directions:

  1. The dry-edge geometry is NOT the whole story. The 2018/2021 anomaly
     survives its removal and strengthens, so it needs an explanation of its own
     -- it is not a corollary of the frozen edge.
  2. What CDEI is, is a spatial instrument. §6 shows the within-summer corridor
     ranking is preserved at rho >= 0.855 (>= 0.97 in seven of nine summers)
     across a change that destroys the temporal behaviour entirely. The ranking
     Surrey is being handed does not depend on the choice the temporal claim
     founders on.

Build the panel first, then run:

    .venv/bin/python -m src.pipeline.assemble \\
        --years 2017 2018 2019 2020 2021 2022 2023 2024 2025 \\
        --freeze-from data/processed/features.parquet \\
        --out data/processed/features_extended.parquet
    .venv/bin/python scripts/refit_control_arm.py
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

from src.pipeline import paths
from src.pipeline.assemble import dry_edge

EXTENDED = paths.PROCESSED / "features_extended.parquet"
CANONICAL = paths.FEATURES
SPLIT_YEAR = 2022          # first summer of the published block
UNIT = "objectid"          # polygon: the modelling unit, per CLAUDE.md
OUT_CSV = paths.PROCESSED / "refit_control_arm.csv"


def ols(df: pd.DataFrame, y: str, xs: list[str]) -> dict:
    """Least squares with t-tests. Written out rather than pulled from
    statsmodels, which is not a dependency of this project."""
    X = np.column_stack([np.ones(len(df))] + [df[c].astype(float).to_numpy() for c in xs])
    yv = df[y].astype(float).to_numpy()
    beta, *_ = np.linalg.lstsq(X, yv, rcond=None)
    resid = yv - X @ beta
    dof = len(df) - X.shape[1]
    se = np.sqrt(np.diag((resid @ resid / dof) * np.linalg.inv(X.T @ X)))
    return {"beta": beta, "p": 2 * stats.t.sf(np.abs(beta / se), dof)}


def demeaned_corr(df: pd.DataFrame, a: str, b: str, by: str = UNIT):
    """Within-unit correlation: remove each polygon's own mean from both series
    first, so this asks whether a polygon reads drier in the summers when that
    polygon is drier -- not whether dry polygons differ from wet ones."""
    x = df.copy()
    x["_a"] = x[a] - x.groupby(by)[a].transform("mean")
    x["_b"] = x[b] - x.groupby(by)[b].transform("mean")
    return stats.pearsonr(x["_a"], x["_b"])


def between_year_share(df: pd.DataFrame, col: str) -> float:
    """Fraction of the index's total variance that lies between summers rather
    than between polygons. The temporal validation can only read the between
    part, so this is the ceiling on how much signal is available to it."""
    grand = df[col].mean()
    ybar = df.groupby("year")[col].transform("mean")
    between = float(((ybar - grand) ** 2).sum())
    total = float(((df[col] - grand) ** 2).sum())
    return between / total


def add_refit_arm(ext: pd.DataFrame) -> pd.DataFrame:
    """Recompute dry_dist and CDEI with a per-summer dry edge.

    Mirrors ``assemble.compute_tvwsi`` exactly -- same perpendicular distance,
    same sign convention, same division by RLST -- with the single change that
    the edge is fitted within each summer instead of across the panel.
    """
    out = ext.copy()
    fits = {}
    for yr, g in out.groupby("year"):
        fits[yr] = dry_edge(g["ndvi_mean"].to_numpy(), g["swci_mean"].to_numpy())

    out["edge_a_refit"] = out["year"].map({y: f[0] for y, f in fits.items()})
    out["edge_b_refit"] = out["year"].map({y: f[1] for y, f in fits.items()})
    b = out["edge_b_refit"]
    out["dry_dist_refit"] = (
        (out["swci_mean"] - (out["edge_a_refit"] + b * out["ndvi_mean"]))
        / np.sqrt(1 + b ** 2)
    )
    # RLST is carried over unchanged, so the edge is the only difference.
    out["tvwsi_refit"] = out["dry_dist_refit"] / out["rlst"]
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--features", type=Path, default=EXTENDED)
    ap.add_argument("--canonical", type=Path, default=CANONICAL)
    ap.add_argument("--out", type=Path, default=OUT_CSV)
    a = ap.parse_args()

    if not a.features.exists():
        raise SystemExit(f"{a.features} not found -- build it with assemble --freeze-from "
                         "(see this script's docstring)")

    # dry_edge logs each fit at INFO; the fitted lines are printed in §1 instead.
    logging.getLogger("src.pipeline.assemble").setLevel(logging.WARNING)

    ext = pd.read_parquet(a.features)
    years = sorted(ext["year"].unique())
    print(f"panel: {len(ext)} rows, {ext[UNIT].nunique()} polygons, "
          f"{len(years)} summers {years[0]}-{years[-1]}")

    if a.canonical.exists():
        old = pd.read_parquet(a.canonical)
        m = old.merge(ext, on=[UNIT, "year"], suffixes=("_o", "_n"))
        worst = max(float(np.nanmax(np.abs(m[f"{c}_o"] - m[f"{c}_n"])))
                    for c in ["tvwsi", "dry_dist", "rlst", "ndvi_mean", "swci_mean"])
        print(f"[freeze check] published summers reproduce to {worst:.3e} "
              f"-- {'BIT-EXACT' if worst == 0 else 'DRIFTED, STOP'}")

    ext = add_refit_arm(ext)
    ext["block"] = (ext["year"] >= SPLIT_YEAR).astype(int)

    # -- 1. the fitted lines --------------------------------------------------
    print("\n1. The dry edges. One line held fixed, against nine fitted per summer.")
    fa, fb = float(ext["dry_edge_a"].iloc[0]), float(ext["dry_edge_b"].iloc[0])
    print(f"   frozen        SWCI = {fa:+.4f} {fb:+.4f} * NDVI")
    per = ext.groupby("year")[["edge_a_refit", "edge_b_refit"]].first()
    for yr, row in per.iterrows():
        print(f"   {yr}          SWCI = {row.edge_a_refit:+.4f} "
              f"{row.edge_b_refit:+.4f} * NDVI")
    print(f"   slope spread across summers: {per.edge_b_refit.std():.4f} "
          f"(frozen slope {fb:+.4f})")

    # -- 2. is the between-summer level pinned? -------------------------------
    print("\n2. Between-summer spread of the index mean (the pinning prediction)")
    print("   If the refit pins the level, its year-to-year spread collapses.")
    rows = []
    for col_f, col_r, lab in [("dry_dist", "dry_dist_refit", "dry_dist"),
                              ("tvwsi", "tvwsi_refit", "CDEI")]:
        sf = ext.groupby("year")[col_f].mean().std()
        sr = ext.groupby("year")[col_r].mean().std()
        print(f"   {lab:9s} frozen sd {sf:.5f}   refit sd {sr:.5f}   "
              f"ratio {sr / sf:.3f}")
        rows.append({"quantity": lab, "frozen_between_year_sd": sf,
                     "refit_between_year_sd": sr, "ratio": sr / sf})

    # -- 3. variance decomposition -------------------------------------------
    print("\n3. Share of total variance lying between summers")
    print("   (the ceiling on what any temporal test can read)")
    for col_f, col_r, lab in [("dry_dist", "dry_dist_refit", "dry_dist"),
                              ("tvwsi", "tvwsi_refit", "CDEI")]:
        bf = between_year_share(ext, col_f)
        br = between_year_share(ext, col_r)
        print(f"   {lab:9s} frozen {bf:6.2%}   refit {br:6.2%}")

    # -- 4. does the refit remove the artifact it was meant to remove? --------
    print("\n4. Block effect (2022-2025 vs 2017-2021), controlling for moisture deficit")
    print("   This is the 0.51 sd artifact. The refit SHOULD remove it -- that is")
    print("   the half of the job it can do.")
    for col, lab in [("dry_dist", "dry_dist frozen"), ("dry_dist_refit", "dry_dist refit"),
                     ("tvwsi", "CDEI frozen"), ("tvwsi_refit", "CDEI refit")]:
        r = ols(ext, col, ["CMD_sm", "block"])
        b, p = r["beta"][2], r["p"][2]
        print(f"   {lab:16s} {b:+.5f} ({b / ext[col].std():+.2f} sd)  p = {p:.2e}")

    # -- 5. the temporal validation, both arms --------------------------------
    print("\n5. Temporal validation. Network-wide over summer means, and within-polygon.")
    print("   CDEI is signed positive on the WET side, so the expected signs are")
    print("   NEGATIVE against moisture deficit (CMD) and POSITIVE against rainfall (PPT).")
    for clim in ["CMD_sm", "PPT_sm"]:
        print(f"   -- vs {clim} --")
        for col, lab in [("tvwsi", "frozen"), ("tvwsi_refit", "refit")]:
            g = ext.groupby("year").agg(t=(col, "mean"), c=(clim, "mean"))
            rn, pn = stats.pearsonr(g.c, g.t)
            rw, pw = demeaned_corr(ext, clim, col)
            print(f"      {lab:6s} network n={len(g)}  r = {rn:+.3f} (p = {pn:.3f})   "
                  f"within-polygon n={len(ext)}  r = {rw:+.3f} (p = {pw:.2e})")
        rows.append({"quantity": f"network_r_vs_{clim}",
                     "frozen_between_year_sd": np.nan,
                     "refit_between_year_sd": np.nan, "ratio": np.nan})

    # published four summers, for continuity with the n=4 headline
    hi = ext[ext.block == 1]
    print("   -- the published n=4 block, for reference --")
    for col, lab in [("tvwsi", "frozen"), ("tvwsi_refit", "refit")]:
        g = hi.groupby("year").agg(t=(col, "mean"), c=("CMD_sm", "mean"))
        r, p = stats.pearsonr(g.c, g.t)
        print(f"      {lab:6s} n=4 vs CMD_sm  r = {r:+.3f} (p = {p:.3f})")

    # -- 6. what the refit costs spatially ------------------------------------
    print("\n6. Within-summer corridor ranking: frozen vs refit (Spearman)")
    print("   If these are ~1.0, the refit costs nothing spatially -- the two arms")
    print("   differ only in what they say across summers.")
    sp = []
    for yr, g in ext.groupby("year"):
        rho, _ = stats.spearmanr(g["tvwsi"], g["tvwsi_refit"])
        sp.append(rho)
        print(f"   {yr}   rho = {rho:+.5f}")
    print(f"   min across summers {min(sp):+.5f}")

    # -- 7. the two unexplained summers ---------------------------------------
    print("\n7. Per-summer means. 2018 and 2021 are the open violators: climatically")
    print("   dry, yet reading unstressed. If the refit explains them, that is the")
    print("   thread to pull; if not, the anomaly is not a dry-edge effect.")
    g = ext.groupby("year").agg(
        CMD_sm=("CMD_sm", "mean"), PPT_sm=("PPT_sm", "mean"),
        ndvi=("ndvi_mean", "mean"), swci=("swci_mean", "mean"),
        CDEI_frozen=("tvwsi", "mean"), CDEI_refit=("tvwsi_refit", "mean"))
    # rank 1 = driest-reading summer under each arm
    g["rank_CMD"] = g.CMD_sm.rank(ascending=False).astype(int)
    g["rank_frozen"] = g.CDEI_frozen.rank().astype(int)
    g["rank_refit"] = g.CDEI_refit.rank().astype(int)
    print(g.round(4).to_string())
    print("   (rank 1 = driest summer by CMD, and lowest-CDEI = most stressed by each arm;")
    print("    agreement between rank_CMD and rank_frozen/rank_refit is the claim at issue)")

    # -- verdict --------------------------------------------------------------
    # Two independent conditions, because they came apart in the actual run: the
    # variance CAN collapse while the correlation GROWS, and a magnitude-only
    # verdict would have called that a repair.
    ratio = (ext.groupby("year")["tvwsi_refit"].mean().std()
             / ext.groupby("year")["tvwsi"].mean().std())
    gr = ext.groupby("year").agg(t=("tvwsi_refit", "mean"), c=("CMD_sm", "mean"))
    r_refit, p_refit = stats.pearsonr(gr.c, gr.t)
    pinned = ratio < 0.5
    correct_sign = r_refit < 0          # CDEI is positive on the wet side

    print("\n" + "=" * 72)
    print(f"CDEI between-summer spread under refit is {ratio:.1%} of frozen "
          f"({between_year_share(ext, 'tvwsi_refit'):.2%} of total variance,\n"
          f"from {between_year_share(ext, 'tvwsi'):.2%}); within-summer ranking is "
          f"preserved at rho >= {min(sp):.4f}.")
    print(f"Network correlation vs CMD_sm under refit: r = {r_refit:+.3f} "
          f"(p = {p_refit:.3f}), sign is\n{'CORRECT' if correct_sign else 'INVERTED'} "
          f"-- drier summers should read as MORE stressed, i.e. lower CDEI.")

    if pinned and not correct_sign:
        print("\nThe refit is NOT a repair, and it fails worse than a null. The pinning\n"
              "prediction holds -- between-summer variance collapses to ~1% of total -- but\n"
              "the correlation does not collapse with it. It GROWS, with the sign inverted,\n"
              "because what little between-summer level survives is dominated by the 2018 and\n"
              "2021 anomaly (§7), which the refit amplifies instead of explaining. Read on a\n"
              "magnitude basis alone this looks like a repair (r: +0.07 -> +0.62); it is the\n"
              "opposite. V1 cannot be closed this way. The remaining candidate is the second\n"
              "clause -- a reference that does not move with canopy growth -- and §7 says the\n"
              "2018/2021 anomaly is NOT a dry-edge effect, so it needs its own explanation.")
    elif pinned:
        print("\nThe refit removes the canopy artifact by removing the between-summer level\n"
              "the temporal test reads, as predicted from the envelope geometry. V1 cannot\n"
              "be closed this way -- the remaining candidate is the second clause, a\n"
              "reference that does not move with canopy growth.")
    else:
        print("\nThe between-summer level SURVIVED the refit -- the prediction in this\n"
              "script's docstring is wrong. If §5's correlations recover WITH THE CORRECT\n"
              "SIGN, the refit is a live repair for V1 and the paper has to be revisited.")
    print("=" * 72)

    pd.DataFrame(rows).to_csv(a.out, index=False)
    print(f"\nwrote {a.out}")


if __name__ == "__main__":
    main()
