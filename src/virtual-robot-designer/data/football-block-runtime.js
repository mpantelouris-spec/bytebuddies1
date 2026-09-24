/**
 * Football match — scratch script compiler + per-tick executor.
 */
import { parseEventScript } from './flappy-starter-script.js';

const EVENT_IDS = new Set([
  'when_start', 'when_key', 'when_spacebar', 'when_zone', 'when_collect',
  'when_collision', 'when_sensor', 'when_timer', 'when_battery',
  'when_checkpoint', 'when_lap', 'when_race_won', 'when_goal',
  'when_get_ball', 'when_goal_scored', 'when_concede', 'when_match_start',
  'when_match_end', 'when_out_bounds',
]);

const COND_OPS = new Set([
  'if_ball_close', 'if_ball_far', 'if_have_ball', 'if_shooting_range',
  'if_then', 'if_else',
]);

const BODY_TERMINATORS = new Set(['repeat', 'forever', ...COND_OPS, ...EVENT_IDS]);

const KICK_OPS = new Set(['short_pass', 'long_pass', 'shoot', 'lob_pass', 'clear_ball']);
const ACTION_PACE = {
  short_pass: 0.22,
  long_pass: 0.18,
  shoot: 0.28,
  lob_pass: 0.2,
  celebrate: 0.65,
  clear_ball: 0.22,
};

