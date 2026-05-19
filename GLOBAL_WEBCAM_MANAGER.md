# Global Webcam Manager Implementation

## Overview
A centralized system for managing a single shared webcam stream across all camera-related blocks in the Game Builder. Eliminates multiple stream creation and provides unified motion detection.

## Architecture

### Files Created
1. **`src/systems/GlobalWebcamManager.js`** - Main singleton manager class
2. **Updated `src/utils/extensionEngine.js`** - Added import for webcam manager

## Key Features

### 1. Single Stream Management
- ✅ **One webcam stream** created once, reused by all blocks
- ✅ **No duplicate streams** regardless of how many blocks try to turn on camera
- ✅ **Reference counting** to track which blocks are using the camera

```javascript
import { webcamManager } from '../systems/GlobalWebcamManager.js';

// Automatically shares the same stream
await webcamManager.initialize(stageElement);
webcamManager.setTransparency(50);
await webcamManager.shutdown(); // Only shuts down when no blocks need it
```

### 2. Video Element Injection
The video element is automatically:
- Injected into the stage area at z-index 1 (below sprites)
- Sized to match the stage exactly (fullscreen within game canvas)
- Persists as long as `isRunning()` returns true

```javascript
// Video element is automatically created and positioned
// Height/width match stage: 480×360
// Position: absolute, top-left, fills entire stage
```

### 3. Continuous Motion Detection
Background motion detection runs every animation frame:
- Captures video frame to hidden canvas (320×240 resolution for performance)
- Compares pixel-by-pixel with previous frame
- Calculates motion percentage (0-100)
- Detects direction: up, down, left, right, none

```javascript
webcamManager.getMotion();              // Returns 0-100
webcamManager.getMotionDirection();     // Returns 'up'|'down'|'left'|'right'|'none'
webcamManager.isMotionAboveThreshold(); // Returns boolean
webcamManager.setMotionThreshold(10);   // Set % threshold
```

### 4. Unified Block Interface
All camera blocks read/write to the same global state:

```javascript
// All blocks use the same manager
case 'body|camera|on|50':
  await webcamManager.initialize(stageElement);
  webcamManager.setTransparency(50);
  break;

case 'body|camera|off':
  await webcamManager.shutdown();
  break;

// Motion detection
case 'motion|detect':
  const motion = webcamManager.getMotion();
  const direction = webcamManager.getMotionDirection();
  break;
```

### 5. Graceful Error Handling
- Auto-starts camera if block tries to use it while off
- Silently ignores errors without breaking the game
- Falls back to demo mode if camera unavailable
- No permission errors thrown to user

```javascript
// Blocks never throw; they either work or use demo values
if (!webcamManager.isRunning()) {
  try {
    await webcamManager.initialize(stageElement);
  } catch (e) {
    console.log('Camera unavailable, using demo motion values');
    return 0; // Demo value
  }
}
```

## Integration with GameBuilder

### Step 1: Initialize at Game Start
In `GameBuilder.jsx` useEffect (around line 1145), add:

```javascript
import { webcamManager } from '../systems/GlobalWebcamManager.js';

useEffect(() => {
  if (!isPlaying) { 
    if (animRef.current) cancelAnimationFrame(animRef.current); 
    return; 
  }

  // Find stage element for camera injection
  const stageElement = canvasRef.current?.parentElement;

  // Initialize webcam manager for this game session
  webcamManager.stageElement = stageElement;
  
  // Rest of existing initialization...
}, [isPlaying, sprites, draw]);
```

### Step 2: Auto-Enable Camera for Camera Blocks
When play starts, check if any blocks reference camera:

```javascript
// Check for body-video-on blocks
if (window.Blockly?.getMainWorkspace) {
  const workspace = window.Blockly.getMainWorkspace();
  const bodyVideoBlocks = workspace.getBlocksByType('bb_body_video_on');
  
  if (bodyVideoBlocks?.length > 0) {
    const block = bodyVideoBlocks[0];
    const transparency = parseInt(block.getFieldValue('TRANSPARENCY') || '0', 10);
    
    // Initialize webcam manager
    webcamManager.initialize(stageElement).then(() => {
      webcamManager.setTransparency(transparency);
      webcamManager.addReference(); // Track that a block is using it
      console.log('[GameBuilder] Camera auto-started');
    }).catch(e => {
      console.log('[GameBuilder] Camera unavailable:', e.message);
    });
  }
}
```

### Step 3: Update extensionEngine to Use Manager
Modify the `case 'body|camera'` handler:

```javascript
case 'body|camera': {
  const state = c || 'on';
  const transparency = Math.max(0, Math.min(100, parseInt(d, 10) || 0));
  
  if (state === 'on') {
    webcamManager.initialize(stageElement).then(() => {
      webcamManager.setTransparency(transparency);
      webcamManager.addReference();
      logOut(output, '[Body] Camera on at ' + transparency + '% transparency');
    }).catch(e => {
      logOut(output, '[Body] Camera failed: ' + e.message);
    });
  } else {
    webcamManager.removeReference();
    if (webcamManager.referenceCount === 0) {
      webcamManager.shutdown();
    }
    logOut(output, '[Body] Camera off');
  }
  return;
}
```

### Step 4: Read Motion Data in Blocks
When blocks need motion information:

```javascript
case 'motion-percentage':
  return webcamManager.getMotion();

case 'motion-direction':
  return webcamManager.getMotionDirection();

case 'motion-threshold-exceeded':
  return webcamManager.isMotionAboveThreshold();
```

### Step 5: Cleanup on Game Stop
In the useEffect cleanup function:

```javascript
return () => {
  running = false;
  cancelAnimationFrame(animRef.current);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  document.removeEventListener('mousemove', handleMouseMove);
  
  // Shutdown webcam manager
  webcamManager.shutdown().catch(() => {});
};
```

## API Reference

```javascript
// Initialization
await webcamManager.initialize(stageElement)
// → Starts the webcam stream and motion detection loop

// Transparency (0 = invisible, 100 = fully visible)
webcamManager.setTransparency(50)
// → Sets video overlay opacity

// Motion Detection
webcamManager.getMotion()           // Returns: 0-100
webcamManager.getMotionDirection()  // Returns: 'up'|'down'|'left'|'right'|'none'
webcamManager.isMotionAboveThreshold() // Returns: boolean
webcamManager.setMotionThreshold(5)    // Percentage threshold

// Reference Counting
webcamManager.addReference()        // Block starts using camera
webcamManager.removeReference()     // Block stops using camera
webcamManager.referenceCount        // Get current count

// Status
webcamManager.isRunning()           // Returns: boolean
webcamManager.getVideoElement()     // Returns: HTMLVideoElement or null

// Cleanup
await webcamManager.shutdown()
// → Stops stream, removes video element, cancels motion detection
```

## Motion Detection Algorithm

1. **Frame Capture**: Every animation frame, the current video frame is drawn to a 320×240 canvas
2. **Pixel Comparison**: Each pixel is compared to the previous frame
3. **Threshold**: Pixels with RGB changes > 30 are counted as "changed"
4. **Percentage**: `(pixelsChanged / totalPixels) × 100`
5. **Direction**: Divide canvas into quadrants and calculate motion in each
6. **Result**: Store `motionPercentage` and `motionDirection` globally

Example:
- Motion < 3%: "standing"
- Motion 3-8%: Still mostly standing
- Motion 8-15%: "waving" / "arms_up"
- Motion > 15%: "dancing" / "jumping"

## Performance Notes

- **Canvas Resolution**: 320×240 (reduced from full video for speed)
- **Pixel Sampling**: Every 4th pixel checked (quadrant averaging)
- **Update Rate**: Every animation frame (60Hz)
- **Memory**: ~1MB for motion detection buffers
- **GPU**: Minimal impact, pure CPU-based comparison

## Browser Compatibility

- ✅ Chrome/Chromium (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support, iOS 14.5+)
- ⚠️ Mobile browsers (permission required)
- ❌ No camera: Falls back to demo values silently

## Troubleshooting

### Camera shows but motion doesn't detect
- Check that `startMotionDetection()` was called
- Verify animation frame loop is running
- Ensure canvas context was created successfully

### Multiple camera streams opened
- Ensure all block handlers use `webcamManager` methods
- Don't call `getUserMedia` directly, use `webcamManager.initialize()`

### Memory leak
- Always call `webcamManager.shutdown()` when game ends
- Use reference counting: `addReference()` / `removeReference()`
- Cleanup happens automatically in useEffect return

### Permission denied
- Gracefully falls back to demo mode
- No error thrown to user
- Game continues normally with simulated values

## Future Enhancements

1. **Screen recording**: Record video and motion data
2. **Custom filters**: Apply effects to video before display
3. **Multiple streams**: Support for rear camera on mobile
4. **Performance monitoring**: Track CPU usage and adapt resolution
5. **Local ML**: Run pose/hand detection directly on motion stream
