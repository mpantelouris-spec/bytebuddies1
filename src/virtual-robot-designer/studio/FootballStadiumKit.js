/**
 * FootballStadiumKit.js — Broadcast-style stadium around the Robot Football pitch.
 * Cheap meshes + instancing for school tablets. FootballBot only.
 *
 * Pitch length is Z (goals at ±GOAL_Z). Width is X.
 */
import * as THREE from 'three';
import { PITCH_HALF_X, PITCH_HALF_Z } from './football-match-engine.js';

const PITCH_Y = 0.02;

function stdMat(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: extras.roughness ?? 0.82,
    metalness: extras.metalness ?? 0.08,
    emissive: extras.emissive ?? 0x000000,
    emissiveIntensity: extras.emi ?? 0,
    ...extras.rest,
  });
}

function makeGrassMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const stripes = 14;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1a9f4a' : '#5ee87a';
    ctx.fillRect(0, (h / stripes) * i, w, h / stripes + 1);
  }

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 5;
  ctx.strokeRect(22, 22, w - 44, h - 44);

  ctx.beginPath();
  ctx.moveTo(22, h / 2);
  ctx.lineTo(w - 22, h / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
  ctx.fill();

  const boxW = 640;
  const boxH = 132;
  const sixW = 300;
  const sixH = 58;
  ctx.strokeRect(w / 2 - boxW / 2, 22, boxW, boxH);
  ctx.strokeRect(w / 2 - boxW / 2, h - 22 - boxH, boxW, boxH);
  ctx.strokeRect(w / 2 - sixW / 2, 22, sixW, sixH);
  ctx.strokeRect(w / 2 - sixW / 2, h - 22 - sixH, sixW, sixH);

  const spotY = 22 + 88;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(w / 2, spotY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w / 2, h - spotY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w / 2, spotY, 72, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w / 2, h - spotY, 72, 1.18 * Math.PI, 1.82 * Math.PI);
  ctx.stroke();

  [[22, 22], [w - 22, 22], [22, h - 22], [w - 22, h - 22]].forEach(([cx, cy], i) => {
    ctx.beginPath();
    const start = i === 0 ? 0 : i === 1 ? Math.PI / 2 : i === 2 ? -Math.PI / 2 : Math.PI;
    ctx.arc(cx, cy, 28, start, start + Math.PI / 2);
    ctx.stroke();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return { map: tex };
}

export function buildPbrPitch() {
  const { map } = makeGrassMap();
  const grp = new THREE.Group();
  // Unlit grass — stays vivid on low-GPU / low-graphics tier (PBR grass reads black without env).
  const mat = new THREE.MeshBasicMaterial({
    map,
    color: 0xffffff,
  });
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(PITCH_HALF_X * 2, PITCH_HALF_Z * 2), mat);
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.y = PITCH_Y;
  pitch.receiveShadow = true;
  pitch.name = 'Pitch';
  pitch.frustumCulled = false;
  grp.add(pitch);

  const apron = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH_HALF_X * 2 + 3.2, PITCH_HALF_Z * 2 + 3.2),
    stdMat(0x0f3d1a, { roughness: 0.95 }),
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.y = PITCH_Y - 0.012;
  apron.receiveShadow = true;
  grp.add(apron);

  const concourse = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH_HALF_X * 2 + 18, PITCH_HALF_Z * 2 + 16),
    stdMat(0x111827, { roughness: 0.92 }),
  );
  concourse.rotation.x = -Math.PI / 2;
  concourse.position.y = PITCH_Y - 0.03;
  concourse.receiveShadow = true;
  grp.add(concourse);

  const chalk = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xf8fafc,
    emissiveIntensity: 0.28,
    roughness: 0.45,
    metalness: 0.05,
    transparent: true,
    opacity: 0.98,
  });
  const lineY = PITCH_Y + 0.03;
  const addLine = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.016, d), chalk);
    m.position.set(x, lineY, z);
    m.renderOrder = 2;
    grp.add(m);
  };
  addLine(PITCH_HALF_X * 2, 0.1, 0, 0);
  addLine(PITCH_HALF_X * 2, 0.08, 0, -PITCH_HALF_Z + 0.04);
  addLine(PITCH_HALF_X * 2, 0.08, 0, PITCH_HALF_Z - 0.04);
  addLine(0.08, PITCH_HALF_Z * 2, -PITCH_HALF_X + 0.04, 0);
  addLine(0.08, PITCH_HALF_Z * 2, PITCH_HALF_X - 0.04, 0);

  const addRing = (r, x, z) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.055, r + 0.055, 48), chalk);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, lineY, z);
    ring.renderOrder = 2;
    grp.add(ring);
  };
  addRing(3.6, 0, 0);
  const boxW = 12.4;
  const boxD = 5.1;
  const sixW = 6.2;
  const sixD = 2.15;
  [-1, 1].forEach((sign) => {
    const z0 = sign * (PITCH_HALF_Z - boxD / 2);
    addLine(boxW, 0.07, 0, z0);
    addLine(0.07, boxD, -boxW / 2, sign * (PITCH_HALF_Z - boxD / 2));
    addLine(0.07, boxD, boxW / 2, sign * (PITCH_HALF_Z - boxD / 2));
    addLine(sixW, 0.07, 0, sign * (PITCH_HALF_Z - sixD / 2));
    addLine(0.07, sixD, -sixW / 2, sign * (PITCH_HALF_Z - sixD / 2));
    addLine(0.07, sixD, sixW / 2, sign * (PITCH_HALF_Z - sixD / 2));
    addRing(0.12, 0, sign * (PITCH_HALF_Z - 3.55));
  });

  const kickRing = new THREE.Mesh(
    new THREE.RingGeometry(2.1, 2.45, 40),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  kickRing.rotation.x = -Math.PI / 2;
  kickRing.position.set(0, lineY + 0.01, 0);
  kickRing.renderOrder = 3;
  kickRing.userData.kickoffRing = true;
  grp.add(kickRing);

  const poolMat = new THREE.MeshBasicMaterial({
    color: 0xfff6d0,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  [[-7, 0], [7, 0], [0, 0]].forEach(([x, z]) => {
    const pool = new THREE.Mesh(new THREE.CircleGeometry(x === 0 ? 5.2 : 4.4, 24), poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(x, PITCH_Y + 0.026, z);
    pool.renderOrder = 1;
    grp.add(pool);
  });

  return grp;
}

function buildCrowd(width, depth, height, homeSide, lite = false) {
  const seatGeo = new THREE.BoxGeometry(0.16, 0.32, 0.16);
  const cols = lite
    ? Math.min(14, Math.max(8, Math.floor(width / 0.65)))
    : Math.min(22, Math.max(10, Math.floor(width / 0.5)));
  const rows = lite ? 4 : 7;
  const count = lite ? Math.min(360, cols * rows) : Math.min(1100, cols * rows);
  const seats = new THREE.InstancedMesh(seatGeo, stdMat(0x94a3b8, { roughness: 0.7 }), count);
  const dummy = new THREE.Object3D();
  const pal = homeSide
    ? [0x15803d, 0x16a34a, 0x22c55e, 0x86efac, 0x14532d, 0xfacc15, 0x4ade80]
    : [0x1d4ed8, 0x2563eb, 0x3b82f6, 0x93c5fd, 0x1e3a8a, 0xf97316, 0x60a5fa];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (i >= count) break;
      dummy.position.set(
        (c - (cols - 1) / 2) * 0.48,
        0.55 + r * 0.42,
        depth / 2 - 0.28 - r * 0.32,
      );
      dummy.scale.set(1, 0.8 + ((c + r) % 4) * 0.1, 1);
      dummy.updateMatrix();
      seats.setMatrixAt(i, dummy.matrix);
      seats.setColorAt(i, new THREE.Color(pal[(c * 3 + r) % pal.length]));
      i += 1;
    }
  }
  seats.instanceMatrix.needsUpdate = true;
  if (seats.instanceColor) seats.instanceColor.needsUpdate = true;
  seats.castShadow = false;
  seats.receiveShadow = false;
  seats.frustumCulled = true;
  return seats;
}

function makeFanTex(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(16, 28, 32, 44);
  ctx.beginPath();
  ctx.arc(32, 22, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#f1d2b0';
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildFrontRowFans(width, homeSide, lite = false) {
  const grp = new THREE.Group();
  const colors = homeSide ? ['#22c55e', '#bbf7d0', '#166534'] : ['#3b82f6', '#93c5fd', '#1e3a8a'];
  const mats = colors.map((c) => new THREE.SpriteMaterial({
    map: makeFanTex(c),
    transparent: true,
    depthWrite: false,
  }));
  const longSide = width > 35;
  const n = lite ? (longSide ? 22 : 10) : (longSide ? 40 : 12);
  const rows = lite ? 2 : (longSide ? 4 : 2);
  const gap = Math.min(1.45, width / Math.max(n, 1));
  for (let row = 0; row < rows; row += 1) {
    for (let i = 0; i < n; i += 1) {
      const fan = new THREE.Sprite(mats[(i + row) % mats.length]);
      fan.scale.set(0.52, 0.8, 1);
      fan.position.set(
        (i - (n - 1) / 2) * gap,
        1.08 + row * 0.58,
        0.48 - row * 0.36,
      );
      fan.frustumCulled = true;
      grp.add(fan);
    }
  }
  return grp;
}

function buildStand(width, depth, height, x, z, rotY, homeSide, lite = false) {
  const g = new THREE.Group();
  g.userData.liteCrowd = lite;
  const concrete = stdMat(0x070b12, { roughness: 0.92 });
  const riser = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), concrete);
  riser.position.y = height / 2;
  riser.receiveShadow = true;
  g.add(riser);

  const fascia = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.98, 0.55, 0.12),
    stdMat(homeSide ? 0x166534 : 0x1e3a8a, { roughness: 0.45, emissive: homeSide ? 0x14532d : 0x1e3a8a, emi: 0.35 }),
  );
  fascia.position.set(0, height * 0.22, depth / 2 + 0.02);
  fascia.userData.crowdFascia = true;
  fascia.userData.homeSide = !!homeSide;
  g.add(fascia);

  g.add(buildCrowd(width, depth, height, homeSide, lite));
  g.add(buildFrontRowFans(width * 0.92, homeSide, lite));

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.8, 0.14, depth + 1.6),
    stdMat(0x0b1220, { roughness: 0.4, metalness: 0.35 }),
  );
  roof.position.set(0, height + 0.55, -0.15);
  roof.rotation.x = 0.18;
  g.add(roof);

  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
}

