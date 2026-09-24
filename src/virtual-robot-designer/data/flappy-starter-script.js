/**
 * Scratch-style script flattening + event handler parsing for Flappy BirdBot Live Lab.
 */
import { FLAPPY_STARTER_SCRIPT } from './flappy-bird-blocks.js';

export { FLAPPY_STARTER_SCRIPT };

export const EVENT_HATS = new Set([
  'when_start', 'when_spacebar', 'when_key', 'when_zone', 'when_collect', 'when_collision',
  'when_sensor', 'when_timer', 'when_battery', 'when_gap_passed', 'when_game_over',
  'when_checkpoint', 'when_lap', 'when_race_won', 'when_goal',
  'when_get_ball', 'when_goal_scored', 'when_concede', 'when_match_start',
  'when_match_end', 'when_out_bounds',
]);

/** Blocks that are structural / events — not sent to the sim executor directly */
const NON_EXECUTABLE = new Set([
  ...EVENT_HATS,
  'if_then', 'if_else', 'wait_until', 'define_func', 'call_func',
  'if_gt', 'if_lt', 'if_eq',
  'repeat_until',
]);

/** Split a flat scratch script into event handlers */
export function parseEventScript(script) {
  const handlers = {
    start: [], spacebar: [], key: [], zone: [], collect: [], collision: [],
    sensor: [], gap_passed: [], game_over: [], checkpoint: [], lap: [],
    race_won: [], goal: [],
    timers: [], batteries: [], laps: [], keys: [],
  };
  if (!script?.length) return handlers;
  let current = 'start';
  let currentTrigger = null;
  const pushBlock = (blk) => {
    if (NON_EXECUTABLE.has(blk.id)) return;
    if (currentTrigger) currentTrigger.blocks.push(blk);
    else {
      if (!handlers[current]) handlers[current] = [];
      handlers[current].push(blk);
    }
  };
  for (const b of script) {
    if (b.id === 'when_start') { current = 'start'; currentTrigger = null; continue; }
    if (b.id === 'when_spacebar') { current = 'spacebar'; currentTrigger = null; continue; }
    if (b.id === 'when_key') {
      current = 'key';
      currentTrigger = { key: b.paramValues?.key ?? 'space', blocks: [] };
      handlers.keys.push(currentTrigger);
      continue;
    }
    if (b.id === 'when_timer') {
      current = 'timer';
      currentTrigger = { seconds: +(b.paramValues?.seconds ?? 5), blocks: [] };
      handlers.timers.push(currentTrigger);
      continue;
    }
    if (b.id === 'when_battery') {
      current = 'battery';
      currentTrigger = { percent: +(b.paramValues?.percent ?? 20), blocks: [] };
      handlers.batteries.push(currentTrigger);
      continue;
    }
    if (b.id === 'when_lap') {
      current = 'lap';
      currentTrigger = { lap: +(b.paramValues?.lap ?? 1), blocks: [] };
      handlers.laps.push(currentTrigger);
      continue;
    }
    if (EVENT_HATS.has(b.id)) {
      current = b.id.replace(/^when_/, '');
      currentTrigger = null;
      if (!handlers[current]) handlers[current] = [];
      continue;
    }
    pushBlock(b);
  }
  return handlers;
}

/** Flatten parsed handler tree into sim-ready action lists */
export function compileHandlerTree(parsed, opts = { foreverReps: 6 }) {
  const out = {};
  for (const key of ['start', 'spacebar', 'key', 'zone', 'collect', 'collision', 'sensor',
    'gap_passed', 'game_over', 'checkpoint', 'lap', 'race_won', 'goal']) {
    out[key] = flattenHandlerActions(parsed[key] || [], opts);
  }
  out.timers = (parsed.timers || []).map((t) => ({
    seconds: t.seconds,
    actions: flattenHandlerActions(t.blocks || [], opts),
  }));
  out.batteries = (parsed.batteries || []).map((t) => ({
    percent: t.percent,
    actions: flattenHandlerActions(t.blocks || [], opts),
  }));
  out.laps = (parsed.laps || []).map((t) => ({
    lap: t.lap,
    actions: flattenHandlerActions(t.blocks || [], opts),
  }));
  out.keys = (parsed.keys || []).map((t) => ({
    key: t.key,
    actions: flattenHandlerActions(t.blocks || [], opts),
  }));
  return out;
}

