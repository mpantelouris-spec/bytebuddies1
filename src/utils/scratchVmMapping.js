/**
 * Scratch 3 VM ↔ ByteBuddies Game Builder — execution model checklist
 *
 * Reference: MIT Scratch runs projects in scratch-vm (JS). Scripts are cooperative
 * "threads" stepped by a sequencer (~60 Hz). See: github.com/scratchfoundation/scratch-vm
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ Scratch concept              │ Game Builder (this repo)                     │
 * ├──────────────────────────────┼───────────────────────────────────────────────┤
 * │ Target (sprite or stage)     │ One `sprite` object + `owner` on blocks       │
 * │ Hat blocks start threads     │ `event-start`, `event-keypress`, `event-     │
 * │                              │ click`, `event-clone`, `event-message`, etc.   │
 * │ Thread = stack under one hat │ `buildScriptChains()` → trigger + `body[]`     │
 * │ One thread step / yield      │ We run `execBody` synchronously per hat;       │
 * │                              │ `loop-forever` bodies run once per rAF tick    │
 * │                              │ (coarse approximation of yielding).         │
 * │ Green flag                   │ `event-start` once when Play begins            │
 * │ Key pressed hat              │ `event-keypress` + edge detect (just pressed)  │
 * │ Broadcast / receive          │ `event-broadcast` + `event-message` + queue    │
 * │ Per-sprite variables/state   │ `spriteVars[sprite.id]` + sprite fields        │
 * │ Stage / renderer             │ Canvas `draw()` after physics for this tick    │
 * │ Motion                       │ `execBlock` mutates sprite; platformer in      │
 * │                              │ `integratePlatformerSprite` (not in Scratch)   │
 * └──────────────────────────────┴───────────────────────────────────────────────┘
 *
 * Intended tick order (one requestAnimationFrame ≈ one Scratch sequencer pass):
 *  1) Service lifecycle hats (clones)
 *  2) Edge-triggered hats (key just pressed, click flags)
 *  3) Drain message queue (broadcasts)
 *  4) Optional collision-driven hats
 *  5) Step long-running stacks (forever bodies once per frame each)
 *  6) Integrate physics (platformer step — engine layer Scratch does not provide)
 *  7) Render
 *
 * Future work to match Scratch more closely:
 *  - Resumable `execBody` with a per-thread program counter + stack frames
 *  - Round-robin: at most N block executions per thread per tick
 *  - `control-wait` as yield-until-time instead of busy patterns where they exist
 */

/** Match browser / Scratch-VM default cadence for commentary and dt expectations */
export const SCRATCH_REFERENCE_TICK_HZ = 60;

/**
 * Safety valve: max command blocks executed in one animation frame (all sprites).
 * Scratch-vm uses internal limits to avoid freezing; this mirrors that intent.
 */
export const MAX_BLOCK_STEPS_PER_ANIMATION_FRAME = 12_000;
