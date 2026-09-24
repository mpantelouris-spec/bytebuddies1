/**
 * TenPremiumTracks.js — 10 complete Mario Kart-inspired racing circuits
 * Integrated with ByteBuddies robot studio racing system
 * 
 * TRACKS:
 * 1. Sunset Coast Circuit (tropical_coast_01)
 * 2. Crystal Cavern Run (crystal_cave_01)
 * 3. Sky Garden Ascent (sky_sky_island_01)
 * 4. Volcanic Inferno Pass (volcano_canyon_01)
 * 5. Cyber City Circuit (cyber_city_01)
 * 6. Frost Peak Rally (frost_peak_01)
 * 7. Ancient Ruins Raceway (jungle_underwater_temple_01)
 * 8. Stardust Galaxy Drift (galaxy_drift_01)
 * 9. Meadow Valley Sprint (meadow_valley_01)
 * 10. Shadow Metro Underpass (metro_underpass_01)
 */

import * as THREE from 'three';

// Helper: Create 3D point
function pt(x, z, y = 0) { return { x, y, z }; }

// Helper: Add elevation to track using sine waves
function withElevation(points, profile = 'rolling') {
  const profiles = {
    rolling: [4, 2],
    mountain: [10, 5],
    sky: [18, 9],
    cavern: [2, 1],
    metro: [1, 0.5],
    cosmic: [8, 4],
    coastal: [3, 1.5],
    jungle: [6, 3],
  };
  const [a1, a2] = profiles[profile] || profiles.rolling;
  const n = points.length;
  return points.map((p, i) => {
    const t = i / Math.max(1, n - 1);
    const wave = Math.sin(t * Math.PI * 2) * a1 * 0.55 + Math.sin(t * Math.PI * 4 + 0.9) * a2 * 0.4;
    return { ...p, y: (p.y ?? 0) + wave };
  });
}

// ───────────────────────────────────────────────────────────────────────────
// TRACK 1: SUNSET COAST CIRCUIT (Tropical Coastline)
// ───────────────────────────────────────────────────────────────────────────
export const SUNSET_COAST_SPLINE = withElevation([
  pt(0, 60),          // Start: Wooden pier
  pt(28, 54),         // Gentle right curve
  pt(46, 38),         // Coastal straight begins
  pt(48, 12),         // Ocean view continues
  pt(42, -18),        // Hairpin around coral arch (landmark)
  pt(18, -36),        // Bridge over tidal pool
  pt(-8, -38),        // Water shortcut zone
  pt(-32, -28),       // Dune jump setup
  pt(-48, 0),         // Jump launch
  pt(-44, 32),        // Finish straight
  pt(-18, 50),        // Return to start
  pt(0, 60),
], 'coastal');

// ───────────────────────────────────────────────────────────────────────────
// TRACK 2: CRYSTAL CAVERN RUN (Underground Bioluminescent)
// ───────────────────────────────────────────────────────────────────────────
export const CRYSTAL_CAVERN_SPLINE = withElevation([
  pt(0, 54),          // Start: Grand crystal cathedral
  pt(18, 48),         // Narrow tunnel begins
  pt(34, 32),         // Crystal walls glow
  pt(38, 8),          // Underground lake crossing
  pt(32, -22),        // Glass bridge reflection
  pt(12, -38),        // Crystal maze hairpin
  pt(-12, -38),       // Maze complexity
  pt(-32, -22),       // Ascending spiral ramp
  pt(-38, 8),         // Glowing amphitheater
  pt(-34, 32),        // Return via crystal chamber
  pt(-18, 48),        // Final crystal zone
  pt(0, 54),
], 'cavern');

// ───────────────────────────────────────────────────────────────────────────
// TRACK 3: SKY GARDEN ASCENT (Floating Islands)
// ───────────────────────────────────────────────────────────────────────────
export const SKY_GARDEN_SPLINE = withElevation([
  pt(0, 62),          // Start: Main garden island
  pt(22, 58),         // Giant flower landmark
  pt(40, 46),         // Rope bridge crossing (40m span)
  pt(46, 24),         // Waterfall edge curve
  pt(42, -2),         // Lower island approach
  pt(28, -32),        // Mushroom grove loop
  pt(4, -44),         // Bottom of descent
  pt(-28, -32),       // Ramp launch setup
  pt(-42, -2),        // 3m airtime zone
  pt(-46, 24),        // Cloud puff landing
  pt(-40, 46),        // Return via rope bridge
  pt(-22, 58),        // Final approach
  pt(0, 62),
], 'sky');

