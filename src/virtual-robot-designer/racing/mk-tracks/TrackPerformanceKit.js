/**
 * TrackPerformanceKit.js — Per-tier budgets for CodeRacer Mario Kart–style worlds.
 */
import { detectQualityTier, QUALITY_PRESETS, getStudioDeviceProfile } from '../../services/art-direction.js';

const BUDGETS = {
  low: {
    propMult: 0.42,
    maxScatterPerSide: 8,
    maxBuildings: 3,
    maxAnimals: 1,
    roadSegments: 140,
    particles: false,
    bloom: false,
    waterAnim: false,
    shadows: false,
    maxDrawCalls: 48,
    coinCount: 20,
    torchLights: false,
    useInstancing: true,
  },
  medium: {
    propMult: 1.0,
    maxScatterPerSide: 32,
    maxBuildings: 99,
    maxAnimals: 8,
    roadSegments: 440,
    particles: true,
    bloom: true,
    waterAnim: true,
    shadows: false,
    maxDrawCalls: 128,
    coinCount: 42,
    torchLights: true,
    useInstancing: true,
  },
  high: {
    propMult: 1.15,
    maxScatterPerSide: 40,
    maxBuildings: 99,
    maxAnimals: 99,
    roadSegments: 520,
    particles: true,
    bloom: true,
    waterAnim: true,
    shadows: false,
    maxDrawCalls: 120,
    coinCount: 42,
    torchLights: true,
    useInstancing: false,
  },
};

/** Resolve perf budget from tier name or scene quality preset. */
export function getTrackPerfBudget(tierOrScene) {
  let tier = 'medium';
  if (typeof tierOrScene === 'string') tier = tierOrScene;
  else if (tierOrScene?.userData?.qualityTier) tier = tierOrScene.userData.qualityTier;
  const base = BUDGETS[tier] || BUDGETS.medium;
  const q = QUALITY_PRESETS[tier] || QUALITY_PRESETS.medium;
  const worldLod = q.worldLod ?? 0.5;
  const profile = typeof window !== 'undefined' ? getStudioDeviceProfile() : { kind: 'desktop', lowPower: false };
  const handheld = profile.kind === 'tablet' || profile.kind === 'phone';
  const shrink = handheld ? 0.55 : (profile.lowPower ? 0.78 : 1);
  return {
    ...base,
    tier,
    worldLod: worldLod * (handheld ? 0.7 : 1),
    trackLod: (q.trackLod ?? 0.55) * (handheld ? 0.75 : 1),
    particleCount: handheld ? 0 : Math.min(q.particleCount ?? 40, tier === 'low' ? 12 : 80),
    pbrTexSize: handheld ? 256 : (q.pbrTexSize ?? 512),
    propMult: base.propMult * (0.85 + worldLod * 0.2) * shrink,
    maxScatterPerSide: handheld ? Math.min(base.maxScatterPerSide, 6) : base.maxScatterPerSide,
    maxBuildings: handheld ? Math.min(base.maxBuildings, 2) : base.maxBuildings,
    particles: handheld ? false : base.particles,
    roadSegments: handheld ? Math.min(base.roadSegments, 120) : base.roadSegments,
  };
}

/** Apply runtime downgrade when FPS is poor (halve props / disable particles). */
export function downgradeTrackPerfBudget(budget) {
  return {
    ...budget,
    propMult: budget.propMult * 0.5,
    maxScatterPerSide: Math.max(4, Math.floor((budget.maxScatterPerSide ?? 8) * 0.5)),
    particles: false,
    waterAnim: false,
    bloom: false,
    coinCount: Math.max(12, Math.floor(budget.coinCount * 0.5)),
    maxDrawCalls: Math.max(36, Math.floor(budget.maxDrawCalls * 0.6)),
    useInstancing: true,
    downgraded: true,
  };
}

export function initScenePerfBudget(scene) {
  const tier = scene?.userData?.qualityTier || detectQualityTier();
  const budget = getTrackPerfBudget(tier);
  scene.userData.trackPerfBudget = budget;
  return budget;
}

/** True when the first paint must stay cheap (tablets, phones, Chromebooks). */
export function isSlimTrackWorld(scene) {
  if (scene?.userData?.lowPower) return true;
  if (scene?.userData?.qualityTier === 'low') return true;
  try {
    const profile = getStudioDeviceProfile();
    return profile.lowPower || profile.kind === 'tablet' || profile.kind === 'phone' || profile.kind === 'chromebook';
  } catch {
    return false;
  }
}

/** Scale an integer count by prop multiplier (min 1 when base > 0). */
export function scaledCount(base, propMult) {
  if (!base) return 0;
  return Math.max(1, Math.round(base * propMult));
}
