/**
 * game-designer-progress.js — Game Designer XP, systems built, creativity tracking
 */
import { GameProgress } from './game-progress.js';
import { calcZoneDesignerXp } from '../data/game-missions.js';

function emptyDesigner() {
  return {
    designerXp: 0,
    systemsBuilt: [],
    missionsStarted: [],
    missionsCompleted: [],
    zonesCleared: {},
    creativityScore: 0,
    complexityUnlocked: 0,
    remixCount: 0,
  };
}

export const DesignerProgress = {
  _key(n) { return 'bb_designer_' + String(n || 'Robot').replace(/\W+/g, '_'); },

  get(n) {
    try {
      const d = JSON.parse(localStorage.getItem(DesignerProgress._key(n))) || emptyDesigner();
      return { ...emptyDesigner(), ...d };
    } catch {
      return emptyDesigner();
    }
  },

  save(n, d) {
    try { localStorage.setItem(DesignerProgress._key(n), JSON.stringify(d)); } catch { /* ignore */ }
  },

  designerLevel(xp) {
    const thresholds = [0, 50, 150, 350, 700, 1200, 2000, 3500, 6000, 10000];
    return thresholds.findLastIndex((t) => xp >= t) + 1 || 1;
  },

  addDesignerXp(n, amt, reason) {
    const d = DesignerProgress.get(n);
    d.designerXp = (d.designerXp || 0) + amt;
    d.creativityScore = (d.creativityScore || 0) + Math.floor(amt * 0.3);
    d.complexityUnlocked = DesignerProgress.designerLevel(d.designerXp);
    DesignerProgress.save(n, d);
    return { xp: d.designerXp, gained: amt, reason, level: d.complexityUnlocked };
  },

  unlockSystems(n, systems = []) {
    const d = DesignerProgress.get(n);
    const set = new Set(d.systemsBuilt || []);
    let added = 0;
    systems.forEach((s) => {
      if (!set.has(s)) { set.add(s); added++; }
    });
    d.systemsBuilt = [...set];
    if (added) DesignerProgress.save(n, d);
    return added;
  },

  clearZone(n, missionId, zoneNum, mission, meta = {}) {
    const d = DesignerProgress.get(n);
    d.zonesCleared = d.zonesCleared || {};
    const key = `${missionId}_z${zoneNum}`;
    const wasNew = !d.zonesCleared[key];
    d.zonesCleared[key] = { at: Date.now(), ...meta };

    if (!d.missionsStarted.includes(missionId)) {
      d.missionsStarted.push(missionId);
    }

    const zone = mission?.zones?.find((z) => z.num === zoneNum);
    if (zone?.systemsIntroduced?.length) {
      DesignerProgress.unlockSystems(n, zone.systemsIntroduced);
    }

    if (zoneNum >= 10 && !d.missionsCompleted.includes(missionId)) {
      d.missionsCompleted.push(missionId);
      d.remixCount = (d.remixCount || 0) + 1;
    }

    DesignerProgress.save(n, d);

    const xpGain = wasNew ? calcZoneDesignerXp(mission, zoneNum, meta) : 0;
    const xpResult = xpGain ? DesignerProgress.addDesignerXp(n, xpGain, `Zone ${zoneNum}`) : null;
    return { wasNew, xpResult, systemsUnlocked: zone?.systemsIntroduced || [] };
  },

  getMissionProgress(n, missionId) {
    const d = DesignerProgress.get(n);
    const cleared = Object.keys(d.zonesCleared || {})
      .filter((k) => k.startsWith(`${missionId}_z`))
      .map((k) => parseInt(k.split('_z')[1], 10));
    return {
      zonesCleared: cleared,
      highestZone: cleared.length ? Math.max(...cleared) : 0,
      completed: d.missionsCompleted?.includes(missionId),
      started: d.missionsStarted?.includes(missionId),
    };
  },

  /** Combined score for victory screen */
  calcMissionScore(stats, mission, zonesReached) {
    const systemsScore = (mission?.systemsBuilt?.length || 0) * 50;
    const zoneScore = (zonesReached || 0) * 80;
    const coinScore = (stats.collectedValue || stats.collected || 0) * 2;
    const timeBonus = stats.time > 0 ? Math.max(0, 200 - Math.floor(stats.time)) : 0;
    const collisionPenalty = (stats.collisions || 0) * 30;
    return Math.max(0, systemsScore + zoneScore + coinScore + timeBonus - collisionPenalty);
  },
};

/** Merge designer stats with legacy GameProgress for top bar */
export function getCombinedProgress(robotName) {
  const gp = GameProgress.get(robotName);
  const dp = DesignerProgress.get(robotName);
  return {
    xp: gp.xp || 0,
    designerXp: dp.designerXp || 0,
    designerLevel: DesignerProgress.designerLevel(dp.designerXp || 0),
    systemsBuilt: dp.systemsBuilt?.length || 0,
    creativityScore: dp.creativityScore || 0,
    complexityUnlocked: dp.complexityUnlocked || 1,
    missionsCompleted: dp.missionsCompleted?.length || 0,
  };
}
