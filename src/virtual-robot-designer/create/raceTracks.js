/**
 * Race tracks children build in the Track Maker, raced in the real Robot Studio kart races.
 *
 * A track is a list of road pieces laid one after another from the start line (straights,
 * curves, hairpins, S-bends, hills), then joined back to the start. It becomes a spline that
 * the kart race already knows how to drive: the chosen world's scenery, a new road through it,
 * laps, checkpoint gates, rivals, the minimap and the route guide — like the kart tier races.
 */
import { BIOME_TRACKS } from '../racing/mk-tracks/BiomeTrackRegistry.js';
import { loadCreations, saveCreations } from './creationStore.js';

export const TRACK_WIDTH = 8;
/** Keep tracks inside the part of each world built for racing. */
export const TRACK_BOUNDS = 64;

/** Worlds a track can be built in (the ten kart worlds). */
export const TRACK_WORLDS = BIOME_TRACKS.filter((t) => !t.isCosmicBiome || t.id === 'star_station_01').map((t) => ({
  id: t.arenaType, label: t.label.replace(/ (Speedway|Circuit|Rush|Loop|Rally|Descent|Forge|Gardens|Challenge)$/, ''), emoji: t.emoji, color: t.color,
}));

/**
 * Road pieces. turn: degrees (negative = left), len: road length, rise: height change.
 * Kept gentle enough that every robot (karts, walkers, drones) can follow them.
 */
export const TRACK_PIECES = [
  { id: 'straight', label: 'Straight', len: 12 },
  { id: 'long', label: 'Long straight', len: 24 },
  { id: 'left', label: 'Left turn', turn: -90, radius: 14 },
  { id: 'right', label: 'Right turn', turn: 90, radius: 14 },
  { id: 'gentleLeft', label: 'Gentle left', turn: -45, radius: 22 },
  { id: 'gentleRight', label: 'Gentle right', turn: 45, radius: 22 },
  { id: 'hairpinLeft', label: 'Hairpin left', turn: -180, radius: 11 },
  { id: 'hairpinRight', label: 'Hairpin right', turn: 180, radius: 11 },
  { id: 'sLeft', label: 'S-bend left', s: -1 },
  { id: 'sRight', label: 'S-bend right', s: 1 },
  { id: 'hillUp', label: 'Hill up', len: 16, rise: 2.5 },
  { id: 'hillDown', label: 'Hill down', len: 16, rise: -2.5 },
];
export const PIECE_BY_ID = Object.fromEntries(TRACK_PIECES.map((p) => [p.id, p]));

/** Ready-made tracks to start from. */
export const TRACK_IDEAS = [
  { id: 'oval', name: 'Speedy Oval', emoji: '🏟️', pieces: ['long', 'long', 'hairpinLeft', 'long', 'long', 'hairpinLeft'] },
  { id: 'square', name: 'Square Circuit', emoji: '🟪', pieces: ['long', 'straight', 'left', 'long', 'left', 'long', 'straight', 'left', 'long', 'left'] },
  { id: 'twisty', name: 'Twisty Turns', emoji: '🐍', pieces: ['straight', 'sLeft', 'right', 'long', 'right', 'straight', 'sRight', 'straight', 'right', 'long', 'gentleRight', 'gentleRight'] },
  { id: 'hills', name: 'Hill Hopper', emoji: '⛰️', pieces: ['straight', 'hillUp', 'hillDown', 'straight', 'hairpinLeft', 'long', 'hillUp', 'hillDown', 'hairpinLeft'] },
  { id: 'gp', name: 'Grand Prix', emoji: '🏆', pieces: ['long', 'sLeft', 'long', 'long', 'hairpinRight', 'hillUp', 'straight', 'hillDown', 'gentleLeft', 'straight', 'right', 'gentleLeft', 'hairpinRight'] },
  { id: 'coast', name: 'Coastal Sweep', emoji: '🌊', pieces: ['gentleRight', 'gentleRight', 'sLeft', 'long', 'right', 'sRight', 'straight', 'gentleRight', 'sLeft', 'gentleRight', 'sRight', 'right'] },
];

/**
 * Lay the pieces one after another from the start line (at the origin, heading +x).
 * Returns road samples about every metre: { x, y, z, a (heading), piece (index) }.
 */
