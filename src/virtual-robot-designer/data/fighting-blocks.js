/**
 * Fighting game — course-scoped scratch block library.
 */
import { UNIVERSAL_EVENTS_CATEGORY } from './universal-event-blocks.js';
import { FIGHTING_ROBOT_TYPES } from './fighting-robot-types.js';

export const FIGHTING_COURSE_IDS = new Set([
  'fight_training', 'fight_sparring', 'fight_championship', 'fight_tournament',
  'fight_boss', 'fight_survival', 'fight_strategies',
]);

export function isFightingCourse(courseKey, arenaType) {
  const baseId = typeof courseKey === 'string' ? courseKey.split(':')[0] : courseKey;
  return FIGHTING_COURSE_IDS.has(baseId) || arenaType === 'robot_fight';
}

const FG = ['fighter'];

function atk(ids, label, icon, groups = FG) {
  return ids.map((id) => ({ id, label, icon, robotGroups: groups }));
}

const UNIVERSAL_COMBAT = [
  { id: 'attack', label: 'Attack', icon: '👊' },
  { id: 'attack_light', label: 'Light attack', icon: '👊' },
  { id: 'attack_heavy', label: 'Heavy attack', icon: '💥' },
  { id: 'jab', label: 'Jab', icon: '👊' },
  { id: 'cross', label: 'Cross', icon: '💪' },
  { id: 'hook', label: 'Hook', icon: '🔄' },
  { id: 'uppercut', label: 'Uppercut', icon: '⬆️' },
  { id: 'light_kick', label: 'Light Kick', icon: '🦵' },
  { id: 'roundhouse', label: 'Roundhouse Kick', icon: '🌀' },
  { id: 'heavy_kick', label: 'Heavy Kick', icon: '💥' },
  { id: 'sweep', label: 'Sweep (knockdown)', icon: '⤵️' },
  { id: 'block', label: 'Block', icon: '🛡️' },
  { id: 'high_guard', label: 'High guard', icon: '🛡️' },
  { id: 'mid_guard', label: 'Mid guard', icon: '🛡️' },
  { id: 'low_guard', label: 'Low guard', icon: '🛡️' },
  { id: 'parry', label: 'Parry', icon: '🔄' },
  { id: 'dodge', label: 'Dodge', icon: '💨' },
  { id: 'defend', label: 'Defend stance', icon: '🛡️' },
  { id: 'advance_step', label: 'Advance step', icon: '➡️' },
  { id: 'retreat_step', label: 'Retreat step', icon: '⬅️' },
  { id: 'detect_enemy', label: 'Detect enemy', icon: '📡' },
  { id: 'detect_attack', label: 'Detect incoming attack', icon: '⚠️' },
  { id: 'check_distance', label: 'Check distance to enemy', icon: '📏' },
  { id: 'check_health', label: 'Check my health %', icon: '❤️' },
  { id: 'check_enemy_health', label: 'Check enemy health %', icon: '💔' },
  { id: 'move_toward_enemy', label: 'Move toward enemy', icon: '➡️' },
  { id: 'move_away_enemy', label: 'Move away from enemy', icon: '⬅️' },
  { id: 'strafe_left', label: 'Strafe left', icon: '↖️' },
  { id: 'strafe_right', label: 'Strafe right', icon: '↗️' },
  { id: 'use_special', label: 'Use special ability', icon: '⭐' },
  { id: 'if_enemy_close', label: 'If enemy close then', icon: '❓' },
  { id: 'if_enemy_far', label: 'If enemy far then', icon: '❓' },
  { id: 'if_under_attack', label: 'If under attack then', icon: '❓' },
  { id: 'if_health_low', label: 'If health low then', icon: '❓' },
  { id: 'wait', label: 'Wait', icon: '⏸️', params: [{ key: 'seconds', label: 's', def: 0.5 }] },
  { id: 'forever', label: 'Forever (fight loop)', icon: '∞' },
  { id: 'repeat', label: 'Repeat', icon: '🔁', params: [{ key: 'times', label: '×', def: 3 }] },
];

const STRIKER_ATKS = [
  ...atk(
    ['jab', 'cross', 'hook', 'uppercut', 'combo_3hit', 'parry', 'rage_mode'],
    null,
    null,
    ['fighter', 'striker'],
  ).map((b, i) => ({
    ...b,
    label: ['Jab', 'Cross', 'Hook', 'Uppercut', 'Jab → Cross → Hook', 'Parry', 'Rage Mode'][i],
    icon: ['👊', '💪', '🔄', '⬆️', '🔥', '🔄', '😤'][i],
  })),
  { id: 'light_kick', label: 'Light Kick', icon: '🦵', robotGroups: ['fighter', 'striker'] },
  { id: 'roundhouse', label: 'Roundhouse Kick', icon: '🌀', robotGroups: ['fighter', 'striker'] },
  { id: 'heavy_kick', label: 'Heavy Kick', icon: '💥', robotGroups: ['fighter', 'striker'] },
  { id: 'sweep', label: 'Sweep (knockdown)', icon: '⤵️', robotGroups: ['fighter', 'striker'] },
];

const TANK_ATKS = atk(
  ['slam', 'shield_bash', 'grab_throw', 'fortify', 'stomp', 'charge', 'last_stand'],
  null,
  null,
  ['fighter', 'tank'],
).map((b, i) => ({
  ...b,
  label: ['Overhead Slam', 'Shield Bash', 'Grab & Throw', 'Fortify', 'Stomp', 'Charge', 'Last Stand'][i],
  icon: ['🔨', '🛡️', '🤼', '🏰', '👢', '🐂', '💎'][i],
}));

