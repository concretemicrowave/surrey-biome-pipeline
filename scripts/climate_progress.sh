#!/bin/sh
# Live progress for a rate-limited ClimateBC acquisition.
#
#   scripts/climate_progress.sh                    one snapshot, newest log
#   scripts/climate_progress.sh --watch            refresh every 60 s until done
#   scripts/climate_progress.sh logs/foo.log       a specific run
#   scripts/climate_progress.sh --watch logs/foo.log
#
# Totals are READ FROM THE LOG, not hardcoded. acquire_climate emits
#   "planned N jobs (P points x Q periods x R varYSM)"
# at startup, so one script serves Surrey (765 jobs / 153 units / 5 periods),
# the Phase 3b transect (1500 / 300 / 5), and anything later, without edits.
# Hardcoding those numbers was fine while exactly one acquisition existed; it
# would silently report nonsense percentages the moment a second one did.
#
# Rate is the MEDIAN of the per-checkpoint intervals over the last WINDOW
# checkpoints, not the endpoint-to-endpoint average. That distinction matters:
# if the machine sleeps mid-run the process freezes, producing one enormous gap
# among otherwise metronomic 13.0-minute intervals. An endpoint average folds
# that stall into the estimate and reported 29.7 jobs/hr while the process was
# in fact running at exactly 46; the median ignores it, which is right, because
# a past stall says nothing about current pace. Sustained slowdowns still show
# up, since they move the median rather than sitting in its tail.
#
# Units are counted from the job index: jobs are emitted unit-major, PERIODS
# each, so a completed job index of N means floor(N/PERIODS) units have a full
# period panel.

cd "$(dirname "$0")/.." || exit 1

WATCH=no
LOG=
for arg in "$@"; do
  case "$arg" in
    --watch) WATCH=yes ;;
    -*)      echo "unknown option: $arg" >&2; exit 1 ;;
    *)       LOG=$arg ;;
  esac
done

# Default to the most recently modified acquire_climate log, so starting a new
# run does not require remembering to pass its path.
if [ -z "$LOG" ]; then
  LOG=$(ls -t logs/acquire_climate*.log 2>/dev/null | head -1)
fi
WINDOW=6   # progress checkpoints used for the rate estimate

snapshot() {
  [ -n "$LOG" ] && [ -f "$LOG" ] || { echo "no acquisition log found (looked for logs/acquire_climate*.log)"; return 1; }

  # "planned 1500 jobs (300 points x 5 periods x 1 varYSM)"
  planned=$(grep -m1 "planned .* jobs" "$LOG")
  TOTAL=$(echo "$planned"   | sed -n 's/.*planned \([0-9]*\) jobs.*/\1/p')
  UNITS=$(echo "$planned"   | sed -n 's/.*(\([0-9]*\) points.*/\1/p')
  PERIODS=$(echo "$planned" | sed -n 's/.*x \([0-9]*\) periods.*/\1/p')
  # Fall back to the job counter's own denominator if the planned line is not in
  # this log yet — it is written after the DEM/elevation step, which takes a
  # minute or two on a large extent.
  [ -z "$TOTAL" ] && TOTAL=$(grep "progress:" "$LOG" | tail -1 | sed -n 's;.*job [0-9]*/\([0-9]*\).*;\1;p')
  if [ -z "$TOTAL" ] || [ "$TOTAL" = 0 ]; then
    alive=$(pgrep -f "src.pipeline.acquire_climate" >/dev/null && echo yes || echo NO)
    printf '%s  |  process alive: %s   (%s)\n' "$(date '+%H:%M:%S')" "$alive" "$LOG"
    echo "  starting up — no job plan in the log yet (elevation/DEM step)"
    return 0
  fi
  [ -z "$PERIODS" ] && PERIODS=5
  [ -z "$UNITS" ] && UNITS=$((TOTAL / PERIODS))

  alive=$(pgrep -f "src.pipeline.acquire_climate" >/dev/null && echo yes || echo NO)
  cached=$(ls data/raw/climatebc 2>/dev/null | wc -l | tr -d ' ')
  last=$(grep "progress:" "$LOG" | tail -1)

  job=$(echo "$last" | sed -n 's;.*job \([0-9]*\)/.*;\1;p')
  [ -z "$job" ] && job=0
  units_done=$((job / PERIODS))
  pct=$((job * 100 / TOTAL))

  # median per-interval rate across the last WINDOW checkpoints
  rate=$(grep "progress:" "$LOG" | tail -$((WINDOW + 1)) | awk '
    {
      split($2, tp, ",");  split(tp[1], c, ":");
      t = c[1]*3600 + c[2]*60 + c[3];
      match($0, /job [0-9]+\//); j = substr($0, RSTART+4, RLENGTH-5) + 0;
      if (NR > 1) {
        d = t - pt; if (d <= 0) d += 86400;
        if (j > pj && d > 0) r[++n] = (j - pj) * 3600 / d;
      }
      pt = t; pj = j;
    }
    END{
      if (n == 0) { print "0"; exit }
      for (i = 1; i < n; i++) for (k = i+1; k <= n; k++)
        if (r[k] < r[i]) { tmp = r[i]; r[i] = r[k]; r[k] = tmp }
      printf "%.1f", (n % 2) ? r[(n+1)/2] : (r[n/2] + r[n/2+1]) / 2
    }')

  remaining=$((TOTAL - job))
  eta=$(awk -v r="$rate" -v rem="$remaining" '
    BEGIN{ if(r>0) printf "%.1f", rem/r; else print "n/a" }')
  done_at=$(awk -v h="$eta" 'BEGIN{ if(h=="n/a") print "unknown"; else print int(h*3600) }')
  [ "$done_at" != "unknown" ] && done_at=$(date -v +"${done_at}"S '+%a %H:%M' 2>/dev/null || echo "in ${eta}h")

  printf '%s  |  process alive: %s   (%s)\n' "$(date '+%H:%M:%S')" "$alive" "$LOG"
  printf '  jobs      %d/%d (%d%%)   cached responses: %s\n' "$job" "$TOTAL" "$pct" "$cached"
  printf '  units     %d/%d with a complete %d-period panel\n' "$units_done" "$UNITS" "$PERIODS"
  printf '  rate      %s jobs/hour (median of last %d intervals)   remaining %d\n' \
         "$rate" "$WINDOW" "$remaining"
  printf '  ETA       ~%sh  (%s)\n' "$eta" "$done_at"

  # "execute_jobs done" is the authoritative completion marker. The job counter
  # alone is not: checkpoints are emitted every 10 jobs, so a run whose total is
  # not a multiple of 10 finishes with the counter short of TOTAL and would look
  # stalled at 98% forever — which is exactly what the Surrey run did, and why a
  # clean completion got reported as the process dying.
  if grep -q "execute_jobs done" "$LOG"; then
    echo "  COMPLETE"
    return 2
  fi
  [ "$job" -ge "$TOTAL" ] && { echo "  COMPLETE"; return 2; }
  return 0
}

if [ "$WATCH" = yes ]; then
  while :; do
    printf '\033[H\033[2J'   # clear
    echo "ClimateBC acquisition — refreshing every 60 s (Ctrl-C to stop)"
    echo
    snapshot
    status=$?
    [ "$status" -eq 2 ] && exit 0   # acquisition finished
    sleep 60
  done
else
  snapshot
fi
