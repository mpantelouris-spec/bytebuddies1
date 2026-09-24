/**
 * MissionWorldKit — single orchestrator for mission arena graphics (CodeRacer parity).
 */
import * as THREE from 'three';
import { resolveArenaTheme } from '../../services/sim-visual-polish.js';
import { buildChassisRoute } from '../ArenaBuilderCore.js';
import { addHorizonSilhouette } from '../ArenaSceneryKit.js';
import { isCarChassis } from '../../data/car-racing-tracks.js';
import { initScenePerfBudget } from '../../racing/mk-tracks/TrackPerformanceKit.js';
import { buildTrackWorld, populateTrackScenery, countTrackWorldProps } from '../../racing/mk-tracks/TrackWorldBuilder.js';
import { applyMissionFamilySpec, getMissionFamilySpec } from './MissionFamilyVisualSpec.js';
import { applyMissionRoutePresentation } from './MissionRouteKit.js';
import { enrichMissionWorldGltf } from './MissionGltfScatter.js';
import { getMissionTrackKey, registerMissionWorldRecipes } from './MissionWorldRecipes.js';
import { placeMissionHero } from './MissionHeroKit.js';
import { applyMissionVisualDressing } from './MissionVisualDressing.js';
import { getMissionVisual, getMissionArtDirection } from './MissionVisualBibleV2.js';
import { applyUndulatingGroundOverlay } from '../ArenaBroadcastKit.js';
import { isAerialArenaType } from '../aerial-world/AerialCourseRecipes.js';
import { applyMissionVisuals } from '../MissionVisualDirector.js';
import { applyMissionKidClarity } from './MissionKidClarity.js';
import { installGoldCrawlerChapter } from './RobotChapterGoldKit.js';
import { installSecurityBotChapter } from './SecurityBotArenaKit.js';
import { installPrimaryStudioChapter } from './PrimaryStudioArenaKit.js';
import { installMissionReferenceQuality } from './MissionReferenceQualityKit.js';
import { installPremiumGroundScenery } from './PremiumKidArenaKit.js';
import { isPrimaryStudioChassis, kidSafeText } from '../../data/primary-robot-studio.js';

function resolveEnvId(challenge, arenaType) {
  const art = getMissionArtDirection(challenge);
  if (art) return art.environmentId;
  if (challenge?.environmentId && challenge.environmentId !== 'rainbow_road') {
    return challenge.environmentId;
  }
  const key = `${arenaType} ${challenge?.cat || ''}`;
  if (/underwater|coral|reef|trench|kelp|atlantis|mariana|shipwreck/i.test(key)) return 'underwater';
  if (/mars|martian|alien|desert_rally|space_corridor|alien_planet/i.test(key)) return 'martian';
  if (/cyber|shadow|museum|ninja|neon/i.test(key)) return 'cyber_ninja';
  if (/drone|sky|cloud|flight|jet|aerial|hover|warp/i.test(key)) return 'sky_aerial';
  if (/fire|hospital|snow|rescue|emergency|med/i.test(key)) return 'emergency';
  if (/spider|climb|pipeline|web/i.test(key)) return 'spider_climber';
  if (/combat|boxing|colosseum|striker|battle/i.test(key)) return 'boxing_mech';
  if (/flappy|birdbot/i.test(key)) return 'flappy';
  if (/sandbox|custom|checkpoint/i.test(key)) return 'sandbox';
  if (/factory|warehouse|industrial|mine|auto_factory|security|crystal/i.test(key)) return 'industrial';
  return 'industrial';
}

function computeMissionBounds(curve) {
  let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
  for (let i = 0; i <= 40; i++) {
    const p = curve.getPoint(i / 40);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z);
    maxZ = Math.max(maxZ, p.z);
  }
  return {
    cx: (minX + maxX) / 2,
    cz: (minZ + maxZ) / 2,
    camMinZ: minZ - 14,
    camMaxZ: maxZ + 14,
    camMaxX: Math.max(24, maxX + 10),
    floorLen: maxZ - minZ + 24,
  };
}

/**
 * Build full mission world — call once per chassis / campaign mission.
 */
