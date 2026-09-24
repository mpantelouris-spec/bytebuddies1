# BYTEBUDDIES — FLYING ARENA FULL MASTER PROMPT
## Complete agent instructions · 9 flyers × 10 missions = 90 arenas · 2026-09-07-flying-90-v216

> **How to use:** Copy this entire file into your coding agent, OR paste one mission block from Part II.
> Regenerate anytime: `node scripts/generate-flying-arena-prompts.mjs`
> Verify: `node scripts/verify-flying-arena-identity.mjs`

---

# PART I — MASTER BUILD & FIX INSTRUCTIONS

## 1. Problem statement

ByteBuddies has **9 flying robots × 10 missions = 90 aerial arenas**. They currently look like the **same ring-slalom course with a colour filter**. The user must be able to open any two flyers at mode 1 and identify them in **under 3 seconds** from silhouette, vista, and sky — not gate colour alone.

**Quality reference:** Jet Plane mode 1 (`jetplane_supersonic_dogfight`) — grass spawn sky-island with mechanical huts, golden-hour sky, carrier deck vista below, premium numbered holo rings.

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
| `installFlyingVistaLayer` not wired | Call from `installFlyingArenaIdentity` in `FlyingArenaKit.js` |
| `PremiumKidArenaKit` applied golden sky + citadel islands to all flyers | When `flyingActive`, bible sky only — no citadel scatter |
| Recipe defaults (`drone_canyon`, golden hour) overrode chassis | `applyFlyingRecipeContract` strips recipe sky/islands |
| Vista props too small/far below camera | `installFlyingChassisSetPiece` — large beside-path geometry |
| All robots used same holo ring torus | `AerialRingGateKit.buildGateForChassis(chassisId)` |
| Drone mode 1 incorrectly used Jet spawn island | Only Jet has `spawnSkyIslandModes: [1..10]` |
| Layers not cleared on mission switch | `clearFlyingArenaLayers(scene)` at `buildAerialWorld` start |

---

## 4. Code architecture (files you must touch)

| File | Role |
|------|------|
| `src/.../aerial-world/AerialWorldKit.js` | Orchestrator: `buildAerialWorld`, `clearFlyingArenaLayers`, contract resolution |
| `src/.../aerial-world/FlyingArenaKit.js` | `installFlyingSpawnLandmark`, `installFlyingVistaLayer`, `installFlyingModeScenery`, `applyFlyingRecipeContract`, `installFlyingArenaIdentity` |
| `src/.../aerial-world/FlyingChassisSetPiece.js` | Large per-chassis set pieces beside spline; `applyFlyingModeSplineVariation` |
| `src/.../aerial-world/FlyingArenaSpec.js` | `FLYER_VISUAL_BIBLES`, `getFlyingArenaContract`, `resolveFlyingChassisId` |
| `src/.../aerial-world/FlyingMissionSpecs.js` | Generated 90 mission specs (sky, vista, recipeId, dressing) |
| `src/.../aerial-world/FlyingMissionDressing.js` | Per-mode decorative props via `FLYING_MISSION_FEATURES` |
| `src/.../aerial-world/AerialRingGateKit.js` | `buildGateForChassis()` — per-chassis gate mesh |
| `src/.../aerial-world/PremiumKidArenaKit.js` | When flying: bible sky only |
| `scripts/verify-flying-arena-identity.mjs` | CI check: 9 vistas, 9 sky tops, 90 missions |

**LiveLab routing:** `buildSmartArena` → `_aerialArena` → `buildFlightRingsArena` → `buildAerialWorld`

---

## 5. Build call order (exact)

```
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
```

`finalizeMissionArenaVisuals` must **return early** when `scene.userData.aerialWorldBuilt` or `skipMissionWorld`.

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

Implement in `AerialRingGateKit.buildGateForChassis(chassisId)`.

---

## 8. Full visual bibles (all 9 flyers)


### Drone (`drone`)

| Field | Value |
|-------|-------|
| Identity | Friendly cloud playground |
| aerialVista | `cloud_sea` |
| Sky top/mid/horizon | #e87830 / #f5a623 / #ffe8b0 |
| Fog | #e8c090 · near/far 90/280 |
| goldenHour | YES |
| bloom | 0.22 |
| spawnKind | `sky_academy_arch` |
| Gate primary/secondary/final | #38bdf8 / #facc15 / #22c55e |
| Gate geometry | round holo torus (default) |
| Mode recipes (1–10) | drone_canyon, canyon_flight, storm_cloud, cloud_race, space_orbit, flight_rings, jet_stunt, rooftop_delivery, typhoon, warp_gate |

**Vista layer:**
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

**Spawn landmark:**
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral


### Helicopter (`helicopter`)

| Field | Value |
|-------|-------|
| Identity | Ocean worker & rescue hops |
| aerialVista | `ocean_platforms` |
| Sky top/mid/horizon | #38bdf8 / #7dd3fc / #bae6fd |
| Fog | #93c5fd · near/far 100/320 |
| goldenHour | NO |
| bloom | 0.21 |
| spawnKind | `offshore_platform` |
| Gate primary/secondary/final | #fbbf24 / #1e40af / #22c55e |
| Gate geometry | square arch frame — yellow/blue industrial |
| Mode recipes (1–10) | drone_canyon, canyon_flight, storm_cloud, cloud_race, space_orbit, flight_rings, jet_stunt, rooftop_delivery, typhoon, warp_gate |

**Vista layer:**
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

**Spawn landmark:**
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad


### Hover Bot (`hoverbot`)

| Field | Value |
|-------|-------|
| Identity | Sci-fi zero-G laboratory |
| aerialVista | `floating_labs` |
| Sky top/mid/horizon | #e0e7ff / #c4b5fd / #ddd6fe |
| Fog | #c4b5fd · near/far 110/340 |
| goldenHour | NO |
| bloom | 0.22 |
| spawnKind | `repulsor_gate` |
| Gate primary/secondary/final | #a78bfa / #22d3ee / #22c55e |
| Gate geometry | hexagonal repulsor ring — violet/cyan |
| Mode recipes (1–10) | drone_canyon, canyon_flight, storm_cloud, cloud_race, space_orbit, flight_rings, jet_stunt, rooftop_delivery, typhoon, warp_gate |

**Vista layer:**
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

**Spawn landmark:**
buildRepulsorGate — violet torus r=3.2, emissive pulse


### Jet Plane (`jetplane`)

| Field | Value |
|-------|-------|
| Identity | Supersonic military ace |
| aerialVista | `carrier_deck` |
| Sky top/mid/horizon | #3478b8 / #87b9d6 / #ffd39a |
| Fog | #d7b78f · near/far 125/380 |
| goldenHour | YES |
| bloom | 0.24 |
| spawnKind | `spawn_sky_island` |
| Gate primary/secondary/final | #3b82f6 / #ef4444 / #22c55e |
| Gate geometry | premium holo torus — blue/red military |
| Mode recipes (1–10) | drone_canyon, canyon_flight, storm_cloud, cloud_race, space_orbit, flight_rings, jet_stunt, rooftop_delivery, typhoon, warp_gate |

**Vista layer:**
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

**Spawn landmark:**
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags


### Stealth Jet (`steathjet`)

| Field | Value |
|-------|-------|
| Identity | Night ops stealth |
| aerialVista | `radar_dome` |
| Sky top/mid/horizon | #0f172a / #1e293b / #312e81 |
| Fog | #1e293b · near/far 80/260 |
| goldenHour | NO |
| bloom | 0.2 |
| spawnKind | `hangar_mouth` |
| Gate primary/secondary/final | #22c55e / #64748b / #22c55e |
| Gate geometry | wireframe thin ring — green HUD ghost |
| Mode recipes (1–10) | drone_canyon, canyon_flight, storm_cloud, cloud_race, space_orbit, flight_rings, jet_stunt, rooftop_delivery, typhoon, warp_gate |

**Vista layer:**
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

**Spawn landmark:**
buildHangarMouth — dark jambs, red single runway light


### Aero Stunt (`aerobat`)

| Field | Value |
|-------|-------|
| Identity | Sunset airshow coast |
| aerialVista | `coastline` |
| Sky top/mid/horizon | #4a90d9 / #ffaa55 / #ffd966 |
| Fog | #ffcc88 · near/far 100/320 |
| goldenHour | YES |
| bloom | 0.23 |
| spawnKind | `airshow_banner` |
| Gate primary/secondary/final | #fb923c / #f8fafc / #22c55e |
| Gate geometry | wide stunt ring — orange tilt-capable |
| Mode recipes (1–10) | drone_canyon, canyon_flight, storm_cloud, cloud_race, space_orbit, flight_rings, jet_stunt, rooftop_delivery, typhoon, warp_gate |

**Vista layer:**
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

**Spawn landmark:**
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m


### Racing Drone (`racedrone`)

| Field | Value |
|-------|-------|
| Identity | FPV neon prism speedway |
| aerialVista | `neon_ribbon` |
| Sky top/mid/horizon | #120428 / #2a1058 / #4c1d95 |
| Fog | #1e1b4b · near/far 70/240 |
| goldenHour | NO |
| bloom | 0.24 |
| spawnKind | `neon_gantry` |
| Gate primary/secondary/final | #ec4899 / #06b6d4 / #22c55e |
| Gate geometry | tight FPV square gate — pink/cyan neon |
| Mode recipes (1–10) | rainbow_road, drone_canyon, sunny_circuit, cloud_race, dragon_skyway, flight_rings, volcano_drift, storm_cloud, street_grand_prix, warp_gate |

**Vista layer:**
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

**Spawn landmark:**
buildNeonGantry — pink/cyan posts, countdown lights red/green


### Hover Racer (`hoverracer`)

| Field | Value |
|-------|-------|
| Identity | Plasma lane speedway |
| aerialVista | `plasma_track` |
| Sky top/mid/horizon | #4c1d95 / #6b21a8 / #7c3aed |
| Fog | #4c1d95 · near/far 70/240 |
| goldenHour | NO |
| bloom | 0.24 |
| spawnKind | `warp_gate_arch` |
| Gate primary/secondary/final | #a855f7 / #22d3ee / #22c55e |
| Gate geometry | tight FPV plasma gate — violet/cyan |
| Mode recipes (1–10) | rainbow_road, drone_canyon, sunny_circuit, cloud_race, dragon_skyway, flight_rings, volcano_drift, storm_cloud, street_grand_prix, warp_gate |

**Vista layer:**
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

**Spawn landmark:**
buildWarpGateArch — purple half-torus portal


### Rescue Drone (`rescuedrone`)

| Field | Value |
|-------|-------|
| Identity | Hero over disaster |
| aerialVista | `disaster_city` |
| Sky top/mid/horizon | #fed7aa / #fdba74 / #ffedd5 |
| Fog | #ffedd5 · near/far 90/280 |
| goldenHour | NO |
| bloom | 0.21 |
| spawnKind | `emergency_hq` |
| Gate primary/secondary/final | #f97316 / #22c55e / #22c55e |
| Gate geometry | wide rescue arch — orange/green |
| Mode recipes (1–10) | drone_canyon, canyon_flight, storm_cloud, cloud_race, space_orbit, flight_rings, jet_stunt, rooftop_delivery, typhoon, warp_gate |

**Vista layer:**
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

**Spawn landmark:**
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole


---

## 9. Universal rules

1. **Shape not colour** — unique vista geometry per chassis; never reuse another flyer's vista layer.
2. **Prop budget** — spawn landmark + vista layer + chassis set piece + mode scenery + mission dressing + gates. No random citadel GLTF island scatter.
3. **Recipe ≠ sky** — `applyFlyingRecipeContract` locks bible sky; recipe only drives spline + midground props.
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

```bash
node scripts/verify-flying-arena-identity.mjs
# Expected: PASS flying arena identity 2026-09-07-flying-90-v216
```

---

# PART II — ALL 90 MISSION BUILD SPECS

Each block below is a **complete per-mission build order** — paste one block for a single mission fix.


# Drone

**Identity:** Friendly cloud playground
**Vista code:** `cloud_sea`
**Gate primary:** #38bdf8 · **secondary:** #facc15


## Mode 1 — Aerial Ring Slalom

| | |
|---|---|
| **ID** | `drone_aerial_ring_slalom` |
| **Recipe** | `drone_canyon` → Sky Academy |
| **Difficulty** | Tutorial |
| **Vista** | `cloud_sea` |
| **Spline** | `canyon_slalom` · 185m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_aerial_ring_slalom
ROBOT:         drone · Mode 1/10 · Tutorial
DISPLAY NAME:  Aerial Ring Slalom
OBJECTIVE:     Fly through 12 glowing rings in order.
ARENA RECIPE:  drone_canyon (Sky Academy)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe drone_canyon) ━━━
canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped
Altitude band: y 16–22
Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 6–8 numbered holo rings, tier forgiving, spacing 22–28m

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Tutorial: widest ring spacing (28m). First ring 8m ahead. Cloud arch frames gate 1.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
First mode — establish chassis identity clearly.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode N/A of same robot
```

---

## Mode 2 — Hover Altitude Lock

| | |
|---|---|
| **ID** | `drone_hover_altitude_lock` |
| **Recipe** | `canyon_flight` → Altitude Lock |
| **Difficulty** | Easy |
| **Vista** | `cloud_sea` |
| **Spline** | `canyon_slalom` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_hover_altitude_lock
ROBOT:         drone · Mode 2/10 · Easy
DISPLAY NAME:  Hover Altitude Lock
OBJECTIVE:     Hold exact altitude through the canyon corridor.
ARENA RECIPE:  canyon_flight (Altitude Lock)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe canyon_flight) ━━━
canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped
Altitude band: y 24–32
Altitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 6 rings + altitude bar between gates 2–5

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
HUD altitude bar green between y=24–30. Rings only count inside band.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 1 used drone_canyon (Sky Academy). This mode uses canyon_flight — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 1 of same robot
```

