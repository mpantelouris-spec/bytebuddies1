/**
 * AdventureArenaBuilder — Nintendo-quality non-racing course worlds.
 * Racing courses use RacingCourse.js; everything else routes here.
 */
import * as THREE from 'three';
import {
  buildRobotReef, buildDesertRuins, buildSpaceStation, buildJungleTemple,
  buildCrystalCaves, buildVolcanoIsland, buildCityNeonRush, buildFinalFrontier,
} from './PremiumArenas.js';
import {
  buildFirebotBlazeArena, buildHospitalWalkArena, buildSnowRescueArena,
} from './EmergencyArenaBuilder.js';
import {
  buildMartianPlanetArena, buildCoralReefArena, buildDeepTrenchArena,
  buildKelpForestArena, buildBioluminescentArena, buildShipwreckArena,
  buildFactoryFloorArena, buildWarehouseArena, buildUndergroundMineArena,
  buildFlightRingsArena, buildMuseumHeistArena,
  buildSpiderRescueArena, buildTempleClimbArena, buildSandboxLabArena,
  buildCyberCityArena, buildShadowEscapeArena, buildDesertRallyArena,
  buildWarpGateArena, buildAtlantisArena, buildTsunamiArena, buildMarianaArena,
  buildHydrothermalArena, buildArcticDiveArena, buildSubCanyonArena, buildOceanCurrentArena,
} from './FamilyArenaBuilders.js';
import { applyArenaModeDressing } from './ArenaModeDressing.js';
import {
  addWorldMover, addCollectible, buildCoin, animateCollectible, buildWarpStarfield,
} from '../racing/GameWorldBuilder.js';
import { addHorizonSilhouette } from './ArenaSceneryKit.js';

const RACING_ARENAS = new Set([
  'rainbow_road', 'rainbow_road_master', 'street_grand_prix', 'circuit_sprint', 'sunny_circuit',
  'dragon_skyway', 'volcano_drift', 'time_trial_gauntlet',
  'luigi_circuit', 'moo_moo_meadows', 'mario_circuit', 'peach_castle',
  'dry_dry_desert', 'mushroom_canyon', 'bowser_castle', 'bone_dry_desert',
  'piranha_plant_slide', 'grumble_volcano', 'cheese_land',
  'desert_dunes_01', 'crystal_palace_01', 'sky_island_01', 'volcano_canyon_01',
  'cyber_boulevard_01', 'ice_cavern_01', 'underwater_temple_01', 'moonlight_cavern_01',
  'forest_maze_01', 'cyber_boulevard_01',
]);

