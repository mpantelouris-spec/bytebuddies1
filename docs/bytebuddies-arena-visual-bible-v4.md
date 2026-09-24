# BYTEBUDDIES — ARENA VISUAL BIBLE v4
## Mega prompt · Pixar / Nintendo quality · every arena different · every arena on-brand for its robot

> **Purpose:** This document is the single source of truth for artists, level builders, and AI codegen.
> Give any mission block to a builder and they should produce the same quality as the **High-Altitude Sky Arena / Supersonic Dogfight** reference:
> floating grass islands, orange mechanical huts, golden-hour sky, premium holo rings, warm bloom, readable HUD.
>
> **Scope:** 33 chassis × 10 missions = **330 missions** (rover, scout, footballbot use separate kart/football pipelines).
> **Synced from:** `chassis-game-modes.js`, `CHASSIS_VISUAL_DNA`, `PremiumKidArenaKit.js`
> **Version:** 2026-09-06-v4

---

# PART 0 — MASTER QUALITY CONTRACT

## 0.1 Reference quality bar (non-negotiable)

The shipped look must match **MK8 / Sky Garden / Cloud Citadel** tier:

| Layer | Requirement |
|-------|-------------|
| **Sky** | Gradient dome or golden hour — never flat single hex. 60–75% of frame is sky/atmosphere. |
| **Ground** | **Shaped** geometry per robot (furrows, tunnel walls, stud mat, checker tile) — not a palette-swapped plane. |
| **Hero props** | 3–4 chunky meshes with PBR + emissive accents. Named landmarks kids remember. |
| **Checkpoints** | Premium holo rings (aerial) or flags/arches (ground) — emissive, numbered, bloom threshold ≤0.9. |
| **Depth** | At least 2 depth layers: play path + midground offset islands/silhouettes + far vista. |
| **Lighting** | Directional sun + hemisphere fill; shadows on; emissive props glow. |
| **Post** | Bloom 0.14–0.24, subtle grade — warm highlights, not grey realism. |
| **Robot scale** | Robot occupies **25–35%** of screen height on iPad landscape. |
| **Clarity** | 3-second kid test: Where am I? What do I do? What looks cool? |

## 0.2 The #1 failure mode (banned)

**Palette swaps on the same layout** — e.g. eight ground robots sharing grey industrial floor, or eight flyers sharing identical ring slalom with only hue changed.

**Fix:** Every robot has locked `CHASSIS_VISUAL_DNA.floorKind` + unique skyline + unique signature prop.

## 0.3 Prop budget (kid clarity)

| Budget item | Limit |
|-------------|-------|
| Hero landmarks | 1 |
| Teaching props (objective-specific) | 1 |
| Checkpoint markers | 2–3 |
| Goal | 1 |
| **Total chunky props** | **≤ 4** |
| Side scatter along route | **0** (use `skipMissionScatter`) |
| Floating islands (aerial) | 3 citadel + 1 spawn + silhouettes (distant) |

## 0.4 Pipeline map (engineers)

```
buildSmartArena()
  ├─ ground robots → buildKidClarityBaseArena() + buildChassisFloor(floorKind)
  │                  → buildMissionWorld() → installPremiumGroundScenery()
  ├─ sky robots    → buildAerialWorld() → installPremiumAerialScenery()
  ├─ combat        → buildFightingArena() per chassis (Tank=desert yard, Striker=ring, …)
  └─ flappy        → flappy side-scroll kit
```

## 0.5 Prompt template (copy for any new mission)

```
Build ByteBuddies mission arena for [ROBOT] mode [N]: "[MISSION NAME]".
Quality: Pixar/Nintendo kid game, ages 6–11, tablet landscape.
Robot DNA: floor=[floorKind], sky=[surroundings], signature=[signatureProp].
Arena layout: [unique path description from this bible].
Props (max 4): [list].
NEVER: grey void, industrial floor for non-factory robots, clutter scatter, wrong robot identity.
Implementation: PremiumKidArenaKit + MissionKidClarity v4.
```

## 0.6 MEGA PROMPT — paste this, then add one mission block from Part 2

```
You are a senior environment artist on a Nintendo-quality kids' robot game (ages 6–11, iPad landscape).

REFERENCE SHOT (quality bar): High-Altitude Sky Arena — golden-hour gradient sky filling 70% of frame; chunky grass floating islands with rocky undersides; orange mechanical huts on metal pillars; premium cyan/gold holographic checkpoint rings with numbered sprites; warm directional sun, soft bloom 0.22; robot fills 30% of screen; glassmorphism HUD is separate — focus on 3D world.

DESIGN PILLARS:
1. IDENTITY FIRST — floor SHAPE and skyline identify the robot, not hue alone.
2. READABILITY — max 4 chunky props; 60–75% empty sky/ceiling; goal visible from spawn.
3. DEPTH — play path + offset midground + far silhouettes (never flat void).
4. JUICE — emissive checkpoints, dust/splash/bubbles on contact, celebratory goal pulse.
5. NO CLUTTER — zero CodeRacer side scatter; no props every 8–12m.

BANNED FOREVER:
- Flat grey 180×180 plane with only color changed
- Eight robots sharing "industrial" floor
- Eight flyers sharing identical ring slalom
- Tank missions in boxing ring
- Underwater text on sky missions

TECH STACK (ByteBuddies):
- Robot DNA: CHASSIS_VISUAL_DNA[chassisId] in MissionKidClarity.js
- Ground: buildChassisFloor(floorKind) + installPremiumGroundScenery()
- Sky: installPremiumAerialScenery() + buildPremiumHoloRing() + enrichAerialFloatingIslands()
- Combat: per-chassis FightingArena (tank=desert yard, striker=boxing ring, …)

For each mission output:
1. THE ARENA — unique layout geometry (not generic "path with checkpoints")
2. SURROUNDINGS — sky/vista specific to THIS robot
3. KEY PROPS — exactly 3–4 named meshes
4. LIGHTING & POST — key/fill/bloom values
5. NEVER — mission-specific anti-patterns
6. MOOD — one sentence kid emotion

Now build: [PASTE MISSION BLOCK FROM PART 2 BELOW]
```

## 0.7 Game developer — mode progression (modes 1→10)

| Modes | Visual complexity | Teaching |
|-------|-------------------|----------|
| 1–2 Tutorial/Easy | Simplest path; 1 hero landmark; 2 checkpoints | One new mechanic |
| 3–5 Medium | Introduce hazard shape (mud, laser, ring gap) | Combine 2 mechanics |
| 6–8 Hard | Longer path; secondary landmark offset | Timing + precision |
| 9 Expert | Near-capstone; darker mood or weather | Mastery check |
| 10 Capstone | Best props from modes 1–9 in ONE zone; still ≤4 props | "I am the champion of this robot" |

Capstone rule: **denser emotion, not denser props** — one epic vista, not ten new objects.

## 0.8 Aerial robot differentiation (do not clone Drone layout)

| Robot | Vista below | Ring accent | Spawn island feature |
|-------|-------------|-------------|---------------------|
| Drone | Cloud sea | Cyan + gold | Cloud castle arch |
| Helicopter | Ocean + oil rigs | Yellow + blue | Helipad H marking |
| Jet Plane | Carrier deck | Blue + red | Target drone silhouette |
| Stealth Jet | Radar dome night | Green stealth | Hangar opening |
| Aero Stunt | Coastline sunset | Orange + white | Lighthouse |
| Racing Drone | Neon ribbon twilight | Pink + cyan | Turbo tunnel |
| Hover Racer | Plasma track purple | Violet + cyan | Energy recharge pad |
| Hover Bot | Floating lab platforms | Purple + teal | Repulsor gate |
| Rescue Drone | Disaster rubble (low fly) | Orange + green | Survivor marker |

## 0.9 Ground robot differentiation (do not clone Factory floor)

| Robot | You must see | You must NOT see |
|-------|--------------|------------------|
| Crawler | Red Mars dirt, mesa | Grey concrete |
| Farm Bot | Soil furrows, barn | Factory yellow stripe |
| Mining Bot | Tunnel walls, amber lights | Open blue sky |
| Security Bot | Asphalt patrol line, fence | Farm crops |
| Med Bot | Checker tiles, cross signs | Street fire |
| Fire Bot | Wet street, fire glow | Hospital white |
| LEGO Bot | Stud bumps on yellow mat | Realistic asphalt |
| Spider Bot | Vertical wall holds | Flat desert |

---

# PART 1 — ENVIRONMENT FAMILIES (shared rules, NOT shared geometry)

Families control **physics & camera** only. **Floor shape comes from robot DNA**, not family.

| Family | Robots | Camera | Floor rule |
|--------|--------|--------|------------|
| martian | Crawler | rover_wide | Rust dirt + mesa — not lunar grey |
| industrial | Factory, Arm, LEGO, Droid, Mech | factory_* | Only Factory/Arm/LEGO use their DNA floors |
| underwater | Sub, Deep Sea | underwater_follow | Sandy reef vs abyss rock |
| emergency | Fire, Med, Rescue | chase_close | Street / hospital / rubble — distinct |
| sky_aerial | Drone, Heli, Jet, Hover, Aero, Stealth Jet | aerial_chase | Unique aerialVista per robot |
| hybrid_race_sky | Race Drone, Hover Racer | race_chase | Neon ribbon vs plasma track |
| cyber_ninja | Stealth, Ninja | stealth_follow | Rooftop vs temple tiles |
| spider_climber | Spider | climber_follow | Vertical shaft walls |
| boxing_mech | Tank*, Battle, Striker, Blaster, Berserker | combat_cam | *Tank uses desert yard not ring |
| flappy | Bird Bot | side_scroll | Scrolling hills + pipes |
| sandbox | Custom | rover_wide | School mat grid |

---

# PART 2 — PER-ROBOT CHAPTERS & ALL MISSIONS


# 🌿 CRAWLER — Robot Visual Bible

## Kid fantasy hook
NASA kid rover conquering Mars hills

## This robot is NOT
grey factory floor, boxing ring, underwater coral

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `martian_dirt` — Mars red-dirt hills |
| **Sky / atmosphere** | Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete. |
| **Path material** | Wide rust-dirt track with soft ruts, no neon glow |
| **Signature landmark** | NASA-style flag or mesa summit |
| **Camera** | `rover_wide` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.crawler` + `buildChassisFloor('martian_dirt')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Crawler)
NASA-style flag or mesa summit; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Rocky Mountain Climb

| | |
|---|---|
| **Mission ID** | `crawler_rocky_mountain_climb` |
| **Arena code** | `alien_planet` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Climb Martian rock steps where wheels would spin out.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Stepped incline path rising 4–8m with 3 wide terraces; each terrace is a full platform (not a thin ramp).

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Summit flag on top terrace
2. 2 mid-slope checkpoint flags
3. Dust puff particles on climb

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('martian_dirt')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Mud Puddle Traction Test

| | |
|---|---|
| **Mission ID** | `crawler_mud_puddle_traction_test` |
| **Arena code** | `desert_rally` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Cross slippery red dust basins without losing traction.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Straight path with 3 wide brown mud basins (3m each); splash VFX on contact.

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Mud splash particles
2. Traction warning signs
3. Green finish arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('martian_dirt')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Log Bridge Crossing

| | |
|---|---|
| **Mission ID** | `crawler_log_bridge_crossing` |
| **Arena code** | `space_corridor` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Crawl a narrow bridge over a crater gap — don't fall.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Narrow wooden bridge section (4m wide) over visible gap; guard ropes on sides.

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rope bridge with plank texture
2. 1 support post per side
3. Finish flag on far bank

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('martian_dirt')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Boulder Field Crawl

| | |
|---|---|
| **Mission ID** | `crawler_boulder_field_crawl` |
| **Arena code** | `lava_canyon` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Pick a path through scattered boulders to the drill site.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Zigzag between 4 large boulder silhouettes (collision); path stays 5m wide.

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 4 rounded boulder props (background only)
2. Orange hazard cones
3. Checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('martian_dirt')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Trench Explorer

| | |
|---|---|
| **Mission ID** | `crawler_trench_explorer` |
| **Arena code** | `alien_planet` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Descend into a mining trench and return with soil samples.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('martian_dirt')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Sand Dune Drift

| | |
|---|---|
| **Mission ID** | `crawler_sand_dune_drift` |
| **Arena code** | `rough` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Traverse shifting dunes on low-gravity Mars.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. NASA-style flag or mesa summit
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('martian_dirt')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Earthquake Hazard Trial

| | |
|---|---|
| **Mission ID** | `crawler_earthquake_hazard_trial` |
| **Arena code** | `space_orbit` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Cross ground that shakes — pause when sensors detect tremors.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. NASA-style flag or mesa summit
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('martian_dirt')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Heavy Incline Hold

| | |
|---|---|
| **Mission ID** | `crawler_heavy_incline_hold` |
| **Arena code** | `desert_rally` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Stop and hold position on a 40° slope without sliding back.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Stepped incline path rising 4–8m with 3 wide terraces; each terrace is a full platform (not a thin ramp).

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Summit flag on top terrace
2. 2 mid-slope checkpoint flags
3. Dust puff particles on climb

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('martian_dirt')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Wilderness Search Patrol

| | |
|---|---|
| **Mission ID** | `crawler_wilderness_search_patrol` |
| **Arena code** | `crystal_caverns` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Scan 6 anomaly markers across the crater rim.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — All-Terrain Master

| | |
|---|---|
| **Mission ID** | `crawler_all_terrain_master` |
| **Arena code** | `warp_gate` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone: full Martian circuit with every hazard type.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Wide rust-dirt track with soft ruts, no neon glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. NASA-style flag or mesa summit
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Crawler: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Crawler "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('martian_dirt')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🛡️ TANK — Robot Visual Bible

## Kid fantasy hook
Desert combat yard with bunkers — NOT boxing ring

## This robot is NOT
boxing canvas, hospital corridor

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `desert_sand` — Desert combat yard |
| **Sky / atmosphere** | Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes. |
| **Path material** | Sandy lane between concrete bunkers |
| **Signature landmark** | Fortress core or target dummy |
| **Camera** | `combat_cam` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.tank` + `buildChassisFloor('desert_sand')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Tank)
Fortress core or target dummy; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Fortress Core Defense

| | |
|---|---|
| **Mission ID** | `tank_fortress_core_defense` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Defend the central core from 3 waves of training drones.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('desert_sand')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Heavy Mortar Cannon

| | |
|---|---|
| **Mission ID** | `tank_heavy_mortar_cannon` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Launch arcing shots over walls to hit distant targets.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Sandy lane between concrete bunkers; fortress core glowing blue at defend point.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 concrete bunkers
2. Fortress core cylinder (emissive)
3. Target dummy silhouette

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`buildTankCombatYard() — NEVER BoxingRing` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Bumper Car Sumo

| | |
|---|---|
| **Mission ID** | `tank_bumper_car_sumo` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Push the rival tank out of the elevated ring.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Sandy lane between concrete bunkers; fortress core glowing blue at defend point.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 concrete bunkers
2. Fortress core cylinder (emissive)
3. Target dummy silhouette

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`buildTankCombatYard() — NEVER BoxingRing` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Minefield Clearance

| | |
|---|---|
| **Mission ID** | `tank_minefield_clearance` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Mark safe path through mines — one hit resets the lane.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Zigzag between 4 large boulder silhouettes (collision); path stays 5m wide.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 4 rounded boulder props (background only)
2. Orange hazard cones
3. Checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('desert_sand')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Shield Wall Endurance

| | |
|---|---|
| **Mission ID** | `tank_shield_wall_endurance` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Hold block stance while under fire for 60 seconds.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Fortress core or target dummy
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('desert_sand')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Goliath Tank Duel

