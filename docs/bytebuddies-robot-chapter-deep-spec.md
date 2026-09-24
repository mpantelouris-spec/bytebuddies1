# BYTEBUDDIES — ROBOT CHAPTER DEEP SPEC
## Art-direction numbers · concept briefs · camera FOV · full gold chapters

> **Use with:** `bytebuddies-arena-visual-bible-v4.md` (all 330 missions) + `bytebuddies-arena-ship-playbook.md` (how to ship).
>
> **Gold chapters** (Crawler + Jet Plane) are copy-paste quality targets. Expand other robots using Part A template when their PR starts.

---


# PART A — ROBOT CHAPTER EXPANSION TEMPLATE

Copy this section for each robot when doing a deep art pass. Fill every row — empty cells mean "not ready to ship."

## [ROBOT NAME] — Deep Spec

### Concept art brief (4–6 sentences)
_Mood, kid fantasy, one film/game reference, what makes it NOT another robot._

### Palette
| Role | Hex | Three.js |
|------|-----|----------|
| Sky / ceiling | | |
| Ground / floor | | |
| Fog | | |
| Accent 1 | | |
| Goal emissive | #22c55e | |

### Camera
| preset | camBack | camUp | lookAhead | lookHeight | FOV | robot % |

### Lighting
| key color | intensity | position | hemi | shadows |

### Post
| bloom | threshold | radius |

### Fog
| near | far | color |

### Floor geometry
`floorKind`: ___ — describe meshes, not just color

### Signature meshes (≤4)
| name | size m | position | notes |

### Mode table (all 10)
| # | Name | Unique arena geometry | Hero prop | Mood |

### Never list
### Code files to touch


---


# GOLD CHAPTER — JET PLANE (aerial exemplar — reference screenshot)

## Concept art brief
*Saturday-morning cartoon fighter ace.* Golden-hour sky fills **70% of frame**. Chunky grass **floating islands** with rocky undersides; **orange mechanical huts** on grey metal pillars; **premium cyan/gold holo rings** with numbered sprites. Aircraft carrier far below. This is the **quality bar for all sky robots** — Drone gets cloud castle, Helicopter gets oil rigs, but **this** density and bloom level.

## Palette

| Role | Hex | Notes |
|------|-----|-------|
| Sky top | #3478b8 | Golden-hour recipe |
| Sky mid | #87b9d6 | |
| Sky horizon | #ffd39a | |
| Fog | #d7b78f | far 320m |
| Grass island | #4a8a3a / #5a9e3a | SkyGardenHeroKit |
| Rock underside | #6b5a4a | |
| Mech hut | #f97316 | buildSkyMechanicalHut |
| Pillar metal | #64748b | |
| Ring cyan | #00d4ff / #38bdf8 | buildPremiumHoloRing |
| Ring gold rim | #ffa040 | |
| Goal | #22c55e | final ring |

## Camera rig

| Parameter | Value |
|-----------|-------|
| Preset | `aerial_chase` |
| camBack | 10.5 m |
| camUp | 5.8 m |
| lookAhead | 12 m |
| lookHeight | 3.0 m |
| FOV | 48° (52° mode 4 speed) |
| Robot screen height | 25–30% |

## Lighting rig

| Light | Color | Intensity | Position |
|-------|-------|-----------|----------|
| PremiumKidSun | #ffd89b | 1.45 | (28, 42, 18) |
| Hemisphere | #87ceeb / #4a8a3a | 0.55 | — |
| Ring point lights | cyan | 0.45 | per gate |

## Post-processing

| bloom | threshold | radius | grade |
|-------|-----------|--------|-------|
| 0.24 | 0.88 | 0.18 | s1.18 c1.08 |

## Fog

| near | far |
|------|-----|
| 90 m | 320 m |

## World layers (install order)

1. `installGoldenHourSky()` — gradient dome
2. `addParallaxCloudLayers()` — 3 speeds
3. `buildSpawnSkyIsland()` — grass + 2 huts + windmill + flags
4. `scatterAerialIslands()` — 3 citadel heroes offset 40–54m
5. `scatterDistantSilhouetteIslands()` — 4 depth layers
6. `buildPremiumHoloRing()` × 6–8 gates
7. `enrichAerialFloatingIslands()` — GLTF towers async
8. `buildChassisAerialVista('carrier_deck')` — deck at y=-42

## Signature meshes

