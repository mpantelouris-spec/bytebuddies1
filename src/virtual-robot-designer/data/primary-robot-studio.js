/**
 * Primary-school Robot Studio bible — 10 unique, child-safe arenas per chassis.
 * Ages 7–11. No combat, missiles, dogfights, or developer hex labels.
 */
import { PRIMARY_STUDIO_ARENAS } from './primary-arena-bible-sets.js';
import { applyCarRacingArena } from './car-racing-tracks.js';
import { hasSkyCourse, getSkyStarterScript } from './sky-courses.js';
import { hasSeaCourse, getSeaStarterScript } from './sea-courses.js';
import { getMissionAction } from './mission-actions.js';
import { getArmStarterScript } from '../studio/arm-world/ArmWorkshop.js';
import { getTierLevel, getTierGoal, getTierTeach, getTierBaseMode, getTierLearningGoal, getTierMood, TIER_ENGINE } from './tier-levels/index.js';
import { tint } from './tier-levels/moods.js';

export { PRIMARY_STUDIO_ARENAS };

export const MODE_SKILLS = [
  { mode: 1, difficulty: 'Tutorial', skill: 'Sequence', tryThis: 'Add one movement block, then press Simulate.' },
  { mode: 2, difficulty: 'Easy', skill: 'Turns', tryThis: 'Move, then turn, then move again.' },
  { mode: 3, difficulty: 'Easy', skill: 'Sequence', tryThis: 'Line up 3 blocks in a row.' },
  { mode: 4, difficulty: 'Medium', skill: 'Loops', tryThis: 'Use Repeat to do the same move more than once.' },
  { mode: 5, difficulty: 'Medium', skill: 'Sensors', tryThis: 'Add a sensor block so the robot can look ahead.' },
  { mode: 6, difficulty: 'Medium', skill: 'Timing', tryThis: 'Add Wait so the robot pauses at the right moment.' },
  { mode: 7, difficulty: 'Hard', skill: 'If / else', tryThis: 'Use If so the robot chooses what to do.' },
  { mode: 8, difficulty: 'Hard', skill: 'Moving puzzle', tryThis: 'Wait, then go when the path is clear.' },
  { mode: 9, difficulty: 'Hard', skill: 'Pattern puzzle', tryThis: 'Copy the colour or shape pattern.' },
  { mode: 10, difficulty: 'Expert', skill: 'Capstone', tryThis: 'Use everything you learned — still keep it simple!' },
];

/** Kid-safe display names shown in UI and 3D. */
export const PRIMARY_ROBOT_DISPLAY = {
  rover: { name: 'Rover', emoji: '🚗' },
  scout: { name: 'Scout Rover', emoji: '⚡' },
  crawler: { name: 'Crawler', emoji: '🌿' },
  tank: { name: 'Heavy Rover', emoji: '🛡️' },
  stealth: { name: 'Quiet Rover', emoji: '🌙' },
  miningbot: { name: 'Mining Bot', emoji: '💎' },
  securitybot: { name: 'Safety Patrol Bot', emoji: '🚓' },
  farmbot: { name: 'Farm Bot', emoji: '🌾' },
  spider: { name: 'Spider Bot', emoji: '🕷️' },
  droid: { name: 'Humanoid', emoji: '🤖' },
  mech: { name: 'Mech Walker', emoji: '🦾' },
  drone: { name: 'Drone', emoji: '🚁' },
  racedrone: { name: 'Racing Drone', emoji: '🏁' },
  rescuedrone: { name: 'Rescue Drone', emoji: '🚑' },
  helicopter: { name: 'Helicopter', emoji: '🚁' },
  hoverbot: { name: 'Hover Bot', emoji: '🛸' },
  hoverracer: { name: 'Hover Racer', emoji: '✨' },
  submarine: { name: 'Sub Drone', emoji: '🐠' },
  deepseabot: { name: 'Deep Sea Bot', emoji: '🌊' },
  robotarm: { name: 'Robot Arm', emoji: '🦾' },
  factorybot: { name: 'Factory Bot', emoji: '🏭' },
  spacerover: { name: 'Space Rover', emoji: '🚀' },
  legobot: { name: 'LEGO Bot', emoji: '🧱' },
  blockbot: { name: 'Block Crafter', emoji: '🟩' },
  battlebot: { name: 'Mega Mech', emoji: '🦾' },
  striker: { name: 'Boxing', emoji: '🥊' },
  footballbot: { name: 'Striker FC', emoji: '⚽' },
  blaster: { name: 'Elemental Maker', emoji: '🌈' },
  ninja: { name: 'Ninja Helper', emoji: '🥷' },
  berserker: { name: 'Power Bot', emoji: '💪' },
  medbot: { name: 'Med Bot', emoji: '🩺' },
  firebot: { name: 'Fire Safety Bot', emoji: '🚒' },
  jetplane: { name: 'Jet Explorer', emoji: '✈️' },
  steathjet: { name: 'Quiet Jet', emoji: '🌫️' },
  aerobat: { name: 'Aero Stunt', emoji: '🎪' },
  birdbot: { name: 'Flappy Bird', emoji: '🐦' },
  pacbot: { name: 'Pac-Bot', emoji: '🟡' },
  brickbot: { name: 'Brick Bot', emoji: '🧱' },
  hopbot: { name: 'Hop Bot', emoji: '🐸' },
  raiderbot: { name: 'Space Raider', emoji: '👾' },
  snakebot: { name: 'Snake Bot', emoji: '🐍' },
  jumpbot: { name: 'Jump Bot', emoji: '🤖' },
  custom: { name: 'Custom Bot', emoji: '✨' },
};