| | |
|---|---|
| **Mission ID** | `tank_goliath_tank_duel` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · 1v1 heavy armor fight in the mech colosseum.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Sandy lane between concrete bunkers; fortress core glowing blue at defend point.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 concrete bunkers
2. Fortress core cylinder (emissive)
3. Target dummy silhouette

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`buildTankCombatYard() — NEVER BoxingRing` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Battery Payload Escort

| | |
|---|---|
| **Mission ID** | `tank_battery_payload_escort` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Escort the power cell through combat alleyways.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Fortress core or target dummy
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('desert_sand')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Concrete Bunker Breaker

| | |
|---|---|
| **Mission ID** | `tank_concrete_bunker_breaker` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Smash destructible barriers to reach the objective.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Fortress core or target dummy
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('desert_sand')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Thermal Cooling Management

| | |
|---|---|
| **Mission ID** | `tank_thermal_cooling_management` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Vent heat before overheat shuts down weapons.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Fortress core or target dummy
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('desert_sand')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — 8-Tank Battle Royale

| | |
|---|---|
| **Mission ID** | `tank_8_tank_battle_royale` |
| **Arena code** | `robot_fight` |
| **Environment** | Desert combat yard (`sandbox`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Last tank standing in the shrinking arena.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Sandy lane between concrete bunkers; fortress core glowing blue at defend point. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Sandy lane between concrete bunkers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 concrete bunkers
2. Fortress core cylinder (emissive)
3. Target dummy silhouette

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Tank: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Tank "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`buildTankCombatYard() — NEVER BoxingRing` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🥷 STEALTH BOT — Robot Visual Bible

## Kid fantasy hook
Spy on moonlit rooftops with laser grids

## This robot is NOT
bright farm noon, boxing stadium

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `rooftop_tar` — Night rooftop |
| **Sky / atmosphere** | Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface. |
| **Path material** | Dark rooftop with pink laser grid lines |
| **Signature landmark** | Hack terminal or ventilation unit |
| **Camera** | `stealth_follow` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.stealth` + `buildChassisFloor('rooftop_tar')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Stealth Bot)
Hack terminal or ventilation unit; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Laser Grid Infiltration

| | |
|---|---|
| **Mission ID** | `stealth_laser_grid_infiltration` |
| **Arena code** | `museum_heist` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Cross the museum vault without tripping laser beams.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark rooftop with pink laser grid lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`rooftop_tar` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Cloaking Device Trial

| | |
|---|---|
| **Mission ID** | `stealth_cloaking_device_trial` |
| **Arena code** | `shadow_escape` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Reach the exit while cloaked — movement breaks stealth.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark rooftop with pink laser grid lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`rooftop_tar` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Silent Footsteps

| | |
|---|---|
| **Mission ID** | `stealth_silent_footsteps` |
| **Arena code** | `cyber_city` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Pass sleeping guards — noise meter must stay green.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark rooftop with pink laser grid lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`rooftop_tar` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Shadow Dash

| | |
|---|---|
| **Mission ID** | `stealth_shadow_dash` |
| **Arena code** | `night_patrol` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Dash between shadow zones before searchlights sweep back.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark rooftop with pink laser grid lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`rooftop_tar` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Night Vision Target Tag

| | |
|---|---|
| **Mission ID** | `stealth_night_vision_target_tag` |
| **Arena code** | `shadow_escape` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Tag 5 targets in darkness using NV sensors.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark rooftop with pink laser grid lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`rooftop_tar` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Guard Bypass

| | |
|---|---|
| **Mission ID** | `stealth_guard_bypass` |
| **Arena code** | `museum_heist` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Time patrol routes and slip through blind spots.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark rooftop with pink laser grid lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`rooftop_tar` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Hack Security Terminal

| | |
|---|---|
| **Mission ID** | `stealth_hack_security_terminal` |
| **Arena code** | `cyber_city` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Hold position at terminal for 10s to hack the door.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark rooftop with pink laser grid lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Ghost Recon Sweep

| | |
|---|---|
| **Mission ID** | `stealth_ghost_recon_sweep` |
| **Arena code** | `night_patrol` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Map the rooftop without raising any alarms.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Distraction Flare Deploy

| | |
|---|---|
| **Mission ID** | `stealth_distraction_flare_deploy` |
| **Arena code** | `escape_wall` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Deploy flare to pull guards, then sneak past.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Straight path with 3 wide brown mud basins (3m each); splash VFX on contact.

**Ground / flight surface:** Dark rooftop with pink laser grid lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Mud splash particles
2. Traction warning signs
3. Green finish arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rooftop_tar')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Dark Ops Mastermind

| | |
|---|---|
| **Mission ID** | `stealth_dark_ops_mastermind` |
| **Arena code** | `jump_world` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Full heist: lasers, guards, hack, extract — zero alarms.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams). Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Dark rooftop with pink laser grid lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Stealth Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`rooftop_tar` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# ⛏️ MINING BOT — Robot Visual Bible

## Kid fantasy hook
Underground hero with headlamp in amber-lit tunnels

## This robot is NOT
open sunny sky, hospital tiles

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `mine_tunnel` — Underground mine tunnel |
| **Sky / atmosphere** | Low rock tunnel walls on both sides with amber work lights. Dark ceiling — NOT open sky factory. |
| **Path material** | Gravel track with mine-cart rails |
| **Signature landmark** | Glowing crystal cluster or drill site |
| **Camera** | `factory_overview` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.miningbot` + `buildChassisFloor('mine_tunnel')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Mining Bot)
Glowing crystal cluster or drill site; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Crystal Ore Extraction

| | |
|---|---|
| **Mission ID** | `miningbot_crystal_ore_extraction` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Drill 8 crystal nodes in the factory quarry zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Straight path with 3 wide brown mud basins (3m each); splash VFX on contact.

**Ground / flight surface:** Gravel track with mine-cart rails

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Low rock tunnel walls on both sides with amber work lights. Dark ceiling — NOT open sky factory.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Mud splash particles
2. Traction warning signs
3. Green finish arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('mine_tunnel')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Tunnel Digger Sprint

| | |
|---|---|
| **Mission ID** | `miningbot_tunnel_digger_sprint` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Dig through the underground mine to the exit shaft.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Curved gravel track inside rock tunnel; amber work lights every 15m on walls.

**Ground / flight surface:** Gravel with mine-cart rail hints; walls pinch to 12m wide then open.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

No sky — rock ceiling with amber sconces; depth fog ahead.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster or drill site
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`mine_tunnel floor + addTunnelWalls()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Heavy Load Haul

| | |
|---|---|
| **Mission ID** | `miningbot_heavy_load_haul` |
| **Arena code** | `warehouse` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Haul ore cart from pit to smelter without tipping.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Gravel track with mine-cart rails

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Low rock tunnel walls on both sides with amber work lights. Dark ceiling — NOT open sky factory.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster or drill site
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('mine_tunnel')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Shaft Seismic Scan

| | |
|---|---|
| **Mission ID** | `miningbot_shaft_seismic_scan` |
| **Arena code** | `underground_mine` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Scan walls for weak points before drilling forward.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Curved gravel track inside rock tunnel; amber work lights every 15m on walls.

**Ground / flight surface:** Gravel with mine-cart rail hints; walls pinch to 12m wide then open.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

No sky — rock ceiling with amber sconces; depth fog ahead.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster or drill site
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`mine_tunnel floor + addTunnelWalls()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Cave-In Escape

| | |
|---|---|
| **Mission ID** | `miningbot_cave_in_escape` |
| **Arena code** | `deep_cave` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Outrun collapsing tunnel — reach safety before timer ends.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Curved gravel track inside rock tunnel; amber work lights every 15m on walls.

**Ground / flight surface:** Gravel with mine-cart rail hints; walls pinch to 12m wide then open.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

No sky — rock ceiling with amber sconces; depth fog ahead.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster or drill site
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`mine_tunnel floor + addTunnelWalls()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Diamond Vein Crusher

| | |
|---|---|
| **Mission ID** | `miningbot_diamond_vein_crusher` |
| **Arena code** | `pipeline_crawl` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Break reinforced vein with timed hammer strikes.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Gravel track with mine-cart rails

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Low rock tunnel walls on both sides with amber work lights. Dark ceiling — NOT open sky factory.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('mine_tunnel')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Geothermal Vent Bypass

| | |
|---|---|
| **Mission ID** | `miningbot_geothermal_vent_bypass` |
| **Arena code** | `lava_canyon` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Route around steam vents using temperature sensors.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Gravel track with mine-cart rails

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Low rock tunnel walls on both sides with amber work lights. Dark ceiling — NOT open sky factory.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster or drill site
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('mine_tunnel')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Ore Sorting Deposit

| | |
|---|---|
| **Mission ID** | `miningbot_ore_sorting_deposit` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Deliver red vs blue ore to correct hoppers.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Gravel track with mine-cart rails

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Low rock tunnel walls on both sides with amber work lights. Dark ceiling — NOT open sky factory.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('mine_tunnel')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Explosive Charge Plant

| | |
|---|---|
| **Mission ID** | `miningbot_explosive_charge_plant` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Place charges, retreat, detonate — clear the rubble.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Gravel track with mine-cart rails

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Low rock tunnel walls on both sides with amber work lights. Dark ceiling — NOT open sky factory.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster or drill site
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('mine_tunnel')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Deep Earth Master

| | |
|---|---|
| **Mission ID** | `miningbot_deep_earth_master` |
| **Arena code** | `colosseum` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Full shift: extract, haul, sort, escape cave-in.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Gravel track with mine-cart rails

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Low rock tunnel walls on both sides with amber work lights. Dark ceiling — NOT open sky factory.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Mining Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mining Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`mine_tunnel + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🛡️ SECURITY BOT — Robot Visual Bible

## Kid fantasy hook
Night-patrol guard in parking lots and warehouses

## This robot is NOT
Mars dirt, farm barn, boxing ring

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `asphalt_lot` — City security lot |
| **Sky / atmosphere** | Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky. |
| **Path material** | Dark asphalt with white patrol line and cone posts |
| **Signature landmark** | Security gate arm or scanner booth |
| **Camera** | `chase_close` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.securitybot` + `buildChassisFloor('asphalt_lot')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Security Bot)
Security gate arm or scanner booth; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Perimeter Patrol Circuit

| | |
|---|---|
| **Mission ID** | `securitybot_perimeter_patrol_circuit` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Follow the glowing patrol route — hit every checkpoint.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Intruder Alert Chase

| | |
|---|---|
| **Mission ID** | `securitybot_intruder_alert_chase` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Pursue the fleeing bot and tag it within 90 seconds.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Night Sentry Watch

| | |
|---|---|
| **Mission ID** | `securitybot_night_sentry_watch` |
| **Arena code** | `warehouse` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Scan sectors with spotlight — report anomalies.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Access Card Verification

| | |
|---|---|
| **Mission ID** | `securitybot_access_card_verification` |
| **Arena code** | `underground_mine` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Stop at 4 gates and verify RFID codes.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Flashlight Searchlight

| | |
|---|---|
| **Mission ID** | `securitybot_flashlight_searchlight` |
| **Arena code** | `power_garden` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Find hidden intruders in the warehouse dark zones.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Crowd Control Barrier

| | |
|---|---|
| **Mission ID** | `securitybot_crowd_control_barrier` |
| **Arena code** | `pipeline_crawl` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Deploy barriers to redirect traffic flow safely.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Alarm Code Response

| | |
|---|---|
| **Mission ID** | `securitybot_alarm_code_response` |
| **Arena code** | `urban_obstacle` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Enter correct code sequence at the alarm panel.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — CCTV Blind Spot Sweep

| | |
|---|---|
| **Mission ID** | `securitybot_cctv_blind_spot_sweep` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Cover every camera blind spot on the map.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Vault Lock Protection

| | |
|---|---|
| **Mission ID** | `securitybot_vault_lock_protection` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Defend vault door during 2-minute breach attempt.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Chief Security Officer

| | |
|---|---|
| **Mission ID** | `securitybot_chief_security_officer` |
| **Arena code** | `colosseum` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone patrol: chase, verify, defend vault.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Dark asphalt with white patrol line and cone posts

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Chain-link fence silhouette on one side, simple warehouse blocks far away. Overcast city sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Security Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Security Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🚜 FARM BOT — Robot Visual Bible

## Kid fantasy hook
Sunny countryside helper on soil furrows

## This robot is NOT
grey industrial concrete, mine tunnel walls

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `farm_field` — Outdoor farm field |
| **Sky / atmosphere** | Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor. |
| **Path material** | Brown soil rows between green crop strips |
| **Signature landmark** | Hay bale or apple tree |
| **Camera** | `rover_wide` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.farmbot` + `buildChassisFloor('farm_field')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Farm Bot)
Hay bale or apple tree; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Crop Planting Row

| | |
|---|---|
| **Mission ID** | `farmbot_crop_planting_row` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Plant seeds in 6 straight rows using repeat loops.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Automated Watering Route

| | |
|---|---|
| **Mission ID** | `farmbot_automated_watering_route` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Water every dry patch along the field circuit.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Weed Eradication Blitz

| | |
|---|---|
| **Mission ID** | `farmbot_weed_eradication_blitz` |
| **Arena code** | `warehouse` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Tag all weeds without damaging crops.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Apple Orchard Harvester

| | |
|---|---|
| **Mission ID** | `farmbot_apple_orchard_harvester` |
| **Arena code** | `underground_mine` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Collect apples from 10 trees in order.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Field Plowing Pattern

| | |
|---|---|
| **Mission ID** | `farmbot_field_plowing_pattern` |
| **Arena code** | `power_garden` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Drive a zigzag plow pattern across the field.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Zigzag between 4 large boulder silhouettes (collision); path stays 5m wide.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 4 rounded boulder props (background only)
2. Orange hazard cones
3. Checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('farm_field')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Wheat Harvesting Haul

| | |
|---|---|
| **Mission ID** | `farmbot_wheat_harvesting_haul` |
| **Arena code** | `pipeline_crawl` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Harvest and deliver grain to the silo.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Pest Control Patrol

| | |
|---|---|
| **Mission ID** | `farmbot_pest_control_patrol` |
| **Arena code** | `urban_obstacle` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Spray pest zones when sensor detects infestation.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Soil Moisture Sensor Sweep

| | |
|---|---|
| **Mission ID** | `farmbot_soil_moisture_sensor_sweep` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Map moisture levels at 8 survey points.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Greenhouse Climate Control

| | |
|---|---|
| **Mission ID** | `farmbot_greenhouse_climate_control` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Adjust vents to keep temperature in green zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Golden Harvest Master

| | |
|---|---|
| **Mission ID** | `farmbot_golden_harvest_master` |
| **Arena code** | `colosseum` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Full farm day: plant, water, harvest, deliver.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Brown soil rows between green crop strips

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Farm Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Farm Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🕷️ SPIDER BOT — Robot Visual Bible

## Kid fantasy hook
Wall-climber in vertical shafts and pipes

## This robot is NOT
flat open desert, flight rings

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `climb_shaft` — Vertical climb shaft |
| **Sky / atmosphere** | Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above. |
| **Path material** | Wall holds and web-strand guides (not a flat floor path) |
| **Signature landmark** | Ceiling hook or web bridge |
| **Camera** | `climber_follow` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.spider` + `buildChassisFloor('climb_shaft')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Spider Bot)
Ceiling hook or web bridge; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Web Climbing Ascent

| | |
|---|---|
| **Mission ID** | `spider_web_climbing_ascent` |
| **Arena code** | `spider_rescue` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Climb the vertical mesh wall to the rooftop exit.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Stepped incline path rising 4–8m with 3 wide terraces; each terrace is a full platform (not a thin ramp).

