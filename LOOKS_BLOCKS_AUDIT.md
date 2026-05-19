# Looks Blocks Audit Report

## Summary
**Total Looks Blocks Required:** 20
**Blocks Present in Library:** 20 ✅
**Blocks With Functional Implementation:** 15 ✅
**Blocks With Issues:** 5 ⚠️

---

## Detailed Block Status

### ✅ Working Looks Blocks (15/20)

#### Say/Think Blocks (4/4)
| Block | Label | Type | Status | Notes |
|-------|-------|------|--------|-------|
| say [] for () seconds | say () for () seconds | sprite-say | ✅ | Displays text with timeout |
| say [] | say () | sprite-say | ✅ | Displays text (maps to same type) |
| think [] for () seconds | think () for () seconds | looks-think | ✅ | Displays thought bubble with timeout |
| think [] | think () | looks-think | ✅ | Displays thought bubble |

#### Visibility Blocks (2/2)
| Block | Label | Type | Status | Notes |
|-------|-------|------|--------|-------|
| show | show | sprite-show | ✅ | Sets sprite.visible = true |
| hide | hide | sprite-hide | ✅ | Sets sprite.visible = false |

#### Costume Blocks (2/3)
| Block | Label | Type | Status | Notes |
|-------|-------|------|--------|-------|
| switch costume to [costume1 v] | switch costume to () | looks-costume | ✅ | Sets sprite._costume |
| next costume | next costume | looks-next-costume | ✅ | Increments sprite._costume |
| (costume [number v]) | costume number (Reporter) | ❌ MISSING | ⚠️ | No reporter implementation |

#### Backdrop Blocks (0/3)
| Block | Label | Type | Status | Notes |
|-------|-------|------|--------|-------|
| switch backdrop to [backdrop1 v] | switch backdrop to () | ❌ MISSING | ⚠️ | Not implemented |
| next backdrop | next backdrop | ❌ MISSING | ⚠️ | Not implemented |
| (backdrop [number v]) | backdrop number (Reporter) | ❌ MISSING | ⚠️ | No reporter implementation |

#### Size Blocks (2/3)
| Block | Label | Type | Status | Notes |
|-------|-------|------|--------|-------|
| change size by () | change size by () | looks-grow | ✅ | Multiplies sprite.w and sprite.h |
| set size to () % | set size to () % | sprite-setsize | ✅ | Scales sprite based on percentage |
| (size) | size (Reporter) | ❌ MISSING | ⚠️ | No reporter implementation |

#### Effect Blocks (3/3)
| Block | Label | Type | Status | Notes |
|-------|-------|------|--------|-------|
| change [color v] effect by () | change [color v] effect by () | looks-color-effect | ✅ | Modifies effect value |
| set [color v] effect to () | set [color v] effect to () | looks-color-effect | ✅ | Sets effect value |
| clear graphic effects | clear graphic effects | looks-clear-effects | ✅ | Resets all effects |

#### Layer/Ordering Blocks (1/2)
| Block | Label | Type | Status | Notes |
|-------|-------|------|--------|-------|
| go to [front v] layer | go to front layer | looks-front | ✅ | Moves sprite to front (z=999) |
| go [forward v] () layers | go forward () layers | ❌ MISSING | ⚠️ | "Go forward" layer movement not implemented |

---

## ⚠️ Blocks With Issues (5/20)

### Issue 1: Missing Backdrop Blocks
**Affected Blocks:**
- `switch backdrop to [backdrop1 v]`
- `next backdrop`
- `(backdrop [number v])` - Reporter

**Problem:** No implementation in gameRuntime.js or GameBuilder.jsx
**Status:** ⚠️ NOT IMPLEMENTED

**Root Cause:** Backdrop functionality requires:
1. Backdrop state tracking on sprite
2. Backdrop list management (likely from costume system)
3. Change detection and render update

---

### Issue 2: Missing Layer Navigation Block
**Affected Block:**
- `go [forward v] () layers` (go forward/backward layers)

