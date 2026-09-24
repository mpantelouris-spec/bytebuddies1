# Phase 1 Slice — Emergency Environment Family

Short build brief for the **first vertical slice**: 3 robots × 10 missions = **30 missions**.

## Why emergency first?

- Shared mood (urgency, rescue, hospitals, fires)
- Existing arena hooks: `firebot_blaze`, `hospital_walk`, `snow_rescue` in `LiveLabPage.jsx`
- `AdventureArenaBuilder` already maps fire/city props via `buildVolcanoIsland` / `buildCityNeonRush`
- Three distinct robot meshes + physics already working (ground rescue + aerial rescue drone)

## Robots in this slice

| Chassis | Modes | Physics | Camera |
|---------|-------|---------|--------|
| firebot | 10 | `ground` | `chase_close` |
| medbot | 10 | `ground` | `chase_close` |
| rescuedrone | 10 | `flight_3dof` | `aerial_chase` |

## Arena pool (rotate across modes)

`firebot_blaze`, `hospital_walk`, `snow_rescue`, `lava_canyon`, `cyber_city`, `night_patrol` (aerial night search for rescue drone)

**Never use:** any `KART_RACE_ARENA_TYPES` or `linkedRaceCourse`.

## Mode checklist (firebot)

| # | Mode ID | Arena | Kid objective |
|---|---------|-------|---------------|
| 1 | firebot_water_cannon_blaze_extinguish | firebot_blaze | Extinguish 3 fire zones |
| 2 | firebot_smoke_rescue_dash | firebot_blaze smoke | Rescue through smoke corridor |
| 3 | firebot_fire_hydrant_hookup | urban_obstacle | Reach hydrant, hold 3s |
| 4 | firebot_chemical_fire_suppression | factory_floor | Suppress chemical fire pads |
| 5 | firebot_burning_tower_ladder_climb | colosseum tower | Climb ladder route |
| 6 | firebot_wildfire_perimeter_trench | desert_rally | Patrol perimeter checkpoints |
| 7 | firebot_gas_explosion_response | cyber_city | Reach gas leak, evacuate zone |
| 8 | firebot_emergency_siren_rush | urban_obstacle | Time trial to scene |
| 9 | firebot_flashover_prevention | firebot_blaze interior | Prevent flashover (cool zones) |
| 10 | firebot_chief_fire_officer_medal | firebot_blaze capstone | Multi-fire boss shift |

## Mode checklist (medbot)

| # | Mode ID | Arena | Kid objective |
|---|---------|-------|---------------|
| 1 | medbot_emergency_triage_response | hospital_walk | Triage 3 patients in order |
| 2 | medbot_defibrillator_shock_recharge | hospital_walk | Reach patient + shock |
| 3 | medbot_bandage_wrap_precision | hospital_walk ward | Bandage target zones |
| 4 | medbot_antidote_medicine_mix | auto_factory lab | Mix antidote sequence |
| 5 | medbot_hospital_corridor_dash | hospital_walk | Corridor dash under timer |
| 6 | medbot_vital_signs_monitor | hospital_walk ICU | Monitor route checkpoints |
| 7 | medbot_quarantine_zone_containment | cyber_city | Contain outbreak zone |
| 8 | medbot_surgical_laser_precision | hospital_walk OR | Laser path precision |
| 9 | medbot_medical_supply_helicopter_drop | snow_rescue | Coordinate drop zone |
| 10 | medbot_chief_medical_officer | hospital_walk capstone | ER boss shift |

## Mode checklist (rescuedrone)

| # | Mode ID | Arena | Kid objective |
|---|---------|-------|---------------|
| 1 | rescuedrone_disaster_zone_search | firebot_blaze rubble | Search 5 beacons |
| 2 | rescuedrone_emergency_first_aid_drop | hospital_walk | Drop aid on pad |
| 3 | rescuedrone_flood_zone_evacuation_tag | snow_rescue | Tag survivors |
| 4 | rescuedrone_thermal_heat_signature_spotting | firebot_blaze thermal | Spot heat signatures |
| 5 | rescuedrone_avalanche_beacon_sweep | snow_rescue mountain | Sweep beacon grid |
| 6 | rescuedrone_rope_lifeline_deploy | lava_canyon cliff | Deploy rope to target |
| 7 | rescuedrone_hurricane_wind_rescue | typhoon | Fly in crosswind |
| 8 | rescuedrone_night_searchlight_recon | night_patrol aerial | Night search pattern |
| 9 | rescuedrone_hazardous_gas_sampling | cyber_city hazmat | Sample gas zones |
| 10 | rescuedrone_hero_rescue_medal | firebot_blaze capstone | Multi-rescue boss |

## Deliverables per mode

1. `buildEmergencyArena(scene, variant)` prefab OR extend existing `_firebotBlazeArena` / `_hospitalWalkArena`
2. Spawn marker + objective zones wired to `challenge` from `CHASSIS_GAME_MODE_BY_ID`
3. Starter Blockly script (3–6 blocks) in mode metadata or `game-mode-specifications.js`
4. Win: `robotState.onSuccess()` when objective met
5. Stars: complete / under time / no damage
6. `unlocksNext` chain already in mode JSON — verify GameProgress respects it

## Acceptance (30 missions)

Record 30s video for firebot mode 1 & 10, medbot mode 1 & 10, rescuedrone mode 1 & 10:

- Not kart track / not football pitch
- Correct robot mesh
- Objective completable
- Win + stars + unlock mode 2

## Files to touch

- `src/virtual-robot-designer/studio/LiveLabPage.jsx` — `buildSmartArena`, emergency builders
- `src/virtual-robot-designer/studio/AdventureArenaBuilder.js` — shared emergency prefab
- `src/virtual-robot-designer/studio/PremiumArenas.js` — visual props if needed
- `src/virtual-robot-designer/data/chassis-game-modes.js` — verify `arenaType` per mode (already set)
