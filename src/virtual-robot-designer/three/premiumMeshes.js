/**
 * Premium AAA procedural robot meshes — layered armor, articulated parts,
 * emissive systems, mechanical detail. Used by advanced + hybrid build modes.
 */
import * as THREE from 'three';
import { tagAnim } from './collectAnimatables.js';
import { makeAccentMat, makeDarkMat, addStandardWheels } from './robotTemplates3D.js';
import { getRegistryPart } from '../data/modular-parts-registry.js';

export function makePremiumMat(color, materialId, emissive = 0.15) {
  const presets = {
    plastic: { metalness: 0.35, roughness: 0.38 },
    neon_plastic: { metalness: 0.25, roughness: 0.42 },
    metal: { metalness: 0.92, roughness: 0.14 },
    matte_steel: { metalness: 0.75, roughness: 0.55 },
    aluminum: { metalness: 0.92, roughness: 0.18 },
    titanium: { metalness: 0.88, roughness: 0.28 },
    exotic: { metalness: 0.95, roughness: 0.12 },
    carbon: { metalness: 0.78, roughness: 0.22 },
    industrial: { metalness: 0.55, roughness: 0.32 },
  };
  const p = presets[materialId] || presets.plastic;
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: p.metalness,
    roughness: p.roughness,
    emissive: new THREE.Color(color),
    emissiveIntensity: emissive,
    envMapIntensity: 1.28,
  });
}

function addRivets(group, w, h, d, disposables, count = 6) {
  const rivetMat = makeDarkMat();
  for (let i = 0; i < count; i += 1) {
    const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8), rivetMat);
    rivet.position.set(
      (Math.random() - 0.5) * w * 0.85,
      (Math.random() - 0.5) * h * 0.7,
      d * 0.505,
    );
    group.add(rivet);
    disposables.push(rivet.geometry, rivet.material);
  }
}

function addHydraulic(group, x, y, z, h, disposables) {
  const cyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, h, 10),
    makeAccentMat('#64748b', 0.12),
  );
  cyl.position.set(x, y, z);
  tagAnim(cyl, 'chassis-breathe', { base: 0, amp: 0.015, phase: x * 2 });
  group.add(cyl);
  disposables.push(cyl.geometry, cyl.material);
}

