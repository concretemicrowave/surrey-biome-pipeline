#!/usr/bin/env bash
# Build Paper A (Methods in Ecology and Evolution): manuscript, separate title
# page, and Supporting Information. Modelled on
# ../_archive/monolith-latex/build.sh -- tectonic, not pdflatex, which is not
# installed on this machine.
#
# MEE wants the title page as its own file, and excludes Supporting Information
# from the word limit, so all three are built separately and stay separate.
# A preprint server wants the opposite -- one file, supplements included -- so
# the preprint bundle is stitched back together at the end as
# preprint-bundle.pdf. The name is deliberately server-neutral: the venue is not
# settled (EcoEvoRxiv over EarthArXiv, on the reasoning that SORTEE's community
# is the audience for a methods paper aimed at MEE), and neither server accepts
# a separate supplement upload, so the same bundle is the right artifact either
# way.
set -euo pipefail
cd "$(dirname "$0")"

command -v tectonic >/dev/null || { echo "tectonic not found" >&2; exit 1; }

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cp -R figures references.bib "$work/"

# --keep-logs is REQUIRED for the check below: by default tectonic writes no
# .log and swallows LaTeX's "Reference ... undefined" warnings entirely, so a
# check that greps anything else passes vacuously on a broken manuscript.
#
# --keep-intermediates is REQUIRED for xr: main.tex pulls the Supporting
# Information's numbering out of supporting-information.aux, and tectonic
# discards .aux files unless asked. Hence also the build order below --
# supporting-information FIRST, main last. Build them the other way and every
# S-reference silently resolves to "??".
for f in supporting-information title-page main; do
  echo "==> $f"
  cp "$f.tex" "$work/$f.tex"
  (cd "$work" && tectonic -X compile "$f.tex" --outdir . --keep-logs \
     --keep-intermediates --print) >/dev/null
  cp "$work/$f.pdf" "$f.pdf"
done

# Science-fair edition: seven headings state their own conclusion instead of
# naming their contents. Every word of body text is identical, so the switch is
# flipped on a COPY and main.tex stays on \sciencefairfalse. The grep is not
# decoration: a silently failed sed would ship the wrong headings.
echo "==> main (science-fair headings)"
sed 's/^\\sciencefairfalse$/\\sciencefairtrue/' main.tex > "$work/sciencefair.tex"
grep -q '^\\sciencefairtrue$' "$work/sciencefair.tex" \
  || { echo "sciencefair switch not flipped" >&2; exit 1; }
(cd "$work" && tectonic -X compile sciencefair.tex --outdir . --keep-logs \
   --keep-intermediates --print) >/dev/null
cp "$work/sciencefair.pdf" main-sciencefair.pdf

# Anonymous edition: what actually gets uploaded to MEE, which reviews
# double-anonymous. Built in its own directory because the files must keep their
# real names for xr to resolve S-references, and because the SI must be
# anonymised in the SAME pass -- a named SI beside an anonymised manuscript
# anonymises nothing. SI first, then main, for the reason given at the top.
echo "==> anonymous edition (main + SI)"
anon="$(mktemp -d)"
trap 'rm -rf "$work" "$anon"' EXIT
cp -R figures references.bib "$anon/"
for f in supporting-information main; do
  # Three flips, not one. The files default to the PREPRINT (single spaced, no
  # line numbers, author named); the journal wants the opposite of all three, so
  # they travel together. linenumbers exists only in main.tex, hence the
  # per-switch check below rather than one grep for all three.
  sed -e 's/^\\anonymousfalse$/\\anonymoustrue/' \
      -e 's/^\\reviewstylefalse$/\\reviewstyletrue/' \
      -e 's/^\\linenumbersfalse$/\\linenumberstrue/' "$f.tex" > "$anon/$f.tex"
  for sw in anonymous reviewstyle; do
    grep -q "^\\\\${sw}true$" "$anon/$f.tex" \
      || { echo "$sw switch not flipped in $f" >&2; exit 1; }
  done
  (cd "$anon" && tectonic -X compile "$f.tex" --outdir . --keep-logs \
     --keep-intermediates --print) >/dev/null
done
cp "$anon/main.pdf" main-anon.pdf
cp "$anon/supporting-information.pdf" supporting-information-anon.pdf

