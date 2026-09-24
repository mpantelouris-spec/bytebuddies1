/**
 * AerialWorldKit — orchestrator for sky_aerial flight courses.
 */
import * as THREE from 'three';
import { getPrimaryStudioArena } from '../../data/primary-robot-studio.js';
import { getArenaBlueprint } from '../../data/primary-arena-layouts.js';
import { installPrimaryStudioChapter } from '../mission-world/PrimaryStudioArenaKit.js';
import { initFamilyScene, arenaMover, updateMissionMinimap } from '../ArenaBuilderCore.js';
import { getMissionFamilySpec } from '../mission-world/MissionFamilyVisualSpec.js';
import { installTrackSky } from '../../racing/mk-tracks/TrackSkyKit.js';
import { buildTrackWorld, populateTrackScenery, countTrackWorldProps } from '../../racing/mk-tracks/TrackWorldBuilder.js';
import { enrichTrackWorldGltf } from '../../racing/mk-tracks/TrackGltfScatter.js';
import { initScenePerfBudget } from '../../racing/mk-tracks/TrackPerformanceKit.js';
import { getAerialRecipe, isAerialArenaType } from './AerialCourseRecipes.js';
import { addParallaxCloudLayers, installGoldenHourSky } from './AerialSkyKit.js';
import { buildRealisticCloudColumn } from './FlyingArenaMaterialKit.js';
import { placeAerialGates, placeGroundTargets } from './AerialRingGateKit.js';
import { placeAerialHero } from './AerialHeroKit.js';
import { scatterAerialIslands } from './AerialIslandKit.js';
import {
  enrichAerialFloatingIslands,
  installAerialCinematicAtmosphere,
  installAerialCupLandmarks,
  scatterDistantSilhouetteIslands,
} from './AerialGltfEnrichKit.js';
import { getMissionCameraPreset } from '../ArenaBroadcastKit.js';
import { installAerialDifficulty } from './AerialDifficultyKit.js';
import { getMissionVisual } from '../mission-world/MissionVisualBibleV2.js';
import { applyMissionKidClarity, CHASSIS_VISUAL_DNA } from '../mission-world/MissionKidClarity.js';
import { installPremiumAerialScenery } from '../mission-world/PremiumKidArenaKit.js';
import {
  applyKidMissionTeachingProps,
  classifyKidMissionFeature,
} from '../mission-world/MissionKidTeachingProps.js';
import { getGoldChapterMode } from '../mission-world/RobotChapterDeepSpec.js';
import { installGoldJetChapter } from '../mission-world/RobotChapterGoldKit.js';
import {
  applyAerialMissionRoute,
  getAerialMissionComposition,
  installAerialMissionComposition,
  publishAerialQualityMetrics,
} from './AerialMissionCompositionKit.js';
import { installAerialReferenceVista } from './AerialReferenceVistaKit.js';
import { getFlyingArenaContract, resolveFlyingChassisId } from './FlyingArenaSpec.js';
import {
  applyFlyingRecipeContract,
  installFlyingArenaIdentity,
} from './FlyingArenaKit.js';
import {
  clearFlyingArenaLayers,
  installFlyingChassisSetPiece,
  applyFlyingModeSplineVariation,
} from './FlyingChassisSetPiece.js';

