/** Track 12 — Desert Dune Drift: sunset sky, sandstone mesas, oasis with palms, cacti, ruins. */
import * as THREE from 'three';
import {
  canvasTexture, signTexture, toon, themeSky, themeLights, themeGround, roadSurface, kerbs,
  startStripes, coins, embankment, skyDisc, speckleTexture, palmTree, sideScatter, roadArch, roadSupports,
} from './RaceThemeCore.js';

function sandRoadTexture() {
  return canvasTexture((x, w, h) => {
    x.fillStyle = '#c99a5b';
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) {
      x.fillStyle = Math.random() < 0.5 ? '#b3834a' : '#dcb176';
      x.globalAlpha = 0.5;
      x.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
    x.globalAlpha = 0.35;
    x.fillStyle = '#8f6334';
    [0.3, 0.7].forEach((u) => x.fillRect(u * w - 9, 0, 18, h));
    x.globalAlpha = 1;
  }, 256, 256);
}

function butte(rand) {
  const g = new THREE.Group();
  const bands = [0xc8743a, 0xd98c4f, 0xb45f2e, 0xe0a060];
  let y = 0;
  let r = 9 + rand() * 9;
  const tiers = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < tiers; i++) {
    const h = 5 + rand() * 9;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r, h, 7), toon(bands[i % bands.length], { flatShading: true, roughness: 0.95 }));
    m.position.y = y + h / 2;
    m.rotation.y = rand() * Math.PI;
    g.add(m);
    y += h;
    r *= 0.72 + rand() * 0.18;
  }
  return g;
}

function cactus() {
  const g = new THREE.Group();
  const mat = toon(0x3f9a4a, { flatShading: true });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 3.4, 8), mat);
  trunk.position.y = 1.7;
  g.add(trunk);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), mat);
  top.position.y = 3.4;
  g.add(top);
  [[-1, 1.5, 1.1], [1, 2.1, 0.9]].forEach(([s, y, h]) => {
    const out = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8), mat);
    out.rotation.z = Math.PI / 2;
    out.position.set(s * 0.6, y, 0);
    g.add(out);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, h, 8), mat);
    up.position.set(s * 0.95, y + h / 2, 0);
    g.add(up);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), mat);
    cap.position.set(s * 0.95, y + h, 0);
    g.add(cap);
  });
  return g;
}

function dune() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xe6bb78, { roughness: 1 }));
  m.scale.set(9, 2.6, 5);
  return m;
}

function ruinPillar(rand) {
  const g = new THREE.Group();
  const mat = toon(0xdcb27a, { flatShading: true });
  const h = 2 + rand() * 4;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, h, 10), mat);
  col.position.y = h / 2;
  g.add(col);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), mat);
  base.position.y = 0.2;
  g.add(base);
  if (rand() < 0.5) {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.5), mat);
    cap.position.y = h + 0.17;
    g.add(cap);
  }
  return g;
}

function oasis(ctx, d, side) {
  const g = new THREE.Group();
  const sand = new THREE.Mesh(new THREE.CircleGeometry(12, 40), toon(0xf0cf95, { roughness: 1 }));
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = 0.02;
  g.add(sand);
  const water = new THREE.Mesh(new THREE.CircleGeometry(8, 40), new THREE.MeshStandardMaterial({
    color: 0x2fc6d6, roughness: 0.08, metalness: 0.2, emissive: 0x0b7f99, emissiveIntensity: 0.35,
  }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.06;
  g.add(water);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + ctx.rand() * 0.4;
    const p = palmTree(1 + ctx.rand() * 0.5);
    p.position.set(Math.cos(a) * 10, 0, Math.sin(a) * 10);
    p.rotation.y = ctx.rand() * Math.PI * 2;
    g.add(p);
  }
  for (let i = 0; i < 10; i++) {
    const a = ctx.rand() * Math.PI * 2;
    const reed = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.4, 5), toon(0x6aa84f));
    reed.position.set(Math.cos(a) * 8.2, 0.7, Math.sin(a) * 8.2);
    g.add(reed);
  }
  return ctx.place(g, d, side, { ground: true, clearR: 12 });
}

