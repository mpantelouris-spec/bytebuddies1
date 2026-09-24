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

  const archMult = archPhys.pxMult ?? 1;
  const degArchMult = archPhys.degMult ?? 1;

  return {
    pxPerMs: BASE_PX_PER_MS * speedFactor * archMult * (d.abilities?.speedBoost ? 1.25 : 1),
    degPerMs: BASE_DEG_PER_MS * agilityFactor * degArchMult,
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
  rough_terrain: [
    { x: 1.5, z: -2, r: 0.65 }, { x: -2, z: 1, r: 0.7 }, { x: 3, z: 2.5, r: 0.55 },
    { x: -3.5, z: -2.5, r: 0.6 }, { x: 0, z: 3, w: 2.5, h: 0.25, type: 'ramp' },
  ],
  sky_rings: [
    { x: 0, z: -4, r: 0.35, type: 'ring' }, { x: 2, z: -1, r: 0.35, type: 'ring' },
    { x: -2, z: 1, r: 0.35, type: 'ring' }, { x: 0, z: 4, r: 0.35, type: 'ring' },
    { x: 3, z: 3, r: 0.4 },
  ],
  sky_maze: [
    { x: -2, z: -2, r: 0.45 }, { x: 2, z: -2, r: 0.45 }, { x: 0, z: 0, r: 0.5 },
    { x: -2, z: 2, r: 0.45 }, { x: 2, z: 2, r: 0.45 }, { x: 0, z: -3, w: 4, h: 0.3, type: 'wall' },
  ],
  terrain_climb: [
    { x: 0, z: 2.5, w: 2.5, h: 0.35, type: 'ramp' },
    { x: -2.5, z: -1, w: 0.3, h: 3, type: 'wall' },
    { x: 2.5, z: 0, w: 0.3, h: 3.5, type: 'wall' },
    { x: 1, z: -2.5, r: 0.45 },
  ],
  balance_beam: [
    { x: 0, z: -2, w: 0.25, h: 4, type: 'wall' },
    { x: 0, z: 2, w: 0.25, h: 4, type: 'wall' },
    { x: -2, z: 0, r: 0.35 }, { x: 2, z: 0, r: 0.35 },
  ],
  factory_sort: [
    { x: -2.5, z: 0, r: 0.4 }, { x: 0, z: 0, r: 0.4 }, { x: 2.5, z: 0, r: 0.4 },
    { x: 0, z: 2.5, r: 0.35 },
  ],
  underwater_reef: [
    { x: 2, z: -2, r: 0.45 }, { x: -2.5, z: 1.5, r: 0.5 }, { x: 1, z: 3, r: 0.4 },
    { x: -1, z: -3, r: 0.42 },
  ],
  underwater_cave: [
    { x: 0, z: 0, w: 6, h: 0.3, type: 'wall' },
    { x: -2.5, z: -1, w: 0.3, h: 4, type: 'wall' },
    { x: 2.5, z: 1, w: 0.3, h: 4, type: 'wall' },
    { x: 0, z: 3, r: 0.5 },
  ],
  hover_course: [
    { x: -3, z: 0, r: 0.5, type: 'platform' }, { x: 0, z: -2, r: 0.5, type: 'platform' },
    { x: 3, z: 0, r: 0.5, type: 'platform' }, { x: 0, z: 2.5, r: 0.5, type: 'platform' },
  ],
  mining_tunnel: [
    { x: 1.5, z: 1, r: 0.55 }, { x: -1.5, z: -1, r: 0.5 },
    { x: 0, z: 2.5, w: 3, h: 0.3, type: 'wall' },
  ],
  lego_park: [
    { x: 2, z: 0, r: 0.5 }, { x: -2, z: -2, r: 0.45 }, { x: 0, z: 2.5, r: 0.5 },
    { x: -1, z: 1.5, r: 0.4 },
  ],
  ai_patrol: [
    { x: 2, z: -2, r: 0.4 }, { x: -2, z: 2, r: 0.4 }, { x: 3, z: 1, r: 0.35 },
    { x: -3, z: -1, r: 0.35 }, { x: 0, z: 0, r: 0.3 },
  ],

  // ── Difficulty variants ── medium = more obstacles, hard = dense/complex ──

  obstacles_medium: [
    { x: 2, z: -1, r: 0.6 }, { x: -2.5, z: 2, r: 0.5 }, { x: 1, z: 3, r: 0.7 },
    { x: -1, z: -3, r: 0.55 }, { x: 3.5, z: 1, r: 0.45 },
    { x: -3, z: -2, r: 0.5 }, { x: 0.5, z: -1.5, r: 0.48 }, { x: -1, z: 1.8, r: 0.52 },
    { x: 2.5, z: -3.5, r: 0.42 }, { x: -3.5, z: 3, r: 0.55 },
  ],
  obstacles_hard: [
    { x: 2, z: -1, r: 0.55 }, { x: -2.5, z: 2, r: 0.5 }, { x: 1, z: 3, r: 0.65 },
    { x: -1, z: -3, r: 0.5 }, { x: 3.5, z: 1, r: 0.4 }, { x: -3, z: -2, r: 0.48 },
    { x: 0.5, z: -1.5, r: 0.45 }, { x: -1, z: 1.8, r: 0.5 }, { x: 2.5, z: -3.5, r: 0.4 },
    { x: -3.5, z: 3, r: 0.52 }, { x: 1.5, z: -4, r: 0.42 }, { x: -0.5, z: 4, r: 0.45 },
    { x: 3, z: -2.5, r: 0.38 }, { x: -2, z: -4, r: 0.42 }, { x: 0, z: 2, r: 0.38 },
    { x: 4, z: -1, r: 0.38 }, { x: -4, z: 1, r: 0.4 }, { x: 2, z: 4, r: 0.38 },
  ],

  linefollow_medium: [
    { x: 0, z: 0, type: 'line', w: 0.3, h: 14 },
    { x: 1.5, z: -2, r: 0.45 }, { x: -2, z: 1, r: 0.4 }, { x: 1.8, z: 3.5, r: 0.42 },
    { x: -1.5, z: -4, r: 0.38 }, { x: 2.5, z: -1, r: 0.4 },
  ],
  linefollow_hard: [
    { x: 0, z: 0, type: 'line', w: 0.22, h: 14 },
    { x: 1.5, z: -2, r: 0.4 }, { x: -2, z: 1, r: 0.38 }, { x: 2.2, z: 3.5, r: 0.4 },
    { x: -1.5, z: -4, r: 0.35 }, { x: 2.5, z: -1, r: 0.38 }, { x: -2.5, z: 2.5, r: 0.4 },
    { x: 1.8, z: -3.5, r: 0.38 }, { x: -1.2, z: 3, r: 0.42 }, { x: 3, z: 0.5, r: 0.35 },
    { x: -3, z: -1.5, r: 0.38 }, { x: 0.8, z: -4.5, r: 0.4 },
  ],

  maze_medium: [
    { x: 0, z: 0, w: 8, h: 0.3, type: 'wall' }, { x: -2, z: -2, w: 0.3, h: 4, type: 'wall' },
    { x: 2, z: 2, w: 0.3, h: 4, type: 'wall' }, { x: 0, z: 3, w: 4, h: 0.3, type: 'wall' },
    { x: -3, z: 1, w: 0.3, h: 3, type: 'wall' }, { x: 3, z: -1, w: 0.3, h: 3, type: 'wall' },
    { x: 1, z: -3, w: 4, h: 0.3, type: 'wall' }, { x: -1, z: 1, w: 3.5, h: 0.3, type: 'wall' },
    { x: 4, z: 2, w: 0.3, h: 2.5, type: 'wall' }, { x: -4, z: -1, w: 0.3, h: 2.5, type: 'wall' },
  ],
  maze_hard: [
    { x: 0, z: 0, w: 9, h: 0.3, type: 'wall' }, { x: -2, z: -2, w: 0.3, h: 4, type: 'wall' },
    { x: 2, z: 2, w: 0.3, h: 4, type: 'wall' }, { x: 0, z: 3.5, w: 5, h: 0.3, type: 'wall' },
    { x: -3, z: 1, w: 0.3, h: 3, type: 'wall' }, { x: 3, z: -1, w: 0.3, h: 3, type: 'wall' },
    { x: 1, z: -3, w: 4, h: 0.3, type: 'wall' }, { x: -1, z: 1, w: 3.5, h: 0.3, type: 'wall' },
    { x: 4, z: 2, w: 0.3, h: 3, type: 'wall' }, { x: -4, z: -1, w: 0.3, h: 3, type: 'wall' },
    { x: 1.5, z: -1.5, w: 3, h: 0.3, type: 'wall' }, { x: -3.5, z: 3, w: 0.3, h: 2, type: 'wall' },
    { x: 2.5, z: -4, w: 4, h: 0.3, type: 'wall' }, { x: -1.5, z: 4, w: 3, h: 0.3, type: 'wall' },
    { x: 0, z: -4.5, w: 0.3, h: 2, type: 'wall' },
  ],

  square_medium: [
    { x: 0, z: -3.5, w: 7, h: 0.25, type: 'wall' }, { x: 0, z: 3.5, w: 7, h: 0.25, type: 'wall' },
    { x: -3.5, z: 0, w: 0.25, h: 7, type: 'wall' }, { x: 3.5, z: 0, w: 0.25, h: 7, type: 'wall' },
    { x: -1.5, z: -1.5, r: 0.42 }, { x: 1.5, z: 1.5, r: 0.42 },
    { x: 1.5, z: -1.5, r: 0.38 }, { x: -1.5, z: 1.5, r: 0.38 },
  ],
  square_hard: [
    { x: 0, z: -3.5, w: 7, h: 0.25, type: 'wall' }, { x: 0, z: 3.5, w: 7, h: 0.25, type: 'wall' },
    { x: -3.5, z: 0, w: 0.25, h: 7, type: 'wall' }, { x: 3.5, z: 0, w: 0.25, h: 7, type: 'wall' },
    { x: -1.5, z: -1.5, r: 0.42 }, { x: 1.5, z: 1.5, r: 0.42 },
    { x: 1.5, z: -1.5, r: 0.38 }, { x: -1.5, z: 1.5, r: 0.38 },
    { x: 0, z: -1.5, r: 0.35 }, { x: 0, z: 1.5, r: 0.35 },
    { x: -1.5, z: 0, r: 0.35 }, { x: 1.5, z: 0, r: 0.35 }, { x: 0, z: 0, r: 0.3 },
  ],

  collect_medium: [
    { x: 2.5, z: -2, r: 0.4 }, { x: -2, z: 2.5, r: 0.4 },
    { x: 3, z: 2, r: 0.35 }, { x: -3, z: -1.5, r: 0.4 },
    { x: 0.5, z: -3.5, r: 0.38 }, { x: -3.5, z: 0.5, r: 0.42 },
    { x: 2, z: 4, r: 0.36 }, { x: -1, z: -4, r: 0.38 },
  ],
  collect_hard: [
    { x: 2.5, z: -2, r: 0.38 }, { x: -2, z: 2.5, r: 0.38 },
    { x: 3, z: 2, r: 0.33 }, { x: -3, z: -1.5, r: 0.38 },
    { x: 0.5, z: -3.5, r: 0.35 }, { x: -3.5, z: 0.5, r: 0.40 },
    { x: 2, z: 4, r: 0.34 }, { x: -1, z: -4, r: 0.36 },
    { x: 4, z: -3, r: 0.32 }, { x: -4, z: 3, r: 0.34 },
  ],

  delivery_medium: [
    { x: -2, z: 0, r: 0.55 }, { x: 2, z: 0, r: 0.55 }, { x: 0, z: 3, r: 0.45 },
    { x: -3.5, z: -2, r: 0.5 }, { x: 3.5, z: 2.5, r: 0.48 },
    { x: 1, z: -2, r: 0.42 }, { x: -1.5, z: 2.5, r: 0.45 },
  ],
  delivery_hard: [
    { x: -2, z: 0, r: 0.52 }, { x: 2, z: 0, r: 0.52 }, { x: 0, z: 3, r: 0.42 },
    { x: -3.5, z: -2, r: 0.48 }, { x: 3.5, z: 2.5, r: 0.45 },
    { x: 1, z: -2, r: 0.40 }, { x: -1.5, z: 2.5, r: 0.43 },
    { x: 0, z: -3.5, r: 0.38 }, { x: -2.5, z: 3.5, r: 0.42 }, { x: 3, z: -1.5, r: 0.4 },
  ],

  sky_rings_medium: [
    { x: 0, z: -4, r: 0.35, type: 'ring' }, { x: 2, z: -1, r: 0.32, type: 'ring' },
    { x: -2, z: 1, r: 0.32, type: 'ring' }, { x: 0, z: 4, r: 0.35, type: 'ring' },
    { x: 3, z: -3, r: 0.30, type: 'ring' }, { x: -3, z: 3, r: 0.30, type: 'ring' },
    { x: 3, z: 3, r: 0.4 }, { x: -2.5, z: -3.5, r: 0.38 },
  ],
  sky_rings_hard: [
    { x: 0, z: -4, r: 0.3, type: 'ring' }, { x: 2.5, z: -2, r: 0.28, type: 'ring' },
    { x: -2.5, z: 0.5, r: 0.28, type: 'ring' }, { x: 1, z: 3.5, r: 0.3, type: 'ring' },
    { x: -1.5, z: -2.5, r: 0.26, type: 'ring' }, { x: 3.5, z: 2, r: 0.28, type: 'ring' },
    { x: -3.5, z: -1, r: 0.28, type: 'ring' }, { x: 0.5, z: -1, r: 0.26, type: 'ring' },
    { x: 3, z: 3, r: 0.4 }, { x: -2.5, z: -3.5, r: 0.38 }, { x: 2, z: -4.5, r: 0.35 },
  ],

  figure8_medium: [
    { x: -2, z: 0, r: 1.8 }, { x: 2, z: 0, r: 1.8 },
    { x: 0, z: 0, w: 0.3, h: 0.3, type: 'wall' },
    { x: -3, z: 2.5, r: 0.42 }, { x: 3, z: -2.5, r: 0.42 },
    { x: -1, z: -3, r: 0.38 }, { x: 1, z: 3, r: 0.38 },
  ],
  figure8_hard: [
    { x: -2, z: 0, r: 1.8 }, { x: 2, z: 0, r: 1.8 },
    { x: 0, z: 0, w: 0.3, h: 0.3, type: 'wall' },
    { x: -3, z: 2.5, r: 0.42 }, { x: 3, z: -2.5, r: 0.42 },
    { x: -1, z: -3, r: 0.38 }, { x: 1, z: 3, r: 0.38 },
    { x: -3.5, z: -1, r: 0.35 }, { x: 3.5, z: 1, r: 0.35 },
    { x: -1.5, z: 2.5, r: 0.32 }, { x: 1.5, z: -2.5, r: 0.32 }, { x: 0, z: 3.5, r: 0.38 },
  ],

  // ── New course types ──────────────────────────────────────────────────────
  checkpoint: [
    { x: 0, z: -4, r: 0.35, type: 'ring' }, { x: 0, z: 0, r: 0.35, type: 'ring' },
    { x: 0, z: 4, r: 0.35, type: 'ring' },
  ],
  checkpoint_medium: [
    { x: -2, z: -4, r: 0.33, type: 'ring' }, { x: 2, z: -2, r: 0.33, type: 'ring' },
    { x: -1, z: 0, r: 0.30, type: 'ring' }, { x: 2.5, z: 2.5, r: 0.30, type: 'ring' },
    { x: 0, z: 5, r: 0.33, type: 'ring' },
    { x: 1.5, z: -1, r: 0.45 }, { x: -2, z: 1.5, r: 0.42 },
  ],
  checkpoint_hard: [
    { x: -2, z: -5, r: 0.28, type: 'ring' }, { x: 3, z: -3, r: 0.28, type: 'ring' },
    { x: -3, z: -1, r: 0.25, type: 'ring' }, { x: 2, z: 1.5, r: 0.25, type: 'ring' },
    { x: -1, z: 3.5, r: 0.28, type: 'ring' }, { x: 3, z: 5, r: 0.28, type: 'ring' },
    { x: 0, z: -2, r: 0.26, type: 'ring' }, { x: -3, z: 4, r: 0.25, type: 'ring' },
    { x: 1.5, z: -1, r: 0.42 }, { x: -2, z: 1.5, r: 0.40 }, { x: 3.5, z: -0.5, r: 0.38 },
  ],

  targets: [
    { x: 2, z: -2, r: 0.45 }, { x: -2, z: 2, r: 0.45 }, { x: 3.5, z: 1, r: 0.40 },
    { x: -3.5, z: -1, r: 0.40 }, { x: 0, z: -4, r: 0.45 },
  ],
  targets_medium: [
    { x: 2, z: -2, r: 0.42 }, { x: -2, z: 2, r: 0.42 }, { x: 3.5, z: 1, r: 0.38 },
    { x: -3.5, z: -1, r: 0.38 }, { x: 0, z: -4, r: 0.42 },
    { x: 1, z: 3.5, r: 0.38 }, { x: -1.5, z: -3, r: 0.40 }, { x: 4, z: -2.5, r: 0.35 },
  ],
  targets_hard: [
    { x: 2, z: -2, r: 0.38 }, { x: -2, z: 2, r: 0.38 }, { x: 3.5, z: 1, r: 0.35 },
    { x: -3.5, z: -1, r: 0.35 }, { x: 0, z: -4, r: 0.38 },
    { x: 1, z: 3.5, r: 0.35 }, { x: -1.5, z: -3, r: 0.37 }, { x: 4, z: -2.5, r: 0.32 },
    { x: -4, z: 2.5, r: 0.32 }, { x: 2.5, z: 4, r: 0.35 }, { x: -1, z: -5, r: 0.33 },
    { x: 5, z: 0, r: 0.3 },
  ],

  speedrun: [
    { x: 0, z: -2, w: 12, h: 0.25, type: 'wall' },
    { x: 0, z: 2, w: 12, h: 0.25, type: 'wall' },
  ],
  speedrun_medium: [
    { x: 0, z: -2.5, w: 12, h: 0.25, type: 'wall' },
    { x: 0, z: 2.5, w: 12, h: 0.25, type: 'wall' },
    { x: -2, z: 0, r: 0.42 }, { x: 2, z: 0.8, r: 0.38 }, { x: 3.5, z: -0.5, r: 0.40 },
  ],
  speedrun_hard: [
    { x: 0, z: -2, w: 12, h: 0.25, type: 'wall' },
    { x: 0, z: 2, w: 12, h: 0.25, type: 'wall' },
    { x: -2, z: 0, r: 0.40 }, { x: 2, z: 0.8, r: 0.36 }, { x: 3.5, z: -0.5, r: 0.38 },
    { x: -3.5, z: 0.5, r: 0.36 }, { x: 0.5, z: -0.8, r: 0.34 }, { x: 1, z: 1.2, r: 0.32 },
  ],

  // ── DODGE COURSES ────────────────────────────────────────────────────────
  // Moving obstacles are registered dynamically; static = boundary markers only
  dodge_easy: [],
  dodge_medium: [
    // Laser post bases (collision pillars)
    { x: -4.5, z: -2.5, r: 0.18 }, { x: -4.5, z: 2.5, r: 0.18 },
    { x: 0,    z: -4.5, r: 0.18 }, { x: 0,    z:  4.5, r: 0.18 },
    { x:  4.5, z: -2.5, r: 0.18 }, { x:  4.5, z:  2.5, r: 0.18 },
  ],
  dodge_hard: [
    // A couple static boulders for cover
    { x: -6, z: -5, r: 0.55 }, { x: 5, z: 5, r: 0.55 },
  ],

  // ── ESCAPE COURSES ────────────────────────────────────────────────────────
  escape_easy: [
    // Corridor walls — robot must sprint the length before the wall arrives
    { x: 0, z: -2.8, w: 22, h: 0.3, type: 'wall' },
    { x: 0, z:  2.8, w: 22, h: 0.3, type: 'wall' },
    // Moving wall is registered dynamically
  ],
  escape_medium: [],   // pursuers registered dynamically
  escape_hard: [
    // Buildings to hide behind
    { x: -5, z: -5, w: 1.8, h: 1.8, type: 'wall' },
    { x:  5, z: -5, w: 1.8, h: 1.8, type: 'wall' },
    { x: -5, z:  5, w: 1.8, h: 1.8, type: 'wall' },
    { x:  5, z:  5, w: 1.8, h: 1.8, type: 'wall' },
    { x:  0, z:  0, w: 2.2, h: 2.2, type: 'wall' },
    // Swarm registered dynamically
  ],

  // ── COLLECTION COURSES ────────────────────────────────────────────────────
  collect_easy:   [],   // items are visual-only; no path obstacles
  collect_medium: [
    { x:  0, z: -2.5, w: 5.5, h: 0.25, type: 'wall' },
    { x:  0, z:  2.5, w: 5.5, h: 0.25, type: 'wall' },
  ],
  collect_hard: [
    { x: -2.5, z: -1, w: 0.25, h: 4.5, type: 'wall' },
    { x:  2.5, z:  1, w: 0.25, h: 4.5, type: 'wall' },
    { x:  0,   z: -4, w: 5,   h: 0.25, type: 'wall' },
    { x:  0,   z:  4, w: 5,   h: 0.25, type: 'wall' },
    { x: -5,   z:  2, r: 0.4 }, { x: 5, z: -2, r: 0.4 },
  ],

  // ── FLIGHT COURSES ────────────────────────────────────────────────────────
  // Rings have y height. type:'ring' means no floor-collision.
  flight_easy: [
    { x:  0, z: -5, r: 0.85, type: 'ring', y: 2.2 },
    { x:  4, z: -2, r: 0.85, type: 'ring', y: 3.5 },
    { x: -4, z:  0, r: 0.85, type: 'ring', y: 2.8 },
    { x:  2, z:  3, r: 0.85, type: 'ring', y: 4.2 },
    { x: -2, z:  5, r: 0.85, type: 'ring', y: 3.0 },
  ],
  flight_medium: [
    { x:  0, z: -6, r: 0.68, type: 'ring', y: 2.0 },
    { x:  4, z: -4, r: 0.62, type: 'ring', y: 4.5 },
    { x: -4, z: -2, r: 0.62, type: 'ring', y: 3.2 },
    { x:  3, z:  0, r: 0.58, type: 'ring', y: 5.5 },
    { x: -3, z:  2, r: 0.58, type: 'ring', y: 2.8 },
    { x:  2, z:  4, r: 0.62, type: 'ring', y: 4.0 },
    { x: -2, z:  6, r: 0.62, type: 'ring', y: 6.5 },
    { x:  0, z:  2, r: 0.55, type: 'ring', y: 7.0 },
    { x: -1.5, z: -3, r: 0.45 }, { x: 1.5, z: 2.5, r: 0.42 },
  ],
  flight_hard: [
    { x:  0, z: -6, r: 0.55, type: 'ring', y: 2.5 },
    { x:  3, z: -5, r: 0.52, type: 'ring', y: 4.5 },
    { x: -3, z: -3, r: 0.50, type: 'ring', y: 6.0 },
    { x:  4, z: -1, r: 0.48, type: 'ring', y: 3.5 },
    { x: -4, z:  1, r: 0.48, type: 'ring', y: 5.0 },
    { x:  2, z:  3, r: 0.45, type: 'ring', y: 7.0 },
    { x: -2, z:  5, r: 0.45, type: 'ring', y: 4.5 },
    { x:  5, z: -4, r: 0.50, type: 'ring', y: 8.0 },
    { x: -5, z:  2, r: 0.48, type: 'ring', y: 5.5 },
    { x:  1, z:  0, r: 0.42, type: 'ring', y: 7.5 },
    { x: -1, z: -5, r: 0.42, type: 'ring', y: 3.0 },
    { x:  4, z:  4, r: 0.45, type: 'ring', y: 6.5 },
    { x: -4, z: -4, r: 0.44, type: 'ring', y: 4.0 },
    { x:  0, z:  1, r: 0.40, type: 'ring', y: 9.0 },
    { x:  3, z:  6, r: 0.45, type: 'ring', y: 7.5 },
    // Aerial hazard columns
    { x: -2,  z: -1.5, r: 0.44 }, { x: 2, z: 1.8, r: 0.42 },
    { x: -3.5, z: 3.5, r: 0.40 }, { x: 3.5, z: -2.5, r: 0.40 },
  ],

  // ── EXPLORER SPIDER COURSES ───────────────────────────────────────────────
  spider_temple: [
    // Ancient stone pillars (must navigate around)
    { x: -3.5, z: -5, r: 0.45 }, { x: 3.5, z: -5, r: 0.45 },
    { x: -5, z: -1.5, r: 0.45 }, { x: 5, z: -1.5, r: 0.45 },
    { x: -5, z:  1.5, r: 0.45 }, { x: 5, z:  1.5, r: 0.45 },
    { x: -3.5, z:  5, r: 0.45 }, { x: 3.5, z:  5, r: 0.45 },
    { x:  0,   z:  0, r: 0.50 },
    // Corridor wall passages
    { x: 0, z: -3, w: 5, h: 0.3, type: 'wall' },
    { x: 0, z:  3, w: 5, h: 0.3, type: 'wall' },
  ],
  spider_web: [
    // Web strand barriers
    { x: -5, z: -2, w: 0.22, h: 5.5, type: 'wall' },
    { x:  5, z:  2, w: 0.22, h: 5.5, type: 'wall' },
    { x:  0, z: -5, w: 5.5, h: 0.22, type: 'wall' },
    { x:  0, z:  5, w: 5.5, h: 0.22, type: 'wall' },
    // Crystal guardians
    { x: -3, z: -3, r: 0.42 }, { x: 3, z:  3, r: 0.42 },
    { x:  3, z: -3, r: 0.42 }, { x: -3, z: 3, r: 0.42 },
    { x:  0, z:  0, r: 0.48 },
  ],
  spider_cave: [
    // Stalactite bases + cave rock clusters
    { x: -4.5, z: -4, r: 0.55 }, { x: 4.5, z: -4, r: 0.55 },
    { x: -2,   z: -2, r: 0.45 }, { x: 2,   z:  2, r: 0.45 },
    { x: -4.5, z:  4, r: 0.55 }, { x: 4.5, z:  4, r: 0.55 },
    { x:  0,   z: -6, r: 0.50 }, { x:  0,  z:  6, r: 0.50 },
    { x: -6,   z:  0, r: 0.50 }, { x:  6,  z:  0, r: 0.50 },
    // Narrow cave passages
    { x: -2.5, z: -5, w: 0.28, h: 3.5, type: 'wall' },
    { x:  2.5, z:  5, w: 0.28, h: 3.5, type: 'wall' },
    { x:  0,   z:  0, w: 4, h: 0.28, type: 'wall' },
  ],

  // ── RACER DRONE COURSES ───────────────────────────────────────────────────
  drone_skyrace: [
    // 10 large aerial rings for championship racing
    { x:  0,  z: -8, r: 1.1, type: 'ring', y: 3.5 },
    { x:  3,  z: -6, r: 1.0, type: 'ring', y: 5.0 },
    { x: -3,  z: -4, r: 1.0, type: 'ring', y: 3.8 },
    { x:  5,  z: -2, r: 0.95, type: 'ring', y: 6.0 },
    { x: -5,  z:  0, r: 0.95, type: 'ring', y: 4.5 },
    { x:  4,  z:  2, r: 0.90, type: 'ring', y: 3.2 },
    { x: -4,  z:  4, r: 0.90, type: 'ring', y: 5.5 },
    { x:  3,  z:  6, r: 0.95, type: 'ring', y: 4.0 },
    { x: -2,  z:  7, r: 0.95, type: 'ring', y: 6.5 },
    { x:  0,  z:  8, r: 1.05, type: 'ring', y: 4.2 },
  ],
  drone_neoncity: [
    // Skyscraper columns (must fly between)
    { x: -5, z: -5, r: 0.75 }, { x: 5, z: -5, r: 0.75 },
    { x: -5, z:  5, r: 0.75 }, { x: 5, z:  5, r: 0.75 },
    { x:  0, z: -3, r: 0.65 }, { x: 0, z:  3, r: 0.65 },
    { x: -3, z:  0, r: 0.60 }, { x: 3, z:  0, r: 0.60 },
    // Neon ring gates woven through buildings
    { x: -2.5, z: -6.5, r: 0.80, type: 'ring', y: 4.5 },
    { x:  2.5, z: -4,   r: 0.75, type: 'ring', y: 6.5 },
    { x: -4,   z: -1,   r: 0.75, type: 'ring', y: 5.0 },
    { x:  4,   z:  2,   r: 0.72, type: 'ring', y: 7.5 },
    { x: -2,   z:  5,   r: 0.78, type: 'ring', y: 4.8 },
    { x:  2,   z:  7,   r: 0.82, type: 'ring', y: 3.5 },
  ],
  drone_slalom: [
    // 16-gate tight space slalom
    { x:  0,   z: -8, r: 0.58, type: 'ring', y: 3.0 },
    { x:  3,   z: -7, r: 0.55, type: 'ring', y: 5.5 },
    { x: -3,   z: -6, r: 0.55, type: 'ring', y: 4.0 },
    { x:  4,   z: -5, r: 0.52, type: 'ring', y: 7.0 },
    { x: -4,   z: -4, r: 0.52, type: 'ring', y: 3.5 },
    { x:  3,   z: -3, r: 0.50, type: 'ring', y: 6.0 },
    { x: -3,   z: -2, r: 0.50, type: 'ring', y: 8.0 },
    { x:  4.5, z: -1, r: 0.47, type: 'ring', y: 4.5 },
    { x: -4.5, z:  0, r: 0.47, type: 'ring', y: 6.5 },
    { x:  3,   z:  1, r: 0.45, type: 'ring', y: 9.0 },
    { x: -3,   z:  2, r: 0.45, type: 'ring', y: 5.0 },
    { x:  5,   z:  3, r: 0.43, type: 'ring', y: 7.5 },
    { x: -5,   z:  4, r: 0.43, type: 'ring', y: 3.8 },
    { x:  2,   z:  5, r: 0.42, type: 'ring', y: 6.0 },
    { x: -2,   z:  6, r: 0.42, type: 'ring', y: 8.5 },
    { x:  0,   z:  7, r: 0.50, type: 'ring', y: 5.0 },
    // Asteroid columns
    { x: -1.5, z: -1.5, r: 0.42 }, { x: 1.5, z:  1.5, r: 0.42 },
    { x: -4.5, z:  2.5, r: 0.40 }, { x: 4.5, z: -2.5, r: 0.40 },
  ],

  // ── HEAVY ROBOT COURSES ───────────────────────────────────────────────────
  heavy_warehouse: [
    // Shelving rack pillars
    { x: -5, z: -4, w: 0.4, h: 6, type: 'wall' },
    { x: -5, z:  2, w: 0.4, h: 6, type: 'wall' },
    { x:  5, z: -2, w: 0.4, h: 6, type: 'wall' },
    { x:  5, z:  4, w: 0.4, h: 6, type: 'wall' },
    { x:  0, z:  0, w: 0.4, h: 6, type: 'wall' },
    // Stacked box clusters
    { x: -2, z: -5, r: 0.55 }, { x: 2, z: -5, r: 0.55 },
    { x: -2, z:  5, r: 0.55 }, { x: 2, z:  5, r: 0.55 },
  ],
  heavy_construction: [
    // Heavy machinery + debris piles
    { x: -4, z: -5, r: 0.75 }, { x: 4, z: -5, r: 0.75 },
    { x: -6, z:  0, r: 0.65 }, { x: 6, z:  0, r: 0.65 },
    { x: -4, z:  5, r: 0.70 }, { x: 4, z:  5, r: 0.70 },
    { x:  0, z: -2, r: 0.55 }, { x: 0, z:  2, r: 0.55 },
    // Barrier fences
    { x:  0, z: -3.5, w: 5, h: 0.3, type: 'wall' },
    { x:  0, z:  3.5, w: 5, h: 0.3, type: 'wall' },
    { x: -3, z:  0, w: 0.3, h: 5, type: 'wall' },
  ],
  heavy_megabuild: [
    // Massive structure pillars
    { x: -6, z: -6, r: 0.70 }, { x: 6, z: -6, r: 0.70 },
    { x: -6, z:  6, r: 0.70 }, { x: 6, z:  6, r: 0.70 },
    { x: -3, z: -3, r: 0.55 }, { x: 3, z: -3, r: 0.55 },
    { x: -3, z:  3, r: 0.55 }, { x: 3, z:  3, r: 0.55 },
    { x:  0, z:  0, r: 0.65 },
    // Corridor walls
    { x:  0, z: -5, w: 7, h: 0.3, type: 'wall' },
    { x:  0, z:  5, w: 7, h: 0.3, type: 'wall' },
    { x: -5, z:  0, w: 0.3, h: 7, type: 'wall' },
    { x:  5, z:  0, w: 0.3, h: 7, type: 'wall' },
  ],

  // ── SPIDER TIER 1 ─────────────────────────────────────────────────────────
  spider_bridges: [
    { x: -3, z: -6, r: 0.45 }, { x: 3, z: -6, r: 0.45 },
    { x:  0, z: -4, r: 0.40 },
    { x: -4, z: -2, r: 0.50 }, { x: 4, z: -2, r: 0.50 },
    { x:  0, z:  0, w: 4, h: 0.3, type: 'wall' },
    { x: -2, z:  3, r: 0.45 }, { x: 2, z:  3, r: 0.45 },
    { x:  0, z:  6, r: 0.40 },
  ],
  spider_vine: [
    { x: -2, z: -7, r: 0.35 }, { x: 2, z: -7, r: 0.35 },
    { x: -4, z: -4, r: 0.40 }, { x: 4, z: -4, r: 0.40 },
    { x:  0, z: -2, r: 0.38 },
    { x: -3, z:  1, r: 0.42 }, { x: 3, z:  1, r: 0.42 },
    { x:  0, z:  4, r: 0.36 },
    { x: -2, z:  6, r: 0.40 }, { x: 2, z:  6, r: 0.40 },
  ],
  spider_maze: [
    { x:  0, z: -6, w: 6, h: 0.3, type: 'wall' },
    { x: -3, z: -3, w: 0.3, h: 4, type: 'wall' },
    { x:  3, z: -1, w: 0.3, h: 4, type: 'wall' },
    { x:  0, z:  1, w: 5, h: 0.3, type: 'wall' },
    { x: -2, z:  4, w: 0.3, h: 3, type: 'wall' },
    { x:  2, z:  6, w: 4, h: 0.3, type: 'wall' },
    { x: -1, z: -1, r: 0.35 }, { x: 1, z:  3, r: 0.35 },
  ],
  spider_guardian: [
    { x: -5, z: -5, r: 0.65 }, { x: 5, z: -5, r: 0.65 },
    { x:  0, z: -3, r: 0.50 },
    { x: -4, z:  0, r: 0.55 }, { x: 4, z:  0, r: 0.55 },
    { x:  0, z:  3, r: 0.60 },
    { x: -3, z:  6, r: 0.50 }, { x: 3, z:  6, r: 0.50 },
    { x:  0, z: -6, w: 5, h: 0.3, type: 'wall' },
  ],

  // ── SPIDER TIER 2 ─────────────────────────────────────────────────────────
  spider_interior: [
    { x:  0, z: -5, w: 7, h: 0.3, type: 'wall' },
    { x: -4, z: -2, w: 0.3, h: 5, type: 'wall' },
    { x:  4, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 6, h: 0.3, type: 'wall' },
    { x: -2, z:  5, w: 0.3, h: 4, type: 'wall' },
    { x: -1, z: -3, r: 0.40 }, { x: 2, z: -1, r: 0.38 },
    { x:  1, z:  4, r: 0.42 },
  ],
  spider_river: [
    { x: -3, z: -7, r: 0.50 }, { x: 3, z: -7, r: 0.50 },
    { x:  0, z: -5, w: 4, h: 0.3, type: 'wall' },
    { x: -4, z: -2, r: 0.55 }, { x: 4, z: -2, r: 0.55 },
    { x:  0, z:  0, w: 3, h: 0.3, type: 'wall' },
    { x: -3, z:  3, r: 0.48 }, { x: 3, z:  3, r: 0.48 },
    { x:  0, z:  6, r: 0.50 },
  ],
  spider_forest: [
    { x: -2, z: -6, r: 0.55 }, { x: 2, z: -6, r: 0.55 },
    { x: -5, z: -3, r: 0.50 }, { x: 5, z: -3, r: 0.50 },
    { x:  0, z: -1, r: 0.60 },
    { x: -3, z:  2, r: 0.50 }, { x: 3, z:  2, r: 0.50 },
    { x: -6, z:  5, r: 0.55 }, { x: 6, z:  5, r: 0.55 },
    { x:  0, z:  7, r: 0.45 },
  ],
  spider_race: [
    { x: -1, z: -8, r: 0.40 }, { x: 1, z: -8, r: 0.40 },
    { x: -3, z: -5, r: 0.45 }, { x: 3, z: -5, r: 0.45 },
    { x:  0, z: -3, w: 3, h: 0.3, type: 'wall' },
    { x: -2, z: -1, r: 0.42 }, { x: 2, z: -1, r: 0.42 },
    { x:  0, z:  2, w: 4, h: 0.3, type: 'wall' },
    { x: -3, z:  4, r: 0.45 }, { x: 3, z:  4, r: 0.45 },
    { x:  0, z:  7, r: 0.38 },
  ],
  spider_web_city: [
    { x: -4, z: -4, r: 0.60 }, { x: 4, z: -4, r: 0.60 },
    { x:  0, z: -2, r: 0.50 },
    { x: -5, z:  0, r: 0.55 }, { x: 5, z:  0, r: 0.55 },
    { x: -2, z:  2, r: 0.48 }, { x: 2, z:  2, r: 0.48 },
    { x:  0, z:  4, r: 0.52 },
    { x: -4, z:  6, r: 0.50 }, { x: 4, z:  6, r: 0.50 },
    { x:  0, z: -5, w: 4, h: 0.3, type: 'wall' },
    { x:  0, z:  1, w: 5, h: 0.3, type: 'wall' },
  ],
  spider_warzone: [
    { x: -3, z: -6, r: 0.60 }, { x: 3, z: -6, r: 0.60 },
    { x: -6, z: -2, r: 0.55 }, { x: 6, z: -2, r: 0.55 },
    { x:  0, z:  0, r: 0.65 },
    { x: -4, z:  3, r: 0.58 }, { x: 4, z:  3, r: 0.58 },
    { x:  0, z: -4, w: 5, h: 0.3, type: 'wall' },
    { x: -3, z:  1, w: 0.3, h: 4, type: 'wall' },
    { x:  3, z:  5, w: 5, h: 0.3, type: 'wall' },
  ],

  // ── SPIDER TIER 3 ─────────────────────────────────────────────────────────
  spider_elemental: [
    { x: -4, z: -5, r: 0.65 }, { x: 4, z: -5, r: 0.65 },
    { x:  0, z: -3, r: 0.55 },
    { x: -6, z:  0, r: 0.60 }, { x: 6, z:  0, r: 0.60 },
    { x: -2, z:  3, r: 0.55 }, { x: 2, z:  3, r: 0.55 },
    { x:  0, z:  6, r: 0.60 },
    { x:  0, z: -7, w: 6, h: 0.3, type: 'wall' },
    { x: -4, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  4, z:  1, w: 0.3, h: 5, type: 'wall' },
  ],
  spider_labyrinth: [
    { x:  0, z: -7, w: 8, h: 0.3, type: 'wall' },
    { x: -4, z: -5, w: 0.3, h: 3, type: 'wall' },
    { x:  4, z: -4, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z: -2, w: 6, h: 0.3, type: 'wall' },
    { x: -4, z:  0, w: 0.3, h: 3, type: 'wall' },
    { x:  3, z:  2, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z:  4, w: 7, h: 0.3, type: 'wall' },
    { x: -3, z:  6, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z: -4, r: 0.40 }, { x: -1, z:  1, r: 0.38 },
  ],
  spider_ruin_race: [
    { x: -2, z: -7, r: 0.50 }, { x: 2, z: -7, r: 0.50 },
    { x: -4, z: -4, r: 0.55 }, { x: 4, z: -4, r: 0.55 },
    { x:  0, z: -5, w: 3, h: 0.3, type: 'wall' },
    { x: -1, z: -1, r: 0.48 }, { x: 1, z: -1, r: 0.48 },
    { x:  0, z:  2, w: 5, h: 0.3, type: 'wall' },
    { x: -5, z:  4, r: 0.55 }, { x: 5, z:  4, r: 0.55 },
    { x:  0, z:  6, r: 0.45 },
  ],
  spider_trials: [
    { x: -3, z: -6, r: 0.55 }, { x: 3, z: -6, r: 0.55 },
    { x:  0, z: -4, w: 4, h: 0.3, type: 'wall' },
    { x: -5, z: -1, r: 0.60 }, { x: 5, z: -1, r: 0.60 },
    { x:  0, z:  1, w: 6, h: 0.3, type: 'wall' },
    { x: -2, z:  3, r: 0.55 }, { x: 2, z:  3, r: 0.55 },
    { x:  0, z:  5, w: 5, h: 0.3, type: 'wall' },
    { x: -4, z:  7, r: 0.50 }, { x: 4, z:  7, r: 0.50 },
  ],

  // ── SPIDER TIER 4 ─────────────────────────────────────────────────────────
  spider_infinite: [
    { x: -4, z: -6, r: 0.65 }, { x: 4, z: -6, r: 0.65 },
    { x:  0, z: -4, r: 0.60 },
    { x: -6, z: -1, r: 0.65 }, { x: 6, z: -1, r: 0.65 },
    { x: -2, z:  2, r: 0.60 }, { x: 2, z:  2, r: 0.60 },
    { x:  0, z:  5, r: 0.65 },
    { x: -5, z:  7, r: 0.60 }, { x: 5, z:  7, r: 0.60 },
    { x:  0, z: -7, w: 7, h: 0.3, type: 'wall' },
    { x: -4, z:  0, w: 0.3, h: 6, type: 'wall' },
    { x:  4, z:  4, w: 0.3, h: 6, type: 'wall' },
  ],
  spider_hunt: [
    { x: -5, z: -5, r: 0.70 }, { x: 5, z: -5, r: 0.70 },
    { x:  0, z: -3, r: 0.65 },
    { x: -6, z:  0, r: 0.65 }, { x: 6, z:  0, r: 0.65 },
    { x: -3, z:  3, r: 0.65 }, { x: 3, z:  3, r: 0.65 },
    { x:  0, z:  6, r: 0.70 },
    { x:  0, z: -6, w: 8, h: 0.3, type: 'wall' },
    { x:  0, z:  1, w: 8, h: 0.3, type: 'wall' },
    { x: -4, z: -2, w: 0.3, h: 5, type: 'wall' },
    { x:  4, z:  2, w: 0.3, h: 5, type: 'wall' },
  ],
  spider_gauntlet: [
    { x: -5, z: -7, r: 0.75 }, { x: 5, z: -7, r: 0.75 },
    { x:  0, z: -5, r: 0.70 },
    { x: -6, z: -2, r: 0.70 }, { x: 6, z: -2, r: 0.70 },
    { x:  0, z:  0, r: 0.75 },
    { x: -4, z:  3, r: 0.70 }, { x: 4, z:  3, r: 0.70 },
    { x:  0, z:  6, r: 0.75 },
    { x:  0, z: -8, w: 8, h: 0.3, type: 'wall' },
    { x: -5, z: -4, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 8, h: 0.3, type: 'wall' },
    { x: -3, z:  5, w: 0.3, h: 4, type: 'wall' },
  ],

  // ── DRONE TIER 1 ──────────────────────────────────────────────────────────
  drone_academy: [
    { x: -2, z: -6, r: 0.80, type: 'ring', y: 3.0 },
    { x:  2, z: -4, r: 0.80, type: 'ring', y: 4.0 },
    { x: -2, z: -2, r: 0.80, type: 'ring', y: 3.5 },
    { x:  2, z:  0, r: 0.80, type: 'ring', y: 4.5 },
    { x: -2, z:  2, r: 0.80, type: 'ring', y: 3.0 },
    { x:  0, z:  5, r: 0.80, type: 'ring', y: 4.0 },
  ],
  drone_cloud_race: [
    { x:  0, z: -7, r: 0.85, type: 'ring', y: 4.0 },
    { x: -3, z: -5, r: 0.82, type: 'ring', y: 5.0 },
    { x:  3, z: -3, r: 0.82, type: 'ring', y: 3.5 },
    { x: -2, z: -1, r: 0.80, type: 'ring', y: 6.0 },
    { x:  2, z:  1, r: 0.80, type: 'ring', y: 4.5 },
    { x: -3, z:  3, r: 0.82, type: 'ring', y: 5.5 },
    { x:  3, z:  5, r: 0.85, type: 'ring', y: 4.0 },
  ],
  drone_gates: [
    { x:  0, z: -8, r: 0.78, type: 'ring', y: 3.5 },
    { x: -2, z: -6, r: 0.75, type: 'ring', y: 5.0 },
    { x:  2, z: -4, r: 0.75, type: 'ring', y: 4.0 },
    { x:  0, z: -2, r: 0.72, type: 'ring', y: 6.5 },
    { x: -3, z:  0, r: 0.72, type: 'ring', y: 3.5 },
    { x:  3, z:  2, r: 0.70, type: 'ring', y: 5.0 },
    { x:  0, z:  4, r: 0.70, type: 'ring', y: 4.5 },
    { x: -2, z:  6, r: 0.68, type: 'ring', y: 7.0 },
  ],
  drone_wind: [
    { x: -1, z: -7, r: 0.75, type: 'ring', y: 4.5 },
    { x:  3, z: -5, r: 0.72, type: 'ring', y: 6.0 },
    { x: -3, z: -3, r: 0.72, type: 'ring', y: 3.5 },
    { x:  1, z: -1, r: 0.70, type: 'ring', y: 7.0 },
    { x: -2, z:  1, r: 0.70, type: 'ring', y: 5.0 },
    { x:  4, z:  3, r: 0.68, type: 'ring', y: 4.0 },
    { x: -4, z:  5, r: 0.68, type: 'ring', y: 6.5 },
    { x:  0, z:  7, r: 0.65, type: 'ring', y: 5.0 },
    { x: -1, z: -4, r: 0.45 }, { x: 1, z:  2, r: 0.45 },
  ],
  drone_gauntlet_easy: [
    { x:  0, z: -6, r: 0.80, type: 'ring', y: 3.5 },
    { x: -3, z: -4, r: 0.75, type: 'ring', y: 5.5 },
    { x:  3, z: -2, r: 0.75, type: 'ring', y: 4.0 },
    { x:  0, z:  0, r: 0.72, type: 'ring', y: 6.5 },
    { x: -2, z:  2, r: 0.70, type: 'ring', y: 3.8 },
    { x:  2, z:  4, r: 0.70, type: 'ring', y: 5.5 },
    { x:  0, z:  6, r: 0.68, type: 'ring', y: 4.5 },
    { x: -1, z: -5, r: 0.42 }, { x: 1, z:  1, r: 0.42 },
  ],

  // ── DRONE TIER 2 ──────────────────────────────────────────────────────────
  drone_mountain: [
    { x:  0, z: -7, r: 0.70, type: 'ring', y: 5.0 },
    { x: -3, z: -5, r: 0.68, type: 'ring', y: 7.0 },
    { x:  3, z: -3, r: 0.68, type: 'ring', y: 4.5 },
    { x: -4, z: -1, r: 0.65, type: 'ring', y: 8.0 },
    { x:  4, z:  1, r: 0.65, type: 'ring', y: 5.5 },
    { x: -2, z:  3, r: 0.62, type: 'ring', y: 6.5 },
    { x:  2, z:  5, r: 0.62, type: 'ring', y: 9.0 },
    { x:  0, z:  7, r: 0.60, type: 'ring', y: 5.0 },
    { x: -2, z: -6, r: 0.52 }, { x: 2, z:  2, r: 0.52 },
  ],
  drone_asteroid: [
    { x: -2, z: -6, r: 0.65, type: 'ring', y: 4.0 },
    { x:  2, z: -4, r: 0.62, type: 'ring', y: 6.5 },
    { x: -3, z: -2, r: 0.62, type: 'ring', y: 5.0 },
    { x:  3, z:  0, r: 0.60, type: 'ring', y: 8.0 },
    { x: -1, z:  2, r: 0.60, type: 'ring', y: 4.5 },
    { x:  1, z:  4, r: 0.58, type: 'ring', y: 7.0 },
    { x: -4, z:  6, r: 0.58, type: 'ring', y: 5.5 },
    { x: -3, z: -5, r: 0.52 }, { x: 3, z: -1, r: 0.52 },
    { x:  2, z:  3, r: 0.50 }, { x: -2, z:  5, r: 0.48 },
  ],
  drone_storm: [
    { x:  1, z: -7, r: 0.65, type: 'ring', y: 6.0 },
    { x: -3, z: -5, r: 0.62, type: 'ring', y: 4.5 },
    { x:  4, z: -3, r: 0.62, type: 'ring', y: 7.5 },
    { x: -2, z: -1, r: 0.60, type: 'ring', y: 5.5 },
    { x:  2, z:  1, r: 0.60, type: 'ring', y: 8.5 },
    { x: -4, z:  3, r: 0.58, type: 'ring', y: 4.0 },
    { x:  3, z:  5, r: 0.58, type: 'ring', y: 6.5 },
    { x: -1, z:  7, r: 0.55, type: 'ring', y: 5.0 },
    { x: -1, z: -3, r: 0.50 }, { x: 1, z:  2, r: 0.50 },
    { x:  3, z: -6, r: 0.48 }, { x: -3, z:  4, r: 0.48 },
  ],
  drone_speed_trials: [
    { x:  0, z: -8, r: 0.62, type: 'ring', y: 4.0 },
    { x: -2, z: -6, r: 0.60, type: 'ring', y: 5.5 },
    { x:  2, z: -4, r: 0.60, type: 'ring', y: 7.0 },
    { x: -3, z: -2, r: 0.58, type: 'ring', y: 4.5 },
    { x:  3, z:  0, r: 0.58, type: 'ring', y: 6.5 },
    { x: -2, z:  2, r: 0.55, type: 'ring', y: 8.0 },
    { x:  2, z:  4, r: 0.55, type: 'ring', y: 5.0 },
    { x:  0, z:  6, r: 0.52, type: 'ring', y: 6.0 },
    { x: -4, z: -3, r: 0.48 }, { x: 4, z:  1, r: 0.48 },
  ],
  drone_battle: [
    { x: -3, z: -6, r: 0.60, type: 'ring', y: 5.0 },
    { x:  3, z: -4, r: 0.58, type: 'ring', y: 7.5 },
    { x:  0, z: -2, r: 0.58, type: 'ring', y: 4.5 },
    { x: -4, z:  0, r: 0.55, type: 'ring', y: 6.5 },
    { x:  4, z:  2, r: 0.55, type: 'ring', y: 8.5 },
    { x: -2, z:  4, r: 0.52, type: 'ring', y: 5.5 },
    { x:  2, z:  6, r: 0.52, type: 'ring', y: 4.0 },
    { x: -3, z: -5, r: 0.55 }, { x: 3, z: -1, r: 0.52 },
    { x:  0, z:  3, r: 0.50 }, { x: -5, z:  2, r: 0.55 },
  ],

  // ── DRONE TIER 3-4 ────────────────────────────────────────────────────────
  drone_volcano: [
    { x:  0, z: -7, r: 0.58, type: 'ring', y: 6.0 },
    { x: -4, z: -5, r: 0.55, type: 'ring', y: 4.5 },
    { x:  4, z: -3, r: 0.55, type: 'ring', y: 8.0 },
    { x: -2, z: -1, r: 0.52, type: 'ring', y: 5.5 },
    { x:  2, z:  1, r: 0.52, type: 'ring', y: 9.0 },
    { x: -4, z:  3, r: 0.50, type: 'ring', y: 6.5 },
    { x:  4, z:  5, r: 0.50, type: 'ring', y: 4.0 },
    { x:  0, z:  7, r: 0.48, type: 'ring', y: 7.0 },
    { x: -3, z: -4, r: 0.62 }, { x: 3, z:  0, r: 0.62 },
    { x:  0, z:  4, r: 0.60 }, { x: -5, z:  1, r: 0.58 },
  ],
  drone_deep_space: [
    { x: -2, z: -7, r: 0.55, type: 'ring', y: 5.0 },
    { x:  3, z: -5, r: 0.52, type: 'ring', y: 8.5 },
    { x: -4, z: -3, r: 0.52, type: 'ring', y: 4.5 },
    { x:  1, z: -1, r: 0.50, type: 'ring', y: 7.5 },
    { x: -3, z:  1, r: 0.50, type: 'ring', y: 5.5 },
    { x:  4, z:  3, r: 0.48, type: 'ring', y: 9.5 },
    { x: -1, z:  5, r: 0.48, type: 'ring', y: 6.5 },
    { x:  2, z:  7, r: 0.45, type: 'ring', y: 4.5 },
    { x: -4, z: -6, r: 0.58 }, { x: 4, z: -2, r: 0.58 },
    { x:  0, z:  2, r: 0.55 }, { x: -2, z:  6, r: 0.55 },
  ],
  drone_world_tour: [
    { x:  0, z: -8, r: 0.52, type: 'ring', y: 4.5 },
    { x: -3, z: -6, r: 0.50, type: 'ring', y: 7.0 },
    { x:  4, z: -4, r: 0.50, type: 'ring', y: 5.5 },
    { x: -5, z: -2, r: 0.48, type: 'ring', y: 9.0 },
    { x:  3, z:  0, r: 0.48, type: 'ring', y: 4.0 },
    { x: -2, z:  2, r: 0.45, type: 'ring', y: 7.5 },
    { x:  5, z:  4, r: 0.45, type: 'ring', y: 5.0 },
    { x: -3, z:  6, r: 0.43, type: 'ring', y: 8.5 },
    { x:  1, z:  8, r: 0.43, type: 'ring', y: 6.0 },
    { x: -4, z: -5, r: 0.60 }, { x: 4, z: -1, r: 0.58 },
    { x:  0, z:  3, r: 0.55 }, { x: -2, z:  7, r: 0.55 },
  ],
  drone_elite: [
    { x: -1, z: -7, r: 0.50, type: 'ring', y: 5.5 },
    { x:  4, z: -5, r: 0.48, type: 'ring', y: 8.0 },
    { x: -4, z: -3, r: 0.48, type: 'ring', y: 4.5 },
    { x:  2, z: -1, r: 0.45, type: 'ring', y: 9.5 },
    { x: -3, z:  1, r: 0.45, type: 'ring', y: 6.0 },
    { x:  5, z:  3, r: 0.43, type: 'ring', y: 4.0 },
    { x: -2, z:  5, r: 0.43, type: 'ring', y: 7.5 },
    { x:  1, z:  7, r: 0.40, type: 'ring', y: 5.5 },
    { x: -5, z: -6, r: 0.62 }, { x: 5, z: -2, r: 0.62 },
    { x:  0, z:  0, r: 0.60 }, { x: -3, z:  4, r: 0.58 },
    { x:  3, z:  6, r: 0.58 },
  ],
  drone_infinite_race: [
    { x:  0, z: -8, r: 0.48, type: 'ring', y: 6.0 },
    { x: -3, z: -6, r: 0.45, type: 'ring', y: 4.5 },
    { x:  4, z: -4, r: 0.45, type: 'ring', y: 8.5 },
    { x: -5, z: -2, r: 0.43, type: 'ring', y: 5.5 },
    { x:  2, z:  0, r: 0.43, type: 'ring', y: 9.5 },
    { x: -4, z:  2, r: 0.40, type: 'ring', y: 4.0 },
    { x:  5, z:  4, r: 0.40, type: 'ring', y: 7.0 },
    { x: -2, z:  6, r: 0.38, type: 'ring', y: 5.5 },
    { x:  0, z:  8, r: 0.38, type: 'ring', y: 6.5 },
    { x: -4, z: -7, r: 0.62 }, { x: 4, z: -3, r: 0.62 },
    { x:  0, z:  1, r: 0.60 }, { x: -3, z:  5, r: 0.58 },
    { x:  3, z:  7, r: 0.58 },
  ],
  drone_legend: [
    { x: -2, z: -7, r: 0.45, type: 'ring', y: 5.0 },
    { x:  3, z: -5, r: 0.43, type: 'ring', y: 8.5 },
    { x: -5, z: -3, r: 0.43, type: 'ring', y: 4.5 },
    { x:  4, z: -1, r: 0.40, type: 'ring', y: 7.5 },
    { x: -3, z:  1, r: 0.40, type: 'ring', y: 5.5 },
    { x:  5, z:  3, r: 0.38, type: 'ring', y: 9.5 },
    { x: -4, z:  5, r: 0.38, type: 'ring', y: 6.5 },
    { x:  2, z:  7, r: 0.35, type: 'ring', y: 4.5 },
    { x: -5, z: -6, r: 0.65 }, { x: 5, z: -4, r: 0.65 },
    { x:  0, z: -2, r: 0.62 }, { x: -4, z:  2, r: 0.60 },
    { x:  4, z:  4, r: 0.60 }, { x:  0, z:  6, r: 0.58 },
  ],
  drone_ultimate: [
    { x:  1, z: -8, r: 0.42, type: 'ring', y: 6.5 },
    { x: -4, z: -6, r: 0.40, type: 'ring', y: 4.5 },
    { x:  5, z: -4, r: 0.40, type: 'ring', y: 9.0 },
    { x: -3, z: -2, r: 0.38, type: 'ring', y: 5.5 },
    { x:  4, z:  0, r: 0.38, type: 'ring', y: 8.0 },
    { x: -5, z:  2, r: 0.35, type: 'ring', y: 4.5 },
    { x:  3, z:  4, r: 0.35, type: 'ring', y: 7.5 },
    { x: -2, z:  6, r: 0.33, type: 'ring', y: 5.5 },
    { x:  0, z:  8, r: 0.33, type: 'ring', y: 9.5 },
    { x: -5, z: -5, r: 0.68 }, { x: 5, z: -3, r: 0.68 },
    { x:  0, z: -1, r: 0.65 }, { x: -4, z:  1, r: 0.62 },
    { x:  4, z:  3, r: 0.62 }, { x:  0, z:  5, r: 0.60 },
  ],

  // ── HEAVY TIER 1 ──────────────────────────────────────────────────────────
  heavy_basics: [
    { x: -3, z: -5, r: 0.50 }, { x: 3, z: -5, r: 0.50 },
    { x:  0, z: -3, r: 0.45 },
    { x: -2, z:  0, r: 0.50 }, { x: 2, z:  0, r: 0.50 },
    { x:  0, z:  3, r: 0.45 },
  ],
  heavy_lifting: [
    { x: -4, z: -4, r: 0.55 }, { x: 4, z: -4, r: 0.55 },
    { x:  0, z: -2, w: 4, h: 0.3, type: 'wall' },
    { x: -3, z:  1, r: 0.50 }, { x: 3, z:  1, r: 0.50 },
    { x:  0, z:  3, w: 5, h: 0.3, type: 'wall' },
    { x: -2, z:  6, r: 0.55 }, { x: 2, z:  6, r: 0.55 },
  ],
  heavy_drill_run: [
    { x:  0, z: -6, w: 6, h: 0.3, type: 'wall' },
    { x: -3, z: -3, r: 0.55 }, { x: 3, z: -3, r: 0.55 },
    { x:  0, z:  0, w: 5, h: 0.3, type: 'wall' },
    { x: -4, z:  3, r: 0.50 }, { x: 4, z:  3, r: 0.50 },
    { x:  0, z:  5, r: 0.55 },
  ],
  heavy_cargo: [
    { x: -2, z: -5, r: 0.60 }, { x: 2, z: -5, r: 0.60 },
    { x: -4, z: -2, r: 0.55 }, { x: 4, z: -2, r: 0.55 },
    { x:  0, z:  0, r: 0.65 },
    { x: -3, z:  3, r: 0.55 }, { x: 3, z:  3, r: 0.55 },
    { x:  0, z:  5, w: 5, h: 0.3, type: 'wall' },
  ],
  heavy_clear: [
    { x: -3, z: -4, r: 0.65 }, { x: 3, z: -4, r: 0.65 },
    { x:  0, z: -2, r: 0.60 },
    { x: -5, z:  0, r: 0.55 }, { x: 5, z:  0, r: 0.55 },
    { x: -2, z:  3, r: 0.60 }, { x: 2, z:  3, r: 0.60 },
    { x:  0, z: -5, w: 4, h: 0.3, type: 'wall' },
    { x:  0, z:  2, w: 4, h: 0.3, type: 'wall' },
  ],

  // ── HEAVY TIER 2-3 ────────────────────────────────────────────────────────
  heavy_mining: [
    { x: -4, z: -5, r: 0.70 }, { x: 4, z: -5, r: 0.70 },
    { x:  0, z: -3, r: 0.65 },
    { x: -5, z:  0, r: 0.65 }, { x: 5, z:  0, r: 0.65 },
    { x:  0, z:  3, r: 0.70 },
    { x: -3, z:  6, r: 0.65 }, { x: 3, z:  6, r: 0.65 },
    { x:  0, z: -6, w: 5, h: 0.3, type: 'wall' },
    { x: -3, z:  1, w: 0.3, h: 4, type: 'wall' },
  ],
  heavy_bridge: [
    { x:  0, z: -6, w: 8, h: 0.3, type: 'wall' },
    { x: -4, z: -3, r: 0.65 }, { x: 4, z: -3, r: 0.65 },
    { x:  0, z:  0, w: 6, h: 0.3, type: 'wall' },
    { x: -3, z:  3, r: 0.70 }, { x: 3, z:  3, r: 0.70 },
    { x:  0, z:  5, w: 7, h: 0.3, type: 'wall' },
    { x: -2, z: -1, r: 0.60 }, { x: 2, z:  1, r: 0.60 },
  ],
  heavy_urban: [
    { x: -4, z: -4, r: 0.70 }, { x: 4, z: -4, r: 0.70 },
    { x: -4, z:  4, r: 0.70 }, { x: 4, z:  4, r: 0.70 },
    { x:  0, z:  0, r: 0.75 },
    { x:  0, z: -5, w: 5, h: 0.3, type: 'wall' },
    { x:  0, z:  5, w: 5, h: 0.3, type: 'wall' },
    { x: -5, z:  0, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  0, w: 0.3, h: 5, type: 'wall' },
  ],
  heavy_salvage: [
    { x: -3, z: -6, r: 0.70 }, { x: 3, z: -6, r: 0.70 },
    { x: -6, z: -2, r: 0.65 }, { x: 6, z: -2, r: 0.65 },
    { x:  0, z:  0, r: 0.75 },
    { x: -4, z:  3, r: 0.68 }, { x: 4, z:  3, r: 0.68 },
    { x:  0, z:  6, r: 0.70 },
    { x:  0, z: -4, w: 5, h: 0.3, type: 'wall' },
    { x: -3, z:  1, w: 0.3, h: 4, type: 'wall' },
    { x:  3, z:  5, w: 5, h: 0.3, type: 'wall' },
  ],
  heavy_demolition: [
    { x: -5, z: -5, r: 0.75 }, { x: 5, z: -5, r: 0.75 },
    { x:  0, z: -3, r: 0.70 },
    { x: -6, z:  0, r: 0.70 }, { x: 6, z:  0, r: 0.70 },
    { x: -3, z:  3, r: 0.72 }, { x: 3, z:  3, r: 0.72 },
    { x:  0, z:  5, r: 0.75 },
    { x:  0, z: -6, w: 7, h: 0.3, type: 'wall' },
    { x: -4, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  4, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  3, w: 6, h: 0.3, type: 'wall' },
  ],
  heavy_disaster: [
    { x: -4, z: -6, r: 0.75 }, { x: 4, z: -6, r: 0.75 },
    { x:  0, z: -4, r: 0.70 },
    { x: -6, z: -1, r: 0.72 }, { x: 6, z: -1, r: 0.72 },
    { x:  0, z:  1, r: 0.75 },
    { x: -3, z:  4, r: 0.70 }, { x: 3, z:  4, r: 0.70 },
    { x:  0, z: -7, w: 8, h: 0.3, type: 'wall' },
    { x: -5, z: -3, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  2, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 7, h: 0.3, type: 'wall' },
  ],
  heavy_deep_mine: [
    { x:  0, z: -7, w: 8, h: 0.3, type: 'wall' },
    { x: -4, z: -5, w: 0.3, h: 3, type: 'wall' },
    { x:  4, z: -4, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z: -2, w: 6, h: 0.3, type: 'wall' },
    { x: -4, z:  0, w: 0.3, h: 3, type: 'wall' },
    { x:  4, z:  2, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z:  4, w: 7, h: 0.3, type: 'wall' },
    { x: -3, z: -6, r: 0.72 }, { x: 3, z: -6, r: 0.72 },
    { x: -2, z:  0, r: 0.68 }, { x: 2, z:  0, r: 0.68 },
    { x:  0, z:  6, r: 0.70 },
  ],
  heavy_world_build: [
    { x: -5, z: -5, r: 0.75 }, { x: 5, z: -5, r: 0.75 },
    { x: -5, z:  5, r: 0.75 }, { x: 5, z:  5, r: 0.75 },
    { x:  0, z:  0, r: 0.80 },
    { x: -3, z: -2, r: 0.65 }, { x: 3, z: -2, r: 0.65 },
    { x: -3, z:  2, r: 0.65 }, { x: 3, z:  2, r: 0.65 },
    { x:  0, z: -6, w: 8, h: 0.3, type: 'wall' },
    { x:  0, z:  6, w: 8, h: 0.3, type: 'wall' },
    { x: -6, z:  0, w: 0.3, h: 8, type: 'wall' },
    { x:  6, z:  0, w: 0.3, h: 8, type: 'wall' },
  ],
  heavy_boss: [
    { x: -4, z: -4, r: 0.80 }, { x: 4, z: -4, r: 0.80 },
    { x:  0, z: -2, r: 0.75 },
    { x: -6, z:  0, r: 0.80 }, { x: 6, z:  0, r: 0.80 },
    { x: -3, z:  3, r: 0.75 }, { x: 3, z:  3, r: 0.75 },
    { x:  0, z:  5, r: 0.80 },
    { x:  0, z: -6, w: 9, h: 0.3, type: 'wall' },
    { x: -5, z: -2, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 8, h: 0.3, type: 'wall' },
  ],

  // ── HEAVY TIER 4 ──────────────────────────────────────────────────────────
  heavy_infinite: [
    { x: -5, z: -6, r: 0.80 }, { x: 5, z: -6, r: 0.80 },
    { x:  0, z: -4, r: 0.75 },
    { x: -6, z: -1, r: 0.78 }, { x: 6, z: -1, r: 0.78 },
    { x:  0, z:  1, r: 0.80 },
    { x: -4, z:  4, r: 0.75 }, { x: 4, z:  4, r: 0.75 },
    { x:  0, z:  6, r: 0.78 },
    { x:  0, z: -7, w: 9, h: 0.3, type: 'wall' },
    { x: -5, z: -3, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  0, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  3, w: 9, h: 0.3, type: 'wall' },
    { x: -3, z:  5, w: 0.3, h: 4, type: 'wall' },
  ],
  heavy_legendary: [
    { x: -6, z: -6, r: 0.80 }, { x: 6, z: -6, r: 0.80 },
    { x: -6, z:  6, r: 0.80 }, { x: 6, z:  6, r: 0.80 },
    { x:  0, z:  0, r: 0.85 },
    { x: -3, z: -3, r: 0.75 }, { x: 3, z: -3, r: 0.75 },
    { x: -3, z:  3, r: 0.75 }, { x: 3, z:  3, r: 0.75 },
    { x:  0, z: -6, w: 9, h: 0.3, type: 'wall' },
    { x:  0, z:  6, w: 9, h: 0.3, type: 'wall' },
    { x: -6, z:  0, w: 0.3, h: 9, type: 'wall' },
    { x:  6, z:  0, w: 0.3, h: 9, type: 'wall' },
    { x:  0, z: -3, w: 5, h: 0.3, type: 'wall' },
    { x:  0, z:  3, w: 5, h: 0.3, type: 'wall' },
  ],
  heavy_ultimate: [
    { x: -5, z: -7, r: 0.85 }, { x: 5, z: -7, r: 0.85 },
    { x:  0, z: -5, r: 0.80 },
    { x: -7, z: -2, r: 0.82 }, { x: 7, z: -2, r: 0.82 },
    { x:  0, z:  0, r: 0.85 },
    { x: -5, z:  3, r: 0.80 }, { x: 5, z:  3, r: 0.80 },
    { x:  0, z:  6, r: 0.82 },
    { x:  0, z: -8, w: 10, h: 0.3, type: 'wall' },
    { x: -6, z: -4, w: 0.3, h: 5, type: 'wall' },
    { x:  6, z:  0, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 9, h: 0.3, type: 'wall' },
    { x: -4, z:  5, w: 0.3, h: 4, type: 'wall' },
    { x:  4, z: -6, w: 0.3, h: 4, type: 'wall' },
  ],

  // ── NINJA DRONE TIER 1 ────────────────────────────────────────────────────
  ninja_training: [
    { x: -2, z: -5, r: 0.40 }, { x: 2, z: -5, r: 0.40 },
    { x:  0, z: -3, r: 0.38, type: 'ring', y: 3.5 },
    { x: -3, z: -1, r: 0.42 }, { x: 3, z: -1, r: 0.42 },
    { x:  0, z:  2, r: 0.38, type: 'ring', y: 4.5 },
    { x: -2, z:  4, r: 0.40 }, { x: 2, z:  4, r: 0.40 },
  ],
  ninja_stealth: [
    { x: -3, z: -6, r: 0.42 }, { x: 3, z: -6, r: 0.42 },
    { x:  0, z: -4, w: 4, h: 0.3, type: 'wall' },
    { x: -4, z: -1, r: 0.45 }, { x: 4, z: -1, r: 0.45 },
    { x:  0, z:  1, w: 5, h: 0.3, type: 'wall' },
    { x: -2, z:  4, r: 0.42 }, { x: 2, z:  4, r: 0.42 },
    { x:  0, z: -3, r: 0.40, type: 'ring', y: 4.0 },
  ],
  ninja_target: [
    { x: -1, z: -6, r: 0.38, type: 'ring', y: 3.5 },
    { x:  2, z: -4, r: 0.40 }, { x: -2, z: -4, r: 0.40 },
    { x:  0, z: -2, r: 0.36, type: 'ring', y: 5.0 },
    { x: -3, z:  0, r: 0.42 }, { x: 3, z:  0, r: 0.42 },
    { x:  0, z:  2, r: 0.36, type: 'ring', y: 4.0 },
    { x: -2, z:  4, r: 0.40 }, { x: 2, z:  4, r: 0.40 },
  ],
  ninja_infiltrate: [
    { x:  0, z: -6, w: 6, h: 0.3, type: 'wall' },
    { x: -3, z: -3, w: 0.3, h: 4, type: 'wall' },
    { x:  3, z: -1, w: 0.3, h: 4, type: 'wall' },
    { x:  0, z:  2, w: 5, h: 0.3, type: 'wall' },
    { x: -2, z:  5, w: 0.3, h: 3, type: 'wall' },
    { x: -1, z: -4, r: 0.38, type: 'ring', y: 3.5 },
    { x:  1, z:  0, r: 0.38, type: 'ring', y: 4.5 },
  ],
  ninja_escape: [
    { x: -2, z: -7, r: 0.45 }, { x: 2, z: -7, r: 0.45 },
    { x:  0, z: -5, w: 3, h: 0.3, type: 'wall' },
    { x: -3, z: -2, r: 0.42 }, { x: 3, z: -2, r: 0.42 },
    { x:  0, z:  0, w: 4, h: 0.3, type: 'wall' },
    { x: -2, z:  3, r: 0.45 }, { x: 2, z:  3, r: 0.45 },
    { x:  0, z:  5, w: 3, h: 0.3, type: 'wall' },
    { x:  0, z: -3, r: 0.38, type: 'ring', y: 4.0 },
    { x:  0, z:  2, r: 0.38, type: 'ring', y: 5.0 },
  ],

  // ── NINJA DRONE TIER 2 ────────────────────────────────────────────────────
  ninja_city_strike: [
    { x: -3, z: -5, r: 0.48 }, { x: 3, z: -5, r: 0.48 },
    { x:  0, z: -3, r: 0.45, type: 'ring', y: 4.5 },
    { x: -5, z:  0, r: 0.50 }, { x: 5, z:  0, r: 0.50 },
    { x:  0, z:  2, r: 0.43, type: 'ring', y: 6.0 },
    { x: -3, z:  4, r: 0.48 }, { x: 3, z:  4, r: 0.48 },
    { x:  0, z: -4, w: 4, h: 0.3, type: 'wall' },
    { x: -4, z:  1, w: 0.3, h: 4, type: 'wall' },
  ],
  ninja_heat_scan: [
    { x: -4, z: -4, r: 0.50 }, { x: 4, z: -4, r: 0.50 },
    { x:  0, z: -2, r: 0.45, type: 'ring', y: 5.0 },
    { x: -5, z:  0, r: 0.52 }, { x: 5, z:  0, r: 0.52 },
    { x:  0, z:  2, r: 0.43, type: 'ring', y: 7.0 },
    { x: -2, z:  4, r: 0.50 }, { x: 2, z:  4, r: 0.50 },
    { x:  0, z: -5, w: 5, h: 0.3, type: 'wall' },
    { x:  3, z:  1, w: 0.3, h: 4, type: 'wall' },
  ],
  ninja_laser_maze: [
    { x:  0, z: -6, w: 6, h: 0.3, type: 'wall' },
    { x: -3, z: -4, w: 0.3, h: 3, type: 'wall' },
    { x:  3, z: -2, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z:  0, w: 5, h: 0.3, type: 'wall' },
    { x: -3, z:  2, w: 0.3, h: 3, type: 'wall' },
    { x:  3, z:  4, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z:  5, w: 6, h: 0.3, type: 'wall' },
    { x: -1, z: -3, r: 0.42, type: 'ring', y: 4.5 },
    { x:  1, z:  1, r: 0.40, type: 'ring', y: 6.5 },
  ],
  ninja_night_ops: [
    { x: -3, z: -6, r: 0.50 }, { x: 3, z: -6, r: 0.50 },
    { x:  0, z: -4, r: 0.48, type: 'ring', y: 5.5 },
    { x: -5, z: -1, r: 0.52 }, { x: 5, z: -1, r: 0.52 },
    { x:  0, z:  1, r: 0.45, type: 'ring', y: 7.5 },
    { x: -3, z:  4, r: 0.50 }, { x: 3, z:  4, r: 0.50 },
    { x:  0, z: -5, w: 5, h: 0.3, type: 'wall' },
    { x: -4, z:  2, w: 0.3, h: 4, type: 'wall' },
    { x:  4, z:  2, w: 0.3, h: 4, type: 'wall' },
  ],
  ninja_assassin: [
    { x: -4, z: -5, r: 0.52 }, { x: 4, z: -5, r: 0.52 },
    { x:  0, z: -3, r: 0.48, type: 'ring', y: 5.0 },
    { x: -6, z:  0, r: 0.55 }, { x: 6, z:  0, r: 0.55 },
    { x:  0, z:  2, r: 0.45, type: 'ring', y: 7.0 },
    { x: -3, z:  5, r: 0.52 }, { x: 3, z:  5, r: 0.52 },
    { x:  0, z: -6, w: 6, h: 0.3, type: 'wall' },
    { x: -4, z: -2, w: 0.3, h: 5, type: 'wall' },
    { x:  4, z:  3, w: 0.3, h: 5, type: 'wall' },
  ],

  // ── NINJA DRONE TIER 3 ────────────────────────────────────────────────────
  ninja_fortress: [
    { x: -4, z: -4, r: 0.58 }, { x: 4, z: -4, r: 0.58 },
    { x: -4, z:  4, r: 0.58 }, { x: 4, z:  4, r: 0.58 },
    { x:  0, z:  0, r: 0.62 },
    { x:  0, z: -5, w: 5, h: 0.3, type: 'wall' },
    { x:  0, z:  5, w: 5, h: 0.3, type: 'wall' },
    { x: -5, z:  0, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  0, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z: -2, r: 0.45, type: 'ring', y: 5.5 },
    { x:  0, z:  2, r: 0.43, type: 'ring', y: 7.5 },
  ],
  ninja_dogfight: [
    { x: -3, z: -6, r: 0.52, type: 'ring', y: 5.0 },
    { x:  3, z: -4, r: 0.50, type: 'ring', y: 7.5 },
    { x: -4, z: -2, r: 0.50, type: 'ring', y: 4.5 },
    { x:  4, z:  0, r: 0.48, type: 'ring', y: 8.0 },
    { x: -2, z:  2, r: 0.48, type: 'ring', y: 5.5 },
    { x:  2, z:  4, r: 0.45, type: 'ring', y: 7.0 },
    { x:  0, z:  6, r: 0.45, type: 'ring', y: 4.5 },
    { x: -5, z: -5, r: 0.55 }, { x: 5, z: -3, r: 0.55 },
    { x:  0, z:  1, r: 0.52 }, { x: -3, z:  3, r: 0.50 },
  ],
  ninja_base_raid: [
    { x:  0, z: -7, w: 8, h: 0.3, type: 'wall' },
    { x: -4, z: -5, w: 0.3, h: 3, type: 'wall' },
    { x:  4, z: -4, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z: -2, w: 6, h: 0.3, type: 'wall' },
    { x: -4, z:  0, w: 0.3, h: 3, type: 'wall' },
    { x:  4, z:  2, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z:  4, w: 7, h: 0.3, type: 'wall' },
    { x: -2, z: -5, r: 0.50, type: 'ring', y: 5.0 },
    { x:  2, z:  0, r: 0.48, type: 'ring', y: 7.0 },
    { x: -2, z:  3, r: 0.45, type: 'ring', y: 5.5 },
  ],
  ninja_shadow_war: [
    { x: -4, z: -5, r: 0.58 }, { x: 4, z: -5, r: 0.58 },
    { x:  0, z: -3, r: 0.55, type: 'ring', y: 6.0 },
    { x: -6, z:  0, r: 0.60 }, { x: 6, z:  0, r: 0.60 },
    { x:  0, z:  2, r: 0.52, type: 'ring', y: 8.0 },
    { x: -3, z:  5, r: 0.58 }, { x: 3, z:  5, r: 0.58 },
    { x:  0, z: -6, w: 7, h: 0.3, type: 'wall' },
    { x: -4, z: -2, w: 0.3, h: 5, type: 'wall' },
    { x:  4, z:  3, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  3, w: 6, h: 0.3, type: 'wall' },
  ],
  ninja_elite_ops: [
    { x: -3, z: -6, r: 0.55, type: 'ring', y: 5.5 },
    { x:  4, z: -4, r: 0.52, type: 'ring', y: 8.0 },
    { x: -5, z: -2, r: 0.52, type: 'ring', y: 4.5 },
    { x:  3, z:  0, r: 0.50, type: 'ring', y: 7.0 },
    { x: -4, z:  2, r: 0.50, type: 'ring', y: 5.5 },
    { x:  5, z:  4, r: 0.48, type: 'ring', y: 9.0 },
    { x: -2, z:  6, r: 0.48, type: 'ring', y: 6.5 },
    { x: -5, z: -5, r: 0.60 }, { x: 5, z: -3, r: 0.60 },
    { x:  0, z:  1, r: 0.58 }, { x: -3, z:  4, r: 0.55 },
    { x:  3, z:  6, r: 0.55 },
  ],

  // ── NINJA DRONE TIER 4 ────────────────────────────────────────────────────
  ninja_black_site: [
    { x:  0, z: -7, w: 8, h: 0.3, type: 'wall' },
    { x: -4, z: -5, w: 0.3, h: 3, type: 'wall' },
    { x:  4, z: -3, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z: -1, w: 6, h: 0.3, type: 'wall' },
    { x: -4, z:  1, w: 0.3, h: 3, type: 'wall' },
    { x:  4, z:  3, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z:  5, w: 8, h: 0.3, type: 'wall' },
    { x: -3, z: -6, r: 0.55, type: 'ring', y: 5.0 },
    { x:  3, z: -2, r: 0.52, type: 'ring', y: 7.5 },
    { x: -2, z:  2, r: 0.50, type: 'ring', y: 5.5 },
    { x:  2, z:  4, r: 0.48, type: 'ring', y: 8.5 },
  ],
  ninja_super_stealth: [
    { x: -5, z: -5, r: 0.60 }, { x: 5, z: -5, r: 0.60 },
    { x:  0, z: -3, r: 0.55, type: 'ring', y: 6.5 },
    { x: -6, z:  0, r: 0.62 }, { x: 6, z:  0, r: 0.62 },
    { x:  0, z:  2, r: 0.52, type: 'ring', y: 8.5 },
    { x: -4, z:  5, r: 0.60 }, { x: 4, z:  5, r: 0.60 },
    { x:  0, z: -6, w: 8, h: 0.3, type: 'wall' },
    { x: -5, z: -2, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  2, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  3, w: 7, h: 0.3, type: 'wall' },
    { x: -3, z:  7, w: 0.3, h: 3, type: 'wall' },
  ],
  ninja_infinite_war: [
    { x: -4, z: -6, r: 0.60, type: 'ring', y: 5.5 },
    { x:  5, z: -4, r: 0.58, type: 'ring', y: 8.0 },
    { x: -5, z: -2, r: 0.58, type: 'ring', y: 4.5 },
    { x:  4, z:  0, r: 0.55, type: 'ring', y: 9.0 },
    { x: -3, z:  2, r: 0.55, type: 'ring', y: 6.0 },
    { x:  5, z:  4, r: 0.52, type: 'ring', y: 7.5 },
    { x: -4, z:  6, r: 0.52, type: 'ring', y: 5.0 },
    { x: -6, z: -5, r: 0.65 }, { x: 6, z: -3, r: 0.65 },
    { x:  0, z:  0, r: 0.62 }, { x: -3, z:  4, r: 0.60 },
    { x:  3, z:  6, r: 0.58 }, { x:  0, z: -4, r: 0.62 },
  ],
  ninja_legendary: [
    { x:  0, z: -8, r: 0.58, type: 'ring', y: 6.0 },
    { x: -4, z: -6, r: 0.55, type: 'ring', y: 4.5 },
    { x:  5, z: -4, r: 0.55, type: 'ring', y: 9.0 },
    { x: -5, z: -2, r: 0.52, type: 'ring', y: 5.5 },
    { x:  4, z:  0, r: 0.52, type: 'ring', y: 8.0 },
    { x: -3, z:  2, r: 0.50, type: 'ring', y: 6.5 },
    { x:  5, z:  4, r: 0.50, type: 'ring', y: 4.5 },
    { x: -4, z:  6, r: 0.48, type: 'ring', y: 7.5 },
    { x:  0, z:  8, r: 0.48, type: 'ring', y: 5.5 },
    { x: -6, z: -7, r: 0.68 }, { x: 6, z: -5, r: 0.68 },
    { x:  0, z: -2, r: 0.65 }, { x: -4, z:  3, r: 0.62 },
    { x:  4, z:  5, r: 0.62 }, { x:  0, z:  7, r: 0.60 },
  ],
  ninja_ultimate: [
    { x: -3, z: -8, r: 0.55, type: 'ring', y: 5.5 },
    { x:  5, z: -6, r: 0.52, type: 'ring', y: 8.5 },
    { x: -5, z: -4, r: 0.52, type: 'ring', y: 4.5 },
    { x:  4, z: -2, r: 0.50, type: 'ring', y: 9.5 },
    { x: -4, z:  0, r: 0.50, type: 'ring', y: 6.0 },
    { x:  5, z:  2, r: 0.48, type: 'ring', y: 8.0 },
    { x: -3, z:  4, r: 0.48, type: 'ring', y: 5.5 },
    { x:  4, z:  6, r: 0.45, type: 'ring', y: 7.5 },
    { x:  0, z:  8, r: 0.45, type: 'ring', y: 4.5 },
    { x: -6, z: -7, r: 0.70 }, { x: 6, z: -5, r: 0.70 },
    { x:  0, z: -3, r: 0.68 }, { x: -5, z:  1, r: 0.65 },
    { x:  5, z:  3, r: 0.65 }, { x:  0, z:  5, r: 0.62 },
    { x: -3, z:  7, r: 0.62 }, { x:  3, z:  7, r: 0.60 },
  ],

  // ── HUMANOID TIER 1 ───────────────────────────────────────────────────────
  human_basics: [
    { x: -3, z: -4, r: 0.45 }, { x: 3, z: -4, r: 0.45 },
    { x:  0, z: -2, r: 0.40 },
    { x: -2, z:  1, r: 0.45 }, { x: 2, z:  1, r: 0.45 },
    { x:  0, z:  4, r: 0.40 },
  ],
  human_combat_intro: [
    { x: -3, z: -5, r: 0.50 }, { x: 3, z: -5, r: 0.50 },
    { x:  0, z: -3, w: 4, h: 0.3, type: 'wall' },
    { x: -4, z:  0, r: 0.48 }, { x: 4, z:  0, r: 0.48 },
    { x:  0, z:  2, w: 5, h: 0.3, type: 'wall' },
    { x: -2, z:  5, r: 0.50 }, { x: 2, z:  5, r: 0.50 },
  ],
  human_platform: [
    { x: -2, z: -6, r: 0.45 }, { x: 2, z: -6, r: 0.45 },
    { x:  0, z: -4, w: 3, h: 0.3, type: 'wall' },
    { x: -3, z: -1, r: 0.48 }, { x: 3, z: -1, r: 0.48 },
    { x:  0, z:  2, w: 4, h: 0.3, type: 'wall' },
    { x: -2, z:  5, r: 0.45 }, { x: 2, z:  5, r: 0.45 },
    { x:  0, z:  3, r: 0.40 },
  ],
  human_shield: [
    { x: -4, z: -4, r: 0.52 }, { x: 4, z: -4, r: 0.52 },
    { x:  0, z: -2, r: 0.48 },
    { x: -5, z:  1, r: 0.50 }, { x: 5, z:  1, r: 0.50 },
    { x: -2, z:  4, r: 0.52 }, { x: 2, z:  4, r: 0.52 },
    { x:  0, z: -5, w: 5, h: 0.3, type: 'wall' },
    { x:  0, z:  2, w: 5, h: 0.3, type: 'wall' },
  ],
  human_first_boss: [
    { x: -4, z: -4, r: 0.55 }, { x: 4, z: -4, r: 0.55 },
    { x:  0, z: -2, r: 0.60 },
    { x: -5, z:  0, r: 0.55 }, { x: 5, z:  0, r: 0.55 },
    { x:  0, z:  3, r: 0.65 },
    { x: -3, z:  5, r: 0.55 }, { x: 3, z:  5, r: 0.55 },
    { x:  0, z: -5, w: 5, h: 0.3, type: 'wall' },
    { x: -3, z:  1, w: 0.3, h: 4, type: 'wall' },
  ],

  // ── HUMANOID TIER 2 ───────────────────────────────────────────────────────
  human_arena: [
    { x: -4, z: -4, r: 0.60 }, { x: 4, z: -4, r: 0.60 },
    { x: -4, z:  4, r: 0.60 }, { x: 4, z:  4, r: 0.60 },
    { x:  0, z:  0, r: 0.65 },
    { x:  0, z: -5, w: 5, h: 0.3, type: 'wall' },
    { x:  0, z:  5, w: 5, h: 0.3, type: 'wall' },
    { x: -5, z:  0, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  0, w: 0.3, h: 5, type: 'wall' },
  ],
  human_jungle: [
    { x: -2, z: -6, r: 0.55 }, { x: 2, z: -6, r: 0.55 },
    { x: -5, z: -3, r: 0.52 }, { x: 5, z: -3, r: 0.52 },
    { x:  0, z: -1, r: 0.58 },
    { x: -3, z:  2, r: 0.52 }, { x: 3, z:  2, r: 0.52 },
    { x: -6, z:  5, r: 0.55 }, { x: 6, z:  5, r: 0.55 },
    { x:  0, z:  7, r: 0.50 },
  ],
  human_city: [
    { x: -4, z: -5, r: 0.60 }, { x: 4, z: -5, r: 0.60 },
    { x: -4, z:  5, r: 0.60 }, { x: 4, z:  5, r: 0.60 },
    { x:  0, z:  0, r: 0.65 },
    { x:  0, z: -6, w: 6, h: 0.3, type: 'wall' },
    { x:  0, z:  6, w: 6, h: 0.3, type: 'wall' },
    { x: -5, z: -2, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  2, w: 0.3, h: 5, type: 'wall' },
    { x: -2, z:  0, r: 0.55 }, { x: 2, z:  0, r: 0.55 },
  ],
  human_dodge: [
    { x: -3, z: -5, r: 0.55 }, { x: 3, z: -5, r: 0.55 },
    { x:  0, z: -3, r: 0.58 },
    { x: -5, z:  0, r: 0.55 }, { x: 5, z:  0, r: 0.55 },
    { x: -2, z:  3, r: 0.58 }, { x: 2, z:  3, r: 0.58 },
    { x:  0, z:  5, r: 0.55 },
    { x:  0, z: -6, w: 5, h: 0.3, type: 'wall' },
    { x: -3, z:  1, w: 0.3, h: 4, type: 'wall' },
    { x:  3, z:  4, w: 5, h: 0.3, type: 'wall' },
  ],
  human_weapons: [
    { x: -4, z: -4, r: 0.62 }, { x: 4, z: -4, r: 0.62 },
    { x:  0, z: -2, r: 0.58 },
    { x: -6, z:  0, r: 0.62 }, { x: 6, z:  0, r: 0.62 },
    { x: -2, z:  3, r: 0.60 }, { x: 2, z:  3, r: 0.60 },
    { x:  0, z:  5, r: 0.62 },
    { x:  0, z: -5, w: 6, h: 0.3, type: 'wall' },
    { x: -4, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  4, z:  4, w: 6, h: 0.3, type: 'wall' },
  ],

  // ── HUMANOID TIER 3 ───────────────────────────────────────────────────────
  human_tournament: [
    { x: -5, z: -5, r: 0.65 }, { x: 5, z: -5, r: 0.65 },
    { x: -5, z:  5, r: 0.65 }, { x: 5, z:  5, r: 0.65 },
    { x:  0, z:  0, r: 0.70 },
    { x: -2, z: -2, r: 0.58 }, { x: 2, z: -2, r: 0.58 },
    { x: -2, z:  2, r: 0.58 }, { x: 2, z:  2, r: 0.58 },
    { x:  0, z: -6, w: 6, h: 0.3, type: 'wall' },
    { x:  0, z:  6, w: 6, h: 0.3, type: 'wall' },
    { x: -6, z:  0, w: 0.3, h: 6, type: 'wall' },
    { x:  6, z:  0, w: 0.3, h: 6, type: 'wall' },
  ],
  human_army: [
    { x: -3, z: -6, r: 0.65 }, { x: 3, z: -6, r: 0.65 },
    { x: -6, z: -2, r: 0.68 }, { x: 6, z: -2, r: 0.68 },
    { x:  0, z:  0, r: 0.72 },
    { x: -4, z:  3, r: 0.65 }, { x: 4, z:  3, r: 0.65 },
    { x:  0, z:  6, r: 0.68 },
    { x:  0, z: -7, w: 8, h: 0.3, type: 'wall' },
    { x: -5, z: -4, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 7, h: 0.3, type: 'wall' },
  ],
  human_ruins: [
    { x:  0, z: -7, w: 8, h: 0.3, type: 'wall' },
    { x: -4, z: -5, w: 0.3, h: 3, type: 'wall' },
    { x:  4, z: -4, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z: -2, w: 6, h: 0.3, type: 'wall' },
    { x: -4, z:  0, w: 0.3, h: 3, type: 'wall' },
    { x:  4, z:  2, w: 0.3, h: 3, type: 'wall' },
    { x:  0, z:  4, w: 7, h: 0.3, type: 'wall' },
    { x: -3, z: -6, r: 0.65 }, { x: 3, z: -6, r: 0.65 },
    { x: -2, z:  0, r: 0.62 }, { x: 2, z:  0, r: 0.62 },
    { x:  0, z:  6, r: 0.65 },
  ],
  human_elemental: [
    { x: -4, z: -5, r: 0.68 }, { x: 4, z: -5, r: 0.68 },
    { x:  0, z: -3, r: 0.65 },
    { x: -6, z:  0, r: 0.70 }, { x: 6, z:  0, r: 0.70 },
    { x: -2, z:  3, r: 0.65 }, { x: 2, z:  3, r: 0.65 },
    { x:  0, z:  6, r: 0.68 },
    { x:  0, z: -6, w: 7, h: 0.3, type: 'wall' },
    { x: -4, z: -1, w: 0.3, h: 5, type: 'wall' },
    { x:  4, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 6, h: 0.3, type: 'wall' },
  ],
  human_shadow: [
    { x: -5, z: -5, r: 0.68 }, { x: 5, z: -5, r: 0.68 },
    { x:  0, z: -3, r: 0.65, },
    { x: -6, z:  0, r: 0.70 }, { x: 6, z:  0, r: 0.70 },
    { x: -3, z:  3, r: 0.68 }, { x: 3, z:  3, r: 0.68 },
    { x:  0, z:  5, r: 0.70 },
    { x:  0, z: -7, w: 9, h: 0.3, type: 'wall' },
    { x: -5, z: -2, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  2, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 8, h: 0.3, type: 'wall' },
    { x: -3, z:  7, w: 0.3, h: 4, type: 'wall' },
  ],

  // ── HUMANOID TIER 4 ───────────────────────────────────────────────────────
  human_championship: [
    { x: -5, z: -5, r: 0.72 }, { x: 5, z: -5, r: 0.72 },
    { x: -5, z:  5, r: 0.72 }, { x: 5, z:  5, r: 0.72 },
    { x:  0, z:  0, r: 0.78 },
    { x: -2, z: -2, r: 0.65 }, { x: 2, z: -2, r: 0.65 },
    { x: -2, z:  2, r: 0.65 }, { x: 2, z:  2, r: 0.65 },
    { x:  0, z: -6, w: 9, h: 0.3, type: 'wall' },
    { x:  0, z:  6, w: 9, h: 0.3, type: 'wall' },
    { x: -6, z:  0, w: 0.3, h: 9, type: 'wall' },
    { x:  6, z:  0, w: 0.3, h: 9, type: 'wall' },
    { x:  0, z: -3, w: 5, h: 0.3, type: 'wall' },
    { x:  0, z:  3, w: 5, h: 0.3, type: 'wall' },
  ],
  human_warrior: [
    { x: -4, z: -6, r: 0.75 }, { x: 4, z: -6, r: 0.75 },
    { x:  0, z: -4, r: 0.72 },
    { x: -6, z: -1, r: 0.75 }, { x: 6, z: -1, r: 0.75 },
    { x:  0, z:  1, r: 0.78 },
    { x: -4, z:  4, r: 0.72 }, { x: 4, z:  4, r: 0.72 },
    { x:  0, z:  6, r: 0.75 },
    { x:  0, z: -7, w: 9, h: 0.3, type: 'wall' },
    { x: -5, z: -3, w: 0.3, h: 5, type: 'wall' },
    { x:  5, z:  2, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  3, w: 8, h: 0.3, type: 'wall' },
    { x: -3, z:  5, w: 0.3, h: 4, type: 'wall' },
  ],
  human_infinite: [
    { x: -5, z: -6, r: 0.75 }, { x: 5, z: -6, r: 0.75 },
    { x:  0, z: -4, r: 0.72 },
    { x: -7, z: -1, r: 0.78 }, { x: 7, z: -1, r: 0.78 },
    { x:  0, z:  1, r: 0.80 },
    { x: -5, z:  4, r: 0.75 }, { x: 5, z:  4, r: 0.75 },
    { x:  0, z:  6, r: 0.78 },
    { x:  0, z: -7, w: 10, h: 0.3, type: 'wall' },
    { x: -6, z: -3, w: 0.3, h: 5, type: 'wall' },
    { x:  6, z:  0, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  3, w: 9, h: 0.3, type: 'wall' },
    { x: -4, z:  5, w: 0.3, h: 4, type: 'wall' },
    { x:  4, z: -5, w: 0.3, h: 4, type: 'wall' },
  ],
  human_legend: [
    { x: -5, z: -7, r: 0.78 }, { x: 5, z: -7, r: 0.78 },
    { x:  0, z: -5, r: 0.75 },
    { x: -7, z: -2, r: 0.80 }, { x: 7, z: -2, r: 0.80 },
    { x:  0, z:  0, r: 0.82 },
    { x: -5, z:  3, r: 0.78 }, { x: 5, z:  3, r: 0.78 },
    { x:  0, z:  6, r: 0.80 },
    { x:  0, z: -8, w: 10, h: 0.3, type: 'wall' },
    { x: -6, z: -4, w: 0.3, h: 5, type: 'wall' },
    { x:  6, z:  1, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 9, h: 0.3, type: 'wall' },
    { x: -4, z:  5, w: 0.3, h: 4, type: 'wall' },
    { x:  4, z: -6, w: 0.3, h: 4, type: 'wall' },
    { x:  0, z: -3, w: 6, h: 0.3, type: 'wall' },
  ],
  human_ultimate: [
    { x: -5, z: -7, r: 0.82 }, { x: 5, z: -7, r: 0.82 },
    { x:  0, z: -5, r: 0.80 },
    { x: -7, z: -2, r: 0.82 }, { x: 7, z: -2, r: 0.82 },
    { x:  0, z:  0, r: 0.85 },
    { x: -5, z:  3, r: 0.80 }, { x: 5, z:  3, r: 0.80 },
    { x:  0, z:  6, r: 0.82 },
    { x: -7, z:  7, r: 0.78 }, { x: 7, z:  7, r: 0.78 },
    { x:  0, z: -8, w: 11, h: 0.3, type: 'wall' },
    { x: -6, z: -4, w: 0.3, h: 5, type: 'wall' },
    { x:  6, z:  0, w: 0.3, h: 5, type: 'wall' },
    { x:  0, z:  2, w: 10, h: 0.3, type: 'wall' },
    { x: -5, z:  5, w: 0.3, h: 4, type: 'wall' },
    { x:  5, z: -6, w: 0.3, h: 4, type: 'wall' },
    { x:  0, z: -4, w: 7, h: 0.3, type: 'wall' },
  ],
};

