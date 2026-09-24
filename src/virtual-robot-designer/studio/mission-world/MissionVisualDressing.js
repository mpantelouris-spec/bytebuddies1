/**
 * MissionVisualDressing — bespoke hero dressing for Visual Bible v2 ship tests.
 */
import * as THREE from 'three';
import { arenaMover } from '../ArenaBuilderCore.js';
import { getMissionVisual } from './MissionVisualBibleV2.js';

function pbr(color, options = {}) {
  const params = {
    color,
    roughness: options.roughness ?? 0.72,
    metalness: options.metalness ?? 0.08,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    envMapIntensity: options.envMapIntensity ?? 0.48,
  };
  if (options.side !== undefined) params.side = options.side;
  return new THREE.MeshStandardMaterial(params);
}

function addCrystal(root, x, y, z, height, color = 0xa855f7) {
  const crystal = new THREE.Mesh(
    new THREE.ConeGeometry(height * 0.22, height, 6),
    pbr(color, { roughness: 0.22, metalness: 0.16, emissive: color, emissiveIntensity: 0.28 }),
  );
  crystal.position.set(x, y + height * 0.5, z);
  crystal.rotation.z = (x % 3) * 0.08;
  crystal.castShadow = true;
  root.add(crystal);
  return crystal;
}

function addTimberBrace(root, point, tangent) {
  const brace = new THREE.Group();
  const timber = pbr(0x70452c, { roughness: 0.94 });
  [-5.2, 5.2].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.2, 0.55), timber);
    post.position.set(x, 2.6, 0);
    post.castShadow = true;
    brace.add(post);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(11, 0.5, 0.6), timber);
  beam.position.set(0, 5.0, 0);
  beam.castShadow = true;
  brace.add(beam);
  brace.position.set(point.x, 0, point.z);
  brace.rotation.y = Math.atan2(tangent.x, tangent.z);
  root.add(brace);
}

function buildCrystalQuarry(scene, root, curve) {
  const wallMat = pbr(0x4a3544, { roughness: 0.96 });
  [-1, 1].forEach((side) => {
    for (let i = 0; i < 4; i++) {
      const t = 0.14 + i * 0.245;
      const point = curve.getPoint(Math.min(0.92, t));
      const tangent = curve.getTangent(Math.min(0.92, t)).normalize();
      const px = -tangent.z;
      const pz = tangent.x;
      const x = point.x + px * side * 8.2;
      const z = point.z + pz * side * 8.2;
      const wall = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5 + (i % 3) * 0.5, 0), wallMat);
      wall.scale.set(1.25, 1.8, 1.1);
      wall.position.set(x, 2.1, z);
      wall.rotation.y = i * 0.7;
      wall.castShadow = true;
      root.add(wall);
      const crystal = addCrystal(
        root,
        x - px * side * 0.8,
        0.25,
        z - pz * side * 0.8,
        1.5 + (i % 3) * 0.5,
        i % 2 ? 0xa855f7 : 0x7c3aed,
      );
      crystal.userData.missionTarget = 'crystal_node';
      crystal.userData.crystalIndex = i + (side > 0 ? 4 : 0);
    }
  });

  [0.18, 0.42, 0.68, 0.88].forEach((t) => {
    const p = curve.getPoint(t);
    addTimberBrace(root, p, curve.getTangent(t).normalize());
  });

  const railMat = pbr(0x94a3b8, { roughness: 0.35, metalness: 0.75 });
  [-0.72, 0.72].forEach((offset) => {
    const railPoints = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const p = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      railPoints.push(new THREE.Vector3(
        p.x - tangent.z * offset,
        0.15,
        p.z + tangent.x * offset,
      ));
    }
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPoints), 64, 0.065, 6, false),
      railMat,
    );
    root.add(rail);
  });
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const p = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.11, 0.24), pbr(0x5b3828, { roughness: 0.94 }));
    sleeper.position.set(p.x, 0.08, p.z);
    sleeper.rotation.y = Math.atan2(tangent.x, tangent.z);
    root.add(sleeper);
  }

  const headlamp = new THREE.SpotLight(0xffe5ad, 2.1, 28, 0.46, 0.65);
  const start = curve.getPoint(0);
  headlamp.position.set(start.x, 5.2, start.z + 4);
  headlamp.target.position.copy(curve.getPoint(0.3));
  root.add(headlamp, headlamp.target);
}

