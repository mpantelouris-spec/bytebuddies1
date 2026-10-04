/** Track 15 — Bamboo Thunder Rally: storm sky with lightning, misty peaks, bamboo groves, pagodas, striped road. */
import * as THREE from 'three';
import {
  signTexture, toon, glow, glowSprite, themeSky, themeLights, themeGround, roadSurface, kerbs, laneStripes,
  startStripes, coins, embankment, speckleTexture, sideScatter, precipitation, collectLights, cloudPuff, roadSupports,
} from './RaceThemeCore.js';

function bambooClump(rand) {
  const g = new THREE.Group();
  const greens = [0x7cc43f, 0x5fa832, 0x8fd14f];
  const leafMat = toon(0x4f9a2f, { side: THREE.DoubleSide, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const h = 5 + rand() * 5;
    const mat = toon(greens[i % greens.length], { roughness: 0.5 });
    const x = (rand() - 0.5) * 2.2;
    const z = (rand() - 0.5) * 2.2;
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, h, 6), mat);
    stalk.position.set(x, h / 2, z);
    stalk.rotation.z = (rand() - 0.5) * 0.12;
    g.add(stalk);
    for (let k = 1; k < h / 1.1; k++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 4, 8), toon(0x3f7a22));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, k * 1.1, z);
      g.add(ring);
    }
    for (let k = 0; k < 4; k++) {
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 1.2), leafMat);
      leaf.position.set(x + (rand() - 0.5) * 0.6, h - rand() * 2, z + (rand() - 0.5) * 0.6);
      leaf.rotation.set(rand() * 1.2, rand() * Math.PI * 2, 0.8);
      g.add(leaf);
    }
  }
  return g;
}

function peak(rand) {
  const g = new THREE.Group();
  const h = 34 + rand() * 40;
  const r = 7 + rand() * 7;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.25, r, h, 7, 4), toon([0x55705a, 0x6d8a6e, 0x4a6250][Math.floor(rand() * 3)], { flatShading: true, roughness: 0.9 }));
  body.position.y = h / 2;
  const pos = body.geometry.attributes.position;
  const seed = rand() * 100;
  for (let i = 0; i < pos.count; i++) {
    const n = Math.sin(pos.getX(i) * 12.9898 + pos.getY(i) * 78.233 + pos.getZ(i) * 37.719 + seed) * 43758.5453;
    const k = 0.85 + (n - Math.floor(n)) * 0.3;
    pos.setX(i, pos.getX(i) * k);
    pos.setZ(i, pos.getZ(i) * k);
  }
  body.geometry.computeVertexNormals();
  g.add(body);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 0.35, 8, 6), toon(0x3f7a3f, { flatShading: true }));
  cap.position.y = h;
  g.add(cap);
  return g;
}

function pagoda(tiers = 4) {
  const g = new THREE.Group();
  const red = toon(0xc0392b);
  const roof = toon(0x2f4f3a, { flatShading: true });
  const gold = glow(0xffc53d, 0.4, { metalness: 0.6 });
  let y = 0;
  let w = 7;
  const base = new THREE.Mesh(new THREE.BoxGeometry(w + 1.5, 1, w + 1.5), toon(0x8c8c8c, { flatShading: true }));
  base.position.y = 0.5;
  g.add(base);
  y = 1;
  for (let i = 0; i < tiers; i++) {
    const h = 2.4;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), red);
    body.position.y = y + h / 2;
    g.add(body);
    const r = new THREE.Mesh(new THREE.ConeGeometry(w * 0.95, 1.6, 4, 1), roof);
    r.rotation.y = Math.PI / 4;
    r.position.y = y + h + 0.6;
    g.add(r);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => {
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.7, 5), gold);
      tip.position.set(a * w * 0.66, y + h + 0.2, b * w * 0.66);
      tip.rotation.set(b * -0.9, 0, a * 0.9);
      g.add(tip);
    });
    y += h + 1.2;
    w *= 0.8;
  }
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.3, 3, 8), gold);
  spire.position.y = y + 1.4;
  g.add(spire);
  return g;
}

function toriiGate(ctx, d, signMap) {
  const g = new THREE.Group();
  const w = ctx.hw * 2 + 2.6;
  const red = toon(0xd63a2a);
  const black = toon(0x1e1e1e);
  [-1, 1].forEach((s) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 7, 12), red);
    post.position.set(s * w / 2, 3.5, 0);
    g.add(post);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(w + 3, 0.6, 0.8), black);
  beam.position.y = 7.3;
  g.add(beam);
  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.5, 0.5), red);
  beam2.position.y = 6.1;
  g.add(beam2);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.6, 0.9), new THREE.MeshStandardMaterial({ map: signMap }));
  plaque.position.set(0, 6.7, -0.42);
  plaque.rotation.y = Math.PI;
  g.add(plaque);
  ctx.place(g, d, 0);
}

function stoneLantern() {
  const g = new THREE.Group();
  const mat = toon(0x8f8f8a, { flatShading: true });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.9, 6), mat);
  base.position.y = 0.45;
  g.add(base);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), mat);
  box.position.y = 1.2;
  g.add(box);
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.72), glow(0xffc46b, 1.8));
  light.position.y = 1.2;
  g.add(light);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 4), mat);
  cap.rotation.y = Math.PI / 4;
  cap.position.y = 1.75;
  g.add(cap);
  return g;
}

function lightningBolt() {
  const pts = [];
  let x = 0;
  for (let y = 0; y >= -60; y -= 6) {
    pts.push(new THREE.Vector3(x, y, 0));
    x += (Math.random() - 0.5) * 7;
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.5, 5, false);
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xeef4ff, fog: false, transparent: true, opacity: 0 }));
}

