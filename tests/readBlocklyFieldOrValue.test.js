import { readBlocklyFieldOrValue } from '../src/utils/blocks.jsx';

describe('readBlocklyFieldOrValue', () => {
  test('reads inline field values', () => {
    expect(readBlocklyFieldOrValue({}, { DEGREES: 90 }, 'DEGREES', 15)).toBe(90);
  });

  test('reads nested math_number value blocks', () => {
    const node = {
      values: {
        DEGREES: { type: 'math_number', fields: { NUM: 45 } },
      },
    };
    expect(readBlocklyFieldOrValue(node, {}, 'DEGREES', 15)).toBe(45);
  });

  test('reads rotation style dropdown', () => {
    expect(readBlocklyFieldOrValue({}, { STYLE: 'allaround' }, 'STYLE', 'none')).toBe('allaround');
  });
});
