/**
 * chassis-game-logic.js — Playable win conditions, objectives, and hints for all chassis modes.
 */
import { getModeCatalogEntry } from './chassis-mode-catalog.js';
import { getChassisEnvironment } from './robot-arena-config.js';

const GAME_TYPE_BY_ARENA = {
  rainbow_road: 'racing',
  sunny_circuit: 'racing',
  dragon_skyway: 'racing',
  volcano_drift: 'racing',
  street_grand_prix: 'racing',
  circuit_sprint: 'racing',
  robot_fight: 'combat',
  robot_football: 'football',
  flappy_bird: 'flappy',
};

const CODE_HINTS = {
  racing: 'Use SET SPEED and smooth TURN blocks — boost pads reward clean racing lines.',
  combat: 'Chain punch combos with IF blocks — block when the rival winds up a heavy hit.',
  football: 'Chase the ball with MOVE blocks, then SHOOT when you are in the goal arc.',
  flappy: 'Tap FLAP on a rhythm — small bursts beat holding flap too long.',
  stealth: 'Pause in shadow zones and use WAIT blocks to slip past patrol sweeps.',
  aerial: 'Hover steady, then burst through ring gates — altitude matters on sky courses.',
  exploration: 'Visit every checkpoint in order — use REPEAT for long survey routes.',
  rescue: 'Route to victims first, then escort — IF blocks help pick the safest path.',
  simulation: 'Synchronize with conveyor timing — loops keep factory rhythm steady.',
  adventure: 'Read sensor values and branch with IF/ELSE when hazards appear.',
  mission: 'Break the goal into steps — sequence blocks, then add loops and sensors.',
};

const MECHANICS_MAP = {
  'sequential blocks': ['move_forward', 'turn_left', 'turn_right'],
  variables: ['set_speed', 'variables'],
  loops: ['repeat', 'move_forward'],
  'if/else': ['if_then', 'sensors'],
  sensors: ['distance_sensor', 'if_then'],
  events: ['when_start', 'when_sensor'],
  functions: ['custom_blocks', 'repeat'],
  'state machines': ['if_then', 'variables'],
  timing: ['wait', 'set_speed'],
  optimization: ['repeat', 'variables'],
};

function resolveGameType(course) {
  if (course?.gameType) return course.gameType;
  if (course?.genre === 'racing' || course?.cat === 'racing') return 'racing';
  if (GAME_TYPE_BY_ARENA[course?.arenaType]) return GAME_TYPE_BY_ARENA[course.arenaType];
  const env = getChassisEnvironment(course?.chassisId);
  const genreMap = {
    racing: 'racing',
    combat: 'combat',
    football: 'football',
    action: 'flappy',
    stealth: 'stealth',
    aerial: 'aerial',
    exploration: 'exploration',
    rescue: 'rescue',
    simulation: 'simulation',
    adventure: 'adventure',
    sandbox: 'mission',
  };
  return genreMap[env?.genre] || 'mission';
}

function buildCodeHint(catalog, gameType) {
  const concepts = catalog?.programmingConcepts?.join(' + ') || 'block sequencing';
  const base = CODE_HINTS[gameType] || CODE_HINTS.mission;
  return `${base} This ${catalog?.difficulty || 'mission'} mode teaches ${concepts}.`;
}

/** Build playable game logic for a chassis-exclusive mode */
export function buildChassisModeGameLogic(course) {
  if (!course?.id) return null;
  const catalog = getModeCatalogEntry(course.id);
  if (!catalog) return null;

  const gameType = resolveGameType(course);
  const concepts = catalog.programmingConcepts || [];
  const requiredMechanics = [
    ...new Set(concepts.flatMap((c) => MECHANICS_MAP[c] || []).slice(0, 4)),
  ];

  return {
    gameType,
    winCondition: catalog.desc,
    codeHint: buildCodeHint(catalog, gameType),
    requiredMechanics: requiredMechanics.length ? requiredMechanics : ['move_forward', 'turn_left'],
    minBlocks: Math.min(14, 2 + catalog.modeNumber),
    objectives: [
      `🎯 ${catalog.desc}`,
      `⭐ ${catalog.starTwo}`,
      `⭐⭐ ${catalog.starThree}`,
    ],
    starRequirements: {
      one: catalog.starOne,
      two: catalog.starTwo,
      three: catalog.starThree,
    },
    difficulty: catalog.difficulty,
    modeType: catalog.modeType,
    estMinutes: catalog.timeEstimateMinutes,
    programmingConcepts: catalog.programmingConcepts,
    rewardBadge: catalog.rewardBadge,
  };
}

export function isChassisModeCourse(courseId) {
  return Boolean(getModeCatalogEntry(courseId));
}
