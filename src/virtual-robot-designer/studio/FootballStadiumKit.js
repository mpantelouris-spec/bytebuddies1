/**
 * FootballStadiumKit.js — Broadcast-style stadium around the Robot Football pitch.
 * Cheap meshes + instancing for school tablets. FootballBot only.
 *
 * Pitch length is Z (goals at ±GOAL_Z). Width is X.
 */
import * as THREE from 'three';
import { buildSeatedCrowd, createCrowdDirector } from './CrowdKit.js';
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
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  // Broadcast mowing stripes: two close greens, like a real pitch under floodlights
  const stripes = 12;
  for (let i = 0; i < stripes; i++) {
    // Deeper broadcast greens read as cut turf under the stadium lighting,
    // while the alternating bands keep the far side of the pitch legible.
    ctx.fillStyle = i % 2 === 0 ? '#287b39' : '#348a40';
    ctx.fillRect(0, (h / stripes) * i, w, h / stripes + 1);
  }
  // Fine grass grain so it never looks like flat paint
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 26000; i++) {
    const g = rnd();
    ctx.fillStyle = g < 0.5 ? 'rgba(8,42,18,0.2)' : 'rgba(170,220,140,0.12)';
    ctx.fillRect(rnd() * w, rnd() * h, 1.2, 3.4);
  }
  // Slight worn patches in the goalmouths and centre circle
  [[w / 2, h / 2, 90], [w / 2, 30, 110], [w / 2, h - 30, 110]].forEach(([x, y, r]) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(120,110,60,0.16)');
    grad.addColorStop(1, 'rgba(120,110,60,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return { map: tex };
}

export function buildPbrPitch() {
  const { map } = makeGrassMap();
  const grp = new THREE.Group();
  // Lit (Lambert) grass: picks up the floodlights and shadows but stays cheap on tablets
  const mat = new THREE.MeshLambertMaterial({ map, color: 0xffffff });
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
    color: 0xf4f6f2,
    emissive: 0xf4f6f2,
    emissiveIntensity: 0.12,
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
  const addArc = (r, x, z, start, end) => {
    const points = [];
    const segments = 32;
    for (let i = 0; i <= segments; i += 1) {
      const a = start + (end - start) * (i / segments);
      points.push(new THREE.Vector3(x + Math.cos(a) * r, lineY, z + Math.sin(a) * r));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const arc = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, 0.035, 5, false), chalk);
    arc.renderOrder = 2;
    grp.add(arc);
  };
  const addSpot = (x, z, radius = 0.12) => {
    const spot = new THREE.Mesh(new THREE.CircleGeometry(radius, 16), chalk);
    spot.rotation.x = -Math.PI / 2;
    spot.position.set(x, lineY + 0.004, z);
    spot.renderOrder = 2;
    grp.add(spot);
  };
  addRing(3.6, 0, 0);
  addSpot(0, 0, 0.13);
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
    const spotZ = sign * (PITCH_HALF_Z - 3.45);
    addSpot(0, spotZ);
    // The D-shaped penalty arc sits outside the box, opening toward midfield.
    addArc(2.0, 0, sign * (PITCH_HALF_Z - boxD), sign > 0 ? Math.PI : 0, sign > 0 ? Math.PI * 2 : Math.PI);
  });

  // Corner quarter-circles and small coach technical areas finish the
  // broadcast-pitch markings without crowding the playable surface.
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
    const x = sx * (PITCH_HALF_X - 0.04);
    const z = sz * (PITCH_HALF_Z - 0.04);
    const points = [];
    for (let i = 0; i <= 12; i += 1) {
      const a = (Math.PI / 2) * (i / 12);
      points.push(new THREE.Vector3(x - sx * 0.55 * (1 - Math.cos(a)), lineY, z - sz * 0.55 * (1 - Math.sin(a))));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const arc = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.035, 5, false), chalk);
    arc.renderOrder = 2;
    grp.add(arc);
  }));

  const technical = new THREE.MeshStandardMaterial({ color: 0xdde7df, roughness: 0.9, transparent: true, opacity: 0.62 });
  [-1, 1].forEach((side) => {
    const area = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.012, 1.1), technical);
    area.position.set(0, lineY - 0.008, side * (PITCH_HALF_Z + 1.1));
    grp.add(area);
    for (let i = -2; i <= 2; i += 1) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.014, 0.16), chalk);
      dash.position.set(i * 0.9, lineY, side * (PITCH_HALF_Z + 0.15));
      grp.add(dash);
    }
  });

  return grp;
}

