"""Shared rembg cutout pipeline for sprite sheet extraction (people + animals)."""

from __future__ import annotations

import cv2
import numpy as np
from PIL import Image
from rembg import remove

BAND_PAD_LEFT = 0.05
BAND_PAD_RIGHT = 0.20
ROW_PAD_TOP_FRAC = 0.06
ROW_PAD_BOTTOM_FRAC = 0.25
ROW_PAD_DETECTED_FRAC = 0.10
TRIM_PAD = 16
TRIM_PAD_BOTTOM = 28
MAX_EDGE = 2048
TARGET_MAX_EDGE = 2048  # max resolution for all sprites; multi-step upscale + sharpen
BG_DIST = 34
ROW_GAP_FRAC = 0.025


def sample_background(image: np.ndarray) -> np.ndarray:
    h, w = image.shape[:2]
    pts = [(8, 8), (w - 9, 8), (8, h - 9), (w - 9, h - 9), (w // 2, 8), (w // 2, h - 9)]
    return np.array([image[y, x].astype(np.float32) for x, y in pts]).mean(axis=0)


def foreground_mask(image: np.ndarray, bg_bgr: np.ndarray, bg_dist: float | None = None) -> np.ndarray:
    thresh = bg_dist if bg_dist is not None else BG_DIST
    diff = image.astype(np.float32) - bg_bgr.reshape(1, 1, 3)
    dist = np.sqrt(np.sum(diff * diff, axis=2))
    mask = (dist > thresh).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    return cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=1)


def row_bands_from_gaps(h: int, rows: int, fg: np.ndarray, w: int) -> list[tuple[int, int]]:
    """Detect row strips from horizontal gutters (same idea as chibi row split)."""
    row_fg = fg.sum(axis=1)
    thresh = max(8, int(w * ROW_GAP_FRAC))
    gaps: list[tuple[int, int]] = []
    in_gap = False
    start = 0
    for y in range(h):
        empty = row_fg[y] < thresh
        if empty and not in_gap:
            start = y
            in_gap = True
        elif not empty and in_gap:
            if y - start >= 8:
                gaps.append((start, y))
            in_gap = False
    if in_gap and h - start >= 8:
        gaps.append((start, h))

    inner = [g for g in gaps if g[1] - g[0] >= 12]
    if len(inner) >= rows + 1:
        bands = []
        for i in range(rows):
            y0, y1 = inner[i][1], inner[i + 1][0]
            rh = max(1, y1 - y0)
            pad = int(rh * ROW_PAD_DETECTED_FRAC)
            bands.append((max(0, y0 - pad), min(h, y1 + pad)))
        return bands

    bands = []
    for r in range(rows):
        y0 = int(r * h / rows)
        y1 = int((r + 1) * h / rows)
        rh = max(1, y1 - y0)
        bands.append(
            (
                max(0, y0 - int(rh * ROW_PAD_TOP_FRAC)),
                min(h, y1 + int(rh * ROW_PAD_BOTTOM_FRAC)),
            )
        )
    return bands


def column_bands(w: int, y0: int, y1: int, cols: int) -> list[tuple[int, int, int, int]]:
    """Asymmetric padding: small bleed left, larger right (for tails/ears)."""

    def band(col: int):
        cw = w / cols
        pad_l = int(cw * BAND_PAD_LEFT)
        pad_r = int(cw * BAND_PAD_RIGHT)
        x0 = max(0, int(col * cw) - (pad_l if col > 0 else 0))
        x1 = min(w, int((col + 1) * cw) + (pad_r if col < cols - 1 else 0))
        return (x0, y0, x1, y1)

    return [band(c) for c in range(cols)]


def keep_center_figure(alpha: np.ndarray) -> np.ndarray:
    """Drop neighbour-column bleed; keep the largest figure near crop centre."""
    binary = (alpha > 20).astype(np.uint8) * 255
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if n <= 1:
        return alpha
    crop_w = alpha.shape[1]
    target_x = crop_w / 2.0
    candidates = []
    for i in range(1, n):
        area = stats[i, cv2.CC_STAT_AREA]
        if area < 900:
            continue
        cx = centroids[i][0]
        if abs(cx - target_x) > crop_w * 0.42:
            continue
        candidates.append((area, abs(cx - target_x), i))
    if not candidates:
        return alpha
    candidates.sort(key=lambda t: (-t[0], t[1]))
    best_i = candidates[0][2]
    return np.where(labels == best_i, alpha, 0).astype(np.uint8)


def cutout_band(
    image: np.ndarray,
    fg: np.ndarray,
    box,
    bg_bgr: np.ndarray,
    session,
    bg_dist: float | None = None,
    trust_rembg: bool = True,
) -> np.ndarray:
    x0, y0, x1, y1 = box
    crop_bgr = image[y0:y1, x0:x1].copy()
    crop_fg = fg[y0:y1, x0:x1]
    thresh = bg_dist if bg_dist is not None else BG_DIST

    pil = Image.fromarray(cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB))
    rgba = np.array(remove(pil, session=session))

    alpha = rgba[:, :, 3].astype(np.float32)
    if trust_rembg:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        crop_fg_soft = cv2.dilate(crop_fg, k, iterations=2)
        alpha = np.where(crop_fg_soft > 0, alpha, 0.0)
    else:
        alpha = alpha * crop_fg.astype(np.float32)
    alpha = keep_center_figure(alpha.astype(np.uint8)).astype(np.float32)

    solid = (alpha > 20).astype(np.uint8)
    dist_in = cv2.distanceTransform(solid, cv2.DIST_L2, 5)
    edge = dist_in < 6
    feather = np.where(edge, np.clip(dist_in / 6.0, 0.82, 1.0), 1.0)
    alpha = alpha * feather

    rgba[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

    if not trust_rembg:
        diff = rgba[:, :, :3].astype(np.float32) - bg_bgr.reshape(1, 1, 3)
        dist = np.sqrt(np.sum(diff * diff, axis=2))
        fringe = (dist < thresh) & (rgba[:, :, 3] > 0)
        fade = np.clip(dist / thresh, 0, 1)
        rgba[:, :, 3] = np.where(
            fringe, (rgba[:, :, 3].astype(np.float32) * fade).astype(np.uint8), rgba[:, :, 3]
        )

    ys, xs = np.where(rgba[:, :, 3] > 12)
    if len(ys):
        y0t = max(0, ys.min() - TRIM_PAD)
        y1t = min(rgba.shape[0], ys.max() + TRIM_PAD_BOTTOM + 1)
        x0t = max(0, xs.min() - TRIM_PAD)
        x1t = min(rgba.shape[1], xs.max() + TRIM_PAD + 1)
        rgba = rgba[y0t:y1t, x0t:x1t]
    return rgba


def sharpen_rgba(rgba: np.ndarray, amount: float = 0.45) -> np.ndarray:
    """Light unsharp mask on RGB; preserve alpha."""
    if rgba.shape[2] < 4:
        return rgba
    rgb = rgba[:, :, :3].astype(np.float32)
    blur = cv2.GaussianBlur(rgb, (0, 0), 1.1)
    sharp = np.clip(rgb + amount * (rgb - blur), 0, 255).astype(np.uint8)
    out = rgba.copy()
    out[:, :, :3] = sharp
    return out


def _resize_rgba(rgba: np.ndarray, scale: float, *, upscale: bool = False) -> np.ndarray:
    h, w = rgba.shape[:2]
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    interp = cv2.INTER_CUBIC if upscale and scale > 1.0 else cv2.INTER_LANCZOS4
    return cv2.resize(rgba, (nw, nh), interpolation=interp)


def _upscale_to_target(rgba: np.ndarray, target: int) -> np.ndarray:
    """Multi-step 2× upscale + sharpen — clearer than one big Lanczos jump."""
    m = max(rgba.shape[:2])
    if m >= target:
        return rgba
    while max(rgba.shape[:2]) < target:
        h, w = rgba.shape[:2]
        next_m = min(target, max(h, w) * 2)
        scale = next_m / max(h, w)
        if scale <= 1.001:
            break
        rgba = _resize_rgba(rgba, scale, upscale=True)
        rgba = sharpen_rgba(rgba, amount=0.35)
    m = max(rgba.shape[:2])
    if m != target:
        rgba = _resize_rgba(rgba, target / m, upscale=(target > m))
    return sharpen_rgba(rgba, amount=0.4)


def normalize_sprite_size(rgba: np.ndarray) -> np.ndarray:
    """Fit longest edge to TARGET_MAX_EDGE; sharpen; cap huge sprites at MAX_EDGE."""
    h, w = rgba.shape[:2]
    m = max(h, w)
    if m == 0:
        return rgba
    if m > MAX_EDGE:
        rgba = _resize_rgba(rgba, MAX_EDGE / m, upscale=False)
    elif m < TARGET_MAX_EDGE:
        rgba = _upscale_to_target(rgba, TARGET_MAX_EDGE)
    else:
        rgba = sharpen_rgba(rgba, amount=0.3)
    return rgba


def downscale(rgba: np.ndarray) -> np.ndarray:
    """Legacy name — normalizes sprite dimensions (upscale + cap)."""
    return normalize_sprite_size(rgba)
