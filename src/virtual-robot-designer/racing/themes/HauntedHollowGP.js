/** Track 13 — Haunted Hollow GP: full moon, friendly ghosts, jack-o'-lanterns, crooked trees. */
import * as THREE from 'three';
import {
  canvasTexture, signTexture, toon, glow, glowSprite, themeSky, themeLights, themeGround, roadSurface,
  kerbs, startStripes, coins, embankment, skyDisc, speckleTexture, sideScatter, roadArch, roadSupports,
} from './RaceThemeCore.js';

function cobbleTexture() {
  return canvasTexture((x, w, h) => {
    x.fillStyle = '#3d3550';
    x.fillRect(0, 0, w, h);
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * 16;
      for (let c = -1; c < 8; c++) {
        const shade = 110 + Math.floor(Math.random() * 40);
        x.fillStyle = `rgb(${shade - 10},${shade - 18},${shade + 14})`;
        x.beginPath();
        x.roundRect(c * 32 + off + 2, r * 32 + 2, 28, 28, 7);
        x.fill();
      }
    }
  }, 256, 256);
}

function pumpkinFaceTexture() {
  return canvasTexture((x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = '#ffe36b';
    x.shadowColor = '#ffb000';
    x.shadowBlur = 12;
    const tri = (cx, cy, s) => {
      x.beginPath();
      x.moveTo(cx - s, cy + s * 0.7);
      x.lineTo(cx + s, cy + s * 0.7);
      x.lineTo(cx, cy - s * 0.8);
      x.fill();
    };
    tri(38, 44, 13);
    tri(90, 44, 13);
    x.beginPath();
    x.moveTo(24, 76);
    for (let i = 0; i <= 8; i++) x.lineTo(24 + i * 10, 76 + (i % 2 ? 14 : 0) + Math.sin((i / 8) * Math.PI) * 10);
    x.lineTo(104, 76);
    x.quadraticCurveTo(64, 120, 24, 76);
    x.fill();
  }, 128, 128);
}

function jackOLantern(faceTex, faceSide) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 10), toon(0xff7a12, { roughness: 0.5, emissive: 0x6a2400, emissiveIntensity: 0.4 }));
  body.scale.set(1, 0.8, 1);
  body.position.y = 0.6;
  g.add(body);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.3, 6), toon(0x3a6b2a));
  stem.position.y = 1.25;
  g.add(stem);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false }));
  face.position.set(faceSide * 0.72, 0.62, 0);
  face.rotation.y = faceSide * Math.PI / 2;
  g.add(face);
  return g;
}

function deadTree(rand) {
  const g = new THREE.Group();
  const mat = toon(0x2b2033, { flatShading: true });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.5, 5, 6), mat);
  trunk.position.y = 2.5;
  trunk.rotation.z = (rand() - 0.5) * 0.2;
  g.add(trunk);
  for (let i = 0; i < 5; i++) {
    const len = 1.4 + rand() * 1.8;
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, len, 5), mat);
    const a = rand() * Math.PI * 2;
    const y = 2.8 + rand() * 2;
    b.position.set(Math.cos(a) * len * 0.35, y + len * 0.3, Math.sin(a) * len * 0.35);
    b.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    g.add(b);
  }
  return g;
}

function gravestone(rand) {
  const g = new THREE.Group();
  const mat = toon(0x77708c, { flatShading: true });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.25), mat);
  slab.position.y = 0.55;
  g.add(slab);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.25, 12, 1, false, 0, Math.PI), mat);
  top.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  top.position.y = 1.1;
  g.add(top);
  g.rotation.z = (rand() - 0.5) * 0.25;
  return g;
}

function ghost() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf4f6ff, emissive: 0xc9d4ff, emissiveIntensity: 0.55, transparent: true, opacity: 0.85, roughness: 0.4,
  });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), mat);
  head.position.y = 0.6;
  g.add(head);
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.1, 16, 1, true), mat);
  skirt.rotation.x = Math.PI;
  skirt.position.y = 0.05;
  g.add(skirt);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1030 });
  [-0.2, 0.2].forEach((x) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), eyeMat);
    e.position.set(x, 0.72, -0.53);
    g.add(e);
  });
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), eyeMat);
  mouth.position.set(0, 0.5, -0.56);
  mouth.scale.set(1.3, 0.8, 0.5);
  g.add(mouth);
  return g;
}

function bat() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x120a1c, side: THREE.DoubleSide });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat);
  g.add(body);
  const wings = [];
  [-1, 1].forEach((s) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(s * 0.9, 0.25);
    shape.lineTo(s * 0.75, -0.05);
    shape.lineTo(s * 0.55, 0.05);
    shape.lineTo(s * 0.35, -0.1);
    shape.lineTo(0, -0.05);
    const w = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
    w.rotation.x = -Math.PI / 2;
    const pivot = new THREE.Group();
    pivot.add(w);
    g.add(pivot);
    wings.push({ pivot, s });
  });
  g.userData.wings = wings;
  return g;
}

