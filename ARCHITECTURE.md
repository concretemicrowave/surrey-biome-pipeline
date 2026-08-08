# Architecture

How the pipeline is built and why. This describes the code as it exists; for
what the analysis *found*, see [`docs/RESOLUTION_TEST_FINDINGS.md`](docs/RESOLUTION_TEST_FINDINGS.md).

The design has one organising constraint, and almost everything below follows
from it: **the analysis unit is the polygon, never a grid cell.** Surrey's
corridors are long, narrow and small (median effective width 49.4 m, median
area 7.3 ha). Any step that resamples them onto a raster grid destroys the thing
being measured. So every module either produces per-polygon values or reduces a
raster to them, and the coarse cells in the resolution experiment exist only as
a device for degrading predictors. No quantity is ever computed for a cell, and
no cell is ever a row.

---

## 1. Module map

Each module in `src/pipeline/` is importable and also runs as a CLI
(`python -m src.pipeline.<name> -v`). They form a line, not a graph.

```
acquire_vector ──┐
                 ├─> prepare ──> study extent ──┬─> acquire_raster ──> zonal ──┐
acquire_vri ─────┘                              └─> acquire_climate ───────────┤
                                                                               │
                                          align (Surrey only) ─────────────────┤
                                                                               v
                                                                          assemble
                                                                               │
                                    ┌──────────────────────┬───────────────────┤
                                    v                      v                   v
                               experiment              explain          corridor_stress
                            (A vs B verdict)     (what does drive it)          │
                                                                               v
                                                                        validate_sar
```

| Module | Responsibility |
|---|---|
| `acquire_vector` | Surrey GIN corridors from the City's ArcGIS MapServer, paged |
| `acquire_vri` | BC VRI treed stands over the Fraser Valley transect, stratified sample |
| `prepare` | Normalise dirty corridor attributes; derive the study extent |
| `acquire_raster` | Sentinel-2 optical + Landsat thermal composites via STAC |
| `acquire_climate` | ClimateBC point queries (rate-limited, resumable, disk-cached) |
| `align` | CRS assertion + inward-buffer edge decontamination (Surrey only) |
| `zonal` | Coverage-weighted raster → polygon reduction via `exactextract` |
| `assemble` | Build the CDEI target, join climate, write the panel |
| `experiment` | The A-vs-B resolution test, its diagnostics and its verdict rule |
| `explain` | Predictor-family comparison: what actually drives stand water stress |
| `corridor_stress` | The applied Surrey map and ranking |
| `validate_sar` | Independent Sentinel-1 radar check on that ranking |
| `paths` | Canonical paths anchored to the source tree, not the cwd |

## 2. The library stack, and why each

| Concern | Library | Why this one |
|---|---|---|
| Vector | `geopandas` 1.x + `shapely` 2.x | Vectorised geometry ops |
| Vector I/O | `pyogrio` | Arrow-based; GeoPandas' default engine |
| CRS | `pyproj` | Authoritative PROJ transforms, incl. NAD83↔WGS84 datum shifts |
| Raster | `rasterio` + `rioxarray` over `xarray` | Labelled, CRS-aware arrays with `.rio.reproject()` / `.rio.clip()` |
| STAC | `pystac-client` + `odc-stac` + `planetary-computer` | Query, then load matched items straight into a lazy dask-backed `xarray` |
| Zonal | `exactextract` | **Exact** pixel-fraction weighting (see §5) |
| ML | `scikit-learn` | Random forest + the CV machinery the experiment reuses |
| Env | `uv` | No conda needed; modern wheels bundle GDAL |

## 3. Coordinate reference system

**One projected analysis CRS: EPSG:26910 (NAD83 / UTM Zone 10N).** Metres,
correct for southwestern BC. Nothing computes a distance or an area in degrees.

Surrey's ArcGIS service publishes natively in 26910, so it is requested with
`outSR=26910` and needs no reprojection. Sentinel-2 arrives per-tile in UTM
(usually EPSG:32610) and is reprojected on load. `align` *asserts* the CRS match
rather than assuming it, and raises if a raster reaches it unprojected.

## 4. Acquisition

### 4.1 Vector

Surrey's Open Data portal is ArcGIS Hub; each layer exposes a REST endpoint that
caps results per request, so `acquire_vector` pages with
`resultOffset`/`resultRecordCount` until exhausted and caches raw pulls under
`data/raw/`.