function compileScratchBlock(b) {
  if (!b?.id) return null;
  return {
    op: b.id,
    id: b._uid || b.id,
    params: b.paramValues || {},
  };
}

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
    if (COND_OPS.has(b.id)) {
      const inner = [];
      i += 1;
      // Flat scratch lists: one action per if-branch; sibling actions (e.g. chase_ball
      // after if_have_ball) must stay at the parent level, not inside the if body.
      if (i < blocks.length && !BODY_TERMINATORS.has(blocks[i].id)) {
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

export function compileFootballScratchScript(script) {
  const raw = parseEventScript(script || []);
  const handlers = { start: [], get_ball: [], goal_scored: [], concede: [], match_start: [], match_end: [], out_bounds: [] };
  const tickLoops = [];
  for (const key of Object.keys(handlers)) {
    const { runStmts, tickLoops: loops } = compileScratchHandlerBlocks(raw[key] || []);
    handlers[key] = runStmts;
    loops.forEach((l) => tickLoops.push(l));
  }
  if (!handlers.start?.length && raw.start?.length) {
    handlers.start = compileScratchHandlerBlocks(raw.start).runStmts;
  }
  return { handlers, tickLoops };
}

export class FootballBlockRuntime {
  constructor(program, scene, onBlockActive, botId = null) {
    this.handlers = program.handlers;
    this.tickLoops = program.tickLoops;
    this.scene = scene;
    this.onBlockActive = onBlockActive;
    this.botId = botId;
    this.loopIdx = 0;
    this.repeatCounts = new Map();
    this.startFired = false;
    this.cooldown = 0;
    this.queue = [];
    this._lastGoals = 0;
    this._hadBall = false;
    this._lastHighlight = '';
    this._lastEnemyGoals = 0;
    this._ballOut = false;
    this._endFired = false;
  }

  reset() {
    this.loopIdx = 0;
    this.repeatCounts.clear();
    this.startFired = false;
    this.cooldown = 0;
    this.queue = [];
    this._lastGoals = 0;
    this._hadBall = false;
    this._lastHighlight = '';
    this._lastEnemyGoals = 0;
    this._ballOut = false;
    this._endFired = false;
  }

  sensors() {
    return this.scene?.userData?.football?.getSensors?.(this.botId) || {};
  }

  isMatchOver() {
    return !!this.scene?.userData?.football?.isOver?.();
  }

  condTrue(stmt) {
    const s = this.sensors();
    if (stmt.op === 'if_ball_close') return !!s.ballClose;
    if (stmt.op === 'if_ball_far') return !!s.ballFar;
    if (stmt.op === 'if_have_ball') return !!s.haveBall;
    if (stmt.op === 'if_shooting_range') return !!s.shootingRange;
    if (stmt.op === 'if_then' || stmt.op === 'if_else') return true;
    return false;
  }

  highlight(stmt) {
    if (!stmt || stmt.id === this._lastHighlight) return;
    this._lastHighlight = stmt.id;
    this.onBlockActive?.(stmt.id, stmt.op, this.botId);
  }

  evalBody(stmts, { forever = false } = {}) {
    if (!stmts?.length || this.isMatchOver()) return;
    const football = this.scene?.userData?.football;
    if (!football) return;
    if (forever) {
      this.evalForever(stmts);
      return;
    }
    for (const stmt of stmts) this.runStmt(stmt, football);
  }

  runStmt(stmt, football) {
    if (!stmt || this.isMatchOver()) return 'stop';
    if (stmt.op === 'wait') {
      this.cooldown = Math.max(0.05, Number(stmt.params?.seconds) || 0.5);
      this.highlight(stmt);
      return 'stop';
    }
    if (stmt.op === 'repeat') {
      const times = Math.max(1, stmt.times || 3);
      for (let n = 0; n < times; n += 1) this.evalBody(stmt.body);
      return 'ok';
    }
    if (COND_OPS.has(stmt.op)) {
      if (this.condTrue(stmt) && stmt.body?.length) this.evalBody(stmt.body);
      return 'ok';
    }
    this.highlight(stmt);
    if ((KICK_OPS.has(stmt.op) || stmt.op === 'celebrate') && this.cooldown > 0) return 'ok';
    football.doAction(stmt.op, stmt.params || {}, this.botId, true);
    if (KICK_OPS.has(stmt.op) || stmt.op === 'celebrate') {
      this.cooldown = ACTION_PACE[stmt.op] ?? 0.25;
      return 'stop';
    }
    return 'ok';
  }

  /** First true if-branch wins; otherwise the trailing fallback (chase / guard). */
  evalForever(stmts) {
    const football = this.scene?.userData?.football;
    if (!football) return;
    const ifs = [];
    const fallback = [];
    for (const stmt of stmts) {
      if (COND_OPS.has(stmt.op) && stmt.op !== 'if_then' && stmt.op !== 'if_else') ifs.push(stmt);
      else if (!COND_OPS.has(stmt.op)) fallback.push(stmt);
    }
    for (const clause of ifs) {
      if (this.condTrue(clause) && clause.body?.length) {
        for (const s of clause.body) {
          if (this.runStmt(s, football) === 'stop') return;
        }
        return;
      }
    }
    for (const s of fallback) {
      if (this.runStmt(s, football) === 'stop') return;
    }
  }

  tick(dt = 1 / 60) {
    const football = this.scene?.userData?.football;
    if (!football) return;
    const s = this.sensors();
    if (s.userDriving && (this.botId === 'p1' || s.role === 'striker')) return;
    this.cooldown = Math.max(0, this.cooldown - dt);
    if ((s.playerGoals || 0) > (this._lastGoals || 0)) {
      this._lastGoals = s.playerGoals || 0;
      this.evalBody(this.handlers.goal_scored);
    }
    if ((s.enemyGoals || 0) > (this._lastEnemyGoals || 0)) {
      this._lastEnemyGoals = s.enemyGoals || 0;
      this.evalBody(this.handlers.concede);
    }
    if (s.haveBall && !this._hadBall) this.evalBody(this.handlers.get_ball);
    this._hadBall = !!s.haveBall;
    if (s.ballOut && !this._ballOut) this.evalBody(this.handlers.out_bounds);
    this._ballOut = !!s.ballOut;
    if (this.isMatchOver()) {
      if (!this._endFired) {
        this._endFired = true;
        this.evalBody(this.handlers.match_end);
      }
      return;
    }

    if (!this.startFired) {
      this.startFired = true;
      this.evalBody(this.handlers.start);
      this.evalBody(this.handlers.match_start);
    }

    if (this.tickLoops.length) {
      for (const loop of this.tickLoops) this.evalForever(loop.body || []);
    } else if (this.handlers.start?.length) {
      this.evalBody(this.handlers.start);
    }
  }
}

export function createFootballRuntimes(programs, scene, onBlockActive) {
  const runtimes = {};
  for (const [botId, program] of Object.entries(programs || {})) {
    if (program) {
      runtimes[botId] = new FootballBlockRuntime(program, scene, onBlockActive, botId);
    }
  }
  return runtimes;
}

export function tickFootballRuntimes(runtimes, dt) {
  Object.values(runtimes || {}).forEach((rt) => rt?.tick?.(dt));
}

export function resetFootballRuntimes(runtimes) {
  Object.values(runtimes || {}).forEach((rt) => rt?.reset?.());
}
