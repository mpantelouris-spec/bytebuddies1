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
 * Design: children code the bird to fly itself — a Forever loop that reads the
 *   bird's sensors (height, gap centre, how far below the gap, pipe distance)
 *   and decides when and how hard to flap. Key events remain for optional play.
 */

export const FLAPPY_COURSE_IDS = new Set(['flappy_bird', 'robo_wrecker']);

export function isFlappyBirdCourse(courseKey, arenaType) {
  const baseId = typeof courseKey === 'string' ? courseKey.split(':')[0] : courseKey;
  return FLAPPY_COURSE_IDS.has(baseId) || arenaType === 'flappy_bird';
}

/**
 * Starter script — the bird flies itself from code, not the spacebar: small
 * flaps whenever it is below the middle of the gap. Enough for the Easy levels;
 * harder levels need pupils to improve it (e.g. "how far below gap" → big flap).
 */
export const FLAPPY_STARTER_SCRIPT = [
  { id: 'when_start', label: 'When START clicked', icon: '▶️', catKey: 'Events', paramValues: {} },
  { id: 'set_flap_strength', label: 'Set flap strength', icon: '💪', catKey: 'Movement', paramValues: { strength: 3 } },
  { id: 'forever', label: 'Forever loop', icon: '∞', catKey: 'Loops', paramValues: {} },
  { id: 'if_then', label: 'If', icon: '❓', catKey: 'Logic', paramValues: { a: 'bird_height', op: 'lt', b: 'gap_center', n: 10 } },
  { id: 'flap', label: 'Flap!', icon: '🐦', catKey: 'Movement', paramValues: {} },
  { id: 'end', label: 'End if', icon: '⏹', catKey: 'Logic', paramValues: {} },
  { id: 'end', label: 'End loop', icon: '⏹', catKey: 'Loops', paramValues: {} },
];

/**
 * Course-scoped scratch block library for Flappy BirdBot.
 * Only blocks listed here appear when flappy_bird is the active course.
 */
// Condition dropdowns shared by the "if" and "wait until" blocks
const READINGS = [
  ['bird height', 'bird_height'], ['gap centre', 'gap_center'], ['how far below gap', 'below_gap'], ['distance to pipe', 'pipe_dist'],
  ['gap size', 'gap_size'], ['score', 'score'], ['high score', 'high_score'], ['time alive', 'time_alive'],
  ['myVar', 'var'],
];
const COMPARE_TO = [['number →', 'num'], ['gap centre', 'gap_center'], ['bird height', 'bird_height'], ['distance to pipe', 'pipe_dist'], ['score', 'score'], ['myVar', 'var']];
const conditionParams = (withOp = true, a = 'bird_height', b = 'gap_center', n = 10) => [
  { key: 'a', type: 'dropdown', label: '', def: a, options: READINGS },
  ...(withOp ? [{ key: 'op', type: 'dropdown', label: '', def: 'lt', options: [['<', 'lt'], ['>', 'gt'], ['=', 'eq']] }] : []),
  { key: 'b', type: 'dropdown', label: '', def: b, options: COMPARE_TO },
  { key: 'n', label: '', def: n },
];

