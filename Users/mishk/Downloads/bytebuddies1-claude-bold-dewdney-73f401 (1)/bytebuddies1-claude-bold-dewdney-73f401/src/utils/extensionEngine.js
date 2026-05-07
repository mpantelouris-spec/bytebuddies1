/**
 * Browser-side extension simulation: camera/ML stubs, IoT memory, Arduino pins,
 * robots, pen, logger, weather (Open-Meteo), speech, and reads for conditions.
 */

import { cocoDetectOnCanvas, ensureCocoSsd } from './objectDetRuntime.js';
import { dispatchAiMlExtension, readAiMlExtensionKey } from './aiExtensionDispatch.js';
import { playBlockSound, playInstrumentMidiNote } from './blockSounds.js';

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
    mpPose: null,
    mpPoseInitPromise: null,
    mpPoseFailed: false,
    poseLandmarkTs: 0,
    lastPose: null,
    posX: 16,
    posY: undefined,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
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
    posX: undefined,
    posY: 16,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
  },
  objects: { labels: 'cat, dog, tree' },
  body: { t: 0, visible: false, noseNormX: null, noseNormY: null },
  ml: { open: false, ready: false, topClass: 'none', confidence: 0 },
  txtml: { examples: {}, lastLabel: 'unknown', lastScore: 0 },
  imgml: { topClass: 'none', confidence: 0 },
  poseml: { label: 'none', score: 0 },
  audioml: { label: 'silence' },
  numml: { prediction: 0 },
  // New ML classifier variants
  tc: { examples: {}, label: 'unknown', confidence: 0 },
  ic: { class: 'none', score: 0, ready: false },
  pc: { poseName: 'none', score: 0 },
  ac: { label: 'silence', score: 0 },
  nr: { data: [], prediction: 0 },
  tr: { last: '' },
  ocr: { text: '' },
  rc: { label: 'unknown' },
  chat: { lastReply: '' },
  pose: { sample: 'T-pose' },
  wifi: { ssid: '', password: '', connected: false },
  ts: { channelId: '', writeKey: '', readKey: '', lastData: {}, field1: 0, field2: 0, field3: 0, field4: 0, field5: 0, field6: 0, field7: 0, field8: 0 },
  http: { url: '', method: 'GET', body: '', contentType: 'application/json', responseCode: 0, responseBody: '' },
  iot: { feed: {}, lastPub: '' },
  weather: { city: 'London', temp: null, cond: null, fetched: 0 },
  webhook: { lastPost: '', lastGet: '' },
  qr: { payload: '' },
  log: { rows: [] },
  video: { motion: 0, mirror: false, loopId: null },
  pen: { down: false, color: '#6366f1', points: 0 },
  music: { instrument: 0, tempo: 60, drums: { 0: 'Snare Drum', 1: 'Kick Drum', 2: 'Tom', 3: 'Cymbal' } },
  tts: { last: '' },
  listen: { last: '' },
  nlp: { sentiment: 0.5 },
  videoPlayer: { playing: false, pos: 0 },
  physics: { vx: 0, vy: 0, gravity: 0.5, friction: 0.95, bounce: 0.8, enabled: false },
};

function logOut(output, msg) {
  if (output && typeof output.push === 'function') output.push(msg);
}

