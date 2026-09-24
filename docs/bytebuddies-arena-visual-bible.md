# ByteBuddies Arena Visual Bible — Implementation Map

32 robots × 10 modes (320 missions). Excludes Rover, Scout, Footballbot.

## Architecture

| Layer | File | Role |
|-------|------|------|
| Family bases | `FamilyArenaBuilders.js` | Sky, ground, fog, chassis routes per environment family |
| Emergency | `EmergencyArenaBuilder.js` | Fire / hospital / snow rescue |
| Mode dressing | `ArenaModeDressing.js` | `modeIndex` 1–10 hero props per family |
| Combat rings | `CombatRingSkins.js` | 10 ring skins (Colosseum → Boss Throne) |
| Flappy | `FlappyBirdArena.js` | 10 sky/pipe colour variants |
| Core helpers | `ArenaBuilderCore.js` | Goals, chassis routes, particles |
| Routing | `AdventureArenaBuilder.js` | `PREMIUM_BUILDERS` + themed fallbacks |
| Presentation | `MissionPresentation.js` | 3s mission banner, family win bursts |
| Atmosphere | `sim-visual-polish.js` | `ARENA_THEMES`, particles, fog |
| Config | `robot-arena-config.js` | `ENVIRONMENTS`, `arenaTypes[10]` per chassis |

## Environment families (Part 1)

- **martian** — `buildMartianPlanetArena`, `buildDesertRallyArena`
- **industrial** — factory, warehouse, mine, sandbox lab, power garden dressing
- **underwater** — coral, trench, kelp, bioluminescent, atlantis, tsunami, mariana, hydrothermal, arctic dive, ocean current
- **emergency** — `EmergencyArenaBuilder.js`
- **sky_aerial** — `buildFlightRingsArena`, warp gate, drone canyon variants
- **hybrid_race_sky** — sky dressing + neon boost pads + warp tunnel (modes 7–10)
- **cyber_ninja** — cyber city, museum heist, shadow escape
- **spider_climber** — spider rescue, temple climb, pipeline
- **boxing_mech** — `CombatRingSkins.js` via `buildFightingArena`
- **flappy** — `FLAPPY_VARIANTS` in `FlappyBirdArena.js`
- **sandbox** — `buildSandboxLabArena` + dressing

## Per-mode differentiation

Chassis modes pass `challenge.modeIndex` (1–10) and `challenge.environmentId`. After the base arena builds, `applyArenaModeDressing()` adds family-specific hero props.

**Mode 10 capstone** (`CapstoneArenaBuilder.js`):
- Extended 48m chassis route with 9 checkpoints (`ArenaBuilderCore.buildChassisRoute`)
- 10 labeled zone arches with coloured ground strips per family
- Gold trophy at finish; stacks hero props from modes 1–9
- Banner reads "CAPSTONE CHAMPIONSHIP"; extra win particles

Combat modes rotate ring skin by `modeIndex`. Flappy modes rotate palette by `modeIndex`.

## Robot visual identity (Part 2)

`robot-visual-identity.js` — per-chassis `simScale`, primary/accent colours from the bible. Applied in Live Lab via `mergeRobotBuildConfig` + `applyRobotVisualIdentity`.

## Part 5 checklist

- [x] Environment family sky + fog (premium builders + `ARENA_THEMES`)
- [x] Goal markers / chassis finish zones (`ArenaBuilderCore.finishChassisOrGoal`)
- [x] Mission title banner ~3s (`MissionPresentation.spawnMissionBanner`)
- [x] Win particles by family (`spawnWinCelebration` + `simEmit`)
- [x] Mode 10 capstone courses with zone arches
- [x] Robot scale/colour identity (`robot-visual-identity.js`)
- [x] No kart rainbow tracks on non-racing chassis modes (filtered in `robot-arena-config.js`)
- [ ] Unique screenshot per mode — continued hero-prop art pass per Part 3 prose

## Extending

1. Add builder in `FamilyArenaBuilders.js` or map in `PREMIUM_BUILDERS`.
2. Add mode props in the matching dresser in `ArenaModeDressing.js`.
3. Add `ARENA_THEMES` entry in `sim-visual-polish.js`.
4. Wire `LiveLabPage.jsx` `buildSmartArena` case if not using `buildAdventureArena` default.

Full art-direction prose (all 320 mode LOOK blocks) lives in the product spec; this doc tracks code wiring.
