"""Acquire scale-free ClimateBC predictors for the corridor network.

Predictor side of the Phase 3 pipeline (the ground-truth side is
``acquire_raster`` + ``zonal``). ClimateBC is *scale-free*: it takes a point's
latitude, longitude **and elevation** and returns dynamically-downscaled climate,
so effective resolution is set by the DEM, not by a fixed grid. That is the whole
point of the hypothesis under test, and it is why elevation must come from a real
DEM instead of being assumed constant.

Mechanism (verified live 2026-07-21)
------------------------------------
``https://api6.climatebc.ca/api/clmApi6/LatLonEl`` returns every predictor as
JSON in ~0.3 s per point. No manual Windows batch is required.

* ``prd`` accepts normals (``Normal_1961_1990``) **and** single years
  (``Year_2023.ann``) — this is what supplies the temporal dimension.
  Only the 1961–1990 normal is served; ``Normal_1971_2000`` / ``Normal_1991_2020``
  come back as ``-9999`` sentinels, so anomalies are taken against 1961–1990
  (a documented deviation from the plan, which assumed 1971–2000).
* ``varYSM`` = ``Y`` (annual) or ``S`` (seasonal). Seasonal carries the ``*_sm``
  summer variables the water-stress question actually needs and is fetched
  first; annual is a second, lower-priority pass.
* A wrong/unsupported ``prd`` does **not** error — it returns sentinel values
  (``-9999``, or the degenerate ``MAT=0 / MAP=1 / AHM=10000`` triple). Every
  response is validated before it can reach the model.

**Rate limit: 50 calls per hour per IP.** Undocumented in the vendor PDF and
discovered empirically — the server replies ``503`` with the body
``"Too many calls! We can only allow 50 per Hour"``. There is no batch endpoint
(confirmed against the official web-API doc, v7.30). Consequences, which drive
this module's whole design:

* one worker, paced by a token bucket (``--calls-per-hour``, default 48);
* every response cached to disk as raw JSON and **never re-fetched**, so the
  job is resumable and a re-run costs nothing;
* jobs ordered **corridor-major**, so a partial run yields a complete period
  panel for the first *k* corridors rather than a useless fragment of every one;
* ``--max-calls`` bounds a single invocation; the table is always rebuilt from
  the full cache, so partial acquisition still produces a usable (smaller)
  feature table.

A full 153-polygon × 5-period seasonal pass is 765 calls ≈ 16 h of wall clock.
Run it detached and let the cache fill.

Point sampling
--------------
``--points-per-corridor`` defaults to **1** (``representative_point()``, which is
guaranteed inside the crescent-shaped corridors here, unlike the centroid).
Under a 50/hour ceiling, extra within-corridor points cost a multiple of days for
a second-order refinement; the between-corridor elevation contrast is what
Model A actually trades on. ``--grid-spacing-m`` can add a lattice over the study
extent to give Model B's coarse upscaling extra areal support — off by default
for the same budget reason, in which case Model B upscales the corridor points
themselves (exactly as PHASE3_PLAN §4 specifies).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import time
from dataclasses import dataclass
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
import requests
from shapely.geometry import Point

from . import paths

logger = logging.getLogger(__name__)

ANALYSIS_CRS = "EPSG:26910"
GEOGRAPHIC_CRS = "EPSG:4326"

API_URL = "https://api6.climatebc.ca/api/clmApi6/LatLonEl"
NORMAL_PRD = "Normal_1961_1990"
DEM_COLLECTION = "cop-dem-glo-30"
PC_STAC = "https://planetarycomputer.microsoft.com/api/stac/v1"
DEM_SEARCH_ATTEMPTS = 5
DEM_SEARCH_BACKOFF_S = 20

# The source `id` field is NOT unique (153 polygons share 144 ids — several
# corridors are split into multiple parts). `objectid` is 1:1 with the polygon,
# so it is the join key for every Phase 3 table.
CORRIDOR_ID = "objectid"

SENTINEL = -9999.0  # what the API returns instead of erroring
RATE_LIMIT_MARKER = "Too many calls"

DEFAULT_YEARS = (2022, 2023, 2024, 2025)
DEFAULT_CACHE = paths.CLIMATE_CACHE

# Predictors kept, deliberately modest (n is small): the water-balance and
# heat-stress variables the hypothesis is about, nothing else.
ANNUAL_VARS = ["MAT", "MAP", "MSP", "AHM", "SHM", "Eref", "CMD", "CMI", "DD18", "EXT", "RH"]
SEASONAL_VARS = ["Tmax_sm", "Tmin_sm", "Tave_sm", "PPT_sm", "Rad_sm",
                 "Eref_sm", "CMD_sm", "DD18_sm"]
VARS_BY_YSM = {"Y": ANNUAL_VARS, "S": SEASONAL_VARS}


# --------------------------------------------------------------------------- #
# Point sampling
# --------------------------------------------------------------------------- #
def sample_corridor_points(
    corridors: gpd.GeoDataFrame,
    *,
    n_per_corridor: int = 1,
    id_col: str = CORRIDOR_ID,
    seed: int = 26910,
) -> gpd.GeoDataFrame:
    """Sample ``n_per_corridor`` points inside each corridor polygon.

    Point 0 is always ``representative_point()``. Extra points are drawn by
    seeded rejection sampling from the polygon's bounding box, so coordinates —
    and therefore cache keys — are reproducible across runs.
    """
    rng = np.random.default_rng(seed)
    rows = []
    for _, row in corridors.iterrows():
        geom = row.geometry
        pts = [geom.representative_point()]
        minx, miny, maxx, maxy = geom.bounds
        tries = 0
        while len(pts) < n_per_corridor and tries < 10_000:
            tries += 1
            p = Point(rng.uniform(minx, maxx), rng.uniform(miny, maxy))
            if geom.contains(p):
                pts.append(p)
        if len(pts) < n_per_corridor:
            logger.warning("corridor %s: only %d/%d points sampled",
                           row[id_col], len(pts), n_per_corridor)
        for i, p in enumerate(pts):
            rows.append({"corridor_id": row[id_col], "point_idx": i, "geometry": p})

    out = gpd.GeoDataFrame(rows, crs=corridors.crs)
    out["site"] = "corridor"
    logger.info("sampled %d corridor points across %d corridors",
                len(out), corridors[id_col].nunique())
    return out


def grid_points(extent_gpkg: Path, *, spacing_m: float = 2000.0,
                buffer_m: float = 2000.0) -> gpd.GeoDataFrame:
    """Regular lattice over the buffered study footprint, for coarse upscaling."""
    dissolved = gpd.read_file(extent_gpkg, layer="dissolved").to_crs(ANALYSIS_CRS)
    hull = dissolved.geometry.union_all().buffer(buffer_m)
    minx, miny, maxx, maxy = hull.bounds
    xs = np.arange(minx, maxx + spacing_m, spacing_m)
    ys = np.arange(miny, maxy + spacing_m, spacing_m)
    pts = [Point(x, y) for x in xs for y in ys if hull.contains(Point(x, y))]
    out = gpd.GeoDataFrame(
        {"corridor_id": pd.Series([pd.NA] * len(pts), dtype="object"),
         "point_idx": range(len(pts))},
        geometry=pts, crs=ANALYSIS_CRS,
    )
    out["site"] = "grid"
    logger.info("built %d grid points at %.0f m spacing", len(out), spacing_m)
    return out


# --------------------------------------------------------------------------- #
# Elevation (the scale-free lever)
# --------------------------------------------------------------------------- #
def _elev_from_aws_cop_dem(pts4326: gpd.GeoDataFrame) -> np.ndarray:
    """Sample Copernicus GLO-30 straight from the AWS public bucket.

    Same DEM the Planetary Computer serves, but addressed by tile name over
    plain HTTPS — no STAC search, no token signing, nothing to time out. Tiles
    are 1x1 degree COGs, so a windowed read per tile fetches only the byte
    ranges the points actually need.
    """
    import rasterio

    lons = pts4326.geometry.x.values
    lats = pts4326.geometry.y.values
    lat0 = np.floor(lats).astype(int)
    lon0 = np.floor(lons).astype(int)

    elev = np.full(len(pts4326), np.nan)
    for la, lo in {(int(a), int(b)) for a, b in zip(lat0, lon0)}:
        ns = "N" if la >= 0 else "S"
        ew = "E" if lo >= 0 else "W"
        tile = f"{ns}{abs(la):02d}_00_{ew}{abs(lo):03d}_00"
        url = (f"https://copernicus-dem-30m.s3.amazonaws.com/"
               f"Copernicus_DSM_COG_10_{tile}_DEM/Copernicus_DSM_COG_10_{tile}_DEM.tif")
        sel = (lat0 == la) & (lon0 == lo)
        try:
            with rasterio.open(f"/vsicurl/{url}") as src:
                vals = np.array([v[0] for v in src.sample(
                    list(zip(lons[sel], lats[sel])))], dtype=float)
                if src.nodata is not None:
                    vals[vals == src.nodata] = np.nan
            elev[sel] = vals
            logger.info("  DEM tile %s: sampled %d points", tile, int(sel.sum()))
        except Exception as exc:                      # noqa: BLE001
            logger.warning("  DEM tile %s failed: %s", tile, exc)
    return elev


def attach_elevation(points: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Sample Copernicus GLO-30 DEM elevation at each point.

    The DEM is loaded once for the whole extent and sampled by nearest-neighbour
    index rather than per-point windowed reads — 30 m over Surrey is a few MB.

    Elevation is not an optional nicety here: it is the input ClimateBC's
    scale-free downscaling keys on, so a run cannot proceed without it. The
    Planetary Computer STAC that served it originally has proved unreliable
    (repeated "request exceeded the maximum allowed time"), so a failure there
    falls through to the identical tiles on AWS's public bucket rather than
    aborting a multi-hour unattended acquisition at minute zero.
    """
    import odc.stac
    import planetary_computer as pc
    import pystac_client

    pts4326 = points.to_crs(GEOGRAPHIC_CRS)
    minx, miny, maxx, maxy = pts4326.total_bounds
    bbox = [minx - 0.02, miny - 0.02, maxx + 0.02, maxy + 0.02]

    # The Planetary Computer STAC search intermittently returns "request exceeded
    # the maximum allowed time" — observed repeatedly, and it gets likelier as the
    # bbox grows (Phase 3b's transect is ~100 km against Surrey's ~30 km). This
    # runs *before* the first ClimateBC call, so an unretried failure here kills a
    # 33-hour unattended run at minute zero. Retry with backoff.
    cat = pystac_client.Client.open(PC_STAC, modifier=pc.sign_inplace)
    items: list = []
    last_err: Exception | None = None
    for attempt in range(1, DEM_SEARCH_ATTEMPTS + 1):
        try:
            items = list(cat.search(collections=[DEM_COLLECTION], bbox=bbox).items())
            break
        except Exception as exc:                      # noqa: BLE001 — any transport failure
            last_err = exc
            if attempt == DEM_SEARCH_ATTEMPTS:
                break
            delay = DEM_SEARCH_BACKOFF_S * 2 ** (attempt - 1)
            logger.warning("DEM STAC search failed (attempt %d/%d): %s — retrying in %ds",
                           attempt, DEM_SEARCH_ATTEMPTS, exc, delay)
            time.sleep(delay)
    if items:
        dem = odc.stac.load(
            items, bands=["data"], bbox=bbox, crs=ANALYSIS_CRS, resolution=30,
        ).data.squeeze("time", drop=True).load()
        xs = _nearest_index(dem, "x", points.geometry.x.values)
        ys = _nearest_index(dem, "y", points.geometry.y.values)
        elev = dem.values[ys, xs].astype(float)
        source = "planetary-computer"
    else:
        logger.warning("STAC unusable after %d attempts (%s) — falling back to "
                       "the AWS Copernicus DEM bucket", DEM_SEARCH_ATTEMPTS, last_err)
        elev = _elev_from_aws_cop_dem(pts4326)
        source = "aws-copernicus-dem-30m"
        if not np.isfinite(elev).any():
            raise RuntimeError(
                f"No {DEM_COLLECTION} elevation from either source for bbox {bbox} "
                f"(STAC error: {last_err})")

    out = points.copy()
    out["elev_m"] = np.round(elev, 1)
    out["elev_src"] = source
    bad = ~np.isfinite(out["elev_m"]) | (out["elev_m"] < -50) | (out["elev_m"] > 3000)
    if bad.any():
        logger.warning("%d points had implausible DEM elevation -> clamped to 0", int(bad.sum()))
        out.loc[bad, "elev_m"] = 0.0
    logger.info("elevation source: %s", source)
    logger.info("elevation: min=%.1f median=%.1f max=%.1f m",
                out["elev_m"].min(), out["elev_m"].median(), out["elev_m"].max())
    return out


