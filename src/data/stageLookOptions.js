/** Stage backdrop names (must match GameBuilder BACKGROUNDS). */
export const STAGE_BACKDROP_NAMES = [
  'White',
  'Sky',
  'Space',
  'City',
  'Ocean',
  'Forest',
  'Desert',
  'Underwater',
  'Sunset',
  'Snow',
  'Jungle',
  'Cave',
  'Lava',
  'Candy',
  'Dungeon',
  'Kingdom',
  'Neon City',
  'Mountain',
  'Rainbow',
  'Graveyard',
];

/** Default costume slots (Scratch-style names + 1-based numbers). */
export const COSTUME_OPTION_VALUES = [
  'costume1',
  'costume2',
  'costume3',
  'costume4',
  'costume5',
  'costume6',
  'costume7',
  'costume8',
  '1',
  '2',
  '3',
  '4',
  '5',
];

/** Plain string lists for ParamSelect in the legacy block canvas. */
export const COSTUME_SELECT_OPTIONS = [...COSTUME_OPTION_VALUES];
export const BACKDROP_SELECT_OPTIONS = [...STAGE_BACKDROP_NAMES];

/** Blockly FieldDropdown pairs: [[label, value], ...] */
export function toBlocklyDropdown(values) {
  return values.map((v) => [v, v]);
}

export const COSTUME_BLOCKLY_DROPDOWN = toBlocklyDropdown(COSTUME_OPTION_VALUES);
export const BACKDROP_BLOCKLY_DROPDOWN = toBlocklyDropdown(STAGE_BACKDROP_NAMES);
