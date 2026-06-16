/**
 * game-progress.js — XP, scores, track completion (localStorage)
 */
import { ROBOT_TRACKS, ACHIEVEMENT_BADGES, LEVELS_PER_TRACK } from '../data/robot-tracks.js';

export const LVL_THRESH = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000];
export const DIFF_XP = { easy: 50, medium: 100, hard: 200 };

function emptyData() {
  return { xp: 0, scores: {}, tracks: {}, badges: [], trackPoints: 0, attempts: 0, completedIds: [] };
}

export const GameProgress = {
  _key(n) { return 'bb_gp_' + String(n || 'Robot').replace(/\W+/g, '_'); },

  get(n) {
    try {
      const d = JSON.parse(localStorage.getItem(GameProgress._key(n))) || emptyData();
      d.scores = d.scores || {};
      d.tracks = d.tracks || {};
      d.badges = d.badges || [];
      d.completedIds = d.completedIds || [];
      return d;
    } catch {
      return emptyData();
    }
  },

  save(n, d) {
    try { localStorage.setItem(GameProgress._key(n), JSON.stringify(d)); } catch { /* ignore */ }
  },

  level(xp) {
    return LVL_THRESH.findLastIndex(t => xp >= t) + 1 || 1;
  },

  nextXp(lvl) {
    return LVL_THRESH[lvl] ?? Infinity;
  },

  addXp(n, amt) {
    const d = GameProgress.get(n);
    d.xp = (d.xp || 0) + amt;
    GameProgress.save(n, d);
    return d.xp;
  },

  getBest(n, id) {
    return (GameProgress.get(n).scores || {})[id] || 0;
  },

  setBest(n, id, score) {
    const d = GameProgress.get(n);
    d.scores = d.scores || {};
    const isNew = score > (d.scores[id] || 0);
    if (isNew) {
      d.scores[id] = score;
      GameProgress.save(n, d);
    }
    return isNew;
  },

  getTrackData(n, trackId) {
    const d = GameProgress.get(n);
    return d.tracks[trackId] || { completed: [], bests: {}, attempts: {} };
  },

  /** All levels unlocked — students can pick any course */
  isTrackLevelUnlocked(_n, _trackId, _level) {
    return true;
  },

  isTrackLevelCompleted(n, trackId, level) {
    return GameProgress.getTrackData(n, trackId).completed.includes(level);
  },

  isCourseCompleted(n, courseId) {
    return (GameProgress.get(n).completedIds || []).includes(courseId);
  },

  getTrackBest(n, trackId, level) {
    return GameProgress.getTrackData(n, trackId).bests[String(level)] || 0;
  },

  completeTrackLevel(n, trackId, level, score, courseId, meta = {}) {
    const d = GameProgress.get(n);
    d.tracks = d.tracks || {};
    const td = d.tracks[trackId] || { completed: [], bests: {}, attempts: {} };
    td.attempts = td.attempts || {};
    td.attempts[String(level)] = (td.attempts[String(level)] || 0) + 1;

    const isNewBest = score > (td.bests[String(level)] || 0);
    if (isNewBest) td.bests[String(level)] = score;

    const wasCompleted = td.completed.includes(level);
    if (!wasCompleted) {
      td.completed.push(level);
      td.completed.sort((a, b) => a - b);
    }

    d.tracks[trackId] = td;
    d.attempts = (d.attempts || 0) + 1;
    if (!wasCompleted) d.trackPoints = (d.trackPoints || 0) + score;

    const cid = courseId || `${trackId}_l${level}`;
    if (!d.completedIds.includes(cid)) d.completedIds.push(cid);
    GameProgress.setBest(n, cid, score);
    GameProgress._checkAchievements(d, trackId, level, score, meta);
    GameProgress.save(n, d);
    return { isNewBest, wasCompleted, isFirstComplete: !wasCompleted };
  },

  _checkAchievements(d, trackId, level, score, meta = {}) {
    const badges = new Set(d.badges || []);
    badges.add('first_track');

    const track = ROBOT_TRACKS.find(t => t.id === trackId);
    if (track && (d.tracks[trackId]?.completed.length || 0) >= LEVELS_PER_TRACK) {
      const map = {
        line_following: 'line_master',
        pick_place: 'pick_pro',
        obstacle_avoidance: 'obstacle_ace',
        speed_challenge: 'speed_demon',
        drone_pilot: 'drone_ace',
      };
      if (map[trackId]) badges.add(map[trackId]);
    }

    const tracksWithProgress = Object.values(d.tracks).filter(t => t.completed?.length > 0).length;
    if (tracksWithProgress >= 6) badges.add('track_explorer');
    if ((d.trackPoints || 0) >= 10000) badges.add('ten_thousand');
    if ((d.completedIds || []).length >= 100) badges.add('centurion');
    if ((meta.totalDist || 0) >= 70) badges.add('marathon_runner');

    d.badges = [...badges];
  },

  addBadge(n, badgeId) {
    const d = GameProgress.get(n);
    const badges = new Set(d.badges || []);
    badges.add(badgeId);
    d.badges = [...badges];
    GameProgress.save(n, d);
  },

  getBadges(n) {
    const ids = GameProgress.get(n).badges || [];
    return ACHIEVEMENT_BADGES.filter(b => ids.includes(b.id));
  },

  getTrackCompletionPct(n, trackId) {
    const td = GameProgress.getTrackData(n, trackId);
    return Math.round((td.completed.length / LEVELS_PER_TRACK) * 100);
  },

  getTotalCompletedLevels(n) {
    return (GameProgress.get(n).completedIds || []).length;
  },

  getPersonalLeaderboard(n) {
    const d = GameProgress.get(n);
    const entries = [];
    for (const [id, score] of Object.entries(d.scores || {})) {
      if (score > 0) entries.push({ id, score });
    }
    return entries.sort((a, b) => b.score - a.score).slice(0, 15);
  },
};

export function fmtTime(secs) {
  const s = Math.floor(secs || 0);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function fmtDist(m) {
  return `${Math.round(m || 0)} m`;
}
