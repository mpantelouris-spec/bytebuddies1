import * as THREE from 'three';
import { asteroidGeometry } from './mk-tracks/CosmicSkywayKit.js';
import { isCosmicSkywayArena, getCosmicTheme } from './mk-tracks/CosmicSkywayRegistry.js';

function mat(color, roughness = 0.72, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness, metalness: 0.04, ...extras,
  });
}

function placeAlong(curve, t, side, offset, object, yLift = 0) {
  const p = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  object.position.copy(p).addScaledVector(normal, side * offset);
  object.position.y = p.y + yLift;
  object.rotation.y = Math.atan2(tangent.x, tangent.z);
}

function palm() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 5.4, 10), mat(0xb57a3c, 0.88));
  trunk.position.y = 2.7;
  trunk.rotation.z = 0.05;
  trunk.castShadow = true;
  g.add(trunk);
  for (let i = 0; i < 8; i += 1) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.35, 10, 6), mat(i % 2 ? 0x2f9a4a : 0x58c46a, 0.55));
    leaf.scale.set(1.7, 0.16, 0.38);
    leaf.position.y = 5.45;
    leaf.rotation.y = i * (Math.PI * 2 / 8);
    leaf.rotation.z = (i % 2 ? 0.32 : -0.22);
    g.add(leaf);
  }
  return g;
}

function hayBale() {
  const g = new THREE.Group();
  const bale = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.35, 1.35), mat(0xe8c15a, 0.92));
  bale.position.y = 0.68;
  bale.castShadow = true;
  g.add(bale);
  [-0.32, 0.32].forEach((z) => {
    const band = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.09, 0.09), mat(0x8d5a22));
    band.position.set(0, 0.7, z);
    g.add(band);
  });
  return g;
}

/** Worlds where beach palms and hay bales belong at the start line. */
const TROPICAL = /sunset|cove|jungle|beach|tropic/;

function startBannerTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 192;
  const ctx = c.getContext('2d');
  const sq = 24;
  for (let y = 0; y < 192; y += sq) {
    for (let x = 0; x < 1024; x += sq) {
      ctx.fillStyle = ((x + y) / sq) % 2 ? '#111' : '#f4f4f0';
      ctx.fillRect(x, y, sq, sq);
    }
  }
  ctx.fillStyle = '#c41e24';
  ctx.fillRect(220, 28, 584, 136);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 8;
  ctx.strokeRect(226, 34, 572, 124);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 92px Arial Black, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('START', 512, 100);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function checkeredFlagTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d');
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#111' : '#f4f4f0';
      ctx.fillRect(x * 32, y * 32, 33, 33);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Kart-style start gantry: steel posts, START banner, flags, lights, painted grid. */
export function raceStartGantry(halfWidth = 4) {
  const g = new THREE.Group();
  g.name = 'race-start-gantry';
  const span = Math.max(halfWidth * 2 + 3.2, 9.2);
  const H = 6.4;
  const steel = mat(0xd8dee6, 0.28, { metalness: 0.78 });
  const dark = mat(0x1c2028, 0.42, { metalness: 0.45 });
  const red = mat(0xd62a2a, 0.38, { metalness: 0.25 });
  [-1, 1].forEach((side) => {
    const pil = new THREE.Mesh(new THREE.BoxGeometry(0.72, H, 0.72), steel);
    pil.position.set(side * span / 2, H / 2, 0);
    pil.castShadow = true;
    g.add(pil);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.38, 1.15), dark);
    foot.position.set(side * span / 2, 0.19, 0);
    g.add(foot);
    for (let k = 0; k < 3; k++) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.28, 0.8), red);
      band.position.set(side * span / 2, 1.2 + k * 1.7, 0);
      g.add(band);
    }
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 0.8, 1.7, 0.7), dark);
  beam.position.set(0, H + 0.35, 0);
  beam.castShadow = true;
  g.add(beam);
  const bannerMap = startBannerTexture();
  const bannerMat = new THREE.MeshStandardMaterial({
    map: bannerMap, roughness: 0.48, metalness: 0.08, emissive: 0xffffff, emissiveIntensity: 0.1, emissiveMap: bannerMap,
  });
  [-1, 1].forEach((side) => {
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(span + 0.4, 1.55), bannerMat);
    banner.position.set(0, H + 0.35, side * 0.38);
    if (side < 0) banner.rotation.y = Math.PI;
    g.add(banner);
  });
  const flagMat = new THREE.MeshBasicMaterial({ map: checkeredFlagTexture(), side: THREE.DoubleSide });
  [-1, 1].forEach((side) => {
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(span * 0.22, 1.2), flagMat);
    flag.position.set(side * span * 0.28, H - 0.85, 0.42);
    g.add(flag);
  });
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0x401010, emissive: 0xff2a1a, emissiveIntensity: 1.5 });
  for (let k = 0; k < 5; k++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), bulbMat);
    b.position.set(-1.2 + k * 0.6, H - 0.72, 0.28);
    g.add(b);
  }
  const gridC = document.createElement('canvas');
  gridC.width = 512;
  gridC.height = 128;
  const gctx = gridC.getContext('2d');
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 16; x++) {
      gctx.fillStyle = (x + y) % 2 ? '#111' : '#f0f0ea';
      gctx.fillRect((x * 512) / 16, (y * 128) / 4, 33, 33);
    }
  }
  const gridTex = new THREE.CanvasTexture(gridC);
  gridTex.colorSpace = THREE.SRGBColorSpace;
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(span - 0.6, 2.2),
    new THREE.MeshStandardMaterial({ map: gridTex, roughness: 0.35, metalness: 0.12 }),
  );
  strip.rotation.x = -Math.PI / 2;
  strip.position.y = 0.04;
  strip.position.z = -1.6;
  strip.receiveShadow = true;
  strip.name = 'race-start-grid';
  g.add(strip);
  return g;
}

