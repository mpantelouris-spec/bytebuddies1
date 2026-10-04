/**
 * runtimeCompiler.js — turns Robot Lab blocks into a ByteBuddies Runtime program
 * (firmware/bb-runtime/main.ts). The runtime is a tiny machine: one instruction
 * per line, loops and ifs become jumps.
 *
 *   F/B/L/R ms   move / turn for ms        S          stop
 *   M l r        both motors -100..100     SP pct     speed %
 *   W ms         wait
 *   = v a  + v a  - v a  * v a  / v a     variables      OP v a op b   v = a op b
 *   RN v a b  AB v a  MP v a l1 h1 l2 h2  CN v lo hi
 *   J n          jump                      JF a op b n   jump to n if NOT (a op b)
 *   T text  N a  I icon  C  PX x y b       display
 *   HL r g b  HLL r g b  HLR r g b         headlights
 *   TN hz ms  BZ ms  MY name               sound
 *   SV pin deg  SW pin a b  PH pin  PL pin  PW pin v
 *   LG text      message back to the app   FL ms  AW ms   follow line / avoid walls
 * Operands: integer, variable name, or sensor $D $LL $LR $LT $BA $BB $TM $AX $AY $AZ
 *   $SH $TL $TR $TF $TB $TP0 $TP1 $TP2. Comparison ops: < > = ! (≠) L (≤) G (≥).
 */
import { noteHz } from './robotProfiles.js';

const OPENERS = {
  repeat: 'repeat_end', forever: 'repeat_end', for_range: 'for_end', while_do: 'while_end',
  if_then: 'if_end', if_dist: 'if_end', if_line: 'if_end', if_btn_a: 'if_end', if_btn_b: 'if_end',
  if_touch: 'if_end', if_shake: 'if_end', if_tilt: 'if_end', if_light: 'if_end', if_temp: 'if_end', if_compass: 'if_end',
};
const IFS = Object.keys(OPENERS).filter((k) => OPENERS[k] === 'if_end');

const OP_CODE = { '<': '<', '>': '>', '=': '=', '==': '=', '!=': '!', '<=': 'L', '>=': 'G' };
const int = (v, d = 0) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? n : d; };
const clean = (s) => String(s ?? '').replace(/[\r\n]/g, ' ').trim();
const ident = (s, d = 'x') => {
  const t = String(s ?? '').trim();
  return /^[A-Za-z_]\w*$/.test(t) ? t : d;
};
/** A value a pupil typed: a whole number or a variable name. */
const operand = (s, d = 0) => {
  const t = String(s ?? '').trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return String(Math.round(Number(t)));
  if (/^[A-Za-z_]\w*$/.test(t)) return t;
  return String(d);
};
const COLORS = { red: [255, 0, 0], green: [0, 255, 0], blue: [0, 0, 255], yellow: [255, 255, 0], cyan: [0, 255, 255], magenta: [255, 0, 255], white: [255, 255, 255], off: [0, 0, 0] };

/** Turn a block's sensor condition into [a, op, b] (true = do the body). */
function condition(b, tmp) {
  const p = b.params || {};
  switch (b.id) {
    case 'if_then': case 'while_do': case 'else_if':
      return { pre: [], c: [operand(p.cond, 0), OP_CODE[p.op || '<'] || '<', operand(p.val, 0)] };
    case 'if_dist': return { pre: [], c: ['$D', '<', String(int(p.cm, 20))] };
    case 'if_line': return { pre: [`OP ${tmp} $LL + $LR`], c: [tmp, '>', '0'] };
    case 'if_btn_a': return { pre: [], c: ['$BA', '=', '1'] };
    case 'if_btn_b': return { pre: [], c: ['$BB', '=', '1'] };
    case 'if_touch': return { pre: [], c: [`$TP${Math.min(2, Math.max(0, int(p.pin, 0)))}`, '=', '1'] };
    case 'if_shake': return { pre: [], c: ['$SH', '=', '1'] };
    case 'if_tilt': return { pre: [], c: [{ left: '$TL', right: '$TR', forward: '$TF', back: '$TB' }[p.dir] || '$TL', '=', '1'] };
    case 'if_light': return { pre: [], c: ['$LT', '<', String(int(p.val, 100))] };
    case 'if_temp': return { pre: [], c: ['$TM', '>', String(int(p.val, 25))] };
    default: return null; // if_compass: no compass in the runtime
  }
}

