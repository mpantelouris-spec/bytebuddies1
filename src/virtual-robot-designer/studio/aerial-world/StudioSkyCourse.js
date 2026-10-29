/**
 * StudioSkyCourse — the flying worlds for the Robot Studio flyers
 * (Drone, Racing Drone, Jet Explorer).
 *
 * One clean scene per mission: a sky, a themed world below, a start pad, a
 * single line of rings that follows the course program (see data/sky-courses.js),
 * a dotted guide line and a finish gate. Nothing is placed on the flight line
 * except the rings themselves.
 */
import * as THREE from 'three';
import { getSkyCourse, flySkyProgram, thinRings, SKY_SPAWN_Y } from '../../data/sky-courses.js';
import { getPrimaryStudioArena } from '../../data/primary-robot-studio.js';
import { getMissionAction } from '../../data/mission-actions.js';
import { getTierMood } from '../../data/tier-levels/index.js';
import { tint } from '../../data/tier-levels/moods.js';

/** Modes 11–50: recolour a theme with the level's lighting mood (dawn, dusk…). */
function moodTheme(T, mood) {
  if (!mood) return T;
  return {
    ...T,
    sky: T.sky.map((c) => tint(c, mood, 1.35)),
    fog: [tint(T.fog[0], mood, 1.3), T.fog[1], T.fog[2]],
    ground: T.ground ? T.ground.map((c) => tint(c, mood, 0.6)) : T.ground,
    sun: [tint(T.sun[0], mood, 1.2), T.sun[1] * mood.light],
    hemi: [tint(T.hemi[0], mood), tint(T.hemi[1], mood, 0.6), T.hemi[2] * mood.light],
  };
}
import { initFamilyScene, arenaMover, updateMissionMinimap } from '../ArenaBuilderCore.js';

/* ─── small helpers ─────────────────────────────────────────────────────── */

export function rngFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

const matCache = new Map();
export function mat(color, { emissive = 0, ei = 0, rough = 0.85, metal = 0, flat = true, opacity = 1 } = {}) {
  const key = [color, emissive, ei, rough, metal, flat, opacity].join('|');
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({
      color, emissive, emissiveIntensity: ei, roughness: rough, metalness: metal, flatShading: flat,
      transparent: opacity < 1, opacity,
    }));
  }
  return matCache.get(key);
}

export function canvasTex(w, h, draw, { repeat = null } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

export function labelSprite(text, { bg = '#ffffff', fg = '#0f172a', size = 2 } = {}) {
  const tex = canvasTex(128, 128, (ctx) => {
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(64, 64, 58, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(15,23,42,0.25)'; ctx.stroke();
    ctx.fillStyle = fg; ctx.font = 'bold 66px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 68);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }));
  s.scale.set(size, size, 1);
  return s;
}

export function bannerSprite(text, { bg = '#0f172a', fg = '#ffffff', w = 8 } = {}) {
  const tex = canvasTex(512, 128, (ctx) => {
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(6, 6, 500, 116, 30); ctx.fill();
    ctx.fillStyle = fg; ctx.font = 'bold 64px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 68);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }));
  s.scale.set(w, w / 4, 1);
  return s;
}

/** Instanced copies of one geometry. items: [{x,y,z,s,sy,ry,color}] */
export function instanced(group, geo, material, items, { shadow = false } = {}) {
  if (!items.length) return null;
  const mesh = new THREE.InstancedMesh(geo, material, items.length);
  const d = new THREE.Object3D();
  items.forEach((it, i) => {
    d.position.set(it.x, it.y, it.z);
    d.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0);
    d.scale.set(it.sx ?? it.s ?? 1, it.sy ?? it.s ?? 1, it.sz ?? it.s ?? 1);
    d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
    if (it.color != null) mesh.setColorAt(i, new THREE.Color(it.color));
  });
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = shadow; mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

/* ─── themes ────────────────────────────────────────────────────────────── */

const THEMES = {
  meadow:     { sky: ['#3d9be9', '#d4efff'], fog: ['#d6efff', 160, 720], ground: ['#86c95c', '#4f9a3c'], sun: [0xfff4dc, 1.25], hemi: [0xcfe8ff, 0x5b8a3a, 0.75] },
  rainbow:    { sky: ['#6aa8f5', '#f3e8ff'], fog: ['#efe6ff', 160, 720], ground: ['#8fd16a', '#5aa648'], sun: [0xfff4dc, 1.2], hemi: [0xe9ddff, 0x5b8a3a, 0.75] },
  airshow:    { sky: ['#3f97e6', '#dff2ff'], fog: ['#dff2ff', 170, 760], ground: ['#8ccf63', '#5a9f40'], sun: [0xfff4dc, 1.25], hemi: [0xcfe8ff, 0x5b8a3a, 0.75] },
  savanna:    { sky: ['#e98a3c', '#ffe7b8'], fog: ['#ffdcae', 150, 700], ground: ['#dcb862', '#b48d3d'], sun: [0xffd49a, 1.3], hemi: [0xffe2b8, 0x8a6a2a, 0.7] },
  snow:       { sky: ['#6aa7e2', '#f1f7ff'], fog: ['#eef5ff', 140, 640], ground: ['#f5f8ff', '#c9d8ec'], sun: [0xffffff, 1.15], hemi: [0xe6f1ff, 0x9fb3cc, 0.85] },
  skyislands: { sky: ['#4fb0f2', '#eef9ff'], fog: ['#eaf6ff', 170, 760], ground: null, sun: [0xfff4dc, 1.25], hemi: [0xd8efff, 0xb9d6e8, 0.85] },
  festival:   { sky: ['#140f3a', '#4b2c7f'], fog: ['#2e1f58', 110, 520], ground: ['#24402f', '#1a2f22'], sun: [0x9fb4ff, 0.35], hemi: [0x6b5bbf, 0x1a1530, 0.55], night: true },
  space:      { sky: ['#03050f', '#1a1d4c'], fog: ['#0b0d24', 220, 900], ground: null, sun: [0xffffff, 1.0], hemi: [0x8aa0ff, 0x10132a, 0.5], night: true },
  neon:       { sky: ['#07061f', '#3a1a6b'], fog: ['#1d1240', 120, 560], ground: null, sun: [0x8fa2ff, 0.35], hemi: [0x7c5cff, 0x120a2a, 0.55], night: true },
  city:       { sky: ['#5aa9f2', '#e6f3ff'], fog: ['#e2f0ff', 160, 700], ground: null, sun: [0xfff4dc, 1.25], hemi: [0xd4eaff, 0x8a8f99, 0.75] },
  stadium:    { sky: ['#4b9ce8', '#e3f2ff'], fog: ['#e3f2ff', 170, 720], ground: ['#5bb04a', '#3f8f36'], sun: [0xfff4dc, 1.25], hemi: [0xcfe8ff, 0x4f7a34, 0.75] },
  forest:     { sky: ['#5fa9df', '#e4f4ff'], fog: ['#d9eef5', 120, 560], ground: ['#4f8f3a', '#2f6b2b'], sun: [0xfff1d0, 1.15], hemi: [0xcfe8ff, 0x2f5a2a, 0.75] },
  canyon:     { sky: ['#e58a43', '#ffe2b4'], fog: ['#f7cf9f', 140, 640], ground: ['#d99a5b', '#b56f3c'], sun: [0xffd8a8, 1.3], hemi: [0xffe0bb, 0x8a4a2a, 0.7] },
  beach:      { sky: ['#3fa8ee', '#e3f6ff'], fog: ['#dff3ff', 170, 760], ground: null, sun: [0xfff4dc, 1.3], hemi: [0xd4eeff, 0xe8d29a, 0.8] },
  harbour:    { sky: ['#e8763f', '#ffd39b'], fog: ['#f5b98a', 150, 680], ground: null, sun: [0xffb070, 1.2], hemi: [0xffcf9e, 0x4a5a7a, 0.7] },
  volcano:    { sky: ['#2b1622', '#b8503a'], fog: ['#6b2f2a', 120, 560], ground: ['#3d3130', '#271f1f'], sun: [0xff9a6a, 0.9], hemi: [0xff8a6a, 0x2a1515, 0.6] },
  ocean:      { sky: ['#3f9eea', '#ddf2ff'], fog: ['#dbefff', 180, 800], ground: null, sun: [0xfff4dc, 1.3], hemi: [0xd4eeff, 0x2f6f9f, 0.8] },
  arctic:     { sky: ['#7fb8e8', '#f3f9ff'], fog: ['#eef6ff', 160, 720], ground: null, sun: [0xffffff, 1.15], hemi: [0xe6f1ff, 0x6f8fb0, 0.85] },
  saltflat:   { sky: ['#5aa6ec', '#f6ead6'], fog: ['#f1e5d0', 200, 860], ground: ['#efe6d6', '#d9cdb8'], sun: [0xfff2d8, 1.3], hemi: [0xe6f0ff, 0xc9b99a, 0.8] },
};

const RING_STYLE = {
  drone: { kind: 'hoop', color: 0x38bdf8, trim: 0xffffff },
  racedrone: { kind: 'gate', color: 0xec4899, trim: 0x22d3ee },
  jetplane: { kind: 'jet', color: 0xef4444, trim: 0xffffff },
};

/* ─── sky, ground, water ────────────────────────────────────────────────── */

export function skyDome(group, top, horizon, { stars = false, radius = 780, center = null } = {}) {
  const geo = new THREE.SphereGeometry(radius, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, horizon: { value: new THREE.Color(horizon) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 horizon; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.05,0.0,1.0); gl_FragColor = vec4(mix(horizon, top, pow(h,0.8)),1.0); }',
  });
  const dome = new THREE.Mesh(geo, m);
  if (center) dome.position.set(center.x, 0, center.z);
  dome.renderOrder = -10;
  dome.frustumCulled = false;
  group.add(dome);
  if (stars) {
    const rnd = rngFrom('stars'); const pts = [];
    for (let i = 0; i < 1400; i++) {
      const u = rnd() * Math.PI * 2, v = Math.acos(rnd() * 0.95);
      pts.push(Math.cos(u) * Math.sin(v) * 700, Math.cos(v) * 700, Math.sin(u) * Math.sin(v) * 700);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    group.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false })));
  }
}

/** Rolling ground that stays low under the course and rises into hills further out. */
export function terrain(group, ctx, { colors, hills = 14, far = 1.0, size = 1500, flatR = 24, baseY = 0 }) {
  const { route, center } = ctx;
  const seg = 150;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const c0 = new THREE.Color(colors[0]), c1 = new THREE.Color(colors[1]);
  const cols = [];
  const heightAt = (x, z) => {
    const n = Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.017 + 0.4) + 0.55 * Math.sin(x * 0.047 + z * 0.031)
      + 0.3 * Math.cos(x * 0.09 - z * 0.07);
    const d = route.dist(x, z);
    const ring = Math.hypot(x - center.x, z - center.z);
    return (n * 0.5 + 0.5) * hills * smooth(flatR, flatR + 70, d) + far * smooth(260, 560, ring) * 60;
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + center.x, z = pos.getZ(i) + center.z;
    const h = heightAt(x, z);
    pos.setY(i, h);
    const k = Math.min(1, h / (hills + 20)) * 0.8 + (Math.sin(x * 0.13) * Math.cos(z * 0.11) * 0.1);
    const col = c0.clone().lerp(c1, Math.max(0, Math.min(1, k)));
    cols.push(col.r, col.g, col.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
  mesh.position.set(center.x, baseY, center.z);
  mesh.receiveShadow = true;
  group.add(mesh);
  ctx.heightAt = baseY ? (x, z) => heightAt(x, z) + baseY : heightAt;
  return heightAt;
}

function water(group, ctx, { color = 0x2f8fd8, deep = 0x1d5fa8, size = 1700, y = 0, calm = false }) {
  const geo = new THREE.PlaneGeometry(size, size, 90, 90);
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.15, flatShading: true, emissive: deep, emissiveIntensity: 0.12 });
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(ctx.center.x, y, ctx.center.z);
  mesh.receiveShadow = true;
  group.add(mesh);
  if (!calm) {
    const pos = geo.attributes.position; const base = Float32Array.from(pos.array);
    arenaMover(ctx.scene, (t) => {
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], z = base[i * 3 + 2];
        pos.array[i * 3 + 1] = Math.sin(x * 0.09 + t * 1.1) * 0.35 + Math.cos(z * 0.07 + t * 0.8) * 0.3;
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    });
  }
  ctx.heightAt = () => y;
  return mesh;
}

