# BYTEBUDDIES — FLYING ARENA PREMIUM QUALITY MASTER PROMPT
## Upgrade ALL 90 flying missions to reference screenshot fidelity

> **Reference:** `Advanced Hover Altitude: Ring Challenge` — sunset cyber-city, volumetric clouds, neon-green floating platforms, gold stacked obstacles, cyan **hexagonal** holo rings with numbered sprites, metallic quadcopter with cyan rotor LEDs, full mission HUD (title bar, gauges, objectives panel, bottom status).
>
> **Scope:** 9 flyers × 10 missions = **90 arenas**. Same premium tier everywhere. Each must look like a **different game**, not a colour filter.
>
> **Companion docs:**
> - `docs/bytebuddies-flying-arena-FULL-PROMPT.md` — per-mission build blocks (90 specs)
> - `docs/bytebuddies-flying-arena-prompts.md` — missions-only shorthand
>
> **Repo path:**
> `bytebuddies1-claude-bold-dewdney-73f401/src/virtual-robot-designer/studio/aerial-world/`

---

# COPY-PASTE PROMPT — GIVE YOUR AGENT THE ENTIRE BLOCK BELOW

```
═══════════════════════════════════════════════════════════════════════════════
BYTEBUDDIES — FLYING ARENA PREMIUM UPGRADE (90 MISSIONS)
═══════════════════════════════════════════════════════════════════════════════

You are a senior game-environment engineer upgrading ByteBuddies flying arenas.

YOUR JOB: Make every one of the 90 flying missions look as polished as the
reference screenshot "Advanced Hover Altitude: Ring Challenge" — AND make
each mission visually distinct from the other 89.

YOU HAVE FULL AUTONOMY TO CHOOSE THE BEST IMPLEMENTATION METHOD for each
visual layer. Use whatever combination of approaches produces the highest
quality result fastest and most maintainably. Do not lock yourself into one
technique if another works better for a given prop, sky, or effect.

═══════════════════════════════════════════════════════════════════════════════
SECTION 0 — METHOD SELECTION (USE THE BEST TOOL FOR EACH JOB)
═══════════════════════════════════════════════════════════════════════════════

For EACH visual layer, evaluate and pick the best approach. Mix methods freely.

┌─────────────────────┬──────────────────────────────────────────────────────┐
│ LAYER               │ CHOOSE BEST METHOD                                   │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Sky / atmosphere    │ A) installGoldenHourSky (warm sunset reference)      │
│                     │ B) installThemedAerialSky (storm/starfield/neon)     │
│                     │ C) Shader sky dome if gradients need more depth      │
│                     │ D) HDRI only if repo already has matching preset     │
│                     │ → Pick per RECIPE (mode), not per robot bible alone  │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Clouds / parallax   │ A) addParallaxCloudLayers (billboard puff stacks)    │
│                     │ B) Instanced sphere clusters along spline              │
│                     │ C) Particle cloud fields for storm modes             │
│                     │ → Use A for golden-hour; C for typhoon/storm         │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Distant vista       │ A) installFlyingVistaLayer (procedural planes/mesh)  │
│ (city/ocean/etc.)   │ B) GLTF skyline from public/assets if available      │
│                     │ C) Layered silhouette boxes + emissive window strips │
│                     │ → Prefer C for performance + stylized look; B if     │
│                     │   asset exists and loads fast; never tiny y=-42 props│
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Mode hero set piece │ A) FlyingModeArenaKit procedural geometry (PRIMARY)  │
│ (modes 1–10)        │ B) FlyingDroneModeKit for drone-specific heroes      │
│                     │ C) placeAerialHero for one iconic spawn landmark     │
│                     │ D) GLTF prop if mission spec names one               │
│                     │ → A/B for all modes; scale LARGE beside flight path  │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Path-side dressing  │ A) FlyingMissionDressing feature switch              │
│                     │ B) installFlyingModeScenery recipe flags             │
│                     │ C) installAerialDifficulty (rain, pads, hazards)     │
│                     │ D) Inline geometry in mode arena if dressing too weak│
│                     │ → Use D when dressing is label-only — replace with   │
│                     │   real meshes (bullseyes, tunnels, turbines)         │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Holo rings / gates  │ A) buildPremiumHoloRing (reference torus stack)      │
│                     │ B) buildGateForChassis (per-robot shape)             │
│                     │ C) Custom ExtrudeGeometry for hex/square/arch        │
│                     │ D) CanvasTexture numbered sprites (always)           │
│                     │ → Reference uses HEX rings: use C for hoverbot/hex,    │
│                     │   B for chassis identity, A as default premium       │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Flyer appearance    │ A) Existing robot GLTF/mesh + emissive child lights  │
│                     │ B) Add rotor LED torus rings in code if missing        │
│                     │ C) Post-process rim via bloom (not geometry)           │
│                     │ → A+B; target robotScreenFraction 0.28               │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Post / bloom        │ A) scene.userData.raceVisual bloom 0.22–0.36         │
│                     │ B) installPremiumSkyLighting                         │
│                     │ C) Emissive intensity on hero props (preferred)      │
│                     │ → Combine A+C; emissive drives the "neon game" read  │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Mission HUD         │ A) Wire existing LiveLab mission UI components       │
│                     │ B) Extend aerial HUD overlay if partial              │
│                     │ C) Build minimal React/HTML panel matching reference │
│                     │ → Use whatever exists in repo; do not ship without   │
│                     │   title + objectives + speed/battery gauges          │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Splines / layout    │ A) buildSplineFromRecipe(recipeId)                   │
│                     │ B) applyModeSplineVariation / applyDroneModeSpline     │
│                     │ C) applyAerialMissionRoute offsets if needed           │
│                     │ → A always; B always for flying; different recipe =   │
│                     │   different path shape per mode                      │
└─────────────────────┴──────────────────────────────────────────────────────┘

DECISION RULE: If two methods produce similar quality, prefer:
  1. Existing repo kits (FlyingModeArenaKit, AerialRingGateKit, PremiumKidArenaKit)
  2. Procedural THREE.js (fast iteration, no asset dependency)
  3. GLTF only when asset is already bundled and clearly higher fidelity
  4. Never ship placeholder text labels without geometry behind them

If the current code path is wired but produces weak visuals, FIX THE OUTPUT
(enlarge, add emissive, add geometry) — do not only add comments.

═══════════════════════════════════════════════════════════════════════════════
SECTION 1 — REFERENCE FRAME FORENSICS (WHAT "PREMIUM" MEANS)
═══════════════════════════════════════════════════════════════════════════════

Study the reference as a composition checklist. Every flying mission must
score ≥8/10 on each row.

1.1 SKY (top 65–75% of frame)
──────────────────────────────
- Gradient: deep blue/indigo zenith → warm orange/gold at horizon.
  Approx: top #1e3a5f or #3478b8, mid #87b9d6, horizon #ff9a4a / #ffd39a.
- Clouds: 4–8 volumetric puff clusters, white/cream, lit from below (sunset).
- NOT acceptable: flat single hex sky, untextured background color only.
- Fog: near 90–125, far 280–380, fog color matches horizon (warm peach or cool blue).
- Storm modes: replace with grey #3b4a6b top, rain particles, NO golden hour.

1.2 VISTA / CITY / ENVIRONMENT (lower 35–45% of frame)
──────────────────────────────────────────────────────
- Reference: dense cyber-city skyline, 30–50m tower silhouettes.
- Cyan/teal vertical neon strips (#06b6d4, #22d3ee) on building faces.
- Buildings are READABLE at gameplay speed — not 2m cubes at z=-200.
- Placement: along flight heading, 40–120m below/at side of spline samples.
- Each flyer swaps vista THEME but keeps this DENSITY:
    Drone       → cloud banks + cyan torus arch (not city)
    Helicopter  → ocean plane + 4 oil rigs with helipads
    Hover Bot   → 3 floating lab pads + plasma bridges
    Jet Plane   → carrier deck 110m + grass spawn island + huts
    Stealth Jet → radar dome r=16 + 40 stars + green sweep cone
    Aero Stunt  → sea + green cliff + lighthouse 14m
    Racing Drone→ twilight void + pink/cyan ribbon segments
    Hover Racer → purple void + violet lanes + cyan recharge pads
    Rescue Drone→ 5 ruin blocks + orange rescue pads + smoke haze

1.3 FLOATING PLATFORMS & OBSTACLES (mid-ground heroes)
────────────────────────────────────────────────────────
- Reference: bright neon-green platform slab (~14×14×0.6m) beside path.
- Gold/white stacked cylinders (coins/cones) on platform — kid-readable goal props.
- Minimum 2 platform clusters visible in any screenshot at mission start.
- Emissive edge strip on platform top (#22c55e emissive 0.3–0.5).
- Offset from spline: 18–32m lateral, y within ±6m of local flight height.

1.4 HOLO RINGS / GATES (primary gameplay read)
──────────────────────────────────────────────
- Reference: HEXAGONAL cyan holographic rings, not plain tori.
- Structure: outer metal frame + inner cyan emissive torus + gold rim accent.
- Holographic inner disc (additive, opacity 0.08–0.15).
- NUMBERED SPRITE above each gate: dark circle + white number + optional arrow.
  Scale ~3.4 × 1.25 world units, always billboard to camera.
- Gate 1 visible within 8–12m of spawn on mode 1.
- Spacing: tutorial 22–28m; standard 18–24m; hard 14–18m.
- Per-chassis SHAPE (colour from bible):
    drone       → round premium holo torus
    helicopter  → square yellow/blue arch
    hoverbot    → hex repulsor ring (closest to reference hex)
    jetplane    → premium holo torus (military blue/red)
    steathjet   → thin wireframe HUD ring
    aerobat     → wide stunt ring (tilt-capable)
    racedrone   → tight FPV square neon gate
    hoverracer  → tight FPV plasma gate
    rescuedrone → wide orange/green rescue arch
- Mode 2: green transparent altitude band plane inside rings 2–5.

1.5 FLYER (screen presence)
───────────────────────────
- Occupies ~28% of frame height (robotScreenFraction: 0.28).
- Metallic silver/grey body, PBR metalness 0.3–0.6.
- Cyan (or chassis accent) emissive rings on rotor guards / engines.
- castShadow + receiveShadow enabled.
- Camera: third-person chase — camBack 9.2, camUp 4.4, lookAhead 16, FOV 48°.

1.6 MISSION HUD (must match reference integration)
────────────────────────────────────────────────────
- Top center: mission title white sans-serif on dark translucent bar.
  e.g. "Advanced Hover Altitude: Ring Challenge"
- Top-left: semi-circular battery gauge (100%) + digital speed (0.0 m/s).
- Right panel (dark glass, rounded):
    • Current Level: Mission N
    • Objectives checklist (Maintain altitude, Fly through N rings, etc.)
    • Score: 0 / 25
    • Buttons: Restart, Change Camera View, View Full Code, Simulation Settings
- Bottom bar: battery icon, coins, speed icons with values.
- HUD must work for ALL 90 missions with dynamic title/objectives from challenge data.

1.7 LIGHTING & POST
───────────────────
- installPremiumSkyLighting after sky install.
- Bloom: 0.22–0.36 (0.36 for neon/race modes), threshold ~0.88, radius ~0.18.
- Warm rim from horizon direction on metal surfaces.
- EmissiveIntensity on rings: 0.5–0.85 (reference reads bright/neon).
- Night/stealth: cap emissive at 0.5, stars additive.

═══════════════════════════════════════════════════════════════════════════════
SECTION 2 — DIFFERENTIATION (90 UNIQUE, SAME QUALITY TIER)
═══════════════════════════════════════════════════════════════════════════════

2.1 ACROSS 9 FLYERS — "shape not colour"
────────────────────────────────────────
Kids must tell robots apart in <3 seconds from SILHOUETTE + VISTA + SKY.
Gate colour alone is NOT enough.

| chassisId   | aerialVista     | sky top  | spawnKind          | gate geometry      |
|-------------|-----------------|----------|--------------------|--------------------|
| drone       | cloud_sea       | #e87830  | sky_academy_arch   | round holo torus   |
| helicopter  | ocean_platforms | #38bdf8  | offshore_platform  | square arch        |
| hoverbot    | floating_labs   | #e0e7ff  | repulsor_gate      | hex ring (≈ref)    |
| jetplane    | carrier_deck    | #3478b8  | spawn_sky_island   | premium holo torus   |
| steathjet   | radar_dome      | #0f172a  | hangar_mouth       | wireframe HUD      |
| aerobat     | coastline       | #4a90d9  | airshow_banner     | wide stunt ring    |
| racedrone   | neon_ribbon     | #120428  | neon_gantry        | tight FPV square   |
| hoverracer  | plasma_track    | #4c1d95  | warp_gate_arch     | tight FPV plasma   |
| rescuedrone | disaster_city   | #fed7aa  | emergency_hq       | wide rescue arch   |

2.2 WITHIN 1 FLYER — modes 1–10 must look like different games
──────────────────────────────────────────────────────────────
Same robot, different recipe → different SPLINE + SET PIECE + ATMOSPHERE.

| Mode | recipeId           | Hero set piece (FlyingModeArenaKit)     | Atmosphere method        |
|------|--------------------|-----------------------------------------|--------------------------|
| 1    | drone_canyon       | tutorial arch + slalom cloud pillars    | goldenHour + parallax    |
| 2    | canyon_flight      | green altitude walls + platforms        | altitude HUD band mesh   |
| 3    | storm_cloud        | storm walls + floor dive bullseyes      | themed storm sky + rain  |
| 4    | cloud_race         | figure-8 torus bridge + orbit buddies   | cloud pillars midground  |
| 5    | space_orbit        | launch tower + spiral climb rings       | starfield + launch flame |
| 6    | flight_rings       | rooftop blocks + yellow helipads        | city pad vista           |
| 7    | jet_stunt          | photo monoliths A/B/C + tilt ring       | coast/stunt sky          |
| 8    | rooftop_delivery   | wind megatunnel + spinning turbines     | tube geometry + windZones|
| 9    | typhoon            | storm eye torus + tilted stunt ring     | rain + storm vortex      |
| 10   | warp_gate          | capstone storm walls + warp cathedral   | storm + warp torus fin   |

Racing flyers (racedrone, hoverracer) mode recipes:
  1 rainbow_road, 2 drone_canyon, 3 sunny_circuit, 4 cloud_race, 5 dragon_skyway,
  6 flight_rings, 7 volcano_drift, 8 storm_cloud, 9 street_grand_prix, 10 warp_gate
→ Same quality bar; neon ribbon / plasma / volcano / dragon tunnel heroes.

2.3 BANNED (instant fail)
─────────────────────────
- Same vista + same set piece for all 10 modes of one robot
- Golden hour sky on storm_cloud / typhoon / warp_gate modes
- Citadel GLTF island scatter on flyers
- Text-only mission dressing (labels without geometry)
- Rings that are only colour-swapped tori with no shape change across chassis
- Props smaller than 8m at path side (invisible at reference camera)
- Skipping clearFlyingArenaLayers on mission switch (stale mode 1 geometry)

═══════════════════════════════════════════════════════════════════════════════
SECTION 3 — BUILD PIPELINE (WIRE EVERY STEP)
═══════════════════════════════════════════════════════════════════════════════

Entry: buildSmartArena → buildFlightRingsArena → buildAerialWorld

EXACT CALL ORDER (implement or verify all links):
```
buildAerialWorld(scene, challenge, robotConfig)
  1.  clearFlyingArenaLayers(scene)                    // kill stale groups
  2.  flyingContract = getFlyingArenaContract(...)     // chassis + mode + mission
  3.  baseRecipe = getAerialRecipe(mission.recipeId)
  4.  recipe = applyFlyingRecipeContract(baseRecipe, flyingContract)
  5.  recipe = applyModeRecipeFlags(recipe, flyingContract)  // storm/rain/launch flags
  6.  curve = buildSplineFromRecipe(recipe)
  7.  applyModeSplineVariation(curve, flyingContract)  // per-mode path shape
  8.  installPremiumAerialScenery(scene, curve, recipe, bounds, trackId, dna)
        // recipe.goldenHour ? goldenHourSky : themedSky(storm/starfield)
  9.  installFlyingChassisSetPiece → installFlyingModeArena  // LARGE mode heroes
  10. installFlyingArenaIdentity
        → installFlyingSpawnLandmark
        → installFlyingVistaLayer          // distant themed backdrop
        → installFlyingModeScenery         // storm walls, tunnel, launch tower
        → installFlyingMissionDressing     // feature props; REPLACE label-only
  11. installAerialDifficulty(scene, curve, recipe, challenge)  // rain/hazards/pads
  12. buildMidground(scene, curve, recipe)           // cloud pillars (skip dup tunnel)
  13. buildRaceRibbon if recipe.raceRibbon
  14. placeAerialGates(scene, curve, recipe)         // buildGateForChassis + sprites
  15. installAerialReferenceVista — JET PLANE ONLY
  16. syncFlyingCheckpoints
  17. scene.fog from recipe.sky (not bible-only on storm modes)
  18. scene.userData.raceVisual.bloom from bible/recipe
