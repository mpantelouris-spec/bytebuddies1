/** Locate the Game Builder stage mount (never Blockly sidebar previews). */
export function findGameStageMount() {
  const marked = document.querySelector('[data-bb-game-stage]');
  if (marked) return marked;

  const canvases = document.querySelectorAll('canvas');
  for (let i = 0; i < canvases.length; i++) {
    const c = canvases[i];
    if (c.closest('.sidebar, .sidebar-blockly-preview, .sidebar-blocks-scroll')) continue;
    const parent = c.parentElement;
    if (!parent) continue;
    const dpr = window.devicePixelRatio || 1;
    const lw = c.width / dpr;
    const lh = c.height / dpr;
    if (Math.abs(lw - 480) < 4 && Math.abs(lh - 360) < 4) return parent;
    if (c.width === 480 && c.height === 360) return parent;
  }
  return null;
}
