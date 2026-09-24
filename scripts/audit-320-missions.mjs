/**
 * Audit 320 non-racing missions: data exists, no kart arenas, arenaType coverage.
 */
import { readFileSync } from 'fs';
import { CHASSIS_MODE_MAP, getCoursesForChassis } from '../src/virtual-robot-designer/data/chassis-game-modes.js';
import { KART_RACE_ARENA_TYPES } from '../src/virtual-robot-designer/data/robot-arena-config.js';
import { isCarChassis } from '../src/virtual-robot-designer/data/car-racing-tracks.js';

const SKIP = new Set(['rover', 'scout', 'footballbot']);
const EXPECT_MODES = (Object.keys(CHASSIS_MODE_MAP).length - SKIP.size) * 10;
const liveLab = readFileSync(
  new URL('../src/virtual-robot-designer/studio/LiveLabPage.jsx', import.meta.url),
  'utf8',
);
const adventure = readFileSync(
  new URL('../src/virtual-robot-designer/studio/AdventureArenaBuilder.js', import.meta.url),
  'utf8',
);

const buildSmartCases = new Set(
  [...liveLab.matchAll(/case '([a-z0-9_]+)':/g)].map((m) => m[1]),
);
const premiumKeys = new Set(
  [...adventure.matchAll(/^\s+([a-z0-9_]+):\s*build/gm)].map((m) => m[1]),
);

let modeCount = 0;
let kartHits = 0;
const arenaTypes = new Map();
const missingRouting = [];

for (const [chassisId, modeIds] of Object.entries(CHASSIS_MODE_MAP)) {
  if (SKIP.has(chassisId)) continue;
  if (modeIds.length !== 10) {
    console.error(`FAIL count ${chassisId}: ${modeIds.length}`);
  }
  const modes = getCoursesForChassis(chassisId, []);
  for (const m of modes) {
    modeCount++;
    if (m.linkedRaceCourse) {
      console.error(`FAIL race link ${chassisId} ${m.id}`);
      kartHits++;
    }
    if (KART_RACE_ARENA_TYPES.has(m.arenaType)) {
      console.error(`FAIL kart arena ${chassisId} ${m.id} ${m.arenaType}`);
      kartHits++;
    }
    arenaTypes.set(m.arenaType, (arenaTypes.get(m.arenaType) || 0) + 1);
    const routed = buildSmartCases.has(m.arenaType)
      || premiumKeys.has(m.arenaType)
      || m.arenaType === 'robot_fight'
      || m.arenaType === 'flappy_bird'
      || m.arenaType === 'robot_football';
    if (!routed) missingRouting.push({ chassisId, id: m.id, arenaType: m.arenaType });
  }
}

console.log(`Modes audited: ${modeCount} (expect ${EXPECT_MODES})`);
console.log(`Unique arenaTypes: ${arenaTypes.size}`);
console.log(`Kart/race violations: ${kartHits}`);

if (missingRouting.length) {
  console.log(`\nArena types without explicit LiveLab case or AdventureArenaBuilder map (${missingRouting.length} modes):`);
  const byArena = new Map();
  for (const row of missingRouting) {
    if (!byArena.has(row.arenaType)) byArena.set(row.arenaType, []);
    byArena.get(row.arenaType).push(row);
  }
  for (const [arena, rows] of [...byArena.entries()].sort()) {
    console.log(`  ${arena} (${rows.length} modes) — e.g. ${rows[0].chassisId}/${rows[0].id}`);
  }
}

if (modeCount !== EXPECT_MODES || kartHits) process.exit(1);
console.log(`OK — ${modeCount} mission data layer`);
