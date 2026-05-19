# ByteBuddies Sprite Execution Architecture

## Complete Technical Reference

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                 React GameBuilder                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐         ┌──────────────────┐ │
│  │ Sprites State    │         │ Editor State     │ │
│  │ (sprites: [])    │         │ (selected, etc)  │ │
│  └──────────────────┘         └──────────────────┘ │
│           │                           │             │
│           ▼                           ▼             │
│  ┌──────────────────┐         ┌──────────────────┐ │
│  │ Block Storage    │         │ UnifiedBlockly   │ │
│  │ (per sprite)     │         │ Workspace        │ │
│  └──────────────────┘         └──────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Game Runtime Loop                            │  │
│  │  - buildScriptChains (filter by owner)      │  │
│  │  - execBody (execute with sprite context)   │  │
│  │  - updatePhysics (isolated per sprite)      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Sprite Isolation Guarantees

### 1. Block Ownership System

**Guarantee:** Every block belongs to exactly ONE sprite

```javascript
Block = {
  id: unique_id,
  type: "motion-jump",
  owner: "Player",        // CRITICAL: Identifies sprite ownership
  params: { power: 15 },
  x: 30,
  y: 100,
}
```

**Enforcement:**
- Blocks created from Blockly MUST have owner set
- Blocks without owner are rejected before execution
- Owner field verified before filtering

**Verification:**
Console log shows: `[GameBuilder] Saving 5 blocks for sprite "Player"`

---

### 2. Execution Scoping

**Guarantee:** Block execution happens in correct sprite context

```javascript
function execBlock(block, sprite) {
  // Defensive validation
  if (!sprite) return;                    // No null sprites
  if (!spriteVars[sprite.id]) return;     // Has physics state
  
  // Block executes ONLY on this sprite
  const state = spriteVars[sprite.id];
  state.vy = -15; // Only affects this sprite's physics
}
```

**Enforcement:**
- Sprite reference passed to execBlock
- Physics state accessed via sprite.id
- No global physics state shared between sprites

**Verification:**
Console log shows: `[GameBuilder] physics-jump: sprite "Player" jumping`

---

### 3. Physics State Isolation

**Guarantee:** Each sprite has independent physics

```javascript
spriteVars = {
  "sprite_1": {
    vx: 0,
    vy: 0,
    gravity: 0.5,
    isJumping: false,
    isGrounded: true,
    _vars: {},
  },
  "sprite_2": {
    vx: 5,
    vy: -10,
    gravity: 0.5,
    isJumping: true,
    isGrounded: false,
    _vars: {},
  },
}
```

**Enforcement:**
- Each sprite gets unique ID
- spriteVars keyed by sprite.id
- No shared references between entries

**Verification:**
Each sprite's physics values differ independently

---

### 4. Block Filtering

**Guarantee:** Only correct blocks execute for each sprite

```javascript
function buildScriptChains(spriteId) {
  const spriteName = sprites.find(s => s.id === spriteId)?.name;
  
  // CRITICAL: Filter by owner
  const spriteBlocks = allBlocks.filter(b => {
    if (!b.owner) {
      console.warn('Block has no owner, excluding');
      return false;
    }
    return b.owner === spriteName;  // Only this sprite's blocks
  });
  
  // Build chains from filtered blocks
}
```

**Enforcement:**
- allBlocks contains all blocks from all sprites
- Filter reduces to only blocks with matching owner
- Blocks without owner rejected explicitly

**Verification:**
Console log shows correct block counts per sprite:
```
[GameBuilder] Sprite "Player": found 5 blocks
[GameBuilder] Sprite "Enemy": found 3 blocks
[GameBuilder] Sprite "Platform": found 0 blocks
```

---

### 5. Persistence System

**Guarantee:** Blocks survive sprite switching

```javascript
// When switching TO Sprite A:
1. Save current sprite's blocks with owner field
2. Clear Blockly workspace
3. Load Sprite A's blocks from state
4. Reconstruct blocks in Blockly workspace
5. Verify block count matches stored state

// When switching FROM Sprite A:
1. Get blocks from workspace
2. Convert to game format with owner field
3. Store in state with sprite ID reference
4. Verify stored block count
```

**Enforcement:**
- Blocks stored in sprite array, not globally
- Owner field prevents accidental reuse
- Block count verified after load

**Verification:**
Console log shows:
```
[UnifiedBlocklyWorkspace] Recreated 5 blocks for "Player", 0 errors
[UnifiedBlocklyWorkspace] Workspace now has 2 top-level blocks
```

---

## Data Flow Diagrams

### Block Save Flow
```
User edits blocks in Blockly workspace
  ↓
onModelChange triggered
  ↓
blocklyNodesToGameBlocks() converts nodes
  ↓
Owner field assigned: `owner: selectedSprite.name`
  ↓
setSprites() stores blocks in state
  ↓
Blocks saved for ONLY selected sprite
  ↓
Console log confirms: "Saving X blocks for sprite Y"
```

