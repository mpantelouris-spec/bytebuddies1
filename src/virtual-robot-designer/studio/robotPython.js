/**
 * Python for Robot Studio.
 *
 *   blocksToPython(script, library)  — show a pupil's blocks as Python (step 1: blocks → text).
 *   pythonToBlocks(code, library)    — turn the Python a pupil writes into the block program the
 *                                      lab already runs (step 2: write Python that drives the robot).
 *
 * The robot's commands are its blocks: the block "Move forward 3 steps" is robot.move_forward(3),
 * "Curve left 45° 3 steps" is robot.curve_left(45, 3). Loops, variables and functions are worked
 * out when the program is checked (like the blocks, which also run as a fixed list of steps), so
 * the robot, scoring, block highlighting and route guide all behave exactly as with blocks.
 * Mistakes come back as friendly messages with the line number.
 */

import { gameBlocksToPython, gamePythonToBlocks } from './robotPythonGames.js';

const FOREVER_REPS = 6;      // the lab runs a "Forever" block six times, so `while True:` does too
const MAX_STEPS = 600;       // stops an accidental giant loop from freezing the page
const LOOPS = new Set(['repeat', 'forever', 'repeat_until']);

/** Event blocks ↔ Python event functions. */
const EVENTS = [
  ['when_spacebar', 'on_space'], ['when_zone', 'on_zone'], ['when_collect', 'on_collect'],
  ['when_collision', 'on_collision'], ['when_sensor', 'on_sensor'], ['when_checkpoint', 'on_checkpoint'],
  ['when_race_won', 'on_race_won'], ['when_goal', 'on_goal'], ['when_hit_car', 'on_hit_car'],
  ['when_hit_object', 'on_hit_object'], ['when_object_ahead', 'on_object_ahead'], ['when_car_ahead', 'on_car_ahead'],
];
const EVENT_TO_FN = Object.fromEntries(EVENTS);
const FN_TO_EVENT = Object.fromEntries(EVENTS.map(([a, b]) => [b, a]));
const PARAM_EVENTS = { when_key: ['on_key_', 'key'], when_timer: ['on_timer_', 'seconds'], when_battery: ['on_battery_', 'percent'], when_lap: ['on_lap_', 'lap'] };

/** Every block this robot can use, by id (only blocks shown in its palette). */
export function robotCommands(library, group, robotType) {
  const out = new Map();
  Object.entries(library || {}).forEach(([catKey, cat]) => {
    (cat?.blocks || []).forEach((b) => {
      if (b.robotGroups && !b.robotGroups.includes(group) && !b.robotGroups.includes(robotType)) return;
      if (!out.has(b.id)) out.set(b.id, { ...b, catKey });
    });
  });
  return out;
}

/**
 * Some starter programs use blocks that aren't in the palette (the Robot Arm's Raise / Lower arm).
 * Add those to the library so Python can use them too.
 */
export function withScriptBlocks(library, ...scripts) {
  const known = new Set(Object.values(library || {}).flatMap((c) => (c?.blocks || []).map((b) => b.id)));
  const extra = [];
  scripts.flat().filter(Boolean).forEach((b) => {
    if (!b?.id || known.has(b.id) || String(b.id).startsWith('when_')) return;
    known.add(b.id);
    const params = b.params?.length ? b.params
      : Object.entries(b.paramValues || {}).map(([key, def]) => ({ key, label: key, def }));
    extra.push({ id: b.id, label: b.label || b.id, icon: b.icon || '▶', params });
  });
  if (!extra.length) return library;
  return { ...library, Program: { label: 'From your program', icon: '🧩', color: '#64748b', blocks: extra } };
}

export const pyValue = (v) => {
  if (typeof v === 'number') return String(v);
  if (v === true) return 'True';
  if (v === false) return 'False';
  const n = Number(v);
  if (v !== '' && v != null && !Number.isNaN(n) && String(v).trim() !== '') return String(n);
  return JSON.stringify(String(v ?? ''));
};

/* ════════════════════════ Blocks → Python ════════════════════════ */

