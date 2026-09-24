/**
 * ZoneConfig_SkyIslandDelivery.js
 * Single source of truth for Sky Island Delivery — Zone 1 / Intro World.
 * Consumed by SkyIslandArena.js, SkyIslandGameFlow.js, SkyIslandHUD.js, etc.
 */

export const ZONE_SKY_ISLAND_DELIVERY = {
  // ─── identity ─────────────────────────────────────────────────────────────
  id:           'sky_island',
  name:         'Sky Island Delivery',
  world:        1,
  zone:         1,
  robotType:    'wheelybot',
  emoji:        '✈️',
  difficulty:   'intro',
  estimatedMin: 22,

  // ─── narrative ────────────────────────────────────────────────────────────
  story: [
    'The islands in the sky depend on drone deliveries every day.',
    'A storm cut the routes — packages are scattered across the islands.',
    'You are the delivery robot. Collect all 7 packages and bring them',
    'to the Delivery Hub before the day ends!',
  ].join(' '),

  // ─── objectives ───────────────────────────────────────────────────────────
  primaryObjective: {
    id:     'deliver_all',
    text:   'Deliver all 7 packages to the Delivery Hub',
    type:   'collect_and_reach',
    target: 7,
    xp:     100,
  },

  subObjectives: [
    {
      id:     'collect_all',
      text:   'Collect all 7 delivery packages',
      type:   'collect_count',
      target: 7,
      xp:     150,
    },
    {
      id:     'no_fall',
      text:   "Don't fall off any island",
      type:   'no_fall',
      xp:     75,
    },
    {
      id:     'time_limit',
      text:   'Complete delivery in under 3 minutes',
      type:   'time_limit',
      limitSeconds: 180,
      xp:     50,
    },
  ],

  starCriteria: [
    { star: 1, condition: 'completed',           description: 'Completed the delivery' },
    { star: 2, condition: 'all_packages',        description: 'Collected all 7 packages' },
    { star: 3, condition: 'time_under_3min',     description: 'Finished in under 3 minutes' },
  ],

  xpBase:       100,
  xpAllPackages: 150,
  xpNoFall:      75,
  xpTimeBonus:   50,

  // ─── fail tips (keyed by fail reason) ────────────────────────────────────
  failTips: {
    battery:    'Tip: Use STOP blocks between movements to save power on long deliveries.',
    fall:       'Tip: Add sensor checks before island edges — use DISTANCE SENSOR blocks to detect gaps.',
    timeout:    'Tip: Plan the most direct route using FUNCTION blocks to repeat bridge crossings.',
    collision:  'Tip: Slow down near bridge edges using SET SPEED before turning.',
    generic:    'Tip: Break the problem into steps — collect one island at a time!',
  },

  // ─── island layout ────────────────────────────────────────────────────────
  islands: [
    {
      id:    'depot',
      label: 'Sky Delivery Co.',
      cx: 0,   cy: 0,    cz: 0,
      w:  22,  d:  18,   thick: 1.4,
      props: ['windmill', 'signpost_start', 'barrels', 'trees'],
    },
    {
      id:    'waypoint_alpha',
      label: 'Waypoint Alpha',
      cx: 0,   cy: -0.8, cz: -42,
      w:  16,  d:  12,   thick: 1.2,
      props: ['signpost_forward', 'lantern', 'tree'],
    },
    {
      id:    'delivery_hub',
      label: 'Delivery Hub',
      cx: 6,   cy: -1.5, cz: -74,
      w:  14,  d:  10,   thick: 1.1,
      props: ['landing_pad', 'lanterns', 'crates', 'neon_sign'],
    },
  ],

  bridges: [
    { from: 'depot',           to: 'waypoint_alpha', x1: 0, z1: -9,  x2: 0, z2: -33, y: -0.3 },
    { from: 'waypoint_alpha',  to: 'delivery_hub',   x1: 0, z1: -51, x2: 6, z2: -69, y: -1.0 },
  ],

  // ─── collectibles — 7 delivery packages ───────────────────────────────────
  packages: [
    { index: 0, x: -4.5, y: 1.9,  z:  -2,  color: 0x4ac8ff, label: 'FRAGILE' },   // Island 1
    { index: 1, x:  4.2, y: 1.9,  z:  -5,  color: 0xff8844, label: 'DELIVER' },   // Island 1
    { index: 2, x:  1.5, y: 1.9,  z: -14,  color: 0x88ff44, label: 'URGENT' },    // Island 1
    { index: 3, x: -3.5, y: 1.1,  z: -39,  color: 0xffdd44, label: 'CARGO' },     // Island 2
    { index: 4, x:  3.0, y: 1.1,  z: -44,  color: 0xff44cc, label: 'EXPRESS' },   // Island 2
    { index: 5, x: -1.5, y: 0.4,  z: -72,  color: 0x44ffcc, label: 'PRIORITY' },  // Island 3
    { index: 6, x:  4.5, y: 0.4,  z: -78,  color: 0xcc88ff, label: 'LAST ONE!' }, // Island 3
  ],

  // ─── goal beacon ──────────────────────────────────────────────────────────
  goalBeacon: {
    x:      6,
    y:     -1.5,
    z:     -74,
    radius: 4.5,
    label:  'DELIVERY POINT',
    subLabel: 'Collect all 7 packages first!',
    color1: 0xffdd00,   // gold
    color2: 0x00e676,   // green
    color3: 0x4ac8ff,   // sky blue
    skybeamColor:  0xffee88,
    skybeamHeight: 55,
    orbColor:      0xffffff,
    orbEmissive:   0xffd700,
  },

  // ─── obstacles — minimal for intro zone ───────────────────────────────────
  obstacles: [
    {
      type:  'wind_gust',
      id:    'wind1',
      x:  0, y: 0, z: -21,   // mid-point of Bridge 1
      radius:   1.4,
      force:    new Float32Array([0.6, 0, 0.3]), // slight sideways push
      duration: null,          // continuous zone
      damaging: false,
      label:    'Wind Zone',
    },
    {
      type:  'wind_gust',
      id:    'wind2',
      x:  3, y: -1.0, z: -60, // mid-point of Bridge 2
      radius:   1.4,
      force:    new Float32Array([-0.5, 0, 0.2]),
      duration: null,
      damaging: false,
      label:    'Wind Zone',
    },
  ],

  // ─── environment ──────────────────────────────────────────────────────────
  environment: {
    fog:     { type: 'exp2', color: 0x9acfee, density: 0.006 },
    sky: {
      type:    'shader',
      zenith:  '#143ec7',
      horizon: '#8cc8f8',
      loHoriz: '#daeeff',
    },
    cloudLayerY:     -10,
    cloudLayerY2:    -16,
    cloudDrift:       0.0003,
    windParticles:    200,
    windSpeed:        [3, 6],
    backgroundIslands: 5,
  },

  lighting: {
    ambient:     { color: 0xb3d9ff, intensity: 0.45 },
    hemisphere:  { sky: 0x87ceeb, ground: 0x4a7c30, intensity: 0.70 },
    sun: {
      color: 0xfff8e1, intensity: 1.30,
      position: [15, 25, 10],
      castShadow: true,
      shadowMapSize: 1024,
    },
    fillLight:   { color: 0xaaddff, intensity: 0.38, position: [18, 12, -20] },
    spawnLight:  { color: 0xffeedd, intensity: 0.70, distance: 20, position: [0, 5, 0] },
  },

  bloom: { strength: 0.45, radius: 0.38, threshold: 0.55 },
  vignette: { offset: 0.95, darkness: 0.38 },

  // ─── HUD theme ────────────────────────────────────────────────────────────
  hud: {
    zoneAttr:          'sky_island',
    panelBg:           'rgba(10, 30, 60, 0.82)',
    accent:            '#64b5f6',
    text:              '#e3f2fd',
    glow:              'rgba(100, 181, 246, 0.35)',
    progressColor:     '#64b5f6',
    collectibleLabel:  'PACKAGES',
    collectibleIcon:   '📦',
    collectibleFormat: '{count} / 7',
    batteryLabel:      'POWER',
    speedLabel:        'SPEED',
    missionText:       '📦 MISSION: Deliver all 7 packages',
    missionSubText:    '{count} / 7 packages delivered',
  },

  // ─── audio ────────────────────────────────────────────────────────────────
  audio: {
    music: {
      genre:     'upbeat_adventure_folk',
      bpm:       108,
      key:       'G major',
      mood:      'cheerful delivery, breezy, purposeful',
      volume:    0.38,
    },
    ambient: [
      { id: 'wind_loop',   volume: 0.15, loop: true },
      { id: 'birds',       volume: 0.08, intervalMin: 8, intervalMax: 15 },
      { id: 'bridge_creak', volume: 0.06, trigger: 'on_bridge', loop: true },
    ],
    sfx: {
      package_collect: { id: 'pop_rustle',   volume: 0.70 },
      package_deliver: { id: 'thud_chime',   volume: 0.70 },
      goal_no_packages:{ id: 'warning_buzz', volume: 0.55 },
      fall:            { id: 'whoosh_fade',  volume: 0.65 },
      win:             { id: 'fanfare_major', volume: 0.80 },
      go_sting:        { id: 'boing_trumpet', volume: 0.75 },
      star:            { id: 'chime_bright', volume: 0.70 },
    },
  },

  // ─── camera ───────────────────────────────────────────────────────────────
  camera: {
    bounds: { camMinZ: -95, camMaxX: 28 },
    introPanFrom:   [0, 18, 22],
    introPanTo:     [-2, 8, -15],
    introPanLookAt: [3, 0, -50],
    introDurationS: 1.4,
  },

  // ─── fall detection ───────────────────────────────────────────────────────
  fall: {
    threshold:     -10,   // Y below which fall-fail triggers
    tumbleRotX:    0.05,
    tumbleRotZ:    0.03,
    soundId:       'whoosh_fade',
  },

  // ─── robot start ──────────────────────────────────────────────────────────
  robot: {
    startX:    0,
    startZ:    5,
    startY:    0,
    startAngle: Math.PI,  // facing -z (toward islands)
  },
};

export default ZONE_SKY_ISLAND_DELIVERY;
