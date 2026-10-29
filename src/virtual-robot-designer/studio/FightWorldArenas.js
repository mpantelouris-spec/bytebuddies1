/**
 * Arenas for the fighting worlds: a castle courtyard, a samurai dojo, a pirate ship deck,
 * a wizard's tower top and a space station platform. Each puts its fighting floor at the
 * same height as the boxing ring, so the fight engine, fighters and camera work unchanged.
 * The camera looks in from -z, so scenery sits behind (+z) and to the sides.
 */
import * as THREE from 'three';

const mat = (color, metal = 0.1, rough = 0.8, emissive = null, ei = 0) => new THREE.MeshStandardMaterial({
  color, metalness: metal, roughness: rough, ...(emissive != null ? { emissive, emissiveIntensity: ei } : {}),
});
const glow = (color) => new THREE.MeshBasicMaterial({ color });
function add(g, geo, material, x = 0, y = 0, z = 0, opts = {}) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  if (opts.rx) m.rotation.x = opts.rx;
  if (opts.ry) m.rotation.y = opts.ry;
  if (opts.rz) m.rotation.z = opts.rz;
  m.castShadow = opts.shadow !== false;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
function light(g, l, x, y, z) {
  l.position.set(x, y, z);
  l.userData.combatArenaLight = true;
  g.add(l);
  return l;
}

function skyGradient(scene, stops, fogColor, near = 30, far = 95) {
  const c = document.createElement('canvas');
  c.width = 2; c.height = 512;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  stops.forEach(([p, hex]) => grad.addColorStop(p, hex));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  scene.fog = new THREE.Fog(fogColor, near, far);
}

/** Canvas texture drawn by fn(ctx, size). */
function drawnTexture(fn, size = 256, repeat = 1) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  fn(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const planks = (base, line) => drawnTexture((ctx, s) => {
  ctx.fillStyle = base; ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = line; ctx.lineWidth = 3;
  for (let y = 0; y <= s; y += s / 8) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke(); }
  for (let i = 0; i < 16; i++) { const y = Math.floor(i / 2) * (s / 8); const x = ((i * 97) % s); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + s / 8); ctx.stroke(); }
});
const stones = (base, line) => drawnTexture((ctx, s) => {
  ctx.fillStyle = base; ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = line; ctx.lineWidth = 4;
  for (let r = 0; r < 6; r++) {
    const y = r * (s / 6);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke();
    for (let x = (r % 2) * (s / 8); x < s; x += s / 4) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + s / 6); ctx.stroke(); }
  }
});