---

## Mode 3 — Aerial Target Dive

| | |
|---|---|
| **ID** | `drone_aerial_target_dive` |
| **Recipe** | `storm_cloud` → Target Dive |
| **Difficulty** | Easy |
| **Vista** | `cloud_sea` |
| **Spline** | `dive_targets` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_aerial_target_dive
ROBOT:         drone · Mode 3/10 · Easy
DISPLAY NAME:  Aerial Target Dive
OBJECTIVE:     Dive-bomb 5 targets then pull up before ground.
ARENA RECIPE:  storm_cloud (Target Dive)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe storm_cloud) ━━━
dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28
Altitude band: y 28–38 dive to 8 on targets
5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 3 rings then 5 ground bullseyes (mixed mode)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
After ring 3, dive to 5 bullseyes on cloud sea floor — pull up before y=10.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 2 used canyon_flight (Altitude Lock). This mode uses storm_cloud — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 2 of same robot
```

---

## Mode 4 — Quadcopter Swarm Patrol

| | |
|---|---|
| **ID** | `drone_quadcopter_swarm_patrol` |
| **Recipe** | `cloud_race` → Cloud Slalom |
| **Difficulty** | Medium |
| **Vista** | `cloud_sea` |
| **Spline** | `figure8` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_quadcopter_swarm_patrol
ROBOT:         drone · Mode 4/10 · Medium
DISPLAY NAME:  Quadcopter Swarm Patrol
OBJECTIVE:     Patrol 4 sky sectors with waypoint loops.
ARENA RECIPE:  cloud_race (Cloud Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe cloud_race) ━━━
figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course
Altitude band: y 20–30
Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 8–10 rings at crossing points

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Figure-8 crossing: 3 translucent drone silhouettes orbit gate 4 (decorative, no collision).

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 3 used storm_cloud (Target Dive). This mode uses cloud_race — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 3 of same robot
```

---

## Mode 5 — Vertical Ascent Sprint

| | |
|---|---|
| **ID** | `drone_vertical_ascent_sprint` |
| **Recipe** | `space_orbit` → Vertical Ascent |
| **Difficulty** | Medium |
| **Vista** | `cloud_sea` |
| **Spline** | `spiral_climb` · 130m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_vertical_ascent_sprint
ROBOT:         drone · Mode 5/10 · Medium
DISPLAY NAME:  Vertical Ascent Sprint
OBJECTIVE:     Race straight up the tower to the landing pad.
ARENA RECIPE:  space_orbit (Vertical Ascent)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe space_orbit) ━━━
spiral_climb · 130m · climb +70 from y=8 · tightening radius
Altitude band: y 8 → 78 climb
Launch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 10 rings on spiral — increasing height

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Launch tower flame at start. Rings climb with spiral — celebrate at top ring.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 4 used cloud_race (Cloud Slalom). This mode uses space_orbit — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 4 of same robot
```

---

## Mode 6 — Package Drop Precision

| | |
|---|---|
| **ID** | `drone_package_drop_precision` |
| **Recipe** | `flight_rings` → Rooftop Delivery |
| **Difficulty** | Medium |
| **Vista** | `cloud_sea` |
| **Spline** | `rooftop_stops` · 195m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_package_drop_precision
ROBOT:         drone · Mode 6/10 · Medium
DISPLAY NAME:  Package Drop Precision
OBJECTIVE:     Drop supply crate on the rooftop X marker.
ARENA RECIPE:  flight_rings (Rooftop Delivery)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe flight_rings) ━━━
rooftop_stops · 195m · 3 H-pad stops · y 26–34
Altitude band: y 18–34 (Rescue Drone: 12–22)
3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 6 rings linking rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Ring 4 over rooftop — drop zone green square on pad below.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 5 used space_orbit (Vertical Ascent). This mode uses flight_rings — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 5 of same robot
```

---

## Mode 7 — Aerial Photography Sweep

| | |
|---|---|
| **ID** | `drone_aerial_photography_sweep` |
| **Recipe** | `jet_stunt` → Photo Sweep |
| **Difficulty** | Hard |
| **Vista** | `cloud_sea` |
| **Spline** | `coast_arc` · 230m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_aerial_photography_sweep
ROBOT:         drone · Mode 7/10 · Hard
DISPLAY NAME:  Aerial Photography Sweep
OBJECTIVE:     Hover over 6 photo waypoints steadily.
ARENA RECIPE:  jet_stunt (Photo Sweep)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe jet_stunt) ━━━
coast_arc · 230m · y 18–28 · arcs over cliff edge
Altitude band: y 18–28
Coast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 6 wide stunt rings, slight tilt 15°

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
3 photo columns (A/B/C) translucent blue — fly through for shutter flash.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 6 used flight_rings (Rooftop Delivery). This mode uses jet_stunt — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 6 of same robot
```

---

## Mode 8 — Wind Tunnel Navigation

| | |
|---|---|
| **ID** | `drone_wind_tunnel_navigation` |
| **Recipe** | `rooftop_delivery` → Wind Tunnel |
| **Difficulty** | Hard |
| **Vista** | `cloud_sea` |
| **Spline** | `wind_tunnel` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_wind_tunnel_navigation
ROBOT:         drone · Mode 8/10 · Hard
DISPLAY NAME:  Wind Tunnel Navigation
OBJECTIVE:     Fight crosswinds without leaving the corridor.
ARENA RECIPE:  rooftop_delivery (Wind Tunnel)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe rooftop_delivery) ━━━
wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts
Altitude band: y 22 locked
Purple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 8 rings inside tunnel segment

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Teal wind tunnel tube — stay inside 10m corridor. Turbine blades spin.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 7 used jet_stunt (Photo Sweep). This mode uses rooftop_delivery — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 7 of same robot
```

---

## Mode 9 — Propeller Flip Stunt

| | |
|---|---|
| **ID** | `drone_propeller_flip_stunt` |
| **Recipe** | `typhoon` → Propeller Flip |
| **Difficulty** | Hard |
| **Vista** | `cloud_sea` |
| **Spline** | `storm_eye` · 155m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_propeller_flip_stunt
ROBOT:         drone · Mode 9/10 · Hard
DISPLAY NAME:  Propeller Flip Stunt
OBJECTIVE:     Execute flip through the stunt ring.
ARENA RECIPE:  typhoon (Propeller Flip)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe typhoon) ━━━
storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24
Altitude band: y 22–26
Storm eye spline + rain + 1 tilted stunt ring at t=0.72

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 7 rings + stunt ring (mixed)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm eye + ONE tilted stunt ring (45° roll cue) at t=0.72.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 8 used rooftop_delivery (Wind Tunnel). This mode uses typhoon — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 8 of same robot
```

---

## Mode 10 🏆 CAPSTONE — Sky Ace Master

| | |
|---|---|
| **ID** | `drone_sky_ace_master` |
| **Recipe** | `warp_gate` → Sky Ace |
| **Difficulty** | Expert |
| **Vista** | `cloud_sea` |
| **Spline** | `capstone_sections` · 280m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    drone_sky_ace_master
ROBOT:         drone · Mode 10/10 · Expert
DISPLAY NAME:  Sky Ace Master
OBJECTIVE:     Capstone: rings, dive, drop, stunt combo course.
ARENA RECIPE:  warp_gate (Sky Ace)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e87830
mid:     #f5a623
horizon: #ffe8b0
fog:     #e8c090
near/far: 90/280
goldenHour: YES
bloom: 0.22
parallaxClouds: YES (Drone only)

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'cloud_sea'
FlyingVistaLayer/cloud_sea:
  · 6 cloud banks (sphere r=11, opacity 0.48) along cz axis
  · Cyan cloud-castle torus arch at x=-22, y=floorY+14
  · NO mechanical huts except Jet spawn island

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: sky_academy_arch
placeAerialHero(sky_academy_arch) at t=0.08 — cyan holographic arch with numeral

━━━ 4. SPLINE / LAYOUT (recipe warp_gate) ━━━
capstone_sections · 280m · dive section t=0.65–0.8 · longest course
Altitude band: y 8–34 multi-section
Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
8 rings · primary #38bdf8 · secondary #facc15 · final #22c55e · 8 rings (kid cap) spaced to t=0.90

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Capstone: cloud arch + storm wall segment + warp ring finish. 8 rings max.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 9 used typhoon (Propeller Flip). This mode uses warp_gate — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis drone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━
Oil rigs, carrier deck, neon ribbon, mechanical huts on route








Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (cloud_sea)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 9 of same robot
```

---


# Helicopter

**Identity:** Ocean worker & rescue hops
**Vista code:** `ocean_platforms`
**Gate primary:** #fbbf24 · **secondary:** #1e40af


## Mode 1 — Heavy Cargo Airlift

| | |
|---|---|
| **ID** | `helicopter_heavy_cargo_airlift` |
| **Recipe** | `drone_canyon` → Sky Academy |
| **Difficulty** | Tutorial |
| **Vista** | `ocean_platforms` |
| **Spline** | `canyon_slalom` · 185m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_heavy_cargo_airlift
ROBOT:         helicopter · Mode 1/10 · Tutorial
DISPLAY NAME:  Heavy Cargo Airlift
OBJECTIVE:     Lift crate from pad A to oil rig landing zone.
ARENA RECIPE:  drone_canyon (Sky Academy)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe drone_canyon) ━━━
canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped
Altitude band: y 16–22
Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 6–8 numbered holo rings, tier forgiving, spacing 22–28m

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Suspended orange crate mesh 3m below heli hook at start. Slow spline.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
First mode — establish chassis identity clearly.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode N/A of same robot
```

---

## Mode 2 — Offshore Oil Rig Landing

| | |
|---|---|
| **ID** | `helicopter_offshore_oil_rig_landing` |
| **Recipe** | `canyon_flight` → Altitude Lock |
| **Difficulty** | Easy |
| **Vista** | `ocean_platforms` |
| **Spline** | `canyon_slalom` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_offshore_oil_rig_landing
ROBOT:         helicopter · Mode 2/10 · Easy
DISPLAY NAME:  Offshore Oil Rig Landing
OBJECTIVE:     Land on moving platform in crosswind.
ARENA RECIPE:  canyon_flight (Altitude Lock)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe canyon_flight) ━━━
canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped
Altitude band: y 24–32
Altitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 6 rings + altitude bar between gates 2–5

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Must touch down on rig #2 yellow H pad between gates 3–4.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 1 used drone_canyon (Sky Academy). This mode uses canyon_flight — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 1 of same robot
```

---

## Mode 3 — Water Bucket Fire Suppression

| | |
|---|---|
| **ID** | `helicopter_water_bucket_fire_suppression` |
| **Recipe** | `storm_cloud` → Target Dive |
| **Difficulty** | Easy |
| **Vista** | `ocean_platforms` |
| **Spline** | `dive_targets` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_water_bucket_fire_suppression
ROBOT:         helicopter · Mode 3/10 · Easy
DISPLAY NAME:  Water Bucket Fire Suppression
OBJECTIVE:     Fill bucket and dump on firebot_blaze targets.
ARENA RECIPE:  storm_cloud (Target Dive)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe storm_cloud) ━━━
dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28
Altitude band: y 28–38 dive to 8 on targets
5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 3 rings then 5 ground bullseyes (mixed mode)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm recipe but vista stays OCEAN. Red fire glow on rig #1 — drop bucket cue.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 2 used canyon_flight (Altitude Lock). This mode uses storm_cloud — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 2 of same robot
```

---

## Mode 4 — Mountain Top Insertion

| | |
|---|---|
| **ID** | `helicopter_mountain_top_insertion` |
| **Recipe** | `cloud_race` → Cloud Slalom |
| **Difficulty** | Medium |
| **Vista** | `ocean_platforms` |
| **Spline** | `figure8` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_mountain_top_insertion
ROBOT:         helicopter · Mode 4/10 · Medium
DISPLAY NAME:  Mountain Top Insertion
OBJECTIVE:     Insert team at summit waypoint in canyon flight.
ARENA RECIPE:  cloud_race (Cloud Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe cloud_race) ━━━
figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course
Altitude band: y 20–30
Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 8–10 rings at crossing points

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Figure-8 over ocean — snow-cap white peak prop on rig #3 (not grass mountain).

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 3 used storm_cloud (Target Dive). This mode uses cloud_race — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 3 of same robot
```

---

## Mode 5 — Rotor Pitch Control

| | |
|---|---|
| **ID** | `helicopter_rotor_pitch_control` |
| **Recipe** | `space_orbit` → Vertical Ascent |
| **Difficulty** | Medium |
| **Vista** | `ocean_platforms` |
| **Spline** | `spiral_climb` · 130m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_rotor_pitch_control
ROBOT:         helicopter · Mode 5/10 · Medium
DISPLAY NAME:  Rotor Pitch Control
OBJECTIVE:     Hold hover while pitch meter stays in green.
ARENA RECIPE:  space_orbit (Vertical Ascent)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe space_orbit) ━━━
spiral_climb · 130m · climb +70 from y=8 · tightening radius
Altitude band: y 8 → 78 climb
Launch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 10 rings on spiral — increasing height

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Spiral climb over ocean — rotor wash particle streaks at each gate.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 4 used cloud_race (Cloud Slalom). This mode uses space_orbit — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 4 of same robot
```

---

## Mode 6 — Construction Girder Placement

| | |
|---|---|
| **ID** | `helicopter_construction_girder_placement` |
| **Recipe** | `flight_rings` → Rooftop Delivery |
| **Difficulty** | Medium |
| **Vista** | `ocean_platforms` |
| **Spline** | `rooftop_stops` · 195m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_construction_girder_placement
ROBOT:         helicopter · Mode 6/10 · Medium
DISPLAY NAME:  Construction Girder Placement
OBJECTIVE:     Place steel beam on marked hooks.
ARENA RECIPE:  flight_rings (Rooftop Delivery)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe flight_rings) ━━━
rooftop_stops · 195m · 3 H-pad stops · y 26–34
Altitude band: y 18–34 (Rescue Drone: 12–22)
3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 6 rings linking rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
3 rooftop stops with grey steel girder props on pads.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 5 used space_orbit (Vertical Ascent). This mode uses flight_rings — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 5 of same robot
```

