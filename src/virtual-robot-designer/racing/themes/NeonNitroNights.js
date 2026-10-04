/** Track 11 — Neon Nitro Nights: rainy neon city, glowing towers, wet reflective road. */
import * as THREE from 'three';
import {
  canvasTexture, signTexture, glow, toon, glowSprite, themeSky, themeLights, themeGround, roadSurface,
  kerbs, edgeStrip, startStripes, coins, precipitation, roadArch,
} from './RaceThemeCore.js';

const NEON = [0xff2bd6, 0x22e4ff, 0xffe14d, 0x8b5cff, 0xff4d6d];

function windowTexture(tint) {
  return canvasTexture((x, w, h) => {
    x.fillStyle = '#0c0a1c';
    x.fillRect(0, 0, w, h);
    for (let r = 0; r < 24; r++) {
      for (let c = 0; c < 8; c++) {
        const lit = Math.random() < 0.55;
        x.fillStyle = lit ? tint : '#171433';
        x.globalAlpha = lit ? 0.55 + Math.random() * 0.45 : 1;
        x.fillRect(4 + c * 15, 4 + r * 10.5, 9, 6);
      }
    }
    x.globalAlpha = 1;
  }, 128, 256);
}

function boostPadTexture() {
  return canvasTexture((x, w, h) => {
    x.fillStyle = '#0a0f2a';
    x.fillRect(0, 0, w, h);
    x.strokeStyle = '#22e4ff';
    x.lineWidth = 14;
    x.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const y = 40 + i * 70;
      x.beginPath();
      x.moveTo(24, y + 40);
      x.lineTo(w / 2, y);
      x.lineTo(w - 24, y + 40);
      x.stroke();
    }
    x.strokeStyle = '#ff2bd6';
    x.lineWidth = 8;
    x.strokeRect(6, 6, w - 12, h - 12);
  }, 128, 256);
}