/** Map palette label (lowercase) → extension block spec */
const DRAG = {
  // Face Detection
  '[face] turn video on (camera)': { kind: 'run', cmd: 'face|camera_on' },
  '[face] turn video on (mirrored)': { kind: 'run', cmd: 'face|video|on|flipped' },
  '[face] turn video off': { kind: 'run', cmd: 'face|camera_off' },
  '[face] show bounding box': { kind: 'run', cmd: 'face|bbox|show' },
  '[face] hide bounding box': { kind: 'run', cmd: 'face|bbox|hide' },
  '[face] set detection threshold': { kind: 'run', cmd: 'face|threshold|0.5' },
  '[face] analyse from camera': { kind: 'run', cmd: 'face|analyse|camera' },
  '[face] analyse from stage': { kind: 'run', cmd: 'face|analyse|stage' },
  '[face] number of faces': { kind: 'read', key: 'face.count' },
  '[face] if face detected': { kind: 'read', key: 'face.visible' },
  '[face] face visible?': { kind: 'read', key: 'face.visible' },
  '[face] expression of face 1': { kind: 'read', key: 'face.expr|1' },
  '[face] x of face 1': { kind: 'read', key: 'face.x|1' },
  '[face] y of face 1': { kind: 'read', key: 'face.y|1' },
  '[face] size of face 1': { kind: 'read', key: 'face.size|1' },
  '[face] is face 1 happy?': { kind: 'read', key: 'face.isexpr|1|happy' },
  '[face] face count': { kind: 'read', key: 'face.count' },
  // Object Detection
  '[object] turn video on (on) with transparency 0': { kind: 'run', cmd: 'objdet|camera_on' },
  '[object] turn video off': { kind: 'run', cmd: 'objdet|camera_off' },
  '[object] show bounding box': { kind: 'run', cmd: 'objdet|bbox|show' },
  '[object] hide bounding box': { kind: 'run', cmd: 'objdet|bbox|hide' },
  '[object] set detection threshold': { kind: 'run', cmd: 'objdet|threshold|0.5' },
  '[object] analyse image from camera': { kind: 'run', cmd: 'objdet|analyse|camera' },
  '[object] analyse image from stage': { kind: 'run', cmd: 'objdet|analyse|stage' },
  '[object] number of objects': { kind: 'read', key: 'objdet.count' },
  '[object] class of object 1': { kind: 'read', key: 'objdet.class|1' },
  '[object] is person detected?': { kind: 'read', key: 'objdet.is|person' },
  '[object] number of person detected': { kind: 'read', key: 'objdet.num|person' },
  '[objects] label list': { kind: 'read', key: 'objects.labels' },
  '[body] keypoint x': { kind: 'read', key: 'body.kpx' },
  '[body] keypoint y': { kind: 'read', key: 'body.kpy' },
  '[body] analyse from face': { kind: 'run', cmd: 'body|analyse' },
  '[body] body visible?': { kind: 'read', key: 'body.visible' },
  '[body] nose x': { kind: 'read', key: 'body.nose.x' },
  '[body] nose y': { kind: 'read', key: 'body.nose.y' },
  '[ml] train classifier (sim)': { kind: 'run', cmd: 'ml|train' },
  '[ml] training window open': { kind: 'run', cmd: 'ml|training_open' },
  '[chat] ask coding helper': { kind: 'run', cmd: 'chat|ask|hello' },
  '[tts] speak': { kind: 'run', cmd: 'tts|speak|English|This is a test' },
  '[tc] add training example': { kind: 'run', cmd: 'tc|add' },
  '[tc] classify sentence': { kind: 'run', cmd: 'tc|classify|test' },
  '[tc] prediction label': { kind: 'read', key: 'tc.label' },
  '[tc] prediction confidence': { kind: 'read', key: 'tc.confidence' },
  '[ic] turn classifier camera on': { kind: 'run', cmd: 'ic|camera_on' },
  '[ic] analyse frame': { kind: 'run', cmd: 'ic|analyse' },
  '[ic] top class': { kind: 'read', key: 'ic.class' },
  '[ic] confidence score': { kind: 'read', key: 'ic.score' },
  '[pc] turn pose camera on': { kind: 'run', cmd: 'pc|camera_on' },
  '[pc] turn pose camera off': { kind: 'run', cmd: 'pc|off' },
  '[pc] capture pose sample': { kind: 'run', cmd: 'pc|sample' },
  '[pc] pose name': { kind: 'read', key: 'pc.name' },
  '[pc] pose confidence': { kind: 'read', key: 'pc.confidence' },
  '[ac] classify sound': { kind: 'run', cmd: 'ac|classify' },
  '[ac] sound label': { kind: 'read', key: 'ac.label' },
  '[tts] speak': { kind: 'run', cmd: 'tts|speak|English|hello' },
  '[pose] sample pose': { kind: 'run', cmd: 'pose|sample' },
  '[wifi] connect to wi-fi': { kind: 'run', cmd: 'wifi|connect|MyNetwork|password123' },
  '[wifi] is wifi connected?': { kind: 'read', key: 'wifi.connected' },
  '[ts] create thingspeak channel': { kind: 'run', cmd: 'ts|create' },
  '[ts] connect to thingspeak channel': { kind: 'run', cmd: 'ts|connect|123456|write_key|read_key' },
  '[ts] send data to cloud': { kind: 'run', cmd: 'ts|send|22|20' },
  '[ts] send multiple data to cloud': { kind: 'run', cmd: 'ts|send_multi|20|22|23|24|25|26|27|28|20' },
  '[ts] get data from thingspeak': { kind: 'run', cmd: 'ts|get' },
  '[ts] read data from field': { kind: 'read', key: 'ts.field1' },
  '[http] make request': { kind: 'run', cmd: 'http|GET|https://api.example.com' },
  '[http] set body to': { kind: 'run', cmd: 'http|setbody|{\"key\": \"value\"}' },
  '[http] set content type to': { kind: 'run', cmd: 'http|contenttype|application/json' },
  '[http] get api response code': { kind: 'read', key: 'http.responseCode' },
  '[http] get body': { kind: 'read', key: 'http.responseBody' },
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
  '[music] play drum': { kind: 'run', cmd: 'music|drum|0|0.5' },
  '[music] rest for beats': { kind: 'run', cmd: 'music|rest|0.5' },
  '[music] play note for beats': { kind: 'run', cmd: 'music|note|60|0.5' },
  '[music] set instrument to': { kind: 'run', cmd: 'music|instrument|0' },
  '[music] set tempo to': { kind: 'run', cmd: 'music|tempo|60' },
  '[music] change tempo by': { kind: 'run', cmd: 'music|tempo_change|10' },
  '[music] tempo': { kind: 'read', key: 'music.tempo' },
  '[video] play clip': { kind: 'run', cmd: 'vplay|play|demo' },
  '[video] pause': { kind: 'run', cmd: 'vplay|pause' },
  '[video] seek sec': { kind: 'run', cmd: 'vplay|seek|0' },
  '[tts] speak': { kind: 'run', cmd: 'tts|speak|Hello from ByteBuddies' },
  'set velocity': { kind: 'run', cmd: 'physics|velocity|5|0' },
  'set gravity': { kind: 'run', cmd: 'physics|gravity|0.5' },
  'bounce off edges': { kind: 'run', cmd: 'physics|bounce|0.8' },
  'jump': { kind: 'run', cmd: 'physics|jump|10' },
  'set friction': { kind: 'run', cmd: 'physics|friction|0.95' },
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
  updateFaceOverlayPosition();
}

function updateFaceOverlayPosition() {
  const root = S.face.overlay;
  if (!root) return;
  const x = S.face.posX ?? 16;
  const y = S.face.posY ?? (window.innerHeight - 240);
  root.style.left = `${x}px`;
  root.style.bottom = 'auto';
  root.style.top = `${y}px`;
}

let dragListenersSetup = false;

function setupGlobalDragListeners() {
  if (dragListenersSetup) return;
  dragListenersSetup = true;

  document.addEventListener('mousemove', (e) => {
    if (S.face.dragging) {
      S.face.posX = e.clientX - S.face.dragStartX;
      S.face.posY = e.clientY - S.face.dragStartY;
      updateFaceOverlayPosition();
    }
    if (S.objdet.dragging) {
      S.objdet.posX = e.clientX - S.objdet.dragStartX;
      S.objdet.posY = e.clientY - S.objdet.dragStartY;
      updateObjdetOverlayPosition();
    }
  });

  document.addEventListener('mouseup', () => {
    if (S.face.dragging) {
      S.face.dragging = false;
      const root = S.face.overlay;
      if (root) root.style.cursor = 'grab';
    }
    if (S.objdet.dragging) {
      S.objdet.dragging = false;
      const root = S.objdet.overlay;
      if (root) root.style.cursor = 'grab';
    }
  });

  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (S.face.dragging) {
      S.face.posX = touch.clientX - S.face.dragStartX;
      S.face.posY = touch.clientY - S.face.dragStartY;
      updateFaceOverlayPosition();
    }
    if (S.objdet.dragging) {
      S.objdet.posX = touch.clientX - S.objdet.dragStartX;
      S.objdet.posY = touch.clientY - S.objdet.dragStartY;
      updateObjdetOverlayPosition();
    }
  });

  document.addEventListener('touchend', () => {
    S.face.dragging = false;
    S.objdet.dragging = false;
  });
}

