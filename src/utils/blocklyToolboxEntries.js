import { SIDEBAR_TO_TYPE, shortTypeToBlocklyType } from './blocks';

/** Blockly block types we define with full fields (use in flyout instead of stubs). */
export const BB_FULLY_IMPLEMENTED = new Set([
  'bb_event_start',
  'bb_event_keypress',
  'bb_sprite_move',
  'bb_sprite_turn',
  'bb_sprite_goto',
  'bb_sprite_changex',
  'bb_sprite_changey',
  'bb_motion_glide',
  'bb_control_wait',
  'bb_loop_repeat',
  'bb_loop_forever',
  'bb_action_print',
  'bb_sprite_say',
  'bb_var_create',
  'bb_var_change',
  'bb_logic_if',
  'bb_sound_play',
  'bb_sound_stop',
  'bb_math_add',
  'bb_math_mult',
  'bb_math_random',
  'bb_math_round',
]);

const C_SHORT = new Set(['loop-repeat', 'loop-forever', 'loop-while', 'loop-foreach', 'logic-if']);

const BOOLEAN_SHORT = new Set([
  'logic-bool',
  'logic-and',
  'logic-compare',
  'sense-touching',
  'sense-touching-sprite',
  'sense-key',
]);

const REPORTER_SHORT = new Set([
  'sense-mouse-x',
  'sense-mouse-y',
  'sense-distance',
  'sense-timer',
  'logic-compare',
  'math-add',
  'math-mult',
  'math-random',
  'math-round',
]);

export function inferLibShapeFromLabel(label) {
  const short = SIDEBAR_TO_TYPE[String(label || '').trim().toLowerCase()];
  if (!short) return 'stack';
  if (short.startsWith('event-')) return 'hat';
  if (C_SHORT.has(short)) return 'c';
  if (BOOLEAN_SHORT.has(short)) return 'boolean';
  if (REPORTER_SHORT.has(short)) return 'reporter';
  return 'stack';
}

/**
 * One toolbox JSON block for a library label.
 * Uses real bb_* blocks when implemented; otherwise shape-specific stubs (colour from label → category).
 */
export function toolboxBlockJsonForLibraryEntry(blockLabel) {
  const key = String(blockLabel || '').trim().toLowerCase();
  const short = SIDEBAR_TO_TYPE[key];
  const bb = short ? shortTypeToBlocklyType(short) : null;
  if (bb && BB_FULLY_IMPLEMENTED.has(bb)) {
    return { kind: 'block', type: bb };
  }
  const shape = inferLibShapeFromLabel(blockLabel);
  const type =
    shape === 'hat'
      ? 'bb_lib_hat'
      : shape === 'c'
        ? 'bb_lib_c'
        : shape === 'boolean'
          ? 'bb_lib_boolean'
          : shape === 'reporter'
            ? 'bb_lib_reporter'
            : 'bb_lib_stack';
  return {
    kind: 'block',
    type,
    fields: { BLOCK_NAME: String(blockLabel) },
  };
}
