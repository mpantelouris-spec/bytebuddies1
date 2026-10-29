/** 🧺 Catch Bot — Falling Treats: clones, random and keeping score. */
import * as B from './blocklyXml';
import { IMG } from './art';
import { usesBlock } from './checks';

const catcherStarter = (keys = [B.ifThen(B.keyPressed('right'), B.changeX(8))]) => B.workspace(B.script([
  B.whenFlag(), B.setScore(0), B.setLives(3), B.goTo(0, -135),
  B.forever(...keys),
]));
const fallerScript = (onCatch, speed = -6) => B.workspace(
  B.script([B.whenFlag(), B.hide(), B.forever(B.createClone('myself'), B.wait(1))]),
  B.script([
    B.whenCloned(), B.goToXBy(B.random(-220, 220), 170), B.show(),
    B.repeat(60, B.changeY(speed), B.ifThen(B.touching('Catcher'), ...onCatch, B.deleteClone())),
    B.deleteClone(),
  ], 24, 200),
);
const appleScript = () => fallerScript([B.addScore(1)]);
const ARROWS = [B.ifThen(B.keyPressed('right'), B.changeX(8)), B.ifThen(B.keyPressed('left'), B.changeX(-8))];
const WRAP = [B.ifThen(B.gt(B.xPos(), 200), B.setX(-200)), B.ifThen(B.lt(B.xPos(), -200), B.setX(200))];