const PREMIUM_BUILDERS = {
  robot_reef: buildRobotReef,
  desert_rally: buildDesertRallyArena,
  space: buildSpaceStation,
  space_corridor: buildSpaceStation,
  space_orbit: buildFlightRingsArena,
  space_eva: buildSpaceStation,
  space_station_orbit: buildSpaceStation,
  deep_station: buildSpaceStation,
  jungle: buildJungleTemple,
  forest_trail: buildJungleTemple,
  jungle_bridge: buildJungleTemple,
  jungle_maze: buildJungleTemple,
  rainforest_canopy: buildJungleTemple,
  bamboo_forest: buildJungleTemple,
  temple_maze: buildJungleTemple,
  temple_climb: buildTempleClimbArena,
  temple_maze_course: buildJungleTemple,
  crystal_cave: buildCrystalCaves,
  crystal_caverns: buildCrystalCaves,
  cavern: buildCrystalCaves,
  cave_of_wonders: buildCrystalCaves,
  eel_cavern: buildCrystalCaves,
  tidal_cave: buildCrystalCaves,
  lava_canyon: buildVolcanoIsland,
  rough: buildVolcanoIsland,
  volcanic_climb: buildVolcanoIsland,
  volcanic_flythrough: buildVolcanoIsland,
  undersea_volcano: buildVolcanoIsland,
  volcano_run: buildVolcanoIsland,
  neon_city: buildCityNeonRush,
  cyber_city: buildCyberCityArena,
  city_delivery: buildCityNeonRush,
  night_patrol: buildCyberCityArena,
  city_skyline: buildCityNeonRush,
  museum_heist: buildMuseumHeistArena,
  shadow_escape: buildShadowEscapeArena,
  jump_world: buildJungleTemple,
  deep_cave: buildCrystalCaves,
  auto_factory: buildFactoryFloorArena,
  alien_planet: buildMartianPlanetArena,
  warp_gate: buildFlightRingsArena,
  underwater: buildCoralReefArena,
  coral_reef: buildCoralReefArena,
  coral_reef_survey: buildCoralReefArena,
  deep_trench: buildDeepTrenchArena,
  deep_trench_course: buildDeepTrenchArena,
  kelp_forest: buildKelpForestArena,
  bioluminescent: buildBioluminescentArena,
  shipwreck: buildShipwreckArena,
  factory_floor: buildFactoryFloorArena,
  warehouse: buildWarehouseArena,
  warehouse_sort: buildWarehouseArena,
  underground_mine: buildUndergroundMineArena,
  spider_rescue: buildSpiderRescueArena,
  checkpoint: buildSandboxLabArena,
  targets: buildSandboxLabArena,
  delivery: buildSandboxLabArena,
  power_garden: buildSandboxLabArena,
  drone_canyon: buildFlightRingsArena,
  pipeline_crawl: buildSpiderRescueArena,
  urban_obstacle: buildSandboxLabArena,
  jet_stunt: buildFlightRingsArena,
  storm_cloud: buildFlightRingsArena,
  cloud_race: buildFlightRingsArena,
  colosseum: buildTempleClimbArena,
  collapsed_building: buildSpiderRescueArena,
  volcano_drift: buildWarpGateArena,
  flight_rings: buildFlightRingsArena,
  arctic_dive: buildArcticDiveArena,
  hydrothermal: buildHydrothermalArena,
  sub_canyon: buildSubCanyonArena,
  ice_shelf: buildArcticDiveArena,
  current_maze: buildOceanCurrentArena,
  whale_route: buildOceanCurrentArena,
  pirate_wreck: buildShipwreckArena,
  seagrass: buildKelpForestArena,
  squid_chase: buildOceanCurrentArena,
  atlantis: buildAtlantisArena,
  tsunami: buildTsunamiArena,
  mariana: buildMarianaArena,
  ocean_race: buildOceanCurrentArena,
  submarine_race: buildOceanCurrentArena,
  seafloor_scan: buildBioluminescentArena,
  firebot_blaze: buildFirebotBlazeArena,
  hospital_walk: buildHospitalWalkArena,
  snow_rescue: buildSnowRescueArena,
  canyon_flight: buildFlightRingsArena,
  line_follow: buildSandboxLabArena,
  rooftop_delivery: buildFlightRingsArena,
  typhoon: buildFlightRingsArena,
  spider_pipeline: buildSpiderRescueArena,
  arctic_station: buildSnowRescueArena,
  sky_island: buildWarpGateArena,
  sky_garden: buildWarpGateArena,
  temple_ext: buildTempleClimbArena,
  arm_sort: buildWarehouseArena,
  boss_arena: buildTempleClimbArena,
  dodge_easy: buildSandboxLabArena,
  escape_wall: buildShadowEscapeArena,
};

