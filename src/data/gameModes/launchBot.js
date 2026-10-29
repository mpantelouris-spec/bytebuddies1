/** 🎯 Launch Bot — Hit the Target: variables, speed and gravity. */
import * as B from './blocklyXml';
import { IMG, launcher } from './art';
import { overlap, usesBlock, toCanvas } from './checks';

const PAD = [-190, -130];

/** The ball's flight: speed x / speed y are variables; gravity pulls speed y down each step. */
const flight = (sx, sy) => [
  B.goTo(PAD[0], PAD[1] + 22), B.show(),
  B.setVar('speed x', sx), B.setVar('speed y', sy),
  B.repeat(90,
    B.changeXBy(B.getVar('speed x')),
    B.changeYBy(B.getVar('speed y')),
    B.changeVar('speed y', -0.5),
    B.ifThen(B.touching('Target'), B.addScore(1), B.say('Bullseye!', 1), B.stopAll()),
  ),
];
const ballStarter = (sx = 5, sy = 9) => B.workspace(B.script([B.whenFlag(), B.setScore(0), ...flight(sx, sy)]));
/** Same throw, but a "wind" variable pushes the ball back a little every step. */
const windStarter = (sx, sy) => B.workspace(B.script([
  B.whenFlag(), B.setScore(0), B.setVar('wind', -0.05), B.goTo(PAD[0], PAD[1] + 22), B.show(),
  B.setVar('speed x', sx), B.setVar('speed y', sy),
  B.repeat(90,
    B.changeXBy(B.getVar('speed x')), B.changeYBy(B.getVar('speed y')),
    B.changeVar('speed y', -0.5), B.changeVar('speed x', B.getVar('wind')),
    B.ifThen(B.touching('Target'), B.addScore(1), B.say('Bullseye!', 1), B.stopAll())),
]));

const moveTarget = (x, y) => (sprites) => sprites.map((s) => {
  if (s.name !== 'Target') return s;
  const c = toCanvas(x, y);
  return { ...s, x: c.x - s.w / 2, y: c.y - s.h / 2 };
});

const hitCheck = (ctx) => {
  const ball = ctx.sprite('Ball'); const target = ctx.sprite('Target');
  if (ball && target && overlap(ball, target, 2)) ctx.memo.hit = true;
  if (ctx.memo.hit || ctx.score >= 1) return { pass: true };
  return { pass: false, note: 'Change the speed numbers and try again.' };
};

