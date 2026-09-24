/**
 * Fighting game — scratch script compiler + per-tick combat executor.
 */
import { parseEventScript } from './flappy-starter-script.js';

const EVENT_IDS = new Set([
  'when_start', 'when_key', 'when_spacebar', 'when_zone', 'when_collect',
  'when_collision', 'when_sensor', 'when_timer', 'when_battery',
  'when_checkpoint', 'when_lap', 'when_race_won', 'when_goal',
  'when_gap_passed', 'when_game_over',
]);

function compileScratchBlock(b) {
  if (!b?.id) return null;
  return {
    op: b.id,
    id: b._uid || b.id,
    params: b.paramValues || {},
  };
}

// Ops that consume following sibling blocks as their body
const COND_OPS = new Set([
  'if_enemy_close', 'if_under_attack', 'if_health_low',
  'if_then', 'if_else', 'if_enemy_far',
]);
// Any of these ops terminates a conditional or loop body
const BODY_TERMINATORS = new Set(['repeat', 'forever', ...COND_OPS, ...EVENT_IDS]);

// Real-seconds pause after each action so fights play at a watchable boxing pace
const ACTION_PACE = {
  jab: 1.0, cross: 1.3, hook: 1.35, uppercut: 1.45, combo_3hit: 1.8,
  light_kick: 0.85, low_kick: 0.85, kick: 0.85, roundhouse: 1.15, heavy_kick: 1.35, sweep: 0.9,
  attack: 0.85, attack_light: 0.8, attack_heavy: 1.1, light_punch: 0.8, heavy_punch: 1.1,
  slam: 0.9, shield_bash: 0.6, grab_throw: 1.0, stomp: 0.9, charge: 0.8,
  fire_blast: 0.8, ice_beam: 0.7, lightning_strike: 0.8, explosion: 1.0,
  swift_strike: 0.45, shuriken_throw: 0.6, backstab: 0.7, blade_flurry: 1.0,
  furious_blow: 0.8, earthquake_smash: 1.0, whirlwind: 0.9,
  block: 0.5, dodge: 0.45, parry: 0.5,
  move_toward_enemy: 0.4, move_away_enemy: 0.4, advance_step: 0.4, retreat_step: 0.4,
  strafe_left: 0.35, strafe_right: 0.35,
};