/** Multi-layer chassis with armor plates, AI core window, LED strips, energy shell */
export function buildPremiumBase(base, group, disposables) {
  const w = (base.width ?? 1) * (base.scale ?? 1);
  const h = (base.height ?? 0.62) * (base.scale ?? 1);
  const d = (base.depth ?? 1.2) * (base.scale ?? 1);
  const color = base.color || '#8B00FF';
  const mat = makePremiumMat(color, base.material || 'metal', 0.16);
  const dark = makeDarkMat();
  const accent = makeAccentMat(color, 0.42);
  const glow = makeAccentMat('#00d4ff', 0.9);

  const chassis = new THREE.Group();

  let hull;
  switch (base.shape) {
    case 'round':
    case 'hex':
      hull = new THREE.Mesh(
        new THREE.CylinderGeometry(w * 0.5, w * 0.56, h * 0.88, base.shape === 'hex' ? 6 : 32),
        mat,
      );
      break;
    case 'wedge': {
      hull = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.85, d), mat);
      const nose = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h * 0.5, d * 0.35), mat.clone());
      nose.position.set(0, h * 0.05, d * 0.42);
      nose.rotation.x = -0.35;
      chassis.add(nose);
      disposables.push(nose.geometry, nose.material);
      break;
    }
    default:
      hull = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  }
  hull.castShadow = true;
  hull.receiveShadow = true;
  tagAnim(hull, 'chassis-breathe', { base: 0.14, amp: 0.06 });
  chassis.add(hull);
  disposables.push(hull.geometry, mat);

  // Layered shoulder armor
  [[-1, 1], [-1, -1], [1, 1], [1, -1]].forEach(([sx, sz], i) => {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(w * 0.24, h * 0.38, d * 0.2), accent.clone());
    plate.position.set(sx * w * 0.36, h * 0.06, sz * d * 0.36);
    plate.rotation.y = sx * 0.08;
    plate.castShadow = true;
    tagAnim(plate, 'chassis-breathe', { base: 0, amp: 0.01, phase: i * 0.8 });
    chassis.add(plate);
    disposables.push(plate.geometry, plate.material);
  });

  // Front intake grille
  const grille = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.65, 0.015, 0.02), dark);
    bar.position.set(0, -h * 0.15 + i * h * 0.08, d * 0.505);
    grille.add(bar);
    disposables.push(bar.geometry, bar.material);
  }
  chassis.add(grille);

  // AI core bay
  const coreFrame = new THREE.Mesh(new THREE.BoxGeometry(w * 0.32, h * 0.26, 0.04), dark);
  coreFrame.position.set(0, h * 0.08, d * 0.502);
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(h * 0.11, 1), glow.clone());
  core.position.set(0, h * 0.08, d * 0.52);
  tagAnim(core, 'pulse', { base: 0.75, amp: 0.55 });
  const coreRing = new THREE.Mesh(
    new THREE.TorusGeometry(h * 0.14, 0.012, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 }),
  );
  coreRing.position.set(0, h * 0.08, d * 0.515);
  tagAnim(coreRing, 'spin-y', { speed: 0.8 });
  chassis.add(coreFrame, core, coreRing);
  disposables.push(coreFrame.geometry, coreFrame.material, core.geometry, core.material, coreRing.geometry, coreRing.material);

  // Side LED strips
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 1.3 });
  [-1, 1].forEach((side, i) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.018, h * 0.55, d * 0.82), ledMat.clone());
    strip.position.set(side * w * 0.49, 0, 0);
    tagAnim(strip, 'pulse', { base: 0.85, amp: 0.45, phase: i * 1.4 });
    chassis.add(strip);
    disposables.push(strip.geometry, strip.material);
  });

  // Hydraulics
  addHydraulic(chassis, -w * 0.35, -h * 0.1, d * 0.2, h * 0.35, disposables);
  addHydraulic(chassis, w * 0.35, -h * 0.1, d * 0.2, h * 0.35, disposables);

  addRivets(chassis, w, h, d, disposables);

  // Holographic energy shell
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(w * 1.12, h * 1.12, d * 1.12),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.05, side: THREE.BackSide }),
  );
  tagAnim(shell, 'shell-pulse', { base: 0.05, amp: 0.04 });
  chassis.add(shell);
  disposables.push(shell.geometry, shell.material);

  const floorRing = new THREE.Mesh(
    new THREE.RingGeometry(w * 0.38, w * 0.58, 40),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending }),
  );
  floorRing.rotation.x = -Math.PI / 2;
  floorRing.position.y = -h * 0.52;
  tagAnim(floorRing, 'shell-pulse', { base: 0.12, amp: 0.1 });
  chassis.add(floorRing);
  disposables.push(floorRing.geometry, floorRing.material);

  group.add(chassis);
  return { mainMesh: hull, bodyW: w, bodyH: h, bodyD: d, chassisGroup: chassis };
}

const WHEEL_TYPE_MAP = {
  standard: 'standard', heavy: 'standard', omni: 'mecanum',
  tracks: 'tracks', legs: 'legs', hover: 'hover', jet: 'hover',
};

export function buildMovementSystem(group, partId, dims, design, disposables) {
  const type = WHEEL_TYPE_MAP[partId] || 'standard';
  const d = {
    ...design,
    wheels: {
      ...design.wheels,
      type,
      count: type === 'legs' ? 6 : type === 'tracks' ? 2 : 4,
      size: partId === 'heavy' ? 'large' : partId === 'jet' ? 'small' : 'medium',
      motor: partId === 'jet' ? 'turbo' : design.wheels?.motor,
    },
  };
  addStandardWheels(group, d, dims, disposables);

  if (partId === 'jet') {
    const { bodyD, bodyH } = dims;
    [-1, 1].forEach((side) => {
      const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.15, 12), makeDarkMat());
      housing.rotation.x = Math.PI / 2;
      housing.position.set(side * 0.28, -bodyH * 0.08, -bodyD * 0.52);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 10), makeAccentMat('#ff6b35', 1));
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(side * 0.28, -bodyH * 0.08, -bodyD * 0.72);
      tagAnim(flame, 'pulse', { base: 0.8, amp: 0.6 });
      group.add(housing, flame);
      disposables.push(housing.geometry, housing.material, flame.geometry, flame.material);
    });
  }

  if (partId === 'hover') {
    const { bodyW, bodyD } = dims;
    [[-bodyW * 0.35, bodyD * 0.3], [bodyW * 0.35, bodyD * 0.3], [-bodyW * 0.35, -bodyD * 0.3], [bodyW * 0.35, -bodyD * 0.3]].forEach(([x, z], i) => {
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.06, 16), makeAccentMat('#06b6d4', 0.5));
      pod.position.set(x, -dims.bodyH * 0.45, z);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.015, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5 }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, -dims.bodyH * 0.48, z);
      tagAnim(ring, 'pulse', { base: 0.3, amp: 0.25, phase: i * 0.5 });
      group.add(pod, ring);
      disposables.push(pod.geometry, pod.material, ring.geometry, ring.material);
    });
  }
}

