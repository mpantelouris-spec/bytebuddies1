/**
 * Parts Robot — robots children build themselves in the Robot Workshop: a body shape
 * stretched to any size, a head, a glowing screen face, arms, a way of moving, a paint
 * job and add-ons. Every part has the finish of the Studio robots (rounded panels,
 * seams, bolts, chrome joints, glowing lights), so a home-made robot sits happily next
 * to the pre-built ones. Returns a THREE.Group standing on y = 0, facing +z.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const PART_OPTIONS = {
  body: [
    { id: 'box', label: 'Boxy', icon: '🟦' }, { id: 'capsule', label: 'Capsule', icon: '💊' },
    { id: 'sphere', label: 'Round', icon: '🔵' }, { id: 'cylinder', label: 'Canister', icon: '🥫' },
    { id: 'wedge', label: 'Racer', icon: '🏎' }, { id: 'egg', label: 'Egg', icon: '🥚' },
    { id: 'hex', label: 'Hex', icon: '⬢' }, { id: 'tank', label: 'Armoured', icon: '🛡' },
  ],
  head: [
    { id: 'box', label: 'Box head', icon: '📦' }, { id: 'dome', label: 'Dome', icon: '🔮' },
    { id: 'screen', label: 'Screen', icon: '🖥' }, { id: 'round', label: 'Ball head', icon: '⚪' },
    { id: 'can', label: 'Tin can', icon: '🥫' }, { id: 'cat', label: 'Cat ears', icon: '🐱' },
    { id: 'bubble', label: 'Glass bubble', icon: '🫧' }, { id: 'none', label: 'No head', icon: '➖' },
  ],
  face: [
    { id: 'happy', label: 'Happy', icon: '😊' }, { id: 'round', label: 'Big eyes', icon: '👀' },
    { id: 'wink', label: 'Wink', icon: '😉' }, { id: 'cool', label: 'Visor', icon: '😎' },
    { id: 'angry', label: 'Determined', icon: '😠' }, { id: 'hearts', label: 'Hearts', icon: '😍' },
    { id: 'stars', label: 'Stars', icon: '🤩' }, { id: 'cyclops', label: 'One eye', icon: '👁' },
    { id: 'pixel', label: 'Pixel', icon: '👾' }, { id: 'sleepy', label: 'Sleepy', icon: '😴' },
  ],
  arms: [
    { id: 'claws', label: 'Claws', icon: '🦀' }, { id: 'hands', label: 'Hands', icon: '🖐' },
    { id: 'blasters', label: 'Blasters', icon: '🔫' }, { id: 'wings', label: 'Wings', icon: '🪽' },
    { id: 'noodle', label: 'Noodle arms', icon: '🍜' }, { id: 'drills', label: 'Drills', icon: '🔩' },
    { id: 'boxing', label: 'Boxing gloves', icon: '🥊' }, { id: 'none', label: 'No arms', icon: '➖' },
  ],
  move: [
    { id: 'wheels4', label: '4 wheels', icon: '🚙' }, { id: 'wheels6', label: '6 wheels', icon: '🛞' },
    { id: 'monster', label: 'Monster wheels', icon: '🛻' }, { id: 'tracks', label: 'Tracks', icon: '🚜' },
    { id: 'legs2', label: '2 legs', icon: '🦿' }, { id: 'legs4', label: '4 legs', icon: '🕷' },
    { id: 'hover', label: 'Hover', icon: '🛸' }, { id: 'propellers', label: 'Propellers', icon: '🚁' },
    { id: 'ball', label: 'Rolling ball', icon: '🎱' },
  ],
  pattern: [
    { id: 'plain', label: 'Plain', icon: '⬜' }, { id: 'stripes', label: 'Racing stripes', icon: '🏁' },
    { id: 'spots', label: 'Spots', icon: '🐞' }, { id: 'camo', label: 'Camo', icon: '🌿' },
    { id: 'flames', label: 'Flames', icon: '🔥' }, { id: 'checks', label: 'Checks', icon: '♟' },
    { id: 'stars', label: 'Stars', icon: '⭐' }, { id: 'carbon', label: 'Carbon', icon: '◼' },
  ],
};

export const DEFAULT_PARTS = {
  body: 'box', bodyW: 1, bodyH: 1, bodyL: 1, head: 'screen', headSize: 1, face: 'happy',
  arms: 'claws', move: 'wheels4', pattern: 'plain', finish: 'glossy',
};

/** Which Studio robot's game modes a parts robot plays, and how it moves in the lab. */
export function partsPlayAs(parts = {}) {
  const m = parts.move || 'wheels4';
  if (m === 'legs2') return { chassisId: 'droid', movementId: 'legs' };
  if (m === 'legs4') return { chassisId: 'spider', movementId: 'legs' };
  if (m === 'propellers') return { chassisId: 'drone', movementId: 'flying' };
  if (m === 'tracks') return { chassisId: 'rover', movementId: 'tracks' };
  if (m === 'wheels6') return { chassisId: 'rover', movementId: 'wheels6' };
  return { chassisId: 'rover', movementId: 'wheels' };
}

