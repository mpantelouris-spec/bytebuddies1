/**
 * Robot Studio modes 11–50: ten Easy, ten Medium, ten Hard and ten Advanced
 * levels for every robot in the picker. Each robot keeps its own game — a flyer
 * flies sky courses, the Sub Drone swims sea courses, the Robot Arm works at its
 * bench — and each level is built by that robot's real engine from the data in
 * this folder. The original modes 1–10 are untouched.
 *
 * The level data is generated and checked by scripts/tier-levels.
 */
import { SKY_TIER_COURSES } from './sky-tiers.js';
import { SEA_TIER_COURSES } from './sea-tiers.js';
import { ARM_TIER_TASKS } from './arm-tiers.js';
import { GROUND_TIER_LEVELS } from './ground-tiers.js';
import { KART_TIER_RACES } from './kart-tiers.js';
import { FOOTBALL_TIER_LEVELS, BOXING_TIER_LEVELS, FLAPPY_TIER_LEVELS } from './sports-tiers.js';
import { BLOCK_CRAFTER_TIER_LEVELS } from './craft-tiers.js';
import { getTierLesson } from './lessons.js';
import { getMood } from './moods.js';

export const TIER_NAMES = ['Easy', 'Medium', 'Hard', 'Advanced'];
export const FIRST_TIER_MODE = 11;
export const LAST_TIER_MODE = 50;

/** Which engine each robot's levels run on. */
export const TIER_ENGINE = {
  drone: 'sky', racedrone: 'sky', jetplane: 'sky',
  submarine: 'sea',
  robotarm: 'arm',
  droid: 'ground', spider: 'ground', legobot: 'ground',
  rover: 'kart',
  footballbot: 'football', striker: 'boxing', birdbot: 'flappy', blockbot: 'craft',
};

const SOURCES = {
  drone: SKY_TIER_COURSES.drone,
  racedrone: SKY_TIER_COURSES.racedrone,
  jetplane: SKY_TIER_COURSES.jetplane,
  submarine: SEA_TIER_COURSES.submarine,
  robotarm: ARM_TIER_TASKS,
  droid: GROUND_TIER_LEVELS.droid,
  spider: GROUND_TIER_LEVELS.spider,
  legobot: GROUND_TIER_LEVELS.legobot,
  rover: KART_TIER_RACES.rover,
  footballbot: FOOTBALL_TIER_LEVELS,
  striker: BOXING_TIER_LEVELS,
  birdbot: FLAPPY_TIER_LEVELS,
  blockbot: BLOCK_CRAFTER_TIER_LEVELS,
};

export const TIER_ROBOT_IDS = Object.keys(SOURCES);

export function isTierMode(modeIndex) {
  const n = Number(modeIndex);
  return n >= FIRST_TIER_MODE && n <= LAST_TIER_MODE;
}

/** The level row for a robot's mode 11–50, or null. */
export function getTierLevel(chassisId, modeIndex) {
  if (!isTierMode(modeIndex)) return null;
  const list = SOURCES[chassisId];
  return list?.[Number(modeIndex) - FIRST_TIER_MODE] || null;
}