**Ground / flight surface:** Wall holds and web-strand guides (not a flat floor path)

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Summit flag on top terrace
2. 2 mid-slope checkpoint flags
3. Dust puff particles on climb

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('climb_shaft')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Multi-Leg Stability Test

| | |
|---|---|
| **Mission ID** | `spider_multi_leg_stability_test` |
| **Arena code** | `spider_pipeline` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Cross stepping stones without a leg touching void.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Wall holds and web-strand guides (not a flat floor path)

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Ceiling hook or web bridge
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('climb_shaft')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Ceiling Crawl Infiltration

| | |
|---|---|
| **Mission ID** | `spider_ceiling_crawl_infiltration` |
| **Arena code** | `pipeline_crawl` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Traverse upside-down along ceiling rails.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Vertical wall holds path; camera tilted 90° for ceiling sections.

**Ground / flight surface:** Wall holds and web-strand guides (not a flat floor path)

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`climb_shaft` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Web Trap Deploy

| | |
|---|---|
| **Mission ID** | `spider_web_trap_deploy` |
| **Arena code** | `temple_climb` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Spin barriers to trap moving targets in the ruins.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Wall holds and web-strand guides (not a flat floor path)

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Ceiling hook or web bridge
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('climb_shaft')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Creepy Crawly Slalom

| | |
|---|---|
| **Mission ID** | `spider_creepy_crawly_slalom` |
| **Arena code** | `collapsed_building` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Weave through tight pillars in the temple climb.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — High-Step Hazard Jump

| | |
|---|---|
| **Mission ID** | `spider_high_step_hazard_jump` |
| **Arena code** | `crystal_caverns` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Step over pipe obstacles with leg lift blocks.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Wall holds and web-strand guides (not a flat floor path)

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Ceiling hook or web bridge
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('climb_shaft')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Vibration Sensor Detect

| | |
|---|---|
| **Mission ID** | `spider_vibration_sensor_detect` |
| **Arena code** | `jump_world` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Locate hidden movement using floor vibration data.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Wall holds and web-strand guides (not a flat floor path)

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Ceiling hook or web bridge
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('climb_shaft')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Arachnid Speed Dash

| | |
|---|---|
| **Mission ID** | `spider_arachnid_speed_dash` |
| **Arena code** | `deep_cave` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Skitter sideways at top speed through the pipeline.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Wall holds and web-strand guides (not a flat floor path)

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Ceiling hook or web bridge
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('climb_shaft')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Inverse Kinematics Gait

| | |
|---|---|
| **Mission ID** | `spider_inverse_kinematics_gait` |
| **Arena code** | `colosseum` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Adjust leg heights for extreme slope angles.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Wall holds and web-strand guides (not a flat floor path)

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Ceiling hook or web bridge
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('climb_shaft')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Spider Queen Showdown

| | |
|---|---|
| **Mission ID** | `spider_spider_queen_showdown` |
| **Arena code** | `temple_climb` |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Scale the colossal tower and defeat the boss gate.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Wall holds and web-strand guides (not a flat floor path)

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Ceiling hook or web bridge
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Spider Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Spider Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('climb_shaft')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🤖 DROID — Robot Visual Bible

## Kid fantasy hook
Humanoid athlete in gym mats and sports hall

## This robot is NOT
farm field, underwater

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `gym_mats` — Humanoid training gym |
| **Sky / atmosphere** | Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows. |
| **Path material** | Blue exercise mat path with white lane tape |
| **Signature landmark** | Balance beam or hurdle bar |
| **Camera** | `chase_close` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.droid` + `buildChassisFloor('gym_mats')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Droid)
Balance beam or hurdle bar; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Bipedal Balance Sprint

| | |
|---|---|
| **Mission ID** | `droid_bipedal_balance_sprint` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Sprint without falling — balance meter must stay centered.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Balance beam or hurdle bar
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Staircase Climb

| | |
|---|---|
| **Mission ID** | `droid_staircase_climb` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Climb 20 steps to the factory mezzanine.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Stepped incline path rising 4–8m with 3 wide terraces; each terrace is a full platform (not a thin ramp).

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Summit flag on top terrace
2. 2 mid-slope checkpoint flags
3. Dust puff particles on climb

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Object Pick and Place

| | |
|---|---|
| **Mission ID** | `droid_object_pick_and_place` |
| **Arena code** | `warehouse` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Grab crate from belt A and place on belt B.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Balance beam or hurdle bar
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Human Gesture Mimic

| | |
|---|---|
| **Mission ID** | `droid_human_gesture_mimic` |
| **Arena code** | `underground_mine` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Copy the instructor pose at each mirror station.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Balance beam or hurdle bar
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Obstacle Hurdle Jump

| | |
|---|---|
| **Mission ID** | `droid_obstacle_hurdle_jump` |
| **Arena code** | `power_garden` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Jump over 8 hurdles on the assembly floor.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Balance beam or hurdle bar
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Balance Beam Walk

| | |
|---|---|
| **Mission ID** | `droid_balance_beam_walk` |
| **Arena code** | `pipeline_crawl` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Cross narrow beam over the conveyor gap.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Balance beam or hurdle bar
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Door Handle Turn

| | |
|---|---|
| **Mission ID** | `droid_door_handle_turn` |
| **Arena code** | `urban_obstacle` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Rotate handle and push door — enter next room.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Balance beam or hurdle bar
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Push Recovery Test

| | |
|---|---|
| **Mission ID** | `droid_push_recovery_test` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Recover from shove without falling over.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Balance beam or hurdle bar
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Dance Choreography

| | |
|---|---|
| **Mission ID** | `droid_dance_choreography` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Execute 6-move dance sequence in order.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Humanoid Olympics

| | |
|---|---|
| **Mission ID** | `droid_humanoid_olympics` |
| **Arena code** | `colosseum` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone: stairs, carry, jump, balance finale.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Blue exercise mat path with white lane tape

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Balance beam or hurdle bar
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Droid: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Droid "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('gym_mats')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🦿 MECH — Robot Visual Bible

## Kid fantasy hook
Heavy industrial walker in scrap yard

## This robot is NOT
hospital, coral reef

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `scrap_yard` — Industrial scrap yard |
| **Sky / atmosphere** | Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky. |
| **Path material** | Cracked concrete with oil stains and yellow caution paint |
| **Signature landmark** | Shipping container or hydraulic press |
| **Camera** | `chase_close` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.mech` + `buildChassisFloor('scrap_yard')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Mech)
Shipping container or hydraulic press; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Heavy Stomp Siege

| | |
|---|---|
| **Mission ID** | `mech_heavy_stomp_siege` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Stomp through destructible barricades to the gate.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Elevated metal grating combat platform with neon trim.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core pedestal
2. Opponent mech silhouette
3. Stadium rim lights

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('scrap_yard')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Dual Arm Loader

| | |
|---|---|
| **Mission ID** | `mech_dual_arm_loader` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Lift two crates simultaneously onto the scaffold.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Mech Titan Stride

| | |
|---|---|
| **Mission ID** | `mech_mech_titan_stride` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Walk the colosseum without falling off the platform.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Shipping container or hydraulic press
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('scrap_yard')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Hydraulic Press Smash

| | |
|---|---|
| **Mission ID** | `mech_hydraulic_press_smash` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Time smash attacks on glowing weak points.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Shipping container or hydraulic press
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('scrap_yard')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Overheat Thermal Venting

| | |
|---|---|
| **Mission ID** | `mech_overheat_thermal_venting` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Vent before heat bar maxes during combat.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Shipping container or hydraulic press
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('scrap_yard')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Seismic Ground Slam

| | |
|---|---|
| **Mission ID** | `mech_seismic_ground_slam` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Slam ground to break floor locks in the arena.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Shipping container or hydraulic press
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('scrap_yard')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Cargo Scaffold Lift

| | |
|---|---|
| **Mission ID** | `mech_cargo_scaffold_lift` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Stack girders on the construction lift.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Shipping container or hydraulic press
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('scrap_yard')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Mech Walker Patrol

| | |
|---|---|
| **Mission ID** | `mech_mech_walker_patrol` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Patrol industrial yard — stomp intruder bots.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Armor Hull Stress Test

| | |
|---|---|
| **Mission ID** | `mech_armor_hull_stress_test` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Survive sustained fire without hull breach.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Colossus Mech Duel

| | |
|---|---|
| **Mission ID** | `mech_colossus_mech_duel` |
| **Arena code** | `robot_fight` |
| **Environment** | Industrial scrap yard (`sandbox`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Boss fight in the elevated steel cage.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Elevated metal grating combat platform with neon trim. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Cracked concrete with oil stains and yellow caution paint

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core pedestal
2. Opponent mech silhouette
3. Stadium rim lights

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Mech: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Mech "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('scrap_yard')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🛸 DRONE — Robot Visual Bible

## Kid fantasy hook
Sunset cloud playground with holo rings

## This robot is NOT
canyon rock walls pinching view, underwater

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `open_sky` — Sunset cloud playground |
| **Sky / atmosphere** | Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls. |
| **Path material** | Floating holo rings in open air |
| **Signature landmark** | Cloud castle or numbered ring gate |
| **Camera** | `aerial_chase` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.drone` + `buildChassisFloor('open_sky')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Drone)
Cloud castle or numbered ring gate; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Aerial Ring Slalom

| | |
|---|---|
| **Mission ID** | `drone_aerial_ring_slalom` |
| **Arena code** | `drone_canyon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Fly through 12 glowing rings in order.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Hover Altitude Lock

| | |
|---|---|
| **Mission ID** | `drone_hover_altitude_lock` |
| **Arena code** | `canyon_flight` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Hold exact altitude through the canyon corridor.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Aerial Target Dive

| | |
|---|---|
| **Mission ID** | `drone_aerial_target_dive` |
| **Arena code** | `storm_cloud` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Dive-bomb 5 targets then pull up before ground.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Quadcopter Swarm Patrol

| | |
|---|---|
| **Mission ID** | `drone_quadcopter_swarm_patrol` |
| **Arena code** | `cloud_race` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Patrol 4 sky sectors with waypoint loops.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Floating holo rings in open air

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Vertical Ascent Sprint

| | |
|---|---|
| **Mission ID** | `drone_vertical_ascent_sprint` |
| **Arena code** | `space_orbit` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Race straight up the tower to the landing pad.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Stepped incline path rising 4–8m with 3 wide terraces; each terrace is a full platform (not a thin ramp).

**Ground / flight surface:** Floating holo rings in open air

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Summit flag on top terrace
2. 2 mid-slope checkpoint flags
3. Dust puff particles on climb

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Package Drop Precision

| | |
|---|---|
| **Mission ID** | `drone_package_drop_precision` |
| **Arena code** | `flight_rings` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Drop supply crate on the rooftop X marker.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Aerial Photography Sweep

| | |
|---|---|
| **Mission ID** | `drone_aerial_photography_sweep` |
| **Arena code** | `jet_stunt` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Hover over 6 photo waypoints steadily.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Wind Tunnel Navigation

| | |
|---|---|
| **Mission ID** | `drone_wind_tunnel_navigation` |
| **Arena code** | `rooftop_delivery` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Fight crosswinds without leaving the corridor.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Curved gravel track inside rock tunnel; amber work lights every 15m on walls.

**Ground / flight surface:** Gravel with mine-cart rail hints; walls pinch to 12m wide then open.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

No sky — rock ceiling with amber sconces; depth fog ahead.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Cloud castle or numbered ring gate
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`mine_tunnel floor + addTunnelWalls()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Propeller Flip Stunt

| | |
|---|---|
| **Mission ID** | `drone_propeller_flip_stunt` |
| **Arena code** | `typhoon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Execute flip through the stunt ring.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Narrow wooden bridge section (4m wide) over visible gap; guard ropes on sides.

**Ground / flight surface:** Floating holo rings in open air

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rope bridge with plank texture
2. 1 support post per side
3. Finish flag on far bank

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Sky Ace Master

| | |
|---|---|
| **Mission ID** | `drone_sky_ace_master` |
| **Arena code** | `warp_gate` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone: rings, dive, drop, stunt combo course.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Long aerial spline with 8 premium holo rings (buildPremiumHoloRing); wide forgiving spacing. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Golden sunset sky 75% of frame. Fluffy cloud sea below. Cloud-castle landmark — no canyon walls.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Drone: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 💨 RACING DRONE — Robot Visual Bible

## Kid fantasy hook
Twilight neon ribbon speedway

## This robot is NOT
plain cloud sea only

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `open_sky` — Neon sky race ribbon |
| **Sky / atmosphere** | Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below. |
| **Path material** | Neon prism ribbon with speed rings |
| **Signature landmark** | Turbo tunnel or boost pad |
| **Camera** | `race_chase` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.racedrone` + `buildChassisFloor('open_sky')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Racing Drone)
Turbo tunnel or boost pad; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — FPV Drone Racing Circuit

| | |
|---|---|
| **Mission ID** | `racedrone_fpv_drone_racing_circuit` |
| **Arena code** | `rainbow_road` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Rainbow Road ribbon race from FPV chase cam.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Tunnel Turbo Dash

| | |
|---|---|
| **Mission ID** | `racedrone_tunnel_turbo_dash` |
| **Arena code** | `drone_canyon` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Burst through neon tunnel on Dragon Skyway.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Curved gravel track inside rock tunnel; amber work lights every 15m on walls.

**Ground / flight surface:** Gravel with mine-cart rail hints; walls pinch to 12m wide then open.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

No sky — rock ceiling with amber sconces; depth fog ahead.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Turbo tunnel or boost pad
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`mine_tunnel floor + addTunnelWalls()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Gate Proximity Drift

| | |
|---|---|
| **Mission ID** | `racedrone_gate_proximity_drift` |
| **Arena code** | `sunny_circuit` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Clip gate edges for drift bonus points.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Speed Trap Sky Burst

| | |
|---|---|
| **Mission ID** | `racedrone_speed_trap_sky_burst` |
| **Arena code** | `cloud_race` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Hit 6 speed traps on the cloud race line.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — High-Speed Slalom

| | |
|---|---|
| **Mission ID** | `racedrone_high_speed_slalom` |
| **Arena code** | `dragon_skyway` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Slalom floating rings at max throttle.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Battery Drain Time Attack

| | |
|---|---|
| **Mission ID** | `racedrone_battery_drain_time_attack` |
| **Arena code** | `flight_rings` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Finish before battery hits zero.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Acrobatic Barrel Roll

| | |
|---|---|
| **Mission ID** | `racedrone_acrobatic_barrel_roll` |
| **Arena code** | `volcano_drift` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Roll through the storm cloud gate.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Ghost Drone Race

| | |
|---|---|
| **Mission ID** | `racedrone_ghost_drone_race` |
| **Arena code** | `storm_cloud` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Beat your ghost lap on Volcano Drift.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Low-Altitude Lawn Mower

| | |
|---|---|
| **Mission ID** | `racedrone_low_altitude_lawn_mower` |
| **Arena code** | `street_grand_prix` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Skim rooftop delivery route at 2m altitude.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Grand Sky Prix Champion

| | |
|---|---|
| **Mission ID** | `racedrone_grand_sky_prix_champion` |
| **Arena code** | `warp_gate` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Final: hybrid sky + Rainbow Road championship.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Long aerial spline with 8 premium holo rings (buildPremiumHoloRing); wide forgiving spacing. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Twilight sky with ONE pink-cyan floating race ribbon. Star pinpoints below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Racing Drone: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Racing Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🚁 RESCUE DRONE — Robot Visual Bible

## Kid fantasy hook
Hero over disaster rubble and smoke