function buildHeadModule(partId, color, disposables) {
  const g = new THREE.Group();
  const body = makePremiumMat(color, 'metal', 0.2);
  const glow = makeAccentMat('#00d4ff', 0.85);
  const dark = makeDarkMat();

  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.24), body);
  skull.castShadow = true;
  g.add(skull);
  disposables.push(skull.geometry, body);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.02), makeAccentMat(partId === 'ai_visor' ? '#a855f7' : '#00ff88', 0.7));
  visor.position.set(0, 0.02, 0.13);
  tagAnim(visor, 'pulse', { base: 0.5, amp: 0.4 });
  g.add(visor);
  disposables.push(visor.geometry, visor.material);

  if (partId === 'camera' || partId === 'tactical') {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.05, 16), glow.clone());
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0, 0.14);
    g.add(lens);
    disposables.push(lens.geometry, lens.material);
  }

  if (partId === 'holo_face') {
    const holo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.14),
      new THREE.MeshBasicMaterial({ color: 0xff006e, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
    );
    holo.position.set(0, 0.04, 0.13);
    tagAnim(holo, 'pulse', { base: 0.4, amp: 0.3 });
    g.add(holo);
    disposables.push(holo.geometry, holo.material);
  }

  if (partId === 'radar_pod') {
    const basePod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.08, 16), dark);
    basePod.position.y = 0.12;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), glow.clone());
    dome.position.y = 0.16;
    tagAnim(dome, 'spin-y', { speed: 1.6 });
    g.add(basePod, dome);
    disposables.push(basePod.geometry, basePod.material, dome.geometry, dome.material);
  }

  return g;
}

function buildSensorModule(partId, disposables) {
  const g = new THREE.Group();
  const glow = makeAccentMat('#00d4ff', 0.9);

  if (partId === 'lidar') {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.12, 16), makeDarkMat());
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), glow.clone());
    dome.position.y = 0.08;
    tagAnim(dome, 'spin-y', { speed: 2 });
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.001, 0.08, 0.5, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide }),
    );
    beam.rotation.x = Math.PI / 2;
    beam.position.set(0, 0.08, 0.25);
    g.add(pillar, dome, beam);
    disposables.push(pillar.geometry, pillar.material, dome.geometry, dome.material, beam.geometry, beam.material);
    return g;
  }

  if (partId === 'ultrasonic') {
    const us = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.07, 16), glow.clone());
    us.rotation.x = Math.PI / 2;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.008, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.5 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.z = 0.04;
    tagAnim(ring, 'pulse', { base: 0.4, amp: 0.5 });
    g.add(us, ring);
    disposables.push(us.geometry, us.material, ring.geometry, ring.material);
    return g;
  }

  if (partId === 'thermal') {
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.1), makeAccentMat('#ef4444', 0.4));
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.03, 12), makeAccentMat('#f97316', 0.6));
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.06;
    g.add(cam, lens);
    disposables.push(cam.geometry, cam.material, lens.geometry, lens.material);
    return g;
  }

  const pod = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.08), makeAccentMat('#22d3ee', 0.35));
  g.add(pod);
  disposables.push(pod.geometry, pod.material);
  return g;
}

