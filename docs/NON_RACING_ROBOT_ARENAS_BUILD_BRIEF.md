# BYTEBUDDIES — NON-RACING / NON-FOOTBALL ROBOT ARENAS (FULL BUILD BRIEF)

## YOUR ROLE

You are a senior game developer building **320 themed coding missions** for ByteBuddies — a kids' robotics education game (ages 6–11). Each robot chassis gets **exactly 10 exclusive arenas/missions** that match what that robot does in the real world.

## SCOPE — READ CAREFULLY

### BUILD THESE (32 robots × 10 arenas = 320 missions)

All chassis in `CHASSIS_MODE_MAP` EXCEPT:

- ❌ `rover` — CodeRacer kart racing (already built separately)
- ❌ `scout` — CodeRacer kart racing (already built separately)
- ❌ `footballbot` — Robot Football (built separately)

### DO NOT TOUCH

- CodeRacer / `racing_spline` / kart biome tracks for rover & scout
- Football engine / `robot_football` / FIFA 3v3
- Do not assign `rainbow_road`, `sunset_cove_01`, `candy_carnival`, or any `KART_RACE_ARENA_TYPES` to non-racing robots

### TERMINOLOGY

- **Chassis** = robot type (e.g. Farm Bot, Spider Bot)
- **Mode / Mission** = one of 10 playable levels per chassis
- **Arena** = the 3D environment + obstacles + win condition for that mode
- **Environment family** = shared visual/physics template (underwater, industrial, combat, etc.)

---

## ARCHITECTURE (HOW ARENAS MUST WORK)

### Data pipeline (already in codebase — wire it correctly)

```
chassis-game-modes.js   → 320 mode definitions (CHASSIS_MODE_MAP)
robot-arena-config.js   → environment family per chassis (CHASSIS_ENVIRONMENT)
chassis-mode-catalog.js → mode names, objectives, star requirements
LiveLabPage.jsx         → SimCanvas loads arena by arenaType
```

### Per-mode requirements

Every mode must have:

1. **Unique arenaType** from the chassis environment family (NOT a kart track)
2. **3D arena geometry** — themed props, ground/sky, lighting, spawn point
3. **Win condition** — reach zone, collect N items, survive timer, defeat boss, complete pattern
4. **Scratch blocks** — starter script pre-loaded; kid codes movement/sensors
5. **3-star rating** — finish / fast time / no collisions (or mode-specific)
6. **Progression** — mode N unlocks mode N+1; mode 10 is "Master" boss capstone

### Physics families

| Family | Physics | Robots |
|--------|---------|--------|
| Ground coding | `ground` | farmbot, securitybot, medbot, firebot, factorybot, droid, legobot, miningbot |
| Low gravity | `low_gravity` | spacerover, crawler |
| Walker / climb | `walker_climb` | spider |
| Underwater | `buoyancy` | submarine, deepseabot |
| Flight 3DOF | `flight_3dof` | drone, helicopter, jetplane, steathjet, aerobat, hoverbot |
| Hybrid sky | `hybrid` | racedrone, hoverracer |
| Combat ring | `combat` | striker, battlebot, blaster, ninja, berserker, tank, mech |
| Stealth ground | `stealth_ground` | stealth, ninja (stealth modes) |
| Flappy 2D | `catapult_2d` | birdbot |
| Sandbox | `ground` | custom |

### Camera per family

- Ground: `chase_close` or `factory_overview`
- Underwater: `underwater_follow`
- Aerial: `aerial_chase`
- Combat: `fight_orbit`
- Stealth: `stealth_follow`
- Spider climb: `climber_follow`
- Space: `rover_wide`
- Flappy: `side_scroll`

---

## ENVIRONMENT FAMILIES & ARENA TYPES

Use arena pools from `robot-arena-config.js` — **never kart circuits**.

See `src/virtual-robot-designer/data/robot-arena-config.js` for full `ENVIRONMENTS` and `CHASSIS_ENVIRONMENT` maps.

---

## ALL 32 ROBOTS — 10 ARENAS EACH

Mode IDs are defined in `CHASSIS_MODE_MAP` in `chassis-game-modes.js`. Each robot has 10 modes; names and objectives are in `chassis-mode-catalog.js` / `CHASSIS_GAME_MODE_BY_ID`.

