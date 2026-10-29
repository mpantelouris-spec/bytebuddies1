/**
 * ArmWorkshop — the Robot Arm's missions.
 *
 * The arm is bolted to the middle of a round workbench. Everything it needs is
 * laid out in a ring the claw can reach, so each block does something you can
 * see: Rotate base points the claw, Lower arm / Raise arm move it down and up,
 * Grip picks up what is under the claw and Release puts it down.
 *
 * Angles are in degrees, measured the way Rotate base turns (positive = left
 * as seen from the camera behind the arm). 0° is straight ahead.
 */
import * as THREE from 'three';
import { initFamilyScene, arenaMover } from '../ArenaBuilderCore.js';

export const ARM_REACH = 2.0;          // claw distance from the base (world units)
const PICK_TOL = 0.9;                 // how close the claw must be to grab or drop
import { ARM_TIER_TASKS } from '../../data/tier-levels/arm-tiers.js';
import { getTierMood } from '../../data/tier-levels/index.js';
import { tint } from '../../data/tier-levels/moods.js';

const LOW_LIFT = 0.25;                 // below this the arm counts as lowered

/* ─── mission layouts ───────────────────────────────────────────────────── */

const COL = { red: 0xef4444, blue: 0x3b82f6, yellow: 0xfacc15, green: 0x22c55e, purple: 0xa855f7, orange: 0xf97316 };

const it = (id, kind, angle, extra = {}) => ({ id, kind, angle, ...extra });
const tg = (id, kind, angle, accepts, extra = {}) => ({ id, kind, angle, accepts, cap: 1, ...extra });

export const ARM_TASKS = [
  { // 1 Colour Cube Sorter
    items: [it('c1', 'cube', 0, { color: 'red' }), it('c2', 'cube', -45, { color: 'blue' })],
    targets: [tg('t1', 'tray', 90, ['c1'], { color: 'red' }), tg('t2', 'tray', -100, ['c2'], { color: 'blue' })],
  },
  { // 2 Block Tower
    items: [it('b1', 'block', 0, { color: 'red', letter: 'A' }), it('b2', 'block', 45, { color: 'yellow', letter: 'B' }), it('b3', 'block', -45, { color: 'blue', letter: 'C' })],
    targets: [tg('tower', 'towerBase', 135, ['b1', 'b2', 'b3'], { cap: 3, stack: true })],
  },
  { // 3 Paint Pots
    items: [it('p1', 'pot', 0, { color: 'red' }), it('p2', 'pot', -45, { color: 'yellow' }), it('p3', 'pot', 45, { color: 'blue' })],
    targets: [tg('e1', 'easel', 90, ['p1'], { color: 'red' }), tg('e2', 'easel', -100, ['p2'], { color: 'yellow' }), tg('e3', 'easel', 145, ['p3'], { color: 'blue' })],
  },
  { // 4 Recycling
    items: [it('r1', 'paper', 0), it('r2', 'bottle', 45), it('r3', 'can', -45)],
    targets: [tg('bin1', 'bin', 90, ['r1'], { color: 'blue', label: 'PAPER' }), tg('bin2', 'bin', 140, ['r2'], { color: 'yellow', label: 'PLASTIC' }), tg('bin3', 'bin', -100, ['r3'], { color: 'red', label: 'METAL' })],
  },
  { // 5 Cake
    sources: [{ id: 'bowl', kind: 'bowl', angle: 0, give: 'cherry', count: 3 }],
    targets: [tg('k1', 'cupcake', 90, ['cherry']), tg('k2', 'cupcake', 135, ['cherry']), tg('k3', 'cupcake', -90, ['cherry'])],
  },
  { // 6 Music Bells
    bells: [{ id: 'bell1', angle: 60, n: 3, color: 'red' }, { id: 'bell2', angle: 20, n: 1, color: 'yellow' }, { id: 'bell3', angle: -20, n: 4, color: 'green' }, { id: 'bell4', angle: -60, n: 2, color: 'blue' }],
  },
  { // 7 Seeds
    sources: [{ id: 'bag', kind: 'seedBag', angle: 0, give: 'seed', count: 99 }],
    targets: [tg('f1', 'flowerPot', 60, ['seed']), tg('f2', 'flowerPot', 120, ['seed']), tg('f3', 'flowerPot', -90, ['seed'])],
  },
  { // 8 Marbles
    sources: [{ id: 'cupA', kind: 'cup', angle: -60, give: 'marble', count: 3, color: 'blue' }],
    targets: [tg('cupB', 'cup', 60, ['marble'], { cap: 3, color: 'green' })],
  },
  { // 9 Toy car
    items: [it('w1', 'wheel', 0), it('w2', 'wheel', -45), it('s1', 'sticker', 45)],
    targets: [tg('car', 'car', 100, ['w1', 'w2', 's1'], { cap: 3 })],
  },
  { // 10 Finale: sort, stack, then ring
    items: [it('c1', 'cube', 0, { color: 'red' }), it('b1', 'block', -45, { color: 'yellow', letter: 'A' })],
    targets: [tg('t1', 'tray', 90, ['c1'], { color: 'red' }), tg('tower', 'towerBase', 140, ['b1'], { stack: true })],
    bells: [{ id: 'bellF', angle: -100, n: 1, color: 'green', last: true }],
  },
];

