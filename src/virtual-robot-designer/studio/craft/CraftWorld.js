/**
 * Block Crafter — voxel world: block storage, terrain for each of the ten
 * arenas, and instanced rendering of every block with an exposed face.
 * A block at cell (x, y, z) fills [x-0.5, x+0.5] × [y, y+1] × [z-0.5, z+0.5].
 */
import * as THREE from 'three';
import { BLOCKS, blockMaterial } from './CraftTextures.js';

export const R = 14; // world spans -R … R-1 on x and z
export const MAX_Y = 24;

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

/** Smooth 2D value noise for rolling terrain. */
function noise2(seed) {
  const r = rng(seed);
  const g = Array.from({ length: 64 * 64 }, () => r());
  const at = (i, j) => g[((i & 63) * 64) + (j & 63)];
  const sm = (t) => t * t * (3 - 2 * t);
  return (x, z, scale) => {
    const fx = x / scale; const fz = z / scale;
    const i = Math.floor(fx); const j = Math.floor(fz);
    const u = sm(fx - i); const v = sm(fz - j);
    const a = at(i, j) + (at(i + 1, j) - at(i, j)) * u;
    const b = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * u;
    return a + (b - a) * v;
  };
}

export class VoxelWorld {
  constructor() {
    this.cells = new Map();
    this.meshes = [];
    this.group = new THREE.Group();
    this.group.name = 'CraftVoxels';
    this.dirty = false;
  }

  key(x, y, z) { return `${x},${y},${z}`; }
  get(x, y, z) { return this.cells.get(this.key(x, y, z)) || null; }
  set(x, y, z, type) {
    if (x < -R || x >= R || z < -R || z >= R || y < 0 || y > MAX_Y) return;
    if (type) this.cells.set(this.key(x, y, z), type);
    else this.cells.delete(this.key(x, y, z));
    this.dirty = true;
  }
  inBounds(x, z) { return x >= -R && x < R && z >= -R && z < R; }
  /** Walkable-into: empty, or a non-deadly fluid. */
  isOpen(x, y, z) {
    const t = this.get(x, y, z);
    return !t || (BLOCKS[t]?.fluid && !BLOCKS[t]?.deadly);
  }
  isSolid(x, y, z) {
    const t = this.get(x, y, z);
    return !!t && !BLOCKS[t]?.fluid;
  }
  /** Lowest place you can stand in a column: open for two blocks with ground under it. */
  floorY(x, z) {
    for (let y = 1; y < MAX_Y; y++) {
      if (this.isOpen(x, y, z) && this.isOpen(x, y + 1, z) && this.isSolid(x, y - 1, z)) return y;
    }
    return this.topY(x, z);
  }
  topY(x, z) {
    for (let y = MAX_Y; y >= 0; y--) if (this.isSolid(x, y, z)) return y + 1;
    return 0;
  }

  /** Rebuild the instanced meshes: one per block type, exposed blocks only. */
  rebuild() {
    this.meshes.forEach((m) => { this.group.remove(m); m.dispose?.(); });
    this.meshes = [];
    const byType = new Map();
    const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    for (const [k, type] of this.cells) {
      const [x, y, z] = k.split(',').map(Number);
      const exposed = dirs.some(([dx, dy, dz]) => {
        const n = this.get(x + dx, y + dy, z + dz);
        return !n || BLOCKS[n]?.see || (BLOCKS[n]?.fluid && n !== type);
      });
      if (!exposed) continue;
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type).push([x, y, z]);
    }
    const geo = this._geo || (this._geo = new THREE.BoxGeometry(1, 1, 1));
    const m4 = new THREE.Matrix4();
    for (const [type, list] of byType) {
      const mesh = new THREE.InstancedMesh(geo, blockMaterial(type), list.length);
      list.forEach(([x, y, z], i) => { m4.makeTranslation(x, y + 0.5, z); mesh.setMatrixAt(i, m4); });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = !BLOCKS[type]?.fluid;
      mesh.receiveShadow = true;
      mesh.name = `craft-${type}`;
      mesh.userData.blockType = type;
      this.group.add(mesh);
      this.meshes.push(mesh);
    }
    this.dirty = false;
  }
}

