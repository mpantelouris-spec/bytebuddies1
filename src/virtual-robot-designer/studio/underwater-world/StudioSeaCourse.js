/**
 * StudioSeaCourse — the Sub Drone's underwater missions.
 *
 * Built like the sky courses: the course is the block program that swims it
 * (data/sea-courses.js). One clear line of bubble rings (or mission stations),
 * a dotted guide line, a dock to start from and a finish ring, inside a
 * themed sea: reef, kelp forest, wreck, glowing cave, vents and so on.
 */
import * as THREE from 'three';
import { getTierMood } from '../../data/tier-levels/index.js';
import { tint } from '../../data/tier-levels/moods.js';
import { getSeaCourse, swimSeaProgram, SEA_SPAWN_Y } from '../../data/sea-courses.js';
import { thinRings } from '../../data/sky-courses.js';
import { getPrimaryStudioArena } from '../../data/primary-robot-studio.js';
import { getMissionAction } from '../../data/mission-actions.js';
import { initFamilyScene, arenaMover, updateMissionMinimap } from '../ArenaBuilderCore.js';
import {
  rngFrom, mat, canvasTex, instanced, skyDome, terrain, scatter, makeRing, guideDots, finishGate, routeIndex,
} from '../aerial-world/StudioSkyCourse.js';

const SEABED_Y = -11;

/** Modes 11–50: recolour the water with the level's mood (dawn, twilight…). */
function seaMood(T, mood) {
  if (!mood) return T;
  return { ...T, water: T.water.map((c) => tint(c, mood)), fog: tint(T.fog, mood), sand: T.sand.map((c) => tint(c, mood, 0.5)), light: T.light * mood.light };
}
const SURFACE_Y = 9;
const lerp = (a, b, t) => a + (b - a) * t;

const THEMES = {
  reef:     { water: ['#36b8d6', '#0d5f8c'], fog: '#1f8fb5', sand: ['#f2dfa8', '#d8bf80'], light: 1.0 },
  kelp:     { water: ['#2fa58a', '#0b4d4a'], fog: '#1b7a6b', sand: ['#cdb88a', '#9f8a5e'], light: 0.9 },
  turtle:   { water: ['#3cc3d8', '#0f6a92'], fog: '#2596b8', sand: ['#f4e3b0', '#dcc488'], light: 1.0 },
  wreck:    { water: ['#1f6f9c', '#082c4f'], fog: '#123f63', sand: ['#b9ad8a', '#857a5c'], light: 0.75 },
  cave:     { water: ['#13405e', '#040d1c'], fog: '#0b2238', sand: ['#4b5563', '#1f2937'], light: 0.5 },
  current:  { water: ['#2a9fd6', '#0b4a86'], fog: '#1a76b0', sand: ['#e8d7a2', '#c9b37a'], light: 0.95 },
  treasure: { water: ['#33b0d1', '#0c5a86'], fog: '#1d88ad', sand: ['#f0dba0', '#d4ba78'], light: 1.0 },
  cleanup:  { water: ['#35b5cf', '#0e6187'], fog: '#2090b0', sand: ['#efdca6', '#d2b97e'], light: 1.0 },
  vents:    { water: ['#1b4a6b', '#06121f'], fog: '#102a40', sand: ['#3f3a3a', '#1c1919'], light: 0.6 },
  finale:   { water: ['#38bcd8', '#0e638f'], fog: '#2193b6', sand: ['#f2dfa8', '#d8bf80'], light: 1.0 },
};

const CORAL = [0xf472b6, 0xfb923c, 0xa78bfa, 0xfacc15, 0xf87171, 0x34d399, 0x60a5fa];

/* ─── sea pieces ────────────────────────────────────────────────────────── */

function surface(group, ctx) {
  const tex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#9be7f5'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 3;
    for (let i = 0; i < 40; i++) { c.beginPath(); const x = Math.random() * w, y = Math.random() * h; c.arc(x, y, 8 + Math.random() * 18, 0, Math.PI * 1.3); c.stroke(); }
  }, { repeat: [40, 40] });
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), m); s.rotation.x = Math.PI / 2; s.position.set(ctx.center.x, SURFACE_Y, ctx.center.z); group.add(s);
  arenaMover(ctx.scene, (t) => { tex.offset.set(t * 0.01, t * 0.006); });
}

