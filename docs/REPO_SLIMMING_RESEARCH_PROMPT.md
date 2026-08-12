# Research prompt: what a research-code repo should actually contain

Paste everything below the line into a fresh AI session that has web search.

---

I need you to research current, citable conventions for how a **research
compendium** (the code and data repository that accompanies a scientific paper)
should be organised, and then judge a specific repo against them.

## What I am trying to decide

My repo has accumulated a large number of Markdown documents at the top level
and under `docs/`. Some are genuine reader-facing documentation, some are
planning notes, some are findings write-ups that partly duplicate the paper,
and some are instructions written for an AI assistant. I suspect it reads as
bloated to a referee or to anyone arriving from the paper, and that the signal
is buried. I want to know what to delete, what to merge, what to move out of the
repo entirely, and what a reviewer actually expects to find.

## What I want you to find out

Search for and cite real sources. Prefer, in rough order: journal policies for
code and data availability (especially ecology and methods journals such as
Methods in Ecology and Evolution, Journal of Statistical Software, and the
Ecological Society of America), the research-compendium literature (Gentleman
and Temple Lang; Marwick, Boettiger and Mullen on compendia; the rOpenSci
packaging and review guidance), FAIR and FAIR-for-software principles, the
Software Sustainability Institute, Turing Way, and widely adopted checklists
such as those used by ReScience, CoreTrustSeal, or journal reproducibility
badges (ACM artifact review, AAAS/Science code policies).

Answer these specifically:

1. **What files does a reviewer or reader actually expect at the top level of a
   research compendium?** Give the consensus minimum set and say what each is
   for. Note where sources disagree.
2. **Where is the line between documentation and project detritus?** I am
   looking for a usable test I can apply file by file, not a vague principle.
   In particular: planning documents, decision logs, "findings" narratives that
   restate the paper, and known-issue registers. Which of these do reviewers
   value, and which are noise?
3. **What is current practice for AI-assistant instruction files** (`CLAUDE.md`,
   `.cursorrules`, `AGENTS.md`, `.github/copilot-instructions.md`) in public
   research repos? Should they be committed, gitignored, or moved under a dot
   directory? Is there any journal or funder guidance yet, and does an AI-use
   disclosure belong in the repo, the paper, or both?
4. **How should documentation be structured once there is more than a README?**
   Compare the common patterns: a single long README, a `docs/` tree, a wiki, a
   published site (GitHub Pages, Quarto, MkDocs, Sphinx). At what size does each
   stop working, and what does each cost to maintain?
5. **What belongs in the repo versus an archive?** Specifically the split
   between GitHub and a DOI-issuing archive (Zenodo, Dryad, OSF), which artifacts
   should live in which, and how the two should reference each other. Include how
   version-of-record and citation are normally handled.
6. **Does anything change when the repo is cited by an unpublished or
   under-review manuscript?** I want to know what a referee following a link
   from a submitted paper should be able to do within about five minutes.
7. **Common failure modes.** What makes reviewers distrust or abandon a research
   repo? Cite studies or reviewer-facing guidance rather than blog opinion where
   you can.

## The repo to judge

<https://github.com/concretemicrowave/surrey-biome-pipeline>

It is a public Python analysis pipeline for a spatial ecology paper. Data
directories are deliberately gitignored, as is the manuscript itself, which is
unposted. Read the actual repo. Do not assume its contents from this
description.

## What I want back

1. A short synthesis of the conventions, with citations, flagging where the
   sources genuinely disagree rather than smoothing it over.
2. A file-by-file verdict table for every Markdown file in the repo:
   **keep as is / merge into X / move to docs subtree / move to archive /
   gitignore / delete**, each with a one-line reason.
3. The top-level file list you would end up with, and the reasoning for the
   shape.
4. Anything **missing** that a reviewer would expect and would not find.
5. Explicitly separate what is genuinely conventional from what is your own
   taste. I would rather have a short defensible answer than a long confident
   one.

Do not make any changes. This is a research and recommendation task only.
