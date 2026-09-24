/**
 * Bridges the biomechanical skeleton / FSM to the visible fighter mesh rig.
 * Drives joint rotations on the 3D robot per the combat animation spec.
 */
import {
  createCombatSkeleton,
  createCombatFSM,
  CombatState,
  ATTACK_FRAME_DATA,
} from './realistic-combat-animation.js';
import {
  computeKickRigPose,
  applyKickPoseToRig,
  isKickState,
  kickFrameTotal,
} from './kick-rig-animation.js';

/** Map block-code / engine action ids → FSM combat states */
export const ACTION_TO_FSM = {
  low_kick: CombatState.LIGHT_KICK,
  light_kick: CombatState.LIGHT_KICK,
  kick: CombatState.LIGHT_KICK,
  short_kick: CombatState.LIGHT_KICK,
  kick_low: CombatState.LIGHT_KICK,
  high_kick: CombatState.HEAVY_KICK,
  roundhouse: CombatState.HEAVY_KICK,
  heavy_kick: CombatState.HEAVY_KICK,
  jab: CombatState.LIGHT_PUNCH,
  light_punch: CombatState.LIGHT_PUNCH,
  high_punch: CombatState.LIGHT_PUNCH,
  low_punch: CombatState.LIGHT_PUNCH,
  cross: CombatState.HEAVY_PUNCH,
  heavy_punch: CombatState.HEAVY_PUNCH,
  hook: CombatState.HEAVY_PUNCH,
  sweep: CombatState.SWEEP,
  sweep_kick: CombatState.SWEEP,
};

export function mapActionToFSM(actionId) {
  if (!actionId) return null;
  const key = String(actionId).toLowerCase();
  if (ACTION_TO_FSM[key]) return ACTION_TO_FSM[key];
  if (key.includes('heavy') && key.includes('kick')) return CombatState.HEAVY_KICK;
  if (key.includes('kick') || key.includes('sweep')) return CombatState.LIGHT_KICK;
  if (key.includes('jab') || key.includes('light') && key.includes('punch')) return CombatState.LIGHT_PUNCH;
  if (key.includes('cross') || key.includes('hook') || key.includes('heavy')) return CombatState.HEAVY_PUNCH;
  return null;
}

export function defaultStrikeSide(actionId) {
  const key = String(actionId || '').toLowerCase();
  if (['jab', 'light_punch', 'high_punch', 'low_punch', 'hook'].includes(key)) return 'left';
  return 'right';
}

export function getFighterRig(mesh) {
  const core = mesh?.userData?.fighterCore || mesh;
  return core?.userData?.rig || mesh?.userData?.rig || null;
}

function resolveFighterApi(mesh) {
  const core = mesh?.userData?.fighterCore || mesh;
  return {
    core,
    rig: getFighterRig(mesh),
    setSkeletonDriven: (on) => core?.userData?.setSkeletonDriven?.(on),
    setTimeScale: (scale) => core?.userData?.setTimeScale?.(scale),
  };
}
/**
 * Apply abstract skeleton joint data onto the visible Three.js rig.
 */
