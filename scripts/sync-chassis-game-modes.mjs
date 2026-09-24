/**
 * Syncs CHASSIS_GAME_MODE_BY_ID from catalog + arena config.
 * Run: node scripts/sync-chassis-game-modes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const target = path.join(root, 'src/virtual-robot-designer/data/chassis-game-modes.js');

const { CHASSIS_MODE_MAP, CHASSIS_GAME_MODE_BY_ID } = await import(target);
const { applyModeCatalog } = await import(path.join(root, 'src/virtual-robot-designer/data/chassis-mode-catalog.js'));
const { applyChassisArenaEnvironment } = await import(path.join(root, 'src/virtual-robot-designer/data/robot-arena-config.js'));
const { applyCarRacingArena, isCarChassis } = await import(path.join(root, 'src/virtual-robot-designer/data/car-racing-tracks.js'));

const CHASSIS_META = {
  rover: { icon: '🚙', color: '#FF8C00' },
  scout: { icon: '🏎️', color: '#ef4444' },
  crawler: { icon: '🦎', color: '#b45309' },
  tank: { icon: '🛡️', color: '#64748b' },
  stealth: { icon: '🥷', color: '#1e293b' },
  miningbot: { icon: '⛏️', color: '#f59e0b' },
  securitybot: { icon: '🚨', color: '#3b82f6' },
  farmbot: { icon: '🌾', color: '#22c55e' },
  spider: { icon: '🕷️', color: '#7c3aed' },
  droid: { icon: '🤖', color: '#06b6d4' },
  mech: { icon: '🦾', color: '#94a3b8' },
  drone: { icon: '🛸', color: '#38bdf8' },
  racedrone: { icon: '🏁', color: '#f472b6' },
  rescuedrone: { icon: '🚁', color: '#f97316' },
  helicopter: { icon: '🚁', color: '#0ea5e9' },
  hoverbot: { icon: '🛸', color: '#a78bfa' },
  hoverracer: { icon: '💨', color: '#e879f9' },
  submarine: { icon: '🌊', color: '#0284c7' },
  deepseabot: { icon: '🐙', color: '#1d4ed8' },
  robotarm: { icon: '🦾', color: '#fbbf24' },
  factorybot: { icon: '🏭', color: '#78716c' },
  spacerover: { icon: '🚀', color: '#dc2626' },
  legobot: { icon: '🧱', color: '#eab308' },
  battlebot: { icon: '⚔️', color: '#ef4444' },
  striker: { icon: '🥊', color: '#f43f5e' },
  footballbot: { icon: '⚽', color: '#16a34a' },
  blaster: { icon: '✨', color: '#8b5cf6' },
  ninja: { icon: '🥷', color: '#312e81' },
  berserker: { icon: '💢', color: '#b91c1c' },
  medbot: { icon: '🏥', color: '#10b981' },
  firebot: { icon: '🚒', color: '#ea580c' },
  jetplane: { icon: '✈️', color: '#2563eb' },
  steathjet: { icon: '🛩️', color: '#334155' },
  aerobat: { icon: '🎪', color: '#ec4899' },
  birdbot: { icon: '🐦', color: '#facc15' },
  custom: { icon: '✨', color: '#7c3aed' },
};

const OBSTACLE_SCALE = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14];

function syncMode(id, modeIndex, chassisId) {
  const orig = CHASSIS_GAME_MODE_BY_ID[id] || {};
  const meta = CHASSIS_META[chassisId] || CHASSIS_META.custom;
  let mode = {
    ...orig,
    id,
    chassisId,
    cat: 'chassis_mode',
    icon: orig.icon || meta.icon,
    modeIndex,
    exclusive: chassisId,
    rec: [chassisId],
    isChassisMode: true,
    obstacles: OBSTACLE_SCALE[modeIndex - 1] || 8,
    totalDist: 10 + modeIndex * 3,
    checkpoints: Math.min(8, 2 + modeIndex),
    estMinutes: [3, 5, 6, 8, 8, 10, 10, 12, 12, 15][modeIndex - 1] || 10,
  };

  mode = applyModeCatalog(mode);
  if (!mode.linkedFightCourse && !mode.linkedFootballCourse) {
    mode = applyChassisArenaEnvironment(mode);
    if (isCarChassis(chassisId)) {
      mode = applyCarRacingArena(mode);
    }
  }
  mode.color = mode.color || meta.color;
  mode.icon = mode.icon || meta.icon;
  return mode;
}

const synced = {};
for (const [chassisId, ids] of Object.entries(CHASSIS_MODE_MAP)) {
  ids.forEach((id, i) => {
    synced[id] = syncMode(id, i + 1, chassisId);
  });
}

const header = `/**
 * chassis-game-modes.js — Exhaustive per-chassis game mode catalog (35 chassis × 10 modes)
 * Strict UI filtering: each chassis shows ONLY its 10 assigned modes.
 * Mode names/objectives synced from chassis-mode-catalog.js — run: node scripts/sync-chassis-game-modes.mjs
 */