// ───────────────────────────────────────────────────────────────────────────
// TRACK 4: VOLCANIC INFERNO PASS (Active Volcanic Canyon)
// ───────────────────────────────────────────────────────────────────────────
export const VOLCANIC_INFERNO_SPLINE = withElevation([
  pt(0, 58),          // Start: Volcano base (caldera visible)
  pt(24, 50),         // Lava-edge straight begins
  pt(44, 28),         // Safety barrier (heat shimmer effect)
  pt(48, 4),          // Basalt bridge over magma
  pt(42, -18),        // Ash cloud tunnel
  pt(16, -36),        // Visibility reduced
  pt(-16, -36),       // Tunnel exit
  pt(-42, -18),       // Downhill sprint
  pt(-48, 4),         // Eruption fireworks zone
  pt(-44, 28),        // Return straight
  pt(-24, 50),        // Final approach
  pt(0, 58),
], 'mountain');

// ───────────────────────────────────────────────────────────────────────────
// TRACK 5: CYBER CITY CIRCUIT (Neon Metropolis at Night)
// ───────────────────────────────────────────────────────────────────────────
export const CYBER_CITY_SPLINE = withElevation([
  pt(0, 62),          // Start: Main street (holographic billboard)
  pt(26, 54),         // Neon tunnel pulsing lights
  pt(44, 38),         // Tunnel sync'd to 120 BPM
  pt(48, 12),         // Elevated highway 20m up
  pt(44, -12),        // City skyline visible below
  pt(24, -28),        // Alley shortcut (6m narrow)
  pt(0, -38),         // Steam vents zone
  pt(-24, -28),       // Plaza fountain roundabout
  pt(-44, -12),       // Finish straight approach
  pt(-48, 12),        // Neon arch tunnel
  pt(-44, 38),        // Return via elevated section
  pt(-26, 54),        // Final neon stretch
  pt(0, 62),
], 'rolling');

// ───────────────────────────────────────────────────────────────────────────
// TRACK 6: FROST PEAK RALLY (Frozen Alpine Mountain)
// ───────────────────────────────────────────────────────────────────────────
export const FROST_PEAK_SPLINE = withElevation([
  pt(0, 60),          // Start: Ski lodge (windmill landmark)
  pt(22, 52),         // Forest slalom between snow pines
  pt(38, 36),         // Dense forest navigation
  pt(44, 12),         // Frozen lake straight (ice patch - slippery)
  pt(42, -12),        // Cliffside curve with icicles
  pt(28, -32),        // Icicle overhang landmark
  pt(4, -42),         // Downhill section
  pt(-28, -32),       // Snow jump ramp setup
  pt(-42, -12),       // Launch zone
  pt(-44, 12),        // Frosty landing
  pt(-38, 36),        // Return through pine forest
  pt(-22, 52),        // Final lodge approach
  pt(0, 60),
], 'mountain');

// ───────────────────────────────────────────────────────────────────────────
// TRACK 7: ANCIENT RUINS RACEWAY (Jungle Temple)
// ───────────────────────────────────────────────────────────────────────────
export const ANCIENT_RUINS_SPLINE = withElevation([
  pt(0, 62),          // Start: Temple gate (stone arch landmark)
  pt(26, 54),         // Courtyard with broken pillars
  pt(42, 36),         // Fallen columns as ramps
  pt(46, 10),         // Jungle tunnel entry
  pt(38, -16),        // Dense canopy (firefly navigation)
  pt(18, -38),        // Waterfall crossing (stone bridge)
  pt(-6, -42),        // Mist spray zone
  pt(-28, -36),       // Temple inner loop
  pt(-44, -8),        // Gold tile boost pad
  pt(-46, 16),        // Stone statue landmarks
  pt(-40, 40),        // Return via jungle
  pt(-22, 54),        // Final temple approach
  pt(0, 62),
], 'jungle');

