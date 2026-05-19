/**
 * Scratch-like operator evaluation (math, logic, strings).
 */

import { readBlocklyFieldOrValue } from './blocks.jsx';

export const OPERATOR_GAME_TYPES = new Set([
  'math-add',
  'math-subtract',
  'math-mult',
  'math-divide',
  'math-modulo',
  'math-random',
  'math-round',
  'logic-compare',
  'logic-and',
  'logic-or',
  'logic-not',
  'logic-bool',
  'text-join',
  'text-length',
  'text-letter',
  'text-contains',
]);

const OPERATOR_BLOCKLY_TYPES = new Set([
  'operator_add',
  'operator_subtract',
  'operator_multiply',
  'operator_divide',
  'operator_random',
  'operator_round',
  'operator_mathop',
  'operator_mod',
  'operator_compare',
  'operator_gt',
  'operator_lt',
  'operator_equals',
  'operator_and',
  'operator_or',
  'operator_not',
  'operator_join',
  'operator_length',
  'operator_letterof',
  'operator_contains',
  'bb_math_add',
  'bb_math_mult',
  'bb_math_random',
  'bb_math_round',
]);

export function isOperatorBlocklyType(type) {
  return OPERATOR_BLOCKLY_TYPES.has(type);
}

export function coerceNum(v, fallback = 0) {
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v && typeof v === 'object' && v._nested) return fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

export function coerceStr(v, fallback = '') {
  if (v == null) return fallback;
  if (v && typeof v === 'object' && v._nested) return fallback;
  return String(v);
}

export function coerceBool(v) {
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (s === 'true' || s === '1') return true;
  if (s === 'false' || s === '0' || s === '') return false;
  return Boolean(v);
}

function nestedFromValue(node, key) {
  const child = node?.values?.[key] ?? node?.values?.[String(key).toUpperCase()];
  if (!child) return null;
  return blocklyNodeToEvaluatorBlock(child);
}

function paramFromValue(node, fields, key, fallback) {
  const nested = nestedFromValue(node, key);
  if (nested) return { _nested: nested };
  return readBlocklyFieldOrValue(node, fields, key, fallback);
}

function evalParam(val, evaluateNested, sprite, coerce = coerceNum, fallback = 0) {
  if (val && typeof val === 'object' && val._nested) {
    return coerce(evaluateNested(val._nested, sprite), fallback);
  }
  return coerce(val, fallback);
}

function evalBoolParam(spec, fallbackType, evaluateNested, sprite) {
  if (spec && typeof spec === 'object' && spec.type) {
    return Boolean(evaluateNested(spec, sprite));
  }
  if (spec && typeof spec === 'object' && spec._nested) {
    return Boolean(evaluateNested(spec._nested, sprite));
  }
  return Boolean(
    evaluateNested(
      { type: fallbackType || 'logic-bool', params: { value: spec ?? 'false' } },
      sprite,
    ),
  );
}

