# Surrey GIN Corridor Water-Stress — Applied Deliverable

A satellite-based tool for tracking water stress in the City of Surrey's 144
Green-Infrastructure Network (GIN) corridors — **and an honest account of what it
can and cannot yet claim**, after independent multi-sensor validation.

**The research question was:** does scale-free downscaled climate data
predict corridor water stress better than free coarse climate? **Answer (Phases
1-3b): no** — corridor stress is spatial and local, decoupled from the flat
municipal climate gradient. **So the climate product is skipped and stress is
measured directly from satellite imagery** (the CDEI index, built from
Sentinel-2 + Landsat).

## ⚠️ What validation showed (read this first)

I did not stop at building the index — I tested whether it is *true* by comparing
it against independent measurements. The two axes came out very differently:

- **Over TIME — a direction check, not yet a validation.** CDEI tracks independent
  ClimateBC moisture in the physically correct direction, which is what a
  drought-monitoring tool should do. But be precise about how strong that evidence
  is. The headline figures (vs CMD ρ = −0.68, vs precipitation ρ = +0.72) are
  correlations over **four points** — the four summer means — and a correlation on
  n = 4 establishes a *sign*, not a magnitude. Computed within polygons instead
  (each polygon's own mean removed first, n = 612 polygon-summers), the same
  relationships hold in the same directions but are weaker: ρ = −0.31 and ρ = +0.32.
  So: the index responds to drought the way it should, and four summers is too short
  to call that a validation. More summers (Sentinel-2 reaches back to ~2017) would
  settle it.
- **BETWEEN corridors — NOT independently confirmed. ✗** An independent radar
  sensor (Sentinel-1 SAR) does **not** corroborate the corridor ranking as water
  stress, and this holds across **all four summers**:

  | summer | RVI vs ranking | VH backscatter vs ranking | VH vs NDVI (canopy density) |
  |---|---|---|---|
  | 2022 | −0.07 | +0.37 | +0.62 |
  | 2023 | +0.08 | +0.36 | +0.54 |
  | 2024 | +0.01 | +0.36 | +0.56 |
  | 2025 | −0.03 | +0.36 | +0.55 |

  The vegetation-condition radar indices (RVI, cross-ratio) are **flat-null** every
  year (ρ ≈ 0). The only radar signal that correlates with the ranking (VH/VV
  backscatter) tracks **canopy density** (VH vs NDVI ρ ≈ +0.55), not water. So the
  between-corridor ranking is **confounded with how dense the vegetation is** — the
  "most-stressed" corridors are largely the densest-canopy ones. This is a stable,
  reproducible property, not a one-year artifact.

**Bottom line:** the tool is usable for tracking drought **over time**, with the
caveat that its temporal behaviour is a direction check on four summers rather than
a validation. Treat the corridor-vs-corridor **ranking as exploratory**, not as a
validated statement of which corridors are physically driest. The spatial-stress signal only becomes
robust where real terrain gradients exist (the Fraser transect, Phase 3b) — not
across flat Surrey.

## What's here
| file | what it is |
|---|---|
| `fig1_stress_map.png` | Surrey corridors mapped by the CDEI stress *signal* (dark = higher) |
| `fig2_top_ranking.png` | the 20 highest-signal corridors, ranked, with priority flags |
| `fig3_dry_edge.png` | how the index is defined — distance from the NDVI–SWCI dry edge |
| `corridor_stress_ranking.csv` | all **144 GIN corridors** — the reporting unit, with the City's own recommendation text |
| `polygon_stress_ranking.csv` | all **153 corridor polygons** — the modelling unit, full detail |

**Two units, deliberately.** The City's MapServer layer serves 153 polygons
carrying 144 GIN corridor ids, because seven corridors are digitised in several
pieces. The polygon is what the satellite statistics and cross-validation are
computed on; the GIN corridor is what the City manages, and corridor values are
area-weighted means of their polygons. Corridor ids below are the City's GIN ids,
**not** ArcGIS row numbers — the two run 1–144 and 1–153 and do not correspond.

## Top 10 highest canopy-stress-signal corridors (mean summer CDEI, 2022–2025)
*Exploratory ranking — see the validation note above.*

| Rank | GIN corridor | Polygons | Stress %ile | Ecological value | Dev. risk | Summers in driest third | Area (ha) |
|---|---|---|---|---|---|---|---|
| 1 | 106 | 1 | 99 | Moderate | Moderate | 4/4 | 10.5 |
| 2 | 14 | 2 | 99 | Low | Low | 4/4 | 1.6 |
| 3 | 2 | 1 | 98 | Moderate | Moderate | 4/4 | 2.9 |
| 4 | 64 | 1 | 97 | Moderate | Low | 4/4 | 4.6 |
| 5 | 89 | 1 | 97 | Low | Moderate | 4/4 | 13.8 |
| 6 | 6 | 1 | 96 | Moderate | Low | 4/4 | 0.8 |
| 7 ★ | 36 | 1 | 95 | High | Moderate | 4/4 | 4.6 |
| 8 | 111 | 1 | 94 | Moderate | Moderate | 4/4 | 4.1 |
| 9 ★ | 52 | 1 | 94 | High | Moderate | 4/4 | 7.7 |
| 10 | 63 | 1 | 93 | Low | Moderate | 4/4 | 5.5 |

★ = would be a restoration **priority** (highest-signal third *and* high ecological
value or development risk) — **if** the spatial ranking validates. 14 of 144 corridors
carry this flag; treat as candidates to investigate, not a confirmed list.

## How to read the index
Stress signal = proximity to the vegetation **dry edge** (low CDEI): a corridor
near the dry edge has little canopy-water margin for its greenness. The honest
caveat from validation is that, over flat Surrey, this signal is entangled with
**canopy density** — so a high signal may mean "dense canopy" as much as "thirsty
canopy."

## Honest limits
- **The between-corridor ranking is not independently validated** and is confounded
  with canopy density (shown by independent Sentinel-1 radar). This is the headline
  limitation.
- CDEI is a **relative feature-space index**, not a soil-moisture measurement; it is
  not validated against field/ground observations.
- Between-corridor differences over flat Surrey are genuinely subtle — the same
  reason the climate-resolution hypothesis was untestable here (`docs/PHASE3_FINDINGS.md`).
- 4 summers is a short record, not a climate trend — and too short to support a
  temporal *validation* claim (see the direction-check note above). Every correlation
  reported here carries its n: n = 4 for the across-summer figures, n = 612 for the
  within-polygon ones.

## What is solid, and where to take it next
- **Solid:** CDEI as a *temporal* drought monitor for Surrey's corridors — it moves
  in the physically correct direction with independent climate data. It is described
  here as a direction check, and stays one until the record is longer than four
  summers.
- **Next:** either validate/repair the spatial ranking (a better independent
  spatial reference, or de-confound canopy density), or carry the spatial-stress
  question to the Fraser transect where terrain makes it real.

Regenerate: `python -m src.pipeline.corridor_stress -v`
Validation: `python -m src.pipeline.validate_sar -v` (Sentinel-1 SAR check)
