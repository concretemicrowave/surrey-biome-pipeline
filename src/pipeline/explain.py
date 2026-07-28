"""Phase 3b explanatory model — what drives between-stand water stress?

The A-vs-B experiment (``experiment.py``) answers the *method* question: does
scale-free climate resolution beat a coarse grid? On the Fraser Valley transect
that answer is **no** — at a realistic 25 km grid the coarse model wins, because
stand-mean CDEI is nearly uncorrelated with the climate/elevation gradient
(Spearman |rho| <= 0.14). This module answers the follow-up: *then what does
drive it?*

It reuses the experiment's spatially-blocked, corridor-grouped CV verbatim and
compares predictor families:

* **climate**   — the same 14 climate-only predictors Model A uses (baseline).
* **terrain**   — slope, aspect (as northness/eastness vector components, the
  circular-safe way to average aspect over a polygon), within-stand ruggedness
  and elevation, derived here from the Copernicus GLO-30 DEM.
* **structure** — VRI stand attributes: age, height, crown closure, leading
  species (one-hot), BEC zone, broadleaf/conifer/mixed class, area.

Remote-sensing bands (NDVI/SWCI/LST) are deliberately **excluded** as predictors:
CDEI is built from them, so handing them to the model would be circular.

CLI:  ``python -m src.pipeline.explain -v``  (loads cached terrain; add
``--build-terrain`` to re-derive it from the DEM).
"""
from __future__ import annotations

import argparse
import logging
from pathlib import Path

import numpy as np
import pandas as pd

from . import paths
from .assemble import predictor_columns
from .experiment import blocked_cv, make_model, spatial_blocks
from .zonal import CORRIDOR_ID

logger = logging.getLogger(__name__)

TARGET = "tvwsi"
ANALYSIS_CRS = "EPSG:26910"
DEM_RES_M = 30.0

# Copernicus GLO-30 1x1-degree COG tiles (named by SW corner) covering the
# south-of-Fraser transect: lat N48/N49 x lon W123/W122.
DEM_TILES = [(48, -123), (48, -122), (49, -123), (49, -122)]

TERRAIN_COLS = ["elev_dem", "ruggedness", "slope_deg", "northness", "eastness"]
STRUCT_NUM = ["PROJ_AGE_1", "PROJ_HEIGHT_1", "CROWN_CLOSURE", "SPECIES_PCT_1", "area_ha"]
STRUCT_CAT = ["SPECIES_CD_1", "BEC_ZONE_CODE", "BCLCS_LEVEL_4"]


# --------------------------------------------------------------------------- #
# Terrain: slope / aspect / ruggedness from the Copernicus GLO-30 DEM
# --------------------------------------------------------------------------- #
def _dem_tile_url(lat: int, lon: int) -> str:
    ns, ew = ("N" if lat >= 0 else "S"), ("E" if lon >= 0 else "W")
    tile = f"{ns}{abs(lat):02d}_00_{ew}{abs(lon):03d}_00"
    return (f"/vsicurl/https://copernicus-dem-30m.s3.amazonaws.com/"
            f"Copernicus_DSM_COG_10_{tile}_DEM/Copernicus_DSM_COG_10_{tile}_DEM.tif")