function buildUtilityModule(partId, color, disposables) {
  const g = new THREE.Group();

  if (partId === 'blade') {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.38, 0.08), makeAccentMat('#64748b', 0.2));
    const edge = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.04, 0.02), makeAccentMat('#94a3b8', 0.5));
    edge.position.set(0, 0.18, 0.045);
    g.add(blade, edge);
    disposables.push(blade.geometry, blade.material, edge.geometry, edge.material);
    return g;
  }

  if (partId === 'claw' || partId === 'gripper') {
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), makePremiumMat(color, 'metal', 0.25));
    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.09), makePremiumMat(color, 'metal', 0.2));
    upperArm.position.y = -0.18;
    const elbow = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 16), makeDarkMat());
    elbow.rotation.y = Math.PI / 2;
    elbow.position.y = -0.34;
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.22, 0.07), makePremiumMat(color, 'metal', 0.18));
    forearm.position.y = -0.48;
    [-1, 1].forEach((s) => {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.14, 0.045), makeAccentMat('#cbd5e1', 0.15));
      finger.position.set(s * 0.045, -0.62, 0);
      finger.rotation.z = s * 0.15;
      g.add(finger);
      disposables.push(finger.geometry, finger.material);
    });
    g.add(shoulder, upperArm, elbow, forearm);
    disposables.push(shoulder.geometry, shoulder.material, upperArm.geometry, upperArm.material, elbow.geometry, elbow.material, forearm.geometry, forearm.material);
    return g;
  }

  if (partId === 'magnet') {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 12), makeDarkMat());
    const mag = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 20), makeAccentMat('#ef4444', 0.55));
    mag.position.y = -0.2;
    tagAnim(mag, 'pulse', { base: 0.4, amp: 0.35 });
    g.add(arm, mag);
    disposables.push(arm.geometry, arm.material, mag.geometry, mag.material);
    return g;
  }

  if (partId === 'laser') {
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.35), makeDarkMat());
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.4, 12), makeAccentMat('#ff00ff', 0.95));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.22;
    tagAnim(barrel, 'pulse', { base: 0.6, amp: 0.7 });
    g.add(housing, barrel);
    disposables.push(housing.geometry, housing.material, barrel.geometry, barrel.material);
    return g;
  }

  const generic = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.35, 14), makePremiumMat(color, 'metal', 0.22));
  g.add(generic);
  disposables.push(generic.geometry, generic.material);
  return g;
}

function buildPowerModule(partId, disposables) {
  const g = new THREE.Group();
  if (partId === 'fusion') {
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), makeDarkMat());
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 8, 32), makeAccentMat('#00d4ff', 0.8));
    const ring2 = ring1.clone();
    ring2.rotation.x = Math.PI / 2;
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 1), makeAccentMat('#00d4ff', 1.5));
    tagAnim(core, 'pulse', { base: 0.9, amp: 0.75 });
    tagAnim(ring1, 'spin-y', { speed: 1.2 });
    tagAnim(ring2, 'spin-y', { speed: -0.9 });
    g.add(housing, ring1, ring2, core);
    disposables.push(housing.geometry, housing.material, ring1.geometry, ring1.material, ring2.geometry, ring2.material, core.geometry, core.material);
    return g;
  }
  if (partId === 'solar') {
    [-1, 1].forEach((s) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.22), makeAccentMat('#1e3a5f', 0.15));
      panel.position.set(s * 0.18, 0, 0);
      panel.rotation.z = s * 0.25;
      g.add(panel);
      disposables.push(panel.geometry, panel.material);
    });
    return g;
  }
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.16), makeAccentMat('#fbbf24', 0.25));
  const cells = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.02), makeAccentMat('#f59e0b', 0.15));
  cells.position.z = 0.09;
  g.add(pack, cells);
  disposables.push(pack.geometry, pack.material, cells.geometry, cells.material);
  return g;
}

function buildCommsModule(partId, disposables) {
  const g = new THREE.Group();
  if (partId === 'dish') {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.25, 10), makeDarkMat());
    arm.position.y = 0.12;
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.04, 24), makeAccentMat('#e2e8f0', 0.2));
    dish.rotation.x = Math.PI / 2;
    dish.position.set(0, 0.26, 0);
    g.add(arm, dish);
    disposables.push(arm.geometry, arm.material, dish.geometry, dish.material);
    return g;
  }
  if (partId === 'holo_proj') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.06, 12), makeDarkMat());
    const holo = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.2, 4),
      new THREE.MeshBasicMaterial({ color: 0xff006e, transparent: true, opacity: 0.35, wireframe: true }),
    );
    holo.position.y = 0.16;
    tagAnim(holo, 'spin-y', { speed: 0.6 });
    g.add(base, holo);
    disposables.push(base.geometry, base.material, holo.geometry, holo.material);
    return g;
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.42, 10), makeDarkMat());
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), makeAccentMat('#ff006e', 0.85));
  tip.position.y = 0.24;
  tagAnim(tip, 'pulse', { base: 0.55, amp: 0.45 });
  g.add(pole, tip);
  disposables.push(pole.geometry, pole.material, tip.geometry, tip.material);
  return g;
}