function compileScratchHandlerBlocks(blocks) {
  const runStmts = [];
  const tickLoops = [];
  let i = 0;
  while (i < (blocks || []).length) {
    const b = blocks[i];
    if (b.id === 'forever') {
      const inner = [];
      i += 1;
      while (i < blocks.length && !['repeat', 'forever'].includes(blocks[i].id) && !EVENT_IDS.has(blocks[i].id)) {
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
      while (i < blocks.length && !['repeat', 'forever'].includes(blocks[i].id) && !EVENT_IDS.has(blocks[i].id)) {
        inner.push(blocks[i]);
        i += 1;
      }
      const body = compileScratchHandlerBlocks(inner).runStmts;
      if (body.length) runStmts.push({ op: 'repeat', times, body, id: b._uid || b.id });
      continue;
    }
    // Conditional blocks — consume following siblings as body until next terminator
    if (COND_OPS.has(b.id)) {
      const inner = [];
      i += 1;
      while (i < blocks.length && !BODY_TERMINATORS.has(blocks[i].id)) {
        inner.push(blocks[i]);
        i += 1;
      }
      const body = compileScratchHandlerBlocks(inner).runStmts;
      const stmt = compileScratchBlock(b);
      if (stmt) runStmts.push({ ...stmt, body });
      continue;
    }
    const stmt = compileScratchBlock(b);
    if (stmt) runStmts.push(stmt);
    i += 1;
  }
  return { runStmts, tickLoops };
}

export function compileFightingScratchScript(script) {
  const raw = parseEventScript(script || []);
  const handlers = { start: [], under_attack: [], collision: [] };
  const tickLoops = [];
  for (const key of Object.keys(handlers)) {
    const { runStmts, tickLoops: loops } = compileScratchHandlerBlocks(raw[key] || []);
    handlers[key] = runStmts;
    loops.forEach((l) => tickLoops.push(l));
  }
  return { handlers, tickLoops };
}

export class FightingBlockRuntime {
  constructor(program, scene, onBlockActive) {
    this.handlers = program.handlers;
    this.tickLoops = program.tickLoops;
    this.scene = scene;
    this.onBlockActive = onBlockActive;
    this.loopIdx = 0;
    this.repeatCounts = new Map();
    this.startFired = false;
    this.cooldown = 0;
    // Pending statements — one is processed per pacing window, so every
    // punch/step is a distinct, visible event instead of a same-frame burst.
    this.queue = [];
  }

  reset() {
    this.loopIdx = 0;
    this.repeatCounts.clear();
    this.startFired = false;
    this.cooldown = 0;
    this.queue = [];
  }

  sensors() {
    return this.scene?.userData?.combat?.getSensors?.() || {};
  }

  isFightOver() {
    return !!this.scene?.userData?.combat?.isOver?.();
  }

  /** Process one statement. Conditionals evaluate NOW (fresh sensors) and
   *  push their body to the FRONT of the queue to run over following ticks. */
  processStmt(stmt) {
    if (!stmt || this.isFightOver()) return;
    const combat = this.scene?.userData?.combat;
    if (!combat) return;
    this.onBlockActive?.(stmt.id, stmt.op);
    if (stmt.op === 'repeat') {
      const key = stmt.id;
      const count = this.repeatCounts.get(key) || 0;
      if (count < stmt.times) {
        this.repeatCounts.set(key, count + 1);
        if (stmt.body?.length) this.queue.unshift(...stmt.body, stmt); // body, then loop again
      } else {
        this.repeatCounts.set(key, 0);
      }
      return;
    }
    if (COND_OPS.has(stmt.op)) {
      const s = this.sensors();
      let ok = false;
      if (stmt.op === 'if_enemy_close') ok = s.enemyClose;
      else if (stmt.op === 'if_enemy_far') ok = s.enemyFar;
      else if (stmt.op === 'if_under_attack') ok = s.underAttack;
      else if (stmt.op === 'if_health_low') ok = s.healthLow || s.staminaLow;
      else if (stmt.op === 'if_then' || stmt.op === 'if_else') ok = true;
      if (ok && stmt.body?.length) this.queue.unshift(...stmt.body);
      this.cooldown = 0.12;
      return;
    }
    combat.doAction(stmt.op, stmt.params || {});
    const mode = this.scene?.userData?.combat?.getState?.()?.mode;
    let pace = ACTION_PACE[stmt.op] ?? 0.15;
    if (mode === 'training' && ['jab', 'cross', 'hook', 'uppercut', 'attack', 'attack_light'].includes(stmt.op)) {
      pace = Math.max(pace, 1.1);
    }
    this.cooldown = pace;
  }

  tick(dt = 1 / 60) {
    if (this.isFightOver() || this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - dt);
      return;
    }
    const combat = this.scene?.userData?.combat;
    if (!combat) return;

    if (!this.startFired) {
      this.startFired = true;
      (this.handlers.start || []).forEach((s) => this.queue.push(s));
    }

    // Process pending statements one per pacing window
    while (this.queue.length) {
      const stmt = this.queue.shift();
      this.processStmt(stmt);
      if (this.cooldown > 0) return;
    }

    // Queue drained — refill from the forever loop (or restart the start script)
    if (this.tickLoops.length) {
      const loop = this.tickLoops[this.loopIdx % this.tickLoops.length];
      this.loopIdx += 1;
      (loop.body || []).forEach((s) => this.queue.push(s));
      const mode = this.scene?.userData?.combat?.getState?.()?.fightMode
        || this.scene?.userData?.combat?.getState?.()?.mode;
      this.cooldown = mode === 'training' ? 0.35 : 0.15;
    } else if (this.handlers.start?.length) {
      (this.handlers.start || []).forEach((s) => this.queue.push(s));
      this.cooldown = 0.4;
    }
  }
}
