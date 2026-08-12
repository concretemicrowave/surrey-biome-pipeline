"""Acquire Surrey Green Infrastructure Network vector layers from the City of
Surrey OpenData ArcGIS MapServer.

These polygons are the spatial anchor of the whole pipeline: every downstream
step (Sentinel-2 STAC bbox queries, ClimateBC point sampling, zonal
aggregation) aligns to these exact corridor boundaries.

Source service (public):
    https://gisservices.surrey.ca/arcgis/rest/services/OpenData/MapServer

Design notes
------------
* The data is served natively in **EPSG:26910 (NAD83 / UTM Zone 10N)** — which is
  our analysis CRS — so we request ``outSR=26910`` and no reprojection is needed.
* We use the **polygon** "Green Infrastructure Network Corridors" layer (id 1),
  NOT the polyline "Ecosystem Corridors" layer (id 169). Rasters can only be
  masked/zonal-aggregated inside polygons; the polyline centerlines would first
  need buffering. Layer 1 is already polygonized and carries richer attributes
  (CORRIDOR_TYPE, TARGET_WIDTH_M, ECOLOGICAL_VALUE, RISK_OF_DEVELOPMENT).
* ArcGIS Feature/Map services cap results (``maxRecordCount``, here 2000). We page
  with ``resultOffset``/``resultRecordCount`` until the service stops reporting
  ``exceededTransferLimit`` and a short page is returned.
"""

from __future__ import annotations

import argparse
import logging
from dataclasses import dataclass
from pathlib import Path

import geopandas as gpd
import requests
from shapely.validation import make_valid

from . import paths

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #
SURREY_MAPSERVER = (
    "https://gisservices.surrey.ca/arcgis/rest/services/OpenData/MapServer"
)
ANALYSIS_CRS = "EPSG:26910"  # NAD83 / UTM Zone 10N (metres) — project analysis CRS
DEFAULT_PAGE_SIZE = 1000
REQUEST_TIMEOUT = 60  # seconds


@dataclass(frozen=True)
class LayerSpec:
    """A single ArcGIS MapServer layer we want to pull."""

    key: str            # short slug used for output filenames / gpkg layer name
    layer_id: int       # MapServer layer id
    name: str           # human-readable service layer name
    geometry: str       # expected geometry type (documentation / sanity only)


# The layers this project depends on. Corridors + aquatic hubs are the defaults
# requested for Phase 2; the others are available for later use.
SURREY_LAYERS: dict[str, LayerSpec] = {
    "corridors": LayerSpec("corridors", 1, "Green Infrastructure Network Corridors", "Polygon"),
    "aquatic_hubs": LayerSpec("aquatic_hubs", 168, "Aquatic Hubs", "Polygon"),
    "terrestrial_hubs": LayerSpec("terrestrial_hubs", 171, "Terrestrial Hubs", "Polygon"),
    "ecosystem_sites": LayerSpec("ecosystem_sites", 170, "Ecosystem Sites", "Polygon"),
    # Linear centerlines — kept for reference; needs buffering before raster use.
    "ecosystem_corridors_lines": LayerSpec(
        "ecosystem_corridors_lines", 169, "Ecosystem Corridors (centerlines)", "Polyline"
    ),
}
DEFAULT_LAYERS = ["corridors", "aquatic_hubs"]


