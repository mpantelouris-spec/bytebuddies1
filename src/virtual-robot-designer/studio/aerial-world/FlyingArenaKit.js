/**
 * FlyingArenaKit — spawn landmarks + vista layers per locked flyer bible.
 * Prop budget: spawn + 1 hero (from recipe) + gates + goal — max 4 chunky props.
 */
import * as THREE from 'three';
import { installFlyingMissionDressing } from './FlyingMissionDressing.js';
import { applyModeRecipeFlags } from './FlyingModeArenaKit.js';
import {
  flyingMat,
  flyingGeo,
  flyingAdd,
  buildRealisticOilRig,
  buildRealisticLabPad,
  buildRealisticOceanPlane,
  buildRealisticCloudBank,
  buildRealisticCarrierDeck,
  buildRealisticOffshorePlatform,
  buildRealisticRepulsorGate,
  buildCyberCityVista,
  buildCyberCitySilhouette,
} from './FlyingArenaMaterialKit.js';
import {
  applyUE5AerialRenderProfile,
  installUE5AerialAtmosphere,
  enhanceAerialMaterials,
} from './AerialUERenderKit.js';
import { getContractEnvironmentVistaId, isPremiumFlyingVista } from './FlyingArenaSpec.js';
import { installFlyingVistaDetails } from './FlyingVistaDetailKit.js';
import { installPremiumEnvironmentLighting } from './PremiumFlyingEnvironmentKit.js';
import {
  installKidFriendlyFlyingWorld,
  installKidFriendlyFlyingSky,
  installKidFriendlyFlyingLighting,
  animateKidFriendlyFlying,
} from './KidFriendlyFlyingKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';
import { buildSpawnSkyIsland, buildSkyMechanicalHut } from '../mission-world/PremiumKidArenaKit.js';
import { placeAerialHero } from './AerialHeroKit.js';
import { buildFloatingIslandDetailed } from '../../racing/mk-tracks/SkyGardenHeroKit.js';

const mat = flyingMat;
const addMesh = flyingAdd;

/** Place vista props relative to spawn heading on the flight spline. */
function frameAlongCurve(curve, along = 60, side = 0, drop = 18) {
  if (!curve) {
    return {
      pos: new THREE.Vector3(0, -40, -90),
      fwd: new THREE.Vector3(0, 0, -1),
      right: new THREE.Vector3(1, 0, 0),
    };
  }
  const spawn = curve.getPoint(0);
  const tan = curve.getTangent(0).clone().normalize();
  const yaw = Math.atan2(tan.x, tan.z);
  const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
  const pos = spawn.clone()
    .addScaledVector(fwd, along)
    .addScaledVector(right, side)
    .add(new THREE.Vector3(0, -drop, 0));
  return { pos, fwd, right, spawn };
}

function worldAt(curve, along, side, drop) {
  const frame = frameAlongCurve(curve, along, side, drop);
  const at = (sideOff, fwdOff, upOff = 0) => frame.pos.clone()
    .addScaledVector(frame.fwd, fwdOff)
    .addScaledVector(frame.right, sideOff)
    .add(new THREE.Vector3(0, upOff, 0));
  return { ...frame, at, baseY: frame.pos.y };
}

/** Frame on the flight spline — premium vistas sit on the path so they read at spawn. */
function curveFrame(curve, t = 0.12, side = 0, drop = 6) {
  if (!curve) return worldAt(null, 28, side, drop);
  const spawn = curve.getPoint(Math.max(0, Math.min(1, t)));
  const tan = curve.getTangent(Math.max(0, Math.min(1, t))).clone().normalize();
  const yaw = Math.atan2(tan.x, tan.z);
  const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
  const pos = spawn.clone()
    .addScaledVector(right, side)
    .add(new THREE.Vector3(0, -drop, 0));
  const at = (sideOff, fwdOff, upOff = 0) => pos.clone()
    .addScaledVector(fwd, fwdOff)
    .addScaledVector(right, sideOff)
    .add(new THREE.Vector3(0, upOff, 0));
  return { pos, fwd, right, spawn, at, baseY: pos.y };
}

function buildOffshorePlatform(start) {
  return buildRealisticOffshorePlatform(start);
}

function buildRepulsorGate(start) {
  return buildRealisticRepulsorGate(start);
}