const FINISH = {
  matte: { rough: 0.8, metal: 0.05, coat: 0 },
  glossy: { rough: 0.32, metal: 0.12, coat: 0.85 },
  metal: { rough: 0.32, metal: 0.75, coat: 0.3 },
  chrome: { rough: 0.1, metal: 0.95, coat: 0.6 },
  neon: { rough: 0.35, metal: 0.2, coat: 0.6, glow: 0.35 },
};

/* ── Materials & textures ── */
function patternTexture(pattern, base, accent) {
  if (!pattern || pattern === 'plain' || typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, 512, 512);
  x.fillStyle = accent; x.strokeStyle = accent;
  const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  if (pattern === 'stripes') { x.fillRect(196, 0, 44, 512); x.fillRect(272, 0, 44, 512); }
  if (pattern === 'spots') for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(rnd() * 512, rnd() * 512, 16 + rnd() * 22, 0, Math.PI * 2); x.fill(); }
  if (pattern === 'camo') {
    const tones = [accent, shade(base, -0.25), shade(accent, 0.25)];
    for (let i = 0; i < 60; i++) { x.fillStyle = tones[i % 3]; x.beginPath(); const cx = rnd() * 512, cy = rnd() * 512; x.ellipse(cx, cy, 20 + rnd() * 40, 14 + rnd() * 26, rnd() * 3, 0, Math.PI * 2); x.fill(); }
  }
  if (pattern === 'flames') {
    const g = x.createLinearGradient(0, 512, 0, 180);
    g.addColorStop(0, '#ef4444'); g.addColorStop(0.5, '#f97316'); g.addColorStop(1, '#facc15');
    x.fillStyle = g;
    x.beginPath(); x.moveTo(0, 512);
    for (let i = 0; i <= 16; i++) { const px = i * 32; x.quadraticCurveTo(px + 8, 330 - (i % 2) * 110 - rnd() * 60, px + 32, 512 - (i % 2 ? 140 : 40)); }
    x.lineTo(512, 512); x.closePath(); x.fill();
  }
  if (pattern === 'checks') for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) x.fillRect(i * 64, j * 64, 64, 64);
  if (pattern === 'stars') {
    for (let i = 0; i < 18; i++) {
      const cx = rnd() * 512, cy = rnd() * 512, r = 14 + rnd() * 14;
      x.beginPath();
      for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2; const rr = k % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      x.fill();
    }
  }
  if (pattern === 'carbon') {
    x.fillStyle = '#1f2937'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 64; i++) for (let j = 0; j < 64; j++) { x.fillStyle = (i + j) % 2 ? '#374151' : '#111827'; x.fillRect(i * 8, j * 8, 8, 4); x.fillRect(i * 8 + ((i + j) % 2) * 4, j * 8 + 4, 4, 4); }
    x.fillStyle = accent; x.fillRect(0, 236, 512, 40);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function shade(hex, k) {
  const c = new THREE.Color(hex);
  return `#${(k < 0 ? c.lerp(new THREE.Color(0x000000), -k) : c.lerp(new THREE.Color(0xffffff), k)).getHexString()}`;
}

/** A soft studio sky for reflections, so chrome and metal paint shine instead of going black. */
let _env = null;
function envTex() {
  if (_env || typeof document === 'undefined') return _env;
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0, '#9fc3f7'); sky.addColorStop(0.4, '#e6eeff'); sky.addColorStop(0.5, '#ffffff'); sky.addColorStop(0.62, '#c9d3e6'); sky.addColorStop(1, '#5b6478');
  g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
  g.fillStyle = 'rgba(255,255,255,0.7)';
  [[60, 30], [200, 40], [340, 28], [450, 44]].forEach(([x, y]) => g.fillRect(x, y, 70, 14));
  _env = new THREE.CanvasTexture(c);
  _env.mapping = THREE.EquirectangularReflectionMapping;
  _env.colorSpace = THREE.SRGBColorSpace;
  return _env;
}

function kit(colors, parts) {
  const f = FINISH[parts.finish] || FINISH.glossy;
  const tex = patternTexture(parts.pattern, colors.primary, colors.accent);
  const body = new THREE.MeshPhysicalMaterial({
    color: tex ? 0xffffff : colors.primary, map: tex || null, roughness: f.rough, metalness: f.metal,
    clearcoat: f.coat, clearcoatRoughness: 0.18,
    ...(f.glow ? { emissive: colors.primary, emissiveIntensity: f.glow } : {}),
  });
  const plain = new THREE.MeshPhysicalMaterial({ color: colors.primary, roughness: f.rough, metalness: f.metal, clearcoat: f.coat, clearcoatRoughness: 0.18, ...(f.glow ? { emissive: colors.primary, emissiveIntensity: f.glow } : {}) });
  const accent = new THREE.MeshPhysicalMaterial({ color: colors.accent, roughness: 0.3, metalness: 0.3, clearcoat: 0.6 });
  const joint = new THREE.MeshStandardMaterial({ color: 0x2b3240, roughness: 0.42, metalness: 0.75 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdfe5ee, roughness: 0.14, metalness: 1 });
  const rubber = new THREE.MeshStandardMaterial({ color: colors.wheel || 0x1a1d24, roughness: 0.9, metalness: 0.05 });
  const seam = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.3 });
  const glow = new THREE.MeshStandardMaterial({ color: colors.led, emissive: colors.led, emissiveIntensity: 1.6, roughness: 0.3 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xdbeafe, roughness: 0.05, metalness: 0, transmission: 0.85, transparent: true, opacity: 0.45, thickness: 0.2 });
  const env = envTex();
  if (env) [body, plain, accent, joint, chrome, glass].forEach((m) => { m.envMap = env; m.envMapIntensity = m === chrome ? 1.1 : 0.7; });
  return { body, plain, accent, joint, chrome, rubber, seam, glow, glass };
}

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.skipStudioPaint = true; // the parts robot paints itself
  return m;
}
const rotX = (m, a = Math.PI / 2) => { m.rotation.x = a; return m; };
const rbox = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2.2, h / 2.2, d / 2.2));