| # | Chassis | Environment family | Count |
|---|---------|-------------------|-------|
| 1 | crawler | martian | 10 |
| 2 | tank | industrial + combat | 10 |
| 3 | stealth | cyber_ninja | 10 |
| 4 | miningbot | industrial | 10 |
| 5 | securitybot | industrial | 10 |
| 6 | farmbot | industrial | 10 |
| 7 | spider | spider_climber | 10 |
| 8 | droid | industrial | 10 |
| 9 | mech | industrial + combat | 10 |
| 10 | drone | sky_aerial | 10 |
| 11 | racedrone | hybrid_race_sky | 10 |
| 12 | rescuedrone | emergency | 10 |
| 13 | helicopter | sky_aerial | 10 |
| 14 | hoverbot | sky_aerial | 10 |
| 15 | hoverracer | hybrid_race_sky | 10 |
| 16 | submarine | underwater | 10 |
| 17 | deepseabot | underwater | 10 |
| 18 | robotarm | industrial | 10 |
| 19 | factorybot | industrial | 10 |
| 20 | spacerover | martian | 10 |
| 21 | legobot | industrial | 10 |
| 22 | battlebot | boxing_mech | 10 |
| 23 | striker | boxing_mech | 10 |
| 24 | blaster | boxing_mech | 10 |
| 25 | ninja | boxing_mech + stealth | 10 |
| 26 | berserker | boxing_mech | 10 |
| 27 | medbot | emergency | 10 |
| 28 | firebot | emergency | 10 |
| 29 | jetplane | sky_aerial | 10 |
| 30 | steathjet | sky_aerial | 10 |
| 31 | aerobat | sky_aerial | 10 |
| 32 | birdbot | flappy | 10 |
| 33 | custom | sandbox | 10 |

**Total: 320 missions** (32 × 10; `custom` is the 33rd entry in the design doc but counts as the sandbox chassis in `CHASSIS_MODE_MAP`).

---

## IMPLEMENTATION RULES

### Every arena must

1. Load correct `arenaType` — verify NOT in `KART_RACE_ARENA_TYPES`
2. Spawn robot at themed start position on correct surface (ground/water/sky/ring)
3. Show mission objective banner on load
4. Ship 3–6 block starter script appropriate to mission
5. Fire win/lose on objective complete
6. Award 1–3 stars
7. Unlock next mode on completion

### Visual quality bar (kid-friendly AAA-lite)

- Each environment family has distinct skybox, ground material, and prop set
- Lighting matches mood (underwater blue, fire orange, space red dust, cyber purple neon)
- Obstacles readable on tablet — high contrast, chunky shapes
- No grey empty void arenas

### Special engines (extend, do not rebuild from scratch)

- **Combat** (5 robots): `FightingArena.js` + `fighting-block-runtime.js`
- **Flappy** (birdbot): `FlappyBirdArena.js` + flappy runtime
- **Aerial** (drones, jets, helicopters, hovers): flight physics in SimCanvas aerial mode
- **Underwater** (sub, deepsea): buoyancy physics + caustic lighting
- **Ground coding** (everything else): LiveLab obstacle/zone/collect pipeline

---

## BUILD ORDER

### Phase 1 — Environment families (10 arena builders)

Build reusable arena prefabs for: underwater, emergency, sky_aerial, martian, cyber_ninja, industrial, spider_climber, boxing_mech skins, flappy variants, sandbox

**Recommended first family: `emergency`** — partial builders exist (`firebot_blaze`, `hospital_walk`, `snow_rescue`); vertical slice robots: firebot, medbot, rescuedrone (30 missions).

### Phase 2 — One vertical slice per family (10 missions each)

Pick one robot per family, ship all 10 modes, prove end-to-end.

### Phase 3 — Remaining robots

Roll out 10 modes each using family prefabs + unique props/objectives.

### Phase 4 — Polish

Star ratings, unlock chain, mission brief UI, tablet screenshot QA.

---

## ACCEPTANCE TEST

For EACH of 32 robots, record 30s of mode 1 and mode 10:

- [ ] Correct environment (not kart track, not football pitch)
- [ ] Robot moves correctly for its physics family
- [ ] Objective completable with starter blocks
- [ ] Win screen + star rating fires
- [ ] Mode 2 unlocks after mode 1 complete
- [ ] Visually distinct from other environment families

**Total deliverable: 320 working arenas across 32 robots.**

---

## KEY FILES

- `src/virtual-robot-designer/data/chassis-game-modes.js`
- `src/virtual-robot-designer/data/chassis-mode-catalog.js`
- `src/virtual-robot-designer/data/robot-arena-config.js`
- `src/virtual-robot-designer/data/game-mode-specifications.js`
- `src/virtual-robot-designer/studio/LiveLabPage.jsx`
- `src/virtual-robot-designer/studio/AdventureArenaBuilder.js`
- `src/virtual-robot-designer/studio/FightingArena.js` (combat only)
- `src/virtual-robot-designer/studio/FlappyBirdArena.js` (birdbot only)
- `src/virtual-robot-designer/services/studio-robot-builder.js` (`CHASSIS_DATA`)

---

## CURRENT CODEBASE STATUS (engineering audit)

Run: `node scripts/audit-320-missions.mjs`

- **Data layer**: All 320 mode IDs exist in `CHASSIS_MODE_MAP` and match this brief.
- **Arena routing**: Non-car modes resolve via `applyChassisArenaEnvironment` — kart tracks stripped at runtime.
- **3D builders**: Many `arenaType` values route to `AdventureArenaBuilder.js` / `PremiumArenas.js` or dedicated handlers in `LiveLabPage.jsx` `buildSmartArena`. Full visual/objective polish per mode is **not** complete for all 320.

See `docs/NON_RACING_ARENAS_PHASE1_EMERGENCY.md` for a shorter slice spec.