import { applyCarRacingArena, isCarChassis } from './car-racing-tracks.js';
import { applyChassisArenaEnvironment } from './robot-arena-config.js';
import { applyModeCatalog } from './chassis-mode-catalog.js';
import { getGameModeSpec } from './game-mode-specifications.js';
`;

const mapJson = JSON.stringify(CHASSIS_MODE_MAP, null, 2);
const byIdJson = JSON.stringify(synced, null, 2);

const footer = `
export const ALL_CHASSIS_GAME_MODES = Object.values(CHASSIS_GAME_MODE_BY_ID);

/** All chassis IDs with dedicated mode sets */
export const CHASSIS_MODE_CHASSIS_IDS = Object.keys(CHASSIS_MODE_MAP);

/**
 * Resolve a chassis mode to a playable course — links fight/football modes to engine courses.
 */
export function resolveChassisModeCourse(mode, allCourses = []) {
  if (!mode) return null;
  mode = applyModeCatalog(mode);
  const attach = (resolved) => ({
    ...resolved,
    isChassisMode: true,
    chassisId: mode.chassisId,
    modeIndex: mode.modeIndex,
    modeSpec: getGameModeSpec(mode.id),
    difficulty: resolved.difficulty || mode.difficulty,
    modeType: resolved.modeType || mode.modeType,
    starRequirements: resolved.starRequirements || mode.starRequirements,
    programmingConcepts: resolved.programmingConcepts || mode.programmingConcepts,
    estMinutes: resolved.estMinutes || mode.estMinutes,
    rewardBadge: resolved.rewardBadge || mode.rewardBadge,
  });

  if (mode.linkedFightCourse) {
    const linked = allCourses.find((c) => c.id === mode.linkedFightCourse);
    if (linked) {
      return attach({
        ...linked,
        ...mode,
        id: mode.id,
        name: mode.name,
        desc: mode.desc,
        shortName: mode.shortName,
        tagline: mode.tagline,
        arenaType: 'robot_fight',
        genre: 'combat',
        cat: 'combat',
      });
    }
  }
  if (mode.linkedFootballCourse) {
    const linked = allCourses.find((c) => c.id === mode.linkedFootballCourse);
    if (linked) {
      return attach({
        ...linked,
        ...mode,
        id: mode.id,
        name: mode.name,
        desc: mode.desc,
        shortName: mode.shortName,
        tagline: mode.tagline,
        arenaType: 'robot_football',
        genre: 'football',
        cat: 'football',
      });
    }
  }

  let resolved = applyChassisArenaEnvironment(mode);
  if (isCarChassis(mode.chassisId)) {
    resolved = applyCarRacingArena(resolved);
  }

  if (resolved.linkedRaceCourse) {
    const linked = allCourses.find((c) => c.id === resolved.linkedRaceCourse);
    if (linked) {
      const racing = resolved.raceTrackLabel || resolved.genre === 'racing';
      return attach({
        ...linked,
        ...resolved,
        id: mode.id,
        ...(racing ? {} : {
          name: mode.name,
          desc: mode.desc,
          shortName: mode.shortName,
          tagline: mode.tagline,
        }),
        genre: 'racing',
        cat: 'racing',
      });
    }
  }

  return attach(resolved);
}

/** Get exactly 10 game modes for a chassis — strict filter */
export function getCoursesForChassis(chassisId, allCourses = []) {
  const key = resolveChassisKey(chassisId);
  const ids = CHASSIS_MODE_MAP[key] || CHASSIS_MODE_MAP.rover;
  return ids
    .map((id) => resolveChassisModeCourse(CHASSIS_GAME_MODE_BY_ID[id], allCourses))
    .filter(Boolean);
}

/** Normalize chassis id — unknown/custom builds use the custom mode set */
export function resolveChassisKey(chassisId) {
  if (!chassisId) return 'custom';
  return CHASSIS_MODE_MAP[chassisId] ? chassisId : 'custom';
}

/** Default (first) mode when chassis is selected */
export function getDefaultChassisCourse(chassisId, allCourses = []) {
  const modes = getCoursesForChassis(chassisId, allCourses);
  return modes[0] || null;
}

/** True if course belongs to this chassis's 10-mode set */
export function isCourseForChassis(courseId, chassisId) {
  const key = resolveChassisKey(chassisId);
  const ids = CHASSIS_MODE_MAP[key] || CHASSIS_MODE_MAP.rover;
  return ids.includes(courseId);
}

export function getChassisIdForCourse(courseId) {
  const mode = CHASSIS_GAME_MODE_BY_ID[courseId];
  return mode?.chassisId || null;
}
`;

const content = `${header}
export const CHASSIS_MODE_MAP = ${mapJson};

export const CHASSIS_GAME_MODE_BY_ID = ${byIdJson};
${footer}`;

fs.writeFileSync(target, content);
console.log(`Synced ${Object.keys(synced).length} chassis game modes → ${target}`);
