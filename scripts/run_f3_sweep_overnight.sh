#!/bin/sh
# The F3 follow-up: is F3's failure a property of f, or of n = 300?
#
# Four high-f levels (f ~ 0.39, 0.56, 0.70, 0.81) x four site counts x 100
# seeds = 16 cells, 1,600 runs, ~6.5 h at the ~14 s/run measured 2026-08-11.
# The pre-registered single-axis run is untouched: this writes _nsweep files.
#
# F1 and F2 will print FAIL in the morning output and that is EXPECTED, not a
# result. Both need the low-f levels, which this design deliberately omits.
# Only F3 and the detection-rate tables are interpretable here.
set -eu
cd "$(dirname "$0")/.."

TARGET=$(date -j -f "%Y-%m-%d %H:%M:%S" "$1" +%s)
NOW=$(date +%s)
echo "sleeping $((TARGET - NOW))s, starting $1"
[ "$TARGET" -gt "$NOW" ] && sleep $((TARGET - NOW))

echo "=== started $(date) ==="
.venv/bin/python scripts/precondition_simulation.py \
  --levels 10000 7000 5000 3500 \
  --sites 300 600 1200 2400 \
  --seeds 100 --tag _nsweep -v
echo "=== finished $(date) ==="
