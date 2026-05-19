/**
 * Scratch-style Looks blocks: costumes, backdrops, bubbles, effects, size, layers.
 */

export const DEFAULT_EFFECTS = {
  color: 0,
  fisheye: 0,
  whirl: 0,
  pixelate: 0,
  mosaic: 0,
  brightness: 0,
  ghost: 0,
};

export function createDefaultEffects() {
  return { ...DEFAULT_EFFECTS };
}

/** Alternate colors for default multi-costume slots (costume2+). */
const DEFAULT_COSTUME_COLORS = [
  '#f59e0b',
  '#ef4444',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#06b6d4',
  '#eab308',
];

const DEFAULT_COSTUME_COUNT = 8;

/**
 * Give every sprite multiple costumes (color variants) so switch/next costume works.
 * Skips if the sprite already has 2+ costumes defined.
 */
export function ensureDefaultCostumes(sprite) {
  if (Array.isArray(sprite.costumes) && sprite.costumes.length > 1) {
    return sprite.costumes;
  }
  const baseColor = sprite.color ?? null;
  const costumes = [];
  for (let i = 0; i < DEFAULT_COSTUME_COUNT; i++) {
    const useCustom = i === 0 && sprite.customImage;
    costumes.push({
      name: `costume${i + 1}`,
      svgKey: sprite.svgKey,
      color: i === 0 ? baseColor : DEFAULT_COSTUME_COLORS[i % DEFAULT_COSTUME_COLORS.length],
      customImage: useCustom ? sprite.customImage : undefined,
    });
  }
  sprite.costumes = costumes;
  return costumes;
}

/** Build costume list; always at least one entry from current appearance. */
export function getSpriteCostumes(sprite) {
  if (Array.isArray(sprite.costumes) && sprite.costumes.length > 0) {
    return sprite.costumes;
  }
  return [{
    name: sprite.costumeName || 'costume1',
    svgKey: sprite.svgKey,
    color: sprite.color,
    customImage: sprite.customImage,
  }];
}

export function initSpriteLooks(sprite) {
  ensureDefaultCostumes(sprite);
  const costumes = getSpriteCostumes(sprite);
  sprite.baseW = sprite.baseW ?? sprite.w;
  sprite.baseH = sprite.baseH ?? sprite.h;
  sprite.sizePercent = sprite.sizePercent ?? 100;
  sprite.currentCostumeIndex = sprite.currentCostumeIndex ?? 0;
  sprite.effects = sprite.effects ? { ...DEFAULT_EFFECTS, ...sprite.effects } : createDefaultEffects();
  sprite.layer = sprite.layer ?? 1;
  sprite.costumes = costumes;
  applySizePercent(sprite);
  applyCostumeToSprite(sprite, sprite.currentCostumeIndex, null);
}

export function applySizePercent(sprite) {
  const pct = Math.max(0, sprite.sizePercent ?? 100) / 100;
  const bw = sprite.baseW ?? sprite.w;
  const bh = sprite.baseH ?? sprite.h;
  sprite.w = Math.max(4, Math.round(bw * pct));
  sprite.h = Math.max(4, Math.round(bh * pct));
}

export function resolveCostumeIndex(costumes, nameOrNumber) {
  if (!costumes.length) return -1;
  const raw = String(nameOrNumber ?? '').trim();
  if (raw === '') return -1;
  if (/^\d+$/.test(raw)) {
    const idx = parseInt(raw, 10) - 1;
    return idx >= 0 && idx < costumes.length ? idx : -1;
  }
  const lower = raw.toLowerCase();
  let idx = costumes.findIndex((c) => String(c.name || '').toLowerCase() === lower);
  if (idx < 0) {
    idx = costumes.findIndex((c) => String(c.name || '').toLowerCase().replace(/\s+/g, '') === lower.replace(/\s+/g, ''));
  }
  return idx;
}

export function applyCostumeToSprite(sprite, index, invalidateCache) {
  const costumes = getSpriteCostumes(sprite);
  if (index < 0 || index >= costumes.length) return false;
  sprite.currentCostumeIndex = index;
  const c = costumes[index];
  if (c.svgKey != null) sprite.svgKey = c.svgKey;
  if (c.color !== undefined) sprite.color = c.color;
  if (c.customImage) {
    sprite.customImage = c.customImage;
  } else {
    sprite.customImage = undefined;
  }
  if (c.w != null && c.h != null) {
    sprite.baseW = c.w;
    sprite.baseH = c.h;
    applySizePercent(sprite);
  }
  if (typeof invalidateCache === 'function') invalidateCache(sprite);
  return true;
}

export function switchCostume(sprite, nameOrNumber, invalidateCache) {
  const costumes = getSpriteCostumes(sprite);
  const idx = resolveCostumeIndex(costumes, nameOrNumber);
  if (idx < 0) return false;
  return applyCostumeToSprite(sprite, idx, invalidateCache);
}

export function nextCostume(sprite, invalidateCache) {
  const costumes = getSpriteCostumes(sprite);
  if (!costumes.length) return false;
  const next = ((sprite.currentCostumeIndex ?? 0) + 1) % costumes.length;
  return applyCostumeToSprite(sprite, next, invalidateCache);
}

