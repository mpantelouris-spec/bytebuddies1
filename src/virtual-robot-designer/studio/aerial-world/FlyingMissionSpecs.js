/** Generated from docs/bytebuddies-flying-arena-prompts-v2.txt; do not edit. */
export const FLYING_MISSION_SPECS = {
  "drone_aerial_ring_slalom": {
    "id": "drone_aerial_ring_slalom",
    "chassisId": "drone",
    "mode": 1,
    "title": "Aerial Ring Slalom",
    "objective": "Fly through 12 glowing rings in order.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "drone_canyon",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6–8 numbered holo rings, tier forgiving, spacing 22–28m"
    },
    "layout": "canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped\nAltitude band: y 16–22\nOpen sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.",
    "dressing": "Tutorial: widest ring spacing (28m). First ring 8m ahead. Cloud arch frames gate 1.",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "drone_hover_altitude_lock": {
    "id": "drone_hover_altitude_lock",
    "chassisId": "drone",
    "mode": 2,
    "title": "Hover Altitude Lock",
    "objective": "Hold exact altitude through the canyon corridor.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "canyon_flight",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings + altitude bar between gates 2–5"
    },
    "layout": "canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped\nAltitude band: y 24–32\nAltitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.",
    "dressing": "HUD altitude bar green between y=24–30. Rings only count inside band.",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "drone_aerial_target_dive": {
    "id": "drone_aerial_target_dive",
    "chassisId": "drone",
    "mode": 3,
    "title": "Aerial Target Dive",
    "objective": "Dive-bomb 5 targets then pull up before ground.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "storm_cloud",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 3,
      "targetCount": 5,
      "tier": "standard",
      "stuntRing": false,
      "description": "3 rings then 5 ground bullseyes (mixed mode)"
    },
    "layout": "dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28\nAltitude band: y 28–38 dive to 8 on targets\n5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.",
    "dressing": "After ring 3, dive to 5 bullseyes on cloud sea floor — pull up before y=10.",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "drone_quadcopter_swarm_patrol": {
    "id": "drone_quadcopter_swarm_patrol",
    "chassisId": "drone",
    "mode": 4,
    "title": "Quadcopter Swarm Patrol",
    "objective": "Patrol 4 sky sectors with waypoint loops.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "cloud_race",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8–10 rings at crossing points"
    },
    "layout": "figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course\nAltitude band: y 20–30\nFigure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.",
    "dressing": "Figure-8 crossing: 3 translucent drone silhouettes orbit gate 4 (decorative, no collision).",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "drone_vertical_ascent_sprint": {
    "id": "drone_vertical_ascent_sprint",
    "chassisId": "drone",
    "mode": 5,
    "title": "Vertical Ascent Sprint",
    "objective": "Race straight up the tower to the landing pad.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "space_orbit",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "10 rings on spiral — increasing height"
    },
    "layout": "spiral_climb · 130m · climb +70 from y=8 · tightening radius\nAltitude band: y 8 → 78 climb\nLaunch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.",
    "dressing": "Launch tower flame at start. Rings climb with spiral — celebrate at top ring.",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "drone_package_drop_precision": {
    "id": "drone_package_drop_precision",
    "chassisId": "drone",
    "mode": 6,
    "title": "Package Drop Precision",
    "objective": "Drop supply crate on the rooftop X marker.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "flight_rings",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings linking rooftops"
    },
    "layout": "rooftop_stops · 195m · 3 H-pad stops · y 26–34\nAltitude band: y 18–34 (Rescue Drone: 12–22)\n3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.",
    "dressing": "Ring 4 over rooftop — drop zone green square on pad below.",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "drone_aerial_photography_sweep": {
    "id": "drone_aerial_photography_sweep",
    "chassisId": "drone",
    "mode": 7,
    "title": "Aerial Photography Sweep",
    "objective": "Hover over 6 photo waypoints steadily.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "jet_stunt",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6 wide stunt rings, slight tilt 15°"
    },
    "layout": "coast_arc · 230m · y 18–28 · arcs over cliff edge\nAltitude band: y 18–28\nCoast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.",
    "dressing": "3 photo columns (A/B/C) translucent blue — fly through for shutter flash.",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "drone_wind_tunnel_navigation": {
    "id": "drone_wind_tunnel_navigation",
    "chassisId": "drone",
    "mode": 8,
    "title": "Wind Tunnel Navigation",
    "objective": "Fight crosswinds without leaving the corridor.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "rooftop_delivery",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings inside tunnel segment"
    },
    "layout": "wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts\nAltitude band: y 22 locked\nPurple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.",
    "dressing": "Teal wind tunnel tube — stay inside 10m corridor. Turbine blades spin.",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "drone_propeller_flip_stunt": {
    "id": "drone_propeller_flip_stunt",
    "chassisId": "drone",
    "mode": 9,
    "title": "Propeller Flip Stunt",
    "objective": "Execute flip through the stunt ring.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "typhoon",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 7,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": true,
      "description": "7 rings + stunt ring (mixed)"
    },
    "layout": "storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24\nAltitude band: y 22–26\nStorm eye spline + rain + 1 tilted stunt ring at t=0.72",
    "dressing": "Storm eye + ONE tilted stunt ring (45° roll cue) at t=0.72.",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "drone_sky_ace_master": {
    "id": "drone_sky_ace_master",
    "chassisId": "drone",
    "mode": 10,
    "title": "Sky Ace Master",
    "objective": "Capstone: rings, dive, drop, stunt combo course.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "warp_gate",
    "sky": {
      "top": "#e87830",
      "mid": "#f5a623",
      "horizon": "#ffe8b0",
      "fog": "#e8c090",
      "near": 90,
      "far": 280
    },
    "goldenHour": true,
    "bloom": 0.22,
    "parallaxClouds": true,
    "aerialVista": "gothic_clockwork_spire",
    "spawnKind": "sky_academy_arch",
    "gateColors": {
      "primary": 3718648,
      "secondary": 16436245,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings (kid cap) spaced to t=0.90"
    },
    "layout": "capstone_sections · 280m · dive section t=0.65–0.8 · longest course\nAltitude band: y 8–34 multi-section\nCapstone: launch flare + storm segment + warp cathedral torus at end. Starfield.",
    "dressing": "Capstone: cloud arch + storm wall segment + warp ring finish. 8 rings max.",
    "bans": "Oil rigs, carrier deck, neon ribbon, mechanical huts on route\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_heavy_cargo_airlift": {
    "id": "helicopter_heavy_cargo_airlift",
    "chassisId": "helicopter",
    "mode": 1,
    "title": "Heavy Cargo Airlift",
    "objective": "Lift crate from pad A to oil rig landing zone.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "drone_canyon",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6–8 numbered holo rings, tier forgiving, spacing 22–28m"
    },
    "layout": "canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped\nAltitude band: y 16–22\nOpen sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.",
    "dressing": "Suspended orange crate mesh 3m below heli hook at start. Slow spline.",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_offshore_oil_rig_landing": {
    "id": "helicopter_offshore_oil_rig_landing",
    "chassisId": "helicopter",
    "mode": 2,
    "title": "Offshore Oil Rig Landing",
    "objective": "Land on moving platform in crosswind.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "canyon_flight",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings + altitude bar between gates 2–5"
    },
    "layout": "canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped\nAltitude band: y 24–32\nAltitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.",
    "dressing": "Must touch down on rig #2 yellow H pad between gates 3–4.",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_water_bucket_fire_suppression": {
    "id": "helicopter_water_bucket_fire_suppression",
    "chassisId": "helicopter",
    "mode": 3,
    "title": "Water Bucket Fire Suppression",
    "objective": "Fill bucket and dump on firebot_blaze targets.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "storm_cloud",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 3,
      "targetCount": 5,
      "tier": "standard",
      "stuntRing": false,
      "description": "3 rings then 5 ground bullseyes (mixed mode)"
    },
    "layout": "dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28\nAltitude band: y 28–38 dive to 8 on targets\n5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.",
    "dressing": "Storm recipe but vista stays OCEAN. Red fire glow on rig #1 — drop bucket cue.",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_mountain_top_insertion": {
    "id": "helicopter_mountain_top_insertion",
    "chassisId": "helicopter",
    "mode": 4,
    "title": "Mountain Top Insertion",
    "objective": "Insert team at summit waypoint in canyon flight.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "cloud_race",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8–10 rings at crossing points"
    },
    "layout": "figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course\nAltitude band: y 20–30\nFigure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.",
    "dressing": "Figure-8 over ocean — snow-cap white peak prop on rig #3 (not grass mountain).",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_rotor_pitch_control": {
    "id": "helicopter_rotor_pitch_control",
    "chassisId": "helicopter",
    "mode": 5,
    "title": "Rotor Pitch Control",
    "objective": "Hold hover while pitch meter stays in green.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "space_orbit",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "10 rings on spiral — increasing height"
    },
    "layout": "spiral_climb · 130m · climb +70 from y=8 · tightening radius\nAltitude band: y 8 → 78 climb\nLaunch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.",
    "dressing": "Spiral climb over ocean — rotor wash particle streaks at each gate.",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_construction_girder_placement": {
    "id": "helicopter_construction_girder_placement",
    "chassisId": "helicopter",
    "mode": 6,
    "title": "Construction Girder Placement",
    "objective": "Place steel beam on marked hooks.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "flight_rings",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings linking rooftops"
    },
    "layout": "rooftop_stops · 195m · 3 H-pad stops · y 26–34\nAltitude band: y 18–34 (Rescue Drone: 12–22)\n3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.",
    "dressing": "3 rooftop stops with grey steel girder props on pads.",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_long_haul_fuel_flight": {
    "id": "helicopter_long_haul_fuel_flight",
    "chassisId": "helicopter",
    "mode": 7,
    "title": "Long Haul Fuel Flight",
    "objective": "Reach distant pad before fuel runs out.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "jet_stunt",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6 wide stunt rings, slight tilt 15°"
    },
    "layout": "coast_arc · 230m · y 18–28 · arcs over cliff edge\nAltitude band: y 18–28\nCoast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.",
    "dressing": "Coast arc over ocean — tanker ship silhouette below at t=0.5.",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_emergency_medevac_transport": {
    "id": "helicopter_emergency_medevac_transport",
    "chassisId": "helicopter",
    "mode": 8,
    "title": "Emergency Medevac Transport",
    "objective": "Pick up patient from hospital_walk zone.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "rooftop_delivery",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings inside tunnel segment"
    },
    "layout": "wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts\nAltitude band: y 22 locked\nPurple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.",
    "dressing": "Hospital red cross on middle rooftop. Green survivor marker.",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_vehicle_recovery_winch": {
    "id": "helicopter_vehicle_recovery_winch",
    "chassisId": "helicopter",
    "mode": 9,
    "title": "Vehicle Recovery Winch",
    "objective": "Winch stranded rover from crater.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "typhoon",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 7,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": true,
      "description": "7 rings + stunt ring (mixed)"
    },
    "layout": "storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24\nAltitude band: y 22–26\nStorm eye spline + rain + 1 tilted stunt ring at t=0.72",
    "dressing": "Storm eye over churning ocean — winch cable line to vehicle block below.",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "helicopter_sky_crane_master": {
    "id": "helicopter_sky_crane_master",
    "chassisId": "helicopter",
    "mode": 10,
    "title": "Sky Crane Master",
    "objective": "Capstone lift + land + medevac chain.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "warp_gate",
    "sky": {
      "top": "#38bdf8",
      "mid": "#7dd3fc",
      "horizon": "#bae6fd",
      "fog": "#93c5fd",
      "near": 100,
      "far": 320
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "venetian_midnight_canal",
    "spawnKind": "offshore_platform",
    "gateColors": {
      "primary": 16498468,
      "secondary": 1982639,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings (kid cap) spaced to t=0.90"
    },
    "layout": "capstone_sections · 280m · dive section t=0.65–0.8 · longest course\nAltitude band: y 8–34 multi-section\nCapstone: launch flare + storm segment + warp cathedral torus at end. Starfield.",
    "dressing": "Capstone: 4 rigs + medevac pad + warp finish. Cargo crate through final ring.",
    "bans": "Grass islands, cloud castle, carrier deck, neon ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_anti_gravity_glide": {
    "id": "hoverbot_anti_gravity_glide",
    "chassisId": "hoverbot",
    "mode": 1,
    "title": "Anti-Gravity Glide",
    "objective": "Glide frictionless across the sky arena gap.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "drone_canyon",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "cybernetic_assembly_line",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6–8 numbered holo rings, tier forgiving, spacing 22–28m"
    },
    "layout": "canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped\nAltitude band: y 16–22\nOpen sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.",
    "dressing": "Tutorial: repulsor gate pulse. Smooth canyon — pads visible at y=floorY+8.",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_repulsor_field_push": {
    "id": "hoverbot_repulsor_field_push",
    "chassisId": "hoverbot",
    "mode": 2,
    "title": "Repulsor Field Push",
    "objective": "Push debris blocks off the hover lane.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "canyon_flight",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "cybernetic_assembly_line",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings + altitude bar between gates 2–5"
    },
    "layout": "canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped\nAltitude band: y 24–32\nAltitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.",
    "dressing": "Altitude lock between violet hex gates. Plasma bridge visible to next pad.",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_magnet_rail_hover": {
    "id": "hoverbot_magnet_rail_hover",
    "chassisId": "hoverbot",
    "mode": 3,
    "title": "Magnet Rail Hover",
    "objective": "Lock onto mag-rail and follow the circuit.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "storm_cloud",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "cybernetic_assembly_line",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 3,
      "targetCount": 5,
      "tier": "standard",
      "stuntRing": false,
      "description": "3 rings then 5 ground bullseyes (mixed mode)"
    },
    "layout": "dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28\nAltitude band: y 28–38 dive to 8 on targets\n5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.",
    "dressing": "Storm walls tinted purple. Magnet rail glowing strip under gates 2–4.",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_zero_g_physics_room": {
    "id": "hoverbot_zero_g_physics_room",
    "chassisId": "hoverbot",
    "mode": 4,
    "title": "Zero-G Physics Room",
    "objective": "Navigate zero_g chamber without touching walls.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "cloud_race",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "cybernetic_assembly_line",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8–10 rings at crossing points"
    },
    "layout": "figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course\nAltitude band: y 20–30\nFigure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.",
    "dressing": "Figure-8 in zero-G — slow rotation on lab pads at corners.",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_hover_height_calibration": {
    "id": "hoverbot_hover_height_calibration",
    "chassisId": "hoverbot",
    "mode": 5,
    "title": "Hover Height Calibration",
    "objective": "Hold 3 different altitudes at markers.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "space_orbit",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "cybernetic_assembly_line",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "10 rings on spiral — increasing height"
    },
    "layout": "spiral_climb · 130m · climb +70 from y=8 · tightening radius\nAltitude band: y 8 → 78 climb\nLaunch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.",
    "dressing": "Spiral climb between lab pads — height tick marks on repulsor gate.",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_smooth_banked_glide": {
    "id": "hoverbot_smooth_banked_glide",
    "chassisId": "hoverbot",
    "mode": 6,
    "title": "Smooth Banked Glide",
    "objective": "Bank through cloud race turns smoothly.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "flight_rings",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "cybernetic_assembly_line",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings linking rooftops"
    },
    "layout": "rooftop_stops · 195m · 3 H-pad stops · y 26–34\nAltitude band: y 18–34 (Rescue Drone: 12–22)\n3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.",
    "dressing": "Rooftop stops replaced by floating lab pads with teal bridges.",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_energy_shield_bounce": {
    "id": "hoverbot_energy_shield_bounce",
    "chassisId": "hoverbot",
    "mode": 7,
    "title": "Energy Shield Bounce",
    "objective": "Bounce off shields to reach high platforms.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "jet_stunt",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "cybernetic_assembly_line",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6 wide stunt rings, slight tilt 15°"
    },
    "layout": "coast_arc · 230m · y 18–28 · arcs over cliff edge\nAltitude band: y 18–28\nCoast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.",
    "dressing": "Coast arc with translucent shield dome at gate 3 (bounce cue).",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_plasma_thruster_boost": {
    "id": "hoverbot_plasma_thruster_boost",
    "chassisId": "hoverbot",
    "mode": 8,
    "title": "Plasma Thruster Boost",
    "objective": "Chain boost pads on drone canyon course.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "rooftop_delivery",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "cybernetic_assembly_line",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings inside tunnel segment"
    },
    "layout": "wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts\nAltitude band: y 22 locked\nPurple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.",
    "dressing": "Warp tunnel cyan/purple — 1 boost pad at tunnel midpoint.",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_chasm_crossing_glide": {
    "id": "hoverbot_chasm_crossing_glide",
    "chassisId": "hoverbot",
    "mode": 9,
    "title": "Chasm Crossing Glide",
    "objective": "Cross widest gap on single battery charge.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "typhoon",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "cybernetic_assembly_line",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 7,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": true,
      "description": "7 rings + stunt ring (mixed)"
    },
    "layout": "storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24\nAltitude band: y 22–26\nStorm eye spline + rain + 1 tilted stunt ring at t=0.72",
    "dressing": "Storm eye between two lab pads — chasm void below (black plane).",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverbot_anti_gravity_master": {
    "id": "hoverbot_anti_gravity_master",
    "chassisId": "hoverbot",
    "mode": 10,
    "title": "Anti-Gravity Master",
    "objective": "Capstone glide + boost + precision landing.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "warp_gate",
    "sky": {
      "top": "#e0e7ff",
      "mid": "#c4b5fd",
      "horizon": "#ddd6fe",
      "fog": "#c4b5fd",
      "near": 110,
      "far": 340
    },
    "goldenHour": false,
    "bloom": 0.22,
    "parallaxClouds": false,
    "aerialVista": "victorian_grand_library",
    "spawnKind": "repulsor_gate",
    "gateColors": {
      "primary": 10980346,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings (kid cap) spaced to t=0.90"
    },
    "layout": "capstone_sections · 280m · dive section t=0.65–0.8 · longest course\nAltitude band: y 8–34 multi-section\nCapstone: launch flare + storm segment + warp cathedral torus at end. Starfield.",
    "dressing": "Capstone: repulsor + spiral + tunnel + warp arch. Violet/teal only.",
    "bans": "Ocean, grass, cloud whale, farm terrain\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_supersonic_dogfight": {
    "id": "jetplane_supersonic_dogfight",
    "chassisId": "jetplane",
    "mode": 1,
    "title": "Supersonic Dogfight",
    "objective": "Fly the ace training lane — holo rings over the carrier deck.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "drone_canyon",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6–8 numbered holo rings, tier forgiving, spacing 22–28m"
    },
    "layout": "canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped\nAltitude band: y 16–22\nOpen sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.",
    "dressing": "REFERENCE MISSION. buildSpawnSkyIsland + carrier vista + 6–8 holo rings. FOV 48 bloom 0.24.",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_precision_air_strike": {
    "id": "jetplane_precision_air_strike",
    "chassisId": "jetplane",
    "mode": 2,
    "title": "Precision Air Strike",
    "objective": "Hit ground targets without collateral.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "canyon_flight",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings + altitude bar between gates 2–5"
    },
    "layout": "canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped\nAltitude band: y 24–32\nAltitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.",
    "dressing": "Altitude lock canyon over carrier. 1 target bullseye on deck after ring 4.",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_aircraft_carrier_touch_and_go": {
    "id": "jetplane_aircraft_carrier_touch_and_go",
    "chassisId": "jetplane",
    "mode": 3,
    "title": "Aircraft Carrier Touch-and-Go",
    "objective": "Land and launch on carrier deck.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "storm_cloud",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 3,
      "targetCount": 5,
      "tier": "standard",
      "stuntRing": false,
      "description": "3 rings then 5 ground bullseyes (mixed mode)"
    },
    "layout": "dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28\nAltitude band: y 28–38 dive to 8 on targets\n5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.",
    "dressing": "Storm dive — touch deck line at z=cz-98 between gates 3–4 then pull up.",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_mach_2_speed_trap": {
    "id": "jetplane_mach_2_speed_trap",
    "chassisId": "jetplane",
    "mode": 4,
    "title": "Mach 2 Speed Trap",
    "objective": "Break Mach 2 through speed trap gates.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "cloud_race",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8–10 rings at crossing points"
    },
    "layout": "figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course\nAltitude band: y 20–30\nFigure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.",
    "dressing": "Figure-8 high speed — speed lines particle burst at gate 6.",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_radar_evasion_stealth_flight": {
    "id": "jetplane_radar_evasion_stealth_flight",
    "chassisId": "jetplane",
    "mode": 5,
    "title": "Radar Evasion Stealth Flight",
    "objective": "Cross zone without radar lock.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "space_orbit",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "10 rings on spiral — increasing height"
    },
    "layout": "spiral_climb · 130m · climb +70 from y=8 · tightening radius\nAltitude band: y 8 → 78 climb\nLaunch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.",
    "dressing": "Spiral climb — keep below radar cone (green sweep mesh on carrier).",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_missile_jammer_countermeasures": {
    "id": "jetplane_missile_jammer_countermeasures",
    "chassisId": "jetplane",
    "mode": 6,
    "title": "Missile Jammer Countermeasures",
    "objective": "Jam incoming missiles during run.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "flight_rings",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings linking rooftops"
    },
    "layout": "rooftop_stops · 195m · 3 H-pad stops · y 26–34\nAltitude band: y 18–34 (Rescue Drone: 12–22)\n3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.",
    "dressing": "3 rooftop stops over carrier vista — jammer dish on pad 2.",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_mid_air_tanker_refuel": {
    "id": "jetplane_mid_air_tanker_refuel",
    "chassisId": "jetplane",
    "mode": 7,
    "title": "Mid-Air Tanker Refuel",
    "objective": "Dock with tanker mid-flight.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "jet_stunt",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6 wide stunt rings, slight tilt 15°"
    },
    "layout": "coast_arc · 230m · y 18–28 · arcs over cliff edge\nAltitude band: y 18–28\nCoast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.",
    "dressing": "Coast arc — tanker plane silhouette parallel at t=0.45 (refuel probe cue).",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_canyon_run_precision": {
    "id": "jetplane_canyon_run_precision",
    "chassisId": "jetplane",
    "mode": 8,
    "title": "Canyon Run Precision",
    "objective": "Thread canyon at minimum altitude.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "rooftop_delivery",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings inside tunnel segment"
    },
    "layout": "wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts\nAltitude band: y 22 locked\nPurple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.",
    "dressing": "Wind tunnel between carrier towers — tight 10m corridor.",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_escort_transport_jet": {
    "id": "jetplane_escort_transport_jet",
    "chassisId": "jetplane",
    "mode": 9,
    "title": "Escort Transport Jet",
    "objective": "Escort cargo plane through typhoon.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "typhoon",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 7,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": true,
      "description": "7 rings + stunt ring (mixed)"
    },
    "layout": "storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24\nAltitude band: y 22–26\nStorm eye spline + rain + 1 tilted stunt ring at t=0.72",
    "dressing": "Storm eye escort — transport silhouette ahead through eye.",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "jetplane_top_gun_ace_fighter": {
    "id": "jetplane_top_gun_ace_fighter",
    "chassisId": "jetplane",
    "mode": 10,
    "title": "Top Gun Ace Fighter",
    "objective": "Capstone dogfight + strike + carrier landing.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "warp_gate",
    "sky": {
      "top": "#3478b8",
      "mid": "#87b9d6",
      "horizon": "#ffd39a",
      "fog": "#d7b78f",
      "near": 125,
      "far": 380
    },
    "goldenHour": true,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "low_orbit_stealth_carrier",
    "spawnKind": "spawn_sky_island",
    "gateColors": {
      "primary": 3900150,
      "secondary": 15680580,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings (kid cap) spaced to t=0.90"
    },
    "layout": "capstone_sections · 280m · dive section t=0.65–0.8 · longest course\nAltitude band: y 8–34 multi-section\nCapstone: launch flare + storm segment + warp cathedral torus at end. Starfield.",
    "dressing": "Capstone: island spawn + carrier + storm + warp cathedral. Gold flags.",
    "bans": "Oil rig, purple lab pads, neon FPV ribbon\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_radar_dome_infiltration": {
    "id": "steathjet_radar_dome_infiltration",
    "chassisId": "steathjet",
    "mode": 1,
    "title": "Radar Dome Infiltration",
    "objective": "Penetrate radar dome undetected.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "drone_canyon",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6–8 numbered holo rings, tier forgiving, spacing 22–28m"
    },
    "layout": "canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped\nAltitude band: y 16–22\nOpen sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.",
    "dressing": "Tutorial: hangar spawn, stars, green stealth rings dim emissive 0.4.",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_night_bombing_raid": {
    "id": "steathjet_night_bombing_raid",
    "chassisId": "steathjet",
    "mode": 2,
    "title": "Night Bombing Raid",
    "objective": "Hit targets on night_patrol map.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "canyon_flight",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings + altitude bar between gates 2–5"
    },
    "layout": "canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped\nAltitude band: y 24–32\nAltitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.",
    "dressing": "Altitude canyon — avoid lit windows on distant building silhouettes.",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_thermal_signature_suppression": {
    "id": "steathjet_thermal_signature_suppression",
    "chassisId": "steathjet",
    "mode": 3,
    "title": "Thermal Signature Suppression",
    "objective": "Stay cold on thermal sensors.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "storm_cloud",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 3,
      "targetCount": 5,
      "tier": "standard",
      "stuntRing": false,
      "description": "3 rings then 5 ground bullseyes (mixed mode)"
    },
    "layout": "dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28\nAltitude band: y 28–38 dive to 8 on targets\n5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.",
    "dressing": "Storm dive — stay in cold blue corridor between walls.",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_shadow_formation_flight": {
    "id": "steathjet_shadow_formation_flight",
    "chassisId": "steathjet",
    "mode": 4,
    "title": "Shadow Formation Flight",
    "objective": "Fly formation without breaking stealth.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "cloud_race",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8–10 rings at crossing points"
    },
    "layout": "figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course\nAltitude band: y 20–30\nFigure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.",
    "dressing": "Figure-8 — 2 ghost jet silhouettes offset 20m (decorative).",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_electronic_warfare_jamming": {
    "id": "steathjet_electronic_warfare_jamming",
    "chassisId": "steathjet",
    "mode": 5,
    "title": "Electronic Warfare Jamming",
    "objective": "Jam enemy comms at waypoint.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "space_orbit",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "10 rings on spiral — increasing height"
    },
    "layout": "spiral_climb · 130m · climb +70 from y=8 · tightening radius\nAltitude band: y 8 → 78 climb\nLaunch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.",
    "dressing": "Spiral — jamming static particles at gates 4–6.",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_high_altitude_recon_photo": {
    "id": "steathjet_high_altitude_recon_photo",
    "chassisId": "steathjet",
    "mode": 6,
    "title": "High-Altitude Recon Photo",
    "objective": "Photograph 6 targets from altitude.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "flight_rings",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings linking rooftops"
    },
    "layout": "rooftop_stops · 195m · 3 H-pad stops · y 26–34\nAltitude band: y 18–34 (Rescue Drone: 12–22)\n3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.",
    "dressing": "Rooftop photo columns over dark city grid below radar dome.",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_silent_glide_approach": {
    "id": "steathjet_silent_glide_approach",
    "chassisId": "steathjet",
    "mode": 7,
    "title": "Silent Glide Approach",
    "objective": "Glide in with engines off.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "jet_stunt",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6 wide stunt rings, slight tilt 15°"
    },
    "layout": "coast_arc · 230m · y 18–28 · arcs over cliff edge\nAltitude band: y 18–28\nCoast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.",
    "dressing": "Coast arc silent — minimal emissive, glide slope 3°.",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_precision_missile_sniping": {
    "id": "steathjet_precision_missile_sniping",
    "chassisId": "steathjet",
    "mode": 8,
    "title": "Precision Missile Sniping",
    "objective": "Single missile per target — no misses.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "rooftop_delivery",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings inside tunnel segment"
    },
    "layout": "wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts\nAltitude band: y 22 locked\nPurple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.",
    "dressing": "Wind tunnel — single red target at end inside tunnel.",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_emp_bomb_drop": {
    "id": "steathjet_emp_bomb_drop",
    "chassisId": "steathjet",
    "mode": 9,
    "title": "EMP Bomb Drop",
    "objective": "EMP drop disables grid then escape.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "typhoon",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 7,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": true,
      "description": "7 rings + stunt ring (mixed)"
    },
    "layout": "storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24\nAltitude band: y 22–26\nStorm eye spline + rain + 1 tilted stunt ring at t=0.72",
    "dressing": "Storm eye — EMP pulse ring flash at t=0.72.",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "steathjet_ghost_jet_master": {
    "id": "steathjet_ghost_jet_master",
    "chassisId": "steathjet",
    "mode": 10,
    "title": "Ghost Jet Master",
    "objective": "Capstone stealth strike mission.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "warp_gate",
    "sky": {
      "top": "#0f172a",
      "mid": "#1e293b",
      "horizon": "#312e81",
      "fog": "#1e293b",
      "near": 80,
      "far": 260
    },
    "goldenHour": false,
    "bloom": 0.2,
    "parallaxClouds": false,
    "aerialVista": "obsidian_citadel",
    "spawnKind": "hangar_mouth",
    "gateColors": {
      "primary": 2278750,
      "secondary": 6583435,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings (kid cap) spaced to t=0.90"
    },
    "layout": "capstone_sections · 280m · dive section t=0.65–0.8 · longest course\nAltitude band: y 8–34 multi-section\nCapstone: launch flare + storm segment + warp cathedral torus at end. Starfield.",
    "dressing": "Capstone: hangar + radar + storm + warp. All emissive ≤0.5.",
    "bans": "Peach sunset, bright golden hour, cloud playground\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_smoke_trail_loop_de_loop": {
    "id": "aerobat_smoke_trail_loop_de_loop",
    "chassisId": "aerobat",
    "mode": 1,
    "title": "Smoke Trail Loop-de-Loop",
    "objective": "Complete loop leaving smoke trail.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "drone_canyon",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6–8 numbered holo rings, tier forgiving, spacing 22–28m"
    },
    "layout": "canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped\nAltitude band: y 16–22\nOpen sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.",
    "dressing": "Tutorial: airshow banner + coast vista. Wide ring at loop apex t=0.35.",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_barrel_roll_speed_slalom": {
    "id": "aerobat_barrel_roll_speed_slalom",
    "chassisId": "aerobat",
    "mode": 2,
    "title": "Barrel Roll Speed Slalom",
    "objective": "Barrel roll between slalom pylons.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "canyon_flight",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings + altitude bar between gates 2–5"
    },
    "layout": "canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped\nAltitude band: y 24–32\nAltitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.",
    "dressing": "Altitude canyon — rings tilted 30° alternating.",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_knife_edge_flying": {
    "id": "aerobat_knife_edge_flying",
    "chassisId": "aerobat",
    "mode": 3,
    "title": "Knife-Edge Flying",
    "objective": "Hold knife-edge through gate sequence.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "storm_cloud",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 3,
      "targetCount": 5,
      "tier": "standard",
      "stuntRing": false,
      "description": "3 rings then 5 ground bullseyes (mixed mode)"
    },
    "layout": "dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28\nAltitude band: y 28–38 dive to 8 on targets\n5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.",
    "dressing": "Storm dive along cliff edge — knife-edge ring roll cue.",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_air_show_formation_dance": {
    "id": "aerobat_air_show_formation_dance",
    "chassisId": "aerobat",
    "mode": 4,
    "title": "Air Show Formation Dance",
    "objective": "Mirror lead plane through formation.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "cloud_race",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8–10 rings at crossing points"
    },
    "layout": "figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course\nAltitude band: y 20–30\nFigure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.",
    "dressing": "Figure-8 with 3 smoke torus rings (white, opacity 0.35).",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_touch_and_go_ribbon_snip": {
    "id": "aerobat_touch_and_go_ribbon_snip",
    "chassisId": "aerobat",
    "mode": 5,
    "title": "Touch-and-Go Ribbon Snip",
    "objective": "Clip ribbon with wing on low pass.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "space_orbit",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "10 rings on spiral — increasing height"
    },
    "layout": "spiral_climb · 130m · climb +70 from y=8 · tightening radius\nAltitude band: y 8 → 78 climb\nLaunch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.",
    "dressing": "Spiral — orange ribbon banner gate to snip at t=0.5.",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_inverted_flying_sprint": {
    "id": "aerobat_inverted_flying_sprint",
    "chassisId": "aerobat",
    "mode": 6,
    "title": "Inverted Flying Sprint",
    "objective": "Inverted flight through cloud_race section.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "flight_rings",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings linking rooftops"
    },
    "layout": "rooftop_stops · 195m · 3 H-pad stops · y 26–34\nAltitude band: y 18–34 (Rescue Drone: 12–22)\n3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.",
    "dressing": "Rooftop stops over coast — inverted rings upside-down torus.",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_hammerhead_turn_stunt": {
    "id": "aerobat_hammerhead_turn_stunt",
    "chassisId": "aerobat",
    "mode": 7,
    "title": "Hammerhead Turn Stunt",
    "objective": "Hammerhead at stunt checkpoint.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "jet_stunt",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6 wide stunt rings, slight tilt 15°"
    },
    "layout": "coast_arc · 230m · y 18–28 · arcs over cliff edge\nAltitude band: y 18–28\nCoast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.",
    "dressing": "Coast arc hammerhead — lighthouse at t=0.35, vertical climb ring.",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_pyrotechnic_night_flight": {
    "id": "aerobat_pyrotechnic_night_flight",
    "chassisId": "aerobat",
    "mode": 8,
    "title": "Pyrotechnic Night Flight",
    "objective": "Fly fireworks display path.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "rooftop_delivery",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings inside tunnel segment"
    },
    "layout": "wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts\nAltitude band: y 22 locked\nPurple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.",
    "dressing": "Wind tunnel with firework particle bursts at gates 2/5/8.",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_pylon_slalom_time_attack": {
    "id": "aerobat_pylon_slalom_time_attack",
    "chassisId": "aerobat",
    "mode": 9,
    "title": "Pylon Slalom Time Attack",
    "objective": "Best time through pylon course.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "typhoon",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 7,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": true,
      "description": "7 rings + stunt ring (mixed)"
    },
    "layout": "storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24\nAltitude band: y 22–26\nStorm eye spline + rain + 1 tilted stunt ring at t=0.72",
    "dressing": "Storm eye slalom — red-white pylons between rings.",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "aerobat_red_bull_air_race_champion": {
    "id": "aerobat_red_bull_air_race_champion",
    "chassisId": "aerobat",
    "mode": 10,
    "title": "Red Bull Air Race Champion",
    "objective": "Capstone aerobatic championship.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "warp_gate",
    "sky": {
      "top": "#4a90d9",
      "mid": "#ffaa55",
      "horizon": "#ffd966",
      "fog": "#ffcc88",
      "near": 100,
      "far": 320
    },
    "goldenHour": true,
    "bloom": 0.23,
    "parallaxClouds": false,
    "aerialVista": "monastic_ruins",
    "spawnKind": "airshow_banner",
    "gateColors": {
      "primary": 16486972,
      "secondary": 16317180,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings (kid cap) spaced to t=0.90"
    },
    "layout": "capstone_sections · 280m · dive section t=0.65–0.8 · longest course\nAltitude band: y 8–34 multi-section\nCapstone: launch flare + storm segment + warp cathedral torus at end. Starfield.",
    "dressing": "Capstone: banner + lighthouse + smoke rings + warp finish.",
    "bans": "Neon FPV ribbon, radar dome, oil platform\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_fpv_drone_racing_circuit": {
    "id": "racedrone_fpv_drone_racing_circuit",
    "chassisId": "racedrone",
    "mode": 1,
    "title": "FPV Drone Racing Circuit",
    "objective": "Rainbow Road ribbon race from FPV chase cam.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "rainbow_road",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "hard",
      "stuntRing": false,
      "description": "8 tight FPV rings"
    },
    "layout": "figure8 · 220m · centerY 24 · amplitude 7 · crossing at mid-course\nAltitude band: y 22–26\nNeon race ribbon 6m wide under path — pink #ec4899 / cyan #06b6d4 / violet #a855f7. 0–1 boost pad.",
    "dressing": "Tutorial: neon gantry + rainbow ribbon 6m. 8 tight rings. NO grass.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_tunnel_turbo_dash": {
    "id": "racedrone_tunnel_turbo_dash",
    "chassisId": "racedrone",
    "mode": 2,
    "title": "Tunnel Turbo Dash",
    "objective": "Burst through neon tunnel on Dragon Skyway.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "drone_canyon",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6–8 numbered holo rings, tier forgiving, spacing 22–28m"
    },
    "layout": "canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped\nAltitude band: y 16–22\nOpen sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.",
    "dressing": "Warp tunnel purple/pink entire course. 0 boost pads mode 2.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_gate_proximity_drift": {
    "id": "racedrone_gate_proximity_drift",
    "chassisId": "racedrone",
    "mode": 3,
    "title": "Gate Proximity Drift",
    "objective": "Clip gate edges for drift bonus points.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "sunny_circuit",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 12,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "10–12 rings on curves"
    },
    "layout": "figure8 · 200m · centerY 24 · amplitude 5 · crossing at mid-course\nAltitude band: y 22–28\nFigure-8 plasma lane (Hover Racer) or ribbon (if race) — drift corners banked 12°.",
    "dressing": "Sunny figure-8 — drift smoke puffs at apex corners.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_speed_trap_sky_burst": {
    "id": "racedrone_speed_trap_sky_burst",
    "chassisId": "racedrone",
    "mode": 4,
    "title": "Speed Trap Sky Burst",
    "objective": "Hit 6 speed traps on the cloud race line.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "cloud_race",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8–10 rings at crossing points"
    },
    "layout": "figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course\nAltitude band: y 20–30\nFigure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.",
    "dressing": "Cloud race figure-8 but vista stays NEON RIBBON not clouds.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_high_speed_slalom": {
    "id": "racedrone_high_speed_slalom",
    "chassisId": "racedrone",
    "mode": 5,
    "title": "High-Speed Slalom",
    "objective": "Slalom floating rings at max throttle.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "dragon_skyway",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 16,
      "targetCount": 0,
      "tier": "hard",
      "stuntRing": false,
      "description": "12–16 rings, hard tier"
    },
    "layout": "canyon_slalom · 240m · 28 pts · y 20–30 · lateral sine ×6 damped\nAltitude band: y 20–30\nDragon-spine canyon slalom 240m + purple warp tunnel segment mid-course.",
    "dressing": "Dragon spine 240m + tunnel mid — ribbon orange/violet.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_battery_drain_time_attack": {
    "id": "racedrone_battery_drain_time_attack",
    "chassisId": "racedrone",
    "mode": 6,
    "title": "Battery Drain Time Attack",
    "objective": "Finish before battery hits zero.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "flight_rings",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings linking rooftops"
    },
    "layout": "rooftop_stops · 195m · 3 H-pad stops · y 26–34\nAltitude band: y 18–34 (Rescue Drone: 12–22)\n3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.",
    "dressing": "Rooftop skim — battery HUD drains; recharge pad cyan at gate 4.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_acrobatic_barrel_roll": {
    "id": "racedrone_acrobatic_barrel_roll",
    "chassisId": "racedrone",
    "mode": 7,
    "title": "Acrobatic Barrel Roll",
    "objective": "Roll through the storm cloud gate.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "volcano_drift",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 7,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": true,
      "description": "7 rings + stunt ring"
    },
    "layout": "storm_eye · 180m · wide outer ring then tight eye at t=0.65 · y≈22\nAltitude band: y 20–26\nVolcano cone + lava glow off-path right. Storm_eye spline with drift corners.",
    "dressing": "Volcano drift storm eye — stunt ring tilted 60°.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_ghost_drone_race": {
    "id": "racedrone_ghost_drone_race",
    "chassisId": "racedrone",
    "mode": 8,
    "title": "Ghost Drone Race",
    "objective": "Beat your ghost lap on Volcano Drift.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "storm_cloud",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 3,
      "targetCount": 5,
      "tier": "standard",
      "stuntRing": false,
      "description": "3 rings then 5 ground bullseyes (mixed mode)"
    },
    "layout": "dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28\nAltitude band: y 28–38 dive to 8 on targets\n5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.",
    "dressing": "Storm walls + translucent ghost drone 0.3 opacity ahead on spline.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_low_altitude_lawn_mower": {
    "id": "racedrone_low_altitude_lawn_mower",
    "chassisId": "racedrone",
    "mode": 9,
    "title": "Low-Altitude Lawn Mower",
    "objective": "Skim rooftop delivery route at 2m altitude.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "street_grand_prix",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings between rooftops"
    },
    "layout": "rooftop_stops · 200m · 4 H-pad stops · y 18–23\nAltitude band: y 12–23\nLow rooftop skim y 18–23. 4 building blocks + orange roof pads. Grey ribbon segments.",
    "dressing": "Street grand prix y 12–18 — rings almost touch rooftops.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "racedrone_grand_sky_prix_champion": {
    "id": "racedrone_grand_sky_prix_champion",
    "chassisId": "racedrone",
    "mode": 10,
    "title": "Grand Sky Prix Champion",
    "objective": "Final: hybrid sky + Rainbow Road championship.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "warp_gate",
    "sky": {
      "top": "#120428",
      "mid": "#2a1058",
      "horizon": "#4c1d95",
      "fog": "#1e1b4b",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "neon_server_necropolis",
    "spawnKind": "neon_gantry",
    "gateColors": {
      "primary": 15485081,
      "secondary": 440020,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings (kid cap) spaced to t=0.90"
    },
    "layout": "capstone_sections · 280m · dive section t=0.65–0.8 · longest course\nAltitude band: y 8–34 multi-section\nCapstone: launch flare + storm segment + warp cathedral torus at end. Starfield.",
    "dressing": "Capstone: gantry + ribbon + tunnel + warp. Pink/cyan only.",
    "bans": "Grass islands, cloud castle, lighthouse, carrier\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_quantum_speedway_grand_prix": {
    "id": "hoverracer_quantum_speedway_grand_prix",
    "chassisId": "hoverracer",
    "mode": 1,
    "title": "Quantum Speedway Grand Prix",
    "objective": "Rainbow Road lap 1 — plasma hover tires.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "rainbow_road",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "hard",
      "stuntRing": false,
      "description": "8 tight FPV rings"
    },
    "layout": "figure8 · 220m · centerY 24 · amplitude 7 · crossing at mid-course\nAltitude band: y 22–26\nNeon race ribbon 6m wide under path — pink #ec4899 / cyan #06b6d4 / violet #a855f7. 0–1 boost pad.",
    "dressing": "Tutorial: warp gate arch + plasma lanes (NOT neon ribbon). Violet sky.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_mach_1_speed_test": {
    "id": "hoverracer_mach_1_speed_test",
    "chassisId": "hoverracer",
    "mode": 2,
    "title": "Mach 1 Speed Test",
    "objective": "Break speed record on sunny_circuit straight.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "drone_canyon",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6–8 numbered holo rings, tier forgiving, spacing 22–28m"
    },
    "layout": "canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped\nAltitude band: y 16–22\nOpen sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.",
    "dressing": "Canyon slalom speed test — plasma underlay on straightaways.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_plasma_drift_cornering": {
    "id": "hoverracer_plasma_drift_cornering",
    "chassisId": "hoverracer",
    "mode": 3,
    "title": "Plasma Drift Cornering",
    "objective": "Drift every corner on Dragon Skyway.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "sunny_circuit",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 12,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "10–12 rings on curves"
    },
    "layout": "figure8 · 200m · centerY 24 · amplitude 5 · crossing at mid-course\nAltitude band: y 22–28\nFigure-8 plasma lane (Hover Racer) or ribbon (if race) — drift corners banked 12°.",
    "dressing": "Figure-8 sunny circuit — cyan recharge pads at apex.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_energy_pad_recharge": {
    "id": "hoverracer_energy_pad_recharge",
    "chassisId": "hoverracer",
    "mode": 4,
    "title": "Energy Pad Recharge",
    "objective": "Hit all recharge pads before battery empty.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "cloud_race",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8–10 rings at crossing points"
    },
    "layout": "figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course\nAltitude band: y 20–30\nFigure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.",
    "dressing": "Cloud figure-8 — 3 pulsing recharge pads at corners.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_sonic_boom_slalom": {
    "id": "hoverracer_sonic_boom_slalom",
    "chassisId": "hoverracer",
    "mode": 5,
    "title": "Sonic Boom Slalom",
    "objective": "Slalom rings in storm_cloud corridor.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "dragon_skyway",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 16,
      "targetCount": 0,
      "tier": "hard",
      "stuntRing": false,
      "description": "12–16 rings, hard tier"
    },
    "layout": "canyon_slalom · 240m · 28 pts · y 20–30 · lateral sine ×6 damped\nAltitude band: y 20–30\nDragon-spine canyon slalom 240m + purple warp tunnel segment mid-course.",
    "dressing": "Dragon spine — sonic boom ring shockwave mesh at gate 8.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_elimination_hover_sprint": {
    "id": "hoverracer_elimination_hover_sprint",
    "chassisId": "hoverracer",
    "mode": 6,
    "title": "Elimination Hover Sprint",
    "objective": "Stay ahead as last-place gates close.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "flight_rings",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings linking rooftops"
    },
    "layout": "rooftop_stops · 195m · 3 H-pad stops · y 26–34\nAltitude band: y 18–34 (Rescue Drone: 12–22)\n3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.",
    "dressing": "Rooftop sprint — elimination gate closes (red) if slow.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_warp_tunnel_burst": {
    "id": "hoverracer_warp_tunnel_burst",
    "chassisId": "hoverracer",
    "mode": 7,
    "title": "Warp Tunnel Burst",
    "objective": "Navigate warp_gate tunnel at max speed.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "volcano_drift",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 7,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": true,
      "description": "7 rings + stunt ring"
    },
    "layout": "storm_eye · 180m · wide outer ring then tight eye at t=0.65 · y≈22\nAltitude band: y 20–26\nVolcano cone + lava glow off-path right. Storm_eye spline with drift corners.",
    "dressing": "Volcano + purple tunnel burst at t=0.5.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_mag_strip_inversion": {
    "id": "hoverracer_mag_strip_inversion",
    "chassisId": "hoverracer",
    "mode": 8,
    "title": "Mag-Strip Inversion",
    "objective": "Complete inverted mag-strip section upside-down.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "storm_cloud",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 3,
      "targetCount": 5,
      "tier": "standard",
      "stuntRing": false,
      "description": "3 rings then 5 ground bullseyes (mixed mode)"
    },
    "layout": "dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28\nAltitude band: y 28–38 dive to 8 on targets\n5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.",
    "dressing": "Storm walls — mag strip teal line flips hover 180° at gate 5.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_turbo_slipstream_chase": {
    "id": "hoverracer_turbo_slipstream_chase",
    "chassisId": "hoverracer",
    "mode": 9,
    "title": "Turbo Slipstream Chase",
    "objective": "Draft behind ghost racer then overtake.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "street_grand_prix",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings between rooftops"
    },
    "layout": "rooftop_stops · 200m · 4 H-pad stops · y 18–23\nAltitude band: y 12–23\nLow rooftop skim y 18–23. 4 building blocks + orange roof pads. Grey ribbon segments.",
    "dressing": "Street skim chase — lead racer silhouette purple.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "hoverracer_galactic_turbo_champion": {
    "id": "hoverracer_galactic_turbo_champion",
    "chassisId": "hoverracer",
    "mode": 10,
    "title": "Galactic Turbo Champion",
    "objective": "Championship on street_grand_prix finale.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "warp_gate",
    "sky": {
      "top": "#4c1d95",
      "mid": "#6b21a8",
      "horizon": "#7c3aed",
      "fog": "#4c1d95",
      "near": 70,
      "far": 240
    },
    "goldenHour": false,
    "bloom": 0.24,
    "parallaxClouds": false,
    "aerialVista": "quantum_reactor_core",
    "spawnKind": "warp_gate_arch",
    "gateColors": {
      "primary": 11032055,
      "secondary": 2282478,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings (kid cap) spaced to t=0.90"
    },
    "layout": "capstone_sections · 280m · dive section t=0.65–0.8 · longest course\nAltitude band: y 8–34 multi-section\nCapstone: launch flare + storm segment + warp cathedral torus at end. Starfield.",
    "dressing": "Capstone: warp arch + plasma lanes + volcano + cathedral.",
    "bans": "Pink neon ribbon (Racing Drone asset), grass islands\n\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_disaster_zone_search": {
    "id": "rescuedrone_disaster_zone_search",
    "chassisId": "rescuedrone",
    "mode": 1,
    "title": "Disaster Zone Search",
    "objective": "Scan rubble for 5 survivor heat signatures.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "drone_canyon",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6–8 numbered holo rings, tier forgiving, spacing 22–28m"
    },
    "layout": "canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped\nAltitude band: y 16–22\nOpen sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.",
    "dressing": "Tutorial: emergency HQ spawn. Low fly y=14–20. Green survivor markers ×3.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_emergency_first_aid_drop": {
    "id": "rescuedrone_emergency_first_aid_drop",
    "chassisId": "rescuedrone",
    "mode": 2,
    "title": "Emergency First Aid Drop",
    "objective": "Drop medkits on survivors in burning district.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "canyon_flight",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings + altitude bar between gates 2–5"
    },
    "layout": "canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped\nAltitude band: y 24–32\nAltitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.",
    "dressing": "Altitude lock over rubble — medkit drop zone on pad gate 3.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_flood_zone_evacuation_tag": {
    "id": "rescuedrone_flood_zone_evacuation_tag",
    "chassisId": "rescuedrone",
    "mode": 3,
    "title": "Flood Zone Evacuation Tag",
    "objective": "Tag evacuees on rooftops in flooded city.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "storm_cloud",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 3,
      "targetCount": 5,
      "tier": "standard",
      "stuntRing": false,
      "description": "3 rings then 5 ground bullseyes (mixed mode)"
    },
    "layout": "dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28\nAltitude band: y 28–38 dive to 8 on targets\n5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.",
    "dressing": "Storm over flooded city — blue water plane raised y=floorY+2.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_thermal_heat_signature_spotting": {
    "id": "rescuedrone_thermal_heat_signature_spotting",
    "chassisId": "rescuedrone",
    "mode": 4,
    "title": "Thermal Heat Signature Spotting",
    "objective": "Find hidden victims using thermal cam.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "cloud_race",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8–10 rings at crossing points"
    },
    "layout": "figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course\nAltitude band: y 20–30\nFigure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.",
    "dressing": "Figure-8 — orange thermal columns through rubble.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_avalanche_beacon_sweep": {
    "id": "rescuedrone_avalanche_beacon_sweep",
    "chassisId": "rescuedrone",
    "mode": 5,
    "title": "Avalanche Beacon Sweep",
    "objective": "Locate beacons under snow_rescue terrain.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "space_orbit",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 10,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "10 rings on spiral — increasing height"
    },
    "layout": "spiral_climb · 130m · climb +70 from y=8 · tightening radius\nAltitude band: y 8 → 78 climb\nLaunch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.",
    "dressing": "Spiral climb — yellow beacon poles on ruins.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_rope_lifeline_deploy": {
    "id": "rescuedrone_rope_lifeline_deploy",
    "chassisId": "rescuedrone",
    "mode": 6,
    "title": "Rope Lifeline Deploy",
    "objective": "Deploy rope to stranded bot on cliff edge.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "flight_rings",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "6 rings linking rooftops"
    },
    "layout": "rooftop_stops · 195m · 3 H-pad stops · y 26–34\nAltitude band: y 18–34 (Rescue Drone: 12–22)\n3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.",
    "dressing": "3 rooftop stops — rope line mesh to street below each.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_hurricane_wind_rescue": {
    "id": "rescuedrone_hurricane_wind_rescue",
    "chassisId": "rescuedrone",
    "mode": 7,
    "title": "Hurricane Wind Rescue",
    "objective": "Hover stable in typhoon corridor to rescue.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "jet_stunt",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 6,
      "targetCount": 0,
      "tier": "forgiving",
      "stuntRing": false,
      "description": "6 wide stunt rings, slight tilt 15°"
    },
    "layout": "coast_arc · 230m · y 18–28 · arcs over cliff edge\nAltitude band: y 18–28\nCoast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.",
    "dressing": "Coast recipe dressed as disaster — storm eye over city rubble.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_night_searchlight_recon": {
    "id": "rescuedrone_night_searchlight_recon",
    "chassisId": "rescuedrone",
    "mode": 8,
    "title": "Night Searchlight Recon",
    "objective": "Light and find targets in dark hospital zone.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "rooftop_delivery",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings inside tunnel segment"
    },
    "layout": "wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts\nAltitude band: y 22 locked\nPurple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.",
    "dressing": "Wind tunnel — sweeping searchlight cone on ruins.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_hazardous_gas_sampling": {
    "id": "rescuedrone_hazardous_gas_sampling",
    "chassisId": "rescuedrone",
    "mode": 9,
    "title": "Hazardous Gas Sampling",
    "objective": "Collect air samples without entering red zones.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "typhoon",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 7,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": true,
      "description": "7 rings + stunt ring (mixed)"
    },
    "layout": "storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24\nAltitude band: y 22–26\nStorm eye spline + rain + 1 tilted stunt ring at t=0.72",
    "dressing": "Storm eye — green gas cloud mesh (transparent) avoid center.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  },
  "rescuedrone_hero_rescue_medal": {
    "id": "rescuedrone_hero_rescue_medal",
    "chassisId": "rescuedrone",
    "mode": 10,
    "title": "Hero Rescue Medal",
    "objective": "Capstone multi-victim rescue mission.",
    "version": "2026-09-07-flying-90-v216",
    "recipeId": "warp_gate",
    "sky": {
      "top": "#fed7aa",
      "mid": "#fdba74",
      "horizon": "#ffedd5",
      "fog": "#ffedd5",
      "near": 90,
      "far": 280
    },
    "goldenHour": false,
    "bloom": 0.21,
    "parallaxClouds": false,
    "aerialVista": "bioluminescent_trench",
    "spawnKind": "emergency_hq",
    "gateColors": {
      "primary": 16347926,
      "secondary": 2278750,
      "final": 2278750
    },
    "gates": {
      "count": 8,
      "targetCount": 0,
      "tier": "standard",
      "stuntRing": false,
      "description": "8 rings (kid cap) spaced to t=0.90"
    },
    "layout": "capstone_sections · 280m · dive section t=0.65–0.8 · longest course\nAltitude band: y 8–34 multi-section\nCapstone: launch flare + storm segment + warp cathedral torus at end. Starfield.",
    "dressing": "Capstone: HQ + flood + beacon + warp. Orange/green gates only.",
    "bans": "Playful clouds, cloud whale, carrier, neon race\nDo NOT scatter citadel GLTF islands on any flyer except none."
  }
};
