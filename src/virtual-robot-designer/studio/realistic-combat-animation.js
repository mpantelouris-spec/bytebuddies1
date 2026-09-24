/**
 * REALISTIC 3D COMBAT & ANIMATION ENGINE
 * Implements professional fighting game mechanics with:
 * - Hierarchical joint rigging (Root → Hips → Spine → Limbs)
 * - Biomechanical kinetic chain motion
 * - Frame-accurate combat state machine (60 FPS)
 * - Dynamic hitbox system with hitstop
 * - Camera shake & impact "juice"
 */
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: CONSTANTS & FRAME DATA
// ═══════════════════════════════════════════════════════════════════════════

export const FIGHT_FPS = 60;
export const FRAME_DT = 1 / FIGHT_FPS;

// Frame data for all attacks (60 FPS)
export const ATTACK_FRAME_DATA = {
  light_kick: {
    startupFrames: 10,
    activeFrames: 4,
    recoveryFrames: 10,
    totalFrames: 24,
    blockAdvantage: 1,
    onHitStun: 14,
    damage: 9,
    knockback: 0.3,
  },
  heavy_kick: {
    startupFrames: 16,
    activeFrames: 5,
    recoveryFrames: 15,
    totalFrames: 36,
    blockAdvantage: -6,
    onHitStun: 28,
    damage: 22,
    knockback: 0.8,
  },
  light_punch: {
    startupFrames: 3,
    activeFrames: 2,
    recoveryFrames: 7,
    totalFrames: 12,
    blockAdvantage: 2,
    onHitStun: 10,
    damage: 5,
    knockback: 0.15,
  },
  heavy_punch: {
    startupFrames: 8,
    activeFrames: 3,
    recoveryFrames: 14,
    totalFrames: 25,
    blockAdvantage: -4,
    onHitStun: 22,
    damage: 15,
    knockback: 0.5,
  },
  sweep: {
    startupFrames: 6,
    activeFrames: 4,
    recoveryFrames: 12,
    totalFrames: 22,
    blockAdvantage: -8,
    onHitStun: 40,
    damage: 12,
    knockback: 0.15,
    knockdown: true,
  },
};

