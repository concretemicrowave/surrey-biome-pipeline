# RUNBOOK — Surrey Biome Pipeline

Acquisition commands, completed-run records and finished migrations, moved out of
`CLAUDE.md` on 2026-08-14 to keep that file inside its 300-line cap. Nothing here
is a standing instruction. It is the reference you want when re-running a stage,
reproducing a published number, or checking how something was originally built.

Live rules stay in `CLAUDE.md`. Results and their interpretation stay in
`docs/RESOLUTION_TEST_FINDINGS.md`. The manuscript weakness register stays in
`docs/papers/KNOWN_ISSUES.md`. The first and third of those are local to the
author's working copy and are not in this repository, since the manuscript is
held until the preprint is posted.

---

## Phase 3: the "execute the Phase 3 plan" trigger

Phase 3 is COMPLETE (2026-07-22), so this trigger is spent. Kept because the
non-negotiables at the end still bind any re-run.

When the user says **"execute the Phase 3 plan"**, follow **`PHASE3_PLAN.md`**
(repo root) — it is the source of truth (Gemini draft + 4 engineering
corrections). Critical path: ClimateBC acquisition → NDVI→TVWSI → multi-year
assembly → the A-vs-B experiment. Build incrementally, verify each step on real
data, commit per module (data stays gitignored), and **end with a walkthrough
notebook `notebooks/phase3_modeling.ipynb`** mirroring the Phase 2 one
(`phase2_pipeline.ipynb`): stage-by-stage, with visualizations, executed headless
clean (0 errors) before it's considered done. First confirm the 3 open decisions
at the bottom of PHASE3_PLAN.md (ClimateBC batch mechanism, which summers, coarse
cell size). Non-negotiables from the corrections: real spatially-blocked CV (not
random splits), Model B = upscaled SAME variables (not a different product),
climate-only predictors for the A-vs-B test (no RS-derived leakage), group-by-
corridor folds for multi-year rows.

---

## ClimateBC acquisition

**ClimateBC acquisition for Surrey is COMPLETE** (2026-07-22 17:49; 765/765
jobs, 153/153 corridors with a full 5-period panel). The web API allows only 50
calls/hour per IP (undocumented; no batch endpoint). `acquire_climate.py` is
paced and resumable with a permanent disk cache in `data/raw/climatebc/` —
re-running is free for anything already fetched. A full 153-corridor × 5-period
pass is 765 calls ≈ 16 h. Phase 3b will need the same mechanism; to run it or
top up Surrey:
```bash
nohup .venv/bin/python -m src.pipeline.acquire_climate -v --calls-per-hour 46 \
  > logs/acquire_climate.log 2>&1 &
```
Track it live with `./scripts/climate_progress.sh [--watch]`. Keep the Mac awake
while it runs (`caffeinate -s -w <pid>`) — a system sleep freezes the process and
silently adds hours.

---

## Phase 3 finalization sequence

Re-run this after any upstream change.

**Phase 3 has been finalized on the full panel** (612 rows = 153 corridors × 4
summers) with this sequence — re-run it after any upstream change:
```bash
.venv/bin/python -m src.pipeline.acquire_climate --max-calls 0 -v  # tables from cache
.venv/bin/python -m src.pipeline.assemble -v      # -> data/processed/features.parquet
.venv/bin/python -m src.pipeline.experiment -v    # A vs B verdict
jupyter nbconvert --to notebook --execute --inplace \
  --ExecutePreprocessor.kernel_name=surrey-biome notebooks/phase3_modeling.ipynb
```
Rasters (`optical_{year}.tif`, `lst_{year}.tif` for 2022–2025) are already built.
Note the harvest step re-attaches elevation via a Planetary Computer DEM STAC
search, which intermittently times out; it is only needed if the climate tables
in `data/interim/` are stale, so on a timeout check their timestamps before
retrying.

---

## Phase 3b acquisition, as it ran

Phase 3b is COMPLETE (2026-07-24). Same experiment, same code, only the study
extent changed. Surrey stayed the application site; the transect is where the
method question got answered. The analysis and finalization sequence is in
`docs/RESOLUTION_TEST_FINDINGS.md` and `notebooks/phase3b_modeling.ipynb`.

**Analysis units are decided and built.** `src/pipeline/acquire_vri.py` fetches
BC VRI treed stands from the BC Data Catalogue WFS over a south-of-Fraser box
(latitude capped at 49.20 N — without the cap it reaches the North Shore
mountains and stops being a transect) and samples 300 of 12,168, stratified by
BEC zone x easting quintile with sqrt-proportional allocation. Output:
`data/interim/phase3b/transect_stands.gpkg`, layer **`stands_analysis`** (plus
`stands_all`, `protected_areas`, `study_extent`). Elevation **4–1,920 m** across
100 km, against Surrey's −1 to 116 m — that gradient is the entire point.
Protected areas were **rejected** as units (11–19 polygons, 3 ha to 61,594 ha);
kept only as a validation subset. Re-run with
`.venv/bin/python -m src.pipeline.acquire_vri -v`.

**Two long jobs run concurrently. They do not contend** — the climate fetcher is
rate-limited and idle at 0% CPU; the raster job is bandwidth/CPU-bound.

