import {
  evaluateOperatorBlock,
  blocklyNodeToEvaluatorBlock,
  applyMathOp,
  coerceNum,
} from '../src/utils/operatorsRuntime.js';

const evalNested = (block) => evaluateOperatorBlock(block, null, evalNested);

describe('operatorsRuntime', () => {
  it('adds and subtracts numbers', () => {
    expect(
      evaluateOperatorBlock(
        { type: 'math-add', params: { a: 5, b: 3, op: '+' } },
        null,
        evalNested,
      ),
    ).toBe(8);
    expect(
      evaluateOperatorBlock(
        { type: 'math-add', params: { a: 5, b: 3, op: '-' } },
        null,
        evalNested,
      ),
    ).toBe(2);
  });

  it('multiplies and divides', () => {
    expect(
      evaluateOperatorBlock(
        { type: 'math-mult', params: { a: 4, b: 2, op: '×' } },
        null,
        evalNested,
      ),
    ).toBe(8);
    expect(
      evaluateOperatorBlock(
        { type: 'math-mult', params: { a: 8, b: 2, op: '/' } },
        null,
        evalNested,
      ),
    ).toBe(4);
  });

  it('compares values', () => {
    expect(
      evaluateOperatorBlock(
        { type: 'logic-compare', params: { left: 3, right: 2, op: '>' } },
        null,
        evalNested,
      ),
    ).toBe(true);
    expect(
      evaluateOperatorBlock(
        { type: 'logic-compare', params: { left: 1, right: 2, op: '<' } },
        null,
        evalNested,
      ),
    ).toBe(true);
    expect(
      evaluateOperatorBlock(
        { type: 'logic-compare', params: { left: 2, right: 2, op: '=' } },
        null,
        evalNested,
      ),
    ).toBe(true);
  });

  it('handles and/or/not with nested blocks', () => {
    const andBlock = {
      type: 'logic-and',
      params: {
        op: 'and',
        _left: { type: 'logic-bool', params: { value: 'true' } },
        _right: { type: 'logic-bool', params: { value: 'false' } },
      },
    };
    expect(evaluateOperatorBlock(andBlock, null, evalNested)).toBe(false);

    const orBlock = {
      type: 'logic-or',
      params: {
        _left: { type: 'logic-bool', params: { value: 'false' } },
        _right: { type: 'logic-bool', params: { value: 'true' } },
      },
    };
    expect(evaluateOperatorBlock(orBlock, null, evalNested)).toBe(true);

    const notBlock = {
      type: 'logic-not',
      params: { _value: { type: 'logic-bool', params: { value: 'true' } } },
    };
    expect(evaluateOperatorBlock(notBlock, null, evalNested)).toBe(false);
  });

  it('joins strings and checks length/contains', () => {
    expect(
      evaluateOperatorBlock(
        { type: 'text-join', params: { a: 'hi', b: '!' } },
        null,
        evalNested,
      ),
    ).toBe('hi!');
    expect(
      evaluateOperatorBlock(
        { type: 'text-length', params: { text: 'hello' } },
        null,
        evalNested,
      ),
    ).toBe(5);
    expect(
      evaluateOperatorBlock(
        { type: 'text-contains', params: { text: 'scratch', search: 'rat' } },
        null,
        evalNested,
      ),
    ).toBe(true);
  });

  it('maps Blockly operator_add to evaluator block', () => {
    const mapped = blocklyNodeToEvaluatorBlock({
      type: 'operator_add',
      fields: { OP: 'subtract', NUM1: 10, NUM2: 4 },
    });
    expect(mapped.type).toBe('math-add');
    expect(mapped.params.op).toBe('-');
    expect(evaluateOperatorBlock(mapped, null, evalNested)).toBe(6);
  });

  it('applyMathOp rounds and takes abs', () => {
    expect(applyMathOp('round', 3.7)).toBe(4);
    expect(applyMathOp('abs', -5)).toBe(5);
    expect(coerceNum('12')).toBe(12);
  });
});
