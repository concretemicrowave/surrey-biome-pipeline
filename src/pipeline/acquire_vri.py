"""Acquire Phase 3b analysis units: BC VRI forest stands on a Fraser Valley
elevation transect, south of the Fraser River.

Why this layer
--------------
Phase 3 returned INCONCLUSIVE over Surrey because ClimateBC's *between-unit*
variation there is an order of magnitude smaller than its interannual variation
(see ``docs/RESOLUTION_TEST_FINDINGS.md``). Phase 3b re-runs the same A-vs-B experiment
on an extent where climate genuinely varies in space. That needs analysis units
spanning real elevation, and Surrey's municipally-defined corridors have no
equivalent in the valley.

Two candidate sources were probed against the BC Data Catalogue WFS:

* ``WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW`` (parks / ecological reserves) — only
  **19** polygons over the transect, ranging from 7 ha to 61,594 ha. Too few to
  spatially block Model B, and a single 61,594 ha park internally spans most of
  the elevation range the experiment exists to resolve. **Rejected** as the
  analysis unit; still useful as a validation subset.
* ``WHSE_FOREST_VEGETATION.VEG_COMP_LYR_R1_POLY`` (VRI) — **14,534** stands over
  the south-of-Fraser box, continuous coverage from the Delta/Surrey lowland to
  the Cascade foothills, median stand 8–11 ha. **Selected.**

Extent
------
Latitude is capped at 49.20 N, which keeps the sample south of the Fraser across
the whole east-west span. Without that cap the bounding box reaches into the
North Shore mountains (Golden Ears, Pinecone Burke, Mount Seymour) — more
elevation range, but no longer a valley transect.

Sampling
--------
The full stand population is far larger than the ClimateBC call budget allows
(each stand costs 5 calls at ~50 calls/hour). Stands are therefore sampled to a
target count, stratified by **BEC zone x easting quintile**:

* BEC zone is a defensible elevation proxy available before any DEM call —
  CWH is the 0–900 m coastal band, MH the 900–1800 m montane band, CMA alpine.
  Stratifying on it guarantees the elevation gradient is populated rather than
  hoping a random draw finds it.
* Easting quintiles keep the west-east transect covered, which matters because
  spatially-blocked CV holds out geographic blocks.

Allocation across strata is proportional to ``sqrt(n)`` rather than ``n``. Pure
proportional allocation would spend ~77% of the budget on the lowland CWH zone
and leave the montane band — the part of the gradient Surrey lacked — barely
sampled. The square root is the standard compromise between proportional and
equal allocation.
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
import requests

from . import paths

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #
BCDC_WFS = "https://openmaps.gov.bc.ca/geo/pub/ows"
VRI_LAYER = "WHSE_FOREST_VEGETATION.VEG_COMP_LYR_R1_POLY"
VRI_GEOM_COL = "GEOMETRY"
VRI_SORT_KEY = "FEATURE_ID"
PA_LAYER = "WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW"
PA_GEOM_COL = "SHAPE"
PA_SORT_KEY = "OBJECTID"

SERVICE_CRS = "EPSG:3005"     # BC Albers — what the WFS serves natively
ANALYSIS_CRS = "EPSG:26910"   # project analysis CRS (UTM 10N)

# Fraser Valley transect, south of the Fraser. lon/lat, EPSG:4326.
TRANSECT_WGS84 = (-123.15, 49.00, -121.40, 49.20)

# Attributes worth carrying: enough to characterise a stand without pulling the
# full VRI schema (200+ columns) across ~15k polygons.
VRI_FIELDS = [
    "FEATURE_ID",
    "BCLCS_LEVEL_1", "BCLCS_LEVEL_2", "BCLCS_LEVEL_4",
    "BEC_ZONE_CODE", "BEC_SUBZONE",
    "SPECIES_CD_1", "SPECIES_PCT_1", "PROJ_AGE_1", "PROJ_HEIGHT_1",
    "CROWN_CLOSURE", "POLYGON_AREA",
]

PAGE_SIZE = 1000
REQUEST_TIMEOUT = 180
DEFAULT_TARGET_N = 300
MIN_STAND_HA = 1.0     # 1 ha ~= 100 Sentinel-2 pixels; below this zonal stats get noisy
N_EASTING_BINS = 5
SEED = 26910


# --------------------------------------------------------------------------- #
# Fetching
# --------------------------------------------------------------------------- #
def transect_bbox(crs: str = SERVICE_CRS) -> tuple[float, float, float, float]:
    """The transect bounding box, reprojected from WGS84 lon/lat."""
    from pyproj import Transformer

    t = Transformer.from_crs("EPSG:4326", crs, always_xy=True)
    w, s, e, n = TRANSECT_WGS84
    x1, y1 = t.transform(w, s)
    x2, y2 = t.transform(e, n)
    return (x1, y1, x2, y2)


def _wfs_page(layer: str, cql: str, *, fields: list[str] | None, geom_col: str,
              sort_key: str, start: int, count: int) -> dict:
    params = {
        "service": "WFS",
        "version": "2.0.0",
        "request": "GetFeature",
        "typeNames": layer,
        "outputFormat": "application/json",
        "srsName": SERVICE_CRS,
        "count": count,
        "startIndex": start,
        "CQL_FILTER": cql,
        # A stable sort is what makes paging correct rather than merely plausible;
        # without it the server may reorder between pages and silently duplicate
        # or drop features. It must be an attribute — sorting on the geometry
        # column returns a 400 from this service.
        "sortBy": sort_key,
    }
    if fields:
        params["propertyName"] = ",".join([*fields, geom_col])
    r = requests.get(BCDC_WFS, params=params, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()


def fetch_wfs(layer: str, cql: str, *, geom_col: str, sort_key: str,
              fields: list[str] | None = None,
              page_size: int = PAGE_SIZE) -> gpd.GeoDataFrame:
    """Page a WFS layer under a CQL filter into one GeoDataFrame."""
    frames, start = [], 0
    while True:
        js = _wfs_page(layer, cql, fields=fields, geom_col=geom_col,
                       sort_key=sort_key, start=start, count=page_size)
        feats = js.get("features", [])
        if not feats:
            break
        frames.append(gpd.GeoDataFrame.from_features(feats, crs=SERVICE_CRS))
        logger.info("  %s: fetched %d (total %d)", layer.split(".")[-1],
                    len(feats), sum(len(f) for f in frames))
        if len(feats) < page_size:
            break
        start += page_size
    if not frames:
        return gpd.GeoDataFrame(geometry=[], crs=SERVICE_CRS)
    return gpd.GeoDataFrame(pd.concat(frames, ignore_index=True),
                            geometry="geometry", crs=SERVICE_CRS)


def fetch_vri_stands(*, treed_only: bool = True) -> gpd.GeoDataFrame:
    """All VRI stands over the transect, optionally restricted to treed cover."""
    x1, y1, x2, y2 = transect_bbox()
    cql = f"BBOX({VRI_GEOM_COL},{x1:.0f},{y1:.0f},{x2:.0f},{y2:.0f},'{SERVICE_CRS}')"
    if treed_only:
        # V/T = vegetated, treed. The ecological analogue of a Surrey corridor;
        # excludes water, rock, ice and cleared land, none of which have a
        # canopy water-stress signal to predict.
        cql += " AND BCLCS_LEVEL_1='V' AND BCLCS_LEVEL_2='T'"
    logger.info("fetching VRI stands over transect (treed_only=%s)", treed_only)
    return fetch_wfs(VRI_LAYER, cql, geom_col=VRI_GEOM_COL,
                     sort_key=VRI_SORT_KEY, fields=VRI_FIELDS)


def fetch_protected_areas() -> gpd.GeoDataFrame:
    """Parks / ecological reserves over the transect — validation subset only."""
    x1, y1, x2, y2 = transect_bbox()
    cql = f"BBOX({PA_GEOM_COL},{x1:.0f},{y1:.0f},{x2:.0f},{y2:.0f},'{SERVICE_CRS}')"
    return fetch_wfs(PA_LAYER, cql, geom_col=PA_GEOM_COL,
                     sort_key=PA_SORT_KEY, fields=None)


# --------------------------------------------------------------------------- #
# Selection
# --------------------------------------------------------------------------- #
def stratified_sample(stands: gpd.GeoDataFrame, *, target_n: int = DEFAULT_TARGET_N,
                      seed: int = SEED) -> gpd.GeoDataFrame:
    """Sample ``target_n`` stands, stratified by BEC zone x easting quintile.

    Allocation is proportional to sqrt(stratum size) so the sparse montane and
    alpine strata — the elevation range Surrey did not have — stay represented
    instead of being swamped by the lowland CWH zone.
    """
    df = stands.copy()
    df["_east_bin"] = pd.qcut(df.geometry.centroid.x, N_EASTING_BINS,
                              labels=False, duplicates="drop")
    df["_stratum"] = (df["BEC_ZONE_CODE"].fillna("NA").astype(str)
                      + "|" + df["_east_bin"].astype(str))

    sizes = df["_stratum"].value_counts()
    weights = np.sqrt(sizes.astype(float))
    alloc = (weights / weights.sum() * target_n).round().astype(int)
    alloc = alloc.clip(lower=1, upper=sizes)  # never ask a stratum for more than it has

    # Rounding rarely lands exactly on target_n; settle the remainder on the
    # largest strata, which have the most left to give.
    while alloc.sum() != target_n:
        room = (sizes - alloc)
        if alloc.sum() < target_n:
            pick = room[room > 0].index[0] if (room > 0).any() else None
            if pick is None:
                break
            alloc[pick] += 1
        else:
            pick = alloc[alloc > 1].index[-1] if (alloc > 1).any() else None
            if pick is None:
                break
            alloc[pick] -= 1

    rng = np.random.default_rng(seed)
    picks = [g.sample(n=int(alloc[s]), random_state=int(rng.integers(1 << 31)))
             for s, g in df.groupby("_stratum") if alloc.get(s, 0) > 0]
    out = gpd.GeoDataFrame(pd.concat(picks), geometry="geometry", crs=df.crs)
    return out.drop(columns=["_east_bin", "_stratum"]).reset_index(drop=True)


def prepare_units(stands: gpd.GeoDataFrame, *, min_ha: float = MIN_STAND_HA,
                  target_n: int = DEFAULT_TARGET_N,
                  seed: int = SEED) -> gpd.GeoDataFrame:
    """Reproject, drop tiny stands, sample, and stamp the analysis-unit id.

    The id column is named ``objectid`` because that is what
    ``acquire_climate.CORRIDOR_ID`` reads — Phase 3b reuses the Phase 3 modules
    unchanged, which is the whole point of keeping the unit contract stable.
    """
    g = stands.to_crs(ANALYSIS_CRS).copy()
    # The service returns its own OBJECTID whether or not it was requested, and
    # GPKG field names are case-insensitive — so it collides with the lowercase
    # `objectid` the pipeline's unit contract expects. Keep it under a distinct
    # name for provenance rather than dropping it.
    if "OBJECTID" in g.columns:
        g = g.rename(columns={"OBJECTID": "vri_objectid"})
    g["geometry"] = g.geometry.buffer(0)          # heal any self-intersections
    g = g[g.geometry.is_valid & ~g.geometry.is_empty]
    g["area_ha"] = g.geometry.area / 1e4
    before = len(g)
    g = g[g["area_ha"] >= min_ha]
    logger.info("dropped %d stands under %.1f ha (%d remain)",
                before - len(g), min_ha, len(g))

    picked = stratified_sample(g, target_n=target_n, seed=seed)
    picked = picked.sort_values("area_ha", ascending=False).reset_index(drop=True)
    picked.insert(0, "objectid", np.arange(1, len(picked) + 1))
    return picked


# --------------------------------------------------------------------------- #
def run(out_gpkg: Path, *, target_n: int = DEFAULT_TARGET_N,
        min_ha: float = MIN_STAND_HA, seed: int = SEED,
        with_protected_areas: bool = True) -> dict:
    stands = fetch_vri_stands()
    logger.info("fetched %d treed VRI stands over the transect", len(stands))
    units = prepare_units(stands, min_ha=min_ha, target_n=target_n, seed=seed)

    out_gpkg.parent.mkdir(parents=True, exist_ok=True)
    units.to_file(out_gpkg, layer="stands_analysis", driver="GPKG")
    stands.to_crs(ANALYSIS_CRS).to_file(out_gpkg, layer="stands_all", driver="GPKG")

    pas = None
    if with_protected_areas:
        pas = fetch_protected_areas().to_crs(ANALYSIS_CRS)
        pas.to_file(out_gpkg, layer="protected_areas", driver="GPKG")
        logger.info("wrote %d protected areas (validation subset)", len(pas))

    extent = gpd.GeoDataFrame(
        geometry=[units.union_all().envelope], crs=ANALYSIS_CRS)
    extent.to_file(out_gpkg, layer="study_extent", driver="GPKG")
    logger.info("wrote %s", out_gpkg)
    return {"units": units, "all": stands, "protected_areas": pas}


def main() -> None:
    p = argparse.ArgumentParser(
        description="Fetch Phase 3b analysis units: VRI stands, Fraser Valley transect.")
    p.add_argument("--out", type=Path, default=paths.INTERIM / "phase3b" / "transect_stands.gpkg")
    p.add_argument("--target-n", type=int, default=DEFAULT_TARGET_N)
    p.add_argument("--min-ha", type=float, default=MIN_STAND_HA)
    p.add_argument("--seed", type=int, default=SEED)
    p.add_argument("--no-protected-areas", action="store_true")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    res = run(args.out, target_n=args.target_n, min_ha=args.min_ha, seed=args.seed,
              with_protected_areas=not args.no_protected_areas)
    u = res["units"]
    print("=" * 70)
    print(f"Phase 3b units: {len(u)} VRI stands -> {args.out}")
    print(f"  population   : {len(res['all'])} treed stands over the transect")
    print(f"  stand area ha: median {u.area_ha.median():.1f}  "
          f"p10 {u.area_ha.quantile(.1):.1f}  p90 {u.area_ha.quantile(.9):.1f}")
    x = u.geometry.centroid.x
    print(f"  east-west    : {(x.max() - x.min()) / 1000:.0f} km span")
    print("  BEC zone (elevation proxy):")
    for z, n in u["BEC_ZONE_CODE"].value_counts().items():
        print(f"    {z:6s} {n:4d}")
    print(f"  ClimateBC cost: {len(u)} stands x 5 periods = {len(u) * 5} calls "
          f"(~{len(u) * 5 / 46:.0f} h at 46/hour)")


if __name__ == "__main__":
    main()