/* ─── scenery pieces ────────────────────────────────────────────────────── */

export function scatter(ctx, count, { minR = 20, maxR = 320, clear = 10, tries = 8 } = {}) {
  const { rnd, center, route } = ctx; const out = [];
  for (let i = 0; i < count; i++) {
    for (let k = 0; k < tries; k++) {
      const a = rnd() * Math.PI * 2, r = lerp(minR, maxR, Math.sqrt(rnd()));
      const x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r;
      if (route.dist(x, z) >= clear && Math.hypot(x - ctx.spawn.x, z - ctx.spawn.z) > 14) { out.push({ x, z }); break; }
    }
  }
  return out;
}

export function trees(group, ctx, kind, count, opts = {}) {
  const { rnd } = ctx; const h = ctx.heightAt || (() => 0);
  const spots = scatter(ctx, count, { clear: opts.clear ?? 9, maxR: opts.maxR ?? 300, minR: opts.minR ?? 10 });
  const greens = opts.greens || [0x3f8f3a, 0x4ea844, 0x2f7a35, 0x5cb850];
  if (kind === 'pine') {
    const leaf = new THREE.ConeGeometry(1, 1, 7); leaf.translate(0, 0.5, 0);
    const trunk = new THREE.CylinderGeometry(0.18, 0.25, 1, 6); trunk.translate(0, 0.5, 0);
    const it = spots.map((p) => { const s = (opts.size || 1) * lerp(0.8, 1.5, rnd()); return { ...p, y: h(p.x, p.z), s }; });
    instanced(group, trunk, mat(0x6b4a2b), it.map((p) => ({ x: p.x, y: p.y, z: p.z, sx: p.s * 1.4, sy: p.s * 2.2, sz: p.s * 1.4 })));
    instanced(group, leaf, mat(0xffffff), it.map((p) => ({ x: p.x, y: p.y + p.s * 1.6, z: p.z, sx: p.s * 2.6, sy: p.s * 7.5, sz: p.s * 2.6, ry: rnd() * 3, color: opts.snowy ? 0xe8f0f8 : greens[Math.floor(rnd() * greens.length)] })), { shadow: true });
    if (opts.snowy) instanced(group, leaf, mat(0x2f6b3a), it.map((p) => ({ x: p.x, y: p.y + p.s * 1.5, z: p.z, sx: p.s * 2.7, sy: p.s * 5.2, sz: p.s * 2.7 })));
  } else if (kind === 'round') {
    const leaf = new THREE.IcosahedronGeometry(1, 0);
    const trunk = new THREE.CylinderGeometry(0.22, 0.3, 1, 6); trunk.translate(0, 0.5, 0);
    const it = spots.map((p) => { const s = (opts.size || 1) * lerp(0.8, 1.4, rnd()); return { ...p, y: h(p.x, p.z), s }; });
    instanced(group, trunk, mat(0x7a5532), it.map((p) => ({ x: p.x, y: p.y, z: p.z, sx: p.s * 1.3, sy: p.s * 2.4, sz: p.s * 1.3 })));
    instanced(group, leaf, mat(0xffffff), it.map((p) => ({ x: p.x, y: p.y + p.s * 3.4, z: p.z, s: p.s * 2.4, ry: rnd() * 3, color: greens[Math.floor(rnd() * greens.length)] })), { shadow: true });
  } else if (kind === 'palm') {
    const trunk = new THREE.CylinderGeometry(0.2, 0.32, 1, 6); trunk.translate(0, 0.5, 0);
    const frond = new THREE.ConeGeometry(0.5, 1, 4); frond.rotateX(Math.PI / 2); frond.translate(0, 0, 0.5);
    const it = spots.map((p) => ({ ...p, y: h(p.x, p.z), s: lerp(0.9, 1.3, rnd()), lean: (rnd() - 0.5) * 0.3 }));
    instanced(group, trunk, mat(0x9a7444), it.map((p) => ({ x: p.x, y: p.y, z: p.z, sx: p.s * 1.2, sy: p.s * 7, sz: p.s * 1.2, rz: p.lean })));
    const fr = [];
    it.forEach((p) => { for (let k = 0; k < 6; k++) fr.push({ x: p.x + Math.sin(p.lean) * -p.s * 7, y: p.y + p.s * 6.9, z: p.z, sx: p.s * 2.2, sy: p.s * 0.4, sz: p.s * 3.6, ry: (k / 6) * Math.PI * 2, rx: 0.35, color: k % 2 ? 0x3f9f45 : 0x2f8a3b }); });
    instanced(group, frond, mat(0xffffff), fr);
  } else if (kind === 'acacia') {
    const trunk = new THREE.CylinderGeometry(0.2, 0.3, 1, 6); trunk.translate(0, 0.5, 0);
    const top = new THREE.CylinderGeometry(1, 0.8, 0.5, 9);
    const it = spots.map((p) => ({ ...p, y: h(p.x, p.z), s: lerp(0.9, 1.5, rnd()) }));
    instanced(group, trunk, mat(0x6b4a2b), it.map((p) => ({ x: p.x, y: p.y, z: p.z, sx: p.s, sy: p.s * 4.5, sz: p.s })));
    instanced(group, top, mat(0x6f8f2f), it.map((p) => ({ x: p.x, y: p.y + p.s * 4.6, z: p.z, sx: p.s * 4.2, sy: p.s * 1.2, sz: p.s * 3.6 })), { shadow: true });
  }
}

