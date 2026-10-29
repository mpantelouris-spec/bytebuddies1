/**
 * Paint editor helpers: colours (HSV + transparency + gradients), smart fill with
 * tolerance, background removal, cropping and the shape stamps.
 */

/* ── Colours ── */
export function hsvToRgb(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}
export function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b); const min = Math.min(r, g, b); const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}
export function hexToRgb(hex) {
  const m = String(hex || '').replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m.padEnd(6, '0');
  return [parseInt(full.slice(0, 2), 16) || 0, parseInt(full.slice(2, 4), 16) || 0, parseInt(full.slice(4, 6), 16) || 0];
}
export const rgbToHex = (r, g, b) => `#${[r, g, b].map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')).join('')}`;

/** A colour the editor works with: hue/sat/value + alpha (0..1). */
export const colorFromHex = (hex, a = 1) => ({ ...rgbToHsv(...hexToRgb(hex)), a });
export const colorHex = (c) => rgbToHex(...hsvToRgb(c.h, c.s, c.v));
export const colorCss = (c) => {
  const [r, g, b] = hsvToRgb(c.h, c.s, c.v);
  return `rgba(${r},${g},${b},${c.a ?? 1})`;
};

/** Fill paint for a box: solid colour, or a left→right / centre-out gradient. */
export function makePaint(ctx, fill, x0, y0, x1, y1) {
  if (!fill || fill.mode === 'solid' || !fill.mode) return colorCss(fill.c1 || fill);
  const g = fill.mode === 'radial'
    ? ctx.createRadialGradient((x0 + x1) / 2, (y0 + y1) / 2, 0, (x0 + x1) / 2, (y0 + y1) / 2, Math.max(1, Math.hypot(x1 - x0, y1 - y0) / 2))
    : ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, colorCss(fill.c1));
  g.addColorStop(1, colorCss(fill.c2));
  return g;
}

/* ── Regions: smart fill and background removal ── */
/**
 * Pixels connected to the start points whose colour is within `tol` of the start colour.
 * Returns { mask: Uint8Array, bbox } — the mask is grown by 1px so anti-aliased edges are covered.
 */
export function regionMask(ctx, starts, tol = 40) {
  const { width: w, height: h } = ctx.canvas;
  const data = ctx.getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  let x0 = w; let y0 = h; let x1 = -1; let y1 = -1;
  starts.forEach(([sx, sy]) => {
    sx = Math.max(0, Math.min(w - 1, Math.round(sx)));
    sy = Math.max(0, Math.min(h - 1, Math.round(sy)));
    const i0 = (sy * w + sx) * 4;
    const ref = [data[i0], data[i0 + 1], data[i0 + 2], data[i0 + 3]];
    const near = (i) => {
      // Fully transparent pixels all count as the same colour
      if (ref[3] < 10 && data[i + 3] < 10) return true;
      return Math.abs(data[i] - ref[0]) + Math.abs(data[i + 1] - ref[1]) + Math.abs(data[i + 2] - ref[2]) + Math.abs(data[i + 3] - ref[3]) <= tol * 2.2;
    };
    const stack = [sy * w + sx];
    while (stack.length) {
      const p = stack.pop();
      if (mask[p]) continue;
      if (!near(p * 4)) continue;
      mask[p] = 1;
      const x = p % w; const y = (p - x) / w;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x > 0) stack.push(p - 1);
      if (x < w - 1) stack.push(p + 1);
      if (y > 0) stack.push(p - w);
      if (y < h - 1) stack.push(p + w);
    }
  });
  if (x1 < 0) return { mask, bbox: null };
  // Grow by one pixel to swallow the soft edge
  const grown = mask.slice();
  for (let y = Math.max(0, y0 - 1); y <= Math.min(h - 1, y1 + 1); y++) {
    for (let x = Math.max(0, x0 - 1); x <= Math.min(w - 1, x1 + 1); x++) {
      const p = y * w + x;
      if (mask[p]) continue;
      if ((x > 0 && mask[p - 1]) || (x < w - 1 && mask[p + 1]) || (y > 0 && mask[p - w]) || (y < h - 1 && mask[p + w])) grown[p] = 1;
    }
  }
  return { mask: grown, bbox: { x0: Math.max(0, x0 - 1), y0: Math.max(0, y0 - 1), x1: Math.min(w - 1, x1 + 1), y1: Math.min(h - 1, y1 + 1) } };
}

function maskCanvas(mask, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  for (let p = 0; p < mask.length; p++) if (mask[p]) img.data[p * 4 + 3] = 255;
  g.putImageData(img, 0, 0);
  return c;
}

/** Fill a region with a colour or gradient (the bucket tool). */
export function fillRegion(ctx, x, y, fill, tol = 40) {
  const { width: w, height: h } = ctx.canvas;
  const { mask, bbox } = regionMask(ctx, [[x, y]], tol);
  if (!bbox) return false;
  const tmp = document.createElement('canvas');
  tmp.width = w; tmp.height = h;
  const t = tmp.getContext('2d');
  t.fillStyle = makePaint(t, fill, bbox.x0, bbox.y0, bbox.x1, bbox.y1);
  t.fillRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0 + 1, bbox.y1 - bbox.y0 + 1);
  t.globalCompositeOperation = 'destination-in';
  t.drawImage(maskCanvas(mask, w, h), 0, 0);
  // Replace (not blend) the old colour inside the region
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.drawImage(maskCanvas(mask, w, h), 0, 0);
  ctx.restore();
  ctx.drawImage(tmp, 0, 0);
  return true;
}

