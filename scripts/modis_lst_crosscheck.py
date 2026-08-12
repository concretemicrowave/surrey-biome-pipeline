"""Does an independent thermal instrument see Surrey's 2022 LST level shift?

THE QUESTION. `thermal_block_retest.py` established that the +2.24 degC block
shift in Landsat corridor LST is mostly the exclusion rule (+1.78) and that what
remains is not significant at the level it varies (+0.457 degC, 95% CI clustered
on summer [-2.26, +3.17]). What survives is a direction: over nine summers the
late block sits +1.48 degC above the summer-mean LST-on-CMD line, p = 0.208.
Nine summers cannot settle whether that is real. Two things are needed --- an
instrument that shares none of this pipeline's machinery, and a longer record.

MODIS 11A2 supplies both. It is a different sensor on different satellites, with
its own atmospheric correction, its own cloud screening, its own 8-day
compositing, and a record starting in 2000 rather than 2017. Nothing in it
touches `acquire_raster.build_lst_composite`. If the Landsat shift is an artifact
of how this project composites Landsat, MODIS cannot reproduce it. If the
surface genuinely warmed, MODIS has no way to avoid seeing it.

THE DESIGN, fixed before running.

  Extent   the Surrey study bbox, whole-footprint mean. MODIS is 1 km and Surrey
           corridors have a median area of 5.8 ha, so per-corridor MODIS is
           meaningless and is not attempted. This changes the target: MODIS
           measures whether the Surrey *landscape* warmed, Landsat measures
           whether the *corridors* did. That asymmetry is a limitation of the
           check and is reported with the result, not buried.
  Window   1 June - 31 August, matching `summer_window`.
  Series   both platforms separately. Terra runs from 2000, Aqua from mid-2002.
           Their overpasses differ (~10:30 vs ~13:30 local), so they are never
           pooled; agreement between two independently-drifting platforms is
           itself evidence, and disagreement localises the problem.
  Masking  QC_Day mandatory QA bits 0-1 == 0 (good quality), LST fill 0 dropped,
           scale 0.02 to K. Physical guard to -20..70 degC as in the pipeline.
  Drift    MODIS overpass time is NOT stable across this record --- both Terra
           and Aqua left the A-train around 2022 and their local overpass times
           drift after that, which is exactly at the block boundary. This is why
           `Day_view_time` is carried as a covariate rather than assumed away: a
           drift toward earlier observation reads cooler, later reads warmer, and
           the test controls for it explicitly.

WHAT WOULD FALSIFY EACH CANDIDATE. Stated now so the answer cannot be chosen
after the fact.

  Candidate A -- something in the Landsat compositing.
    SUPPORTED if MODIS summer means correlate poorly with Landsat's over the
      nine shared summers, and MODIS shows no elevated 2022-2025 block.
    FALSIFIED if MODIS tracks the Landsat interannual series and reproduces the
      block sign. MODIS shares no code, so it cannot inherit a coding artifact.

  Candidate B -- real surface warming ClimateBC cannot see.
    SUPPORTED if the 2022-2025 MODIS level is elevated against the full
      2000-2021 baseline, and that survives the overpass-time control.
    FALSIFIED if 2022-2025 sits inside the ordinary range of the long record, or
      if the elevation disappears once view time is controlled.

  Candidate C -- there is nothing to explain.
    SUPPORTED if no cut year gives a significant step in the long MODIS record
      and 2022-2025 is unremarkable against 26 summers.
    FALSIFIED by either of the above being supported.

  Note the asymmetry that makes this worth running: A and B are both falsifiable
  by the same measurement, and C is what remains if both fail.

NOTHING IS OVERWRITTEN. MODIS arrays are held in memory and reduced to one
number per summer per platform; no raster is written into `data/interim`, whose
`lst_*.tif` are the panel of record.

    .venv/bin/python scripts/modis_lst_crosscheck.py -v
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

from src.pipeline import paths

log = logging.getLogger(__name__)

COLLECTION = "modis-11A2-061"
PC_STAC = "https://planetarycomputer.microsoft.com/api/stac/v1"
OUT_CSV = paths.PROCESSED / "modis_lst_crosscheck.csv"
YEARS = list(range(2000, 2026))
LANDSAT_YEARS = list(range(2017, 2026))
EARLY = [2017, 2018, 2019, 2020, 2021]
LATE = [2022, 2023, 2024, 2025]
KELVIN_TO_C = 273.15
LST_SCALE, VIEWTIME_SCALE = 0.02, 0.1


def summer_series(bbox: list[float], year: int, platform: str) -> dict | None:
    """One summer's footprint-mean day LST and mean overpass time, or None."""
    import odc.stac
    import planetary_computer as pc
    import pystac_client

    cat = pystac_client.Client.open(PC_STAC, modifier=pc.sign_inplace)
    items = [it for it in cat.search(
        collections=[COLLECTION], bbox=bbox,
        datetime=f"{year}-06-01/{year}-08-31").items()
        if it.properties.get("platform") == platform]
    if not items:
        return None

    ds = odc.stac.load(
        items, bands=["LST_Day_1km", "QC_Day", "Day_view_time"],
        bbox=bbox, crs="EPSG:4326", resolution=0.01,
        chunks={}, groupby="solar_day",
    )
    # QC_Day bits 0-1: 0 = LST produced, good quality. Anything else is dropped
    # rather than kept with a quality flag, because a footprint mean cannot carry
    # per-pixel uncertainty forward.
    good = (ds.QC_Day.astype("uint8") & np.uint8(0b11)) == 0
    raw = ds.LST_Day_1km
    lst = raw.where((raw > 0) & good) * LST_SCALE - KELVIN_TO_C
    lst = lst.where((lst > -20) & (lst < 70))
    vt = ds.Day_view_time.where((ds.Day_view_time > 0) & good) * VIEWTIME_SCALE

    n_obs = int(lst.notnull().sum().compute())
    if n_obs == 0:
        return None
    return {"year": year, "platform": platform,
            "lst": float(lst.mean().compute()),
            "view_time": float(vt.mean().compute()),
            "n_periods": int(ds.sizes["time"]),
            "n_valid_px": n_obs}


