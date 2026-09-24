/**
 * Football block library — movement, ball interaction, sensing, events.
 */
import { UNIVERSAL_EVENTS_CATEGORY } from './universal-event-blocks.js';
import { FOOTBALL_COURSE_IDS } from './football-courses.js';

export function isFootballCourse(courseKey, arenaType) {
  const baseId = typeof courseKey === 'string' ? courseKey.split(':')[0] : courseKey;
  return FOOTBALL_COURSE_IDS.has(baseId) || arenaType === 'robot_football';
}

const FB = ['footballbot', 'football'];

export const FOOTBALL_BLOCK_LIBRARY = {
  Events: UNIVERSAL_EVENTS_CATEGORY,
  Football: {
    name: 'Football',
    label: 'Football',
    color: '#16A34A',
    icon: '⚽',
    blocks: [
      { id: 'chase_ball', label: 'Chase ball', icon: '🏃', robotGroups: FB },
      { id: 'face_ball', label: 'Face ball', icon: '👀', robotGroups: FB },
      { id: 'move_to_position', label: 'Move to position', icon: '📍', robotGroups: FB, params: [{ key: 'x', label: 'X', def: 0 }, { key: 'z', label: 'Z', def: 0 }] },
      { id: 'short_pass', label: 'Short pass', icon: '⚽', robotGroups: FB },
      { id: 'long_pass', label: 'Long pass', icon: '🎯', robotGroups: FB },
      { id: 'shoot', label: 'Shoot', icon: '💥', robotGroups: FB },
      { id: 'lob_pass', label: 'Lob pass', icon: '🌈', robotGroups: FB },
      { id: 'dribble', label: 'Dribble toward goal', icon: '🦶', robotGroups: FB },
      { id: 'celebrate', label: 'Celebrate', icon: '🎉', robotGroups: FB },
    ],
  },
  Goalkeeper: {
    name: 'Goalkeeper',
    label: 'Goalkeeper',
    color: '#2563EB',
    icon: '🧤',
    blocks: [
      { id: 'guard_goal', label: 'Guard goal', icon: '🧤', robotGroups: FB },
      { id: 'dive_save', label: 'Dive to save', icon: '🤸', robotGroups: FB },
      { id: 'catch_ball', label: 'Catch ball', icon: '🙌', robotGroups: FB },
      { id: 'clear_ball', label: 'Clear ball', icon: '🦵', robotGroups: FB },
    ],
  },
  Logic: {
    name: 'Logic',
    label: 'Logic',
    color: '#7C3AED',
    icon: '🧠',
    blocks: [
      { id: 'check_ball_distance', label: 'Check distance to ball', icon: '📏', robotGroups: FB },
      { id: 'check_goal_distance', label: 'Check distance to goal', icon: '🥅', robotGroups: FB },
      { id: 'if_ball_close', label: 'If ball is close then', icon: '❓', robotGroups: FB },
      { id: 'if_ball_far', label: 'If ball is far then', icon: '❓', robotGroups: FB },
      { id: 'if_have_ball', label: 'If I have the ball then', icon: '❓', robotGroups: FB },
      { id: 'if_shooting_range', label: 'If in shooting range then', icon: '❓', robotGroups: FB },
      { id: 'wait', label: 'Wait', icon: '⏸️', robotGroups: FB, params: [{ key: 'seconds', label: 's', def: 0.5 }] },
      { id: 'forever', label: 'Forever (match loop)', icon: '∞', robotGroups: FB },
      { id: 'repeat', label: 'Repeat', icon: '🔁', robotGroups: FB, params: [{ key: 'times', label: '×', def: 3 }] },
    ],
  },
  MatchEvents: {
    name: 'Match Events',
    label: 'Match Events',
    color: '#EC4899',
    icon: '🏁',
    blocks: [
      { id: 'when_get_ball', label: 'When I get the ball', icon: '⚽', robotGroups: FB },
      { id: 'when_goal_scored', label: 'When I score', icon: '🥅', robotGroups: FB },
      { id: 'when_concede', label: 'When opponent scores', icon: '😞', robotGroups: FB },
      { id: 'when_match_start', label: 'When match starts', icon: '🏁', robotGroups: FB },
      { id: 'when_match_end', label: 'When match ends', icon: '🏁', robotGroups: FB },
      { id: 'when_out_bounds', label: 'When ball goes out', icon: '🚩', robotGroups: FB },
    ],
  },
};

