import * as THREE from 'three';
import { tagAnim } from './collectAnimatables.js';

/** Shared materials */
export function makeBodyMat(chassis, cosmetics) {
  const color = chassis.color || cosmetics?.primaryColor || '#8B00FF';
  const metalness = chassis.material === 'metal' ? 0.88 : chassis.material === 'carbon' ? 0.65 : 0.3;
  const roughness = chassis.material === 'plastic' ? 0.42 : 0.18;
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.18,
  });
}

export function makeAccentMat(hex, emissive = 0.35) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    metalness: 0.7,
    roughness: 0.25,
    emissive: new THREE.Color(hex),
    emissiveIntensity: emissive,
  });
}

export function makeDarkMat() {
  return new THREE.MeshStandardMaterial({ color: 0x1a1a22, metalness: 0.92, roughness: 0.25 });
}

function track(dims, side, disposables, group) {
  const { bodyW, bodyH, bodyD } = dims;
  const trackW = 0.22;
  const trackH = bodyH * 0.85;
  const trackD = bodyD * 1.15;
  const x = side * (bodyW * 0.52 + trackW * 0.4);

  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(trackW, trackH, trackD),
    makeDarkMat(),
  );
  housing.position.set(x, -bodyH * 0.05, 0);
  housing.castShadow = true;
  group.add(housing);
  disposables.push(housing.geometry, housing.material);

  const n = 5;
  for (let i = 0; i < n; i += 1) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(trackW * 0.38, trackW * 0.38, trackW * 0.7, 14),
      makeDarkMat(),
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, -bodyH * 0.35 + (i / (n - 1)) * trackH * 0.55, -trackD * 0.42 + (i / (n - 1)) * trackD * 0.84);
    group.add(wheel);
    disposables.push(wheel.geometry, wheel.material);
  }

  const tread = new THREE.Mesh(
    new THREE.BoxGeometry(trackW * 0.95, trackH * 1.05, trackD * 1.02),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a22,
      metalness: 0.6,
      roughness: 0.7,
      emissive: 0x222233,
      emissiveIntensity: 0.15,
    }),
  );
  tread.position.set(x, -bodyH * 0.05, 0);
  group.add(tread);
  disposables.push(tread.geometry, tread.material);

  for (let i = 0; i < 7; i += 1) {
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(trackW * 0.85, 0.03, trackD * 0.08),
      new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.8, roughness: 0.4 }),
    );
    ridge.position.set(x, -bodyH * 0.05 - trackH * 0.42 + i * (trackH * 0.14), trackD * 0.48);
    group.add(ridge);
    disposables.push(ridge.geometry, ridge.material);
  }
}

/** Tank: hull + tracks + turret + optional blade/cannon */
export function buildTankBody(group, dims, bodyMat, secondary, d, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 1.05, bodyH * 0.75, bodyD * 1.1),
    bodyMat,
  );
  hull.position.y = bodyH * 0.15;
  hull.castShadow = true;
  group.add(hull);
  disposables.push(hull.geometry);

  const glacis = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 0.95, bodyH * 0.2, bodyD * 0.35),
    bodyMat.clone(),
  );
  glacis.position.set(0, bodyH * 0.35, bodyD * 0.42);
  glacis.rotation.x = -0.35;
  group.add(glacis);
  disposables.push(glacis.geometry, glacis.material);

  track(dims, -1, disposables, group);
  track(dims, 1, disposables, group);

  if (d.tools?.bulldozer) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW * 1.2, bodyH * 0.5, 0.1),
      makeAccentMat(secondary, 0.2),
    );
    blade.position.set(0, bodyH * 0.05, bodyD * 0.58);
    group.add(blade);
    disposables.push(blade.geometry, blade.material);
  }

  const turret = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyW * 0.42, bodyW * 0.48, bodyH * 0.55, 16),
    bodyMat.clone(),
  );
  turret.position.set(0, bodyH * 0.72, -bodyD * 0.05);
  group.add(turret);
  disposables.push(turret.geometry, turret.material);

  const turretRing = new THREE.Mesh(
    new THREE.TorusGeometry(bodyW * 0.44, 0.04, 8, 24),
    makeAccentMat(secondary, 0.5),
  );
  turretRing.rotation.x = Math.PI / 2;
  turretRing.position.set(0, bodyH * 0.48, -bodyD * 0.05);
  group.add(turretRing);
  disposables.push(turretRing.geometry, turretRing.material);

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.09, bodyD * 0.75, 12),
    makeDarkMat(),
  );
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, bodyH * 0.72, bodyD * 0.42);
  group.add(barrel);
  disposables.push(barrel.geometry, barrel.material);

  return { mainMesh: hull, bodyW, bodyH, bodyD };
}

