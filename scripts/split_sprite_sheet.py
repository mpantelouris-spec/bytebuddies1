#!/usr/bin/env python3
"""Extract sprites from a grid sheet using the shared people/animals cutout pipeline."""

from __future__ import annotations

import argparse
import json
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
    row_bands_from_gaps,
    sample_background,
)

SPRITES_DIR = Path("/Users/michelle/Documents/Sprites")
PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ASSETS = PROJECT_ROOT / "public" / "assets" / "characters"


def grid_bands(w: int, h: int, rows: int, cols: int, fg: np.ndarray) -> list[tuple[int, int, int, int]]:
    row_ranges = row_bands_from_gaps(h, rows, fg, w)
    boxes: list[tuple[int, int, int, int]] = []
    for y0, y1 in row_ranges:
        boxes.extend(column_bands(w, y0, y1, cols))
    return boxes


def extract_blob_sprites(
    image: np.ndarray,
    fg: np.ndarray,
    bg_bgr: np.ndarray,
    session,
    min_area: int = 2500,
) -> list[tuple[str, tuple[int, int, int, int]]]:
    """Find separate sprites on an irregular sheet (e.g. Space Raiders)."""
    n, labels, stats, _ = cv2.connectedComponentsWithStats(fg, connectivity=8)
    blobs = []
    for i in range(1, n):
        area = stats[i, cv2.CC_STAT_AREA]
        if area < min_area:
            continue
        x, y, bw, bh = (
            stats[i, cv2.CC_STAT_LEFT],
            stats[i, cv2.CC_STAT_TOP],
            stats[i, cv2.CC_STAT_WIDTH],
            stats[i, cv2.CC_STAT_HEIGHT],
        )
        pad = 12
        x0 = max(0, x - pad)
        y0 = max(0, y - pad)
        x1 = min(image.shape[1], x + bw + pad)
        y1 = min(image.shape[0], y + bh + pad)
        blobs.append((y0, x0, area, (x0, y0, x1, y1)))
    blobs.sort(key=lambda t: (t[0] // 80, t[1]))
    return [(f"sprite_{idx:02d}", box) for idx, (_, _, _, box) in enumerate(blobs, start=1)]


def slugify(name: str) -> str:
    return "".join(c if c.isalnum() else "_" for c in name.lower()).strip("_")


def extract_sheet(
    source: Path,
    category: str,
    prefix: str,
    names: list[str] | None,
    rows: int | None,
    cols: int | None,
    irregular: bool = False,
    min_blob_area: int = 1800,
    bg_dist: float | None = None,
    trust_rembg: bool = True,
) -> dict:
    if not source.exists():
        raise SystemExit(f"Missing {source}")

    out_dir = PUBLIC_ASSETS / prefix
    export_dir = SPRITES_DIR / prefix
    out_dir.mkdir(parents=True, exist_ok=True)
    export_dir.mkdir(parents=True, exist_ok=True)

    image = cv2.imread(str(source))
    if image is None:
        raise SystemExit(f"Cannot read {source}")

    h, w = image.shape[:2]
    bg_bgr = sample_background(image)
    fg = foreground_mask(image, bg_bgr, bg_dist)
    session = new_session("u2net")

    if irregular:
        entries = extract_blob_sprites(image, fg, bg_bgr, session, min_blob_area)
    else:
        if rows is None or cols is None:
            raise SystemExit("rows and cols required for grid sheets")
        boxes = grid_bands(w, h, rows, cols, fg)
        count = rows * cols
        if names and len(names) != count:
            raise SystemExit(f"{source.name}: expected {count} names, got {len(names)}")
        label_names = names or [f"Sprite {i}" for i in range(1, count + 1)]
        entries = list(zip(label_names, boxes))

    manifest_items = []
    print(f"\n{category} <- {source.name} ({len(entries)} sprites)")
    for idx, (name, box) in enumerate(entries, start=1):
        rgba = cutout_band(image, fg, box, bg_bgr, session, bg_dist=bg_dist, trust_rembg=trust_rembg)
        rgba = downscale(rgba)
        bgra = cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA)
        slug = slugify(name)
        filename = f"{prefix}_{slug}.png"
        for path in (out_dir / filename, export_dir / filename):
            cv2.imwrite(str(path), bgra, [cv2.IMWRITE_PNG_COMPRESSION, 3])
        manifest_items.append(
            {
                "name": name,
                "slug": slug,
                "file": filename,
                "width": int(bgra.shape[1]),
                "height": int(bgra.shape[0]),
            }
        )
        print(f"  {name}: {bgra.shape[1]}x{bgra.shape[0]}")

    manifest = {"category": category, "prefix": prefix, "source": source.name, "items": manifest_items}
    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, help="JSON config path")
    parser.add_argument("--all", action="store_true", help="Process all sheets from sprite_sheet_configs.json")
    args = parser.parse_args()

    configs_path = Path(__file__).resolve().parent / "sprite_sheet_configs.json"
    if args.all:
        configs = json.loads(configs_path.read_text(encoding="utf-8"))
        manifests = []
        for cfg in configs:
            source = SPRITES_DIR / cfg["source"]
            manifests.append(
                extract_sheet(
                    source=source,
                    category=cfg["category"],
                    prefix=cfg["prefix"],
                    names=cfg.get("names"),
                    rows=cfg.get("rows"),
                    cols=cfg.get("cols"),
                    irregular=cfg.get("irregular", False),
                    min_blob_area=cfg.get("min_blob_area", 1800),
                    bg_dist=cfg.get("bg_dist"),
                    trust_rembg=cfg.get("trust_rembg", True),
                )
            )
        out = PROJECT_ROOT / "public" / "assets" / "characters" / "sprite_manifest.json"
        out.write_text(json.dumps(manifests, indent=2), encoding="utf-8")
        print(f"\nWrote {out}")
        return

    if not args.config:
        raise SystemExit("Use --all or --config")
    cfg = json.loads(args.config.read_text(encoding="utf-8"))
    extract_sheet(
        source=SPRITES_DIR / cfg["source"],
        category=cfg["category"],
        prefix=cfg["prefix"],
        names=cfg.get("names"),
        rows=cfg.get("rows"),
        cols=cfg.get("cols"),
        irregular=cfg.get("irregular", False),
        min_blob_area=cfg.get("min_blob_area", 1800),
        bg_dist=cfg.get("bg_dist"),
        trust_rembg=cfg.get("trust_rembg", True),
    )


if __name__ == "__main__":
    main()