// ───────────────────────────────────────────────────────────────────────────
// TRACK 8: STARDUST GALAXY DRIFT (Asteroid Belt Space)
// ───────────────────────────────────────────────────────────────────────────
export const STARDUST_GALAXY_SPLINE = withElevation([
  pt(0, 58),          // Start: Main asteroid platform (neon ring gate)
  pt(28, 48),         // Jump gap between asteroids (5m)
  pt(42, 28),         // Star particle trail
  pt(46, 4),          // Nebula tunnel (purple fog)
  pt(38, -18),        // Visibility reduced in fog
  pt(14, -36),        // Spiral around small moon
  pt(-14, -36),       // Low gravity feeling (jump +20%)
  pt(-38, -18),       // Moon rises above track
  pt(-46, 4),         // Final straight through stardust
  pt(-42, 28),        // Floating asteroids
  pt(-28, 48),        // Return orbit
  pt(0, 58),
], 'cosmic');

// ───────────────────────────────────────────────────────────────────────────
// TRACK 9: MEADOW VALLEY SPRINT (Countryside Farmland - STARTER TRACK)
// ───────────────────────────────────────────────────────────────────────────
export const MEADOW_VALLEY_SPLINE = withElevation([
  pt(0, 54),          // Start: Red barn (windmill landmark on hill)
  pt(24, 50),         // Long straight through wildflower field
  pt(42, 38),         // Gentle hill climb
  pt(44, 14),         // Hay bale barriers
  pt(36, -8),         // Creek crossing (wooden bridge)
  pt(12, -28),        // Downhill with grazing sheep
  pt(-12, -28),       // Sheep decorative zone
  pt(-36, -8),        // Return up gentle slope
  pt(-44, 14),        // Farm straight
  pt(-42, 38),        // Meadow section
  pt(-24, 50),        // Final approach to barn
  pt(0, 54),
], 'rolling');

// ───────────────────────────────────────────────────────────────────────────
// TRACK 10: SHADOW METRO UNDERPASS (Underground Subway)
// ───────────────────────────────────────────────────────────────────────────
export const SHADOW_METRO_SPLINE = withElevation([
  pt(0, 62),          // Start: Station platform ("METRO GP" neon sign)
  pt(28, 56),         // Long tunnel straight
  pt(44, 40),         // Flickering fluorescent lights (hazard)
  pt(48, 16),         // Light flicker rhythm challenge
  pt(42, -4),         // Split junction (main vs. shortcut)
  pt(18, -28),        // Maintenance shortcut route
  pt(-8, -40),        // Platform jump (3m airtime)
  pt(-32, -32),       // Ramp off station edge
  pt(-44, -8),        // Final tunnel sprint
  pt(-48, 16),        // Steam vents zone
  pt(-42, 40),        // Surface exit finish
  pt(-24, 56),        // Return through tunnel
  pt(0, 62),
], 'metro');

// ───────────────────────────────────────────────────────────────────────────
// Track Catalog Registration
// ───────────────────────────────────────────────────────────────────────────

