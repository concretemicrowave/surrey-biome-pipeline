# Build prompts — Learning Centre → multi-centre hub

Three prompts, run **in order**. Each is written to be pasted into a fresh
session with no prior context. Prompt 1 must complete before 2 or 3; 2 and 3 are
independent of each other.

---

## Prompt 1 — Turn the Learning Centre into a hub with three centres

```
Read `docs/learn/index.html` end to end before changing anything. It is a
9,000-line self-contained study site: one `<style>`, one IIFE, no framework, no
build step, no CDN, no network. It opens from `file://` and keeps all progress in
`localStorage`. Read `docs/learn/serve.py` too — it serves the page over http and
adds a grounded Gemini tutor drawer.

I want that single site to become the FIRST of three learning centres, under a
shared home page. Nothing about how it teaches should change; what changes is
that the machinery becomes reusable and the Surrey material becomes one centre
among several.

## Target layout

    docs/learn/
      index.html            NEW — the hub home page
      shared/
        centre.css          extracted from the current <style>
        centre.js           extracted from the current IIFE (the machinery only)
      surrey/
        index.html          the current site, moved with `git mv`, content only
      ap-physics-1/         built by a later prompt — leave a stub or nothing
      ap-english-lang/      built by a later prompt — leave a stub or nothing
      serve.py              updated for the new tree
      PROMPTS.md            this file

## The machinery / content split

The current file already separates these, and the boundary is marked in the
source: everything above the `CONTENT` banner comment is machinery, and the
literals below it (`CONCEPTS`, `CARDS`, `QUESTIONS`, `PIPE`, `GROUPS`, `LABS`,
`NEVER_SAY`, `METHOD`, `PRESETS`, `TL_*`) are content. Move the machinery into
`shared/centre.js` and leave the literals in each centre's `index.html`.

Machinery = the router (`ROUTES`, `route`, `go`, `render`, `VIEWS`, `AFTER`,
`CLICKS`), state and persistence (`KEY`, `S`, `load`, `save`, export/import),
scheduling (`cardState`, `grade`, `CRITERION`, `isDue`, `isNew`, `cardScore`,
mastery), confidence calibration (`CONF`, `recordConf`, `calibration`), the
markdown subset (`md`, `mdInline`, `para`), the mini-TeX renderer (`texToHtml`,
`MATH_SYM`, `MATH_ACCENT`, `MATH_UPRIGHT`, `mathStash`, `mathRestore`), icons,
number checking (`autoTol`, `numify`, `numMatches`), `selfCheck`, and every view
that is not specific to this project.

Each centre's `index.html` then contains: a `<link>` to the shared CSS, its own
content literals, a `CENTRE` config object, and a classic `<script src>` to the
shared JS. Use a CLASSIC script tag, not `type="module"` — module scripts are
blocked by CORS on `file://` and the whole point of this site is that it works
with no server. Verify that specifically: open `surrey/index.html` from
`file://` and confirm it still boots.

## The CENTRE config object

Give each centre a declared config rather than hard-coding its identity in the
machinery:

    var CENTRE = {
      id: "surrey",
      title: "Surrey Biome",
      emoji: "🌲",
      storageKey: "surrey_learn_v1",   // UNCHANGED for Surrey — see below
      routes: [...],                    // which of the shared views this centre uses
      groups: GROUPS,
      tutorRoot: "docs/",               // what serve.py may ground the tutor on
      sources: [...]
    };

**Do not change Surrey's `localStorage` key.** It is `surrey_learn_v1` and there
is real study history under it. Every other centre gets its own key. If you
change the shape of anything stored, migrate rather than reset, and keep the
`v:` field working.

Routes are per-centre because the AP centres will not have all of Surrey's
views. Surrey keeps every route it has now: overview, learn, map, pipeline,
timeline, cards, recall, practice, mock, redteam, numbers, progress, labs, plus
the `method` and `sources` footer pages. A view a centre does not list must not
appear in its nav, and its route must 404 gracefully to the overview rather than
rendering an empty page.

## The hub home page

`docs/learn/index.html` is a new, small page in the same visual language — the
same tokens, white mode only, no dark theme, no toggle. It should:

- Show one card per centre: emoji, title, one-line description, and live
  progress read from that centre's own `localStorage` key (concepts touched,
  cards at criterion, cards due today). Progress reads work when the pages are
  served over http from one origin; from `file://` they may not, so degrade to
  "open the centre" without an error rather than showing zeroes as if they were
  real.