export function layPieces(pieces) {
  let x = 0, y = 0, z = 0, a = 0;
  const pts = [{ x, y, z, a, piece: -1 }];
  const step = 1;
  const go = (len, curv, rise, i) => {
    const n = Math.max(1, Math.round(len / step));
    for (let k = 1; k <= n; k++) {
      const ds = len / n;
      a += curv * ds;
      x += Math.cos(a) * ds;
      z += Math.sin(a) * ds;
      // smooth S-shaped climb so hills have no kinks
      if (rise) y += rise * (Math.sin(Math.PI * (k / n - 0.5)) - Math.sin(Math.PI * ((k - 1) / n - 0.5))) / 2;
      pts.push({ x, y, z, a, piece: i });
    }
  };
  pieces.forEach((id, i) => {
    const p = PIECE_BY_ID[id];
    if (!p) return;
    if (p.s) {
      const r = 18, ang = (30 * Math.PI) / 180;
      go(r * ang, (p.s * -1) / r, 0, i);
      go(r * ang, (p.s * 1) / r, 0, i);
    } else if (p.turn) {
      const ang = (Math.abs(p.turn) * Math.PI) / 180;
      go(p.radius * ang, Math.sign(p.turn) / p.radius, 0, i);
    } else {
      go(p.len, 0, p.rise || 0, i);
    }
  });
  return pts;
}

/** A smooth road from the end of the pieces back to the start line (a cubic Hermite curve). */
export function closingRoad(pts) {
  const end = pts[pts.length - 1];
  const start = pts[0];
  const d = Math.hypot(start.x - end.x, start.z - end.z);
  if (d < 1.5) return [];
  const k = Math.max(8, d * 0.75);
  const p0 = [end.x, end.z], p1 = [start.x, start.z];
  const m0 = [Math.cos(end.a) * k, Math.sin(end.a) * k];
  const m1 = [Math.cos(start.a) * k, Math.sin(start.a) * k];
  const n = Math.max(6, Math.round(d * 1.2));
  const out = [];
  for (let i = 1; i < n; i++) {
    const t = i / n, t2 = t * t, t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
    const x = h00 * p0[0] + h10 * m0[0] + h01 * p1[0] + h11 * m1[0];
    const z = h00 * p0[1] + h10 * m0[1] + h01 * p1[1] + h11 * m1[1];
    out.push({ x, y: end.y * (1 - t) + start.y * t, z, a: 0, piece: 'close' });
  }
  return out;
}

/**
 * Smooth a closed loop so pieces flow into each other like a real circuit — no kinks where
 * a straight meets a curve or where the road joins back to the start. Corners keep their shape.
 */
export function smoothLoop(loop, passes = 10) {
  let pts = loop.map((p) => ({ ...p }));
  const n = pts.length;
  if (n < 5) return pts;
  for (let k = 0; k < passes; k++) {
    pts = pts.map((p, i) => {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      return { ...p, x: (a.x + 2 * p.x + b.x) / 4, y: (a.y + 2 * p.y + b.y) / 4, z: (a.z + 2 * p.z + b.z) / 4 };
    });
  }
  return pts;
}

/** The whole loop (pieces + the join back to the start), smoothed and centred on the world's middle. */
export function trackLoop(track) {
  const raw = layPieces(track.pieces || []);
  const loop0 = smoothLoop([...raw, ...closingRoad(raw)]);
  const laid = loop0.slice(0, raw.length);
  const loop = loop0;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  loop.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); });
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  return { laid: laid.map((p) => ({ ...p, x: p.x - cx, z: p.z - cz })), loop: loop.map((p) => ({ ...p, x: p.x - cx, z: p.z - cz })), size: Math.max(maxX - minX, maxZ - minZ) };
}

/** Road length in metres. */
export function loopLength(loop) {
  let L = 0;
  for (let i = 1; i < loop.length; i++) L += Math.hypot(loop[i].x - loop[i - 1].x, loop[i].z - loop[i - 1].z);
  return L + (loop.length > 1 ? Math.hypot(loop[0].x - loop[loop.length - 1].x, loop[0].z - loop[loop.length - 1].z) : 0);
}

