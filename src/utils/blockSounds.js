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
  const aliases = { success: 'win', error: 'lose', beep: 'click' };
  if (aliases[s]) return aliases[s];
  const spaced = String(raw).trim().toLowerCase().replace(/['"]/g, '');
  const hit = BLOCK_SOUND_OPTIONS.find((o) => o.label.toLowerCase() === spaced || o.id === spaced);
  return hit ? hit.id : 'pop';
}

export function setUserSoundVolume01(v) {
  _userVol = typeof v === 'number' && !Number.isNaN(v) ? Math.max(0, Math.min(1, v)) : 1;
}

export function ensureBlockSoundAudio() {
  const ctx = getCtx();
  if (!ctx) return false;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  // Prime the context with a near-silent tick inside user gesture.
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.00001, ctx.currentTime);
    o.frequency.setValueAtTime(220, ctx.currentTime);
    o.connect(g);
    g.connect(out());
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.01);
    track(o);
  } catch {
    /* ignore */
  }
  return true;
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

function beep(ctx, t0, freq, dur, type = 'sine', vol = 0.2, rate = 1) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq * rate, t0);
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
  const rate = typeof opts.playbackRate === 'number'
    ? Math.max(0.25, Math.min(4, opts.playbackRate))
    : 1;
  const now = ctx.currentTime;
  const m = v * 0.35;
  const dest = out();
  if (!dest) return;
  const b = (t0, freq, dur, type, vol) => beep(ctx, t0, freq, dur, type, vol, rate);

  switch (id) {
    case 'pop': {
      noiseBurst(ctx, now, 0.04, 0.22 * v);
      b(now, 600, 0.05, 'triangle', 0.12 * v);
      break;
    }
    case 'click':
      b(now, 2400, 0.02, 'square', 0.08 * v);
      break;
    case 'coin':
      b(now, 988, 0.07, 'sine', 0.18 * m);
      b(now + 0.07, 1318, 0.12, 'sine', 0.2 * m);
      break;
    case 'laser': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(1200 * rate, now);
      o.frequency.exponentialRampToValueAtTime(120 * rate, now + 0.18);
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
      o.frequency.setValueAtTime(180 * rate, now);
      o.frequency.exponentialRampToValueAtTime(520 * rate, now + 0.12);
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
        b(now + i * 0.09, f, 0.14, 'sine', 0.14 * m);
      });
      break;
    case 'lose': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(180 * rate, now);
      o.frequency.exponentialRampToValueAtTime(60 * rate, now + 0.35);
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
      b(now, 90, 0.1, 'sine', 0.25 * m);
      break;
    case 'bell':
      b(now, 784, 0.35, 'sine', 0.12 * m);
      b(now + 0.02, 988, 0.3, 'sine', 0.1 * m);
      break;
    case 'boing': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(320 * rate, now);
      o.frequency.exponentialRampToValueAtTime(90 * rate, now + 0.28);
      o.frequency.exponentialRampToValueAtTime(280 * rate, now + 0.45);
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
      b(now, 2000, 0.04, 'square', 0.06 * v);
      b(now + 0.02, 400, 0.08, 'sawtooth', 0.1 * m);
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
      o.frequency.setValueAtTime(380 * rate, now);
      o.frequency.linearRampToValueAtTime(520 * rate, now + 0.08);
      o.frequency.linearRampToValueAtTime(300 * rate, now + 0.22);
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
      b(now, 440, 0.08, 'sine', 0.12 * m);
  }
}

/**
 * Play a MIDI note using the shared audio context
 * @param midiNote - MIDI note number (0-127)
 * @param durationSeconds - how long to play the note
 * @param volume - 0..1 volume (default 0.3)
 */
export function playMidiNote(midiNote, durationSeconds, volume = 0.3) {
  playInstrumentMidiNote(midiNote, durationSeconds, 0, volume);
}

/**
 * Play a MIDI note with a simple synth timbre per instrument index.
 * Instrument mapping: 0 Piano, 1 Guitar, 2 Violin, 3 Flute, 4 Trumpet, 5 Drums.
 */