/* ═══ Fantasy Castle: stone courtyard, walls, towers, banners, torches ═══ */
function castle(scene, g, top) {
  skyGradient(scene, [[0, '#7dd3fc'], [0.55, '#fde68a'], [1, '#f59e0b']], 0xf2d39a, 35, 110);
  add(g, new THREE.PlaneGeometry(80, 80), mat(0x4d7c0f, 0, 1), 0, 0, 0, { rx: -Math.PI / 2, shadow: false });
  add(g, new THREE.CylinderGeometry(3.6, 3.9, top, 32), new THREE.MeshStandardMaterial({ map: stones('#9ca3af', '#6b7280'), roughness: 0.9 }), 0, top / 2, 0);
  add(g, new THREE.TorusGeometry(3.6, 0.08, 6, 40), mat(0xd4a017, 0.7, 0.3), 0, top, 0, { rx: Math.PI / 2 });
  const wallMat = new THREE.MeshStandardMaterial({ map: stones('#a8a29e', '#78716c'), roughness: 0.95 });
  add(g, new THREE.BoxGeometry(30, 6, 1.4), wallMat, 0, 3, 12);
  for (let x = -14; x <= 14; x += 2) add(g, new THREE.BoxGeometry(1, 0.9, 1.4), wallMat, x, 6.45, 12);
  [-1, 1].forEach((s) => {
    add(g, new THREE.BoxGeometry(1.4, 6, 18), wallMat, s * 15, 3, 3);
    add(g, new THREE.CylinderGeometry(2.2, 2.4, 10, 18), wallMat, s * 12, 5, 12);
    add(g, new THREE.ConeGeometry(2.8, 3.6, 18), mat(s < 0 ? 0x1d4ed8 : 0xb91c1c, 0.1, 0.7), s * 12, 11.8, 12);
    add(g, new THREE.CylinderGeometry(0.04, 0.04, 2, 6), mat(0x44403c), s * 12, 14.6, 12);
    add(g, new THREE.PlaneGeometry(1.2, 0.7), mat(s < 0 ? 0x1d4ed8 : 0xb91c1c, 0, 0.8), s * 12 + 0.62, 15.2, 12, { shadow: false });
  });
  // Banners on the wall
  [-7, -3.5, 3.5, 7].forEach((x, i) => {
    const b = add(g, new THREE.PlaneGeometry(1.4, 3.2), mat([0x1d4ed8, 0xb91c1c][i % 2], 0, 0.8), x, 3.6, 11.25, { ry: Math.PI, shadow: false });
    b.material.side = THREE.DoubleSide;
    add(g, new THREE.CircleGeometry(0.4, 20), glow(0xfacc15), x, 4.1, 11.22, { ry: Math.PI, shadow: false });
  });
  // Torches with real light
  [[-4.2, 3], [4.2, 3], [-4.2, -2.5], [4.2, -2.5]].forEach(([x, z]) => {
    add(g, new THREE.CylinderGeometry(0.07, 0.09, 2, 8), mat(0x3f2a14), x, 1, z);
    add(g, new THREE.ConeGeometry(0.16, 0.4, 10), glow(0xff8a1f), x, 2.2, z);
    light(g, new THREE.PointLight(0xff9a40, 1.6, 9), x, 2.4, z);
  });
  // Hay bales and a weapon rack
  [[-8, 6], [7.5, 7], [-9, 2]].forEach(([x, z]) => add(g, new THREE.CylinderGeometry(0.7, 0.7, 1.1, 16), mat(0xd6b25e, 0, 1), x, 0.55, z, { rz: Math.PI / 2 }));
  light(g, new THREE.HemisphereLight(0xfff4d6, 0x4d7c0f, 0.9), 0, 20, 0);
  light(g, new THREE.DirectionalLight(0xffe2a8, 1.4), 8, 18, -6);
}

