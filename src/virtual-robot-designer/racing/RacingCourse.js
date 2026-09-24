/**
 * RacingCourse.js — Mario Kart style game world racing.
 */
import * as THREE from 'three';
import {
  buildRacingStartLine,
  buildAxisStartGrid,
  buildCheckpointArch,
  buildGoldenStarHoop,
  buildBoostPadMesh,
  buildRainbowBoostPad,
  buildPowerUpMesh,
} from './RacingTrackSystem.js';
import {
  buildMarioKartTrack,
  createCircuitCurve,
  createRainbowCircuitCurve,
  sampleKartRoadSurfaceY,
  MARIO_CIRCUIT_RAINBOW,
  MARIO_CIRCUIT_CANDY,
  MARIO_CIRCUIT_DRAGON,
} from './MarioKartTrackBuilder.js';
import { buildCandyTileTrack, buildDragonTileTrack, buildVolcanoTileTrack } from './RainbowTileTrack.js';
import { setPBRTextureTier } from './mk-tracks/PBRMaterialKit.js';
import { buildProfessionalRainbowTrack, buildProfessionalCircuitWaypoints } from './ProfessionalRainbowTrack.js';
import { buildRoverModeProps } from './RoverModeProps.js';
import { getMKTrack, buildMKZoneConfig, MK_ARENA_TYPES } from './mk-tracks/MKTrackRegistry.js';
import { initScenePerfBudget } from './mk-tracks/TrackPerformanceKit.js';
import { BIOME_ARENA_TYPES } from './mk-tracks/BiomeTrackRegistry.js';
import { resnapMarkedProps } from './mk-tracks/TrackGroundSnap.js';
import { populateTrackScenery } from './mk-tracks/TrackWorldBuilder.js';
import { enrichTrackWorldGltf } from './mk-tracks/TrackGltfScatter.js';
import { sampleTrackBounds } from './mk-tracks/BiomeAAAKit.js';
import { getBiomeAAASpec, BIOME_CAMERA_STANDARD } from './mk-tracks/BiomeAAAVisualSpec.js';
import { buildMKThemedWorld, applyMKSceneAtmosphere } from './mk-tracks/MKThemedWorld.js';
import { getMKVisual } from './mk-tracks/MKTrackVisualSpec.js';
import { createRaceMover, computeRaceSpawn, getRaceSensors, TILE_SURFACE_OFFSET, MK_ROAD_DECK_OFFSET, FLAT_ROAD_SURFACE_Y, getRoadDeckOffset, roadSurfaceYAt } from './RacingRaceLogic.js';
import { buildMinimapFromCurve } from './RaceMinimapData.js';
import { buildRainbowRoadWorld } from './worlds/RainbowRoadWorld.js';
import { buildCandyKingdomWorld } from './worlds/CandyKingdomWorld.js';
import { buildDragonSkywayWorld } from './worlds/DragonSkywayWorld.js';
import { buildVolcanoDriftWorld } from './worlds/VolcanoDriftWorld.js';
import { ZONE_RAINBOW_ROAD } from './zone-configs/ZoneConfig_RainbowRoad.js';
import { ZONE_SUNNY_CIRCUIT } from './zone-configs/ZoneConfig_SunnyCircuit.js';
import { ZONE_DRAGON_SKYWAY } from './zone-configs/ZoneConfig_DragonSkyway.js';
import { ZONE_VOLCANO_DRIFT } from './zone-configs/ZoneConfig_VolcanoDrift.js';
import { buildSpaceSkybox, buildStarParticles, buildRingedPlanet, buildAsteroidField, buildNebulaSprites, buildMoon } from './RainbowRoadEnvironment.js';
import { buildColorfulGemStars } from './RainbowRoadVisuals.js';
import { applyReferenceQualityPass } from './mk-tracks/BiomeQualityKit.js';
import { isCarChassis } from '../data/car-racing-tracks.js';
import { installKartRivals, animateKartRivals } from './KartRivalsKit.js';
import { installRacePresentation } from './RacePresentationKit.js';

