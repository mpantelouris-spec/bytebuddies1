import {
  sliceCBlockInner,
  sliceIfBlockSections,
  shouldSkipWhenHydrating,
} from '../src/utils/cBlockNesting.js';

describe('cBlockNesting', () => {
  test('sliceCBlockInner collects until loop-end-loop', () => {
    const flat = [
      { type: 'loop-repeat' },
      { type: 'control-wait' },
      { type: 'sprite-move' },
      { type: 'loop-end-loop' },
      { type: 'control-wait' },
    ];
    const { inner, nextIndex } = sliceCBlockInner(flat, 0);
    expect(inner.map((b) => b.type)).toEqual(['control-wait', 'sprite-move']);
    expect(nextIndex).toBe(4);
    expect(flat[nextIndex].type).toBe('control-wait');
  });

  test('sliceIfBlockSections splits then and else', () => {
    const flat = [
      { type: 'logic-if' },
      { type: 'sprite-move' },
      { type: 'logic-else' },
      { type: 'sprite-hide' },
      { type: 'logic-end-if' },
    ];
    const { inner, elseInner, nextIndex } = sliceIfBlockSections(flat, 0);
    expect(inner.map((b) => b.type)).toEqual(['sprite-move']);
    expect(elseInner.map((b) => b.type)).toEqual(['sprite-hide']);
    expect(nextIndex).toBe(5);
  });

  test('shouldSkipWhenHydrating skips synthetic markers', () => {
    expect(shouldSkipWhenHydrating('loop-end-loop')).toBe(true);
    expect(shouldSkipWhenHydrating('control-wait')).toBe(false);
  });
});
