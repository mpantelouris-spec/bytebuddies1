#!/bin/zsh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
O="$ROOT/promo/site-demo"
F="$O/frames-pro"
C="$O/clips-pro"
mkdir -p "$C"

python3 "$O/compose_pro.py"

encode() {
  local img="$1" dur="$2" out="$3"
  ffmpeg -y -loop 1 -i "$img" -t "$dur" \
    -vf "scale=1920:1080,format=yuv420p,fade=t=in:st=0:d=0.28,fade=t=out:st=$(python3 -c "print(max(0.1,$dur-0.28))"):d=0.28" \
    -r 30 -c:v libx264 -preset fast -crf 17 -an "$out"
}

encode "$F/title.jpg" 2.5 "$C/00.mp4"
encode "$F/01.jpg" 8 "$C/01.mp4"
encode "$F/02.jpg" 7 "$C/02.mp4"
encode "$F/03.jpg" 8 "$C/03.mp4"
encode "$F/04.jpg" 8 "$C/04.mp4"
encode "$F/05.jpg" 10 "$C/05.mp4"
encode "$F/06.jpg" 9 "$C/06.mp4"
encode "$F/07.jpg" 9 "$C/07.mp4"
encode "$F/08.jpg" 8 "$C/08.mp4"
encode "$F/09.jpg" 8 "$C/09.mp4"
encode "$F/10.jpg" 8 "$C/10.mp4"
encode "$F/end.jpg" 3.5 "$C/11.mp4"

{
  echo "file '00.mp4'"
  echo "file '01.mp4'"
  echo "file '02.mp4'"
  echo "file '03.mp4'"
  echo "file '04.mp4'"
  echo "file '05.mp4'"
  echo "file '06.mp4'"
  echo "file '07.mp4'"
  echo "file '08.mp4'"
  echo "file '09.mp4'"
  echo "file '10.mp4'"
  echo "file '11.mp4'"
} > "$C/list.txt"

ffmpeg -y -f concat -safe 0 -i "$C/list.txt" -c copy "$C/picture.mp4"

# End-card line, then pad VO so it starts after the title card
say -v 'Matilda (Premium)' -r 158 -o "$O/vo-sync/end.aiff" 'Visit bytebuddies.technology.'
afconvert -f WAVE -d LEI16 "$O/vo-sync/end.aiff" "$O/vo-sync/end.wav"

python3 - <<'PY'
import subprocess
from pathlib import Path
root = Path("promo/site-demo")
voice = root / "vo-sync/voice-83.wav"
if not voice.exists():
    voice = root / "vo-sync/voice.wav"
end = root / "vo-sync/end.wav"
out = root / "vo-sync/voice-pro.wav"
# 2.5s title silence + 83s scene VO + 3.5s end
cmd = [
    "ffmpeg","-y",
    "-i", str(voice),
    "-i", str(end),
    "-filter_complex",
    "[0:a]adelay=2500|2500,apad=pad_dur=3.5[v];[1:a]adelay=85500|85500,volume=1.05[e];[v][e]amix=inputs=2:duration=longest:dropout_transition=0,afade=t=in:st=0:d=0.3,afade=t=out:st=87.5:d=1.4,atrim=0:89[a]",
    "-map","[a]","-ar","48000","-ac","2", str(out)
]
subprocess.check_call(cmd)
print("audio", out)
PY

ffmpeg -y -i "$C/picture.mp4" -i "$O/vo-sync/voice-pro.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$O/bytebuddies-site-demo.mp4"

ffmpeg -y -i "$F/title.jpg" -vf scale=1920:1080 "$ROOT/public/media/bytebuddies-tour-poster.jpg"

cp "$O/bytebuddies-site-demo.mp4" "$HOME/Desktop/bytebuddies-site-demo.mp4"
cp "$O/bytebuddies-site-demo.mp4" "$ROOT/public/media/bytebuddies-tour.mp4"
ls -lh "$HOME/Desktop/bytebuddies-site-demo.mp4"
ffprobe -hide_banner "$O/bytebuddies-site-demo.mp4" 2>&1 | grep -E "Duration|Video|Audio"
