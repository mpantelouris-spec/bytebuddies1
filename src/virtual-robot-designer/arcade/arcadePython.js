/**
 * Python for the Robot Arcade games (Snake, Pac, Brick, Hop, Raiders, Jump).
 *
 * The arcade engine already works like Python: each block has an indent, and indentation decides
 * what sits inside Forever / Repeat / If. So Python lines map straight onto blocks:
 *
 *   while True:                    → Forever
 *   for i in range(4):             → Repeat 4
 *   while not robot.wall_ahead():  → Repeat until wall ahead
 *   if robot.food_left(): / else:  → If food is to the left / Else
 *   robot.turn_left()              → Turn left
 */
import { readLines, buildTree, evaluate, splitArgs, closest, PyError, pyValue } from '../studio/robotPython.js';
import { blockDef } from './engine.js';

const MAX_BLOCKS = 300;

function pyHead(b) {
  const p = b.params || {};
  if (b.type === 'forever') return 'while True:';
  if (b.type === 'repeat') return `for i in range(${pyValue(p.times ?? 4)}):`;
  if (b.type === 'repeat_until') return `while not robot.${p.cond}():`;
  if (b.type === 'if') return `if robot.${p.cond}():`;
  if (b.type === 'else') return 'else:';
  return null;
}

/** The arcade program (flat, indented blocks) as Python. */
export function arcadeBlocksToPython(blocks, game) {
  const lines = ['# My robot program — press ▶ Simulate to run it', ''];
  const list = blocks || [];
  list.forEach((b, i) => {
    const pad = ' '.repeat(Math.max(0, b.indent || 0) * 4);
    const head = pyHead(b);
    if (head) {
      lines.push(pad + head);
      const next = list[i + 1];
      if (!next || (next.indent || 0) <= (b.indent || 0)) lines.push(`${pad}    pass`);
      return;
    }
    const p = b.params || {};
    if (b.type === 'wait') { lines.push(`${pad}wait(${pyValue(p.seconds ?? 0.5)})`); return; }
    const params = blockDef(game, b.type)?.params || [];
    lines.push(`${pad}robot.${b.type}(${params.map((d) => pyValue(p[d.key] ?? d.default)).join(', ')})`);
  });
  if (lines.length <= 2) lines.push('# Write your program here');
  return `${lines.join('\n')}\n`;
}