- Link to each centre's overview.
- Carry a short honest line about what each centre is and is not — the Surrey
  one is exam-and-judging preparation for a specific project; the AP ones are
  course study centres built from the College Board CED.
- Not duplicate the machinery. It is a landing page, not a fourth app.

## serve.py

Update it to serve the whole `docs/learn` tree and to resolve tutor grounding
per centre. The current `ALLOW` list is the Surrey corpus and it deliberately
excludes `docs/preprint/**` and `CLAUDE.md` because the free Gemini tier trains
on submissions — keep that exclusion exactly as it is, and make `ALLOW` a
per-centre list rather than a single global one, so a future AP centre cannot
reach the Surrey project's documents and vice versa. Keep the retrieval design:
the client says which concept it is on, the server attaches that concept's text
plus the one file its `sourceDoc` names.

## Verification, in this order

1. `selfCheck()` passes on the Surrey centre with zero problems reported — it
   checks duplicate concept ids, unknown prereqs, prereq cycles, and notes
   fidelity. It must report exactly what it reported before your changes.
2. `surrey/index.html` opens from `file://` and every route renders.
3. Existing `localStorage` progress survives — export the state before the move,
   import after, and confirm the counts on the Progress page match.
4. `./docs/learn/serve.py` starts, the hub loads at the printed URL, all three
   centre cards render, and the tutor drawer still answers on a Surrey concept.
5. Diff review: the Surrey centre's rendered output should be byte-identical in
   content. This is a move, not a rewrite. If you find yourself improving prose,
   restructuring a view, or "cleaning up" adjacent code, stop.

**Do this yourself — do not fan out to subagents.** Several agents editing one
9,000-line file will conflict, and the acceptance test here is that the Surrey
centre comes out content-identical, which needs one owner who held the whole
extraction in their head. A read-only agent to map which line ranges are
machinery and which are content is fine; agents that write are not.

This is a refactor of a large working file, so work incrementally and verify at
each step rather than doing one large rewrite. If the extraction turns out to be
riskier than duplicating the machinery per centre, say so and tell me the
tradeoff before proceeding — do not silently pick the other option.
```

---

## Prompt 2 — AP Physics 1 centre

```
Build a new learning centre for AP Physics 1 at `docs/learn/ap-physics-1/`,
using the machinery in `docs/learn/shared/`. Read `docs/learn/surrey/index.html`
first to learn the content model — that centre is the pattern you are following.

## What you are copying, and what you are not

Copy: the concept model (`CONCEPTS`), spaced-repetition cards (`CARDS`), the
graded question bank (`QUESTIONS`), the prereq dependency map, flashcards, blank-
page free recall, flip-through, progress and calibration, the `method` and
`sources` footer pages, and the visual language.

Do NOT build: ML labs, the pipeline diagram, the project timeline, red team, or
the mock-interview/admissions presets. Those are specific to a research project
being defended at a judging table and have no analogue in a course.

Replace them with:
- **Formula sheet** — the official AP Physics 1 equation sheet, reproduced as
  structured data with each equation linked to the concepts that use it, plus a
  note on which equations are given on the exam and which you must know anyway.
- **Exam simulator** — timed practice in the exam's real shape: the correct
  number of multiple-choice questions in the correct time, then the correct
  number and TYPE of free-response questions in their time. Score the FRQs
  against the published scoring guidelines point by point, not holistically.
- **Units** — the course's units in CED order, with each unit's exam weighting,
  replacing the Surrey "Numbers" view's role as the at-a-glance reference.

The `map` view stays: physics has genuine prerequisite structure (kinematics
before dynamics before energy before momentum before rotation), and the DAG is
worth more here than it was for Surrey.

## Source material and the accuracy bar

I have `~/Downloads/AP Textbooks/AP Physics 1.pdf` — Barron's *AP Physics 1
Premium, 2024*. **Treat it as a secondary source that is probably out of date,
not as the syllabus.** It predates the course redesign that took effect in
2024-25, so it will contain material that has been cut and omit material that
has been added.

The syllabus is the current **Course and Exam Description (CED)** published by
College Board at apcentral.collegeboard.org, for the school year in effect for a
**May 2027** exam. That is the source of truth. Everything in this centre must
be traceable to it.

## How to build this — phases, not one pass

Use subagents, but in this shape. Phases 0 and 1 are strictly serial; 2 and 3
fan out. Do not start a later phase before its predecessor's file exists on disk.

