/**
 * Flappy BirdBot — block palette audit & course-scoped block library
 *
 * AUDIT (Zone 1 / flappy_bird course) — Part 2 + Part 10 findings:
 *
 * BUCKET A (keep): when_start, when_spacebar, when_collision, when_gap_passed,
 *   when_game_over, flap, set_flap_strength, set_gravity_strength, repeat,
 *   repeat_until, forever, wait, sensors, score/high_score, show_score,
 *   restart_game, pause, if_then, if_else, comparisons, var set/change/get
 *
 * BUCKET B (removed): move_forward/backward, turn, set_speed, boost, spin,
 *   orbit, ground sensors, AI patrol blocks — excluded from flappy Blockly toolbox
 *
 * BUCKET C (added in Blockly toolbox): all Part 3 blocks across 7 labelled
 *   categories: Events, Movement, Loops, Sensors, Logic, Variables, Game Control
 *
 * Part 12 UI resolution: Block Library grid is the ONLY palette UI for this
 * course. The Blockly category sidebar/flyout was removed — chips insert
 * real Blockly blocks into the workspace below (Part 9 styling preserved).
 *
 * Part 11 (Test 11): classic scrolling-world Flappy Bird — bird fixed on Z,
 *   pipes/ground/parallax scroll toward camera. scrollWorld must sync mesh
 *   positions (pipe.z → topGroup/botGroup.position.z) every frame.
 *
 * Design: Approach A (Zone 1 beginner) — primary program is
 *   "When spacebar clicked → Flap!" — mission text updated to match.
 * Loop blocks remain available for optional advanced play.
 */

import { UNIVERSAL_EVENTS_CATEGORY } from './universal-event-blocks.js';

export const FLAPPY_COURSE_IDS = new Set(['flappy_bird', 'robo_wrecker']);

export function isFlappyBirdCourse(courseKey, arenaType) {
  const baseId = typeof courseKey === 'string' ? courseKey.split(':')[0] : courseKey;
  return FLAPPY_COURSE_IDS.has(baseId) || arenaType === 'flappy_bird';
}

/** Starter script — spacebar flap (Approach A) */
export const FLAPPY_STARTER_SCRIPT = [
  { id: 'when_spacebar', label: 'When spacebar clicked', icon: '⌨️', catKey: 'Events', paramValues: {} },
  { id: 'flap', label: 'Flap!', icon: '🐦', catKey: 'Movement', paramValues: {} },
];

/**
 * Course-scoped scratch block library for Flappy BirdBot.
 * Only blocks listed here appear when flappy_bird is the active course.
 */