function buildSplineFromRecipe(recipe) {
  const s = recipe.spline || {};
  const len = s.length || 180;
  const count = s.count || 14;
  const pts = [];

  switch (s.kind) {
    case 'canyon_slalom':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const z = s.start[2] + (s.end[2] - s.start[2]) * t;
        const x = s.start[0] + (s.end[0] - s.start[0]) * t + Math.sin(t * Math.PI * 3.2) * 6 * (1 - t * 0.25);
        const y = s.start[1] + (s.end[1] - s.start[1]) * t + Math.sin(t * Math.PI * 4) * 2;
        pts.push(new THREE.Vector3(x, y, z));
      }
      break;
    case 'straight':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        pts.push(new THREE.Vector3(
          s.start[0] + (s.end[0] - s.start[0]) * t,
          s.start[1] + Math.sin(t * Math.PI * 2) * 1,
          s.start[2] + (s.end[2] - s.start[2]) * t,
        ));
      }
      break;
    case 'dive_targets':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const z = -len * t;
        let y = s.start[1];
        if (i % 2 === 1 && i < count - 2) y = 6 + (i % 4) * 4;
        else y = s.start[1] - t * (s.start[1] - s.end[1]) * 0.6;
        pts.push(new THREE.Vector3(Math.sin(t * Math.PI * 2) * 4, y, z));
      }
      break;
    case 'figure8':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const a = t * Math.PI * 4;
        pts.push(new THREE.Vector3(
          Math.sin(a) * 18,
          s.centerY + Math.sin(a * 2) * (s.amplitude ?? 10),
          -len * t,
        ));
      }
      break;
    case 'spiral_climb':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const a = t * Math.PI * 3;
        pts.push(new THREE.Vector3(
          Math.cos(a) * 12 * (1 - t * 0.3),
          s.startY + s.climb * t,
          Math.sin(a) * 12 * (1 - t * 0.3) - len * t * 0.5,
        ));
      }
      break;
    case 'rooftop_stops':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const yMin = s.yRange?.[0] ?? 26;
        const yMax = s.yRange?.[1] ?? 34;
        pts.push(new THREE.Vector3(
          Math.sin(t * Math.PI * 2.5) * 8,
          yMin + (yMax - yMin) * (0.5 + Math.sin(t * Math.PI * 3) * 0.5),
          -len * t,
        ));
      }
      break;
    case 'coast_arc':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const yMin = s.yRange?.[0] ?? 18;
        const yMax = s.yRange?.[1] ?? 28;
        pts.push(new THREE.Vector3(
          Math.sin(t * Math.PI) * 25,
          yMin + Math.sin(t * Math.PI) * (yMax - yMin),
          -len * t,
        ));
      }
      break;
    case 'wind_tunnel':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        pts.push(new THREE.Vector3(
          Math.sin(t * Math.PI * 2.8) * 5,
          s.y ?? 22,
          -len * t,
        ));
      }
      break;
    case 'storm_eye':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const r = t < 0.65 ? 35 * (1 - t * 0.5) : 8;
        const a = t * Math.PI * 2.5;
        pts.push(new THREE.Vector3(Math.cos(a) * r, s.y ?? 24, -len * t));
      }
      break;
    case 'capstone_sections':
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        let y = 16 + Math.sin(t * Math.PI * 3) * 8;
        if (t > 0.65 && t < 0.8) y = 8 + (t - 0.65) * 200;
        pts.push(new THREE.Vector3(Math.sin(t * Math.PI * 4) * 10, y, -len * t));
      }
      break;
    default:
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        pts.push(new THREE.Vector3(Math.sin(t * Math.PI * 2) * 5, 18, -len * t));
      }
  }
  return new THREE.CatmullRomCurve3(pts);
}

