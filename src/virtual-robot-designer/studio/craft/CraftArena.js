/**
 * Block Crafter — a Minecraft-style game mode for the Block Crafter robot.
 *
 * A voxel world you can change: walk block by block (hopping up single
 * blocks, falling down drops), mine blocks with the right pickaxe (cracks,
 * particles, the drop flies into your hotbar), place blocks (bridges over
 * gaps, stairs and walls), craft and smelt. Each of the ten arenas has its
 * own world and goal. The Crafter is driven only by the player's code, through
 * scene.userData.craft.
 */
import * as THREE from 'three';
import { getTierMood } from '../../data/tier-levels/index.js';
import { tint } from '../../data/tier-levels/moods.js';
import { BLOCKS, blockMaterial, blockTexture, crackTexture, itemIcon } from './CraftTextures.js';
import { generateWorld, tree as growTree, countTrees } from './CraftWorld.js';

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // matches heading: forward = (sin a, cos a)
const PICKAXES = ['wooden_pickaxe', 'stone_pickaxe', 'iron_pickaxe', 'diamond_pickaxe'];
const PLACEABLE = new Set(['dirt', 'sand', 'sandstone', 'cobblestone', 'stone', 'log', 'planks', 'crafting_table', 'furnace', 'glowstone', 'netherrack', 'snow']);
/** What the Build blocks use, best first. */
const BUILD_ORDER = ['planks', 'cobblestone', 'sandstone', 'log', 'stone', 'snow', 'dirt', 'sand', 'netherrack'];
const NAMES = {
  log: 'Log', planks: 'Planks', stick: 'Stick', crafting_table: 'Crafting Table', furnace: 'Furnace',
  wooden_pickaxe: 'Wooden Pickaxe', stone_pickaxe: 'Stone Pickaxe', iron_pickaxe: 'Iron Pickaxe', diamond_pickaxe: 'Diamond Pickaxe',
  cobblestone: 'Cobblestone', dirt: 'Dirt', sand: 'Sand', sandstone: 'Sandstone', coal: 'Coal', raw_iron: 'Raw Iron',
  iron_ingot: 'Iron Ingot', diamond: 'Diamond', glowstone: 'Glowstone', netherrack: 'Netherrack', snow: 'Snow', sapling: 'Sapling',
};
export const itemName = (i) => NAMES[i] || String(i).replace(/_/g, ' ');

export const RECIPES = {
  planks: { needs: { log: 1 }, gives: { planks: 4 } },
  sticks: { needs: { planks: 2 }, gives: { stick: 4 } },
  crafting_table: { needs: { planks: 4 }, gives: { crafting_table: 1 } },
  wooden_pickaxe: { needs: { planks: 3, stick: 2 }, gives: { wooden_pickaxe: 1 }, station: 'crafting_table' },
  stone_pickaxe: { needs: { cobblestone: 3, stick: 2 }, gives: { stone_pickaxe: 1 }, station: 'crafting_table' },
  furnace: { needs: { cobblestone: 8 }, gives: { furnace: 1 }, station: 'crafting_table' },
  iron_pickaxe: { needs: { iron_ingot: 3, stick: 2 }, gives: { iron_pickaxe: 1 }, station: 'crafting_table' },
  diamond_pickaxe: { needs: { diamond: 3, stick: 2 }, gives: { diamond_pickaxe: 1 }, station: 'crafting_table' },
  iron_ingot: { needs: { raw_iron: 1, coal: 1 }, gives: { iron_ingot: 1 }, station: 'furnace' },
};

const SKIES = {
  day: { bg: 0x8fc5ff, fog: 0xbfdcff, near: 30, far: 70, sun: 1.6, hemi: [0xdff0ff, 0x6a8a4a, 1.0] },
  desert: { bg: 0xf3d9a4, fog: 0xf0dcae, near: 30, far: 70, sun: 1.8, hemi: [0xfff1d6, 0xb99a5a, 1.0] },
  snow: { bg: 0xcfe3f5, fog: 0xe4eef7, near: 26, far: 64, sun: 1.3, hemi: [0xeaf4ff, 0x9fb2c4, 1.1] },
  nether: { bg: 0x3a0e0e, fog: 0x5a1a12, near: 14, far: 48, sun: 0.5, hemi: [0xff8a5a, 0x3a0e0e, 0.9] },
  cave: { bg: 0x0d0f14, fog: 0x0d0f14, near: 10, far: 34, sun: 0.25, hemi: [0x8a9ab8, 0x1a1a22, 0.55] },
  sky: { bg: 0x7fbfff, fog: 0xbfe3ff, near: 30, far: 80, sun: 1.6, hemi: [0xdff0ff, 0x6a8aa8, 1.0] },
  sunset: { bg: 0xf7a072, fog: 0xf9c39a, near: 28, far: 70, sun: 1.35, hemi: [0xffe0c4, 0x8a6a4a, 1.0] },
  night: { bg: 0x161d3a, fog: 0x1f2a50, near: 22, far: 60, sun: 0.55, hemi: [0xa6b8ff, 0x2a3050, 0.95] },
};