def build_terrain(stands_gpkg: Path, layer: str, out_path: Path,
                  *, res_m: float = DEM_RES_M) -> pd.DataFrame:
    """Derive per-stand terrain predictors from Copernicus GLO-30 and cache them.

    Reads the DEM tiles straight from the AWS public COG bucket (the same tiles
    ``acquire_climate`` falls back to — no STAC search to time out), reprojects
    to EPSG:26910 at 30 m, computes slope and aspect, then zonal-aggregates to
    the stand polygons. Aspect is kept as northness/eastness = the downhill face
    unit vector, so a polygon mean is a proper circular average rather than a
    meaningless mean of degrees that wrap at 360.
    """
    import geopandas as gpd
    import rasterio
    import xarray as xr
    from exactextract import exact_extract
    from rasterio.merge import merge
    from rasterio.warp import reproject, Resampling

    stands = gpd.read_file(stands_gpkg, layer=layer).to_crs(ANALYSIS_CRS)
    pad = 300.0
    minx, miny, maxx, maxy = stands.total_bounds
    minx, miny, maxx, maxy = minx - pad, miny - pad, maxx + pad, maxy + pad

    srcs = []
    for la, lo in DEM_TILES:
        try:
            srcs.append(rasterio.open(_dem_tile_url(la, lo)))
        except Exception as exc:                      # noqa: BLE001 — tile may not exist
            logger.warning("DEM tile %d,%d unavailable: %s", la, lo, exc)
    if not srcs:
        raise RuntimeError("no Copernicus DEM tiles could be opened for the extent")
    mosaic, m_transform = merge(srcs)
    src_crs, src_nodata = srcs[0].crs, srcs[0].nodata
    for s in srcs:
        s.close()

    dst_w, dst_h = int((maxx - minx) / res_m), int((maxy - miny) / res_m)
    dst_transform = rasterio.transform.from_origin(minx, maxy, res_m, res_m)
    dem = np.full((dst_h, dst_w), np.nan, "float32")
    reproject(source=mosaic[0].astype("float32"), destination=dem,
              src_transform=m_transform, src_crs=src_crs,
              dst_transform=dst_transform, dst_crs=ANALYSIS_CRS,
              resampling=Resampling.bilinear, src_nodata=src_nodata, dst_nodata=np.nan)
    logger.info("DEM %s @ %.0f m, elev %.0f–%.0f m",
                dem.shape, res_m, np.nanmin(dem), np.nanmax(dem))

    # Rows increase southward, so north = -d/drow.
    drow, dcol = np.gradient(dem)
    dz_dnorth, dz_deast = -drow / res_m, dcol / res_m
    grad = np.hypot(dz_deast, dz_dnorth)
    slope_deg = np.degrees(np.arctan(grad))
    with np.errstate(invalid="ignore", divide="ignore"):
        northness = np.where(grad > 1e-6, -dz_dnorth / grad, 0.0)
        eastness = np.where(grad > 1e-6, -dz_deast / grad, 0.0)

    ys = np.arange(dst_h) * -res_m + (maxy - res_m / 2)
    xs = np.arange(dst_w) * res_m + (minx + res_m / 2)

    def _da(arr):
        return (xr.DataArray(arr, dims=("y", "x"), coords={"y": ys, "x": xs})
                .rio.write_crs(ANALYSIS_CRS).rio.write_transform(dst_transform))

    stk = xr.Dataset({"elev": _da(dem), "slope": _da(slope_deg),
                      "northness": _da(northness), "eastness": _da(eastness)}
                     ).rio.write_crs(ANALYSIS_CRS)
    ext = exact_extract(stk, stands, ["mean", "stdev"],
                        include_cols=["objectid"], output="pandas")

    out = pd.DataFrame({"objectid": ext["objectid"].astype(int),
                        "elev_dem": ext["elev_mean"],
                        "ruggedness": ext["elev_stdev"],   # within-stand elev sd
                        "slope_deg": ext["slope_mean"],
                        "northness": ext["northness_mean"],
                        "eastness": ext["eastness_mean"]})
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out.to_parquet(out_path, index=False)
    logger.info("wrote %s (%d stands)", out_path, len(out))
    return out


# --------------------------------------------------------------------------- #
# Assemble predictor families and score them under the SAME blocked CV
# --------------------------------------------------------------------------- #
def load_context(features_path: Path, terrain_path: Path,
                 stands_gpkg: Path, layer: str) -> tuple[pd.DataFrame, list[str]]:
    """Merge terrain + VRI structure onto the assembled panel; one-hot categoricals.

    Returns the enriched panel and the list of structure predictor columns
    (numeric attributes plus the one-hot species/BEC/land-cover indicators).
    """
    import geopandas as gpd

    df = pd.read_parquet(features_path)
    terr = pd.read_parquet(terrain_path)
    struct = gpd.read_file(stands_gpkg, layer=layer)[["objectid", *STRUCT_NUM[:-1],
                                                      *STRUCT_CAT, "area_ha"]]
    df = df.merge(terr, on="objectid", how="left").merge(struct, on="objectid", how="left")

    cat = pd.get_dummies(df[STRUCT_CAT], prefix=["sp", "bec", "lc"], dtype=float)
    df = pd.concat([df, cat], axis=1)
    structure_cols = STRUCT_NUM + list(cat.columns)
    return df, structure_cols


def families(df: pd.DataFrame, structure_cols: list[str]) -> dict[str, list[str]]:
    """The predictor families to compare, resolved against the columns present."""
    climate = predictor_columns(df)["climate_only"]
    terrain = [c for c in TERRAIN_COLS if c in df.columns]
    structure = [c for c in structure_cols if c in df.columns]
    return {
        "climate (baseline)": climate,
        "terrain": terrain,
        "structure": structure,
        "terrain+structure": terrain + structure,
        "terrain+structure+climate": terrain + structure + climate,
    }


def compare_families(df: pd.DataFrame, fams: dict[str, list[str]], *,
                     kind: str = "rf", n_blocks: int = 5, n_repeats: int = 5) -> pd.DataFrame:
    """Score every family under repeated spatially-blocked, corridor-grouped CV."""
    rows = []
    for name, feats in fams.items():
        feats = [c for c in feats if c in df.columns]
        per_fold, _ = blocked_cv(df, feats, kind=kind, n_blocks=n_blocks, n_repeats=n_repeats)
        rows.append({"family": name, "n_features": len(feats),
                     "rmse": float(per_fold["rmse"].mean()),
                     "r2": float(per_fold["r2"].mean()),
                     "frac_folds_positive": float((per_fold["r2"] > 0).mean())})
    return pd.DataFrame(rows)


