/**
 * robot-mission-progress.js — Star ratings & XP persistence per robot mission
 */
const KEY = 'bb_robot_missions';

function empty() {
  return { missions: {} };
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || empty();
  } catch {
    return empty();
  }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export const RobotMissionProgress = {
  getMission(robotName, missionId) {
    const d = load();
    const rk = String(robotName || 'Robot').replace(/\W+/g, '_');
    return d.missions[`${rk}:${missionId}`] || { stars: 0, xpEarned: 0, completed: false, subCompleted: {} };
  },

  saveMission(robotName, missionId, result) {
    const d = load();
    const rk = String(robotName || 'Robot').replace(/\W+/g, '_');
    const key = `${rk}:${missionId}`;
    const prev = d.missions[key] || { stars: 0, xpEarned: 0, completed: false, subCompleted: {} };
    d.missions[key] = {
      ...prev,
      ...result,
      stars: Math.max(prev.stars || 0, result.stars || 0),
      xpEarned: Math.max(prev.xpEarned || 0, result.xpEarned || 0),
      completed: true,
      completedAt: Date.now(),
    };
    save(d);
    return d.missions[key];
  },

  getZoneStars(robotName, missionIds) {
    let total = 0;
    let max = missionIds.length * 3;
    missionIds.forEach((id) => {
      total += RobotMissionProgress.getMission(robotName, id).stars || 0;
    });
    return { total, max, pct: max ? Math.round((total / max) * 100) : 0 };
  },
};
