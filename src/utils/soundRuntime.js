import {
  playBlockSound,
  stopAllBlockSounds,
  setUserSoundVolume01,
  normalizeSoundId,
} from './blockSounds';

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
  const id = normalizeSoundId(name);
  const long = new Set(['win', 'lose', 'meow', 'boing', 'bell']);
  return long.has(id) ? 0.55 : 0.22;
}

/**
 * Play a named sound using sprite volume + pitch effect.
 * @param {object} sprite
 * @param {string} rawName
 * @param {{ wait?: boolean }} opts
 */
export function playSpriteSound(sprite, rawName, opts = {}) {
  const st = getSpriteSoundState(sprite);
  applyGlobalVolumeFromPercent(st.volume);
  const pitch = st.effects?.pitch || 0;
  const rate = Math.max(0.25, Math.min(4, 1 + pitch / 100));
  playBlockSound(rawName, { volume: st.volume / 100, playbackRate: rate });
  if (opts.wait) {
    sprite._waitUntil = Date.now() + estimateSoundDurationSec(rawName) * 1000;
  }
}

export function stopSpriteSounds() {
  stopAllBlockSounds();
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
        playSpriteSound(sprite, p.sound ?? 'pop', { wait: true });
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
