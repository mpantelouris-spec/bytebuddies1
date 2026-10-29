/**
 * Hop Bot — a Crossy-Road style crossing game. Hop across busy roads, ride
 * logs over rivers and dodge trains to reach the finish. Teaches timing,
 * sensors and "wait until" thinking.
 */
import { createArcadeExpansion } from '../expanded-levels.js';

export const HCOLS = 15, HCELL = 32;
const WRAP = HCOLS + 6;
const HOP_T = 0.22;

const mod = (a, n) => ((a % n) + n) % n;

/* ─── Lane makers ─── */
const grass = (trees = []) => ({ type: 'grass', trees });
const goal = () => ({ type: 'goal', trees: [] });
function movers(type, speed, spacing, len, phase = 0) {
  const n = Math.max(1, Math.ceil(WRAP / spacing));
  const L = spacing * n;
  return { type, speed, L, len, items: Array.from({ length: n }, (_, i) => phase + i * spacing) };
}
const road = (speed, spacing = 6, len = 1, phase = 0) => movers('road', speed, spacing, len, phase);
const river = (speed, spacing = 5, len = 3, phase = 0) => movers('river', speed, spacing, len, phase);
const rail = (speed = 14, every = 70, phase = 0) => ({ ...movers('rail', speed, every, 9, phase), every });

const LEVELS = [
  { title: 'Garden hop', goal: 'Hop all the way up the garden to the finish flag.', hint: 'Repeat → Hop forward. How many rows?', par: 2,
    lanes: [grass(), grass(), grass(), grass(), grass(), goal()], palette: ['hop_forward', 'hop_left', 'hop_right', 'repeat'],
    starter: [['repeat', 0, { times: 2 }], ['hop_forward', 1]] },
  { title: 'Quiet road', goal: 'One road with a few cars. Wait for a gap, then hop!', hint: 'Forever → If safe ahead → Hop forward. Else → Wait.', par: 5,
    lanes: [grass(), road(2, 4, 2), grass(), grass(), goal()], palette: ['hop_forward', 'hop_left', 'hop_right', 'wait', 'forever', 'if', 'else'],
    starter: [['forever'], ['if', 1, { cond: 'safe_ahead' }], ['hop_forward', 2]] },
  { title: 'Busy street', goal: 'Three roads, cars going both ways.', hint: 'Same code — the sensor checks the lane in front for you!', par: 5,
    lanes: [grass(), road(1.8, 6), grass(), road(-2.2, 7, 2), grass(), road(2.5, 8), grass(), goal()], palette: ['hop_forward', 'hop_left', 'hop_right', 'wait', 'forever', 'if', 'else'] },
  { title: 'Tree garden', goal: 'Trees block the way! Hop round them.', hint: 'If tree ahead → Hop right. Else → (If safe ahead → Hop forward, Else → Wait).', par: 8,
    lanes: [grass(), grass([7]), road(1.8, 6), grass([7, 8]), grass([6, 7, 8]), road(-2, 7), grass([9]), goal()], palette: ['hop_forward', 'hop_left', 'hop_right', 'wait', 'forever', 'if', 'else'] },
  { title: 'Log river', goal: 'Water! Hop onto the floating logs — never into the river.', hint: 'Safe ahead also checks for a log to land on. Wait for one!', par: 5,
    lanes: [grass(), river(1.2, 5, 3), river(-1.4, 6, 3, 2), grass(), goal()], palette: ['hop_forward', 'hop_left', 'hop_right', 'wait', 'forever', 'if', 'else'] },
  { title: 'Downtown', goal: 'Four roads. Keep your timing sharp!', hint: 'Forever → If safe ahead → Hop forward. Else → Wait a tiny bit (0.1 s).', par: 5,
    lanes: [grass(), road(2, 6), road(-2.4, 7, 2, 3), grass(), road(2.8, 8), road(-2, 6, 1, 2), grass(), goal()], palette: ['hop_forward', 'hop_left', 'hop_right', 'hop_back', 'wait', 'forever', 'if', 'else'] },
  { title: 'Train crossing', goal: 'Trains zoom past FAST. Watch the warning lights!', hint: 'Safe ahead knows about trains too. Never wait ON the tracks.', par: 5,
    lanes: [grass(), rail(14, 70, 0), grass(), road(2, 6), grass(), rail(-15, 63, 20), grass(), goal()], palette: ['hop_forward', 'hop_left', 'hop_right', 'hop_back', 'wait', 'forever', 'if', 'else'] },
  { title: 'River run', goal: 'Four rivers. Ride the logs — but don\'t float off the edge!', hint: 'If near the edge → hop left or right to stay on the log.', par: 12, startX: 12,
    lanes: [grass(), river(1.6, 8, 3), river(-1.8, 9, 3, 2), river(2, 8, 3, 1), river(-1.6, 9, 3, 3), grass(), goal()],
    palette: ['hop_forward', 'hop_left', 'hop_right', 'hop_back', 'wait', 'forever', 'if', 'else'] },
  { title: 'Rush hour', goal: 'Roads packed together with no safe grass in between!', hint: 'If danger here → hop forward if safe, otherwise hop back.', par: 11,
    lanes: [grass(), road(2.2, 7), road(-2.4, 7, 2, 2), road(2.8, 8, 1, 4), road(-2.2, 7, 1, 1), grass(), goal()],
    palette: ['hop_forward', 'hop_left', 'hop_right', 'hop_back', 'wait', 'forever', 'if', 'else'] },
  { title: 'Grand crossing', goal: 'Roads, rivers, trains and trees — cross them all!', hint: 'Put danger and edge checks first, then safe ahead.', par: 22,
    lanes: [grass(), road(2, 6), grass([5, 6]), river(1.3, 5, 3), river(-1.5, 6, 4, 2), grass([9]), rail(15, 70, 10), grass(), road(-2.4, 7, 2), road(2.6, 8, 1, 3), grass([7]), goal()],
    palette: ['hop_forward', 'hop_left', 'hop_right', 'hop_back', 'wait', 'forever', 'if', 'else', 'repeat_until'] },
];
LEVELS.push(...createArcadeExpansion({ id: 'hopbot', title: 'Hop Bot', emoji: '🐸', color: '#22c55e', levels: LEVELS }));

