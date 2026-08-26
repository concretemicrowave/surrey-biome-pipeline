# Extent 1 (Surrey): why the A-vs-B experiment is inconclusive at municipal scale

> 📄 **The citable account of this work is the preprint,
> [10.32942/X2ZH5C](https://doi.org/10.32942/X2ZH5C)** (EcoEvoRxiv, posted
> 2026-08-26, CC BY 4.0, not peer reviewed). This file is the working record
> the preprint was written from, so it keeps the fold-level numbers, the
> sensitivity re-runs and the dead ends an 8,000-word manuscript had no room
> for. Where the two disagree the preprint is the corrected text.

> 🛑 **CORRECTION, 2026-08-08 — the transect verdict below is superseded.**
> The paired confidence interval used throughout this document was bootstrapped
> over 25 fold-differences (5 repeats × 5 blocks) treated as independent draws.
> The repeats re-split the same rows, so only the 5 blocks within a repeat carry
> independent information; pooling narrowed every interval by about 2.1×.
> Resampling within a repeat instead, **no interval on the transect excludes
> zero** — not at any cell size, not in any of 20 blocking seeds, and in only
> 1 of 8 forest configurations. The verdict at 25 km is **NOT SUPPORTED**, not
> FALSIFIED, and at 12 km it is INCONCLUSIVE.
>
> What survives is the direction, which is unanimous: the coarse model is better
> on the point estimate in all 32 configurations tested. What does not survive is
> the word "significantly". Every number below marked with the old interval
> should be read against this correction and against the sensitivity tables
> further down, which carry the corrected values and the downstream re-runs.

> **Naming:** the response variable is **CDEI** (Canopy Dry-Edge Index). It was
> called TVWSI in earlier drafts; that name belongs to Joshi et al. (2021),
> *Remote Sensing* 13(22):4635. The dataframe column is still `tvwsi`, and the
> cached panels were built under the old name and renaming the field would
> invalidate them. `tvwsi` the column and CDEI the index are the same quantity.

Status: **FINAL**, computed on the complete 153-polygon panel (612 rows =
153 polygons x 4 summers) on 2026-07-22, after ClimateBC acquisition finished
(765/765 jobs, 153/153 polygons with a full 5-period panel). These numbers
supersede the provisional 114-corridor estimates; every point estimate moved
slightly and **the diagnosis is unchanged**, as anticipated under "Why more
data cannot fix this".

## Headline

**VERDICT: INCONCLUSIVE.** Not "downscaling doesn't help". The experiment as
specified has nothing to measure at this study extent.

```
Model A (scale-free) : RMSE 0.01393  MAE 0.01057  R2 -0.042
Model B (coarse 4km) : RMSE 0.01397  MAE 0.01039  R2 -0.051
paired A-B rmse      : -0.00004  95% CI [-0.00028, +0.00018]  A better in 48% of folds
paired A-B mae       : +0.00018  95% CI [-0.00017, +0.00045]  A better in 28% of folds
```

⚠️ **Both intervals were rerun under the V6 per-repeat bootstrap on 2026-08-13**
and the block above now carries the corrected pair. The pre-V6 pooled-25 output
read `[-0.00016, +0.00007]` for RMSE and `[+0.00002, +0.00033]` for MAE. Point
estimates and verdict are unchanged, which is exactly why this row was never
propagated with the rest of V6: nothing that reads like a claim moved. The MAE
interval did move across zero, so anything asserting a detectable MAE
difference in Model B's favour over Surrey was resting on the old bootstrap.

Two independent preconditions of the test both fail.

## Precondition 1: no model has predictive skill

Every candidate target is at or below the no-skill line under spatially-blocked,
corridor-grouped CV. This is **not** specific to CDEI, which rules out "we
picked the wrong index" as the explanation:

| target | sd | Model A R² | Model B R² |
|---|---|---|---|
| tvwsi | 0.0138 | −0.042 | −0.051 |
| dry_dist | 0.0137 | −0.043 | −0.053 |
| ndvi_mean | 0.1216 | −0.232 | −0.154 |
| swci_mean | 0.0567 | −0.280 | −0.223 |
| lst_mean | 3.0962 | −0.655 | −0.578 |