function lightShafts(group, ctx, count = 10) {
  const m = new THREE.MeshBasicMaterial({ color: 0xdffbff, transparent: true, opacity: 0.045, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  scatter(ctx, count, { minR: 30, maxR: 160, clear: 22 }).forEach((p) => {
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 5, 26, 10, 1, true), m); beam.position.set(p.x, SURFACE_Y - 13, p.z); beam.rotation.z = 0.15; group.add(beam);
  });
}

function corals(group, ctx, count, { clear = 6, maxR = 170 } = {}) {
  const { rnd } = ctx; const h = ctx.heightAt;
  const spots = scatter(ctx, count, { minR: 4, maxR, clear });
  const branch = new THREE.ConeGeometry(0.35, 1, 6); branch.translate(0, 0.5, 0);
  const brain = new THREE.IcosahedronGeometry(1, 1);
  const fan = new THREE.CircleGeometry(1, 10);
  const B = [], R = [], F = [];
  spots.forEach((p, i) => {
    const y = h(p.x, p.z); const c = CORAL[Math.floor(rnd() * CORAL.length)];
    const kind = i % 3;
    if (kind === 0) for (let k = 0; k < 6; k++) B.push({ x: p.x + (rnd() - 0.5) * 2.4, y, z: p.z + (rnd() - 0.5) * 2.4, sx: 1.8, sy: lerp(2.5, 5.5, rnd()), sz: 1.8, rz: (rnd() - 0.5) * 0.6, color: c });
    else if (kind === 1) R.push({ x: p.x, y: y + 0.6, z: p.z, sx: lerp(1.6, 3, rnd()), sy: lerp(1, 1.8, rnd()), sz: lerp(1.6, 3, rnd()), color: c });
    else F.push({ x: p.x, y: y + 2.6, z: p.z, s: lerp(2, 3.4, rnd()), ry: rnd() * 3, color: c });
  });
  instanced(group, branch, mat(0xffffff), B);
  instanced(group, brain, mat(0xffffff, { rough: 1 }), R);
  instanced(group, fan, new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.9 }), F);
}

function rocks(group, ctx, count, color = 0x7c8796, { clear = 7, size = 1 } = {}) {
  const { rnd } = ctx;
  const items = scatter(ctx, count, { minR: 6, maxR: 220, clear }).map((p) => ({ x: p.x, y: ctx.heightAt(p.x, p.z), z: p.z, s: lerp(1.2, 3.5, rnd()) * size, rx: rnd() * 3, ry: rnd() * 3 }));
  instanced(group, new THREE.DodecahedronGeometry(1, 0), mat(color), items);
}

function seaweed(group, ctx, count, { tall = 6, clear = 6, color = 0x2f9e44, maxR = 160 } = {}) {
  const { rnd } = ctx;
  const geo = new THREE.BoxGeometry(0.35, 1, 0.1); geo.translate(0, 0.5, 0);
  const items = scatter(ctx, count, { minR: 3, maxR, clear }).map((p) => ({ x: p.x, y: ctx.heightAt(p.x, p.z), z: p.z, sx: lerp(0.8, 1.5, rnd()), sy: tall * lerp(0.6, 1.2, rnd()), sz: 1, ry: rnd() * 3, rz: (rnd() - 0.5) * 0.2, color: [color, 0x40c057, 0x2b8a3e][Math.floor(rnd() * 3)] }));
  const mesh = instanced(group, geo, mat(0xffffff), items);
  return mesh;
}