/** Python → arcade blocks. `allowed` = block types this level can use. */
export function arcadePythonToBlocks(code, game, allowed) {
  const can = new Set(allowed || Object.keys(game.blocks));
  const conds = game.conditions.map((c) => c.id);
  const actions = Object.keys(game.blocks).filter((t) => can.has(t));
  const out = [];
  let seq = 0;
  const funcs = {};
  const push = (type, indent, params, line) => {
    if (out.length >= MAX_BLOCKS) throw new PyError(line, `Your program has more than ${MAX_BLOCKS} blocks — use a loop.`);
    out.push({ id: `py${line}_${seq++}`, type, indent, params: params || {} });
  };
  const needs = (type, line, what) => {
    if (!can.has(type)) throw new PyError(line, `This level doesn't use ${what} yet. Try the blocks it does use: ${[...can].join(', ')}.`);
  };
  const condOf = (src, line) => {
    const m = src.trim().match(/^robot\.([A-Za-z_]\w*)\s*\(\s*\)$/);
    if (/^not\b/.test(src.trim())) throw new PyError(line, 'Use else: for the other case instead of "not".');
    if (!m) throw new PyError(line, `Check one thing, like robot.${conds[0]}().`);
    if (!conds.includes(m[1])) {
      const guess = closest(m[1], conds);
      throw new PyError(line, `robot.${m[1]}() isn't a check in ${game.title || 'this game'}.${guess ? ` Did you mean robot.${guess}()?` : ` You can check: ${conds.map((c) => `robot.${c}()`).join(', ')}.`}`);
    }
    return m[1];
  };

  const run = (stmts, indent, scope, depth = 0) => {
    if (depth > 30) throw new PyError(stmts[0]?.n || 1, 'Your functions call each other too many times.');
    for (let k = 0; k < stmts.length; k++) {
      const st = stmts[k];
      const t = st.text;
      let m;
      if (/^(import\s+\w+|from\s+\w+\s+import\s+.+)$/.test(t) || t === 'pass' || /^print\s*\(/.test(t)) continue;
      if ((m = t.match(/^def\s+([A-Za-z_]\w*)\s*\(\s*\)\s*:$/))) { funcs[m[1]] = st.body; continue; }
      if (/^def\b/.test(t)) throw new PyError(st.n, 'Your own commands here can\'t take values — use empty brackets, like def zigzag():');
      if (t === 'while True:') {
        needs('forever', st.n, 'while True (Forever)');
        push('forever', indent, {}, st.n);
        run(st.body, indent + 1, scope, depth + 1);
        continue;
      }
      if ((m = t.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\s*\((.*)\)\s*:$/))) {
        const a = splitArgs(m[2]).map((x) => Number(evaluate(x, scope, st.n)));
        const times = a.length === 1 ? a[0] : Math.ceil((a[1] - a[0]) / (a[2] || 1));
        needs('repeat', st.n, 'for loops (Repeat)');
        push('repeat', indent, { times: Math.max(1, Math.min(50, Math.round(times))) }, st.n);
        run(st.body, indent + 1, scope, depth + 1);
        continue;
      }
      if ((m = t.match(/^while\s+not\s+(.+):$/))) {
        needs('repeat_until', st.n, 'while not … (Repeat until)');
        push('repeat_until', indent, { cond: condOf(m[1], st.n) }, st.n);
        run(st.body, indent + 1, scope, depth + 1);
        continue;
      }
      if (/^while\b/.test(t)) throw new PyError(st.n, `Use "while True:" or "while not robot.${conds[0]}():".`);
      if ((m = t.match(/^if\s+(.+):$/))) {
        needs('if', st.n, 'if');
        push('if', indent, { cond: condOf(m[1], st.n) }, st.n);
        run(st.body, indent + 1, scope, depth + 1);
        // elif → Else with an If inside it
        let extra = 0;
        while (k + 1 < stmts.length && /^(elif\s+.+|else\s*):$/.test(stmts[k + 1].text)) {
          k += 1;
          const e = stmts[k];
          needs('else', e.n, 'else');
          push('else', indent + extra, {}, e.n);
          const em = e.text.match(/^elif\s+(.+):$/);
          if (em) {
            push('if', indent + extra + 1, { cond: condOf(em[1], e.n) }, e.n);
            run(e.body, indent + extra + 2, scope, depth + 1);
            extra += 1;
          } else {
            run(e.body, indent + extra + 1, scope, depth + 1);
            break;
          }
        }
        continue;
      }
      if (/^(elif\b|else\b)/.test(t)) throw new PyError(st.n, `"${t.split(/[\s:]/)[0]}" must come straight after an "if".`);
      if ((m = t.match(/^([A-Za-z_]\w*)\s*([-+*/]?=)\s*(.+)$/)) && !t.includes('==')) {
        const v = evaluate(m[3], scope, st.n);
        const [, name, op] = m;
        if (op !== '=' && !(name in scope)) throw new PyError(st.n, `"${name}" needs a value first, like ${name} = 0.`);
        scope[name] = op === '=' ? v : op === '+=' ? scope[name] + v : op === '-=' ? scope[name] - v : op === '*=' ? scope[name] * v : scope[name] / v;
        continue;
      }
      if ((m = t.match(/^(?:wait|time\.sleep)\s*\((.*)\)$/))) {
        needs('wait', st.n, 'wait');
        push('wait', indent, { seconds: Math.max(0.1, Math.min(5, Number(evaluate(m[1] || '0.5', scope, st.n)) || 0.5)) }, st.n);
        continue;
      }
      if ((m = t.match(/^robot\.([A-Za-z_]\w*)\s*\((.*)\)$/))) {
        const [, name, argSrc] = m;
        if (conds.includes(name)) throw new PyError(st.n, `robot.${name}() is a check — use it in an if, like: if robot.${name}():`);
        if (!game.blocks[name]) {
          const guess = closest(name, actions);
          throw new PyError(st.n, `This robot doesn't have robot.${name}().${guess ? ` Did you mean robot.${guess}()?` : ` It can: ${actions.map((a) => `robot.${a}()`).join(', ')}.`}`);
        }
        needs(name, st.n, `robot.${name}()`);
        const defs = game.blocks[name].params || [];
        const args = splitArgs(argSrc);
        if (args.length > defs.length) throw new PyError(st.n, `robot.${name}() takes ${defs.length ? defs.map((d) => d.key).join(', ') : 'no values — use empty brackets ()'}.`);
        const params = {};
        defs.forEach((d, i) => {
          const v = args[i] != null ? evaluate(args[i], scope, st.n) : d.default;
          if (d.type === 'num') {
            if (typeof v !== 'number' || Number.isNaN(v)) throw new PyError(st.n, `${d.key} needs a number, like robot.${name}(${d.default}).`);
            params[d.key] = Math.max(d.min ?? -Infinity, Math.min(d.max ?? Infinity, v));
          } else params[d.key] = v;
        });
        push(name, indent, params, st.n);
        continue;
      }
      if ((m = t.match(/^([A-Za-z_]\w*)\s*\(\s*\)$/))) {
        if (!funcs[m[1]]) {
          if (game.blocks[m[1]]) throw new PyError(st.n, `Put "robot." in front: robot.${m[1]}()`);
          throw new PyError(st.n, `I don't know ${m[1]}(). Write "def ${m[1]}():" above it first.`);
        }
        run(funcs[m[1]], indent, scope, depth + 1);
        continue;
      }
      throw new PyError(st.n, `I don't understand this line. Robot commands start with "robot." — for example robot.${actions[0] || 'move'}().`);
    }
  };

  try {
    const tree = buildTree(readLines(code));
    tree.forEach((st) => { const m = st.text.match(/^def\s+([A-Za-z_]\w*)\s*\(\s*\)\s*:$/); if (m) funcs[m[1]] = st.body; });
    run(tree, 0, {});
  } catch (e) {
    if (e instanceof PyError) return { blocks: [], errors: [{ line: e.line, message: e.message }], steps: 0 };
    return { blocks: [], errors: [{ line: 1, message: `Something went wrong reading your code (${e.message}).` }], steps: 0 };
  }
  return { blocks: out, errors: [], steps: out.filter((b) => b.type !== 'else').length };
}

