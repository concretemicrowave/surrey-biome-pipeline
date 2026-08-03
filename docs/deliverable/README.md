# Surrey GIN Corridor Water-Stress — Applied Deliverable

A satellite-based tool for ranking water stress across the City of Surrey's 144
Green-Infrastructure Network (GIN) corridors — **and an honest account of what it
can and cannot claim**, after independent multi-sensor validation and a
nine-summer extension of the record.

**The research question was:** does scale-free downscaled climate data
predict corridor water stress better than free coarse climate? **Answer (Phases
1-3b): no** — corridor stress is spatial and local, decoupled from the flat
municipal climate gradient. **So the climate product is skipped and stress is
measured directly from satellite imagery** (the CDEI index, built from
Sentinel-2 + Landsat).

## ⚠️ What validation showed (read this first)

I did not stop at building the index — I tested whether it is *true* by comparing
it against independent measurements. The two axes came out very differently:

- **Over TIME — tested against a longer record, and it FAILED. ✗** I reported this
  as the strongest part of the tool. I have withdrawn it.

  The original figures (vs CMD ρ = −0.68, vs precipitation ρ = +0.72) were
  correlations over **four points** — the four summer means. Extending the record
  to nine summers (2017–2025, n = 1,377 polygon-summers) did **not** reproduce
  them: network-wide +0.07, within-polygon +0.05, and across the five earlier
  summers the relationship is *absent* (r = −0.04, p = 0.28) rather than weaker.
  **The two driest summers in the record, 2018 and 2021, come out as the least
  stressed of the nine.**

  The cause is the index itself. The dry edge is a line fitted by comparing
  corridors to each other, and its slope is 0.53. Across summers the same two
  bands only move at 0.26. So when a dry summer pulls greenness down, the line
  drops faster than the corridor does, and the index scores that gap as **water
  margin**. Dry summers come out wetter. The four-summer ρ = −0.68 was the same
  mistake on a record too short to show it. It is not the sensor or the imagery —
  rebuilt rasters are bit-identical (r = 1.00000), and refitting the thermal
  baseline changes nothing.

  I tested two repairs and neither works. Refitting the dry edge each summer
  removes the drift, but it pins the between-summer signal to ~1% of variance and
  flips the correlation to the wrong sign. Re-tilting the edge to the temporal
  slope gives the right sign (within-polygon ρ = −0.22, p = 5×10⁻¹⁷), but that
  line is no longer the lower edge of the feature space, so it measures something
  else and would need validating on its own.
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

**Bottom line:** both checks failed, for different reasons. The
**drought-over-time claim is withdrawn** — the index produced it. The
corridor-vs-corridor **ranking is exploratory**, not a statement of which corridors
are physically driest, because it is confounded with canopy density.

What the tool does deliver is **coverage**: a stress ranking over all 144
corridors, including ones only 10 m wide, from free public imagery, recomputed
each summer. That ranking is stable — within every summer it holds at Spearman
ρ ≥ 0.855 (≥ 0.97 in seven of nine) even under the change to the index that
destroys its temporal behaviour — but it still carries the canopy confound above.
Each summer gives a fresh ranking of corridors against each other. It does **not**
tell you whether this summer was harder than last. The spatial signal only becomes
robust where real terrain gradients exist (the Fraser transect, Phase 3b), not
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
- **The index cannot compare summers to each other.** Its dry edge encodes a
  between-corridor relationship and is applied to between-summer variation, where
  that relationship does not hold, so dry summers come out wetter (see the TIME
  note above). This is how the index is built, not something a longer record
  fixes. Nine summers is what revealed it.
- Every correlation reported here carries its n: n = 4 for the original
  across-summer figures, n = 612 for the within-polygon ones on the published
  block, n = 1,377 for the nine-summer extension.

## What is solid, and where to take it next
- **Solid — coverage and reproducibility.** Every corridor in the network measured
  the same way, every summer, from free public imagery, including 10 m-wide
  corridors no field programme would survey. The within-summer ranking holds up
  under a change to the index that destroys its temporal behaviour, so it is not
  an artifact of one construction choice.
- **Solid — the negative result.** Finer climate data does not predict corridor
  water stress better than coarse (Phases 3 and 3b). Spend on the site, not on the
  climate product.
- **Withdrawn — CDEI as a temporal drought monitor.** I listed this here as the
  solid axis. The nine-summer extension refuted it, and the cause is understood;
  see the TIME note above.
- **Next.** De-confound the ranking from canopy density — that is the headline
  limitation. Validate CDEI against any ground observation; no in-situ soil
  moisture exists for these corridors, which is why neither check could be tested
  against truth. If a temporal monitor is still wanted after that, build it on an
  index calibrated for time rather than retrofitting this one.

Regenerate: `python -m src.pipeline.corridor_stress -v`
Validation: `python -m src.pipeline.validate_sar -v` (Sentinel-1 SAR check)
