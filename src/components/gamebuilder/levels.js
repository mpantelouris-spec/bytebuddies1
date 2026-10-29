/**
 * Game Builder levels: an ordered list of scenes. Each level has its own backdrop and its own
 * layout — where every sprite starts and whether it is shown — like Scratch backdrops plus a
 * level editor (MakeCode tilemaps / GDevelop scenes).
 *
 * level = { id, name, backdrop, layout: { [spriteId]: { x, y, visible } } }
 */

export const MAX_LEVELS = 12;
export const LEVELS_KEY = 'cv_gamebuilder_levels';

const newId = () => `lvl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function defaultLevels(backdrop) {
  return [{ id: newId(), name: 'Level 1', backdrop, layout: {} }];
}

/** Make saved data safe to use (old projects have no levels). */
export function normalizeLevels(levels, backdrop) {
  if (!Array.isArray(levels) || !levels.length) return defaultLevels(backdrop);
  return levels.slice(0, MAX_LEVELS).map((l, i) => ({
    id: l?.id || newId(),
    name: String(l?.name || `Level ${i + 1}`),
    backdrop: l?.backdrop || backdrop,
    layout: l?.layout && typeof l.layout === 'object' ? l.layout : {},
  }));
}

/** Where every sprite is right now. */
export function captureLayout(sprites) {
  const layout = {};
  (sprites || []).forEach((s) => {
    if (s.isClone) return;
    layout[s.id] = { x: Math.round(s.x), y: Math.round(s.y), visible: s.visible !== false };
  });
  return layout;
}

/** Sprites moved/shown/hidden to a level's layout (sprites the level hasn't seen stay as they are). */
export function applyLayout(sprites, layout) {
  return (sprites || []).map((s) => {
    const at = layout?.[s.id];
    return at ? { ...s, x: at.x, y: at.y, visible: at.visible !== false } : s;
  });
}

/** Same, but changes play sprites in place (the running game keeps its objects). */
export function applyLayoutInPlace(sprites, layout) {
  (sprites || []).forEach((s) => {
    const at = layout?.[s.id];
    if (!at || s.isClone) return;
    s.x = at.x; s.y = at.y; s.visible = at.visible !== false;
    s._moveAnim = null;
  });
}

/** A new level that starts with the current layout and the next backdrop in the list. */
export function addLevel(levels, sprites, backdropNames = []) {
  if (levels.length >= MAX_LEVELS) return levels;
  const last = levels[levels.length - 1];
  const i = backdropNames.indexOf(last?.backdrop);
  const backdrop = backdropNames.length ? backdropNames[(i + 1) % backdropNames.length] : last?.backdrop;
  return [...levels, { id: newId(), name: `Level ${levels.length + 1}`, backdrop, layout: captureLayout(sprites) }];
}

/** Remove a level and renumber the default names ("Level 3" → "Level 2"). */
export function removeLevel(levels, index) {
  if (levels.length <= 1) return levels;
  return levels.filter((_, i) => i !== index).map((l, i) => (/^Level \d+$/.test(l.name) ? { ...l, name: `Level ${i + 1}` } : l));
}

export function moveLevel(levels, from, to) {
  if (to < 0 || to >= levels.length || from === to) return levels;
  const next = [...levels];
  const [l] = next.splice(from, 1);
  next.splice(to, 0, l);
  return next.map((x, i) => (/^Level \d+$/.test(x.name) ? { ...x, name: `Level ${i + 1}` } : x));
}

/** Level number (1-based) a "go to level" block asks for, or null when out of range. */
export function resolveLevel(levels, n) {
  const k = Math.round(Number(n));
  return Number.isFinite(k) && k >= 1 && k <= levels.length ? k : null;
}
