# Field protocol — does the corridor ranking track soil water?

Read this before the first visit. The design is in `scripts/field_design.py`,
which explains why each constraint is where it is; this file is how to execute it.

## What is being tested

Limitations item 1 of the manuscript is that the between-corridor stress ranking
has **never been checked against a ground observation**. Sentinel-1 does not
corroborate it as *water* stress, and no soil measurement exists. That is the
headline weakness of the entire Surrey deliverable, and it is the one gap that
satellite data cannot close, because every quantity in the ranking comes from the
same two satellites.

Two explanations are live, and the satellite record cannot separate them:

- **(W)** the ranking tracks soil water, and its correlation with canopy density
  is incidental
- **(C)** the ranking tracks canopy density, and reads as water by association

`canopy_controlled_ranking.py` already established something narrower: density is
not what *orders* the ranking (ρ = +0.924 after residualising on VH backscatter).
That is not the same as showing the ranking corresponds to water at all. This is.

**The design.** 12 pairs of corridors, matched on canopy density (VH backscatter
within 0.002, about a quarter of a standard deviation) and on proximity (within
5 km), but far apart on the stress ranking (62 to 111 ranks apart, out of 131).
Within a pair, **(C) predicts no systematic soil-moisture difference** — the two
have the same density — while **(W) predicts the high-stress member is drier**.
The pair is the unit of analysis and the *direction* of its difference is the
datum, so nothing depends on the probe or balance being absolutely accurate.

Matching on proximity is doing real work, not just saving driving: soil texture,
parent material and last-rain timing are exactly the nuisance variables a paired
design exists to remove, and they vary over kilometres in Surrey.

## Timing — the part that cannot be fixed later

- **At least 72 h since measurable rain.** Soil moisture contrast between sites
  collapses after rain; measuring two days after a storm produces a null that
  means nothing. This is the single most important constraint.
- **Late August into September is the window.** Contrast peaks at the end of the
  summer dry-down. Every week earlier is a weaker signal.
- **Both members of a pair in the same outing**, with no rain between them. The
  sheet orders sites so pair members are consecutive — do not reorder it.
- Avoid the first hot afternoon after a cool spell; surface soil is still
  equilibrating.

Check rainfall against the Environment Canada station at Vancouver International
or White Rock, whichever is closer to the day's sites, and write the number of
dry days at the top of the sheet. If it rains mid-campaign, that is fine as long
as no *pair* is split across the rain: finish the pair you are on, then wait
another 72 h.

## Method: gravimetric, three cores per site

**Use gravimetric water content, not a cheap probe.** A $15 analog "moisture
meter" outputs an uncalibrated needle deflection in arbitrary units and drifts
with soil salinity and temperature; a judge is entitled to ask what the number
means, and there is no answer. Gravimetric is the reference method that probes
are calibrated *against*, it needs a $20 kitchen scale and an oven, and it is
unimpeachable. The cost is labour, not money.

θ_g = (wet mass − dry mass) / (dry mass − tin mass)

**Per site:**

1. Navigate to the coordinates on the sheet. They are the interior point farthest
   from any corridor edge, so they are the best available spot to be away from
   edge drying. The sheet gives how much margin the corridor actually offers.
2. Stay **at least 10 m from any edge, path, or road** wherever the corridor
   allows it. If it does not, get as far in as you safely can and **write down
   the distance you achieved**. That number goes into the analysis.
3. Clear surface litter — leaves, moss, duff — but do not dig out topsoil.
4. Take **three cores at 10 cm depth**, spaced roughly 5 m apart in a triangle.
   Same depth every time; mark the trowel or corer at 10 cm with tape.
5. Each core goes straight into its own labelled zip bag, sealed immediately.
   Evaporation between the corridor and the car is a real error source.
6. Record aspect, slope, canopy overhead, soil texture by feel, and anything
   unusual — irrigation, standing water, recent disturbance. Phase 3b found water
   stress is driven by local aspect and stand composition, so aspect is a known
   driver and not an afterthought.
7. Photograph the site. Useful for the board, and it settles later questions
   about what the ground actually looked like.

**At the bench,** same day: weigh each bagged sample wet. Then dry at 105 °C for
24 h in a foil tin, cool in a closed container so it does not reabsorb humidity,
and weigh again. Use the same balance throughout — drift cancels in a paired
design only if it is the same instrument.

If you also own a capacitive probe, take five readings per site and write them in
the optional row. It costs nothing and gives a same-day sanity check while the
oven work is pending. It is not the primary measurement.

## What voids a pair

Write it down rather than quietly fixing it. Any of these means the pair is
excluded from the primary analysis, and an excluded pair honestly reported is
worth more than a fudged one:

- one member inaccessible, fenced, posted, or under construction
- rain between the two members
- one member irrigated, or with standing water
- a site moved more than ~50 m from the given coordinates

Three **reserve pairs** are on the sheet. Use one **as a whole pair** — never
substitute a single member, because that breaks the density match that makes the
comparison mean anything.

## Access, permission, safety

Corridors are a mix of City land, park, road allowance and private property; the
GIN designation is a planning overlay and **is not permission to enter**. Check
each site before the trip. Surrey Parks can confirm which are public greenway.
Where a corridor crosses private land, either get the owner's permission or drop
the site to a reserve — do not improvise.

Practical: tell someone the route, go with an adult, wear boots and long
trousers, and expect blackberry. Do not enter creek beds or steep banks. Some
corridors are narrow strips beside active rail or arterial road; if a site is
uncomfortable, it is a reserve pair's job to replace it.

The advance access check is a good task for the **key-holder** (see below), since
it needs the corridor identities the field sheet deliberately withholds.

## Blinding

`field_sheet.md` and `sites.geojson` carry site codes and coordinates only — no
corridor id, no rank, no CDEI, no pair membership, and reserve codes use A/B
rather than anything that encodes the prediction. `field_design.csv` is the key.

**Give the key to someone else** — a parent or teacher — until every mass is
recorded. Unblind only to do the analysis.

This is imperfect and the write-up should say so: the author built the ranking
and may recognise a corridor on arrival. But recognising a place is a far weaker
channel than reading its predicted value off the clipboard while holding the
trowel, and closing the strong channel costs nothing.

## Analysis, decided in advance

Fixing this before the data exist is what stops the analysis from being tuned to
the result.

**Primary test.** Per site, θ_g is the median of its three cores. Per pair, the
sign of (θ_stressed − θ_reference). Under (C) each sign is a coin flip; under (W)
they are mostly negative. Two-sided exact **sign test** on 12 pairs:

| Concordant pairs | p |
|---|---|
| 12 / 12 | 0.0005 |
| 11 / 12 | 0.0063 |
| **10 / 12** | **0.0386** |
| 9 / 12 | 0.146 |

So **10 of 12 in the predicted direction is the smallest significant result.**

**Secondary.** Wilcoxon signed-rank on the paired differences, and the Spearman
correlation between pair rank-separation and difference magnitude — if the
ranking is real, pairs further apart should differ more. Both are supporting, not
decisive: gravimetric values carry soil-texture offsets that the sign discards
and a magnitude test does not.

**Covariates to report whether or not they matter:** residual NDVI difference
within pair (VH is only a partial density proxy, ρ ≈ 0.55, so the match is
partial), aspect, achieved edge distance, and dry days at measurement.

## Power — and the asymmetry that matters

| | true concordance 0.7 | 0.8 | 0.9 |
|---|---|---|---|
| 12 pairs (need 10) | 25% | 56% | **89%** |
| 15 pairs (need 12) | 30% | 65% | **94%** |

**Read this honestly: the design can confirm, but is weakly powered to refute.**
A strong effect will be caught nearly nine times in ten. A moderate one is a coin
flip. So a significant result is real evidence that the ranking tracks water,
while a null result at n = 12 is **not** strong evidence that it does not — it is
consistent with a moderate effect the design was too small to see.

That asymmetry has to be stated in whatever gets written, and it is the reason to
**measure the three reserve pairs too if time allows**: 15 pairs is a
free improvement from 56% to 65% power at moderate effect sizes, and the reserves
are already selected and matched.

## What each outcome means

- **≥ 10 of 12 concordant.** The ranking tracks soil water at the corridor scale.
  Limitations item 1 changes from "not independently validated" to "validated
  against field soil moisture in a density-matched paired design," which is the
  single largest upgrade available to this project.
- **Around 6 of 12.** No detectable water signal at this sample size. The ranking
  stays exploratory and the write-up says the field check did not find a
  difference and was underpowered to rule out a moderate one. This is a real
  result and worth reporting; it is not a failed experiment.
- **≥ 10 of 12 in the *wrong* direction.** The index is inverted relative to soil
  water, which would be the most interesting outcome of the three and would need
  its own investigation before anything else is published.

Whichever it is, it goes into the record before it goes into the paper: update
`docs/preprint/KNOWN_ISSUES.md` (V3, and item 1 of the structural table) as soon
as the analysis is done.

## Before you go

- [ ] Access confirmed for all 24 primary sites (key-holder)
- [ ] 72 h since rain, checked against a named station
- [ ] Key handed to someone else
- [ ] Balance (0.01 g), oven, foil tins, ~80 labelled zip bags, trowel marked at
      10 cm, sheet printed, phone map loaded with `sites.geojson`
- [ ] Someone knows the route