function fishSchools(group, ctx, count = 6) {
  const { rnd } = ctx;
  const geo = new THREE.ConeGeometry(0.22, 0.7, 5); geo.rotateX(Math.PI / 2);
  scatter(ctx, count, { minR: 10, maxR: 90, clear: 10 }).forEach((p, si) => {
    const n = 14; const col = [0xfacc15, 0xf97316, 0x60a5fa, 0xf472b6, 0x34d399][si % 5];
    const mesh = new THREE.InstancedMesh(geo, mat(col, { emissive: col, ei: 0.15 }), n); group.add(mesh);
    const offs = Array.from({ length: n }, () => [rnd() * 3, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2]);
    const cy = lerp(-8, -3, rnd()), r = lerp(6, 12, rnd()), sp = lerp(0.2, 0.4, rnd()) * (si % 2 ? 1 : -1);
    const d = new THREE.Object3D();
    arenaMover(ctx.scene, (t) => {
      offs.forEach(([a, dy, dr], i) => {
        const ang = t * sp + a * 0.25; const rr = r + dr;
        d.position.set(p.x + Math.cos(ang) * rr, cy + dy + Math.sin(t * 2 + a) * 0.2, p.z + Math.sin(ang) * rr);
        d.rotation.set(0, -ang + (sp > 0 ? 0 : Math.PI), 0); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });
}

function bubbles(group, ctx, count = 200) {
  const { rnd } = ctx; const pts = []; const base = [];
  for (let i = 0; i < count; i++) { const a = rnd() * Math.PI * 2, r = rnd() * 120; base.push([ctx.center.x + Math.cos(a) * r, SEABED_Y + rnd() * 12, ctx.center.z + Math.sin(a) * r, lerp(0.6, 1.4, rnd())]); pts.push(0, 0, 0); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xe0fbff, size: 0.25, transparent: true, opacity: 0.7, depthWrite: false })); group.add(p);
  arenaMover(ctx.scene, (t) => {
    const a = g.attributes.position.array;
    base.forEach(([x, y, z, s], i) => { a[i * 3] = x + Math.sin(t + i) * 0.3; a[i * 3 + 1] = SEABED_Y + ((y - SEABED_Y + t * s) % 13); a[i * 3 + 2] = z; });
    g.attributes.position.needsUpdate = true;
  });
}

function dock(group, ctx) {
  // An underwater launch pad the sub starts above
  const s = ctx.spawn;
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.4, 28), mat(0x334155, { metal: 0.3 })); pad.position.set(s.x, s.y - 1.3, s.z); group.add(pad);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 8, 40), new THREE.MeshBasicMaterial({ color: 0x22d3ee })); ring.rotation.x = Math.PI / 2; ring.position.set(s.x, s.y - 1.08, s.z); group.add(ring);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, s.y - 1.3 - SEABED_Y, 10), mat(0x475569)); leg.position.set(s.x, (s.y - 1.3 + SEABED_Y) / 2, s.z); group.add(leg);
  arenaMover(ctx.scene, (t) => { ring.material.color.setHSL(0.52, 0.9, 0.5 + Math.sin(t * 3) * 0.12); });
}

function shipwreck(group, ctx) {
  const mid = ctx.flight[Math.floor(ctx.flight.length * 0.5)];
  const side = 1; const off = 14;
  const x = mid.x + Math.cos(mid.angle) * off * side, z = mid.z - Math.sin(mid.angle) * off * side;
  const g = new THREE.Group(); g.position.set(x, SEABED_Y, z); g.rotation.set(0.12, mid.angle, 0.35);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 22), mat(0x6b4f35)); hull.position.y = 2; g.add(hull);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(3, 7, 4), mat(0x6b4f35)); bow.rotation.x = -Math.PI / 2; bow.rotation.y = Math.PI / 4; bow.scale.set(1, 1, 0.66); bow.position.set(0, 2, -14); g.add(bow);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 12, 8), mat(0x52381f)); mast.position.set(0, 9, 2); mast.rotation.z = 0.5; g.add(mast);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(1.4, 10), mat(0x1c1917)); hole.position.set(3.02, 2.2, 3); hole.rotation.y = Math.PI / 2; g.add(hole);
  group.add(g);
  const anchor = new THREE.Mesh(new THREE.TorusGeometry(1, 0.2, 6, 12, Math.PI), mat(0x57534e)); anchor.position.set(x - 6, SEABED_Y + 0.8, z + 6); group.add(anchor);
}

