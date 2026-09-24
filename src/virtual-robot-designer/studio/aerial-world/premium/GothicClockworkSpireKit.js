/**
 * GothicClockworkSpireKit — art-directed vista #1 (Drone).
 * Composition: foreground hero gears → mid spire cathedral → background silhouettes.
 * Hero FX: GTAO contact depth on brass/iron (AerialUERenderKit gothic profile).
 */
import * as THREE from 'three';
import { createTerrainMaps, pbrMat } from '../../../racing/mk-tracks/BiomeAAAKit.js';
import { add, geo, mat, seededRnd } from '../PremiumEnvironmentHelpers.js';

const BRASS = 0xb45309;
const IRON = 0x1e293b;
const STONE = 0x64748b;

function brassMaterial(emi = 0.14) {
  const maps = createTerrainMaps(BRASS, { roughness: 0.28, variation: 0.14 });
  const m = pbrMat(BRASS, {
    roughness: 0.28,
    metalness: 0.78,
    emissive: 0xfbbf24,
    emi,
    map: maps.colorMap,
    normalMap: maps.normalMap,
    roughnessMap: maps.roughnessMap,
  });
  if (m.isMeshPhysicalMaterial) {
    m.clearcoat = 0.48;
    m.clearcoatRoughness = 0.14;
  }
  return m;
}

function ironMaterial() {
  const maps = createTerrainMaps(IRON, { roughness: 0.42, variation: 0.18 });
  return pbrMat(IRON, {
    roughness: 0.42,
    metalness: 0.88,
    map: maps.colorMap,
    normalMap: maps.normalMap,
    roughnessMap: maps.roughnessMap,
  });
}

function stoneMaterial() {
  const maps = createTerrainMaps(STONE, { roughness: 0.88, variation: 0.22 });
  return pbrMat(STONE, {
    roughness: 0.88,
    metalness: 0.06,
    map: maps.colorMap,
    normalMap: maps.normalMap,
    roughnessMap: maps.roughnessMap,
  });
}

function buildGear(parent, x, y, z, radius, brass, iron, name, spin, teeth = 14) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.x = Math.PI / 2;
  g.name = name;
  g.userData.spinGear = spin;
  const hub = new THREE.Mesh(geo.cylinder(radius * 0.32, radius * 0.32, 0.65, 14), brass);
  hub.name = `${name}Hub`;
  g.add(hub);
  const rim = new THREE.Mesh(geo.cylinder(radius, radius, 0.5, 32), brass);
  rim.name = `${name}Rim`;
  g.add(rim);
  for (let t = 0; t < teeth; t++) {
    const a = (t / teeth) * Math.PI * 2;
    const tooth = new THREE.Mesh(geo.box(0.5, radius * 0.42, 0.55), iron);
    tooth.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    tooth.rotation.z = a;
    tooth.name = `${name}T${t}`;
    g.add(tooth);
  }
  parent.add(g);
  return g;
}

function buildClockFace(parent, x, y, z, r, brass, iron, name, facingY = 0) {
  const dial = add(parent, geo.cylinder(r, r, 0.22, 36), brass, x, y, z, `${name}Bezel`, { rotX: Math.PI / 2 });
  dial.rotation.y = facingY;
  add(parent, geo.cylinder(r * 0.88, r * 0.88, 0.05, 36), mat(0xf8fafc, { roughness: 0.5 }), x, y + 0.12, z, `${name}Face`, { rotX: Math.PI / 2, rotY: facingY });
  const hour = add(parent, geo.box(0.14, r * 0.42, 0.07), iron, x, y + 0.18, z, `${name}Hour`, { rotZ: 0.85 });
  hour.rotation.x = Math.PI / 2;
  hour.rotation.y = facingY;
  const minute = add(parent, geo.box(0.09, r * 0.58, 0.06), iron, x, y + 0.2, z, `${name}Min`, { rotZ: -0.4 });
  minute.rotation.x = Math.PI / 2;
  minute.rotation.y = facingY;
}