export function tree(w, x, y, z, h = 4) {
  while (y > 1 && w.get(x, y - 1, z) === 'leaves') y--; // grow from the ground, not on another tree's canopy
  for (let i = 0; i < h; i++) w.set(x, y + i, z, 'log');
  for (let dy = h - 2; dy <= h + 1; dy++) {
    const rad = dy >= h ? 1 : 2;
    for (let dx = -rad; dx <= rad; dx++) for (let dz = -rad; dz <= rad; dz++) {
      if (Math.abs(dx) === rad && Math.abs(dz) === rad && (dy === h + 1 || rad === 2)) continue;
      if (!w.get(x + dx, y + dy, z + dz)) w.set(x + dx, y + dy, z + dz, 'leaves');
    }
  }
}

/** Fill a column: bedrock, stone, a few dirt layers, then the surface block. */
function column(w, x, z, h, surface = 'grass', under = 'dirt', stone = 'stone') {
  w.set(x, 0, z, 'bedrock');
  for (let y = 1; y < h; y++) w.set(x, y, z, y >= h - 3 ? under : stone);
  if (h > 0) w.set(x, h - 1, z, surface);
}

/** Scatter ore through stone below the surface. */
function ores(w, r, list) {
  for (const [type, count, maxY] of list) {
    for (let n = 0; n < count; n++) {
      const x = Math.floor(r() * 2 * R) - R; const z = Math.floor(r() * 2 * R) - R;
      const y = 1 + Math.floor(r() * maxY);
      for (let k = 0; k < 3; k++) {
        const xx = x + Math.round(r() * 2 - 1); const yy = y + Math.round(r() - 0.5); const zz = z + Math.round(r() * 2 - 1);
        if (w.get(xx, yy, zz) === 'stone') w.set(xx, yy, zz, type);
      }
    }
  }
}

const clearSpawn = (w, sx, sz) => {
  const y = w.topY(sx, sz);
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let dy = 0; dy < 4; dy++) {
    const t = w.get(sx + dx, y + dy, sz + dz);
    if (t === 'leaves' || t === 'log') w.set(sx + dx, y + dy, sz + dz, null);
  }
};

/* ── Scenes: each world looks different at each level ─────────────────────
 * Level 0 is the original arena; Easy, Medium, Hard and Advanced each get
 * their own scene (a river, snow, a lake at sunset, lamps at night…). */