export function playInstrumentMidiNote(midiNote, durationSeconds, instrument = 0, volume = 0.3) {
  const ctx = getCtx();
  if (!ctx) return;

  const dest = out();
  if (!dest) return;

  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  const now = ctx.currentTime;
  const dur = Math.max(0.06, Number(durationSeconds) || 0.5);
  const level = Math.max(0.03, Math.min(1, volume * _userVol));
  const inst = Number(instrument) || 0;

  if (inst === 5) {
    playBlockSound('drum', { volume: Math.max(0, Math.min(1, volume * 1.15)) });
    return;
  }

  const scheduleEnv = (gainNode, a, d, s, r, peakMul = 1) => {
    const peak = level * peakMul;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(peak, now + a);
    gainNode.gain.linearRampToValueAtTime(peak * s, now + a + d);
    gainNode.gain.setValueAtTime(peak * s, now + dur);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + dur + r);
  };

  const startVoice = (wave, hz, { a, d, s, r, peakMul = 1, detune = 0, filter } = {}) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(hz, now);
    if (detune) osc.detune.setValueAtTime(detune, now);

    let tail = gain;
    if (filter?.type) {
      const biq = ctx.createBiquadFilter();
      biq.type = filter.type;
      biq.frequency.setValueAtTime(filter.freq || 2000, now);
      if (filter.q != null) biq.Q.setValueAtTime(filter.q, now);
      gain.connect(biq);
      tail = biq;
    }

    scheduleEnv(gain, a, d, s, r, peakMul);
    tail.connect(dest);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + dur + r);
    track(osc);
    return osc;
  };

  // 0 Piano: percussive, bright attack, quick decay.
  if (inst === 0) {
    startVoice('triangle', freq, { a: 0.004, d: 0.12, s: 0.18, r: 0.12, filter: { type: 'lowpass', freq: 3200 } });
    startVoice('sine', freq * 2, { a: 0.003, d: 0.08, s: 0.1, r: 0.08, peakMul: 0.25 });
    return;
  }

  // 1 Guitar: pluck transient + thin body.
  if (inst === 1) {
    noiseBurst(ctx, now, 0.012, 0.06 * level);
    startVoice('sawtooth', freq, { a: 0.0025, d: 0.07, s: 0.08, r: 0.07, filter: { type: 'highpass', freq: 180 } });
    startVoice('triangle', freq * 2, { a: 0.003, d: 0.06, s: 0.06, r: 0.06, peakMul: 0.16, detune: 4 });
    return;
  }

  // 2 Violin: slow bowed attack + vibrato.
  if (inst === 2) {
    const v = startVoice('sawtooth', freq, { a: 0.055, d: 0.06, s: 0.72, r: 0.14, filter: { type: 'lowpass', freq: 3800 } });
    startVoice('triangle', freq * 2, { a: 0.05, d: 0.05, s: 0.4, r: 0.12, peakMul: 0.2 });
    const lfo = ctx.createOscillator();
    const lfg = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.4, now);
    lfg.gain.setValueAtTime(7, now);
    lfo.connect(lfg);
    lfg.connect(v.frequency);
    lfo.start(now + 0.02);
    lfo.stop(now + dur + 0.14);
    track(lfo);
    return;
  }

  // 3 Flute: pure tone + breath noise + gentle vibrato.
  if (inst === 3) {
    noiseBurst(ctx, now, 0.05, 0.02 * level);
    const f = startVoice('sine', freq, { a: 0.03, d: 0.04, s: 0.62, r: 0.12, filter: { type: 'lowpass', freq: 2800 } });
    startVoice('sine', freq * 2, { a: 0.03, d: 0.03, s: 0.28, r: 0.1, peakMul: 0.12 });
    const lfo = ctx.createOscillator();
    const lfg = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4.7, now);
    lfg.gain.setValueAtTime(3, now);
    lfo.connect(lfg);
    lfg.connect(f.frequency);
    lfo.start(now + 0.02);
    lfo.stop(now + dur + 0.12);
    track(lfo);
    return;
  }

  // 4 Trumpet: brassy band-pass with stronger odd harmonics.
  if (inst === 4) {
    const t = startVoice('sawtooth', freq, { a: 0.014, d: 0.07, s: 0.52, r: 0.1, filter: { type: 'bandpass', freq: 1250, q: 1.3 } });
    startVoice('square', freq * 2, { a: 0.012, d: 0.06, s: 0.25, r: 0.08, peakMul: 0.2, filter: { type: 'lowpass', freq: 3200 } });
    const lfo = ctx.createOscillator();
    const lfg = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4.9, now);
    lfg.gain.setValueAtTime(3.5, now);
    lfo.connect(lfg);
    lfg.connect(t.frequency);
    lfo.start(now + 0.02);
    lfo.stop(now + dur + 0.1);
    track(lfo);
    return;
  }

  // Fallback melodic tone.
  startVoice('sine', freq, { a: 0.01, d: 0.07, s: 0.3, r: 0.08 });
}