export function getArmTask(modeIndex = 1) {
  // Modes 11–50: the tier workshops (data/tier-levels/arm-tiers.js)
  const tier = Number(modeIndex) > 10 ? ARM_TIER_TASKS[Number(modeIndex) - 11] : null;
  if (tier) return tier.task;
  return ARM_TASKS[Math.max(1, Math.min(10, Math.floor(Number(modeIndex) || 1))) - 1];
}

/* ─── the block program that solves a mission (for starters and tests) ──── */

/** Moves in order: { from: angle, to: angle } carries, or { ring: angle } taps. */
function plan(task) {
  const steps = [];
  (task.items || []).forEach((item) => {
    const t = task.targets.find((x) => x.accepts.includes(item.id));
    steps.push({ from: item.angle, to: t.angle });
  });
  (task.sources || []).forEach((src) => {
    task.targets.filter((t) => t.accepts.includes(src.give)).forEach((t) => {
      for (let k = 0; k < Math.min(t.cap, src.count); k++) steps.push({ from: src.angle, to: t.angle });
    });
  });
  [...(task.bells || [])].sort((a, b) => a.n - b.n).forEach((b) => steps.push({ ring: b.angle }));
  return steps;
}

export function solveArmTask(modeIndex = 1) {
  const blocks = []; let at = 0; let lowered = true;
  const turn = (to) => { const d = (((to - at) % 360) + 360) % 360; if (d) blocks.push({ id: 'rotate_joint', degrees: d }); at = to; };
  plan(getArmTask(modeIndex)).forEach((s) => {
    if (s.ring != null) {
      if (!lowered) { turn(s.ring); } else { blocks.push({ id: 'arm_extend' }); lowered = false; turn(s.ring); }
      blocks.push({ id: 'arm_retract' }, { id: 'grip' }, { id: 'arm_extend' });
      return;
    }
    turn(s.from);
    if (!lowered) blocks.push({ id: 'arm_retract' });
    blocks.push({ id: 'grip' }, { id: 'arm_extend' });
    lowered = false;
    turn(s.to);
    blocks.push({ id: 'release' });
  });
  return blocks;
}

const LABEL = { rotate_joint: 'Rotate base', arm_extend: 'Raise arm', arm_retract: 'Lower arm', grip: 'Grip', release: 'Release' };

/** The first job of the mission as starter blocks; kids do the rest. */
export function getArmStarterScript(modeIndex = 1, full = false) {
  const all = solveArmTask(modeIndex);
  let blocks = all;
  const tier = Number(modeIndex) > 10 ? ARM_TIER_TASKS[Number(modeIndex) - 11]?.tier : null;
  if (!full && (tier === 'Hard' || tier === 'Advanced')) {
    // Hard: only the first turn and grip. Advanced: just the start block.
    const firstGrip = all.findIndex((b) => b.id === 'grip');
    blocks = tier === 'Hard' && firstGrip >= 0 ? all.slice(0, firstGrip + 1) : [];
  } else if (!full) {
    // Keep everything up to the first Release (or the first bell tap)
    const cut = all.findIndex((b, i) => b.id === 'release' || (b.id === 'grip' && getArmTask(modeIndex).bells && !getArmTask(modeIndex).items && !getArmTask(modeIndex).sources && i > 0));
    blocks = cut >= 0 ? all.slice(0, cut + 1) : all;
  }
  const b = (x) => ({ id: x.id, label: LABEL[x.id], paramValues: x.id === 'rotate_joint' ? { degrees: x.degrees } : x.id.startsWith('arm_') ? { dist: 20 } : {} });
  const body = blocks.map(b);
  // Start lowered: the claw already sits over the first thing, so lead with Lower arm like before
  if (body[0]?.id === 'grip') body.unshift({ id: 'arm_retract', label: 'Lower arm', paramValues: { dist: 20 } });
  return [{ id: 'when_start', label: 'When START clicked', paramValues: {} }, ...body];
}

/* ─── building the workshop ─────────────────────────────────────────────── */

const m = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.6, metalness: o.metal ?? 0, emissive: o.emissive ?? 0, emissiveIntensity: o.ei ?? 0, transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1 });

function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

