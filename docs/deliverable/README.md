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

- **Over TIME — tested against a longer record, and it FAILED. ✗** This was
  previously reported here as the tool's strongest axis. It is now withdrawn.

  The original figures (vs CMD ρ = −0.68, vs precipitation ρ = +0.72) were
  correlations over **four points** — the four summer means. Extending the record
  to nine summers (2017–2025, n = 1,377 polygon-summers) did **not** reproduce
  them: network-wide +0.07, within-polygon +0.05, and across the five earlier
  summers the relationship is *absent* (r = −0.04, p = 0.28) rather than merely
  weaker. **The two driest summers in the record, 2018 and 2021, come out as the
  least stressed of the nine.**

  The cause is the index's own geometry, not the sensor, the imagery, or the
  length of the record. The dry edge's slope is calibrated on how greenness and
  canopy-water vary **between corridors** (0.53). Across summers, the same two
  bands move together at roughly half that rate (0.26). So when a dry summer
  depresses greenness, the edge falls *faster* than the corridor does, and the
  resulting gap is read as **water margin** — meaning every dry summer reads
  wetter, by construction. The four-summer ρ = −0.68 was the same artifact over a
  record too short to expose it.

  Two repairs were tested; neither works as a drop-in. Refitting the dry edge each
  summer removes the drift but pins the between-summer signal to ~1% of variance
  and *inverts* the correlation. Re-tilting the edge to the temporal slope restores
  the correct sign (within-polygon ρ = −0.22, p = 5×10⁻¹⁷), but a line fitted that
  way is no longer the lower envelope of the feature space — so it is a different
  index, and would need its own validation before anyone relied on it.
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

**Bottom line:** both validation axes failed, in different ways, and both failures
are documented here rather than worked around. The **drought-over-time claim is
withdrawn** — it was an artifact of the index's own geometry. The
corridor-vs-corridor **ranking is exploratory**, not a validated statement of which
corridors are physically driest, because it is confounded with canopy density.

What the tool does reliably deliver is **coverage**: a reproducible stress ranking
over all 144 corridors, including ones only 10 m wide, from free public imagery,
recomputed each summer. That ranking is notably stable — within every summer it is
preserved at Spearman ρ ≥ 0.855 (≥ 0.97 in seven of nine summers) across the very
change to the index that destroys its temporal behaviour — but it still inherits
the canopy confound above. Each summer yields a fresh ranking of corridors against
each other; it does **not** tell you whether this summer was harder than last. The
spatial-stress signal only becomes robust where real terrain gradients exist (the
Fraser transect, Phase 3b) — not across flat Surrey.

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
  that relationship does not hold — so dry summers read wetter by construction (see
  the TIME note above). This is a property of how the index is built, not something
  a longer record fixes; nine summers is what revealed it.
- Every correlation reported here carries its n: n = 4 for the original
  across-summer figures, n = 612 for the within-polygon ones on the published
  block, n = 1,377 for the nine-summer extension.

## What is solid, and where to take it next
- **Solid — coverage and reproducibility.** Every corridor in the network measured
  the same way, every summer, from free public imagery, at a scale that includes
  10 m-wide corridors no field programme would survey. The within-summer ranking is
  stable under a change to the index that destroys its temporal behaviour, so it is
  not an artifact of one arbitrary construction choice.
- **Solid — the negative result.** Finer climate data does not predict corridor
  water stress better than coarse (Phases 3 and 3b). Spend on the site, not on the
  climate product.
- **Withdrawn — CDEI as a temporal drought monitor.** Previously listed here as the
  solid axis. The nine-summer extension refuted it and the mechanism is understood;
  see the TIME note above.
- **Next:** three things, in order of how much they would change the tool.
  De-confound the ranking from canopy density, which is the headline limitation.
  Validate CDEI against any ground observation — no in-situ soil moisture exists
  for these corridors, which is why neither axis could be checked against truth.
  Then, if a temporal monitor is still wanted, build one on an index whose geometry
  is calibrated for time rather than retrofitting this one.

Regenerate: `python -m src.pipeline.corridor_stress -v`
Validation: `python -m src.pipeline.validate_sar -v` (Sentinel-1 SAR check)
