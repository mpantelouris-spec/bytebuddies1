/**
 * Browser-side extension simulation: camera/ML stubs, IoT memory, Arduino pins,
 * robots, pen, logger, weather (Open-Meteo), speech, and reads for conditions.
 */

import { cocoDetectOnCanvas, ensureCocoSsd } from './objectDetRuntime.js';
import { dispatchAiMlExtension, readAiMlExtensionKey } from './aiExtensionDispatch.js';

const S = {
  face: {
    on: false,
    count: 0,
    visible: false,
    loopId: null,
    initPromise: null,
    liveToken: 0,
    demoNoCamera: false,
    video: null,
    det: null,
    t: 0,
    cameraOk: false,
    lastFaces: [],
    expressions: [],
    bboxShow: false,
    threshold: 0.45,
    overlay: null,
    wrap: null,
    canvas: null,
    ctx: null,
    flipped: false,
    transparency: 0,
    detCanvas: null,
    detCtx: null,
    mpLandmarker: null,
    mpInitPromise: null,
    mpInitFailed: false,
    mpVideoTs: 0,
  },
  objdet: {
    on: false,
    count: 0,
    loopId: null,
    initPromise: null,
    liveToken: 0,
    demoNoCamera: false,
    video: null,
    cameraOk: false,
    lastObjects: [],
    bboxShow: false,
    threshold: 0.5,
    flipped: false,
    transparency: 0,
    overlay: null,
    wrap: null,
    canvas: null,
    ctx: null,
    detCanvas: null,
    detCtx: null,
  },
  objects: { labels: 'cat, dog, tree' },
  body: { t: 0, visible: false, noseNormX: null, noseNormY: null },
  ml: { open: false, ready: false, topClass: 'none', confidence: 0 },
  txtml: { examples: {}, lastLabel: 'unknown', lastScore: 0 },
  imgml: { topClass: 'none', confidence: 0 },
  poseml: { label: 'none', score: 0 },
  audioml: { label: 'silence' },
  numml: { prediction: 0 },
  tr: { last: '' },
  ocr: { text: '' },
  rc: { label: 'unknown' },
  chat: { lastReply: '' },
  pose: { sample: 'T-pose' },
  arduino: { modes: {}, digital: {}, analog: {} },
  microbit: { text: '', btnA: false, btnB: false, ax: 0, ay: 1024, az: 512 },
  evive: { motor: 0, pot: 512, sw: false },
  robot: { line: [0.2, 0.8, 0.35], mL: 0, mR: 0 },
  arm: { angle: 90, grip: 0 },
  drive: { x: 0, y: 0, rot: 0 },
  humanoid: { step: 0 },
  rover: { mode: 'idle' },
  iot: { feed: {}, lastPub: '' },
  weather: { city: 'London', temp: null, cond: null, fetched: 0 },
  webhook: { lastPost: '', lastGet: '' },
  qr: { payload: '' },
  log: { rows: [] },
  video: { motion: 0, mirror: false, loopId: null },
  pen: { down: false, color: '#6366f1', points: 0 },
  tts: { last: '' },
  listen: { last: '' },
  nlp: { sentiment: 0.5 },
  videoPlayer: { playing: false, pos: 0 },
};

function logOut(output, msg) {
  if (output && typeof output.push === 'function') output.push(msg);
}

/** Map palette label (lowercase) → extension block spec */
const DRAG = {
  '[face] if face detected': { kind: 'read', key: 'face.visible' },
  '[face] face count': { kind: 'read', key: 'face.count' },
  '[objects] label list': { kind: 'read', key: 'objects.labels' },
  '[body] keypoint x': { kind: 'read', key: 'body.kpx' },
  '[body] keypoint y': { kind: 'read', key: 'body.kpy' },
  '[body] analyse from face': { kind: 'run', cmd: 'body|analyse' },
  '[body] body visible?': { kind: 'read', key: 'body.visible' },
  '[body] nose x': { kind: 'read', key: 'body.nose.x' },
  '[body] nose y': { kind: 'read', key: 'body.nose.y' },
  '[ml] training window open': { kind: 'run', cmd: 'ml|training_open' },
  '[pose] sample pose': { kind: 'run', cmd: 'pose|sample' },
  '[arduino] set pin mode': { kind: 'run', cmd: 'arduino|pin_mode|13|OUT' },
  '[arduino] digital write': { kind: 'run', cmd: 'arduino|digital_write|13|0' },
  '[arduino] analog read': { kind: 'read', key: 'arduino.analog.A0' },
  '[arduino] delay ms': { kind: 'run', cmd: 'arduino|delay|50' },
  '[micro:bit] show string': { kind: 'run', cmd: 'mb|show|Hi' },
  '[micro:bit] button a': { kind: 'read', key: 'mb.buttonA' },
  '[micro:bit] accelerometer': { kind: 'read', key: 'mb.accel' },
  '[evive] motor speed': { kind: 'run', cmd: 'evive|motor|80' },
  '[evive] read pot': { kind: 'read', key: 'evive.pot' },
  '[evive] tactile switch': { kind: 'read', key: 'evive.sw' },
  '[robot] read line sensors': { kind: 'read', key: 'robot.line' },
  '[robot] set motor l': { kind: 'run', cmd: 'robot|motorL|60' },
  '[robot] set motor r': { kind: 'run', cmd: 'robot|motorR|60' },
  '[arm] servo angle': { kind: 'run', cmd: 'arm|servo|90' },
  '[arm] gripper open': { kind: 'run', cmd: 'arm|grip|0' },
  '[arm] gripper close': { kind: 'run', cmd: 'arm|grip|1' },
  '[drive] strafe': { kind: 'run', cmd: 'drive|strafe|10' },
  '[drive] forward': { kind: 'run', cmd: 'drive|forward|10' },
  '[drive] rotate': { kind: 'run', cmd: 'drive|rotate|5' },
  '[humanoid] step forward': { kind: 'run', cmd: 'hum|step' },
  '[humanoid] wave': { kind: 'run', cmd: 'hum|wave' },
  '[humanoid] bow': { kind: 'run', cmd: 'hum|bow' },
  '[rover] drive': { kind: 'run', cmd: 'rov|drive' },
  '[rover] turn in place': { kind: 'run', cmd: 'rov|turn' },
  '[rover] rock obstacle': { kind: 'run', cmd: 'rov|rock' },
  '[iot] publish value': { kind: 'run', cmd: 'iot|publish|temp|22' },
  '[iot] read feed': { kind: 'read', key: 'iot.feed' },
  '[iot] timestamp': { kind: 'read', key: 'iot.time' },
  '[weather] city': { kind: 'run', cmd: 'wx|city|London' },
  '[weather] temperature': { kind: 'read', key: 'weather.temp' },
  '[weather] condition': { kind: 'read', key: 'weather.cond' },
  '[webhook] post json': { kind: 'run', cmd: 'hook|post|{}' },
  '[webhook] get text': { kind: 'run', cmd: 'hook|get|https://httpbin.org/get' },
  '[qr] scan camera': { kind: 'run', cmd: 'qr|scan' },
  '[qr] last payload': { kind: 'read', key: 'qr.payload' },
  '[log] add row': { kind: 'run', cmd: 'log|add|sample' },
  '[log] clear': { kind: 'run', cmd: 'log|clear' },
  '[log] row count': { kind: 'read', key: 'log.count' },
  '[video] motion amount': { kind: 'read', key: 'video.motion' },
  '[video] stage mirror': { kind: 'run', cmd: 'video|mirror|on' },
  '[pen] down': { kind: 'run', cmd: 'pen|down' },
  '[pen] up': { kind: 'run', cmd: 'pen|up' },
  '[pen] clear': { kind: 'run', cmd: 'pen|clear' },
  '[pen] set color': { kind: 'run', cmd: 'pen|color|#22c55e' },
  '[video] play clip': { kind: 'run', cmd: 'vplay|play|demo' },
  '[video] pause': { kind: 'run', cmd: 'vplay|pause' },
  '[video] seek sec': { kind: 'run', cmd: 'vplay|seek|0' },
};

