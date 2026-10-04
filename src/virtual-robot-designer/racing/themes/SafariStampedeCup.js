/** Track 19 — Safari Stampede Cup: golden savanna, red dirt road, acacias, baobabs, zebra + giraffe herds. */
import * as THREE from 'three';
import {
  canvasTexture, signTexture, toon, themeSky, themeLights, themeGround, roadSurface, startStripes, coins,
  speckleTexture, sideScatter, skyDisc, rockLump, roadArch, lowPolyMountain, roadSupports, embankment,
} from './RaceThemeCore.js';

function dirtTexture() {
  return canvasTexture((x, w, h) => {
    x.fillStyle = '#b8603a';
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      x.fillStyle = ['#a4532f', '#c97048', '#9a4a2a', '#d38256'][i % 4];
      x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
    x.strokeStyle = 'rgba(90,40,20,0.35)';
    x.lineWidth = 6;
    [w * 0.3, w * 0.7].forEach((px) => {
      x.beginPath();
      x.moveTo(px, 0);
      x.lineTo(px, h);
      x.stroke();
    });
  }, 256, 256);
}

function zebraTexture() {
  return canvasTexture((x, w, h) => {
    x.fillStyle = '#f7f4ee';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#1a1a1a';
    for (let i = 0; i < 14; i++) {
      const px = (i / 14) * w;
      x.beginPath();
      x.moveTo(px, 0);
      x.quadraticCurveTo(px + 10, h / 2, px - 2, h);
      x.lineTo(px + 6, h);
      x.quadraticCurveTo(px + 16, h / 2, px + 6, 0);
      x.fill();
    }
  }, 128, 64);
}

function giraffeTexture() {
  return canvasTexture((x, w, h) => {
    x.fillStyle = '#f2c46a';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#a45a24';
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const px = c * (w / 6) + (r % 2) * 8 + 3;
        const py = r * (h / 6) + 3;
        x.beginPath();
        x.roundRect(px, py, w / 6 - 7, h / 6 - 7, 5);
        x.fill();
      }
    }
  }, 128, 128);
}

function legs(g, mat, w, l, h, r = 0.09) {
  [[-w, -l], [w, -l], [-w, l], [w, l]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, h, 6), mat);
    leg.position.set(x, h / 2, z);
    g.add(leg);
  });
}

function zebra(tex) {
  const g = new THREE.Group();
  const coat = toon(0xffffff, { map: tex });
  const dark = toon(0x1a1a1a);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.1, 4, 10), coat);
  body.rotation.x = Math.PI / 2;
  body.position.y = 1.15;
  g.add(body);
  legs(g, coat, 0.22, 0.5, 0.95);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.9, 8), coat);
  neck.position.set(0, 1.55, 0.8);
  neck.rotation.x = 0.6;
  g.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.62), coat);
  head.position.set(0, 1.9, 1.15);
  head.rotation.x = 0.35;
  g.add(head);
  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.8), dark);
  mane.position.set(0, 1.75, 0.72);
  mane.rotation.x = 0.6;
  g.add(mane);
  return g;
}

function giraffe(tex) {
  const g = new THREE.Group();
  const coat = toon(0xffffff, { map: tex });
  const dark = toon(0x6a3a18);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.1, 4, 10), coat);
  body.rotation.x = Math.PI / 2 - 0.2;
  body.position.y = 2.2;
  g.add(body);
  legs(g, coat, 0.28, 0.55, 2, 0.1);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 2.6, 8), coat);
  neck.position.set(0, 3.7, 0.95);
  neck.rotation.x = 0.35;
  g.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.7), coat);
  head.position.set(0, 5, 1.5);
  g.add(head);
  [-0.09, 0.09].forEach((x) => {
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 5), dark);
    horn.position.set(x, 5.27, 1.35);
    g.add(horn);
  });
  return g;
}

function acacia() {
  const g = new THREE.Group();
  const bark = toon(0x6b4a2e);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 4.5, 7), bark);
  trunk.position.y = 2.25;
  trunk.rotation.z = 0.08;
  g.add(trunk);
  [-1, 1].forEach((s) => {
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 2.4, 6), bark);
    br.position.set(s * 0.8, 4.6, 0);
    br.rotation.z = -s * 0.7;
    g.add(br);
  });
  const leaf = toon(0x6f9a3a, { flatShading: true });
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3, 0.9, 10), leaf);
  canopy.position.y = 5.6;
  g.add(canopy);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.2, 0.6, 10), toon(0x84ad45, { flatShading: true }));
  top.position.y = 6.2;
  g.add(top);
  return g;
}

function baobab() {
  const g = new THREE.Group();
  const bark = toon(0x9a7a62, { flatShading: true });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.7, 7, 9), bark);
  trunk.position.y = 3.5;
  g.add(trunk);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 2.4, 6), bark);
    br.position.set(Math.cos(a) * 1, 7.8, Math.sin(a) * 1);
    br.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
    g.add(br);
    const tuft = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 0), toon(0x5f8a34, { flatShading: true }));
    tuft.position.set(Math.cos(a) * 1.9, 8.9, Math.sin(a) * 1.9);
    g.add(tuft);
  }
  return g;
}

function grassTuft() {
  const g = new THREE.Group();
  const mat = toon(0xd9b24a, { flatShading: true });
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.9 + (i % 3) * 0.3, 4), mat);
    c.position.set(Math.cos(i * 1.3) * 0.25, 0.45, Math.sin(i * 1.3) * 0.25);
    c.rotation.set(Math.sin(i) * 0.3, 0, Math.cos(i) * 0.3);
    g.add(c);
  }
  return g;
}