export function buildBlockCraftArena(scene, challenge = {}) {
  const mode = Math.max(1, Math.min(50, Number(challenge.modeIndex || challenge.modeNumber) || 1));
  const gen = generateWorld(mode);
  const { world } = gen;
  world.rebuild();
  const cellSnapshot = new Map(world.cells);
  scene.add(world.group);

  // ── Sky, light, atmosphere ───────────────────────────────────────────────
  const baseSky = SKIES[gen.sky] || SKIES.day;
  // Modes 11–50 revisit the ten worlds at a different time of day
  const craftMood = mode > 10 && !['sunset', 'night', 'snow', 'desert'].includes(gen.sky) ? getTierMood('blockbot', mode) : null;
  const sky = craftMood ? {
    ...baseSky, bg: tint(baseSky.bg, craftMood), fog: tint(baseSky.fog, craftMood),
    sun: baseSky.sun * craftMood.light,
    hemi: [tint(baseSky.hemi[0], craftMood), tint(baseSky.hemi[1], craftMood, 0.5), baseSky.hemi[2] * craftMood.light],
  } : baseSky;
  scene.background = new THREE.Color(sky.bg);
  scene.fog = new THREE.Fog(sky.fog, sky.near, sky.far);
  const hemi = new THREE.HemisphereLight(...sky.hemi);
  const sun = new THREE.DirectionalLight(0xfff4e0, sky.sun);
  sun.position.set(12, 26, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 70 });
  sun.shadow.bias = -0.0006;
  hemi.userData.craftLight = true;
  sun.userData.craftLight = true;
  scene.add(hemi, sun);
  if (gen.sky === 'day' || gen.sky === 'sky' || gen.sky === 'snow' || gen.sky === 'desert' || gen.sky === 'sunset') {
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const clouds = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(3 + (i % 4) * 2, 0.8, 2 + (i % 3) * 2), cloudMat);
      c.position.set(-30 + (i * 13) % 60, 22 + (i % 3), -30 + (i * 17) % 60);
      clouds.add(c);
    }
    scene.add(clouds);
    scene.userData._craftClouds = clouds;
  }
  const lava = blockTexture('lava');
  lava.wrapS = lava.wrapT = THREE.RepeatWrapping;

  // ── Player state ─────────────────────────────────────────────────────────
  const spawnY = world.floorY(gen.spawn.x, gen.spawn.z);
  const P = { x: gen.spawn.x, y: spawnY, z: gen.spawn.z, dir: gen.spawn.dir, angle: gen.spawn.dir * Math.PI / 2 };
  const view = { x: P.x, y: P.y, z: P.z, angle: P.angle };
  let inventory = { ...gen.inventory };
  let selected = Object.keys(inventory).find((k) => PLACEABLE.has(k)) || null;
  const tally = { collected: {}, crafted: {}, placed: 0, mined: 0, deaths: 0, houses: 0, towers: 0, planted: 0 };
  const treesAtStart = countTrees(world);
  let treeCount = { at: -1, n: treesAtStart };
  let goalDone = false;
  let clock = 0;
  let busyUntil = 0;
  let doing = { op: null, until: 0 };
  const segments = [];   // movement tweens for the view
  const timeline = [];   // timed effects (block breaks, placements, respawns)
  let onEvent = null;
  const at = (delay, fn) => timeline.push({ t: clock + delay, fn });

  scene.userData.craftMode = true;
  scene.userData.customSky = true;
  scene.userData.customDecor = true;
  scene.userData.obstacles = [];
  scene.userData.collectibles = [];
  scene.userData.finishZone = null;
  scene.userData.spawnX = P.x;
  scene.userData.spawnZ = P.z;
  scene.userData.spawnY = P.y;
  scene.userData.arenaBounds = { camMinZ: -60, camMaxZ: 60, camMaxX: 60, flappyNoIntro: true };
  // Higher over-the-shoulder view: sees the blocks ahead without trees in the way
  scene.userData.missionCameraPreset = gen.sky === 'cave'
    ? { camBack: 4, camUp: 2.4, lookAhead: 2.4, lookHeight: 0.9, fov: 64 } // under the hall's ceiling
    : { camBack: 5.6, camUp: 4.4, lookAhead: 3.4, lookHeight: 0.9, fov: 62 };

  // ── Effects: selection outline, cracks, particles, flying drops ──────────
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)),
    new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.8 }),
  );
  outline.visible = false;
  scene.add(outline);
  const crack = new THREE.Mesh(new THREE.BoxGeometry(1.01, 1.01, 1.01), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: crackTexture(0) }));
  crack.visible = false;
  scene.add(crack);
  const bits = [];
  const bitGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const burst = (x, y, z, type) => {
    const m = blockMaterial(type);
    const mat = Array.isArray(m) ? m[0] : m;
    for (let i = 0; i < 14; i++) {
      const b = new THREE.Mesh(bitGeo, mat);
      b.position.set(x + (Math.random() - 0.5) * 0.6, y + 0.3 + Math.random() * 0.5, z + (Math.random() - 0.5) * 0.6);
      b.userData.v = new THREE.Vector3((Math.random() - 0.5) * 3, 2 + Math.random() * 2.5, (Math.random() - 0.5) * 3);
      b.userData.life = 0.7;
      scene.add(b);
      bits.push(b);
    }
  };
  const drops = [];
  const flyDrop = (x, y, z, type) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), blockMaterial(BLOCKS[type] ? type : 'planks'));
    m.position.set(x, y + 0.4, z);
    m.userData.t = 0;
    m.userData.from = m.position.clone();
    scene.add(m);
    drops.push(m);
  };

  // ── HUD: goal pill, hotbar, messages ─────────────────────────────────────
  document.getElementById('bb-craft-hud')?.remove();
  const hud = document.createElement('div');
  hud.id = 'bb-craft-hud';
  hud.innerHTML = `
    <style>
      #bb-craft-hud{position:absolute;inset:0;pointer-events:none;font-family:'Press Start 2P','Courier New',monospace;z-index:6}
      #bb-craft-hud .goal{position:absolute;top:150px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.62);color:#fff;padding:8px 14px;font-size:11px;border:2px solid #3a3a3a;box-shadow:inset 0 0 0 2px #6b6b6b;white-space:nowrap}
      #bb-craft-hud .goal b{color:#fcee4b}
      #bb-craft-hud .bar{position:absolute;bottom:122px;left:50%;transform:translateX(-50%);display:flex;gap:2px;background:rgba(20,20,20,.65);padding:3px;border:2px solid #1e1e1e}
      #bb-craft-hud .slot{position:relative;width:44px;height:44px;background:#8b8b8b;box-shadow:inset 2px 2px 0 #373737,inset -2px -2px 0 #ffffff55}
      #bb-craft-hud .slot img{position:absolute;inset:7px;width:30px;height:30px;image-rendering:pixelated}
      #bb-craft-hud .slot .n{position:absolute;right:3px;bottom:2px;color:#fff;font-size:9px;text-shadow:2px 2px 0 #3f3f3f}
      #bb-craft-hud .slot.sel{outline:3px solid #fff;outline-offset:-1px;z-index:1}
      #bb-craft-hud .name{position:absolute;bottom:178px;left:50%;transform:translateX(-50%);color:#fff;font-size:10px;text-shadow:2px 2px 0 #3f3f3f}
      #bb-craft-hud .msg{position:absolute;top:190px;left:50%;transform:translateX(-50%);color:#fff;font-size:11px;text-shadow:2px 2px 0 #3f3f3f;transition:opacity .3s;white-space:nowrap}
      #bb-craft-hud .win{position:absolute;top:42%;left:50%;transform:translate(-50%,-50%);color:#fcee4b;font-size:22px;text-shadow:3px 3px 0 #3f3f3f;display:none}
    </style>
    <div class="goal"></div><div class="msg"></div><div class="name"></div><div class="bar"></div><div class="win">GOAL COMPLETE!</div>`;
  const $ = (c) => hud.querySelector(c);
  let msgTimer = 0;
  const say = (text, secs = 2.2) => { $('.msg').textContent = text; $('.msg').style.opacity = 1; msgTimer = secs; };
  const goalProgress = (g = gen.goal) => {
    if (g.kind === 'multi') {
      const parts = g.parts.map((p) => goalProgress(p));
      return [parts.reduce((a, [h]) => a + h, 0), parts.reduce((a, [, n]) => a + n, 0)];
    }
    if (g.kind === 'trees') {
      const total = g.count || treesAtStart;
      if (clock - treeCount.at > 0.4 || treeCount.at < 0) treeCount = { at: clock, n: countTrees(world) };
      return [Math.max(0, Math.min(total, total - treeCount.n)), total];
    }
    if (g.kind === 'house') return [Math.min(g.count, tally.houses), g.count];
    if (g.kind === 'tower') return [Math.min(g.count, tally.towers), g.count];
    if (g.kind === 'plant') return [Math.min(g.count, tally.planted), g.count];
    if (g.kind === 'collect') return [Math.min(g.count, tally.collected[g.item] || 0), g.count];
    if (g.kind === 'craft') return [Math.min(g.count, tally.crafted[g.item] || 0), g.count];
    if (g.kind === 'place') return [Math.min(g.count, tally.placed), g.count];
    if (g.kind === 'collect_many') {
      const keys = Object.keys(g.items);
      return [keys.reduce((a, k) => a + Math.min(g.items[k], tally.collected[k] || 0), 0), keys.reduce((a, k) => a + g.items[k], 0)];
    }
    return [goalDone ? 1 : 0, 1];
  };
  /** Words for the Mission panel: "7 trees chopped", "2 houses", "3 jobs done"… */
  const goalLabel = (g, n) => {
    const pl = (one, many) => (n === 1 ? one : many);
    if (g.kind === 'collect') return { log: pl('log', 'logs'), diamond: pl('diamond', 'diamonds') }[g.item] || itemName(g.item).toLowerCase();
    if (g.kind === 'collect_many') return 'ores';
    if (g.kind === 'craft') return itemName(g.item).toLowerCase();
    if (g.kind === 'place') return 'blocks placed';
    if (g.kind === 'trees') return pl('tree chopped', 'trees chopped');
    if (g.kind === 'house') return pl('house', 'houses');
    if (g.kind === 'multi') return 'jobs done';
    return { gold_block: 'gold block', obsidian: 'portal' }[g.block] || 'goal';
  };
  let hudKey = '';
  const drawHud = () => {
    const items = Object.keys(inventory).filter((k) => inventory[k] > 0).slice(0, 9);
    const [have, need] = goalProgress();
    const key = JSON.stringify([items.map((k) => [k, inventory[k]]), selected, have, goalDone]);
    if (key === hudKey) return;
    hudKey = key;
    $('.goal').innerHTML = `🎯 ${gen.goal.text} &nbsp;<b>${have}/${need}</b>`;
    $('.bar').innerHTML = Array.from({ length: 9 }, (_, i) => {
      const it = items[i];
      return `<div class="slot${it && it === selected ? ' sel' : ''}">${it ? `<img src="${itemIcon(it)}"><span class="n">${inventory[it] > 1 ? inventory[it] : ''}</span>` : ''}</div>`;
    }).join('');
    $('.name').textContent = selected ? itemName(selected) : '';
    $('.win').style.display = goalDone ? 'block' : 'none';
  };
  let hudMounted = false;
  const mountHud = () => {
    if (hudMounted) return;
    const canvases = [...document.querySelectorAll('canvas')].filter((c) => c.width > 300 && c.offsetParent);
    const host = canvases.sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0]?.parentElement;
    if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(hud);
    hudMounted = true;
  };

  // ── World helpers ─────────────────────────────────────────────────────────
  const front = () => { const [dx, dz] = DIRS[P.dir]; return [P.x + dx, P.z + dz]; };
  const toolTier = () => PICKAXES.reduce((t, p, i) => (inventory[p] > 0 ? i + 1 : t), 0);
  const give = (item, n = 1) => {
    inventory[item] = (inventory[item] || 0) + n;
    tally.collected[item] = (tally.collected[item] || 0) + n;
    if (!selected && PLACEABLE.has(item)) selected = item;
  };
  const take = (item, n = 1) => {
    inventory[item] = (inventory[item] || 0) - n;
    if (inventory[item] <= 0) { delete inventory[item]; if (selected === item) selected = Object.keys(inventory).find((k) => PLACEABLE.has(k)) || null; }
  };
  const near = (type, r = 4) => {
    for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) for (let dy = -2; dy <= 3; dy++) {
      if (world.get(P.x + dx, P.y + dy, P.z + dz) === type) return true;
    }
    return false;
  };
  const hasStation = (s) => (inventory[s] > 0) || near(s);
  const move = (x, y, z, dur) => { segments.push({ to: { x, y, z }, dur }); P.x = x; P.y = y; P.z = z; };
  const emit = (type, detail) => onEvent?.(type, detail);

  /**
   * Fall from the current cell; returns seconds added. Lava or the void respawns you.
   * t0 is how far into the current action the fall starts, so the respawn waits for the animation.
   */
  const fall = (t0 = 0) => {
    let y = P.y;
    while (y > 0 && !world.isSolid(P.x, y - 1, P.z) && world.get(P.x, y - 1, P.z) !== 'lava') y--;
    const drop = P.y - y;
    let dur = 0;
    if (drop > 0) { dur = 0.1 + Math.sqrt(drop) * 0.13; move(P.x, y, P.z, dur); }
    const lavaHere = world.get(P.x, y, P.z) === 'lava' || world.get(P.x, y - 1, P.z) === 'lava';
    const voidBelow = y === 0; // nothing under you all the way down (sky islands)
    if (lavaHere || voidBelow) {
      if (voidBelow) { move(P.x, -12, P.z, 0.7); dur += 0.7; }
      dur += respawn(lavaHere ? 'Ouch, lava! Back to spawn.' : 'You fell! Back to spawn.', t0 + dur);
    }
    return dur;
  };
  const respawn = (text, delay) => {
    tally.deaths += 1;
    at(delay, () => {
      say(text);
      P.x = gen.spawn.x; P.z = gen.spawn.z; P.y = world.floorY(P.x, P.z); P.dir = gen.spawn.dir; P.angle = P.dir * Math.PI / 2;
      segments.length = 0;
      Object.assign(view, { x: P.x, y: P.y, z: P.z, angle: P.angle });
      emit('respawn');
    });
    return 0.5;
  };

  const breakBlock = (x, y, z, delay, dur) => {
    const type = world.get(x, y, z);
    for (let k = 0; k < 6; k++) at(delay + (dur * k) / 6, () => { crack.visible = true; crack.position.set(x, y + 0.5, z); crack.material.map = crackTexture(Math.min(1, k / 5)); crack.material.needsUpdate = true; });
    at(delay + dur, () => {
      crack.visible = false;
      if (world.get(x, y, z) !== type) return;
      world.set(x, y, z, null);
      world.rebuild();
      burst(x, y, z, type);
      const drop = BLOCKS[type]?.drop === undefined ? type : BLOCKS[type].drop;
      if (drop) { flyDrop(x, y, z, drop); give(drop); }
      tally.mined += 1;
      emit('block_mined', { type });
    });
  };

  // ── Trees, paths and building helpers ───────────────────────────────────
  /** Where you'd stand in a column, near a height (null if you can't). */
  const standAt = (x, z, nearY) => {
    for (const y of [nearY, nearY + 1, nearY - 1, nearY - 2, nearY - 3]) {
      if (y < 1 || !world.inBounds(x, z)) continue;
      if (world.isOpen(x, y, z) && world.isOpen(x, y + 1, z) && world.isSolid(x, y - 1, z) && world.get(x, y, z) !== 'lava' && world.get(x, y - 1, z) !== 'lava') return y;
    }
    return null;
  };
  /** Every tree still standing: its trunk column, from the bottom log to the top. */
  const trees = () => {
    const list = [];
    for (const [key, t] of world.cells) {
      if (t !== 'log') continue;
      const [x, y, z] = key.split(',').map(Number);
      if (world.get(x, y - 1, z) === 'log') continue;
      let top = y; while (world.get(x, top + 1, z) === 'log') top++;
      let leafy = false;
      for (let dx = -1; dx <= 1 && !leafy; dx++) for (let dz = -1; dz <= 1 && !leafy; dz++) for (let dy = -1; dy <= 2; dy++) if (world.get(x + dx, top + dy, z + dz) === 'leaves') { leafy = true; break; }
      if (leafy) list.push({ x, y, z, top });
    }
    return list;
  };
  /** Shortest walk to stand next to any of the trees (breadth-first over the blocks). */
  const routeToTree = (list) => {
    const goals = new Map();
    list.forEach((tr) => DIRS.forEach(([dx, dz], d) => {
      // stand at (tr - dir) facing dir
      goals.set(`${tr.x - dx},${tr.z - dz}`, { tr, dir: d });
    }));
    const startKey = `${P.x},${P.z}`;
    const prev = new Map([[startKey, null]]);
    const q = [{ x: P.x, y: P.y, z: P.z }];
    while (q.length) {
      const c = q.shift();
      const g = goals.get(`${c.x},${c.z}`);
      if (g && Math.abs(c.y - g.tr.y) <= 1) {
        const path = [];
        for (let k = `${c.x},${c.z}`, n = c; n; ) { path.unshift(n); const pr = prev.get(k); if (!pr) break; n = pr; k = `${pr.x},${pr.z}`; }
        return { path: path.slice(1), dir: g.dir, tr: g.tr };
      }
      for (const [dx, dz] of DIRS) {
        const nx = c.x + dx; const nz = c.z + dz; const key = `${nx},${nz}`;
        if (prev.has(key)) continue;
        const ny = standAt(nx, nz, c.y);
        if (ny === null || ny - c.y > 1 || (ny > c.y && !world.isOpen(c.x, c.y + 2, c.z))) continue;
        prev.set(key, c);
        q.push({ x: nx, y: ny, z: nz });
      }
      if (prev.size > 2500) break;
    }
    return null;
  };
  const face = (d) => {
    let delta = (d - P.dir + 4) % 4; if (delta === 3) delta = -1;
    if (!delta) return 0;
    P.dir = d; P.angle += delta * Math.PI / 2;
    segments.push({ to: { angle: P.angle }, dur: 0.15 });
    return 0.15;
  };
  const walkPath = (path) => {
    let t = 0;
    for (const c of path) {
      const d = DIRS.findIndex(([dx, dz]) => dx === c.x - P.x && dz === c.z - P.z);
      if (d >= 0) t += face(d);
      move(c.x, c.y, c.z, 0.2); t += 0.2;
    }
    return t;
  };
  /** Chop a whole tree: every log in the trunk, then its leaves. Gives a sapling to plant. */
  const fell = (tr, t0) => {
    let t = t0;
    for (let y = tr.y; y <= tr.top; y++) {
      if (world.get(tr.x, y, tr.z) !== 'log') continue;
      breakBlock(tr.x, y, tr.z, t, 0.32);
      t += 0.36;
    }
    const others = trees().filter((o) => o.x !== tr.x || o.z !== tr.z);
    at(t, () => {
      let n = 0;
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let y = tr.y + 1; y <= tr.top + 3; y++) {
        if (world.get(tr.x + dx, y, tr.z + dz) !== 'leaves') continue;
        // Leave a neighbouring tree's leaves alone
        const mine = dx * dx + dz * dz;
        if (others.some((o) => (tr.x + dx - o.x) ** 2 + (tr.z + dz - o.z) ** 2 < mine)) continue;
        world.set(tr.x + dx, y, tr.z + dz, null);
        if (n++ % 6 === 0) burst(tr.x + dx, y, tr.z + dz, 'leaves');
      }
      world.rebuild();
      give('sapling', 1);
    });
    return t + 0.1 - t0;
  };
  /** Take blocks for building, best kind first (or the one you're holding). Returns the list, or null. */
  const takeBlocks = (n, prefer) => {
    const order = [...new Set([prefer, ...BUILD_ORDER].filter((k) => k && PLACEABLE.has(k)))];
    const have = order.reduce((a, k) => a + (inventory[k] || 0), 0);
    if (have < n) return { short: n - have, have };
    const out = [];
    for (const k of order) { while (out.length < n && inventory[k] > 0) { out.push(k); take(k); } }
    return { blocks: out };
  };
  const putBlocks = (cells, t0, step = 0.05) => {
    cells.forEach(([x, y, z, type], i) => at(t0 + i * step, () => { world.set(x, y, z, type); world.rebuild(); }));
    tally.placed += cells.length;
    return cells.length * step;
  };

  // ── Actions (each returns how long it takes) ─────────────────────────────
  const actions = {
    walk(steps = 1) {
      let t = 0;
      for (let s = 0; s < Math.max(1, Math.min(20, steps)); s++) {
        const [nx, nz] = front();
        if (!world.inBounds(nx, nz)) { say('Edge of the world!'); break; }
        const y = P.y;
        if (world.get(nx, y, nz) === 'lava') { move(nx, y, nz, 0.28); t += 0.28 + respawn('Ouch, lava! Back to spawn.', t + 0.28); break; }
        if (world.isOpen(nx, y, nz) && world.isOpen(nx, y + 1, nz)) {
          move(nx, y, nz, 0.28); t += 0.28;
          const deaths = tally.deaths;
          t += fall(t);
          if (tally.deaths !== deaths) break; // fell into lava or off the world: stop walking
          continue;
        }
        if (world.isSolid(nx, y, nz) && world.isOpen(nx, y + 1, nz) && world.isOpen(nx, y + 2, nz) && world.isOpen(P.x, y + 2, P.z)) {
          move(P.x, y + 1, P.z, 0.16); move(nx, y + 1, nz, 0.22); t += 0.38; // hop up a block
          continue;
        }
        say('Blocked! Mine it or jump up.');
        const [dx, dz] = DIRS[P.dir];
        segments.push({ to: { x: P.x + dx * 0.25, y: P.y, z: P.z + dz * 0.25 }, dur: 0.12 }, { to: { x: P.x, y: P.y, z: P.z }, dur: 0.12 });
        t += 0.24;
        break;
      }
      return t;
    },
    walk_back(steps = 1) {
      // Step backwards without turning round, like backing up in Minecraft
      const facing = P.dir;
      P.dir = (P.dir + 2) % 4;
      const t = actions.walk(steps);
      P.dir = facing;
      return t;
    },
    turn(delta) {
      P.dir = (P.dir + delta + 4) % 4;
      P.angle += delta * Math.PI / 2;
      segments.push({ to: { angle: P.angle }, dur: 0.18 });
      return 0.18;
    },
    jump() {
      const [nx, nz] = front();
      if (!world.isOpen(P.x, P.y + 2, P.z)) { say('No room to jump!'); return 0.2; }
      // A jump onto a one-block step in front climbs it
      if (world.isSolid(nx, P.y, nz) && world.isOpen(nx, P.y + 1, nz) && world.isOpen(nx, P.y + 2, nz)) return actions.walk(1);
      const y = P.y;
      segments.push({ to: { x: P.x, y: y + 1.1, z: P.z }, dur: 0.22 }, { to: { x: P.x, y, z: P.z }, dur: 0.22 });
      return 0.44;
    },
    mine(where = 'ahead') {
      const [fx, fz] = front();
      const trunk = [];
      if (where === 'trunk') for (let y = P.y + 2; world.get(P.x, y, P.z) === 'log'; y++) trunk.push([P.x, y, P.z]);
      const targets = where === 'trunk' ? trunk : where === 'up' ? [[P.x, P.y + 2, P.z]] : where === 'down' ? [[P.x, P.y - 1, P.z]] : [[fx, P.y, fz], [fx, P.y + 1, fz]];
      let t = 0;
      let any = false;
      for (const [x, y, z] of targets) {
        const type = world.get(x, y, z);
        if (!type || BLOCKS[type]?.fluid) continue;
        any = true;
        const def = BLOCKS[type] || {};
        if (!Number.isFinite(def.hardness)) { say(`${itemName(type)} is too hard to mine!`); t += 0.3; continue; }
        const tier = toolTier();
        if ((def.tool || 0) > tier) {
          say(`You need a ${itemName(PICKAXES[(def.tool || 1) - 1])} for that!`);
          t += 0.3;
          continue;
        }
        const dur = Math.max(0.3, def.hardness * (def.tool ? 1 : 0.8) / (1 + tier * 0.7));
        breakBlock(x, y, z, t, dur);
        t += dur + 0.05;
      }
      if (!any) { say(where === 'ahead' ? 'Nothing to mine there.' : 'Nothing there.'); return 0.25; }
      if (where === 'down') at(t, () => { const d = fall(); busyUntil = Math.max(busyUntil, clock + d); });
      return t + (where === 'down' ? 0.3 : 0);
    },
    place(where = 'ahead') {
      if (!selected || !(inventory[selected] > 0)) { say('Pick a block to place first!'); return 0.3; }
      const type = selected;
      if (where === 'down') { // pillar up: jump and put the block under your feet
        if (!world.isOpen(P.x, P.y + 2, P.z)) { say('No room above you!'); return 0.3; }
        const x = P.x; const y = P.y; const z = P.z;
        move(x, y + 1, z, 0.2);
        at(0.12, () => { world.set(x, y, z, type); world.rebuild(); });
        take(type); tally.placed += 1; emit('block_placed', { type });
        return 0.3;
      }
      const [fx, fz] = front();
      let y = P.y;
      if (world.isOpen(fx, y, fz) && world.isOpen(fx, y - 1, fz) && world.get(fx, y - 1, fz) !== 'lava' && world.get(fx, y, fz) !== 'lava') y -= 1; // bridge over a gap
      else if (world.get(fx, y - 1, fz) === 'lava' && world.isOpen(fx, y, fz)) y -= 1; // cover lava
      else if (!world.isOpen(fx, y, fz)) y += 1; // stack on top of the block ahead
      if (!world.inBounds(fx, fz) || (!world.isOpen(fx, y, fz) && world.get(fx, y, fz) !== 'lava')) { say('No space to place there.'); return 0.3; }
      world.set(fx, y, fz, type);
      world.rebuild();
      take(type); tally.placed += 1; emit('block_placed', { type });
      return 0.3;
    },
    select(item) {
      if (!(inventory[item] > 0)) { say(`You don't have any ${itemName(item)}.`); return 0.2; }
      selected = item;
      say(`Holding ${itemName(item)}`);
      return 0.15;
    },
    craft(recipe) {
      const r = RECIPES[recipe];
      if (!r) return 0.2;
      const missing = Object.entries(r.needs).filter(([k, n]) => (inventory[k] || 0) < n).map(([k, n]) => `${n - (inventory[k] || 0)} ${itemName(k)}`);
      if (missing.length) { say(`Need ${missing.join(' + ')}`); return 0.4; }
      if (r.station && !hasStation(r.station)) { say(`You need a ${itemName(r.station)} nearby!`); return 0.4; }
      Object.entries(r.needs).forEach(([k, n]) => take(k, n));
      Object.entries(r.gives).forEach(([k, n]) => { inventory[k] = (inventory[k] || 0) + n; tally.crafted[k] = (tally.crafted[k] || 0) + n; if (!selected && PLACEABLE.has(k)) selected = k; });
      const [k, n] = Object.entries(r.gives)[0];
      say(`${r.station === 'furnace' ? 'Smelted' : 'Crafted'} ${n > 1 ? `${n} ` : ''}${itemName(k)}!`);
      emit('crafted', { item: k });
      return 0.6;
    },
    say(text) { say(String(text).slice(0, 48)); return 0.1; },

    /** The tree in front — or walk to the nearest tree — and chop all of it. */
    chop_tree() {
      const [fx, fz] = front();
      let tr = null;
      const ly = [P.y, P.y + 1].find((y) => world.get(fx, y, fz) === 'log');
      if (ly !== undefined) {
        let y = ly; while (world.get(fx, y - 1, fz) === 'log') y--;
        let top = ly; while (world.get(fx, top + 1, fz) === 'log') top++;
        tr = { x: fx, y, z: fz, top };
      }
      let t = 0;
      if (!tr) {
        const list = trees();
        if (!list.length) { say('No trees left to chop! 🌳'); return 0.3; }
        const r = routeToTree(list);
        if (!r) { say("I can't reach any trees from here."); return 0.3; }
        t += walkPath(r.path);
        t += face(r.dir);
        tr = r.tr;
      }
      say('Timber! 🪓');
      return t + fell(tr, t);
    },
    /** A small house in front of you: walls with a door and windows, a flat roof and a lamp inside. */
    build_house() {
      const D = DIRS[P.dir]; const L = DIRS[(P.dir + 1) % 4];
      const at2 = (f, s) => [P.x + D[0] * f + L[0] * s, P.z + D[1] * f + L[1] * s];
      const [bx, bz] = at2(1, 0);
      const base = standAt(bx, bz, P.y);
      if (base === null) { say('No room to build here. Try a flatter spot.'); return 0.4; }
      const foot = [];
      for (let f = 1; f <= 4; f++) for (let s = -1; s <= 2; s++) {
        const [x, z] = at2(f, s);
        const g = standAt(x, z, base);
        if (!world.inBounds(x, z) || g === null || g < base - 1 || g > base) { say('Not enough flat space for a house here.'); return 0.4; }
        for (let y = base; y <= base + 2; y++) if (!world.isOpen(x, y, z)) { say('Something is in the way of the house.'); return 0.4; }
        foot.push({ f, s, x, z, g });
      }
      const cells = [];
      foot.forEach(({ f, s, x, z, g }) => {
        for (let y = g; y < base; y++) cells.push([x, y, z]); // level the floor
        const wall = f === 1 || f === 4 || s === -1 || s === 2;
        const door = f === 1 && s === 0;
        const window = (f === 2 || f === 3) && (s === -1 || s === 2);
        if (wall && !door) { cells.push([x, base, z]); if (!window) cells.push([x, base + 1, z]); }
      });
      const roof = foot.map(({ x, z }) => [x, base + 2, z]);
      const need = cells.length + roof.length - 1; // the lamp in the roof is free
      const got = takeBlocks(need, selected);
      if (!got.blocks) { say(`A house needs ${need} blocks. You have ${got.have}.`, 3); return 0.5; }
      const lamp = at2(2, 0);
      const plan = [...cells, ...roof].map(([x, y, z]) => (y === base + 2 && x === lamp[0] && z === lamp[1] ? [x, y, z, 'glowstone'] : [x, y, z, null]));
      let i = 0; plan.forEach((c) => { if (!c[3]) c[3] = got.blocks[i++]; });
      const t = putBlocks(plan, 0, 0.04);
      at(t, () => { tally.houses += 1; say('🏠 House built!', 3); emit('block_placed', { type: 'house' }); });
      return t + 0.2;
    },
    /** A tower of blocks in front of you, with a glowing lamp on top. */
    build_tower(height = 5) {
      const h = Math.max(2, Math.min(12, Math.round(height)));
      const [fx, fz] = front();
      const g = standAt(fx, fz, P.y);
      if (g === null) { say('No room for a tower there.'); return 0.4; }
      for (let y = g; y < g + h + 1; y++) if (!world.isOpen(fx, y, fz)) { say('Something is in the way of the tower.'); return 0.4; }
      const got = takeBlocks(h, selected);
      if (!got.blocks) { say(`A tower ${h} high needs ${h} blocks. You have ${got.have}.`, 3); return 0.5; }
      const plan = got.blocks.map((type, i) => [fx, g + i, fz, type]).concat([[fx, g + h, fz, 'glowstone']]);
      const t = putBlocks(plan, 0, 0.12);
      tally.placed -= 1; // the lamp is free
      at(t, () => { if (h >= 4) tally.towers += 1; say(h >= 4 ? '🗼 Watchtower built!' : 'Tower built!', 3); emit('block_placed', { type: 'tower' }); });
      return t + 0.2;
    },
    /** Plant a sapling on the ground in front: it grows into a tree. */
    plant_tree() {
      if (!(inventory.sapling > 0)) { say('You need a sapling. Chop a tree to get one!', 3); return 0.4; }
      const [fx, fz] = front();
      const g = standAt(fx, fz, P.y);
      const ground = g !== null ? world.get(fx, g - 1, fz) : null;
      if (g === null || !['grass', 'dirt', 'snow', 'sand'].includes(ground)) { say('Saplings need grass or dirt to grow on.'); return 0.4; }
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let y = g; y < g + 6; y++) {
        if (world.isSolid(fx + dx, y, fz + dz) && world.get(fx + dx, y, fz + dz) !== 'leaves') { say('Not enough room for a tree to grow here.'); return 0.4; }
      }
      take('sapling');
      at(0.5, () => { growTree(world, fx, g, fz, 4); world.rebuild(); burst(fx, g + 2, fz, 'leaves'); tally.planted += 1; say('🌳 A tree grew!'); });
      return 0.8;
    },
  };

  // ── Sensing ───────────────────────────────────────────────────────────────
  const blockAt = (where) => {
    if (where === 'trees') return trees().length ? 'some' : 'none';
    const [fx, fz] = front();
    const t = where === 'below' ? world.get(P.x, P.y - 1, P.z)
      : where === 'above' ? world.get(P.x, P.y + 2, P.z)
        : where === 'ahead_down' ? world.get(fx, P.y - 1, fz)
        : (world.get(fx, P.y, fz) || world.get(fx, P.y + 1, fz));
    return t || 'air';
  };
  const matches = (t, want) => {
    if (want === 'ore') return /_ore$/.test(t);
    if (want === 'wood') return t === 'log';
    if (want === 'gap') return t === 'air' || t === 'lava' || t === 'water';
    return t === want;
  };

  const checkGoal = () => {
    if (goalDone) return;
    const g = gen.goal;
    const [have, need] = goalProgress();
    let done = have >= need;
    if (g.kind === 'reach') done = [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]].some(([dx, dz]) => [-1, 0, 1].some((dy) => world.get(P.x + dx, P.y + dy, P.z + dz) === g.block));
    if (done) {
      goalDone = true;
      say('🎉 Goal complete!', 4);
      emit('goal');
      scene.userData.craftGoalDone = true;
    }
  };

  scene.userData.craft = {
    busy: () => clock < busyUntil,
    act(op, ...args) {
      const fn = actions[op];
      const d = fn ? fn(...args) : 0;
      busyUntil = clock + d;
      doing = { op, until: clock + d };
      return d;
    },
    blockAt,
    is: (where, want) => matches(blockAt(where), want),
    count: (item) => inventory[item] || 0,
    goalDone: () => goalDone,
    say,
    onEvent: (cb) => { onEvent = cb; },
    inventory: () => ({ ...inventory }),
    state: () => ({ ...P, selected, goalDone, tally: JSON.parse(JSON.stringify(tally)) }),
    // Test/debug handle: the world and a teleport that keeps the view in sync
    debug: {
      world,
      place(x, z, dir = P.dir, y = world.floorY(x, z)) {
        P.x = x; P.z = z; P.y = y; P.dir = dir; P.angle = dir * Math.PI / 2;
        segments.length = 0; Object.assign(view, { x: P.x, y: P.y, z: P.z, angle: P.angle });
      },
      give,
    },
    reset() {
      const needRebuild = world.dirty;
      world.cells = new Map(cellSnapshot);
      if (needRebuild) world.rebuild();
      else world.dirty = false;
      inventory = { ...gen.inventory };
      selected = Object.keys(inventory).find((k) => PLACEABLE.has(k)) || null;
      Object.assign(tally, { collected: {}, crafted: {}, placed: 0, mined: 0, deaths: 0, houses: 0, towers: 0, planted: 0 });
      goalDone = false;
      treeCount = { at: -1, n: treesAtStart };
      scene.userData.craftGoalDone = false;
      P.x = gen.spawn.x; P.z = gen.spawn.z; P.y = world.floorY(P.x, P.z); P.dir = gen.spawn.dir; P.angle = P.dir * Math.PI / 2;
      Object.assign(view, { x: P.x, y: P.y, z: P.z, angle: P.angle });
      segments.length = 0; timeline.length = 0; busyUntil = 0; hudKey = '';
      doing = { op: null, until: 0 };
    },
  };

  scene.userData._craftCleanup = () => { hud.remove(); delete globalThis.__bbCraftGoal; };

  // ── Camera: never inside blocks ───────────────────────────────────────────
  // Like Minecraft's third-person view, the camera slides in when a solid
  // block sits between it and the player; leaves in the way fade see-through.
  const _head = new THREE.Vector3();
  const _p = new THREE.Vector3();
  let leavesFaded = false;
  scene.onBeforeRender = (renderer, sc, camera) => {
    if (!camera?.isPerspectiveCamera) return;
    _head.set(view.x, view.y + 1.4, view.z);
    let hitLeaves = false;
    let keep = 1;
    for (let s = 0.06; s <= 1.001; s += 0.03) {
      _p.lerpVectors(_head, camera.position, s);
      const t = world.get(Math.round(_p.x), Math.floor(_p.y), Math.round(_p.z));
      if (!t || BLOCKS[t]?.fluid) continue;
      if (t === 'leaves') { hitLeaves = true; continue; }
      keep = Math.max(0.08, s - 0.07);
      break;
    }
    if (keep < 1) {
      camera.position.lerpVectors(_head, camera.position, keep);
      const [dx, dz] = DIRS[P.dir];
      camera.lookAt(_head.x + dx * 2, _head.y - 0.4, _head.z + dz * 2);
    }
    if (hitLeaves !== leavesFaded) {
      leavesFaded = hitLeaves;
      const m = blockMaterial('leaves');
      m.transparent = hitLeaves; m.opacity = hitLeaves ? 0.3 : 1; m.depthWrite = !hitLeaves; m.needsUpdate = true;
    }
  };

  // ── Per-frame update ──────────────────────────────────────────────────────
  let first = true;
  let crafter = null;
  let crafterScale = 1;
  let swing = 0;
  scene.userData.movers = [{
    update(t, dt, rs) {
      if (first) {
        first = false;
        scene.traverse((o) => { if (o.isLight && !o.userData.craftLight) o.visible = false; });
      }
      // The robot joins the scene a moment after the arena, so look for it until it appears.
      // Measure it at even scale and size it a little under two blocks tall.
      if (!crafter) {
        crafter = scene.children.find((c) => c.userData?.chassisId === 'blockbot') || null;
        if (crafter) {
          crafter.scale.set(1, 1, 1);
          crafter.updateMatrixWorld(true);
          const h = new THREE.Box3().setFromObject(crafter).getSize(new THREE.Vector3()).y;
          crafterScale = h > 0.2 ? 1.45 / h : 1;
          crafter.userData.baseScaleY = crafterScale; // so the lab's idle bob keeps these proportions
        }
      }
      if (crafter) {
        crafter.scale.setScalar(crafterScale); // keep proportions even every frame
        // Limbs: legs and arms swing while walking; the pickaxe arm chops while mining or placing
        const limbs = crafter.userData.limbs;
        if (limbs) {
          const busy = clock < doing.until;
          const walking = segments.length > 0 && !(busy && (doing.op === 'mine' || doing.op === 'place'));
          swing += dt * (walking ? 11 : busy ? 14 : 0);
          const walkAmt = walking ? 0.7 : 0;
          const k = 1 - Math.exp(-dt * 14);
          limbs.legs.forEach((l, i) => { l.rotation.x += ((i ? -1 : 1) * Math.sin(swing) * walkAmt - l.rotation.x) * k; });
          limbs.arms.forEach((a, i) => {
            let target = (i ? 1 : -1) * Math.sin(swing) * walkAmt * 0.8;
            if (busy && i === 1 && (doing.op === 'mine' || doing.op === 'place' || doing.op === 'craft')) target = -1.2 - Math.abs(Math.sin(swing)) * 0.9;
            a.rotation.x += (target - a.rotation.x) * k;
          });
        }
      }
      mountHud();
      clock += dt;
      // Timed effects
      for (let i = timeline.length - 1; i >= 0; i--) if (timeline[i].t <= clock) { const e = timeline.splice(i, 1)[0]; e.fn(); }
      // Movement tweens
      if (segments.length) {
        const s = segments[0];
        if (!s.from) s.from = { ...view }, s.k = 0;
        s.k = Math.min(1, s.k + dt / s.dur);
        const e = s.k * s.k * (3 - 2 * s.k);
        ['x', 'y', 'z', 'angle'].forEach((key) => { if (s.to[key] !== undefined) view[key] = s.from[key] + (s.to[key] - s.from[key]) * e; });
        if (s.k >= 1) segments.shift();
      }
      rs.x = view.x; rs.y = view.y; rs.z = view.z; rs.angle = view.angle;
      rs.bobPhase = (rs.bobPhase || 0) + (segments.length ? dt * 9 : 0);
      const [gHave, gNeed] = goalProgress();
      rs.collectedItems = gHave;
      // The Mission panel shows this level's real goal (not a fixed label per world)
      globalThis.__bbCraftGoal = { need: gNeed, label: goalLabel(gen.goal, gNeed) };
      if (goalDone) rs.done = true; // lets the lab award the mission
      // Selection outline on the block ahead
      const [fx, fz] = front();
      const oy = world.isSolid(fx, P.y, fz) ? P.y : world.isSolid(fx, P.y + 1, fz) ? P.y + 1 : null;
      outline.visible = oy !== null && !segments.length;
      if (oy !== null) outline.position.set(fx, oy + 0.5, fz);
      // Particles and flying drops
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.userData.life -= dt;
        b.userData.v.y -= 12 * dt;
        b.position.addScaledVector(b.userData.v, dt);
        if (b.userData.life <= 0) { scene.remove(b); bits.splice(i, 1); }
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.userData.t += dt / 0.5;
        const target = new THREE.Vector3(view.x, view.y + 1, view.z);
        d.position.lerpVectors(d.userData.from, target, Math.min(1, d.userData.t));
        d.position.y += Math.sin(Math.min(1, d.userData.t) * Math.PI) * 0.6;
        d.rotation.y += dt * 6;
        d.scale.setScalar(Math.max(0.2, 1 - d.userData.t * 0.6));
        if (d.userData.t >= 1) { scene.remove(d); drops.splice(i, 1); }
      }
      lava.offset.x = (lava.offset.x + dt * 0.05) % 1;
      if (scene.userData._craftClouds) scene.userData._craftClouds.position.x = ((t * 0.4) % 40) - 20;
      if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) $('.msg').style.opacity = 0; }
      checkGoal();
      drawHud();
      if (scene.userData.craftSimActive) scene.userData.craftRuntime?.tick(dt);
    },
  }];
}