def _nearest_index(da, dim: str, coords: np.ndarray) -> np.ndarray:
    axis = da[dim].values
    return np.abs(axis[None, :] - coords[:, None]).argmin(axis=1)


# --------------------------------------------------------------------------- #
# Rate-limited, cached API access
# --------------------------------------------------------------------------- #
class RateLimiter:
    """Token bucket pacing calls to ``calls_per_hour``, one worker.

    Kept slightly under the observed 50/hour ceiling. Cache hits do not consume
    tokens — only real HTTP calls call ``wait()``.
    """

    def __init__(self, calls_per_hour: float = 48.0):
        self.interval = 3600.0 / max(calls_per_hour, 1.0)
        self._next = 0.0

    def wait(self) -> None:
        now = time.monotonic()
        if now < self._next:
            time.sleep(self._next - now)
        self._next = max(now, self._next) + self.interval

    def penalize(self, seconds: float) -> None:
        """Push the next allowed call out after a rate-limit rejection."""
        self._next = time.monotonic() + seconds


class RateLimited(RuntimeError):
    """The server returned its 'Too many calls' 503."""


def _cache_key(lat: float, lon: float, el: float, prd: str, ysm: str) -> str:
    raw = f"{lat:.5f}|{lon:.5f}|{el:.1f}|{prd}|{ysm}"
    return hashlib.sha1(raw.encode()).hexdigest()[:16]


