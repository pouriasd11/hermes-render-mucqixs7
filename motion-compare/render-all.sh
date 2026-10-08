#!/usr/bin/env bash
# Render every sample to outputs/*.mp4. Run from anywhere:
#   bash motion-compare/render-all.sh
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/env.sh"

OUT="$MC/outputs"
mkdir -p "$OUT"

echo "== 1/8 Remotion =="
( cd "$MC/remotion" && npx remotion render Root "$OUT/01-remotion.mp4" )

echo "== 2/8 Motion Canvas (custom headless harness) =="
( cd "$MC/motion-canvas" && OUT="$OUT/02-motion-canvas.mp4" node render.mjs )

echo "== 3/8 Revideo =="
( cd "$MC/revideo" && rm -rf node_modules/.vite output && \
  OUT_FILE=03-revideo.mp4 OUT_DIR="$OUT" node render.cjs )

echo "== 4/8 Manim (conda env) =="
( cd "$MC/manim" && rm -rf media && \
  "$MC/manim-env/bin/manim" -qm --disable_caching -o 04-manim sample.py ManimSample && \
  cp media/videos/sample/720p30/04-manim.mp4 "$OUT/04-manim.mp4" )

echo "== 5/8 p5.js =="
( cd "$MC/web" && node harness.mjs p5.html "$OUT/05-p5js.mp4" 30 150 1280 720 )

echo "== 6/8 GSAP =="
( cd "$MC/web" && node harness.mjs gsap.html "$OUT/06-gsap.mp4" 30 150 1280 720 )

echo "== 7/8 three.js =="
( cd "$MC/web" && node harness.mjs three.html "$OUT/07-threejs.mp4" 30 150 1280 720 )

echo "== 8/8 Lottie =="
( cd "$MC/web" && node harness.mjs lottie.html "$OUT/08-lottie.mp4" 30 150 1280 720 )

echo
echo "All outputs:"
ls -la "$OUT"/*.mp4