const FAMILY = {
  wheeled: 'wheeled',
  aerial: 'aerial',
  walker: 'walker',
  underwater: 'underwater',
  arm: 'arm',
  football: 'footballbot',
  birdbot: 'birdbot',
  arcade: 'arcade',
};

export const CHASSIS_FAMILY = {
  rover: FAMILY.wheeled, scout: FAMILY.wheeled, crawler: FAMILY.wheeled,
  tank: FAMILY.wheeled, stealth: FAMILY.wheeled, miningbot: FAMILY.wheeled,
  securitybot: FAMILY.wheeled, farmbot: FAMILY.wheeled, spacerover: FAMILY.wheeled,
  legobot: FAMILY.wheeled,
  blockbot: FAMILY.wheeled,
  drone: FAMILY.aerial, racedrone: FAMILY.aerial, rescuedrone: FAMILY.aerial,
  helicopter: FAMILY.aerial, hoverbot: FAMILY.aerial, hoverracer: FAMILY.aerial,
  jetplane: FAMILY.aerial, steathjet: FAMILY.aerial, aerobat: FAMILY.aerial,
  spider: FAMILY.walker, droid: FAMILY.walker, mech: FAMILY.walker,
  battlebot: FAMILY.walker, striker: FAMILY.walker, berserker: FAMILY.walker,
  ninja: FAMILY.walker, blaster: FAMILY.walker,
  submarine: FAMILY.underwater, deepseabot: FAMILY.underwater,
  robotarm: FAMILY.arm, factorybot: FAMILY.arm,
  footballbot: FAMILY.football,
  birdbot: FAMILY.birdbot,
  medbot: FAMILY.wheeled, firebot: FAMILY.wheeled,
  pacbot: FAMILY.arcade, brickbot: FAMILY.arcade, hopbot: FAMILY.arcade, snakebot: FAMILY.arcade, raiderbot: FAMILY.arcade, jumpbot: FAMILY.arcade,
  custom: FAMILY.wheeled,
};


export function getStudioRobotGroup(chassisId) {
  return CHASSIS_FAMILY[chassisId] || FAMILY.wheeled;
}

