/**
 * mk-racing-courses.js — CodeRacer premium tracks only (10 brand-new circuits).
 */
import { BIOME_TRACKS } from '../racing/mk-tracks/MKTrackRegistry.js';
import { COSMIC_SKYWAY_BONUS_TRACKS } from '../racing/mk-tracks/CosmicSkywayRegistry.js';

function buildZones(track) {
  const z = (num, name, desc) => ({
    num,
    name,
    desc,
    systems: ['movement', 'checkpoints', 'laps'],
    blocks: ['robot_when_start', 'robot_set_speed', 'robot_move_forward'],
  });
  return [
    z(1, 'Grid Start', track.story),
    z(2, 'First Lap', 'Complete your first lap — pass every checkpoint gate in order.'),
    z(3, 'Racing Line', 'Hold steady speed through the curves.'),
    z(4, 'Boost Pads', 'Hit the cyan boost pads on straights for extra speed.'),
    z(5, 'Finale', `Finish all ${track.laps} lap${track.laps > 1 ? 's' : ''} and cross the line!`),
  ];
}

/** Only the 10 premium CodeRacer tracks — legacy MK circuits removed from catalog */
export const MK_RACING_COURSES = [...BIOME_TRACKS, ...COSMIC_SKYWAY_BONUS_TRACKS].map((track) => ({
  id: track.courseId,
  name: track.label,
  desc: track.story,
  tagline: track.story,
  genre: 'racing',
  icon: track.emoji,
  color: track.color,
  arenaType: track.arenaType,
  estMinutes: Math.max(3, Math.round(track.targetTime / 60)),
  totalDist: Math.round(track.spline.length * 2.5) || 20,
  timeLimit: track.targetTime + 120,
  laps: track.laps,
  checkpoints: track.checkpointTs.length,
  targetTime: track.targetTime,
  gameObjectives: [
    `Complete ${track.laps} lap${track.laps > 1 ? 's' : ''}`,
    `Pass ${track.checkpointTs.length} checkpoints`,
    `Finish under ${track.targetTime}s`,
  ],
  rec: ['rover', 'scout'],
  cat: 'racing',
  mkTier: track.tier,
  mkDifficulty: track.difficulty,
  objectives: [
    { id: 'finish', icon: '🏁', label: `Complete ${track.laps} lap${track.laps > 1 ? 's' : ''}`, target: 1, get: (s) => (s.raceWon ? 1 : 0) },
    { id: 'checkpoints', icon: '🎯', label: `Pass ${track.checkpointTs.length} gates`, target: track.checkpointTs.length, get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, track.checkpointTs.length) },
    { id: 'time', icon: '⏱️', label: `Finish under ${track.targetTime}s`, target: 1, get: (s) => (s.raceWon && (s.raceTotalTime ?? 999) < track.targetTime ? 1 : 0) },
  ],
  zones: buildZones(track),
}));

export const MK_RACING_COURSE_BY_ID = Object.fromEntries(
  MK_RACING_COURSES.flatMap((c) => [[c.id, c], [c.arenaType, c]]),
);
