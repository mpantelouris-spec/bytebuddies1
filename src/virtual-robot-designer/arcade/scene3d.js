/**
 * 3D views for the Robot Arcade games — same bright, toy-like look as the
 * other Robot Studio arenas, using the real robot models from the builder.
 * Each game keeps its 2D logic (pixels); this file only draws it in 3D.
 * 1 world unit = 40 game pixels.
 */
import * as THREE from 'three';
import { createSimWebGLRenderer, getStudioDeviceProfile } from '../services/art-direction.js';
import { buildRobotModel } from '../services/studio-robot-builder.js';
import { BRICK_CONSTS } from './games/brick.js';
import { moverXs, HCOLS } from './games/hop.js';
import { RW, RH, SHIP_Y } from './games/raiders.js';
import { themeFor } from './games/arena.js';
import { gradeArcadeScene } from './tier-grade.js';
import { installMissionTheme, MISSION_PROPS, surfaceTexture } from '../studio/mission-world/themes/MissionThemeKit.js';
import { MISSION_THEME_RECIPES } from '../studio/mission-world/themes/recipes/index.js';

const S = 40;
const D2R = Math.PI / 180;

/* ─── Small builders ─── */
const stdMat = (color, rough = 0.7, metal = 0.05, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
function mesh(geo, mat, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

function tree(scale = 1, leaf = 0x4caf50) {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.1, 8), stdMat(0x8d5a3b));
  trunk.position.y = 0.55;
  g.add(trunk);
  [[0, 1.45, 0, 0.75], [0.35, 1.2, 0.15, 0.5], [-0.3, 1.25, -0.1, 0.55], [0.05, 1.9, 0, 0.5]].forEach(([x, y, z, r]) => {
    const b = mesh(new THREE.IcosahedronGeometry(r, 1), stdMat(leaf, 0.85));
    b.position.set(x, y, z);
    g.add(b);
  });
  g.scale.setScalar(scale);
  return g;
}

function cloud() {
  const g = new THREE.Group();
  const m = stdMat(0xffffff, 1, 0, { emissive: 0xffffff, emissiveIntensity: 0.25 });
  [[0, 0, 0, 1.2], [1.1, -0.15, 0.2, 0.9], [-1.1, -0.2, 0, 0.85], [0.4, 0.45, 0, 0.8]].forEach(([x, y, z, r]) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), m);
    b.position.set(x, y, z);
    g.add(b);
  });
  return g;
}

/** Builder robot, scaled so its footprint is `size` units across, standing on y=0. */
function robotModel(config, size) {
  let g;
  try { g = buildRobotModel(config); } catch { g = null; }
  if (!g) {
    g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(1, 0.6, 1.2), stdMat(config.primaryColor || '#ef4444', 0.5, 0.2)));
  }
  g.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
  const box = new THREE.Box3().setFromObject(g);
  const span = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) || 1;
  const k = size / span;
  g.scale.multiplyScalar(k);
  const box2 = new THREE.Box3().setFromObject(g);
  const holder = new THREE.Group();
  g.position.y -= box2.min.y;
  g.position.x -= (box2.min.x + box2.max.x) / 2;
  g.position.z -= (box2.min.z + box2.max.z) / 2;
  holder.add(g);
  return holder;
}

/** Game (x, y pixels, angle) → 3D position and heading. Models face +z. */
function place(obj, x, y, a, W, H, lift = 0) {
  obj.position.set((x - W / 2) / S, lift, (y - H / 2) / S);
  if (a != null) obj.rotation.y = Math.PI / 2 - a;
}

function scenery(scene, W, H, { leaf = 0x4caf50, ground = 0x9ed36a, ring = 3.5, y = -0.02 } = {}) {
  const ext = Math.max(W, H) / S;
  const g = mesh(new THREE.CircleGeometry(ext * 2.4, 48), stdMat(ground, 0.95), { cast: false });
  g.rotation.x = -Math.PI / 2;
  g.position.y = y;
  scene.add(g);
  const rnd = mulberry(7);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rnd() * 0.2;
    const r = ext * 0.62 + ring + rnd() * 4;
    const t = tree(0.9 + rnd() * 0.9, [leaf, 0x66bb6a, 0x43a047, 0x8bc34a][i % 4]);
    t.position.set(Math.cos(a) * r, y, Math.sin(a) * r * 0.85);
    t.rotation.y = rnd() * 6;
    scene.add(t);
  }
  for (let i = 0; i < 6; i++) {
    const c = cloud();
    c.position.set(-ext * 1.4 + i * ext * 0.55, 9 + rnd() * 3, -ext * 1.2 - rnd() * 6);
    c.scale.setScalar(1 + rnd());
    scene.add(c);
  }
}

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Per-game scenes ─── */

/* Grid helpers shared by the maze and crossing scenes */
const dirRot = (d) => [Math.PI / 2, 0, -Math.PI / 2, Math.PI][d];

function arcadeCabinet(color) {
  const g = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(1.1, 2.2, 0.9), stdMat(color, 0.5, 0.2));
  body.position.y = 1.1;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x38bdf8, emissiveIntensity: 1.2 }));
  screen.position.set(0, 1.55, 0.46);
  const panel = mesh(new THREE.BoxGeometry(1.0, 0.12, 0.4), stdMat(0x111827, 0.5));
  panel.position.set(0, 1.0, 0.55);
  g.add(body, screen, panel);
  return g;
}

function ghost(color) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.15, emissive: color, emissiveIntensity: 0.25 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), m);
  head.position.y = 0.45;
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.4, 18, 1, true), m);
  skirt.position.y = 0.25;
  const eyes = [-0.11, 0.11].map((x) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    e.position.set(x, 0.5, 0.24);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
    p.position.set(x, 0.5, 0.31);
    return [e, p];
  }).flat();
  g.add(head, skirt, ...eyes);
  [head, skirt].forEach((n) => { n.castShadow = true; });
  g.userData.mat = m;
  return g;
}

function pacScene(scene, world, look, robotConfig) {
  const COLS = 19, ROWS = 15, CELL = 32, W = COLS * CELL, H = ROWS * CELL;
  scene.background = new THREE.Color(0x1e1b4b);
  scene.fog = new THREE.Fog(0x1e1b4b, 26, 60);
  const cell = (cx, cy, y = 0) => new THREE.Vector3(((cx + 0.5) * CELL - W / 2) / S, y, ((cy + 0.5) * CELL - H / 2) / S);
  // Arcade room floor + maze board
  const room = mesh(new THREE.CircleGeometry(30, 48), stdMat(0x2e1065, 0.8), { cast: false });
  room.rotation.x = -Math.PI / 2; room.position.y = -0.31;
  scene.add(room);
  const board = mesh(new THREE.BoxGeometry(W / S + 0.8, 0.3, H / S + 0.8), stdMat(0x0b1030, 0.55, 0.2), { cast: false });
  board.position.y = -0.15;
  scene.add(board);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(W / S + 1, 0.06, H / S + 1), new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xf472b6, emissiveIntensity: 0.8 }));
  trim.position.y = -0.31;
  scene.add(trim);
  const cabColors = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7, 0xf97316];
  for (let i = 0; i < 8; i++) {
    const c = arcadeCabinet(cabColors[i % cabColors.length]);
    const side = i < 4 ? -1 : 1;
    c.position.set(side * (W / S / 2 + 2.2), -0.31, -H / S / 2 + 1.5 + (i % 4) * 3);
    c.rotation.y = side * -Math.PI / 2;
    scene.add(c);
  }
  // Maze walls (instanced) with glowing caps
  const walls = [];
  for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if (!world.open.has(`${x},${y}`)) walls.push([x, y]);
  const wallMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), stdMat(0x1e3a8a, 0.4, 0.3, { emissive: 0x172554, emissiveIntensity: 0.6 }), walls.length);
  const capMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.82, 0.05, 0.82), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x3b82f6, emissiveIntensity: 1.1 }), walls.length);
  const m4 = new THREE.Matrix4();
  walls.forEach(([x, y], i) => {
    const p = cell(x, y, 0.25);
    wallMesh.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z));
    capMesh.setMatrixAt(i, m4.makeTranslation(p.x, 0.51, p.z));
  });
  wallMesh.castShadow = true; wallMesh.receiveShadow = true;
  scene.add(wallMesh, capMesh);
  // Dots and power batteries
  const dotKeys = [...world.dots];
  const dotMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 1.2 }), Math.max(1, dotKeys.length));
  dotKeys.forEach((k, i) => { const [x, y] = k.split(',').map(Number); const p = cell(x, y, 0.3); dotMesh.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z)); });
  scene.add(dotMesh);
  const powers = [...world.power].map((k) => {
    const [x, y] = k.split(',').map(Number);
    const g = new THREE.Group();
    const cellBody = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.8 }));
    const capTop = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12), stdMat(0xe5e7eb, 0.3, 0.7));
    capTop.position.y = 0.24;
    g.add(cellBody, capTop);
    g.position.copy(cell(x, y, 0.35));
    scene.add(g);
    return { k, g };
  });
  const pac = robotModel(robotConfig, 0.72);
  scene.add(pac);
  const bugs = world.bugs.map((b) => { const g = ghost(new THREE.Color(b.color)); scene.add(g); return g; });
  const glow = new THREE.PointLight(0xfde047, 3, 3.5);
  scene.add(glow);
  let shown = -1;

  return {
    focus: () => pac.position,
    update(w, t) {
      if (shown !== w.eaten) {
        shown = w.eaten;
        dotKeys.forEach((k, i) => {
          const [x, y] = k.split(',').map(Number);
          const p = cell(x, y, 0.3);
          const s = w.dots.has(k) ? 1 : 0;
          dotMesh.setMatrixAt(i, m4.makeScale(s, s, s).setPosition(p.x, p.y, p.z));
        });
        dotMesh.instanceMatrix.needsUpdate = true;
      }
      powers.forEach(({ k, g }) => { g.visible = w.power.has(k); g.rotation.y = t * 2; g.scale.setScalar(1 + Math.sin(t * 6) * 0.12); });
      const a = w.anim;
      const px = w.p.px + (w.p.x - w.p.px) * a, py = w.p.py + (w.p.y - w.p.py) * a;
      pac.position.copy(cell(px, py, 0));
      pac.rotation.y = dirRot(w.p.dir);
      pac.visible = w.safeT > 0 ? Math.floor(t * 10) % 2 === 0 : true;
      glow.position.set(pac.position.x, 0.8, pac.position.z);
      w.bugs.forEach((b, i) => {
        const g = bugs[i];
        g.visible = b.out <= 0;
        const k = b.anim;
        g.position.copy(cell(b.px + (b.x - b.px) * k, b.py + (b.y - b.py) * k, Math.sin(t * 5 + i) * 0.05));
        g.rotation.y = dirRot(b.dir);
        const scared = w.powerT > 0;
        const col = scared ? (w.powerT < 2 && Math.floor(t * 8) % 2 ? 0xffffff : 0x3b82f6) : b.color;
        g.userData.mat.color.set(col);
        g.userData.mat.emissive.set(col);
      });
    },
    camera: { pos: [0.8, 16.5, 10.5], look: [0.8, 0, 0.9] },
  };
}

