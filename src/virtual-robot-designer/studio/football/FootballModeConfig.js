/**
 * Per-mode football profiles — pitch size, stadium style, and gameplay rules.
 */
const DEFAULT_PITCH_HALF_X = 20;
const DEFAULT_PITCH_HALF_Z = 12.5;

export const DRILL_STYLES = {
  FULL_MATCH: 'fullMatch',
  SOLO_SHOOT: 'soloShoot',
  TURN_KICK: 'turnKick',
  KEEPER_WAVES: 'keeperWaves',
  GOLDEN_GOAL: 'goldenGoal',
};

const BASE = {
  pitchHalfX: DEFAULT_PITCH_HALF_X,
  pitchHalfZ: DEFAULT_PITCH_HALF_Z,
  pitchScale: 1,
  stadium: 'match',
  drillStyle: DRILL_STYLES.FULL_MATCH,
  drill: false,
  aiSpeedMult: 1,
  ballSpeedMult: 1,
  teamSize: 1,
  cam: 'solo',
};

export const FOOTBALL_MODE_BY_ID = {
  football_fifa: {
    ...BASE,
    kind: 'fifa',
    stadium: 'fifa',
    teamSize: 3,
    cam: 'sideline',
    label: '🏟️ FIFA 3v3',
  },
  football_cup_final: {
    ...BASE,
    kind: 'fifa',
    stadium: 'fifa',
    teamSize: 3,
    cam: 'sideline',
    aiSpeedMult: 1.18,
    label: '🏆 World Cup Final',
  },
  football_training: {
    ...BASE,
    kind: 'training',
    stadium: 'training',
    drill: true,
    drillStyle: DRILL_STYLES.SOLO_SHOOT,
    cam: 'solo',
    label: '⚽ Training Ground',
  },
  football_penalties: {
    ...BASE,
    kind: 'penalty',
    stadium: 'penalty',
    drill: true,
    drillStyle: DRILL_STYLES.TURN_KICK,
    cam: 'penalty',
    label: '🎯 Penalty Shootout',
  },
  football_free_kick: {
    ...BASE,
    kind: 'freekick',
    stadium: 'freekick',
    drill: true,
    drillStyle: DRILL_STYLES.TURN_KICK,
    cam: 'penalty',
    label: '🦶 Free Kick',
  },
  football_keeper: {
    ...BASE,
    kind: 'keeper',
    stadium: 'keeper',
    drill: true,
    drillStyle: DRILL_STYLES.KEEPER_WAVES,
    cam: 'keeper',
    label: '🧤 Goalkeeper Hero',
  },
  football_street: {
    ...BASE,
    kind: 'street',
    stadium: 'street',
    pitchHalfX: 14,
    pitchHalfZ: 8,
    pitchScale: 0.7,
    aiSpeedMult: 1.12,
    ballSpeedMult: 1.08,
    label: '🏙️ Street Football',
  },
  football_arcade: {
    ...BASE,
    kind: 'arcade',
    stadium: 'arcade',
    pitchHalfX: 16,
    pitchHalfZ: 10,
    pitchScale: 0.8,
    drillStyle: DRILL_STYLES.GOLDEN_GOAL,
    aiSpeedMult: 1.28,
    ballSpeedMult: 1.15,
    label: '🕹️ Arcade Rush',
  },
  football_skills: {
    ...BASE,
    kind: '1v1',
    stadium: 'match',
    label: '🥅 1v1 Skills',
  },
  football_championship: {
    ...BASE,
    kind: '1v1',
    stadium: 'match',
    aiSpeedMult: 1.22,
    label: '🏆 Championship',
  },
};

export const FOOTBALL_MODE_BY_MATCH_MODE = {
  fifa3v3: 'football_fifa',
  team3v3: 'football_fifa',
  training: 'football_training',
  penalties: 'football_penalties',
  freekick: 'football_free_kick',
  keeper: 'football_keeper',
  skills1v1: 'football_skills',
};

export function resolveFootballModeProfile(challenge = {}) {
  const id = challenge.id || '';
  if (FOOTBALL_MODE_BY_ID[id]) {
    return { ...FOOTBALL_MODE_BY_ID[id], courseId: id };
  }
  const mapped = FOOTBALL_MODE_BY_MATCH_MODE[challenge.matchMode || ''];
  if (mapped && FOOTBALL_MODE_BY_ID[mapped]) {
    return { ...FOOTBALL_MODE_BY_ID[mapped], courseId: mapped };
  }
  return { ...BASE, kind: '1v1', courseId: 'football_skills', label: '⚽ 1v1 Match' };
}

export function pitchBoundsFromProfile(profile = {}) {
  const halfX = profile.pitchHalfX ?? DEFAULT_PITCH_HALF_X;
  const halfZ = profile.pitchHalfZ ?? DEFAULT_PITCH_HALF_Z;
  return {
    halfX,
    halfZ,
    goalZ: halfZ,
    scale: profile.pitchScale ?? (halfX / DEFAULT_PITCH_HALF_X),
  };
}
