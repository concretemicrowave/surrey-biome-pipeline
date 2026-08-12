"""Clean raw Surrey corridor attributes and derive the study extent.

Runs after ``acquire_vector`` and before any raster/climate acquisition:

* ``clean_corridors`` normalizes the two dirty source fields flagged during
  acquisition — ``ecological_value`` (typos + mixed case) and ``target_width_m``
  (stored as text) — without touching geometry.
* ``study_extent`` derives the exact spatial footprint every downstream module
  keys off: the dissolved corridor geometry (for ClimateBC point sampling and
  precise clipping) and a WGS84 bounding box (for Sentinel-2 STAC queries).
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import geopandas as gpd
import pandas as pd

from . import paths

logger = logging.getLogger(__name__)

ANALYSIS_CRS = "EPSG:26910"  # NAD83 / UTM Zone 10N (metres)
GEOGRAPHIC_CRS = "EPSG:4326"  # WGS84 lon/lat — required by STAC bbox queries

# Canonical categories for ecological_value, mapping the observed source noise
# ('Mdoerate', 'Modetate', 'moderate', 'low', 'High', ...) onto clean labels.
_ECO_VALUE_MAP = {
    "high": "High",
    "moderate": "Moderate",
    "mdoerate": "Moderate",   # source typo
    "modetate": "Moderate",   # source typo
    "moderat": "Moderate",    # defensive
    "low": "Low",
}


def clean_corridors(gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Normalize corridor attributes in place-safe fashion; geometry untouched."""
    out = gdf.copy()

    if "ecological_value" in out.columns:
        norm = out["ecological_value"].astype("string").str.strip().str.lower()
        mapped = norm.map(_ECO_VALUE_MAP)
        unmapped = norm.notna() & mapped.isna()
        if unmapped.any():
            logger.warning(
                "ecological_value: %d unmapped values left as NA: %s",
                int(unmapped.sum()), sorted(norm[unmapped].unique()),
            )
        out["ecological_value"] = pd.Categorical(
            mapped, categories=["Low", "Moderate", "High"], ordered=True
        )

    if "target_width_m" in out.columns:
        out["target_width_m"] = pd.to_numeric(
            out["target_width_m"], errors="coerce"
        ).astype("Int64")

    n_null_type = int(out["corridor_type"].isna().sum()) if "corridor_type" in out else 0
    if n_null_type:
        logger.info("corridor_type: %d null rows retained (flagged, not dropped)", n_null_type)

    return out


def study_extent(
    corridors: gpd.GeoDataFrame,
    *,
    buffer_m: float = 100.0,
) -> dict:
    """Derive study footprint + bounding boxes.

    Returns a dict with:
      * ``dissolved``  : single (Multi)Polygon of all corridors, EPSG:26910
      * ``bounds_26910``: [minx, miny, maxx, maxy] metres
      * ``bbox_4326``  : [minlon, minlat, maxlon, maxlat] for STAC queries
      * ``buffer_m``   : buffer applied to the bbox (not the dissolved geom)
    """
    if corridors.crs is None or corridors.crs.to_epsg() != 26910:
        corridors = corridors.to_crs(ANALYSIS_CRS)

    dissolved = corridors.geometry.union_all()  # shapely (Multi)Polygon
    bounds_m = list(corridors.total_bounds)

    # Buffer the footprint outward, then reproject to WGS84 so STAC scenes aren't
    # clipped tight to the corridor envelope.
    padded = gpd.GeoSeries([dissolved], crs=ANALYSIS_CRS).buffer(buffer_m)
    bbox_4326 = list(padded.to_crs(GEOGRAPHIC_CRS).total_bounds)

    return {
        "dissolved": dissolved,
        "bounds_26910": [round(float(v), 2) for v in bounds_m],
        "bbox_4326": [round(float(v), 6) for v in bbox_4326],
        "buffer_m": float(buffer_m),
    }


def run(
    in_gpkg: Path,
    out_dir: Path,
    *,
    corridor_layer: str = "corridors",
    buffer_m: float = 100.0,
) -> dict:
    """Clean corridors, derive extent, and persist artifacts to ``out_dir``."""
    out_dir.mkdir(parents=True, exist_ok=True)

    raw = gpd.read_file(in_gpkg, layer=corridor_layer)
    cleaned = clean_corridors(raw)
    cleaned.to_file(out_dir / "corridors_clean.gpkg", layer="corridors", driver="GPKG")

    extent = study_extent(cleaned, buffer_m=buffer_m)

    # Persist the dissolved footprint (for sampling/clip) and the STAC bbox.
    gpd.GeoDataFrame(geometry=[extent["dissolved"]], crs=ANALYSIS_CRS).to_file(
        out_dir / "study_extent.gpkg", layer="dissolved", driver="GPKG"
    )
    meta = {k: v for k, v in extent.items() if k != "dissolved"}
    (out_dir / "study_extent.json").write_text(json.dumps(meta, indent=2))
    logger.info("study extent written: bbox_4326=%s", meta["bbox_4326"])

    return {"cleaned": cleaned, "extent": extent}


def main() -> None:
    p = argparse.ArgumentParser(description="Clean corridors and derive study extent.")
    p.add_argument("--in-gpkg", type=Path, default=paths.CORRIDORS_RAW)
    p.add_argument("--out-dir", type=Path, default=paths.INTERIM)
    p.add_argument("--buffer-m", type=float, default=100.0, help="STAC bbox pad (metres).")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )

    res = run(args.in_gpkg, args.out_dir, buffer_m=args.buffer_m)
    c, e = res["cleaned"], res["extent"]
    print("=" * 60)
    print(f"Cleaned polygons: {len(c)} features")
    print(f"  ecological_value: {c['ecological_value'].value_counts(dropna=False).to_dict()}")
    print(f"  target_width_m  : dtype={c['target_width_m'].dtype}, "
          f"range [{c['target_width_m'].min()}, {c['target_width_m'].max()}] m")
    print("Study extent:")
    print(f"  bounds_26910 (m): {e['bounds_26910']}")
    print(f"  bbox_4326       : {e['bbox_4326']}  (+{e['buffer_m']:.0f} m pad)")


if __name__ == "__main__":
    main()
