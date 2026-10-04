/**
 * CandyRainbowSceneKit.js — Candy Rainbow Run start view.
 * Left: frosted candy cliffs, lollipops, pines. Road: start stripes, rainbow lane, spinning coins.
 * Right: ? blocks, cloud banks, blue low-poly mountains. Everything is placed along the curve from the spawn.
 */
import * as THREE from 'three';

const ROOT_NAME = 'candy-rainbow-scene';
const RAINBOW = [0xff3b3b, 0xff9a1f, 0xffe23a, 0x3ed25a, 0x2fb4ff, 0x4a64ff, 0xb04cff];

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function toon(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.02, ...opts });
}

function wrapT(t) {
  return ((t % 1) + 1) % 1;
}

function makeFrame(curve, t0, yLift) {
  const len = Math.max(1, curve.getLength());
  return (d, side = 0) => {
    const t = wrapT(t0 + d / len);
    const p = curve.getPointAt(t);
    const q = curve.getPointAt(wrapT(t + 0.002));
    const tan = new THREE.Vector3(q.x - p.x, 0, q.z - p.z);
    if (tan.lengthSq() < 1e-8) tan.set(0, 0, 1);
    tan.normalize();
    // Screen-right when looking down the tangent.
    const right = new THREE.Vector3(-tan.z, 0, tan.x);
    const roadY = p.y + yLift;
    const pos = new THREE.Vector3(p.x, roadY, p.z).addScaledVector(right, side);
    return { t, pos, tan, right, roadY, angle: Math.atan2(tan.x, tan.z) };
  };
}

function makeClearance(curve, halfWidth) {
  const samples = [];
  for (let i = 0; i < 480; i++) {
    const t = i / 480;
    const p = curve.getPointAt(t);
    samples.push({ t, x: p.x, z: p.z });
  }
  return (pos, radius, ownT) => {
    const limit = halfWidth + 2.2 + radius;
    const lim2 = limit * limit;
    for (const s of samples) {
      const dt = Math.abs(s.t - ownT);
      if (Math.min(dt, 1 - dt) < 0.018) continue;
      const dx = s.x - pos.x;
      const dz = s.z - pos.z;
      if (dx * dx + dz * dz < lim2) return false;
    }
    return true;
  };
}

function canvasTexture(draw, size = 128) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  draw(c.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function questionTexture() {
  return canvasTexture((x, s) => {
    const g = x.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#ffdd4d');
    g.addColorStop(1, '#f2a31c');
    x.fillStyle = g;
    x.fillRect(0, 0, s, s);
    x.strokeStyle = '#b8660c';
    x.lineWidth = 8;
    x.strokeRect(4, 4, s - 8, s - 8);
    x.fillStyle = '#b8660c';
    [[16, 16], [s - 16, 16], [16, s - 16], [s - 16, s - 16]].forEach(([a, b]) => {
      x.beginPath();
      x.arc(a, b, 5, 0, Math.PI * 2);
      x.fill();
    });
    x.font = 'bold 86px system-ui, Arial, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.lineWidth = 10;
    x.strokeStyle = '#7a3d00';
    x.strokeText('?', s / 2, s / 2 + 5);
    x.fillStyle = '#ffffff';
    x.fillText('?', s / 2, s / 2 + 5);
  });
}

function swirlTexture(colorA, colorB) {
  return canvasTexture((x, s) => {
    x.fillStyle = colorB;
    x.fillRect(0, 0, s, s);
    x.strokeStyle = colorA;
    x.lineWidth = 11;
    x.lineCap = 'round';
    x.beginPath();
    for (let a = 0; a < Math.PI * 9; a += 0.08) {
      const r = (a / (Math.PI * 9)) * (s / 2 - 6);
      const px = s / 2 + Math.cos(a) * r;
      const py = s / 2 + Math.sin(a) * r;
      if (a === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.stroke();
  });
}

function candyRock(rand, icingMat) {
  const g = new THREE.Group();
  const pinks = [0xff8cc6, 0xff6fb5, 0xffa6d4, 0xf77fbe];
  const tiers = 1 + Math.floor(rand() * 2);
  let y = 0;
  let r = 2.6 + rand() * 2.4;
  for (let i = 0; i < tiers; i++) {
    const h = 3 + rand() * 4.5;
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.9, r, h, 9),
      toon(pinks[Math.floor(rand() * pinks.length)]),
    );
    body.position.y = y + h / 2;
    g.add(body);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.7, 9), icingMat);
    band.position.y = y + h - 0.25;
    g.add(band);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 0.93, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), icingMat);
    cap.scale.y = 0.32;
    cap.position.y = y + h + 0.05;
    g.add(cap);
    for (let k = 0; k < 6; k++) {
      const a = rand() * Math.PI * 2;
      const drip = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), icingMat);
      drip.scale.set(1, 1.8 + rand() * 1.4, 1);
      drip.position.set(Math.cos(a) * r * 0.93, y + h - 0.9 - rand() * 0.5, Math.sin(a) * r * 0.93);
      g.add(drip);
    }
    y += h + 0.15;
    r *= 0.62;
  }
  g.userData.radius = 5;
  return g;
}

