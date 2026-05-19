# Motion Blocks - Quick Reference Guide

## Direction Angles
```
      90° (up)
         ↑
180° (left) ← → 0° (right)
         ↓
     270° (down)
```

## Core Motion Blocks

| Block | Effect | Parameters |
|-------|--------|------------|
| **move steps** | Move forward in current direction | steps (default: 10) |
| **turn clockwise degrees** | Rotate clockwise | degrees (default: 15) |
| **turn anticlockwise degrees** | Rotate counter-clockwise | degrees (default: 15) |

## Teleport Blocks

| Block | Effect |
|-------|--------|
| **go to random position** | Jump to random spot on stage |
| **go to mouse-pointer** | Jump to cursor position |
| **go to [sprite]** | Jump to another sprite |
| **go to x, y** | Jump to exact coordinates |

## Glide Animation Blocks

| Block | Effect | Parameters |
|-------|--------|------------|
| **glide secs to random** | Smooth move to random position | secs (default: 1) |
| **glide secs to x, y** | Smooth move to coordinates | secs, x, y |
| **glide secs to [sprite]** | Smooth move to sprite | secs, sprite name |
| **glide secs to mouse** | Smooth move to cursor | secs |

## Direction Blocks

| Block | Effect | Parameters |
|-------|--------|------------|
| **point in direction** | Face exact direction | degrees (0-360) |
| **point towards [sprite/mouse]** | Face target position | sprite name or mouse |

## Position Modification Blocks

| Block | Effect | Parameters |
|-------|--------|------------|
| **change x by** | Move right/left | amount (positive = right) |
| **set x to** | Set X position exactly | x coordinate |
| **change y by** | Move up/down | amount (positive = down) |
| **set y to** | Set Y position exactly | y coordinate |

## Edge Behavior

| Block | Effect |
|-------|--------|
| **if on edge, bounce** | Reflect direction when hitting stage edge |
| **set rotation style** | all-around / left-right / no-rotation |

## Reporter Blocks (Returns Values)

| Block | Returns |
|-------|---------|
| **x position** | Current X coordinate |
| **y position** | Current Y coordinate |
| **direction** | Current facing angle (0-360°) |

## Common Usage Patterns

### Make sprite walk in place
```
when clicked
  repeat 10 {
    move 10 steps
  }
```

### Make sprite follow mouse
```
forever {
  point towards mouse-pointer
  move 5 steps
}
```

### Make sprite bounce around
```
when started
  forever {
    move 10 steps
    if on edge, bounce
  }
```

### Glide to target
```
when clicked
  glide 2 secs to random position
```

### Rotate and move
```
when key [right] pressed
  turn clockwise 15 degrees
  move 10 steps
```

## Coordinate System
- **X-axis:** 0 = left, increases rightward, max ≈ 480
- **Y-axis:** 0 = top, increases downward, max ≈ 360
- **Center:** Approximately (240, 180)

## Glide Animation
- **Linear interpolation:** Position updates smoothly each frame
- **Duration:** Time in seconds to complete movement
- **Example:** glide 1 sec to x:100 y:50 = takes 1 second to reach destination

## Edge Bounce Physics
- **Left/Right bounce:** Reflects X velocity (direction ↔ 180° - direction)
- **Top/Bottom bounce:** Reflects Y velocity (direction ↔ -direction)
- **Corner bounce:** Both may apply but separately to prevent double-reflection

## Tips
- **Reporter blocks** can be used in conditions: `if x position > 200`
- **Point towards** works with any sprite or the mouse pointer
- **Glide animations** automatically interpolate smoothly over the specified time
- **Move steps** uses current direction, so set direction first if needed
- **Bounce** only works if sprite hits the stage edge