/** Instruction(s) for an ordinary block. Returns an array of lines (may be empty). */
function simple(b, warn) {
  const p = b.params || {};
  const ms = (steps) => int(steps, 20) * 10;
  const tms = (deg) => int(deg, 90) * 5;
  switch (b.id) {
    case 'forward': return [`F ${ms(p.amount)}`];
    case 'back': return [`B ${ms(p.amount)}`];
    case 'left': case 'spin_left': return [`L ${tms(p.degrees)}`];
    case 'right': case 'spin_right': return [`R ${tms(p.degrees)}`];
    case 'move_left': return [`L ${tms(90)}`, `F ${ms(p.amount)}`, `R ${tms(90)}`];
    case 'move_right': return [`R ${tms(90)}`, `F ${ms(p.amount)}`, `L ${tms(90)}`];
    case 'stop': case 'coast': case 'stop_all': return ['S'];
    case 'speed': return [`SP ${int(p.pct, 75)}`];
    case 'motor_l': return [`M ${int(p.power, 50)} 0`];
    case 'motor_r': return [`M 0 ${int(p.power, 50)}`];
    case 'motors': return [`M ${int(p.left, 50)} ${int(p.right, 50)}`];
    case 'wait': return [`W ${Math.round((Number(p.secs) || 1) * 1000)}`];
    case 'follow_line': return [`FL ${Math.round((Number(p.secs) || 3) * 1000)}`];
    case 'avoid_wall': return [`AW ${Math.round((Number(p.secs) || 5) * 1000)}`];
    case 'read_dist': case 'read_sonar': return [`= ${ident(p.var, 'dist')} $D`];
    case 'read_light': return [`= ${ident(p.var, 'light')} $LT`];
    case 'read_line_l': return [`= ${ident(p.var, 'lineL')} $LL`];
    case 'read_line_r': return [`= ${ident(p.var, 'lineR')} $LR`];
    case 'read_btn_a': return [`= ${ident(p.var, 'btnA')} $BA`];
    case 'read_btn_b': return [`= ${ident(p.var, 'btnB')} $BB`];
    case 'read_temp': return [`= ${ident(p.var, 'temp')} $TM`];
    case 'read_accel': return [`= ${ident(p.var, 'ax')} $A${String(p.axis || 'x').toUpperCase()}`];
    case 'read_compass': warn('The compass isn’t available in the runtime — heading reads 0.'); return [`= ${ident(p.var, 'heading')} 0`];
    case 'var_set': return [`= ${ident(p.name)} ${operand(p.val)}`];
    case 'var_inc': return [`+ ${ident(p.name)} ${operand(p.val, 1)}`];
    case 'var_dec': return [`- ${ident(p.name)} ${operand(p.val, 1)}`];
    case 'var_show': return [`N ${ident(p.name)}`];
    case 'math_random': return [`RN ${ident(p.var, 'n')} ${operand(p.min, 1)} ${operand(p.max, 10)}`];
    case 'math_abs': return [`AB ${ident(p.var)} ${operand(p.src || p.var)}`];
    case 'math_map': return [`MP ${ident(p.var, 'mapped')} ${operand(p.src)} ${operand(p.low1, 0)} ${operand(p.hi1, 100)} ${operand(p.low2, 0)} ${operand(p.hi2, 1023)}`];
    case 'math_constrain': return [`CN ${ident(p.var)} ${operand(p.min, 0)} ${operand(p.max, 100)}`];
    case 'math_expr': {
      const m = String(p.expr || '').trim().match(/^([A-Za-z_]\w*|-?\d+)\s*([-+*/%])\s*([A-Za-z_]\w*|-?\d+)$/);
      if (m) return [`OP ${ident(p.var)} ${operand(m[1])} ${m[2]} ${operand(m[3])}`];
      if (/^([A-Za-z_]\w*|-?\d+)$/.test(String(p.expr || '').trim())) return [`= ${ident(p.var)} ${operand(p.expr)}`];
      warn(`“${p.expr}” is too complex for the micro:bit — use one + − × ÷ at a time.`);
      return [];
    }
    case 'display': case 'disp_scroll': return [`T ${clean(p.text) || 'Hi'}`];
    case 'show_num': case 'disp_show': return [`N ${operand(p.num ?? p.val, 0)}`];
    case 'show_icon': case 'disp_image': return [`I ${String(p.icon || 'HAPPY').toUpperCase()}`];
    case 'clear_disp': case 'disp_clear': return ['C'];
    case 'disp_pixel': return [`PX ${int(p.x, 2)} ${int(p.y, 2)} ${int(p.bright, 9)}`];
    case 'led': { const c = COLORS[p.color] || COLORS.red; return [`HL ${c.join(' ')}`, p.color === 'off' ? 'C' : 'PX 2 2 9']; }
    case 'led_rgb': case 'headlight': return [`HL ${int(p.r)} ${int(p.g)} ${int(p.b)}`];
    case 'headlight_l': return [`HLL ${int(p.r)} ${int(p.g)} ${int(p.b)}`];
    case 'headlight_r': return [`HLR ${int(p.r)} ${int(p.g)} ${int(p.b)}`];
    case 'led_bright': return [];
    case 'buzz': return [`BZ ${Math.round((Number(p.secs) || 0.5) * 1000)}`];
    case 'play_note': return [`TN ${noteHz(p.note)} ${Math.round((Number(p.secs) || 0.5) * 1000)}`];
    case 'play_melody': return [`MY ${p.melody || 'happy'}`];
    case 'servo': return [`SV ${int(p.pin, 0)} ${int(p.angle, 90)}`];
    case 'servo_sweep': return [`SW ${int(p.pin, 0)} ${int(p.from, 0)} ${int(p.to, 180)}`];
    case 'servo_stop': return [`PL ${int(p.pin, 0)}`];
    case 'pin_high': return [`PH ${int(p.pin, 0)}`];
    case 'pin_low': return [`PL ${int(p.pin, 0)}`];
    case 'pwm': return [`PW ${int(p.pin, 0)} ${Math.round(int(p.val, 128) * 1023 / 255)}`];
    case 'log': case 'send_msg': return [`LG ${clean(p.msg) || 'hello'}`];
    case 'neo_init': case 'neo_color': case 'neo_rgb': case 'neo_all': case 'neo_show': case 'neo_clear': case 'neo_bright':
      warn('NeoPixel strips can’t run alongside Bluetooth on the micro:bit, so NeoPixel blocks are skipped.');
      return [];
    case 'radio_send': case 'radio_group': case 'radio_recv':
      warn('Radio and Bluetooth can’t be used together on the micro:bit, so radio blocks are skipped.');
      return [];
    default: return [];
  }
}