function tagSprite(text, bg = '#ffffff', fg = '#0f172a', w = 0.9) {
  const t = tex(256, 128, (c, W, H) => { c.fillStyle = bg; c.beginPath(); c.roundRect(4, 4, W - 8, H - 8, 40); c.fill(); c.fillStyle = fg; c.font = 'bold 70px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, W / 2, H / 2 + 4); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(w, w / 2, 1); return s;
}

/** Where an angle on the bench is, in world space (base at the origin, arm facing -z). */
export function benchPoint(angleDeg, r = ARM_REACH) {
  const a = Math.PI + (angleDeg * Math.PI) / 180;
  return { x: Math.sin(a) * r, z: Math.cos(a) * r };
}

function itemMesh(kind, o = {}) {
  const g = new THREE.Group(); const c = COL[o.color] ?? 0xffffff;
  if (kind === 'cube') { const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), m(c)); b.position.y = 0.21; g.add(b); }
  else if (kind === 'block') {
    const t = tex(128, 128, (x, W, H) => { x.fillStyle = `#${c.toString(16).padStart(6, '0')}`; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.font = 'bold 90px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.letter || 'A', W / 2, H / 2 + 6); });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); b.position.y = 0.22; g.add(b);
  } else if (kind === 'pot') {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.34, 16), m(0xf1f5f9)); b.position.y = 0.17; g.add(b);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 16), m(c)); p.position.y = 0.33; g.add(p);
    const drip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.02), m(c)); drip.position.set(0, 0.24, 0.19); g.add(drip);
  } else if (kind === 'paper') { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), m(0xf8fafc, { rough: 1 })); b.position.y = 0.2; g.add(b); }
  else if (kind === 'bottle') {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.4, 12), m(0x38bdf8, { opacity: 0.8 })); b.position.y = 0.2; g.add(b);
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.1, 10), m(0x0ea5e9)); n.position.y = 0.45; g.add(n);
  } else if (kind === 'can') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16), m(0x94a3b8, { metal: 0.8, rough: 0.3 })); b.position.y = 0.15; g.add(b); }
  else if (kind === 'cherry') {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), m(0xdc2626, { rough: 0.3 })); b.position.y = 0.13; g.add(b);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 5), m(0x15803d)); st.position.set(0.02, 0.3, 0); st.rotation.z = 0.3; g.add(st);
  } else if (kind === 'seed') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), m(0x92400e)); b.scale.y = 0.7; b.position.y = 0.06; g.add(b); }
  else if (kind === 'marble') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), m(0x60a5fa, { rough: 0.1, metal: 0.2, emissive: 0x1d4ed8, ei: 0.2 })); b.position.y = 0.13; g.add(b); }
  else if (kind === 'wheel') { const b = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.07, 10, 20), m(0x111827)); b.rotation.y = Math.PI / 2; b.position.y = 0.22; g.add(b); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 12), m(0xe5e7eb, { metal: 0.6 })); hub.rotation.z = Math.PI / 2; hub.position.y = 0.22; g.add(hub); }
  else if (kind === 'sticker') { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 5), m(0xfacc15, { emissive: 0xfacc15, ei: 0.2 })); s.position.y = 0.02; g.add(s); }
  g.userData.kind = kind;
  return g;
}