function buildFloorProjectionCurve(curve, floorY) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const p = curve.getPoint(i / 40);
    pts.push(new THREE.Vector3(p.x, floorY, p.z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function applyAerialPost(scene) {
  const spec = scene.userData.missionVisualBible || getMissionFamilySpec('sky_aerial');
  const post = spec.post || {};
  const hybrid = spec.environmentId === 'hybrid_race_sky';
  scene.userData.raceVisual = {
    bloom: Math.min(post.bloom ?? (hybrid ? 0.36 : 0.28), hybrid ? 0.4 : 0.34),
    threshold: post.threshold ?? 0.82,
    radius: post.radius ?? 0.2,
    grade: hybrid
      ? { s: 1.24, c: 1.1, g: [1.04, 0.98, 1.08] }
      : { s: 1.16, c: 1.08, g: [1.04, 1.0, 1.05] },
  };
  scene.userData.expMood = hybrid ? 0.98 : 1.1;
}

function buildMidground(scene, curve, recipe) {
  const g = new THREE.Group();
  g.name = 'AerialMidground';
  const len = recipe.spline?.length || 180;
  // Mode kits + vista already place heroes — extra pillars read as beige spam in-flight.
  if (recipe.cloudPillars && !scene.userData.flyingArenaActive) {
    for (let i = 0; i < recipe.cloudPillars; i++) {
      const t = (i + 1) / (recipe.cloudPillars + 1);
      const p = curve.getPoint(t);
      const side = i % 2 === 0 ? -1 : 1;
      buildRealisticCloudColumn(g, p.x + side * 10, p.y - 10, p.z, `CloudPillar${i}`, 18 + (i % 3) * 4, 5 + (i % 2));
    }
  }
  if (recipe.tunnel && !scene.userData.flyingArenaActive) {
    const tunnelPts = [];
    for (let i = 0; i <= 40; i++) tunnelPts.push(curve.getPoint(i / 40));
    const tunnelPath = new THREE.CatmullRomCurve3(tunnelPts);
    const tunnelGeo = new THREE.TubeGeometry(tunnelPath, 80, 6, 16, false);
    const tunnelColor = recipe.tunnelColor ?? 0x06b6d4;
    const tunnel = new THREE.Mesh(
      tunnelGeo,
      new THREE.MeshStandardMaterial({
        color: tunnelColor, emissive: tunnelColor, emissiveIntensity: 0.4,
        transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false,
      }),
    );
    g.add(tunnel);
  }
  scene.add(g);
}

function buildRaceRibbon(scene, curve, recipe) {
  const spec = recipe.raceRibbon;
  if (!spec) return;
  const root = new THREE.Group();
  root.name = 'AerialRaceRibbon';
  const colors = spec.colors?.length ? spec.colors : [0x06b6d4, 0xec4899, 0xa855f7];
  const width = spec.width || 6;
  const segments = 72;
  for (let i = 0; i < segments; i++) {
    const a = curve.getPoint(i / segments);
    const b = curve.getPoint((i + 1) / segments);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const length = a.distanceTo(b) + 0.12;
    const color = colors[Math.floor(i / 6) % colors.length];
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.22, length),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.14,
        metalness: 0.12,
        roughness: 0.38,
      }),
    );
    tile.position.copy(mid);
    tile.lookAt(b);
    tile.castShadow = true;
    tile.receiveShadow = true;
    root.add(tile);
  }

  const boostCount = spec.boosts || 0;
  for (let i = 0; i < boostCount; i++) {
    const t = (i + 1) / (boostCount + 1);
    const p = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const boost = new THREE.Mesh(
      new THREE.BoxGeometry(Math.max(2.2, width * 0.55), 0.08, 3.2),
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x22d3ee,
        emissiveIntensity: 1.15,
        transparent: true,
        opacity: 0.86,
      }),
    );
    boost.position.copy(p).add(new THREE.Vector3(0, 0.18, 0));
    boost.rotation.y = Math.atan2(tangent.x, tangent.z);
    boost.userData.boostPad = true;
    root.add(boost);
  }
  scene.add(root);
}

function buildLaunchTower(scene, recipe) {
  if (!recipe.launchTower) return;
  const g = new THREE.Group();
  g.name = 'AerialLaunchTower';
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 7, 65, 12),
    new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.4, roughness: 0.5 }),
  );
  shaft.position.y = 32.5;
  g.add(shaft);
  [15, 30, 45, 60].forEach((h) => {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.5 }),
    );
    lamp.position.set(6.5, h, 0);
    g.add(lamp);
  });
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(8, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 0.8, transparent: true, opacity: 0.6 }),
  );
  flame.position.y = -2;
  g.add(flame);
  arenaMover(scene, (t) => {
    flame.scale.y = 0.9 + Math.sin(t * 4) * 0.15;
  });
  scene.add(g);
}