function addWarehouseRack(root, x, z, colorShift = 0) {
  const steel = pbr(0x53657b, { roughness: 0.48, metalness: 0.55 });
  const shelf = new THREE.Group();
  [-1.8, 1.8].forEach((dz) => {
    [-1.5, 1.5].forEach((dx) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 4.8, 0.16), steel);
      post.position.set(dx, 2.4, dz);
      shelf.add(post);
    });
  });
  [0.8, 2.2, 3.6].forEach((y, row) => {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 4), steel);
    deck.position.y = y;
    shelf.add(deck);
    for (let box = 0; box < 3; box++) {
      const colors = [0xf59e0b, 0x3b82f6, 0x22c55e, 0xef4444];
      const carton = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.65, 0.8),
        pbr(colors[(row + box + colorShift) % colors.length], { roughness: 0.88 }),
      );
      carton.position.set(-1 + box, y + 0.4, (box % 2 ? 0.7 : -0.7));
      shelf.add(carton);
    }
  });
  shelf.position.set(x, 0, z);
  root.add(shelf);
}

function buildSecurityWarehouse(scene, root, curve) {
  [0.28, 0.62].forEach((t, i) => {
    const p = curve.getPoint(t);
    addWarehouseRack(root, p.x - 7.8, p.z, i);
    addWarehouseRack(root, p.x + 7.8, p.z, i + 1);
  });

  const start = curve.getPoint(0);
  const booth = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 3.4), pbr(0x334155, {
    roughness: 0.6, metalness: 0.25, emissive: 0x172033, emissiveIntensity: 0.15,
  }));
  booth.position.set(start.x - 7, 1.6, start.z + 1);
  root.add(booth);
  const windowMat = pbr(0x60a5fa, {
    emissive: 0x3b82f6, emissiveIntensity: 0.35, transparent: true, opacity: 0.72,
  });
  const window = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.25), windowMat);
  window.position.set(start.x - 4.89, 2.05, start.z + 1);
  window.rotation.y = Math.PI / 2;
  root.add(window);

  const patrolPoint = curve.getPoint(0.52);
  const lamp = new THREE.SpotLight(0xffd36a, 1.25, 24, 0.42, 0.75);
  lamp.position.set(patrolPoint.x + 5, 6.5, patrolPoint.z + 1);
  lamp.target.position.set(patrolPoint.x, 0, patrolPoint.z - 5);
  root.add(lamp, lamp.target);
}

function addDisplayCase(root, x, z) {
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 1.4), pbr(0xe5e7eb, { roughness: 0.35 }));
  base.position.set(x, 0.28, z);
  root.add(base);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 1.7, 1.15),
    pbr(0x9bdcff, { roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.22 }),
  );
  glass.position.set(x, 1.35, z);
  root.add(glass);
  addCrystal(root, x, 0.55, z, 1.0, 0xfbbf24);
}

function buildMuseumLaserVault(scene, root, curve) {
  const marble = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 52),
    pbr(0xe7e5e4, { roughness: 0.28, metalness: 0.04 }),
  );
  marble.rotation.x = -Math.PI / 2;
  marble.position.set(0, 0.045, -18);
  marble.receiveShadow = true;
  root.add(marble);

  for (let i = 0; i < 6; i++) {
    const p = curve.getPoint(0.1 + i * 0.14);
    addDisplayCase(root, p.x - 6.1, p.z);
    addDisplayCase(root, p.x + 6.1, p.z);
  }

  const laserMat = pbr(0xef4444, { emissive: 0xff1010, emissiveIntensity: 2.4 });
  [0.24, 0.42, 0.61, 0.78].forEach((t, row) => {
    const p = curve.getPoint(t);
    for (let beam = 0; beam < 4; beam++) {
      const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 8.5, 6), laserMat);
      laser.rotation.z = Math.PI / 2;
      laser.position.set(p.x, 0.55 + beam * 0.42, p.z + (row % 2) * 0.75);
      root.add(laser);
    }
  });

  const end = curve.getPoint(0.94);
  const terminal = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.7), pbr(0x172033, {
    roughness: 0.4, metalness: 0.45, emissive: 0x06b6d4, emissiveIntensity: 0.18,
  }));
  terminal.position.set(end.x, 1.1, end.z);
  root.add(terminal);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), pbr(0x06d9ef, {
    emissive: 0x06d9ef, emissiveIntensity: 2,
  }));
  screen.position.set(end.x, 1.45, end.z + 0.36);
  root.add(screen);
  arenaMover(scene, (time) => {
    screen.material.emissiveIntensity = 1.5 + Math.sin(time * 3) * 0.45;
  });
}

