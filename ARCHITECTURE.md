# Phase 2 — Data Acquisition & Spatial Merging: Technical Blueprint

**Role:** Lead Spatial Data Engineer
**Objective:** A reproducible Python pipeline that retrieves and spatially aligns three heterogeneous geodata types — tabular climate (ClimateBC), vector constraints (Surrey corridors/hubs), and raster ground truth (Sentinel-2/Landsat) — into one ML-ready table, aggregated **per corridor polygon** (per the Phase 1 decision to reject coarse grid cells).

> **Design axiom (carried from Phase 1):** the analysis unit is the **corridor polygon** (measured at 0.29-157.8 ha, median 5.8 ha), *not* a square grid cell. Every step below preserves that geometry so we don't reintroduce the mixed-pixel problem the project exists to beat.

---

## 1. The Python Library Stack

| Concern | Library | Why this one |
|---|---|---|
| **Vector manipulation** | `geopandas` (v1.x) + `shapely` 2.x | Standard for polygon/point ops; vectorized geometry via Shapely 2. |
| Vector I/O | `pyogrio` | Arrow-based reader/writer — 10–100× faster than fiona for GeoJSON/GeoPackage; now GeoPandas' default engine. |
| **CRS handling** | `pyproj` (+ GeoPandas `.to_crs()`) | Authoritative PROJ transforms; handles datum shifts (WGS84↔NAD83). |
| **Raster processing** | `rasterio` + `rioxarray` over `xarray` | `rasterio` for windowed reads/masking; `rioxarray` gives labeled, CRS-aware N-D arrays with `.rio.reproject()`, `.rio.clip()`. |
| Array math / indices | `numpy`, `xarray` | NDVI/CDEI are band arithmetic — vectorized, lazy. |
| **STAC satellite fetch** | `pystac-client` + `planetary-computer` + `odc-stac` | Query STAC catalogs, sign asset URLs, and lazily load matched items straight into an xarray `DataArray` (dask-backed, no full download). |
| **Zonal aggregation** | `exactextract` | Computes exact pixel-fraction coverage per polygon — critical for corridors this narrow -- median effective width 39.7 m -- where whole-pixel `rasterstats` badly biases edges. |
| API fetching | `httpx` / `requests` | ArcGIS REST + any ClimateBC HTTP calls; `httpx` for async paging. |
| ML (Phase 3) | `scikit-learn`, `pandas` | RandomForest / GradientBoosting baseline on the final table. |
| Env / reproducibility | `uv` (venv + lockfile) | No conda needed; modern `geopandas`/`rasterio` wheels bundle GDAL. |

**Alternative raster-fetch path:** `earthengine-api` + `geemap` (see §2.3). Kept as an optional extra, not the default.

---

## 2. The Acquisition Strategy

### 2.1 Surrey corridors & aquatic hubs — ArcGIS Feature Services (vector)
Surrey's Open Data portal is ArcGIS Hub; each layer exposes a **REST Feature Service** with a `/query` endpoint.

- **Approach:** query the endpoint asking for **GeoJSON**, with server-side filtering to cut payload:
  `…/FeatureServer/<id>/query?where=1=1&outFields=*&f=geojson&outSR=4326`
