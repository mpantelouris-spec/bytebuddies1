/**
 * Generates bytebuddies-flying-arena-prompts.md — 90 hyper-specific build prompts.
 * v2: per-mission spline, props, sky, code path, QA — not generic templates.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHASSIS_MODE_MAP, CHASSIS_GAME_MODE_BY_ID } from '../src/virtual-robot-designer/data/chassis-game-modes.js';
import { FLYER_VISUAL_BIBLES, FLYING_ARENA_SPEC_VERSION } from '../src/virtual-robot-designer/studio/aerial-world/FlyingArenaSpec.js';
import { getAerialRecipe } from '../src/virtual-robot-designer/studio/aerial-world/AerialCourseRecipes.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT_REPO = join(__dir, '../docs/bytebuddies-flying-arena-prompts.md');
const OUT_FULL = join(__dir, '../docs/bytebuddies-flying-arena-FULL-PROMPT.md');

const FLYERS = [
  'drone', 'helicopter', 'hoverbot', 'jetplane', 'steathjet', 'aerobat',
  'racedrone', 'hoverracer', 'rescuedrone',
];

function hex(n) {
  if (typeof n === 'string' && n.startsWith('#')) return n;
  return n ? `#${Number(n).toString(16).padStart(6, '0')}` : '—';
}

const SPLINE_SPECS = {
  canyon_slalom: (s) => `canyon_slalom · ${s.length || 185}m · ${s.count || 16} pts · y ${s.yMin || 14}–${s.yMax || 22} · lateral sine ×6 damped`,
  dive_targets: (s) => `dive_targets · ${s.length || 175}m · 5 dive arcs · start y=${s.start?.[1] || 38} pull-up before y=${s.end?.[1] || 28}`,
  figure8: (s) => `figure8 · ${s.length || 210}m · centerY ${s.centerY || 26} · amplitude ${s.amplitude || 12} · crossing at mid-course`,
  spiral_climb: (s) => `spiral_climb · ${s.length || 130}m · climb +${s.climb || 70} from y=${s.startY || 8} · tightening radius`,
  rooftop_stops: (s) => `rooftop_stops · ${s.length || 195}m · ${s.stops || 3} H-pad stops · y ${s.yRange?.[0] || 26}–${s.yRange?.[1] || 34}`,
  coast_arc: (s) => `coast_arc · ${s.length || 230}m · y ${s.yRange?.[0] || 18}–${s.yRange?.[1] || 28} · arcs over cliff edge`,
  wind_tunnel: (s) => `wind_tunnel · ${s.length || 175}m · locked y≈${s.y || 22} · narrow 10m corridor · 2 turbine masts`,
  storm_eye: (s) => `storm_eye · ${s.length || 155}m · wide outer ring then tight eye at t=0.65 · y≈${s.y || 24}`,
  capstone_sections: (s) => `capstone_sections · ${s.length || 280}m · dive section t=0.65–0.8 · longest course`,
  straight: (s) => `straight · ${s.length || 180}m · high-speed dash with gentle wave`,
};

const RECIPE_DRESSING = {
  drone_canyon: {
    midground: 'Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.',
    gates: '6–8 numbered holo rings, tier forgiving, spacing 22–28m',
    altitude: 'y 16–22',
  },
  canyon_flight: {
    midground: 'Altitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.',
    gates: '6 rings + altitude bar between gates 2–5',
    altitude: 'y 24–32',
  },
  storm_cloud: {
    midground: '5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.',
    gates: '3 rings then 5 ground bullseyes (mixed mode)',
    altitude: 'y 28–38 dive to 8 on targets',
  },
  cloud_race: {
    midground: 'Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.',
    gates: '8–10 rings at crossing points',
    altitude: 'y 20–30',
  },
  space_orbit: {
    midground: 'Launch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.',
    gates: '10 rings on spiral — increasing height',
    altitude: 'y 8 → 78 climb',
  },
  flight_rings: {
    midground: '3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.',
    gates: '6 rings linking rooftops',
    altitude: 'y 18–34 (Rescue Drone: 12–22)',
  },
  jet_stunt: {
    midground: 'Coast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.',
    gates: '6 wide stunt rings, slight tilt 15°',
    altitude: 'y 18–28',
  },
  rooftop_delivery: {
    midground: 'Purple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.',
    gates: '8 rings inside tunnel segment',
    altitude: 'y 22 locked',
  },
  typhoon: {
    midground: 'Storm eye spline + rain + 1 tilted stunt ring at t=0.72',
    gates: '7 rings + stunt ring (mixed)',
    altitude: 'y 22–26',
  },
  warp_gate: {
    midground: 'Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.',
    gates: '8 rings (kid cap) spaced to t=0.90',
    altitude: 'y 8–34 multi-section',
  },
  rainbow_road: {
    midground: 'Neon race ribbon 6m wide under path — pink #ec4899 / cyan #06b6d4 / violet #a855f7. 0–1 boost pad.',
    gates: '8 tight FPV rings',
    altitude: 'y 22–26',
  },
  sunny_circuit: {
    midground: 'Figure-8 plasma lane (Hover Racer) or ribbon (if race) — drift corners banked 12°.',
    gates: '10–12 rings on curves',
    altitude: 'y 22–28',
  },
  dragon_skyway: {
    midground: 'Dragon-spine canyon slalom 240m + purple warp tunnel segment mid-course.',
    gates: '12–16 rings, hard tier',
    altitude: 'y 20–30',
  },
  volcano_drift: {
    midground: 'Volcano cone + lava glow off-path right. Storm_eye spline with drift corners.',
    gates: '7 rings + stunt ring',
    altitude: 'y 20–26',
  },
  street_grand_prix: {
    midground: 'Low rooftop skim y 18–23. 4 building blocks + orange roof pads. Grey ribbon segments.',
    gates: '6 rings between rooftops',
    altitude: 'y 12–23',
  },
};

const VISTA_LAYER = {
  cloud_sea: `FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island`,
  ocean_platforms: `FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz`,
  floating_labs: `FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water`,
  carrier_deck: `FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes`,
  radar_dome: `FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset`,
  coastline: `FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts`,
  neon_ribbon: `FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only`,
  plasma_track: `FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry`,
  disaster_city: `FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY`,
};

const SPAWN_KIND = {
  sky_academy_arch: 'placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral',
  offshore_platform: 'buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad',
  repulsor_gate: 'buildRepulsorGate — violet torus r=3.2, emissive pulse',
  spawn_sky_island: 'buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags',
  hangar_mouth: 'buildHangarMouth — dark jambs, red single runway light',
  airshow_banner: 'buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m',
  neon_gantry: 'buildNeonGantry — pink/cyan posts, countdown lights red/green',
  warp_gate_arch: 'buildWarpGateArch — purple half-torus portal',
  emergency_hq: 'buildEmergencyHq — rooftop slab, green medkit, orange beacon pole',
};

/** Mission-specific visual brief — keyed by mission id */
const MISSION_BRIEF = {
  drone_aerial_ring_slalom: 'Tutorial: widest ring spacing (28m). First ring 8m ahead. Cloud arch frames gate 1.',
  drone_hover_altitude_lock: 'HUD altitude bar green between y=24–30. Rings only count inside band.',
  drone_aerial_target_dive: 'After ring 3, dive to 5 bullseyes on cloud sea floor — pull up before y=10.',
  drone_quadcopter_swarm_patrol: 'Figure-8 crossing: 3 translucent drone silhouettes orbit gate 4 (decorative, no collision).',
  drone_vertical_ascent_sprint: 'Launch tower flame at start. Rings climb with spiral — celebrate at top ring.',
  drone_package_drop_precision: 'Ring 4 over rooftop — drop zone green square on pad below.',
  drone_aerial_photography_sweep: '3 photo columns (A/B/C) translucent blue — fly through for shutter flash.',
  drone_wind_tunnel_navigation: 'Teal wind tunnel tube — stay inside 10m corridor. Turbine blades spin.',
  drone_propeller_flip_stunt: 'Storm eye + ONE tilted stunt ring (45° roll cue) at t=0.72.',
  drone_sky_ace_master: 'Capstone: cloud arch + storm wall segment + warp ring finish. 8 rings max.',

  helicopter_heavy_cargo_airlift: 'Suspended orange crate mesh 3m below heli hook at start. Slow spline.',
  helicopter_offshore_oil_rig_landing: 'Must touch down on rig #2 yellow H pad between gates 3–4.',
  helicopter_water_bucket_fire_suppression: 'Storm recipe but vista stays OCEAN. Red fire glow on rig #1 — drop bucket cue.',
  helicopter_mountain_top_insertion: 'Figure-8 over ocean — snow-cap white peak prop on rig #3 (not grass mountain).',
  helicopter_rotor_pitch_control: 'Spiral climb over ocean — rotor wash particle streaks at each gate.',
  helicopter_construction_girder_placement: '3 rooftop stops with grey steel girder props on pads.',
  helicopter_long_haul_fuel_flight: 'Coast arc over ocean — tanker ship silhouette below at t=0.5.',
  helicopter_emergency_medevac_transport: 'Hospital red cross on middle rooftop. Green survivor marker.',
  helicopter_vehicle_recovery_winch: 'Storm eye over churning ocean — winch cable line to vehicle block below.',
  helicopter_sky_crane_master: 'Capstone: 4 rigs + medevac pad + warp finish. Cargo crate through final ring.',

  hoverbot_anti_gravity_glide: 'Tutorial: repulsor gate pulse. Smooth canyon — pads visible at y=floorY+8.',
  hoverbot_repulsor_field_push: 'Altitude lock between violet hex gates. Plasma bridge visible to next pad.',
  hoverbot_magnet_rail_hover: 'Storm walls tinted purple. Magnet rail glowing strip under gates 2–4.',
  hoverbot_zero_g_physics_room: 'Figure-8 in zero-G — slow rotation on lab pads at corners.',
  hoverbot_hover_height_calibration: 'Spiral climb between lab pads — height tick marks on repulsor gate.',
  hoverbot_smooth_banked_glide: 'Rooftop stops replaced by floating lab pads with teal bridges.',
  hoverbot_energy_shield_bounce: 'Coast arc with translucent shield dome at gate 3 (bounce cue).',
  hoverbot_plasma_thruster_boost: 'Warp tunnel cyan/purple — 1 boost pad at tunnel midpoint.',
  hoverbot_chasm_crossing_glide: 'Storm eye between two lab pads — chasm void below (black plane).',
  hoverbot_anti_gravity_master: 'Capstone: repulsor + spiral + tunnel + warp arch. Violet/teal only.',

  jetplane_supersonic_dogfight: 'REFERENCE MISSION. buildSpawnSkyIsland + carrier vista + 6–8 holo rings. FOV 48 bloom 0.24.',
  jetplane_precision_air_strike: 'Altitude lock canyon over carrier. 1 target bullseye on deck after ring 4.',
  jetplane_aircraft_carrier_touch_and_go: 'Storm dive — touch deck line at z=cz-98 between gates 3–4 then pull up.',
  jetplane_mach_2_speed_trap: 'Figure-8 high speed — speed lines particle burst at gate 6.',
  jetplane_radar_evasion_stealth_flight: 'Spiral climb — keep below radar cone (green sweep mesh on carrier).',
  jetplane_missile_jammer_countermeasures: '3 rooftop stops over carrier vista — jammer dish on pad 2.',
  jetplane_mid_air_tanker_refuel: 'Coast arc — tanker plane silhouette parallel at t=0.45 (refuel probe cue).',
  jetplane_canyon_run_precision: 'Wind tunnel between carrier towers — tight 10m corridor.',
  jetplane_escort_transport_jet: 'Storm eye escort — transport silhouette ahead through eye.',
  jetplane_top_gun_ace_fighter: 'Capstone: island spawn + carrier + storm + warp cathedral. Gold flags.',

  steathjet_radar_dome_infiltration: 'Tutorial: hangar spawn, stars, green stealth rings dim emissive 0.4.',
  steathjet_night_bombing_raid: 'Altitude canyon — avoid lit windows on distant building silhouettes.',
  steathjet_thermal_signature_suppression: 'Storm dive — stay in cold blue corridor between walls.',
  steathjet_shadow_formation_flight: 'Figure-8 — 2 ghost jet silhouettes offset 20m (decorative).',
  steathjet_electronic_warfare_jamming: 'Spiral — jamming static particles at gates 4–6.',
  steathjet_high_altitude_recon_photo: 'Rooftop photo columns over dark city grid below radar dome.',
  steathjet_silent_glide_approach: 'Coast arc silent — minimal emissive, glide slope 3°.',
  steathjet_precision_missile_sniping: 'Wind tunnel — single red target at end inside tunnel.',
  steathjet_emp_bomb_drop: 'Storm eye — EMP pulse ring flash at t=0.72.',
  steathjet_ghost_jet_master: 'Capstone: hangar + radar + storm + warp. All emissive ≤0.5.',

  aerobat_smoke_trail_loop_de_loop: 'Tutorial: airshow banner + coast vista. Wide ring at loop apex t=0.35.',
  aerobat_barrel_roll_speed_slalom: 'Altitude canyon — rings tilted 30° alternating.',
  aerobat_knife_edge_flying: 'Storm dive along cliff edge — knife-edge ring roll cue.',
  aerobat_air_show_formation_dance: 'Figure-8 with 3 smoke torus rings (white, opacity 0.35).',
  aerobat_touch_and_go_ribbon_snip: 'Spiral — orange ribbon banner gate to snip at t=0.5.',
  aerobat_inverted_flying_sprint: 'Rooftop stops over coast — inverted rings upside-down torus.',
  aerobat_hammerhead_turn_stunt: 'Coast arc hammerhead — lighthouse at t=0.35, vertical climb ring.',
  aerobat_pyrotechnic_night_flight: 'Wind tunnel with firework particle bursts at gates 2/5/8.',
  aerobat_pylon_slalom_time_attack: 'Storm eye slalom — red-white pylons between rings.',
  aerobat_red_bull_air_race_champion: 'Capstone: banner + lighthouse + smoke rings + warp finish.',

  racedrone_fpv_drone_racing_circuit: 'Tutorial: neon gantry + rainbow ribbon 6m. 8 tight rings. NO grass.',
  racedrone_tunnel_turbo_dash: 'Warp tunnel purple/pink entire course. 0 boost pads mode 2.',
  racedrone_gate_proximity_drift: 'Sunny figure-8 — drift smoke puffs at apex corners.',
  racedrone_speed_trap_sky_burst: 'Cloud race figure-8 but vista stays NEON RIBBON not clouds.',
  racedrone_high_speed_slalom: 'Dragon spine 240m + tunnel mid — ribbon orange/violet.',
  racedrone_battery_drain_time_attack: 'Rooftop skim — battery HUD drains; recharge pad cyan at gate 4.',
  racedrone_acrobatic_barrel_roll: 'Volcano drift storm eye — stunt ring tilted 60°.',
  racedrone_ghost_drone_race: 'Storm walls + translucent ghost drone 0.3 opacity ahead on spline.',
  racedrone_low_altitude_lawn_mower: 'Street grand prix y 12–18 — rings almost touch rooftops.',
  racedrone_grand_sky_prix_champion: 'Capstone: gantry + ribbon + tunnel + warp. Pink/cyan only.',

  hoverracer_quantum_speedway_grand_prix: 'Tutorial: warp gate arch + plasma lanes (NOT neon ribbon). Violet sky.',
  hoverracer_mach_1_speed_test: 'Canyon slalom speed test — plasma underlay on straightaways.',
  hoverracer_plasma_drift_cornering: 'Figure-8 sunny circuit — cyan recharge pads at apex.',
  hoverracer_energy_pad_recharge: 'Cloud figure-8 — 3 pulsing recharge pads at corners.',
  hoverracer_sonic_boom_slalom: 'Dragon spine — sonic boom ring shockwave mesh at gate 8.',
  hoverracer_elimination_hover_sprint: 'Rooftop sprint — elimination gate closes (red) if slow.',
  hoverracer_warp_tunnel_burst: 'Volcano + purple tunnel burst at t=0.5.',
  hoverracer_mag_strip_inversion: 'Storm walls — mag strip teal line flips hover 180° at gate 5.',
  hoverracer_turbo_slipstream_chase: 'Street skim chase — lead racer silhouette purple.',
  hoverracer_galactic_turbo_champion: 'Capstone: warp arch + plasma lanes + volcano + cathedral.',

  rescuedrone_disaster_zone_search: 'Tutorial: emergency HQ spawn. Low fly y=14–20. Green survivor markers ×3.',
  rescuedrone_emergency_first_aid_drop: 'Altitude lock over rubble — medkit drop zone on pad gate 3.',
  rescuedrone_flood_zone_evacuation_tag: 'Storm over flooded city — blue water plane raised y=floorY+2.',
  rescuedrone_thermal_heat_signature_spotting: 'Figure-8 — orange thermal columns through rubble.',
  rescuedrone_avalanche_beacon_sweep: 'Spiral climb — yellow beacon poles on ruins.',
  rescuedrone_rope_lifeline_deploy: '3 rooftop stops — rope line mesh to street below each.',
  rescuedrone_hurricane_wind_rescue: 'Coast recipe dressed as disaster — storm eye over city rubble.',
  rescuedrone_night_searchlight_recon: 'Wind tunnel — sweeping searchlight cone on ruins.',
  rescuedrone_hazardous_gas_sampling: 'Storm eye — green gas cloud mesh (transparent) avoid center.',
  rescuedrone_hero_rescue_medal: 'Capstone: HQ + flood + beacon + warp. Orange/green gates only.',
};

