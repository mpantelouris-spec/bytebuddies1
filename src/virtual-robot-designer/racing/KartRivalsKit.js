import * as THREE from 'three';
import { buildMKKart } from './MKKartModel.js';
import { bakeStaticGroup } from './bakeStaticGroup.js';

const RIVALS = [
  { name: 'Nova', color: 0xff4f8b, accent: 0xffd45c, style: 'bubble', driver: 'dome', eyes: 0xff9be0, lane: -1, speed: 0.105 },
  { name: 'Bolt', color: 0x38c8ff, accent: 0x243b8f, style: 'speedster', driver: 'boxy', eyes: 0x9dffb0, lane: 0, speed: 0.098 },
  { name: 'Mica', color: 0xa7e64f, accent: 0x5d42bd, style: 'buggy', driver: 'helmet', eyes: 0xffe066, lane: 1, speed: 0.091 },
];

function makeRivalKart(def, index) {
  const group = buildMKKart({
    body: def.color, accent: def.accent, style: def.style, driver: def.driver, eyes: def.eyes, number: index + 2,
  });
  group.name = `rival-kart-${def.name.toLowerCase()}`;
  group.userData.isKartRival = true;
  group.userData.rivalName = def.name;
  group.scale.setScalar(1.15);
  // Rivals move as one piece, so ~150 meshes can become ~10 (big win on tablets)
  try { bakeStaticGroup(group); } catch (e) { console.warn('[KartRivals] bake skipped', e); }
  return group;
}

