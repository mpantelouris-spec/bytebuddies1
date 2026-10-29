/**
 * Arcade modes 11–50: ten Easy, ten Medium, ten Hard and ten Advanced levels for
 * each arcade robot, built from its own game rules.
 *
 *   Easy     — solve it with a sequence or a Repeat (no sensors needed)
 *   Medium   — needs If / else: the robot has to react to what it senses
 *   Hard     — needs several conditions working together
 *   Advanced — the full "robot brain" the game teaches, on the toughest layouts
 *
 * Every layout comes from a seed in data/tier-levels/arcade-tiers.js. Those seeds
 * were chosen by scripts/tier-levels/build-arcade.mjs, which plays each level with
 * the program its tier teaches and only keeps levels that program can win. Each
 * level also has its own world colours (`world` + `mood`) and a lesson.
 */
import { ARCADE_TIER_SEEDS } from '../data/tier-levels/arcade-tiers.js';

const TIERS = ['Easy', 'Medium', 'Hard', 'Advanced'];
const CONTROL = { Easy: ['repeat'], Medium: ['forever', 'if', 'else'], Hard: ['forever', 'if', 'else', 'repeat_until'], Advanced: ['forever', 'if', 'else', 'repeat', 'repeat_until', 'wait'] };

/** Names for each game's 40 levels: 10 per tier. */
export const ARCADE_TIER_NAMES = {
  snakebot: [
    'Apple Alley', 'Corner Snack', 'Two-Apple Trip', 'Orchard Steps', 'Zigzag Lunch', 'Fence Line Feast', 'Three-Apple Loop', 'Picnic Path', 'Berry Bend', 'Garden Tour',
    'First Snake Brain', 'Rock Hop', 'Pebble Path', 'Mossy Stones', 'Hungry Hunter', 'Boulder Bend', 'Rocky Orchard', 'Stony Meadow', 'Snack Sprint', 'Cobble Courtyard',
    'Long Snake Lane', 'Rock Garden Run', 'Tail Trouble', 'Quarry Feast', 'Canyon Crawl', 'Maze of Stones', 'Granite Grove', 'Big Appetite', 'Ruins Roundup', 'Boulder Field',
    'Hedge Maze', 'Walled Garden', 'Labyrinth Lunch', 'Castle Courtyard', 'Mega Snake', 'Temple Tiles', 'Dragon Path', 'Fortress Feast', 'Serpent Master', 'Snake Champion Cup',
  ],
  pacbot: [
    'Dot Line', 'L-Bend Dots', 'Zigzag Hall', 'Corner Corridor', 'Stair Steps', 'Long Hallway', 'U-Turn Lane', 'Snake Corridor', 'Square Dance', 'Hook Hall',
    'Little Maze', 'Box Garden', 'Twisty Tunnels', 'Mini Labyrinth', 'Side Rooms', 'Crossroads', 'Branching Paths', 'Pocket Maze', 'Loop Lane', 'Puzzle Room',
    'Bug Patrol', 'Haunted Halls', 'Power Pellet Plan', 'Night Shift', 'Twin Bugs', 'Busy Maze', 'Glow Corridors', 'Bug Chase', 'Escape Route', 'Maze Runner',
    'Bug Swarm', 'Speedy Bugs', 'Mega Maze', 'Pellet Panic', 'Chaser Maze', 'Haunted Castle', 'Neon Labyrinth', 'Final Frenzy', 'Maze Master', 'Pac-Bot Champion',
  ],
  brickbot: [
    'Straight Shot', 'Little Wall', 'Twin Towers', 'Centre Stack', 'Brick Row', 'Short Wall', 'Step Up', 'Thin Line', 'Corner Blocks', 'Double Row',
    'Angled Serve', 'Bouncy Rainbow', 'Checkerboard', 'Pyramid', 'Bonus Stars', 'Tricky Bounce', 'Two Towers', 'Moving Row', 'Diamond', 'Medium Wall',
    'Metal Bricks', 'Fast Ball', 'Star Catcher', 'Fortress', 'Shrinking Paddle', 'Slide Row', 'Metal Maze', 'Speedy Stars', 'Castle Wall', 'Hard Shell',
    'Steel Fortress', 'Lightning Ball', 'Tiny Paddle', 'Star Storm', 'Sliding Walls', 'Steel Maze', 'Mega Wall', 'Rainbow Fortress', 'Brick Master', 'Brick Bot Champion',
  ],
  hopbot: [
    'Garden Path', 'Tree Dodge', 'Forest Steps', 'Orchard Hop', 'Hedge Hop', 'Flower Field', 'Park Path', 'Woodland Way', 'Quiet Road', 'Country Lane',
    'Two Roads', 'Busy Street', 'Market Day', 'Rush Hour', 'Crossroads', 'Town Hop', 'Bus Lane', 'City Blocks', 'School Run', 'Highway Hop',
    'River Logs', 'Lily Pads', 'Rail Crossing', 'Bridge Hop', 'Stream and Street', 'Waterfront', 'Train Station', 'Canal Hop', 'Ferry Port', 'Flood Plain',
    'Express Train', 'Rapid River', 'City Rush', 'Harbour Hop', 'Mega Crossing', 'Night Traffic', 'Storm Crossing', 'Grand Canal', 'Hop Master', 'Hop Bot Champion',
  ],
  raiderbot: [
    'Three in a Row', 'Raider Line', 'Tall Stack', 'Wide Line', 'Two Rows', 'Pyramid Fleet', 'Corner Raiders', 'Gap Line', 'Space Wall', 'Target Rows',
    'The March', 'Wobbly Fleet', 'Marching Rows', 'Side Step', 'Fleet Drop', 'Zigzag March', 'Quick March', 'Wide March', 'Double March', 'Raider Parade',
    'Slime Rain', 'Shield Wall', 'Tough Raiders', 'Dodge and Zap', 'Slime Storm', 'Bunker Battle', 'Armoured Fleet', 'Fast Slime', 'Big Fleet', 'Danger Zone',
    'Mothership', 'Meteor Fleet', 'Galaxy Storm', 'Armada', 'Final Wave', 'Star Fortress', 'Comet March', 'Nebula Fleet', 'Raider Master', 'Space Raider Champion',
  ],
  jumpbot: [
    'Sunny Stroll', 'Little Gap', 'Coin Trail', 'Two Gaps', 'Step Up', 'Puddle Hop', 'Long Walk', 'Bridge Gaps', 'Hill Steps', 'Meadow Run',
    'Gap Sensor', 'High Steps', 'Cliff Jumps', 'Stair Climb', 'Rocky Ridge', 'Cloud Steps', 'Canyon Leaps', 'Mountain Path', 'Tree Tops', 'Sky Bridge',
    'Hot Tiles', 'Beetle Bridge', 'Lava Steps', 'Beetle Bounce', 'Fire Path', 'Bug Valley', 'Ember Run', 'Volcano Ridge', 'Beetle Castle', 'Hot Rooftops',
    'Key and Gate', 'Castle Keys', 'Lava Castle', 'Golden Door', 'Sky Fortress', 'Beetle Keep', 'Star Gate', 'Inferno Keep', 'Jump Master', 'Jump Bot Champion',
  ],
};

