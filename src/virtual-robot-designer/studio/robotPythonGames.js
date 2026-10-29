/**
 * Python for the game robots that run their own engines: Flappy BirdBot, Block Crafter,
 * Robot Football and Robot Boxing.
 *
 * Unlike the main lab (where loops are worked out before the robot moves), these games run
 * loops and "if" checks live, every frame. So Python here becomes real loop and if blocks:
 *
 *   flappy / craft — nested blocks closed by "End", with Else, like Python's indentation.
 *   football       — inside the match loop the first true "if" wins and does one move;
 *                    else: is what happens when no check is true.
 *   fighting       — an "if" owns the moves under it (a combo); checks run one after another.
 */
import { robotCommands, readLines, buildTree, evaluate, splitArgs, closest, PyError, pyValue } from './robotPython.js';

const MAX_BLOCKS = 600;
const LOOP_BLOCKS = new Set(['repeat', 'forever', 'repeat_until', 'repeat_while', 'repeat_until_goal']);
const NAME = { flappy: 'Flappy Bird', craft: 'Block Crafter', football: 'football', fighting: 'boxing' };

/* ── Readings the Flappy "if" block can compare ── */
const FLAPPY_READ = {
  bird_height: 'bird_height', gap_center: 'gap_center', gap_centre: 'gap_center', below_gap: 'below_gap',
  pipe_distance: 'pipe_dist', distance_to_pipe: 'pipe_dist', pipe_dist: 'pipe_dist', gap_size: 'gap_size',
  score: 'score', high_score: 'high_score', time_alive: 'time_alive',
};
const FLAPPY_PY = { bird_height: 'bird_height', gap_center: 'gap_center', below_gap: 'below_gap', pipe_dist: 'pipe_distance', gap_size: 'gap_size', score: 'score', high_score: 'high_score', time_alive: 'time_alive' };
const FLAPPY_RIGHT = new Set(['num', 'gap_center', 'bird_height', 'pipe_dist', 'score', 'var']);
const OP_SYM = { lt: '<', gt: '>', eq: '==' };
const SYM_OP = { '<': 'lt', '>': 'gt', '==': 'eq' };

/* ── What Block Crafter's "if" block can look at ── */
const CRAFT_WHERE = { block_ahead: 'ahead', ground_ahead: 'ahead_down', block_below: 'below', block_above: 'above' };
const CRAFT_PY = { ahead: 'block_ahead', ahead_down: 'ground_ahead', below: 'block_below', above: 'block_above' };

export function styleForKind(kind) {
  return ['flappy', 'craft', 'football', 'fighting'].includes(kind) ? kind : null;
}

/** Events a game has, as Python function names (when_get_ball ↔ on_get_ball). */
function gameEvents(defs) {
  const fnToHat = {};
  const hatToFn = {};
  defs.forEach((d, id) => {
    if (!id.startsWith('when_') || id === 'when_start' || id === 'when_key' || id === 'when_timer') return;
    const fn = id === 'when_spacebar' ? 'on_space' : `on_${id.slice(5)}`;
    fnToHat[fn] = { id };
    hatToFn[id] = fn;
  });
  if (defs.has('when_sensor') && defs.get('when_sensor').label?.includes('pipe')) fnToHat.on_pipe_close = { id: 'when_sensor' };
  if (!fnToHat.on_space && defs.has('when_key')) fnToHat.on_space = { id: 'when_key', paramValues: { key: 'space' } };
  return { fnToHat, hatToFn };
}

function hatFor(fn, events, defs) {
  if (events.fnToHat[fn]) return events.fnToHat[fn];
  let m;
  if ((m = fn.match(/^on_key_(\w+)$/)) && defs.has('when_key')) return { id: 'when_key', paramValues: { key: m[1] } };
  if ((m = fn.match(/^on_timer_(\d+)$/)) && defs.has('when_timer')) return { id: 'when_timer', paramValues: { seconds: Number(m[1]) } };
  return null;
}

/* ════════════════════════ Conditions ════════════════════════ */

function parseFlappyOperand(src, scope, line) {
  const s = src.trim();
  const m = s.match(/^robot\.([A-Za-z_]\w*)\s*\(\s*\)$/);
  if (m) {
    const key = FLAPPY_READ[m[1]];
    if (!key) throw new PyError(line, `robot.${m[1]}() isn't a Flappy reading. Try robot.bird_height(), robot.gap_center() or robot.pipe_distance().`);
    return { key };
  }
  if (/^[A-Za-z_]\w*$/.test(s) && !(s in scope) && !['True', 'False'].includes(s)) return { key: 'var', name: s };
  const v = Number(evaluate(s, scope, line));
  if (Number.isNaN(v)) throw new PyError(line, `"${s}" needs to be a number or a reading like robot.bird_height().`);
  return { key: 'num', n: v };
}

