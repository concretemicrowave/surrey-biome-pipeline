"""Coverage-weighted zonal statistics: one NDVI value per corridor polygon.

Uses ``exactextract`` so partial edge pixels are area-weighted by the exact
fraction of each pixel inside the polygon — essential for narrow corridors that
span only ~1 pixel, where whole-pixel counting badly biases the result.

Outputs, per corridor:
  * ndvi_mean / ndvi_median / ndvi_stdev / ndvi_min / ndvi_max
  * valid_px      — coverage-weighted count of valid (non-NaN) pixels
  * expected_px   — polygon_area / pixel_area (10 m -> 100 m^2/pixel)
  * coverage_frac — valid_px / expected_px  (data completeness inside the polygon)

``coverage_frac`` / ``valid_px`` are the key diagnostic: they reveal which
corridors are too thin to yield a trustworthy NDVI at 10 m resolution.

Phase 3 generalization
----------------------
:func:`zonal_bands` extends the same coverage-weighted extraction to any raster
and any band naming, at any pixel size, so one function serves the Phase 2 NDVI
composite (10 m, 1 band), the Phase 3 optical composite (20 m, ndvi + swci) and
the Landsat LST composite (30 m, 1 band). ``coverage_frac`` is recomputed from
the actual pixel area each time — a 30 m Landsat pixel is 9x the area of a 10 m
Sentinel-2 one, and reusing the Phase 2 constant would silently understate
thermal coverage by that factor.

Note the join key: the source ``id`` field is **not** unique (153 polygons share
144 ids — several corridors are split into parts), so ``objectid`` is what every
Phase 3 table joins on.
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import geopandas as gpd
import pandas as pd
import rioxarray  # noqa: F401
from exactextract import exact_extract

from . import paths

logger = logging.getLogger(__name__)

PIXEL_AREA_M2 = 100.0  # 10 m Sentinel-2 pixel
SCALAR_OPS = ["mean", "median", "stdev", "min", "max", "count"]


def zonal_ndvi(
    corridors: gpd.GeoDataFrame,
    raster_path: Path,
    *,
    id_col: str = "id",
) -> gpd.GeoDataFrame:
    """Compute coverage-weighted NDVI stats per corridor polygon.

    exactextract can't serialize pandas Categorical/boolean attribute columns, so
    we extract on geometry only and join the corridor attributes back by position
    (exact_extract preserves input feature order).
    """
    geom_only = corridors[[corridors.geometry.name]].copy()
    stats = exact_extract(
        str(raster_path), geom_only, SCALAR_OPS, output="pandas",
    ).rename(columns={
        "mean": "ndvi_mean", "median": "ndvi_median", "stdev": "ndvi_stdev",
        "min": "ndvi_min", "max": "ndvi_max", "count": "valid_px",
    })

    attr_cols = [c for c in (id_col, "corridor_type", "ecological_value",
                             "target_width_m", "too_thin") if c in corridors.columns]
    attrs = corridors[attr_cols].reset_index(drop=True)
    stats = attrs.join(stats.reset_index(drop=True))

    out = gpd.GeoDataFrame(
        stats, geometry=corridors.geometry.reset_index(drop=True), crs=corridors.crs
    )
    out["expected_px"] = out.geometry.area / PIXEL_AREA_M2
    out["coverage_frac"] = (out["valid_px"] / out["expected_px"]).clip(upper=1.0)
    return out


CORRIDOR_ID = "objectid"
ATTR_COLS = ("objectid", "id", "corridor_type", "ecological_value",
             "target_width_m", "too_thin")


def zonal_bands(
    corridors: gpd.GeoDataFrame,
    raster_path: Path,
    band_names: list[str],
    *,
    pixel_size_m: float,
    id_col: str = CORRIDOR_ID,
) -> pd.DataFrame:
    """Coverage-weighted per-corridor stats for a multi-band raster.

    ``band_names`` maps positionally onto exactextract's ``band_1``/``band_2``
    output columns, so it must match the order the bands were written in.
    Returns a plain DataFrame (no geometry) keyed by ``id_col`` — Phase 3 joins
    many of these together and carrying 153 polygons through each one is waste.
    """
    geom_only = corridors[[corridors.geometry.name]].copy()
    raw = exact_extract(str(raster_path), geom_only, SCALAR_OPS, output="pandas")

    out = corridors[[c for c in ATTR_COLS if c in corridors.columns]].reset_index(drop=True)
    # exactextract prefixes columns with band_N_ only for multi-band rasters;
    # a single-band raster yields bare "mean"/"stdev"/... names.
    n_bands = len([c for c in raw.columns if c == "mean" or c.endswith("_mean")])
    if n_bands != len(band_names):
        raise ValueError(f"{raster_path} has {n_bands} bands, got {len(band_names)} names")

    for i, name in enumerate(band_names, start=1):
        prefix = f"band_{i}_" if f"band_{i}_mean" in raw.columns else ""
        for op in SCALAR_OPS:
            out[f"{name}_{op}"] = raw[f"{prefix}{op}"].to_numpy()
        out = out.rename(columns={f"{name}_count": f"{name}_valid_px"})

    area = corridors.geometry.area.reset_index(drop=True)
    out["expected_px"] = area / (pixel_size_m ** 2)
    lead = band_names[0]
    out["coverage_frac"] = (out[f"{lead}_valid_px"] / out["expected_px"]).clip(upper=1.0)
    return out


def run_multi(
    corridors_gpkg: Path,
    rasters: dict[Path, tuple[list[str], float]],
    *,
    corridor_layer: str = "corridors_analysis",
    id_col: str = CORRIDOR_ID,
) -> pd.DataFrame:
    """Extract several rasters onto the same corridors and join on ``id_col``.

    ``rasters`` maps path -> (band names, pixel size in metres). Each raster
    keeps its own ``coverage_frac`` (suffixed by its first band name) because
    optical and thermal coverage differ substantially — Landsat's sparse clear
    summer revisit leaves thin corridors far worse covered than Sentinel-2 does.
    """
    corridors = gpd.read_file(corridors_gpkg, layer=corridor_layer)
    merged: pd.DataFrame | None = None
    for path, (names, px) in rasters.items():
        tab = zonal_bands(corridors, path, names, pixel_size_m=px, id_col=id_col)
        tab = tab.rename(columns={"coverage_frac": f"coverage_frac_{names[0]}",
                                  "expected_px": f"expected_px_{names[0]}"})
        if merged is None:
            merged = tab
        else:
            keep = [id_col] + [c for c in tab.columns if c not in merged.columns]
            merged = merged.merge(tab[keep], on=id_col, how="outer")
        logger.info("zonal %s: %d corridors x %s", path.name, len(tab), names)
    return merged


def run(
    corridors_gpkg: Path,
    raster_path: Path,
    out_gpkg: Path,
    *,
    corridor_layer: str = "corridors_analysis",
    id_col: str = "id",
) -> gpd.GeoDataFrame:
    corridors = gpd.read_file(corridors_gpkg, layer=corridor_layer)
    stats = zonal_ndvi(corridors, raster_path, id_col=id_col)

    out_gpkg.parent.mkdir(parents=True, exist_ok=True)
    stats.to_file(out_gpkg, layer="corridor_ndvi", driver="GPKG")
    # also a flat CSV (drop geometry) for quick inspection / Phase 3 join
    stats.drop(columns="geometry").to_csv(out_gpkg.with_suffix(".csv"), index=False)
    logger.info("zonal NDVI -> %s (%d corridors)", out_gpkg, len(stats))
    return stats


def main() -> None:
    p = argparse.ArgumentParser(description="Per-corridor coverage-weighted NDVI zonal stats.")
    p.add_argument("--corridors", type=Path, default=paths.CORRIDORS_ANALYSIS)
    p.add_argument("--raster", type=Path, default=paths.NDVI_COMPOSITE)
    p.add_argument("--out", type=Path, default=paths.CORRIDOR_NDVI)
    p.add_argument("--layer", default="corridors_analysis")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )
    s = run(args.corridors, args.raster, args.out, corridor_layer=args.layer)

    # ---- integration-test summary ----
    print("=" * 64)
    print(f"Per-corridor NDVI computed: {len(s)} corridors")
    print(f"  NDVI mean  : median={s['ndvi_mean'].median():.3f}  "
          f"range=[{s['ndvi_mean'].min():.3f}, {s['ndvi_mean'].max():.3f}]")
    print(f"  valid_px   : median={s['valid_px'].median():.1f}  "
          f"min={s['valid_px'].min():.1f}  max={s['valid_px'].max():.1f}")
    thin = s["valid_px"] < 5
    print(f"  coverage   : median={s['coverage_frac'].median():.2f}  "
          f"| corridors with <5 valid px (unreliable): {int(thin.sum())}")
    if "too_thin" in s.columns:
        print(f"  too_thin flagged (buffer-collapsed): {int(s['too_thin'].sum())}")
    if "ecological_value" in s.columns:
        print("  NDVI mean by ecological_value:")
        grp = s.groupby("ecological_value", observed=True)["ndvi_mean"].agg(["mean", "count"])
        for val, row in grp.iterrows():
            print(f"    {val:<10} n={int(row['count']):<4} mean_ndvi={row['mean']:.3f}")


if __name__ == "__main__":
    main()
