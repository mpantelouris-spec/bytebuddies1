/**
 * Workshop 3D scene — single source for platform, scale, camera, lighting.
 */
import { migrateAssembly, countPlacedParts } from '../services/assembly-service.js';

export const PLATFORM = {
  topY: 0,
  radius: 2.35,
  thickness: 0.14,
  ringInner: 1.85,
  ringOuter: 2.28,
};

const CHASSIS_SCALE = {
  rover: 1,
  tank: 1.08,
  humanoid: 0.94,
  drone: 0.82,
  spider: 1,
  industrial: 1.1,
  racing: 1.05,
  exploration: 1,
  cube: 1,
};

/** Display scale — robot + sockets + attachments share one transform */
export function computeWorkshopRobotScale(design) {
  const asm = migrateAssembly(design);
  const base = asm.base || {};
  const chassis = base.chassisType || 'rover';
  const size = ((base.width ?? 1) + (base.height ?? 0.62) + (base.depth ?? 1)) / 3 * (base.scale ?? 1);
  const parts = countPlacedParts(asm);
  const chassisMul = CHASSIS_SCALE[chassis] ?? 1;
  const baseScale = 1.62;
  const sizeMul = 0.92 + Math.min(0.28, size * 0.14);
  const growth = Math.min(0.22, parts * 0.028);
  return baseScale * chassisMul * sizeMul + growth;
}

/** World Y for robot group origin so wheels sit on platform top */
export function computeWorkshopAnchorY(design, displayScale) {
  const asm = migrateAssembly(design);
  const slots = asm.slots || {};
  const movementType = slots.movement?.partId || design?.wheels?.type || '';
  const hoverIds = ['hover', 'jet', 'rotors', 'quad_props', 'antigrav'];
  const legIds = ['legs', 'spider_legs', 'hydraulic_legs', 'walker'];
  const isHover = hoverIds.some((id) => movementType.includes(id));
  const isLegs = legIds.some((id) => movementType.includes(id)) || design?.wheels?.type === 'legs';
  const hasMovement = !!slots.movement;

  if (asm.buildMode === 'blocks') return 0.12 + displayScale * 0.02;
  if (isHover) return 0.42 + displayScale * 0.04;
  if (isLegs) return 0.28 + displayScale * 0.03;
  if (hasMovement) return 0.22 + displayScale * 0.025;
  return 0.18 + displayScale * 0.02;
}

export function computeCameraFrame(displayScale, placedCount) {
  const targetY = 0.38 + displayScale * 0.14;
  const dist = 2.05 + displayScale * 0.22 + Math.min(0.35, placedCount * 0.04);
  return {
    position: [0, targetY + 0.35, dist],
    fov: 42,
    target: [0, targetY, 0],
    orbitMin: dist * 0.72,
    orbitMax: dist * 1.35,
  };
}