function flappyCond(src, scope, line) {
  const s = src.trim();
  if (/^not\b/.test(s)) throw new PyError(line, 'Flip the check instead of using "not" — for example use > instead of <.');
  if (/^robot\.is_falling\s*\(\s*\)$/.test(s)) return { id: 'if_falling', pv: {} };
  const m = s.match(/^(.+?)\s*(<=|>=|==|!=|<|>)\s*(.+)$/);
  if (!m) throw new PyError(line, 'Compare two things, like: if robot.bird_height() < robot.gap_center():');
  if (!SYM_OP[m[2]]) throw new PyError(line, `Flappy checks can use <, > or == (not ${m[2]}).`);
  let a = parseFlappyOperand(m[1], scope, line);
  let b = parseFlappyOperand(m[3], scope, line);
  let op = SYM_OP[m[2]];
  if (a.key === 'num') { [a, b] = [b, a]; op = op === 'lt' ? 'gt' : op === 'gt' ? 'lt' : op; }
  if (a.key === 'num') throw new PyError(line, 'One side of the check needs to be a reading, like robot.bird_height().');
  if (!FLAPPY_RIGHT.has(b.key)) throw new PyError(line, `The right side can be a number, robot.gap_center(), robot.bird_height(), robot.pipe_distance() or robot.score().`);
  const pv = { a: a.key, op, b: b.key, n: b.key === 'num' ? b.n : 10 };
  const name = a.name || b.name;
  if (name) pv.name = name;
  return { id: 'if_then', pv };
}

function craftCond(src, scope, line, itemOptions) {
  let s = src.trim();
  let negate = false;
  while (/^not\b/.test(s)) { negate = !negate; s = s.replace(/^not\s*/, '').replace(/^\((.*)\)$/, '$1').trim(); }
  let pv = null;
  let m;
  const item = (raw) => {
    const v = String(evaluate(raw, scope, line));
    if (itemOptions.length && !itemOptions.includes(v)) {
      const guess = closest(v, itemOptions);
      throw new PyError(line, `"${v}" isn't a block or item here.${guess ? ` Did you mean "${guess}"?` : ''}`);
    }
    return v;
  };
  if ((m = s.match(/^robot\.(block_ahead|ground_ahead|block_below|block_above)\s*\(\s*\)\s*(==|!=)\s*(.+)$/))) {
    pv = { a: CRAFT_WHERE[m[1]], op: m[2] === '==' ? 'is' : 'not', b: item(m[3]), n: 1 };
  } else if ((m = s.match(/^robot\.count\s*\((.+)\)\s*(>=|>|<=|<)\s*(.+)$/))) {
    const n = Math.round(Number(evaluate(m[3], scope, line)));
    pv = { a: 'have', b: item(m[1]), op: m[2].startsWith('>') ? 'ge' : 'lt', n: m[2] === '>' || m[2] === '<=' ? n + 1 : n };
  } else if ((m = s.match(/^robot\.has\s*\((.+)\)$/))) {
    pv = { a: 'have', op: 'ge', b: item(m[1]), n: 1 };
  } else {
    throw new PyError(line, 'Check the world, like: robot.block_ahead() == "log", or robot.count("log") >= 3.');
  }
  if (negate) pv.op = { is: 'not', not: 'is', ge: 'lt', lt: 'ge' }[pv.op];
  return { id: 'if_then', pv };
}

function flagCond(src, defs, line, style) {
  const s = src.trim();
  const m = s.match(/^(not\s+)?robot\.([A-Za-z_]\w*)\s*\(\s*\)$/);
  const flags = [...defs.keys()].filter((id) => id.startsWith('if_') && !(defs.get(id).params || []).length && id !== 'if_then' && id !== 'if_else');
  const list = flags.map((f) => `robot.${f.slice(3)}()`).join(', ');
  if (!m) throw new PyError(line, `In ${NAME[style]}, check one thing: ${list}.`);
  if (m[1]) throw new PyError(line, `Use the opposite check instead of "not". You can check: ${list}.`);
  if (!flags.includes(`if_${m[2]}`)) {
    const guess = closest(m[2], flags.map((f) => f.slice(3)));
    throw new PyError(line, `robot.${m[2]}() isn't a check here.${guess ? ` Did you mean robot.${guess}()?` : ` You can check: ${list}.`}`);
  }
  return { id: `if_${m[2]}`, pv: {} };
}

/* ════════════════════════ Python → blocks ════════════════════════ */

