#!/usr/bin/env python3
"""Compose product-film frames: branded canvas, window chrome, caption under the UI."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
STILLS = ROOT / "live-stills"
OUT = ROOT / "frames-pro"
OUT.mkdir(exist_ok=True)
W, H = 1920, 1080
BG = (9, 8, 28)
INK = (248, 250, 252)
MUTED = (196, 181, 253)
TEAL = (110, 231, 183)
PURPLE = (129, 140, 248)

def font(size, bold=True):
    faces = [
        ("/System/Library/Fonts/Avenir Next.ttc", 1 if bold else 0),
        ("/System/Library/Fonts/SFNS.ttf", 0),
        ("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf", 0),
    ]
    for path, idx in faces:
        try:
            return ImageFont.truetype(path, size, index=idx)
        except OSError:
            continue
    return ImageFont.load_default()

def gradient_bg():
    img = Image.new("RGB", (W, H), BG)
    px = img.load()
    for y in range(H):
        t = y / H
        r = int(9 + 28 * t)
        g = int(8 + 12 * t)
        b = int(28 + 40 * t)
        for x in range(W):
            glow = max(0, 1 - ((x - 960) ** 2 + (y - 220) ** 2) ** 0.5 / 900)
            px[x, y] = (
                min(255, int(r + 70 * glow)),
                min(255, int(g + 20 * glow)),
                min(255, int(b + 90 * glow)),
            )
    return img.convert("RGBA")

def rounded(im, radius):
    mask = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), radius, fill=255)
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out

def window_frame(shot, url="bytebuddies.technology"):
    chrome_h = 38
    inner_w, inner_h = 1680, 820
    shot = shot.convert("RGB").resize((inner_w, inner_h), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (inner_w, inner_h + chrome_h), (18, 16, 42, 255))
    d = ImageDraw.Draw(frame)
    d.rounded_rectangle((0, 0, inner_w - 1, inner_h + chrome_h - 1), 18, fill=(18, 16, 42, 255))
    for i, col in enumerate(((255, 95, 86), (255, 189, 46), (39, 201, 63))):
        d.ellipse((16 + i * 22, 12, 28 + i * 22, 24), fill=col)
    pill = (inner_w // 2 - 210, 8, inner_w // 2 + 210, 30)
    d.rounded_rectangle(pill, 10, fill=(8, 10, 28, 255))
    tw = d.textlength(url, font=font(13, False))
    d.text(((inner_w - tw) / 2, 11), url, font=font(13, False), fill=(167, 179, 210, 255))
    frame.paste(shot, (0, chrome_h))
    return rounded(frame, 18)

def drop_shadow(card, offset=(0, 18), blur=28, alpha=140):
    shadow = Image.new("RGBA", (card.width + 80, card.height + 80), (0, 0, 0, 0))
    sh = Image.new("RGBA", card.size, (0, 0, 0, alpha))
    sh.putalpha(card.split()[-1].point(lambda p: min(p, alpha)))
    shadow.paste(sh, (40 + offset[0], 40 + offset[1]), sh)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    shadow.paste(card, (40, 40), card)
    return shadow

def mark(draw, x, y, s=44):
    draw.rounded_rectangle((x, y, x + s, y + s), max(10, s // 5), fill=PURPLE)
    fs = int(s * 0.62)
    f = font(fs, True)
    bb = draw.textbbox((0, 0), "B", font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    draw.text((x + (s - tw) / 2 - bb[0], y + (s - th) / 2 - bb[1]), "B", font=f, fill=(255, 255, 255, 255))

def caption(draw, kicker, title, n, total=10):
    y = 1008
    draw.rectangle((120, y - 8, 126, y + 52), fill=TEAL)
    draw.text((148, y - 6), kicker.upper(), font=font(15, True), fill=TEAL)
    draw.text((148, y + 16), title, font=font(30, True), fill=INK)
    idx = f"{n:02d}  /  {total:02d}"
    tw = draw.textlength(idx, font=font(16, True))
    draw.text((W - 120 - tw, y + 18), idx, font=font(16, True), fill=(148, 163, 184, 255))

def product_frame(src, kicker, title, n):
    canvas = gradient_bg()
    d = ImageDraw.Draw(canvas)
    mark(d, 72, 28)
    d.text((128, 34), "ByteBuddies", font=font(26, True), fill=INK)
    d.text((330, 40), "Product tour", font=font(16, False), fill=MUTED)
    shot = Image.open(src)
    card = drop_shadow(window_frame(shot))
    x = (W - card.width) // 2
    canvas.alpha_composite(card, (x, 52))
    caption(d, kicker, title, n)
    return canvas.convert("RGB")

def title_card():
    canvas = gradient_bg()
    d = ImageDraw.Draw(canvas)
    mark(d, 900, 280, 120)
    t = "ByteBuddies"
    tw = d.textlength(t, font=font(68, True))
    d.text(((W - tw) / 2, 430), t, font=font(68, True), fill=INK)
    s = "The complete KS2 computing platform"
    sw = d.textlength(s, font=font(30, False))
    d.text(((W - sw) / 2, 520), s, font=font(30, False), fill=MUTED)
    pill = "Lessons  ·  Games  ·  Python  ·  Robots  ·  Classroom"
    pw = d.textlength(pill, font=font(20, True))
    box = ((W - pw) / 2 - 28, 600, (W + pw) / 2 + 28, 652)
    d.rounded_rectangle(box, 22, fill=(16, 185, 129, 255))
    d.text(((W - pw) / 2, 612), pill, font=font(20, True), fill=(255, 255, 255, 255))
    return canvas.convert("RGB")

def end_card():
    canvas = gradient_bg()
    d = ImageDraw.Draw(canvas)
    mark(d, 910, 220, 100)
    t = "Ready for your school"
    tw = d.textlength(t, font=font(52, True))
    d.text(((W - tw) / 2, 360), t, font=font(52, True), fill=INK)
    s = "Free one-term pilots for 2026–27"
    sw = d.textlength(s, font=font(28, False))
    d.text(((W - sw) / 2, 440), s, font=font(28, False), fill=MUTED)
    label = "bytebuddies.technology"
    lw = d.textlength(label, font=font(32, True))
    btn = ((W - lw) / 2 - 48, 540, (W + lw) / 2 + 48, 628)
    d.rounded_rectangle(btn, 28, fill=(16, 185, 129, 255))
    d.text(((W - lw) / 2, 562), label, font=font(32, True), fill=(255, 255, 255, 255))
    return canvas.convert("RGB")

SCENES = [
    ("01-landing.png", "Platform", "The whole product, in the browser", 1),
    ("01b-landing-mid.png", "Curriculum", "152 classroom-ready KS2 lessons", 2),
    ("03-dashboard.png", "Teacher home", "Classes, work, and Google Classroom", 3),
    ("02-learn.png", "Staff planner", "Years 3 to 6, mapped to the National Curriculum", 4),
    ("04-gamebuilder.png", "Game Builder", "Blocks, costumes and sounds", 5),
    ("05-python.png", "Python", "Real code in the browser", 6),
    ("06-studio.png", "Robot Studio", "Build a robot, then code it", 7),
    ("07-missions.png", "Missions", "Story worlds pupils actually finish", 8),
    ("08-classroom.png", "Classroom", "Import pupils, set work, send grades", 9),
    ("09-robot.png", "Robot Lab", "micro:bit blocks, simulator, USB and Bluetooth", 10),
]

def main():
    title_card().save(OUT / "title.jpg", quality=95)
    end_card().save(OUT / "end.jpg", quality=95)
    for src, kicker, title, n in SCENES:
        path = STILLS / src
        if not path.exists():
            raise SystemExit(f"missing {path}")
        product_frame(path, kicker, title, n).save(OUT / f"{n:02d}.jpg", quality=94)
        print("frame", n, src)
    print("wrote", OUT)

if __name__ == "__main__":
    main()