function gateSpec(bible, recipe, modeIndex) {
  const p = hex(bible.gateColors.primary);
  const s = hex(bible.gateColors.secondary);
  const f = hex(bible.gateColors.final);
  const count = modeIndex === 10 ? '8' : '6–8';
  const dress = RECIPE_DRESSING[recipe.id] || RECIPE_DRESSING.drone_canyon;
  return `${count} rings · primary ${p} · secondary ${s} · final ${f} · ${dress.gates}`;
}

function buildPrompt(chassisId, missionId, modeIndex) {
  const spec = CHASSIS_GAME_MODE_BY_ID[missionId] || {};
  const bible = FLYER_VISUAL_BIBLES[chassisId];
  const recipe = getAerialRecipe(spec.arenaType || 'drone_canyon');
  const dress = RECIPE_DRESSING[recipe.id] || RECIPE_DRESSING.drone_canyon;
  const spline = recipe.spline || {};
  const splineKind = spline.kind || 'canyon_slalom';
  const splineLine = (SPLINE_SPECS[splineKind] || SPLINE_SPECS.canyon_slalom)(spline);
  const vista = bible.aerialVista;
  const spawnKey = bible.spawnKind === 'spawn_sky_island' ? 'spawn_sky_island' : bible.spawnKind;
  const useIsland = chassisId === 'jetplane' && (bible.spawnSkyIslandModes || []).includes(modeIndex);
  const brief = MISSION_BRIEF[missionId] || `${spec.name}: apply ${recipe.label} course dressing under ${vista} vista.`;
  const prevMode = modeIndex > 1 ? CHASSIS_MODE_MAP[chassisId][modeIndex - 2] : null;
  const prevRecipe = prevMode ? getAerialRecipe(CHASSIS_GAME_MODE_BY_ID[prevMode]?.arenaType) : null;

  return `Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    ${missionId}
ROBOT:         ${chassisId} · Mode ${modeIndex}/10 · ${spec.difficulty || '—'}
DISPLAY NAME:  ${spec.name}
OBJECTIVE:     ${spec.desc || spec.tagline || '—'}
ARENA RECIPE:  ${spec.arenaType} (${recipe.label})
SPEC VERSION:  ${FLYING_ARENA_SPEC_VERSION}
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     ${bible.sky.top}
mid:     ${bible.sky.mid}
horizon: ${bible.sky.horizon}
fog:     ${bible.sky.fog}
near/far: ${bible.sky.near}/${bible.sky.far}
goldenHour: ${bible.goldenHour ? 'YES' : 'NO'}
bloom: ${bible.bloom}
parallaxClouds: ${bible.parallaxClouds ? 'YES (Drone only)' : 'NO'}

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: '${vista}'
${VISTA_LAYER[vista] || VISTA_LAYER.cloud_sea}

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: ${useIsland ? 'spawn_sky_island' : spawnKey}
${useIsland ? SPAWN_KIND.spawn_sky_island : (SPAWN_KIND[spawnKey] || spawnKey)}

━━━ 4. SPLINE / LAYOUT (recipe ${recipe.id}) ━━━
${splineLine}
Altitude band: ${dress.altitude}
${dress.midground}

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
${gateSpec(bible, recipe, modeIndex)}

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
${brief}

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
${prevRecipe ? `Mode ${modeIndex - 1} used ${prevRecipe.id} (${prevRecipe.label}). This mode uses ${recipe.id} — spline shape, midground, and gate count MUST change.` : 'First mode — establish chassis identity clearly.'}

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis ${chassisId}
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
${chassisId === 'jetplane' ? '  → installAerialReferenceVista()  // all jet modes' : ''}

━━━ 9. BANNED (instant fail QA) ━━━
${chassisId === 'drone' ? 'Oil rigs, carrier deck, neon ribbon, mechanical huts on route' : ''}
${chassisId === 'helicopter' ? 'Grass islands, cloud castle, carrier deck, neon ribbon' : ''}
${chassisId === 'hoverbot' ? 'Ocean, grass, cloud whale, farm terrain' : ''}
${chassisId === 'jetplane' ? 'Oil rig, purple lab pads, neon FPV ribbon' : ''}
${chassisId === 'steathjet' ? 'Peach sunset, bright golden hour, cloud playground' : ''}
${chassisId === 'aerobat' ? 'Neon FPV ribbon, radar dome, oil platform' : ''}
${chassisId === 'racedrone' ? 'Grass islands, cloud castle, lighthouse, carrier' : ''}
${chassisId === 'hoverracer' ? 'Pink neon ribbon (Racing Drone asset), grass islands' : ''}
${chassisId === 'rescuedrone' ? 'Playful clouds, cloud whale, carrier, neon race' : ''}
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (${vista})
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode ${modeIndex > 1 ? modeIndex - 1 : 'N/A'} of same robot`;
}

