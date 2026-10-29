/** Fighting worlds: every move plays as a real engine move, each world has its own palette, and Python can drive it. */
import { FIGHT_WORLD_LIST, FIGHT_WORLD_COURSES, FIGHT_MOVE_ALIAS, buildWorldBlockLibrary } from '../src/virtual-robot-designer/data/fight-worlds.js';
import { FIGHTING_BLOCK_LIBRARY } from '../src/virtual-robot-designer/data/fighting-blocks.js';
import { compileFightingScratchScript } from '../src/virtual-robot-designer/data/fighting-block-runtime.js';
import { pythonToBlocks } from '../src/virtual-robot-designer/studio/robotPython.js';
import { getCodingObjective } from '../src/virtual-robot-designer/studio/codingObjective.js';

const ENGINE_MOVES = new Set(['jab', 'cross', 'hook', 'uppercut', 'roundhouse', 'light_kick', 'heavy_kick', 'sweep', 'block', 'parry', 'dodge']);

test('every world move plays as a move the fight engine knows', () => {
  Object.entries(FIGHT_MOVE_ALIAS).forEach(([id, as]) => expect([id, ENGINE_MOVES.has(as)]).toEqual([id, true]));
});

test('five worlds, four courses each, all with their own ids and names', () => {
  expect(FIGHT_WORLD_LIST.length).toBe(5);
  expect(FIGHT_WORLD_COURSES.length).toBe(20);
  expect(new Set(FIGHT_WORLD_COURSES.map((c) => c.id)).size).toBe(20);
  expect(new Set(FIGHT_WORLD_COURSES.map((c) => c.name)).size).toBe(20);
});

describe.each(FIGHT_WORLD_LIST.map((w) => [w.name, w]))('%s', (name, w) => {
  const lib = buildWorldBlockLibrary(FIGHTING_BLOCK_LIBRARY, w.id);
  const ids = Object.values(lib).flatMap((c) => (c?.blocks || []).map((b) => b.id));

  test('palette has the world moves, not boxing punches', () => {
    w.moves.forEach(([id]) => expect(ids).toContain(id));
    w.guard.forEach(([id]) => expect(ids).toContain(id));
    ['jab', 'cross', 'hook', 'uppercut'].forEach((p) => expect(ids).not.toContain(p));
    expect(ids).toContain('if_enemy_close');
  });

  test('Python using the world moves becomes a fight program', () => {
    const [a] = w.moves; const [g] = w.guard;
    const code = `while True:\n    if robot.enemy_close():\n        robot.${a[0]}()\n    if robot.under_attack():\n        robot.${g[0]}()`;
    const r = pythonToBlocks(code, lib, { group: 'walker', robotType: 'striker', style: 'fighting' });
    expect(r.errors).toEqual([]);
    const prog = compileFightingScratchScript(r.blocks);
    expect(prog.tickLoops[0].body.map((s) => s.op)).toEqual(['if_enemy_close', 'if_under_attack']);
    expect(prog.tickLoops[0].body[0].body[0].op).toBe(a[0]);
  });

  test('coding objectives only ask for blocks the world has', () => {
    FIGHT_WORLD_COURSES.filter((c) => c.fightWorld === w.id).forEach((c) => {
      const o = getCodingObjective(c, { library: lib, group: 'walker', robotType: 'striker', kind: 'fighting' });
      expect(o.checks.length).toBeGreaterThan(1);
      expect(o.checks.map((x) => x.label).join(' ')).not.toMatch(/Block or Parry|Dodge or step away/);
    });
  });
});
