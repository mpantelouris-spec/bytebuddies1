/** 🍩 Chase Bot — Snack Attack: x/y coordinates, random spots and a chasing enemy. */
import * as B from './blocklyXml';
import { IMG, donut, ghost } from './art';
import { usesBlock } from './checks';

const EDGES = [
  B.ifThen(B.gt(B.xPos(), 215), B.setX(215)), B.ifThen(B.lt(B.xPos(), -215), B.setX(-215)),
  B.ifThen(B.gt(B.yPos(), 150), B.setY(150)), B.ifThen(B.lt(B.yPos(), -150), B.setY(-150)),
];
const playerScript = (upDown = false, edges = false) => B.workspace(B.script([
  B.whenFlag(), B.setScore(0), B.setLives(3), B.goTo(0, 0),
  B.forever(
    B.ifThen(B.keyPressed('right'), B.changeX(6)),
    B.ifThen(B.keyPressed('left'), B.changeX(-6)),
    upDown && B.ifThen(B.keyPressed('up'), B.changeY(6)),
    upDown && B.ifThen(B.keyPressed('down'), B.changeY(-6)),
    ...(edges ? EDGES : []),
  ),
]));

const snackScript = (eat = false, clock = false) => B.workspace(
  B.script([
    B.whenFlag(), B.goTo(150, 100),
    eat && B.forever(B.ifThen(B.touching('Player'), B.addScore(1), B.goToRandom())),
  ]),
  // 20-second countdown in a variable called "time"
  clock && B.script([
    B.whenFlag(), B.setVar('time', 20),
    B.repeat(20, B.wait(1), B.changeVar('time', -1)),
    B.gameOver(),
  ], 24, 200),
);

const ghostScript = (chase = false, speedUp = false) => B.workspace(B.script([
  B.whenFlag(), B.goTo(-200, 150), speedUp && B.setVar('ghost speed', 1),
  chase && B.forever(
    B.pointTowards('Player'), speedUp ? B.moveBy(B.getVar('ghost speed')) : B.move(2), speedUp && B.changeVar('ghost speed', 0.02),
    B.ifThen(B.touching('Player'), B.loseLife(), B.goTo(-200, 150), speedUp && B.setVar('ghost speed', 1)),
  ),
]));

