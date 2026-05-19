#!/usr/bin/env python3
"""Re-sharpen and upscale existing sprite PNGs (no rembg re-run)."""

from __future__ import annotations

import sys
from pathlib import Path

import cv2

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sprite_cutout_common import normalize_sprite_size

ASSETS = Path(__file__).resolve().parents[1] / "public" / "assets" / "characters"


def main() -> None:
    paths = sorted(ASSETS.rglob("*.png"))
    if not paths:
        raise SystemExit(f"No PNGs under {ASSETS}")
    n = 0
    for path in paths:
        bgra = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
        if bgra is None:
            continue
        if bgra.shape[2] == 3:
            bgra = cv2.cvtColor(bgra, cv2.COLOR_BGR2BGRA)
        rgba = cv2.cvtColor(bgra, cv2.COLOR_BGRA2RGBA)
        out = normalize_sprite_size(rgba)
        out_bgra = cv2.cvtColor(out, cv2.COLOR_RGBA2BGRA)
        cv2.imwrite(str(path), out_bgra, [cv2.IMWRITE_PNG_COMPRESSION, 1])
        n += 1
        if n % 50 == 0:
            print(f"  {n}/{len(paths)} …")
    from sprite_cutout_common import TARGET_MAX_EDGE
    print(f"Enhanced {n} sprites → max edge {TARGET_MAX_EDGE}px + sharpen")


if __name__ == "__main__":
    main()