function buildHangarMouth(start) {
  const g = new THREE.Group();
  g.name = 'FlyingSpawn:hangar_mouth';
  [-5, 5].forEach((x, i) => {
    addMesh(g, new THREE.BoxGeometry(1.2, 6, 2), mat(0x1e293b, { metalness: 0.4 }), start.x + x, start.y - 12, start.z - 3, `Jamb${i}`);
  });
  addMesh(g, new THREE.BoxGeometry(11, 0.8, 2), mat(0x334155, { metalness: 0.45 }), start.x, start.y - 9, start.z - 3, 'Lintel');
  addMesh(g, new THREE.SphereGeometry(0.25, 8, 6), mat(0xef4444, { emissive: 0xef4444, emi: 0.8 }), start.x, start.y - 11, start.z - 2, 'RunwayLight');
  return g;
}

function buildAirshowBanner(start) {
  const g = new THREE.Group();
  g.name = 'FlyingSpawn:airshow_banner';
  const bannerPos = start.clone().add(new THREE.Vector3(8, -6, -8));
  addMesh(g, new THREE.BoxGeometry(14, 2.2, 0.3), mat(0xf97316, { emissive: 0xea580c, emi: 0.15 }), bannerPos.x, bannerPos.y, bannerPos.z, 'Banner');
  addMesh(g, new THREE.CylinderGeometry(0.12, 0.12, 5, 6), mat(0xf8fafc), start.x + 1, start.y - 9, start.z - 8, 'BannerPole');
  return g;
}

function buildNeonGantry(start) {
  const g = new THREE.Group();
  g.name = 'FlyingSpawn:neon_gantry';
  [-4, 4].forEach((x, i) => {
    addMesh(g, new THREE.BoxGeometry(0.6, 5, 0.6), mat(0xec4899, { emissive: 0xec4899, emi: 0.4 }), start.x + x, start.y - 10, start.z - 5, `Post${i}`);
  });
  addMesh(g, new THREE.BoxGeometry(9, 0.5, 0.5), mat(0x06b6d4, { emissive: 0x06b6d4, emi: 0.45 }), start.x, start.y - 7.5, start.z - 5, 'GantryBar');
  [-1, 0, 1].forEach((i) => {
    addMesh(
      g,
      new THREE.SphereGeometry(0.35, 8, 6),
      mat(i === 0 ? 0x22c55e : 0xef4444, { emissive: 0xffffff, emi: 0.5 }),
      start.x + i * 2.5,
      start.y - 6.8,
      start.z - 5,
      `Light${i}`,
    );
  });
  return g;
}

function buildWarpGateArch(start) {
  const g = new THREE.Group();
  g.name = 'FlyingSpawn:warp_gate_arch';
  const arch = addMesh(g, new THREE.TorusGeometry(4.5, 0.45, 10, 24, Math.PI), mat(0xa855f7, { emissive: 0xa855f7, emi: 0.5 }), 0, 0, 0, 'WarpArch');
  arch.position.copy(start).add(new THREE.Vector3(0, -7, -6));
  arch.rotation.x = Math.PI / 2;
  return g;
}

function buildEmergencyHq(start) {
  const g = new THREE.Group();
  g.name = 'FlyingSpawn:emergency_hq';
  addMesh(g, new THREE.BoxGeometry(10, 3, 8), mat(0x78716c), start.x - 8, start.y - 13, start.z - 2, 'Rooftop');
  addMesh(g, new THREE.BoxGeometry(1.2, 1.2, 1.2), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.35 }), start.x - 6, start.y - 11.5, start.z - 1, 'Medkit');
  addMesh(g, new THREE.CylinderGeometry(0.2, 0.2, 3, 8), mat(0xf97316, { emissive: 0xf97316, emi: 0.6 }), start.x - 10, start.y - 10, start.z + 1, 'BeaconPole');
  return g;
}

function buildCloudCastleProp(start) {
  const g = new THREE.Group();
  g.name = 'FlyingProp:cloud_castle';
  const island = buildFloatingIslandDetailed(8);
  island.position.copy(start).add(new THREE.Vector3(-18, -16, -12));
  g.add(island);
  const hut = buildSkyMechanicalHut();
  hut.position.copy(start).add(new THREE.Vector3(-18, -14, -10));
  g.add(hut);
  return g;
}

