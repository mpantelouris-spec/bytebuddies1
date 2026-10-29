/** 🏃 Jump Bot — Platformer: events, if-then and keeping score. */
import * as B from './blocklyXml';
import { IMG, platform, flag } from './art';
import { usesBlock } from './checks';

const START = [-200, -110];
const robotStarter = (extra = []) => B.workspace(
  B.script([
    B.whenFlag(), B.setScore(0), B.goTo(START[0], START[1]), B.gravity(2400),
    B.forever(
      B.ifThen(B.keyPressed('right'), B.changeX(5)),
      B.ifThen(B.keyPressed('left'), B.changeX(-5)),
    ),
  ]),
  ...extra,
);
const coinScript = () => B.workspace(B.script([B.whenFlag(), B.show(), B.waitUntil(B.touching('Robot')), B.addScore(1), B.hide()]));
const jumpScript = () => B.script([B.whenKey('space'), B.jump(760)], 24, 330);

export const jumpBot = {
  id: 'jump-bot',
  title: 'Jump Bot',
  subtitle: 'Platformer',
  emoji: '🏃',
  color: '#16a34a',
  concept: 'Events & if-then',
  blurb: 'Run, jump, grab coins and reach the flag — then add an enemy to dodge.',
  background: 'Grassland',
  extensions: [],
  focus: 'Robot',
  sprites: () => [
    { name: 'Robot', img: IMG.robot, x: START[0], y: START[1], w: 34, h: 40, xml: robotStarter() },
    { name: 'Ground', img: platform(480, 30), x: 0, y: -165, w: 480, h: 30, role: 'platform', xml: '' },
    { name: 'Ledge', img: platform(130), x: -40, y: -70, w: 130, h: 22, role: 'platform', xml: '' },
    { name: 'High Ledge', img: platform(130), x: 130, y: 10, w: 130, h: 22, role: 'platform', xml: '' },
    { name: 'Coin', img: IMG.coin, x: -40, y: -35, w: 26, h: 29, xml: coinScript() },
    { name: 'Coin', img: IMG.coin, x: 130, y: 45, w: 26, h: 29, xml: '' },
    { name: 'Coin', img: IMG.coin, x: 60, y: -130, w: 26, h: 29, xml: '' },
    { name: 'Flag', img: flag, x: 205, y: -122, w: 40, h: 56, xml: '' },
    { name: 'Slime', img: IMG.slime, x: 30, y: -138, w: 50, h: 25, xml: '' },
  ],
  challenges: [
    {
      id: 'jump',
      title: 'Learn to jump',
      goal: 'Make the robot walk with ← → and jump with SPACE, then jump onto the ledge. Start it at x: -200 y: -110 with gravity on.',
      hints: ['Under "when ▶ clicked": "go to x: -200 y: -110" and "set gravity to 2400" (Physics).', 'Then a "forever" loop: if → pressed change x by 5, if ← pressed change x by -5.', 'Add "when space key pressed" from Events.', 'Under it, put "jump with power 760" (Physics).', 'Press ▶ Play, walk under the ledge and press SPACE.'],
      par: 13,
      star2: { label: 'Landed on the high ledge', test: (ctx) => ctx.memo.highest !== undefined && ctx.memo.highest < 150 },
      check: (ctx) => {
        const r = ctx.sprite('Robot');
        if (!r) return { pass: false };
        ctx.memo.highest = Math.min(ctx.memo.highest ?? 999, r.y);
        ctx.memo.lowest = Math.max(ctx.memo.lowest ?? -999, r.y);
        const rose = ctx.memo.lowest - ctx.memo.highest;
        return rose >= 60 ? { pass: true } : { pass: false, note: 'Press SPACE while playing to jump.' };
      },
      solution: robotStarter([jumpScript()]),
    },
    {
      id: 'double',
      title: 'Double jump',
      goal: 'Turn on double jump so the robot can jump again in mid-air, then jump really high (press SPACE twice).',
      hints: ['Add another "when ▶ clicked" script to the Robot.', 'Put "allow double jump: true" (Physics) under it.', 'Press SPACE, then SPACE again while you are still in the air.'],
      par: 15,
      star2: { label: 'Reached the high ledge', test: (ctx) => ctx.memo.highest !== undefined && ctx.memo.highest < 150 },
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Robot'), 'bb_physics_allow_double_jump')) return { pass: false, note: 'Use the "allow double jump" block.' };
        const r = ctx.sprite('Robot');
        if (!r) return { pass: false };
        ctx.memo.highest = Math.min(ctx.memo.highest ?? 999, r.y);
        ctx.memo.lowest = Math.max(ctx.memo.lowest ?? -999, r.y);
        return ctx.memo.lowest - ctx.memo.highest >= 160 ? { pass: true } : { pass: false, note: 'Press SPACE twice to double jump.' };
      },
      solution: robotStarter([jumpScript(), B.script([B.whenFlag(), B.doubleJump(true)], 24, 430)]),
    },
    {
      id: 'coins',
      title: 'Coin collector',
      goal: 'One coin already works. Make all 3 coins collectable and grab them all (score 3).',
      hints: ['Click the first Coin to see its script.', 'Right-click its script → Duplicate, or drag it onto the other Coin sprites in the sprite list.', 'Each coin: when flag clicked → show → wait until touching Robot → add 1 to score → hide.'],
      par: 13,
      star2: { label: 'Every coin has a script', test: (ctx) => ctx.allXml('Coin').filter((x) => usesBlock(x, 'bb_game_score_add')).length >= 3 },
      check: (ctx) => (ctx.score >= 3 ? { pass: true } : { pass: false, note: `Score: ${ctx.score} of 3.` }),
      solution: robotStarter([jumpScript()]),
      solutionFor: { Coin: coinScript() },
    },
    {
      id: 'moving',
      title: 'Moving platform',
      goal: 'Make the low Ledge a moving platform: forever glide left, then glide back right.',
      hints: ['Click the Ledge sprite and add "when ▶ clicked".', 'Add "forever" with two "glide 2 secs to x: y:" blocks inside.', 'Keep y the same (-70) so it slides sideways: x: -120, then x: 40.'],
      par: 4,
      parSprite: 'Ledge',
      star2: { label: 'Rode the platform', test: (ctx) => { const r = ctx.sprite('Robot'); const l = ctx.sprite('Ledge'); return !!r && !!l && Math.abs(r.y + r.h - l.y) < 8; } },
      check: (ctx) => {
        const l = ctx.sprite('Ledge');
        if (!l) return { pass: false };
        ctx.memo.min = Math.min(ctx.memo.min ?? 999, l.x);
        ctx.memo.max = Math.max(ctx.memo.max ?? -999, l.x);
        return ctx.memo.max - ctx.memo.min >= 80 ? { pass: true } : { pass: false, note: 'The ledge is not sliding yet.' };
      },
      solution: robotStarter([jumpScript()]),
      solutionFor: { Ledge: B.workspace(B.script([B.whenFlag(), B.forever(B.glideTo(2, -120, -70), B.glideTo(2, 40, -70))])) },
    },
    {
      id: 'flag',
      title: 'Reach the flag',
      goal: 'Make the Flag say "You win!" when the robot touches it — after collecting the coins.',
      hints: ['Click the Flag sprite.', 'when flag clicked → wait until touching Robot → 🎉 you win!'],
      par: 13,
      star2: { label: 'Won with all 3 coins', test: (ctx) => ctx.probe.won && ctx.score >= 3 },
      check: (ctx) => (ctx.probe.won ? { pass: true } : { pass: false, note: 'Touch the flag with the robot to win.' }),
      solution: robotStarter([jumpScript()]),
      solutionFor: { Coin: coinScript(), Flag: B.workspace(B.script([B.whenFlag(), B.waitUntil(B.touching('Robot')), B.win()])) },
    },
    {
      id: 'slime',
      title: 'Watch out!',
      goal: 'Make the Slime patrol left and right. If it touches the robot, lose a life and send the robot back to the start.',
      hints: ['Slime: forever → glide to x: 80, then glide back to x: -20.', 'Robot: forever → if touching Slime → lose a life, go to the start.', 'Jump over the slime to stay safe!'],
      par: 20,
      check: (ctx) => {
        const s = ctx.sprite('Slime');
        if (s) {
          ctx.memo.slimeMin = Math.min(ctx.memo.slimeMin ?? 999, s.x);
          ctx.memo.slimeMax = Math.max(ctx.memo.slimeMax ?? -999, s.x);
        }
        const patrols = (ctx.memo.slimeMax ?? 0) - (ctx.memo.slimeMin ?? 0) >= 60;
        const hurts = usesBlock(ctx.xml('Robot') + ctx.xml('Slime'), 'bb_game_lose_life');
        if (patrols && hurts) return { pass: true };
        return { pass: false, note: !patrols ? 'The slime is not patrolling yet.' : 'Add "lose a life" when the robot touches the slime.' };
      },
      solution: robotStarter([
        jumpScript(),
        B.script([B.whenFlag(), B.forever(B.ifThen(B.touching('Slime'), B.loseLife(), B.goTo(START[0], START[1]), B.wait(0.5)))], 24, 430),
      ]),
      solutionFor: {
        Slime: B.workspace(B.script([B.whenFlag(), B.goTo(30, -138), B.forever(B.glideTo(1.5, 100, -138), B.glideTo(1.5, -20, -138))])),
      },
    },
  ],
};
