/**
 * Flappy BirdBot — Blockly compile + per-frame runtime executor.
 * Evaluates conditions, runs forever loops once per tick, handles wait/break.
 */
import { parseEventScript } from './flappy-starter-script.js';

function chainBlocks(startBlock) {
  const blocks = [];
  let b = startBlock;
  while (b) {
    blocks.push(b);
    b = b.getNextBlock();
  }
  return blocks;
}

function compileExpr(block) {
  if (!block) return { kind: 'num', value: 0 };
  const t = block.type;
  const id = block.id;
  if (t === 'math_number') {
    return { kind: 'num', value: Number(block.getFieldValue('NUM')) || 0, id };
  }
  const sensorMap = {
    robot_num_pipe_dist: 'distanceToPipe',
    robot_num_bird_height: 'birdHeight',
    robot_num_gap_center: 'gapCenterHeight',
    robot_num_gap_size: 'gapSize',
    robot_num_time_alive: 'timeAlive',
    robot_num_score: 'score',
    robot_num_high_score: 'highScore',
  };
  if (sensorMap[t]) return { kind: 'sensor', key: sensorMap[t], id };
  if (t === 'robot_is_falling_bool') return { kind: 'sensor', key: 'isFalling', id };
  if (t === 'robot_var_get') {
    return { kind: 'var', name: block.getFieldValue('VAR') || 'myVar', id };
  }
  if (t === 'robot_flappy_gt' || t === 'robot_flappy_lt' || t === 'robot_flappy_eq') {
    const op = t === 'robot_flappy_gt' ? 'gt' : t === 'robot_flappy_lt' ? 'lt' : 'eq';
    return {
      kind: 'compare', op, id,
      a: compileExpr(block.getInputTargetBlock('A')),
      b: compileExpr(block.getInputTargetBlock('B')),
    };
  }
  if (t === 'robot_flappy_and' || t === 'robot_flappy_or') {
    return {
      kind: t === 'robot_flappy_and' ? 'and' : 'or', id,
      a: compileExpr(block.getInputTargetBlock('A')),
      b: compileExpr(block.getInputTargetBlock('B')),
    };
  }
  if (t === 'robot_math_add' || t === 'robot_math_sub'
      || t === 'robot_math_mul' || t === 'robot_math_div') {
    const op = { robot_math_add: 'add', robot_math_sub: 'sub', robot_math_mul: 'mul', robot_math_div: 'div' }[t];
    return {
      kind: 'math', op, id,
      a: compileExpr(block.getInputTargetBlock('A')),
      b: compileExpr(block.getInputTargetBlock('B')),
    };
  }
  return { kind: 'num', value: 0, id };
}

