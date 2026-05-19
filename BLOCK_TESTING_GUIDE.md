# Comprehensive Block Testing Guide

## Test Setup
1. Open Game Builder: http://localhost:5173/#gamebuilder
2. Create a new sprite or use the default Star sprite
3. Test each block individually first, then in combinations
4. Click **Play** to run tests
5. Open DevTools (F12) to check for errors
6. Document results below

---

## 🎬 MOTION BLOCKS

### 1. Move [10] steps
- **Test**: Drag block to canvas → Click Play → Check sprite moves right
- **Expected**: Sprite slides in direction it's facing by 10 pixels
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 2. Turn [15] degrees (clockwise/counter-clockwise)
- **Test**: Add "Turn 90 degrees" → Click Play → Check rotation
- **Expected**: Sprite rotates 90° clockwise
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 3. Turn [15] degrees counter-clockwise
- **Test**: Add block → Click Play
- **Expected**: Sprite rotates counter-clockwise
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 4. Go to x: [0] y: [0]
- **Test**: Set x:100 y:150 → Click Play
- **Expected**: Sprite jumps to position (100, 150)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 5. Go to [random position]
- **Test**: Add block → Click Play multiple times
- **Expected**: Sprite appears in different random locations each time
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 6. Glide [1] secs to x: [100] y: [100]
- **Test**: Add block → Click Play
- **Expected**: Sprite smoothly animates to position over 1 second
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 7. Point in direction [90]
- **Test**: Set direction to 45 → Click Play
- **Expected**: Sprite points 45° (toward top-right)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 8. Point towards [mouse-pointer]
- **Test**: Add block → Click Play → Move mouse around
- **Expected**: Sprite always points toward cursor
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 9. Change x by [10]
- **Test**: Add block inside repeat → Click Play
- **Expected**: Sprite moves right continuously
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 10. Set x to [200]
- **Test**: Set x to 200 → Click Play
- **Expected**: Sprite x position is exactly 200
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 11. Change y by [10]
- **Test**: Add "Change y by -5" → Click Play
- **Expected**: Sprite moves up (negative y) continuously
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 12. Set y to [150]
- **Test**: Set y to 150 → Click Play
- **Expected**: Sprite y position is exactly 150
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 13. Bounce if on edge
- **Test**: Move sprite to edge → Add "Move 50 steps" → Repeat
- **Expected**: Sprite bounces off stage edges
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## 👀 LOOKS BLOCKS

### 14. Say [hello!]
- **Test**: Add block → Click Play
- **Expected**: Speech bubble appears with text above sprite
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 15. Say [hello!] for [2] seconds
- **Test**: Add block → Click Play → Watch speech bubble
- **Expected**: Speech bubble appears and disappears after 2 seconds
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 16. Think [Hmm...]
- **Test**: Add block → Click Play
- **Expected**: Thought bubble appears
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 17. Think [Hmm...] for [2] seconds
- **Test**: Add block → Click Play
- **Expected**: Thought bubble appears and disappears after 2 seconds
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 18. Show
- **Test**: Set sprite invisible first → Add "Show" → Click Play
- **Expected**: Sprite becomes visible
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 19. Hide
- **Test**: Add block → Click Play
- **Expected**: Sprite becomes invisible
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 20. Change size by [10]
- **Test**: Add block in repeat → Click Play
- **Expected**: Sprite grows larger continuously
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 21. Set size to [100] %
- **Test**: Set size to 50 → Click Play
- **Expected**: Sprite is half normal size
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 22. Change [color] effect by [25]
- **Test**: Add multiple → Click Play
- **Expected**: Sprite changes color/hue
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 23. Set [color] effect to [0]
- **Test**: Set to different values → Click Play
- **Expected**: Sprite color shifts change
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 24. Clear graphic effects
- **Test**: Apply color effect → Add clear block → Click Play
- **Expected**: All effects removed, sprite looks normal
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 25. Switch costume to [costume2]
- **Test**: Select different costume → Click Play
- **Expected**: Sprite costume changes
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 26. Next costume
- **Test**: Add in repeat loop → Click Play
- **Expected**: Sprite cycles through costumes
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 27. Change [brightness] effect by [10]
- **Test**: Add block → Click Play
- **Expected**: Sprite becomes brighter/darker
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 28. Switch backdrop to [backdrop2]
- **Test**: Select backdrop → Click Play
- **Expected**: Stage background changes
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 29. Next backdrop
- **Test**: Add block → Click Play → Press key repeatedly
- **Expected**: Backdrop cycles through all backdrops
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## 🔊 SOUND BLOCKS