/* ─── seeded randomness ─────────────────────────────────────────────────── */
function rngOf(seed) {
  let s = seed >>> 0;
  const r = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  return r;
}
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ─── Snake ─────────────────────────────────────────────────────────────── */
function snakeLevel(t, slot, seed) {
  const r = rngOf(seed);
  const need = [1 + (slot % 3), 4 + (slot % 3), 7 + (slot % 3), 10 + (slot % 3)][t];
  const blocked = new Set();
  const free = (x, y) => x >= 1 && y >= 1 && x <= 18 && y <= 13 && !blocked.has(`${x},${y}`) && !(y === 7 && x >= 3 && x <= 9);
  const walls = [];
  const addWall = (x, y) => { if (free(x, y)) { walls.push([x, y]); blocked.add(`${x},${y}`); } };
  const rocks = [0, 3 + (slot % 3), 7 + (slot % 4), 9 + (slot % 4)][t];
  for (let i = 0; i < rocks; i++) addWall(r.int(2, 17), r.int(2, 12));
  if (t === 3) { // Advanced: short maze walls
    for (let k = 0; k < 3; k++) {
      const x = r.int(3, 15), y = r.int(2, 11), across = r() < 0.5;
      for (let j = 0; j < 4; j++) addWall(across ? x + j : x, across ? y : y + j);
    }
  }
  const apples = [];
  if (t === 0) {
    // Easy: the first apple sits straight ahead; the rest are a corner or two away
    apples.push([10 + (slot % 5), 7]);
    while (apples.length < need) {
      const [px, py] = apples[apples.length - 1];
      const turn = apples.length % 2 ? [px, Math.max(2, Math.min(12, py + (r() < 0.5 ? -4 : 4)))] : [Math.max(2, Math.min(17, px + (r() < 0.5 ? -5 : 5))), py];
      apples.push(turn);
    }
  } else {
    while (apples.length < need) {
      const a = [r.int(1, 18), r.int(1, 13)];
      const last = apples[apples.length - 1] || [6, 7];
      if (free(a[0], a[1]) && Math.abs(a[0] - last[0]) + Math.abs(a[1] - last[1]) >= 4 && !apples.some(([x, y]) => x === a[0] && y === a[1])) apples.push(a);
    }
  }
  const wallText = t === 0 ? '' : t === 3 ? ' Maze walls and rocks block the way.' : ` ${plural(walls.length, 'rock')} block the way.`;
  return {
    goal: `Eat ${plural(need, 'apple')}.${wallText}${t >= 2 ? ' Every apple makes the snake longer — don’t bite your tail!' : ''}`,
    hint: [
      `Count the squares to each apple: Move forward, then turn. A Repeat block saves moves.`,
      'Forever → If food left → Turn left. If food right → Turn right. Then Move.',
      'Check “wall ahead” first. If there is a wall, turn to the side that is clear.',
      'Order matters: avoid crashes first, then chase food. Check left and right before turning.',
    ][t],
    lesson: ['Sequencing & loops', 'If / else', 'Nested conditions', 'Algorithms'][t],
    par: [3 + need * 2, 9, 12, 14][t],
    apples, need, walls,
    palette: ['move', 'turn_left', 'turn_right', ...CONTROL[TIERS[t]]],
    ...(t === 0 && slot === 0 ? { starter: [['repeat', 0, { times: 3 }], ['move', 1]] } : {}),
  };
}