/** Can this track be raced? Finds overlaps (the road crossing itself), sharp joins and size. */
export function checkTrack(track) {
  const problems = [];
  const where = [];
  if ((track.pieces || []).length < 3) return { ok: false, problems: ['Add at least 3 pieces of road.'], where, length: 0 };
  const { loop, size } = trackLoop(track);
  // Ending past the start line (heading the same way) makes the join loop backwards
  const raw = layPieces(track.pieces || []);
  const end = raw[raw.length - 1];
  const along = end.x * Math.cos(raw[0].a) + end.z * Math.sin(raw[0].a);
  if (Math.cos(end.a - raw[0].a) > 0.7 && along > 1 && Math.abs(end.z) < 14) problems.push('The track goes past the start line — take a piece away so it ends just before the start.');
  const length = loopLength(loop);
  if (length < 110) problems.push('Make the track longer — add more road pieces.');
  if (size > TRACK_BOUNDS * 2) problems.push('The track is too big for the world — use fewer long straights.');
  // Overlaps: two parts of the road closer than a road's width (ignoring nearby road)
  const pts = loop.filter((_, i) => i % 2 === 0);
  const n = pts.length;
  const gap = Math.ceil(26 / 2);
  for (let i = 0; i < n; i++) {
    for (let j = i + gap; j < n; j++) {
      if (n - j + i < gap) continue;
      if (Math.hypot(pts[i].x - pts[j].x, pts[i].z - pts[j].z) < TRACK_WIDTH * 1.25) { where.push(pts[i], pts[j]); }
    }
  }
  if (where.length) problems.push('The road runs into itself — move a piece so the roads don’t touch.');
  // A join back to the start that has to bend too sharply
  const close = loop.filter((p) => p.piece === 'close');
  for (let i = 2; i < close.length; i++) {
    const a1 = Math.atan2(close[i - 1].z - close[i - 2].z, close[i - 1].x - close[i - 2].x);
    const a2 = Math.atan2(close[i].z - close[i - 1].z, close[i].x - close[i - 1].x);
    let d = Math.abs(a2 - a1); if (d > Math.PI) d = 2 * Math.PI - d;
    if (d > 0.35) { problems.push('The road back to the start bends too sharply — end the track facing back towards the start.'); break; }
  }
  return { ok: !problems.length, problems, where, length: Math.round(length) };
}

/** The loop as a race spline: points about 6 m apart, closed by repeating the first point. */
export function trackSpline(track) {
  const { loop } = trackLoop(track);
  const out = [];
  let acc = 6;
  for (let i = 0; i < loop.length; i++) {
    if (i > 0) acc += Math.hypot(loop[i].x - loop[i - 1].x, loop[i].z - loop[i - 1].z);
    if (acc >= 6) { out.push({ x: +loop[i].x.toFixed(2), y: +loop[i].y.toFixed(2), z: +loop[i].z.toFixed(2) }); acc = 0; }
  }
  // The race drives towards -z at the start like the built-in tracks do; ours starts heading +x,
  // which the race follows from the spline itself.
  out.push({ ...out[0] });
  return out;
}

/** A random circuit that's ready to race (a full turn of corners, varied pieces, no overlaps). */
export function surpriseTrack(rand = Math.random) {
  const pool = [
    ['straight', 3], ['long', 3], ['right', 3], ['gentleRight', 3], ['hairpinRight', 1.2],
    ['sLeft', 1.6], ['sRight', 1.6], ['left', 1], ['gentleLeft', 1.4], ['hill', 0.8],
  ];
  const total = pool.reduce((a, [, w]) => a + w, 0);
  const pick = () => { let r = rand() * total; for (const [id, w] of pool) { r -= w; if (r <= 0) return id; } return 'straight'; };
  for (let attempt = 0; attempt < 600; attempt++) {
    const pieces = [];
    let turn = 0;
    while (Math.abs(turn - 360) > 0.5 && pieces.length < 22) {
      const id = pick();
      if (id === 'hill') { pieces.push('hillUp', 'straight', 'hillDown'); continue; }
      const t = PIECE_BY_ID[id].turn || 0;
      if (turn + t > 360 || turn + t < -90) continue;
      pieces.push(id); turn += t;
    }
    if (Math.abs(turn - 360) > 0.5) continue;
    const kinds = new Set(pieces).size;
    const c = checkTrack({ pieces });
    if (c.ok && kinds >= 5 && c.length >= 220 && c.length <= 460) return pieces;
  }
  return TRACK_IDEAS[0].pieces.slice();
}

/**
 * "Fix it for me": the smallest change that makes a track raceable — add straights to make it
 * longer, or add / take away a piece so the road ends facing the start and stops crossing itself.
 * Tries small edits first so the child's own design is kept. Returns null if nothing simple works.
 */
