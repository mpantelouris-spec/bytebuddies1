/**
 * Mario Kart / Rainbow Road — course-scoped scratch block library.
 * Racing courses get every wheeled + universal block (no robotGroups filter),
 * plus named track-section presets from the starter lap script.
 */
import { UNIVERSAL_EVENTS_CATEGORY } from './universal-event-blocks.js';
import { isRaceCourse as isRaceCourseById, RACE_STARTER_SCRIPT, getRaceStarterScript, getRaceTrackGuideScript } from './racing-starter-script.js';

export function isRaceCourse(courseKey, arenaType) {
  return isRaceCourseById(courseKey, arenaType);
}

export { RACE_STARTER_SCRIPT, getRaceStarterScript, getRaceTrackGuideScript };

const RACE_PARAM_DEFS = {
  set_speed: [{ key: 'speed', label: '%', def: 65 }],
  boost: [{ key: 'seconds', label: 's', def: 1.2 }],
  move_forward: [{ key: 'steps', label: 'steps', def: 5 }],
  curve_left: [{ key: 'degrees', label: '°', def: 45 }, { key: 'steps', label: 'steps', def: 6 }],
  curve_right: [{ key: 'degrees', label: '°', def: 45 }, { key: 'steps', label: 'steps', def: 6 }],
};

const HELPER_BLOCK_IDS = new Set(['move_forward_continuous', 'follow_track_on', 'follow_track_off']);

const RACE_LABEL_OVERRIDES = {
  move_forward_continuous: 'Keep driving forward',
  move_forward: 'Move forward',
  move_backward: 'Move backward',
  set_speed: 'Set speed',
  boost: 'Boost for',
  brake: 'Brake',
  stop: 'Stop',
  curve_left: 'Curve left',
  curve_right: 'Curve right',
  turn_corner_left: 'Turn corner left',
  turn_corner_right: 'Turn corner right',
  follow_track_on: 'Follow track automatically',
  follow_track_off: 'Stop following track',
};

const HELPER_BLOCKS = [
  { id: 'move_forward_continuous', label: 'Keep driving forward', icon: '▶' },
  { id: 'follow_track_on', label: 'Follow track automatically', icon: '🎯', robotGroups: ['wheeled'] },
  { id: 'follow_track_off', label: 'Stop following track', icon: '⏹️', robotGroups: ['wheeled'] },
];

/** Named lap segments — optional Track palette helpers, not a solved starter. */
export function buildRaceTrackPresetBlocks(arenaType) {
  const script = getRaceTrackGuideScript(arenaType);
  return script
    .filter((b) => b.id !== 'when_start' && !HELPER_BLOCK_IDS.has(b.id))
    .map((b, i) => {
      const pv = { ...(b.paramValues || {}) };
      const params = (RACE_PARAM_DEFS[b.id] || []).map((p) => ({
        ...p,
        def: pv[p.key] ?? p.def,
      }));
      return {
        id: b.id,
        presetKey: `race_track_${i}`,
        label: b.label,
        icon: b.icon,
        paramValues: pv,
        params,
      };
    });
}

/** Keep blocks that work on race karts: universal blocks or wheeled-only blocks. */
function pickRaceBlocks(blocks = []) {
  return blocks
    .filter((b) => !HELPER_BLOCK_IDS.has(b.id))
    .filter((b) => !b.robotGroups || b.robotGroups.includes('wheeled'))
    .map(({ robotGroups, ...rest }) => ({
      ...rest,
      label: RACE_LABEL_OVERRIDES[rest.id] || rest.label,
    }));
}

/** Build full race palette from the main scratch library (no circular import). */
export function buildRaceBlockLibrary(baseLibrary, arenaType) {
  const lib = baseLibrary || {};
  const trackBlocks = buildRaceTrackPresetBlocks(arenaType);
  return {
    Events: UNIVERSAL_EVENTS_CATEGORY,
    Track: {
      label: 'Track helpers',
      color: '#a855f7',
      icon: '🛣️',
      blocks: trackBlocks,
    },
    Movement: {
      ...(lib.Movement || {}),
      label: 'Racing',
      color: '#ef4444',
      icon: '🏎️',
      blocks: pickRaceBlocks(lib.Movement?.blocks),
    },
    Helpers: {
      label: 'Helpers',
      color: '#64748b',
      icon: '🛟',
      collapsed: true,
      blocks: HELPER_BLOCKS.map((b) => ({
        ...b,
        label: RACE_LABEL_OVERRIDES[b.id] || b.label,
      })),
    },
    Loops: lib.Loops ? { ...lib.Loops, blocks: pickRaceBlocks(lib.Loops.blocks) } : undefined,
    Sensors: {
      ...(lib.Sensors || {}),
      label: 'Race Sensors',
      color: '#06b6d4',
      icon: '📡',
      blocks: [
        ...(pickRaceBlocks(lib.Sensors?.blocks) || []),
        { id: 'race_speed', label: 'Race speed (km/h)', icon: '⚡', output: 'Number' },
        { id: 'race_dist_left_rail', label: 'Distance to left rail', icon: '⬅️', output: 'Number' },
        { id: 'race_dist_right_rail', label: 'Distance to right rail', icon: '➡️', output: 'Number' },
        { id: 'race_on_track', label: 'On track?', icon: '🛣️', output: 'Boolean' },
        { id: 'race_current_lap', label: 'Current lap', icon: '🏁', output: 'Number' },
      ],
    },
    Logic: lib.Logic ? { ...lib.Logic, blocks: pickRaceBlocks(lib.Logic.blocks) } : undefined,
    Variables: lib.Variables ? { ...lib.Variables, blocks: pickRaceBlocks(lib.Variables.blocks) } : undefined,
    Functions: lib.Functions ? { ...lib.Functions, blocks: pickRaceBlocks(lib.Functions.blocks) } : undefined,
    Lights: lib.Lights ? { ...lib.Lights, blocks: pickRaceBlocks(lib.Lights.blocks) } : undefined,
    Sound: lib.Sound ? { ...lib.Sound, blocks: pickRaceBlocks(lib.Sound.blocks) } : undefined,
  };
}

/** Static fallback — prefer buildRaceBlockLibrary(BLOCK_LIBRARY) at runtime */
export const RACE_BLOCK_LIBRARY = buildRaceBlockLibrary({
  Movement: {
    blocks: [
      { id: 'set_speed', label: 'Set speed', icon: '⚡', params: [{ key: 'speed', label: '%', def: 65 }] },
      { id: 'boost', label: 'Boost for', icon: '🚀', params: [{ key: 'seconds', label: 's', def: 1.2 }] },
      { id: 'curve_left', label: 'Curve left', icon: '〰', params: [{ key: 'degrees', label: '°', def: 45 }, { key: 'steps', label: 'steps', def: 6 }] },
    ],
  },
});