const THEME_MAP = {
  forest: ['farm_harvest', 'flooded_city'],
  arctic: ['arctic_station', 'arctic_survey', 'glacier_flyover', 'ice_palace', 'snow_rescue'],
  desert: ['desert_air'],
  volcano: ['toxic_wasteland', 'fire_maze'],
  temple: ['haunted_graveyard', 'haunted_mansion', 'colosseum', 'ancient_colosseum'],
  mine: ['underground_mine', 'mine_shaft'],
  sky: [
    'canyon_flight', 'canyon_flight_course', 'storm_cloud', 'storm_cloud_chase',
    'cloud_race', 'cloud_fortress', 'coastal_rescue', 'mountain_fly', 'mountain_pass',
    'mountain_pass_nav', 'rooftop_delivery', 'fireworks', 'fireworks_display',
    'drone_league', 'drone_racing_league', 'typhoon', 'glider',
  ],
  carnival: ['carnival_funfair', 'pirate_dock'],
  industrial: ['pipeline_crawl', 'factory_floor', 'factory_rush', 'urban_obstacle'],
  military: ['military_base', 'collapsed_building', 'cargo_ship'],
  hospital: ['hospital_walk', 'hospital_nav'],
  sewer: ['sewers'],
  sky_garden: ['sky_garden'],
  robot_museum: ['robot_museum'],
  cyber: ['cyber_dungeon'],
};

const ARENA_THEME = {};
for (const [theme, ids] of Object.entries(THEME_MAP)) {
  ids.forEach((id) => { ARENA_THEME[id] = theme; });
}