/** The Brick Bot paddle, built at its real width so nothing looks stretched. */
function paddleBot(width, look) {
  // Exactly `width` across (end caps included), so what you see is what the ball hits.
  const g = new THREE.Group();
  const capR = 0.15;
  const bodyW = Math.max(0.4, width - capR * 2);
  const body = mesh(new THREE.BoxGeometry(bodyW, 0.26, 0.42), stdMat(look.primary, 0.45, 0.25));
  body.position.y = 0.26;
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(bodyW, 0.07, 0.1), new THREE.MeshStandardMaterial({ color: look.accent, emissive: look.accent, emissiveIntensity: 0.6, roughness: 0.3 }));
  bumper.position.set(0, 0.36, -0.2);
  g.add(body, bumper);
  [-1, 1].forEach((side) => {
    const cap = mesh(new THREE.SphereGeometry(capR, 16, 12), stdMat(look.accent, 0.35, 0.3));
    cap.position.set(side * (bodyW / 2), 0.26, 0);
    g.add(cap);
  });
  [-0.12, 0.12].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshStandardMaterial({ color: look.led || '#5eead4', emissive: look.led || '#5eead4', emissiveIntensity: 1.6 }));
    eye.position.set(x, 0.3, 0.22);
    g.add(eye);
  });
  [-1, 1].forEach((side) => {
    const wh = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 14), stdMat(0x111827, 0.8));
    wh.rotation.z = Math.PI / 2;
    wh.position.set(side * bodyW * 0.3, 0.09, 0.14);
    g.add(wh);
  });
  return g;
}

function brickScene(scene, world, look, robotConfig) {
  const W = 640, H = 480, { PADDLE_Y, PADDLE_H, BALL_R } = BRICK_CONSTS;
  const at = (x, y, h = 0) => new THREE.Vector3((x - W / 2) / S, h, (y - H / 2) / S);
  scene.background = new THREE.Color(0x1e1b4b);
  scene.fog = new THREE.Fog(0x1e1b4b, 26, 60);
  const room = mesh(new THREE.CircleGeometry(30, 48), stdMat(0x312e81, 0.85), { cast: false });
  room.rotation.x = -Math.PI / 2; room.position.y = -0.31;
  scene.add(room);
  // Court with a neon grid
  const gc = document.createElement('canvas'); gc.width = 640; gc.height = 480;
  const gx = gc.getContext('2d');
  gx.fillStyle = '#0b1229'; gx.fillRect(0, 0, 640, 480);
  gx.strokeStyle = 'rgba(56,189,248,0.25)'; gx.lineWidth = 2;
  for (let x = 0; x <= 640; x += 40) { gx.beginPath(); gx.moveTo(x, 0); gx.lineTo(x, 480); gx.stroke(); }
  for (let y = 0; y <= 480; y += 40) { gx.beginPath(); gx.moveTo(0, y); gx.lineTo(640, y); gx.stroke(); }
  gx.fillStyle = 'rgba(239,68,68,0.35)'; gx.fillRect(0, 468, 640, 12);
  const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
  const court = mesh(new THREE.BoxGeometry(W / S, 0.3, H / S), [stdMat(0x0b1229), stdMat(0x0b1229), new THREE.MeshStandardMaterial({ map: gt, roughness: 0.5 }), stdMat(0x0b1229), stdMat(0x0b1229), stdMat(0x0b1229)], { cast: false });
  court.position.y = -0.15;
  scene.add(court);
  const rail = (w, d, x, z, color) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, roughness: 0.3 }));
    r.position.set(x, 0.1, z);
    r.castShadow = true;
    scene.add(r);
  };
  rail(0.25, H / S + 0.5, -W / S / 2 - 0.13, 0, 0xf472b6);
  rail(0.25, H / S + 0.5, W / S / 2 + 0.13, 0, 0xf472b6);
  rail(W / S + 0.5, 0.25, 0, -H / S / 2 - 0.13, 0x38bdf8);
  // Bricks
  const bricks = world.bricks.map((b) => {
    const mat = b.kind === 'steel' ? stdMat(0x334155, 0.4, 0.8)
      : b.kind === 'metal' ? stdMat(0x9ca3af, 0.3, 0.8)
        : b.star ? new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.4 })
          : stdMat(new THREE.Color(b.color), 0.45, 0.1);
    const m = mesh(new THREE.BoxGeometry((b.w / S) * 0.94, 0.42, (b.h / S) * 0.88), mat);
    scene.add(m);
    return m;
  });
  // Ball with a light
  const ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_R / S, 18, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe0f2fe, emissiveIntensity: 0.9 }));
  ball.castShadow = true;
  const ballLight = new THREE.PointLight(0xbae6fd, 4, 4);
  scene.add(ball, ballLight);
  const paddle = paddleBot(world.paddle.w / S, look);
  scene.add(paddle);
  const starPool = [];
  const starMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 1 });
  const burstPool = [];

  return {
    focus: () => paddle.position,
    update(w, t) {
      w.bricks.forEach((b, i) => {
        const m = bricks[i];
        m.visible = b.hp > 0;
        m.position.copy(at(b.x + b.w / 2, b.y + b.h / 2, 0.21));
        if (b.kind === 'metal' && b.hp === 1) m.material.color.set(0x6b7280);
      });
      ball.position.copy(at(w.ball.x, w.ball.y, 0.28));
      ballLight.position.set(ball.position.x, 0.9, ball.position.z);
      paddle.position.copy(at(w.paddle.x, PADDLE_Y + PADDLE_H / 2, 0));
      while (starPool.length < w.stars.length) { const s = mesh(new THREE.OctahedronGeometry(0.22), starMat); scene.add(s); starPool.push(s); }
      starPool.forEach((s, i) => {
        const st = w.stars[i];
        s.visible = !!st;
        if (st) { s.position.copy(at(st.x, st.y, 0.4)); s.rotation.y = t * 4; }
      });
      const pops = w.pops.filter((q) => q.color);
      while (burstPool.length < pops.length) {
        const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), new THREE.MeshBasicMaterial({ transparent: true }));
        scene.add(b); burstPool.push(b);
      }
      burstPool.forEach((b, i) => {
        const q = pops[i];
        b.visible = !!q;
        if (!q) return;
        b.material.color.set(q.color);
        b.material.opacity = q.life * 2;
        b.scale.setScalar(1 + (0.5 - q.life) * 3);
        b.position.copy(at(q.x, q.y, 0.3));
      });
    },
    camera: { pos: [0.6, 15, 11.5], look: [0.6, 0, 1.6] },
  };
}

function car(color, len) {
  const g = new THREE.Group();
  const C = 0.8;
  const body = mesh(new THREE.BoxGeometry(len * C * 0.92, 0.38, C * 0.66), stdMat(color, 0.45, 0.15));
  body.position.y = 0.3;
  const cabin = mesh(new THREE.BoxGeometry(len * C * 0.45, 0.28, C * 0.58), stdMat(0xe0f2fe, 0.2, 0.3));
  cabin.position.set(len > 1 ? -len * C * 0.18 : 0, 0.62, 0);
  g.add(body, cabin);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const wh = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), stdMat(0x111827, 0.8));
    wh.rotation.x = Math.PI / 2;
    wh.position.set(sx * len * C * 0.32, 0.12, sz * C * 0.34);
    g.add(wh);
  });
  return g;
}
function trainCar(len) {
  const g = new THREE.Group();
  const C = 0.8;
  const body = mesh(new THREE.BoxGeometry(len * C, 0.85, C * 0.78), stdMat(0xdc2626, 0.4, 0.3));
  body.position.y = 0.55;
  g.add(body);
  for (let i = 0; i < len; i++) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(C * 0.5, 0.25, C * 0.8), new THREE.MeshStandardMaterial({ color: 0xbae6fd, emissive: 0x38bdf8, emissiveIntensity: 0.4 }));
    win.position.set(-len * C / 2 + (i + 0.5) * C, 0.7, 0);
    g.add(win);
  }
  return g;
}

