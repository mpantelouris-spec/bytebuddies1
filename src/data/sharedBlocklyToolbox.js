export const SHARED_BLOCKLY_TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Events',
      categorystyle: 'event_category',
      colour: '#FFBF00',
      contents: [
        { kind: 'block', type: 'bb_event_start' },
        { kind: 'block', type: 'bb_event_keypress' },
      ],
    },
    {
      kind: 'category',
      name: 'Motion',
      categorystyle: 'motion_category',
      colour: '#4C97FF',
      contents: [
        { kind: 'block', type: 'bb_sprite_move' },
        { kind: 'block', type: 'bb_sprite_turn' },
        { kind: 'block', type: 'bb_sprite_goto' },
        { kind: 'block', type: 'bb_sprite_changex' },
        { kind: 'block', type: 'bb_sprite_changey' },
      ],
    },
    {
      kind: 'category',
      name: 'Looks',
      categorystyle: 'looks_category',
      colour: '#9966FF',
      contents: [{ kind: 'block', type: 'bb_sprite_say' }],
    },
    {
      kind: 'category',
      name: 'Sound',
      categorystyle: 'sound_category',
      colour: '#CF63CF',
      contents: [{ kind: 'block', type: 'bb_sound_play' }],
    },
    {
      kind: 'category',
      name: 'Control',
      categorystyle: 'control_category',
      colour: '#FFAB19',
      contents: [
        { kind: 'block', type: 'bb_control_wait' },
        { kind: 'block', type: 'bb_loop_repeat' },
        { kind: 'block', type: 'bb_loop_forever' },
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      categorystyle: 'logic_category',
      colour: '#59C059',
      contents: [{ kind: 'block', type: 'bb_logic_if' }],
    },
    {
      kind: 'category',
      name: 'Variables',
      categorystyle: 'variable_category',
      colour: '#FF8C1A',
      contents: [
        { kind: 'block', type: 'bb_var_create' },
        { kind: 'block', type: 'bb_var_change' },
      ],
    },
  ],
};

export const BLOCKLY_TYPE_TO_SIDEBAR_NAME = {
  bb_event_start: 'on start',
  bb_event_keypress: 'on key press',
  bb_sprite_move: 'move steps',
  bb_sprite_turn: 'turn degrees',
  bb_sprite_goto: 'go to x,y',
  bb_sprite_changex: 'change X by',
  bb_sprite_changey: 'change Y by',
  bb_control_wait: 'wait',
  bb_loop_repeat: 'repeat N times',
  bb_loop_forever: 'forever',
  bb_logic_if: 'if / else',
  bb_sound_play: 'play sound',
  bb_sprite_say: 'say',
  bb_var_create: 'create variable',
  bb_var_change: 'change by',
};
