/**
 * Sky courses 11–50 for the Drone, Racing Drone and Jet Explorer.
 *
 * Like the original ten (data/sky-courses.js), every course IS the block program
 * that flies it, so it can always be solved with the blocks kids have. Each plan
 * row below names the course, its world and its job; the builder writes a program
 * of the right size for the tier and keeps only programs that pass the checks:
 * rings and stations never overlap, the route never crosses back over itself,
 * height stays sensible and the course fits its world.
 */
import { flySkyProgram, SKY_SPAWN_Y } from '../../src/virtual-robot-designer/data/sky-courses.js';
import { rng, writeData, TIERS } from './common.mjs';

// kind: rings (fly through) | deliver (Drop package) | photo (Take photo) | lights (Light up) | land (Land)
const R = (name, theme, kind = 'rings', extra = {}) => ({ name, theme, kind, ...extra });

const PLANS = {
  drone: [
    // Easy
    R('Meadow Hoop Hop', 'meadow'), R('Picnic Parcel Drop', 'meadow', 'deliver', { balloons: true }),
    R('Rainbow Arch Glide', 'rainbow'), R('Snowy Peak Photo', 'snow', 'photo'),
    R('Island Hop Landing', 'skyislands', 'land'), R('Savanna Spotter', 'savanna', 'photo'),
    R('Lantern Garden', 'festival', 'lights'), R('Windmill Weave', 'meadow', 'rings', { windsocks: true }),
    R('Beach Postbox', 'beach', 'deliver', { balloons: true }), R('Star Station Hello', 'space'),
    // Medium
    R('Seaside Balloon Post', 'ocean', 'deliver', { balloons: true }), R('Rainbow Ladder', 'rainbow'),
    R('Salt Flat Supply Drop', 'saltflat', 'deliver'), R('Island Chain Landing', 'skyislands', 'land'),
    R('Giraffe Watch', 'savanna', 'photo'), R('Festival Fireflies', 'festival', 'lights'),
    R('Harbour Parcel Run', 'harbour', 'deliver'), R('Forest Canopy Count', 'forest', 'photo'),
    R('Airshow Practice Loop', 'airshow'), R('Moon Dock Approach', 'space'),
    // Hard
    R('Mountain Medicine Run', 'snow', 'deliver'), R('Stadium Slalom', 'stadium'),
    R('Floating Farm Landings', 'skyislands', 'land'), R('Night Market Lanterns', 'festival', 'lights'),
    R('Lion Pride Survey', 'savanna', 'photo'), R('City Rooftop Drops', 'city', 'deliver'),
    R('Volcano Smoke Rings', 'volcano'), R('Lighthouse Photos', 'harbour', 'photo'),
    R('Asteroid Belt Weave', 'space'), R('Neon Night Formation', 'neon'),
    // Advanced
    R('Island Supply Network', 'skyislands', 'land'), R('Lantern Festival Spiral', 'festival', 'lights'),
    R('Alpine Rescue Relay', 'snow', 'deliver'), R('Great Migration Survey', 'savanna', 'photo'),
    R('Rainbow Grand Tour', 'rainbow'), R('Coastal Postal Circuit', 'beach', 'deliver', { balloons: true }),
    R('Space Station Lights', 'space', 'lights'), R('Canyon Photo Expedition', 'canyon', 'photo'),
    R('Glacier Pad Landings', 'arctic', 'land'), R('Drone Champion Airshow', 'airshow', 'rings', { finaleShow: true }),
  ],
  racedrone: [
    R('Neon Starter Sprint', 'neon'), R('Stadium First Lap', 'stadium'), R('Forest Gate Dash', 'forest'),
    R('Canyon Straight', 'canyon'), R('City Block Sprint', 'city'), R('Beach Boost', 'beach'),
    R('Snow Gate Slide', 'snow'), R('Harbour Hairpin', 'harbour'), R('Meadow Sprint', 'meadow'),
    R('Savanna Speedway', 'savanna'),
    R('Volcano Vent Rush', 'volcano'), R('Rainbow Gates', 'rainbow'), R('Island Chicane', 'skyislands'),
    R('Arctic Esses', 'arctic'), R('Salt Flat Slalom', 'saltflat'), R('Ocean Spray Gates', 'ocean'),
    R('Airshow Pylons', 'airshow'), R('Lantern Tunnel', 'festival', 'lights'), R('Comet Chase', 'space'),
    R('City Tower Climb', 'city'),
    R('Forest Rapid Slalom', 'forest'), R('Canyon Dive Gates', 'canyon'), R('Neon Overpass Lights', 'neon', 'lights'),
    R('Glacier Gates', 'snow'), R('Harbour Night Lights', 'harbour', 'lights'), R('Beach Wave Weave', 'beach'),
    R('Volcano Lava Loop', 'volcano'), R('Windmill Weave Race', 'meadow', 'rings', { windsocks: true }), R('Dust Devil Dash', 'savanna'),
    R('Stadium Switchback', 'stadium'),
    R('Neon Grand Prix', 'neon'), R('Rainbow Championship', 'rainbow'), R('Sky Island Cup', 'skyislands'),
    R('Aurora Gauntlet', 'arctic'), R('Speed Record Run', 'saltflat'), R('Ocean Marathon', 'ocean'),
    R('Airshow Masters', 'airshow'), R('Festival Lights Cup', 'festival', 'lights'), R('Asteroid Cup', 'space'),
    R('Racing Drone World Final', 'stadium', 'rings', { grandPrix: true }),
  ],
  jetplane: [
    R('Carrier Take-off', 'ocean', 'rings', { carrier: true }), R('Island Cloud Pass', 'skyislands'),
    R('Canyon Cruise', 'canyon'), R('Salt Flat Straight', 'saltflat'), R('Arctic Turn', 'arctic'),
    R('Volcano Fly-by Photo', 'volcano', 'photo'), R('Airshow Warm-up', 'airshow'), R('Neon Night Flight', 'neon'),
    R('Lighthouse Photo', 'beach', 'photo'), R('Farmland Cruise', 'meadow'),
    R('Carrier Circuit', 'ocean', 'rings', { carrier: true }), R('Rainbow Arc', 'rainbow'),
    R('Forest Valley Run', 'forest'), R('City Landmarks Photo', 'city', 'photo'), R('Mountain Photo Patrol', 'snow', 'photo'),
    R('Savanna Low Pass', 'savanna'), R('Harbour Fly-by', 'harbour'), R('Orbit Climb', 'space'),
    R('Festival Fly-past', 'festival'), R('Stadium Flyover', 'stadium'),
    R('Canyon Dive', 'canyon'), R('Salt Flat Slalom', 'saltflat'), R('Polar Photo Survey', 'arctic', 'photo'),
    R('Volcano Crater Loop', 'volcano'), R('Airshow Barrel Gates', 'airshow'), R('Neon City Weave', 'neon'),
    R('Storm Coast Photos', 'beach', 'photo'), R('Island Chain Photos', 'skyislands', 'photo'), R('Valley Hedge Hop', 'meadow'),
    R('Stadium Slalom', 'stadium'),
    R('Carrier Grand Patrol', 'ocean', 'rings', { carrier: true }), R('Rainbow Grand Tour', 'rainbow'),
    R('Forest Canopy Run', 'forest'), R('Skyline Masterclass', 'city'), R('Summit Expedition Photos', 'snow', 'photo'),
    R('Great Migration Survey', 'savanna', 'photo'), R('Harbour Rescue Patrol', 'harbour', 'photo'), R('Satellite Sweep', 'space'),
    R('Festival Night Finale', 'festival'), R('Jet Explorer Grand Finale', 'airshow', 'rings', { finale: true }),
  ],
};

