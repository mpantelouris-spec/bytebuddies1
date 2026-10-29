import { defaultLevels, normalizeLevels, captureLayout, applyLayout, addLevel, removeLevel, moveLevel, resolveLevel, applyLayoutInPlace } from '../src/components/gamebuilder/levels';

const sprites = [{ id: 1, name: 'Hero', x: 10, y: 20, visible: true }, { id: 2, name: 'Coin', x: 300, y: 40, visible: false }, { id: 3, isClone: true, x: 0, y: 0 }];

describe('Game Builder levels', () => {
  test('old projects get one level with their backdrop', () => {
    expect(normalizeLevels(undefined, 'Desert')).toEqual([expect.objectContaining({ name: 'Level 1', backdrop: 'Desert', layout: {} })]);
  });

  test('a layout remembers where sprites are and whether they show (not clones)', () => {
    expect(captureLayout(sprites)).toEqual({ 1: { x: 10, y: 20, visible: true }, 2: { x: 300, y: 40, visible: false } });
  });

  test('applying a layout moves sprites the level knows and leaves the rest', () => {
    const out = applyLayout(sprites, { 1: { x: 99, y: 88, visible: false } });
    expect(out[0]).toMatchObject({ x: 99, y: 88, visible: false });
    expect(out[1]).toMatchObject({ x: 300, y: 40 });
  });

  test('in-place layout (during play) skips clones', () => {
    const live = sprites.map((s) => ({ ...s }));
    applyLayoutInPlace(live, { 1: { x: 5, y: 6, visible: true }, 3: { x: 50, y: 50 } });
    expect(live[0]).toMatchObject({ x: 5, y: 6 });
    expect(live[2]).toMatchObject({ x: 0, y: 0 });
  });

  test('adding a level copies the layout and moves on to the next backdrop', () => {
    const next = addLevel(defaultLevels('Grassland'), sprites, ['Grassland', 'Desert', 'Beach']);
    expect(next).toHaveLength(2);
    expect(next[1]).toMatchObject({ name: 'Level 2', backdrop: 'Desert' });
    expect(next[1].layout[1]).toEqual({ x: 10, y: 20, visible: true });
  });

  test('removing and moving levels keeps default names in order', () => {
    let ls = addLevel(addLevel(defaultLevels('A'), sprites, ['A', 'B', 'C']), sprites, ['A', 'B', 'C']);
    ls = removeLevel(ls, 0);
    expect(ls.map((l) => l.name)).toEqual(['Level 1', 'Level 2']);
    expect(ls.map((l) => l.backdrop)).toEqual(['B', 'C']);
    expect(moveLevel(ls, 1, 0).map((l) => l.backdrop)).toEqual(['C', 'B']);
    expect(removeLevel([ls[0]], 0)).toHaveLength(1);
  });

  test('go to level only accepts levels that exist', () => {
    const ls = addLevel(defaultLevels('A'), sprites, ['A', 'B']);
    expect(resolveLevel(ls, 2)).toBe(2);
    expect(resolveLevel(ls, 3)).toBeNull();
    expect(resolveLevel(ls, 0)).toBeNull();
  });
});