def cache_path(cache_dir: Path, lat, lon, el, prd, ysm) -> Path:
    return cache_dir / f"{_cache_key(lat, lon, el, prd, ysm)}.json"


def fetch_point(
    session: requests.Session,
    lat: float, lon: float, el: float, prd: str, ysm: str,
    *,
    cache_dir: Path,
    limiter: RateLimiter,
    retries: int = 3,
) -> tuple[dict, bool]:
    """One ClimateBC point-request. Returns ``(record, was_cached)``.

    Raises :class:`RateLimited` when the hourly ceiling is hit, so the caller can
    decide whether to sleep it out or stop and resume later.
    """
    cf = cache_path(cache_dir, lat, lon, el, prd, ysm)
    if cf.exists():
        try:
            return json.loads(cf.read_text()), True
        except (json.JSONDecodeError, OSError):
            # A half-written cache entry must not be fatal. Re-fetching one point
            # costs 78 s; crashing an unattended overnight run on a truncated file
            # costs the whole night.
            logger.warning("corrupt cache entry %s — refetching", cf.name)
            cf.unlink(missing_ok=True)

    cache_dir.mkdir(parents=True, exist_ok=True)
    params = {"ID1": "1", "ID2": "surrey", "lat": f"{lat:.5f}", "lon": f"{lon:.5f}",
              "el": f"{el:.1f}", "prd": prd, "varYSM": ysm}
    last_err: Exception | None = None
    for attempt in range(retries):
        limiter.wait()
        try:
            r = session.get(API_URL, params=params, timeout=60)
            if r.status_code == 503 and RATE_LIMIT_MARKER in r.text:
                raise RateLimited(r.text.strip()[:120])
            r.raise_for_status()
            payload = r.json()
            rec = payload[0] if isinstance(payload, list) else payload
            if not isinstance(rec, dict) or not ({"MAT", "Tmax_sm"} & set(rec)):
                raise ValueError(f"unexpected payload shape: {str(payload)[:200]}")
            # Write-then-rename: os.replace is atomic within a filesystem, so a
            # kill or power loss mid-write leaves either the old state or the
            # complete new file, never a truncated one a later run would choke on.
            tmp = cf.with_suffix(".json.tmp")
            tmp.write_text(json.dumps(rec))
            tmp.replace(cf)
            return rec, False
        except RateLimited:
            raise
        except Exception as e:  # noqa: BLE001 — undocumented API, retry anything
            last_err = e
            time.sleep(2 ** attempt)
    raise RuntimeError(f"ClimateBC failed after {retries} tries ({params}): {last_err}")