export function buildNeonNitroNights(ctx) {
  const { hw, rand } = ctx;
  themeSky(ctx, { top: 0x07031a, mid: 0x241052, horizon: 0x5b1a8a, fog: 0x2a1248, near: 45, far: 260, stars: 380 });
  themeLights(ctx.scene, {
    sun: 0xc8c0ff, sunIntensity: 1.25, hemiSky: 0x8a6cff, hemiGround: 0x3a2460, hemiIntensity: 1.1,
    ambient: 0x6a5a9a, ambientIntensity: 0.95, night: true,
  });
  themeGround(ctx, { color: 0x120f22, roughness: 0.35, metalness: 0.25 });

  roadSurface(ctx, { color: 0x1c1f30, roughness: 0.3, metalness: 0.1, envMapIntensity: 0.35 });
  kerbs(ctx, 0xe53935, 0xffffff);
  edgeStrip(ctx, 0xff2bd6, { offset: hw + 0.75, width: 0.16, intensity: 1.8 });
  edgeStrip(ctx, 0x22e4ff, { offset: hw - 0.35, width: 0.1, intensity: 1.4 });
  startStripes(ctx, 0xf0e9ff);

  // Boost pads on the road.
  const padMat = new THREE.MeshStandardMaterial({
    map: boostPadTexture(), emissive: 0xffffff, emissiveMap: null, emissiveIntensity: 0.9,
    transparent: true, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
  });
  padMat.emissiveMap = padMat.map;
  for (let d = 38; d < ctx.len - 20; d += 70) {
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 4.2), padMat);
    pad.rotation.x = -Math.PI / 2;
    const holder = new THREE.Group();
    holder.add(pad);
    ctx.place(holder, d, (rand() < 0.5 ? -1 : 1) * hw * 0.42, { y: 0.06 });
  }

  // Towers with lit windows, instanced per colour.
  const tints = ['#22e4ff', '#ff5fd8', '#ffd34d'];
  const towerMats = tints.map((t) => {
    const map = windowTexture(t);
    return new THREE.MeshStandardMaterial({
      map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.85, roughness: 0.5, metalness: 0.2,
    });
  });
  const towerGeo = new THREE.BoxGeometry(1, 1, 1);
  towerGeo.translate(0, 0.5, 0);
  const towerLists = towerMats.map(() => []);
  const roofLists = [[], []];
  for (let d = 0; d < ctx.len; d += 9) {
    [-1, 1].forEach((s) => {
      const w = 7 + rand() * 7;
      const h = 16 + rand() * 46;
      const off = hw + 8 + w / 2 + rand() * 10;
      const m = ctx.matrixAt(d + rand() * 4, s * off, {
        scale: new THREE.Vector3(w, h, 6 + rand() * 8), clearR: w * 0.6, ground: true,
      });
      if (!m) return;
      towerLists[Math.floor(rand() * towerMats.length)].push(m);
      const pos = new THREE.Vector3().setFromMatrixPosition(m);
      const roof = m.clone();
      roof.elements[13] = pos.y + h;
      roof.scale(new THREE.Vector3(1.02, 0.018 / 1, 1.02));
      roofLists[rand() < 0.5 ? 0 : 1].push(roof);
    });
  }
  towerMats.forEach((mat, i) => ctx.scatter(new THREE.Mesh(towerGeo, mat), towerLists[i]));
  [0xff2bd6, 0x22e4ff].forEach((c, i) => ctx.scatter(new THREE.Mesh(towerGeo, glow(c, 1.6)), roofLists[i]));

  // Neon signs hanging near the road.
  const words = ['NEON', 'NITRO', 'BYTE', 'ZOOM', 'TURBO', 'BUDDIES', '88', 'GO!'];
  for (let d = 16, i = 0; d < ctx.len - 8; d += 26 + rand() * 18, i++) {
    const s = i % 2 ? 1 : -1;
    const tex = signTexture(words[i % words.length], {
      w: 512, h: 128, bg: '#0b0820', fg: '#ffffff',
      border: `#${NEON[i % NEON.length].toString(16).padStart(6, '0')}`,
      glowColor: `#${NEON[i % NEON.length].toString(16).padStart(6, '0')}`,
    });
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.5),
      new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.1, side: THREE.DoubleSide }),
    );
    const g = new THREE.Group();
    sign.rotation.y = Math.PI;
    sign.position.y = 5.5 + rand() * 4;
    g.add(sign);
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.25, sign.position.y, 0.25), toon(0x1c1a33, { metalness: 0.6 }));
    pole.position.y = sign.position.y / 2;
    pole.position.z = 0.15;
    g.add(pole);
    ctx.place(g, d, s * (hw + 5.5), { clearR: 1.5 });
  }

  // Street lamps with coloured heads and halos.
  const poleTpl = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 5.2, 8), toon(0x2a2840, { metalness: 0.7, roughness: 0.3 }));
  pole.position.y = 2.6;
  poleTpl.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), pole.material);
  arm.position.set(-0.55, 5.15, 0);
  poleTpl.add(arm);
  const lampMats = [];
  for (let d = 6, i = 0; d < ctx.len; d += 18, i++) {
    [-1, 1].forEach((s) => {
      const color = NEON[(i + (s > 0 ? 1 : 0)) % 2 === 0 ? 0 : 1];
      const f = ctx.frame(d, s * (hw + 1.8));
      const g = poleTpl.clone();
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glow(color, 2.2));
      head.position.set(-1.1, 5.05, 0);
      g.add(head);
      const halo = glowSprite(color, 3.2, 0.7);
      halo.position.copy(head.position);
      g.add(halo);
      g.position.set(f.pos.x, f.roadY, f.pos.z);
      g.rotation.y = f.angle + (s > 0 ? Math.PI : 0);
      ctx.root.add(g);
      lampMats.push(head.material);
    });
  }

  // Neon ring gates the kart flies through.
  const ringGeo = new THREE.TorusGeometry(hw + 1.6, 0.16, 8, 48, Math.PI);
  const ringLists = [[], []];
  for (let d = 60, i = 0; d < ctx.len - 20; d += 55, i++) ringLists[i % 2].push(ctx.matrixAt(d, 0, { y: -0.1 }));
  [0xff2bd6, 0x22e4ff].forEach((c, i) => ctx.scatter(new THREE.Mesh(ringGeo, glow(c, 2)), ringLists[i]));

  // Welcome arch.
  roadArch(ctx, 24, {
    postMat: toon(0x1c1a33, { metalness: 0.6 }), beamMat: glow(0xff2bd6, 1.2), height: 6.8,
    signMap: signTexture('NEON NITRO NIGHTS', { w: 1024, h: 160, bg: '#0b0820', fg: '#ffffff', border: '#22e4ff', glowColor: '#22e4ff', font: 'bold 92px system-ui, Arial' }),
  });

  coins(ctx, { every: 30 });
  precipitation(ctx, { count: 1600, color: 0xb9ccff, speed: 30, opacity: 0.45 });

  // Pulse the neon.
  ctx.tick((now) => {
    const k = 1.8 + Math.sin(now * 4) * 0.5;
    for (let i = 0; i < lampMats.length; i += 2) lampMats[i].emissiveIntensity = k;
  });
}