export function gamePythonToBlocks(code, library, { group, robotType, style }) {
  const defs = robotCommands(library, group, robotType);
  const events = gameEvents(defs);
  const nested = style === 'flappy' || style === 'craft';
  const allNames = new Set(Object.values(library || {}).flatMap((c) => (c?.blocks || []).map((b) => b.id)));
  const actionNames = [...defs.keys()].filter((id) => !id.startsWith('when_') && !id.startsWith('if_') && !LOOP_BLOCKS.has(id) && !['end', 'else'].includes(id));
  const itemOptions = (defs.get('if_then')?.params || []).find((p) => p.key === 'b')?.options?.map((o) => o[1]) || [];
  const sections = [{ hat: null, blocks: [] }];
  const funcs = {};
  let steps = 0;
  let seq = 0;

  const emit = (id, paramValues, line) => {
    if (++steps > MAX_BLOCKS) throw new PyError(line, `Your program makes more than ${MAX_BLOCKS} blocks — make a loop smaller.`);
    const def = defs.get(id) || {};
    sections[sections.length - 1].blocks.push({
      id, label: def.label || (id === 'end' ? 'End' : id === 'else' ? 'Else' : id), icon: def.icon || '▶', catKey: def.catKey, params: def.params,
      paramValues: paramValues || {}, _uid: `py${line}_${seq++}`, pyLine: line,
    });
  };

  const cond = (src, scope, line) => (style === 'flappy' ? flappyCond(src, scope, line)
    : style === 'craft' ? craftCond(src, scope, line, itemOptions)
      : flagCond(src, defs, line, style));

  const robotCall = (name, argSrc, scope, line) => {
    const def = defs.get(name);
    if (!def || name.startsWith('when_') || name.startsWith('if_') || LOOP_BLOCKS.has(name) || name === 'end' || name === 'else') {
      if (name.startsWith('if_') || defs.has(`if_${name}`)) throw new PyError(line, `robot.${name}() is a check — use it in an if, like: if robot.${name.replace(/^if_/, '')}():`);
      const guess = closest(name, actionNames);
      if (allNames.has(name)) throw new PyError(line, `robot.${name}() isn't used in ${NAME[style]}.${guess ? ` Try robot.${guess}().` : ''}`);
      throw new PyError(line, `This robot doesn't have robot.${name}().${guess ? ` Did you mean robot.${guess}()?` : ' Click a command on the left to see what it can do.'}`);
    }
    const params = def.params || [];
    // Blocks with a condition (Wait until, Walk forward until) take a check as their value
    if (params.some((p) => p.key === 'a') && params.some((p) => p.key === 'b')) {
      if (!argSrc.trim()) throw new PyError(line, `Put a check in the brackets, like robot.${name}(${style === 'craft' ? 'robot.block_ahead() == "log"' : 'robot.pipe_distance() < 3'}).`);
      emit(name, cond(argSrc, scope, line).pv, line);
      return;
    }
    const pv = {};
    let posi = 0;
    splitArgs(argSrc).forEach((a) => {
      const kw = a.match(/^([A-Za-z_]\w*)\s*=(?!=)\s*(.+)$/);
      const p = kw ? params.find((q) => q.key === kw[1]) : params[posi++];
      if (!p) throw new PyError(line, kw ? `robot.${name}() has no "${kw[1]}".` : `robot.${name}() takes ${params.length ? params.map((q) => q.key).join(', ') : 'no values — use empty brackets ()'}.`);
      pv[p.key] = evaluate(kw ? kw[2] : a, scope, line);
    });
    params.forEach((p) => {
      if (pv[p.key] === undefined) pv[p.key] = p.def;
      if (p.type === 'dropdown') {
        const ok = (p.options || []).map((o) => o[1]);
        if (!ok.includes(String(pv[p.key]))) throw new PyError(line, `"${pv[p.key]}" isn't an option for ${p.key}. Use one of: ${ok.map((o) => `"${o}"`).join(', ')}.`);
        pv[p.key] = String(pv[p.key]);
      } else if (['name', 'text'].includes(p.key)) {
        pv[p.key] = String(pv[p.key]);
      } else if (typeof pv[p.key] !== 'number' || Number.isNaN(pv[p.key])) {
        throw new PyError(line, `${p.key} needs a number, like robot.${name}(${p.def ?? 1}).`);
      }
    });
    emit(name, pv, line);
  };

  const usesName = (stmts, name) => stmts.some((s) => new RegExp(`\\b${name}\\b`).test(s.text) || (s.body && usesName(s.body, name)));
  const isRobotIf = (s) => /^(if|elif)\s+.*\brobot\./.test(s.text);
  const isLoopStmt = (s) => /^(for|while)\b/.test(s.text);

  /**
   * ctx.frame: 'root' | 'loop' | 'if' — what directly holds these lines
   * ctx.loops: how many loops are open; ctx.forever: directly inside the football match loop
   */
  const run = (stmts, scope, ctx, depth = 0) => {
    if (depth > 40) throw new PyError(stmts[0]?.n || 1, 'Your functions call each other too many times.');
    // Flat games: anything after a loop would end up inside it
    if (!nested) {
      const firstLoop = stmts.findIndex((s) => isLoopStmt(s) && !/^while\s+(?!True)(?!not\s+robot)/.test(s.text));
      if (firstLoop >= 0) {
        const after = stmts.slice(firstLoop + 1).find((s) => !isLoopStmt(s) && !/^def\b/.test(s.text) && !/^(pass|import|from|print)\b/.test(s.text));
        if (after) throw new PyError(after.n, `In ${NAME[style]}, a loop keeps everything after it. Move this line above the loop, or into it.`);
      }
    }
    if (style === 'fighting') {
      const firstIf = stmts.findIndex(isRobotIf);
      if (firstIf >= 0) {
        const after = stmts.slice(firstIf + 1).find((s) => !isRobotIf(s) && !isLoopStmt(s) && !/^(def|elif|else)\b/.test(s.text) && !/^(pass|import|from|print)\b/.test(s.text));
        if (after) throw new PyError(after.n, 'In boxing, every move after an "if" belongs to that if. Move this line above the first if, or put it inside another if.');
      }
    }
    if (style === 'football' && ctx.forever && stmts.some(isRobotIf)) {
      const loose = stmts.find((s) => /^robot\./.test(s.text));
      if (loose) throw new PyError(loose.n, 'In football, moves outside an "if" only happen when no check is true. Put this move under else:');
    }
    for (let k = 0; k < stmts.length; k++) {
      const st = stmts[k];
      const t = st.text;
      let m;
      if (/^(import\s+\w+|from\s+\w+\s+import\s+.+)$/.test(t) || t === 'pass' || /^print\s*\(/.test(t)) continue;
      if ((m = t.match(/^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:$/))) {
        const fname = m[1];
        if (fname === 'on_start') { run(st.body, scope, ctx, depth + 1); continue; }
        if (/^on_/.test(fname)) {
          const hat = hatFor(fname, events, defs);
          if (!hat) {
            const names = Object.keys(events.fnToHat);
            throw new PyError(st.n, `${NAME[style]} has no ${fname}() event.${names.length ? ` You can use: ${names.slice(0, 6).map((n) => `${n}()`).join(', ')}.` : ''}`);
          }
          if (depth > 0) throw new PyError(st.n, `Event functions like ${fname}() must be at the left edge, not inside something else.`);
          sections.push({ hat: { ...hat, line: st.n }, blocks: [] });
          run(st.body, { ...scope }, { frame: 'root', loops: 0 }, depth + 1);
          sections.push({ hat: null, blocks: [] });
          continue;
        }
        funcs[fname] = { params: m[2].split(',').map((p) => p.trim()).filter(Boolean), body: st.body };
        continue;
      }
      if ((m = t.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\s*\((.*)\)\s*:$/))) {
        const a = splitArgs(m[2]).map((x) => Number(evaluate(x, scope, st.n)));
        const [start, stop, step] = a.length === 1 ? [0, a[0], 1] : [a[0], a[1], a[2] ?? 1];
        if (!step) throw new PyError(st.n, 'range() can’t count in steps of 0.');
        const n = Math.max(0, Math.ceil((stop - start) / step));
        // A counter that changes the moves, or a loop straight inside a loop: write the steps out
        const unroll = usesName(st.body, m[1]) || (nested ? ctx.frame === 'loop' : ctx.loops > 0);
        if (unroll) {
          if (n > 50) throw new PyError(st.n, 'That loop repeats too many times here — use a number up to 50.');
          for (let v = start, c = 0; c < n; v += step, c++) run(st.body, Object.assign(scope, { [m[1]]: v }), ctx, depth + 1);
          continue;
        }
        if (!nested && ctx.frame === 'if') throw new PyError(st.n, `In ${NAME[style]}, loops can't go inside an if. Put the if inside the loop instead.`);
        emit('repeat', { times: Math.max(1, Math.min(100, n)) }, st.n);
        run(st.body, Object.assign(scope, { [m[1]]: start }), { frame: 'loop', loops: ctx.loops + 1 }, depth + 1);
        if (nested) emit('end', {}, st.n);
        continue;
      }
      if ((m = t.match(/^while\s+(.+):$/))) {
        const c = m[1].trim();
        let loopId = null;
        let pv = {};
        if (c === 'True') loopId = 'forever';
        else if (/^not\s+robot\.game_over\s*\(\s*\)$/.test(c) && defs.has('repeat_until') && style === 'flappy') loopId = 'repeat_until';
        else if (/^not\s+robot\.goal_complete\s*\(\s*\)$/.test(c) && defs.has('repeat_until_goal')) loopId = 'repeat_until_goal';
        else if (/robot\./.test(c) && style === 'craft') {
          const neg = c.match(/^not\s+\((.*)\)$/) || c.match(/^not\s+(robot\..*)$/);
          if (neg) { loopId = 'repeat_until'; pv = craftCond(neg[1], scope, st.n, itemOptions).pv; } else { loopId = 'repeat_while'; pv = craftCond(c, scope, st.n, itemOptions).pv; }
        } else if (/robot\./.test(c)) {
          throw new PyError(st.n, style === 'flappy'
            ? 'Use "while True:" with an if inside, or "while not robot.game_over():".'
            : `In ${NAME[style]}, use "while True:" with ifs inside to react to the game.`);
        }
        if (!loopId) { // a while that only uses your own numbers: worked out now
          let guard = 0;
          while (evaluate(c, scope, st.n)) {
            if (++guard > 50) throw new PyError(st.n, 'This while loop never stops. Make sure something inside it changes the check.');
            run(st.body, scope, ctx, depth + 1);
          }
          continue;
        }
        if (nested && ctx.frame === 'loop') throw new PyError(st.n, `In ${NAME[style]}, this loop can't go straight inside another loop. Put it inside an if, or use for i in range(…) instead.`);
        if (!nested && ctx.loops > 0) throw new PyError(st.n, `In ${NAME[style]}, loops can't go inside other loops.`);
        if (!nested && ctx.frame === 'if') throw new PyError(st.n, `In ${NAME[style]}, loops can't go inside an if. Put the if inside the loop instead.`);
        emit(loopId, pv, st.n);
        run(st.body, scope, { frame: 'loop', loops: ctx.loops + 1, forever: loopId === 'forever' }, depth + 1);
        if (nested) emit('end', {}, st.n);
        continue;
      }
      if ((m = t.match(/^if\s+(.+):$/))) {
        const chain = [{ cond: m[1], body: st.body, n: st.n }];
        while (k + 1 < stmts.length && /^(elif\s+.+|else\s*):$/.test(stmts[k + 1].text)) {
          k += 1;
          const e = stmts[k].text.match(/^elif\s+(.+):$/);
          chain.push({ cond: e ? e[1] : null, body: stmts[k].body, n: stmts[k].n });
        }
        if (!/robot\./.test(chain.map((c) => c.cond || '').join(' '))) { // only your own numbers: decided now
          const hit = chain.find((c) => c.cond == null || evaluate(c.cond, scope, c.n));
          if (hit) run(hit.body, scope, ctx, depth + 1);
          continue;
        }
        if (nested) {
          let opened = 0;
          chain.forEach((c, idx) => {
            if (idx > 0) emit('else', {}, c.n);
            if (c.cond == null) { run(c.body, scope, { frame: 'if', loops: ctx.loops }, depth + 1); return; }
            const cd = cond(c.cond, scope, c.n);
            emit(cd.id, cd.pv, c.n);
            opened += 1;
            run(c.body, scope, { frame: 'if', loops: ctx.loops }, depth + 1);
          });
          for (let e = 0; e < opened; e++) emit('end', {}, st.n);
          continue;
        }
        if (style === 'fighting') {
          if (chain.length > 1) throw new PyError(chain[1].n, 'Boxing has no elif or else — use another if, like if robot.enemy_far():');
          const cd = cond(chain[0].cond, scope, st.n);
          const inner = chain[0].body.find((s) => /^(if|for|while)\b/.test(s.text));
          if (inner) throw new PyError(inner.n, 'In boxing, an if holds moves only — no ifs or loops inside it.');
          emit(cd.id, {}, st.n);
          run(chain[0].body, scope, { frame: 'if', loops: ctx.loops }, depth + 1);
          continue;
        }
        // football: each check does one move; else is what happens when no check is true
        chain.forEach((c) => {
          const moves = c.body.filter((s) => !/^(pass|print\s*\()/.test(s.text));
          if (c.cond == null) {
            if (!ctx.forever) throw new PyError(c.n, 'In football, else: only works inside the match loop (while True:).');
            run(c.body, scope, { frame: 'else', loops: ctx.loops }, depth + 1);
            return;
          }
          if (moves.length !== 1 || !/^(robot\.|wait\(|time\.sleep\()/.test(moves[0].text)) {
            throw new PyError(moves[1]?.n || moves[0]?.n || c.n, 'In football, each check does one move. Keep the most important one.');
          }
          const cd = cond(c.cond, scope, c.n);
          emit(cd.id, {}, c.n);
          run(moves, scope, { frame: 'if', loops: ctx.loops }, depth + 1);
        });
        continue;
      }
      if (/^(elif\b|else\b)/.test(t)) throw new PyError(st.n, `"${t.split(/[\s:]/)[0]}" must come straight after an "if".`);
      if (t === 'break') {
        if (!defs.has('break_loop')) throw new PyError(st.n, `${NAME[style]} has no break.`);
        if (!ctx.loops) throw new PyError(st.n, '"break" only works inside a loop.');
        emit('break_loop', {}, st.n);
        continue;
      }
      if ((m = t.match(/^([A-Za-z_]\w*)\s*([-+*/]?=)\s*(.+)$/)) && !t.includes('==')) {
        const [, name, op, rhs] = m;
        if (name === 'robot') throw new PyError(st.n, '"robot" is your robot — choose another name for your variable.');
        const v = evaluate(rhs, scope, st.n);
        if (op !== '=' && !(name in scope)) throw new PyError(st.n, `"${name}" needs a value first, like ${name} = 0.`);
        scope[name] = op === '=' ? v : op === '+=' ? scope[name] + v : op === '-=' ? scope[name] - v : op === '*=' ? scope[name] * v : scope[name] / v;
        // Flappy and Block Crafter keep variables while the game runs, so the blocks set them too
        if (nested && typeof v === 'number' && defs.has('set_var')) {
          if (op === '=') emit('set_var', { name, value: v }, st.n);
          else if (op === '+=' || op === '-=') emit('change_var', { name, value: op === '+=' ? v : -v }, st.n);
        }
        continue;
      }
      if ((m = t.match(/^robot\.([A-Za-z_]\w*)\s*\((.*)\)$/))) { robotCall(m[1], m[2], scope, st.n); continue; }
      if ((m = t.match(/^(?:wait|time\.sleep)\s*\((.*)\)$/))) {
        if (!defs.has('wait')) throw new PyError(st.n, `${NAME[style]} has no wait.`);
        robotCall('wait', m[1] || '1', scope, st.n);
        continue;
      }
      if ((m = t.match(/^wait_until\s*\((.*)\)$/))) {
        if (!defs.has('wait_until')) throw new PyError(st.n, `${NAME[style]} has no wait_until.`);
        robotCall('wait_until', m[1], scope, st.n);
        continue;
      }
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
        run(f.body, local, ctx, depth + 1);
        continue;
      }
      if (/^robot\.\w+$/.test(t)) throw new PyError(st.n, `Add brackets to run it: ${t}()`);
      if (/:$/.test(t)) throw new PyError(st.n, 'I don\'t understand this line. Lines ending in ":" can be "for i in range(3):", "while True:", "if …:" or "def name():".');
      throw new PyError(st.n, 'I don\'t understand this line. Robot commands start with "robot." — for example robot.' + (actionNames[0] || 'move') + '().');
    }
  };

  try {
    const tree = buildTree(readLines(code));
    tree.forEach((st) => {
      const m = st.text.match(/^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:$/);
      if (m && !/^on_/.test(m[1])) funcs[m[1]] = { params: m[2].split(',').map((p) => p.trim()).filter(Boolean), body: st.body };
    });
    run(tree, {}, { frame: 'root', loops: 0 });
  } catch (e) {
    if (e instanceof PyError) return { blocks: [], errors: [{ line: e.line, message: e.message }], steps };
    return { blocks: [], errors: [{ line: 1, message: `Something went wrong reading your code (${e.message}).` }], steps };
  }
  const blocks = sections.filter((s) => !s.hat).flatMap((s) => s.blocks);
  sections.forEach((s, idx) => {
    if (!s.hat) return;
    const def = defs.get(s.hat.id) || {};
    blocks.push({ id: s.hat.id, label: def.label || s.hat.id, icon: def.icon, catKey: def.catKey || 'Events', params: def.params, paramValues: s.hat.paramValues || {}, _uid: `py${s.hat.line}_hat${idx}`, pyLine: s.hat.line });
    blocks.push(...s.blocks);
  });
  return { blocks, errors: [], steps: blocks.filter((b) => !['end', 'else'].includes(b.id) && !String(b.id).startsWith('when_')).length };
}

/* ════════════════════════ Blocks → Python ════════════════════════ */

function condText(b, style) {
  const pv = b.paramValues || {};
  if (style === 'flappy') {
    if (b.id === 'if_falling') return 'robot.is_falling()';
    const op = { if_gt: 'gt', if_lt: 'lt', if_eq: 'eq' }[b.id] || pv.op || 'lt';
    const side = (k, n) => (k === 'num' ? pyValue(n ?? 0) : k === 'var' ? (pv.name || 'myVar') : k === 'falling' ? 'robot.is_falling()' : `robot.${FLAPPY_PY[k] || k}()`);
    if ((pv.a || 'bird_height') === 'falling') return 'robot.is_falling()';
    return `${side(pv.a || 'bird_height')} ${OP_SYM[op]} ${side(pv.b || 'gap_center', pv.n)}`;
  }
  if (style === 'craft') {
    const a = pv.a || 'ahead';
    if (a === 'have') return `robot.count(${pyValue(String(pv.b || 'log'))}) ${pv.op === 'lt' ? '<' : '>='} ${pyValue(Number(pv.n ?? 1))}`;
    return `robot.${CRAFT_PY[a] || 'block_ahead'}() ${pv.op === 'not' ? '!=' : '=='} ${pyValue(String(pv.b || 'air'))}`;
  }
  return `robot.${b.id.replace(/^if_/, '')}()`;
}

function stmtText(b, defs, style) {
  const pv = b.paramValues || {};
  if (b.id === 'wait') return `wait(${pyValue(pv.seconds ?? 1)})`;
  if (b.id === 'break_loop') return 'break';
  if (b.id === 'set_var') return `${pv.name || 'myVar'} = ${pyValue(pv.value ?? 0)}`;
  if (b.id === 'change_var') { const v = Number(pv.value ?? 1); return `${pv.name || 'myVar'} ${v < 0 ? '-=' : '+='} ${pyValue(Math.abs(v))}`; }
  const def = defs.get(b.id) || b;
  const params = def.params || b.params || [];
  if (params.some((p) => p.key === 'a') && params.some((p) => p.key === 'b')) {
    const c = condText({ id: 'if_then', paramValues: pv }, style);
    return b.id === 'wait_until' ? `wait_until(${c})` : `robot.${b.id}(${c})`;
  }
  return `robot.${b.id}(${params.map((p) => pyValue(pv[p.key] ?? p.def)).join(', ')})`;
}

function loopHead(b, style) {
  const pv = b.paramValues || {};
  if (b.id === 'repeat') return `for i in range(${pyValue(pv.times ?? 3)}):`;
  if (b.id === 'forever') return 'while True:';
  if (b.id === 'repeat_until_goal') return 'while not robot.goal_complete():';
  if (b.id === 'repeat_until') return style === 'flappy' ? 'while not robot.game_over():' : `while not (${condText({ id: 'if_then', paramValues: pv }, style)}):`;
  if (b.id === 'repeat_while') return `while ${condText({ id: 'if_then', paramValues: pv }, style)}:`;
  return 'while True:';
}

const isCond = (id) => id.startsWith('if_') && id !== 'if_else';

/** One event's blocks as Python lines (indent = spaces in front). */
function sectionLines(blocks, defs, style, indent) {
  const out = [];
  const pad = (d) => ' '.repeat(indent + d * 4);
  if (style === 'flappy' || style === 'craft') {
    const stack = []; // 'loop' | 'if'
    const bodyCount = [0];
    const put = (s) => { out.push(pad(stack.length) + s); bodyCount[bodyCount.length - 1] += 1; };
    const open = (kind) => { stack.push(kind); bodyCount.push(0); };
    const close = () => { if (bodyCount.pop() === 0) out.push(`${pad(stack.length)}pass`); stack.pop(); };
    blocks.forEach((b) => {
      if (LOOP_BLOCKS.has(b.id)) { while (stack[stack.length - 1] === 'loop') close(); put(loopHead(b, style)); open('loop'); return; }
      if (isCond(b.id)) { put(`if ${condText(b, style)}:`); open('if'); return; }
      if (b.id === 'else') {
        const at = stack.lastIndexOf('if');
        if (at < 0) return;
        while (stack.length > at + 1) close();
        if (bodyCount[bodyCount.length - 1] === 0) out.push(`${pad(stack.length)}pass`);
        stack.pop(); bodyCount.pop();
        out.push(`${pad(stack.length)}else:`);
        open('if');
        return;
      }
      if (b.id === 'end') { if (stack.length) close(); return; }
      put(stmtText(b, defs, style));
    });
    while (stack.length) close();
    return out;
  }
  // football / boxing: flat lists, read the way their engines read them
  let i = 0;
  let depth = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.id === 'repeat' || b.id === 'forever') {
      out.push(pad(0) + loopHead(b, style));
      depth = 1;
      i += 1;
      const inner = [];
      while (i < blocks.length && !['repeat', 'forever'].includes(blocks[i].id)) inner.push(blocks[i++]);
      const lines = style === 'football' ? footballBody(inner, defs, b.id === 'forever') : fightingBody(inner, defs);
      out.push(...(lines.length ? lines : ['pass']).map((l) => pad(depth) + l));
      continue;
    }
    const rest = [];
    while (i < blocks.length && !['repeat', 'forever'].includes(blocks[i].id)) rest.push(blocks[i++]);
    out.push(...(style === 'football' ? footballBody(rest, defs, false) : fightingBody(rest, defs)).map((l) => pad(0) + l));
  }
  return out;
}