function setupFaceDrag() {
  const root = S.face.overlay;
  if (!root) return;
  setupGlobalDragListeners();
  root.style.cursor = 'grab';
  root.addEventListener('mousedown', (e) => {
    S.face.dragging = true;
    S.face.dragStartX = e.clientX - S.face.posX;
    S.face.dragStartY = e.clientY - S.face.posY;
    root.style.cursor = 'grabbing';
    e.preventDefault();
  });
  root.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    S.face.dragging = true;
    S.face.dragStartX = touch.clientX - S.face.posX;
    S.face.dragStartY = touch.clientY - S.face.posY;
    e.preventDefault();
  });
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

async function ensureMediaPipePose() {
  if (S.face.mpPose) return S.face.mpPose;
  if (S.face.mpPoseFailed) return null;
  S.face.mpPoseInitPromise ||= (async () => {
    try {
      const { Pose, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const wasm = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm';
      const fileset = await FilesetResolver.forVisionTasks(wasm);
      const model = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
      const pose = await Pose.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: model },
        runningMode: 'VIDEO',
      });
      S.face.mpPose = pose;
      console.log('[Pose] ✅ MediaPipe Pose model loaded successfully');
    } catch (e) {
      console.warn('[Pose] MediaPipe Pose unavailable', e?.message || e);
      S.face.mpPoseFailed = true;
      S.face.mpPose = null;
    } finally {
      S.face.mpPoseInitPromise = null;
    }
  })();
  await S.face.mpPoseInitPromise;
  return S.face.mpPose;
}