/** @deprecated balloon arches were the old start marker — kept so older worlds don't crash */
export function balloonArch(halfWidth = 4) {
  return raceStartGantry(halfWidth);
}

function centerDashes(curve, samples = 160) {
  const group = new THREE.Group();
  group.name = 'rally-center-dashes';
  for (let i = 2; i < samples; i += 6) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 1.35), mat(0xffd23f, 0.5));
    dash.position.set(p.x, p.y + 0.2, p.z);
    dash.rotation.y = Math.atan2(tangent.x, tangent.z);
    group.add(dash);
  }
  return group;
}

function neonGate(halfWidth = 4, theme = getCosmicTheme('star_station_01')) {
  const g = new THREE.Group();
  g.name = 'cosmic-neon-gate';
  const span = Math.max(halfWidth * 2.2, 9);
  const hull = mat(theme.frame, 0.35, { metalness: 0.85 });
  const cyan = new THREE.MeshBasicMaterial({ color: theme.left });
  const orange = new THREE.MeshBasicMaterial({ color: theme.right });
  const arch = new THREE.Mesh(new THREE.TorusGeometry(span / 2, 0.55, 10, 40, Math.PI), hull);
  arch.position.y = 0.6;
  g.add(arch);
  const inner = new THREE.Mesh(new THREE.TorusGeometry(span / 2 - 0.6, 0.12, 8, 40, Math.PI), cyan);
  inner.position.set(0, 0.6, 0.35);
  g.add(inner);
  const outer = new THREE.Mesh(new THREE.TorusGeometry(span / 2 + 0.6, 0.1, 8, 40, Math.PI), orange);
  outer.position.set(0, 0.6, 0.35);
  g.add(outer);
  return g;
}

function asteroid(size = 1, seed = 1, color = 0x6e6258) {
  const rock = new THREE.Mesh(asteroidGeometry(seed), mat(color, 0.92));
  rock.scale.setScalar(size);
  rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  rock.castShadow = false;
  return rock;
}

/** Continuous low metal walls with glowing strips, cyan on the left and orange on the right. */
function buildNeonWalls(curve, halfWidth, theme, samples = 96) {
  const g = new THREE.Group();
  g.name = 'cosmic-neon-walls';
  const wallGeo = new THREE.BoxGeometry(0.45, 0.9, 1);
  const stripGeo = new THREE.BoxGeometry(0.12, 0.14, 1);
  const wallMat = mat(theme.frame, 0.35, { metalness: 0.85 });
  const walls = new THREE.InstancedMesh(wallGeo, wallMat, samples * 2);
  const strips = {
    [-1]: new THREE.InstancedMesh(stripGeo, new THREE.MeshBasicMaterial({ color: theme.left }), samples),
    [1]: new THREE.InstancedMesh(stripGeo, new THREE.MeshBasicMaterial({ color: theme.right }), samples),
  };
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let w = 0;
  for (let i = 0; i < samples; i += 1) {
    const t0 = i / samples;
    const t1 = (i + 1) / samples;
    const a = curve.getPointAt(t0);
    const b = curve.getPointAt(t1 % 1);
    const seg = b.clone().sub(a);
    const len = seg.length();
    const dir = seg.normalize();
    const n = new THREE.Vector3().crossVectors(up, dir).normalize();
    const basis = new THREE.Matrix4().makeBasis(n, new THREE.Vector3().crossVectors(dir, n), dir);
    q.setFromRotationMatrix(basis);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    [-1, 1].forEach((side) => {
      pos.copy(mid).addScaledVector(n, -side * (halfWidth + 0.35));
      pos.y += 0.45;
      s.set(1, 1, len * 1.04);
      m.compose(pos, q, s);
      walls.setMatrixAt(w, m);
      w += 1;
      pos.y += 0.42;
      m.compose(pos, q, s);
      strips[side].setMatrixAt(i, m);
    });
  }
  g.add(walls, strips[-1], strips[1]);
  return g;
}