function footballBody(blocks, defs, inForever) {
  const ifs = [];
  const ordered = [];
  const loose = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === 'if_then' || b.id === 'if_else') continue;
    if (isCond(b.id)) {
      const next = blocks[i + 1] && !isCond(blocks[i + 1].id) ? blocks[++i] : null;
      const lines = [`if ${condText(b, 'football')}:`, `    ${next ? stmtText(next, defs, 'football') : 'pass'}`];
      ifs.push(lines);
      ordered.push(...lines);
      continue;
    }
    const line = stmtText(b, defs, 'football');
    loose.push(line);
    ordered.push(line);
  }
  // Outside the match loop the blocks simply run in order
  if (!inForever || !ifs.length) return ordered;
  // In the match loop the first true check wins; the other moves are the "else"
  const out = ifs.flatMap((lines, idx) => (idx ? [lines[0].replace(/^if /, 'elif '), lines[1]] : lines));
  return loose.length ? [...out, 'else:', ...loose.map((l) => `    ${l}`)] : out;
}

function fightingBody(blocks, defs) {
  const out = [];
  let inIf = false;
  blocks.forEach((b) => {
    if (b.id === 'if_then' || b.id === 'if_else') return;
    if (isCond(b.id)) { out.push(`if ${condText(b, 'fighting')}:`); inIf = true; return; }
    out.push(`${inIf ? '    ' : ''}${stmtText(b, defs, 'fighting')}`);
  });
  return out;
}