export function resolveExtensionDragToBlock(text) {
  const t = (text || '').trim().toLowerCase();
  const row = DRAG[t];
  if (!row) return null;
  if (row.kind === 'run') return { type: 'extension-run', params: { cmd: row.cmd, label: text.trim() } };
  if (row.kind === 'read') return { type: 'extension-read', params: { key: row.key, label: text.trim() } };
  return null;
}

function removeFaceOverlay() {
  if (S.face.overlay?.parentNode) S.face.overlay.parentNode.removeChild(S.face.overlay);
  S.face.overlay = null;
  S.face.wrap = null;
  S.face.canvas = null;
  S.face.ctx = null;
}

function layoutFaceOverlay() {
  const v = S.face.video;
  const wrap = S.face.wrap;
  const canvas = S.face.canvas;
  if (!v || !wrap || !canvas) return;
  const w = v.videoWidth || 320;
  const h = v.videoHeight || 240;
  const maxW = 280;
  const scale = Math.min(1, maxW / w);
  const dispW = Math.round(w * scale);
  const dispH = Math.round(h * scale);
  wrap.style.width = `${dispW}px`;
  wrap.style.height = `${dispH}px`;
  canvas.width = dispW;
  canvas.height = dispH;
}

function drawFaceOverlay() {
  const { canvas, ctx, video, lastFaces, bboxShow } = S.face;
  if (!canvas || !ctx || !video) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!bboxShow || !lastFaces?.length) return;
  const vw = video.videoWidth || 1;
  const vh = video.videoHeight || 1;
  const sx = canvas.width / vw;
  const sy = canvas.height / vh;
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  lastFaces.forEach((f) => {
    ctx.strokeRect(f.x * sx, f.y * sy, f.w * sx, f.h * sy);
  });
}

function bboxFromLandmarks(lm, vw, vh) {
  if (!lm?.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of lm) {
    const xx = (p.x ?? 0) * vw;
    const yy = (p.y ?? 0) * vh;
    minX = Math.min(minX, xx);
    maxX = Math.max(maxX, xx);
    minY = Math.min(minY, yy);
    maxY = Math.max(maxY, yy);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  if (!Number.isFinite(minX) || w < 8 || h < 8) return null;
  return { x: minX, y: minY, w, h, score: 0.9 };
}

function blendshapeMap(classifications) {
  const m = Object.create(null);
  if (!classifications?.categories?.length) return m;
  for (const c of classifications.categories) {
    if (c.categoryName && typeof c.score === 'number') m[c.categoryName] = c.score;
  }
  return m;
}

/** Map MediaPipe ARKit-style blendshape weights to a simple expression label. */
function expressionFromBlendshapeMap(bl) {
  const g = (k) => (typeof bl[k] === 'number' ? bl[k] : 0);
  const smile = (g('mouthSmileLeft') + g('mouthSmileRight')) / 2;
  const dimple = (g('mouthDimpleLeft') + g('mouthDimpleRight')) / 2;
  const cheekSquint = (g('cheekSquintLeft') + g('cheekSquintRight')) / 2;
  const frown = (g('mouthFrownLeft') + g('mouthFrownRight')) / 2;
  const browDown = (g('browDownLeft') + g('browDownRight')) / 2;
  const innerUp = g('browInnerUp');
  const jawOpen = g('jawOpen');
  const eyeWide = (g('eyeWideLeft') + g('eyeWideRight')) / 2;
  const mouthPress = (g('mouthPressLeft') + g('mouthPressRight')) / 2;
  const sneer = (g('noseSneerLeft') + g('noseSneerRight')) / 2;
  const lowerDown = (g('mouthLowerDownLeft') + g('mouthLowerDownRight')) / 2;

  const happyScore =
    smile * 0.55 +
    dimple * 0.35 +
    cheekSquint * 0.4 +
    Math.max(0, smile - frown) * 0.45 +
    lowerDown * 0.15;
  const sadScore = frown * 0.55 + innerUp * 0.35 + Math.max(0, frown - smile) * 0.45;
  const angryScore = browDown * 0.55 + mouthPress * 0.35 + sneer * 0.35 + browDown * (1 - smile) * 0.25;
  const surprisedScore = jawOpen * 0.5 + eyeWide * 0.4 + innerUp * 0.2;

  const ranked = [
    ['happy', happyScore],
    ['sad', sadScore],
    ['angry', angryScore],
    ['surprised', surprisedScore],
  ];
  ranked.sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  const second = ranked[1][1];
  if (top[1] < 0.055 && ranked.every(([, s]) => s < 0.1)) return 'neutral';
  if (top[1] - second < 0.026 && top[1] < 0.17) return 'neutral';
  return top[0];
}

async function ensureMpFaceLandmarker() {
  if (S.face.mpLandmarker) return S.face.mpLandmarker;
  if (S.face.mpInitFailed) return null;
  S.face.mpInitPromise ||= (async () => {
    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const wasm = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm';
      const fileset = await FilesetResolver.forVisionTasks(wasm);
      const model =
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
      const lm = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: model, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numFaces: 4,
        outputFaceBlendshapes: true,
        minFaceDetectionConfidence: 0.4,
        minFacePresenceConfidence: 0.4,
        minTrackingConfidence: 0.4,
      });
      S.face.mpLandmarker = lm;
    } catch (e) {
      console.warn('[Face] MediaPipe Face Landmarker unavailable', e);
      S.face.mpInitFailed = true;
      S.face.mpLandmarker = null;
    } finally {
      S.face.mpInitPromise = null;
    }
  })();
  await S.face.mpInitPromise;
  return S.face.mpLandmarker;
}