export const catchBot = {
  id: 'catch-bot',
  title: 'Catch Bot',
  subtitle: 'Falling Treats',
  emoji: '🧺',
  color: '#e11d48',
  concept: 'Clones & random',
  blurb: 'Apples rain from the sky. Catch them, dodge the bombs, and make it speed up!',
  background: 'Farm',
  extensions: [],
  focus: 'Catcher',
  sprites: () => [
    { name: 'Catcher', img: IMG.rollbot, x: 0, y: -135, w: 44, h: 68, xml: catcherStarter() },
    { name: 'Apple', img: IMG.apple, x: 0, y: 170, w: 32, h: 37, xml: appleScript() },
    { name: 'Bomb', img: IMG.bomb, x: 200, y: 150, w: 24, h: 38, xml: '' },
  ],
  challenges: [
    {
      id: 'move',
      title: 'Move both ways',
      goal: 'Make the Catcher move left and right with the arrow keys, along the bottom of the screen.',
      hints: ['Under "when ▶ clicked": "set score to 0", "set lives to 3", then "go to x: 0 y: -135".', 'Add a "forever" loop: if → pressed change x by 8.', 'Then add another if: ← pressed → change x by -8.'],
      par: 11,
      check: (ctx) => {
        const c = ctx.sprite('Catcher');
        if (!c) return { pass: false };
        ctx.memo.start = ctx.memo.start ?? c.x;
        return c.x < ctx.memo.start - 40 ? { pass: true } : { pass: false, note: 'Press ← while playing.' };
      },
      solution: catcherStarter([B.ifThen(B.keyPressed('right'), B.changeX(8)), B.ifThen(B.keyPressed('left'), B.changeX(-8))]),
    },
    {
      id: 'catch5',
      title: 'Catch 5',
      goal: 'Apples fall from random places. Catch 5 of them!',
      hints: ['The Apple makes a clone of itself every second — click it to see how.', 'Each clone goes to a random x at the top and falls.'],
      par: 11,
      check: (ctx) => (ctx.score >= 5 ? { pass: true } : { pass: false, note: `Score: ${ctx.score} of 5.` }),
      solution: catcherStarter([B.ifThen(B.keyPressed('right'), B.changeX(8)), B.ifThen(B.keyPressed('left'), B.changeX(-8))]),
    },
    {
      id: 'wrap',
      title: 'Wrap around',
      goal: 'Drive off the right side of the screen and come back on the left — like Pac-Man! (And off the left comes back on the right.)',
      hints: ['In the forever loop add: if (x position) > 200 then set x to -200.', 'Add the opposite too: if (x position) < -200 then set x to 200.', 'Hold → while playing to test it.'],
      par: 19,
      star2: { label: 'Wraps both ways', test: (ctx) => usesBlock(ctx.xml('Catcher'), 'operator_lt') && usesBlock(ctx.xml('Catcher'), 'operator_gt') },
      check: (ctx) => {
        const c = ctx.sprite('Catcher');
        if (!c) return { pass: false };
        const cx = c.x + c.w / 2;
        if (cx > 400) ctx.memo.right = true;
        if (ctx.memo.right && cx < 80) return { pass: true };
        return { pass: false, note: 'Hold → and drive off the right edge.' };
      },
      solution: catcherStarter([...ARROWS, ...WRAP]),
    },
    {
      id: 'bombs',
      title: 'Dodge the bombs',
      goal: 'Make the Bomb fall like the apples — but catching one loses a life!',
      hints: ['Copy the Apple\'s two scripts onto the Bomb.', 'Swap "add 1 to score" for "💔 lose a life".', 'Make the bombs wait 2 seconds between clones so it is fair.'],
      par: 16,
      parSprite: 'Bomb',
      star2: { label: 'Dodged a bomb', test: (ctx) => ctx.probe.count('lose-life') === 0 && ctx.score >= 3 },
      check: (ctx) => {
        const xml = ctx.xml('Bomb');
        const falls = ctx.sprites.some((s) => s.name === 'Bomb' && s.isClone && s.visible !== false) || ctx.memo.bombSeen;
        if (falls) ctx.memo.bombSeen = true;
        if (usesBlock(xml, 'bb_game_lose_life') && ctx.memo.bombSeen) return { pass: true };
        return { pass: false, note: !usesBlock(xml, 'bb_game_lose_life') ? 'Give the Bomb a "lose a life" when it touches the Catcher.' : 'Press ▶ Play to drop some bombs.' };
      },
      solution: catcherStarter([B.ifThen(B.keyPressed('right'), B.changeX(8)), B.ifThen(B.keyPressed('left'), B.changeX(-8))]),
      solutionFor: { Bomb: fallerScript([B.loseLife()], -5) },
    },
    {
      id: 'win10',
      title: 'Ten to win',
      goal: 'Win the game when the score reaches 10.',
      hints: ['Give the Catcher a second "when ▶ clicked" script.', 'Use "wait until (score) > 9" — score is in the Game blocks.', 'Then the 🏆 win block.'],
      par: 16,
      star2: { label: 'Won without losing a life', test: (ctx) => ctx.probe.count('lose-life') === 0 },
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Catcher'), 'bb_game_win')) return { pass: false, note: 'Use the 🏆 win block.' };
        return ctx.probe.won ? { pass: true } : { pass: false, note: `Score: ${ctx.score} of 10.` };
      },
      solution: B.workspace(
        B.script([B.whenFlag(), B.setScore(0), B.setLives(3), B.goTo(0, -135), B.forever(...ARROWS)]),
        B.script([B.whenFlag(), B.waitUntil(B.gt(B.score(), 9)), B.win()], 24, 260),
      ),
    },
    {
      id: 'faster',
      title: 'Faster and faster',
      goal: 'Make the apples fall faster as the game goes on, using a variable "fall speed".',
      hints: ['Make a variable "fall speed" and set it to -4 when the flag is clicked.', 'In the clone script use "change y by (fall speed)".', 'Every time a clone is made, change fall speed by -0.3.'],
      par: 21,
      parSprite: 'Apple',
      star2: { label: 'Caught 5 at top speed', test: (ctx) => ctx.score >= 5 },
      check: (ctx) => {
        const xml = ctx.xml('Apple');
        if (!usesBlock(xml, 'data_changevariableby')) return { pass: false, note: 'Use "change fall speed by" so the speed changes.' };
        return ctx.score >= 3 ? { pass: true } : { pass: false, note: `Catch 3 apples to finish (score ${ctx.score}).` };
      },
      solution: catcherStarter([B.ifThen(B.keyPressed('right'), B.changeX(8)), B.ifThen(B.keyPressed('left'), B.changeX(-8))]),
      solutionFor: {
        Apple: B.workspace(
          B.script([B.whenFlag(), B.hide(), B.setVar('fall speed', -4), B.forever(B.createClone('myself'), B.changeVar('fall speed', -0.3), B.wait(1))]),
          B.script([B.whenCloned(), B.goToXBy(B.random(-220, 220), 170), B.show(),
            B.repeat(80, B.changeYBy(B.getVar('fall speed')), B.ifThen(B.touching('Catcher'), B.addScore(1), B.deleteClone())), B.deleteClone()], 24, 220),
        ),
      },
    },
  ],
};