export function fixTrack(pieces) {
  const ok = (p) => checkTrack({ pieces: p }).ok;
  if (ok(pieces)) return pieces;
  const turn = pieces.reduce((t, id) => t + (PIECE_BY_ID[id]?.turn || 0), 0);
  const edits = [];
  const add = (p) => edits.push(p);
  // 1. Make it longer with straights in a few places
  const spots = [0, Math.floor(pieces.length / 2), pieces.length];
  ['long', 'straight'].forEach((s) => spots.forEach((at) => add([...pieces.slice(0, at), s, ...pieces.slice(at)])));
  spots.forEach((a) => spots.forEach((b) => { if (b >= a) add([...pieces.slice(0, a), 'long', ...pieces.slice(a, b), 'long', ...pieces.slice(b)]); }));
  // 2. Finish the full turn of corners so the road heads back to the start
  const need = 360 - (((turn % 360) + 360) % 360);
  const finish = { 90: ['right'], 180: ['hairpinRight'], 270: ['right', 'hairpinRight'], 45: ['gentleRight'], 135: ['right', 'gentleRight'], 225: ['hairpinRight', 'gentleRight'], 315: ['hairpinRight', 'right', 'gentleRight'] }[need];
  if (finish) {
    add([...pieces, ...finish]);
    add([...pieces, 'long', ...finish]);
    add([...pieces, 'long', ...finish, 'long']);
    add(['long', ...pieces, 'long', ...finish]);
    add(['long', ...pieces, 'long', ...finish, 'long']);
  }
  // 3. Take one piece away
  pieces.forEach((_, i) => add(pieces.filter((__, j) => j !== i)));
  for (const p of edits) if (p.length >= 3 && ok(p)) return p;
  // 4. Two edits: straights around a finished turn
  if (finish) for (const p of edits.slice(-5)) for (const at of [0, Math.floor(p.length / 2), p.length]) { const q = [...p.slice(0, at), 'long', ...p.slice(at)]; if (ok(q)) return q; }
  return null;
}

export function blankTrack() {
  return { id: `track-${Date.now()}`, name: 'My Race Track', emoji: '🏁', world: 'sunset_cove_01', laps: 2, gates: 3, pieces: ['long', 'right', 'long', 'right', 'long', 'right'], items: [], rivals: 3, rivalPace: 'normal', custom: true };
}

/** Things a child can put on their road, one lane at a time. */
export const TRACK_ITEMS = [
  { id: 'bumper', label: 'Bumper', emoji: '🚧', tip: 'Blocks a lane: code your kart to change lane round it.' },
  { id: 'boost', label: 'Boost pad', emoji: '⚡', tip: 'Drive over it for a burst of speed.' },
  { id: 'ramp', label: 'Ramp', emoji: '🛹', tip: 'Your kart jumps and speeds up a little.' },
];
export const MAX_TRACK_ITEMS = 24;
export const LANES = [[-1, 'Left'], [0, 'Middle'], [1, 'Right']];

/** Distance round the loop (0–1) of each loop point, measured from the start line. */
export function loopFractions(loop) {
  const acc = [0];
  for (let i = 1; i < loop.length; i++) acc.push(acc[i - 1] + Math.hypot(loop[i].x - loop[i - 1].x, loop[i].z - loop[i - 1].z));
  const total = acc[acc.length - 1] + Math.hypot(loop[0].x - loop[loop.length - 1].x, loop[0].z - loop[loop.length - 1].z) || 1;
  return acc.map((d) => d / total);
}

/**
 * Where an item sits in Track Maker coordinates: t round the lap, lane −1/0/1.
 * laneStep is the race's own lane spacing (KartRivalsKit), scaled back to the editor's size.
 */
export function itemPosition(loop, fr, t, lane, laneStep) {
  let i = fr.findIndex((f) => f >= t);
  if (i < 0) i = loop.length - 1;
  const p = loop[i], q = loop[(i + 1) % loop.length];
  const dx = q.x - p.x, dz = q.z - p.z, L = Math.hypot(dx, dz) || 1;
  return { x: p.x + (-dz / L) * lane * laneStep, y: p.y || 0, z: p.z + (dx / L) * lane * laneStep, a: Math.atan2(dz, dx) };
}

