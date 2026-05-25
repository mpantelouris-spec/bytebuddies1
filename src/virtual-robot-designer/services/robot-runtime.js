import { migrateDesign } from '../config.js';
import { computeDesignStats } from './design-service.js';
import { detectRobotArchetype, getArchetypePhysicsOverrides } from './robot-archetypes.js';

const CM_TO_UNIT = 0.015;
const BASE_PX_PER_MS = 0.18;
const BASE_DEG_PER_MS = 0.18;
const ROBOT_RADIUS = 0.45;

/** Physics derived from the same stats the builder uses */
export function getRobotPhysics(design) {
  const d = migrateDesign(design);
  const stats = computeDesignStats(d);
  const speedFactor = stats.speed / 55;
  const agilityFactor = stats.agility / 60;
  const weightFactor = stats.weight / 50;

  const archetype = detectRobotArchetype(d);
  const archPhys = getArchetypePhysicsOverrides(archetype.id, d);

  return {
    pxPerMs: BASE_PX_PER_MS * speedFactor * (d.abilities?.speedBoost ? 1.25 : 1),
    degPerMs: BASE_DEG_PER_MS * agilityFactor,
    cmToUnit: CM_TO_UNIT,
    hoverLift: archPhys.hoverLift ?? (d.wheels?.type === 'hover' ? 0.35 + (d.wheels?.motor === 'turbo' ? 0.15 : 0) : 0),
    isFlying: archPhys.isFlying ?? (d.template === 'drone' || d.wheels?.type === 'hover'),
    underwater: archPhys.underwater ?? !!d.abilities?.underwater,
    trackAnimSpeed: archPhys.trackAnimSpeed ?? (d.wheels?.type === 'tracks' ? 1.4 : 1),
    legAnimSpeed: archPhys.legAnimSpeed ?? (d.wheels?.type === 'legs' ? 1.2 : 1),
    canClimb: archPhys.climb ?? !!d.abilities?.climb,
    weightFactor,
    robotRadius: ROBOT_RADIUS,
    stats,
    design: d,
    archetype,
  };
}

export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Arena obstacle definitions (world units, centered origin) */
export const ARENA_OBSTACLES = {
  open: [],
  obstacles: [
    { x: 2, z: -1, r: 0.6 }, { x: -2.5, z: 2, r: 0.5 }, { x: 1, z: 3, r: 0.7 },
    { x: -1, z: -3, r: 0.55 }, { x: 3.5, z: 1, r: 0.45 },
  ],
  maze: [
    { x: 0, z: 0, w: 8, h: 0.3, type: 'wall' }, { x: -2, z: -2, w: 0.3, h: 4, type: 'wall' },
    { x: 2, z: 2, w: 0.3, h: 4, type: 'wall' }, { x: 0, z: 3, w: 4, h: 0.3, type: 'wall' },
    { x: -3, z: 1, w: 0.3, h: 3, type: 'wall' }, { x: 3, z: -1, w: 0.3, h: 3, type: 'wall' },
  ],
  linefollow: [{ x: 0, z: 0, type: 'line', w: 0.35, h: 14 }],
  square: [
    { x: 0, z: -3.5, w: 7, h: 0.25, type: 'wall' },
    { x: 0, z: 3.5, w: 7, h: 0.25, type: 'wall' },
    { x: -3.5, z: 0, w: 0.25, h: 7, type: 'wall' },
    { x: 3.5, z: 0, w: 0.25, h: 7, type: 'wall' },
  ],
  figure8: [
    { x: -2, z: 0, r: 1.8 }, { x: 2, z: 0, r: 1.8 },
    { x: 0, z: 0, w: 0.3, h: 0.3, type: 'wall' },
  ],
  ramp: [
    { x: 0, z: 2, w: 3, h: 0.2, type: 'ramp' },
    { x: -2, z: -2, r: 0.5 }, { x: 2, z: -2, r: 0.5 },
  ],
  collect: [
    { x: 2.5, z: -2, r: 0.4 }, { x: -2, z: 2.5, r: 0.4 },
    { x: 3, z: 2, r: 0.35 }, { x: -3, z: -1.5, r: 0.4 },
  ],
  delivery: [
    { x: -2, z: 0, r: 0.55 }, { x: 2, z: 0, r: 0.55 },
    { x: 0, z: 3, r: 0.45 },
  ],
};

