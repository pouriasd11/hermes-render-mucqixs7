#!/usr/bin/env bash
# Render the SAME educational scenario (Pythagorean theorem) in all 8 engines.
#   bash motion-compare/render-edu.sh
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/env.sh"

OUT="$MC/edu"
mkdir -p "$OUT"

echo "== 1/8 Remotion =="
( cd "$MC/remotion" && npx remotion render Edu "$OUT/01-remotion-edu.mp4" )

echo "== 2/8 Motion Canvas =="
( cd "$MC/motion-canvas" && ENTRY=render-edu.html OUT="$OUT/02-motion-canvas-edu.mp4" node render.mjs )

echo "== 3/8 Revideo =="
( cd "$MC/revideo" && rm -rf node_modules/.vite output && \
  PROJECT_FILE=./src/project-edu.ts OUT_FILE=03-revideo-edu.mp4 OUT_DIR=output node render.cjs && \
  cp output/03-revideo-edu.mp4 "$OUT/03-revideo-edu.mp4" )

echo "== 4/8 Manim =="
( cd "$MC/manim" && rm -rf media_edu && \
  "$MC/manim-env/bin/manim" -qm --disable_caching --media_dir media_edu -o 04-manim-edu edu.py Pythagoras && \
  cp media_edu/videos/edu/720p30/04-manim-edu.mp4 "$OUT/04-manim-edu.mp4" )

echo "== 5/8 p5.js =="
( cd "$MC/web" && node harness.mjs edu-p5.html "$OUT/05-p5js-edu.mp4" 30 300 1280 720 )

echo "== 6/8 GSAP =="
( cd "$MC/web" && node harness.mjs edu-gsap.html "$OUT/06-gsap-edu.mp4" 30 300 1280 720 )

echo "== 7/8 three.js =="
( cd "$MC/web" && node harness.mjs edu-three.html "$OUT/07-threejs-edu.mp4" 30 300 1280 720 )

echo "== 8/8 Lottie =="
( cd "$MC/web" && node harness.mjs edu-lottie.html "$OUT/08-lottie-edu.mp4" 30 300 1280 720 )

echo
ls -la "$OUT"/*.mp4
