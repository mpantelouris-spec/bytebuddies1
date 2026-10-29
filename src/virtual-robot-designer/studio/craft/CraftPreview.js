/**
 * Block Crafter — card previews. Draws each arena's real generated world as a
 * small isometric picture (no WebGL), so every mode card shows its own map.
 */
import { generateWorld, R, MAX_Y } from './CraftWorld.js';

const COLORS = {
  grass: '#62ad3d', dirt: '#866043', stone: '#808080', cobblestone: '#8f8f8f', bedrock: '#3a3a3a',
  sand: '#dbd3a0', sandstone: '#d8cc92', snow: '#f4fbff', log: '#6b5130', leaves: '#3f7f2f',
  planks: '#b4905a', crafting_table: '#9a6b3a', furnace: '#6e6e6e', coal_ore: '#3d3d3d',
  iron_ore: '#c49a7c', gold_ore: '#e6c84a', diamond_ore: '#5decf5', netherrack: '#7d3131',
  obsidian: '#241a33', gold_block: '#fcee4b', glowstone: '#ffd97a', lava: '#ff7a1a', water: '#3b7be0',
};
const SKY = { day: '#8fc5ff', desert: '#f3d9a4', snow: '#cfe3f5', nether: '#3a0e0e', cave: '#14161d', sky: '#7fbfff' };

const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

const cache = new Map();

/** PNG data URL of the arena for this mode (1–10). Cached; null outside a browser. */
export function craftPreviewUrl(mode) {
  const m = Math.max(1, Math.min(50, Number(mode) || 1));
  if (cache.has(m)) return cache.get(m);
  if (typeof document === 'undefined') return null;
  const { world, spawn, sky } = generateWorld(m);
  // Underground hall: lift the roof off so the cave floor shows
  const cut = sky === 'cave' ? 4 : MAX_Y;
  const top = (x, z) => { for (let y = cut; y >= 0; y--) if (world.get(x, y, z)) return y; return -1; };
  const ground = (x, z) => { for (let y = cut; y >= 0; y--) { const t = world.get(x, y, z); if (t && t !== 'leaves' && t !== 'log') return y; } return -1; };

  const TW = 10; const TH = 5; const BH = 6; // tile width, tile height, block height (px)
  const ox = R * TW + TW; const oy = (cut + 2) * BH + R * TH + TH; // room above for the back row and tall blocks
  const W = 2 * ox; const H = oy + R * TH + 2 * TH;
  const scale = 2;
  const cv = document.createElement('canvas');
  cv.width = W * scale; cv.height = H * scale;
  const g = cv.getContext('2d');
  g.scale(scale, scale);
  g.fillStyle = SKY[sky] || SKY.day;
  g.fillRect(0, 0, W, H);

  const box = [Infinity, Infinity, -Infinity, -Infinity];
  const P = (x, y, z) => [ox + (x - z) * TW / 2, oy + (x + z) * TH / 2 - y * BH];
  const poly = (pts, fill) => {
    pts.forEach(([a, b]) => { box[0] = Math.min(box[0], a); box[1] = Math.min(box[1], b); box[2] = Math.max(box[2], a); box[3] = Math.max(box[3], b); });
    g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fillStyle = fill; g.fill(); };
  const cube = (x, y, z, col, drawTop) => {
    // corners of the cell [x-.5,x+.5]×[y,y+1]×[z-.5,z+.5]
    const a = P(x - 0.5, y + 1, z - 0.5); const b = P(x + 0.5, y + 1, z - 0.5);
    const c = P(x + 0.5, y + 1, z + 0.5); const d = P(x - 0.5, y + 1, z + 0.5);
    const c0 = P(x + 0.5, y, z + 0.5); const d0 = P(x - 0.5, y, z + 0.5); const b0 = P(x + 0.5, y, z - 0.5);
    poly([d, c, c0, d0], shade(col, 0.72)); // +z face
    poly([c, b, b0, c0], shade(col, 0.86)); // +x face
    if (drawTop) poly([a, b, c, d], col);
  };

  // Back to front: columns by x+z, then bottom to top
  const cols = [];
  for (let x = -R; x < R; x++) for (let z = -R; z < R; z++) cols.push([x, z]);
  cols.sort((p, q) => (p[0] + p[1]) - (q[0] + q[1]) || p[0] - q[0]);
  for (const [x, z] of cols) {
    const t = top(x, z);
    if (t < 0) continue;
    // Sides show down to the lower front neighbour; trees stand on their ground block
    const low = Math.max(0, Math.min(ground(x, z), ground(x + 1, z) + 1, ground(x, z + 1) + 1));
    for (let y = low; y <= t; y++) {
      const type = world.get(x, y, z);
      if (!type) continue;
      cube(x, y, z, COLORS[type] || '#9a9a9a', y === t || !world.get(x, y + 1, z));
    }
  }

  // Spawn marker: where the Block Crafter starts
  const sy = top(spawn.x, spawn.z) + 1;
  const [mx, my] = P(spawn.x, sy, spawn.z);
  g.fillStyle = '#ffcf4e'; g.strokeStyle = '#173e52'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(mx, my); g.lineTo(mx - 5, my - 11); g.lineTo(mx + 5, my - 11); g.closePath(); g.fill(); g.stroke();

  // Crop to the world with a margin, widened to a card-friendly 2:1
  const pad = 8;
  let [x0, y0, x1, y1] = [box[0] - pad, box[1] - pad - 12, box[2] + pad, box[3] + pad];
  const want = 2;
  if ((x1 - x0) / (y1 - y0) < want) { const extra = (y1 - y0) * want - (x1 - x0); x0 -= extra / 2; x1 += extra / 2; }
  else { const extra = (x1 - x0) / want - (y1 - y0); y0 -= extra / 2; y1 += extra / 2; }
  const out = document.createElement('canvas');
  out.width = Math.round((x1 - x0) * scale); out.height = Math.round((y1 - y0) * scale);
  const o = out.getContext('2d');
  o.fillStyle = SKY[sky] || SKY.day;
  o.fillRect(0, 0, out.width, out.height);
  o.drawImage(cv, -x0 * scale, -y0 * scale);
  const url = out.toDataURL('image/png');
  cache.set(m, url);
  return url;
}