def _to_float(v):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return np.nan
    return np.nan if f == SENTINEL else f


def validate_record(rec: dict, ysm: str) -> bool:
    """Reject the API's silent-failure sentinel responses.

    A wrong ``prd`` returns ``-9999`` everywhere, or the degenerate
    ``MAT=0 / MAP=1 / AHM=10000`` triple. Neither must reach the model.
    """
    if ysm == "Y":
        mat, mp, ahm = (_to_float(rec.get(k)) for k in ("MAT", "MAP", "AHM"))
        if not (np.isfinite(mat) and np.isfinite(mp)):
            return False
        return not (mp <= 1 or (np.isfinite(ahm) and ahm >= 10000))
    tsm, psm = _to_float(rec.get("Tmax_sm")), _to_float(rec.get("PPT_sm"))
    return bool(np.isfinite(tsm) and np.isfinite(psm) and tsm > -50)


# --------------------------------------------------------------------------- #
# Job planning + execution
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class Job:
    site: str
    corridor_id: object
    point_idx: int
    lat: float
    lon: float
    elev_m: float
    prd: str
    ysm: str


def build_jobs(points: gpd.GeoDataFrame, periods: list[str],
               varysm: tuple[str, ...]) -> list[Job]:
    """Corridor-major job list: every period of one point before moving on.

    Ordering matters under the rate limit — a partial run then yields a complete
    period panel for the first *k* points instead of scattered holes everywhere.
    Seasonal (``S``) is emitted before annual (``Y``) because the summer
    variables carry the hypothesis.
    """
    p4326 = points.to_crs(GEOGRAPHIC_CRS)
    order = {"S": 0, "Y": 1}
    jobs = []
    for i, (_, row) in enumerate(points.iterrows()):
        geom = p4326.geometry.iloc[i]
        for ysm in sorted(varysm, key=lambda v: order.get(v, 9)):
            for prd in periods:
                jobs.append(Job(row["site"], row["corridor_id"], int(row["point_idx"]),
                                float(geom.y), float(geom.x), float(row["elev_m"]),
                                prd, ysm))
    return jobs