export function makeSoftObstacle(type, color) {
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

/** What a race item looks like, and its colour (Track Maker items use these). */
export const RACE_ITEM_TYPES = {
  bumper: { obstacle: 'soft-bumper', color: 0xf3a04b },
  boost: { obstacle: 'boost', color: 0x20d9d1 },
  ramp: { obstacle: 'ramp', color: 0xffd45c },
};
/** Rival kart speed for each "Rival speed" setting. */
export const RIVAL_PACE = { slow: 0.85, normal: 1, fast: 1.15 };

/**
 * Rival karts and things on the road. A track made in the Track Maker brings its own:
 * items [{ type: 'bumper'|'boost'|'ramp', t: 0–1 round the lap, lane: -1|0|1 }],
 * how many rivals (0–3) and how fast they go ('slow'|'normal'|'fast').
 */
export function installKartRivals(scene, curve, { halfWidth = 4, laps = 2, items = null, rivals = 3, pace = 'normal' } = {}) {
  // Three lanes (left, middle, right). Rivals and bumpers sit in them, so changing lane is
  // how a pupil's code gets past them.
  const laneStep = Math.max(0, Math.min(2.4, halfWidth - 1.6));
  const laneFrac = (lane) => (halfWidth > 0 ? (lane * laneStep) / halfWidth : 0);
  scene.userData.raceLaneStep = laneStep;
  const root = new THREE.Group();
  root.name = 'circuit-rivals-and-obstacles';
  root.userData.raceKit = true;
  scene.add(root);

  const paceMul = RIVAL_PACE[pace] ?? 1;
  const rivalDefs = RIVALS.slice(0, Math.max(0, Math.min(RIVALS.length, rivals ?? 3))).map((d) => ({ ...d, speed: d.speed * paceMul }));
  const kartRivals = rivalDefs.map((def, index) => {
    const mesh = makeRivalKart(def, index);
    // Start the rivals just ahead of the player so the race reads immediately
    // in the opening camera shot instead of looking like an empty course.
    const t = 0.08 + index * 0.045;
    placeOnCurve(curve, t, laneFrac(def.lane), halfWidth, mesh);
    root.add(mesh);
    return { ...def, lane: laneFrac(def.lane), mesh, t, startT: t, lap: 0, index, phase: index * 1.7 };
  });

  const defaultSpecs = [
    ['soft-bumper', 0.14, 0, 0xf3a04b], ['boost', 0.23, -1, 0x20d9d1],
    ['ramp', 0.36, 1, 0xffd45c], ['soft-bumper', 0.49, 1, 0xff71a8],
    ['boost', 0.62, 0, 0x9966ff], ['ramp', 0.76, -1, 0x5de08a],
    ['soft-bumper', 0.9, -1, 0xf3a04b],
  ];
  const obstacleSpecs = Array.isArray(items)
    ? items.filter((it) => RACE_ITEM_TYPES[it.type]).map((it) => [RACE_ITEM_TYPES[it.type].obstacle, it.t, Math.max(-1, Math.min(1, Math.round(it.lane || 0))), RACE_ITEM_TYPES[it.type].color])
    : defaultSpecs;
  const obstacles = obstacleSpecs.map(([type, t, laneIdx, color]) => {
    const mesh = makeSoftObstacle(type, color);
    const lane = laneFrac(laneIdx);
    placeOnCurve(curve, t, lane, halfWidth, mesh);
    root.add(mesh);
    return { mesh, type, t, lane, phase: t * 20 };
  });

  scene.userData.kartRivalsRoot = root;
  scene.userData.kartRivals = kartRivals;
  scene.userData.raceObstacles = obstacles;
  scene.userData.raceRivalCount = kartRivals.length;
  scene.userData.raceLaps = laps;
}

const PLAYER_RADIUS = 1.0;
const RIVAL_RADIUS = 1.15;
const BUMPER_RADIUS = 0.45;

/** Pushes the player out of rival karts and bumper posts; returns true on a new hit. */
export function resolveRaceCollisions(scene, rs, dt = 0.016) {
  const solids = [];
  scene.userData.kartRivals?.forEach((r) => solids.push({ p: r.mesh.position, r: RIVAL_RADIUS, kind: 'car' }));
  scene.userData.raceObstacles?.forEach((o) => {
    if (o.type === 'soft-bumper') solids.push({ p: o.mesh.position, r: BUMPER_RADIUS, kind: 'object' });
  });
  rs._raceHitCooldown = Math.max(0, (rs._raceHitCooldown ?? 0) - dt);
  let hitKind = null;
  for (const s of solids) {
    const dx = rs.x - s.p.x;
    const dz = rs.z - s.p.z;
    const minDist = PLAYER_RADIUS + s.r;
    const distSq = dx * dx + dz * dz;
    if (distSq >= minDist * minDist) continue;
    const dist = Math.sqrt(distSq) || 0.0001;
    const push = minDist - dist;
    rs.x += (dx / dist) * push;
    rs.z += (dz / dist) * push;
    if (hitKind !== 'car') hitKind = s.kind;
  }
  if (!hitKind) return false;
  if (rs._raceSpeedEstimate) rs._raceSpeedEstimate *= 0.85;
  if (rs._raceHitCooldown > 0) return false;
  rs._raceHitCooldown = 0.6;
  recordRaceHit(rs, hitKind);
  return true;
}

/** Counts a hit once and remembers its kind so block events and sensors can react. */
export function recordRaceHit(rs, kind) {
  rs.collisions = (rs.collisions || 0) + 1;
  if (kind === 'car') rs.raceCarHits = (rs.raceCarHits || 0) + 1;
  else rs.raceObjectHits = (rs.raceObjectHits || 0) + 1;
  rs.raceLastHit = kind;
}

/** 'car' | 'object' | null — what a player-sized circle at (x, z) would overlap. */
export function wouldHitRaceSolid(scene, x, z) {
  const overlaps = (p, r) => (x - p.x) ** 2 + (z - p.z) ** 2 < (PLAYER_RADIUS + r) ** 2;
  if (scene.userData.kartRivals?.some((r) => overlaps(r.mesh.position, RIVAL_RADIUS))) return 'car';
  if (scene.userData.raceObstacles?.some((o) => o.type === 'soft-bumper' && overlaps(o.mesh.position, BUMPER_RADIUS))) return 'object';
  return null;
}

const LOOK_AHEAD_RANGE = 14;
// Only my own lane counts as "ahead" (lanes are 2.4 apart), so changing lane really clears it
const LOOK_AHEAD_WIDTH = 0.9;

/** Nearest car and object inside a forward corridor as wide as the kart. */
export function senseRaceAhead(scene, rs, laneStep = 2.4) {
  // Look about a second ahead (further when boosting), so there's time to change lane
  const range = Math.max(LOOK_AHEAD_RANGE, Math.min(40, (rs._raceSpeedEstimate || 0) * 1.1));
  const fx = Math.sin(rs.angle ?? 0);
  const fz = Math.cos(rs.angle ?? 0);
  let car = Infinity;
  let object = Infinity;
  // Is the lane to my left / right free? (nothing beside me or coming up in it, and the lane exists)
  const lane = rs._raceLaneTarget ?? 0;
  let leftClear = laneStep > 0 && lane > -1;
  let rightClear = laneStep > 0 && lane < 1;
  const probe = (p, r, kind) => {
    const dx = p.x - rs.x;
    const dz = p.z - rs.z;
    const ahead = dx * fx + dz * fz;
    if (ahead > -2 && ahead <= range) {
      const right = dz * fx - dx * fz;   // + is to the kart's right
      if (Math.abs(right + laneStep) < LOOK_AHEAD_WIDTH + r) leftClear = false;
      if (Math.abs(right - laneStep) < LOOK_AHEAD_WIDTH + r) rightClear = false;
    }
    if (ahead <= 0 || ahead > range) return;
    const side = Math.abs(dx * fz - dz * fx);
    if (side > LOOK_AHEAD_WIDTH + r) return;
    const gap = Math.max(0, ahead - PLAYER_RADIUS - r);
    if (kind === 'car') car = Math.min(car, gap);
    else object = Math.min(object, gap);
  };
  scene.userData.kartRivals?.forEach((r) => probe(r.mesh.position, RIVAL_RADIUS, 'car'));
  scene.userData.raceObstacles?.forEach((o) => {
    if (o.type === 'soft-bumper') probe(o.mesh.position, BUMPER_RADIUS, 'object');
  });
  return {
    carAhead: car < Infinity,
    objectAhead: object < Infinity,
    leftLaneClear: leftClear,
    rightLaneClear: rightClear,
    distanceAhead: Math.min(car, object) === Infinity ? 99 : Math.round(Math.min(car, object) * 10) / 10,
  };
}

/** Run pressed: rivals back to their grid spots, then off they go. */
export function resetKartRivals(scene) {
  scene.userData.kartRivals?.forEach((r) => { r.t = r.startT ?? r.t; r.lap = 0; });
  scene.userData.kartRivalsLive = true;
}

export function animateKartRivals(scene, time, dt = 0.016) {
  const curve = scene.userData.raceCurve;
  const rivals = scene.userData.kartRivals;
  if (!curve || !rivals?.length) return;
  const halfWidth = (scene.userData.racingConfig?.trackWidth ?? 8) / 2;
  const length = Math.max(1, curve.getLength());
  rivals.forEach((rival, index) => {
    // Rivals wait on the grid until Run is pressed (see resetKartRivals)
    if (scene.userData.kartRivalsLive) {
      const pace = rival.speed + Math.sin(time * 0.8 + rival.phase) * 0.0025;
      rival.t = (rival.t + (pace * dt * 18) / length) % 1;
    }
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