function classifyPoseFromKeypoints(landmarks) {
  if (!landmarks || landmarks.length < 29) return null;

  // Key body part indices in MediaPipe Pose (33 landmarks total)
  const NOSE = 0;
  const LSHOULDER = 11, RSHOULDER = 12;
  const LELBOW = 13, RELBOW = 14;
  const LWRIST = 15, RWRIST = 16;
  const LHIP = 23, RHIP = 24;
  const LKNEE = 25, RKNEE = 26;
  const LANKLE = 27, RANKLE = 28;

  // Get Y coordinates (0=top, 1=bottom of screen)
  const noseY = landmarks[NOSE]?.y || 0.5;
  const lShoulderY = landmarks[LSHOULDER]?.y || 0.5;
  const rShoulderY = landmarks[RSHOULDER]?.y || 0.5;
  const shoulderY = (lShoulderY + rShoulderY) / 2;

  const lHipY = landmarks[LHIP]?.y || 0.5;
  const rHipY = landmarks[RHIP]?.y || 0.5;
  const hipY = (lHipY + rHipY) / 2;

  const lKneeY = landmarks[LKNEE]?.y || 0.5;
  const rKneeY = landmarks[RKNEE]?.y || 0.5;
  const kneeY = (lKneeY + rKneeY) / 2;

  const lAnkleY = landmarks[LANKLE]?.y || 0.5;
  const rAnkleY = landmarks[RANKLE]?.y || 0.5;
  const ankleY = (lAnkleY + rAnkleY) / 2;

  const lElbowY = landmarks[LELBOW]?.y || 0.5;
  const rElbowY = landmarks[RELBOW]?.y || 0.5;

  // Get X coordinates for horizontal spread
  const noseX = landmarks[NOSE]?.x || 0.5;
  const lShoulderX = landmarks[LSHOULDER]?.x || 0.5;
  const rShoulderX = landmarks[RSHOULDER]?.x || 0.5;
  const lWristX = landmarks[LWRIST]?.x || 0.5;
  const rWristX = landmarks[RWRIST]?.x || 0.5;
  const lWristY = landmarks[LWRIST]?.y || 0.5;
  const rWristY = landmarks[RWRIST]?.y || 0.5;
  const lHipX = landmarks[LHIP]?.x || 0.5;
  const rHipX = landmarks[RHIP]?.x || 0.5;

  // Simple measurements
  const bodyHeight = hipY - shoulderY; // Positive = hips below shoulders
  const legBend = kneeY - hipY; // Positive = knees below hips
  const armRaise = shoulderY - Math.min(lWristY, rWristY); // Positive = arms raised
  const armSpread = Math.abs(lWristX - rWristX);
  const shoulderWidth = Math.abs(rShoulderX - lShoulderX);
  const hipWidth = Math.abs(rHipX - lHipX);

  // Arm positions
  const leftArmUp = lWristY < shoulderY - 0.1;
  const rightArmUp = rWristY < shoulderY - 0.1;
  const bothArmsUp = leftArmUp && rightArmUp;
  const bothArmsDown = lWristY > hipY && rWristY > hipY;

  // Head position relative to body
  const headTilt = Math.abs(noseX - ((lShoulderX + rShoulderX) / 2)); // Distance from center

  // Decision tree - ordered by specificity

  // LAYING_DOWN: Hips and shoulders at similar height (horizontal body)
  if (Math.abs(hipY - shoulderY) < 0.08) {
    return 'laying_down';
  }

  // KNEELING: Knees visible and bent, but sitting on knees
  if (legBend > 0.08 && legBend < 0.15 && kneeY > hipY) {
    return 'kneeling';
  }

  // SITTING: Knees significantly below hips (legs bent)
  if (legBend > 0.12) {
    return 'sitting';
  }

  // BENT_FORWARD: Nose lower than hips (bending/bowing)
  if (noseY > hipY) {
    return 'bent_forward';
  }

  // ARMS_UP: Both arms high above head
  if (bothArmsUp && armRaise > 0.2) {
    return 'arms_up';
  }

  // ARMS_CROSSED: Arms close together near chest
  if (Math.abs(lWristX - rWristX) < 0.15 && lWristY < shoulderY && rWristY < shoulderY) {
    return 'arms_crossed';
  }

  // JUMPING: Arms up with feet off ground
  if (bothArmsUp && ankleY < kneeY) {
    return 'jumping';
  }

  // HANDS_ON_HIPS: Arms bent with hands near hips
  if (lWristY > shoulderY && rWristY > shoulderY &&
      lWristY < hipY + 0.15 && rWristY < hipY + 0.15) {
    return 'hands_on_hips';
  }

  // WAVING: One arm way up, other arm down
  if ((leftArmUp && !rightArmUp && rWristY > hipY * 0.8) ||
      (rightArmUp && !leftArmUp && lWristY > hipY * 0.8)) {
    return 'waving';
  }

  // DANCING: Arms spread wide and body active
  if (armSpread > 0.35 && bodyHeight > 0.1) {
    return 'dancing';
  }

  // T_POSE: Both arms out to sides at shoulder height
  if (armSpread > 0.35 && Math.abs(lWristY - rWristY) < 0.1 &&
      lWristY > shoulderY - 0.15 && lWristY < shoulderY + 0.15) {
    return 't_pose';
  }

  // Simple fallback based on basic body position
  if (bothArmsDown) {
    return 'standing';
  }

  // DEFAULT: Standing
  return 'standing';
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

  // Run pose detection on the same frame
  if (S.face.cameraOk && !S.face.demoNoCamera) {
    // Ensure MediaPipe Pose is loaded
    if (!S.face.mpPose && !S.face.mpPoseInitPromise) {
      ensureMediaPipePose().catch(() => {});
    }

    const mpPose = S.face.mpPose; // Use cached pose detector if available
    if (mpPose && S.face.detCanvas && S.face.video && S.face.video.readyState >= 2) {
      try {
        // Use monotonic timestamp that increases
        S.face.poseLandmarkTs = (S.face.poseLandmarkTs || 0) + 33;
        const poseResult = mpPose.detectForVideo(S.face.detCanvas, S.face.poseLandmarkTs);

        if (poseResult?.landmarks && poseResult.landmarks.length > 0) {
          const landmarks = poseResult.landmarks[0];
          if (landmarks && landmarks.length > 0) {
            const detectedPose = classifyPoseFromKeypoints(landmarks);
            if (detectedPose) {
              S.face.lastPose = detectedPose;
              console.log('[Pose] ✅ Detected:', detectedPose, '| Landmarks:', landmarks.length);
            } else {
              console.log('[Pose] ⚠️ No classification (landmarks exist):', landmarks.length);
              S.face.lastPose = 'standing'; // Fallback
            }
          }
        } else {
          console.log('[Pose] ℹ️ No landmarks in frame');
          S.face.lastPose = null;
        }
      } catch (e) {
        console.error('[Pose] ❌ Detection error:', e.message);
        S.face.lastPose = null;
      }
    } else {
      // Motion-based pose detection fallback when MediaPipe isn't ready
      if (!mpPose && S.face.detCanvas && S.face.video && S.face.video.readyState >= 2) {
        try {
          // Simple motion detection: check if pixels are changing
          const imageData = S.face.detCtx.getImageData(0, 0, vw, vh);
          const data = imageData.data;
          
          // Store previous frame for comparison
          if (!S.face.prevFrameData) {
            S.face.prevFrameData = new Uint8ClampedArray(data);
            S.face.lastPose = 'standing';
            return;
          }
          
          // Calculate motion by comparing pixel changes
          let motion = 0;
          let samples = 0;
          for (let i = 0; i < data.length; i += 16) { // Sample every 16th pixel for speed
            const diff = Math.abs(data[i] - S.face.prevFrameData[i]);
            motion += diff;
            samples++;
          }
          
          const avgMotion = motion / Math.max(1, samples);
          S.face.prevFrameData = new Uint8ClampedArray(data);
          
          // Map motion level to poses
          if (avgMotion < 3) {
            S.face.lastPose = 'standing';
          } else if (avgMotion < 8) {
            S.face.lastPose = 'standing'; // Slight movement = standing
          } else if (avgMotion < 15) {
            // Moderate movement could be waving or arms_up
            const poseOptions = ['waving', 'arms_up', 'standing'];
            S.face.lastPose = poseOptions[Math.floor(Math.random() * poseOptions.length)];
          } else {
            // High motion = active movement (dancing, jumping, etc)
            const poseOptions = ['dancing', 'jumping', 'waving', 't_pose', 'arms_up'];
            S.face.lastPose = poseOptions[Math.floor(Math.random() * poseOptions.length)];
          }
          
          console.log('[Pose] 📹 Motion-based detection:', S.face.lastPose, 'motion:', avgMotion.toFixed(2));
        } catch (e) {
          console.error('[Pose] Motion detection error:', e.message);
        }
      }
    }
  }
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
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not available');
      }
      logOut(output, '[Face] Requesting camera access…');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      }).catch(err => {
        logOut(output, `[Face] Camera error: ${err.name || err.message}`);
        throw err;
      });
      if (startToken !== S.face.liveToken) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      removeFaceOverlay();
      const root = document.createElement('div');
      root.id = 'bb-face-overlay-root';
      root.setAttribute('data-bb-face-overlay', '1');
      root.style.cssText =
        'position:fixed;left:16px;top:auto;z-index:12000;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.55);border:2px solid #c2410c;background:#0f172a;max-width:min(92vw,320px);touch-action:none;';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:relative;display:block;line-height:0;background:#000;';
      const v = document.createElement('video');
      v.playsInline = true;
      v.muted = true;
      v.autoplay = true;
      v.playsinline = true;
      v.webkit = true;
      v.srcObject = stream;
      v.style.cssText = 'display:block;width:100%;height:auto;max-height:220px;vertical-align:top;transform:scaleX(-1);';
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
      S.face.video = v;
      S.face.on = true;
      S.face.cameraOk = false;
      const Det = window.FaceDetector;
      S.face.det = Det ? new Det({ fastMode: true, maxDetectedFaces: 8 }) : null;
      let videoReady = false;
      const onVideoReady = () => {
        videoReady = true;
        S.face.cameraOk = true;
        layoutFaceOverlay();
        setupFaceDrag();
        drawFaceOverlay();
        logOut(output, '[Face] ✅ Camera ready. Preview in bottom-left. Use “Show bounding box” to see detections. Drag to move.');
      };
      v.addEventListener('loadeddata', onVideoReady, { once: true });
      v.addEventListener('play', onVideoReady, { once: true });
      if (startToken !== S.face.liveToken) {
        stream.getTracks().forEach((t) => t.stop());
        removeFaceOverlay();
        S.face.video = null;
        S.face.on = false;
        S.face.cameraOk = false;
        return;
      }
      // Run detection immediately, then every 280ms
      runFaceDetectionOnce().catch(() => {});
      S.face.loopId = window.setInterval(() => {
        runFaceDetectionOnce().catch(() => {});
      }, 280);
      void ensureMpFaceLandmarker().catch(() => {});
      void ensureMediaPipePose().catch(() => {});
      const startWait = Date.now();
      await new Promise((resolve) => {
        const checkReady = () => {
          if (videoReady || Date.now() - startWait > 5000) {
            resolve();
          } else {
            requestAnimationFrame(checkReady);
          }
        };
        if (v.readyState >= 2) {
          videoReady = true;
          resolve();
        } else {
          checkReady();
        }
      });
      if (startToken !== S.face.liveToken) return;
      if (!S.face.cameraOk) {
        logOut(output, '[Face] ⚠️ Camera initialized but video not ready. Using demo mode.');
        S.face.demoNoCamera = true;
      } else {
        layoutFaceOverlay();
        await runFaceDetectionOnce();
      }
    } catch (err) {
      if (startToken !== S.face.liveToken) return;
      const errMsg = err?.name || err?.message || String(err);
      logOut(output, `[Face] Camera access failed (${errMsg}) — using demo mode.`);
      S.face.on = true;
      S.face.cameraOk = false;
      S.face.demoNoCamera = true;
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
  S.face.lastPose = null;
  if (S.face.mpLandmarker) {
    try {
      S.face.mpLandmarker.close();
    } catch {
      /* ignore */
    }
    S.face.mpLandmarker = null;
  }
  S.face.mpInitFailed = false;
  if (S.face.mpPose) {
    try {
      S.face.mpPose.close();
    } catch {
      /* ignore */
    }
    S.face.mpPose = null;
  }
  S.face.mpPoseInitFailed = false;
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
  updateObjdetOverlayPosition();
}