/* ── Faces: a glowing drawing on a dark glass screen ── */
export function faceTexture(face, led) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 160;
  const x = c.getContext('2d');
  x.fillStyle = '#060b18'; x.fillRect(0, 0, 256, 160);
  x.fillStyle = led; x.strokeStyle = led;
  x.shadowColor = led; x.shadowBlur = 14;
  x.lineCap = 'round'; x.lineJoin = 'round';
  const eye = (cx, cy, r) => { x.beginPath(); x.ellipse(cx, cy, r, r * 1.18, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#ffffff'; x.shadowBlur = 0; x.beginPath(); x.arc(cx + r * 0.32, cy - r * 0.38, r * 0.3, 0, Math.PI * 2); x.fill(); x.fillStyle = led; x.shadowBlur = 14; };
  const arc = (cx, cy, r, up = true) => { x.lineWidth = 11; x.beginPath(); x.arc(cx, cy, r, up ? Math.PI * 1.1 : Math.PI * 0.1, up ? Math.PI * 1.9 : Math.PI * 0.9); x.stroke(); };
  const smile = (w = 34, y = 118) => { x.lineWidth = 9; x.beginPath(); x.arc(128, y - 22, w, Math.PI * 0.2, Math.PI * 0.8); x.stroke(); };
  const star = (cx, cy, r) => { x.beginPath(); for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2; const rr = k % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); };
  const heart = (cx, cy, s) => { x.beginPath(); x.moveTo(cx, cy + s); x.bezierCurveTo(cx - s * 1.7, cy - s * 0.2, cx - s * 0.8, cy - s * 1.4, cx, cy - s * 0.5); x.bezierCurveTo(cx + s * 0.8, cy - s * 1.4, cx + s * 1.7, cy - s * 0.2, cx, cy + s); x.fill(); };
  switch (face) {
    case 'round': eye(84, 70, 24); eye(172, 70, 24); smile(28); break;
    case 'wink': eye(84, 70, 22); arc(172, 82, 22); smile(30); break;
    case 'cool': x.fillRect(40, 52, 176, 34); x.fillStyle = '#ffffff'; x.shadowBlur = 0; x.fillRect(56, 58, 40, 8); x.fillStyle = led; x.shadowBlur = 14; smile(24, 126); break;
    case 'angry': eye(84, 78, 18); eye(172, 78, 18); x.lineWidth = 10; x.beginPath(); x.moveTo(58, 40); x.lineTo(106, 56); x.moveTo(198, 40); x.lineTo(150, 56); x.stroke(); x.beginPath(); x.moveTo(104, 128); x.lineTo(152, 128); x.stroke(); break;
    case 'hearts': heart(84, 70, 24); heart(172, 70, 24); smile(28); break;
    case 'stars': star(84, 70, 28); star(172, 70, 28); smile(30); break;
    case 'cyclops': eye(128, 72, 34); smile(30, 130); break;
    case 'pixel': [[64, 48], [80, 48], [64, 64], [80, 64], [160, 48], [176, 48], [160, 64], [176, 64], [80, 112], [96, 120], [112, 120], [128, 120], [144, 120], [160, 112]].forEach(([px, py]) => x.fillRect(px, py, 14, 14)); break;
    case 'sleepy': x.lineWidth = 10; x.beginPath(); x.moveTo(60, 76); x.lineTo(108, 76); x.moveTo(148, 76); x.lineTo(196, 76); x.stroke(); x.beginPath(); x.ellipse(128, 120, 12, 9, 0, 0, Math.PI * 2); x.fill(); x.font = 'bold 26px Arial'; x.fillText('z', 206, 40); break;
    default: arc(84, 82, 22); arc(172, 82, 22); smile(36); // happy
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function faceScreen(w, h, face, led, K) {
  const g = new THREE.Group();
  const frame = mesh(rbox(w * 1.08, h * 1.12, 0.06, 0.04), K.joint, 0, 0, -0.012);
  const tex = faceTexture(face, led);
  const screen = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.1, roughness: 0.2 }), 0, 0, 0.022);
  screen.castShadow = false;
  // A glassy shine across the top
  const shine = mesh(new THREE.PlaneGeometry(w * 0.9, h * 0.22), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false }), 0, h * 0.3, 0.026);
  shine.castShadow = false;
  g.add(frame, screen, shine);
  return g;
}