/* ─── Pac-Bot ───────────────────────────────────────────────────────────── */
function pacLevel(t, slot, seed, h) {
  const r = rngOf(seed);
  let make; let bugs = []; let needPct = 1;
  if (t === 0) {
    // Easy: one corridor with a few corners, no bugs
    const pts = [[2, 2 + (slot % 5) * 2]];
    const legs = 2 + (slot % 4);
    for (let i = 0; i < legs; i++) {
      const [x, y] = pts[pts.length - 1];
      pts.push(i % 2 === 0 ? [Math.min(16, x + r.int(3, 6)), y] : [x, Math.max(1, Math.min(13, y + (r() < 0.5 ? -1 : 1) * r.int(2, 4)))]);
    }
    make = () => ({ open: h.pathCells(pts), start: [pts[0][0], pts[0][1], 0] });
  } else {
    const box = t === 1 ? [3, 3, 3 + 6 + 2 * (slot % 3), 3 + 4 + 2 * (slot % 2)] : [1, 1, 17, 13];
    const braid = [0, 0.15, 0.25, 0.35][t];
    make = () => ({ open: h.perfectMaze(seed, box[0], box[1], box[2], box[3], braid), start: [box[0], box[1], 0], power: t >= 2 ? [[box[2], box[3]], [box[0], box[3]]] : [] });
    needPct = [1, 0.85, 0.8, 0.9][t];
    const bugCount = [0, 0, 1 + (slot % 2), 2 + (slot % 2)][t];
    const spots = [[17, 13], [17, 1], [1, 13], [9, 7]];
    bugs = spots.slice(0, bugCount).map((at) => ({ at, step: [0, 0, 0.32, 0.4][t] + slot * 0.005, chase: t === 3 ? 0.18 : 0 }));
  }
  return {
    goal: t === 0 ? 'Gobble every dot in the corridor.' : `Eat ${Math.round(needPct * 100)}% of the dots in the maze.${bugs.length ? ` ${plural(bugs.length, 'bug')} patrol${bugs.length === 1 ? 's' : ''} the halls.` : ''}`,
    hint: [
      'Follow the corridor: Move forward, turn at each corner. Count the dots in each straight part.',
      'Forever → If dot ahead → Move. Else → turn towards a dot (left or right).',
      'Use “bug ahead” to turn around before a bug catches you. Power pellets let you chase them!',
      'Combine everything: dots, walls and bugs. Test, watch where it goes wrong, then fix one rule.',
    ][t],
    lesson: ['Sequencing & loops', 'If / else', 'Nested conditions', 'Algorithms'][t],
    par: [6, 10, 13, 16][t],
    make, bugs, needPct,
    palette: ['move', 'turn_left', 'turn_right', ...(t ? ['turn_around'] : []), ...CONTROL[TIERS[t]]],
  };
}