const surfaceAt = (w, x, z) => { const y = w.topY(x, z) - 1; return { y, t: w.get(x, y, z) }; };
const GROUND = new Set(['grass', 'snow', 'sand', 'dirt']);
const DRESS = {
  snow(w) { for (let x = -R; x < R; x++) for (let z = -R; z < R; z++) { const { y, t } = surfaceAt(w, x, z); if (t === 'grass') w.set(x, y, z, 'snow'); } },
  desert(w) {
    for (let x = -R; x < R; x++) for (let z = -R; z < R; z++) {
      for (let y = MAX_Y; y > 0; y--) { const t = w.get(x, y, z); if (t === 'grass' || (t === 'dirt' && w.get(x, y + 1, z) === 'sand')) w.set(x, y, z, 'sand'); }
    }
  },
  // Water where nothing stands on the ground (so trees and houses aren't left floating)
  river(w, r, spawn) {
    const z0 = spawn.z - 5 - Math.floor(r() * 3);
    for (let x = -R; x < R; x++) {
      const zz = z0 + Math.round(Math.sin(x / 3.5) * 1.5);
      for (let dz = 0; dz < 2; dz++) { const z = zz + dz; const { y, t } = surfaceAt(w, x, z); if (GROUND.has(t) && !w.get(x, y + 1, z)) w.set(x, y, z, 'water'); }
    }
  },
  lake(w, r, spawn) {
    const cx = (r() < 0.5 ? -1 : 1) * (6 + Math.floor(r() * 3)); const cz = spawn.z - 9 + Math.floor(r() * 4);
    for (let x = cx - 4; x <= cx + 4; x++) for (let z = cz - 3; z <= cz + 3; z++) {
      if (((x - cx) / 4) ** 2 + ((z - cz) / 3) ** 2 > 1) continue;
      const { y, t } = surfaceAt(w, x, z);
      if (GROUND.has(t) && !w.get(x, y + 1, z)) { w.set(x, y, z, 'water'); if (w.get(x, y - 1, z) !== 'bedrock') w.set(x, y - 1, z, 'water'); }
    }
  },
  // Lamp posts (night scenes), kept off the middle path
  lamps(w, r, spawn, n = 8) {
    for (let i = 0, tries = 0; i < n && tries < 200; tries++) {
      const x = Math.floor(r() * 2 * (R - 2)) - (R - 2); const z = Math.floor(r() * 2 * (R - 2)) - (R - 2);
      if (Math.abs(x) <= 2 || Math.hypot(x - spawn.x, z - spawn.z) < 4) continue;
      const { y, t } = surfaceAt(w, x, z);
      if (!GROUND.has(t) || w.get(x, y + 1, z) || w.get(x, y + 2, z) || w.get(x, y + 3, z)) continue;
      w.set(x, y + 1, z, 'cobblestone'); w.set(x, y + 2, z, 'cobblestone'); w.set(x, y + 3, z, 'glowstone');
      i++;
    }
  },
  // Netherrack pillars with glowing tops (Crimson Cavern), away from the bridge
  pillars(w, r, spawn, n = 6) {
    for (let i = 0, tries = 0; i < n && tries < 200; tries++) {
      const x = Math.floor(r() * 2 * (R - 2)) - (R - 2); const z = Math.floor(r() * 2 * (R - 2)) - (R - 2);
      if (Math.abs(x) <= 3) continue;
      const { y, t } = surfaceAt(w, x, z);
      if (t !== 'netherrack' || w.get(x, y + 1, z)) continue;
      const h = 3 + Math.floor(r() * 4);
      for (let k = 1; k <= h; k++) w.set(x, y + k, z, k === h ? 'glowstone' : 'netherrack');
      i++;
    }
  },
  // Cave floor: shallow pools and glowing crystals
  pools(w, r) {
    for (let i = 0; i < 4; i++) {
      const cx = Math.floor(r() * 14) - 7; const cz = Math.floor(r() * 16) - 10;
      for (let x = cx - 1; x <= cx + 1; x++) for (let z = cz - 1; z <= cz + 1; z++) if (w.get(x, 2, z) === 'stone' && !w.get(x, 3, z)) w.set(x, 2, z, 'water');
    }
  },
  crystals(w, r, spawn, n = 12) {
    for (let i = 0, tries = 0; i < n && tries < 300; tries++) {
      const x = Math.floor(r() * 16) - 8; const z = Math.floor(r() * 20) - 10;
      if (Math.abs(x) <= 1 || w.get(x, 3, z) || w.get(x, 2, z) !== 'stone') continue;
      w.set(x, 3, z, 'glowstone'); if (r() < 0.5 && !w.get(x, 4, z)) w.set(x, 4, z, 'glowstone');
      i++;
    }
  },
};
/** [ops, sky] for each world at Easy, Medium, Hard, Advanced (the original level is left as it was). */
const SCENES = {
  1: [[['river']], [['snow'], 'snow'], [['lake'], 'sunset'], [['lamps'], 'night']],
  2: [[['lake'], 'sunset'], [['snow'], 'snow'], [['river']], [['lamps'], 'night']],
  3: [[['river']], [['snow'], 'snow'], [['desert'], 'desert'], [['lamps'], 'night']],
  4: [[[], 'sunset'], [['snow'], 'snow'], [['desert'], 'desert'], [['lamps'], 'night']],
  5: [[['lake']], [[], 'sunset'], [['lamps'], 'night'], [['lake', 'lamps'], 'sunset']],
  6: [[['lake']], [[], 'sunset'], [['lamps'], 'night'], [['lake', 'lamps'], 'night']],
  7: [[['pillars']], [['pillars', 'pillars']], [[]], [['pillars']]],
  8: [[['pools']], [['crystals']], [['pools', 'crystals']], [['crystals', 'crystals']]],
  9: [[[], 'sunset'], [['snow'], 'snow'], [['desert'], 'desert'], [[], 'night']],
  10: [[['river'], 'sunset'], [['snow'], 'snow'], [['lake']], [['lamps'], 'night']],
};
/** Trees standing in the world (a log column with leaves at the top). */
export function countTrees(w) {
  let n = 0;
  for (const [k, t] of w.cells) {
    if (t !== 'log') continue;
    const [x, y, z] = k.split(',').map(Number);
    if (w.get(x, y - 1, z) === 'log') continue;
    let top = y; while (w.get(x, top + 1, z) === 'log') top++;
    let leafy = false;
    for (let dx = -1; dx <= 1 && !leafy; dx++) for (let dz = -1; dz <= 1 && !leafy; dz++) for (let dy = -1; dy <= 2; dy++) if (w.get(x + dx, top + dy, z + dz) === 'leaves') { leafy = true; break; }
    if (leafy) n++;
  }
  return n;
}

