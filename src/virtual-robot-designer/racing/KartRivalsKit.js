import * as THREE from 'three';
import { buildMKKart } from './MKKartModel.js';

const RIVALS = [
  { name: 'Nova', color: 0xff4f8b, accent: 0xffd45c, style: 'bubble', driver: 'dome', eyes: 0xff9be0, lane: -0.42, speed: 0.105 },
  { name: 'Bolt', color: 0x38c8ff, accent: 0x243b8f, style: 'speedster', driver: 'boxy', eyes: 0x9dffb0, lane: 0.18, speed: 0.098 },
  { name: 'Mica', color: 0xa7e64f, accent: 0x5d42bd, style: 'buggy', driver: 'helmet', eyes: 0xffe066, lane: 0.56, speed: 0.091 },
];

function makeRivalKart(def, index) {
  const group = buildMKKart({
    body: def.color, accent: def.accent, style: def.style, driver: def.driver, eyes: def.eyes, number: index + 2,
  });
  group.name = `rival-kart-${def.name.toLowerCase()}`;
  group.userData.isKartRival = true;
  group.userData.rivalName = def.name;
  group.scale.setScalar(1.15);
  return group;
}

function makeSoftObstacle(type, color) {
  const group = new THREE.Group();
  group.name = `race-${type}`;
  group.userData.isRaceObstacle = true;
  group.userData.obstacleType = type;
  if (type === 'ramp') {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.34, 1.8), new THREE.MeshStandardMaterial({ color, roughness: 0.72 }));
    mesh.rotation.x = -0.16;
    mesh.position.y = 0.18;
    group.add(mesh);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.03, 0.18), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    stripe.position.set(0, 0.38, -0.12);
    stripe.rotation.x = -0.16;
    group.add(stripe);
  } else if (type === 'boost') {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.06, 1.35), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }));
    pad.position.y = 0.08;
    group.add(pad);
    [-0.72, 0, 0.72].forEach((x) => {
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 3), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      arrow.rotation.z = -Math.PI / 2;
      arrow.position.set(x, 0.16, 0);
      group.add(arrow);
    });
  } else {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.86, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.65 }));
    post.position.y = 0.43;
    group.add(post);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), new THREE.MeshStandardMaterial({ color: 0xfaf7ef, roughness: 0.55 }));
    cap.scale.y = 0.45;
    cap.position.y = 0.87;
    group.add(cap);
  }
  return group;
}

function placeOnCurve(curve, t, lane, halfWidth, object) {
  const point = curve.getPointAt((t + 1) % 1);
  const tangent = curve.getTangentAt((t + 1) % 1).normalize();
  const lateral = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  object.position.copy(point).addScaledVector(lateral, lane * halfWidth);
  object.position.y += 0.03;
  object.rotation.y = Math.atan2(tangent.x, tangent.z);
  object.userData.trackT = t;
}

export function installKartRivals(scene, curve, { halfWidth = 4, laps = 2 } = {}) {
  const root = new THREE.Group();
  root.name = 'circuit-rivals-and-obstacles';
  root.userData.raceKit = true;
  scene.add(root);

  const rivals = RIVALS.map((def, index) => {
    const mesh = makeRivalKart(def, index);
    // Start the rivals just ahead of the player so the race reads immediately
    // in the opening camera shot instead of looking like an empty course.
    const t = 0.08 + index * 0.045;
    placeOnCurve(curve, t, def.lane, halfWidth, mesh);
    root.add(mesh);
    return { ...def, mesh, t, lap: 0, index, phase: index * 1.7 };
  });

  const obstacleSpecs = [
    ['soft-bumper', 0.14, -0.54, 0xf3a04b], ['boost', 0.23, 0, 0x20d9d1],
    ['ramp', 0.36, 0.46, 0xffd45c], ['soft-bumper', 0.49, 0.42, 0xff71a8],
    ['boost', 0.62, -0.18, 0x9966ff], ['ramp', 0.76, -0.46, 0x5de08a],
    ['soft-bumper', 0.9, 0.52, 0xf3a04b],
  ];
  const obstacles = obstacleSpecs.map(([type, t, lane, color]) => {
    const mesh = makeSoftObstacle(type, color);
    placeOnCurve(curve, t, lane, halfWidth, mesh);
    root.add(mesh);
    return { mesh, type, t, lane, phase: t * 20 };
  });

  scene.userData.kartRivalsRoot = root;
  scene.userData.kartRivals = rivals;
  scene.userData.raceObstacles = obstacles;
  scene.userData.raceRivalCount = rivals.length;
  scene.userData.raceLaps = laps;
}

export function animateKartRivals(scene, time, dt = 0.016) {
  const curve = scene.userData.raceCurve;
  const rivals = scene.userData.kartRivals;
  if (!curve || !rivals?.length) return;
  const halfWidth = (scene.userData.racingConfig?.trackWidth ?? 8) / 2;
  const length = Math.max(1, curve.getLength());
  rivals.forEach((rival, index) => {
    const pace = rival.speed + Math.sin(time * 0.8 + rival.phase) * 0.0025;
    rival.t = (rival.t + (pace * dt * 18) / length) % 1;
    placeOnCurve(curve, rival.t, rival.lane + Math.sin(time * 0.9 + rival.phase) * 0.025, halfWidth, rival.mesh);
    rival.mesh.position.y += Math.sin(time * 5 + rival.phase) * 0.025;
    rival.mesh.rotation.z = Math.sin(time * 2 + index) * 0.025;
  });
  scene.userData.raceObstacles?.forEach((obstacle, index) => {
    if (obstacle.type === 'soft-bumper') obstacle.mesh.rotation.y = time * 0.8 + index;
    if (obstacle.type === 'boost') obstacle.mesh.children.forEach((child, i) => { child.material.opacity = 0.72 + Math.sin(time * 4 + i) * 0.2; });
    if (obstacle.type === 'ramp') obstacle.mesh.position.y = 0.03 + Math.sin(time * 2 + obstacle.phase) * 0.025;
  });
}
