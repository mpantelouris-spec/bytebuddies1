# Sprite Independence - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    GameBuilder Component                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │ SpritesPanel │  │  Blockly      │  │   Canvas    │  │
│  │   (Left)     │  │ Workspace     │  │   (Stage)   │  │
│  │              │  │   (Middle)    │  │   (Right)   │  │
│  │ - Selection  │  │               │  │             │  │
│  │ - Inspector  │  │ - Block code  │  │ - Rendering │  │
│  │ - List       │  │ - Per-sprite  │  │ - Collision │  │
│  └──────────────┘  └───────────────┘  └─────────────┘  │
│         ↓                  ↓                    ↓        │
│     selected          blocks array        playSprites   │
│                                                          │
└─────────────────────────────────────────────────────────┘
         ↓
    Game Loop
    ├─ Build sprite chains
    ├─ Execute event handlers
    ├─ Apply physics per sprite
    └─ Render
         ↓
    spritePhysics.js
    ├─ Per-sprite state (spriteVarsRef)
    ├─ Physics calculations
    └─ Block effects
```

## State Management

### spriteVarsRef Structure

```javascript
spriteVarsRef = {
  1: {  // Cat (sprite ID 1)
    // Physics state
    vx: 0,              // Individual X velocity
    vy: 0,              // Individual Y velocity  
    gravity: 0.5,       // Individual gravity
    
    // Jump state
    isJumping: false,   // Is this sprite jumping?
    isGrounded: true,   // Is this sprite on ground?
    jumpVelocity: 0,    // Jump velocity
    
    // Display
    _sayText: null,
    _sayUntil: 0,
    
    // Sprite-specific variables
    _vars: {
      score: 0,
      health: 100,
      level: 1,
      // ... any user-created variables
    }
  },
  
  2: {  // Star (sprite ID 2)
    vx: 0,
    vy: 0,
    gravity: 0.5,
    // ... same structure, independent state
  }
  
  // ... more sprites
}
```

### Global Variables

```javascript
globalVars = {
  _math: 0,           // Math operation results
  _broadcast: null,   // Message queue
  // ... any other global state
}
```

## Data Flow Diagram

```
User Input (Key Press)
    ↓
handleKeyDown
    ↓
keys[key] = true
    ↓
Game Loop
    ├─ Find sprite with matching key in event-keypress block
    ├─ For THAT SPRITE:
    │  ├─ Call execBody(chain.body, sprite)
    │  │  ├─ For each block in chain:
    │  │  │  ├─ Look up spriteVars[sprite.id]
    │  │  │  ├─ Apply block effects to THAT sprite's state
    │  │  │  └─ Update spriteVars[sprite.id].vy for jumps
    │  │  └─ Store changed state
    │  │
    │  └─ Later in loop:
    │     └─ Call updatePhysics(sprite)
    │        ├─ Read spriteVars[sprite.id]
    │        ├─ Apply gravity: vy += gravity
    │        ├─ Update position: x += vx, y += vy
    │        └─ Write back to sprite object
    │
    └─ Other sprites unaffected!
```

## Key Implementation Details

### 1. Per-Sprite State Initialization

```javascript
// In GameBuilder.jsx game loop:
const spriteVarsRef = useRef(initializeSpriteState(sprites));
```

Called once at game start, creates independent state for each sprite.

### 2. Block Execution (execBody)

```javascript
// OLD (WRONG):
case 'motion-jump':
  sprite.vy = -15;  // ← Sets velocity on sprite object (shared!)
  
// NEW (CORRECT):
case 'motion-jump':
  spriteVars[sprite.id].vy = -15;  // ← Sets only THIS sprite's velocity
  spriteVars[sprite.id].isJumping = true;
  spriteVars[sprite.id].isGrounded = false;
```

**Critical:** All physics variables now stored in `spriteVars[sprite.id]`, not on sprite object.

### 3. Physics Update

```javascript
function updatePhysics(sprite) {
  const state = spriteVars[sprite.id];  // Get THIS sprite's state
  
  // Apply gravity only to THIS sprite
  if (state.gravity && state.gravity > 0) {
    state.vy = (state.vy || 0) + state.gravity;
  }

  // Update position
  sprite.x += state.vx || 0;
  sprite.y += state.vy || 0;
  
  // Check ground collision
  if (sprite.y + sprite.h > STAGE_H) {
    sprite.y = STAGE_H - sprite.h;
    state.vy = 0;
    state.isJumping = false;
  }
}
```

**Key:** State and position are separate:
- State (velocity) lives in `spriteVars[id]`
- Position (x, y) lives in `sprite` object
- Physics reads state, updates position

### 4. Variable Scoping

```javascript
// User creates variable:
// "Set [score] to 0"

// It goes into:
spriteVars[sprite.id]._vars['score'] = 0;

// Not into global vars!
// So each sprite has independent score
```

### 5. Block Effects Function

```javascript
// In spritePhysics.js:
export function applySpriteBlockEffect(block, sprite, spriteVars, ...) {
  const state = spriteVars[sprite.id];  // Get state for THIS sprite
  
  switch(block.type) {
    case 'motion-jump':
      state.vy = -Math.abs(num(params.power));  // Affects only this sprite
      break;
    
    case 'var-create':
      state._vars[params.name] = num(params.value);  // Scoped to sprite
      break;
  }
}
```

## Execution Flow - Step by Step

```
FRAME 1 - Initial Setup:
├─ Game starts
├─ spriteVarsRef created with state for Cat, Star, Platform
└─ Each has vy=0, vx=0, gravity=0

