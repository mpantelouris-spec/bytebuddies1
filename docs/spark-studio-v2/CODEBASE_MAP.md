# Spark Studio V2 — Codebase map

Maps spec chapters to **current** ByteBuddies paths. Update when files move.

## Shell & navigation

| Spec area | Repo paths |
|-----------|------------|
| Spark home / dashboard | `src/components/SparkStudioDashboard.jsx` (if present), app routes in `src/App.jsx` |
| Studio host | `src/virtual-robot-designer/ByteBuddiesStudio.jsx` |
| Hash routes (`#studio`, courses) | `ByteBuddiesStudio.jsx`, `index.html` boot |

## Live Lab (Robot Studio sim)

| Spec area | Repo paths |
|-----------|------------|
| Sim page (arena build, run loop) | `src/virtual-robot-designer/studio/LiveLabPage.jsx` |
| Blocks + game UI + level select | `src/virtual-robot-designer/studio/LiveLabGameUI.jsx`, `LiveLabGame.css` |
| Blockly workspace | `src/virtual-robot-designer/studio/VrdBlocklyWorkspace.jsx` |
| Smart arena routing | `buildSmartArena()` in `LiveLabPage.jsx` |
| Primary-school clarity arenas | `studio/mission-world/MissionKidClarity.js`, `PrimaryStudioArenaKit.js`, `MissionWorldKit.js` |
| Arena finalize / dressing | `MissionArenaFinalize.js`, `ArenaModeDressing.js`, `ArenaBuilderCore.js` |
| Car / CodeRacer tracks | `data/car-racing-tracks.js`, `racing/RacingCourse.js`, `racing/mk-tracks/*`, `CarRobotTrackGrid.jsx` |
| Football | `FootballArena.js`, `FootballHUD.jsx`, `football-*` under `studio/` |
| Fighting / arcade | `FightingArena.js`, `data/fighting-blocks.js` |
| Flying / UE5 vistas | `studio/aerial-world/*`, `FlyingArenaKit.js`, `FlyingArenaSpec.js` |

## Robots & courses

| Spec area | Repo paths |
|-----------|------------|
| Primary robot copy / modes | `data/primary-robot-studio.js`, `data/chassis-game-modes.js` |
| Chassis build & mesh | `services/studio-robot-builder.js`, `BuildPage.jsx` |
| Course catalog | `data/courseCatalog.js`, `data/robot-tracks.js`, `getCoursesForChassis()` |
| Mission framing | `data/game-missions.js`, `MissionMode.jsx`, `MissionCampaignHUD.jsx` |
| Kid-safe text helpers | `kidSafeText()` in `primary-robot-studio.js` |

## World / arena 3D

| Spec area | Repo paths |
|-----------|------------|
| Game Builder (authoring) | `GameBuilder` components under `src/` (search `GameBuilder`) |
| Track / biome worlds | `racing/mk-tracks/BiomeWorldBuilder.js`, `RealGameTrackKit.js`, `TrackWorldBuilder.js` |
| Art direction & quality | `services/art-direction.js`, `mk-tracks/BiomeAAAVisualSpec.js` |
| Backdrops (premium) | `racing/mk-tracks/TrackBackdropManifest.js`, `ReferenceBackdropKit.js` |

## Block coding & scripts

| Spec area | Repo paths |
|-----------|------------|
| Racing blocks | `data/racing-blocks.js`, `data/racing-starter-script.js` |
| Football / fighting / flappy | `data/football-blocks.js`, `data/fighting-blocks.js`, `data/flappy-bird-blocks.js` |
| Universal events | `data/universal-event-blocks.js` |
| Run / compile | Live Lab simulate path in `LiveLabPage.jsx` |

## Progression & teacher

| Spec area | Repo paths |
|-----------|------------|
| Game progress | `services/game-progress.js`, `robot-mission-progress.js` |
| Teacher / parent (partial) | Search `TeacherDashboard`, `ParentDashboard` in `src/` |

## Deploy & build

| Spec area | Repo paths |
|-----------|------------|
| Production build | `npm run build`, `dist/` |
| Safe deploy | `scripts/deploy-vps.mjs`, `npm run deploy:vps` |
| Nginx SPA | `nginx-bytebuddies.conf` |
| Post-build entry | `scripts/write-bb-entry.mjs`, `scripts/verify-dist-index.mjs` |

## Doc 07 (primary school) — start here

When implementing **primary Robot Studio rebuild**, touch in this order:

1. `07-primary-school-robot-studio-rebuild.md` — acceptance criteria  
2. `LiveLabGameUI.jsx` — copy, cards, calm mode, friendly errors  
3. `MissionKidClarity.js` + `PrimaryStudioArenaKit.js` — arena readability  
4. `primary-robot-studio.js` — robot names, objectives, starter scripts  
5. `LiveLabPage.jsx` — only targeted hooks (fullscreen, intro); avoid wholesale refactor  

## Out of scope (vision only until Phase 7)

Voxel builder, tower defence mode, marketplace, multiplayer build, battle pass — not separate codebases yet; spec in chapters 00–06.