/* ─── Brick Bot ─────────────────────────────────────────────────────────── */
function brickLevel(t, slot, seed) {
  const r = rngOf(seed);
  const rows = [slot < 5 ? 2 + slot : 1 + (slot % 2), 2 + (slot % 3), 3 + (slot % 3), 4 + (slot % 3)][t];
  // Easy: a single tower (straight serve), then small walls with an angled serve
  const cols = [slot < 5 ? 1 : 2 + (slot % 3), 6 + (slot % 4), 8 + (slot % 3), 9 + (slot % 3)][t];
  const bw = 48, bh = 19, gap = 5, top = 42;
  const shape = slot % 5;
  const bricks = [];
  const x0 = 320 - (cols * (bw + gap) - gap) / 2 + (t === 0 ? (r.int(-3, 3)) * 20 : 0);
  for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) {
    const dx = c - (cols - 1) / 2;
    const on = t === 0 ? true
      : shape === 0 ? Math.abs(dx) <= row + 1.5
        : shape === 1 ? (c + row) % 2 === 0
          : shape === 2 ? row === 0 || c === 0 || c === cols - 1
            : shape === 3 ? c % 3 !== 1 || row === 0
              : r() > 0.2;
    if (!on) continue;
    const metal = t >= 2 && (c + row + slot) % (6 - t) === 0;
    const steel = t === 3 && (c * 2 + row + slot) % 11 === 0;
    bricks.push({
      x: x0 + c * (bw + gap), y: top + row * (bh + gap), w: bw, h: bh,
      hp: steel ? Infinity : metal ? 2 : 1, kind: steel ? 'steel' : metal ? 'metal' : 'brick',
      star: t >= 1 && (c * 7 + row * 3 + slot) % 9 === 0,
      color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'][(row + c + slot) % 6],
    });
  }
  const breakable = bricks.filter((b) => b.hp !== Infinity).length;
  return {
    goal: `Smash ${plural(breakable, 'brick')}${t >= 2 ? ' — metal bricks need two hits' : ''}${t === 3 ? ', steel ones never break' : ''}.`,
    hint: [
      'Move under the bricks first, then Serve ball. Count the steps you need.',
      'The ball bounces at an angle now. Forever → If ball left → Move left. If ball right → Move right.',
      'The paddle is smaller and the ball is faster. Keep your follow-the-ball loop tight: no extra blocks inside.',
      'Track the ball, and only chase a falling star when the ball is going up (use “ball falling”).',
    ][t],
    lesson: ['Sequencing', 'If / else', 'Loops with sensors', 'Algorithms'][t],
    par: [3, 7, 8, 10][t],
    bricks: () => bricks.map((b) => ({ ...b })),
    paddle: [110, 100, 88, 76][t] - (slot % 3) * 2,
    speed: [220, 250, 290, 330][t] + slot * 4,
    serve: t === 0 && slot < 5 ? 0 : [-30, -18, 18, 30][(seed + slot) % 4],
    starsNeed: 0,
    slide: t >= 2 && slot % 3 === 0 ? [0] : [],
    palette: ['serve', 'move_left', 'move_right', ...CONTROL[TIERS[t]], ...(t >= 2 ? [] : [])],
  };
}

