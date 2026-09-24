/**
 * Flappy BirdBot — all 49 Blockly block definitions (Section 1 spec).
 * Registered alongside ROBOT_BLOCK_DEFS when the workspace loads.
 */

export const FLAPPY_BLOCK_DEFS = [
  // ── MOVEMENT (8) ───────────────────────────────────────────────────────────
  { type: 'robot_set_scroll_speed', message0: '🚀  Set scroll speed  %1',
    args0: [{ type: 'field_number', name: 'SPEED', value: 5, min: 1, max: 10, precision: 1 }],
    previousStatement: null, nextStatement: null, style: 'move_blocks',
    tooltip: 'How fast pipes and world scroll toward the bird (1=slow, 10=fast)' },
  { type: 'robot_freeze_bird', message0: '⏸️  Freeze bird',
    previousStatement: null, nextStatement: null, style: 'move_blocks',
    tooltip: 'Hold vertical velocity at zero for one frame' },
  { type: 'robot_move_up_units', message0: '⬆️  Move up  %1  units',
    args0: [{ type: 'field_number', name: 'UNITS', value: 3, min: 1, max: 20, precision: 1 }],
    previousStatement: null, nextStatement: null, style: 'move_blocks',
    tooltip: 'Instantly move bird up (direct position change)' },
  { type: 'robot_move_down_units', message0: '⬇️  Move down  %1  units',
    args0: [{ type: 'field_number', name: 'UNITS', value: 3, min: 1, max: 20, precision: 1 }],
    previousStatement: null, nextStatement: null, style: 'move_blocks',
    tooltip: 'Instantly move bird down (direct position change)' },
  { type: 'robot_set_bird_height', message0: '🎮  Set bird height  %1',
    args0: [{ type: 'input_value', name: 'HEIGHT', check: 'Number' }],
    previousStatement: null, nextStatement: null, style: 'move_blocks',
    tooltip: 'Teleport bird to a specific height; velocity resets to 0' },

  // ── LOOPS (2 new) ──────────────────────────────────────────────────────────
  { type: 'robot_repeat_count_with', message0: '🔢  Repeat  %1  times with  %2',
    args0: [
      { type: 'field_number', name: 'TIMES', value: 5, min: 1, max: 100, precision: 1 },
      { type: 'field_input', name: 'VAR', text: 'i' },
    ],
    message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null, nextStatement: null, style: 'control_blocks',
    tooltip: 'Repeat and set counter variable to iteration number (1, 2, 3…)' },
  { type: 'robot_break_loop', message0: '↩️  Break out of loop',
    previousStatement: null, nextStatement: null, style: 'control_blocks',
    tooltip: 'Exit the innermost loop immediately' },

  // ── SENSORS (2 new reporters) ──────────────────────────────────────────────
  { type: 'robot_num_gap_size', message0: '📊  Pipe gap size',
    output: 'Number', style: 'sense_blocks',
    tooltip: 'Vertical height of the nearest pipe gap' },
  { type: 'robot_num_time_alive', message0: '⏱️  Time alive',
    output: 'Number', style: 'sense_blocks',
    tooltip: 'Seconds the bird has been alive this run' },

  // ── LOGIC (2 new) ────────────────────────────────────────────────────────
  { type: 'robot_flappy_and', message0: '%1  AND  %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Boolean' },
      { type: 'input_value', name: 'B', check: 'Boolean' },
    ],
    output: 'Boolean', style: 'control_blocks' },
  { type: 'robot_flappy_or', message0: '%1  OR  %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Boolean' },
      { type: 'input_value', name: 'B', check: 'Boolean' },
    ],
    output: 'Boolean', style: 'control_blocks' },

  // ── VARIABLES (2 new) ────────────────────────────────────────────────────
  { type: 'robot_show_variable', message0: '👁️  Show variable  %1',
    args0: [{ type: 'field_input', name: 'VAR', text: 'myVar' }],
    previousStatement: null, nextStatement: null, style: 'variable_blocks',
    tooltip: 'Display variable value on the game view' },
  { type: 'robot_hide_variable', message0: '🙈  Hide variable  %1',
    args0: [{ type: 'field_input', name: 'VAR', text: 'myVar' }],
    previousStatement: null, nextStatement: null, style: 'variable_blocks',
    tooltip: 'Remove variable overlay from game view' },

  // ── GAME CONTROL (2 new) ───────────────────────────────────────────────────
  { type: 'robot_show_message', message0: '💬  Show message  %1',
    args0: [{ type: 'field_input', name: 'TEXT', text: 'Hello!' }],
    previousStatement: null, nextStatement: null, style: 'game_blocks',
    tooltip: 'Show text on screen for ~2 seconds' },
  { type: 'robot_play_sound', message0: '🔊  Play sound  %1',
    args0: [{ type: 'field_dropdown', name: 'SOUND', options: [
      ['flap', 'flap'], ['score', 'score'], ['collision', 'collision'],
      ['game over', 'game_over'], ['win', 'win'], ['beep', 'beep'],
    ] }],
    previousStatement: null, nextStatement: null, style: 'game_blocks' },
  { type: 'robot_pause_game', message0: '⏸️  Pause game  %1  seconds',
    args0: [{ type: 'field_number', name: 'SECS', value: 1, min: 0.1, max: 10, precision: 1 }],
    previousStatement: null, nextStatement: null, style: 'game_blocks',
    tooltip: 'Freeze entire game (physics + pipes) for N seconds' },

  // ── MATH (4) ───────────────────────────────────────────────────────────────
  { type: 'robot_math_add', message0: '%1  +  %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      { type: 'input_value', name: 'B', check: 'Number' },
    ],
    output: 'Number', style: 'math_blocks' },
  { type: 'robot_math_sub', message0: '%1  −  %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      { type: 'input_value', name: 'B', check: 'Number' },
    ],
    output: 'Number', style: 'math_blocks' },
  { type: 'robot_math_mul', message0: '%1  ×  %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      { type: 'input_value', name: 'B', check: 'Number' },
    ],
    output: 'Number', style: 'math_blocks' },
  { type: 'robot_math_div', message0: '%1  ÷  %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      { type: 'input_value', name: 'B', check: 'Number' },
    ],
    output: 'Number', style: 'math_blocks' },
];

