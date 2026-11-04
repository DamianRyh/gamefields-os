#!/usr/bin/env bash
# Converts the homepage .mov films to web formats: MP4 (H.264, every browser) and WebM (VP9, smaller).
# MOV plays reliably only in Safari and Chrome; Firefox and many Android phones skip it.
# Usage: tools/wordpress/convert-videos.sh <folder-with-mov-files> [out-dir]
# Then upload the results to the media library and swap the URLs in model-media.json (mov → mp4 + webm).
set -euo pipefail
src="${1:?Podaj folder z plikami .mov}"
out="${2:-$src/web}"
mkdir -p "$out"
shopt -s nullglob nocaseglob
for f in "$src"/*.mov; do
  name="$(basename "${f%.*}")"
  # 1280 px wide is enough for the product cards; no audio, the films play muted.
  ffmpeg -y -loglevel error -i "$f" -an -vf "scale='min(1280,iw)':-2" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart "$out/$name.mp4"
  ffmpeg -y -loglevel error -i "$f" -an -vf "scale='min(1280,iw)':-2" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 "$out/$name.webm"
  printf '%s: %s KB → mp4 %s KB, webm %s KB\n' "$name" "$(( $(stat -c%s "$f") / 1024 ))" "$(( $(stat -c%s "$out/$name.mp4") / 1024 ))" "$(( $(stat -c%s "$out/$name.webm") / 1024 ))"
done
