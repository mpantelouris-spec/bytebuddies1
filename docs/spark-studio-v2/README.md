# Spark Studio V2 — Design Specification Pack

Professional game-studio design documentation for **Spark Studio** (ByteBuddies creator hub) and **Robot Studio** (primary-school robotics). Use this pack with **Cursor Composer** or Agent mode: one chapter per task, not one giant prompt.

## What this is

- **Spark Studio V2 (Parts 1–7):** Long-term vision for a browser-based AAA-style creation platform (ages ~7–16): home command centre, creator UI, world building, robots/NPCs, block coding, courses/community, polish/performance.
- **Doc 07:** Near-term **primary-school Robot Studio rebuild** (ages 7–11): safety, clarity, arenas, accessibility, teacher mode, acceptance criteria.

Implementation lives in the existing ByteBuddies repo (`SparkStudioDashboard`, `ByteBuddiesStudio`, `LiveLabPage`, etc.). See [CODEBASE_MAP.md](./CODEBASE_MAP.md) before changing code.

## Document index

| File | Contents |
|------|----------|
| [00-objective-and-philosophy.md](./00-objective-and-philosophy.md) | Objective, core philosophy, visual redesign, home screen, fullscreen, creation modes, course/toolbox vision (Part 1) |
| [01-creator-experience-ui.md](./01-creator-experience-ui.md) | First-time experience, workspace, windows, toolbox, asset library, creative flow (Part 2) |
| [02-world-builder.md](./02-world-builder.md) | Terrain, biomes, weather, props, interactive objects, world templates (Part 3) |
| [03-robots-characters-npcs.md](./03-robots-characters-npcs.md) | Robot identity, animations, NPCs, collections, living worlds (Part 4) |
| [04-block-coding.md](./04-block-coding.md) | Block UX, debugging, events, genre-specific palettes (Part 5) |
| [05-courses-community-progression.md](./05-courses-community-progression.md) | Missions, campaigns, social, progression, templates (Part 6) |
| [06-polish-performance-aaa.md](./06-polish-performance-aaa.md) | VFX, audio, performance budgets, accessibility, AAA feel (Part 7) |
| [07-primary-school-robot-studio-rebuild.md](./07-primary-school-robot-studio-rebuild.md) | **Priority:** complete primary rebuild prompt (sections 1–19) |
| [CODEBASE_MAP.md](./CODEBASE_MAP.md) | Spec areas → current file paths in this repo |

## How to use with Composer

1. **Pick a phase** (below) and **one doc chapter** (or a subsection of doc 07).
2. Start the agent with:
   - “Read `docs/spark-studio-v2/<chapter>.md` and `CODEBASE_MAP.md`.”
   - A **scoped goal** (e.g. “MissionKidClarity + PrimaryStudioArenaKit for securitybot mode 3 only”).
   - **Out of scope** explicitly (e.g. “do not change CodeRacer splines”).
3. For Robot Studio / classroom work, **always** also read doc **07** and follow primary-school safety and clarity rules.
4. After substantive UI/sim changes, run `npm run build` and deploy per `.cursor/rules/deploy-after-tasks.mdc` (unless the user says otherwise).

### Composer prompt template

```markdown
Context: ByteBuddies Spark Studio V2 spec — docs/spark-studio-v2/

Read:
- docs/spark-studio-v2/07-primary-school-robot-studio-rebuild.md (sections X–Y)
- docs/spark-studio-v2/CODEBASE_MAP.md

Task: <single measurable outcome>

Constraints:
- Minimize diff; match existing patterns in listed files
- Primary-school safe (doc 07): no scary audio, no harsh failure, unlimited retries in learn modes
- Do not refactor LiveLabPage.jsx wholesale

Verify: <tests or manual steps>
```

## Implementation phases (recommended)

These are **planning slices only** — no code is implied by this folder.

### Phase 1 — Primary Robot Studio clarity (doc 07)

Align Live Lab with primary acceptance criteria: kid-readable objectives, consistent robot mesh, arena readability, safe copy, teacher-friendly controls. Touch `MissionKidClarity.js`, `primary-robot-studio.js`, `LiveLabGameUI.jsx`, arena kits under `studio/mission-world/`.

### Phase 2 — Spark home & studio shell (docs 00–01)

Evolve `SparkStudioDashboard` and `ByteBuddiesStudio` navigation toward the “command centre” and floating-window creator model without breaking hash routes (`#studio?course=…`).

### Phase 3 — World & arena authoring (doc 02 + existing Game Builder)

Connect spec to `GameBuilder`, `AdventureArenaBuilder.js`, dressing kits (`ArenaModeDressing`, `ArenaSceneryKit`), and mission route builders.

### Phase 4 — Robots & block coding (docs 03–04)

Unify build preview with sim (`studio-robot-builder.js`, `BuildPage.jsx`, `VrdBlocklyWorkspace.jsx`, genre libraries in `LiveLabGameUI.jsx`).

### Phase 5 — Courses, progression, community (doc 05)

Extend `courseCatalog.js`, `game-progress.js`, `MissionMode.jsx`, community surfaces — campaign framing (“Mission” not “Lesson”).

### Phase 6 — Polish & performance (doc 06)

Quality tiers in `art-direction.js`, track kits, WebGL budgets, reduced-motion and high-contrast paths.

### Phase 7 — Spark V2 creation modes (doc 00 modes list)

New mode entry points (voxel, tower defence, etc.) only after Phase 1–2 foundations; reuse one block runtime and shared sim host.

## Related repo docs

- `docs/bytebuddies-arena-visual-bible-v4.md` — arena art direction (320-mode system)
- `docs/NON_RACING_ROBOT_ARENAS_BUILD_BRIEF.md` — non-racing arena emergency brief
- `docs/composer-2.5-car-racing-tracks-FULL-PROMPT.md` — CodeRacer / MK tracks (separate scope from football)

## Maintenance

Source text for Parts 1–7 and doc 07 was captured from the product owner specification (Sep 2026). When the vision changes, edit the chapter file and note the date in the chapter header.