### Block Execution Flow
```
Game starts (Play button)
  ↓
For each sprite:
  ↓
  buildScriptChains(spriteId)
    → allBlocks.filter(b => b.owner === spriteName)
    → Returns ONLY blocks for this sprite
  ↓
  For each script chain:
    ↓
    execBody(chain.body, sprite)
      ↓
      For each block in body:
        ↓
        execBlock(block, sprite)
          ↓
          spriteVars[sprite.id].vy = -15
          → Affects ONLY this sprite's physics
```

### Block Restoration Flow
```
User switches to Sprite A
  ↓
selectedSpriteName changed
  ↓
useLayoutEffect triggered
  ↓
selectedSpriteBlocks computed from state
  → selectedSprite.blocks.filter(b => b.owner === selectedSprite.name)
  ↓
ws.clear() empties workspace
  ↓
For each block in selectedSpriteBlocks:
  ↓
  ws.newBlock(blockType)
  block.setFieldValue(...)
  block.moveTo(x, y)
  block.initSvg()
  block.render()
  ↓
Verify: topBlocks.length === savedBlockCount
  ↓
Console log: "Recreated X blocks for Sprite A"
```

---

## Critical Invariants

### Invariant 1: Owner Always Present
```javascript
// ALWAYS TRUE after fixes:
for (let block of allBlocks) {
  assert(block.owner !== undefined);
  assert(block.owner === someSprite.name);
}
```

### Invariant 2: Unique Sprite IDs
```javascript
// ALWAYS TRUE:
let spriteIds = sprites.map(s => s.id);
assert(spriteIds.length === new Set(spriteIds).size);
```

### Invariant 3: SpriteVars Matches Sprites
```javascript
// ALWAYS TRUE:
for (let sprite of sprites) {
  assert(spriteVars[sprite.id] !== undefined);
}
```

### Invariant 4: Blocks Stay With Sprite
```javascript
// ALWAYS TRUE:
for (let sprite of sprites) {
  let spriteBlocks = sprite.blocks.filter(b => b.owner === sprite.name);
  assert(spriteBlocks.length === sprite.blocks.length);
}
```

### Invariant 5: Only One Sprite Jumps Per Jump Command
```javascript
// ALWAYS TRUE during execution:
let jumpCount = 0;
for (let sprite of playSprites) {
  if (/* sprite just jumped */) jumpCount++;
}
assert(jumpCount <= 1);  // Or 0 if no jump command
```

---

## Defensive Programming Patterns

### Pattern 1: Null Checks
```javascript
if (!block) return;           // Prevent null dereference
if (!sprite) return;          // Prevent null context
if (!spriteVars[sprite.id]) { // Create if missing
  spriteVars[sprite.id] = { /* default state */ };
}
```

### Pattern 2: Owner Validation
```javascript
if (!b.owner) {
  console.warn('Block has no owner, excluding');
  return false;
}
```

### Pattern 3: Type Validation
```javascript
if (!Blockly.Blocks[blockType]) {
  console.warn(`Block type not found: ${blockType}`);
  return false;
}
```

### Pattern 4: State Verification
```javascript
let topBlocks = ws.getTopBlocks(true);
assert(topBlocks.length > 0 || selectedSpriteBlocks.length === 0);
```

### Pattern 5: Defensive Logging
```javascript
console.log(`[GameBuilder] Saving ${blocksWithOwner.length} blocks for sprite "${selectedSprite.name}"`);
```

---

## Debugging Guide

### Check 1: Verify Block Ownership
```javascript
// In console:
allBlocks.forEach((b, i) => {
  if (!b.owner) console.warn(`Block ${i} missing owner!`);
  if (typeof b.owner !== 'string') console.warn(`Block ${i} owner is not string!`);
});
```

### Check 2: Verify SpriteVars
```javascript
// In console:
for (let sprite of playSprites) {
  if (!spriteVars[sprite.id]) {
    console.warn(`Sprite ${sprite.name} missing spriteVars!`);
  }
}
```

### Check 3: Verify Block Filtering
```javascript
// In console:
for (let sprite of sprites) {
  let blocks = allBlocks.filter(b => b.owner === sprite.name);
  console.log(`${sprite.name}: ${blocks.length} blocks`);
}
```

### Check 4: Verify Block Execution
```javascript
// Look for logs like:
// [GameBuilder] Building script chains for sprite "X": found N blocks
// If N=0 but you added blocks, ownership filter is failing
```

---

## Summary

The fixed ByteBuddies architecture guarantees:

1. **Complete Sprite Isolation** - Blocks owned by specific sprite
2. **Unique Physics State** - Each sprite has independent physics
3. **Correct Execution Context** - Blocks execute with right sprite reference
4. **Persistent Storage** - Blocks survive sprite switching
5. **Defensive Validation** - Multiple layers prevent errors
6. **Comprehensive Diagnostics** - Full visibility into execution

The system now behaves like professional game engines where each sprite is a completely isolated entity with no shared state or cross-contamination.

