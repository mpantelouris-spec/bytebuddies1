/** Track 18 — Glacial Gorge GP: aurora night sky, translucent ice canyon walls, ice arches, snowfall. */
import * as THREE from 'three';
import {
  canvasTexture, signTexture, toon, glowSprite, themeSky, themeLights, themeGround, roadSurface, kerbs,
  startStripes, coins, speckleTexture, sideScatter, precipitation, pineTree, roadSupports, embankment,
} from './RaceThemeCore.js';

function iceMaterial(color = 0x6fb8e8, opacity = 0.88) {
  return new THREE.MeshStandardMaterial({
    color, emissive: 0x0d4a8a, emissiveIntensity: 0.3, roughness: 0.12, metalness: 0.05,
    transparent: true, opacity, flatShading: true,
  });
}

function iceRoadTexture() {
  return canvasTexture((x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#8fc6ea');
    g.addColorStop(0.5, '#b8e1f7');
    g.addColorStop(1, '#8fc6ea');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,0.6)';
    x.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) {
      let px = Math.random() * w;
      let py = Math.random() * h;
      x.beginPath();
      x.moveTo(px, py);
      for (let k = 0; k < 4; k++) {
        px += (Math.random() - 0.5) * 40;
        py += (Math.random() - 0.5) * 40;
        x.lineTo(px, py);
      }
      x.stroke();
    }
  }, 256, 256);
}

function auroraTexture() {
  return canvasTexture((x, w, h) => {
    const g = x.createLinearGradient(0, h, 0, 0);
    g.addColorStop(0, 'rgba(60,255,170,0)');
    g.addColorStop(0.2, 'rgba(60,255,170,0.9)');
    g.addColorStop(0.55, 'rgba(60,200,255,0.55)');
    g.addColorStop(1, 'rgba(180,90,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      x.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.08})`;
      x.fillRect(Math.random() * w, 0, 2 + Math.random() * 4, h);
    }
  }, 256, 128);
}

function iceSpire(rand) {
  const g = new THREE.Group();
  const mat = iceMaterial([0x5aa6e0, 0x7fc4ee, 0x3f8fd0][Math.floor(rand() * 3)]);
  const h = 8 + rand() * 20;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8 + rand(), 2.4 + rand() * 2, h, 5 + Math.floor(rand() * 2)), mat);
  body.position.y = h / 2;
  body.rotation.y = rand() * Math.PI;
  g.add(body);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 5), toon(0xf4fbff, { flatShading: true }));
  cap.position.y = h + 0.8;
  g.add(cap);
  return g;
}

function iceSpikes() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x7fe8ff, emissive: 0x3fd0ff, emissiveIntensity: 0.9, roughness: 0.1, transparent: true, opacity: 0.9, flatShading: true });
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.2 + i * 0.35, 5), mat);
    const a = (i / 5) * Math.PI * 2;
    c.position.set(Math.cos(a) * 0.4, (1.2 + i * 0.35) / 2, Math.sin(a) * 0.4);
    c.rotation.set(Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3);
    g.add(c);
  }
  return g;
}

function snowMound() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xf4fbff, { roughness: 0.95 }));
  m.scale.set(3, 1.1, 2.2);
  return m;
}

function iceArch(ctx, d, signMap = null) {
  const g = new THREE.Group();
  const r = ctx.hw + 2.2;
  const arch = new THREE.Mesh(new THREE.TorusGeometry(r, 1.1, 8, 28, Math.PI), iceMaterial(0xbfe8ff, 0.8));
  g.add(arch);
  const icicleMat = iceMaterial(0xe0f6ff, 0.9);
  for (let i = 2; i < 26; i++) {
    const a = (i / 27) * Math.PI;
    const len = 0.6 + ctx.rand() * 1.4;
    const ic = new THREE.Mesh(new THREE.ConeGeometry(0.14, len, 5), icicleMat);
    ic.rotation.x = Math.PI;
    ic.position.set(Math.cos(a) * (r - 1), Math.sin(a) * (r - 1) - len / 2, 0);
    if (ic.position.y > 2.2) g.add(ic);
  }
  if (signMap) {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(r * 1.2, 1.2), new THREE.MeshStandardMaterial({ map: signMap, emissive: 0xffffff, emissiveMap: signMap, emissiveIntensity: 0.4 }));
    sign.position.set(0, r + 0.2, -1.2);
    sign.rotation.y = Math.PI;
    g.add(sign);
  }
  ctx.place(g, d, 0);
}