## This robot is NOT
playful cloud playground, LEGO mat

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `rubble_street` — Disaster city street |
| **Sky / atmosphere** | Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood. |
| **Path material** | Cracked asphalt with orange cone markers |
| **Signature landmark** | Survivor marker or medkit drop zone |
| **Camera** | `aerial_chase` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.rescuedrone` + `buildChassisFloor('rubble_street')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Rescue Drone)
Survivor marker or medkit drop zone; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Disaster Zone Search

| | |
|---|---|
| **Mission ID** | `rescuedrone_disaster_zone_search` |
| **Arena code** | `firebot_blaze` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Scan rubble for 5 survivor heat signatures.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rubble_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Emergency First Aid Drop

| | |
|---|---|
| **Mission ID** | `rescuedrone_emergency_first_aid_drop` |
| **Arena code** | `hospital_walk` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Drop medkits on survivors in burning district.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rubble_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Flood Zone Evacuation Tag

| | |
|---|---|
| **Mission ID** | `rescuedrone_flood_zone_evacuation_tag` |
| **Arena code** | `snow_rescue` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Tag evacuees on rooftops in flooded city.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rubble_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Thermal Heat Signature Spotting

| | |
|---|---|
| **Mission ID** | `rescuedrone_thermal_heat_signature_spotting` |
| **Arena code** | `firebot_blaze` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Find hidden victims using thermal cam.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rubble_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Avalanche Beacon Sweep

| | |
|---|---|
| **Mission ID** | `rescuedrone_avalanche_beacon_sweep` |
| **Arena code** | `hospital_walk` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Locate beacons under snow_rescue terrain.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rubble_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Rope Lifeline Deploy

| | |
|---|---|
| **Mission ID** | `rescuedrone_rope_lifeline_deploy` |
| **Arena code** | `snow_rescue` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Deploy rope to stranded bot on cliff edge.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Narrow wooden bridge section (4m wide) over visible gap; guard ropes on sides.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rope bridge with plank texture
2. 1 support post per side
3. Finish flag on far bank

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rubble_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Hurricane Wind Rescue

| | |
|---|---|
| **Mission ID** | `rescuedrone_hurricane_wind_rescue` |
| **Arena code** | `lava_canyon` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Hover stable in typhoon corridor to rescue.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rubble_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Night Searchlight Recon

| | |
|---|---|
| **Mission ID** | `rescuedrone_night_searchlight_recon` |
| **Arena code** | `cyber_city` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Light and find targets in dark hospital zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rubble_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Hazardous Gas Sampling

| | |
|---|---|
| **Mission ID** | `rescuedrone_hazardous_gas_sampling` |
| **Arena code** | `snow_rescue` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Collect air samples without entering red zones.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('rubble_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Hero Rescue Medal

| | |
|---|---|
| **Mission ID** | `rescuedrone_hero_rescue_medal` |
| **Arena code** | `firebot_blaze` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone multi-victim rescue mission.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Cracked asphalt with orange cone markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Rescue Drone: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Rescue Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🚁 HELICOPTER — Robot Visual Bible

## Kid fantasy hook
Oil-rig hops over cartoon ocean

## This robot is NOT
identical to Drone cloud-only layout

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `open_sky` — Ocean & oil-rig sky |
| **Sky / atmosphere** | Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones. |
| **Path material** | Helipad hops between platforms |
| **Signature landmark** | Oil rig helipad or cargo hook |
| **Camera** | `aerial_chase` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.helicopter` + `buildChassisFloor('open_sky')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Helicopter)
Oil rig helipad or cargo hook; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Heavy Cargo Airlift

| | |
|---|---|
| **Mission ID** | `helicopter_heavy_cargo_airlift` |
| **Arena code** | `drone_canyon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Lift crate from pad A to oil rig landing zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Helipad hops between platforms

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oil rig helipad or cargo hook
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Offshore Oil Rig Landing

| | |
|---|---|
| **Mission ID** | `helicopter_offshore_oil_rig_landing` |
| **Arena code** | `canyon_flight` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Land on moving platform in crosswind.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Helipad hops between platforms

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Water Bucket Fire Suppression

| | |
|---|---|
| **Mission ID** | `helicopter_water_bucket_fire_suppression` |
| **Arena code** | `storm_cloud` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Fill bucket and dump on firebot_blaze targets.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Helipad hops between platforms

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Mountain Top Insertion

| | |
|---|---|
| **Mission ID** | `helicopter_mountain_top_insertion` |
| **Arena code** | `cloud_race` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Insert team at summit waypoint in canyon flight.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Stepped incline path rising 4–8m with 3 wide terraces; each terrace is a full platform (not a thin ramp).

**Ground / flight surface:** Helipad hops between platforms

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Summit flag on top terrace
2. 2 mid-slope checkpoint flags
3. Dust puff particles on climb

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Rotor Pitch Control

| | |
|---|---|
| **Mission ID** | `helicopter_rotor_pitch_control` |
| **Arena code** | `space_orbit` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Hold hover while pitch meter stays in green.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Helipad hops between platforms

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oil rig helipad or cargo hook
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Construction Girder Placement

| | |
|---|---|
| **Mission ID** | `helicopter_construction_girder_placement` |
| **Arena code** | `flight_rings` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Place steel beam on marked hooks.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Helipad hops between platforms

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oil rig helipad or cargo hook
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Long Haul Fuel Flight

| | |
|---|---|
| **Mission ID** | `helicopter_long_haul_fuel_flight` |
| **Arena code** | `jet_stunt` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Reach distant pad before fuel runs out.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Emergency Medevac Transport

| | |
|---|---|
| **Mission ID** | `helicopter_emergency_medevac_transport` |
| **Arena code** | `rooftop_delivery` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Pick up patient from hospital_walk zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** Helipad hops between platforms

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Vehicle Recovery Winch

| | |
|---|---|
| **Mission ID** | `helicopter_vehicle_recovery_winch` |
| **Arena code** | `typhoon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Winch stranded rover from crater.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Helipad hops between platforms

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oil rig helipad or cargo hook
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Sky Crane Master

| | |
|---|---|
| **Mission ID** | `helicopter_sky_crane_master` |
| **Arena code** | `warp_gate` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone lift + land + medevac chain.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Helipad hops between platforms

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Blue sky over cartoon ocean far below. Oil platform or ship deck as landing zones.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oil rig helipad or cargo hook
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Helicopter: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Helicopter "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🛸 HOVER BOT — Robot Visual Bible

## Kid fantasy hook
Zero-G lab with floating platforms

## This robot is NOT
farm soil, mine tunnel

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `open_sky` — Sci-fi zero-G lab |
| **Sky / atmosphere** | Purple-white lab sky with floating grey platforms and anti-gravity glow rings. |
| **Path material** | Hover pads linked by plasma bridges |
| **Signature landmark** | Floating platform or repulsor gate |
| **Camera** | `aerial_chase` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.hoverbot` + `buildChassisFloor('open_sky')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Hover Bot)
Floating platform or repulsor gate; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Anti-Gravity Glide

| | |
|---|---|
| **Mission ID** | `hoverbot_anti_gravity_glide` |
| **Arena code** | `drone_canyon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Glide frictionless across the sky arena gap.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Repulsor Field Push

| | |
|---|---|
| **Mission ID** | `hoverbot_repulsor_field_push` |
| **Arena code** | `canyon_flight` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Push debris blocks off the hover lane.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Zigzag between 4 large boulder silhouettes (collision); path stays 5m wide.

**Ground / flight surface:** Hover pads linked by plasma bridges

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 4 rounded boulder props (background only)
2. Orange hazard cones
3. Checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Magnet Rail Hover

| | |
|---|---|
| **Mission ID** | `hoverbot_magnet_rail_hover` |
| **Arena code** | `storm_cloud` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Lock onto mag-rail and follow the circuit.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Zero-G Physics Room

| | |
|---|---|
| **Mission ID** | `hoverbot_zero_g_physics_room` |
| **Arena code** | `cloud_race` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Navigate zero_g chamber without touching walls.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Hover Height Calibration

| | |
|---|---|
| **Mission ID** | `hoverbot_hover_height_calibration` |
| **Arena code** | `space_orbit` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Hold 3 different altitudes at markers.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Smooth Banked Glide

| | |
|---|---|
| **Mission ID** | `hoverbot_smooth_banked_glide` |
| **Arena code** | `flight_rings` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Bank through cloud race turns smoothly.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Energy Shield Bounce

| | |
|---|---|
| **Mission ID** | `hoverbot_energy_shield_bounce` |
| **Arena code** | `jet_stunt` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Bounce off shields to reach high platforms.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Plasma Thruster Boost

| | |
|---|---|
| **Mission ID** | `hoverbot_plasma_thruster_boost` |
| **Arena code** | `rooftop_delivery` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Chain boost pads on drone canyon course.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Chasm Crossing Glide

| | |
|---|---|
| **Mission ID** | `hoverbot_chasm_crossing_glide` |
| **Arena code** | `typhoon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Cross widest gap on single battery charge.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Anti-Gravity Master

| | |
|---|---|
| **Mission ID** | `hoverbot_anti_gravity_master` |
| **Arena code** | `warp_gate` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone glide + boost + precision landing.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Long aerial spline with 8 premium holo rings (buildPremiumHoloRing); wide forgiving spacing. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Purple-white lab sky with floating grey platforms and anti-gravity glow rings.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Hover Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# ⚡ HOVER RACER — Robot Visual Bible

## Kid fantasy hook
Purple plasma lane with energy pads

## This robot is NOT
identical to Racing Drone pink ribbon

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `open_sky` — Plasma speedway |
| **Sky / atmosphere** | Deep purple sky with glowing plasma track segments and energy pad recharge stations. |
| **Path material** | Floating plasma lane with drift corners |
| **Signature landmark** | Energy recharge pad or warp gate |
| **Camera** | `race_chase` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.hoverracer` + `buildChassisFloor('open_sky')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Hover Racer)
Energy recharge pad or warp gate; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Quantum Speedway Grand Prix

| | |
|---|---|
| **Mission ID** | `hoverracer_quantum_speedway_grand_prix` |
| **Arena code** | `rainbow_road` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Rainbow Road lap 1 — plasma hover tires.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Deep purple sky with glowing plasma track segments and energy pad recharge stations.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Mach 1 Speed Test

| | |
|---|---|
| **Mission ID** | `hoverracer_mach_1_speed_test` |
| **Arena code** | `drone_canyon` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Break speed record on sunny_circuit straight.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Deep purple sky with glowing plasma track segments and energy pad recharge stations.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Plasma Drift Cornering

| | |
|---|---|
| **Mission ID** | `hoverracer_plasma_drift_cornering` |
| **Arena code** | `sunny_circuit` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Drift every corner on Dragon Skyway.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Deep purple sky with glowing plasma track segments and energy pad recharge stations.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Energy Pad Recharge

| | |
|---|---|
| **Mission ID** | `hoverracer_energy_pad_recharge` |
| **Arena code** | `cloud_race` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Hit all recharge pads before battery empty.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Deep purple sky with glowing plasma track segments and energy pad recharge stations.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Sonic Boom Slalom

| | |
|---|---|
| **Mission ID** | `hoverracer_sonic_boom_slalom` |
| **Arena code** | `dragon_skyway` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Slalom rings in storm_cloud corridor.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Deep purple sky with glowing plasma track segments and energy pad recharge stations.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Elimination Hover Sprint

| | |
|---|---|
| **Mission ID** | `hoverracer_elimination_hover_sprint` |
| **Arena code** | `flight_rings` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Stay ahead as last-place gates close.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Deep purple sky with glowing plasma track segments and energy pad recharge stations.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Warp Tunnel Burst

| | |
|---|---|
| **Mission ID** | `hoverracer_warp_tunnel_burst` |
| **Arena code** | `volcano_drift` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Navigate warp_gate tunnel at max speed.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Curved gravel track inside rock tunnel; amber work lights every 15m on walls.

**Ground / flight surface:** Gravel with mine-cart rail hints; walls pinch to 12m wide then open.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

No sky — rock ceiling with amber sconces; depth fog ahead.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy recharge pad or warp gate
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`mine_tunnel floor + addTunnelWalls()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Mag-Strip Inversion

| | |
|---|---|
| **Mission ID** | `hoverracer_mag_strip_inversion` |
| **Arena code** | `storm_cloud` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Complete inverted mag-strip section upside-down.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Deep purple sky with glowing plasma track segments and energy pad recharge stations.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Turbo Slipstream Chase

| | |
|---|---|
| **Mission ID** | `hoverracer_turbo_slipstream_chase` |
| **Arena code** | `street_grand_prix` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Draft behind ghost racer then overtake.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Straight path with 3 wide brown mud basins (3m each); splash VFX on contact.

**Ground / flight surface:** Floating plasma lane with drift corners

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Deep purple sky with glowing plasma track segments and energy pad recharge stations.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Mud splash particles
2. Traction warning signs
3. Green finish arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Galactic Turbo Champion

| | |
|---|---|
| **Mission ID** | `hoverracer_galactic_turbo_champion` |
| **Arena code** | `warp_gate` |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Championship on street_grand_prix finale.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Long aerial spline with 8 premium holo rings (buildPremiumHoloRing); wide forgiving spacing. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Deep purple sky with glowing plasma track segments and energy pad recharge stations.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Hover Racer: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Hover Racer "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🐠 SUB DRONE — Robot Visual Bible

## Kid fantasy hook
Shallow reef explorer in teal sunlit water

## This robot is NOT
dry land, sky rings

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `sandy_seabed` — Shallow coral bay |
| **Sky / atmosphere** | Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey. |
| **Path material** | Sandy seabed trail with bubble trail |
| **Signature landmark** | Coral arch or treasure chest |
| **Camera** | `underwater_follow` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.submarine` + `buildChassisFloor('sandy_seabed')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Sub Drone)
Coral arch or treasure chest; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Coral Reef Survey

| | |
|---|---|
| **Mission ID** | `submarine_coral_reef_survey` |
| **Arena code** | `coral_reef` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Scan 10 marine species in the coral_reef.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Sandy seabed trail with sun rays from surface.

**Ground / flight surface:** Sandy seabed trail with bubble trail

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Coral arch
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`sandy_seabed + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Deep Trench Navigation

| | |
|---|---|
| **Mission ID** | `submarine_deep_trench_navigation` |
| **Arena code** | `deep_trench` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Navigate deep_trench without crushing pressure.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD.

**Ground / flight surface:** Sandy seabed trail with bubble trail

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`sandy_seabed + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Submarine Buoyancy Control

| | |
|---|---|
| **Mission ID** | `submarine_submarine_buoyancy_control` |
| **Arena code** | `kelp_forest` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Trim buoyancy to hold depth at markers.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Sandy seabed trail with sun rays from surface.

**Ground / flight surface:** Sandy seabed trail with bubble trail

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Coral arch
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`sandy_seabed + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Sunken Shipwreck Explore

| | |
|---|---|
| **Mission ID** | `submarine_sunken_shipwreck_explore` |
| **Arena code** | `robot_reef` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Explore shipwreck and tag 5 artifacts.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Sandy seabed trail with bubble trail

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('sandy_seabed')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Hydro-Current Survival

| | |
|---|---|
| **Mission ID** | `submarine_hydro_current_survival` |
| **Arena code** | `atlantis` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Ride currents through kelp_forest maze.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Sandy seabed trail with sun rays from surface.

