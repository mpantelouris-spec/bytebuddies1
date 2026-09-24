/**
 * Persisted robot library for Robot Studio (My Robots + Save Design).
 */
import { SAMPLE_ROBOTS, CHASSIS_DATA, normalizeRobotBuildConfig } from './studio-robot-builder.js';

export const ROBOTS_LIB_KEY = 'bb-studio-robots';
export const ROBOT_LS_KEY = 'bb-studio-robot';

function chassisMeta(chassisId) {
  return CHASSIS_DATA.find((c) => c.id === chassisId) || CHASSIS_DATA[0];
}

function toLibraryEntry(config, id = Date.now()) {
  const normalized = normalizeRobotBuildConfig(config);
  const ch = chassisMeta(normalized.chassisId);
  return {
    id,
    ...normalized,
    icon: ch.icon || '🤖',
    xp: config.xp || 0,
    wheels: normalized.movementId === 'wheels' ? 4 : normalized.movementId === 'tracks' ? 2 : 0,
    bgGrad: config.bgGrad,
  };
}

export function loadRobotLibrary() {
  try {
    const saved = JSON.parse(localStorage.getItem(ROBOTS_LIB_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch { /* ignore */ }
  // Seed from current studio robot if present
  try {
    const current = JSON.parse(localStorage.getItem(ROBOT_LS_KEY));
    if (current?.name) return [toLibraryEntry(current, 1), ...SAMPLE_ROBOTS.filter((r) => r.id !== 1)];
  } catch { /* ignore */ }
  return SAMPLE_ROBOTS;
}

export function saveRobotToLibrary(config) {
  const entry = toLibraryEntry(config);
  const existing = loadRobotLibrary().filter((r) => r.id !== entry.id && r.name !== entry.name);
  const next = [entry, ...existing].slice(0, 24);
  try { localStorage.setItem(ROBOTS_LIB_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  try { localStorage.setItem(ROBOT_LS_KEY, JSON.stringify(entry)); } catch { /* ignore */ }
  return { entry, library: next };
}

export function filterRobotsByTag(robots, filter) {
  if (!filter || filter === 'all') return robots;
  return robots.filter((r) => {
    const ch = chassisMeta(r.chassisId);
    if (filter === 'fast') return ch.speed >= 70;
    if (filter === 'heavy') return ch.durability >= 70;
    if (filter === 'smart') return (r.sensors?.length || 0) >= 2 || (r.aiId != null);
    return true;
  });
}