export const FLAPPY_BLOCK_LIBRARY = {
  // Only the events that happen in Flappy Bird
  Events: {
    label: 'Events', color: '#ef4444', icon: '⚡',
    blocks: [
      { id: 'when_start', label: 'When START clicked', icon: '▶️' },
      { id: 'when_spacebar', label: 'When spacebar clicked', icon: '⌨️' },
      { id: 'when_key', label: 'When key pressed', icon: '⌨️', params: [{ key: 'key', type: 'dropdown', label: '', def: 'up', options: [['space', 'space'], ['up arrow', 'up'], ['down arrow', 'down'], ['left arrow', 'left'], ['right arrow', 'right']] }] },
      { id: 'when_timer', label: 'When timer reaches', icon: '⏱️', params: [{ key: 'seconds', label: 's', def: 5 }] },
      { id: 'when_sensor', label: 'When pipe is close', icon: '📡' },
      { id: 'when_gap_passed', label: 'When gap passed', icon: '🎯' },
      { id: 'when_collision', label: 'When bird crashes', icon: '💥' },
      { id: 'when_game_over', label: 'When game over', icon: '🛑' },
    ],
  },
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
      { id: 'end', label: 'End loop / if', icon: '⏹' },
      { id: 'wait', label: 'Wait', icon: '⏸️', params: [{ key: 'seconds', label: 's', def: 1 }] },
      { id: 'wait_until', label: 'Wait until', icon: '⏳', params: conditionParams(true, 'bird_height', 'gap_center') },
      { id: 'break_loop', label: 'Break out of loop', icon: '↩️' },
    ],
  },
  Sensors: {
    label: 'Sensors', color: '#10b981', icon: '👁',
    blocks: [
      { id: 'distance_to_pipe', label: 'Show distance to pipe', icon: '📏' },
      { id: 'bird_height', label: 'Show bird height', icon: '📊' },
      { id: 'gap_center_height', label: 'Show gap centre', icon: '🎯' },
      { id: 'gap_size', label: 'Show gap size', icon: '↕️' },
      { id: 'below_gap', label: 'Show how far below gap', icon: '📐' },
      { id: 'is_falling', label: 'Show if falling', icon: '⬇️' },
      { id: 'time_alive', label: 'Show time alive', icon: '⏱️' },
    ],
  },
  Logic: {
    label: 'Logic', color: '#8b5cf6', icon: '🧠',
    blocks: [
      { id: 'if_then', label: 'If', icon: '❓', params: conditionParams(true) },
      { id: 'if_falling', label: 'If bird is falling', icon: '⬇️' },
      { id: 'if_gt', label: 'If >', icon: '>', params: conditionParams(false, 'pipe_dist', 'num', 3) },
      { id: 'if_lt', label: 'If <', icon: '<', params: conditionParams(false, 'bird_height', 'gap_center') },
      { id: 'if_eq', label: 'If =', icon: '=', params: conditionParams(false, 'score', 'num', 10) },
      { id: 'else', label: 'Else', icon: '↔️' },
      { id: 'end', label: 'End if / loop', icon: '⏹' },
    ],
  },
  Variables: {
    label: 'Variables', color: '#06b6d4', icon: '📦',
    blocks: [
      { id: 'create_var', label: 'Create variable', icon: '📦', params: [{ key: 'name', label: '', def: 'myVar' }] },
      { id: 'set_var', label: 'Set variable to', icon: '=', params: [{ key: 'name', label: '', def: 'myVar' }, { key: 'value', label: '', def: 0 }] },
      { id: 'change_var', label: 'Change variable by', icon: '+', params: [{ key: 'name', label: '', def: 'myVar' }, { key: 'value', label: '', def: 1 }] },
      { id: 'show_variable', label: 'Show variable on screen', icon: '👀', params: [{ key: 'name', label: '', def: 'myVar' }] },
      { id: 'hide_variable', label: 'Hide variable', icon: '🙈', params: [{ key: 'name', label: '', def: 'myVar' }] },
      { id: 'get_var', label: 'Say variable value', icon: '💬', params: [{ key: 'name', label: '', def: 'myVar' }] },
      { id: 'read_score', label: 'Say score', icon: '⭐' },
      { id: 'read_high_score', label: 'Say high score', icon: '🏆' },
    ],
  },
  GameControl: {
    label: 'Game Control', color: '#ec4899', icon: '🎮',
    blocks: [
      { id: 'show_score', label: 'Show score', icon: '📺' },
      { id: 'hide_score', label: 'Hide score', icon: '🙈' },
      { id: 'restart_game', label: 'Restart game', icon: '🔄' },
      { id: 'pause', label: 'Pause game', icon: '⏱️', params: [{ key: 'seconds', label: 's', def: 1 }] },
      { id: 'show_message', label: 'Show message', icon: '💬', params: [{ key: 'text', label: '', def: 'Nice!' }] },
      { id: 'play_sound', label: 'Play sound', icon: '🔊', params: [{ key: 'sound', type: 'dropdown', label: '', def: 'beep', options: [['beep', 'beep'], ['flap', 'flap'], ['score', 'score'], ['crash', 'collision'], ['game over', 'game_over'], ['win', 'win']] }] },
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
