/** 🪽 Flap Bot — Sky Dodger: variables as speed, gravity and scrolling obstacles. */
import * as B from './blocklyXml';
import { IMG, rock } from './art';
import { usesBlock } from './checks';

/** Flyer: falls; flap = jump up; physics = a "speed" variable; crash = game over. */
const flyerScript = ({ flap = false, physics = false, crash = false, ceiling = false } = {}) => B.workspace(
  B.script([
    B.whenFlag(), B.setScore(0), B.goTo(-140, 0), physics && B.setVar('speed', 0),
    B.forever(
      physics ? B.changeVar('speed', -0.5) : B.changeY(-3),
      physics && B.changeYBy(B.getVar('speed')),
      crash && B.ifThen(B.touching('Rock'), B.gameOver()),
      crash && B.ifThen(B.lt(B.yPos(), -150), B.gameOver()),
      ceiling && B.ifThen(B.gt(B.yPos(), 150), B.setY(150), B.setVar('speed', 0)),
    ),
  ]),
  flap && B.script([B.whenKey('space'), physics ? B.setVar('speed', 9) : B.changeY(45)], 24, 260),
);

const rockScript = ({ spawn = false, points = false, faster = false } = {}) => B.workspace(
  B.script([B.whenFlag(), B.hide(), faster && B.setVar('rock speed', -6), spawn && B.forever(B.createClone('myself'), faster && B.changeVar('rock speed', -0.5), B.wait(1.6))]),
  spawn && B.script([
    B.whenCloned(), B.goToBy(null, B.random(-130, 130)), B.setX(260), B.show(),
    B.repeat(70, faster ? B.changeXBy(B.getVar('rock speed')) : B.changeX(-8)), points && B.addScore(1), B.deleteClone(),
  ], 24, 150),
);