/* ═══ Samurai Dojo: wooden floor, tatami, paper walls, lanterns, cherry blossom ═══ */
function dojo(scene, g, top) {
  skyGradient(scene, [[0, '#fecaca'], [0.5, '#fdba74'], [1, '#9a3412']], 0xf3c7a6, 30, 90);
  add(g, new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: planks('#8b5a2b', '#5c3a1a'), roughness: 0.8 }), 0, 0, 0, { rx: -Math.PI / 2, shadow: false });
  const tatami = drawnTexture((ctx, s) => {
    ctx.fillStyle = '#d9c78a'; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, s - 8, s - 8);
    ctx.beginPath(); ctx.moveTo(s / 2, 0); ctx.lineTo(s / 2, s); ctx.stroke();
  }, 256, 2);
  add(g, new THREE.BoxGeometry(7, top, 7), new THREE.MeshStandardMaterial({ map: tatami, roughness: 0.9 }), 0, top / 2, 0);
  // Paper (shoji) walls behind and at the sides
  const shoji = drawnTexture((ctx, s) => {
    ctx.fillStyle = '#fdf6e3'; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#4a2c17'; ctx.lineWidth = 6;
    for (let i = 0; i <= 4; i++) { const p = (i * s) / 4; ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, s); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(s, p); ctx.stroke(); }
  }, 256, 1);
  shoji.repeat.set(6, 1);
  const wall = new THREE.MeshStandardMaterial({ map: shoji, roughness: 0.9, emissive: 0xffe4b5, emissiveIntensity: 0.25 });
  add(g, new THREE.BoxGeometry(22, 5, 0.3), wall, 0, 2.5, 9);
  [-1, 1].forEach((s) => add(g, new THREE.BoxGeometry(0.3, 5, 16), wall, s * 11, 2.5, 1));
  // Red pillars and a roof beam
  [[-6, 8.6], [6, 8.6], [-10.6, 2], [10.6, 2]].forEach(([x, z]) => add(g, new THREE.CylinderGeometry(0.25, 0.25, 6, 12), mat(0xb91c1c, 0.1, 0.6), x, 3, z));
  add(g, new THREE.BoxGeometry(23, 0.5, 0.6), mat(0x3b1d0e), 0, 5.7, 8.8);
  // Lanterns
  [-5, -2, 2, 5].forEach((x) => {
    add(g, new THREE.CylinderGeometry(0.01, 0.01, 1.2, 4), mat(0x111111), x, 4.9, 6);
    add(g, new THREE.SphereGeometry(0.32, 14, 10), glow(0xef4444), x, 4.1, 6);
    light(g, new THREE.PointLight(0xff6b4a, 0.9, 7), x, 4, 6);
  });
  // Cherry blossom tree
  add(g, new THREE.CylinderGeometry(0.25, 0.4, 4.5, 10), mat(0x4a2c17), -7.5, 2.25, 6);
  [[-7.5, 5, 6, 1.6], [-6.4, 4.4, 5.5, 1.1], [-8.6, 4.5, 6.4, 1.2], [-7.2, 5.8, 6.6, 1]].forEach(([x, y, z, r]) => add(g, new THREE.SphereGeometry(r, 14, 10), mat(0xf9a8d4, 0, 0.9, 0xf472b6, 0.15), x, y, z));
  light(g, new THREE.HemisphereLight(0xffe4e6, 0x7c2d12, 0.75), 0, 20, 0);
  light(g, new THREE.DirectionalLight(0xffd7b0, 1.1), -6, 14, -6);
}

/* ═══ Pirate Ship: deck, rails, mast and sails, barrels, the sea ═══ */
function ship(scene, g, top) {
  skyGradient(scene, [[0, '#38bdf8'], [0.6, '#bae6fd'], [1, '#fde68a']], 0xbfe3f5, 40, 120);
  add(g, new THREE.PlaneGeometry(200, 200), mat(0x0e7490, 0.3, 0.3, 0x0e7490, 0.15), 0, -1.2, 0, { rx: -Math.PI / 2, shadow: false });
  const deckMat = new THREE.MeshStandardMaterial({ map: planks('#a0682f', '#6b4321'), roughness: 0.85 });
  deckMat.map.repeat.set(3, 3);
  add(g, new THREE.BoxGeometry(9, top + 1.2, 18), deckMat, 0, (top - 1.2) / 2, 3);
  add(g, new THREE.BoxGeometry(9.4, 1.4, 18.4), mat(0x5b3a1e), 0, -0.9, 3);
  // Rails
  [-1, 1].forEach((s) => {
    add(g, new THREE.BoxGeometry(0.15, 0.12, 18), mat(0x5b3a1e), s * 4.4, top + 0.9, 3);
    for (let z = -5.5; z <= 11.5; z += 1.5) add(g, new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6), mat(0x5b3a1e), s * 4.4, top + 0.45, z);
  });
  // Mast, sails, crow's nest and flag
  add(g, new THREE.CylinderGeometry(0.22, 0.28, 13, 12), mat(0x6b4423), 0, top + 6.5, 6.5);
  [[4.5, 5], [9, 3.8]].forEach(([y, w]) => {
    const sail = add(g, new THREE.PlaneGeometry(w * 1.6, 3.2, 8, 4), mat(0xf5f0e1, 0, 0.9), 0, top + y, 6.2, { shadow: false });
    sail.material.side = THREE.DoubleSide;
    const pos = sail.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, -Math.cos((pos.getX(i) / (w * 0.8)) * Math.PI / 2) * 0.6);
    sail.geometry.computeVertexNormals();
    add(g, new THREE.CylinderGeometry(0.07, 0.07, w * 1.7, 8), mat(0x6b4423), 0, top + y + 1.65, 6.4, { rz: Math.PI / 2 });
  });
  add(g, new THREE.CylinderGeometry(0.8, 0.7, 0.6, 12, 1, true), mat(0x5b3a1e), 0, top + 12, 6.5);
  const flag = add(g, new THREE.PlaneGeometry(1.4, 0.9), mat(0x111111), 0.75, top + 13.6, 6.5, { shadow: false });
  flag.material.side = THREE.DoubleSide;
  add(g, new THREE.CircleGeometry(0.2, 16), glow(0xf5f5f4), 0.75, top + 13.6, 6.48, { shadow: false });
  // Barrels and a treasure chest
  [[-3.4, 9], [-2.6, 9.6], [3.3, 9.2], [3.4, -3.8]].forEach(([x, z]) => add(g, new THREE.CylinderGeometry(0.42, 0.42, 0.9, 14), mat(0x7c4a1e), x, top + 0.45, z));
  add(g, new THREE.BoxGeometry(1.1, 0.7, 0.7), mat(0x7c2d12), 3.1, top + 0.35, 10.6);
  add(g, new THREE.BoxGeometry(1.14, 0.12, 0.74), mat(0xd4a017, 0.8, 0.3), 3.1, top + 0.72, 10.6);
  // A distant island
  add(g, new THREE.SphereGeometry(9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x65a30d), 30, -1.2, 60);
  add(g, new THREE.CylinderGeometry(0.4, 0.6, 7, 8), mat(0x8b5a2b), 30, 9, 60);
  light(g, new THREE.HemisphereLight(0xe0f2fe, 0x0e7490, 0.95), 0, 20, 0);
  light(g, new THREE.DirectionalLight(0xfff1c1, 1.5), 10, 20, -8);
}