/**
 * Ten arenas. Each returns the world plus spawn, starting inventory and the
 * goal (checked by the arena every frame).
 */
export function generateWorld(modeIn) {
  // Modes 11–50 reuse the ten worlds with new terrain and a bigger job each tier:
  // mode 11–20 Easy, 21–30 Medium, 31–40 Hard, 41–50 Advanced (world = last digit).
  const modeN = Math.max(1, Math.floor(Number(modeIn) || 1));
  const tierMode = modeN > 10 && modeN <= 50;
  const mode = tierMode ? ((modeN - 11) % 10) + 1 : Math.min(10, modeN);
  const k = tierMode ? Math.floor((modeN - 11) / 10) : -1; // -1 = the original level
  const kk = Math.max(0, k);
  const w = new VoxelWorld();
  const r = rng(1000 + modeN * 97);
  const n = noise2(modeN * 31 + 7);
  let spawn = { x: 0, z: 8, dir: 2 };
  let inventory = {};
  let goal;
  let sky = 'day';
  const plains = (base, amp, scale, surface, under, stone) => {
    for (let x = -R; x < R; x++) for (let z = -R; z < R; z++) {
      column(w, x, z, Math.round(base + n(x + R, z + R, scale) * amp), surface, under, stone);
    }
  };

  switch (mode) {
    default:
    case 1: { // Grassland Spawn: punch a tree
      plains(5, [3, 2, 4, 3, 5][kk + (k < 0 ? 0 : 1)] || 3, [7, 9, 6, 8, 5][k + 1]);
      if (k < 0) [[-4, 2], [3, 0], [6, 5], [-7, -3], [0, -6], [-2, 5], [8, -4]].forEach(([x, z]) => tree(w, x, w.topY(x, z), z, 4 + Math.floor(r() * 2)));
      else {
        // Each level grows its own forest, a bit thicker each time
        const want = [7, 7, 9, 12][k];
        for (let i = 0, tries = 0; i < want && tries < 300; tries++) {
          const x = Math.floor(r() * 22) - 11; const z = Math.floor(r() * 22) - 12;
          if (Math.abs(x) <= 1 && z > 3) continue;
          if ([[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]].some(([dx, dz]) => w.get(x + dx, w.topY(x + dx, z + dz) - 1, z + dz) === 'leaves')) continue;
          tree(w, x, w.topY(x, z), z, 4 + Math.floor(r() * (k >= 2 ? 3 : 2)));
          i++;
        }
      }
      ores(w, r, [['coal_ore', 6, 4]]);
      if (k < 1) { const c = k < 0 ? 3 : 5; goal = { kind: 'collect', item: 'log', count: c, text: `Chop ${c} logs from the trees` }; }
      else if (k === 1) goal = { kind: 'trees', text: 'Clear the clearing: chop down every tree' };
      else if (k === 2) {
        inventory = { sapling: 3 };
        goal = { kind: 'multi', parts: [{ kind: 'collect', item: 'log', count: 12 }, { kind: 'plant', count: 3 }], text: 'Chop 12 logs, then plant 3 new trees' };
      } else goal = { kind: 'trees', text: 'Chop down every tree in the forest' };
      break;
    }
    case 2: { // Forest Path: wood → planks → sticks → pickaxe
      plains(5, 2, 8);
      for (let i = 0; i < 18; i++) {
        const x = Math.floor(r() * 24) - 12; const z = Math.floor(r() * 24) - 12;
        if (Math.abs(x) < 2 && z > 4) continue;
        tree(w, x, w.topY(x, z), z, 4 + Math.floor(r() * 3));
      }
      { const c = k < 0 ? 1 : [1, 2, 3, 4][k]; goal = { kind: 'craft', item: 'wooden_pickaxe', count: c, text: c === 1 ? 'Craft a wooden pickaxe' : `Craft ${c} wooden pickaxes` }; }
      break;
    }
    case 3: { // Village Cobble: build with blocks
      plains(5, 1, 10);
      [[-7, -4], [6, -5]].forEach(([hx, hz]) => {
        const y = w.topY(hx, hz);
        for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = 0; dy < 3; dy++) {
          const wall = Math.abs(dx) === 2 || Math.abs(dz) === 2;
          if (wall && !(dz === 2 && dx === 0 && dy < 2)) w.set(hx + dx, y + dy, hz + dz, dy === 2 ? 'planks' : 'cobblestone');
        }
        for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) w.set(hx + dx, y + 3, hz + dz, 'log');
        w.set(hx, y + 1, hz - 1, 'glowstone');
      });
      tree(w, 8, w.topY(8, 6), 6, 5);
      if (k < 0) { inventory = { cobblestone: 42, planks: 21 }; goal = { kind: 'place', count: 10, text: 'Build: place 10 blocks' }; }
      else {
        // Build houses (and a watchtower, and a village) with the Build blocks — or block by block
        inventory = [{ planks: 50, cobblestone: 20 }, { planks: 90, cobblestone: 40 }, { planks: 90, cobblestone: 60 }, { planks: 130, cobblestone: 60, sapling: 2 }][k];
        goal = [
          { kind: 'house', count: 1, text: 'Build a house' },
          { kind: 'house', count: 2, text: 'Build 2 houses for the village' },
          { kind: 'multi', parts: [{ kind: 'house', count: 2 }, { kind: 'tower', count: 1 }], text: 'Build 2 houses and a watchtower' },
          { kind: 'multi', parts: [{ kind: 'house', count: 3 }, { kind: 'tower', count: 1 }, { kind: 'plant', count: 2 }], text: 'Build a village: 3 houses, a watchtower and 2 trees' },
        ][k];
      }
      break;
    }
    case 4: { // Surface Mine: coal and iron
      plains(7, 6, 6, 'grass', 'dirt');
      for (let x = -3; x <= 3; x++) for (let z = -8; z <= -2; z++) { // open pit
        const t = w.topY(x, z);
        for (let y = 4; y < t; y++) w.set(x, y, z, 'stone');
        for (let y = 5; y < t; y++) if (y > 5 + Math.abs(x) + Math.abs(z + 5) / 2) w.set(x, y, z, null);
      }
      ores(w, r, [['coal_ore', 26 + kk * 6, 9], ['iron_ore', 18 + kk * 5, 7]]);
      inventory = { stone_pickaxe: 1 };
      { const coal = k < 0 ? 3 : [4, 6, 8, 10][k]; const iron = k < 0 ? 2 : [3, 4, 6, 8][k]; goal = { kind: 'collect_many', items: { coal, raw_iron: iron }, text: `Mine ${coal} coal and ${iron} iron ore` }; }
      break;
    }
    case 5: { // Desert Ruins: dig for the hidden diamond
      sky = 'desert';
      plains(6, 3, 6, 'sand', 'sand', 'sandstone');
      const py = w.topY(0, -4);
      for (let lvl = 0; lvl < 4; lvl++) for (let dx = -3 + lvl; dx <= 3 - lvl; dx++) for (let dz = -3 + lvl; dz <= 3 - lvl; dz++) w.set(dx, py + lvl, -4 + dz, 'sandstone');
      w.set(0, py + 4, -4, 'gold_block');
      // The dig site, out in the open: a glowing marker on top, the diamond far below
      const sites = [[3, 3], [-6, 5], [7, -6], [-8, -7], [9, 6]].slice(0, k < 0 ? 1 : 1 + k + (k === 3 ? 1 : 0));
      sites.forEach(([sx, sz]) => {
        const top = w.topY(sx, sz);
        for (let y = 1; y < top; y++) w.set(sx, y, sz, 'sandstone');
        w.set(sx, 2, sz, 'diamond_ore');
        w.set(sx, top - 1, sz, 'glowstone');
      });
      inventory = { iron_pickaxe: 1 };
      goal = sites.length === 1
        ? { kind: 'collect', item: 'diamond', count: 1, text: 'Dig down under the glowing block to find the diamond' }
        : { kind: 'collect', item: 'diamond', count: sites.length, text: `Dig under all ${sites.length} glowing blocks to find ${sites.length} diamonds` };
      break;
    }
    case 6: { // Snowy Peaks: build up to the summit
      sky = 'snow';
      for (let x = -R; x < R; x++) for (let z = -R; z < R; z++) {
        const d = Math.hypot(x, z + 4);
        const h = Math.max(5, Math.round(15 + kk * 2 - d * (1.15 + kk * 0.12) + n(x + R, z + R, 5) * 2));
        column(w, x, z, h, 'snow', 'dirt');
      }
      for (let x = -1; x <= 1; x++) for (let z = -5; z <= -3; z++) w.set(x, w.topY(x, z), z, 'snow');
      w.set(0, w.topY(0, -4), -4, 'gold_block');
      inventory = { cobblestone: 40 + kk * 15 };
      goal = { kind: 'reach', block: 'gold_block', text: k <= 0 ? 'Build steps and stand next to the gold block on the summit' : 'Build steps up the taller, steeper peak to the gold block' };
      break;
    }
    case 7: { // Crimson Cavern: bridge the lava
      sky = 'nether';
      for (let x = -R; x < R; x++) for (let z = -R; z < R; z++) {
        const lava = z >= -3 - kk && z <= 2 + Math.min(kk, 2);
        const h = lava ? 3 : 6 + Math.round(n(x + R, z + R, 5) * 2);
        column(w, x, z, h, 'netherrack', 'netherrack', 'netherrack');
        if (lava) { w.set(x, 3, z, 'lava'); w.set(x, 4, z, 'lava'); }
      }
      const gy = w.topY(0, -8);
      [[-1, 0], [-1, 1], [-1, 2], [-1, 3], [-1, 4], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [0, 4], [1, 4], [0, 0], [1, 0]].forEach(([dx, dy]) => w.set(dx, gy + dy, -8, 'obsidian'));
      for (let i = 0; i < 6; i++) w.set(-10 + i * 4, 9, -10 + (i % 2) * 18, 'glowstone');
      inventory = { cobblestone: 24 + kk * 10 };
      goal = { kind: 'reach', block: 'obsidian', text: k <= 0 ? 'Place blocks to bridge the lava and reach the portal' : `Bridge the ${6 + kk + Math.min(kk, 2)}-block lava river and reach the portal` };
      spawn = { x: 0, z: 7, dir: 2 };
      break;
    }
    case 8: { // Deep Stone Hall: diamonds underground
      sky = 'cave';
      for (let x = -R; x < R; x++) for (let z = -R; z < R; z++) {
        column(w, x, z, 14, 'stone', 'stone', 'stone');
        const hall = Math.abs(x) < 9 && Math.abs(z) < 11;
        if (hall) for (let y = 3; y < 7 + Math.round(n(x + R, z + R, 4) * 2); y++) w.set(x, y, z, null);
      }
      for (let i = 0; i < 10; i++) w.set(-8 + i * 2, 9, (i % 2 ? 6 : -6), 'glowstone');
      ores(w, r, [['diamond_ore', 14, 6], ['iron_ore', 10, 6], ['coal_ore', 10, 7]]);
      for (let x = -8; x <= 8; x += 4) w.set(x, 3, -10, 'diamond_ore');
      inventory = { iron_pickaxe: 1 };
      { const c = k < 0 ? 3 : [3, 5, 7, 9][k]; goal = { kind: 'collect', item: 'diamond', count: c, text: `Mine ${c} diamonds in the deep hall` }; }
      spawn = { x: 0, z: 8, dir: 2 };
      break;
    }
    case 9: { // Sky Islands: bridge the gaps
      sky = 'sky';
      const island = (cx, cz, rad, top) => {
        for (let x = cx - rad; x <= cx + rad; x++) for (let z = cz - rad; z <= cz + rad; z++) {
          const d = Math.hypot(x - cx, z - cz);
          if (d > rad) continue;
          const depth = Math.round((rad - d) * 1.2) + 1;
          for (let y = top - depth; y < top; y++) w.set(x, y, z, y === top - 1 ? 'grass' : 'dirt');
        }
      };
      if (k < 0) { island(0, 8, 3, 12); island(0, -1, 2, 12); island(0, -9, 3, 12); w.set(0, 12, -9, 'gold_block'); }
      else if (k === 0) {
        // Easy: an L-shaped route — straight on, then turn to reach the gold
        island(0, 8, 3, 12); island(0, 0, 2, 12); island(-7, 0, 2, 12); island(-7, -8, 3, 12);
        w.set(-7, 12, -8, 'gold_block');
      }
      else {
        // Harder: smaller stepping islands that zig-zag, and the gold on a higher island
        island(0, 9, 3, 12);
        const steps = [[-5, 3], [4, -2], [-4, -7]].slice(0, kk);
        steps.forEach(([sx, sz]) => island(sx, sz, 1, 12));
        island(4, -11, 2, 12 + kk);
        w.set(4, 12 + kk, -11, 'gold_block');
      }
      tree(w, 2, 12, 9, 4);
      inventory = { planks: 30 + kk * 12 };
      goal = { kind: 'reach', block: 'gold_block', text: k <= 0 ? 'Build bridges across the sky to the gold block' : 'Bridge from island to island and climb to the gold block' };
      spawn = { x: 0, z: 8, dir: 2 };
      break;
    }
    case 10: { // Master Builder Cup: the full craft chain
      plains(6, 4, 7);
      (k < 0 ? [[-5, 3], [4, 4], [-6, -5], [6, -3]] : Array.from({ length: 4 + kk }, () => [Math.floor(r() * 18) - 9 || 4, Math.floor(r() * 16) - 9])).forEach(([x, z]) => tree(w, x, w.topY(x, z), z, 5));
      for (let x = -2; x <= 2; x++) for (let z = -8; z <= -5; z++) { const t = w.topY(x, z); w.set(x, t - 1, z, 'stone'); }
      ores(w, r, [['coal_ore', 20, 6], ['iron_ore', 12, 5]]);
      goal = [
        { kind: 'craft', item: 'stone_pickaxe', count: 1, text: 'From nothing: craft a stone pickaxe' },
        { kind: 'craft', item: 'furnace', count: 1, text: 'From nothing: craft a furnace' },
        { kind: 'craft', item: 'iron_ingot', count: 2, text: 'From nothing: smelt 2 iron ingots' },
        { kind: 'craft', item: 'iron_pickaxe', count: 1, text: 'From nothing: craft an iron pickaxe' },
      ][k < 0 ? 0 : k];
      break;
    }
  }
  if (k >= 0) {
    const [ops, scSky] = SCENES[mode]?.[k] || [[]];
    ops.forEach((op) => DRESS[op]?.(w, r, spawn));
    if (scSky) sky = scSky;
  }
  clearSpawn(w, spawn.x, spawn.z);
  if (goal.kind === 'trees') goal = { ...goal, count: countTrees(w) };
  return { world: w, spawn, inventory, goal, sky, scene: k >= 0 ? (SCENES[mode]?.[k]?.[1] || 'own') : 'original' };
}
