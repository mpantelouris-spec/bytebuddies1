/**
 * Pixel-accurate "touching" (like Scratch): two sprites only touch where their visible,
 * non-transparent pixels overlap — not where the empty corners of their picture boxes do.
 *
 * The Game Builder registers each sprite's drawn image with `rememberSpriteImage` while
 * drawing; until an image is known (or outside a browser) we fall back to box overlap.
 */
import { getRenderRotation, getRenderScaleX } from './spriteMotion.js';

const imageBySpriteId = new Map();
const alphaByImage = new WeakMap();
const ALPHA_MIN = 40; // ignore soft anti-aliased edges and shadows
const STEP = 2; // sample every 2px — plenty for kids' sprites, cheap enough every frame

/** Remember the image a sprite was drawn with (called from the stage renderer). */
export function rememberSpriteImage(spriteId, img) {
  if (spriteId == null || !img) return;
  imageBySpriteId.set(spriteId, img);
}

export function forgetSpriteImages() {
  imageBySpriteId.clear();
}

function alphaMap(img) {
  if (alphaByImage.has(img)) return alphaByImage.get(img);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h || typeof document === 'undefined') return null;
  try {
    const c = document.createElement('canvas');
    // Downsample big artwork — collision does not need full resolution
    const scale = Math.min(1, 256 / Math.max(w, h));
    c.width = Math.max(1, Math.round(w * scale));
    c.height = Math.max(1, Math.round(h * scale));
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, c.width, c.height);
    const data = g.getImageData(0, 0, c.width, c.height).data;
    const a = new Uint8Array(c.width * c.height);
    for (let i = 0; i < a.length; i++) a[i] = data[i * 4 + 3];
    const map = { a, w: c.width, h: c.height, iw: w, ih: h };
    alphaByImage.set(img, map);
    return map;
  } catch {
    alphaByImage.set(img, null); // tainted or unreadable image — use boxes
    return null;
  }
}

/** Where and how a sprite's picture is drawn (mirrors the stage renderer). */
function shapeOf(sprite) {
  const img = imageBySpriteId.get(sprite.id) || imageBySpriteId.get(sprite._cloneOriginal);
  const map = img ? alphaMap(img) : null;
  if (!map) return null;
  let dw = sprite.w;
  let dh = sprite.h;
  if (sprite.customImage && map.iw > 0 && map.ih > 0) {
    const fit = Math.min(sprite.w / map.iw, sprite.h / map.ih);
    dw = map.iw * fit;
    dh = map.ih * fit;
  }
  const rot = getRenderRotation(sprite) + ((sprite.costumeTilt || 0) * Math.PI) / 180;
  const flip = getRenderScaleX(sprite) * (sprite.costumeFlipX ? -1 : 1);
  return {
    map, dw, dh, flip,
    cx: sprite.x + sprite.w / 2,
    cy: sprite.y + sprite.h / 2,
    cos: Math.cos(-rot),
    sin: Math.sin(-rot),
    r: Math.hypot(dw, dh) / 2,
  };
}

/** Is the stage point (px, py) on a visible pixel of this shape? */
function solidAt(s, px, py) {
  const dx = px - s.cx;
  const dy = py - s.cy;
  let lx = dx * s.cos - dy * s.sin;
  const ly = dx * s.sin + dy * s.cos;
  lx *= s.flip;
  const u = (lx + s.dw / 2) / s.dw;
  const v = (ly + s.dh / 2) / s.dh;
  if (u < 0 || u >= 1 || v < 0 || v >= 1) return false;
  const { a, w, h } = s.map;
  return a[Math.floor(v * h) * w + Math.floor(u * w)] >= ALPHA_MIN;
}

const boxOf = (s) => ({ x0: s.cx - s.r, y0: s.cy - s.r, x1: s.cx + s.r, y1: s.cy + s.r });

/**
 * True when the visible pixels of a and b overlap. Returns null when either picture
 * isn't known yet, so callers can fall back to box overlap.
 */
export function pixelsOverlap(a, b) {
  const sa = shapeOf(a);
  const sb = shapeOf(b);
  if (!sa || !sb) return null;
  const A = boxOf(sa);
  const Bx = boxOf(sb);
  const x0 = Math.max(A.x0, Bx.x0);
  const y0 = Math.max(A.y0, Bx.y0);
  const x1 = Math.min(A.x1, Bx.x1);
  const y1 = Math.min(A.y1, Bx.y1);
  if (x0 >= x1 || y0 >= y1) return false;
  for (let y = y0; y < y1; y += STEP) {
    for (let x = x0; x < x1; x += STEP) {
      if (solidAt(sa, x, y) && solidAt(sb, x, y)) return true;
    }
  }
  return false;
}
