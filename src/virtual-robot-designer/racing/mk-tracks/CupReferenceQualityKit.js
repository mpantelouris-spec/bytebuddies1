/**
 * CupReferenceQualityKit.js
 *
 * Deterministic, first-frame scenery compositions for the ten CodeRacer cups.
 * Everything is procedural Three.js geometry: no illustrated backdrop dependency,
 * no collision bodies, and every composition root is kept outside the road corridor.
 */
import * as THREE from 'three';
import { sampleTrackFrame } from '../GameWorldBuilder.js';
import { isCupTrack } from './CodeRacerTrackStandards.js';

const TAU = Math.PI * 2;

const THEMES = {
  sunset_cove_01: {
    kind: 'coast', hero: 0xff8a45, accent: 0x35d4db, dark: 0x73452c,
    ground: 0x62a94f, atmospheric: 0xffc78f,
  },
  candy_carnival_01: {
    kind: 'carnival', hero: 0xff6faf, accent: 0xffd85a, dark: 0x7652aa,
    ground: 0x91cf67, atmospheric: 0xffc9e3,
  },
  neon_metro_01: {
    kind: 'metro', hero: 0xff38cf, accent: 0x21e8ff, dark: 0x101329,
    ground: 0x242a3e, atmospheric: 0x47417d,
  },
  cloud_citadel_01: {
    kind: 'citadel', hero: 0xf4e8c9, accent: 0x72d5ff, dark: 0x6e83a8,
    ground: 0x69a957, atmospheric: 0xccecff,
  },
  jungle_ruins_01: {
    kind: 'ruins', hero: 0xd2ad58, accent: 0x65cc54, dark: 0x3e5534,
    ground: 0x49843f, atmospheric: 0x8ab879,
  },
  frost_peak_01: {
    kind: 'frost', hero: 0xe9f5ff, accent: 0x70d8ff, dark: 0x58749a,
    ground: 0xbddbea, atmospheric: 0xb7d9ef,
  },
  lava_foundry_01: {
    kind: 'foundry', hero: 0xff7035, accent: 0xffcf4e, dark: 0x302d35,
    ground: 0x4b4140, atmospheric: 0x8d4938,
  },
  star_station_01: {
    kind: 'station', hero: 0xa965ff, accent: 0x36e5ff, dark: 0x11132e,
    ground: 0x292650, atmospheric: 0x39376d,
  },
  fairy_glen_01: {
    kind: 'fairy', hero: 0xff79bf, accent: 0xffe269, dark: 0x557642,
    ground: 0x78b95a, atmospheric: 0xb7db8f,
  },
  thunder_ridge_01: {
    kind: 'thunder', hero: 0xe2e7ed, accent: 0xffd84b, dark: 0x4a5261,
    ground: 0x63705c, atmospheric: 0x7b879b,
  },
};

function material(color, {
  roughness = 0.48,
  metalness = 0.05,
  emissive = 0x000000,
  emissiveIntensity = 0,
  clearcoat = 0.35,
  transparent = false,
  opacity = 1,
} = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    emissive,
    emissiveIntensity,
    clearcoat,
    clearcoatRoughness: Math.min(0.6, roughness),
    transparent,
    opacity,
  });
}

function mesh(geometry, mat, x = 0, y = 0, z = 0) {
  const out = new THREE.Mesh(geometry, mat);
  out.position.set(x, y, z);
  out.castShadow = true;
  out.receiveShadow = true;
  return out;
}

function addOrb(group, mat, x, y, z, sx, sy = sx, sz = sx) {
  const out = mesh(new THREE.SphereGeometry(1, 12, 9), mat, x, y, z);
  out.scale.set(sx, sy, sz);
  group.add(out);
  return out;
}

function addSoftBlock(group, mat, x, y, z, sx, sy, sz, radius = 0.25) {
  const out = mesh(new THREE.CapsuleGeometry(radius, Math.max(0.1, sy - radius * 2), 5, 10), mat, x, y, z);
  out.scale.set(sx / (radius * 2), 1, sz / (radius * 2));
  group.add(out);
  return out;
}

