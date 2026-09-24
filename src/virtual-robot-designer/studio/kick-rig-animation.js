/**
 * Grounded kick animation — rig-native joint poses.
 * Root stays at floor level; only hips/legs/torso twist — no whole-body backward tilt or float.
 */
import { CombatState } from './realistic-combat-animation.js';

const DEG = Math.PI / 180;
const KNEE_STAND = -0.14;
const GUARD_HIP_L = 0.22;
const GUARD_HIP_R = -0.14;
const ELBOW_GUARD = -1.05;

export const KICK_FRAME_TOTALS = {
  light_kick: 24,
  heavy_kick: 36,
  sweep: 22,
};

const easePow2Out = (t) => 1 - (1 - t) * (1 - t);
const easeInQuad = (t) => t * t;
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const lerp = (a, b, t) => a + (b - a) * t;

function phaseT(frame, start, end) {
  return clamp01((frame - start) / Math.max(1, end - start));
}

/**
 * Build a rig pose for the current kick frame.
 * Strike/support legs are explicit so left OR right kicks map correctly.
 */
export function computeKickRigPose(kickType, frame, strikingSide = 'right') {
  const isRight = strikingSide === 'right';
  const sign = isRight ? 1 : -1;
  const total = KICK_FRAME_TOTALS[kickType] || KICK_FRAME_TOTALS.light_kick;
  const f = Math.min(Math.max(0, frame), total);

  const pose = {
    strikingSide,
    hitboxActive: false,
    strikeHipX: isRight ? GUARD_HIP_R : GUARD_HIP_L,
    strikeHipY: 0,
    strikeHipZ: 0,
    strikeKnee: KNEE_STAND,
    strikeAnkle: 0,
    supportHipX: isRight ? GUARD_HIP_L : GUARD_HIP_R,
    supportHipY: 0,
    supportKnee: KNEE_STAND,
    supportAnkle: 0,
    torsoX: 0,
    torsoY: 0,
    torsoZ: 0,
    headX: 0,
    headY: 0,
    comX: 0,
    comZ: 0,
    leadArmX: 0,
    rearArmX: 0,
    leadArmZ: isRight ? 0.12 : -0.12,
    rearArmZ: isRight ? -0.12 : 0.12,
  };

  if (kickType === CombatState.HEAVY_KICK || kickType === 'heavy_kick') {
    sampleHeavyKick(pose, f, sign, isRight);
  } else {
    sampleLightKick(pose, f, sign, isRight);
  }

  return pose;
}

/** Light kick — chamber 5f, snap 5f, active 4f, retract+recover 10f */
function sampleLightKick(pose, f, sign, isRight) {
  const strikeGuard = isRight ? GUARD_HIP_R : GUARD_HIP_L;
  const supportGuard = isRight ? GUARD_HIP_L : GUARD_HIP_R;

  if (f <= 5) {
    const t = easeInOutQuad(phaseT(f, 0, 5));
    pose.supportHipY = lerp(0, 15 * DEG * -sign, t);
    pose.strikeHipX = lerp(strikeGuard, 0.38 * sign, t);
    pose.strikeKnee = lerp(KNEE_STAND, -1.02, t);
    pose.strikeAnkle = lerp(0, -0.08, t);
    pose.supportKnee = lerp(KNEE_STAND, -0.28, t);
    pose.torsoY = lerp(0, 0.18 * sign, t);
    pose.torsoX = lerp(0, 0.03, t);
    pose.headX = lerp(0, -0.04, t);
    pose.comX = lerp(0, -0.04 * sign, t);
    pose.comZ = lerp(0, -0.02, t);
    pose.rearArmX = lerp(0, -0.12, t);
  } else if (f <= 10) {
    const t = easePow2Out(phaseT(f, 5, 10));
    pose.supportHipY = 15 * DEG * -sign;
    pose.strikeHipX = lerp(0.38 * sign, -0.92 * sign, t);
    pose.strikeHipY = lerp(0, 0.22 * sign, t);
    pose.strikeKnee = lerp(-1.02, 0.14, t);
    pose.strikeAnkle = lerp(-0.08, 0.14, t);
    pose.supportKnee = -0.30;
    pose.torsoY = lerp(0.18 * sign, 0.24 * sign, t);
    pose.torsoX = lerp(0.03, -0.02, t);
    pose.headX = lerp(-0.04, 0.05, t);
    pose.comX = lerp(-0.04 * sign, 0.03 * sign, t);
    pose.comZ = lerp(-0.02, 0.08, t);
    pose.rearArmX = lerp(-0.12, -0.30, t);
    pose.hitboxActive = t > 0.35;
  } else if (f <= 14) {
    pose.supportHipY = 15 * DEG * -sign;
    pose.strikeHipX = -0.92 * sign;
    pose.strikeHipY = 0.22 * sign;
    pose.strikeKnee = 0.14;
    pose.strikeAnkle = 0.14;
    pose.supportKnee = -0.30;
    pose.torsoY = 0.24 * sign;
    pose.torsoX = -0.02;
    pose.headX = 0.05;
    pose.comX = 0.03 * sign;
    pose.comZ = 0.08;
    pose.rearArmX = -0.30;
    pose.hitboxActive = true;
  } else if (f <= 18) {
    const t = easeInQuad(phaseT(f, 14, 18));
    pose.strikeHipX = lerp(-0.92 * sign, 0.2 * sign, t);
    pose.strikeKnee = lerp(0.14, -0.75, t);
    pose.strikeAnkle = lerp(0.14, -0.04, t);
    pose.strikeHipY = lerp(0.22 * sign, 0.06 * sign, t);
    pose.torsoY = lerp(0.24 * sign, 0.10 * sign, t);
    pose.comZ = lerp(0.08, 0.03, t);
    pose.rearArmX = lerp(-0.30, -0.14, t);
    pose.hitboxActive = false;
  } else {
    const t = easeInOutQuad(phaseT(f, 18, 24));
    pose.strikeHipX = lerp(0.2 * sign, strikeGuard, t);
    pose.strikeKnee = lerp(-0.75, KNEE_STAND, t);
    pose.strikeAnkle = lerp(-0.04, 0, t);
    pose.strikeHipY = lerp(0.06 * sign, 0, t);
    pose.supportHipY = lerp(15 * DEG * -sign, 0, t);
    pose.supportKnee = lerp(-0.30, KNEE_STAND, t);
    pose.torsoY = lerp(0.10 * sign, 0, t);
    pose.torsoX = lerp(-0.02, 0, t);
    pose.headX = lerp(0.05, 0, t);
    pose.comX = lerp(0.03 * sign, 0, t);
    pose.comZ = lerp(0.03, 0, t);
    pose.rearArmX = lerp(-0.14, 0, t);
  }
}

