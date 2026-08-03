# Where the project stands — 3 August 2026

Written so the science does not have to be held in anyone's head. If you read one
file before a fair, an interview or a supervisor meeting, read this one.

**The science is frozen.** Everything below is tested, documented and consistent
across the manuscript, the board and the Surrey deliverable. Nothing is
half-finished. From here the work is presentation and process, not analysis.

---

## 1. What the project claims, in one page

**The question.** Surrey manages 144 green corridors on a limited budget. Which
are drying out? The field assumes answering this needs the finest-resolution
climate data available. That assumption is what was tested.

**The answer: finer is not better.** Tested at two extents.

| extent | spatial detail removed by coarsening | verdict |
|---|---|---|
| Surrey (flat, 408 km²) | 12.3% | **unanswerable** — the two models are nearly the same model |
| Fraser Valley transect (100 km, 4–1,920 m) | 48.4% | **falsified** — the coarse model wins |

The transect result: ΔRMSE +0.00093 at a 25 km grid, 95% CI excluding zero,
**32 of 32 random seeds**. Surrey's: ΔRMSE −0.00004, CI [−0.00016, +0.00007].

**Why.** Water stress at corridor scale is local. Terrain aspect and stand
composition reach positive skill (CV R² +0.03–0.04, positive in 80% of held-out
folds); climate makes predictions worse (40% of folds). Weak in absolute terms —
the claim rests on the separation and the fold agreement, not the magnitude.

**The reusable part.** Two gates before any resolution comparison:
1. **Skill gate** — can either model beat guessing the mean? If not, you are
   comparing two broken clocks.
2. **Contrast gate** — does coarsening actually destroy spatial detail? If not,
   you have one model twice.

Surrey fails gate 2. That makes it an *unanswerable question, not a null result*,
and that distinction is the transferable contribution.

**The deliverable.** All 144 GIN corridors ranked for water stress from free
public imagery, including corridors 10 m wide that no field programme would
survey. Delivered with its limits measured.

---

## 2. The three self-caught corrections that define the project

These are the spine of any defence. Each was found internally, tested, and
propagated to every document.

**Phase 2 — the NDVI saturation artifact.** `acquire_raster` subtracted the
Sentinel-2 −1000 DN offset from products that had already had it removed, pinning
NDVI at 1.0 for 69% of pixels. The "NDVI saturates above 0.9 in 87% of corridors"
finding was an artifact. The offset is now *measured* from each scene's dark
pixels. Recomputed NDVI spans 0.244–0.908. **Never cite the saturation result.**

