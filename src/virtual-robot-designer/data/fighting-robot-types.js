/**
 * Fighting robot archetypes — stats, attacks, defenses, specials.
 */

export const FIGHTING_CHASSIS_IDS = ['striker', 'battlebot', 'blaster', 'ninja', 'berserker'];

export const FIGHTING_ROBOT_TYPES = {
  striker: {
    id: 'striker',
    name: 'Striker',
    icon: '🥊',
    style: 'Boxing / Martial Arts',
    health: 100,
    speed: 10,
    attack: 8,
    defense: 4,
    range: 2,
    color: '#f97316',
    attacks: {
      jab: { damage: 8, speed: 0.2, label: 'Jab' },
      cross: { damage: 18, speed: 0.4, knockback: 1.2, label: 'Cross' },
      hook: { damage: 15, speed: 0.35, label: 'Hook' },
      uppercut: { damage: 20, speed: 0.5, knockback: 1.5, label: 'Uppercut' },
      light_punch: { damage: 10, speed: 0.3, label: 'Light Punch' },
      heavy_punch: { damage: 20, speed: 0.5, knockback: 1.2, label: 'Heavy Punch' },
      kick: { damage: 15, speed: 0.4, range: 2.5, label: 'Kick' },
      combo_3hit: { damage: 41, speed: 1.0, label: 'Jab → Cross → Hook' },
    },
    defense: { block: 0.5, dodge: 1, parry: 1 },
    special: { id: 'rage_mode', damageMult: 1.5, duration: 5, triggerDamage: 50 },
  },
  tank: {
    id: 'tank',
    name: 'Tank',
    icon: '🛡️',
    style: 'Heavy Armor / Wrestling',
    chassisIds: ['battlebot', 'tank'],
    health: 200,
    speed: 3,
    attack: 7,
    defense: 9,
    range: 1.5,
    color: '#64748b',
    passiveArmor: 0.3,
    attacks: {
      slam: { damage: 30, speed: 0.8, knockback: 2, label: 'Overhead Slam' },
      shield_bash: { damage: 15, speed: 0.4, stun: 0.5, label: 'Shield Bash' },
      grab_throw: { damage: 30, speed: 0.6, label: 'Grab & Throw' },
      stomp: { damage: 25, speed: 0.7, aoe: 3, label: 'Stomp' },
      charge: { damage: 20, speed: 0.5, label: 'Charge' },
    },
    defense: { fortify: 0.75, block: 0.5 },
    special: { id: 'last_stand', heal: 50, defenseBoost: 0.5, duration: 6, triggerHpPct: 0.3 },
  },
  blaster: {
    id: 'blaster',
    name: 'Elemental Blaster',
    icon: '✨',
    style: 'Magic / Elemental',
    health: 120,
    speed: 7,
    attack: 8,
    defense: 6,
    range: 6,
    color: '#a855f7',
    attacks: {
      fire_blast: { damage: 20, speed: 0.4, burn: 5, label: 'Fire Blast' },
      ice_beam: { damage: 15, speed: 0.3, slow: 0.5, label: 'Ice Beam' },
      lightning_strike: { damage: 25, speed: 0.2, stun: 0.5, label: 'Lightning Strike' },
      explosion: { damage: 30, speed: 0.6, aoe: 4, label: 'Elemental Explosion' },
    },
    defense: { prismatic_shield: 0.6, teleport: 3, mirror_shield: 1 },
    special: { id: 'elemental_fusion', damage: 50, duration: 8, triggerDamage: 60 },
  },
  ninja: {
    id: 'ninja',
    name: 'Ninja',
    icon: '🥷',
    style: 'Stealth / Precision',
    health: 110,
    speed: 12,
    attack: 8,
    defense: 7,
    range: 2,
    color: '#1e293b',
    evasionPassive: 0.3,
    attacks: {
      swift_strike: { damage: 15, critDamage: 30, critChance: 0.5, speed: 0.2, label: 'Swift Strike' },
      shuriken_throw: { damage: 12, count: 3, range: 4, speed: 0.5, label: 'Shuriken Throw' },
      backstab: { damage: 40, speed: 0.3, label: 'Backstab' },
      blade_flurry: { damage: 40, speed: 0.6, hits: 5, label: 'Blade Flurry' },
      smoke_bomb: { damage: 0, speed: 0.3, debuff: 'blind', label: 'Smoke Bomb' },
    },
    defense: { shadow_clone: 1, wall_run: 1, dodge: 1.2 },
    special: { id: 'shadow_assassination', duration: 4, speedMult: 1.5, critMult: 3, triggerDamage: 45 },
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    icon: '💢',
    style: 'Rage / Berserk',
    health: 140,
    speed: 5,
    attack: 6,
    defense: 6,
    range: 2,
    color: '#dc2626',
    regenPassive: 5,
    attacks: {
      furious_blow: { damage: 12, rageScale: 5, speed: 0.5, label: 'Furious Blow' },
      earthquake_smash: { damage: 25, rageScale: 15, aoe: 3, speed: 0.7, label: 'Earthquake Smash' },
      whirlwind: { damage: 15, aoe: 2.5, speed: 1, label: 'Whirlwind' },
      berserker_roar: { damage: 0, debuff: 'intimidate', speed: 0.4, label: 'Berserker Roar' },
    },
    defense: { rage_shield: 0.4, revenge_blow: 2 },
    special: { id: 'uncontrollable_rage', damageMult: 2.5, duration: 6, triggerHpPct: 0.25 },
  },
};

/** Map chassis / detectRobotType → fighting archetype */
export function getFightingArchetype(robotType, chassisId) {
  if (robotType === 'striker' || chassisId === 'striker') return 'striker';
  if (robotType === 'blaster' || chassisId === 'blaster') return 'blaster';
  if (robotType === 'ninja' || chassisId === 'ninja') return 'ninja';
  if (robotType === 'berserker' || chassisId === 'berserker') return 'berserker';
  if (['tank', 'battlebot', 'miningbot'].includes(robotType) || chassisId === 'battlebot') return 'tank';
  return 'striker';
}

export function getFightingStats(robotType, chassisId) {
  const key = getFightingArchetype(robotType, chassisId);
  return FIGHTING_ROBOT_TYPES[key] || FIGHTING_ROBOT_TYPES.striker;
}
