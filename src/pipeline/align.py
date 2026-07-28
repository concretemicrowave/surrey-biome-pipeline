"""Prepare corridor analysis geometry: CRS check + inward-buffer decontamination.

The raster and vectors are both already in EPSG:26910, so no reprojection is
needed here — but we assert it rather than assume it.

Pavement decontamination
------------------------
A Sentinel-2 pixel is 10 m. Pixels straddling a corridor edge blend canopy with
the surrounding urban matrix. Negatively buffering each corridor inward by a
fraction of a pixel removes those edge pixels so the NDVI reflects interior
canopy only.

But a full-pixel (10 m) inward buffer would erase the narrowest corridors
(target widths start at 10 m). So we:
  * default to a **half-pixel (5 m)** inward buffer, and
  * for any corridor whose buffered geometry collapses to empty, **retain the
    original geometry and flag it** ``too_thin=True`` — we still measure it, but
    the flag warns the value is edge-contaminated. The count of such corridors
    is itself a key finding (how many corridors are unmeasurable at 10 m).
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import geopandas as gpd
import rioxarray  # noqa: F401  (.rio accessor)

from . import paths

logger = logging.getLogger(__name__)

ANALYSIS_CRS_EPSG = 26910


def build_analysis_geometry(
    corridors: gpd.GeoDataFrame,
    raster_crs_epsg: int,
    *,
    inward_buffer_m: float = 5.0,
) -> gpd.GeoDataFrame:
    """Return corridors with an inward-buffered analysis geometry + too_thin flag."""
    if corridors.crs is None or corridors.crs.to_epsg() != ANALYSIS_CRS_EPSG:
        raise ValueError(f"Corridors must be EPSG:{ANALYSIS_CRS_EPSG}, got {corridors.crs}")
    if raster_crs_epsg != ANALYSIS_CRS_EPSG:
        raise ValueError(
            f"Raster CRS EPSG:{raster_crs_epsg} != analysis CRS EPSG:{ANALYSIS_CRS_EPSG}. "
            "Reproject the raster before aligning."
        )

    out = corridors.copy()
    original = out.geometry

    if inward_buffer_m > 0:
        buffered = original.buffer(-inward_buffer_m)
        too_thin = buffered.is_empty | buffered.isna()
        # Retain original geometry where the buffer collapsed the polygon.
        out["geometry"] = buffered.where(~too_thin, original)
        out["too_thin"] = too_thin.values
        logger.info(
            "inward buffer %.1f m: %d/%d corridors collapsed (retained original, flagged too_thin)",
            inward_buffer_m, int(too_thin.sum()), len(out),
        )
    else:
        out["too_thin"] = False
        logger.info("no inward buffer applied (inward_buffer_m=%.1f)", inward_buffer_m)

    return out


def run(
    corridors_gpkg: Path,
    raster_path: Path,
    out_gpkg: Path,
    *,
    corridor_layer: str = "corridors",
    inward_buffer_m: float = 5.0,
) -> gpd.GeoDataFrame:
    corridors = gpd.read_file(corridors_gpkg, layer=corridor_layer)
    raster_crs = rioxarray.open_rasterio(raster_path).rio.crs.to_epsg()
    analysis = build_analysis_geometry(corridors, raster_crs, inward_buffer_m=inward_buffer_m)

    out_gpkg.parent.mkdir(parents=True, exist_ok=True)
    analysis.to_file(out_gpkg, layer="corridors_analysis", driver="GPKG")
    logger.info("analysis geometry -> %s (%d features)", out_gpkg, len(analysis))
    return analysis


def main() -> None:
    p = argparse.ArgumentParser(description="Build corridor analysis geometry (inward buffer).")
    p.add_argument("--corridors", type=Path, default=paths.CORRIDORS_CLEAN)
    p.add_argument("--raster", type=Path, default=paths.NDVI_COMPOSITE)
    p.add_argument("--out", type=Path, default=paths.CORRIDORS_ANALYSIS)
    p.add_argument("--inward-buffer-m", type=float, default=5.0)
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )
    g = run(args.corridors, args.raster, args.out, inward_buffer_m=args.inward_buffer_m)
    print(f"analysis corridors: {len(g)}  |  too_thin flagged: {int(g['too_thin'].sum())}")


if __name__ == "__main__":
    main()