function buildPlinth(cfg, radius = 8, cloud = false) {
  const g = new THREE.Group();
  g.name = 'cup-quality-plinth';
  const rock = material(cloud ? 0xeaf6ff : cfg.dark, { roughness: 0.84, clearcoat: 0.08 });
  const top = material(cfg.ground, { roughness: 0.82, clearcoat: 0.12 });
  const base = mesh(new THREE.CylinderGeometry(radius * 0.76, radius, 3.2, 12), rock, 0, -1.8, 0);
  base.scale.z = 0.78;
  g.add(base);
  const cap = mesh(new THREE.CylinderGeometry(radius * 0.76, radius * 0.78, 0.85, 12), top, 0, 0.18, 0);
  cap.scale.z = 0.78;
  g.add(cap);
  if (cloud) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      addOrb(g, rock, Math.cos(a) * radius * 0.58, -1.3, Math.sin(a) * radius * 0.45, 2.8, 1.4, 2.2);
    }
  }
  return g;
}

function buildPalm(cfg, scale = 1) {
  const g = new THREE.Group();
  const trunk = material(0x86512f, { roughness: 0.78 });
  const leaf = material(cfg.ground, { roughness: 0.7 });
  const stem = mesh(new THREE.CylinderGeometry(0.32, 0.52, 8, 9), trunk, 0, 4, 0);
  stem.rotation.z = -0.08;
  g.add(stem);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU;
    const frond = addOrb(g, leaf, Math.cos(a) * 2.2, 8.1, Math.sin(a) * 2.2, 2.8, 0.3, 0.78);
    frond.rotation.y = -a;
  }
  g.scale.setScalar(scale);
  return g;
}

function buildLighthouse(cfg) {
  const g = buildPlinth(cfg, 7);
  const ivory = material(0xfff0d6, { roughness: 0.42, clearcoat: 0.45 });
  const stripe = material(cfg.hero, { roughness: 0.38, clearcoat: 0.5 });
  g.add(mesh(new THREE.CylinderGeometry(1.25, 1.8, 11, 14), ivory, 0, 5.7, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.42, 1.48, 1.4, 14), stripe, 0, 5.1, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.05, 1.25, 1.2, 14), stripe, 0, 9.5, 0));
  const lantern = addOrb(g, material(cfg.accent, {
    roughness: 0.12, metalness: 0.25, emissive: cfg.accent, emissiveIntensity: 1.3,
  }), 0, 11.7, 0, 1.05, 0.85, 1.05);
  lantern.userData.cupQualityPulse = 0.7;
  const roof = mesh(new THREE.ConeGeometry(1.65, 1.8, 14), stripe, 0, 13, 0);
  g.add(roof);
  return g;
}

function buildFerrisWheel(cfg) {
  const g = buildPlinth(cfg, 8);
  const metal = material(0xf8e9f2, { roughness: 0.28, metalness: 0.42, clearcoat: 0.65 });
  const glow = material(cfg.accent, { emissive: cfg.accent, emissiveIntensity: 0.75, metalness: 0.2 });
  [-2.8, 2.8].forEach((x) => {
    const leg = mesh(new THREE.CylinderGeometry(0.25, 0.38, 10, 8), metal, x * 0.38, 4.8, 0);
    leg.rotation.z = x > 0 ? -0.28 : 0.28;
    g.add(leg);
  });
  const wheel = mesh(new THREE.TorusGeometry(5.4, 0.28, 10, 36), glow, 0, 9.2, 0);
  wheel.userData.cupQualitySpin = 0.035;
  g.add(wheel);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    const pod = addOrb(g, material(i % 2 ? cfg.hero : cfg.accent, { clearcoat: 0.75 }), Math.cos(a) * 5.4, 9.2 + Math.sin(a) * 5.4, 0, 0.55, 0.7, 0.55);
    pod.userData.cupQualityBob = i * 0.63;
  }
  return g;
}

function buildMetroTower(cfg, height = 22, variant = 0) {
  const g = new THREE.Group();
  const shell = material(variant ? 0x202747 : cfg.dark, { roughness: 0.22, metalness: 0.52, clearcoat: 0.75 });
  const glow = material(variant ? cfg.hero : cfg.accent, {
    roughness: 0.18, emissive: variant ? cfg.hero : cfg.accent, emissiveIntensity: 1.1,
  });
  addSoftBlock(g, shell, 0, height * 0.5, 0, 5.5, height, 5.5, 0.62);
  for (let y = 3; y < height - 1; y += 3) {
    [-2.82, 2.82].forEach((x) => g.add(mesh(new THREE.BoxGeometry(0.12, 0.26, 3.8), glow, x, y, 0)));
  }
  const crown = mesh(new THREE.TorusGeometry(2.2, 0.22, 8, 24), glow, 0, height + 1.5, 0);
  crown.rotation.x = Math.PI / 2;
  g.add(crown);
  return g;
}

