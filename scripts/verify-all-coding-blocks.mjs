/**
 * Comprehensive audit: palette blocks ↔ sim handlers ↔ Game Builder map.
 * Run: node scripts/verify-all-coding-blocks.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FLAPPY_BLOCK_LIBRARY, FLAPPY_BLOCK_ACTION_MAP } from '../src/virtual-robot-designer/data/flappy-bird-blocks.js';
import { compileFlappyScratchScript, FlappyBlockRuntime } from '../src/virtual-robot-designer/data/flappy-block-runtime.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const liveLabPath = path.join(root, 'src/virtual-robot-designer/studio/LiveLabPage.jsx');
const gameUiPath = path.join(root, 'src/virtual-robot-designer/studio/LiveLabGameUI.jsx');
const liveLabSrc = fs.readFileSync(liveLabPath, 'utf8');
const gameUiSrc = fs.readFileSync(gameUiPath, 'utf8');

const EVENT_HATS = new Set([
  'when_start', 'when_spacebar', 'when_key', 'when_zone', 'when_collect', 'when_collision',
  'when_sensor', 'when_timer', 'when_battery', 'when_gap_passed', 'when_game_over',
  'when_checkpoint', 'when_lap', 'when_race_won', 'when_goal',
]);

const STRUCTURAL = new Set([
  'if_then', 'if_else', 'wait_until', 'define_func', 'call_func',
  'if_gt', 'if_lt', 'if_eq', 'repeat_until', 'break_loop',
  'if_color', 'if_distance', 'obstacle_ahead', 'line_below', 'see_object', 'battery_low',
  'detect_item', 'distance_to_pipe', 'bird_height', 'gap_center_height', 'is_falling',
  'num_pipe_dist', 'num_bird_height', 'num_gap_center', 'is_falling_bool',
  'read_score', 'read_high_score', 'num_score', 'num_high_score', 'get_var', 'create_var',
  'repeat', 'forever',
]);

const VISUAL_ONLY = new Set([
  'wait', 'led_on', 'led_off', 'led_blink', 'play_sound', 'alarm_sound',
  'set_var', 'change_var', 'show_score', 'show_message', 'pause',
]);

function extractApplyCases(src) {
  const start = src.indexOf('function applyBlock(');
  const end = src.indexOf('\nfunction getGroundEffect', start);
  const body = src.slice(start, end);
  const cases = new Set();
  for (const m of body.matchAll(/case '([^']+)':/g)) cases.add(m[1]);
  return cases;
}

function extractDurationCases(src) {
  const start = src.indexOf('function getBlockDuration(');
  const end = src.indexOf('\n// Universal step distance', start);
  const body = src.slice(start, end);
  const cases = new Set();
  for (const m of body.matchAll(/case '([^']+)':/g)) cases.add(m[1]);
  return cases;
}

function extractLibraryIds(src) {
  const ids = new Set();
  for (const m of src.matchAll(/\{\s*id\s*:\s*'([^']+)'/g)) ids.add(m[1]);
  return ids;
}

const applyCases = extractApplyCases(liveLabSrc);
const durationCases = extractDurationCases(liveLabSrc);
const generalIds = extractLibraryIds(gameUiSrc);
const flappyIds = extractLibraryIds(JSON.stringify(FLAPPY_BLOCK_LIBRARY));

let failed = false;

console.log('=== Live Lab — General Block Palette ===');
const generalExec = [...generalIds].filter((id) => !EVENT_HATS.has(id) && !STRUCTURAL.has(id));
const missingApply = generalExec.filter((id) => !applyCases.has(id));
const missingDur = generalExec.filter((id) => !durationCases.has(id) && !VISUAL_ONLY.has(id));

if (missingApply.length) {
  failed = true;
  console.error(`Missing applyBlock handler (${missingApply.length}):`);
  missingApply.forEach((id) => console.error(`  - ${id}`));
} else {
  console.log(`OK — all ${generalExec.length} executable general blocks have applyBlock cases`);
}

if (missingDur.length) {
  console.warn(`Missing getBlockDuration (${missingDur.length}) — using default 0.5s:`);
  missingDur.forEach((id) => console.warn(`  - ${id}`));
}

console.log('\n=== Live Lab — Flappy Block Palette ===');
const flappyExec = Object.keys(FLAPPY_BLOCK_ACTION_MAP);
const flappyRuntimeOps = new Set([
  'flap', 'set_flap_strength', 'set_gravity_strength', 'set_scroll_speed', 'freeze_bird',
  'move_up', 'move_down', 'set_bird_height', 'break', 'wait', 'show_score', 'restart_game',
  'pause_game', 'show_message', 'play_sound', 'var_create', 'var_set', 'var_change',
  'show_variable', 'hide_variable', 'repeat', 'repeat_with', 'repeat_until_gameover',
  'forever', 'if', 'if_else',
]);
const missingFlappyMap = flappyExec.filter((id) => !FLAPPY_BLOCK_ACTION_MAP[id]);
if (missingFlappyMap.length) {
  failed = true;
  console.error('Missing FLAPPY_BLOCK_ACTION_MAP entries:', missingFlappyMap);
}

const compileFails = [];
const OP_ALIASES = { pause: 'pause_game', set_var: 'var_set', change_var: 'var_change' };
for (const id of flappyExec) {
  if (EVENT_HATS.has(id) || STRUCTURAL.has(id)) continue;
  const script = [
    { id: 'when_start', _uid: 'h0', paramValues: {} },
    { id, _uid: 'b0', paramValues: { strength: 5, speed: 5, units: 3, height: 10, seconds: 1, text: 'Hi', sound: 'beep', name: 'x', value: 1 } },
  ];
  const prog = compileFlappyScratchScript(script);
  const compiled = prog.handlers.start?.[0]?.op;
  const expected = OP_ALIASES[FLAPPY_BLOCK_ACTION_MAP[id]] || FLAPPY_BLOCK_ACTION_MAP[id];
  if (expected && compiled !== expected) {
    compileFails.push(`${id} → expected ${expected}, got ${compiled}`);
  }
}
if (compileFails.length) {
  failed = true;
  console.error('Flappy compile failures:');
  compileFails.forEach((e) => console.error(`  - ${e}`));
} else {
  console.log(`OK — ${flappyExec.length} flappy action map entries compile`);
}

// Runtime smoke — every flappy exec op runs without throw
const mockScene = {
  userData: {
    flappyMode: true,
    flap: () => {},
    setFlapStrength: () => {},
    setGravityStrength: () => {},
    setScrollSpeed: () => {},
    freezeBird: () => {},
    moveBirdBy: () => {},
    setBirdHeight: () => {},
    setShowScoreHud: () => {},
    showFlappyMessage: () => {},
    playFlappySound: () => {},
    pauseFlappyGame: () => {},
    restartFlappyGame: () => {},
    getFlappySensors: () => ({ distanceToPipe: 5, birdHeight: 10, gapCenterHeight: 12, isFalling: false, score: 3, highScore: 10 }),
    getFlappyState: () => ({ crashed: false, awaitingRestart: false }),
  },
};
const runtimeOps = [
  { op: 'flap' }, { op: 'set_flap_strength', strength: 5 }, { op: 'set_gravity_strength', strength: 5 },
  { op: 'set_scroll_speed', speed: 5 }, { op: 'freeze_bird' }, { op: 'move_up', units: 2 },
  { op: 'move_down', units: 2 }, { op: 'set_bird_height', height: { kind: 'num', value: 8 } },
  { op: 'show_score' }, { op: 'show_message', text: 'test' }, { op: 'play_sound', sound: 'beep' },
  { op: 'pause_game', seconds: 0.1 },
  { op: 'var_create', name: 'a' },
  { op: 'var_set', name: 'a', value: { kind: 'num', value: 2 } }, { op: 'var_change', name: 'a', delta: 1 },
];
const rt = new FlappyBlockRuntime({ handlers: { start: runtimeOps }, tickLoops: [] }, mockScene, () => {});
try {
  runtimeOps.forEach((stmt) => rt.execOne(stmt));
  rt.runEvent('start');
  rt.tick();
  console.log(`OK — FlappyBlockRuntime executed ${runtimeOps.length} ops`);
} catch (e) {
  failed = true;
  console.error('FlappyBlockRuntime smoke failed:', e.message);
}

console.log('\n=== Game Builder smoke ===');
try {
  execSync('node scripts/game-builder-smoke.mjs', { cwd: root, stdio: 'inherit' });
} catch {
  failed = true;
}

console.log('\n=== Summary ===');
console.log(`General palette blocks: ${generalIds.size} (${generalExec.length} executable)`);
console.log(`Flappy palette blocks: ${flappyIds.size}`);
console.log(`applyBlock cases: ${applyCases.size}`);
console.log(`getBlockDuration cases: ${durationCases.size}`);

if (failed) {
  console.error('\nverify-all-coding-blocks: FAILED');
  process.exit(1);
}
console.log('\nverify-all-coding-blocks: OK');