function missionBlock(chassisId, missionId, modeIndex) {
  const spec = CHASSIS_GAME_MODE_BY_ID[missionId] || {};
  const bible = FLYER_VISUAL_BIBLES[chassisId];
  const recipe = getAerialRecipe(spec.arenaType || 'drone_canyon');
  const cap = modeIndex === 10 ? ' 🏆 CAPSTONE' : '';

  return `
## Mode ${modeIndex}${cap} — ${spec.name}

| | |
|---|---|
| **ID** | \`${missionId}\` |
| **Recipe** | \`${spec.arenaType}\` → ${recipe.label} |
| **Difficulty** | ${spec.difficulty || '—'} |
| **Vista** | \`${bible.aerialVista}\` |
| **Spline** | \`${recipe.spline?.kind || '—'}\` · ${recipe.spline?.length || '—'}m |

\`\`\`
${buildPrompt(chassisId, missionId, modeIndex)}
\`\`\`

---
`;
}

function robotChapter(chassisId) {
  const bible = FLYER_VISUAL_BIBLES[chassisId];
  const missions = CHASSIS_MODE_MAP[chassisId] || [];
  const names = { drone: 'Drone', helicopter: 'Helicopter', hoverbot: 'Hover Bot', jetplane: 'Jet Plane', steathjet: 'Stealth Jet', aerobat: 'Aero Stunt', racedrone: 'Racing Drone', hoverracer: 'Hover Racer', rescuedrone: 'Rescue Drone' };

  return `
# ${names[chassisId] || chassisId}

**Identity:** ${bible.label}
**Vista code:** \`${bible.aerialVista}\`
**Gate primary:** ${hex(bible.gateColors.primary)} · **secondary:** ${hex(bible.gateColors.secondary)}

${missions.map((mid, i) => missionBlock(chassisId, mid, i + 1)).join('')}
`;
}

