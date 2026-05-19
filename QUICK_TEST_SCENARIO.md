# Quick Test Scenario - Sprite Isolation Verification

## Test 1: Verify ALL SPRITES JUMP TOGETHER Issue is FIXED

### Setup (2 minutes)
1. Open ByteBuddies GameBuilder
2. Open Browser Dev Tools (F12) and go to Console tab
3. Create **3 sprites**:
   - Sprite A: "Player"
   - Sprite B: "Enemy"  
   - Sprite C: "Platform"

### Test Sequence
**Step 1: Add Jump to Player Only**
1. Select sprite "Player"
2. Add these blocks:
   - `Event: On Start`
   - `Motion: Jump with power 15`
3. Click Play
4. **EXPECTED:** Only Player sprite jumps
5. **VERIFY IN CONSOLE:** Look for messages like:
   ```
   [GameBuilder] physics-jump: sprite "Player" jumping with power 15
   ```
   Should NOT see similar messages for "Enemy" or "Platform"

**Step 2: Add Walk to Enemy Only**
1. Stop the game (click Stop button)
2. Select sprite "Enemy"
3. Add these blocks:
   - `Event: On Start`
   - `Motion: Move 10 steps` (repeat it 4 times in a loop)
4. Click Play
5. **EXPECTED:** 
   - Player sprite does NOT jump (because it's not moving)
   - Enemy sprite walks left and right
   - Platform stays still
6. **VERIFY IN CONSOLE:** Should see:
   ```
   [GameBuilder] Building script chains for sprite "Player": found 2 blocks
   [GameBuilder] Building script chains for sprite "Enemy": found 5 blocks
   [GameBuilder] Building script chains for sprite "Platform": found 0 blocks
   ```

**Step 3: Verify Independent Physics**
1. Stop game
2. Select Player, add: `Event: On Key [Left] Pressed` then `Motion: Move 5 steps`
3. Select Enemy, add: `Event: On Key [Right] Pressed` then `Motion: Jump with power 20`
4. Click Play
5. Press LEFT arrow - Player moves left (Enemy doesn't)
6. Press RIGHT arrow - Enemy jumps (Player doesn't)
7. **EXPECTED:** Sprites respond to THEIR OWN blocks only
8. **VERIFY IN CONSOLE:** Each key press should log only ONE sprite executing

---

## Test 2: Verify SPRITE CODE DOES NOT SAVE Issue is FIXED

### Setup (2 minutes)
1. Close console or keep it visible
2. Create **2 sprites**:
   - Sprite A: "Hero"
   - Sprite B: "Villain"

### Test Sequence
**Step 1: Add Code to Hero**
1. Select sprite "Hero"
2. Add these blocks (at least 5):
   - `Event: On Start`
   - `Motion: Jump with power 15`
   - `Motion: Move 10 steps`
   - `Sound: Play pop`
   - `Control: Wait 1 seconds`
   - `Looks: Say "Hello!" for 2 seconds`
3. **VERIFY IN CONSOLE:** Should see:
   ```
   [GameBuilder] Saving 6 blocks for sprite "Hero"
   [GameBuilder] Sprite "Hero" now has 6 blocks
   ```
4. Note the EXACT count of blocks

**Step 2: Switch to Villain**
1. Click on sprite "Villain" in the sprites panel
2. **EXPECTED IN WORKSPACE:** Blockly workspace should be empty
3. **VERIFY IN CONSOLE:** Should see:
   ```
   [UnifiedBlocklyWorkspace] Sprite switched to: "Villain", has 0 blocks
   ```

**Step 3: Add Code to Villain**
1. Add these blocks (3 blocks):
   - `Event: On Key [space] Pressed`
   - `Motion: Move 5 steps`
   - `Looks: Say "Ha!" for 1 seconds`
2. **VERIFY IN CONSOLE:** Should see:
   ```
   [GameBuilder] Saving 3 blocks for sprite "Villain"
   [GameBuilder] Sprite "Villain" now has 3 blocks
   ```

**Step 4: Switch Back to Hero - THIS IS THE CRITICAL TEST**
1. Click back on sprite "Hero" in the sprites panel
2. **EXPECTED:** All 6 blocks from Step 1 should still be there, visible in workspace
3. **DO NOT:** The blocks should NOT disappear
4. **VERIFY IN CONSOLE:** Should see:
   ```
   [UnifiedBlocklyWorkspace] Sprite switched to: "Hero", has 6 blocks
   [UnifiedBlocklyWorkspace] Recreated 6 blocks for "Hero", 0 errors
   ```
5. Count the blocks - should still be 6

**Step 5: Switch Back to Villain**
1. Click on sprite "Villain"
2. **EXPECTED:** All 3 blocks from Step 3 should be visible
3. **VERIFY IN CONSOLE:** Should see:
   ```
   [UnifiedBlocklyWorkspace] Sprite switched to: "Villain", has 3 blocks
   [UnifiedBlocklyWorkspace] Recreated 3 blocks for "Villain", 0 errors
   ```

**Step 6: Final Verification - Switch Multiple Times**
1. Click back and forth between Hero and Villain 3-4 times
2. **EXPECTED:** Blocks never disappear
3. **VERIFY IN CONSOLE:** Each switch should show correct block count:
   - Hero: always 6 blocks
   - Villain: always 3 blocks

---

## Test 3: Verify Block Ownership Filtering

### Setup (1 minute)
1. Keep console open
2. Create 2 sprites with different blocks (use previous test setup)

### Test Sequence
**Check Ownership Logs**
1. Open console
2. Look for filter messages:
   ```
   [GameBuilder] Building script chains for sprite "SPRITE_NAME": found X blocks
   ```
3. **VERIFY:** 
   - Hero should show "found 6 blocks"
   - Villain should show "found 3 blocks"
4. **NEVER SHOULD SEE:** "has no owner field" warnings

**Check for Cross-Contamination**
1. Look for any messages like:
   ```
   Block has no owner field, excluding from execution
   ```
2. **EXPECTED:** Zero such messages
3. **IF PRESENT:** This indicates blocks are missing ownership data

---

## Failure Indicators (If Fixes Are NOT Working)

### Jump Issues Still Present
- Sprites jump together when only one has jump block
- Multiple "physics-jump" logs for different sprites
- Console warnings about missing owner fields

### Save Issues Still Present
- Blocks disappear when switching sprites
- Console shows "Recreated 0 blocks for" 
- Error count > 0 in restoration logs

### Console Error Signs
```
[GameBuilder] Block has no owner field, excluding from execution
```
This means ownership system isn't working - blocks aren't being marked with owner.

```
[UnifiedBlocklyWorkspace] Failed to create block for type: "motion-jump"
```
This means a block type isn't being recreated properly.

```
[GameBuilder] sprite has no spriteVars entry
```
This means physics state wasn't initialized for sprite.

---

## Success Indicators

All tests pass if you see:
✅ Each sprite executes ONLY its own blocks
✅ Jump only affects sprite with jump block
✅ Blocks persist when switching sprites
✅ Console shows correct block counts always
✅ No ownership or creation errors in console
✅ Sprite names in logs match selected sprite

---

## Notes for Debugging

If issues persist, check console for:

1. **Owner field problems:**
   ```
   grep "[GameBuilder] Block has no owner"
   ```

2. **Sprite context problems:**
   ```
   grep "[GameBuilder] sprite.*no spriteVars"
   ```

3. **Block type problems:**
   ```
   grep "Block type not found"
   ```

4. **Restoration problems:**
   ```
   grep "Recreated.*blocks.*errors"
   ```

5. **Jump execution tracking:**
   ```
   grep "motion-jump.*sprite"
   ```

Look for patterns that show cross-sprite contamination (same block type executing for multiple sprites when it shouldn't).

