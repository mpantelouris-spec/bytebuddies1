#!/usr/bin/env node
/**
 * FIFA 3v3 smoke test — 45s headless match, all bots moving, pass/shot activity.
 * Usage: node scripts/football-smoke.mjs
 */
import { createFootballEngine } from '../src/virtual-robot-designer/studio/football-match-engine.js';
import {
  compileFootballScratchScript,
  createFootballRuntimes,
  tickFootballRuntimes,
} from '../src/virtual-robot-designer/data/football-block-runtime.js';
import { FOOTBALL_ROLE_STARTERS } from '../src/virtual-robot-designer/data/football-blocks.js';

const challenge = {
  id: 'football_fifa',
  matchMode: 'fifa3v3',
  teamSize: 3,
  goalsToWin: 3,
  timeLimit: 120,
  aiDifficulty: 'medium',
};

const scene = { userData: { football: null } };
const match = createFootballEngine({ challenge, playerConfig: { chassisId: 'footballbot' } });
scene.userData.football = match;

const programs = {
  p0: compileFootballScratchScript(FOOTBALL_ROLE_STARTERS.defender),
  p1: compileFootballScratchScript(FOOTBALL_ROLE_STARTERS.striker),
  p2: compileFootballScratchScript(FOOTBALL_ROLE_STARTERS.midfielder),
};
const runtimes = createFootballRuntimes(programs, scene);
const runtimeKeys = Object.keys(runtimes);

const bots = match.getBots();
const start = Object.fromEntries(bots.map((b) => [b.id, { x: b.x, z: b.z }]));
const peakDist = Object.fromEntries(bots.map((b) => [b.id, 0]));

const dt = 1 / 60;
const frames = 45 * 60;

for (let i = 0; i < frames && !match.isOver(); i += 1) {
  tickFootballRuntimes(runtimes, dt);
  match.tick(dt);
  for (const b of bots) {
    const s = start[b.id];
    peakDist[b.id] = Math.max(peakDist[b.id], Math.hypot(b.x - s.x, b.z - s.z));
  }
}

const state = match.getState();
const movement = bots.map((b) => ({
  id: b.id,
  team: b.team,
  role: b.role,
  dist: Number(peakDist[b.id].toFixed(2)),
}));

const green = movement.filter((m) => m.team === 'player');
const blue = movement.filter((m) => m.team === 'enemy');
const report = {
  runtimeKeys,
  kickoffDone: state.kickoffDone,
  playerGoals: state.playerGoals,
  enemyGoals: state.enemyGoals,
  passes: state.passes,
  shots: state.shots,
  greenMoved: green.filter((m) => m.dist > 1.2).length,
  blueMoved: blue.filter((m) => m.dist > 1.2).length,
  movement,
  pass: runtimeKeys.length === 3
    && green.every((m) => m.dist > 0.8)
    && blue.every((m) => m.dist > 0.8)
    && state.shots >= 1,
};

console.log(JSON.stringify(report, null, 2));

if (!report.pass) {
  console.error('football-smoke FAIL');
  process.exit(1);
}
console.log('football-smoke OK');