export const flapBot = {
  id: 'flap-bot',
  title: 'Flap Bot',
  subtitle: 'Sky Dodger',
  emoji: '🪽',
  color: '#8b5cf6',
  concept: 'Variables & gravity',
  blurb: 'Tap SPACE to fly through a rock storm. Code real gravity with a speed variable.',
  background: 'Floating Islands',
  extensions: [],
  focus: 'Flyer',
  sprites: () => [
    { name: 'Flyer', img: IMG.bot, x: -140, y: 0, w: 30, h: 56, xml: flyerScript() },
    { name: 'Rock', img: rock, x: 260, y: 0, w: 48, h: 60, visible: false, xml: rockScript() },
  ],
  challenges: [
    {
      id: 'flap',
      title: 'Flap!',
      goal: 'Make the Flyer fall all the time, and jump up when you press SPACE.',
      hints: ['Under "when ▶ clicked": "go to x: -140 y: 0", then "forever: change y by -3" so it falls.', 'Add a new script: "when space key pressed".', 'Under it put "change y by 45".'],
      par: 7,
      check: (ctx) => {
        const f = ctx.sprite('Flyer');
        if (!f) return { pass: false };
        ctx.memo.low = Math.max(ctx.memo.low ?? f.y, f.y); // canvas y grows downwards
        return f.y < ctx.memo.low - 30 ? { pass: true } : { pass: false, note: 'Press SPACE to flap upwards.' };
      },
      solution: flyerScript({ flap: true }),
    },
    {
      id: 'gravity',
      title: 'Real gravity',
      goal: 'Make flying feel smooth: a variable "speed" gets 0.5 smaller every frame, the Flyer changes y by speed, and SPACE sets speed to 9.',
      hints: [
        'Variables → make a variable "speed". Set it to 0 when the flag is clicked.',
        'In the forever loop: change speed by −0.5, then change y by (speed).',
        'When space is pressed: set speed to 9 (instead of change y by 45).',
      ],
      par: 10,
      star2: { label: 'Stayed in the sky', test: (ctx) => { const f = ctx.sprite('Flyer'); return !!f && f.y > 0 && f.y < 300; } },
      check: (ctx) => {
        const xml = ctx.xml('Flyer');
        if (!usesBlock(xml, 'data_changevariableby') || !usesBlock(xml, 'data_setvariableto')) return { pass: false, note: 'Use "set speed" and "change speed" blocks.' };
        const f = ctx.sprite('Flyer');
        if (!f) return { pass: false };
        ctx.memo.low = Math.max(ctx.memo.low ?? f.y, f.y);
        return f.y < ctx.memo.low - 30 ? { pass: true } : { pass: false, note: 'Press SPACE to fly up.' };
      },
      solution: flyerScript({ flap: true, physics: true }),
    },
    {
      id: 'ceiling',
      title: 'Mind your head',
      goal: 'Stop the Flyer zooming off the top: if it goes higher than y = 150, put it back at 150 and set speed to 0.',
      hints: ['In the Flyer\'s forever loop add: if (y position) > 150 then …', 'Inside: set y to 150, set speed to 0.', 'Tap SPACE lots of times to test it.'],
      par: 15,
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Flyer'), 'operator_gt')) return { pass: false, note: 'Use "if (y position) > 150".' };
        const f = ctx.sprite('Flyer');
        if (!f) return { pass: false };
        if (f.y < -4) return { pass: false, fail: true, note: 'The Flyer left the top of the screen!' };
        if (f.y < 40) ctx.memo.nearTop = (ctx.memo.nearTop || 0) + 1;
        return (ctx.memo.nearTop || 0) >= 6 ? { pass: true } : { pass: false, note: 'Tap SPACE to fly right up to the top.' };
      },
      solution: flyerScript({ flap: true, physics: true, ceiling: true }),
    },
    {
      id: 'rocks',
      title: 'Rock storm',
      goal: 'Make the Rock send a clone every 1.6 seconds that flies in from the right at a random height.',
      hints: [
        'Click the Rock. After "hide", add forever → create clone of myself → wait 1.6.',
        'When I start as a clone: go to a random y, set x to 260, show.',
        'Then repeat 70: change x by −8. Finish with delete this clone.',
      ],
      par: 13,
      parSprite: 'Rock',
      check: (ctx) => {
        const r = ctx.sprites.find((s) => s.name === 'Rock' && s.isClone && s.visible !== false);
        if (r) { ctx.memo.x0 = ctx.memo.x0 ?? r.x; if (r.x < ctx.memo.x0 - 60) return { pass: true }; }
        return { pass: false, note: 'Waiting for a rock to fly across…' };
      },
      solution: flyerScript({ flap: true, physics: true }),
      solutionFor: { Rock: rockScript({ spawn: true }) },
    },
    {
      id: 'crash',
      title: 'Crash and score',
      goal: 'Game over if the Flyer touches a Rock or falls to the ground — and score 1 point for every rock that flies past.',
      hints: [
        'In the Flyer\'s forever loop: if touching Rock? → game over.',
        'Falling counts too: if (y position) < −150 → game over.',
        'In the Rock clone script, add 1 to score just before "delete this clone".',
      ],
      par: 17,
      star2: { label: 'Passed 3 rocks', test: (ctx) => ctx.score >= 3 },
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Flyer'), 'bb_game_over')) return { pass: false, note: 'The Flyer needs a "game over" when it touches a Rock.' };
        return ctx.score >= 2 ? { pass: true } : { pass: false, note: `Rocks passed: ${ctx.score} of 2.` };
      },
      solution: flyerScript({ flap: true, physics: true, crash: true }),
      solutionFor: { Rock: rockScript({ spawn: true, points: true }) },
    },
    {
      id: 'faster-rocks',
      title: 'Rush hour',
      goal: 'Make each rock fly a bit faster than the last: a variable "rock speed" starts at -6 and changes by -0.5 for every new rock.',
      hints: ['Rock: set rock speed to -6 when the flag is clicked.', 'In the loop that makes clones: change rock speed by -0.5.', 'In the clone script: change x by (rock speed) instead of -8.'],
      par: 18,
      parSprite: 'Rock',
      check: (ctx) => {
        const xml = ctx.xml('Rock');
        if (!usesBlock(xml, 'data_changevariableby') || !/DX_SLOT/.test(xml)) return { pass: false, note: 'Use "change x by (rock speed)" and "change rock speed by -0.5".' };
        const r = ctx.sprites.find((s) => s.name === 'Rock' && s.isClone && s.visible !== false);
        if (r) { ctx.memo.x0 = ctx.memo.x0 ?? r.x; if (r.x < ctx.memo.x0 - 60) return { pass: true }; }
        return { pass: false, note: 'Waiting for a rock to fly across…' };
      },
      solution: flyerScript({ flap: true, physics: true, ceiling: true }),
      solutionFor: { Rock: rockScript({ spawn: true, faster: true }) },
    },
  ],
};
