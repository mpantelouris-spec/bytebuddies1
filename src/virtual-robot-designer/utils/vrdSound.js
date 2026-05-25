/** Lazy Tone.js UI feedback — respects user sound setting */
import VirtualRobotDB from '../database/virtual-robot-db.js';

let started = false;
let synth = null;
let noise = null;

async function ensureAudio() {
  if (started) return true;
  try {
    const Tone = await import('tone');
    await Tone.start();
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.08, sustain: 0.05, release: 0.12 },
    }).toDestination();
    synth.volume.value = -14;
    noise = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0 },
    }).toDestination();
    noise.volume.value = -22;
    started = true;
    return true;
  } catch {
    return false;
  }
}

function soundEnabled() {
  const settings = VirtualRobotDB.getSettings();
  return settings.soundEffects !== false;
}

export async function playVrdSound(type = 'click') {
  if (!soundEnabled()) return;
  const ok = await ensureAudio();
  if (!ok || !synth) return;
  const now = synth.context.currentTime;
  const tones = {
    click: [['C5', 0.04]],
    snap: [['E5', 0.06], ['G5', 0.08]],
    success: [['C5', 0.05], ['E5', 0.05], ['G5', 0.1]],
    error: [['A3', 0.12]],
    hover: [['G4', 0.02]],
    save: [['D5', 0.06], ['A5', 0.12]],
    undo: [['F4', 0.05]],
  };
  const seq = tones[type] || tones.click;
  seq.forEach(([note, dur], i) => {
    synth.triggerAttackRelease(note, dur, now + i * 0.05);
  });
  if (type === 'snap' && noise) noise.triggerAttackRelease('0.04', now);
  if (type === 'error' && noise) noise.triggerAttackRelease('0.08', now);
}

export function playVrdSoundSync(type) {
  playVrdSound(type).catch(() => {});
}