function caveWalls(group, ctx) {
  const { rnd } = ctx; const items = []; const cry = [];
  const pts = ctx.route.samples;
  for (let i = 0; i < pts.length; i += 2) {
    const p = pts[i], n = pts[Math.min(pts.length - 1, i + 1)];
    const tx = n.x - p.x, tz = n.z - p.z, L = Math.hypot(tx, tz) || 1;
    [-1, 1].forEach((side) => {
      const off = lerp(9, 12, rnd()); const x = p.x + (-tz / L) * side * off, z = p.z + (tx / L) * side * off;
      if (ctx.route.dist(x, z) < 7.5) return;
      items.push({ x, y: SEABED_Y + 5, z, sx: lerp(5, 8, rnd()), sy: lerp(10, 16, rnd()), sz: lerp(5, 8, rnd()), rx: rnd(), ry: rnd() * 3 });
      if (i % 4 === 0) cry.push({ x: x + (-tz / L) * -side * 3.5, y: SEABED_Y + lerp(1, 6, rnd()), z: z + (tx / L) * -side * 3.5, sx: 0.6, sy: lerp(1.5, 3, rnd()), sz: 0.6, rz: (rnd() - 0.5) * 0.8, color: rnd() < 0.5 ? 0x22d3ee : 0xc084fc });
    });
    if (i % 6 === 0 && i > 14) items.push({ x: p.x, y: 7.5, z: p.z, sx: 16, sy: 4, sz: 6, ry: rnd() * 3 }); // ceiling arches
  }
  instanced(group, new THREE.DodecahedronGeometry(1, 0), mat(0x374151), items);
  instanced(group, new THREE.OctahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.3 }), cry);
}

function rockArches(group, ctx, count = 6) {
  const pts = ctx.route.samples;
  for (let k = 1; k <= count; k++) {
    const p = pts[Math.floor((k / (count + 1)) * pts.length)];
    const arch = new THREE.Mesh(new THREE.TorusGeometry(7, 1.4, 8, 20, Math.PI), mat(0x6b7280));
    arch.position.set(p.x, SEABED_Y, p.z); arch.rotation.y = p.angle; group.add(arch);
  }
}

function currentStreaks(group, ctx) {
  const pts = ctx.flight; const n = 80; const geo = new THREE.BoxGeometry(0.06, 0.06, 1.4);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xe0f7ff, transparent: true, opacity: 0.6 }), n); group.add(mesh);
  const seeds = Array.from({ length: n }, (_, i) => [i / n, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3]);
  const d = new THREE.Object3D();
  arenaMover(ctx.scene, (t) => {
    seeds.forEach(([u, ox, oy], i) => {
      const k = (u + t * 0.05) % 1; const q = pts[Math.floor(k * (pts.length - 1))];
      d.position.set(q.x + Math.cos(q.angle) * ox, q.y + oy, q.z - Math.sin(q.angle) * ox); d.rotation.set(0, q.angle, 0); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
}

function vents(group, ctx, count = 8) {
  const { rnd } = ctx;
  scatter(ctx, count, { minR: 8, maxR: 80, clear: 9 }).forEach((p) => {
    const h = lerp(4, 8, rnd()); const y = ctx.heightAt(p.x, p.z);
    const chim = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.4, h, 8), mat(0x292524)); chim.position.set(p.x, y + h / 2, p.z); group.add(chim);
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8), new THREE.MeshBasicMaterial({ color: 0xff7a1a })); glow.position.set(p.x, y + h, p.z); group.add(glow);
    const puffs = Array.from({ length: 6 }, () => { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mat(0x1f2937, { opacity: 0.5 })); group.add(s); return s; });
    const ph = rnd();
    arenaMover(ctx.scene, (t) => puffs.forEach((s, i) => { const k = (t * 0.12 + i / 6 + ph) % 1; s.position.set(p.x + Math.sin(i + t) * 0.4, y + h + k * 8, p.z); s.scale.setScalar(0.5 + k * 1.6); }));
  });
}