| Mesh | Kit function |
|------|----------------|
| Spawn island | buildFloatingIslandDetailed(11) |
| Mechanical hut ×2 | buildSkyMechanicalHut() |
| Windmill | buildPremiumWindmill() |
| Holo ring | buildPremiumHoloRing(4.2, cyan, gold) |
| Carrier | BoxGeometry 80×2×30 at y=-42 |

## All 10 modes

### Mode 1 — Supersonic Dogfight
- **Arena:** 6 holo rings, golden-hour spline; spawn grass island below start.
- **Hero prop:** buildSpawnSkyIsland + carrier vista
- **Mood:** Reference quality — welcoming ace

### Mode 2 — Precision Air Strike
- **Arena:** Single large target ring over cloud sea; dive from y=32 to y=12.
- **Hero prop:** Ground target bullseye on cloud layer
- **Mood:** Focused strike

### Mode 3 — Carrier Touch-and-Go
- **Arena:** Low pass over carrier deck silhouette at y=8; 4 wide rings.
- **Hero prop:** Carrier deck mesh (80×30m) at z=-100
- **Mood:** Navy cool

### Mode 4 — Mach 2 Speed Trap
- **Arena:** Straight spline; rings closer spacing; motion blur hint via FOV 52.
- **Hero prop:** Speed gate arch with MACH 2 billboard
- **Mood:** Adrenaline

### Mode 5 — Radar Evasion
- **Arena:** Dark storm tint; green radar sweep cone on vista (stealth jet share NOT — day ops).
- **Hero prop:** Radar dish with rotating cone
- **Mood:** Sneaky tension

### Mode 6 — Missile Jammer
- **Arena:** Figure-8 light pattern; purple jammer pylons offset (2 only).
- **Hero prop:** Jammer pylon (emissive purple)
- **Mood:** Tech hero

### Mode 7 — Mid-Air Tanker Refuel
- **Arena:** Slow ring through refuel corridor; tanker silhouette parallel to path.
- **Hero prop:** Tanker plane billboard + fuel hose line
- **Mood:** Calm precision

### Mode 8 — Canyon Run Precision
- **Arena:** Tighter slalom; mesa silhouettes far below — NOT pinch walls in camera.
- **Hero prop:** Canyon citadel island offset right
- **Mood:** Skill test

### Mode 9 — Escort Transport
- **Arena:** Wide escort corridor; transport silhouette flies parallel (background).
- **Hero prop:** Transport plane silhouette
- **Mood:** Team mission

### Mode 10 — Top Gun Ace Fighter
- **Arena:** Capstone: 8 rings + carrier + spawn island; bloom 0.24.
- **Hero prop:** Gold ace banner between final rings
- **Mood:** Movie finale

## Never (Jet Plane)
Identical layout to Drone without carrier; boxing ring; mine tunnel; flat #87ceeb only sky without gradient dome.

## Code checklist
- [ ] `installPremiumAerialScenery()` called in AerialWorldKit
- [ ] `buildPremiumHoloRing` not buildKidFriendlyRing
- [ ] `aerialVista: 'carrier_deck'`
- [ ] bloom ≥ 0.22 on mode 1


---


# GOLD CHAPTER — CRAWLER (ground exemplar)

## Concept art brief
*Kid NASA rover on a warm Mars playground — not gritty realism.* Soft peach sky, twin cartoon moons, one mesa on the horizon. Ground is **shaped red dirt with tread ruts**, never flat grey. The robot should look like a toy hero climbing adventure hills. Reference mood: LEGO Mars Mission meets Pixar **Wall·E** opening sky.

## Palette (use exactly)

| Role | Hex | Three.js | Notes |
|------|-----|----------|-------|
| Sky top | #ffc9a6 | `0xffc9a6` | Peach wash |
| Sky horizon | #f4a47d | `0xf4a47d` | Warm haze |
| Ground regolith | #c65f45 | `0xc65f45` | Mars rust |
| Ground shadow | #8b3a2a | — | Underside of mesa |
| Path rut dark | #a0522d | — | Tire tracks |
| Accent checkpoint | #fbbf24 | — | Flag poles |
| Goal emissive | #22c55e | — | Finish arch |
| Fog | #f4a47d | `0xf4a47d` | Warm, not grey |

## Camera rig

| Parameter | Value |
|-----------|-------|
| Preset | `rover_wide` |
| camBack | 7.0 m |
| camUp | 3.4 m |
| lookAhead | 7.0 m |
| lookHeight | 0.8 m |
| FOV | 50° |
| Robot screen height | 28–32% on iPad landscape |