/** Drop wall/edge false positives; keep boxes that look like heads in frame. */
function filterLikelyFaceBoxes(boxes, vw, vh) {
  const vw0 = Math.max(1, vw);
  const vh0 = Math.max(1, vh);
  const frame = vw0 * vh0;
  const scored = [];
  for (const f of boxes) {
    const { x, y, w, h, score } = f;
    if (w <= 2 || h <= 2) continue;
    const ar = w / h;
    if (ar < 0.42 || ar > 1.75) continue;
    const area = w * h;
    const relA = area / frame;
    if (relA < 0.0018 || relA > 0.5) continue;
    const cx = (x + w / 2) / vw0;
    const cy = (y + h / 2) / vh0;
    let boost = 1;
    if (cx > 0.04 && cx < 0.96 && cy > 0.06 && cy < 0.96) boost *= 1.12;
    if (cy > 0.12) boost *= 1.08;
    const sc = typeof score === 'number' ? score : 1;
    scored.push({ ...f, x, y, w, h, score: sc, _q: sc * Math.sqrt(area) * boost });
  }
  scored.sort((a, b) => b._q - a._q);
  return scored.map(({ _q, ...rest }) => rest);
}

function inferExpressions(faces, vw, vh) {
  if (!faces.length) {
    S.face.expressions = [];
    return;
  }
  if (faces.every((f) => typeof f.expr === 'string' && f.expr)) {
    S.face.expressions = faces.map((f) => f.expr);
    return;
  }
  const out = [];
  for (const f of faces) {
    const ar = f.w / Math.max(1, f.h);
    const cy = (f.y + f.h / 2) / Math.max(1, vh);
    let ex = 'neutral';
    if (ar > 1.12) ex = 'happy';
    else if (ar < 0.82) ex = 'sad';
    else if (cy < 0.28) ex = 'surprised';
    out.push(ex);
  }
  S.face.expressions = out;
}

async function runFaceDetectionOnce() {
  if (S.face.demoNoCamera) {
    drawFaceOverlay();
    return;
  }
  const v = S.face.video;
  if (!v || v.readyState < 2) {
    S.face.lastFaces = [];
    S.face.count = 0;
    S.face.visible = false;
    S.face.expressions = [];
    drawFaceOverlay();
    return;
  }
  const vw = Math.max(1, v.videoWidth || 640);
  const vh = Math.max(1, v.videoHeight || 480);

  if (!S.face.detCanvas || S.face.detCanvas.width !== vw || S.face.detCanvas.height !== vh) {
    S.face.detCanvas = document.createElement('canvas');
    S.face.detCanvas.width = vw;
    S.face.detCanvas.height = vh;
    S.face.detCtx = S.face.detCanvas.getContext('2d', { willReadFrequently: true });
  }
  S.face.detCtx.drawImage(v, 0, 0, vw, vh);

  let filtered = [];
  let fromBlendshapes = false;

  const mpLm = await ensureMpFaceLandmarker();
  if (mpLm && S.face.detCanvas) {
    try {
      S.face.mpVideoTs = (S.face.mpVideoTs || 0) + 33;
      const r = mpLm.detectForVideo(S.face.detCanvas, S.face.mpVideoTs);
      const lms = r.faceLandmarks;
      const blends = r.faceBlendshapes;
      if (lms?.length) {
        const raw = [];
        for (let i = 0; i < lms.length; i++) {
          const box = bboxFromLandmarks(lms[i], vw, vh);
          if (!box) continue;
          const cmap = blends?.[i] ? blendshapeMap(blends[i]) : {};
          const expr = Object.keys(cmap).length ? expressionFromBlendshapeMap(cmap) : 'neutral';
          raw.push({ ...box, score: box.score ?? 0.88, expr });
        }
        if (raw.length) {
          filtered = filterLikelyFaceBoxes(raw, vw, vh);
          fromBlendshapes = filtered.length > 0 && filtered.every((f) => typeof f.expr === 'string');
        }
      }
    } catch {
      /* fall through to FaceDetector */
    }
  }

  if (!filtered.length) {
    let faces = [];
    try {
      if (S.face.det) {
        const raw = await S.face.det.detect(S.face.detCanvas).catch(() => []);
        faces = Array.isArray(raw) ? raw : [];
      } else {
        S.face.t = (S.face.t || 0) + 1;
        if (S.face.cameraOk && S.face.t % 12 < 8) {
          faces = [{ boundingBox: { x: vw * 0.28, y: vh * 0.22, width: vw * 0.18, height: vh * 0.28 } }];
        }
      }
    } catch {
      faces = [];
    }
    const minArea = Math.max(400, S.face.threshold * vw * vh * 0.0015);
    const norm = [];
    for (const f of faces) {
      const b = f.boundingBox || {};
      const x = b.x ?? b.left ?? 0;
      const y = b.y ?? b.top ?? 0;
      const w = b.width ?? 0;
      const h = b.height ?? 0;
      const sc = typeof f.score === 'number' ? f.score : 1;
      if (w * h < minArea || sc < S.face.threshold * 0.5) continue;
      norm.push({ x, y, w, h, score: sc });
    }
    filtered = filterLikelyFaceBoxes(norm, vw, vh);
    fromBlendshapes = false;
  }

  S.face.lastFaces = filtered.map(({ x, y, w, h, score }) => ({ x, y, w, h, score }));
  S.face.count = filtered.length;
  S.face.visible = filtered.length > 0;
  if (fromBlendshapes) {
    S.face.expressions = filtered.map((f) => f.expr || 'neutral');
  } else {
    inferExpressions(S.face.lastFaces, vw, vh);
  }
  drawFaceOverlay();
}