/** Help list for the Python pane: the game's commands plus ready-made loop and if pieces. */
export function arcadePythonHelp(game, allowed) {
  const can = new Set(allowed || Object.keys(game.blocks));
  const cmds = Object.entries(game.blocks).filter(([t]) => can.has(t))
    .map(([t, d]) => ({ label: d.label, code: `robot.${t}(${(d.params || []).map((p) => pyValue(p.default)).join(', ')})` }));
  const first = Object.keys(game.blocks).find((t) => can.has(t)) || 'move';
  const c = game.conditions[0]?.id || 'wall_ahead';
  const extras = [
    can.has('forever') && [`while True:\n    robot.${first}()`, 'Forever'],
    can.has('repeat') && [`for i in range(4):\n    robot.${first}()`, 'Repeat 4 times'],
    can.has('repeat_until') && [`while not robot.${c}():\n    robot.${first}()`, 'Repeat until'],
    can.has('if') && [`if robot.${c}():\n    robot.${first}()`, 'If'],
    can.has('if') && can.has('else') && [`if robot.${c}():\n    robot.${first}()\nelse:\n    wait(0.5)`, 'If / else'],
    can.has('wait') && ['wait(0.5)', 'Wait'],
  ].filter(Boolean);
  const checks = can.has('if') || can.has('repeat_until') ? game.conditions.map((cd) => ({ label: cd.label, code: `robot.${cd.id}()` })) : [];
  return { cmds, extras, checks };
}