**Ground / flight surface:** Sandy seabed trail with bubble trail

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Coral arch
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`sandy_seabed + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Underwater Sonar Mapping

| | |
|---|---|
| **Mission ID** | `submarine_underwater_sonar_mapping` |
| **Arena code** | `mariana` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Map seafloor_scan grid completely.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Sandy seabed trail with bubble trail

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Marine Trash Collection

| | |
|---|---|
| **Mission ID** | `submarine_marine_trash_collection` |
| **Arena code** | `shipwreck` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Collect 12 trash items from robot_reef.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Sandy seabed trail with sun rays from surface.

**Ground / flight surface:** Sandy seabed trail with bubble trail

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Coral arch
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`sandy_seabed + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Bioluminescent Trail Follow

| | |
|---|---|
| **Mission ID** | `submarine_bioluminescent_trail_follow` |
| **Arena code** | `bioluminescent` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Follow bioluminescent path in darkness.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Curved gravel track inside rock tunnel; amber work lights every 15m on walls.

**Ground / flight surface:** Gravel with mine-cart rail hints; walls pinch to 12m wide then open.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

No sky — rock ceiling with amber sconces; depth fog ahead.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Coral arch or treasure chest
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`mine_tunnel floor + addTunnelWalls()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Thermal Vent Sample

| | |
|---|---|
| **Mission ID** | `submarine_thermal_vent_sample` |
| **Arena code** | `pirate_wreck` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Grab sample near vent without overheating hull.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Sandy seabed trail with sun rays from surface.

**Ground / flight surface:** Sandy seabed trail with bubble trail

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Coral arch
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`sandy_seabed + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Ocean Floor Master

| | |
|---|---|
| **Mission ID** | `submarine_ocean_floor_master` |
| **Arena code** | `seafloor_scan` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone reef + trench + wreck expedition.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Sandy seabed trail with sun rays from surface. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Sandy seabed trail with bubble trail

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Coral arch
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Sub Drone: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Sub Drone "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`sandy_seabed + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🦑 DEEP SEA BOT — Robot Visual Bible

## Kid fantasy hook
Abyss trench with bioluminescence and headlight

## This robot is NOT
bright coral shallows only, farm

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `abyss_rock` — Deep ocean trench |
| **Sky / atmosphere** | Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone. |
| **Path material** | Rocky ledge path with depth meter HUD |
| **Signature landmark** | Thermal vent or ancient ruin door |
| **Camera** | `underwater_follow` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.deepseabot` + `buildChassisFloor('abyss_rock')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Deep Sea Bot)
Thermal vent or ancient ruin door; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Abyssal Zone Pressure Test

| | |
|---|---|
| **Mission ID** | `deepseabot_abyssal_zone_pressure_test` |
| **Arena code** | `coral_reef` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Descend mariana trench within hull limits.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`abyss_rock + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Giant Squid Evasion

| | |
|---|---|
| **Mission ID** | `deepseabot_giant_squid_evasion` |
| **Arena code** | `deep_trench` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Evade squid in atlantis ruins corridor.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`abyss_rock + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Seafloor Ore Mining

| | |
|---|---|
| **Mission ID** | `deepseabot_seafloor_ore_mining` |
| **Arena code** | `kelp_forest` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Mine 8 nodes on abyssal plain.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('abyss_rock')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Deep Sea Trench Rescue

| | |
|---|---|
| **Mission ID** | `deepseabot_deep_sea_trench_rescue` |
| **Arena code** | `robot_reef` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Rescue trapped bot in trench cage.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('abyss_rock')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Hydrothermal Smoker Exploration

| | |
|---|---|
| **Mission ID** | `deepseabot_hydrothermal_smoker_exploration` |
| **Arena code** | `atlantis` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Circle smokers without hull damage.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`abyss_rock + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Sub-Surface Headlight Search

| | |
|---|---|
| **Mission ID** | `deepseabot_sub_surface_headlight_search` |
| **Arena code** | `mariana` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Find relics using headlights only.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`abyss_rock + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Ancient Ruin Artifact Grab

| | |
|---|---|
| **Mission ID** | `deepseabot_ancient_ruin_artifact_grab` |
| **Arena code** | `shipwreck` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Retrieve artifact from pirate_wreck.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`abyss_rock + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Submarine Pipeline Sealer

| | |
|---|---|
| **Mission ID** | `deepseabot_submarine_pipeline_sealer` |
| **Arena code** | `bioluminescent` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Seal 4 pipeline cracks underwater.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`abyss_rock + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Deep Sea Anglerfish Lure

| | |
|---|---|
| **Mission ID** | `deepseabot_deep_sea_anglerfish_lure` |
| **Arena code** | `pirate_wreck` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Avoid lures while crossing dark zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`abyss_rock + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Master of the Abyss

| | |
|---|---|
| **Mission ID** | `deepseabot_master_of_the_abyss` |
| **Arena code** | `seafloor_scan` |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone abyss run: mine, rescue, seal.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Rocky ledge trail along trench wall; depth meter HUD. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Rocky ledge path with depth meter HUD

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Bioluminescent jellyfish silhouette
2. Bubble trail VFX
3. Treasure or sample goal buoy

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Deep Sea Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Deep Sea Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`abyss_rock + underwater fog` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🦾 ROBOT ARM — Robot Visual Bible

## Kid fantasy hook
Precision lab arm on white grid mat

## This robot is NOT
dirt paths, sky flight rings

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `lab_grid` — Clean workbench lab |
| **Sky / atmosphere** | White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise. |
| **Path material** | White grid mat with blue alignment lines |
| **Signature landmark** | Microchip tray or precision target pad |
| **Camera** | `factory_close` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.robotarm` + `buildChassisFloor('lab_grid')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Robot Arm)
Microchip tray or precision target pad; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Micro-Chip Soldering

| | |
|---|---|
| **Mission ID** | `robotarm_micro_chip_soldering` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Place solder on 6 micro pads in factory zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Precision Pick-and-Place

| | |
|---|---|
| **Mission ID** | `robotarm_precision_pick_and_place` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Move chips from feeder to PCB slots.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** White grid mat with blue alignment lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Rubik's Cube Solver

| | |
|---|---|
| **Mission ID** | `robotarm_rubik_s_cube_solver` |
| **Arena code** | `warehouse` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Execute scripted twist sequence on cube.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** White grid mat with blue alignment lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — High-Precision Drawing

| | |
|---|---|
| **Mission ID** | `robotarm_high_precision_drawing` |
| **Arena code** | `underground_mine` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Trace the pattern on the drawing pad.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** White grid mat with blue alignment lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Surgical Threading

| | |
|---|---|
| **Mission ID** | `robotarm_surgical_threading` |
| **Arena code** | `power_garden` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Thread needle through 4 eye loops.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** White grid mat with blue alignment lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Stack the Blocks

| | |
|---|---|
| **Mission ID** | `robotarm_stack_the_blocks` |
| **Arena code** | `pipeline_crawl` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Stack 8 blocks without toppling tower.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** White grid mat with blue alignment lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Conveyor Belt Sorting

| | |
|---|---|
| **Mission ID** | `robotarm_conveyor_belt_sorting` |
| **Arena code** | `urban_obstacle` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Sort red/blue parts on moving belt.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** White grid mat with blue alignment lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Glassware Pouring Test

| | |
|---|---|
| **Mission ID** | `robotarm_glassware_pouring_test` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Pour liquid to line without spilling.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Chess Piece Master

| | |
|---|---|
| **Mission ID** | `robotarm_chess_piece_master` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Move pieces to checkmate puzzle positions.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** White grid mat with blue alignment lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Surgical Precision Master

| | |
|---|---|
| **Mission ID** | `robotarm_surgical_precision_master` |
| **Arena code** | `colosseum` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone: pick, place, pour, stack chain.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** White grid mat with blue alignment lines

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Robot Arm: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Robot Arm "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🏭 FACTORY BOT — Robot Visual Bible

## Kid fantasy hook
Assembly-line worker on yellow-striped factory floor

## This robot is NOT
outdoor farm, Mars surface

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `factory_floor` — Factory assembly floor |
| **Sky / atmosphere** | Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall. |
| **Path material** | Grey concrete with yellow centre stripe |
| **Signature landmark** | Assembly robot arm or conveyor drop zone |
| **Camera** | `factory_overview` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.factorybot` + `buildChassisFloor('factory_floor')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Factory Bot)
Assembly robot arm or conveyor drop zone; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Assembly Line Production

| | |
|---|---|
| **Mission ID** | `factorybot_assembly_line_production` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Assemble 10 units on the factory_floor line.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Box Stacking Warehouse

| | |
|---|---|
| **Mission ID** | `factorybot_box_stacking_warehouse` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Stack boxes in warehouse to height target.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Grey concrete centre stripe yellow; one wall conveyor belt animation.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Overhead crane silhouette
2. Conveyor drop zone
3. Assembly arm (background)

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`factory_floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Quality Control Inspection

| | |
|---|---|
| **Mission ID** | `factorybot_quality_control_inspection` |
| **Arena code** | `warehouse` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Reject defective parts at QC gate.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Grey concrete centre stripe yellow; one wall conveyor belt animation.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Overhead crane silhouette
2. Conveyor drop zone
3. Assembly arm (background)

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`factory_floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Robot Arm Synchronization

| | |
|---|---|
| **Mission ID** | `factorybot_robot_arm_synchronization` |
| **Arena code** | `underground_mine` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Sync with second arm — no collisions.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White grid mat with blue alignment lines; slow precise zones.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Microchip tray
2. Magnifying lamp arm silhouette
3. Precision target pad

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lab_grid` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Industrial Stamping Press

| | |
|---|---|
| **Mission ID** | `factorybot_industrial_stamping_press` |
| **Arena code** | `power_garden` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Time stamp presses on conveyor items.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Grey concrete centre stripe yellow; one wall conveyor belt animation.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Overhead crane silhouette
2. Conveyor drop zone
3. Assembly arm (background)

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`factory_floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Automated Guided Vehicle Route

| | |
|---|---|
| **Mission ID** | `factorybot_automated_guided_vehicle_route` |
| **Arena code** | `pipeline_crawl` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Follow AGV path through plant.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Grey concrete centre stripe yellow; one wall conveyor belt animation.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Overhead crane silhouette
2. Conveyor drop zone
3. Assembly arm (background)

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`factory_floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Hazardous Material Handling

| | |
|---|---|
| **Mission ID** | `factorybot_hazardous_material_handling` |
| **Arena code** | `urban_obstacle` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Move hazmat crate without breach.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Grey concrete centre stripe yellow; one wall conveyor belt animation.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Overhead crane silhouette
2. Conveyor drop zone
3. Assembly arm (background)

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`factory_floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Factory Emergency Shutdown

| | |
|---|---|
| **Mission ID** | `factorybot_factory_emergency_shutdown` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Hit E-stop sequence in correct order.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Grey concrete centre stripe yellow; one wall conveyor belt animation.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Overhead crane silhouette
2. Conveyor drop zone
3. Assembly arm (background)

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`factory_floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Packaging Machine Wrap

| | |
|---|---|
| **Mission ID** | `factorybot_packaging_machine_wrap` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Wrap 8 packages before belt overflow.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Grey concrete centre stripe yellow; one wall conveyor belt animation.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Overhead crane silhouette
2. Conveyor drop zone
3. Assembly arm (background)

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`factory_floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Industry 4.0 Efficiency

| | |
|---|---|
| **Mission ID** | `factorybot_industry_4_0_efficiency` |
| **Arena code** | `colosseum` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone shift: build, QC, ship, zero defects.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Grey concrete centre stripe yellow; one wall conveyor belt animation. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Grey concrete with yellow centre stripe

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Overhead crane silhouette
2. Conveyor drop zone
3. Assembly arm (background)

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Factory Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Factory Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`factory_floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🌙 SPACE ROVER — Robot Visual Bible

## Kid fantasy hook
Lunar explorer on grey regolith under starfield

## This robot is NOT
orange Mars dirt (that is Crawler), farm soil

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `lunar_grey` — Grey lunar surface |
| **Sky / atmosphere** | Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars. |
| **Path material** | Pale grey regolith with boot-print texture |
| **Signature landmark** | Satellite dish or sample station |
| **Camera** | `rover_wide` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.spacerover` + `buildChassisFloor('lunar_grey')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Space Rover)
Satellite dish or sample station; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Lunar Surface Exploration

| | |
|---|---|
| **Mission ID** | `spacerover_lunar_surface_exploration` |
| **Arena code** | `alien_planet` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Drive alien_planet rim and tag 6 landmarks.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Pale grey regolith with boot-print decals; low-gravity float particles.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Earth blue marble on horizon
2. Satellite dish
3. Sample station flag

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lunar_grey + crater bumps` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Martian Soil Sample Drill

| | |
|---|---|
| **Mission ID** | `spacerover_martian_soil_sample_drill` |
| **Arena code** | `desert_rally` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Drill 5 sample cores in desert_rally zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Solar Panel Deployment

| | |
|---|---|
| **Mission ID** | `spacerover_solar_panel_deployment` |
| **Arena code** | `space_corridor` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Deploy panels at 4 station markers.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Pale grey regolith with boot-print decals; low-gravity float particles.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Earth blue marble on horizon
2. Satellite dish
3. Sample station flag

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lunar_grey + crater bumps` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Crater Rim Traverse

| | |
|---|---|
| **Mission ID** | `spacerover_crater_rim_traverse` |
| **Arena code** | `lava_canyon` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Circle crater on rough terrain without flip.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Pale grey regolith with boot-print decals; low-gravity float particles.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Earth blue marble on horizon
2. Satellite dish
3. Sample station flag

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lunar_grey + crater bumps` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Dust Storm Navigation

| | |
|---|---|
| **Mission ID** | `spacerover_dust_storm_navigation` |
| **Arena code** | `alien_planet` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Navigate during reduced visibility storm.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Pale grey regolith with boot-print decals; low-gravity float particles.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Earth blue marble on horizon
2. Satellite dish
3. Sample station flag

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lunar_grey + crater bumps` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Moon Base Construction

| | |
|---|---|
| **Mission ID** | `spacerover_moon_base_construction` |
| **Arena code** | `rough` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Deliver bricks to base construction pads.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Pale grey regolith with boot-print decals; low-gravity float particles.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Earth blue marble on horizon
2. Satellite dish
3. Sample station flag

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lunar_grey + crater bumps` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Alien Fossil Discovery

| | |
|---|---|
| **Mission ID** | `spacerover_alien_fossil_discovery` |
| **Arena code** | `space_orbit` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Scan fossils in lava_canyon dig site.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Pale grey regolith with boot-print decals; low-gravity float particles.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Earth blue marble on horizon
2. Satellite dish
3. Sample station flag

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lunar_grey + crater bumps` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Space Communication Array

| | |
|---|---|
| **Mission ID** | `spacerover_space_communication_array` |
| **Arena code** | `desert_rally` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Align rover with comm dish at space_corridor.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Pale grey regolith with boot-print decals; low-gravity float particles.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Earth blue marble on horizon
2. Satellite dish
3. Sample station flag

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lunar_grey + crater bumps` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Rover Battery Conservation

| | |
|---|---|
| **Mission ID** | `spacerover_rover_battery_conservation` |
| **Arena code** | `crystal_caverns` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Complete route using minimum energy.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Pale grey regolith with boot-print decals; low-gravity float particles.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Earth blue marble on horizon
2. Satellite dish
3. Sample station flag

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lunar_grey + crater bumps` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Interplanetary Pioneer