function compileStatement(block) {
  if (!block) return null;
  const t = block.type;
  const id = block.id;
  const body = (inputName) => compileStatements(block.getInputTargetBlock(inputName));

  switch (t) {
    case 'robot_flap': return { op: 'flap', id };
    case 'robot_set_flap_strength':
      return { op: 'set_flap_strength', strength: Number(block.getFieldValue('STRENGTH')) || 5, id };
    case 'robot_set_gravity_strength':
      return { op: 'set_gravity_strength', strength: Number(block.getFieldValue('STRENGTH')) || 5, id };
    case 'robot_set_scroll_speed':
      return { op: 'set_scroll_speed', speed: Number(block.getFieldValue('SPEED')) || 5, id };
    case 'robot_freeze_bird': return { op: 'freeze_bird', id };
    case 'robot_move_up_units':
      return { op: 'move_up', units: Number(block.getFieldValue('UNITS')) || 3, id };
    case 'robot_move_down_units':
      return { op: 'move_down', units: Number(block.getFieldValue('UNITS')) || 3, id };
    case 'robot_set_bird_height':
      return { op: 'set_bird_height', height: compileExpr(block.getInputTargetBlock('HEIGHT')), id };
    case 'robot_wait':
      return { op: 'wait', seconds: Number(block.getFieldValue('SECS')) || 1, id };
    case 'robot_pause_game':
      return { op: 'pause_game', seconds: Number(block.getFieldValue('SECS')) || 1, id };
    case 'robot_repeat':
      return {
        op: 'repeat', times: Math.max(1, Number(block.getFieldValue('TIMES')) || 3),
        body: body('DO'), id,
      };
    case 'robot_repeat_count_with':
      return {
        op: 'repeat_with', times: Math.max(1, Number(block.getFieldValue('TIMES')) || 5),
        varName: block.getFieldValue('VAR') || 'i', body: body('DO'), id,
      };
    case 'robot_repeat_until_gameover':
      return { op: 'repeat_until_gameover', body: body('DO'), id };
    case 'robot_forever':
      return { op: 'forever', body: body('DO'), id };
    case 'robot_break_loop':
      return { op: 'break', id };
    case 'robot_if_then':
      return { op: 'if', cond: compileExpr(block.getInputTargetBlock('COND')), body: body('DO'), id };
    case 'robot_if_else':
      return {
        op: 'if_else', cond: compileExpr(block.getInputTargetBlock('COND')),
        body: body('DO'), elseBody: body('ELSE'), id,
      };
    case 'robot_var_create':
      return { op: 'var_create', name: block.getFieldValue('VAR') || 'myVar', id };
    case 'robot_var_set':
      return {
        op: 'var_set', name: block.getFieldValue('VAR') || 'myVar',
        value: compileExpr(block.getInputTargetBlock('VAL')), id,
      };
    case 'robot_var_change':
      return {
        op: 'var_change', name: block.getFieldValue('VAR') || 'myVar',
        delta: Number(block.getFieldValue('DELTA')) || 1, id,
      };
    case 'robot_show_variable':
      return { op: 'show_variable', name: block.getFieldValue('VAR') || 'myVar', id };
    case 'robot_hide_variable':
      return { op: 'hide_variable', name: block.getFieldValue('VAR') || 'myVar', id };
    case 'robot_show_score': return { op: 'show_score', id };
    case 'robot_restart_game': return { op: 'restart_game', id };
    case 'robot_show_message':
      return { op: 'show_message', text: String(block.getFieldValue('TEXT') || '').slice(0, 40), id };
    case 'robot_play_sound':
      return { op: 'play_sound', sound: block.getFieldValue('SOUND') || 'beep', id };
    default:
      return null;
  }
}

function compileStatements(startBlock) {
  return chainBlocks(startBlock).map(compileStatement).filter(Boolean);
}

/** Compile Blockly workspace into event handlers + forever loop registry. */
export function compileFlappyWorkspace(ws) {
  const handlers = {
    start: [], spacebar: [], collision: [], gap_passed: [], game_over: [],
  };
  const tickLoops = [];

  if (!ws) return { handlers, tickLoops };

  for (const hat of ws.getTopBlocks(true)) {
    if (!hat.type.startsWith('robot_when_')) continue;
    let key = null;
    if (hat.type === 'robot_when_start') key = 'start';
    else if (hat.type === 'robot_when_key' && hat.getFieldValue('KEY') === 'space') key = 'spacebar';
    else if (hat.type === 'robot_when_collision') key = 'collision';
    else if (hat.type === 'robot_when_gap_passed') key = 'gap_passed';
    else if (hat.type === 'robot_when_game_over') key = 'game_over';
    if (!key) continue;

    const stmts = compileStatements(hat.getNextBlock());
    const runStmts = [];
    for (const stmt of stmts) {
      if (stmt.op === 'forever') {
        tickLoops.push(stmt);
      } else {
        runStmts.push(stmt);
      }
    }
    handlers[key] = runStmts;
    if (key === 'start') {
      stmts.filter((s) => s.op === 'forever').forEach((s) => {
        if (!tickLoops.includes(s)) tickLoops.push(s);
      });
    }
  }

  return { handlers, tickLoops };
}