The transect units are a harder problem, and `acquire_vri` documents the
decision: BC VRI treed stands are sampled 300 of 12,168 over a box capped at
49.20° N, stratified by BEC zone × easting quintile with sqrt-proportional
allocation. The latitude cap matters: without it the box reaches the North
Shore mountains and stops being a transect. Protected areas were evaluated as
an alternative unit and rejected (only 11–19 polygons, spanning 3 to 61,594 ha).

### 4.2 Raster: two providers, and a radiometric trap

`acquire_raster` supports **two independent STAC catalogues**, Element84 Earth
Search (default, no auth) and Microsoft Planetary Computer (anonymous token
signing), normalised behind a `Provider` abstraction. This is not
over-engineering: Planetary Computer was returning 504s during the initial
build, and a single-provider pipeline would have stopped.

The radiometric handling is the part worth reading. Sentinel-2 processing
baseline ≥ 04.00 stores a −1000 DN bottom-of-atmosphere offset. NDVI is a ratio,
but an *additive* offset does not cancel, so it must be removed, and it must
not be removed twice. Element84 items already have it removed at source.
Subtracting it again drives red reflectance negative, where a `clip(min=0)`
guard pins it at 0 and NDVI becomes exactly 1.0. **That is what produced Phase
2's apparent "NDVI saturation" in 87% of corridors: an artifact, not a canopy
signal.** The vendor metadata flag cannot be trusted either: 2022 scenes marked
`boa_offset_applied: False` carry the same DN magnitudes as ones marked `True`.
So `boa_offset_per_time` **measures** the offset from each scene's own dark
pixels, applies it along the time axis, and logs any disagreement with the
metadata. Over both study extents it measures as 0 DN.

Composites are per-summer (1 June – 31 August), per-pixel median for optical and
mean for thermal.

### 4.3 Climate: the pipeline's real bottleneck

ClimateBC exposes a live point-query endpoint, `LatLonEl` on `api6.climatebc.ca`,
returning every predictor for one (lat, lon, elevation) triple in ~0.3 s. It is
undocumented and **rate-limited to roughly 50 calls/hour per IP, with no batch
mode.** That constraint shapes the module more than anything else in the repo:

- one worker, paced by a token bucket (`--calls-per-hour`, default 48);
- a **permanent** on-disk cache, so re-running costs nothing for anything
  already fetched;
- checkpointing every 10 jobs, so an interrupted run resumes.

A full Surrey pass is 153 corridors × 5 periods = 765 calls ≈ 16 h; the transect
is 1,500 calls ≈ 33 h. Parallelism cannot help: the limit is per-IP. Elevation
comes from a real Copernicus GLO-30 DEM rather than being assumed constant,
because elevation is precisely what makes ClimateBC scale-free and is therefore
the whole mechanism under test.

## 5. Raster → polygon, the step everything depends on

Two decisions, both driven by corridor shape.

**Inward buffer (`align`, Surrey only).** Pixels straddling a corridor edge
blend canopy with road, lawn and roof. Each corridor is buffered inward by
**5 m**, a fraction of a pixel, not a whole one, because a full 10 m buffer
would erase the narrowest corridors outright. Where the buffer still collapses a
polygon, the original geometry is retained and the row flagged `too_thin`; this
happens to exactly **1 of 153** corridors. The buffer costs 16.5% of total
corridor area and moves median effective width from 49.4 m to 39.7 m, so every
Surrey dimension quoted in this project describes the buffered analysis
geometry.

**This step is not applied to the transect stands**, whose narrowest member is
42.6 m across, comfortably wider than a 30 m Landsat pixel. The asymmetry is
deliberate but it does mean Surrey and transect geometry figures are measured on
different conventions; both are reported in the preprint's methods.

**Coverage-weighted extraction (`zonal`).** `exactextract` weights each pixel by
the exact fraction of it inside the polygon. Whole-pixel counting badly biases
polygons that span only one or two pixels across, which describes a large
minority of Surrey corridors.

`zonal_bands` generalises this to any raster at any pixel size, so one function
serves the 10 m Phase 2 NDVI composite, the 20 m optical composite and the 30 m
Landsat LST. `coverage_frac` is recomputed from the actual pixel area each time.
A 30 m pixel is 9× the area of a 10 m one, and reusing a constant would
silently understate thermal coverage by that factor.