function hopScene(scene, world, look, robotConfig) {
  const COLS = HCOLS, C = 0.8;
  const n = world.lanes.length;
  const laneZ = (i) => ((n - 1) / 2 - i) * C;
  const colX = (c) => (c + 0.5 - COLS / 2) * C;
  scene.background = new THREE.Color(0x9fd8ff);
  scene.fog = new THREE.Fog(0x9fd8ff, 22, 48);
  const base = mesh(new THREE.BoxGeometry(60, 0.5, n * C + 40), stdMat(0x7cc35a, 0.95), { cast: false });
  base.position.y = -0.56;
  scene.add(base);
  const carColors = [0xef4444, 0x3b82f6, 0xfacc15, 0xa855f7, 0xf97316, 0x14b8a6];
  const lanes = world.lanes.map((lane, i) => {
    const z = laneZ(i);
    const grp = new THREE.Group();
    grp.position.z = z;
    scene.add(grp);
    if (lane.type === 'grass' || lane.type === 'goal') {
      const strip = mesh(new THREE.BoxGeometry(60, 0.3, C), stdMat(lane.type === 'goal' ? 0xfef3c7 : (i % 2 ? 0x8fd36a : 0x9be07a), 0.95), { cast: false });
      strip.position.y = -0.15;
      grp.add(strip);
      lane.trees.forEach((c) => { const t = tree(0.42); t.position.x = colX(c); grp.add(t); });
      if (lane.type === 'goal') {
        for (let c = 0; c < COLS; c++) {
          const tile = mesh(new THREE.BoxGeometry(C * 0.5, 0.02, C * 0.5), stdMat(c % 2 ? 0x111827 : 0xffffff, 0.6), { cast: false });
          tile.position.set(colX(c), 0.01, 0);
          grp.add(tile);
        }
        const pole = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), stdMat(0x475569, 0.4, 0.6));
        pole.position.set(colX(COLS) , 0.8, 0);
        const flag = mesh(new THREE.BoxGeometry(0.7, 0.45, 0.03), stdMat(0xef4444, 0.6));
        flag.position.set(colX(COLS) + 0.37, 1.35, 0);
        grp.add(pole, flag);
      }
      // scenery trees outside the play area
      [-1, 1].forEach((side) => {
        for (let k = 0; k < 2; k++) {
          if ((i + k) % 3 === 0) continue;
          const t = tree(0.4 + ((i * 7 + k) % 3) * 0.08);
          t.position.x = side * (COLS * C / 2 + 1 + k * 1.6 + (i % 2) * 0.5);
          grp.add(t);
        }
      });
    } else if (lane.type === 'road') {
      const strip = mesh(new THREE.BoxGeometry(60, 0.3, C), stdMat(0x4b5563, 0.9), { cast: false });
      strip.position.y = -0.15;
      grp.add(strip);
      for (let x = -14; x < 14; x += 1.4) {
        const dash = mesh(new THREE.BoxGeometry(0.6, 0.02, 0.06), stdMat(0xf8fafc, 0.6), { cast: false });
        dash.position.set(x, 0.01, C / 2 - 0.02);
        grp.add(dash);
      }
    } else if (lane.type === 'river') {
      const bed = mesh(new THREE.BoxGeometry(60, 0.3, C), stdMat(0x1e40af, 0.9), { cast: false });
      bed.position.y = -0.4;
      const water = new THREE.Mesh(new THREE.BoxGeometry(60, 0.05, C), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, roughness: 0.15, metalness: 0.1 }));
      water.position.y = -0.12;
      grp.add(bed, water);
    } else if (lane.type === 'rail') {
      const strip = mesh(new THREE.BoxGeometry(60, 0.3, C), stdMat(0x8b7d6b, 0.95), { cast: false });
      strip.position.y = -0.15;
      grp.add(strip);
      for (let x = -14; x < 14; x += 0.5) {
        const sl = mesh(new THREE.BoxGeometry(0.14, 0.05, C * 0.8), stdMat(0x78350f, 0.9), { cast: false });
        sl.position.set(x, 0.02, 0);
        grp.add(sl);
      }
      [-0.2, 0.2].forEach((dz) => {
        const r = mesh(new THREE.BoxGeometry(60, 0.06, 0.05), stdMat(0xcbd5e1, 0.3, 0.9), { cast: false });
        r.position.set(0, 0.07, dz);
        grp.add(r);
      });
      lane.lamps = [-1, 1].map((side) => {
        const pole = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 8), stdMat(0x334155));
        pole.position.set(side * (COLS * C / 2 + 0.4), 0.5, -C / 2 + 0.1);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ color: 0x7f1d1d, emissive: 0xef4444, emissiveIntensity: 0 }));
        lamp.position.set(side * (COLS * C / 2 + 0.4), 1.05, -C / 2 + 0.1);
        grp.add(pole, lamp);
        return lamp;
      });
    }
    let movers = [];
    if (lane.type === 'road') movers = lane.items.map((_, k) => { const m = car(carColors[(i + k) % carColors.length], lane.len); grp.add(m); return m; });
    if (lane.type === 'river') movers = lane.items.map(() => {
      const m = mesh(new THREE.CylinderGeometry(0.26, 0.26, lane.len * C * 0.96, 14), stdMat(0x92400e, 0.85));
      m.rotation.z = Math.PI / 2;
      grp.add(m);
      return m;
    });
    if (lane.type === 'rail') movers = lane.items.map(() => { const m = trainCar(lane.len); grp.add(m); return m; });
    return { lane, grp, movers };
  });
  // Dim the squares outside the play area, like Crossy Road
  [-1, 1].forEach((side) => {
    const shade = new THREE.Mesh(new THREE.BoxGeometry(12, 0.02, n * C), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false }));
    shade.position.set(side * (COLS * C / 2 + 6), 0.03, 0);
    scene.add(shade);
  });
  const bot = robotModel(robotConfig, 0.62);
  scene.add(bot);
  let facing = Math.PI;

  return {
    focus: () => bot.position,
    update(w, t) {
      lanes.forEach(({ lane, movers }) => {
        if (!movers.length) return;
        const xs = moverXs(lane, w.t);
        movers.forEach((m, k) => {
          const vx = xs[k];
          m.visible = vx > -lane.len - 2 && vx < COLS + 2;
          m.position.x = (vx + lane.len / 2 - COLS / 2) * C;
          if (lane.type === 'road') m.rotation.y = lane.speed < 0 ? Math.PI : 0;
          if (lane.type === 'river') m.position.y = -0.05 + Math.sin(t * 2 + k) * 0.02;
        });
        if (lane.lamps) {
          // Flash the warning lights while a train is close or crossing
          const soon = xs.some((vx) => (lane.speed > 0 ? vx > -16 : vx > -lane.len - 2) && (lane.speed > 0 ? vx < COLS + 2 : vx < COLS + 16));
          lane.lamps.forEach((l, j) => { l.material.emissiveIntensity = soon && Math.floor(t * 6 + j) % 2 ? 2 : 0; });
        }
      });
      const h = Math.min(1, w.hopT);
      const e = h * h * (3 - 2 * h);
      const fromX = colX(w.from.x), toX = colX(w.x);
      const fromZ = laneZ(w.from.row), toZ = laneZ(w.row);
      const lane = w.lanes[w.row];
      const lift = lane.type === 'river' ? 0.2 : 0;
      if (w.row > w.from.row) facing = Math.PI; else if (w.row < w.from.row) facing = 0;
      else if (w.x < w.from.x) facing = -Math.PI / 2; else if (w.x > w.from.x) facing = Math.PI / 2;
      bot.position.set(h < 1 ? fromX + (toX - fromX) * e : toX, lift + Math.sin(h * Math.PI) * 0.55, fromZ + (toZ - fromZ) * e);
      bot.rotation.y = facing;
      const splat = w.result?.lose && !w.splash && lane.type !== 'river';
      bot.scale.set(1, splat ? 0.25 : 1, 1);
      if (w.splash) bot.position.y = -0.4;
    },
    camera: { pos: [2.4, 11.5, 6.5 + n * 0.3], look: [0, 0, -0.2] },
  };
}

/* ─── Space Raiders in full 3D ─── */
const ALIEN_COL = { A: 0x4ade80, B: 0x22d3ee, C: 0xf472b6 };

function glowMat(c, i = 0.35, extra = {}) {
  return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.35, metalness: 0.15, ...extra });
}

/** Sculpted 3D invaders. Each returns a group with an animate(step, t) hook. */
function blobAlien(col) {
  const g = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(0.32, 24, 18), glowMat(col, 0.3, { roughness: 0.2 }));
  body.scale.set(1, 0.85, 1);
  g.add(body);
  const tentacles = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const t = mesh(new THREE.CapsuleGeometry(0.05, 0.28, 4, 8), glowMat(col, 0.25));
    t.position.set(Math.cos(a) * 0.2, -0.32, Math.sin(a) * 0.2);
    g.add(t); tentacles.push(t);
  }
  const eye = mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
  eye.position.set(0, 0.08, 0.26);
  const pupil = mesh(new THREE.SphereGeometry(0.065, 12, 10), new THREE.MeshStandardMaterial({ color: 0x111827 }));
  pupil.position.set(0, 0.08, 0.37);
  g.add(eye, pupil);
  g.userData.animate = (step, t, i) => {
    tentacles.forEach((tt, k) => { tt.rotation.x = Math.sin(t * 6 + k + i) * 0.5; tt.rotation.z = Math.cos(t * 6 + k) * 0.3; });
    body.scale.y = 0.85 + (step ? 0.06 : 0);
  };
  return g;
}

function crabAlien(col) {
  const g = new THREE.Group();
  const shell = mesh(new THREE.SphereGeometry(0.34, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), glowMat(col, 0.3, { metalness: 0.4, roughness: 0.25 }));
  shell.scale.set(1.2, 0.8, 0.9);
  const belly = mesh(new THREE.CylinderGeometry(0.36, 0.3, 0.12, 20), glowMat(new THREE.Color(col).multiplyScalar(0.6).getHex(), 0.2));
  belly.position.y = -0.04;
  g.add(shell, belly);
  const arms = [-1, 1].map((side) => {
    const arm = new THREE.Group();
    const upper = mesh(new THREE.CapsuleGeometry(0.05, 0.25, 4, 8), glowMat(col, 0.25));
    upper.rotation.z = side * 1.1;
    upper.position.set(side * 0.16, 0, 0);
    const claw = mesh(new THREE.SphereGeometry(0.11, 12, 10), glowMat(col, 0.35));
    claw.scale.set(1, 0.7, 1.3);
    claw.position.set(side * 0.32, 0.1, 0.06);
    arm.add(upper, claw);
    arm.position.set(side * 0.32, 0.05, 0.05);
    g.add(arm);
    return arm;
  });
  [-0.12, 0.12].forEach((x) => {
    const stalk = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 6), glowMat(col, 0.3));
    stalk.position.set(x, 0.32, 0.12);
    const eye = mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    eye.position.set(x, 0.45, 0.14);
    const p = mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshStandardMaterial({ color: 0x111827 }));
    p.position.set(x, 0.45, 0.2);
    g.add(stalk, eye, p);
  });
  g.userData.animate = (step, t) => {
    arms.forEach((a, k) => { a.rotation.z = (k ? -1 : 1) * (step ? 0.35 : -0.1); });
    shell.rotation.y = Math.sin(t * 2) * 0.1;
  };
  return g;
}

function squidAlien(col) {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 12; i++) { const k = i / 12; pts.push(new THREE.Vector2(Math.sin(k * Math.PI) * 0.26 * (1 - k * 0.35) + 0.02, k * 0.7 - 0.25)); }
  const head = mesh(new THREE.LatheGeometry(pts, 24), glowMat(col, 0.3, { roughness: 0.25 }));
  g.add(head);
  const helmet = mesh(new THREE.SphereGeometry(0.3, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.45, roughness: 0.25, emissive: 0x94a3b8, emissiveIntensity: 0.35 }));
  helmet.position.y = 0.1;
  const visor = mesh(new THREE.TorusGeometry(0.27, 0.035, 8, 24), new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 0.8 }));
  visor.rotation.x = Math.PI / 2;
  visor.position.y = 0.1;
  g.add(helmet, visor);
  g.userData.helmet = [helmet, visor];
  [-0.09, 0.09].forEach((x) => {
    const eye = mesh(new THREE.SphereGeometry(0.06, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    eye.position.set(x, 0.0, 0.22);
    g.add(eye);
  });
  const legs = [];
  for (let i = 0; i < 4; i++) {
    const l = mesh(new THREE.CapsuleGeometry(0.04, 0.3, 4, 8), glowMat(col, 0.25));
    l.position.set(-0.15 + i * 0.1, -0.38, 0.02);
    g.add(l); legs.push(l);
  }
  g.userData.animate = (step, t, i) => { legs.forEach((l, k) => { l.rotation.z = (k % 2 ? 1 : -1) * (step ? 0.4 : -0.2) + Math.sin(t * 5 + i) * 0.1; }); };
  return g;
}

function motherShip() {
  const g = new THREE.Group();
  const hull = mesh(new THREE.SphereGeometry(1.1, 36, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.3 }));
  hull.scale.set(1, 0.28, 1);
  const rim = mesh(new THREE.TorusGeometry(1.08, 0.08, 10, 48), new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.3 }));
  rim.rotation.x = Math.PI / 2;
  const dome = mesh(new THREE.SphereGeometry(0.45, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 0.4, transparent: true, opacity: 0.85 }));
  dome.position.y = 0.18;
  g.add(hull, rim, dome);
  const lights = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfde047, emissiveIntensity: 1 }));
    l.position.set(Math.cos(a) * 1.08, 0, Math.sin(a) * 1.08);
    g.add(l); lights.push(l);
  }
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.y = -1.05;
  g.add(beam);
  g.userData.animate = (t) => {
    g.rotation.y = t * 1.2;
    lights.forEach((l, k) => { l.material.emissiveIntensity = (Math.floor(t * 8) + k) % 3 === 0 ? 2 : 0.4; });
  };
  return g;
}