function targetMesh(t) {
  const g = new THREE.Group(); const c = COL[t.color] ?? 0x94a3b8;
  if (t.kind === 'tray') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.8), m(c)); base.position.y = 0.03; g.add(base);
    [[0, 0.38, 0.8, 0.04], [0, -0.38, 0.8, 0.04], [0.38, 0, 0.04, 0.8], [-0.38, 0, 0.04, 0.8]].forEach(([x, z, w, d]) => { const w2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, d), m(c)); w2.position.set(x, 0.1, z); g.add(w2); });
  } else if (t.kind === 'towerBase') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.6), m(0x64748b)); b.position.y = 0.03; g.add(b);
    const ghost = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46 * t.cap, 0.46), m(0xffffff, { opacity: 0.18 })); ghost.position.y = 0.06 + (0.46 * t.cap) / 2; g.add(ghost);
  } else if (t.kind === 'easel') {
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.05), m(0xffffff)); board.position.set(0, 0.75, -0.2); board.rotation.x = -0.15; g.add(board);
    const splash = new THREE.Mesh(new THREE.CircleGeometry(0.22, 10), m(c)); splash.position.set(0, 0.78, -0.17); splash.rotation.x = -0.15; g.add(splash);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.05), m(0x92400e)); leg.position.set(0, 0.5, -0.3); g.add(leg);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.45), m(0xd97706)); shelf.position.y = 0.03; g.add(shelf);
  } else if (t.kind === 'bin') {
    const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.6, 16, 1, true), m(c)); bin.material.side = THREE.DoubleSide; bin.position.y = 0.3; g.add(bin);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), m(c)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.02; g.add(bottom);
    if (t.label) { const s = tagSprite(t.label, `#${c.toString(16).padStart(6, '0')}`, '#ffffff', 0.9); s.position.y = 0.95; g.add(s); }
  } else if (t.kind === 'cupcake') {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.24, 14), m(0xf472b6)); cup.position.y = 0.12; g.add(cup);
    const icing = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 10), m(0xfff1f2)); icing.scale.y = 0.6; icing.position.y = 0.28; g.add(icing);
  } else if (t.kind === 'flowerPot') {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.32, 14), m(0xc2410c)); pot.position.y = 0.16; g.add(pot);
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 14), m(0x5b3a1e)); soil.position.y = 0.31; g.add(soil);
  } else if (t.kind === 'cup') {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.3, 18, 1, true), m(c, { opacity: 0.85 })); cup.material.side = THREE.DoubleSide; cup.position.y = 0.15; g.add(cup);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.26, 18), m(c)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.02; g.add(bottom);
  } else if (t.kind === 'car') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.9), m(0xef4444)); body.position.y = 0.26; g.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.45), m(0xfca5a5)); cab.position.set(0, 0.47, -0.05); g.add(cab);
    [[-0.28, 0.3], [0.28, 0.3], [-0.28, -0.3], [0.28, -0.3]].forEach(([x, z], i) => { if (i < 2) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.06, 8, 16), m(0x111827)); w.rotation.y = Math.PI / 2; w.position.set(x, 0.16, z); g.add(w); } else { const ghost = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.06, 8, 16), m(0xffffff, { opacity: 0.3 })); ghost.rotation.y = Math.PI / 2; ghost.position.set(x, 0.16, z); g.add(ghost); } });
  }
  return g;
}

function sourceMesh(src) {
  const g = new THREE.Group();
  if (src.kind === 'bowl') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m(0xfef3c7)); b.material.side = THREE.DoubleSide; b.rotation.x = Math.PI; b.position.y = 0.34; g.add(b); }
  else if (src.kind === 'seedBag') { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.25), m(0xd6b47a)); b.position.y = 0.3; g.add(b); const s = tagSprite('SEEDS', '#65a30d', '#fff', 0.8); s.position.y = 0.95; g.add(s); }
  else if (src.kind === 'cup') { const t = targetMesh({ kind: 'cup', color: src.color }); g.add(t); }
  return g;
}

function bellMesh(b) {
  const g = new THREE.Group(); const c = COL[b.color] ?? 0xfacc15;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 8), m(0x64748b)); post.position.y = 0.25; g.add(post);
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.26, 0.32, 16), m(c, { metal: 0.5, rough: 0.3, emissive: c, ei: 0.1 })); bell.position.y = 0.66; g.add(bell);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), m(c, { metal: 0.5 })); top.position.y = 0.84; g.add(top);
  const num = tagSprite(String(b.n), '#ffffff', '#0f172a', 0.6); num.position.y = 1.25; g.add(num);
  g.userData.bell = bell;
  return g;
}

/** Workshop rooms for modes 11–50, matched to each level's job (the original ten use the first). */
const ROOMS = {
  base: { wall: 0xe0f2fe, floor: '#e9d5b4', line: '#d6bf98', rim: 0x6366f1, peg: '#d4a373', window: 0xbae6fd },
  sort: { wall: 0xcbd5e1, floor: '#9ca3af', line: '#6b7280', rim: 0xf97316, peg: '#94a3b8', window: 0xfde68a },
  tower: { wall: 0xfde68a, floor: '#fca5a5', line: '#f87171', rim: 0xef4444, peg: '#fbbf24', window: 0xbae6fd },
  paint: { wall: 0xfce7f3, floor: '#c08457', line: '#9a6337', rim: 0xec4899, peg: '#f9a8d4', window: 0xfbcfe8 },
  recycle: { wall: 0xdcfce7, floor: '#6b7280', line: '#4b5563', rim: 0x16a34a, peg: '#86efac', window: 0xbbf7d0 },
  cherry: { wall: 0xffe4e6, floor: '#f5e1c8', line: '#e8c9a4', rim: 0xf43f5e, peg: '#fda4af', window: 0xfecdd3 },
  bells: { wall: 0xede9fe, floor: '#7c4a2d', line: '#5b341f', rim: 0x7c3aed, peg: '#c4b5fd', window: 0xddd6fe },
  seeds: { wall: 0xd9f99d, floor: '#8b5a2b', line: '#6b4220', rim: 0x65a30d, peg: '#bef264', window: 0xecfccb },
  marble: { wall: 0xe0f2fe, floor: '#f1f5f9', line: '#cbd5e1', rim: 0x0ea5e9, peg: '#7dd3fc', window: 0xa5f3fc },
  car: { wall: 0xe5e7eb, floor: '#374151', line: '#1f2937', rim: 0xfacc15, peg: '#fcd34d', window: 0xbae6fd },
};