function blockLine(b, defs) {
  const def = defs.get(b.id) || b;
  const pv = b.paramValues || {};
  const params = def.params || b.params || [];
  if (b.id === 'wait') return `wait(${pyValue(pv.seconds ?? 1)})`;
  if (b.id === 'set_var') return `score = ${pyValue(pv.value ?? 0)}`;
  if (b.id === 'change_var') return `score += ${pyValue(pv.value ?? 1)}`;
  const args = params.map((p) => pyValue(pv[p.key] ?? p.def));
  return `robot.${b.id}(${args.join(', ')})`;
}

export function blocksToPython(script, library, { group, robotType, style = null } = {}) {
  if (style) return gameBlocksToPython(script, library, { group, robotType, style });
  const defs = robotCommands(library, group, robotType);
  const lines = ['# My robot program — press ▶ Simulate to run it', ''];
  let base = 0, depth = 0;
  const put = (s) => lines.push(`${' '.repeat(depth)}${s}`);
  let sectionHasCode = false;
  const endSection = () => { if (base > 0 && !sectionHasCode) lines.push(`${' '.repeat(base)}pass`); };
  (script || []).forEach((b) => {
    if (b.id === 'when_start') return;
    const ev = EVENT_TO_FN[b.id] || (PARAM_EVENTS[b.id] && `${PARAM_EVENTS[b.id][0]}${String(b.paramValues?.[PARAM_EVENTS[b.id][1]] ?? '').replace(/[^a-z0-9]/gi, '')}`);
    if (ev) {
      endSection();
      lines.push('', `def ${ev}():`);
      base = 4; depth = 4; sectionHasCode = false;
      return;
    }
    if (b.id === 'repeat') { depth = base; put(`for i in range(${pyValue(b.paramValues?.times ?? 5)}):`); depth = base + 4; sectionHasCode = true; return; }
    if (b.id === 'forever') { depth = base; put('while True:'); depth = base + 4; sectionHasCode = true; return; }
    if (['if_then', 'if_else', 'wait_until', 'define_func', 'call_func', 'repeat_until'].includes(b.id)) {
      put(`# "${b.label || b.id}" — this block doesn't run in Robot Studio yet`);
      return;
    }
    put(blockLine(b, defs));
    sectionHasCode = true;
  });
  endSection();
  if (lines.length <= 2) lines.push('# Write your program here');
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
}

/* ════════════════════════ Python → blocks ════════════════════════ */

export class PyError extends Error {
  constructor(line, message) { super(message); this.line = line; }
}

/** Split the code into lines with their indentation, dropping comments and blank lines. */
export function readLines(code) {
  const out = [];
  String(code || '').replace(/\r/g, '').split('\n').forEach((raw, i) => {
    let s = raw.replace(/\t/g, '    ');
    // strip a comment that isn't inside a string
    let inStr = null, cut = s.length;
    for (let k = 0; k < s.length; k++) {
      const ch = s[k];
      if (inStr) { if (ch === inStr && s[k - 1] !== '\\') inStr = null; } else if (ch === '"' || ch === "'") inStr = ch; else if (ch === '#') { cut = k; break; }
    }
    s = s.slice(0, cut).replace(/\s+$/, '');
    if (!s.trim()) return;
    const indent = s.length - s.trimStart().length;
    out.push({ n: i + 1, indent, text: s.trim() });
  });
  return out;
}

/** Turn the flat list of lines into a tree using indentation (Python's blocks). */
export function buildTree(lines) {
  let i = 0;
  const block = (indent) => {
    const stmts = [];
    while (i < lines.length && lines[i].indent >= indent) {
      const ln = lines[i];
      if (/^(for|while|if|elif|else|def)\b/.test(ln.text) && !ln.text.endsWith(':')) throw new PyError(ln.n, `Add a colon ":" at the end of this line.`);
      if (ln.indent > indent) throw new PyError(ln.n, 'This line is indented too far. Line it up with the lines above it.');
      i += 1;
      const node = { ...ln, body: null };
      if (ln.text.endsWith(':')) {
        if (i >= lines.length || lines[i].indent <= indent) throw new PyError(ln.n, `After a line ending in ":" the next lines must be indented (pushed in by 4 spaces).`);
        node.body = block(lines[i].indent);
      }
      stmts.push(node);
    }
    return stmts;
  };
  const tree = block(lines.length ? lines[0].indent : 0);
  if (i < lines.length) throw new PyError(lines[i].n, 'This line is indented differently from the lines around it.');
  if (lines.length && lines[0].indent > 0) throw new PyError(lines[0].n, 'The first line should start at the very left (no spaces in front).');
  return tree;
}

