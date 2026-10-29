import {
  playBlockSound,
  stopAllBlockSounds,
  setUserSoundVolume01,
} from './blockSounds';
import { librarySoundDuration } from '../data/soundLibrary';
import { getFlowContext, setWaitSeconds } from './controlFlowRuntime';

/** @returns {{ volume: number, effects: Record<string, number> }} */
export function getSpriteSoundState(sprite) {
  if (!sprite._sound) {
    sprite._sound = { volume: 100, effects: { pitch: 0, pan: 0 } };
  }
  return sprite._sound;
}

export function applyGlobalVolumeFromPercent(pct) {
  const n = typeof pct === 'number' ? pct : parseFloat(pct);
  const vol = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 100;
  setUserSoundVolume01(vol / 100);
  return vol;
}

/** Rough duration for "until done" waits (seconds). */
export function estimateSoundDurationSec(name) {
  return librarySoundDuration(name, 0.2);
}

/**
 * Play a named sound using sprite volume + pitch effect.
 * @param {object} sprite
 * @param {string} rawName
 * @param {{ wait?: boolean }} opts
 */
const customAudioPlayers = new Set();

function findSpriteSound(sprite, rawName) {
  const list = sprite?.sounds;
  if (!Array.isArray(list) || !list.length) return null;
  const raw = String(rawName || '').trim().toLowerCase();
  return list.find((s) => String(s.name || s.id || '').toLowerCase() === raw) || null;
}

function playCustomDataUrl(dataUrl, volume01, rate) {
  try {
    const audio = new Audio(dataUrl);
    audio.volume = Math.max(0, Math.min(1, volume01));
    audio.playbackRate = rate;
    customAudioPlayers.add(audio);
    audio.onended = () => customAudioPlayers.delete(audio);
    audio.onerror = () => customAudioPlayers.delete(audio);
    audio.play().catch(() => customAudioPlayers.delete(audio));
  } catch {
    /* ignore */
  }
}

export function playSpriteSound(sprite, rawName) {
  const st = getSpriteSoundState(sprite);
  applyGlobalVolumeFromPercent(st.volume);
  const pitch = st.effects?.pitch || 0;
  const rate = Math.max(0.25, Math.min(4, 1 + pitch / 100));
  const custom = findSpriteSound(sprite, rawName);
  if (custom?.dataUrl) {
    playCustomDataUrl(custom.dataUrl, (st.volume ?? 100) / 100, rate);
    return custom.duration || 1;
  }
  playBlockSound(custom?.id || rawName, { playbackRate: rate });
  return estimateSoundDurationSec(custom?.id || rawName);
}

/** Play once, then yield the script thread until the sound has finished. */
export function playSpriteSoundUntilDone(sprite, rawName, thread) {
  const flow = getFlowContext(sprite, thread);
  if (flow.soundWaitPending) {
    flow.soundWaitPending = false;
    flow.waitEndTime = null;
    return false;
  }

  setWaitSeconds(flow, playSpriteSound(sprite, rawName));
  flow.soundWaitPending = true;
  return true;
}

export function stopSpriteSounds() {
  stopAllBlockSounds();
  customAudioPlayers.forEach((a) => {
    try { a.pause(); a.src = ''; } catch { /* ignore */ }
  });
  customAudioPlayers.clear();
}

/**
 * Apply sound stack blocks immediately (live Blockly edits while playing).
 */
export function runSoundBlocksOnSprite(sprite, blocks) {
  if (!sprite || !Array.isArray(blocks)) return false;
  let changed = false;
  const num = (v, d = 0) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : d;
  };
  const st = getSpriteSoundState(sprite);

  for (const b of blocks) {
    const p = b.params || {};
    switch (b.type) {
      case 'sound-play':
        playSpriteSound(sprite, p.sound ?? 'pop');
        changed = true;
        break;
      case 'sound-play-until-done':
        playSpriteSound(sprite, p.sound ?? 'pop');
        changed = true;
        break;
      case 'sound-stop':
        stopSpriteSounds();
        changed = true;
        break;
      case 'sound-set-volume':
        st.volume = Math.max(0, Math.min(100, num(p.volume, 100)));
        applyGlobalVolumeFromPercent(st.volume);
        changed = true;
        break;
      case 'sound-change-effect':
      case 'sound-set-effect': {
        const effect = String(p.effect || 'pitch').toLowerCase();
        if (b.type === 'sound-change-effect') {
          st.effects[effect] = (st.effects[effect] || 0) + num(p.value, 10);
        } else {
          st.effects[effect] = num(p.value, 0);
        }
        changed = true;
        break;
      }
      case 'sound-clear-effects':
        st.effects = { pitch: 0, pan: 0 };
        changed = true;
        break;
      default:
        break;
    }
  }
  return changed;
}

export function getSpriteVolumeReporter(sprite) {
  return getSpriteSoundState(sprite).volume;
}

export function isSoundBlockType(type) {
  return typeof type === 'string' && (
    type.startsWith('sound-')
    || type === 'bb_sound_play'
    || type === 'bb_sound_stop'
  );
}