function buildFloodlight(x, z, lite = false) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 11, 8),
    stdMat(0xe2e8f0, { metalness: 0.55, roughness: 0.35 }),
  );
  pole.position.y = 5.5;
  pole.castShadow = !lite;
  g.add(pole);
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.4, 0.85),
    stdMat(0xfff7d6, { emissive: 0xfff1b8, emi: 1.35, roughness: 0.28 }),
  );
  head.position.set(0, 11, 0);
  g.add(head);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfff4d0,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 2.8, 11, 8, 1, true), beamMat);
  beam.position.set(0, 5.5, 0);
  beam.rotation.x = Math.PI / 2;
  beam.userData.footballLightBeam = true;
  g.add(beam);
  g.position.set(x, 0, z);
  return g;
}

function buildAdBoard(x, z, w, rotY, label, bg = '#14532d') {
  const g = new THREE.Group();
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.95, 0.14),
    stdMat(0x0f172a, { roughness: 0.55, emissive: 0x052e16, emi: 0.2 }),
  );
  board.position.y = 0.55;
  g.add(board);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 96);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const text = `${label}   ·   ${label}   ·   `;
  ctx.fillText(text, 24, 52);
  ctx.fillText(text, 512, 52);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.96, 0.78),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  face.position.set(0, 0.55, 0.08);
  face.userData.ledTex = tex;
  g.add(face);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
}

