# Sprite Independence - Test Plan & Validation

## Pre-Testing Checklist

- [ ] Project loads without errors
- [ ] No console errors on startup
- [ ] Sprites Panel visible on left side
- [ ] All 3 default sprites appear: Cat, Star, Platform

## Test Suite 1: Sprite Selection & UI

### Test 1.1: Sprite Panel Visibility
```
Steps:
1. Launch Game Builder
2. Look at left sidebar

Expected:
✓ Sprites panel visible (180px wide)
✓ Shows "Cat", "Star", "Platform"
✓ Each sprite shows block count
✓ Inspector shows position data
```

### Test 1.2: Sprite Selection
```
Steps:
1. Click on "Cat" sprite
2. Verify highlight
3. Click on "Star" sprite
4. Verify highlight changed

Expected:
✓ Selected sprite highlighted in blue
✓ Selection changes when clicked
✓ Code panel updates to show sprite's blocks
✓ Only 1 sprite selected at a time
```

### Test 1.3: Code Panel Update
```
Steps:
1. Select Cat
2. Verify code panel shows Cat's blocks
3. Select Star
4. Verify code panel shows Star's blocks (different)
5. Select Cat again
6. Verify code panel matches before

Expected:
✓ Code shows only selected sprite's blocks
✓ Switching sprites updates code view
✓ Code persists when switching back
✓ No mixed code between sprites
```

### Test 1.4: Inspector Data
```
Steps:
1. Select Cat
2. Note position in Inspector (e.g., X: 180, Y: 240)
3. Click Play
4. Watch Inspector X/Y change
5. Click Stop

Expected:
✓ Inspector shows correct initial position
✓ Updates real-time during gameplay
✓ Position matches where sprite appears on stage
✓ Data updates every frame
```

## Test Suite 2: Independent Jump Mechanics

### Test 2.1: Single Sprite Jump
```
Setup:
- Only Cat has jump code
- Sprite: Cat
- Blocks: "When space pressed" → "Jump with power 15"

Steps:
1. Click Play
2. Press Space once
3. Observe Cat
4. Wait for Cat to land
5. Click Stop

Expected:
✓ Cat jumps upward when Space pressed
✓ Cat follows physics arc (up, then down)
✓ Cat lands at original height
✓ Jump smooth and complete
✓ Only Cat affects when space pressed (no other sprites)
```

### Test 2.2: Two Sprites Different Jump Timing
```
Setup:
- Cat: "When space pressed" → "Jump with power 15"
- Star: "When up arrow pressed" → "Jump with power 15"

Steps:
1. Click Play
2. Press Space (Cat should jump)
3. While Cat in mid-air, press Up (Star should jump)
4. Observe both sprites
5. Click Stop

Expected:
✓ Space only affects Cat
✓ Up only affects Star
✓ Both can jump independently
✓ Cat still falling while Star jumps
✓ Different Y positions at same time
✓ No interference between sprites
```

### Test 2.3: Simultaneous Different States
```
Setup:
- Both sprites can jump with different keys

Steps:
1. Click Play
2. Press Space fast (Cat jumps)
3. Immediately press Up arrow (Star jumps)
4. Count frames: Cat=frame1, Star=frame2 (different timing)
5. Observe both in air at different heights
6. Click Stop

Expected:
✓ Cat at peak/falling while Star at different phase
✓ Both Y coordinates independent
✓ Movement vectors independent
✓ Physics applied per-sprite
✓ No synchronization between sprites
```

### Test 2.4: Jump with Gravity
```
Setup:
- Cat: Physics/gravity block before jump block

Code structure:
When green flag clicked
  Set gravity to 0.5

Forever
  (gravity applied automatically)

When space pressed
  Jump with power 15

Steps:
1. Click Play
2. Press Space
3. Observe smooth arc with gravity

Expected:
✓ Jump accelerates downward
✓ Jump curves realistically
✓ Character accelerates as falls
✓ Gravity specific to Cat
✓ Only Cat affected
```

## Test Suite 3: Variable Independence

### Test 3.1: Per-Sprite Score
```
Setup:
- Cat: "Set score to 0", later "Change score by 10"
- Star: "Set score to 0", later "Change score by 20"

Steps:
1. Click Play
2. Run events that increase score
3. Click Stop
4. Select Cat
5. Look at Cat's variables
6. Select Star
7. Look at Star's variables

Expected:
✓ Cat's score increased by 10
✓ Star's score increased by 20
✓ Scores independent
✓ No cross-sprite interference
```

### Test 3.2: Variable Persistence
```
Setup:
- Cat: Create variable "counter", set to 0
- Star: Create variable "counter", set to 100 (different value)

Steps:
1. Click Play
2. Change Cat's counter to 5
3. Change Star's counter to 50
4. Switch to Cat
5. Verify Cat's counter is 5
6. Switch to Star
7. Verify Star's counter is 50

Expected:
✓ Each sprite's counter independent
✓ Values don't cross over
✓ Switching doesn't affect values
✓ Each sprite has own counter
```

## Test Suite 4: Multiple Input Handling

### Test 4.1: Different Keys Per Sprite
```
Setup:
- Cat: When W/A/S/D/Space pressed → Move/Jump
- Star: When Arrow keys pressed → Move

Steps:
1. Click Play
2. Press W → Cat moves left
3. Press Up Arrow → Star moves up
4. Press Space → Cat jumps
5. Press Shift → Nothing (no sprite listens)

Expected:
✓ Each sprite responds to its keys only
✓ No cross-sprite inputs
✓ All inputs processed correctly
✓ Input isolation working
```