/* ── Movement: returns where the body sits ── */
function wheel(r, w, K, spokes = 5) {
  const g = new THREE.Group();
  const tyre = mesh(new THREE.CylinderGeometry(r, r, w, 28), K.rubber); tyre.rotation.z = Math.PI / 2; g.add(tyre);
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const tread = mesh(new THREE.BoxGeometry(w * 1.02, r * 0.12, r * 0.18), K.rubber, 0, Math.cos(a) * r, Math.sin(a) * r); tread.rotation.x = -a; g.add(tread); }
  [-1, 1].forEach((sd) => {
    const rim = mesh(new THREE.CylinderGeometry(r * 0.62, r * 0.62, 0.02, 24), K.chrome, sd * (w / 2 + 0.005), 0, 0); rim.rotation.z = Math.PI / 2; g.add(rim);
    const hub = mesh(new THREE.CylinderGeometry(r * 0.22, r * 0.22, 0.04, 16), K.accent, sd * (w / 2 + 0.02), 0, 0); hub.rotation.z = Math.PI / 2; g.add(hub);
    for (let i = 0; i < spokes; i++) { const a = (i / spokes) * Math.PI * 2; const sp = mesh(new THREE.BoxGeometry(0.025, r * 0.42, r * 0.08), K.accent, sd * (w / 2 + 0.015), Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.38); sp.rotation.x = -a; g.add(sp); }
  });
  g.traverse((o) => { if (o.isMesh) o.userData.isWheel = true; });
  g.userData.spinWheel = true;
  return g;
}

function buildMove(root, move, W, L, K, anim) {
  const add = (o) => { root.add(o); return o; };
  if (move === 'wheels4' || move === 'wheels6' || move === 'monster') {
    const big = move === 'monster';
    const r = big ? 0.4 : move === 'wheels6' ? 0.21 : 0.25;
    const zs = move === 'wheels6' ? [-L * 0.36, 0, L * 0.36] : [-L * 0.33, L * 0.33];
    zs.forEach((z) => [-1, 1].forEach((s) => {
      const wh = add(wheel(r, big ? 0.3 : 0.18, K, big ? 6 : 5));
      wh.position.set(s * (W / 2 + (big ? 0.17 : 0.1)), r, z);
      anim.wheels.push(wh);
      if (big) { const strut = add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 10), K.chrome, s * (W / 2 - 0.02), r + 0.12, z)); strut.rotation.z = s * 0.9; }
      const axle = add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 10), K.joint, s * (W / 2 + 0.02), r, z)); axle.rotation.z = Math.PI / 2;
    }));
    return big ? 0.55 : r + 0.06;
  }
  if (move === 'tracks') {
    [-1, 1].forEach((s) => {
      const g = add(new THREE.Group());
      g.position.set(s * (W / 2 + 0.13), 0.21, 0);
      g.add(mesh(rbox(0.24, 0.4, L * 1.08, 0.17), K.rubber));
      for (let i = 0; i < 9; i++) g.add(mesh(new THREE.BoxGeometry(0.26, 0.03, 0.06), K.joint, 0, 0.205, -L * 0.48 + (i * L * 0.96) / 8));
      [-1, 0, 1].forEach((k) => { const wh = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.26, 20), K.chrome, 0, 0, k * L * 0.34); wh.rotation.z = Math.PI / 2; g.add(wh); const hub = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.27, 12), K.accent, 0, 0, k * L * 0.34); hub.rotation.z = Math.PI / 2; g.add(hub); });
    });
    return 0.36;
  }
  if (move === 'legs2') {
    const legs = [];
    [-1, 1].forEach((s) => {
      const hip = add(new THREE.Group());
      hip.position.set(s * W * 0.24, 0.86, 0);
      hip.add(mesh(new THREE.SphereGeometry(0.09, 16, 12), K.joint));
      hip.add(mesh(new THREE.CapsuleGeometry(0.075, 0.26, 6, 12), K.plain, 0, -0.2, 0));
      const knee = new THREE.Group(); knee.position.y = -0.4; hip.add(knee);
      knee.add(mesh(new THREE.SphereGeometry(0.075, 14, 10), K.chrome));
      knee.add(mesh(new THREE.CapsuleGeometry(0.065, 0.24, 6, 12), K.joint, 0, -0.17, 0));
      knee.add(mesh(rbox(0.2, 0.08, 0.3, 0.035), K.accent, 0, -0.37, 0.04));
      legs.push({ hip, knee, s });
    });
    anim.legs2 = legs;
    return 0.9;
  }
  if (move === 'legs4') {
    const legs = [];
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
      const hip = add(new THREE.Group());
      hip.position.set(sx * W * 0.42, 0.55, sz * L * 0.3);
      hip.rotation.y = Math.atan2(sx, sz) - Math.PI / 2;
      hip.add(mesh(new THREE.SphereGeometry(0.08, 14, 10), K.joint));
      const upper = mesh(new THREE.CapsuleGeometry(0.05, 0.36, 6, 10), K.plain, 0.18, 0.08, 0); upper.rotation.z = -1.05; hip.add(upper);
      const knee = mesh(new THREE.SphereGeometry(0.06, 12, 10), K.chrome, 0.36, 0.2, 0); hip.add(knee);
      const lower = mesh(new THREE.CapsuleGeometry(0.04, 0.5, 6, 10), K.joint, 0.48, -0.12, 0); lower.rotation.z = 0.42; hip.add(lower);
      hip.add(mesh(new THREE.SphereGeometry(0.055, 10, 8), K.accent, 0.58, -0.5, 0));
      legs.push({ hip, i });
    });
    anim.legs4 = legs;
    return 0.48;
  }
  if (move === 'hover') {
    const skirt = add(mesh(new THREE.CylinderGeometry(W * 0.62, W * 0.72, 0.16, 36), K.joint, 0, 0.32, 0));
    skirt.scale.z = Math.max(0.7, L / W);
    const ring = add(mesh(new THREE.TorusGeometry(W * 0.66, 0.035, 10, 48), K.glow, 0, 0.24, 0));
    ring.rotation.x = Math.PI / 2; ring.scale.y = Math.max(0.7, L / W);
    const thrust = add(mesh(new THREE.CylinderGeometry(W * 0.5, W * 0.2, 0.22, 28, 1, true), new THREE.MeshBasicMaterial({ color: K.glow.color, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }), 0, 0.12, 0));
    thrust.castShadow = false;
    anim.hover = true;
    return 0.42;
  }
  if (move === 'propellers') {
    const rotors = [];
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const arm = add(mesh(new THREE.BoxGeometry(0.06, 0.05, 0.62), K.joint, sx * W * 0.5, 0.62, sz * L * 0.42));
      arm.rotation.y = Math.atan2(sx, sz);
      const px = sx * (W * 0.5 + 0.28), pz = sz * (L * 0.42 + 0.28);
      add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 14), K.chrome, px, 0.68, pz));
      const guard = add(mesh(new THREE.TorusGeometry(0.3, 0.022, 8, 36), K.accent, px, 0.7, pz)); guard.rotation.x = Math.PI / 2;
      const blades = add(new THREE.Group()); blades.position.set(px, 0.76, pz);
      [0, Math.PI / 2].forEach((r) => { const b = mesh(new THREE.BoxGeometry(0.54, 0.012, 0.07), K.plain); b.rotation.y = r; blades.add(b); });
      rotors.push(blades);
    });
    [-1, 1].forEach((s) => {
      add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), K.joint, s * W * 0.3, 0.15, 0));
      const skid = add(mesh(new THREE.CapsuleGeometry(0.03, L * 0.8, 4, 8), K.chrome, s * W * 0.3, 0.02, 0)); skid.rotation.x = Math.PI / 2;
    });
    anim.rotors = rotors;
    return 0.3;
  }
  // ball
  const ball = add(mesh(new THREE.SphereGeometry(0.4, 36, 24), K.body, 0, 0.4, 0));
  [0, Math.PI / 2].forEach((r) => { const band = add(mesh(new THREE.TorusGeometry(0.401, 0.03, 8, 40), K.accent, 0, 0.4, 0)); band.rotation.y = r; anim.wheels.push(band); });
  anim.wheels.push(ball);
  ball.userData.spinWheel = true;
  return 0.78;
}

