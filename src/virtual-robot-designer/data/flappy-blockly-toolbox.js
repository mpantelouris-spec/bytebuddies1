/**
 * Flappy BirdBot — complete Blockly toolbox (49 blocks, 8 categories).
 * Single source of truth for every block in the course palette.
 */

import { FLAPPY_BLOCK_COUNT } from './flappy-block-defs.js';
import { UNIVERSAL_BLOCKLY_EVENT_TYPES } from './universal-event-blocks.js';

const CORE_INVENTORY = {
  Events: UNIVERSAL_BLOCKLY_EVENT_TYPES,
  Movement: [
    'robot_flap',
    'robot_set_flap_strength',
    'robot_set_gravity_strength',
    'robot_set_scroll_speed',
    'robot_freeze_bird',
    'robot_move_up_units',
    'robot_move_down_units',
    'robot_set_bird_height',
  ],
  Loops: [
    'robot_repeat',
    'robot_repeat_until_gameover',
    'robot_forever',
    'robot_wait',
    'robot_repeat_count_with',
    'robot_break_loop',
  ],
  Sensors: [
    'robot_num_pipe_dist',
    'robot_num_bird_height',
    'robot_num_gap_center',
    'robot_is_falling_bool',
    'robot_num_gap_size',
    'robot_num_time_alive',
    'robot_num_score',
    'robot_num_high_score',
  ],
  Logic: [
    'robot_if_then',
    'robot_if_else',
    'robot_flappy_gt',
    'robot_flappy_lt',
    'robot_flappy_eq',
    'robot_flappy_and',
    'robot_flappy_or',
  ],
  Variables: [
    'robot_var_create',
    'robot_var_set',
    'robot_var_change',
    'robot_show_variable',
    'robot_hide_variable',
    'robot_var_get',
  ],
  'Game Control': [
    'robot_restart_game',
    'robot_show_message',
    'robot_show_score',
    'robot_play_sound',
    'robot_pause_game',
  ],
  Math: [
    'robot_math_add',
    'robot_math_sub',
    'robot_math_mul',
    'robot_math_div',
  ],
};

export const FLAPPY_BLOCK_INVENTORY = { ...CORE_INVENTORY };

/** Spec colours (Section 2) */
export const FLAPPY_BLOCKLY_CATEGORIES = [
  { id: 'All Blocks',   colour: '#a855f7', icon: '⭐' },
  { id: 'Events',       colour: '#C62828', icon: '🎮' },
  { id: 'Movement',     colour: '#1565C0', icon: '🐦' },
  { id: 'Loops',        colour: '#E65100', icon: '🔁' },
  { id: 'Sensors',      colour: '#2E7D32', icon: '👁' },
  { id: 'Logic',        colour: '#6A1B9A', icon: '🧠' },
  { id: 'Variables',    colour: '#BF360C', icon: '📦' },
  { id: 'Game Control', colour: '#AD1457', icon: '🎯' },
  { id: 'Math',         colour: '#00695C', icon: '🔢' },
];

const CATEGORY_COLOURS = Object.fromEntries(
  FLAPPY_BLOCKLY_CATEGORIES.map((c) => [c.id, c.colour]),
);

export function getAllFlappyBlockTypes() {
  return Object.values(CORE_INVENTORY).flat().filter((t) => t !== 'math_number');
}

export function getFlappyTotalBlockCount() {
  return FLAPPY_BLOCK_COUNT;
}