export function buildMissionWorld(scene, arenaType, challenge) {
  if (scene.userData.combatMode || scene.userData.flappyMode || scene.userData.biomeAAA) return;
  if (scene.userData.aerialWorldBuilt || scene.userData.skipMissionWorld) return;
  const primaryStudioWorld = challenge?.isChassisMode && isPrimaryStudioChassis(challenge?.chassisId)
    && arenaType !== 'flappy_bird'
    && arenaType !== 'robot_football'
    && arenaType !== 'robot_fight';
  if (isAerialArenaType(arenaType)) return;
  if (!challenge?.isChassisMode && !challenge?.isRobotMission) return;

  const chassisId = challenge.chassisId || '';
  if ((isCarChassis(chassisId) && !isPrimaryStudioChassis(chassisId)) || chassisId === 'footballbot') return;
  if (scene.userData.missionWorldBuilt) return;

  try {
  const isSecurityBot = challenge?.chassisId === 'securitybot' && challenge?.isChassisMode;
  const isPrimaryStudio = challenge?.isChassisMode && isPrimaryStudioChassis(challenge.chassisId);
  const envId = isPrimaryStudio
    ? (challenge.environmentId || 'sandbox')
    : (isSecurityBot ? 'sandbox' : resolveEnvId(challenge, arenaType));
  const clarity = applyMissionKidClarity(scene, challenge);
  scene.userData.environmentId = envId;
  scene.userData.chassisModeChallenge = challenge.isChassisMode ? challenge : scene.userData.chassisModeChallenge;
  scene.userData.missionWorldKit = true;

  const theme = scene.userData.arenaTheme || resolveArenaTheme(arenaType, challenge);
  const visualSpec = getMissionVisual(challenge, envId);
  const isCrawlerGold = clarity.chassisId === 'crawler';
  const routeTheme = {
    path: isCrawlerGold ? 0xa0522d : (visualSpec.accent ?? theme.accent ?? 0x3b82f6),
    glow: isCrawlerGold ? 0xfbbf24 : (visualSpec.accent ?? theme.accent ?? 0x06b6d4),
    goal: 0x22c55e,
    goalLabel: kidSafeText(visualSpec.goalLabel || challenge.shortName || challenge.modeName || challenge.name || 'Finish'),
    goalDescription: kidSafeText(challenge.desc || visualSpec.goalDescription || 'Reach the glowing finish pad'),
  };

  if (challenge.isChassisMode && !scene.userData._chassisCurve) {
    buildChassisRoute(scene, challenge, routeTheme);
  }

  const curve = scene.userData._chassisCurve;
  if (!curve) {
    console.warn('[MissionWorld] no route curve — skipping world scatter', arenaType, challenge?.id);
    return;
  }

  if (!isSecurityBot && !isPrimaryStudio) {
    applyMissionFamilySpec(scene, envId, challenge);
  } else {
    scene.background = new THREE.Color(challenge.studioSky || 0x87ceeb);
    scene.fog = new THREE.Fog(challenge.studioFog || clarity.fog || 0xb8d4e8, clarity.fogNear ?? 55, clarity.fogFar ?? 165);
    scene.userData.horizonKey = challenge.studioFloorKind || clarity.horizonKey || 'lab_grid';
    scene.userData.skipSoftEnvironment = true;
  }
  scene.userData.cameraMode = clarity.camera;
  scene.userData.missionCameraPreset = { ...clarity.cameraRig };
  if (scene.fog && !isSecurityBot && !isPrimaryStudio) {
    scene.fog.color.setHex(clarity.fog);
    scene.fog.near = clarity.fogNear;
    scene.fog.far = clarity.fogFar;
  }

  if (!isSecurityBot && !isPrimaryStudio && !scene.getObjectByName('HorizonSilhouette')) {
    const horizonKey = scene.userData.horizonKey
      || (envId === 'hybrid_race_sky' ? 'cyber_ninja' : envId);
    addHorizonSilhouette(scene, horizonKey);
  }
  if (isPrimaryStudio && !scene.getObjectByName('HorizonSilhouette')) {
    const hk = challenge.studioFloorKind || clarity.floorKind || 'sandbox';
    const silhouetteKey = hk === 'open_sky' || hk === 'city_plaza' ? 'sky_aerial' : hk;
    addHorizonSilhouette(scene, silhouetteKey);
  }

  applyMissionRoutePresentation(scene, curve, routeTheme, challenge, envId);

  const primaryStudioInstalled = isPrimaryStudio && installPrimaryStudioChapter(scene, challenge, curve);
  const goldCrawlerInstalled = !primaryStudioInstalled && installGoldCrawlerChapter(scene, challenge, curve);
  const securityBotInstalled = !primaryStudioInstalled && installSecurityBotChapter(scene, challenge, curve);
  if (!goldCrawlerInstalled && !securityBotInstalled && !primaryStudioInstalled) {
    installMissionReferenceQuality(scene, challenge, curve);
  }
  if (!goldCrawlerInstalled && !securityBotInstalled && !primaryStudioInstalled) {
    installPremiumGroundScenery(scene, challenge, curve);
  }

  const spec = getMissionFamilySpec(envId);
  if (envId === 'martian' && !scene.getObjectByName('MissionTerrainOverlay')) {
    applyUndulatingGroundOverlay(scene, spec);
  }

  const bounds = computeMissionBounds(curve);
  scene.userData.arenaBounds = scene.userData.arenaBounds || bounds;

  let world = scene.getObjectByName('MissionWorldRoot');
  if (!world) {
    world = new THREE.Group();
    world.name = 'MissionWorldRoot';
    scene.add(world);
  }

  registerMissionWorldRecipes();
  const missionTrackKey = getMissionTrackKey(envId);
  const gltfTrackId = spec.gltfTrack;
  const perf = initScenePerfBudget(scene);
  const hw = 4;

  let primitiveCount = 0;
  if (!clarity) {
    buildTrackWorld(world, curve, hw, bounds, missionTrackKey, perf, scene, 0);
    primitiveCount = populateTrackScenery(world, curve, hw, bounds, missionTrackKey, perf, scene, 0);
  }

  scene.userData.sceneryPopulated = !!clarity || !!visualSpec.look || primitiveCount >= 20;
  scene.userData.trackLoading = false;
  scene.userData.missionWorldBuilt = true;

  console.log('[MissionWorld]', envId, arenaType, challenge?.id || challenge?.shortName, {
    primitives: primitiveCount,
    gltfTrack: gltfTrackId,
    missionTrack: missionTrackKey,
    route: true,
    bloom: scene.userData.raceVisual?.bloom,
  });

  if (!clarity) enrichMissionWorldGltf(scene, world, curve, envId).then((placed) => {
    const total = countTrackWorldProps(world);
    console.log('[MissionWorld] complete', envId, {
      primitives: primitiveCount,
      gltfPlaced: placed,
      totalProps: total,
    });
    scene.userData.sceneryPopulated = total >= 25 || primitiveCount >= 30;
  });
  } catch (err) {
    console.error('[MissionWorld] build failed — sim continues with base arena', arenaType, err);
    scene.userData.missionWorldBuilt = true;
    scene.userData.missionWorldKit = true;
  }
}
