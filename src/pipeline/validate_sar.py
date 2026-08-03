"""Independent validation of the corridor water-stress ranking with Sentinel-1 SAR.

The CDEI ranking (``corridor_stress.py``) is built from optical + thermal imagery.
Sentinel-1 is a *radar* sensor — different physics, sensitive to vegetation/soil
water — so it is a genuinely independent check on whether the between-corridor
ranking reflects water stress or something else.

Method: summer-median VV/VH backscatter -> Radar Vegetation Index (RVI) and
cross-ratio -> zonal mean per corridor -> Spearman correlation with the stress
ranking, plus VH-vs-NDVI to expose a canopy-density confound.

Result (all four summers 2022–2025): the vegetation-condition radar indices (RVI,
cross-ratio) are flat-null against the ranking (|rho| <= 0.08), while the only
correlated radar signal (VH/VV backscatter) tracks canopy density (VH vs NDVI
rho ~ +0.55). => the between-corridor ranking is confounded with canopy density
and is NOT independently validated as water stress. The temporal axis validates
separately (CDEI vs independent ClimateBC moisture; see docs/PHASE3_FINDINGS.md).

CLI:  python -m src.pipeline.validate_sar -v          # all four summers (slow; hits PC STAC)
"""
from __future__ import annotations

import argparse
import logging
from pathlib import Path

import pandas as pd

from . import paths

logger = logging.getLogger(__name__)

BBOX_4326 = [-122.95, 49.00, -122.70, 49.22]      # Surrey
ANALYSIS_CRS = "EPSG:26910"
RES_M = 30
PC_STAC = "https://planetarycomputer.microsoft.com/api/stac/v1"
# The POLYGON table, not the corridor one. Polygons are the modelling unit and
# carry `objectid` and `ndvi`, which this module merges and filters on; the
# corridor table has carried neither since the GIN unit pass (2026-07-29), so
# pointing here at corridor_stress_ranking.csv raises KeyError on the merge.
# The published summary was computed per polygon, which is what this reproduces.
RANKING = paths.DOCS / "deliverable" / "polygon_stress_ranking.csv"
OUT_CSV = paths.DOCS / "deliverable" / "sar_validation_summary.csv"
# Per-polygon backscatter, kept so the radar can be used as an independent
# canopy-structure control rather than only as a yes/no validation check.
PER_UNIT_CSV = paths.PROCESSED / "sar_per_polygon.csv"


def s1_summer_composite(year: int):
    """Summer-median Sentinel-1 RTC VV/VH + RVI/cross-ratio, eager (avoids zonal thrash)."""
    import odc.stac
    import planetary_computer as pc
    import pystac_client
    import rioxarray  # noqa: F401 — registers .rio

    cat = pystac_client.Client.open(PC_STAC, modifier=pc.sign_inplace)
    items = list(cat.search(collections=["sentinel-1-rtc"], bbox=BBOX_4326,
                            datetime=f"{year}-06-01/{year}-08-31").items())
    ds = odc.stac.load(items, bands=["vv", "vh"], bbox=BBOX_4326, crs=ANALYSIS_CRS,
                       resolution=RES_M, groupby="solar_day", chunks={})
    vv = ds["vv"].where(ds["vv"] > 0).median("time")
    vv.load()
    vh = ds["vh"].where(ds["vh"] > 0).median("time")
    vh.load()
    out = vv.to_dataset(name="vv")
    out["vh"] = vh
    out["rvi"] = (4 * vh) / (vv + vh)              # dual-pol Radar Vegetation Index
    out["cr"] = vh / vv                             # cross-ratio
    return out.rio.write_crs(ANALYSIS_CRS), len(items)


def validate_year(year: int, ranking: pd.DataFrame, corridors) -> tuple[dict, pd.DataFrame]:
    """Summary row for `year`, plus the per-polygon backscatter behind it."""
    from exactextract import exact_extract
    from scipy.stats import spearmanr

    ds, n = s1_summer_composite(year)
    ext = exact_extract(ds, corridors, ["mean"], include_cols=["objectid"], output="pandas")
    s1 = ext.rename(columns={c: c.replace("_mean", "") for c in ext.columns})
    s1["objectid"] = s1["objectid"].astype(int)
    m = ranking.merge(s1, on="objectid").dropna(subset=["rvi", "vh", "stress_pctile", "ndvi"])
    row = {"year": year, "scenes": n, "corridors": len(m),
           "rvi_vs_stress": spearmanr(m["stress_pctile"], m["rvi"])[0],
           "cr_vs_stress": spearmanr(m["stress_pctile"], m["cr"])[0],
           "vh_vs_stress": spearmanr(m["stress_pctile"], m["vh"])[0],
           "vh_vs_ndvi": spearmanr(m["ndvi"], m["vh"])[0]}
    logger.info("%d: %d scenes | RVI-stress %+.3f | VH-stress %+.3f | VH-NDVI %+.3f",
                year, n, row["rvi_vs_stress"], row["vh_vs_stress"], row["vh_vs_ndvi"])
    per = m[["objectid", "gin_id", "vv", "vh", "rvi", "cr", "ndvi", "tvwsi",
             "stress_pctile"]].copy()
    per.insert(0, "year", year)
    return row, per


def run(years=(2022, 2023, 2024, 2025), ranking_csv: Path = RANKING,
        out_csv: Path = OUT_CSV, per_unit_csv: Path = PER_UNIT_CSV) -> pd.DataFrame:
    import geopandas as gpd

    ranking = pd.read_csv(ranking_csv)
    corridors = gpd.read_file(paths.INTERIM / "corridors_analysis.gpkg")[
        ["objectid", "geometry"]].to_crs(ANALYSIS_CRS)
    results = [validate_year(y, ranking, corridors) for y in years]
    df = pd.DataFrame([r for r, _ in results])
    # Rounded to the precision the summary is quoted at, so a re-run produces the
    # same file rather than a diff of trailing float digits.
    df = df.round({c: 3 for c in df.columns if c.endswith(("_stress", "_ndvi"))})
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_csv, index=False)
    logger.info("wrote %s", out_csv)

    per = pd.concat([p for _, p in results], ignore_index=True)
    per_unit_csv.parent.mkdir(parents=True, exist_ok=True)
    per.to_csv(per_unit_csv, index=False)
    logger.info("wrote %s (%d polygon-summers)", per_unit_csv, len(per))
    return df


def main() -> None:
    p = argparse.ArgumentParser(description="Sentinel-1 SAR validation of the corridor ranking.")
    p.add_argument("--years", type=int, nargs="+", default=[2022, 2023, 2024, 2025])
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()
    logging.basicConfig(level=logging.INFO if args.verbose else logging.WARNING,
                        format="%(levelname)s %(name)s: %(message)s")
    df = run(years=tuple(args.years))
    print("=" * 66)
    print("Sentinel-1 SAR vs corridor stress ranking (Spearman rho)")
    print("=" * 66)
    print(df.round(3).to_string(index=False))
    print("\nRVI/cross-ratio ~0 every year => ranking NOT confirmed as water stress;")
    print("VH tracks NDVI => the correlated radar signal is canopy density, not water.")


if __name__ == "__main__":
    main()
