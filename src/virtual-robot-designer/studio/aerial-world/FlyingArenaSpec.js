/**
 * FlyingArenaSpec — locked visual bibles for 9 sky flyers × 10 missions.
 * Shape-not-colour: each chassis has a unique vista, sky, gates, and spawn.
 */
export const FLYING_ARENA_SPEC_VERSION = '2026-09-17-flying-ue5-premium-wire';
import { FLYING_MISSION_SPECS } from './FlyingMissionSpecs.js';
import { getKidFlyingBibleOverrides } from './KidFriendlyFlyingKit.js';
import { PREMIUM_ENVIRONMENT_IDS } from './PremiumFlyingEnvironmentKit.js';

const MISSION_BY_MODE = new Map(Object.values(FLYING_MISSION_SPECS).map(spec => [`${spec.chassisId}:${spec.mode}`, spec]));

const STANDARD_MODES = [
  'drone_canyon', 'canyon_flight', 'storm_cloud', 'cloud_race', 'space_orbit',
  'flight_rings', 'jet_stunt', 'rooftop_delivery', 'typhoon', 'warp_gate',
];

const RACING_MODES = [
  'rainbow_road', 'drone_canyon', 'sunny_circuit', 'cloud_race', 'dragon_skyway',
  'flight_rings', 'volcano_drift', 'storm_cloud', 'street_grand_prix', 'warp_gate',
];

/** @type {Record<string, import('./FlyingArenaKit.js').FlyingBible>} */
export const FLYER_VISUAL_BIBLES = {
  drone: {
    label: 'Gothic clockwork spire',
    aerialVista: 'gothic_clockwork_spire',
    sky: { top: '#1e293b', mid: '#64748b', horizon: '#fbbf24', fog: '#78716c', near: 85, far: 300 },
    gateColors: { primary: 0x00d4ff, secondary: 0xfbbf24, final: 0x22c55e },
    spawnKind: 'sky_academy_arch',
    spawnSkyIslandModes: [],
    goldenHour: true,
    bloom: 0.32,
    parallaxClouds: true,
    cloudPillars: 6,
    islandScatter: false,
    gltfCitadel: false,
    allowRecipeHero: true,
    modeRecipes: STANDARD_MODES,
    robotScreenFraction: 0.28,
  },
  helicopter: {
    label: 'Venetian midnight canal',
    aerialVista: 'venetian_midnight_canal',
    sky: { top: '#0c1445', mid: '#1e3a5f', horizon: '#334155', fog: '#1e293b', near: 90, far: 280 },
    gateColors: { primary: 0xfbbf24, secondary: 0x1e40af, final: 0x22c55e },
    spawnKind: 'offshore_platform',
    goldenHour: false,
    bloom: 0.21,
    parallaxClouds: false,
    cloudPillars: 0,
    islandScatter: false,
    modeRecipes: STANDARD_MODES,
    robotScreenFraction: 0.28,
  },
  hoverbot: {
    label: 'Cybernetic assembly line',
    aerialVista: 'cybernetic_assembly_line',
    sky: { top: '#1c1917', mid: '#44403c', horizon: '#78716c', fog: '#57534e', near: 95, far: 300 },
    gateColors: { primary: 0xa78bfa, secondary: 0x22d3ee, final: 0x22c55e },
    spawnKind: 'repulsor_gate',
    goldenHour: false,
    bloom: 0.22,
    parallaxClouds: false,
    cloudPillars: 0,
    islandScatter: false,
    modeRecipes: STANDARD_MODES,
    robotScreenFraction: 0.28,
  },
  jetplane: {
    label: 'Low-orbit stealth carrier',
    aerialVista: 'low_orbit_stealth_carrier',
    sky: { top: '#020617', mid: '#0f172a', horizon: '#1e40af', fog: '#0f172a', near: 120, far: 400 },
    gateColors: { primary: 0x3b82f6, secondary: 0xef4444, final: 0x22c55e },
    spawnKind: 'spawn_sky_island',
    spawnSkyIslandModes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    goldenHour: true,
    bloom: 0.24,
    parallaxClouds: false,
    cloudPillars: 0,
    islandScatter: false,
    useReferenceVista: true,
    fov: 48,
    modeRecipes: STANDARD_MODES,
    robotScreenFraction: 0.28,
  },
  steathjet: {
    label: 'Storm obsidian citadel',
    aerialVista: 'obsidian_citadel',
    sky: { top: '#0a0a0f', mid: '#1e1b4b', horizon: '#312e81', fog: '#1e293b', near: 70, far: 220 },
    gateColors: { primary: 0x22c55e, secondary: 0x64748b, final: 0x22c55e },
    spawnKind: 'hangar_mouth',
    goldenHour: false,
    bloom: 0.2,
    parallaxClouds: false,
    cloudPillars: 0,
    islandScatter: false,
    modeRecipes: STANDARD_MODES,
    robotScreenFraction: 0.28,
  },
  aerobat: {
    label: 'Overgrown monastic ruins',
    aerialVista: 'monastic_ruins',
    sky: { top: '#94a3b8', mid: '#cbd5e1', horizon: '#e2e8f0', fog: '#cbd5e1', near: 100, far: 320 },
    gateColors: { primary: 0xfb923c, secondary: 0xf8fafc, final: 0x22c55e },
    spawnKind: 'airshow_banner',
    goldenHour: true,
    bloom: 0.23,
    parallaxClouds: false,
    cloudPillars: 0,
    islandScatter: false,
    modeRecipes: STANDARD_MODES,
    robotScreenFraction: 0.28,
  },
  racedrone: {
    label: 'Neon server necropolis',
    aerialVista: 'neon_server_necropolis',
    sky: { top: '#0a0a0a', mid: '#0f172a', horizon: '#1e293b', fog: '#0a0a0f', near: 55, far: 200 },
    gateColors: { primary: 0x00ffff, secondary: 0xec4899, final: 0x22c55e },
    spawnKind: 'neon_gantry',
    goldenHour: false,
    bloom: 0.38,
    parallaxClouds: false,
    cloudPillars: 0,
    islandScatter: false,
    raceRibbon: true,
    modeRecipes: RACING_MODES,
    robotScreenFraction: 0.28,
  },
  hoverracer: {
    label: 'Quantum reactor core',
    aerialVista: 'quantum_reactor_core',
    sky: { top: '#1e1b4b', mid: '#4c1d95', horizon: '#06b6d4', fog: '#312e81', near: 60, far: 200 },
    gateColors: { primary: 0xa855f7, secondary: 0x22d3ee, final: 0x22c55e },
    spawnKind: 'warp_gate_arch',
    goldenHour: false,
    bloom: 0.24,
    parallaxClouds: false,
    cloudPillars: 0,
    islandScatter: false,
    raceRibbon: true,
    modeRecipes: RACING_MODES,
    robotScreenFraction: 0.28,
  },
  rescuedrone: {
    label: 'Bioluminescent deep trench',
    aerialVista: 'bioluminescent_trench',
    sky: { top: '#020617', mid: '#083344', horizon: '#164e63', fog: '#0c4a6e', near: 80, far: 260 },
    gateColors: { primary: 0xf97316, secondary: 0x22c55e, final: 0x22c55e },
    spawnKind: 'emergency_hq',
    goldenHour: false,
    bloom: 0.21,
    parallaxClouds: false,
    cloudPillars: 0,
    islandScatter: false,
    lowAltitude: true,
    modeRecipes: STANDARD_MODES,
    robotScreenFraction: 0.28,
  },
};

