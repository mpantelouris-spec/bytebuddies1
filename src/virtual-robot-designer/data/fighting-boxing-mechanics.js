/**
 * Mortal Kombat 11 style fighting mechanics — fast, aggressive, hit-confirm combos.
 * 60 FPS frame data, high damage, dramatic knockback, hold-back block.
 * 
 * MASTER SYSTEM SPECIFICATION: REALISTIC 3D COMBAT & ANIMATION ENGINE
 * Implements precise frame data and biomechanical motion.
 */

export const FIGHT_FPS = 60;
export const FRAME_DT = 1 / FIGHT_FPS;
export const MK_MAX_COMBO = 7;

export const DISTANCE = {
  CLINCH: 0.5,
  OPTIMAL_MIN: 1.0,
  OPTIMAL_MAX: 2.0,
  MID_MAX: 3.0,
  FAR: 4.5,
  STEP: 0.35,
  MOVE_SPEED: 4,
  BACK_DASH: 1.5,
  // Combat range for blocking/attacking
  ATTACK_RANGE_THRESHOLD: 2.5,
};

/** MK combo scaling — less harsh than SF (4th hit still 70%) */
export const COMBO_DAMAGE_SCALE = [1.0, 0.8, 0.8, 0.7, 0.5, 0.5, 0.5];

export function getComboDamageScale(hitIndex) {
  const i = Math.min(Math.max(0, hitIndex), COMBO_DAMAGE_SCALE.length - 1);
  return COMBO_DAMAGE_SCALE[i];
}

export function framesToSeconds(frames) {
  return frames * FRAME_DT;
}

// ═══════════════════════════════════════════════════════════════════════════
// FRAME DATA (60 FPS) - Precise timing from spec
// ═══════════════════════════════════════════════════════════════════════════