/**
 * Compile a Robot Lab program (blocks sorted top-to-bottom).
 * @returns {{ lines: string[], warnings: string[] }}
 */
export function compileForRuntime(blocks) {
  const list = [...(blocks || [])].sort((a, b) => a.y - b.y);
  const lines = [];
  const warnings = new Set();
  const warn = (m) => warnings.add(m);
  let tmpN = 0;
  const tmp = () => `_t${tmpN++}`;

  // Find the block that closes the opener at i (depth-aware)
  const findEnd = (i, end) => {
    let depth = 0;
    for (let j = i + 1; j < list.length; j++) {
      const id = list[j].id;
      if (OPENERS[id] === end) depth++;
      else if (id === end) { if (depth === 0) return j; depth--; }
    }
    return list.length;
  };
  const emit = (s) => { lines.push(s); return lines.length - 1; };
  const patch = (idx, target) => { lines[idx] = lines[idx].replace(/@$/, String(target)); };

  // breaks: stack of arrays of jump indexes to patch to the loop's end
  const breaks = [];

  const compileRange = (from, to) => {
    let i = from;
    while (i < to) {
      const b = list[i];
      const p = b.params || {};
      if (b.id === 'break') {
        if (breaks.length) breaks[breaks.length - 1].push(emit('J @'));
        i++; continue;
      }
      if (b.id === 'repeat' || b.id === 'forever' || b.id === 'for_range' || b.id === 'while_do') {
        const end = findEnd(i, OPENERS[b.id]);
        breaks.push([]);
        if (b.id === 'forever') {
          const top = lines.length;
          compileRange(i + 1, end);
          emit(`J ${top}`);
        } else if (b.id === 'repeat') {
          const v = tmp();
          emit(`= ${v} 0`);
          const top = emit(`JF ${v} < ${operand(p.times, 3)} @`);
          compileRange(i + 1, end);
          emit(`+ ${v} 1`);
          emit(`J ${top}`);
          patch(top, lines.length);
        } else if (b.id === 'for_range') {
          const v = ident(p.var, 'i');
          emit(`= ${v} ${operand(p.from, 0)}`);
          const top = emit(`JF ${v} L ${operand(p.to, 5)} @`);
          compileRange(i + 1, end);
          emit(`+ ${v} 1`);
          emit(`J ${top}`);
          patch(top, lines.length);
        } else {
          const top = lines.length;
          const { c } = condition(b, null);
          const jf = emit(`JF ${c.join(' ')} @`);
          compileRange(i + 1, end);
          emit(`J ${top}`);
          patch(jf, lines.length);
        }
        breaks.pop().forEach((j) => patch(j, lines.length));
        i = end + 1; continue;
      }
      if (IFS.includes(b.id)) {
        const end = findEnd(i, 'if_end');
        // split into branches at depth-0 else_if / else_branch
        const branches = [{ cond: b, from: i + 1, to: end }];
        let depth = 0;
        for (let j = i + 1; j < end; j++) {
          const id = list[j].id;
          if (OPENERS[id]) depth++;
          else if (Object.values(OPENERS).includes(id)) depth--;
          else if (depth === 0 && (id === 'else_if' || id === 'else_branch')) {
            branches[branches.length - 1].to = j;
            branches.push({ cond: id === 'else_if' ? list[j] : null, from: j + 1, to: end });
          }
        }
        const toEnd = [];
        branches.forEach((br, k) => {
          let jf = null;
          if (br.cond) {
            const cond = condition(br.cond, tmp());
            if (!cond) { warn('The compass isn’t available in the runtime — that check counts as false.'); jf = emit('J @'); }
            else { cond.pre.forEach(emit); jf = emit(`JF ${cond.c.join(' ')} @`); }
          }
          compileRange(br.from, br.to);
          if (k < branches.length - 1) toEnd.push(emit('J @'));
          if (jf !== null) patch(jf, lines.length);
        });
        toEnd.forEach((j) => patch(j, lines.length));
        i = end + 1; continue;
      }
      if (b.id === 'wait_dist' || b.id === 'wait_line') {
        const top = lines.length;
        if (b.id === 'wait_dist') {
          const jf = emit(`JF $D G ${int(p.cm, 20)} @`);
          emit('W 20'); emit(`J ${top}`); patch(jf, lines.length);
        } else {
          const t = tmp();
          emit(`OP ${t} $LL + $LR`);
          const jf = emit(`JF ${t} = 0 @`);
          emit('W 20'); emit(`J ${top}`); patch(jf, lines.length);
        }
        i++; continue;
      }
      if (['repeat_end', 'for_end', 'while_end', 'if_end', 'else_branch', 'else_if', 'on_start'].includes(b.id)) { i++; continue; }
      simple(b, warn).forEach(emit);
      i++;
    }
  };

  compileRange(0, list.length);
  emit('S');
  return { lines, warnings: [...warnings] };
}