export function buildFootballStadium(scene, tier = 'medium', opts = {}) {
  const root = new THREE.Group();
  root.name = 'FootballStadium';
  const lite = opts.broadcastCamera || tier === 'low';

  const hx = PITCH_HALF_X;
  const hz = PITCH_HALF_Z;

  const stand = (w, d, h, x, z, rot, home) => buildStand(w, d, h, x, z, rot, home, lite);

  // Broadcast camera sits on +X — keep that sideline clear (no tall stand in the sight line).
  root.add(stand(hx * 2 + 4.5, 5.2, lite ? 5.2 : 6.8, 0, -hz - 4.8, 0, true));
  root.add(stand(hx * 2 + 4.5, 5.2, lite ? 5.2 : 6.8, 0, hz + 4.8, Math.PI, false));
  root.add(stand(hz * 2 + 2.2, lite ? 4.0 : 4.8, lite ? 5.2 : 6.4, -hx - 4.6, 0, Math.PI / 2, true));
  root.add(buildAdBoard(hx + 0.62, 0, hz * 1.55, -Math.PI / 2, 'FORGE FC  BYTEBUDDIES CUP', '#14532d'));

  [
    [-hx - 1.2, -hz - 1.2],
    [hx + 1.2, -hz - 1.2],
    [-hx - 1.2, hz + 1.2],
    [hx + 1.2, hz + 1.2],
  ].forEach(([x, z]) => root.add(buildFloodlight(x, z, lite)));

  const ads = [
    [0, -hz - 0.55, hx * 1.85, 0, 'FORGE FC  BYTEBUDDIES CUP  GREEN 3v3', '#052e16'],
    [0, hz + 0.55, hx * 1.85, Math.PI, 'FORGE FC  BYTEBUDDIES CUP  BLUE 3v3', '#0c4a6e'],
    [-hx - 0.55, 0, hz * 1.7, Math.PI / 2, 'GREEN FC', '#14532d'],
    [hx + 0.55, 0, hz * 1.7, -Math.PI / 2, 'BLUE UNITED', '#1e3a8a'],
  ];
  ads.forEach(([x, z, w, r, label, bg]) => root.add(buildAdBoard(x, z, w, r, label, bg)));

  const dugMat = stdMat(0x111827, { roughness: 0.7 });
  [-4.2, 4.2].forEach((z) => {
    const dug = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.05, 3.4), dugMat);
    dug.position.set(hx + 1.35, 0.52, z);
    root.add(dug);
  });

  const referee = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.12, 0.38, 4, 8),
    stdMat(0x111827, { roughness: 0.7 }),
  );
  referee.position.set(hx - 1.2, 0.38, 0);
  referee.castShadow = true;
  referee.userData.refereeDot = true;
  root.add(referee);

  scene.add(root);
  return root;
}

