/**
 * QR Code extension: camera preview on stage, decode, bounding box overlay.
 */
import jsQR from 'jsqr';
import { findGameStageMount } from './gameStageDom.js';

const STAGE_W = 480;
const STAGE_H = 360;

/** True when Game Builder stage is present (video is drawn on the stage canvas, not a floating overlay). */
export function isGameBuilderStageActive() {
  return typeof document !== 'undefined' && Boolean(document.querySelector('[data-bb-game-stage]'));
}

function angleFromJsQrLocation(loc) {
  if (!loc) return 0;
  const dx = loc.topRightCorner.x - loc.topLeftCorner.x;
  const dy = loc.topRightCorner.y - loc.topLeftCorner.y;
  return Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
}

function stagePointFromNorm(nx, ny) {
  return { x: Math.round(nx * STAGE_W), y: Math.round((1 - ny) * STAGE_H) };
}

async function decodeWithBarcodeDetector(source) {
  if (typeof BarcodeDetector === 'undefined') return null;
  try {
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const codes = await detector.detect(source);
    const code = codes?.[0];
    if (!code?.rawValue) return null;
    const box = code.boundingBox || { x: 0, y: 0, width: 1, height: 1 };
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const vw = source.videoWidth || source.width || 640;
    const vh = source.videoHeight || source.height || 480;
    return {
      payload: code.rawValue,
      normX: cx / Math.max(1, vw),
      normY: cy / Math.max(1, vh),
      normW: box.width / Math.max(1, vw),
      normH: box.height / Math.max(1, vh),
      angle: 0,
    };
  } catch {
    return null;
  }
}

function decodeWithJsQr(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });
  if (!code?.data) return null;
  const loc = code.location;
  const cx = (loc.topLeftCorner.x + loc.topRightCorner.x + loc.bottomRightCorner.x + loc.bottomLeftCorner.x) / 4;
  const cy = (loc.topLeftCorner.y + loc.topRightCorner.y + loc.bottomRightCorner.y + loc.bottomLeftCorner.y) / 4;
  return {
    payload: code.data,
    normX: cx / Math.max(1, w),
    normY: cy / Math.max(1, h),
    normW: Math.abs(loc.topRightCorner.x - loc.topLeftCorner.x) / Math.max(1, w),
    normH: Math.abs(loc.bottomLeftCorner.y - loc.topLeftCorner.y) / Math.max(1, h),
    angle: angleFromJsQrLocation(loc),
    corners: loc,
  };
}

/** Apply decode result into extension state (shared by overlay + Game Builder stage). */
export function applyQrDetectionToState(S, result) {
  if (!result?.payload) {
    S.qr.detected = false;
    S.qr.payload = '';
    return false;
  }
  S.qr.detected = true;
  S.qr.payload = result.payload;
  S.qr.normX = result.normX ?? 0.5;
  S.qr.normY = result.normY ?? 0.5;
  S.qr.normW = result.normW ?? 0.2;
  S.qr.normH = result.normH ?? 0.2;
  S.qr.angle = result.angle ?? 0;
  S.qr.lastBox = {
    x: S.qr.normX - S.qr.normW / 2,
    y: S.qr.normY - S.qr.normH / 2,
    w: S.qr.normW,
    h: S.qr.normH,
  };
  const pt = stagePointFromNorm(S.qr.normX, S.qr.normY);
  S.qr.x = pt.x;
  S.qr.y = pt.y;
  return true;
}

/** Decode QR from a canvas or video element; returns detection object or null. */
export async function decodeQrFromSource(source) {
  if (!source) return null;
  let result = await decodeWithBarcodeDetector(source);
  if (result) return result;
  let canvas = source;
  if (source instanceof HTMLVideoElement) {
    const vw = Math.max(1, source.videoWidth || 640);
    const vh = Math.max(1, source.videoHeight || 480);
    canvas = document.createElement('canvas');
    canvas.width = vw;
    canvas.height = vh;
    canvas.getContext('2d', { willReadFrequently: true }).drawImage(source, 0, 0, vw, vh);
  }
  return decodeWithJsQr(canvas);
}