export function clouds(group, ctx, count, { yMin = 40, yMax = 75, minR = 60, maxR = 420, color = 0xffffff, opacity = 0.96, flat = 0.55, size = 1 } = {}) {
  const { rnd } = ctx;
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const items = [];
  scatter(ctx, count, { minR, maxR, clear: 34 }).forEach((p) => {
    const y = lerp(yMin, yMax, rnd()); const s = lerp(6, 12, rnd()) * size;
    const puffs = 4 + Math.floor(rnd() * 4);
    for (let k = 0; k < puffs; k++) {
      items.push({ x: p.x + (k - puffs / 2) * s * 0.8, y: y + rnd() * s * 0.35, z: p.z + (rnd() - 0.5) * s, sx: s * lerp(0.8, 1.2, rnd()), sy: s * flat * lerp(0.8, 1.2, rnd()), sz: s * lerp(0.7, 1.1, rnd()) });
    }
  });
  instanced(group, geo, new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true, transparent: opacity < 1, opacity, emissive: color, emissiveIntensity: 0.18 }), items);
}

function mountainRing(group, ctx, { count = 26, minR = 380, maxR = 560, hMin = 60, hMax = 150, color = 0x7b8fa8, snow = true }) {
  const { rnd, center } = ctx;
  const cone = new THREE.ConeGeometry(1, 1, 6); cone.translate(0, 0.5, 0);
  const items = [], caps = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rnd() * 0.2, r = lerp(minR, maxR, rnd());
    const hh = lerp(hMin, hMax, rnd()), w = hh * lerp(0.9, 1.3, rnd());
    const x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r;
    items.push({ x, y: -2, z, sx: w, sy: hh, sz: w, ry: rnd() * 3 });
    if (snow) caps.push({ x, y: -2 + hh * 0.62, z, sx: w * 0.4, sy: hh * 0.38 + 0.5, sz: w * 0.4, ry: items[i].ry });
  }
  instanced(group, cone, mat(color), items);
  if (snow) instanced(group, cone, mat(0xf8fbff), caps);
}

function houses(group, ctx, spots) {
  const { rnd } = ctx; const h = ctx.heightAt || (() => 0);
  const body = new THREE.BoxGeometry(1, 1, 1); body.translate(0, 0.5, 0);
  const roof = new THREE.ConeGeometry(0.8, 1, 4); roof.rotateY(Math.PI / 4); roof.translate(0, 0.5, 0);
  const walls = [0xfef3c7, 0xffffff, 0xfde2e4, 0xe0f2fe, 0xfff7ed], roofs = [0xdc2626, 0xb45309, 0x2563eb, 0x7c3aed];
  const B = [], R = [];
  spots.forEach((p) => {
    const w = lerp(4, 6, rnd()), d = lerp(4, 7, rnd()), hh = lerp(3, 5, rnd()), y = h(p.x, p.z), ry = rnd() * 3;
    B.push({ x: p.x, y, z: p.z, sx: w, sy: hh, sz: d, ry, color: walls[Math.floor(rnd() * walls.length)] });
    R.push({ x: p.x, y: y + hh, z: p.z, sx: w * 0.95, sy: hh * 0.7, sz: d * 0.95, ry, color: roofs[Math.floor(rnd() * roofs.length)] });
  });
  instanced(group, body, mat(0xffffff), B, { shadow: true });
  instanced(group, roof, mat(0xffffff), R);
}

function windmill(group, ctx, x, z) {
  const y = (ctx.heightAt || (() => 0))(x, z);
  const g = new THREE.Group(); g.position.set(x, y, z);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.2, 14, 8), mat(0xf8fafc)); tower.position.y = 7; g.add(tower);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.5, 8), mat(0xdc2626)); cap.position.y = 15.2; g.add(cap);
  const hub = new THREE.Group(); hub.position.set(0, 13.5, 1.6); g.add(hub);
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 0.2), mat(0xfef3c7)); blade.position.y = 4.5;
    const arm = new THREE.Group(); arm.rotation.z = (i * Math.PI) / 2; arm.add(blade); hub.add(arm);
  }
  g.rotation.y = Math.atan2(ctx.center.x - x, ctx.center.z - z);
  group.add(g);
  arenaMover(ctx.scene, (t) => { hub.rotation.z = t * 0.8; });
}

function rainbow(group, ctx, at, span = 70) {
  const cols = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x3b82f6, 0x8b5cf6];
  const g = new THREE.Group(); g.position.set(at.x, 0, at.z);
  cols.forEach((c, i) => {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(span / 2 - i * 2.2, 1.1, 8, 64, Math.PI), mat(c, { emissive: c, ei: 0.35, flat: false, opacity: 0.85 }));
    g.add(arc);
  });
  g.rotation.y = at.angle;
  group.add(g);
}

function balloons(group, ctx, count) {
  const { rnd } = ctx; const cols = [0xef4444, 0xfacc15, 0x3b82f6, 0xec4899, 0x22c55e, 0xf97316];
  scatter(ctx, count, { minR: 30, maxR: 220, clear: 22 }).forEach((p, i) => {
    const g = new THREE.Group(); const y = lerp(22, 45, rnd()); g.position.set(p.x, y, p.z);
    const env = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 10), mat(cols[i % cols.length], { flat: false, rough: 0.6 })); env.scale.y = 1.2; g.add(env);
    const basket = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), mat(0x8b5a2b)); basket.position.y = -6.4; g.add(basket);
    group.add(g);
    const ph = rnd() * 6; arenaMover(ctx.scene, (t) => { g.position.y = y + Math.sin(t * 0.5 + ph) * 1.2; });
  });
}

function windsocks(group, ctx, count) {
  scatter(ctx, count, { minR: 15, maxR: 160, clear: 12 }).forEach((p) => {
    const y = (ctx.heightAt || (() => 0))(p.x, p.z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8, 6), mat(0xe5e7eb)); pole.position.set(p.x, y + 4, p.z);
    const sock = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4, 8, 1, true), mat(0xf97316, { flat: false })); sock.rotation.z = Math.PI / 2; sock.position.set(p.x + 2, y + 7.6, p.z);
    group.add(pole, sock);
  });
}

function crowdStand(group, ctx, x, z, ry, len = 40) {
  const g = new THREE.Group(); g.position.set(x, (ctx.heightAt || (() => 0))(x, z), z); g.rotation.y = ry;
  const tiers = 5; const crowd = [];
  for (let i = 0; i < tiers; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(len, 1.2, 2.4), mat(i % 2 ? 0x94a3b8 : 0xcbd5e1)); step.position.set(0, 0.6 + i * 1.2, i * 2.4); g.add(step);
    for (let k = 0; k < len / 1.3; k++) crowd.push({ x: -len / 2 + 0.8 + k * 1.3, y: 1.2 + i * 1.2 + 0.5, z: i * 2.4, s: 0.8, color: [0xef4444, 0x3b82f6, 0xfacc15, 0x22c55e, 0xec4899, 0xffffff][(k * 7 + i * 3) % 6] });
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(len + 2, 0.5, 14), mat(0x1e40af)); roof.position.set(0, 10, 5); g.add(roof);
  instanced(g, new THREE.BoxGeometry(0.7, 1, 0.7), mat(0xffffff), crowd);
  group.add(g);
}

function flags(group, ctx, count) {
  const cols = [0xef4444, 0xfacc15, 0x3b82f6, 0x22c55e, 0xec4899];
  scatter(ctx, count, { minR: 15, maxR: 140, clear: 10 }).forEach((p, i) => {
    const y = (ctx.heightAt || (() => 0))(p.x, p.z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 9, 6), mat(0xf8fafc)); pole.position.set(p.x, y + 4.5, p.z);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 0.08), mat(cols[i % cols.length])); flag.position.set(p.x + 1.5, y + 8, p.z);
    group.add(pole, flag);
  });
}