const BLASTER_ATKS = atk(
  ['fire_blast', 'ice_beam', 'lightning_strike', 'explosion', 'prismatic_shield', 'teleport', 'elemental_fusion'],
  null,
  null,
  ['fighter', 'blaster'],
).map((b, i) => ({
  ...b,
  label: ['Fire Blast', 'Ice Beam', 'Lightning Strike', 'Explosion', 'Prismatic Shield', 'Teleport', 'Elemental Fusion'][i],
  icon: ['🔥', '❄️', '⚡', '💥', '🌈', '🌀', '✨'][i],
}));

const NINJA_ATKS = atk(
  ['swift_strike', 'shuriken_throw', 'backstab', 'blade_flurry', 'smoke_bomb', 'shadow_clone', 'shadow_assassination'],
  null,
  null,
  ['fighter', 'ninja'],
).map((b, i) => ({
  ...b,
  label: ['Swift Strike', 'Shuriken Throw', 'Backstab', 'Blade Flurry', 'Smoke Bomb', 'Shadow Clone', 'Shadow Assassination'][i],
  icon: ['⚔️', '🎯', '🗡️', '🌪️', '💨', '👥', '🌑'][i],
}));

const BERSERKER_ATKS = atk(
  ['furious_blow', 'earthquake_smash', 'whirlwind', 'berserker_roar', 'rage_shield', 'revenge_blow', 'uncontrollable_rage'],
  null,
  null,
  ['fighter', 'berserker'],
).map((b, i) => ({
  ...b,
  label: ['Furious Blow', 'Earthquake Smash', 'Whirlwind', 'Berserker Roar', 'Rage Shield', 'Revenge Blow', 'Uncontrollable Rage'][i],
  icon: ['👊', '🌍', '🌀', '🦁', '🔴', '💢', '😡'][i],
}));

export const FIGHTING_STARTER_SCRIPT = [
  { id: 'when_start', label: 'When START clicked', icon: '▶️', catKey: 'Events', paramValues: {} },
  { id: 'forever', label: 'Forever (fight loop)', icon: '∞', catKey: 'Combat', paramValues: {} },
  { id: 'light_kick', label: 'Light Kick', icon: '🦵', catKey: 'Striker', paramValues: {} },
  { id: 'check_distance', label: 'Check distance', icon: '📏', catKey: 'Combat', paramValues: {} },
  { id: 'if_enemy_far', label: 'If enemy far then', icon: '❓', catKey: 'Logic', paramValues: {} },
  { id: 'advance_step', label: 'Advance step', icon: '➡️', catKey: 'Combat', paramValues: {} },
  { id: 'if_enemy_close', label: 'If enemy close then', icon: '❓', catKey: 'Logic', paramValues: {} },
  { id: 'light_kick', label: 'Light Kick', icon: '🦵', catKey: 'Striker', paramValues: {} },
  { id: 'jab', label: 'Jab', icon: '👊', catKey: 'Striker', paramValues: {} },
  { id: 'if_under_attack', label: 'If under attack then', icon: '❓', catKey: 'Logic', paramValues: {} },
  { id: 'block', label: 'Block', icon: '🛡️', catKey: 'Defense', paramValues: {} },
];

export const FIGHTING_BLOCK_LIBRARY = {
  Events: UNIVERSAL_EVENTS_CATEGORY,
  Combat: {
    label: 'Combat', color: '#ef4444', icon: '⚔️',
    blocks: UNIVERSAL_COMBAT,
  },
  Striker: {
    label: 'Striker', color: FIGHTING_ROBOT_TYPES.striker.color, icon: '🥊',
    blocks: STRIKER_ATKS,
  },
  Tank: {
    label: 'Tank', color: FIGHTING_ROBOT_TYPES.tank.color, icon: '🛡️',
    blocks: TANK_ATKS,
  },
  Blaster: {
    label: 'Blaster', color: FIGHTING_ROBOT_TYPES.blaster.color, icon: '✨',
    blocks: BLASTER_ATKS,
  },
  Ninja: {
    label: 'Ninja', color: '#334155', icon: '🥷',
    blocks: NINJA_ATKS,
  },
  Berserker: {
    label: 'Berserker', color: FIGHTING_ROBOT_TYPES.berserker.color, icon: '💢',
    blocks: BERSERKER_ATKS,
  },
  Defense: {
    label: 'Boxing Defense', color: '#3b82f6', icon: '🛡️',
    blocks: [
      { id: 'block', label: 'Block', icon: '🛡️', robotGroups: FG },
      { id: 'high_guard', label: 'High Guard', icon: '🛡️', robotGroups: FG },
      { id: 'mid_guard', label: 'Mid Guard', icon: '🛡️', robotGroups: FG },
      { id: 'low_guard', label: 'Low Guard', icon: '🛡️', robotGroups: FG },
      { id: 'parry', label: 'Parry', icon: '🔄', robotGroups: FG },
      { id: 'dodge', label: 'Dodge', icon: '💨', robotGroups: FG },
      { id: 'retreat_step', label: 'Retreat Step', icon: '⬅️', robotGroups: FG },
      { id: 'advance_step', label: 'Advance Step', icon: '➡️', robotGroups: FG },
    ],
  },
  Logic: {
    label: 'Logic', color: '#8b5cf6', icon: '🧠',
    blocks: [
      { id: 'if_then', label: 'If condition then', icon: '❓', robotGroups: FG },
      { id: 'if_else', label: 'If / else', icon: '↔️', robotGroups: FG },
    ],
  },
};
export const FIGHTING_BLOCK_ACTION_MAP = Object.fromEntries(
  [...UNIVERSAL_COMBAT, ...STRIKER_ATKS, ...TANK_ATKS, ...BLASTER_ATKS, ...NINJA_ATKS, ...BERSERKER_ATKS]
    .map((b) => [b.id, b.id]),
);