```

finalizeMissionArenaVisuals MUST return early when aerialWorldBuilt / skipMissionWorld.

KEY FILES (edit as needed — create new kits if cleaner):
  AerialWorldKit.js           — orchestrator; wire difficulty + midground for flying
  FlyingModeArenaKit.js       — per-recipe hero geometry ALL flyers
  FlyingDroneModeKit.js       — drone-specific 10 mode heroes
  FlyingChassisSetPiece.js    — wrapper → installFlyingModeArena
  FlyingArenaKit.js           — vista, spawn, recipe contract, mode scenery
  FlyingArenaSpec.js          — FLYER_VISUAL_BIBLES, getFlyingArenaContract
  FlyingMissionSpecs.js       — 90 mission data (generated)
  FlyingMissionDressing.js    — path props; upgrade weak features to meshes
  AerialRingGateKit.js        — buildPremiumHoloRing, buildGateForChassis, sprites
  AerialSkyKit.js             — installGoldenHourSky, installThemedAerialSky
  PremiumKidArenaKit.js       — flying sky branch uses recipe.goldenHour not bible only
  AerialDifficultyKit.js      — rain, hazards, hover pads, section beacons, vortex
  AerialCourseRecipes.js      — spline kinds, storm flags, sky per recipe

═══════════════════════════════════════════════════════════════════════════════
SECTION 4 — IMPLEMENTATION PLAYBOOK (BY LAYER)
═══════════════════════════════════════════════════════════════════════════════

4.1 SKY — pick method per mode recipe
─────────────────────────────────────
IF recipeId IN (storm_cloud, typhoon, volcano_drift):
  USE installThemedAerialSky + recipe.sky from AerialCourseRecipes
  SET goldenHour=false, parallaxClouds=false
  ADD rain via installAerialDifficulty
  METHOD B preferred

IF recipeId IN (space_orbit, warp_gate, dragon_skyway, rainbow_road):
  USE dark starfield / neon void sky from recipe
  ADD star dots (PointsMaterial) + launch/warp torus
  METHOD B + particle stars

IF recipeId IN (drone_canyon, canyon_flight, jet_stunt) AND bible.goldenHour:
  USE installGoldenHourSky with warmPeach for cloud_sea / carrier_deck
  ADD addParallaxCloudLayers when recipe.parallaxClouds
  METHOD A

ELSE:
  USE installThemedAerialSky with bible.sky as base tint
  METHOD B with bible palette

4.2 VISTA — pick method per aerialVista
───────────────────────────────────────
PREFERRED: installFlyingVistaLayer procedural meshes (already themed per vista).
ENHANCE if weak: increase building height 2–3×, add emissive window strips every 4m.
IF public/assets has skyline GLTF matching vista: optional enrich via AerialGltfEnrichKit.
NEVER: single 420×420 plane with flat color as only vista (reference needs depth).

4.3 MODE HERO — pick method per mode
────────────────────────────────────
PRIMARY: FlyingModeArenaKit.buildRecipeArena(recipeId) — switch on recipe.
DRONE: FlyingDroneModeKit.installDroneModeArena (10 bespoke layouts).
IF hero still weak after kit: add 2–4 more meshes in switch case (scale up 1.5×).
IF mission needs iconic spawn: placeAerialHero ONCE at t=0.08 (don't duplicate arch 3×).

4.4 GATES — pick method per chassisId
─────────────────────────────────────
DEFAULT premium: buildPremiumHoloRing(majorR, primary, secondary)
CHASSIS override: buildGateForChassis(chassisId, radius, cyan, gold)
  hoverbot → hexagonal extrude (closest to reference screenshot)
  helicopter → BoxGeometry arch
  steathjet → thin torus wireframe emissive 0.5 cap
NUMBERING: makeNumberSprite(n) on every gate — non-optional.
TILT: aerobat mode 9, racedrone mode 7 — rotate ring mesh 30–60°.

4.5 MATERIALS — always PBR + emissive on heroes
───────────────────────────────────────────────
USE pbrMat / flyingMat from BiomeAAAKit + FlyingArenaMaterialKit.
Hero props: metalness 0.1–0.45, roughness 0.28–0.72, emi 0.35–0.85 on accents.
Holo/transparency: opacity 0.12–0.65, depthWrite false, AdditiveBlending on discs.
AVOID MeshBasicMaterial except holo discs and sprites.

4.6 HUD — use best available UI path
────────────────────────────────────
SEARCH repo for: mission title overlay, aerial HUD, LiveLab panel, challenge.desc.
WIRE challenge.name, modeIndex, gate count, altitude limits to visible UI.
If partial: extend existing component rather than building duplicate HUD.
Reference layout is the TARGET regardless of implementation (React/DOM/canvas).

4.7 PERFORMANCE BUDGET (don't sacrifice look)
─────────────────────────────────────────────
Target: 60fps on mid-tier laptop integrated GPU.
- Instancing for repeated windows/stars OK
- TubeGeometry tunnels: 48–64 segments max
- Particle rain: 140–200 points
- Avoid duplicate tunnels (check ModeWindTunnel / DragonTunnel names before adding)
- clearFlyingArenaLayers on every buildAerialWorld

═══════════════════════════════════════════════════════════════════════════════
SECTION 5 — PER-ROBOT QUALITY TARGETS (ALL 10 MODES EACH)
═══════════════════════════════════════════════════════════════════════════════

DRONE — "Friendly cloud playground" (closest to reference aesthetic)
  m1 peach sunset + cyan arch + slalom pillars + parallax clouds
  m2 green altitude corridor walls
  m3 grey storm + dive bullseyes + rain
  m4 figure-8 cloud bridge + buddy drones
  m5 launch tower flame + spiral rings + stars
  m6 sky blocks + helipads + drop zone
  m7 photo columns A/B/C
  m8 teal wind megatunnel + turbines
  m9 storm eye + tilt stunt ring
  m10 capstone storm + purple warp cathedral

HELICOPTER — "Ocean worker"
  m1–m10: ocean vista CONSTANT; mode heroes CHANGE (rigs, cargo, fire, medevac…)
  Gates: yellow/blue square arches; spawn offshore platform with H pad

HOVER BOT — "Zero-G lab" (reference hex rings live here)
  m1–m10: floating lab pads vista; hex repulsor gates; violet/cyan palette
  m8 plasma tunnel; m9 chasm between pads

JET PLANE — "Supersonic ace" (previous quality bar)
  ALL modes: grass spawn island + mechanical huts + carrier deck vista
  m1 supersonic dogfight = gold standard for scale

STEALTH JET — "Night ops"
  m1–m10: black star sky + radar dome; green wireframe rings; minimal bloom

AERO STUNT — "Sunset airshow"
  m1–m10: coast + lighthouse; orange stunt rings; smoke rings mode 4

RACING DRONE — "FPV neon"
  m1 rainbow ribbon floor; m5 dragon spine+tunnel; m7 volcano; tight square gates

HOVER RACER — "Plasma speedway"
  m1 plasma underlay; purple lanes; warp bursts; FPV plasma gates

RESCUE DRONE — "Hero over disaster"
  m1–m10: rubble city haze; orange/green rescue arches; LOW flight y=12–22 only

═══════════════════════════════════════════════════════════════════════════════
SECTION 6 — WORKFLOW FOR THE AGENT
═══════════════════════════════════════════════════════════════════════════════

STEP 1 — Audit current output
  Run game, screenshot modes 1/3/5 for Drone + Helicopter + Jet.
  Compare to reference image side-by-side.

STEP 2 — Fix pipeline gaps first
  Verify installAerialDifficulty + buildMidground + applyModeRecipeFlags wired.
  Verify clearFlyingArenaLayers clears all named groups.
  Verify PremiumKidArenaKit uses recipe.goldenHour not bible.goldenHour only.

STEP 3 — Scale pass
  Double size of any path-side prop < 10m until reference match.
  Vista towers ≥ 25m tall.

STEP 4 — Material pass
  Add emissive to every hero prop; enable bloom 0.24+.

STEP 5 — Gate pass
  Numbered sprites on all gates; chassis-specific geometry.

STEP 6 — Mode differentiation pass
  Fly modes 1→2→3 same robot: confirm set piece + sky + spline all change.

STEP 7 — Cross-robot pass
  Fly mode 1 all 9 robots: confirm vista + gate shape unique.

STEP 8 — HUD pass
  All missions show title, objectives, gauges.

STEP 9 — Verify
  node scripts/verify-flying-arena-identity.mjs
  Regenerate prompts: node scripts/generate-flying-arena-prompts.mjs

STEP 10 — Document what you changed
  List files touched + before/after screenshot notes.

═══════════════════════════════════════════════════════════════════════════════
SECTION 7 — SCREENSHOT QA CHECKLIST (EVERY MISSION)
═══════════════════════════════════════════════════════════════════════════════

COMPOSITION (reference match):
  □ Sky gradient depth — not flat
  □ Clouds or stars visible in upper frame
  □ Vista/environment readable in lower third within 3 seconds
  □ ≥2 large platforms or mode hero props beside path
  □ ≥1 gate with bloom + number sprite visible at start
  □ Flyer ~28% frame height, metallic, emissive accents
  □ HUD: title + objectives + speed/battery

DIFFERENTIATION:
  □ Different from previous mode (same robot): set piece OR sky OR spline
  □ Different from same mode (other robot): vista + gate shape

TECHNICAL:
  □ Hard refresh — no ghost geometry from prior mission
  □ 60fps acceptable
  □ No console errors from FlyingMissionDressing

PAIR TESTS (must pass visually):
  Helicopter m1 vs Jet m1
  Drone m1 vs Drone m3 (golden vs storm)
  Hover Bot m1 vs reference screenshot (hex rings + premium sky)
  Racing Drone m1 vs Hover Racer m1
  Rescue m1 vs Drone m1

═══════════════════════════════════════════════════════════════════════════════
SECTION 8 — ANTI-PATTERNS (DO NOT SHIP)
═══════════════════════════════════════════════════════════════════════════════

✗ Colour-filtering mode 1 and calling it 10 missions
✗ Tiny vista props at y=-42 invisible from camera
✗ One holo torus for all chassis with only hex color changed
✗ goldenHour sky on storm_cloud / typhoon missions
✗ installFlyingVistaLayer duplicating same arch as spawn + set piece (pick one hero)
✗ Label-only dressing ("DIVE · PULL UP" text with no bullseye meshes)
✗ Skipping numbered gate sprites
✗ Skipping bloom on emissive rings
✗ citadel GLTF islands on non-jet flyers
✗ applyFlyingRecipeContract stripping all recipe atmosphere permanently

═══════════════════════════════════════════════════════════════════════════════
SECTION 9 — SUCCESS DEFINITION
═══════════════════════════════════════════════════════════════════════════════

DONE when:
  1. Any random screenshot from any of 90 missions could sit beside the reference
     image and look like the same game studio made both.
  2. A kid can name the robot from vista silhouette in <3 seconds.
  3. A kid can name the mode number from set piece + weather in <5 seconds.
  4. verify-flying-arena-identity.mjs passes.
  5. No mission reuses another mission's hero layout unchanged.

Use whichever code path, kit, procedural mesh, GLTF, shader, or UI component
gets you to that bar fastest — quality of the screenshot is the only metric.

SPEC VERSION: 2026-09-07-flying-90-v216
COMPANION: docs/bytebuddies-flying-arena-FULL-PROMPT.md (90 mission blocks)
```