/** Evaluate internal game block types (math-*, logic-*, text-*). */
export function evaluateOperatorBlock(block, sprite, evaluateNested) {
  const p = block?.params || {};
  const type = block?.type || '';

  if (!OPERATOR_GAME_TYPES.has(type)) return undefined;

  switch (type) {
    case 'math-add': {
      const op = String(p.op || '+');
      const a = evalParam(p.a, evaluateNested, sprite);
      const b = evalParam(p.b, evaluateNested, sprite);
      return op === '-' || op === 'subtract' ? a - b : a + b;
    }
    case 'math-subtract':
      return evalParam(p.a, evaluateNested, sprite) - evalParam(p.b, evaluateNested, sprite);
    case 'math-mult': {
      const op = String(p.op || '×');
      const a = evalParam(p.a, evaluateNested, sprite, coerceNum, 1);
      const b = evalParam(p.b, evaluateNested, sprite, coerceNum, 1);
      if (op === '/' || op === '÷' || op === 'divide') return b === 0 ? 0 : a / b;
      return a * b;
    }
    case 'math-divide': {
      const b = evalParam(p.b, evaluateNested, sprite, coerceNum, 1);
      return b === 0 ? 0 : evalParam(p.a, evaluateNested, sprite) / b;
    }
    case 'math-modulo':
      return evalParam(p.a, evaluateNested, sprite) % (evalParam(p.b, evaluateNested, sprite, coerceNum, 1) || 1);
    case 'math-random': {
      const min = Math.ceil(evalParam(p.min, evaluateNested, sprite, coerceNum, 1));
      const max = Math.floor(evalParam(p.max, evaluateNested, sprite, coerceNum, 100));
      const lo = Math.min(min, max);
      const hi = Math.max(min, max);
      return Math.floor(Math.random() * (hi - lo + 1)) + lo;
    }
    case 'math-round':
      return applyMathOp(
        p.op || p.MOP || 'round',
        evalParam(p.value, evaluateNested, sprite),
      );
    case 'logic-compare': {
      const a = evalParam(p.left, evaluateNested, sprite);
      const b = evalParam(p.right, evaluateNested, sprite);
      const op = String(p.op || '=');
      switch (op) {
        case '>':
        case 'gt':
        case 'greater than':
          return a > b;
        case '<':
        case 'lt':
        case 'less than':
          return a < b;
        case '=':
        case 'eq':
        case 'equals':
          return a === b;
        case '!=':
        case 'not equals':
          return a !== b;
        case '>=':
          return a >= b;
        case '<=':
          return a <= b;
        default:
          return a === b;
      }
    }
    case 'logic-and': {
      const op = String(p.op || p.OPERATOR || 'and').toLowerCase();
      const left = evalBoolParam(p._left ?? p.left, p.left_type, evaluateNested, sprite);
      const right = evalBoolParam(p._right ?? p.right, p.right_type, evaluateNested, sprite);
      return op === 'or' ? left || right : left && right;
    }
    case 'logic-or': {
      const left = evalBoolParam(p._left ?? p.left, p.left_type, evaluateNested, sprite);
      const right = evalBoolParam(p._right ?? p.right, p.right_type, evaluateNested, sprite);
      return left || right;
    }
    case 'logic-not': {
      const inner = p._value ?? { type: p.inner_type || 'logic-bool', params: { value: p.value } };
      return !evalBoolParam(inner, p.inner_type, evaluateNested, sprite);
    }
    case 'logic-bool':
      return coerceBool(p.value);
    case 'text-join':
      return `${evalParam(p.a, evaluateNested, sprite, coerceStr, '')}${evalParam(p.b, evaluateNested, sprite, coerceStr, '')}`;
    case 'text-length':
      return coerceStr(evalParam(p.text, evaluateNested, sprite, coerceStr, '')).length;
    case 'text-letter': {
      const s = coerceStr(evalParam(p.text, evaluateNested, sprite, coerceStr, ''));
      const idx = Math.max(1, Math.floor(evalParam(p.index ?? p.letter, evaluateNested, sprite, coerceNum, 1))) - 1;
      return s.charAt(idx) || '';
    }
    case 'text-contains':
      return coerceStr(evalParam(p.text, evaluateNested, sprite, coerceStr, '')).includes(
        coerceStr(evalParam(p.search ?? p.substring, evaluateNested, sprite, coerceStr, '')),
      );
    default:
      return undefined;
  }
}

export function applyMathOp(op, val) {
  const v = coerceNum(val, 0);
  switch (String(op || 'round').toLowerCase()) {
    case 'abs':
      return Math.abs(v);
    case 'floor':
      return Math.floor(v);
    case 'ceiling':
    case 'ceil':
      return Math.ceil(v);
    case 'sqrt':
      return Math.sqrt(v);
    case 'sin':
      return Math.sin((v * Math.PI) / 180);
    case 'cos':
      return Math.cos((v * Math.PI) / 180);
    case 'tan':
      return Math.tan((v * Math.PI) / 180);
    case 'ln':
      return Math.log(v);
    case 'log':
      return Math.log10(v);
    case 'e ^':
    case 'e^':
      return Math.exp(v);
    case '10 ^':
    case '10^':
      return 10 ** v;
    case 'round':
    default:
      return Math.round(v);
  }
}