function addSleepingGuard(root, x, z, rotation = 0) {
  const guard = new THREE.Group();
  const uniform = pbr(0x172033, { roughness: 0.78, emissive: 0x0b1020, emissiveIntensity: 0.08 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.75, 4, 8), uniform);
  body.position.y = 0.75;
  body.rotation.z = Math.PI / 2;
  guard.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), pbr(0xc99472, { roughness: 0.8 }));
  head.position.set(0.7, 0.82, 0);
  guard.add(head);
  const sleepZ = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    pbr(0x60a5fa, { emissive: 0x3b82f6, emissiveIntensity: 1.5, transparent: true, opacity: 0.85 }),
  );
  sleepZ.position.set(0.9, 1.55, 0);
  guard.add(sleepZ);
  guard.position.set(x, 0, z);
  guard.rotation.y = rotation;
  root.add(guard);
}

function buildCyberSilentFootsteps(scene, root, curve) {
  const quietMat = pbr(0x0f766e, {
    emissive: 0x14b8a6, emissiveIntensity: 0.28, transparent: true, opacity: 0.55,
  });
  const loudMat = pbr(0x7f1d1d, {
    emissive: 0xef4444, emissiveIntensity: 0.3, transparent: true, opacity: 0.5,
  });

  // Alternating floor readout makes the safe, quiet route legible on tablet.
  for (let i = 0; i < 10; i++) {
    const t = 0.06 + i * 0.1;
    const p = curve.getPoint(Math.min(t, 0.96));
    const tangent = curve.getTangent(Math.min(t, 0.96)).normalize();
    const yaw = Math.atan2(tangent.x, tangent.z);
    const quiet = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 2.0), quietMat);
    quiet.position.set(p.x, 0.13, p.z);
    quiet.rotation.y = yaw;
    root.add(quiet);

    const side = i % 2 ? -1 : 1;
    const loud = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.055, 2.0), loudMat);
    loud.position.set(p.x + (-tangent.z) * side * 3.2, 0.12, p.z + tangent.x * side * 3.2);
    loud.rotation.y = yaw;
    root.add(loud);
  }

  [0.2, 0.42, 0.64, 0.82].forEach((t, i) => {
    const p = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const side = i % 2 ? -1 : 1;
    addSleepingGuard(root, p.x + (-tangent.z) * side * 5.2, p.z + tangent.x * side * 5.2,
      Math.atan2(-tangent.z * side, tangent.x * side));
  });

  // Neon alley walls keep the route framed instead of floating in a dark void.
  const wallMat = pbr(0x111827, { roughness: 0.7, metalness: 0.22 });
  const neonColors = [0xec4899, 0x06b6d4];
  for (let i = 0; i < 5; i++) {
    const p = curve.getPoint(0.12 + i * 0.19);
    [-1, 1].forEach((side) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(3.5, 5 + (i % 3), 2.2), wallMat);
      wall.position.set(p.x + side * 9.5, wall.geometry.parameters.height * 0.5, p.z);
      root.add(wall);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.55), pbr(neonColors[(i + (side > 0 ? 1 : 0)) % 2], {
        emissive: neonColors[(i + (side > 0 ? 1 : 0)) % 2], emissiveIntensity: 0.5,
      }));
      sign.position.set(p.x + side * 8.38, 2.5 + (i % 3), p.z);
      sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      root.add(sign);
    });
  }

  arenaMover(scene, (time) => {
    quietMat.emissiveIntensity = 0.24 + Math.sin(time * 2) * 0.05;
    loudMat.emissiveIntensity = 0.27 + Math.sin(time * 4) * 0.06;
  });
}

function addCoralTower(root, x, z, scale, color) {
  const group = new THREE.Group();
  const coralMat = pbr(color, { roughness: 0.65, emissive: color, emissiveIntensity: 0.2 });
  for (let i = 0; i < 7; i++) {
    const h = scale * (1.1 + (i % 3) * 0.55);
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.3 * scale, h, 7), coralMat);
    const a = (i / 7) * Math.PI * 2;
    branch.position.set(Math.cos(a) * scale * 0.55, h * 0.5, Math.sin(a) * scale * 0.55);
    branch.rotation.z = Math.cos(a) * 0.22;
    group.add(branch);
  }
  group.position.set(x, 0, z);
  root.add(group);
}