function buildCitadel(cfg) {
  const g = buildPlinth(cfg, 10, true);
  const stone = material(cfg.hero, { roughness: 0.52, clearcoat: 0.22 });
  const roof = material(0x527cc7, { roughness: 0.3, metalness: 0.14, clearcoat: 0.62 });
  [-4.2, 0, 4.2].forEach((x, i) => {
    const h = i === 1 ? 14 : 10;
    g.add(mesh(new THREE.CylinderGeometry(1.7, 2, h, 10), stone, x, h * 0.5, 0));
    g.add(mesh(new THREE.ConeGeometry(2.35, 3.8, 10), roof, x, h + 1.8, 0));
    for (let c = 0; c < 4; c++) {
      const a = (c / 4) * TAU;
      addSoftBlock(g, stone, x + Math.cos(a) * 1.6, h + 0.1, Math.sin(a) * 1.6, 0.65, 1.4, 0.65, 0.18);
    }
  });
  return g;
}

function buildRuins(cfg) {
  const g = buildPlinth(cfg, 10);
  const stone = material(cfg.hero, { roughness: 0.83, clearcoat: 0.08 });
  const moss = material(cfg.ground, { roughness: 0.92 });
  for (let i = 0; i < 5; i++) {
    const w = 11 - i * 1.55;
    g.add(mesh(new THREE.BoxGeometry(w, 1.5, w * 0.72), i % 2 ? moss : stone, 0, 1.1 + i * 1.45, 0));
  }
  const archTop = mesh(new THREE.BoxGeometry(7.5, 1.5, 1.7), stone, 0, 10.5, 1.5);
  g.add(archTop);
  [-3.1, 3.1].forEach((x) => addSoftBlock(g, stone, x, 8.2, 1.5, 1.55, 6, 1.55, 0.28));
  for (let i = 0; i < 5; i++) {
    addOrb(g, moss, -4.2 + i * 2.1, 7.7 + (i % 2), 0.8, 0.75, 0.32, 0.62);
  }
  return g;
}

function buildFrostPeak(cfg) {
  const g = buildPlinth(cfg, 10);
  const snow = material(cfg.hero, { roughness: 0.55, clearcoat: 0.28 });
  const ice = material(cfg.accent, {
    roughness: 0.08, metalness: 0.25, transparent: true, opacity: 0.88, clearcoat: 0.95,
  });
  [[-3, 13, 4.5], [2.5, 18, 5.5], [6, 10, 3.5]].forEach(([x, h, r], i) => {
    const peak = mesh(new THREE.ConeGeometry(r, h, 8), i === 1 ? ice : snow, x, h * 0.5, i ? 1 : -1);
    peak.rotation.y = i * 0.42;
    g.add(peak);
  });
  return g;
}

function buildFoundry(cfg) {
  const g = buildPlinth(cfg, 10);
  const steel = material(cfg.dark, { roughness: 0.32, metalness: 0.72, clearcoat: 0.42 });
  const hot = material(cfg.hero, { roughness: 0.2, emissive: cfg.hero, emissiveIntensity: 1.25 });
  [-3.6, 3.6].forEach((x, i) => {
    g.add(mesh(new THREE.CylinderGeometry(1.35, 1.8, 13 + i * 3, 12), steel, x, 6.5 + i * 1.5, 0));
    for (let y = 2.2; y < 13; y += 3) g.add(mesh(new THREE.TorusGeometry(1.52, 0.15, 7, 16), hot, x, y, 0));
  });
  const gear = new THREE.Group();
  gear.position.set(0, 8, 2.2);
  gear.userData.cupQualitySpin = 0.12;
  gear.add(mesh(new THREE.TorusGeometry(4.2, 0.7, 8, 16), steel));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const tooth = mesh(new THREE.BoxGeometry(0.7, 1.5, 0.9), steel, Math.cos(a) * 5, Math.sin(a) * 5, 0);
    tooth.rotation.z = a;
    gear.add(tooth);
  }
  g.add(gear);
  return g;
}