**Phase 0 — ground truth. ONE agent, working alone.**
Fetch the current AP Physics 1 CED and the course page's exam section. Write
`docs/learn/ap-physics-1/CED_EXTRACT.md` containing, verbatim: the unit list,
each unit's exam weighting, every topic with its CED topic number (1.1, 1.2, …),
the learning objectives and essential knowledge statements, the science
practices, and the exam format — section counts, timings, section weights,
calculator policy, and the contents of the provided equation sheet. Head the file
with the source URL, the CED's stated effective year, and the fetch date. Also
establish whether the 2027 exam is administered digitally, hybrid, or on paper,
and whether that changes the FRQ format — do not assume.

**This file is the only source of truth for every later phase. No agent after
Phase 0 fetches the CED again.** If eight agents each retrieve the CED
independently they will retrieve different chunks and end up with different
beliefs about what it says — and the disagreement is invisible in the finished
site, because every one of them writes confidently. If a later phase finds
something missing from the extract, the fix is to go back and extend the extract,
never to look it up ad hoc.

**Phase 1 — the book. ONE agent.**
Extract the Barron's 2024 table of contents and topic inventory to
`docs/learn/ap-physics-1/BOOK_TOC.md`. Structure only — chapters, sections, and
what each covers. Not the prose.

**Phase 2 — draft. PARALLEL, one agent per CED unit.**
Each agent reads `CED_EXTRACT.md` and nothing else for ground truth, and returns
the concepts, cards and questions for its unit as structured data. Give each one
the concept-model schema, the voice rules, and the accuracy rules below. Each
agent: must not fetch anything; must not read another unit's draft; must name
every `source` as a CED topic code that appears literally in the extract. Prereq
ids may cross unit boundaries — have agents name them by CED topic code so they
resolve at assembly.

**Phase 3 — verify. PARALLEL, one agent per unit, adversarial.**
Each verifier is prompted to FIND VIOLATIONS, not to confirm the work. It checks:
every concept has a `source`; every source code appears literally in
`CED_EXTRACT.md`; every number in a card traces to the extract; no prose appears
verbatim in either the CED or Barron's; every prereq id resolves. It reports what
it found. A verifier returning "all good" for a unit that has a concept with no
`source` has failed at its job, and I would rather see a long violation list than
a clean one I cannot trust.

**Phase 4 — assemble. ONE agent.**
Merge the verified units into `index.html`, then write
`docs/learn/ap-physics-1/CHANGES_SINCE_2024.md` by diffing `CED_EXTRACT.md`
against `BOOK_TOC.md`: two explicit lists, **cut** (in the book, not in the
current course) and **added** (in the course, not in the book). This diff is a
deliverable in its own right — I need to know which parts of my textbook to
ignore. Then run `selfCheck()` and produce the unverified list.

In Phase 0, the following are things I believe changed in the 2024-25 redesign.
Treat every one as a HYPOTHESIS to check against the CED, not as fact, and
correct me in your summary if any is wrong:

- Fluids were added to Physics 1.
- Waves, sound, and simple harmonic-motion-as-waves content moved out to
  Physics 2; electric charge and simple circuits were removed from Physics 1.
- Rotational content expanded into two units (torque and rotational dynamics;
  energy and momentum of rotating systems).
- The exam moved to 40 multiple-choice questions with no multi-select, and 4
  free-response questions with named types (mathematical routines; translation
  between representations; experimental design and analysis; qualitative/
  quantitative translation).

If any of these is wrong, or if anything further changed for 2026-27, the CED
wins and my belief loses.

## Accuracy rules, non-negotiable

- **Every concept carries a `source` field** naming the CED topic code it comes
  from (e.g. `"CED 3.4"`), and every number in a card is traceable. Extend
  `selfCheck()` so a concept without a `source` is reported as a problem. The
  Surrey centre's own norm is to flag gaps honestly rather than invent
  grounding; hold this centre to the same standard.
- **Do not reproduce College Board or Barron's text verbatim.** Write original
  explanations in the Surrey centre's voice — plain-language first, then depth,
  then the trap. Topic codes, unit names, weightings and equation-sheet formulas
  are facts and may be stated directly; prose may not be copied.
- **If you cannot verify something, do not write it.** Put it in an "unverified"
  list at the end and tell me. A physics centre with 60 verified concepts is
  worth more than one with 90 where I cannot tell which are which.
- Cite published College Board FRQs and scoring guidelines by year for the exam
  simulator, rather than inventing questions and pretending they are official.
  Original practice questions are fine and welcome — label them as yours.
- The `sources` footer page lists every URL you fetched, with the fetch date and
  what each one established.