/* ── Body shapes ── */
function buildBody(root, shape, W, H, L, base, K) {
  const y = base + H / 2;
  let b;
  if (shape === 'capsule') { b = mesh(new THREE.CapsuleGeometry(Math.min(W, L) / 2, Math.max(0.05, H - Math.min(W, L)), 10, 28), K.body, 0, y, 0); b.scale.set(1, 1, L / Math.min(W, L) > 1.2 ? 1.15 : 1); }
  else if (shape === 'sphere') { b = mesh(new THREE.SphereGeometry(0.5, 40, 28), K.body, 0, y, 0); b.scale.set(W, H, L); }
  else if (shape === 'cylinder') {
    b = mesh(new THREE.CylinderGeometry(W / 2, W / 2, H, 40), K.body, 0, y, 0); b.scale.z = L / W;
    root.add(rotX(mesh(new THREE.TorusGeometry(W / 2, 0.03, 8, 40), K.chrome, 0, base + H - 0.02, 0)));
    root.add(rotX(mesh(new THREE.TorusGeometry(W / 2, 0.03, 8, 40), K.chrome, 0, base + 0.02, 0)));
  } else if (shape === 'hex') { b = mesh(new THREE.CylinderGeometry(W / 1.9, W / 1.8, H, 6), K.body, 0, y, 0); b.rotation.y = Math.PI / 6; b.scale.z = L / W; }
  else if (shape === 'egg') {
    const pts = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; const a = t * Math.PI; pts.push(new THREE.Vector2(Math.sin(a) * 0.5 * (1 - 0.18 * t), -Math.cos(a) * 0.5)); }
    b = mesh(new THREE.LatheGeometry(pts, 40), K.body, 0, y, 0); b.scale.set(W, H, L);
  } else if (shape === 'wedge') {
    const s = new THREE.Shape();
    s.moveTo(-L / 2, 0); s.lineTo(L / 2, 0); s.lineTo(L / 2, H * 0.45); s.lineTo(L * 0.05, H); s.lineTo(-L / 2, H); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 });
    geo.translate(0, 0, -W / 2);
    b = mesh(geo, K.body, 0, base, 0); b.rotation.y = -Math.PI / 2;
    const screen = mesh(new THREE.PlaneGeometry(W * 0.7, H * 0.5), K.glass, 0, base + H * 0.78, L * 0.24); screen.rotation.x = -0.95; root.add(screen);
  } else if (shape === 'tank') {
    b = mesh(rbox(W, H * 0.75, L, 0.06), K.body, 0, base + H * 0.375, 0);
    const turret = mesh(rbox(W * 0.62, H * 0.32, L * 0.55, 0.08), K.body, 0, base + H * 0.9, -L * 0.05); root.add(turret);
    const plate = mesh(new THREE.BoxGeometry(W * 0.98, 0.05, L * 0.3), K.accent, 0, base + H * 0.6, L * 0.48); plate.rotation.x = -0.6; root.add(plate);
  } else { b = mesh(rbox(W, H, L, 0.12), K.body, 0, y, 0); }
  root.add(b);

  // Details every body gets: a waist seam, a chest panel with lights, bolts and side vents
  const frontZ = shape === 'sphere' || shape === 'egg' ? L * 0.48 : shape === 'cylinder' || shape === 'hex' ? L / 2 : L / 2;
  if (shape !== 'wedge') {
    const seamH = base + H * 0.32;
    const seam = mesh(shape === 'box' || shape === 'tank' ? new THREE.BoxGeometry(W * 1.005, 0.025, L * 1.005) : new THREE.CylinderGeometry(W * 0.5, W * 0.5, 0.025, 40), K.seam, 0, seamH, 0);
    if (!(shape === 'box' || shape === 'tank')) seam.scale.z = L / W;
    if (shape === 'sphere' || shape === 'egg') seam.scale.set(0.98, 1, (L / W) * 0.98);
    root.add(seam);
    const panel = new THREE.Group();
    panel.position.set(0, base + H * 0.55, frontZ - 0.005);
    panel.add(mesh(rbox(W * 0.42, H * 0.3, 0.04, 0.03), K.accent));
    [-1, 0, 1].forEach((k) => panel.add(mesh(new THREE.CircleGeometry(0.03, 14), K.glow, k * W * 0.11, 0, 0.025)));
    root.add(panel);
    if (shape === 'box' || shape === 'tank' || shape === 'hex') {
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sy]) => root.add(mesh(new THREE.SphereGeometry(0.022, 8, 6), K.chrome, sx * W * 0.42, base + H * (sy > 0 ? 0.88 : 0.12), frontZ + 0.005)));
    }
    [-1, 1].forEach((s) => { for (let i = 0; i < 3; i++) root.add(mesh(new THREE.BoxGeometry(0.02, 0.025, L * 0.32), K.seam, s * (W / 2 + 0.002) * (shape === 'sphere' || shape === 'egg' ? 0.9 : 1), base + H * (0.5 + i * 0.09), 0)); });
  }
  let top = base + H;
  if (shape === 'tank') top = base + H * 1.06;
  if (shape === 'wedge') top = base + H;
  return { top, frontZ };
}