// ── Dynamic obstacle store ─────────────────────────────────────────────────
// Animated environments (dodge balls, pursuers, etc.) register live positions
// here each frame so the path-sampler can check them before each robot move.
const _dynObsMap = new Map();
export function setDynamicObstacles(arenaId, obstacles) { _dynObsMap.set(arenaId, obstacles); }
export function getDynamicObstacles(arenaId) { return _dynObsMap.get(arenaId) || []; }
export function clearDynamicObstacles(arenaId) { _dynObsMap.delete(arenaId); }

// ── Robot position tracker ─────────────────────────────────────────────────
// Updated each frame by TestArenaScene so pursuer AI can target the robot.
export const robotPosTracker = { x: 0, z: 0 };

/** Return obstacles scaled to the chosen difficulty level. */
export function getObstaclesForArena(arenaId, difficulty = 'easy') {
  if (difficulty === 'medium') {
    return ARENA_OBSTACLES[`${arenaId}_medium`] || ARENA_OBSTACLES[arenaId] || ARENA_OBSTACLES.obstacles;
  }
  if (difficulty === 'hard') {
    return ARENA_OBSTACLES[`${arenaId}_hard`] || ARENA_OBSTACLES[`${arenaId}_medium`] || ARENA_OBSTACLES[arenaId] || ARENA_OBSTACLES.obstacles;
  }
  return ARENA_OBSTACLES[arenaId] || ARENA_OBSTACLES.obstacles;
}