export function installFlyingSpawnLandmark(scene, curve, contract) {
  if (!scene || !curve || !contract?.bible) return null;
  if (scene.getObjectByName('FlyingSpawnRoot')) return scene.getObjectByName('FlyingSpawnRoot');

  const start = curve.getPoint(0);
  const root = new THREE.Group();
  root.name = 'FlyingSpawnRoot';
  const { bible } = contract;

  if (contract.useSpawnSkyIsland) {
    buildSpawnSkyIsland(scene, curve);
  } else {
    switch (bible.spawnKind) {
      case 'offshore_platform':
        root.add(buildOffshorePlatform(start));
        break;
      case 'repulsor_gate':
        root.add(buildRepulsorGate(start));
        break;
      case 'hangar_mouth':
        root.add(buildHangarMouth(start));
        break;
      case 'airshow_banner':
        root.add(buildAirshowBanner(start));
        break;
      case 'neon_gantry':
        root.add(buildNeonGantry(start));
        break;
      case 'warp_gate_arch':
        root.add(buildWarpGateArch(start));
        break;
      case 'emergency_hq':
        root.add(buildEmergencyHq(start));
        break;
      case 'spawn_sky_island':
        buildSpawnSkyIsland(scene, curve);
        break;
      case 'sky_academy_arch':
      default:
        break;
    }
  }

  if (bible.spawnKind === 'sky_academy_arch' && contract.mode !== 1) {
    placeAerialHero(scene, curve, { hero: { type: 'sky_academy_arch', t: 0.08 } });
  }

  if (root.children.length) scene.add(root);
  return root;
}

export function installFlyingVistaLayer(scene, bounds, contract, curve) {
  if (!scene || !contract?.bible || scene.getObjectByName('FlyingVistaLayer')) return null;

  const vista = getContractEnvironmentVistaId(contract);
  const premiumVista = isPremiumFlyingVista(vista);

  const g = new THREE.Group();
  g.name = 'FlyingVistaLayer';

  if (contract.kidFriendly === true && !premiumVista) {
    installKidFriendlyFlyingWorld(g, scene, curve, bounds, contract);
    scene.add(g);
    installKidFriendlyFlyingLighting(scene);
    scene.userData.flyingVista = 'kid_friendly_sky_garden';
    return g;
  }

  const backdrop = premiumVista
    ? curveFrame(curve, 0.1, 0, 4)
    : worldAt(curve, contract.bible.lowAltitude ? 40 : 52, 0, contract.bible.lowAltitude ? 14 : 20);
  const y = backdrop.baseY;

  installFlyingVistaDetails(g, vista, backdrop, y, bounds, curve);

  scene.add(g);
  let vistaRoot = null;
  g.traverse((c) => {
    if (c.userData?.premiumEnvironment === vista) vistaRoot = c;
  });
  vistaRoot = vistaRoot ?? g.children[0];
  if (vistaRoot && premiumVista) {
    vistaRoot.scale.setScalar(1.32);
    vistaRoot.traverse((c) => { if (c.isMesh) c.frustumCulled = false; });
  }
  if (vistaRoot) installPremiumEnvironmentLighting(scene, vista, vistaRoot);
  scene.userData.flyingVista = vista;
  scene.userData.premiumFlyingVista = premiumVista;
  return g;
}

export function applyFlyingRecipeContract(recipe, contract) {
  if (!recipe || !contract?.bible) return recipe;
  const { bible } = contract;
  const ribbonColors = bible.raceRibbon
    ? [bible.gateColors.primary, bible.gateColors.secondary]
    : null;
  const cloudVista = bible.aerialVista === 'cloud_sea';
  const lowRescue = bible.lowAltitude === true;
  const authored = contract.mission;
  const merged = {
    ...recipe,
    lockSky: true,
    goldenHour: bible.goldenHour === true,
    sky: { ...bible.sky, warmPeach: bible.goldenHour === true && cloudVista },
    gateColors: { ...bible.gateColors },
    aerialVista: bible.aerialVista,
    parallaxClouds: bible.parallaxClouds === true,
    cloudPillars: 0,
    islandScatter: [],
    gltfTrack: null,
    routeYOffset: 0,
    altitudeLimits: lowRescue ? [12, 22]
      : contract.chassisId === 'drone' && contract.mode === 2 ? [24, 30]
      : contract.chassisId === 'drone' && contract.mode === 8 ? [20, 24]
      : contract.chassisId === 'helicopter' && contract.mode === 2 ? [24, 32]
      : contract.chassisId === 'racedrone' && contract.mode === 9 ? [12, 23]
      : contract.chassisId === 'hoverracer' && contract.mode === 9 ? [12, 23]
      : null,
    gates: authored ? {
      ...recipe.gates, ...authored.gates,
      mode: authored.gates.targetCount ? 'mixed' : 'ring',
      ringCount: authored.gates.count,
      startT: contract.mode === 1 ? 8 / (recipe.spline?.length || 185) : 0.08,
      endT: contract.mode === 10 ? 0.9 : 0.92,
      emissiveMax: contract.chassisId === 'steathjet' ? 0.5 : null,
      rollDegrees: contract.chassisId === 'aerobat' && contract.mode === 2 ? 30 : 0,
      stuntRollDegrees: contract.chassisId === 'racedrone' && contract.mode === 7 ? 60 : 45,
    } : recipe.gates,
    hero: bible.allowRecipeHero ? recipe.hero : null,
    raceRibbon: bible.raceRibbon
      ? {
        ...(recipe.raceRibbon || {}),
        colors: ribbonColors || recipe.raceRibbon?.colors,
        width: recipe.raceRibbon?.width || 5,
        boosts: contract.mode <= 3 ? 0 : Math.min(1, recipe.raceRibbon?.boosts || 1),
      }
      : null,
    gateStyle: contract.chassisId,
  };
  return applyModeRecipeFlags(merged, contract);
}