const GATE_SHAPES = {
  drone: 'round holo torus (default)',
  helicopter: 'square arch frame — yellow/blue industrial',
  hoverbot: 'hexagonal repulsor ring — violet/cyan',
  jetplane: 'premium holo torus — blue/red military',
  steathjet: 'wireframe thin ring — green HUD ghost',
  aerobat: 'wide stunt ring — orange tilt-capable',
  racedrone: 'tight FPV square gate — pink/cyan neon',
  hoverracer: 'tight FPV plasma gate — violet/cyan',
  rescuedrone: 'wide rescue arch — orange/green',
};

function robotBibleBlock(chassisId) {
  const bible = FLYER_VISUAL_BIBLES[chassisId];
  const names = { drone: 'Drone', helicopter: 'Helicopter', hoverbot: 'Hover Bot', jetplane: 'Jet Plane', steathjet: 'Stealth Jet', aerobat: 'Aero Stunt', racedrone: 'Racing Drone', hoverracer: 'Hover Racer', rescuedrone: 'Rescue Drone' };
  const vista = bible.aerialVista;
  const spawnKey = bible.spawnKind;
  return `
### ${names[chassisId]} (\`${chassisId}\`)

| Field | Value |
|-------|-------|
| Identity | ${bible.label} |
| aerialVista | \`${vista}\` |
| Sky top/mid/horizon | ${bible.sky.top} / ${bible.sky.mid} / ${bible.sky.horizon} |
| Fog | ${bible.sky.fog} · near/far ${bible.sky.near}/${bible.sky.far} |
| goldenHour | ${bible.goldenHour ? 'YES' : 'NO'} |
| bloom | ${bible.bloom} |
| spawnKind | \`${spawnKey}\` |
| Gate primary/secondary/final | ${hex(bible.gateColors.primary)} / ${hex(bible.gateColors.secondary)} / ${hex(bible.gateColors.final)} |
| Gate geometry | ${GATE_SHAPES[chassisId]} |
| Mode recipes (1–10) | ${bible.modeRecipes.join(', ')} |

**Vista layer:**
${VISTA_LAYER[vista] || vista}

**Spawn landmark:**
${SPAWN_KIND[spawnKey] || spawnKey}
`;
}

