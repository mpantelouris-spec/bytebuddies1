/**
 * Flappy BirdBot — Blockly compile + per-frame runtime executor.
 * Evaluates conditions, runs forever loops once per tick, handles wait/break.
 */

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

// ─── Scratch-style panel scripts ───────────────────────────────────────────
// The panel is a flat list, so structure comes from the blocks themselves:
// a loop or "if" block owns the blocks below it until an "End" block (or the
// next event / sibling loop); "Else" switches an open "if" to its else-branch.

const HAT_TO_EVENT = {
  when_start: 'start',
  when_spacebar: 'spacebar',
  when_collision: 'collision',
  when_gap_passed: 'gap_passed',
  when_checkpoint: 'gap_passed', // each gap is the flappy checkpoint
  when_collect: 'gap_passed',
  when_game_over: 'game_over',
  when_sensor: 'pipe_close',
};
const HATS = new Set([...Object.keys(HAT_TO_EVENT), 'when_key', 'when_timer', 'when_zone', 'when_battery',
  'when_lap', 'when_race_won', 'when_goal', 'when_get_ball', 'when_goal_scored', 'when_concede',
  'when_match_start', 'when_match_end', 'when_out_bounds']);

/** Sensor readings a condition or "show" block can use. */
const SENSOR_KEYS = {
  bird_height: 'birdHeight',
  gap_center: 'gapCenterHeight',
  below_gap: 'belowGap',
  pipe_dist: 'distanceToPipe',
  gap_size: 'gapSize',
  score: 'score',
  high_score: 'highScore',
  time_alive: 'timeAlive',
  falling: 'isFalling',
};
const SHOW_BLOCKS = {
  distance_to_pipe: ['distanceToPipe', 'Pipe distance'],
  num_pipe_dist: ['distanceToPipe', 'Pipe distance'],
  bird_height: ['birdHeight', 'Bird height'],
  num_bird_height: ['birdHeight', 'Bird height'],
  gap_center_height: ['gapCenterHeight', 'Gap centre'],
  num_gap_center: ['gapCenterHeight', 'Gap centre'],
  gap_size: ['gapSize', 'Gap size'],
  below_gap: ['belowGap', 'Below gap by'],
  time_alive: ['timeAlive', 'Time alive'],
  is_falling: ['isFalling', 'Falling'],
  is_falling_bool: ['isFalling', 'Falling'],
  read_score: ['score', 'Score'],
  num_score: ['score', 'Score'],
  read_high_score: ['highScore', 'High score'],
  num_high_score: ['highScore', 'High score'],
};

function operand(key, pv) {
  if (key === 'num') return { kind: 'num', value: Number(pv.n ?? pv.value ?? 0) || 0 };
  if (key === 'var') return { kind: 'var', name: String(pv.name || 'myVar') };
  return { kind: 'sensor', key: SENSOR_KEYS[key] || 'birdHeight' };
}

/** Condition from an "if" / "wait until" block's dropdowns. */
function scratchCondition(b) {
  const pv = b.paramValues || {};
  if (b.id === 'if_falling') return { kind: 'sensor', key: 'isFalling' };
  const fixed = { if_gt: 'gt', if_lt: 'lt', if_eq: 'eq' }[b.id];
  const op = fixed || pv.op || 'lt';
  const a = pv.a || 'bird_height';
  if (a === 'falling') return { kind: 'sensor', key: 'isFalling' };
  return { kind: 'compare', op, a: operand(a, pv), b: operand(pv.b || 'gap_center', pv) };
}

