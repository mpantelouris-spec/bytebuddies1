/**
 * Block Crafter — 16×16 pixel-art textures and materials for every block,
 * plus item icons for the hotbar. Nearest-filtered so they stay crisp and
 * blocky like the real thing.
 */
import * as THREE from 'three';

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

function canvas16(draw, seed = 1) {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const x = c.getContext('2d');
  draw(x, rng(seed));
  return c;
}

const px = (x, cx, cy, col) => { x.fillStyle = col; x.fillRect(cx, cy, 1, 1); };
const speckle = (x, r, cols) => { for (let y = 0; y < 16; y++) for (let i = 0; i < 16; i++) px(x, i, y, cols[Math.floor(r() * cols.length)]); };

const PAL = {
  grass: ['#5fa83a', '#6cb844', '#579a33', '#7cc653', '#4f8f2d'],
  dirt: ['#866043', '#79553a', '#96704f', '#6c4b33', '#8b6647'],
  stone: ['#7f7f7f', '#747474', '#8b8b8b', '#6a6a6a', '#858585'],
  sand: ['#dbd3a0', '#d4ca94', '#e2dbab', '#cfc38b'],
  snow: ['#f4fbff', '#e8f2f8', '#ffffff', '#eef6fb'],
  leaves: ['#3f7f2f', '#356b27', '#4a8f38', '#2d5e22'],
  nether: ['#6f2b2b', '#7d3131', '#5e2222', '#8a3a3a'],
  obsidian: ['#14101d', '#241a33', '#1b1428', '#33244a'],
  bedrock: ['#3a3a3a', '#1f1f1f', '#555555', '#2b2b2b'],
};

const DRAW = {
  grass_top: (x, r) => speckle(x, r, PAL.grass),
  dirt: (x, r) => speckle(x, r, PAL.dirt),
  grass_side: (x, r) => {
    speckle(x, r, PAL.dirt);
    for (let i = 0; i < 16; i++) {
      const d = 2 + Math.floor(r() * 3);
      for (let y = 0; y < d; y++) px(x, i, y, PAL.grass[Math.floor(r() * PAL.grass.length)]);
    }
  },
  snow_top: (x, r) => speckle(x, r, PAL.snow),
  snow_side: (x, r) => {
    speckle(x, r, PAL.dirt);
    for (let i = 0; i < 16; i++) {
      const d = 3 + Math.floor(r() * 3);
      for (let y = 0; y < d; y++) px(x, i, y, PAL.snow[Math.floor(r() * PAL.snow.length)]);
    }
  },
  stone: (x, r) => speckle(x, r, PAL.stone),
  cobblestone: (x, r) => {
    speckle(x, r, ['#8f8f8f', '#7a7a7a', '#9c9c9c']);
    x.fillStyle = '#555555';
    [[0, 4, 16, 1], [0, 10, 16, 1], [5, 0, 1, 4], [11, 4, 1, 6], [3, 10, 1, 6], [13, 10, 1, 6], [8, 11, 1, 5]].forEach((a) => x.fillRect(...a));
  },
  bedrock: (x, r) => speckle(x, r, PAL.bedrock),
  sand: (x, r) => speckle(x, r, PAL.sand),
  sandstone: (x, r) => { speckle(x, r, ['#d8cc92', '#cfc285', '#e0d59f']); x.fillStyle = '#b9ab70'; x.fillRect(0, 5, 16, 1); x.fillRect(0, 11, 16, 1); },
  log_side: (x, r) => {
    for (let i = 0; i < 16; i++) {
      const base = ['#6b5130', '#5a4428', '#7a5d38'][i % 3];
      for (let y = 0; y < 16; y++) px(x, i, y, r() < 0.2 ? '#4a3620' : base);
    }
  },
  log_top: (x) => {
    for (let y = 0; y < 16; y++) for (let i = 0; i < 16; i++) {
      const d = Math.max(Math.abs(i - 7.5), Math.abs(y - 7.5));
      px(x, i, y, d > 6.5 ? '#6b5130' : (Math.floor(d) % 2 ? '#b8955e' : '#a58450'));
    }
  },
  leaves: (x, r) => { speckle(x, r, PAL.leaves); for (let k = 0; k < 14; k++) px(x, Math.floor(r() * 16), Math.floor(r() * 16), '#1f4418'); },
  planks: (x, r) => {
    for (let y = 0; y < 16; y++) for (let i = 0; i < 16; i++) px(x, i, y, r() < 0.15 ? '#a07e4c' : '#b4905a');
    x.fillStyle = '#7d5f35';
    [3, 7, 11, 15].forEach((y) => x.fillRect(0, y, 16, 1));
    [[4, 0], [12, 4], [2, 8], [9, 12]].forEach(([i, y]) => x.fillRect(i, y, 1, 3));
  },
  table_top: (x, r) => { DRAW.planks(x, r); x.fillStyle = '#5a4428'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16); x.fillRect(7, 1, 2, 14); x.fillRect(1, 7, 14, 2); },
  table_side: (x, r) => { DRAW.planks(x, r); x.fillStyle = '#3f2f1b'; x.fillRect(0, 0, 16, 3); x.fillStyle = '#9aa3ad'; x.fillRect(3, 5, 2, 7); x.fillRect(2, 5, 4, 2); x.fillStyle = '#6b5130'; x.fillRect(10, 5, 2, 8); x.fillStyle = '#9aa3ad'; x.fillRect(8, 5, 6, 2); },
  furnace_side: (x, r) => DRAW.cobblestone(x, r),
  furnace_front: (x, r) => { DRAW.cobblestone(x, r); x.fillStyle = '#1b1b1b'; x.fillRect(4, 7, 8, 6); x.fillStyle = '#f08a24'; x.fillRect(5, 10, 6, 2); },
  coal_ore: (x, r) => { speckle(x, r, PAL.stone); ore(x, r, ['#2b2b2b', '#1a1a1a', '#3a3a3a']); },
  iron_ore: (x, r) => { speckle(x, r, PAL.stone); ore(x, r, ['#d8af93', '#c49a7c', '#e6c4ab']); },
  gold_ore: (x, r) => { speckle(x, r, PAL.stone); ore(x, r, ['#fcee4b', '#e8c629', '#fff38a']); },
  diamond_ore: (x, r) => { speckle(x, r, PAL.stone); ore(x, r, ['#5decf5', '#3cc8d8', '#a8f7fb']); },
  netherrack: (x, r) => speckle(x, r, PAL.nether),
  obsidian: (x, r) => speckle(x, r, PAL.obsidian),
  gold_block: (x, r) => { speckle(x, r, ['#fcee4b', '#f5d82d', '#fff38a', '#e8c629']); x.fillStyle = '#c9a41c'; x.fillRect(0, 15, 16, 1); x.fillRect(15, 0, 1, 16); },
  glowstone: (x, r) => speckle(x, r, ['#f7d57a', '#e8b84b', '#ffe9a8', '#c99a36']),
  lava: (x, r) => speckle(x, r, ['#f06a14', '#ffb32e', '#d4480c', '#ff8a1f']),
  water: (x, r) => speckle(x, r, ['#2f5fd6', '#3a6ee8', '#2a55c4', '#4478f0']),
  crack: (x, r) => { x.clearRect(0, 0, 16, 16); },
};

