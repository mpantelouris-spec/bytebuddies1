#!/bin/zsh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
O="$ROOT/promo/site-demo"
A="$O/vo-sync"
mkdir -p "$A"

# Female Premium neural voice (Matilda). Jamie reads as male.
VOICE='Matilda (Premium)'
RATE=162

lines=(
  "This is ByteBuddies. The whole computing platform, in the browser, for primary schools."
  "Lessons, games, robots and Python. Everything in one place. No kits. No downloads."
  "This is the teacher home. Create a class, or import from Google Classroom in one click."
  "One hundred and fifty two KS2 lessons for Years 3 to 6, mapped to the National Curriculum."
  "Game Builder. Pupils code with blocks. Costumes and sounds are along the top, ready for class."
  "Python. Real code in the browser. Here is a Space Invaders starter they can run and change."
  "Robot Studio. Pick a robot, snap on parts, then code the design you just built."
  "Missions. Story worlds for sequences, loops, variables and data. Pupils pick a world and go."
  "Classroom. Import pupils from Google, set work, and send grades back."
  "Robot Lab for the micro:bit. Blocks, a simulator, USB and Bluetooth."
)
durs=(8 7 8 8 10 9 9 8 8 8)

i=1
for line in "${lines[@]}"; do
  n=$(printf '%02d' $i)
  say -v "$VOICE" -r $RATE -o "$A/$n.aiff" "$line"
  afconvert -f WAVE -d LEI16 "$A/$n.aiff" "$A/$n-raw.wav"
  dur=${durs[$i]}
  # pad or slightly speed to fit the picture clip
  raw=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A/$n-raw.wav")
  python3 - "$A/$n-raw.wav" "$A/$n.wav" "$dur" "$raw" <<'PY'
import subprocess, sys
src, dest, need, have = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
need -= 0.12  # tiny breath at end of clip
if have > need and have > 0.2:
    tempo = min(1.18, have / need)
    filt = f"atempo={tempo},apad=pad_dur=0.08"
else:
    pad = max(0.05, need - have)
    filt = f"apad=pad_dur={pad:.3f}"
subprocess.check_call([
    "ffmpeg","-y","-i",src,"-af",filt,"-ar","48000","-ac","2",dest
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print(src, "have", round(have,2), "need", need)
PY
  i=$((i+1))
done

printf "file '%s'\n" "$A"/0{1,2,3,4,5,6,7,8,9}.wav "$A"/10.wav > "$A/list.txt"
# concat demuxer relative to list
python3 - <<PY
from pathlib import Path
p = Path("$A")
(p/"list.txt").write_text("".join(f"file '{x.name}'\n" for x in sorted(p.glob('0*.wav'))+[p/'10.wav'] if x.exists() and x.name.endswith('.wav') and '-raw' not in x.name and len(x.stem)==2))
print((p/"list.txt").read_text())
PY

ffmpeg -y -f concat -safe 0 -i "$A/list.txt" -c copy "$A/voice.wav"
ffprobe -hide_banner -show_entries format=duration -of csv=p=0 "$A/voice.wav"

ffmpeg -y -i "$O/clips-new/picture.mp4" -i "$A/voice.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$O/bytebuddies-site-demo.mp4"

cp "$O/bytebuddies-site-demo.mp4" "$HOME/Desktop/bytebuddies-site-demo.mp4"
cp "$O/bytebuddies-site-demo.mp4" "$ROOT/public/media/bytebuddies-tour.mp4"
ls -lh "$HOME/Desktop/bytebuddies-site-demo.mp4"
ffprobe -hide_banner "$O/bytebuddies-site-demo.mp4" 2>&1 | grep Duration