## Precondition 2: coarsening barely changes the predictors

The 4 km upscale removes only ~12% of the predictors' spatial variance, so
Models A and B are very nearly the *same model* and a null difference between
them is arithmetic rather than a finding.

| coarse cell | cells over Surrey | median spatial variance removed |
|---|---|---|
| 4 km | 25 | 12.3% |
| 8 km | 12 | 24.1% |
| 12 km | 6 | 28.4% |
| 20 km | 4 | 39.6% |
| 30 km | 3 | 85.6% |

There is no escape inside Surrey: reaching meaningful contrast needs ~20 km
cells, which leaves 4 cells across the entire study area, too few to spatially
block Model B.

## Root cause: predictors and targets vary along orthogonal axes

This single table explains every symptom above.

| predictor | between-year sd | between-corridor sd | ratio |
|---|---|---|---|
| CMD_sm | 77.53 | 7.63 | **10.2× temporal** |
| PPT_sm | 73.04 | 11.60 | **6.3× temporal** |
| Tmin_sm | 0.80 | 0.29 | 2.7× temporal |
| Rad_sm | 0.19 | 0.07 | 2.5× temporal |
| DD18_sm | 35.32 | 14.75 | 2.4× temporal |
| Eref_sm | 9.16 | 3.90 | 2.3× temporal |
| Tmax_sm | 0.67 | 0.29 | 2.3× temporal |

| target | between-year sd | between-corridor sd | ratio |
|---|---|---|---|
| ndvi_mean | 0.0127 | 0.1194 | **9.4× spatial** |
| tvwsi | 0.0031 | 0.0126 | **4.1× spatial** |
| lst_mean | 1.03 | 2.88 | 2.8× spatial |

**ClimateBC varies mostly in time. Corridor water stress varies mostly in
space.** Spatially-blocked CV asks the model to rank corridors it has never
seen, exactly the axis along which climate is nearly constant across a 30 km
municipality. Between-corridor differences in water stress are presumably driven
by land cover, soil, canopy composition and irrigation, none of which are in the
predictor set.

## A tempting result that does NOT hold up

Stripping each corridor's own mean to isolate the temporal axis appears to give
skill, with a physically correct sign:

```
tvwsi (level)                     spatial CV R2 = -0.042
tvwsi within-corridor anomaly     spatial CV R2 = +0.051
corr(CMD_sm, tvwsi) across the 4 summer means = -0.677
```

**This is memorisation, not skill.** Spatial CV holds out *corridors*, not
*years*, so all four summers are in training and the model can simply learn four
year-means. The forward holdout is the test that cannot cheat:

```
tvwsi        train<2025 -> test 2025:  R2 = -0.041
tvwsi_anom   train<2025 -> test 2025:  R2 = -1.673
```

Catastrophically negative. **With four summers there is no defensible temporal
claim either**. Four points is not a time series. Do not cite the +0.051.

## A structural point about the experimental design

Even a working temporal model could not settle the resolution question. The
upscale averages within *(cell, year)*, which preserves the temporal signal
exactly, by design, so that only spatial detail is destroyed. On a purely
temporal target, Models A and B are therefore **identical by construction**.
Resolution can only be tested on the spatial axis, which is precisely the axis
where Surrey has almost no climate gradient.

## Why more data cannot fix this

The variance decomposition is a property of the ClimateBC field over Surrey, not
of the sample. This was written as a prediction on the 114-polygon panel and
has now been **confirmed**: adding the remaining 39 corridors (+34% rows) moved
every point estimate slightly and changed nothing structural. The full panel
still has no skill on any target, the 4 km upscale still removes only ~12% of
spatial variance, and the temporal/spatial ratios are if anything more extreme
(CMD_sm 9.4x -> 10.2x temporal). No sample from inside Surrey can manufacture a
spatial climate gradient that does not exist across 30 km of low-relief Fraser
Lowland terrain.

## What this implies

The hypothesis contains a hidden premise: that meaningful climate variation
exists *between corridors* to resolve. That premise is false at
single-municipality scale. The finding is therefore methodological:

> **Scale-free climate downscaling cannot be validated at intra-urban scale,
> because the spatial climate gradient within a municipality is far smaller than
> the interannual variation, and smaller still than the spatial variation in the
> ecological response being predicted.**

This is a genuine, useful negative result, and it is what motivates the transect
transect: test the method where climate actually varies in space, then apply the
conclusion back to Surrey.

## Code consequences already committed

* `experiment.verdict()` now gates on both preconditions (model skill, and
  spatial variance removed) and returns INCONCLUSIVE when either fails, rather
  than reporting a bare "NOT SUPPORTED" that would read as evidence against
  downscaling. See `MIN_SKILL_R2` and `MIN_CONTRAST_FRAC`.
* `assemble.mahalanobis_novelty()` scales by the covariance of the *departures*
  from normal, not the spatial covariance of the normals themselves. The latter
  is near-singular over a low-relief 30 km area and inflated novelty by an order of
  magnitude (median 14.3 -> 1.87 (1.87 on the full panel too; p95 3.21)), while ranking unusual *locations* rather than
  unusual climate.

---

# Extent 2 (Fraser Valley transect): the test becomes measurable, and the hypothesis falls

Status: **FINAL**, computed on the complete Fraser Valley transect panel (1,200
rows = 300 VRI stands x 4 summers) on 2026-07-24, after ClimateBC acquisition
finished (1,500/1,500 jobs, 300/300 stands with a full 5-period panel). Same
experiment, same code (`experiment.py`), same variables and folds. **Only the
study extent changed**, from Surrey's low-relief 30 km extent to a 100 km / 4–1,920 m
south-of-Fraser elevation transect. Surrey stays the *application* site; the
transect is where the method question can actually be asked.

## Headline

**VERDICT: NOT SUPPORTED** (at a realistic 25 km regional-grid cell). Unlike
Surrey, the test now has something to measure, and the answer is that scale-free
climate resolution does **not** help. The coarse grid is better on the point
estimate in every configuration tested, but not distinguishably so.

> ⚠️ **Read this together with "Robustness" below.** The interval excludes zero
> in 1 of 8 forest configurations and in none of 20 blocking seeds, and the
> verdict label itself turns on a hard skill threshold that 12 km lands the other
> side of. The defensible claim is a consistent direction, not a resolved effect.

```
Model A (scale-free ~1 km) : RMSE 0.02565  MAE 0.01583  R2 -0.138
Model B (coarse 25 km)     : RMSE 0.02472  MAE 0.01560  R2 +0.003
paired A-B rmse : +0.00093  95% CI [-0.00061, +0.00257]  A better in 40% of folds
paired A-B r2   : -0.14127  95% CI [-0.40790, +0.04430]  A better in 40% of folds
```

Both CIs now span zero: the fine-scale spatial detail in scale-free ClimateBC is
not merely unhelpful, it is **anti-informative** for stand water stress: noise
the coarse average smooths away.

## Precondition 2 now PASSES: the extent is big enough to blur

This is the half Surrey structurally failed. Over the transect, coarsening the
grid removes a large and growing share of the predictors' spatial variance, so
Model A and Model B become genuinely different models and the A-vs-B contrast is
real rather than arithmetic:

| coarse cell | cells over the transect | median spatial variance removed | verdict |
|---|---|---|---|
| 4 km | 101 | 13.4% (≈ Surrey's 12% ceiling) | inconclusive |
| 8 km | 40 | 29.0% | inconclusive |
| 12 km | 23 | 34.4% | inconclusive |
| 25 km | 10 | 48.4% (leading predictors 58–68%) | **not supported** |

At 25 km, a faithful stand-in for the grid resolution of the regional climate
models the hypothesis set out to beat, the median predictor loses ~half its
spatial variance and the leading ones (Eref, Tmax, CMD) lose two-thirds, while
10 cells still leave enough geographic spread to spatially block Model B.

## Precondition 1 still FAILS, but now for a diagnosable reason

No climate resolution has spatial skill: Model A's spatially-blocked CV R² is
**−0.138**, worse than predicting the mean. The reason is visible directly in the
data, and it is *not* Surrey's orthogonal-axes problem: here the target varies
strongly in space:

| quantity | between-stand sd | between-year sd | ratio |
|---|---|---|---|
| CDEI | 0.0241 | 0.0022 | **122× spatial** |

CDEI varies 122× more between stands than between years, the exact *inverse* of
Surrey, where the target was mostly temporal. So there is a strong spatial signal
to predict. The climate gradient simply does not align with it:

```
Spearman rho, stand-mean CDEI vs the spatial gradient
  CMD_sm  -0.093     Tmax_sm -0.139     Eref_sm -0.138     elevation +0.145
```

Both predictor and target vary across the transect, but along **orthogonal
spatial patterns** (|rho| ≤ 0.15). The macroclimate/elevation gradient is not
what organizes between-stand water stress.

## What DOES drive between-stand water stress

The follow-up analysis (`explain.py`, same blocked CV) compares predictor
families against CDEI. RS bands (NDVI/SWCI/LST) are excluded as predictors,
CDEI is built from them, so they would be circular.

| predictor family | n | CV R² | folds R²>0 |
|---|---|---|---|
| climate (baseline) | 14 | −0.138 | 40% |
| terrain (slope/aspect/ruggedness/elev) | 5 | −0.085 | 44% |
| stand structure (age/height/crown/species) | 24 | +0.004 | 68% |
| **terrain + structure** | 29 | **+0.029** | 80% |
| terrain + structure + climate | 43 | +0.020 | 60% |

Terrain + stand structure is the only family that crosses into positive skill
(positive in 80% of folds; R² +0.044 on pure stand-means). Adding climate on top
makes it *worse* (+0.029 → +0.020), confirming the climate gradient is noise for
this target. The leading drivers, by permutation importance on a held-out spatial
block, are **local**: leading species (bigleaf maple), stand area, aspect
(eastness then northness) and broadleaf class. No climate variable appears.

## Robustness of the transect verdict, and the qualification it does not survive

Two follow-up analyses were run after the headline above was first written. The
first strengthens the result; the second genuinely weakens it, and the weaker
claim is the one the evidence supports.

**Seed sensitivity: the margin is not noise.** Model B clears the skill gate by
about three thousandths, which invites the objection that `R² = +0.003` is an
artifact of which random partition the k-means blocking happened to draw. The
whole experiment was re-run across independent seeds, re-seeding both the spatial
blocking and the forest (`scripts/seed_sensitivity.py`):

| cell | seeds | R²_B (mean ± sd) | R²_B > 0 | paired ΔRMSE | CI excludes 0 |
|---|---|---|---|---|---|
| 12 km | 20 | −0.0029 ± 0.0014 | 0 / 20 | +0.00094 | 0 / 20 |
| 25 km | 20 | **+0.0033 ± 0.0005** | **20 / 20** | +0.00093 | **0 / 20** |

The verdict label is a deterministic function of the cell size rather than a lucky
draw, and the paired difference is equally reproducible — but reproducibly
*indistinguishable from zero*, in **0 of 40 runs** across both cell sizes. The
blocking seed is not a source of doubt about either finding. Note what this does
*not* rescue: +0.003 is a stable measurement, not a meaningful amount of skill.

**Hyperparameter sensitivity: statistical significance is NOT stable.** The forest
settings were fixed a priori and never tuned, so the experiment was re-run at 25 km
across eight configurations (`data/processed/hp_sensitivity_phase3b.csv`). Model B
is better on the point estimate in **all eight**, and R²_B never leaves
[+0.001, +0.004], but the paired interval **excludes zero in only one of eight**
— the least constrained forest, which is also the one where Model A overfits
hardest (regenerate with `scripts/cell_hp_sensitivity.py`):

| trees | leaf | max_features | R²_A | R²_B | paired ΔRMSE (95% CI) | verdict |
|---|---|---|---|---|---|---|
| 400 | 1 | sqrt | −0.249 | +0.001 | +0.00222 [+0.00020, +0.00393] | falsified |
| **400** | **3** | **sqrt** | **−0.138** | **+0.003** | **+0.00093 [−0.00061, +0.00257]** | **not supported** |
| 400 | 5 | sqrt | −0.094 | +0.003 | +0.00049 [−0.00072, +0.00203] | not supported |
| 400 | 10 | sqrt | −0.060 | +0.004 | +0.00023 [−0.00086, +0.00161] | not supported |
| 200 | 3 | sqrt | −0.143 | +0.003 | +0.00097 [−0.00060, +0.00263] | not supported |
| 800 | 3 | sqrt | −0.136 | +0.003 | +0.00090 [−0.00065, +0.00255] | not supported |
| 400 | 3 | 0.5 | −0.191 | +0.003 | +0.00146 [−0.00060, +0.00350] | not supported |
| 400 | 3 | 1.0 | −0.236 | +0.002 | +0.00195 [−0.00050, +0.00440] | not supported |

R²_A climbs monotonically from −0.249 to −0.060 as leaf size grows while R²_B does
not move: Model A's deficit is substantially **overfitting to fine-grained climate
detail**, and constraining the forest suppresses it. That is mechanistically the
same claim this document makes, but it means the *significance* of the gap depends
on how hard the learner is allowed to chase that detail.

**So the defensible statement is weaker than the headline above.** The coarse model
is never worse, and is better on the point estimate under every forest setting
tested including the pre-registered one, **with the qualification that only the
least constrained forest produces an interval excluding zero, so the gap is
statistically unestablished throughout**. The claim that
the fine-scale gradient carries no usable signal does not rest on the forest
comparison alone: it is independently supported by the rank correlations
(|ρ| ≤ 0.15) and by the explanatory analysis, where adding climate to a
terrain-and-structure model makes it worse.

One further caveat on the label itself: the 25 km verdict turns on R²_B
clearing a hard threshold of exactly 0.000. At 12 km the paired difference is
statistically indistinguishable from the 25 km one, yet the label reads
`INCONCLUSIVE` because R²_B lands three thousandths the other side. The paired
intervals are what the conclusion rests on; the categorical label is a threshold
artifact in a way the underlying evidence is not.

## Two honesty flags

1. **The explanatory signal is weak.** Best CV R² ≈ +0.03–0.04. This is a
   *directional* result, "the driver is local stand attributes, not the climate
   gradient", not a strong predictive model. Most between-stand CDEI variance
   remains unexplained by anything measured (aspect and species help; soil depth,
   rooting, groundwater and management are absent from the feature set).
2. **Part of that explanation may be a vegetation-type artifact.** Leading-species
   and broadleaf/conifer class ranking highest is consistent with CDEI partly
   encoding canopy *type* (broadleaf and conifer stands occupy different regions
   of the NDVI–SWCI–LST feature space CDEI is constructed in) rather than water
   stress per se. Worth carrying into any downstream claim.

## What this implies

Surrey could not test the hypothesis (predictor and target varied on different
axes: space vs time). The transect **can**, and the result is unambiguous in
direction:

> **Where a real spatial climate gradient exists, scale-free downscaled climate
> still does not beat coarse grid climate for corridor/stand water stress, and the
> coarse grid is if anything better, because water stress at this scale is
> governed by local terrain aspect and stand composition, not by the macroclimate
> gradient that downscaling resolves.**

For the Surrey Green Infrastructure application this sharpens the earlier
conclusion: the monitoring asset is *which corridors are stressed and why*, and
the "why" is local (aspect, canopy composition, stand structure), not something
a finer climate product would surface. Climate resolution is the wrong lever;
the RS-derived stress index and local stand/terrain context are the right ones.

## Code added

* `src/pipeline/explain.py`: derives per-stand terrain (slope, aspect as
  northness/eastness, ruggedness, elevation) from the Copernicus GLO-30 DEM and
  scores predictor families under the experiment's own blocked CV. CLI:
  `python -m src.pipeline.explain -v` (add `--build-terrain` to re-derive from
  the DEM; otherwise loads `data/interim/phase3b/terrain_stands.parquet`).
* Walkthrough: `notebooks/phase3b_modeling.ipynb`, mirroring the Surrey one.