function buildChassisAerialVista(scene, vistaType, bounds) {
  const g = new THREE.Group();
  g.name = 'ChassisAerialVista';
  const y = bounds?.floorLen ? -42 : -42;
  const mat = (color) => new THREE.MeshStandardMaterial({
    color, roughness: 0.95, metalness: 0, transparent: true, opacity: 0.85,
  });

  switch (vistaType) {
    case 'ocean_platforms':
      const ocean = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(0x0284c7));
      ocean.rotation.x = -Math.PI / 2;
      ocean.position.y = y;
      g.add(ocean);
      [[-30, -80], [25, -120], [0, -160]].forEach(([x, z], i) => {
        const rig = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 12), mat(0x64748b));
        rig.position.set(x, y + 2, z);
        g.add(rig);
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.2, 12), mat(0xfbbf24));
        pad.position.set(x, y + 4.2, z);
        g.add(pad);
      });
      break;
    case 'carrier_deck':
      const deck = new THREE.Mesh(new THREE.BoxGeometry(80, 2, 30), mat(0x475569));
      deck.position.set(0, y + 1, -100);
      g.add(deck);
      break;
    case 'radar_dome':
      const dome = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x334155));
      dome.position.set(0, y, -90);
      g.add(dome);
      break;
    case 'coastline':
      const sea = new THREE.Mesh(new THREE.PlaneGeometry(300, 120), mat(0x0369a1));
      sea.rotation.x = -Math.PI / 2;
      sea.position.set(0, y, -110);
      g.add(sea);
      const coast = new THREE.Mesh(new THREE.BoxGeometry(300, 6, 40), mat(0x22c55e));
      coast.position.set(0, y + 3, -60);
      g.add(coast);
      break;
    case 'floating_labs':
      [[-20, -70], [18, -110], [-8, -150]].forEach(([x, z]) => {
        const plat = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 10), mat(0x94a3b8));
        plat.position.set(x, y + 8, z);
        g.add(plat);
      });
      break;
    case 'neon_ribbon':
    case 'plasma_track':
      for (let i = 0; i < 4; i++) {
        const seg = new THREE.Mesh(
          new THREE.BoxGeometry(8, 0.3, 20),
          new THREE.MeshStandardMaterial({
            color: vistaType === 'neon_ribbon' ? 0xec4899 : 0xa855f7,
            emissive: vistaType === 'neon_ribbon' ? 0xec4899 : 0xa855f7,
            emissiveIntensity: 0.35,
          }),
        );
        seg.position.set(Math.sin(i) * 15, y + 6, -60 - i * 25);
        g.add(seg);
      }
      break;
    case 'disaster_city':
      for (let i = 0; i < 5; i++) {
        const h = 8 + (i % 3) * 4;
        const ruin = new THREE.Mesh(new THREE.BoxGeometry(6 + i, h, 5), mat(0x57534e));
        ruin.position.set(-50 + i * 22, y + h / 2, -70 - (i % 2) * 15);
        g.add(ruin);
      }
      break;
    case 'cloud_sea':
    default:
      for (let i = 0; i < 8; i++) {
        const cloud = new THREE.Mesh(
          new THREE.SphereGeometry(8 + i * 0.5, 10, 8),
          mat(0xffffff),
        );
        cloud.position.set((i % 3 - 1) * 25, y + 2, -50 - i * 18);
        g.add(cloud);
      }
      break;
  }
  scene.add(g);
}

const AERIAL_GATE_COLORS = {
  drone: { primary: 0x38bdf8, secondary: 0xfbbf24 },
  helicopter: { primary: 0xfbbf24, secondary: 0x38bdf8 },
  hoverbot: { primary: 0xa78bfa, secondary: 0x22d3ee },
  jetplane: { primary: 0x3b82f6, secondary: 0xef4444 },
  steathjet: { primary: 0x22c55e, secondary: 0x1e293b },
  aerobat: { primary: 0xf97316, secondary: 0xffffff },
  racedrone: { primary: 0xec4899, secondary: 0x06b6d4 },
  rescuedrone: { primary: 0xf97316, secondary: 0x22c55e },
};

/** Build ordered checkpoints: rings, then ground bullseyes, then stunt ring, then mission pads. */
function syncFlyingCheckpoints(scene, curve, recipe) {
  const checkpoints = [];
  let index = 0;
  const push = (x, y, z, type, label) => {
    checkpoints.push({ x, y, z, index: index++, type, label, passed: false });
  };

  (scene.userData.aerialGates || []).forEach((ring, i) => {
    push(ring.position.x, ring.position.y, ring.position.z, 'ring', String(i + 1));
  });

  (scene.userData.aerialGroundTargets || []).forEach((target, i) => {
    const flyY = target.userData.flyThroughY ?? target.position.y + 8;
    push(target.position.x, flyY, target.position.z, 'target', `🎯${i + 1}`);
  });

  const stunt = scene.getObjectByName('aerial_stunt_ring');
  if (stunt) {
    push(stunt.position.x, stunt.position.y, stunt.position.z, 'stunt', '★');
  }

  (scene.userData.flyingMissionPads || []).forEach((pad) => {
    push(pad.x, pad.y, pad.z, pad.type || 'pad', pad.label || '✓');
  });

  if (!checkpoints.length) {
    const gateCount = recipe.gates?.count || recipe.gates?.ringCount || 8;
    for (let i = 0; i < gateCount; i++) {
      const authoredDistribution = Number.isFinite(recipe.gates?.startT) && Number.isFinite(recipe.gates?.endT);
      const t = authoredDistribution
        ? recipe.gates.startT + (recipe.gates.endT - recipe.gates.startT) * (gateCount === 1 ? 0.5 : i / (gateCount - 1))
        : (i + 1) / (gateCount + 1);
      const p = curve.getPoint(t);
      push(p.x, p.y, p.z, 'ring', String(i + 1));
    }
  }

  scene.userData.chassisCheckpoints = checkpoints;
  scene.userData.chassisCheckpointTotal = checkpoints.length;
  return checkpoints;
}