export function buildHauntedHollowGP(ctx) {
  const { hw, rand } = ctx;
  themeSky(ctx, { top: 0x0c0624, mid: 0x2d1460, horizon: 0x5a2d82, fog: 0x2b1846, near: 40, far: 250, stars: 320 });
  skyDisc(ctx, { color: 0xfff4d6, halo: 0xfff0c0, size: 42, haloSize: 240, height: 150, dist: 560, yaw: -0.3 });
  themeLights(ctx.scene, {
    sun: 0xb3a4ff, sunIntensity: 0.75, hemiSky: 0x6a4cff, hemiGround: 0x1a0f2e, hemiIntensity: 0.6,
    ambient: 0x2f2250, ambientIntensity: 0.5, night: true,
  });
  const grassTex = speckleTexture('#2a2238', ['#3a2f4d', '#1f1a2b', '#35284a'], { repeat: [50, 50] });
  themeGround(ctx, { color: 0xffffff, map: grassTex });
  embankment(ctx, { color: 0x2f2640 });
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.9), toon(0x4a4260, { flatShading: true }));
  pillar.geometry.translate(0, 0.5, 0);
  roadSupports(ctx, pillar, { step: 9 });

  roadSurface(ctx, { map: cobbleTexture(), roughness: 0.8, repeatLen: 3 });
  kerbs(ctx, 0xff8a1f, 0x6b3fa0);
  startStripes(ctx, 0xe9ddff);

  // Haunted gate with pumpkins on the posts.
  const gate = roadArch(ctx, 26, {
    postMat: toon(0x4a4260, { flatShading: true }), beamMat: toon(0x2b1a45), height: 7, postW: 1.3,
    signMap: signTexture('HAUNTED HOLLOW GP', { w: 1024, h: 160, bg: '#2b1a45', fg: '#ff9a2a', border: '#ffb347', glowColor: '#ff7a00', font: 'bold 90px system-ui, Arial' }),
  });
  const faceTex = pumpkinFaceTexture();
  [-1, 1].forEach((s) => {
    const p = jackOLantern(faceTex, 0);
    p.children[2].position.set(0, 0.62, -0.72);
    p.children[2].rotation.y = Math.PI;
    p.position.set(s * (hw + 1.2), 7.7, 0);
    gate.add(p);
    const h = glowSprite(0xff9a2a, 3, 0.8);
    h.position.set(s * (hw + 1.2), 8.3, 0);
    gate.add(h);
  });

  // Pumpkins lining the road, faces toward the track.
  [-1, 1].forEach((s) => {
    sideScatter(ctx, jackOLantern(faceTex, s), {
      step: 11, jitter: 4, sides: [s], offMin: 1.4, offMax: 3.5, clearR: 1, scaleMin: 0.8, scaleMax: 1.3, randomYaw: false,
    });
  });
  for (let d = 10; d < ctx.len; d += 33) {
    const s = rand() < 0.5 ? -1 : 1;
    const h = glowSprite(0xff8a1f, 2.6, 0.7);
    ctx.place(h, d, s * (hw + 2.4), { y: 0.8 });
  }

  for (let v = 0; v < 3; v++) {
    sideScatter(ctx, deadTree(rand), { step: 16, jitter: 10, offMin: 5, offMax: 22, clearR: 2, scaleMin: 0.9, scaleMax: 1.6, from: v * 5 });
  }
  for (let v = 0; v < 2; v++) {
    sideScatter(ctx, gravestone(rand), { step: 7, jitter: 5, offMin: 4, offMax: 14, clearR: 0.8, scaleMin: 0.8, scaleMax: 1.2, from: v * 3, randomYaw: false });
  }

  // Lantern posts with purple / green glow.
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3, 6), toon(0x1c1528));
  post.geometry.translate(0, 1.5, 0);
  const lanternDs = [];
  for (let d = 8; d < ctx.len; d += 22) lanternDs.push(d);
  ctx.scatter(post, lanternDs.flatMap((d, i) => [ctx.matrixAt(d, (i % 2 ? 1 : -1) * (hw + 1.9))]));
  lanternDs.forEach((d, i) => {
    const s = i % 2 ? 1 : -1;
    const c = i % 4 < 2 ? 0xb77bff : 0x7dff9a;
    const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), glow(c, 2.4));
    ctx.place(lamp, d, s * (hw + 1.9), { y: 3.1 });
    ctx.place(glowSprite(c, 3.4, 0.75), d, s * (hw + 1.9), { y: 3.1 });
  });

  // Friendly ghosts floating beside the track.
  const ghosts = [];
  for (let i = 0; i < 18; i++) {
    const g = ghost();
    const d = 14 + (i * ctx.len) / 18 + rand() * 8;
    const s = rand() < 0.5 ? -1 : 1;
    if (!ctx.place(g, d, s * (hw + 3 + rand() * 5), { y: 1.8 + rand() * 1.5, rotY: s * 0.6 })) continue;
    ghosts.push({ g, y: g.position.y, phase: rand() * 10 });
  }
  // Bats circling overhead.
  const bats = [];
  for (let i = 0; i < 14; i++) {
    const b = bat();
    ctx.root.add(b);
    bats.push({ b, d: (i * ctx.len) / 14, r: 4 + rand() * 6, h: 7 + rand() * 6, speed: 0.6 + rand() * 0.6, phase: rand() * 6 });
  }
  ctx.tick((now) => {
    for (const k of ghosts) {
      k.g.position.y = k.y + Math.sin(now * 1.6 + k.phase) * 0.35;
      k.g.children[1].rotation.z = Math.sin(now * 3 + k.phase) * 0.08;
    }
    for (const k of bats) {
      const f = ctx.frame(k.d);
      const a = now * k.speed + k.phase;
      k.b.position.set(f.pos.x + Math.cos(a) * k.r, f.roadY + k.h + Math.sin(a * 2) * 0.6, f.pos.z + Math.sin(a) * k.r);
      k.b.rotation.y = -a;
      const flap = Math.sin(now * 14 + k.phase) * 0.7;
      for (const w of k.b.userData.wings) w.pivot.rotation.z = w.s * flap;
    }
  });

  coins(ctx, { every: 30, color: 0xffb347, emissive: 0xff7a00 });
}
