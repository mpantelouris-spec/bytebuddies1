/** Track 16 — Meteor Mine Madness: cave canyon, glowing purple crystals, mine rails & carts, timber frames. */
import * as THREE from 'three';
import {
  signTexture, toon, glow, glowSprite, themeSky, themeLights, themeGround, roadSurface, kerbs, startStripes,
  coins, speckleTexture, sideScatter, precipitation, roadSupports, embankment,
} from './RaceThemeCore.js';

const CRYSTAL = [0xa855f7, 0x7c3aed, 0x22d3ee, 0xc026d3];

function crystalCluster(rand, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.5, roughness: 0.15, metalness: 0.1, flatShading: true,
    transparent: true, opacity: 0.92,
  });
  for (let i = 0; i < 6; i++) {
    const h = 1.2 + rand() * 2.6;
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), mat);
    c.scale.set(0.7, h, 0.7);
    const a = rand() * Math.PI * 2;
    const r = rand() * 0.8;
    c.position.set(Math.cos(a) * r, h * 0.45, Math.sin(a) * r);
    c.rotation.set((rand() - 0.5) * 0.7, rand() * Math.PI, (rand() - 0.5) * 0.7);
    g.add(c);
  }
  return g;
}

function caveRock(color) {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), toon(color, { flatShading: true, roughness: 0.95 }));
  const pos = m.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
    const k = 0.8 + (n - Math.floor(n)) * 0.4;
    pos.setXYZ(i, x * k, y * k, z * k);
  }
  m.geometry.computeVertexNormals();
  m.scale.set(1.2, 1.5, 1);
  return m;
}

function mineCart() {
  const g = new THREE.Group();
  const wood = toon(0x7a4a24);
  const iron = toon(0x4a4a52, { metalness: 0.7, roughness: 0.4 });
  const tub = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 2), wood);
  tub.position.y = 0.85;
  g.add(tub);
  [-0.7, 0.7].forEach((z) => {
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.12, 0.12), iron);
    band.position.set(0, 1.2, z);
    g.add(band);
  });
  [[-0.6, -0.65], [0.6, -0.65], [-0.6, 0.65], [0.6, 0.65]].forEach(([x, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 12), iron);
    w.rotation.z = Math.PI / 2;
    w.position.set(x * 1.05, 0.3, z);
    g.add(w);
  });
  const load = crystalCluster(Math.random, 0xc084fc);
  load.scale.setScalar(0.45);
  load.position.y = 1.1;
  g.add(load);
  return g;
}

function timberFrame(ctx, d) {
  const g = new THREE.Group();
  const wood = toon(0x7a5230, { roughness: 0.9 });
  const w = ctx.hw * 2 + 1.8;
  [-1, 1].forEach((s) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 0.5), wood);
    post.position.set(s * w / 2, 3, 0);
    g.add(post);
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 0.3), wood);
    brace.position.set(s * (w / 2 - 0.6), 5.2, 0);
    brace.rotation.z = s * 0.7;
    g.add(brace);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.55, 0.55), wood);
  beam.position.y = 6.1;
  g.add(beam);
  const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), glow(0xffb347, 2.2));
  lantern.position.y = 5.3;
  g.add(lantern);
  const h = glowSprite(0xffa23a, 5, 0.85);
  h.position.y = 5.3;
  g.add(h);
  ctx.place(g, d, 0);
  return g;
}