const FLYING_CHASSIS = new Set(Object.keys(FLYER_VISUAL_BIBLES));

const FLYING_MISSION_PREFIXES = {
  jetplane: 'jetplane',
  drone: 'drone',
  helicopter: 'helicopter',
  hoverbot: 'hoverbot',
  steathjet: 'steathjet',
  aerobat: 'aerobat',
  racedrone: 'racedrone',
  hoverracer: 'hoverracer',
  rescuedrone: 'rescuedrone',
};

export function isFlyingChassis(chassisId) {
  return FLYING_CHASSIS.has(chassisId);
}

/** Resolve flyer chassis from challenge, robot config, or mission id prefix. */
export function resolveFlyingChassisId(challenge, robotConfig) {
  const fromChallenge = challenge?.chassisId || challenge?.modeSpec?.chassisId;
  if (fromChallenge && isFlyingChassis(fromChallenge)) return fromChallenge;
  const fromRobot = robotConfig?.chassisId;
  if (fromRobot && isFlyingChassis(fromRobot)) return fromRobot;
  const id = String(challenge?.id || '');
  for (const [prefix, chassisId] of Object.entries(FLYING_MISSION_PREFIXES)) {
    if (id.startsWith(`${prefix}_`)) return chassisId;
  }
  return fromChallenge || fromRobot || null;
}

export function getFlyingVisualBible(chassisId) {
  return FLYER_VISUAL_BIBLES[chassisId] || null;
}

