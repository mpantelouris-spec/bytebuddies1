import * as B from '../src/data/gameModes/blocklyXml';
import { findTips, readScript, parseScripts, answerQuestion } from '../src/components/gamebuilder/byteTutor';
import { GAME_MODES } from '../src/data/gameModes';

const ws = (...scripts) => B.workspace(...scripts.map((s) => B.script(s)));
const tipsFor = (xml, others = []) => findTips({ sprite: { name: 'Hero', blocklyXml: xml }, sprites: [{ name: 'Hero', blocklyXml: xml }, ...others] }).map((t) => t.id);

describe('Byte, the coding buddy', () => {
  test('reads a script back in plain words', () => {
    const [script] = parseScripts(ws([B.whenFlag(), B.goTo(0, 0), B.forever(B.move(5), B.bounce())]));
    const lines = readScript(script).map((l) => `${'  '.repeat(l.depth)}${l.text}`);
    expect(lines).toEqual(['When ▶ is clicked', 'go to x: 0, y: 0', 'repeat forever', '  move 5 steps', '  bounce if it touches the edge']);
  });

  test('an empty sprite gets a "start here" tip', () => {
    expect(tipsFor('')).toEqual(['empty']);
  });

  test('spots blocks that are not under a start block', () => {
    expect(tipsFor(ws([B.move(10)]))).toContain('no-hat');
  });

  test('spots movement that only happens once', () => {
    expect(tipsFor(ws([B.whenFlag(), B.move(10)]))).toContain('moves-once');
    expect(tipsFor(ws([B.whenFlag(), B.forever(B.move(10))]))).not.toContain('moves-once');
  });

  test('spots a key check outside a loop', () => {
    expect(tipsFor(ws([B.whenFlag(), B.ifThen(B.keyPressed('right'), B.changeX(5))]))).toContain('if-once');
    expect(tipsFor(ws([B.whenFlag(), B.forever(B.ifThen(B.keyPressed('right'), B.changeX(5)))]))).not.toContain('if-once');
  });

  test('spots touching a sprite that does not exist', () => {
    const xml = ws([B.whenFlag(), B.forever(B.ifThen(B.touching('Dragon'), B.addScore(1)))]);
    expect(tipsFor(xml, [{ name: 'Coin', blocklyXml: '' }])).toContain('touch-missing');
    expect(tipsFor(xml, [{ name: 'Dragon', blocklyXml: '' }])).not.toContain('touch-missing');
  });

  test('reads numbers typed into slots and ignores "touching mouse"', () => {
    const [script] = parseScripts(ws([B.whenFlag(), B.setVar('coins', 0), B.forever(B.changeVar('coins', 1), B.ifThen(B.touching('mouse'), B.addScore(1)))]));
    expect(readScript(script).map((l) => l.text)).toContain('change coins by 1');
    expect(tipsFor(ws([B.whenFlag(), B.forever(B.ifThen(B.touching('_mouse_'), B.addScore(1)))]), [{ name: 'Coin', blocklyXml: '' }])).not.toContain('touch-missing');
  });

  test('spots a variable that never gets a starting value', () => {
    expect(tipsFor(ws([B.whenFlag(), B.forever(B.changeVar('speed', 1))]))).toContain('var-speed');
    expect(tipsFor(ws([B.whenFlag(), B.setVar('speed', 0), B.forever(B.changeVar('speed', 1))]))).not.toContain('var-speed');
  });

  test('spots clone mistakes', () => {
    expect(tipsFor(ws([B.whenFlag(), B.forever(B.createClone('myself'))]))).toEqual(expect.arrayContaining(['clone-idle', 'clone-flood']));
    expect(tipsFor(ws([B.whenKey('space'), B.createClone('myself')], [B.whenCloned(), B.show()]))).toContain('key-clone');
  });

  test('a planned route of big moves is not a "moves once" bug', () => {
    expect(tipsFor(ws([B.whenFlag(), B.move(160), B.turnLeft(90), B.move(120)]))).not.toContain('moves-once');
  });

  test('"when level starts" scripts count as properly started', () => {
    const xml = B.workspace(B.script([B.whenFlag(), B.forever(B.move(5))]), '<block type="bb_game_when_level" x="0" y="0"><field name="LEVEL">2</field><next><block type="looks_show"></block></next></block>'.replace(/^/, ''));
    expect(tipsFor(xml)).not.toContain('no-hat');
    expect(answerQuestion('how do I make a second level?')).toMatch(/Levels bar/);
  });

  test('spots messages nobody hears', () => {
    expect(tipsFor(ws([B.whenFlag(), B.broadcast('go')]))).toContain('unheard-go');
  });

  test('every Game Mode model answer is free of beginner-bug warnings', () => {
    const noisy = [];
    GAME_MODES.forEach((m) => {
      const sprites = m.sprites().map((s) => ({ name: s.name, blocklyXml: s.xml }));
      m.challenges.forEach((ch) => {
        const solved = sprites.map((s) => ({ ...s, blocklyXml: ch.solutionFor?.[s.name] || (s.name === m.focus ? ch.solution : s.blocklyXml) || '' }));
        solved.filter((s) => s.blocklyXml).forEach((s) => {
          const ids = findTips({ sprite: s, sprites: solved }).filter((t) => t.kind === 'bug').map((t) => t.id);
          if (ids.length) noisy.push(`${m.title} / ${ch.title} / ${s.name}: ${ids.join(', ')}`);
        });
      });
    });
    expect(noisy).toEqual([]);
  });

  test('answers "how do I" questions with a concept, not code to copy', () => {
    expect(answerQuestion('how do I make it jump?')).toMatch(/up/i);
    expect(answerQuestion('help me keep score')).toMatch(/score/i);
    expect(answerQuestion('how do i make enemies chase me')).toMatch(/point towards/i);
    expect(answerQuestion('banana')).toMatch(/telling me what you want/i);
  });
});
