#!/bin/zsh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
O="$ROOT/promo/site-demo"
S="$O/live-stills"
C="$O/clips-new"
OV="$O/overlays-new"
mkdir -p "$C" "$OV"

python3 - <<'PY'
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT = Path("promo/site-demo/overlays-new")
OUT.mkdir(exist_ok=True)
W,H=1920,1080
def font(sz,b=True):
    for p in ["/System/Library/Fonts/Supplemental/Arial Bold.ttf" if b else "/System/Library/Fonts/Supplemental/Arial.ttf","/System/Library/Fonts/Helvetica.ttc"]:
        try: return ImageFont.truetype(p,sz)
        except OSError: pass
    return ImageFont.load_default()
def cap(name,kicker,line):
    img=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(img)
    d.rounded_rectangle((72,H-200,W-72,H-48),28,fill=(8,10,28,230),outline=(129,140,248,220),width=3)
    d.text((110,H-176),kicker.upper(),font=font(22,True),fill=(167,243,208,255))
    d.text((110,H-136),line,font=font(40,True),fill=(255,255,255,255))
    img.save(OUT/name)
cap("c_land.png","ByteBuddies","The whole platform — live today")
cap("c_dash.png","Teacher home","Set work, classes and Google Classroom")
cap("c_learn.png","Lessons","152 KS2 lessons, Years 3 to 6")
cap("c_gb.png","Game Builder","Blocks, costumes and sounds")
cap("c_py.png","Python","Real Python in the browser")
cap("c_st.png","Robot Studio","Build a robot, then code it")
cap("c_mi.png","Missions","Story worlds pupils actually finish")
cap("c_cl.png","Classroom","Import classes, set work, send grades")
cap("c_rb.png","Robot Lab","micro:bit, simulator and blocks")
print("caps ok")
PY

scale="scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0004,1.08)':d=FRAMES:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,format=yuv420p"

clip() {
  local img="$1" dur="$2" cap="$3" out="$4"
  local frames=$(( dur * 30 ))
  local vf="${scale/FRAMES/$frames}"
  ffmpeg -y -loop 1 -i "$img" -i "$OV/$cap" -t "$dur" \
    -filter_complex "[0:v]${vf}[v];[1:v]format=rgba[c];[v][c]overlay=0:0" \
    -an "$C/$out"
}

clip "$S/01-landing.png" 8 c_land.png 01.mp4
clip "$S/01b-landing-mid.png" 7 c_land.png 02.mp4
clip "$S/03-dashboard.png" 8 c_dash.png 03.mp4
clip "$S/02-learn.png" 8 c_learn.png 04.mp4
clip "$S/04-gamebuilder.png" 10 c_gb.png 05.mp4
clip "$S/05-python.png" 9 c_py.png 06.mp4
clip "$S/06-studio.png" 9 c_st.png 07.mp4
clip "$S/07-missions.png" 8 c_mi.png 08.mp4
clip "$S/08-classroom.png" 8 c_cl.png 09.mp4
clip "$S/09-robot.png" 8 c_rb.png 10.mp4

# concat relative to list
{
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
} > "$C/list.txt"

ffmpeg -y -f concat -safe 0 -i "$C/list.txt" -c copy "$C/picture.mp4"

# Original neural voice from the live-site tour
ffmpeg -y -i "$ROOT/public/media/bytebuddies-tour.mp4" -t 85 -vn -ac 2 -ar 48000 "$O/tour-voice-85.wav"

ffmpeg -y -i "$C/picture.mp4" -i "$O/tour-voice-85.wav" \
  -filter_complex "[1:a]afade=t=in:st=0:d=0.4,afade=t=out:st=82:d=2.5[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$O/bytebuddies-site-demo.mp4"

ffmpeg -y -i "$S/01-landing.png" -vf "scale=1920:1080" "$ROOT/public/media/bytebuddies-tour-poster.jpg"

cp "$O/bytebuddies-site-demo.mp4" "$HOME/Desktop/bytebuddies-site-demo.mp4"
cp "$O/bytebuddies-site-demo.mp4" "$ROOT/public/media/bytebuddies-tour.mp4"
ls -lh "$HOME/Desktop/bytebuddies-site-demo.mp4" "$ROOT/public/media/bytebuddies-tour.mp4"
ffprobe -hide_banner "$O/bytebuddies-site-demo.mp4" 2>&1 | grep Duration
