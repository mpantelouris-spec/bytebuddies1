# Camera Initialization in PictoBlox vs Game Builder

## Overview
This document details camera setup, initialization patterns, and blocks requiring camera input across the codebase.

---

## 1. CAMERA INITIALIZATION PATTERNS

### Location: `src/utils/extensionEngine.js`

The extension engine manages 3 separate camera systems:
- **Face Detection** (`S.face`) - Face detection + pose detection
- **Object Detection** (`S.objdet`) - COCO-SSD object detection
- **Body Motion** (`S.body`) - Pose detection with transparency overlay

#### Global State Structure (Lines 1-150)
```javascript
const S = {
  face: {
    on: false,
    cameraOk: false,           // ✅ Camera is actively streaming
    demoNoCamera: false,       // Uses fake data if camera unavailable
    video: null,               // HTMLVideoElement
    loopId: null,              // setInterval for detection loop
    initPromise: null,         // Async camera init promise
    liveToken: 0,              // Used to cancel init if stopped
    lastFaces: [],             // Array of detected faces
    lastPose: null,            // Last detected pose (standing, jumping, etc)
    mpLandmarker: null,        // MediaPipe face landmarks model
    mpPose: null,              // MediaPipe pose detection model
    transparency: 0,           // 0-100% opacity
    // ... more fields
  },
  objdet: { /* similar structure */ },
  body: { /* similar structure */ },
  video: { motion: 0, mirror: false, loopId: null }  // Motion detection only
};
```

---

## 2. FACE DETECTION CAMERA SETUP

### Function: `ensureFaceLoop()` (Lines 960-1080)