function trackFrame(curve, t) {
  const tt = ((t % 1) + 1) % 1;
  const p = curve.getPointAt(tt);
  const tan = curve.getTangentAt(tt).normalize();
  const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  return { p, tan, n, rot: Math.atan2(tan.x, tan.z) };
}

/** Full neon hoops the road passes through, alternating the theme's two colors. */
function buildRingGates(curve, halfWidth, theme, count, startT) {
  const g = new THREE.Group();
  g.name = 'cosmic-ring-gates';
  const radius = halfWidth * 1.9;
  const hull = mat(theme.frame, 0.35, { metalness: 0.85 });
  const hoopGeo = new THREE.TorusGeometry(radius, 0.45, 8, 40);
  const glowGeo = new THREE.TorusGeometry(radius - 0.55, 0.14, 6, 40);
  const glowMats = [theme.left, theme.right].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  for (let i = 0; i < count; i += 1) {
    const f = trackFrame(curve, startT + 0.12 + (i / count) * 0.84);
    const ring = new THREE.Group();
    ring.add(new THREE.Mesh(hoopGeo, hull));
    const glowRing = new THREE.Mesh(glowGeo, glowMats[i % 2]);
    glowRing.position.z = 0.3;
    ring.add(glowRing);
    ring.position.set(f.p.x, f.p.y + radius * 0.42, f.p.z);
    ring.rotation.y = f.rot;
    g.add(ring);
  }
  return g;
}

/** Tall neon beacon pylons on both shoulders. */
function buildBeacons(curve, halfWidth, theme, count, startT) {
  const g = new THREE.Group();
  g.name = 'cosmic-beacons';
  const postGeo = new THREE.CylinderGeometry(0.18, 0.28, 7, 8);
  const capGeo = new THREE.OctahedronGeometry(0.7);
  const barGeo = new THREE.BoxGeometry(0.12, 5.2, 0.12);
  const post = mat(theme.frame, 0.35, { metalness: 0.85 });
  const glows = [theme.left, theme.right].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  for (let i = 0; i < count; i += 1) {
    const f = trackFrame(curve, startT + 0.06 + (i / count) * 0.92);
    [-1, 1].forEach((side) => {
      const b = new THREE.Group();
      const mesh = new THREE.Mesh(postGeo, post);
      mesh.position.y = 3.5;
      b.add(mesh);
      const bar = new THREE.Mesh(barGeo, glows[side < 0 ? 0 : 1]);
      bar.position.set(0, 3.8, 0.22);
      b.add(bar);
      const cap = new THREE.Mesh(capGeo, glows[(i + (side < 0 ? 0 : 1)) % 2]);
      cap.position.y = 7.6;
      b.add(cap);
      b.position.copy(f.p).addScaledVector(f.n, -side * (halfWidth + 1.6));
      b.rotation.y = f.rot;
      g.add(b);
    });
  }
  return g;
}