function roomStyle(mode) {
  const tier = Number(mode) > 10 ? ARM_TIER_TASKS[Number(mode) - 11] : null;
  if (!tier) return { ...ROOMS.base, mood: null };
  const job = String(tier.jobs).split('×')[0];
  return { ...(ROOMS[job] || ROOMS.base), mood: getTierMood('robotarm', tier) };
}

function room(root, st = { ...ROOMS.base, mood: null }) {
  const T = (c, k = 1) => tint(c, st.mood, k);
  // Floor, walls with pegboard, windows and shelves
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({
    map: tex(256, 256, (c, W, H) => { c.fillStyle = T(st.floor, 0.6); c.fillRect(0, 0, W, H); c.strokeStyle = T(st.line, 0.6); c.lineWidth = 3; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(0, (i * H) / 8); c.lineTo(W, (i * H) / 8); c.stroke(); } }), roughness: 0.9,
  }));
  floor.material.map.wrapS = floor.material.map.wrapT = THREE.RepeatWrapping; floor.material.map.repeat.set(6, 6);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; root.add(floor);
  const wallMat = m(T(st.wall), { rough: 0.95 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), wallMat); back.position.set(0, 5.4, -9); root.add(back);
  [-1, 1].forEach((s) => { const side = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), wallMat); side.rotation.y = -s * Math.PI / 2; side.position.set(s * 12, 5.4, 0); root.add(side); });
  const peg = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.2), new THREE.MeshStandardMaterial({ map: tex(256, 96, (c, W, H) => { c.fillStyle = T(st.peg); c.fillRect(0, 0, W, H); c.fillStyle = '#8b5e34'; for (let x = 8; x < W; x += 16) for (let y = 8; y < H; y += 16) { c.beginPath(); c.arc(x, y, 2.2, 0, Math.PI * 2); c.fill(); } }) }));
  peg.position.set(0, 2.6, -8.95); root.add(peg);
  const tools = [0xef4444, 0x3b82f6, 0xfacc15, 0x22c55e, 0xa855f7];
  tools.forEach((c, i) => { const t = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1 + (i % 2) * 0.5, 0.08), m(c)); t.position.set(-3.4 + i * 1.7, 2.6, -8.85); root.add(t); });
  [-6, 6].forEach((x) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), m(T(st.window), { emissive: T(st.window), ei: 0.6 })); win.position.set(x, 4.2, -8.95); root.add(win);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 0.1), m(0xffffff)); frame.position.set(x, 4.2, -8.9); root.add(frame);
  });
  [-1, 1].forEach((s) => {
    for (let k = 0; k < 3; k++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 0.8), m(0xffffff)); shelf.position.set(s * 8, -0.6 + k * 1.3, -7.5); root.add(shelf);
      for (let q = 0; q < 4; q++) { const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), m(tools[(q + k + (s > 0 ? 2 : 0)) % tools.length])); box.position.set(s * 8 - 1.1 + q * 0.7, -0.3 + k * 1.3, -7.5); root.add(box); }
    }
  });
}

function bench(root, st = ROOMS.base) {
  const top = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.2, 48), new THREE.MeshStandardMaterial({
    map: tex(256, 256, (c, W, H) => { const g = c.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W / 2); g.addColorStop(0, '#f8fafc'); g.addColorStop(1, '#e2e8f0'); c.fillStyle = g; c.fillRect(0, 0, W, H); }), roughness: 0.6,
  }));
  top.position.y = -0.1; top.receiveShadow = true; root.add(top);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.06, 8, 64), m(st.rim)); rim.rotation.x = Math.PI / 2; root.add(rim);
  const reach = new THREE.Mesh(new THREE.RingGeometry(ARM_REACH - 0.04, ARM_REACH + 0.04, 64), new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.5 }));
  reach.rotation.x = -Math.PI / 2; reach.position.y = 0.01; root.add(reach);
  [0, 1, 2, 3].forEach((i) => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.5, 10), m(0x475569)); const a = (i / 4) * Math.PI * 2 + Math.PI / 4; leg.position.set(Math.cos(a) * 2.4, -0.95, Math.sin(a) * 2.4); root.add(leg); });
}

/* ─── public: build ─────────────────────────────────────────────────────── */

export function isArmWorkshopChallenge(challenge, robotConfig) {
  const id = challenge?.chassisId || robotConfig?.chassisId;
  return Boolean(challenge?.isChassisMode && id === 'robotarm');
}