function compileScratchBlock(b) {
  if (!b?.id) return null;
  const id = b._uid || b.id;
  const pv = b.paramValues || {};
  if (SHOW_BLOCKS[b.id]) {
    const [key, label] = SHOW_BLOCKS[b.id];
    return { op: 'show_value', key, label, id };
  }
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
      return { op: 'set_bird_height', height: { kind: 'num', value: Number(pv.height ?? 10) }, id };
    case 'break_loop': return { op: 'break', id };
    case 'wait':
      return { op: 'wait', seconds: Math.max(0, Number(pv.seconds ?? 1)), id };
    case 'wait_until':
      return { op: 'wait_until', cond: scratchCondition(b), id };
    case 'show_score': return { op: 'show_score', id };
    case 'hide_score': return { op: 'hide_score', id };
    case 'restart_game': return { op: 'restart_game', id };
    case 'pause':
      return { op: 'pause_game', seconds: Number(pv.seconds) || 1, id };
    case 'show_message':
      return { op: 'show_message', text: String(pv.text ?? 'Nice!').slice(0, 40), id };
    case 'play_sound':
      return { op: 'play_sound', sound: String(pv.sound || 'beep'), id };
    case 'create_var':
      return { op: 'var_create', name: String(pv.name || 'myVar'), id };
    case 'set_var':
      return { op: 'var_set', name: String(pv.name || 'myVar'), value: { kind: 'num', value: Number(pv.value) || 0 }, id };
    case 'change_var':
      return { op: 'var_change', name: String(pv.name || 'myVar'), delta: Number(pv.value ?? 1) || 0, id };
    case 'show_variable':
      return { op: 'show_variable', name: String(pv.name || 'myVar'), id };
    case 'hide_variable':
      return { op: 'hide_variable', name: String(pv.name || 'myVar'), id };
    case 'get_var':
      return { op: 'show_var_value', name: String(pv.name || 'myVar'), id };
    default:
      return null;
  }
}

const LOOP_IDS = new Set(['repeat', 'forever', 'repeat_until']);
const IF_IDS = new Set(['if_then', 'if_else', 'if_gt', 'if_lt', 'if_eq', 'if_falling']);