const THEMES = {
  forest: {
    sky: [0x1a4020, 0x3a6830, 0x6a9850, 0x0a1808],
    fog: [0x142810, 0.022],
    terrain: 0x2d5a1a,
    path: 0xc4956a,
    glow: 0x4ade80,
    goal: [0xffd700, 0x22c55e],
    ambient: { color: 0x1a3010, intensity: 0.45 },
    sun: { color: 0x88ff44, intensity: 0.55, pos: { x: 12, y: 18, z: 8 } },
    particles: { count: 200, color: 0xa3e635, size: 0.08, speed: 0.2, opacity: 0.6 },
    label: 'FOREST CHECKPOINT',
  },
  arctic: {
    sky: [0x446688, 0x88aacc, 0xddeeff, 0xe8f4ff],
    fog: [0xaaccee, 0.012],
    terrain: 0xd8ecff,
    path: 0xb8d4f0,
    glow: 0x93c5fd,
    goal: [0xffffff, 0x4499ff],
    ambient: { color: 0x8899bb, intensity: 0.75 },
    sun: { color: 0xffffff, intensity: 0.95, pos: { x: 8, y: 22, z: 5 } },
    particles: { count: 180, color: 0xffffff, size: 0.06, speed: 0.15, opacity: 0.5 },
    label: 'ICE STATION',
  },
  desert: {
    sky: [0x1a0d00, 0x7a3500, 0xd47020, 0xf0a040],
    fog: [0xc49050, 0.011],
    terrain: 0xd4a553,
    path: 0xe8c878,
    glow: 0xfbbf24,
    goal: [0xffd700, 0xff8f00],
    ambient: { color: 0x6b3a00, intensity: 0.4 },
    sun: { color: 0xffcc66, intensity: 1.2, pos: { x: -15, y: 12, z: -8 } },
    particles: { count: 320, color: 0xd4a030, size: 0.04, speed: 0.85, opacity: 0.28 },
    label: 'OASIS GATE',
  },
  volcano: {
    sky: [0x1a0500, 0x4a1800, 0x8a2800, 0x200800],
    fog: [0x200800, 0.028],
    terrain: 0x2a0a00,
    path: 0x5a3010,
    glow: 0xff4400,
    goal: [0xff6600, 0xff2200],
    ambient: { color: 0x200800, intensity: 0.35 },
    sun: { color: 0xff6600, intensity: 0.7, pos: { x: 5, y: 14, z: 10 } },
    particles: { count: 160, color: 0xff5500, size: 0.1, speed: 0.35, opacity: 0.55 },
    label: 'CRATER EXIT',
  },
  temple: {
    sky: [0x080608, 0x201018, 0x402028, 0x0a0608],
    fog: [0x100810, 0.032],
    terrain: 0x1a1218,
    path: 0x8a7060,
    glow: 0xff8800,
    goal: [0xffd700, 0xff6600],
    ambient: { color: 0x080508, intensity: 0.32 },
    sun: { color: 0x886644, intensity: 0.45, pos: { x: 4, y: 10, z: 6 } },
    particles: { count: 120, color: 0xffaa44, size: 0.07, speed: 0.12, opacity: 0.45 },
    label: 'TEMPLE GATE',
  },
  mine: {
    sky: [0x050308, 0x0a0610, 0x120818, 0x050308],
    fog: [0x080510, 0.038],
    terrain: 0x1a1015,
    path: 0x4a4038,
    glow: 0x8855ff,
    goal: [0xffaa44, 0x8855ff],
    ambient: { color: 0x050308, intensity: 0.25 },
    sun: { color: 0xffaa44, intensity: 0.35, pos: { x: 0, y: 8, z: 4 } },
    particles: { count: 100, color: 0x8855ff, size: 0.09, speed: 0.1, opacity: 0.5 },
    label: 'MINE EXIT',
  },
  sky: {
    sky: [0x060c1a, 0x1a3060, 0x4488cc, 0x0a1628],
    fog: [0x0c1f3a, 0.008],
    terrain: 0x1e3a5f,
    path: 0x38bdf8,
    glow: 0x00d9ff,
    goal: [0x00d9ff, 0xfbbf24],
    ambient: { color: 0x0a1628, intensity: 0.4 },
    sun: { color: 0x88ccff, intensity: 0.6, pos: { x: 10, y: 20, z: -5 } },
    particles: { count: 400, color: 0xffffff, size: 0.12, speed: 0.08, opacity: 0.7 },
    label: 'SKY GATE',
    aerial: true,
  },
  carnival: {
    sky: [0x1a0830, 0x4a1860, 0xff4488, 0x2a1040],
    fog: [0x2a1048, 0.018],
    terrain: 0x3a2048,
    path: 0xff88cc,
    glow: 0xf43f5e,
    goal: [0xffd700, 0xff00aa],
    ambient: { color: 0x2a1040, intensity: 0.5 },
    sun: { color: 0xff88cc, intensity: 0.5, pos: { x: 0, y: 15, z: 0 } },
    particles: { count: 240, color: 0xff44aa, size: 0.09, speed: 0.25, opacity: 0.65 },
    label: 'FUNFAIR FINISH',
  },
  industrial: {
    sky: [0x050508, 0x0a0a14, 0x141420, 0x050508],
    fog: [0x050508, 0.025],
    terrain: 0x1a1a22,
    path: 0x556677,
    glow: 0xffcc44,
    goal: [0xffcc44, 0x06b6d4],
    ambient: { color: 0x050508, intensity: 0.45 },
    sun: { color: 0xffeedd, intensity: 0.65, pos: { x: 0, y: 12, z: 8 } },
    particles: { count: 140, color: 0x8899aa, size: 0.05, speed: 0.18, opacity: 0.4 },
    label: 'FACTORY EXIT',
  },
  military: {
    sky: [0x0a1005, 0x1a2510, 0x2a3520, 0x080c04],
    fog: [0x0d1508, 0.028],
    terrain: 0x1a2510,
    path: 0x4a5530,
    glow: 0x44aa22,
    goal: [0xffaa44, 0x44aa22],
    ambient: { color: 0x0a1005, intensity: 0.4 },
    sun: { color: 0x88aa44, intensity: 0.45, pos: { x: 8, y: 14, z: 6 } },
    particles: { count: 100, color: 0x668844, size: 0.05, speed: 0.12, opacity: 0.35 },
    label: 'EXTRACTION POINT',
  },
  hospital: {
    sky: [0xe8e8f0, 0xf0f0f8, 0xf8f8ff, 0xe0e4f0],
    fog: [0xe8ecf4, 0.01],
    terrain: 0xf0f0f5,
    path: 0xdde4f0,
    glow: 0x22c55e,
    goal: [0xff2200, 0x22c55e],
    ambient: { color: 0x888899, intensity: 0.85 },
    sun: { color: 0xffffff, intensity: 0.75, pos: { x: 0, y: 12, z: 5 } },
    particles: { count: 60, color: 0x88aacc, size: 0.04, speed: 0.08, opacity: 0.3 },
    label: 'WARD DELIVERY',
  },
  sewer: {
    sky: [0x050308, 0x080510, 0x0a0612, 0x030206],
    fog: [0x080510, 0.042],
    terrain: 0x1a1520,
    path: 0x3a3540,
    glow: 0x44ff66,
    goal: [0xffaa44, 0x44ff66],
    ambient: { color: 0x050308, intensity: 0.28 },
    sun: { color: 0xffaa44, intensity: 0.25, pos: { x: 0, y: 6, z: 0 } },
    particles: { count: 80, color: 0x556655, size: 0.06, speed: 0.08, opacity: 0.35 },
    label: 'DRAIN OUTLET',
  },
  sky_garden: {
    sky: [0x88aacc, 0xaaccee, 0xddeeff, 0xc8d8f0],
    fog: [0xaaccee, 0.01],
    terrain: 0x88cc88,
    path: 0xf9a8d4,
    glow: 0x88ff88,
    goal: [0xf472b6, 0x88ff88],
    ambient: { color: 0x8899cc, intensity: 0.8 },
    sun: { color: 0xffffff, intensity: 0.85, pos: { x: 5, y: 18, z: 2 } },
    particles: { count: 200, color: 0xf9a8d4, size: 0.08, speed: 0.15, opacity: 0.55 },
    label: 'GARDEN BRIDGE',
    aerial: true,
  },
  robot_museum: {
    sky: [0x050508, 0x101020, 0x202040, 0x080810],
    fog: [0x050508, 0.02],
    terrain: 0xddccaa,
    path: 0x4488ff,
    glow: 0x38bdf8,
    goal: [0x4488ff, 0xfbbf24],
    ambient: { color: 0x080810, intensity: 0.5 },
    sun: { color: 0xffeedd, intensity: 0.75, pos: { x: 5, y: 16, z: 5 } },
    particles: { count: 100, color: 0x4488ff, size: 0.06, speed: 0.1, opacity: 0.4 },
    label: 'EXHIBIT HALL',
  },
  cyber: {
    sky: [0x000010, 0x000820, 0x001040, 0x000008],
    fog: [0x000015, 0.035],
    terrain: 0x050520,
    path: 0x00ffcc,
    glow: 0x00ffcc,
    goal: [0x00ffcc, 0xff00cc],
    ambient: { color: 0x000010, intensity: 0.35 },
    sun: { color: 0x4444ff, intensity: 0.3, pos: { x: 0, y: 12, z: 0 } },
    particles: { count: 280, color: 0x00ffcc, size: 0.07, speed: 0.22, opacity: 0.55 },
    label: 'DATA CORE',
  },
};

