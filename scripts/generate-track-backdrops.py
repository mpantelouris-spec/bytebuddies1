#!/usr/bin/env python3
"""Generate 1920×1080 chase-camera backdrop PNGs for all 10 CodeRacer tracks."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "backgrounds" / "tracks"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080

TRACKS = [
    ("coral_bay_sprint", (255, 140, 90), (20, 80, 140), "CORAL BAY SPRINT"),
    ("neon_cavern_dash", (10, 20, 40), (0, 200, 255), "NEON CAVERN DASH"),
    ("cloud_kingdom_loop", (100, 180, 255), (0, 250, 154), "CLOUD KINGDOM"),
    ("lava_lane_rush", (40, 10, 5), (255, 80, 0), "LAVA LANE RUSH"),
    ("midnight_neon_grid", (5, 10, 30), (255, 0, 255), "MIDNIGHT NEON GRID"),
    ("polar_pulse_circuit", (200, 220, 240), (120, 180, 220), "POLAR PULSE"),
    ("jungle_gate_grand_prix", (30, 60, 30), (80, 160, 60), "JUNGLE GATE GP"),
    ("cosmic_ring_rally", (15, 5, 35), (180, 80, 255), "COSMIC RING RALLY"),
    ("sunny_meadow_500", (180, 210, 120), (210, 170, 90), "SUNNY MEADOW 500"),
    ("underground_flash_run", (25, 25, 30), (255, 220, 0), "UNDERGROUND FLASH"),
]

REF_COPIES = {
    "neon_cavern_dash.png": ROOT / "public/assets/backgrounds/tracks/crystal_cavern_reference.png",
    "cloud_kingdom_loop.png": ROOT / "public/assets/backgrounds/tracks/sky_garden_reference.png",
}

def gradient(img, top, bottom):
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

def main():
    for name, top, bottom, label in TRACKS:
        dest = OUT / f"{name}.png"
        ref = REF_COPIES.get(dest.name)
        if ref and ref.exists():
            img = Image.open(ref).convert("RGB")
            img = img.resize((W, H), Image.Resampling.LANCZOS)
            img.save(dest, "PNG", optimize=True)
            print(f"copied reference -> {dest.name}")
            continue
        img = Image.new("RGB", (W, H))
        gradient(img, top, bottom)
        draw = ImageDraw.Draw(img)
        # Darken lower third so 3D road reads on top
        for y in range(int(H * 0.55), H):
            alpha = (y - int(H * 0.55)) / (H * 0.45)
            draw.line([(0, y), (W, y)], fill=(
                int(top[0] * 0.15 * alpha),
                int(top[1] * 0.15 * alpha),
                int(top[2] * 0.15 * alpha),
            ))
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 72)
        except OSError:
            font = ImageFont.load_default()
        draw.text((W // 2, H // 3), label, fill=(255, 255, 255), anchor="mm", font=font)
        draw.text((W // 2, int(H * 0.82)), "placeholder backdrop", fill=(200, 200, 200), anchor="mm", font=font)
        img.save(dest, "PNG", optimize=True)
        print(f"generated {dest.name}")

if __name__ == "__main__":
    main()