/** Low stands + ads for penalty/training — not a full FIFA bowl. */
export function buildPenaltyBackdrop(scene, mode = 'penalty') {
  const root = new THREE.Group();
  root.name = 'PenaltyBackdrop';
  const hz = PITCH_HALF_Z;
  const hx = PITCH_HALF_X;
  root.add(buildStand(hx * 1.15, 2.6, 3.2, 0, hz + 2.4, Math.PI, false));
  root.add(buildStand(hx * 1.15, 2.4, 2.8, 0, -hz - 2.2, 0, true));
  const label = mode === 'freekick' ? 'FREE KICK MASTER' : mode === 'match' ? '1v1 SKILLS MATCH' : 'PENALTY SHOOTOUT';
  root.add(buildAdBoard(0, hz + 0.55, hx * 1.4, Math.PI, `BYTEBUDDIES  ${label}`, '#0c4a6e'));
  root.add(buildAdBoard(0, -hz - 0.55, hx * 1.4, 0, 'AIM • POWER • SCORE', '#14532d'));
  scene.add(root);
  return root;
}

export function buildStreetBackdrop(scene) {
  const root = new THREE.Group();
  root.name = 'StreetBackdrop';
  const hz = PITCH_HALF_Z;
  const hx = PITCH_HALF_X;
  const wallMat = stdMat(0x374151, { roughness: 0.92 });
  [-1, 1].forEach((side) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(hx * 2.2, 3.2, 0.35), wallMat);
    wall.position.set(0, 1.6, side * (hz + 1.8));
    root.add(wall);
  });
  root.add(buildAdBoard(0, hz + 0.55, hx * 1.1, Math.PI, 'STREET FOOTBALL  CONCRETE CUP', '#64748b'));
  scene.add(root);
  return root;
}