/** Left edge (in columns) of every mover in a lane at time t, including wrapped copies. */
export function moverXs(lane, t) {
  return lane.items.map((x0) => mod(x0 + lane.speed * t, lane.L) - 3);
}

function hitByVehicle(lane, t, x) {
  if (lane.type !== 'road' && lane.type !== 'rail') return false;
  const c = x + 0.5;
  return moverXs(lane, t).some((vx) => [vx, vx - lane.L, vx + lane.L].some((v) => c > v - 0.35 && c < v + lane.len + 0.35));
}
function onLog(lane, t, x) {
  const c = x + 0.5;
  return moverXs(lane, t).some((lx) => [lx, lx - lane.L, lx + lane.L].some((v) => c > v + 0.1 && c < v + lane.len - 0.1));
}
function laneSafe(lane, t, x, window = 0.45) {
  if (!lane) return false;
  if (lane.type === 'grass' || lane.type === 'goal') return !lane.trees.includes(Math.round(x));
  if (lane.type === 'river') return [0.05, 0.1, 0.15, 0.22, 0.35, 0.5].every((k) => onLog(lane, t + k, x));
  for (let k = 0.05; k <= HOP_T + window; k += 0.05) if (hitByVehicle(lane, t + k, x)) return false;
  return true;
}

export const hop = {
  id: 'hopbot',
  title: 'Hop Bot',
  emoji: '🐸',
  color: '#22c55e',
  blurb: 'Crossy-road style! Hop over busy roads, ride the river logs and dodge trains to reach the flag.',
  conditions: [
    { id: 'safe_ahead', label: 'safe to hop forward' },
    { id: 'tree_ahead', label: 'tree ahead' },
    { id: 'danger_here', label: 'danger where I am' },
    { id: 'safe_behind', label: 'safe to hop back' },
    { id: 'on_log', label: 'on a log' },
    { id: 'near_left_edge', label: 'near the left edge' },
    { id: 'near_right_edge', label: 'near the right edge' },
    { id: 'train_coming', label: 'train coming' },
    { id: 'at_finish', label: 'at the finish' },
  ],
  blocks: {
    hop_forward: { label: 'Hop forward', icon: '⬆️', color: '#22c55e', cat: 'Move' },
    hop_back: { label: 'Hop back', icon: '⬇️', color: '#22c55e', cat: 'Move' },
    hop_left: { label: 'Hop left', icon: '⬅️', color: '#3b82f6', cat: 'Move' },
    hop_right: { label: 'Hop right', icon: '➡️', color: '#3b82f6', cat: 'Move' },
  },
  levels: LEVELS,
  get size() { return [HCOLS * HCELL, 12 * HCELL]; },

  init(levelIdx) {
    const L = LEVELS[levelIdx];
    return {
      level: levelIdx,
      t: 0,
      lanes: L.lanes,
      row: 0,
      x: L.startX ?? 7,
      from: { row: 0, x: L.startX ?? 7 },
      hopT: 1,
      best: 0,
      bonks: 0,
      cmd: null,
      result: null,
      splash: null,
    };
  },

  start(w, action) {
    const c = { ...action, t: 0, dur: 0 };
    let row = w.row, x = w.x;
    if (action.type === 'hop_forward') row++;
    else if (action.type === 'hop_back') row--;
    else if (action.type === 'hop_left') x--;
    else if (action.type === 'hop_right') x++;
    else { w.cmd = c; return; }
    c.dur = HOP_T;
    const lane = w.lanes[row];
    const blocked = row < 0 || row >= w.lanes.length || x < 0 || x > HCOLS - 1
      || (lane && (lane.type === 'grass' || lane.type === 'goal') && lane.trees.includes(Math.round(x)));
    if (blocked) {
      w.bonks++;
      if (w.bonks > 300) w.result = { lose: true, msg: 'Hop Bot keeps bumping into things. Check "tree ahead"!' };
      w.cmd = c;
      return;
    }
    w.from = { row: w.row, x: w.x };
    // Leaving the river: land in the middle of a square
    if (w.lanes[w.row]?.type === 'river' && lane.type !== 'river') x = Math.round(x);
    w.row = row; w.x = x; w.hopT = 0;
    w.best = Math.max(w.best, row);
    w.cmd = c;
  },

  tick(w, dt) {
    if (w.result) return;
    w.t += dt;
    w.hopT = Math.min(1, w.hopT + dt / HOP_T);
    const lane = w.lanes[w.row];
    // Riding a log
    if (lane.type === 'river' && w.hopT >= 0.3) {
      w.x += lane.speed * dt;
      if (w.x < -0.4 || w.x > HCOLS - 0.6) { w.result = { lose: true, msg: 'Hop Bot floated off the edge! Use "near the edge" and hop the other way.' }; return; }
    }
    const landed = w.hopT >= 0.3;
    if (landed && lane.type === 'river' && !onLog(lane, w.t, w.x)) {
      w.splash = { row: w.row, x: w.x, t: w.t };
      w.result = { lose: true, msg: 'Splash! Hop Bot fell in the river. Wait until "safe ahead" says there is a log.' };
      return;
    }
    if (landed && hitByVehicle(lane, w.t, w.x)) {
      w.result = { lose: true, msg: lane.type === 'rail' ? 'Whoosh — the train got Hop Bot! Never wait on the tracks.' : 'Beep beep! Hop Bot was hit by a car. Wait for "safe ahead".' };
      return;
    }
    if (w.row === w.lanes.length - 1 && w.hopT >= 1) {
      w.result = { win: true, msg: `Made it across in ${w.t.toFixed(1)} s!` };
      return;
    }
    const c = w.cmd;
    if (c && !c.done) { c.t += dt; if (c.t >= c.dur) c.done = true; }
    if (w.t > 120) w.result = { lose: true, msg: 'Time up! Hop forward whenever it is safe.' };
  },

  sense(w, cond) {
    const t = w.t;
    const here = w.lanes[w.row], ahead = w.lanes[w.row + 1], behind = w.lanes[w.row - 1];
    const drift = 0; // Hop Bot stays put mid-hop, then rides whatever it lands on
    switch (cond) {
      case 'safe_ahead': return laneSafe(ahead, t, w.x + drift);
      case 'safe_behind': return laneSafe(behind, t, w.x + drift);
      case 'tree_ahead': return !!ahead && (ahead.type === 'grass' || ahead.type === 'goal') && ahead.trees.includes(Math.round(w.x));
      case 'danger_here': {
        if (here.type === 'river') return w.x < 1 || w.x > HCOLS - 2;
        for (let k = 0; k <= 0.7; k += 0.05) if (hitByVehicle(here, t + k, w.x)) return true;
        return false;
      }
      case 'on_log': return here.type === 'river';
      case 'near_left_edge': return w.x < 1.5;
      case 'near_right_edge': return w.x > HCOLS - 2.5;
      case 'train_coming': {
        const lane = ahead?.type === 'rail' ? ahead : here.type === 'rail' ? here : null;
        if (!lane) return false;
        for (let k = 0; k <= 1.5; k += 0.1) if (hitByVehicle(lane, t + k, w.x)) return true;
        return false;
      }
      case 'at_finish': return w.row === w.lanes.length - 1;
      default: return false;
    }
  },

  status(w) { return w.result; },
  end(w) { return w.result || { lose: true, msg: 'Your program stopped before the finish. Try a Forever loop!' }; },

  hud(w) {
    return [
      { icon: '🏁', val: `${w.row}/${w.lanes.length - 1}`, lbl: 'Rows', color: '#4ade80' },
      { icon: '🚦', val: this.sense(w, 'safe_ahead') ? 'GO' : 'WAIT', lbl: 'Ahead', color: this.sense(w, 'safe_ahead') ? '#4ade80' : '#f87171' },
      { icon: '⏱', val: `${Math.floor(w.t)}s`, lbl: 'Time', color: '#93c5fd' },
    ];
  },
  progress(w) { return { current: w.best, target: w.lanes.length - 1, label: 'rows crossed', pct: Math.round((w.best / (w.lanes.length - 1)) * 100) }; },
};