function buildCoralReefSurvey(scene, root, curve) {
  const colors = [0xf472b6, 0xfb923c, 0xa855f7, 0x22d3ee, 0xfacc15];
  for (let i = 0; i < 7; i++) {
    const t = 0.06 + i * 0.15;
    const p = curve.getPoint(Math.min(0.96, t));
    const tangent = curve.getTangent(Math.min(0.96, t)).normalize();
    const px = -tangent.z;
    const pz = tangent.x;
    const side = i % 2 ? -1 : 1;
    addCoralTower(root, p.x + px * side * (5.4 + (i % 3)), p.z + pz * side * (5.4 + (i % 3)),
      0.8 + (i % 4) * 0.18, colors[i % colors.length]);
  }

  // Ten readable species targets, distributed along the survey route.
  const fishColors = [0xfacc15, 0xfb7185, 0x60a5fa, 0x34d399, 0xc084fc];
  for (let i = 0; i < 10; i++) {
    const t = 0.08 + i * 0.09;
    const p = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const side = i % 2 ? -1 : 1;
    const fishMat = pbr(fishColors[i % fishColors.length], {
      roughness: 0.55,
      emissive: fishColors[i % fishColors.length],
      emissiveIntensity: 0.18,
    });
    const fish = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 5), fishMat);
    fish.rotation.z = -Math.PI / 2;
    fish.scale.setScalar(0.8 + (i % 4) * 0.12);
    fish.position.set(
      p.x + (-tangent.z) * side * (4.8 + (i % 3)),
      1.5 + (i % 3) * 0.55,
      p.z + tangent.x * side * (4.8 + (i % 3)),
    );
    fish.userData.missionTarget = 'marine_species';
    fish.userData.speciesIndex = i;
    root.add(fish);
    const baseY = fish.position.y;
    arenaMover(scene, (time) => {
      fish.position.y = baseY + Math.sin(time * 0.8 + i * 0.7) * 0.28;
      fish.rotation.y = Math.sin(time * 0.45 + i) * 0.25;
    });
  }

  [0.18, 0.5, 0.82].forEach((t, column) => {
    const p = curve.getPoint(t);
    for (let i = 0; i < 6; i++) {
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + (i % 3) * 0.025, 6, 5),
        pbr(0xbff4ff, { emissive: 0x22d3ee, emissiveIntensity: 0.25, transparent: true, opacity: 0.55 }),
      );
      bubble.position.set(p.x + 5.5 * (column % 2 ? -1 : 1) + Math.sin(i) * 0.25, 0.3 + i * 0.42, p.z);
      root.add(bubble);
      const baseY = bubble.position.y;
      arenaMover(scene, (time) => {
        bubble.position.y = baseY + ((time * 0.35 + i * 0.12) % 5.5);
      });
    }
  });

  // Soft caustic pools rather than white god-ray planes.
  for (let i = 0; i < 2; i++) {
    const p = curve.getPoint(0.28 + i * 0.44);
    const light = new THREE.SpotLight(0x67e8f9, 0.35, 18, 0.5, 0.9);
    light.position.set(p.x + (i % 2 ? -4 : 4), 9, p.z);
    light.target.position.set(p.x, 0, p.z);
    root.add(light, light.target);
  }
}

function buildGoal(scene, root, curve, spec) {
  const end = curve.getPoint(0.98);
  const color = spec.accent ?? 0x22c55e;
  const goalMat = pbr(color, {
    emissive: color, emissiveIntensity: 1.45, transparent: true, opacity: 0.9,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.18, 12, 40), goalMat);
  ring.name = 'MissionBibleGoal';
  ring.position.set(end.x, 2.5, end.z);
  root.add(ring);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 1.7, 7, 16, 1, true),
    pbr(color, { emissive: color, emissiveIntensity: 0.6, transparent: true, opacity: 0.12, side: THREE.DoubleSide }),
  );
  beam.position.set(end.x, 3.5, end.z);
  root.add(beam);
  arenaMover(scene, (time) => {
    ring.rotation.z = time * 0.4;
    goalMat.emissiveIntensity = 1.2 + Math.sin(time * 3) * 0.35;
  });
}

export function applyMissionVisualDressing(scene, challenge, curve, environmentId) {
  if (!challenge?.id || !curve || scene.getObjectByName('MissionVisualBibleDressing')) return;
  const spec = getMissionVisual(challenge, environmentId);
  if (!spec.look) return;

  const root = new THREE.Group();
  root.name = 'MissionVisualBibleDressing';
  root.userData.skipStylize = true;
  scene.add(root);

  switch (spec.look) {
    case 'crystal_quarry':
      buildCrystalQuarry(scene, root, curve);
      break;
    case 'security_warehouse':
      buildSecurityWarehouse(scene, root, curve);
      break;
    case 'cyber_silent_footsteps':
      buildCyberSilentFootsteps(scene, root, curve);
      break;
    case 'coral_reef_survey':
      buildCoralReefSurvey(scene, root, curve);
      break;
    default:
      return;
  }
  // ArenaBuilderCore owns the single green finish marker. A second decorative
  // goal here made the destination ambiguous and produced overlapping bloom.
  scene.userData.missionVisualLook = spec.look;
  scene.userData.missionGoalLabel = spec.goalLabel;
}