/** A short real-world STEM connection shown alongside every robot mission. */
const ROBOT_LEARNING_FRAMES = {
  wheeled: { concept: 'Motion & friction', goal: 'Explore how wheel speed, turns, and surface grip change a route.', question: 'What changes if the robot moves more slowly or turns sooner?' },
  aerial: { concept: 'Flight & forces', goal: 'Explore how lift, thrust, and balance help a flying robot move safely.', question: 'How does changing height or direction affect the flight path?' },
  walker: { concept: 'Balance & biomechanics', goal: 'Explore how step size, timing, and balance help a walking robot stay upright.', question: 'Which step pattern helps the robot move smoothly without tipping?' },
  underwater: { concept: 'Buoyancy & sonar', goal: 'Explore how depth, currents, and sonar help an underwater robot navigate.', question: 'How can a sonar scan help the robot find a safe route?' },
  arm: { concept: 'Mechanisms & precision', goal: 'Explore how joints, reach, and gripping let a robot arm move objects accurately.', question: 'Which joint or grip adjustment makes the placement more accurate?' },
  footballbot: { concept: 'Angles & teamwork', goal: 'Explore how direction, timing, and passing create a better route to goal.', question: 'Where should a pass go so a teammate can reach it?' },
  birdbot: { concept: 'Forces & repeating patterns', goal: 'Explore how repeated flaps change height and forward movement.', question: 'How does changing the flap timing affect the flight path?' },
  arcade: { concept: 'Algorithms & game systems', goal: 'Explore how rules, patterns, and precise inputs control a game character.', question: 'Which repeated pattern or rule helps solve this level?' },
};

export function getRobotLearningFrame(chassisId) {
  const id = String(chassisId || '').toLowerCase();
  const aliases = {
    humanoid: 'walker', spiderbot: 'walker', walker: 'walker',
    jet: 'aerial', hover: 'aerial', flyer: 'aerial',
    underwater: 'underwater', submarinebot: 'underwater',
    factory: 'arm', arm: 'arm',
    football: 'footballbot', soccerbot: 'footballbot',
    bird: 'birdbot', arcade: 'arcade',
  };
  const family = aliases[id] || getStudioRobotGroup(id);
  return ROBOT_LEARNING_FRAMES[family] || ROBOT_LEARNING_FRAMES.wheeled;
}

/** First-screen Studio Create picks — one robot per play family. The rest stay behind More robots. */
export const STARTER_CHASSIS_IDS = [
  'rover',
  'droid',
  'drone',
  'spider',
  'submarine',
  'robotarm',
  'footballbot',
  'striker',
  'birdbot',
  'legobot',
  'snakebot',
  'pacbot',
  'brickbot',
  'hopbot',
  'raiderbot',
  'jumpbot',
  'racedrone',
  'jetplane',
  'blockbot',
];

/**
 * Robots taken out of the picker: they all played the same "drive to the checkpoints"
 * game with a different skin. Saved robots using them still load and play.
 */
export const RETIRED_CHASSIS_IDS = new Set([
  'medbot', 'firebot', 'securitybot', 'stealth', 'tank', 'crawler', 'scout', 'farmbot', 'miningbot',
  'spacerover', 'battlebot', 'berserker', 'ninja', 'blaster', 'mech', 'steathjet', 'aerobat',
  'hoverbot', 'hoverracer', 'rescuedrone', 'helicopter', 'deepseabot', 'factorybot',
]);

export const FAMILY_PICKER_LABEL = {
  wheeled: 'Wheels',
  aerial: 'Fly',
  walker: 'Walk',
  underwater: 'Swim',
  arm: 'Arms',
  footballbot: 'Football',
  birdbot: 'Bird',
  arcade: 'Arcade games',
  custom: 'Your robots',
};

export function partitionByStarterIds(items, getId, starterIds) {
  const order = new Map(starterIds.map((id, i) => [id, i]));
  const starters = [];
  const more = [];
  for (const item of items) {
    (order.has(getId(item)) ? starters : more).push(item);
  }
  starters.sort((a, b) => order.get(getId(a)) - order.get(getId(b)));
  return { starters, more };
}

export function isStarterChassis(chassisId) {
  return STARTER_CHASSIS_IDS.includes(chassisId);
}

export function getPrimaryRobotDisplay(chassisId) {
  return PRIMARY_ROBOT_DISPLAY[chassisId] || PRIMARY_ROBOT_DISPLAY.custom;
}

export function getPrimaryStudioArena(chassisId, modeIndex = 1) {
  const list = PRIMARY_STUDIO_ARENAS[chassisId] || PRIMARY_STUDIO_ARENAS.custom;
  // Modes 11–50: the robot's own tier levels, dressed like its original arenas
  // (Rover's races are kart tracks and keep their own arena rows 11–19.)
  const level = TIER_ENGINE[chassisId] !== 'kart' ? getTierLevel(chassisId, modeIndex) : null;
  if (level) return tierArena(chassisId, level, list);
  const mode = Math.max(1, Math.min(list.length, Math.floor(Number(modeIndex) || 1)));
  return list[mode - 1] || list[0];
}

