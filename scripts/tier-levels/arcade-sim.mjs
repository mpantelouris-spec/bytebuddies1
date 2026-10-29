/**
 * Plays an arcade program against a level with the game's own rules — the same
 * loop ArcadeLab.jsx runs, without drawing. Used to prove every arcade level
 * can be won with the program its tier teaches.
 */
import { parse, execute } from '../../src/virtual-robot-designer/arcade/engine.js';

let n = 0;
/** Program rows like the games' starters: ['if', 1, { cond: 'wall_ahead' }] */
export const prog = (rows) => rows.map(([type, indent = 0, params = {}]) => ({ id: `p${n++}`, type, indent, params }));

/**
 * Run `program` on `level` (a level object; it is swapped in as level 0).
 * Returns { win, msg, time }.
 */
export function play(game, level, program, { maxTime = 240 } = {}) {
  const saved = game.levels[0];
  game.levels[0] = level;
  try {
    const w = game.init(0);
    const gen = execute(parse(program), (cond) => game.sense(w, cond));
    let ended = false; let t = 0; let guard = 0;
    while (!w.result && t < maxTime && guard++ < 2_000_000) {
      if (!ended && (!w.cmd || w.cmd.done)) {
        const step = gen.next();
        if (step.done) {
          ended = true; w.cmd = null;
          const res = game.end(w);
          if (res) { w.result = w.result || res; break; }
          continue;
        }
        const a = step.value;
        if (a.type === 'wait') w.cmd = { type: 'wait', t: 0, dur: Math.max(0.05, Number(a.params?.seconds) || 0.5) };
        else if (a.type === 'idle') w.cmd = { type: 'idle', t: 0, dur: a.soft ? 1 / 120 : 1 / 60 };
        else game.start(w, a);
        if (!w.cmd || w.cmd.dur === 0) { if (w.cmd) w.cmd.done = true; continue; }
      }
      game.tick(w, 1 / 60);
      t += 1 / 60;
    }
    return { win: !!w.result?.win, msg: w.result?.msg || (t >= maxTime ? 'timeout' : 'no result'), time: Math.round(t) };
  } finally {
    game.levels[0] = saved;
  }
}