export function buildDesertDuneDrift(ctx) {
  const { hw, rand } = ctx;
  themeSky(ctx, { top: 0x2b4c9b, mid: 0xf08a4b, horizon: 0xffc27a, fog: 0xf2b27a, near: 90, far: 380 });
  skyDisc(ctx, { color: 0xfff1c4, halo: 0xffb45a, size: 30, haloSize: 220, height: 55, yaw: 0.35 });
  themeLights(ctx.scene, { sun: 0xffc184, hemiSky: 0xffd8a8, hemiGround: 0xc8844a, ambient: 0xffe0b8 });
  const sandTex = speckleTexture('#e2b673', ['#d3a35e', '#efc98c', '#c8914f'], { repeat: [60, 60] });
  themeGround(ctx, { color: 0xffffff, map: sandTex });
  embankment(ctx, { color: 0xe6bd7d });
  roadSupports(ctx, (() => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), toon(0xc98a50, { flatShading: true }));
    m.geometry.translate(0, 0.5, 0);
    return m;
  })(), { step: 8 });

  roadSurface(ctx, { map: sandRoadTexture(), roughness: 0.98, repeatLen: 6 });
  kerbs(ctx, 0xb5835a, 0xe0b27d, { height: 0.26, width: 0.7 });
  startStripes(ctx, 0xfff4dc);

  roadArch(ctx, 22, {
    postMat: toon(0xd49a5c, { flatShading: true }), beamMat: toon(0xc0773d, { flatShading: true }), height: 6.2, postW: 1.2,
    signMap: signTexture('DESERT DUNE DRIFT', { w: 1024, h: 160, bg: '#7a3f1d', fg: '#ffe2a8', border: '#ffc66b', font: 'bold 90px system-ui, Arial' }),
  });

  oasis(ctx, 40, -(hw + 20));
  oasis(ctx, ctx.len * 0.55, hw + 22);

  for (let v = 0; v < 4; v++) {
    const tpl = butte(rand);
    sideScatter(ctx, tpl, { step: 60 + v * 9, jitter: 20, offMin: 38, offMax: 95, clearR: 16, scaleMin: 0.8, scaleMax: 1.5, ground: true, from: v * 14 });
  }
  sideScatter(ctx, dune(), { step: 22, jitter: 14, offMin: 14, offMax: 40, clearR: 8, scaleMin: 0.6, scaleMax: 1.6, ground: true });
  sideScatter(ctx, cactus(), { step: 14, jitter: 10, offMin: 4, offMax: 16, clearR: 1.4, scaleMin: 0.7, scaleMax: 1.3, ground: true });
  sideScatter(ctx, palmTree(1.1), { step: 36, jitter: 16, offMin: 5, offMax: 12, clearR: 2, scaleMin: 0.85, scaleMax: 1.3, ground: true });
  for (let v = 0; v < 3; v++) {
    sideScatter(ctx, ruinPillar(rand), { step: 50, jitter: 10, offMin: 3.5, offMax: 7, clearR: 1.4, ground: true, from: 30 + v * 8, to: ctx.len * 0.45 });
  }
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), toon(0xb8743f, { flatShading: true }));
  rock.scale.set(1.4, 0.8, 1.1);
  sideScatter(ctx, rock, { step: 9, jitter: 6, offMin: 3, offMax: 20, clearR: 1.2, scaleMin: 0.4, scaleMax: 1.6, ground: true });

  // Tumbleweeds rolling across the sand.
  const weeds = [];
  const weedMat = toon(0xa0763f, { wireframe: true });
  for (let i = 0; i < 8; i++) {
    const w = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 1), weedMat);
    const d = 30 + (i * ctx.len) / 8;
    ctx.place(w, d, (rand() < 0.5 ? -1 : 1) * (hw + 6), { y: 0.6 });
    weeds.push({ w, base: w.position.clone(), dir: ctx.frame(d).right.clone(), phase: rand() * 10 });
  }
  ctx.tick((now) => {
    for (const k of weeds) {
      const s = Math.sin(now * 0.4 + k.phase) * 5;
      k.w.position.copy(k.base).addScaledVector(k.dir, s);
      k.w.position.y = k.base.y + Math.abs(Math.sin(now * 3 + k.phase)) * 0.4;
      k.w.rotation.z = -s;
    }
  });

  coins(ctx, { every: 28 });
}