export const chaseBot = {
  id: 'chase-bot',
  title: 'Chase Bot',
  subtitle: 'Snack Attack',
  emoji: '🍩',
  color: '#ec4899',
  concept: 'Coordinates & random',
  blurb: 'Zoom around grabbing donuts before the clock runs out — and dodge the ghost!',
  background: 'Candy Land',
  extensions: [],
  focus: 'Player',
  sprites: () => [
    { name: 'Player', img: IMG.rollbot, x: 0, y: 0, w: 36, h: 56, xml: playerScript() },
    { name: 'Snack', img: donut, x: 150, y: 100, w: 40, h: 40, xml: snackScript() },
    { name: 'Ghost', img: ghost, x: -200, y: 150, w: 40, h: 46, xml: ghostScript() },
  ],
  challenges: [
    {
      id: 'updown',
      title: 'Up and down',
      goal: 'Make the Player move in all four directions with the arrow keys.',
      hints: ['Under "when ▶ clicked": "set score to 0", "set lives to 3", "go to x: 0 y: 0".', 'Add "forever" with 4 "if … key pressed" blocks inside.', '→ change x by 6, ← change x by −6, ↑ change y by 6, ↓ change y by −6.'],
      par: 17,
      check: (ctx) => {
        const p = ctx.sprite('Player');
        if (!p) return { pass: false };
        ctx.memo.y0 = ctx.memo.y0 ?? p.y;
        return Math.abs(p.y - ctx.memo.y0) > 40 ? { pass: true } : { pass: false, note: 'Press ↑ or ↓ while playing.' };
      },
      solution: playerScript(true),
    },
    {
      id: 'edges',
      title: 'Stay on screen',
      goal: 'Don\'t let the Player escape! Keep it inside the screen: x between -215 and 215, y between -150 and 150.',
      hints: ['In the forever loop: if (x position) > 215 then set x to 215.', 'Do the same for the left (x < -215), the top (y > 150) and the bottom (y < -150).', 'Hold an arrow key to test — the Player should stop at the edge.'],
      par: 33,
      check: (ctx) => {
        const xml = ctx.xml('Player');
        if (!usesBlock(xml, 'motion_setx') || !usesBlock(xml, 'motion_sety')) return { pass: false, note: 'Use "set x to" and "set y to" to stop at the edges.' };
        const p = ctx.sprite('Player');
        if (!p) return { pass: false };
        const cx = p.x + p.w / 2;
        if (cx > 462) return { pass: false, fail: true, note: 'The Player went off the right side!' };
        if (cx > 445) ctx.memo.atEdge = (ctx.memo.atEdge || 0) + 1;
        return (ctx.memo.atEdge || 0) >= 6 ? { pass: true } : { pass: false, note: 'Hold → to drive to the edge.' };
      },
      solution: playerScript(true, true),
    },
    {
      id: 'snack',
      title: 'Grab the donut',
      goal: 'When the Player touches the Snack, add 1 to score and make the Snack jump to a random spot.',
      hints: ['Click the Snack. Add forever → if touching Player?', 'Inside: add 1 to score, then "go to random position".'],
      par: 7,
      parSprite: 'Snack',
      star2: { label: 'Ate 6 donuts', test: (ctx) => ctx.score >= 6 },
      check: (ctx) => (ctx.score >= 3 ? { pass: true } : { pass: false, note: `Donuts: ${ctx.score} of 3.` }),
      solution: playerScript(true),
      solutionFor: { Snack: snackScript(true) },
    },
    {
      id: 'clock',
      title: 'Beat the clock',
      goal: 'Give the game a 20-second countdown in a variable called "time". When it reaches 0, it\'s game over.',
      hints: [
        'Click the Snack and start a new "when flag clicked" script.',
        'Set time to 20, then repeat 20: wait 1 second, change time by −1.',
        'After the repeat, add game over.',
      ],
      par: 13,
      parSprite: 'Snack',
      check: (ctx) => {
        const xml = ctx.allXml('Player').join('') + ctx.allXml('Snack').join('');
        if (!usesBlock(xml, 'data_changevariableby') || !usesBlock(xml, 'control_repeat')) return { pass: false, note: 'Count "time" down with a repeat loop and "change time by −1".' };
        ctx.memo.t0 = ctx.memo.t0 ?? Date.now();
        return Date.now() - ctx.memo.t0 > 2500 ? { pass: true } : { pass: false, note: 'The clock is ticking…' };
      },
      solution: playerScript(true),
      solutionFor: { Snack: snackScript(true, true) },
    },
    {
      id: 'ghost',
      title: 'Ghost chase',
      goal: 'Make the Ghost chase you: forever point towards the Player and move 2 steps. If it catches you, lose a life.',
      hints: [
        'Click the Ghost. Add forever → point towards Player → move 2 steps.',
        'Add: if touching Player? → lose a life → go back to x: −200 y: 150.',
      ],
      par: 9,
      parSprite: 'Ghost',
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Ghost'), 'motion_pointtowards')) return { pass: false, note: 'Use "point towards Player" so the ghost follows you.' };
        return ctx.probe.count('lose-life') > 0 ? { pass: true } : { pass: false, note: 'Let the ghost catch you once.' };
      },
      solution: playerScript(true),
      solutionFor: { Snack: snackScript(true, true), Ghost: ghostScript(true) },
    },
    {
      id: 'speedy-ghost',
      title: 'Speedy ghost',
      goal: 'Make the Ghost get faster the longer it chases: a variable "ghost speed" starts at 1, goes up by 0.02 every step, and resets to 1 when it catches you.',
      hints: ['Ghost: set ghost speed to 1 when the flag is clicked.', 'In its forever loop: move (ghost speed) steps, then change ghost speed by 0.02.', 'When it catches you, set ghost speed back to 1.'],
      par: 13,
      parSprite: 'Ghost',
      check: (ctx) => {
        const xml = ctx.xml('Ghost');
        if (!usesBlock(xml, 'data_changevariableby') || !/STEPS_SLOT/.test(xml)) return { pass: false, note: 'Use "move (ghost speed) steps" and "change ghost speed by 0.02".' };
        return ctx.probe.count('lose-life') > 0 ? { pass: true } : { pass: false, note: 'Let the speedy ghost catch you once.' };
      },
      solution: playerScript(true),
      solutionFor: { Snack: snackScript(true, true), Ghost: ghostScript(true, true) },
    },
  ],
};
