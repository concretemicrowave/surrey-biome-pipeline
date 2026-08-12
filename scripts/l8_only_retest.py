"""Is the 2022 LST level shift a Landsat 8/9 cross-sensor artifact, or real?

THE OBSERVATION. Over the nine-summer panel, mean corridor LST is **+2.24 degC
higher** in 2022-2025 than in 2017-2021 (within-polygon, p = 3e-106). That shift
is not what the climate says: 2022-2025 is *wetter* (CMD 155 vs 193, PPT 174 vs
129, both p < 1e-20), and within-polygon the wetter summers run cooler, so the
climate record predicts the later block should be **0.39 degC cooler**. Observed
is +2.24 warmer -- wrong sign, six times the magnitude.

It also propagates. LST predicts SWCI within polygons at -0.00228/degC
(r = -0.334), the +2.24 degC shift predicts a SWCI drop of -0.00508 against
-0.00276 observed, and that SWCI shift is the whole of the residual block effect
in `dry_dist` once 2018 and 2021 are set aside. So this is not a curiosity about
the thermal band; it is the last unexplained piece of V1.

WHY LANDSAT 9 IS THE SUSPECT. The platform mix changes exactly at the block
boundary. Counting Surrey summer scenes at cloud < 40%:

    2017-2021    0% Landsat 9     5-9 scenes per summer
    2022-2025   42-59% Landsat 9  12-19 scenes per summer

Landsat 9 became available in early 2022, `landsat_search` requests both
platforms, and `build_lst_composite` takes a **mean over time** -- so both the
sensor mix and the number of days being averaged change at the same instant.

WHY THE OBSERVATIONAL RECORD CANNOT SETTLE IT. "Landsat 9 arrived" and "the
later summers" are perfectly collinear, and there are only nine annual means to
work with. Year-level regressions say as much: `corr(L9 share, mean LST)` is
0.098 and `corr(scene count, mean LST)` is 0.028 -- both essentially zero -- and
in `LST ~ CMD + L9share` the L9 term is +4.36 degC at p = 0.141. Suggestive,
underpowered, and not something to publish either way.

WHAT THIS SCRIPT DOES. Breaks the collinearity by rebuilding 2022-2025 LST from
**Landsat 8 alone**, holding everything else fixed -- same date windows, same
cloud threshold, same QA masking, same mean compositor, same corridors, same
zonal method. The only thing that changes is whether Landsat 9 scenes are
allowed in. Two arms over the same four summers:

    mixed    L8 + L9, what the published panel contains
    L8-only  L8 scenes only, the counterfactual

    block difference collapses -> cross-sensor artifact. The thermal term is not
                                  comparable across 2022, which affects RLST,
                                  CDEI, and any multi-year Landsat LST work
                                  spanning that boundary.
    block difference survives  -> not the platform. The live candidates become
                                  real surface warming that ClimateBC cannot see
                                  (Surrey is developing fast) or something in the
                                  compositing, and the LST-vs-climate divergence
                                  becomes a finding rather than a bug.

Note what the L8-only arm costs: dropping half the scenes makes its composite
noisier, so a *small* residual difference between arms is expected from sampling
alone and should not be read as sensor bias. The quantity to look at is whether
the +2.24 degC block shift is still there, not whether the two arms agree to the
third decimal.

NOTHING IS OVERWRITTEN. The published `lst_{year}.tif` are the panel of record.
L8-only composites are written to a separate directory and the canonical rasters
are read, never rewritten.

Run (needs network; ~10-20 min for four summers over Surrey):
    .venv/bin/python scripts/l8_only_retest.py -v
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
from scipy import stats

from src.pipeline import paths
from src.pipeline.acquire_raster import build_lst_composite, summer_window
from src.pipeline.zonal import zonal_bands

log = logging.getLogger(__name__)

YEARS = [2022, 2023, 2024, 2025]
EARLY = [2017, 2018, 2019, 2020, 2021]
OUT_DIR = paths.INTERIM / "l8_only"
OUT_CSV = paths.PROCESSED / "l8_only_retest.csv"
EXTENDED = paths.PROCESSED / "features_extended.parquet"
UNIT = "objectid"


def build_arm(extent_json: Path, out_dir: Path, years: list[int],
              platform: str) -> tuple[dict[int, Path], dict[int, int]]:
    """Single-platform LST composites, one per summer. Existing files are reused."""
    import json

    bbox = json.loads(extent_json.read_text())["bbox_4326"]
    out_dir.mkdir(parents=True, exist_ok=True)
    tag = platform.replace("landsat-", "l")
    made, counts = {}, {}
    for yr in years:
        dst = out_dir / f"lst_{yr}_{tag}.tif"
        start, end = summer_window(yr)
        if dst.exists():
            log.info("%s exists, reusing", dst.name)
            made[yr] = dst
            continue
        comp = build_lst_composite(bbox, start, end, platforms=[platform])
        counts[yr] = int(comp.attrs.get("n_scenes", -1))
        log.info("%d %s: %d scenes", yr, tag, counts[yr])
        comp.rio.to_raster(dst, driver="COG", compress="DEFLATE", nodata=np.nan)
        made[yr] = dst
    return made, counts


def zonal_arm(rasters: dict[int, Path], corridors: gpd.GeoDataFrame) -> pd.DataFrame:
    frames = []
    for yr, path in sorted(rasters.items()):
        z = zonal_bands(corridors, path, ["lst"], pixel_size_m=30.0)
        z["year"] = yr
        frames.append(z[[UNIT, "year", "lst_mean"]])
    return pd.concat(frames, ignore_index=True)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--extent", type=Path, default=paths.STUDY_EXTENT_JSON)
    ap.add_argument("--out-dir", type=Path, default=OUT_DIR)
    ap.add_argument("-v", "--verbose", action="store_true")
    a = ap.parse_args()
    logging.basicConfig(level=logging.INFO if a.verbose else logging.WARNING,
                        format="%(levelname)s %(message)s")

    ext = pd.read_parquet(EXTENDED)
    corridors = gpd.read_file(paths.CORRIDORS_ANALYSIS, layer="corridors_analysis")

    r8, n8 = build_arm(a.extent, a.out_dir, YEARS, "landsat-8")
    r9, n9 = build_arm(a.extent, a.out_dir, YEARS, "landsat-9")
    l8 = zonal_arm(r8, corridors).rename(columns={"lst_mean": "lst_l8"})
    l9 = zonal_arm(r9, corridors).rename(columns={"lst_mean": "lst_l9"})

    mixed = ext[ext.year.isin(YEARS)][[UNIT, "year", "lst_mean"]].rename(
        columns={"lst_mean": "lst_mixed"})
    m = mixed.merge(l8, on=[UNIT, "year"]).merge(l9, on=[UNIT, "year"]).dropna(
        subset=["lst_mixed", "lst_l8", "lst_l9"])
    if m.empty:
        raise SystemExit("no overlap between the arms -- check the unit key")
    print(f"\npaired on {len(m)} polygon-summers, {m[UNIT].nunique()} polygons")
    if n8 or n9:
        print(f"scenes per summer -- L8 {n8}  L9 {n9}")

    # The direct cross-sensor question, with the summer held fixed. This is what
    # the L8-only-vs-mixed contrast could not ask, because dropping L9 also
    # halves the scene count and the sampling change swamps any sensor effect.
    print("\nL9 MINUS L8, WITHIN THE SAME SUMMER (degC)")
    per = m.groupby("year")[["lst_l8", "lst_l9", "lst_mixed"]].mean()
    per["L9-L8"] = per.lst_l9 - per.lst_l8
    print(per.round(3).to_string())

    d = m.lst_l9 - m.lst_l8
    t = stats.ttest_rel(m.lst_l9, m.lst_l8)
    print(f"\n  pooled L9-L8: {d.mean():+.3f} degC (sd {d.std():.3f}, "
          f"paired p={t.pvalue:.2e}, n={len(m)})")
    signs = (per["L9-L8"] > 0).sum()
    print(f"  consistent sign in {signs} of {len(per)} summers")
    print("  NOTE n=4 summers, and L8/L9 sample different days (8-day offset),")
    print("  so a per-summer difference confounds sensor with weather. Only a")
    print("  large and consistent difference is interpretable.")

    # Block context, on the same footing as the diagnosis that raised this:
    # 2018 and 2021 are excluded because the slope mismatch already explains them.
    early_all = ext[ext.year.isin(EARLY)].lst_mean.mean()
    early_sub = ext[ext.year.isin([y for y in EARLY if y not in (2018, 2021)])].lst_mean.mean()
    print("\nBLOCK CONTEXT (raw means, degC)")
    print(f"  early 2017-21 all five      : {early_all:.3f}")
    print(f"  early excl. 2018+2021       : {early_sub:.3f}   <- the residual-effect baseline")
    for label, col in [("late, mixed (published)", "lst_mixed"),
                       ("late, L8 only", "lst_l8"), ("late, L9 only", "lst_l9")]:
        late = m[col].mean()
        print(f"  {label:27s}: {late:.3f}   block vs excl. baseline {late-early_sub:+.3f}")

    m.to_csv(OUT_CSV, index=False)
    log.info("wrote %s", OUT_CSV)


if __name__ == "__main__":
    main()