---

## Mode 7 — Long Haul Fuel Flight

| | |
|---|---|
| **ID** | `helicopter_long_haul_fuel_flight` |
| **Recipe** | `jet_stunt` → Photo Sweep |
| **Difficulty** | Hard |
| **Vista** | `ocean_platforms` |
| **Spline** | `coast_arc` · 230m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_long_haul_fuel_flight
ROBOT:         helicopter · Mode 7/10 · Hard
DISPLAY NAME:  Long Haul Fuel Flight
OBJECTIVE:     Reach distant pad before fuel runs out.
ARENA RECIPE:  jet_stunt (Photo Sweep)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe jet_stunt) ━━━
coast_arc · 230m · y 18–28 · arcs over cliff edge
Altitude band: y 18–28
Coast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 6 wide stunt rings, slight tilt 15°

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Coast arc over ocean — tanker ship silhouette below at t=0.5.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 6 used flight_rings (Rooftop Delivery). This mode uses jet_stunt — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 6 of same robot
```

---

## Mode 8 — Emergency Medevac Transport

| | |
|---|---|
| **ID** | `helicopter_emergency_medevac_transport` |
| **Recipe** | `rooftop_delivery` → Wind Tunnel |
| **Difficulty** | Hard |
| **Vista** | `ocean_platforms` |
| **Spline** | `wind_tunnel` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_emergency_medevac_transport
ROBOT:         helicopter · Mode 8/10 · Hard
DISPLAY NAME:  Emergency Medevac Transport
OBJECTIVE:     Pick up patient from hospital_walk zone.
ARENA RECIPE:  rooftop_delivery (Wind Tunnel)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe rooftop_delivery) ━━━
wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts
Altitude band: y 22 locked
Purple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 8 rings inside tunnel segment

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Hospital red cross on middle rooftop. Green survivor marker.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 7 used jet_stunt (Photo Sweep). This mode uses rooftop_delivery — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 7 of same robot
```

---

## Mode 9 — Vehicle Recovery Winch

| | |
|---|---|
| **ID** | `helicopter_vehicle_recovery_winch` |
| **Recipe** | `typhoon` → Propeller Flip |
| **Difficulty** | Hard |
| **Vista** | `ocean_platforms` |
| **Spline** | `storm_eye` · 155m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_vehicle_recovery_winch
ROBOT:         helicopter · Mode 9/10 · Hard
DISPLAY NAME:  Vehicle Recovery Winch
OBJECTIVE:     Winch stranded rover from crater.
ARENA RECIPE:  typhoon (Propeller Flip)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe typhoon) ━━━
storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24
Altitude band: y 22–26
Storm eye spline + rain + 1 tilted stunt ring at t=0.72

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 7 rings + stunt ring (mixed)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm eye over churning ocean — winch cable line to vehicle block below.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 8 used rooftop_delivery (Wind Tunnel). This mode uses typhoon — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 8 of same robot
```

---

## Mode 10 🏆 CAPSTONE — Sky Crane Master

| | |
|---|---|
| **ID** | `helicopter_sky_crane_master` |
| **Recipe** | `warp_gate` → Sky Ace |
| **Difficulty** | Expert |
| **Vista** | `ocean_platforms` |
| **Spline** | `capstone_sections` · 280m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    helicopter_sky_crane_master
ROBOT:         helicopter · Mode 10/10 · Expert
DISPLAY NAME:  Sky Crane Master
OBJECTIVE:     Capstone lift + land + medevac chain.
ARENA RECIPE:  warp_gate (Sky Ace)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #38bdf8
mid:     #7dd3fc
horizon: #bae6fd
fog:     #93c5fd
near/far: 100/320
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'ocean_platforms'
FlyingVistaLayer/ocean_platforms:
  · Ocean plane 420×420 #0284c7 at y=floorY-3
  · 4 oil rigs: deck 16×16m + yellow helipad 8m + red beacon mast
  · Positions: (-48,-55), (42,-95), (5,-135), (-30,-175) relative cz

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: offshore_platform
buildOffshorePlatform — 16m steel deck, 3 cargo crates, yellow beacon, H pad

━━━ 4. SPLINE / LAYOUT (recipe warp_gate) ━━━
capstone_sections · 280m · dive section t=0.65–0.8 · longest course
Altitude band: y 8–34 multi-section
Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
8 rings · primary #fbbf24 · secondary #1e40af · final #22c55e · 8 rings (kid cap) spaced to t=0.90

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Capstone: 4 rigs + medevac pad + warp finish. Cargo crate through final ring.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 9 used typhoon (Propeller Flip). This mode uses warp_gate — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis helicopter
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━

Grass islands, cloud castle, carrier deck, neon ribbon







Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (ocean_platforms)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 9 of same robot
```

---


# Hover Bot

**Identity:** Sci-fi zero-G laboratory
**Vista code:** `floating_labs`
**Gate primary:** #a78bfa · **secondary:** #22d3ee


## Mode 1 — Anti-Gravity Glide

| | |
|---|---|
| **ID** | `hoverbot_anti_gravity_glide` |
| **Recipe** | `drone_canyon` → Sky Academy |
| **Difficulty** | Tutorial |
| **Vista** | `floating_labs` |
| **Spline** | `canyon_slalom` · 185m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_anti_gravity_glide
ROBOT:         hoverbot · Mode 1/10 · Tutorial
DISPLAY NAME:  Anti-Gravity Glide
OBJECTIVE:     Glide frictionless across the sky arena gap.
ARENA RECIPE:  drone_canyon (Sky Academy)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe drone_canyon) ━━━
canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped
Altitude band: y 16–22
Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 6–8 numbered holo rings, tier forgiving, spacing 22–28m

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Tutorial: repulsor gate pulse. Smooth canyon — pads visible at y=floorY+8.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
First mode — establish chassis identity clearly.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode N/A of same robot
```

---

## Mode 2 — Repulsor Field Push

| | |
|---|---|
| **ID** | `hoverbot_repulsor_field_push` |
| **Recipe** | `canyon_flight` → Altitude Lock |
| **Difficulty** | Easy |
| **Vista** | `floating_labs` |
| **Spline** | `canyon_slalom` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_repulsor_field_push
ROBOT:         hoverbot · Mode 2/10 · Easy
DISPLAY NAME:  Repulsor Field Push
OBJECTIVE:     Push debris blocks off the hover lane.
ARENA RECIPE:  canyon_flight (Altitude Lock)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe canyon_flight) ━━━
canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped
Altitude band: y 24–32
Altitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 6 rings + altitude bar between gates 2–5

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Altitude lock between violet hex gates. Plasma bridge visible to next pad.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 1 used drone_canyon (Sky Academy). This mode uses canyon_flight — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 1 of same robot
```

---

## Mode 3 — Magnet Rail Hover

| | |
|---|---|
| **ID** | `hoverbot_magnet_rail_hover` |
| **Recipe** | `storm_cloud` → Target Dive |
| **Difficulty** | Easy |
| **Vista** | `floating_labs` |
| **Spline** | `dive_targets` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_magnet_rail_hover
ROBOT:         hoverbot · Mode 3/10 · Easy
DISPLAY NAME:  Magnet Rail Hover
OBJECTIVE:     Lock onto mag-rail and follow the circuit.
ARENA RECIPE:  storm_cloud (Target Dive)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe storm_cloud) ━━━
dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28
Altitude band: y 28–38 dive to 8 on targets
5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 3 rings then 5 ground bullseyes (mixed mode)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm walls tinted purple. Magnet rail glowing strip under gates 2–4.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 2 used canyon_flight (Altitude Lock). This mode uses storm_cloud — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 2 of same robot
```

---

## Mode 4 — Zero-G Physics Room

| | |
|---|---|
| **ID** | `hoverbot_zero_g_physics_room` |
| **Recipe** | `cloud_race` → Cloud Slalom |
| **Difficulty** | Medium |
| **Vista** | `floating_labs` |
| **Spline** | `figure8` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_zero_g_physics_room
ROBOT:         hoverbot · Mode 4/10 · Medium
DISPLAY NAME:  Zero-G Physics Room
OBJECTIVE:     Navigate zero_g chamber without touching walls.
ARENA RECIPE:  cloud_race (Cloud Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe cloud_race) ━━━
figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course
Altitude band: y 20–30
Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 8–10 rings at crossing points

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Figure-8 in zero-G — slow rotation on lab pads at corners.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 3 used storm_cloud (Target Dive). This mode uses cloud_race — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 3 of same robot
```

---

## Mode 5 — Hover Height Calibration

| | |
|---|---|
| **ID** | `hoverbot_hover_height_calibration` |
| **Recipe** | `space_orbit` → Vertical Ascent |
| **Difficulty** | Medium |
| **Vista** | `floating_labs` |
| **Spline** | `spiral_climb` · 130m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_hover_height_calibration
ROBOT:         hoverbot · Mode 5/10 · Medium
DISPLAY NAME:  Hover Height Calibration
OBJECTIVE:     Hold 3 different altitudes at markers.
ARENA RECIPE:  space_orbit (Vertical Ascent)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe space_orbit) ━━━
spiral_climb · 130m · climb +70 from y=8 · tightening radius
Altitude band: y 8 → 78 climb
Launch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 10 rings on spiral — increasing height

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Spiral climb between lab pads — height tick marks on repulsor gate.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 4 used cloud_race (Cloud Slalom). This mode uses space_orbit — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 4 of same robot
```

---

## Mode 6 — Smooth Banked Glide

| | |
|---|---|
| **ID** | `hoverbot_smooth_banked_glide` |
| **Recipe** | `flight_rings` → Rooftop Delivery |
| **Difficulty** | Medium |
| **Vista** | `floating_labs` |
| **Spline** | `rooftop_stops` · 195m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_smooth_banked_glide
ROBOT:         hoverbot · Mode 6/10 · Medium
DISPLAY NAME:  Smooth Banked Glide
OBJECTIVE:     Bank through cloud race turns smoothly.
ARENA RECIPE:  flight_rings (Rooftop Delivery)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe flight_rings) ━━━
rooftop_stops · 195m · 3 H-pad stops · y 26–34
Altitude band: y 18–34 (Rescue Drone: 12–22)
3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 6 rings linking rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Rooftop stops replaced by floating lab pads with teal bridges.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 5 used space_orbit (Vertical Ascent). This mode uses flight_rings — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 5 of same robot
```

---

## Mode 7 — Energy Shield Bounce

| | |
|---|---|
| **ID** | `hoverbot_energy_shield_bounce` |
| **Recipe** | `jet_stunt` → Photo Sweep |
| **Difficulty** | Hard |
| **Vista** | `floating_labs` |
| **Spline** | `coast_arc` · 230m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_energy_shield_bounce
ROBOT:         hoverbot · Mode 7/10 · Hard
DISPLAY NAME:  Energy Shield Bounce
OBJECTIVE:     Bounce off shields to reach high platforms.
ARENA RECIPE:  jet_stunt (Photo Sweep)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe jet_stunt) ━━━
coast_arc · 230m · y 18–28 · arcs over cliff edge
Altitude band: y 18–28
Coast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 6 wide stunt rings, slight tilt 15°

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Coast arc with translucent shield dome at gate 3 (bounce cue).

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 6 used flight_rings (Rooftop Delivery). This mode uses jet_stunt — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 6 of same robot
```

---

## Mode 8 — Plasma Thruster Boost

| | |
|---|---|
| **ID** | `hoverbot_plasma_thruster_boost` |
| **Recipe** | `rooftop_delivery` → Wind Tunnel |
| **Difficulty** | Hard |
| **Vista** | `floating_labs` |
| **Spline** | `wind_tunnel` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_plasma_thruster_boost
ROBOT:         hoverbot · Mode 8/10 · Hard
DISPLAY NAME:  Plasma Thruster Boost
OBJECTIVE:     Chain boost pads on drone canyon course.
ARENA RECIPE:  rooftop_delivery (Wind Tunnel)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe rooftop_delivery) ━━━
wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts
Altitude band: y 22 locked
Purple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 8 rings inside tunnel segment

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Warp tunnel cyan/purple — 1 boost pad at tunnel midpoint.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 7 used jet_stunt (Photo Sweep). This mode uses rooftop_delivery — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 7 of same robot
```

---

## Mode 9 — Chasm Crossing Glide