/**
 * Build full aerial course world.
 */
export function buildAerialWorld(scene, challenge) {
  clearFlyingArenaLayers(scene);

  const arenaType = challenge?.arenaType || scene.userData?.arenaType || 'drone_canyon';
  if (!isAerialArenaType(arenaType)) return false;

  const robotConfig = scene.userData._labRobotConfig;
  const chassisId = resolveFlyingChassisId(challenge, robotConfig) || challenge?.chassisId || 'drone';
  const resolvedChallenge = { ...challenge, chassisId };
  const chassisDna = CHASSIS_VISUAL_DNA[chassisId] || CHASSIS_VISUAL_DNA.drone;
  const gatePalette = AERIAL_GATE_COLORS[chassisId] || AERIAL_GATE_COLORS.drone;
  const flyingContract = getFlyingArenaContract(resolvedChallenge, robotConfig);
  const resolvedArenaType = flyingContract?.arenaType || arenaType;

  const baseRecipe = getAerialRecipe(resolvedArenaType);
  const visual = getMissionVisual(challenge, 'sky_aerial');
  const clarity = applyMissionKidClarity(scene, challenge);
  const goldMode = getGoldChapterMode(challenge);
  const hybrid = visual.environmentId === 'hybrid_race_sky';
  const missionGateCount = Number(challenge?.checkpoints);
  const difficultyLevel = Math.max(1, Math.min(10, Number(challenge?.modeIndex || baseRecipe.difficultyLevel || 1)));
  let recipe = Number.isFinite(missionGateCount) && missionGateCount > 0
    ? { ...baseRecipe, difficultyLevel, gates: { ...baseRecipe.gates, count: missionGateCount } }
    : { ...baseRecipe, difficultyLevel };
  // Shared arena types still need a visible hybrid identity. Add the prism
  // racing line to hybrid missions that use a normal flight recipe, and make
  // Tunnel Turbo Dash use the authored purple warp tube.
  if (hybrid && !flyingContract && !recipe.raceRibbon) {
    recipe = {
      ...recipe,
      raceRibbon: {
        colors: [0xec4899, 0x06b6d4, 0xa855f7],
        width: Math.max(5, 7 - difficultyLevel * 0.18),
        boosts: Math.min(6, 2 + Math.ceil(difficultyLevel / 2)),
      },
    };
  }
  if (hybrid && difficultyLevel === 2) {
    recipe = { ...recipe, tunnel: true, tunnelColor: 0xa855f7 };
  }
  if (goldMode?.recipe && !flyingContract) {
    recipe = {
      ...recipe,
      ...goldMode.recipe,
      spline: { ...goldMode.recipe.spline },
      gates: { ...recipe.gates, count: goldMode.recipe.gates, ringCount: goldMode.recipe.gates },
    };
  }
  const missionText = `${challenge?.id || ''} ${challenge?.name || ''} ${challenge?.modeName || ''}`.toLowerCase();
  const singleTarget = /target dive|air strike|package drop|bomb drop/.test(missionText);
  const minGates = clarity.minGates ?? 6;
  const maxGates = clarity.maxGates ?? 8;
  const kidGateCount = goldMode?.recipe?.gates ?? (difficultyLevel === 10 ? maxGates : Math.min(
    maxGates,
    Math.max(minGates, recipe.gates?.count || recipe.gates?.ringCount || minGates),
  ));
  const stripAerialDecor = chassisId === 'jetplane';
  recipe = {
    ...recipe,
    parallaxClouds: stripAerialDecor ? false : (recipe.parallaxClouds ?? true),
    kidClarity: true,
    premiumKidVisuals: !flyingContract?.premiumUE5,
    chassisId,
    aerialVista: flyingContract?.bible?.aerialVista || chassisDna.aerialVista,
    cloudPillars: stripAerialDecor ? 0 : (recipe.cloudPillars ?? 0),
    gateColors: {
      primary: gatePalette.primary,
      secondary: gatePalette.secondary,
      final: 0x22c55e,
    },
    gates: singleTarget
      ? { mode: 'target', count: 1, targetCount: 1, tier: 'forgiving' }
      : { ...recipe.gates, count: kidGateCount, ringCount: kidGateCount, stuntRing: false },
    raceRibbon: recipe.raceRibbon
      ? { ...recipe.raceRibbon, colors: recipe.raceRibbon.colors?.slice(0, 2), boosts: recipe.tunnel ? 0 : Math.min(1, recipe.raceRibbon.boosts || 0) }
      : recipe.raceRibbon,
  };
  if (flyingContract) {
    scene.userData.flyingArenaActive = true;
    scene.userData.flyingContract = flyingContract;
    scene.userData.premiumUE5 = flyingContract.premiumUE5 === true;
    scene.userData.kidFlyingWorld = flyingContract.premiumUE5 ? false : scene.userData.kidFlyingWorld;
    recipe = applyFlyingRecipeContract(recipe, flyingContract);
    if (flyingContract.useReferenceVista) {
      scene.userData.useAerialReferenceVista = true;
      recipe = { ...recipe, hero: null, islandScatter: [], parallaxClouds: false, cloudPillars: 0 };
    }
  } else if (chassisId !== 'jetplane' && chassisDna.sky) {
    const hex = (c) => `#${new THREE.Color(c).getHexString()}`;
    recipe = {
      ...recipe,
      lockSky: true,
      sky: {
        top: hex(chassisDna.sky),
        mid: hex(chassisDna.fog || chassisDna.sky),
        horizon: hex(chassisDna.fog || chassisDna.sky),
        fog: hex(chassisDna.fog || chassisDna.sky),
        near: recipe.sky?.near ?? 120,
        far: recipe.sky?.far ?? 420,
      },
    };
  } else if (chassisId === 'jetplane') {
    recipe = {
      ...recipe,
      goldenHour: true,
      lockSky: true,
      parallaxClouds: false,
      islandScatter: [],
      hero: null,
      sky: {
        top: '#3478b8',
        mid: '#87b9d6',
        horizon: '#ffd39a',
        fog: '#d7b78f',
        near: 160,
        far: 480,
      },
    };
    scene.userData.useAerialReferenceVista = true;
  }
  const missionComposition = getAerialMissionComposition(challenge, chassisDna);
  if (!missionComposition.fixedJetReference && !flyingContract) {
    recipe = {
      ...recipe,
      gates: {
        ...recipe.gates,
        startT: missionComposition.gates.firstT,
        endT: missionComposition.gates.lastT,
      },
    };
  }
  initFamilyScene(scene, [1.0, 0.9, 1.1]);
  scene.userData.aerialWorldBuilt = true;
  scene.userData.aerialSoftDaylight = true;
  scene.userData.skipMissionWorld = true;
  scene.userData.missionWorldKit = false;
  scene.userData.environmentId = visual.environmentId || 'sky_aerial';
  scene.userData.missionVisualBible = visual;
  scene.userData.arenaMood = visual.mood;
  scene.userData.physicsMode = challenge?.physics || 'flight_3dof';
  scene.userData.cameraMode = clarity.camera || visual.camera || challenge?.camera || 'aerial_chase';
  scene.userData.missionCameraPreset = {
    ...getMissionCameraPreset(scene.userData.cameraMode),
    ...clarity.cameraRig,
    camBack: 9.2,
    camUp: 4.4,
    lookAhead: 16,
    lookHeight: 1.2,
    fov: flyingContract?.bible?.fov ?? goldMode?.recipe?.fov ?? clarity.cameraRig?.fov ?? 48,
  };
  scene.userData.killPlaneY = -50;

  const chapter = challenge.arenaBible ? getPrimaryStudioArena(chassisId, challenge.modeIndex) : null;
  const curve = chapter
    ? new THREE.CatmullRomCurve3(getArenaBlueprint(chapter).route.map(([x,z]) => new THREE.Vector3(x*14, 3 + Math.sin(z*Math.PI)*3, 4-z*64)))
    : buildSplineFromRecipe(recipe);
  const routeYOffset = recipe.routeYOffset ?? 4;
  if (routeYOffset) {
    curve.points.forEach((p) => { p.y += routeYOffset; });
  }
  if (flyingContract && !chapter) applyFlyingModeSplineVariation(curve, flyingContract);
  if (recipe.altitudeLimits) {
    const [minY, maxY] = recipe.altitudeLimits;
    const heights = curve.points.map(p => p.y);
    const low = Math.min(...heights), high = Math.max(...heights);
    curve.points.forEach(p => { p.y = minY + (p.y - low) / Math.max(1, high - low) * (maxY - minY); });
    scene.userData.flyingAltitudeLimits = recipe.altitudeLimits;
    scene.userData.flyingRequiredAltitude = recipe.altitudeLimits;
  }
  if (!chapter) applyAerialMissionRoute(curve, flyingContract ? { ...missionComposition, route: { ...missionComposition.route, applyOffsets: false } } : missionComposition);
  scene.userData._chassisCurve = curve;

  const start = curve.getPoint(0);
  const startTan = curve.getTangent(0).normalize();
  scene.userData.aerialSpawn = {
    x: start.x,
    y: start.y,
    z: start.z,
    angle: Math.atan2(startTan.x, startTan.z),
  };
  scene.userData.aerialMeshYawOffset = Math.PI;
  scene.userData.spawnAltitude = start.y;
  scene.userData.spawnX = start.x;
  scene.userData.spawnY = start.y;
  scene.userData.spawnZ = start.z;
  scene.userData.groundY = start.y;

  const len = recipe.spline?.length || 180;
  const end = curve.getPoint(1);
  const bounds = {
    cx: 0,
    cz: -len / 2,
    spanX: 120,
    spanZ: len + 40,
    camMinZ: end.z - 20,
    camMaxZ: 12,
    camMaxX: 40,
    floorLen: len + 40,
    floorY: recipe.vista?.y ?? -42,
  };
  scene.userData.arenaBounds = bounds;

  const trackId = recipe.gltfTrack || 'cloud_citadel_01';
  const vistaY = recipe.vista?.y ?? -42;
  const floorCurve = buildFloorProjectionCurve(curve, vistaY + 0.5);

  applyAerialPost(scene);
  const premiumDna = flyingContract
    ? { ...chassisDna, aerialVista: flyingContract.bible.aerialVista, sky: flyingContract.bible.sky?.top }
    : (chassisId === 'jetplane' ? { ...chassisDna, aerialVista: 'cloud_sea' } : chassisDna);
  if (!flyingContract?.premiumUE5) {
    installPremiumAerialScenery(scene, curve, recipe, bounds, trackId, premiumDna);
  }
  if (flyingContract) {
    installFlyingChassisSetPiece(scene, curve, flyingContract);
    installFlyingArenaIdentity(scene, curve, recipe, bounds, flyingContract);
    installAerialDifficulty(scene, curve, recipe, challenge);
    buildMidground(scene, curve, recipe);
    publishAerialQualityMetrics(scene, {
      ...missionComposition,
      aerialVista: flyingContract.bible.aerialVista,
      skipHero: true,
    }, recipe);
  } else if (chassisId === 'jetplane') {
    installAerialReferenceVista(scene, curve, chassisId);
    publishAerialQualityMetrics(scene, missionComposition, recipe);
  } else {
    installAerialMissionComposition(scene, curve, missionComposition, bounds);
    publishAerialQualityMetrics(scene, missionComposition, recipe);
  }
  if (!flyingContract?.premiumUE5 && !scene.userData.aerialUE5) {
    const flyingBloom = flyingContract?.bible?.bloom;
    scene.userData.raceVisual = {
      ...(scene.userData.raceVisual || {}),
      bloom: flyingBloom ?? clarity.post.bloom,
      threshold: clarity.post.threshold,
      radius: clarity.post.radius,
    };
  }
  if (scene.fog && flyingContract) {
    const sky = recipe.sky || flyingContract.bible.sky;
    scene.fog.color.set(sky.fog);
    scene.fog.near = sky.near;
    scene.fog.far = sky.far;
  } else if (scene.fog && !scene.userData.aerialReferenceVista?.realtime3d) {
    scene.fog.near = clarity.fogNear;
    scene.fog.far = clarity.fogFar;
  }
  if (!flyingContract && chassisId !== 'jetplane') {
    buildChassisAerialVista(scene, chassisDna.aerialVista || 'cloud_sea', bounds);
  }

  let world = scene.getObjectByName('AerialWorldRoot');
  if (!world) {
    world = new THREE.Group();
    world.name = 'AerialWorldRoot';
    scene.add(world);
  }
  // Track-world placement already samples absolute curve coordinates.
  // Translating the parent again pushed scenery upward/backward into camera.
  world.position.set(0, 0, 0);

  const perf = initScenePerfBudget(scene);
  const hw = 5;
  const primitiveCount = 0;

  if (!flyingContract) buildMidground(scene, curve, recipe);
  buildRaceRibbon(scene, curve, recipe);
  const teachingFeature = classifyKidMissionFeature(challenge);
  const goldJetInstalled = !flyingContract && installGoldJetChapter(scene, challenge, curve);
  if (!flyingContract && !goldJetInstalled && teachingFeature === 'sky_marker' && !recipe.hero) {
    placeAerialHero(scene, curve, recipe);
  } else if (!flyingContract && !goldJetInstalled && !(teachingFeature === 'tunnel' && recipe.tunnel)) {
    applyKidMissionTeachingProps(scene, challenge, curve, { mode: 'aerial', kind: teachingFeature });
  }
  placeAerialGates(scene, curve, recipe);
  if (!flyingContract) {
    publishAerialQualityMetrics(scene, missionComposition, recipe);
  }

  if (recipe.gates?.targetCount) {
    placeGroundTargets(scene, curve, recipe.gates.targetCount, bounds.floorY ?? recipe.vista?.y ?? -42);
  }

  scene.userData.finishZone = { x: end.x, z: end.z, radius: 3.5, y3d: end.y };
  if (flyingContract) {
    syncFlyingCheckpoints(scene, curve, recipe);
  } else {
    scene.userData.chassisCheckpoints = [];
    const gateCount = recipe.gates?.count || recipe.gates?.ringCount || 8;
    scene.userData.chassisCheckpointTotal = gateCount;
    for (let i = 0; i < gateCount; i++) {
      const authoredDistribution = Number.isFinite(recipe.gates?.startT) && Number.isFinite(recipe.gates?.endT);
      const t = authoredDistribution
        ? recipe.gates.startT + (recipe.gates.endT - recipe.gates.startT) * (gateCount === 1 ? 0.5 : i / (gateCount - 1))
        : (i + 1) / (gateCount + 1);
      const p = curve.getPoint(t);
      scene.userData.chassisCheckpoints.push({ x: p.x, z: p.z, y: p.y, index: i, passed: false });
    }
  }

  updateMissionMinimap(scene, curve);

  if (flyingContract?.chassisId === 'steathjet') {
    const materials = new Set();
    scene.traverse(object => {
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material?.emissive) materials.add(material);
      }
    });
    const clampStealthGlow = () => materials.forEach(material => {
      material.emissiveIntensity = Math.min(material.emissiveIntensity || 0, 0.5);
    });
    clampStealthGlow();
    // Runs after gate and landmark pulses so animations cannot undo the cap.
    arenaMover(scene, clampStealthGlow);
  }

  const checkpointTotal = scene.userData.chassisCheckpointTotal
    ?? scene.userData.chassisCheckpoints?.length
    ?? recipe.gates?.count
    ?? 0;

  let vistaMeshCount = 0;
  scene.getObjectByName('FlyingVistaLayer')?.traverse((o) => { if (o.isMesh) vistaMeshCount++; });
  if (chapter) installPrimaryStudioChapter(scene, resolvedChallenge, curve);
  console.log('[AerialWorld] built', resolvedArenaType, recipe.label, {
    length: len,
    gates: recipe.gates?.count ?? 0,
    checkpoints: checkpointTotal,
    track: trackId,
    primitives: primitiveCount,
    vistaY,
    flyingVista: flyingContract?.environmentVistaId || flyingContract?.bible?.aerialVista || null,
    premiumUE5: flyingContract?.premiumUE5 === true,
    vistaMeshes: vistaMeshCount,
    spec: flyingContract?.version || null,
    chassisId,
  });

  return true;
}

export { isAerialArenaType };