function lollipop(swirl, rimColor) {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 8), toon(0xffffff));
  stick.position.y = 1.6;
  g.add(stick);
  const faceMat = new THREE.MeshStandardMaterial({ map: swirl, roughness: 0.3 });
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 0.3, 32),
    [toon(rimColor, { roughness: 0.3 }), faceMat, faceMat],
  );
  disc.rotation.x = Math.PI / 2;
  disc.position.y = 3.6;
  g.add(disc);
  return g;
}

function pine(scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1, 6), toon(0x8a5a2b));
  trunk.position.y = 0.5;
  g.add(trunk);
  const greens = [0x2f9a4a, 0x38ad55, 0x44c062];
  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.35 - i * 0.32, 1.7, 8), toon(greens[i], { flatShading: true }));
    cone.position.y = 1.4 + i * 0.95;
    g.add(cone);
  }
  g.scale.setScalar(scale);
  return g;
}

function gumdrop(color) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    toon(color, { roughness: 0.25, emissive: color, emissiveIntensity: 0.12 }),
  );
  m.scale.y = 1.2;
  return m;
}

function cloudPuff(rand, mat, count, rMin, rMax) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const r = rMin + rand() * (rMax - rMin);
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
    s.position.set((i - count / 2) * r * 0.9 + rand() * r * 0.4, rand() * r * 0.5, (rand() - 0.5) * r);
    g.add(s);
  }
  return g;
}

function mountain(rand) {
  const g = new THREE.Group();
  const blues = [0x3d8fe6, 0x5aa9f5, 0x2f7ad6, 0x4b9bf0];
  const r = 16 + rand() * 12;
  const h = 26 + rand() * 18;
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(r, h, 6),
    toon(blues[Math.floor(rand() * blues.length)], { flatShading: true, roughness: 0.7 }),
  );
  body.position.y = h / 2;
  body.rotation.y = rand() * Math.PI;
  g.add(body);
  const capH = h * 0.26;
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(r * 0.27, capH, 6),
    toon(0xf4fbff, { flatShading: true }),
  );
  cap.position.y = h - capH / 2 + 0.05;
  cap.rotation.y = body.rotation.y;
  g.add(cap);
  return g;
}

function questionBlock(tex) {
  const mat = new THREE.MeshStandardMaterial({
    map: tex, roughness: 0.35, emissive: 0xffb000, emissiveIntensity: 0.18,
  });
  return new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), mat);
}

function rainbowLane(frame, halfWidth, d0, d1) {
  const g = new THREE.Group();
  g.name = 'candy-rainbow-lane';
  const width = halfWidth * 1.92;
  const lanes = RAINBOW.length;
  const steps = 110;
  RAINBOW.forEach((color, k) => {
    const pos = [];
    const idx = [];
    const a = -width / 2 + (width * k) / lanes;
    const b = -width / 2 + (width * (k + 1)) / lanes;
    for (let i = 0; i <= steps; i++) {
      const f = frame(d0 + ((d1 - d0) * i) / steps);
      const pa = f.pos.clone().addScaledVector(f.right, a);
      const pb = f.pos.clone().addScaledVector(f.right, b);
      pos.push(pa.x, f.roadY + 0.04, pa.z, pb.x, f.roadY + 0.04, pb.z);
      if (i < steps) {
        const v = i * 2;
        idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
      roughness: 0.35,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }));
    mesh.receiveShadow = true;
    g.add(mesh);
  });
  return g;
}

function placeAt(root, obj, f, yOffset = 0, faceRoad = true) {
  obj.position.set(f.pos.x, f.roadY + yOffset, f.pos.z);
  if (faceRoad) obj.rotation.y = f.angle;
  root.add(obj);
  return obj;
}