# --------------------------------------------------------------------------- #
# Fetching
# --------------------------------------------------------------------------- #
def _query_page(
    layer_id: int,
    offset: int,
    page_size: int,
    out_sr: int,
    where: str,
    session: requests.Session,
) -> dict:
    """Fetch one page of features as a GeoJSON FeatureCollection dict."""
    params = {
        "where": where,
        "outFields": "*",
        "outSR": out_sr,
        "returnGeometry": "true",
        "resultOffset": offset,
        "resultRecordCount": page_size,
        "f": "geojson",
    }
    url = f"{SURREY_MAPSERVER}/{layer_id}/query"
    resp = session.get(url, params=params, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def fetch_layer(
    spec: LayerSpec,
    *,
    out_sr: int = 26910,
    page_size: int = DEFAULT_PAGE_SIZE,
    where: str = "1=1",
    session: requests.Session | None = None,
) -> gpd.GeoDataFrame:
    """Fetch a full ArcGIS layer, paging until all features are retrieved.

    Returns a GeoDataFrame in ``EPSG:{out_sr}`` with validated geometries.
    """
    session = session or requests.Session()
    features: list[dict] = []
    offset = 0

    while True:
        fc = _query_page(spec.layer_id, offset, page_size, out_sr, where, session)
        page = fc.get("features", [])
        features.extend(page)
        exceeded = fc.get("exceededTransferLimit", False)
        logger.info(
            "layer %s (%s): fetched %d (total %d)%s",
            spec.layer_id, spec.key, len(page), len(features),
            " [more pending]" if exceeded else "",
        )
        # Stop when the service signals no more data or returns a short page.
        if not exceeded and len(page) < page_size:
            break
        if not page:  # defensive: never loop forever on an empty page
            break
        offset += page_size

    if not features:
        raise RuntimeError(f"Layer {spec.layer_id} ({spec.key}) returned no features")

    gdf = gpd.GeoDataFrame.from_features(features, crs=f"EPSG:{out_sr}")
    return _clean(gdf, spec)


def _clean(gdf: gpd.GeoDataFrame, spec: LayerSpec) -> gpd.GeoDataFrame:
    """Repair invalid geometries, drop empties/nulls, tidy column names."""
    n0 = len(gdf)
    gdf = gdf[~gdf.geometry.is_empty & gdf.geometry.notna()].copy()

    invalid = ~gdf.geometry.is_valid
    if invalid.any():
        logger.info("layer %s: repairing %d invalid geometries", spec.key, int(invalid.sum()))
        gdf.loc[invalid, "geometry"] = gdf.loc[invalid, "geometry"].apply(make_valid)

    # Standardize attribute names to lowercase snake (ArcGIS returns UPPERCASE and
    # dotted 'SHAPE.AREA'/'SHAPE.LEN'); keeps downstream column references predictable.
    gdf = gdf.rename(
        columns={c: c.replace(".", "_").lower() for c in gdf.columns if c != "geometry"}
    )

    if n0 != len(gdf):
        logger.info("layer %s: dropped %d empty/null geometries", spec.key, n0 - len(gdf))
    return gdf


# --------------------------------------------------------------------------- #
# Persistence
# --------------------------------------------------------------------------- #
def save_layer(gdf: gpd.GeoDataFrame, spec: LayerSpec, out_dir: Path) -> Path:
    """Write a layer as GeoJSON (portable) and into a shared GeoPackage."""
    out_dir.mkdir(parents=True, exist_ok=True)
    geojson_path = out_dir / f"surrey_{spec.key}.geojson"
    gpkg_path = out_dir / "surrey_gin.gpkg"
    gdf.to_file(geojson_path, driver="GeoJSON")
    gdf.to_file(gpkg_path, layer=spec.key, driver="GPKG")
    logger.info("saved %s: %d features -> %s", spec.key, len(gdf), geojson_path.name)
    return geojson_path


def acquire(
    layer_keys: list[str],
    out_dir: Path,
    *,
    out_sr: int = 26910,
    page_size: int = DEFAULT_PAGE_SIZE,
) -> dict[str, gpd.GeoDataFrame]:
    """Fetch and persist the requested layers; return them keyed by slug."""
    session = requests.Session()
    results: dict[str, gpd.GeoDataFrame] = {}
    for key in layer_keys:
        if key not in SURREY_LAYERS:
            raise KeyError(f"Unknown layer '{key}'. Choices: {sorted(SURREY_LAYERS)}")
        spec = SURREY_LAYERS[key]
        gdf = fetch_layer(spec, out_sr=out_sr, page_size=page_size, session=session)
        save_layer(gdf, spec, out_dir)
        results[key] = gdf
    return results


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def _summarize(key: str, gdf: gpd.GeoDataFrame) -> None:
    b = gdf.total_bounds
    print(f"\n[{key}]  {len(gdf)} features  |  CRS {gdf.crs.to_string()}")
    print(f"  geom types : {sorted(gdf.geom_type.unique())}")
    print(f"  bounds     : x[{b[0]:.0f}, {b[2]:.0f}]  y[{b[1]:.0f}, {b[3]:.0f}]")
    if "corridor_type" in gdf.columns:
        print(f"  corridor_type counts: {gdf['corridor_type'].value_counts().to_dict()}")
    if "target_width_m" in gdf.columns:
        print(f"  target_width_m: min={gdf['target_width_m'].min()} max={gdf['target_width_m'].max()}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Acquire Surrey GIN vector layers.")
    parser.add_argument(
        "--layers", nargs="+", default=DEFAULT_LAYERS,
        choices=sorted(SURREY_LAYERS), help="Layer slugs to fetch.",
    )
    parser.add_argument(
        "--out-dir", type=Path, default=paths.RAW / "surrey",
        help="Output directory (default: data/raw/surrey).",
    )
    parser.add_argument("--out-sr", type=int, default=26910, help="Output EPSG (default 26910).")
    parser.add_argument("--page-size", type=int, default=DEFAULT_PAGE_SIZE)
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )

    results = acquire(args.layers, args.out_dir, out_sr=args.out_sr, page_size=args.page_size)
    print("=" * 60)
    print(f"Acquired {len(results)} layer(s) -> {args.out_dir}")
    for key, gdf in results.items():
        _summarize(key, gdf)


if __name__ == "__main__":
    main()
