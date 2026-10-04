/**
 * Game Builder runtime for extension palette blocks (pen, TTS, weather, hardware, AI helpers).
 */
import { runExtensionGame, readExtensionGame } from './extensionEngine';
import { EXTENSION_SHORT_TO_BLOCKLY } from './extensionBlockMaps';

export function ensurePenState(sprite) {
  if (!sprite._pen) {
    sprite._pen = { down: false, color: '#22c55e', size: 3, trail: [] };
  }
  return sprite._pen;
}

export function recordPenPoint(sprite) {
  const pen = sprite?._pen;
  if (!pen?.down) return;
  const cx = (sprite.x || 0) + (sprite.w || 0) / 2;
  const cy = (sprite.y || 0) + (sprite.h || 0) / 2;
  const last = pen.trail[pen.trail.length - 1];
  if (last && Math.hypot(last.x - cx, last.y - cy) < 0.8) return;
  pen.trail.push({ x: cx, y: cy, color: pen.color, size: pen.size });
}

export function drawPenTrails(ctx, sprites) {
  if (!ctx) return;
  for (const sprite of sprites || []) {
    const trail = sprite._pen?.trail;
    if (!trail || trail.length < 2) continue;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < trail.length; i += 1) {
      const a = trail[i - 1];
      const b = trail[i];
      ctx.strokeStyle = b.color || '#22c55e';
      ctx.lineWidth = Math.max(1, b.size || 3);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function say(sprite, text) {
  if (!sprite) return;
  const msg = String(text ?? '').slice(0, 140);
  if (!msg) return;
  sprite._sayText = msg;
  sprite._sayUntil = Date.now() + 2400;
}

function speak(text) {
  try {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(String(text || 'Hello'));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

const ALIAS = {
  'face-analyze': 'face-analyse-camera',
  'face-analyse-camera': 'face-analyse-camera',
  'object-analyze': 'object-analyse-camera',
  'object-analyse-camera': 'object-analyse-camera',
  'ic-classify': 'ic-analyse',
  'pen-erase': 'pen-clear',
  'pen-set-color': 'pen-color',
  'pen-set-size': 'pen-size',
};

function canonical(type) {
  return ALIAS[type] || type;
}

export function isExtensionGameType(type) {
  const t = String(type || '');
  if (!t) return false;
  if (EXTENSION_SHORT_TO_BLOCKLY[t] || EXTENSION_SHORT_TO_BLOCKLY[canonical(t)]) return true;
  return /^(face|object|body|qr|pen|tts|speech|ic|pc|ac|tc|ml|nlp|ocr|chat|weather|arduino|microbit|motor|quarky|video|iot|esp32|servo|sensor|lcd|oled|gamepad|cloud|img|emotion|hand|translate|hw|3d)-/.test(t);
}

export function readExtensionReporter(type, params = {}, sprite) {
  const t = canonical(type);
  switch (t) {
    case 'face-count':
    case 'face-visible':
    case 'face-happy':
    case 'face-expression':
    case 'face-x':
    case 'face-y':
    case 'face-size':
      return sprite?._ext?.[t] ?? (t === 'face-visible' || t === 'face-happy' ? false : (t === 'face-expression' ? '' : 0));
    case 'object-count':
    case 'object-person-count':
      return sprite?._ext?.[t] ?? 0;
    case 'object-person-detected':
      return sprite?._ext?.[t] ?? false;
    case 'object-class':
      return sprite?._ext?.[t] ?? '';
    case 'speech-heard':
      return sprite?._ext?.['speech-heard'] ?? '';
    case 'translate-result':
    case 'ocr-text':
    case 'ac-label':
    case 'tc-label':
    case 'ic-top-class':
    case 'pc-pose-name':
      return sprite?._ext?.[t] ?? '';
    case 'ic-confidence':
    case 'pc-confidence':
    case 'tc-confidence':
      return sprite?._ext?.[t] ?? 0;
    case 'nlp-sentiment-val':
      return sprite?._ext?.[t] ?? 0.5;
    case 'nlp-positive':
      return sprite?._ext?.[t] ?? true;
    case 'weather-temp':
      return sprite?._ext?.[t] ?? Number(readExtensionGame('weather.temp') || 18);
    case 'weather-cond':
      return sprite?._ext?.[t] ?? String(readExtensionGame('weather.cond') || 'clear');
    case 'qr-detected':
      return !!readExtensionGame('qr.detected');
    case 'qr-data':
      return String(readExtensionGame('qr.payload') || '');
    default:
      return undefined;
  }
}

function stampExt(sprite, key, value) {
  if (!sprite._ext) sprite._ext = {};
  sprite._ext[key] = value;
  return value;
}

export function executeExtensionGameBlock(block, sprite, ctx = {}) {
  if (!block?.type || !sprite) return false;
  const type = canonical(block.type);
  const p = block.params || {};
  const txt = (v, d = '') => String(v ?? d);
  const num = (v, d = 0) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : d;
  };

  switch (type) {
    case 'pen-down': {
      const pen = ensurePenState(sprite);
      pen.down = true;
      recordPenPoint(sprite);
      runExtensionGame('pen|down', sprite);
      say(sprite, 'Pen down');
      return true;
    }
    case 'pen-up': {
      const pen = ensurePenState(sprite);
      pen.down = false;
      runExtensionGame('pen|up', sprite);
      say(sprite, 'Pen up');
      return true;
    }
    case 'pen-clear': {
      const pen = ensurePenState(sprite);
      pen.trail = [];
      runExtensionGame('pen|clear', sprite);
      say(sprite, 'Pen cleared');
      return true;
    }
    case 'pen-color': {
      const pen = ensurePenState(sprite);
      pen.color = txt(p.color || p.COLOR, '#22c55e');
      runExtensionGame(`pen|color|${pen.color}`, sprite);
      say(sprite, `Pen ${pen.color}`);
      return true;
    }
    case 'pen-size': {
      const pen = ensurePenState(sprite);
      pen.size = num(p.size || p.SIZE, 3);
      say(sprite, `Pen size ${pen.size}`);
      return true;
    }
    case 'pen-stamp':
      say(sprite, 'Stamp');
      return true;
    case 'tts-speak': {
      const text = txt(p.text || p.TEXT || p.message, 'Hello from ByteBuddies');
      speak(text);
      runExtensionGame(`tts|speak|${text}`, sprite);
      say(sprite, text);
      return true;
    }
    case 'speech-listen':
      runExtensionGame('speech|listen', sprite);
      stampExt(sprite, 'speech-heard', 'hello');
      say(sprite, 'Listening… (hello)');
      return true;
    case 'speech-heard':
      say(sprite, stampExt(sprite, 'speech-heard', sprite._ext?.['speech-heard'] || 'hello'));
      return true;
    case 'translate-text': {
      const text = txt(p.text, 'Hello');
      stampExt(sprite, 'translate-result', text);
      runExtensionGame(`translate|${text}`, sprite);
      say(sprite, `Translate: ${text}`);
      return true;
    }
    case 'translate-result':
      say(sprite, sprite._ext?.['translate-result'] || '');
      return true;
    case 'ocr-scan':
      runExtensionGame('ocr|scan', sprite);
      stampExt(sprite, 'ocr-text', 'scanned text');
      say(sprite, 'OCR scan');
      return true;
    case 'ocr-text':
      say(sprite, sprite._ext?.['ocr-text'] || '');
      return true;
    case 'chat-ask':
      runExtensionGame('chat|ask|' + txt(p.question || p.QUESTION, 'How do I move the sprite?'), sprite);
      return true;
    case 'ml-train':
      runExtensionGame('ml|train', sprite);
      return true;
    case 'ml-training-open':
      runExtensionGame('ml|training_open', sprite);
      return true;
    case 'ic-camera-on':
    case 'pc-camera-on':
      ctx.ensureCameraOn?.(type, sprite);
      ctx.setCameraOn?.(true);
      say(sprite, 'Camera on');
      return true;
    case 'pc-camera-off':
      ctx.setCameraOn?.(false);
      say(sprite, 'Camera off');
      return true;
    case 'ic-analyse':
      runExtensionGame('ic|classify', sprite);
      stampExt(sprite, 'ic-top-class', 'object');
      stampExt(sprite, 'ic-confidence', 0.8);
      say(sprite, 'Class: object');
      return true;
    case 'pc-capture':
      runExtensionGame('pc|capture', sprite);
      stampExt(sprite, 'pc-pose-name', 'standing');
      say(sprite, 'Pose captured');
      return true;
    case 'ac-classify':
      runExtensionGame('ac|classify', sprite);
      stampExt(sprite, 'ac-label', 'clap');
      say(sprite, 'Sound: clap');
      return true;
    case 'tc-add':
      say(sprite, 'Training example added');
      return true;
    case 'tc-classify':
      stampExt(sprite, 'tc-label', 'happy');
      stampExt(sprite, 'tc-confidence', 0.7);
      say(sprite, 'Text: happy');
      return true;
    case 'nlp-sentiment':
      stampExt(sprite, 'nlp-sentiment-val', 0.8);
      stampExt(sprite, 'nlp-positive', true);
      say(sprite, 'Positive');
      return true;
    case 'weather-city':
      runExtensionGame('weather|fetch|' + txt(p.city, 'London'), sprite);
      say(sprite, txt(p.city, 'London'));
      return true;
    case 'weather-temp':
      say(sprite, `${readExtensionReporter('weather-temp', p, sprite)}°`);
      return true;
    case 'weather-cond':
      say(sprite, readExtensionReporter('weather-cond', p, sprite));
      return true;
    case 'face-show-box':
    case 'object-show-box':
    case 'qr-bounding-box':
      say(sprite, 'Boxes on');
      return true;
    case 'face-hide-box':
    case 'object-hide-box':
      say(sprite, 'Boxes off');
      return true;
    case 'face-threshold':
    case 'object-threshold':
      say(sprite, `Threshold ${num(p.threshold ?? p.THRESHOLD, 0.5)}`);
      return true;
    case 'face-analyse-camera':
    case 'face-analyse-stage':
      ctx.ensureCameraOn?.(type, sprite);
      stampExt(sprite, 'face-count', 1);
      stampExt(sprite, 'face-visible', true);
      say(sprite, 'Face scan');
      return true;
    case 'object-analyse-camera':
    case 'object-analyse-stage':
      ctx.ensureCameraOn?.(type, sprite);
      stampExt(sprite, 'object-count', 1);
      stampExt(sprite, 'object-class', 'person');
      say(sprite, 'Object scan');
      return true;
    case 'body-video-on':
    case 'body-show-detections':
    case 'body-analyse':
      ctx.ensureCameraOn?.(type, sprite);
      ctx.setCameraOn?.(true);
      say(sprite, 'Body camera');
      return true;
    case 'arduino-digital':
    case 'arduino-analog':
    case 'arduino-read-digital':
    case 'arduino-read-analog':
    case 'arduino-servo':
    case 'arduino-buzzer':
    case 'arduino-pwm':
    case 'arduino-tone':
      runExtensionGame(`arduino|${type.replace('arduino-', '').replace(/-/g, '_')}`, sprite);
      say(sprite, 'Arduino');
      return true;
    case 'microbit-display':
      runExtensionGame('microbit|display|' + txt(p.text, 'Hi'), sprite);
      say(sprite, txt(p.text, 'Hi'));
      return true;
    case 'motor-forward':
    case 'motor-backward':
    case 'motor-turn-left':
    case 'motor-turn-right':
    case 'quarky-move':
    case 'quarky-turn':
    case 'quarky-stop':
      runExtensionGame('motor|forward|80|1', sprite);
      sprite.x = (sprite.x || 0) + (type.includes('back') ? -12 : 12);
      say(sprite, 'Motor');
      return true;
    default:
      if (!isExtensionGameType(block.type) && !isExtensionGameType(type)) return false;
      runExtensionGame(String(type).replace(/-/g, '|'), sprite);
      const reported = readExtensionReporter(type, p, sprite);
      if (reported !== undefined && reported !== false) say(sprite, reported);
      else if (!sprite._sayText) say(sprite, type.replace(/-/g, ' '));
      return true;
  }
}