/* ── A small, safe expression evaluator (numbers, text, variables, + - * / // % **, comparisons) ── */
function tokenize(src, line) {
  const toks = [];
  const re = /\s*(?:(\d+\.?\d*|\.\d+)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)|(\*\*|\/\/|==|!=|<=|>=|[-+*/%(),<>=\[\]]))/y;
  let m;
  let pos = 0;
  while (pos < src.length) {
    re.lastIndex = pos;
    m = re.exec(src);
    if (!m || m.index !== pos) {
      if (/^\s+$/.test(src.slice(pos))) break;
      throw new PyError(line, `I don't understand "${src.slice(pos).trim().slice(0, 12)}" here.`);
    }
    pos = re.lastIndex;
    if (m[1] != null) toks.push({ t: 'num', v: Number(m[1]) });
    else if (m[2] != null) toks.push({ t: 'str', v: m[2].slice(1, -1).replace(/\\(.)/g, '$1') });
    else if (m[3] != null) toks.push({ t: 'name', v: m[3] });
    else toks.push({ t: 'op', v: m[4] });
  }
  return toks;
}

const BUILTINS = {
  abs: (x) => Math.abs(x), round: (x, n = 0) => Number(Number(x).toFixed(n)), int: (x) => Math.trunc(Number(x)),
  float: (x) => Number(x), min: (...a) => Math.min(...a), max: (...a) => Math.max(...a), str: (x) => String(x),
  len: (x) => (x?.length ?? 0),
};

export function evaluate(src, scope, line) {
  const toks = tokenize(src, line);
  let i = 0;
  const peek = () => toks[i];
  const eat = (v) => { if (toks[i]?.v === v) { i += 1; return true; } return false; };
  const need = (v) => { if (!eat(v)) throw new PyError(line, `Expected "${v}" here.`); };
  const atom = () => {
    const tk = toks[i++];
    if (!tk) throw new PyError(line, 'Something is missing at the end of this line.');
    if (tk.t === 'num' || tk.t === 'str') return tk.v;
    if (tk.v === '(') { const v = expr(); need(')'); return v; }
    if (tk.v === '-') return -factor();
    if (tk.v === '+') return +factor();
    if (tk.t === 'name') {
      if (tk.v === 'True') return true;
      if (tk.v === 'False') return false;
      if (tk.v === 'None') return null;
      if (peek()?.v === '(') {
        i += 1;
        const args = [];
        if (!eat(')')) { do args.push(expr()); while (eat(',')); need(')'); }
        if (BUILTINS[tk.v]) return BUILTINS[tk.v](...args);
        if (tk.v.startsWith('robot.')) throw new PyError(line, `robot.${tk.v.slice(6)}() moves the robot — put it on its own line, not inside a sum or a check.`);
        throw new PyError(line, `"${tk.v}()" can't be used inside a sum or a check.`);
      }
      if (!(tk.v in scope)) throw new PyError(line, `I don't know "${tk.v}" yet. Did you give it a value first, like ${tk.v} = 3?`);
      return scope[tk.v];
    }
    throw new PyError(line, `"${tk.v}" can't go here.`);
  };
  const factor = () => { let v = atom(); while (eat('**')) v **= factor(); return v; };
  const term = () => {
    let v = factor();
    for (;;) {
      if (eat('*')) v *= factor();
      else if (eat('/')) { const d = factor(); if (d === 0) throw new PyError(line, 'You can’t divide by zero.'); v /= d; }
      else if (eat('//')) { const d = factor(); if (d === 0) throw new PyError(line, 'You can’t divide by zero.'); v = Math.floor(v / d); }
      else if (eat('%')) v %= factor();
      else return v;
    }
  };
  const sum = () => { let v = term(); for (;;) { if (eat('+')) v = v + term(); else if (eat('-')) v -= term(); else return v; } };
  const compare = () => {
    let v = sum();
    const ops = { '==': (a, b) => a === b, '!=': (a, b) => a !== b, '<': (a, b) => a < b, '>': (a, b) => a > b, '<=': (a, b) => a <= b, '>=': (a, b) => a >= b };
    while (peek() && ops[peek().v]) { const op = toks[i++].v; v = ops[op](v, sum()); }
    return v;
  };
  const not = () => (peek()?.v === 'not' ? (i += 1, !not()) : compare());
  const and = () => { let v = not(); while (peek()?.v === 'and') { i += 1; const r = not(); v = v && r; } return v; };
  const expr = () => { let v = and(); while (peek()?.v === 'or') { i += 1; const r = and(); v = v || r; } return v; };
  const v = expr();
  if (i < toks.length) throw new PyError(line, `I didn't expect "${toks[i].v}" here.`);
  return v;
}