function sonarGrid(group, ctx) {
  const tex = canvasTex(128, 128, (c, w, h) => { c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(34,211,238,0.6)'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2); }, { repeat: [30, 30] });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  g.rotation.x = -Math.PI / 2; g.position.set(ctx.center.x, SEABED_Y + 0.15, ctx.center.z); group.add(g);
}

function turtle(group, ctx) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat(0x15803d)); shell.scale.set(1, 0.45, 1.2); g.add(shell);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), mat(0x86efac)); head.position.set(0, 0.05, -1.3); g.add(head);
  const flip = [[-0.9, -0.6], [0.9, -0.6], [-0.7, 0.8], [0.7, 0.8]].map(([x, z]) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.4), mat(0x86efac)); f.position.set(x, 0, z); g.add(f); return f; });
  group.add(g);
  const pts = ctx.flight;
  arenaMover(ctx.scene, (t) => {
    const k = (t * 0.03) % 1; const q = pts[Math.floor(k * (pts.length - 1))];
    g.position.set(q.x + Math.cos(q.angle) * 3, q.y + 1.5, q.z - Math.sin(q.angle) * 3); g.rotation.y = q.angle + Math.PI;
    flip.forEach((f, i) => { f.rotation.z = Math.sin(t * 4 + i) * 0.4; });
  });
}

/** What sits at a mission station: something to scan, litter to pick up, or a sample. */
function stationProp(kind, theme) {
  const g = new THREE.Group();
  if (kind === 'scan_here') {
    if (theme === 'wreck') { const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), mat(0x92400e)); g.add(crate); }
    else if (theme === 'treasure') { const chest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1), mat(0xb45309)); g.add(chest); const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 10, 1, false, 0, Math.PI), mat(0xd97706)); lid.rotation.z = Math.PI / 2; lid.position.y = 0.45; g.add(lid); }
    else { const fish = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 8), mat(0xfb923c, { emissive: 0xfb923c, ei: 0.2 })); fish.scale.set(0.6, 0.8, 1.3); g.add(fish); const tail = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.7, 4), mat(0xfb923c)); tail.rotation.x = -Math.PI / 2; tail.position.z = 0.95; g.add(tail); }
  } else if (kind === 'pick_up') {
    if (theme === 'vents') { const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1, 10), mat(0x22d3ee, { emissive: 0x22d3ee, ei: 0.8, opacity: 0.85 })); g.add(tube); }
    else { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1, 10), mat(0x86efac, { opacity: 0.8 })); b.rotation.z = 1.2; g.add(b); const can = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 10), mat(0xef4444, { metal: 0.6 })); can.position.set(0.6, -0.3, 0.2); can.rotation.x = 1; g.add(can); }
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.06, 6, 30), new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.7 })); ring.rotation.x = Math.PI / 2; ring.position.y = -0.8; g.add(ring);
  return g;
}

/* ─── world per theme ───────────────────────────────────────────────────── */

