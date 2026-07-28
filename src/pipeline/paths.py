"""Canonical project paths, resolved from the source tree rather than the cwd.

Every other module and both walkthrough notebooks default their inputs and
outputs through here. The point is that ``data/interim/optical_2023.tif`` means
the same file whether you are running ``python -m src.pipeline.assemble`` from
the repo root, executing a notebook launched from ``~``, or importing the
package in a REPL somewhere else entirely.

The anchor is this file's own location, walked up two levels
(``src/pipeline/paths.py`` -> repo root). With the package installed in editable
mode that still points at the real working tree, so an absolute default is not a
frozen snapshot of wherever it was installed from.

Nothing here creates directories — writers call ``mkdir(parents=True)`` on the
specific path they are about to write, so a stray import never leaves empty
folders behind.
"""

from __future__ import annotations

from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

DATA = REPO / "data"
RAW = DATA / "raw"
INTERIM = DATA / "interim"
PROCESSED = DATA / "processed"

NOTEBOOKS = REPO / "notebooks"
DOCS = REPO / "docs"
LOGS = REPO / "logs"

# Frequently-referenced individual artifacts, named once so a rename is a
# one-line change rather than a grep across five modules.
CORRIDORS_RAW = RAW / "surrey" / "surrey_gin.gpkg"
CORRIDORS_CLEAN = INTERIM / "corridors_clean.gpkg"
CORRIDORS_ANALYSIS = INTERIM / "corridors_analysis.gpkg"
STUDY_EXTENT_JSON = INTERIM / "study_extent.json"
STUDY_EXTENT_GPKG = INTERIM / "study_extent.gpkg"
NDVI_COMPOSITE = INTERIM / "ndvi_composite.tif"
CLIMATE_CACHE = RAW / "climatebc"
CORRIDOR_CLIMATE = INTERIM / "corridor_climate.parquet"
CORRIDOR_NDVI = PROCESSED / "corridor_ndvi.gpkg"
FEATURES = PROCESSED / "features.parquet"


def optical(year: int) -> Path:
    """Sentinel-2 NDVI+SWCI composite for one summer."""
    return INTERIM / f"optical_{year}.tif"


def lst(year: int) -> Path:
    """Landsat land-surface-temperature composite for one summer."""
    return INTERIM / f"lst_{year}.tif"


__all__ = [
    "CLIMATE_CACHE", "CORRIDORS_ANALYSIS", "CORRIDORS_CLEAN", "CORRIDORS_RAW",
    "CORRIDOR_CLIMATE", "CORRIDOR_NDVI", "DATA", "DOCS", "FEATURES", "INTERIM",
    "LOGS", "NDVI_COMPOSITE", "NOTEBOOKS", "PROCESSED", "RAW", "REPO",
    "STUDY_EXTENT_GPKG", "STUDY_EXTENT_JSON", "lst", "optical",
]
