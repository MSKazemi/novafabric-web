#!/usr/bin/env bash
# Re-render public/og.png from scripts/og/og.html (1200x630) with headless Chrome.
# Usage: scripts/og/render.sh        (needs google-chrome or chromium on PATH)
set -euo pipefail
cd "$(dirname "$0")"
CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser)"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=3000 \
  --screenshot="$PWD/../../public/og.png" "file://$PWD/og.html"
echo "wrote public/og.png"