function buildStation(cfg) {
  const g = buildPlinth(cfg, 9);
  const hull = material(0xe8ebf3, { roughness: 0.24, metalness: 0.68, clearcoat: 0.7 });
  const glass = material(cfg.accent, {
    roughness: 0.08, metalness: 0.2, emissive: cfg.accent, emissiveIntensity: 0.65,
    transparent: true, opacity: 0.78, clearcoat: 0.95,
  });
  addOrb(g, hull, 0, 5.2, 0, 5.5, 3.2, 5.5);
  addOrb(g, glass, 0, 6.3, 0, 4.2, 2.3, 4.2);
  const ring = mesh(new THREE.TorusGeometry(8.2, 0.65, 10, 36), hull, 0, 5.5, 0);
  ring.rotation.x = Math.PI / 2;
  ring.userData.cupQualitySpin = 0.025;
  g.add(ring);
  [-1, 1].forEach((side) => {
    const panel = mesh(new THREE.BoxGeometry(7, 0.2, 3.4), material(0x274c88, { metalness: 0.45, clearcoat: 0.78 }), side * 8.5, 6.2, 0);
    panel.rotation.z = side * 0.08;
    g.add(panel);
  });
  return g;
}

function buildFairy(cfg) {
  const g = buildPlinth(cfg, 9);
  const stem = material(0xfff0dc, { roughness: 0.6 });
  const cap = material(cfg.hero, { roughness: 0.3, clearcoat: 0.72 });
  [[0, 12, 3.8], [-4, 7, 2.4], [4.2, 8.5, 2.8]].forEach(([x, h, r], i) => {
    g.add(mesh(new THREE.CylinderGeometry(r * 0.25, r * 0.38, h, 10), stem, x, h * 0.5, i - 1));
    const crown = addOrb(g, i === 0 ? cap : material(i === 1 ? cfg.accent : 0x8c6cff, { clearcoat: 0.7 }), x, h, i - 1, r, r * 0.48, r);
    crown.userData.cupQualityBob = i * 1.7;
    for (let d = 0; d < 5; d++) {
      const a = (d / 5) * TAU;
      addOrb(g, stem, x + Math.cos(a) * r * 0.55, h + r * 0.2, i - 1 + Math.sin(a) * r * 0.55, 0.22);
    }
  });
  return g;
}

function buildThunder(cfg) {
  const g = buildPlinth(cfg, 10);
  const towerMat = material(0xe8e1d3, { roughness: 0.55, metalness: 0.08 });
  const bladeMat = material(cfg.accent, { roughness: 0.3, metalness: 0.42, clearcoat: 0.55 });
  g.add(mesh(new THREE.CylinderGeometry(0.65, 1.45, 13, 10), towerMat, 0, 6.5, 0));
  const rotor = new THREE.Group();
  rotor.position.set(0, 12.4, 1);
  rotor.userData.cupQualityRotor = true;
  rotor.add(mesh(new THREE.SphereGeometry(0.75, 10, 8), bladeMat));
  for (let i = 0; i < 4; i++) {
    const blade = addSoftBlock(rotor, bladeMat, 0, 3.4, 0, 0.6, 6.2, 0.4, 0.16);
    blade.rotation.z = i * Math.PI / 2;
  }
  g.add(rotor);
  const bolt = mesh(new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 16, 0), new THREE.Vector3(-2, 13.5, 0),
      new THREE.Vector3(-3, 11, 0), new THREE.Vector3(1, 8, 0),
    ]), 16, 0.12, 5, false,
  ), material(cfg.accent, { emissive: cfg.accent, emissiveIntensity: 1.5 }), 0, 0, -1);
  bolt.userData.cupQualityPulse = 1.8;
  g.add(bolt);
  return g;
}

function buildSignature(cfg) {
  switch (cfg.kind) {
    case 'coast': return buildLighthouse(cfg);
    case 'carnival': return buildFerrisWheel(cfg);
    case 'metro': return buildMetroTower(cfg, 26, 1);
    case 'citadel': return buildCitadel(cfg);
    case 'ruins': return buildRuins(cfg);
    case 'frost': return buildFrostPeak(cfg);
    case 'foundry': return buildFoundry(cfg);
    case 'station': return buildStation(cfg);
    case 'fairy': return buildFairy(cfg);
    case 'thunder': return buildThunder(cfg);
    default: return new THREE.Group();
  }
}

