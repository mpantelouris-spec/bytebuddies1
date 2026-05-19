/**
 * Scratch-like sensing helpers (collision, distance, color, keys).
 */

export const STAGE_W_DEFAULT = 480;
export const STAGE_H_DEFAULT = 360;

/** Normalize Blockly/Scratch key names to aliases checked by isKeyHeld. */
export function normalizeSenseKeyName(key) {
  const k = String(key || '').trim().toLowerCase();
  const map = {
    'up arrow': 'up',
    'down arrow': 'down',
    'left arrow': 'left',
    'right arrow': 'right',
    'rightarrow': 'right',
    'leftarrow': 'left',
    'uparrow': 'up',
    'downarrow': 'down',
    arrowup: 'up',
    arrowdown: 'down',
    arrowleft: 'left',
    arrowright: 'right',
    ' ': 'space',
    spacebar: 'space',
    return: 'enter',
    escape: 'escape',
    esc: 'escape',
    ctrl: 'control',
    control: 'control',
    alt: 'alt',
    shift: 'shift',
    any: 'any',
  };
  return map[k] || k;
}

export function spriteCenter(sprite) {
  return {
    x: (sprite?.x ?? 0) + (sprite?.w ?? 0) / 2,
    y: (sprite?.y ?? 0) + (sprite?.h ?? 0) / 2,
  };
}

export function bboxOverlap(a, b) {
  return (
    a.x < b.x + b.w
    && a.x + a.w > b.x
    && a.y < b.y + b.h
    && a.y + a.h > b.y
  );
}

export function isTouchingEdge(sprite, stageW = STAGE_W_DEFAULT, stageH = STAGE_H_DEFAULT) {
  if (!sprite) return false;
  return (
    sprite.x <= 0
    || sprite.y <= 0
    || sprite.x + sprite.w >= stageW
    || sprite.y + sprite.h >= stageH
  );
}

export function findSpriteByName(allSprites, name) {
  const target = String(name || '').trim().toLowerCase();
  if (!target || target === 'any') return null;
  return (allSprites || []).find((s) => String(s.name || '').toLowerCase() === target) || null;
}

export function isTouchingSprite(sprite, allSprites, targetName) {
  const target = String(targetName || 'any').trim().toLowerCase();
  for (const other of allSprites || []) {
    if (!other || other.id === sprite?.id) continue;
    if (other.visible === false) continue;
    if (target !== 'any' && String(other.name || '').toLowerCase() !== target) continue;
    if (bboxOverlap(sprite, other)) return true;
  }
  return false;
}

export function isTouchingMousePointer(sprite, mouseX, mouseY) {
  return (
    mouseX >= sprite.x
    && mouseX <= sprite.x + sprite.w
    && mouseY >= sprite.y
    && mouseY <= sprite.y + sprite.h
  );
}

export function isTouchingTarget(sprite, target, ctx) {
  const {
    allSprites = [],
    mouseX = 0,
    mouseY = 0,
    stageW = STAGE_W_DEFAULT,
    stageH = STAGE_H_DEFAULT,
  } = ctx || {};
  const t = String(target || 'edge').trim().toLowerCase();
  if (t === 'edge') return isTouchingEdge(sprite, stageW, stageH);
  if (t === 'mouse-pointer' || t === 'mouse' || t === 'mouse pointer') {
    return isTouchingMousePointer(sprite, mouseX, mouseY);
  }
  return isTouchingSprite(sprite, allSprites, t);
}

export function parseHexColor(color) {
  const s = String(color || '').trim();
  if (!s) return null;
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b, a: 255 };
    }
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) : 255,
      };
    }
  }
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: 255 };
  return null;
}

export function colorsMatch(c1, c2, tolerance = 12) {
  if (!c1 || !c2) return false;
  return (
    Math.abs(c1.r - c2.r) <= tolerance
    && Math.abs(c1.g - c2.g) <= tolerance
    && Math.abs(c1.b - c2.b) <= tolerance
  );
}

function pixelAt(data, width, x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= width) return null;
  const idx = (iy * width + ix) * 4;
  if (idx < 0 || idx + 2 >= data.length) return null;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
}

/**
 * Sample stage pixels in sprite bbox; true if any opaque-enough pixel matches targetColor.
 */
export function isTouchingColor(sprite, targetColor, imageData, stageW, stageH) {
  const want = parseHexColor(targetColor);
  if (!want || !imageData?.data || !sprite) return false;
  const { data, width } = imageData;
  const x0 = Math.max(0, Math.floor(sprite.x));
  const y0 = Math.max(0, Math.floor(sprite.y));
  const x1 = Math.min(stageW - 1, Math.ceil(sprite.x + sprite.w));
  const y1 = Math.min(stageH - 1, Math.ceil(sprite.y + sprite.h));
  const step = Math.max(2, Math.floor(Math.min(sprite.w, sprite.h) / 8) || 2);
  for (let y = y0; y <= y1; y += step) {
    for (let x = x0; x <= x1; x += step) {
      const p = pixelAt(data, width, x, y);
      if (!p || p.a < 32) continue;
      if (colorsMatch(p, want)) return true;
    }
  }
  return false;
}