def execute_jobs(
    jobs: list[Job],
    *,
    cache_dir: Path,
    calls_per_hour: float = 48.0,
    max_calls: int | None = None,
    wait_on_limit: bool = True,
    limit_sleep_s: float = 300.0,
) -> pd.DataFrame:
    """Run the job list against cache-then-API; return every record obtainable.

    Never raises on rate limiting: with ``wait_on_limit`` it sleeps and retries,
    otherwise it stops early. Either way the returned frame contains everything
    that *is* available, so downstream stages degrade gracefully.
    """
    session = requests.Session()
    session.headers.update({"User-Agent": "surrey-biome-pipeline/0.1 (research)"})
    limiter = RateLimiter(calls_per_hour)

    rows, n_calls, n_cached, n_bad, n_skipped = [], 0, 0, 0, 0
    exhausted = False
    for j, job in enumerate(jobs):
        # Cache hits are always harvested; only *live* calls are budgeted. That
        # makes `--max-calls 0` a free "rebuild the tables from whatever is
        # cached" mode, which is what lets the downstream stages run while a
        # multi-hour acquisition is still going.
        cached_already = cache_path(cache_dir, job.lat, job.lon, job.elev_m,
                                    job.prd, job.ysm).exists()
        if not cached_already and (exhausted or
                                   (max_calls is not None and n_calls >= max_calls)):
            if not exhausted:
                logger.info("max-calls (%d) reached at job %d/%d — harvesting the "
                            "rest of the cache only", max_calls, j, len(jobs))
                exhausted = True
            n_skipped += 1
            continue
        while True:
            try:
                rec, cached = fetch_point(
                    session, job.lat, job.lon, job.elev_m, job.prd, job.ysm,
                    cache_dir=cache_dir, limiter=limiter,
                )
                break
            except RateLimited as e:
                if not wait_on_limit:
                    logger.warning("rate limited at job %d/%d — stopping (%s)", j, len(jobs), e)
                    rec = None
                    break
                logger.info("rate limited at job %d/%d — sleeping %.0f s",
                            j, len(jobs), limit_sleep_s)
                limiter.penalize(limit_sleep_s)
            except Exception as e:  # noqa: BLE001
                logger.warning("job %d/%d failed permanently: %s", j, len(jobs), e)
                rec = None
                break
        if rec is None:
            # A hard failure or a give-up-on-limit: stop issuing live calls but
            # keep sweeping the cache so the run still produces a usable table.
            exhausted = True
            n_skipped += 1
            continue

        n_cached += cached
        n_calls += not cached
        if not validate_record(rec, job.ysm):
            n_bad += 1
            continue

        skip = {"ID1", "ID2", "lat", "lon", "elev", "prd", "varYSM"}
        rows.append({
            "site": job.site, "corridor_id": job.corridor_id, "point_idx": job.point_idx,
            "lat": job.lat, "lon": job.lon, "elev_m": job.elev_m,
            "prd": job.prd, "varYSM": job.ysm,
            **{k: _to_float(v) for k, v in rec.items() if k not in skip},
        })
        if not cached and n_calls % 10 == 0:
            logger.info("progress: %d live calls, %d cache hits, job %d/%d",
                        n_calls, n_cached, j + 1, len(jobs))

    if n_bad:
        logger.warning("%d responses failed sentinel validation -> dropped", n_bad)
    if n_skipped:
        logger.info("%d jobs left unfetched (rate/budget) — rerun to continue", n_skipped)
    logger.info("execute_jobs done: %d rows (%d live calls, %d cache hits)",
                len(rows), n_calls, n_cached)
    return pd.DataFrame(rows)


