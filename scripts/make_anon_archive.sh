#!/usr/bin/env bash
# Build the anonymised code archive that goes to MEE with the manuscript.
#
# MEE reviews double-anonymous and requires code at submission, so the archive
# has to carry an open-source licence AND no author. Those pull against each
# other, because an MIT licence names its copyright holder. The resolution here
# is to keep the licence and replace only the holder line, for the review copy
# only. Nothing in the real repository is modified: this stages a copy.
#
# Source for the rules: MEE author guidelines, plus "Making your code anonymous
# for peer review" (Natalie Cooper, senior editor, 2023). From the video, the
# ones that shaped this script:
#   - flat files and a single zipped folder, never Word, Excel or PDF;
#   - remove author metadata, including the field at the top of a notebook;
#   - remove comments to yourself that name anyone;
#   - check the FILENAMES do not identify you either;
#   - a Zenodo/Dryad private link only hides the repository owner, so the code
#     still has to be cleaned. That is why this script exists at all.
#
# Restore after acceptance: nothing to undo, the repository was never changed.
set -euo pipefail
cd "$(dirname "$0")/.."

out="surrey-pipeline-anon.zip"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT
root="$stage/code"
mkdir -p "$root"

# git ls-files, not `git archive`: archive ships the last COMMIT, and this repo
# routinely carries uncommitted analysis edits, so the archive would silently
# disagree with the numbers in the manuscript. This takes tracked files in their
# working-tree state. It also inherits .gitignore, which is what keeps data/ and
# docs/papers/ out without a second exclusion list to maintain.
git ls-files -z | while IFS= read -r -d '' f; do
  mkdir -p "$root/$(dirname "$f")"
  cp "$f" "$root/$f"
done

# Untracked files are invisible to the above. Usually that is correct, and
# occasionally it is a script written this week that the paper cites.
untracked="$(git ls-files --others --exclude-standard)"
if [ -n "$untracked" ]; then
  echo "note: untracked files are NOT in the archive:" >&2
  echo "$untracked" | sed 's/^/  /' >&2
  echo "  (git add them first if a referee should see them)" >&2
fi

# 1. Metadata files whose entire purpose is attribution. Nothing to redact.
rm -f "$root/CITATION.cff" "$root/.zenodo.json"

# 2. The licence stays; only the holder is withheld. Fail loudly rather than
#    ship a licence whose holder line silently did not match.
if ! grep -q "^Copyright (c) 2026 Joshua Wang$" "$root/LICENSE"; then
  echo "!! LICENSE copyright line has changed; update this script" >&2
  exit 1
fi
sed -i '' 's/^Copyright (c) 2026 Joshua Wang$/Copyright (c) 2026 The Author(s)/' \
  "$root/LICENSE"

# 3. Notebook OUTPUTS, which is where the leaks are: two cells print the absolute
#    repo path. The code cells are clean, so this rewrites printed text only and
#    leaves sources untouched.
python3 - "$root" <<'PYEOF'
import json, re, sys, pathlib
root = pathlib.Path(sys.argv[1])
home = re.compile(r"/Users/[^/\s|]+")
for nb_path in root.rglob("*.ipynb"):
    nb = json.loads(nb_path.read_text())
    n = 0
    for cell in nb.get("cells", []):
        cell.get("metadata", {}).pop("author", None)
        for out in cell.get("outputs", []):
            if "text" in out and out["text"]:
                new = [home.sub("/home/anon", t) for t in out["text"]]
                n += sum(a != b for a, b in zip(out["text"], new))
                out["text"] = new
    if n:
        nb_path.write_text(json.dumps(nb, indent=1, ensure_ascii=False) + "\n")
        print(f"   rewrote {n} output line(s) in {nb_path.relative_to(root)}")
PYEOF

# 4. Verify, because every step above is a thing that can silently not happen.
#    NOT a bare surname: the ClimateBC reference is Wang et al. 2016, a different
#    Wang, and legitimately appears in code comments. Match the author's own
#    forms, and check filenames as well as contents, as the video asks.
echo "==> verifying"
bad='joshua|dev@starise|joshuawang2048|concretemicrowave|0009-0002|/Users/'
if grep -rElI "$bad" "$root" 2>/dev/null | sed "s|$root/||" | grep .; then
  echo "!! identifying material in the files above; archive NOT written" >&2
  exit 1
fi
if find "$root" | grep -iE "$bad" | grep .; then
  echo "!! identifying material in the FILENAMES above; archive NOT written" >&2
  exit 1
fi
if [ -d "$root/.git" ]; then
  echo "!! .git present; history would identify the author" >&2
  exit 1
fi
echo "   no identifying text, no identifying filenames, no git history"

rm -f "$out"
(cd "$stage" && zip -qr "$OLDPWD/$out" code)
echo "==> $out ($(du -h "$out" | cut -f1), $(unzip -l "$out" | tail -1 | awk '{print $2}') files)"
echo "    Upload this to ScholarOne with the manuscript."
echo "    The two processed panels are NOT in it; they go up as a separate data file."
