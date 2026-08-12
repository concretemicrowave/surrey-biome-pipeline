"""Is there a 2022 LST block shift at all, once the exclusion rule is dropped?

CONTEXT. `l8_only_retest.py` ruled Landsat 9 out of the +2.24 degC block shift in
Surrey corridor LST, leaving ~+1.25 degC explained by neither platform nor scene
count, and two live candidates: real surface warming ClimateBC cannot see, or
something in the compositing.

THE PRIOR QUESTION THIS ASKS. Both of those explain a +2.24 degC shift. But that
figure is measured against an early block with **2018 and 2021 removed**, and
that exclusion was justified on NDVI grounds -- the slope mismatch of
`slope_mismatch.py` explains those two summers' CDEI behaviour. It was never
justified thermally. 2018 and 2021 are the two hottest summers in the record and
they sit on the early side, so removing them lowers the baseline the late block
is compared against. Before attributing a shift to a sensor or to the surface,
establish that the shift is a property of the record rather than of the cut.

Worse than incidental: 2018's qualification for exclusion is its NDVI departure
(z = -2.06, the largest in the record), and 2018 is also the hottest summer in
the record. A hot summer depresses canopy greenness, so the NDVI anomaly is
plausibly the *response* to the thermal anomaly. Excluding a summer for its
greenness and then comparing temperature across the resulting blocks conditions
the comparison on the outcome.

WHAT IT COMPUTES, all within-polygon (each polygon its own control) over the
nine-summer extended panel, n = 153 polygons x 9 summers:

  1. The block difference under both exclusion regimes, paired by polygon.
  2. What the climate record predicts for each, using the within-polygon
     LST-on-CMD slope fitted on the same panel -- so the "wrong sign" claim is
     evaluated against the same baseline as the observation.
  3. Whether a step at 2022 is the right model at all, against the alternative
     that summers vary and the cut point decides the answer: a step indicator
     and a linear year term are fitted on summer means with CMD controlled, and
     the step is re-estimated at every possible cut year for comparison.
  4. Whether the sign of the residual depends on the exclusion -- the quantity
     the remaining candidates have to explain.

NOTHING IS OVERWRITTEN. Reads the published panel and canonical rasters only;
writes one CSV of per-summer aggregates to a diagnostics path of its own.

    .venv/bin/python scripts/thermal_block_retest.py -v
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
OUT_CSV = paths.PROCESSED / "thermal_block_retest.csv"
EARLY = [2017, 2018, 2019, 2020, 2021]
LATE = [2022, 2023, 2024, 2025]
DROPPED = (2018, 2021)
UNIT = "objectid"


def within_polygon_block(d: pd.DataFrame, col: str, early: list[int],
                         late: list[int]) -> tuple[float, float, int]:
    """Paired difference late-minus-early, each polygon contributing one pair."""
    a = d[d.year.isin(early)].groupby(UNIT)[col].mean()
    b = d[d.year.isin(late)].groupby(UNIT)[col].mean()
    j = pd.concat([a.rename("early"), b.rename("late")], axis=1).dropna()
    t = stats.ttest_rel(j.late, j.early)
    return float((j.late - j.early).mean()), float(t.pvalue), len(j)


def within_polygon_slope(d: pd.DataFrame, y: str, x: str) -> float:
    """Slope of y on x after removing each polygon's own mean from both."""
    g = d.groupby(UNIT)
    yy = d[y] - g[y].transform("mean")
    xx = d[x] - g[x].transform("mean")
    ok = yy.notna() & xx.notna()
    return float(np.polyfit(xx[ok], yy[ok], 1)[0])


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
    print("PER-SUMMER MEANS (153 polygons)")
    g = d.groupby("year").agg(lst=("lst_mean", "mean"), ndvi=("ndvi_mean", "mean"),
                              swci=("swci_mean", "mean"), CMD=("CMD_sm", "mean"),
                              PPT=("PPT_sm", "mean"), Tmax=("Tmax_sm", "mean"),
                              Tave=("Tave_sm", "mean"))
    g["block"] = np.where(g.index.isin(LATE), "late", "early")
    g["dropped"] = np.where(g.index.isin(DROPPED), " <- excluded", "")
    print(g.round(3).to_string())
    print(f"\n  hottest two summers in the record: "
          f"{', '.join(str(y) for y in g.lst.nlargest(2).index)}")
    print(f"  the exclusion removes: {DROPPED[0]}, {DROPPED[1]}")

    # 1 + 2. The block difference and what the climate predicts, both regimes.
    b_lst = within_polygon_slope(d, "lst_mean", "CMD_sm")
    print("\n" + "=" * 78)
    print("BLOCK DIFFERENCE, WITHIN POLYGON (late minus early, degC)")
    print(f"  within-polygon LST-on-CMD slope: {b_lst:+.5f} degC per mm\n")
    rows = []
    for label, e in [("all five early summers", EARLY),
                     ("2018 and 2021 excluded", early_sub)]:
        obs, p, n = within_polygon_block(d, "lst_mean", e, LATE)
        dcmd, _, _ = within_polygon_block(d, "CMD_sm", e, LATE)
        pred = b_lst * dcmd
        print(f"  {label:24s} observed {obs:+.3f}  (p={p:.2e}, n={n})")
        print(f"  {'':24s} dCMD     {dcmd:+.2f} mm -> climate predicts {pred:+.3f}")
        print(f"  {'':24s} RESIDUAL {obs - pred:+.3f} degC\n")
        rows.append({"regime": label, "observed": obs, "p": p,
                     "dCMD": dcmd, "predicted": pred, "residual": obs - pred})

    # 3. Is a step at 2022 the right model, or does the cut decide the answer?
    print("=" * 78)
    print("IS 2022 A STEP? Same test at every possible cut year (summer means,")
    print("CMD controlled). A real step at 2022 should stand out from its rivals.")
    ym = g.reset_index()[["year", "lst", "CMD"]]
    print(f"\n  {'cut':>5s}  {'step (degC)':>12s}  {'p':>9s}")
    best = []
    for cut in range(2018, 2026):
        ym["post"] = (ym.year >= cut).astype(float)
        X = np.column_stack([np.ones(len(ym)), ym.post, ym.CMD])
        beta, *_ = np.linalg.lstsq(X, ym.lst.values, rcond=None)
        resid = ym.lst.values - X @ beta
        dof = len(ym) - X.shape[1]
        se = np.sqrt((resid @ resid / dof) * np.linalg.inv(X.T @ X)[1, 1])
        tstat = beta[1] / se
        p = 2 * (1 - stats.t.cdf(abs(tstat), dof))
        mark = "  <- the published cut" if cut == 2022 else ""
        print(f"  {cut:>5d}  {beta[1]:>+12.3f}  {p:>9.3f}{mark}")
        best.append((abs(tstat), cut, beta[1], p))
    best.sort(reverse=True)
    print(f"\n  strongest step is at {best[0][1]}, not necessarily 2022")

    # A monotonic trend as the rival model.
    sl, ic, r, p_tr, se = stats.linregress(ym.year, ym.lst)
    print(f"  linear trend over nine summers: {sl:+.3f} degC/yr (p = {p_tr:.3f})")

    # 4. At what level does the variation actually live? Every polygon in a given
    # summer shares that summer's weather AND that summer's Landsat scene stack,
    # so 153 polygons are not 153 independent readings of a between-summer
    # contrast. The paired test above has n = 153; the contrast has n = 9.
    print("\n" + "=" * 78)
    print("AT WHAT LEVEL IS THE CONTRAST? The paired test treats 153 polygons as")
    print("replicates, but a block difference is a difference between SUMMERS.")
    for label, e in [("all five early summers", EARLY),
                     ("2018 and 2021 excluded", early_sub)]:
        a_ = g.loc[e, "lst"].values
        b_ = g.loc[LATE, "lst"].values
        t = stats.ttest_ind(b_, a_, equal_var=False)
        print(f"  {label:24s} {b_.mean() - a_.mean():+.3f} degC on summer means, "
              f"n = {len(a_)} vs {len(b_)}, p = {t.pvalue:.3f}")
    print("  (compare the polygon-level p-values above, which are 1e-13 and 1e-81)")

    # Why they disagree by 70 orders of magnitude: the 153 per-polygon block
    # differences are not 153 measurements, they are one summer-level number
    # with a little polygon-to-polygon spread on top. If that is so, their
    # spread must be small next to the spread between summers.
    per_poly = (d[d.year.isin(LATE)].groupby(UNIT).lst_mean.mean()
                - d[d.year.isin(EARLY)].groupby(UNIT).lst_mean.mean())
    summer_sd = g.loc[EARLY + LATE, "lst"].std()
    print(f"\n  sd of the 153 per-polygon block differences: {per_poly.std():.3f} degC")
    print(f"  sd of the 9 summer means                   : {summer_sd:.3f} degC")
    print(f"  ratio {summer_sd / per_poly.std():.1f}x -- the variation is between summers,")
    print("  and every polygon in a summer shares its weather and its scene stack.")

    # The same contrast with the standard error clustered on summer, which is
    # the level of the treatment. Effective n is the number of summers.
    long = d[d.year.isin(EARLY + LATE)][[UNIT, "year", "lst_mean"]].copy()
    long["post"] = long.year.isin(LATE).astype(float)
    yr_means = long.groupby(["year", "post"]).lst_mean.mean().reset_index()
    diff = (yr_means[yr_means.post == 1].lst_mean.mean()
            - yr_means[yr_means.post == 0].lst_mean.mean())
    v1 = yr_means[yr_means.post == 1].lst_mean.var(ddof=1) / (yr_means.post == 1).sum()
    v0 = yr_means[yr_means.post == 0].lst_mean.var(ddof=1) / (yr_means.post == 0).sum()
    se_cl = np.sqrt(v1 + v0)
    print(f"\n  block difference with SE clustered on summer: "
          f"{diff:+.3f} +/- {1.96 * se_cl:.3f} degC (95% CI "
          f"[{diff - 1.96 * se_cl:+.3f}, {diff + 1.96 * se_cl:+.3f}])")

    # 5. The positive test. Across the nine summer means, does LST track CMD, and
    # do the late summers sit systematically above that line? This is the same
    # question as the block contrast, asked where the variation lives.
    print("\n" + "=" * 78)
    print("SUMMER-MEAN LST ON SUMMER-MEAN CMD, RESIDUALS BY YEAR")
    sl2, ic2, r2, p2, se2 = stats.linregress(ym.CMD, ym.lst)
    ym["fit"] = ic2 + sl2 * ym.CMD
    ym["resid"] = ym.lst - ym.fit
    print(f"  slope {sl2:+.5f} degC/mm (r = {r2:+.3f}, p = {p2:.3f}, n = 9)\n")
    print(f"  {'year':>5s}  {'CMD':>7s}  {'LST':>7s}  {'fitted':>7s}  {'resid':>7s}")
    for _, row in ym.iterrows():
        tag = "late" if int(row.year) in LATE else "early"
        print(f"  {int(row.year):>5d}  {row.CMD:>7.1f}  {row.lst:>7.2f}  "
              f"{row.fit:>7.2f}  {row.resid:>+7.2f}   {tag}")
    re_, rl_ = ym[~ym.year.isin(LATE)].resid, ym[ym.year.isin(LATE)].resid
    tt = stats.ttest_ind(rl_, re_, equal_var=False)
    print(f"\n  mean residual: early {re_.mean():+.3f}, late {rl_.mean():+.3f}, "
          f"difference {rl_.mean() - re_.mean():+.3f} degC (p = {tt.pvalue:.3f})")

    # 6. Does the sign of the residual depend on the exclusion?
    print("\n" + "=" * 78)
    print("WHAT THE REMAINING CANDIDATES HAVE TO EXPLAIN")
    for r_ in rows:
        print(f"  {r_['regime']:24s} residual {r_['residual']:+.3f} degC")
    delta = rows[1]["residual"] - rows[0]["residual"]
    print(f"  the exclusion alone accounts for {delta:+.3f} degC of it")

    pd.DataFrame(rows).to_csv(a.out, index=False)
    log.info("wrote %s", a.out)


if __name__ == "__main__":
    main()
