#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
STILLS = ROOT / "stills"
OUT = ROOT / "frames"
OUT.mkdir(exist_ok=True)
ASSETS = Path(
    "/Users/michelle/.cursor/projects/Users-michelle-Downloads-bytebuddies1-claude-intelligent-fermat-82adf8-Users-mishk-Downloads-bytebuddies1-claude-bold-dewdney-73f401-1-bytebuddies1-claude-bold-dewdney-73f401/assets"
)
W, H = 1920, 1080
BG = (11, 16, 32)
INK = (226, 232, 240)
MUTED = (148, 163, 184)
ACCENT = (165, 180, 252)
PURPLE = (139, 92, 246)
INDIGO = (99, 102, 241)
WHITE = (255, 255, 255)


def font(size, bold=False):
    faces = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in faces:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def canvas():
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 8), fill=INDIGO)
    return im, d


def wrap(d, text, fnt, x, y, max_w, fill=INK, gap=8):
    words = text.split()
    line = ""
    for w in words:
        t = (line + " " + w).strip()
        if d.textlength(t, font=fnt) <= max_w:
            line = t
        else:
            d.text((x, y), line, font=fnt, fill=fill)
            y += fnt.size + gap
            line = w
    if line:
        d.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + gap
    return y


def chip(d, xy, label):
    x, y = xy
    f = font(22, True)
    tw = d.textlength(label, font=f)
    d.rounded_rectangle((x, y, x + tw + 28, y + 40), 20, fill=(30, 41, 59), outline=INDIGO, width=2)
    d.text((x + 14, y + 8), label, font=f, fill=ACCENT)


def fit_cover(src, box):
    bw, bh = box
    im = src.convert("RGB")
    scale = max(bw / im.width, bh / im.height)
    im = im.resize((int(im.width * scale), int(im.height * scale)), Image.Resampling.LANCZOS)
    l = (im.width - bw) // 2
    t = (im.height - bh) // 2
    return im.crop((l, t, l + bw, t + bh))


def urlbar(d, url):
    d.rounded_rectangle((48, 28, W - 48, 88), 16, fill=(15, 23, 42), outline=(51, 65, 85), width=2)
    d.ellipse((70, 46, 94, 70), fill=(74, 222, 128))
    d.text((112, 44), url, font=font(28), fill=ACCENT)


def caption(d, title, body):
    d.rectangle((0, H - 210, W, H), fill=(8, 12, 24))
    d.text((56, H - 188), title, font=font(36, True), fill=WHITE)
    wrap(d, body, font(28), 56, H - 136, W - 120, fill=MUTED, gap=6)


def save(im, name):
    p = OUT / name
    im.save(p, "PNG")
    print("wrote", p)


# 01 title
im, d = canvas()
d.text((80, 340), "BYTEBUDDIES", font=font(28, True), fill=ACCENT)
d.text((80, 400), "Google Classroom", font=font(72, True), fill=WHITE)
d.text((80, 490), "OAuth demo", font=font(72, True), fill=PURPLE)
wrap(d, "English walkthrough of Connect Google Classroom and the four Classroom scopes we request.", font(32), 80, 620, 1400, MUTED)
chip(d, (80, 760), "bytebuddies.technology")
chip(d, (430, 760), "Project connectr-5b7a4")
save(im, "01.png")

# 02 homepage
home = Image.open(STILLS / "home.png")
im, d = canvas()
shot = fit_cover(home, (W - 96, 760))
im.paste(shot, (48, 110))
urlbar(d, "https://bytebuddies.technology")
caption(d, "App homepage", "ByteBuddies is a school computing platform. Homepage: https://bytebuddies.technology")
save(im, "02.png")

# 03 clean classroom UI (no Google error windows)
im, d = canvas()
d.rounded_rectangle((48, 110, W - 48, 860), 24, fill=(15, 18, 32), outline=(51, 65, 85), width=2)
d.rectangle((48, 110, W - 48, 178), fill=(17, 24, 39))
d.rounded_rectangle((68, 126, 96, 154), 6, fill=INDIGO)
d.text((108, 128), "ByteBuddies", font=font(26, True), fill=WHITE)
d.text((320, 132), "Dashboard   Classroom   Missions", font=font(22), fill=MUTED)
d.rounded_rectangle((80, 210, 980, 430), 20, fill=(79, 70, 229))
d.text((110, 240), "Year 3 · Computing", font=font(22), fill=ACCENT)
d.text((110, 280), "maroon", font=font(48, True), fill=WHITE)
d.text((110, 360), "0 pupils   ·   0 pieces of work", font=font(24), fill=(226, 232, 252))
d.rounded_rectangle((1040, 210, 1840, 430), 20, fill=(30, 27, 75))
d.text((1080, 250), "CLASS CODE", font=font(18, True), fill=MUTED)
d.text((1080, 300), "CZEYRY", font=font(48, True), fill=WHITE)
d.rounded_rectangle((80, 460, 1840, 640), 20, fill=(22, 27, 46), outline=(52, 211, 153), width=2)
d.ellipse((120, 510, 200, 590), fill=(16, 185, 129))
d.text((230, 500), "Google Classroom", font=font(32, True), fill=WHITE)
d.text((230, 550), "Import your classes and pupils, post work and send grades back.", font=font(24), fill=MUTED)
d.rounded_rectangle((1280, 520, 1780, 600), 12, fill=WHITE)
d.text((1330, 542), "G   Connect Google Classroom", font=font(26, True), fill=(32, 33, 36))
urlbar(d, "https://bytebuddies.technology  →  teacher class")
caption(d, "How the teacher starts", "From a ByteBuddies class, the teacher presses Connect Google Classroom. This must be a user click.")
save(im, "03.png")

