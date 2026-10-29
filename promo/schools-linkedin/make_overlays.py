#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'overlays'
OUT.mkdir(exist_ok=True)
W, H = 1920, 1080

def font(size, bold=True):
    candidates = [
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/System/Library/Fonts/Supplemental/Avenir Next.ttc',
        '/Library/Fonts/Arial Bold.ttf' if bold else '/Library/Fonts/Arial.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()

def rounded(draw, xy, r, fill):
    draw.rounded_rectangle(xy, radius=r, fill=fill)

def card(lines, kicker='', cta=False):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    panel = (80, H - 250, W - 80, H - 56)
    rounded(d, panel, 28, (8, 10, 28, 230))
    d.rounded_rectangle(panel, radius=28, outline=(129, 140, 248, 220), width=3)
    y = panel[1] + 28
    if kicker:
        d.text((120, y), kicker.upper(), font=font(22, True), fill=(167, 243, 208, 255))
        y += 36
    title_font = font(44, True)
    for line in lines:
        d.text((120, y), line, font=title_font, fill=(255, 255, 255, 255))
        y += 56
    if cta:
        btn = (W // 2 - 420, H - 210, W // 2 + 420, H - 120)
        rounded(d, btn, 36, (16, 185, 129, 250))
        label = 'Book a free school pilot  ·  bytebuddies.technology'
        tw = d.textlength(label, font=font(32, True))
        d.text(((W - tw) / 2, H - 188), label, font=font(32, True), fill=(255, 255, 255, 255))
    return img

def title_card():
    img = Image.new('RGBA', (W, H), (11, 10, 36, 255))
    d = ImageDraw.Draw(img)
    for i in range(18):
        a = 18 - i
        d.ellipse((960 - 420 - i * 8, 200 - i * 6, 960 + 420 + i * 8, 620 + i * 6), outline=(99, 102, 241, a))
    d.rounded_rectangle((870, 210, 1050, 390), radius=42, fill=(99, 102, 241, 255))
    d.text((915, 248), 'B', font=font(110, True), fill=(255, 255, 255, 255))
    t = 'ByteBuddies'
    tw = d.textlength(t, font=font(72, True))
    d.text(((W - tw) / 2, 430), t, font=font(72, True), fill=(255, 255, 255, 255))
    s = 'KS2 computing children actually want to do'
    sw = d.textlength(s, font=font(36, False))
    d.text(((W - sw) / 2, 530), s, font=font(36, False), fill=(196, 181, 253, 255))
    pill = 'FREE SCHOOL PILOTS  ·  2026–27'
    pw = d.textlength(pill, font=font(24, True))
    rounded(d, ((W - pw) / 2 - 28, 620, (W + pw) / 2 + 28, 680), 24, (16, 185, 129, 40))
    d.text(((W - pw) / 2, 632), pill, font=font(24, True), fill=(110, 231, 183, 255))
    return img

def end_card():
    img = title_card()
    d = ImageDraw.Draw(img)
    btn = (W // 2 - 460, 760, W // 2 + 460, 860)
    rounded(d, btn, 32, (16, 185, 129, 255))
    label = 'bytebuddies.technology'
    tw = d.textlength(label, font=font(40, True))
    d.text(((W - tw) / 2, 786), label, font=font(40, True), fill=(255, 255, 255, 255))
    sub = 'Book a free one-term pilot for your school'
    sw = d.textlength(sub, font=font(26, False))
    d.text(((W - sw) / 2, 890), sub, font=font(26, False), fill=(226, 232, 240, 255))
    return img

overlays = [
    ('cap01.png', ['KS2 computing children actually want to do.'], 'For heads & computing leads'),
    ('cap02.png', ['152 classroom-ready lessons · Years 3–6', 'Mapped to the National Curriculum'], 'Complete platform'),
    ('cap03.png', ['Pupils code games in the browser.', 'No kits. No downloads.'], 'Create'),
    ('cap04.png', ['Design robots in 3D.', 'Then move from blocks to Python.'], 'Robot Studio'),
    ('cap05.png', ['Set work. See who needs help. Mark.', 'Google Classroom ready.'], 'Teachers'),
    ('cap06.png', ['Free one-term school pilots for 2026–27.'], 'No cost · no commitment'),
]
title_card().save(OUT / 'title.png')
end_card().save(OUT / 'end.png')
for name, lines, kicker in overlays:
    card(lines, kicker).save(OUT / name)
print('wrote', OUT)