/** Run QR decode on a stage camera frame (Game Builder WebcamManager). */
export async function analyseSourceForQr(S, source, output, logOut) {
  const result = await decodeQrFromSource(source);
  if (result && applyQrDetectionToState(S, result)) {
    logOut(output, `[QR] Detected: ${S.qr.payload.slice(0, 80)}${S.qr.payload.length > 80 ? '…' : ''}`);
    return true;
  }
  if (typeof window !== 'undefined') {
    const pasted = window.prompt('No QR found in frame. Paste QR text to simulate:', S.qr.payload || '');
    if (pasted) {
      applyQrDetectionToState(S, { payload: pasted, normX: 0.5, normY: 0.5, normW: 0.2, normH: 0.2, angle: 0 });
      logOut(output, `[QR] Simulated payload: ${pasted.slice(0, 80)}`);
      return true;
    }
  }
  S.qr.detected = false;
  logOut(output, '[QR] No QR code detected.');
  return false;
}

export function createQrScannerApi(S, TRANSPARENCY_STATE, logOut, setupGlobalDragListeners) {
  function removeQrOverlay() {
    if (S.qr.overlay?.parentNode) S.qr.overlay.parentNode.removeChild(S.qr.overlay);
    S.qr.overlay = null;
    S.qr.wrap = null;
    S.qr.canvas = null;
    S.qr.ctx = null;
  }

  function layoutQrOverlay() {
    const v = S.qr.video;
    const wrap = S.qr.wrap;
    const canvas = S.qr.canvas;
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
    updateQrOverlayPosition();
  }

  function updateQrOverlayPosition() {
    const root = S.qr.overlay;
    if (!root) return;
    const x = S.qr.posX ?? 16;
    const y = S.qr.posY ?? Math.max(16, window.innerHeight - 280);
    root.style.left = `${x}px`;
    root.style.bottom = 'auto';
    root.style.top = `${y}px`;
  }

  function setupQrDrag(setupGlobalDragListeners) {
    const root = S.qr.overlay;
    if (!root || S.qr.dragListeners) return;
    if (typeof setupGlobalDragListeners === 'function') setupGlobalDragListeners();
    S.qr.dragListeners = true;
    const onDown = (e) => {
      const pt = e.touches?.[0] || e;
      S.qr.dragging = true;
      S.qr.dragStartX = pt.clientX - (S.qr.posX ?? 16);
      S.qr.dragStartY = pt.clientY - (S.qr.posY ?? 16);
      root.style.cursor = 'grabbing';
    };
    root.addEventListener('mousedown', onDown);
    root.addEventListener('touchstart', onDown, { passive: true });
  }

  function drawQrOverlay() {
    const { canvas, ctx, video, bboxShow, lastBox } = S.qr;
    if (!canvas || !ctx || !video) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!bboxShow || !lastBox || !S.qr.detected) return;
    const vw = video.videoWidth || 1;
    const vh = video.videoHeight || 1;
    const sx = canvas.width / vw;
    const sy = canvas.height / vh;
    const x = (lastBox.x || 0) * vw * sx;
    const y = (lastBox.y || 0) * vh * sy;
    const w = (lastBox.w || 0.2) * vw * sx;
    const h = (lastBox.h || 0.2) * vh * sy;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.font = 'bold 11px system-ui,sans-serif';
    ctx.fillStyle = 'rgba(127,29,29,0.9)';
    const lab = 'QR';
    const tw = ctx.measureText(lab).width + 6;
    ctx.fillRect(x, Math.max(0, y - 16), tw, 16);
    ctx.fillStyle = '#fecaca';
    ctx.fillText(lab, x + 3, Math.max(11, y - 4));
  }

  function applyDetection(result) {
    const ok = applyQrDetectionToState(S, result);
    drawQrOverlay();
    return ok;
  }

  function setDemoDetection() {
    applyDetection({
      payload: S.qr.payload || 'https://bytebuddies.technology',
      normX: 0.5,
      normY: 0.5,
      normW: 0.25,
      normH: 0.25,
      angle: 0,
    });
  }

  async function runQrAnalyseOnce(output) {
    if (S.qr.demoNoCamera) {
      setDemoDetection();
      logOut(output, `[QR] Demo scan → ${S.qr.payload}`);
      return;
    }
    const v = S.qr.video;
    if (!v || v.readyState < 2) {
      S.qr.detected = false;
      drawQrOverlay();
      logOut(output, '[QR] Camera not ready — turn video on first.');
      return;
    }
    const vw = Math.max(1, v.videoWidth || 640);
    const vh = Math.max(1, v.videoHeight || 480);
    if (!S.qr.detCanvas || S.qr.detCanvas.width !== vw || S.qr.detCanvas.height !== vh) {
      S.qr.detCanvas = document.createElement('canvas');
      S.qr.detCanvas.width = vw;
      S.qr.detCanvas.height = vh;
    }
    await analyseSourceForQr(S, v, null, logOut);
    drawQrOverlay();
  }

  function stopQrLoop(output) {
    S.qr.liveToken += 1;
    if (S.qr.loopId) {
      clearInterval(S.qr.loopId);
      S.qr.loopId = null;
    }
    const v = S.qr.video;
    const stream = v?.srcObject;
    if (stream?.getTracks) stream.getTracks().forEach((t) => t.stop());
    removeQrOverlay();
    S.qr.video = null;
    S.qr.on = false;
    S.qr.cameraOk = false;
    if (output) logOut(output, '[QR] Video off.');
  }

  function ensureQrLoop(output) {
    if (typeof window === 'undefined') return;
    if (isGameBuilderStageActive()) {
      S.qr.on = true;
      logOut(output, '[QR] Video renders on the stage when you press Play.');
      return;
    }
    if (S.qr.loopId || S.qr.initPromise) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      S.qr.demoNoCamera = true;
      S.qr.on = true;
      logOut(output, '[QR] Camera API not available — demo mode.');
      return;
    }
    S.qr.demoNoCamera = false;
    const startToken = S.qr.liveToken;
    S.qr.initPromise = (async () => {
      try {
        logOut(output, '[QR] Requesting camera…');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (startToken !== S.qr.liveToken) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        removeQrOverlay();
        const root = document.createElement('div');
        root.id = 'bb-qr-overlay-root';
        const stageParent = findGameStageMount();
        const positionStyle = stageParent
          ? 'position:absolute;bottom:10px;right:10px;z-index:2000;'
          : 'position:fixed;left:16px;bottom:16px;z-index:11990;';
        root.style.cssText =
          positionStyle + 'border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.55);border:2px solid #b91c1c;background:#0f172a;max-width:min(92vw,320px);touch-action:none;cursor:grab;';
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;display:block;line-height:0;background:#000;';
        const v = document.createElement('video');
        v.playsInline = true;
        v.muted = true;
        v.autoplay = true;
        v.srcObject = stream;
        const opacity = TRANSPARENCY_STATE.qr?.currentOpacity ?? 1;
        v.style.cssText = `display:block;width:100%;height:auto;max-height:220px;opacity:${opacity};`;
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;';
        wrap.appendChild(v);
        wrap.appendChild(canvas);
        root.appendChild(wrap);
        (stageParent || document.body).appendChild(root);
        S.qr.overlay = root;
        S.qr.wrap = wrap;
        S.qr.canvas = canvas;
        S.qr.ctx = canvas.getContext('2d');
        S.qr.video = v;
        S.qr.on = true;
        S.qr.posX = S.qr.posX ?? 16;
        S.qr.posY = S.qr.posY ?? undefined;
        const onReady = () => {
          S.qr.cameraOk = true;
          layoutQrOverlay();
          setupQrDrag(setupGlobalDragListeners);
          drawQrOverlay();
          logOut(output, '[QR] Camera ready on stage. Use “Analyse image” or show bounding box.');
        };
        v.addEventListener('loadeddata', onReady, { once: true });
        v.addEventListener('play', onReady, { once: true });
        S.qr.loopId = window.setInterval(() => {
          if (S.qr.autoScan) runQrAnalyseOnce(null).catch(() => {});
        }, 800);
      } catch (err) {
        S.qr.demoNoCamera = true;
        logOut(output, `[QR] Camera error: ${err.message || err.name}`);
      } finally {
        S.qr.initPromise = null;
      }
    })();
  }

  function readQrPosition(axis, anchor) {
    const ax = String(axis || 'x').toLowerCase();
    const an = String(anchor || 'center').toLowerCase();
    if (!S.qr.detected) return 0;
    const box = S.qr.lastBox || { x: 0.4, y: 0.4, w: 0.2, h: 0.2 };
    let nx = S.qr.normX ?? 0.5;
    let ny = S.qr.normY ?? 0.5;
    if (an.includes('left') || an === 'top left') nx = box.x;
    else if (an.includes('right') || an === 'bottom right') nx = box.x + box.w;
    if (an.includes('top')) ny = box.y;
    else if (an.includes('bottom')) ny = box.y + box.h;
    const pt = stagePointFromNorm(nx, ny);
    return ax === 'y' || ax.includes('y') ? pt.y : pt.x;
  }

  return {
    ensureQrLoop,
    stopQrLoop,
    runQrAnalyseOnce,
    drawQrOverlay,
    layoutQrOverlay,
    removeQrOverlay,
    readQrPosition,
    setDemoDetection,
  };
}