export function buildArmWorkshop(scene, challenge) {
  const mode = Math.max(1, Math.min(50, Number(challenge?.modeIndex) || 1));
  const task = getArmTask(mode);
  initFamilyScene(scene, [1.0, 0.95, 1.0]);
  const old = scene.getObjectByName('ArmWorkshop'); if (old) scene.remove(old);
  const root = new THREE.Group(); root.name = 'ArmWorkshop'; scene.add(root);
  const st = roomStyle(mode);
  room(root, st); bench(root, st);
  const bg = tint(st.wall, st.mood);
  scene.background = new THREE.Color(bg);
  scene.fog = new THREE.Fog(bg, 18, 40);
  const hemi = new THREE.HemisphereLight(tint(0xffffff, st.mood, 0.5), 0xd6bf98, 0.8 * (st.mood?.light ?? 1)); root.add(hemi);
  const key = new THREE.DirectionalLight(tint(0xffffff, st.mood, 0.7), 0.9 * (st.mood?.light ?? 1)); key.position.set(3, 8, 5); root.add(key);

  const place = (g, angle, r = ARM_REACH) => { const p = benchPoint(angle, r); g.position.set(p.x, 0, p.z); g.rotation.y = Math.atan2(p.x, p.z) + Math.PI; root.add(g); return g; };

  const ws = {
    mode, task, root, items: [], targets: [], sources: [], bells: [], melody: [], rung: [], holding: null, lastT: 0,
    hint: '', won: false,
  };
  (task.targets || []).forEach((t) => { ws.targets.push({ ...t, mesh: place(targetMesh(t), t.angle), held: [] }); });
  (task.items || []).forEach((i) => { const mesh = place(itemMesh(i.kind, i), i.angle); ws.items.push({ ...i, mesh, home: mesh.position.clone(), placedIn: null }); });
  (task.sources || []).forEach((s) => { ws.sources.push({ ...s, mesh: place(sourceMesh(s), s.angle), left: s.count, made: [] }); });
  (task.bells || []).forEach((b) => { ws.bells.push({ ...b, mesh: place(bellMesh(b), b.angle, ARM_REACH + 0.1) }); });
  ws.melody = [...ws.bells].sort((a, b) => a.n - b.n).map((b) => b.id);

  // A bouncing arrow over the next thing to do
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 12), m(0xfacc15, { emissive: 0xfacc15, ei: 0.6 }));
  arrow.rotation.x = Math.PI; root.add(arrow); ws.arrow = arrow;
  arenaMover(scene, (t) => {
    const aim = nextAim(ws);
    arrow.visible = aim != null && !ws.won;
    if (aim != null) { const p = benchPoint(aim.angle, aim.r ?? ARM_REACH); arrow.position.set(p.x, (aim.h ?? 1.0) + 0.25 + Math.abs(Math.sin(t * 3)) * 0.2, p.z); }
    ws.bells.forEach((b) => { if (b._ring > 0) { b._ring -= 0.016; b.mesh.userData.bell.rotation.z = Math.sin(b._ring * 30) * b._ring * 0.6; } });
  });

  const ud = scene.userData;
  ud.armWorkshop = ws;
  ud.customSky = true; ud.customDecor = true; ud.skipMissionWorld = true; ud.missionWorldKit = false;
  ud.aerialSpawn = { x: 0, y: 0, z: 0, angle: Math.PI };
  ud.spawnAltitude = 0; ud.groundY = 0;
  ud.chassisCheckpoints = [];
  ud.chassisCheckpointTotal = totalJobs(ws);
  ud.finishZone = null;
  ud.obstacles = [];
  // Fixed camera behind the arm, looking over the bench
  ud.fixedCamPreset = { x: 3.4, y: 5.4, z: 5.6, lookX: -0.2, lookY: 0.3, lookZ: -0.6, fov: 48 };
  ud.arenaBounds = { cx: 0, cz: 0, spanX: 20, spanZ: 20, camMaxX: 20, camMinZ: -20, camMaxZ: 20, flappyNoIntro: true };
  ud.raceVisual = { bloom: 0.12, threshold: 0.95, radius: 0.15 };
  return true;
}

function totalJobs(ws) {
  return ws.items.length + ws.targets.filter((t) => t.accepts.some((a) => ws.sources.some((s) => s.give === a))).reduce((n, t) => n + t.cap, 0) + ws.bells.length;
}
function doneJobs(ws) {
  const placed = ws.items.filter((i) => i.placedIn && ws.targets.find((t) => t.id === i.placedIn)?.accepts.includes(i.id)).length;
  const made = ws.sources.reduce((n, s) => n + s.made.filter((x) => x.placedIn).length, 0);
  return placed + made + ws.rung.length;
}

