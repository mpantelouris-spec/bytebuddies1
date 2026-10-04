/** Track 17 — Pinwheel Plaza Sprint: pastel town, giant spinning pinwheels, rainbow arch, balloons. */
import * as THREE from 'three';
import {
  canvasTexture, signTexture, toon, themeSky, themeLights, themeGround, roadSurface, kerbs, edgeStrip,
  startStripes, coins, sideScatter, cloudPuff, roadArch, roadSupports, embankment,
} from './RaceThemeCore.js';

const PASTEL = [0xffb3d9, 0xb5f2d2, 0xfff1a8, 0xd7c2ff, 0xffd0a8, 0xa8e3ff];
const ROOF = [0xff6fa8, 0x5ccf9a, 0xffb938, 0x9b7bff, 0xff8a5c, 0x4fb3ff];
const RAINBOW = [0xff4d4d, 0xff9a3c, 0xffe14d, 0x4fd66f, 0x3fb7ff, 0x5b6bff, 0xb35cff];

function windowsTexture() {
  return canvasTexture((x, w, h) => {
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, w, h);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        x.fillStyle = '#7cc6ff';
        x.fillRect(12 + c * 40, 14 + r * 40, 24, 26);
        x.strokeStyle = '#ffffff';
        x.lineWidth = 4;
        x.strokeRect(12 + c * 40, 14 + r * 40, 24, 26);
      }
    }
  }, 128, 128);
}

function house(color, roofColor, winTex) {
  const g = new THREE.Group();
  const w = 5;
  const h = 4.5;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshStandardMaterial({ color, map: winTex, roughness: 0.7 }));
  body.position.y = h / 2;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 2.6, 4), toon(roofColor, { flatShading: true }));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = h + 1.3;
  g.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.9, 0.1), toon(roofColor));
  door.position.set(0, 0.95, -w / 2 - 0.02);
  g.add(door);
  return g;
}

function pinwheel(size = 4) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, size * 2.2, 10), toon(0xffffff));
  pole.position.y = size * 1.1;
  g.add(pole);
  const hub = new THREE.Group();
  hub.position.set(0, size * 2.2, -0.3);
  const colors = [0xff4d6d, 0xffd23f, 0x3fb7ff, 0x4fd66f];
  colors.forEach((c, i) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(size, 0);
    shape.lineTo(size * 0.2, size * 0.95);
    shape.lineTo(0, 0);
    const blade = new THREE.Mesh(new THREE.ShapeGeometry(shape), toon(c, { side: THREE.DoubleSide, emissive: c, emissiveIntensity: 0.15 }));
    blade.rotation.z = (i * Math.PI) / 2;
    hub.add(blade);
  });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), toon(0xffffff));
  hub.add(cap);
  g.add(hub);
  g.userData.hub = hub;
  return g;
}

function roundTree(color) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 2, 8), toon(0xb07a4a));
  trunk.position.y = 1;
  g.add(trunk);
  const top = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 10), toon(color, { roughness: 0.8 }));
  top.position.y = 3;
  g.add(top);
  return g;
}

function flowerBed() {
  const g = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.4, 16), toon(0xffffff));
  bed.position.y = 0.2;
  g.add(bed);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.1, 16), toon(0x6fcf6a));
  soil.position.y = 0.42;
  g.add(soil);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), toon(RAINBOW[i % RAINBOW.length], { emissive: RAINBOW[i % RAINBOW.length], emissiveIntensity: 0.15 }));
    f.position.set(Math.cos(a) * 0.9, 0.62, Math.sin(a) * 0.9);
    g.add(f);
  }
  return g;
}

function balloonBunch(rand) {
  const g = new THREE.Group();
  const string = new THREE.LineBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 5; i++) {
    const c = RAINBOW[Math.floor(rand() * RAINBOW.length)];
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), toon(c, { roughness: 0.25, emissive: c, emissiveIntensity: 0.12 }));
    b.scale.y = 1.2;
    const p = new THREE.Vector3((rand() - 0.5) * 1.6, 3.8 + rand() * 1.2, (rand() - 0.5) * 1.6);
    b.position.copy(p);
    g.add(b);
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), p.clone().setY(p.y - 0.6)]), string));
  }
  return g;
}