function _mover(scene, fn) {
  (scene.userData.movers = scene.userData.movers || []).push({ update: fn });
}

function _makeSky(scene, stops) {
  const c = document.createElement('canvas');
  c.width = 2; c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  stops.forEach(([t, hex]) => g.addColorStop(t, `#${hex.toString(16).padStart(6, '0')}`));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
}

function _makeTerrain(scene, baseHex, variation, maxY) {
  const segs = 24;
  const geo = new THREE.PlaneGeometry(100, 100, segs, segs);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getX(i)) < 48 && Math.abs(pos.getY(i)) < 48) {
      pos.setZ(i, (Math.random() - 0.5) * maxY);
    }
  }
  geo.computeVertexNormals();
  const nonIdx = geo.toNonIndexed();
  nonIdx.computeVertexNormals();
  const pArr = nonIdx.attributes.position.array;
  const colors = new Float32Array(pArr.length);
  const base = new THREE.Color(baseHex);
  for (let f = 0; f < pArr.length / 9; f++) {
    const l = base.clone();
    l.offsetHSL(0, 0, (Math.random() - 0.5) * variation);
    for (let v = 0; v < 3; v++) {
      colors[(f * 9) + v * 3] = l.r;
      colors[(f * 9) + v * 3 + 1] = l.g;
      colors[(f * 9) + v * 3 + 2] = l.b;
    }
  }
  nonIdx.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(nonIdx, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function _lighting(scene, theme) {
  scene.add(new THREE.AmbientLight(theme.ambient.color, theme.ambient.intensity));
  const hemi = new THREE.HemisphereLight(theme.glow, theme.terrain, 0.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(theme.sun.color, theme.sun.intensity);
  sun.position.set(theme.sun.pos.x, theme.sun.pos.y, theme.sun.pos.z);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(1024);
  scene.add(sun);
}

function _ambientParticles(scene, cfg) {
  const count = cfg.count;
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 1] = Math.random() * (cfg.aerial ? 18 : 10);
    pos[i * 3 + 2] = (Math.random() * 40) - 35;
    vel[i * 3] = (Math.random() - 0.5) * cfg.speed;
    vel[i * 3 + 1] = (Math.random() * 0.3 + 0.05) * cfg.speed;
    vel[i * 3 + 2] = (Math.random() - 0.5) * cfg.speed * 0.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: cfg.color, size: cfg.size, transparent: true, opacity: cfg.opacity,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  addWorldMover(scene, (t, dt) => {
    const a = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      a[i * 3] += vel[i * 3] * dt;
      a[i * 3 + 1] += vel[i * 3 + 1] * dt;
      a[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (a[i * 3 + 2] < -42) a[i * 3 + 2] = 6;
      if (a[i * 3 + 1] > (cfg.aerial ? 20 : 12)) a[i * 3 + 1] = 0;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = cfg.opacity * (0.85 + Math.sin(t * 1.2) * 0.12);
  });
}

function _buildPath(scene, theme) {
  const points = [
    new THREE.Vector3(0, theme.aerial ? 2 : 0.08, 4),
    new THREE.Vector3(-5, theme.aerial ? 3 : 0.08, -4),
    new THREE.Vector3(4, theme.aerial ? 4 : 0.08, -12),
    new THREE.Vector3(-3, theme.aerial ? 5 : 0.08, -20),
    new THREE.Vector3(2, theme.aerial ? 6 : 0.08, -28),
    new THREE.Vector3(0, theme.aerial ? 7 : 0.08, -36),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const pathMat = new THREE.MeshStandardMaterial({
    color: theme.path, emissive: theme.glow, emissiveIntensity: 0.35, roughness: 0.75, metalness: 0.1,
  });
  const edgeMat = new THREE.MeshStandardMaterial({
    color: theme.glow, emissive: theme.glow, emissiveIntensity: 0.9, roughness: 0.4,
  });
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const yaw = Math.atan2(tan.x, tan.z);
    const tile = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.12, 2.2), pathMat);
    tile.position.copy(p);
    tile.rotation.y = yaw;
    tile.receiveShadow = true;
    scene.add(tile);
    [-2.9, 2.9].forEach((side) => {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 2.4), edgeMat);
      edge.position.copy(p);
      edge.rotation.y = yaw;
      edge.translateX(side);
      scene.add(edge);
    });
    if (i % 4 === 0 && i > 0) {
      const coin = buildCoin(1.05);
      const off = p.clone();
      off.y += 0.9;
      off.x += Math.sin(i * 1.7) * 2.2;
      scene.add(coin);
      addCollectible(scene, coin, off.x, off.y, off.z, 12, 1.0, 'coin');
      animateCollectible(coin, i * 0.9);
    }
  }
  const end = points[points.length - 1];
  scene.userData.finishZone = { x: end.x, z: end.z, radius: 4 };
  return end;
}