/** Premium multi-axis robot arm for advanced engineering mode */
export function buildPremiumArm(group, disposables, color = '#eceff1') {
  const white = makePremiumMat(color, 'metal', 0.12);
  const gray = makeAccentMat('#b0bec5', 0.2);
  const dark = makeDarkMat();
  const glow = makeAccentMat('#00d4ff', 0.7);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 0.2, 32), dark);
  base.position.y = -0.54;
  base.castShadow = true;
  group.add(base);
  disposables.push(base.geometry, base.material);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.38, 24), gray);
  pedestal.position.y = -0.36;
  group.add(pedestal);
  disposables.push(pedestal.geometry, pedestal.material);

  const segments = [
    { h: 0.52, r: 0.15, y: -0.02, rx: 0 },
    { h: 0.48, r: 0.13, y: 0.32, rx: -0.45 },
    { h: 0.42, r: 0.11, y: 0.68, rx: 0.75 },
    { h: 0.2, r: 0.09, y: 1.02, rx: -0.55 },
  ];

  const armRoot = new THREE.Group();
  armRoot.position.y = -0.12;

  segments.forEach((seg, i) => {
    const link = new THREE.Group();
    link.position.y = seg.y;
    link.rotation.x = seg.rx;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(seg.r * 0.88, seg.r, seg.h, 22), white.clone());
    body.position.y = seg.h / 2;
    body.castShadow = true;
    link.add(body);
    disposables.push(body.geometry, body.material);

    const joint = new THREE.Mesh(new THREE.TorusGeometry(seg.r * 1.05, seg.r * 0.12, 10, 28), dark.clone());
    joint.rotation.x = Math.PI / 2;
    link.add(joint);
    disposables.push(joint.geometry, joint.material);

    if (i < segments.length - 1) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(seg.r, 16, 16), gray.clone());
      cap.position.y = seg.h;
      link.add(cap);
      disposables.push(cap.geometry, cap.material);
    }
    armRoot.add(link);
  });

  const wrist = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 0.2), gray.clone());
  wrist.position.set(0, 1.18, 0.1);
  wrist.rotation.x = -0.35;
  armRoot.add(wrist);
  disposables.push(wrist.geometry, wrist.material);

  const tool = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.22, 14), dark.clone());
  tool.rotation.x = Math.PI / 2;
  tool.position.set(0, 1.14, 0.28);
  armRoot.add(tool);
  disposables.push(tool.geometry, tool.material);

  [-1, 1].forEach((s) => {
    const finger = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.09, 0.045), gray.clone());
    finger.position.set(s * 0.04, 1.1, 0.36);
    armRoot.add(finger);
    disposables.push(finger.geometry, finger.material);
  });

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), glow.clone());
  core.position.set(0, 0.5, 0.15);
  tagAnim(core, 'pulse', { base: 0.6, amp: 0.5 });
  armRoot.add(core);
  disposables.push(core.geometry, core.material);

  tagAnim(armRoot, 'chassis-breathe', { base: 0, amp: 0.015 });
  group.add(armRoot);

  return { mainMesh: base, bodyW: 1.15, bodyH: 1.45, bodyD: 1.15, isArm: true };
}

function buildArmorModule(color, disposables) {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.04), makePremiumMat(color, 'metal', 0.12));
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.02), makeAccentMat('#94a3b8', 0.35));
  ridge.position.set(0, 0.06, 0.025);
  plate.castShadow = true;
  g.add(plate, ridge);
  disposables.push(plate.geometry, plate.material, ridge.geometry, ridge.material);
  return g;
}

function buildStructureModule(color, disposables) {
  const g = new THREE.Group();
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.06), makePremiumMat(color, 'metal', 0.1));
  const joint = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 10), makeDarkMat());
  joint.position.set(0.12, 0, 0);
  g.add(beam, joint);
  disposables.push(beam.geometry, beam.material, joint.geometry, joint.material);
  return g;
}

function buildLightingModule(color, disposables) {
  const g = new THREE.Group();
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.08), makeDarkMat());
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.02, 12), makeAccentMat(color || '#fbbf24', 0.9));
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 0.045;
  tagAnim(lens, 'pulse', { base: 0.55, amp: 0.45 });
  g.add(housing, lens);
  disposables.push(housing.geometry, housing.material, lens.geometry, lens.material);
  return g;
}