/** What the claw should go to next (for the arrow and Move to marker). */
function nextAim(ws) {
  if (ws.holding) {
    const kindKey = ws.holding.fromSource ? ws.holding.kind : ws.holding.id;
    const t = ws.targets.find((x) => x.accepts.includes(kindKey) && x.held.length < x.cap);
    return t ? { angle: t.angle, h: 0.9 } : null;
  }
  const item = ws.items.find((i) => !i.placedIn);
  if (item) return { angle: item.angle, h: 0.7 };
  const src = ws.sources.find((s) => s.left > 0 && ws.targets.some((t) => t.accepts.includes(s.give) && t.held.length < t.cap));
  if (src) return { angle: src.angle, h: 0.8 };
  const othersDone = ws.items.every((i) => i.placedIn);
  const bell = ws.bells.find((b) => b.id === ws.melody[ws.rung.length]);
  if (bell && (!bell.last || othersDone)) return { angle: bell.angle, r: ARM_REACH + 0.1, h: 1.4 };
  return null;
}

export function armAimAngle(scene) {
  const ws = scene.userData.armWorkshop; if (!ws) return null;
  const aim = nextAim(ws); return aim ? aim.angle : null;
}

function resetWorkshop(ws) {
  ws.items.forEach((i) => { i.placedIn = null; i.mesh.position.copy(i.home); i.mesh.rotation.set(0, i.mesh.rotation.y, 0); });
  ws.targets.forEach((t) => { t.held = []; });
  ws.sources.forEach((s) => { s.left = s.count; s.made.forEach((x) => ws.root.remove(x.mesh)); s.made = []; });
  ws.rung = []; ws.holding = null; ws.won = false; ws.hint = ''; ws.grabStep = ws.releaseStep = -1;
}

/* ─── public: per-frame step ────────────────────────────────────────────── */

/**
 * Runs every frame. Keeps the arm on the bench, poses it to reach the claw
 * point, and makes Grip / Release do their jobs. Returns true once, on the
 * frame the mission is completed.
 */
export function stepArmWorkshop(scene, rs, robot, running) {
  const ws = scene.userData.armWorkshop; if (!ws || !robot) return false;
  if ((rs.t || 0) + 0.05 < ws.lastT) resetWorkshop(ws);
  ws.lastT = rs.t || 0;

  // rs.y is the arm lift (Raise / Lower); the base itself stays bolted down
  const lift = Math.max(0, Math.min(1, rs.y || 0));
  robot.position.y = 0;
  const yaw = robot.rotation.y; // visual heading
  const gripH = 0.3 + lift * 1.3;
  const claw = { x: Math.sin(yaw) * ARM_REACH, z: Math.cos(yaw) * ARM_REACH };
  poseArm(robot, gripH, !!ws.holding || (rs.grabFlash > 0));
  if (rs.grabFlash > 0) rs.grabFlash -= 0.016;

  if (ws.holding) { ws.holding.mesh.position.set(claw.x, gripH - 0.32, claw.z); }

  // The sim only animates the robot while running; pose it ourselves the rest of the time
  if (!running) { robot.userData.animate?.(rs.t || 0); return false; }
  // Logical claw point (exact heading) for picking and dropping
  const a = rs.angle;
  const cx = Math.sin(a) * ARM_REACH, cz = Math.cos(a) * ARM_REACH;
  const near = (p) => Math.hypot(p.x - cx, p.z - cz) < PICK_TOL;
  const at = (angle, r) => benchPoint(angle, r);

  // A block's trigger is set for its first few frames: act once per block
  if (rs.grabTrigger && ws.grabStep === rs.step) rs.grabTrigger = false;
  if (rs.releaseTrigger && ws.releaseStep === rs.step) rs.releaseTrigger = false;
  if (rs.grabTrigger) {
    rs.grabTrigger = false; rs.grabFlash = 0.35; ws.grabStep = rs.step;
    if (ws.holding) ws.hint = 'The claw is already holding something — Release it first.';
    else if (lift > LOW_LIFT) {
      // A raised claw can still ring a bell it is pointing at
      const bell = ws.bells.find((b) => near(at(b.angle, ARM_REACH + 0.1)));
      if (bell) ringBell(ws, bell); else ws.hint = 'Lower the arm first, then Grip.';
    } else {
      const bell = ws.bells.find((b) => near(at(b.angle, ARM_REACH + 0.1)));
      const item = ws.items.find((i) => near(i.mesh.position) && (!i.placedIn || !ws.targets.find((t) => t.id === i.placedIn)?.accepts.includes(i.id)));
      const src = ws.sources.find((s) => near(at(s.angle)) && s.left > 0);
      if (bell) ringBell(ws, bell);
      else if (item) {
        if (item.placedIn) { const t = ws.targets.find((x) => x.id === item.placedIn); if (t) t.held = t.held.filter((h) => h !== item.id); item.placedIn = null; }
        ws.holding = item; ws.hint = '';
      } else if (src) {
        src.left -= 1;
        const mesh = itemMesh(src.give); ws.root.add(mesh);
        const made = { id: `${src.id}-${src.made.length}`, kind: src.give, fromSource: src.id, mesh, placedIn: null };
        src.made.push(made); ws.holding = made; ws.hint = '';
      } else ws.hint = 'Nothing under the claw — Rotate base so it points at something.';
    }
  }

  if (rs.releaseTrigger) {
    rs.releaseTrigger = false; ws.releaseStep = rs.step;
    const h = ws.holding;
    if (!h) ws.hint = 'The claw is empty — Grip something first.';
    else {
      ws.holding = null;
      const t = ws.targets.find((x) => near(at(x.angle)));
      const key = h.fromSource ? h.kind : h.id;
      if (t && t.accepts.includes(key) && t.held.length < t.cap) {
        t.held.push(h.id); h.placedIn = t.id;
        const p = at(t.angle);
        const stackY = t.stack ? 0.06 + (t.held.length - 1) * 0.46 : t.kind === 'cupcake' ? 0.42 : t.kind === 'flowerPot' ? 0.3 : t.kind === 'car' ? 0.12 : t.kind === 'bin' || t.kind === 'cup' ? 0.06 : 0.06;
        const spread = t.kind === 'cup' ? (t.held.length - 2) * 0.12 : 0;
        h.mesh.position.set(p.x + spread, stackY, p.z);
        if (t.kind === 'car') placeOnCar(h, t, p);
        if (t.kind === 'flowerPot') sprout(ws, p);
        ws.hint = '';
      } else {
        // Dropped somewhere else: it lands on the bench under the claw
        h.mesh.position.set(cx, 0, cz);
        if (t) ws.hint = `That doesn't go there — try another spot.`;
      }
    }
  }

  rs.missionCheckpoint = doneJobs(ws);
  rs.missionCheckpointsTotal = totalJobs(ws);
  if (ws.hint) rs.missionHint = ws.hint;
  if (!ws.won && rs.missionCheckpoint >= rs.missionCheckpointsTotal) { ws.won = true; return true; }
  return false;
}