# --------------------------------------------------------------------------- #
# Reshape
# --------------------------------------------------------------------------- #
def widen(df: pd.DataFrame) -> pd.DataFrame:
    """Merge the S (and, if fetched, Y) responses of each point x period into one row.

    Seasonal is the spine: an annual-only row would be missing every ``*_sm``
    predictor the hypothesis rests on, so it is dropped rather than half-filled.
    """
    if df.empty:
        return df
    keys = ["site", "corridor_id", "point_idx", "lat", "lon", "elev_m", "prd"]
    sea = df[df["varYSM"] == "S"]
    if sea.empty:
        raise RuntimeError("no seasonal (varYSM=S) records — cannot build predictors")
    wide = sea[keys + [c for c in SEASONAL_VARS if c in sea.columns]].copy()

    ann = df[df["varYSM"] == "Y"]
    if not ann.empty:
        ann = ann[keys + [c for c in ANNUAL_VARS if c in ann.columns]]
        wide = wide.merge(ann, on=keys, how="left")

    wide["year"] = (
        wide["prd"].str.extract(r"Year_(\d{4})", expand=False)
        .astype("Float64").astype("Int64")
    )
    return wide


def aggregate_to_corridor(wide: pd.DataFrame) -> pd.DataFrame:
    """Mean the per-corridor sample points up to one row per corridor x period.

    This is Model A's predictor value: the mean of the scale-free, elevation-
    adjusted point estimates *inside* the corridor.
    """
    corr = wide[wide["site"] == "corridor"].copy()
    var_cols = [c for c in ANNUAL_VARS + SEASONAL_VARS if c in corr.columns]
    agg = {c: "mean" for c in var_cols}
    agg.update({"elev_m": "mean", "lat": "mean", "lon": "mean", "point_idx": "count"})
    grouped = (corr.groupby(["corridor_id", "prd"], as_index=False)
                   .agg(agg).rename(columns={"point_idx": "n_points"}))
    grouped["year"] = (
        grouped["prd"].str.extract(r"Year_(\d{4})", expand=False)
        .astype("Float64").astype("Int64")
    )
    return grouped


def complete_panel(corridor: pd.DataFrame, years: tuple[int, ...]) -> pd.DataFrame:
    """Keep only corridors with every study year *and* the normal period.

    Under partial acquisition this is what makes the experiment honest: an
    unbalanced panel would silently weight well-covered corridors.
    """
    need = {NORMAL_PRD, *(f"Year_{y}.ann" for y in years)}
    have = corridor.groupby("corridor_id")["prd"].agg(set)
    keep = have[have.map(lambda s: need <= s)].index
    out = corridor[corridor["corridor_id"].isin(keep)].copy()
    logger.info("complete panel: %d/%d corridors have all %d periods",
                len(keep), corridor["corridor_id"].nunique(), len(need))
    return out


