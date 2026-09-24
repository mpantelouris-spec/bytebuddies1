/**
 * Universal event blocks — identical for every robot type and every course.
 */

/** Scratch-style event hat blocks (CustomCodePanel palette) */
export const UNIVERSAL_EVENT_BLOCKS = [
  { id: 'when_start', label: 'When START clicked', icon: '▶️' },
  { id: 'when_key', label: 'When key pressed', icon: '⌨️', params: [{ key: 'key', type: 'dropdown', label: '', def: 'space', options: [['space', 'space'], ['up arrow', 'up'], ['down arrow', 'down'], ['left arrow', 'left'], ['right arrow', 'right']] }] },
  { id: 'when_spacebar', label: 'When spacebar clicked', icon: '⌨️' },
  { id: 'when_zone', label: 'When zone reached', icon: '📍' },
  { id: 'when_collect', label: 'When item collected', icon: '✨' },
  { id: 'when_collision', label: 'When collision detected', icon: '💥' },
  { id: 'when_sensor', label: 'When sensor triggers', icon: '📡' },
  { id: 'when_timer', label: 'When timer reaches', icon: '⏱️', params: [{ key: 'seconds', label: 's', def: 5 }] },
  { id: 'when_battery', label: 'When battery below', icon: '🔋', params: [{ key: 'percent', label: '%', def: 20 }] },
  { id: 'when_checkpoint', label: 'When checkpoint passed', icon: '🚩' },
  { id: 'when_lap', label: 'When lap completed', icon: '🏁', params: [{ key: 'lap', label: '#', def: 1 }] },
  { id: 'when_race_won', label: 'When race won', icon: '🏆' },
  { id: 'when_goal', label: 'When goal reached', icon: '🎯' },
  { id: 'when_gap_passed', label: 'When gap passed', icon: '🎯' },
  { id: 'when_game_over', label: 'When game over', icon: '🛑' },
];

/** Blockly hat block types (Live Lab toolbox) */
export const UNIVERSAL_BLOCKLY_EVENT_TYPES = [
  'robot_when_start',
  'robot_when_key',
  'robot_when_zone',
  'robot_when_collect',
  'robot_when_collision',
  'robot_when_sensor',
  'robot_when_battery',
  'robot_when_timer',
  'robot_when_checkpoint',
  'robot_when_lap',
  'robot_when_race_won',
  'robot_when_goal',
  'robot_when_gap_passed',
  'robot_when_game_over',
];

export const UNIVERSAL_EVENT_BLOCK_COUNT = UNIVERSAL_EVENT_BLOCKS.length;

export const UNIVERSAL_EVENTS_CATEGORY = {
  label: 'Events',
  color: '#ef4444',
  icon: '⚡',
  blocks: UNIVERSAL_EVENT_BLOCKS,
};

/** Inject universal Events into any block library object */
export function withUniversalEvents(library) {
  return { ...library, Events: UNIVERSAL_EVENTS_CATEGORY };
}