function buildFullMaster() {
  const robotBibles = FLYERS.map(c => robotBibleBlock(c)).join('\n');
  return `# BYTEBUDDIES — FLYING ARENA FULL MASTER PROMPT
## Complete agent instructions · 9 flyers × 10 missions = 90 arenas · ${FLYING_ARENA_SPEC_VERSION}

> **How to use:** Copy this entire file into your coding agent, OR paste one mission block from Part II.
> Regenerate anytime: \`node scripts/generate-flying-arena-prompts.mjs\`
> Verify: \`node scripts/verify-flying-arena-identity.mjs\`

---

# PART I — MASTER BUILD & FIX INSTRUCTIONS

## 1. Problem statement

ByteBuddies has **9 flying robots × 10 missions = 90 aerial arenas**. They currently look like the **same ring-slalom course with a colour filter**. The user must be able to open any two flyers at mode 1 and identify them in **under 3 seconds** from silhouette, vista, and sky — not gate colour alone.

**Quality reference:** Jet Plane mode 1 (\`jetplane_supersonic_dogfight\`) — grass spawn sky-island with mechanical huts, golden-hour sky, carrier deck vista below, premium numbered holo rings.

---

## 2. Success criteria (non-negotiable)

1. **9 unique aerialVista values** — one per flyer, never shared.
2. **9 unique sky palettes** — chassis bible locks top/mid/horizon/fog; recipe sky is ignored.
3. **9 unique gate geometries** — not just hex colour swaps (see gate table below).
4. **90 missions feel different** — spline shape + mode dressing + mission props change per mode.
5. **No shared golden-hour citadel islands** on non-Jet flyers.
6. **Set pieces visible at runtime** — large props beside flight path, not tiny props at floorY=-42.
7. **Hard refresh QA** — Helicopter m1 vs Jet m1, Stealth m1 vs Drone m1, Racing Drone m1 vs Hover Racer m1, Rescue m1 vs Drone m1 must be unmistakable.

---

## 3. Root causes (what was broken)

| Issue | Fix |
|-------|-----|
| \`installFlyingVistaLayer\` not wired | Call from \`installFlyingArenaIdentity\` in \`FlyingArenaKit.js\` |
| \`PremiumKidArenaKit\` applied golden sky + citadel islands to all flyers | When \`flyingActive\`, bible sky only — no citadel scatter |
| Recipe defaults (\`drone_canyon\`, golden hour) overrode chassis | \`applyFlyingRecipeContract\` strips recipe sky/islands |
| Vista props too small/far below camera | \`installFlyingChassisSetPiece\` — large beside-path geometry |
| All robots used same holo ring torus | \`AerialRingGateKit.buildGateForChassis(chassisId)\` |
| Drone mode 1 incorrectly used Jet spawn island | Only Jet has \`spawnSkyIslandModes: [1..10]\` |
| Layers not cleared on mission switch | \`clearFlyingArenaLayers(scene)\` at \`buildAerialWorld\` start |

---

## 4. Code architecture (files you must touch)

| File | Role |
|------|------|
| \`src/.../aerial-world/AerialWorldKit.js\` | Orchestrator: \`buildAerialWorld\`, \`clearFlyingArenaLayers\`, contract resolution |
| \`src/.../aerial-world/FlyingArenaKit.js\` | \`installFlyingSpawnLandmark\`, \`installFlyingVistaLayer\`, \`installFlyingModeScenery\`, \`applyFlyingRecipeContract\`, \`installFlyingArenaIdentity\` |
| \`src/.../aerial-world/FlyingChassisSetPiece.js\` | Large per-chassis set pieces beside spline; \`applyFlyingModeSplineVariation\` |
| \`src/.../aerial-world/FlyingArenaSpec.js\` | \`FLYER_VISUAL_BIBLES\`, \`getFlyingArenaContract\`, \`resolveFlyingChassisId\` |
| \`src/.../aerial-world/FlyingMissionSpecs.js\` | Generated 90 mission specs (sky, vista, recipeId, dressing) |
| \`src/.../aerial-world/FlyingMissionDressing.js\` | Per-mode decorative props via \`FLYING_MISSION_FEATURES\` |
| \`src/.../aerial-world/AerialRingGateKit.js\` | \`buildGateForChassis()\` — per-chassis gate mesh |
| \`src/.../aerial-world/PremiumKidArenaKit.js\` | When flying: bible sky only |
| \`scripts/verify-flying-arena-identity.mjs\` | CI check: 9 vistas, 9 sky tops, 90 missions |

**LiveLab routing:** \`buildSmartArena\` → \`_aerialArena\` → \`buildFlightRingsArena\` → \`buildAerialWorld\`

---

## 5. Build call order (exact)

\`\`\`
buildAerialWorld(scene, challenge, robotConfig)
  → clearFlyingArenaLayers(scene)
  → contract = getFlyingArenaContract(challenge, robotConfig)
  → applyFlyingRecipeContract(recipe, contract)     // spline + mode scenery only
  → installPremiumAerialScenery(scene, contract)    // bible sky ONLY
  → installFlyingChassisSetPiece(scene, contract)   // large identity prop
  → installFlyingArenaIdentity(scene, contract)
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()                   // floor vista (carrier, ocean, etc.)
      → installFlyingModeScenery()                  // storm walls, tunnel, launch tower
      → installFlyingMissionDressing()              // mission-id-specific props
  → placeAerialGates(scene, curve, recipe, chassisId)
  → installAerialReferenceVista()                 // Jet Plane ONLY
\`\`\`

\`finalizeMissionArenaVisuals\` must **return early** when \`scene.userData.aerialWorldBuilt\` or \`skipMissionWorld\`.

---

## 6. Robot → vista → sky (locked map)

| Robot | chassisId | aerialVista | Sky top | spawnKind |
|-------|-----------|-------------|---------|-----------|
| Drone | drone | cloud_sea | #e87830 | sky_academy_arch |
| Helicopter | helicopter | ocean_platforms | #38bdf8 | offshore_platform |
| Hover Bot | hoverbot | floating_labs | #e0e7ff | repulsor_gate |
| Jet Plane | jetplane | carrier_deck | #3478b8 | spawn_sky_island |
| Stealth Jet | steathjet | radar_dome | #0f172a | hangar_mouth |
| Aero Stunt | aerobat | coastline | #4a90d9 | airshow_banner |
| Racing Drone | racedrone | neon_ribbon | #120428 | neon_gantry |
| Hover Racer | hoverracer | plasma_track | #4c1d95 | warp_gate_arch |
| Rescue Drone | rescuedrone | disaster_city | #fed7aa | emergency_hq |

---

## 7. Gate geometry per chassis

| chassisId | Gate shape |
|-----------|------------|
| drone | round holo torus (default) |
| helicopter | square arch frame |
| hoverbot | hexagonal repulsor ring |
| jetplane | premium holo torus (military) |
| steathjet | wireframe thin HUD ring |
| aerobat | wide stunt ring (tilt-capable) |
| racedrone | tight FPV square neon gate |
| hoverracer | tight FPV plasma gate |
| rescuedrone | wide rescue arch |

Implement in \`AerialRingGateKit.buildGateForChassis(chassisId)\`.

---

## 8. Full visual bibles (all 9 flyers)

${robotBibles}

---

## 9. Universal rules

1. **Shape not colour** — unique vista geometry per chassis; never reuse another flyer's vista layer.
2. **Prop budget** — spawn landmark + vista layer + chassis set piece + mode scenery + mission dressing + gates. No random citadel GLTF island scatter.
3. **Recipe ≠ sky** — \`applyFlyingRecipeContract\` locks bible sky; recipe only drives spline + midground props.
4. **Jet is the quality bar** — grass island spawn, mechanical huts, carrier below, golden sky, premium rings.
5. **Mode progression** — modes 1–10 on same robot must change spline kind and/or dressing visibly.
6. **Rescue Drone flies low** — y 12–22 only; disaster rubble vista.
7. **Racing Drone vs Hover Racer** — neon ribbon (pink/cyan) vs plasma lanes (violet/cyan); never swap assets.

---

## 10. Banned assets matrix (instant QA fail)

| Flyer | NEVER show |
|-------|------------|
| Drone | oil rigs, carrier deck, neon ribbon, mechanical huts on route (except cloud arch) |
| Helicopter | grass islands, cloud castle, carrier deck, neon ribbon |
| Hover Bot | ocean, grass, cloud whale, farm terrain |
| Jet Plane | oil rig, purple lab pads, neon FPV ribbon |
| Stealth Jet | peach sunset, bright golden hour, cloud playground |
| Aero Stunt | neon FPV ribbon, radar dome, oil platform |
| Racing Drone | grass islands, cloud castle, lighthouse, carrier |
| Hover Racer | pink neon ribbon (Racing Drone asset), grass islands |
| Rescue Drone | playful clouds, cloud whale, carrier, neon race |

Do **NOT** scatter citadel GLTF islands on any flyer.

---

## 11. Screenshot QA checklist (every mission)

- [ ] Sky fills 65–75% of frame with chassis palette
- [ ] Vista layer identifiable in 3 seconds
- [ ] Spawn landmark visible at start
- [ ] Chassis set piece visible beside path (not microscopic)
- [ ] Robot ≈28% screen height
- [ ] Gates readable — numbered sprites, correct geometry for chassis
- [ ] Different from other 8 flyers at same mode index
- [ ] Different from previous mode of same robot (spline or dressing changed)

**Pair tests:** Helicopter m1 vs Jet m1 · Stealth m1 vs Drone m1 · Racing Drone m1 vs Hover Racer m1 · Rescue m1 vs Drone m1

---

## 12. Verification

\`\`\`bash
node scripts/verify-flying-arena-identity.mjs
# Expected: PASS flying arena identity ${FLYING_ARENA_SPEC_VERSION}
\`\`\`

---

# PART II — ALL 90 MISSION BUILD SPECS

Each block below is a **complete per-mission build order** — paste one block for a single mission fix.

`;
}

