"""Assemble the Phase 3 ML table: CDEI target + ClimateBC predictors, per corridor-summer.

This is the join point of the two halves of the pipeline. It turns four summers
of raster composites into the water-stress target, attaches the scale-free
climate predictors, and writes one tidy row per corridor x summer.

The target: CDEI
-----------------
``CDEI = d(SWCI, NDVI) / RLST``

* **d(SWCI, NDVI)** — perpendicular distance from a corridor's (NDVI, SWCI)
  position to the *dry edge*, the lower envelope of SWCI as a function of NDVI.
  A corridor sitting far above the dry edge holds more water than the driest
  corridor of comparable greenness; one sitting on it is as dry as that
  greenness gets. Positive = wetter.
* **RLST** — the corridor's summer land surface temperature over its own
  multi-summer mean, **in Kelvin**. Kelvin, not Celsius, because a ratio is only
  meaningful on an absolute scale; the cost is that the modulation is gentle by
  construction (summer LST varies a few percent in K), which is reported rather
  than hidden. Dividing by it penalizes corridors that ran hot *for themselves*
  in a given summer.

The dry edge is fit **across all corridor-summers at once**, not per year: a
per-year edge would re-zero the index every summer and erase exactly the
between-year stress signal the experiment is trying to predict.

Why corridor-level and not pixel-level
--------------------------------------
NDVI/SWCI (20 m Sentinel-2) and LST (30 m Landsat, 100 m native thermal) do not
share a grid, and the analysis unit is the corridor polygon regardless. Each
band is aggregated to corridors with coverage-weighted zonal stats *first*, and
the index algebra happens on those corridor values. That keeps every operation
at the unit the hypothesis is stated in and avoids inventing thermal detail the
sensor never resolved.

Predictor groups (PHASE3_PLAN §2 — leakage discipline)
------------------------------------------------------
* ``CLIMATE_ONLY``  — ClimateBC variables, their anomalies vs the 1961–1990
  normal, log-precipitation and Mahalanobis climate novelty. **This group alone
  is used for the A-vs-B test.** Elevation is deliberately excluded: it is a DEM
  input to ClimateBC, not a climate variable, and handing it to the model would
  let Model A win on terrain rather than on climate.
* ``RS_AUGMENTED`` — adds RLST. Secondary variant only. CDEI is itself
  remote-sensing derived, so an RS predictor against an RS target confounds the
  resolution question the experiment exists to answer.
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import numpy as np
import pandas as pd

from .zonal import CORRIDOR_ID, run_multi

from . import paths

logger = logging.getLogger(__name__)

KELVIN_TO_C = 273.15
OPTICAL_PX_M, THERMAL_PX_M = 20.0, 30.0

# ClimateBC seasonal predictors carried into the model (annual variables join in
# automatically if a varYSM=Y pass has been run).
CLIMATE_RAW = ["Tmax_sm", "Tmin_sm", "PPT_sm", "Rad_sm", "Eref_sm", "CMD_sm", "DD18_sm"]
# Variables that get an anomaly-vs-normal twin. Radiation is near-constant
# between summers at one latitude, so it earns a level but not an anomaly.
CLIMATE_ANOM = ["Tmax_sm", "Tmin_sm", "PPT_sm", "Eref_sm", "CMD_sm"]

NORMAL_PRD = "Normal_1961_1990"


# --------------------------------------------------------------------------- #
# Target construction
# --------------------------------------------------------------------------- #
def zonal_year(corridors_gpkg: Path, interim: Path, year: int,
               *, corridor_layer: str = "corridors_analysis") -> pd.DataFrame:
    """Per-corridor NDVI, SWCI and LST for one summer."""
    rasters = {
        interim / f"optical_{year}.tif": (["ndvi", "swci"], OPTICAL_PX_M),
        interim / f"lst_{year}.tif": (["lst"], THERMAL_PX_M),
    }
    missing = [p for p in rasters if not p.exists()]
    if missing:
        raise FileNotFoundError(f"summer {year} missing composites: {missing}")
    tab = run_multi(corridors_gpkg, rasters, corridor_layer=corridor_layer)
    tab["year"] = year
    return tab


def dry_edge(ndvi: np.ndarray, swci: np.ndarray, *, n_bins: int = 12,
             q: float = 0.05, min_per_bin: int = 8) -> tuple[float, float]:
    """Fit ``SWCI_dry = a + b * NDVI`` — the lower envelope of the feature space.

    Bins on NDVI and takes a low quantile (not the raw minimum) of SWCI in each
    bin before the least-squares fit. The raw minimum would chase a single
    outlier pixel-aggregate per bin; the 5th percentile tracks the edge while
    staying robust. Sparse bins are dropped rather than allowed to tilt the line.
    """
    ok = np.isfinite(ndvi) & np.isfinite(swci)
    ndvi, swci = ndvi[ok], swci[ok]
    if len(ndvi) < n_bins * min_per_bin:
        n_bins = max(3, len(ndvi) // min_per_bin)

    edges = np.quantile(ndvi, np.linspace(0, 1, n_bins + 1))
    xs, ys = [], []
    for lo, hi in zip(edges[:-1], edges[1:]):
        sel = (ndvi >= lo) & (ndvi <= hi)
        if sel.sum() >= min_per_bin:
            xs.append(ndvi[sel].mean())
            ys.append(np.quantile(swci[sel], q))
    if len(xs) < 3:
        raise RuntimeError(f"dry edge underdetermined: only {len(xs)} usable NDVI bins")

    b, a = np.polyfit(np.asarray(xs), np.asarray(ys), 1)
    logger.info("dry edge: SWCI = %.4f + %.4f * NDVI  (%d bins, q=%.2f)", a, b, len(xs), q)
    return float(a), float(b)


def compute_tvwsi(df: pd.DataFrame, *, n_bins: int = 12, q: float = 0.05,
                  min_per_bin: int = 8) -> pd.DataFrame:
    """Add ``dry_dist``, ``rlst`` and ``tvwsi`` to a corridor x year table."""
    out = df.copy()
    a, b = dry_edge(out["ndvi_mean"].to_numpy(), out["swci_mean"].to_numpy(),
                    n_bins=n_bins, q=q, min_per_bin=min_per_bin)
    out["dry_edge_a"], out["dry_edge_b"] = a, b
    # Perpendicular distance to the line, signed positive on the wet side.
    out["dry_dist"] = (out["swci_mean"] - (a + b * out["ndvi_mean"])) / np.sqrt(1 + b ** 2)

    lst_k = out["lst_mean"] + KELVIN_TO_C
    baseline = lst_k.groupby(out[CORRIDOR_ID]).transform("mean")
    out["lst_k"] = lst_k
    out["rlst"] = lst_k / baseline
    out["tvwsi"] = out["dry_dist"] / out["rlst"]

    spread = out["rlst"].max() - out["rlst"].min()
    logger.info("RLST range %.4f–%.4f (spread %.4f); CDEI range %.4f–%.4f",
                out["rlst"].min(), out["rlst"].max(), spread,
                out["tvwsi"].min(), out["tvwsi"].max())
    return out


# --------------------------------------------------------------------------- #
# Predictor engineering
# --------------------------------------------------------------------------- #
def climate_features(climate: pd.DataFrame) -> pd.DataFrame:
    """Split the climate panel into per-year rows plus anomalies vs the normal.

    ``climate`` is the ``corridor_climate.parquet`` panel: one row per corridor x
    period, the normal period included. Returns one row per corridor x year with
    levels, anomalies, log-precipitation and the normal-period levels retained
    for the novelty computation.
    """
    climate = climate.rename(columns={"corridor_id": CORRIDOR_ID})
    norm = climate[climate["prd"] == NORMAL_PRD]
    yearly = climate[climate["year"].notna()].copy()
    if norm.empty or yearly.empty:
        raise RuntimeError("climate panel needs both the normal period and >=1 year")

    present = [c for c in CLIMATE_RAW if c in climate.columns]
    anom_vars = [c for c in CLIMATE_ANOM if c in present]
    norm_small = norm[[CORRIDOR_ID] + present].rename(
        columns={c: f"{c}_norm" for c in present})

    out = yearly.merge(norm_small, on=CORRIDOR_ID, how="inner")
    for c in anom_vars:
        out[f"{c}_anom"] = out[c] - out[f"{c}_norm"]
    if "PPT_sm" in present:
        out["logPPT_sm"] = np.log1p(out["PPT_sm"].clip(lower=0))

    out["year"] = out["year"].astype(int)
    return out


def mahalanobis_novelty(df: pd.DataFrame, cols: list[str]) -> pd.Series:
    """How unusual each corridor-year's climate is, relative to the 1961–1990 normal.

    The displacement is each corridor's own departure from its own normal
    (``x - x_norm``), so this measures *climatic* novelty and not merely an
    unusual location.

    The scaling matrix is the covariance **of those departures**, not the
    spatial covariance of the normals themselves. That distinction is not
    cosmetic. Over a study area ~30 km across on a flat delta, the 1961–1990
    normals barely vary between corridors at all, so their spatial covariance is
    near-singular; scaling by it inflates the distances by an order of magnitude
    (median ~14, 95th percentile ~59 for a 5-variable distance — values that
    should be impossible) and what it actually ranks is which corridor sits in an
    unusual *place*, which is not the question. Scaling by the spread of the
    departures asks the intended question: how far is this corridor-year from
    baseline, measured against how far departures typically run.

    A ridge is added before inversion because several ClimateBC variables remain
    strongly collinear even after differencing.
    """
    ref = df[[f"{c}_norm" for c in cols]].to_numpy(dtype=float)
    x = df[cols].to_numpy(dtype=float)
    delta = x - ref
    mu = np.nanmean(delta, axis=0)
    centred = delta - mu

    cov = np.atleast_2d(np.cov(centred, rowvar=False))
    # Ridge scaled to the covariance's own magnitude: enough to make the inverse
    # well-conditioned, small enough not to distort the ranking.
    ridge = 1e-6 * float(np.trace(cov)) / max(cov.shape[0], 1)
    vi = np.linalg.pinv(cov + ridge * np.eye(cov.shape[0]))

    d2 = np.einsum("ij,jk,ik->i", centred, vi, centred)
    return pd.Series(np.sqrt(np.clip(d2, 0, None)), index=df.index)


def predictor_columns(df: pd.DataFrame) -> dict[str, list[str]]:
    """The two disjoint predictor groups, resolved against what's in ``df``."""
    climate_only = [c for c in df.columns
                    if c in CLIMATE_RAW
                    or c.endswith("_anom")
                    or c in ("logPPT_sm", "novelty")]
    return {"climate_only": sorted(climate_only),
            "rs_augmented": sorted(climate_only + [c for c in ("rlst",) if c in df])}