/** Heavy roundhouse — windup 9f, arc 7f, impact 5f, follow-through 15f */
function sampleHeavyKick(pose, f, sign, isRight) {
  const strikeGuard = isRight ? GUARD_HIP_R : GUARD_HIP_L;

  if (f <= 9) {
    const t = easeInOutQuad(phaseT(f, 0, 9));
    pose.supportHipY = lerp(0, 45 * DEG * -sign, t);
    pose.strikeHipX = lerp(strikeGuard, 0.12 * sign, t);
    pose.strikeKnee = lerp(KNEE_STAND, -1.22, t);
    pose.strikeAnkle = lerp(0, -0.10, t);
    pose.supportKnee = lerp(KNEE_STAND, -0.34, t);
    pose.torsoY = lerp(0, 0.40 * sign, t);
    pose.torsoX = lerp(0, 0.04, t);
    pose.headX = lerp(0, -0.03, t);
    pose.comX = lerp(0, -0.05 * sign, t);
    pose.comZ = lerp(0, -0.03, t);
    pose.leadArmX = lerp(0, 0.14, t);
    pose.rearArmX = lerp(0, -0.18, t);
  } else if (f <= 16) {
    const t = easePow2Out(phaseT(f, 9, 16));
    pose.supportHipY = 45 * DEG * -sign;
    pose.strikeHipX = lerp(0.12 * sign, -1.18 * sign, t);
    pose.strikeHipY = lerp(0, 0.55 * sign, t);
    pose.strikeHipZ = lerp(0, 0.04 * sign, t);
    pose.strikeKnee = lerp(-1.22, 0.20, t);
    pose.strikeAnkle = lerp(-0.10, 0.18, t);
    pose.supportKnee = -0.36;
    pose.torsoY = lerp(0.40 * sign, 0.62 * sign, t);
    pose.torsoZ = lerp(0, -0.12 * sign, t);
    pose.torsoX = lerp(0.04, -0.03, t);
    pose.headX = lerp(-0.03, 0.06, t);
    pose.headY = lerp(0, -0.08 * sign, t);
    pose.comX = lerp(-0.05 * sign, 0.04 * sign, t);
    pose.comZ = lerp(-0.03, 0.12, t);
    pose.leadArmX = lerp(0.14, 0.06, t);
    pose.rearArmX = lerp(-0.18, -0.38, t);
    pose.hitboxActive = t > 0.5;
  } else if (f <= 21) {
    pose.supportHipY = 45 * DEG * -sign;
    pose.strikeHipX = -1.18 * sign;
    pose.strikeHipY = 0.55 * sign;
    pose.strikeHipZ = 0.04 * sign;
    pose.strikeKnee = 0.20;
    pose.strikeAnkle = 0.18;
    pose.supportKnee = -0.36;
    pose.torsoY = 0.62 * sign;
    pose.torsoZ = -0.12 * sign;
    pose.torsoX = -0.03;
    pose.headX = 0.06;
    pose.headY = -0.08 * sign;
    pose.comX = 0.04 * sign;
    pose.comZ = 0.12;
    pose.rearArmX = -0.38;
    pose.hitboxActive = true;
  } else {
    const t = easeInOutQuad(phaseT(f, 21, 36));
    pose.strikeHipX = lerp(-1.18 * sign, strikeGuard, t);
    pose.strikeHipY = lerp(0.55 * sign, 0, t);
    pose.strikeHipZ = lerp(0.04 * sign, 0, t);
    pose.strikeKnee = lerp(0.20, KNEE_STAND, t);
    pose.strikeAnkle = lerp(0.18, 0, t);
    pose.supportHipY = lerp(45 * DEG * -sign, 0, t);
    pose.supportKnee = lerp(-0.36, KNEE_STAND, t);
    pose.torsoY = lerp(0.62 * sign, 0, t);
    pose.torsoZ = lerp(-0.12 * sign, 0, t);
    pose.torsoX = lerp(-0.03, 0, t);
    pose.headX = lerp(0.06, 0, t);
    pose.headY = lerp(-0.08 * sign, 0, t);
    pose.comX = lerp(0.04 * sign, 0, t);
    pose.comZ = lerp(0.12, 0, t);
    pose.leadArmX = lerp(0.06, 0, t);
    pose.rearArmX = lerp(-0.38, 0, t);
  }
}