function _buildGoalBeacon(scene, x, z, col1, col2, label) {
  const beamMat = new THREE.MeshBasicMaterial({
    color: col1, transparent: true, opacity: 0.14, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 2.2, 12, 16, 1, true), beamMat);
  beam.position.set(x, 6, z);
  scene.add(beam);
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 16),
    new THREE.MeshStandardMaterial({ color: col1, emissive: col1, emissiveIntensity: 1.4 }),
  );
  orb.position.set(x, 1.6, z);
  scene.add(orb);
  const pl = new THREE.PointLight(col1, 3.5, 18);
  pl.position.set(x, 2, z);
  scene.add(pl);
  const cnv = document.createElement('canvas');
  cnv.width = 320; cnv.height = 72;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.roundRect(4, 4, 312, 64, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, 160, 42);
  const lbl = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 0.78),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
  );
  lbl.position.set(x, 3.8, z);
  scene.add(lbl);
  addWorldMover(scene, (t) => {
    orb.scale.setScalar(0.92 + Math.sin(t * 3) * 0.08);
    pl.intensity = 2.8 + Math.sin(t * 2.5) * 0.8;
    beamMat.opacity = 0.1 + Math.sin(t * 1.6) * 0.06;
  });
}

function _addThemeProps(scene, themeKey) {
  if (themeKey === 'forest') {
    const tMat = new THREE.MeshStandardMaterial({ color: 0x2d4a1a, roughness: 0.85 });
    for (let i = 0; i < 36; i++) {
      const h = 4 + Math.random() * 5;
      const x = (Math.random() - 0.5) * 45;
      const z = -Math.random() * 38;
      if (Math.abs(x) < 4) continue;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, h, 7), tMat);
      trunk.position.set(x, h / 2, z);
      scene.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8 + Math.random(), 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x3a7a28, roughness: 0.9 }));
      crown.position.set(x, h + 1.2, z);
      scene.add(crown);
    }
  } else if (themeKey === 'arctic') {
    const iMat = new THREE.MeshStandardMaterial({ color: 0xaaddff, roughness: 0.05, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 14; i++) {
      const h = 1.5 + Math.random() * 4;
      const x = (Math.random() - 0.5) * 40;
      const z = -Math.random() * 35;
      if (Math.abs(x) < 4) continue;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.35, h, 6), iMat);
      spike.position.set(x, h / 2, z);
      scene.add(spike);
    }
  } else if (themeKey === 'desert') {
    const dMat = new THREE.MeshStandardMaterial({ color: 0xc8903a, roughness: 1 });
    for (let i = 0; i < 10; i++) {
      const h = 1.5 + Math.random() * 3;
      const x = (Math.random() - 0.5) * 50;
      const z = -Math.random() * 35;
      if (Math.abs(x) < 5) continue;
      const dune = new THREE.Mesh(new THREE.CylinderGeometry(2 + Math.random() * 2, 3.5, h, 10), dMat);
      dune.position.set(x, h / 2, z);
      scene.add(dune);
    }
  } else if (themeKey === 'sky' || themeKey === 'sky_garden') {
    const platMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.25, emissive: 0x0ea5e9, emissiveIntensity: 0.2 });
    for (let i = 0; i < 8; i++) {
      let x = (Math.random() - 0.5) * 30;
      if (Math.abs(x) < 4) x += x < 0 ? -4 : 4;
      const plat = new THREE.Mesh(new THREE.BoxGeometry(5, 0.35, 5), platMat);
      plat.position.set(x, 1 + Math.random() * 6, -4 - i * 4.5);
      scene.add(plat);
    }
    buildWarpStarfield(scene, 280);
  } else if (themeKey === 'carnival') {
    const wheel = new THREE.Group();
    wheel.position.set(-12, 0, -18);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(5, 0.35, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xff4488, emissive: 0xff2288, emissiveIntensity: 0.5 }));
    rim.rotation.y = Math.PI / 2;
    wheel.add(rim);
    scene.add(wheel);
    addWorldMover(scene, (t) => { wheel.rotation.z = t * 0.15; });
  } else if (themeKey === 'temple' || themeKey === 'mine') {
    const pMat = new THREE.MeshStandardMaterial({ color: 0x3a3040, roughness: 0.92 });
    for (let i = 0; i < 10; i++) {
      const x = (Math.random() - 0.5) * 35;
      const z = -Math.random() * 32;
      if (Math.abs(x) < 3) continue;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 4 + Math.random() * 2, 8), pMat);
      col.position.set(x, 2, z);
      scene.add(col);
    }
  }
}