export function buildMeteorMineMadness(ctx) {
  const { hw, rand } = ctx;
  themeSky(ctx, { top: 0x0d0714, mid: 0x1c1024, horizon: 0x2a1a2e, fog: 0x1d1026, near: 30, far: 180, stars: 160, starColor: 0xd8b4fe });
  themeLights(ctx.scene, {
    sun: 0xffb070, sunIntensity: 0.6, hemiSky: 0x7a5aa8, hemiGround: 0x2a1a12, hemiIntensity: 0.7,
    ambient: 0x3a2a4a, ambientIntensity: 0.55, night: true,
  });
  const dirt = speckleTexture('#4a3325', ['#5d4230', '#3a281d', '#6b4a33'], { repeat: [50, 50] });
  themeGround(ctx, { color: 0xffffff, map: dirt });
  embankment(ctx, { color: 0x4f3a2c });
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.6), toon(0x7a5230));
  pillar.geometry.translate(0, 0.5, 0);
  roadSupports(ctx, pillar);

  roadSurface(ctx, { map: speckleTexture('#6b4a33', ['#8a6446', '#533826', '#7a5a3d', '#b89a7a'], { size: 256, count: 1400, rMin: 1, rMax: 4 }), roughness: 0.95, repeatLen: 5 });
  kerbs(ctx, 0x8a5a2b, 0x5e3d20, { height: 0.24, width: 0.7 });
  startStripes(ctx, 0xf0e6ff);

  const gate = timberFrame(ctx, 22);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(ctx.hw * 1.6, 1.1),
    new THREE.MeshStandardMaterial({ map: signTexture('METEOR MINE', { w: 768, h: 128, bg: '#3a2412', fg: '#e9d5ff', border: '#a855f7', glowColor: '#a855f7', font: 'bold 84px system-ui, Arial' }), emissive: 0xffffff, emissiveIntensity: 0.35 }),
  );
  sign.material.emissiveMap = sign.material.map;
  sign.position.set(0, 7, -0.3);
  sign.rotation.y = Math.PI;
  gate.add(sign);
  for (let d = 55; d < ctx.len - 10; d += 34) timberFrame(ctx, d);

  // Canyon walls of jagged rock.
  [0x4a3a33, 0x5a463a, 0x3c2f2a].forEach((c, i) => {
    sideScatter(ctx, caveRock(c), { step: 5, jitter: 4, offMin: 7, offMax: 14, clearR: 3, scaleMin: 3, scaleMax: 7, ground: true, from: i * 1.6 });
    sideScatter(ctx, caveRock(c), { step: 14, jitter: 8, offMin: 18, offMax: 45, clearR: 8, scaleMin: 8, scaleMax: 16, ground: true, from: i * 4 });
  });
  // Glowing crystal clusters.
  CRYSTAL.forEach((c, i) => {
    sideScatter(ctx, crystalCluster(rand, c), { step: 16, jitter: 8, offMin: 2.5, offMax: 6, clearR: 1.2, scaleMin: 0.5, scaleMax: 1.3, ground: true, from: i * 4 });
  });
  for (let d = 6; d < ctx.len; d += 16) {
    const s = rand() < 0.5 ? -1 : 1;
    ctx.place(glowSprite(CRYSTAL[Math.floor(rand() * CRYSTAL.length)], 6, 0.55), d, s * (hw + 4 + rand() * 3), { y: 1.2 });
  }
  // Giant crystals on the walls.
  for (let i = 0; i < 10; i++) {
    const c = crystalCluster(rand, CRYSTAL[i % CRYSTAL.length]);
    c.scale.setScalar(2.2 + rand() * 1.8);
    ctx.place(c, (i * ctx.len) / 10 + rand() * 10, (rand() < 0.5 ? -1 : 1) * (hw + 14 + rand() * 8), { ground: true, clearR: 4, face: false, rotY: rand() * 6 });
  }

  // Mine rails with sleepers along the left side.
  const rails = [];
  const sleepers = [];
  for (let d = 0; d < ctx.len; d += 1.2) {
    [-0.45, 0.45].forEach((o) => rails.push(ctx.matrixAt(d, -(hw + 2.6) + o, { y: 0.1 })));
    sleepers.push(ctx.matrixAt(d, -(hw + 2.6), { y: 0.03 }));
  }
  ctx.scatter(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 1.25), toon(0x9aa0aa, { metalness: 0.8, roughness: 0.3 })), rails);
  ctx.scatter(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.28), toon(0x5e3d20)), sleepers);
  const carts = [];
  for (let i = 0; i < 6; i++) {
    const c = mineCart();
    const d = 30 + (i * ctx.len) / 6;
    ctx.place(c, d, -(hw + 2.6), { y: 0.05 });
    carts.push({ c, d, speed: 3 + rand() * 3 });
  }
  ctx.tick((now) => {
    for (const k of carts) {
      const f = ctx.frame((k.d + now * k.speed) % ctx.len, -(hw + 2.6));
      k.c.position.set(f.pos.x, f.roadY + 0.05, f.pos.z);
      k.c.rotation.y = f.angle;
    }
  });

  // Glowing meteor rocks in little craters.
  const meteorMat = new THREE.MeshStandardMaterial({ color: 0x3a1f3f, emissive: 0xff6a3d, emissiveIntensity: 0.9, flatShading: true, roughness: 0.6 });
  for (let i = 0; i < 10; i++) {
    const g = new THREE.Group();
    const crater = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.45, 6, 16), toon(0x3c2a20, { flatShading: true }));
    crater.rotation.x = Math.PI / 2;
    g.add(crater);
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), meteorMat);
    rock.position.y = 0.5;
    g.add(rock);
    const h = glowSprite(0xff7a3d, 5, 0.7);
    h.position.y = 0.8;
    g.add(h);
    ctx.place(g, 20 + (i * ctx.len) / 10, (i % 2 ? 1 : -1) * (hw + 5.5), { ground: true, clearR: 2.2 });
  }

  precipitation(ctx, { count: 500, color: 0xd8b4fe, size: 0.2, speed: 1.2, streak: false, opacity: 0.7, height: 16, area: 50 });
  coins(ctx, { every: 30 });
}
