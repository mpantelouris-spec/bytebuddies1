import * as THREE from 'three';
import { tagAnim } from './collectAnimatables.js';
import { addStandardWheels } from './robotTemplates3D.js';

/** Rocksi-style clean industrial materials — white robot on dark grid */
export function makeIndustrialWhite() {
  return new THREE.MeshStandardMaterial({
    color: 0xeceff1,
    metalness: 0.15,
    roughness: 0.42,
    envMapIntensity: 0.8,
  });
}

export function makeIndustrialGray() {
  return new THREE.MeshStandardMaterial({
    color: 0xb0bec5,
    metalness: 0.35,
    roughness: 0.38,
  });
}

export function makeIndustrialDark() {
  return new THREE.MeshStandardMaterial({
    color: 0x37474f,
    metalness: 0.5,
    roughness: 0.35,
  });
}

export function makeIndustrialAccent(hex = 0x29b6f6) {
  return new THREE.MeshStandardMaterial({
    color: hex,
    metalness: 0.2,
    roughness: 0.4,
    emissive: new THREE.Color(hex),
    emissiveIntensity: 0.08,
  });
}

function addJoint(group, radius, y, disposables) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, radius * 0.18, 12, 32),
    makeIndustrialDark(),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = y;
  group.add(ring);
  disposables.push(ring.geometry, ring.material);
}

/** Multi-axis robot arm like Rocksi / Franka reference */
export function buildIndustrialArm(group, disposables) {
  const white = makeIndustrialWhite();
  const gray = makeIndustrialGray();
  const dark = makeIndustrialDark();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.18, 32), dark);
  base.position.y = -0.55;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  disposables.push(base.geometry, base.material);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.35, 24), gray);
  pedestal.position.y = -0.38;
  group.add(pedestal);
  disposables.push(pedestal.geometry, pedestal.material);

  const segments = [
    { h: 0.55, r: 0.14, y: -0.05, rx: 0 },
    { h: 0.5, r: 0.12, y: 0.35, rx: -0.4 },
    { h: 0.45, r: 0.1, y: 0.72, rx: 0.8 },
    { h: 0.22, r: 0.085, y: 1.05, rx: -0.5 },
  ];

  const armGroup = new THREE.Group();
  armGroup.position.y = -0.15;

  segments.forEach((seg, i) => {
    const link = new THREE.Group();
    link.position.y = seg.y;
    link.rotation.x = seg.rx;

    const body = new THREE.Mesh(new THREE.CylinderGeometry(seg.r * 0.85, seg.r, seg.h, 20), white.clone());
    body.position.y = seg.h / 2;
    body.castShadow = true;
    link.add(body);
    disposables.push(body.geometry, body.material);

    addJoint(link, seg.r * 1.1, 0, disposables);

    if (i < segments.length - 1) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(seg.r * 0.95, 16, 16), gray.clone());
      cap.position.y = seg.h;
      link.add(cap);
      disposables.push(cap.geometry, cap.material);
    }

    armGroup.add(link);
  });

  const wrist = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.18), gray.clone());
  wrist.position.set(0, 1.22, 0.08);
  wrist.rotation.x = -0.3;
  armGroup.add(wrist);
  disposables.push(wrist.geometry, wrist.material);

  const tool = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.2, 12), dark.clone());
  tool.rotation.x = Math.PI / 2;
  tool.position.set(0, 1.18, 0.22);
  armGroup.add(tool);
  disposables.push(tool.geometry, tool.material);

  const fingerL = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.08, 0.04), gray.clone());
  fingerL.position.set(-0.035, 1.15, 0.32);
  const fingerR = fingerL.clone();
  fingerR.position.x = 0.035;
  armGroup.add(fingerL, fingerR);
  disposables.push(fingerL.geometry, fingerL.material);

  tagAnim(armGroup, 'chassis-breathe', { base: 0, amp: 0.02 });
  group.add(armGroup);

  return { mainMesh: base, bodyW: 1.1, bodyH: 1.4, bodyD: 1.1, isArm: true };
}

