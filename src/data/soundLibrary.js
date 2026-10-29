/** Browseable Game Builder sound library (Web Audio ids — no audio files). */

export const SOUND_LIBRARY = [
  {
    category: 'Animals',
    items: [
      { id: 'meow', label: 'Meow', icon: '🐱', duration: 0.30 },
      { id: 'bark', label: 'Bark', icon: '🐶', duration: 0.28 },
      { id: 'chirp', label: 'Chirp', icon: '🐦', duration: 0.22 },
      { id: 'horse', label: 'Horse', icon: '🐴', duration: 0.45 },
      { id: 'frog', label: 'Frog', icon: '🐸', duration: 0.32 },
      { id: 'duck', label: 'Duck', icon: '🦆', duration: 0.28 },
      { id: 'roar', label: 'Roar', icon: '🦁', duration: 0.55 },
      { id: 'buzz', label: 'Buzz', icon: '🐝', duration: 0.40 },
    ],
  },
  {
    category: 'Effects',
    items: [
      { id: 'pop', label: 'Pop', icon: '🫧', duration: 0.07 },
      { id: 'click', label: 'Click', icon: '🔘', duration: 0.04 },
      { id: 'boing', label: 'Boing', icon: '🪀', duration: 0.55 },
      { id: 'whoosh', label: 'Whoosh', icon: '💨', duration: 0.27 },
      { id: 'zap', label: 'Zap', icon: '⚡', duration: 0.10 },
      { id: 'laser', label: 'Laser', icon: '🔫', duration: 0.22 },
      { id: 'splash', label: 'Splash', icon: '💦', duration: 0.32 },
      { id: 'crash', label: 'Crash', icon: '💥', duration: 0.38 },
      { id: 'magic', label: 'Magic', icon: '✨', duration: 0.48 },
    ],
  },
  {
    category: 'Game',
    items: [
      { id: 'coin', label: 'Coin', icon: '🪙', duration: 0.21 },
      { id: 'jump', label: 'Jump', icon: '⬆️', duration: 0.18 },
      { id: 'win', label: 'Win', icon: '🏆', duration: 0.43 },
      { id: 'lose', label: 'Lose', icon: '💀', duration: 0.42 },
      { id: 'powerup', label: 'Power up', icon: '⭐', duration: 0.42 },
      { id: 'hit', label: 'Hit', icon: '🥊', duration: 0.16 },
      { id: 'extra-life', label: 'Extra life', icon: '❤️', duration: 0.50 },
      { id: 'game-over', label: 'Game over', icon: '🎮', duration: 0.62 },
    ],
  },
  {
    category: 'Percussion',
    items: [
      { id: 'drum', label: 'Drum', icon: '🥁', duration: 0.14 },
      { id: 'kick', label: 'Kick', icon: '👟', duration: 0.16 },
      { id: 'snare', label: 'Snare', icon: '🥁', duration: 0.14 },
      { id: 'hihat', label: 'Hi-hat', icon: '🎩', duration: 0.08 },
      { id: 'clap', label: 'Clap', icon: '👏', duration: 0.14 },
      { id: 'cymbal', label: 'Cymbal', icon: '🔔', duration: 0.55 },
      { id: 'tom', label: 'Tom', icon: '🪘', duration: 0.22 },
      { id: 'woodblock', label: 'Wood block', icon: '🪵', duration: 0.10 },
    ],
  },
  {
    category: 'Music',
    items: [
      { id: 'bell', label: 'Bell', icon: '🔔', duration: 0.37 },
      { id: 'piano', label: 'Piano', icon: '🎹', duration: 0.45 },
      { id: 'fanfare', label: 'Fanfare', icon: '🎺', duration: 0.70 },
      { id: 'chime', label: 'Chime', icon: '🎐', duration: 0.55 },
      { id: 'guitar', label: 'Guitar', icon: '🎸', duration: 0.40 },
      { id: 'synth', label: 'Synth', icon: '🎛️', duration: 0.50 },
      { id: 'arp', label: 'Arp', icon: '🎶', duration: 0.48 },
    ],
  },
  {
    category: 'People',
    items: [
      { id: 'laugh', label: 'Laugh', icon: '😄', duration: 0.45 },
      { id: 'cheer', label: 'Cheer', icon: '🎉', duration: 0.55 },
      { id: 'aww', label: 'Aww', icon: '🥺', duration: 0.38 },
      { id: 'footstep', label: 'Footstep', icon: '👣', duration: 0.16 },
    ],
  },
  {
    category: 'Nature',
    items: [
      { id: 'rain', label: 'Rain', icon: '🌧️', duration: 0.70 },
      { id: 'wind', label: 'Wind', icon: '🌬️', duration: 0.65 },
      { id: 'waves', label: 'Waves', icon: '🌊', duration: 0.70 },
      { id: 'thunder', label: 'Thunder', icon: '⛈️', duration: 0.70 },
    ],
  },
  {
    category: 'Alerts',
    items: [
      { id: 'beep', label: 'Beep', icon: '📟', duration: 0.12 },
      { id: 'alarm', label: 'Alarm', icon: '🚨', duration: 0.55 },
      { id: 'ding', label: 'Ding', icon: '🛎️', duration: 0.28 },
      { id: 'buzzer', label: 'Buzzer', icon: '📢', duration: 0.32 },
    ],
  },
];

export const SOUND_LIBRARY_ITEMS = SOUND_LIBRARY.flatMap((cat) => (
  cat.items.map((item) => ({ ...item, category: cat.category }))
));

const BY_ID = new Map(SOUND_LIBRARY_ITEMS.map((s) => [s.id, s]));
const BY_LABEL = new Map(SOUND_LIBRARY_ITEMS.map((s) => [s.label.toLowerCase(), s]));

export function findLibrarySound(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const id = s.toLowerCase().replace(/\s+/g, '-').replace(/['"]/g, '');
  return BY_ID.get(id) || BY_ID.get(s.toLowerCase().replace(/\s+/g, '')) || BY_LABEL.get(s.toLowerCase()) || null;
}

export function librarySoundDuration(raw, fallback = 0.2) {
  return findLibrarySound(raw)?.duration ?? fallback;
}

export function nextSurpriseSound(existing) {
  const used = new Set((existing || []).map((s) => String(s.id || s.name || '').toLowerCase()));
  const unused = SOUND_LIBRARY_ITEMS.filter((s) => !used.has(s.id) && !used.has(s.label.toLowerCase()));
  const pool = unused.length ? unused : SOUND_LIBRARY_ITEMS;
  return pool[Math.floor(Math.random() * pool.length)];
}
