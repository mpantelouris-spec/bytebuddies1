/** 🚀 Blaster Bot — Space Shooter: key events, clones and touching. */
import * as B from './blocklyXml';
import { ship, laser, meteor } from './art';
import { usesBlock } from './checks';

// The Ship fires (makes Laser clones). If the Laser fired itself, every laser already in the
// air would also hear the key and clone itself — the classic Scratch shooter trap.
const shipScript = ({ fire = false, win = false, fly = false } = {}) => B.workspace(
  B.script([
    B.whenFlag(), B.setScore(0), B.setLives(3), B.goTo(0, -140),
    B.forever(
      B.ifThen(B.keyPressed('right'), B.changeX(7)), B.ifThen(B.keyPressed('left'), B.changeX(-7)),
      fly && B.ifThen(B.keyPressed('up'), B.changeY(5)), fly && B.ifThen(B.keyPressed('down'), B.changeY(-5)),
      fly && B.ifThen(B.gt(B.yPos(), -20), B.setY(-20)),
    ),
  ]),
  fire && B.script([B.whenKey('space'), B.createClone('Laser')], 24, 230),
  win && B.script([B.whenFlag(), B.waitUntil(B.gt(B.timer(), 15)), B.win()], 24, 320),
);

const laserScript = (fly = false) => B.workspace(
  B.script([B.whenFlag(), B.hide()]),
  fly && B.script([B.whenCloned(), B.goToSprite('Ship'), B.show(), B.repeatUntil(B.gt(B.yPos(), 150), B.changeY(12)), B.deleteClone()], 24, 110),
);

const meteorScript = ({ hit = false, shield = false, storm = false } = {}) => B.workspace(
  B.script([B.whenFlag(), B.hide(), storm && B.setVar('fall', -3), B.forever(B.createClone('myself'), storm && B.changeVar('fall', -0.3), B.wait(1.2))]),
  B.script([
    B.whenCloned(), B.goToXBy(B.random(-210, 210), 170), B.show(),
    B.repeat(80,
      storm ? B.changeYBy(B.getVar('fall')) : B.changeY(-4),
      hit && B.ifThen(B.touching('Laser'), B.addScore(1), B.deleteClone()),
      shield && B.ifThen(B.touching('Ship'), B.loseLife(), B.deleteClone())),
    B.deleteClone(),
  ], 24, 160),
);

