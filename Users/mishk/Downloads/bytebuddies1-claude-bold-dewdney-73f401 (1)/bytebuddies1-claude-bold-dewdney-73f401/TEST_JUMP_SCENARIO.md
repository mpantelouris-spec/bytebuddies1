# Test: Jump Mechanic

## Setup
Create a game with one sprite and these blocks:

### Sprite: Player
1. **When green flag clicked**
   - Set gravity to 0.5
   - Set Y to 300 (near bottom)

2. **When key [space] pressed**
   - Jump with power 15

3. **Forever**
   - (no blocks - let physics handle movement)

## Expected Behavior
1. Sprite starts at Y=300 (bottom area)
2. When you press SPACE, sprite should jump upward (Y decreases)
3. Gravity pulls sprite back down
4. Sprite stops at Y=300 when it hits the ground

## Debug Info
- Gravity should be applied once per frame: `sprite.vy += 0.5`
- Jump sets: `sprite.vy = -15`
- Position updates: `sprite.y += sprite.vy`
- Ground collision stops at: `sprite.y = STAGE_H - sprite.h`

## Key Fix Applied
Physics updates (gravity, velocity, position) are now applied ONCE per frame in the main game loop, not after every block execution. This allows proper physics simulation for jumping and falling.

### Before Fix
- Physics applied after every block
- Multiple blocks in event = physics applied multiple times per frame
- Jump velocity gets overwritten by gravity multiple times

### After Fix
- All blocks execute sequentially
- Physics applied exactly once at end of frame
- Proper physics simulation for jump arc

## How to Test
1. Click Play
2. Press SPACE to jump
3. Sprite should arc up then fall back down
4. Gravity should pull sprite to ground level
