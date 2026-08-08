# surrey-biome-pipeline

A controlled test of whether high-resolution **"scale-free" downscaled climate data**
predicts polygon-scale water stress better than **coarse climate grids**, plus the
satellite monitoring index built after that approach was shown not to work.

**It does not.** At a realistic 25 km regional-grid cell size, the *spatially
degraded* model significantly outperformed the scale-free one on forest-stand
water stress. Fine spatial detail in the climate predictors behaved as noise
rather than signal. Water stress at this scale is organised by local terrain and
stand composition, not by the macroclimate gradient.

This repository is the code, method and applied output. The full write-up is a
manuscript in preparation for a preprint server. **It has not been posted,
submitted or peer reviewed**, and this README will link its DOI once it is. Until then,
[`docs/PHASE3_FINDINGS.md`](docs/PHASE3_FINDINGS.md) is the detailed account of what
the two extents found.

---

## The experiment in one paragraph

Two models are compared with **everything held constant except the spatial
resolution of the climate predictors**:

- **Model A:** ClimateBC values sampled at each polygon's own location and elevation (~375–750 m effective).
- **Model B:** *those same values*, spatially averaged within coarse cells; each polygon takes its cell's value.

Deriving B by degrading A rather than substituting a different coarse product is
the central design decision: otherwise the comparison would confound *which
dataset* with *what resolution*, and only resolution is under test. Both are random forests scored under
repeated, spatially-blocked, polygon-grouped cross-validation, compared
fold-by-fold with a bootstrap interval over folds.

The same experiment is run at two extents:

| Extent | Units | Rows | Coarse cell | Outcome |
|---|---|---|---|---|
| **Surrey GIN** (application site) | 153 corridor polygons × 4 summers | 612 | 4 km | Unresolvable: the extent cannot test the hypothesis, and that is measurable |
| **Fraser Valley transect** (test site) | 300 VRI forest stands × 4 summers | 1,200 | 25 km | Hypothesis reversed: the coarse model is better |

Surrey returned a null. Rather than write that off as evidence against
downscaling, I asked whether the experiment had been capable of detecting a
difference at all: coarsening to 4 km removed only **12.3%** of the predictors'
spatial variance, so Models A and B were very nearly the same model. I repeated
the identical experiment on a 100 km elevation transect spanning 4 to 1,920 m,
where coarsening raises that to **48.4%**, which is where the question could
actually be answered.

That diagnosis generalises into a **precondition other studies can apply**: before
comparing climate resolutions, measure what fraction of predictor spatial variance
the coarsening destroys, and treat a low fraction as disqualifying rather than as
a null result.

## Headline numbers