function buildSea(group, ctx, theme) {
  const T = seaMood(THEMES[theme] || THEMES.reef, ctx.mood);
  terrain(group, ctx, { colors: T.sand, hills: 3, size: 900, flatR: 10, far: 0, baseY: SEABED_Y });
  surface(group, ctx);
  if (theme !== 'cave' && theme !== 'vents') lightShafts(group, ctx);
  bubbles(group, ctx);
  switch (theme) {
    case 'reef': case 'turtle': case 'finale':
      corals(group, ctx, 220, { clear: 5, maxR: 140 }); rocks(group, ctx, 30); seaweed(group, ctx, 60); fishSchools(group, ctx, 7);
      if (theme === 'turtle') turtle(group, ctx);
      if (theme === 'finale') { rockArches(group, ctx, 3); vents(group, ctx, 3); }
      break;
    case 'kelp':
      seaweed(group, ctx, 420, { tall: 13, clear: 5, maxR: 140 }); rocks(group, ctx, 20); fishSchools(group, ctx, 4);
      break;
    case 'wreck':
      shipwreck(group, ctx); rocks(group, ctx, 30, 0x57534e); seaweed(group, ctx, 50, { color: 0x3f6212 }); corals(group, ctx, 30); fishSchools(group, ctx, 3);
      break;
    case 'cave':
      caveWalls(group, ctx); rocks(group, ctx, 20, 0x1f2937);
      break;
    case 'current':
      rockArches(group, ctx, 5); currentStreaks(group, ctx); corals(group, ctx, 60); seaweed(group, ctx, 40); fishSchools(group, ctx, 4);
      break;
    case 'treasure':
      sonarGrid(group, ctx); rocks(group, ctx, 25); corals(group, ctx, 40); fishSchools(group, ctx, 3);
      break;
    case 'cleanup':
      corals(group, ctx, 100); seaweed(group, ctx, 40); fishSchools(group, ctx, 5);
      break;
    case 'vents':
      vents(group, ctx, 10); rocks(group, ctx, 40, 0x292524);
      break;
    default:
      corals(group, ctx, 100);
  }
}

/* ─── main entry ────────────────────────────────────────────────────────── */

export function hasStudioSeaCourse(challenge, robotConfig) {
  const id = challenge?.chassisId || robotConfig?.chassisId;
  return Boolean(challenge?.isChassisMode && getSeaCourse(id, challenge?.modeIndex || 1));
}