> **A diagnostic that does not do what its name suggests.** `coverage_frac`
> compares valid pixels to expected pixels using the same area-weighted count
> for both, so it reads ≈1.00 for every Surrey corridor and every transect stand
> alike. It detects *missing data*, not *spectral mixing*. It should not be
> cited as evidence against the mixed-pixel problem, and the preprint's
> Limitations say so explicitly.

Join key: the source `id` field is **not** unique (153 polygons share 144 ids,
because several corridors are split into parts), so `objectid` is what every table joins
on.

## 6. The target: CDEI

`assemble` is where the two halves meet. `CDEI = dry_dist / RLST`, where
`dry_dist` is the signed perpendicular distance from a polygon's (NDVI, SWCI)
position to a dry edge fitted once per panel, and `RLST` is that polygon's
summer land-surface temperature over its own multi-summer mean.

Two properties of this construction are load-bearing and are treated as findings
rather than implementation details:

- **`RLST` carries no between-polygon information.** Normalising each polygon
  against its own mean divides out all between-polygon temperature variation by
  construction. CDEI is numerically almost identical to `dry_dist` alone
  (ρ = +0.99997). The normalisation was chosen to absorb the 30 m-vs-20 m
  Landsat/Sentinel-2 resolution mismatch; this cost was discovered afterwards.
- **CDEI is defined relative to the panel it was fitted on.** Each extent gets
  its own dry edge, so values are comparable within an extent and not across
  extents.

> **Naming.** The column is `tvwsi` throughout `src/pipeline/` and in
> `features.parquet`, because the cached panels were built under the index's
> former name and renaming the field would invalidate them for no scientific
> gain. `tvwsi` the column and CDEI the index are the same quantity. The index
> was renamed because TVWSI belongs to Joshi et al. (2021).

## 7. The experiment

`experiment.py` holds everything constant except the spatial resolution of the
climate predictors: same target, same polygons, same summers, same learner,
same feature list, same folds, same seeds.

- **Model A:** ClimateBC sampled at each polygon's own location and elevation.
- **Model B:** *those same values*, averaged within coarse cells; each polygon
  takes its cell's value. Deriving B by degrading A is the central design
  decision: substituting a different coarse product would confound *which
  dataset* with *what resolution*, and only resolution is under test.

**Cross-validation is spatially blocked and polygon-grouped.** Folds are k-means
blocks over polygon coordinates, not random splits, so a model cannot score by
memorising a neighbour; and because the panel is multi-year, all rows for one
polygon stay in the same fold. Repeats re-seed the blocking so a result is not
one lucky partition. Comparison is fold-by-fold with a bootstrap interval over
folds. Every seed is fixed (base seed 26910).

**Predictors are climate-only** for the A-vs-B test. Admitting any
remote-sensing-derived feature would leak the target, since the target is itself
remote-sensing-derived.

### The verdict rule, and its weakness

`verdict()` requires two gates: a **contrast** gate (the coarsening must remove
a materially large share of predictor spatial variance) and a **skill** gate,
`MIN_SKILL_R2 = 0.0`, below which a model is no better than predicting the
mean and there is nothing to compare.

That second constant is a convenience threshold, not a standard from the
literature, and it is the least defensible thing in this module. Model B clears
it by three thousandths at a 25 km cell and misses it by three thousandths at
12 km, flipping the categorical label while the paired difference is unchanged.
`upscaling_diagnostics()` exists to run the contrast gate *before* drawing any
conclusion: it is what diagnosed Surrey's null as untestable rather than
negative. A rule stated in terms of the paired interval alone would be more
robust and is the recommended form for reuse.

## 8. Conventions

- **Data is never committed.** `data/{raw,interim,processed}/` is gitignored.
  Everything under it is regenerable from the pipeline.
- **Paths are cwd-independent.** `paths.py` anchors to its own file location
  walked up two levels, so `data/interim/optical_2023.tif` means the same file
  from the repo root, from a notebook launched in `~`, or from a REPL. Use
  `paths.INTERIM` in new code rather than `Path("data/...")`.
- **All randomness is seeded**, including the k-means blocking and the forests.
- Notebooks under `notebooks/` mirror the module sequence stage by stage and are
  executed clean before a phase is considered done.
