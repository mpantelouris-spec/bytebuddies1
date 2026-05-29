/**
 * Workshop camera framing — robot-centered orbit, smooth zoom, safe limits.
 */
import * as THREE from 'three';

const _target = new THREE.Vector3();
const _offset = new THREE.Vector3();

/** Smooth exponential damping (frame-rate independent). */
export function damp(current, target, lambda, dt) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function dampVec3(out, current, target, lambda, dt) {
  out.x = damp(current.x, target.x, lambda, dt);
  out.y = damp(current.y, target.y, lambda, dt);
  out.z = damp(current.z, target.z, lambda, dt);
  return out;
}

/**
 * Compute ideal camera frame from robot size (no raw OrbitControls defaults).
 */
export function computeRobotCameraFrame({
  displayScale = 1.6,
  placedCount = 0,
  blockCount = 0,
  buildMode = 'advanced',
} = {}) {
  const isBlocks = buildMode === 'blocks' || buildMode === 'hybrid';
  const targetY = 0.28 + displayScale * 0.16 + (isBlocks ? 0.06 : 0);
  const robotRadius =
    0.42 +
    displayScale * 0.26 +
    Math.min(0.45, placedCount * 0.032) +
    Math.min(0.35, blockCount * 0.018);

  const idealDistance = robotRadius * 3.6 + 0.85;
  const minDistance = robotRadius * 2.0 + 0.45;
  const maxDistance = Math.max(idealDistance * 3.85 + 2.8, 18);

  const azimuth = 0.38;  // more front-facing (was 0.52)
  const polar = 1.22;   // slightly lower angle, more frontal (was 1.18)
  const sinP = Math.sin(polar);
  const cosP = Math.cos(polar);

  const x = idealDistance * sinP * Math.sin(azimuth);
  const y = targetY + idealDistance * cosP * 0.72;
  const z = idealDistance * sinP * Math.cos(azimuth);

  return {
    target: [0, targetY, 0],
    position: [x, y, z],
    idealDistance,
    minDistance,
    maxDistance,
    fov: 40,
    azimuth,
    polar,
    robotRadius,
  };
}

/** Apply distance while keeping view direction (zoom toward target). */
export function setOrbitDistance(controls, camera, distance) {
  if (!controls || !camera) return;
  _target.copy(controls.target);
  _offset.copy(camera.position).sub(_target);
  const len = _offset.length();
  if (len < 1e-6) {
    _offset.set(0, 0.4, 1).normalize();
  } else {
    _offset.normalize();
  }
  const d = THREE.MathUtils.clamp(distance, controls.minDistance, controls.maxDistance);
  camera.position.copy(_target).add(_offset.multiplyScalar(d));
  controls.update();
}

/** Read current orbit distance. */
export function getOrbitDistance(controls, camera) {
  if (!controls || !camera) return 3;
  if (typeof controls.getDistance === 'function') return controls.getDistance();
  return camera.position.distanceTo(controls.target);
}

/** Smooth focus pose — default 3/4 view centered on robot. */
export function getFocusPose(frame) {
  const { target, idealDistance, azimuth, polar } = frame;
  const sinP = Math.sin(polar);
  const cosP = Math.cos(polar);
  const x = idealDistance * sinP * Math.sin(azimuth);
  const y = target[1] + idealDistance * cosP * 0.72;
  const z = idealDistance * sinP * Math.cos(azimuth);
  return {
    target: [...target],
    distance: idealDistance,
    position: [x, y, z],
  };
}
