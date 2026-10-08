#!/usr/bin/env bash
# How the headless "code -> video" toolchain was bootstrapped in this sandbox
# (Debian 12, NO root, no system ffmpeg / fonts / Chromium deps).
#
# This file is documentation: it is what was actually run. Re-running it is
# safe-ish but downloads a lot. Everything lands under motion-compare/.
set -euo pipefail
MC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------------------------------------------------------------- 1. FFmpeg
# No system ffmpeg and apt-get has no package lists. Use npm static builds.
mkdir -p "$MC/tools" && cd "$MC/tools"
npm init -y >/dev/null
npm install ffmpeg-static @ffprobe-installer/ffprobe
mkdir -p "$MC/bin"
ln -sf "$MC/tools/node_modules/ffmpeg-static/ffmpeg" "$MC/bin/ffmpeg"
ln -sf "$MC/tools/node_modules/@ffprobe-installer/linux-x64/ffprobe" "$MC/bin/ffprobe"

# ------------------------------------------------- 2. Chromium system libs
# Remotion downloads chrome-headless-shell on first render. It only misses the
# NSS stack here, so we extract those libs from Debian .debs into a local sysroot
# and expose them via LD_LIBRARY_PATH (see env.sh).
mkdir -p "$MC/sysroot" /tmp/debs && cd /tmp/debs
curl -sO http://deb.debian.org/debian/pool/main/n/nss/libnss3_3.87.1-1+deb12u2_amd64.deb
curl -sO http://deb.debian.org/debian/pool/main/n/nspr/libnspr4_4.35-1_amd64.deb
# glib (for the older Playwright/puppeteer chromium builds, optional here):
# curl -sO http://deb.debian.org/debian/pool/main/g/glib2.0/libglib2.0-0_2.74.6-2+deb12u9_amd64.deb
for d in *.deb; do dpkg-deb -x "$d" "$MC/sysroot"; done

# ------------------------------------------------------------------ 3. Fonts
# The image ships no fonts and no fontconfig config, so ALL text rendered
# invisible. Gather TTFs from the conda package cache and point fontconfig at
# a directory containing them.
mkdir -p "$MC/fonts" "$MC/fontconfig" /tmp/fontcache
find "$HOME/.local/share/mamba/pkgs" -path '*dejavu*' -name '*.ttf' -exec cp -n {} "$MC/fonts/" \; || true
find "$HOME/.local/share/mamba/pkgs" -path '*font-ttf-ubuntu*' -name '*.ttf' -exec cp -n {} "$MC/fonts/" \; || true
cat > "$MC/fontconfig/fonts.conf" <<EOF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>$MC/fonts</dir>
  <cachedir>/tmp/fontcache</cachedir>
</fontconfig>
EOF

# --------------------------------------------------------------- 4. Manim
# pycairo/manimpango have no manylinux wheels and there is no root to install
# cairo/pango dev packages, so install Manim from conda-forge via micromamba.
mkdir -p "$MC/bin"
curl -sL -o /tmp/micromamba.tar.bz2 https://micro.mamba.pm/api/micromamba/linux-64/latest
tar -xjf /tmp/micromamba.tar.bz2 -C /tmp bin/micromamba
cp /tmp/bin/micromamba "$MC/bin/micromamba"
"$MC/bin/micromamba" create -y -p "$MC/manim-env" -c conda-forge manim

# ---------------------------------------------------- 5. Node projects
( cd "$MC/remotion"      && npm install )
( cd "$MC/motion-canvas" && npm install )
( cd "$MC/revideo"       && npm install )
( cd "$MC/web"           && npm install && npm install p5 gsap three lottie-web playwright )

echo "toolchain ready; see README.md"
