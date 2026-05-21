/** Stage backdrop names (must match GameBuilder stage backdrops). */
export { STAGE_BACKDROP_NAMES, STAGE_BACKDROPS, findStageBackdrop } from './stageBackdrops';

import { STAGE_BACKDROP_NAMES } from './stageBackdrops';

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