function buildSpireTier(parent, y, w, h, d, iron, brass, tier) {
  add(parent, geo.box(w, h, d), iron, 0, y + h / 2, -4, `SpireTier${tier}`);
  windowGrid(parent, w / 2, y, -4 + d / 2, w * 0.7, h * 0.75, 3, Math.floor(h / 5), 0xfbbf24, `Tier${tier}Win`, 'z');
  add(parent, geo.box(w + 0.8, 0.35, d + 0.5), brass, 0, y + h + 0.18, -4, `TierCornice${tier}`);
}

function windowGrid(parent, x, y, z, faceW, faceH, cols, rows, color, prefix, face) {
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if ((c + r) % 3 === 0) continue;
      const wx = face === 'z' ? x + (c - cols / 2) * (faceW / cols) : x + faceW / 2 + 0.1;
      const wy = y + 1.5 + r * (faceH / Math.max(rows, 1));
      const wz = face === 'z' ? z + 0.12 : z + (c - cols / 2) * (faceW / cols);
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(faceW / cols * 0.5, faceH / rows * 0.6),
        pbrMat(color, { emissive: color, emi: 0.28, roughness: 0.2 }),
      );
      win.position.set(wx, wy, wz);
      if (face === 'x') win.rotation.y = Math.PI / 2;
      win.name = `${prefix}_${c}_${r}`;
      parent.add(win);
    }
  }
}

function buildChain(parent, pts, brass, name) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const steps = 8;
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const cx = a.x + (b.x - a.x) * t;
      const cy = a.y + (b.y - a.y) * t + Math.sin(t * Math.PI) * 0.6;
      const cz = a.z + (b.z - a.z) * t;
      add(parent, geo.box(0.62, 0.24, 0.42), brass, cx, cy, cz, `${name}L${i}_${s}`);
    }
  }
}

/** Warm gas-lamp accents — subtle, not flat ambient fill. */
export function installGothicClockworkLighting(scene, root) {
  if (!scene || scene.getObjectByName('GothicVistaLights')) return;
  const rig = new THREE.Group();
  rig.name = 'GothicVistaLights';
  root.traverse((obj) => {
    if (!obj.name?.startsWith('GasLamp')) return;
    const lamp = new THREE.PointLight(0xfbbf24, 0.35, 28, 2);
    lamp.position.copy(obj.position);
    lamp.castShadow = false;
    rig.add(lamp);
  });
  const rim = new THREE.DirectionalLight(0xffc878, 0.22);
  rim.position.set(-40, 30, 20);
  rig.add(rim);
  scene.add(rig);
}