export function buildBambooThunderRally(ctx) {
  const { hw, rand } = ctx;
  themeSky(ctx, { top: 0x2c3445, mid: 0x4f5b70, horizon: 0x9aa7b5, fog: 0x8a96a3, near: 55, far: 300 });
  themeLights(ctx.scene, { sun: 0xc8d2e0, hemiSky: 0x9fb0c8, hemiGround: 0x2f3b2a, ambient: 0xb8c4d4 });
  const grassTex = speckleTexture('#3f7a3a', ['#4f8f45', '#35692f', '#5a9a4a'], { repeat: [60, 60] });
  themeGround(ctx, { color: 0xffffff, map: grassTex });
  embankment(ctx, { color: 0x4a8a40 });
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.9), toon(0x7a7a70, { flatShading: true }));
  pillar.geometry.translate(0, 0.5, 0);
  roadSupports(ctx, pillar);

  roadSurface(ctx, { color: 0x5b6068, roughness: 0.55, metalness: 0.05 });
  laneStripes(ctx, [0xe05a47, 0xf2a541, 0xf6d55c, 0x6fbf73, 0x4f9fd8, 0x8c6fd1], { from: 0, to: ctx.len, emissiveIntensity: 0.12, width: hw * 1.7, opacity: 0.85 });
  kerbs(ctx, 0xe53935, 0xffffff);
  startStripes(ctx, 0xffffff);

  toriiGate(ctx, 24, signTexture('BAMBOO THUNDER RALLY', { w: 1024, h: 150, bg: '#1e1e1e', fg: '#ffd166', border: '#d63a2a', font: 'bold 80px system-ui, Arial' }));
  toriiGate(ctx, ctx.len * 0.5, signTexture('雷 RALLY 竹', { w: 768, h: 150, bg: '#1e1e1e', fg: '#ffd166', border: '#d63a2a', font: 'bold 84px system-ui, Arial' }));

  const pg = pagoda(4);
  ctx.place(pg, 48, -(hw + 20), { clearR: 8, ground: true, face: true });
  ctx.place(pagoda(5), ctx.len * 0.35, hw + 26, { clearR: 9, ground: true });
  ctx.place(pagoda(3), ctx.len * 0.72, -(hw + 24), { clearR: 8, ground: true });

  for (let v = 0; v < 4; v++) {
    sideScatter(ctx, peak(rand), { step: 30 + v * 6, jitter: 18, offMin: 45, offMax: 130, clearR: 12, scaleMin: 0.8, scaleMax: 1.5, ground: true, from: v * 9 });
  }
  for (let v = 0; v < 3; v++) {
    sideScatter(ctx, bambooClump(rand), { step: 9, jitter: 6, offMin: 3.5, offMax: 16, clearR: 1.8, scaleMin: 0.8, scaleMax: 1.3, ground: true, from: v * 3 });
  }
  sideScatter(ctx, stoneLantern(), { step: 20, jitter: 2, offMin: 1.6, offMax: 2.2, clearR: 0.8, randomYaw: false, scaleMin: 1, scaleMax: 1 });

  // Mist banks between the peaks.
  const mistMat = new THREE.MeshStandardMaterial({ color: 0xdfe6ee, emissive: 0xdfe6ee, emissiveIntensity: 0.25, transparent: true, opacity: 0.55, depthWrite: false, roughness: 1 });
  for (let i = 0; i < 18; i++) {
    const c = cloudPuff(rand, mistMat, 6, 5, 9);
    c.scale.y = 0.4;
    ctx.place(c, rand() * ctx.len, (rand() < 0.5 ? -1 : 1) * (40 + rand() * 70), { y: 4 + rand() * 10, ground: true, face: false });
  }
  // Storm clouds overhead.
  const stormMat = new THREE.MeshStandardMaterial({ color: 0x5a6475, roughness: 1, fog: false });
  for (let i = 0; i < 16; i++) {
    const c = cloudPuff(rand, stormMat, 6, 8, 14);
    ctx.place(c, rand() * ctx.len, (rand() - 0.5) * 220, { y: 55 + rand() * 20, face: false });
  }

  precipitation(ctx, { count: 1100, color: 0xcfd9e8, speed: 32, opacity: 0.4 });

  // Lightning: bolt flashes and the whole scene brightens for a moment.
  const bolt = lightningBolt();
  ctx.root.add(bolt);
  const lights = collectLights(ctx.scene).map((l) => ({ l, base: l.intensity }));
  const flash = glowSprite(0xdde8ff, 160, 0);
  flash.material.fog = false;
  ctx.root.add(flash);
  let next = 3;
  let strikeAt = -10;
  ctx.tick((now, camera) => {
    if (now > next) {
      strikeAt = now;
      next = now + 4 + Math.random() * 5;
      const f = ctx.frame(rand() * ctx.len, (rand() < 0.5 ? -1 : 1) * (60 + rand() * 60));
      bolt.position.set(f.pos.x, f.roadY + 62, f.pos.z);
      flash.position.set(f.pos.x, f.roadY + 50, f.pos.z);
      if (camera) bolt.lookAt(camera.position.x, bolt.position.y, camera.position.z);
    }
    const t = now - strikeAt;
    const k = t < 0.5 ? (t < 0.08 || (t > 0.16 && t < 0.24) ? 1 : 0.25) * (1 - t * 1.6) : 0;
    bolt.material.opacity = k;
    flash.material.opacity = k * 0.9;
    for (const { l, base } of lights) l.intensity = base * (1 + k * 1.4);
  });

  coins(ctx, { every: 30 });
}