/** True if any pixel of color1 on stage touches a pixel of color2 (4-neighbor). */
export function isColorTouchingColor(color1, color2, imageData, stageW, stageH) {
  const c1 = parseHexColor(color1);
  const c2 = parseHexColor(color2);
  if (!c1 || !c2 || !imageData?.data) return false;
  const { data, width } = imageData;
  const h = imageData.height || stageH;
  const step = 4;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < stageW; x += step) {
      const p = pixelAt(data, width, x, y);
      if (!p || p.a < 32) continue;
      if (!colorsMatch(p, c1)) continue;
      const neighbors = [
        [x - step, y],
        [x + step, y],
        [x, y - step],
        [x, y + step],
      ];
      for (const [nx, ny] of neighbors) {
        const n = pixelAt(data, width, nx, ny);
        if (n && n.a >= 32 && colorsMatch(n, c2)) return true;
      }
    }
  }
  return false;
}

export function distanceBetween(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function distanceToTarget(sprite, target, ctx) {
  const {
    allSprites = [],
    mouseX = 0,
    mouseY = 0,
    stageW = STAGE_W_DEFAULT,
    stageH = STAGE_H_DEFAULT,
  } = ctx || {};
  const { x: cx, y: cy } = spriteCenter(sprite);
  const t = String(target || 'mouse-pointer').trim().toLowerCase();
  if (t === 'mouse-pointer' || t === 'mouse' || t === 'mouse pointer') {
    return distanceBetween(cx, cy, mouseX, mouseY);
  }
  const other = findSpriteByName(allSprites, t);
  if (other) {
    const oc = spriteCenter(other);
    return distanceBetween(cx, cy, oc.x, oc.y);
  }
  return distanceBetween(cx, cy, stageW / 2, stageH / 2);
}

export function getTimerSeconds(timerStartMs, now = Date.now()) {
  return (now - (timerStartMs || now)) / 1000;
}

export function getCurrentDateTime(unit) {
  const now = new Date();
  const u = String(unit || 'year').toLowerCase().replace(/\s+/g, '');
  switch (u) {
    case 'year': return now.getFullYear();
    case 'month': return now.getMonth() + 1;
    case 'date': return now.getDate();
    case 'dayofweek': return now.getDay() + 1;
    case 'hour': return now.getHours();
    case 'minute': return now.getMinutes();
    case 'second': return now.getSeconds();
    default: return now.getFullYear();
  }
}

export function getDaysSince2000(now = Date.now()) {
  return (now - Date.UTC(2000, 0, 1)) / 86400000;
}

export function spriteScratchX(sprite, stageW = STAGE_W_DEFAULT) {
  return (sprite?.x ?? 0) + (sprite?.w ?? 0) / 2 - stageW / 2;
}

export function spriteScratchY(sprite, stageH = STAGE_H_DEFAULT) {
  return stageH / 2 - ((sprite?.y ?? 0) + (sprite?.h ?? 0) / 2);
}

export function evaluateSenseOf(property, objectName, ctx = {}) {
  const prop = String(property || 'backdrop').toLowerCase();
  const name = String(objectName || 'Stage').trim();
  const { allSprites = [], backdropIndex = 0, stageW = STAGE_W_DEFAULT, stageH = STAGE_H_DEFAULT } = ctx;

  if (name.toLowerCase() === 'stage') {
    if (prop.includes('backdrop')) return backdropIndex + 1;
    return 0;
  }

  const target = findSpriteByName(allSprites, name);
  if (!target) return 0;
  if (prop.includes('costume')) return (target.currentCostumeIndex ?? 0) + 1;
  if (prop === 'x' || prop.includes('x position')) return spriteScratchX(target, stageW);
  if (prop === 'y' || prop.includes('y position')) return spriteScratchY(target, stageH);
  if (prop.includes('direction')) return target.rotation ?? target.direction ?? 90;
  if (prop.includes('size')) return target.size ?? 100;
  return 0;
}

/** Map Blockly OBJECT field to runtime touching/distance target id. */
export function objectFieldToTarget(objectField) {
  const raw = String(objectField || 'mouse').trim();
  const lower = raw.toLowerCase();
  if (lower === 'mouse' || lower === 'mouse-pointer') return 'mouse-pointer';
  if (lower === 'edge') return 'edge';
  return raw;
}

/** Web Audio microphone loudness 0–100. */
export class LoudnessMonitor {
  constructor() {
    this.level = 0;
    this._stream = null;
    this._ctx = null;
    this._analyser = null;
    this._data = null;
    this._raf = null;
    this._started = false;
  }

  async start() {
    if (this._started) return;
    this._started = true;
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this._ctx = new Ctx();
      const src = this._ctx.createMediaStreamSource(this._stream);
      this._analyser = this._ctx.createAnalyser();
      this._analyser.fftSize = 256;
      this._data = new Uint8Array(this._analyser.frequencyBinCount);
      src.connect(this._analyser);
      const tick = () => {
        if (!this._analyser || !this._data) return;
        this._analyser.getByteFrequencyData(this._data);
        let sum = 0;
        for (let i = 0; i < this._data.length; i++) sum += this._data[i];
        const avg = sum / this._data.length;
        this.level = Math.min(100, Math.round((avg / 255) * 100));
        this._raf = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      this.level = 0;
    }
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    if (this._stream) {
      this._stream.getTracks().forEach((t) => t.stop());
      this._stream = null;
    }
    if (this._ctx) {
      this._ctx.close().catch(() => {});
      this._ctx = null;
    }
    this._analyser = null;
    this._data = null;
    this._started = false;
    this.level = 0;
  }

  getLevel() {
    return this.level;
  }
}
