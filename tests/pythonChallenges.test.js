import { PYTHON_CHALLENGES, checkResult, buildCheckProgram, SPLIT } from '../src/data/pythonChallenges';

describe('Python challenges', () => {
  test('ids are unique and every challenge has a 3-step hint ladder', () => {
    expect(new Set(PYTHON_CHALLENGES.map((c) => c.id)).size).toBe(PYTHON_CHALLENGES.length);
    PYTHON_CHALLENGES.forEach((c) => expect(c.hints).toHaveLength(3));
  });

  test('the last hint leaves gaps instead of giving the answer', () => {
    PYTHON_CHALLENGES.forEach((c) => expect(c.hints[2]).toMatch(/___/));
  });

  test('printing challenges compare lines and explain the first difference', () => {
    const c = PYTHON_CHALLENGES.find((x) => x.id === 'py-countdown');
    expect(checkResult(c, '5\n4\n3\n2\n1\nLift off!\n')).toEqual({ pass: true });
    expect(checkResult(c, '5\n4\n3\n2\n1\nLiftoff!\n').message).toMatch(/Line 6/);
    expect(checkResult(c, '5\n4\n').message).toMatch(/missing/);
  });

  test('function challenges read the hidden test result after the marker', () => {
    const c = PYTHON_CHALLENGES.find((x) => x.id === 'py-double');
    expect(buildCheckProgram(c, 'def double(n):\n    return n * 2')).toContain(SPLIT);
    expect(checkResult(c, `hi\n${SPLIT}\n__PASS__\n`)).toEqual({ pass: true });
    expect(checkResult(c, `${SPLIT}\n__FAIL__ double(4) gave 6\n`).message).toBe('double(4) gave 6');
  });
});