export const FLAPPY_BLOCK_LIBRARY = {
  Events: UNIVERSAL_EVENTS_CATEGORY,
  Movement: {
    label: 'Movement', color: '#3b82f6', icon: '🚀',
    blocks: [
      { id: 'flap', label: 'Flap!', icon: '🐦' },
      { id: 'set_flap_strength', label: 'Set flap strength', icon: '💪', params: [{ key: 'strength', label: '', def: 5 }] },
      { id: 'set_gravity_strength', label: 'Set gravity strength', icon: '⬇️', params: [{ key: 'strength', label: '', def: 5 }] },
      { id: 'set_scroll_speed', label: 'Set scroll speed', icon: '🚀', params: [{ key: 'speed', label: '', def: 5 }] },
      { id: 'freeze_bird', label: 'Freeze bird', icon: '⏸️' },
      { id: 'move_up', label: 'Move up', icon: '⬆️', params: [{ key: 'units', label: '', def: 3 }] },
      { id: 'move_down', label: 'Move down', icon: '⬇️', params: [{ key: 'units', label: '', def: 3 }] },
      { id: 'set_bird_height', label: 'Set bird height', icon: '🎮', params: [{ key: 'height', label: '', def: 10 }] },
    ],
  },
  Loops: {
    label: 'Loops', color: '#f59e0b', icon: '🔁',
    blocks: [
      { id: 'repeat', label: 'Repeat', icon: '🔁', params: [{ key: 'times', label: '×', def: 5 }] },
      { id: 'repeat_until', label: 'Repeat until game over', icon: '🔂' },
      { id: 'forever', label: 'Forever loop', icon: '∞' },
      { id: 'wait', label: 'Wait', icon: '⏸️', params: [{ key: 'seconds', label: 's', def: 1 }] },
      { id: 'break_loop', label: 'Break out of loop', icon: '↩️' },
    ],
  },
  Sensors: {
    label: 'Sensors', color: '#10b981', icon: '👁',
    blocks: [
      { id: 'distance_to_pipe', label: 'Distance to next pipe', icon: '📏' },
      { id: 'bird_height', label: 'Height of bird', icon: '📊' },
      { id: 'gap_center_height', label: 'Gap center height', icon: '🎯' },
      { id: 'is_falling', label: 'Is falling?', icon: '⬇️' },
      { id: 'num_pipe_dist', label: 'Pipe distance (value)', icon: '📏' },
      { id: 'num_bird_height', label: 'Bird height (value)', icon: '📊' },
      { id: 'num_gap_center', label: 'Gap center (value)', icon: '🎯' },
      { id: 'is_falling_bool', label: 'Is falling? (true/false)', icon: '⬇️' },
    ],
  },
  Logic: {
    label: 'Logic', color: '#8b5cf6', icon: '🧠',
    blocks: [
      { id: 'if_then', label: 'If condition then', icon: '❓' },
      { id: 'if_else', label: 'If / else', icon: '↔️' },
      { id: 'if_gt', label: 'If value > value', icon: '>' },
      { id: 'if_lt', label: 'If value < value', icon: '<' },
      { id: 'if_eq', label: 'If value = value', icon: '=' },
    ],
  },
  Variables: {
    label: 'Variables', color: '#06b6d4', icon: '📦',
    blocks: [
      { id: 'read_score', label: 'Score (read)', icon: '⭐' },
      { id: 'read_high_score', label: 'High Score (read)', icon: '🏆' },
      { id: 'num_score', label: 'Score (value)', icon: '⭐' },
      { id: 'num_high_score', label: 'High Score (value)', icon: '🏆' },
      { id: 'set_var', label: 'Set variable to', icon: '=', params: [{ key: 'name', label: '', def: 'myVar' }, { key: 'value', label: '', def: 0 }] },
      { id: 'change_var', label: 'Change variable by', icon: '+', params: [{ key: 'name', label: '', def: 'myVar' }, { key: 'value', label: '', def: 1 }] },
      { id: 'create_var', label: 'Create variable', icon: '📦', params: [{ key: 'name', label: '', def: 'myVar' }] },
      { id: 'get_var', label: 'Get variable', icon: '📦', params: [{ key: 'name', label: '', def: 'myVar' }] },
    ],
  },
  GameControl: {
    label: 'Game Control', color: '#ec4899', icon: '🎮',
    blocks: [
      { id: 'show_score', label: 'Show score', icon: '📺' },
      { id: 'restart_game', label: 'Restart game', icon: '🔄' },
      { id: 'pause', label: 'Pause', icon: '⏱️', params: [{ key: 'seconds', label: 's', def: 1 }] },
      { id: 'show_message', label: 'Show message', icon: '💬', params: [{ key: 'text', label: '', def: 'Nice!' }] },
      { id: 'play_sound', label: 'Play sound', icon: '🔊', params: [{ key: 'sound', label: '', def: 'beep' }] },
    ],
  },
};

/** Map scratch block id → sim action id */
export const FLAPPY_BLOCK_ACTION_MAP = {
  flap: 'flap',
  set_flap_strength: 'set_flap_strength',
  set_gravity_strength: 'set_gravity_strength',
  set_scroll_speed: 'set_scroll_speed',
  freeze_bird: 'freeze_bird',
  move_up: 'move_up',
  move_down: 'move_down',
  set_bird_height: 'set_bird_height',
  break_loop: 'break_loop',
  wait: 'wait',
  show_score: 'show_score',
  restart_game: 'restart_game',
  pause: 'pause',
  show_message: 'show_message',
  play_sound: 'play_sound',
  distance_to_pipe: 'distance_to_pipe',
  bird_height: 'bird_height',
  gap_center_height: 'gap_center_height',
  is_falling: 'is_falling',
  read_score: 'read_score',
  read_high_score: 'read_high_score',
  set_var: 'set_var',
  change_var: 'change_var',
  create_var: 'create_var',
  get_var: 'get_var',
};
