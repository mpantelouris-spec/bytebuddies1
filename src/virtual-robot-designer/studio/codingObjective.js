/**
 * Coding objective for every Robot Studio arena.
 *
 * Each arena already says which skill it teaches (Loops, Sensors, Timing…). This turns that
 * into a classroom-style objective: an "I can…" statement, how to do it in this arena, and a
 * checklist that ticks itself off by reading the pupil's program (blocks or Python).
 *
 * Objectives are built from the arena itself — the route a drone has to fly, how many parcels
 * to drop, the goals to score, the pipes to pass — so no two arenas share one, and they grow
 * with the difficulty: Tutorial arenas ask for 2 things, Expert arenas for 6, with tighter
 * targets (more moves, fewer blocks, more checks) as the levels get harder.
 * Checks only ask for blocks this robot actually has, so every one can be met.
 */
import { robotCommands } from './robotPython.js';
import { gamePythonExtras } from './robotPythonGames.js';
import { getTierLevel, TIER_ENGINE } from '../data/tier-levels/index.js';
import { findRepeat } from '../data/tier-levels/lessons.js';
import { getMissionAction } from '../data/mission-actions.js';
import { FIGHT_WORLDS } from '../data/fight-worlds.js';
import { getPrimaryStarterScript } from '../data/primary-robot-studio.js';

const LOOP_IDS = ['repeat', 'forever', 'repeat_until_goal', 'repeat_until', 'repeat_while'];
const STRUCTURE = new Set([...LOOP_IDS, 'end', 'else', 'wait', 'wait_until', 'break_loop', 'set_var', 'change_var', 'create_var', 'if_then', 'if_else', 'define_func', 'call_func']);
const SENSE_IDS = ['move_forward_until', 'turn_until_facing', 'walk_until', 'obstacle_ahead', 'line_below', 'if_color',
  'if_distance', 'scan', 'detect_item', 'see_object', 'sonar_ping', 'read_altitude', 'depth_sensor', 'pressure', 'wind_speed'];
const TIMING_IDS = ['wait', 'set_speed', 'boost', 'brake', 'hover_hold'];
const TIMING_NAMES = { wait: 'Wait', set_speed: 'Set speed', boost: 'Boost', brake: 'Brake', hover_hold: 'Hover' };
const VAR_IDS = ['set_var', 'change_var'];
const TURN_RE = /turn|bank|curve|rotate|spin|u_turn/;
const ACTION_NAME = { drop_package: 'Drop package', take_photo: 'Take photo', light_up: 'Light up', land: 'Land', scan_here: 'Scan here', pick_up: 'Pick up', drop_off: 'Drop off' };

/* ── How hard an arena is: 0 Tutorial · 1 Easy · 2 Medium · 3 Hard · 4 Expert/Advanced ── */
const RANKS = [['tutorial', 0], ['easy', 1], ['medium', 2], ['hard', 3], ['expert', 4], ['advanced', 4], ['capstone', 4]];
const RANK_NAME = ['Tutorial', 'Easy', 'Medium', 'Hard', 'Expert'];
/** How many things the checklist asks for at each difficulty. */
const GOALS_FOR_RANK = [2, 3, 4, 5, 6];

function rankOf(course, level) {
  const d = String(level?.tier || course.difficulty || '').toLowerCase();
  const hit = RANKS.find(([k]) => d.includes(k));
  if (hit) return hit[1];
  const m = Number(course.modeIndex) || 1;
  return m <= 1 ? 0 : m <= 3 ? 1 : m <= 6 ? 2 : m <= 9 ? 3 : 4;
}

/** Which family of skill an arena's skill name belongs to (order matters). */
const BUCKETS = [
  ['loops', /loop|repeat/i],
  ['debugging', /debug/i],
  ['functions', /function|decompos|break/i],
  ['capstone', /capstone|combine/i],
  ['variables', /variable|\bstate\b|score|count/i],
  ['events', /event/i],
  ['conditions', /condition|\bif\b|if-|decision|reaction|strategy/i],
  ['sensors', /sensor|sensing|scan|search|detect/i],
  ['timing', /timing|wait|speed|racing|maths|time|moving puzzle/i],
  ['precision', /precision/i],
  ['route', /angle|turn|path|coordinat|height|altitude|route|geometry|direction/i],
];