Do not use the claude-in-chrome browser tools for any of this — use web fetch/
search, or `curl` with a browser user-agent.

## Scope

Cover all units of the current course. Aim for roughly the Surrey centre's
density: a concept is a thing you could be asked to explain in two minutes, with
cards for the facts and formulas underneath it, and Tier-1 (explain it) /
Tier-2 (compute it) / Tier-3 (the trap) questions. Physics needs worked
problems, so add a `worked` field to the concept model for a full solution with
its reasoning exposed — the same way the Surrey lessons expose theirs.

Verify with `selfCheck()` clean, every route rendering from `file://`, and the
exam simulator producing a correct-length exam. Then give me the changes diff
and the unverified list.
```

---

## Prompt 3 — AP English Language and Composition centre

```
Build a new learning centre for AP English Language and Composition at
`docs/learn/ap-english-lang/`, using the machinery in `docs/learn/shared/`. Read
`docs/learn/surrey/index.html` first to learn the content model — that centre is
the pattern you are following.

## What you are copying, and what you are not

Copy: the concept model (`CONCEPTS`), spaced-repetition cards (`CARDS`), the
graded question bank (`QUESTIONS`), flashcards, blank-page free recall,
flip-through, progress and calibration, the `method` and `sources` footer pages,
and the visual language.

Do NOT build: ML labs, the pipeline diagram, the project timeline, red team, the
mock-interview/admissions presets, or the "Numbers" view. None has an analogue
in an English course.

Replace them with:
- **Rubrics** — each free-response question type's official analytic rubric,
  row by row, with what earns and what forfeits each point. This is the single
  highest-value view in the centre: the exam is scored against these rows and
  most lost points are rubric-mechanical, not ideas-based.
- **Rhetorical devices** — a reference of the terms actually assessed, each with
  a definition, a real example, and the thing it is commonly confused with.
  Wire it into the flashcard deck.
- **Essay workshop** — a timed writing view: prompt, the real time limit, a
  writing box, then self-scoring against the rubric row by row with the
  descriptors visible. Store attempts the way the Surrey centre stores free-
  recall attempts, so I can see whether Row B commentary is improving.
- **Passage drill** — a short passage with multiple-choice questions in the
  exam's own question stems (rhetorical situation, claims and evidence,
  reasoning and organisation), because this exam's MCQ is a skill, not recall.

The dependency `map` view is optional here — use it only if the concepts have
genuine prerequisite structure. If they do not, drop it rather than faking a DAG.

## Source material and the accuracy bar

I have `~/Downloads/AP Textbooks/AP English Lang.pdf` — Barron's *AP English
Language and Composition Premium, 2024*. **Treat it as a secondary source that
may be out of date, not as the syllabus.**

The syllabus is the current **Course and Exam Description (CED)** published by
College Board at apcentral.collegeboard.org, for the school year in effect for a
**May 2027** exam. Everything in this centre must be traceable to it.

## How to build this — phases, not one pass

Use subagents, but in this shape. Phases 0 and 1 are strictly serial; 2 and 3
fan out. Do not start a later phase before its predecessor's file exists on disk.

**Phase 0 — ground truth. ONE agent, working alone.**
Fetch the current AP English Language and Composition CED and the course page's
exam section. Write `docs/learn/ap-english-lang/CED_EXTRACT.md` containing,
verbatim: the unit list, the skill categories and their individual skills with
codes, the exam format — number of MCQ, free-response question types and count,
timings, section weights — and the full text of the scoring rubric for each
free-response type, row by row with point values. Head the file with the source
URL, the CED's stated effective year, and the fetch date. Also establish whether
the 2027 exam is administered digitally in Bluebook, and whether that changes
anything about how the essays are written or scored — do not assume.

**This file is the only source of truth for every later phase. No agent after
Phase 0 fetches the CED again.** If several agents each retrieve the CED
independently they will retrieve different chunks and end up with different
beliefs about what it says — and the disagreement is invisible in the finished
site, because every one of them writes confidently. For the rubrics this is the
whole ballgame: a rubric row that drifted between two agents' retrievals is a
row I would practise against and be scored against differently. If a later phase
finds something missing from the extract, extend the extract; never look it up
ad hoc.

**Phase 1 — the book. ONE agent.**
Extract the Barron's 2024 table of contents and topic inventory to
`docs/learn/ap-english-lang/BOOK_TOC.md`, including how it states each rubric.
Structure only, not the prose.

