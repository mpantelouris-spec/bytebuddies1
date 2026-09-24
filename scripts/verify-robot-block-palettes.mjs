/**
 * Audit scratch palettes for every robot type — Events universal, core categories present.
 * Run: node scripts/verify-robot-block-palettes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  UNIVERSAL_EVENT_BLOCKS,
  UNIVERSAL_BLOCKLY_EVENT_TYPES,
  UNIVERSAL_EVENTS_CATEGORY,
  withUniversalEvents,
} from '../src/virtual-robot-designer/data/universal-event-blocks.js';
import { FLAPPY_BLOCK_LIBRARY, isFlappyBirdCourse } from '../src/virtual-robot-designer/data/flappy-bird-blocks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const gameUiSrc = fs.readFileSync(
  path.join(root, 'src/virtual-robot-designer/studio/LiveLabGameUI.jsx'),
  'utf8',
);
const liveLabSrc = fs.readFileSync(
  path.join(root, 'src/virtual-robot-designer/studio/LiveLabPage.jsx'),
  'utf8',
);

function getRobotGroup(robotType) {
  if (['drone', 'jet', 'hover', 'racedrone'].includes(robotType)) return 'aerial';
  if (['spider', 'humanoid'].includes(robotType)) return 'walker';
  if (['underwater'].includes(robotType)) return 'underwater';
  if (['factory', 'factorybot'].includes(robotType)) return 'arm';
  if (['birdbot'].includes(robotType)) return 'birdbot';
  return 'wheeled';
}

/** Parse scratch blocks with optional robotGroups from LiveLabGameUI source */
function parseScratchLibrary(src) {
  const categories = {};
  const catRe = /(\w+):\s*\{\s*label:\s*'[^']*',\s*color:\s*'[^']*',\s*icon:\s*'[^']*',\s*blocks:\s*\[/g;
  let catMatch;
  while ((catMatch = catRe.exec(src)) !== null) {
    const catKey = catMatch[1];
    if (catKey === 'Events') continue; // use universal source
    const start = catMatch.index + catMatch[0].length;
    const end = src.indexOf('\n  },', start);
    const chunk = src.slice(start, end);
    const blocks = [];
    const blockRe = /\{\s*id\s*:\s*'([^']+)'[^}]*?(robotGroups\s*:\s*\[([^\]]+)\])?[^}]*\}/g;
    let bm;
    while ((bm = blockRe.exec(chunk)) !== null) {
      const groups = bm[2]
        ? bm[2].split(',').map((s) => s.replace(/['"\s]/g, '')).filter(Boolean)
        : null;
      blocks.push({ id: bm[1], robotGroups: groups });
    }
    categories[catKey] = { blocks };
  }
  categories.Events = UNIVERSAL_EVENTS_CATEGORY;
  return categories;
}

function getBlockLibraryForCourse(courseKey) {
  const base = isFlappyBirdCourse(courseKey) ? FLAPPY_BLOCK_LIBRARY : parseScratchLibrary(gameUiSrc);
  return withUniversalEvents(base);
}

const ROBOT_TYPES = [
  'rover', 'tank', 'drone', 'jet', 'spider', 'humanoid', 'factory', 'hover',
  'underwater', 'security', 'medbot', 'firebot', 'racedrone', 'factorybot', 'birdbot', 'miningbot',
];

const UNIVERSAL_CATEGORY_MIN = {
  Events: UNIVERSAL_EVENT_BLOCKS.map((b) => b.id),
  Loops: ['repeat', 'forever', 'wait', 'wait_until'],
  Logic: ['if_then', 'if_else'],
  Variables: ['set_var', 'change_var'],
  Functions: ['define_func', 'call_func'],
  Lights: ['led_on', 'led_off', 'led_blink'],
  Sound: ['play_sound', 'alarm_sound'],
};

const GROUP_MOVEMENT_MIN = {
  wheeled: ['move_forward', 'turn_left', 'stop', 'set_speed'],
  aerial: ['move_forward', 'fly_up', 'stop', 'set_speed'],
  walker: ['step_forward', 'turn_left', 'stop', 'set_speed'],
  underwater: ['move_forward', 'dive_deep', 'stop', 'set_speed'],
  arm: ['move_forward', 'turn_left', 'stop', 'set_speed'],
  birdbot: ['flap', 'stop', 'set_speed'],
};

function filterVisible(library, robotGroup) {
  const out = {};
  for (const [key, cat] of Object.entries(library)) {
    out[key] = (cat.blocks || []).filter(
      (b) => key === 'Events' || !b.robotGroups || b.robotGroups.includes(robotGroup),
    );
  }
  return out;
}

function extractBlocklyEventDefs(src) {
  const types = new Set();
  for (const m of src.matchAll(/type\s*:\s*'(robot_when_[^']+)'/g)) types.add(m[1]);
  return types;
}

function extractKnownToolboxTypes(src) {
  const m = src.match(/const knownTypes = new Set\(\[([^\]]+)\]\)/);
  if (!m) return new Set();
  return new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
}

let failed = false;
const fail = (msg) => { failed = true; console.error(`  ✗ ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);

console.log('=== Universal Blockly event defs ===');
const blocklyEventDefs = extractBlocklyEventDefs(liveLabSrc);
for (const t of UNIVERSAL_BLOCKLY_EVENT_TYPES) {
  if (!blocklyEventDefs.has(t)) fail(`Missing Blockly def: ${t}`);
}
if (!failed) ok(`All ${UNIVERSAL_BLOCKLY_EVENT_TYPES.length} universal Blockly event types registered`);

console.log('\n=== Scratch palette — all robot types (general courses) ===');
for (const robotType of ROBOT_TYPES) {
  const robotGroup = getRobotGroup(robotType);
  const library = getBlockLibraryForCourse('street_grand_prix');
  const visible = filterVisible(library, robotGroup);
  const ids = new Set(Object.values(visible).flat().map((b) => b.id));

  console.log(`\n${robotType} (${robotGroup}):`);
  for (const [cat, required] of Object.entries(UNIVERSAL_CATEGORY_MIN)) {
    const missing = required.filter((id) => !ids.has(id));
    const count = visible[cat]?.length ?? 0;
    if (cat === 'Events' && count !== UNIVERSAL_EVENT_BLOCKS.length) {
      fail(`${robotType} Events count ${count}, expected ${UNIVERSAL_EVENT_BLOCKS.length}`);
    }
    if (missing.length) fail(`${robotType} missing ${cat}: ${missing.join(', ')}`);
    else ok(`${cat}: ${required.length} blocks`);
  }

  const moveMin = GROUP_MOVEMENT_MIN[robotGroup] || GROUP_MOVEMENT_MIN.wheeled;
  const moveMissing = moveMin.filter((id) => !ids.has(id));
  if (moveMissing.length) fail(`${robotType} missing movement: ${moveMissing.join(', ')}`);
  else ok(`Movement core: ${moveMin.join(', ')}`);
}

console.log('\n=== Scratch palette — flappy course (sample robots) ===');
for (const robotType of ['rover', 'birdbot', 'drone']) {
  const robotGroup = getRobotGroup(robotType);
  const library = getBlockLibraryForCourse('flappy_bird');
  const visible = filterVisible(library, robotGroup);
  const eventIds = visible.Events?.map((b) => b.id) || [];
  const missingEvents = UNIVERSAL_EVENT_BLOCKS.map((b) => b.id).filter((id) => !eventIds.includes(id));
  if (missingEvents.length) fail(`Flappy/${robotType} missing events: ${missingEvents.join(', ')}`);
  else ok(`Flappy/${robotType}: ${eventIds.length} universal events`);
  if (!visible.Movement?.some((b) => b.id === 'flap')) fail(`Flappy/${robotType} missing flap block`);
  else ok(`Flappy/${robotType}: flap movement present`);
}

console.log('\n=== Blockly toolbox robot type coverage ===');
const knownTypes = extractKnownToolboxTypes(liveLabSrc);
for (const t of ROBOT_TYPES) {
  if (!knownTypes.has(t)) fail(`buildToolbox missing robot type: ${t}`);
}
if ([...ROBOT_TYPES].every((t) => knownTypes.has(t))) {
  ok(`All ${ROBOT_TYPES.length} robot types in buildToolbox knownTypes`);
}

console.log('\n=== Summary ===');
if (failed) {
  console.error('verify-robot-block-palettes: FAILED');
  process.exit(1);
}
console.log('verify-robot-block-palettes: OK — all robots have universal events + core blocks');
