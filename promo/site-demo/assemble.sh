#!/bin/zsh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
O="$ROOT/promo/site-demo"
TOUR="$ROOT/public/media/bytebuddies-tour.mp4"
CLIPS="$O/clips"
mkdir -p "$CLIPS"

scale_live="scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p,setsar=1"
scale_card="scale=1920:1080,fps=30,format=yuv420p,setsar=1"

ffmpeg -y -loop 1 -t 4.0 -i "$O/overlays/title.png" -vf "$scale_card" -an "$CLIPS/01.mp4"

ov() {
  local ss="$1" dur="$2" cap="$3" out="$4"
  ffmpeg -y -ss "$ss" -t "$dur" -i "$TOUR" -i "$O/overlays/$cap" \
    -filter_complex "[0:v]${scale_live}[v];[1:v]scale=1920:1080,format=rgba[c];[v][c]overlay=0:0" \
    -an "$CLIPS/$out"
}

ov 22 6.5 c1.png 02.mp4
ov 50 6.5 c2.png 03.mp4
ov 92 6.5 c3.png 04.mp4
ov 150 6.0 c4.png 05.mp4
ov 180 5.5 c5.png 06.mp4
ov 204 5.5 c6.png 07.mp4

ffmpeg -y -loop 1 -t 4.9 -i "$O/overlays/end.png" -vf "$scale_card" -an "$CLIPS/08.mp4"

{
  echo "file '$CLIPS/01.mp4'"
  echo "file '$CLIPS/02.mp4'"
  echo "file '$CLIPS/03.mp4'"
  echo "file '$CLIPS/04.mp4'"
  echo "file '$CLIPS/05.mp4'"
  echo "file '$CLIPS/06.mp4'"
  echo "file '$CLIPS/07.mp4'"
  echo "file '$CLIPS/08.mp4'"
} > "$CLIPS/list.txt"

# concat demuxer paths are relative to the list file
python3 - <<'PY'
from pathlib import Path
clips = Path("promo/site-demo/clips")
# rewrite relative to list file
lines = [f"file '{p.name}'\n" for p in sorted(clips.glob("0*.mp4"))]
(clips / "list.txt").write_text("".join(lines))
print("".join(lines))
PY

ffmpeg -y -f concat -safe 0 -i "$CLIPS/list.txt" -c copy "$CLIPS/picture.mp4"
ffmpeg -y -i "$CLIPS/picture.mp4" -i "$O/voiceover.wav" \
  -filter_complex "[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,adelay=250|250,afade=t=in:st=0:d=0.2[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$O/bytebuddies-site-demo.mp4"

cp "$O/bytebuddies-site-demo.mp4" "$HOME/Desktop/bytebuddies-site-demo.mp4"
ffprobe -hide_banner "$O/bytebuddies-site-demo.mp4" 2>&1 | grep -E 'Duration|Stream'
ls -lh "$O/bytebuddies-site-demo.mp4" "$HOME/Desktop/bytebuddies-site-demo.mp4"
