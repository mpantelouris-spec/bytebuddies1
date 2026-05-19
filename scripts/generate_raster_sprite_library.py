#!/usr/bin/env python3
"""Generate src/data/rasterSpriteLibrary.js from extraction manifests."""

from __future__ import annotations

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MANIFEST = PROJECT_ROOT / "public" / "assets" / "characters" / "sprite_manifest.json"
OUT = PROJECT_ROOT / "src" / "data" / "rasterSpriteLibrary.js"

# Fallback colors per category
COLORS = {
    "Objects": "#f59e0b",
    "Effects": "#f97316",
    "Fantasy": "#a855f7",
    "Food": "#ef4444",
    "Vehicles": "#3b82f6",
    "Monsters": "#7c3aed",
    "Buildings": "#78716c",
    "Nature": "#22c55e",
    "Space": "#6366f1",
    "Sports": "#f97316",
    "Game": "#eab308",
    "Space Raiders": "#22d3ee",
}


def js_str(s: str) -> str:
    return json.dumps(s)


def item_js(name: str, prefix: str, slug: str, color: str, v: int = 6) -> str:
    path = f"/assets/characters/{prefix}/{prefix}_{slug}.png?v={v}"
    svg_tpl = (
        f'<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">'
        f'<rect width="64" height="64" fill="{color}"/></svg>'
    )
    return (
        f"      {{ name: {js_str(name)}, "
        f"svg: (c) => {js_str(svg_tpl)}, "
        f"color: {js_str(color)}, customImage: {js_str(path)} }}"
    )


def main():
    if not MANIFEST.exists():
        raise SystemExit(f"Missing {MANIFEST} — run split_sprite_sheet.py --all first")

    manifests = json.loads(MANIFEST.read_text(encoding="utf-8"))
    blocks = ["// Auto-generated — do not edit by hand"]
    blocks.append("export const RASTER_SPRITE_LIBRARY = [")

    for m in manifests:
        cat = m["category"]
        prefix = m["prefix"]
        color = COLORS.get(cat, "#94a3b8")
        blocks.append("  {")
        blocks.append(f"    category: {js_str(cat)},")
        blocks.append("    items: [")
        lines = [item_js(it["name"], prefix, it["slug"], color) for it in m["items"]]
        blocks.append(",\n".join(lines))
        blocks.append("    ],")
        blocks.append("  },")

    blocks.append("];")
    blocks.append("")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(blocks) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(manifests)} categories)")


if __name__ == "__main__":
    main()
