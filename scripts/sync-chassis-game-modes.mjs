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
  blockbot: { icon: '🟩', color: '#4aa8d8' },
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

// Keep the hand-written imports and resolver code already in the target file;
// only the two data objects are regenerated. (Hard-coded copies of that code
// here drifted out of date and silently dropped the Robot Studio arena naming.)
const existing = fs.readFileSync(target, 'utf8');
const MAP_MARKER = 'export const CHASSIS_MODE_MAP = ';
const FOOTER_MARKER = '\nexport const ALL_CHASSIS_GAME_MODES';
const mapAt = existing.indexOf(MAP_MARKER);
const footerAt = existing.indexOf(FOOTER_MARKER);
if (mapAt < 0 || footerAt < 0) {
  throw new Error('chassis-game-modes.js is missing its data markers; restore it from git first.');
}
const header = existing.slice(0, mapAt).trimEnd() + '\n';

const mapJson = JSON.stringify(CHASSIS_MODE_MAP, null, 2);
const byIdJson = JSON.stringify(synced, null, 2);

const footer = existing.slice(footerAt);

const content = `${header}
export const CHASSIS_MODE_MAP = ${mapJson};

export const CHASSIS_GAME_MODE_BY_ID = ${byIdJson};
${footer}`;

fs.writeFileSync(target, content);
console.log(`Synced ${Object.keys(synced).length} chassis game modes → ${target}`);
