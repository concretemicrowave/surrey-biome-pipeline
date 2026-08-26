"""Do V1's block effects survive being tested at the level they vary?

WHY. `thermal_block_retest.py` found that the +2.24 degC LST block shift was not
a property of the record: 1.78 degC of it came from an exclusion rule imported
from an NDVI diagnosis, and its p = 3e-106 came from treating 153 polygons as
replicates of a contrast between *summers*. Every polygon in a summer shares that
summer's weather and that summer's scene stack, so the effective n is the number
of summers, not the number of polygon-summers.

That test structure is not confined to the thermal strand. The same paired-on-
polygons design produces every block figure in V1, including the two the
manuscript now carries in Limitations item 5:

    NDVI, 2018/2021 excluded    +0.0002    p = 0.90     (used to rule OUT a step)
    SWCI, 2018/2021 excluded    -0.00276   p = 3.4e-04  (used to rule one IN)

The first is safe whichever way it is tested -- a null stays null, and if
anything a correct SE makes it more null. The second is load-bearing: it is the
whole of the residual block effect in `dry_dist` once 2018 and 2021 are set
aside, and it is asserted in the paper. If its p-value is pseudoreplication too,
the manuscript needs another pass.

WHAT THIS DOES. For NDVI, SWCI, `dry_dist` and LST, under both exclusion
regimes, it reports the same contrast three ways -- paired on polygons (as
published), on summer means, and with the standard error clustered on summer --
and then scans a step indicator across every possible cut year. A published
figure is confirmed only if it survives all three.

Reproduction is checked first: if the polygon-level numbers do not match what
V1 reports, this script is measuring something else and says so.

NOTHING IS OVERWRITTEN. Reads the published extended panel; writes one CSV.

    .venv/bin/python scripts/block_inference_retest.py -v
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

from src.pipeline import paths

log = logging.getLogger(__name__)

EXTENDED = paths.PROCESSED / "features_extended.parquet"
OUT_CSV = paths.PROCESSED / "block_inference_retest.csv"
EARLY = [2017, 2018, 2019, 2020, 2021]
LATE = [2022, 2023, 2024, 2025]
DROPPED = (2018, 2021)
UNIT = "objectid"

COLS = [("ndvi_mean", "NDVI"), ("swci_mean", "SWCI"),
        ("dry_dist", "dry_dist"), ("lst_mean", "LST")]

# What V1 reports, for the 2018/2021-excluded regime, paired on polygons. If the
# reproduction column does not land on these, the rest of the output is moot.
PUBLISHED = {"ndvi_mean": (+0.0002, 0.90), "swci_mean": (-0.00276, 3.4e-04)}


def paired_on_polygons(d: pd.DataFrame, col: str, early: list[int]) -> tuple:
    a = d[d.year.isin(early)].groupby(UNIT)[col].mean()
    b = d[d.year.isin(LATE)].groupby(UNIT)[col].mean()
    j = pd.concat([a.rename("e"), b.rename("l")], axis=1).dropna()
    t = stats.ttest_rel(j.l, j.e)
    return float((j.l - j.e).mean()), float(t.pvalue), len(j)


def on_summer_means(d: pd.DataFrame, col: str, early: list[int]) -> tuple:
    g = d.groupby("year")[col].mean()
    e, l = g.loc[early].values, g.loc[LATE].values
    t = stats.ttest_ind(l, e, equal_var=False)
    return float(l.mean() - e.mean()), float(t.pvalue), len(e), len(l)


def clustered_on_summer(d: pd.DataFrame, col: str, early: list[int]) -> tuple:
    """Difference of summer means with the SE built from between-summer spread."""
    g = d.groupby("year")[col].mean()
    e, l = g.loc[early].values, g.loc[LATE].values
    se = np.sqrt(e.var(ddof=1) / len(e) + l.var(ddof=1) / len(l))
    diff = l.mean() - e.mean()
    return diff, se, diff - 1.96 * se, diff + 1.96 * se


def step_scan(d: pd.DataFrame, col: str) -> list[tuple[int, float, float]]:
    """Step indicator at every cut year, CMD controlled, on summer means."""
    g = d.groupby("year").agg(y=(col, "mean"), cmd=("CMD_sm", "mean")).reset_index()
    out = []
    for cut in range(2018, 2026):
        post = (g.year >= cut).astype(float).values
        X = np.column_stack([np.ones(len(g)), post, g.cmd.values])
        beta, *_ = np.linalg.lstsq(X, g.y.values, rcond=None)
        resid = g.y.values - X @ beta
        dof = len(g) - X.shape[1]
        se = np.sqrt((resid @ resid / dof) * np.linalg.inv(X.T @ X)[1, 1])
        p = 2 * (1 - stats.t.cdf(abs(beta[1] / se), dof))
        out.append((cut, float(beta[1]), float(p)))
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--panel", type=Path, default=EXTENDED)
    ap.add_argument("--out", type=Path, default=OUT_CSV)
    ap.add_argument("-v", "--verbose", action="store_true")
    a = ap.parse_args()
    logging.basicConfig(level=logging.INFO if a.verbose else logging.WARNING,
                        format="%(levelname)s %(message)s")

    d = pd.read_parquet(a.panel)
    early_sub = [y for y in EARLY if y not in DROPPED]

    print("=" * 78)
    print("REPRODUCTION CHECK (2018/2021 excluded, paired on polygons)")
    ok = True
    for col, (want_d, want_p) in PUBLISHED.items():
        got_d, got_p, n = paired_on_polygons(d, col, early_sub)
        near = abs(got_d - want_d) < max(2e-4, abs(want_d) * 0.1)
        ok &= near
        print(f"  {col:11s} published {want_d:+.5f} (p={want_p:.1e})   "
              f"got {got_d:+.5f} (p={got_p:.1e}, n={n})   "
              f"{'MATCH' if near else 'MISMATCH'}")
    if not ok:
        print("\n  !! reproduction failed -- the rest of this output describes a "
              "different quantity")

    rows = []
    for regime, early in [("all five early", EARLY),
                          ("2018/2021 excluded", early_sub)]:
        print("\n" + "=" * 78)
        print(f"REGIME: {regime}   (early = {early}, late = {LATE})")
        print(f"\n  {'':10s} {'paired on polygons':>26s} {'on summer means':>24s}"
              f" {'clustered on summer':>30s}")
        for col, label in COLS:
            pd_, pp, pn = paired_on_polygons(d, col, early)
            sd_, sp, ne, nl = on_summer_means(d, col, early)
            cd, cse, lo, hi = clustered_on_summer(d, col, early)
            excl = "excludes 0" if (lo > 0) == (hi > 0) else "spans 0"
            print(f"  {label:10s} {pd_:>+12.5f} p={pp:>8.1e}  "
                  f"{sd_:>+11.5f} p={sp:>6.3f}  "
                  f"{cd:>+11.5f} [{lo:+.5f}, {hi:+.5f}] {excl}")
            rows.append({"regime": regime, "variable": label,
                         "paired_diff": pd_, "paired_p": pp, "paired_n": pn,
                         "summer_diff": sd_, "summer_p": sp,
                         "clustered_diff": cd, "ci_lo": lo, "ci_hi": hi,
                         "ci_excludes_zero": excl == "excludes 0"})

    print("\n" + "=" * 78)
    print("STEP SCAN: is 2022 the cut the data picks? (CMD controlled, n = 9)")
    for col, label in COLS:
        sc = step_scan(d, col)
        best = max(sc, key=lambda r: abs(r[1]) / (abs(r[1]) + 1e-12) * (1 - r[2]))
        at22 = next(r for r in sc if r[0] == 2022)
        sig = [r for r in sc if r[2] < 0.05]
        print(f"\n  {label}")
        print(f"    at 2022      : {at22[1]:+.5f}  p = {at22[2]:.3f}")
        print(f"    lowest p at  : {min(sc, key=lambda r: r[2])[0]}  "
              f"(p = {min(r[2] for r in sc):.3f})")
        print(f"    cuts with p < 0.05: {[r[0] for r in sig] or 'none'}")

    pd.DataFrame(rows).to_csv(a.out, index=False)
    log.info("wrote %s", a.out)


if __name__ == "__main__":
    main()
