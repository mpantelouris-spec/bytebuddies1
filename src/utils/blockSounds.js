/**
 * Scratch-style UI sounds (Web Audio API — no external files).
 */

const activeNodes = new Set();

let _ctx;
let _master;
let _userVol = 1;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _ctx = new AC();
    _master = _ctx.createGain();
    _master.gain.value = 0.85;
    _master.connect(_ctx.destination);
  }
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
  return _ctx;
}

function out() {
  if (!_ctx) return null;
  return _master;
}

function track(node) {
  if (!node) return;
  activeNodes.add(node);
  const done = () => activeNodes.delete(node);
  if (typeof node.onended !== 'undefined') node.onended = done;
  else setTimeout(done, 8000);
}

/** Labels shown in block dropdowns and sidebar hints */
export const BLOCK_SOUND_OPTIONS = [
  { id: 'pop', label: 'Pop' },
  { id: 'click', label: 'Click' },
  { id: 'coin', label: 'Coin' },
  { id: 'laser', label: 'Laser' },
  { id: 'jump', label: 'Jump' },
  { id: 'win', label: 'Win' },
  { id: 'lose', label: 'Lose' },
  { id: 'drum', label: 'Drum' },
  { id: 'bell', label: 'Bell' },
  { id: 'boing', label: 'Boing' },
  { id: 'zap', label: 'Zap' },
  { id: 'whoosh', label: 'Whoosh' },
  { id: 'meow', label: 'Meow' },
];

const IDS = new Set(BLOCK_SOUND_OPTIONS.map((o) => o.id));

export function normalizeSoundId(raw) {
  if (raw == null) return 'pop';
  let s = String(raw).trim().toLowerCase().replace(/['"]/g, '');
  s = s.replace(/\s+/g, '');
  if (IDS.has(s)) return s;
  const spaced = String(raw).trim().toLowerCase().replace(/['"]/g, '');
  const hit = BLOCK_SOUND_OPTIONS.find((o) => o.label.toLowerCase() === spaced || o.id === spaced);
  return hit ? hit.id : 'pop';
}

export function setUserSoundVolume01(v) {
  _userVol = typeof v === 'number' && !Number.isNaN(v) ? Math.max(0, Math.min(1, v)) : 1;
}

export function stopAllBlockSounds() {
  for (const n of activeNodes) {
    try {
      n.stop(0);
    } catch {
      /* already stopped */
    }
    try {
      n.disconnect();
    } catch {
      /* */
    }
  }
  activeNodes.clear();
}

function beep(ctx, t0, freq, dur, type = 'sine', vol = 0.2) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g);
  g.connect(out());
  o.start(t0);
  o.stop(t0 + dur + 0.02);
  track(o);
}

function noiseBurst(ctx, t0, dur, vol = 0.25) {
  const len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(g);
  g.connect(out());
  src.start(t0);
  src.stop(t0 + dur + 0.02);
  track(src);
}

/**
 * Play a named UI sound. @param rawName — block param (e.g. "coin", "Coin")
 * @param opts.volume — 0..1 multiplier (default 1)
 */
export function playBlockSound(rawName, opts = {}) {
  const ctx = getCtx();
  if (!ctx) return;
  const id = normalizeSoundId(rawName);
  const v =
    (typeof opts.volume === 'number' ? Math.max(0, Math.min(1, opts.volume)) : 1) * _userVol;
  const now = ctx.currentTime;
  const m = v * 0.35;
  const dest = out();
  if (!dest) return;

  switch (id) {
    case 'pop': {
      noiseBurst(ctx, now, 0.04, 0.22 * v);
      beep(ctx, now, 600, 0.05, 'triangle', 0.12 * v);
      break;
    }
    case 'click':
      beep(ctx, now, 2400, 0.02, 'square', 0.08 * v);
      break;
    case 'coin':
      beep(ctx, now, 988, 0.07, 'sine', 0.18 * m);
      beep(ctx, now + 0.07, 1318, 0.12, 'sine', 0.2 * m);
      break;
    case 'laser': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(1200, now);
      o.frequency.exponentialRampToValueAtTime(120, now + 0.18);
      g.gain.setValueAtTime(0.12 * m, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      o.connect(g);
      g.connect(out());
      o.start(now);
      o.stop(now + 0.22);
      track(o);
      break;
    }
    case 'jump': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(180, now);
      o.frequency.exponentialRampToValueAtTime(520, now + 0.12);
      g.gain.setValueAtTime(0.2 * m, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      o.connect(g);
      g.connect(out());
      o.start(now);
      o.stop(now + 0.18);
      track(o);
      break;
    }
    case 'win':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        beep(ctx, now + i * 0.09, f, 0.14, 'sine', 0.14 * m);
      });
      break;
    case 'lose': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(180, now);
      o.frequency.exponentialRampToValueAtTime(60, now + 0.35);
      g.gain.setValueAtTime(0.15 * m, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      o.connect(g);
      g.connect(out());
      o.start(now);
      o.stop(now + 0.42);
      track(o);
      break;
    }
    case 'drum':
      noiseBurst(ctx, now, 0.12, 0.35 * v);
      beep(ctx, now, 90, 0.1, 'sine', 0.25 * m);
      break;
    case 'bell':
      beep(ctx, now, 784, 0.35, 'sine', 0.12 * m);
      beep(ctx, now + 0.02, 988, 0.3, 'sine', 0.1 * m);
      break;
    case 'boing': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(320, now);
      o.frequency.exponentialRampToValueAtTime(90, now + 0.28);
      o.frequency.exponentialRampToValueAtTime(280, now + 0.45);
      g.gain.setValueAtTime(0.22 * m, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      o.connect(g);
      g.connect(out());
      o.start(now);
      o.stop(now + 0.55);
      track(o);
      break;
    }
    case 'zap':
      noiseBurst(ctx, now, 0.06, 0.15 * v);
      beep(ctx, now, 2000, 0.04, 'square', 0.06 * v);
      beep(ctx, now + 0.02, 400, 0.08, 'sawtooth', 0.1 * m);
      break;
    case 'whoosh':
      noiseBurst(ctx, now, 0.25, 0.2 * v);
      break;
    case 'meow': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(380, now);
      o.frequency.linearRampToValueAtTime(520, now + 0.08);
      o.frequency.linearRampToValueAtTime(300, now + 0.22);
      lfo.frequency.value = 6;
      lg.gain.value = 40;
      lfo.connect(lg);
      lg.connect(o.frequency);
      g.gain.setValueAtTime(0.15 * m, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      o.connect(g);
      g.connect(out());
      lfo.start(now);
      o.start(now);
      lfo.stop(now + 0.3);
      o.stop(now + 0.3);
      track(o);
      track(lfo);
      break;
    }
    default:
      beep(ctx, now, 440, 0.08, 'sine', 0.12 * m);
  }
}
