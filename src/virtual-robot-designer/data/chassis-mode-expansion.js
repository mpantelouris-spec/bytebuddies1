/**
 * Robot Studio modes 11–50 for each robot in the picker: ten Easy, ten Medium,
 * ten Hard and ten Advanced levels, played in that robot's own game (see
 * data/tier-levels/). The original modes 1–10 are not changed.
 *
 * chassis-game-modes.js copies each robot's game setup from its first original
 * mode onto these, so a new level always runs on the same engine as the old ones.
 */
import {
  TIER_ROBOT_IDS, getTierLevels, getTierGoal, getTierTeach, getTierModeFields, getTierLearningGoal,
} from './tier-levels/index.js';

const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const EST = { Easy: 5, Medium: 7, Hard: 9, Advanced: 12 };
const CONCEPTS = {
  Easy: ['sequencing'],
  Medium: ['sequencing', 'loops'],
  Hard: ['loops', 'planning', 'debugging'],
  Advanced: ['loops', 'decomposition', 'debugging'],
};

export const EXPANDED_CHASSIS_MODES = {};
export const EXPANDED_CHASSIS_MODE_CATALOG = {};
export const EXPANDED_GAME_MODE_SPECS = {};
export const EXPANDED_CHASSIS_MODE_IDS_BY_ROBOT = {};

export function tierModeId(chassisId, level) {
  // idName keeps a mode's id (and pupils' saved progress) when its name is changed
  return `tier_${chassisId}_${String(level.mode).padStart(2, '0')}_${slug(level.idName || level.name)}`;
}

for (const chassisId of TIER_ROBOT_IDS) {
  const levels = getTierLevels(chassisId);
  const ids = levels.map((level) => tierModeId(chassisId, level));
  levels.forEach((level, i) => {
    const id = ids[i];
    const goal = getTierGoal(chassisId, level);
    const teach = getTierTeach(level, chassisId);
    const stars = {
      one: `Complete “${level.name}”`,
      two: 'Finish without restarting the run',
      three: level.tier === 'Easy' ? 'Use no extra blocks' : 'Use a Repeat block to keep the program short',
    };
    EXPANDED_CHASSIS_MODES[id] = {
      id, chassisId, modeIndex: level.mode, modeNumber: level.mode,
      name: level.name, shortName: level.name, catalogName: level.name,
      desc: goal, tagline: `Mode ${level.mode} · ${level.tier} · ${goal}`,
      difficulty: level.tier, modeType: 'Mission', programmingConcepts: CONCEPTS[level.tier],
      estMinutes: EST[level.tier], starRequirements: stars,
      rewardBadge: `${chassisId}_mode_${level.mode}`, unlocksNext: ids[i + 1] || null,
      tryThis: teach.tryThis, skillLearned: teach.skill,
      isChassisMode: true, isExpandedMode: true, isTierMode: true, exclusive: chassisId, rec: [chassisId],
      learningGoal: getTierLearningGoal(chassisId, level),
      ...getTierModeFields(chassisId, level),
    };
    EXPANDED_CHASSIS_MODE_CATALOG[id] = {
      id, chassisId, modeNumber: level.mode, name: level.name, shortName: level.name, desc: goal,
      tagline: `Mode ${level.mode} · ${level.tier} · ${goal}`, difficulty: level.tier, modeType: 'Mission',
      programmingConcepts: CONCEPTS[level.tier], starOne: stars.one, starTwo: stars.two, starThree: stars.three,
      rewardBadge: `${chassisId}_mode_${level.mode}`, unlocksNext: ids[i + 1] || null, timeEstimateMinutes: EST[level.tier],
    };
    EXPANDED_GAME_MODE_SPECS[id] = {
      id, chassisId, modeNumber: level.mode, modeName: level.name, catalogName: level.name,
      quickInfo: { difficulty: level.tier, type: 'Mission', timeEstimate: `${EST[level.tier]} minutes`, stars },
      gameplayDescription: goal,
      learningObjective: `${teach.skill}: ${teach.tryThis}`,
      challengePrompt: goal,
    };
  });
  EXPANDED_CHASSIS_MODE_IDS_BY_ROBOT[chassisId] = ids;
}

export const EXPANDED_ROBOT_IDS = [...TIER_ROBOT_IDS];