export function costumeNumberReporter(sprite, numberName = 'number') {
  const costumes = getSpriteCostumes(sprite);
  const idx = sprite.currentCostumeIndex ?? 0;
  if (String(numberName || 'number').toLowerCase() === 'name') {
    return costumes[idx]?.name ?? 'costume1';
  }
  return idx + 1;
}

export function backdropNumberReporter(currentIndex, backdropNames = [], numberName = 'number') {
  const idx = Math.max(0, currentIndex ?? 0);
  if (String(numberName || 'number').toLowerCase() === 'name') {
    return backdropNames[idx] ?? backdropNames[0] ?? 'Sky';
  }
  return idx + 1;
}

export function getBackdropList(backgroundNames = []) {
  return backgroundNames;
}

/** Apply a stage backdrop switch (updates refs + optional React state). */
export function applyStageBackdrop(backdrops, nameOrNumber, refs) {
  if (!backdrops?.length || !refs) return 0;
  const cur = refs.playBackdropRef?.current ?? 0;
  const next = resolveBackdropIndex(backdrops, cur, nameOrNumber);
  const name = backdrops[next] ?? backdrops[0];
  if (refs.playBackdropRef) refs.playBackdropRef.current = next;
  if (refs.playBackdropNameRef) refs.playBackdropNameRef.current = name;
  if (typeof refs.setBackground === 'function' && name) refs.setBackground(name);
  return next;
}

export function resolveBackdropIndex(backdrops, currentIndex, nameOrNumber) {
  if (!backdrops.length) return currentIndex;
  const raw = String(nameOrNumber ?? '').trim();
  const asNum = parseInt(raw, 10);
  if (Number.isFinite(asNum) && /^\d+$/.test(raw)) {
    const idx = asNum - 1;
    return idx >= 0 && idx < backdrops.length ? idx : currentIndex;
  }
  const lower = raw.toLowerCase();
  const byName = backdrops.findIndex((n) => String(n).toLowerCase() === lower);
  if (byName >= 0) return byName;
  const stripped = lower.replace(/^backdrop\s*/i, '');
  const byStripped = backdrops.findIndex((n) => String(n).toLowerCase() === stripped);
  return byStripped >= 0 ? byStripped : currentIndex;
}

export function nextBackdropIndex(backdrops, currentIndex) {
  if (!backdrops.length) return currentIndex;
  return (currentIndex + 1) % backdrops.length;
}

export function changeSizeBy(sprite, delta) {
  sprite.sizePercent = Math.max(0, (sprite.sizePercent ?? 100) + delta);
  applySizePercent(sprite);
}

export function setSizePercent(sprite, percent) {
  sprite.sizePercent = Math.max(0, percent);
  applySizePercent(sprite);
}

export function sizeReporter(sprite) {
  return sprite.sizePercent ?? 100;
}

export function changeEffect(sprite, effect, delta) {
  sprite.effects = sprite.effects || createDefaultEffects();
  const key = effect || 'color';
  sprite.effects[key] = (sprite.effects[key] || 0) + delta;
}

export function setEffect(sprite, effect, value) {
  sprite.effects = sprite.effects || createDefaultEffects();
  const key = effect || 'color';
  sprite.effects[key] = value;
}

export function clearGraphicEffects(sprite) {
  sprite.effects = createDefaultEffects();
  sprite._sayText = null;
  sprite._sayUntil = null;
  sprite._thinkText = null;
  sprite._thinkUntil = null;
}

export function say(sprite, text, secs = null) {
  const t = String(text ?? '').replace(/"/g, '');
  sprite._thinkText = null;
  sprite._thinkUntil = null;
  if (t === '') {
    sprite._sayText = null;
    sprite._sayUntil = null;
    return;
  }
  sprite._sayText = t;
  sprite._sayUntil = secs == null || secs <= 0 ? null : Date.now() + secs * 1000;
}

export function think(sprite, text, secs = null) {
  const t = String(text ?? '').replace(/"/g, '');
  sprite._sayText = null;
  sprite._sayUntil = null;
  if (t === '') {
    sprite._thinkText = null;
    sprite._thinkUntil = null;
    return;
  }
  sprite._thinkText = t;
  sprite._thinkUntil = secs == null || secs <= 0 ? null : Date.now() + secs * 1000;
}

export function bubbleActive(until) {
  return until == null || until > Date.now();
}

export function goToFrontLayer(spriteList, sprite) {
  if (!spriteList?.length) return;
  const maxLayer = Math.max(...spriteList.map((s) => s.layer ?? 0), 0);
  sprite.layer = maxLayer + 1;
  const idx = spriteList.findIndex((s) => s.id === sprite.id);
  if (idx > -1) {
    const [s] = spriteList.splice(idx, 1);
    spriteList.push(s);
  }
}

export function goToBackLayer(spriteList, sprite) {
  if (!spriteList?.length) return;
  const minLayer = Math.min(...spriteList.map((s) => s.layer ?? 0), 0);
  sprite.layer = minLayer - 1;
  const idx = spriteList.findIndex((s) => s.id === sprite.id);
  if (idx > -1) {
    const [s] = spriteList.splice(idx, 1);
    spriteList.unshift(s);
  }
}

export function goLayers(sprite, amount, forward = true) {
  const delta = forward ? amount : -amount;
  sprite.layer = (sprite.layer ?? 0) + delta;
}

/** Canvas filter string for color / brightness (ghost uses globalAlpha). */
export function buildEffectFilter(effects) {
  if (!effects) return 'none';
  const parts = [];
  if (effects.color) parts.push(`hue-rotate(${effects.color * 1.8}deg)`);
  if (effects.brightness) parts.push(`brightness(${100 + effects.brightness}%)`);
  return parts.length ? parts.join(' ') : 'none';
}

export function drawSpeechBubble(ctx, cx, topY, text) {
  const padding = 8;
  ctx.font = 'bold 12px Inter, sans-serif';
  const tw = ctx.measureText(text).width + padding * 2;
  const bh = 24;
  const bx = cx - tw / 2;
  const by = topY - bh - 8;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(bx, by, tw, bh, 8);
  } else {
    ctx.rect(bx, by, tw, bh);
  }
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 6, by + bh);
  ctx.lineTo(cx, by + bh + 10);
  ctx.lineTo(cx + 6, by + bh);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, by + bh / 2);
}