const STYLE = {
  drone: { base: [8, 10], legs: [1, 1, 2], angles: [30, 45, 90, 90], climb: [4, 5, 6] },
  racedrone: { base: [6, 8], legs: [1, 2, 2], angles: [45, 90, 90], climb: [4, 6] },
  jetplane: { base: [8, 10], legs: [2, 2, 3], angles: [30, 45, 60], climb: [4, 6] },
};

const ACTION = { deliver: 'drop_package', photo: 'take_photo', lights: 'light_up', land: 'land' };

// Size of each tier: movement blocks after take-off, stations, turns, height changes.
const TIER_SHAPE = [
  { moves: [3, 5], stations: [2, 3], climbs: [0, 1], repeat: 0 },
  { moves: [6, 8], stations: [3, 4], climbs: [1, 2], repeat: 0.5 },
  { moves: [9, 11], stations: [4, 5], climbs: [2, 3], repeat: 0.6 },
  { moves: [12, 15], stations: [5, 6], climbs: [3, 4], repeat: 0.7 },
];

/** Land missions: fly, land on the pad, climb back up before flying on. */
function flyCourse(tokens, landing) {
  if (!landing) return flySkyProgram(tokens);
  const firstUp = Number(tokens[0].slice(1)) || 8;
  const landY = SKY_SPAWN_Y + firstUp - 5 + 0.5;
  let state; const out = { path: [], rings: [], stations: [], end: null };
  let part = [];
  const run = (toks, land) => {
    const r = flySkyProgram(toks, state);
    out.path.push(...(out.path.length ? r.path.slice(1) : r.path)); out.rings.push(...r.rings);
    state = { ...r.end };
    if (land) { out.stations.push({ ...state }); state.y = landY; }
    out.end = { ...state };
  };
  tokens.forEach((t) => { if (t === 'A') { run(part, true); part = []; } else part.push(t); });
  run(part, false);
  return out;
}

