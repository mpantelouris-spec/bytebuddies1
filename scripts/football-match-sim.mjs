#!/usr/bin/env node
/**
 * Headless FIFA 3v3 match tick — verifies multiple bots move after kickoff.
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

const scene = {
  userData: {
    football: null,
  },
};

const match = createFootballEngine({
  challenge,
  playerConfig: { chassisId: 'footballbot' },
});
scene.userData.football = match;

const programs = {
  p0: compileFootballScratchScript(FOOTBALL_ROLE_STARTERS.defender),
  p1: compileFootballScratchScript(FOOTBALL_ROLE_STARTERS.striker),
  p2: compileFootballScratchScript(FOOTBALL_ROLE_STARTERS.midfielder),
};
const runtimes = createFootballRuntimes(programs, scene);

const bots = match.getBots();
const start = Object.fromEntries(bots.map((b) => [b.id, { x: b.x, z: b.z }]));
const peakDist = Object.fromEntries(bots.map((b) => [b.id, 0]));

const dt = 1 / 60;
const totalFrames = 7200; // 120 seconds
let frames = 0;

while (frames < totalFrames && !match.isOver()) {
  tickFootballRuntimes(runtimes, dt);
  match.tick(dt);
  for (const b of bots) {
    const s = start[b.id];
    const dist = Math.hypot(b.x - s.x, b.z - s.z);
    peakDist[b.id] = Math.max(peakDist[b.id], dist);
  }
  frames += 1;
}

const movement = bots.map((b) => {
  const s = start[b.id];
  const dist = peakDist[b.id];
  return {
    id: b.id,
    team: b.team,
    role: b.role,
    isPlayer: b.isPlayer,
    dist: Number(dist.toFixed(2)),
    x: Number(b.x.toFixed(2)),
    z: Number(b.z.toFixed(2)),
  };
});

const state = match.getState();
const green = movement.filter((m) => m.team === 'player');
const blue = movement.filter((m) => m.team === 'enemy');
const greenMoved = green.filter((m) => m.dist > 1.2);
const blueMoved = blue.filter((m) => m.dist > 1.2);
const allGreenActive = green.every((m) => m.dist > 0.8);

const report = {
  frames,
  kickoffDone: state.kickoffDone,
  playerGoals: state.playerGoals,
  enemyGoals: state.enemyGoals,
  passes: state.passes,
  shots: state.shots,
  possession: state.possession,
  possessionLabel: state.possessionLabel,
  greenMovedCount: greenMoved.length,
  blueMovedCount: blueMoved.length,
  movement,
  pass: greenMoved.length >= 2 && blueMoved.length >= 2 && allGreenActive
    && state.shots >= 1
    && (state.playerGoals + state.enemyGoals >= 2 || state.passes >= 3),
};

console.log(JSON.stringify(report, null, 2));

if (!report.pass) {
  console.error('FAIL: need 6-bot movement, shots, and goals/passes in 120s');
  process.exit(1);
}
if (!state.kickoffDone) {
  console.error('FAIL: kickoff never completed');
  process.exit(1);
}
console.log('football-match-sim OK');