function buildFaceModule(partId, color, disposables) {
  const g = new THREE.Group();
  const glow = makeAccentMat(color || '#00d4ff', 0.85);
  if (partId === 'digital_mouth') {
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), glow);
    mouth.position.y = -0.04;
    g.add(mouth);
    disposables.push(mouth.geometry, mouth.material);
    return g;
  }
  [-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), glow.clone());
    eye.position.set(s * 0.06, 0.02, 0.04);
    tagAnim(eye, 'pulse', { base: 0.5, amp: 0.4, phase: s });
    g.add(eye);
    disposables.push(eye.geometry, eye.material);
  });
  if (partId === 'sensor_array') {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.06), makeAccentMat('#22d3ee', 0.4));
    bar.position.y = -0.05;
    g.add(bar);
    disposables.push(bar.geometry, bar.material);
  }
  return g;
}

function buildDecorationModule(color, disposables) {
  const g = new THREE.Group();
  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 3), makePremiumMat(color, 'plastic', 0.2));
  fin.rotation.z = Math.PI / 2;
  tagAnim(fin, 'chassis-breathe', { base: 0, amp: 0.02 });
  g.add(fin);
  disposables.push(fin.geometry, fin.material);
  return g;
}

function buildMovementBadge(partId, color, disposables) {
  const g = new THREE.Group();
  const meta = getRegistryPart('movement', partId);
  const wt = meta?.wheelType || 'standard';
  if (wt === 'tracks') {
    const track = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.14), makeDarkMat());
    g.add(track);
    disposables.push(track.geometry, track.material);
    return g;
  }
  if (wt === 'legs') {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.2, 8), makePremiumMat(color, 'metal', 0.15));
    leg.position.y = -0.1;
    g.add(leg);
    disposables.push(leg.geometry, leg.material);
    return g;
  }
  if (wt === 'hover') {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 12), makeAccentMat('#06b6d4', 0.5));
    g.add(pod);
    disposables.push(pod.geometry, pod.material);
    return g;
  }
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), makeDarkMat());
  wheel.rotation.z = Math.PI / 2;
  g.add(wheel);
  disposables.push(wheel.geometry, wheel.material);
  return g;
}

function buildPlaneWingModule(color, disposables) {
  const g = new THREE.Group();
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.14), makePremiumMat(color || '#94a3b8', 'metal', 0.12));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 3), makeAccentMat('#00d4ff', 0.35));
  tip.rotation.z = -Math.PI / 2;
  tip.position.set(0.22, 0, 0);
  g.add(wing, tip);
  disposables.push(wing.geometry, wing.material, tip.geometry, tip.material);
  return g;
}

function buildPlaneStabilizerModule(disposables) {
  const g = new THREE.Group();
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.02), makePremiumMat('#64748b', 'metal', 0.1));
  g.add(fin);
  disposables.push(fin.geometry, fin.material);
  return g;
}

function buildPlaneExhaustModule(disposables) {
  const g = new THREE.Group();
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.12, 12), makeDarkMat());
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 10), makeAccentMat('#ff6b35', 1));
  flame.position.z = -0.14;
  tagAnim(flame, 'pulse', { base: 0.7, amp: 0.5 });
  g.add(nozzle, flame);
  disposables.push(nozzle.geometry, nozzle.material, flame.geometry, flame.material);
  return g;
}

function buildPlaneCanopyModule(disposables) {
  const g = new THREE.Group();
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.1, roughness: 0.15, transparent: true, opacity: 0.55 }),
  );
  g.add(canopy);
  disposables.push(canopy.geometry, canopy.material);
  return g;
}

function buildSecuritySpotlightModule(disposables) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.06, 12), makeDarkMat());
  const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 12), makeAccentMat('#fef08a', 0.95));
  lamp.rotation.x = Math.PI / 2;
  lamp.position.z = 0.08;
  tagAnim(lamp, 'pulse', { base: 0.6, amp: 0.35 });
  g.add(base, lamp);
  disposables.push(base.geometry, base.material, lamp.geometry, lamp.material);
  return g;
}

function buildSecuritySirenModule(disposables) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 16), makeAccentMat('#ef4444', 0.7));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), makeAccentMat('#3b82f6', 0.8));
  dome.position.y = 0.06;
  tagAnim(dome, 'spin-y', { speed: 2.5 });
  g.add(body, dome);
  disposables.push(body.geometry, body.material, dome.geometry, dome.material);
  return g;
}

