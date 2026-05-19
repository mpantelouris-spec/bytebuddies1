import {
  normalizeDirection,
  executeSpriteMotion,
  evaluateMotionReporter,
  ifOnEdgeBounce,
  startGlide,
  updateGlide,
  canvasToLogical,
  applyLogicalPosition,
  directionToDelta,
  getRenderScaleX,
  getRenderRotation,
  getRotationStyle,
  setRotationStyle,
  applyRotationStyleFromBlocks,
  applyCanvasRotationStyle,
  syncPlayRotationStyle,
  ensureSpriteMotionState,
  DEFAULT_ROTATION_STYLE,
  isLeftRightFacingLeft,
  STAGE_W,
  STAGE_HALF_W,
  STAGE_HALF_H,
} from '../src/utils/spriteMotion.js';

function makeSprite(overrides = {}) {
  return {
    id: 1,
    name: 'Cat',
    x: STAGE_HALF_W - 24,
    y: STAGE_HALF_H - 24,
    w: 48,
    h: 48,
    direction: 90,
    ...overrides,
  };
}

describe('spriteMotion (PictoBlox coords)', () => {
  test('direction 90 = right, 0 = up', () => {
    const right = directionToDelta(90, 10);
    expect(right.dx).toBeCloseTo(10, 5);
    expect(right.dy).toBeCloseTo(0, 5);
    const up = directionToDelta(0, 10);
    expect(up.dx).toBeCloseTo(0, 5);
    expect(up.dy).toBeCloseTo(10, 5);
    const left = directionToDelta(-90, 10);
    expect(left.dx).toBeCloseTo(-10, 5);
    const down = directionToDelta(180, 10);
    expect(down.dy).toBeCloseTo(-10, 5);
  });

  test('normalizeDirection wraps to (-180, 180]', () => {
    expect(normalizeDirection(270)).toBe(-90);
    expect(normalizeDirection(-90)).toBe(-90);
  });

  test('move steps at direction 90 moves right in logical space', () => {
    const sprite = makeSprite({ direction: 90 });
    const before = canvasToLogical(sprite);
    executeSpriteMotion({ type: 'sprite-move', params: { steps: '10' } }, sprite, { instant: true });
    const after = canvasToLogical(sprite);
    expect(after.x).toBeCloseTo(before.x + 10, 1);
    expect(after.y).toBeCloseTo(before.y, 1);
  });

  test('move steps at direction 0 moves up in logical space', () => {
    const sprite = makeSprite({ direction: 0 });
    const before = canvasToLogical(sprite);
    executeSpriteMotion({ type: 'sprite-move', params: { steps: '10' } }, sprite, { instant: true });
    const after = canvasToLogical(sprite);
    expect(after.x).toBeCloseTo(before.x, 1);
    expect(after.y).toBeCloseTo(before.y + 10, 1);
  });

  test('turn clockwise increases direction', () => {
    const sprite = makeSprite({ direction: 90 });
    executeSpriteMotion({ type: 'sprite-turn-right', params: { degrees: '90' } }, sprite, { instant: true });
    expect(sprite.direction).toBe(180);
  });

  test('turn anticlockwise decreases direction', () => {
    const sprite = makeSprite({ direction: 90 });
    executeSpriteMotion({ type: 'sprite-turn-left', params: { degrees: '90' } }, sprite, { instant: true });
    expect(sprite.direction).toBe(0);
  });

  test('from 0° (up), turn 90° clockwise faces right (90°)', () => {
    const sprite = makeSprite({ direction: 0 });
    executeSpriteMotion({ type: 'motion_turnright', params: { DEGREES: 90 } }, sprite, { instant: true });
    expect(sprite.direction).toBe(90);
  });

  test('from 0° (up), turn 90° anticlockwise faces left (-90°)', () => {
    const sprite = makeSprite({ direction: 0 });
    executeSpriteMotion({ type: 'motion_turnleft', params: { DEGREES: 90 } }, sprite, { instant: true });
    expect(sprite.direction).toBe(-90);
  });

  test('set rotation style supports all around, left-right, and no rotation', () => {
    const sprite = makeSprite({ direction: 90 });
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'allaround' } },
      sprite,
      { instant: true },
    );
    expect(getRotationStyle(sprite)).toBe('all around');
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'leftright' } },
      sprite,
      { instant: true },
    );
    expect(getRotationStyle(sprite)).toBe('left-right');
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'none' } },
      sprite,
      { instant: true },
    );
    expect(getRotationStyle(sprite)).toBe('no rotation');
  });

  test('change y by positive increases logical y', () => {
    const sprite = makeSprite();
    const before = canvasToLogical(sprite);
    executeSpriteMotion({ type: 'sprite-changey', params: { amount: '20' } }, sprite, { instant: true });
    const after = canvasToLogical(sprite);
    expect(after.y).toBeCloseTo(before.y + 20, 1);
  });

  test('go to x,y sets logical coordinates', () => {
    const sprite = makeSprite();
    executeSpriteMotion({ type: 'sprite-goto', params: { x: '50', y: '-30' } }, sprite, { instant: true });
    const pos = canvasToLogical(sprite);
    expect(pos.x).toBeCloseTo(50, 1);
    expect(pos.y).toBeCloseTo(-30, 1);
  });

  test('go to mouse uses logical mouse position', () => {
    const sprite = makeSprite();
    executeSpriteMotion(
      { type: 'sprite-goto-mouse-pointer', params: {} },
      sprite,
      { mouseX: STAGE_HALF_W + 50, mouseY: STAGE_HALF_H - 30, instant: true },
    );
    const pos = canvasToLogical(sprite);
    expect(pos.x).toBeCloseTo(50, 1);
    expect(pos.y).toBeCloseTo(30, 1);
  });

  test('glide interpolates in logical space', () => {
    const sprite = makeSprite();
    applyLogicalPosition(sprite, 0, 0);
    startGlide(sprite, 100, 50, 1);
    sprite._glideStartTime = Date.now() - 500;
    updateGlide(sprite);
    const pos = canvasToLogical(sprite);
    expect(pos.x).toBeGreaterThan(0);
    expect(pos.x).toBeLessThan(100);
    expect(pos.y).toBeGreaterThan(0);
    expect(pos.y).toBeLessThan(50);
  });

  test('if on edge bounce at left reflects direction', () => {
    const sprite = makeSprite({ direction: 90, w: 48, h: 48 });
    // Place partially off the left edge (applyLogicalPosition would clamp inside bounds)
    sprite.x = -8;
    sprite.y = STAGE_HALF_H - 24;
    expect(ifOnEdgeBounce(sprite)).toBe(true);
    expect(sprite.direction).toBe(-90);
  });

  test('if on edge bounce when touching right edge', () => {
    const sprite = makeSprite({ direction: 90, w: 48, h: 48 });
    sprite.x = STAGE_W - 48;
    sprite.y = STAGE_HALF_H - 24;
    expect(ifOnEdgeBounce(sprite)).toBe(true);
    expect(sprite.direction).toBe(-90);
  });

  test('set rotation style maps Blockly dropdown values', () => {
    const sprite = makeSprite({ direction: 90 });
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'none' } },
      sprite,
      { instant: true },
    );
    expect(sprite.rotationStyle).toBe('no rotation');
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'allaround' } },
      sprite,
      { instant: true },
    );
    expect(sprite.rotationStyle).toBe('all around');
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'leftright' } },
      sprite,
      { instant: true },
    );
    expect(sprite.rotationStyle).toBe('left-right');
  });

  test('left-right flips only (Scratch), all around spins — same direction', () => {
    const leftRight = makeSprite({ direction: 90 });
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'leftright' } },
      leftRight,
      { instant: true },
    );
    const allAround = makeSprite({ direction: 90, name: 'Star', svgKey: 'Star' });
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'allaround' } },
      allAround,
      { instant: true },
    );

    expect(getRenderRotation(leftRight)).toBe(0);
    expect(getRenderScaleX(leftRight)).toBe(1);
    expect(getRenderRotation(allAround)).toBeCloseTo(Math.PI / 2, 5);

    // Facing left-ish (100°): left-right mirrors; all around rotates to heading
    leftRight.direction = 100;
    allAround.direction = 100;
    expect(isLeftRightFacingLeft(100)).toBe(true);
    expect(getRenderRotation(leftRight)).toBe(0);
    expect(getRenderScaleX(leftRight)).toBe(-1);
    expect(getRenderRotation(allAround)).toBeCloseTo((100 * Math.PI) / 180, 5);
  });

  test('blocks in workspace do not rotate sprite until script runs', () => {
    const sprite = makeSprite({
      direction: 90,
      blocks: [{ type: 'sprite-rotation-style', params: { style: 'allaround' } }],
    });
    ensureSpriteMotionState(sprite);
    expect(sprite.rotationStyle).toBeUndefined();
    expect(getRotationStyle(sprite)).toBe('no rotation');
    expect(getRenderRotation(sprite)).toBe(0);
  });

  test('syncPlayRotationStyle clears style until block runs', () => {
    const sprite = makeSprite({
      direction: 90,
      name: 'Star',
      svgKey: 'Star',
      rotationStyle: 'all around',
      _rotationStyleFromScript: true,
    });
    syncPlayRotationStyle(sprite);
    expect(sprite.rotationStyle).toBeUndefined();
    expect(sprite._rotationStyleFromScript).toBe(false);
    expect(getRenderRotation(sprite)).toBe(0);
  });

  test('getRotationStyle active only after setRotationStyle', () => {
    const sprite = makeSprite({
      direction: 90,
      name: 'Star',
      svgKey: 'Star',
      blocks: [{ type: 'sprite-rotation-style', params: { style: 'allaround' } }],
    });
    expect(getRotationStyle(sprite)).toBe('no rotation');
    setRotationStyle(sprite, 'allaround');
    expect(getRotationStyle(sprite)).toBe('all around');
    expect(getRenderRotation(sprite)).toBeCloseTo(Math.PI / 2, 5);
  });

  test('applyRotationStyleFromBlocks reads sprite block list', () => {
    const sprite = makeSprite({ direction: 90, blocks: [] });
    expect(getRotationStyle(sprite)).toBe(DEFAULT_ROTATION_STYLE);
    sprite.blocks = [
      { type: 'event-start', params: {} },
      { type: 'sprite-rotation-style', params: { style: 'leftright' } },
    ];
    expect(applyRotationStyleFromBlocks(sprite)).toBe(true);
    expect(sprite.rotationStyle).toBe('left-right');
    expect(getRenderRotation(sprite)).toBe(0);
    expect(getRenderScaleX(sprite)).toBe(1);
  });

  test('sprites stay upright until set rotation style block runs', () => {
    const sprite = makeSprite({ direction: 90, svgKey: 'Star', costumeFacing: 0 });
    expect(getRenderRotation(sprite)).toBe(0);
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'allaround' } },
      sprite,
      { instant: true },
    );
    expect(getRenderRotation(sprite)).toBeCloseTo(Math.PI / 2, 5);
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'none' } },
      sprite,
      { instant: true },
    );
    expect(getRenderRotation(sprite)).toBe(0);
  });

  test('all around rotates costume to match direction (0=up, 90=right)', () => {
    const sprite = makeSprite({ direction: 90, svgKey: 'Star', costumeFacing: 0 });
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'allaround' } },
      sprite,
      { instant: true },
    );
    expect(getRenderRotation(sprite)).toBeCloseTo(Math.PI / 2, 5);
    sprite.direction = 0;
    expect(getRenderRotation(sprite)).toBeCloseTo(0, 5);
    sprite.direction = 180;
    expect(getRenderRotation(sprite)).toBeCloseTo(Math.PI, 5);
  });

  test('all around rotates by direction only (no costume offset)', () => {
    const sprite = makeSprite({ direction: 90, svgKey: 'Bird', name: 'Bird' });
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'allaround' } },
      sprite,
      { instant: true },
    );
    expect(getRenderRotation(sprite)).toBeCloseTo(Math.PI / 2, 5);
    sprite.direction = 0;
    expect(getRenderRotation(sprite)).toBeCloseTo(0, 5);
  });

  test('left-right boundary: 90 and 270 do not flip', () => {
    const sprite = makeSprite({ direction: 90 });
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'leftright' } },
      sprite,
      { instant: true },
    );
    expect(getRenderScaleX(sprite)).toBe(1);
    sprite.direction = 91;
    expect(getRenderScaleX(sprite)).toBe(-1);
    sprite.direction = -89;
    expect(getRenderScaleX(sprite)).toBe(1);
    sprite.direction = -91;
    expect(getRenderScaleX(sprite)).toBe(-1);
  });

  test('Star by name only (no svgKey) still rotates at dir 90', () => {
    const sprite = makeSprite({ direction: 90, name: 'Star' });
    executeSpriteMotion(
      { type: 'motion_setrotationstyle', params: { STYLE: 'allaround' } },
      sprite,
      { instant: true },
    );
    expect(getRenderRotation(sprite)).toBeCloseTo(Math.PI / 2, 5);
  });

  test('reporters return logical x, y, direction', () => {
    const sprite = makeSprite();
    applyLogicalPosition(sprite, 12, 34);
    sprite.direction = 45;
    expect(evaluateMotionReporter({ type: 'sprite-x-reporter' }, sprite)).toBeCloseTo(12, 1);
    expect(evaluateMotionReporter({ type: 'sprite-y-reporter' }, sprite)).toBeCloseTo(34, 1);
    expect(evaluateMotionReporter({ type: 'sprite-direction-reporter' }, sprite)).toBe(45);
  });
});