| | |
|---|---|
| **Mission ID** | `spacerover_interplanetary_pioneer` |
| **Arena code** | `warp_gate` |
| **Environment** | Red Planet Base (`martian`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone Mars mission: drill, build, return.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Pale grey regolith with boot-print decals; low-gravity float particles. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Pale grey regolith with boot-print texture

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Earth blue marble on horizon
2. Satellite dish
3. Sample station flag

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Space Rover: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Space Rover "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`lunar_grey + crater bumps` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🧱 LEGO BOT — Robot Visual Bible

## Kid fantasy hook
Playroom hero on yellow stud mat

## This robot is NOT
realistic concrete, mine tunnels

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `stud_mat` — LEGO play mat |
| **Sky / atmosphere** | Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood. |
| **Path material** | Yellow stud mat with red brick lane markers |
| **Signature landmark** | Oversized 2×4 brick stack |
| **Camera** | `rover_wide` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.legobot` + `buildChassisFloor('stud_mat')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for LEGO Bot)
Oversized 2×4 brick stack; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Brick Stacking Tower

| | |
|---|---|
| **Mission ID** | `legobot_brick_stacking_tower` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Stack bricks to target height in factory yard.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Yellow stud mat path with red brick lane markers.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oversized 2×4 brick stack
2. Brick wall silhouette
3. Stud checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`stud_mat + addStudPattern()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Pattern Brick Matching

| | |
|---|---|
| **Mission ID** | `legobot_pattern_brick_matching` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Match the pattern shown on the blueprint.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Yellow stud mat path with red brick lane markers.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oversized 2×4 brick stack
2. Brick wall silhouette
3. Stud checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`stud_mat + addStudPattern()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — LEGO Bridge Construction

| | |
|---|---|
| **Mission ID** | `legobot_lego_bridge_construction` |
| **Arena code** | `warehouse` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Span gap with bridge of correct length.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Narrow wooden bridge section (4m wide) over visible gap; guard ropes on sides.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rope bridge with plank texture
2. 1 support post per side
3. Finish flag on far bank

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('stud_mat')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Gear Mechanism Assembly

| | |
|---|---|
| **Mission ID** | `legobot_gear_mechanism_assembly` |
| **Arena code** | `underground_mine` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Insert gears so mechanism spins freely.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Yellow stud mat path with red brick lane markers.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oversized 2×4 brick stack
2. Brick wall silhouette
3. Stud checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`stud_mat + addStudPattern()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Brick Sorting Hopper

| | |
|---|---|
| **Mission ID** | `legobot_brick_sorting_hopper` |
| **Arena code** | `power_garden` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Sort colors into correct hoppers.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Yellow stud mat path with red brick lane markers.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oversized 2×4 brick stack
2. Brick wall silhouette
3. Stud checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`stud_mat + addStudPattern()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — LEGO Vehicle Crafting

| | |
|---|---|
| **Mission ID** | `legobot_lego_vehicle_crafting` |
| **Arena code** | `pipeline_crawl` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Build drivable mini vehicle on pad.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Yellow stud mat path with red brick lane markers.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oversized 2×4 brick stack
2. Brick wall silhouette
3. Stud checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`stud_mat + addStudPattern()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Wall Building Challenge

| | |
|---|---|
| **Mission ID** | `legobot_wall_building_challenge` |
| **Arena code** | `urban_obstacle` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Build wall to cover breach in warehouse.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Yellow stud mat path with red brick lane markers.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oversized 2×4 brick stack
2. Brick wall silhouette
3. Stud checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`stud_mat + addStudPattern()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Brick Demolition Smash

| | |
|---|---|
| **Mission ID** | `legobot_brick_demolition_smash` |
| **Arena code** | `factory_floor` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Clear rubble blocks from the lane.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Yellow stud mat path with red brick lane markers.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oversized 2×4 brick stack
2. Brick wall silhouette
3. Stud checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`stud_mat + addStudPattern()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Robotic Crane Latch

| | |
|---|---|
| **Mission ID** | `legobot_robotic_crane_latch` |
| **Arena code** | `auto_factory` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Latch and lift beam with crane attachment.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Yellow stud mat path with red brick lane markers.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oversized 2×4 brick stack
2. Brick wall silhouette
3. Stud checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`stud_mat + addStudPattern()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Master Builder Grand Prize

| | |
|---|---|
| **Mission ID** | `legobot_master_builder_grand_prize` |
| **Arena code** | `colosseum` |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone build: bridge, wall, vehicle.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Yellow stud mat path with red brick lane markers. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Yellow stud mat with red brick lane markers

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Oversized 2×4 brick stack
2. Brick wall silhouette
3. Stud checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for LEGO Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see LEGO Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`stud_mat + addStudPattern()` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# ⚔️ BATTLE BOT — Robot Visual Bible

## Kid fantasy hook
Industrial mech combat on metal grating

## This robot is NOT
sand desert (Tank), magic runes (Blaster)

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `combat_ring` — Mech combat arena |
| **Sky / atmosphere** | Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum. |
| **Path material** | Metal grating ring platform |
| **Signature landmark** | Energy core or opponent mech |
| **Camera** | `combat_cam` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.battlebot` + `buildChassisFloor('combat_ring')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Battle Bot)
Energy core or opponent mech; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Mech Combat Duel

| | |
|---|---|
| **Mission ID** | `battlebot_mech_combat_duel` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Defeat training mech in robot_fight ring.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Elevated metal grating combat platform with neon trim.

**Ground / flight surface:** Metal grating ring platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core pedestal
2. Opponent mech silhouette
3. Stadium rim lights

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Laser Cannon Target Range

| | |
|---|---|
| **Mission ID** | `battlebot_laser_cannon_target_range` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Destroy 10 targets with laser volleys.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Metal grating ring platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`combat_ring` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Missile Barrage Salvo

| | |
|---|---|
| **Mission ID** | `battlebot_missile_barrage_salvo` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Fire salvo at moving aerial drones.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Elevated metal grating combat platform with neon trim.

**Ground / flight surface:** Metal grating ring platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core pedestal
2. Opponent mech silhouette
3. Stadium rim lights

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Energy Shield Defense

| | |
|---|---|
| **Mission ID** | `battlebot_energy_shield_defense` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Block attacks until shield recharges.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Metal grating ring platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core or opponent mech
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Arena Mech Survival

| | |
|---|---|
| **Mission ID** | `battlebot_arena_mech_survival` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Survive 3 waves in colosseum.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Metal grating ring platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core or opponent mech
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Destructible Arena Smash

| | |
|---|---|
| **Mission ID** | `battlebot_destructible_arena_smash` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Break arena walls to corner opponent.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Metal grating ring platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core or opponent mech
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Jump Jet Slam

| | |
|---|---|
| **Mission ID** | `battlebot_jump_jet_slam` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Jet slam attack on armored target.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Power Core Overdrive

| | |
|---|---|
| **Mission ID** | `battlebot_power_core_overdrive` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Overdrive without meltdown — win duel.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Metal grating ring platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Heavy Mech Escort

| | |
|---|---|
| **Mission ID** | `battlebot_heavy_mech_escort` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Escort convoy through combat zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Metal grating ring platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core or opponent mech
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Apex Mech Champion

| | |
|---|---|
| **Mission ID** | `battlebot_apex_mech_champion` |
| **Arena code** | `robot_fight` |
| **Environment** | Mech combat arena (`sandbox`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Boss championship fight — best of 3 rounds.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Metal grating ring platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core or opponent mech
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Battle Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Battle Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🥊 STRIKER — Robot Visual Bible

## Kid fantasy hook
Classic boxing stadium with canvas ring

## This robot is NOT
open desert yard, tank bunkers

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `combat_ring` — Boxing stadium |
| **Sky / atmosphere** | Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre. |
| **Path material** | Boxing canvas with rope square |
| **Signature landmark** | Punching bag or opponent boxer |
| **Camera** | `combat_cam` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.striker` + `buildChassisFloor('combat_ring')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Striker)
Punching bag or opponent boxer; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — 1v1 Ring Duel

| | |
|---|---|
| **Mission ID** | `striker_1v1_ring_duel` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Knockout opponent in boxing ring.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Punching Dummy Speed Trial

| | |
|---|---|
| **Mission ID** | `striker_punching_dummy_speed_trial` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Land 20 punches in 30 seconds.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Boxing canvas with rope square

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Punching bag or opponent boxer
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Heavyweight Boss Showdown

| | |
|---|---|
| **Mission ID** | `striker_heavyweight_boss_showdown` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Beat boss with block-and-counter.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Boxing canvas with rope square

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Punching bag or opponent boxer
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Speed Bag Rhythm Test

| | |
|---|---|
| **Mission ID** | `striker_speed_bag_rhythm_test` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Match rhythm combo on speed bag.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Boxing canvas with rope square

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Punching bag or opponent boxer
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Knockout Speedrun

| | |
|---|---|
| **Mission ID** | `striker_knockout_speedrun` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · KO within 60 seconds.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Boxing canvas with rope square

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Punching bag or opponent boxer
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Block and Counter Punch

| | |
|---|---|
| **Mission ID** | `striker_block_and_counter_punch` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Block 5 hits then counter for KO.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Boxing canvas with rope square

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Punching bag or opponent boxer
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — 10-Strike Combo Streak

| | |
|---|---|
| **Mission ID** | `striker_10_strike_combo_streak` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Land 10-hit combo without missing.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Boxing canvas with rope square

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Punching bag or opponent boxer
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Tag Team Boxing Rumble

| | |
|---|---|
| **Mission ID** | `striker_tag_team_boxing_rumble` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Tag partner and win 2v2 round.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Classic 6m boxing canvas with red rope square; crowd colour blobs in darkness.

**Ground / flight surface:** Boxing canvas with rope square

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Corner posts with red pads
2. Punching bag training prop
3. Opponent silhouette

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`BoxingRing + stadium spotlights` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Iron Guard Survival

| | |
|---|---|
| **Mission ID** | `striker_iron_guard_survival` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Survive 90s against rush attacks.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Boxing canvas with rope square

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Punching bag or opponent boxer
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Ring Out Knockdown

| | |
|---|---|
| **Mission ID** | `striker_ring_out_knockdown` |
| **Arena code** | `robot_fight` |
| **Environment** | Boxing stadium (`sandbox`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Ring-out opponent off platform edge.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Long aerial spline with 8 premium holo rings (buildPremiumHoloRing); wide forgiving spacing. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Striker: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Striker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# ✨ BLASTER — Robot Visual Bible

## Kid fantasy hook
Elemental magic rune arena

## This robot is NOT
boxing ropes, desert sand

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `combat_ring` — Magic elemental arena |
| **Sky / atmosphere** | Mystical purple arena with floating rune circles and elemental colour orbs. |
| **Path material** | Runed stone circle platform |
| **Signature landmark** | Spell target crystal or mana fountain |
| **Camera** | `combat_cam` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.blaster` + `buildChassisFloor('combat_ring')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Blaster)
Spell target crystal or mana fountain; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Fireball Blast Trial

| | |
|---|---|
| **Mission ID** | `blaster_fireball_blast_trial` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Ignite 8 torches with fireballs.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wet dark asphalt reflecting orange fire glow from one building silhouette.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Cartoon fire glow (one building)
2. Fire hydrant
3. Rescue zone green beacon

#### LIGHTING & POST

Fire as secondary key light; smoke haze opacity 0.15.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Ice Beam Freeze

| | |
|---|---|
| **Mission ID** | `blaster_ice_beam_freeze` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Freeze water elementals before they reach you.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spell target crystal or mana fountain
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Lightning Chain Reaction

| | |
|---|---|
| **Mission ID** | `blaster_lightning_chain_reaction` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Chain lightning through 5 bots.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spell target crystal or mana fountain
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Arcane Shield Ward

| | |
|---|---|
| **Mission ID** | `blaster_arcane_shield_ward` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Block 10 magic projectiles.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spell target crystal or mana fountain
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Mana Crystal Harvest

| | |
|---|---|
| **Mission ID** | `blaster_mana_crystal_harvest` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Collect crystals to power spells.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Glowing crystal cluster (emissive cyan)
2. Ore cart silhouette
3. Deposit zone green pad

#### LIGHTING & POST

Amber wall lights + crystal emissive bloom 0.9.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Elemental Combination

| | |
|---|---|
| **Mission ID** | `blaster_elemental_combination` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Combine fire + ice for steam blast puzzle.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spell target crystal or mana fountain
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Spell Casting Speedrun

| | |
|---|---|
| **Mission ID** | `blaster_spell_casting_speedrun` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Cast 5 spells in correct order fast.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spell target crystal or mana fountain
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Telekinesis Object Move

| | |
|---|---|
| **Mission ID** | `blaster_telekinesis_object_move` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Move boulders onto pressure plates.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spell target crystal or mana fountain
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Elemental Wave Survival

| | |
|---|---|
| **Mission ID** | `blaster_elemental_wave_survival` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Survive 4 elemental attack waves.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spell target crystal or mana fountain
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Archmage Boss Showdown

| | |
|---|---|
| **Mission ID** | `blaster_archmage_boss_showdown` |
| **Arena code** | `robot_fight` |
| **Environment** | Magic elemental arena (`sandbox`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Defeat Ancient Elemental Lord.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Runed stone circle platform

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Mystical purple arena with floating rune circles and elemental colour orbs.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spell target crystal or mana fountain
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Blaster: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Blaster "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# ⚔️ NINJA BOT — Robot Visual Bible

## Kid fantasy hook
Temple roof ninja under torii gates

## This robot is NOT
factory floor, Mars

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `temple_tiles` — Japanese temple roof |
| **Sky / atmosphere** | Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections. |
| **Path material** | Dark tiles with moonlit edge highlights |
| **Signature landmark** | Torii gate or training dummy |
| **Camera** | `stealth_follow` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.ninja` + `buildChassisFloor('temple_tiles')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Ninja Bot)
Torii gate or training dummy; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Laser Grid Infiltration

| | |
|---|---|
| **Mission ID** | `ninja_laser_grid_infiltration` |
| **Arena code** | `museum_heist` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Cross shadow_escape grid undetected.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Shuriken Target Accuracy

| | |
|---|---|
| **Mission ID** | `ninja_shuriken_target_accuracy` |
| **Arena code** | `shadow_escape` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Hit 10 targets with shuriken.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Shadow Clone Duel

| | |
|---|---|
| **Mission ID** | `ninja_shadow_clone_duel` |
| **Arena code** | `cyber_city` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Defeat shadow clone in mirror match.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Wall Jump Tower Parkour

| | |
|---|---|
| **Mission ID** | `ninja_wall_jump_tower_parkour` |
| **Arena code** | `night_patrol` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Wall-jump climb the tower.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Vertical wall holds path; camera tilted 90° for ceiling sections.

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Speed Dash Assassination

| | |
|---|---|
| **Mission ID** | `ninja_speed_dash_assassination` |
| **Arena code** | `shadow_escape` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Dash to target before alarm triggers.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Smoke Bomb Maze Escape

| | |
|---|---|
| **Mission ID** | `ninja_smoke_bomb_maze_escape` |
| **Arena code** | `museum_heist` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Escape maze after smoke deploy.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Parry & Katana Counter

| | |
|---|---|
| **Mission ID** | `ninja_parry_katana_counter` |
| **Arena code** | `cyber_city` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Parry 5 strikes then counter.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Silent Footsteps Trial

| | |
|---|---|
| **Mission ID** | `ninja_silent_footsteps_trial` |
| **Arena code** | `night_patrol` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Complete route with zero noise.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Rooftop Night Sprint

| | |
|---|---|
| **Mission ID** | `ninja_rooftop_night_sprint` |
| **Arena code** | `escape_wall` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Sprint rooftops in night_patrol city.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Sensei Boss Showdown

| | |
|---|---|
| **Mission ID** | `ninja_sensei_boss_showdown` |
| **Arena code** | `jump_world` |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Defeat sensei in final duel.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Dark rooftop or temple tiles with pink laser grid lines (max 6 beams). Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Dark tiles with moonlit edge highlights

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Torii gate OR hack terminal
2. Laser grid pairs
3. Goal vault door glow

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Ninja Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Ninja Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`temple_tiles` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 💢 BERSERKER — Robot Visual Bible