export function applySkeletonToRig(skeleton, rig, guardX = -1.15) {
  if (!skeleton || !rig) return;

  const { torsoGrp, headGrp, armGrps, legGrps } = rig;

  torsoGrp.rotation.x = skeleton.spine.rotation.x;
  torsoGrp.rotation.y = (skeleton.spine.rotation.y || 0) + (skeleton.hips.rotation.y || 0);
  torsoGrp.rotation.z = skeleton.spine.rotation.z || 0;
  torsoGrp.position.x = skeleton.hips.position.x || 0;
  torsoGrp.position.z = skeleton.hips.position.z || 0;

  headGrp.rotation.x = skeleton.head.rotation.x;
  headGrp.rotation.y = skeleton.head.rotation.y || 0;
  headGrp.rotation.z = skeleton.head.rotation.z || 0;

  const leftLeg = legGrps.find((l) => l.li === 0);
  const rightLeg = legGrps.find((l) => l.li === 1);

  const applyLeg = (leg, hipData, kneeData, ankleData) => {
    if (!leg) return;
    const hip = leg.hipGrp || leg.legGrp;
    if (hip) {
      hip.rotation.order = 'YXZ';
      hip.rotation.set(hipData.rotation.x, hipData.rotation.y, hipData.rotation.z || 0);
    }
    if (leg.shinGrp) leg.shinGrp.rotation.set(kneeData.rotation.x, 0, 0);
    if (leg.ankleGrp) leg.ankleGrp.rotation.set(ankleData.rotation.x, 0, 0);
  };

  applyLeg(leftLeg, skeleton.leftHipUpper, skeleton.leftKnee, skeleton.leftAnkle);
  applyLeg(rightLeg, skeleton.rightHipUpper, skeleton.rightKnee, skeleton.rightAnkle);

  armGrps.forEach(({ grp, forearmGrp, si }) => {
    const shoulder = si === 0 ? skeleton.leftShoulder : skeleton.rightShoulder;
    const elbow = si === 0 ? skeleton.leftElbow : skeleton.rightElbow;
    const lead = si === 0 ? -0.12 : 0.06;
    grp.rotation.x = guardX + lead + (shoulder.rotation.x || 0);
    grp.rotation.y = shoulder.rotation.y || 0;
    grp.rotation.z = (si === 0 ? 0.15 : -0.15) + (shoulder.rotation.z || 0);
    if (forearmGrp) forearmGrp.rotation.x = -1.05 + (elbow.rotation.x || 0);
  });
}

export function resetRigPose(rig) {
  if (!rig?.torsoGrp) return;
  rig.torsoGrp.position.set(0, 0, 0);
  rig.torsoGrp.rotation.set(0, 0, 0);
}

/**
 * Per-fighter controller: FSM + skeleton → mesh rig each frame.
 */
export function createFighterCombatController(mesh, options = {}) {
  const skeleton = createCombatSkeleton();
  const fsm = createCombatFSM(skeleton);
  const guardX = options.guardX ?? -1.15;
  const api = resolveFighterApi(mesh);
  const rig = api.rig;

  return {
    skeleton,
    fsm,
    tick(dt) {
      const result = fsm.tick(dt);
      const kicking = isKickState(fsm.currentState);
      const active = fsm.currentState !== CombatState.IDLE;
      api.setSkeletonDriven(active);

      if (kicking) {
        const pose = computeKickRigPose(fsm.currentState, fsm.frame, fsm.strikingSide);
        applyKickPoseToRig(pose, rig, guardX, api.core);
        const footKey = fsm.strikingSide === 'right' ? 'rightFoot' : 'leftFoot';
        if (fsm.hitboxes[footKey]) fsm.hitboxes[footKey].active = !!pose.hitboxActive;
      } else if (active) {
        applySkeletonToRig(skeleton, rig, guardX);
      }
      return result;
    },
    tryAttack(actionId, side) {
      const state = mapActionToFSM(actionId);
      if (!state) return false;
      const strikeSide = side || defaultStrikeSide(actionId);
      const ok = fsm.transitionTo(state, strikeSide);
      if (ok) api.setSkeletonDriven(true);
      return ok;
    },
    playHitStun() {
      fsm.transitionTo(CombatState.HIT_STUN);
      api.setSkeletonDriven(true);
    },
    playKnockdown() {
      fsm.transitionTo(CombatState.KNOCKDOWN);
      api.setSkeletonDriven(true);
    },
    reset() {
      fsm.currentState = CombatState.IDLE;
      fsm.frame = 0;
      fsm.hitStopFrames = 0;
      resetRigPose(rig);
      api.setSkeletonDriven(false);
    },
    getActiveHitboxes() {
      return fsm.getActiveHitboxes();
    },
    isBusy() {
      return fsm.currentState !== CombatState.IDLE && fsm.currentState !== CombatState.RECOVERY;
    },
    getAnimDuration(actionId) {
      const state = mapActionToFSM(actionId);
      if (!state) return 0.4;
      if (isKickState(state)) return kickFrameTotal(state) / 60;
      const data = ATTACK_FRAME_DATA[state];
      return data ? data.totalFrames / 60 : 0.4;
    },
  };
}
