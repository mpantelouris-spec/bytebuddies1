/**
 * Scratch-style list operations (1-based indices, graceful out-of-bounds).
 */
import { readBlocklyFieldOrValue } from './blocks.jsx';
import { blocklyNodeToEvaluatorBlock } from './operatorsRuntime';

export function normalizeListName(name) {
  return String(name ?? 'myList').trim() || 'myList';
}

export function ensureList(store, name) {
  const key = normalizeListName(name);
  if (!store[key]) store[key] = [];
  return store[key];
}

/**
 * Convert user-facing 1-based index to 0-based array index.
 * @returns {number|null} null when out of bounds (or invalid)
 */
export function listIndexToInternal(oneBased, length, { allowAppend = false } = {}) {
  const n = Math.floor(Number(oneBased));
  if (!Number.isFinite(n)) return null;
  const internal = n - 1;
  if (allowAppend && internal === length) return internal;
  if (internal < 0 || internal >= length) return null;
  return internal;
}

export function listAdd(store, name, value) {
  ensureList(store, name).push(value);
}

export function listDeleteAt(store, name, oneBasedIndex) {
  const key = normalizeListName(name);
  const list = store[key];
  if (!list) return;
  const internal = listIndexToInternal(oneBasedIndex, list.length);
  if (internal === null) return;
  list.splice(internal, 1);
}

export function listDeleteAll(store, name) {
  const key = normalizeListName(name);
  if (!store[key]) store[key] = [];
  else store[key].length = 0;
}

export function listInsertAt(store, name, oneBasedIndex, value) {
  const list = ensureList(store, name);
  const internal = listIndexToInternal(oneBasedIndex, list.length, { allowAppend: true });
  if (internal === null) return;
  list.splice(internal, 0, value);
}

export function listReplaceAt(store, name, oneBasedIndex, value) {
  const key = normalizeListName(name);
  const list = store[key];
  if (!list) return;
  const internal = listIndexToInternal(oneBasedIndex, list.length);
  if (internal === null) return;
  list[internal] = value;
}

export function listGetItem(store, name, oneBasedIndex) {
  const key = normalizeListName(name);
  const list = store[key];
  if (!list) return '';
  const internal = listIndexToInternal(oneBasedIndex, list.length);
  if (internal === null) return '';
  const item = list[internal];
  return item == null ? '' : item;
}

export function listIndexOfValue(store, name, value) {
  const key = normalizeListName(name);
  const list = store[key];
  if (!list || !list.length) return 0;
  let idx = list.indexOf(value);
  if (idx === -1) {
    const str = String(value);
    idx = list.findIndex((item) => String(item) === str);
  }
  return idx === -1 ? 0 : idx + 1;
}

export function listLength(store, name) {
  const key = normalizeListName(name);
  return store[key]?.length ?? 0;
}

export function listContains(store, name, value) {
  const key = normalizeListName(name);
  const list = store[key];
  if (!list) return false;
  if (list.includes(value)) return true;
  const str = String(value);
  return list.some((item) => String(item) === str);
}

/** Blockly value socket → literal or nested evaluator block. */
export function listBlocklyParam(node, fields, key, fallback) {
  const child = node?.values?.[key] ?? node?.values?.[String(key).toUpperCase()];
  if (child) {
    const nested = blocklyNodeToEvaluatorBlock(child);
    if (nested) return { _nested: nested };
  }
  return readBlocklyFieldOrValue(node, fields, key, fallback);
}

export function evalListParam(val, evaluateNested, sprite) {
  if (val && typeof val === 'object' && val._nested) {
    const result = evaluateNested(val._nested, sprite);
    return result == null ? '' : result;
  }
  return val == null ? '' : val;
}

export function evalListIndex(val, evaluateNested, sprite) {
  if (val && typeof val === 'object' && val._nested) {
    const n = Number(evaluateNested(val._nested, sprite));
    return Number.isFinite(n) ? n : 1;
  }
  const n = Number(val);
  return Number.isFinite(n) ? n : 1;
}

/** Map Blockly list reporter nodes for condition sockets. */
export function blocklyListNodeToEvaluatorBlock(node) {
  if (!node?.type) return null;
  const blocklyType = node.type;
  const f = node.fields || {};
  const listName = String(f.LIST ?? f.list ?? 'myList');

  switch (blocklyType) {
    case 'data_itemoflist':
      return {
        type: 'list-item',
        params: {
          list: listName,
          index: listBlocklyParam(node, f, 'INDEX', 1),
        },
      };
    case 'data_itemnumoflist':
      return {
        type: 'list-index',
        params: {
          list: listName,
          item: listBlocklyParam(node, f, 'ITEM', ''),
        },
      };
    case 'data_lengthoflist':
      return { type: 'list-length', params: { list: listName } };
    case 'data_listcontainsitem':
      return {
        type: 'list-contains',
        params: {
          list: listName,
          item: listBlocklyParam(node, f, 'ITEM', ''),
        },
      };
    default:
      return null;
  }
}