/**
 * Apply a grounded kick pose onto the visible fighter rig.
 * Root Y is never modified — feet stay on the ring.
 */
export function applyKickPoseToRig(pose, rig, guardX = -1.15, rootMesh = null) {
  if (!pose || !rig) return;

  const { torsoGrp, headGrp, armGrps, legGrps } = rig;
  const left = legGrps.find((l) => l.li === 0);
  const right = legGrps.find((l) => l.li === 1);
  const strike = pose.strikingSide === 'right' ? right : left;
  const support = pose.strikingSide === 'right' ? left : right;

  const setLeg = (leg, hipX, hipY, hipZ, knee, ankle) => {
    if (!leg) return;
    const hip = leg.hipGrp || leg.legGrp;
    if (hip) {
      hip.rotation.order = 'YXZ';
      hip.rotation.set(hipX, hipY || 0, hipZ || 0);
    }
    if (leg.shinGrp) leg.shinGrp.rotation.set(knee, 0, 0);
    if (leg.ankleGrp) leg.ankleGrp.rotation.set(ankle || 0, 0, 0);
  };

  setLeg(strike, pose.strikeHipX, pose.strikeHipY, pose.strikeHipZ, pose.strikeKnee, pose.strikeAnkle);
  setLeg(support, pose.supportHipX, pose.supportHipY, 0, pose.supportKnee, pose.supportAnkle);

  torsoGrp.rotation.x = pose.torsoX;
  torsoGrp.rotation.y = pose.torsoY;
  torsoGrp.rotation.z = pose.torsoZ;
  torsoGrp.position.x = pose.comX;
  torsoGrp.position.z = pose.comZ;
  torsoGrp.position.y = 0;

  headGrp.rotation.x = pose.headX;
  headGrp.rotation.y = pose.headY;
  headGrp.rotation.z = 0;

  armGrps.forEach(({ grp, forearmGrp, si }) => {
    const isLeftArm = si === 0;
    const isLeadArm = (pose.strikingSide === 'right' && isLeftArm) || (pose.strikingSide === 'left' && !isLeftArm);
    const lead = si === 0 ? -0.12 : 0.06;
    const armOff = isLeadArm ? pose.leadArmX : pose.rearArmX;
    grp.rotation.x = guardX + lead + (armOff || 0);
    grp.rotation.z = isLeadArm ? (pose.leadArmZ ?? 0.12) : (pose.rearArmZ ?? -0.12);
    if (forearmGrp) forearmGrp.rotation.x = ELBOW_GUARD + (armOff || 0) * 0.2;
  });

  if (rootMesh) {
    rootMesh.position.y = rootMesh.userData._groundY ?? rootMesh.position.y;
  }
}

export function isKickState(state) {
  return state === CombatState.LIGHT_KICK
    || state === CombatState.HEAVY_KICK
    || state === CombatState.SWEEP;
}

export function kickFrameTotal(state) {
  if (state === CombatState.HEAVY_KICK) return KICK_FRAME_TOTALS.heavy_kick;
  if (state === CombatState.SWEEP) return KICK_FRAME_TOTALS.sweep;
  return KICK_FRAME_TOTALS.light_kick;
}