# --------------------------------------------------------------------------- #
def run(
    corridors_gpkg: Path,
    out_dir: Path,
    *,
    extent_gpkg: Path | None = None,
    years: tuple[int, ...] = DEFAULT_YEARS,
    points_per_corridor: int = 1,
    grid_spacing_m: float = 0.0,
    varysm: tuple[str, ...] = ("S",),
    cache_dir: Path = DEFAULT_CACHE,
    calls_per_hour: float = 48.0,
    max_calls: int | None = None,
    wait_on_limit: bool = True,
    corridor_layer: str = "corridors_analysis",
) -> dict:
    corridors = gpd.read_file(corridors_gpkg, layer=corridor_layer).to_crs(ANALYSIS_CRS)

    frames = [sample_corridor_points(corridors, n_per_corridor=points_per_corridor)]
    if grid_spacing_m and extent_gpkg is not None:
        frames.append(grid_points(extent_gpkg, spacing_m=grid_spacing_m))
    pts = gpd.GeoDataFrame(pd.concat(frames, ignore_index=True),
                           geometry="geometry", crs=ANALYSIS_CRS)
    pts = attach_elevation(pts)

    periods = [NORMAL_PRD] + [f"Year_{y}.ann" for y in years]
    jobs = build_jobs(pts, periods, varysm)
    logger.info("planned %d jobs (%d points x %d periods x %d varYSM)",
                len(jobs), len(pts), len(periods), len(varysm))

    raw = execute_jobs(jobs, cache_dir=cache_dir, calls_per_hour=calls_per_hour,
                       max_calls=max_calls, wait_on_limit=wait_on_limit)
    wide = widen(raw)
    corridor = aggregate_to_corridor(wide)
    panel = complete_panel(corridor, years)

    out_dir.mkdir(parents=True, exist_ok=True)
    pts.to_file(out_dir / "climate_points.gpkg", layer="points", driver="GPKG")
    wide.to_parquet(out_dir / "climate_points.parquet", index=False)
    corridor.to_parquet(out_dir / "corridor_climate_all.parquet", index=False)
    panel.to_parquet(out_dir / "corridor_climate.parquet", index=False)
    logger.info("wrote %d point-period rows; %d corridor-period rows (%d in complete panel)",
                len(wide), len(corridor), len(panel))
    return {"points": pts, "raw": raw, "wide": wide, "corridor": corridor, "panel": panel}


def main() -> None:
    p = argparse.ArgumentParser(
        description="Fetch scale-free ClimateBC predictors per corridor (rate-limited, resumable).")
    p.add_argument("--corridors", type=Path, default=paths.CORRIDORS_ANALYSIS)
    p.add_argument("--extent", type=Path, default=paths.STUDY_EXTENT_GPKG)
    p.add_argument("--out-dir", type=Path, default=paths.INTERIM)
    p.add_argument("--years", type=int, nargs="+", default=list(DEFAULT_YEARS))
    p.add_argument("--points-per-corridor", type=int, default=1)
    p.add_argument("--grid-spacing-m", type=float, default=0.0,
                   help="0 disables the upscaling lattice (default; see module docstring).")
    p.add_argument("--varysm", nargs="+", default=["S"], choices=["S", "Y"])
    p.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE)
    p.add_argument("--calls-per-hour", type=float, default=48.0,
                   help="Stay under the server's observed 50/hour ceiling.")
    p.add_argument("--max-calls", type=int, default=None,
                   help="Bound live calls for this invocation (cache hits are free).")
    p.add_argument("--no-wait", action="store_true",
                   help="Stop instead of sleeping when rate limited.")
    p.add_argument("--layer", default="corridors_analysis")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    logging.getLogger("rasterio.session").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    res = run(
        args.corridors, args.out_dir, extent_gpkg=args.extent, years=tuple(args.years),
        points_per_corridor=args.points_per_corridor, grid_spacing_m=args.grid_spacing_m,
        varysm=tuple(args.varysm), cache_dir=args.cache_dir,
        calls_per_hour=args.calls_per_hour, max_calls=args.max_calls,
        wait_on_limit=not args.no_wait, corridor_layer=args.layer,
    )

    wide, corr, panel = res["wide"], res["corridor"], res["panel"]
    print("=" * 66)
    print(f"ClimateBC: {len(wide)} point-period rows -> {len(corr)} corridor-period rows")
    print(f"  points     : {len(res['points'])} "
          f"(elev {res['points']['elev_m'].min():.0f}–{res['points']['elev_m'].max():.0f} m)")
    print(f"  periods    : {sorted(wide['prd'].unique())}")
    print(f"  corridors  : {corr['corridor_id'].nunique()} touched | "
          f"{panel['corridor_id'].nunique()} with a COMPLETE period panel")
    yr = panel[panel["year"].notna()]
    if not yr.empty:
        print("  summer climate by year (complete-panel corridor means):")
        for y, g in yr.groupby("year"):
            print(f"    {int(y)}  CMD_sm={g['CMD_sm'].mean():7.1f}  "
                  f"Tmax_sm={g['Tmax_sm'].mean():5.1f}  PPT_sm={g['PPT_sm'].mean():6.1f}  "
                  f"Eref_sm={g['Eref_sm'].mean():6.1f}")


if __name__ == "__main__":
    main()
