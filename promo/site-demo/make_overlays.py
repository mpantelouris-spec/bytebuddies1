#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "overlays"
OUT.mkdir(exist_ok=True)
W, H = 1920, 1080


def font(size, bold=True):
    for p in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded(d, xy, r, fill):
    d.rounded_rectangle(xy, radius=r, fill=fill)


def cap(kicker, line1, line2=""):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    panel = (72, H - 250, W - 72, H - 52)
    rounded(d, panel, 28, (8, 10, 28, 232))
    d.rounded_rectangle(panel, radius=28, outline=(129, 140, 248, 220), width=3)
    d.text((110, panel[1] + 24), kicker.upper(), font=font(22, True), fill=(167, 243, 208, 255))
    d.text((110, panel[1] + 64), line1, font=font(42, True), fill=(255, 255, 255, 255))
    if line2:
        d.text((110, panel[1] + 122), line2, font=font(42, True), fill=(255, 255, 255, 255))
    return img


def title():
    img = Image.new("RGBA", (W, H), (11, 10, 36, 255))
    d = ImageDraw.Draw(img)
    rounded(d, (870, 200, 1050, 380), 42, (99, 102, 241, 255))
    d.text((918, 238), "B", font=font(110, True), fill=(255, 255, 255, 255))
    t = "ByteBuddies"
    tw = d.textlength(t, font=font(72, True))
    d.text(((W - tw) / 2, 420), t, font=font(72, True), fill=(255, 255, 255, 255))
    s = "See the whole platform"
    sw = d.textlength(s, font=font(36, False))
    d.text(((W - sw) / 2, 520), s, font=font(36, False), fill=(196, 181, 253, 255))
    p = "Lessons  ·  Games  ·  Robots  ·  Python  ·  Classroom"
    pw = d.textlength(p, font=font(26, True))
    d.text(((W - pw) / 2, 620), p, font=font(26, True), fill=(167, 243, 208, 255))
    return img


def end():
    img = title()
    d = ImageDraw.Draw(img)
    rounded(d, (W // 2 - 460, 740, W // 2 + 460, 850), 32, (16, 185, 129, 255))
    label = "bytebuddies.technology"
    tw = d.textlength(label, font=font(40, True))
    d.text(((W - tw) / 2, 768), label, font=font(40, True), fill=(255, 255, 255, 255))
    return img


title().save(OUT / "title.png")
end().save(OUT / "end.png")
cap("Lessons", "152 classroom-ready lessons", "Years 3 to 6 · National Curriculum").save(OUT / "c1.png")
cap("Game Builder", "Blocks, costumes and sounds", "Games pupils actually want to make").save(OUT / "c2.png")
cap("Robot Studio", "Design a robot in 3D", "Then drive it in the simulator").save(OUT / "c3.png")
cap("Python", "From blocks to real Python", "In the same workspace").save(OUT / "c4.png")
cap("Missions", "Challenges that keep them coding", "Progress teachers can see").save(OUT / "c5.png")
cap("Classroom", "Set work. See who needs help.", "Google Classroom ready").save(OUT / "c6.png")
print("overlays ok", OUT)
