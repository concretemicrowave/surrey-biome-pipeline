#!/usr/bin/env bash
# Back up docs/preprint/ to a timestamped, verified archive outside the repo.
#
# The manuscript is gitignored on purpose (.gitignore:65) -- an unposted paper
# should not sit in public and drift from the version of record. The cost of that
# choice is that git is not backing it up either, and main.tex plus
# KNOWN_ISSUES.md are the two files in this project that would hurt most to lose.
# This closes that gap without putting the manuscript anywhere public.
#
# LOCAL ONLY, deliberately. Nothing here uploads, pushes or syncs. The preprint is
# under embargo pending a reply from Morley; getting a copy offsite is a decision
# for the author to make by hand, not something a script should do quietly.
#
#   ./scripts/backup_preprint.sh              # -> ~/Documents/surrey-preprint-backups
#   DEST=/Volumes/usb ./scripts/backup_preprint.sh
#
# Keeps the newest KEEP archives and prunes older ones.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="docs/preprint"
DEST="${DEST:-$HOME/Documents/surrey-preprint-backups}"
KEEP="${KEEP:-10}"

[ -d "$SRC" ] || { echo "no $SRC here -- run from the repo" >&2; exit 1; }

mkdir -p "$DEST"
TAR="$DEST/preprint_$(date +%Y-%m-%d_%H%M).tar.gz"
tar --exclude='.DS_Store' -czf "$TAR" -C docs preprint

# Verify by restoring and diffing. An archive nobody has opened is not a backup.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
tar -xzf "$TAR" -C "$TMP"
if diff -r -x '.DS_Store' "$TMP/preprint" "$SRC" >/dev/null; then
  echo "verified  $TAR  ($(du -h "$TAR" | cut -f1))"
else
  echo "RESTORE DIFFERS FROM SOURCE -- do not trust $TAR" >&2
  exit 1
fi

# Prune, newest first.
ls -1t "$DEST"/preprint_*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -f "$old" && echo "pruned    $(basename "$old")"
done

n=$(ls -1 "$DEST"/preprint_*.tar.gz 2>/dev/null | wc -l | tr -d ' ')
echo "$n archive(s) in $DEST"
echo
echo "This is one machine. For anything you cannot re-derive, copy the newest"
echo "archive to external or cloud storage yourself -- that step is deliberately"
echo "not automated while the preprint is under embargo."