function buildings(group, ctx, { count = 160, night = false, minH = 14, maxH = 70, clear = 13, maxR = 260, roofs = null }) {
  const { rnd } = ctx;
  const winTex = canvasTex(64, 128, (c, w, h) => {
    c.fillStyle = night ? '#1b1638' : '#cfd8e6'; c.fillRect(0, 0, w, h);
    for (let y = 6; y < h; y += 12) for (let x = 6; x < w; x += 14) {
      const on = night ? (Math.random() < 0.55) : true;
      c.fillStyle = night ? (on ? ['#fde68a', '#a5f3fc', '#f0abfc'][Math.floor(Math.random() * 3)] : '#2a2450') : (Math.random() < 0.5 ? '#7dd3fc' : '#93c5fd');
      c.fillRect(x, y, 8, 7);
    }
  });
  winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  // Box UVs repeat the window grid; scale UVs so windows keep a similar size
  const m = new THREE.MeshStandardMaterial({
    map: winTex, color: 0xffffff, roughness: 0.6, metalness: 0.1,
    emissive: night ? 0xffffff : 0x000000, emissiveMap: night ? winTex : null, emissiveIntensity: night ? 0.9 : 0,
  });
  const spots = scatter(ctx, count, { minR: 8, maxR, clear });
  const colors = night ? [0x8b84c8, 0x7a90d6, 0x9b7bd0] : [0xffffff, 0xf1f5f9, 0xe2e8f0, 0xfef3c7, 0xe0f2fe];
  const items = spots.map((p) => {
    const w = lerp(7, 13, rnd());
    const d = route2(ctx, p);
    const hh = lerp(minH, maxH, rnd()) * (d < 30 ? 0.8 : 1);
    return { x: p.x, y: 0, z: p.z, sx: w, sy: hh, sz: lerp(7, 13, rnd()), color: colors[Math.floor(rnd() * colors.length)] };
  });
  (roofs || []).forEach((r) => items.push({ x: r.x, y: 0, z: r.z, sx: 12, sy: r.h, sz: 12, color: 0xf8fafc }));
  instanced(group, box, m, items, { shadow: true });
  if (night) {
    // Neon strips on some rooftops
    const strip = new THREE.BoxGeometry(1, 0.6, 1);
    instanced(group, strip, new THREE.MeshBasicMaterial({ color: 0xffffff }), items.filter((_, i) => i % 3 === 0).map((it, i) => ({ x: it.x, y: it.sy + 0.3, z: it.z, sx: it.sx + 0.4, sy: 1, sz: it.sz + 0.4, color: [0xec4899, 0x22d3ee, 0xa855f7, 0xfacc15][i % 4] })));
  }
  return items;
}
const route2 = (ctx, p) => ctx.route.dist(p.x, p.z);

function neonGround(group, ctx) {
  const tex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#0c0a24'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#7c3aed'; c.lineWidth = 3; c.strokeRect(0, 0, w, h);
    c.strokeStyle = 'rgba(34,211,238,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
  }, { repeat: [90, 90] });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.6, roughness: 0.5, metalness: 0.3 }));
  g.rotation.x = -Math.PI / 2; g.position.set(ctx.center.x, -0.05, ctx.center.z); group.add(g);
  ctx.heightAt = () => 0;
}

function plainGround(group, ctx, color, tex = null) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), new THREE.MeshStandardMaterial({ color, map: tex, roughness: 0.95 }));
  g.rotation.x = -Math.PI / 2; g.position.set(ctx.center.x, 0, ctx.center.z); g.receiveShadow = true; group.add(g);
  ctx.heightAt = () => 0;
}

export function islands(group, ctx, count, { floating = false, minR = 40, maxR = 320, palms = true, sizeMin = 10, sizeMax = 26 } = {}) {
  const { rnd } = ctx;
  const spots = scatter(ctx, count, { minR, maxR, clear: floating ? 26 : 22 });
  spots.forEach((p) => {
    const r = lerp(sizeMin, sizeMax, rnd()); const g = new THREE.Group();
    const y0 = floating ? lerp(-25, 6, rnd()) : 0;
    g.position.set(p.x, y0, p.z);
    if (floating) {
      const rock = new THREE.Mesh(new THREE.ConeGeometry(r, r * 1.6, 7), mat(0x8b6b4a)); rock.rotation.x = Math.PI; rock.position.y = -r * 0.8; g.add(rock);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.02, r, 2, 7), mat(0x6cc04a)); top.position.y = 1; g.add(top);
      const fall = new THREE.Mesh(new THREE.BoxGeometry(2, r * 1.4, 0.6), mat(0x7dd3fc, { opacity: 0.8, emissive: 0x7dd3fc, ei: 0.3 })); fall.position.set(r * 0.9, -r * 0.6, 0); g.add(fall);
      const ph = rnd() * 6; arenaMover(ctx.scene, (t) => { g.position.y = y0 + Math.sin(t * 0.4 + ph) * 0.8; });
    } else {
      const sand = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.15, r * 1.3, 1.4, 12), mat(0xf3dca0)); sand.position.y = 0.2; g.add(sand);
      const hill = new THREE.Mesh(new THREE.ConeGeometry(r * 0.85, r * 0.7, 9), mat(0x4caf50)); hill.position.y = r * 0.35; g.add(hill);
    }
    if (palms) {
      for (let k = 0; k < 3; k++) {
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 6, 6), mat(0x9a7444));
        const a = rnd() * 6, rr = r * 0.6;
        tr.position.set(Math.cos(a) * rr, (floating ? 2 : 1) + 3, Math.sin(a) * rr); g.add(tr);
        const top = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 0), mat(0x2f9a45)); top.scale.y = 0.5; top.position.set(tr.position.x, tr.position.y + 3, tr.position.z); g.add(top);
      }
    }
    group.add(g);
  });
}

export function boats(group, ctx, count) {
  const { rnd } = ctx;
  scatter(ctx, count, { minR: 20, maxR: 260, clear: 14 }).forEach((p, i) => {
    const g = new THREE.Group(); g.position.set(p.x, 0.2, p.z); g.rotation.y = rnd() * 6;
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 7), mat([0xffffff, 0xef4444, 0x1e40af][i % 3])); hull.position.y = 0.5; g.add(hull);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 8, 5), mat(0xd1d5db)); mast.position.y = 5; g.add(mast);
    const sail = new THREE.Mesh(new THREE.ConeGeometry(2.4, 7, 3), mat(0xfefce8)); sail.scale.z = 0.15; sail.position.set(0, 5, 0.6); g.add(sail);
    group.add(g);
    const ph = rnd() * 6; arenaMover(ctx.scene, (t) => { g.rotation.z = Math.sin(t * 0.9 + ph) * 0.06; });
  });
}

function lighthouse(group, ctx, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const rock = new THREE.Mesh(new THREE.CylinderGeometry(8, 10, 3, 9), mat(0x6b7280)); rock.position.y = 1; g.add(rock);
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(2.4 - i * 0.2, 2.6 - i * 0.2, 4, 12), mat(i % 2 ? 0xffffff : 0xdc2626, { flat: false })); seg.position.y = 4.5 + i * 4; g.add(seg);
  }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })); lamp.position.y = 25; g.add(lamp);
  group.add(g);
}

function carrier(group, ctx, spawn) {
  const g = new THREE.Group(); g.position.set(spawn.x, 0, spawn.z - 18);
  const deckTex = canvasTex(128, 512, (c, w, h) => {
    c.fillStyle = '#4b5563'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#facc15'; c.lineWidth = 3; c.setLineDash([18, 14]); c.beginPath(); c.moveTo(w / 2, 10); c.lineTo(w / 2, h - 10); c.stroke();
    c.setLineDash([]); c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#ffffff'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText('BB', w / 2, h - 40);
  });
  const hull = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 70), mat(0x64748b)); hull.position.y = SKY_SPAWN_Y - 0.6 - 3; g.add(hull);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(8, 14, 4), mat(0x64748b)); bow.rotation.set(-Math.PI / 2, Math.PI / 4, 0); bow.scale.set(1, 1, 0.42); bow.position.set(0, SKY_SPAWN_Y - 3.6, -42); g.add(bow);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 72), new THREE.MeshStandardMaterial({ map: deckTex, roughness: 0.8 })); deck.position.y = SKY_SPAWN_Y - 0.6; g.add(deck);
  const tower = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 10), mat(0x94a3b8)); tower.position.set(8.5, SKY_SPAWN_Y + 3.6, -8); g.add(tower);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 6, 6), mat(0xe5e7eb)); mast.position.set(8.5, SKY_SPAWN_Y + 10.5, -8); g.add(mast);
  const radar = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 0.3), mat(0xe5e7eb)); radar.position.set(8.5, SKY_SPAWN_Y + 13, -8); g.add(radar);
  arenaMover(ctx.scene, (t) => { radar.rotation.y = t * 1.5; });
  group.add(g);
  return SKY_SPAWN_Y - 0.4;
}