**Problem:** Only `go to front layer` is implemented, not layer movement by amount
**Status:** ⚠️ NOT IMPLEMENTED

**Current Implementation:**
```javascript
else if (block.type === 'looks-front') {
  sprite.z = 999;  // Only handles "go to front"
}
```

**Missing:** Layer navigation with relative movement (forward/backward by N layers)

---

### Issue 3: Missing Looks Reporter Blocks
**Affected Blocks:**
- `(costume [number v])` - Reporter for current costume number
- `(backdrop [number v])` - Reporter for current backdrop number
- `(size)` - Reporter for current sprite size

**Problem:**
These reporter blocks are incorrectly mapped to command block types:
- `costume number` → `looks-costume` (command block, not reporter)
- `backdrop number` → `looks-costume` (command block, not reporter)
- `size` → `sprite-setsize` (command block, not reporter)

**Mapping Errors (blocks.jsx line 265):**
```javascript
'costume number': 'looks-costume',         // ❌ Should be reporter type
'backdrop number': 'looks-costume',        // ❌ Should be reporter type
'size': 'sprite-setsize',                  // ❌ Should be reporter type
```

**Result:** These blocks cannot be used as reporters in variables, comparisons, or other reporters

---

## Implementation Details

### Execution Flow Status
```
Looks Block Execution Flow:
User adds "say [] for () seconds" block
    ↓
Block mapped: SIDEBAR_TO_TYPE['say for seconds'] = 'sprite-say'
    ↓
Rendered by BlockContent function
    ↓
Executed in gameRuntime.executeBlock()
    ↓
Updates sprite state (sprite.sayText, sprite.sayUntil)
    ↓
Drawn on canvas with sayText display
    
STATUS: ✅ Works for 15/20 blocks
         ⚠️  Missing 5 blocks
```

---

## Required Fixes

### Fix #1: Add Reporter Block Type Definitions
**Location:** `src/utils/blocks.jsx`

Add these three new reporter block types:
```javascript
'looks-costume-reporter':  { label: 'Costume Number', icon: '👗', color: '#9b59b6', category: 'looks', params: {} },
'looks-backdrop-reporter': { label: 'Backdrop Number', icon: '🎬', color: '#9b59b6', category: 'looks', params: {} },
'sprite-size-reporter':    { label: 'Size', icon: '📏', color: '#9b59b6', category: 'looks', params: {} },
```

### Fix #2: Update SIDEBAR_TO_TYPE Mappings
**Location:** `src/utils/blocks.jsx` (line ~265)

Change from:
```javascript
'costume number': 'looks-costume',
'backdrop number': 'looks-costume',
'size': 'sprite-setsize',
```

To:
```javascript
'costume number': 'looks-costume-reporter',
'backdrop number': 'looks-backdrop-reporter',
'size': 'sprite-size-reporter',
```

### Fix #3: Add Backdrop Block Types
**Location:** `src/utils/blocks.jsx`

Add block definitions for:
```javascript
'looks-backdrop':      { label: 'Switch backdrop', icon: '🎬', color: '#9b59b6', category: 'looks', params: { backdrop: '1' } },
'looks-next-backdrop': { label: 'Next backdrop', icon: '🎬', color: '#9b59b6', category: 'looks', params: {} },
```

### Fix #4: Add Layer Navigation Block Type
**Location:** `src/utils/blocks.jsx`

Add block definition for:
```javascript
'looks-forward-layers': { label: 'Go forward layers', icon: '📚', color: '#9b59b6', category: 'looks', params: { layers: '1' } },
```

### Fix #5: Implement Backdrop Execution
**Location:** `src/utils/gameRuntime.js`

Add execution cases:
```javascript
else if (block.type === 'looks-backdrop') {
  state.backdropIndex = num(params.backdrop, 0) - 1; // Convert to 0-indexed
}
else if (block.type === 'looks-next-backdrop') {
  state.backdropIndex = (state.backdropIndex || 0) + 1;
}
```