function makeProgram(style, shape, plan, r, size) {
  const base = r.int(style.base[0], style.base[1]);
  const out = [`U${base}`];
  let y = SKY_SPAWN_Y + base;
  const wantStations = plan.kind === 'rings' ? 0 : r.int(shape.stations[0], shape.stations[1]);
  let stations = 0; let climbs = 0; let lastTurn = null;
  const leg = () => `F${r.pick(style.legs)}`;
  const turn = () => {
    let dir = r() < 0.5 ? 'R' : 'L';
    if (lastTurn && r() < 0.55) dir = lastTurn === 'R' ? 'L' : 'R'; // S-bends read as a course
    lastTurn = dir;
    return `${dir}${r.pick(style.angles)}`;
  };
  const station = () => {
    out.push('A'); stations++;
    if (plan.kind === 'land') out.push('U5');
  };
  // Medium and up: a repeated motif, so a Repeat block makes the program shorter
  const useRepeat = r() < shape.repeat;
  if (useRepeat) {
    const times = Math.min(4, 2 + Math.floor(size / 5));
    const dir = r() < 0.5 ? 'R' : 'L';
    const flip = dir === 'R' ? 'L' : 'R';
    const motif = plan.kind === 'land' ? 'zigzag' : r.pick(['zigzag', 'stairs', 'arc', 'wave', 'zigzag']);
    const ang = plan.kind === 'rings' ? r.pick([45, 60, 90]) : 90;
    out.push('F2');
    for (let k = 0; k < times; k++) {
      if (motif === 'stairs' && y + 4 <= 30) { out.push(`U4`, `F${style.legs[0]}`); y += 4; climbs++; }
      else if (motif === 'wave') { out.push(k % 2 ? 'D4' : 'U4', `F${style.legs[0]}`); y += k % 2 ? -4 : 4; climbs++; }
      else out.push(`F${style.legs[0]}`);
      if (plan.kind !== 'rings' && stations < wantStations) station();
      if (motif === 'arc') out.push(`${dir}${Math.min(45, ang)}`);
      else if (motif === 'zigzag') out.push(`${k % 2 ? flip : dir}${ang}`);
      else if (k % 2) out.push(`${k % 4 === 1 ? dir : flip}${Math.min(60, ang)}`);
    }
  } else {
    out.push('F2');
  }
  let moves = out.filter((t) => t !== 'A' && t !== 'U5').length - 1;
  while (moves < size) {
    const room = size - moves;
    const roll = r();
    if (climbs < shape.climbs[1] && roll < 0.22 && room >= 2) {
      const c = r.pick(style.climb);
      if (r() < 0.5 && y - c >= 7) { out.push(`D${c}`); y -= c; } else if (y + c <= 30) { out.push(`U${c}`); y += c; }
      out.push(leg()); climbs++; moves += 2;
    } else if (roll < 0.62 && room >= 2) {
      out.push(turn(), leg()); moves += 2;
    } else {
      out.push(leg()); moves += 1;
    }
    if (plan.kind !== 'rings' && stations < wantStations && r() < 0.6) station();
  }
  while (plan.kind !== 'rings' && stations < wantStations) { out.push(leg()); station(); }
  // Finish on a forward leg so the finish gate sits in clear air
  if (!/^F/.test(out[out.length - 1])) out.push('F1');
  while (out[out.length - 1] === 'U5') out.pop();
  return tidy(out);
}

/** Merge back-to-back forward legs, and never put two turns next to each other. */
function tidy(tokens) {
  const out = [];
  for (const t of tokens) {
    const prev = out[out.length - 1];
    if (t[0] === 'F' && prev?.[0] === 'F' && out.length > 2) {
      const n = Number(prev.slice(1)) + Number(t.slice(1));
      if (n <= 3) { out[out.length - 1] = `F${n}`; continue; }
    }
    if (/^[RL]/.test(t) && /^[RL]/.test(prev || '')) out.push('F1');
    out.push(t);
  }
  return out;
}

const MIN_TURNS = [1, 2, 3, 5];