/** Robot Lab kit → runtime kit name (null = not supported by the runtime yet). */
export const RUNTIME_KIT = { generic: 'generic', cutebot: 'cutebot', maqueen: 'maqueen', bitbot: 'bitbot', move: 'move', ringbitcar: 'ringbit', maqueenplus: null, cutebotpro: null };

/**
 * A JavaScript copy of the runtime's interpreter, used for tests and as a
 * reference. `sensors` supplies $ values; returns the actions performed.
 */
export function simulateRuntime(lines, sensors = {}, maxSteps = 5000) {
  const vars = {};
  const log = [];
  const val = (t) => {
    if (/^-?\d+$/.test(t)) return parseInt(t, 10);
    if (t[0] === '$') { const s = sensors[t.slice(1)]; return typeof s === 'function' ? s() : (s ?? 0); }
    return vars[t] ?? 0;
  };
  const test = (a, op, b) => ({ '<': a < b, '>': a > b, '=': a === b, '!': a !== b, L: a <= b, G: a >= b }[op] ?? false);
  const calc = (a, op, b) => ({ '+': a + b, '-': a - b, '*': a * b, '/': b ? Math.trunc(a / b) : 0, '%': b ? a % b : 0 }[op] ?? a);
  let pc = 0; let steps = 0;
  while (pc >= 0 && pc < lines.length && steps++ < maxSteps) {
    const t = lines[pc].split(' ');
    const op = t[0];
    let next = pc + 1;
    if (op === 'J') next = parseInt(t[1], 10);
    else if (op === 'JF') { if (!test(val(t[1]), t[2], val(t[3]))) next = parseInt(t[4], 10); }
    else if (op === '=') vars[t[1]] = val(t[2]);
    else if (['+', '-', '*', '/'].includes(op)) vars[t[1]] = calc(vars[t[1]] ?? 0, op, val(t[2]));
    else if (op === 'OP') vars[t[1]] = calc(val(t[2]), t[3], val(t[4]));
    else if (op === 'AB') vars[t[1]] = Math.abs(val(t[2]));
    else if (op === 'CN') vars[t[1]] = Math.min(val(t[3]), Math.max(val(t[2]), vars[t[1]] ?? 0));
    else if (op === 'RN') vars[t[1]] = val(t[2]);
    else log.push(t.map((x, k) => (k > 0 && !/^-?\d+$/.test(x) && (x[0] === '$' || x in vars) ? String(val(x)) : x)).join(' '));
    pc = next;
  }
  return { log, vars, steps };
}