/* ── Heads ── */
function buildHead(root, head, size, face, bodyTop, frontZ, W, L, H, base, colors, K) {
  const s = size;
  if (head === 'none') {
    const fw = Math.min(W * 0.62, 0.5), fh = fw * 0.6;
    const scr = faceScreen(fw, fh, face, colors.led, K);
    scr.position.set(0, base + H * 0.8, frontZ + 0.02);
    root.add(scr);
    return bodyTop;
  }
  const neck = mesh(new THREE.CylinderGeometry(0.08 * s, 0.1 * s, 0.1, 16), K.joint, 0, bodyTop + 0.04, 0);
  root.add(neck);
  const y0 = bodyTop + 0.08;
  let hw = 0.56 * s, hh = 0.44 * s, hd = 0.46 * s, faceZ = 0, faceY = 0, top = 0;
  const g = new THREE.Group();
  if (head === 'box') { g.add(mesh(rbox(hw, hh, hd, 0.07), K.plain, 0, hh / 2, 0)); faceZ = hd / 2; faceY = hh * 0.5; top = hh; }
  else if (head === 'dome') { g.add(mesh(new THREE.SphereGeometry(hw / 2, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2), K.plain, 0, 0.02, 0)); g.add(rotX(mesh(new THREE.TorusGeometry(hw / 2, 0.025, 8, 36), K.chrome, 0, 0.03, 0))); faceZ = hw * 0.43; faceY = hw * 0.2; top = hw / 2; }
  else if (head === 'screen') { hw = 0.7 * s; hh = 0.48 * s; hd = 0.3 * s; g.add(mesh(rbox(hw, hh, hd, 0.09), K.plain, 0, hh / 2, 0)); [-1, 1].forEach((k) => { const ear = mesh(new THREE.CylinderGeometry(0.07 * s, 0.07 * s, 0.06, 18), K.accent, k * (hw / 2 + 0.02), hh / 2, 0); ear.rotation.z = Math.PI / 2; g.add(ear); }); faceZ = hd / 2; faceY = hh / 2; top = hh; }
  else if (head === 'round') { g.add(mesh(new THREE.SphereGeometry(hw / 2, 32, 24), K.plain, 0, hw / 2, 0)); faceZ = hw * 0.42; faceY = hw / 2; top = hw; }
  else if (head === 'can') { g.add(mesh(new THREE.CylinderGeometry(hw / 2.2, hw / 2.2, hh * 1.1, 32), K.chrome, 0, hh * 0.55, 0)); g.add(rotX(mesh(new THREE.TorusGeometry(hw / 2.2, 0.02, 8, 32), K.accent, 0, hh * 1.1, 0))); [-1, 1].forEach((k) => { const bolt = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 14), K.accent, k * (hw / 2.2 + 0.03), hh * 0.55, 0); bolt.rotation.z = Math.PI / 2; g.add(bolt); }); faceZ = hw / 2.2; faceY = hh * 0.6; top = hh * 1.1; }
  else if (head === 'cat') { g.add(mesh(new THREE.SphereGeometry(hw / 2, 32, 24), K.plain, 0, hw / 2, 0)); [-1, 1].forEach((k) => { const ear = mesh(new THREE.ConeGeometry(0.11 * s, 0.22 * s, 4), K.plain, k * hw * 0.3, hw * 0.98, 0); ear.rotation.z = k * -0.35; g.add(ear); const inner = mesh(new THREE.ConeGeometry(0.06 * s, 0.13 * s, 4), K.accent, k * hw * 0.3, hw * 0.96, 0.03); inner.rotation.z = k * -0.35; g.add(inner); }); faceZ = hw * 0.42; faceY = hw / 2; top = hw * 1.05; }
  else if (head === 'bubble') {
    g.add(mesh(new THREE.CylinderGeometry(hw * 0.5, hw * 0.55, 0.08, 32), K.chrome, 0, 0.04, 0));
    const brain = mesh(new THREE.SphereGeometry(hw * 0.22, 20, 14), K.glow, 0, hw * 0.36, 0); g.add(brain);
    g.add(mesh(new THREE.SphereGeometry(hw * 0.48, 32, 20, 0, Math.PI * 2, 0, Math.PI / 1.7), K.glass, 0, 0.06, 0));
    top = hw * 0.52;
    const scr = faceScreen(Math.min(W * 0.55, 0.46), Math.min(W * 0.55, 0.46) * 0.6, face, colors.led, K);
    scr.position.set(0, base + H * 0.78, frontZ + 0.02);
    root.add(scr);
    g.position.y = y0; root.add(g);
    return y0 + top;
  }
  const fw = (head === 'screen' ? hw * 0.82 : hw * 0.7), fh = (head === 'screen' ? hh * 0.72 : hw * 0.42);
  const scr = faceScreen(fw, fh, face, colors.led, K);
  scr.position.set(0, faceY, faceZ + 0.005);
  if (head === 'round' || head === 'cat') { scr.scale.setScalar(0.92); scr.position.z = faceZ - 0.01; }
  if (head === 'dome') scr.position.y = faceY;
  g.add(scr);
  g.position.y = y0;
  root.add(g);
  return y0 + top;
}