// Convert frames to seconds
export function framesToSeconds(frames) {
  return frames * FRAME_DT;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: JOINT HIERARCHY & RIGGING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a hierarchical skeleton for combat animations
 * Root (y=0) → Hips → Spine → (Arms/Legs/Head)
 */
export function createCombatSkeleton() {
  const skeleton = {
    // Root anchor - locked to ring surface
    root: {
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
    },
    // Pelvis/Hips - center of mass pivot
    hips: {
      position: new THREE.Vector3(0, 0.9, 0),
      rotation: new THREE.Euler(0, 0, 0),
      basePosition: new THREE.Vector3(0, 0.9, 0),
    },
    // Spine/Torso - rotational kinetic transfer
    spine: {
      position: new THREE.Vector3(0, 1.2, 0),
      rotation: new THREE.Euler(0, 0, 0),
    },
    // Head - target for high strikes
    head: {
      position: new THREE.Vector3(0, 1.7, 0),
      rotation: new THREE.Euler(0, 0, 0),
    },
    // Left Leg Chain
    leftHipUpper: { rotation: new THREE.Euler(0, 0, 0) },
    leftKnee: { rotation: new THREE.Euler(0, 0, 0) },
    leftAnkle: { rotation: new THREE.Euler(0, 0, 0) },
    leftFoot: { position: new THREE.Vector3(-0.15, 0, 0), grounded: true },
    // Right Leg Chain
    rightHipUpper: { rotation: new THREE.Euler(0, 0, 0) },
    rightKnee: { rotation: new THREE.Euler(0, 0, 0) },
    rightAnkle: { rotation: new THREE.Euler(0, 0, 0) },
    rightFoot: { position: new THREE.Vector3(0.15, 0, 0), grounded: true },
    // Left Arm Chain
    leftShoulder: { rotation: new THREE.Euler(0, 0, 0) },
    leftElbow: { rotation: new THREE.Euler(0, 0, 0) },
    leftWrist: { rotation: new THREE.Euler(0, 0, 0) },
    leftFist: { position: new THREE.Vector3(0, 0, 0), hitboxActive: false },
    // Right Arm Chain
    rightShoulder: { rotation: new THREE.Euler(0, 0, 0) },
    rightElbow: { rotation: new THREE.Euler(0, 0, 0) },
    rightWrist: { rotation: new THREE.Euler(0, 0, 0) },
    rightFist: { position: new THREE.Vector3(0, 0, 0), hitboxActive: false },
  };
  
  return skeleton;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: KINETIC CHAIN & BIOMECHANICAL MOTION
// ═══════════════════════════════════════════════════════════════════════════

const DEG_TO_RAD = Math.PI / 180;

/**
 * Shift center of mass toward supporting foot before attack
 */
function shiftCoM(skeleton, supportingSide, amount = 0.15) {
  const supportFoot = supportingSide === 'left' ? skeleton.leftFoot : skeleton.rightFoot;
  const targetX = supportFoot.position.x + (supportingSide === 'left' ? -amount : amount);
  skeleton.hips.position.x = THREE.MathUtils.lerp(
    skeleton.hips.position.x,
    targetX,
    0.3
  );
  skeleton.hips.position.z = THREE.MathUtils.lerp(
    skeleton.hips.position.z,
    0.05,
    0.3
  );
}

/**
 * Light Kick Animation - Low/Mid Shin Snap
 * Phase 1: Chamber (0-4 frames / 0.067s)
 * Phase 2: Strike Snap (5-8 frames / 0.067s)
 * Phase 3: Active Frame Hold (9-11 frames / 0.05s)
 * Phase 4: Recovery (12-20 frames / 0.133s)
 */
export function animateLightKick(skeleton, frame, strikingSide = 'right') {
  const isRight = strikingSide === 'right';
  const hipUpper = isRight ? skeleton.rightHipUpper : skeleton.leftHipUpper;
  const knee = isRight ? skeleton.rightKnee : skeleton.leftKnee;
  const ankle = isRight ? skeleton.rightAnkle : skeleton.leftAnkle;
  const foot = isRight ? skeleton.rightFoot : skeleton.leftFoot;
  const supportFoot = isRight ? skeleton.leftFoot : skeleton.rightFoot;
  
  // Ensure supporting foot stays grounded
  supportFoot.grounded = true;
  supportFoot.position.y = 0;
  
  if (frame <= 4) {
    // Phase 1: Chamber
    const t = frame / 4;
    
    // Supporting leg pivot outward 20°
    const supportPivot = isRight ? skeleton.leftHipUpper : skeleton.rightHipUpper;
    supportPivot.rotation.y = THREE.MathUtils.lerp(0, 20 * DEG_TO_RAD * (isRight ? -1 : 1), t);
    
    // Striking hip flexes forward +45°
    hipUpper.rotation.x = THREE.MathUtils.lerp(0, 45 * DEG_TO_RAD, t);
    
    // Knee flexes backward -70° (chambered)
    knee.rotation.x = THREE.MathUtils.lerp(0, -70 * DEG_TO_RAD, t);
    
    // Torso leans back -10° for balance
    skeleton.spine.rotation.x = THREE.MathUtils.lerp(0, -10 * DEG_TO_RAD, t);
    
    // Shift CoM to supporting foot
    shiftCoM(skeleton, isRight ? 'left' : 'right', 0.15 * t);
    
    foot.grounded = false;
    foot.hitboxActive = false;
    
  } else if (frame <= 8) {
    // Phase 2: Strike Snap
    const t = (frame - 4) / 4;
    
    // Knee snaps rapidly to 0° (full extension)
    knee.rotation.x = THREE.MathUtils.lerp(-70 * DEG_TO_RAD, 0, easeOutQuad(t));
    
    // Hip rotates +25° toward target
    hipUpper.rotation.y = THREE.MathUtils.lerp(0, 25 * DEG_TO_RAD * (isRight ? 1 : -1), t);
    
    // Ankle extends +15° for shin/instep strike
    ankle.rotation.x = THREE.MathUtils.lerp(0, 15 * DEG_TO_RAD, t);
    
    foot.hitboxActive = t > 0.5;
    
  } else if (frame <= 11) {
    // Phase 3: Active Frame Hold
    knee.rotation.x = 0;
    hipUpper.rotation.y = 25 * DEG_TO_RAD * (isRight ? 1 : -1);
    ankle.rotation.x = 15 * DEG_TO_RAD;
    foot.hitboxActive = true;
    
  } else {
    // Phase 4: Recovery (Slerp back to default)
    const t = Math.min(1, (frame - 11) / 9);
    const easeT = easeInOutQuad(t);
    
    hipUpper.rotation.x = THREE.MathUtils.lerp(45 * DEG_TO_RAD, 0, easeT);
    hipUpper.rotation.y = THREE.MathUtils.lerp(25 * DEG_TO_RAD * (isRight ? 1 : -1), 0, easeT);
    knee.rotation.x = THREE.MathUtils.lerp(0, 0, easeT);
    ankle.rotation.x = THREE.MathUtils.lerp(15 * DEG_TO_RAD, 0, easeT);
    skeleton.spine.rotation.x = THREE.MathUtils.lerp(-10 * DEG_TO_RAD, 0, easeT);
    
    // Reset CoM
    skeleton.hips.position.x = THREE.MathUtils.lerp(skeleton.hips.position.x, 0, easeT);
    skeleton.hips.position.z = THREE.MathUtils.lerp(skeleton.hips.position.z, 0, easeT);
    
    foot.hitboxActive = false;
    foot.grounded = t > 0.8;
  }
}

/**
 * Heavy Roundhouse Kick - High Impact Power Kick
 * Phase 1: Deep Windup & Pivot (0-8 frames / 0.133s)
 * Phase 2: Rotational Arc (9-14 frames / 0.1s)
 * Phase 3: Impact & Active Window (15-18 frames / 0.067s)
 * Phase 4: Follow-Through & Recovery (19-32 frames / 0.233s)
 */
export function animateHeavyKick(skeleton, frame, strikingSide = 'right') {
  const isRight = strikingSide === 'right';
  const hipUpper = isRight ? skeleton.rightHipUpper : skeleton.leftHipUpper;
  const knee = isRight ? skeleton.rightKnee : skeleton.leftKnee;
  const ankle = isRight ? skeleton.rightAnkle : skeleton.leftAnkle;
  const foot = isRight ? skeleton.rightFoot : skeleton.leftFoot;
  const supportFoot = isRight ? skeleton.leftFoot : skeleton.rightFoot;
  
  supportFoot.grounded = true;
  supportFoot.position.y = 0;
  
  if (frame <= 8) {
    // Phase 1: Deep Windup & Pivot
    const t = frame / 8;
    const easeT = easeInQuad(t);
    
    // Supporting foot pivots 60° away
    const supportPivot = isRight ? skeleton.leftHipUpper : skeleton.rightHipUpper;
    supportPivot.rotation.y = THREE.MathUtils.lerp(0, 60 * DEG_TO_RAD * (isRight ? -1 : 1), easeT);
    
    // Hips rotate 45° in kick direction
    skeleton.hips.rotation.y = THREE.MathUtils.lerp(0, 45 * DEG_TO_RAD * (isRight ? 1 : -1), easeT);
    
    // Lead arm drops slightly, rear guard stays up
    const guardArm = isRight ? skeleton.leftShoulder : skeleton.rightShoulder;
    const dropArm = isRight ? skeleton.rightShoulder : skeleton.leftShoulder;
    guardArm.rotation.x = THREE.MathUtils.lerp(0, -15 * DEG_TO_RAD, easeT);
    dropArm.rotation.x = THREE.MathUtils.lerp(0, 10 * DEG_TO_RAD, easeT);
    
    // Striking leg knee flexes to -85°
    knee.rotation.x = THREE.MathUtils.lerp(0, -85 * DEG_TO_RAD, easeT);
    
    // Deep CoM shift
    shiftCoM(skeleton, isRight ? 'left' : 'right', 0.2 * easeT);
    
    foot.grounded = false;
    foot.hitboxActive = false;
    
  } else if (frame <= 14) {
    // Phase 2: Rotational Arc
    const t = (frame - 8) / 6;
    const easeT = easeOutQuad(t);
    
    // Pelvis rotates 90° through horizontal plane
    skeleton.hips.rotation.y = THREE.MathUtils.lerp(
      45 * DEG_TO_RAD * (isRight ? 1 : -1),
      90 * DEG_TO_RAD * (isRight ? 1 : -1),
      easeT
    );
    
    // Knee extends powerfully to 0°
    knee.rotation.x = THREE.MathUtils.lerp(-85 * DEG_TO_RAD, 0, easeT);
    
    // Torso counter-rotates -20° to whip power through hip
    skeleton.spine.rotation.y = THREE.MathUtils.lerp(0, -20 * DEG_TO_RAD * (isRight ? 1 : -1), easeT);
    
    // Hip upper extends out
    hipUpper.rotation.x = THREE.MathUtils.lerp(0, 30 * DEG_TO_RAD, easeT);
    hipUpper.rotation.z = THREE.MathUtils.lerp(0, 45 * DEG_TO_RAD * (isRight ? 1 : -1), easeT);
    
    foot.hitboxActive = t > 0.6;
    
  } else if (frame <= 18) {
    // Phase 3: Impact & Active Window - Maximum extension
    skeleton.hips.rotation.y = 90 * DEG_TO_RAD * (isRight ? 1 : -1);
    knee.rotation.x = 0;
    hipUpper.rotation.x = 30 * DEG_TO_RAD;
    hipUpper.rotation.z = 45 * DEG_TO_RAD * (isRight ? 1 : -1);
    foot.hitboxActive = true;
    
  } else {
    // Phase 4: Follow-Through & Recovery
    const t = Math.min(1, (frame - 18) / 14);
    const easeT = easeInOutQuad(t);
    
    // Momentum carries leg through arc
    skeleton.hips.rotation.y = THREE.MathUtils.lerp(
      90 * DEG_TO_RAD * (isRight ? 1 : -1),
      0,
      easeT
    );
    hipUpper.rotation.x = THREE.MathUtils.lerp(30 * DEG_TO_RAD, 0, easeT);
    hipUpper.rotation.z = THREE.MathUtils.lerp(45 * DEG_TO_RAD * (isRight ? 1 : -1), 0, easeT);
    knee.rotation.x = THREE.MathUtils.lerp(0, 0, easeT);
    skeleton.spine.rotation.y = THREE.MathUtils.lerp(-20 * DEG_TO_RAD * (isRight ? 1 : -1), 0, easeT);
    
    // Reset guard arm positions
    skeleton.leftShoulder.rotation.x = THREE.MathUtils.lerp(skeleton.leftShoulder.rotation.x, 0, easeT);
    skeleton.rightShoulder.rotation.x = THREE.MathUtils.lerp(skeleton.rightShoulder.rotation.x, 0, easeT);
    
    // Reset CoM
    skeleton.hips.position.x = THREE.MathUtils.lerp(skeleton.hips.position.x, 0, easeT);
    skeleton.hips.position.z = THREE.MathUtils.lerp(skeleton.hips.position.z, 0, easeT);
    
    foot.hitboxActive = false;
    foot.grounded = t > 0.7;
  }
}

/**
 * Light Punch (Jab) Animation
 */
export function animateLightPunch(skeleton, frame, punchingSide = 'left') {
  const isLeft = punchingSide === 'left';
  const shoulder = isLeft ? skeleton.leftShoulder : skeleton.rightShoulder;
  const elbow = isLeft ? skeleton.leftElbow : skeleton.rightElbow;
  const wrist = isLeft ? skeleton.leftWrist : skeleton.rightWrist;
  const fist = isLeft ? skeleton.leftFist : skeleton.rightFist;
  
  const totalFrames = 12;
  
  if (frame <= 3) {
    // Startup - pull back slightly
    const t = frame / 3;
    shoulder.rotation.x = THREE.MathUtils.lerp(0, -10 * DEG_TO_RAD, t);
    shoulder.rotation.z = THREE.MathUtils.lerp(0, 15 * DEG_TO_RAD * (isLeft ? 1 : -1), t);
    elbow.rotation.x = THREE.MathUtils.lerp(0, -30 * DEG_TO_RAD, t);
    
    // Subtle hip rotation for power transfer
    skeleton.hips.rotation.y = THREE.MathUtils.lerp(0, 10 * DEG_TO_RAD * (isLeft ? -1 : 1), t);
    
    fist.hitboxActive = false;
    
  } else if (frame <= 5) {
    // Active - extend punch
    const t = (frame - 3) / 2;
    const easeT = easeOutQuad(t);
    
    shoulder.rotation.x = THREE.MathUtils.lerp(-10 * DEG_TO_RAD, 30 * DEG_TO_RAD, easeT);
    shoulder.rotation.z = THREE.MathUtils.lerp(15 * DEG_TO_RAD * (isLeft ? 1 : -1), 0, easeT);
    elbow.rotation.x = THREE.MathUtils.lerp(-30 * DEG_TO_RAD, 0, easeT);
    
    // Snap hip forward for kinetic chain
    skeleton.hips.rotation.y = THREE.MathUtils.lerp(
      10 * DEG_TO_RAD * (isLeft ? -1 : 1),
      -15 * DEG_TO_RAD * (isLeft ? -1 : 1),
      easeT
    );
    skeleton.spine.rotation.y = THREE.MathUtils.lerp(0, -10 * DEG_TO_RAD * (isLeft ? -1 : 1), easeT);
    
    fist.hitboxActive = true;
    
  } else {
    // Recovery
    const t = Math.min(1, (frame - 5) / 7);
    const easeT = easeInOutQuad(t);
    
    shoulder.rotation.x = THREE.MathUtils.lerp(30 * DEG_TO_RAD, 0, easeT);
    elbow.rotation.x = 0;
    skeleton.hips.rotation.y = THREE.MathUtils.lerp(-15 * DEG_TO_RAD * (isLeft ? -1 : 1), 0, easeT);
    skeleton.spine.rotation.y = THREE.MathUtils.lerp(-10 * DEG_TO_RAD * (isLeft ? -1 : 1), 0, easeT);
    
    fist.hitboxActive = false;
  }
}

/**
 * Heavy Punch (Cross) Animation
 */
export function animateHeavyPunch(skeleton, frame, punchingSide = 'right') {
  const isRight = punchingSide === 'right';
  const shoulder = isRight ? skeleton.rightShoulder : skeleton.leftShoulder;
  const elbow = isRight ? skeleton.rightElbow : skeleton.leftElbow;
  const fist = isRight ? skeleton.rightFist : skeleton.leftFist;
  
  if (frame <= 8) {
    // Startup - deep windup
    const t = frame / 8;
    const easeT = easeInQuad(t);
    
    // Pull arm back
    shoulder.rotation.x = THREE.MathUtils.lerp(0, -25 * DEG_TO_RAD, easeT);
    shoulder.rotation.z = THREE.MathUtils.lerp(0, 30 * DEG_TO_RAD * (isRight ? -1 : 1), easeT);
    elbow.rotation.x = THREE.MathUtils.lerp(0, -60 * DEG_TO_RAD, easeT);
    
    // Deep hip rotation for power
    skeleton.hips.rotation.y = THREE.MathUtils.lerp(0, 35 * DEG_TO_RAD * (isRight ? 1 : -1), easeT);
    
    // Shift weight
    shiftCoM(skeleton, isRight ? 'left' : 'right', 0.12 * easeT);
    
    fist.hitboxActive = false;
    
  } else if (frame <= 11) {
    // Active - explosive extension
    const t = (frame - 8) / 3;
    const easeT = easeOutQuad(t);
    
    shoulder.rotation.x = THREE.MathUtils.lerp(-25 * DEG_TO_RAD, 45 * DEG_TO_RAD, easeT);
    shoulder.rotation.z = THREE.MathUtils.lerp(30 * DEG_TO_RAD * (isRight ? -1 : 1), 0, easeT);
    elbow.rotation.x = THREE.MathUtils.lerp(-60 * DEG_TO_RAD, 0, easeT);
    
    // Explosive hip rotation
    skeleton.hips.rotation.y = THREE.MathUtils.lerp(
      35 * DEG_TO_RAD * (isRight ? 1 : -1),
      -30 * DEG_TO_RAD * (isRight ? 1 : -1),
      easeT
    );
    skeleton.spine.rotation.y = THREE.MathUtils.lerp(0, -20 * DEG_TO_RAD * (isRight ? 1 : -1), easeT);
    
    // Step forward
    skeleton.hips.position.z = THREE.MathUtils.lerp(0, 0.15, easeT);
    
    fist.hitboxActive = t > 0.3;
    
  } else {
    // Recovery
    const t = Math.min(1, (frame - 11) / 14);
    const easeT = easeInOutQuad(t);
    
    shoulder.rotation.x = THREE.MathUtils.lerp(45 * DEG_TO_RAD, 0, easeT);
    elbow.rotation.x = 0;
    skeleton.hips.rotation.y = THREE.MathUtils.lerp(-30 * DEG_TO_RAD * (isRight ? 1 : -1), 0, easeT);
    skeleton.spine.rotation.y = THREE.MathUtils.lerp(-20 * DEG_TO_RAD * (isRight ? 1 : -1), 0, easeT);
    skeleton.hips.position.z = THREE.MathUtils.lerp(0.15, 0, easeT);
    skeleton.hips.position.x = THREE.MathUtils.lerp(skeleton.hips.position.x, 0, easeT);
    
    fist.hitboxActive = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: COMBAT STATE MACHINE (FSM)
// ═══════════════════════════════════════════════════════════════════════════

export const CombatState = {
  IDLE: 'idle',
  LIGHT_KICK: 'light_kick',
  HEAVY_KICK: 'heavy_kick',
  LIGHT_PUNCH: 'light_punch',
  HEAVY_PUNCH: 'heavy_punch',
  SWEEP: 'sweep',
  BLOCKING: 'blocking',
  HIT_STUN: 'hit_stun',
  KNOCKDOWN: 'knockdown',
  RECOVERY: 'recovery',
};

export function createCombatFSM(skeleton) {
  const fsm = {
    currentState: CombatState.IDLE,
    frame: 0,
    strikingSide: 'right',
    hitboxes: {
      leftFist: { active: false, radius: 0.08 },
      rightFist: { active: false, radius: 0.08 },
      leftFoot: { active: false, radius: 0.1 },
      rightFoot: { active: false, radius: 0.1 },
    },
    hitStopFrames: 0,
    onHit: null,
    
    transitionTo(newState, side = 'right') {
      if (this.currentState !== CombatState.IDLE && 
          this.currentState !== CombatState.RECOVERY &&
          newState !== CombatState.HIT_STUN &&
          newState !== CombatState.KNOCKDOWN) {
        return false; // Can't transition during active attack
      }
      
      this.currentState = newState;
      this.frame = 0;
      this.strikingSide = side;
      
      // Disable all hitboxes on state change
      Object.keys(this.hitboxes).forEach(key => {
        this.hitboxes[key].active = false;
      });
      
      return true;
    },
    
    tick(dt = FRAME_DT) {
      // Handle hitstop freeze
      if (this.hitStopFrames > 0) {
        this.hitStopFrames--;
        return { frozen: true, timeScale: 0 };
      }
      
      this.frame++;
      
      const frameData = ATTACK_FRAME_DATA[this.currentState];
      
      switch (this.currentState) {
        case CombatState.LIGHT_KICK:
          if (this.frame >= 24) this.currentState = CombatState.IDLE;
          break;

        case CombatState.HEAVY_KICK:
          if (this.frame >= 36) this.currentState = CombatState.IDLE;
          break;
          
        case CombatState.LIGHT_PUNCH:
          animateLightPunch(skeleton, this.frame, this.strikingSide);
          this.updatePunchHitbox(this.strikingSide);
          if (this.frame >= 12) this.currentState = CombatState.IDLE;
          break;
          
        case CombatState.HEAVY_PUNCH:
          animateHeavyPunch(skeleton, this.frame, this.strikingSide);
          this.updatePunchHitbox(this.strikingSide);
          if (this.frame >= 25) this.currentState = CombatState.IDLE;
          break;

        case CombatState.SWEEP:
          if (this.frame >= 22) this.currentState = CombatState.IDLE;
          break;
          
        case CombatState.HIT_STUN:
          // Apply hit stun animation
          animateHitStun(skeleton, this.frame);
          if (this.frame >= (frameData?.onHitStun || 14)) {
            this.currentState = CombatState.IDLE;
          }
          break;
          
        case CombatState.KNOCKDOWN:
          animateKnockdown(skeleton, this.frame);
          if (this.frame >= 40) this.currentState = CombatState.RECOVERY;
          break;
          
        case CombatState.RECOVERY:
          animateGetUp(skeleton, this.frame);
          if (this.frame >= 20) this.currentState = CombatState.IDLE;
          break;
          
        default:
          animateIdle(skeleton, this.frame);
      }
      
      return { frozen: false, timeScale: 1 };
    },
    
    updateKickHitbox(side) {
      const foot = side === 'right' ? skeleton.rightFoot : skeleton.leftFoot;
      const hitboxKey = side === 'right' ? 'rightFoot' : 'leftFoot';
      this.hitboxes[hitboxKey].active = foot.hitboxActive;
    },
    
    updatePunchHitbox(side) {
      const fist = side === 'right' ? skeleton.rightFist : skeleton.leftFist;
      const hitboxKey = side === 'right' ? 'rightFist' : 'leftFist';
      this.hitboxes[hitboxKey].active = fist.hitboxActive;
    },
    
    triggerHitStop(heavy = false) {
      // Light hits: 4 frames (66ms), Heavy hits: 8 frames (133ms)
      this.hitStopFrames = heavy ? 8 : 4;
    },
    
    getActiveHitboxes() {
      return Object.entries(this.hitboxes)
        .filter(([_, hb]) => hb.active)
        .map(([key, hb]) => ({ key, ...hb }));
    }
  };
  
  return fsm;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: HIT REACTIONS & DEFENDER ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

function animateHitStun(skeleton, frame) {
  const t = Math.min(1, frame / 14);
  
  // Head snaps back
  skeleton.head.rotation.x = Math.sin(t * Math.PI) * -15 * DEG_TO_RAD;
  
  // Torso flinches
  skeleton.spine.rotation.x = Math.sin(t * Math.PI) * -10 * DEG_TO_RAD;
  skeleton.spine.rotation.z = Math.sin(t * Math.PI * 2) * 5 * DEG_TO_RAD;
  
  // Slight step back
  skeleton.hips.position.z = -Math.sin(t * Math.PI) * 0.1;
}

function animateKnockdown(skeleton, frame) {
  const t = Math.min(1, frame / 30);
  const easeT = easeOutQuad(t);
  
  // Body falls backward
  skeleton.spine.rotation.x = THREE.MathUtils.lerp(0, -60 * DEG_TO_RAD, easeT);
  skeleton.hips.position.y = THREE.MathUtils.lerp(0.9, 0.2, easeT);
  skeleton.hips.position.z = THREE.MathUtils.lerp(0, -0.5, easeT);
  
  // Arms flail
  skeleton.leftShoulder.rotation.z = THREE.MathUtils.lerp(0, 45 * DEG_TO_RAD, easeT);
  skeleton.rightShoulder.rotation.z = THREE.MathUtils.lerp(0, -45 * DEG_TO_RAD, easeT);
  
  // Legs come up briefly
  if (t < 0.5) {
    skeleton.leftHipUpper.rotation.x = t * 30 * DEG_TO_RAD;
    skeleton.rightHipUpper.rotation.x = t * 30 * DEG_TO_RAD;
  }
}

function animateGetUp(skeleton, frame) {
  const t = Math.min(1, frame / 20);
  const easeT = easeInOutQuad(t);
  
  // Return to standing
  skeleton.spine.rotation.x = THREE.MathUtils.lerp(-60 * DEG_TO_RAD, 0, easeT);
  skeleton.hips.position.y = THREE.MathUtils.lerp(0.2, 0.9, easeT);
  skeleton.hips.position.z = THREE.MathUtils.lerp(-0.5, 0, easeT);
  
  skeleton.leftShoulder.rotation.z = THREE.MathUtils.lerp(45 * DEG_TO_RAD, 0, easeT);
  skeleton.rightShoulder.rotation.z = THREE.MathUtils.lerp(-45 * DEG_TO_RAD, 0, easeT);
  
  skeleton.leftHipUpper.rotation.x = THREE.MathUtils.lerp(30 * DEG_TO_RAD, 0, easeT);
  skeleton.rightHipUpper.rotation.x = THREE.MathUtils.lerp(30 * DEG_TO_RAD, 0, easeT);
}

function animateIdle(skeleton, frame) {
  // Subtle breathing motion
  const breathe = Math.sin(frame * 0.05) * 0.02;
  skeleton.spine.position.y = 1.2 + breathe;
  
  // Slight bob
  skeleton.hips.position.y = 0.9 + breathe * 0.5;
  
  // Boxing guard stance
  skeleton.leftShoulder.rotation.x = -10 * DEG_TO_RAD;
  skeleton.leftElbow.rotation.x = -45 * DEG_TO_RAD;
  skeleton.rightShoulder.rotation.x = -10 * DEG_TO_RAD;
  skeleton.rightElbow.rotation.x = -45 * DEG_TO_RAD;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: CAMERA ENGINE & IMPACT "JUICE"
// ═══════════════════════════════════════════════════════════════════════════

export function createCombatCamera(camera) {
  const camState = {
    basePosition: camera.position.clone(),
    baseFOV: camera.fov,
    shakeIntensity: 0,
    shakeDuration: 0,
    shakeDecay: 5,
    zoomOffset: 0,
    zoomDuration: 0,
  };
  
  return {
    /**
     * Trigger camera shake on hit
     * @param {number} magnitude - Shake strength
     * @param {number} duration - Shake duration in seconds
     */
    triggerShake(magnitude = 0.08, duration = 0.12) {
      camState.shakeIntensity = magnitude;
      camState.shakeDuration = duration;
    },
    
    /**
     * Trigger impact micro-zoom
     * @param {number} fovDelta - FOV change (negative = zoom in)
     * @param {number} duration - Zoom duration
     */
    triggerZoom(fovDelta = -3, duration = 0.1) {
      camState.zoomOffset = fovDelta;
      camState.zoomDuration = duration;
    },
    
    /**
     * Apply impact effects for hits
     */
    onImpact(heavy = false) {
      this.triggerShake(heavy ? 0.35 : 0.08, heavy ? 0.25 : 0.12);
      this.triggerZoom(heavy ? -5 : -3, heavy ? 0.15 : 0.1);
    },
    
    /**
     * Update camera each frame
     */
    tick(dt) {
      // Camera shake with decaying sine wave
      if (camState.shakeDuration > 0) {
        camState.shakeDuration -= dt;
        const time = (0.25 - camState.shakeDuration) * 60; // Scale to 60fps
        const decay = Math.exp(-camState.shakeDecay * (0.25 - camState.shakeDuration));
        
        const offsetX = Math.sin(time * 60) * camState.shakeIntensity * decay;
        const offsetY = Math.cos(time * 45) * camState.shakeIntensity * decay * 0.5;
        
        camera.position.x = camState.basePosition.x + offsetX;
        camera.position.y = camState.basePosition.y + offsetY;
        
        if (camState.shakeDuration <= 0) {
          camera.position.copy(camState.basePosition);
          camState.shakeIntensity = 0;
        }
      }
      
      // Impact micro-zoom
      if (camState.zoomDuration > 0) {
        camState.zoomDuration -= dt;
        const t = 1 - (camState.zoomDuration / 0.15);
        
        if (t < 0.3) {
          // Zoom in
          camera.fov = camState.baseFOV + camState.zoomOffset * (t / 0.3);
        } else {
          // Zoom back out
          camera.fov = camState.baseFOV + camState.zoomOffset * (1 - (t - 0.3) / 0.7);
        }
        camera.updateProjectionMatrix();
        
        if (camState.zoomDuration <= 0) {
          camera.fov = camState.baseFOV;
          camera.updateProjectionMatrix();
        }
      }
    },
    
    resetBase() {
      camState.basePosition.copy(camera.position);
      camState.baseFOV = camera.fov;
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: KNOCKBACK & DISPLACEMENT PHYSICS
// ═══════════════════════════════════════════════════════════════════════════

export function applyKnockback(targetPosition, attackerForward, knockbackAmount, isBlock = false) {
  const displacement = attackerForward.clone().multiplyScalar(knockbackAmount);
  
  if (isBlock) {
    // Both slide back on block
    displacement.multiplyScalar(0.15 / knockbackAmount); // Normalize to 0.15 units
  }
  
  targetPosition.add(displacement);
  
  return displacement;
}

export function calculateStaggerDisplacement(damage, isKick = false) {
  // Light kick: 0.25 units, Heavy kick: 0.85 units
  const baseMult = isKick ? 1.4 : 1.0;
  
  if (damage >= 15) {
    // Heavy stagger
    return 0.85 * baseMult;
  } else if (damage >= 10) {
    // Medium stagger
    return 0.4 * baseMult;
  } else {
    // Light stagger
    return 0.25 * baseMult;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: EASING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

function easeInQuad(t) {
  return t * t;
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9: BLOCK CODE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Execute combat action from block code command
 */
export function executeCombatBlock(fsm, blockCommand, context = {}) {
  switch (blockCommand) {
    case 'Light Kick':
    case 'light_kick':
      return fsm.transitionTo(CombatState.LIGHT_KICK, context.side || 'right');
      
    case 'Heavy Kick':
    case 'heavy_kick':
      return fsm.transitionTo(CombatState.HEAVY_KICK, context.side || 'right');
      
    case 'Light Punch':
    case 'light_punch':
    case 'jab':
      return fsm.transitionTo(CombatState.LIGHT_PUNCH, context.side || 'left');
      
    case 'Heavy Punch':
    case 'heavy_punch':
    case 'cross':
      return fsm.transitionTo(CombatState.HEAVY_PUNCH, context.side || 'right');
      
    case 'Sweep':
    case 'sweep':
      return fsm.transitionTo(CombatState.SWEEP, context.side || 'right');
      
    case 'Check distance':
    case 'check_distance':
      return context.distance ?? 2.0;
      
    case 'If enemy far then':
      if (context.distance > 2.5) {
        return { shouldExecuteChildren: true };
      }
      return { shouldExecuteChildren: false };
      
    case 'If enemy close then':
      if (context.distance <= 2.0) {
        return { shouldExecuteChildren: true };
      }
      return { shouldExecuteChildren: false };
      
    case 'Advance step':
    case 'advance_step':
      return { action: 'move', direction: 1, distance: 0.35 };
      
    case 'Retreat step':
    case 'retreat_step':
      return { action: 'move', direction: -1, distance: 0.35 };
      
    default:
      console.warn(`Unknown combat block command: ${blockCommand}`);
      return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  FIGHT_FPS,
  FRAME_DT,
  ATTACK_FRAME_DATA,
  framesToSeconds,
  createCombatSkeleton,
  animateLightKick,
  animateHeavyKick,
  animateLightPunch,
  animateHeavyPunch,
  CombatState,
  createCombatFSM,
  createCombatCamera,
  applyKnockback,
  calculateStaggerDisplacement,
  executeCombatBlock,
};
