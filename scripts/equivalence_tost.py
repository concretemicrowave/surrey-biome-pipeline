"""Two one-sided tests: can the transect null be called equivalence?

The paper distinguishes "no difference detected" from "a difference detected",
but not a conclusive null from an underpowered one, and Section 3.3 argues the
latter by simulation rather than on the data. A TOST makes the argument on the
data, by asking whether the paired difference sits inside a band small enough
not to matter.

THE SESOI IS DERIVED, NOT PICKED
--------------------------------
The band has to come from what a difference that size would do to the applied
product, otherwise it is a number chosen to produce the wanted verdict. Adding
Gaussian noise of scale delta to each corridor's CDEI and re-ranking gives, over
400 draws on the 144-corridor deliverable:

    delta       % of RMSE   Spearman   top-20 retained
    0.00100         4.0%      0.993          95%
    0.00257        10.4%      0.959          89%
    0.00500        20.2%      0.873          79%

Surrey's ranking is delivered as a triage order, so the quantity that matters is
whether the corridors it would act on stay the same. At 0.00100 one corridor in
twenty changes place and the order is otherwise intact; at 0.00257, which is the
existing 90% upper endpoint, two of the top twenty change; by 0.00500 a fifth of
the priority set turns over. SESOI = 0.00100, the largest band that leaves the
deliverable's actionable set effectively unchanged.

Choosing 0.00257 instead would make the SESOI equal to the endpoint being tested
against, which guarantees a boundary result and is exactly the circularity the
derivation exists to avoid.

Equivalence requires the 90% interval to lie inside [-SESOI, +SESOI], which is
the standard TOST-to-interval correspondence at alpha = 0.05.

    .venv/bin/python -m scripts.equivalence_tost
"""
from __future__ import annotations

import logging

import numpy as np
import pandas as pd

from src.pipeline import experiment as ex
from src.pipeline import paths

SESOI = 0.00100
PANEL = paths.PROCESSED / "features_phase3b.parquet"
CELL_M = 25_000.0


def interval(a: pd.DataFrame, b: pd.DataFrame, metric: str, *, alpha: float,
             n_boot: int = 10_000, seed: int = ex.SEED) -> tuple[float, float]:
    """``paired_difference``'s interval at an arbitrary alpha.

    Reproduces its resampling exactly -- blocks within a repeat, endpoints
    averaged across repeats -- and only moves the percentiles, so a TOST cannot
    silently use a different estimator from the one the paper reports.
    """
    key = ["repeat", "block"]
    m = a[key + [metric]].merge(b[key + [metric]], on=key, suffixes=("_a", "_b"))
    m = m.assign(d=m[f"{metric}_a"] - m[f"{metric}_b"])
    rng = np.random.default_rng(seed)
    lo_p, hi_p = 100 * alpha / 2, 100 * (1 - alpha / 2)
    bounds = []
    for _, grp in m.groupby("repeat", sort=True):
        dr = grp["d"].to_numpy()
        boot = rng.choice(dr, size=(n_boot, len(dr)), replace=True).mean(axis=1)
        bounds.append((np.percentile(boot, lo_p), np.percentile(boot, hi_p)))
    return float(np.mean([x for x, _ in bounds])), float(np.mean([y for _, y in bounds]))


def main() -> None:
    logging.getLogger("src.pipeline.experiment").setLevel(logging.WARNING)
    df = pd.read_parquet(PANEL).reset_index(drop=True)
    feats = ex.predictor_columns(df)["climate_only"]
    a, _ = ex.blocked_cv(df, feats)
    b, _ = ex.blocked_cv(ex.upscale(df, feats, cell_m=CELL_M), feats)
    d = ex.paired_difference(a, b, "rmse")
    lo90, hi90 = interval(a, b, "rmse", alpha=0.10)

    print(f"paired dRMSE (A - B)   {d['mean_diff']:+.5f}")
    print(f"  95% CI               [{d['ci_lo']:+.5f}, {d['ci_hi']:+.5f}]")
    print(f"  90% CI               [{lo90:+.5f}, {hi90:+.5f}]")
    print(f"  SESOI                +/-{SESOI:.5f}  "
          f"({SESOI / float(b['rmse'].mean()):.1%} of Model B RMSE)")
    inside = -SESOI <= lo90 and hi90 <= SESOI
    excl = d["ci_lo"] > 0 or d["ci_hi"] < 0
    print(f"\n  equivalent (90% CI inside the band)   : {'YES' if inside else 'NO'}")
    print(f"  different (95% CI excludes zero)      : {'YES' if excl else 'NO'}")
    if not inside and not excl:
        print("\n  Neither. The data rule out neither a difference worth acting on\n"
              "  nor the absence of one, which is what an underpowered comparison\n"
              "  looks like when it is asked directly rather than by simulation.")


if __name__ == "__main__":
    main()