/* ── Arms ── */
function buildArms(root, arms, W, H, base, shape, K, colors) {
  if (arms === 'none') return;
  const sy = base + H * 0.62;
  const sx = W / 2 + (shape === 'sphere' || shape === 'egg' ? -0.02 : 0.02);
  [-1, 1].forEach((s) => {
    const sh = new THREE.Group();
    sh.position.set(s * sx, sy, 0);
    root.add(sh);
    sh.add(mesh(new THREE.SphereGeometry(0.085, 16, 12), K.joint));
    if (arms === 'wings') {
      const w = new THREE.Shape(); w.moveTo(0, 0); w.quadraticCurveTo(0.5, 0.35, 0.75, 0.1); w.quadraticCurveTo(0.45, -0.05, 0.42, -0.2); w.quadraticCurveTo(0.2, -0.05, 0, -0.08);
      const g = mesh(new THREE.ExtrudeGeometry(w, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 }), K.accent);
      g.scale.x = s; g.position.set(0, 0.02, -0.12); g.rotation.y = s * 0.15; sh.add(g);
      return;
    }
    if (arms === 'noodle') {
      const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(s * 0.2, 0.08, 0.05), new THREE.Vector3(s * 0.24, -0.15, 0.15), new THREE.Vector3(s * 0.36, -0.05, 0.28)]);
      sh.add(mesh(new THREE.TubeGeometry(c, 24, 0.035, 10), K.accent));
      sh.add(mesh(new THREE.SphereGeometry(0.06, 12, 10), K.glow, s * 0.36, -0.05, 0.28));
      return;
    }
    const upper = mesh(new THREE.CapsuleGeometry(0.055, 0.18, 6, 12), K.plain, s * 0.1, -0.12, 0); upper.rotation.z = s * 0.5; sh.add(upper);
    const elbow = new THREE.Group(); elbow.position.set(s * 0.18, -0.24, 0.02); sh.add(elbow);
    elbow.add(mesh(new THREE.SphereGeometry(0.06, 14, 10), K.chrome));
    const fore = mesh(new THREE.CapsuleGeometry(0.05, 0.16, 6, 12), K.joint, 0, -0.02, 0.13); fore.rotation.x = Math.PI / 2; elbow.add(fore);
    const tip = new THREE.Group(); tip.position.set(0, -0.02, 0.27); elbow.add(tip);
    if (arms === 'claws') {
      [-1, 1].forEach((k) => { const f = mesh(new THREE.BoxGeometry(0.03, 0.05, 0.15), K.accent, k * 0.045, 0, 0.06); f.rotation.y = k * 0.38; tip.add(f); const t = mesh(new THREE.ConeGeometry(0.025, 0.06, 8), K.chrome, k * 0.075, 0, 0.14); t.rotation.x = Math.PI / 2; tip.add(t); });
    } else if (arms === 'hands') {
      tip.add(mesh(new THREE.SphereGeometry(0.07, 14, 10), K.accent));
      for (let i = 0; i < 3; i++) { const f = mesh(new THREE.CapsuleGeometry(0.018, 0.06, 4, 8), K.accent, -0.035 + i * 0.035, 0, 0.08); f.rotation.x = Math.PI / 2; tip.add(f); }
      const th = mesh(new THREE.CapsuleGeometry(0.018, 0.05, 4, 8), K.accent, s * 0.06, 0, 0.04); th.rotation.z = Math.PI / 2; tip.add(th);
    } else if (arms === 'blasters') {
      const barrel = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.24, 16), K.chrome, 0, 0, 0.1); barrel.rotation.x = Math.PI / 2; tip.add(barrel);
      [0.04, 0.12].forEach((z) => { const r = mesh(new THREE.TorusGeometry(0.068, 0.012, 6, 16), K.accent, 0, 0, z); tip.add(r); });
      tip.add(mesh(new THREE.CircleGeometry(0.045, 16), K.glow, 0, 0, 0.225));
    } else if (arms === 'drills') {
      const d = mesh(new THREE.ConeGeometry(0.07, 0.24, 16), K.chrome, 0, 0, 0.12); d.rotation.x = Math.PI / 2; tip.add(d);
      for (let i = 0; i < 4; i++) { const r = mesh(new THREE.TorusGeometry(0.06 - i * 0.013, 0.009, 6, 16), K.accent, 0, 0, 0.04 + i * 0.05); tip.add(r); }
      tip.userData.spin = 12;
    } else if (arms === 'boxing') {
      const glove = mesh(new THREE.SphereGeometry(0.11, 20, 14), new THREE.MeshPhysicalMaterial({ color: colors.accent === '#ef4444' ? 0x2563eb : 0xdc2626, roughness: 0.35, clearcoat: 0.8 }), 0, 0, 0.05); glove.scale.set(1, 0.9, 1.15); tip.add(glove);
      tip.add(rotX(mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), 0, 0, -0.06)));
    }
  });
}