/** Split call arguments at top-level commas, keeping quoted text and brackets together. */
export function splitArgs(s) {
  const out = [];
  let depth = 0, inStr = null, cur = '';
  for (let k = 0; k < s.length; k++) {
    const ch = s[k];
    if (inStr) { cur += ch; if (ch === inStr && s[k - 1] !== '\\') inStr = null; continue; }
    if (ch === '"' || ch === "'") { inStr = ch; cur += ch; continue; }
    if (ch === '(' || ch === '[') depth += 1;
    if (ch === ')' || ch === ']') depth -= 1;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((a) => a.trim()).filter(Boolean);
}

/** Close spellings → the real command, so typos get a helpful "did you mean". */
export function closest(name, names) {
  let best = null, bestD = 99;
  const d = (a, b) => {
    const m = Array.from({ length: a.length + 1 }, (_, x) => [x, ...Array(b.length).fill(0)]);
    for (let y = 1; y <= b.length; y++) m[0][y] = y;
    for (let x = 1; x <= a.length; x++) for (let y = 1; y <= b.length; y++) m[x][y] = Math.min(m[x - 1][y] + 1, m[x][y - 1] + 1, m[x - 1][y - 1] + (a[x - 1] === b[y - 1] ? 0 : 1));
    return m[a.length][b.length];
  };
  names.forEach((n) => { const k = d(name, n); if (k < bestD) { bestD = k; best = n; } });
  return bestD <= Math.max(2, Math.floor(name.length / 3)) ? best : null;
}

/** Python sensor checks that can drive "Move forward until…". */
const UNTIL_SENSORS = { obstacle_ahead: 'wall', wall_ahead: 'wall', item_nearby: 'item', at_goal: 'goal', goal_reached: 'goal', checkpoint_reached: 'checkpoint', battery_low: 'battery', collision: 'collision' };

/**
 * Compile Python into the lab's block program.
 * @returns {{ blocks: object[], errors: {line:number, message:string}[], steps: number }}
 */
export function pythonToBlocks(code, library, { group, robotType, style = null } = {}) {
  if (style) return gamePythonToBlocks(code, library, { group, robotType, style });
  const defs = robotCommands(library, group, robotType);
  const otherRobots = new Set(Object.values(library || {}).flatMap((c) => (c?.blocks || []).map((b) => b.id)));
  const robotNames = [...defs.keys()].filter((id) => !id.startsWith('when_') && !LOOPS.has(id));
  const sections = [{ hat: null, blocks: [] }];
  const funcs = {};
  let steps = 0;
  let seq = 0;

  const emit = (id, paramValues, line) => {
    steps += 1;
    if (steps > MAX_STEPS) throw new PyError(line, `Your program makes more than ${MAX_STEPS} robot moves — make a loop smaller.`);
    const def = defs.get(id) || {};
    sections[sections.length - 1].blocks.push({
      id, label: def.label || id, icon: def.icon || '▶', catKey: def.catKey, params: def.params,
      paramValues, _uid: `py${line}_${seq++}`, pyLine: line,
    });
  };

  /** robot.something(args) → one block. */
  const robotCall = (name, argSrc, scope, line) => {
    if (name === 'wait') { emit('wait', { seconds: Number(evaluate(argSrc || '1', scope, line)) || 0 }, line); return; }
    const def = defs.get(name);
    if (!def || name.startsWith('when_') || LOOPS.has(name)) {
      const guess = closest(name, robotNames);
      if (otherRobots.has(name) && !name.startsWith('when_') && !LOOPS.has(name)) {
        const fam = { fly: 'flying', bank: 'flying', dive: 'flying', hover: 'flying', roll: 'flying', step: 'walking', climb: 'walking', crouch: 'walking', jump: 'walking', balance: 'walking', pose: 'walking', recover: 'walking', swim: 'swimming', surface: 'swimming', curve: 'driving', zigzag: 'driving', circle: 'driving', u: 'driving', brake: 'driving', follow: 'driving', turn: 'driving', move: 'driving', rotate: 'driving', grab: 'arm', release: 'arm', reach: 'arm' }[name.split('_')[0]];
        throw new PyError(line, `robot.${name}() is for ${fam ? `${fam} robots` : 'a different kind of robot'}.${guess ? ` Try robot.${guess}().` : ' Click a command on the left to see what your robot can do.'}`);
      }
      if (UNTIL_SENSORS[name] || /^(if_|see_|read_|detect)/.test(name)) throw new PyError(line, `robot.${name}() is a sensor check — use it in a "while not" loop, like: while not robot.${name}():`);
      throw new PyError(line, `This robot doesn't have robot.${name}().${guess ? ` Did you mean robot.${guess}()?` : ' Click a command on the left to see what it can do.'}`);
    }
    const params = def.params || [];
    const args = splitArgs(argSrc);
    const pv = {};
    let posi = 0;
    args.forEach((a) => {
      const kw = a.match(/^([A-Za-z_]\w*)\s*=(?!=)\s*(.+)$/);
      if (kw) {
        const p = params.find((q) => q.key === kw[1]);
        if (!p) throw new PyError(line, `robot.${name}() has no "${kw[1]}". It takes: ${params.map((q) => q.key).join(', ') || 'nothing'}.`);
        pv[p.key] = evaluate(kw[2], scope, line);
      } else {
        const p = params[posi++];
        if (!p) throw new PyError(line, `robot.${name}() takes ${params.length ? `${params.length} value${params.length > 1 ? 's' : ''} (${params.map((q) => q.key).join(', ')})` : 'no values — use empty brackets ()'}.`);
        pv[p.key] = evaluate(a, scope, line);
      }
    });
    params.forEach((p) => {
      if (pv[p.key] === undefined) pv[p.key] = p.def;
      if (p.type === 'dropdown') {
        const ok = (p.options || []).map((o) => o[1]);
        if (!ok.includes(String(pv[p.key]))) throw new PyError(line, `"${pv[p.key]}" isn't an option for ${p.key}. Use one of: ${ok.map((o) => `"${o}"`).join(', ')}.`);
        pv[p.key] = String(pv[p.key]);
      } else if (typeof pv[p.key] !== 'number' || Number.isNaN(pv[p.key])) {
        throw new PyError(line, `${p.key} needs a number, like robot.${name}(${p.def ?? 3}).`);
      }
    });
    emit(name, pv, line);
  };

  const run = (stmts, scope, depth = 0) => {
    if (depth > 40) throw new PyError(stmts[0]?.n || 1, 'Your functions call each other too many times.');
    for (let k = 0; k < stmts.length; k++) {
      const st = stmts[k];
      const t = st.text;
      let m;
      if (/^(import\s+\w+|from\s+\w+\s+import\s+.+)$/.test(t)) continue;
      if (t === 'pass') continue;
      if ((m = t.match(/^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:$/))) {
        const [, fname, params] = m;
        const evName = FN_TO_EVENT[fname] || Object.entries(PARAM_EVENTS).find(([, [pre]]) => fname.startsWith(pre))?.[0];
        if (fname === 'on_start') { run(st.body, scope, depth + 1); continue; }
        if (evName) {
          if (depth > 0) throw new PyError(st.n, 'Event functions like on_space() must be at the left edge, not inside something else.');
          const [pre, key] = PARAM_EVENTS[evName] || [];
          const pv = pre ? { [key]: fname.slice(pre.length) } : {};
          if (key && key !== 'key') pv[key] = Number(pv[key]) || (key === 'lap' ? 1 : 5);
          sections.push({ hat: { id: evName, paramValues: pv, line: st.n }, blocks: [] });
          run(st.body, { ...scope }, depth + 1);
          sections.push({ hat: null, blocks: [], cont: true });
          continue;
        }
        funcs[fname] = { params: params.split(',').map((p) => p.trim()).filter(Boolean), body: st.body, line: st.n };
        continue;
      }
      if ((m = t.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\s*\((.*)\)\s*:$/))) {
        const a = splitArgs(m[2]).map((x) => Number(evaluate(x, scope, st.n)));
        const [start, stop, step] = a.length === 1 ? [0, a[0], 1] : [a[0], a[1], a[2] ?? 1];
        if (!step) throw new PyError(st.n, 'range() can’t count in steps of 0.');
        const n = Math.max(0, Math.ceil((stop - start) / step));
        if (n > 200) throw new PyError(st.n, 'That loop repeats more than 200 times — use a smaller number.');
        for (let v = start, c = 0; c < n; v += step, c++) run(st.body, Object.assign(scope, { [m[1]]: v }), depth + 1);
        continue;
      }
      if (t === 'while True:') { for (let r = 0; r < FOREVER_REPS; r++) run(st.body, scope, depth + 1); continue; }
      if ((m = t.match(/^while\s+not\s+robot\.([A-Za-z_]\w*)\s*\(\s*\)\s*:$/))) {
        const cond = UNTIL_SENSORS[m[1]];
        const moves = st.body.filter((b) => !/^(pass|wait\(|robot\.wait\()/.test(b.text));
        if (cond && defs.has('move_forward_until') && moves.length === 1 && /^robot\.(move_forward|fly_forward|swim_forward|step_forward)\(/.test(moves[0].text)) {
          emit('move_forward_until', { condition: cond }, st.n);
          continue;
        }
        throw new PyError(st.n, cond && defs.has('move_forward_until')
          ? `Inside "while not robot.${m[1]}():" put just one robot.move_forward(1) — the robot keeps going until the check is true.`
          : `This robot can't wait for robot.${m[1]}() in a loop yet. Try a for loop with a number of steps.`);
      }
      if ((m = t.match(/^while\s+(.+):$/))) {
        let guard = 0;
        while (evaluate(m[1], scope, st.n)) {
          if (++guard > 200) throw new PyError(st.n, 'This while loop never stops. Make sure something inside it changes the check.');
          run(st.body, scope, depth + 1);
        }
        continue;
      }
      if ((m = t.match(/^if\s+(.+):$/))) {
        if (/robot\./.test(m[1])) throw new PyError(st.n, 'Checking robot sensors with "if" isn’t available in Robot Studio yet. Use "while not robot.obstacle_ahead():" with robot.move_forward(1) inside.');
        // if / elif / else chain
        const chain = [{ cond: m[1], body: st.body }];
        while (k + 1 < stmts.length && /^(elif\s+.+|else\s*):$/.test(stmts[k + 1].text)) {
          k += 1;
          const e = stmts[k].text.match(/^elif\s+(.+):$/);
          chain.push({ cond: e ? e[1] : null, body: stmts[k].body, n: stmts[k].n });
        }
        const hit = chain.find((c) => c.cond == null || evaluate(c.cond, scope, c.n || st.n));
        if (hit) run(hit.body, scope, depth + 1);
        continue;
      }
      if (/^(elif\b|else\b)/.test(t)) throw new PyError(st.n, `"${t.split(/[\s:]/)[0]}" must come straight after an "if".`);
      if ((m = t.match(/^([A-Za-z_]\w*)\s*([-+*/]?=)\s*(.+)$/)) && !t.includes('==')) {
        const [, name, op, rhs] = m;
        if (name === 'robot') throw new PyError(st.n, '"robot" is your robot — choose another name for your variable.');
        const v = evaluate(rhs, scope, st.n);
        if (op !== '=' && !(name in scope)) throw new PyError(st.n, `"${name}" needs a value first, like ${name} = 0.`);
        scope[name] = op === '=' ? v : op === '+=' ? scope[name] + v : op === '-=' ? scope[name] - v : op === '*=' ? scope[name] * v : scope[name] / v;
        continue;
      }
      if ((m = t.match(/^robot\.([A-Za-z_]\w*)\s*\((.*)\)$/))) { robotCall(m[1], m[2], scope, st.n); continue; }
      if ((m = t.match(/^(?:wait|time\.sleep)\s*\((.*)\)$/))) { robotCall('wait', m[1], scope, st.n); continue; }
      if (/^print\s*\(/.test(t)) continue; // print has nowhere to show in the 3D lab; harmless
      if ((m = t.match(/^([A-Za-z_]\w*)\s*\((.*)\)$/))) {
        const f = funcs[m[1]];
        if (!f) {
          if (defs.has(m[1])) throw new PyError(st.n, `Put "robot." in front: robot.${m[1]}(${m[2]})`);
          throw new PyError(st.n, `I don't know ${m[1]}(). Write "def ${m[1]}():" above it first.`);
        }
        const args = splitArgs(m[2]).map((a) => evaluate(a, scope, st.n));
        if (args.length !== f.params.length) throw new PyError(st.n, `${m[1]}() needs ${f.params.length} value${f.params.length === 1 ? '' : 's'}.`);
        const local = { ...scope };
        f.params.forEach((p, idx) => { local[p] = args[idx]; });
        run(f.body, local, depth + 1);
        continue;
      }
      if (/^robot\.\w+$/.test(t)) throw new PyError(st.n, `Add brackets to run it: ${t}()`);
      if (/:$/.test(t)) throw new PyError(st.n, `I don't understand this line. Lines ending in ":" can be "for i in range(3):", "while True:", "if …:" or "def name():".`);
      throw new PyError(st.n, `I don't understand this line. Robot commands start with "robot." — for example robot.move_forward(3).`);
    }
  };

  try {
    const tree = buildTree(readLines(code));
    // functions can be defined anywhere in the file, so collect them first
    tree.forEach((st) => {
      const m = st.text.match(/^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:$/);
      if (m && !FN_TO_EVENT[m[1]] && m[1] !== 'on_start' && !Object.values(PARAM_EVENTS).some(([pre]) => m[1].startsWith(pre))) {
        funcs[m[1]] = { params: m[2].split(',').map((p) => p.trim()).filter(Boolean), body: st.body, line: st.n };
      }
    });
    run(tree, {});
  } catch (e) {
    if (e instanceof PyError) return { blocks: [], errors: [{ line: e.line, message: e.message }], steps };
    return { blocks: [], errors: [{ line: 1, message: `Something went wrong reading your code (${e.message}).` }], steps };
  }
  // Main program first (it runs when START is clicked), then each event's blocks under its hat
  const main = sections.filter((s) => !s.hat).flatMap((s) => s.blocks);
  const blocks = [...main];
  sections.forEach((s, idx) => {
    if (!s.hat) return;
    blocks.push({ id: s.hat.id, label: s.hat.id, paramValues: s.hat.paramValues, _uid: `py${s.hat.line}_hat${idx}`, pyLine: s.hat.line });
    blocks.push(...s.blocks);
  });
  return { blocks, errors: [], steps };
}

/** A one-line example for a command, for the Python help list. */
export function exampleCall(def, style = null) {
  if (def.id === 'wait') return 'wait(1)';
  if ((def.params || []).some((p) => p.key === 'a') && (def.params || []).some((p) => p.key === 'b')) {
    const check = style === 'craft' ? 'robot.block_ahead() == "log"' : 'robot.pipe_distance() < 3';
    return def.id === 'wait_until' ? `wait_until(${check})` : `robot.${def.id}(${check})`;
  }
  const args = (def.params || []).map((p) => pyValue(p.def));
  return `robot.${def.id}(${args.join(', ')})`;
}
