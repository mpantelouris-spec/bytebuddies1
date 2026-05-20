import { buildScriptChains } from '../src/utils/spriteScriptRunner.js';
import {
  applyRotationStyleBlock,
  getRotationStyle,
  syncPlayRotationStyle,
  ROTATION_STYLE_ALL_AROUND,
} from '../src/utils/spriteMotion.js';

describe('buildScriptChains', () => {
  test('green-flag hat chains rotation style then turn blocks in order', () => {
    const sprite = {
      id: 's1',
      name: 'Star',
      blocks: [
        { id: 1, type: 'event-start', stackOrder: 0 },
        { id: 2, type: 'sprite-rotation-style', stackOrder: 1, params: { style: 'allaround' } },
        { id: 3, type: 'sprite-turn-right', stackOrder: 2, params: { degrees: '90' } },
      ],
    };
    const chains = buildScriptChains('s1', [sprite]);
    expect(chains).toHaveLength(1);
    expect(chains[0].trigger.type).toBe('event-start');
    expect(chains[0].body.map((b) => b.type)).toEqual([
      'sprite-rotation-style',
      'sprite-turn-right',
    ]);
  });

  test('loose blocks without hat merge into synthetic green-flag chain', () => {
    const sprite = {
      id: 's1',
      name: 'Cat',
      blocks: [
        { id: 2, type: 'sprite-rotation-style', stackOrder: 1, params: { style: 'allaround' } },
        { id: 3, type: 'sprite-move', stackOrder: 2, params: { steps: '10' } },
      ],
    };
    const chains = buildScriptChains('s1', [sprite]);
    expect(chains).toHaveLength(1);
    expect(chains[0].trigger.type).toBe('event-start');
    expect(chains[0].isSynthetic).toBe(true);
    expect(chains[0].body[0].type).toBe('sprite-rotation-style');
  });

  test('simulated exec: rotation not explicitly set until block runs', () => {
    const sprite = { id: 's1', name: 'Star', direction: 90, blocks: [] };
    syncPlayRotationStyle(sprite);
    // Default is all around, but _rotationStyleFromScript is false until block runs
    expect(sprite._rotationStyleFromScript).toBe(false);
    expect(getRotationStyle(sprite)).toBe(ROTATION_STYLE_ALL_AROUND);

    const chains = buildScriptChains('s1', [{
      id: 's1',
      name: 'Star',
      blocks: [
        { type: 'event-start', stackOrder: 0 },
        { type: 'sprite-rotation-style', stackOrder: 1, params: { style: 'allaround' } },
      ],
    }]);
    for (const block of chains[0].body) {
      applyRotationStyleBlock(block, sprite);
    }
    expect(getRotationStyle(sprite)).toBe(ROTATION_STYLE_ALL_AROUND);
  });
});