## Lighting rig

| Light | Color | Intensity | Position |
|-------|-------|-----------|----------|
| Key sun | #fff1d6 | 1.35 | (-8, 14, -6) |
| Hemisphere sky | #fffbeb | 1.25 | ground color #c65f45 |
| Fill | — | 0 | (use hemi only) |
| Shadows | ON | 1024 map | key light |

## Post-processing

| bloom | threshold | radius |
|-------|-----------|--------|
| 0.14 | 0.92 | 0.14 |

## Fog

| near | far | color |
|------|-----|-------|
| 48 m | 125 m | #f4a47d |

## Floor geometry (`martian_dirt`)

- Base: 180×180 m plane, roughness 0.9, metalness 0
- Optional: subtle undulation overlay (`applyUndulatingGroundOverlay`) on mode 1+5
- Horizon: `martian_dirt` silhouette — 8 mesa blocks, height 4–10 m, color #5c2810
- **Never** use `industrial` horizon key

## Signature meshes

| Mesh | Size | Position | Material |
|------|------|----------|----------|
| ChassisSignatureProp | 6×8×2 m mesa OR flag | (18, 0, -75) | rock / blue flag |
| Checkpoint flag | 0.9×0.5 m plane | on path | emissive blue |
| Goal arch | 5 m wide | path end | green emissive |

## All 10 modes — unique arena layout

### Mode 1 — Rocky Mountain Climb
- **Arena:** Stepped rust-dirt terraces rising 6m; 5m wide tread path; dust puffs on each step.
- **Hero prop:** Snow-cap mesa summit flag (8m, emissive green)
- **Mood:** Proud first climb

### Mode 2 — Mud Puddle Traction Test
- **Arena:** Straight 40m path; 3 brown mud basins 3m wide; splash particles on entry.
- **Hero prop:** Orange traction warning sign
- **Mood:** Silly splashes

### Mode 3 — Log Bridge Crossing
- **Arena:** Wooden plank bridge 4m wide over 6m gap; rope rails; slow zone.
- **Hero prop:** Rope bridge with knot posts
- **Mood:** Careful crossing

### Mode 4 — Boulder Field Crawl
- **Arena:** Zigzag between 4 rounded boulder silhouettes (collision); path stays open.
- **Hero prop:** NASA sample flag between boulders
- **Mood:** Explorer dodge

### Mode 5 — Trench Explorer
- **Arena:** Shallow trench 2m deep, 6m wide; rust walls; twin moons visible.
- **Hero prop:** Comm dish at trench end
- **Mood:** Discovery

### Mode 6 — Sand Dune Drift
- **Arena:** Gentle dune ridges across path; soft sand shader; drift marks behind robot.
- **Hero prop:** Windsock on dune crest
- **Mood:** Fast slide

### Mode 7 — Earthquake Hazard Trial
- **Arena:** Path with 3 cracked ground plates (visual only); subtle camera shake on cracks.
- **Hero prop:** Seismic sensor post blinking red
- **Mood:** Dramatic tension

### Mode 8 — Heavy Incline Hold
- **Arena:** 15° sustained incline 30m; wider path 6m; anti-roll tutorial.
- **Hero prop:** Heavy load crate (decorative) at bottom
- **Mood:** Determination

### Mode 9 — Wilderness Search Patrol
- **Arena:** Three large zone markers A/B/C on mesa map; patrol between zones.
- **Hero prop:** Zone beacon pillars (3m, cyan pulse)
- **Mood:** Search adventure

### Mode 10 — All-Terrain Master
- **Arena:** Capstone: terrace + mud + bridge in one 60m loop; still ≤4 props.
- **Hero prop:** Gold NASA flag at finish mesa
- **Mood:** Champion moment

## Never (Crawler)
Grey concrete, factory yellow stripe, boxing ring, underwater caustics, cloud holo rings, farm barn.

## Code checklist
- [ ] `CHASSIS_VISUAL_DNA.crawler.floorKind === 'martian_dirt'`
- [ ] `buildChassisFloor('martian_dirt')` — not flat industrial
- [ ] `installPremiumGroundScenery` — mesa or treehouse offset
- [ ] `horizonKey: 'martian_dirt'`


---


# PART C — ALL 33 ROBOTS — COMPACT DEEP SPEC

Use this table for art direction at a glance. Expand any robot to full template (Part A) when starting its ship PR.
See **ship playbook** for order: Jet → Drone → Helicopter → Crawler → Farm → …

