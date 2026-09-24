/**
 * TrackGroundSnap.js — Snap props/heroes to road mesh so nothing floats above void.
 */
import { raycastRoadSurfaceY } from '../RacingRaceLogic.js';

/** Raycast road deck Y at world XZ (falls back to spline Y). */
export function snapPropToRoad(scene, x, z, splineY = 0) {
  if (!scene || x == null || z == null) return splineY ?? 0;
  return raycastRoadSurfaceY(scene, x, z, splineY ?? 0);
}

/** Place object on road surface with optional vertical offset. */
export function snapObjectToRoad(scene, obj, x, z, splineY, yOffset = 0) {
  const y = snapPropToRoad(scene, x, z, splineY) + yOffset;
  if (obj?.position) obj.position.y = y;
  return y;
}

/** After road mesh exists, re-snap scattered props that were placed too early. */
export function resnapMarkedProps(scene, root) {
  if (!scene?.userData?.raceRoadMesh || !root) return;
  root.traverse((obj) => {
    if (!obj.userData?.groundSnap) return;
    const p = obj.position;
    if (Number.isFinite(p.x) && Number.isFinite(p.z)) {
      const offset = obj.userData.groundSnapOffset ?? 0;
      p.y = snapPropToRoad(scene, p.x, p.z, p.y) + offset;
    }
  });
}