export const launchBot = {
  id: 'launch-bot',
  title: 'Launch Bot',
  subtitle: 'Hit the Target',
  emoji: '🎯',
  color: '#f97316',
  concept: 'Variables & maths',
  blurb: 'Tune speed and gravity to land a bullseye — then aim with the keyboard.',
  background: 'Sunset Hills',
  extensions: [],
  focus: 'Ball',
  sprites: () => [
    { name: 'Launcher', img: launcher, x: PAD[0], y: PAD[1], w: 56, h: 48, xml: '' },
    { name: 'Ball', img: IMG.orb, x: PAD[0], y: PAD[1] + 22, w: 26, h: 24, xml: ballStarter() },
    { name: 'Target', img: IMG.target, x: 150, y: -125, w: 52, h: 53, xml: '' },
  ],
  challenges: [
    {
      id: 'bullseye',
      title: 'Bullseye',
      goal: 'Throw the ball at the target! Make variables "speed x" and "speed y", then move the ball step by step while gravity pulls it down. Change the speeds until you hit.',
      hints: ['Under "when ▶ clicked": "go to x: -190 y: -108", set speed x to 5, set speed y to 9.', 'Repeat 90: change x by (speed x), change y by (speed y), change speed y by -0.5.', 'Inside the repeat: if touching Target → add 1 to score and stop.', 'speed x = how fast it flies sideways. speed y = how hard it is thrown upwards.', 'Gravity takes 0.5 off speed y every step — that makes the curve.', 'Throwing higher (more speed y) keeps the ball in the air longer, so it flies further.'],
      par: 17,
      setup: moveTarget(150, -125),
      check: hitCheck,
      solution: ballStarter(7, 12),
    },
    {
      id: 'tower',
      title: 'Up on the tower',
      goal: 'The target moved up high! Find a throw that reaches it.',
      hints: ['A higher target needs more speed y.', 'If you overshoot, use less speed x.'],
      par: 17,
      setup: moveTarget(40, 60),
      check: hitCheck,
      solution: ballStarter(5, 14),
    },
    {
      id: 'far',
      title: 'Long shot',
      goal: 'The target is right at the far side. Find a throw that reaches it.',
      hints: ['To go further you need more speed x, more speed y — or both.', 'More speed y keeps the ball in the air longer, so it travels further sideways.', 'Change one number at a time so you can see what it does.'],
      par: 17,
      setup: moveTarget(200, -125),
      check: hitCheck,
      solution: ballStarter(7, 14),
    },
    {
      id: 'wind',
      title: 'Windy day',
      goal: 'A headwind! Make a variable "wind" set to -0.05, and every step change speed x by (wind). Then find a throw that still hits.',
      hints: ['Make a variable "wind" and set it to -0.05 when the flag is clicked.', 'Inside the repeat: change speed x by (wind) — drag the orange "wind" into the number.', 'The wind slows the ball down sideways, so throw a bit harder.'],
      par: 20,
      setup: moveTarget(150, -125),
      check: (ctx) => {
        const xml = ctx.xml('Ball');
        if (!/name="VARIABLE"[^>]*>wind</.test(xml)) return { pass: false, note: 'Make a variable called "wind".' };
        if ((xml.match(/data_changevariableby/g) || []).length < 2) return { pass: false, note: 'Change speed x by (wind) every step.' };
        return hitCheck(ctx);
      },
      solution: windStarter(8, 12),
    },
    {
      id: 'aim',
      title: 'Aim with the keyboard',
      goal: 'Let the player aim! ↑/↓ change "speed y", ←/→ change "speed x", and SPACE launches the ball.',
      hints: ['when ↑ key pressed → change aim y by 1 (make variables "aim x" and "aim y").', 'when space key pressed → set speed x to aim x, set speed y to aim y, then fly.', 'Show the variables on the stage so the player can see their aim.'],
      par: 32,
      star2: { label: 'Aimed with arrow keys', test: (ctx) => usesBlock(ctx.xml('Ball'), 'event_whenkeypressed') },
      setup: moveTarget(110, -40),
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Ball'), 'event_whenkeypressed')) return { pass: false, note: 'Add "when key pressed" scripts so the player can aim.' };
        return hitCheck(ctx);
      },
      solution: B.workspace(
        B.script([B.whenFlag(), B.setScore(0), B.setVar('aim x', 7), B.setVar('aim y', 12), B.goTo(PAD[0], PAD[1] + 22)]),
        B.script([B.whenKey('up'), B.changeVar('aim y', 1), B.say('Aim up', 0.4)], 24, 170),
        B.script([B.whenKey('down'), B.changeVar('aim y', -1), B.say('Aim down', 0.4)], 24, 260),
        B.script([B.whenKey('right'), B.changeVar('aim x', 1)], 24, 350),
        B.script([B.whenKey('left'), B.changeVar('aim x', -1)], 24, 420),
        B.script([B.whenKey('space'), B.goTo(PAD[0], PAD[1] + 22), B.setVar('speed x', B.getVar('aim x')), B.setVar('speed y', B.getVar('aim y')),
          B.repeat(90, B.changeXBy(B.getVar('speed x')), B.changeYBy(B.getVar('speed y')), B.changeVar('speed y', -0.5),
            B.ifThen(B.touching('Target'), B.addScore(1), B.say('Bullseye!', 1), B.stopAll()))], 24, 490),
      ),
    },
  ],
};
