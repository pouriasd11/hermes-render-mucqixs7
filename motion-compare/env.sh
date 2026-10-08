#!/usr/bin/env bash
# Shared environment for headless "code -> video" rendering in this sandbox.
#
# The sandbox has no root, no system ffmpeg and no browser deps, so everything
# is provided in user space. See README.md for how each piece was obtained.
set -a
MC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export MC

# Static ffmpeg + ffprobe (node_modules/ffmpeg-static + @ffprobe-installer)
export PATH="$MC/bin:$PATH"
export FFMPEG="$MC/bin/ffmpeg"

# Shared libs Chromium needs (NSS, glib) extracted from Debian .debs
export LD_LIBRARY_PATH="$MC/sysroot/usr/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

# Fonts: Chromium in this image ships no fonts/fontconfig config, so text
# renders invisible unless we point fontconfig at our font directory.
export FONTCONFIG_FILE="$MC/fontconfig/fonts.conf"
export FONTCONFIG_PATH="$MC/fontconfig"

# A Chromium headless shell. Remotion downloads one on first render; the web
# harness and the Motion Canvas harness reuse that same binary.
export CHROME_PATH="${CHROME_PATH:-$MC/remotion/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell}"
set +a