function toolboxEntry(type) {
  if (type === 'math_number') {
    return { kind: 'block', type: 'math_number', fields: { NUM: 0 } };
  }
  if (type === 'robot_when_key') {
    return { kind: 'block', type, fields: { KEY: 'space' } };
  }
  if (type === 'robot_repeat' || type === 'robot_repeat_count_with') {
    const fields = type === 'robot_repeat_count_with'
      ? { TIMES: 5, VAR: 'i' }
      : { TIMES: 3 };
    return {
      kind: 'block', type, fields,
      inputs: { DO: { shadow: { type: 'robot_flap' } } },
    };
  }
  if (type === 'robot_forever' || type === 'robot_repeat_until_gameover') {
    return {
      kind: 'block', type,
      inputs: { DO: { shadow: { type: 'robot_flap' } } },
    };
  }
  if (type === 'robot_if_then' || type === 'robot_if_else') {
    return {
      kind: 'block', type,
      inputs: { COND: { shadow: { type: 'robot_is_falling_bool' } } },
    };
  }
  if (type === 'robot_flappy_gt' || type === 'robot_flappy_lt' || type === 'robot_flappy_eq') {
    return {
      kind: 'block', type,
      inputs: {
        A: { shadow: { type: 'math_number', fields: { NUM: 0 } } },
        B: { shadow: { type: 'math_number', fields: { NUM: 0 } } },
      },
    };
  }
  if (type === 'robot_flappy_and' || type === 'robot_flappy_or') {
    return {
      kind: 'block', type,
      inputs: {
        A: { shadow: { type: 'robot_is_falling_bool' } },
        B: { shadow: { type: 'robot_is_falling_bool' } },
      },
    };
  }
  if (type === 'robot_math_add' || type === 'robot_math_sub'
      || type === 'robot_math_mul' || type === 'robot_math_div') {
    return {
      kind: 'block', type,
      inputs: {
        A: { shadow: { type: 'math_number', fields: { NUM: 0 } } },
        B: { shadow: { type: 'math_number', fields: { NUM: 0 } } },
      },
    };
  }
  if (type === 'robot_set_flap_strength' || type === 'robot_set_gravity_strength'
      || type === 'robot_set_scroll_speed') {
    return { kind: 'block', type, fields: { STRENGTH: 5, SPEED: 5 } };
  }
  if (type === 'robot_move_up_units' || type === 'robot_move_down_units') {
    return { kind: 'block', type, fields: { UNITS: 3 } };
  }
  if (type === 'robot_set_bird_height') {
    return {
      kind: 'block', type,
      inputs: { HEIGHT: { shadow: { type: 'math_number', fields: { NUM: 10 } } } },
    };
  }
  if (type === 'robot_wait' || type === 'robot_pause_game') {
    return { kind: 'block', type, fields: { SECS: 1 } };
  }
  if (type === 'robot_var_set') {
    return {
      kind: 'block', type, fields: { VAR: 'myVar' },
      inputs: { VAL: { shadow: { type: 'math_number', fields: { NUM: 0 } } } },
    };
  }
  if (type === 'robot_var_change') {
    return { kind: 'block', type, fields: { VAR: 'myVar', DELTA: 1 } };
  }
  if (type === 'robot_var_create' || type === 'robot_var_get'
      || type === 'robot_show_variable' || type === 'robot_hide_variable') {
    return { kind: 'block', type, fields: { VAR: 'myVar' } };
  }
  if (type === 'robot_show_message') {
    return { kind: 'block', type, fields: { TEXT: 'Nice!' } };
  }
  if (type === 'robot_play_sound') {
    return { kind: 'block', type, fields: { SOUND: 'score' } };
  }
  return { kind: 'block', type };
}

function blocksToToolboxContents(blocks) {
  return blocks.map((b) => toolboxEntry(b));
}

export function getFlappyCategoryCounts() {
  return Object.fromEntries(
    Object.entries(CORE_INVENTORY).map(([name, blocks]) => [
      name,
      blocks.filter((t) => t !== 'math_number').length,
    ]),
  );
}

function categorySidebarLabel(name, count) {
  const meta = FLAPPY_BLOCKLY_CATEGORIES.find((c) => c.id === name);
  const icon = meta?.icon || '•';
  const short = {
    'All Blocks': 'All',
    Events: 'Events',
    Movement: 'Move',
    Loops: 'Loops',
    Sensors: 'Sense',
    Logic: 'Logic',
    Variables: 'Vars',
    'Game Control': 'Game',
    Math: 'Math',
  }[name] || name;
  return `${icon} ${short}\n(${count})`;
}

export function buildFlappyBirdToolbox() {
  const counts = getFlappyCategoryCounts();
  const allTypes = getAllFlappyBlockTypes();
  const contents = [
    {
      kind: 'category',
      name: categorySidebarLabel('All Blocks', allTypes.length),
      colour: CATEGORY_COLOURS['All Blocks'],
      contents: allTypes.map(toolboxEntry),
    },
    ...Object.entries(CORE_INVENTORY).map(([name, blocks]) => ({
      kind: 'category',
      name: categorySidebarLabel(name, counts[name]),
      colour: CATEGORY_COLOURS[name] || '#6366f1',
      contents: blocksToToolboxContents(blocks),
    })),
  ];
  return { kind: 'categoryToolbox', contents };
}

export function flappyCategoryDisplayName(toolboxName = '') {
  const raw = String(toolboxName).trim();
  for (const cat of FLAPPY_BLOCKLY_CATEGORIES) {
    if (raw.startsWith(cat.icon)) return cat.id;
  }
  return raw.replace(/\s*\(\d+\)\s*$/, '').trim();
}

export const FLAPPY_BLOCKLY_STARTER = `<xml>
  <block type="robot_when_key" x="30" y="30">
    <field name="KEY">space</field>
    <next><block type="robot_flap"></block></next>
  </block>
</xml>`;