| Robot | floorKind | Sky | Ground | Fog | Camera | Fog n/f | Bloom | Signature | Concept one-liner |
|-------|-----------|-----|--------|-----|--------|---------|-------|-----------|-------------------|
| Crawler | `martian_dirt` | #ffc9a6 | #c65f45 | #f4a47d | `rover_wide` | 48 / 125 | 0.14 | NASA-style flag or mesa summit | Peach Mars sky, twin tiny moons, one round mesa silhouette. … |
| Tank | `desert_sand` | #fed7aa | #d97706 | #fde68a | `fight_broadcast` | 48 / 125 | 0.1 | Fortress core or target dummy | Sandy desert training ground with bunker walls — NOT boxing … |
| Stealth Bot | `rooftop_tar` | #1e1b4b | #1f2937 | #312e81 | `stealth_follow` | 48 / 125 | 0.14 | Hack terminal or ventilation unit | Purple night sky, moon, simple city skyline black silhouette… |
| Mining Bot | `mine_tunnel` | #2a1810 | #4a3728 | #3d2817 | `factory_overview` | 28 / 95 | 0.14 | Glowing crystal cluster or drill site | Low rock tunnel walls on both sides with amber work lights. … |
| Security Bot | `asphalt_lot` | #94a3b8 | #475569 | #cbd5e1 | `chase_close` | 48 / 125 | 0.14 | Security gate arm or scanner booth | Chain-link fence silhouette on one side, simple warehouse bl… |
| Farm Bot | `farm_field` | #87ceeb | #6b8e23 | #b8d4e8 | `rover_wide` | 48 / 125 | 0.14 | Hay bale or apple tree | Bright blue sky, red barn silhouette on horizon, green rolli… |
| Spider Bot | `climb_shaft` | #1e1b4b | #64748b | #c4b5fd | `climber_follow` | 48 / 125 | 0.14 | Ceiling hook or web bridge | Brick or pipe wall fills the background — camera tilts verti… |
| Droid | `gym_mats` | #e0e7ff | #c7d2fe | #e0e7ff | `chase_close` | 48 / 125 | 0.14 | Balance beam or hurdle bar | Indoor gym with blue wall pads and balance beam silhouette. … |
| Mech | `scrap_yard` | #78716c | #57534e | #a8a29e | `chase_close` | 48 / 125 | 0.14 | Shipping container or hydraulic press | Outdoor yard with stacked metal beams and a crane hook silho… |
| Drone | `open_sky` | #ffc9a6 | — | #f4a47d | `aerial_chase` | 90 / 320 | 0.24 | Cloud castle or numbered ring gate | Golden sunset sky 75% of frame. Fluffy cloud sea below. Clou… |
| Racing Drone | `open_sky` | #1e1b4b | — | #312e81 | `aerial_chase` | 90 / 320 | 0.24 | Turbo tunnel or boost pad | Twilight sky with ONE pink-cyan floating race ribbon. Star p… |
| Rescue Drone | `rubble_street` | #fed7aa | #78716c | #ffedd5 | `chase_close` | 48 / 125 | 0.14 | Survivor marker or medkit drop zone | Smoke-haze orange sky, collapsed building silhouettes, crack… |
| Helicopter | `open_sky` | #7dd3fc | — | #bae6fd | `aerial_chase` | 90 / 320 | 0.24 | Oil rig helipad or cargo hook | Blue sky over cartoon ocean far below. Oil platform or ship … |
| Hover Bot | `open_sky` | #c4b5fd | — | #ddd6fe | `aerial_chase` | 90 / 320 | 0.24 | Floating platform or repulsor gate | Purple-white lab sky with floating grey platforms and anti-g… |
| Hover Racer | `open_sky` | #4c1d95 | — | #6b21a8 | `aerial_chase` | 90 / 320 | 0.24 | Energy recharge pad or warp gate | Deep purple sky with glowing plasma track segments and energ… |
| Sub Drone | `sandy_seabed` | #67e8f9 | #f5d58a | #5eead4 | `underwater_follow` | 35 / 110 | 0.18 | Coral arch or treasure chest | Bright teal water, sun rays from surface, sandy floor. Two p… |
| Deep Sea Bot | `abyss_rock` | #0c4a6e | #1e293b | #0f172a | `underwater_follow` | 28 / 95 | 0.18 | Thermal vent or ancient ruin door | Dark blue water with ONE bioluminescent jellyfish silhouette… |
| Robot Arm | `lab_grid` | #e0f2fe | #f1f5f9 | #e2e8f0 | `lab_overview` | 48 / 125 | 0.14 | Microchip tray or precision target pad | White lab walls, pegboard tool silhouette, magnifying lamp a… |
| Factory Bot | `factory_floor` | #cfe8ff | #6b7280 | #dbeafe | `factory_overview` | 48 / 125 | 0.14 | Assembly robot arm or conveyor drop zone | Indoor factory with overhead crane silhouette and ONE convey… |
| Space Rover | `lunar_grey` | #0a0a1a | #9ca3af | #6b7280 | `rover_wide` | 48 / 125 | 0.14 | Satellite dish or sample station | Black starfield sky with Earth blue marble on horizon. Grey … |
| LEGO Bot | `stud_mat` | #fff7ed | #fef08a | #fde68a | `rover_wide` | 48 / 125 | 0.14 | Oversized 2×4 brick stack | Colourful stud mat floor pattern, giant LEGO brick wall silh… |
| Battle Bot | `combat_ring` | #1e293b | #374151 | #475569 | `fight_broadcast` | 48 / 125 | 0.1 | Energy core or opponent mech | Dark stadium with neon trim. Elevated metal ring — industria… |
| Striker | `combat_ring` | #7c3aed | #f5f5f4 | #c4b5fd | `fight_broadcast` | 48 / 125 | 0.1 | Punching bag or opponent boxer | Classic boxing stadium spotlights, crowd colour blobs, canva… |
| Blaster | `combat_ring` | #312e81 | #4c1d95 | #4338ca | `fight_broadcast` | 48 / 125 | 0.1 | Spell target crystal or mana fountain | Mystical purple arena with floating rune circles and element… |
| Ninja Bot | `temple_tiles` | #1e1b4b | #44403c | #312e81 | `stealth_follow` | 48 / 125 | 0.14 | Torii gate or training dummy | Night sky with red torii gate silhouette and lantern glow. C… |
| Berserker | `combat_ring` | #7f1d1d | #292524 | #991b1b | `fight_broadcast` | 48 / 125 | 0.1 | Training dummy or rage totem | Dark pit with orange lava glow cracks below the ring. Aggres… |
| Med Bot | `hospital_tile` | #f8fafc | #e2e8f0 | #f1f5f9 | `chase_close` | 48 / 125 | 0.14 | Hospital bed or gurney station | Clean white hospital ceiling lights, blue cross signs on wal… |
| Fire Bot | `wet_street` | #7f1d1d | #374151 | #991b1b | `chase_close` | 48 / 125 | 0.14 | Fire hydrant or burning doorway | Orange smoke sky, cartoon fire glow on one building, reflect… |
| Jet Plane | `open_sky` | #60a5fa | — | #93c5fd | `aerial_chase` | 90 / 320 | 0.24 | Carrier deck or target drone | Clear blue military sky. Aircraft carrier deck or runway sil… |
| Stealth Jet | `open_sky` | #0f172a | — | #1e293b | `aerial_chase` | 90 / 320 | 0.24 | Radar dome or hangar opening | Dark night sky, stars, radar dome with sweeping green cone b… |
| Aero Stunt | `open_sky` | #fdba74 | — | #fed7aa | `aerial_chase` | 90 / 320 | 0.24 | Red-white lighthouse or airshow banner | Warm sunset over coastline below. White smoke rings hang in … |
| Bird Bot | `flappy_scroll` | #87ceeb | #22c55e | #87ceeb | `side_scroll` | 48 / 125 | 0.14 | Slingshot or nest goal | Flat cartoon blue sky, scrolling green hills, chunky green p… |
| Custom Bot | `lab_grid` | #e0f2fe | #f8fafc | #e0f2fe | `lab_overview` | 48 / 125 | 0.14 | Checkpoint flag or trophy podium | White lab with coloured zone squares on the mat. Bulletin bo… |


---

# PART D — HOW TO EXPAND THE NEXT ROBOT

1. Duplicate **Part A template** below this line for e.g. Farm Bot
2. Copy palette hex from Part C table as starting point
3. Pull mission names from v4 bible Part 2
4. Write unique **Arena** line per mode (must differ from Crawler)
5. Implement per **ship playbook** Phases 1–5
6. When screenshot passes QA, move Part C row to a full gold chapter (optional)

**Next recommended expansions:** Farm Bot (ground #2), Drone (aerial #2), Mining Bot (tunnel).

*Generated 33 robot compact rows · v4 deep spec*
