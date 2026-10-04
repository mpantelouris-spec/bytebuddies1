/**
 * Work log — what a pupil actually did, so teachers can see real work when marking.
 *
 * Every activity records a small summary under a key:
 *   lesson:<yr>:<idx>      quiz answers, score, attempts
 *   mission:<missionId>    the code they ran, stars, attempts, hints, output
 *   studio:<game>:<level>  their block program, result, stars, a picture of the scene
 * Hand-ins attach the matching record (see workForAssignment).
 */
const KEY = 'bb-work-log';
const MAX_ENTRIES = 120;

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; }
}

export function readWork(key) {
  return readAll()[key] || null;
}

export function recordWork(key, patch) {
  if (!key) return;
  try {
    const all = readAll();
    const next = { ...(all[key] || {}), ...patch, key, updatedAt: new Date().toISOString() };
    all[key] = next;
    const keys = Object.keys(all);
    if (keys.length > MAX_ENTRIES) {
      keys.sort((a, b) => (all[a].updatedAt || '').localeCompare(all[b].updatedAt || ''))
        .slice(0, keys.length - MAX_ENTRIES).forEach((k) => delete all[k]);
    }
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* storage full or blocked — the work still happened */ }
}

/** Most recent records whose key starts with a prefix (e.g. "studio:"). */
export function latestWork(prefix, n = 1) {
  return Object.values(readAll())
    .filter((w) => w.key?.startsWith(prefix))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, n);
}

/** The work record that belongs to an assignment, without any large pictures. */
export function workForAssignment(a) {
  if (!a) return null;
  let w = null;
  if (a.kind === 'lesson' && a.target) w = readWork(`lesson:${a.target.yr}:${a.target.idx}`);
  else if (a.kind === 'mission' && a.target) w = readWork(`mission:${a.target.mission}`);
  else if (a.kind === 'activity' && a.target?.activity === 'studio') w = latestWork('studio:')[0] || null;
  if (!w) return null;
  const { image, ...rest } = w;
  // Firestore rejects undefined values.
  try { return JSON.parse(JSON.stringify(rest)); } catch { return null; }
}

/** A picture that goes with the work (kept apart because it is large). */
export function workImage(a) {
  if (a?.kind === 'activity' && a.target?.activity === 'studio') return latestWork('studio:')[0]?.image || null;
  return null;
}

/** Turn a block list into readable lines, e.g. "Repeat 4 times". */
export function describeBlocks(blocks, labelOf) {
  return (blocks || []).map((b) => {
    const label = labelOf?.(b) || String(b.type || b.id || 'block').replace(/_/g, ' ');
    const params = Object.entries(b.paramValues || b.params || {})
      .filter(([, v]) => v !== '' && v != null && typeof v !== 'object')
      .map(([, v]) => String(v).replace(/_/g, ' '));
    return { indent: b.indent || 0, text: params.length ? `${label} (${params.join(', ')})` : label, color: b.color || null };
  });
}
