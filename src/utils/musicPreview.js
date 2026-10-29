/**
 * Instant feedback for the Music blocks in the editor (like Scratch, where clicking
 * a block plays it): picking an instrument plays a short sample, and clicking a
 * Play note / Play drum / Set instrument block plays it.
 *
 * The voices and drums match the ones the game uses when a script runs.
 */

let ctx = null;
const audio = () => {
  try {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
    if (ctx?.state === 'suspended') ctx.resume();
  } catch { /* ignore */ }
  return ctx;
};

// Piano, Guitar, Violin, Flute, Trumpet — same shapes as the game's synth
const VOICES = [
  { wave: 'triangle', attack: 0.005, decay: 0.9, gain: 0.22 },
  { wave: 'sawtooth', attack: 0.004, decay: 0.55, gain: 0.09, filter: 1800 },
  { wave: 'sawtooth', attack: 0.08, decay: 1.2, gain: 0.08, filter: 2600, sustain: true },
  { wave: 'sine', attack: 0.04, decay: 1.2, gain: 0.2, sustain: true },
  { wave: 'square', attack: 0.02, decay: 1, gain: 0.07, filter: 2200, sustain: true },
];

export function previewNote(midi = 60, seconds = 0.35, instrument = 0, delay = 0) {
  const c = audio(); if (!c) return;
  if (instrument === 5) { previewDrum(((Math.round(midi) % 6) + 6) % 6, delay); return; }
  const v = VOICES[instrument] || VOICES[0];
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type = v.wave;
  osc.frequency.setValueAtTime(440 * Math.pow(2, (Number(midi) - 69) / 12), t0);
  let out = osc;
  if (v.filter) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = v.filter; osc.connect(lp); out = lp; }
  const end = t0 + (v.sustain ? seconds : Math.min(seconds, v.decay));
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v.gain, t0 + v.attack);
  if (v.sustain) g.gain.setValueAtTime(v.gain, Math.max(t0 + v.attack, end - 0.06));
  g.gain.exponentialRampToValueAtTime(0.0001, end + 0.04);
  out.connect(g); g.connect(c.destination);
  osc.start(t0); osc.stop(end + 0.06);
}

let noiseBuf = null;
export function previewDrum(index = 0, delay = 0) {
  const c = audio(); if (!c) return;
  if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const base = c.currentTime + delay;
  const noise = (len, type, freq, level, off = 0) => {
    const t0 = base + off; const s = c.createBufferSource(); s.buffer = noiseBuf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = c.createGain(); g.gain.setValueAtTime(level, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t0); s.stop(t0 + len + 0.02);
  };
  const tone = (from, to, len, level, wave = 'sine') => {
    const o = c.createOscillator(); o.type = wave; o.frequency.setValueAtTime(from, base); o.frequency.exponentialRampToValueAtTime(to, base + len);
    const g = c.createGain(); g.gain.setValueAtTime(level, base); g.gain.exponentialRampToValueAtTime(0.0001, base + len);
    o.connect(g); g.connect(c.destination); o.start(base); o.stop(base + len + 0.02);
  };
  switch (Math.floor(Number(index) || 0)) {
    case 1: tone(150, 45, 0.35, 0.9); break;
    case 2: tone(220, 110, 0.3, 0.5); break;
    case 3: noise(1.1, 'highpass', 5000, 0.25); break;
    case 4: noise(0.06, 'highpass', 7000, 0.3); break;
    case 5: [0, 0.03, 0.06].forEach((o) => noise(0.12, 'bandpass', 1200, 0.45, o)); break;
    default: noise(0.18, 'highpass', 1500, 0.4); tone(190, 120, 0.1, 0.35, 'triangle');
  }
}

/** A short "here is what this instrument sounds like" sample: C–E–G, or a drum fill for Drums. */
export function previewInstrument(instrument = 0) {
  const i = Math.floor(Number(instrument) || 0);
  if (i === 5) { [1, 4, 0, 4].forEach((d, k) => previewDrum(d, k * 0.18)); return; }
  [60, 64, 67].forEach((n, k) => previewNote(n, 0.3, i, k * 0.22));
}

/**
 * Blockly change listener: plays Music blocks when they are clicked, and plays an
 * instrument sample when a different instrument is picked.
 */
export function createMusicPreviewListener(Blockly) {
  return (e) => {
    try {
      if (!e || e.isUiEvent === undefined) return;
      const ws = Blockly.Workspace.getById(e.workspaceId);
      const block = e.blockId && ws ? ws.getBlockById(e.blockId) : null;
      if (!block || block.isInFlyout) return;
      const t = block.type;
      if (e.type === Blockly.Events.BLOCK_CHANGE && e.element === 'field') {
        if (t === 'bb_music_instrument' && e.name === 'INSTRUMENT') previewInstrument(e.newValue);
        else if (t === 'bb_music_drum' && e.name === 'DRUM') previewDrum(e.newValue);
        else if (t === 'bb_music_note' && e.name === 'NOTE') previewNote(e.newValue);
        return;
      }
      if (e.type === Blockly.Events.CLICK && e.targetType === 'block') {
        if (t === 'bb_music_instrument') previewInstrument(block.getFieldValue('INSTRUMENT'));
        else if (t === 'bb_music_drum') previewDrum(block.getFieldValue('DRUM'));
        else if (t === 'bb_music_note') previewNote(block.getFieldValue('NOTE'), Math.min(1.5, Number(block.getFieldValue('BEATS')) || 0.5));
      }
    } catch { /* never let a preview break the editor */ }
  };
}
