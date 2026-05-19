import {
  listAdd,
  listDeleteAt,
  listDeleteAll,
  listInsertAt,
  listReplaceAt,
  listGetItem,
  listIndexOfValue,
  listLength,
  listContains,
  listIndexToInternal,
} from '../src/utils/listRuntime.js';

describe('listRuntime', () => {
  let store;

  beforeEach(() => {
    store = {};
  });

  test('add creates list and appends', () => {
    listAdd(store, 'myList', 'apple');
    expect(store.myList).toEqual(['apple']);
    listAdd(store, 'myList', 'banana');
    expect(store.myList).toEqual(['apple', 'banana']);
  });

  test('delete at index is 1-based', () => {
    store.myList = ['a', 'b', 'c'];
    listDeleteAt(store, 'myList', 2);
    expect(store.myList).toEqual(['a', 'c']);
  });

  test('delete out of bounds is no-op', () => {
    store.myList = ['a'];
    listDeleteAt(store, 'myList', 99);
    expect(store.myList).toEqual(['a']);
  });

  test('delete all empties list', () => {
    store.myList = ['a', 'b'];
    listDeleteAll(store, 'myList');
    expect(store.myList).toEqual([]);
    expect(listLength(store, 'myList')).toBe(0);
  });

  test('insert at index shifts items', () => {
    store.myList = ['a', 'b', 'c'];
    listInsertAt(store, 'myList', 2, 'x');
    expect(store.myList).toEqual(['a', 'x', 'b', 'c']);
  });

  test('insert at length+1 appends', () => {
    store.myList = ['a', 'b'];
    listInsertAt(store, 'myList', 3, 'c');
    expect(store.myList).toEqual(['a', 'b', 'c']);
  });

  test('replace item at index', () => {
    store.myList = ['a', 'b', 'c'];
    listReplaceAt(store, 'myList', 2, 'x');
    expect(store.myList).toEqual(['a', 'x', 'c']);
  });

  test('get item is 1-based', () => {
    store.myList = ['apple', 'banana'];
    expect(listGetItem(store, 'myList', 1)).toBe('apple');
    expect(listGetItem(store, 'myList', 2)).toBe('banana');
    expect(listGetItem(store, 'myList', 99)).toBe('');
  });

  test('item # of returns first match 1-based or 0', () => {
    store.myList = ['apple', 'banana', 'apple'];
    expect(listIndexOfValue(store, 'myList', 'apple')).toBe(1);
    expect(listIndexOfValue(store, 'myList', 'grape')).toBe(0);
  });

  test('length of list', () => {
    store.myList = ['a', 'b', 'c'];
    expect(listLength(store, 'myList')).toBe(3);
    expect(listLength(store, 'missing')).toBe(0);
  });

  test('list contains', () => {
    store.myList = ['apple', 42];
    expect(listContains(store, 'myList', 'apple')).toBe(true);
    expect(listContains(store, 'myList', 42)).toBe(true);
    expect(listContains(store, 'myList', 'grape')).toBe(false);
  });

  test('listIndexToInternal allowAppend', () => {
    expect(listIndexToInternal(3, 2, { allowAppend: true })).toBe(2);
    expect(listIndexToInternal(4, 2, { allowAppend: true })).toBe(null);
  });
});
