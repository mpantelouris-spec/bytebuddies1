/** Shared vertical stack layout for free-form block canvases (Workspace, Game Builder, Robot Lab). */
export const BLOCK_STACK_GAP = 36;

/**
 * Sort blocks by Y and lay them in one column (removes diagonal drift).
 * @param {Array<{ x: number, y: number }>} blocks
 * @param {{ laneX: number, startY?: number, gap?: number }} opts
 */
export function columnizeBlocks(blocks, { laneX, startY = 40, gap = BLOCK_STACK_GAP } = {}) {
  if (!blocks?.length) return blocks;
  const lx = laneX ?? Math.min(...blocks.map((b) => b.x));
  return [...blocks]
    .sort((a, b) => a.y - b.y)
    .map((b, i) => ({ ...b, x: lx, y: startY + i * gap }));
}
