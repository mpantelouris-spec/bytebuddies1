/**
 * Sea courses 11–50 for the Sub Drone. Same rules as the sky courses: each
 * course IS the program that swims it (see data/sea-courses.js), and only
 * programs that pass the checks are kept.
 */
import { swimSeaProgram } from '../../src/virtual-robot-designer/data/sea-courses.js';
import { rng, writeData, TIERS } from './common.mjs';

const R = (name, theme, kind = 'rings') => ({ name, theme, kind });

// kind: rings | scan (Scan here) | collect (Pick up) | lights (Light up)
const PLANS = {
  submarine: [
    R('Bubble Ring Start', 'reef'), R('Clownfish Count', 'reef', 'scan'), R('Kelp Gate Glide', 'kelp'),
    R('Turtle Hello', 'turtle', 'scan'), R('Wreck Porthole Peek', 'wreck'), R('Glow Worm Lights', 'cave', 'lights'),
    R('Shell Collector', 'cleanup', 'collect'), R('Current Ride', 'current'), R('Treasure Map Start', 'treasure', 'scan'),
    R('Vent Bubble Rings', 'vents'),
    R('Reef Fish Census', 'reef', 'scan'), R('Kelp Maze Lights', 'kelp', 'lights'), R('Turtle Nest Patrol', 'turtle', 'scan'),
    R('Wreck Cargo Hunt', 'wreck', 'collect'), R('Crystal Cave Rings', 'cave'), R('Current Crossing', 'current'),
    R('Sunken Coins', 'treasure', 'collect'), R('Bottle Clean-Up', 'cleanup', 'collect'), R('Vent Sample Scan', 'vents', 'scan'),
    R('Lantern Reef Night', 'reef', 'lights'),
    R('Deep Reef Survey', 'reef', 'scan'), R('Kelp Forest Slalom', 'kelp'), R('Sea Turtle Escort', 'turtle'),
    R('Wreck Room Mapping', 'wreck', 'scan'), R('Cave Lantern Trail', 'cave', 'lights'), R('Riptide Gates', 'current'),
    R('Pirate Chest Trail', 'treasure', 'collect'), R('Net Rescue', 'cleanup', 'collect'), R('Smoker Field Scan', 'vents', 'scan'),
    R('Coral Restoration', 'reef', 'collect'),
    R('Great Reef Census', 'reef', 'scan'), R('Kelp Labyrinth', 'kelp'), R('Turtle Migration Route', 'turtle', 'scan'),
    R('Ghost Ship Expedition', 'wreck', 'collect'), R('Abyss Light Chain', 'cave', 'lights'), R('Current Master', 'current'),
    R('Sunken City Treasure', 'treasure', 'collect'), R('Ocean Clean-Up Marathon', 'cleanup', 'collect'),
    R('Hydrothermal Survey', 'vents', 'scan'), R('Ocean Explorer Grand Finale', 'finale'),
  ],
};

const ACTION = { scan: 'scan_here', collect: 'pick_up', lights: 'light_up' };
const TIER_SHAPE = [
  { moves: [3, 5], stations: [2, 3], dives: [0, 1], depth: [2, 3], repeat: 0, minTurns: 1 },
  { moves: [6, 8], stations: [3, 4], dives: [1, 2], depth: [2, 3], repeat: 0.5, minTurns: 2 },
  { moves: [9, 11], stations: [4, 5], dives: [2, 3], depth: [3, 4], repeat: 0.6, minTurns: 3 },
  { moves: [12, 15], stations: [5, 6], dives: [3, 4], depth: [3, 4], repeat: 0.7, minTurns: 5 },
];
const ANGLES = [45, 90, 90];

function makeProgram(shape, plan, r, size) {
  let depth = r.int(shape.depth[0], shape.depth[1]);
  const out = [`D${depth}`];
  const want = plan.kind === 'rings' ? 0 : r.int(shape.stations[0], shape.stations[1]);
  let stations = 0; let dives = 0; let last = null;
  const leg = () => `F${r.pick([1, 1, 2])}`;
  const turn = () => {
    let d = r() < 0.5 ? 'R' : 'L';
    if (last && r() < 0.55) d = last === 'R' ? 'L' : 'R';
    last = d; return `${d}${r.pick(ANGLES)}`;
  };
  const station = () => { out.push('A'); stations++; };
  out.push('F2');
  if (r() < shape.repeat) {
    const times = Math.min(4, 2 + Math.floor(size / 5));
    const dir = r() < 0.5 ? 'R' : 'L'; const flip = dir === 'R' ? 'L' : 'R';
    const zig = r() < 0.6;
    for (let k = 0; k < times; k++) {
      out.push('F1');
      if (plan.kind !== 'rings' && stations < want) station();
      out.push(`${zig && k % 2 ? flip : dir}${zig ? 90 : 45}`);
    }
  }
  let moves = out.filter((t) => t !== 'A').length - 1;
  while (moves < size) {
    const room = size - moves; const roll = r();
    if (dives < shape.dives[1] && roll < 0.22 && room >= 2 && depth < 8) {
      depth = Math.min(8, depth + 2); out.push(`D${depth}`, leg()); dives++; moves += 2;
    } else if (roll < 0.62 && room >= 2) { out.push(turn(), leg()); moves += 2; } else { out.push(leg()); moves += 1; }
    if (plan.kind !== 'rings' && stations < want && r() < 0.6) station();
  }
  while (plan.kind !== 'rings' && stations < want) { out.push(leg()); station(); }
  if (!/^F/.test(out[out.length - 1])) out.push('F1');
  // tidy: merge legs, separate turns
  const t = [];
  for (const tok of out) {
    const prev = t[t.length - 1];
    if (tok[0] === 'F' && prev?.[0] === 'F' && t.length > 2 && Number(prev.slice(1)) + Number(tok.slice(1)) <= 3) { t[t.length - 1] = `F${Number(prev.slice(1)) + Number(tok.slice(1))}`; continue; }
    if (/^[RL]/.test(tok) && /^[RL]/.test(prev || '')) t.push('F1');
    t.push(tok);
  }
  return t;
}