export function buildTrainingBackdrop(scene) {
  const root = new THREE.Group();
  root.name = 'TrainingBackdrop';
  const hz = PITCH_HALF_Z;
  root.add(buildAdBoard(0, hz + 0.55, PITCH_HALF_X * 1.2, Math.PI, 'TRAINING GROUND  PRACTICE SHOTS', '#16a34a'));
  scene.add(root);
  return root;
}

export function buildArcadeBackdrop(scene) {
  const root = new THREE.Group();
  root.name = 'ArcadeBackdrop';
  const hz = PITCH_HALF_Z;
  const hx = PITCH_HALF_X;
  root.add(buildStand(hx * 0.9, 2.2, 2.4, 0, hz + 2, Math.PI, false));
  root.add(buildAdBoard(0, hz + 0.55, hx * 1.1, Math.PI, 'ARCADE RUSH  FIRST GOAL WINS', '#f472b6'));
  scene.add(root);
  return root;
}

export function buildKeeperBackdrop(scene) {
  const root = new THREE.Group();
  root.name = 'KeeperBackdrop';
  const hz = PITCH_HALF_Z;
  root.add(buildStand(PITCH_HALF_X * 0.85, 2.4, 2.6, 0, hz + 1.8, Math.PI, false));
  root.add(buildAdBoard(0, hz + 0.45, PITCH_HALF_X, Math.PI, 'GOALKEEPER HERO  CLEAN SHEET', '#facc15'));
  scene.add(root);
  return root;
}

export function buildTrainingCones() {
  const grp = new THREE.Group();
  grp.name = 'TrainingCones';
  const coneMat = stdMat(0xf97316, { emissive: 0xf97316, emi: 0.15 });
  const positions = [[-4, -3], [4, -3], [-5, 2], [5, 2], [0, 5]];
  positions.forEach(([x, z]) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 8), coneMat);
    cone.position.set(x, 0.16, z);
    grp.add(cone);
  });
  return grp;
}

export function buildDuskSky(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#7eb6e8');
  grad.addColorStop(0.42, '#f0b27a');
  grad.addColorStop(0.7, '#c96b4a');
  grad.addColorStop(1, '#2d4a38');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  scene.fog = new THREE.Fog(0xc96b4a, 70, 160);
}

export function buildNightSky(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#050a14');
  grad.addColorStop(0.28, '#0a1428');
  grad.addColorStop(0.55, '#0f2038');
  grad.addColorStop(1, '#0a2818');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  scene.fog = new THREE.Fog(0x0a1428, 65, 135);
}

export function applyFootballBloom(scene, tier = 'medium') {
  // Direct render — no bloom pass (keeps the pitch sharp on tablets).
  scene.userData.footballVisual = { bloom: 0, threshold: 1, radius: 0 };
  scene.userData.expMood = tier === 'low' ? 1.14 : 1.1;
}