/* ─── Hop Bot ───────────────────────────────────────────────────────────── */
function hopLevel(t, slot, seed) {
  const r = rngOf(seed);
  const lanes = [{ type: 'grass', trees: [] }];
  const count = [4 + (slot % 3), 6 + (slot % 3), 8 + (slot % 3), 10 + (slot % 3)][t];
  const kinds = [['grass'], ['road', 'grass'], ['road', 'river', 'grass', 'rail'], ['road', 'river', 'rail', 'road', 'river', 'grass']][t];
  let rivers = 0; let roads = 0; let rails = 0;
  for (let i = 0; i < count; i++) {
    const type = t === 0 ? 'grass' : kinds[(i + slot) % kinds.length];
    if (type === 'grass') lanes.push({ type, trees: t === 0 && i % 2 === 1 ? [10, 9 + (r() < 0.5 ? -1 : 2)] : (r() < 0.4 ? [r.int(2, 18)] : []) });
    else if (type === 'road') {
      roads++;
      const spacing = [0, 8, 6, 5][t] + r.int(0, 2); const n = Math.ceil(21 / spacing);
      lanes.push({ type, speed: (r() < 0.5 ? 1 : -1) * ([0, 1.6, 2.2, 2.8][t] + r() * 0.6), L: spacing * n, len: 1 + (t >= 2 && r() < 0.4 ? 1 : 0), items: Array.from({ length: n }, (_, j) => j * spacing + r.int(0, 2)) });
    } else if (type === 'river') {
      rivers++;
      const spacing = 4 + r.int(0, 2); const n = Math.ceil(21 / spacing);
      lanes.push({ type, speed: (r() < 0.5 ? 1 : -1) * (0.8 + t * 0.25 + r() * 0.5), L: spacing * n, len: 3 - (t === 3 ? 1 : 0) + r.int(0, 1), items: Array.from({ length: n }, (_, j) => j * spacing) });
    } else if (type === 'rail') {
      rails++;
      lanes.push({ type, speed: (r() < 0.5 ? 1 : -1) * (12 + t * 3), L: 70, len: 9, every: 70, items: [r.int(0, 69)] });
    }
    if (type !== 'grass' && t >= 1) lanes.push({ type: 'grass', trees: [] });
  }
  lanes.push({ type: 'goal', trees: [] });
  const parts = [roads && plural(roads, 'road'), rivers && plural(rivers, 'river'), rails && plural(rails, 'railway')].filter(Boolean);
  return {
    goal: t === 0 ? 'Hop up the garden to the finish flag. Trees are in the way, so step around them.' : `Cross ${parts.join(', ')} to the finish flag.`,
    hint: [
      'Hop forward, and hop left or right to go round a tree. Plan each row before you build.',
      'Forever → If safe ahead → Hop forward. Else → Wait. The sensor checks the lane for you.',
      'On a log the river carries you. Use “near left edge” / “near right edge” to hop off before you fall in.',
      'Combine all your rules: cars, logs, trains and trees. Test one lane type at a time.',
    ][t],
    lesson: ['Sequencing', 'If / else', 'Nested conditions', 'Algorithms'][t],
    par: [count + 3, 6, 9, 12][t],
    lanes, startX: 10,
    palette: ['hop_forward', 'hop_left', 'hop_right', ...(t ? ['hop_back', 'wait'] : []), ...CONTROL[TIERS[t]]],
  };
}

