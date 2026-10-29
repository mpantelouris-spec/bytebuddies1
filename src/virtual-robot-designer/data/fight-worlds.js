/**
 * Fighting worlds — more than boxing. Each world has its own arena, its own hero and
 * rival (a knight with a sword and shield, a samurai, a pirate, a wizard, a laser knight)
 * and its own coding blocks ("Sword slash", "Fire spell"…).
 *
 * World moves run on the same fight engine as boxing: each one plays like a boxing move
 * (`as`), so the timing, damage and AI all stay balanced — a sword thrust lands like a
 * jab, an overhead strike like an uppercut.
 */

/** [id, label, icon, plays as] */
export const FIGHT_WORLDS = {
  castle: {
    id: 'castle', name: 'Fantasy Castle', icon: '🏰', color: '#b45309',
    blurb: 'Knights with foam swords and shields in a castle courtyard.',
    hero: { outfit: 'knight', model: 'knight', label: 'Knight' },
    rival: { outfit: 'orc', model: 'skeletonknight', label: 'Skeleton Knight', archetype: 'tank' },
    moves: [
      ['sword_slash', 'Sword swing', '⚔️', 'cross'],
      ['sword_poke', 'Sword poke', '🤺', 'jab'],
      ['overhead_strike', 'Overhead strike', '⬇️', 'uppercut'],
      ['spin_attack', 'Spin attack', '🌀', 'roundhouse'],
      ['shield_shove', 'Shield shove', '🛡️', 'hook'],
    ],
    guard: [
      ['shield_block', 'Shield block', '🛡️', 'block'],
      ['side_step', 'Side step', '💨', 'dodge'],
    ],
  },
  dojo: {
    id: 'dojo', name: 'Samurai Dojo', icon: '🏯', color: '#dc2626',
    blurb: 'Practice swords and lightning-fast moves in a cherry-blossom dojo.',
    hero: { outfit: 'samurai', model: 'swordmaster', label: 'Sword Master' },
    rival: { outfit: 'ninja', model: 'ninja', label: 'Shadow Ninja', archetype: 'ninja' },
    moves: [
      ['quick_tap', 'Quick tap', '⚔️', 'jab'],
      ['dash_strike', 'Dash strike', '💨', 'cross'],
      ['rising_swing', 'Rising swing', '⬆️', 'uppercut'],
      ['sweeping_swing', 'Sweeping swing', '🌙', 'hook'],
      ['low_sweep', 'Low sweep', '⤵️', 'sweep'],
    ],
    guard: [
      ['sword_parry', 'Sword parry', '🔄', 'parry'],
      ['vanish', 'Vanish', '🌫️', 'dodge'],
    ],
  },
  ship: {
    id: 'ship', name: 'Pirate Ship', icon: '🏴‍☠️', color: '#0e7490',
    blurb: 'Foam cutlasses on the deck of a pirate ship, waves all around.',
    hero: { outfit: 'pirate', model: 'captain', label: 'Pirate Captain' },
    rival: { outfit: 'skeleton', model: 'skeletonpirate', label: 'Skeleton Pirate', archetype: 'striker' },
    moves: [
      ['cutlass_swipe', 'Cutlass swipe', '⚔️', 'hook'],
      ['cutlass_lunge', 'Cutlass lunge', '🤺', 'jab'],
      ['big_swing', 'Big swing', '💥', 'cross'],
      ['boot_kick', 'Boot kick', '🥾', 'light_kick'],
      ['anchor_spin', 'Anchor spin', '⚓', 'roundhouse'],
    ],
    guard: [
      ['cutlass_block', 'Cutlass block', '🛡️', 'block'],
      ['barrel_roll', 'Barrel roll', '🛢️', 'dodge'],
    ],
  },
  tower: {
    id: 'tower', name: 'Wizard Tower', icon: '🧙', color: '#7c3aed',
    blurb: 'Spells and magic staffs on top of a wizard’s tower under the stars.',
    hero: { outfit: 'wizard', model: 'mage', label: 'Wizard' },
    rival: { outfit: 'darkwizard', model: 'skeletonmage', label: 'Skeleton Sorcerer', archetype: 'blaster' },
    moves: [
      ['fire_spell', 'Fire spell', '🔥', 'cross'],
      ['ice_spell', 'Ice spell', '❄️', 'jab'],
      ['lightning_spell', 'Lightning spell', '⚡', 'uppercut'],
      ['wind_spell', 'Wind spell', '🌪️', 'roundhouse'],
      ['staff_swing', 'Staff swing', '🪄', 'hook'],
    ],
    guard: [
      ['magic_shield', 'Magic shield', '✨', 'block'],
      ['blink', 'Blink away', '🌀', 'dodge'],
    ],
  },
  space: {
    id: 'space', name: 'Space Arena', icon: '🚀', color: '#2563eb',
    blurb: 'Laser swords on a space station platform high above a planet.',
    hero: { outfit: 'laserknight', label: 'Laser Knight' },
    rival: { outfit: 'droid', label: 'Battle Droid', archetype: 'berserker' },
    moves: [
      ['laser_slash', 'Laser slash', '⚡', 'cross'],
      ['laser_thrust', 'Laser thrust', '🔦', 'jab'],
      ['plasma_strike', 'Plasma strike', '💫', 'uppercut'],
      ['power_spin', 'Power spin', '🌀', 'roundhouse'],
      ['jet_kick', 'Jet kick', '🚀', 'light_kick'],
    ],
    guard: [
      ['energy_shield', 'Energy shield', '🔵', 'block'],
      ['jet_dodge', 'Jet dodge', '💨', 'dodge'],
    ],
  },
};

export const FIGHT_WORLD_LIST = Object.values(FIGHT_WORLDS);