**2026-07-29 — corridor ids.** The MapServer layer carries both `objectid` (an
ArcGIS row number, 1–153) and `id` (the City's GIN corridor id, 1–144). Everything
reported before that date used the wrong one. Proven against Surrey's published
Appendix J: joined on `id` the shared attributes agree 95.8–99.3%; on `objectid`,
33.8% — chance. Seven corridors are digitised in several pieces, so **153 polygons
carry 144 corridor ids**. Polygon = modelling unit, GIN corridor = reporting unit.
This bug recurred twice more (a duplicated GIN 14 in the top-20 figure, and a
broken `validate_sar.py`); treat it as a *class* of bug, not three incidents.

**2026-08-03 — the temporal claim, withdrawn.** Below, in full.

---

## 3. What was withdrawn, and why (the hardest question you will get)

**The claim.** CDEI tracked drought over four summers: ρ = −0.68 against moisture
deficit, +0.72 against precipitation. That made it look like a drought monitor.

**What killed it.** Extending to nine summers (2017–2025, n = 1,377
polygon-summers) did not reproduce it — network-wide +0.07, within-polygon +0.05,
and across the five earlier summers the relationship is *absent* (r = −0.04,
p = 0.28). The two driest summers in the record, 2018 and 2021, read as the
**least** stressed of the nine.

**The cause, in plain terms.** The dry edge is a line fitted by comparing
corridors *to each other* — its slope is 0.53. Across summers, the same two bands
only move together at 0.26. So when a dry summer pulls greenness down, the line
drops faster than the corridor does, and the index scores that gap as *water
margin*. Every dry summer reads wetter. The four-summer ρ = −0.68 was the same
mistake on a record too short to expose it.

**Ruled out by test, not argument:**
- the sensor and imagery — rasters rebuilt bit-identical, r = 1.00000
- the frozen RLST baseline — refit, still null
- the thermal term entirely — `dry_dist` alone collapses identically
- refitting the dry edge per summer — removes the artifact but pins between-summer
  variance to 0.96% and *inverts* the correlation to +0.62. Judged on magnitude
  alone this looks like a repair. It is the opposite.

**The one-line version:** *a ruler built to compare places cannot compare
moments.*

**What survives it.** The within-summer ranking is preserved at ρ ≥ 0.855 (≥ 0.97
in seven of nine summers) across the very change that destroys the temporal
behaviour. The ranking Surrey is handed does not depend on the choice the temporal
claim founders on.

---

## 4. What was strengthened the same day

The sharpest objection to the deliverable was that the ranking is a canopy-density
map in disguise — radar corroborates it only through VH backscatter, and VH tracks
NDVI at ρ ≈ 0.55. **Tested, and it does not hold.**

Ranking corridors on CDEI residualised against VH — *how dry each corridor is for
its own canopy density* — reproduces the published order at **Spearman ρ = +0.924**
over the 131 corridors with radar coverage. The control removes 9.4% of CDEI's
variance. Seven of the top ten stay; the three that move land at 11, 12, 13.

Radar rather than NDVI because NDVI is an input to the index — residualising on it
would remove part of the index by construction. Sentinel-1 is active C-band and
shares no band with the optical imagery.

**Honest limits:** VH is a partial proxy (it sees ~half the density signal), the
base differs (131 vs 144 corridors, so ranks are not directly comparable between
files), and this is not ground truth.

---

## 5. Current status of every claim

| claim | status |
|---|---|
| Finer climate data does not beat coarse at corridor scale | **Solid** — falsified on the transect, 32/32 seeds |
| Water stress is driven by local terrain + stand composition | **Solid**, weak in magnitude — rests on fold agreement |
| The two gates (skill, contrast) | **Solid** — the reusable contribution |
| Coverage: 144 corridors from free imagery, re-ranked each summer | **Solid** |
| The corridor ranking is not a canopy-density artifact | **Solid** — ρ = +0.924 |
| The corridor ranking is *correct* | **Exploratory** — no ground validation exists |
| CDEI as a temporal drought monitor | **Withdrawn** — mechanism understood |

**The single remaining limitation is the absence of ground truth.** That is a gap
in confirmation, not a demonstrated error. One season of soil probes in a dozen
corridors would close it.

---

## 6. Where everything lives

| what | where |
|---|---|
| Manuscript (canonical) | `docs/preprint/latex/main.tex` → `build.sh` → both PDFs + Overleaf zip |
| Known weaknesses register | `docs/preprint/KNOWN_ISSUES.md` — **V1** temporal, **V3** transect validation, **V4** canopy confound |
| Science-fair board | `docs/board/board.html` → `build.sh` → 44 × 36 in PDF |
| Surrey deliverable | `docs/deliverable/README.md` + 4 CSVs |
| Learning material | `docs/learn/index.html`, `notebooks/labs/` (6 labs + grader) |

**Diagnostics — every claim above is re-runnable:**
```bash
.venv/bin/python scripts/drift_diagnostic.py         # the drift, and what is not causing it
.venv/bin/python scripts/refit_control_arm.py        # why refitting the edge is not a repair
.venv/bin/python scripts/slope_mismatch.py           # why 2018/2021 read unstressed
.venv/bin/python scripts/residualized_retest.py      # transect: not a canopy artifact
.venv/bin/python scripts/canopy_controlled_ranking.py # Surrey: not a canopy artifact
```

⚠️ `docs/preprint/` is **gitignored on purpose** (`.gitignore:65`) — an unposted
manuscript should not sit in public and drift from the version of record. The
manuscript and `KNOWN_ISSUES.md` are local-only. Back them up separately.

---

## 7. Next steps

### Now — the only hard deadline
- [ ] **11 August: nudge Morley.** Emailed 2026-07-28. Blocks the preprint *and*
      the Zenodo DOI. If no reply, **proceed 1 September** — that decision is
      already made, so do not re-litigate it.

### Before anything is printed or sent
- [ ] Re-read the board out loud. §6 and the withdrawal box were written by
      Claude and rewritten for voice; if anything still sounds unlike you, it will
      be there.
- [ ] Photograph **GIN 36, McNally Creek** (49.02052, −122.77180) — from the
      10 Ave crossing, framing canopy and the adjacent construction together.
      Summer, midday, landscape. It is the one deliberate hole in the board.
- [ ] Check whether Fraser Heights caps entries and runs an internal selection.
      SFRSF 2027 is your first fair, so a school round would be a free rehearsal.

### The real work — September onward
- [ ] **Rehearse the defence.** The roadmap's "50% presentation" is the accurate
      part of it. Use `docs/interview_coach_notebooklm_note.md` and the nine ranked
      attack surfaces as the drill list.
- [ ] Add the withdrawal to the interview-coach note. The four hardest questions:
      *Does your monitor work over time?* (no — §3 above)
      *Isn't your ranking just canopy density?* (no — §4 above)
      *How do you know your index measures water?* (we don't, and that is the
      headline limitation)
      *Why should I believe a negative result?* (32/32 seeds, and two gates that
      say when the question is answerable at all)
- [ ] Work the labs in `notebooks/labs/`. They rebuild `experiment.py` in
      miniature on the real 612-row panel, and lab 6 reproduces the paper's
      headline interval to the digit. Understanding them is what makes the defence
      yours rather than recited.

### Only if someone funds or asks for it
- [ ] Ground validation — one season of soil probes in ~12 corridors. Closes the
      last limitation.
- [ ] A stronger structure control than VH backscatter (LiDAR canopy height, if
      the City holds it).
- [ ] A temporal index built for time from the start, rather than retrofitting
      CDEI.

### Do not do
- Do not reopen the analysis to chase a better result. It is frozen and
  self-consistent. New findings go into `KNOWN_ISSUES.md` as notes, not into a
  rebuild.
- Do not call the preprint "published" or "peer-reviewed".
- Do not paste `KNOWN_ISSUES.md` into the peer-review notebook (`54471862`) — the
  referee brief withholds it on purpose so an outside report can be compared
  against it.
