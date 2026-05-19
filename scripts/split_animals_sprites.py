#!/usr/bin/env python3
"""Extract full-body animal sprites from Animals.png (3×6 grid) — same cutout pipeline as people."""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
from rembg import new_session

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sprite_cutout_common import (
    column_bands,
    cutout_band,
    downscale,
    foreground_mask,
    row_bands_from_gaps,
    sample_background,
)

SPRITES_DIR = Path("/Users/michelle/Documents/Sprites")
SOURCE = SPRITES_DIR / "Animals.png"
OUT_DIR = Path(__file__).resolve().parents[1] / "public" / "assets" / "characters" / "animals"
EXPORT_DIR = SPRITES_DIR / "animals"

ROWS, COLS = 3, 6
NAMES = [
    "Fox", "Wolf", "Bear", "Rabbit", "Deer", "Turtle",
    "Owl", "Bird", "Penguin", "Frog", "Cat", "Panda",
    "Cow", "Pig", "Sheep", "Squirrel", "Raccoon", "Lion",
]


def all_bands(w: int, h: int, fg) -> list[tuple[int, int, int, int]]:
    boxes = []
    for y0, y1 in row_bands_from_gaps(h, ROWS, fg, w):
        boxes.extend(column_bands(w, y0, y1, COLS))
    return boxes


def main():
    if not SOURCE.exists():
        raise SystemExit(f"Missing {SOURCE}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Source: {SOURCE}")
    session = new_session("u2net")

    image = cv2.imread(str(SOURCE))
    if image is None:
        raise SystemExit(f"Cannot read {SOURCE}")

    h, w = image.shape[:2]
    bg_bgr = sample_background(image)
    fg = foreground_mask(image, bg_bgr)
    bands = all_bands(w, h, fg)
    row_splits = row_bands_from_gaps(h, ROWS, fg, w)
    print(f"Grid {ROWS}×{COLS}, rows {row_splits}, bg BGR {bg_bgr.astype(int).tolist()}")

    if len(bands) != len(NAMES):
        raise SystemExit(f"Expected {len(NAMES)} bands, got {len(bands)}")

    for idx, (name, box) in enumerate(zip(NAMES, bands), start=1):
        rgba = cutout_band(image, fg, box, bg_bgr, session, bg_dist=34, trust_rembg=True)
        rgba = downscale(rgba)
        bgra = cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA)
        slug = name.lower().replace(" ", "_")
        for path in (
            OUT_DIR / f"animal_{slug}.png",
            EXPORT_DIR / f"character_{idx:02d}.png",
            EXPORT_DIR / f"{slug}.png",
        ):
            cv2.imwrite(str(path), bgra, [cv2.IMWRITE_PNG_COMPRESSION, 3])
        print(f"  {name}: {bgra.shape[1]}x{bgra.shape[0]} box={box}")


if __name__ == "__main__":
    main()