def corridor_geometry(corridors_gpkg: Path, corridor_layer: str) -> pd.DataFrame:
    """Projected coordinates and area per corridor, in EPSG:26910 metres.

    Downstream this is what the *spatial* machinery keys off: KMeans blocking
    for the CV folds and the coarse-cell assignment that defines Model B. Both
    need metres, so they take the analysis CRS rather than the lat/lon the API
    round-tripped through.
    """
    import geopandas as gpd
    g = gpd.read_file(corridors_gpkg, layer=corridor_layer).to_crs("EPSG:26910")
    pt = g.geometry.representative_point()
    return pd.DataFrame({CORRIDOR_ID: g[CORRIDOR_ID].to_numpy(),
                         "x_m": pt.x.to_numpy(), "y_m": pt.y.to_numpy(),
                         "area_m2": g.geometry.area.to_numpy()})


# --------------------------------------------------------------------------- #
def run(
    corridors_gpkg: Path,
    interim: Path,
    out_path: Path,
    *,
    years: tuple[int, ...] = (2022, 2023, 2024, 2025),
    climate_parquet: Path | None = None,
    corridor_layer: str = "corridors_analysis",
) -> pd.DataFrame:
    frames = [zonal_year(corridors_gpkg, interim, y, corridor_layer=corridor_layer)
              for y in years]
    rs = pd.concat(frames, ignore_index=True)
    logger.info("zonal target table: %d corridor-summer rows across %d summers",
                len(rs), len(years))
    rs = compute_tvwsi(rs)

    climate_parquet = climate_parquet or (interim / "corridor_climate.parquet")
    climate = pd.read_parquet(climate_parquet)
    feats = climate_features(climate)

    have_years = sorted(set(feats["year"]) & set(years))
    if not have_years:
        raise RuntimeError(f"climate panel covers {sorted(set(feats['year']))}, "
                           f"target covers {list(years)} — no overlap")
    if len(have_years) < len(years):
        logger.warning("climate covers only %s of the %d target summers — "
                       "the ML table is restricted to those",
                       have_years, len(years))

    merged = rs.merge(feats, on=[CORRIDOR_ID, "year"], how="inner")
    merged = merged.merge(corridor_geometry(corridors_gpkg, corridor_layer), on=CORRIDOR_ID)
    anom_cols = [c for c in CLIMATE_ANOM if f"{c}_norm" in merged.columns]
    merged["novelty"] = mahalanobis_novelty(merged, anom_cols)

    merged = merged[merged["tvwsi"].notna()].copy()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    merged.to_parquet(out_path, index=False)
    logger.info("features -> %s (%d rows, %d corridors, %d summers)",
                out_path, len(merged), merged[CORRIDOR_ID].nunique(),
                merged["year"].nunique())
    return merged


