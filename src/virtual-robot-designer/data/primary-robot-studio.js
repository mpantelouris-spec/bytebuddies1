/**
 * Primary-school Robot Studio bible — 10 unique, child-safe arenas per chassis.
 * Ages 7–11. No combat, missiles, dogfights, or developer hex labels.
 */
import { PRIMARY_STUDIO_ARENAS } from './primary-arena-bible-sets.js';

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
  battlebot: { name: 'Mega Mech', emoji: '🦾' },
  striker: { name: 'Sport Striker', emoji: '⚽' },
  footballbot: { name: 'Striker FC', emoji: '⚽' },
  blaster: { name: 'Elemental Maker', emoji: '🌈' },
  ninja: { name: 'Ninja Helper', emoji: '🥷' },
  berserker: { name: 'Power Bot', emoji: '💪' },
  medbot: { name: 'Med Bot', emoji: '🩺' },
  firebot: { name: 'Fire Safety Bot', emoji: '🚒' },
  jetplane: { name: 'Jet Explorer', emoji: '✈️' },
  steathjet: { name: 'Quiet Jet', emoji: '🌫️' },
  aerobat: { name: 'Aero Stunt', emoji: '🎪' },
  birdbot: { name: 'Sling-B', emoji: '🐦' },
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
};

export const CHASSIS_FAMILY = {
  rover: FAMILY.wheeled, scout: FAMILY.wheeled, crawler: FAMILY.wheeled,
  tank: FAMILY.wheeled, stealth: FAMILY.wheeled, miningbot: FAMILY.wheeled,
  securitybot: FAMILY.wheeled, farmbot: FAMILY.wheeled, spacerover: FAMILY.wheeled,
  legobot: FAMILY.wheeled,
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
  custom: FAMILY.wheeled,
};


export function getStudioRobotGroup(chassisId) {
  return CHASSIS_FAMILY[chassisId] || FAMILY.wheeled;
}

export function getPrimaryRobotDisplay(chassisId) {
  return PRIMARY_ROBOT_DISPLAY[chassisId] || PRIMARY_ROBOT_DISPLAY.custom;
}

export function getPrimaryStudioArena(chassisId, modeIndex = 1) {
  const list = PRIMARY_STUDIO_ARENAS[chassisId] || PRIMARY_STUDIO_ARENAS.custom;
  const mode = Math.max(1, Math.min(10, Math.floor(Number(modeIndex) || 1)));
  return list[mode - 1] || list[0];
}

export function getPrimaryStarterScript(chassisId, modeIndex = 1) {
  const arena = getPrimaryStudioArena(chassisId, modeIndex);
  const family = getStudioRobotGroup(chassisId);
  const mode = arena.mode;
  const b = (id, label, paramValues = {}) => ({ id, label, paramValues });
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
    body = [b('chase_ball', 'Chase ball'), b('face_ball', 'Face ball'), b('shoot', 'Shoot')];
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
    if (family === 'aerial') body = [b('fly_up', 'Fly up', { height: 3 }), ...body, b('hover_hold', 'Hover', { seconds: 1 })];
    if (family === 'underwater') body = [b('dive_deep', 'Dive', { depth: 2 }), ...body, b('sonar_ping', 'Sonar scan')];
    if (family === 'walker') body = [move(1), b('balance', 'Balance'), ...body];
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

export function applyPrimaryStudioMeta(mode) {
  if (!mode?.chassisId) return mode;
  const modeIndex = mode.modeIndex || mode.modeNumber || 1;
  const arena = getPrimaryStudioArena(mode.chassisId, modeIndex);
  const display = getPrimaryRobotDisplay(mode.chassisId);
  const family = getStudioRobotGroup(mode.chassisId);
  const keepFootball = family === 'footballbot' && (mode.linkedFootballCourse || mode.arenaType === 'robot_football');
  const keepFlappy = family === 'birdbot';


  return {
    ...mode,
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
