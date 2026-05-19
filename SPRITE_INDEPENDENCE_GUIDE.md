# Sprite Independence - Quick Reference Guide

## How to Use

### Selecting a Sprite
1. Look at the **left panel** labeled "SPRITES"
2. Click on any sprite name (e.g., "Cat", "Star", "Platform")
3. The selected sprite will **highlight in blue**
4. Its code blocks appear in the middle panel
5. The stage shows all sprites (you can click on stage to select)

### Creating Independent Actions

#### Example: Two Players with Different Controls

**Player 1 (Cat):**
```
When [W] key pressed
  Change X by 10

When [SPACE] key pressed
  Jump with power 15
```

**Player 2 (Star):**
```
When [Up Arrow] key pressed
  Change Y by -10

When [Up Arrow] key pressed
  Jump with power 15
```

**Result:** 
- Press W → Only Cat moves right
- Press Space → Only Cat jumps
- Press Up → Only Star moves up
- Press Up again → Only Star jumps
- Both can jump at different times!

### Understanding Sprite Inspector

When you select a sprite, the bottom-left panel shows:
```
Inspector:
X: 150    ← Current X position
Y: 200    ← Current Y position
Size: 48×48
```

These update in real-time as the game runs.

### Per-Sprite Variables

When you create a variable in a sprite's code:
```
Set [score] to 0
```

This variable belongs ONLY to that sprite. Another sprite can have its own `score` variable without affecting the first sprite's score.

**Important:** Each sprite's variables are isolated.

### Physics (Jump, Gravity, etc.)

Each sprite has independent physics:
- **Velocity (vx, vy):** Each sprite's movement speed
- **Gravity:** Each sprite falls independently
- **Jump:** Each sprite has own jump state
- **Ground Detection:** Each sprite detects ground separately

**Example:**
```
Sprite 1: In air (jumping)
Sprite 2: On ground (not jumping)
Sprite 3: Falling
```
All three can have different states at the same time!

## Troubleshooting

### "All sprites jump together"
**Solution:** Make sure you're using a **per-sprite block**. Example:
```
When [SPACE] pressed       ✓ CORRECT (triggers for one sprite at a time)
  Jump with power 15
```

### "I can't see my sprite's code"
**Solution:** Click your sprite in the left panel. The code panel should show only that sprite's blocks.

### "Variables are mixing between sprites"
**Solution:** Each sprite has independent variables now. Create variables in EACH sprite's code. Don't worry about sharing - it won't happen automatically.

## Best Practices

1. **Use different keys for each sprite:**
   - Player 1: W, A, S, D + Space
   - Player 2: Arrow Keys + Shift
   - Enemy: Automatic (no keys)

2. **Name sprites clearly:**
   - "Player 1", "Player 2", "Enemy", "Platform"
   - Easy to remember and select

3. **Keep scripts organized:**
   - One "start" event at the top (initialization)
   - Input handlers below (on key press)
   - Physics/loops at the bottom

4. **Use sprite color-coding:**
   - Blue = Player 1
   - Red = Player 2
   - Green = Other
   - Makes sprites visually distinct

## Examples

### Multiplayer Jump Game
```
SETUP:
- Sprite 1 (Player): Cat (Blue)
- Sprite 2 (Player): Star (Red)
- Sprite 3 (Obstacle): Platform

CODE:
Player Cat:
  When green flag clicked
    Set gravity to 0.5
  
  Forever
    Apply gravity
  
  When W pressed
    Jump with power 15

Player Star:
  When green flag clicked
    Set gravity to 0.5
  
  Forever
    Apply gravity
  
  When Up Arrow pressed
    Jump with power 15
```

### Racing Game
```
Sprite 1 (Racer):
  When green flag clicked
    Go to X 0 Y 200
  
  When A pressed
    Change X by -5
  
  When D pressed
    Change X by 5

Sprite 2 (Obstacle):
  When green flag clicked
    Go to X 240 Y 100
  
  Forever
    Change X by -2
```

## Key Concepts

| Concept | Before | After |
|---------|--------|-------|
| Jump State | Global (all sprites) | Per-sprite |
| Velocity | Shared | Independent |
| Variables | Global | Scoped to sprite |
| Physics | All same | Each sprite different |
| Code | Mixed | Organized by sprite |

## Video Demo (Suggested)

To show users:
1. Create project with 2 sprites
2. Add jump code to each
3. Click Play
4. Show both sprites jumping independently
5. Show Inspector updating in real-time
6. Show changing sprites and code changing

---

**Remember:** Each sprite is now completely independent. Think of it like different characters in a game - each with their own movement, jumping, and abilities!