function buildForeground(cfg, side) {
  if (cfg.kind === 'coast') return buildPalm(cfg, 1.05);
  if (cfg.kind === 'metro') return buildMetroTower(cfg, 16 + (side > 0 ? 3 : 0), side > 0 ? 1 : 0);
  if (cfg.kind === 'frost') return buildFrostPeak(cfg);
  if (cfg.kind === 'fairy') return buildFairy(cfg);
  if (cfg.kind === 'foundry') {
    const pipe = new THREE.Group();
    const m = material(cfg.dark, { roughness: 0.35, metalness: 0.7 });
    pipe.add(mesh(new THREE.CylinderGeometry(1.1, 1.1, 10, 12), m, 0, 5, 0));
    pipe.add(mesh(new THREE.TorusGeometry(2.2, 0.55, 8, 18, Math.PI), m, side * 2.1, 10, 0));
    return pipe;
  }
  if (cfg.kind === 'station') {
    const g = new THREE.Group();
    const rock = material(0x6a6058, { roughness: 0.9, metalness: 0.12 });
    const neon = material(cfg.accent, { emissive: cfg.accent, emissiveIntensity: 1.1, roughness: 0.2 });
    const portal = material(cfg.hero, { emissive: cfg.hero, emissiveIntensity: 0.95, roughness: 0.15 });
    g.add(mesh(new THREE.DodecahedronGeometry(1.8, 0), rock, side * 1.2, 1.4, 0.6));
    g.add(mesh(new THREE.DodecahedronGeometry(1.2, 0), rock, side * 2.4, 2.6, -0.4));
    const ring = mesh(new THREE.TorusGeometry(2.8, 0.28, 10, 32), portal, 0, 4.2, 0);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    g.add(mesh(new THREE.TorusGeometry(3.4, 0.12, 8, 32), neon, 0, 4.2, 0.15));
    return g;
  }
  const g = buildPlinth(cfg, 5, cfg.kind === 'citadel');
  const trunk = material(cfg.dark, { roughness: 0.78 });
  const crown = material(cfg.ground, { roughness: 0.72, clearcoat: 0.2 });
  g.add(mesh(new THREE.CylinderGeometry(0.5, 0.8, 5.5, 9), trunk, 0, 3, 0));
  addOrb(g, crown, 0, 7, 0, 3.2, 2.6, 3.2);
  return g;
}

function buildSkyline(cfg, index) {
  if (cfg.kind === 'metro') return buildMetroTower(cfg, 18 + index * 5, index % 2);
  if (cfg.kind === 'citadel') {
    const g = buildCitadel(cfg);
    g.scale.setScalar(0.68 + index * 0.08);
    return g;
  }
  if (cfg.kind === 'station') {
    const g = buildStation(cfg);
    g.scale.setScalar(0.62 + index * 0.07);
    return g;
  }
  if (cfg.kind === 'coast') return index === 1 ? buildLighthouse(cfg) : buildPalm(cfg, 1.25);
  if (cfg.kind === 'carnival') {
    const g = index === 1 ? buildFerrisWheel(cfg) : buildFairy(cfg);
    g.scale.setScalar(0.7);
    return g;
  }
  if (cfg.kind === 'ruins') {
    const g = buildRuins(cfg);
    g.scale.setScalar(0.65 + index * 0.08);
    return g;
  }
  if (cfg.kind === 'frost' || cfg.kind === 'thunder') {
    const g = buildFrostPeak(cfg);
    g.scale.setScalar(0.72 + index * 0.12);
    return g;
  }
  if (cfg.kind === 'foundry') {
    const g = buildFoundry(cfg);
    g.scale.setScalar(0.62 + index * 0.07);
    return g;
  }
  const g = buildFairy(cfg);
  g.scale.setScalar(0.58 + index * 0.08);
  return g;
}