function ensureFaceLoop(output) {
  if (typeof window === 'undefined') return;
  if (S.face.loopId) return;
  if (S.face.initPromise) return;
  if (!navigator.mediaDevices?.getUserMedia) {
    logOut(output, '[Face] Camera API not available — using demo values.');
    S.face.demoNoCamera = true;
    S.face.on = true;
    S.face.cameraOk = false;
    S.face.visible = true;
    S.face.count = 1;
    S.face.lastFaces = [{ x: 80, y: 60, w: 90, h: 110, score: 1 }];
    S.face.expressions = ['happy'];
    return;
  }
  S.face.demoNoCamera = false;
  const startToken = S.face.liveToken;
  const p = (async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (startToken !== S.face.liveToken) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      removeFaceOverlay();
      const root = document.createElement('div');
      root.id = 'bb-face-overlay-root';
      root.setAttribute('data-bb-face-overlay', '1');
      root.style.cssText =
        'position:fixed;bottom:16px;left:16px;z-index:12000;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.55);border:2px solid #c2410c;background:#0f172a;max-width:min(92vw,320px);';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:relative;display:block;line-height:0;background:#000;';
      const v = document.createElement('video');
      v.playsInline = true;
      v.muted = true;
      v.autoplay = true;
      v.srcObject = stream;
      v.style.cssText = 'display:block;width:100%;height:auto;max-height:220px;vertical-align:top;';
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;';
      wrap.appendChild(v);
      wrap.appendChild(canvas);
      root.appendChild(wrap);
      document.body.appendChild(root);
      S.face.overlay = root;
      S.face.wrap = wrap;
      S.face.canvas = canvas;
      S.face.ctx = canvas.getContext('2d');
      v.play().catch(() => {});
      S.face.video = v;
      S.face.on = true;
      S.face.cameraOk = true;
      const Det = window.FaceDetector;
      S.face.det = Det ? new Det({ fastMode: true, maxDetectedFaces: 8 }) : null;
      v.addEventListener('loadeddata', () => {
        layoutFaceOverlay();
        drawFaceOverlay();
      });
      if (startToken !== S.face.liveToken) {
        stream.getTracks().forEach((t) => t.stop());
        removeFaceOverlay();
        S.face.video = null;
        S.face.on = false;
        S.face.cameraOk = false;
        return;
      }
      S.face.loopId = window.setInterval(() => {
        runFaceDetectionOnce().catch(() => {});
      }, 280);
      void ensureMpFaceLandmarker().catch(() => {});
      await new Promise((resolve) => {
        if (v.readyState >= 2) resolve();
        else v.addEventListener('loadeddata', () => resolve(), { once: true });
      });
      if (startToken !== S.face.liveToken) return;
      layoutFaceOverlay();
      await runFaceDetectionOnce();
      logOut(output, '[Face] Camera on — preview bottom-left. Use “Show bounding box” to see detections.');
    } catch {
      if (startToken !== S.face.liveToken) return;
      logOut(output, '[Face] Permission denied — demo mode (no camera).');
      S.face.on = true;
      S.face.cameraOk = false;
      S.face.visible = false;
      S.face.count = 0;
      S.face.lastFaces = [];
      S.face.expressions = [];
    }
  })();
  S.face.initPromise = p;
  p.finally(() => {
    if (S.face.initPromise === p) S.face.initPromise = null;
  });
}

function stopFaceLoop() {
  S.face.liveToken = (S.face.liveToken || 0) + 1;
  if (S.face.loopId) {
    clearInterval(S.face.loopId);
    S.face.loopId = null;
  }
  if (S.face.video?.srcObject) {
    S.face.video.srcObject.getTracks().forEach((t) => t.stop());
  }
  S.face.video = null;
  S.face.on = false;
  S.face.cameraOk = false;
  S.face.demoNoCamera = false;
  S.face.lastFaces = [];
  S.face.expressions = [];
  S.face.count = 0;
  S.face.visible = false;
  S.face.detCanvas = null;
  S.face.detCtx = null;
  S.face.mpInitPromise = null;
  S.face.mpVideoTs = 0;
  if (S.face.mpLandmarker) {
    try {
      S.face.mpLandmarker.close();
    } catch {
      /* ignore */
    }
    S.face.mpLandmarker = null;
  }
  S.face.mpInitFailed = false;
  removeFaceOverlay();
}

/* ─── Object detection (COCO-SSD, PictoBlox-style blocks) ─── */

function removeObjdetOverlay() {
  if (S.objdet.overlay?.parentNode) S.objdet.overlay.parentNode.removeChild(S.objdet.overlay);
  S.objdet.overlay = null;
  S.objdet.wrap = null;
  S.objdet.canvas = null;
  S.objdet.ctx = null;
}

function layoutObjdetOverlay() {
  const v = S.objdet.video;
  const wrap = S.objdet.wrap;
  const canvas = S.objdet.canvas;
  if (!v || !wrap || !canvas) return;
  const w = v.videoWidth || 320;
  const h = v.videoHeight || 240;
  const maxW = 280;
  const scale = Math.min(1, maxW / w);
  const dispW = Math.round(w * scale);
  const dispH = Math.round(h * scale);
  wrap.style.width = `${dispW}px`;
  wrap.style.height = `${dispH}px`;
  canvas.width = dispW;
  canvas.height = dispH;
}

function drawObjdetOverlay() {
  const { canvas, ctx, video, lastObjects, bboxShow } = S.objdet;
  if (!canvas || !ctx || !video) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!bboxShow || !lastObjects?.length) return;
  const vw = video.videoWidth || 1;
  const vh = video.videoHeight || 1;
  const sx = canvas.width / vw;
  const sy = canvas.height / vh;
  ctx.strokeStyle = '#14b8a6';
  ctx.lineWidth = 2;
  ctx.font = 'bold 11px system-ui,sans-serif';
  ctx.fillStyle = 'rgba(15,23,42,0.88)';
  lastObjects.forEach((o) => {
    const x = o.x * sx;
    const y = o.y * sy;
    const w = o.w * sx;
    const h = o.h * sy;
    ctx.strokeRect(x, y, w, h);
    const lab = String(o.label || '?');
    const tw = ctx.measureText(lab).width + 6;
    ctx.fillRect(x, Math.max(0, y - 16), tw, 16);
    ctx.fillStyle = '#ccfbf1';
    ctx.fillText(lab, x + 3, Math.max(11, y - 4));
    ctx.fillStyle = 'rgba(15,23,42,0.88)';
  });
}

function filterObjectDetections(boxes, vw, vh) {
  const frame = Math.max(1, vw * vh);
  const out = [];
  for (const o of boxes) {
    const area = o.w * o.h;
    if (area < 800 || area / frame > 0.65) continue;
    out.push(o);
  }
  return out;
}

async function runObjDetOnce() {
  if (S.objdet.demoNoCamera) {
    drawObjdetOverlay();
    return;
  }
  const v = S.objdet.video;
  if (!v || v.readyState < 2) {
    S.objdet.lastObjects = [];
    S.objdet.count = 0;
    drawObjdetOverlay();
    return;
  }
  const vw = Math.max(1, v.videoWidth || 640);
  const vh = Math.max(1, v.videoHeight || 480);
  if (!S.objdet.detCanvas || S.objdet.detCanvas.width !== vw || S.objdet.detCanvas.height !== vh) {
    S.objdet.detCanvas = document.createElement('canvas');
    S.objdet.detCanvas.width = vw;
    S.objdet.detCanvas.height = vh;
    S.objdet.detCtx = S.objdet.detCanvas.getContext('2d', { willReadFrequently: true });
  }
  S.objdet.detCtx.drawImage(v, 0, 0, vw, vh);
  let list = await cocoDetectOnCanvas(S.objdet.detCanvas, S.objdet.threshold).catch(() => []);
  if (!list.length && !(await ensureCocoSsd())) {
    list = [];
  }
  S.objdet.lastObjects = filterObjectDetections(list, vw, vh);
  S.objdet.count = S.objdet.lastObjects.length;
  drawObjdetOverlay();
}

