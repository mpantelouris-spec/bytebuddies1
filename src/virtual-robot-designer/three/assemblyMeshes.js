import * as THREE from 'three';
import { tagAnim } from './collectAnimatables.js';
import { makeAccentMat, makeDarkMat, addStandardWheels } from './robotTemplates3D.js';

export function makePremiumMat(color, materialId, emissive = 0.15) {
  const metalness = { plastic: 0.35, metal: 0.9, carbon: 0.72 }[materialId] ?? 0.35;
  const roughness = { plastic: 0.38, metal: 0.18, carbon: 0.28 }[materialId] ?? 0.4;
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
    emissive: new THREE.Color(color),
    emissiveIntensity: emissive,
  });
}

export function buildPremiumBase(base, group, disposables) {
  const w = (base.width ?? 1) * (base.scale ?? 1);
  const h = (base.height ?? 0.62) * (base.scale ?? 1);
  const d = (base.depth ?? 1.2) * (base.scale ?? 1);
  const color = base.color || '#8B00FF';
  const mat = makePremiumMat(color, base.material || 'plastic', 0.14);
  const dark = makeDarkMat();
  const accent = makeAccentMat(color, 0.45);
  const glow = makeAccentMat('#00d4ff', 0.85);

  let hull;
  switch (base.shape) {
    case 'round':
    case 'hex':
      hull = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.52, w * 0.58, h, base.shape === 'hex' ? 6 : 28), mat);
      break;
    case 'wedge':
      hull = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      hull.rotation.x = -0.12;
      break;
    default:
      hull = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  }
  hull.castShadow = true;
  hull.receiveShadow = true;
  tagAnim(hull, 'chassis-breathe', { base: 0.14, amp: 0.08 });
  group.add(hull);
  disposables.push(hull.geometry, mat);

  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 0.35, d * 0.18), accent.clone());
    plate.position.set(sx * w * 0.38, h * 0.08, sz * d * 0.38);
    plate.castShadow = true;
    group.add(plate);
    disposables.push(plate.geometry, plate.material);
  });

  const intake = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h * 0.12, d * 0.04), dark);
  intake.position.set(0, h * 0.05, d * 0.51);
  group.add(intake);
  disposables.push(intake.geometry, intake.material);

  const coreWin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.28, h * 0.22, d * 0.03), makeAccentMat('#0a0a14', 0.1));
  coreWin.position.set(0, h * 0.05, d * 0.505);
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(h * 0.12, 0), glow.clone());
  core.position.set(0, h * 0.05, d * 0.52);
  tagAnim(core, 'pulse', { base: 0.7, amp: 0.55 });
  group.add(coreWin, core);
  disposables.push(coreWin.geometry, coreWin.material, core.geometry, core.material);

  const ledColor = new THREE.Color('#00ff88');
  const ledMat = new THREE.MeshStandardMaterial({ color: ledColor, emissive: ledColor, emissiveIntensity: 1.2 });
  [[w * 0.48, 0, 0], [-w * 0.48, 0, 0]].forEach(([x, y, z], i) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.02, h * 0.5, d * 0.85), ledMat.clone());
    strip.position.set(x, y, z);
    tagAnim(strip, 'pulse', { base: 0.8, amp: 0.4, phase: i * 1.2 });
    group.add(strip);
    disposables.push(strip.geometry, strip.material);
  });

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(w * 0.35, w * 0.55, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -h * 0.52;
  tagAnim(ring, 'shell-pulse', { base: 0.15, amp: 0.12 });
  group.add(ring);
  disposables.push(ring.geometry, ring.material);

  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(w * 1.08, h * 1.08, d * 1.08),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.06, side: THREE.BackSide }),
  );
  tagAnim(shell, 'shell-pulse', { base: 0.06, amp: 0.05 });
  group.add(shell);
  disposables.push(shell.geometry, shell.material);

  return { mainMesh: hull, bodyW: w, bodyH: h, bodyD: d };
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
      const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.25, 12), makeAccentMat('#ff6b35', 0.9));
      thruster.rotation.x = Math.PI / 2;
      thruster.position.set(side * 0.25, -bodyH * 0.1, -bodyD * 0.55);
      tagAnim(thruster, 'pulse', { base: 0.7, amp: 0.5 });
      group.add(thruster);
      disposables.push(thruster.geometry, thruster.material);
    });
  }
}

export function buildAttachedPart(category, partId, color, disposables) {
  const g = new THREE.Group();
  const accent = makeAccentMat(color, 0.35);
  const dark = makeDarkMat();
  const glow = makeAccentMat('#00d4ff', 0.95);
  const add = (mesh, anim) => {
    g.add(mesh);
    disposables.push(mesh.geometry, mesh.material);
    if (anim) tagAnim(mesh, anim.type, anim.opts || {});
  };

  if (category === 'head') {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.22), accent));
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.06, 16), glow.clone());
    face.rotation.x = Math.PI / 2;
    face.position.set(0, 0.02, 0.14);
    add(face, { type: 'pulse', opts: { base: 0.7, amp: 0.5 } });
    if (partId === 'radar_pod') {
      const radar = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), glow.clone());
      radar.position.y = 0.12;
      add(radar, { type: 'spin-y', opts: { speed: 1.5 } });
    }
    return g;
  }

  if (category === 'sensors') {
    if (partId === 'lidar') {
      add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), glow.clone()), { type: 'spin-y', opts: { speed: 1.8 } });
    } else if (partId === 'ultrasonic') {
      const us = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.06, 16), glow.clone());
      us.rotation.x = Math.PI / 2;
      add(us, { type: 'pulse', opts: { base: 0.6, amp: 0.6 } });
    } else {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.08), accent));
    }
    return g;
  }

  if (category === 'utility') {
    if (partId === 'blade') {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.4, 0.1), makeAccentMat('#64748b', 0.25)));
    } else if (partId === 'claw' || partId === 'gripper') {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), accent));
      [-1, 1].forEach((s) => {
        const claw = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.22, 0.06), accent.clone());
        claw.position.set(s * 0.09, -0.24, 0);
        add(claw);
      });
    } else {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.38, 14), accent));
    }
    return g;
  }

  if (category === 'power') {
    if (partId === 'fusion') {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), dark));
      add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), makeAccentMat('#00d4ff', 1.4)), { type: 'pulse', opts: { base: 0.9, amp: 0.7 } });
    } else {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.18), makeAccentMat('#fbbf24', 0.2)));
    }
    return g;
  }

  if (category === 'comms') {
    if (partId === 'dish') {
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 20), makeAccentMat('#e2e8f0', 0.15));
      dish.rotation.x = Math.PI / 2;
      add(dish);
    } else {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.45, 10), dark));
    }
    return g;
  }

  add(new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), makeAccentMat(color, 0.75)), { type: 'chaos-spin' });
  return g;
}