def step_scan(years: np.ndarray, vals: np.ndarray,
              covars: dict[str, np.ndarray] | None = None) -> list[tuple]:
    """Step indicator at every cut year, optionally with covariates."""
    out = []
    # Upper bound must admit a cut with two summers on the late side, so that
    # 2022 is evaluated when the record ends in 2023. An earlier bound of
    # max - 1 silently skipped the only cut this study cares about.
    for cut in range(int(years.min()) + 2, int(years.max())):
        cols = [np.ones(len(years)), (years >= cut).astype(float)]
        for v in (covars or {}).values():
            cols.append(v)
        X = np.column_stack(cols)
        beta, *_ = np.linalg.lstsq(X, vals, rcond=None)
        resid = vals - X @ beta
        dof = len(years) - X.shape[1]
        se = np.sqrt((resid @ resid / dof) * np.linalg.inv(X.T @ X)[1, 1])
        p = 2 * (1 - stats.t.cdf(abs(beta[1] / se), dof))
        out.append((cut, float(beta[1]), float(p)))
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--extent", type=Path, default=paths.STUDY_EXTENT_JSON)
    ap.add_argument("--out", type=Path, default=OUT_CSV)
    ap.add_argument("-v", "--verbose", action="store_true")
    a = ap.parse_args()
    logging.basicConfig(level=logging.INFO if a.verbose else logging.WARNING,
                        format="%(levelname)s %(message)s")

    bbox = json.loads(a.extent.read_text())["bbox_4326"]
    if a.out.exists():
        m = pd.read_csv(a.out)
        log.info("reusing %s (%d rows)", a.out, len(m))
    else:
        rows = []
        for plat in ("terra", "aqua"):
            for yr in YEARS:
                r = summer_series(bbox, yr, plat)
                if r:
                    rows.append(r)
                    log.info("%s %d: LST %.2f degC, view %.2f h, %d periods",
                             plat, yr, r["lst"], r["view_time"], r["n_periods"])
        m = pd.DataFrame(rows)
        a.out.parent.mkdir(parents=True, exist_ok=True)
        m.to_csv(a.out, index=False)
        log.info("wrote %s", a.out)

    panel = pd.read_parquet(paths.PROCESSED / "features_extended.parquet")
    ls = panel.groupby("year").lst_mean.mean()

    # A summer built from a handful of 8-day periods is not comparable to one
    # built from thirteen. Terra's record degrades at the end (2024 returns no
    # items at all, 2025 only two periods), which is exactly where the contrast
    # of interest sits, so the guard is stated rather than left implicit.
    MIN_PERIODS = 8
    thin = m[m.n_periods < MIN_PERIODS]
    if len(thin):
        print("DROPPED for too few 8-day periods (< %d):" % MIN_PERIODS)
        print(thin[["platform", "year", "n_periods", "lst"]].to_string(index=False))
    m = m[m.n_periods >= MIN_PERIODS]

    for plat in ("terra", "aqua"):
        s = m[m.platform == plat].sort_values("year")
        if s.empty:
            continue
        print("\n" + "=" * 78)
        print(f"MODIS {plat.upper()}  ({int(s.year.min())}-{int(s.year.max())}, "
              f"{len(s)} summers)")
        print(s[["year", "lst", "view_time", "n_periods"]].round(2).to_string(index=False))

        # Candidate A: does MODIS track the Landsat interannual series?
        j = s[s.year.isin(LANDSAT_YEARS)].set_index("year")
        if len(j) >= 5:
            common = j.index.intersection(ls.index)
            r, p = stats.pearsonr(j.loc[common, "lst"], ls.loc[common])
            print(f"\n  vs Landsat corridor LST, {len(common)} shared summers: "
                  f"r = {r:+.3f} (p = {p:.3f})")

        # Candidate B/C: is the late block elevated, in MODIS's own record?
        e = s[s.year.isin(EARLY)].lst.values
        l = s[s.year.isin(LATE)].lst.values
        if len(e) and len(l):
            se = np.sqrt(e.var(ddof=1) / len(e) + l.var(ddof=1) / len(l))
            d = l.mean() - e.mean()
            print(f"  block 2022-25 vs 2017-21: {d:+.3f} degC, 95% CI "
                  f"[{d - 1.96 * se:+.3f}, {d + 1.96 * se:+.3f}]  "
                  f"(Landsat corridors: {ls.loc[LATE].mean() - ls.loc[EARLY].mean():+.3f})")

        base = s[s.year < 2022].lst
        if len(base) >= 10:
            z = (s[s.year.isin(LATE)].lst.mean() - base.mean()) / base.std()
            print(f"  2022-25 mean against the {len(base)}-summer 2000-2021 "
                  f"baseline: z = {z:+.2f}")

        # The step scan, with and without the overpass-time control.
        yrs, vals = s.year.values.astype(float), s.lst.values
        for label, cov in [("no control", None),
                           ("view time controlled", {"vt": s.view_time.values})]:
            sc = step_scan(yrs, vals, cov)
            if not sc:
                continue
            at22 = next((x for x in sc if x[0] == 2022), None)
            lo = min(sc, key=lambda x: x[2])
            sig = [x[0] for x in sc if x[2] < 0.05]
            head = (f"at 2022 {at22[1]:+.3f} p = {at22[2]:.3f}" if at22
                    else "2022 not in scan range")
            print(f"  step scan ({label:20s}): {head} | lowest p at {lo[0]} "
                  f"(p = {lo[2]:.3f}) | {len(sig)} of {len(sc)} cuts p<0.05")

        sl, ic, r2, ptr, sse = stats.linregress(yrs, vals)
        print(f"  long-record trend: {sl:+.4f} degC/yr (p = {ptr:.3f})")


if __name__ == "__main__":
    main()