---

# APPENDIX A — REFERENCE PIXEL-LEVEL BREAKDOWN

| Screen region | What reference shows | Minimum spec to match |
|---------------|---------------------|------------------------|
| Top 15% | Title bar on dark glass | Mission name centered, white 18–22px equiv |
| Top-left 10% | Battery arc + speed digital | Two compact gauges, always visible |
| Upper 50% | Sky gradient + clouds | 3-stop gradient + ≥4 cloud puffs |
| Mid 30% | Flyer + gates + platforms | 28% flyer, 1 gate ahead, 1 platform side |
| Lower 25% | City skyline neon | ≥6 buildings with light strips |
| Right 25% | Mission panel | Level, 3+ objectives, score, 4 buttons |
| Bottom 8% | Status icons | Battery, coins, speed |

---

# APPENDIX B — EXISTING CODE HOOKS (START HERE)

| Need | Function | File |
|------|----------|------|
| Premium holo ring | `buildPremiumHoloRing(majorR, cyan, gold)` | AerialRingGateKit.js |
| Chassis gate shape | `buildGateForChassis(style, radius, cyan, gold)` | AerialRingGateKit.js |
| Gate numbers | `makeNumberSprite(n)` | AerialRingGateKit.js |
| Golden sunset sky | `installGoldenHourSky(scene, bounds, sky)` | AerialSkyKit.js |
| Storm/star sky | `installThemedAerialSky(scene, recipe, bounds)` | AerialSkyKit.js |
| Parallax clouds | `addParallaxCloudLayers(scene, cx, cz)` | AerialSkyKit.js |
| Mode heroes | `installFlyingModeArena(scene, curve, contract, root)` | FlyingModeArenaKit.js |
| Recipe flags | `applyModeRecipeFlags(recipe, contract)` | FlyingModeArenaKit.js |
| Spline variation | `applyModeSplineVariation(curve, contract)` | FlyingModeArenaKit.js |
| Vista backdrop | `installFlyingVistaLayer(scene, bounds, contract, curve)` | FlyingArenaKit.js |
| Rain/hazards | `installAerialDifficulty(scene, curve, recipe, challenge)` | AerialDifficultyKit.js |
| PBR material | `pbrMat(color, { emissive, emi, metalness, roughness })` | BiomeAAAKit.js |
| Flying PBR | `flyingMat(preset, opts)` | FlyingArenaMaterialKit.js |
| Contract | `getFlyingArenaContract(challenge, robotConfig)` | FlyingArenaSpec.js |

---

# APPENDIX C — WHEN TO CREATE NEW FILES

Create a new kit file ONLY if cleaner than extending existing:

| Situation | Action |
|-----------|--------|
| One robot needs 10 bespoke heroes | `Flying{Robot}ModeKit.js` (like FlyingDroneModeKit) |
| New gate shape for one chassis | Extend `buildGateForChassis` switch |
| New recipe atmosphere | Add to `RECIPE_SCENE_FLAGS` in FlyingModeArenaKit |
| New mission prop type | Add case to FlyingMissionDressing feature switch |
| HUD missing entirely | Extend LiveLab aerial overlay component |

Prefer extending existing kits over new abstractions.

---

*ByteBuddies flying arena premium quality master prompt · reference: Advanced Hover Altitude Ring Challenge · 90 missions · agent may use best method per layer*