| | |
|---|---|
| **ID** | `hoverbot_chasm_crossing_glide` |
| **Recipe** | `typhoon` → Propeller Flip |
| **Difficulty** | Hard |
| **Vista** | `floating_labs` |
| **Spline** | `storm_eye` · 155m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_chasm_crossing_glide
ROBOT:         hoverbot · Mode 9/10 · Hard
DISPLAY NAME:  Chasm Crossing Glide
OBJECTIVE:     Cross widest gap on single battery charge.
ARENA RECIPE:  typhoon (Propeller Flip)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe typhoon) ━━━
storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24
Altitude band: y 22–26
Storm eye spline + rain + 1 tilted stunt ring at t=0.72

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 7 rings + stunt ring (mixed)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm eye between two lab pads — chasm void below (black plane).

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 8 used rooftop_delivery (Wind Tunnel). This mode uses typhoon — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 8 of same robot
```

---

## Mode 10 🏆 CAPSTONE — Anti-Gravity Master

| | |
|---|---|
| **ID** | `hoverbot_anti_gravity_master` |
| **Recipe** | `warp_gate` → Sky Ace |
| **Difficulty** | Expert |
| **Vista** | `floating_labs` |
| **Spline** | `capstone_sections` · 280m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverbot_anti_gravity_master
ROBOT:         hoverbot · Mode 10/10 · Expert
DISPLAY NAME:  Anti-Gravity Master
OBJECTIVE:     Capstone glide + boost + precision landing.
ARENA RECIPE:  warp_gate (Sky Ace)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #e0e7ff
mid:     #c4b5fd
horizon: #ddd6fe
fog:     #c4b5fd
near/far: 110/340
goldenHour: NO
bloom: 0.22
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'floating_labs'
FlyingVistaLayer/floating_labs:
  · 3 grey lab pads 11×11m floating y=floorY+8
  · Teal plasma bridge strips between pads
  · NO grass, NO water

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: repulsor_gate
buildRepulsorGate — violet torus r=3.2, emissive pulse

━━━ 4. SPLINE / LAYOUT (recipe warp_gate) ━━━
capstone_sections · 280m · dive section t=0.65–0.8 · longest course
Altitude band: y 8–34 multi-section
Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
8 rings · primary #a78bfa · secondary #22d3ee · final #22c55e · 8 rings (kid cap) spaced to t=0.90

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Capstone: repulsor + spiral + tunnel + warp arch. Violet/teal only.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 9 used typhoon (Propeller Flip). This mode uses warp_gate — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverbot
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━


Ocean, grass, cloud whale, farm terrain






Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (floating_labs)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 9 of same robot
```

---


# Jet Plane

**Identity:** Supersonic military ace
**Vista code:** `carrier_deck`
**Gate primary:** #3b82f6 · **secondary:** #ef4444


## Mode 1 — Supersonic Dogfight

| | |
|---|---|
| **ID** | `jetplane_supersonic_dogfight` |
| **Recipe** | `drone_canyon` → Sky Academy |
| **Difficulty** | Tutorial |
| **Vista** | `carrier_deck` |
| **Spline** | `canyon_slalom` · 185m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_supersonic_dogfight
ROBOT:         jetplane · Mode 1/10 · Tutorial
DISPLAY NAME:  Supersonic Dogfight
OBJECTIVE:     Fly the ace training lane — holo rings over the carrier deck.
ARENA RECIPE:  drone_canyon (Sky Academy)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe drone_canyon) ━━━
canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped
Altitude band: y 16–22
Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 6–8 numbered holo rings, tier forgiving, spacing 22–28m

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
REFERENCE MISSION. buildSpawnSkyIsland + carrier vista + 6–8 holo rings. FOV 48 bloom 0.24.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
First mode — establish chassis identity clearly.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode N/A of same robot
```

---

## Mode 2 — Precision Air Strike

| | |
|---|---|
| **ID** | `jetplane_precision_air_strike` |
| **Recipe** | `canyon_flight` → Altitude Lock |
| **Difficulty** | Easy |
| **Vista** | `carrier_deck` |
| **Spline** | `canyon_slalom` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_precision_air_strike
ROBOT:         jetplane · Mode 2/10 · Easy
DISPLAY NAME:  Precision Air Strike
OBJECTIVE:     Hit ground targets without collateral.
ARENA RECIPE:  canyon_flight (Altitude Lock)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe canyon_flight) ━━━
canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped
Altitude band: y 24–32
Altitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 6 rings + altitude bar between gates 2–5

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Altitude lock canyon over carrier. 1 target bullseye on deck after ring 4.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 1 used drone_canyon (Sky Academy). This mode uses canyon_flight — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 1 of same robot
```

---

## Mode 3 — Aircraft Carrier Touch-and-Go

| | |
|---|---|
| **ID** | `jetplane_aircraft_carrier_touch_and_go` |
| **Recipe** | `storm_cloud` → Target Dive |
| **Difficulty** | Easy |
| **Vista** | `carrier_deck` |
| **Spline** | `dive_targets` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_aircraft_carrier_touch_and_go
ROBOT:         jetplane · Mode 3/10 · Easy
DISPLAY NAME:  Aircraft Carrier Touch-and-Go
OBJECTIVE:     Land and launch on carrier deck.
ARENA RECIPE:  storm_cloud (Target Dive)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe storm_cloud) ━━━
dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28
Altitude band: y 28–38 dive to 8 on targets
5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 3 rings then 5 ground bullseyes (mixed mode)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm dive — touch deck line at z=cz-98 between gates 3–4 then pull up.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 2 used canyon_flight (Altitude Lock). This mode uses storm_cloud — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 2 of same robot
```

---

## Mode 4 — Mach 2 Speed Trap

| | |
|---|---|
| **ID** | `jetplane_mach_2_speed_trap` |
| **Recipe** | `cloud_race` → Cloud Slalom |
| **Difficulty** | Medium |
| **Vista** | `carrier_deck` |
| **Spline** | `figure8` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_mach_2_speed_trap
ROBOT:         jetplane · Mode 4/10 · Medium
DISPLAY NAME:  Mach 2 Speed Trap
OBJECTIVE:     Break Mach 2 through speed trap gates.
ARENA RECIPE:  cloud_race (Cloud Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe cloud_race) ━━━
figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course
Altitude band: y 20–30
Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 8–10 rings at crossing points

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Figure-8 high speed — speed lines particle burst at gate 6.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 3 used storm_cloud (Target Dive). This mode uses cloud_race — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 3 of same robot
```

---

## Mode 5 — Radar Evasion Stealth Flight

| | |
|---|---|
| **ID** | `jetplane_radar_evasion_stealth_flight` |
| **Recipe** | `space_orbit` → Vertical Ascent |
| **Difficulty** | Medium |
| **Vista** | `carrier_deck` |
| **Spline** | `spiral_climb` · 130m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_radar_evasion_stealth_flight
ROBOT:         jetplane · Mode 5/10 · Medium
DISPLAY NAME:  Radar Evasion Stealth Flight
OBJECTIVE:     Cross zone without radar lock.
ARENA RECIPE:  space_orbit (Vertical Ascent)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe space_orbit) ━━━
spiral_climb · 130m · climb +70 from y=8 · tightening radius
Altitude band: y 8 → 78 climb
Launch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 10 rings on spiral — increasing height

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Spiral climb — keep below radar cone (green sweep mesh on carrier).

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 4 used cloud_race (Cloud Slalom). This mode uses space_orbit — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 4 of same robot
```

---

## Mode 6 — Missile Jammer Countermeasures

| | |
|---|---|
| **ID** | `jetplane_missile_jammer_countermeasures` |
| **Recipe** | `flight_rings` → Rooftop Delivery |
| **Difficulty** | Medium |
| **Vista** | `carrier_deck` |
| **Spline** | `rooftop_stops` · 195m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_missile_jammer_countermeasures
ROBOT:         jetplane · Mode 6/10 · Medium
DISPLAY NAME:  Missile Jammer Countermeasures
OBJECTIVE:     Jam incoming missiles during run.
ARENA RECIPE:  flight_rings (Rooftop Delivery)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe flight_rings) ━━━
rooftop_stops · 195m · 3 H-pad stops · y 26–34
Altitude band: y 18–34 (Rescue Drone: 12–22)
3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 6 rings linking rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
3 rooftop stops over carrier vista — jammer dish on pad 2.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 5 used space_orbit (Vertical Ascent). This mode uses flight_rings — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 5 of same robot
```

---

## Mode 7 — Mid-Air Tanker Refuel

| | |
|---|---|
| **ID** | `jetplane_mid_air_tanker_refuel` |
| **Recipe** | `jet_stunt` → Photo Sweep |
| **Difficulty** | Hard |
| **Vista** | `carrier_deck` |
| **Spline** | `coast_arc` · 230m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_mid_air_tanker_refuel
ROBOT:         jetplane · Mode 7/10 · Hard
DISPLAY NAME:  Mid-Air Tanker Refuel
OBJECTIVE:     Dock with tanker mid-flight.
ARENA RECIPE:  jet_stunt (Photo Sweep)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe jet_stunt) ━━━
coast_arc · 230m · y 18–28 · arcs over cliff edge
Altitude band: y 18–28
Coast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 6 wide stunt rings, slight tilt 15°

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Coast arc — tanker plane silhouette parallel at t=0.45 (refuel probe cue).

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 6 used flight_rings (Rooftop Delivery). This mode uses jet_stunt — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 6 of same robot
```

---

## Mode 8 — Canyon Run Precision

| | |
|---|---|
| **ID** | `jetplane_canyon_run_precision` |
| **Recipe** | `rooftop_delivery` → Wind Tunnel |
| **Difficulty** | Hard |
| **Vista** | `carrier_deck` |
| **Spline** | `wind_tunnel` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_canyon_run_precision
ROBOT:         jetplane · Mode 8/10 · Hard
DISPLAY NAME:  Canyon Run Precision
OBJECTIVE:     Thread canyon at minimum altitude.
ARENA RECIPE:  rooftop_delivery (Wind Tunnel)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe rooftop_delivery) ━━━
wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts
Altitude band: y 22 locked
Purple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 8 rings inside tunnel segment

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Wind tunnel between carrier towers — tight 10m corridor.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 7 used jet_stunt (Photo Sweep). This mode uses rooftop_delivery — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 7 of same robot
```

---

## Mode 9 — Escort Transport Jet

| | |
|---|---|
| **ID** | `jetplane_escort_transport_jet` |
| **Recipe** | `typhoon` → Propeller Flip |
| **Difficulty** | Hard |
| **Vista** | `carrier_deck` |
| **Spline** | `storm_eye` · 155m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_escort_transport_jet
ROBOT:         jetplane · Mode 9/10 · Hard
DISPLAY NAME:  Escort Transport Jet
OBJECTIVE:     Escort cargo plane through typhoon.
ARENA RECIPE:  typhoon (Propeller Flip)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe typhoon) ━━━
storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24
Altitude band: y 22–26
Storm eye spline + rain + 1 tilted stunt ring at t=0.72

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 7 rings + stunt ring (mixed)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm eye escort — transport silhouette ahead through eye.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 8 used rooftop_delivery (Wind Tunnel). This mode uses typhoon — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 8 of same robot
```

---

## Mode 10 🏆 CAPSTONE — Top Gun Ace Fighter

| | |
|---|---|
| **ID** | `jetplane_top_gun_ace_fighter` |
| **Recipe** | `warp_gate` → Sky Ace |
| **Difficulty** | Expert |
| **Vista** | `carrier_deck` |
| **Spline** | `capstone_sections` · 280m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    jetplane_top_gun_ace_fighter
ROBOT:         jetplane · Mode 10/10 · Expert
DISPLAY NAME:  Top Gun Ace Fighter
OBJECTIVE:     Capstone dogfight + strike + carrier landing.
ARENA RECIPE:  warp_gate (Sky Ace)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #3478b8
mid:     #87b9d6
horizon: #ffd39a
fog:     #d7b78f
near/far: 125/380
goldenHour: YES
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'carrier_deck'
FlyingVistaLayer/carrier_deck:
  · Carrier deck 110×38m #475569 at z=cz-98
  · White runway centerline
  · Island tower 18×8m port side
  · PLUS buildSpawnSkyIsland on ALL jet modes

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: spawn_sky_island
buildSpawnSkyIsland — grass island r=13, 2× buildSkyMechanicalHut, windmill, gold flags

━━━ 4. SPLINE / LAYOUT (recipe warp_gate) ━━━
capstone_sections · 280m · dive section t=0.65–0.8 · longest course
Altitude band: y 8–34 multi-section
Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
8 rings · primary #3b82f6 · secondary #ef4444 · final #22c55e · 8 rings (kid cap) spaced to t=0.90

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Capstone: island spawn + carrier + storm + warp cathedral. Gold flags.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 9 used typhoon (Propeller Flip). This mode uses warp_gate — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis jetplane
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId
  → installAerialReferenceVista()  // all jet modes

━━━ 9. BANNED (instant fail QA) ━━━



Oil rig, purple lab pads, neon FPV ribbon





Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (carrier_deck)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 9 of same robot
```

---


# Stealth Jet

**Identity:** Night ops stealth
**Vista code:** `radar_dome`
**Gate primary:** #22c55e · **secondary:** #64748b


## Mode 1 — Radar Dome Infiltration

| | |
|---|---|
| **ID** | `steathjet_radar_dome_infiltration` |
| **Recipe** | `drone_canyon` → Sky Academy |
| **Difficulty** | Tutorial |
| **Vista** | `radar_dome` |
| **Spline** | `canyon_slalom` · 185m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_radar_dome_infiltration
ROBOT:         steathjet · Mode 1/10 · Tutorial
DISPLAY NAME:  Radar Dome Infiltration
OBJECTIVE:     Penetrate radar dome undetected.
ARENA RECIPE:  drone_canyon (Sky Academy)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe drone_canyon) ━━━
canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped
Altitude band: y 16–22
Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #22c55e · secondary #64748b · final #22c55e · 6–8 numbered holo rings, tier forgiving, spacing 22–28m

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Tutorial: hangar spawn, stars, green stealth rings dim emissive 0.4.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
First mode — establish chassis identity clearly.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode N/A of same robot
```

---

## Mode 2 — Night Bombing Raid

| | |
|---|---|
| **ID** | `steathjet_night_bombing_raid` |
| **Recipe** | `canyon_flight` → Altitude Lock |
| **Difficulty** | Easy |
| **Vista** | `radar_dome` |
| **Spline** | `canyon_slalom` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_night_bombing_raid
ROBOT:         steathjet · Mode 2/10 · Easy
DISPLAY NAME:  Night Bombing Raid
OBJECTIVE:     Hit targets on night_patrol map.
ARENA RECIPE:  canyon_flight (Altitude Lock)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe canyon_flight) ━━━
canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped
Altitude band: y 24–32
Altitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #22c55e · secondary #64748b · final #22c55e · 6 rings + altitude bar between gates 2–5

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Altitude canyon — avoid lit windows on distant building silhouettes.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 1 used drone_canyon (Sky Academy). This mode uses canyon_flight — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 1 of same robot
```

