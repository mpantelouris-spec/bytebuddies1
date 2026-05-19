import {
  isTouchingEdge,
  isTouchingSprite,
  isTouchingMousePointer,
  isTouchingTarget,
  distanceToTarget,
  distanceBetween,
  getTimerSeconds,
  normalizeSenseKeyName,
  colorsMatch,
  parseHexColor,
} from '../src/utils/sensingRuntime.js';

describe('sensingRuntime', () => {
  const sprite = { id: 1, name: 'Cat', x: 10, y: 10, w: 40, h: 40, visible: true };
  const other = { id: 2, name: 'Dog', x: 30, y: 30, w: 40, h: 40, visible: true };

  test('isTouchingEdge detects stage boundary', () => {
    expect(isTouchingEdge({ x: 0, y: 50, w: 20, h: 20 }, 480, 360)).toBe(true);
    expect(isTouchingEdge({ x: 50, y: 50, w: 20, h: 20 }, 480, 360)).toBe(false);
  });

  test('isTouchingSprite detects overlap', () => {
    expect(isTouchingSprite(sprite, [sprite, other], 'dog')).toBe(true);
    expect(isTouchingSprite(sprite, [sprite, other], 'bird')).toBe(false);
  });

  test('isTouchingMousePointer', () => {
    expect(isTouchingMousePointer(sprite, 25, 25)).toBe(true);
    expect(isTouchingMousePointer(sprite, 200, 200)).toBe(false);
  });

  test('isTouchingTarget routes targets', () => {
    expect(isTouchingTarget(sprite, 'edge', { stageW: 480, stageH: 360 })).toBe(false);
    expect(isTouchingTarget({ x: 0, y: 0, w: 10, h: 10 }, 'edge', { stageW: 480, stageH: 360 })).toBe(true);
    expect(isTouchingTarget(sprite, 'mouse-pointer', { mouseX: 25, mouseY: 25 })).toBe(true);
    expect(isTouchingTarget(sprite, 'dog', { allSprites: [sprite, other] })).toBe(true);
  });

  test('distanceToTarget uses euclidean distance', () => {
    const d = distanceToTarget(sprite, 'mouse-pointer', { mouseX: 110, mouseY: 110 });
    expect(d).toBeCloseTo(113.14, 0);
    const d2 = distanceToTarget(sprite, 'dog', { allSprites: [sprite, other] });
    expect(d2).toBeGreaterThan(0);
  });

  test('distanceBetween', () => {
    expect(distanceBetween(0, 0, 3, 4)).toBe(5);
  });

  test('getTimerSeconds', () => {
    const start = Date.now() - 2500;
    expect(getTimerSeconds(start)).toBeCloseTo(2.5, 1);
  });

  test('normalizeSenseKeyName', () => {
    expect(normalizeSenseKeyName('up arrow')).toBe('up');
    expect(normalizeSenseKeyName('Space')).toBe('space');
  });

  test('parseHexColor and colorsMatch', () => {
    const c = parseHexColor('#ff0000');
    expect(colorsMatch(c, { r: 250, g: 0, b: 0 })).toBe(true);
  });
});
