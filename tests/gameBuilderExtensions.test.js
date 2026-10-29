import {
  executeExtensionGameBlock,
  ensurePenState,
  recordPenPoint,
} from '../src/utils/gameExtensionExec.js';

describe('Game Builder extension blocks', () => {
  const sprite = () => ({ id: 's1', x: 100, y: 80, w: 40, h: 40, visible: true });

  test('pen down / up / color / clear', () => {
    const s = sprite();
    expect(executeExtensionGameBlock({ type: 'pen-down' }, s)).toBe(true);
    expect(s._pen.down).toBe(true);
    recordPenPoint(s);
    s.x = 140;
    recordPenPoint(s);
    expect(s._pen.trail.length).toBeGreaterThan(1);
    executeExtensionGameBlock({ type: 'pen-color', params: { color: '#ff0000' } }, s);
    expect(s._pen.color).toBe('#ff0000');
    executeExtensionGameBlock({ type: 'pen-clear' }, s);
    // Drawing is erased; the pen stays down, so only a start point for the next line is kept
    expect(s._pen.trail.length).toBeLessThanOrEqual(1);
    executeExtensionGameBlock({ type: 'pen-up' }, s);
    expect(s._pen.down).toBe(false);
  });

  test('UK analyse aliases run', () => {
    const s = sprite();
    expect(executeExtensionGameBlock({ type: 'face-analyse-camera' }, s)).toBe(true);
    expect(executeExtensionGameBlock({ type: 'object-analyse-camera' }, s)).toBe(true);
    expect(s._sayText).toBeTruthy();
  });

  test('tts, weather, motor', () => {
    const s = sprite();
    expect(executeExtensionGameBlock({ type: 'tts-speak', params: { text: 'Hi' } }, s)).toBe(true);
    expect(s._sayText).toBe('Hi');
    expect(executeExtensionGameBlock({ type: 'weather-city', params: { city: 'Paris' } }, s)).toBe(true);
    const x = s.x;
    executeExtensionGameBlock({ type: 'motor-forward' }, s);
    expect(s.x).toBe(x + 12);
  });

  test('ensurePenState is idempotent', () => {
    const s = sprite();
    const a = ensurePenState(s);
    const b = ensurePenState(s);
    expect(a).toBe(b);
  });
});