/** Share a track with a friend as a short code (and read one back). */
export function encodeTrack(t) {
  const data = { n: t.name, e: t.emoji, w: t.world, l: t.laps, g: t.gates, p: t.pieces, i: (t.items || []).map((it) => [it.type, +it.t.toFixed(3), it.lane]), r: t.rivals ?? 3, s: t.rivalPace || 'normal' };
  return `BBT-${btoa(unescape(encodeURIComponent(JSON.stringify(data))))}`;
}
export function decodeTrack(code) {
  try {
    const raw = String(code || '').trim().replace(/^BBT-/, '');
    const d = JSON.parse(decodeURIComponent(escape(atob(raw))));
    const pieces = (d.p || []).filter((id) => PIECE_BY_ID[id]);
    if (pieces.length < 3) return null;
    return {
      ...blankTrack(), name: String(d.n || 'Shared track').slice(0, 24), emoji: d.e || '🏁',
      world: TRACK_WORLDS.some((w) => w.id === d.w) ? d.w : TRACK_WORLDS[0].id,
      laps: Math.max(1, Math.min(3, d.l || 2)), gates: Math.max(2, Math.min(5, d.g || 3)), pieces,
      items: (d.i || []).filter(([type]) => TRACK_ITEMS.some((x) => x.id === type)).slice(0, MAX_TRACK_ITEMS).map(([type, t, lane]) => ({ type, t: Math.max(0, Math.min(1, +t || 0)), lane: Math.max(-1, Math.min(1, Math.round(+lane || 0))) })),
      rivals: Math.max(0, Math.min(3, d.r ?? 3)), rivalPace: ['slow', 'normal', 'fast'].includes(d.s) ? d.s : 'normal',
    };
  } catch { return null; }
}

/** A Track Maker track → a kart race the lab already knows how to run. */
export function trackToRaceCourse(track) {
  const scenery = BIOME_TRACKS.find((t) => t.arenaType === track.world) || BIOME_TRACKS[0];
  const spline = trackSpline(track);
  const { length } = checkTrack(track);
  const laps = Math.max(1, Math.min(5, track.laps || 2));
  const gates = Math.max(2, Math.min(6, track.gates || 3));
  const targetTime = Math.round((length * laps) / 4.2 + 25);
  const id = `custom-track-${track.id}`;
  const name = track.name || 'My Race Track';
  const goal = `Race ${laps} lap${laps === 1 ? '' : 's'} of ${name}, through every checkpoint gate.`;
  const raceTrack = {
    ...scenery,
    id, courseId: id, label: name, name, story: goal, laps, targetTime, strictTargetTime: targetTime,
    checkpointTs: Array.from({ length: gates }, (_, i) => (i + 1) / (gates + 1)),
    difficulty: 1, tier: 'Easy', visualId: `${scenery.arenaType}:custom:${track.id}`,
    spline, customRoad: true, isExpandedCarTrack: true, isCustomTrack: true,
    // The child's own bumpers, boost pads, ramps and rival karts
    raceItems: (track.items || []).slice(0, MAX_TRACK_ITEMS), rivalCount: track.rivals ?? 3, rivalPace: track.rivalPace || 'normal',
  };
  return {
    id, name, shortName: name, catalogName: name,
    desc: goal, tagline: `${scenery.label} · made by you`,
    chassisId: 'rover', modeIndex: 11, modeNumber: 11,
    isChassisMode: true, isExpandedMode: true, isCustomTrack: true,
    difficulty: 'Easy', modeType: 'Race', estMinutes: 6,
    starRequirements: { one: `Finish ${name}`, two: 'Finish without restarting the run', three: 'Use a Repeat block to keep the program short' },
    arenaType: scenery.arenaType, linkedRaceCourse: id, expandedCarTrack: raceTrack,
    raceVisualId: raceTrack.visualId, genre: 'racing', cat: 'racing',
    raceTrackLabel: name, environmentId: scenery.arenaType, environmentName: name, environmentEmoji: track.emoji || scenery.emoji,
    physics: 'racing_spline', camera: 'race_chase', color: scenery.color, icon: track.emoji || '🏁',
    missionObjective: goal, winCondition: goal,
  };
}

const MY_TRACKS = 'bb-my-race-tracks';
/** Each pupil's own race tracks (kept per account on this device). */
export function loadMyTracks() { return loadCreations(MY_TRACKS); }
export function saveMyTracks(list) { saveCreations(MY_TRACKS, list); }