def family_importance(df: pd.DataFrame, feats: list[str], *,
                      kind: str = "rf", block: int = 0, n_repeats: int = 20) -> pd.DataFrame:
    """Permutation importance scored on a held-out spatial block (not in-sample).

    Fitting and scoring on the same rows would reward memorised corridors; a
    held-out block asks which predictors actually help rank *unseen* stands.
    """
    from sklearn.inspection import permutation_importance

    feats = [c for c in feats if c in df.columns]
    test = spatial_blocks(df, n_blocks=5) == block
    model = make_model(kind).fit(df.loc[~test, feats], df.loc[~test, TARGET])
    pi = permutation_importance(model, df.loc[test, feats], df.loc[test, TARGET],
                                n_repeats=n_repeats, random_state=0)
    return (pd.DataFrame({"feature": feats, "importance": pi.importances_mean,
                          "sd": pi.importances_std})
            .sort_values("importance", ascending=False).reset_index(drop=True))


def orthogonality_report(df: pd.DataFrame) -> dict:
    """Why the climate gradient can't explain the target: variance axes + rho.

    Returns the between-stand vs between-year variance of CDEI (the target's
    dominant axis) and the Spearman correlation of stand-mean CDEI against the
    climate/elevation gradient (near zero — the crux of the whole result).
    """
    btwn_stand = float(df.groupby(CORRIDOR_ID)[TARGET].mean().var())
    btwn_year = float(df.groupby("year")[TARGET].mean().var())
    sm = df.groupby(CORRIDOR_ID).agg(
        tvwsi=(TARGET, "mean"), CMD=("CMD_sm", "mean"),
        Tmax=("Tmax_sm", "mean"), Eref=("Eref_sm", "mean"),
        elev=("elev_dem", "mean") if "elev_dem" in df else ("elev_m", "mean")).reset_index()
    rho = {c: float(sm[["tvwsi", c]].corr(method="spearman").iloc[0, 1])
           for c in ("CMD", "Tmax", "Eref", "elev")}
    return {"var_between_stand": btwn_stand, "var_between_year": btwn_year,
            "spatial_temporal_ratio": btwn_stand / btwn_year, "spearman": rho,
            "stand_means": sm}


def run(features_path: Path, terrain_path: Path, stands_gpkg: Path, layer: str,
        *, kind: str = "rf", n_blocks: int = 5, n_repeats: int = 5,
        build: bool = False) -> dict:
    """Full explanatory analysis, returning everything the notebook visualizes."""
    if build or not terrain_path.exists():
        build_terrain(stands_gpkg, layer, terrain_path)
    df, structure_cols = load_context(features_path, terrain_path, stands_gpkg, layer)
    fams = families(df, structure_cols)
    table = compare_families(df, fams, kind=kind, n_blocks=n_blocks, n_repeats=n_repeats)
    best = table.sort_values("r2", ascending=False).iloc[0]["family"]
    importance = family_importance(df, fams[best], kind=kind)
    return {"df": df, "families": fams, "table": table, "best": best,
            "importance": importance, "orthogonality": orthogonality_report(df)}


def main() -> None:
    p = argparse.ArgumentParser(description="What drives between-stand water stress (Phase 3b).")
    p.add_argument("--features", type=Path,
                   default=paths.PROCESSED / "features_phase3b.parquet")
    p.add_argument("--terrain", type=Path,
                   default=paths.INTERIM / "phase3b" / "terrain_stands.parquet")
    p.add_argument("--stands", type=Path,
                   default=paths.INTERIM / "phase3b" / "transect_stands.gpkg")
    p.add_argument("--layer", default="stands_analysis")
    p.add_argument("--build-terrain", action="store_true",
                   help="re-derive terrain from the Copernicus DEM (hits the network)")
    p.add_argument("--model", default="rf", choices=["rf", "gb"])
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(level=logging.INFO if args.verbose else logging.WARNING,
                        format="%(levelname)s %(name)s: %(message)s")
    res = run(args.features, args.terrain, args.stands, args.layer,
              kind=args.model, build=args.build_terrain)

    o = res["orthogonality"]
    print("=" * 74)
    print("What drives between-stand CDEI on the Fraser Valley transect?")
    print("=" * 74)
    print(f"target varies {o['spatial_temporal_ratio']:.0f}x more between stands than "
          f"between years (the inverse of Surrey)")
    print("stand-mean CDEI vs the spatial gradient (Spearman rho):")
    for k, v in o["spearman"].items():
        print(f"    {k:5s} {v:+.3f}")
    print("\npredictor family                 n   RMSE      R2     folds R2>0")
    print("-" * 66)
    for _, r in res["table"].iterrows():
        print(f"  {r.family:30s} {r.n_features:2d}  {r.rmse:.5f}  {r.r2:+.3f}   "
              f"{r.frac_folds_positive:5.0%}")
    print(f"\nbest family: {res['best']}")
    print("permutation importance on a held-out spatial block (top 8):")
    for _, r in res["importance"].head(8).iterrows():
        print(f"    {r.feature:22s} {r.importance:+.5f}")


if __name__ == "__main__":
    main()