function raidersScene(scene, world, look, robotConfig) {
  const W = RW, H = RH;
  const HOVER = 0.9;
  const at = (x, y, h = 0) => new THREE.Vector3((x - W / 2) / S, h, (y - H / 2) / S);
  scene.background = new THREE.Color(0x070320);
  scene.fog = new THREE.Fog(0x170b3b, 14, 46);
  // Sky: stars, a huge ringed planet, a moon
  const rnd = mulberry(42);
  const pts = [];
  for (let i = 0; i < 1500; i++) {
    const a = rnd() * Math.PI * 2, e = rnd() * 1.2 + 0.05, r = 60;
    pts.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r - 10);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, fog: false })));
  const planet = new THREE.Mesh(new THREE.SphereGeometry(9, 48, 32), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x4c1d95, emissiveIntensity: 0.5, roughness: 0.9, fog: false }));
  planet.position.set(-14, 9, -38);
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 15, 64), new THREE.MeshBasicMaterial({ color: 0xf0abfc, transparent: true, opacity: 0.45, side: THREE.DoubleSide, fog: false }));
  ring.position.copy(planet.position); ring.rotation.set(1.25, 0.2, 0.3);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 24), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 1, fog: false }));
  moon.position.set(17, 13, -34);
  scene.add(planet, ring, moon);
  // Alien planet surface with glowing grid and crystals
  const gc = document.createElement('canvas'); gc.width = 512; gc.height = 512;
  const gx = gc.getContext('2d');
  gx.fillStyle = '#1e0b3d'; gx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) { gx.fillStyle = `rgba(0,0,0,${0.12 + rnd() * 0.2})`; gx.beginPath(); gx.arc(rnd() * 512, rnd() * 512, 6 + rnd() * 30, 0, Math.PI * 2); gx.fill(); }
  gx.strokeStyle = 'rgba(167,139,250,0.35)'; gx.lineWidth = 2;
  for (let k = 0; k <= 512; k += 64) { gx.beginPath(); gx.moveTo(k, 0); gx.lineTo(k, 512); gx.stroke(); gx.beginPath(); gx.moveTo(0, k); gx.lineTo(512, k); gx.stroke(); }
  const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
  gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(8, 8);
  const ground = mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ map: gt, roughness: 0.9 }), { cast: false });
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  for (let i = 0; i < 40; i++) {
    const side = i % 2 ? 1 : -1;
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.3 + rnd() * 0.6, 0), glowMat([0x22d3ee, 0xa855f7, 0xf472b6][i % 3], 0.6, { transparent: true, opacity: 0.9 }));
    c.position.set(side * (9.5 + rnd() * 12), 0.3, -14 + rnd() * 24);
    c.scale.y = 1.6 + rnd();
    c.rotation.y = rnd() * 3;
    c.castShadow = true;
    scene.add(c);
  }
  // Glowing boundary rails and the "landing line" the raiders must not cross
  const rail = (x) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, H / S + 1), glowMat(0x22d3ee, 1.2));
    r.position.set(x, 0.05, 0);
    scene.add(r);
  };
  rail(-W / S / 2 - 0.2); rail(W / S / 2 + 0.2);
  const landing = new THREE.Mesh(new THREE.BoxGeometry(W / S + 0.4, 0.04, 0.06), glowMat(0xef4444, 1));
  landing.position.copy(at(W / 2, 392, 0.03));
  scene.add(landing);

  // Armada
  const make = { A: blobAlien, B: crabAlien, C: squidAlien };
  const aliens = world.raiders.map((a) => { const g = make[a.kind](ALIEN_COL[a.kind]); g.scale.setScalar(a.kind === 'C' ? 1.35 : 1.3); scene.add(g); return g; });
  const mother = world.mother ? motherShip() : null;
  if (mother) scene.add(mother);
  // Crystal shield walls (each chunk is a little glowing block)
  const shieldMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.15, 0.55, 0.15), glowMat(0x22d3ee, 0.5, { transparent: true, opacity: 0.85, metalness: 0.3 }), Math.max(1, world.shields.length));
  const m4 = new THREE.Matrix4();
  world.shields.forEach((c, i) => { const p = at(c.x + c.w / 2, c.y + c.h / 2, 0.28); shieldMesh.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z)); });
  shieldMesh.castShadow = true;
  scene.add(shieldMesh);
  let shieldHash = '';
  // Player starfighter (nose towards the raiders)
  const ship = robotModel(robotConfig, 1.2);
  scene.add(ship);
  const engineLight = new THREE.PointLight(0xfb923c, 3, 3);
  scene.add(engineLight);
  // Projectiles and explosions
  const boltMat = glowMat(0x67e8f9, 2.2);
  const plasmaMat = glowMat(0xa3e635, 1.6);
  const zapPool = [], plasmaPool = [], sparkPool = [];
  const pool = (arr, n, mk) => { while (arr.length < n) { const m = mk(); scene.add(m); arr.push(m); } };
  const zapLight = new THREE.PointLight(0x67e8f9, 0, 4);
  scene.add(zapLight);
  const boomLight = new THREE.PointLight(0xfde047, 0, 6);
  scene.add(boomLight);
  const sparks = [];
  const seenPops = new WeakSet();
  let shake = 0;
  let lastLives = world.lives;
  let lastT = 0;

  return {
    focus: () => ship.position,
    update(w, t) {
      const dt = Math.min(0.05, Math.max(0, t - lastT)); lastT = t;
      w.raiders.forEach((a, i) => {
        const g = aliens[i];
        g.visible = a.hp > 0;
        if (!g.visible) return;
        g.position.copy(at(a.x, a.y, HOVER + Math.sin(t * 2.5 + i * 0.7) * 0.08));
        g.userData.animate?.(w.frame, t, i);
        if (g.userData.helmet) g.userData.helmet.forEach((m) => { m.visible = a.hp > 1; });
      });
      if (mother) {
        mother.visible = w.mother.alive && w.mother.wait <= 0;
        mother.position.copy(at(w.mother.x, 46, 1.8));
        mother.userData.animate(t);
      }
      const hash = w.shields.map((c) => (c.hp > 0 ? 1 : 0)).join('');
      if (hash !== shieldHash) {
        shieldHash = hash;
        w.shields.forEach((c, i) => {
          const p = at(c.x + c.w / 2, c.y + c.h / 2, 0.28);
          const k = c.hp > 0 ? 1 : 0;
          shieldMesh.setMatrixAt(i, m4.makeScale(k, k, k).setPosition(p.x, p.y, p.z));
        });
        shieldMesh.instanceMatrix.needsUpdate = true;
      }
      // Ship: banks as it slides, flashes when hit
      const target = at(w.ship.x, SHIP_Y, 0.35 + Math.sin(t * 3) * 0.05);
      const vx = target.x - ship.position.x;
      ship.position.copy(target);
      ship.rotation.set(0, Math.PI, Math.max(-0.5, Math.min(0.5, -vx * 6)));
      ship.visible = w.safeT > 0 ? Math.floor(t * 10) % 2 === 0 : true;
      engineLight.position.set(ship.position.x, 0.6, ship.position.z + 0.8);
      if (w.lives < lastLives) { shake = 0.5; }
      lastLives = w.lives;
      // Laser bolts
      pool(zapPool, w.zaps.length, () => new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.5, 4, 8), boltMat));
      zapPool.forEach((m, i) => {
        const z = w.zaps[i];
        m.visible = !!z;
        if (z) { m.position.copy(at(z.x, z.y, 0.55)); m.rotation.x = Math.PI / 2; }
      });
      zapLight.intensity = w.zaps.length ? 4 : 0;
      if (w.zaps[0]) zapLight.position.copy(at(w.zaps[0].x, w.zaps[0].y, 0.8));
      // Plasma bombs
      pool(plasmaPool, w.bombs.length, () => new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), plasmaMat));
      plasmaPool.forEach((m, i) => {
        const b = w.bombs[i];
        m.visible = !!b;
        if (b) {
          const k = Math.min(1, (b.y - 100) / (SHIP_Y - 100));
          m.position.copy(at(b.x, b.y, HOVER * (1 - Math.max(0, k)) + 0.3));
          m.rotation.set(t * 5, t * 3, 0);
        }
      });
      // New explosions → bursts of sparks
      w.pops.forEach((q) => {
        if (seenPops.has(q)) return;
        seenPops.add(q);
        const col = q.kind === 'hit' ? 0xf97316 : q.kind === 'M' ? 0xfde047 : ALIEN_COL[q.kind] || 0xffffff;
        const c = at(q.x, q.y, q.kind === 'hit' ? 0.4 : q.kind === 'M' ? 1.8 : HOVER);
        for (let k = 0; k < (q.kind === 'M' ? 40 : 18); k++) {
          const dir = new THREE.Vector3(rnd() - 0.5, rnd() - 0.2, rnd() - 0.5).normalize().multiplyScalar(2 + rnd() * 3);
          sparks.push({ p: c.clone(), v: dir, life: 0.6 + rnd() * 0.4, col });
        }
        boomLight.color.set(col); boomLight.position.copy(c); boomLight.intensity = 8;
      });
      boomLight.intensity = Math.max(0, boomLight.intensity - dt * 30);
      sparks.forEach((s) => { s.life -= dt; s.v.y -= 4 * dt; s.p.addScaledVector(s.v, dt); });
      for (let k = sparks.length - 1; k >= 0; k--) if (sparks[k].life <= 0) sparks.splice(k, 1);
      pool(sparkPool, sparks.length, () => new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), new THREE.MeshBasicMaterial({ transparent: true })));
      sparkPool.forEach((m, i) => {
        const s = sparks[i];
        m.visible = !!s;
        if (!s) return;
        m.position.copy(s.p);
        m.material.color.set(s.col);
        m.material.opacity = Math.min(1, s.life * 2);
        m.rotation.set(t * 9, t * 7, 0);
      });
      shake = Math.max(0, shake - dt);
    },
    // Chase camera behind the starfighter, looking out at the armada
    cam(camera, mode, t) {
      const sx = ship.position.x;
      const j = shake > 0 ? (Math.random() - 0.5) * shake * 0.6 : 0;
      if (mode === 'top') { camera.position.lerp(new THREE.Vector3(0, 17, 1.5), 0.1); camera.lookAt(0, 0, 0); return true; }
      if (mode === 'follow') {
        camera.position.lerp(new THREE.Vector3(sx, 1.7, 8.2), 0.12);
        camera.lookAt(sx, 1.0, 0);
      } else {
        camera.position.lerp(new THREE.Vector3(sx * 0.4, 4.6, 11.2), 0.08);
        camera.lookAt(sx * 0.25, 0.4, -1.8);
      }
      camera.position.x += j; camera.position.y += j;
      return true;
    },
    camera: { pos: [0, 4.6, 11.2], look: [0, 0.4, -1.8], fov: 55 },
  };
}