/* ─── Space Raider ──────────────────────────────────────────────────────── */
function raiderLevel(t, slot, seed) {
  const cols = [3 + (slot % 3), 5 + (slot % 3), 6 + (slot % 3), 6 + (slot % 2)][t];
  const rows = [1 + (slot % 2), 2, 2 + (slot % 2), 3][t];
  const gapX = 46, gapY = 34;
  const raiders = [];
  for (let row = 0; row < rows; row++) {
    const x0 = 320 - ((cols - 1) * gapX) / 2;
    for (let c = 0; c < cols; c++) {
      if (slot % 4 === 1 && (c + row) % 2 === 1 && t > 0) continue;
      if (slot % 4 === 2 && Math.abs(c - (cols - 1) / 2) > row + 1.5) continue;
      const kind = t >= 2 && row === 0 ? 'C' : row % 2 ? 'B' : 'A';
      raiders.push({ x: x0 + c * gapX, y: 54 + row * gapY, kind, hp: kind === 'C' ? 2 : 1, row });
    }
  }
  return {
    goal: `Zap ${plural(raiders.length, 'raider')}${t >= 2 ? ' and dodge the falling slime' : ''}${t === 3 && slot % 2 === 0 ? '. Watch for the mothership!' : '.'}`,
    hint: [
      'The raiders stay still. Move under each one and zap. Count the steps between them.',
      'They march now! Forever → If raider above → Zap. Else → move towards the nearest raider.',
      'Slime falls on you. Put the slime check first: If slime above → move away. Else → aim and zap.',
      'Use every sensor in the right order: slime, then raider above, then the mothership, then move.',
    ][t],
    lesson: ['Sequencing', 'If / else', 'Order of conditions', 'Algorithms'][t],
    par: [raiders.length + 2, 7, 10, 13][t],
    raiders: () => raiders.map((a) => ({ ...a })),
    march: [0, 18 + slot * 2, 26 + slot * 2, 34 + slot][t],
    drop: [0, 8, 10, 12][t],
    bombs: [0, 0, 0.38 + slot * 0.015, 0.52 + slot * 0.015][t],
    shields: t >= 2 ? [160, 320, 480] : [],
    mothership: t === 3 && slot % 2 === 0,
    palette: ['zap', 'move_left', 'move_right', ...CONTROL[TIERS[t]]],
  };
}

/* ─── Jump Bot ──────────────────────────────────────────────────────────── */
function jumpLevel(t, slot, seed) {
  const r = rngOf(seed);
  const goalX = [10 + slot, 15 + slot, 19 + slot, 23 + slot][t];
  const platforms = [[0, 3, 0]];
  let x = 4; let h = 0;
  const gapMax = [2, 2, 3, 3][t];
  while (x < goalX - 2) {
    const gap = r() < [0.5, 0.65, 0.7, 0.75][t] ? r.int(1, gapMax) : 0;
    x += gap;
    if (t >= 1 && r() < 0.45) h = Math.max(0, Math.min(3, h + (r() < 0.6 ? 1 : -1)));
    const len = r.int(2, 4);
    platforms.push([x, Math.min(goalX, x + len), h]);
    x += len + 1;
  }
  const last = platforms[platforms.length - 1];
  if (last[1] < goalX) platforms.push([last[1] + 1, goalX, last[2]]);
  const inner = (p) => (p[1] - p[0] >= 2 ? r.int(p[0] + 1, p[1] - 1) : null);
  const coins = platforms.map(inner).filter((v) => v != null && v > 0);
  const hazards = t >= 2 ? platforms.slice(1, -1).filter((_, i) => i % 2 === 0).map(inner).filter((v) => v != null) : [];
  const enemies = t >= 2 ? platforms.slice(1, -1).filter((_, i) => i % 2 === 1).map(inner).filter((v) => v != null && !hazards.includes(v)) : [];
  const keys = t === 3 ? [platforms[Math.floor(platforms.length / 3)][0] + 1] : [];
  const doors = t === 3 ? [platforms[Math.floor((platforms.length * 3) / 4)][0] + 1] : [];
  return {
    goal: `Reach the star flag${t >= 2 ? ', jumping over hot tiles and beetles' : ''}${t === 3 ? '. Grab the golden key to open the gate' : ''}.`,
    hint: [
      'Walk forward to each gap, then Jump. A jump of 3 steps clears a 2-tile gap.',
      'Forever → If gap ahead → Jump. Else if high step ahead → Jump. Else → Walk.',
      'Beetles can be sensed, but hot tiles can’t: count the steps to each hot tile and jump over it.',
      'Get the key before the gate. Plan the route in parts, then join them together.',
    ][t],
    lesson: ['Sequencing & loops', 'If / else', 'Counting & conditions', 'Decomposition'][t],
    par: [4, 7, 10, 14][t],
    goalX, platforms, coins: coins.filter((c) => !hazards.includes(c) && !enemies.includes(c) && !keys.includes(c) && !doors.includes(c)),
    hazards, enemies, keys, doors,
    palette: ['walk_forward', 'jump', ...CONTROL[TIERS[t]]],
  };
}