const EVENT_BLOCK_IDS = new Set([
  'when_start', 'when_spacebar', 'when_collision', 'when_gap_passed', 'when_game_over',
]);

function compileScratchBlock(b) {
  if (!b?.id) return null;
  const id = b._uid || b.id;
  const pv = b.paramValues || {};
  switch (b.id) {
    case 'flap': return { op: 'flap', id };
    case 'set_flap_strength':
      return { op: 'set_flap_strength', strength: Number(pv.strength) || 5, id };
    case 'set_gravity_strength':
      return { op: 'set_gravity_strength', strength: Number(pv.strength) || 5, id };
    case 'set_scroll_speed':
      return { op: 'set_scroll_speed', speed: Number(pv.speed) || 5, id };
    case 'freeze_bird': return { op: 'freeze_bird', id };
    case 'move_up': return { op: 'move_up', units: Number(pv.units) || 3, id };
    case 'move_down': return { op: 'move_down', units: Number(pv.units) || 3, id };
    case 'set_bird_height':
      return { op: 'set_bird_height', height: { kind: 'num', value: Number(pv.height) || 10 }, id };
    case 'break_loop': return { op: 'break', id };
    case 'wait':
      return { op: 'wait', seconds: Number(pv.seconds) || 1, id };
    case 'show_score': return { op: 'show_score', id };
    case 'restart_game': return { op: 'restart_game', id };
    case 'pause':
      return { op: 'pause_game', seconds: Number(pv.seconds) || 1, id };
    case 'show_message':
      return { op: 'show_message', text: String(pv.text || 'Nice!').slice(0, 40), id };
    case 'play_sound':
      return { op: 'play_sound', sound: String(pv.sound || 'beep'), id };
    case 'create_var':
      return { op: 'var_create', name: String(pv.name || 'myVar'), id };
    case 'set_var':
      return {
        op: 'var_set', name: String(pv.name || 'myVar'),
        value: { kind: 'num', value: Number(pv.value) || 0 }, id,
      };
    case 'change_var':
      return { op: 'var_change', name: String(pv.name || 'myVar'), delta: Number(pv.value) || 1, id };
    default:
      return null;
  }
}

function compileScratchHandlerBlocks(blocks) {
  const runStmts = [];
  const tickLoops = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.id === 'forever') {
      const inner = [];
      i += 1;
      while (i < blocks.length
        && !['repeat', 'forever', 'repeat_until'].includes(blocks[i].id)
        && !EVENT_BLOCK_IDS.has(blocks[i].id)) {
        inner.push(blocks[i]);
        i += 1;
      }
      const body = compileScratchHandlerBlocks(inner).runStmts;
      if (body.length) tickLoops.push({ op: 'forever', body, id: b._uid || b.id });
      continue;
    }
    if (b.id === 'repeat') {
      const times = Math.max(1, Number(b.paramValues?.times) || 3);
      const inner = [];
      i += 1;
      while (i < blocks.length
        && !['repeat', 'forever', 'repeat_until'].includes(blocks[i].id)
        && !EVENT_BLOCK_IDS.has(blocks[i].id)) {
        inner.push(blocks[i]);
        i += 1;
      }
      const body = compileScratchHandlerBlocks(inner).runStmts;
      if (body.length) runStmts.push({ op: 'repeat', times, body, id: b._uid || b.id });
      continue;
    }
    if (b.id === 'repeat_until') {
      const inner = [];
      i += 1;
      while (i < blocks.length
        && !['repeat', 'forever', 'repeat_until'].includes(blocks[i].id)
        && !EVENT_BLOCK_IDS.has(blocks[i].id)) {
        inner.push(blocks[i]);
        i += 1;
      }
      const body = compileScratchHandlerBlocks(inner).runStmts;
      if (body.length) runStmts.push({ op: 'repeat_until_gameover', body, id: b._uid || b.id });
      continue;
    }
    const stmt = compileScratchBlock(b);
    if (stmt) runStmts.push(stmt);
    i += 1;
  }
  return { runStmts, tickLoops };
}