/** Crowd texture: rows of seated fans (heads, shirts, scarves) in team colours. */
const crowdTexCache = new Map();
function makeCrowdTex(homeSide) {
  const key = homeSide ? 'home' : 'away';
  if (crowdTexCache.has(key)) return crowdTexCache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a2230';
  ctx.fillRect(0, 0, 1024, 512);
  const team = homeSide ? ['#1f9d55', '#2fbf6a', '#16803f'] : ['#2563eb', '#3b82f6', '#1d4ed8'];
  const other = ['#f4f4f4', '#d9d9d9', '#2b2b2b', '#c0392b', '#f1c40f', '#7f8c8d', '#34495e'];
  const skin = ['#f1d2b0', '#e2b08a', '#c68e5e', '#8d5a3a', '#5e3b26'];
  const hair = ['#2b1d14', '#5a3a20', '#1a1a1a', '#a8762e', '#6b4a2a'];
  let seed = homeSide ? 11 : 23;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const rowH = 16;
  for (let y = 4; y < 512; y += rowH) {
    // Seat row line
    ctx.fillStyle = '#10151e';
    ctx.fillRect(0, y + rowH - 3, 1024, 3);
    for (let x = 2 + ((y / rowH) % 2) * 5; x < 1024; x += 10) {
      if (rnd() < 0.08) continue; // the odd empty seat
      const shirt = rnd() < 0.7 ? team[Math.floor(rnd() * team.length)] : other[Math.floor(rnd() * other.length)];
      const jx = x + (rnd() - 0.5) * 2;
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(jx - 3.5, y + 6, 7, 8, 2);
      ctx.fill();
      ctx.fillStyle = skin[Math.floor(rnd() * skin.length)];
      ctx.beginPath();
      ctx.arc(jx, y + 4, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hair[Math.floor(rnd() * hair.length)];
      ctx.fillRect(jx - 2.6, y + 1.2, 5.2, 1.6);
      if (rnd() < 0.07) { // raised arms / scarves
        ctx.fillStyle = team[0];
        ctx.fillRect(jx - 5, y - 2, 10, 2);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  crowdTexCache.set(key, tex);
  return tex;
}

/** LED ribbon board texture (scrolls via userData.ledTex in FootballArena). */
function makeLedTex(label, bg) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px Arial';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label}  •  ${label}  •  `, 16, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/** One shared crowd clock for every stand in the stadium. */
export const stadiumCrowd = createCrowdDirector();

/** A stepped seating tier filled with 3D robot fans in team colours. */
function buildTier(width, depth, y0, y1, zFront, homeSide, lite = false) {
  const rows = Math.max(2, Math.round(depth / (lite ? 1.3 : 1.0)));
  const shirts = homeSide
    ? [0x1f9d55, 0x2fbf6a, 0xffffff, 0xfacc15, 0x16803f]
    : [0x2563eb, 0x3b82f6, 0xffffff, 0xf97316, 0x1d4ed8];
  return buildSeatedCrowd({
    width, rows, rowDepth: depth / rows, rowRise: (y1 - y0) / rows, y0, zFront,
    shirts, seat: lite ? 1.05 : 0.78, fill: lite ? 0.8 : 0.92, scale: 1.35,
    steps: 0x2a3140, seed: Math.round(width * 7 + y0 * 13 + (homeSide ? 1 : 2)),
    flags: 0.1, uniforms: stadiumCrowd.uniforms,
  });
}

/**
 * Two-tier stand facing the pitch (+z is towards the pitch before rotation):
 * lower tier, LED ribbon fascia, upper tier and a cantilever roof.
 */
function buildStand(width, depth, height, x, z, rotY, homeSide, lite = false) {
  const g = new THREE.Group();
  g.userData.liteCrowd = lite;
  const front = depth / 2;
  const lowerTop = height * 0.5;
  const upperBase = height * 0.58;
  const concrete = stdMat(0x2a3140, { roughness: 0.9 });

  // Pitch-side wall under the first row
  const wall = new THREE.Mesh(new THREE.BoxGeometry(width, 1.0, 0.3), concrete);
  wall.position.set(0, 0.5, front);
  g.add(wall);

  g.add(buildTier(width, depth * 0.55, 1.0, lowerTop, front, homeSide, lite));

  // LED ribbon between the tiers
  const ledTex = makeLedTex(homeSide ? 'BYTEBUDDIES CUP' : 'CODE • PASS • SCORE', homeSide ? '#0b5d2e' : '#0b3a8a');
  ledTex.repeat.set(Math.max(1, width / 22), 1);
  const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.7), new THREE.MeshBasicMaterial({ map: ledTex }));
  ribbon.position.set(0, upperBase - 0.25, front - depth * 0.55 - 0.05);
  ribbon.userData.ledTex = ledTex;
  ribbon.userData.crowdFascia = true;
  ribbon.userData.homeSide = !!homeSide;
  g.add(ribbon);

  if (!lite || height > 4) {
    g.add(buildTier(width, depth * 0.45, upperBase, height, front - depth * 0.55, homeSide, lite));
  }

  // Back wall and cantilever roof with a strip of lights underneath
  const back = new THREE.Mesh(new THREE.BoxGeometry(width, height + 1.2, 0.4), concrete);
  back.position.set(0, (height + 1.2) / 2, -front);
  g.add(back);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.25, depth * 0.9), stdMat(0xdfe5ee, { roughness: 0.5, metalness: 0.3 }));
  roof.position.set(0, height + 1.6, -front + depth * 0.4);
  roof.rotation.x = -0.08;
  g.add(roof);
  const roofLights = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, 0.2), new THREE.MeshBasicMaterial({ color: 0xfff6d8 }));
  roofLights.position.set(0, height + 1.42, -front + depth * 0.82);
  g.add(roofLights);

  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
}