function ensureObjdetLoop(output) {
  if (typeof window === 'undefined') return;
  if (S.objdet.loopId) return;
  if (S.objdet.initPromise) return;
  if (!navigator.mediaDevices?.getUserMedia) {
    logOut(output, '[Object] Camera API not available — demo detections.');
    S.objdet.demoNoCamera = true;
    S.objdet.on = true;
    S.objdet.cameraOk = false;
    S.objdet.lastObjects = [
      { label: 'person', score: 0.9, x: 80, y: 70, w: 140, h: 180 },
      { label: 'cup', score: 0.75, x: 260, y: 120, w: 70, h: 90 },
    ];
    S.objdet.count = S.objdet.lastObjects.length;
    return;
  }
  S.objdet.demoNoCamera = false;
  const startToken = S.objdet.liveToken;
  const p = (async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (startToken !== S.objdet.liveToken) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      removeObjdetOverlay();
      const root = document.createElement('div');
      root.id = 'bb-objdet-overlay-root';
      root.setAttribute('data-bb-objdet-overlay', '1');
      root.style.cssText =
        'position:fixed;bottom:16px;right:16px;z-index:11990;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.55);border:2px solid #9f1239;background:#0f172a;max-width:min(92vw,320px);';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:relative;display:block;line-height:0;background:#000;';
      const v = document.createElement('video');
      v.playsInline = true;
      v.muted = true;
      v.autoplay = true;
      v.srcObject = stream;
      v.style.cssText = 'display:block;width:100%;height:auto;max-height:220px;vertical-align:top;';
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;';
      wrap.appendChild(v);
      wrap.appendChild(canvas);
      root.appendChild(wrap);
      document.body.appendChild(root);
      S.objdet.overlay = root;
      S.objdet.wrap = wrap;
      S.objdet.canvas = canvas;
      S.objdet.ctx = canvas.getContext('2d');
      v.play().catch(() => {});
      S.objdet.video = v;
      S.objdet.on = true;
      S.objdet.cameraOk = true;
      v.addEventListener('loadeddata', () => {
        layoutObjdetOverlay();
        drawObjdetOverlay();
      });
      if (startToken !== S.objdet.liveToken) {
        stream.getTracks().forEach((t) => t.stop());
        removeObjdetOverlay();
        S.objdet.video = null;
        S.objdet.on = false;
        S.objdet.cameraOk = false;
        return;
      }
      S.objdet.loopId = window.setInterval(() => {
        runObjDetOnce().catch(() => {});
      }, 400);
      void ensureCocoSsd().catch(() => {});
      await new Promise((resolve) => {
        if (v.readyState >= 2) resolve();
        else v.addEventListener('loadeddata', () => resolve(), { once: true });
      });
      if (startToken !== S.objdet.liveToken) return;
      layoutObjdetOverlay();
      await runObjDetOnce();
      logOut(output, '[Object] Camera on — preview bottom-right. Use “Show bounding box” after detections.');
    } catch {
      if (startToken !== S.objdet.liveToken) return;
      logOut(output, '[Object] Camera blocked — no live detections.');
      S.objdet.on = true;
      S.objdet.cameraOk = false;
      S.objdet.lastObjects = [];
      S.objdet.count = 0;
    }
  })();
  S.objdet.initPromise = p;
  p.finally(() => {
    if (S.objdet.initPromise === p) S.objdet.initPromise = null;
  });
}

function stopObjdetLoop() {
  S.objdet.liveToken = (S.objdet.liveToken || 0) + 1;
  if (S.objdet.loopId) {
    clearInterval(S.objdet.loopId);
    S.objdet.loopId = null;
  }
  if (S.objdet.video?.srcObject) {
    S.objdet.video.srcObject.getTracks().forEach((t) => t.stop());
  }
  S.objdet.video = null;
  S.objdet.on = false;
  S.objdet.cameraOk = false;
  S.objdet.demoNoCamera = false;
  S.objdet.lastObjects = [];
  S.objdet.count = 0;
  S.objdet.detCanvas = null;
  S.objdet.detCtx = null;
  S.objdet.initPromise = null;
  removeObjdetOverlay();
}

function parseObjdetReadKey(key) {
  const s = String(key || '').trim();
  let m = s.match(/^objdet\.class\|(\d+)$/i);
  if (m) return { kind: 'class', index: Math.max(1, parseInt(m[1], 10) || 1) };
  m = s.match(/^objdet\.is\|(.+)$/i);
  if (m) return { kind: 'is', cls: m[1].trim().toLowerCase().replace(/\s+/g, ' ') };
  m = s.match(/^objdet\.num\|(.+)$/i);
  if (m) return { kind: 'num', cls: m[1].trim().toLowerCase().replace(/\s+/g, ' ') };
  return null;
}

function objdetLabelMatches(label, wanted) {
  const a = String(label || '').toLowerCase().trim();
  const b = String(wanted || '').toLowerCase().trim();
  if (!a || !b) return false;
  if (a === b) return true;
  const a2 = a.replace(/-/g, ' ');
  const b2 = b.replace(/-/g, ' ');
  if (a2 === b2) return true;
  if (a2.includes(b2) || b2.includes(a2)) return true;
  return false;
}