export function gameBlocksToPython(script, library, { group, robotType, style }) {
  const defs = robotCommands(library, group, robotType);
  const events = gameEvents(defs);
  const lines = ['# My robot program — press ▶ Simulate to run it', ''];
  const sections = [{ hat: null, blocks: [] }];
  (script || []).forEach((b) => {
    if (String(b.id).startsWith('when_')) { if (b.id !== 'when_start') sections.push({ hat: b, blocks: [] }); else sections.push({ hat: null, blocks: [] }); return; }
    sections[sections.length - 1].blocks.push(b);
  });
  sections.filter((s) => !s.hat).forEach((s) => lines.push(...sectionLines(s.blocks, defs, style, 0)));
  sections.filter((s) => s.hat).forEach((s) => {
    const pv = s.hat.paramValues || {};
    const fn = s.hat.id === 'when_key' ? (String(pv.key ?? 'space') === 'space' ? 'on_space' : `on_key_${pv.key}`)
      : s.hat.id === 'when_timer' ? `on_timer_${Number(pv.seconds ?? 5)}`
        : events.hatToFn[s.hat.id] || `on_${s.hat.id.slice(5)}`;
    const body = sectionLines(s.blocks, defs, style, 4);
    lines.push('', `def ${fn}():`, ...(body.length ? body : ['    pass']));
  });
  if (lines.length <= 2) lines.push('# Write your program here');
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
}