function pointInWall(px, pz, wall) {
  const hw = wall.w / 2;
  const hh = wall.h / 2;
  return px >= wall.x - hw && px <= wall.x + hw && pz >= wall.z - hh && pz <= wall.z + hh;
}

function circleHitsObstacle(px, pz, o, radius) {
  if (o.r) {
    return Math.hypot(px - o.x, pz - o.z) < o.r + radius;
  }
  if (o.type === 'wall') {
    return pointInWall(px, pz, o);
  }
  return false;
}

export function checkPointCollision(x, z, arenaId = 'obstacles', radius = ROBOT_RADIUS) {
  const obstacles = ARENA_OBSTACLES[arenaId] || ARENA_OBSTACLES.obstacles;
  for (const o of obstacles) {
    if (circleHitsObstacle(x, z, o, radius)) return { hit: true, obstacle: o };
  }
  const bound = 11;
  if (Math.abs(x) > bound || Math.abs(z) > bound) return { hit: true, obstacle: { type: 'boundary' } };
  return { hit: false };
}

export function checkObstacleAhead(pos, angleDeg, design, arenaId = 'obstacles') {
  const obstacles = ARENA_OBSTACLES[arenaId] || ARENA_OBSTACLES.obstacles;
  const rad = (angleDeg * Math.PI) / 180;
  const reach = design.sensors?.lidar ? 4 : design.sensors?.ultrasonic ? 2.5 : 1.5;
  const samples = 6;

  for (let i = 1; i <= samples; i += 1) {
    const t = (i / samples) * reach;
    const tipX = pos.x + Math.cos(rad) * t;
    const tipZ = pos.z + Math.sin(rad) * t;

    for (const o of obstacles) {
      if (o.r) {
        const dx = tipX - o.x;
        const dz = tipZ - o.z;
        if (Math.hypot(dx, dz) < o.r + ROBOT_RADIUS) {
          return { hit: true, type: 'ultrasonic', distance: Math.hypot(dx, dz) };
        }
      }
      if (o.type === 'wall' && pointInWall(tipX, tipZ, o)) {
        return { hit: true, type: 'wall', distance: t * 0.8 };
      }
    }
  }
  return { hit: false, distance: reach };
}

/** Line-follow arena: robot near center line strip */
export function onLineFollowPath(x, z, arenaId = 'linefollow') {
  if (arenaId !== 'linefollow') return true;
  return Math.abs(x) < 0.22;
}

export function terminalMessagesForStep(step, design, physics) {
  const lines = [];
  const id = step?.id;
  if (id === 'forward') lines.push('> executing forward()');
  if (id === 'left' || id === 'spin_left') lines.push('> executing turn_left()');
  if (id === 'right' || id === 'spin_right') lines.push('> executing turn_right()');
  if (id === 'back') lines.push('> executing reverse()');
  if (id === 'stop') lines.push('> motors disengaged');
  if (id === 'wait') lines.push('> holding position');
  if (id === 'scan') lines.push('> ultrasonic: scanning…');
  if (id === 'lidar_sweep') lines.push('> lidar: 360° sweep');
  if (id === 'grab') lines.push('> gripper: closing');
  if (id === 'release') lines.push('> gripper: opening');
  if (id === 'if_obstacle' || step.meta === 'if_obstacle') lines.push('> checking obstacle sensor');
  if (id === 'lights_on') lines.push('> accent lights enabled');
  if (id === 'lights_off') lines.push('> accent lights off');
  if (id === 'follow_line') lines.push('> line sensor: tracking');
  if (design.sensors?.ultrasonic && id === 'forward') lines.push('> obstacle detection active');
  if (design.sensors?.lidar) lines.push('> lidar sweep complete');
  if (design.sensors?.camera) lines.push('> AI navigation active');
  if (design.tools?.pincer || design.tools?.gripper) lines.push('> grabber arm ready');
  lines.push(`> battery at ${physics.stats.battery}%`);
  return lines;
}