/* ═══ Wizard Tower: magic circle on a tower top, floating crystals, stars and a moon ═══ */
function tower(scene, g, top) {
  skyGradient(scene, [[0, '#0b1026'], [0.55, '#312e81'], [1, '#1e1b4b']], 0x1e1b4b, 30, 100);
  add(g, new THREE.CylinderGeometry(4, 3.6, 30, 24), new THREE.MeshStandardMaterial({ map: stones('#6b7280', '#374151'), roughness: 0.95 }), 0, top - 15, 0);
  add(g, new THREE.CircleGeometry(3.95, 40), mat(0x4b5563, 0.1, 0.9), 0, top + 0.005, 0, { rx: -Math.PI / 2, shadow: false });
  const circle = drawnTexture((ctx, s) => {
    ctx.clearRect(0, 0, s, s);
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 6;
    [0.46, 0.38, 0.22].forEach((r) => { ctx.beginPath(); ctx.arc(s / 2, s / 2, s * r, 0, Math.PI * 2); ctx.stroke(); });
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5; const x = s / 2 + Math.cos(a) * s * 0.38; const y = s / 2 + Math.sin(a) * s * 0.38; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
  }, 512, 1);
  add(g, new THREE.PlaneGeometry(7.2, 7.2), new THREE.MeshBasicMaterial({ map: circle, transparent: true, depthWrite: false }), 0, top + 0.02, 0, { rx: -Math.PI / 2, shadow: false });
  // Battlements round the edge (open at the camera side)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    if (Math.sin(a) < -0.45) continue;
    add(g, new THREE.BoxGeometry(0.9, 0.9, 0.5), mat(0x6b7280, 0.1, 0.9), Math.cos(a) * 4.1, top + 0.45, Math.sin(a) * 4.1, { ry: -a + Math.PI / 2 });
  }
  // Floating crystals
  [[-6, 3, 4, 0x67e8f9], [6, 4, 5, 0xc084fc], [-4, 5.5, 9, 0xf472b6], [5, 2.5, -2, 0x67e8f9], [0, 6.5, 10, 0xfbbf24]].forEach(([x, y, z, c]) => {
    add(g, new THREE.OctahedronGeometry(0.6), mat(c, 0.2, 0.2, c, 0.8), x, top + y, z, { shadow: false });
    light(g, new THREE.PointLight(c, 0.8, 8), x, top + y, z);
  });
  // Moon and stars
  add(g, new THREE.SphereGeometry(6, 24, 16), glow(0xfef9c3), -22, top + 22, 60, { shadow: false });
  const stars = new THREE.BufferGeometry();
  const pts = [];
  for (let i = 0; i < 500; i++) { const a = Math.random() * Math.PI * 2; const r = 60 + Math.random() * 30; pts.push(Math.cos(a) * r, top + 5 + Math.random() * 50, Math.sin(a) * r); }
  stars.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, fog: false })));
  light(g, new THREE.HemisphereLight(0xa5b4fc, 0x1e1b4b, 0.7), 0, 30, 0);
  light(g, new THREE.PointLight(0xa78bfa, 1.4, 14), 0, top + 3, 0);
}

