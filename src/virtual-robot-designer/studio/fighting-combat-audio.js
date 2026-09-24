/** Web Audio cues for fighting arena — punch, block, hit, rounds, victory */
let _ctx = null;

function ctx() {
  if (!_ctx) {
    try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { /* ignore */ }
  }
  return _ctx;
}

function tone(freq, dur, type = 'sine', gain = 0.1, delay = 0) {
  const ac = ctx();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

function noiseBurst(dur = 0.06, gain = 0.08) {
  const ac = ctx();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  const bufferSize = ac.sampleRate * dur;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  src.connect(g);
  g.connect(ac.destination);
  src.start();
}

export function playJabSound() {
  tone(280, 0.05, 'triangle', 0.09);
  setTimeout(() => tone(420, 0.04, 'sine', 0.06), 15);
}

export function playCrossSound() {
  tone(180, 0.08, 'sawtooth', 0.12);
  noiseBurst(0.05, 0.06);
  setTimeout(() => tone(90, 0.1, 'square', 0.08), 30);
}

export function playHookSound() {
  tone(220, 0.07, 'triangle', 0.1);
  setTimeout(() => tone(160, 0.09, 'sawtooth', 0.09), 25);
}

export function playBlockSound() {
  tone(520, 0.06, 'square', 0.07);
  tone(380, 0.08, 'triangle', 0.05, 0.02);
}

export function playHitSound(heavy = false) {
  noiseBurst(heavy ? 0.12 : 0.07, heavy ? 0.14 : 0.1);
  tone(heavy ? 90 : 140, heavy ? 0.15 : 0.1, 'square', heavy ? 0.12 : 0.09);
}

export function playKnockdownSound() {
  tone(880, 0.2, 'sine', 0.15);
  setTimeout(() => tone(660, 0.25, 'triangle', 0.12), 80);
  setTimeout(() => tone(440, 0.3, 'sine', 0.1), 160);
}

export function playRoundBellSound() {
  [880, 660, 880].forEach((f, i) => {
    setTimeout(() => tone(f, 0.35, 'sine', 0.14), i * 200);
  });
}

export function playVictorySound() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => tone(f, 0.18, 'sine', 0.11), i * 100);
  });
}

export function playDefeatSound() {
  [440, 330, 220].forEach((f, i) => {
    setTimeout(() => tone(f, 0.22, 'triangle', 0.09), i * 130);
  });
}

export function playAdvanceSound() {
  tone(340, 0.05, 'sine', 0.05);
}

export function playKickWhooshSound(heavy = false) {
  if (heavy) {
    tone(180, 0.14, 'sawtooth', 0.06);
    tone(90, 0.18, 'sine', 0.05, 0.02);
    noiseBurst(0.12, 0.04);
  } else {
    tone(240, 0.10, 'sawtooth', 0.05);
    tone(120, 0.12, 'sine', 0.04, 0.01);
    noiseBurst(0.08, 0.03);
  }
}

export function playKickImpactSound(heavy = false) {
  tone(heavy ? 55 : 80, 0.12, 'square', heavy ? 0.14 : 0.10);
  tone(heavy ? 180 : 220, 0.06, 'triangle', 0.06);
  noiseBurst(heavy ? 0.10 : 0.07, heavy ? 0.10 : 0.07);
}

export function playCombatActionSound(actionId) {
  const id = (actionId || '').toLowerCase();
  if (id.includes('kick') || id.includes('roundhouse') || id.includes('sweep')) {
    playKickWhooshSound(id.includes('heavy') || id.includes('roundhouse'));
  } else if (id.includes('cross') || id.includes('heavy') || id.includes('slam')) playCrossSound();
  else if (id.includes('hook') || id.includes('upper')) playHookSound();
  else if (id.includes('block') || id.includes('guard') || id.includes('fortify')) playBlockSound();
  else if (id.includes('advance') || id.includes('retreat') || id.includes('move')) playAdvanceSound();
  else playJabSound();
}