/** Map Blockly operator workspace node → evaluator block (with nested inputs). */
export function blocklyNodeToEvaluatorBlock(node) {
  if (!node) return { type: 'logic-bool', params: { value: 'false' } };
  const blocklyType = node.type;
  const f = node.fields || {};

  if (!isOperatorBlocklyType(blocklyType)) return null;

  const boolField = (v, fallback = 'false') => {
    const s = String(v ?? fallback).toUpperCase();
    return s === 'TRUE' || s === '1' ? 'true' : 'false';
  };

  switch (blocklyType) {
    case 'operator_add':
    case 'bb_math_add':
      return {
        type: 'math-add',
        params: {
          a: f.NUM1 ?? f.A ?? 1,
          b: f.NUM2 ?? f.B ?? 1,
          op: f.OP === 'subtract' || f.OP === '-' ? '-' : '+',
        },
      };
    case 'operator_subtract':
      return {
        type: 'math-subtract',
        params: { a: f.NUM1 ?? 1, b: f.NUM2 ?? 1 },
      };
    case 'operator_multiply':
    case 'bb_math_mult':
      return {
        type: 'math-mult',
        params: {
          a: f.NUM1 ?? f.A ?? 2,
          b: f.NUM2 ?? f.B ?? 3,
          op: f.OP === 'divide' || f.OP === '/' || f.OP === '÷' ? '/' : '×',
        },
      };
    case 'operator_divide':
      return {
        type: 'math-divide',
        params: { a: f.NUM1 ?? 1, b: f.NUM2 ?? 1 },
      };
    case 'operator_random':
    case 'bb_math_random':
      return {
        type: 'math-random',
        params: { min: f.FROM ?? f.MIN ?? 1, max: f.TO ?? f.MAX ?? 100 },
      };
    case 'operator_round':
    case 'bb_math_round':
      return {
        type: 'math-round',
        params: { op: f.OP || f.MOP || 'round', value: f.NUM ?? f.VALUE ?? 0 },
      };
    case 'operator_mathop':
      return {
        type: 'math-round',
        params: { op: f.OPERATOR || 'abs', value: f.NUM ?? 0 },
      };
    case 'operator_mod':
      return {
        type: 'math-modulo',
        params: { a: f.NUM1 ?? 0, b: f.NUM2 ?? 1 },
      };
    case 'operator_compare': {
      const opMap = { gt: '>', lt: '<', eq: '=' };
      return {
        type: 'logic-compare',
        params: {
          left: f.OPERAND1 ?? 0,
          right: f.OPERAND2 ?? 0,
          op: opMap[f.OPERATOR] || f.OPERATOR || '>',
        },
      };
    }
    case 'operator_gt':
      return {
        type: 'logic-compare',
        params: { left: f.OPERAND1 ?? 0, right: f.OPERAND2 ?? 0, op: '>' },
      };
    case 'operator_lt':
      return {
        type: 'logic-compare',
        params: { left: f.OPERAND1 ?? 0, right: f.OPERAND2 ?? 0, op: '<' },
      };
    case 'operator_equals':
      return {
        type: 'logic-compare',
        params: { left: f.OPERAND1 ?? 0, right: f.OPERAND2 ?? 0, op: '=' },
      };
    case 'operator_and':
      return {
        type: 'logic-and',
        params: {
          op: f.OPERATOR || 'and',
          left: boolField(f.OPERAND1, 'true'),
          right: boolField(f.OPERAND2, 'true'),
          left_type: 'logic-bool',
          right_type: 'logic-bool',
        },
      };
    case 'operator_or':
      return {
        type: 'logic-or',
        params: {
          left: boolField(f.OPERAND1, 'true'),
          right: boolField(f.OPERAND2, 'true'),
          left_type: 'logic-bool',
          right_type: 'logic-bool',
        },
      };
    case 'operator_not':
      return {
        type: 'logic-not',
        params: { value: boolField(f.OPERAND, 'false') },
      };
    case 'operator_join':
      return {
        type: 'text-join',
        params: { a: f.STRING1 ?? 'hello', b: f.STRING2 ?? 'world' },
      };
    case 'operator_length':
      return {
        type: 'text-length',
        params: { text: f.STRING ?? '' },
      };
    case 'operator_letterof':
      return {
        type: 'text-letter',
        params: { letter: f.LETTER ?? 1, text: f.STRING ?? 'text' },
      };
    case 'operator_contains':
      return {
        type: 'text-contains',
        params: { text: f.STRING1 ?? '', search: f.STRING2 ?? '' },
      };
    default:
      return null;
  }
}