/** World move id → the boxing move it plays as. */
export const FIGHT_MOVE_ALIAS = Object.fromEntries(
  FIGHT_WORLD_LIST.flatMap((w) => [...w.moves, ...w.guard].map(([id, , , as]) => [id, as])),
);
/** World move id → its label, for the "Sword slash!" call-outs. */
export const FIGHT_MOVE_LABEL = Object.fromEntries(
  FIGHT_WORLD_LIST.flatMap((w) => [...w.moves, ...w.guard].map(([id, label]) => [id, label])),
);

export function getFightWorld(course) {
  return FIGHT_WORLDS[course?.fightWorld] || null;
}

/**
 * The block palette for a world: its own attack and guard blocks, plus the moving,
 * checking and loop blocks every fight uses. (Boxing punches and kicks are left out.)
 */
export function buildWorldBlockLibrary(baseLibrary, worldId) {
  const w = FIGHT_WORLDS[worldId];
  if (!w || !baseLibrary) return baseLibrary;
  const SHARED = new Set(['advance_step', 'retreat_step', 'move_toward_enemy', 'move_away_enemy', 'check_distance', 'check_health',
    'check_enemy_health', 'detect_enemy', 'detect_attack', 'use_special', 'if_enemy_close', 'if_enemy_far', 'if_under_attack',
    'if_health_low', 'wait', 'forever', 'repeat', 'strafe_left', 'strafe_right']);
  // No robot-group tag: every robot that enters the world can use its moves
  const block = ([id, label, icon]) => ({ id, label, icon });
  const out = {};
  Object.entries(baseLibrary).forEach(([key, cat]) => {
    if (key === 'Events' || key === 'Logic') { out[key] = cat; return; }
    if (key === 'Combat') {
      out.Moves = { ...cat, label: 'Moves & checks', blocks: (cat.blocks || []).filter((b) => SHARED.has(b.id)) };
    }
  });
  return {
    Events: out.Events,
    [`${w.id}_attacks`]: { label: `${w.hero.label} attacks`, color: w.color, icon: w.icon, blocks: w.moves.map(block) },
    [`${w.id}_guard`]: { label: 'Defence', color: '#3b82f6', icon: '🛡️', blocks: w.guard.map(block) },
    ...(out.Moves ? { Moves: out.Moves } : {}),
    ...(out.Logic ? { Logic: out.Logic } : {}),
  };
}

const LEVELS = [
  { key: 'training', name: 'Training Yard', mode: 'training', enemy: 'dummy', hp: 999, ai: 'easy', time: 180, xp: 120, win: 'Land 5 hits on the practice dummy', tag: 'Learn your moves' },
  { key: 'sparring', name: 'First Sparring', mode: 'sparring', hp: 80, ai: 'easy', time: 180, xp: 180, win: 'Win the sparring match before time runs out', tag: 'Easy rival' },
  { key: 'tournament', name: 'Tournament', mode: 'sparring', hp: 120, ai: 'medium', time: 150, xp: 250, win: 'Beat a tougher rival in the tournament', tag: 'Medium rival' },
  { key: 'champion', name: 'Champion', mode: 'sparring', hp: 160, ai: 'hard', time: 150, xp: 350, win: 'Beat the champion — plan when to attack and when to guard', tag: 'Hard rival' },
];

const LEVEL_NAMES = {
  castle: ['Castle Training Yard', 'Squire Sparring', 'Knights’ Tournament', 'Champion of the Castle'],
  dojo: ['Dojo Practice', 'Student Sparring', 'Blossom Tournament', 'Master of the Dojo'],
  ship: ['Deck Practice', 'Cabin Boy Sparring', 'Captains’ Tournament', 'King of the Seas'],
  tower: ['Spell Practice', 'Apprentice Sparring', 'Wizards’ Tournament', 'Archmage Champion'],
  space: ['Laser Training Bay', 'Cadet Sparring', 'Galaxy Tournament', 'Star Champion'],
};

/** Four courses per world: training, sparring, tournament, champion. */
export const FIGHT_WORLD_COURSES = FIGHT_WORLD_LIST.flatMap((w) => LEVELS.map((L, i) => {
  const [first] = w.moves;
  const guard = w.guard[0];
  return {
    id: `world_${w.id}_${L.key}`,
    cat: 'combat',
    icon: w.icon,
    name: LEVEL_NAMES[w.id][i],
    shortName: w.name,
    cardLabel: `${w.icon} ${w.name} · ${['Training', 'Sparring', 'Tournament', 'Champion'][i]}`,
    desc: `${w.blurb} ${L.win}.`,
    tagline: `${w.hero.label} vs ${L.enemy === 'dummy' ? 'practice dummy' : w.rival.label} · ${L.tag}`,
    arenaType: 'robot_fight',
    fightWorld: w.id,
    color: w.color,
    obstacles: 0,
    totalDist: 22,
    estMinutes: 6 + i * 2,
    genre: 'combat',
    fightMode: L.mode,
    enemyType: L.enemy || w.rival.archetype,
    enemyHp: L.hp,
    aiDifficulty: L.ai,
    timeLimit: L.time,
    winCondition: L.win,
    codeHint: `Use If enemy close → ${first[1]}, If under attack → ${guard[1]}.`,
    rec: ['striker', 'tank', 'blaster', 'ninja', 'berserker', 'battlebot', 'fighter', 'combat'],
    systemsBuilt: ['attacks', 'defense', 'conditionals', 'loops'],
    xpReward: L.xp,
    difficulty: ['Easy', 'Easy', 'Medium', 'Hard'][i],
    skillLearned: ['Sequencing', 'Loops', 'Conditions', 'If / else'][i],
  };
}));