function buildLegoBlockModule(color, disposables) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.14), makePremiumMat(color || '#ef4444', 'plastic', 0.05));
  const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), makePremiumMat(color || '#ef4444', 'plastic', 0.08));
  stud.position.y = 0.05;
  g.add(body, stud);
  disposables.push(body.geometry, body.material, stud.geometry, stud.material);
  return g;
}

function buildLegoClawModule(color, disposables) {
  const g = new THREE.Group();
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.08), makePremiumMat(color || '#fbbf24', 'plastic', 0.08));
  [-1, 1].forEach((s) => {
    const finger = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.06), makePremiumMat('#fbbf24', 'plastic', 0.08));
    finger.position.set(s * 0.05, 0.02, 0.04);
    g.add(finger);
    disposables.push(finger.geometry, finger.material);
  });
  g.add(palm);
  disposables.push(palm.geometry, palm.material);
  return g;
}

function buildMedicalScannerModule(disposables) {
  const g = new THREE.Group();
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.16, 10), makePremiumMat('#e2e8f0', 'metal', 0.1));
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, 0.07),
    new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.75, side: THREE.DoubleSide }),
  );
  screen.position.set(0, 0.06, 0.06);
  tagAnim(screen, 'pulse', { base: 0.4, amp: 0.3 });
  g.add(arm, screen);
  disposables.push(arm.geometry, arm.material, screen.geometry, screen.material);
  return g;
}

function buildConnectorHubModule(color, disposables) {
  const g = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.05, 8), makePremiumMat(color || '#64748b', 'metal', 0.2));
  for (let i = 0; i < 4; i += 1) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 6), makeAccentMat('#fbbf24', 0.5));
    const a = (i / 4) * Math.PI * 2;
    pin.position.set(Math.cos(a) * 0.05, 0.03, Math.sin(a) * 0.05);
    g.add(pin);
    disposables.push(pin.geometry, pin.material);
  }
  g.add(hub);
  disposables.push(hub.geometry, hub.material);
  return g;
}

function buildEffectShieldModule(disposables) {
  const g = new THREE.Group();
  const shield = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, wireframe: true }),
  );
  tagAnim(shield, 'pulse', { base: 0.25, amp: 0.15 });
  g.add(shield);
  disposables.push(shield.geometry, shield.material);
  return g;
}

function buildEffectSmokeModule(disposables) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 + i * 0.02, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.35 }),
    );
    puff.position.set((i - 1) * 0.04, i * 0.03, 0.05);
    tagAnim(puff, 'chassis-breathe', { base: 0, amp: 0.03, phase: i });
    g.add(puff);
    disposables.push(puff.geometry, puff.material);
  }
  return g;
}

function buildHoverRingModule(disposables) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.012, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.65 }),
  );
  ring.rotation.x = Math.PI / 2;
  tagAnim(ring, 'spin-y', { speed: 1.2 });
  g.add(ring);
  disposables.push(ring.geometry, ring.material);
  return g;
}

function resolveSpecializedVisual(visual, partId, color, disposables) {
  switch (visual) {
    case 'plane_wing': return buildPlaneWingModule(color, disposables);
    case 'plane_stabilizer': return buildPlaneStabilizerModule(disposables);
    case 'plane_exhaust': return buildPlaneExhaustModule(disposables);
    case 'plane_canopy': return buildPlaneCanopyModule(disposables);
    case 'security_spotlight': return buildSecuritySpotlightModule(disposables);
    case 'security_siren': return buildSecuritySirenModule(disposables);
    case 'lego_block':
    case 'lego_gear':
    case 'lego_hinge':
    case 'lego_motor':
    case 'lego_wheel':
    case 'lego_prop':
    case 'lego_eyes': return buildLegoBlockModule(color, disposables);
    case 'lego_claw': return buildLegoClawModule(color, disposables);
    case 'medical_scanner': return buildMedicalScannerModule(disposables);
    case 'connector_hub': return buildConnectorHubModule(color, disposables);
    case 'effect_shield': return buildEffectShieldModule(disposables);
    case 'effect_smoke':
    case 'effect_thruster':
    case 'effect_glow': return buildEffectSmokeModule(disposables);
    case 'hover_ring': return buildHoverRingModule(disposables);
    case 'drone_guard': {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.01, 6, 16, Math.PI), makeAccentMat('#64748b', 0.3));
      const grp = new THREE.Group();
      grp.add(arc);
      disposables.push(arc.geometry, arc.material);
      return grp;
    }
    default: return null;
  }
}

