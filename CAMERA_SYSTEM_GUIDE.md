# Production-Ready Camera System Guide

## Overview

A complete, production-ready camera/video system for browser-based visual game builders (Scratch/PictoBlox style). This system provides:

- ✅ Webcam integration with transparency control (0-100%)
- ✅ Proper rendering pipeline with layer compositing
- ✅ Real-time block parameter updates
- ✅ AI/computer vision overlay support
- ✅ Memory-efficient frame capture
- ✅ Responsive canvas scaling
- ✅ Performance monitoring and FPS optimization
- ✅ Proper resource cleanup

## Architecture

### Core Components

1. **StageRenderer** - Canvas setup and rendering surface
   - Pixel-perfect rendering
   - Responsive scaling
   - FPS statistics

2. **WebcamManager** - Webcam lifecycle and frame capture
   - Permission handling
   - Frame acquisition
   - Device enumeration
   - Transparency control

3. **LayerCompositor** - Layer management and compositing
   - Layer stack ordering
   - Opacity control
   - Efficient layer rendering

4. **RenderPipeline** - Main orchestrator
   - Coordinates all systems
   - Maintains stable FPS
   - Manages rendering loop

### Layer Stack (Correct Order)

```
Layer 5: Debug UI (console, stats)
Layer 4: Sprites (game objects)
Layer 3: AI Overlays (face, pose, objects)
Layer 2: Webcam Video
Layer 1: Background
```

## Quick Start

### 1. Replace Game Stage Component

```tsx
import { StageWithCamera } from './components/StageWithCamera';

function GameEditor() {
  return (
    <StageWithCamera
      width={480}
      height={360}
      backgroundColor="#1a1a1a"
      responsive={true}
      debugEnabled={process.env.NODE_ENV === 'development'}
      onReady={(pipeline) => {
        // Store for later use
        window.gamePipeline = pipeline;
      }}
      onFrameRender={(ctx, deltaTime) => {
        // Render sprites and game objects here
        // Called every frame at 60 FPS
        renderGameFrame(ctx, deltaTime);
      }}
    />
  );
}
```

### 2. Execute Camera Blocks

```tsx
import { executeCAMERABlock } from './systems/camera';

// In your block execution system:
async function executeBlock(block) {
  if (block.type.startsWith('camera-')) {
    const result = await executeCAMERABlock(block.type, block.params);
    return result;
  }
  // ... handle other blocks
}
```

## API Reference

### RenderPipeline

```typescript
// Initialize
await pipeline.initialize(canvasElement, containerElement);

// Control playback
await pipeline.start();  // Start rendering
pipeline.pause();        // Pause (keep stream)
pipeline.resume();       // Resume
pipeline.stop();         // Stop (close stream)

// Control video
pipeline.setWebcamOpacity(0.5);  // 0-1 range
const opacity = pipeline.getWebcamOpacity();

// Access subsystems
const webcam = pipeline.getWebcamManager();
const renderer = pipeline.getStageRenderer();
const compositor = pipeline.getLayerCompositor();

// Get statistics
const stats = pipeline.getStats();
console.log(stats.stage.fps);      // Current FPS
console.log(stats.stage.frameTime); // ms per frame
console.log(stats.webcam.isRunning); // Camera state
```

### WebcamManager

```typescript
const webcam = pipeline.getWebcamManager();

// Lifecycle
await webcam.initialize();
await webcam.start();
webcam.stop();
webcam.pause();
webcam.resume();

// Frame capture
const frame = webcam.captureFrame();
if (frame) {
  console.log(frame.width, frame.height);  // Dimensions
  console.log(frame.data);                 // ImageData
  console.log(frame.timestamp);            // Capture time
}

// Frame callback
const unsubscribe = webcam.onFrame((frame) => {
  // Process frame
});

// Configuration
webcam.setTransparency(50);  // 0-100
webcam.setMirrored(true);

// State
const state = webcam.getState();
console.log(state.isRunning);
console.log(state.fps);
console.log(state.frameCount);

// Devices
const cameras = await webcam.enumerateDevices();
await webcam.switchDevice(cameras[0].deviceId);
```

### LayerCompositor

```typescript
const compositor = pipeline.getLayerCompositor();

// Register custom layers
compositor.registerLayer(
  'overlay',
  { zIndex: 20, opacity: 1 },
  (ctx, deltaTime) => {
    // Render custom overlays
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(10, 10, 50, 50);
  }
);

// Control layers
compositor.setLayerVisible('sprites', true);
compositor.setLayerOpacity('webcam', 0.8);
compositor.updateLayer('sprites', { opacity: 0.9 });

// Resize
compositor.resizeLayers(480, 360);

// Stats
const stats = compositor.getLayerStats();
console.log(stats.webcam);  // { visible, opacity, zIndex }
```

### OverlayUtils

```typescript
import { OverlayUtils } from './systems/camera';

// Drawing primitives
OverlayUtils.drawBoundingBox(ctx, x, y, w, h, {
  color: '#00FF00',
  lineWidth: 2,
  fillAlpha: 0.3,
});

OverlayUtils.drawKeypoints(ctx, points, {
  color: '#FF00FF',
  fillAlpha: 0.8,
  labels: true,
});

OverlayUtils.drawSkeleton(ctx, points, connections, {
  color: '#00FF00',
  lineWidth: 2,
});

// Coordinate conversion
const stageCoords = OverlayUtils.convertWebcamToStage(
  webcamX,
  webcamY,
  1280, // webcam width
  720,  // webcam height
  480,  // stage width
  360   // stage height
);

// Utilities
const bbox = OverlayUtils.getBoundingBox(points, 0.5);  // With confidence threshold
const color = OverlayUtils.hslToRgb(120, 100, 50);      // Hue, Saturation, Lightness
```

