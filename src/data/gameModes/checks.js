/**
 * Game Modes — helpers for checking challenges: stage coordinates, turtle paths
 * for Pen Bot's dotted target shapes, and drawing-vs-target matching.
 */
export const STAGE_W = 480;
export const STAGE_H = 360;

/** Scratch-style (centre origin, y up) → stage canvas pixels (top-left origin, y down). */
export const toCanvas = (x, y) => ({ x: STAGE_W / 2 + x, y: STAGE_H / 2 - y });

/**
 * Run turtle commands and return the polylines they draw, in canvas pixels.
 * Commands: ['fd', n] · ['rt', deg] · ['lt', deg] · ['repeat', n, [...cmds]] · ['up'] · ['down']
 * Direction 90 = right; turning right is clockwise on screen (like the Game Builder).
 */
export function turtlePath(start, commands, dir = 90) {
  const p = toCanvas(start[0], start[1]);
  const t = { x: p.x, y: p.y, dir, down: true };
  const lines = [[{ x: t.x, y: t.y }]];
  const run = (cmds) => cmds.forEach((c) => {
    const [op, a, b] = c;
    if (op === 'repeat') { for (let i = 0; i < a; i++) run(b); return; }
    if (op === 'rt') t.dir += a;
    else if (op === 'lt') t.dir -= a;
    else if (op === 'up') t.down = false;
    else if (op === 'down') { t.down = true; lines.push([{ x: t.x, y: t.y }]); }
    else if (op === 'fd') {
      const r = (t.dir * Math.PI) / 180;
      t.x += Math.sin(r) * a;
      t.y -= Math.cos(r) * a;
      if (t.down) lines[lines.length - 1].push({ x: t.x, y: t.y });
      else lines.push([{ x: t.x, y: t.y }]);
    }
  });
  run(commands);
  return lines.filter((l) => l.length > 1);
}

/** Points every `step` px along polylines. */
function sample(lines, step = 4) {
  const out = [];
  lines.forEach((line) => {
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1]; const b = line[i];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const n = Math.max(1, Math.ceil(len / step));
      for (let k = 0; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
    }
  });
  return out;
}

/** Turn a sprite's pen trail into polylines (pen-up gaps split lines; stamps skipped). */
export function trailLines(trail = []) {
  const lines = [];
  let cur = [];
  trail.forEach((pt) => {
    if (pt.gap) { if (cur.length > 1) lines.push(cur); cur = []; return; }
    if (pt.stamp) return;
    cur.push({ x: pt.x, y: pt.y });
  });
  if (cur.length > 1) lines.push(cur);
  return lines;
}

function segDist(p, a, b) {
  const dx = b.x - a.x; const dy = b.y - a.y;
  const L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
function nearLines(p, lines, tol) {
  for (const line of lines) {
    for (let i = 1; i < line.length; i++) if (segDist(p, line[i - 1], line[i]) <= tol) return true;
  }
  return false;
}

/**
 * How well a drawing matches a target shape. The drawing may start anywhere and may
 * turn the other way (a mirror image), so we line up its first point with the target's.
 * Returns { match: 0..1, covered, extra }.
 */
export function matchDrawing(drawn, target, { tol = 7 } = {}) {
  if (!drawn.length || !target.length) return { match: 0, covered: 0, extra: 1 };
  const t0 = target[0][0];
  const d0 = drawn[0][0];
  const shift = (lines, dx, dy, flipY) => lines.map((l) => l.map((p) => ({ x: p.x + dx, y: flipY ? t0.y - (p.y - t0.y) : p.y + dy })));
  const variants = [shift(target, 0, 0, false), shift(target, 0, 0, true)];
  const drawnAligned = shift(drawn, t0.x - d0.x, t0.y - d0.y, false);
  const drawnPts = sample(drawnAligned, 6);
  let best = { match: 0, covered: 0, extra: 1 };
  variants.forEach((tgt) => {
    const tPts = sample(tgt, 5);
    const covered = tPts.filter((p) => nearLines(p, drawnAligned, tol)).length / Math.max(1, tPts.length);
    const extra = drawnPts.filter((p) => !nearLines(p, tgt, tol + 3)).length / Math.max(1, drawnPts.length);
    const match = covered * (1 - extra);
    if (match > best.match) best = { match, covered, extra };
  });
  return best;
}

/** Count real blocks in a Blockly workspace XML (not shadows). */
export function countBlocks(xml = '') {
  return (String(xml).match(/<block\b/g) || []).length;
}
export function usesBlock(xml = '', type) {
  return String(xml).includes(`type="${type}"`);
}
export const usesLoop = (xml) => usesBlock(xml, 'control_repeat') || usesBlock(xml, 'control_forever') || usesBlock(xml, 'control_repeatuntil');

/** Do two sprites' boxes overlap? (canvas pixels, top-left x/y like the Game Builder) */
export function overlap(a, b, pad = 0) {
  if (!a || !b) return false;
  return a.x + pad < b.x + b.w && a.x + a.w - pad > b.x && a.y + pad < b.y + b.h && a.y + a.h - pad > b.y;
}
