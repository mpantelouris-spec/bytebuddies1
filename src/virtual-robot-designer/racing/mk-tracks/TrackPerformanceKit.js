/**
 * TrackPerformanceKit.js — Per-tier budgets for CodeRacer Mario Kart–style worlds.
 */
import { detectQualityTier, QUALITY_PRESETS } from '../../services/art-direction.js';

const BUDGETS = {
  low: {
    propMult: 0.78,
    maxScatterPerSide: 18,
    maxBuildings: 8,
    maxAnimals: 4,
    roadSegments: 280,
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
  return {
    ...base,
    tier,
    worldLod,
    trackLod: q.trackLod ?? 0.55,
    particleCount: Math.min(q.particleCount ?? 40, tier === 'low' ? 24 : 80),
    pbrTexSize: q.pbrTexSize ?? 512,
    propMult: base.propMult * (0.85 + worldLod * 0.2),
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

/** Scale an integer count by prop multiplier (min 1 when base > 0). */
export function scaledCount(base, propMult) {
  if (!base) return 0;
  return Math.max(1, Math.round(base * propMult));
}