/* ─── Arena Quest / Arena Maker: themed tile worlds ─── */
export function ladybug() {
  const g = new THREE.Group();
  const shell = mesh(new THREE.SphereGeometry(0.32, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), stdMat(0xef4444, 0.3, 0.1));
  shell.scale.set(1, 0.8, 1.2);
  const head = mesh(new THREE.SphereGeometry(0.15, 14, 10), stdMat(0x111827, 0.5));
  head.position.set(0, 0.1, 0.36);
  g.add(shell, head);
  [[0.12, 0.2, 0.1], [-0.12, 0.2, 0.1], [0.16, 0.12, -0.15], [-0.16, 0.12, -0.15], [0, 0.25, -0.05]].forEach(([x, y, z]) => {
    const spot = mesh(new THREE.SphereGeometry(0.06, 8, 6), stdMat(0x111827, 0.5));
    spot.position.set(x, y, z); g.add(spot);
  });
  [-0.06, 0.06].forEach((x) => { const e = mesh(new THREE.SphereGeometry(0.04, 8, 6), stdMat(0xffffff, 0.3)); e.position.set(x, 0.16, 0.48); g.add(e); });
  return g;
}

/** Floor and wall materials for an arena, taken from its world's own surfaces. */
const PATH_TO_SURFACE = { cobble: 'cobble', wood: 'wood', boardwalk: 'wood', tiles: 'tiles', checker: 'tiles', glow: 'grid', stripes: 'carpet', rainbow: 'carpet' };
const WALLS = {
  grass: { wall: 'hedge' },
  wood: { kind: 'wood', color: 0x9a6a3c, alt: 0x7a5230, cap: 0xf3d3a3 },
  stone: { kind: 'cobble', color: 0xb8b2aa, alt: 0x8f8a84, cap: 0xd6d3d1 },
  sand: { kind: 'cobble', color: 0xe2c27e, alt: 0xc9a25e, cap: 0xfde68a },
  metal: { kind: 'grid', color: 0x64748b, alt: 0x94a3b8, cap: 0x22d3ee, glow: true, metal: 0.5 },
  snow: { kind: 'speck', color: 0xcfe8ff, alt: 0xa5d4ff, cap: 0xffffff, opacity: 0.9, rough: 0.2 },
  candy: { kind: 'tiles', color: 0xf472b6, alt: 0xfbcfe8, cap: 0xffffff },
  seabed: { kind: 'cobble', color: 0x2aa198, alt: 0x0e7490, cap: 0xfda4af },
  dirt: { kind: 'cobble', color: 0x8b8580, alt: 0x6b6560, cap: 0xfbbf24 },
  lava: { kind: 'cobble', color: 0x44403c, alt: 0x292524, cap: 0xf97316, glow: true },
  space: { kind: 'grid', color: 0x334155, alt: 0x5ce1ff, cap: 0x5ce1ff, glow: true, metal: 0.4 },
  stage: { kind: 'grid', color: 0x312e81, alt: 0xf472b6, cap: 0xf472b6, glow: true },
  tile: { kind: 'tiles', color: 0x93c5fd, alt: 0xdbeafe, cap: 0xffffff },
  crystal: { kind: 'speck', color: 0xa78bfa, alt: 0xf0abfc, cap: 0xf0abfc, glow: true, rough: 0.2 },
};
export function boardLook(T, rc) {
  const path = rc.path || {};
  // Lava is orange-red, so a floor in those colours would hide the danger: calm it towards stone grey
  const safe = (hex) => {
    const c = new THREE.Color(hex);
    const hsl = c.getHSL({});
    return (hsl.h < 0.11 || hsl.h > 0.94) && hsl.s > 0.45 ? c.lerp(new THREE.Color(0x6b6b6b), 0.75).getHex() : hex;
  };
  const floorMap = surfaceTexture(PATH_TO_SURFACE[path.kind] ?? 'speck', safe(path.color ?? T.floorA), safe(path.edge ?? T.floorB));
  const w = WALLS[T.board] || WALLS.stone;
  return {
    floorMap,
    floorRough: path.glow ? 0.5 : 0.85,
    floorMetal: path.metal ?? 0.02,
    floorGlow: path.glow ?? null,
    wall: w.wall,
    wallMap: w.wall ? null : surfaceTexture(w.kind, w.color, w.alt),
    wallRough: w.rough ?? 0.8,
    wallMetal: w.metal ?? 0.05,
    wallOpacity: w.opacity ?? 1,
    cap: w.cap ?? T.wallTop,
    capGlow: !!w.glow,
  };
}

