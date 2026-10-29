/**
 * Rover races 11–50 — none of them repeats a track Rover already has.
 *
 *  Easy, Medium, Hard (30 races): one of the ten Rover worlds, with a brand-new
 *  road layout made for that race and its own lighting. Roads get twistier each
 *  tier: gentle loops → S-bends → hairpins.
 *  Advanced (10 races): classic circuits Rover's other modes don't use, where they
 *  look different from each other; any slot left over gets a new road instead.
 *
 * Every road is checked: it never crosses itself, the parts of the loop stay well
 * apart, and every corner is wide enough to drive. Target times come from each
 * road's real length, at the pace the world's own race expects.
 */
import { BIOME_TRACKS } from '../../src/virtual-robot-designer/racing/mk-tracks/BiomeTrackRegistry.js';
import { MK_TRACKS, getMKTrack } from '../../src/virtual-robot-designer/racing/mk-tracks/MKTrackRegistry.js';
import { rng, writeData, TIERS } from './common.mjs';

// One name per world per tier: [Easy, Medium, Hard]
const WORLD_NAMES = {
  sunset_cove_01: ['Seaside Loop', 'Lighthouse S-Bends', 'Cliff Hairpins'],
  candy_carnival_01: ['Lollipop Lap', 'Candy Floss Curves', 'Gumdrop Hairpins'],
  neon_metro_01: ['City Block Cruise', 'Night Market Bends', 'Skyline Switchbacks'],
  cloud_citadel_01: ['Cloud Ring Run', 'Castle Wall Curves', 'Tower Top Twist'],
  jungle_ruins_01: ['Temple Trail', 'Vine Valley Bends', 'Ruins Hairpins'],
  frost_peak_01: ['Snowy Loop', 'Icicle S-Bends', 'Glacier Zigzag'],
  lava_foundry_01: ['Foundry Lap', 'Molten Bends', 'Furnace Switchbacks'],
  star_station_01: ['Starlight Loop', 'Orbit Bends', 'Meteor Hairpins'],
  fairy_glen_01: ['Mushroom Meadow Lap', 'Firefly Bends', 'Moonlit Maze'],
  thunder_ridge_01: ['Ridge Runner', 'Storm Valley Bends', 'Lightning Hairpins'],
};
// Classic circuits Rover's other modes don't use
const ADVANCED_PREFERRED = ['luigi_circuit', 'moo_moo_meadows', 'mario_circuit', 'peach_castle', 'mushroom_canyon', 'bowser_castle', 'bone_dry_desert', 'piranha_plant_slide', 'grumble_volcano', 'cheese_land'];
// Two roads count as the same course when their shapes differ by less than this (0 = identical)
const SAME_SHAPE = 0.10;

// Shape signature: the loop, resampled, centred and scaled, so only its outline is compared
function signature(pts) {
  const p = pts.map((q) => [q.x, q.z]);
  const cx = p.reduce((a, q) => a + q[0], 0) / p.length, cz = p.reduce((a, q) => a + q[1], 0) / p.length;
  const r = p.map(([x, z]) => [x - cx, z - cz]);
  const sc = Math.sqrt(r.reduce((a, [x, z]) => a + x * x + z * z, 0) / r.length) || 1;
  const n = r.map(([x, z]) => [x / sc, z / sc]);
  const L = []; let tot = 0;
  for (let i = 1; i < n.length; i++) { tot += Math.hypot(n[i][0] - n[i - 1][0], n[i][1] - n[i - 1][1]); L.push(tot); }
  const out = [];
  for (let k = 0; k < 64; k++) {
    const t = (k / 64) * tot; let i = 0; while (i < L.length && L[i] < t) i++;
    const a = n[i] || n[n.length - 1], b = n[i + 1] || a; const seg = (L[i] - (L[i - 1] || 0)) || 1; const f = i ? (t - L[i - 1]) / seg : 0;
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  return out;
}
// Smallest average gap between two signatures, over every start point and both directions
function shapeGap(A, B) {
  let best = Infinity;
  for (const rev of [false, true]) {
    const Bb = rev ? [...B].reverse() : B;
    for (let s = 0; s < B.length; s += 4) {
      let d = 0;
      for (let i = 0; i < A.length; i++) { const j = (i + s) % B.length; d += Math.hypot(A[i][0] - Bb[j][0], A[i][1] - Bb[j][1]); }
      best = Math.min(best, d / A.length);
    }
  }
  return best;
}
const tooClose = (sig, taken) => taken.some((t) => shapeGap(sig, t) < SAME_SHAPE);

// The classic circuits Advanced uses: only ones that look different from each other.
// Slots with no classic circuit left get a new road (see below).
const ADVANCED = [];
const advancedSigs = [];
for (const id of [...ADVANCED_PREFERRED, ...MK_TRACKS.map((m) => m.arenaType)]) {
  if (ADVANCED.length === 10 || ADVANCED.includes(id)) continue;
  const sig = signature(getMKTrack(id).spline);
  if (!tooClose(sig, advancedSigs)) { ADVANCED.push(id); advancedSigs.push(sig); }
}

const TIER_RACE = [
  { laps: 1, gates: 3, time: 1.5, difficulty: 1, waves: [2, 2], amp: [0.10, 0.16] },
  { laps: 2, gates: 5, time: 1.25, difficulty: 2, waves: [3, 4], amp: [0.16, 0.22] },
  { laps: 3, gates: 7, time: 1.05, difficulty: 3, waves: [4, 5], amp: [0.20, 0.26] },
  { laps: 3, gates: 9, time: 0.92, difficulty: 4 },
];
const MAX_RACE_SECONDS = 360; // about 6 minutes
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

const lengthOf = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z) : 0), 0);