const MASTER = `# BYTEBUDDIES — FLYING ARENA PROMPTS v2
## 90 hyper-specific build specs · ${FLYING_ARENA_SPEC_VERSION}

Each block below is a **complete build order** — spline, sky hex, vista props, spawn, gates, code path, QA.
Paste **one block** into your agent. Sky and vista are **chassis-locked**; spline/midground follow the **arena recipe**.

---

## Universal rules

1. **Shape not colour** — 9 unique \`aerialVista\` values; never reuse another flyer's vista layer.
2. **Prop budget** — spawn + vista + mode dressing + gates. No citadel island scatter for flyers.
3. **Recipe ≠ sky** — \`applyFlyingRecipeContract\` locks bible sky; recipe only drives spline + mode scenery.
4. **Reference** — Jet Plane mode 1 (\`jetplane_supersonic_dogfight\`) is quality bar.

## Robot → vista map

| Robot | Vista | Sky top |
|-------|-------|---------|
| Drone | cloud_sea | #e87830 |
| Helicopter | ocean_platforms | #38bdf8 |
| Hover Bot | floating_labs | #e0e7ff |
| Jet Plane | carrier_deck | #3478b8 |
| Stealth Jet | radar_dome | #0f172a |
| Aero Stunt | coastline | #4a90d9 |
| Racing Drone | neon_ribbon | #120428 |
| Hover Racer | plasma_track | #4c1d95 |
| Rescue Drone | disaster_city | #fed7aa |

---

# ALL 90 MISSIONS

`;

let doc = MASTER;
for (const c of FLYERS) doc += robotChapter(c);
doc += `\n*Generated ${FLYERS.length * 10} mission specs · ${new Date().toISOString().slice(0, 10)}*\n`;

let fullDoc = buildFullMaster();
for (const c of FLYERS) fullDoc += robotChapter(c);
fullDoc += `\n*Generated ${FLYERS.length * 10} mission specs · ${new Date().toISOString().slice(0, 10)} · FULL PROMPT*\n`;

writeFileSync(OUT_REPO, doc, 'utf8');
writeFileSync(OUT_FULL, fullDoc, 'utf8');
console.log(`Wrote ${OUT_REPO} (${doc.length} chars)`);
console.log(`Wrote ${OUT_FULL} (${fullDoc.length} chars, ${FLYERS.length * 10} missions)`);