FRAME 2 - User presses Space:
├─ handleKeyDown fires
├─ keys['space'] = true
├─ Game loop finds event-keypress blocks with key='space'
├─ Only Cat's event-keypress matches!
├─ execBody called for Cat only
├─ motion-jump block executed:
│  └─ spriteVars[1].vy = -15  (ONLY Cat's velocity changed)
├─ Star and Platform unaffected
└─ updatePhysics called for all sprites:
   ├─ Cat: vy = -15 + 0.5 = -14.5, y -= 14.5
   ├─ Star: vy = 0 + 0.5 = 0.5, y += 0.5 (if gravity set)
   └─ Platform: no gravity, stays put

FRAME 3 - Still holding Space:
├─ Game loop continues
├─ Cat's block re-executes? (depends on event)
├─ updatePhysics again:
│  ├─ Cat: vy = -14.5 + 0.5 = -14, y -= 14
│  ├─ Star: vy = 0.5 + 0.5 = 1, y += 1
│  └─ Platform: y unchanged

... continues with Cat falling, Star possibly jumping independently ...
```

## Comparison: Before vs After

### BEFORE (Global State)
```javascript
// Game Loop
const vars = {};  // ONE shared state

spriteChains.forEach(({ sprite, chains }) => {
  // ALL sprites use SAME vars object
  chains.forEach(chain => execBody(chain.body, sprite, vars));
});

// In execBody:
case 'motion-jump':
  sprite.vy = -15;  // GLOBAL - affects all sprites!
```

**Problem:** All sprites shared velocity, variables, jump state.

### AFTER (Per-Sprite State)
```javascript
// Game Loop
const spriteVarsRef = useRef(initializeSpriteState(sprites));

spriteChains.forEach(({ sprite, chains }) => {
  // Each sprite gets its own state
  chains.forEach(chain => {
    execBody(chain.body, sprite, spriteVarsRef.current);
  });
});

// In execBody:
case 'motion-jump':
  spriteVars[sprite.id].vy = -15;  // Per-sprite - only this sprite!
```

**Solution:** Each sprite has independent velocity, variables, jump state.

## Event Processing Order

```
Game Loop Each Frame:
│
├─ 1. Key Press Events
│  └─ For each sprite with "When key pressed" block:
│     └─ If that sprite's key is pressed, execute its blocks
│
├─ 2. Message Events  
│  └─ Similar per-sprite execution
│
├─ 3. Collision Detection
│  └─ Per-sprite collision checks
│
├─ 4. Physics Update
│  └─ For each sprite:
│     └─ Apply gravity to spriteVars[id].vy
│     └─ Update sprite position
│
└─ 5. Render
   └─ Draw all sprites
```

## Memory Model

```
Player Memory:
├─ sprites array (in localStorage)
│  ├─ sprites[0] = Cat
│  │  ├─ x, y, w, h, rotation
│  │  ├─ blocks: [event-keypress, sprite-changex, motion-jump]
│  │  └─ name, svgKey, color
│  │
│  ├─ sprites[1] = Star
│  │  ├─ x, y, w, h, rotation
│  │  ├─ blocks: [event-start, sprite-goto]
│  │  └─ name, svgKey, color
│  │
│  └─ ...
│
Runtime Memory (In Game Loop):
├─ playSpritesRef.current (copy of sprites with physics)
├─ spriteVarsRef.current (per-sprite state)
│  ├─ [1]: { vx, vy, gravity, isJumping, _vars: {} }
│  ├─ [2]: { vx, vy, gravity, isJumping, _vars: {} }
│  └─ ...
└─ globalVars (shared variables)
```

## Extension Points

### Adding New Per-Sprite Physics
```javascript
// In spritePhysics.js:
export function initializeSpriteState(sprites) {
  return sprites.reduce((acc, sprite) => {
    acc[sprite.id] = {
      // ... existing state ...
      myNewProperty: 0,  // Add here
    };
    return acc;
  }, {});
}

// In GameBuilder.jsx execBody:
case 'my-new-block':
  spriteVars[sprite.id].myNewProperty = value;  // Use it
```

### Adding Global Shared Variables
```javascript
// In game loop:
const globalVars = {
  _math: 0,
  _myGlobalVar: 0,  // Add here
};

// In execBody:
case 'my-global-block':
  globalVars._myGlobalVar = value;  // Use global
```

### Adding Sprite-to-Sprite Communication
```javascript
// Would need:
// 1. Message queue for sprite
// 2. Event handler for receiving messages
// 3. Block that sends to specific sprite
// Example: spriteChains[i].broadcast(sprite.id, message)
```

## Performance Considerations

- **Per-sprite physics:** O(n) where n = number of sprites
- **Variable lookup:** O(1) - object property access
- **Block execution:** Same as before, just per-sprite
- **Memory:** ~100 bytes per sprite for state
- **With 50 sprites:** ~5KB extra memory (negligible)

## Testing Considerations

1. **Unit tests needed:**
   - initializeSpriteState() creates correct structure
   - updateSpritePhysics() modifies correct sprite
   - Block effects apply to correct sprite

2. **Integration tests:**
   - Two sprites with different jump code
   - Multiple sprites with same code
   - Sprites with and without physics blocks

3. **Edge cases:**
   - No sprites
   - One sprite
   - Many sprites (50+)
   - Rapidly adding/removing sprites

## Migration from Old System

For old projects to work with new system:
1. Blocks are read the same way
2. Execution model is automatic (per-sprite)
3. No data format changes needed
4. Fully backward compatible

Old project → automatically gets per-sprite independence!
