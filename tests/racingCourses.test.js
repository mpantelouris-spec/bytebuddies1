/** Robot Studio racing: no two races share a name or a road shape. */
import fs from 'node:fs';
import { KART_TIER_RACES } from '../src/virtual-robot-designer/data/tier-levels/kart-tiers.js';
import { getMKTrack } from '../src/virtual-robot-designer/racing/mk-tracks/MKTrackRegistry.js';
import { COSMIC_SKYWAY_BONUS_TRACKS } from '../src/virtual-robot-designer/racing/mk-tracks/CosmicSkywayRegistry.js';
import { applyPrimaryStudioMeta } from '../src/virtual-robot-designer/data/primary-robot-studio.js';

// The same shape check the race builder (scripts/tier-levels/build-kart.mjs) uses
const src = fs.readFileSync('scripts/tier-levels/build-kart.mjs', 'utf8');
const { signature, shapeGap, SAME_SHAPE } = new Function(
  `${src.slice(src.indexOf('const SAME_SHAPE'), src.indexOf('const tooClose'))}; return { signature, shapeGap, SAME_SHAPE };`,
)();

const courses = [
  ...KART_TIER_RACES.rover.map((r) => ({ name: r.name, spline: r.spline || getMKTrack(r.track).spline })),
  ...COSMIC_SKYWAY_BONUS_TRACKS.map((t) => ({ name: t.label, spline: t.spline })),
];

test('every race has its own name', () => {
  const names = courses.map((c) => c.name);
  expect(new Set(names).size).toBe(names.length);
  const shown = Array.from({ length: 50 }, (_, k) => applyPrimaryStudioMeta({ chassisId: 'rover', modeIndex: k + 1, id: `r${k + 1}` }).name);
  expect(new Set(shown).size).toBe(50);
});

test('no two races have the same road shape', () => {
  const sigs = courses.map((c) => signature(c.spline));
  const same = [];
  for (let i = 0; i < sigs.length; i++) for (let j = i + 1; j < sigs.length; j++) {
    if (shapeGap(sigs[i], sigs[j]) < SAME_SHAPE) same.push(`${courses[i].name} ~ ${courses[j].name}`);
  }
  expect(same).toEqual([]);
});
