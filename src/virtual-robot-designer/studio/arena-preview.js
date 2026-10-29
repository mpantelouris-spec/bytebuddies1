/**
 * Arena card previews — a snapshot of each game mode's real 3D arena.
 *
 * The Live Lab registers how to draw an arena (it owns the arena builders);
 * cards ask for a preview here. Snapshots are made one at a time in the
 * background on a small offscreen renderer and cached for the session.
 */
const cache = new Map();     // key → data URL (or null when the arena can't be drawn)
const pending = new Map();   // key → Promise
let drawArena = null;
let queue = Promise.resolve();
let active = 0;
let idleRelease = null;
let generation = 0;          // bumped by cancelArenaPreviews(): queued snapshots are dropped

/** Called by the Live Lab: fn(course) → Promise<dataURL|null>, release() frees the GPU context. */
export function setArenaPreviewRenderer(fn, release) {
  drawArena = { fn, release };
}

export const arenaPreviewKey = (course) => [
  course?.id || '', course?.chassisId || '', course?.modeIndex || '', course?.arenaType || '',
  course?.raceThemeId || course?.expandedCarTrack?.raceThemeId || '',
  course?.raceVisualId || course?.expandedCarTrack?.visualId || '',
].join('|');

export function getCachedArenaPreview(course) {
  return cache.get(arenaPreviewKey(course));
}

const idle = () => new Promise((r) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(() => r(), { timeout: 400 }) : setTimeout(r, 30)));

export function requestArenaPreview(course) {
  const key = arenaPreviewKey(course);
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  if (pending.has(key)) return pending.get(key);
  if (!drawArena) return Promise.resolve(null);
  try {
    const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)')?.matches;
    const touch = typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 1;
    // Tablets, phones and low-power machines (school Chromebooks) skip 3D snapshots:
    // building a whole arena per card slows down opening the level you picked.
    if ((coarse && touch) || lowPowerDevice()) {
      cache.set(key, null);
      return Promise.resolve(null);
    }
  } catch { /* ignore */ }
  active += 1;
  clearTimeout(idleRelease);
  const gen = generation;
  const job = queue.then(async () => {
    await idle(); // let the page stay responsive between arenas
    if (gen !== generation) return null; // picker closed or a level opened: skip, don't cache
    let url = null;
    try { url = await drawArena.fn(course); } catch (e) { console.warn('[ArenaPreview] could not draw', course?.id, e); }
    cache.set(key, url);
    return url;
  }).finally(() => {
    pending.delete(key);
    active -= 1;
    // Free the offscreen GL context once the cards are drawn
    if (!active) idleRelease = setTimeout(() => drawArena?.release?.(), 2000);
  });
  pending.set(key, job);
  queue = job.catch(() => null);
  return job;
}

/** Drop every snapshot that hasn't started yet (call when the picker closes or a level opens). */
export function cancelArenaPreviews() {
  generation += 1;
}

let _lowPower;
function lowPowerDevice() {
  if (_lowPower !== undefined) return _lowPower;
  try {
    const mem = navigator.deviceMemory; const cores = navigator.hardwareConcurrency;
    const ua = navigator.userAgent || '';
    _lowPower = /CrOS/i.test(ua) || (mem != null && mem <= 4) || (cores != null && cores <= 4);
  } catch { _lowPower = false; }
  return _lowPower;
}