/** Flatten scratch script handlers into sim-ready action lists */
export function compileEventHandlers(script, opts = { foreverReps: 6 }) {
  return compileHandlerTree(parseEventScript(script || []), opts);
}

/** Expand repeat / forever blocks in a flat scratch script */
export function flattenScratchScript(script, { foreverReps = 1 } = {}) {
  if (!script?.length) return [];
  const out = [];
  let i = 0;
  while (i < script.length) {
    const b = script[i];
    if (NON_EXECUTABLE.has(b.id)) {
      i += 1;
      continue;
    }
    if (b.id === 'forever') {
      const inner = [];
      i += 1;
      while (i < script.length && !['repeat', 'forever', 'repeat_until'].includes(script[i].id) && !EVENT_HATS.has(script[i].id)) {
        inner.push(script[i]);
        i += 1;
      }
      if (inner.length === 0) continue;
      for (let r = 0; r < foreverReps; r += 1) {
        inner.forEach((blk) => out.push({ ...blk, _uid: `${blk._uid}_r${r}` }));
      }
      continue;
    }
    if (b.id === 'repeat') {
      const times = Math.max(1, b.paramValues?.times ?? 3);
      const inner = [];
      i += 1;
      while (i < script.length && !['repeat', 'forever', 'repeat_until'].includes(script[i].id) && !EVENT_HATS.has(script[i].id)) {
        inner.push(script[i]);
        i += 1;
      }
      for (let r = 0; r < times; r += 1) {
        inner.forEach((blk) => out.push({ ...blk, _uid: `${blk._uid}_r${r}` }));
      }
      continue;
    }
    out.push(b);
    i += 1;
  }
  return out;
}

export function flattenHandlerBlocks(blocks, opts = {}) {
  return flattenScratchScript(blocks, opts).filter((b) => b?.id && !['forever', 'repeat', 'repeat_until'].includes(b.id));
}

export function isEventHatBlock(id) {
  return EVENT_HATS.has(id);
}

/** Convert scratch block to sim action object */
export function scratchBlockToAction(b) {
  if (!b?.id) return null;
  const paramValues = { ...(b.paramValues || {}) };
  const labels = {
    flap: 'Flap!', set_flap_strength: 'Set Flap Strength', set_gravity_strength: 'Set Gravity Strength', wait: 'Wait',
    show_score: 'Show Score', restart_game: 'Restart Game', pause: 'Pause',
    distance_to_pipe: 'Distance to Pipe', bird_height: 'Bird Height',
    gap_center_height: 'Gap Center', is_falling: 'Is Falling?',
    read_score: 'Score', read_high_score: 'High Score',
    set_var: 'Set Variable', change_var: 'Change Variable',
  };
  const cats = {
    flap: 'move', set_flap_strength: 'move', set_gravity_strength: 'move', wait: 'control',
    show_score: 'game', restart_game: 'game', pause: 'control',
    distance_to_pipe: 'sense', bird_height: 'sense', gap_center_height: 'sense', is_falling: 'sense',
    read_score: 'var', read_high_score: 'var', set_var: 'var', change_var: 'var',
  };
  return {
    id: b.id,
    cat: cats[b.id] || 'move',
    icon: b.icon || '▶',
    label: b.label || labels[b.id] || b.id,
    blockUid: b._uid,
    paramValues,
  };
}

export function flattenHandlerActions(blocks, opts = {}) {
  return flattenHandlerBlocks(blocks, opts).map(scratchBlockToAction).filter(Boolean);
}
