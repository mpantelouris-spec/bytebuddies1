/**
 * Lighting moods for modes 11–50. When several levels share a world, each one
 * gets its own time of day and colour grade, so no two levels of a robot look
 * alike and none looks like an original mode (those use plain daylight).
 */

export const MOODS = [
  { id: 'dawn', label: 'Dawn', tint: 0xffb3c6, amount: 0.44, light: 0.95 },
  { id: 'golden', label: 'Golden hour', tint: 0xffa64d, amount: 0.46, light: 1.05 },
  { id: 'dusk', label: 'Dusk', tint: 0x6b5bd6, amount: 0.52, light: 0.72 },
  { id: 'overcast', label: 'Cloudy day', tint: 0x9aa7b4, amount: 0.46, light: 0.85 },
  { id: 'spring', label: 'Spring morning', tint: 0x9fe8c4, amount: 0.38, light: 1.0 },
  { id: 'twilight', label: 'Twilight', tint: 0x38b8cc, amount: 0.44, light: 0.82 },
  { id: 'storm', label: 'Stormy', tint: 0x4b5d73, amount: 0.52, light: 0.7 },
  { id: 'rosy', label: 'Rosy afternoon', tint: 0xff8fb1, amount: 0.36, light: 1.02 },
];

export function getMood(index) {
  return MOODS[((Number(index) || 0) % MOODS.length + MOODS.length) % MOODS.length];
}

const toRgb = (c) => {
  if (typeof c === 'string') c = Number.parseInt(c.replace('#', ''), 16);
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
};

/** Blend a colour (number or '#rrggbb') toward the mood, keeping its type. */
export function tint(color, mood, scale = 1) {
  if (color == null || !mood) return color;
  const [r, g, b] = toRgb(color);
  const [tr, tg, tb] = toRgb(mood.tint);
  const k = mood.amount * scale;
  const mix = (a, t) => Math.max(0, Math.min(255, Math.round((a + (t - a) * k) * (0.85 + 0.15 * mood.light))));
  const out = (mix(r, tr) << 16) | (mix(g, tg) << 8) | mix(b, tb);
  return typeof color === 'string' ? `#${out.toString(16).padStart(6, '0')}` : out;
}