/** Compile scratch-style CustomCodePanel script into FlappyBlockRuntime program. */
export function compileFlappyScratchScript(script) {
  const raw = parseEventScript(script || []);
  const handlers = {
    start: [], spacebar: [], collision: [], gap_passed: [], game_over: [],
  };
  const tickLoops = [];
  for (const key of Object.keys(handlers)) {
    const { runStmts, tickLoops: loops } = compileScratchHandlerBlocks(raw[key] || []);
    handlers[key] = runStmts;
    loops.forEach((loop) => tickLoops.push(loop));
  }
  return { handlers, tickLoops };
}

export class FlappyBlockRuntime {
  constructor(program, scene, onBlockActive) {
    this.handlers = program.handlers;
    this.tickLoops = program.tickLoops;
    this.scene = scene;
    this.onBlockActive = onBlockActive;
    this.vars = {};
    this.breakFlag = false;
    this.waitTimers = new Map();
    this.startFired = false;
    this._idx = 0;
  }

  reset() {
    this.vars = {};
    this.breakFlag = false;
    this.waitTimers.clear();
    this.startFired = false;
  }

  sensors() {
    return this.scene?.userData?.getFlappySensors?.() || {};
  }

  isDead() {
    const st = this.scene?.userData?.getFlappyState?.();
    return !!(st?.crashed || st?.awaitingRestart);
  }

  evaluate(expr) {
    if (!expr) return 0;
    switch (expr.kind) {
      case 'num': return expr.value;
      case 'sensor': {
        const s = this.sensors();
        const v = s[expr.key];
        if (expr.key === 'isFalling') return !!v;
        return typeof v === 'number' ? v : Number(v) || 0;
      }
      case 'var':
        return Number(this.vars[expr.name]) || 0;
      case 'compare': {
        const a = this.evaluate(expr.a);
        const b = this.evaluate(expr.b);
        if (expr.op === 'gt') return a > b;
        if (expr.op === 'lt') return a < b;
        return a === b;
      }
      case 'and':
        return !!this.evaluate(expr.a) && !!this.evaluate(expr.b);
      case 'or':
        return !!this.evaluate(expr.a) || !!this.evaluate(expr.b);
      case 'math': {
        const a = this.evaluate(expr.a);
        const b = this.evaluate(expr.b);
        if (expr.op === 'add') return a + b;
        if (expr.op === 'sub') return a - b;
        if (expr.op === 'mul') return a * b;
        if (expr.op === 'div') return b === 0 ? 0 : a / b;
        return 0;
      }
      default: return 0;
    }
  }

  evaluateBool(expr) {
    if (!expr) return false;
    if (expr.kind === 'sensor' && expr.key === 'isFalling') return !!this.sensors().isFalling;
    if (expr.kind === 'and' || expr.kind === 'or' || expr.kind === 'compare') return !!this.evaluate(expr);
    return !!this.evaluate(expr);
  }

  highlight(id, label) {
    if (id) this.onBlockActive?.(this._idx++, label || '', id);
  }

