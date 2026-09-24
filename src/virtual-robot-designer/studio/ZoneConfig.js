/**
 * ZoneConfig.js — ByteBuddies Zone Data Layer
 *
 * Each entry is a single source of truth for everything a zone looks like and
 * how it plays. All arena builders (PremiumArenas.js) and future shared systems
 * read from this file. To add a new zone: add one more entry and a builder.
 *
 * @typedef {Object} ZoneConfig
 * @property {string} id
 * @property {string} name
 * @property {string} subtitle
 * @property {string[]} codingConcepts
 * @property {{color:number,secondaryColor:number,labelText:string,particleColor:number}} goalBeacon
 * @property {{baseColor:number,colorVariation:number,heightVariation:number}} terrain
 * @property {{topColor:number,bottomColor:number,midColor?:number}} sky
 * @property {{color:number,density:number}} fog
 * @property {{color:number,intensity:number}} ambient
 * @property {{skyColor:number,groundColor:number,intensity:number}} hemi
 * @property {{color:number,intensity:number,pos:{x,y,z}}} sun
 * @property {{color:number,intensity:number,distance:number,pos:{x,y,z},flicker?:boolean}[]} pointLights
 * @property {{strength:number,radius:number,threshold:number}} bloom
 * @property {{count:number,color:number,size:number,speed:number,opacity:number}} ambientParticles
 * @property {{type:string,positions:{x,y,z}[],color:number,emissiveColor:number,glowColor:number,value:number}} collectibles
 * @property {Object[]} obstacles
 * @property {{primary:{text:string},sub:{id:string,text:string,bonusXP:number}[]}} objectives
 * @property {{theme:string,accentColor:string,textColor:string}} hud
 * @property {{battery:string,collision:string,timeout:string}} failTips
 */

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 1 — ROBOT REEF
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_ROBOT_REEF = {
  id: 'robot_reef',
  name: 'Robot Reef',
  subtitle: 'Zone 1 · Intro World',
  codingConcepts: ['MOVE_FORWARD', 'TURN', 'STOP'],

  goalPosition: { x: 0, y: 0, z: -24 },
  goalBeacon: {
    color:          0xffd700,
    secondaryColor: 0x00e5ff,
    labelText:      'SALVAGE POINT',
    particleColor:  0xffd700,
  },

  terrain: { baseColor: 0xc8b87a, colorVariation: 0.12, heightVariation: 0.4 },
  sky:  { topColor: 0x030a1a, midColor: 0x0a3048, bottomColor: 0x165468 },
  fog:  { color: 0x071830, density: 0.024 },

  ambient: { color: 0x082848, intensity: 0.4 },
  hemi:    { skyColor: 0x0d3a6b, groundColor: 0x1e6e4e, intensity: 0.6 },
  sun:     { color: 0x4fc3f7, intensity: 0.9, pos: { x: -8, y: 14, z: -5 } },
  pointLights: [
    { color: 0xff6b9d, intensity: 0.5, distance: 7,  pos: { x: -8, y: 1.5, z: -5  } },
    { color: 0xff8e53, intensity: 0.5, distance: 7,  pos: { x:  6, y: 1.5, z: -12 } },
  ],

  bloom: { strength: 0.75, radius: 0.5, threshold: 0.5 },
  ambientParticles: { count: 280, color: 0x00e5ff, size: 0.07, speed: 0.28, opacity: 0.55 },

  collectibles: {
    type: 'energy_crystal',
    positions: [
      { x: -4, y: 0.7, z:  1 }, { x:  3.5, y: 0.7, z: -3 },
      { x: -5, y: 0.7, z: -7 }, { x:  4,   y: 0.7, z: -11 },
      { x: -3, y: 0.7, z: -16 },{ x:  2,   y: 0.7, z: -21 },
    ],
    color: 0x00e5ff, emissiveColor: 0x00b4cc, glowColor: 0x00e5ff, value: 10,
  },

  obstacles: [
    { type: 'jellyfish', pos: { x: -2.5, y: 2.5, z:  0  }, phase: 0.0 },
    { type: 'jellyfish', pos: { x:  3.5, y: 2.2, z: -6  }, phase: 1.4 },
    { type: 'jellyfish', pos: { x: -3.5, y: 2.8, z: -13 }, phase: 2.8 },
    { type: 'jellyfish', pos: { x:  2.5, y: 2.4, z: -19 }, phase: 4.2 },
  ],

  objectives: {
    primary: { text: 'Reach the Salvage Point' },
    sub: [
      { id: 'crystals', text: 'Collect 6 energy crystals', bonusXP: 150 },
      { id: 'nohit',    text: "Don't hit any jellyfish",   bonusXP: 75  },
    ],
  },

  hud: { theme: 'reef', accentColor: '#00e5ff', textColor: '#e0f7fa' },
  failTips: {
    battery:   'Tip: Add a STOP block between moves to save battery.',
    collision: 'Tip: Use WHEN COLLISION DETECTED to react to jellyfish.',
    timeout:   'Tip: Use SET SPEED to move faster toward the goal.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 2 — DESERT RUINS
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_DESERT_RUINS = {
  id: 'desert_rally',
  name: 'Desert Ruins',
  subtitle: 'Zone 2 · Ancient Sands',
  codingConcepts: ['LOOPS', 'REPEAT', 'SET_SPEED'],

  goalPosition: { x: 0, y: 0, z: -26 },
  goalBeacon: {
    color:          0xffd700,
    secondaryColor: 0xff8f00,
    labelText:      'SARCOPHAGUS',
    particleColor:  0xffcc00,
  },

  terrain: { baseColor: 0xd4a553, colorVariation: 0.14, heightVariation: 1.2 },
  sky:  { topColor: 0x1a0d00, midColor: 0x7a3500, bottomColor: 0xd47020 },
  fog:  { color: 0xc49050, density: 0.013 },

  ambient: { color: 0x6b3a00, intensity: 0.35 },
  hemi:    { skyColor: 0xe89030, groundColor: 0xa07840, intensity: 0.7 },
  sun:     { color: 0xffcc66, intensity: 1.3, pos: { x: -18, y: 7, z: -8 } },
  pointLights: [
    { color: 0xffd700, intensity: 1.5, distance: 12, pos: { x: 0, y: 2, z: -26 }, flicker: true },
  ],

  bloom: { strength: 0.5, radius: 0.4, threshold: 0.6 },
  ambientParticles: { count: 400, color: 0xd4a030, size: 0.04, speed: 0.9, opacity: 0.3 },

  collectibles: {
    type: 'ancient_coin',
    positions: [
      { x: -4.5, y: 0.6, z:  4 }, { x:  4,   y: 0.6, z:  0 },
      { x: -5,   y: 0.6, z: -4 }, { x:  3.5, y: 0.6, z: -9 },
      { x: -4,   y: 0.6, z: -14 },{ x:  4,   y: 0.6, z: -18 },
      { x: -3,   y: 0.6, z: -21 },{ x:  2.5, y: 0.6, z: -24 },
    ],
    color: 0xffd700, emissiveColor: 0xcc8800, glowColor: 0xffcc00, value: 12,
  },

  obstacles: [
    { type: 'boulder', pos: { x: -4,   y: 0, z: -1  }, phase: 0.0, speed: 2.0, range: 7 },
    { type: 'boulder', pos: { x:  4.5, y: 0, z: -9  }, phase: 2.1, speed: 1.6, range: 6 },
    { type: 'boulder', pos: { x: -3.5, y: 0, z: -18 }, phase: 4.0, speed: 2.3, range: 7 },
    { type: 'whirlwind', pos: { x:  3, y: 0, z:  2  }, phase: 0.5 },
    { type: 'whirlwind', pos: { x: -5, y: 0, z: -6  }, phase: 1.9 },
    { type: 'whirlwind', pos: { x:  4, y: 0, z: -13 }, phase: 3.3 },
  ],

  objectives: {
    primary: { text: 'Open the Sarcophagus' },
    sub: [
      { id: 'coins',  text: 'Collect 8 ancient coins', bonusXP: 160 },
      { id: 'boulders', text: 'Dodge all rolling boulders', bonusXP: 80 },
    ],
  },

  hud: { theme: 'desert', accentColor: '#ffd700', textColor: '#fff8dc' },
  failTips: {
    battery:   'Tip: Use LOOPS to repeat movement blocks more efficiently.',
    collision: 'Tip: Use WHEN SENSOR TRIGGERS to detect boulders early.',
    timeout:   'Tip: SET SPEED higher to cross the desert faster.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 3 — SPACE STATION
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_SPACE_STATION = {
  id: 'space',
  name: 'Space Station',
  subtitle: 'Zone 3 · Orbital Outpost',
  codingConcepts: ['EVENTS', 'WHEN_COLLISION', 'SENSORS'],

  goalPosition: { x: 0, y: 0, z: -26 },
  goalBeacon: {
    color:          0x4fc3f7,
    secondaryColor: 0x00e5ff,
    labelText:      'AIRLOCK',
    particleColor:  0x4fc3f7,
  },

  terrain: { baseColor: 0x263238, colorVariation: 0.04, heightVariation: 0.1 },
  sky:  { topColor: 0x000005, midColor: 0x000812, bottomColor: 0x020520 },
  fog:  { color: 0x040818, density: 0.007 },

  ambient: { color: 0x101828, intensity: 0.2 },
  hemi:    { skyColor: 0x182040, groundColor: 0x101020, intensity: 0.35 },
  sun:     { color: 0xddeeff, intensity: 0.55, pos: { x: 5, y: 12, z: 5 } },
  pointLights: [
    { color: 0xff1744, intensity: 1.5, distance: 8, pos: { x: -8,  y: 2, z:  0 }, flicker: true },
    { color: 0xff1744, intensity: 1.5, distance: 8, pos: { x:  8,  y: 2, z: -14}, flicker: true },
    { color: 0x4fc3f7, intensity: 0.8, distance: 12, pos: { x:  0, y: 2, z: -26} },
  ],

  bloom: { strength: 0.95, radius: 0.5, threshold: 0.38 },
  ambientParticles: { count: 120, color: 0x8899aa, size: 0.04, speed: 0.08, opacity: 0.2 },

  collectibles: {
    type: 'data_orb',
    positions: [
      { x: -4, y: 0.8, z:  1 }, { x:  4.5, y: 0.8, z: -4 },
      { x: -3, y: 0.8, z: -10 },{ x:  3.5, y: 0.8, z: -16 },
      { x: -2, y: 0.8, z: -21 },
    ],
    color: 0x4fc3f7, emissiveColor: 0x0288d1, glowColor: 0x00e5ff, value: 15,
  },

  obstacles: [
    { type: 'laser', pos: { x: 0, y: 1.0, z: -2  }, width: 10, period: 4.0, phase: 0.0 },
    { type: 'laser', pos: { x: 0, y: 1.0, z: -8  }, width: 10, period: 3.5, phase: 1.8 },
    { type: 'laser', pos: { x: 0, y: 1.0, z: -14 }, width: 10, period: 3.0, phase: 3.2 },
    { type: 'laser', pos: { x: 0, y: 1.0, z: -20 }, width: 10, period: 4.5, phase: 0.9 },
  ],

  objectives: {
    primary: { text: 'Reach the Airlock' },
    sub: [
      { id: 'orbs',   text: 'Collect 5 data orbs',         bonusXP: 175 },
      { id: 'lasers', text: "Don't touch any laser beams",  bonusXP: 100 },
    ],
  },

  hud: { theme: 'space', accentColor: '#4fc3f7', textColor: '#e1f5fe' },
  failTips: {
    battery:   'Tip: Add STOP blocks — hovering uses less power than driving.',
    collision: 'Tip: Laser beams toggle off and on. Use WAIT blocks to time your move.',
    timeout:   'Tip: Plan your route using FUNCTIONS to group efficient movement.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 4 — JUNGLE TEMPLE
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_JUNGLE_TEMPLE = {
  id: 'jungle',
  name: 'Jungle Temple',
  subtitle: 'Zone 4 · Ancient Ruins',
  codingConcepts: ['FUNCTIONS', 'LOGIC', 'IF_THEN'],

  goalPosition: { x: 0, y: 0, z: -24 },
  goalBeacon: {
    color:          0x66bb6a,
    secondaryColor: 0xff5252,
    labelText:      'TEMPLE IDOL',
    particleColor:  0xaaffaa,
  },

  terrain: { baseColor: 0x2d5a27, colorVariation: 0.18, heightVariation: 0.9 },
  sky:  { topColor: 0x020802, midColor: 0x0a1a05, bottomColor: 0x1a3010 },
  fog:  { color: 0x081205, density: 0.027 },

  ambient: { color: 0x1a2e10, intensity: 0.3 },
  hemi:    { skyColor: 0x2d4a20, groundColor: 0x1a2810, intensity: 0.55 },
  sun:     { color: 0xff8f00, intensity: 0.9, pos: { x: -10, y: 8, z: -5 } },
  pointLights: [
    { color: 0xff5500, intensity: 0.5, distance: 6, pos: { x: -5, y: 1, z: -5 } },
    { color: 0xff5500, intensity: 0.5, distance: 6, pos: { x:  5, y: 1, z: -14} },
    { color: 0x66bb6a, intensity: 1.0, distance: 10, pos: { x: 0, y: 2, z: -24} },
  ],

  bloom: { strength: 0.6, radius: 0.45, threshold: 0.5 },
  ambientParticles: { count: 90, color: 0xddff88, size: 0.06, speed: 0.14, opacity: 0.65 },

  collectibles: {
    type: 'sacred_gem',
    positions: [
      { x: -4, y: 0.7, z:  2 }, { x:  4.5, y: 0.7, z: -2 },
      { x: -4, y: 0.7, z: -7 }, { x:  3.5, y: 0.7, z: -12 },
      { x: -3, y: 0.7, z: -17 },{ x:  2,   y: 0.7, z: -21 },
    ],
    color: 0xe53935, emissiveColor: 0xb71c1c, glowColor: 0xff5252, value: 14,
  },

  obstacles: [
    { type: 'falling_rock', pos: { x: -2, y: 12, z: -1  }, period: 4.0, phase: 0.0 },
    { type: 'falling_rock', pos: { x:  3, y: 12, z: -8  }, period: 3.5, phase: 1.5 },
    { type: 'falling_rock', pos: { x: -3, y: 12, z: -15 }, period: 4.5, phase: 3.0 },
    { type: 'vine_swing',   pos: { x:  4, y: 5,  z: -4  }, phase: 0.0 },
    { type: 'vine_swing',   pos: { x: -4, y: 5,  z: -12 }, phase: 1.8 },
  ],

  objectives: {
    primary: { text: 'Reach the Temple Idol' },
    sub: [
      { id: 'gems',  text: 'Collect 6 sacred gems',   bonusXP: 160 },
      { id: 'rocks', text: 'Avoid all falling rocks',  bonusXP: 80  },
    ],
  },

  hud: { theme: 'jungle', accentColor: '#66bb6a', textColor: '#f1f8e9' },
  failTips: {
    battery:   'Tip: Use IF blocks to stop on flat ground and save power.',
    collision: 'Tip: Watch for shadows on the ground — they warn you before a rock falls!',
    timeout:   'Tip: Use FUNCTIONS to create reusable move sequences.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 5 — CRYSTAL CAVES  (maps to arenaType 'crystal_cave')
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_CRYSTAL_CAVES = {
  id: 'crystal_cave',
  name: 'Crystal Caves',
  subtitle: 'Zone 5 · The Deep Glitter',
  codingConcepts: ['VARIABLES', 'CONDITIONAL_LOGIC', 'TIMING'],

  goalPosition: { x: 0, y: 0, z: -24 },
  goalBeacon: {
    color:          0xe040fb,
    secondaryColor: 0x7c4dff,
    labelText:      'CRYSTAL ALTAR',
    particleColor:  0xe040fb,
  },

  terrain: { baseColor: 0x1a1030, colorVariation: 0.09, heightVariation: 0.5 },
  sky:  { topColor: 0x03000a, midColor: 0x0a0520, bottomColor: 0x1a0a35 },
  fog:  { color: 0x0a0520, density: 0.03 },

  ambient: { color: 0x200040, intensity: 0.35 },
  hemi:    { skyColor: 0x2a0855, groundColor: 0x100020, intensity: 0.5 },
  sun:     { color: 0xcc88ff, intensity: 0.5, pos: { x: 0, y: 10, z: 5 } },
  pointLights: [
    { color: 0x7c4dff, intensity: 0.7, distance: 8, pos: { x: -8, y: 2, z: -5  } },
    { color: 0xe040fb, intensity: 0.7, distance: 8, pos: { x:  6, y: 2, z: -14 } },
  ],

  bloom: { strength: 1.0, radius: 0.55, threshold: 0.38 },
  ambientParticles: { count: 200, color: 0xcc88ff, size: 0.06, speed: 0.15, opacity: 0.45 },

  collectibles: {
    type: 'resonance_shard',
    positions: [
      { x: -4, y: 0.7, z:  1 }, { x:  4,   y: 0.7, z: -4 },
      { x: -3, y: 0.7, z: -9 }, { x:  4.5, y: 0.7, z: -15 },
      { x: -3, y: 0.7, z: -20 },
    ],
    color: 0xe040fb, emissiveColor: 0x9c27b0, glowColor: 0xe040fb, value: 16,
  },

  obstacles: [
    { type: 'stalactite', pos: { x: -2, y: 10, z: -2  }, period: 5.0, phase: 0.0 },
    { type: 'stalactite', pos: { x:  3, y: 10, z: -7  }, period: 4.0, phase: 1.2 },
    { type: 'stalactite', pos: { x: -4, y: 10, z: -12 }, period: 5.5, phase: 2.8 },
    { type: 'stalactite', pos: { x:  2, y: 10, z: -17 }, period: 4.5, phase: 4.0 },
    { type: 'stalactite', pos: { x: -3, y: 10, z: -21 }, period: 3.8, phase: 0.8 },
  ],

  objectives: {
    primary: { text: 'Reach the Crystal Altar' },
    sub: [
      { id: 'shards',     text: 'Collect 5 resonance shards', bonusXP: 180 },
      { id: 'stalactites',text: 'Avoid all stalactites',      bonusXP: 120 },
    ],
  },

  hud: { theme: 'crystal', accentColor: '#e040fb', textColor: '#f3e5f5' },
  failTips: {
    battery:   'Tip: Use VARIABLES to track remaining battery and stop early.',
    collision: 'Tip: Purple shadows on the ground warn you where a stalactite will fall!',
    timeout:   'Tip: Time your moves through each section between stalactite cycles.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 6 — VOLCANO ISLAND  (maps to arenaType 'lava_canyon')
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_VOLCANO_ISLAND = {
  id: 'lava_canyon',
  name: 'Volcano Core',
  subtitle: 'Zone 6 · Molten Depths',
  codingConcepts: ['REACT_TO_ENVIRONMENT', 'DECISION_TREES', 'AI_BLOCKS'],

  goalPosition: { x: 0, y: 0, z: -26 },
  goalBeacon: {
    color:          0x4fc3f7,
    secondaryColor: 0x00e5ff,
    labelText:      'COOLING CHAMBER',
    particleColor:  0x00e5ff,
  },

  terrain: { baseColor: 0x1a0800, colorVariation: 0.07, heightVariation: 1.5 },
  sky:  { topColor: 0x0a0000, midColor: 0x2a0500, bottomColor: 0x5a0800 },
  fog:  { color: 0x1a0500, density: 0.028 },

  ambient: { color: 0x3a0500, intensity: 0.3 },
  hemi:    { skyColor: 0x5a1000, groundColor: 0x2a0500, intensity: 0.5 },
  sun:     { color: 0xff4400, intensity: 0.8, pos: { x: -5, y: -2, z: -5 } },
  pointLights: [
    { color: 0xff6d00, intensity: 2.2, distance: 10, pos: { x: -7, y: 0.5, z: -5  }, flicker: true },
    { color: 0xff6d00, intensity: 2.2, distance: 10, pos: { x:  6, y: 0.5, z: -16 }, flicker: true },
    { color: 0x4fc3f7, intensity: 2.5, distance: 9,  pos: { x:  0, y: 1,   z: -26 } },
  ],

  bloom: { strength: 1.2, radius: 0.6, threshold: 0.38 },
  ambientParticles: { count: 350, color: 0xff6d00, size: 0.06, speed: 0.65, opacity: 0.45 },

  collectibles: {
    type: 'lava_crystal',
    positions: [
      { x: -4.5, y: 0.8, z:  2 }, { x:  4,   y: 0.8, z: -5 },
      { x: -3.5, y: 0.8, z: -13 },{ x:  3.5, y: 0.8, z: -20 },
    ],
    color: 0xbf360c, emissiveColor: 0xff6d00, glowColor: 0xff6d00, value: 22,
  },

  obstacles: [
    { type: 'geyser',  pos: { x: -3, y: 0, z: -3  }, period: 3.5, phase: 0.0 },
    { type: 'geyser',  pos: { x:  3, y: 0, z: -10 }, period: 3.0, phase: 1.5 },
    { type: 'geyser',  pos: { x: -2, y: 0, z: -18 }, period: 4.0, phase: 2.8 },
    { type: 'boulder', pos: { x:  4, y: 0, z: -7  }, phase: 0.3, speed: 2.0, range: 6 },
    { type: 'boulder', pos: { x: -4, y: 0, z: -14 }, phase: 2.0, speed: 2.5, range: 6 },
  ],

  objectives: {
    primary: { text: 'Reach the Cooling Chamber' },
    sub: [
      { id: 'crystals', text: 'Collect 4 lava crystals',   bonusXP: 200 },
      { id: 'geysers',  text: 'Avoid all lava geysers',    bonusXP: 150 },
    ],
  },

  hud: { theme: 'volcano', accentColor: '#ff6d00', textColor: '#fff3e0' },
  failTips: {
    battery:   'Tip: Only use the arm to collect — retract it right away to save power.',
    collision: 'Tip: Geysers glow brighter before they erupt. Use WAIT to let them settle.',
    timeout:   'Tip: Plan the most direct route and minimise TURN commands.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 7 — CITY NEON RUSH  (maps to arenaType 'neon_city')
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_CITY_NEON_RUSH = {
  id: 'neon_city',
  name: 'City Neon Rush',
  subtitle: 'Zone 7 · Rooftop Gauntlet',
  codingConcepts: ['VARIABLES', 'WHILE_LOOPS', 'CONDITIONAL_LOGIC'],

  goalPosition: { x: 0, y: 0, z: -26 },
  goalBeacon: {
    color:          0x00ff88,
    secondaryColor: 0x00e5ff,
    labelText:      'SERVER ROOM',
    particleColor:  0x00ff88,
  },

  terrain: { baseColor: 0x151520, colorVariation: 0.03, heightVariation: 0.1 },
  sky:  { topColor: 0x000005, midColor: 0x050010, bottomColor: 0x0a0020 },
  fog:  { color: 0x040510, density: 0.022 },

  ambient: { color: 0x050512, intensity: 0.15 },
  hemi:    { skyColor: 0x0a0a28, groundColor: 0x050510, intensity: 0.28 },
  sun:     { color: 0x4488ff, intensity: 0.35, pos: { x: 5, y: 18, z: 5 } },
  pointLights: [
    { color: 0xff00ff, intensity: 1.4, distance: 9, pos: { x: -7, y: 2, z:  0 } },
    { color: 0x00ff88, intensity: 1.2, distance: 9, pos: { x:  6, y: 2, z: -12} },
    { color: 0x00e5ff, intensity: 1.0, distance: 7, pos: { x: -5, y: 2, z: -20} },
  ],

  bloom: { strength: 1.05, radius: 0.5, threshold: 0.32 },
  ambientParticles: { count: 0, color: 0x000000, size: 0, speed: 0, opacity: 0 },

  collectibles: {
    type: 'neon_chip',
    positions: [
      { x: -4, y: 0.5, z:  1 }, { x:  4.5, y: 0.5, z: -4 },
      { x: -4, y: 0.5, z: -10 },{ x:  4,   y: 0.5, z: -16 },
      { x: -2, y: 0.5, z: -21 },
    ],
    color: 0x00ff88, emissiveColor: 0x00cc44, glowColor: 0x00ff88, value: 18,
  },

  obstacles: [
    { type: 'turbine',    pos: { x: -3, y: 0, z: -3  }, speed: 1.5 },
    { type: 'turbine',    pos: { x:  3, y: 0, z: -14 }, speed: 2.0 },
    { type: 'elec_fence', pos: { x:  0, y: 0, z: -7  }, width: 9, period: 3.5, phase: 0.0 },
    { type: 'elec_fence', pos: { x:  0, y: 0, z: -18 }, width: 9, period: 2.8, phase: 1.8 },
  ],

  objectives: {
    primary: { text: 'Reach the Server Room' },
    sub: [
      { id: 'chips',   text: 'Collect 5 neon chips',     bonusXP: 190 },
      { id: 'fences',  text: 'Time the electric fences',  bonusXP: 120 },
    ],
  },

  hud: { theme: 'city', accentColor: '#00ff88', textColor: '#ccffee' },
  failTips: {
    battery:   'Tip: Use VARIABLES to track battery usage and STOP before it runs out.',
    collision: 'Tip: Electric fences switch off on a timer — use WAIT blocks to time your run.',
    timeout:   'Tip: WHILE loops let you keep moving until a condition is met.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 8 — FINAL FRONTIER  (maps to arenaType 'alien_planet')
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_FINAL_FRONTIER = {
  id: 'alien_planet',
  name: 'Final Frontier',
  subtitle: 'Zone 8 · The Grand Gauntlet',
  codingConcepts: ['FULL_PROGRAM', 'ALL_CONCEPTS', 'FREE_CODING'],

  goalPosition: { x: 0, y: 0, z: -28 },
  goalBeacon: {
    color:          0xfdd835,
    secondaryColor: 0xff8800,
    labelText:      'GRADUATE',
    particleColor:  0xfdd835,
  },

  terrain: { baseColor: 0x1a1030, colorVariation: 0.13, heightVariation: 1.0 },
  sky:  { topColor: 0x020005, midColor: 0x0a0520, bottomColor: 0x1a0840 },
  fog:  { color: 0x080320, density: 0.015 },

  ambient: { color: 0x150530, intensity: 0.28 },
  hemi:    { skyColor: 0x200a45, groundColor: 0x0a0520, intensity: 0.45 },
  sun:     { color: 0xcc88ff, intensity: 0.7, pos: { x: 8, y: 12, z: -5 } },
  pointLights: [
    { color: 0xff4488, intensity: 0.8, distance: 8, pos: { x: -8, y: 1.5, z:  0 } },
    { color: 0x44ffcc, intensity: 0.8, distance: 8, pos: { x:  7, y: 1.5, z: -14} },
    { color: 0xfdd835, intensity: 2.0, distance: 12, pos: { x: 0, y: 2, z: -28} },
  ],

  bloom: { strength: 0.85, radius: 0.5, threshold: 0.4 },
  ambientParticles: { count: 180, color: 0xaa66ff, size: 0.06, speed: 0.22, opacity: 0.4 },

  collectibles: {
    type: 'alien_artefact',
    positions: [
      { x: -4,   y: 0.8, z:  2 }, { x:  4,   y: 0.8, z: -3 },
      { x: -4.5, y: 0.8, z: -8 }, { x:  4.5, y: 0.8, z: -13 },
      { x: -3,   y: 0.8, z: -18 },{ x:  3,   y: 0.8, z: -22 },
      { x:  0,   y: 0.8, z: -25 },
    ],
    color: 0xcc44ff, emissiveColor: 0x8800cc, glowColor: 0xcc44ff, value: 25,
  },

  obstacles: [
    { type: 'jellyfish',  pos: { x: -3, y: 2.5, z: -1  }, phase: 0.0 },
    { type: 'boulder',    pos: { x:  4, y: 0,   z: -6  }, phase: 1.0, speed: 2.2, range: 7 },
    { type: 'laser',      pos: { x:  0, y: 1.0, z: -10 }, width: 10, period: 3.5, phase: 0.5 },
    { type: 'geyser',     pos: { x: -3, y: 0,   z: -15 }, period: 3.0, phase: 2.0 },
    { type: 'stalactite', pos: { x:  3, y: 10,  z: -20 }, period: 4.0, phase: 1.5 },
    { type: 'turbine',    pos: { x: -4, y: 0,   z: -24 }, speed: 2.5 },
  ],

  objectives: {
    primary: { text: 'Pass Through the Golden Gate' },
    sub: [
      { id: 'artefacts', text: 'Collect 7 alien artefacts',     bonusXP: 250 },
      { id: 'gauntlet',  text: 'Navigate the full gauntlet',     bonusXP: 150 },
    ],
  },

  hud: { theme: 'frontier', accentColor: '#fdd835', textColor: '#fff8e1' },
  failTips: {
    battery:   'Tip: This is the final test — balance speed with power management.',
    collision: 'Tip: Every obstacle type is here. Use everything you have learned!',
    timeout:   'Tip: Build the perfect program — plan your route before you code.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INDEX MAP  —  keyed by arenaType string used in buildSmartArena
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_CONFIGS = {
  robot_reef:   ZONE_ROBOT_REEF,
  desert_rally: ZONE_DESERT_RUINS,
  space:        ZONE_SPACE_STATION,
  jungle:       ZONE_JUNGLE_TEMPLE,
  crystal_cave: ZONE_CRYSTAL_CAVES,
  lava_canyon:  ZONE_VOLCANO_ISLAND,
  neon_city:    ZONE_CITY_NEON_RUSH,
  alien_planet: ZONE_FINAL_FRONTIER,
};

/** @param {string} id arenaType string */
export function getZoneConfig(id) {
  return ZONE_CONFIGS[id] ?? null;
}