---

## Mode 3 — Thermal Signature Suppression

| | |
|---|---|
| **ID** | `steathjet_thermal_signature_suppression` |
| **Recipe** | `storm_cloud` → Target Dive |
| **Difficulty** | Easy |
| **Vista** | `radar_dome` |
| **Spline** | `dive_targets` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_thermal_signature_suppression
ROBOT:         steathjet · Mode 3/10 · Easy
DISPLAY NAME:  Thermal Signature Suppression
OBJECTIVE:     Stay cold on thermal sensors.
ARENA RECIPE:  storm_cloud (Target Dive)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe storm_cloud) ━━━
dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28
Altitude band: y 28–38 dive to 8 on targets
5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #22c55e · secondary #64748b · final #22c55e · 3 rings then 5 ground bullseyes (mixed mode)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm dive — stay in cold blue corridor between walls.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 2 used canyon_flight (Altitude Lock). This mode uses storm_cloud — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 2 of same robot
```

---

## Mode 4 — Shadow Formation Flight

| | |
|---|---|
| **ID** | `steathjet_shadow_formation_flight` |
| **Recipe** | `cloud_race` → Cloud Slalom |
| **Difficulty** | Medium |
| **Vista** | `radar_dome` |
| **Spline** | `figure8` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_shadow_formation_flight
ROBOT:         steathjet · Mode 4/10 · Medium
DISPLAY NAME:  Shadow Formation Flight
OBJECTIVE:     Fly formation without breaking stealth.
ARENA RECIPE:  cloud_race (Cloud Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe cloud_race) ━━━
figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course
Altitude band: y 20–30
Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #22c55e · secondary #64748b · final #22c55e · 8–10 rings at crossing points

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Figure-8 — 2 ghost jet silhouettes offset 20m (decorative).

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 3 used storm_cloud (Target Dive). This mode uses cloud_race — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 3 of same robot
```

---

## Mode 5 — Electronic Warfare Jamming

| | |
|---|---|
| **ID** | `steathjet_electronic_warfare_jamming` |
| **Recipe** | `space_orbit` → Vertical Ascent |
| **Difficulty** | Medium |
| **Vista** | `radar_dome` |
| **Spline** | `spiral_climb` · 130m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_electronic_warfare_jamming
ROBOT:         steathjet · Mode 5/10 · Medium
DISPLAY NAME:  Electronic Warfare Jamming
OBJECTIVE:     Jam enemy comms at waypoint.
ARENA RECIPE:  space_orbit (Vertical Ascent)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe space_orbit) ━━━
spiral_climb · 130m · climb +70 from y=8 · tightening radius
Altitude band: y 8 → 78 climb
Launch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #22c55e · secondary #64748b · final #22c55e · 10 rings on spiral — increasing height

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Spiral — jamming static particles at gates 4–6.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 4 used cloud_race (Cloud Slalom). This mode uses space_orbit — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 4 of same robot
```

---

## Mode 6 — High-Altitude Recon Photo

| | |
|---|---|
| **ID** | `steathjet_high_altitude_recon_photo` |
| **Recipe** | `flight_rings` → Rooftop Delivery |
| **Difficulty** | Medium |
| **Vista** | `radar_dome` |
| **Spline** | `rooftop_stops` · 195m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_high_altitude_recon_photo
ROBOT:         steathjet · Mode 6/10 · Medium
DISPLAY NAME:  High-Altitude Recon Photo
OBJECTIVE:     Photograph 6 targets from altitude.
ARENA RECIPE:  flight_rings (Rooftop Delivery)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe flight_rings) ━━━
rooftop_stops · 195m · 3 H-pad stops · y 26–34
Altitude band: y 18–34 (Rescue Drone: 12–22)
3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #22c55e · secondary #64748b · final #22c55e · 6 rings linking rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Rooftop photo columns over dark city grid below radar dome.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 5 used space_orbit (Vertical Ascent). This mode uses flight_rings — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 5 of same robot
```

---

## Mode 7 — Silent Glide Approach

| | |
|---|---|
| **ID** | `steathjet_silent_glide_approach` |
| **Recipe** | `jet_stunt` → Photo Sweep |
| **Difficulty** | Hard |
| **Vista** | `radar_dome` |
| **Spline** | `coast_arc` · 230m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_silent_glide_approach
ROBOT:         steathjet · Mode 7/10 · Hard
DISPLAY NAME:  Silent Glide Approach
OBJECTIVE:     Glide in with engines off.
ARENA RECIPE:  jet_stunt (Photo Sweep)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe jet_stunt) ━━━
coast_arc · 230m · y 18–28 · arcs over cliff edge
Altitude band: y 18–28
Coast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #22c55e · secondary #64748b · final #22c55e · 6 wide stunt rings, slight tilt 15°

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Coast arc silent — minimal emissive, glide slope 3°.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 6 used flight_rings (Rooftop Delivery). This mode uses jet_stunt — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 6 of same robot
```

---

## Mode 8 — Precision Missile Sniping

| | |
|---|---|
| **ID** | `steathjet_precision_missile_sniping` |
| **Recipe** | `rooftop_delivery` → Wind Tunnel |
| **Difficulty** | Hard |
| **Vista** | `radar_dome` |
| **Spline** | `wind_tunnel` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_precision_missile_sniping
ROBOT:         steathjet · Mode 8/10 · Hard
DISPLAY NAME:  Precision Missile Sniping
OBJECTIVE:     Single missile per target — no misses.
ARENA RECIPE:  rooftop_delivery (Wind Tunnel)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe rooftop_delivery) ━━━
wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts
Altitude band: y 22 locked
Purple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #22c55e · secondary #64748b · final #22c55e · 8 rings inside tunnel segment

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Wind tunnel — single red target at end inside tunnel.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 7 used jet_stunt (Photo Sweep). This mode uses rooftop_delivery — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 7 of same robot
```

---

## Mode 9 — EMP Bomb Drop

| | |
|---|---|
| **ID** | `steathjet_emp_bomb_drop` |
| **Recipe** | `typhoon` → Propeller Flip |
| **Difficulty** | Hard |
| **Vista** | `radar_dome` |
| **Spline** | `storm_eye` · 155m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_emp_bomb_drop
ROBOT:         steathjet · Mode 9/10 · Hard
DISPLAY NAME:  EMP Bomb Drop
OBJECTIVE:     EMP drop disables grid then escape.
ARENA RECIPE:  typhoon (Propeller Flip)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe typhoon) ━━━
storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24
Altitude band: y 22–26
Storm eye spline + rain + 1 tilted stunt ring at t=0.72

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #22c55e · secondary #64748b · final #22c55e · 7 rings + stunt ring (mixed)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm eye — EMP pulse ring flash at t=0.72.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 8 used rooftop_delivery (Wind Tunnel). This mode uses typhoon — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 8 of same robot
```

---

## Mode 10 🏆 CAPSTONE — Ghost Jet Master

| | |
|---|---|
| **ID** | `steathjet_ghost_jet_master` |
| **Recipe** | `warp_gate` → Sky Ace |
| **Difficulty** | Expert |
| **Vista** | `radar_dome` |
| **Spline** | `capstone_sections` · 280m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    steathjet_ghost_jet_master
ROBOT:         steathjet · Mode 10/10 · Expert
DISPLAY NAME:  Ghost Jet Master
OBJECTIVE:     Capstone stealth strike mission.
ARENA RECIPE:  warp_gate (Sky Ace)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #0f172a
mid:     #1e293b
horizon: #312e81
fog:     #1e293b
near/far: 80/260
goldenHour: NO
bloom: 0.2
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'radar_dome'
FlyingVistaLayer/radar_dome:
  · Half-sphere radar dome r=16 #334155
  · 40 star dots above y+40
  · Green radar mast — NO peach sunset

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: hangar_mouth
buildHangarMouth — dark jambs, red single runway light

━━━ 4. SPLINE / LAYOUT (recipe warp_gate) ━━━
capstone_sections · 280m · dive section t=0.65–0.8 · longest course
Altitude band: y 8–34 multi-section
Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
8 rings · primary #22c55e · secondary #64748b · final #22c55e · 8 rings (kid cap) spaced to t=0.90

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Capstone: hangar + radar + storm + warp. All emissive ≤0.5.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 9 used typhoon (Propeller Flip). This mode uses warp_gate — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis steathjet
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━




Peach sunset, bright golden hour, cloud playground




Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (radar_dome)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 9 of same robot
```

---


# Aero Stunt

**Identity:** Sunset airshow coast
**Vista code:** `coastline`
**Gate primary:** #fb923c · **secondary:** #f8fafc


## Mode 1 — Smoke Trail Loop-de-Loop

| | |
|---|---|
| **ID** | `aerobat_smoke_trail_loop_de_loop` |
| **Recipe** | `drone_canyon` → Sky Academy |
| **Difficulty** | Tutorial |
| **Vista** | `coastline` |
| **Spline** | `canyon_slalom` · 185m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_smoke_trail_loop_de_loop
ROBOT:         aerobat · Mode 1/10 · Tutorial
DISPLAY NAME:  Smoke Trail Loop-de-Loop
OBJECTIVE:     Complete loop leaving smoke trail.
ARENA RECIPE:  drone_canyon (Sky Academy)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe drone_canyon) ━━━
canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped
Altitude band: y 16–22
Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 6–8 numbered holo rings, tier forgiving, spacing 22–28m

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Tutorial: airshow banner + coast vista. Wide ring at loop apex t=0.35.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
First mode — establish chassis identity clearly.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode N/A of same robot
```

---

## Mode 2 — Barrel Roll Speed Slalom

| | |
|---|---|
| **ID** | `aerobat_barrel_roll_speed_slalom` |
| **Recipe** | `canyon_flight` → Altitude Lock |
| **Difficulty** | Easy |
| **Vista** | `coastline` |
| **Spline** | `canyon_slalom` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_barrel_roll_speed_slalom
ROBOT:         aerobat · Mode 2/10 · Easy
DISPLAY NAME:  Barrel Roll Speed Slalom
OBJECTIVE:     Barrel roll between slalom pylons.
ARENA RECIPE:  canyon_flight (Altitude Lock)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe canyon_flight) ━━━
canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped
Altitude band: y 24–32
Altitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 6 rings + altitude bar between gates 2–5

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Altitude canyon — rings tilted 30° alternating.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 1 used drone_canyon (Sky Academy). This mode uses canyon_flight — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 1 of same robot
```

---

## Mode 3 — Knife-Edge Flying

| | |
|---|---|
| **ID** | `aerobat_knife_edge_flying` |
| **Recipe** | `storm_cloud` → Target Dive |
| **Difficulty** | Easy |
| **Vista** | `coastline` |
| **Spline** | `dive_targets` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_knife_edge_flying
ROBOT:         aerobat · Mode 3/10 · Easy
DISPLAY NAME:  Knife-Edge Flying
OBJECTIVE:     Hold knife-edge through gate sequence.
ARENA RECIPE:  storm_cloud (Target Dive)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe storm_cloud) ━━━
dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28
Altitude band: y 28–38 dive to 8 on targets
5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 3 rings then 5 ground bullseyes (mixed mode)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm dive along cliff edge — knife-edge ring roll cue.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 2 used canyon_flight (Altitude Lock). This mode uses storm_cloud — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 2 of same robot
```

---

## Mode 4 — Air Show Formation Dance

| | |
|---|---|
| **ID** | `aerobat_air_show_formation_dance` |
| **Recipe** | `cloud_race` → Cloud Slalom |
| **Difficulty** | Medium |
| **Vista** | `coastline` |
| **Spline** | `figure8` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_air_show_formation_dance
ROBOT:         aerobat · Mode 4/10 · Medium
DISPLAY NAME:  Air Show Formation Dance
OBJECTIVE:     Mirror lead plane through formation.
ARENA RECIPE:  cloud_race (Cloud Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe cloud_race) ━━━
figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course
Altitude band: y 20–30
Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 8–10 rings at crossing points

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Figure-8 with 3 smoke torus rings (white, opacity 0.35).

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 3 used storm_cloud (Target Dive). This mode uses cloud_race — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 3 of same robot
```

---

## Mode 5 — Touch-and-Go Ribbon Snip