const TIER_EST_MINUTES = { Easy: 5, Medium: 7, Hard: 9, Advanced: 12 };

function tierArena(chassisId, level, list) {
  const base = list[getTierBaseMode(chassisId, level) - 1] || list[0];
  const teach = getTierTeach(level, chassisId);
  const mood = getTierMood(chassisId, level);
  return {
    ...base,
    // Same world as an original arena, but its own time of day and colour grade
    sky: tint(base.sky, mood), ground: tint(base.ground, mood, 0.6), fog: tint(base.fog, mood),
    mood,
    mode: level.mode,
    title: level.name,
    objective: getTierGoal(chassisId, level),
    difficulty: level.tier,
    skill: teach.skill,
    tryThis: teach.tryThis,
    estMinutes: TIER_EST_MINUTES[level.tier] || 6,
    action: level.action ?? null,
    tierLevel: level,
    isRace: false,
  };
}

export function getPrimaryStarterScript(chassisId, modeIndex = 1) {
  // Flyers with a sky course start with the first part of that course's program
  if (hasSkyCourse(chassisId)) {
    const action = getMissionAction({ chassisId, arenaBible: true, modeIndex });
    const sky = getSkyStarterScript(chassisId, modeIndex, action?.id || null);
    if (sky) return sky;
  }
  if (hasSeaCourse(chassisId)) {
    const action = getMissionAction({ chassisId, arenaBible: true, modeIndex });
    const sea = getSeaStarterScript(chassisId, modeIndex, action?.id || null);
    if (sea) return sea;
  }
  if (chassisId === 'robotarm') return getArmStarterScript(modeIndex, typeof window !== 'undefined' && !!window.__bbArmFullSolution);
  const arena = getPrimaryStudioArena(chassisId, modeIndex);
  const family = getStudioRobotGroup(chassisId);
  const mode = arena.mode;
  const b = (id, label, paramValues = {}) => ({ id, label, paramValues });
  if (arena.isRace) {
    return [b('when_start', 'When START clicked'), b('follow_track_on', 'Follow track automatically')];
  }
  const move = (steps = 2) => family === 'walker'
    ? b('step_forward', 'Step forward', { steps })
    : family === 'aerial'
      ? b('fly_forward', 'Fly forward', { steps })
      : family === 'underwater'
        ? b('swim_forward', 'Swim forward', { steps })
        : b('move_forward', 'Move forward', { steps });
  const wait = b('wait', 'Wait', { seconds: 1 });
  const turn = family === 'aerial'
    ? b('bank_right', 'Bank right', { degrees: 30 })
    : b('turn_right', family === 'walker' ? 'Turn body' : 'Turn right', { degrees: 90 });
  let body;
  if (family === 'arm') {
    body = [
      b('arm_retract', 'Lower arm', { dist: 20 }),
      b('grip', 'Grip'),
      b('arm_extend', 'Raise arm', { dist: 20 }),
      b('rotate_joint', 'Rotate base', { degrees: 15 + mode * 10 }),
      b('release', 'Release'),
    ];
  } else if (family === 'footballbot') {
    body = [
      b('forever', 'Forever'),
      b('if_shooting_range', 'If in shooting range then'),
      b('shoot', 'Shoot'),
      b('if_have_ball', 'If I have the ball then'),
      b('dribble', 'Dribble toward goal'),
      b('chase_ball', 'Chase ball'),
    ];
  } else if (family === 'birdbot') {
    body = [b('repeat', 'Repeat', { times: mode + 1 }), b('flap', 'Flap'), wait];
  } else {
    const patterns = [
      [move(2), turn, move(2)],
      [move(2), wait, move(3)],
      [b('repeat', 'Repeat', { times: 3 }), move(2), wait],
      [move(1), wait, turn, move(2)],
      [move(1), wait, move(1), wait, move(2)],
      [b('repeat', 'Repeat', { times: 5 }), move(1), wait],
      [move(2), turn, move(1), wait],
      [move(1), turn, move(1), turn, wait],
      [move(3), wait, turn, move(2), wait],
      [b('repeat', 'Repeat', { times: 4 }), move(2), turn, wait],
    ];
    body = patterns[mode - 1];
    if (arena.tierLevel) {
      // Tier levels: less help each tier — Easy shows the first leg, Advanced only the start block
      const act = arena.action ? b(arena.action, ({ pick_up: 'Pick up', drop_off: 'Drop off', scan_here: 'Scan here', light_up: 'Light up', press_alarm: 'Press button', push_object: 'Push' })[arena.action] || 'Action') : null;
      const tier = arena.tierLevel.tier;
      body = tier === 'Easy' ? [move(2), turn, move(2), ...(act ? [act] : [])]
        : tier === 'Medium' ? [move(2), ...(act ? [act] : [])]
        : tier === 'Hard' ? [move(1)]
        : [];
      return [b('when_start', 'When START clicked'), ...body];
    }
    if (family === 'aerial') body = [b('fly_up', 'Fly up', { height: 8 }), ...body, b('hover_hold', 'Hover', { seconds: 1 })];
    if (family === 'underwater') body = [b('dive_deep', 'Dive', { depth: 2 }), ...body, b('sonar_ping', 'Sonar scan')];
    if (family === 'walker') body = [move(1), b('balance', 'Balance'), ...body];
    const obj = String(arena.objective || '').toLowerCase();
    const actionHint = /pick|collect|harvest|gather/.test(obj) ? b('pick_up', 'Pick up')
      : /deliver|bring|carry/.test(obj) ? b('drop_off', 'Drop off')
      : /alarm|button/.test(obj) ? b('press_alarm', 'Press button')
      : /light|shine|lantern/.test(obj) ? b('light_up', 'Light up')
      : /scan|check|inspect/.test(obj) ? b('scan_here', 'Scan here')
      : null;
    if (actionHint) body = [...body, actionHint];
  }
  return [b('when_start', 'When START clicked'), ...body];
}

