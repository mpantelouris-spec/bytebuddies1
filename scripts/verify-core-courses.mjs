#!/usr/bin/env node
/**
 * Validates the 123 core Live Lab courses:
 *   100 catalog (5 robots × 20) + 8 flagship programs + 15 game missions
 * Also checks 40 expanded flagship levels and arena handler coverage.
 * Run: node scripts/verify-core-courses.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ALL_CATALOG, ROBOT_COURSES } from '../src/data/courseCatalog.js';
import { FLAGSHIP_PROGRAMS, expandFlagshipCourses } from '../src/virtual-robot-designer/data/flagship-courses.js';
import { expandGameMissionsAsCourses } from '../src/virtual-robot-designer/data/game-missions.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const liveLabSrc = readFileSync(join(root, 'src/virtual-robot-designer/studio/LiveLabPage.jsx'), 'utf8');

function extractArenaCases(source) {
  const start = source.indexOf('function buildSmartArena');
  const switchStart = source.indexOf('switch(arenaType)', start);
  const switchEnd = source.indexOf('default:', switchStart);
  const block = source.slice(switchStart, switchEnd);
  return new Set([...block.matchAll(/case '([^']+)'/g)].map((m) => m[1]));
}

/** Parse inline entries from LiveLabPage ALL_COURSES (excludes spread imports). */
function parseLiveLabInlineCourses(source) {
  const arrStart = source.indexOf('const ALL_COURSES = [');
  let depth = 0;
  let arrEnd = arrStart;
  for (let i = arrStart; i < source.length; i++) {
    if (source[i] === '[') depth++;
    if (source[i] === ']') {
      depth--;
      if (depth === 0) {
        arrEnd = i;
        break;
      }
    }
  }
  const block = source.slice(arrStart, arrEnd + 1);
  const courses = [];
  for (const chunk of block.split(/\{/)) {
    const id = chunk.match(/\bid:'([^']+)'/)?.[1] || chunk.match(/\bid:"([^"]+)"/)?.[1];
    if (!id || id.startsWith('...')) continue;
    const arenaType = chunk.match(/arenaType:'([^']+)'/)?.[1] || chunk.match(/arenaType:"([^"]+)"/)?.[1];
    courses.push({ bucket: 'live-lab-inline', id, arenaType });
  }
  return courses;
}

const arenaCases = extractArenaCases(liveLabSrc);
const missions = expandGameMissionsAsCourses();
const flagshipLevels = expandFlagshipCourses();

const core122 = [
  ...ALL_CATALOG.map((c) => ({ bucket: 'catalog', ...c })),
  ...FLAGSHIP_PROGRAMS.map((c) => ({ bucket: 'flagship-program', ...c })),
  ...missions.map((c) => ({ bucket: 'mission', ...c })),
];

const errors = [];
const warnings = [];

if (ALL_CATALOG.length !== 100) {
  errors.push(`Expected 100 catalog courses, got ${ALL_CATALOG.length}`);
}
if (FLAGSHIP_PROGRAMS.length !== 8) {
  errors.push(`Expected 8 flagship programs, got ${FLAGSHIP_PROGRAMS.length}`);
}
if (missions.length !== 15) {
  errors.push(`Expected 15 game missions, got ${missions.length}`);
}
if (core122.length !== 123) {
  errors.push(`Expected 123 core courses, got ${core122.length}`);
}

for (const [robot, list] of Object.entries(ROBOT_COURSES)) {
  if (list.length !== 20) {
    errors.push(`Robot catalog ${robot} should have 20 courses, got ${list.length}`);
  }
}

const ids = new Set();
for (const c of [...core122, ...flagshipLevels]) {
  if (!c.id) errors.push(`Course missing id in bucket ${c.bucket || 'flagship-level'}`);
  if (ids.has(c.id)) errors.push(`Duplicate course id: ${c.id}`);
  ids.add(c.id);
  if (!c.arenaType) {
    errors.push(`${c.id}: missing arenaType`);
    continue;
  }
  if (!arenaCases.has(c.arenaType)) {
    warnings.push(`${c.id}: arenaType "${c.arenaType}" uses default _groundArena (no explicit switch case)`);
  }
}

// Racing showcase must stay on Rainbow Road
const rainbow = missions.find((m) => m.id === 'street_grand_prix');
if (!rainbow || rainbow.arenaType !== 'rainbow_road') {
  errors.push('street_grand_prix mission must use arenaType rainbow_road');
}

console.log('═══ Core course verification ═══');
console.log(`  Catalog:           ${ALL_CATALOG.length}`);
console.log(`  Flagship programs: ${FLAGSHIP_PROGRAMS.length}`);
console.log(`  Game missions:     ${missions.length}`);
console.log(`  Core total:        ${core122.length}`);
console.log(`  Flagship levels:   ${flagshipLevels.length}`);
console.log(`  Arena switch cases:${arenaCases.size}`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}

if (errors.length) {
  console.error(`\n✗ Failed (${errors.length}):`);
  errors.forEach((e) => console.error(`  • ${e}`));
  process.exit(1);
}

console.log('\n✓ All 123 core courses validated OK');

// ── Live Lab ALL_COURSES worlds (inline + missions + flagship levels) ──
const inline = parseLiveLabInlineCourses(liveLabSrc);
const allWorlds = [
  ...inline,
  ...missions.map((c) => ({ bucket: 'mission', id: c.id, arenaType: c.arenaType })),
  ...flagshipLevels.map((c) => ({ bucket: 'flagship-level', id: c.id, arenaType: c.arenaType })),
];
const worldIds = new Set();
const worldErrors = [];
for (const c of allWorlds) {
  if (worldIds.has(c.id)) worldErrors.push(`Duplicate ALL_COURSES id: ${c.id}`);
  worldIds.add(c.id);
  if (!c.arenaType) worldErrors.push(`${c.id}: missing arenaType in ALL_COURSES`);
}
const roverDefault = allWorlds.find((c) => c.id === 'street_grand_prix');
if (!roverDefault || roverDefault.arenaType !== 'rainbow_road') {
  worldErrors.push('street_grand_prix in ALL_COURSES must use arenaType rainbow_road');
}

console.log('\n═══ Live Lab worlds (ALL_COURSES) ═══');
console.log(`  Inline worlds:     ${inline.length}`);
console.log(`  + missions:          ${missions.length}`);
console.log(`  + flagship levels:   ${flagshipLevels.length}`);
console.log(`  Total unique worlds: ${worldIds.size}`);

if (worldErrors.length) {
  console.error(`\n✗ ALL_COURSES failed (${worldErrors.length}):`);
  worldErrors.forEach((e) => console.error(`  • ${e}`));
  process.exit(1);
}
console.log('✓ ALL_COURSES worlds validated OK');