function arenaScene(scene, world, look, robotConfig) {
  const T = themeFor(world.theme);
  const W = world.W, H = world.H;
  const K = 2.4; // one square = 2.4 world units, so the arena matches the scale of Studio worlds
  const board = new THREE.Group();
  board.scale.setScalar(K);
  board.position.y = 0.05;
  scene.add(board);
  const cell = (x, y, h = 0) => new THREE.Vector3(x - (W - 1) / 2, h, y - (H - 1) / 2);
  const rnd = mulberry(5);

  // ── The surrounding world: the same builder the pre-built Studio arenas use ──
  const halfW = (W * K) / 2, halfH = (H * K) / 2, margin = K * 0.6;
  const pts = [];
  const lanes = Math.max(2, Math.ceil((H * K - 2 * margin) / 3.8) + 1);
  for (let i = 0; i < lanes; i++) {
    const z = -halfH + margin + ((H * K - 2 * margin) * i) / (lanes - 1);
    const l = -halfW + margin, r = halfW - margin;
    const xs = i % 2 ? [r, (l + r) / 2, l] : [l, (l + r) / 2, r];
    xs.forEach((x) => pts.push(new THREE.Vector3(x, 0, z)));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  let themed = false;
  try {
    themed = installMissionTheme(scene, curve, { id: T.recipe, title: world.arena?.name || 'Arena' }, { noTasks: true });
  } catch { themed = false; }
  if (!themed) {
    scene.background = new THREE.Color(T.sky);
    scene.fog = new THREE.Fog(T.sky, 60, 160);
    const ground = mesh(new THREE.CircleGeometry(120, 48), stdMat(T.floorB, 0.95), { cast: false });
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.1;
    scene.add(ground);
  }
  // Bigger world → bigger sun shadow
  scene.traverse((o) => {
    if (o.isDirectionalLight) {
      o.position.set(halfW * 0.6, 40, halfH * 0.9);
      Object.assign(o.shadow.camera, { left: -halfW - 6, right: halfW + 6, top: halfH + 6, bottom: -halfH - 6, near: 1, far: 120 });
      o.shadow.camera.updateProjectionMatrix();
      o.shadow.bias = -0.0015;
      o.shadow.normalBias = 0.06;
    }
  });

  // ── The arena board: built from the same materials as the world around it ──
  const rc = MISSION_THEME_RECIPES[T.recipe] || {};
  const accent = rc.accent ?? T.wallTop;
  const style = boardLook(T, rc);
  const beams = [];
  const k = (x, y) => `${x},${y}`;
  const floorCells = [], wallCells = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (world.props.has(k(x, y))) floorCells.push([x, y]);
    else (world.walls.has(k(x, y)) ? wallCells : floorCells).push([x, y]);
  }
  // A low kerb in the world's accent colour edges the arena, like the prebuilt routes
  const kerb = mesh(new THREE.BoxGeometry(W + 0.24, 0.1, H + 0.24), stdMat(accent, 0.5, 0.1, { emissive: accent, emissiveIntensity: T.glow ? 0.35 : 0.12 }), { cast: false });
  kerb.position.y = -0.02;
  board.add(kerb);
  const m4 = new THREE.Matrix4();
  // Floor: the world's path surface, two soft shades so the squares stay easy to count
  const floorGeo = new THREE.BoxGeometry(0.97, 0.08, 0.97);
  const floorMat = (k2) => new THREE.MeshStandardMaterial({
    map: style.floorMap, color: new THREE.Color(0xffffff).multiplyScalar(k2), roughness: style.floorRough, metalness: style.floorMetal,
    ...(style.floorGlow ? { emissive: style.floorGlow, emissiveMap: style.floorMap, emissiveIntensity: 0.25 } : {}),
  });
  const floorA = new THREE.InstancedMesh(floorGeo, floorMat(1), Math.max(1, floorCells.length));
  const floorB = new THREE.InstancedMesh(floorGeo, floorMat(0.9), Math.max(1, floorCells.length));
  let na = 0, nb = 0;
  floorCells.forEach(([x, y]) => { const p = cell(x, y, 0.04); if ((x + y) % 2) floorA.setMatrixAt(na++, m4.makeTranslation(p.x, p.y, p.z)); else floorB.setMatrixAt(nb++, m4.makeTranslation(p.x, p.y, p.z)); });
  floorA.count = na; floorB.count = nb;
  floorA.receiveShadow = floorB.receiveShadow = true;
  board.add(floorA, floorB);
  // Walls: hedges in green worlds, otherwise blocks of the world's own stone, ice, coral, panels…
  const hedge = style.wall === 'hedge';
  const wallH = hedge ? 0.75 : 0.7;
  const wallMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.98, wallH, 0.98),
    hedge ? stdMat(T.wall, 0.9, 0.05, { flatShading: true })
      : new THREE.MeshStandardMaterial({
        map: style.wallMap, roughness: style.wallRough, metalness: style.wallMetal, transparent: style.wallOpacity < 1, opacity: style.wallOpacity,
        ...(style.capGlow ? { emissive: style.cap, emissiveMap: style.wallMap, emissiveIntensity: 0.18 } : {}),
      }),
    Math.max(1, wallCells.length));
  // Block walls get a thin trim line round the top instead of a flat lid that hides the material
  const capMesh = new THREE.InstancedMesh(hedge ? new THREE.IcosahedronGeometry(0.42, 1) : new THREE.BoxGeometry(1.0, 0.035, 1.0),
    stdMat(style.cap, 0.6, 0.1, { ...(style.capGlow ? { emissive: style.cap, emissiveIntensity: 0.45 } : {}), ...(hedge ? { flatShading: true } : {}) }), Math.max(1, wallCells.length));
  wallCells.forEach(([x, y], i) => {
    const p = cell(x, y, wallH / 2);
    wallMesh.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z));
    capMesh.setMatrixAt(i, hedge ? m4.compose(new THREE.Vector3(p.x, 0.8, p.z), new THREE.Quaternion(), new THREE.Vector3(1.15, 0.6, 1.15)) : m4.makeTranslation(p.x, wallH * 0.55, p.z));
  });
  wallMesh.count = capMesh.count = wallCells.length;
  wallMesh.castShadow = true; wallMesh.receiveShadow = true; capMesh.castShadow = true;
  board.add(wallMesh, capMesh);
  // Start pad, like the glowing start pads of the prebuilt arenas
  {
    const [sx, sy] = world.start;
    const sp = new THREE.Group();
    const disc = mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.04, 28), new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 0.45 }), { cast: false });
    disc.position.y = 0.1;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.035, 8, 32), new THREE.MeshBasicMaterial({ color: accent }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.13;
    sp.add(disc, ring);
    sp.position.copy(cell(sx, sy, 0));
    board.add(sp);
  }
  // Decoration tiles use real props from the theme (a sunflower, a rocket, a cupcake…)
  [...world.props].forEach((key, i) => {
    const [x, y] = key.split(',').map(Number);
    const name = T.props[i % T.props.length];
    let obj = null;
    try { obj = MISSION_PROPS[name]?.(rnd, {}); } catch { obj = null; }
    if (!obj) obj = tree(0.4);
    const box3 = new THREE.Box3().setFromObject(obj);
    const foot = Math.max(box3.max.x - box3.min.x, box3.max.z - box3.min.z) || 1;
    const tall = (box3.max.y - box3.min.y) || 1;
    const sc = Math.min(0.92 / foot, 1.7 / tall);
    obj.scale.multiplyScalar(sc);
    obj.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    const holder = new THREE.Group();
    holder.add(obj);
    holder.position.copy(cell(x, y, 0));
    holder.rotation.y = (i % 4) * (Math.PI / 2);
    const pad = mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.06, 20), stdMat(T.floorB, 0.8));
    pad.position.y = 0.03;
    holder.add(pad);
    board.add(holder);
  });
  // Lava, ice, bounce pads
  const lavaMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1 });
  const lavaTiles = new Map();
  world.lava.forEach((key) => { const [x, y] = key.split(',').map(Number); const l = new THREE.Mesh(new THREE.BoxGeometry(0.97, 0.08, 0.97), lavaMat); l.position.copy(cell(x, y, 0.02)); board.add(l); lavaTiles.set(key, l); });
  world.ice.forEach((key) => { const [x, y] = key.split(',').map(Number); const ice = mesh(new THREE.BoxGeometry(0.97, 0.06, 0.97), new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.92 }), { cast: false }); ice.position.copy(cell(x, y, 0.03)); board.add(ice); });
  world.pads.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const pg = new THREE.Group();
    const base = mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.1, 24), stdMat(0x334155, 0.5, 0.4)); base.position.y = 0.05;
    const top = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.7 })); top.position.y = 0.13;
    const coil = mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 18), stdMat(0xe2e8f0, 0.3, 0.8)); coil.rotation.x = Math.PI / 2; coil.position.y = 0.17;
    pg.add(base, top, coil); pg.position.copy(cell(x, y, 0)); board.add(pg);
  });
  // Items
  const gems = new Map(), keys = new Map(), doors = new Map(), coins = new Map();
  world.gems.forEach((key) => { const [x, y] = key.split(',').map(Number); const gm = mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.8, metalness: 0.3, roughness: 0.15 })); gm.position.copy(cell(x, y, 0.45)); board.add(gm); gems.set(key, gm); });
  const coinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.4, metalness: 0.8, roughness: 0.25 });
  world.coins.forEach((key) => { const [x, y] = key.split(',').map(Number); const c = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 22), coinMat); c.rotation.x = Math.PI / 2; c.position.copy(cell(x, y, 0.4)); board.add(c); coins.set(key, c); });
  world.keys.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const kg = new THREE.Group();
    const gold = stdMat(0xfacc15, 0.25, 0.9);
    const ring = mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 16), gold); ring.position.x = -0.12;
    const shaft = mesh(new THREE.BoxGeometry(0.28, 0.05, 0.05), gold); shaft.position.x = 0.08;
    const tooth = mesh(new THREE.BoxGeometry(0.05, 0.1, 0.05), gold); tooth.position.set(0.18, -0.06, 0);
    kg.add(ring, shaft, tooth); kg.position.copy(cell(x, y, 0.45)); board.add(kg); keys.set(key, kg);
  });
  world.doors.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const dg = new THREE.Group();
    const slab = mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), stdMat(0x92400e, 0.7)); slab.position.y = 0.45;
    const band = mesh(new THREE.BoxGeometry(0.94, 0.12, 0.94), stdMat(0xfacc15, 0.3, 0.8)); band.position.y = 0.5;
    const lock = mesh(new THREE.BoxGeometry(0.2, 0.22, 0.96), stdMat(0xfacc15, 0.3, 0.8)); lock.position.y = 0.42;
    dg.add(slab, band, lock); dg.position.copy(cell(x, y, 0)); board.add(dg); doors.set(key, dg);
  });
  world.flags.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const fg = new THREE.Group();
    const pole = mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 8), stdMat(0xe2e8f0, 0.3, 0.7)); pole.position.y = 0.7;
    const c = document.createElement('canvas'); c.width = 64; c.height = 48; const cx = c.getContext('2d');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { cx.fillStyle = (i + j) % 2 ? '#111' : '#fff'; cx.fillRect(i * 16, j * 16, 16, 16); }
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const cloth = mesh(new THREE.PlaneGeometry(0.6, 0.42), new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide })); cloth.position.set(0.31, 1.18, 0);
    const pad = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.5 })); pad.position.y = 0.02;
    // A tall light beam marks the goal from anywhere, like the prebuilt arenas
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 6, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff7c2, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    beam.position.y = 3;
    beams.push(beam);
    fg.add(pole, cloth, pad, beam); fg.position.copy(cell(x, y, 0)); board.add(fg);
  });
  const portals = world.portals.map(([x, y], i) => {
    const pg = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 10, 28), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xa855f7 : 0x22d3ee, emissive: i % 2 ? 0x9333ea : 0x0891b2, emissiveIntensity: 1.2 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.06;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xd8b4fe : 0xa5f3fc, transparent: true, opacity: 0.6 }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.05;
    pg.add(ring, disc); pg.position.copy(cell(x, y, 0)); board.add(pg);
    return pg;
  });
  const cratePool = [];
  const crateMat = stdMat(0xb45309, 0.8);
  const bugs = world.bugs.map(() => { const b = ladybug(); board.add(b); return b; });
  const bot = robotModel(robotConfig, 0.78);
  board.add(bot);
  const dirRotA = (d) => [Math.PI / 2, 0, -Math.PI / 2, Math.PI][d];
  const sparkles = [];
  const seen = new WeakSet();
  let last = 0;
  const tmpV = new THREE.Vector3();

  // Indoor worlds have a ceiling, so the camera stays low with a wider lens
  const camera = MISSION_THEME_RECIPES[T.recipe]?.room
    ? { pos: [0.3 * K, 14, halfH + 13], look: [0.3 * K, 0, 0.8 * K], fov: 56 }
    : { pos: [0.3 * K, (Math.max(W, H) * 0.72 + 3) * K, (H * 0.72 + 4.5) * K], look: [0.3 * K, 0, 0.6 * K] };
  // World scenery between the camera and the arena (a rocket, a tree…) would hide the board: tuck it away
  const themeRoot = scene.userData.missionThemeRoot;
  if (themed && themeRoot) {
    const eye = new THREE.Vector3(...camera.pos);
    const targets = [[0, 0], [-halfW, -halfH], [halfW, -halfH], [-halfW, halfH], [halfW, halfH], [0, halfH], [0, -halfH]]
      .map(([x, z]) => new THREE.Vector3(x, 0.5, z));
    const ray = new THREE.Ray();
    const box = new THREE.Box3();
    themeRoot.updateMatrixWorld(true);
    const hitsView = () => targets.some((t) => {
      ray.origin.copy(eye);
      ray.direction.copy(t).sub(eye).normalize();
      const hit = ray.intersectBox(box, tmpV);
      return hit && hit.distanceTo(eye) < t.distanceTo(eye) - 1;
    });
    const im4 = new THREE.Matrix4();
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    /** Instanced scenery (rows of desks, shelves…) is one mesh: hide just the copies in the way. */
    const clearInstances = (o) => {
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      let changed = false;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, im4);
        box.copy(o.geometry.boundingBox).applyMatrix4(im4).applyMatrix4(o.matrixWorld);
        if (hitsView()) { o.setMatrixAt(i, zero); changed = true; }
      }
      if (changed) o.instanceMatrix.needsUpdate = true;
    };
    const blocks = (o) => {
      box.setFromObject(o);
      if (box.isEmpty()) return false;
      return targets.some((t) => {
        ray.origin.copy(eye);
        ray.direction.copy(t).sub(eye).normalize();
        const hit = ray.intersectBox(box, tmpV);
        return hit && hit.distanceTo(eye) < t.distanceTo(eye) - 1;
      });
    };
    // Scenery comes in groups (every desk, every tree…): hide only the pieces actually in the way
    const visit = (o, depth) => {
      if (!o.visible || /ground|sky|room|wall|floor|ceil|dome/i.test(o.name || '') || !blocks(o)) return;
      const size = box.getSize(new THREE.Vector3());
      if (o.isInstancedMesh) clearInstances(o);
      else if (o.children.length && depth < 5 && Math.max(size.x, size.z) > 6) o.children.forEach((c) => visit(c, depth + 1));
      else if (Math.max(size.x, size.z) < 60) o.visible = false;
    };
    themeRoot.children.forEach((o) => visit(o, 0));
  }

  return {
    focus: () => bot.getWorldPosition(tmpV),
    update(w, t) {
      const dt = Math.min(0.05, Math.max(0, t - last)); last = t;
      lavaMat.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.3;
      beams.forEach((bm) => { bm.material.opacity = 0.11 + Math.sin(t * 2.5) * 0.04; });
      lavaTiles.forEach((l, key) => { l.visible = w.lava.has(key); });
      gems.forEach((g, key) => { g.visible = w.gems.has(key); g.rotation.y = t * 2; g.position.y = 0.45 + Math.sin(t * 3 + g.position.x) * 0.06; });
      coins.forEach((c, key) => { c.visible = w.coins.has(key); c.rotation.z = t * 3; });
      keys.forEach((g, key) => { g.visible = w.keys.has(key); g.rotation.y = t * 1.5; });
      doors.forEach((g, key) => { g.visible = w.doors.has(key); });
      portals.forEach((p, i) => { p.children[0].rotation.z = t * (i % 2 ? -2 : 2); });
      const crates = [...w.crates];
      while (cratePool.length < crates.length) { const c = mesh(new THREE.BoxGeometry(0.82, 0.82, 0.82), crateMat); board.add(c); cratePool.push(c); }
      cratePool.forEach((c, i) => { c.visible = i < crates.length; if (c.visible) { const [x, y] = crates[i].split(',').map(Number); c.position.copy(cell(x, y, 0.41)); } });
      w.bugs.forEach((b, i) => {
        const g = bugs[i];
        const a = b.anim;
        g.position.copy(cell(b.px + (b.x - b.px) * a, b.py + (b.y - b.py) * a, 0));
        g.rotation.y = dirRotA(b.axis === 0 ? (b.sign > 0 ? 0 : 2) : (b.sign > 0 ? 1 : 3));
      });
      const a = w.anim;
      const ease = a * a * (3 - 2 * a);
      const px = w.p.px + (w.p.x - w.p.px) * ease, py = w.p.py + (w.p.y - w.p.py) * ease;
      const hop = w.jumpT > 0 && a < 1 ? Math.sin(a * Math.PI) * 0.9 : 0;
      bot.position.copy(cell(px, py, hop));
      bot.rotation.y = dirRotA(w.p.dir);
      bot.visible = w.safeT > 0 ? Math.floor(t * 10) % 2 === 0 : true;
      w.pops.forEach((q) => {
        if (seen.has(q)) return;
        seen.add(q);
        if (q.kind === 'bonk' || q.kind === 'needgems') return;
        const col = q.kind === 'gem' ? 0x22d3ee : q.kind === 'coin' || q.kind === 'key' || q.kind === 'door' ? 0xfacc15 : q.kind === 'portal' ? 0xa855f7 : q.kind === 'hurt' ? 0xef4444 : q.kind === 'pad' ? 0x22c55e : q.kind === 'bridge' ? 0xf97316 : 0xffffff;
        for (let s = 0; s < 14; s++) sparkles.push({ p: cell(q.x, q.y, 0.5), v: new THREE.Vector3(rnd() - 0.5, rnd() * 1.2, rnd() - 0.5).multiplyScalar(3), life: 0.7, col });
      });
      sparkles.forEach((s) => { s.life -= dt; s.v.y -= 5 * dt; s.p.addScaledVector(s.v, dt); });
      for (let s = sparkles.length - 1; s >= 0; s--) if (sparkles[s].life <= 0) sparkles.splice(s, 1);
      while ((board.userData.sp ||= []).length < sparkles.length) { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), new THREE.MeshBasicMaterial({ transparent: true })); board.add(m); board.userData.sp.push(m); }
      board.userData.sp.forEach((m, i) => { const s = sparkles[i]; m.visible = !!s; if (s) { m.position.copy(s.p); m.material.color.set(s.col); m.material.opacity = s.life * 1.4; } });
    },
    camera,
  };
}

