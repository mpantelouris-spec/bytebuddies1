/**
 * BoxingGamePhysics — movement, range, knockback, distance checks.
 */
import { ATTACKS } from './boxingGameConstants.js';

export function distance3(a, b) {
  const dx = (a.x ?? 0) - (b.x ?? 0);
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dz * dz);
}

export function distance2D(x1, z1, x2, z2) {
  return Math.sqrt((x1 - x2) ** 2 + (z1 - z2) ** 2);
}

export function isInAttackRange(attackKey, dist) {
  const atk = ATTACKS[attackKey];
  if (!atk) return false;
  return dist <= (atk.range || 1.5) + 0.15;
}

export function getKnockbackDistance(attackKey, blocked = false) {
  const atk = ATTACKS[attackKey];
  if (!atk) return 0.1;
  const kb = atk.knockback || 0.15;
  return blocked ? kb * 0.25 : kb;
}

export function lerpPosition(current, target, dt, speed = 4) {
  const f = Math.min(1, dt * speed);
  return {
    x: current.x + (target.x - current.x) * f,
    y: current.y + (target.y - current.y) * f,
    z: current.z + (target.z - current.z) * f,
  };
}

export function applyKnockbackVelocity(vel, amount, dt, decay = 5) {
  const v = (vel || 0) + amount;
  const step = v * dt * 3.5;
  return { step, vel: v * Math.max(0, 1 - dt * decay) };
}

export function clampRingPosition(x, z, half = 2.8) {
  return {
    x: Math.max(-half, Math.min(half, x)),
    z: Math.max(-half, Math.min(half, z)),
  };
}

export function stepToward(current, targetX, stepSize) {
  const dx = targetX - current;
  if (Math.abs(dx) <= stepSize) return targetX;
  return current + Math.sign(dx) * stepSize;
}