export function getTierLevels(chassisId) {
  return SOURCES[chassisId] || [];
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const SKY_GOAL = {
  rings: (l) => `Fly through all ${plural(l.markers, 'ring')} and reach the finish gate.`,
  deliver: (l) => `Drop a package at each of the ${plural(l.markers, 'balloon station')}.`,
  photo: (l) => `Take a photo at each of the ${plural(l.markers, 'camera post')}.`,
  lights: (l) => `Light up all ${plural(l.markers, 'lantern')} along the route.`,
  land: (l) => `Land on each of the ${plural(l.markers, 'landing pad')}, then fly on to the finish.`,
};
const SEA_GOAL = {
  rings: (l) => `Swim through all ${plural(l.markers, 'ring')} and reach the finish.`,
  scan: (l) => `Scan each of the ${plural(l.markers, 'survey spot')} with Scan here.`,
  collect: (l) => `Pick up all ${plural(l.markers, 'item')} on the route.`,
  lights: (l) => `Light up all ${plural(l.markers, 'glow lamp')} along the route.`,
};
const ARM_JOB = {
  sort: (n) => `sort ${plural(n, 'cube')} into the matching trays`,
  tower: (n) => `stack ${plural(n, 'block')} on the tower base`,
  paint: (n) => `carry ${plural(n, 'paint pot')} to the matching easels`,
  recycle: (n) => `put ${plural(n, 'piece')} of rubbish in the right bins`,
  cherry: (n) => `put a cherry on ${plural(n, 'cupcake')}`,
  seeds: (n) => `plant a seed in ${plural(n, 'flower pot')}`,
  marble: (n) => `move ${plural(n, 'marble')} into the green cup`,
  car: (n) => `fit ${plural(n, 'part')} onto the toy car`,
  bells: (n) => (n === 1 ? 'ring the bell to finish' : `ring ${plural(n, 'bell')} in number order`),
};

function armGoal(level) {
  const jobs = level.jobs.split(', ').map((j) => { const [t, n] = j.split('×'); return ARM_JOB[t](Number(n)); });
  const text = jobs.length > 1 ? `${jobs.slice(0, -1).join(', ')}, then ${jobs[jobs.length - 1]}` : jobs[0];
  return `${text[0].toUpperCase()}${text.slice(1)}.`;
}

/** Game settings a tier level adds to its mode (opponents, goals, time…). */
export function getTierModeFields(chassisId, level) {
  const engine = TIER_ENGINE[chassisId];
  if (engine === 'football') {
    return { linkedFootballCourse: level.course, aiDifficulty: level.aiDifficulty, goalsToWin: level.goalsToWin, missionTarget: level.missionTarget, timeLimit: level.timeLimit, missionObjective: level.goal, winCondition: level.goal };
  }
  if (engine === 'boxing') {
    return { linkedFightCourse: level.course, fightMode: level.fightMode, aiDifficulty: level.aiDifficulty, enemyType: level.enemyType, enemyHp: level.enemyHp, playerHp: level.playerHp, timeLimit: level.timeLimit, missionObjective: level.goal, winCondition: level.goal };
  }
  if (engine === 'flappy') return { flappyTarget: level.target };
  if (engine === 'craft') return { craftWorld: level.world, craftGoal: level.goal };
  return {};
}

export function getTierGoal(chassisId, level) {
  if (!level) return '';
  const engine = TIER_ENGINE[chassisId];
  if (engine === 'sky') return (SKY_GOAL[level.kind] || SKY_GOAL.rings)(level);
  if (engine === 'sea') return (SEA_GOAL[level.kind] || SEA_GOAL.rings)(level);
  if (engine === 'arm') return armGoal(level);
  return level.goal || '';
}

const TIER_TEACH = {
  Easy: { skill: 'Sequencing', tryThis: 'Finish the program the starter blocks begin. Count each move carefully.' },
  Medium: { skill: 'Loops', tryThis: 'Look for a set of moves that repeats and put it inside a Repeat block.' },
  Hard: { skill: 'Planning', tryThis: 'Plan the whole route first, then build it one part at a time and test often.' },
  Advanced: { skill: 'Algorithms', tryThis: 'Only the first move is given. Break the job into parts, use loops, and debug as you go.' },
};

/** What a level teaches: its own coding focus, a hint, a question and a real-world fact. */
export function getTierLessonFor(chassisId, level) {
  return getTierLesson(chassisId, TIER_ENGINE[chassisId], level);
}

export function getTierTeach(level, chassisId) {
  const lesson = chassisId ? getTierLessonFor(chassisId, level) : null;
  if (lesson) return { skill: lesson.skill, tryThis: lesson.tryThis };
  return TIER_TEACH[level?.tier] || TIER_TEACH.Easy;
}

/** The mission panel's "Learn" box for a level. */
export function getTierLearningGoal(chassisId, level, frame = null) {
  const lesson = getTierLessonFor(chassisId, level);
  if (!lesson) return null;
  return {
    ...(frame || {}),
    concept: `${lesson.skill} · ${lesson.concept}`,
    goal: `${lesson.tryThis} Did you know? ${lesson.fact}`,
    question: lesson.question,
    fact: lesson.fact,
  };
}

/** Original arena whose look a level borrows for its mission card. */
const SKY_BASE_MODE = { rings: 1, deliver: 2, land: 4, photo: 6, lights: 8 };
const SEA_BASE_MODE = { rings: 6, scan: 1, collect: 8, lights: 5 };

export function getTierBaseMode(chassisId, level) {
  const engine = TIER_ENGINE[chassisId];
  if (engine === 'sky') return SKY_BASE_MODE[level.kind] || 1;
  if (engine === 'sea') return SEA_BASE_MODE[level.kind] || 1;
  if (level?.baseMode) return level.baseMode;
  return ((Number(level?.mode || 11) - FIRST_TIER_MODE) % 10) + 1;
}

/** Which world a level is set in (levels sharing one get different moods). */
function lookKey(chassisId, level) {
  const engine = TIER_ENGINE[chassisId];
  if (engine === 'sky' || engine === 'sea') return level.theme;
  if (engine === 'flappy') return level.look;
  if (engine === 'football') return level.course;
  if (engine === 'boxing') return `${level.course}|${level.enemyType}`;
  if (engine === 'craft') return level.world;
  if (engine === 'arm') return String(level.jobs || '').split('×')[0];
  return level.baseMode ?? level.mode;
}

/** The lighting mood for a level: the nth level in the same world gets the nth mood. */
export function getTierMood(chassisId, levelOrMode) {
  const level = typeof levelOrMode === 'object' ? levelOrMode : getTierLevel(chassisId, levelOrMode);
  if (!level) return null;
  if (level.mood != null && TIER_ENGINE[chassisId] === 'kart') return getMood(level.mood);
  const list = getTierLevels(chassisId);
  const key = lookKey(chassisId, level);
  const nth = list.filter((l) => l.mode < level.mode && lookKey(chassisId, l) === key).length;
  return getMood((nth * 3) % 8); // repeats of a world get contrasting moods: dawn → cloudy → storm…
}