/* ═══ Space Arena: glowing metal platform, station pylons, a planet and stars ═══ */
function space(scene, g, top) {
  skyGradient(scene, [[0, '#000005'], [0.6, '#0b1033'], [1, '#020617']], 0x020617, 40, 140);
  const panel = drawnTexture((ctx, s) => {
    ctx.fillStyle = '#334155'; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 6;
    for (let i = 0; i <= 4; i++) { const p = (i * s) / 4; ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, s); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(s, p); ctx.stroke(); }
  }, 256, 2);
  add(g, new THREE.CylinderGeometry(4, 3.4, 1.2, 6), new THREE.MeshStandardMaterial({ map: panel, metalness: 0.7, roughness: 0.35 }), 0, top - 0.6, 0);
  add(g, new THREE.TorusGeometry(3.9, 0.06, 6, 6), glow(0x38bdf8), 0, top + 0.02, 0, { rx: Math.PI / 2, shadow: false });
  add(g, new THREE.CylinderGeometry(0.5, 0.2, 6, 12), mat(0x1f2937, 0.8, 0.3), 0, top - 4, 0);
  // Station pylons with blinking lights
  [[-7, 6], [7, 6], [-9, 0], [9, 0]].forEach(([x, z], i) => {
    add(g, new THREE.BoxGeometry(0.8, 9, 0.8), mat(0x475569, 0.8, 0.3), x, top + 1.5, z);
    add(g, new THREE.SphereGeometry(0.25, 10, 8), glow(i % 2 ? 0xf43f5e : 0x38bdf8), x, top + 6.2, z);
    light(g, new THREE.PointLight(i % 2 ? 0xf43f5e : 0x38bdf8, 0.9, 10), x, top + 6, z);
  });
  // Planet with a ring, and stars
  const planet = add(g, new THREE.SphereGeometry(16, 32, 24), mat(0x2563eb, 0.1, 0.8, 0x1e3a8a, 0.35), 18, top - 6, 55, { shadow: false });
  planet.material.fog = false;
  const ring = add(g, new THREE.RingGeometry(20, 26, 48), new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.4, side: THREE.DoubleSide, fog: false }), 18, top - 6, 55, { rx: Math.PI / 2.4, shadow: false });
  ring.renderOrder = 1;
  const stars = new THREE.BufferGeometry();
  const pts = [];
  for (let i = 0; i < 700; i++) { const a = Math.random() * Math.PI * 2; const r = 70 + Math.random() * 40; pts.push(Math.cos(a) * r, -20 + Math.random() * 80, Math.sin(a) * r); }
  stars.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xffffff, size: 0.4, fog: false })));
  light(g, new THREE.HemisphereLight(0xbfdbfe, 0x0f172a, 0.6), 0, 30, 0);
  light(g, new THREE.DirectionalLight(0xe0f2fe, 1.2), -10, 20, -10);
}

const BUILDERS = { castle, dojo, ship, tower, space };

/** Build a world's arena around a fighting floor whose top is at `top`. Returns the group. */
export function buildWorldArena(scene, worldId, top) {
  const g = new THREE.Group();
  g.name = `FightWorld_${worldId}`;
  (BUILDERS[worldId] || castle)(scene, g, top);
  scene.add(g);
  return g;
}
