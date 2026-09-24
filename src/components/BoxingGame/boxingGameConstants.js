/**
 * BoxingGameConstants — frame data, damage, scoring, match config (60 FPS).
 */

export const BOXING_FPS = 60;
export const FRAME_DT = 1 / BOXING_FPS;

export const MATCH = {
  ROUNDS: 3,
  ROUND_DURATION: 60,
  REST_DURATION: 10,
  ROUNDS_TO_WIN: 2,
  MAX_HEALTH: 1000,
  MAX_STAMINA: 100,
  HEAL_BETWEEN_ROUNDS: 0.2,
  BLOCK_CHIP: 0.5,
  KNOCKDOWN_BONUS: 50,
  COUNT_POINT_EACH: 5,
  KO_BONUS: 100,
  AGGRESSION_INTERVAL: 5,
  AGGRESSION_BONUS: 10,
  DEFENSE_BONUS: 5,
};

export const COMBO_MULTIPLIERS = { 2: 1.2, 3: 1.4, 4: 1.6, 5: 1.8 };

export function getComboMultiplier(hits) {
  if (hits >= 5) return COMBO_MULTIPLIERS[5];
  if (hits >= 4) return COMBO_MULTIPLIERS[4];
  if (hits >= 3) return COMBO_MULTIPLIERS[3];
  if (hits >= 2) return COMBO_MULTIPLIERS[2];
  return 1;
}

export const ATTACKS = {
  JAB: {
    id: 'jab', combatId: 'jab', name: 'JAB', key: 'J',
    startup: 1, active: 2, recovery: 2, total: 5,
    damage: 8, points: 3, range: 1.2,
    hitStun: 3, blockStun: 4, knockback: 0.05,
    properties: 'SAFE', causesKnockdown: false,
  },
  STRAIGHT: {
    id: 'straight', combatId: 'cross', name: 'STRAIGHT', key: 'K',
    startup: 2, active: 3, recovery: 3, total: 8,
    damage: 12, points: 5, range: 1.5,
    hitStun: 5, blockStun: 6, knockback: 0.15,
    properties: 'SAFE', causesKnockdown: false,
  },
  HOOK: {
    id: 'hook', combatId: 'heavy_punch', name: 'HEAVY PUNCH', key: 'Hold K',
    startup: 5, active: 3, recovery: 4, total: 12,
    damage: 20, points: 8, range: 2.0,
    hitStun: 8, blockStun: 10, knockback: 0.4,
    properties: 'KNOCKBACK', causesKnockdown: true,
  },
  KICK: {
    id: 'kick', combatId: 'light_kick', name: 'LIGHT KICK', key: 'A',
    startup: 1, active: 2, recovery: 3, total: 6,
    damage: 9, points: 4, range: 1.1,
    hitStun: 4, blockStun: 5, knockback: 0.2,
    staminaCost: 3, properties: 'SAFE', causesKnockdown: false,
  },
  ROUNDHOUSE: {
    id: 'roundhouse', combatId: 'roundhouse', name: 'ROUNDHOUSE', key: 'D',
    startup: 2, active: 3, recovery: 5, total: 10,
    damage: 15, points: 6, range: 1.6,
    hitStun: 6, blockStun: 7, knockback: 0.3,
    staminaCost: 6, properties: 'SAFE', causesKnockdown: false,
  },
  HAYMAKER: {
    id: 'haymaker', combatId: 'heavy_kick', name: 'HEAVY KICK', key: 'Hold D',
    startup: 5, active: 4, recovery: 7, total: 16,
    damage: 22, points: 10, range: 1.9,
    hitStun: 10, blockStun: 12, knockback: 0.5,
    staminaCost: 8, properties: 'KNOCKBACK', causesKnockdown: false,
  },
  SWEEP: {
    id: 'sweep', combatId: 'sweep', name: 'SWEEP', key: 'Crouch + A',
    startup: 2, active: 2, recovery: 3, total: 7,
    damage: 12, points: 7, range: 2.2,
    hitStun: 8, blockStun: 10, knockback: 0.15,
    staminaCost: 5, properties: 'KNOCKDOWN', causesKnockdown: true,
  },
  POWER_PUNCH: {
    id: 'power_punch', combatId: 'heavy_punch', name: 'POWER PUNCH', key: 'Hold Heavy',
    startup: 8, active: 6, recovery: 14, total: 28,
    damage: 22, points: 15, range: 1.8,
    hitStun: 14, blockStun: 16, knockback: 0.8,
    properties: 'KNOCKBACK', causesKnockdown: true,
  },
};

export const COMBAT_TO_ATTACK = {
  jab: 'JAB', high_punch: 'JAB', light_punch: 'JAB', attack_light: 'JAB', attack: 'JAB',
  cross: 'STRAIGHT', strong: 'STRAIGHT', fierce: 'STRAIGHT',
  hook: 'HOOK', heavy_punch: 'HOOK', attack_heavy: 'HOOK', slam: 'HOOK',
  light_kick: 'KICK', low_kick: 'KICK', kick_low: 'KICK', short_kick: 'KICK',
  high_kick: 'ROUNDHOUSE', kick: 'ROUNDHOUSE', roundhouse: 'ROUNDHOUSE',
  heavy_kick: 'HAYMAKER', sweep: 'SWEEP',
};

export const KEY_TO_ATTACK = {
  KeyJ: 'JAB', KeyK: 'STRAIGHT', KeyA: 'KICK', KeyD: 'ROUNDHOUSE',
};

export const HEAVY_HOLD_MS = 500;
export const PLAYER_START = { x: -1.5, y: 0, z: 0, rotationY: Math.PI / 2 };
export const OPPONENT_START = { x: 1.5, y: 0, z: 0, rotationY: -Math.PI / 2 };

export function framesToSeconds(frames) { return frames * FRAME_DT; }

export const BOXING_CHALLENGE = {
  id: 'arcade_fight', name: 'Arcade Fight', shortName: 'Street Fight',
  arenaType: 'robot_fight', fightMode: 'sparring', useBoxingRounds: true,
  gameStyle: true,
  timeLimit: MATCH.ROUND_DURATION,
  restDuration: MATCH.REST_DURATION,
  healBetweenRounds: MATCH.HEAL_BETWEEN_ROUNDS,
  totalRounds: MATCH.ROUNDS,
  boxingPointsMode: true,
  enemyType: 'dummy',
  playerHp: MATCH.MAX_HEALTH, enemyHp: MATCH.MAX_HEALTH,
};
