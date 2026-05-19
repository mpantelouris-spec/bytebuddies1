#!/usr/bin/env python3
"""Full-body chibi cutouts (7+8 layout) using shared sprite_cutout_common pipeline."""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
from rembg import new_session

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sprite_cutout_common import (
    column_bands,
    cutout_band,
    downscale,
    foreground_mask,
    sample_background,
)

SPRITES_DIR = Path("/Users/michelle/Documents/Sprites")
OUT_DIR = Path(__file__).resolve().parents[1] / "public" / "assets" / "characters" / "chibi"
PEOPLE_DIR = SPRITES_DIR / "people"

NAMES = [
    "Adventurer", "Explorer", "Sporty", "Witch", "Ranger", "Mechanic", "Robot",
    "Knight", "Archer", "Ninja", "Pirate Captain", "Astronaut", "Fire Mage", "Dino", "Ice Mage",
]

TOP_COLS, BOT_COLS = 7, 8
ROW_PAD_FRAC = 0.08


def find_source() -> Path:
    """Only the chibi people sheet — never another large sprite sheet."""
    explicit = [
        SPRITES_DIR / "ChatGPT Image May 18, 2026, 12_42_47 PM.png",
        SPRITES_DIR / "People.png",
        SPRITES_DIR / "Chibi.png",
    ]
    for p in explicit:
        if p.is_file():
            return p
    for p in sorted(SPRITES_DIR.glob("*.png")):
        name = p.name.lower()
        if "chatgpt" in name or "chibi" in name or name.startswith("people"):
            return p
    raise FileNotFoundError(
        f"No chibi people sheet in {SPRITES_DIR} "
        "(expected ChatGPT Image… or People.png)"
    )


def find_row_split(gray: np.ndarray) -> int:
    h = gray.shape[0]
    y0, y1 = int(h * 0.36), int(h * 0.56)
    row_fg = [(gray[y] < 245).sum() for y in range(y0, y1)]
    return y0 + int(np.argmin(row_fg))


def chibi_bands(w: int, h: int, split_y: int) -> list[tuple[int, int, int, int]]:
    pad = int(h * ROW_PAD_FRAC)
    top_y1 = min(h, split_y + pad)
    bot_y0 = max(0, split_y - pad)
    bands = []
    bands.extend(column_bands(w, 0, top_y1, TOP_COLS))
    bands.extend(column_bands(w, bot_y0, h, BOT_COLS))
    return bands


def main():
    src = find_source()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PEOPLE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Source: {src}")
    session = new_session("u2net")

    image = cv2.imread(str(src))
    if image is None:
        raise SystemExit(f"Cannot read {src}")

    h, w = image.shape[:2]
    bg_bgr = sample_background(image)
    fg = foreground_mask(image, bg_bgr, bg_dist=32)
    split_y = find_row_split(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY))
    bands = chibi_bands(w, h, split_y)
    print(f"split y={split_y}, {len(bands)} bands")

    if len(bands) != len(NAMES):
        raise SystemExit(f"Expected {len(NAMES)} bands, got {len(bands)}")

    for idx, (name, box) in enumerate(zip(NAMES, bands), start=1):
        rgba = cutout_band(image, fg, box, bg_bgr, session, bg_dist=32, trust_rembg=True)
        rgba = downscale(rgba)
        bgra = cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA)
        slug = name.lower().replace(" ", "_")
        for path in (
            OUT_DIR / f"chibi_{slug}.png",
            PEOPLE_DIR / f"character_{idx:02d}.png",
            PEOPLE_DIR / f"{slug}.png",
        ):
            cv2.imwrite(str(path), bgra, [cv2.IMWRITE_PNG_COMPRESSION, 3])
        print(f"  {name}: {bgra.shape[1]}x{bgra.shape[0]}")


if __name__ == "__main__":
    main()