## Kid fantasy hook
Rage pit with lava glow cracks

## This robot is NOT
clean boxing stadium

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `combat_ring` — Rage pit arena |
| **Sky / atmosphere** | Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight. |
| **Path material** | Obsidian ring with crack glow |
| **Signature landmark** | Training dummy or rage totem |
| **Camera** | `combat_cam` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.berserker` + `buildChassisFloor('combat_ring')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Berserker)
Training dummy or rage totem; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Rage Gauge Breakout

| | |
|---|---|
| **Mission ID** | `berserker_rage_gauge_breakout` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Fill rage meter and unleash burst.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Destructible Wall Crush

| | |
|---|---|
| **Mission ID** | `berserker_destructible_wall_crush` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Smash through 6 walls to target.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Ground Pound Shockwave

| | |
|---|---|
| **Mission ID** | `berserker_ground_pound_shockwave` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Pound to stun surrounding enemies.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Unstoppable Charge

| | |
|---|---|
| **Mission ID** | `berserker_unstoppable_charge` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Charge through line of defenders.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Berserker Overdrive

| | |
|---|---|
| **Mission ID** | `berserker_berserker_overdrive` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Win fight while in overdrive mode.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Heavy Hammer Slam

| | |
|---|---|
| **Mission ID** | `berserker_heavy_hammer_slam` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Slam hammer on weak-point markers.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Brawler Pit Survival

| | |
|---|---|
| **Mission ID** | `berserker_brawler_pit_survival` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Survive pit brawl for 2 minutes.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Shield Crusher Strike

| | |
|---|---|
| **Mission ID** | `berserker_shield_crusher_strike` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Break enemy shield with charged hit.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Lava Arena Brawl

| | |
|---|---|
| **Mission ID** | `berserker_lava_arena_brawl` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Win fight on volcano_drift arena edge.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Titan Rage Boss Duel

| | |
|---|---|
| **Mission ID** | `berserker_titan_rage_boss_duel` |
| **Arena code** | `robot_fight` |
| **Environment** | Rage pit arena (`sandbox`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Defeat titan boss in final rage duel.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Obsidian ring with orange lava glow cracks visible below. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Obsidian ring with crack glow

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rage totem
2. Training dummy
3. Red spotlight cone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Berserker: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Berserker "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('combat_ring')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🏥 MED BOT — Robot Visual Bible

## Kid fantasy hook
Hospital corridor on checker tiles

## This robot is NOT
Mars, mine tunnel, boxing ring

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `hospital_tile` — Hospital corridor |
| **Sky / atmosphere** | Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street. |
| **Path material** | White-blue checker tile corridor |
| **Signature landmark** | Hospital bed or gurney station |
| **Camera** | `chase_close` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.medbot` + `buildChassisFloor('hospital_tile')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Med Bot)
Hospital bed or gurney station; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Emergency Triage Response

| | |
|---|---|
| **Mission ID** | `medbot_emergency_triage_response` |
| **Arena code** | `firebot_blaze` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Reach patient in 15s in hospital_walk.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Defibrillator Shock Recharge

| | |
|---|---|
| **Mission ID** | `medbot_defibrillator_shock_recharge` |
| **Arena code** | `hospital_walk` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Time shock pulse to restart heart.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Bandage Wrap Precision

| | |
|---|---|
| **Mission ID** | `medbot_bandage_wrap_precision` |
| **Arena code** | `snow_rescue` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Bandage 3 limbs on wounded bot.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Antidote Medicine Mix

| | |
|---|---|
| **Mission ID** | `medbot_antidote_medicine_mix` |
| **Arena code** | `firebot_blaze` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Mix correct chemical doses at station.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Hospital Corridor Dash

| | |
|---|---|
| **Mission ID** | `medbot_hospital_corridor_dash` |
| **Arena code** | `hospital_walk` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Transport stretcher without jostling.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Vital Signs Monitor

| | |
|---|---|
| **Mission ID** | `medbot_vital_signs_monitor` |
| **Arena code** | `snow_rescue` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Read temp, pulse, oxygen at bedside.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Quarantine Zone Containment

| | |
|---|---|
| **Mission ID** | `medbot_quarantine_zone_containment` |
| **Arena code** | `lava_canyon` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Isolate infected bots safely.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Surgical Laser Precision

| | |
|---|---|
| **Mission ID** | `medbot_surgical_laser_precision` |
| **Arena code** | `cyber_city` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Remove splinter with laser arm.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Medical Supply Helicopter Drop

| | |
|---|---|
| **Mission ID** | `medbot_medical_supply_helicopter_drop` |
| **Arena code** | `snow_rescue` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Catch dropped medicine crates.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Chief Medical Officer

| | |
|---|---|
| **Mission ID** | `medbot_chief_medical_officer` |
| **Arena code** | `firebot_blaze` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Save 10 patients in ER capstone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** White-blue checker tile corridor

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Med Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Med Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🔥 FIRE BOT — Robot Visual Bible

## Kid fantasy hook
Burning city streets with wet reflective asphalt

## This robot is NOT
snow, underwater, farm

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `wet_street` — Burning city block |
| **Sky / atmosphere** | Orange smoke sky, cartoon fire glow on one building, reflective puddles on street. |
| **Path material** | Wet dark asphalt reflecting fire light |
| **Signature landmark** | Fire hydrant or burning doorway |
| **Camera** | `chase_close` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.firebot` + `buildChassisFloor('wet_street')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Fire Bot)
Fire hydrant or burning doorway; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Water Cannon Blaze Extinguish

| | |
|---|---|
| **Mission ID** | `firebot_water_cannon_blaze_extinguish` |
| **Arena code** | `firebot_blaze` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Extinguish 5 fires in firebot_blaze zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Brown soil furrows between green crop strips; rows run parallel to path.

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red barn silhouette on horizon
2. Hay bale OR apple tree (mode-specific)
3. Sunny checkpoint flags

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`farm_field floor + addSideStripes(green)` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Smoke Rescue Dash

| | |
|---|---|
| **Mission ID** | `firebot_smoke_rescue_dash` |
| **Arena code** | `hospital_walk` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Evacuate 3 bots from smoke-filled building.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wet dark asphalt reflecting orange fire glow from one building silhouette.

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Cartoon fire glow (one building)
2. Fire hydrant
3. Rescue zone green beacon

#### LIGHTING & POST