def main() -> None:
    p = argparse.ArgumentParser(description="Build the Phase 3 corridor x summer ML table.")
    p.add_argument("--corridors", type=Path, default=paths.CORRIDORS_ANALYSIS)
    p.add_argument("--interim", type=Path, default=paths.INTERIM)
    p.add_argument("--out", type=Path, default=paths.FEATURES)
    p.add_argument("--years", type=int, nargs="+", default=[2022, 2023, 2024, 2025])
    p.add_argument("--climate", type=Path, default=None)
    p.add_argument("--layer", default="corridors_analysis")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )
    df = run(args.corridors, args.interim, args.out, years=tuple(args.years),
             climate_parquet=args.climate, corridor_layer=args.layer)

    groups = predictor_columns(df)
    print("=" * 70)
    print(f"Feature table: {len(df)} rows | {df[CORRIDOR_ID].nunique()} corridors "
          f"x {df['year'].nunique()} summers -> {args.out}")
    print(f"  target tvwsi : mean={df['tvwsi'].mean():+.4f} sd={df['tvwsi'].std():.4f} "
          f"range=[{df['tvwsi'].min():+.4f}, {df['tvwsi'].max():+.4f}]")
    print(f"  dry edge     : SWCI = {df['dry_edge_a'].iloc[0]:.4f} "
          f"+ {df['dry_edge_b'].iloc[0]:.4f} * NDVI")
    print(f"  RLST         : {df['rlst'].min():.4f}–{df['rlst'].max():.4f} "
          f"(sd {df['rlst'].std():.4f})")
    print(f"  novelty      : median={df['novelty'].median():.2f} "
          f"p95={df['novelty'].quantile(0.95):.2f}")
    print(f"  predictors   : climate_only n={len(groups['climate_only'])} "
          f"| rs_augmented n={len(groups['rs_augmented'])}")
    print("  per-summer means:")
    for y, g in df.groupby("year"):
        print(f"    {y}  n={len(g):<4} tvwsi={g['tvwsi'].mean():+.4f}  "
              f"ndvi={g['ndvi_mean'].mean():.3f}  swci={g['swci_mean'].mean():.3f}  "
              f"lst={g['lst_mean'].mean():5.2f}C  CMD_sm={g['CMD_sm'].mean():6.1f}")


if __name__ == "__main__":
    main()
