#!/bin/zsh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
O="$ROOT/promo/linkedin-promo"
python3 "$O/compose.py"

VOICE='Matilda (Premium)'
RATE=160
A="$O/vo"
mkdir -p "$A" "$O/clips-16x9" "$O/clips-1x1"

# Scene VO, timed to picture (title 2.4, then 6 each, end 5)
lines=(
  "This is ByteBuddies."
  "The whole computing platform, in the browser, for British curriculum schools."
  "One hundred and fifty two KS2 lessons. Years 3 to 6. National Curriculum."
  "Pupils design robots in 3D. No kits. No downloads."
  "Then they write real Python, still in the browser."
  "Missions. Story worlds they actually finish."
  "Teachers set work, and connect Google Classroom in one click."
  "Free one-term school pilots for 2026 and 27. bytebuddies.technology"
)
durs=(2.4 6 7 7 6 6 6 5.2)

i=1
for line in "${lines[@]}"; do
  n=$(printf '%02d' $i)
  say -v "$VOICE" -r $RATE -o "$A/$n.aiff" "$line"
  afconvert -f WAVE -d LEI16 "$A/$n.aiff" "$A/$n-raw.wav"
  need=${durs[$i]}
  python3 - "$A/$n-raw.wav" "$A/$n.wav" "$need" <<'PY'
import subprocess, sys
src, dest, need = sys.argv[1], sys.argv[2], float(sys.argv[3])
import json
have = float(subprocess.check_output([
    "ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0", src
]).decode().strip())
need_fit = need - 0.08
if have > need_fit and have > 0.2:
    tempo = min(1.16, have / need_fit)
    filt = f"atempo={tempo:.4f},apad=pad_dur=0.06"
else:
    pad = max(0.04, need_fit - have)
    filt = f"apad=pad_dur={pad:.3f}"
subprocess.check_call(["ffmpeg","-y","-i",src,"-af",filt,"-ar","48000","-ac","2",dest],
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print(src, round(have,2), "->", need)
PY
  i=$((i+1))
done

python3 - <<PY
from pathlib import Path
p = Path("$A")
files = [p/f"{i:02d}.wav" for i in range(1,9)]
(p/"list.txt").write_text("".join(f"file '{f.name}'\n" for f in files))
PY
ffmpeg -y -f concat -safe 0 -i "$A/list.txt" -c copy "$A/voice.wav"

encode_set() {
  local frames="$1" clips="$2" w="$3" h="$4" out="$5"
  mkdir -p "$clips"
  encode() {
    local img="$1" dur="$2" dest="$3"
    ffmpeg -y -loop 1 -i "$img" -t "$dur" \
      -vf "scale=${w}:${h},format=yuv420p,fade=t=in:st=0:d=0.22,fade=t=out:st=$(python3 -c "print(max(0.1,$dur-0.22))"):d=0.22" \
      -r 30 -c:v libx264 -preset fast -crf 17 -an "$dest"
  }
  encode "$frames/00.jpg" 2.4 "$clips/00.mp4"
  encode "$frames/01.jpg" 6 "$clips/01.mp4"
  encode "$frames/02.jpg" 7 "$clips/02.mp4"
  encode "$frames/03.jpg" 7 "$clips/03.mp4"
  encode "$frames/04.jpg" 6 "$clips/04.mp4"
  encode "$frames/05.jpg" 6 "$clips/05.mp4"
  encode "$frames/06.jpg" 6 "$clips/06.mp4"
  encode "$frames/99.jpg" 5.2 "$clips/07.mp4"
  {
    echo "file '00.mp4'"
    echo "file '01.mp4'"
    echo "file '02.mp4'"
    echo "file '03.mp4'"
    echo "file '04.mp4'"
    echo "file '05.mp4'"
    echo "file '06.mp4'"
    echo "file '07.mp4'"
  } > "$clips/list.txt"
  ffmpeg -y -f concat -safe 0 -i "$clips/list.txt" -c copy "$clips/picture.mp4"
  ffmpeg -y -i "$clips/picture.mp4" -i "$A/voice.wav" \
    -filter_complex "[1:a]afade=t=in:st=0:d=0.25,afade=t=out:st=44.5:d=1.0[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$out"
}

encode_set "$O/frames-16x9" "$O/clips-16x9" 1920 1080 "$O/bytebuddies-linkedin.mp4"
encode_set "$O/frames-1x1" "$O/clips-1x1" 1080 1080 "$O/bytebuddies-linkedin-square.mp4"

cp "$O/bytebuddies-linkedin.mp4" "$HOME/Desktop/bytebuddies-linkedin.mp4"
cp "$O/bytebuddies-linkedin-square.mp4" "$HOME/Desktop/bytebuddies-linkedin-square.mp4"
ls -lh "$HOME/Desktop/bytebuddies-linkedin.mp4" "$HOME/Desktop/bytebuddies-linkedin-square.mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$O/bytebuddies-linkedin.mp4"
