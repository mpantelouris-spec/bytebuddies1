/**
 * Runtime form of ROBOT CHAPTER DEEP SPEC.
 * Palette/identity remains in CHASSIS_VISUAL_DNA; this file locks measurable
 * camera, fog, lighting and post values plus the two fully-authored gold chapters.
 */

const CAMERA_RIGS = {
  rover_wide: { camBack: 10.5, camUp: 5.2, lookAhead: 8, lookHeight: 1.0, fov: 54 },
  factory_overview: { camBack: 7.5, camUp: 4.2, lookAhead: 5.5, lookHeight: 1, fov: 48 },
  underwater_follow: { camBack: 6.6, camUp: 2.6, lookAhead: 5, lookHeight: 0.5, fov: 52 },
  chase_close: { camBack: 8.6, camUp: 3.8, lookAhead: 6, lookHeight: 0.8, fov: 54 },
  aerial_chase: { camBack: 10.5, camUp: 5.8, lookAhead: 12, lookHeight: 3, fov: 48 },
  stealth_follow: { camBack: 6.8, camUp: 3, lookAhead: 5, lookHeight: 1, fov: 48 },
  climber_follow: { camBack: 6.2, camUp: 5.2, lookAhead: 4, lookHeight: 2, fov: 48 },
  fight_broadcast: { camBack: 0, camUp: 3, lookAhead: 0, lookHeight: 1, fov: 50 },
  side_scroll: { camBack: 0, camUp: 0.55, lookAhead: 0, lookHeight: 0.35, fov: 50 },
  lab_overview: { camBack: 7, camUp: 3.6, lookAhead: 5, lookHeight: 0.5, fov: 50 },
};

const GROUND_LIGHT = {
  keyColor: 0xfff1d6, keyIntensity: 1.35, keyPosition: [-8, 14, -6],
  hemiSky: 0xfffbeb, hemiIntensity: 1.25, shadowMap: 1024,
};
const AERIAL_LIGHT = {
  keyColor: 0xffd89b, keyIntensity: 1.45, keyPosition: [28, 42, 18],
  hemiSky: 0x87ceeb, hemiIntensity: 0.55, shadowMap: 2048,
};
const COMBAT_LIGHT = {
  keyColor: 0xfff4d6, keyIntensity: 1.35, keyPosition: [-5, 9, -6],
  hemiSky: 0xfffbeb, hemiIntensity: 1.25, shadowMap: 1024,
};

function ground(camera = 'chase_close', fogNear = 48, fogFar = 125, bloom = 0.14) {
  return {
    camera, cameraRig: CAMERA_RIGS[camera], fogNear, fogFar,
    lighting: GROUND_LIGHT, post: { bloom, threshold: 0.92, radius: 0.14 },
    robotScreenFraction: [0.25, 0.35],
  };
}
function aerial() {
  return {
    camera: 'aerial_chase', cameraRig: CAMERA_RIGS.aerial_chase, fogNear: 90, fogFar: 320,
    lighting: AERIAL_LIGHT, post: { bloom: 0.24, threshold: 0.88, radius: 0.18 },
    robotScreenFraction: [0.25, 0.3],
  };
}
function combat() {
  return {
    camera: 'fight_broadcast', cameraRig: CAMERA_RIGS.fight_broadcast, fogNear: 48, fogFar: 125,
    lighting: COMBAT_LIGHT, post: { bloom: 0.1, threshold: 0.94, radius: 0.12 },
    robotScreenFraction: [0.25, 0.35],
  };
}

/** One complete numeric row for every non-kart/non-football chassis. */
export const ROBOT_DEEP_RENDER_SPEC = {
  crawler: { ...ground('rover_wide'), robotScreenFraction: [0.28, 0.32] },
  tank: combat(),
  stealth: ground('stealth_follow'),
  miningbot: ground('factory_overview', 28, 95),
  securitybot: ground('chase_close'),
  farmbot: ground('rover_wide'),
  spider: ground('climber_follow'),
  droid: ground('chase_close'),
  mech: ground('chase_close'),
  drone: aerial(),
  racedrone: aerial(),
  rescuedrone: ground('chase_close'),
  helicopter: aerial(),
  hoverbot: aerial(),
  hoverracer: aerial(),
  submarine: ground('underwater_follow', 35, 110, 0.18),
  deepseabot: ground('underwater_follow', 28, 95, 0.18),
  robotarm: ground('lab_overview'),
  factorybot: ground('factory_overview'),
  spacerover: ground('rover_wide'),
  legobot: ground('rover_wide'),
  battlebot: combat(),
  striker: combat(),
  blaster: combat(),
  ninja: ground('stealth_follow'),
  berserker: combat(),
  medbot: ground('chase_close'),
  firebot: ground('chase_close'),
  jetplane: aerial(),
  steathjet: aerial(),
  aerobat: aerial(),
  birdbot: ground('side_scroll'),
  custom: ground('lab_overview'),
};