function icebergs(group, ctx, count) {
  const { rnd } = ctx;
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const items = scatter(ctx, count, { minR: 15, maxR: 300, clear: 14 }).map((p) => { const s = lerp(4, 12, rnd()); return { x: p.x, y: s * 0.2, z: p.z, sx: s * 1.4, sy: s, sz: s * 1.1, ry: rnd() * 3 }; });
  instanced(group, geo, mat(0xeaf6ff, { emissive: 0xbfe3ff, ei: 0.15 }), items, { shadow: true });
  const floes = scatter(ctx, count * 2, { minR: 5, maxR: 260, clear: 0 }).map((p) => ({ x: p.x, y: 0.15, z: p.z, sx: lerp(3, 9, rnd()), sy: 0.4, sz: lerp(3, 8, rnd()), ry: rnd() * 3 }));
  instanced(group, new THREE.CylinderGeometry(1, 1, 1, 6), mat(0xf8fbff), floes);
}

function volcano(group, ctx, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(14, 70, 85, 11, 4), mat(0x4a3532)); cone.position.y = 42; g.add(cone);
  const lava = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 2, 11), new THREE.MeshBasicMaterial({ color: 0xff6a1a })); lava.position.y = 84.5; g.add(lava);
  for (let i = 0; i < 4; i++) {
    const river = new THREE.Mesh(new THREE.BoxGeometry(3, 60, 1), new THREE.MeshBasicMaterial({ color: 0xff7a1a }));
    const a = (i / 4) * Math.PI * 2 + 0.4; river.position.set(Math.cos(a) * 40, 42, Math.sin(a) * 40); river.lookAt(0, 120, 0); river.rotateX(Math.PI / 2); g.add(river);
  }
  const glow = new THREE.PointLight(0xff6a1a, 3, 160); glow.position.y = 92; g.add(glow);
  const smokeGeo = new THREE.IcosahedronGeometry(1, 1); const puffs = [];
  for (let i = 0; i < 14; i++) {
    const p = new THREE.Mesh(smokeGeo, mat(0x4b4545, { opacity: 0.55 })); g.add(p); puffs.push({ p, ph: i / 14 });
  }
  arenaMover(ctx.scene, (t) => puffs.forEach(({ p, ph }) => {
    const k = (t * 0.06 + ph) % 1; p.position.set(Math.sin(ph * 20) * 6 + k * 18, 88 + k * 70, Math.cos(ph * 13) * 6); p.scale.setScalar(4 + k * 14);
  }));
  group.add(g);
}

function canyonWalls(group, ctx) {
  const { rnd } = ctx; const items = [];
  const cols = [0xc2410c, 0xd97706, 0xb45309, 0xea580c, 0x9a3412];
  const pts = ctx.route.samples;
  for (let i = 0; i < pts.length; i += 3) {
    const p = pts[i]; const n = pts[Math.min(pts.length - 1, i + 1)];
    const tx = n.x - p.x, tz = n.z - p.z, L = Math.hypot(tx, tz) || 1;
    [-1, 1].forEach((side) => {
      const off = lerp(23, 30, rnd());
      const x = p.x + (-tz / L) * side * off, z = p.z + (tx / L) * side * off;
      if (ctx.route.dist(x, z) < 20) return;
      const hh = lerp(22, 42, rnd());
      for (let k = 0; k < 3; k++) items.push({ x: x + (rnd() - 0.5) * 6, y: (hh / 3) * k, z: z + (rnd() - 0.5) * 6, sx: lerp(10, 16, rnd()) - k * 2, sy: hh / 3 + 0.5, sz: lerp(10, 16, rnd()) - k * 2, ry: rnd() * 3, color: cols[(i + k) % cols.length] });
    });
  }
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  instanced(group, box, mat(0xffffff), items, { shadow: true });
  // Mesas in the distance
  const mesas = scatter(ctx, 30, { minR: 120, maxR: 420, clear: 40 }).map((p) => ({ x: p.x, y: 0, z: p.z, sx: lerp(20, 50, rnd()), sy: lerp(25, 70, rnd()), sz: lerp(20, 50, rnd()), color: cols[Math.floor(rnd() * cols.length)] }));
  instanced(group, new THREE.CylinderGeometry(1, 1.15, 1, 7).translate(0, 0.5, 0), mat(0xffffff), mesas);
}

function stadiumBowl(group, ctx, grandPrix) {
  const { center } = ctx; const R = Math.max(70, ctx.route.radius + 26);
  const g = new THREE.Group(); g.position.set(center.x, 0, center.z);
  const pitch = new THREE.Mesh(new THREE.CircleGeometry(R - 6, 48), mat(0x4caf50)); pitch.rotation.x = -Math.PI / 2; pitch.position.y = 0.05; g.add(pitch);
  const lines = new THREE.Mesh(new THREE.RingGeometry(R * 0.35, R * 0.36, 48), new THREE.MeshBasicMaterial({ color: 0xffffff })); lines.rotation.x = -Math.PI / 2; lines.position.y = 0.1; g.add(lines);
  const crowd = []; const seats = [0xef4444, 0x3b82f6, 0xfacc15, 0x22c55e, 0xffffff, 0xec4899];
  for (let tier = 0; tier < 7; tier++) {
    const r = R + tier * 3;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(r + 3, r + 3, 1.6, 64, 1, true), mat(tier % 2 ? 0x94a3b8 : 0xcbd5e1, { flat: false }));
    ring.material.side = THREE.DoubleSide; ring.position.y = tier * 1.8 + 0.8; g.add(ring);
    const n = Math.floor((Math.PI * 2 * r) / 1.6);
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; crowd.push({ x: Math.cos(a) * (r + 1.5), y: tier * 1.8 + 2.1, z: Math.sin(a) * (r + 1.5), s: 0.9, color: seats[(k * 5 + tier) % seats.length] }); }
  }
  instanced(g, new THREE.BoxGeometry(0.8, 1, 0.8), mat(0xffffff), crowd);
  const roof = new THREE.Mesh(new THREE.TorusGeometry(R + 14, 3, 6, 64), mat(0x1e3a8a)); roof.rotation.x = Math.PI / 2; roof.position.y = 16; g.add(roof);
  // Big screen
  const screenTex = canvasTex(512, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#7c3aed'); gr.addColorStop(1, '#ec4899'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.font = 'bold 64px sans-serif'; c.textAlign = 'center'; c.fillText(grandPrix ? 'GRAND PRIX' : 'DRONE RACE', w / 2, 120); c.font = 'bold 40px sans-serif'; c.fillText('ByteBuddies', w / 2, 190);
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), new THREE.MeshBasicMaterial({ map: screenTex })); screen.position.set(0, 32, -(R + 20)); g.add(screen);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(32, 17, 1), mat(0x111827)); frame.position.set(0, 32, -(R + 20.6)); g.add(frame);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(2, 24, 2), mat(0x374151)); leg.position.set(0, 12, -(R + 20.6)); g.add(leg);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 34, 6), mat(0x9ca3af)); pole.position.set(Math.cos(a) * (R + 24), 17, Math.sin(a) * (R + 24)); g.add(pole);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 1), new THREE.MeshBasicMaterial({ color: 0xfffbe6 })); lamp.position.set(pole.position.x, 34, pole.position.z); lamp.lookAt(0, 0, 0); g.add(lamp);
  }
  group.add(g);
  ctx.heightAt = () => 0;
}

function festival(group, ctx) {
  const { rnd } = ctx; const cols = [0xef4444, 0xfacc15, 0x3b82f6, 0xec4899, 0x22c55e, 0xa855f7];
  scatter(ctx, 18, { minR: 15, maxR: 120, clear: 12 }).forEach((p, i) => {
    const y = ctx.heightAt(p.x, p.z);
    const tent = new THREE.Mesh(new THREE.ConeGeometry(5, 6, 8), mat(cols[i % cols.length], { emissive: cols[i % cols.length], ei: 0.25 })); tent.position.set(p.x, y + 3, p.z); group.add(tent);
  });
  // Strings of lanterns between poles
  const glow = new THREE.SphereGeometry(0.5, 8, 6); const items = [];
  scatter(ctx, 14, { minR: 10, maxR: 110, clear: 10 }).forEach((p, i) => {
    const a = rnd() * Math.PI; const y = ctx.heightAt(p.x, p.z) + 6;
    for (let k = 0; k < 10; k++) items.push({ x: p.x + Math.cos(a) * (k - 5) * 2, y: y - Math.sin((k / 9) * Math.PI) * 1.5, z: p.z + Math.sin(a) * (k - 5) * 2, color: cols[(k + i) % cols.length] });
  });
  instanced(group, glow, new THREE.MeshBasicMaterial({ color: 0xffffff }), items);
  // Ferris wheel
  const w = new THREE.Group(); const fp = scatter(ctx, 1, { minR: 50, maxR: 90, clear: 30 })[0] || { x: 60, z: -60 };
  w.position.set(fp.x, 22, fp.z);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(18, 0.6, 8, 48), new THREE.MeshBasicMaterial({ color: 0xf472b6 })); w.add(rim);
  for (let k = 0; k < 12; k++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.3, 18, 0.3), mat(0xe5e7eb)); spoke.rotation.z = (k / 12) * Math.PI * 2; spoke.position.set(Math.sin(-spoke.rotation.z) * -9, Math.cos(spoke.rotation.z) * 9, 0); w.add(spoke);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color: cols[k % cols.length] })); cab.position.set(Math.cos((k / 12) * Math.PI * 2) * 18, Math.sin((k / 12) * Math.PI * 2) * 18, 0); w.add(cab);
  }
  w.rotation.y = rnd() * 3; group.add(w);
  arenaMover(ctx.scene, (t) => { w.rotation.z = t * 0.15; });
}