### Test 4.2: Simultaneous Inputs
```
Steps:
1. Hold down W (Cat moves left)
2. Hold down Up Arrow (Star moves up)
3. While both held, press Space (Cat jumps)
4. Observe all three actions

Expected:
✓ Cat moves left + jumps (combination works)
✓ Star moves up (unaffected by Cat's jump)
✓ Three simultaneous independent actions
✓ No input conflicts
```

## Test Suite 5: Block Code Scoping

### Test 5.1: Physics Blocks Per-Sprite
```
Setup:
- Cat: "Set velocity" block → vx=5, vy=0
- Star: Does not have velocity block

Steps:
1. Click Play
2. Observe Cat velocity changes
3. Observe Star has no velocity change

Expected:
✓ Only Cat's velocity affected
✓ Star unaffected
✓ Block scoped to sprite
```

### Test 5.2: Multiple Physics Blocks
```
Setup:
- Cat: Gravity block (0.5), Jump block (power 15)
- Star: Gravity block (0.3), Jump block (power 10)

Steps:
1. Click Play
2. Jump both sprites
3. Observe different arc heights
4. Observe different falling speeds

Expected:
✓ Cat jumps higher (power 15 vs 10)
✓ Star falls slower (gravity 0.3 vs 0.5)
✓ Each sprite's physics independent
✓ Gravity applied per-sprite
```

## Test Suite 6: Sprite Panel Features

### Test 6.1: Add Sprite Button
```
Steps:
1. Click "+" button in sprites panel
2. New sprite appears in list
3. Click new sprite
4. Verify it's selectable

Expected:
✓ Can add new sprites
✓ New sprite appears in list
✓ Can select new sprite
✓ Sprite works independently
```

### Test 6.2: Block Count Display
```
Steps:
1. Add blocks to Cat
2. Check block count in panel
3. Add more blocks
4. Count increases

Expected:
✓ Block count shows correctly
✓ Updates when blocks added
✓ Updates when blocks removed
✓ Accurate per-sprite
```

### Test 6.3: Hover/Visual Feedback
```
Steps:
1. Hover over unselected sprite
2. Verify highlight on hover
3. Click to select
4. Hover effect changes

Expected:
✓ Hover state visible
✓ Visual feedback clear
✓ Selection state obvious
✓ UI responsive
```

## Test Suite 7: Physics Accuracy

### Test 7.1: Jump Arc
```
Setup:
- Two sprites, both can jump
- Power: 15
- Gravity: 0.5

Steps:
1. Jump sprite 1
2. Count pixels up
3. Jump sprite 2
4. Count pixels up

Expected:
✓ Both jump same height (same physics)
✓ Arc is smooth
✓ Landing point exact
✓ Physics calculation consistent
```

### Test 7.2: Collision with Ground
```
Setup:
- Sprites start at y=200
- Stage height: 360

Steps:
1. Set gravity to 1.0
2. Sprite falls
3. Observe landing

Expected:
✓ Sprite stops at stage bottom
✓ No glitching through floor
✓ Velocity resets to 0
✓ isGrounded set correctly
```

### Test 7.3: Velocity Independence
```
Setup:
- Cat: vx=5, vy=0
- Star: vx=-5, vy=0

Steps:
1. Play game
2. Observe Cat moves right
3. Observe Star moves left
4. Monitor velocities

Expected:
✓ Velocities independent
✓ No velocity mixing
✓ Each sprite's velocity correct
✓ Movement directions opposite
```

## Test Suite 8: Edge Cases & Error Handling

### Test 8.1: No Sprite Selected
```
Steps:
1. Try to drag block without sprite selected
2. Try to play without sprite selected

Expected:
✓ Graceful handling
✓ No crash
✓ Clear message or auto-select
```

### Test 8.2: Empty Sprite
```
Steps:
1. Create sprite with no blocks
2. Select it
3. Play game

Expected:
✓ No errors
✓ Sprite visible but inactive
✓ Can add blocks later
```

### Test 8.3: Many Sprites (Performance)
```
Steps:
1. Create 10 sprites
2. Add physics blocks to all
3. Play game
4. Observe frame rate

Expected:
✓ Game still runs
✓ All sprites independent
✓ No lag/freeze
✓ Acceptable performance
```

## Validation Checklist

Core Functionality:
- [ ] Sprites Panel shows all sprites
- [ ] Sprite selection works
- [ ] Code shows only selected sprite
- [ ] Inspector updates real-time
- [ ] Each sprite can jump independently
- [ ] Variables are scoped per-sprite
- [ ] Physics calculations per-sprite
- [ ] Multiple sprites different states simultaneously
- [ ] Input handlers work per-sprite
- [ ] Add sprite button works

Physics Accuracy:
- [ ] Jump arc smooth
- [ ] Gravity consistent
- [ ] Landing detection works
- [ ] Velocity independent
- [ ] No velocity mixing

UI/UX:
- [ ] Sprites panel intuitive
- [ ] Selection obvious
- [ ] No visual glitches
- [ ] Responsive to input
- [ ] Inspector informative

Performance:
- [ ] Smooth gameplay
- [ ] No lag with multiple sprites
- [ ] Physics calculations quick
- [ ] Rendering smooth

## Known Limitations (Document)

- [ ] No sprite-to-sprite messaging yet
- [ ] No shared global variables yet
- [ ] Sprites can't directly access other sprite's variables yet
- [ ] No sprite layering/depth sorting yet

## Sign-Off

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Ready for production
- [ ] Documentation complete
- [ ] User guide created