function check(tokens, plan) {
  const swum = swimSeaProgram(tokens);
  const pts = swum.path;
  if (pts.some((p) => p.y < -9 || p.y > 1)) return 'depth';
  const xs = pts.map((p) => p.x); const zs = pts.map((p) => p.z);
  if (Math.max(...xs) - Math.min(...xs) > 200 || Math.max(...zs) - Math.min(...zs) > 200) return 'too big';
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  for (let i = 0; i < pts.length; i += 4) for (let j = i + 4; j < pts.length; j += 4) {
    if (cum[j] - cum[i] < 40) continue;
    if (Math.hypot(pts[i].x - pts[j].x, pts[i].z - pts[j].z) < 14) return 'crosses';
  }
  const s0 = pts[0];
  const marks = plan.kind === 'rings' ? swum.rings.filter((m) => Math.hypot(m.x - s0.x, m.z - s0.z) > 10) : swum.stations;
  for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) {
    if (Math.hypot(marks[i].x - marks[j].x, marks[i].z - marks[j].z) < 10) return 'overlap';
  }
  if (plan.kind === 'rings' && marks.length < 3) return 'few rings';
  if (plan.kind !== 'rings' && marks.some((m) => Math.hypot(m.x - s0.x, m.z - s0.z) < 9)) return 'on dock';
  return null;
}

function starterDrop(tokens, tierIndex, slot) {
  const moves = tokens.filter((t, i) => i > 0 && t !== 'A').length;
  return [slot < 5 ? 1 : 2, Math.max(2, Math.round(moves * 0.45)), Math.max(3, Math.round(moves * 0.7)), Math.max(4, moves - 1)][tierIndex];
}

export function buildSea() {
  const out = {}; const report = [];
  for (const [chassisId, plans] of Object.entries(PLANS)) {
    const seen = new Set();
    out[chassisId] = plans.map((plan, i) => {
      const tierIndex = Math.floor(i / 10); const slot = i % 10; const shape = TIER_SHAPE[tierIndex];
      const size = Math.round(shape.moves[0] + (shape.moves[1] - shape.moves[0]) * (slot / 9));
      for (let attempt = 0; attempt < 4000; attempt++) {
        const r = rng(`sea:${chassisId}:${i}:${attempt}`);
        const tokens = makeProgram(shape, plan, r, size);
        const program = tokens.join(' ');
        if (seen.has(program)) continue;
        if (tokens.filter((t) => /^[RL]/.test(t)).length < shape.minTurns) continue;
        if (check(tokens, plan)) continue;
        seen.add(program);
        const swum = swimSeaProgram(tokens);
        return {
          mode: 11 + i, name: plan.name, tier: TIERS[tierIndex], theme: plan.theme, kind: plan.kind,
          action: ACTION[plan.kind] || null, program, drop: starterDrop(tokens, tierIndex, slot),
          markers: plan.kind === 'rings' ? Math.min(8, swum.rings.filter((m) => Math.hypot(m.x - swum.path[0].x, m.z - swum.path[0].z) > 10).length) : swum.stations.length,
        };
      }
      throw new Error(`No valid sea course for #${i + 11} ${plan.name}`);
    });
    report.push(out[chassisId].map((l) => `${l.mode} ${l.tier} ${l.kind} ${l.name}: ${l.program}`).join('\n'));
  }
  const size = writeData('sea-tiers.js', 'Sea courses for modes 11–50 (Sub Drone). Each program is the solution.', { SEA_TIER_COURSES: out });
  return { report, size };
}

if (process.argv[1]?.endsWith('build-sea.mjs')) {
  const { report, size } = buildSea();
  console.log(report.join('\n'), '\nbytes', size);
}