/** Flappy-only block types (49 total per spec inventory). */
export const FLAPPY_BLOCK_TYPES = [
  // Events (5)
  'robot_when_start', 'robot_when_key', 'robot_when_collision',
  'robot_when_gap_passed', 'robot_when_game_over',
  // Movement (8)
  'robot_flap', 'robot_set_flap_strength', 'robot_set_gravity_strength',
  'robot_set_scroll_speed', 'robot_freeze_bird', 'robot_move_up_units',
  'robot_move_down_units', 'robot_set_bird_height',
  // Loops (6)
  'robot_repeat', 'robot_repeat_until_gameover', 'robot_forever', 'robot_wait',
  'robot_repeat_count_with', 'robot_break_loop',
  // Sensors (8 reporters)
  'robot_num_pipe_dist', 'robot_num_bird_height', 'robot_num_gap_center',
  'robot_is_falling_bool', 'robot_num_gap_size', 'robot_num_time_alive',
  'robot_num_score', 'robot_num_high_score',
  // Logic (7)
  'robot_if_then', 'robot_if_else', 'robot_flappy_gt', 'robot_flappy_lt',
  'robot_flappy_eq', 'robot_flappy_and', 'robot_flappy_or',
  // Variables (6)
  'robot_var_create', 'robot_var_set', 'robot_var_change',
  'robot_show_variable', 'robot_hide_variable', 'robot_var_get',
  // Game Control (5)
  'robot_restart_game', 'robot_show_message', 'robot_show_score',
  'robot_play_sound', 'robot_pause_game',
  // Math (4) + builtin number used in shadows
  'robot_math_add', 'robot_math_sub', 'robot_math_mul', 'robot_math_div',
  'math_number',
];

export const FLAPPY_BLOCK_COUNT = 49;