/** Course dressing from arena recipe — storm walls, launch towers, etc. Vista stays chassis-locked. */
export function installFlyingModeScenery(scene, curve, recipe, contract) {
  if (!scene || !curve || !recipe || scene.getObjectByName('FlyingModeScenery')) return null;
  const root = new THREE.Group();
  root.name = 'FlyingModeScenery';
  const recipeId = recipe.id || recipe.label || '';
  const accent = contract?.bible?.gateColors?.primary ?? 0x38bdf8;

  if (recipe.stormClouds || recipe.rain || recipe.stormWall || recipeId.includes('storm') || recipeId.includes('typhoon')) {
    for (let i = 0; i < 5; i++) {
      const t = 0.12 + i * 0.16;
      const p = curve.getPoint(t);
      const wall = addMesh(
        root,
        new THREE.BoxGeometry(28, 22, 3),
        mat(0x334155, { transparent: true, opacity: 0.55 }),
        p.x + (i % 2 ? 18 : -18),
        p.y - 6,
        p.z,
        `StormWall${i}`,
      );
      wall.rotation.y = i % 2 ? -0.35 : 0.35;
    }
  }

  if (recipe.launchTower) {
    const start = curve.getPoint(0);
    addMesh(root, new THREE.CylinderGeometry(5, 6, 55, 10), mat(0x64748b, { metalness: 0.45 }), start.x, start.y - 28, start.z + 8, 'LaunchShaft');
    addMesh(root, new THREE.ConeGeometry(7, 10, 10), mat(0xf97316, { emissive: 0xf97316, emi: 0.55, transparent: true, opacity: 0.7 }), start.x, start.y - 32, start.z + 8, 'LaunchFlame');
  }

  if (recipe.tunnel && !scene.getObjectByName('ModeWindTunnel') && !scene.getObjectByName('DragonTunnel')) {
    const tunnelPts = [];
    for (let i = 0; i <= 36; i++) tunnelPts.push(curve.getPoint(i / 36));
    const tunnelPath = new THREE.CatmullRomCurve3(tunnelPts);
    const tunnelColor = contract?.bible?.aerialVista === 'neon_ribbon' ? 0xec4899 : 0xa855f7;
    const tunnel = new THREE.Mesh(
      new THREE.TubeGeometry(tunnelPath, 64, 5.5, 14, false),
      mat(tunnelColor, { emissive: tunnelColor, emi: 0.42, transparent: true, opacity: 0.22 }),
    );
    tunnel.name = 'FlyingWarpTunnel';
    root.add(tunnel);
  }

  if (recipeId.includes('wind') || recipe.windZones) {
    [-1, 1].forEach((side, i) => {
      const p = curve.getPoint(0.35 + i * 0.2);
      const turbine = addMesh(root, new THREE.CylinderGeometry(0.35, 0.35, 12, 8), mat(0xe2e8f0), p.x + side * 22, p.y - 14, p.z, `TurbineMast${i}`);
      addMesh(root, new THREE.BoxGeometry(9, 0.35, 0.8), mat(0x94a3b8, { metalness: 0.5 }), turbine.position.x, turbine.position.y + 5, turbine.position.z, `Blade${i}`);
    });
  }

  if (recipeId.includes('orbit') || recipeId.includes('warp') || recipe.starfieldAbove) {
    const end = curve.getPoint(0.92);
    addMesh(root, new THREE.TorusGeometry(6, 0.5, 10, 32), mat(accent, { emissive: accent, emi: 0.5 }), end.x, end.y, end.z, 'WarpRing');
    for (let i = 0; i < 24; i++) {
      addMesh(
        root,
        new THREE.SphereGeometry(0.2, 4, 4),
        mat(0xf8fafc, { emissive: 0xffffff, emi: 0.35 }),
        (Math.random() - 0.5) * 100,
        30 + Math.random() * 40,
        end.z - 40 - Math.random() * 60,
        `Star${i}`,
      );
    }
  }

  if (recipeId.includes('volcano') || recipeId.includes('lava')) {
    const p = curve.getPoint(0.55);
    addMesh(root, new THREE.ConeGeometry(14, 20, 12), mat(0x7f1d1d), p.x + 30, -38, p.z - 20, 'Volcano');
    addMesh(root, new THREE.SphereGeometry(4, 10, 8), mat(0xf97316, { emissive: 0xf97316, emi: 0.65 }), p.x + 30, -22, p.z - 20, 'LavaGlow');
  }

  if (recipeId.includes('rooftop') || recipeId.includes('street') || recipeId.includes('delivery')) {
    for (let i = 0; i < 4; i++) {
      const t = 0.2 + i * 0.18;
      const p = curve.getPoint(t);
      const h = 8 + (i % 2) * 4;
      addMesh(root, new THREE.BoxGeometry(7, h, 6), mat(0x57534e), p.x + (i % 2 ? 16 : -16), -38 + h / 2, p.z, `Building${i}`);
      addMesh(root, new THREE.CylinderGeometry(2.2, 2.2, 0.15, 10), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.2 }), p.x + (i % 2 ? 16 : -16), -38 + h + 0.2, p.z, `RoofPad${i}`);
    }
  }

  if (root.children.length) scene.add(root);
  return root;
}