function buildCloudBank(cfg, index) {
  const group = new THREE.Group();
  const night = cfg.kind === 'metro' || cfg.kind === 'station';
  const cloudMat = material(night ? cfg.atmospheric : 0xfff4e8, {
    roughness: 0.96,
    clearcoat: 0.06,
    transparent: true,
    opacity: night ? 0.24 : 0.78,
  });
  const count = 4 + (index % 2);
  for (let i = 0; i < count; i++) {
    addOrb(
      group,
      cloudMat,
      (i - (count - 1) / 2) * 3.1,
      Math.sin(i * 1.7) * 0.8,
      (i % 2) * 0.7,
      3.8 + (i % 3),
      1.7 + (i % 2) * 0.5,
      2.5 + (i % 2),
    );
  }
  group.scale.setScalar(0.8 + index * 0.12);
  return group;
}

function nearestRoadDistanceXZ(curve, point, samples = 120) {
  let nearestSq = Infinity;
  for (let i = 0; i < samples; i++) {
    const p = curve.getPointAt(i / samples);
    const dx = p.x - point.x;
    const dz = p.z - point.z;
    nearestSq = Math.min(nearestSq, dx * dx + dz * dz);
  }
  return Math.sqrt(nearestSq);
}

function placeOutsideRoad(root, curve, frame, ahead, lateral, clearance) {
  const side = Math.sign(lateral) || 1;
  let distance = Math.abs(lateral);
  // A candidate can cross a parallel hairpin before reaching open terrain.
  // Twenty bounded attempts cover even the widest cup while staying deterministic.
  for (let attempt = 0; attempt < 20; attempt++) {
    root.position.copy(frame.p)
      .addScaledVector(frame.tan, ahead)
      .addScaledVector(frame.n, side * distance);
    if (nearestRoadDistanceXZ(curve, root.position) >= clearance) break;
    distance += 8;
  }
  root.rotation.y = frame.rot;
  root.userData.roadClearance = nearestRoadDistanceXZ(curve, root.position);
  root.userData.visualOnly = true;
  return root.userData.roadClearance;
}

function placeInLaunchFrame(root, curve, frame, ahead, lateral, clearance) {
  root.position.copy(frame.p)
    .addScaledVector(frame.tan, ahead)
    .addScaledVector(frame.n, lateral);
  root.rotation.y = frame.rot;
  root.userData.roadClearance = nearestRoadDistanceXZ(curve, root.position);
  root.userData.launchFrameClearance = Math.abs(lateral);
  root.userData.requiredClearance = clearance;
  root.userData.visualOnly = true;
  return root.userData.launchFrameClearance;
}

function countQualityMeshes(root) {
  let meshes = 0;
  root.traverse((obj) => { if (obj.isMesh) meshes++; });
  return meshes;
}

/**
 * Install a foreground/midground/background composition aligned to the spawn view.
 * Roots are tested against the full spline, not just the local tangent, so figure-8
 * and hairpin tracks cannot receive scenery inside a different road section.
 */