/** Clean white mobile robot body — professional lab aesthetic */
export function buildIndustrialMobileBase(base, group, disposables) {
  const w = (base.width ?? 1) * (base.scale ?? 1);
  const h = (base.height ?? 0.62) * (base.scale ?? 1);
  const d = (base.depth ?? 1.2) * (base.scale ?? 1);
  const tint = base.color && base.color !== '#8B00FF' ? new THREE.Color(base.color) : new THREE.Color(0xeceff1);

  const white = new THREE.MeshStandardMaterial({
    color: tint,
    metalness: 0.12,
    roughness: 0.45,
  });
  const gray = makeIndustrialGray();
  const dark = makeIndustrialDark();
  const accent = makeIndustrialAccent();

  let hull;
  switch (base.shape) {
    case 'round':
    case 'hex':
      hull = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.5, w * 0.54, h, base.shape === 'hex' ? 6 : 32), white);
      break;
    case 'wedge':
      hull = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), white);
      hull.rotation.x = -0.08;
      break;
    default:
      hull = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), white);
  }
  hull.castShadow = true;
  hull.receiveShadow = true;
  group.add(hull);
  disposables.push(hull.geometry, white);

  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 0.04, d * 0.88), gray);
  topPlate.position.y = h * 0.48;
  group.add(topPlate);
  disposables.push(topPlate.geometry, topPlate.material);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, h * 0.15, 0.06), dark);
  bumper.position.set(0, -h * 0.05, d * 0.5);
  group.add(bumper);
  disposables.push(bumper.geometry, bumper.material);

  const sensorBar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 0.06, 0.04), accent);
  sensorBar.position.set(0, h * 0.15, d * 0.51);
  group.add(sensorBar);
  disposables.push(sensorBar.geometry, sensorBar.material);

  [-1, 1].forEach((side) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.03, h * 0.4, d * 0.6), gray.clone());
    panel.position.set(side * w * 0.48, 0, 0);
    group.add(panel);
    disposables.push(panel.geometry, panel.material);
  });

  return { mainMesh: hull, bodyW: w, bodyH: h, bodyD: d, isArm: false };
}

const WHEEL_TYPE_MAP = {
  standard: 'standard', small_wheels: 'standard', heavy: 'standard', racing_wheels: 'standard',
  omni: 'mecanum', mecanum: 'mecanum', magnetic_wheels: 'standard', glow_wheels: 'standard',
  tracks: 'tracks', mini_tracks: 'tracks', rubber_tracks: 'tracks',
  legs: 'legs', spider_legs: 'legs', hydraulic_legs: 'legs', walker: 'legs', climbing_legs: 'legs',
  hover: 'hover', jet: 'hover', rotors: 'hover', quad_props: 'hover', antigrav: 'hover',
  amphibious_prop: 'hover', magnetic_rail: 'mecanum',
};

export function buildIndustrialMovement(group, partId, dims, design, disposables) {
  const type = WHEEL_TYPE_MAP[partId] || 'standard';
  const d = {
    ...design,
    wheels: {
      ...design.wheels,
      type,
      count: type === 'legs' ? 6 : type === 'tracks' ? 2 : 4,
      size: partId === 'heavy' ? 'large' : 'medium',
    },
  };
  addStandardWheels(group, d, dims, disposables);
}

export function buildIndustrialPart(category, partId, disposables) {
  const g = new THREE.Group();
  const white = makeIndustrialWhite();
  const gray = makeIndustrialGray();
  const dark = makeIndustrialDark();
  const accent = makeIndustrialAccent();
  const add = (mesh) => {
    mesh.castShadow = true;
    g.add(mesh);
    disposables.push(mesh.geometry, mesh.material);
  };

  if (category === 'head' || category === 'sensors') {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.14), white);
    add(head);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 16), dark);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0, 0.08);
    add(lens);
    if (partId === 'lidar' || partId === 'radar_pod') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), accent);
      dome.position.y = 0.08;
      tagAnim(dome, 'spin-y', { speed: 1.2 });
      add(dome);
    }
    return g;
  }

  if (category === 'utility') {
    if (partId === 'claw' || partId === 'gripper') {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.08), gray);
      add(arm);
      [-1, 1].forEach((s) => {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.05), gray.clone());
        f.position.set(s * 0.05, -0.2, 0);
        add(f);
      });
    } else if (partId === 'blade') {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.3, 0.06), gray));
    } else {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 14), gray));
    }
    return g;
  }

  if (category === 'power') {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.15), partId === 'fusion' ? accent : gray));
    return g;
  }

  if (category === 'comms') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.35, 10), gray);
    add(pole);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), accent));
    return g;
  }

  if (category === 'armor' || category === 'structure') {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.12), gray));
    return g;
  }

  if (category === 'face') {
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.06), white);
    add(face);
    [-0.04, 0.04].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), accent);
      eye.position.set(x, 0.02, 0.04);
      add(eye);
    });
    return g;
  }

  if (category === 'decoration' || category === 'cosmetic' || category === 'fun' || category === 'lighting') {
    const deco = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), accent);
    tagAnim(deco, 'pulse', { speed: 2 });
    add(deco);
    return g;
  }

  if (category === 'ai') {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.08), accent));
    return g;
  }

  add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), accent));
  return g;
}