| | |
|---|---|
| **ID** | `aerobat_touch_and_go_ribbon_snip` |
| **Recipe** | `space_orbit` → Vertical Ascent |
| **Difficulty** | Medium |
| **Vista** | `coastline` |
| **Spline** | `spiral_climb` · 130m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_touch_and_go_ribbon_snip
ROBOT:         aerobat · Mode 5/10 · Medium
DISPLAY NAME:  Touch-and-Go Ribbon Snip
OBJECTIVE:     Clip ribbon with wing on low pass.
ARENA RECIPE:  space_orbit (Vertical Ascent)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe space_orbit) ━━━
spiral_climb · 130m · climb +70 from y=8 · tightening radius
Altitude band: y 8 → 78 climb
Launch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 10 rings on spiral — increasing height

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Spiral — orange ribbon banner gate to snip at t=0.5.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 4 used cloud_race (Cloud Slalom). This mode uses space_orbit — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 4 of same robot
```

---

## Mode 6 — Inverted Flying Sprint

| | |
|---|---|
| **ID** | `aerobat_inverted_flying_sprint` |
| **Recipe** | `flight_rings` → Rooftop Delivery |
| **Difficulty** | Medium |
| **Vista** | `coastline` |
| **Spline** | `rooftop_stops` · 195m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_inverted_flying_sprint
ROBOT:         aerobat · Mode 6/10 · Medium
DISPLAY NAME:  Inverted Flying Sprint
OBJECTIVE:     Inverted flight through cloud_race section.
ARENA RECIPE:  flight_rings (Rooftop Delivery)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe flight_rings) ━━━
rooftop_stops · 195m · 3 H-pad stops · y 26–34
Altitude band: y 18–34 (Rescue Drone: 12–22)
3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 6 rings linking rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Rooftop stops over coast — inverted rings upside-down torus.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 5 used space_orbit (Vertical Ascent). This mode uses flight_rings — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 5 of same robot
```

---

## Mode 7 — Hammerhead Turn Stunt

| | |
|---|---|
| **ID** | `aerobat_hammerhead_turn_stunt` |
| **Recipe** | `jet_stunt` → Photo Sweep |
| **Difficulty** | Hard |
| **Vista** | `coastline` |
| **Spline** | `coast_arc` · 230m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_hammerhead_turn_stunt
ROBOT:         aerobat · Mode 7/10 · Hard
DISPLAY NAME:  Hammerhead Turn Stunt
OBJECTIVE:     Hammerhead at stunt checkpoint.
ARENA RECIPE:  jet_stunt (Photo Sweep)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe jet_stunt) ━━━
coast_arc · 230m · y 18–28 · arcs over cliff edge
Altitude band: y 18–28
Coast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 6 wide stunt rings, slight tilt 15°

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Coast arc hammerhead — lighthouse at t=0.35, vertical climb ring.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 6 used flight_rings (Rooftop Delivery). This mode uses jet_stunt — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 6 of same robot
```

---

## Mode 8 — Pyrotechnic Night Flight

| | |
|---|---|
| **ID** | `aerobat_pyrotechnic_night_flight` |
| **Recipe** | `rooftop_delivery` → Wind Tunnel |
| **Difficulty** | Hard |
| **Vista** | `coastline` |
| **Spline** | `wind_tunnel` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_pyrotechnic_night_flight
ROBOT:         aerobat · Mode 8/10 · Hard
DISPLAY NAME:  Pyrotechnic Night Flight
OBJECTIVE:     Fly fireworks display path.
ARENA RECIPE:  rooftop_delivery (Wind Tunnel)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe rooftop_delivery) ━━━
wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts
Altitude band: y 22 locked
Purple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 8 rings inside tunnel segment

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Wind tunnel with firework particle bursts at gates 2/5/8.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 7 used jet_stunt (Photo Sweep). This mode uses rooftop_delivery — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 7 of same robot
```

---

## Mode 9 — Pylon Slalom Time Attack

| | |
|---|---|
| **ID** | `aerobat_pylon_slalom_time_attack` |
| **Recipe** | `typhoon` → Propeller Flip |
| **Difficulty** | Hard |
| **Vista** | `coastline` |
| **Spline** | `storm_eye` · 155m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_pylon_slalom_time_attack
ROBOT:         aerobat · Mode 9/10 · Hard
DISPLAY NAME:  Pylon Slalom Time Attack
OBJECTIVE:     Best time through pylon course.
ARENA RECIPE:  typhoon (Propeller Flip)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe typhoon) ━━━
storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24
Altitude band: y 22–26
Storm eye spline + rain + 1 tilted stunt ring at t=0.72

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 7 rings + stunt ring (mixed)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm eye slalom — red-white pylons between rings.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 8 used rooftop_delivery (Wind Tunnel). This mode uses typhoon — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 8 of same robot
```

---

## Mode 10 🏆 CAPSTONE — Red Bull Air Race Champion

| | |
|---|---|
| **ID** | `aerobat_red_bull_air_race_champion` |
| **Recipe** | `warp_gate` → Sky Ace |
| **Difficulty** | Expert |
| **Vista** | `coastline` |
| **Spline** | `capstone_sections` · 280m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    aerobat_red_bull_air_race_champion
ROBOT:         aerobat · Mode 10/10 · Expert
DISPLAY NAME:  Red Bull Air Race Champion
OBJECTIVE:     Capstone aerobatic championship.
ARENA RECIPE:  warp_gate (Sky Ace)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4a90d9
mid:     #ffaa55
horizon: #ffd966
fog:     #ffcc88
near/far: 100/320
goldenHour: YES
bloom: 0.23
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'coastline'
FlyingVistaLayer/coastline:
  · Sea plane + green cliff 280×36m
  · Lighthouse cylinder 14m at x=42
  · White smoke torus ring for stunts

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: airshow_banner
buildAirshowBanner — orange STUNT TEAM billboard 14×2.2m

━━━ 4. SPLINE / LAYOUT (recipe warp_gate) ━━━
capstone_sections · 280m · dive section t=0.65–0.8 · longest course
Altitude band: y 8–34 multi-section
Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
8 rings · primary #fb923c · secondary #f8fafc · final #22c55e · 8 rings (kid cap) spaced to t=0.90

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Capstone: banner + lighthouse + smoke rings + warp finish.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 9 used typhoon (Propeller Flip). This mode uses warp_gate — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis aerobat
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━





Neon FPV ribbon, radar dome, oil platform



Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (coastline)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 9 of same robot
```

---


# Racing Drone

**Identity:** FPV neon prism speedway
**Vista code:** `neon_ribbon`
**Gate primary:** #ec4899 · **secondary:** #06b6d4


## Mode 1 — FPV Drone Racing Circuit

| | |
|---|---|
| **ID** | `racedrone_fpv_drone_racing_circuit` |
| **Recipe** | `rainbow_road` → FPV Prism Circuit |
| **Difficulty** | Tutorial |
| **Vista** | `neon_ribbon` |
| **Spline** | `figure8` · 220m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_fpv_drone_racing_circuit
ROBOT:         racedrone · Mode 1/10 · Tutorial
DISPLAY NAME:  FPV Drone Racing Circuit
OBJECTIVE:     Rainbow Road ribbon race from FPV chase cam.
ARENA RECIPE:  rainbow_road (FPV Prism Circuit)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe rainbow_road) ━━━
figure8 · 220m · centerY 24 · amplitude 7 · crossing at mid-course
Altitude band: y 22–26
Neon race ribbon 6m wide under path — pink #ec4899 / cyan #06b6d4 / violet #a855f7. 0–1 boost pad.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 8 tight FPV rings

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Tutorial: neon gantry + rainbow ribbon 6m. 8 tight rings. NO grass.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
First mode — establish chassis identity clearly.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode N/A of same robot
```

---

## Mode 2 — Tunnel Turbo Dash

| | |
|---|---|
| **ID** | `racedrone_tunnel_turbo_dash` |
| **Recipe** | `drone_canyon` → Sky Academy |
| **Difficulty** | Easy |
| **Vista** | `neon_ribbon` |
| **Spline** | `canyon_slalom` · 185m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_tunnel_turbo_dash
ROBOT:         racedrone · Mode 2/10 · Easy
DISPLAY NAME:  Tunnel Turbo Dash
OBJECTIVE:     Burst through neon tunnel on Dragon Skyway.
ARENA RECIPE:  drone_canyon (Sky Academy)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe drone_canyon) ━━━
canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped
Altitude band: y 16–22
Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 6–8 numbered holo rings, tier forgiving, spacing 22–28m

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Warp tunnel purple/pink entire course. 0 boost pads mode 2.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 1 used rainbow_road (FPV Prism Circuit). This mode uses drone_canyon — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 1 of same robot
```

---

## Mode 3 — Gate Proximity Drift

| | |
|---|---|
| **ID** | `racedrone_gate_proximity_drift` |
| **Recipe** | `sunny_circuit` → Proximity Drift Circuit |
| **Difficulty** | Easy |
| **Vista** | `neon_ribbon` |
| **Spline** | `figure8` · 200m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_gate_proximity_drift
ROBOT:         racedrone · Mode 3/10 · Easy
DISPLAY NAME:  Gate Proximity Drift
OBJECTIVE:     Clip gate edges for drift bonus points.
ARENA RECIPE:  sunny_circuit (Proximity Drift Circuit)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe sunny_circuit) ━━━
figure8 · 200m · centerY 24 · amplitude 5 · crossing at mid-course
Altitude band: y 22–28
Figure-8 plasma lane (Hover Racer) or ribbon (if race) — drift corners banked 12°.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 10–12 rings on curves

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Sunny figure-8 — drift smoke puffs at apex corners.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 2 used drone_canyon (Sky Academy). This mode uses sunny_circuit — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 2 of same robot
```

---

## Mode 4 — Speed Trap Sky Burst

| | |
|---|---|
| **ID** | `racedrone_speed_trap_sky_burst` |
| **Recipe** | `cloud_race` → Cloud Slalom |
| **Difficulty** | Medium |
| **Vista** | `neon_ribbon` |
| **Spline** | `figure8` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_speed_trap_sky_burst
ROBOT:         racedrone · Mode 4/10 · Medium
DISPLAY NAME:  Speed Trap Sky Burst
OBJECTIVE:     Hit 6 speed traps on the cloud race line.
ARENA RECIPE:  cloud_race (Cloud Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe cloud_race) ━━━
figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course
Altitude band: y 20–30
Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 8–10 rings at crossing points

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Cloud race figure-8 but vista stays NEON RIBBON not clouds.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 3 used sunny_circuit (Proximity Drift Circuit). This mode uses cloud_race — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 3 of same robot
```

---

## Mode 5 — High-Speed Slalom

| | |
|---|---|
| **ID** | `racedrone_high_speed_slalom` |
| **Recipe** | `dragon_skyway` → Dragon Spine Slalom |
| **Difficulty** | Medium |
| **Vista** | `neon_ribbon` |
| **Spline** | `canyon_slalom` · 240m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_high_speed_slalom
ROBOT:         racedrone · Mode 5/10 · Medium
DISPLAY NAME:  High-Speed Slalom
OBJECTIVE:     Slalom floating rings at max throttle.
ARENA RECIPE:  dragon_skyway (Dragon Spine Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe dragon_skyway) ━━━
canyon_slalom · 240m · 28 pts · y 20–30 · lateral sine ×6 damped
Altitude band: y 20–30
Dragon-spine canyon slalom 240m + purple warp tunnel segment mid-course.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 12–16 rings, hard tier

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Dragon spine 240m + tunnel mid — ribbon orange/violet.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 4 used cloud_race (Cloud Slalom). This mode uses dragon_skyway — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 4 of same robot
```

---

## Mode 6 — Battery Drain Time Attack

| | |
|---|---|
| **ID** | `racedrone_battery_drain_time_attack` |
| **Recipe** | `flight_rings` → Rooftop Delivery |
| **Difficulty** | Medium |
| **Vista** | `neon_ribbon` |
| **Spline** | `rooftop_stops` · 195m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_battery_drain_time_attack
ROBOT:         racedrone · Mode 6/10 · Medium
DISPLAY NAME:  Battery Drain Time Attack
OBJECTIVE:     Finish before battery hits zero.
ARENA RECIPE:  flight_rings (Rooftop Delivery)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe flight_rings) ━━━
rooftop_stops · 195m · 3 H-pad stops · y 26–34
Altitude band: y 18–34 (Rescue Drone: 12–22)
3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 6 rings linking rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Rooftop skim — battery HUD drains; recharge pad cyan at gate 4.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 5 used dragon_skyway (Dragon Spine Slalom). This mode uses flight_rings — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 5 of same robot
```

---

## Mode 7 — Acrobatic Barrel Roll

| | |
|---|---|
| **ID** | `racedrone_acrobatic_barrel_roll` |
| **Recipe** | `volcano_drift` → Volcano Roll Run |
| **Difficulty** | Hard |
| **Vista** | `neon_ribbon` |
| **Spline** | `storm_eye` · 180m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_acrobatic_barrel_roll
ROBOT:         racedrone · Mode 7/10 · Hard
DISPLAY NAME:  Acrobatic Barrel Roll
OBJECTIVE:     Roll through the storm cloud gate.
ARENA RECIPE:  volcano_drift (Volcano Roll Run)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe volcano_drift) ━━━
storm_eye · 180m · wide outer ring then tight eye at t=0.65 · y≈22
Altitude band: y 20–26
Volcano cone + lava glow off-path right. Storm_eye spline with drift corners.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 7 rings + stunt ring

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Volcano drift storm eye — stunt ring tilted 60°.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 6 used flight_rings (Rooftop Delivery). This mode uses volcano_drift — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 6 of same robot
```

---

## Mode 8 — Ghost Drone Race

| | |
|---|---|
| **ID** | `racedrone_ghost_drone_race` |
| **Recipe** | `storm_cloud` → Target Dive |
| **Difficulty** | Hard |
| **Vista** | `neon_ribbon` |
| **Spline** | `dive_targets` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_ghost_drone_race
ROBOT:         racedrone · Mode 8/10 · Hard
DISPLAY NAME:  Ghost Drone Race
OBJECTIVE:     Beat your ghost lap on Volcano Drift.
ARENA RECIPE:  storm_cloud (Target Dive)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe storm_cloud) ━━━
dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28
Altitude band: y 28–38 dive to 8 on targets
5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 3 rings then 5 ground bullseyes (mixed mode)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm walls + translucent ghost drone 0.3 opacity ahead on spline.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 7 used volcano_drift (Volcano Roll Run). This mode uses storm_cloud — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 7 of same robot
```