```bash
# 1. ClimateBC — 1500 jobs (300 stands x 5 periods), ~33 h at 46 calls/hour
nohup .venv/bin/python -m src.pipeline.acquire_climate -v \
  --corridors data/interim/phase3b/transect_stands.gpkg \
  --layer stands_analysis --out-dir data/interim/phase3b \
  --calls-per-hour 46 > logs/acquire_climate_phase3b.log 2>&1 &
caffeinate -s -w <pid> &     # -s only asserts on AC power; keep it plugged in

# 2. Sentinel-2 + Landsat composites over the transect (no rate limit)
nohup sh -c '.venv/bin/python -m src.pipeline.acquire_raster --mode optical \
   --extent-json data/interim/phase3b/study_extent.json \
   --out-dir data/interim/phase3b -v && \
 .venv/bin/python -m src.pipeline.acquire_raster --mode thermal \
   --extent-json data/interim/phase3b/study_extent.json \
   --out-dir data/interim/phase3b -v' > logs/acquire_raster_phase3b.log 2>&1 &
```

`./scripts/climate_progress.sh [--watch] [logfile]` now reads its totals from the
log's `planned N jobs` line and defaults to the newest `logs/acquire_climate*.log`,
so it serves both runs. Completion is detected from `execute_jobs done` — the job
counter alone stops short (checkpoints every 10 jobs), which is why a cleanly
finished Surrey run once read as "756/765, stalled".

The transect raster job is **7x Surrey's area** (2,841 vs 408 km²; 5072x1400 px
at 20 m) but only ~15–17 solar days per summer across 2 MGRS tiles, and
`build_optical_composite` is dask-chunked, so it fits. BOA offset measures as
**0 DN**, confirming the Phase 2 correction holds on the new extent.

✅ **Rasters are DONE** (2026-07-23, ~30 min): `optical_{2022..2025}.tif` and
`lst_{2022..2025}.tif` in `data/interim/phase3b/`, 99.7–100% valid pixels, all
EPSG:26910, all covering the 300 stands. Zonal verified end-to-end on 2025:
median NDVI 0.852, SWCI 0.377, LST 21.7 °C, **coverage_frac median 1.00 with no
stand below 0.5** — VRI stands are large enough that Surrey's thin-corridor
pixel problem disappears. Note LST already spans **16.1–38.8 °C** between
stands, against Surrey's ~3 °C sd: the elevation gradient is showing up in the
*target*, not just the predictor. Encouraging for precondition 1, not yet
evidence. Ignore the `Error in sys.excepthook` lines at the end of the raster
log — interpreter-shutdown noise after all outputs were written and verified.

**When both finish**, the Phase 3b sequence mirrors Phase 3 — but run the sanity
gate FIRST: `experiment.upscaling_diagnostics()` must remove materially more
than Surrey's 12% of spatial variance, or the transect is also too small and the
extent has to grow before any conclusion is drawn.

**Phase 3b must clear BOTH preconditions, not just the blurring one.** Phase 3's
"no model has skill on any target" failed independently of the 12%. If stand
moisture turns out to be driven by aspect, soil depth and stand age rather than
the climate gradient, the result is no skill again — different reason, same wall.

---

## The manuscript unit pass (corridor id vs objectid), DONE 2026-07-29

The rule this enforced is live and stays in `CLAUDE.md`. This is the record of
the one-time migration.

✅ **The manuscript unit pass is DONE (2026-07-29).** 49 asserted-exact edits to
the then-canonical monolith (now `_archive/monolith-latex/main.tex`; the edits
carried into `paper-a/` at the split), plus regenerated figures, rebuilt PDFs,
and the same fix in `docs/deliverable/README.md`. What was there:
- ~5 places where the *number* was wrong (facts about the City → 144), including
  the abstract and §1;
- ~40 where 153 was right but the *noun* was wrong (`corridor-summers` →
  `polygon-summers`, `n = 153 corridors` → `n = 153 polygons`, `within-corridor`
  → `within-polygon` wherever the quantity was computed on the panel);
- Table 1 was a polygon top-10 labelled "Corridor" with **objectids**, listing GIN
  14 twice — now the GIN top-10 with a `Polys` column. `fig2_top_ranking.png` had
  the same duplication and now takes `gin_table()`; `fig_top_ranking` warns if it
  is handed the polygon table again.

Kept as "between-corridor" on purpose: the ranking caveats (§3.4, §3.5, §5, Limits
item 1). That ranking is delivered at corridor level and *inherits* the canopy
confound, which §3.5 now says explicitly — switching those to "between-polygon"
would read as if the corridor ranking escaped it. New Methods §2.1 paragraph
"Two units at Extent 1" defines both units and records the CV check.

---

## `--freeze-from` status note, 2026-07-29

The capability itself is documented in `CLAUDE.md`. This is the run state at the
time, retained because it dates the 2017-2021 backfill.

> Rasters for **2017-2021 are built**; ClimateBC for those years was fetching as
> of 2026-07-29 (ETA Thu 30 Jul ~04:15), and it is what fills the `[ n = 9 ]`
> slot in §5.5's temporal check.

---

## NotebookLM note inventory, 2026-07-30

Superseded by `notebooklm note list`, which is authoritative. Kept only so the
progress series can be recognised by name.

Notebook id: `af309232-c9e6-4930-baee-e153878ce0c2`. **16 notes as of 2026-07-30**
— including *Interview Coach — Brief and Protocol* (`7252e6e1`), which is not a
progress note: it reassigns Gemini a second role as interview coach, with a
teach/test protocol, the numbers to drill, the nine ranked attack surfaces, and
why each reference is cited. Source lives at
`docs/interview_coach_notebooklm_note.md`; edit there and re-push, don't retype.
Earlier notes are the progress series —
— Phase 1 Synthesis, Grounded Q3, Phase 2 Progress, Phase 3 Plan, Phase 3 COMPLETE,
Phase 3b LAUNCHED, Phase 3b RESULT, TVWSI Validation, NDVI-saturation CORRECTION,
Project Direction, and *Preprint Drafted + Citations Verified + 2 Open Issues*.
Run `notebooklm note list` for the current set rather than trusting this list.