export function buildStudioSeaCourse(scene, challenge, robotConfig = null) {
  const chassisId = challenge?.chassisId || robotConfig?.chassisId;
  const course = getSeaCourse(chassisId, challenge?.modeIndex || 1);
  if (!course) return false;
  const arena = getPrimaryStudioArena(chassisId, course.mode);
  const action = getMissionAction({ ...challenge, chassisId, arenaBible: true, modeIndex: course.mode });
  const theme = course.theme;
  const mood = course.mode > 10 ? getTierMood(chassisId, course.mode) : null;
  const T = seaMood(THEMES[theme] || THEMES.reef, mood);
  const swum = swimSeaProgram(course.tokens);

  initFamilyScene(scene, [T.light, T.light, T.light]);
  const old = scene.getObjectByName('StudioSeaCourse'); if (old) scene.remove(old);
  const root = new THREE.Group(); root.name = 'StudioSeaCourse'; scene.add(root);

  const flight = swum.path.slice(9);
  const route = routeIndex(flight.length > 4 ? flight : swum.path);
  const ctx = { mood, scene, rnd: rngFrom(`sea:${arena.id}${course.mode > 10 ? `:${course.mode}` : ""}`), route, center: route.center, spawn: swum.path[0], end: swum.end, flight, heightAt: () => SEABED_Y };

  skyDome(root, T.water[0], T.water[1], { radius: 300, center: ctx.center });
  scene.fog = new THREE.Fog(T.fog, 14, 115);
  scene.background = new THREE.Color(T.water[1]);
  root.add(new THREE.HemisphereLight(0xbff4ff, 0x0b3b5a, 0.9 * T.light));
  const sun = new THREE.DirectionalLight(0xdffaff, 0.8 * T.light); sun.position.set(ctx.center.x + 40, 120, ctx.center.z + 20); sun.target.position.set(ctx.center.x, SEABED_Y, ctx.center.z); root.add(sun, sun.target);

  buildSea(root, ctx, theme);
  dock(root, ctx);
  guideDots(root, ctx, 0);

  const checkpoints = [];
  if (action) {
    swum.stations.forEach((s, i) => {
      const cp = { x: s.x, y: s.y, z: s.z, index: i, passed: false };
      if (action.id !== 'light_up') { const prop = stationProp(action.id, theme); prop.position.set(s.x + Math.sin(s.angle) * 1.6, s.y - 0.4, s.z + Math.cos(s.angle) * 1.6); root.add(prop); cp.prop = prop; }
      checkpoints.push(cp);
    });
    arenaMover(scene, (t) => (scene.userData.chassisCheckpoints || []).forEach((c, i) => {
      if (!c.prop) return;
      c.prop.rotation.y = t * 0.6 + i;
      if (c.passed && action.id === 'pick_up') c.prop.visible = false;
    }));
  } else {
    const style = { kind: 'hoop', color: 0x22d3ee, trim: 0xffffff };
    const gates = new THREE.Group(); gates.name = 'AerialGates'; root.add(gates);
    const sp = swum.path[0];
    thinRings(swum.rings.filter((r) => Math.hypot(r.x - sp.x, r.z - sp.z) > 10), 8).forEach((r, i) => {
      const ring = makeRing(style, i); ring.position.set(r.x, r.y, r.z); ring.rotation.y = r.angle; gates.add(ring);
      checkpoints.push({ x: r.x, y: r.y, z: r.z, index: i, passed: false, mesh: ring });
    });
    const green = new THREE.Color(0x22c55e);
    arenaMover(scene, (t) => {
      const cps = scene.userData.chassisCheckpoints || []; const next = cps.find((c) => !c.passed);
      cps.forEach((c) => {
        const g = c.mesh; if (!g) return; const m = g.userData.ringMat;
        if (c.passed) { if (!g.userData.done) { g.userData.done = true; m.color.copy(green); m.emissive.copy(green); m.opacity = 0.45; g.userData.label.visible = false; g.userData.fill.visible = false; } }
        else if (c === next) { m.emissiveIntensity = 0.7 + Math.sin(t * 6) * 0.35; g.scale.setScalar(1 + Math.sin(t * 6) * 0.05); }
        else { m.emissiveIntensity = 0.3; g.scale.setScalar(1); }
      });
    });
  }
  finishGate(root, ctx);

  const ud = scene.userData; const s = swum.path[0];
  ud.aerialWorldBuilt = true;            // 3D checkpoints + the big world step size
  ud.kidFlyingWorld = true;
  ud.studioSeaCourse = { chassisId, mode: course.mode, theme };
  ud.flyingArenaActive = true;
  ud.skipMissionWorld = true; ud.missionWorldKit = false; ud.customSky = true; ud.customDecor = true;
  ud.environmentId = 'underwater';
  ud.physicsMode = 'flight_3dof';
  ud.cameraMode = 'sub_chase';
  ud.missionCameraPreset = { camBack: 11, camUp: 3.8, lookAhead: 18, lookHeight: 1.6, fov: 58 };
  ud.aerialSpawn = { x: s.x, y: s.y, z: s.z, angle: s.angle };
  ud.aerialMeshYawOffset = 0;
  ud.spawnAltitude = s.y; ud.spawnX = s.x; ud.spawnY = s.y; ud.spawnZ = s.z; ud.groundY = s.y;
  ud.killPlaneY = -80;
  ud._aerialAltRange = { lo: SEABED_Y + 2, hi: SURFACE_Y - 2 };
  ud._chassisCurve = new THREE.CatmullRomCurve3(flight.filter((_, i) => i % 6 === 0).map((p) => new THREE.Vector3(p.x, p.y, p.z)));
  const bb = route.bbox;
  ud.arenaBounds = { cx: route.center.x, cz: route.center.z, spanX: bb.maxX - bb.minX + 80, spanZ: bb.maxZ - bb.minZ + 80, camMinZ: bb.minZ - 40, camMaxZ: bb.maxZ + 40, camMaxX: Math.max(Math.abs(bb.minX), Math.abs(bb.maxX)) + 40, floorY: SEABED_Y };
  ud.chassisCheckpoints = checkpoints;
  ud.chassisCheckpointTotal = checkpoints.length;
  ud.finishZone = { x: swum.end.x, z: swum.end.z, y3d: swum.end.y, radius: 4.5 };
  ud.expMood = 1.05;
  ud.raceVisual = { bloom: 0.25, threshold: 0.8, radius: 0.3 };
  ud.obstacles = [];
  updateMissionMinimap(scene, ud._chassisCurve);
  return true;
}