function _buildThemedAdventure(scene, themeKey, challenge) {
  const theme = THEMES[themeKey] || THEMES.forest;
  const missionMode = challenge?.isRobotMission || scene.userData?.missionChallenge?.isRobotMission;
  scene.fog = new THREE.FogExp2(theme.fog[0], theme.fog[1]);
  _makeSky(scene, [[0, theme.sky[0]], [0.35, theme.sky[1]], [0.72, theme.sky[2]], [1, theme.sky[3]]]);
  _lighting(scene, theme);
  if (!theme.aerial) _makeTerrain(scene, theme.terrain, 0.14, themeKey === 'desert' ? 1.0 : 0.55);
  _ambientParticles(scene, { ...theme.particles, aerial: theme.aerial });
  _addThemeProps(scene, themeKey);
  if (!scene.getObjectByName('HorizonSilhouette')) {
    const horizonFamily = themeKey === 'sky' || themeKey === 'sky_garden' ? 'sky_aerial'
      : themeKey === 'industrial' || themeKey === 'mine' ? 'industrial'
        : themeKey === 'hospital' ? 'emergency'
          : themeKey === 'cyber' ? 'cyber_ninja'
            : themeKey === 'arctic' ? 'emergency'
              : 'martian';
    addHorizonSilhouette(scene, horizonFamily);
  }
  scene.userData.customSky = true;
  scene.userData.expMood = themeKey === 'sky' ? 0.85 : 1.0;
  if (missionMode) {
    scene.userData.collectibles = [];
    scene.userData.obstacles = [];
    delete scene.userData.finishZone;
    return;
  }
  const end = _buildPath(scene, theme);
  _buildGoalBeacon(scene, end.x, end.z, theme.goal[0], theme.goal[1], theme.label);
}

