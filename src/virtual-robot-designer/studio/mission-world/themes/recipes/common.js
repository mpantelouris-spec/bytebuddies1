/**
 * Shared layer bundles for mission theme recipes.
 * Layer keys: p = prop, at = near|area|ring|hero|sky|float, n = count (or step metres for `near`),
 * r = distance range (beyond the road edge for `near`, beyond the route's radius otherwise),
 * s = scale range, y = height range, o = prop options, v = option variants, face = road|center|out|random.
 */
export const clouds = (n = 14, o = {}) => ({ p: 'cloud', at: 'sky', n, r: [0, 150], y: [30, 60], s: [1.3, 2.4], o });
export const mountains = (color = 0x8fa8d0, n = 9, o = {}) => ({ p: 'mountain', at: 'ring', n, r: [115, 170], s: [1.3, 2], o: { color, ...o } });
export const hills = (colors = [0x7fd66a, 0x5fc05a], n = 10, r = [55, 95]) => ({ p: 'hill', at: 'ring', n, r, s: [1, 1.5], v: colors.map((color) => ({ color })) });
export const trees = (p, n, r = [4, 40], s = [1, 1.5], v) => ({ p, at: 'area', n, r, s, ...(v ? { v } : {}) });
export const skyline = (n = 16, lit = false, r = [42, 75]) => ({
  p: 'tower', at: 'ring', n, r, s: [1, 1.7], face: 'center',
  v: [{ lit }, { lit, color: 0xffc2a8 }, { lit, color: 0xc6b4ff }, { lit, color: 0xa8f0d2 }],
});
export const birds = (n = 2) => ({ p: 'birds', at: 'sky', n, r: [0, 30], y: [16, 26] });
export const flowersNear = (step = 2.6, colors) => ({ p: 'flowers', at: 'near', n: step, r: [1.6, 3.6], s: [0.9, 1.3], ...(colors ? { o: { colors } } : {}) });
export const lampsNear = (step = 9, color = 0xfff1b0) => ({ p: 'lamp', at: 'near', n: step, r: [0.6, 1], s: 1, o: { color } });
export const conesNear = (step = 6) => ({ p: 'cone', at: 'near', n: step, r: [0.3, 0.8], s: 1 });
export const room = (o) => ({ pad: 18, h: 18, ...o });
