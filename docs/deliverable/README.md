# Surrey GIN Corridor Water-Stress: Applied Deliverable

A satellite-based tool for ranking water stress across the City of Surrey's 144
Green-Infrastructure Network (GIN) corridors, **and an honest account of what it
can and cannot claim**, after independent multi-sensor validation and a
nine-summer extension of the record.

**The research question was:** does scale-free downscaled climate data
predict corridor water stress better than free coarse climate? **Answer (Phases
1-3b): no**. Corridor stress is spatial and local, decoupled from the flat
municipal climate gradient. **So the climate product is skipped and stress is
measured directly from satellite imagery** (the CDEI index, built from
Sentinel-2 + Landsat).

## ⚠️ What validation showed (read this first)

I did not stop at building the index. I tested whether it is *true* by comparing
it against independent measurements. The two axes came out very differently:

- **Over TIME, tested against a longer record, and it FAILED. ✗** I reported this
  as the strongest part of the tool. I have withdrawn it.

  The original figures (vs CMD ρ = −0.68, vs precipitation ρ = +0.72) were
  correlations over **four points**, the four summer means. Extending the record
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
  mistake on a record too short to show it. It is not the sensor or the imagery.
  rebuilt rasters are bit-identical (r = 1.00000), and refitting the thermal
  baseline changes nothing.

  I tested two repairs and neither works. Refitting the dry edge each summer
  removes the drift, but it pins the between-summer signal to ~1% of variance and
  flips the correlation to the wrong sign. Re-tilting the edge to the temporal
  slope gives the right sign (within-polygon ρ = −0.22, p = 5×10⁻¹⁷), but that
  line is no longer the lower edge of the feature space, so it measures something
  else and would need validating on its own.
- **BETWEEN corridors, NOT independently confirmed. ✗** An independent radar
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
  backscatter) tracks **canopy density** (VH vs NDVI ρ ≈ +0.55), not water. So CDEI
  is **entangled with how dense the vegetation is**, stably, in all four summers
  (VH vs CDEI ρ = −0.356 to −0.373), not as a one-year artifact.

  **But density is not what orders the corridors.** I tested that directly rather
  than assuming it either way. Ranking corridors on CDEI *residualised against VH
  backscatter*, that is, on how dry each corridor is **for its own canopy
  density**, reproduces the published order at **Spearman ρ = +0.924** over the
  131 corridors with usable radar. The control removes only 9.4% of CDEI's
  variance. Seven of the published top-10 stay in the top-10, and the three that
  move land at 11, 12 and 13.

  So the earlier reading of this file, that the most-stressed corridors are
  largely just the densest ones, was **too pessimistic, and is withdrawn**. The
  confound is real and measured; it is not what produces the ranking. Radar is a
  partial control (VH tracks density at ρ ≈ 0.55, so it sees roughly half of what
  is there), and this is not a substitute for ground truth. Second ranking shipped
  as `corridor_stress_ranking_canopy_controlled.csv`.

**Bottom line:** the **drought-over-time claim is withdrawn**. The index produced
it. The corridor-vs-corridor **ranking is still exploratory**, because nothing here
has been checked against a ground measurement. But it is in better shape than this
file previously said: the canopy-density objection was tested with an independent
sensor and the ordering survives it at ρ = +0.924.

What the tool does deliver is **coverage**: a stress ranking over all 144
corridors, including ones only 10 m wide, from free public imagery, recomputed
each summer. That ranking is stable: within every summer it holds at Spearman
ρ ≥ 0.855 (≥ 0.97 in seven of nine) even under the change to the index that
destroys its temporal behaviour, but it still carries the canopy confound above.
Each summer gives a fresh ranking of corridors against each other. It does **not**
tell you whether this summer was harder than last. The spatial signal only becomes
robust where real terrain gradients exist (the Fraser transect, Phase 3b), not
across flat Surrey.

## What's here
| file | what it is |
|---|---|
| `fig1_stress_map.png` | Surrey corridors mapped by the CDEI stress *signal* (dark = higher) |
| `fig2_top_ranking.png` | the 20 highest-signal corridors, ranked, with priority flags |
| `fig3_dry_edge.png` | how the index is defined, distance from the NDVI–SWCI dry edge |
| `corridor_stress_ranking.csv` | all **144 GIN corridors**, the reporting unit, with the City's own recommendation text |
| `polygon_stress_ranking.csv` | all **153 corridor polygons**, the modelling unit, full detail |
| `corridor_stress_ranking_canopy_controlled.csv` | the **131 corridors with radar cover**, ranked on CDEI residualised against VH backscatter, "dry for its own canopy density". Corroborates the file above (ρ = +0.924); not a replacement |
| `sar_validation_summary.csv` | the Sentinel-1 check, per summer |