/** A closed road: a wavy loop around the world centre (a polar curve can't cross itself). */
function makeRoad(r, tier, bounds) {
  const { waves, amp } = TIER_RACE[tier];
  const parts = Array.from({ length: r.int(waves[0], waves[1]) }, (_, k) => ({ k: 2 + k + (k > 1 ? r.int(0, 1) : 0), a: amp[0] + r() * (amp[1] - amp[0]), p: r() * Math.PI * 2 }));
  const N = 24 + tier * 4;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const th = Math.PI / 2 - (i / N) * Math.PI * 2; // start at the top, drive clockwise
    let rad = 1;
    parts.forEach(({ k, a, p }) => { rad += a * Math.sin(k * th + p); });
    pts.push({ x: Math.round(Math.cos(th) * rad * bounds.x * 10) / 10, y: 0, z: Math.round(Math.sin(th) * rad * bounds.z * 10) / 10 });
  }
  pts[pts.length - 1] = { ...pts[0] };
  return pts;
}

function roadOk(pts) {
  // Corners wide enough to drive, and no part of the loop runs close to another
  const n = pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
    const ab = Math.hypot(b.x - a.x, b.z - a.z), bc = Math.hypot(c.x - b.x, c.z - b.z), ac = Math.hypot(c.x - a.x, c.z - a.z);
    const cross = Math.abs((b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x));
    const radius = cross < 1e-6 ? Infinity : (ab * bc * ac) / (2 * cross);
    if (radius < 9) return false;
  }
  for (let i = 0; i < n; i++) for (let j = i + 3; j < n; j++) {
    if (i < 3 && j > n - 4 + i) continue; // neighbours across the start line
    if (Math.hypot(pts[i].x - pts[j].x, pts[i].z - pts[j].z) < 18) return false;
  }
  return true;
}

export function buildKart() {
  const rover = [];
  const seen = new Set();
  // Every race's shape is checked against all the others, starting with the classic circuits
  const taken = [...advancedSigs];
  TIERS.forEach((tier, t) => {
    const race = TIER_RACE[t];
    for (let slot = 0; slot < 10; slot++) {
      let scenery; let spline = null; let name;
      const classic = t === 3 ? ADVANCED[slot] : null;
      if (!classic) {
        // Tiers 1–3, and Advanced slots without a distinct classic circuit: a new road in one of the Rover worlds
        const roadTier = t < 3 ? t : 2;
        scenery = BIOME_TRACKS[(slot + t * 3) % 10];
        name = t < 3 ? WORLD_NAMES[scenery.arenaType][t] : `${scenery.label} Grand Prix`;
        const xs = scenery.spline.map((p) => Math.abs(p.x)); const zs = scenery.spline.map((p) => Math.abs(p.z));
        const bounds = { x: Math.max(40, Math.min(52, Math.max(...xs) * 0.92)), z: Math.max(30, Math.min(44, Math.max(...zs) * 0.92)) };
        for (let attempt = 0; attempt < 5000 && !spline; attempt++) {
          const road = makeRoad(rng(`rover:${t}:${slot}:${attempt}`), roadTier, bounds);
          const key = road.map((p) => `${p.x},${p.z}`).join(';');
          if (!seen.has(key) && roadOk(road)) {
            const sig = signature(road);
            if (!tooClose(sig, taken)) { spline = road; seen.add(key); taken.push(sig); }
          }
        }
        if (!spline) throw new Error(`No road for ${name}`);
      } else {
        scenery = getMKTrack(classic);
        name = `${scenery.label} Master Cup`;
      }
      // Pace: the world's own race sets seconds per unit of road
      const pace = (scenery.targetTime || 150) / (scenery.laps || 2) / lengthOf(scenery.spline);
      const lapTime = lengthOf(spline || scenery.spline) * pace * race.time;
      let laps = race.laps;
      while (laps > 1 && lapTime * laps > MAX_RACE_SECONDS) laps--;
      const targetTime = Math.max(30, Math.round(lapTime * laps));
      rover.push({
        mode: 11 + t * 10 + slot, name, tier, track: scenery.arenaType, trackLabel: scenery.label,
        ...(spline ? { spline } : {}),
        mood: t < 3 ? t * 2 + (slot % 2) : 6 + (slot % 2),
        laps, gates: race.gates + (slot >= 5 ? 1 : 0), targetTime, difficulty: race.difficulty,
        goal: `Race ${laps} ${laps === 1 ? 'lap' : 'laps'} ${spline ? `of a new ${['loop', 'S-bend circuit', 'hairpin circuit', 'hairpin circuit'][t]} in ${scenery.label}` : `of ${scenery.label}`}, through every checkpoint gate, in under ${clock(targetTime)}.`,
      });
    }
  });
  const size = writeData('kart-tiers.js', 'Rover races for modes 11–50: new road layouts through the Rover worlds (Easy–Hard)\nand the classic circuits Rover had not raced (Advanced). No race repeats an existing track.', { KART_TIER_RACES: { rover } });
  return { report: rover.map((r) => `${r.mode} ${r.tier} ${r.name}: ${r.trackLabel}${r.spline ? ` (new road ${Math.round(lengthOf(r.spline))}u)` : ''}, ${r.laps} laps, ${r.targetTime}s, mood ${r.mood}`), size };
}

if (process.argv[1]?.endsWith('build-kart.mjs')) {
  const { report, size } = buildKart();
  console.log(report.join('\n'), '\nbytes', size);
}
