import { BLOCK_STACK_GAP } from './blockStack';

/** Vertical tolerance (px): closer than this to a stack slot snaps on release. */
export const SNAP_VERTICAL_PX = 16;
/** Horizontal tolerance (px): left edges align with anchor block when within this. */
export const SNAP_HORIZONTAL_PX = 24;

function sameId(a, b) {
  return String(a) === String(b);
}

/**
 * PictoBlox/Scratch-style magnetic stack snap on drag release.
 * Aligns left edges with a nearby block and snaps y to ±BLOCK_STACK_GAP (same as palette stacking).
 *
 * @param {Object} opts
 * @param {string|number} opts.draggedId
 * @param {number} opts.x
 * @param {number} opts.y
 * @param {Array<{ x: number, y: number }>} opts.blocks
 * @param {(b: object) => string|number} [opts.getId]
 * @param {number} [opts.minX]
 * @param {number} [opts.minY]
 * @returns {{ x: number, y: number, snapped: boolean }}
 */
export function snapCanvasStack({
  draggedId,
  x,
  y,
  blocks,
  getId = (b) => b.id,
  minX = 0,
  minY = 0,
}) {
  const others = blocks.filter((b) => !sameId(getId(b), draggedId));
  if (!others.length) {
    return { x: Math.max(minX, x), y: Math.max(minY, y), snapped: false };
  }

  let bestX = x;
  let bestY = y;
  let bestScore = Infinity;
  let snapped = false;

  const consider = (nx, ny) => {
    if (nx < minX || ny < minY) return;
    const dy = Math.abs(y - ny);
    const dx = Math.abs(x - nx);
    if (dy > SNAP_VERTICAL_PX || dx > SNAP_HORIZONTAL_PX) return;
    const score = dy + dx * 0.2;
    if (score < bestScore) {
      bestScore = score;
      bestX = nx;
      bestY = ny;
      snapped = true;
    }
  };

  for (const other of others) {
    const ox = other.x;
    const oy = other.y;
    consider(ox, oy + BLOCK_STACK_GAP);
    consider(ox, oy - BLOCK_STACK_GAP);
  }

  return {
    x: Math.max(minX, bestX),
    y: Math.max(minY, bestY),
    snapped,
  };
}
