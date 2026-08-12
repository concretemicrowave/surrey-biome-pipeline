#!/usr/bin/env bash
# Build Paper B (applied / conservation-evidence venue). Modelled on
# ../_archive/monolith-latex/build.sh -- tectonic, not pdflatex, which is not
# installed on this machine.
#
# Paper B is NOT submittable until the field data exists: the one-season
# density-matched check closes structural item 1, its headline weakness.
set -euo pipefail
cd "$(dirname "$0")"

command -v tectonic >/dev/null || { echo "tectonic not found" >&2; exit 1; }

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cp -R figures references.bib "$work/"

# --keep-logs is REQUIRED for the check below: by default tectonic writes no
# .log and swallows LaTeX's "Reference ... undefined" warnings entirely, so a
# check that greps anything else passes vacuously on a broken manuscript.
echo "==> main"
cp main.tex "$work/main.tex"
(cd "$work" && tectonic -X compile main.tex --outdir . --keep-logs --print) >/dev/null
cp "$work/main.pdf" main.pdf

echo
echo "==> undefined references and citations"
if grep -nE "Reference \`.*' .*undefined|Citation \`.*' .*undefined|multiply.defined" \
     "$work/main.log"; then
  echo "!! undefined references above -- Paper B is not clean" >&2
  exit 1
fi
echo "none"

echo
echo "main.pdf"