function _resolveTheme(arenaType) {
  if (ARENA_THEME[arenaType]) return ARENA_THEME[arenaType];
  if (/forest|farm|jungle|garden|bridge|canopy|bamboo|seagrass|kelp/i.test(arenaType)) return 'forest';
  if (/arctic|ice|glacier|snow/i.test(arenaType)) return 'arctic';
  if (/desert|dune|sand/i.test(arenaType)) return 'desert';
  if (/volcano|lava|toxic|fire|blaze/i.test(arenaType)) return 'volcano';
  if (/temple|haunted|grave|colosseum|cave|maze|dungeon|wonder/i.test(arenaType)) return 'temple';
  if (/mine|underground|shaft|sewer|pipeline/i.test(arenaType)) return 'mine';
  if (/sky|cloud|flight|canyon|storm|typhoon|orbit|aerial|drone|jet|warp|mountain|coastal|firework/i.test(arenaType)) return 'sky';
  if (/carnival|pirate|funfair/i.test(arenaType)) return 'carnival';
  if (/factory|industrial|warehouse|urban|cyber|museum|city/i.test(arenaType)) return 'industrial';
  if (/military|collapsed|cargo|war|combat/i.test(arenaType)) return 'military';
  if (/hospital|med|triage|ward/i.test(arenaType)) return 'hospital';
  return 'forest';
}

/** Build a premium non-racing adventure world for the given arena type. */
export function buildAdventureArena(scene, arenaType, _challenge) {
  if (RACING_ARENAS.has(arenaType)) return;

  const challenge = _challenge || scene.userData?.chassisModeChallenge || scene.userData?.missionChallenge;

  const premium = PREMIUM_BUILDERS[arenaType];
  if (premium) {
    premium(scene, challenge);
    scene.userData.customSky = true;
    if (!challenge?.isChassisMode && !challenge?.isRobotMission) {
      applyArenaModeDressing(scene, arenaType, challenge);
    }
    return;
  }

  const theme = _resolveTheme(arenaType);
  _buildThemedAdventure(scene, theme, challenge);
  if (!challenge?.isChassisMode && !challenge?.isRobotMission) {
    applyArenaModeDressing(scene, arenaType, challenge);
  }
}