function buildFloodlight(x, z, lite = false) {
  const g = new THREE.Group();
  const steel = stdMat(0xcfd6df, { metalness: 0.6, roughness: 0.35 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.4, 22, 10), steel);
  pole.position.y = 11;
  pole.castShadow = !lite;
  g.add(pole);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.3), steel);
  frame.position.set(0, 22.4, 0);
  g.add(frame);
  const lamp = new THREE.MeshBasicMaterial({ color: 0xfffbe8 });
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      const l = new THREE.Mesh(new THREE.CircleGeometry(0.26, 12), lamp);
      l.position.set(-1.4 + c * 0.7, 21.7 + r * 0.7, 0.17);
      g.add(l);
    }
  }
  // Turn the lamp panel to face the centre spot
  g.position.set(x, 0, z);
  g.rotation.y = Math.atan2(-x, -z);
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
  ctx.font = '900 44px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  // Repeat the label edge to edge without copies overlapping each other
  const unit = `${label}   •   `;
  const step = ctx.measureText(unit).width;
  for (let x = 16; x < 1024; x += step) ctx.fillText(unit, x, 52);
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

  // Behind each goal (ends) and along both touchlines; the broadcast camera sits
  // above the near touchline stand, so that one stays low.
  root.add(stand(hx * 2 + 10, 12, 11, 0, -hz - 8.5, 0, true));
  root.add(stand(hx * 2 + 10, 12, 11, 0, hz + 8.5, Math.PI, false));
  root.add(stand(hz * 2 + 14, 14, 13, -hx - 9.5, 0, Math.PI / 2, true));
  root.add(stand(hz * 2 + 14, 6, 3.2, hx + 5.5, 0, -Math.PI / 2, false));

  [
    [-hx - 14, -hz - 13],
    [hx + 14, -hz - 13],
    [-hx - 14, hz + 13],
    [hx + 14, hz + 13],
  ].forEach(([x, z]) => root.add(buildFloodlight(x, z, lite)));

  const ads = [
    [0, -hz - 0.55, hx * 1.85, 0, opts.matchLabel || 'FORGE FC  BYTEBUDDIES CUP  GREEN 3v3', '#052e16'],
    [0, hz + 0.55, hx * 1.85, Math.PI, opts.awayLabel || 'FORGE FC  BYTEBUDDIES CUP  BLUE 3v3', '#0c4a6e'],
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
    // Simple painted mural panels break up the blank concrete and make this
    // feel like a neighborhood cage pitch instead of a cut-down stadium.
    [-11, -5, 5, 11].forEach((x, i) => {
      const mural = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.3, 0.045),
        new THREE.MeshStandardMaterial({
          color: [0x22d3ee, 0xf472b6, 0xfacc15, 0xa78bfa][i],
          roughness: 0.78,
          emissive: [0x063943, 0x42172f, 0x40310c, 0x281a4f][i],
          emissiveIntensity: 0.22,
        }),
      );
      mural.position.set(x, 2.25, side * (hz + 1.6));
      root.add(mural);
    });
  });
  root.add(buildAdBoard(0, hz + 0.55, hx * 1.1, Math.PI, 'STREET FOOTBALL  CONCRETE CUP', '#64748b'));
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.58, roughness: 0.44 });
  [-1, 1].forEach((side) => {
    for (let x = -14; x <= 14; x += 7) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.4, 6), fenceMat);
      post.position.set(x, 2.2, side * (hz + 2.1));
      root.add(post);
    }
  });
  scene.add(root);
  return root;
}