/** A real-world link for each game's levels. */
const ARCADE_FACTS = {
  snakebot: ['Snake-like robots can slither through pipes to check them for cracks.', 'Rescue snake robots squeeze through rubble to find people.', 'Planning a route that avoids your own path is a real problem for delivery robots.'],
  pacbot: ['Robot vacuum cleaners use maps of a room so they don’t miss any spots.', 'Maze-solving robots race each other in “micromouse” competitions.', 'Following one wall is a real way to escape many mazes.'],
  brickbot: ['Game physics works out bounce angles with simple maths, many times a second.', 'Robots that catch things predict where they will land, just like your paddle.', 'Reaction time matters: computers can react thousands of times faster than people.'],
  hopbot: ['Self-driving cars check for gaps in traffic before they move, like Hop Bot.', 'Traffic lights and sensors help keep road crossings safe.', 'Robots that cross busy places wait for a safe gap instead of rushing.'],
  raiderbot: ['Satellites track space junk so they can move out of its way.', 'Telescopes scan the sky in rows, like you scan for raiders.', 'Deciding what to do first is called prioritising. Robots do it all the time.'],
  jumpbot: ['Mars rovers check the ground ahead before every move.', 'Game designers test every level to make sure it can be finished.', 'Breaking a long trip into small parts is how engineers plan big projects.'],
};

const BUILDERS = { snakebot: snakeLevel, pacbot: pacLevel, brickbot: brickLevel, hopbot: hopLevel, raiderbot: raiderLevel, jumpbot: jumpLevel };

/** Number of colour worlds for the arcade scenes (see arcade/tier-grade.js). */
export const ARCADE_WORLD_COUNT = 8;

/** Build one arcade level (index 0–39) from a seed. Used at runtime and by the build script. */
export function makeArcadeTierLevel(gameId, index, seed, helpers = {}) {
  const t = Math.floor(index / 10); const slot = index % 10;
  const level = BUILDERS[gameId](t, slot, seed, helpers);
  const title = ARCADE_TIER_NAMES[gameId][index];
  return {
    ...level,
    title,
    modeIndex: 11 + index,
    difficulty: TIERS[t],
    skill: level.lesson,
    // 8 colour worlds × 5 lighting moods: every level has its own look
    world: index % ARCADE_WORLD_COUNT,
    mood: Math.floor(index / ARCADE_WORLD_COUNT),
    fact: ARCADE_FACTS[gameId][index % ARCADE_FACTS[gameId].length],
  };
}

export function createArcadeExpansion(game, helpers = {}) {
  const seeds = ARCADE_TIER_SEEDS[game.id] || [];
  return ARCADE_TIER_NAMES[game.id].map((_, index) => {
    const level = makeArcadeTierLevel(game.id, index, seeds[index] ?? (1000 + index * 97), helpers);
    level.id = `${game.id}_mode_${11 + index}`;
    return level;
  });
}
