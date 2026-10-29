/** 🏓 Pong Bot — Paddle Ball: bouncing, directions and a little maths. */
import * as B from './blocklyXml';
import { ball, paddle } from './art';
import { usesBlock } from './checks';

const paddleScript = () => B.workspace(B.script([B.whenFlag(), B.setScore(0), B.setLives(3), B.forever(B.setXBy(B.mouseX()))]));

/** The ball's script, built up challenge by challenge. */
const ballScript = ({ bounce = false, paddleHit = false, miss = false, speed = false, randomServe = false } = {}) => {
  const serve = () => (randomServe ? B.pointBy(B.random(110, 160)) : B.pointIn(135));
  const hit = B.ifThen(B.touching('Paddle'),
    B.pointBy(B.minus(180, B.direction())), B.addScore(1), speed && B.changeVar('speed', 1), B.move(10));
  const lost = B.ifThen(B.lt(B.yPos(), -160), B.loseLife(), B.goTo(0, 60), serve());
  return B.workspace(B.script([
    B.whenFlag(), speed && B.setVar('speed', 5), B.goTo(0, 60), serve(),
    B.forever(speed ? B.moveBy(B.getVar('speed')) : B.move(6), miss && lost, bounce && B.bounce(), paddleHit && hit),
  ]));
};


export const pongBot = {
  id: 'pong-bot',
  title: 'Pong Bot',
  subtitle: 'Paddle Ball',
  emoji: '🏓',
  color: '#0ea5e9',
  concept: 'Angles & bounce',
  blurb: 'The classic! Keep the ball bouncing with a paddle that follows your mouse.',
  background: 'Neon City',
  extensions: [],
  focus: 'Ball',
  sprites: () => [
    { name: 'Paddle', img: paddle, x: 0, y: -150, w: 96, h: 18, xml: paddleScript() },
    { name: 'Ball', img: ball, x: 0, y: 60, w: 26, h: 26, xml: ballScript() },
  ],
  challenges: [
    {
      id: 'bounce',
      title: 'Bounce off the walls',
      goal: 'Get the ball moving and make it bounce off the edges of the screen.',
      hints: ['Under "when ▶ clicked": "go to x: 0 y: 60" and "point in direction 135".', 'Add a "forever" loop with "move 6 steps" inside.', 'Put an "if on edge, bounce" block inside the forever loop, under "move 6 steps".'],
      par: 6,
      check: (ctx) => {
        const b = ctx.sprite('Ball');
        if (!b) return { pass: false };
        ctx.memo.dir0 = ctx.memo.dir0 ?? b.direction;
        if (b.direction !== ctx.memo.dir0) ctx.memo.turned = true;
                return ctx.memo.turned ? { pass: true } : { pass: false, note: 'The ball is stuck on the edge — it needs to bounce.' };
      },
      solution: ballScript({ bounce: true }),
    },
    {
      id: 'paddle',
      title: 'Hit it with the paddle',
      goal: 'Make the ball bounce up off the Paddle, and score a point every time you hit it.',
      hints: [
        'Inside the forever loop add: if touching Paddle?',
        'Bouncing up means pointing in direction (180 − direction). Use the green − block with "direction" in it.',
        'Add 1 to score, then move 10 steps so the ball escapes the paddle.',
      ],
      par: 13,
      star2: { label: 'Scored 5', test: (ctx) => ctx.score >= 5 },
      check: (ctx) => (ctx.score >= 3 ? { pass: true } : { pass: false, note: `Hits: ${ctx.score} of 3. Move the mouse to steer the paddle.` }),
      solution: ballScript({ bounce: true, paddleHit: true }),
    },
    {
      id: 'miss',
      title: 'Missed it!',
      goal: 'If the ball gets past the paddle (y position less than −160), lose a life and serve again from the middle.',
      hints: [
        'Add: if (y position) < −160 then …',
        'Inside it: lose a life, go to x: 0 y: 60, point in direction 135.',
        'Put it above "if on edge, bounce", or the ball bounces before you check.',
      ],
      par: 19,
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Ball'), 'bb_game_lose_life')) return { pass: false, note: 'Use a "lose a life" block when the ball gets past.' };
        return ctx.probe.count('lose-life') > 0 ? { pass: true } : { pass: false, note: 'Let the ball get past the paddle once.' };
      },
      solution: ballScript({ bounce: true, paddleHit: true, miss: true }),
    },
    {
      id: 'serve',
      title: 'Surprise serve',
      goal: 'Make every serve go a different way: point the ball in a random direction between 110 and 160.',
      hints: ['Find both "point in direction 135" blocks — at the start and after a miss.', 'Drop a green "pick random 110 to 160" into each one.', 'Watch: every serve now starts at a new angle.'],
      par: 21,
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Ball'), 'operator_random')) return { pass: false, note: 'Use "pick random 110 to 160" for the direction.' };
        return ctx.score >= 2 ? { pass: true } : { pass: false, note: `Hits: ${ctx.score} of 2.` };
      },
      solution: ballScript({ bounce: true, paddleHit: true, miss: true, randomServe: true }),
    },
    {
      id: 'faster',
      title: 'Speed it up',
      goal: 'Make a variable called "speed". Start it at 5, move (speed) steps, and add 1 to speed every time you hit the ball.',
      hints: [
        'Variables → make a variable "speed". Set speed to 5 when the flag is clicked.',
        'Swap "move 6 steps" for "move (speed) steps".',
        'In the paddle hit, change speed by 1.',
      ],
      par: 22,
      star2: { label: 'Scored 5 at top speed', test: (ctx) => ctx.score >= 5 },
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Ball'), 'data_changevariableby')) return { pass: false, note: 'Use "change speed by 1" when the ball hits the paddle.' };
        return ctx.score >= 3 ? { pass: true } : { pass: false, note: `Hits: ${ctx.score} of 3.` };
      },
      solution: ballScript({ bounce: true, paddleHit: true, miss: true, speed: true }),
    },
    {
      id: 'win10',
      title: 'First to 10',
      goal: 'Win the game as soon as you have hit the ball 10 times.',
      hints: ['Click the Paddle and add a second "when ▶ clicked" script.', '"wait until (score) > 9", then the 🏆 win block.'],
      par: 11,
      parSprite: 'Paddle',
      star2: { label: 'Won without missing', test: (ctx) => ctx.probe.count('lose-life') === 0 },
      check: (ctx) => (ctx.probe.won ? { pass: true } : { pass: false, note: `Hits: ${ctx.score} of 10.` }),
      solution: ballScript({ bounce: true, paddleHit: true, miss: true }),
      solutionFor: { Paddle: B.workspace(B.script([B.whenFlag(), B.setScore(0), B.setLives(3), B.forever(B.setXBy(B.mouseX()))]), B.script([B.whenFlag(), B.waitUntil(B.gt(B.score(), 9)), B.win()], 24, 200)) },
    },
  ],
};