### Fix #6: Implement Layer Navigation Execution
**Location:** `src/utils/gameRuntime.js`

Update looks-front logic:
```javascript
else if (block.type === 'looks-front') {
  sprite.z = 999; // Front
}
else if (block.type === 'looks-back') {
  sprite.z = -999; // Back
}
else if (block.type === 'looks-forward-layers') {
  const layerAmount = num(params.layers, 1);
  sprite.z = (sprite.z || 0) + layerAmount;
}
```

### Fix #7: Add Reporter Evaluations
**Location:** `src/components/GameBuilder.jsx` (evaluateCondition function)

Add cases:
```javascript
case 'looks-costume-reporter':
  return sprite._costume || state.costumeIndex || 1;
case 'looks-backdrop-reporter':
  return sprite._backdrop || state.backdropIndex || 1;
case 'sprite-size-reporter':
  return sprite.scale ? sprite.scale * 100 : 100;
```

### Fix #8: Update Reporter Block Type Set
**Location:** `src/components/ScratchStyleBlock.jsx` (line ~19)

Add to REPORTER_BLOCK_TYPES set:
```javascript
const REPORTER_BLOCK_TYPES = new Set([
  'sense-mouse-x', 'sense-mouse-y', 'sense-distance', 'sense-timer',
  'sprite-x-reporter', 'sprite-y-reporter', 'sprite-direction-reporter',
  'looks-costume-reporter', 'looks-backdrop-reporter', 'sprite-size-reporter'  // ← ADD THESE
]);
```

### Fix #9: Add Rendering Cases
**Location:** `src/utils/blocks.jsx` (BlockContent function)

Add rendering cases:
```javascript
case 'looks-backdrop': return <>{block.icon} Switch backdrop{PI('backdrop', 60)}</>;
case 'looks-next-backdrop': return <>{block.icon} Next backdrop</>;
case 'looks-forward-layers': return <>{block.icon} Go forward{PI('layers', 40)}layers</>;
case 'looks-costume-reporter': return <>{block.icon} Costume number</>;
case 'looks-backdrop-reporter': return <>{block.icon} Backdrop number</>;
case 'sprite-size-reporter': return <>{block.icon} Size</>;
```

---

## Backward Compatibility

- ✅ All existing working looks blocks continue to work
- ❌ Any scripts using backdrop blocks will break when they're added (none currently exist)
- ⚠️ Scripts using reporter blocks will now work correctly (currently broken)

---

## Testing Recommendations

1. **Say/Think Blocks** - Already working, but verify timeout display
2. **Costume Blocks** - Verify next costume cycles properly
3. **Backdrop Blocks** - Test after implementation
4. **Size Blocks** - Verify percentage scaling
5. **Effect Blocks** - Test color/ghost effect changes
6. **Layer Blocks** - Test layering after implementation
7. **Reporter Blocks** - Test returning correct values

---

## Files to Modify

1. `src/utils/blocks.jsx` - Add definitions, mappings, and rendering
2. `src/utils/gameRuntime.js` - Add execution logic
3. `src/components/GameBuilder.jsx` - Add reporter evaluation
4. `src/components/ScratchStyleBlock.jsx` - Update reporter types

**Total lines to add:** ~40 lines
**Complexity:** Medium (backdrop state management needed)

---

## Impact Assessment

| Item | Impact | Severity |
|------|--------|----------|
| Missing backdrop blocks | Can't change backgrounds | Medium |
| Missing layer navigation | Limited layering control | Low |
| Missing reporter blocks | Can't read looks state | High |
| Backward compatibility | None (features currently missing) | None |

---

## Conclusion

✅ **15/20 Looks blocks are working correctly**

⚠️ **5/20 Looks blocks need implementation:**
- 3 backdrop-related blocks (switch/next/number)
- 1 layer navigation block (forward layers)  
- 3 reporter blocks (costume#, backdrop#, size)

The working blocks cover essential looks functionality (say, think, show/hide, size, effects, and layering to front). The missing blocks require additional implementation but don't block core functionality.