export function installCandyRainbowScene(scene, curve, { halfWidth = 4, spawn = null, startT = 0 } = {}) {
  const prev = scene.getObjectByName(ROOT_NAME);
  if (prev) prev.parent?.remove(prev);
  const oldPresentation = scene.getObjectByName('original-race-presentation');
  if (oldPresentation) oldPresentation.parent?.remove(oldPresentation);

  const t0 = wrapT(spawn?.trackT ?? startT ?? 0);
  const p0 = curve.getPointAt(t0);
  let yLift = spawn && Number.isFinite(spawn.y) ? spawn.y - p0.y : 0.2;
  if (!Number.isFinite(yLift) || Math.abs(yLift) > 3) yLift = 0.2;

  const frame = makeFrame(curve, t0, yLift);
  const clear = makeClearance(curve, halfWidth);
  const rand = seeded(20260924);
  const hw = halfWidth;

  const root = new THREE.Group();
  root.name = ROOT_NAME;

  const icing = toon(0xfff3f8, { roughness: 0.35 });
  const qTex = questionTexture();
  const swirls = [
    [swirlTexture('#ff3d8b', '#ffffff'), 0xff3d8b],
    [swirlTexture('#7a4dff', '#ffe8ff'), 0x7a4dff],
    [swirlTexture('#ff8a1f', '#fff6c8'), 0xff8a1f],
  ];
  const cloudMat = toon(0xffffff, { roughness: 0.9, emissive: 0xffffff, emissiveIntensity: 0.18 });
  const skyCloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.45, fog: false,
  });

  // Start-line stripes under the kart's nose.
  const stripeMat = toon(0xf4efff, { roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 });
  const fStripe = frame(4.2);
  for (let x = -hw * 0.88; x <= hw * 0.88 + 0.01; x += 0.95) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 2.4), stripeMat);
    bar.rotation.x = -Math.PI / 2;
    const holder = new THREE.Group();
    holder.add(bar);
    const p = fStripe.pos.clone().addScaledVector(fStripe.right, x);
    holder.position.set(p.x, fStripe.roadY + 0.035, p.z);
    holder.rotation.y = fStripe.angle;
    root.add(holder);
  }

  const road = scene.userData.raceRoadMesh;
  if (road?.material && !Array.isArray(road.material)) {
    road.material.color?.set(0xe4e6ea);
    if ('envMapIntensity' in road.material) road.material.envMapIntensity = 0.08;
    if ('roughness' in road.material) road.material.roughness = 0.92;
    if ('metalness' in road.material) road.material.metalness = 0;
    road.material.needsUpdate = true;
  }

  // Red / white kerbs down both edges of the start straight and first bends.
  const kerbGeo = new THREE.BoxGeometry(0.55, 0.14, 1.5);
  const kerbRed = toon(0xe53935, { roughness: 0.5 });
  const kerbWhite = toon(0xffffff, { roughness: 0.5 });
  for (let i = 0, d = -8; d < 130; d += 1.5, i++) {
    [-1, 1].forEach((s) => {
      const f = frame(d, s * (hw + 0.2));
      const kerb = new THREE.Mesh(kerbGeo, i % 2 ? kerbWhite : kerbRed);
      placeAt(root, kerb, f, 0.07);
    });
  }

  // Rainbow section curving away ahead.
  root.add(rainbowLane(frame, hw, 10, 125));

  // Floating spinning coins.
  const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 28);
  const coinMat = toon(0xffc93a, { metalness: 0.65, roughness: 0.22, emissive: 0xffa000, emissiveIntensity: 0.4 });
  const coinRows = [
    { d: 12, lanes: [-0.55, -0.35, -0.15].map((s) => s * hw) },
    { d: 15, lanes: [0.3 * hw, 0.5 * hw] },
    { d: 30, lanes: [-0.3 * hw, 0, 0.3 * hw] },
    { d: 42, lanes: [0.45 * hw] },
    { d: 46, lanes: [0.45 * hw] },
    { d: 50, lanes: [0.45 * hw] },
    { d: 62, lanes: [-0.4 * hw, -0.1 * hw] },
    { d: 78, lanes: [0, 0.3 * hw] },
    { d: 95, lanes: [-0.3 * hw, 0, 0.3 * hw] },
  ];
  let coinIdx = 0;
  coinRows.forEach(({ d, lanes }) => {
    lanes.forEach((side) => {
      const f = frame(d, side);
      const holder = new THREE.Group();
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.rotation.x = Math.PI / 2;
      coin.castShadow = true;
      holder.add(coin);
      placeAt(root, holder, f, 1.15);
      const base = f.angle;
      const phase = coinIdx++ * 0.7;
      coin.onBeforeRender = () => {
        holder.rotation.y = base + performance.now() * 0.003 + phase;
      };
    });
  });

  // Left: candy wall along the kerb.
  const wallPink = toon(0xff7cc0);
  for (let d = 3; d < 112; d += 3) {
    const f = frame(d, -(hw + 2.0));
    const seg = new THREE.Group();
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 3.05), wallPink);
    wall.position.y = 0.45;
    seg.add(wall);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.28, 3.1), icing);
    top.position.y = 0.95;
    seg.add(top);
    placeAt(root, seg, f, -0.05);
  }

  // Left: frosted candy cliffs, lollipops, gumdrops, pines.
  for (let d = 4; d < 150; d += 7 + rand() * 4) {
    const side = -(hw + 7 + rand() * 9);
    const f = frame(d, side);
    if (!clear(f.pos, 5, f.t)) continue;
    const rock = candyRock(rand, icing);
    rock.rotation.y = rand() * Math.PI;
    placeAt(root, rock, f, -0.1, false);
  }
  for (let d = 6; d < 120; d += 9 + rand() * 5) {
    const f = frame(d, -(hw + 3.6 + rand() * 1.2));
    if (!clear(f.pos, 1.5, f.t)) continue;
    const [tex, rim] = swirls[Math.floor(rand() * swirls.length)];
    placeAt(root, lollipop(tex, rim), f, -0.05);
  }
  const gumColors = [0xff4fa0, 0x9b5bff, 0x3fd6ff, 0xffd23f, 0x5ee07a];
  for (let d = 8; d < 110; d += 6 + rand() * 5) {
    const f = frame(d, -(hw + 4.5 + rand() * 2.5));
    if (!clear(f.pos, 1, f.t)) continue;
    placeAt(root, gumdrop(gumColors[Math.floor(rand() * gumColors.length)]), f, -0.05, false);
  }
  for (let d = 10; d < 160; d += 5 + rand() * 5) {
    const f = frame(d, -(hw + 9 + rand() * 16));
    if (!clear(f.pos, 1.5, f.t)) continue;
    placeAt(root, pine(1 + rand() * 0.9), f, -0.1, false);
  }

  // Right: floating ? blocks just past the kerb.
  const blockPlan = [
    { d: 14, side: hw + 2.6, y: 1.8 },
    { d: 17, side: hw + 3.2, y: 2.6 },
    { d: 21, side: hw + 2.8, y: 1.6 },
    { d: 34, side: hw + 3.0, y: 2.4 },
    { d: 38, side: hw + 2.6, y: 3.2 },
    { d: 58, side: hw + 3.0, y: 2.0 },
    { d: 74, side: hw + 3.4, y: 2.8 },
  ];
  blockPlan.forEach(({ d, side, y }, i) => {
    const f = frame(d, side);
    if (!clear(f.pos, 1, f.t)) return;
    const block = questionBlock(qTex);
    block.castShadow = true;
    placeAt(root, block, f, y);
    const baseY = block.position.y;
    const baseRot = block.rotation.y;
    block.onBeforeRender = () => {
      const now = performance.now() * 0.001;
      block.position.y = baseY + Math.sin(now * 2 + i) * 0.18;
      block.rotation.y = baseRot + Math.sin(now * 0.8 + i) * 0.25;
    };
  });

  // Right: fluffy cloud banks beside the road.
  for (let d = 8; d < 140; d += 6 + rand() * 5) {
    const f = frame(d, hw + 5 + rand() * 5);
    if (!clear(f.pos, 4, f.t)) continue;
    placeAt(root, cloudPuff(rand, cloudMat, 5 + Math.floor(rand() * 3), 1.2, 2.5), f, -0.2 + rand() * 0.8);
  }

  // Right: blue low-poly mountains with a few pines at their feet.
  for (let d = 30; d < 260; d += 18 + rand() * 12) {
    const f = frame(d, hw + 42 + rand() * 34);
    if (!clear(f.pos, 26, f.t)) continue;
    placeAt(root, mountain(rand), f, -0.4, false);
    for (let k = 0; k < 3; k++) {
      const pf = frame(d - 6 + rand() * 12, hw + 18 + rand() * 12);
      if (clear(pf.pos, 1.5, pf.t)) placeAt(root, pine(1.1 + rand() * 0.6), pf, -0.1, false);
    }
  }

  // Sky clouds.
  for (let i = 0; i < 12; i++) {
    const d = 50 + rand() * 230;
    const side = (rand() < 0.5 ? -1 : 1) * (15 + rand() * 80);
    const f = frame(d, side);
    placeAt(root, cloudPuff(rand, skyCloudMat, 4 + Math.floor(rand() * 3), 4, 8), f, 24 + rand() * 20);
  }

  scene.add(root);
  scene.userData.racePresentationRoot = root;
  scene.background = new THREE.Color(0x5fb8ff);
  scene.fog = new THREE.Fog(0xcdeeff, 90, 360);
  scene.userData.racePresentation = 'candy-rainbow-run';
  return root;
}