function spaceScene(group, ctx) {
  const planet = new THREE.Mesh(new THREE.SphereGeometry(160, 48, 32), mat(0x3b82f6, { flat: false, rough: 0.9, emissive: 0x1e3a8a, ei: 0.25 }));
  planet.position.set(ctx.center.x - 120, -230, ctx.center.z - 160); group.add(planet);
  const clouds2 = new THREE.Mesh(new THREE.SphereGeometry(162, 48, 32), mat(0xffffff, { flat: false, opacity: 0.28 })); clouds2.position.copy(planet.position); group.add(clouds2);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 20), mat(0xcbd5e1, { flat: false })); moon.position.set(ctx.center.x + 220, 120, ctx.center.z - 320); group.add(moon);
  const { rnd } = ctx; const rocks = scatter(ctx, 50, { minR: 30, maxR: 260, clear: 16 }).map((p) => ({ x: p.x, y: lerp(-20, 40, rnd()), z: p.z, s: lerp(1.5, 5, rnd()), rx: rnd() * 3, ry: rnd() * 3 }));
  instanced(group, new THREE.DodecahedronGeometry(1, 0), mat(0x8b8178), rocks);
  // Station at the end of the course
  const st = new THREE.Group(); const e = ctx.end; st.position.set(e.x + Math.sin(e.angle) * 30, e.y + 4, e.z + Math.cos(e.angle) * 30);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(16, 2.2, 12, 48), mat(0xe5e7eb, { flat: false, metal: 0.4, rough: 0.4 })); st.add(ring);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 18, 16), mat(0xcbd5e1, { flat: false, metal: 0.4 })); hub.rotation.x = Math.PI / 2; st.add(hub);
  for (let k = 0; k < 4; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(1, 32, 1), mat(0x94a3b8)); sp.rotation.z = (k * Math.PI) / 4; st.add(sp); }
  [-1, 1].forEach((s) => { const panel = new THREE.Mesh(new THREE.BoxGeometry(22, 0.3, 7), mat(0x1d4ed8, { emissive: 0x1e40af, ei: 0.4, metal: 0.5 })); panel.position.set(s * 28, 0, 0); st.add(panel); });
  st.rotation.y = e.angle; group.add(st);
  arenaMover(ctx.scene, (t) => { ring.rotation.z = t * 0.2; });
  ctx.heightAt = () => -100;
}

function skyIslandsScene(group, ctx) {
  // A soft sea of cloud far below and islands floating at the sides of the course
  clouds(group, ctx, 60, { yMin: -40, yMax: -26, minR: 0, maxR: 520, flat: 0.35, size: 2.2 });
  islands(group, ctx, 16, { floating: true, minR: 30, maxR: 260 });
  ctx.heightAt = () => -40;
}

/* ─── course pieces ─────────────────────────────────────────────────────── */

export function makeRing(style, i) {
  const g = new THREE.Group();
  const own = (c, ei = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: ei, roughness: 0.35, metalness: 0.1, transparent: true });
  let main;
  if (style.kind === 'gate') {
    const m = own(style.color, 0.9); main = m;
    const S = 3.6, T = 0.45;
    [[0, S, S * 2 + T, T], [0, -S, S * 2 + T, T], [S, 0, T, S * 2], [-S, 0, T, S * 2]].forEach(([x, y, w, h]) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, T), m); bar.position.set(x, y, 0); g.add(bar);
    });
    const inner = new THREE.Mesh(new THREE.BoxGeometry(S * 2 - 1.2, 0.12, 0.12), own(style.trim, 1)); inner.position.y = S - 0.6; g.add(inner);
    const inner2 = inner.clone(); inner2.position.y = -S + 0.6; g.add(inner2);
  } else if (style.kind === 'jet') {
    const tex = canvasTex(256, 16, (c, w, h) => { for (let k = 0; k < 16; k++) { c.fillStyle = k % 2 ? '#ffffff' : '#ef4444'; c.fillRect((k * w) / 16, 0, w / 16 + 1, h); } });
    main = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.4, transparent: true });
    g.add(new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.55, 14, 48), main));
  } else {
    main = own(style.color, 0.35);
    g.add(new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.48, 16, 48), main));
    const trim = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.16, 8, 48), own(style.trim, 0.4)); trim.position.z = 0.42; g.add(trim);
  }
  const fill = new THREE.Mesh(new THREE.CircleGeometry(style.kind === 'jet' ? 4 : 3.3, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }));
  g.add(fill);
  const label = labelSprite(String(i + 1), { size: 1.7 }); label.position.y = style.kind === 'jet' ? 6.2 : 5.4; g.add(label);
  g.userData.ringMat = main; g.userData.fill = fill; g.userData.label = label;
  return g;
}

export function guideDots(group, ctx, from) {
  const pts = ctx.flight; const items = []; let acc = 0;
  for (let i = Math.max(1, from); i < pts.length; i++) {
    acc += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y, pts[i].z - pts[i - 1].z);
    if (acc >= 3.2) { acc = 0; items.push({ x: pts[i].x, y: pts[i].y, z: pts[i].z, s: 0.2 }); }
  }
  instanced(group, new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }), items);
}

function startPad(group, ctx, style) {
  const s = ctx.spawn; const top = SKY_SPAWN_Y - 0.6;
  const tex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#1f2937'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#facc15'; c.lineWidth = 10; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 22, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#ffffff'; c.font = 'bold 120px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('H', w / 2, h / 2 + 6);
  });
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, 0.4, 32), [mat(0x374151), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }), mat(0x374151)]);
  pad.position.set(s.x, top - 0.25, s.z); group.add(pad);
  const groundY = Math.min(ctx.heightAt ? ctx.heightAt(s.x, s.z) : 0, top - 1);
  if (top - groundY > 1.2) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, top - groundY, 10), mat(0x9ca3af)); leg.position.set(s.x, groundY + (top - groundY) / 2 - 0.25, s.z); group.add(leg);
  }
  const lights = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: style.color })); l.position.set(s.x + Math.cos(a) * 2.2, top, s.z + Math.sin(a) * 2.2); group.add(l); lights.push(l);
  }
  arenaMover(ctx.scene, (t) => lights.forEach((l, k) => { l.visible = Math.floor(t * 4 + k) % 8 !== 0; }));
}

export function finishGate(group, ctx) {
  const e = ctx.end; const g = new THREE.Group(); g.position.set(e.x, e.y, e.z); g.rotation.y = e.angle;
  const tex = canvasTex(256, 32, (c, w, h) => { for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { c.fillStyle = (x + y) % 2 ? '#111827' : '#ffffff'; c.fillRect((x * w) / 16, (y * h) / 2, w / 16 + 1, h / 2 + 1); } });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 0.6, 12, 48), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.2 }));
  g.add(ring);
  const banner = bannerSprite('FINISH', { bg: '#16a34a', w: 7 }); banner.position.y = 7.4; g.add(banner);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(4.6, 32), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
  g.add(glow);
  group.add(g);
  arenaMover(ctx.scene, (t) => { ring.rotation.z = t * 0.6; });
}

/* ─── route measuring ───────────────────────────────────────────────────── */

export function routeIndex(flight) {
  const samples = flight.filter((_, i) => i % 2 === 0);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  samples.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); });
  const center = { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 };
  const radius = Math.max(...samples.map((p) => Math.hypot(p.x - center.x, p.z - center.z)));
  return {
    samples, center, radius, bbox: { minX, maxX, minZ, maxZ },
    dist(x, z) { let m = Infinity; for (const p of samples) { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < m) m = d; } return Math.sqrt(m); },
  };
}

