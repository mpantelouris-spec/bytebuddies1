#!/usr/bin/env node
/**
 * Smoke-check Robot Studio modules without a browser.
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { normalizeRobotBuildConfig } from '../src/virtual-robot-designer/services/studio-robot-builder.js';
import { isFlappyBirdCourse } from '../src/virtual-robot-designer/data/flappy-bird-blocks.js';
import { isFightingCourse } from '../src/virtual-robot-designer/data/fighting-blocks.js';
import {
  loadRobotLibrary,
  saveRobotToLibrary,
  filterRobotsByTag,
  ROBOTS_LIB_KEY,
} from '../src/virtual-robot-designer/services/studio-robot-store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

// Mock localStorage for Node
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => { mem.set(k, String(v)); },
  removeItem: (k) => { mem.delete(k); },
};

// ── Studio file presence ────────────────────────────────────────────────────
const studioFiles = [
  'src/virtual-robot-designer/ByteBuddiesStudio.jsx',
  'src/virtual-robot-designer/studio/BuildPage.jsx',
  'src/virtual-robot-designer/studio/LiveLabPage.jsx',
  'src/virtual-robot-designer/studio/LiveLabGameUI.jsx',
  'src/virtual-robot-designer/studio/MyRobotsPage.jsx',
  'src/virtual-robot-designer/studio/ModularBuilderPage.jsx',
  'src/virtual-robot-designer/studio/CustomPartsPage.jsx',
  'src/virtual-robot-designer/services/studio-robot-store.js',
];
for (const rel of studioFiles) {
  assert(existsSync(join(root, rel)), `missing ${rel}`);
}

// ── ByteBuddiesStudio wiring ────────────────────────────────────────────────
const studioSrc = readFileSync(join(root, 'src/virtual-robot-designer/ByteBuddiesStudio.jsx'), 'utf8');
assert(studioSrc.includes("case 'customparts'"), 'CustomParts tab mounted');
assert(studioSrc.includes('onSaveDesign={saveDesign}'), 'BuildPage save wired');
assert(studioSrc.includes('onApplyRobot={applyModularRobot}'), 'ModularBuilder apply wired');
assert(studioSrc.includes('initialCourseId={hashCourse}'), 'hash course passed to Live Lab');
assert(studioSrc.includes('parseStudioHashCourse'), 'hash course parser present');

const modularSrc = readFileSync(join(root, 'src/virtual-robot-designer/studio/ModularBuilderPage.jsx'), 'utf8');
assert(modularSrc.includes('openInLiveLab'), 'ModularBuilder Live Lab handler');
assert(modularSrc.includes('onSimulate'), 'ModularBuilder accepts onSimulate');

const myRobotsSrc = readFileSync(join(root, 'src/virtual-robot-designer/studio/MyRobotsPage.jsx'), 'utf8');
assert(myRobotsSrc.includes('loadRobotLibrary'), 'MyRobots uses persisted library');
assert(myRobotsSrc.includes('filterRobotsByTag'), 'MyRobots filter wired');

// ── Robot config normalization ──────────────────────────────────────────────
const cfg = normalizeRobotBuildConfig({ name: 'Test Bot', chassisId: 'rover' });
assert(cfg.chassisId === 'rover' && cfg.name === 'Test Bot', 'normalizeRobotBuildConfig');

// ── Robot library persistence ───────────────────────────────────────────────
mem.clear();
const { library } = saveRobotToLibrary({ name: 'Saved Bot', chassisId: 'drone', sensors: ['camera', 'lidar'] });
assert(library.length >= 1 && library[0].name === 'Saved Bot', 'saveRobotToLibrary');
const reloaded = loadRobotLibrary();
assert(reloaded[0]?.name === 'Saved Bot', 'loadRobotLibrary');
const smart = filterRobotsByTag(reloaded, 'smart');
assert(smart.some((r) => r.name === 'Saved Bot'), 'filterRobotsByTag smart');

// ── Flappy / fighting course detection (arenaType path) ─────────────────────
assert(isFlappyBirdCourse('birdbot_zone1', 'flappy_bird'), 'birdbot flappy via arenaType');
assert(!isFlappyBirdCourse('rover_delivery', 'sky_island'), 'non-flappy course');
assert(isFightingCourse('fight_training'), 'fighting course by id');
assert(isFightingCourse('rover_delivery', 'robot_fight'), 'fighting course via arenaType');

// ── Live Lab block palette source uses arenaType ────────────────────────────
const gameUiSrc = readFileSync(join(root, 'src/virtual-robot-designer/studio/LiveLabGameUI.jsx'), 'utf8');
assert(gameUiSrc.includes('getBlockLibraryForCourse(courseKey, arenaType)'), 'palette uses arenaType');
assert(gameUiSrc.includes('isFlappyBirdCourse(courseKey, arenaType)'), 'flappy palette check');

// ── climb block handler restored ────────────────────────────────────────────
const labSrc = readFileSync(join(root, 'src/virtual-robot-designer/studio/LiveLabPage.jsx'), 'utf8');
assert(/case\s+'climb'\s*:/.test(labSrc), 'applyBlock climb case present');

if (failures.length) {
  console.error('verify-studio FAILED:\n', failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log('verify-studio: OK (files, wiring, robot store, course palettes)');