/** Build nested statements from one event's flat block list. */
function compileScratchSection(blocks) {
  const root = [];
  const stack = [{ list: root, kind: 'root' }];
  const top = () => stack[stack.length - 1];
  for (const b of blocks) {
    const id = b._uid || b.id;
    if (LOOP_IDS.has(b.id)) {
      // A loop placed after another open loop is its sibling, as before
      while (top().kind === 'loop') stack.pop();
      const node = b.id === 'repeat'
        ? { op: 'repeat', times: Math.min(100, Math.max(1, Number(b.paramValues?.times) || 3)), body: [], id }
        : { op: b.id === 'forever' ? 'forever' : 'repeat_until_gameover', body: [], id };
      top().list.push(node);
      stack.push({ list: node.body, kind: 'loop', node });
      continue;
    }
    if (IF_IDS.has(b.id)) {
      const node = { op: 'if_else', cond: scratchCondition(b), body: [], elseBody: [], id };
      top().list.push(node);
      stack.push({ list: node.body, kind: 'if', node });
      continue;
    }
    if (b.id === 'else') {
      const frame = [...stack].reverse().find((f) => f.kind === 'if');
      if (frame) {
        while (top() !== frame) stack.pop();
        frame.list = frame.node.elseBody;
      }
      continue;
    }
    if (b.id === 'end' || b.id === 'end_if' || b.id === 'end_loop') {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const stmt = compileScratchBlock(b);
    if (stmt) top().list.push(stmt);
  }
  return root;
}

/** Compile the scratch-style panel script into a FlappyBlockRuntime program. */
export function compileFlappyScratchScript(script) {
  const handlers = { start: [], spacebar: [], collision: [], gap_passed: [], game_over: [], pipe_close: [] };
  const timers = [];
  const keys = [];
  const sections = [];
  let cur = { event: 'start', blocks: [] };
  sections.push(cur);
  for (const b of script || []) {
    if (HATS.has(b.id)) {
      const pv = b.paramValues || {};
      let event = HAT_TO_EVENT[b.id] || null;
      if (b.id === 'when_key') event = (pv.key ?? 'space') === 'space' ? 'spacebar' : `key:${pv.key}`;
      if (b.id === 'when_timer') event = `timer:${Math.max(0, Number(pv.seconds ?? 5))}`;
      cur = { event, blocks: [] };
      sections.push(cur);
      continue;
    }
    cur.blocks.push(b);
  }
  for (const sec of sections) {
    if (!sec.event || !sec.blocks.length) continue;
    const stmts = compileScratchSection(sec.blocks);
    if (!stmts.length) continue;
    if (sec.event.startsWith('timer:')) timers.push({ seconds: Number(sec.event.slice(6)), stmts });
    else if (sec.event.startsWith('key:')) keys.push({ key: sec.event.slice(4), stmts });
    else handlers[sec.event].push(...stmts);
  }
  return { handlers, tickLoops: [], timers, keys };
}

const BREAK = Symbol('break');
const KEY_CODES = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const MAX_THREADS = 40;

/**
 * Runs a compiled program. Every event starts its own thread (a generator), so
 * "wait", "wait until", loops and nested ifs all behave like real code, several
 * scripts can run side by side, and "forever" runs one pass per frame.
 */
export class FlappyBlockRuntime {
  constructor(program, scene, onBlockActive) {
    this.scene = scene;
    this.onBlockActive = onBlockActive;
    this.load(program);
  }

  /** Swap in a freshly compiled program (e.g. after editing and pressing Simulate). */
  load(program) {
    const p = program || {};
    this.handlers = { start: [], spacebar: [], collision: [], gap_passed: [], game_over: [], pipe_close: [], ...(p.handlers || {}) };
    this.tickLoops = p.tickLoops || [];
    this.timers = p.timers || [];
    this.keys = p.keys || [];
    this.reset();
  }

  reset() {
    this.vars = {};
    this.threads = [];
    this.clock = 0;
    this.lastNow = null;
    this.startFired = false;
    this.timersFired = new Set();
    this.pipeArmed = true;
    this._idx = 0;
    this.detachKeys();
  }

  attachKeys() {
    if (this._onKey || typeof window === 'undefined' || !this.keys.length) return;
    this._onKey = (e) => {
      const hits = this.keys.filter((k) => KEY_CODES[k.key] === e.code);
      if (!hits.length || !this.scene?.userData?.flappyMode) return;
      e.preventDefault();
      hits.forEach((k) => this.spawn(k.stmts));
    };
    window.addEventListener('keydown', this._onKey);
  }

  detachKeys() {
    if (this._onKey) window.removeEventListener('keydown', this._onKey);
    this._onKey = null;
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
        const v = this.sensors()[expr.key];
        if (expr.key === 'isFalling') return !!v;
        return typeof v === 'number' ? v : Number(v) || 0;
      }
      case 'var':
        return Number(this.vars[expr.name]) || 0;
      case 'compare': {
        const a = Number(this.evaluate(expr.a));
        const b = Number(this.evaluate(expr.b));
        if (expr.op === 'gt') return a > b;
        if (expr.op === 'lt') return a < b;
        return Math.round(a) === Math.round(b); // heights are decimals; "=" means "about equal"
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
      case 'flap': ud.flap?.(1.0); break;
      case 'set_flap_strength': ud.setFlapStrength?.(stmt.strength); break;
      case 'set_gravity_strength': ud.setGravityStrength?.(stmt.strength); break;
      case 'set_scroll_speed': ud.setScrollSpeed?.(stmt.speed); break;
      case 'freeze_bird': ud.freezeBird?.(); break;
      case 'move_up': ud.moveBirdBy?.(stmt.units); break;
      case 'move_down': ud.moveBirdBy?.(-stmt.units); break;
      case 'set_bird_height': ud.setBirdHeight?.(this.evaluate(stmt.height)); break;
      case 'show_score': ud.setShowScoreHud?.(true); break;
      case 'hide_score': ud.setShowScoreHud?.(false); break;
      case 'show_message': ud.showFlappyMessage?.(stmt.text, 2); break;
      case 'show_value': {
        const v = this.sensors()[stmt.key];
        const text = typeof v === 'boolean' ? (v ? 'yes' : 'no') : (Math.round((Number(v) || 0) * 10) / 10);
        ud.showFlappyMessage?.(`${stmt.label}: ${text}`, 2);
        break;
      }
      case 'show_var_value':
        ud.showFlappyMessage?.(`${stmt.name} = ${Number(this.vars[stmt.name]) || 0}`, 2);
        break;
      case 'play_sound': ud.playFlappySound?.(stmt.sound); break;
      case 'pause_game': ud.pauseFlappyGame?.(stmt.seconds); break;
      case 'restart_game': ud.restartFlappyGame?.(); break;
      case 'var_create': if (!(stmt.name in this.vars)) this.vars[stmt.name] = 0; break;
      case 'var_set': this.vars[stmt.name] = this.evaluate(stmt.value); break;
      case 'var_change': this.vars[stmt.name] = (Number(this.vars[stmt.name]) || 0) + stmt.delta; break;
      case 'show_variable': ud.showFlappyVariable?.(stmt.name, Number(this.vars[stmt.name]) || 0); break;
      case 'hide_variable': ud.hideFlappyVariable?.(stmt.name); break;
      default: break;
    }
  }

  /** Generator: yields a number of seconds to sleep (0 = until next frame). Returns BREAK to leave a loop. */
  * run(stmts, depth = 0) {
    if (depth > 40 || !stmts) return undefined;
    for (const stmt of stmts) {
      switch (stmt.op) {
        case 'break':
          this.highlight(stmt.id, 'break');
          return BREAK;
        case 'wait':
          this.highlight(stmt.id, 'wait');
          yield stmt.seconds;
          break;
        case 'wait_until': {
          this.highlight(stmt.id, 'wait until');
          for (let guard = 0; !this.evaluateBool(stmt.cond) && guard < 36000; guard++) yield 0;
          break;
        }
        case 'if': case 'if_else': {
          this.highlight(stmt.id, 'if');
          const branch = this.evaluateBool(stmt.cond) ? stmt.body : (stmt.elseBody || []);
          if ((yield* this.run(branch, depth + 1)) === BREAK) return BREAK;
          break;
        }
        case 'repeat': case 'repeat_with':
          for (let i = 1; i <= stmt.times; i++) {
            if (stmt.varName) this.vars[stmt.varName] = i;
            if ((yield* this.run(stmt.body, depth + 1)) === BREAK) break;
          }
          break;
        case 'repeat_until_gameover':
          while (!this.isDead()) {
            if ((yield* this.run(stmt.body, depth + 1)) === BREAK) break;
            yield 0; // one pass per frame
          }
          break;
        case 'forever':
          for (;;) {
            if (this.isDead()) { yield 0; continue; } // paused while crashed, resumes after a restart
            if ((yield* this.run(stmt.body, depth + 1)) === BREAK) break;
            yield 0;
          }
          break;
        default:
          this.execOne(stmt);
      }
    }
    return undefined;
  }

  spawn(stmts) {
    if (!stmts?.length || this.threads.length >= MAX_THREADS) return;
    this.threads.push({ gen: this.run(stmts), wakeAt: -1 });
  }

  runEvent(key) {
    if (key === 'start') {
      if (this.startFired) return;
      this.startFired = true;
      this.attachKeys();
      this.tickLoops.forEach((loop) => this.spawn([loop]));
      console.log('[Flappy] START event fired');
    }
    this.spawn(this.handlers[key]);
  }

  /** Called once per simulation frame while running. */
  tick() {
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    const dt = this.lastNow == null ? 0 : Math.min(0.1, Math.max(0, now - this.lastNow));
    this.lastNow = now;
    this.clock += dt;

    this.timers.forEach((t, i) => {
      if (!this.timersFired.has(i) && this.clock >= t.seconds) {
        this.timersFired.add(i);
        this.spawn(t.stmts);
      }
    });
    if (this.handlers.pipe_close?.length && !this.isDead()) {
      const d = this.sensors().distanceToPipe ?? 99;
      if (this.pipeArmed && d < 4) { this.pipeArmed = false; this.spawn(this.handlers.pipe_close); }
      else if (d > 6) this.pipeArmed = true;
    }

    for (let i = 0; i < this.threads.length; i++) {
      const th = this.threads[i];
      if (th.wakeAt > this.clock) continue;
      const r = th.gen.next();
      if (r.done) { this.threads.splice(i, 1); i--; continue; }
      th.wakeAt = this.clock + Math.max(0, Number(r.value) || 0) + (r.value ? 0 : 1e-6);
    }
    this.scene?.userData?.updateFlappyVariableOverlays?.(this.vars);
  }
}

/** Legacy adapter — flat action list for start handler only (non-forever). */
export function compileFlappyHandlersLegacy(ws) {
  const { handlers, tickLoops } = compileFlappyWorkspace(ws);
  return { handlers, tickLoops, runtimeFactory: (scene, cb) => new FlappyBlockRuntime({ handlers, tickLoops }, scene, cb) };
}
