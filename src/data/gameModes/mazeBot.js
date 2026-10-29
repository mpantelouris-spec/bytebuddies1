/** 🧩 Maze Bot — Code the Route: plan a path, then shorten it with loops. */
import * as B from './blocklyXml';
import { IMG, wall } from './art';
import { overlap, usesBlock, toCanvas } from './checks';

const START = [-200, -140];
const WALLS = 7; // wall sprites in the project; each maze uses as many as it needs

/** Walls as centre x, y, width, height (stage coordinates). */
const LAYOUTS = {
  corner: {
    goal: [200, 140],
    walls: [[-140, -100, 160, 12], [0, -100, 12, 160], [-80, 60, 12, 200], [70, 60, 180, 12], [140, -20, 200, 12]],
  },
  stairs: {
    goal: [40, 100],
    walls: [[-80, -140, 12, 80], [-200, -100, 80, 12], [0, -60, 12, 80], [-120, -20, 80, 12], [80, 20, 12, 80], [-40, 60, 80, 12]],
  },
  uturn: {
    goal: [-200, 100],
    walls: [[-80, -20, 320, 12]],
  },
  hurdles: {
    goal: [200, -140],
    walls: [[-80, -120, 12, 120], [80, -120, 12, 120]],
  },
  box: {
    goal: [-150, 90],
    walls: [[100, -20, 12, 320], [-70, 125, 340, 12]],
  },
};

/** Faint 40-step squares so the route can be counted (drawn under everything, no start dot). */
const GRID = {
  dot: false,
  lines: [
    ...Array.from({ length: 13 }, (_, i) => [{ x: 20 + i * 40, y: 0 }, { x: 20 + i * 40, y: 360 }]),
    ...Array.from({ length: 10 }, (_, i) => [{ x: 0, y: 20 + i * 40 }, { x: 480, y: 20 + i * 40 }]),
  ],
};

const robotStarter = (moves = []) => B.workspace(B.script([B.whenFlag(), B.goTo(START[0], START[1]), B.pointIn(90), ...moves]));

/** Put the walls and trophy where this maze needs them. */
const layout = (name) => (sprites) => {
  const L = LAYOUTS[name];
  let w = 0;
  return sprites.map((s) => {
    if (s.name === 'Trophy') return { ...s, ...box(L.goal[0], L.goal[1], s.w, s.h) };
    if (s.name !== 'Wall') return s;
    const spec = L.walls[w++];
    if (!spec) return { ...s, visible: false };
    const [x, y, ww, hh] = spec;
    return { ...s, ...box(x, y, ww, hh), w: ww, h: hh, customImage: wall(ww, hh), visible: true, costumes: [] };
  });
};
const box = (x, y, w, h) => { const c = toCanvas(x, y); return { x: c.x - w / 2, y: c.y - h / 2 }; };

/** Reached the trophy — and (unless walls are allowed) never drove through a wall. */
const mazeCheck = ({ allowBumps = false } = {}) => (ctx) => {
  const bot = ctx.sprite('Maze Bot');
  const goal = ctx.sprite('Trophy');
  if (!bot || !goal) return { pass: false };
  const walls = ctx.sprites.filter((s) => s.name === 'Wall' && s.visible !== false);
  // Check the path between ticks too, so a fast move can't skip through a wall
  const last = ctx.memo.last || { x: bot.x, y: bot.y };
  for (let k = 0; k <= 8; k++) {
    const p = { x: last.x + ((bot.x - last.x) * k) / 8, y: last.y + ((bot.y - last.y) * k) / 8, w: bot.w, h: bot.h };
    if (walls.some((wl) => overlap(p, wl, 3))) ctx.memo.bumped = true;
  }
  ctx.memo.last = { x: bot.x, y: bot.y };
  if (!allowBumps && ctx.memo.bumped) return { pass: false, fail: true, note: '💥 Bumped a wall! Change your route and press ▶ Play again.' };
  return overlap(bot, goal, 4) ? { pass: true } : { pass: false, note: 'Get Maze Bot to the trophy.' };
};

