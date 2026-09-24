/**
 * RacingPhysics.js — Speed, boost, banking, drift hooks (RC2).
 */
import * as THREE from 'three';

export const ROBOT_RACE_PROFILES = {
  wheeled: { maxSpeed: 14, accel: 22, decel: 14, turnRate: 2.2, driftEnabled: true, boostMul: 1.35 },
  tank: { maxSpeed: 10, accel: 16, decel: 18, turnRate: 1.4, driftEnabled: false, boostMul: 1.25 },
  tracks: { maxSpeed: 10, accel: 16, decel: 18, turnRate: 1.4, driftEnabled: false, boostMul: 1.25 },
  spider: { maxSpeed: 9, accel: 14, decel: 16, turnRate: 1.6, driftEnabled: false, boostMul: 1.2, canClimb: true },
  hover: { maxSpeed: 18, accel: 24, decel: 10, turnRate: 2.8, driftEnabled: true, boostMul: 1.4 },
  drone: { maxSpeed: 20, accel: 26, decel: 8, turnRate: 3.0, driftEnabled: false, boostMul: 1.45, aerial: true },
  default: { maxSpeed: 12, accel: 18, decel: 14, turnRate: 2.0, driftEnabled: true, boostMul: 1.35 },
};

export function getRaceProfile(movId) {
  if (movId === 'wheels' || movId === 'wheels6') return ROBOT_RACE_PROFILES.wheeled;
  if (movId === 'tracks') return ROBOT_RACE_PROFILES.tracks;
  if (movId === 'legs' || movId === 'walker') return ROBOT_RACE_PROFILES.spider;
  if (movId === 'hover' || movId === 'flying') return ROBOT_RACE_PROFILES.hover;
  if (movId === 'jets') return ROBOT_RACE_PROFILES.drone;
  return ROBOT_RACE_PROFILES.default;
}

/** km/h from world-units per second. */
export function speedToKmh(unitsPerSec) {
  return unitsPerSec * 3.6;
}

export function computeSpeedKmh(lastX, lastZ, x, z, dt) {
  if (dt <= 0.001) return 0;
  return speedToKmh(Math.hypot(x - lastX, z - lastZ) / dt);
}

/** Apply boost pad — sets rs._raceSpeedMul and timer. */
export function activateBoost(rs, profile, duration = 0.8) {
  rs.raceBoostActive = true;
  rs._raceSpeedMul = profile?.boostMul ?? 1.35;
  rs._boostTimer = duration;
}

export function updateBoostTimer(rs, dt) {
  if (!rs._boostTimer || rs._boostTimer <= 0) {
    rs.raceBoostActive = false;
    rs._raceSpeedMul = 1;
    return;
  }
  rs._boostTimer -= dt;
  if (rs._boostTimer <= 0) {
    rs.raceBoostActive = false;
    rs._raceSpeedMul = 1;
  }
}

/** Power-up: shield — banks a "save" that cancels the next fall-off-track failure. */
export function activateShield(rs) {
  rs.raceShieldCount = (rs.raceShieldCount || 0) + 1;
}

/** Power-up: magnet — temporarily widens checkpoint gate radius so gates are easier to hit. */
export function activateMagnet(rs, duration = 6) {
  rs._magnetTimer = duration;
  rs.raceMagnetActive = true;
}

export function updateMagnetTimer(rs, dt) {
  if (!rs._magnetTimer || rs._magnetTimer <= 0) {
    rs.raceMagnetActive = false;
    return;
  }
  rs._magnetTimer -= dt;
  if (rs._magnetTimer <= 0) rs.raceMagnetActive = false;
}

/** Power-up: star — pure collectible, counted toward medal/mission targets. */
export function collectStar(rs) {
  rs.raceStarsCollected = (rs.raceStarsCollected || 0) + 1;
}

export function recordPowerup(rs, type) {
  rs.racePowerups = { ...(rs.racePowerups || { speed: 0, shield: 0, magnet: 0, star: 0 }) };
  rs.racePowerups[type] = (rs.racePowerups[type] || 0) + 1;
}

/** Drift detection — returns true when drift should activate. */
export function shouldDrift(rs, profile, turnDeltaRad) {
  if (!profile?.driftEnabled) return false;
  const speed = rs._raceSpeedEstimate ?? 0;
  return speed > (profile.maxSpeed * 0.6) && Math.abs(turnDeltaRad) > 0.78;
}

/** Smooth bank tilt for robot mesh (radians around Z). */
export function computeBankAngle(curve, t, maxBank = 0.35) {
  const eps = 0.008;
  const tan0 = curve.getTangentAt((t - eps + 1) % 1);
  const tan1 = curve.getTangentAt((t + eps) % 1);
  const cross = tan0.x * tan1.z - tan0.z * tan1.x;
  return Math.max(-maxBank, Math.min(maxBank, cross * 8));
}

export function applyRobotBank(robot, bankAngle, dt) {
  if (!robot) return;
  const target = bankAngle;
  robot.rotation.z += (target - robot.rotation.z) * Math.min(1, dt * 6);
}