function ore(x, r, cols) {
  for (let k = 0; k < 5; k++) {
    const cx = 1 + Math.floor(r() * 12);
    const cy = 1 + Math.floor(r() * 12);
    [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1]].forEach(([dx, dy]) => { if (r() < 0.8) px(x, cx + dx, cy + dy, cols[Math.floor(r() * cols.length)]); });
  }
}

const texCache = new Map();
export function blockTexture(name) {
  if (texCache.has(name)) return texCache.get(name);
  const c = canvas16(DRAW[name] || DRAW.stone, name.length * 131 + name.charCodeAt(0));
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  t.userData.canvas = c;
  texCache.set(name, t);
  return t;
}

/** Block type → which texture on each face [px, nx, py, ny, pz, nz]. */
const FACES = {
  grass: ['grass_side', 'grass_side', 'grass_top', 'dirt', 'grass_side', 'grass_side'],
  snow: ['snow_side', 'snow_side', 'snow_top', 'dirt', 'snow_side', 'snow_side'],
  log: ['log_side', 'log_side', 'log_top', 'log_top', 'log_side', 'log_side'],
  crafting_table: ['table_side', 'table_side', 'table_top', 'planks', 'table_side', 'table_side'],
  furnace: ['furnace_side', 'furnace_side', 'furnace_side', 'furnace_side', 'furnace_front', 'furnace_side'],
};

export const BLOCKS = {
  grass: { hardness: 0.6, drop: 'dirt' },
  dirt: { hardness: 0.5 },
  snow: { hardness: 0.5, drop: 'dirt' },
  sand: { hardness: 0.5 },
  sandstone: { hardness: 0.9, tool: 1 },
  stone: { hardness: 1.5, tool: 1, drop: 'cobblestone' },
  cobblestone: { hardness: 1.5, tool: 1 },
  log: { hardness: 1.0 },
  leaves: { hardness: 0.2, drop: null, see: true },
  planks: { hardness: 0.9 },
  crafting_table: { hardness: 0.9 },
  furnace: { hardness: 1.5, tool: 1 },
  coal_ore: { hardness: 1.6, tool: 1, drop: 'coal' },
  iron_ore: { hardness: 1.8, tool: 2, drop: 'raw_iron' },
  gold_ore: { hardness: 1.8, tool: 3 },
  diamond_ore: { hardness: 2.0, tool: 3, drop: 'diamond' },
  netherrack: { hardness: 0.5 },
  obsidian: { hardness: Infinity },
  bedrock: { hardness: Infinity },
  gold_block: { hardness: Infinity },
  glowstone: { hardness: 0.4, glow: true },
  lava: { fluid: true, deadly: true, glow: true },
  water: { fluid: true, see: true },
};

