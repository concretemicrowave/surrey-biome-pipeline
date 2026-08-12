#!/usr/bin/env bash
# Render the display board to print-ready PDF and a review PNG.
#
# The board is authored at true print size in board.html (44 x 36 in, 1 pt = real
# printed point). Headless Chrome is the renderer because it is the same engine
# the file was designed against — "print to PDF from the browser" and this script
# produce the same output, so what you check on screen is what the printer gets.
#
# Chrome needs the page over http, not file://, or it blocks the local images.
# A throwaway server on a high port handles that and is torn down on exit.
set -euo pipefail
cd "$(dirname "$0")/../.."          # repo root — paths in board.html are repo-relative

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PORT="${PORT:-8731}"
PY="${PY:-.venv/bin/python}"
OUT_DIR="docs/board"

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME (set \$CHROME)" >&2; exit 1; }

"$PY" -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for _ in $(seq 20); do
  curl -sf -o /dev/null "http://127.0.0.1:$PORT/$OUT_DIR/board.html" && break
  sleep 0.25
done

URL="http://127.0.0.1:$PORT/$OUT_DIR/board.html"
PROFILE="$(mktemp -d)"
trap 'kill $SERVER 2>/dev/null || true; rm -rf "$PROFILE"' EXIT

echo "==> PDF (44 x 36 in, no margins)"
# Headless Chrome writes the PDF and then does not exit — --virtual-time-budget
# does not help. So it runs detached, and we wait for the file to appear and stop
# growing, then kill it. Ugly but deterministic; the PDF is complete by then.
rm -f "$OUT_DIR/board.pdf"
"$CHROME" --headless --disable-gpu --no-first-run --no-default-browser-check \
  --user-data-dir="$PROFILE" \
  --no-pdf-header-footer --print-to-pdf-no-header \
  --print-to-pdf="$OUT_DIR/board.pdf" "$URL" >/dev/null 2>&1 &
CHROME_PID=$!
trap 'kill $SERVER $CHROME_PID 2>/dev/null || true; rm -rf "$PROFILE"' EXIT

prev=-1
for _ in $(seq 120); do
  sleep 1
  [ -f "$OUT_DIR/board.pdf" ] || continue
  size=$(stat -f%z "$OUT_DIR/board.pdf" 2>/dev/null || echo 0)
  [ "$size" -gt 0 ] && [ "$size" = "$prev" ] && break      # written and stable
  prev=$size
done
kill $CHROME_PID 2>/dev/null || true
[ -s "$OUT_DIR/board.pdf" ] || { echo "PDF was never written" >&2; exit 1; }

# Preview comes off the PDF rather than a second Chrome run — one render, and no
# risk of the two disagreeing about what the board looks like.
echo "==> review PNG (from the PDF)"
"$PY" - "$OUT_DIR/board.pdf" "$OUT_DIR/board_preview.png" <<'PYEOF'
import sys
import pypdfium2 as pdfium
src, dst = sys.argv[1], sys.argv[2]
page = pdfium.PdfDocument(src)[0]
w_pt = page.get_size()[0]
# 5000px across 44in = ~114 dpi: big enough to judge layout and read every label.
page.render(scale=5000 / w_pt).to_pil().save(dst)
# And a 1:1 detail crop at true print resolution (300 dpi), so print sharpness is
# something you can look at instead of infer. Centre panel, map + tiles.
full = page.render(scale=300 / 72).to_pil()
W, H = full.size
full.crop((int(W * 0.26), int(H * 0.28), int(W * 0.74), int(H * 0.62))).save(
    dst.replace("board_preview.png", "board_detail_300dpi.png"))
PYEOF

echo
ls -lh "$OUT_DIR"/board.pdf "$OUT_DIR"/board_preview.png | awk '{print "  " $NF, $5}'
echo
echo "  board.pdf         -> send to the printer at 100%, no scaling"
echo "  board_preview.png -> for review"