export const mazeBot = {
  id: 'maze-bot',
  title: 'Maze Bot',
  subtitle: 'Code the Route',
  emoji: '🧩',
  color: '#0ea5e9',
  concept: 'Algorithms',
  blurb: 'Plan a route with moves and turns — then use loops to do it in fewer blocks.',
  background: 'Maze Garden',
  extensions: [],
  focus: 'Maze Bot',
  sprites: () => [
    { name: 'Maze Bot', img: IMG.rollbot, x: START[0], y: START[1], w: 22, h: 34, xml: robotStarter([B.move(40)]) },
    { name: 'Trophy', img: IMG.trophy, x: 200, y: 140, w: 30, h: 36, xml: '' },
    ...Array.from({ length: WALLS }, () => ({ name: 'Wall', img: wall(40, 12), x: 0, y: 0, w: 40, h: 12, xml: '' })),
  ],
  challenges: [
    {
      id: 'corner',
      title: 'First route',
      goal: 'Drive Maze Bot to the trophy without touching a wall. Each square is 40 steps. Start your script with "go to x: -200 y: -140" and "point in direction 90" so it always begins at the start.',
      hints: ['Use "move … steps" to drive and "turn left/right 90 degrees" to change direction.', 'Count the squares: right 4 (160 steps), then up.', 'Use "turn left 90" to face up and "turn right 90" to face right again.', 'Route: 160 → left → 160 → right → 240 → left → 120.'],
      par: 11,
      setup: layout('corner'),
      ghost: GRID,
      star2: { label: 'Used left and right turns', test: (ctx) => usesBlock(ctx.xml('Maze Bot'), 'motion_turnleft') && usesBlock(ctx.xml('Maze Bot'), 'motion_turnright') },
      check: mazeCheck(),
      solution: robotStarter([B.move(160), B.turnLeft(90), B.move(160), B.turnRight(90), B.move(240), B.turnLeft(90), B.move(120)]),
    },
    {
      id: 'uturn',
      title: 'The long way round',
      goal: 'The trophy is right above you — but a long wall is in the way! Drive round the end of the wall to reach it.',
      hints: ['Drive right along the bottom until you are past the end of the wall: 320 steps.', 'Turn left and drive up 240 steps.', 'Turn left again and drive 320 steps back to the trophy.'],
      par: 8,
      setup: layout('uturn'),
      ghost: GRID,
      star2: { label: 'Only left turns', test: (ctx) => usesBlock(ctx.xml('Maze Bot'), 'motion_turnleft') && !usesBlock(ctx.xml('Maze Bot'), 'motion_turnright') },
      check: mazeCheck(),
      solution: robotStarter([B.move(320), B.turnLeft(90), B.move(240), B.turnLeft(90), B.move(320)]),
    },
    {
      id: 'stairs',
      title: 'Staircase',
      goal: 'Climb the staircase to the trophy. Can you spot the pattern and use a loop?',
      hints: ['Each step is: forward 80, turn left, up 80, turn right.', 'That happens 3 times — so "repeat 3".'],
      par: 9,
      setup: layout('stairs'),
      ghost: GRID,
      check: mazeCheck(),
      solution: robotStarter([B.repeat(3, B.move(80), B.turnLeft(90), B.move(80), B.turnRight(90))]),
    },
    {
      id: 'hurdles',
      title: 'Over the hurdles',
      goal: 'Hop over both hurdles to the trophy. Every hop is the same shape — spot the pattern and use a loop.',
      hints: ['One hop: forward 80, turn left, up 120, turn right, forward 80, turn right, down 120, turn left.', 'There are 2 hurdles, so "repeat 2" the hop.', 'After the loop, move 80 more to reach the trophy.'],
      par: 13,
      setup: layout('hurdles'),
      ghost: GRID,
      check: mazeCheck(),
      solution: robotStarter([B.repeat(2, B.move(80), B.turnLeft(90), B.move(120), B.turnRight(90), B.move(80), B.turnRight(90), B.move(120), B.turnLeft(90)), B.move(80)]),
    },
    {
      id: 'smart',
      title: 'Smart bot',
      goal: 'No counting allowed! Make Maze Bot drive by itself: keep moving, and when it bumps a wall, back up a little and turn left.',
      hints: ['forever → move 10.', 'Inside the forever: if touching Wall → move -20 (back up), turn left 90.', 'This works on mazes you have never seen — that is an algorithm!'],
      par: 9,
      star2: { label: 'Used forever + if', test: (ctx) => usesBlock(ctx.xml('Maze Bot'), 'control_forever') && usesBlock(ctx.xml('Maze Bot'), 'control_if') },
      setup: layout('box'),
      ghost: GRID,
      check: (ctx) => {
        const xml = ctx.xml('Maze Bot');
        if (!usesBlock(xml, 'control_forever') || !usesBlock(xml, 'sensing_touchingobject')) return { pass: false, note: 'Use a forever loop and a "touching Wall?" sensor.' };
        return mazeCheck({ allowBumps: true })(ctx);
      },
      solution: robotStarter([B.forever(B.move(10), B.ifThen(B.touching('Wall'), B.move(-20), B.turnLeft(90)))]),
    },
  ],
};