export const FOOTBALL_TEAM_ROLES = [
  { id: 'defender', botId: 'p0', label: 'Defender', icon: '🛡️', number: 4, color: '#2563EB' },
  { id: 'striker', botId: 'p1', label: 'Striker', icon: '⚡', number: 9, color: '#16A34A' },
  { id: 'midfielder', botId: 'p2', label: 'Midfielder', icon: '🎯', number: 8, color: '#7C3AED' },
];

export const FOOTBALL_STARTER_SCRIPT = [
  { id: 'when_start', label: 'When START clicked', icon: '▶️', catKey: 'Events', paramValues: {} },
  { id: 'forever', label: 'Forever (match loop)', icon: '∞', catKey: 'Logic', paramValues: {} },
  { id: 'if_shooting_range', label: 'If in shooting range then', icon: '❓', catKey: 'Logic', paramValues: {} },
  { id: 'shoot', label: 'Shoot', icon: '💥', catKey: 'Football', paramValues: {} },
  { id: 'if_have_ball', label: 'If I have the ball then', icon: '❓', catKey: 'Logic', paramValues: {} },
  { id: 'dribble', label: 'Dribble toward goal', icon: '🦶', catKey: 'Football', paramValues: {} },
  { id: 'chase_ball', label: 'Chase ball', icon: '🏃', catKey: 'Football', paramValues: {} },
];

export const FOOTBALL_ROLE_STARTERS = {
  defender: [
    { id: 'when_start', label: 'When START clicked', icon: '▶️', catKey: 'Events', paramValues: {} },
    { id: 'forever', label: 'Forever (match loop)', icon: '∞', catKey: 'Logic', paramValues: {} },
    { id: 'if_ball_close', label: 'If ball is close then', icon: '❓', catKey: 'Logic', paramValues: {} },
    { id: 'clear_ball', label: 'Clear ball', icon: '🦵', catKey: 'Goalkeeper', paramValues: {} },
    { id: 'guard_goal', label: 'Guard goal', icon: '🧤', catKey: 'Goalkeeper', paramValues: {} },
  ],
  striker: [
    { id: 'when_start', label: 'When START clicked', icon: '▶️', catKey: 'Events', paramValues: {} },
    { id: 'forever', label: 'Forever (match loop)', icon: '∞', catKey: 'Logic', paramValues: {} },
    { id: 'if_shooting_range', label: 'If in shooting range then', icon: '❓', catKey: 'Logic', paramValues: {} },
    { id: 'shoot', label: 'Shoot', icon: '💥', catKey: 'Football', paramValues: {} },
    { id: 'if_have_ball', label: 'If I have the ball then', icon: '❓', catKey: 'Logic', paramValues: {} },
    { id: 'dribble', label: 'Dribble toward goal', icon: '🦶', catKey: 'Football', paramValues: {} },
    { id: 'chase_ball', label: 'Chase ball', icon: '🏃', catKey: 'Football', paramValues: {} },
  ],
  midfielder: [
    { id: 'when_start', label: 'When START clicked', icon: '▶️', catKey: 'Events', paramValues: {} },
    { id: 'forever', label: 'Forever (match loop)', icon: '∞', catKey: 'Logic', paramValues: {} },
    { id: 'if_have_ball', label: 'If I have the ball then', icon: '❓', catKey: 'Logic', paramValues: {} },
    { id: 'short_pass', label: 'Short pass', icon: '⚽', catKey: 'Football', paramValues: {} },
    { id: 'if_ball_close', label: 'If ball is close then', icon: '❓', catKey: 'Logic', paramValues: {} },
    { id: 'chase_ball', label: 'Chase ball', icon: '🏃', catKey: 'Football', paramValues: {} },
    { id: 'move_to_position', label: 'Move to position', icon: '📍', catKey: 'Football', paramValues: { x: -5, z: 0 } },
  ],
};

export const FOOTBALL_BLOCK_ACTION_MAP = {
  chase_ball: 'chase_ball',
  face_ball: 'face_ball',
  move_to_position: 'move_to_position',
  short_pass: 'short_pass',
  long_pass: 'long_pass',
  shoot: 'shoot',
  lob_pass: 'lob_pass',
  dribble: 'dribble',
  celebrate: 'celebrate',
  guard_goal: 'guard_goal',
  dive_save: 'dive_save',
  catch_ball: 'catch_ball',
  clear_ball: 'clear_ball',
};