/* ─── world per theme ───────────────────────────────────────────────────── */

function buildWorld(group, ctx, theme, course, chassisId) {
  const T = moodTheme(THEMES[theme] || THEMES.meadow, ctx.mood);
  switch (theme) {
    case 'meadow': case 'rainbow': case 'airshow': {
      terrain(group, ctx, { colors: T.ground, hills: 12 });
      mountainRing(group, ctx, { color: 0x7d93ad });
      trees(group, ctx, 'round', 170); trees(group, ctx, 'pine', 80, { minR: 120 });
      houses(group, ctx, scatter(ctx, 14, { minR: 25, maxR: 150, clear: 12 }));
      windmill(group, ctx, ...(() => { const p = scatter(ctx, 1, { minR: 40, maxR: 90, clear: 22 })[0] || { x: 50, z: -40 }; return [p.x, p.z]; })());
      clouds(group, ctx, 22);
      if (theme === 'rainbow') rainbow(group, ctx, ctx.flight[Math.floor(ctx.flight.length * 0.55)], 80);
      if (theme === 'airshow') {
        const mid = ctx.flight[Math.floor(ctx.flight.length / 2)];
        crowdStand(group, ctx, mid.x + Math.cos(mid.angle) * 34, mid.z - Math.sin(mid.angle) * 34, mid.angle + Math.PI / 2);
        flags(group, ctx, 16);
      }
      if (course.balloons) balloons(group, ctx, 9);
      if (course.windsocks) windsocks(group, ctx, 10);
      break;
    }
    case 'savanna':
      terrain(group, ctx, { colors: T.ground, hills: 8 });
      trees(group, ctx, 'acacia', 70);
      instanced(group, new THREE.DodecahedronGeometry(1, 0), mat(0xa16207), scatter(ctx, 40, { clear: 8 }).map((p) => ({ x: p.x, y: 0.5, z: p.z, s: lerp(1.5, 4, ctx.rnd()) })));
      mountainRing(group, ctx, { color: 0xb45309, snow: false, hMin: 40, hMax: 90 });
      clouds(group, ctx, 10, { color: 0xfff1dc });
      break;
    case 'snow':
      terrain(group, ctx, { colors: T.ground, hills: 18 });
      mountainRing(group, ctx, { color: 0x94a3b8, minR: 200, maxR: 420, hMin: 90, hMax: 190 });
      instanced(group, new THREE.ConeGeometry(1, 1, 6).translate(0, 0.5, 0), mat(0xdfe8f3), scatter(ctx, 14, { minR: 40, maxR: 160, clear: 38 }).map((p) => { const hh = lerp(35, 70, ctx.rnd()); return { x: p.x, y: -2, z: p.z, sx: hh * 0.8, sy: hh, sz: hh * 0.8, ry: ctx.rnd() * 3 }; }));
      trees(group, ctx, 'pine', 160, { snowy: false, greens: [0x1f5132, 0x2b6a3e, 0x24563a] });
      houses(group, ctx, scatter(ctx, 6, { minR: 20, maxR: 90, clear: 12 }));
      clouds(group, ctx, 12);
      break;
    case 'skyislands':
      skyIslandsScene(group, ctx); clouds(group, ctx, 18, { yMin: 30, yMax: 60 });
      break;
    case 'festival':
      terrain(group, ctx, { colors: T.ground, hills: 6 });
      festival(group, ctx); trees(group, ctx, 'round', 80, { greens: [0x1d4d34, 0x245c3c] });
      break;
    case 'space':
      spaceScene(group, ctx);
      break;
    case 'neon':
      neonGround(group, ctx);
      buildings(group, ctx, { count: 220, night: true, minH: 18, maxH: 80, clear: 14 });
      break;
    case 'city': {
      plainGround(group, ctx, 0x9ca3af);
      const roofs = (ctx.stations || []).map((s) => ({ x: s.x, z: s.z, h: Math.max(4, ctx.landY - 0.8) }));
      buildings(group, ctx, { count: 160, night: false, minH: 12, maxH: 45, clear: 14, roofs });
      trees(group, ctx, 'round', 40, { clear: 10 });
      clouds(group, ctx, 14);
      break;
    }
    case 'stadium':
      plainGround(group, ctx, 0x6ab04c);
      stadiumBowl(group, ctx, course.grandPrix);
      trees(group, ctx, 'round', 60, { minR: Math.max(110, ctx.route.radius + 70) });
      clouds(group, ctx, 14);
      if (course.grandPrix) flags(group, ctx, 12);
      break;
    case 'forest':
      terrain(group, ctx, { colors: T.ground, hills: 8 });
      trees(group, ctx, 'pine', 420, { clear: 6, size: 1.6, maxR: 260, greens: [0x245c2f, 0x2f6b35, 0x1f4f2a, 0x3a7a3a] });
      mountainRing(group, ctx, { color: 0x5b7a6a });
      clouds(group, ctx, 10);
      break;
    case 'canyon':
      plainGround(group, ctx, 0xd99a5b);
      canyonWalls(group, ctx);
      clouds(group, ctx, 8, { color: 0xfff3e0 });
      break;
    case 'beach': {
      water(group, ctx, { color: 0x1ea0d8 });
      const sand = new THREE.Mesh(new THREE.PlaneGeometry(60, 900), mat(0xf3dca0, { flat: false }));
      sand.rotation.x = -Math.PI / 2; sand.rotation.z = ctx.flight[0].angle; sand.position.set(ctx.center.x + 30, 0.5, ctx.center.z); group.add(sand);
      trees(group, ctx, 'palm', 40, { clear: 10, maxR: 200 }); islands(group, ctx, 6, { minR: 120 }); boats(group, ctx, 8);
      lighthouse(group, ctx, ...(() => { const p = scatter(ctx, 1, { minR: 70, maxR: 120, clear: 30 })[0] || { x: 80, z: -80 }; return [p.x, p.z]; })());
      clouds(group, ctx, 16);
      break;
    }
    case 'harbour':
      water(group, ctx, { color: 0x2a6fa8, deep: 0xff8a50 });
      boats(group, ctx, 16); islands(group, ctx, 5, { minR: 140 });
      lighthouse(group, ctx, ...(() => { const p = scatter(ctx, 1, { minR: 50, maxR: 90, clear: 26 })[0] || { x: 60, z: -60 }; return [p.x, p.z]; })());
      buildings(group, ctx, { count: 50, minH: 8, maxH: 22, clear: 60, maxR: 360 });
      clouds(group, ctx, 12, { color: 0xffd7b5 });
      break;
    case 'volcano': {
      terrain(group, ctx, { colors: T.ground, hills: 10 });
      // Ahead of the finish so it fills the view from the start, safely off the course
      const e = ctx.end; const dx = e.x - ctx.spawn.x, dz = e.z - ctx.spawn.z, L = Math.hypot(dx, dz) || 1;
      volcano(group, ctx, e.x + (dx / L) * 120 + (dz / L) * 25, e.z + (dz / L) * 120 - (dx / L) * 25);
      instanced(group, new THREE.DodecahedronGeometry(1, 0), mat(0x2b2323), scatter(ctx, 60, { clear: 8 }).map((q) => ({ x: q.x, y: ctx.heightAt(q.x, q.z), z: q.z, s: lerp(1.5, 5, ctx.rnd()) })));
      mountainRing(group, ctx, { color: 0x3f2f2f, snow: false });
      break;
    }
    case 'ocean':
      water(group, ctx, { color: 0x1e90d8 });
      islands(group, ctx, 12, { minR: 50 }); boats(group, ctx, 6);
      clouds(group, ctx, 20);
      break;
    case 'arctic':
      water(group, ctx, { color: 0x1f5f9a, deep: 0x0b3a66, calm: true });
      icebergs(group, ctx, 26);
      mountainRing(group, ctx, { color: 0xb6c8de, hMin: 70, hMax: 160 });
      clouds(group, ctx, 12);
      break;
    case 'saltflat': {
      plainGround(group, ctx, 0xefe6d6);
      mountainRing(group, ctx, { color: 0xb08968, snow: false, minR: 300, maxR: 520, hMin: 40, hMax: 100 });
      // Speed pylons line the straight
      const pyl = []; const pts = ctx.route.samples;
      for (let i = 18; i < pts.length; i += 6) {
        const p = pts[i]; [-1, 1].forEach((s) => pyl.push({ x: p.x + Math.cos(p.angle) * s * 12, y: 0, z: p.z - Math.sin(p.angle) * s * 12, sx: 1, sy: 7, sz: 1, color: i % 12 ? 0xef4444 : 0xffffff }));
      }
      instanced(group, new THREE.CylinderGeometry(0.5, 0.8, 1, 8).translate(0, 0.5, 0), mat(0xffffff), pyl);
      clouds(group, ctx, 10);
      break;
    }
    default:
      terrain(group, ctx, { colors: T.ground || ['#86c95c', '#4f9a3c'] });
  }
  if (course.carrier) carrier(group, ctx, ctx.spawn);
}