export const blasterBot = {
  id: 'blaster-bot',
  title: 'Blaster Bot',
  subtitle: 'Space Shooter',
  emoji: '🚀',
  color: '#6366f1',
  concept: 'Events & clones',
  blurb: 'Fly a rocket, blast falling meteors with lasers and survive the storm.',
  background: 'Outer Space',
  extensions: [],
  focus: 'Laser',
  sprites: () => [
    { name: 'Ship', img: ship, x: 0, y: -140, w: 48, h: 56, xml: shipScript() },
    { name: 'Laser', img: laser, x: 0, y: -100, w: 8, h: 26, visible: false, xml: laserScript() },
    { name: 'Meteor', img: meteor, x: 0, y: 170, w: 44, h: 40, xml: meteorScript() },
  ],
  challenges: [
    {
      id: 'fire',
      title: 'Fire the laser',
      goal: 'When you press SPACE, make a Laser clone that starts at the Ship and flies up the screen.',
      hints: [
        'Click the Ship. Add "when space key pressed" → "create clone of Laser".',
        'Click the Laser. Add "when I start as a clone" → go to Ship → show.',
        'Then: repeat until (y position) > 150 → change y by 12. Finish with "delete this clone".',
      ],
      par: 10,
      check: (ctx) => {
        if (ctx.sprites.some((s) => s.name === 'Laser' && s.isClone && s.visible !== false)) ctx.memo.fired = true;
        return ctx.memo.fired ? { pass: true } : { pass: false, note: 'Press SPACE while playing to fire.' };
      },
      solution: laserScript(true),
      solutionFor: { Ship: shipScript({ fire: true }) },
    },
    {
      id: 'hit',
      title: 'Blast the meteors',
      goal: 'When a Laser touches a Meteor, add 1 to score and make the meteor disappear.',
      hints: [
        'Click the Meteor and find its "when I start as a clone" script.',
        'Inside the repeat loop add: if touching Laser? → add 1 to score → delete this clone.',
      ],
      par: 16,
      parSprite: 'Meteor',
      star2: { label: 'Blasted 6 meteors', test: (ctx) => ctx.score >= 6 },
      check: (ctx) => (ctx.score >= 3 ? { pass: true } : { pass: false, note: `Meteors blasted: ${ctx.score} of 3.` }),
      solution: laserScript(true),
      solutionFor: { Ship: shipScript({ fire: true }), Meteor: meteorScript({ hit: true }) },
    },
    {
      id: 'shield',
      title: 'Watch out!',
      goal: 'A meteor that hits the Ship should cost a life.',
      hints: ['In the Meteor\'s repeat loop add: if touching Ship? → lose a life → delete this clone.'],
      par: 20,
      parSprite: 'Meteor',
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Meteor'), 'bb_game_lose_life')) return { pass: false, note: 'Use "lose a life" when a meteor touches the Ship.' };
        return ctx.probe.count('lose-life') > 0 ? { pass: true } : { pass: false, note: 'Let one meteor hit the ship to test it.' };
      },
      solution: laserScript(true),
      solutionFor: { Ship: shipScript({ fire: true }), Meteor: meteorScript({ hit: true, shield: true }) },
    },
    {
      id: 'fly',
      title: 'Full flight',
      goal: 'Let the Ship fly up and down with ↑ and ↓ too — but never higher than the middle of the screen (y = -20).',
      hints: ['In the Ship\'s forever loop: if ↑ pressed → change y by 5, if ↓ pressed → change y by -5.', 'Then: if (y position) > -20 → set y to -20.', 'Hold ↑ to test: the Ship should stop at the middle.'],
      par: 23,
      parSprite: 'Ship',
      check: (ctx) => {
        const s = ctx.sprite('Ship');
        if (!s) return { pass: false };
        const cy = s.y + s.h / 2; // canvas centre; stage y -20 = canvas 200
        ctx.memo.start = ctx.memo.start ?? cy;
        ctx.memo.top = Math.min(ctx.memo.top ?? 999, cy);
        if (ctx.memo.top < 192) return { pass: false, fail: true, note: 'The Ship flew too high — stop it at y = -20.' };
        return ctx.memo.start - ctx.memo.top >= 60 ? { pass: true } : { pass: false, note: 'Hold ↑ to fly up.' };
      },
      solution: laserScript(true),
      solutionFor: { Ship: shipScript({ fire: true, fly: true }) },
    },
    {
      id: 'storm',
      title: 'Meteor shower',
      goal: 'Make the meteors fall faster and faster: a variable "fall" starts at -3 and gets 0.3 more negative every time a meteor is made.',
      hints: ['Meteor: set fall to -3 when the flag is clicked.', 'In the forever loop that makes clones: change fall by -0.3.', 'In the clone script: change y by (fall) instead of -4.'],
      par: 20,
      parSprite: 'Meteor',
      check: (ctx) => {
        const xml = ctx.xml('Meteor');
        if (!usesBlock(xml, 'data_changevariableby') || !/DY_SLOT/.test(xml)) return { pass: false, note: 'Use "change y by (fall)" and "change fall by -0.3".' };
        const m = ctx.sprites.filter((s) => s.name === 'Meteor' && s.isClone && s.visible !== false);
        if (m.length) ctx.memo.seen = (ctx.memo.seen || 0) + 1;
        return (ctx.memo.seen || 0) > 25 ? { pass: true } : { pass: false, note: 'The storm is starting…' };
      },
      solution: laserScript(true),
      solutionFor: { Ship: shipScript({ fire: true }), Meteor: meteorScript({ hit: true, storm: true }) },
    },
    {
      id: 'survive',
      title: 'Survive the storm',
      goal: 'Win the game if you are still flying after 15 seconds.',
      hints: [
        'Click the Ship and start a new script with "when flag clicked".',
        'Use "wait until (timer) > 15", then the 🏆 win block.',
      ],
      par: 18,
      parSprite: 'Ship',
      star2: { label: 'Won with lives left', test: (ctx) => ctx.probe.count('lose-life') < 3 },
      check: (ctx) => (ctx.probe.won ? { pass: true } : { pass: false, note: 'Keep flying until the timer passes 15 seconds…' }),
      solution: laserScript(true),
      solutionFor: { Ship: shipScript({ fire: true, win: true }), Meteor: meteorScript({ hit: true, shield: true }) },
    },
  ],
};