const OBJDET_EXTENSION_READ_RE = /extension_read\s*\(\s*["']objdet\./;

/** Warm camera + COCO model before Python reads object-detection reporters. */
export async function prepareObjdetExtensionForPythonRun(code) {
  if (typeof code !== 'string') return;
  const needs =
    OBJDET_EXTENSION_READ_RE.test(code) || /extension_run\s*\(\s*["']objdet\|/.test(code);
  if (!needs) return;
  await ensureCocoSsd().catch(() => {});
  ensureObjdetLoop(null);
  const p = S.objdet.initPromise;
  if (p) await p.catch(() => {});
  if (S.objdet.video?.readyState >= 2 && !S.objdet.demoNoCamera) {
    await runObjDetOnce().catch(() => {});
  }
}

function parseFaceReadKey(key) {
  const m = String(key || '')
    .trim()
    .match(/^face\.(expr|x|y|size|isexpr)\|(\d+)(?:\|(.+))?$/i);
  if (!m) return null;
  return { kind: m[1].toLowerCase(), index: Math.max(1, parseInt(m[2], 10) || 1), expr: (m[3] || 'happy').toLowerCase() };
}

const FACE_EXTENSION_READ_RE = /extension_read\s*\(\s*["']face\./;

/** Await camera + first detection before sync `runPython` evaluates face reporters. */
export async function prepareFaceExtensionForPythonRun(code) {
  if (typeof code !== 'string' || !FACE_EXTENSION_READ_RE.test(code)) return;
  if (/extension_read\s*\(\s*["']face\.(?:expr|isexpr)/i.test(code)) {
    await ensureMpFaceLandmarker();
  }
  ensureFaceLoop(null);
  const p = S.face.initPromise;
  if (p) await p.catch(() => {});
  if (S.face.video?.readyState >= 2 && !S.face.demoNoCamera) {
    await runFaceDetectionOnce().catch(() => {});
  }
}

function ensureVideoMotion(output) {
  if (S.video.loopId || typeof window === 'undefined') return;
  if (!navigator.mediaDevices?.getUserMedia) {
    S.video.motion = 15;
    logOut(output, '[Video] No camera — motion demo ~15.');
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
    const v = document.createElement('video');
    v.playsInline = true;
    v.muted = true;
    v.srcObject = stream;
    v.play().catch(() => {});
    let prev = null;
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d', { willReadFrequently: true });
    S.video.loopId = window.setInterval(() => {
      try {
        if (v.readyState < 2) return;
        c.width = 64;
        c.height = 48;
        ctx.drawImage(v, 0, 0, 64, 48);
        const d = ctx.getImageData(0, 0, 64, 48).data;
        let diff = 0;
        if (prev) {
          for (let i = 0; i < d.length; i += 4) {
            diff += Math.abs(d[i] - prev[i]) + Math.abs(d[i + 1] - prev[i + 1]) + Math.abs(d[i + 2] - prev[i + 2]);
          }
        }
        prev = new Uint8ClampedArray(d);
        S.video.motion = Math.min(100, Math.round(diff / 5000));
      } catch {
        S.video.motion = Math.floor(Math.random() * 30);
      }
    }, 400);
    logOut(output, '[Video] Motion sensing active.');
  }).catch(() => {
    S.video.motion = 8;
    logOut(output, '[Video] Camera blocked — motion demo.');
  });
}

function fetchWeather(output) {
  const now = Date.now();
  if (S.weather.temp != null && now - S.weather.fetched < 120000) return;
  fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current=temperature_2m,weather_code')
    .then((r) => r.json())
    .then((j) => {
      const t = j?.current?.temperature_2m;
      S.weather.temp = typeof t === 'number' ? t : 18;
      S.weather.cond = String(j?.current?.weather_code ?? 'clear');
      S.weather.fetched = Date.now();
      logOut(output, `[Weather] Updated for ${S.weather.city}: ${S.weather.temp}°C`);
    })
    .catch(() => {
      S.weather.temp = S.weather.temp ?? 17;
      S.weather.cond = S.weather.cond ?? 'clear';
      logOut(output, '[Weather] Using cached/demo values.');
    });
}

/** Execute extension command (pipe segments). */
export function runExtensionCmd(cmdStr, output) {
  if (!cmdStr) return;
  const parts = String(cmdStr).split('|').map((s) => s.trim());
  const [a, b, c, d] = parts;
  const a0 = (a || '').toLowerCase();
  const b0 = (b || '').toLowerCase();
  if (a0 === 'imgml' && b0 === 'camera') {
    ensureObjdetLoop(output);
    logOut(output, '[IC] Object-detection camera on — run “Analyse image” then “Analyse frame” for classifier reads.');
    return;
  }
  if (
    ['body', 'txtml', 'imgml', 'poseml', 'audioml', 'numml', 'nlp', 'tr', 'ocr', 'rc', 'chat', 'ml'].includes(a0) &&
    dispatchAiMlExtension(S, parts, output)
  ) {
    return;
  }

  switch (`${a}|${b}`) {
    case 'face|camera_on':
      ensureFaceLoop(output);
      return;
    case 'face|camera_off':
      stopFaceLoop();
      logOut(output, '[Face] Camera off.');
      return;
    case 'face|refresh':
      ensureFaceLoop(output);
      logOut(output, `[Face] visible=${S.face.visible} count=${S.face.count}`);
      return;
    case 'face|video': {
      const mode = c || 'off';
      if (mode === 'off') {
        stopFaceLoop();
        logOut(output, '[Face] Video off.');
        return;
      }
      S.face.flipped = d === 'flipped';
      S.face.transparency = Math.max(0, Math.min(100, parseInt(parts[4], 10) || 0));
      ensureFaceLoop(output);
      const applyStyle = () => {
        if (!S.face.video) return;
        S.face.video.style.transform = S.face.flipped ? 'scaleX(-1)' : '';
        S.face.video.style.opacity = String(1 - S.face.transparency / 100);
      };
      applyStyle();
      setTimeout(applyStyle, 400);
      logOut(output, `[Face] Video ${mode}${S.face.flipped ? ' (mirrored)' : ''}, transparency ${S.face.transparency}%`);
      return;
    }
    case 'face|bbox': {
      S.face.bboxShow = c === 'show';
      drawFaceOverlay();
      logOut(output, `[Face] Bounding box ${S.face.bboxShow ? 'shown' : 'hidden'}`);
      return;
    }
    case 'face|threshold': {
      const th = Math.max(0.05, Math.min(0.95, parseFloat(c) || 0.45));
      S.face.threshold = th;
      logOut(output, `[Face] Detection threshold = ${th.toFixed(2)} (higher = stricter)`);
      return;
    }
    case 'face|analyse': {
      const src = c || 'camera';
      runFaceDetectionOnce().then(() => {
        logOut(output, `[Face] Analysed (${src}) → ${S.face.count} face(s).`);
      });
      return;
    }
    case 'objdet|video': {
      const mode = c || 'off';
      if (mode === 'off') {
        stopObjdetLoop();
        logOut(output, '[Object] Video off.');
        return;
      }
      S.objdet.flipped = d === 'flipped';
      S.objdet.transparency = Math.max(0, Math.min(100, parseInt(parts[4], 10) || 0));
      ensureObjdetLoop(output);
      const applyOd = () => {
        if (!S.objdet.video) return;
        S.objdet.video.style.transform = S.objdet.flipped ? 'scaleX(-1)' : '';
        S.objdet.video.style.opacity = String(1 - S.objdet.transparency / 100);
      };
      applyOd();
      setTimeout(applyOd, 400);
      logOut(output, `[Object] Video ${mode}${S.objdet.flipped ? ' (mirrored)' : ''}, transparency ${S.objdet.transparency}%`);
      return;
    }
    case 'objdet|bbox': {
      S.objdet.bboxShow = c === 'show';
      drawObjdetOverlay();
      logOut(output, `[Object] Bounding box ${S.objdet.bboxShow ? 'shown' : 'hidden'}`);
      return;
    }
    case 'objdet|threshold': {
      const th = Math.max(0.1, Math.min(0.95, parseFloat(c) || 0.5));
      S.objdet.threshold = th;
      logOut(output, `[Object] Detection score threshold = ${th.toFixed(2)} (higher = stricter)`);
      return;
    }
    case 'objdet|analyse': {
      const src = c || 'camera';
      runObjDetOnce().then(() => {
        logOut(output, `[Object] Analysed (${src}) → ${S.objdet.count} object(s).`);
      });
      return;
    }
    case 'ml|training_open':
      S.ml.open = true;
      logOut(output, '[ML] Training window (sim) — add examples in a real ML tool.');
      return;
    case 'pose|sample':
      S.pose.sample = ['T-pose', 'hands up', 'wave'][Math.floor(Math.random() * 3)];
      logOut(output, `[Pose] Sample: ${S.pose.sample}`);
      return;
    case 'arduino|pin_mode': {
      const pin = c || '13';
      S.arduino.modes[pin] = (d || 'OUT').toUpperCase();
      logOut(output, `[Arduino] pin ${pin} mode ${S.arduino.modes[pin]}`);
      return;
    }
    case 'arduino|digital_write': {
      const pin = c || '13';
      S.arduino.digital[pin] = d === '1' || d === 'HIGH' ? 1 : 0;
      logOut(output, `[Arduino] D${pin} = ${S.arduino.digital[pin]}`);
      return;
    }
    case 'arduino|delay': {
      const ms = Math.min(5000, parseInt(c, 10) || 0);
      logOut(output, `[Arduino] delay ${ms}ms (simulated)`);
      return;
    }
    case 'mb|show':
      S.microbit.text = c || 'Hi';
      logOut(output, `[micro:bit] LED: ${S.microbit.text}`);
      return;
    case 'evive|motor':
      S.evive.motor = parseInt(c, 10) || 0;
      logOut(output, `[evive] Motor ${S.evive.motor}`);
      return;
    case 'robot|motorL':
      S.robot.mL = parseInt(c, 10) || 0;
      logOut(output, `[Robot] Motor L=${S.robot.mL}`);
      return;
    case 'robot|motorR':
      S.robot.mR = parseInt(c, 10) || 0;
      logOut(output, `[Robot] Motor R=${S.robot.mR}`);
      return;
    case 'arm|servo':
      S.arm.angle = parseInt(c, 10) || 90;
      logOut(output, `[Arm] Servo ${S.arm.angle}°`);
      return;
    case 'arm|grip':
      S.arm.grip = c === '1' ? 1 : 0;
      logOut(output, `[Arm] Gripper ${S.arm.grip ? 'closed' : 'open'}`);
      return;
    case 'drive|strafe':
      S.drive.x += parseFloat(c) || 0;
      logOut(output, `[Drive] Strafe → x=${S.drive.x.toFixed(1)}`);
      return;
    case 'drive|forward':
      S.drive.y -= parseFloat(c) || 0;
      logOut(output, `[Drive] Forward → y=${S.drive.y.toFixed(1)}`);
      return;
    case 'drive|rotate':
      S.drive.rot += parseFloat(c) || 0;
      logOut(output, `[Drive] Rotate → ${S.drive.rot.toFixed(1)}°`);
      return;
    case 'hum|step':
      S.humanoid.step += 1;
      logOut(output, `[Humanoid] Step ${S.humanoid.step}`);
      return;
    case 'hum|wave':
      logOut(output, '[Humanoid] Wave (sim)');
      return;
    case 'hum|bow':
      logOut(output, '[Humanoid] Bow (sim)');
      return;
    case 'rov|drive':
      S.rover.mode = 'drive';
      logOut(output, '[Rover] Drive');
      return;
    case 'rov|turn':
      S.rover.mode = 'turn';
      logOut(output, '[Rover] Turn in place');
      return;
    case 'rov|rock':
      S.rover.mode = 'rock';
      logOut(output, '[Rover] Rock obstacle');
      return;
    case 'iot|publish': {
      const k = c || 'value';
      const v = d ?? '0';
      S.iot.feed[k] = v;
      S.iot.lastPub = `${k}=${v}`;
      try {
        localStorage.setItem(`bb_iot_${k}`, String(v));
      } catch { /* ignore */ }
      logOut(output, `[IoT] Published ${S.iot.lastPub}`);
      return;
    }
    case 'wx|city':
      S.weather.city = c || 'London';
      fetchWeather(output);
      return;
    case 'hook|post':
      S.webhook.lastPost = c || '{}';
      logOut(output, `[Webhook] POST body (sim): ${S.webhook.lastPost.slice(0, 80)}`);
      return;
    case 'hook|get': {
      const u = c || 'https://httpbin.org/get';
      fetch(u)
        .then((r) => r.text())
        .then((t) => {
          S.webhook.lastGet = t.slice(0, 200);
          logOut(output, `[Webhook] GET ok (${t.length}b)`);
        })
        .catch((e) => logOut(output, `[Webhook] GET error: ${e.message}`));
      logOut(output, '[Webhook] GET started…');
      return;
    }
    case 'qr|scan': {
      const pasted = typeof window !== 'undefined' ? window.prompt('Paste QR / barcode text (simulated scan):', S.qr.payload || 'https://bytebuddies.technology') : '';
      S.qr.payload = pasted || '';
      logOut(output, `[QR] Payload: ${S.qr.payload || '(empty)'}`);
      return;
    }
    case 'log|add':
      S.log.rows.push(String(c || 'row'));
      logOut(output, `[Log] Row ${S.log.rows.length} added`);
      return;
    case 'log|clear':
      S.log.rows = [];
      logOut(output, '[Log] Cleared');
      return;
    case 'video|mirror':
      S.video.mirror = c === 'on';
      ensureVideoMotion(output);
      logOut(output, `[Video] Mirror ${S.video.mirror ? 'on' : 'off'}`);
      return;
    case 'pen|down':
      S.pen.down = true;
      S.pen.points += 1;
      logOut(output, '[Pen] Down');
      return;
    case 'pen|up':
      S.pen.down = false;
      logOut(output, '[Pen] Up');
      return;
    case 'pen|clear':
      S.pen.points = 0;
      logOut(output, '[Pen] Cleared');
      return;
    case 'pen|color':
      S.pen.color = c || '#22c55e';
      logOut(output, `[Pen] Color ${S.pen.color}`);
      return;
    case 'vplay|play':
      S.videoPlayer.playing = true;
      logOut(output, '[Video] Play (sim)');
      return;
    case 'vplay|pause':
      S.videoPlayer.playing = false;
      logOut(output, '[Video] Pause (sim)');
      return;
    case 'vplay|seek':
      S.videoPlayer.pos = parseFloat(c) || 0;
      logOut(output, `[Video] Seek ${S.videoPlayer.pos}s (sim)`);
      return;
    case 'tts|speak': {
      const t = c || 'Hello';
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(t);
        u.rate = 1;
        window.speechSynthesis.speak(u);
      }
      S.tts.last = t;
      logOut(output, `[TTS] Speaking: ${t}`);
      return;
    }
    case 'ai|classify': {
      const text = parts.slice(2).join('|') || 'input';
      const lab = ['yes', 'no', 'maybe', 'fun'][Math.floor(Math.random() * 4)];
      logOut(output, `[AI classify] label="${lab}" ← ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`);
      return;
    }
    case 'ai|generate': {
      const text = parts.slice(2).join('|') || '';
      const snippet = text.length ? `Response idea: ${text.slice(0, 100)}${text.length > 100 ? '…' : ''}` : '[AI] (empty prompt)';
      logOut(output, snippet);
      return;
    }
    case 'listen|once': {
      if (typeof window === 'undefined' || !window.webkitSpeechRecognition && !window.SpeechRecognition) {
        S.listen.last = 'simulated voice input';
        logOut(output, '[Listen] Web Speech not supported — using demo text.');
        return;
      }
      const R = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new R();
      r.lang = 'en-US';
      r.onresult = (e) => {
        S.listen.last = e.results[0][0].transcript;
        logOut(output, `[Listen] Heard: ${S.listen.last}`);
      };
      r.onerror = () => logOut(output, '[Listen] Error — try again.');
      r.start();
      logOut(output, '[Listen] Listening… (speak now)');
      return;
    }
    default:
      logOut(output, `[Ext] ${cmdStr}`);
  }
}

/** Read extension value for expressions / print. */
export function readExtensionKey(key) {
  S.body.t = (S.body.t || 0) + 1;
  switch (key) {
    case 'face.visible':
      ensureFaceLoop(null);
      return !!S.face.visible;
    case 'face.count':
      ensureFaceLoop(null);
      return Number(S.face.count) || 0;
    case 'objdet.count':
      ensureObjdetLoop(null);
      return Number(S.objdet.count) || 0;
    case 'objects.labels': return S.objects.labels;
    case 'body.kpx': {
      if (typeof S.body.noseNormX === 'number') return Math.round((S.body.noseNormX ?? 0.5) * 480 - 240);
      return 100 + Math.sin(S.body.t / 5) * 80;
    }
    case 'body.kpy': {
      if (typeof S.body.noseNormY === 'number') return Math.round(180 - (S.body.noseNormY ?? 0.4) * 360);
      return 200 + Math.cos(S.body.t / 5) * 60;
    }
    case 'arduino.analog.a0':
    case 'arduino.analog.A0': {
      const pin = 'A0';
      if (!S.arduino.analog[pin]) S.arduino.analog[pin] = 300 + Math.floor(Math.random() * 400);
      S.arduino.analog[pin] = Math.max(0, Math.min(1023, S.arduino.analog[pin] + Math.floor((Math.random() - 0.5) * 20)));
      return S.arduino.analog[pin];
    }
    case 'mb.buttonA':
      S.microbit.btnA = Math.random() > 0.85;
      return S.microbit.btnA;
    case 'mb.buttonB':
      S.microbit.btnB = Math.random() > 0.92;
      return S.microbit.btnB;
    case 'mb.accel':
      S.microbit.ax = Math.round(512 + 200 * Math.sin(Date.now() / 800));
      return S.microbit.ax;
    case 'evive.pot':
      S.evive.pot = Math.max(0, Math.min(1023, S.evive.pot + (Math.random() - 0.5) * 40));
      return Math.round(S.evive.pot);
    case 'evive.sw':
      S.evive.sw = Math.random() > 0.8;
      return S.evive.sw;
    case 'robot.line':
      return S.robot.line.map((x) => x.toFixed(2)).join(', ');
    case 'iot.feed': {
      try {
        const keys = Object.keys(S.iot.feed);
        if (!keys.length) return '(empty)';
        return keys.map((k) => `${k}=${S.iot.feed[k]}`).join('; ');
      } catch {
        return '(empty)';
      }
    }
    case 'iot.time': return new Date().toISOString();
    case 'weather.temp':
      fetchWeather(null);
      return S.weather.temp ?? 17;
    case 'weather.cond':
      return S.weather.cond ?? 'clear';
    case 'video.motion':
      ensureVideoMotion(null);
      return S.video.motion;
    case 'log.count': return S.log.rows.length;
    case 'qr.payload': return S.qr.payload || '';
    case 'listen.last':
      return S.listen.last || '';
    default: {
      if (String(key).startsWith('imgml.')) ensureObjdetLoop(null);
      if (String(key).startsWith('body.')) ensureFaceLoop(null);
      const aiVal = readAiMlExtensionKey(S, key);
      if (aiVal !== null) return aiVal;
      const fp = parseFaceReadKey(key);
      if (fp) {
        ensureFaceLoop(null);
        const i = fp.index - 1;
        const faces = S.face.lastFaces || [];
        const f = faces[i];
        if (!f) {
          if (fp.kind === 'isexpr') return false;
          if (fp.kind === 'expr') return 'none';
          return 0;
        }
        const vw = S.face.video?.videoWidth || 640;
        const vh = S.face.video?.videoHeight || 480;
        if (fp.kind === 'x') return Math.round(((f.x + f.w / 2) / Math.max(1, vw)) * 480 - 240);
        if (fp.kind === 'y') return Math.round(180 - ((f.y + f.h / 2) / Math.max(1, vh)) * 360);
        if (fp.kind === 'size') return Math.round((Math.max(f.w, f.h) / Math.max(vw, vh)) * 200);
        if (fp.kind === 'expr') return String((S.face.expressions && S.face.expressions[i]) || 'neutral');
        if (fp.kind === 'isexpr') {
          const got = String((S.face.expressions && S.face.expressions[i]) || 'neutral').toLowerCase();
          return got === fp.expr || (fp.expr === 'happy' && (got === 'happy' || got === 'surprised'));
        }
      }
      const od = parseObjdetReadKey(key);
      if (od) {
        ensureObjdetLoop(null);
        const objs = S.objdet.lastObjects || [];
        if (od.kind === 'class') {
          const o = objs[od.index - 1];
          return o ? o.label : 'none';
        }
        if (od.kind === 'is') {
          return objs.some((o) => objdetLabelMatches(o.label, od.cls));
        }
        if (od.kind === 'num') {
          return objs.filter((o) => objdetLabelMatches(o.label, od.cls)).length;
        }
      }
      return 0;
    }
  }
}

/** Game builder: run extension, optional sprite side-effects */
export function runExtensionGame(cmdStr, sprite) {
  const out = [];
  runExtensionCmd(cmdStr, out);
  const msg = out[out.length - 1];
  if (msg && sprite) {
    sprite._sayText = msg.slice(0, 120);
    sprite._sayUntil = Date.now() + 2500;
  }
  const parts = String(cmdStr).split('|');
  if (sprite && parts[0] === 'robot') {
    sprite.x += (S.robot.mL - S.robot.mR) * 0.15;
    sprite.y -= (S.robot.mL + S.robot.mR) * 0.02;
  }
  if (sprite && parts[0] === 'drive') {
    sprite.x += S.drive.x * 0.1;
    sprite.y += S.drive.y * 0.1;
    sprite.rotation = (sprite.rotation || 0) + S.drive.rot;
  }
}

export function readExtensionGame(key) {
  return readExtensionKey(key);
}
