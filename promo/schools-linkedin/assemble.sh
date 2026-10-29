#!/bin/zsh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
O="$ROOT/promo/schools-linkedin"
TOUR="$ROOT/public/media/bytebuddies-tour.mp4"
CLIPS="$O/clips"
mkdir -p "$CLIPS"

scale_live="scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p,setsar=1"
scale_card="scale=1920:1080,fps=30,format=yuv420p,setsar=1"

# 1 title
ffmpeg -y -loop 1 -t 3.8 -i "$O/overlays/title.png" -vf "$scale_card" -an "$CLIPS/01.mp4"
# 2 dashboard + hook caption
ov() {
  local ss="$1" dur="$2" cap="$3" out="$4"
  ffmpeg -y -ss "$ss" -t "$dur" -i "$TOUR" -i "$O/overlays/$cap" \
    -filter_complex "[0:v]${scale_live}[v];[1:v]scale=1920:1080,format=rgba[c];[v][c]overlay=0:0" \
    -an "$CLIPS/$out"
}
ov 22 6.7 cap01.png 02.mp4
ov 50 6.5 cap02.png 03.mp4
ov 92 6.5 cap03.png 04.mp4
ov 72 6.0 cap04.png 05.mp4
ov 204 6.0 cap05.png 06.mp4
# 7 end
ffmpeg -y -loop 1 -t 5.8 -i "$O/overlays/end.png" -vf "$scale_card" -an "$CLIPS/07.mp4"

printf "file '%s'\n" "$CLIPS"/0{1,2,3,4,5,6,7}.mp4 > "$CLIPS/list.txt"
ffmpeg -y -f concat -safe 0 -i "$CLIPS/list.txt" -c copy "$CLIPS/picture.mp4"

# mix voiceover (pad 0.3s then VO); video may be slightly longer
ffmpeg -y -i "$CLIPS/picture.mp4" -i "$O/voiceover.wav" \
  -filter_complex "[1:a]adelay=300|300,afade=t=in:st=0:d=0.2,afade=t=out:st=38.4:d=0.7[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$O/bytebuddies-schools-linkedin-1080p.mp4"

ffmpeg -y -i "$O/bytebuddies-schools-linkedin-1080p.mp4" \
  -vf "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b0a24" \
  -c:a copy -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart \
  "$O/bytebuddies-schools-linkedin-square.mp4"

cp "$O/bytebuddies-schools-linkedin-1080p.mp4" "$ROOT/promo/bytebuddies-schools-linkedin.mp4"
ffprobe -hide_banner "$O/bytebuddies-schools-linkedin-1080p.mp4" 2>&1 | grep -E 'Duration|Stream'
ls -lh "$O"/bytebuddies-schools-linkedin-*.mp4 "$ROOT/promo/bytebuddies-schools-linkedin.mp4"