function updateObjdetOverlayPosition() {
  const root = S.objdet.overlay;
  if (!root) return;
  let x = S.objdet.posX;
  if (x === undefined) {
    x = Math.max(16, window.innerWidth - 320);
    S.objdet.posX = x;
  }
  let y = S.objdet.posY;
  if (y === undefined) {
    y = 16;
    S.objdet.posY = y;
  }
  root.style.right = 'auto';
  root.style.left = `${x}px`;
  root.style.top = `${y}px`;
}

function setupObjdetDrag() {
  const root = S.objdet.overlay;
  if (!root) return;
  setupGlobalDragListeners();
  root.style.cursor = 'grab';
  root.addEventListener('mousedown', (e) => {
    S.objdet.dragging = true;
    S.objdet.dragStartX = e.clientX - S.objdet.posX;
    S.objdet.dragStartY = e.clientY - S.objdet.posY;
    root.style.cursor = 'grabbing';
    e.preventDefault();
  });
  root.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    S.objdet.dragging = true;
    S.objdet.dragStartX = touch.clientX - S.objdet.posX;
    S.objdet.dragStartY = touch.clientY - S.objdet.posY;
    e.preventDefault();
  });
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
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not available');
      }
      logOut(output, '[Object] Requesting camera access…');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      }).catch(err => {
        logOut(output, `[Object] Camera error: ${err.name || err.message}`);
        throw err;
      });
      if (startToken !== S.objdet.liveToken) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      removeObjdetOverlay();
      const root = document.createElement('div');
      root.id = 'bb-objdet-overlay-root';
      root.setAttribute('data-bb-objdet-overlay', '1');
      root.style.cssText =
        'position:fixed;left:auto;right:16px;top:16px;z-index:11990;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.55);border:2px solid #9f1239;background:#0f172a;max-width:min(92vw,320px);touch-action:none;';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:relative;display:block;line-height:0;background:#000;';
      const v = document.createElement('video');
      v.playsInline = true;
      v.muted = true;
      v.autoplay = true;
      v.playsinline = true;
      v.webkit = true;
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
      S.objdet.video = v;
      S.objdet.on = true;
      S.objdet.cameraOk = false;
      let videoReady = false;
      const onVideoReady = () => {
        videoReady = true;
        S.objdet.cameraOk = true;
        layoutObjdetOverlay();
        setupObjdetDrag();
        drawObjdetOverlay();
        logOut(output, '[Object] ✅ Camera ready. Preview in bottom-right. Use “Show bounding box” to see detections. Drag to move.');
      };
      v.addEventListener('loadeddata', onVideoReady, { once: true });
      v.addEventListener('play', onVideoReady, { once: true });
      if (startToken !== S.objdet.liveToken) {
        stream.getTracks().forEach((t) => t.stop());
        removeObjdetOverlay();
        S.objdet.video = null;
        S.objdet.on = false;
        S.objdet.cameraOk = false;
        return;
      }
      // Run detection immediately, then every 400ms
      runObjDetOnce().catch(() => {});
      S.objdet.loopId = window.setInterval(() => {
        runObjDetOnce().catch(() => {});
      }, 400);
      void ensureCocoSsd().catch(() => {});
      const startWait = Date.now();
      await new Promise((resolve) => {
        const checkReady = () => {
          if (videoReady || Date.now() - startWait > 5000) {
            resolve();
          } else {
            requestAnimationFrame(checkReady);
          }
        };
        if (v.readyState >= 2) {
          videoReady = true;
          resolve();
        } else {
          checkReady();
        }
      });
      if (startToken !== S.objdet.liveToken) return;
      if (!S.objdet.cameraOk) {
        logOut(output, '[Object] ⚠️ Camera initialized but video not ready. Using demo mode.');
        S.objdet.demoNoCamera = true;
      } else {
        layoutObjdetOverlay();
        await runObjDetOnce();
      }
    } catch (err) {
      if (startToken !== S.objdet.liveToken) return;
      const errMsg = err?.name || err?.message || String(err);
      logOut(output, `[Object] Camera access failed (${errMsg}) — using demo mode.`);
      S.objdet.on = true;
      S.objdet.cameraOk = false;
      S.objdet.demoNoCamera = true;
      S.objdet.lastObjects = [
        { label: 'person', score: 0.9, x: 80, y: 70, w: 140, h: 180 },
        { label: 'cup', score: 0.75, x: 260, y: 120, w: 70, h: 90 },
      ];
      S.objdet.count = S.objdet.lastObjects.length;
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
  if (typeof console !== 'undefined') {
    console.log('[Extension] Running:', a0, b0, '| Full:', cmdStr);
  }
  if (a0 === 'imgml' && b0 === 'camera') {
    ensureObjdetLoop(output);
    logOut(output, '[IC] Object-detection camera on — run “Analyse image” then “Analyse frame” for classifier reads.');
    return;
  }
  // Handle camera activation for ML extensions before general ML dispatch
  if (a0 === 'pc' && b0 === 'camera_on') {
    ensureFaceLoop(output);
    logOut(output, '[PC] Pose detection camera ready. Show preview and use “Capture pose sample” to detect poses.');
    return;
  }
  if (
    ['body', 'txtml', 'imgml', 'poseml', 'audioml', 'numml', 'nlp', 'tr', 'ocr', 'rc', 'chat', 'ml', 'tc', 'ic', 'pc', 'ac', 'nr'].includes(a0) &&
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
    case 'pc|camera_on':
      // Pose Classifier uses the same camera as face detection
      ensureFaceLoop(output);
      logOut(output, '[PC] Pose detection camera ready. Show preview and use "Capture pose sample" to detect poses.');
      return;
    case 'pc|on':
      // Pose Classifier turn on (same as camera_on)
      ensureFaceLoop(output);
      logOut(output, '[PC] Pose detection camera ready. Show preview and use "Capture pose sample" to detect poses.');
      return;
    case 'pc|off':
      // Pose Classifier turn off
      stopFaceLoop();
      logOut(output, '[PC] Pose detection camera off.');
      return;
    case 'pc|camera_off':
      // Alternative naming
      stopFaceLoop();
      logOut(output, '[PC] Pose detection camera off.');
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
      runFaceDetectionOnce().catch(() => {});
      logOut(output, `[Face] Analysed (${src}) → ${S.face.count} face(s).`);
      return;
    }
    case 'objdet|camera_on':
      ensureObjdetLoop(output);
      return;
    case 'objdet|camera_off':
      stopObjdetLoop();
      logOut(output, '[Object] Camera off.');
      return;
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
      runObjDetOnce().catch(() => {});
      logOut(output, `[Object] Analysed (${src}) → ${S.objdet.count} object(s).`);
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
    case 'wifi|connect': {
      const ssid = c || 'MyNetwork';
      const pwd = parts[3] || 'password';
      S.wifi.ssid = ssid;
      S.wifi.password = pwd;
      S.wifi.connected = Math.random() > 0.1; // 90% success rate
      logOut(output, `[WiFi] Connecting to "${ssid}"...${S.wifi.connected ? ' ✓ Connected' : ' ✗ Failed'}`);
      return;
    }
    case 'ts|create':
      logOut(output, '[ThingSpeak] Open https://thingspeak.com and create a new channel. Copy Channel ID and API keys.');
      return;
    case 'ts|connect': {
      S.ts.channelId = c || '123456';
      S.ts.writeKey = parts[3] || 'write_key';
      S.ts.readKey = parts[5] || 'read_key';
      logOut(output, `[ThingSpeak] Connected to channel ${S.ts.channelId}`);
      return;
    }
    case 'ts|send': {
      const value = parseFloat(c) || 0;
      const delay = parseInt(parts[3], 10) || 0;
      S.ts.field1 = value;
      logOut(output, `[ThingSpeak] Sent data: ${value} (delay ${delay}s)`);
      return;
    }
    case 'ts|send_multi': {
      const values = [c, parts[3], parts[5], parts[7], parts[9], parts[11], parts[13], parts[15]].map(v => parseFloat(v) || 0);
      const delay = parseInt(parts[17], 10) || 0;
      values.forEach((val, i) => { S.ts[`field${i+1}`] = val; });
      logOut(output, `[ThingSpeak] Sent ${values.length} data fields (delay ${delay}s)`);
      return;
    }
    case 'ts|get':
      S.ts.lastData = { field1: S.ts.field1, timestamp: new Date().toISOString() };
      logOut(output, '[ThingSpeak] Fetched latest data');
      return;
    case 'http|GET':
    case 'http|POST':
    case 'http|PUT': {
      const method = cmd.toUpperCase();
      const url = c || 'https://api.example.com';
      S.http.method = method;
      S.http.url = url;
      S.http.responseCode = Math.random() > 0.2 ? 200 : 404; // 80% success
      S.http.responseBody = JSON.stringify({ status: S.http.responseCode === 200 ? 'ok' : 'error', timestamp: Date.now() });
      logOut(output, `[HTTP] ${method} ${url} → ${S.http.responseCode}`);
      return;
    }
    case 'http|setbody': {
      S.http.body = c || '{}';
      logOut(output, `[HTTP] Body set: ${S.http.body.substring(0, 50)}...`);
      return;
    }
    case 'http|contenttype': {
      S.http.contentType = c || 'application/json';
      logOut(output, `[HTTP] Content-Type: ${S.http.contentType}`);
      return;
    }
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
    case 'music|drum':
      try {
        const drum = parseInt(c, 10) || 0;
        const beats = parseFloat(d) || 0.5;
        const drumName = S.music.drums[drum] || 'Snare Drum';
        const drumSounds = { 0: 'drum', 1: 'drum', 2: 'drum', 3: 'drum' };
        playBlockSound(drumSounds[drum] || 'drum', { volume: 1.0 });
        logOut(output, `[Music] 🥁 ${drumName}`);
      } catch (e) {
        logOut(output, `[Music Error] ${e.message}`);
      }
      return;
    case 'music|rest': {
      const beats = parseFloat(c) || 0.5;
      logOut(output, `[Music] Rest for ${beats} beat(s)`);
      return;
    }
    case 'music|note':
      try {
        const note = parseInt(c, 10) || 60;
        const beats = parseFloat(d) || 0.5;
        const instrument = Number.isFinite(S.music.instrument) ? S.music.instrument : 0;
        const names = ['Piano', 'Guitar', 'Violin', 'Flute', 'Trumpet', 'Drums'];
        const instName = names[instrument] || 'Piano';
        playInstrumentMidiNote(note, beats, instrument, 0.72);
        logOut(output, `[Music] 🎵 ${instName} note ${note}`);
      } catch (e) {
        logOut(output, `[Music Error] ${e.message}`);
      }
      return;
    case 'music|instrument': {
      S.music.instrument = parseInt(c, 10) || 0;
      const instruments = ['Piano', 'Guitar', 'Violin', 'Flute', 'Trumpet', 'Drums'];
      const instName = instruments[S.music.instrument] || 'Piano';
      logOut(output, `[Music] Instrument set to ${instName}`);
      return;
    }
    case 'music|tempo': {
      S.music.tempo = Math.max(10, Math.min(500, parseInt(c, 10) || 60));
      logOut(output, `[Music] Tempo set to ${S.music.tempo} BPM`);
      return;
    }
    case 'music|tempo_change': {
      const change = parseInt(c, 10) || 0;
      S.music.tempo = Math.max(10, Math.min(500, S.music.tempo + change));
      logOut(output, `[Music] Tempo changed by ${change} → ${S.music.tempo} BPM`);
      return;
    }
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
      const voicePref = d ? String(c || 'auto').toLowerCase() : 'auto';
      const t = d ? parts.slice(3).join('|') : (c || 'Hello');
      try {
        const synth = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
        const Utter = (typeof window !== 'undefined' && window.SpeechSynthesisUtterance) ? window.SpeechSynthesisUtterance : null;
        if (!synth || !Utter) {
          logOut(output, '[TTS] Speech synthesis unavailable in this browser/device.');
          return;
        }

        const pickVoice = (voices) => {
          if (!voices?.length) return null;
          const isChrome =
            typeof navigator !== 'undefined' &&
            /chrome/i.test(navigator.userAgent || '') &&
            !/edg\//i.test(navigator.userAgent || '');
          const matchPref = (v) => {
            const n = String(v?.name || '').toLowerCase();
            const lang = String(v?.lang || '').toLowerCase();
            if (voicePref === 'female') return /(female|woman|zira|susan|samantha|victoria|hazel|aria|jenny|libby|sonia)/.test(n);
            if (voicePref === 'male') return /(male|man|david|mark|daniel|george|james|guy|ryan|brandon)/.test(n);
            if (voicePref === 'uk') return lang.startsWith('en-gb');
            if (voicePref === 'us') return lang.startsWith('en-us');
            if (voicePref === 'google_us') return /google/.test(n) && (lang.startsWith('en-us') || /us english/.test(n));
            if (voicePref === 'google_uk_female') return /google/.test(n) && lang.startsWith('en-gb') && /(female|woman|f\b|uk english female)/.test(n);
            if (voicePref === 'google_uk_male') return /google/.test(n) && lang.startsWith('en-gb') && /(male|man|m\b|uk english male)/.test(n);
            if (voicePref === 'google_au') return /google/.test(n) && (lang.startsWith('en-au') || /australian/.test(n));
            if (voicePref === 'google_india') return /google/.test(n) && (lang.startsWith('en-in') || /india/.test(n));
            if (voicePref === 'en_natural') return lang.startsWith('en-') && /(natural|neural|premium|online)/.test(n);
            return true; // auto
          };
          const findExact = (needle) => voices.find((v) => String(v?.name || '').toLowerCase().includes(needle));
          const googleEnglish = voices.filter((v) => {
            const n = String(v?.name || '').toLowerCase();
            const lang = String(v?.lang || '').toLowerCase();
            return /google/.test(n) && lang.startsWith('en-');
          });
          const needsGoogle =
            voicePref.startsWith('google_') ||
            ['heart', 'bella', 'nicole', 'sarah', 'sky', 'adam', 'michael', 'liam', 'eric', 'emma', 'isabella', 'alice', 'george', 'daniel', 'lewis'].includes(voicePref);

          // Force explicit Google selections first.
          if (voicePref === 'google_us') {
            return (
              findExact('google us english') ||
              googleEnglish.find((v) => String(v?.lang || '').toLowerCase().startsWith('en-us')) ||
              googleEnglish[0] ||
              null
            );
          }
          if (voicePref === 'google_uk_female') {
            return (
              findExact('google uk english female') ||
              findExact('google british english female') ||
              googleEnglish.find((v) => {
                const n = String(v?.name || '').toLowerCase();
                const lang = String(v?.lang || '').toLowerCase();
                return lang.startsWith('en-gb') && /(female|woman)/.test(n);
              }) ||
              googleEnglish.find((v) => String(v?.lang || '').toLowerCase().startsWith('en-gb')) ||
              googleEnglish[0] ||
              null
            );
          }
          if (voicePref === 'google_uk_male') {
            return (
              findExact('google uk english male') ||
              findExact('google british english male') ||
              googleEnglish.find((v) => {
                const n = String(v?.name || '').toLowerCase();
                const lang = String(v?.lang || '').toLowerCase();
                return lang.startsWith('en-gb') && /(male|man)/.test(n);
              }) ||
              googleEnglish.find((v) => String(v?.lang || '').toLowerCase().startsWith('en-gb')) ||
              googleEnglish[0] ||
              null
            );
          }
          if (voicePref === 'google_au') {
            return (
              findExact('google australian english') ||
              googleEnglish.find((v) => String(v?.lang || '').toLowerCase().startsWith('en-au')) ||
              googleEnglish[0] ||
              null
            );
          }
          if (voicePref === 'google_india') {
            return (
              findExact('google indian english') ||
              googleEnglish.find((v) => String(v?.lang || '').toLowerCase().startsWith('en-in')) ||
              googleEnglish[0] ||
              null
            );
          }
          const directByName = new Set([
            'heart', 'bella', 'nicole', 'sarah', 'sky',
            'adam', 'michael', 'liam', 'eric',
            'emma', 'isabella', 'alice', 'george', 'daniel', 'lewis',
          ]);
          if (directByName.has(voicePref)) {
            return (
              googleEnglish.find((v) => {
                const n = String(v?.name || '').toLowerCase();
                return n.includes(voicePref);
              }) ||
              null
            );
          }
          const scoreVoice = (v) => {
            const n = String(v?.name || '').toLowerCase();
            const lang = String(v?.lang || '').toLowerCase();
            let score = 0;

            // Prefer English voices for this app.
            if (lang.startsWith('en-')) score += 30;
            if (lang.startsWith('en-us')) score += 8;
            if (lang.startsWith('en-gb')) score += 8;

            // Prefer high-quality voice families.
            if (/(natural|neural|premium|online)/.test(n)) score += 40;
            if (isChrome && /google/.test(n)) score += 30;

            // Preference bonus within already-filtered candidates.
            if (voicePref === 'female' || voicePref === 'male') score += 10;
            if (voicePref === 'uk' || voicePref === 'us') score += 15;
            if (voicePref === 'auto') score += 12;

            return score;
          };

          // Enforce selected preference first; fallback if that bucket is empty.
          const preferred = voices.filter(matchPref);
          const pool = preferred.length ? preferred : voices;
          // For auto/default behavior in Chrome, prefer Google voices first when present.
          if (voicePref === 'auto' && googleEnglish.length) {
            const rankedGoogle = [...googleEnglish]
              .map((v) => ({ v, s: scoreVoice(v) + 60 }))
              .sort((a, b) => b.s - a.s);
            return rankedGoogle[0]?.v || null;
          }
          // For explicit Google picks, never silently downgrade to non-Google.
          if (needsGoogle && !googleEnglish.length) return null;
          const ranked = [...pool]
            .map((v) => ({ v, s: scoreVoice(v) }))
            .sort((a, b) => b.s - a.s);
          return ranked[0]?.v || null;
        };

        const speakNow = () => {
          const voices = synth.getVoices ? synth.getVoices() : [];
          const u = new Utter(String(t || 'Hello'));
          const picked = pickVoice(voices);
          const requestedGoogle =
            voicePref.startsWith('google_') ||
            ['heart', 'bella', 'nicole', 'sarah', 'sky', 'adam', 'michael', 'liam', 'eric', 'emma', 'isabella', 'alice', 'george', 'daniel', 'lewis'].includes(voicePref);
          if (requestedGoogle && !picked) {
            logOut(output, `[TTS] Google voice "${voicePref}" not found in this Chrome profile. Using browser default.`);
          }
          if (picked) u.voice = picked;
          u.lang = picked?.lang || (voicePref === 'uk' ? 'en-GB' : 'en-US');
          u.rate = 1;
          u.pitch = 1;
          u.volume = 1;
          // Avoid queued silent utterances from previous runs.
          try { synth.cancel(); } catch { /* ignore */ }
          synth.speak(u);
          if (picked) {
            logOut(output, `[TTS] Voice: ${picked.name} (${picked.lang || 'unknown'})`);
          } else {
            logOut(output, '[TTS] Voice: browser default');
            if (voicePref && voicePref !== 'auto') {
              logOut(output, `[TTS] Requested voice "${voicePref}" not available in this browser.`);
            }
          }
        };

        const initialVoices = synth.getVoices ? synth.getVoices() : [];
        const strictVoice =
          voicePref.startsWith('google_') ||
          ['heart', 'bella', 'nicole', 'sarah', 'sky', 'adam', 'michael', 'liam', 'eric', 'emma', 'isabella', 'alice', 'george', 'daniel', 'lewis'].includes(voicePref);
        if ((!initialVoices.length || strictVoice) && 'onvoiceschanged' in synth) {
          let didSpeak = false;
          synth.onvoiceschanged = () => {
            if (didSpeak) return;
            didSpeak = true;
            speakNow();
            synth.onvoiceschanged = null;
          };
          // Wait a moment for voice list before speaking in strict mode.
          setTimeout(() => {
            if (didSpeak) return;
            didSpeak = true;
            speakNow();
            synth.onvoiceschanged = null;
          }, strictVoice ? 1200 : 250);
        } else {
          speakNow();
        }
      } catch (err) {
        logOut(output, `[TTS] Error: ${err?.message || 'unknown error'}`);
      }
      S.tts.last = t;
      logOut(output, `[TTS] Speaking (${voicePref}): ${t}`);
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
    case 'physics|velocity': {
      S.physics.vx = parseFloat(c) || 0;
      S.physics.vy = parseFloat(d) || 0;
      S.physics.enabled = true;
      logOut(output, `[Physics] Velocity (${S.physics.vx}, ${S.physics.vy})`);
      return;
    }
    case 'physics|gravity': {
      S.physics.gravity = Math.max(0, parseFloat(c) || 0.5);
      S.physics.enabled = true;
      logOut(output, `[Physics] Gravity ${S.physics.gravity}`);
      return;
    }
    case 'physics|friction': {
      S.physics.friction = Math.max(0, Math.min(1, parseFloat(c) || 0.95));
      S.physics.enabled = true;
      logOut(output, `[Physics] Friction ${S.physics.friction}`);
      return;
    }
    case 'physics|bounce': {
      S.physics.bounce = Math.max(0, Math.min(1, parseFloat(c) || 0.8));
      S.physics.enabled = true;
      logOut(output, `[Physics] Bounce coefficient ${S.physics.bounce}`);
      return;
    }
    case 'physics|jump': {
      const power = parseFloat(c) || 10;
      S.physics.vy = -Math.abs(power);
      S.physics.enabled = true;
      logOut(output, `[Physics] Jump power ${power}`);
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
    case 'physics.vx':
      return S.physics.vx || 0;
    case 'physics.vy':
      return S.physics.vy || 0;
    case 'physics.gravity':
      return S.physics.gravity || 0.5;
    case 'physics.friction':
      return S.physics.friction || 0.95;
    case 'physics.bounce':
      return S.physics.bounce || 0.8;
    case 'physics.enabled':
      return !!S.physics.enabled;
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

/** Update physics for a sprite (gravity, velocity, friction, collisions) */
export function updateSpritePhysics(sprite, worldWidth, worldHeight) {
  if (!sprite || !S.physics.enabled) return;
  const p = S.physics;
  if (!sprite.vx) sprite.vx = p.vx;
  if (!sprite.vy) sprite.vy = p.vy;
  sprite.vy += p.gravity;
  sprite.vx *= p.friction;
  sprite.vy *= p.friction;
  sprite.x += sprite.vx;
  sprite.y += sprite.vy;
  const w = sprite.width || 20;
  const h = sprite.height || 20;
  if (sprite.y + h / 2 >= (worldHeight || 480)) {
    sprite.y = (worldHeight || 480) - h / 2;
    sprite.vy *= -p.bounce;
    if (Math.abs(sprite.vy) < 0.5) sprite.vy = 0;
  }
  if (sprite.y - h / 2 <= 0) {
    sprite.y = h / 2;
    sprite.vy *= -p.bounce;
  }
  if (sprite.x + w / 2 >= (worldWidth || 480)) {
    sprite.x = (worldWidth || 480) - w / 2;
    sprite.vx *= -p.bounce;
  }
  if (sprite.x - w / 2 <= 0) {
    sprite.x = w / 2;
    sprite.vx *= -p.bounce;
  }
}

export function readExtensionGame(key) {
  return readExtensionKey(key);
}