  execOne(stmt) {
    if (!stmt || !this.scene?.userData?.flappyMode) return;
    const ud = this.scene.userData;
    this.highlight(stmt.id, stmt.op);

    switch (stmt.op) {
      case 'flap':
        ud.flap?.(1.0);
        break;
      case 'set_flap_strength':
        ud.setFlapStrength?.(stmt.strength);
        break;
      case 'set_gravity_strength':
        ud.setGravityStrength?.(stmt.strength);
        break;
      case 'set_scroll_speed':
        ud.setScrollSpeed?.(stmt.speed);
        break;
      case 'freeze_bird':
        ud.freezeBird?.();
        break;
      case 'move_up':
        ud.moveBirdBy?.(stmt.units);
        break;
      case 'move_down':
        ud.moveBirdBy?.(-stmt.units);
        break;
      case 'set_bird_height':
        ud.setBirdHeight?.(this.evaluate(stmt.height));
        break;
      case 'show_score':
        ud.setShowScoreHud?.(true);
        break;
      case 'show_message':
        ud.showFlappyMessage?.(stmt.text, 2);
        break;
      case 'play_sound':
        ud.playFlappySound?.(stmt.sound);
        break;
      case 'pause_game':
        ud.pauseFlappyGame?.(stmt.seconds);
        break;
      case 'restart_game':
        ud.restartFlappyGame?.();
        this.startFired = false;
        break;
      case 'var_create':
        if (!(stmt.name in this.vars)) this.vars[stmt.name] = 0;
        break;
      case 'var_set':
        this.vars[stmt.name] = this.evaluate(stmt.value);
        break;
      case 'var_change':
        this.vars[stmt.name] = (Number(this.vars[stmt.name]) || 0) + stmt.delta;
        break;
      case 'show_variable':
        ud.showFlappyVariable?.(stmt.name, Number(this.vars[stmt.name]) || 0);
        break;
      case 'hide_variable':
        ud.hideFlappyVariable?.(stmt.name);
        break;
      default:
        break;
    }
  }

  execStatements(stmts, depth = 0) {
    if (depth > 64) return;
    for (const stmt of stmts) {
      if (this.breakFlag) { this.breakFlag = false; break; }
      if (this.isDead() && stmt.op !== 'restart_game') break;

      if (stmt.op === 'break') {
        this.breakFlag = true;
        break;
      }
      if (stmt.op === 'if') {
        if (this.evaluateBool(stmt.cond)) this.execStatements(stmt.body, depth + 1);
        continue;
      }
      if (stmt.op === 'if_else') {
        if (this.evaluateBool(stmt.cond)) this.execStatements(stmt.body, depth + 1);
        else this.execStatements(stmt.elseBody, depth + 1);
        continue;
      }
      if (stmt.op === 'repeat') {
        for (let i = 0; i < stmt.times; i++) {
          if (this.breakFlag) { this.breakFlag = false; break; }
          this.execStatements(stmt.body, depth + 1);
        }
        continue;
      }
      if (stmt.op === 'repeat_with') {
        for (let i = 1; i <= stmt.times; i++) {
          if (this.breakFlag) { this.breakFlag = false; break; }
          this.vars[stmt.varName] = i;
          this.execStatements(stmt.body, depth + 1);
        }
        continue;
      }
      if (stmt.op === 'repeat_until_gameover') {
        let guard = 0;
        while (!this.isDead() && guard < 500) {
          if (this.breakFlag) { this.breakFlag = false; break; }
          this.execStatements(stmt.body, depth + 1);
          guard += 1;
        }
        continue;
      }
      if (stmt.op === 'forever') {
        continue;
      }
      if (stmt.op === 'wait') {
        this.execOne(stmt);
        continue;
      }
      this.execOne(stmt);
    }
  }

  runEvent(key) {
    const stmts = this.handlers[key] || [];
    if (key === 'start') {
      if (this.startFired) return;
      this.startFired = true;
      console.log('[Flappy] START event fired');
    }
    this.execStatements(stmts);
  }

  /** Called once per simulation frame — runs forever loops from start handler. */
  tick() {
    if (this.isDead()) return;
    for (const loop of this.tickLoops) {
      if (this.breakFlag) { this.breakFlag = false; break; }
      this.execStatements(loop.body);
    }
    const ud = this.scene?.userData;
    if (ud?.updateFlappyVariableOverlays) {
      ud.updateFlappyVariableOverlays(this.vars);
    }
  }
}

/** Legacy adapter — flat action list for start handler only (non-forever). */
export function compileFlappyHandlersLegacy(ws) {
  const { handlers, tickLoops } = compileFlappyWorkspace(ws);
  return { handlers, tickLoops, runtimeFactory: (scene, cb) => new FlappyBlockRuntime({ handlers, tickLoops }, scene, cb) };
}