- **Read directly into GeoPandas:** `gpd.read_file(query_url)` (pyogrio handles the GeoJSON).
- **Handle pagination:** Feature Services cap results (often 1000–2000 features via `maxRecordCount`). Loop with `resultOffset` / `resultRecordCount` until exhausted, or set `returnExceededLimitOffset`. Wrap in a small paged fetcher in `src/pipeline/acquire_vector.py`.
- **Pin CRS at the source:** request `outSR=4326` (or the layer's native `outSR`) explicitly so we always know what we got.
- **Cache raw pulls** to `data/raw/surrey/*.geojson` (gitignored) so we're not hammering the service on every run.

### 2.2 ClimateBC (tabular / point climate)

> ⚠️ **SUPERSEDED — this section's premise turned out to be wrong.** A live
> point-query endpoint does exist: `https://api6.climatebc.ca/api/clmApi6/LatLonEl`
> returns every predictor for a single `lat, lon, elev` triple, and
> `src/pipeline/acquire_climate.py` uses it directly. The generate → batch-run →
> ingest loop described below was never needed. The real constraint is different and
> harder: the endpoint is undocumented and rate-limited to roughly **50 calls/hour
> per IP**, with no batch mode — so acquisition is paced, resumable and disk-cached
> instead of batched. The original reasoning is kept below because the point set,
> elevation attachment and CRS handling it specifies are still what the pipeline does.

> **Original constraint, as understood at Phase 2 planning time.** ClimateBC/ClimateNA has no public query API. It is a batch tool: you feed it a CSV of points (`ID, lat, long, elev`) and it returns the same rows enriched with CMD, SHM, etc. (There is a ClimateNA cloud/desktop app with a command-line batch mode; the online form is manual.)

So the "fetch" is really a **generate → batch-run → ingest** loop:
1. **Generate the input point set programmatically** from the corridor polygons (see §3, step 5) — e.g. a regular sample grid clipped to corridors, or polygon centroids/representative points — each needing `lat, long, elev`.
2. **Attach elevation** (ClimateBC needs it): sample a DEM (e.g. Copernicus GLO-30 via STAC, or CDEM) at each point, or supply `elev = "."` to let ClimateNA use its own DEM.
3. **Run ClimateBC batch** on that CSV (desktop/CLI batch mode; on macOS this may mean the ClimateNA CLI under an emulation layer or a one-off run on a Windows box). Output → `data/raw/climatebc/*.csv`.
4. **Ingest** the output CSV back in as a `pandas`/`geopandas` points frame; the `lat/long` become geometry (EPSG:4326).

Keep the input-point generator and the output-ingest as two clean, testable functions so the manual batch step is the only non-automated seam.

### 2.3 Satellite rasters — **recommend Microsoft Planetary Computer (STAC)** over GEE
| | **Planetary Computer + STAC** (recommended) | Google Earth Engine |
|---|---|---|
| Paradigm | Cloud-native COGs → your own `xarray`/`rasterio` locally | Server-side compute, results exported |
| Fit with our stack | Native — same rioxarray/rasterio clipping we use everywhere | Different API; would fork the pipeline |
| Auth | Anonymous browse; `planetary_computer.sign()` for reads | OAuth + a registered GEE project |
| Data | Sentinel-2 L2A, Landsat C2 L2, DEMs, all STAC | Same + huge archive |
| Best when | Local, polygon-clipped, reproducible ML feature-building | Massive server-side reductions over big areas |

**Chosen path:** Planetary Computer. It keeps *one* raster toolchain end-to-end and hands us COGs we clip ourselves — exactly what corridor-scale masking needs.

- **Query:** `pystac-client` against `https://planetarycomputer.microsoft.com/api/stac/v1`, collection `sentinel-2-l2a` (10 m) primary, `landsat-c2-l2` (30 m) as historical backfill pre-2015.
- **Filter:** by corridor **bounding box**, date range, and `eo:cloud_cover < N`.
- **Sign + load:** `planetary_computer.sign_inplace` on items, then `odc.stac.load(...)` → lazy xarray with bands B04/B08 (+ SCL for masking).
- **Cloud masking:** Sentinel-2 `SCL` band (drop classes 3,8,9,10,11 = shadow/cloud/cirrus/snow); Landsat `QA_PIXEL` bitmask.

---

## 3. The Spatial Merging Logic (step-by-step)

### CRS strategy — one projected analysis CRS
Pick a single **projected, metric** CRS and reproject *everything* to it before any spatial op (never do distance/area/clip in degrees):

- **Analysis CRS: `EPSG:26910` (NAD83 / UTM Zone 10N)** — metres, correct for Surrey BC. (`EPSG:3005` BC Albers is an equally valid alternative if we later go province-wide.)
- Incoming CRSs to normalize: Surrey ArcGIS → EPSG:4326 (or 3005); ClimateBC points → EPSG:4326; Sentinel-2 → per-tile UTM (usually EPSG:32610). All → **26910**.

### Workflow
1. **Load & normalize vectors.** Read Surrey corridors + aquatic hubs → `to_crs(26910)`. Clean geometries (`make_valid`, drop empties), dissolve/union if corridors arrive as fragments.
2. **Define the study extent.** Union of corridor polygons → total bounds (in 26910, and reprojected to 4326 for STAC bbox queries).
3. **Load & normalize ClimateBC points.** Ingested output CSV → GeoDataFrame from `lat/long` (EPSG:4326) → `to_crs(26910)`.
4. **Acquire & stack rasters.** STAC query over the extent + date window → signed items → `odc.stac.load` into xarray → **reproject/resample to 26910** via `.rio.reproject(26910)`. Keep Sentinel native 10 m; if mixing Landsat, resample to a common grid explicitly (bilinear for reflectance).
5. **Cloud-mask + temporal composite.** Apply SCL/QA mask, then composite to the **Phase 1 cadence: weekly max NDVI** (and weekly mean for any thermal/LST inputs).
6. **Compute indices on the raster.** `NDVI = (B08 − B04)/(B08 + B04)`; extend to CDEI = `d(SWCI,NDVI)/RLST` when thermal inputs are wired. All as xarray band math.
7. **Clip to corridors — the pavement-masking step.** This is where urban matrix gets excluded:
   - `clipped = ndvi.rio.clip(corridors.geometry, corridors.crs, drop=True, all_touched=False)`.
   - **Edge defense:** first **negatively buffer** each corridor polygon by ~1 pixel (`geometry.buffer(-10)` for 10 m Sentinel) so boundary pixels straddling pavement are excluded. `all_touched=False` keeps only pixel-centre-in-polygon; the inward buffer removes edge contamination. This directly enforces "calculate stress *inside* the corridor only."
8. **Zonal aggregation → one value per corridor.** Use `exactextract` to get **coverage-weighted** stats (mean/median/pXX NDVI, valid-pixel count) per corridor polygon per timestep. Exact fractions matter because a corridor of median width spans only ~2 Sentinel pixels across — whole-pixel counting would bias narrow segments.
9. **Attach climate predictors to corridors.** Join ClimateBC point variables (CMD, SHM, …) to each corridor: if points were sampled *within* corridors, aggregate points-in-polygon (`gpd.sjoin` + groupby mean); if points are a surrounding grid, use nearest / IDW interpolation to the corridor. Result: predictor columns per corridor.
10. **Assemble the ML-ready table.** Long format, one row per **(corridor_id × date)**: `[corridor_id, date, CMD, SHM, …predictors, ndvi_mean, tvwsi, valid_px, geometry]`. Write to `data/processed/features.parquet` (gitignored). Carry `geometry` + `corridor_id` so results remain mappable and joinable back for Phase 3.

### Cross-cutting handling
- **Resolution mismatch:** never upsample climate to fake resolution — keep climate at its native support and *aggregate raster down to the polygon*, so all three sources meet at the **corridor polygon**, the common denominator.
- **NoData / gaps:** propagate masks; require a minimum valid-pixel fraction per corridor-timestep or flag the row.
- **Novel-climate flag (Phase 1 carryover):** keep the Mahalanobis novelty score as a column so Phase 3 can stratify.
- **Reproducibility:** every raw pull cached under `data/raw/**`; deterministic intermediate artifacts under `data/interim/**`; config (CRS, date windows, cloud threshold, collections) in `config/pipeline.yaml`.

---

## Proposed module layout
```
src/pipeline/
  acquire_vector.py     # Surrey ArcGIS paged fetch -> data/raw/surrey/
  acquire_climate.py    # generate input points + ingest ClimateBC output CSV
  acquire_raster.py     # STAC query + sign + odc.stac.load
  index.py              # cloud mask, weekly composite, NDVI/CDEI
  align.py              # CRS normalize, clip (inward buffer), reproject
  zonal.py              # exactextract per-corridor aggregation
  assemble.py           # join climate+raster -> features.parquet
config/pipeline.yaml    # CRS, dates, collections, cloud threshold, sampling
```

## Open items to confirm before coding
1. **ClimateBC batch mechanism** on macOS (CLI under emulation vs. a one-off Windows run vs. the online tool) — the only non-automated seam.
2. **Historical time window** (which years/season) and **satellite choice** (Sentinel-2 from 2015+, or Landsat back to ~2013+ for a longer record).
3. **ClimateBC sampling design** — sample grid inside corridors vs. centroids vs. surrounding grid + interpolation.
