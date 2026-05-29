#!/usr/bin/env python3
"""Copy processed cutouts from ~/Documents/Sprites into public/assets/characters."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

SPRITES_DIR = Path("/Users/michelle/Documents/Sprites")
ASSETS = Path(__file__).resolve().parents[1] / "public" / "assets" / "characters"

# Documents folder -> public folder + filename prefix
CATEGORY_MAP = {
    "animals": ("animals", "animal"),
    "building": ("building", "building"),
    "effect": ("effect", "effect"),
    "fantasy": ("fantasy", "fantasy"),
    "food": ("food", "food"),
    "game": ("game", "game"),
    "monster": ("monster", "monster"),
    "nature": ("nature", "nature"),
    "object": ("object", "object"),
    "raider": ("raider", "raider"),
    "space": ("space", "space"),
    "sport": ("sport", "sport"),
    "vehicle": ("vehicle", "vehicle"),
    "people": ("chibi", "chibi"),
}


def slug_from_stem(stem: str, prefix: str) -> str | None:
    if stem.startswith("character_"):
        return None
    if stem.startswith(f"{prefix}_"):
        return stem
    if prefix == "animal":
        return f"animal_{stem}"
    if prefix == "chibi":
        return f"chibi_{stem}"
    if stem.startswith(prefix):
        return stem
    return f"{prefix}_{stem}"


def copy_sprite(src: Path, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    return True


def restore_category(doc_folder: str, out_folder: str, prefix: str) -> int:
    src_dir = SPRITES_DIR / doc_folder
    dest_dir = ASSETS / out_folder
    if not src_dir.is_dir():
        print(f"Missing source folder: {src_dir}")
        return 0
    n = 0
    for src in sorted(src_dir.glob("*.png")):
        target_name = slug_from_stem(src.stem, prefix)
        if not target_name:
            continue
        dest = dest_dir / f"{target_name}.png"
        if copy_sprite(src, dest):
            n += 1
    print(f"  {doc_folder} → {out_folder}/ ({n} files)")
    return n


def main() -> None:
    if not SPRITES_DIR.is_dir():
        raise SystemExit(f"Sprites folder not found: {SPRITES_DIR}")

    total = 0
    print(f"Restoring from {SPRITES_DIR}")
    for doc_folder, (out_folder, prefix) in CATEGORY_MAP.items():
        total += restore_category(doc_folder, out_folder, prefix)

    print(f"Done — wrote {total} sprites under {ASSETS}")


if __name__ == "__main__":
    main()