/** "I can…" for each skill, growing with the difficulty (Tutorial → Expert). */
const ICAN = {
  sequencing: [
    'I can add a block and run it to see what my robot does.',
    'I can put a few instructions in the right order.',
    'I can plan a longer sequence and check each step works before adding the next.',
    'I can find and fix the step that is in the wrong place in a long sequence.',
    'I can plan a whole mission as a sequence and make it short and clear.',
  ],
  loops: [
    'I can use a Repeat block to do a move more than once.',
    'I can spot a pattern and put it inside a loop.',
    'I can use a loop to shorten a route, so my program needs fewer blocks.',
    'I can combine a loop with turns and actions to solve a repeating route.',
    'I can plan an efficient program with loops inside a bigger plan, using as few blocks as possible.',
  ],
  conditions: [
    'I can use a check so the robot does something only when it is true.',
    'I can make the robot decide what to do by checking what is around it.',
    'I can use if and else so the robot has a plan for both answers.',
    'I can use several checks so the robot reacts to different situations.',
    'I can build a decision plan with many checks inside a loop, in the right order of importance.',
  ],
  sensors: [
    'I can use a sensor block to look ahead.',
    'I can use a sensor so the robot reacts to the world instead of guessing.',
    'I can combine a sensor with movement so the robot stops or turns at the right place.',
    'I can use sensors inside a loop to keep checking as the robot moves.',
    'I can plan a route that relies on sensors, so it works even when things change.',
  ],
  events: [
    'I can use an event block to start some code.',
    'I can use events to make code run when something happens.',
    'I can use two different events to control my robot.',
    'I can use events together with loops so the robot keeps reacting.',
    'I can design a program where several events work together.',
  ],
  timing: [
    'I can change how fast my robot goes.',
    'I can control speed and timing so the robot moves at the right moment.',
    'I can use different speeds and waits for different parts of the course.',
    'I can tune my timing to make the robot faster without crashing.',
    'I can plan speed and timing for a whole course to beat a target.',
  ],
  route: [
    'I can turn my robot to face a new direction.',
    'I can plan a route using turns with the right number of degrees.',
    'I can use turns of different sizes to follow a tricky route.',
    'I can work out every angle on a long route before I build it.',
    'I can plan a complex route with exact angles and heights, and keep it short.',
  ],
  precision: [
    'I can use a small move to get closer to a target.',
    'I can use small, careful moves to reach the exact spot.',
    'I can mix big and small moves to be fast and accurate.',
    'I can test and adjust my moves until the robot stops exactly in place.',
    'I can plan a precise route and tune every number in it.',
  ],
  variables: [
    'I can set a variable to remember a number.',
    'I can use a variable to remember a number, like a score or a counter.',
    'I can change a variable while the program runs.',
    'I can use a variable to keep count of what happens in the game.',
    'I can use variables to track the game and help my robot decide.',
  ],
  functions: [
    'I can break a job into small steps.',
    'I can break a big job into smaller parts.',
    'I can reuse a part of my program instead of building it again.',
    'I can split a big mission into jobs and solve them one at a time.',
    'I can decompose a big mission into reusable parts and join them together.',
  ],
  debugging: [
    'I can run my program and watch what happens.',
    'I can find the first thing that goes wrong.',
    'I can test my program, find the mistake and fix it.',
    'I can test in small parts and fix one mistake at a time.',
    'I can debug a long program by testing each part and improving it.',
  ],
  capstone: [
    'I can use what I have learned to solve a challenge.',
    'I can combine moves and loops to solve a challenge.',
    'I can combine sequences, loops and sensors to solve a bigger challenge.',
    'I can choose the right tools — loops, checks and turns — for each part of a challenge.',
    'I can plan and build a complete solution using everything I have learned.',
  ],
};

const INFO = {
  sequencing: { concept: 'Sequencing', how: 'Plan the route first, then add one block for each step, in order.', python: 'robot.move_forward(3)\nrobot.turn_right(90)', think: 'What happens if two of your blocks swap places?' },
  loops: { concept: 'Loops', how: 'Find the moves that happen again and again, and put them inside a Repeat block.', python: 'for i in range(4):\n    robot.move_forward(2)', think: 'How many blocks did your loop save you?' },
  conditions: { concept: 'Conditions', how: 'Use a block that checks something, then choose what the robot does next.', python: 'while not robot.obstacle_ahead():\n    robot.move_forward(1)', think: 'What should the robot do when the check is false?' },
  sensors: { concept: 'Sensors', how: 'Add a sensor block (like Move forward until, or Scan) where the robot needs to look.', python: 'while not robot.obstacle_ahead():\n    robot.move_forward(1)', think: 'Why is a sensor better than counting steps?' },
  events: { concept: 'Events', how: 'Add a When… event block and put the blocks that should run underneath it.', python: 'def on_space():\n    robot.turn_left(90)', think: 'Which event did you choose, and why that one?' },
  timing: { concept: 'Timing & speed', how: 'Use Wait, Set speed or Boost: slow down for tricky parts, speed up on straights.', python: 'robot.set_speed(40)\nwait(1)', think: 'Where did slowing down help, and where did it cost time?' },
  route: { concept: 'Turns & angles', how: 'Work out each turn before you add it. Two 45° turns make one 90° corner.', python: 'robot.turn_left(45)\nrobot.turn_right(90)', think: 'Which turns face the robot back the way it started?' },
  precision: { concept: 'Precision', how: 'Use short moves of 1 or 2 steps near the target, and test as you go.', python: 'robot.move_forward(1)', think: 'Why do small steps help near the end?' },
  variables: { concept: 'Variables', how: 'Set a variable at the start, then change it when something happens.', python: 'score = 0\nscore += 1', think: 'What would go wrong if the robot could not remember the number?' },
  functions: { concept: 'Decomposition', how: 'Solve one small part, test it, then reuse it with a loop (or a def in Python).', python: 'def visit():\n    robot.move_forward(2)\n    robot.turn_right(90)\n\nvisit()\nvisit()', think: 'Which parts of the job look the same?' },
  debugging: { concept: 'Debugging', how: 'Run your program, watch where it first goes wrong, change that block, then run it again.', python: '# run, watch, fix one line, run again', think: 'Where did the robot first go wrong, and why?' },
  capstone: { concept: 'Putting it together', how: 'Use what you have learned: a loop for repeats and a sensor or careful turns for the tricky parts.', python: 'for i in range(3):\n    robot.move_forward(2)\n    robot.turn_right(90)', think: 'Which skill helped you most in this challenge?' },
};

/** What the arena's own tip asks for, when it names a concept. */
const TIP_BUCKETS = [
  ['loops', /\brepeat\b|\bloop|forever/i],
  ['sensors', /sensor/i],
  ['conditions', /\bif\b/i],
  ['variables', /variable/i],
  ['events', /\bevent|\bwhen\b.*\b(pressed|key|space)/i],
  ['timing', /\bwait\b|\bspeed\b|\bslower\b|\bboost\b/i],
];
/** "In this arena" for game arenas that have no tip of their own. */
const KIND_HOW = {
  fighting: 'Build a combo: put your moves in the order you want them to happen, then test it against your rival.',
  football: 'Use If: if you have the ball, shoot or pass; else chase the ball.',
  flappy: 'Use Forever with Flap and Wait. Change the Wait until the bird stays in the air.',
  craft: 'Do one job at a time: move, mine, collect. Doing the same thing again? Use a Repeat block.',
};
const KEEP_SKILL = new Set(['capstone', 'debugging']);

