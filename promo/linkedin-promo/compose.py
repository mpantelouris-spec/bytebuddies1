#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
STILLS = ROOT.parent / "site-demo" / "live-stills"
OUT16 = ROOT / "frames-16x9"
OUT1 = ROOT / "frames-1x1"
OUT16.mkdir(exist_ok=True)
OUT1.mkdir(exist_ok=True)

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

def gradient(w, h):
    img = Image.new("RGB", (w, h), (9, 8, 28))
    px = img.load()
    for y in range(h):
        t = y / h
        r = int(9 + 28 * t)
        g = int(8 + 12 * t)
        b = int(28 + 40 * t)
        for x in range(0, w, 2):
            glow = max(0, 1 - ((x - w / 2) ** 2 + (y - h * 0.22) ** 2) ** 0.5 / (w * 0.55))
            col = (
                min(255, int(r + 70 * glow)),
                min(255, int(g + 20 * glow)),
                min(255, int(b + 90 * glow)),
            )
            px[x, y] = col
            if x + 1 < w:
                px[x + 1, y] = col
    return img.convert("RGBA")

def rounded(im, radius):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), radius, fill=255)
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out

def window_frame(shot, inner_w, inner_h):
    chrome_h = 34
    shot = shot.convert("RGB").resize((inner_w, inner_h), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (inner_w, inner_h + chrome_h), (18, 16, 42, 255))
    d = ImageDraw.Draw(frame)
    for i, col in enumerate(((255, 95, 86), (255, 189, 46), (39, 201, 63))):
        d.ellipse((14 + i * 20, 10, 26 + i * 20, 22), fill=col)
    url = "bytebuddies.technology"
    tw = d.textlength(url, font=font(12, False))
    d.text(((inner_w - tw) / 2, 10), url, font=font(12, False), fill=(167, 179, 210, 255))
    frame.paste(shot, (0, chrome_h))
    return rounded(frame, 16)

def drop_shadow(card):
    shadow = Image.new("RGBA", (card.width + 64, card.height + 64), (0, 0, 0, 0))
    sh = Image.new("RGBA", card.size, (0, 0, 0, 130))
    sh.putalpha(card.split()[-1].point(lambda p: min(p, 130)))
    shadow.paste(sh, (32, 44), sh)
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    shadow.paste(card, (32, 32), card)
    return shadow

def mark(draw, x, y, s=44):
    draw.rounded_rectangle((x, y, x + s, y + s), max(10, s // 5), fill=PURPLE)
    f = font(int(s * 0.62), True)
    bb = draw.textbbox((0, 0), "B", font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    draw.text((x + (s - tw) / 2 - bb[0], y + (s - th) / 2 - bb[1]), "B", font=f, fill=(255, 255, 255, 255))

def caption(draw, w, h, kicker, title):
    y = h - 78
    draw.rectangle((48, y, 54, y + 50), fill=TEAL)
    draw.text((70, y - 2), kicker.upper(), font=font(14, True), fill=TEAL)
    draw.text((70, y + 18), title, font=font(26, True), fill=INK)

def product(w, h, src, kicker, title, crop="center"):
    canvas = gradient(w, h)
    d = ImageDraw.Draw(canvas)
    mark(d, 28, 22, 40)
    d.text((78, 28), "ByteBuddies", font=font(22, True), fill=INK)
    shot = Image.open(src).convert("RGB")
    if crop == "center" and shot.width > shot.height:
        side = shot.height
        left = (shot.width - side) // 2
        shot = shot.crop((left, 0, left + side, side))
    max_w = w - 80
    max_h = h - (200 if w == h else 150)
    scale = min(max_w / shot.width, max_h / shot.height)
    iw, ih = int(shot.width * scale), int(shot.height * scale)
    card = drop_shadow(window_frame(shot, iw, ih))
    x = (w - card.width) // 2
    y = 58
    canvas.alpha_composite(card, (x, y))
    caption(d, w, h, kicker, title)
    return canvas.convert("RGB")

def title_card(w, h):
    canvas = gradient(w, h)
    d = ImageDraw.Draw(canvas)
    mark(d, w // 2 - 60, int(h * 0.22), 120)
    t = "ByteBuddies"
    tw = d.textlength(t, font=font(64, True))
    d.text(((w - tw) / 2, int(h * 0.40)), t, font=font(64, True), fill=INK)
    s = "KS2 computing. In the browser."
    sw = d.textlength(s, font=font(28, False))
    d.text(((w - sw) / 2, int(h * 0.50)), s, font=font(28, False), fill=MUTED)
    pill = "Not public yet  ·  Free school pilots 2026–27"
    pw = d.textlength(pill, font=font(18, True))
    box = ((w - pw) / 2 - 24, int(h * 0.60), (w + pw) / 2 + 24, int(h * 0.60) + 48)
    d.rounded_rectangle(box, 24, fill=(16, 185, 129, 255))
    d.text(((w - pw) / 2, int(h * 0.60) + 12), pill, font=font(18, True), fill=(255, 255, 255, 255))
    return canvas.convert("RGB")

def end_card(w, h):
    canvas = gradient(w, h)
    d = ImageDraw.Draw(canvas)
    mark(d, w // 2 - 50, int(h * 0.16), 100)
    t = "Free school pilots"
    tw = d.textlength(t, font=font(48, True))
    d.text(((w - tw) / 2, int(h * 0.34)), t, font=font(48, True), fill=INK)
    s = "One term. No cost. No kits."
    sw = d.textlength(s, font=font(26, False))
    d.text(((w - sw) / 2, int(h * 0.43)), s, font=font(26, False), fill=MUTED)
    label = "bytebuddies.technology"
    lw = d.textlength(label, font=font(30, True))
    btn = ((w - lw) / 2 - 40, int(h * 0.54), (w + lw) / 2 + 40, int(h * 0.54) + 78)
    d.rounded_rectangle(btn, 28, fill=(16, 185, 129, 255))
    d.text(((w - lw) / 2, int(h * 0.54) + 22), label, font=font(30, True), fill=(255, 255, 255, 255))
    return canvas.convert("RGB")

SCENES = [
    ("01-landing.png", "Platform", "The whole product, in the browser"),
    ("02-learn.png", "Lessons", "152 KS2 lessons, Years 3 to 6"),
    ("06-studio.png", "Robots", "Design in 3D. No kits to buy."),
    ("05-python.png", "Python", "Real code, still in the browser"),
    ("07-missions.png", "Missions", "Story worlds pupils actually finish"),
    ("08-classroom.png", "Teachers", "Set work. Google Classroom ready."),
]

def main():
    title_card(1920, 1080).save(OUT16 / "00.jpg", quality=94)
    end_card(1920, 1080).save(OUT16 / "99.jpg", quality=94)
    title_card(1080, 1080).save(OUT1 / "00.jpg", quality=94)
    end_card(1080, 1080).save(OUT1 / "99.jpg", quality=94)
    for i, (src, kicker, title) in enumerate(SCENES, 1):
        path = STILLS / src
        if not path.exists():
            raise SystemExit(f"missing {path}")
        product(1920, 1080, path, kicker, title, crop="wide").save(OUT16 / f"{i:02d}.jpg", quality=93)
        product(1080, 1080, path, kicker, title, crop="center").save(OUT1 / f"{i:02d}.jpg", quality=93)
        print("frame", i, src)
    print("ok")

if __name__ == "__main__":
    main()
