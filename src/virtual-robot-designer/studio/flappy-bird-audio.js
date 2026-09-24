/** Lightweight Web Audio cues for Flappy BirdBot */
let _ctx = null;

function ctx() {
  if (!_ctx) {
    try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { /* ignore */ }
  }
  return _ctx;
}

function tone(freq, dur, type = 'sine', gain = 0.12) {
  const ac = ctx();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur);
}

export function playFlapSound() {
  tone(520, 0.07, 'triangle', 0.1);
  setTimeout(() => tone(680, 0.05, 'sine', 0.06), 20);
}

export function playScoreSound() {
  tone(880, 0.08, 'sine', 0.14);
  setTimeout(() => tone(1175, 0.1, 'sine', 0.12), 60);
}

export function playCollisionSound() {
  tone(180, 0.12, 'square', 0.15);
  setTimeout(() => tone(90, 0.18, 'sawtooth', 0.1), 40);
}

export function playGameOverSound() {
  [440, 330, 220].forEach((f, i) => {
    setTimeout(() => tone(f, 0.22, 'triangle', 0.1), i * 120);
  });
}

export function playWinSound() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => tone(f, 0.15, 'sine', 0.12), i * 90);
  });
}

export function playBeepSound() {
  tone(740, 0.1, 'square', 0.08);
}