export function buildGlacialGorgeGP(ctx) {
  const { hw, rand } = ctx;
  themeSky(ctx, { top: 0x041233, mid: 0x0b3d6e, horizon: 0x2c6a9c, fog: 0x1d4a72, near: 70, far: 300, stars: 360 });
  themeLights(ctx.scene, {
    sun: 0xcfeaff, sunIntensity: 1.1, hemiSky: 0x88c8ff, hemiGround: 0x1a3350, hemiIntensity: 0.8,
    ambient: 0x5a86b8, ambientIntensity: 0.55, night: true,
  });
  const snowTex = speckleTexture('#e8f4ff', ['#d4e8f8', '#ffffff', '#c8def2'], { repeat: [60, 60] });
  themeGround(ctx, { color: 0xffffff, map: snowTex, roughness: 0.9 });
  embankment(ctx, { color: 0xeaf5ff });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1, 1, 6), iceMaterial(0x9fd4f5, 0.95));
  pillar.geometry.translate(0, 0.5, 0);
  roadSupports(ctx, pillar, { step: 9 });

  roadSurface(ctx, { map: iceRoadTexture(), roughness: 0.15, metalness: 0.05, repeatLen: 7, envMapIntensity: 0.8 });
  kerbs(ctx, 0x2f7ad6, 0xffffff);
  startStripes(ctx, 0xffffff);

  iceArch(ctx, 24, signTexture('GLACIAL GORGE GP', { w: 1024, h: 160, bg: '#0b3d6e', fg: '#e8f8ff', border: '#7fe8ff', glowColor: '#7fe8ff', font: 'bold 92px system-ui, Arial' }));
  for (let d = 110; d < ctx.len - 30; d += 95) iceArch(ctx, d);

  // Aurora ribbons across the sky.
  const aTex = auroraTexture();
  const ribbons = [];
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.PlaneGeometry(420, 70, 40, 1);
    const mat = new THREE.MeshBasicMaterial({ map: aTex, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const m = new THREE.Mesh(geo, mat);
    const f = ctx.frame(0);
    const dist = 260 + i * 70;
    m.position.set(ctx.center.x + f.tan.x * dist, ctx.minRoadY + 110 + i * 18, ctx.center.z + f.tan.z * dist);
    m.lookAt(ctx.center.x, ctx.minRoadY + 60, ctx.center.z);
    m.rotateZ((rand() - 0.5) * 0.3);
    m.renderOrder = -10;
    ctx.root.add(m);
    ribbons.push({ m, base: Float32Array.from(geo.attributes.position.array), phase: rand() * 6 });
  }
  ctx.tick((now) => {
    for (const r of ribbons) {
      const a = r.m.geometry.attributes.position;
      for (let i = 0; i < a.count; i++) {
        const x = r.base[i * 3];
        a.array[i * 3 + 2] = Math.sin(x * 0.02 + now * 0.5 + r.phase) * 18;
        a.array[i * 3 + 1] = r.base[i * 3 + 1] + Math.sin(x * 0.035 + now * 0.3) * 6;
      }
      a.needsUpdate = true;
      r.m.material.opacity = 0.55 + Math.sin(now * 0.7 + r.phase) * 0.2;
    }
  });

  // Ice canyon walls.
  for (let v = 0; v < 4; v++) {
    sideScatter(ctx, iceSpire(rand), { step: 10, jitter: 6, offMin: 8, offMax: 16, clearR: 2.6, scaleMin: 0.6, scaleMax: 1.1, ground: true, from: v * 2.5 });
    sideScatter(ctx, iceSpire(rand), { step: 22, jitter: 10, offMin: 20, offMax: 60, clearR: 6, scaleMin: 1.6, scaleMax: 3, ground: true, from: v * 5 });
  }
  sideScatter(ctx, iceSpikes(), { step: 8, jitter: 5, offMin: 1.6, offMax: 4, clearR: 0.8, scaleMin: 0.7, scaleMax: 1.4 });
  for (let d = 5; d < ctx.len; d += 19) {
    ctx.place(glowSprite(0x7fe8ff, 3.5, 0.6), d, (rand() < 0.5 ? -1 : 1) * (hw + 2.6), { y: 0.9 });
  }
  sideScatter(ctx, snowMound(), { step: 10, jitter: 8, offMin: 3, offMax: 10, clearR: 2, scaleMin: 0.5, scaleMax: 1.4, ground: true });
  sideScatter(ctx, pineTree(1.3, [0x1f6b4a, 0x27805a, 0x2f8f63], { snow: true }), { step: 11, jitter: 8, offMin: 14, offMax: 40, clearR: 1.6, scaleMin: 0.8, scaleMax: 1.6, ground: true });

  precipitation(ctx, { count: 1300, color: 0xffffff, size: 0.16, speed: 3.5, streak: false, opacity: 0.85, height: 26 });
  coins(ctx, { every: 30 });
}