const CRAWLER_GOLD = [
  ['crawler_rocky_mountain_climb', 'stepped_terraces', 'Summit flag', 'Proud first climb'],
  ['crawler_mud_puddle_traction_test', 'mud_basins', 'Traction warning sign', 'Silly splashes'],
  ['crawler_log_bridge_crossing', 'rope_bridge', 'Rope bridge knot posts', 'Careful crossing'],
  ['crawler_boulder_field_crawl', 'boulder_zigzag', 'NASA sample flag', 'Explorer dodge'],
  ['crawler_trench_explorer', 'shallow_trench', 'Comm dish', 'Discovery'],
  ['crawler_sand_dune_drift', 'dune_ridges', 'Windsock', 'Fast slide'],
  ['crawler_earthquake_hazard_trial', 'seismic_plates', 'Seismic sensor', 'Dramatic tension'],
  ['crawler_heavy_incline_hold', 'incline_hold', 'Heavy load crate', 'Determination'],
  ['crawler_wilderness_search_patrol', 'patrol_zones', 'Zone beacon pillars', 'Search adventure'],
  ['crawler_all_terrain_master', 'crawler_capstone', 'Gold NASA flag', 'Champion moment'],
];

const JET_GOLD = [
  ['jetplane_supersonic_dogfight', 'ace_slalom', 'Spawn island and carrier', 'Reference quality — welcoming ace',
    { spline: { kind: 'canyon_slalom', count: 14, start: [0, 24, 0], end: [0, 22, -180], length: 180 }, gates: 6 }],
  ['jetplane_precision_air_strike', 'precision_dive', 'Cloud-layer bullseye', 'Focused strike',
    { spline: { kind: 'straight', count: 12, start: [0, 32, 0], end: [0, 12, -150], length: 150 }, gates: 1, target: true, routeYOffset: 0 }],
  ['jetplane_aircraft_carrier_touch_and_go', 'carrier_pass', 'Aircraft carrier deck', 'Navy cool',
    { spline: { kind: 'straight', count: 12, start: [0, 8, 0], end: [0, 8, -150], length: 150 }, gates: 4, routeYOffset: 0 }],
  ['jetplane_mach_2_speed_trap', 'mach_straight', 'MACH 2 speed arch', 'Adrenaline',
    { spline: { kind: 'straight', count: 14, start: [0, 24, 0], end: [0, 24, -220], length: 220 }, gates: 8, fov: 52, routeYOffset: 0 }],
  ['jetplane_radar_evasion_stealth_flight', 'day_radar_evasion', 'Rotating radar dish', 'Sneaky tension',
    { spline: { kind: 'canyon_slalom', count: 14, start: [0, 24, 0], end: [0, 20, -180], length: 180 }, gates: 6, stormTint: true, routeYOffset: 0 }],
  ['jetplane_missile_jammer_countermeasures', 'jammer_figure8', 'Twin jammer pylons', 'Tech hero',
    { spline: { kind: 'figure8', count: 16, centerY: 23, amplitude: 5, length: 190 }, gates: 7, routeYOffset: 0 }],
  ['jetplane_mid_air_tanker_refuel', 'tanker_corridor', 'Tanker and fuel hose', 'Calm precision',
    { spline: { kind: 'straight', count: 14, start: [0, 24, 0], end: [0, 24, -175], length: 175 }, gates: 5, routeYOffset: 0 }],
  ['jetplane_canyon_run_precision', 'open_canyon_slalom', 'Offset canyon citadel', 'Skill test',
    { spline: { kind: 'canyon_slalom', count: 16, start: [0, 20, 0], end: [0, 18, -190], length: 190 }, gates: 8, routeYOffset: 0 }],
  ['jetplane_escort_transport_jet', 'escort_corridor', 'Transport plane silhouette', 'Team mission',
    { spline: { kind: 'straight', count: 14, start: [0, 25, 0], end: [0, 25, -190], length: 190 }, gates: 6, routeYOffset: 0 }],
  ['jetplane_top_gun_ace_fighter', 'ace_capstone', 'Gold ace banner', 'Movie finale',
    { spline: { kind: 'capstone_sections', count: 18, length: 220 }, gates: 8, routeYOffset: 0 }],
];

function modeRows(chassisId, rows) {
  return Object.fromEntries(rows.map((row, index) => [row[0], {
    chassisId,
    modeNumber: index + 1,
    missionId: row[0],
    layoutKind: row[1],
    heroProp: row[2],
    mood: row[3],
    recipe: row[4] || null,
  }]));
}

export const GOLD_CHAPTER_MODES = {
  ...modeRows('crawler', CRAWLER_GOLD),
  ...modeRows('jetplane', JET_GOLD),
};

export function getRobotDeepRenderSpec(chassisId, modeNumber = 1) {
  const base = ROBOT_DEEP_RENDER_SPEC[chassisId] || ROBOT_DEEP_RENDER_SPEC.custom;
  const cameraRig = { ...base.cameraRig };
  if (chassisId === 'jetplane' && Number(modeNumber) === 4) cameraRig.fov = 52;
  return {
    ...base,
    cameraRig,
    lighting: { ...base.lighting },
    post: { ...base.post },
    robotScreenFraction: [...base.robotScreenFraction],
  };
}

export function getGoldChapterMode(challenge = {}) {
  if (challenge.id && GOLD_CHAPTER_MODES[challenge.id]) return GOLD_CHAPTER_MODES[challenge.id];
  const chassisId = challenge.chassisId;
  const modeNumber = Number(challenge.modeIndex || challenge.modeNumber || 1);
  return Object.values(GOLD_CHAPTER_MODES)
    .find((mode) => mode.chassisId === chassisId && mode.modeNumber === modeNumber) || null;
}