**File:** [src/utils/extensionEngine.js](src/utils/extensionEngine.js#L960)

#### Initialization Flow

```javascript
function ensureFaceLoop(output) {
  // Check if already initialized
  if (S.face.loopId) return;
  if (S.face.initPromise) return;
  
  // ❌ Fallback if no camera API available
  if (!navigator.mediaDevices?.getUserMedia) {
    S.face.demoNoCamera = true;
    S.face.cameraOk = false;
    S.face.on = true;
    S.face.lastFaces = [{ x: 80, y: 60, w: 90, h: 110, score: 1 }];
    S.face.expressions = ['happy'];
    return;
  }

  // ✅ Request camera stream
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 }
    },
    audio: false
  });

  // Create DOM overlay
  const root = document.createElement('div');
  root.id = 'bb-face-overlay-root';
  root.style.cssText = 'position:fixed;left:16px;top:auto;z-index:12000;...';
  
  const video = document.createElement('video');
  video.playsInline = true;
  video.muted = true;
  video.autoplay = true;
  video.srcObject = stream;
  
  S.face.video = video;
  S.face.on = true;
  S.face.cameraOk = false;  // Not ready yet

  // Wait for video to load
  const onVideoReady = () => {
    S.face.cameraOk = true;  // ✅ NOW camera is ready
    layoutFaceOverlay();
    drawFaceOverlay();
  };
  
  video.addEventListener('loadeddata', onVideoReady, { once: true });
  video.addEventListener('play', onVideoReady, { once: true });

  // Start detection loop (every 280ms)
  S.face.loopId = window.setInterval(() => {
    runFaceDetectionOnce().catch(() => {});
  }, 280);

  // Load MediaPipe models for face landmarks & pose
  await ensureMpFaceLandmarker().catch(() => {});
  await ensureMediaPipePose().catch(() => {});
}
```

#### Key Features
- **Lazy Loading**: Models load in background
- **Error Handling**: Falls back to demo mode if camera blocked
- **Continuous Detection**: Runs detection loop every 280ms
- **Multi-Model**: Face detection + facial landmark + pose detection on same stream

---

## 3. OBJECT DETECTION CAMERA SETUP

### Function: `ensureObjdetLoop()` (Lines 1280-1400)

**File:** [src/utils/extensionEngine.js](src/utils/extensionEngine.js#L1280)

```javascript
function ensureObjdetLoop(output) {
  // ❌ Fallback if no camera
  if (!navigator.mediaDevices?.getUserMedia) {
    S.objdet.demoNoCamera = true;
    S.objdet.cameraOk = false;
    S.objdet.lastObjects = [
      { label: 'person', score: 0.9, x: 80, y: 70, w: 140, h: 180 },
      { label: 'cup', score: 0.75, x: 260, y: 120, w: 70, h: 90 }
    ];
    return;
  }

  // ✅ Similar to face detection
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 }
    },
    audio: false
  });

  // Positioned at top-right (vs face at bottom-left)
  root.style.cssText = 'position:fixed;left:auto;right:16px;top:16px;...';

  // Detection loop (every 400ms)
  S.objdet.loopId = window.setInterval(() => {
    runObjDetOnce().catch(() => {});
  }, 400);

  // Load COCO-SSD model
  await ensureCocoSsd().catch(() => {});
}
```

#### Key Differences from Face Detection
- **Position**: `right: 16px` (top-right) vs `left: 16px` (bottom-left)
- **Loop Interval**: 400ms (vs 280ms for face)
- **Model**: COCO-SSD (vs MediaPipe Face Landmarker + Pose)
- **Border Color**: `#9f1239` (pink) vs `#c2410c` (orange)

---

## 4. BODY MOTION DETECTION CAMERA SETUP

### Function: Case handler `'body|camera'` (Lines 1701-1750)

**File:** [src/utils/extensionEngine.js](src/utils/extensionEngine.js#L1701)

```javascript
case 'body|camera': {
  const state = c || 'on';
  const transparency = Math.max(0, Math.min(100, parseInt(d, 10) || 0));

  if (state === 'on') {
    if (!S.body.on && !S.body.initPromise) {
      S.body.on = true;
      S.body.liveToken++;
      
      S.body.initPromise = (async () => {
        try {
          // ✅ Request camera
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          });
          
          setupBodyVideoElement(stream);
          logOut(output, `[Body] Video on, transparency ${S.body.transparency}%`);
          S.body.cameraOk = true;
        } catch (e) {
          S.body.demoNoCamera = true;
          S.body.on = false;
        } finally {
          S.body.initPromise = null;
        }
      })();
    }
  } else {
    removeBodyOverlay();
    S.body.on = false;
  }
}
```

#### Key Features
- **Transparency Support**: Takes transparency parameter (0-100%)
- **Deferred Initialization**: Creates async promise
- **Single Stream**: Uses shared face detection camera for pose

---

## 5. VIDEO MOTION DETECTION (Motion Sensing)

### Function: `ensureVideoMotion()` (Lines 1584-1625)

**File:** [src/utils/extensionEngine.js](src/utils/extensionEngine.js#L1584)

```javascript
function ensureVideoMotion(output) {
  if (!navigator.mediaDevices?.getUserMedia) {
    S.video.motion = 15;  // Demo value
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then((stream) => {
      const v = document.createElement('video');
      v.srcObject = stream;
      v.play().catch(() => {});

      const c = document.createElement('canvas');
      const ctx = c.getContext('2d', { willReadFrequently: true });

      // Detection loop (every 400ms)
      S.video.loopId = window.setInterval(() => {
        c.width = 64;
        c.height = 48;
        ctx.drawImage(v, 0, 0, 64, 48);
        
        const d = ctx.getImageData(0, 0, 64, 48).data;
        let diff = 0;
        
        // Compare pixel differences frame-to-frame
        if (prev) {
          for (let i = 0; i < d.length; i += 4) {
            diff += Math.abs(d[i] - prev[i]) + 
                    Math.abs(d[i + 1] - prev[i + 1]) + 
                    Math.abs(d[i + 2] - prev[i + 2]);
          }
        }
        prev = new Uint8ClampedArray(d);
        
        // Map diff to 0-100 motion value
        S.video.motion = Math.min(100, Math.round(diff / 5000));
      }, 400);
    });
}
```

#### Key Features
- **No Visual Overlay**: Runs invisibly in background
- **Low Resolution**: 64×48 canvas for fast processing
- **Frame Comparison**: Pixel-by-pixel difference detection
- **Single Loop**: Only one motion detection instance

---

## 6. CAMERA BLOCKS IN GAME BUILDER

### Location: `src/components/GameBuilder.jsx`

**Relevant Lines:** [GameBuilder.jsx](GameBuilder.jsx#L801-L910)

#### Body Video Block Handler
```javascript
if((block.type==='body-video-on'||block.type==='bb_body_video_on')&&block.params){
  var currentTransparency=Math.max(0,Math.min(100,parseInt(block.params.transparency,10)||0));
  var currentState=(String(block.params.state||'on')).toLowerCase();

  // Call extension engine
  if(typeof runExtensionGame==='function'){
    runExtensionGame('body|camera|'+state+'|'+transparency, SPRITES[0]);
  }
}
```

---

## 7. BLOCKS REQUIRING CAMERA INPUT

### Location: `src/data/extensionsCatalog.js` (Lines 100-550)

#### Face Detection Blocks
| Block | Type | Camera Req | Code Pattern |
|-------|------|-----------|--------------|
| Turn video on | Command | Yes | `face_turn_video_on` → `run_extension_block('face\|camera\|camera')` |
| Turn video off | Command | Yes | `face_turn_video_off` → `run_extension_block('face\|off')` |
| Show bounding box | Command | Yes | `face_show_bounding` → `run_extension_block('face\|show_bounding')` |
| Number of faces | Reporter | Yes | `face_count()` - reads `S.face.count` |
| Face expression | Reporter | Yes | `face_expression()` - reads `S.face.expressions[index]` |

#### Object Detection Blocks
| Block | Type | Camera Req | Code Pattern |
|-------|------|-----------|--------------|
| Turn video on | Command | Yes | `object_turn_video_on` → `run_extension_block('object\|camera\|transparency')` |
| Turn video off | Command | Yes | `object_turn_video_off` → `run_extension_block('object\|off')` |
| Analyse camera | Command | Yes | `object_analyse_camera` → `run_extension_block('object\|analyse\|camera')` |
| Number of objects | Reporter | Yes | `object_count()` - reads `S.objdet.count` |
| Object class | Reporter | Yes | `object_class(index)` - reads `S.objdet.lastObjects[i].label` |

#### Pose Classification Blocks
| Block | Type | Camera Req | Code Pattern |
|-------|------|-----------|--------------|
| Start camera | Command | Yes | `pc_turn_camera_on` → `run_extension_block('pc\|camera_on')` |
| Stop camera | Command | Yes | `pc_turn_camera_off` → `run_extension_block('pc\|off')` |
| Sample pose | Command | Yes | `pc_sample` → `run_extension_block('pc\|sample')` |
| Pose name | Reporter | Yes | `pc_name` - reads `S.pc.poseName` |
| Pose confidence | Reporter | Yes | `pc_confidence` - reads `S.pc.score` |

#### Motion Detection Blocks
| Block | Type | Camera Req | Code Pattern |
|-------|------|-----------|--------------|
| Video motion | Reporter | Yes | `video_motion()` - reads `S.video.motion` |
| Motion direction | Reporter | Yes | `motion_direction()` - reads `S.video.direction` |

#### Body Pose Blocks
| Block | Type | Camera Req | Code Pattern |
|-------|------|-----------|--------------|
| Turn video on | Command | Yes | `bb_body_video_on` → `run_extension_block('body\|camera\|on\|transparency')` |
| Analyse body | Command | Yes | `body_analyse` → `dispatchAiMlExtension('body\|analyse')` |

---

## 8. CODE GENERATION IN WORKSPACEEDITOR.jsx

### Location: `src/components/WorkspaceEditor.jsx` (Lines 880-950)

#### Face Video Block Code Generation
```javascript
case 'face_turn_video_on': 
  return `run_extension_block('face|camera|${f.MODE || 'camera'}')`;

case 'face_turn_video_off': 
  return `run_extension_block('face|off')`;

case 'face_number_of': 
  return `face_count()`;
```

#### Object Detection Code Generation
```javascript
case 'object_turn_video_on': 
  return `run_extension_block('object|camera|${f.TRANSPARENCY || 0}')`;

case 'object_analyse_camera': 
  return `run_extension_block('object|analyse|camera')`;
```

#### Pose Classifier Code Generation
```javascript
case 'pc_turn_camera_on': 
  return `run_extension_block('pc|camera_on|${f.TRANSPARENCY || 0}')`;

case 'pc_sample': 
  return `run_extension_block('pc|sample')`;
```

---

## 9. POSE DETECTION DISPATCH

### Location: `src/utils/aiExtensionDispatch.js` (Lines 190-240)

#### Pose Classifier Cases
```javascript
case 'pc|on': {
  // Start camera for pose detection
  logOut(output, `[PC] Starting camera for pose detection...`);
  return true;
}

case 'pc|off': {
  // Turn off camera
  if (S.face?.loopId) {
    clearInterval(S.face.loopId);
    S.face.loopId = null;
  }
  if (S.face?.video?.srcObject) {
    S.face.video.srcObject.getTracks().forEach(track => track.stop());
    S.face.video.srcObject = null;
  }
  S.face.on = false;
  S.face.cameraOk = false;
  S.face.visible = false;
  S.face.lastPose = null;
  return true;
}

case 'pc|sample': {
  // Uses S.face.lastPose detected from MediaPipe
  if (S.face?.lastPose && S.face.lastPose !== 'standing') {
    S.pc.poseName = S.face.lastPose;
    S.pc.score = 0.85 + Math.random() * 0.15;
  } else if (S.face?.cameraOk) {
    // Camera on but no pose detected yet
    const poseOptions = ['standing', 'sitting', 'arms_up', 't_pose', 'waving', 'dancing', 'hands_on_hips', 'bent_forward', 'jumping'];
    S.pc.poseName = poseOptions[Math.floor(Math.random() * poseOptions.length)];
    S.pc.score = 0.68 + Math.random() * 0.22;
  } else {
    S.pc.poseName = 'unknown';
    S.pc.score = 0;
  }
  return true;
}
```

---

## 10. KEY DIFFERENCES: PictoBlox vs Game Builder

### **PictoBlox Approach (extensionEngine.js)**

1. **Centralized Camera Management**
   - Three independent camera instances (face, object, body)
   - Each has separate `ensure*Loop()` function
   - Each manages own HTML overlay and detection loop
   - Shared MediaPipe models between face & pose

2. **State-Based Initialization**
   - `cameraOk` flag indicates stream is ready + video loaded
   - `demoNoCamera` provides fallback detection values
   - `initPromise` prevents race conditions
   - `liveToken` allows cancellation of async init

3. **Continuous Background Processing**
   - Face: 280ms detection loop
   - Object: 400ms detection loop
   - Motion: 400ms motion sampling
   - Pose: Runs on face detection frames (280ms)

4. **Fixed UI Positioning**
   - Face: Bottom-left (`left: 16px`)
   - Object: Top-right (`right: 16px`)
   - Body: Positioned on stage (transparent overlay)
   - Motion: No visual (invisible background process)

5. **Error Handling**
   - Checks `navigator.mediaDevices?.getUserMedia` availability
   - Falls back to demo data if camera blocked
   - Logs detailed messages to console
   - Try-catch with cleanup on error

### **Game Builder Approach (GameBuilder.jsx)**

1. **Block-Based Execution**
   - Blocks like `body-video-on` trigger camera setup
   - Monitors block parameters in real-time
   - Updates transparency when block params change
   - Executes extension blocks on sprite loop

2. **Transparency Parameter Support**
   - `[Body] Turn on video on stage with () % transparency`
   - Range: 0-100% (0 = invisible, 100 = fully visible)
   - Updates `TRANSPARENCY_STATE.body.currentOpacity`
   - Real-time synchronization with block changes

3. **Single Execution Model**
   - Game runs detection loop once (`_bodyBlockExecuted` flag)
   - Shared function `runExtensionGame()` for all extensions
   - Monitors sprite blocks for parameter changes
   - Updates transparency on every frame

4. **Stage Integration**
   - Camera overlay appears on game stage
   - Z-index managed for layering
   - Draggable overlays can be repositioned
   - Integrated with sprite collision detection

5. **Sprite Awareness**
   - Passes sprite reference to `runExtensionGame()`
   - Allows per-sprite camera configuration
   - Integrates with sprite variable tracking

---

## 11. CAMERA STATE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    Block Triggered                           │
│              (face_turn_video_on, etc.)                      │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│          ensureFaceLoop(output)                              │
│          ensureObjdetLoop(output)                            │
│          ensureBodyLoop(output)                              │
└───────────────┬─────────────────────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
    Has Camera?    No Camera?
        │               │
        │               ▼
        │          Set demoNoCamera=true
        │          Return demo values
        │
        ▼
   Request getUserMedia()
        │
        ├─────────┬─────────┐
        │         │         │
        ▼         ▼         ▼
    Denied   Timeout    Granted
        │         │         │
        ▼         ▼         ▼
    Demo   Demo   CreateDOM
    Mode   Mode   + Video Element
                  + Canvas
                  + Event Listeners
                        │
                        ▼
                 Wait for 'loadeddata'
                        │
                        ▼
                 Set cameraOk=true ✅
                        │
                        ▼
                 Start Detection Loop
                 (280-400ms interval)
                        │
                        ▼
                 Load ML Models (async)
                 (MediaPipe, COCO-SSD)
```

---

## 12. DETECTION FUNCTION FLOW

### Face Detection: `runFaceDetectionOnce()` (Called every 280ms)

```
1. Check if demo mode → draw demo overlays, return
2. Get video dimensions
3. Draw video to canvas
4. Load MediaPipe FaceLandmarker (if available)
5. Detect faces using:
   a. MediaPipe FaceLandmarker (preferred)
   b. Browser FaceDetector API (fallback)
   c. Demo mode (no API)
6. Filter boxes by aspect ratio & size
7. Infer expressions from face aspect ratio
8. Store results in S.face.lastFaces
9. Run pose detection on same frame
10. Update S.face.lastPose based on MediaPipe Pose
```

### Object Detection: `runObjDetOnce()` (Called every 400ms)

```
1. Check if demo mode → draw demo, return
2. Get video dimensions
3. Draw video to canvas
4. Load COCO-SSD model
5. Run detection using cocoDetectOnCanvas()
6. Filter by size & position
7. Store results in S.objdet.lastObjects
8. Draw bounding boxes if bboxShow=true
```

### Motion Detection: Motion sensing loop (every 400ms)

```
1. Create 64×48 canvas (low res for speed)
2. Draw video frame to canvas
3. Get pixel data (RGBA)
4. Compare with previous frame:
   - Sum absolute differences in R, G, B channels
   - Divide by 5000 to normalize
5. Store motion value (0-100)
6. Update S.video.motion
```

---

## 13. FILE PATHS & RELEVANT CODE

### Core Files

| File | Purpose | Key Functions |
|------|---------|----------------|
| [src/utils/extensionEngine.js](src/utils/extensionEngine.js) | Camera initialization & state | `ensureFaceLoop()`, `ensureObjdetLoop()`, `ensureVideoMotion()`, `runFaceDetectionOnce()`, `runObjDetOnce()` |
| [src/utils/aiExtensionDispatch.js](src/utils/aiExtensionDispatch.js) | AI/ML extension commands | `dispatchAiMlExtension()`, pose classifier (`pc\|*` cases) |
| [src/components/GameBuilder.jsx](src/components/GameBuilder.jsx) | Game runtime | Block execution, transparency monitoring |
| [src/components/WorkspaceEditor.jsx](src/components/WorkspaceEditor.jsx) | Code generation | Block → JavaScript conversion |
| [src/components/pictobloxTheme.js](src/components/pictobloxTheme.js) | UI theming | `PICTO_THEME` colors |
| [src/data/extensionsCatalog.js](src/data/extensionsCatalog.js) | Extension definitions | Block specs and descriptions |

### Test Files
- `test-pose-classifier.html` - Tests pose detection with `cameraOk` checking
- `test-motion-detection.html` - Tests motion sensing
- `test-face-detection.html` - Tests face detection

---

## 14. SUMMARY TABLE

### Camera System Comparison

| Feature | Face | Object | Body | Motion |
|---------|------|--------|------|--------|
| **Detection Type** | Face boxes + landmarks + pose | COCO-SSD objects | Pose classification | Pixel motion |
| **Loop Interval** | 280ms | 400ms | N/A (event-based) | 400ms |
| **Models** | MediaPipe Face + Pose | COCO-SSD | MediaPipe Pose | Canvas pixel diff |
| **Visual Overlay** | Yes (bottom-left) | Yes (top-right) | Yes (on stage) | No |
| **Z-Index** | 12000 | 11990 | Game layer | N/A |
| **Transparency** | ✅ Supported | ✅ Supported | ✅ Supported | N/A |
| **Demo Mode** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **State Flag** | `S.face.cameraOk` | `S.objdet.cameraOk` | `S.body.cameraOk` | N/A |
| **Shared Camera** | Face + Pose | Independent | Shared with Face | Independent |

---

## 15. ACTIVATION FLOW IN GAME BUILDER

1. **User places block on stage sprite**
   - E.g., `[Body] Turn on video on stage with [0] % transparency`

2. **Game starts (`running=true`)**
   - Calls `applyBlocks()` once with flag `_bodyBlockExecuted`

3. **Block handler detects camera block**
   ```javascript
   if(block.type==='body-video-on'||block.type==='bb_body_video_on'){
     runExtensionGame('body|camera|on|0', SPRITES[0]);
   }
   ```

4. **extensionEngine receives command**
   - Parses: `'body|camera|on|0'`
   - Calls: `navigator.mediaDevices.getUserMedia()`
   - Sets: `S.body.cameraOk = true` when ready

5. **Continuous monitoring**
   - `monitorBodyDetectionBlockParams()` checks for transparency changes
   - Updates `S.body.transparency` and `TRANSPARENCY_STATE` in real-time

6. **Game loop updates**
   - `updateTransparencyOpacity()` applies smooth transitions
   - Overlay opacity = `(100 - transparency) / 100`

---

## Key Takeaways for Implementation

✅ **PictoBlox Model**: Centralized, state-driven, background processing  
✅ **Game Builder**: Block-driven, event-based, sprite-integrated  
✅ **Shared**: Uses same mediaDevices API, same ML models, same overlay pattern  
✅ **Difference**: PictoBlox initializes proactively; Game Builder reacts to blocks  
✅ **Camera State**: Always check `cameraOk` flag before using real detection data  
✅ **Demo Mode**: All systems gracefully degrade with `demoNoCamera` flag