function check(tokens, plan) {
  const flown = flyCourse(tokens, plan.kind === 'land');
  const pts = flown.path;
  if (pts.slice(9).some((p) => p.y < 5 || p.y > 40)) return 'height';
  const xs = pts.map((p) => p.x); const zs = pts.map((p) => p.z);
  if (Math.max(...xs) - Math.min(...xs) > 260 || Math.max(...zs) - Math.min(...zs) > 260) return 'too big';
  // The route must not come back close to a part it flew much earlier
  const step = 4; const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  for (let i = 0; i < pts.length; i += step) {
    for (let j = i + step; j < pts.length; j += step) {
      if (cum[j] - cum[i] < 40) continue;
      if (Math.hypot(pts[i].x - pts[j].x, pts[i].z - pts[j].z) < 14 && Math.abs(pts[i].y - pts[j].y) < 8) return 'crosses';
    }
  }
  const s0 = pts[0];
  const marks = plan.kind === 'rings' ? flown.rings.filter((m) => Math.hypot(m.x - s0.x, m.z - s0.z) > 10) : flown.stations;
  for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) {
    if (Math.hypot(marks[i].x - marks[j].x, marks[i].z - marks[j].z) < 10) return 'markers overlap';
  }
  if (plan.kind === 'rings' && marks.length < 3) return 'few rings';
  // Start pad clear of the course
  const s = pts[0];
  if (marks.some((m) => Math.hypot(m.x - s.x, m.z - s.z) < 9)) return 'marker on pad';
  return null;
}

function starterDrop(tokens, tierIndex, slot) {
  const moves = tokens.filter((t, i) => i > 0 && t !== 'A').length;
  if (tierIndex === 0) return slot < 5 ? 1 : 2;
  if (tierIndex === 1) return Math.max(2, Math.round(moves * 0.45));
  if (tierIndex === 2) return Math.max(3, Math.round(moves * 0.7));
  return Math.max(4, moves - 1); // Advanced: only the take-off and first move are given
}

export function buildSky() {
  const result = {};
  const report = [];
  for (const [chassisId, plans] of Object.entries(PLANS)) {
    const style = STYLE[chassisId];
    const seen = new Set();
    result[chassisId] = plans.map((plan, i) => {
      const tierIndex = Math.floor(i / 10); const slot = i % 10;
      const shape = TIER_SHAPE[tierIndex];
      // Courses grow through the tier: slot 0 is the smallest, slot 9 the largest
      const size = Math.round(shape.moves[0] + (shape.moves[1] - shape.moves[0]) * (slot / 9));
      for (let attempt = 0; attempt < 4000; attempt++) {
        const r = rng(`${chassisId}:${i}:${attempt}`);
        const tokens = makeProgram(style, shape, plan, r, size);
        const program = tokens.join(' ');
        if (seen.has(program)) continue;
        const turns = tokens.filter((t) => /^[RL]/.test(t)).length;
        if (turns < MIN_TURNS[tierIndex]) continue;
        const bad = check(tokens, plan);
        if (bad) { (globalThis.__why ||= {})[bad] = (globalThis.__why[bad] || 0) + 1; continue; }
        seen.add(program);
        const action = ACTION[plan.kind] || null;
        const flags = Object.fromEntries(Object.entries(plan).filter(([k]) => !['name', 'theme', 'kind'].includes(k)));
        const flown = flyCourse(tokens, plan.kind === 'land');
        return {
          mode: 11 + i, name: plan.name, tier: TIERS[tierIndex], theme: plan.theme, kind: plan.kind, action,
          program, drop: starterDrop(tokens, tierIndex, slot),
          markers: plan.kind === 'rings' ? Math.min(8, flown.rings.filter((m) => Math.hypot(m.x - flown.path[0].x, m.z - flown.path[0].z) > 10).length) : flown.stations.length,
          ...flags,
        };
      }
      console.log(globalThis.__why); throw new Error(`No valid sky course for ${chassisId} #${i + 11} ${plan.name}`);
    });
    report.push(`${chassisId}: ${result[chassisId].map((l) => l.program.split(' ').length).join(',')}`);
  }
  const size = writeData('sky-tiers.js', 'Sky courses for modes 11–50 (Drone, Racing Drone, Jet Explorer).\nEach program is the solution; the course is built along it.', { SKY_TIER_COURSES: result });
  return { report, size };
}

if (process.argv[1] && import.meta.url.endsWith(encodeURI(process.argv[1].split('/').pop()))) {
  const { report, size } = buildSky();
  console.log(report.join('\n'), '\nbytes', size);
}