---

## Mode 9 — Low-Altitude Lawn Mower

| | |
|---|---|
| **ID** | `racedrone_low_altitude_lawn_mower` |
| **Recipe** | `street_grand_prix` → Rooftop Skimmer |
| **Difficulty** | Hard |
| **Vista** | `neon_ribbon` |
| **Spline** | `rooftop_stops` · 200m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_low_altitude_lawn_mower
ROBOT:         racedrone · Mode 9/10 · Hard
DISPLAY NAME:  Low-Altitude Lawn Mower
OBJECTIVE:     Skim rooftop delivery route at 2m altitude.
ARENA RECIPE:  street_grand_prix (Rooftop Skimmer)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe street_grand_prix) ━━━
rooftop_stops · 200m · 4 H-pad stops · y 18–23
Altitude band: y 12–23
Low rooftop skim y 18–23. 4 building blocks + orange roof pads. Grey ribbon segments.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 6 rings between rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Street grand prix y 12–18 — rings almost touch rooftops.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 8 used storm_cloud (Target Dive). This mode uses street_grand_prix — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 8 of same robot
```

---

## Mode 10 🏆 CAPSTONE — Grand Sky Prix Champion

| | |
|---|---|
| **ID** | `racedrone_grand_sky_prix_champion` |
| **Recipe** | `warp_gate` → Sky Ace |
| **Difficulty** | Expert |
| **Vista** | `neon_ribbon` |
| **Spline** | `capstone_sections` · 280m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    racedrone_grand_sky_prix_champion
ROBOT:         racedrone · Mode 10/10 · Expert
DISPLAY NAME:  Grand Sky Prix Champion
OBJECTIVE:     Final: hybrid sky + Rainbow Road championship.
ARENA RECIPE:  warp_gate (Sky Ace)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #120428
mid:     #2a1058
horizon: #4c1d95
fog:     #1e1b4b
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'neon_ribbon'
FlyingVistaLayer/neon_ribbon:
  · 3 emissive ribbon segments #ec4899 under path (NOT grass)
  · Twilight void sky only

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: neon_gantry
buildNeonGantry — pink/cyan posts, countdown lights red/green

━━━ 4. SPLINE / LAYOUT (recipe warp_gate) ━━━
capstone_sections · 280m · dive section t=0.65–0.8 · longest course
Altitude band: y 8–34 multi-section
Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
8 rings · primary #ec4899 · secondary #06b6d4 · final #22c55e · 8 rings (kid cap) spaced to t=0.90

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Capstone: gantry + ribbon + tunnel + warp. Pink/cyan only.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 9 used street_grand_prix (Rooftop Skimmer). This mode uses warp_gate — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis racedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━






Grass islands, cloud castle, lighthouse, carrier


Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (neon_ribbon)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 9 of same robot
```

---


# Hover Racer

**Identity:** Plasma lane speedway
**Vista code:** `plasma_track`
**Gate primary:** #a855f7 · **secondary:** #22d3ee


## Mode 1 — Quantum Speedway Grand Prix

| | |
|---|---|
| **ID** | `hoverracer_quantum_speedway_grand_prix` |
| **Recipe** | `rainbow_road` → FPV Prism Circuit |
| **Difficulty** | Tutorial |
| **Vista** | `plasma_track` |
| **Spline** | `figure8` · 220m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_quantum_speedway_grand_prix
ROBOT:         hoverracer · Mode 1/10 · Tutorial
DISPLAY NAME:  Quantum Speedway Grand Prix
OBJECTIVE:     Rainbow Road lap 1 — plasma hover tires.
ARENA RECIPE:  rainbow_road (FPV Prism Circuit)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe rainbow_road) ━━━
figure8 · 220m · centerY 24 · amplitude 7 · crossing at mid-course
Altitude band: y 22–26
Neon race ribbon 6m wide under path — pink #ec4899 / cyan #06b6d4 / violet #a855f7. 0–1 boost pad.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 8 tight FPV rings

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Tutorial: warp gate arch + plasma lanes (NOT neon ribbon). Violet sky.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
First mode — establish chassis identity clearly.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode N/A of same robot
```

---

## Mode 2 — Mach 1 Speed Test

| | |
|---|---|
| **ID** | `hoverracer_mach_1_speed_test` |
| **Recipe** | `drone_canyon` → Sky Academy |
| **Difficulty** | Easy |
| **Vista** | `plasma_track` |
| **Spline** | `canyon_slalom` · 185m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_mach_1_speed_test
ROBOT:         hoverracer · Mode 2/10 · Easy
DISPLAY NAME:  Mach 1 Speed Test
OBJECTIVE:     Break speed record on sunny_circuit straight.
ARENA RECIPE:  drone_canyon (Sky Academy)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe drone_canyon) ━━━
canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped
Altitude band: y 16–22
Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 6–8 numbered holo rings, tier forgiving, spacing 22–28m

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Canyon slalom speed test — plasma underlay on straightaways.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 1 used rainbow_road (FPV Prism Circuit). This mode uses drone_canyon — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 1 of same robot
```

---

## Mode 3 — Plasma Drift Cornering

| | |
|---|---|
| **ID** | `hoverracer_plasma_drift_cornering` |
| **Recipe** | `sunny_circuit` → Proximity Drift Circuit |
| **Difficulty** | Easy |
| **Vista** | `plasma_track` |
| **Spline** | `figure8` · 200m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_plasma_drift_cornering
ROBOT:         hoverracer · Mode 3/10 · Easy
DISPLAY NAME:  Plasma Drift Cornering
OBJECTIVE:     Drift every corner on Dragon Skyway.
ARENA RECIPE:  sunny_circuit (Proximity Drift Circuit)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe sunny_circuit) ━━━
figure8 · 200m · centerY 24 · amplitude 5 · crossing at mid-course
Altitude band: y 22–28
Figure-8 plasma lane (Hover Racer) or ribbon (if race) — drift corners banked 12°.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 10–12 rings on curves

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Figure-8 sunny circuit — cyan recharge pads at apex.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 2 used drone_canyon (Sky Academy). This mode uses sunny_circuit — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 2 of same robot
```

---

## Mode 4 — Energy Pad Recharge

| | |
|---|---|
| **ID** | `hoverracer_energy_pad_recharge` |
| **Recipe** | `cloud_race` → Cloud Slalom |
| **Difficulty** | Medium |
| **Vista** | `plasma_track` |
| **Spline** | `figure8` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_energy_pad_recharge
ROBOT:         hoverracer · Mode 4/10 · Medium
DISPLAY NAME:  Energy Pad Recharge
OBJECTIVE:     Hit all recharge pads before battery empty.
ARENA RECIPE:  cloud_race (Cloud Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe cloud_race) ━━━
figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course
Altitude band: y 20–30
Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 8–10 rings at crossing points

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Cloud figure-8 — 3 pulsing recharge pads at corners.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 3 used sunny_circuit (Proximity Drift Circuit). This mode uses cloud_race — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 3 of same robot
```

---

## Mode 5 — Sonic Boom Slalom

| | |
|---|---|
| **ID** | `hoverracer_sonic_boom_slalom` |
| **Recipe** | `dragon_skyway` → Dragon Spine Slalom |
| **Difficulty** | Medium |
| **Vista** | `plasma_track` |
| **Spline** | `canyon_slalom` · 240m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_sonic_boom_slalom
ROBOT:         hoverracer · Mode 5/10 · Medium
DISPLAY NAME:  Sonic Boom Slalom
OBJECTIVE:     Slalom rings in storm_cloud corridor.
ARENA RECIPE:  dragon_skyway (Dragon Spine Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe dragon_skyway) ━━━
canyon_slalom · 240m · 28 pts · y 20–30 · lateral sine ×6 damped
Altitude band: y 20–30
Dragon-spine canyon slalom 240m + purple warp tunnel segment mid-course.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 12–16 rings, hard tier

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Dragon spine — sonic boom ring shockwave mesh at gate 8.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 4 used cloud_race (Cloud Slalom). This mode uses dragon_skyway — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 4 of same robot
```

---

## Mode 6 — Elimination Hover Sprint

| | |
|---|---|
| **ID** | `hoverracer_elimination_hover_sprint` |
| **Recipe** | `flight_rings` → Rooftop Delivery |
| **Difficulty** | Medium |
| **Vista** | `plasma_track` |
| **Spline** | `rooftop_stops` · 195m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_elimination_hover_sprint
ROBOT:         hoverracer · Mode 6/10 · Medium
DISPLAY NAME:  Elimination Hover Sprint
OBJECTIVE:     Stay ahead as last-place gates close.
ARENA RECIPE:  flight_rings (Rooftop Delivery)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe flight_rings) ━━━
rooftop_stops · 195m · 3 H-pad stops · y 26–34
Altitude band: y 18–34 (Rescue Drone: 12–22)
3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 6 rings linking rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Rooftop sprint — elimination gate closes (red) if slow.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 5 used dragon_skyway (Dragon Spine Slalom). This mode uses flight_rings — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 5 of same robot
```

---

## Mode 7 — Warp Tunnel Burst

| | |
|---|---|
| **ID** | `hoverracer_warp_tunnel_burst` |
| **Recipe** | `volcano_drift` → Volcano Roll Run |
| **Difficulty** | Hard |
| **Vista** | `plasma_track` |
| **Spline** | `storm_eye` · 180m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_warp_tunnel_burst
ROBOT:         hoverracer · Mode 7/10 · Hard
DISPLAY NAME:  Warp Tunnel Burst
OBJECTIVE:     Navigate warp_gate tunnel at max speed.
ARENA RECIPE:  volcano_drift (Volcano Roll Run)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe volcano_drift) ━━━
storm_eye · 180m · wide outer ring then tight eye at t=0.65 · y≈22
Altitude band: y 20–26
Volcano cone + lava glow off-path right. Storm_eye spline with drift corners.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 7 rings + stunt ring

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Volcano + purple tunnel burst at t=0.5.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 6 used flight_rings (Rooftop Delivery). This mode uses volcano_drift — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 6 of same robot
```

---

## Mode 8 — Mag-Strip Inversion

| | |
|---|---|
| **ID** | `hoverracer_mag_strip_inversion` |
| **Recipe** | `storm_cloud` → Target Dive |
| **Difficulty** | Hard |
| **Vista** | `plasma_track` |
| **Spline** | `dive_targets` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_mag_strip_inversion
ROBOT:         hoverracer · Mode 8/10 · Hard
DISPLAY NAME:  Mag-Strip Inversion
OBJECTIVE:     Complete inverted mag-strip section upside-down.
ARENA RECIPE:  storm_cloud (Target Dive)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe storm_cloud) ━━━
dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28
Altitude band: y 28–38 dive to 8 on targets
5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 3 rings then 5 ground bullseyes (mixed mode)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm walls — mag strip teal line flips hover 180° at gate 5.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 7 used volcano_drift (Volcano Roll Run). This mode uses storm_cloud — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 7 of same robot
```

---

## Mode 9 — Turbo Slipstream Chase

| | |
|---|---|
| **ID** | `hoverracer_turbo_slipstream_chase` |
| **Recipe** | `street_grand_prix` → Rooftop Skimmer |
| **Difficulty** | Hard |
| **Vista** | `plasma_track` |
| **Spline** | `rooftop_stops` · 200m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_turbo_slipstream_chase
ROBOT:         hoverracer · Mode 9/10 · Hard
DISPLAY NAME:  Turbo Slipstream Chase
OBJECTIVE:     Draft behind ghost racer then overtake.
ARENA RECIPE:  street_grand_prix (Rooftop Skimmer)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe street_grand_prix) ━━━
rooftop_stops · 200m · 4 H-pad stops · y 18–23
Altitude band: y 12–23
Low rooftop skim y 18–23. 4 building blocks + orange roof pads. Grey ribbon segments.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 6 rings between rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Street skim chase — lead racer silhouette purple.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 8 used storm_cloud (Target Dive). This mode uses street_grand_prix — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 8 of same robot
```

---

## Mode 10 🏆 CAPSTONE — Galactic Turbo Champion

| | |
|---|---|
| **ID** | `hoverracer_galactic_turbo_champion` |
| **Recipe** | `warp_gate` → Sky Ace |
| **Difficulty** | Expert |
| **Vista** | `plasma_track` |
| **Spline** | `capstone_sections` · 280m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    hoverracer_galactic_turbo_champion
ROBOT:         hoverracer · Mode 10/10 · Expert
DISPLAY NAME:  Galactic Turbo Champion
OBJECTIVE:     Championship on street_grand_prix finale.
ARENA RECIPE:  warp_gate (Sky Ace)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #4c1d95
mid:     #6b21a8
horizon: #7c3aed
fog:     #4c1d95
near/far: 70/240
goldenHour: NO
bloom: 0.24
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'plasma_track'
FlyingVistaLayer/plasma_track:
  · 4 violet lane segments #a855f7 + cyan recharge pads #22d3ee
  · Distinct from Racing Drone ribbon geometry

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: warp_gate_arch
buildWarpGateArch — purple half-torus portal

━━━ 4. SPLINE / LAYOUT (recipe warp_gate) ━━━
capstone_sections · 280m · dive section t=0.65–0.8 · longest course
Altitude band: y 8–34 multi-section
Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
8 rings · primary #a855f7 · secondary #22d3ee · final #22c55e · 8 rings (kid cap) spaced to t=0.90

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Capstone: warp arch + plasma lanes + volcano + cathedral.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 9 used street_grand_prix (Rooftop Skimmer). This mode uses warp_gate — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis hoverracer
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━







Pink neon ribbon (Racing Drone asset), grass islands

Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (plasma_track)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 9 of same robot
```

---


# Rescue Drone