/** Rover: deck + cabin + wheels */
export function buildRoverBody(group, dims, bodyMat, d, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH * 0.35, bodyD), bodyMat);
  deck.position.y = -bodyH * 0.15;
  deck.castShadow = true;
  group.add(deck);
  disposables.push(deck.geometry);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 0.65, bodyH * 0.55, bodyD * 0.55),
    bodyMat.clone(),
  );
  cabin.position.set(0, bodyH * 0.25, -bodyD * 0.08);
  group.add(cabin);
  disposables.push(cabin.geometry, cabin.material);

  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 1.08, bodyH * 0.12, 0.1),
    makeDarkMat(),
  );
  bumper.position.set(0, -bodyH * 0.28, bodyD * 0.52);
  group.add(bumper);
  disposables.push(bumper.geometry, bumper.material);

  return { mainMesh: deck, bodyW, bodyH, bodyD };
}

/** Drone: central body + arms */
export function buildDroneBody(group, dims, bodyMat, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyW * 0.5, bodyW * 0.55, bodyH * 0.5, 6),
    bodyMat,
  );
  body.position.y = bodyH * 0.2;
  group.add(body);
  disposables.push(body.geometry);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(bodyW * 0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    bodyMat.clone(),
  );
  dome.position.y = bodyH * 0.42;
  group.add(dome);
  disposables.push(dome.geometry, dome.material);

  const armMat = makeDarkMat();
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.55, 0.04, 0.08), armMat);
    arm.position.set(sx * bodyW * 0.55, bodyH * 0.35, sz * bodyD * 0.45);
    group.add(arm);
    disposables.push(arm.geometry, arm.material);
  });

  return { mainMesh: body, bodyW, bodyH, bodyD };
}

/** Spider: round abdomen + head */
export function buildSpiderBody(group, dims, bodyMat, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const abdomen = new THREE.Mesh(
    new THREE.SphereGeometry(bodyW * 0.55, 20, 16),
    bodyMat,
  );
  abdomen.scale.set(1.1, 0.75, 1.2);
  group.add(abdomen);
  disposables.push(abdomen.geometry);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(bodyW * 0.32, 16, 12),
    bodyMat.clone(),
  );
  head.position.set(0, bodyH * 0.15, bodyD * 0.42);
  group.add(head);
  disposables.push(head.geometry, head.material);

  return { mainMesh: abdomen, bodyW, bodyH, bodyD };
}

/** Humanoid: torso, head, arms */
export function buildHumanoidBody(group, dims, bodyMat, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 0.7, bodyH * 0.9, bodyD * 0.45),
    bodyMat,
  );
  torso.position.y = bodyH * 0.35;
  group.add(torso);
  disposables.push(torso.geometry);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 0.45, bodyH * 0.4, bodyD * 0.38),
    bodyMat.clone(),
  );
  head.position.y = bodyH * 0.95;
  group.add(head);
  disposables.push(head.geometry, head.material);

  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, bodyH * 0.75, 0.12),
      bodyMat.clone(),
    );
    arm.position.set(side * bodyW * 0.48, bodyH * 0.35, 0);
    group.add(arm);
    disposables.push(arm.geometry, arm.material);
  });

  return { mainMesh: torso, bodyW, bodyH, bodyD };
}

/** Robot arm: base + segments */
export function buildArmBody(group, dims, bodyMat, disposables) {
  const { bodyW, bodyH } = dims;
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyW * 0.55, bodyW * 0.65, bodyH * 0.35, 20),
    bodyMat,
  );
  base.position.y = -bodyH * 0.35;
  group.add(base);
  disposables.push(base.geometry);

  const shoulder = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, bodyH * 0.35, 0.25),
    bodyMat.clone(),
  );
  shoulder.position.y = bodyH * 0.05;
  group.add(shoulder);
  disposables.push(shoulder.geometry, shoulder.material);

  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.14, bodyH * 0.7, 0.14), bodyMat.clone());
  upper.position.set(0, bodyH * 0.5, 0);
  group.add(upper);
  disposables.push(upper.geometry, upper.material);

  const fore = new THREE.Mesh(new THREE.BoxGeometry(0.12, bodyH * 0.6, 0.12), bodyMat.clone());
  fore.position.set(0, bodyH * 0.95, 0.15);
  fore.rotation.x = -0.4;
  group.add(fore);
  disposables.push(fore.geometry, fore.material);

  return { mainMesh: base, bodyW, bodyH, bodyD: dims.bodyD };
}