/** Make a colour region see-through (the magic eraser). */
export function eraseRegion(ctx, starts, tol = 40) {
  const { width: w, height: h } = ctx.canvas;
  const { mask, bbox } = regionMask(ctx, starts, tol);
  if (!bbox) return false;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.drawImage(maskCanvas(mask, w, h), 0, 0);
  ctx.restore();
  return true;
}

/** Remove a photo's background: erase what's connected to the edges and matches the corners. */
export function removeBackground(ctx, tol = 38) {
  const { width: w, height: h } = ctx.canvas;
  const data = ctx.getImageData(0, 0, w, h).data;
  const opaque = (x, y) => data[(y * w + x) * 4 + 3] > 10;
  const starts = [];
  // Seeds every 16px round the border wherever there is something to remove
  for (let x = 0; x < w; x += 16) { if (opaque(x, 0)) starts.push([x, 0]); if (opaque(x, h - 1)) starts.push([x, h - 1]); }
  for (let y = 0; y < h; y += 16) { if (opaque(0, y)) starts.push([0, y]); if (opaque(w - 1, y)) starts.push([w - 1, y]); }
  if (!starts.length) {
    // The picture sits inside transparent space: use the colour just inside its edge
    return false;
  }
  return eraseRegion(ctx, starts, tol);
}

/** Crop to the visible pixels (with a small margin). */
export function cropOpaque(canvas, pad = 6) {
  const g = canvas.getContext('2d', { willReadFrequently: true });
  const { width, height } = canvas;
  const { data } = g.getImageData(0, 0, width, height);
  let minX = width; let minY = height; let maxX = -1; let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 12) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return { dataUrl: canvas.toDataURL('image/png'), w: width, h: height, empty: true };
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad); maxY = Math.min(height - 1, maxY + pad);
  const cw = maxX - minX + 1; const ch = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = cw; out.height = ch;
  out.getContext('2d').drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  return { dataUrl: out.toDataURL('image/png'), w: cw, h: ch, box: { x: minX, y: minY, w: cw, h: ch } };
}

/** Bounding box of visible pixels (or null). */
export function opaqueBox(canvas) {
  const r = cropOpaque(canvas, 0);
  return r.empty ? null : r.box;
}

/* ── Shape stamps ── */
export const STAMPS = [
  ['star', '⭐ Star'], ['heart', '❤️ Heart'], ['triangle', '🔺 Triangle'], ['polygon', '⬢ Polygon'],
  ['bubble', '💬 Speech bubble'], ['arrow', '➡️ Arrow'], ['cloud', '☁️ Cloud'],
];

/** Trace a stamp shape filling the box (x, y, w, h). */
export function stampPath(ctx, kind, x, y, w, h, sides = 6) {
  const cx = x + w / 2; const cy = y + h / 2;
  ctx.beginPath();
  if (kind === 'star' || kind === 'polygon' || kind === 'triangle') {
    const n = kind === 'triangle' ? 3 : kind === 'star' ? 5 : sides;
    const pts = kind === 'star' ? n * 2 : n;
    for (let i = 0; i < pts; i++) {
      const r = kind === 'star' && i % 2 ? 0.42 : 1;
      const a = -Math.PI / 2 + (i * Math.PI * 2) / pts;
      const px = cx + Math.cos(a) * (w / 2) * r; const py = cy + Math.sin(a) * (h / 2) * r;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath();
  } else if (kind === 'heart') {
    ctx.moveTo(cx, y + h * 0.95);
    ctx.bezierCurveTo(x - w * 0.15, y + h * 0.55, x + w * 0.05, y - h * 0.05, cx, y + h * 0.28);
    ctx.bezierCurveTo(x + w * 0.95, y - h * 0.05, x + w * 1.15, y + h * 0.55, cx, y + h * 0.95);
    ctx.closePath();
  } else if (kind === 'bubble') {
    const r = Math.min(w, h) * 0.18; const bh = h * 0.78;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + bh, r);
    ctx.arcTo(x + w, y + bh, x, y + bh, r);
    ctx.lineTo(x + w * 0.38, y + bh);
    ctx.lineTo(x + w * 0.2, y + h);
    ctx.lineTo(x + w * 0.24, y + bh);
    ctx.arcTo(x, y + bh, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  } else if (kind === 'arrow') {
    ctx.moveTo(x, y + h * 0.32); ctx.lineTo(x + w * 0.6, y + h * 0.32); ctx.lineTo(x + w * 0.6, y);
    ctx.lineTo(x + w, cy); ctx.lineTo(x + w * 0.6, y + h); ctx.lineTo(x + w * 0.6, y + h * 0.68);
    ctx.lineTo(x, y + h * 0.68); ctx.closePath();
  } else if (kind === 'cloud') {
    ctx.moveTo(x + w * 0.2, y + h * 0.85);
    ctx.arc(x + w * 0.22, y + h * 0.62, h * 0.23, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(x + w * 0.42, y + h * 0.38, h * 0.3, Math.PI, Math.PI * 1.85);
    ctx.arc(x + w * 0.68, y + h * 0.4, h * 0.27, Math.PI * 1.2, Math.PI * 0.1);
    ctx.arc(x + w * 0.8, y + h * 0.64, h * 0.22, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
  }
}

export const FONTS = [
  ['Rounded', '800 {s}px Nunito, "Segoe UI", sans-serif'],
  ['Serif', '700 {s}px Georgia, "Times New Roman", serif'],
  ['Comic', '700 {s}px "Comic Sans MS", "Marker Felt", "Chalkboard SE", cursive'],
  ['Mono', '700 {s}px "Courier New", ui-monospace, monospace'],
  ['Bold', '900 {s}px Impact, "Arial Black", sans-serif'],
];
export const fontCss = (family, size) => (FONTS.find((f) => f[0] === family) || FONTS[0])[1].replace('{s}', Math.round(size));