**Identity:** Hero over disaster
**Vista code:** `disaster_city`
**Gate primary:** #f97316 · **secondary:** #22c55e


## Mode 1 — Disaster Zone Search

| | |
|---|---|
| **ID** | `rescuedrone_disaster_zone_search` |
| **Recipe** | `drone_canyon` → Sky Academy |
| **Difficulty** | Tutorial |
| **Vista** | `disaster_city` |
| **Spline** | `canyon_slalom` · 185m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_disaster_zone_search
ROBOT:         rescuedrone · Mode 1/10 · Tutorial
DISPLAY NAME:  Disaster Zone Search
OBJECTIVE:     Scan rubble for 5 survivor heat signatures.
ARENA RECIPE:  drone_canyon (Sky Academy)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe drone_canyon) ━━━
canyon_slalom · 185m · 16 pts · y 14–22 · lateral sine ×6 damped
Altitude band: y 16–22
Open sky tutorial — no storm walls. Optional 6 parallax cloud puffs if chassis parallaxClouds=true.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 6–8 numbered holo rings, tier forgiving, spacing 22–28m

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Tutorial: emergency HQ spawn. Low fly y=14–20. Green survivor markers ×3.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
First mode — establish chassis identity clearly.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode N/A of same robot
```

---

## Mode 2 — Emergency First Aid Drop

| | |
|---|---|
| **ID** | `rescuedrone_emergency_first_aid_drop` |
| **Recipe** | `canyon_flight` → Altitude Lock |
| **Difficulty** | Easy |
| **Vista** | `disaster_city` |
| **Spline** | `canyon_slalom` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_emergency_first_aid_drop
ROBOT:         rescuedrone · Mode 2/10 · Easy
DISPLAY NAME:  Emergency First Aid Drop
OBJECTIVE:     Drop medkits on survivors in burning district.
ARENA RECIPE:  canyon_flight (Altitude Lock)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe canyon_flight) ━━━
canyon_slalom · 210m · 18 pts · y 24–32 · lateral sine ×6 damped
Altitude band: y 24–32
Altitude-lock HUD band (green zone). Canyon walls visual only — stay 40m above floor.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 6 rings + altitude bar between gates 2–5

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Altitude lock over rubble — medkit drop zone on pad gate 3.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 1 used drone_canyon (Sky Academy). This mode uses canyon_flight — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 1 of same robot
```

---

## Mode 3 — Flood Zone Evacuation Tag

| | |
|---|---|
| **ID** | `rescuedrone_flood_zone_evacuation_tag` |
| **Recipe** | `storm_cloud` → Target Dive |
| **Difficulty** | Easy |
| **Vista** | `disaster_city` |
| **Spline** | `dive_targets` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_flood_zone_evacuation_tag
ROBOT:         rescuedrone · Mode 3/10 · Easy
DISPLAY NAME:  Flood Zone Evacuation Tag
OBJECTIVE:     Tag evacuees on rooftops in flooded city.
ARENA RECIPE:  storm_cloud (Target Dive)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe storm_cloud) ━━━
dive_targets · 175m · 5 dive arcs · start y=38 pull-up before y=28
Altitude band: y 28–38 dive to 8 on targets
5 grey storm_wall boxes flanking path (installFlyingModeScenery). Rain particles, keep rings emissive.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 3 rings then 5 ground bullseyes (mixed mode)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm over flooded city — blue water plane raised y=floorY+2.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 2 used canyon_flight (Altitude Lock). This mode uses storm_cloud — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 2 of same robot
```

---

## Mode 4 — Thermal Heat Signature Spotting

| | |
|---|---|
| **ID** | `rescuedrone_thermal_heat_signature_spotting` |
| **Recipe** | `cloud_race` → Cloud Slalom |
| **Difficulty** | Medium |
| **Vista** | `disaster_city` |
| **Spline** | `figure8` · 210m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_thermal_heat_signature_spotting
ROBOT:         rescuedrone · Mode 4/10 · Medium
DISPLAY NAME:  Thermal Heat Signature Spotting
OBJECTIVE:     Find hidden victims using thermal cam.
ARENA RECIPE:  cloud_race (Cloud Slalom)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe cloud_race) ━━━
figure8 · 210m · centerY 26 · amplitude 12 · crossing at mid-course
Altitude band: y 20–30
Figure-8 crossing — cloud_pillars optional for Drone only. NO grass islands for non-cloud chassis.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 8–10 rings at crossing points

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Figure-8 — orange thermal columns through rubble.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 3 used storm_cloud (Target Dive). This mode uses cloud_race — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 3 of same robot
```

---

## Mode 5 — Avalanche Beacon Sweep

| | |
|---|---|
| **ID** | `rescuedrone_avalanche_beacon_sweep` |
| **Recipe** | `space_orbit` → Vertical Ascent |
| **Difficulty** | Medium |
| **Vista** | `disaster_city` |
| **Spline** | `spiral_climb` · 130m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_avalanche_beacon_sweep
ROBOT:         rescuedrone · Mode 5/10 · Medium
DISPLAY NAME:  Avalanche Beacon Sweep
OBJECTIVE:     Locate beacons under snow_rescue terrain.
ARENA RECIPE:  space_orbit (Vertical Ascent)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe space_orbit) ━━━
spiral_climb · 130m · climb +70 from y=8 · tightening radius
Altitude band: y 8 → 78 climb
Launch tower 55m at spawn + flame cone. Starfield dots. Warp torus at t=0.92.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 10 rings on spiral — increasing height

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Spiral climb — yellow beacon poles on ruins.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 4 used cloud_race (Cloud Slalom). This mode uses space_orbit — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 4 of same robot
```

---

## Mode 6 — Rope Lifeline Deploy

| | |
|---|---|
| **ID** | `rescuedrone_rope_lifeline_deploy` |
| **Recipe** | `flight_rings` → Rooftop Delivery |
| **Difficulty** | Medium |
| **Vista** | `disaster_city` |
| **Spline** | `rooftop_stops` · 195m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_rope_lifeline_deploy
ROBOT:         rescuedrone · Mode 6/10 · Medium
DISPLAY NAME:  Rope Lifeline Deploy
OBJECTIVE:     Deploy rope to stranded bot on cliff edge.
ARENA RECIPE:  flight_rings (Rooftop Delivery)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe flight_rings) ━━━
rooftop_stops · 195m · 3 H-pad stops · y 26–34
Altitude band: y 18–34 (Rescue Drone: 12–22)
3 rooftop helipads (yellow H) as mandatory stops. City blocks below vista layer.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 6 rings linking rooftops

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
3 rooftop stops — rope line mesh to street below each.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 5 used space_orbit (Vertical Ascent). This mode uses flight_rings — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 5 of same robot
```

---

## Mode 7 — Hurricane Wind Rescue

| | |
|---|---|
| **ID** | `rescuedrone_hurricane_wind_rescue` |
| **Recipe** | `jet_stunt` → Photo Sweep |
| **Difficulty** | Hard |
| **Vista** | `disaster_city` |
| **Spline** | `coast_arc` · 230m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_hurricane_wind_rescue
ROBOT:         rescuedrone · Mode 7/10 · Hard
DISPLAY NAME:  Hurricane Wind Rescue
OBJECTIVE:     Hover stable in typhoon corridor to rescue.
ARENA RECIPE:  jet_stunt (Photo Sweep)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe jet_stunt) ━━━
coast_arc · 230m · y 18–28 · arcs over cliff edge
Altitude band: y 18–28
Coast_arc spline — lighthouse prop on vista (Aero Stunt) or photo columns A/B/C.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 6 wide stunt rings, slight tilt 15°

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Coast recipe dressed as disaster — storm eye over city rubble.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 6 used flight_rings (Rooftop Delivery). This mode uses jet_stunt — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 6 of same robot
```

---

## Mode 8 — Night Searchlight Recon

| | |
|---|---|
| **ID** | `rescuedrone_night_searchlight_recon` |
| **Recipe** | `rooftop_delivery` → Wind Tunnel |
| **Difficulty** | Hard |
| **Vista** | `disaster_city` |
| **Spline** | `wind_tunnel` · 175m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_night_searchlight_recon
ROBOT:         rescuedrone · Mode 8/10 · Hard
DISPLAY NAME:  Night Searchlight Recon
OBJECTIVE:     Light and find targets in dark hospital zone.
ARENA RECIPE:  rooftop_delivery (Wind Tunnel)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe rooftop_delivery) ━━━
wind_tunnel · 175m · locked y≈22 · narrow 10m corridor · 2 turbine masts
Altitude band: y 22 locked
Purple/cyan warp tunnel tube along spline. 2 wind turbine masts at t=0.35/0.55.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 8 rings inside tunnel segment

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Wind tunnel — sweeping searchlight cone on ruins.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 7 used jet_stunt (Photo Sweep). This mode uses rooftop_delivery — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 7 of same robot
```

---

## Mode 9 — Hazardous Gas Sampling

| | |
|---|---|
| **ID** | `rescuedrone_hazardous_gas_sampling` |
| **Recipe** | `typhoon` → Propeller Flip |
| **Difficulty** | Hard |
| **Vista** | `disaster_city` |
| **Spline** | `storm_eye` · 155m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_hazardous_gas_sampling
ROBOT:         rescuedrone · Mode 9/10 · Hard
DISPLAY NAME:  Hazardous Gas Sampling
OBJECTIVE:     Collect air samples without entering red zones.
ARENA RECIPE:  typhoon (Propeller Flip)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe typhoon) ━━━
storm_eye · 155m · wide outer ring then tight eye at t=0.65 · y≈24
Altitude band: y 22–26
Storm eye spline + rain + 1 tilted stunt ring at t=0.72

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
6–8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 7 rings + stunt ring (mixed)

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Storm eye — green gas cloud mesh (transparent) avoid center.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 8 used rooftop_delivery (Wind Tunnel). This mode uses typhoon — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 8 of same robot
```

---

## Mode 10 🏆 CAPSTONE — Hero Rescue Medal

| | |
|---|---|
| **ID** | `rescuedrone_hero_rescue_medal` |
| **Recipe** | `warp_gate` → Sky Ace |
| **Difficulty** | Expert |
| **Vista** | `disaster_city` |
| **Spline** | `capstone_sections` · 280m |

```
Build ByteBuddies FLYING mission — EXACT SPEC
═══════════════════════════════════════════════════
MISSION ID:    rescuedrone_hero_rescue_medal
ROBOT:         rescuedrone · Mode 10/10 · Expert
DISPLAY NAME:  Hero Rescue Medal
OBJECTIVE:     Capstone multi-victim rescue mission.
ARENA RECIPE:  warp_gate (Sky Ace)
SPEC VERSION:  2026-09-07-flying-90-v216
═══════════════════════════════════════════════════

━━━ 1. SKY (chassis-locked — IGNORE recipe.sky) ━━━
top:     #fed7aa
mid:     #fdba74
horizon: #ffedd5
fog:     #ffedd5
near/far: 90/280
goldenHour: NO
bloom: 0.21
parallaxClouds: NO

━━━ 2. VISTA LAYER (installFlyingVistaLayer) ━━━
aerialVista: 'disaster_city'
FlyingVistaLayer/disaster_city:
  · 5 ruin blocks varied height + orange rooftop rescue pad
  · Smoke-haze fog — flight y 12–22 ONLY

━━━ 3. SPAWN LANDMARK (installFlyingSpawnLandmark) ━━━
spawnKind: emergency_hq
buildEmergencyHq — rooftop slab, green medkit, orange beacon pole

━━━ 4. SPLINE / LAYOUT (recipe warp_gate) ━━━
capstone_sections · 280m · dive section t=0.65–0.8 · longest course
Altitude band: y 8–34 multi-section
Capstone: launch flare + storm segment + warp cathedral torus at end. Starfield.

━━━ 5. GATES (buildPremiumHoloRing + placeAerialGates) ━━━
8 rings · primary #f97316 · secondary #22c55e · final #22c55e · 8 rings (kid cap) spaced to t=0.90

━━━ 6. MISSION-SPECIFIC DRESSING ━━━
Capstone: HQ + flood + beacon + warp. Orange/green gates only.

━━━ 7. DIFFERS FROM PREVIOUS MODE ━━━
Mode 9 used typhoon (Propeller Flip). This mode uses warp_gate — spline shape, midground, and gate count MUST change.

━━━ 8. CODE CALL ORDER ━━━
buildAerialWorld(scene, challenge)
  → clearFlyingArenaLayers(scene)
  → getFlyingArenaContract(challenge)  // chassis rescuedrone
  → applyFlyingRecipeContract(recipe, contract)  // strips recipe sky/islands
  → installPremiumAerialScenery()  // sky ONLY for flyers
  → installFlyingChassisSetPiece(scene, contract)  // large beside-path set piece
  → installFlyingArenaIdentity()
      → installFlyingSpawnLandmark()
      → installFlyingVistaLayer()
      → installFlyingModeScenery()  // storm/tunnel/launch per recipe
      → installFlyingMissionDressing()  // per-mission props from FLYING_MISSION_FEATURES
  → placeAerialGates(scene, curve, recipe)  // gateStyle = chassisId


━━━ 9. BANNED (instant fail QA) ━━━








Playful clouds, cloud whale, carrier, neon race
Do NOT scatter citadel GLTF islands on any flyer except none.

━━━ 10. SCREENSHOT QA ━━━
□ Sky fills 65–75% of frame with chassis palette above
□ Vista layer identifiable in 3 seconds (disaster_city)
□ Robot ≈28% screen height
□ Gates readable — numbered sprites visible
□ Looks different from other 8 flyers at same mode index
□ Looks different from mode 9 of same robot
```

---


*Generated 90 mission specs · 2026-09-08 · FULL PROMPT*