export function installCupReferenceQuality(scene, world, curve, hw, bounds, arenaType, finishT = 0) {
  const cfg = THEMES[arenaType];
  if (!cfg || !isCupTrack(arenaType)) return null;

  const frame = sampleTrackFrame(curve, ((finishT + 0.025) % 1 + 1) % 1);
  const kit = new THREE.Group();
  kit.name = `cup-reference-quality-${arenaType}`;
  kit.userData.cupReferenceQuality = arenaType;
  const clearances = [];

  const addLayer = (obj, name, ahead, lateral, radius) => {
    obj.name = `cup-quality-${name}`;
    obj.userData.compositionLayer = name.split('-')[0];
    clearances.push(placeInLaunchFrame(obj, curve, frame, ahead, lateral, hw + radius + 3));
    kit.add(obj);
  };

  // Foreground framing: asymmetric silhouettes leave the launch lane and vanishing point open.
  const foregroundLeft = buildForeground(cfg, -1);
  const foregroundRight = buildForeground(cfg, 1);
  foregroundLeft.scale.multiplyScalar(0.72);
  foregroundRight.scale.multiplyScalar(0.72);
  addLayer(foregroundLeft, 'foreground-left', 17, -(hw + 8), 4);
  addLayer(foregroundRight, 'foreground-right', 23, hw + 10, 4);

  // Midground hero and counterweight are the first-frame theme read.
  const heroSide = ['metro', 'foundry', 'thunder'].includes(cfg.kind) ? 1 : -1;
  const signature = buildSignature(cfg);
  signature.scale.multiplyScalar(0.58);
  addLayer(signature, 'midground-hero', 28, heroSide * (hw + 7), 6);
  const counter = buildSkyline(cfg, 0);
  counter.scale.multiplyScalar(0.48);
  addLayer(counter, 'midground-counter', 36, -heroSide * (hw + 11), 6);

  // Three staggered background masses create parallax and a readable horizon.
  [-1, 1, -1].forEach((side, i) => {
    const skyline = buildSkyline(cfg, i);
    skyline.scale.multiplyScalar(0.56 + i * 0.08);
    addLayer(skyline, `background-${i}`, 46 + i * 14, side * (hw + 20 + i * 5), 8);
  });

  if (cfg.kind === 'station') {
    [-1, 0, 1].forEach((side, i) => {
      const neb = new THREE.Group();
      const nebMat = material(i === 1 ? cfg.hero : cfg.accent, {
        emissive: i === 1 ? 0xff8844 : cfg.accent,
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.35,
        roughness: 1,
        clearcoat: 0,
      });
      for (let p = 0; p < 4; p++) {
        addOrb(neb, nebMat, (p - 1.5) * 2.2, Math.sin(p) * 0.6, (p % 2) * 0.8, 4 + p, 2.2, 3.5);
      }
      addLayer(neb, `sky-nebula-${i}`, 40 + i * 22, side * (hw + 16 + i * 4), 6);
      neb.position.y += 18 + i * 4;
    });
  } else {
    [-1, 1, -1].forEach((side, i) => {
      const cloud = buildCloudBank(cfg, i);
      addLayer(cloud, `sky-cloud-${i}`, 34 + i * 19, side * (7 + i * 5), 4);
      cloud.position.y += 13 + i * 3.5;
      cloud.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = false;
          obj.receiveShadow = false;
        }
      });
    });
  }

  // Atmospheric depth cards are translucent geometry, never flat image backdrops.
  const hazeMat = material(cfg.atmospheric, {
    roughness: 1, transparent: true, opacity: cfg.kind === 'metro' || cfg.kind === 'station' ? 0.1 : 0.16,
    clearcoat: 0,
  });
  for (let i = 0; i < 5; i++) {
    const haze = addOrb(kit, hazeMat, 0, 0, 0, 9 + i * 2.2, 2.2 + (i % 2), 4.5);
    haze.name = 'cup-quality-atmosphere';
    haze.castShadow = false;
    haze.receiveShadow = false;
    placeOutsideRoad(haze, curve, frame, 62 + i * 14, (i % 2 ? 1 : -1) * (hw + 52 + i * 8), hw + 10);
  }

  world.add(kit);
  const metrics = {
    version: 1,
    arenaType,
    deterministic: true,
    proceduralOnly: true,
    visualOnly: true,
    compositionLayers: { foreground: 2, midground: 2, background: 3, sky: 3, atmosphere: 5 },
    heroObjects: 1,
    skylineObjects: 3,
    meshCount: countQualityMeshes(kit),
    minimumRoadClearance: Number(Math.min(...clearances).toFixed(2)),
    requiredRoadClearance: hw + 8,
    boundsSpan: bounds ? Number(Math.max(bounds.spanX || 0, bounds.spanZ || 0).toFixed(1)) : null,
  };
  scene.userData.cupReferenceQuality = metrics;
  world.userData.cupReferenceQuality = metrics;
  return metrics;
}

export function animateCupReferenceQuality(world, time) {
  const root = world.getObjectByName?.(`cup-reference-quality-${world.userData.cupReferenceQuality?.arenaType}`);
  if (!root) return;
  root.traverse((obj) => {
    if (obj.userData?.cupQualitySpin) obj.rotation.z = time * obj.userData.cupQualitySpin;
    if (obj.userData?.cupQualityRotor) obj.rotation.z = time * 0.75;
    if (obj.userData?.cupQualityBob !== undefined) {
      if (obj.userData.cupQualityBaseY === undefined) obj.userData.cupQualityBaseY = obj.position.y;
      obj.position.y = obj.userData.cupQualityBaseY + Math.sin(time * 0.7 + obj.userData.cupQualityBob) * 0.12;
    }
    if (obj.userData?.cupQualityPulse && obj.material?.emissiveIntensity !== undefined) {
      obj.material.emissiveIntensity = obj.userData.cupQualityPulse * (0.78 + Math.sin(time * 1.6 + obj.id) * 0.22);
    }
  });
}