/** Floating rocks just off both shoulders, all the way round the lap. */
function buildTrackRocks(curve, halfWidth, count, color, startT) {
  const g = new THREE.Group();
  g.name = 'cosmic-track-rocks';
  const geos = [21, 22, 23].map(asteroidGeometry);
  const material = mat(color, 0.92);
  const per = Math.ceil(count / geos.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  let k = 0;
  geos.forEach((geo, gi) => {
    const inst = new THREE.InstancedMesh(geo, material, per);
    for (let i = 0; i < per; i += 1, k += 1) {
      const f = trackFrame(curve, startT + 0.08 + (k / count) * 0.9);
      const side = k % 2 ? 1 : -1;
      const s = 0.9 + ((k * 7) % 5) * 0.55;
      const pos = f.p.clone().addScaledVector(f.n, side * (halfWidth + 5 + ((k * 3) % 4) * 3));
      pos.y += 1.5 + ((k * 5) % 6) * 1.4 - (gi === 2 ? 3 : 0);
      e.set(k * 0.7, k * 1.3, k * 0.4);
      q.setFromEuler(e);
      m.compose(pos, q, new THREE.Vector3(s, s * 0.85, s));
      inst.setMatrixAt(i, m);
    }
    g.add(inst);
  });
  return g;
}

function installCosmicPresentation(scene, curve, root, origin, fwd, right, angle, halfWidth, arenaType, startT) {
  const theme = getCosmicTheme(arenaType);
  const gate = neonGate(halfWidth, theme);
  gate.scale.setScalar(1.4);
  gate.position.copy(origin).addScaledVector(fwd, 18);
  gate.rotation.y = angle;
  root.add(gate);

  root.add(buildNeonWalls(curve, halfWidth, theme));

  const feature = theme.feature;
  if (feature?.type === 'ringGates') root.add(buildRingGates(curve, halfWidth, theme, feature.count, startT));
  if (feature?.type === 'beacons') root.add(buildBeacons(curve, halfWidth, theme, feature.count, startT));
  if (feature?.type === 'trackRocks') {
    root.add(buildTrackRocks(curve, halfWidth, feature.count, feature.color ?? theme.asteroid, startT));
  }

  for (let i = 0; i < 4; i += 1) {
    const side = i % 2 ? 1 : -1;
    const rock = asteroid(1.2 + (i % 3) * 0.9, 10 + i, theme.asteroid);
    rock.position.copy(origin)
      .addScaledVector(fwd, 10 + i * 6)
      .addScaledVector(right, side * (halfWidth + 7 + (i % 3) * 4));
    rock.position.y = origin.y + 3 + (i % 4) * 2.2;
    root.add(rock);
  }
}

export function installRacePresentation(scene, curve, {
  halfWidth = 4,
  spawn = null,
  startT = 0,
  world = '',
  theme = null,
} = {}) {
  if (scene.userData.racePresentationRoot) {
    scene.remove(scene.userData.racePresentationRoot);
    scene.userData.racePresentationRoot = null;
  }
  const root = new THREE.Group();
  root.name = 'original-race-presentation';
  root.userData.presentationLayer = true;

  const t0 = spawn?.trackT ?? startT ?? 0;
  const p0 = curve.getPointAt(((t0 % 1) + 1) % 1);
  const angle = spawn?.angle ?? (() => {
    const a = curve.getPointAt((t0 + 0.004) % 1);
    return Math.atan2(a.x - p0.x, a.z - p0.z);
  })();
  const origin = spawn
    ? new THREE.Vector3(spawn.x, spawn.y ?? p0.y, spawn.z)
    : new THREE.Vector3(p0.x, p0.y, p0.z);
  // Place everything along the road itself: a straight line from the start
  // drifts onto the tarmac wherever the circuit bends.
  const length = Math.max(curve.getLength(), 1);
  const along = (dist) => {
    const t = (((t0 + dist / length) % 1) + 1) % 1;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t).setY(0).normalize();
    return { p, tan, right: new THREE.Vector3(tan.z, 0, -tan.x), yaw: Math.atan2(tan.x, tan.z) };
  };

  const fwd = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
  const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
  if (isCosmicSkywayArena(theme)) {
    installCosmicPresentation(scene, curve, root, origin, fwd, right, angle, halfWidth, theme, t0);
    scene.add(root);
    scene.userData.racePresentationRoot = root;
    scene.userData.racePresentation = 'cosmic-skyway';
    return;
  }

  // Real START gantry + painted grid at the spawn — never the old balloon arch.
  scene.traverse((o) => {
    if (o.name === 'balloon-star-arch') o.visible = false;
  });
  const finish = raceStartGantry(halfWidth);
  finish.position.copy(origin).addScaledVector(fwd, 4.2);
  finish.position.y = origin.y;
  finish.rotation.y = angle;
  root.add(finish);

  // Painted centre dashes only suit tarmac; boardwalks, dirt and cobbles skip them
  if (scene.userData.trackTheme?.centreLine !== false) root.add(centerDashes(curve));

  // Palms and hay bales only suit the beach/jungle worlds; the other worlds
  // already have their own scenery.
  // Skipped where the Kenney scenery kit already dresses the world
  if (!scene.userData.themeScenery && (!world || TROPICAL.test(world))) {
    for (let i = 0; i < 8; i += 1) {
      const at = along(5 + i * 4.2);
      [-1, 1].forEach((side) => {
        const usePalm = i % 2 === 0;
        const prop = usePalm ? palm() : hayBale();
        prop.scale.setScalar(usePalm ? 1.35 : 1.25);
        prop.position.copy(at.p).addScaledVector(at.right, side * (halfWidth + (usePalm ? 8.5 : 7)));
        prop.position.y = origin.y;
        prop.rotation.y = at.yaw;
        root.add(prop);
      });
    }
  }

  scene.add(root);
  scene.userData.racePresentationRoot = root;
  scene.userData.racePresentation = 'bright-arcade-circuit';
  // Keep the world's own sky (night city, snow, lava); only fill in a missing one.
  if (!scene.background) scene.background = new THREE.Color(0x4eb8ef);
  if (scene.fog && !world) {
    scene.fog.color.set(0xa8dff5);
    scene.fog.near = 70;
    scene.fog.far = 240;
  }
}