function snakeScene(scene, world, look) {
  const COLS = 20, ROWS = 15, CELL = 32, W = COLS * CELL, H = ROWS * CELL;
  scene.background = new THREE.Color(0xa5dcff);
  scenery(scene, W, H, { ground: 0x7cc35a });
  // Checkerboard lawn
  const c = document.createElement('canvas'); c.width = COLS * 16; c.height = ROWS * 16;
  const x = c.getContext('2d');
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) { x.fillStyle = (i + j) % 2 ? '#a3d977' : '#b6e58d'; x.fillRect(i * 16, j * 16, 16, 16); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter;
  const lawn = mesh(new THREE.PlaneGeometry(W / S, H / S), stdMat(0xffffff, 0.95, 0, { map: tex }), { cast: false });
  lawn.rotation.x = -Math.PI / 2; lawn.position.y = 0.01;
  scene.add(lawn);
  // Wooden fence around the edge
  const fenceMat = stdMat(0xc08552, 0.8);
  const fw = W / S, fh = H / S;
  [[0, -fh / 2 - 0.12, fw + 0.5, 0.18], [0, fh / 2 + 0.12, fw + 0.5, 0.18], [-fw / 2 - 0.12, 0, 0.18, fh + 0.5], [fw / 2 + 0.12, 0, 0.18, fh + 0.5]].forEach(([px, pz, sx, sz]) => {
    const rail = mesh(new THREE.BoxGeometry(sx, 0.12, sz), fenceMat);
    rail.position.set(px, 0.42, pz);
    scene.add(rail);
    const rail2 = rail.clone(); rail2.position.y = 0.22; scene.add(rail2);
  });
  for (let i = 0; i <= 20; i++) {
    [[-fw / 2 + (i / 20) * fw, -fh / 2 - 0.12], [-fw / 2 + (i / 20) * fw, fh / 2 + 0.12]].forEach(([px, pz]) => {
      const post = mesh(new THREE.BoxGeometry(0.14, 0.6, 0.14), fenceMat); post.position.set(px, 0.3, pz); scene.add(post);
    });
  }
  const cell = (cx, cy, y = 0) => new THREE.Vector3(((cx + 0.5) * CELL - W / 2) / S, y, ((cy + 0.5) * CELL - H / 2) / S);
  // Rocks
  const rockMat = stdMat(0x9ca3af, 0.9);
  const rnd = mulberry(11);
  world.walls.forEach((k) => {
    const [cx, cy] = k.split(',').map(Number);
    const r = mesh(new THREE.DodecahedronGeometry(0.36, 0), rockMat);
    r.position.copy(cell(cx, cy, 0.25));
    r.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    r.scale.set(1, 0.75, 1);
    scene.add(r);
  });
  // Apple
  const apple = new THREE.Group();
  const fruit = mesh(new THREE.SphereGeometry(0.3, 18, 14), stdMat(0xdc2626, 0.35, 0.05));
  const stem = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 6), stdMat(0x78350f));
  stem.position.y = 0.32;
  const leaf = mesh(new THREE.SphereGeometry(0.11, 8, 6), stdMat(0x16a34a));
  leaf.scale.set(1.4, 0.4, 0.7); leaf.position.set(0.12, 0.36, 0);
  apple.add(fruit, stem, leaf);
  scene.add(apple);
  // Snake parts (pooled)
  const segMatA = stdMat(look.primary, 0.45, 0.25);
  const segMatB = stdMat(new THREE.Color(look.primary).multiplyScalar(0.8), 0.45, 0.25);
  const segs = [];
  const head = new THREE.Group();
  const skull = mesh(new THREE.BoxGeometry(0.62, 0.42, 0.62), stdMat(look.primary, 0.4, 0.3));
  skull.position.y = 0.3;
  const visor = mesh(new THREE.BoxGeometry(0.5, 0.16, 0.06), stdMat(0x0f172a, 0.3));
  visor.position.set(0, 0.36, 0.32);
  const eyeMat = new THREE.MeshStandardMaterial({ color: look.led || '#5eead4', emissive: look.led || '#5eead4', emissiveIntensity: 1.4 });
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), eyeMat); e1.position.set(-0.12, 0.36, 0.36);
  const e2 = e1.clone(); e2.position.x = 0.12;
  const ant = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), stdMat(0x475569)); ant.position.set(0.14, 0.65, -0.1);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: look.accent, emissive: look.accent, emissiveIntensity: 1 }));
  bulb.position.set(0.14, 0.82, -0.1);
  head.add(skull, visor, e1, e2, ant, bulb);
  scene.add(head);

  return {
    focus: () => head.position,
    update(w, t) {
      const ap = w.apples[0];
      apple.visible = !!ap;
      if (ap) { apple.position.copy(cell(ap[0], ap[1], 0.32 + Math.sin(t * 4) * 0.06)); apple.rotation.y = t; }
      const k = w.anim;
      const prev = w.prevBody || w.body;
      const pos = (i) => {
        const cur = w.body[i];
        const from = (i === 0 ? prev[0] : prev[Math.min(i, prev.length - 1)]) || cur;
        return [from[0] + (cur[0] - from[0]) * k, from[1] + (cur[1] - from[1]) * k];
      };
      while (segs.length < w.body.length) {
        const s = mesh(new THREE.SphereGeometry(0.3, 16, 12), segs.length % 2 ? segMatB : segMatA);
        scene.add(s); segs.push(s);
      }
      segs.forEach((s, i) => {
        if (i === 0 || i >= w.body.length) { s.visible = false; return; }
        s.visible = true;
        const [cx, cy] = pos(i);
        const tScale = 1 - (i / Math.max(1, w.body.length)) * 0.35;
        s.scale.setScalar(tScale);
        s.position.copy(cell(cx, cy, 0.28 * tScale));
      });
      const [hx, hy] = pos(0);
      head.position.copy(cell(hx, hy, 0));
      head.rotation.y = [Math.PI / 2, 0, -Math.PI / 2, Math.PI][w.dir];
    },
    camera: { pos: [0.8, 14.5, 11.5], look: [0.8, 0, 0.9] },
  };
}

