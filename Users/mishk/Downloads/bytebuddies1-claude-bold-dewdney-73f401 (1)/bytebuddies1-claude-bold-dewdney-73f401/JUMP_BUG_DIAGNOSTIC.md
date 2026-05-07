# Jump Bug - Diagnostic Test

Run this exact test to identify the root cause:

## Test Setup
1. Open GameBuilder on `localhost:5173`
2. Open Browser Console (F12 → Console)
3. **CLEAR all localStorage**:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

## Test Scenario

### Step 1: Create MINIMAL Setup
1. Delete all default sprites
2. Create **ONE sprite only** named "TestJump"
3. Add jump block to TestJump:
   - Drag "Motion: Jump with power 15" block
   - Make sure it's in the workspace
4. Click Play

### Expected Result
- TestJump jumps once
- No other sprites exist
- No infinite jumping

### If Bug Exists
- Look at console for messages showing which sprite is jumping

---

## Step 2: Add Second Sprite

1. Stop the game
2. Create a **second sprite** named "TestStatic" 
3. Give it NO blocks (leave it empty)
4. Click Play

### Expected Result
- TestJump jumps (only)
- TestStatic stays still
- No cross-contamination

### If Bug Exists
- TestStatic will also jump
- Console will show jump being executed on both sprites

---

## Step 3: Check Block Ownership

In browser console, run:
```javascript
// Find the selected sprite
let selected = document.querySelector('[style*="selected"]')
console.log('Current workspace blocks:', selected)

// Check what blocks are stored
let spriteData = localStorage.getItem('cv_gamebuilder_sprites')
if (spriteData) {
  let sprites = JSON.parse(spriteData)
  sprites.forEach(s => {
    console.log(`Sprite "${s.name}": ${s.blocks.length} blocks`)
    s.blocks.forEach((b, i) => {
      if (i < 3) console.log(`  Block ${i}: type="${b.type}" owner="${b.owner}"`)
    })
  })
}
```

### What to Look For
✅ **GOOD**: Each block shows `owner="TestJump"` and `owner="TestStatic"`
❌ **BAD**: Blocks missing owner field or all blocks have same owner

---

## Step 4: Check Execution Logs

Look in console for:
```
[GameBuilder] Building script chains for sprite "TestJump": found X blocks
[GameBuilder] Building script chains for sprite "TestStatic": found 0 blocks
[GameBuilder] motion-jump: sprite "TestJump" jumping
```

### If Bug Exists
You might see:
```
❌ [GameBuilder] Block has no owner field
❌ [GameBuilder] Building script chains for sprite "TestStatic": found 1 blocks
❌ [GameBuilder] motion-jump: sprite "TestStatic" jumping (shouldn't!)
```

---

## Step 5: Root Cause Identification

Based on the symptoms, the bug is likely ONE of these:

### Scenario A: Block Owner Not Being Set
**Symptom**: Console shows `Block has no owner field`
**Cause**: `onModelChange` handler not properly assigning owner
**Fix Location**: `GameBuilder.jsx` lines 2242-2289

### Scenario B: Block Filtering Not Working
**Symptom**: Script chains show wrong block count
**Cause**: `buildScriptChains()` filter not working correctly
**Fix Location**: `GameBuilder.jsx` lines 939-989

### Scenario C: All Sprites Executing All Blocks
**Symptom**: Both sprites jump even though block only on one
**Cause**: `spriteChains` loop at line 1784 executing all chains
**Fix Location**: `GameBuilder.jsx` lines 1783-1796

### Scenario D: Shared Jump Physics State
**Symptom**: Both sprites jump but console only shows one executing jump block
**Cause**: `spriteVars` shared across sprites or not being reset properly
**Fix Location**: `GameBuilder.jsx` lines 872-873 or updatePhysics line 1565

---

## Report Findings

When you run this test, report:
1. Does TestJump jump alone? (YES/NO)
2. Does TestStatic jump? (YES/NO)  
3. What console logs appear? (PASTE THEM)
4. Block ownership check result (Show the block owner fields)
5. Which Scenario (A/B/C/D) seems to match?

This will pinpoint the EXACT root cause.