export function installFlyingArenaIdentity(scene, curve, recipe, bounds, contract) {
  if (!contract) return;
  installFlyingSpawnLandmark(scene, curve, contract);
  installFlyingVistaLayer(scene, bounds, contract, curve);
  installFlyingModeScenery(scene, curve, recipe, contract);
  try {
    installFlyingMissionDressing(scene, curve, contract);
  } catch (err) {
    console.warn('[FlyingArena] mission dressing skipped', contract.chassisId, contract.mode, err?.message);
  }
  if (recipe?.hero && contract.bible.allowRecipeHero) {
    const spawnArch = contract.bible.spawnKind === 'sky_academy_arch';
    const duplicateSpawn = spawnArch && recipe.hero.type === 'sky_academy_arch';
    if (!duplicateSpawn) placeAerialHero(scene, curve, recipe);
  }
  applyUE5AerialRenderProfile(scene, contract);
  if (scene.userData.kidFlyingWorld) {
    const studioSky = scene.userData.chassisModeChallenge?.studioSky || contract?.challenge?.studioSky;
    const sky = studioSky
      ? { ...contract.bible.sky, mid: studioSky, top: studioSky, fog: studioSky }
      : contract.bible.sky;
    installKidFriendlyFlyingSky(scene, bounds, sky);
    scene.userData.raceVisual = {
      ...(scene.userData.raceVisual || {}),
      bloom: contract.bible.bloom ?? 0.22,
      threshold: 0.92,
      radius: 0.14,
      grade: { s: 1.12, c: 1.05, g: [1.04, 1.02, 1.06] },
    };
    arenaMover(scene, (time) => animateKidFriendlyFlying(scene, time));
  } else {
    const vistaId = getContractEnvironmentVistaId(contract);
    installUE5AerialAtmosphere(scene, bounds, recipe.sky || contract.bible.sky, recipe, vistaId);
    enhanceAerialMaterials(scene);
    if (vistaId === 'obsidian_citadel') {
      scene.fog = new THREE.FogExp2(0x1e1b4b, 0.0025);
    }
  }
  scene.userData.flyingArenaContract = {
    version: contract.version,
    chassisId: contract.chassisId,
    mode: contract.mode,
    vista: getContractEnvironmentVistaId(contract),
    spawn: contract.bible.spawnKind,
    recipeId: recipe?.id || null,
  };
}