/* ─── main entry ────────────────────────────────────────────────────────── */

export function hasStudioSkyCourse(challenge, robotConfig) {
  const id = challenge?.chassisId || robotConfig?.chassisId;
  return Boolean(challenge?.isChassisMode && getSkyCourse(id, challenge?.modeIndex || 1));
}

export function buildStudioSkyCourse(scene, challenge, robotConfig = null) {
  const chassisId = challenge?.chassisId || robotConfig?.chassisId;
  const course = getSkyCourse(chassisId, challenge?.modeIndex || 1);
  if (!course) return false;
  const arena = getPrimaryStudioArena(chassisId, course.mode);
  const action = getMissionAction({ ...challenge, chassisId, arenaBible: true, modeIndex: course.mode });
  const style = RING_STYLE[chassisId] || RING_STYLE.drone;
  const theme = course.theme;
  const mood = course.mode > 10 ? getTierMood(chassisId, course.mode) : null;
  const T = moodTheme(THEMES[theme] || THEMES.meadow, mood);

  // Landing missions: the robot drops 5 below cruise height onto each pad
  const firstUp = Number(course.tokens[0].slice(1)) || 8;
  const cruise = SKY_SPAWN_Y + firstUp;
  const landY = cruise - 5 + 0.5;
  const tokens = course.tokens;
  const flown = flyWithLanding(tokens, action?.id === 'land' ? landY : null);

  initFamilyScene(scene, T.night ? [0.55, 0.5, 0.5] : [1.0, 0.95, 1.05]);
  const old = scene.getObjectByName('StudioSkyCourse');
  if (old) scene.remove(old);
  const root = new THREE.Group(); root.name = 'StudioSkyCourse';
  scene.add(root);

  const flight = flown.path.slice(9); // skip the climb off the pad
  const route = routeIndex(flight.length > 4 ? flight : flown.path);
  const ctx = {
    scene, rnd: rngFrom(`${chassisId}:${arena.id}${course.mode > 10 ? `:${course.mode}` : ""}`), route, center: route.center,
    spawn: flown.path[0], end: flown.end, flight, stations: flown.stations, landY, mood,
  };

  // Sky and air
  skyDome(root, T.sky[0], T.sky[1], { stars: !!T.night });
  scene.fog = new THREE.Fog(T.fog[0], T.fog[1], T.fog[2]);
  scene.background = new THREE.Color(T.fog[0]);
  const hemi = new THREE.HemisphereLight(T.hemi[0], T.hemi[1], T.hemi[2]); root.add(hemi);
  const sun = new THREE.DirectionalLight(T.sun[0], T.sun[1]); sun.position.set(ctx.center.x + 120, 220, ctx.center.z + 80);
  sun.target.position.set(ctx.center.x, 0, ctx.center.z); root.add(sun, sun.target);

  buildWorld(root, ctx, theme, course, chassisId);

  // Course: rings (or the stations the action markers dress), guide line, start and finish
  if (!course.carrier) startPad(root, ctx, style);
  guideDots(root, ctx, 0);
  const checkpoints = [];
  if (action) {
    flown.stations.forEach((s, i) => checkpoints.push({ x: s.x, y: s.y, z: s.z, index: i, passed: false }));
  } else {
    const gates = new THREE.Group(); gates.name = 'AerialGates'; root.add(gates);
    const sp = flown.path[0];
    thinRings(flown.rings.filter((r) => Math.hypot(r.x - sp.x, r.z - sp.z) > 10), 8).forEach((r, i) => {
      const ring = makeRing(style, i);
      ring.position.set(r.x, r.y, r.z); ring.rotation.y = r.angle;
      gates.add(ring);
      checkpoints.push({ x: r.x, y: r.y, z: r.z, index: i, passed: false, mesh: ring });
    });
    const green = new THREE.Color(0x22c55e);
    arenaMover(scene, (t) => {
      const cps = scene.userData.chassisCheckpoints || [];
      const next = cps.find((c) => !c.passed);
      cps.forEach((c) => {
        const g = c.mesh; if (!g) return;
        const m = g.userData.ringMat;
        if (c.passed) {
          if (!g.userData.done) { g.userData.done = true; if (m.color) m.color.copy(green); if (m.emissive) m.emissive.copy(green); m.opacity = 0.45; g.userData.label.visible = false; g.userData.fill.visible = false; }
          g.scale.setScalar(Math.max(0.85, g.scale.x - 0.01));
        } else if (c === next) {
          m.emissiveIntensity = 0.7 + Math.sin(t * 6) * 0.35; g.scale.setScalar(1 + Math.sin(t * 6) * 0.05); g.userData.fill.material.opacity = 0.16;
        } else {
          m.emissiveIntensity = style.kind === 'gate' ? 0.6 : 0.25; g.scale.setScalar(1); g.userData.fill.material.opacity = 0.06;
        }
      });
    });
  }
  finishGate(root, ctx);

  // What the simulator reads
  const ud = scene.userData;
  const s = flown.path[0];
  ud.aerialWorldBuilt = true;
  ud.aerialSoftDaylight = false;
  ud.kidFlyingWorld = true;
  ud.studioSkyCourse = { chassisId, mode: course.mode, theme };
  ud.flyingArenaActive = true;
  ud.skipMissionWorld = true;
  ud.missionWorldKit = false;
  ud.customSky = true;
  ud.customDecor = true;
  ud.environmentId = 'sky_aerial';
  ud.physicsMode = 'flight_3dof';
  ud.cameraMode = 'aerial_chase';
  ud.missionCameraPreset = { camBack: 13, camUp: 5.5, lookAhead: 22, lookHeight: 3.2, fov: 56 };
  ud.aerialSpawn = { x: s.x, y: s.y, z: s.z, angle: s.angle };
  ud.aerialMeshYawOffset = Math.PI;
  ud.spawnAltitude = s.y; ud.spawnX = s.x; ud.spawnY = s.y; ud.spawnZ = s.z; ud.groundY = s.y;
  ud.killPlaneY = -60;
  ud._aerialAltRange = { lo: action?.id === 'land' ? landY : 1.5, hi: 90 };
  ud.flyingAltitudeLimits = null; ud.flyingRequiredAltitude = null;
  ud._chassisCurve = new THREE.CatmullRomCurve3(flight.filter((_, i) => i % 6 === 0).map((p) => new THREE.Vector3(p.x, Math.max(p.y, landY + 5), p.z)));
  const bb = route.bbox;
  ud.arenaBounds = { cx: route.center.x, cz: route.center.z, spanX: bb.maxX - bb.minX + 120, spanZ: bb.maxZ - bb.minZ + 120, camMinZ: bb.minZ - 60, camMaxZ: bb.maxZ + 60, camMaxX: Math.max(Math.abs(bb.minX), Math.abs(bb.maxX)) + 60, floorY: 0 };
  ud.chassisCheckpoints = checkpoints;
  ud.chassisCheckpointTotal = checkpoints.length;
  ud.finishZone = { x: flown.end.x, z: flown.end.z, y3d: flown.end.y, radius: 4.5 };
  ud.expMood = T.night ? 1.0 : 1.05;
  ud.raceVisual = T.night ? { bloom: 0.55, threshold: 0.62, radius: 0.35 } : { bloom: 0.16, threshold: 0.92, radius: 0.18 };
  ud.obstacles = [];
  updateMissionMinimap(scene, ud._chassisCurve);
  return true;
}

/** flySkyProgram, but a Land action drops the robot onto the pad height. */
function flyWithLanding(tokens, landY) {
  if (landY == null) return flySkyProgram(tokens);
  // Split at each A: fly the part, then continue from the landed height
  let state = undefined; const out = { path: [], rings: [], stations: [], end: null };
  let part = [];
  const run = (toks, endsWithLand) => {
    const r = flySkyProgram(toks, state);
    out.path.push(...(out.path.length ? r.path.slice(1) : r.path)); out.rings.push(...r.rings);
    state = { ...r.end };
    if (endsWithLand) {
      out.stations.push({ ...state });
      const from = state.y;
      for (let i = 1; i <= 6; i++) out.path.push({ ...state, y: lerp(from, landY, i / 6) });
      state.y = landY;
    }
    out.end = { ...state };
  };
  tokens.forEach((t) => { if (t === 'A') { run(part, true); part = []; } else part.push(t); });
  run(part, false);
  return out;
}