export const PRECISE_FRAME_DATA = {
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
    startupFrames: 3,    // 0.05s
    activeFrames: 2,     // 0.033s
    recoveryFrames: 7,   // 0.117s
    totalFrames: 12,     // 0.20s total
    blockAdvantage: 2,   // +2 frames on block
    onHitStun: 10,       // 10 frames
    damage: 5,
    knockback: 0.15,
  },
  heavy_punch: {
    startupFrames: 8,    // 0.133s
    activeFrames: 3,     // 0.05s
    recoveryFrames: 14,  // 0.233s
    totalFrames: 25,     // 0.417s total
    blockAdvantage: -4,  // -4 frames on block (punishable)
    onHitStun: 22,       // 22 frames
    damage: 15,
    knockback: 0.5,
    knockdown: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HITSTOP SYSTEM - Frame freeze on impact
// ═══════════════════════════════════════════════════════════════════════════

export const HITSTOP = {
  LIGHT_HIT_FRAMES: 4,   // 66ms freeze
  HEAVY_HIT_FRAMES: 8,   // 133ms freeze
};

export function getHitStopDuration(heavy = false) {
  return framesToSeconds(heavy ? HITSTOP.HEAVY_HIT_FRAMES : HITSTOP.LIGHT_HIT_FRAMES);
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOCKBACK PHYSICS
// ═══════════════════════════════════════════════════════════════════════════

export const KNOCKBACK = {
  LIGHT_KICK_DISPLACEMENT: 0.3,
  HEAVY_KICK_DISPLACEMENT: 0.8,
  BLOCK_PUSHBACK: 0.15,
  BLOCK_DAMAGE_REDUCTION: 0.80,
};

/**
 * MK 11 four-button layout: X high punch, A low punch, Y high kick, B low kick.
 */
export const MOVES = {
  high_punch: {
    id: 'high_punch', label: 'High Punch', button: 'X',
    aliases: ['jab', 'light_punch', 'attack_light', 'attack', 'x_punch'],
    startup: 2, active: 3, recovery: 4,
    // rangeMax must clear START_DISTANCE (2.6m, see fighting-combat-engine.js)
    // with enough margin to also absorb knockback drift over a multi-hit string.
    damage: 5, rangeMin: 0.5, rangeMax: 2.75,
    hitStun: 4, blockStun: 6,
    stamina: 2, attackHeight: 'high', safe: true,
    knockback: 0.15, knockdown: false,
  },
  low_punch: {
    id: 'low_punch', label: 'Low Punch', button: 'A',
    aliases: ['short_punch', 'a_punch'],
    startup: 2, active: 3, recovery: 5,
    damage: 6, rangeMin: 0.6, rangeMax: 2.75,
    hitStun: 4, blockStun: 6,
    stamina: 2, attackHeight: 'low', safe: true,
    knockback: 0.15, knockdown: false,
  },
  high_kick: {
    id: 'high_kick', label: 'Roundhouse', button: 'D',
    aliases: ['roundhouse', 'y_kick'],
    startup: 4, active: 4, recovery: 6,
    damage: 15, rangeMin: 0.9, rangeMax: 2.85,
    hitStun: 6, blockStun: 8,
    stamina: 6, attackHeight: 'high', safe: true,
    knockback: 0.3, knockdown: false,
  },
  low_kick: {
    id: 'low_kick', label: 'Light Kick', button: 'A',
    aliases: ['light_kick', 'short_kick', 'kick_low', 'b_kick', 'kick'],
    startup: 3, active: 3, recovery: 4,
    damage: 9, rangeMin: 0.7, rangeMax: 2.9,
    hitStun: 4, blockStun: 5,
    stamina: 3, attackHeight: 'low', safe: true,
    knockback: 0.2, knockdown: false,
  },
  heavy_punch: {
    id: 'heavy_punch', label: 'Heavy Punch', button: 'Hold X',
    aliases: ['cross', 'strong', 'heavy_punch', 'attack_heavy', 'fierce', 'uppercut', 'slam'],
    startup: 6, active: 5, recovery: 10,
    damage: 15, rangeMin: 1.0, rangeMax: 2.8,
    hitStun: 10, blockStun: 12,
    stamina: 5, attackHeight: 'high', safe: false,
    knockback: 0.5, knockdown: true,
  },
  heavy_kick: {
    id: 'heavy_kick', label: 'Heavy Kick', button: 'Hold D',
    aliases: ['high_kick_combo', 'furious_blow', 'haymaker'],
    startup: 7, active: 5, recovery: 8,
    damage: 22, rangeMin: 1.0, rangeMax: 2.8,
    hitStun: 12, blockStun: 14,
    stamina: 8, attackHeight: 'high', safe: false,
    knockback: 0.5, knockdown: false,
  },
  sweep: {
    id: 'sweep', label: 'Sweep', button: 'Down + A',
    aliases: ['sweep_kick', 'leg_sweep'],
    startup: 2, active: 2, recovery: 3,
    damage: 12, rangeMin: 0.8, rangeMax: 2.85,
    hitStun: 10, blockStun: 8,
    stamina: 5, attackHeight: 'low', safe: false,
    knockback: 0.15, knockdown: true,
  },
  throw: {
    id: 'throw', label: 'Throw', button: 'Back + X + A',
    aliases: ['grab_throw', 'grab'],
    startup: 4, active: 2, recovery: 12,
    damage: 12, rangeMin: 0.4, rangeMax: 0.7,
    hitStun: 8, blockStun: 0,
    stamina: 4, attackHeight: 'throw', unblockable: true,
    knockback: 1.0, knockdown: false,
  },
  energy_bolt: {
    id: 'energy_bolt', label: 'Energy Bolt', button: 'Space',
    aliases: ['use_special', 'special'],
    startup: 10, active: 5, recovery: 15,
    damage: 12, rangeMin: 1.5, rangeMax: 4.0,
    hitStun: 8, blockStun: 10,
    stamina: 8, attackHeight: 'high', projectile: true,
    knockback: 0.4, knockdown: false,
  },
  uppercut_reversal: {
    id: 'uppercut_reversal', label: 'Uppercut Reversal', button: 'Down-Forward + Space',
    aliases: ['reversal', 'anti_air'],
    startup: 6, active: 6, recovery: 20,
    damage: 16, rangeMin: 0.6, rangeMax: 1.5,
    hitStun: 12, blockStun: 14,
    stamina: 10, attackHeight: 'high', invincible: 6,
    knockback: 0.8, knockdown: true,
  },
  jump_punch: {
    id: 'jump_punch', label: 'Jump Punch', button: 'Up + X',
    aliases: [],
    startup: 4, active: 4, recovery: 5,
    damage: 8, rangeMin: 0.8, rangeMax: 2.0,
    hitStun: 6, blockStun: 8,
    stamina: 3, attackHeight: 'overhead', airborne: true,
    knockback: 0.35, knockdown: false,
  },
  jump_kick: {
    id: 'jump_kick', label: 'Jump Kick', button: 'Up + Y',
    aliases: [],
    startup: 4, active: 4, recovery: 5,
    damage: 10, rangeMin: 1.0, rangeMax: 2.2,
    hitStun: 7, blockStun: 9,
    stamina: 4, attackHeight: 'overhead', airborne: true,
    knockback: 0.45, knockdown: false,
  },
  combo_3hit: {
    id: 'combo_3hit', label: 'A → B → X → Y',
    aliases: [],
    startup: 2, active: 3, recovery: 4,
    damage: 6, rangeMin: 0.6, rangeMax: 2.0,
    hitStun: 4, blockStun: 6,
    stamina: 10, attackHeight: 'low',
    comboChain: ['low_punch', 'low_kick', 'high_punch', 'high_kick'],
    knockback: 0.3,
  },
};

export const PUNCHES = MOVES;

const ALIAS_MAP = {};
Object.values(MOVES).forEach((m) => {
  ALIAS_MAP[m.id] = m;
  (m.aliases || []).forEach((a) => { ALIAS_MAP[a] = m; });
});

export function resolvePunch(actionId) {
  return ALIAS_MAP[actionId] || null;
}

export function resolveMove(actionId) {
  return resolvePunch(actionId);
}

export function getMoveTotalFrames(move) {
  if (!move) return 9;
  return (move.startup || 2) + (move.active || 3) + (move.recovery || 4);
}

const PRECISE_ACTION_MAP = {
  light_kick: 'light_kick',
  low_kick: 'light_kick',
  kick: 'light_kick',
  short_kick: 'light_kick',
  heavy_kick: 'heavy_kick',
  roundhouse: 'heavy_kick',
  high_kick: 'heavy_kick',
  jab: 'light_punch',
  light_punch: 'light_punch',
  cross: 'heavy_punch',
  heavy_punch: 'heavy_punch',
  hook: 'heavy_punch',
};

export function getAttackTiming(move, actionId = null) {
  const key = actionId || move?.id || move?.actionId;
  const preciseKey = PRECISE_ACTION_MAP[key] || (PRECISE_FRAME_DATA[key] ? key : null);
  if (preciseKey && PRECISE_FRAME_DATA[preciseKey]) {
    const p = PRECISE_FRAME_DATA[preciseKey];
    const startupSec = framesToSeconds(p.startupFrames);
    const activeSec = framesToSeconds(p.activeFrames);
    const recoverySec = framesToSeconds(p.recoveryFrames);
    return {
      startup: startupSec,
      active: activeSec,
      recovery: recoverySec,
      impactAt: startupSec,
      animDuration: framesToSeconds(p.totalFrames),
      totalFrames: p.totalFrames,
      hitConfirmWindow: framesToSeconds(p.onHitStun + 2),
      blockAdvantage: p.blockAdvantage,
      onHitStun: p.onHitStun,
      knockback: p.knockback,
    };
  }
  if (!move) return { impactAt: 0.033, animDuration: 0.15, recovery: 0.066, startup: 0.033, active: 0.05 };
  const startupSec = framesToSeconds(move.startup || 2);
  const activeSec = framesToSeconds(move.active || 3);
  const recoverySec = framesToSeconds(move.recovery || 4);
  return {
    startup: startupSec,
    active: activeSec,
    recovery: recoverySec,
    impactAt: startupSec,
    animDuration: startupSec + activeSec + recoverySec,
    recovery: recoverySec,
    totalFrames: getMoveTotalFrames(move),
    hitConfirmWindow: framesToSeconds((move.hitStun || 4) + 2),
  };
}

export function getDistanceBand(meters) {
  if (meters < DISTANCE.CLINCH) return { id: 'clinch', label: 'Throw Range', icon: '🤼' };
  if (meters <= DISTANCE.OPTIMAL_MAX) return { id: 'optimal', label: 'Pressure', icon: '🔥' };
  if (meters <= DISTANCE.MID_MAX) return { id: 'mid', label: 'Mid Range', icon: '📏' };
  return { id: 'far', label: 'Far', icon: '↔️' };
}

export function isInRange(move, distance) {
  if (!move) return false;
  return distance >= (move.rangeMin ?? 0.5) && distance <= (move.rangeMax ?? 2.0);
}

/** MK combo counter — caps at 7 hits */
export function getComboMultiplier(comboHits) {
  const hits = Math.min(MK_MAX_COMBO, Math.max(0, comboHits));
  if (hits >= 7) return { mult: 1, label: 'BRUTAL!', points: 100 };
  if (hits >= 5) return { mult: 1, label: `COMBO x${hits}`, points: 50 };
  if (hits >= 3) return { mult: 1, label: `COMBO x${hits}`, points: 25 };
  if (hits === 2) return { mult: 1, label: `COMBO x${hits}`, points: 10 };
  return { mult: 1, label: hits > 0 ? `COMBO x${hits}` : null, points: 0 };
}

export const STAMINA = {
  MAX: 100,
  REGEN_PER_SEC: 1,
  REGEN_MOVING: 0.3,
  BLOCK_PER_FRAME: 1.0,
  ON_HIT_GAIN: 5,
  ON_BLOCK_GAIN: 2,
  ATTACK_MIN: 1,
  ATTACK_MAX: 5,
  AMPLIFY_COST: 10,
  PARRY: 8,
  DODGE: 2,
  STEP: 0.3,
  BACK_DASH: 2,
  MOVE_PER_METER: 0.2,
  JUMP: 2,
  EXHAUSTED_THRESHOLD: 10,
  LOW_THRESHOLD: 30,
  HALF_THRESHOLD: 50,
  GUARD_BREAK_FRAMES: 20,
};

export function staminaSpeedMult(staminaPct) {
  if (staminaPct <= 0.1) return 0.4;
  if (staminaPct <= 0.3) return 0.65;
  if (staminaPct <= 0.5) return 0.85;
  return 1;
}

export function staminaStartupMult(staminaPct) {
  if (staminaPct <= 0.1) return 1.4;
  if (staminaPct <= 0.3) return 1.2;
  return 1;
}

export function staminaDamageMult(staminaPct) {
  if (staminaPct <= 0.1) return 0.6;
  if (staminaPct <= 0.3) return 0.85;
  return 1;
}

export const GUARD = {
  back: { blocks: ['high', 'low', 'mid'], label: 'Block (Hold Back)' },
  block: { blocks: ['high', 'low', 'mid'], label: 'Block' },
  crouch: { blocks: ['low'], label: 'Crouch' },
};

/** MK hold-back block stops normal attacks; unblockable moves get through */
export function attackBlockedByGuard(move, guardType = 'back', crouching = false) {
  if (!move) return false;
  if (move.unblockable) return false;
  if (move.attackHeight === 'overhead' && crouching) return false;
  if (move.attackHeight === 'low' && crouching && guardType === 'crouch') return true;
  const guard = crouching && guardType !== 'back' ? 'crouch' : (guardType || 'back');
  const def = GUARD[guard] || GUARD.back;
  return def.blocks.includes(move.attackHeight || 'high');
}

export const IMPACT = {
  STAGGER_THRESHOLD: 12,
  KNOCKDOWN_THRESHOLD: 15,
  GUARD_BREAK_HITS: 999,
  CRITICAL_MULT: 1.25,
  BLOCK_REDUCTION: 0.3,
  BLOCK_PUSHBACK: 0.4,
  PARRY_WINDOW: 0.15,
  KNOCKDOWN_STUN_FRAMES: 40,
  WAKEUP_FAST_FRAMES: 30,
  WAKEUP_SLOW_FRAMES: 40,
  WAKEUP_INVINC_FRAMES: 10,
  JUMP_FRAMES: 20,
};

export const ROUNDS = {
  DURATION: 60,
  REST: 30,
  BEST_OF: 3,
  WINS_NEEDED: 2,
  HEAL_BETWEEN: 0.15,
};

export const FIGHT_HEALTH = 1000;

export function resolveGenericAttack(actionId, archetypeAttacks = {}) {
  const move = resolveMove(actionId);
  if (move) return { ...move, source: 'mk' };
  const custom = archetypeAttacks[actionId];
  if (custom) {
    return {
      id: actionId,
      label: custom.label || actionId,
      damage: custom.damage || 8,
      rangeMin: custom.range || 1.0,
      rangeMax: (custom.range || 2) + 0.5,
      startup: 3, active: 3, recovery: 6,
      stamina: 3,
      attackHeight: 'high',
      hitStun: 5, blockStun: 7,
      knockback: custom.knockback || 0.2,
      source: 'archetype',
    };
  }
  return null;
}

export function calculateContextDamage(move, {
  defenderBlocking = false,
  defenderIdle = true,
  comboHitIndex = 0,
  staminaPct = 1,
  specialMult = 1,
  guardBlocks = false,
  amplified = false,
} = {}) {
  if (!move) return 0;
  let base = move.damage || 5;
  if (amplified) base = Math.round(base * 1.5);
  if (defenderBlocking && guardBlocks) {
    return Math.max(1, Math.round(base * IMPACT.BLOCK_REDUCTION));
  }
  let mult = staminaDamageMult(staminaPct) * specialMult;
  mult *= getComboDamageScale(comboHitIndex);
  if (defenderIdle && !defenderBlocking) mult *= IMPACT.CRITICAL_MULT;
  return Math.max(1, Math.round(base * mult));
}

export function getHealthBarColor(pct) {
  if (pct > 0.75) return '#00ff00';
  if (pct > 0.5) return '#ffff00';
  if (pct > 0.25) return '#ff6600';
  return '#ff0000';
}

export function getFightPhase(elapsedSec, roundDuration = ROUNDS.DURATION) {
  if (elapsedSec < 10) return { id: 'opening', label: 'FIGHT!' };
  if (elapsedSec < 25) return { id: 'early', label: 'Aggressive exchanges' };
  if (elapsedSec < 45) return { id: 'mid', label: 'Intensity rising' };
  if (elapsedSec < roundDuration - 5) return { id: 'late', label: 'Finish them!' };
  return { id: 'finisher', label: 'FINAL SECONDS!' };
}
