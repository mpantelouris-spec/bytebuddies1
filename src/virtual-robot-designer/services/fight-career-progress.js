/**
 * Boxing career progression — unlocks, coins, XP, belts (localStorage).
 */

const LS_KEY = 'bb_fight_career_v1';

const UNLOCK_ORDER = [
  'fight_training',
  'fight_sparring',
  'fight_championship',
  'fight_tournament',
  'fight_boss',
  'fight_survival',
  'fight_strategies',
  'fight_speed_rumble',
  'fight_iron_wall',
  'fight_final_gauntlet',
];

const DEFAULT = {
  wins: 0,
  losses: 0,
  coins: 0,
  level: 1,
  xp: 0,
  belts: [],
  cleared: [],
  stats: { totalDamage: 0, bestCombo: 0 },
};

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

function save(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function getFightCareer() {
  return load();
}

export function isFightUnlocked(courseId) {
  if (courseId === 'fight_training') return true;
  const idx = UNLOCK_ORDER.indexOf(courseId);
  if (idx <= 0) return true;
  const prev = UNLOCK_ORDER[idx - 1];
  return load().cleared.includes(prev);
}

export function recordFightResult(courseId, { won, playerScore = 0, playerCombo = 0, xpReward = 100 } = {}) {
  const data = load();
  if (won) {
    data.wins += 1;
    if (!data.cleared.includes(courseId)) data.cleared.push(courseId);
    const coins = Math.round((xpReward || 100) * 0.5 + playerScore * 0.1);
    data.coins += coins;
    data.xp += xpReward || 100;
    data.level = 1 + Math.floor(data.xp / 500);
    data.stats.totalDamage += playerScore;
    data.stats.bestCombo = Math.max(data.stats.bestCombo, playerCombo);
    if (courseId === 'fight_championship' && !data.belts.includes('champion')) {
      data.belts.push('champion');
    }
    if (courseId === 'fight_tournament' && !data.belts.includes('tournament')) {
      data.belts.push('tournament');
    }
    save(data);
    return { coins, xp: xpReward, level: data.level, newBelt: data.belts[data.belts.length - 1] };
  }
  data.losses += 1;
  save(data);
  return { coins: 0, xp: 0, level: data.level };
}

export function getFightUnlockLabel(courseId) {
  const idx = UNLOCK_ORDER.indexOf(courseId);
  if (idx <= 0) return null;
  const prev = UNLOCK_ORDER[idx - 1];
  const names = {
    fight_training: 'Training Arena',
    fight_sparring: 'Sparring Match',
    fight_championship: 'Championship Bout',
    fight_tournament: 'Tournament Bracket',
    fight_boss: 'Boss Gauntlet',
    fight_survival: 'Survival Mode',
    fight_strategies: 'Combat Strategies',
  };
  return `Beat ${names[prev] || prev} to unlock`;
}

export { UNLOCK_ORDER };