function resolveSensorMeshKey(partId, visual) {
  if (visual === 'sensor_lidar' || /lidar|radar|laser_range/i.test(partId)) return 'lidar';
  if (visual === 'sensor_thermal' || /thermal|infrared|night_vision|heat/i.test(partId)) return 'thermal';
  if (visual === 'sensor_ultrasonic' || partId === 'ultrasonic') return 'ultrasonic';
  return partId;
}

function resolvePowerMeshKey(partId) {
  if (/fusion|reactor|energy_conduit/i.test(partId)) return 'fusion';
  if (/solar/i.test(partId)) return 'solar';
  return partId;
}

function resolveCommsMeshKey(partId, visual) {
  if (visual === 'comms_dish' || /dish|sat_dish|comm_tower/i.test(partId)) return 'dish';
  if (visual === 'comms_holo' || /holo/i.test(partId)) return 'holo_proj';
  return partId;
}

/** Build a detailed attachable module for any workshop category */
export function buildAttachedPart(category, partId, color, disposables) {
  const reg = getRegistryPart(category, partId);
  const visual = reg?.visual;
  const specialized = resolveSpecializedVisual(visual, partId, color, disposables);
  if (specialized) return specialized;
  if (visual === 'medical_scanner' || /medical|medicine|emergency_kit/i.test(partId)) {
    return buildMedicalScannerModule(disposables);
  }

  switch (category) {
    case 'head':
      if (visual === 'head_radar' || partId === 'radar_pod') return buildHeadModule('radar_pod', color, disposables);
      return buildHeadModule(partId, color, disposables);
    case 'face':
      return buildFaceModule(partId, color, disposables);
    case 'sensors':
      return buildSensorModule(resolveSensorMeshKey(partId, visual), disposables);
    case 'utility':
      if (visual === 'arm_blade' || partId === 'blade' || partId === 'scoop') return buildUtilityModule('blade', color, disposables);
      if (visual === 'arm_fork' || /forklift|crane/i.test(partId)) return buildUtilityModule('claw', color, disposables);
      if (visual === 'arm_magnet' || partId === 'magnet' || partId === 'suction') return buildUtilityModule('magnet', color, disposables);
      if (visual === 'arm_laser' || /laser|weld/i.test(partId)) return buildUtilityModule('laser', color, disposables);
      if (visual === 'arm_claw' || /claw|gripper|hand|tentacle/i.test(partId)) return buildUtilityModule('claw', color, disposables);
      return buildUtilityModule(partId, color, disposables);
    case 'power':
    case 'ai':
      return buildPowerModule(resolvePowerMeshKey(partId), disposables);
    case 'comms':
      return buildCommsModule(resolveCommsMeshKey(partId, visual), disposables);
    case 'armor':
      return buildArmorModule(color, disposables);
    case 'structure':
      return buildStructureModule(color, disposables);
    case 'lighting':
    case 'cosmetic':
      if (visual === 'decoration') return buildDecorationModule(color, disposables);
      if (visual === 'armor') return buildArmorModule(color, disposables);
      return buildLightingModule(color, disposables);
    case 'decoration':
      if (visual === 'comms_holo') return buildCommsModule('holo_proj', disposables);
      return buildDecorationModule(color, disposables);
    case 'movement':
      return buildMovementBadge(partId, color, disposables);
    case 'fun':
      if (partId === 'disco' || partId === 'disco_lights') {
        const g = new THREE.Group();
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), makeAccentMat('#ec4899', 0.8));
        tagAnim(ball, 'chaos-spin');
        g.add(ball);
        disposables.push(ball.geometry, ball.material);
        return g;
      }
      if (/foam|confetti|paint/i.test(partId)) return buildUtilityModule('laser', color, disposables);
      if (partId === 'turbo') return buildPowerModule('fusion', disposables);
      if (partId === 'led_projector') return buildCommsModule('holo_proj', disposables);
      return buildUtilityModule('laser', color, disposables);
    default: {
      const deco = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), makeAccentMat(color, 0.75));
      tagAnim(deco, 'chaos-spin');
      const g = new THREE.Group();
      g.add(deco);
      disposables.push(deco.geometry, deco.material);
      return g;
    }
  }
}