## Block Definitions

The system includes these standard blocks:

```
turn camera [on/off]
set video transparency to [0-100] %
mirror video [on/off]
video width          (reporter)
video height         (reporter)
video transparency   (reporter)
pause video
resume video
```

## Transparency Behavior

The system uses **PictoBlox/Scratch-style transparency**:

- `0% transparency` = fully visible (opacity: 1)
- `100% transparency` = invisible (opacity: 0)
- Updates in real-time as block parameter changes

Formula: `opacity = (100 - transparency) / 100`

## Performance Tips

### 1. Use requestAnimationFrame
The pipeline already uses RAF for smooth 60 FPS rendering. Don't use `setInterval` for game logic.

### 2. Cache measurements
```typescript
// ✅ Good - calculate once
const { stageWidth, stageHeight } = renderCtx;
sprites.forEach(sprite => {
  // Use cached values
  if (sprite.x > stageWidth) { ... }
});

// ❌ Avoid - repeated calculations
sprites.forEach(sprite => {
  if (sprite.x > pipeline.getStageRenderer().getCanvas().width) { ... }
});
```

### 3. Batch canvas operations
```typescript
// ✅ Good - batch draws
ctx.fillStyle = '#FF0000';
sprites.forEach(sprite => {
  ctx.fillRect(sprite.x, sprite.y, sprite.w, sprite.h);
});

// ❌ Avoid - repeated style changes
sprites.forEach(sprite => {
  ctx.fillStyle = sprite.color;
  ctx.fillRect(sprite.x, sprite.y, sprite.w, sprite.h);
});
```

### 4. Monitor FPS
```typescript
const stats = pipeline.getStats();
if (stats.stage.droppedFrames > 0) {
  console.warn('Dropped frames detected');
  // Reduce game complexity
}
```

## AI/Computer Vision Integration

### MediaPipe Example

```typescript
import * as mediapipe from '@mediapipe/tasks-vision';
import { OverlayUtils, OverlayManager } from './systems/camera';

const pipeline = window.gamePipeline;
const webcam = pipeline.getWebcamManager();

// Register pose detector
let poseLandmarker;

async function initPoseDetection() {
  poseLandmarker = await mediapipe.PoseLandmarker.createFromOptions(
    { baseOptions: { modelAssetPath: 'pose_landmarker.task' } },
    { runningMode: 'IMAGE', numPoses: 2 }
  );
}

// In your overlay layer
pipeline.onLayerFrame('overlay', (ctx, deltaTime) => {
  const frame = webcam.captureFrame();
  if (!frame) return;

  const results = poseLandmarker.detectForVideo(frame.canvas, performance.now());

  results.landmarks.forEach(landmarks => {
    const points = landmarks.map(lm => ({
      x: lm.x * ctx.canvas.width,
      y: lm.y * ctx.canvas.height,
      confidence: lm.visibility,
    }));

    // Draw skeleton
    OverlayUtils.drawSkeleton(ctx, points, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 2,
    });
  });
});
```

## Troubleshooting

### Camera Not Showing

```typescript
// Check initialization
const state = pipeline.getWebcamManager().getState();
console.log('Initialized:', state.isInitialized);
console.log('Running:', state.isRunning);
console.log('Permission:', state.hasPermission);
console.log('Error:', state.error);

// Verify stage is rendered
const canvas = pipeline.getStageRenderer().getCanvas();
console.log('Canvas:', canvas?.width, 'x', canvas?.height);
```

### Transparency Not Updating

```typescript
// Make sure block is being executed
console.log('Block type:', block.type);
console.log('Params:', block.params);

// Verify transparency value
const config = pipeline.getWebcamManager().getConfig();
console.log('Transparency:', config.transparency);

// Check opacity in compositor
const layer = pipeline.getLayerCompositor().getLayer('webcam');
console.log('Layer opacity:', layer?.opacity);
```

### Low FPS

```typescript
// Monitor performance
const stats = pipeline.getStats();
console.log({
  fps: stats.stage.fps,
  frameTime: stats.stage.frameTime,
  renderTime: stats.stage.renderTime,
  droppedFrames: stats.stage.droppedFrames,
});

// Reduce complexity if needed
if (stats.stage.frameTime > 16) {
  // Frame taking >16ms (should be ~16ms for 60 FPS)
  console.warn('Reduce sprite count or AI operations');
}
```

## Files Structure

```
src/systems/camera/
├── index.ts                 # Main exports
├── Types.ts                 # TypeScript interfaces
├── WebcamManager.ts         # Webcam lifecycle
├── StageRenderer.ts         # Canvas rendering
├── LayerCompositor.ts       # Layer management
├── RenderPipeline.ts        # Main orchestrator
├── CameraBlocks.ts          # Block system integration
└── OverlayUtils.ts          # Drawing utilities

src/components/
└── StageWithCamera.tsx      # React integration
```

## Next Steps

1. **Replace your current stage component** with `StageWithCamera`
2. **Update block execution** to handle camera blocks via `executeCAMERABlock`
3. **Add AI overlays** using `OverlayUtils` in the overlay layer
4. **Test transparency updates** with the transparency block
5. **Monitor performance** using the stats system

## Support

For issues or questions:
- Check the troubleshooting section above
- Review console logs for error messages
- Inspect `pipeline.getStats()` for performance data
- Verify camera permissions in browser settings
