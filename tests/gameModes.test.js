/**
 * Game Modes: every template and model answer is well-formed Blockly XML, and every
 * model answer meets its own "N blocks or fewer" target so 3 stars are reachable.
 */
import { GAME_MODES } from '../src/data/gameModes';
import { countBlocks } from '../src/data/gameModes/checks';

const wellFormed = (xml) => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return !doc.getElementsByTagName('parsererror').length;
};

describe('Game Modes', () => {
  test('there are 11 modes with unique ids', () => {
    expect(GAME_MODES).toHaveLength(11);
    expect(new Set(GAME_MODES.map((m) => m.id)).size).toBe(11);
  });

  GAME_MODES.forEach((mode) => {
    describe(mode.title, () => {
      test('starter sprites are well-formed and include the focus sprite', () => {
        const sprites = mode.sprites();
        expect(sprites.some((s) => s.name === mode.focus)).toBe(true);
        sprites.forEach((s) => { if (s.xml) expect(wellFormed(s.xml)).toBe(true); });
        sprites.forEach((s) => expect(String(s.xml || '')).not.toMatch(/>false</));
      });

      mode.challenges.forEach((ch) => {
        test(`${ch.title}: model answer is well-formed and within par`, () => {
          const target = ch.parSprite || mode.focus;
          const xml = ch.solutionFor?.[target] || (target === mode.focus ? ch.solution : null);
          [ch.solution, ...Object.values(ch.solutionFor || {})].filter(Boolean).forEach((x) => expect(wellFormed(x)).toBe(true));
          if (xml) expect(countBlocks(xml)).toBeLessThanOrEqual(ch.par);
          expect(ch.hints.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