/** Generic modular body when blank/custom */
export function buildModularBody(group, dims, bodyMat, chassis, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  let mesh;
  if (chassis.shape === 'circular') {
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(bodyW * 0.55, bodyW * 0.55, bodyH, 28), bodyMat);
  } else if (chassis.shape === 'cube') {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyW * 0.95, bodyD * 0.9), bodyMat);
  } else {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyD), bodyMat);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW * 0.55, bodyH * 0.4, bodyD * 0.45),
      bodyMat.clone(),
    );
    cabin.position.set(0, bodyH * 0.35, -bodyD * 0.1);
    group.add(cabin);
    disposables.push(cabin.geometry, cabin.material);
  }
  mesh.castShadow = true;
  group.add(mesh);
  disposables.push(mesh.geometry);
  return { mainMesh: mesh, bodyW, bodyH, bodyD };
}

export function addStandardWheels(group, d, dims, disposables) {
  const wheels = d.wheels || {};
  const type = wheels.type || 'standard';
  const count = wheels.count ?? 4;
  const sizeKey = wheels.size || 'medium';
  const r = { small: 0.2, medium: 0.28, large: 0.36 }[sizeKey] || 0.28;
  const { bodyW, bodyH, bodyD } = dims;
  const y = -bodyH * 0.42;

  if (type === 'tracks') {
    track(dims, -1, disposables, group);
    track(dims, 1, disposables, group);
    return;
  }

  if (type === 'legs') {
    const n = Math.max(2, Math.min(8, count));
    for (let i = 0; i < n; i += 1) {
      const t = (i / n) * Math.PI * 2;
      const x = Math.cos(t) * bodyW * 0.55;
      const z = Math.sin(t) * bodyD * 0.45;
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.07, bodyH * 0.75, 8),
        makeDarkMat(),
      );
      leg.position.set(x, y + bodyH * 0.2, z);
      group.add(leg);
      disposables.push(leg.geometry, leg.material);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), makeAccentMat(0x64748b, 0.2));
      joint.position.set(x, y + bodyH * 0.55, z);
      group.add(joint);
      disposables.push(joint.geometry, joint.material);
    }
    return;
  }

  if (type === 'hover') {
    const n = Math.max(3, count);
    for (let i = 0; i < n; i += 1) {
      const t = (i / n) * Math.PI * 2;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.035, 10, 28),
        new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.65 }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(Math.cos(t) * bodyW * 0.5, y, Math.sin(t) * bodyD * 0.4);
      tagAnim(ring, 'pulse', { base: 0.5, amp: 0.35 });
      group.add(ring);
      disposables.push(ring.geometry, ring.material);
    }
    return;
  }

  const wheelGeom = new THREE.CylinderGeometry(r, r, 0.12, 18);
  const wheelMat = makeDarkMat();
  disposables.push(wheelGeom, wheelMat);
  const n = Math.max(2, Math.min(8, count));
  for (let i = 0; i < n; i += 1) {
    const t = (i / n) * Math.PI * 2;
    const x = Math.cos(t) * bodyW * 0.52;
    const z = Math.sin(t) * bodyD * 0.42;
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.45, r * 0.45, 0.14, 12),
      makeAccentMat(0x475569, 0.15),
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, y, z);
    group.add(hub);
    disposables.push(hub.geometry, hub.material);
  }
}

export function addDroneProps(group, dims, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const propGeom = new THREE.BoxGeometry(bodyW * 0.4, 0.025, 0.07);
  const propMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, transparent: true, opacity: 0.9 });
  disposables.push(propGeom, propMat);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const prop = new THREE.Mesh(propGeom, propMat);
    prop.position.set(sx * bodyW * 0.72, bodyH * 0.38, sz * bodyD * 0.52);
    tagAnim(prop, 'spin-y', { speed: 16 });
    group.add(prop);
  });
}