| Quantity | Value |
|---|---|
| Paired ΔRMSE (RMSE_A − RMSE_B), transect @ 25 km | **+0.00093**, 95% CI [+0.00021, +0.00170] |
| Model A R² (scale-free) @ 25 km | −0.138, materially worse than predicting the mean |
| Model B R² (coarse) @ 25 km | +0.003, merely matches the mean |
| Paired interval excludes zero | 32 of 32 runs, across two cell sizes and independent seeds |
| Stand CDEI vs climate gradient | Spearman \|ρ\| ≤ 0.15 (n = 300) |
| Terrain + stand structure, CV R² | **+0.029** (positive in 80% of folds, against climate's 40%) |

Neither model reached usable skill. The finding is about the **comparison**, in
which fine-scale detail is an active hazard for this response while the coarse
average is merely uninformative. It is not a finding that either model is good.

### Two caveats on those numbers

The **paired difference** is what the conclusion rests on, and it is robust: it
favours the coarse model at every cell size, seed and hyperparameter setting
tested. The **categorical verdict label** is much less robust, in two ways that
the reproduction commands below will show you directly.

- The label depends on the cell size. The verdict rule requires
  `max(R²_A, R²_B) > 0`, and Model B clears that by three thousandths at 25 km
  but misses it by three thousandths at 12 km. So `seed_sensitivity.py 25000 20`
  prints `FALSIFIED` 20 times and `seed_sensitivity.py 12000 12` prints
  `INCONCLUSIVE` 12 times, while the paired ΔRMSE is +0.00093 and +0.00094
  respectively, statistically indistinguishable. The gate is a convenience
  threshold of my own construction, not a standard, and this is its weakest point.
- Significance depends on how hard the forest is allowed to overfit. Across
  eight hyperparameter settings the coarse model is better on the point estimate
  in all eight, but the paired interval excludes zero in only six, because heavy
  regularisation closes the gap to indistinguishability: Model A's
  deficit is substantially overfitting to fine climate detail.

Both are reported in full in [`docs/PHASE3_FINDINGS.md`](docs/PHASE3_FINDINGS.md).
The direction of the result does not depend on either, and is independently
supported by the rank correlations and the explanatory analysis. The word
"falsified" does.

## The response variable: CDEI

Water stress is measured per polygon per summer as **CDEI**, computed from free
imagery: NDVI and a shortwave-infrared canopy-water proxy (SWCI) from Sentinel-2,
and land-surface temperature from Landsat 8/9. It adapts the dry-edge logic of the
Temperature–Vegetation Dryness Index to an NDVI–SWCI feature space.

![CDEI feature space: 612 corridor-summers plotted by greenness against canopy
water, with the fitted dry edge](docs/figures/cdei_feature_space.png)

*All 612 corridor-summers, with the dry edge as `assemble.dry_edge` actually fits
it. Everything plotted is measured, not illustrative. Regenerate with
`python scripts/plot_cdei_feature_space.py`.*

The rename was deliberate. An earlier version of this work called the index TVWSI
(Temperature–Vegetation Water Stress Index), a name that already belongs to
[Joshi et al. (2021)](https://doi.org/10.3390/rs13224635), and one that
overstates what this index does, since its thermal term carries no
between-polygon information (see below). The dry-edge construction is also not
novel: [Le et al. (2024)](https://doi.org/10.3390/f15060915) build a comparable
index in NDII–NDVI space. What is claimed here is the application and the
validation, not the geometry.

> **Note on the code:** the column holding this quantity is still named `tvwsi`
> in `features.parquet` and throughout `src/pipeline/`. The cached panels were
> built under the former name, and renaming the field would invalidate them for
> no scientific gain. `tvwsi` the column and CDEI the index are the same quantity.

**CDEI is a relative feature-space index, not a soil-moisture measurement**, and it
has not been validated against any ground observation. Two findings from its own
validation are load-bearing:

1. **The between-corridor ranking has no independent confirmation.** Sentinel-1
   radar does not corroborate it as water stress, and correlating CDEI against NDVI
   directly gives ρ = −0.35 (n = 153), so the index is entangled with canopy
   density. Ranking corridors by how dry they are for their own density does
   reproduce the published order (ρ = +0.92), so density is not what orders it.
   The corridor map is **exploratory**, not a restoration priority list.
2. **The thermal term carries no between-polygon information.** Because it
   normalises each polygon against its own multi-summer mean, all between-polygon
   temperature variation divides out by construction. CDEI is numerically almost
   identical to the dry-edge distance alone (ρ = +0.99997).

## Repository layout

```
src/pipeline/       # importable modules, each with a __main__ CLI
  acquire_vector    # Surrey GIN corridors from the City's ArcGIS MapServer
  acquire_vri       # BC VRI forest stands over the Fraser Valley transect
  prepare           # clean corridor attributes, derive study extent
  acquire_raster    # Sentinel-2 + Landsat composites via STAC
  acquire_climate   # ClimateBC point queries (rate-limited, resumable, disk-cached)
  align / zonal     # CRS handling + coverage-weighted zonal statistics
  assemble          # build the CDEI target + climate predictor panel
  experiment        # the A-vs-B resolution test and its verdict rule
  explain           # what actually drives between-stand water stress
  corridor_stress   # the applied Surrey stress map + ranking
  validate_sar      # independent Sentinel-1 validation of the ranking
  paths             # canonical paths, resolved from the source tree

notebooks/          # stage-by-stage walkthroughs, executed clean
docs/               # findings write-up and the applied deliverable
docs/deliverable/   # the Surrey corridor stress map, ranking and caveats
scripts/            # seed-sensitivity re-runs, progress monitor, figure plotting
tests/
data/               # gitignored, never committed; all of it is regenerable
```

## Setup

```bash
uv venv --python 3.12
uv pip install -e ".[dev]"     # [dev] adds jupyter, pytest, ruff, matplotlib
```

Paths are **cwd-independent**. The package installs editable and every default
path resolves from `src/pipeline/paths.py`, anchored to the source tree, so the
CLIs and notebooks run from any directory.

## Reproducing the analysis

Every module has a CLI; `-v` turns on progress logging.

```bash
# 1. Vector units + study extent
python -m src.pipeline.acquire_vector -v
python -m src.pipeline.prepare -v

# 2. Satellite composites (Sentinel-2 optical, Landsat thermal), per summer
python -m src.pipeline.acquire_raster --mode optical  -v
python -m src.pipeline.acquire_raster --mode thermal  -v

# 3. Climate predictors (SLOW, see the note below)
python -m src.pipeline.acquire_climate -v --calls-per-hour 46

# 4. Build the panel, then run the test
python -m src.pipeline.assemble   -v      # -> data/processed/features.parquet
python -m src.pipeline.experiment -v      # A vs B verdict

# 5. Applied outputs and independent validation
python -m src.pipeline.corridor_stress -v
python -m src.pipeline.validate_sar    -v

# 6. Robustness: re-run the verdict across seeds at a given cell size
python scripts/seed_sensitivity.py 25000 20
python scripts/seed_sensitivity.py 12000 12
```

> **ClimateBC acquisition is the bottleneck.** The web API allows roughly
> **50 calls/hour per IP** (undocumented; there is no batch endpoint). A full
> 153-corridor × 5-period pass is 765 calls, about 16 hours. The transect's
> 300 stands take about 33 hours. The fetcher is paced, resumable, and keeps a
> permanent disk cache, so re-running costs nothing for anything already fetched.
> Track a run with `./scripts/climate_progress.sh --watch`.

Run the tests with `pytest`, and lint with `ruff check`.

## Conventions

- **Analysis unit is always the polygon**, never a grid cell. Model B's coarse
  cells are a device for degrading predictors. No quantity is ever computed for a
  cell, and no cell is ever a row.
- **Analysis CRS is EPSG:26910** (UTM 10N). Everything is reprojected before any
  spatial operation.
- **Data is never committed.** `data/{raw,interim,processed}/` is gitignored.
  Rasters and vectors stay local and are all regenerable from the pipeline.
- **All randomness is seeded** (base seed 26910), including the k-means spatial
  blocking and the forests.

## Data sources

All public, all free: City of Surrey Open Data (GIN corridors); BC Data Catalogue
(VRI, BEC); ClimateBC (`api6.climatebc.ca`); Sentinel-1/2 and Landsat 8/9 via
public STAC catalogues (Element84 Earth Search and Microsoft Planetary Computer,
with fallback between them); Copernicus GLO-30 DEM.

Raw and intermediate data are not redistributed here.

## Reading order

| If you want | Read |
|---|---|
| What the two extents found, with every number | [`docs/PHASE3_FINDINGS.md`](docs/PHASE3_FINDINGS.md) |
| The applied Surrey output, with its caveats | [`docs/deliverable/README.md`](docs/deliverable/README.md) |
| The engineering design and why each library | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| To run it yourself | [Reproducing the analysis](#reproducing-the-analysis), above |

## Status

Phases 1–3b are complete: the experiment has been run at both extents, the
explanatory analysis is done, and the applied index has been through independent
validation. The manuscript is in preparation and has **not** been posted,
submitted or peer reviewed. Nothing here should be described as published. The
Surrey corridor ranking is exploratory pending ground confirmation.

## Use of generative AI

Generative AI tools were used in preparing this work. They are disclosed here
rather than credited as contributors, because a tool cannot take responsibility
for the content it helps produce. Claude (Anthropic) was used to scaffold code in
`src/pipeline/`, to draft technical prose including this README and the
documentation under `docs/`, and to perform mechanical cleanups such as lint fixes;
Gemini, accessed through NotebookLM, was used as an adversarial reviewer of drafted
sections. The author designed the study, ran and verified every analysis reported
here, and is responsible for all content, including the interpretation of the
results and any errors that remain.

## License

Code is released under the MIT License (see [`LICENSE`](LICENSE)). Documentation and
figures under `docs/` are © the author.
