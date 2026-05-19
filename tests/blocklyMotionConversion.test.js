import {
  BLOCK_DEFS,
  SIDEBAR_TO_TYPE,
  blocklyTypeToGameType,
  resolveBlocklyNodeType,
  readBlocklyFieldOrValue,
  shortTypeToBlocklyType,
} from '../src/utils/blocks.jsx';
import { buildScriptChains } from '../src/utils/spriteScriptRunner.js';
import {
  executeSpriteMotion,
  getDirection,
  getRotationStyle,
  syncPlayRotationStyle,
} from '../src/utils/spriteMotion.js';

/** Minimal mirror of GameBuilder pushNode type resolution (regression guard). */
function resolveGameTypeFromNode(node) {
  const rawType = node?.type;
  const blocklyType = resolveBlocklyNodeType(node) || rawType;
  const f = node?.fields || {};
  let type = blocklyTypeToGameType(blocklyType);
  if (rawType === 'motion_setrotationstyle' || blocklyType === 'motion_setrotationstyle') {
    type = 'sprite-rotation-style';
  }
  if (!type || !BLOCK_DEFS[type]) {
    const label = String(f.LABEL || f.BLOCK_NAME || '').trim().toLowerCase();
    const short = SIDEBAR_TO_TYPE[label];
    if (short) {
      const mapped = blocklyTypeToGameType(shortTypeToBlocklyType(short));
      if (mapped && BLOCK_DEFS[mapped]) type = mapped;
    }
  }
  return type;
}

describe('Blockly motion block conversion', () => {
  test('motion_turnright node maps to sprite-turn-right', () => {
    expect(resolveGameTypeFromNode({
      type: 'motion_turnright',
      fields: { DEGREES: 90 },
    })).toBe('sprite-turn-right');
  });

  test('bb_generic_stack with label maps to turn blocks', () => {
    expect(resolveGameTypeFromNode({
      type: 'bb_generic_stack',
      fields: { LABEL: 'turn clockwise degrees' },
    })).toBe('sprite-turn-right');
    expect(resolveGameTypeFromNode({
      type: 'bb_generic_stack',
      fields: { LABEL: 'set rotation style' },
    })).toBe('sprite-rotation-style');
  });

  test('reads degrees from value input shadow block', () => {
    const node = {
      type: 'motion_turnright',
      fields: {},
      values: { DEGREES: { type: 'math_number', fields: { NUM: 45 } } },
    };
    expect(readBlocklyFieldOrValue(node, node.fields, 'DEGREES', 15)).toBe(45);
  });
});

describe('play pipeline (script chains + motion)', () => {
  test('green-flag script runs turn clockwise and set rotation style', () => {
    const sprite = {
      id: 's1',
      name: 'Cat',
      x: 200,
      y: 150,
      w: 48,
      h: 48,
      direction: 0,
      blocks: [
        { id: 1, type: 'event-start', stackOrder: 0 },
        { id: 2, type: 'sprite-rotation-style', stackOrder: 1, params: { style: 'allaround' } },
        { id: 3, type: 'sprite-turn-right', stackOrder: 2, params: { degrees: '90' } },
      ],
    };
    syncPlayRotationStyle(sprite);
    const chains = buildScriptChains('s1', [sprite]);
    expect(chains).toHaveLength(1);
    expect(chains[0].trigger.type).toBe('event-start');
    expect(chains[0].body.map((b) => b.type)).toEqual([
      'sprite-rotation-style',
      'sprite-turn-right',
    ]);

    for (const block of chains[0].body) {
      executeSpriteMotion(block, sprite, { instant: true });
    }
    expect(getRotationStyle(sprite)).toBe('all around');
    expect(getDirection(sprite)).toBe(90);
  });

  test('loose motion stack without hat still runs via synthetic chain', () => {
    const sprite = {
      id: 's2',
      name: 'Dog',
      x: 100,
      y: 100,
      w: 48,
      h: 48,
      direction: 0,
      blocks: [
        { id: 2, type: 'sprite-turn-right', stackOrder: 0, params: { degrees: '45' } },
      ],
    };
    syncPlayRotationStyle(sprite);
    const chains = buildScriptChains('s2', [sprite]);
    expect(chains[0].isSynthetic).toBe(true);
    executeSpriteMotion(chains[0].body[0], sprite, { instant: true });
    expect(getDirection(sprite)).toBe(45);
  });
});