const CP_COLORS = [0xff2244, 0xff8800, 0xffee00, 0x22ff66, 0x00ccff, 0x4466ff, 0xcc44ff, 0xff44aa];
const POWERUP_BURST_COLOR = { speed: 0x00d9ff, shield: 0x4488ff, magnet: 0xcc66ff, star: 0xffd700 };

function _burst(scene, x, y, z, color, size = 0.25) {
  const N = 14;
  const pos = new Float32Array(N * 3);
  const vel = [];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    const a = Math.random() * Math.PI * 2;
    vel.push({ x: Math.cos(a) * 2.5, y: 1.2 + Math.random(), z: Math.sin(a) * 2.5 });
  }
  const geo = new THREE.BufferGeometry();
  const attr = new THREE.BufferAttribute(pos, 3);
  geo.setAttribute('position', attr);
  const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 1, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  const start = performance.now();
  const tick = () => {
    const e = (performance.now() - start) / 550;
    if (e > 1) { scene.remove(pts); geo.dispose(); mat.dispose(); return; }
    mat.opacity = 1 - e;
    for (let i = 0; i < N; i++) {
      vel[i].y -= 4 * 0.016;
      pos[i * 3] += vel[i].x * 0.016;
      pos[i * 3 + 1] += vel[i].y * 0.016;
      pos[i * 3 + 2] += vel[i].z * 0.016;
    }
    attr.needsUpdate = true;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const WORLD_BUILDERS = {
  rainbow_road: buildRainbowRoadWorld,
  street_grand_prix: buildRainbowRoadWorld,
  circuit_sprint: buildRainbowRoadWorld,
  sunny_circuit: buildCandyKingdomWorld,
  candy_kingdom: buildCandyKingdomWorld,
  dragon_skyway: buildDragonSkywayWorld,
  volcano_drift: buildVolcanoDriftWorld,
};

const PRO_CIRCUIT_IDS = new Set([
  'rainbow_road', 'street_grand_prix', 'circuit_sprint', 'rainbow_road_master',
  'sunny_circuit', 'candy_kingdom', 'dragon_skyway', 'volcano_drift',
  ...MK_ARENA_TYPES,
]);

const RAINBOW_CIRCUIT_IDS = new Set([
  'rainbow_road', 'street_grand_prix', 'circuit_sprint', 'rainbow_road_master',
]);

function mergeProRacingConfig(zoneConfig) {
  const base = ZONE_RAINBOW_ROAD.racing;
  return {
    ...zoneConfig,
    racing: {
      ...base,
      ...zoneConfig.racing,
      startGrid: base.startGrid,
      spawnPosition: base.spawnPosition,
      track3D: true,
      useLateralFall: true,
      fallOffEnabled: zoneConfig.racing?.fallOffEnabled ?? true,
      respawnEnabled: true,
      driftEnabled: zoneConfig.racing?.driftEnabled ?? true,
    },
  };
}

function resolveCurve(worldId, mkTrack = null) {
  if (mkTrack?.spline) {
    if (BIOME_ARENA_TYPES.has(mkTrack.arenaType)) {
      const tension = mkTrack.trackShape === 'coastal' ? 0.22
        : (mkTrack.trackShape === 'f1-circuit' ? 0.28
        : (mkTrack.trackShape === 's-curve' ? 0.10
        : (mkTrack.trackShape === 'figure-8' ? 0.16 : 0.28)));
      const curveType = mkTrack.trackShape === 's-curve' ? 'catmullrom' : 'centripetal';
      return createCircuitCurve(mkTrack.spline, true, tension, curveType);
    }
    return createRainbowCircuitCurve(mkTrack.spline);
  }
  if (mkTrack && !mkTrack.spline) {
    console.warn(`[RacingCourse] MK track "${mkTrack.id}" missing spline — using fallback oval`);
    return createRainbowCircuitCurve(mkTrack.spline || []);
  }
  if (PRO_CIRCUIT_IDS.has(worldId)) {
    return createRainbowCircuitCurve(MARIO_CIRCUIT_RAINBOW);
  }
  return createRainbowCircuitCurve(MARIO_CIRCUIT_RAINBOW);
}

function buildTrackMesh(mkTrack, curve, root, { halfWidth, is3D, trackLod = 1, scene = null }) {
  if (!mkTrack) {
    return buildProfessionalRainbowTrack(curve, root, { halfWidth, use3D: true });
  }
  const lod = Math.max(0.35, Math.min(1, trackLod));
  const carKid = isCarChassis(scene?.userData?.chassisModeChallenge?.chassisId);
  switch (mkTrack.mesh) {
    case 'pro_rainbow':
      return buildProfessionalRainbowTrack(curve, root, { halfWidth, use3D: true });
    case 'tile_candy':
      return buildCandyTileTrack(curve, root, { halfWidth, use3D: is3D, trackLod: lod });
    case 'tile_dragon':
      return buildDragonTileTrack(curve, root, { halfWidth, use3D: is3D, trackLod: lod });
    case 'tile_volcano':
      return buildVolcanoTileTrack(curve, root, { halfWidth, use3D: is3D, trackLod: lod });
    default: {
      const themed = mkTrack.roadStyle || getMKVisual(mkTrack.arenaType)?.roadStyle || 'asphalt';
      const roadStyle = (carKid && !mkTrack.isRainbow && !mkTrack.isClassicRainbow)
        ? 'asphalt'
        : themed;
      const baseSeg = mkTrack.segments ?? (is3D ? 360 : 280);
      const segments = Math.max(96, Math.round(baseSeg * lod));
      return buildMarioKartTrack(curve, root, {
        halfWidth,
        segments,
        roadStyle,
        use3D: is3D,
        kerbs: mkTrack.kerbs !== false,
        walls: mkTrack.walls === true,
        wallHeight: is3D ? 1.35 : 1.1,
        banking: is3D && !BIOME_ARENA_TYPES.has(mkTrack.arenaType),
        pbrRoad: is3D || BIOME_ARENA_TYPES.has(mkTrack.arenaType),
      });
    }
  }
}

/** Build any MK circuit arena by arenaType id */
export function buildMKTrackArena(scene, arenaType) {
  const track = getMKTrack(arenaType);
  if (!track) return null;
  let zone = buildMKZoneConfig(track);
  if (track.isRainbow) {
    zone = mergeProRacingConfig({ ...ZONE_RAINBOW_ROAD, ...zone, arenaType: track.arenaType });
  }
  return buildRacingCourse(scene, zone);
}

export function buildRacingCourse(scene, zoneConfig) {
  const root = new THREE.Group();
  root.name = 'arena';
  scene.add(root);
  scene.userData.sceneryPopulated = false;

  const racing = zoneConfig.racing;
  const worldId = zoneConfig.arenaType || zoneConfig.id;
  const mkTrack = zoneConfig.mkTrack || getMKTrack(worldId);
  const isRainbow = RAINBOW_CIRCUIT_IDS.has(worldId) || mkTrack?.isRainbow;
  const isProCircuit = PRO_CIRCUIT_IDS.has(worldId);
  const qp = scene.userData?.qualityPreset || {};
  const perf = initScenePerfBudget(scene);
  const tier = scene.userData?.qualityTier || perf.tier || 'medium';
  const trackLod = perf.trackLod ?? qp.trackLod ?? 1;
  const is3D = racing.track3D ?? mkTrack?.use3D ?? false;

  if (mkTrack && BIOME_ARENA_TYPES.has(mkTrack.arenaType)) {
    mkTrack.segments = perf.roadSegments;
    mkTrack.kerbs = true;
  }

  setPBRTextureTier(tier);

  const curve = resolveCurve(worldId, mkTrack);
  // Keep the recognizable spline, but give full circuits enough breathing room
  // to read clearly as long-form race tracks.
  if (mkTrack) {
    const longCourseScale = mkTrack.longCourseScale ?? 1.28;
    curve.points.forEach((point) => {
      point.x *= longCourseScale;
      point.z *= longCourseScale;
    });
  }
  const halfWidth = (racing.trackWidth ?? 5) / 2;

  // ── Game world environment (sky, landmarks, collectibles) ──
  const worldBuilder = WORLD_BUILDERS[worldId] || WORLD_BUILDERS[zoneConfig.id];
  let gameWorld = null;
  if (mkTrack) {
    scene.userData.arenaType = mkTrack.arenaType;
    console.log('[DEBUG] buildRacingCourse arena:', worldId, 'mkTrack:', mkTrack.id, 'roadStyle:', mkTrack.roadStyle, 'biome:', mkTrack.arenaType);
    gameWorld = buildMKThemedWorld(scene, curve, root, mkTrack, {
      halfWidth,
      finishT: racing.finishT ?? 0,
      startLineT: racing.startLineT ?? racing.finishT ?? 0,
      laps: racing.laps ?? mkTrack.laps ?? 2,
      qualityTier: scene.userData?.qualityTier || 'medium',
    });
    applyMKSceneAtmosphere(scene, mkTrack.arenaType);
    scene.userData.customSky = true;
    scene.userData.customDecor = true;
    scene.userData.gameWorld = true;
  } else if (worldBuilder && !isRainbow) {
    gameWorld = worldBuilder(scene, curve, root, {
      halfWidth,
      finishT: racing.finishT ?? 0,
      startLineT: racing.startLineT ?? racing.finishT ?? 0,
      startLinePosition: racing.startLinePosition ?? null,
      startLineHeading: racing.startLineHeading ?? null,
    });
    scene.userData.customSky = true;
    scene.userData.customDecor = true;
    scene.userData.gameWorld = true;
  } else if (isRainbow) {
    buildSpaceSkybox(scene, 95, { segments: { width: 16, height: 12 }, worldLod: 1.0 });
    buildStarParticles(scene, 200);
    buildColorfulGemStars(scene, 18);
    buildNebulaSprites(scene);
    buildRingedPlanet(scene, { x: -85, y: -18, z: 35, radius: 62, ringRadius: 0 });
    buildMoon(scene, { x: 48, y: 18, z: -55, radius: 8 });
    buildAsteroidField(scene, 22);
    scene.userData.customSky = true;
    scene.userData.customDecor = true;
  }

  // ── Mario Kart track: solid road + kerbs + walls ──
  let trackUpdate = () => {};
  const glowRefs = [];

  const isDragon  = worldId === 'dragon_skyway'  || zoneConfig.id === 'dragon_skyway';
  const isVolcano = worldId === 'volcano_drift'  || zoneConfig.id === 'volcano_drift';
  const isSunny   = worldId === 'sunny_circuit'  || zoneConfig.id === 'sunny_circuit';

  let track;
  if (mkTrack) {
    const biomeLod = mkTrack.arenaType && BIOME_ARENA_TYPES.has(mkTrack.arenaType)
      ? Math.max(trackLod, 0.92)
      : trackLod;
    track = buildTrackMesh(mkTrack, curve, root, { halfWidth, is3D, trackLod: biomeLod, scene });
  } else if (isProCircuit) {
    track = buildProfessionalRainbowTrack(curve, root, {
      halfWidth,
      use3D: true,
    });
  } else {
    track = buildMarioKartTrack(curve, root, {
      halfWidth, segments: 520, roadStyle: 'rainbow', use3D: true, kerbs: true, walls: false,
    });
  }
  trackUpdate = (t) => track.updateTime(t);
  scene.userData.raceRoadMesh = track.roadMesh ?? track.group?.children?.find((c) => c.isMesh) ?? null;
  if (mkTrack && BIOME_ARENA_TYPES.has(mkTrack.arenaType)) {
    const trackId = mkTrack.arenaType;
    const worldGroup = root.getObjectByName(`track-${trackId}`)
      || scene.getObjectByName(`track-${trackId}`)
      || root.children.find((c) => c.name === `track-${trackId}`);
    const bounds = sampleTrackBounds(curve);
    scene.userData.trackBounds = bounds;
    const perfBudget = scene.userData.trackPerfBudget || perf;
    const finishT = racing.finishT ?? 0;
    if (worldGroup) {
      const needsPrimitives = !worldGroup.userData.sceneryPopulated;
      if (needsPrimitives) {
        populateTrackScenery(worldGroup, curve, halfWidth, bounds, trackId, perfBudget, scene, finishT);
      }
      if (worldGroup.userData.awaitGltfScenery && !worldGroup.userData.gltfEnriched && !worldGroup.userData.deferGltfEnrich) {
        enrichTrackWorldGltf(worldGroup, curve, halfWidth, trackId, perfBudget, scene, finishT)
          .then((n) => {
            console.log('[RacingCourse] glTF enriched', trackId, { placed: n });
            resnapMarkedProps(scene, root);
          })
          .catch((err) => console.warn('[RacingCourse] glTF enrich failed', trackId, err));
      }
    } else {
      console.warn('[RacingCourse] missing world group for', trackId);
    }
    scene.userData.sceneryPopulated = worldGroup?.userData?.sceneryPopulated ?? true;
    scene.userData.trackLoading = false;
    resnapMarkedProps(scene, root);
    const carKid = isCarChassis(scene.userData.chassisModeChallenge?.chassisId);
    if (worldGroup) {
      applyReferenceQualityPass(worldGroup, scene, curve, halfWidth, bounds, trackId, {
        finishT,
        kidStart: carKid,
        startLabel: carKid ? 'START' : undefined,
        skip: { gantry: true },
      });
    }
    if (carKid || mkTrack) {
      scene.userData.carKidRacing = !!carKid;
      scene.userData.raceHudTheme = trackId;
    }
  }
  scene.userData.sampleKartRoadY = (t) => sampleKartRoadSurfaceY(curve, t, { use3D: is3D });

  const chassisChallenge = scene.userData.chassisModeChallenge;
  if (chassisChallenge?.campusMode?.props?.length && isRainbow && !mkTrack) {
    buildRoverModeProps(root, curve, chassisChallenge, { halfWidth, is3D });
    scene.userData.roverModeLabel = chassisChallenge.campusMode.shortName || chassisChallenge.name;
  }

  const startLineOpts = {};
  if (racing.startLinePosition) {
    startLineOpts.position = racing.startLinePosition;
    startLineOpts.heading = racing.startLineHeading ?? Math.PI;
  }
  const mkCustomStart = mkTrack?.customStartLine === true;
  if (isRainbow && racing.startGrid) {
    const sg = racing.startGrid;
    root.add(buildAxisStartGrid({
      x: sg.x ?? 0,
      lineZ: sg.lineZ ?? 72,
      y: sg.y ?? 48,
      halfWidth,
      angle: sg.angle ?? Math.PI,
      use3D: is3D,
    }).group);
  } else if (!mkCustomStart) {
    root.add(buildRacingStartLine(
      curve,
      racing.startLineT ?? racing.finishT ?? 0,
      halfWidth,
      is3D,
      {
        ...startLineOpts,
        spawnT: racing.spawnT ?? racing.startLineT ?? racing.finishT ?? 0,
      },
    ).group);
  }

  if (isRainbow) {
    // Checkpoint hoops + boost pads along Rainbow Road
    (racing.checkpointTs || []).filter((t) => t > 0.05).forEach((t, i) => {
      const arch = buildGoldenStarHoop(curve, t, halfWidth * 0.85, i + 1, is3D);
      root.add(arch);
      glowRefs.push({ mats: arch.userData.glowMats });
    });
    (racing.boostTs || []).filter((t) => t > 0.03).forEach((t) => {
      const pad = buildRainbowBoostPad(curve, t, halfWidth, is3D);
      root.add(pad.mesh);
      glowRefs.push({ mats: [pad.mesh.userData.boostMat] });
    });
  } else if (!mkTrack?.hideWorldCheckpoints) {
  const cpColors = mkTrack?.trackStandard?.checkpointColors;
  (racing.checkpointTs || []).forEach((t, i) => {
    const color = cpColors?.[i] ?? CP_COLORS[i % CP_COLORS.length];
    const arch = buildCheckpointArch(curve, t, halfWidth, color, i + 1, is3D);
    root.add(arch);
    glowRefs.push({ mats: arch.userData.glowMats });
  });

  (racing.boostTs || []).forEach((t) => {
    const pad = buildBoostPadMesh(curve, t, halfWidth, is3D);
    root.add(pad.mesh);
    glowRefs.push({ mats: [pad.mesh.userData.boostMat] });
  });
  }

  const powerupMeshes = (isRainbow || mkTrack?.hideWorldCheckpoints) ? [] : (racing.pickups || []).map((pk) => {
    const mesh = buildPowerUpMesh(curve, pk.t, pk.type, is3D);
    root.add(mesh);
    return mesh;
  });

  const pts = curve.getPoints(32);
  const bounds = pts.reduce((a, p) => ({
    minX: Math.min(a.minX, p.x), maxX: Math.max(a.maxX, p.x),
    minY: Math.min(a.minY, p.y), maxY: Math.max(a.maxY, p.y),
    minZ: Math.min(a.minZ, p.z), maxZ: Math.max(a.maxZ, p.z),
  }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity });

  const startPt = curve.getPointAt(racing.finishT ?? 0);
  const gridSpawn = computeRaceSpawn(curve, racing.finishT ?? 0, {
    spawnT: racing.spawnT ?? null,
    spawnTOffset: racing.spawnTOffset ?? null,
    spawnPosition: racing.spawnPosition ?? null,
    track3D: is3D,
  });
  installRacePresentation(scene, curve, {
    halfWidth,
    theme: mkTrack?.arenaType || worldId,
    spawn: gridSpawn,
    startT: gridSpawn.trackT ?? racing.spawnT ?? racing.finishT ?? 0,
  });
  scene.userData.raceCameraPreset = {
    camBack: 6.6, camUp: 2.35, lookAhead: 16, lookHeight: 0.75, fov: 54,
  };
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;

  scene.userData.obstacles = [];
  scene.userData.hideSpawnMarkers = true;
  scene.userData.skipSceneStylize = true;
  scene.userData.skipSoftEnvironment = true;
  scene.userData.mkThemedTrack = !!mkTrack;
  scene.userData.raceRoadDeckOffset = is3D
    ? (isRainbow ? TILE_SURFACE_OFFSET : MK_ROAD_DECK_OFFSET)
    : 0;
  scene.userData.groundY = is3D
    ? startPt.y + getRoadDeckOffset(scene)
    : FLAT_ROAD_SURFACE_Y;
  scene.userData.track3D = is3D;

  if (mkTrack) {
    const visual = getMKVisual(mkTrack.arenaType);
    const isBiome = BIOME_ARENA_TYPES.has(mkTrack.arenaType);
    scene.userData.lightMood = isBiome
      ? (mkTrack.arenaType === 'neon_metro_01'
        || mkTrack.arenaType === 'lava_foundry_01'
        || (typeof mkTrack.isCosmicBiome === 'boolean' && mkTrack.isCosmicBiome)
        ? [0.55, 0.6, 0.2]
        : [1.0, 1.0, 0.92])
      : (visual?.lightMood || [1.25, 1.2, 1.1]);
    scene.userData.expMood = isBiome ? 1.0 : (visual?.expMood ?? 1.28);
    scene.userData.biomeAAA = isBiome;
    if (isBiome) {
      const biomeSpec = getBiomeAAASpec(mkTrack.arenaType);
      scene.userData.biomeAAASpec = biomeSpec;
      scene.userData.worldStory = biomeSpec.lore || biomeSpec.mood;
      scene.userData.codeRacerMode = true;
      const post = biomeSpec.post || {};
      const carKid = isCarChassis(scene.userData.chassisModeChallenge?.chassisId);
      scene.userData.raceVisual = {
        ...(scene.userData.raceVisual || {}),
        bloom: carKid ? Math.min(post.bloom ?? 0.28, 0.32) : (post.bloom ?? 0.42),
        threshold: carKid ? 0.88 : (post.threshold ?? 0.82),
        radius: carKid ? 0.16 : (post.radius ?? 0.2),
        grade: {
          s: post.gradeSat ?? 1.18,
          c: 1.08,
          g: post.gradeGain || [1.04, 1.02, 1.04],
        },
        gradeCss: post.gradeCss,
      };
      if (zoneConfig.objectives?.length) scene.userData.raceObjectives = zoneConfig.objectives;
      scene.userData.raceCameraPreset = {
        camBack: 6.6, camUp: 2.35, lookAhead: 16, lookHeight: 0.75, fov: 54,
      };
      scene.userData.raceCameraFov = 54;
    } else {
      scene.userData.raceSpaceEnv = false;
      scene.userData.forceBloom = false;
      scene.userData.raceVisual = {
        bloom: zoneConfig.bloom?.strength ?? visual?.bloom?.strength ?? 0.28,
        threshold: zoneConfig.bloom?.threshold ?? visual?.bloom?.threshold ?? 0.78,
        radius: zoneConfig.bloom?.radius ?? visual?.bloom?.radius ?? 0.42,
        grade: { s: 1.18, g: [1.02, 1.0, 1.04] },
      };
    }
  } else {
  scene.userData.lightMood = isRainbow
    ? [1.05, 1.0, 1.15]
    : isSunny
      ? [1.0, 1.05, 1.15]
      : isVolcano
        ? [1.15, 0.95, 0.82]
        : isDragon
          ? [0.80, 0.88, 1.12]
          : [0.85, 0.92, 1.08];
  scene.userData.expMood = isRainbow ? 1.05 : isDragon ? 1.25 : 1.30;
  // All tile tracks use a dark scene so MeshBasicMaterial tiles look self-lit.
  scene.userData.raceSpaceEnv = isRainbow || isDragon;
  scene.userData.isRainbowRoad = isRainbow;
  scene.userData.forceBloom = isRainbow;
  scene.userData.raceVisual = {
    bloom:     zoneConfig.bloom?.strength   ?? (isRainbow ? 0.55 : isSunny ? 0.28 : 0.35),
    threshold: zoneConfig.bloom?.threshold  ?? (isRainbow ? 0.65 : isSunny ? 0.55 : 0.42),
    radius:    zoneConfig.bloom?.radius     ?? (isRainbow ? 0.8 : 0.45),
    grade: { s: isRainbow ? 1.65 : 1.12, g: isRainbow ? [1.04, 1.0, 1.06] : isDragon ? [1.0, 1.02, 1.06] : isVolcano ? [1.08, 1.02, 0.98] : [1.02, 1.04, 1.06] },
  };
  }

  scene.userData.arenaBounds = {
    camMinZ: bounds.minZ - 40,
    camMaxZ: bounds.maxZ + 40,
    camMaxX: Math.max(Math.abs(bounds.minX), Math.abs(bounds.maxX)) + 40,
    raceCam: true,
    introCenter: { x: gridSpawn.x, y: is3D ? gridSpawn.y + 5 : 3, z: gridSpawn.z },
    introSweep: false,
    flappyNoIntro: true,
  };

  const moverLogic = createRaceMover({
    curve,
    totalLaps: racing.laps ?? 3,
    checkpointTs: racing.checkpointTs,
    boostTs: racing.boostTs,
    pickupTs: racing.pickups || [],
    finishT: racing.finishT ?? 0,
    spawnT: racing.spawnT ?? null,
    spawnTOffset: racing.spawnTOffset ?? null,
    spawnPosition: racing.spawnPosition ?? null,
    halfWidth,
    fallOffEnabled: racing.fallOffEnabled !== false,
    track3D: is3D,
    flatStraightTrack: racing.flatStraightTrack ?? null,
    useLateralFall: racing.useLateralFall === true,
    glowRefs,
    onTrackTimeUpdate: trackUpdate,
    onBurst: (x, y, z, col) => _burst(scene, x, y, z, col),
    onPickup: (x, y, z, type) => _burst(scene, x, y, z, POWERUP_BURST_COLOR[type] || 0xffd700),
    difficulty: racing.difficulty ?? 3,
  });

  scene.userData.raceSpawn = moverLogic.spawn;

  scene.userData.raceMode = true;
  scene.userData.getRaceSensors = () => getRaceSensors(scene.userData._raceState || {});
  scene.userData.raceCurve = curve;
  scene.userData.raceMinimap = buildMinimapFromCurve(curve, {
    segments: racing.trackSegments || [],
    finishT: racing.finishT ?? 0,
    checkpointTs: racing.checkpointTs || [],
  });
  scene.userData.raceTrackId = zoneConfig.id;
  scene.userData.raceHudTheme = zoneConfig.hud?.theme ?? 'racing';
  scene.userData.raceWorldName = mkTrack?.label || zoneConfig.name;
  if (mkTrack?.raceCameraPreset && !scene.userData.biomeAAASpec) scene.userData.raceCameraPreset = mkTrack.raceCameraPreset;
  else if (mkTrack && !scene.userData.raceCameraPreset) {
    scene.userData.raceCameraPreset = { ...BIOME_CAMERA_STANDARD };
  }
  if (mkTrack?.raceCameraFov && !scene.userData.raceCameraFov) scene.userData.raceCameraFov = mkTrack.raceCameraFov;
  scene.userData.endlessMode = false;
  scene.userData.flappyMode = false;
  scene.userData.finishZone = null;
  scene.userData.raceTotalLaps = racing.laps ?? 3;
  scene.userData.racingConfig = racing;
  scene.userData.raceCountdownSeconds = 0;
  if (mkTrack || isProCircuit) {
    installKartRivals(scene, curve, { halfWidth, laps: scene.userData.raceTotalLaps });
  }

  scene.userData.movers = [{
    update(time, dt, rs) {
      scene.userData._raceState = rs;
      if (gameWorld?.update) gameWorld.update(time, dt);
      animateKartRivals(scene, time, dt);
      moverLogic.update(time, dt, rs, scene);
      for (let i = 0; i < powerupMeshes.length; i++) {
        const mesh = powerupMeshes[i];
        const pk = moverLogic.pickups[i];
        if (!pk) continue;
        mesh.visible = !pk.collected;
        if (mesh.visible) {
          mesh.rotation.y += dt * mesh.userData.spinSpeed;
          mesh.position.y = mesh.userData.baseY + Math.sin(time * 2 + mesh.userData.bobPhase) * 0.18;
        }
      }
    },
  }];

  scene.userData._raceCleanup = () => {
    ['raceMode', 'raceSpawn', 'raceTotalLaps', 'raceVisual', 'skipSceneStylize',
      'skipSoftEnvironment', 'racingConfig', 'gameWorld', 'track3D',
      'suppressSimDaylight', 'customSky', 'mkThemedTrack', '_trackLights',
      'biomeAAASpec', 'trackSkyDome'].forEach((k) => delete scene.userData[k]);
    if (scene.userData.racePresentationRoot) {
      scene.remove(scene.userData.racePresentationRoot);
      delete scene.userData.racePresentationRoot;
    }
    delete scene.userData.racePresentation;
    if (scene.userData.kartRivalsRoot) {
      scene.remove(scene.userData.kartRivalsRoot);
      delete scene.userData.kartRivalsRoot;
    }
    delete scene.userData.kartRivals;
    delete scene.userData.raceObstacles;
    scene.fog = null;
    scene.background = new THREE.Color(0x87ceeb);
    scene.environment = null;
  };

  return { curve, zoneConfig, gameWorld };
}

export function buildRainbowRoadArena(scene) {
  return buildRacingCourse(scene, ZONE_RAINBOW_ROAD);
}

export function buildSunnyCircuitArena(scene) {
  return buildRacingCourse(scene, mergeProRacingConfig(ZONE_SUNNY_CIRCUIT));
}

export function buildDragonSkywayArena(scene) {
  return buildRacingCourse(scene, mergeProRacingConfig(ZONE_DRAGON_SKYWAY));
}

export function buildVolcanoDriftArena(scene) {
  return buildRacingCourse(scene, mergeProRacingConfig(ZONE_VOLCANO_DRIFT));
}

export { createCircuitCurve as createRainbowRoadCurve, MARIO_CIRCUIT_RAINBOW } from './MarioKartTrackBuilder.js';
export { createCircuitCurve as createSprintCircuitCurve, MARIO_CIRCUIT_RAINBOW as RAINBOW_ROAD_SPLINE } from './MarioKartTrackBuilder.js';

export function buildCircuitSprintArena(scene) {
  return buildRainbowRoadArena(scene);
}

export function buildTimeTrialArena(scene) {
  const cfg = { ...ZONE_RAINBOW_ROAD, racing: { ...ZONE_RAINBOW_ROAD.racing, laps: 1 } };
  return buildRacingCourse(scene, cfg);
}