const matCache = new Map();
export function blockMaterial(type) {
  if (matCache.has(type)) return matCache.get(type);
  const mk = (tex) => {
    const def = BLOCKS[type] || {};
    const opts = { map: blockTexture(tex) };
    if (def.glow) { opts.emissive = new THREE.Color(0xffffff); opts.emissiveMap = blockTexture(tex); opts.emissiveIntensity = type === 'lava' ? 0.9 : 0.6; }
    if (type === 'water') { opts.transparent = true; opts.opacity = 0.72; opts.depthWrite = false; }
    if (type === 'leaves') { opts.alphaTest = 0.1; }
    return new THREE.MeshLambertMaterial(opts);
  };
  const faces = FACES[type];
  const m = faces ? faces.map(mk) : mk(type);
  matCache.set(type, m);
  return m;
}

/** Crack overlay for the block being mined: stage 0…1. */
export function crackTexture(stage) {
  const key = `crack-${stage}`;
  if (texCache.has(key)) return texCache.get(key);
  const c = canvas16((x, r) => {
    x.clearRect(0, 0, 16, 16);
    const n = Math.round(stage * 34);
    let cx = 8; let cy = 8;
    for (let i = 0; i < n; i++) {
      px(x, cx, cy, 'rgba(0,0,0,0.75)');
      cx = Math.max(0, Math.min(15, cx + Math.round(r() * 2 - 1) * (1 + (i % 3 === 0 ? 1 : 0))));
      cy = Math.max(0, Math.min(15, cy + Math.round(r() * 2 - 1)));
      if (i % 9 === 8) { cx = Math.floor(r() * 16); cy = Math.floor(r() * 16); }
    }
  }, 77);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  texCache.set(key, t);
  return t;
}

// ─── Item icons (hotbar) ────────────────────────────────────────────────────
const ITEM_DRAW = {
  stick: (x) => { x.fillStyle = '#6b5130'; for (let i = 0; i < 10; i++) x.fillRect(3 + i, 12 - i, 2, 2); },
  coal: (x) => { x.fillStyle = '#1f1f1f'; x.fillRect(4, 4, 8, 8); x.fillStyle = '#3d3d3d'; x.fillRect(5, 5, 3, 3); x.fillRect(9, 9, 2, 2); },
  diamond: (x) => { x.fillStyle = '#5decf5'; x.fillRect(5, 3, 6, 2); x.fillRect(3, 5, 10, 3); x.fillRect(5, 8, 6, 3); x.fillRect(7, 11, 2, 2); x.fillStyle = '#d6fcff'; x.fillRect(5, 5, 2, 2); },
  iron_ingot: (x) => { x.fillStyle = '#d8d8d8'; x.fillRect(3, 6, 10, 5); x.fillStyle = '#a0a0a0'; x.fillRect(3, 10, 10, 1); x.fillStyle = '#f4f4f4'; x.fillRect(4, 7, 6, 1); },
  raw_iron: (x) => { x.fillStyle = '#c49a7c'; x.fillRect(4, 5, 8, 7); x.fillStyle = '#e6c4ab'; x.fillRect(5, 6, 3, 2); },
  sapling: (x) => { x.fillStyle = '#6b5130'; x.fillRect(7, 9, 2, 6); x.fillStyle = '#3f7f2f'; x.fillRect(4, 4, 8, 6); x.fillStyle = '#4a8f38'; x.fillRect(5, 2, 6, 3); x.fillRect(3, 6, 3, 2); x.fillRect(10, 6, 3, 2); },
  gold_ingot: (x) => { x.fillStyle = '#fcee4b'; x.fillRect(3, 6, 10, 5); x.fillStyle = '#c9a41c'; x.fillRect(3, 10, 10, 1); },
};
const pickaxe = (head) => (x) => {
  x.fillStyle = '#6b5130'; for (let i = 0; i < 9; i++) x.fillRect(3 + i, 12 - i, 2, 2);
  x.fillStyle = head; x.fillRect(4, 2, 9, 2); x.fillRect(11, 2, 2, 9); x.fillRect(3, 3, 2, 2); x.fillRect(12, 10, 2, 2);
};
ITEM_DRAW.wooden_pickaxe = pickaxe('#b4905a');
ITEM_DRAW.stone_pickaxe = pickaxe('#8b8b8b');
ITEM_DRAW.iron_pickaxe = pickaxe('#e6e6e6');
ITEM_DRAW.diamond_pickaxe = pickaxe('#5decf5');

const BLOCK_ICON_FACE = { grass: 'grass_side', snow: 'snow_side', log: 'log_side', crafting_table: 'table_top', furnace: 'furnace_front' };
const iconCache = new Map();
/** Data URL for an item's hotbar icon. */
export function itemIcon(item) {
  if (iconCache.has(item)) return iconCache.get(item);
  let url;
  if (ITEM_DRAW[item]) {
    const c = canvas16((x) => { x.clearRect(0, 0, 16, 16); ITEM_DRAW[item](x); });
    url = c.toDataURL();
  } else {
    url = blockTexture(BLOCK_ICON_FACE[item] || item).userData.canvas.toDataURL();
  }
  iconCache.set(item, url);
  return url;
}