function bucketFor(skill) {
  const s = String(skill || '');
  const hit = BUCKETS.find(([, re]) => re.test(s));
  return hit ? hit[0] : 'sequencing';
}

/* ════════════════════════ Reading a program ════════════════════════ */

/** Read a program into the facts the checks need. */
function readProgram(blocks = [], python = null) {
  const list = (blocks || []).filter(Boolean);
  const isHat = (b) => String(b.id).startsWith('when_');
  const counts = new Map();   // how many times each command runs (Repeat counted in)
  const args = new Map();     // first number given to each command
  const repeatTimes = new Set();
  let mult = 1, inLoop = 0, best = 0, inside = false;
  list.forEach((b) => {
    const pv = b.paramValues || {};
    if (LOOP_IDS.includes(b.id)) {
      inside = true; inLoop = 0;
      mult = b.id === 'repeat' ? Math.max(1, Number(pv.times) || 1) : 1;
      if (b.id === 'repeat') repeatTimes.add(Number(pv.times));
      counts.set(b.id, (counts.get(b.id) || 0) + 1);
      return;
    }
    if (isHat(b)) { inside = false; mult = 1; return; }
    if (inside) { inLoop += 1; best = Math.max(best, inLoop); }
    counts.set(b.id, (counts.get(b.id) || 0) + (inside ? mult : 1));
    const n = Object.values(pv).map(Number).find((v) => Number.isFinite(v));
    if (n != null) args.set(b.id, [...(args.get(b.id) || []), n]);
  });
  const ids = new Set(list.map((b) => b.id));
  const conds = new Set(list.map((b) => b.paramValues?.cond).filter(Boolean));
  if (python) (python.match(/robot\.([a-z_]\w*)\(\)\s*:/g) || []).forEach((m) => conds.add(m.replace(/^robot\.|\(\)\s*:$/g, '')));
  const turnAngles = new Set(list.filter((b) => TURN_RE.test(b.id))
    .map((b) => Number(b.paramValues?.degrees)).filter((n) => Number.isFinite(n)));
  const smallMoves = list.filter((b) => {
    const v = b.paramValues || {};
    const n = Number(v.steps ?? v.distance ?? v.units);
    return Number.isFinite(n) && n > 0 && n <= 2;
  }).length;
  const hats = list.filter(isHat);
  const actionIds = [...ids].filter((id) => !STRUCTURE.has(id) && !id.startsWith('when_') && !id.startsWith('if_'));
  const ifIds = new Set([...ids].filter((id) => id.startsWith('if_') || id === 'if_then'));
  // Python's lab loops are worked out before running, so read them from the code itself
  let pyLoopBody = 0;
  let pyLines = 0;
  if (python) {
    const lines = python.split('\n');
    lines.forEach((ln, i) => {
      if (ln.trim() && !/^\s*#/.test(ln)) pyLines += 1;
      const r = ln.match(/\brange\s*\(\s*(\d+)\s*\)/);
      if (r) repeatTimes.add(Number(r[1]));
      const m = ln.match(/^(\s*)(for|while)\b.*:\s*(#.*)?$/);
      if (!m) return;
      let n = 0;
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].trim() || /^\s*#/.test(lines[j])) continue;
        if (lines[j].match(/^\s*/)[0].length <= m[1].length) break;
        n += 1;
      }
      pyLoopBody = Math.max(pyLoopBody, n);
    });
  }
  const pyHasLoop = !!python && /^\s*(for|while)\b/m.test(python);
  const pyHasVar = !!python && /^\s*[a-z_]\w*\s*(\+|-|\*)?=(?!=)/im.test(python);
  const pyHasDef = !!python && /^\s*def\s+(?!on_)\w+\s*\(/m.test(python);
  const moves = [...counts.entries()].filter(([id]) => !STRUCTURE.has(id) && !id.startsWith('if_') && !id.startsWith('when_')).reduce((a, [, n]) => a + n, 0);
  return {
    ids, counts, args, repeatTimes, moves, conds,
    actions: list.filter((b) => !isHat(b) && !LOOP_IDS.includes(b.id) && !['end', 'else'].includes(b.id)).length,
    distinct: actionIds.length,
    size: python ? pyLines : list.filter((b) => !isHat(b) && !['end', 'else'].includes(b.id)).length,
    inLoop: Math.max(best, pyLoopBody),
    hasLoop: LOOP_IDS.some((id) => ids.has(id)) || pyHasLoop,
    loops: LOOP_IDS.reduce((a, id) => a + (counts.get(id) || 0), 0) + (python ? (python.match(/^\s*(for|while)\b/gm) || []).length : 0),
    hasVar: VAR_IDS.some((id) => ids.has(id)) || pyHasVar, hasDef: pyHasDef,
    hasElse: ids.has('else') || (!!python && /^\s*else\s*:/m.test(python)),
    ifIds, turnAngles, smallMoves, otherEvents: hats.filter((h) => h.id !== 'when_start').length,
    eventKinds: new Set(hats.map((h) => h.id).filter((id) => id !== 'when_start')).size,
  };
}

/* ════════════════════════ Checks ════════════════════════ */

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const C = {
  run: (where) => ({ id: 'run', label: where ? `Run it in ${where} and watch what happens` : 'Run your program and watch what happens', test: (p, r) => r.runs >= 1 }),
  improve: (n = 1) => ({ id: `improve${n}`, label: n === 1 ? 'Change something and run it again' : `Improve it and run it again ${n} times`, test: (p, r) => r.editedRuns >= n }),
  moves: (n) => ({ id: `moves${n}`, label: n <= 1 ? 'Add a movement block' : `Make the robot do at least ${n} moves`, test: (p) => p.moves >= n }),
  distinct: (n) => ({ id: `distinct${n}`, label: `Use at least ${n} different commands`, test: (p) => p.distinct >= n }),
  loop: (label = 'Use a Repeat (or Forever) loop') => ({ id: 'loop', label, test: (p) => p.hasLoop }),
  loops: (n) => ({ id: `loops${n}`, label: `Use ${n} loops`, test: (p) => p.loops >= n }),
  loopBody: (n) => ({ id: `loopBody${n}`, label: `Put ${n} or more blocks inside a loop`, test: (p) => p.inLoop >= n }),
  repeatN: (n, what) => ({ id: `repeat${n}`, label: `Use Repeat ${n}${what ? ` for ${what}` : ''} (in Python: for i in range(${n}))`, test: (p) => p.repeatTimes.has(n) }),
  // A short program only counts once it does enough: the moves it makes, with loops counted in
  budget: (n, minMoves = Math.ceil(n / 2)) => ({ id: `budget${n}`, label: `Keep your program to ${n} blocks or fewer`, test: (p) => p.size > 0 && p.size <= n && p.moves >= minMoves }),
  use: (ids, label, key) => ({ id: key || `use_${ids[0]}`, label, test: (p) => ids.some((id) => p.ids.has(id)) }),
  useTimes: (id, n, label) => ({ id: `times_${id}${n}`, label, test: (p) => (p.counts.get(id) || 0) >= n }),
  firstArg: (ids, v, label) => ({ id: `arg_${ids[0]}${v}`, label, test: (p) => ids.some((id) => (p.args.get(id) || []).includes(v)) }),
  angles: (list) => ({ id: `angles${list.join('_')}`, label: `Use ${list.length > 1 ? 'turns of' : 'a turn of'} ${list.map((a) => `${a}°`).join(' and ')}`, test: (p) => list.every((a) => p.turnAngles.has(a)) }),
  anglesN: (n) => ({ id: `anglesN${n}`, label: `Use turns of at least ${n} different sizes`, test: (p) => p.turnAngles.size >= n }),
  ifs: (n, label) => ({ id: `ifs${n}`, label: label || (n === 1 ? 'Use an if so the robot decides' : `Use ${n} different checks (ifs)`), test: (p) => p.ifIds.size >= n }),
  els: () => ({ id: 'else', label: 'Use else for when the check is false', test: (p) => p.hasElse }),
  event: (n = 1) => ({ id: `event${n}`, label: n === 1 ? 'Add a When… event (not just When START)' : `Use ${n} different events`, test: (p) => p.eventKinds >= n }),
  variable: () => ({ id: 'var', label: 'Set or change a variable', test: (p) => p.hasVar }),
  reuse: () => ({ id: 'reuse', label: 'Reuse a part: put it in a loop (or a def in Python)', test: (p) => p.hasLoop || p.hasDef }),
  small: (n = 1) => ({ id: `small${n}`, label: n === 1 ? 'Use a small move of 1 or 2 steps' : `Use ${n} small moves of 1 or 2 steps`, test: (p) => p.smallMoves >= n }),
};

/* ── Arena facts → checks that only this arena has ── */

const FOOTBALL_MOVES = {
  training: [['chase_ball', 'shoot'], 'chase the ball, then shoot'],
  keeper: [['dive_save', 'guard_goal', 'catch_ball'], 'guard the goal and dive to save'],
  penalties: [['shoot'], 'line up and shoot'],
  free_kick: [['shoot', 'lob_pass'], 'shoot or lob over the wall'],
  skills: [['dribble', 'shoot'], 'dribble past your rival, then shoot'],
  cup_final: [['short_pass', 'long_pass'], 'pass to a teammate before you shoot'],
  fifa: [['short_pass', 'long_pass', 'lob_pass'], 'pass and move as a team'],
  match: [['shoot'], 'use Shoot'],
};
const ENEMY_MOVES = {
  tank: [['block', 'high_guard', 'mid_guard', 'parry'], 'The Tank hits hard — use Block or Parry'],
  berserker: [['dodge', 'retreat_step', 'strafe_left', 'strafe_right'], 'The Berserker rushes in — Dodge or step away'],
  striker: [['jab', 'cross', 'hook'], 'Out-punch the Striker with fast jabs and crosses'],
  ninja: [['dodge', 'parry', 'block'], 'The Ninja is quick — Dodge or Parry'],
  mech: [['uppercut', 'heavy_kick', 'roundhouse'], 'The Mech is tough — use heavy hits'],
};

const SKY_IDS = { U: ['fly_up'], D: ['fly_down'], F: ['fly_forward', 'move_forward'], R: ['bank_right', 'turn_right'], L: ['bank_left', 'turn_left'] };
const SEA_IDS = { D: ['dive_deep'], F: ['swim_forward', 'move_forward'], R: ['turn_right'], L: ['turn_left'] };

/** Checks worked out from a level's own data, most important first. */
function arenaChecks(engine, level, rank, course, avail) {
  const out = [];
  const has = (id) => !avail.size || avail.has(id);
  if (course.arcade) {
    // Robot Arcade: the level's goal, the checks its hint talks about, and its 3-star block limit
    const A = course.arcade;
    const pal = new Set(A.palette || []);
    const text = `${course.tryThis || ''} ${course.desc || ''}`.toLowerCase();
    const named = (A.conditions || []).filter((c) => text.includes(c.label.toLowerCase()));
    if (pal.has('if') || pal.has('repeat_until')) {
      // The checks the hint talks about, then a different sensor to practise on each level
      const all = A.conditions || [];
      const rotate = all.length ? all[(Number(course.modeIndex) || 1) % all.length] : null;
      const pickConds = [...named, ...(rotate && !named.includes(rotate) ? [rotate] : [])].slice(0, rank >= 3 ? 3 : 2);
      pickConds.forEach((c) => out.push({ id: `cond_${c.id}`, label: `Check “${c.label}” (robot.${c.id}())`, test: (p) => p.conds.has(c.id) }));
    }
    if (pal.has('else') && rank >= 2) out.push(C.els());
    if (pal.has('repeat_until') && rank >= 2) out.push(C.use(['repeat_until'], 'Use Repeat until (while not …) so the loop stops by itself', 'until'));
    if (pal.has('forever') && rank >= 1) out.push(C.use(['forever'], 'Keep reacting with Forever (while True)', 'forever'));
    if (pal.has('repeat') && !pal.has('forever')) out.push(C.use(['repeat'], 'Use Repeat to save blocks', 'repeat'));
    const first = String(course.desc || '').split(/(?<=[.!?])\s/)[0].replace(/[.!]$/, '');
    // The level's goal and block limit, then numbers from its own map (a Forever loop that does it counts too)
    const lead = [];
    if (course.par) lead.push({ ...C.budget(course.par), label: `${first} — in ${course.par} blocks or fewer for 3 stars` });
    (A.facts || []).forEach((f) => lead.push({
      id: `fact_${f.ids[0]}${f.n}`, label: f.label,
      test: (p) => f.ids.reduce((a, id) => a + (p.counts.get(id) || 0), 0) >= f.n || (['forever', 'repeat_until'].some((id) => p.ids.has(id)) && f.ids.some((id) => p.ids.has(id))),
    }));
    return { checks: [...lead, ...out], detail: A.text || first };
  }
  if (!level) {
    // Modes 1–10: the arena's own action and the blocks its mission is built from
    if (!course.chassisId || !course.arenaBible) return { checks: out };
    const goalText = String(course.desc || '').replace(/[.!]$/, '');
    let action = null;
    try { action = getMissionAction(course); } catch { /* not every arena has one */ }
    if (action && has(action.id)) out.push(C.use([action.id], `${goalText} — use ${action.label}`, `act_${action.id}`));
    let starter = [];
    try { starter = getPrimaryStarterScript(course.chassisId, Number(course.modeIndex) || 1) || []; } catch { /* no starter */ }
    const kit = [...new Map(starter.filter((b) => b?.id && !String(b.id).startsWith('when_') && !STRUCTURE.has(b.id) && b.id !== action?.id && has(b.id)).map((b) => [b.id, b])).values()]
      .slice(0, Math.min(4, 2 + rank));
    if (kit.length) {
      const names = kit.map((b) => b.label || b.id);
      out.push({ id: `kit_${kit.map((b) => b.id).join('_')}`, label: `${action ? 'Also use' : `${goalText} — use`} ${names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0]}`, test: (p) => kit.every((b) => p.ids.has(b.id)) });
    }
    return { checks: out, detail: goalText };
  }
  if (engine === 'sky' || engine === 'sea') {
    const tokens = String(level.program || '').split(' ').filter(Boolean);
    const ids = engine === 'sky' ? SKY_IDS : SEA_IDS;
    const first = tokens[0] && tokens[0].match(/^([UD])(\d+)/);
    if (first) {
      const fid = ids[first[1]].filter(has);
      if (fid.length) out.push(C.firstArg(fid, Number(first[2]), engine === 'sky' ? `Start by flying up ${first[2]} m (Fly up ${first[2]})` : `Start by diving to ${first[2]} m (Dive to depth ${first[2]})`));
    }
    const stops = tokens.filter((t) => t === 'A').length;
    if (level.action && stops && has(level.action)) out.push(C.useTimes(level.action, stops, `Use ${ACTION_NAME[level.action] || level.action} ${stops === 1 ? 'once' : `${stops} times`} — once at each stop`));
    const angles = [...new Set(tokens.filter((t) => /^[RL]\d+/.test(t)).map((t) => Number(t.slice(1))))].sort((a, b) => a - b);
    if (angles.length && rank >= 1) out.push(C.angles(angles.slice(0, 3)));
    const rep = findRepeat(tokens);
    if (rep && rank >= 2) out.push(C.repeatN(rep.times, 'the pattern that repeats'));
    if (rank >= 2) out.push(C.budget(rep ? tokens.length - (rep.times - 1) * rep.len + 3 : tokens.length + 2, tokens.length - stops - 1));
    return { checks: out, detail: `${plural(tokens.length, 'step')}${stops ? `, ${plural(stops, 'stop')}` : ''}` };
  }
  if (engine === 'ground') {
    const corners = Math.max(0, Math.round(((level.route?.length || 4) - 4) / 2));
    const goalText = String(level.goal || '').replace(/\.$/, '');
    if (level.action && has(level.action)) out.push(C.useTimes(level.action, level.markers || 1, `${goalText} — use ${ACTION_NAME[level.action] || level.action} at all ${plural(level.markers || 1, 'marker')}`));
    else out.push({ ...C.moves((level.markers || 1) + corners), label: `${goalText} — make at least ${(level.markers || 1) + corners} moves` });
    if (corners && rank >= 1) out.push({ id: `corners${corners}`, label: `Plan the ${plural(corners, 'corner')}: use at least ${corners} turns`, test: (p) => [...p.counts.entries()].filter(([id]) => TURN_RE.test(id)).reduce((a, [, n]) => a + n, 0) >= corners });
    if (rank >= 2 && level.markers > 1) out.push(C.loopBody(2));
    return { checks: out, detail: `${plural(level.markers || 1, 'marker')}, ${plural(corners, 'corner')}` };
  }
  if (engine === 'arm') {
    const moves = Number(level.moves) || 1;
    out.push(C.useTimes('grip', moves, `Grip ${moves === 1 ? 'once' : `${moves} times`} — one for each job (${String(level.jobs || 'jobs').replace(/×/g, ' × ')})`));
    if (rank >= 1) out.push(C.useTimes('release', Math.min(moves, (level.task?.items?.length || 0) + (level.task?.sources?.length ? moves : 0)) || 1, 'Release each thing in its place'));
    const angles = [...new Set([...(level.task?.items || []), ...(level.task?.targets || []), ...(level.task?.bells || [])].map((o) => Math.abs(o.angle)).filter(Boolean))];
    if (rank >= 2 && angles.length > 1) out.push(C.anglesN(Math.min(3, angles.length)));
    if (rank >= 3 && level.task?.sources?.length) out.push(C.loop('Use a Repeat for the jobs that are the same'));
    return { checks: out, detail: `${plural(moves, 'job')}` };
  }
  if (engine === 'kart') {
    if (has('set_speed')) out.push(C.use(['set_speed'], `Set your speed to race ${plural(level.laps || 1, 'lap')} in ${level.targetTime}s`));
    if ((level.laps || 1) > 1 && rank >= 1) out.push(C.repeatN(level.laps, `the ${level.laps} laps`));
    if (rank >= 2 && level.gates) out.push(C.moves(Math.min(30, level.gates + 2)));
    if (rank >= 3 && has('boost')) out.push(C.use(['boost'], 'Use Boost on a straight'));
    // Bumpers on the road: code the kart to change lane round them
    if (level.bumpers && has('lane_clear')) out.unshift({ id: 'dodge', label: `Dodge the ${plural(level.bumpers, 'bumper')}: use "When an object is ahead" with a lane change`, test: (p) => p.ids.has('when_object_ahead') && ['lane_left', 'lane_right', 'lane_clear'].some((id) => p.ids.has(id)) });
    return { checks: out, detail: `${plural(level.laps || 1, 'lap')}${level.gates ? `, ${plural(level.gates, 'checkpoint')}` : ''}` };
  }
  if (engine === 'football') {
    const goals = level.goalsToWin || level.missionTarget || 1;
    const kindKey = String(level.course || '').replace(/^football_/, '');
    const [moveIds, moveText] = FOOTBALL_MOVES[kindKey] || FOOTBALL_MOVES.match;
    out.push(C.use(moveIds.filter(has).length ? moveIds.filter(has) : moveIds, `${String(level.goal || `Score ${plural(goals, 'goal')}.`).replace(/\.$/, '')} — ${moveText}`, `fb_${kindKey}`));
    if (rank >= 1) out.push(C.loop('Put your plan in the match loop (Forever / while True)'));
    if (rank >= 2) out.push(C.ifs(rank >= 3 ? 2 : 1, rank >= 3 ? 'Use 2 different checks, like have_ball and shooting_range' : 'Use an if: only shoot when you have the ball'));
    if (rank >= 4) out.push(C.event());
    return { checks: out, detail: `${plural(goals, 'goal')} in ${level.timeLimit}s` };
  }
  if (engine === 'boxing') {
    const punches = Math.min(5, 2 + rank);
    out.push({ ...C.distinct(punches), label: `Use at least ${punches} different moves against the ${level.rivalLabel || level.enemyType || 'rival'} (${level.enemyHp || 100} HP${level.timeLimit ? `, ${level.timeLimit}s ${level.fightMode || 'bout'}` : ''})` });
    // Only ask for a counter-move this arena actually has (fighting worlds use their own guard blocks)
    // A fighting world's rival is countered with that world's own guards (Shield block, Jet dodge…)
    const fwGuard = FIGHT_WORLDS[level.fightWorld]?.guard;
    const foe = fwGuard && level.enemyType !== 'dummy'
      ? [fwGuard.map(([id]) => id), `${level.rivalLabel} attacks hard — use ${fwGuard.map(([, l]) => l).join(' or ')}`]
      : ENEMY_MOVES[level.enemyType];
    const foeIds = foe ? foe[0].filter(has) : [];
    if (foe && foeIds.length && rank >= 1) out.push(C.use(foeIds, foe[1], `foe_${level.enemyType}`));
    if (rank >= 1) out.push(C.loop('Put your combo in the fight loop (Forever / while True)'));
    if (rank >= 2) out.push(C.use(['if_under_attack'], `Use if under attack → ${level.guardLabel || 'block or dodge'}`));
    if (rank >= 3) out.push(C.use(['if_health_low'], 'Use if health is low → step back'));
    if (rank >= 4) out.push(C.ifs(3));
    return { checks: out, detail: `${level.rivalLabel || level.enemyType || 'rival'} with ${level.enemyHp || 100} HP` };
  }
  if (engine === 'flappy') {
    const speed = level.difficulty?.speedScale ? ` at ${Math.round(level.difficulty.speedScale * 100)}% speed` : '';
    out.push(C.use(['flap'], `Use Flap — pass ${plural(level.target || 5, 'pipe')}${speed}`));
    if (rank >= 1) out.push(C.loop('Keep flapping with a Forever loop (while True)'));
    if (rank >= 2) out.push(C.ifs(1, 'Use an if: flap only when the bird is below the gap'));
    if (rank >= 3) out.push(C.els());
    if (rank >= 4) out.push(C.variable());
    return { checks: out, detail: plural(level.target || 5, 'pipe') };
  }
  if (engine === 'craft') {
    const goal = String(level.goal || '');
    const craft = goal.match(/craft\s+\d*\s*([a-z ]+?)(?:$|,| and)/i);
    const dig = goal.match(/dig under all (\d+)/i);
    const chop = goal.match(/(\d+)\s+logs?/i);
    if (craft && has('craft')) out.push(C.use(['craft'], `Craft the ${craft[1].trim()}`));
    if (dig) out.push(C.useTimes('mine_down', Number(dig[1]), `Dig down at all ${dig[1]} glowing blocks`));
    if (chop) out.push(C.moves(Number(chop[1]) + 1));
    const house = goal.match(/(\d+|a) houses?/i); const tower = /watchtower/i.test(goal); const plant = goal.match(/(\d+) (?:new )?trees/i); const every = /every tree/i.test(goal);
    if (house && has('build_house')) out.push(C.useTimes('build_house', house[1] === 'a' ? 1 : Number(house[1]), `Build ${house[1] === 'a' ? 'a house' : `${house[1]} houses`} with "Build a house" (or block by block)`));
    if (tower && has('build_tower')) out.push(C.use(['build_tower'], 'Build a watchtower at least 4 blocks high'));
    if (plant && has('plant_tree')) out.push(C.useTimes('plant_tree', Number(plant[1]), `Plant ${plant[1]} trees`));
    if (every && has('chop_tree')) out.push(C.use(['chop_tree', 'chop_all'], 'Chop every tree: try "Chop whole tree" in a loop'));
    if (!craft && !dig && !house && !every && goal) out.push({ ...C.moves(2 + rank), label: `Plan the steps for: ${goal}` });
    if (rank >= 2) out.push(C.loop());
    if (rank >= 3) out.push(C.ifs(1, 'Use an if that checks a block (like robot.block_ahead() == "log")'));
    if (rank >= 4) out.push(C.use(['repeat_until', 'repeat_while', 'repeat_until_goal', 'walk_until'], 'Use a loop that stops by itself (Repeat until / while)', 'untilLoop'));
    return { checks: out, detail: goal };
  }
  return { checks: out };
}

/** The core checks for a skill at a difficulty, using only blocks this robot can use. */
function skillChecks(bucket, rank, avail, ifWorks) {
  const can = (id) => !avail.size || avail.has(id);
  const loopIds = LOOP_IDS.filter(can);
  const senseIds = SENSE_IDS.filter(can);
  const ifIds = ifWorks ? [...avail.keys()].filter((id) => id.startsWith('if_')) : [];
  const turnIds = [...avail.keys()].filter((id) => TURN_RE.test(id));
  const timingIds = TIMING_IDS.filter(can);
  const hasEvents = [...avail.keys()].some((id) => id.startsWith('when_') && id !== 'when_start');
  const sense = (senseIds.length || ifIds.length)
    ? C.use([...senseIds, ...ifIds], ifIds.length && !senseIds.length ? 'Use an if so the robot decides' : 'Use a block that checks something (a sensor or "until")', 'sense')
    : null;
  const loop = loopIds.length ? C.loop() : null;
  // Game robots run short programs in a loop, so they're asked for fewer moves
  const moves = C.moves((ifWorks ? [1, 2, 3, 4, 5] : [1, 3, 5, 8, 10])[rank]);
  switch (bucket) {
    case 'loops': return loop ? [loop, C.loopBody(Math.min(4, 1 + rank)), rank >= 4 && C.loops(2)] : [moves];
    case 'conditions': return [sense || moves, rank >= 2 && ifWorks && can('else') && C.els(), rank >= 3 && ifWorks && C.ifs(2), rank >= 2 && loop];
    case 'sensors': return [sense || moves, rank >= 2 && loop, rank >= 3 && C.loopBody(2)];
    case 'events': return hasEvents ? [C.event(), rank >= 2 && C.event(2), rank >= 3 && loop] : [moves];
    case 'timing': return timingIds.length
      ? [C.use(timingIds, `Use ${timingIds.slice(0, 3).map((id) => TIMING_NAMES[id]).join(', ').replace(/, ([^,]*)$/, ' or $1')}`, 'timing'),
        rank >= 2 && timingIds.length > 1 && { id: 'timing2', label: 'Use 2 different timing blocks (like Set speed and Wait)', test: (p) => timingIds.filter((id) => p.ids.has(id)).length >= 2 }]
      : [moves];
    case 'route': return turnIds.length ? [C.use(turnIds, 'Use turn blocks to steer', 'turn'), rank >= 1 && C.anglesN(Math.min(3, rank + 1))] : [moves];
    case 'precision': return [C.small(Math.max(1, rank)), rank >= 2 && moves];
    case 'variables': return VAR_IDS.some(can) ? [C.variable(), rank >= 2 && hasEvents && C.event()] : [moves];
    case 'functions': return [C.reuse(), moves, rank >= 3 && loop && C.loops(2)];
    case 'debugging': return [C.improve(Math.max(1, rank - 1)), moves];
    case 'capstone': return [loop, sense || (turnIds.length && C.use(turnIds, 'Use turn blocks to steer', 'turn')), moves, rank >= 4 && C.distinct(5)];
    default: return [moves, rank >= 3 && C.distinct(rank + 1)];
  }
}

/** Extra goals that make harder arenas ask for more, in order. */
function stretchChecks(bucket, rank, avail, ifWorks) {
  const can = (id) => !avail.size || avail.has(id);
  const out = [];
  if (bucket !== 'loops' && LOOP_IDS.some(can)) out.push(C.loop());
  out.push(C.distinct(Math.min(6, rank + 2)));
  if (ifWorks && bucket !== 'conditions') out.push(C.ifs(1));
  out.push(C.improve(1));
  if (!ifWorks) out.push(C.moves([2, 4, 6, 10, 14][rank]));
  if (rank >= 4) out.push(C.improve(2));
  return out;
}

/**
 * The coding objective for an arena.
 * @param course   the arena / course object
 * @param opts     { library, group, robotType, kind: 'flappy'|'fighting'|'football'|'craft'|'racing'|'arcade'|'' }
 */
export function getCodingObjective(course, { library = null, group = 'wheeled', robotType = '', kind = '', pythonExtras = null } = {}) {
  if (!course) return null;
  const lg = course.learningGoal || {};
  const conceptSkill = String(lg.concept || '').split('·').map((s) => s.trim()).filter(Boolean);
  const fallbackSkill = kind === 'football' || course.arenaType === 'robot_football' ? 'If / else'
    : kind === 'flappy' ? 'Loops'
    : kind === 'fighting' ? 'Sequencing'
    : kind === 'racing' || course.isCustomTrack ? 'Speed & timing'
    : '';
  const skill = course.skillLearned || conceptSkill[conceptSkill.length > 1 ? 1 : 0] || course.programmingConcepts?.[0] || fallbackSkill || 'Sequencing';
  // Tier levels name the skill first ("Loops · Repeat 3"); early modes name the robot frame first
  const skillBucket = bucketFor(course.skillLearned || skill);
  const tipBucket = TIP_BUCKETS.find(([, re]) => re.test(course.tryThis || ''))?.[0];
  const bucket = !KEEP_SKILL.has(skillBucket) && tipBucket ? tipBucket : skillBucket;
  const info = INFO[bucket];

  // The arena's own level data (modes 11–50), when it has some
  const chassisId = course.chassisId || '';
  let engine = TIER_ENGINE[chassisId] || null;
  let level = chassisId && Number(course.modeIndex) > 10 && !course.isCustomTrack ? getTierLevel(chassisId, Number(course.modeIndex)) : null;
  // A track a child built in the Track Maker: its own name, laps, gates and bumpers
  if (course.isCustomTrack && course.expandedCarTrack) {
    const t = course.expandedCarTrack;
    engine = 'kart';
    level = { name: course.name, laps: t.laps, gates: t.checkpointTs?.length || 0, targetTime: t.targetTime, tier: 'Easy',
      bumpers: (t.raceItems || []).filter((it) => it.type === 'bumper').length };
  }
  // Football matches and boxing bouts carry their own goals, time limits and rivals
  const AI_TIER = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' };
  if (!level && (course.arenaType === 'robot_football' || /^football_/.test(String(course.id || ''))) && (course.goalsToWin || course.missionTarget)) {
    engine = 'football';
    level = { course: course.id, goalsToWin: course.goalsToWin || course.missionTarget, timeLimit: course.timeLimit, aiDifficulty: course.aiDifficulty,
      goal: course.missionObjective || course.winCondition, tier: course.difficulty || AI_TIER[course.aiDifficulty] };
  } else if (!level && course.arenaType === 'robot_fight' && course.enemyType) {
    engine = 'boxing';
    const fw = FIGHT_WORLDS[course.fightWorld];
    level = {
      ...course, tier: course.difficulty || AI_TIER[course.aiDifficulty],
      // Fighting worlds name their own guard and rival ("shield block", "Orc Warrior")
      ...(fw ? { guardLabel: fw.guard[0][1].toLowerCase(), rivalLabel: course.enemyType === 'dummy' ? 'practice dummy' : fw.rival.label } : {}),
    };
  }
  const rank = rankOf(course, level);

  const avail = library ? robotCommands(library, group, robotType) : new Map();
  const ifWorks = ['flappy', 'fighting', 'football', 'craft', 'arcade'].includes(kind) || ['flappy', 'boxing', 'football', 'craft'].includes(engine);
  const arena = arenaChecks(engine, level, rank, course, avail);

  // Arena goals first, then the skill's own, then stretch goals — as many as the difficulty asks for
  const want = GOALS_FOR_RANK[rank];
  const checks = [];
  const add = (c) => { if (c && checks.length < want - 1 && !checks.some((x) => x.id === c.id || x.label === c.label)) checks.push(c); };
  arena.checks.forEach(add);
  skillChecks(bucket, rank, avail, ifWorks).forEach(add);
  stretchChecks(bucket, rank, avail, ifWorks).forEach(add);
  checks.push(C.run(level?.name || course.environmentName || course.name));

  const where = course.environmentName || course.name || 'this arena';
  // Python examples use this robot's own "go forward" and "turn" commands
  const fwd = ['fly_forward', 'swim_forward', 'step_forward', 'move_forward'].find((id) => avail.has(id));
  const turn = (dir) => [`turn_${dir}`, `bank_${dir}`, `curve_${dir}`].find((id) => avail.has(id));
  // Game robots get an example in their own game's Python
  const gameExtras = pythonExtras || gamePythonExtras(kind);
  const pick = { loops: /repeat|loop/i, conditions: /if|loop/i, sensors: /if|until/i, events: /^when/i, variables: /variable/i, timing: /wait|until|loop/i };
  const gameExample = gameExtras.length ? (gameExtras.find(([, label]) => pick[bucket]?.test(label)) || gameExtras[0])[0] : null;
  const python = gameExample || (!avail.size ? info.python : info.python)
    .replace(/move_forward/g, fwd || 'move_forward')
    .replace(/turn_(left|right)\(/g, (m, dir) => `${turn(dir) || `turn_${dir}`}(`);
  return {
    key: `${course.id || where}:${bucket}:${rank}`,
    bucket,
    rank,
    level: RANK_NAME[rank],
    concept: info.concept,
    skill: String(skill),
    ican: ICAN[bucket][rank],
    how: course.tryThis || KIND_HOW[kind] || info.how,
    detail: arena.detail || null,
    goal: course.desc && course.desc !== course.tryThis ? String(course.desc) : null,
    where,
    think: lg.question || info.think,
    fact: lg.fact || null,
    python,
    checks,
    // The arena's top goals in one line, for the arena cards
    headline: checks.filter((c) => c.id !== 'run').slice(0, 2).map((c) => c.label.replace(/[.!]$/, '')).join('. ') + '.',
  };
}

/** Tick the checklist against a program. `runs` = { runs, editedRuns }. */
export function checkCodingObjective(objective, { blocks = [], python = null, runs = { runs: 0, editedRuns: 0 } } = {}) {
  if (!objective) return [];
  const p = readProgram(blocks, python);
  return objective.checks.map((c) => ({ id: c.id, label: c.label, done: !!c.test(p, runs) }));
}
