# Flappy BirdBot — Block Palette Audit (Part 2)

**Course:** `flappy_bird`, `robo_wrecker` (arenaType `flappy_bird`)  
**UI:** Blockly category sidebar + flyout only (Part 12 — chip bar removed)  
**Mission:** Approach A — "Press SPACE to flap and fly"

## Bucket A — Correct blocks (37 total)

| Category | Count | Blocks |
|---|---|---|
| All Blocks | 37 | Full palette duplicate for discoverability |
| Events | 5 | When START, spacebar, collision, gap passed, game over |
| Movement | 3 | Flap!, Set flap strength, Set gravity strength |
| Loops | 4 | Repeat N, Repeat until game over, Forever, Wait |
| Sensors | 8 | 4 action + 4 value (distance, height, gap center, falling) |
| Logic | 6 | If/Then, If/Else, >, <, =, Number |
| Variables | 8 | Score/High Score read+value, Create/Set/Change/Get |
| Game Control | 3 | Show score, Restart game, Pause |

Source of truth: `src/virtual-robot-designer/data/flappy-blockly-toolbox.js`

## Bucket B — Removed (must NOT appear)

Move forward/backward, turn left/right, set speed, boost, spin, orbit, ground/vehicle sensors, AI patrol blocks. These are excluded from `buildFlappyBirdToolbox()` — only the 37 types above are registered for this course.

## Bucket C — Was missing, now added

All Part 3 blocks are implemented in `ROBOT_BLOCK_DEFS` (LiveLabPage.jsx) and wired in `parseBlocklyFlappyHandlers` / `runFlappyInstantActions`.

## Game design

- **Gravity:** Hardcoded in `FlappyBirdArena.js`; tunable via Set gravity strength block.
- **Scroll:** Classic Flappy Bird — world scrolls toward fixed bird (Part 8.3).
- **Score:** Auto-increments on gap passed; readable via Score blocks.

## Verify

```bash
node scripts/verify-flappy-blocks.mjs
```