function ringBell(ws, bell) {
  bell._ring = 1;
  const want = ws.melody[ws.rung.length];
  const othersDone = ws.items.every((i) => i.placedIn);
  if (bell.last && !othersDone) { ws.hint = 'Finish the other jobs, then ring the bell!'; return; }
  if (bell.id === want) { ws.rung.push(bell.id); ws.hint = ''; }
  else { ws.rung = []; ws.hint = `Oops — ring bell ${ws.bells.find((b) => b.id === ws.melody[0])?.n ?? 1} first. Start the tune again.`; }
}

function placeOnCar(h, t, p) {
  const slot = t.held.length - 1;
  const yaw = Math.atan2(p.x, p.z) + Math.PI;
  const local = h.kind === 'sticker' ? [0, 0.38, 0.1] : slot === 0 ? [-0.28, -0.06, -0.3] : [0.28, -0.06, -0.3];
  const v = new THREE.Vector3(...local).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  h.mesh.position.set(p.x + v.x, 0.16 + v.y + (h.kind === 'sticker' ? 0.1 : 0), p.z + v.z);
  h.mesh.rotation.y = yaw;
}

function sprout(ws, p) {
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), m(0x16a34a)); stem.position.set(p.x, 0.47, p.z); ws.root.add(stem);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), m(0x22c55e)); leaf.scale.set(1.6, 0.4, 1); leaf.position.set(p.x + 0.06, 0.6, p.z); ws.root.add(leaf);
  ws.sources.forEach((s) => s.made.push({ id: 'sprout', mesh: stem, placedIn: null, decor: true }, { id: 'leaf', mesh: leaf, placedIn: null, decor: true }));
}

/** Two-link reach: lean the shoulder and elbow so the claw meets the bench point. */
function poseArm(robot, gripH, closed) {
  const s = robot.scale.x || 1;
  const L1 = 1.06, L2 = 0.69, G = 0.45, P = 0.48;
  const d = ARM_REACH / s, h = gripH / s;
  const dx = d, dy = h + G - P;
  let D = Math.hypot(dx, dy);
  D = Math.max(Math.abs(L1 - L2) + 0.001, Math.min(L1 + L2 - 0.001, D));
  const a1 = Math.atan2(dx, dy);
  const B = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D))));
  const C = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2))));
  const shoulder = a1 - B;
  const elbow = Math.PI - C;
  robot.userData.armPose = { shoulder, elbow, wrist: Math.PI - shoulder - elbow, closed };
}