Fire as secondary key light; smoke haze opacity 0.15.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('wet_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Fire Hydrant Hookup

| | |
|---|---|
| **Mission ID** | `firebot_fire_hydrant_hookup` |
| **Arena code** | `snow_rescue` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Connect hose to 3 hydrants in order.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wet dark asphalt reflecting orange fire glow from one building silhouette.

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Cartoon fire glow (one building)
2. Fire hydrant
3. Rescue zone green beacon

#### LIGHTING & POST

Fire as secondary key light; smoke haze opacity 0.15.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('wet_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Chemical Fire Suppression

| | |
|---|---|
| **Mission ID** | `firebot_chemical_fire_suppression` |
| **Arena code** | `firebot_blaze` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Deploy foam on oil blaze safely.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wet dark asphalt reflecting orange fire glow from one building silhouette.

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Cartoon fire glow (one building)
2. Fire hydrant
3. Rescue zone green beacon

#### LIGHTING & POST

Fire as secondary key light; smoke haze opacity 0.15.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('wet_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Burning Tower Ladder Climb

| | |
|---|---|
| **Mission ID** | `firebot_burning_tower_ladder_climb` |
| **Arena code** | `hospital_walk` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Extend ladder to top floor window.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Stepped incline path rising 4–8m with 3 wide terraces; each terrace is a full platform (not a thin ramp).

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Summit flag on top terrace
2. 2 mid-slope checkpoint flags
3. Dust puff particles on climb

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('wet_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Wildfire Perimeter Trench

| | |
|---|---|
| **Mission ID** | `firebot_wildfire_perimeter_trench` |
| **Arena code** | `snow_rescue` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Carve firebreak before spread reaches town.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Dark asphalt with white patrol centre line and orange cone posts.

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Chain-link fence silhouette
2. Security gate arm OR scanner booth
3. Blue checkpoint posts

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`asphalt_lot floor` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Gas Explosion Response

| | |
|---|---|
| **Mission ID** | `firebot_gas_explosion_response` |
| **Arena code** | `lava_canyon` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Cool overheating gas tanks before blast.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wet dark asphalt reflecting orange fire glow from one building silhouette.

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Cartoon fire glow (one building)
2. Fire hydrant
3. Rescue zone green beacon

#### LIGHTING & POST

Fire as secondary key light; smoke haze opacity 0.15.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('wet_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Emergency Siren Rush

| | |
|---|---|
| **Mission ID** | `firebot_emergency_siren_rush` |
| **Arena code** | `cyber_city` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Drive engine to scene under time limit.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wet dark asphalt reflecting orange fire glow from one building silhouette.

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Cartoon fire glow (one building)
2. Fire hydrant
3. Rescue zone green beacon

#### LIGHTING & POST

Fire as secondary key light; smoke haze opacity 0.15.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('wet_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Flashover Prevention

| | |
|---|---|
| **Mission ID** | `firebot_flashover_prevention` |
| **Arena code** | `snow_rescue` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Vent hot gases before room flashes over.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wet dark asphalt reflecting orange fire glow from one building silhouette.

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Cartoon fire glow (one building)
2. Fire hydrant
3. Rescue zone green beacon

#### LIGHTING & POST

Fire as secondary key light; smoke haze opacity 0.15.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('wet_street')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Chief Fire Officer Medal

| | |
|---|---|
| **Mission ID** | `firebot_chief_fire_officer_medal` |
| **Arena code** | `firebot_blaze` |
| **Environment** | Burning City District (`emergency`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone multi-blaze city mission.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

White-blue checker tile corridor 4m wide; walls implied by ceiling lights. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Wet dark asphalt reflecting fire light

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Blue cross wall sign
2. Gurney station
3. Green exit arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Fire Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Fire Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`hospital_tile checker` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# ✈️ JET PLANE — Robot Visual Bible

## Kid fantasy hook
Supersonic military sky over carrier vista

## This robot is NOT
copy Drone ring layout without carrier/speed props

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `open_sky` — Military open sky |
| **Sky / atmosphere** | Clear blue military sky. Aircraft carrier deck or runway silhouette far below. |
| **Path material** | High-speed ring gates over clouds |
| **Signature landmark** | Carrier deck or target drone |
| **Camera** | `aerial_chase` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.jetplane` + `buildChassisFloor('open_sky')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Jet Plane)
Carrier deck or target drone; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Supersonic Dogfight

| | |
|---|---|
| **Mission ID** | `jetplane_supersonic_dogfight` |
| **Arena code** | `drone_canyon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Outmaneuver enemy jet in canyon_flight.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Precision Air Strike

| | |
|---|---|
| **Mission ID** | `jetplane_precision_air_strike` |
| **Arena code** | `canyon_flight` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Hit ground targets without collateral.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Aircraft Carrier Touch-and-Go

| | |
|---|---|
| **Mission ID** | `jetplane_aircraft_carrier_touch_and_go` |
| **Arena code** | `storm_cloud` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Land and launch on carrier deck.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Mach 2 Speed Trap

| | |
|---|---|
| **Mission ID** | `jetplane_mach_2_speed_trap` |
| **Arena code** | `cloud_race` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Break Mach 2 through speed trap gates.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Radar Evasion Stealth Flight

| | |
|---|---|
| **Mission ID** | `jetplane_radar_evasion_stealth_flight` |
| **Arena code** | `space_orbit` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Cross zone without radar lock.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Missile Jammer Countermeasures

| | |
|---|---|
| **Mission ID** | `jetplane_missile_jammer_countermeasures` |
| **Arena code** | `flight_rings` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Jam incoming missiles during run.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Mid-Air Tanker Refuel

| | |
|---|---|
| **Mission ID** | `jetplane_mid_air_tanker_refuel` |
| **Arena code** | `jet_stunt` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Dock with tanker mid-flight.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Canyon Run Precision

| | |
|---|---|
| **Mission ID** | `jetplane_canyon_run_precision` |
| **Arena code** | `rooftop_delivery` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Thread canyon at minimum altitude.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Escort Transport Jet

| | |
|---|---|
| **Mission ID** | `jetplane_escort_transport_jet` |
| **Arena code** | `typhoon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Escort cargo plane through typhoon.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Top Gun Ace Fighter

| | |
|---|---|
| **Mission ID** | `jetplane_top_gun_ace_fighter` |
| **Arena code** | `warp_gate` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone dogfight + strike + carrier landing.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Long aerial spline with 8 premium holo rings (buildPremiumHoloRing); wide forgiving spacing. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Clear blue military sky. Aircraft carrier deck or runway silhouette far below.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Jet Plane: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Jet Plane "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🛩️ STEALTH JET — Robot Visual Bible

## Kid fantasy hook
Night ops with radar dome and stars

## This robot is NOT
golden sunset (that is Drone/Jet day)

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `open_sky` — Stealth night ops |
| **Sky / atmosphere** | Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights. |
| **Path material** | Stealth corridor avoiding radar sweeps |
| **Signature landmark** | Radar dome or hangar opening |
| **Camera** | `aerial_chase` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.steathjet` + `buildChassisFloor('open_sky')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Stealth Jet)
Radar dome or hangar opening; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Radar Dome Infiltration

| | |
|---|---|
| **Mission ID** | `steathjet_radar_dome_infiltration` |
| **Arena code** | `drone_canyon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Penetrate radar dome undetected.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Night Bombing Raid

| | |
|---|---|
| **Mission ID** | `steathjet_night_bombing_raid` |
| **Arena code** | `canyon_flight` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Hit targets on night_patrol map.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Thermal Signature Suppression

| | |
|---|---|
| **Mission ID** | `steathjet_thermal_signature_suppression` |
| **Arena code** | `storm_cloud` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Stay cold on thermal sensors.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Shadow Formation Flight

| | |
|---|---|
| **Mission ID** | `steathjet_shadow_formation_flight` |
| **Arena code** | `cloud_race` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Fly formation without breaking stealth.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Electronic Warfare Jamming

| | |
|---|---|
| **Mission ID** | `steathjet_electronic_warfare_jamming` |
| **Arena code** | `space_orbit` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Jam enemy comms at waypoint.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — High-Altitude Recon Photo

| | |
|---|---|
| **Mission ID** | `steathjet_high_altitude_recon_photo` |
| **Arena code** | `flight_rings` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Photograph 6 targets from altitude.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Silent Glide Approach

| | |
|---|---|
| **Mission ID** | `steathjet_silent_glide_approach` |
| **Arena code** | `jet_stunt` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Glide in with engines off.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Precision Missile Sniping

| | |
|---|---|
| **Mission ID** | `steathjet_precision_missile_sniping` |
| **Arena code** | `rooftop_delivery` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Single missile per target — no misses.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — EMP Bomb Drop

| | |
|---|---|
| **Mission ID** | `steathjet_emp_bomb_drop` |
| **Arena code** | `typhoon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · EMP drop disables grid then escape.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Ghost Jet Master

| | |
|---|---|
| **Mission ID** | `steathjet_ghost_jet_master` |
| **Arena code** | `warp_gate` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone stealth strike mission.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Long aerial spline with 8 premium holo rings (buildPremiumHoloRing); wide forgiving spacing. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Dark night sky, stars, radar dome with sweeping green cone below. Minimal lights.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Stealth Jet: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Stealth Jet "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🎪 AERO STUNT — Robot Visual Bible

## Kid fantasy hook
Airshow coast with smoke rings

## This robot is NOT
neon race ribbon (Racing Drone)

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `open_sky` — Sunset airshow coast |
| **Sky / atmosphere** | Warm sunset over coastline below. White smoke rings hang in the air from stunt plane. |
| **Path material** | Smoke ring course along the shore |
| **Signature landmark** | Red-white lighthouse or airshow banner |
| **Camera** | `aerial_chase` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.aerobat` + `buildChassisFloor('open_sky')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Aero Stunt)
Red-white lighthouse or airshow banner; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Smoke Trail Loop-de-Loop

| | |
|---|---|
| **Mission ID** | `aerobat_smoke_trail_loop_de_loop` |
| **Arena code** | `drone_canyon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Complete loop leaving smoke trail.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Smoke ring course along the shore

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red-white lighthouse or airshow banner
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Barrel Roll Speed Slalom

| | |
|---|---|
| **Mission ID** | `aerobat_barrel_roll_speed_slalom` |
| **Arena code** | `canyon_flight` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Barrel roll between slalom pylons.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Knife-Edge Flying

| | |
|---|---|
| **Mission ID** | `aerobat_knife_edge_flying` |
| **Arena code** | `storm_cloud` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Hold knife-edge through gate sequence.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Smoke ring course along the shore

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red-white lighthouse or airshow banner
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Air Show Formation Dance

| | |
|---|---|
| **Mission ID** | `aerobat_air_show_formation_dance` |
| **Arena code** | `cloud_race` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Mirror lead plane through formation.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Smoke ring course along the shore

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red-white lighthouse or airshow banner
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Touch-and-Go Ribbon Snip

| | |
|---|---|
| **Mission ID** | `aerobat_touch_and_go_ribbon_snip` |
| **Arena code** | `space_orbit` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Clip ribbon with wing on low pass.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Smoke ring course along the shore

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red-white lighthouse or airshow banner
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Inverted Flying Sprint

| | |
|---|---|
| **Mission ID** | `aerobat_inverted_flying_sprint` |
| **Arena code** | `flight_rings` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Inverted flight through cloud_race section.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Smoke ring course along the shore

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red-white lighthouse or airshow banner
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Hammerhead Turn Stunt

| | |
|---|---|
| **Mission ID** | `aerobat_hammerhead_turn_stunt` |
| **Arena code** | `jet_stunt` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Hammerhead at stunt checkpoint.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Smoke ring course along the shore

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red-white lighthouse or airshow banner
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Pyrotechnic Night Flight

| | |
|---|---|
| **Mission ID** | `aerobat_pyrotechnic_night_flight` |
| **Arena code** | `rooftop_delivery` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Fly fireworks display path.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Pylon Slalom Time Attack

| | |
|---|---|
| **Mission ID** | `aerobat_pylon_slalom_time_attack` |
| **Arena code** | `typhoon` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Best time through pylon course.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.

**Ground / flight surface:** Open air — no solid floor; cloud sea at y=-48.

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Spawn grass island with mechanical huts (buildSpawnSkyIsland)
2. 3 floating citadel islands offset from path
3. Distant silhouette mesas

#### LIGHTING & POST

Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`installPremiumAerialScenery() + enrichAerialFloatingIslands` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Red Bull Air Race Champion

| | |
|---|---|
| **Mission ID** | `aerobat_red_bull_air_race_champion` |
| **Arena code** | `warp_gate` |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Capstone aerobatic championship.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Smoke ring course along the shore

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Warm sunset over coastline below. White smoke rings hang in the air from stunt plane.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Red-white lighthouse or airshow banner
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Aero Stunt: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Aero Stunt "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('open_sky')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🐦 BIRD BOT — Robot Visual Bible

## Kid fantasy hook
Cartoon flappy side-scroll with green pipes

## This robot is NOT
3D flight rings, ground route

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `flappy_scroll` — Cartoon flappy sky |
| **Sky / atmosphere** | Flat cartoon blue sky, scrolling green hills, chunky green pipes. |
| **Path material** | Side-scroll lane with pipe gaps |
| **Signature landmark** | Slingshot or nest goal |
| **Camera** | `side_scroll` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.birdbot` + `buildChassisFloor('flappy_scroll')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Bird Bot)
Slingshot or nest goal; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Flappy Pipe Navigator

| | |
|---|---|
| **Mission ID** | `birdbot_flappy_pipe_navigator` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Flap through 10 pipe gaps on flappy_bird course.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Side-scroll lane; chunky green pipes with gap openings; hills scroll parallax.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 pipe pairs
2. Scrolling hill billboards
3. Nest goal at end

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`flappy_scroll + pipe kit` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Slingshot Target Launch

| | |
|---|---|
| **Mission ID** | `birdbot_slingshot_target_launch` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Catapult launch to hit distant target.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Side-scroll lane; chunky green pipes with gap openings; hills scroll parallax.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 pipe pairs
2. Scrolling hill billboards
3. Nest goal at end

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`flappy_scroll + pipe kit` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Endless Flappy Runner

| | |
|---|---|
| **Mission ID** | `birdbot_endless_flappy_runner` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Survive endless pipes — beat high score.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Side-scroll lane; chunky green pipes with gap openings; hills scroll parallax.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 pipe pairs
2. Scrolling hill billboards
3. Nest goal at end

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`flappy_scroll + pipe kit` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Golden Egg Rescue

| | |
|---|---|
| **Mission ID** | `birdbot_golden_egg_rescue` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Grab egg and land in nest zone.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Cracked asphalt with orange cones marking safe lane through rubble silhouettes.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Collapsed building silhouettes (2 max)
2. Survivor marker flag
3. Medkit drop zone

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('flappy_scroll')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Wind Gust Glide

| | |
|---|---|
| **Mission ID** | `birdbot_wind_gust_glide` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Ride gusts without crashing into pipes.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Side-scroll lane; chunky green pipes with gap openings; hills scroll parallax.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 pipe pairs
2. Scrolling hill billboards
3. Nest goal at end

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`flappy_scroll + pipe kit` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Gravity Flip Flappy

| | |
|---|---|
| **Mission ID** | `birdbot_gravity_flip_flappy` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Survive section with flipped gravity.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Side-scroll lane; chunky green pipes with gap openings; hills scroll parallax.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 pipe pairs
2. Scrolling hill billboards
3. Nest goal at end

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`flappy_scroll + pipe kit` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Precision Nest Landing

| | |
|---|---|
| **Mission ID** | `birdbot_precision_nest_landing` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Land precisely in small nest.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Side-scroll lane; chunky green pipes with gap openings; hills scroll parallax.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 pipe pairs
2. Scrolling hill billboards
3. Nest goal at end

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`flappy_scroll + pipe kit` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Balloon Pop Frenzy

| | |
|---|---|
| **Mission ID** | `birdbot_balloon_pop_frenzy` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Pop 15 balloons while flapping.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Side-scroll lane; chunky green pipes with gap openings; hills scroll parallax.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 pipe pairs
2. Scrolling hill billboards
3. Nest goal at end

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`flappy_scroll + pipe kit` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Fortress Brick Demolition

| | |
|---|---|
| **Mission ID** | `birdbot_fortress_brick_demolition` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Break brick wall with dive attack.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Elevated metal grating combat platform with neon trim.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core pedestal
2. Opponent mech silhouette
3. Stadium rim lights

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('flappy_scroll')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Flappy Bird Master 100

| | |
|---|---|
| **Mission ID** | `birdbot_flappy_bird_master_100` |
| **Arena code** | `flappy_bird` |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Score 100 points — capstone flappy run.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Side-scroll lane; chunky green pipes with gap openings; hills scroll parallax. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Side-scroll lane with pipe gaps

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

Flat cartoon blue sky, scrolling green hills, chunky green pipes.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. 2 pipe pairs
2. Scrolling hill billboards
3. Nest goal at end

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Bird Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Bird Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`flappy_scroll + pipe kit` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

# 🎓 CUSTOM BOT — Robot Visual Bible

## Kid fantasy hook
School robotics mat with tape path

## This robot is NOT
combat ring, Mars

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | `lab_grid` — School robotics mat |
| **Sky / atmosphere** | White lab with coloured zone squares on the mat. Bulletin board silhouette. |
| **Path material** | Tape path on white mat |
| **Signature landmark** | Checkpoint flag or trophy podium |
| **Camera** | `rover_wide` — robot fills 25–35% of screen height on tablet |
| **Code entry** | `CHASSIS_VISUAL_DNA.custom` + `buildChassisFloor('lab_grid')` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey `#e5e7eb` industrial
- **Accent:** emissive checkpoint / goal colour `#22c55e` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for Custom Bot)
Checkpoint flag or trophy podium; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---

### Mode 1 — Custom Test Drive

| | |
|---|---|
| **Mission ID** | `custom_custom_test_drive` |
| **Arena code** | `auto_factory` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Tutorial · Training |

**OBJECTIVE** · Test motors and wheels on open sandbox track.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Checkpoint flag or trophy podium
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 2 — Custom Obstacle Course

| | |
|---|---|
| **Mission ID** | `custom_custom_obstacle_course` |
| **Arena code** | `checkpoint` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Navigate user-placed obstacles.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Complete the objective · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Checkpoint flag or trophy podium
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 3 — Custom Sensor Calibration

| | |
|---|---|
| **Mission ID** | `custom_custom_sensor_calibration` |
| **Arena code** | `targets` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Easy · Training |

**OBJECTIVE** · Calibrate light, sonar, or IR sensors.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Checkpoint flag or trophy podium
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 4 — Custom Block Sandbox

| | |
|---|---|
| **Mission ID** | `custom_custom_block_sandbox` |
| **Arena code** | `delivery` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Freeplay all Blockly robot blocks.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Checkpoint flag or trophy podium
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 5 — Speed & Power Tuning

| | |
|---|---|
| **Mission ID** | `custom_speed_power_tuning` |
| **Arena code** | `line_follow` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Tune torque and acceleration constants.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Hit all checkpoints · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Checkpoint flag or trophy podium
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 6 — Custom Attachment Trial

| | |
|---|---|
| **Mission ID** | `custom_custom_attachment_trial` |
| **Arena code** | `dodge_easy` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Medium · Mission |

**OBJECTIVE** · Test arm, kicker, or shield attachment.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Checkpoint flag or trophy podium
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 7 — Custom AI Logic Trainer

| | |
|---|---|
| **Mission ID** | `custom_custom_ai_logic_trainer` |
| **Arena code** | `power_garden` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Train behavior tree on test bots.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Narrow wooden bridge section (4m wide) over visible gap; guard ropes on sides.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Rope bridge with plank texture
2. 1 support post per side
3. Finish flag on far bank

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 8 — Community Challenge Track

| | |
|---|---|
| **Mission ID** | `custom_community_challenge_track` |
| **Arena code** | `urban_obstacle` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Play community-published track.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Clean run — no penalties

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Checkpoint flag or trophy podium
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 9 — Custom Robot Duel

| | |
|---|---|
| **Mission ID** | `custom_custom_robot_duel` |
| **Arena code** | `crystal_caverns` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Hard · Mission |

**OBJECTIVE** · Fight preset bot with your build.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Elevated metal grating combat platform with neon trim.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Energy core pedestal
2. Opponent mech silhouette
3. Stadium rim lights

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

Welcoming — "I can do this!"

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

### Mode 10 (CAPSTONE) — Custom Master Showcase

| | |
|---|---|
| **Mission ID** | `custom_custom_master_showcase` |
| **Arena code** | `warehouse` |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Difficulty** | Expert · Mastery |

**OBJECTIVE** · Present final robot in showcase arena.

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ Finish the mission · ⭐⭐ Beat the time target · ⭐⭐⭐ Perfect mastery run

#### THE ARENA (layout & geometry — unique to this mode)

Wide readable route 5m across with emissive checkpoint pads every 20m. Capstone: add single celebratory particle burst at goal.

**Ground / flight surface:** Tape path on white mat

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

White lab with coloured zone squares on the mat. Bulletin board silhouette.

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

1. Checkpoint flag or trophy podium
2. 2 numbered checkpoint flags
3. Green goal beacon arch

#### LIGHTING & POST

Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

CAPSTONE for Custom Bot: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see Custom Bot "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

`PremiumKidArenaKit + buildChassisFloor('lab_grid')` · Route: `buildChassisRoute` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---

---

# PART 3 — QA CHECKLIST (per mission before ship)

- [ ] Screenshot squint test: correct robot identity without reading UI
- [ ] Prop count ≤ 4 chunky meshes in play view
- [ ] Goal visible from spawn
- [ ] No grey industrial floor unless Factory Bot
- [ ] Sky ≥ 60% for aerial; tunnel ceiling for mine modes
- [ ] Premium holo rings on all sky checkpoint missions
- [ ] `node scripts/verify-arena-visual-bible-v3.mjs` passes
- [ ] Kid clarity: no dressRouteCorridor scatter

---

# PART 4 — ROBOT DIFFERENTIATION MATRIX

| Robot | Floor identity | Sky identity | Never confuse with |
|-------|----------------|--------------|-------------------|
| Crawler | martian_dirt | Mars red-dirt hills | grey factory floor |
| Tank | desert_sand | Desert combat yard | boxing canvas |
| Stealth Bot | rooftop_tar | Night rooftop | bright farm noon |
| Mining Bot | mine_tunnel | Underground mine tunnel | open sunny sky |
| Security Bot | asphalt_lot | City security lot | Mars dirt |
| Farm Bot | farm_field | Outdoor farm field | grey industrial concrete |
| Spider Bot | climb_shaft | Vertical climb shaft | flat open desert |
| Droid | gym_mats | Humanoid training gym | farm field |
| Mech | scrap_yard | Industrial scrap yard | hospital |
| Drone | open_sky | cloud_sea | canyon rock walls pinching view |
| Racing Drone | open_sky | neon_ribbon | plain cloud sea only |
| Rescue Drone | rubble_street | Disaster city street | playful cloud playground |
| Helicopter | open_sky | ocean_platforms | identical to Drone cloud-only layout |
| Hover Bot | open_sky | floating_labs | farm soil |
| Hover Racer | open_sky | plasma_track | identical to Racing Drone pink ribbon |
| Sub Drone | sandy_seabed | Shallow coral bay | dry land |
| Deep Sea Bot | abyss_rock | Deep ocean trench | bright coral shallows only |
| Robot Arm | lab_grid | Clean workbench lab | dirt paths |
| Factory Bot | factory_floor | Factory assembly floor | outdoor farm |
| Space Rover | lunar_grey | Grey lunar surface | orange Mars dirt (that is Crawler) |
| LEGO Bot | stud_mat | LEGO play mat | realistic concrete |
| Battle Bot | combat_ring | Mech combat arena | sand desert (Tank) |
| Striker | combat_ring | Boxing stadium | open desert yard |
| Blaster | combat_ring | Magic elemental arena | boxing ropes |
| Ninja Bot | temple_tiles | Japanese temple roof | factory floor |
| Berserker | combat_ring | Rage pit arena | clean boxing stadium |
| Med Bot | hospital_tile | Hospital corridor | Mars |
| Fire Bot | wet_street | Burning city block | snow |
| Jet Plane | open_sky | carrier_deck | copy Drone ring layout without carrier/speed props |
| Stealth Jet | open_sky | radar_dome | golden sunset (that is Drone/Jet day) |
| Aero Stunt | open_sky | coastline | neon race ribbon (Racing Drone) |
| Bird Bot | flappy_scroll | Cartoon flappy sky | 3D flight rings |
| Custom Bot | lab_grid | School robotics mat | combat ring |

---

*Generated 330 mission specs · ByteBuddies Arena Visual Bible v4*