**Phase 2 — draft. PARALLEL, one agent per unit or per skill category** —
whichever the CED's own structure makes the cleaner split; decide after Phase 0
and tell me which you chose. Each agent reads `CED_EXTRACT.md` and nothing else
for ground truth, and returns concepts, cards and questions as structured data.
Each agent: must not fetch anything; must not read another agent's draft; must
name every `source` as a skill code or unit that appears literally in the
extract. The rubric view and the rhetorical-device reference are each their own
agent, drafted the same way.

**Phase 3 — verify. PARALLEL, one agent per unit, adversarial.**
Each verifier is prompted to FIND VIOLATIONS, not to confirm the work. It checks:
every concept has a `source`; every source code appears literally in
`CED_EXTRACT.md`; rubric descriptors match the extract word for word; no prose
appears verbatim in either the CED or Barron's beyond the rubric descriptors and
skill statements that are allowed to; no passage is attributed to a real author
without being genuinely public domain. It reports what it found. A verifier
returning "all good" for a unit with a concept missing its `source` has failed —
I would rather see a long violation list than a clean one I cannot trust.

**Phase 4 — assemble. ONE agent.**
Merge the verified drafts into `index.html`, then write
`docs/learn/ap-english-lang/CHANGES_SINCE_2024.md` by diffing `CED_EXTRACT.md`
against `BOOK_TOC.md`: two lists, **cut** (in the book, not in the current
course) and **added or changed** (in the course, not in the book, or described
differently). Pay particular attention to the rubrics — a stale rubric is the
most damaging possible error in this centre, because I would practise scoring
myself against the wrong thing. Then run `selfCheck()` and produce the unverified
list.

In Phase 0, the following are things I believe to be true. Treat each as a
HYPOTHESIS to check against the CED, and correct me in your summary if any is
wrong:

- Three free-response questions: synthesis, rhetorical analysis, argument.
- Each is scored on a 6-point analytic rubric: Row A thesis (1 point), Row B
  evidence and commentary (4 points), Row C sophistication (1 point).
- 45 multiple-choice questions in one hour, with the free-response section
  running two hours fifteen minutes including a reading period.
- The MCQ section splits into reading questions and writing/revision questions.
- Nine units, and three skill categories each split into a reading and a writing
  strand.

If any is wrong, the CED wins.

## Accuracy rules, non-negotiable

- **Every concept carries a `source` field** naming the CED skill code or unit
  it comes from. Extend `selfCheck()` so a concept without a `source` is
  reported as a problem.
- **Rubric text is the one place fidelity beats voice.** Quote the official
  descriptors accurately and attribute them; the surrounding explanation of how
  to earn the point is yours.
- **Do not reproduce Barron's text, or College Board prose beyond the rubric
  descriptors and the skill statements.** Explanations are original, in the
  Surrey centre's voice — plain first, then depth, then the trap.
- **If you cannot verify something, do not write it.** List it as unverified and
  tell me.
- Use released College Board prompts and sample essays by year where you cite
  them; original practice prompts are welcome but must be labelled as yours.
- Do not invent passages and attribute them to real authors. Either use a
  genuinely public-domain text and say which, or write an original passage and
  label it original.
- The `sources` footer page lists every URL you fetched, with the fetch date and
  what each one established.

Do not use the claude-in-chrome browser tools for any of this — use web fetch/
search, or `curl` with a browser user-agent.

## Scope

Cover every unit and every skill in the current course. Concepts here are
rhetorical and analytical rather than factual, so lean on the `analogy`,
`trap` and `whyThisChoice` fields the Surrey model already has — the traps are
where the marks are. Add a `passage` field for a worked example: a short excerpt,
the move the writer is making, and how you would write about it.

Verify with `selfCheck()` clean, every route rendering from `file://`, the essay
workshop timing correctly and storing attempts, and the rubric view matching the
CED row for row. Then give me the changes diff and the unverified list.
```

---

## Notes on running these

- Prompt 1 is a refactor of a large working file, and it is deliberately the one
  that stays single-threaded. Watch for it silently rewriting Surrey prose while
  moving it — the verification step asks for a content-identical diff for a
  reason.
- Prompts 2 and 3 fan out, but only after Phase 0 has written `CED_EXTRACT.md`.
  If you see parallel agents starting before that file exists, stop the run —
  the whole accuracy design rests on every writer reading one extract rather
  than fetching its own.
- Expect Phase 0 to take a while and produce no visible site. That is the point.
- The `CHANGES_SINCE_2024.md` diffs are the part that answers "my textbooks are
  old." Read those first when each finishes, then the unverified list.