/**
 * Build a parts robot. `colors`: { primary, accent, led, wheel }.
 * The group has userData.animate(t, dt) for legs, rotors, wheels and hovering.
 */
export function buildPartsRobot(parts = {}, colors = {}) {
  const p = { ...DEFAULT_PARTS, ...parts };
  const c = { primary: colors.primary || '#6366f1', accent: colors.accent || '#facc15', led: colors.led || '#5eead4', wheel: colors.wheel || '#1a1d24' };
  const K = kit(c, p);
  const W = 0.95 * Math.max(0.6, Math.min(1.5, p.bodyW || 1));
  const H = 0.72 * Math.max(0.6, Math.min(1.6, p.bodyH || 1));
  const L = 0.9 * Math.max(0.6, Math.min(1.6, p.bodyL || 1));
  const root = new THREE.Group();
  root.name = 'PartsRobot';
  const anim = { wheels: [] };
  const base = buildMove(root, p.move, W, L, K, anim);
  const body = new THREE.Group();
  root.add(body);
  const { top, frontZ } = buildBody(body, p.body, W, H, L, base, K);
  buildHead(body, p.head, Math.max(0.6, Math.min(1.5, p.headSize || 1)), p.face, top, frontZ, W, L, H, base, c, K);
  buildArms(body, p.arms, W, H, base, p.body, K, c);
  const drills = [];
  body.traverse((o) => { if (o.userData.spin) drills.push(o); });
  root.userData.partsBodyGroup = body;
  root.userData.animate = (t = 0, dt = 0.016) => {
    if (anim.legs2) anim.legs2.forEach(({ hip, knee, s }) => { const a = Math.sin(t * 3.2 + (s > 0 ? Math.PI : 0)) * 0.22; hip.rotation.x = a; knee.rotation.x = Math.max(0, -a) * 0.9; });
    if (anim.legs4) anim.legs4.forEach(({ hip, i }) => { hip.rotation.z = Math.sin(t * 4 + i * 1.6) * 0.12; });
    if (anim.rotors) anim.rotors.forEach((r, i) => { r.rotation.y += (i % 2 ? -1 : 1) * 22 * dt; });
    if (anim.hover) body.position.y = Math.sin(t * 2.4) * 0.04;
    if (anim.legs2) body.position.y = Math.abs(Math.sin(t * 3.2)) * 0.02;
    drills.forEach((d) => { d.rotation.z += d.userData.spin * dt; });
  };
  root.userData.partsRobot = true;
  return root;
}