### 30. Play sound [pop]
- **Test**: Add block → Click Play
- **Expected**: Sound plays (check volume)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 31. Play sound [pop] until done
- **Test**: Add block → Add second sprite with move block → Click Play
- **Expected**: Sound plays to completion before sprite moves
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 32. Stop all sounds
- **Test**: Play sound → Add stop block → Click Play
- **Expected**: Sound stops immediately
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 33. Change volume by [-10]
- **Test**: Add block in repeat → Click Play
- **Expected**: Sound gets quieter (or louder if positive)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 34. Set volume to [100] %
- **Test**: Set to 50 → Play sound → Click Play
- **Expected**: Sound plays at 50% volume
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 35. Change [pitch] by [10]
- **Test**: Add block → Play sound → Click Play
- **Expected**: Sound pitch changes
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## 🎯 EVENTS BLOCKS

### 36. When green flag clicked
- **Test**: Add block with "Move 10 steps" → Click Play
- **Expected**: Code runs when you click Play
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 37. When [space] key pressed
- **Test**: Add block → Click Play → Press space
- **Expected**: Code runs when space is pressed
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 38. When this sprite clicked
- **Test**: Add block → Click Play → Click sprite
- **Expected**: Code runs when sprite is clicked
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 39. When backdrop switches to [backdrop1]
- **Test**: Create second sprite → Add block → Switch backdrop
- **Expected**: Code runs when backdrop changes to specified one
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 40. When [loudness] > [50]
- **Test**: Add block → Make sound near mic → Click Play
- **Expected**: Code runs when sound exceeds threshold
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 41. Broadcast [message1]
- **Test**: Create two sprites → One broadcasts, other receives → Click Play
- **Expected**: First sprite sends message, second sprite receives it
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 42. When I receive [message1]
- **Test**: Same as broadcast test → Click Play
- **Expected**: Code runs when message is received
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## ⚙️ CONTROL BLOCKS

### 43. Wait [1] seconds
- **Test**: Add "Move 10 steps" → Wait 2 → Move 10 → Click Play
- **Expected**: Sprite moves, waits 2 seconds, moves again
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 44. Repeat [10]
- **Test**: Repeat "Move 5 steps" 10 times → Click Play
- **Expected**: Sprite moves 50 pixels total
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 45. Forever
- **Test**: Forever repeat "Move 3 steps" → Click Play → Wait 5 sec
- **Expected**: Sprite moves continuously off stage
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 46. If [condition] then
- **Test**: If key pressed → Move 10 → Click Play → Press key
- **Expected**: Sprite only moves when condition is true
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 47. If [condition] then ... else
- **Test**: If key pressed → Say yes → Else → Say no → Click Play
- **Expected**: Says yes when key pressed, no otherwise
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 48. Wait until [condition]
- **Test**: Wait until key pressed → Move 10 → Click Play → Press key
- **Expected**: Sprite waits, then moves when key is pressed
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 49. Repeat until [condition]
- **Test**: Repeat until key pressed → Move 5 → Click Play → Press key
- **Expected**: Sprite moves in loop until key is pressed
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 50. Stop [all]
- **Test**: Forever loop → Add stop all → Click Play after few seconds manually
- **Expected**: Program stops completely
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 51. Stop [this script]
- **Test**: Forever → At some point add "Stop this script" → Click Play
- **Expected**: Current script stops, others continue
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 52. Create clone of [myself]
- **Test**: When clicked → Create clone → Click Play → Click sprite
- **Expected**: Duplicate sprite appears
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 53. When I start as a clone
- **Test**: Clone creation → When I start as clone → Move random
- **Expected**: Clone moves when created
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 54. Delete this clone
- **Test**: Create clone → Clone deletes itself after 2 seconds
- **Expected**: Clone disappears
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## 👁️ SENSING BLOCKS