/** Ready-made Python pieces for each game's help list: [code, label]. */
export function gamePythonExtras(style) {
  if (style === 'flappy') return [
    ['while True:\n    if robot.bird_height() < robot.gap_center():\n        robot.flap()', 'Flap when low'],
    ['if robot.pipe_distance() < 3:\n    robot.flap()\nelse:\n    wait(0.2)', 'If / else'],
    ['while not robot.game_over():\n    robot.flap()\n    wait(0.5)', 'Repeat until game over'],
    ['for i in range(3):\n    robot.flap()', 'Repeat 3 times'],
    ['wait_until(robot.pipe_distance() < 3)', 'Wait until'],
    ['score = 0', 'Make a variable'],
    ['def on_gap_passed():\n    score += 1', 'When gap passed'],
    ['def on_space():\n    robot.flap()', 'When space is pressed'],
  ];
  if (style === 'craft') return [
    ['while robot.block_ahead() == "air":\n    robot.walk(1)', 'Walk while clear'],
    ['if robot.block_ahead() == "log":\n    robot.mine_ahead()\nelse:\n    robot.turn_left()', 'If / else'],
    ['while not (robot.count("log") >= 3):\n    robot.chop_tree()', 'Repeat until I have 3'],
    ['while not robot.goal_complete():\n    robot.walk(1)', 'Repeat until goal'],
    ['for i in range(3):\n    robot.mine_ahead()\n    robot.walk(1)', 'Repeat 3 times'],
    ['robot.walk_until(robot.block_ahead() == "log")', 'Walk until'],
    ['logs = 0', 'Make a variable'],
    ['def on_block_mined():\n    logs += 1', 'When a block is mined'],
  ];
  if (style === 'football') return [
    ['while True:\n    if robot.shooting_range():\n        robot.shoot()\n    elif robot.have_ball():\n        robot.dribble()\n    else:\n        robot.chase_ball()', 'Match loop'],
    ['if robot.ball_close():\n    robot.chase_ball()', 'If ball is close'],
    ['for i in range(3):\n    robot.short_pass()', 'Repeat 3 times'],
    ['def on_goal_scored():\n    robot.celebrate()', 'When I score'],
    ['def on_get_ball():\n    robot.dribble()', 'When I get the ball'],
  ];
  if (style === 'fighting') return [
    ['while True:\n    if robot.enemy_far():\n        robot.advance_step()\n    if robot.enemy_close():\n        robot.jab()\n        robot.cross()', 'Fight loop'],
    ['if robot.under_attack():\n    robot.block()', 'If under attack'],
    ['if robot.health_low():\n    robot.retreat_step()', 'If health is low'],
    ['for i in range(3):\n    robot.jab()', 'Repeat 3 times'],
  ];
  return [];
}