export function buildPinwheelPlazaSprint(ctx) {
  const { hw, rand } = ctx;
  themeSky(ctx, { top: 0x5aaeff, mid: 0xa8dbff, horizon: 0xfbe3ff, fog: 0xf3e6ff, near: 100, far: 420 });
  themeLights(ctx.scene, { sun: 0xfff4f8, hemiSky: 0xd6ecff, hemiGround: 0xffd6ec, ambient: 0xfff0fa });
  const tiles = canvasTexture((x, w, h) => {
    x.fillStyle = '#f7e9ff';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#ecd8ff';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if ((r + c) % 2) x.fillRect(c * 32, r * 32, 32, 32);
  }, 128, 128, { repeat: [120, 120] });
  themeGround(ctx, { color: 0xffffff, map: tiles, roughness: 0.8 });
  embankment(ctx, { color: 0xa6e6a3, width: 7 });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 10), toon(0xffffff));
  pillar.geometry.translate(0, 0.5, 0);
  roadSupports(ctx, pillar);

  roadSurface(ctx, { color: 0xbab6cc, roughness: 0.6 });
  RAINBOW.forEach((c, i) => edgeStrip(ctx, c, { offset: hw - 0.25 - i * 0.2, width: 0.2, intensity: 0.35 }));
  kerbs(ctx, 0xff7ac8, 0xffffff);
  startStripes(ctx, 0xffffff);

  roadArch(ctx, 22, {
    postMat: toon(0xffffff), beamMat: toon(0xff7ac8), height: 6.5,
    signMap: signTexture('PINWHEEL PLAZA', { w: 1024, h: 160, bg: '#ff7ac8', fg: '#ffffff', border: '#ffe14d', font: 'bold 96px system-ui, Arial' }),
  });

  // Rainbow arch across the sky ahead.
  const bow = new THREE.Group();
  RAINBOW.forEach((c, i) => {
    const band = new THREE.Mesh(new THREE.TorusGeometry(40 - i * 1.4, 0.75, 8, 64, Math.PI), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.5, transparent: true, opacity: 0.85, fog: false }));
    bow.add(band);
  });
  ctx.place(bow, 110, 0, { y: -6, rotY: 0.3 });

  const winTex = windowsTexture();
  PASTEL.forEach((c, i) => {
    sideScatter(ctx, house(c, ROOF[i], winTex), { step: 24, jitter: 10, offMin: 9, offMax: 26, clearR: 4.5, scaleMin: 0.9, scaleMax: 1.5, from: i * 4, randomYaw: false });
  });
  [0x7ddc7a, 0x9ae68f, 0xffb3d9].forEach((c, i) => {
    sideScatter(ctx, roundTree(c), { step: 13, jitter: 6, offMin: 4, offMax: 9, clearR: 1.8, from: i * 4 });
  });
  sideScatter(ctx, flowerBed(), { step: 17, jitter: 4, offMin: 2.4, offMax: 3.4, clearR: 1.6, randomYaw: false, scaleMin: 1, scaleMax: 1 });

  // Giant spinning pinwheels.
  const wheels = [];
  for (let d = 30, i = 0; d < ctx.len - 10; d += 38, i++) {
    const p = pinwheel(3 + rand() * 2);
    if (ctx.place(p, d, (i % 2 ? 1 : -1) * (hw + 5 + rand() * 3), { clearR: 3 })) wheels.push({ hub: p.userData.hub, speed: 1 + rand() * 1.5 });
  }
  // Small pinwheels lining the kerb.
  for (let d = 6; d < ctx.len; d += 9) {
    const p = pinwheel(0.5);
    if (ctx.place(p, d, (Math.floor(d / 9) % 2 ? 1 : -1) * (hw + 1.4))) wheels.push({ hub: p.userData.hub, speed: 3 + rand() * 2 });
  }
  const balloons = [];
  for (let d = 12; d < ctx.len; d += 26) {
    const b = balloonBunch(rand);
    if (ctx.place(b, d, (rand() < 0.5 ? -1 : 1) * (hw + 2.6), { clearR: 1 })) balloons.push({ b, y: b.position.y, phase: rand() * 6 });
  }
  ctx.tick((now) => {
    for (const w of wheels) w.hub.rotation.z = now * w.speed;
    for (const k of balloons) k.b.position.y = k.y + Math.sin(now * 1.5 + k.phase) * 0.25;
  });

  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.45, fog: false, roughness: 1 });
  for (let i = 0; i < 14; i++) {
    ctx.place(cloudPuff(rand, cloudMat, 5, 4, 8), rand() * ctx.len, (rand() < 0.5 ? -1 : 1) * (40 + rand() * 110), { y: 28 + rand() * 20, face: false });
  }

  coins(ctx, { every: 28 });
}