### 55. Touching [edge]?
- **Test**: If touching edge → Bounce (move away)
- **Expected**: Returns true when sprite touches edge
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 56. Touching color [#FF0000]?
- **Test**: If touching red color → Say "Red touched"
- **Expected**: Returns true when sprite touches color
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 57. Color [#FF0000] touching [#00FF00]?
- **Test**: Check if two colors touch on stage
- **Expected**: Returns true when colors overlap
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 58. Ask [What's your name?] and wait
- **Test**: Add block → Click Play → Type answer
- **Expected**: Shows prompt, waits for user input
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 59. Answer (reporter)
- **Test**: Ask → Say [answer] → Click Play
- **Expected**: Displays what user typed
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 60. Key [space] pressed?
- **Test**: If key pressed → Move 10 → Click Play → Press key
- **Expected**: Returns true when key is pressed
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 61. Mouse down?
- **Test**: If mouse down → Change color → Click Play → Click stage
- **Expected**: Returns true while mouse button held
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 62. Mouse x (reporter)
- **Test**: Go to x: [mouse x] → Click Play → Move mouse
- **Expected**: Sprite follows mouse horizontally
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 63. Mouse y (reporter)
- **Test**: Go to y: [mouse y] → Click Play → Move mouse
- **Expected**: Sprite follows mouse vertically
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 64. Distance to [mouse-pointer]
- **Test**: Say [distance to mouse] → Click Play → Move mouse
- **Expected**: Shows distance number that changes
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 65. Timer (reporter)
- **Test**: Say [timer value] → Click Play
- **Expected**: Shows elapsed seconds since start
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 66. Reset timer
- **Test**: Wait 3 → Reset → Say [timer]
- **Expected**: Timer resets to 0 after 3 seconds
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 67. Current [year]
- **Test**: Say [current year] → Click Play
- **Expected**: Shows current year (2026)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 68. Loudness (reporter)
- **Test**: Say [loudness] → Click Play → Make sound
- **Expected**: Shows loudness level that changes with sound
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## ➕ OPERATORS

### 69. [2] + [3] (addition)
- **Test**: Say [2 + 3] → Click Play
- **Expected**: Shows 5
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 70. [5] - [2] (subtraction)
- **Test**: Say [5 - 2] → Click Play
- **Expected**: Shows 3
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 71. [3] × [4] (multiplication)
- **Test**: Say [3 × 4] → Click Play
- **Expected**: Shows 12
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 72. [10] ÷ [2] (division)
- **Test**: Say [10 ÷ 2] → Click Play
- **Expected**: Shows 5
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 73. Pick random [1] to [10]
- **Test**: Say [random] → Click Play multiple times
- **Expected**: Shows different random numbers each time
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 74. [5] > [3]? (greater than)
- **Test**: If [5 > 3] then → Say "Yes"
- **Expected**: Shows true (Yes)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 75. [3] < [5]? (less than)
- **Test**: If [3 < 5] then → Say "Yes"
- **Expected**: Shows true (Yes)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 76. [5] = [5]? (equals)
- **Test**: If [5 = 5] then → Say "Equal"
- **Expected**: Shows true
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 77. [true] and [true] (boolean AND)
- **Test**: If [true AND true] → Say "Both true"
- **Expected**: Shows true
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 78. [true] or [false] (boolean OR)
- **Test**: If [true OR false] → Say "One true"
- **Expected**: Shows true
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 79. not [false]
- **Test**: If [not false] → Say "Negated"
- **Expected**: Shows true
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 80. Join [hello] [world]
- **Test**: Say [join hello world] → Click Play
- **Expected**: Shows "helloworld"
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 81. Letter [1] of [hello]
- **Test**: Say [letter 1 of hello] → Click Play
- **Expected**: Shows "h"
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 82. Length of [hello]
- **Test**: Say [length of hello] → Click Play
- **Expected**: Shows 5
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 83. [hello] contains [ll]?
- **Test**: If [hello contains ll] → Say "Found"
- **Expected**: Shows true
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 84. [17] mod [5]
- **Test**: Say [17 mod 5] → Click Play
- **Expected**: Shows 2 (remainder)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 85. Round [3.7]
- **Test**: Say [round 3.7] → Click Play
- **Expected**: Shows 4
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 86. [round] of [3.7]
- **Test**: Test different rounding functions
- **Expected**: Rounds correctly
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## 📊 VARIABLES

### 87. Set [my variable] to [0]
- **Test**: Set variable to 5 → Say [variable]
- **Expected**: Shows 5
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 88. Change [my variable] by [1]
- **Test**: Repeat 5 → Change by 1 → Say [variable] → Click Play
- **Expected**: Shows 5 after loop
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 89. Show variable [my variable]
- **Test**: Add block → Click Play
- **Expected**: Variable value displays on stage
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 90. Hide variable [my variable]
- **Test**: Show then Hide → Click Play
- **Expected**: Variable hidden from view
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## 🎥 CAMERA/VIDEO BLOCKS (NEW!)

### 91. [Body] Turn on video on stage
- **Test**: Add block → Click Play → Grant camera permission
- **Expected**: Webcam feed displays on stage ✅
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 92. Set video transparency to [50] %
- **Test**: Turn on video → Set transparency 50 → Click Play
- **Expected**: Video is 50% transparent (semi-visible)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 93. Mirror video [on/off]
- **Test**: Turn on video → Mirror on → Click Play
- **Expected**: Video is horizontally flipped
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 94. Video width (reporter)
- **Test**: Say [video width] → Click Play
- **Expected**: Shows 1280 (default width)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 95. Video height (reporter)
- **Test**: Say [video height] → Click Play
- **Expected**: Shows 720 (default height)
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 96. Pause video
- **Test**: Turn on → Wait 2 → Pause → Click Play
- **Expected**: Video freezes after 2 seconds
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 97. Resume video
- **Test**: Turn on → Pause → Wait 1 → Resume → Click Play
- **Expected**: Video unfreezes after pause
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## 🎨 PEN EXTENSION

### 98. Pen down
- **Test**: Pen down → Move 100 steps → Click Play
- **Expected**: Draws line as sprite moves
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 99. Pen up
- **Test**: Move → Pen down → Move → Pen up → Move
- **Expected**: Can draw and erase lines
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 100. Set pen color to [#FF0000]
- **Test**: Set color → Pen down → Draw
- **Expected**: Draws in selected color
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 101. Set pen size to [5]
- **Test**: Set size → Pen down → Draw
- **Expected**: Line thickness matches size
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 102. Change pen [hue] by [10]
- **Test**: Add in loop while drawing
- **Expected**: Color shifts as drawing continues
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 103. Stamp
- **Test**: Stamp → Move → Stamp → Click Play
- **Expected**: Leaves sprite impressions on stage
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### 104. Erase all
- **Test**: Draw → Erase all → Click Play
- **Expected**: All drawings disappear
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

---

## 🔗 COMBINATION TESTS

### Test: Motion + Events
- **Setup**: When key pressed → Move 50 → Turn 45
- **Expected**: Sprite moves and rotates on key press
- **Result**: ☐ Pass ☐ Fail

### Test: Control + Sensing
- **Setup**: Forever → If touching edge → Bounce
- **Expected**: Continuous checking and bouncing
- **Result**: ☐ Pass ☐ Fail

### Test: Variables + Operators
- **Setup**: When clicked → Change var by 1 → Say [variable > 5]
- **Expected**: Shows true/false based on variable value
- **Result**: ☐ Pass ☐ Fail

### Test: Camera + Variables
- **Setup**: Turn on video → Set var to video width → Say [var]
- **Expected**: Shows video width value
- **Result**: ☐ Pass ☐ Fail

### Test: Pen + Events
- **Setup**: When key pressed → Pen down, When key released → Pen up
- **Expected**: Draw while key held, stop when released
- **Result**: ☐ Pass ☐ Fail

### Test: Broadcasting + Variables
- **Setup**: Sprite 1 broadcasts with variable → Sprite 2 receives and uses variable
- **Expected**: Variable data passes between sprites
- **Result**: ☐ Pass ☐ Fail

---

## 📝 SUMMARY

**Total Blocks Tested**: _____ / 104

**Passing**: _____ 
**Failing**: _____
**Not Available**: _____

**Critical Issues Found**:
1. _______________
2. _______________
3. _______________

**Performance Notes**:
- Any lag detected? _______________
- Memory issues? _______________
- Frame rate drops? _______________

**Browser Console Errors**:
- None detected ☐
- Errors found (list): _______________

---

**Testing Completed By**: _______________
**Date**: _______________
**Build Version**: localhost:5173
