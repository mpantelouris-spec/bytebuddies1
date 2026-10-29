/** Python for the game robots (Flappy, Block Crafter, football, boxing) must build the same programs their engines run. */
import { FLAPPY_BLOCK_LIBRARY, FLAPPY_STARTER_SCRIPT } from '../src/virtual-robot-designer/data/flappy-bird-blocks.js';
import { CRAFT_BLOCK_LIBRARY, CRAFT_STARTER_SCRIPT, compileCraftScript } from '../src/virtual-robot-designer/data/craft-blocks.js';
import { FOOTBALL_BLOCK_LIBRARY, FOOTBALL_STARTER_SCRIPT } from '../src/virtual-robot-designer/data/football-blocks.js';
import { FIGHTING_BLOCK_LIBRARY, FIGHTING_STARTER_SCRIPT } from '../src/virtual-robot-designer/data/fighting-blocks.js';
import { compileFlappyScratchScript } from '../src/virtual-robot-designer/data/flappy-block-runtime.js';
import { compileFootballScratchScript } from '../src/virtual-robot-designer/data/football-block-runtime.js';
import { compileFightingScratchScript } from '../src/virtual-robot-designer/data/fighting-block-runtime.js';
import { blocksToPython, pythonToBlocks } from '../src/virtual-robot-designer/studio/robotPython.js';
const cases = [
  ['flappy', FLAPPY_BLOCK_LIBRARY, FLAPPY_STARTER_SCRIPT, compileFlappyScratchScript, 'birdbot', 'birdbot'],
  ['craft', CRAFT_BLOCK_LIBRARY, CRAFT_STARTER_SCRIPT, compileCraftScript, 'wheeled', 'blockbot'],
  ['football', FOOTBALL_BLOCK_LIBRARY, FOOTBALL_STARTER_SCRIPT, compileFootballScratchScript, 'footballbot', 'footballbot'],
  ['fighting', FIGHTING_BLOCK_LIBRARY, FIGHTING_STARTER_SCRIPT, compileFightingScratchScript, 'walker', 'striker'],
];
test.each(cases)('%s round trip', (style, lib, starter, compile, group, robotType) => {
  const script = starter.filter((b) => b.id !== 'when_start');
  const py = blocksToPython(script, lib, { group, robotType, style });
  const r = pythonToBlocks(py, lib, { group, robotType, style });
  expect(r.errors).toEqual([]);
  const norm = (prog) => JSON.stringify(prog, (k, v) => (k === 'id' ? undefined : v));
  expect(norm(compile(r.blocks))).toEqual(norm(compile(script)));
});
test('extras compile', () => {
  const { gamePythonExtras } = require('../src/virtual-robot-designer/studio/robotPythonGames.js');
  for (const [style, lib, , , group, robotType] of cases) {
    for (const [code, label] of gamePythonExtras(style)) {
      const pre = /score|logs/.test(code) && !/^(score|logs) = 0/.test(code) ? (style === 'flappy' ? 'score = 0\n' : 'logs = 0\n') : '';
      const r = pythonToBlocks(pre + code, lib, { group, robotType, style });
      expect(r.errors).toEqual([]);
    }
  }
});

test('friendly errors', () => {
  const err = (style, code) => {
    const c = cases.find((x) => x[0] === style);
    return pythonToBlocks(code, c[1], { group: c[4], robotType: c[5], style }).errors[0]?.message || '';
  };
  expect(err('football', 'while True:\n    if robot.have_ball():\n        robot.dribble()\n        robot.shoot()')).toMatch(/one move/);
  expect(err('football', 'while True:\n    if robot.have_ball():\n        robot.shoot()\n    robot.chase_ball()')).toMatch(/else:/);
  expect(err('fighting', 'while True:\n    if robot.enemy_close():\n        robot.jab()\n    else:\n        robot.block()')).toMatch(/no elif or else/);
  expect(err('fighting', 'if robot.enemy_close():\n    robot.jab()\nrobot.block()')).toMatch(/belongs to that if/);
  expect(err('flappy', 'if robot.bird_hight() < 3:\n    robot.flap()')).toMatch(/isn't a Flappy reading/);
  expect(err('craft', 'if robot.block_ahead() == "lgo":\n    robot.mine_ahead()')).toMatch(/Did you mean "log"/);
  expect(err('flappy', 'robot.flap(')).toBeTruthy();
});

test('flappy if / else and variables become nested blocks', () => {
  const c = cases[0];
  const r = pythonToBlocks('score = 0\nwhile True:\n    if robot.pipe_distance() < 3:\n        robot.flap()\n    else:\n        wait(0.2)\n\ndef on_gap_passed():\n    score += 1', c[1], { group: c[4], robotType: c[5], style: 'flappy' });
  expect(r.errors).toEqual([]);
  expect(r.blocks.map((b) => b.id)).toEqual(['set_var', 'forever', 'if_then', 'flap', 'else', 'wait', 'end', 'end', 'when_gap_passed', 'change_var']);
  const prog = compileFlappyScratchScript(r.blocks);
  expect(prog.handlers.start[1].op).toBe('forever');
  expect(prog.handlers.start[1].body[0].elseBody[0].op).toBe('wait');
  expect(prog.handlers.gap_passed[0].op).toBe('var_change');
});