/** Scoring config per difficulty */
export const DIFF_CONFIG = {
  easy:   { label: '🟢 Easy',   timePenalty: 0.15, objBonus: 15, mult: 1.0, timeLimit: 90,  color: '#22c55e' },
  medium: { label: '🟡 Medium', timePenalty: 0.30, objBonus: 15, mult: 1.5, timeLimit: 150, color: '#f59e0b' },
  hard:   { label: '🔴 Hard',   timePenalty: 0.55, objBonus: 15, mult: 2.0, timeLimit: 240, color: '#ef4444' },
};

export function computeArenaScore(elapsed, cleared, difficulty = 'easy') {
  const cfg = DIFF_CONFIG[difficulty] || DIFF_CONFIG.easy;
  const base = 100 - elapsed * cfg.timePenalty + cleared * cfg.objBonus;
  return Math.max(0, Math.round(Math.max(0, base) * cfg.mult));
}

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
  // Check dynamic obstacles (moving balls, pursuers, swarm drones, etc.)
  const dynObs = _dynObsMap.get(arenaId) || [];
  for (const o of dynObs) {
    if (o.r && Math.hypot(x - o.x, z - o.z) < o.r + radius) {
      return { hit: true, obstacle: { ...o, dynamic: true } };
    }
    if (o.type === 'wall' && pointInWall(x, z, o)) {
      return { hit: true, obstacle: { ...o, dynamic: true } };
    }
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