export function buildTrainingBackdrop(scene) {
  const root = new THREE.Group();
  root.name = 'TrainingBackdrop';
  const hz = PITCH_HALF_Z;
  const railMat = stdMat(0x1f5135, { roughness: 0.8 });
  [-1, 1].forEach((side) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(PITCH_HALF_X * 1.8, 1.15, 0.18), railMat);
    rail.position.set(0, 0.58, side * (hz + 2.3));
    root.add(rail);
    for (let x = -16; x <= 16; x += 4) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), stdMat(0xe2e8f0, { metalness: 0.28 }));
      post.position.set(x, 0.9, side * (hz + 2.3));
      root.add(post);
    }
  });
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
  const neon = [0x22d3ee, 0xf472b6, 0xa78bfa, 0xfacc15];
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 4.6, 0.28),
      new THREE.MeshStandardMaterial({ color: neon[i], emissive: neon[i], emissiveIntensity: 0.7, roughness: 0.38 }),
    );
    post.position.set(sx * (hx + 1.6), 2.3, sz * (hz + 1.4));
    root.add(post);
  });
  scene.add(root);
  return root;
}

export function buildKeeperBackdrop(scene) {
  const root = new THREE.Group();
  root.name = 'KeeperBackdrop';
  const hz = PITCH_HALF_Z;
  root.add(buildStand(PITCH_HALF_X * 0.85, 2.4, 2.6, 0, hz + 1.8, Math.PI, false));
  root.add(buildAdBoard(0, hz + 0.45, PITCH_HALF_X, Math.PI, 'GOALKEEPER HERO  CLEAN SHEET', '#facc15'));
  [-1, 1].forEach((side) => {
    root.add(buildAdBoard(side * (PITCH_HALF_X * 0.62), hz + 0.5, PITCH_HALF_X * 0.45, Math.PI, side < 0 ? 'SAVE ZONE' : 'REFLEX LAB', side < 0 ? '#0c4a6e' : '#14532d'));
  });
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

export function buildDaySky(scene) {
  scene.background = new THREE.Color(0x74c4ff);
  scene.fog = new THREE.Fog(0xb8dcff, 70, 180);
  scene.userData.customSky = true;
  const clouds = new THREE.Group();
  clouds.name = 'DayClouds';
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
  [[-18, 22, -8], [12, 20, 10], [4, 24, -16], [-8, 18, 14]].forEach(([x, y, z], i) => {
    const c = new THREE.Mesh(new THREE.SphereGeometry(4.5 + i, 8, 6), mat);
    c.scale.set(1.8, 0.55, 1.1);
    c.position.set(x, y, z);
    clouds.add(c);
  });
  scene.add(clouds);
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
