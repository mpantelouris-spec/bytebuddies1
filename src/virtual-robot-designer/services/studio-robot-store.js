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

/**
 * Save a robot to My Robots.
 * - A robot is matched by its id, never by its name, so saving a new robot can't
 *   replace a different one that happens to share a name.
 * - Editing a saved robot (same id) updates it in place.
 * - The prebuilt sample robots are never overwritten: saving a changed one keeps
 *   a copy of your version alongside the original.
 * - Names stay as typed; a name that is already taken gets a number ("Zippy 2").
 */
/** Fields that belong to a robot built in Create Studio (not to a pre-built Studio robot). */
export const CREATED_ROBOT_FIELDS = ['build', 'parts', 'addons', 'design', 'workshop', 'freeBuild', 'plateText', 'chassisBuildKey'];

/**
 * Switching to a pre-built robot: drop the created robot's pieces (or it keeps drawing the
 * robot you built) and its saved id (or Save would overwrite your created robot).
 */
export function asPrebuiltRobot(config) {
  const next = { ...config };
  CREATED_ROBOT_FIELDS.forEach((k) => { delete next[k]; });
  delete next.id;
  return next;
}

/** True for robots made in Create Studio (Robot Builder, workshop or designer). */
export const isCreatedRobot = (r) => !!(r && (r.build || r.parts || r.workshop || r.design));

export function saveRobotToLibrary(config, { asNew = false, makeCurrent = true } = {}) {
  const lib = loadRobotLibrary();
  const sampleIds = new Set(SAMPLE_ROBOTS.map((r) => r.id));
  const incomingId = config?.id;
  const known = incomingId != null && lib.some((r) => r.id === incomingId);
  const keepId = !asNew && incomingId != null && !sampleIds.has(incomingId)
    && (known || String(incomingId).startsWith('designed-'));
  const id = keepId ? incomingId : `robot-${Date.now()}`;
  const entry = { ...toLibraryEntry(config, id), id };
  let name = String(config?.name || entry.name || 'My Robot').trim().slice(0, 30) || 'My Robot';
  const taken = new Set(lib.filter((r) => r.id !== id).map((r) => r.name));
  if (taken.has(name)) {
    let k = 2;
    while (taken.has(`${name} ${k}`)) k += 1;
    name = `${name} ${k}`;
  }
  entry.name = name;
  const next = [entry, ...lib.filter((r) => r.id !== id)].slice(0, 60);
  try { localStorage.setItem(ROBOTS_LIB_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  if (makeCurrent) { try { localStorage.setItem(ROBOT_LS_KEY, JSON.stringify(entry)); } catch { /* ignore */ } }
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