function fenceSection(len = 3) {
  const g = new THREE.Group();
  const wood = toon(0x8a5a32);
  [-len / 2, len / 2].forEach((z) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1, 0.16), wood);
    post.position.set(0, 0.5, z);
    g.add(post);
  });
  [0.4, 0.8].forEach((y) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, len), wood);
    rail.position.set(0, y, 0);
    g.add(rail);
  });
  return g;
}

export function buildSafariStampedeCup(ctx) {
  const { hw, rand } = ctx;
  themeSky(ctx, { top: 0x5a9fe0, mid: 0xf2c78a, horizon: 0xffb56a, fog: 0xf0c48c, near: 90, far: 400 });
  themeLights(ctx.scene, { sun: 0xffd9a0, sunIntensity: 2.1, hemiSky: 0xffe0b0, hemiGround: 0xb08040, ambient: 0xffe6c0 });
  skyDisc(ctx, { color: 0xfff0b0, halo: 0xffa24a, size: 34, haloSize: 220, height: 40, yaw: 0.6 });
  const grass = speckleTexture('#d8b153', ['#c9a043', '#e6c066', '#b98f38'], { repeat: [70, 70] });
  themeGround(ctx, { color: 0xffffff, map: grass, roughness: 0.95 });
  embankment(ctx, { color: 0xc98a52 });
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.6), toon(0x7a4a28));
  post.geometry.translate(0, 0.5, 0);
  roadSupports(ctx, post);

  roadSurface(ctx, { map: dirtTexture(), roughness: 0.95, repeatLen: 6, envMapIntensity: 0.1 });
  startStripes(ctx, 0xfff4dc);

  // Wooden fences instead of kerbs.
  const fenceMats = [];
  for (let d = 0; d < ctx.len; d += 3) {
    [-1, 1].forEach((s) => fenceMats.push(ctx.matrixAt(d, s * (hw + 0.9))));
  }
  ctx.scatter(fenceSection(3), fenceMats);

  roadArch(ctx, 22, {
    postMat: toon(0x7a4a28), beamMat: toon(0x9a6a3a), height: 6.2,
    signMap: signTexture('SAFARI STAMPEDE CUP', { w: 1024, h: 160, bg: '#6b3f1f', fg: '#ffe7a8', border: '#ffb838', font: 'bold 88px system-ui, Arial' }),
  });

  // Watering hole with sign.
  const holeD = ctx.len * 0.45;
  const pond = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshStandardMaterial({ color: 0x3f9fd0, roughness: 0.1, metalness: 0.2 }));
  pond.rotation.x = -Math.PI / 2;
  const pondGroup = new THREE.Group();
  pondGroup.add(pond);
  pond.position.y = 0.06;
  ctx.place(pondGroup, holeD, hw + 14, { ground: true, clearR: 9 });
  const sign = new THREE.Group();
  const board = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.1), new THREE.MeshStandardMaterial({
    map: signTexture('WATERING HOLE', { w: 512, h: 160, bg: '#8a5a32', fg: '#fff1c8', border: '#4a2a12', font: 'bold 64px system-ui, Arial' }),
  }));
  board.position.y = 1.9;
  board.rotation.y = Math.PI;
  sign.add(board);
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.9, 0.18), toon(0x6b4a2e));
  pole.position.y = 0.95;
  sign.add(pole);
  ctx.place(sign, holeD - 14, hw + 2.6, { rotY: -0.5 });

  // Herds: zebras and giraffes grazing near the road, gently bobbing.
  const zTex = zebraTexture();
  const gTex = giraffeTexture();
  const herd = [];
  for (let d = 40; d < ctx.len - 10; d += 55) {
    const side = rand() < 0.5 ? -1 : 1;
    const count = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      const a = rand() < 0.35 ? giraffe(gTex) : zebra(zTex);
      const s = 0.9 + rand() * 0.3;
      a.scale.setScalar(s);
      const placed = ctx.place(a, d + i * 3.2 + rand() * 2, side * (hw + 6 + rand() * 12), { ground: true, rotY: (rand() - 0.5) * 1.2, clearR: 2 });
      if (placed) herd.push({ a, y: a.position.y, phase: rand() * 6 });
    }
  }
  ctx.tick((now) => {
    for (const h of herd) h.a.position.y = h.y + Math.abs(Math.sin(now * 3 + h.phase)) * 0.12;
  });

  sideScatter(ctx, acacia(), { step: 20, jitter: 12, offMin: 8, offMax: 40, clearR: 3.5, scaleMin: 0.9, scaleMax: 1.5, ground: true });
  sideScatter(ctx, baobab(), { step: 60, jitter: 20, offMin: 18, offMax: 50, clearR: 3, scaleMin: 0.9, scaleMax: 1.3, ground: true, from: 25 });
  sideScatter(ctx, grassTuft(), { step: 3, jitter: 3, offMin: 1.8, offMax: 14, clearR: 0.3, scaleMin: 0.7, scaleMax: 1.6, ground: true });
  sideScatter(ctx, rockLump(0xa8764a), { step: 16, jitter: 10, offMin: 3, offMax: 20, clearR: 1.4, scaleMin: 0.6, scaleMax: 2.2, ground: true });

  for (let i = 0; i < 10; i++) {
    const m = lowPolyMountain(rand, [0xc98a5a, 0xb97a4a, 0xd89a68], { snow: 0xd89a68, rMin: 20, rMax: 36, hMin: 14, hMax: 26 });
    ctx.place(m, rand() * ctx.len, (rand() < 0.5 ? -1 : 1) * (110 + rand() * 80), { ground: true, face: false });
  }

  coins(ctx, { every: 30 });
}