**Two units, deliberately.** The City's MapServer layer serves 153 polygons
carrying 144 GIN corridor ids, because seven corridors are digitised in several
pieces. The polygon is what the satellite statistics and cross-validation are
computed on; the GIN corridor is what the City manages, and corridor values are
area-weighted means of their polygons. Corridor ids below are the City's GIN ids,
**not** ArcGIS row numbers: the two run 1–144 and 1–153 and do not correspond.

## Top 10 highest canopy-stress-signal corridors (mean summer CDEI, 2022–2025)
*Exploratory ranking. See the validation note above.*

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
value or development risk), **if** the spatial ranking validates against a ground
measurement, which it has not. 14 of 144 corridors carry this flag; treat as
candidates to investigate, not a confirmed list. GIN 36 sits at rank 7 here and
rank 9 in the canopy-controlled file. Note those are ranks out of 144 and 131
respectively, so they are close but not the same base.

## How to read the index
Stress signal = proximity to the vegetation **dry edge** (low CDEI): a corridor
near the dry edge has little canopy-water margin for its greenness. The signal is
entangled with **canopy density** (VH vs CDEI ρ ≈ −0.36), so an individual high
value may mean "dense canopy" as much as "thirsty canopy." The *ranking* is
another matter: controlling for density barely changes it (ρ = +0.924), so the
order is not a density artifact even though the value is partly a density signal.

## Honest limits
- **The between-corridor ranking is not independently validated.** Sentinel-1 radar
  does not corroborate it as *water* stress: the vegetation-condition indices are
  flat-null. This is the headline limitation, and it is a gap in confirmation, not
  a demonstrated error. The narrower charge that the ranking is a canopy-density
  list in disguise was tested and does not hold (ρ = +0.924 after controlling for
  backscatter).
- CDEI is a **relative feature-space index**, not a soil-moisture measurement; it is
  not validated against field/ground observations.
- Between-corridor differences over flat Surrey are genuinely subtle: the same
  reason the climate-resolution hypothesis was untestable here (`docs/RESOLUTION_TEST_FINDINGS.md`).
- **The index cannot compare summers to each other.** Its dry edge encodes a
  between-corridor relationship and is applied to between-summer variation, where
  that relationship does not hold, so dry summers come out wetter (see the TIME
  note above). This is how the index is built, not something a longer record
  fixes. Nine summers is what revealed it.
- Every correlation reported here carries its n: n = 4 for the original
  across-summer figures, n = 612 for the within-polygon ones on the published
  block, n = 1,377 for the nine-summer extension.

## What is solid, and where to take it next
- **Solid: coverage and reproducibility.** Every corridor in the network measured
  the same way, every summer, from free public imagery, including 10 m-wide
  corridors no field programme would survey. The within-summer ranking holds up
  under a change to the index that destroys its temporal behaviour, so it is not
  an artifact of one construction choice.
- **Solid: the negative result.** Finer climate data does not predict corridor
  water stress better than coarse (Phases 3 and 3b). Spend on the site, not on the
  climate product.
- **Withdrawn: CDEI as a temporal drought monitor.** I listed this here as the
  solid axis. The nine-summer extension refuted it, and the cause is understood;
  see the TIME note above.
- **Solid: the ranking is not a canopy artifact.** Controlling for density with an
  independent sensor leaves the order intact (ρ = +0.924). This was the sharpest
  objection to the deliverable and it does not hold.
- **Next.** Validate CDEI against a ground observation. That is now the whole of
  the headline limitation. No in-situ soil moisture exists for these corridors,
  which is why neither check could be tested against truth; one season of soil
  probes in a dozen corridors would settle it. A stronger structure control than
  VH backscatter (LiDAR canopy height, if the City holds it) would tighten the
  de-confounding further. If a temporal monitor is still wanted, build it on an
  index calibrated for time rather than retrofitting this one.

Regenerate: `python -m src.pipeline.corridor_stress -v`
Validation: `python -m src.pipeline.validate_sar -v` (Sentinel-1 SAR check)
