# Surrey GIN Corridor Water-Stress — Applied Deliverable

A satellite-based tool for tracking water stress in the City of Surrey's 153
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
  n = 4 establishes a *sign*, not a magnitude. Computed within corridors instead
  (each corridor's own mean removed first, n = 612 corridor-summers), the same
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
| `corridor_stress_ranking.csv` | all 153 corridors, full detail |

## Top 10 highest canopy-stress-signal corridors (mean summer CDEI, 2022–2025)
*Exploratory ranking — see the validation note above.*

| Rank | Corridor | Stress %ile | Ecological value | Dev. risk | Summers in driest third | Area (ha) |
|---|---|---|---|---|---|---|
| 1 | 73 | 99 | Low | Low | 4/4 | 0.8 |
| 2 | 132 | 99 | Moderate | Moderate | 4/4 | 10.5 |
| 3 | 81 | 98 | Moderate | Moderate | 4/4 | 2.9 |
| 4 | 36 | 97 | Moderate | Low | 4/4 | 4.6 |
| 5 | 71 | 97 | Low | Low | 4/4 | 0.8 |
| 6 | 28 | 96 | Low | Moderate | 4/4 | 13.8 |
| 7 | 78 | 95 | Moderate | Low | 4/4 | 0.8 |
| 8 ★ | 1 | 95 | High | Moderate | 4/4 | 4.6 |
| 9 | 15 | 94 | Moderate | Moderate | 4/4 | 4.1 |
| 10 ★ | 121 | 93 | High | Moderate | 4/4 | 7.7 |

★ = would be a restoration **priority** (highest-signal third *and* high ecological
value or development risk) — **if** the spatial ranking validates. 15 of 153 corridors
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
  within-corridor ones.

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
