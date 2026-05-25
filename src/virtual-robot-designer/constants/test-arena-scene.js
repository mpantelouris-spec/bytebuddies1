/**
 * Test arena — robot scale & follow camera (hero-sized robot in large viewport).
 */
import { computeWorkshopRobotScale } from './workshop-scene.js';

/** Simulator uses same robot, scaled up for visibility */
export function computeSimRobotScale(design) {
  return computeWorkshopRobotScale(design) * 1.38;
}

export const SIM_CAMERA = {
  fov: 44,
  followLambda: 6.5,
  zoomLambda: 5,
  baseDistance: 5.2,
  heightOffset: 2.8,
  sideOffset: 4.2,
  minDistance: 3.2,
  maxDistance: 12,
};
