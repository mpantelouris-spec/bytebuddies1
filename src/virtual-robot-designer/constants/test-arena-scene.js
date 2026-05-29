/**
 * Test arena — robot scale & follow camera (hero-sized robot in large viewport).
 */
import { computeWorkshopRobotScale } from './workshop-scene.js';

/** Simulator uses same robot, scaled up for visibility */
export function computeSimRobotScale(design) {
  return computeWorkshopRobotScale(design) * 1.78;
}

/** Orbit camera for test arena — wide zoom-out so kids can see the whole course */
export const ARENA_CAMERA = {
  fov: 44,
  targetY: 0.55,
  defaultDistance: 6.5,
  minDistance: 2.2,
  maxDistance: 28,
};

/** @deprecated use ARENA_CAMERA */
export const SIM_CAMERA = {
  fov: ARENA_CAMERA.fov,
  followLambda: 7.5,
  zoomLambda: 6,
  baseDistance: ARENA_CAMERA.defaultDistance,
  heightOffset: 2.2,
  sideOffset: 3.2,
  minDistance: ARENA_CAMERA.minDistance,
  maxDistance: ARENA_CAMERA.maxDistance,
};