export const TRACK_REGISTRY = {
  tropical_coast_01: {
    name: 'Sunset Coast Circuit',
    biome: 'tropical',
    difficulty: '★☆☆☆☆',
    laps: 2,
    spline: SUNSET_COAST_SPLINE,
    profile: 'coastal',
    landmark: 'Coral Arch',
    checkpoints: 4,
    shortcuts: 1,
    hazards: ['Water (20% slow)'],
  },
  crystal_cave_01: {
    name: 'Crystal Cavern Run',
    biome: 'cave',
    difficulty: '★★☆☆☆',
    laps: 2,
    spline: CRYSTAL_CAVERN_SPLINE,
    profile: 'cavern',
    landmark: '30m Quartz Pillar',
    checkpoints: 4,
    shortcuts: 1,
    hazards: ['Crystal Maze (navigation)'],
  },
  sky_sky_island_01: {
    name: 'Sky Garden Ascent',
    biome: 'sky',
    difficulty: '★★☆☆☆',
    laps: 2,
    spline: SKY_GARDEN_SPLINE,
    profile: 'sky',
    landmark: '15m Giant Flower',
    checkpoints: 4,
    shortcuts: 1,
    hazards: ['Rope Bridge (sway)'],
  },
  volcano_canyon_01: {
    name: 'Volcanic Inferno Pass',
    biome: 'volcano',
    difficulty: '★★★☆☆',
    laps: 2,
    spline: VOLCANIC_INFERNO_SPLINE,
    profile: 'mountain',
    landmark: 'Smoking Caldera',
    checkpoints: 4,
    shortcuts: 1,
    hazards: ['Lava Edge', 'Ash Cloud (visibility)'],
  },
  cyber_city_01: {
    name: 'Cyber City Circuit',
    biome: 'neon',
    difficulty: '★★★☆☆',
    laps: 3,
    spline: CYBER_CITY_SPLINE,
    profile: 'rolling',
    landmark: 'Holographic Billboard',
    checkpoints: 5,
    shortcuts: 1,
    hazards: ['Neon Tunnel (strobe)', 'Steam Vents'],
  },
  frost_peak_01: {
    name: 'Frost Peak Rally',
    biome: 'snow',
    difficulty: '★★★☆☆',
    laps: 2,
    spline: FROST_PEAK_SPLINE,
    profile: 'mountain',
    landmark: 'Icicle Overhang',
    checkpoints: 4,
    shortcuts: 1,
    hazards: ['Ice Patch (30% slow)'],
  },
  jungle_underwater_temple_01: {
    name: 'Ancient Ruins Raceway',
    biome: 'jungle',
    difficulty: '★★★★☆',
    laps: 2,
    spline: ANCIENT_RUINS_SPLINE,
    profile: 'jungle',
    landmark: '20m Stone Arch',
    checkpoints: 4,
    shortcuts: 1,
    hazards: ['Dense Canopy', 'Waterfall Spray'],
  },
  galaxy_drift_01: {
    name: 'Stardust Galaxy Drift',
    biome: 'space',
    difficulty: '★★★★☆',
    laps: 2,
    spline: STARDUST_GALAXY_SPLINE,
    profile: 'cosmic',
    landmark: 'Neon Ring Gate',
    checkpoints: 4,
    shortcuts: 1,
    hazards: ['Nebula Fog (visibility)', 'Asteroid Jump'],
  },
  meadow_valley_01: {
    name: 'Meadow Valley Sprint',
    biome: 'farm',
    difficulty: '★☆☆☆☆',
    laps: 2,
    spline: MEADOW_VALLEY_SPLINE,
    profile: 'rolling',
    landmark: 'Windmill on Hill',
    checkpoints: 3,
    shortcuts: 1,
    hazards: [],
  },
  metro_underpass_01: {
    name: 'Shadow Metro Underpass',
    biome: 'metro',
    difficulty: '★★★★☆',
    laps: 3,
    spline: SHADOW_METRO_SPLINE,
    profile: 'metro',
    landmark: '"METRO GP" Sign',
    checkpoints: 5,
    shortcuts: 1,
    hazards: ['Flickering Lights', 'Steam Vents'],
  },
};

// Export all splines for track system
export const ALL_TRACK_SPLINES = {
  tropical_coast_01: SUNSET_COAST_SPLINE,
  crystal_cave_01: CRYSTAL_CAVERN_SPLINE,
  sky_sky_island_01: SKY_GARDEN_SPLINE,
  volcano_canyon_01: VOLCANIC_INFERNO_SPLINE,
  cyber_city_01: CYBER_CITY_SPLINE,
  frost_peak_01: FROST_PEAK_SPLINE,
  jungle_underwater_temple_01: ANCIENT_RUINS_SPLINE,
  galaxy_drift_01: STARDUST_GALAXY_SPLINE,
  meadow_valley_01: MEADOW_VALLEY_SPLINE,
  metro_underpass_01: SHADOW_METRO_SPLINE,
};

export function getTrackSpline(arenaId) {
  return ALL_TRACK_SPLINES[arenaId];
}

export function getTrackInfo(arenaId) {
  return TRACK_REGISTRY[arenaId];
}
