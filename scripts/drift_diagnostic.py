"""Reproduce every number in Limitations item 5 (CDEI drifts with panel greenness).

The manuscript reports a diagnostic run on the nine-summer Surrey panel: the
index shifts by half a standard deviation between the 2017-2021 and 2022-2025
halves of the record, even though neither input band shifts significantly. That
claim needs to be checkable, so this script recomputes all of it from the panel.

Build the panel first (frozen, so the published four summers do not move):

    .venv/bin/python -m src.pipeline.assemble \\
        --years 2017 2018 2019 2020 2021 2022 2023 2024 2025 \\
        --freeze-from data/processed/features.parquet \\
        --out data/processed/features_extended.parquet

Then:

    .venv/bin/python scripts/drift_diagnostic.py

WHAT THIS FOUND, and what it ruled out. Four mechanisms were tested before the
dry-edge geometry was accepted as the explanation:

  1. Frozen RLST baseline  -> refitting RLST over all nine summers leaves the
     correlation null (-0.069). Not the cause.
  2. The thermal term at all -> `dry_dist` alone, which has no thermal input,
     collapses identically. Not the cause.
  3. A code-version difference in the imagery -> 2022/2023 rasters rebuilt with
     the current acquire_raster.py are BIT-IDENTICAL to the published ones
     (r = 1.00000), despite the two build logs using different BOA wording.
     Not the cause. This one had been asserted as fact before it was tested.
  4. Gross input drift -> NDVI and SWCI show no significant block difference.
     Not the cause.

What remains, and is reported in the paper: the dry edge is fitted once and held
fixed, so a small shift in the panel's greenness moves every point relative to
that line. The geometry converts a non-significant NDVI difference into a highly
significant index difference.

STILL UNEXPLAINED, and flagged as open in the paper: within 2017-2021 the
correlation with moisture deficit is *absent* (r = -0.04), not merely displaced.
2018 and 2021 are the violators -- both climatically dry summers that read as
unstressed.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

from src.pipeline import paths

EXTENDED = paths.PROCESSED / "features_extended.parquet"
CANONICAL = paths.FEATURES
SPLIT_YEAR = 2022          # first summer of the published block


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


def demeaned_corr(df: pd.DataFrame, a: str, b: str, by: str = "objectid"):
    """Within-unit correlation: remove each polygon's own mean from both series
    first, so this asks whether a polygon reads drier in the summers when that
    polygon is drier -- not whether dry polygons differ from wet ones."""
    x = df.copy()
    x["_a"] = x[a] - x.groupby(by)[a].transform("mean")
    x["_b"] = x[b] - x.groupby(by)[b].transform("mean")
    return stats.pearsonr(x["_a"], x["_b"])


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--features", type=Path, default=EXTENDED)
    ap.add_argument("--canonical", type=Path, default=CANONICAL)
    a = ap.parse_args()

    if not a.features.exists():
        raise SystemExit(f"{a.features} not found -- build it with assemble --freeze-from "
                         "(see this script's docstring)")

    ext = pd.read_parquet(a.features)
    ext["block"] = (ext["year"] >= SPLIT_YEAR).astype(int)
    years = sorted(ext["year"].unique())
    print(f"panel: {len(ext)} rows, {ext.objectid.nunique()} polygons, "
          f"{len(years)} summers {years[0]}-{years[-1]}\n")

    # -- the freeze must hold, or nothing below is comparable to the paper ----
    if a.canonical.exists():
        old = pd.read_parquet(a.canonical)
        m = old.merge(ext, on=["objectid", "year"], suffixes=("_o", "_n"))
        worst = max(float(np.nanmax(np.abs(m[f"{c}_o"] - m[f"{c}_n"])))
                    for c in ["tvwsi", "dry_dist", "rlst", "ndvi_mean", "swci_mean", "lst_mean"])
        print(f"[freeze check] published summers reproduce to {worst:.3e} "
              f"-- {'BIT-EXACT' if worst == 0 else 'DRIFTED, STOP'}\n")

    # -- 1. block effect after controlling for climate ------------------------
    print("1. Block effect on each quantity, controlling for summer moisture deficit")
    print("   (the inputs should not shift; the index does -- that is the finding)")
    for tgt in ["ndvi_mean", "swci_mean", "dry_dist", "tvwsi"]:
        r = ols(ext, tgt, ["CMD_sm", "block"])
        b, p = r["beta"][2], r["p"][2]
        print(f"   {tgt:10s} {b:+.5f} ({b / ext[tgt].std():+.2f} sd)  p = {p:.2e}")

    # -- 2. does the dry-edge geometry account for the shift? -----------------
    print("\n2. Geometry check: does the fixed dry edge explain the index shift?")
    slope = float(ext["dry_edge_b"].iloc[0])
    lo = ext[ext.block == 0]
    hi = ext[ext.block == 1]
    d_ndvi = hi.ndvi_mean.mean() - lo.ndvi_mean.mean()
    d_swci = hi.swci_mean.mean() - lo.swci_mean.mean()
    # A point that is greener at fixed SWCI sits nearer a rising dry edge. The
    # 1/sqrt(1+b^2) factor converts vertical displacement to perpendicular.
    predicted = (d_swci - slope * d_ndvi) / np.sqrt(1 + slope ** 2)
    observed = hi.dry_dist.mean() - lo.dry_dist.mean()
    print(f"   dry edge slope b = {slope:.3f}")
    print(f"   block difference: NDVI {d_ndvi:+.4f}, SWCI {d_swci:+.4f}")
    print(f"   predicted dry_dist shift {predicted:+.4f}  vs observed {observed:+.4f}")

    # -- 3. is it a level shift, or an absent relationship? -------------------
    print("\n3. Within-polygon correlation with moisture deficit, by block")
    print("   (a level shift would displace this; an absent relationship is worse)")
    for lab, d in [("2017-2021", lo), ("2022-2025", hi), ("all summers", ext)]:
        r, p = demeaned_corr(d, "CMD_sm", "tvwsi")
        print(f"   {lab:12s} r = {r:+.3f}  p = {p:.2e}  n = {len(d)}")

    # -- 4. network-wide, the headline figure -------------------------------
    print("\n4. Network-wide correlation of summer means (the n=4 headline vs n=9)")
    for lab, d in [("published n=4", hi), ("extended n=9", ext)]:
        g = d.groupby("year").agg(t=("tvwsi", "mean"), c=("CMD_sm", "mean"))
        r, p = stats.pearsonr(g.c, g.t)
        print(f"   {lab:14s} r = {r:+.3f}  p = {p:.3f}  n = {len(g)}")

    print("\n5. Per-summer means (2018 and 2021 are the unexplained violators)")
    g = ext.groupby("year").agg(tvwsi=("tvwsi", "mean"), dry_dist=("dry_dist", "mean"),
                                ndvi=("ndvi_mean", "mean"), swci=("swci_mean", "mean"),
                                CMD_sm=("CMD_sm", "mean"))
    print(g.round(4).to_string())


if __name__ == "__main__":
    main()