export function kidSafeText(text = '') {
  return String(text)
    .replace(/emissive\s+green\s+#?[0-9a-f]{3,8}\s+ring/gi, 'green success ring')
    .replace(/#[0-9a-f]{3,8}/gi, '')
    .replace(/\b(air strike|boss fight|target enemy|defeat opponents|dogfight|missile|airstrike|assassination|kill|destroy|war|bombing|raid|fighter|duel|combat|rage|weapon)\b/gi, 'challenge')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const FIGHT_TYPES = new Set(['Combat', 'Duel', 'Boss', 'Survival', 'Defense']);

export function applyPrimaryStudioMeta(mode) {
  if (!mode?.chassisId) return mode;
  const modeIndex = mode.modeIndex || mode.modeNumber || 1;
  const arena = getPrimaryStudioArena(mode.chassisId, modeIndex);
  const display = getPrimaryRobotDisplay(mode.chassisId);
  const family = getStudioRobotGroup(mode.chassisId);
  const learningFrame = getRobotLearningFrame(mode.chassisId);
  // Modes 11–50 teach their own lesson (data/tier-levels/lessons.js)
  const learningGoal = (arena.tierLevel && getTierLearningGoal(mode.chassisId, arena.tierLevel, learningFrame)) || {
    ...learningFrame,
    concept: arena.skill ? `${learningFrame.concept} · ${arena.skill}` : learningFrame.concept,
    goal: arena.objective ? `${learningFrame.goal} In this challenge: ${arena.objective}` : learningFrame.goal,
  };
  const keepFootball = family === 'footballbot' && (mode.linkedFootballCourse || mode.arenaType === 'robot_football');
  // Only the Boxing robot plays in the ring; tanks, mechs and power bots get
  // their own worlds instead of a boxing arena with garbled "challenge" names.
  const keepFight = mode.chassisId === 'striker'
    && !!(mode.linkedFightCourse || mode.arenaType === 'robot_fight');
  const keepFlappy = family === 'birdbot';

  if (keepFight) {
    return {
      ...mode,
      arenaBible: false,
      physics: 'combat',
      environmentId: 'boxing_mech',
      environmentName: 'Robot Boxing Arena',
      environmentEmoji: '🥊',
      displayRobotName: display.name,
      displayRobotEmoji: display.emoji,
      genre: 'combat',
      cat: 'combat',
      arenaType: 'robot_fight',
      linkedFightCourse: mode.linkedFightCourse,
      learningGoal,
    };
  }

  if (arena.isRace) {
    const race = applyCarRacingArena({ ...mode, modeIndex });
    // Rover races 11–50 have their own name, goal and track: show those, not the shared row
    const kart = TIER_ENGINE[mode.chassisId] === 'kart' ? getTierLevel(mode.chassisId, modeIndex) : null;
    const title = kart?.name || arena.title;
    const goal = kart?.goal || arena.objective;
    return {
      ...race,
      arenaBible: false,
      // Modes 11–19 have their own race themes; later races show their own world, not the shared Safari theme
      raceThemeId: kart ? (mode.modeIndex <= 19 ? arena.raceThemeId : undefined) : arena.raceThemeId,
      name: title,
      shortName: title,
      catalogName: title,
      raceTrackLabel: title,
      environmentName: title,
      environmentEmoji: arena.emoji,
      icon: arena.emoji,
      desc: goal,
      tagline: `Mode ${arena.mode} · Race · ${goal}`,
      difficulty: arena.difficulty,
      tryThis: arena.tryThis,
      skillLearned: arena.skill,
      learningGoal,
      studioGradient: arena.gradient,
      displayRobotName: display.name,
      displayRobotEmoji: display.emoji,
      recommendedBlocks: ['Follow track automatically'],
    };
  }

  const quick = mode.modeSpec?.quickInfo;
  const modeSpec = quick
    ? { ...mode.modeSpec, quickInfo: { ...quick, type: FIGHT_TYPES.has(quick.type) ? 'Mission' : quick.type, difficulty: arena.difficulty || quick.difficulty } }
    : mode.modeSpec;

  return {
    ...mode,
    modeSpec,
    arenaBible: true,
    physics: family === 'aerial' ? 'flight_3dof' : family === 'underwater' ? 'underwater' : 'ground',
    environmentId: arena.id,
    environmentName: arena.title,
    environmentEmoji: arena.emoji,
    name: arena.title,
    shortName: arena.title,
    catalogName: arena.title,
    desc: arena.objective,
    tagline: `Mode ${arena.mode} · ${arena.difficulty} · Learn ${arena.skill}. ${arena.objective}`,
    difficulty: arena.difficulty,
    programmingConcepts: [arena.skill.toLowerCase()],
    estMinutes: arena.estMinutes,
    tryThis: arena.tryThis,
    skillLearned: arena.skill,
    learningGoal,
    recommendedBlocks: [...new Set(getPrimaryStarterScript(mode.chassisId, modeIndex).slice(1).map(b => b.label))],
    studioGradient: arena.gradient,
    studioFloorKind: arena.floorKind,
    studioSky: arena.sky,
    studioGround: arena.ground,
    studioFog: arena.fog,
    studioLandmark: arena.landmark,
    studioSceneTheme: arena.sceneTheme || arena.id,
    displayRobotName: display.name,
    displayRobotEmoji: display.emoji,
    genre: keepFootball ? 'football' : (keepFlappy ? 'action' : (family === 'aerial' ? 'aerial' : 'simulation')),
    cat: keepFootball ? 'football' : (keepFlappy ? 'flappy' : 'mission'),
    arenaType: keepFootball ? 'robot_football' : (keepFlappy ? 'flappy_bird' : (family === 'aerial' ? 'flight_rings' : 'sandbox')),
    objectives: [arena.objective, arena.tryThis].filter(Boolean),
    gameObjectives: [arena.objective, arena.tryThis].filter(Boolean),
    linkedFightCourse: undefined,
    linkedRaceCourse: undefined,
    raceTrackLabel: undefined,
    mkTier: undefined,
  };
}

export function parseWeightKg(value, fallback = 2.0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = parseFloat(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

export function formatRobotWeightKg(value, fallback = 2.0) {
  return `${parseWeightKg(value, fallback).toFixed(1)} kg`;
}

export function isPrimaryStudioChassis(chassisId) {
  return Boolean(PRIMARY_STUDIO_ARENAS[chassisId]);
}

/** Primary-school flyers (Drone mode 1–10) — use AerialWorldKit + premium vistas, not pink KidClarity floor. */
export function isPrimaryStudioAerialChassis(chassisId) {
  return isPrimaryStudioChassis(chassisId) && getStudioRobotGroup(chassisId) === 'aerial';
}