/** Cloud-style thought bubble with tail toward sprite. */
export function drawThoughtBubble(ctx, cx, topY, text) {
  const padding = 10;
  ctx.font = 'bold 12px Inter, sans-serif';
  const maxW = 180;
  const lines = wrapText(ctx, text, maxW - padding * 2);
  const lineH = 16;
  const tw = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width), 40) + padding * 2);
  const bh = lines.length * lineH + padding;
  const bx = cx - tw / 2;
  const by = topY - bh - 16;

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;

  const r = 10;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + tw - r, by);
  ctx.quadraticCurveTo(bx + tw, by, bx + tw, by + r);
  ctx.lineTo(bx + tw, by + bh - r);
  ctx.quadraticCurveTo(bx + tw, by + bh, bx + tw - r, by + bh);
  ctx.lineTo(bx + r, by + bh);
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
  ctx.lineTo(bx, by + r);
  ctx.quadraticCurveTo(bx, by, bx + r, by);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Small cloud puffs + tail
  [[cx - 14, by + bh + 4, 7], [cx, by + bh + 10, 9], [cx + 14, by + bh + 4, 7]].forEach(([px, py, pr]) => {
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, by + padding / 2 + lineH / 2 + i * lineH);
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

/**
 * Execute looks stack blocks immediately (live Blockly edits while playing).
 * Runs blocks in script order; last matching block of each kind wins visually.
 */
export function runLooksBlocksOnSprite(sprite, blocks, ctx = {}) {
  if (!sprite || !Array.isArray(blocks)) return false;
  const {
    invalidateCache,
    applyBackdrop,
    getBackdropNames,
    playBackdropRef,
  } = ctx;
  let changed = false;
  const num = (v, d = 0) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : d;
  };

  for (const b of blocks) {
    const p = b.params || {};
    switch (b.type) {
      case 'looks-costume':
        if (switchCostume(sprite, p.costume ?? p.COSTUME ?? 1, invalidateCache)) changed = true;
        break;
      case 'looks-next-costume':
        if (nextCostume(sprite, invalidateCache)) changed = true;
        break;
      case 'looks-backdrop':
        if (typeof applyBackdrop === 'function') {
          applyBackdrop(p.backdrop ?? p.BACKDROP ?? 'Sky');
          changed = true;
        }
        break;
      case 'looks-next-backdrop': {
        if (typeof applyBackdrop === 'function' && typeof getBackdropNames === 'function') {
          const names = getBackdropNames();
          const cur = playBackdropRef?.current ?? 0;
          applyBackdrop(names[nextBackdropIndex(names, cur)] || names[0]);
          changed = true;
        }
        break;
      }
      case 'sprite-setsize':
      case 'looks-change-size':
        if (b.type === 'sprite-setsize') setSizePercent(sprite, num(p.size, 100));
        else changeSizeBy(sprite, num(p.amount, 10));
        changed = true;
        break;
      case 'sprite-show':
      case 'looks-show':
        sprite.visible = true;
        changed = true;
        break;
      case 'sprite-hide':
      case 'looks-hide':
        sprite.visible = false;
        changed = true;
        break;
      case 'looks-clear-effects':
        clearGraphicEffects(sprite);
        changed = true;
        break;
      default:
        break;
    }
  }
  return changed;
}

export function isLooksBlockType(type) {
  return typeof type === 'string' && (
    type.startsWith('looks-')
    || type === 'sprite-say'
    || type === 'sprite-think'
    || type === 'sprite-show'
    || type === 'sprite-hide'
    || type === 'sprite-setsize'
    || type === 'sprite-size-reporter'
  );
}