export function buildGothicClockworkSpire(g, backdrop, y) {
  const anchor = backdrop.at(0, -22);
  const root = new THREE.Group();
  root.name = 'GothicClockworkSpire';
  root.position.set(anchor.x, y - 10, anchor.z);
  g.add(root);

  const brass = brassMaterial();
  const iron = ironMaterial();
  const stone = stoneMaterial();
  const rnd = seededRnd(31);

  // ── Layer 0: Plaza + atmospheric haze band ──
  add(root, geo.plane(88, 56, 16, 12), stone, 0, 0.04, 6, 'CathedralPlaza', { rotX: -Math.PI / 2, receiveShadow: true });
  const haze = add(root, geo.plane(120, 40), mat(0x78716c, { transparent: true, opacity: 0.14 }), 0, 8, -20, 'PlazaHaze', { rotX: -Math.PI / 2 });
  haze.material.depthWrite = false;

  // ── Layer 1: Foreground hero gears (flight-path framing) ──
  buildGear(root, -14, 14, 2, 6.5, brass, iron, 'HeroGearL', 0.22, 16);
  buildGear(root, 14, 12, 0, 5.8, brass, iron, 'HeroGearR', -0.18, 14);
  buildGear(root, 0, 8, 8, 4.2, brass, iron, 'HeroGearCenter', 0.12, 12);

  // ── Layer 2: Main spire (tiered octagonal cathedral) ──
  buildSpireTier(root, 2, 20, 14, 16, iron, brass, 0);
  buildSpireTier(root, 16, 16, 12, 14, iron, brass, 1);
  buildSpireTier(root, 28, 12, 10, 12, iron, brass, 2);
  add(root, geo.cylinder(5, 7, 10, 10), iron, 0, 46, -4, 'SpireLantern');
  add(root, geo.cone(6, 14, 12), brass, 0, 58, -4, 'SpireFinial');
  buildClockFace(root, 0, 36, 2.5, 3.4, brass, iron, 'HeroClock', 0);

  // Flanking towers (lower, frame the hero)
  [-22, 22].forEach((sx, i) => {
    add(root, geo.cylinder(4.5, 5.5, 32, 10), iron, sx, 16, -2, `FlankTower${i}`);
    add(root, geo.cone(5, 10, 10), brass, sx, 37, -2, `FlankCap${i}`);
    buildClockFace(root, sx, 26, 1.5, 2.2, brass, iron, `FlankClock${i}`, sx > 0 ? -0.35 : 0.35);
  });

  // Flying buttresses (4 — symmetric)
  [-18, 18].forEach((bx, i) => {
    add(root, geo.box(2.2, 26, 2.2), iron, bx, 13, 4, `Buttress${i}`);
    add(root, geo.box(5, 0.45, 7), brass, bx, 26, 6, `ButtressCap${i}`);
    add(root, geo.box(1.4, 2, 2), iron, bx, 27.5, 7, `Gargoyle${i}`);
  });

  // Rose window + clock ring
  add(root, geo.torus(4.5, 0.28, 10, 28), brass, 0, 40, 0.5, 'RoseOuter', { rotX: Math.PI / 2 });
  for (let s = 0; s < 8; s++) {
    const a = (s / 8) * Math.PI * 2;
    add(root, geo.box(0.1, 3.8, 0.1), brass, Math.cos(a) * 2.8, 40, 0.5 + Math.sin(a) * 2.8, `RoseSpoke${s}`, { rotY: a });
  }
  const ring = add(root, geo.torus(5.5, 0.22, 12, 40), brass, 0, 34, 1, 'ClockRing', { rotX: Math.PI / 2 });
  ring.userData.spinGear = 0.06;

  // ── Layer 3: Mid gear train (curated interlock, not random scatter) ──
  const train = [
    [-8, 18, -14, 3.2], [8, 20, -16, 2.8], [-4, 22, -22, 2.4], [6, 19, -24, 2.6],
    [-12, 16, -28, 2.2], [12, 17, -30, 2.5], [0, 21, -34, 3], [-6, 15, -38, 2],
  ];
  train.forEach(([gx, gy, gz, gr], i) => {
    buildGear(root, gx, gy, gz, gr, brass, iron, `TrainGear${i}`, (i % 2 ? 1 : -1) * (0.1 + rnd() * 0.15), 12);
  });
  buildChain(root, train.map(([gx, gy, gz]) => new THREE.Vector3(gx, gy, gz)), brass, 'MainChain');

  // ── Layer 4: Background silhouettes (simplified, lower contrast) ──
  const fadeIron = pbrMat(IRON, { roughness: 0.55, metalness: 0.5, transparent: true, opacity: 0.55 });
  const bgBrass = brassMaterial(0.06);
  for (let i = 0; i < 5; i++) {
    const bx = (i - 2) * 28;
    add(root, geo.box(8, 22 + (i % 2) * 8, 6), fadeIron, bx, 12, -58 - i * 6, `Silhouette${i}`);
    buildGear(root, bx + (i % 2 ? 6 : -6), 10 + i * 2, -52 - i * 8, 2 + rnd(), bgBrass, fadeIron, `BgGear${i}`, 0.05, 8);
  }

  // Gas lamps along plaza edge
  for (let l = 0; l < 5; l++) {
    const lx = -20 + l * 10;
    add(root, geo.cylinder(0.1, 0.14, 4.5, 8), iron, lx, 2.2, 20, `LampPost${l}`);
    add(root, geo.sphere(0.38, 10, 8), mat(0xfff3c4, { emissive: 0xfbbf24, emi: 0.7 }), lx, 4.8, 20, `GasLamp${l}`);
  }

  root.userData.premiumEnvironment = 'gothic_clockwork_spire';
  root.userData.artDirected = true;
  return root;
}