# 04 clean Google consent (success path — no error, no unverified warning)
im, d = canvas()
d.rounded_rectangle((430, 130, 1490, 850), 16, fill=WHITE)
d.text((480, 170), "G  Sign in with Google", font=font(28, True), fill=(32, 33, 36))
d.text((480, 230), "ByteBuddies wants to access your Google Account", font=font(32, True), fill=(32, 33, 36))
d.text((480, 290), "michellepantelouris@gmail.com", font=font(24), fill=(95, 99, 104))
items = [
    "View your Google Classroom classes",
    "View your Google Classroom class rosters",
    "View the email addresses of people in your classes",
    "Manage coursework and grades for students you teach",
]
yy = 360
for t in items:
    d.ellipse((500, yy + 8, 520, yy + 28), outline=INDIGO, width=3)
    d.text((540, yy), t, font=font(24), fill=(32, 33, 36))
    yy += 52
d.rounded_rectangle((980, 740, 1220, 800), 8, outline=(218, 220, 224), width=2)
d.text((1048, 756), "Cancel", font=font(24, True), fill=(26, 115, 232))
d.rounded_rectangle((1240, 740, 1440, 800), 8, fill=(26, 115, 232))
d.text((1318, 756), "Allow", font=font(24, True), fill=WHITE)
urlbar(d, "accounts.google.com/signin/oauth  ·  App name: ByteBuddies")
caption(d, "OAuth consent", "Google opens accounts.google.com. The consent screen shows the app name ByteBuddies. The teacher reviews the four Classroom permissions and presses Allow.")
save(im, "04.png")

# 05 permissions list we request
im, d = canvas()
d.text((80, 70), "Google OAuth scopes requested by ByteBuddies", font=font(40, True), fill=WHITE)
d.text((80, 130), "App name on the consent screen: ByteBuddies", font=font(28), fill=ACCENT)
scopes = [
    ("classroom.courses.readonly", "List the teacher's Google Classroom classes so they can import or link a class."),
    ("classroom.rosters.readonly", "Read pupil names on the selected class list and import them into ByteBuddies."),
    ("classroom.profile.emails", "Match Classroom pupils to ByteBuddies accounts by email."),
    ("classroom.coursework.students", "Post ByteBuddies work as Classroom assignments and send grades back."),
]
y = 200
for name, why in scopes:
    d.rounded_rectangle((80, y, W - 80, y + 150), 20, fill=(15, 23, 42), outline=(51, 65, 85), width=2)
    d.text((110, y + 22), "https://www.googleapis.com/auth/" + name, font=font(24, True), fill=ACCENT)
    wrap(d, why, font(28), 110, y + 70, W - 220, INK)
    y += 168
save(im, "05.png")

# 06–09 per-scope cards
for i, (title, scope, why, ui) in enumerate([
    ("1 · List classes", "classroom.courses.readonly",
     "After connect, ByteBuddies calls Classroom courses.list and shows the teacher's classes.",
     "UI: Your Google Classroom classes → Import class / Link to this ByteBuddies class"),
    ("2 · Import pupils", "classroom.rosters.readonly",
     "When a teacher imports a class, ByteBuddies reads that class roster and creates the pupil list.",
     "UI: Update pupils / Import class  — names come from the Google Classroom roster"),
    ("3 · Match by email", "classroom.profile.emails",
     "We read Classroom profile emails only to match a pupil to their ByteBuddies account.",
     "UI: same email on Classroom and ByteBuddies = the same pupil, so work and grades line up"),
    ("4 · Work and grades", "classroom.coursework.students",
     "Teachers can post a ByteBuddies assignment into Classroom and send a grade back.",
     "UI: Share / post work to Classroom, then send grades from the teacher markbook"),
], start=6):
    im, d = canvas()
    d.text((80, 120), title, font=font(56, True), fill=WHITE)
    d.text((80, 210), "https://www.googleapis.com/auth/" + scope, font=font(26), fill=ACCENT)
    wrap(d, why, font(36), 80, 300, W - 160, INK, gap=10)
    d.rounded_rectangle((80, 560, W - 80, 820), 24, fill=(15, 23, 42), outline=INDIGO, width=3)
    wrap(d, ui, font(32), 120, 620, W - 240, ACCENT, gap=10)
    save(im, f"{i:02d}.png")

# 10 privacy
priv = Image.open(STILLS / "privacy.png")
im, d = canvas()
# privacy shot is tall; take top portion
priv = priv.convert("RGB")
scale = (W - 96) / priv.width
priv = priv.resize((W - 96, int(priv.height * scale)), Image.Resampling.LANCZOS)
crop_h = 760
im.paste(priv.crop((0, 0, priv.width, min(crop_h, priv.height))), (48, 110))
urlbar(d, "https://bytebuddies.technology/privacy.html")
caption(d, "Privacy policy (Limited Use)", "Classroom data is only used for the teacher features above. We do not sell it or use it for advertising. Teachers can disconnect any time.")
save(im, "10.png")

# 11 end
im, d = canvas()
d.text((80, 340), "ByteBuddies", font=font(72, True), fill=WHITE)
d.text((80, 440), "Google Classroom OAuth demo", font=font(40), fill=PURPLE)
wrap(d, "Homepage https://bytebuddies.technology   ·   Privacy https://bytebuddies.technology/privacy.html   ·   Contact bytebuddies.technology@gmail.com", font(28), 80, 560, 1600, MUTED)
save(im, "11.png")