export function getFlyingModeRecipe(chassisId, modeIndex) {
  const bible = getFlyingVisualBible(chassisId);
  if (!bible) return null;
  const mode = Math.max(1, Math.min(10, Number(modeIndex) || 1));
  return bible.modeRecipes[mode - 1] || bible.modeRecipes[0];
}

export function resolvePremiumAerialVista(chassisId, mode) {
  if (chassisId === 'hoverbot' && mode === 10) return 'victorian_grand_library';
  return FLYER_VISUAL_BIBLES[chassisId]?.aerialVista ?? 'gothic_clockwork_spire';
}

/** Showcase slots from UE5 ultra-spec §G — overrides bible when set. */
const PREMIUM_VISTA_MODE_OVERRIDES = {
  'jetplane:5': 'quantum_reactor_core',
  'hoverbot:8': 'cybernetic_assembly_line',
  'racedrone:10': 'neon_server_necropolis',
  'jetplane:10': 'low_orbit_stealth_carrier',
};

export function resolveFlyingPremiumVistaId(chassisId, mode, mission) {
  const key = `${chassisId}:${mode}`;
  if (mission?.premiumVista && isPremiumFlyingVista(mission.premiumVista)) {
    return mission.premiumVista;
  }
  if (PREMIUM_VISTA_MODE_OVERRIDES[key]) return PREMIUM_VISTA_MODE_OVERRIDES[key];
  const base = getFlyingVisualBible(chassisId)?.aerialVista;
  const baseIdx = PREMIUM_ENVIRONMENT_IDS.indexOf(base);
  if (baseIdx >= 0) {
    return PREMIUM_ENVIRONMENT_IDS[(baseIdx + mode - 1) % PREMIUM_ENVIRONMENT_IDS.length];
  }
  return PREMIUM_ENVIRONMENT_IDS[(mode - 1) % PREMIUM_ENVIRONMENT_IDS.length];
}

/** Vista id used for PremiumEnvironmentArtKit + UE5 post (never legacy cloud_sea from mission JSON). */
export function getContractEnvironmentVistaId(contract) {
  if (!contract) return 'gothic_clockwork_spire';
  return contract.environmentVistaId
    || contract.bible?.aerialVista
    || resolveFlyingPremiumVistaId(contract.chassisId, contract.mode, contract.mission);
}

export function isPremiumFlyingVista(vista) {
  return PREMIUM_ENVIRONMENT_IDS.includes(vista);
}

export function getFlyingArenaContract(challenge, robotConfig) {
  const chassisId = resolveFlyingChassisId(challenge, robotConfig);
  const family = getFlyingVisualBible(chassisId);
  if (!family) return null;
  const direct = FLYING_MISSION_SPECS[challenge?.id];
  const mode = direct?.mode || Math.max(1, Math.min(10, Number(challenge?.modeIndex || challenge?.modeSpec?.modeNumber) || 1));
  const mission = direct || MISSION_BY_MODE.get(`${chassisId}:${mode}`);
  const environmentVistaId = resolveFlyingPremiumVistaId(chassisId, mode, mission);
  const premiumUE5 = isPremiumFlyingVista(environmentVistaId);
  const kidOverrides = premiumUE5 ? {} : getKidFlyingBibleOverrides(chassisId);
  const bible = {
    ...family,
    ...kidOverrides,
    aerialVista: environmentVistaId,
    spawnKind: mission?.spawnKind ?? family.spawnKind,
    allowRecipeHero: false,
    sky: premiumUE5
      ? { ...family.sky }
      : (mission?.sky ? { ...family.sky, ...mission.sky } : family.sky),
    bloom: premiumUE5 ? (family.bloom ?? 0.28) : (mission?.bloom ?? family.bloom),
    goldenHour: premiumUE5 ? family.goldenHour : (mission?.goldenHour ?? family.goldenHour),
    parallaxClouds: premiumUE5 ? false : (mission?.parallaxClouds ?? family.parallaxClouds),
  };
  const modeRecipe = mission.recipeId;
  return {
    version: FLYING_ARENA_SPEC_VERSION,
    chassisId,
    mode,
    bible,
    mission,
    environmentVistaId,
    kidFriendly: !premiumUE5,
    premiumUE5,
    arenaType: modeRecipe || challenge?.arenaType,
    useSpawnSkyIsland: mission.spawnKind === 'spawn_sky_island',
    useReferenceVista: premiumUE5 ? false : (bible.useReferenceVista === true),
  };
}