function jumpScene(scene, world, look, robotConfig, game) {
  const level = game.levels[world.level];
  scene.background = new THREE.Color(0x8bd7ff);
  scene.fog = new THREE.Fog(0x8bd7ff, 34, 78);
  const earthMat = stdMat(0x8b4a32, 0.96);
  const topMat = stdMat(0xa7e276, 0.9);
  const cloudMat = stdMat(0xffffff, 1, 0, { emissive: 0xffffff, emissiveIntensity: 0.18 });
  const trackEnd = level.goalX * 1.35;

  // Rounded hills and puffy clouds keep the course playful while leaving the
  // code-driven platforms easy to read.
  for (let i = 0; i < 7; i++) {
    const hill = mesh(new THREE.SphereGeometry(1, 18, 12), stdMat(i % 2 ? 0x7bd17a : 0x91df8c, 1), { cast: false });
    hill.scale.set(3.8 + (i % 3), 1.8 + (i % 2) * 0.4, 0.5);
    hill.position.set((i - 2.5) * 6.2, 0.55, -5 - (i % 2));
    scene.add(hill);
  }
  for (let i = 0; i < 5; i++) {
    const puff = cloud();
    puff.position.set((i - 2) * 8, 8 + (i % 2) * 1.3, -7);
    puff.scale.setScalar(0.8 + (i % 3) * 0.16);
    scene.add(puff);
  }
  (level.platforms || []).forEach(([from, to, height]) => {
    const width = Math.max(0.5, (to - from + 1) * 1.35);
    const x = (from + to) * 0.675;
    const y = height * 1.2;
    const block = mesh(new THREE.BoxGeometry(width, 0.62, 3.7), earthMat);
    block.position.set(x, y - 0.2, 0);
    scene.add(block);
    const grass = mesh(new THREE.BoxGeometry(width + 0.06, 0.16, 3.82), topMat);
    grass.position.set(x, y + 0.17, 0);
    scene.add(grass);
    // Bright little edge tiles give platforms a chunky, classic game feel.
    for (let tx = from; tx <= to; tx++) {
      const tile = mesh(new THREE.BoxGeometry(1.23, 0.08, 0.12), stdMat(tx % 2 ? 0x7fcf58 : 0x9add65, 0.9), { cast: false });
      tile.position.set(tx * 1.35, y + 0.27, 1.92);
      scene.add(tile);
    }
  });

  // Warm lava sits well below the route so each gap reads clearly from the
  // side view without looking like a hidden floor under the platforms.
  for (let i = 0; i <= level.goalX; i++) {
    const platform = (level.platforms || []).find(([a, b]) => i >= a && i <= b);
    if (platform) continue;
    const lava = mesh(new THREE.BoxGeometry(1.25, 0.12, 3.45), stdMat(0xf97316, 0.55, 0.08, { emissive: 0xea580c, emissiveIntensity: 0.42 }), { cast: false });
    lava.position.set(i * 1.35, -1.95, 0);
    scene.add(lava);
    const glow = mesh(new THREE.BoxGeometry(1.05, 0.05, 2.6), stdMat(0xfbbf24, 0.5, 0, { emissive: 0xf59e0b, emissiveIntensity: 0.55 }), { cast: false });
    glow.position.set(i * 1.35, -1.86, 0);
    scene.add(glow);
  }

  const coinObjects = (level.coins || []).map((x) => {
    const group = new THREE.Group();
    const ring = mesh(new THREE.TorusGeometry(0.31, 0.1, 10, 20), stdMat(0xffc928, 0.34, 0.12, { emissive: 0xf59e0b, emissiveIntensity: 0.25 }));
    ring.rotation.y = Math.PI / 2;
    group.add(ring);
    const glint = mesh(new THREE.SphereGeometry(0.075, 8, 6), stdMat(0xffffff, 0.25, 0, { emissive: 0xffffff, emissiveIntensity: 0.4 }));
    glint.position.set(0, 0.12, 0.08);
    group.add(glint);
    group.position.set(x * 1.35, 1.35 + ((level.platforms.find(([a, b]) => x >= a && x <= b)?.[2] || 0) * 1.2), 0);
    scene.add(group);
    return { x, group };
  });
  const keyObjects = (level.keys || []).map((x) => {
    const key = new THREE.Group();
    const bow = mesh(new THREE.TorusGeometry(0.19, 0.06, 8, 14), stdMat(0xfacc15, 0.3, 0.45, { emissive: 0xfacc15, emissiveIntensity: 0.3 }));
    key.add(bow);
    const shaft = mesh(new THREE.BoxGeometry(0.42, 0.08, 0.08), stdMat(0xfacc15, 0.3, 0.45));
    shaft.position.x = 0.25; key.add(shaft);
    key.position.set(x * 1.35, 1.45 + ((level.platforms.find(([a, b]) => x >= a && x <= b)?.[2] || 0) * 1.2), 0);
    scene.add(key);
    return { x, group: key };
  });
  const enemyObjects = (level.enemies || []).map((x) => {
    const bug = new THREE.Group();
    const shell = mesh(new THREE.SphereGeometry(0.43, 14, 10), stdMat(0xef4444, 0.5, 0.08));
    shell.scale.set(1.2, 0.72, 0.9); shell.position.y = 0.35;
    const face = mesh(new THREE.SphereGeometry(0.23, 12, 8), stdMat(0xf97316, 0.55));
    face.position.set(0.28, 0.31, 0.18);
    bug.add(shell, face);
    [-0.12, 0.12].forEach((dx) => {
      const eye = mesh(new THREE.SphereGeometry(0.055, 8, 6), stdMat(0xffffff));
      eye.position.set(0.42, 0.48, dx); bug.add(eye);
    });
    const y = (level.platforms.find(([a, b]) => x >= a && x <= b)?.[2] || 0) * 1.2 + 0.25;
    bug.position.set(x * 1.35, y, 0.05);
    scene.add(bug);
    return { x, group: bug };
  });
  const hazardObjects = (level.hazards || []).map((x) => {
    const spike = new THREE.Group();
    for (let j = -1; j <= 1; j++) {
      const tooth = mesh(new THREE.ConeGeometry(0.25, 0.52, 4), stdMat(0xfb7185, 0.62, 0.08, { emissive: 0xbe123c, emissiveIntensity: 0.12 }));
      tooth.position.set(j * 0.32, 0.23, 0); tooth.rotation.y = Math.PI / 4; spike.add(tooth);
    }
    const y = (level.platforms.find(([a, b]) => x >= a && x <= b)?.[2] || 0) * 1.2;
    spike.position.set(x * 1.35, y + 0.27, 0);
    scene.add(spike);
    return { x, group: spike };
  });
  const doors = (level.doors || []).map((x) => {
    const gate = new THREE.Group();
    const frameMat = stdMat(0x8b5cf6, 0.42, 0.16, { emissive: 0x4c1d95, emissiveIntensity: 0.22 });
    const postA = mesh(new THREE.BoxGeometry(0.17, 2.4, 0.18), frameMat); postA.position.x = -0.5;
    const postB = postA.clone(); postB.position.x = 0.5;
    const lintel = mesh(new THREE.BoxGeometry(1.17, 0.18, 0.18), frameMat); lintel.position.y = 1.2;
    gate.add(postA, postB, lintel);
    gate.position.set(x * 1.35, (level.platforms.find(([a, b]) => x >= a && x <= b)?.[2] || 0) * 1.2 + 0.25, -0.15);
    scene.add(gate);
    return { x, group: gate };
  });

  const flagPole = mesh(new THREE.CylinderGeometry(0.055, 0.07, 2.8, 10), stdMat(0xf8fafc, 0.45, 0.1));
  const goalHeight = (level.platforms.find(([a, b]) => level.goalX >= a && level.goalX <= b)?.[2] || 0) * 1.2;
  flagPole.position.set(level.goalX * 1.35, goalHeight + 1.4, -0.2);
  scene.add(flagPole);
  const flag = mesh(new THREE.BoxGeometry(1.05, 0.58, 0.08), stdMat(0xfb4f8b, 0.5, 0.05, { emissive: 0xdb2777, emissiveIntensity: 0.22 }));
  flag.position.set(level.goalX * 1.35 + 0.51, goalHeight + 2.27, -0.2);
  scene.add(flag);
  const star = mesh(new THREE.OctahedronGeometry(0.42, 0), stdMat(0xffd43b, 0.3, 0.16, { emissive: 0xffb800, emissiveIntensity: 0.75 }));
  star.position.set(level.goalX * 1.35 + 0.52, goalHeight + 2.27, -0.08);
  scene.add(star);

  const bot = robotModel({ ...robotConfig, chassisId: 'jumpbot', movementId: 'legs' }, 1.25);
  bot.rotation.y = Math.PI / 4;
  scene.add(bot);
  const shadow = mesh(new THREE.CircleGeometry(0.6, 24), new THREE.MeshBasicMaterial({ color: 0x263650, transparent: true, opacity: 0.2 }), { cast: false, receive: false });
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.035; scene.add(shadow);

  return {
    focus: () => bot.position,
    update(w, t) {
      bot.position.set(w.x * 1.35, w.y * 1.2 + 0.25, 0.1);
      bot.rotation.z = w.move ? Math.sin(t * 16) * 0.055 : Math.sin(t * 2) * 0.018;
      shadow.position.x = bot.position.x; shadow.scale.setScalar(w.move?.jump ? 0.76 : 1);
      coinObjects.forEach(({ x, group }) => { group.visible = w.coins.includes(x); group.rotation.y = Math.sin(t * 2 + x) * 0.24; });
      keyObjects.forEach(({ x, group }) => { group.visible = w.keys.includes(x); group.rotation.y = t * 1.4; });
      enemyObjects.forEach(({ x, group }) => { group.visible = w.enemies.includes(x); group.position.y = (level.platforms.find(([a, b]) => x >= a && x <= b)?.[2] || 0) * 1.2 + 0.25 + Math.abs(Math.sin(t * 5 + x)) * 0.07; });
      hazardObjects.forEach(({ x, group }) => { group.rotation.y = Math.sin(t * 2 + x) * 0.08; });
      doors.forEach(({ x, group }) => { group.visible = w.keys.length > 0 || w.x < x - 0.1; });
      star.rotation.y = t * 1.4;
    },
    cam(camera, mode) {
      const center = mode === 'wide' || mode === 'top' ? 0 : bot.position.x;
      const target = new THREE.Vector3(center, mode === 'top' ? 16 : 6.3, mode === 'top' ? 0.01 : 27);
      camera.position.lerp(target, 0.08);
      camera.lookAt(center, mode === 'top' ? 0 : 1.25, 0);
      return true;
    },
    camera: { pos: [0, 7, 30], look: [0, 1.3, 0], fov: 43 },
  };
}

const SCENES = { snakebot: snakeScene, pacbot: pacScene, brickbot: brickScene, hopbot: hopScene, raiderbot: raidersScene, jumpbot: jumpScene, arenaquest: arenaScene };

/**
 * Creates the 3D view inside `host`. Returns { update(world, t), setCamera(mode), dispose(), ok }.
 */
export function createArcadeView(host, game, world, look, robotConfig) {
  // Tablets, phones and Chromebooks: lower resolution, smaller shadows, no MSAA
  const device = getStudioDeviceProfile();
  const renderer = createSimWebGLRenderer({ antialias: !device.lowPower, lowPower: device.lowPower });
  if (!renderer) return { ok: false, update() {}, dispose() {}, setCamera() {} };
  const maxPR = device.lowPower ? Math.max(0.75, device.maxPixelRatio) : Math.min(1.75, window.devicePixelRatio || 1);
  renderer.setPixelRatio(maxPR);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight(0xffffff, 0x7fae5a, 1.15);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.1);
  sun.position.set(6, 14, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(device.lowPower ? 1024 : 2048, device.lowPower ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 });
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.fog = new THREE.Fog(0xcfeaff, 30, 70);

  const cfg = { ...robotConfig, primaryColor: look.primary, accentColor: look.accent };
  const view = (SCENES[game.id] || snakeScene)(scene, world, look, cfg, game);
  // Modes 11–50: each level gets its own colour world and lighting mood
  const tierLevel = game.levels?.[world?.level];
  if (tierLevel?.world != null) gradeArcadeScene(scene, game.id, tierLevel.world, tierLevel.mood);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  let camMode = 'wide';
  const camPos = new THREE.Vector3(...view.camera.pos);
  const camLook = new THREE.Vector3(...view.camera.look);
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  const resize = () => {
    const w = host.clientWidth || 640, h = host.clientHeight || 480;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on tall/narrow screens so the whole arena fits.
    const base = view.camera.fov || 42;
    camera.fov = w / h < 1.1 ? base + 16 : base;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const tmp = new THREE.Vector3();
  // Adaptive resolution: drop the pixel ratio when frames run slow, restore it when smooth
  const perf = { frames: 0, since: performance.now(), pr: maxPR };
  const minPR = device.lowPower ? 0.55 : 0.75;
  const adapt = () => {
    perf.frames++;
    const now = performance.now();
    if (now - perf.since < 2000) return;
    const fps = (perf.frames * 1000) / (now - perf.since);
    perf.frames = 0; perf.since = now;
    const next = fps < 45 ? Math.max(minPR, perf.pr - 0.1) : fps > 57 ? Math.min(maxPR, perf.pr + 0.05) : perf.pr;
    if (Math.abs(next - perf.pr) > 0.01) { perf.pr = next; renderer.setPixelRatio(next); resize(); }
  };

  return {
    ok: true,
    update(w, t) {
      adapt();
      view.update(w, t, game);
      const f = view.focus();
      if (view.cam && view.cam(camera, camMode, t)) {
        // scene drives its own camera
      } else if (camMode === 'follow') {
        tmp.set(f.x, 4.2, f.z + 5.2);
        camera.position.lerp(tmp, 0.08);
        camera.lookAt(f.x, 0.3, f.z);
      } else if (camMode === 'top') {
        camera.position.lerp(tmp.set(0, 16, 0.01), 0.1);
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.lerp(camPos, 0.1);
        camera.lookAt(camLook);
      }
      renderer.render(scene, camera);
    },
    setCamera(mode) { camMode = mode; },
    dispose() {
      ro.disconnect();
      scene.traverse((n) => {
        n.geometry?.dispose?.();
        const mats = n.material ? (Array.isArray(n.material) ? n.material : [n.material]) : [];
        mats.forEach((m) => { m.map?.dispose?.(); m.dispose?.(); });
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

export { D2R };
