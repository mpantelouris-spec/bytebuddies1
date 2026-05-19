# SOUND_BLOCKS_AUDIT.md

## Executive Summary

This document audits the implementation of all Scratch Sound Blocks (Magenta) in the Game Builder workspace. It identifies which blocks are present, their implementation status, and any gaps or issues.

---

## Sound Blocks Inventory (Scratch Spec)

1. play sound [pop v] until done
2. start sound [pop v]
3. stop all sounds
4. change [pitch v] effect by ()
5. set [pitch v] effect to ()
6. clear sound effects
7. change volume by ()
8. set volume to () %
9. (volume)

---

## Block Presence & Mapping

| Scratch Block                  | Internal Type   | Present | Notes                       |
|------------------------------- |----------------|---------|-----------------------------|
| play sound [pop v] until done  | sound-play      | ✅      | Same as start sound         |
| start sound [pop v]            | sound-play      | ✅      |                             |
| stop all sounds                | sound-stop      | ✅      |                             |
| change [pitch v] effect by ()  | sound-play      | ⚠️      | Placeholder, no effect      |
| set [pitch v] effect to ()     | sound-play      | ⚠️      | Placeholder, no effect      |
| clear sound effects            | sound-stop      | ⚠️      | Placeholder, no effect      |
| change volume by ()            | sound-volume    | ✅      |                             |
| set volume to () %             | sound-volume    | ✅      |                             |
| (volume)                       | sound-volume    | ✅      | Reporter, returns variable  |

---

## Implementation Details

### Block Definitions ([src/utils/blocks.jsx])
- `sound-play`: { label: 'Play sound', ... }
- `sound-stop`: { label: 'Stop sounds', ... }
- `sound-volume`: { label: 'Set volume', ... }

### Block Mappings ([src/utils/blocks.jsx])
- 'start sound', 'play sound until done' → 'sound-play'
- 'stop all sounds' → 'sound-stop'
- 'change pitch effect by', 'set pitch effect to' → 'sound-play' (placeholder)
- 'clear sound effects' → 'sound-stop' (placeholder)
- 'change volume by', 'set volume to', 'volume' → 'sound-volume'

### Rendering ([src/utils/blocks.jsx])
- All three block types have rendering cases.

### Execution Logic ([src/components/GameBuilder.jsx], [src/utils/gameRuntime.js])
- `sound-play`: Calls `playTone(p.sound || 'pop')` (plays a sound)
- `sound-stop`: Stops sound (clears state)
- `sound-volume`: Updates volume variable
- No effect/pitch logic implemented
- No “wait until done” logic for play sound until done

---

## Gaps & Issues

- **Pitch/effect blocks**: Present as placeholders, do not modify sound.
- **Play sound until done**: Does not wait for sound to finish, acts as start sound.
- **No sound effect system**: No implementation for pitch/effects.
- **No async sound completion tracking**: Needed for true 'until done' semantics.

---

## Recommendations

1. Implement pitch/effect logic for `change [pitch v] effect by ()`, `set [pitch v] effect to ()`, `clear sound effects`.
2. Implement async sound completion tracking for `play sound [pop v] until done`.
3. Add effect state to sprite/globalVars and update sound engine to respect it.
4. Add tests for effect and volume changes.

---

## Status Table

| Block                          | Status         | Notes                                 |
|------------------------------- |---------------|---------------------------------------|
| play sound [pop v] until done  | ✅ (basic)     | Plays sound, does not wait for finish |
| start sound [pop v]            | ✅             | Plays sound                           |
| stop all sounds                | ✅             | Stops sound                           |
| change [pitch v] effect by ()  | ⚠️ Placeholder | No pitch/effect logic                 |
| set [pitch v] effect to ()     | ⚠️ Placeholder | No pitch/effect logic                 |
| clear sound effects            | ⚠️ Placeholder | No effect logic                       |
| change volume by ()            | ✅             | Updates volume variable               |
| set volume to () %             | ✅             | Updates volume variable               |
| (volume)                       | ✅             | Returns volume variable               |

---

## Next Steps

- [ ] Implement missing effect logic
- [ ] Implement async sound completion for 'until done'
- [ ] Add tests for all sound blocks

---

*Audit completed: May 14, 2026*