# The switch is only half the job, and the source is the wrong thing to check:
# both branches of every \ifanonymous live there by design. What matters is
# whether a name reached the RENDERED page, so read the PDFs back. Skipped with
# a warning if the venv is absent, because this is the only step in the build
# that needs anything beyond tectonic.
py="../../../.venv/bin/python"
if [ -x "$py" ]; then
  "$py" - main-anon.pdf supporting-information-anon.pdf <<'PYEOF' || exit 1
import re, sys
from pypdf import PdfReader
# NOT a bare "Wang": the ClimateBC reference is Wang et al. 2016, a different
# Wang, and it must survive into the anonymous build. Match the author's own
# forms instead. Anyone renaming the ClimateBC key should leave this alone.
bad = re.compile(r"joshua|wang,\s*j|j\.\s*wang|orcid|gmail|concretemicrowave"
                 r"|0009-0002", re.I)
fail = False
for path in sys.argv[1:]:
    text = "\n".join(p.extract_text() or "" for p in PdfReader(path).pages)
    hits = sorted({m.group(0) for m in bad.finditer(text)})
    if hits:
        print(f"!! {path} still contains: {', '.join(hits)}", file=sys.stderr)
        fail = True
    else:
        print(f"   {path}: no identifying text")
sys.exit(1 if fail else 0)
PYEOF
else
  echo "   (venv not found; anonymity of the PDFs NOT verified)" >&2
fi

# Preprint servers want the opposite of what MEE wants. EarthArXiv's moderation
# criteria require "a single PDF file" with "all supplementary material
# incorporated into one document"; EcoEvoRxiv likewise takes no separate
# supplement upload, and supplements are linked out to an archive instead. So
# the three-file split this script exists to produce is exactly wrong for
# whichever server is chosen. Stitch the named edition back together instead of
# asking the author to remember to.
#
# The title page is deliberately NOT one of the inputs. It is an MEE
# requirement, main.pdf already carries the title, author, affiliation and
# abstract from its own \maketitle, and the note beside the funding statement in
# main.tex records that the title page is not part of the posted preprint --
# appending it would duplicate the front matter and contradict that.
echo
echo "==> preprint bundle (main + SI, one file)"
if [ -x "$py" ]; then
  "$py" - main.pdf supporting-information.pdf preprint-bundle.pdf <<'PYEOF' || exit 1
import logging, sys
from pypdf import PdfReader, PdfWriter
# pypdf logs "Annotation sizes differ" once per hyperlinked table row while
# merging. It is cosmetic and it buries the page-count line below, so quiet it.
logging.getLogger("pypdf").setLevel(logging.ERROR)
*sources, out = sys.argv[1:]
writer = PdfWriter()
counts = []
for path in sources:
    # append() rather than a add_page() loop: it carries each file's outline and
    # internal links across, so the merged PDF stays navigable.
    reader = PdfReader(path)
    counts.append(len(reader.pages))
    writer.append(reader)
with open(out, "wb") as fh:
    writer.write(fh)
# Not decoration, same as the greps elsewhere in this script: a partial merge
# would otherwise ship as a plausible-looking PDF that silently drops the SI.
merged = len(PdfReader(out).pages)
if merged != sum(counts):
    print(f"!! {out}: {merged} pages, expected {sum(counts)}", file=sys.stderr)
    sys.exit(1)
print(f"   {out}: {' + '.join(str(c) for c in counts)} = {merged} pages")
PYEOF
else
  echo "   (venv not found; preprint-bundle.pdf NOT built)" >&2
fi

echo
echo "==> unresolved placeholders"
# A placeholder that reaches a posted or submitted PDF is worse than a missing
# section, so report it loudly. The live one is [[DATA DOI REQUIRED]] in the
# data-availability statement, which cannot be filled until the archive is
# minted; the AI-version placeholders this check was written for are gone.
# It reports rather than exits, deliberately: the DOI is blocked on a release
# that is on hold, and failing here would block every local build until then.
# Keep any such marker on ONE line or the grep will not see it.
if grep -n "\[\[.*REQUIRED\]\]" ./*.tex; then
  echo "!! placeholder above must be filled before submission" >&2
  echo "   (building anyway; the PDFs are current)" >&2
fi

echo
echo "==> undefined references and citations"
if grep -nE "Reference \`.*' .*undefined|Citation \`.*' .*undefined|multiply.defined" \
     "$work"/*.log; then
  echo "!! undefined references above -- Paper A is not clean" >&2
  exit 1
fi
echo "none"

echo
echo "main.pdf, main-sciencefair.pdf, title-page.pdf, supporting-information.pdf"
echo "preprint-bundle.pdf (single-file preprint bundle)"
