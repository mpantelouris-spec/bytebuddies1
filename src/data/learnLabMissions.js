/**
 * learnLabMissions.js — designs a real coding challenge for every coding lesson.
 *
 * The lesson's own topic decides the kind of mission, so a loops lesson needs a
 * Repeat, a debugging lesson starts with a planted bug, a variables lesson keeps
 * score, and so on. Layouts are generated per lesson (seeded, so they never
 * change between visits) and always solvable: the solution is found by search
 * and turned into blocks, which also powers Hint and Solution.
 */

// ── Mission kinds from the lesson title / concept ────────────────────────────
const KIND_RULES = [
  ['predict', /predict|trace/],
  ['debug', /debug|bug|test plan|testing|test your/],
  ['nested', /nested/],
  ['shapes', /shape/],
  ['loop', /loop|repeat/],
  ['paint', /pattern|pen|art|paint|draw|media|animate|story|poster|sprite/],
  ['efficient', /efficien|fewer/],
  ['reach', /justify|explain/],
  ['collect', /collector|gem|score|counter|variable|data|list|state|table|structure/],
  ['decision', /decision|\bif\b|else|selection|conditional|boolean|choice/],
  ['deliver', /sensor|sensing|autonomous|robot|input|output|keyboard|event|flag|interaction/],
  ['checkpoints', /decompos|break it down|routine|mini-project|plan|capstone|design|modular|chunk|pair|system|adventure|game/],
  ['reach', /sequence|first|algorithm|simulator|program|pseudocode|justify|explain/],
];

export function labKindFor(lesson) {
  const blob = `${lesson?.title || ''}`.toLowerCase();
  for (const [kind, re] of KIND_RULES) if (re.test(blob)) return kind;
  const concept = `${lesson?.conceptName || ''}`.toLowerCase();
  if (/decomposition/.test(concept)) return 'checkpoints';
  if (/logical/.test(concept)) return 'predict';
  if (/data/.test(concept)) return 'collect';
  return 'reach';
}

// ── Seeded helpers ───────────────────────────────────────────────────────────
function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const key = (c, r) => `${c},${r}`;
const DIRS = [[1, 0], [0, -1], [-1, 0], [0, 1]]; // dir 0 = right, 90 = up, 180 = left, 270 = down

/** Shortest path (cells) from a to b avoiding walls. */
function bfs(a, b, cols, rows, walls) {
  const prev = new Map([[key(a.col, a.row), null]]);
  const q = [a];
  while (q.length) {
    const cur = q.shift();
    if (cur.col === b.col && cur.row === b.row) break;
    for (const [dx, dy] of DIRS) {
      const n = { col: cur.col + dx, row: cur.row + dy };
      const k = key(n.col, n.row);
      if (n.col < 0 || n.row < 0 || n.col >= cols || n.row >= rows || walls.has(k) || prev.has(k)) continue;
      prev.set(k, cur);
      q.push(n);
    }
  }
  if (!prev.has(key(b.col, b.row))) return null;
  const path = [];
  for (let c = b; c; c = prev.get(key(c.col, c.row))) path.unshift(c);
  return path;
}

/** Turn a list of cells into Forward / Turn blocks. */
function pathToBlocks(path, startDir = 0, blocks = []) {
  let dir = startDir;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].col - path[i - 1].col;
    const dy = path[i].row - path[i - 1].row;
    const want = dx === 1 ? 0 : dx === -1 ? 180 : dy === -1 ? 90 : 270;
    let diff = ((want - dir) % 360 + 360) % 360;
    if (diff === 90) blocks.push({ id: 'turn_left' });
    else if (diff === 270) blocks.push({ id: 'turn_right' });
    else if (diff === 180) { blocks.push({ id: 'turn_left' }); blocks.push({ id: 'turn_left' }); }
    dir = want;
    const last = blocks[blocks.length - 1];
    if (last && last.id === 'forward') last.param += 1;
    else blocks.push({ id: 'forward', param: 1 });
  }
  return { blocks, dir };
}

function gridFor(yearNum) {
  if (yearNum <= 3) return { cols: 6, rows: 5 };
  if (yearNum === 4) return { cols: 7, rows: 5 };
  return { cols: 8, rows: 6 };
}

function scatterWalls(r, cols, rows, n, keep) {
  const walls = new Set();
  for (let tries = 0; walls.size < n && tries < 200; tries++) {
    const c = 1 + Math.floor(r() * (cols - 2));
    const w = Math.floor(r() * rows);
    const k = key(c, w);
    if (keep.has(k)) continue;
    walls.add(k);
  }
  return walls;
}

const cellsOf = (set) => [...set].map((k) => { const [col, row] = k.split(',').map(Number); return { col, row }; });

// ── Block missions ───────────────────────────────────────────────────────────
function designBlocks(kind, lesson, yearNum, idx) {
  const r = rng(yearNum * 100 + idx + 7);
  const { cols, rows } = gridFor(yearNum);
  const start = { col: 0, row: Math.floor(rows / 2), dir: 0 };
  const star = { col: cols - 1 - Math.floor(r() * 2), row: Math.floor(r() * rows) };
  const keep = new Set([key(start.col, start.row), key(star.col, star.row)]);
  const wallCount = yearNum <= 3 ? 1 : yearNum === 4 ? 3 : 5;
  const base = { cols, rows, start, target: star, walls: [], gems: [], paintTargets: [], checkpoints: [], parcel: null, house: null };
  let walls = new Set();
  let mission;

  const solve = (points, w = walls) => {
    let dir = start.dir;
    const blocks = [];
    for (let i = 1; i < points.length; i++) {
      const path = bfs(points[i - 1], points[i], cols, rows, w);
      if (!path) return null;
      dir = pathToBlocks(path, dir, blocks).dir;
    }
    return blocks;
  };

  if (kind === 'loop' || kind === 'efficient') {
    // a long straight run that begs for Repeat
    const row = start.row;
    const target = { col: cols - 1, row };
    mission = {
      ...base, target,
      maxBlocks: kind === 'loop' ? 3 : 2,
      requireBlock: kind === 'loop' ? 'repeat' : null,
      goal: kind === 'loop'
        ? `Get Dot to the ⭐ using a Repeat block — only ${3} blocks allowed!`
        : 'Reach the ⭐ in the fewest blocks you can — 2 blocks earns 3 stars!',
      solution: [{ id: 'repeat', param: cols - 1 }, { id: 'forward', param: 1 }, { id: 'end_repeat' }],
      starter: [{ id: 'forward', param: 1 }, { id: 'forward', param: 1 }],
      hints: [
        'Dot needs to move forward lots of times. Doing the same thing again and again is a loop!',
        `Count the squares to the star: ${cols - 1}. Put a Move Forward inside a Repeat.`,
        `Repeat ${cols - 1} → Move Forward 1 → End repeat.`,
      ],
    };
    if (kind === 'efficient') mission.solution = [{ id: 'forward', param: cols - 1 }];
    return mission;
  }

  if (kind === 'shapes' || kind === 'nested') {
    // paint the outline of a square with a repeated side
    const side = kind === 'nested' ? 2 : 3;
    const c0 = 1, r0 = rows - 1;
    const sq = [];
    for (let i = 0; i < side; i++) sq.push({ col: c0 + i, row: r0 });
    for (let i = 0; i < side; i++) sq.push({ col: c0 + side, row: r0 - i });
    for (let i = 0; i < side; i++) sq.push({ col: c0 + side - i, row: r0 - side });
    for (let i = 0; i < side; i++) sq.push({ col: c0, row: r0 - side + i });
    const s2 = { col: c0, row: r0, dir: 0 };
    return {
      ...base, start: s2, target: null,
      paintTargets: sq.map((p) => ({ ...p, color: 'blue' })),
      maxBlocks: kind === 'nested' ? 7 : 6,
      requireBlock: 'repeat',
      goal: `Paint the ${sq.length} glowing squares to draw a square shape. Use Repeat for each side!`,
      solution: [
        { id: 'repeat', param: 4 },
        { id: 'repeat', param: side },
        { id: 'paint', param: 'blue' }, { id: 'forward', param: 1 },
        { id: 'end_repeat' },
        { id: 'turn_left' },
        { id: 'end_repeat' },
      ],
      starter: [{ id: 'paint', param: 'blue' }, { id: 'forward', param: 1 }],
      hints: [
        'A square has 4 sides that are all the same. Same thing 4 times = Repeat!',
        `Each side: Paint, Forward — ${side} times. Then turn left.`,
        `Repeat 4 → (Repeat ${side} → Paint blue, Forward 1 → End) → Turn Left → End.`,
      ],
    };
  }

  if (kind === 'paint') {
    const row = Math.max(1, Math.min(rows - 2, start.row));
    const n = yearNum <= 3 ? 4 : 5;
    const colors = ['red', 'yellow', 'blue', 'green'];
    const targets = Array.from({ length: n }, (_, i) => ({ col: 1 + i, row, color: colors[i % (yearNum <= 3 ? 1 : 2)] }));
    const sol = [];
    targets.forEach((t) => { sol.push({ id: 'forward', param: 1 }); sol.push({ id: 'paint', param: t.color }); });
    const single = yearNum <= 3;
    return {
      ...base, start: { col: 0, row, dir: 0 }, target: null,
      paintTargets: targets,
      goal: single
        ? `Dot is an artist! Paint all ${n} glowing squares red.`
        : `Paint the pattern: match each glowing square's colour (red, yellow, red…).`,
      solution: single
        ? [{ id: 'repeat', param: n }, { id: 'forward', param: 1 }, { id: 'paint', param: 'red' }, { id: 'end_repeat' }]
        : sol,
      starter: [{ id: 'forward', param: 1 }],
      hints: [
        'Move onto a glowing square, then use Paint.',
        single ? 'Forward 1, Paint — and do that again for each square. Could Repeat help?' : 'Tap the colour on a Paint block to change it.',
        single ? `Repeat ${n} → Forward 1 → Paint red → End repeat.` : 'Forward, Paint red, Forward, Paint yellow… one pair per square.',
      ],
    };
  }

  if (kind === 'collect') {
    walls = scatterWalls(r, cols, rows, Math.max(0, wallCount - 1), keep);
    const gems = [];
    for (let tries = 0; gems.length < 3 && tries < 200; tries++) {
      const g = { col: 1 + Math.floor(r() * (cols - 2)), row: Math.floor(r() * rows) };
      const k = key(g.col, g.row);
      if (walls.has(k) || keep.has(k) || gems.some((x) => x.col === g.col && x.row === g.row)) continue;
      gems.push(g);
    }
    gems.sort((a, b) => a.col - b.col);
    const sol = solve([start, ...gems, star]);
    if (!sol) return designBlocks('reach', lesson, yearNum, idx + 50);
    return {
      ...base, walls: cellsOf(walls), gems,
      goal: 'Collect all 3 💎 gems, then reach the ⭐. Every gem adds 1 to Dot\'s score!',
      solution: sol,
      starter: [],
      hints: [
        'Dot\'s score is a variable — it goes up by 1 each time Dot lands on a gem.',
        'Plan a route that visits every gem. Left to right is easiest.',
        'Use the Solution button if you are stuck, then try a shorter route yourself.',
      ],
    };
  }

  if (kind === 'decision') {
    walls = scatterWalls(r, cols, rows, wallCount + 3, keep);
    let sol = solve([start, star]);
    for (let tries = 0; !sol && tries < 6; tries++) {
      walls = scatterWalls(rng(idx + tries * 31), cols, rows, wallCount + 2, keep);
      sol = solve([start, star]);
    }
    if (!sol) return designBlocks('reach', lesson, yearNum, idx + 60);
    return {
      ...base, walls: cellsOf(walls),
      goal: 'Walls block the way! At each wall Dot must decide: turn left or turn right? Find a route to the ⭐.',
      solution: sol,
      starter: [],
      hints: [
        'IF there is a wall ahead, THEN turn. IF not, keep going. That\'s a decision!',
        'Trace the route with your finger first, then build it.',
        'Count squares carefully before each turn.',
      ],
    };
  }

  if (kind === 'deliver') {
    walls = scatterWalls(r, cols, rows, Math.max(0, wallCount - 1), keep);
    const parcel = { col: 2 + Math.floor(r() * 2), row: Math.floor(r() * rows) };
    walls.delete(key(parcel.col, parcel.row));
    const house = star;
    const toParcel = solve([start, parcel]);
    const after = toParcel && (() => {
      const blocks = [...toParcel, { id: 'grab' }];
      let dir = start.dir;
      // recompute facing at the parcel
      const p1 = bfs(start, parcel, cols, rows, walls);
      dir = pathToBlocks(p1, start.dir, []).dir;
      const p2 = bfs(parcel, house, cols, rows, walls);
      if (!p2) return null;
      pathToBlocks(p2, dir, blocks);
      blocks.push({ id: 'release' });
      return blocks;
    })();
    if (!after) return designBlocks('reach', lesson, yearNum, idx + 70);
    return {
      ...base, walls: cellsOf(walls), parcel, house, target: null,
      goal: 'Drive to the 📦 parcel and Grab it, then take it to the 🏠 house and Release it.',
      solution: after,
      starter: [],
      hints: [
        'Two parts: get to the parcel, then get to the house.',
        'Grab only works when Dot is ON the parcel square.',
        'Finish with Release on the house square.',
      ],
    };
  }

  if (kind === 'checkpoints') {
    walls = scatterWalls(r, cols, rows, Math.max(0, wallCount - 1), keep);
    const cps = [];
    for (let tries = 0; cps.length < 2 && tries < 200; tries++) {
      const c = { col: 1 + Math.floor(r() * (cols - 2)), row: Math.floor(r() * rows) };
      const k = key(c.col, c.row);
      if (walls.has(k) || keep.has(k) || cps.some((x) => x.col === c.col && x.row === c.row)) continue;
      cps.push(c);
    }
    cps.sort((a, b) => a.col - b.col);
    const sol = solve([start, ...cps, star]);
    if (!sol) return designBlocks('reach', lesson, yearNum, idx + 80);
    return {
      ...base, walls: cellsOf(walls), checkpoints: cps,
      goal: 'Break the journey into parts: go to flag 1, then flag 2, then the ⭐.',
      solution: sol,
      starter: [],
      hints: [
        'Decomposition means splitting a big job into small ones. Solve part 1 first!',
        'Build the blocks to reach flag 1 and press ▶ Go to test before adding more.',
        'Then add the blocks for flag 2, then the star.',
      ],
    };
  }

  // reach / predict / debug share a route to the star
  walls = scatterWalls(r, cols, rows, wallCount, keep);
  let sol = solve([start, star]);
  if (!sol) { walls = new Set(); sol = solve([start, star]); }
  mission = {
    ...base, walls: cellsOf(walls),
    goal: 'Build a sequence of blocks that gets Dot to the ⭐ star.',
    solution: sol,
    starter: [],
    hints: [
      'A sequence is steps in order. Which way must Dot go first?',
      'Count the squares to the star before choosing the number on Move Forward.',
      'Use Turn Left / Turn Right to change direction, then move again.',
    ],
  };
  if (kind === 'predict') {
    const wrong = sol.map((b) => ({ ...b }));
    const f = wrong.find((b) => b.id === 'forward' && b.param > 1) || wrong.find((b) => b.id === 'forward');
    if (f) f.param = Math.max(1, f.param - 1);
    mission.starter = wrong;
    mission.predict = true;
    mission.goal = 'Predict first! Tap the square where you think Dot will stop, then press ▶ Go. Then change ONE number so Dot reaches the ⭐.';
    mission.hints = [
      'Follow the blocks one at a time with your finger on the grid.',
      'Only ONE number is wrong. Which Move Forward is too short?',
      'Add 1 to one of the Move Forward numbers.',
    ];
  }
  if (kind === 'debug') {
    const buggy = sol.map((b) => ({ ...b }));
    const t = buggy.find((b) => b.id === 'turn_left' || b.id === 'turn_right');
    if (t) t.id = t.id === 'turn_left' ? 'turn_right' : 'turn_left';
    else if (buggy[0]) buggy[0].param = (buggy[0].param || 1) + 1;
    mission.starter = buggy;
    mission.goal = 'Dot\'s program has a bug 🐞! Press ▶ Go to watch what goes wrong, then fix just ONE block.';
    mission.hints = [
      'Run it slowly (Slow speed) and watch where Dot goes the wrong way.',
      t ? 'Look at the turn blocks. Is one turning the wrong way?' : 'Look at the first Move Forward number.',
      t ? 'Swap the wrong turn: Left ↔ Right.' : 'Make the first number one smaller.',
    ];
  }
  return mission;
}

// ── Python missions ──────────────────────────────────────────────────────────
// Each has a real starter program, a goal pupils can check, and a rule the lab
// uses to decide it's done (mustChange / mustContain / outputIncludes).
const PY = {
  predict: [
    {
      goal: '1) Read the code. 2) Write down what you think it will print. 3) Run it. 4) Change ONE number and predict again.',
      starterCode: `# Read this code carefully before you run it!\nrobot = "Dot"\nsteps = 3\nprint(robot, "walks", steps, "steps")\nprint("Distance:", steps * 2, "metres")\n`,
      solutionCode: `robot = "Dot"\nsteps = 5\nprint(robot, "walks", steps, "steps")\nprint("Distance:", steps * 2, "metres")\n`,
      validate: { mustChange: true },
      hints: ['steps * 2 means steps times 2.', 'If steps is 3, the distance is 6.', 'Change steps = 3 to steps = 5 and predict: 10 metres!'],
    },
    {
      goal: 'Predict how many times "Beep" is printed. Run it to check, then change the code so it beeps exactly 5 times.',
      starterCode: `# How many beeps? Predict first!\nfor i in range(3):\n    print("Beep", i)\nprint("Done")\n`,
      solutionCode: `for i in range(5):\n    print("Beep", i)\nprint("Done")\n`,
      validate: { outputIncludes: ['Beep 4'], outputExcludes: ['Beep 5'] },
      hints: ['range(3) gives 0, 1, 2 — that’s 3 numbers.', 'The count starts at 0, not 1!', 'Change range(3) to range(5).'],
    },
  ],
  variables: [
    {
      goal: 'Make a variable called battery set to 80, then print: Dot has 80% battery',
      starterCode: `name = "Dot"\n# make a variable called battery here\n\nprint(name, "is ready!")\n`,
      solutionCode: `name = "Dot"\nbattery = 80\nprint(name, "is ready!")\nprint(name, "has", str(battery) + "% battery")\n`,
      validate: { mustContain: ['battery'], outputIncludes: ['80'] },
      hints: ['A variable is a named box: battery = 80', 'print can show text and variables: print(name, "has", battery)', 'Look at the Solution to see how % is joined on.'],
    },
  ],
  functions: [
    {
      goal: 'Write a function cheer(name) that prints "Go <name>!" — then call it for two friends.',
      starterCode: `def greet(name):\n    print("Hello", name)\n\ngreet("Dot")\n\n# write your cheer(name) function below\n`,
      solutionCode: `def greet(name):\n    print("Hello", name)\n\ndef cheer(name):\n    print("Go " + name + "!")\n\ngreet("Dot")\ncheer("Sam")\ncheer("Aisha")\n`,
      validate: { mustContain: ['def cheer'], outputIncludes: ['Go '] },
      hints: ['Copy the shape of greet: def cheer(name):', 'Inside, print("Go " + name + "!")', 'Call it twice: cheer("Sam") and cheer("Aisha")'],
    },
  ],
  loop: [
    {
      goal: 'Use a for loop to print "Step 1" up to "Step 5".',
      starterCode: `# A loop repeats code for you\nfor i in range(3):\n    print("Hello")\n`,
      solutionCode: `for i in range(1, 6):\n    print("Step", i)\n`,
      validate: { mustContain: ['for '], outputIncludes: ['Step 5'] },
      hints: ['range(1, 6) counts 1, 2, 3, 4, 5.', 'Use the loop variable: print("Step", i)', 'for i in range(1, 6): print("Step", i)'],
    },
  ],
  paint: [
    {
      goal: 'Use a loop to draw a staircase of stars 5 rows tall (1 star, then 2, then 3…).',
      starterCode: `# "*" * 3 makes ***\nprint("*" * 1)\nprint("*" * 2)\n# can a loop do the rest?\n`,
      solutionCode: `for row in range(1, 6):\n    print("*" * row)\n`,
      validate: { mustContain: ['for '], outputIncludes: ['*****'] },
      hints: ['Each row has one more star than the last.', 'for row in range(1, 6):', 'Inside the loop: print("*" * row)'],
    },
    {
      goal: 'Print a pattern that alternates 🟥 and 🟨 eight times on one line, using a loop and if.',
      starterCode: `line = ""\nfor i in range(8):\n    line = line + "🟥"\nprint(line)\n`,
      solutionCode: `line = ""\nfor i in range(8):\n    if i % 2 == 0:\n        line = line + "🟥"\n    else:\n        line = line + "🟨"\nprint(line)\n`,
      validate: { mustContain: ['if '], outputIncludes: ['🟥🟨'] },
      hints: ['i % 2 is 0 for even numbers and 1 for odd ones.', 'if i % 2 == 0: add red, else: add yellow.', 'See the Solution for the full pattern.'],
    },
  ],
  decision: [
    {
      goal: 'Finish the if / else: if score is more than 10 print "You win!", else print "Keep going!". Test score = 15 and score = 4.',
      starterCode: `score = 15\n\nif score > 10:\n    print("You win!")\n# add an else here\n`,
      solutionCode: `score = 4\n\nif score > 10:\n    print("You win!")\nelse:\n    print("Keep going!")\n`,
      validate: { mustContain: ['else:'], outputIncludes: ['Keep going'] },
      hints: ['else lines up with if.', 'else:  (with a colon) then an indented print.', 'Change score to 4 to test the else.'],
    },
    {
      goal: 'Dot can only go outside if it is sunny AND the battery is over 50. Finish the condition and test both ways.',
      starterCode: `sunny = True\nbattery = 70\n\nif sunny:\n    print("Dot goes outside")\nelse:\n    print("Dot stays in")\n`,
      solutionCode: `sunny = True\nbattery = 70\n\nif sunny and battery > 50:\n    print("Dot goes outside")\nelse:\n    print("Dot stays in")\n`,
      validate: { mustContain: ['and'] },
      hints: ['Both things must be true — use and.', 'if sunny and battery > 50:', 'Try battery = 30 to check the else.'],
    },
  ],
  collect: [
    {
      goal: 'Make a list of 3 gems and use a loop to print each one, then print how many there are.',
      starterCode: `gems = ["ruby", "emerald"]\n# add a third gem, then loop through the list\n`,
      solutionCode: `gems = ["ruby", "emerald", "sapphire"]\nfor gem in gems:\n    print("Found a", gem)\nprint("Total gems:", len(gems))\n`,
      validate: { mustContain: ['for '], outputIncludes: ['3'] },
      hints: ['Lists use square brackets and commas.', 'for gem in gems: print(gem)', 'len(gems) tells you how many.'],
    },
    {
      goal: 'Keep score! Add 10 points for every coin in the list and print the final score.',
      starterCode: `pickups = ["coin", "rock", "coin", "coin", "leaf"]\nscore = 0\nfor item in pickups:\n    print("Found", item)\n# print the score at the end\n`,
      solutionCode: `pickups = ["coin", "rock", "coin", "coin", "leaf"]\nscore = 0\nfor item in pickups:\n    if item == "coin":\n        score = score + 10\nprint("Score:", score)\n`,
      validate: { mustContain: ['score'], outputIncludes: ['30'] },
      hints: ['Only coins score — use if item == "coin":', 'score = score + 10 adds to the variable.', 'There are 3 coins, so the answer is 30.'],
    },
  ],
  debug: [
    {
      goal: 'This program has 2 bugs 🐞. Run it, read the error, and fix it so it prints both lines.',
      starterCode: `name = "Dot\nprint("Hello", nme)\nprint("Bugs fixed!")\n`,
      solutionCode: `name = "Dot"\nprint("Hello", name)\nprint("Bugs fixed!")\n`,
      validate: { outputIncludes: ['Bugs fixed!'] },
      hints: ['Read the error message — it tells you the line.', 'A string needs a closing quote mark.', 'Check the spelling of the variable name.'],
    },
    {
      goal: 'The countdown should go 5, 4, 3, 2, 1, Lift off! — but it doesn’t. Find and fix the bug.',
      starterCode: `count = 5\nwhile count > 0:\n    print(count)\n    count = count + 1\n    if count > 8:\n        break\nprint("Lift off!")\n`,
      solutionCode: `count = 5\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("Lift off!")\n`,
      validate: { outputIncludes: ['1', 'Lift off!'], outputExcludes: ['6'] },
      hints: ['Watch the numbers — are they going up or down?', 'A countdown should take 1 away each time.', 'count = count - 1 (and you can remove the break).'],
    },
  ],
  deliver: [
    {
      goal: 'Simulated sensor: if distance is less than 10, print "Stop!", else print "Drive". Test with distance = 5 and 20.',
      starterCode: `distance = 5\n# write the if / else for the sensor\n`,
      solutionCode: `distance = 5\nif distance < 10:\n    print("Stop!")\nelse:\n    print("Drive")\n`,
      validate: { mustContain: ['if '], outputIncludes: ['Stop'] },
      hints: ['A sensor gives a number — the program decides what to do with it.', 'if distance < 10:', 'else: print("Drive")'],
    },
    {
      goal: 'Dot reads a list of sensor values. For each one print "Obstacle!" if it is under 15, otherwise "Clear".',
      starterCode: `readings = [40, 22, 12, 30, 8]\nfor r in readings:\n    print("Reading", r)\n`,
      solutionCode: `readings = [40, 22, 12, 30, 8]\nfor r in readings:\n    if r < 15:\n        print(r, "Obstacle!")\n    else:\n        print(r, "Clear")\n`,
      validate: { mustContain: ['if '], outputIncludes: ['Obstacle!', 'Clear'] },
      hints: ['Put an if inside the loop.', 'if r < 15: print("Obstacle!")', 'else: print("Clear")'],
    },
  ],
  checkpoints: [
    {
      goal: 'Break Dot’s morning into functions: wake_up(), charge() and go(). Write the missing two and call all three in order.',
      starterCode: `def wake_up():\n    print("Dot wakes up")\n\n# write charge() and go() here\n\nwake_up()\n`,
      solutionCode: `def wake_up():\n    print("Dot wakes up")\n\ndef charge():\n    print("Dot charges to 100%")\n\ndef go():\n    print("Dot rolls to school")\n\nwake_up()\ncharge()\ngo()\n`,
      validate: { mustContain: ['def charge', 'def go'], minLines: 3 },
      hints: ['Each small job gets its own function.', 'def charge(): then an indented print.', 'Call them in order at the bottom.'],
    },
    {
      goal: 'Plan a quiz in parts: ask() checks one answer. Use it for 3 questions and print the total score.',
      starterCode: `score = 0\n\ndef ask(answer, correct):\n    if answer == correct:\n        print("Correct!")\n        return 1\n    print("Not quite")\n    return 0\n\nscore = score + ask(4, 2 + 2)\n# add two more questions, then print the score\n`,
      solutionCode: `score = 0\n\ndef ask(answer, correct):\n    if answer == correct:\n        print("Correct!")\n        return 1\n    print("Not quite")\n    return 0\n\nscore = score + ask(4, 2 + 2)\nscore = score + ask(10, 5 * 2)\nscore = score + ask(7, 3 + 3)\nprint("Score:", score, "out of 3")\n`,
      validate: { outputIncludes: ['Score'], minLines: 3 },
      hints: ['Copy the line score = score + ask(…) twice.', 'Change the numbers for each question.', 'Finish with print("Score:", score)'],
    },
    {
      goal: 'Simulate a system: a plant waters itself. Loop over 5 days — if soil is under 30, water it (+40). Soil drops 15 each day.',
      starterCode: `soil = 50\nfor day in range(1, 6):\n    soil = soil - 15\n    print("Day", day, "soil", soil)\n`,
      solutionCode: `soil = 50\nfor day in range(1, 6):\n    soil = soil - 15\n    if soil < 30:\n        soil = soil + 40\n        print("Day", day, "watering!")\n    print("Day", day, "soil", soil)\n`,
      validate: { mustContain: ['if '], outputIncludes: ['watering'] },
      hints: ['Inputs → decision → output. Where does the decision go?', 'if soil < 30: inside the loop.', 'soil = soil + 40 then print a message.'],
    },
  ],
  reach: [
    {
      goal: 'Networks send messages in packets. Split the message into words and print each packet with its number.',
      starterCode: `message = "meet at the robot lab"\npackets = message.split(" ")\nprint(packets)\n`,
      solutionCode: `message = "meet at the robot lab"\npackets = message.split(" ")\nfor i in range(len(packets)):\n    print("Packet", i + 1, ":", packets[i])\n`,
      validate: { mustContain: ['for '], outputIncludes: ['Packet 5'] },
      hints: ['split(" ") makes a list of words.', 'Loop with range(len(packets)).', 'print("Packet", i + 1, ":", packets[i])'],
    },
  ],
  system: [
    {
      goal: 'Input → process → output: store a price, add £2 postage, and print the total.',
      starterCode: `price = 5\n# process: add 2 for postage\n\n# output: print the total\n`,
      solutionCode: `price = 5\ntotal = price + 2\nprint("Total cost: £" + str(total))\n`,
      validate: { mustContain: ['print'], outputIncludes: ['7'] },
      hints: ['total = price + 2', 'print("Total:", total)', 'The answer should be 7.'],
    },
  ],
};

function designPython(kind, lesson, idx = 0) {
  const t = `${lesson?.title || ''}`.toLowerCase();
  const pick = (list) => ({ ...list[idx % list.length] });
  if (/read, predict/.test(t)) return { ...PY.predict[0], predict: true };
  if (/print and variables/.test(t)) return pick(PY.variables);
  if (/function|capstone snippet/.test(t)) return pick(PY.functions);
  if (kind === 'loop' || kind === 'nested' || kind === 'shapes' || kind === 'efficient') return pick(PY.loop);
  if (kind === 'predict') return { ...pick(PY.predict), predict: true };
  if (PY[kind]) return pick(PY[kind]);
  return pick(PY.system);
}

/** Everything a lesson's coding lab needs. */
export function designLab(lesson, yr, idx, editor) {
  const yearNum = parseInt(String(yr).replace('y', ''), 10) || 3;
  const kind = labKindFor(lesson);
  const blocks = designBlocks(kind, lesson, yearNum, idx);
  const python = designPython(kind, lesson, idx);
  return { kind, blocks, python, editor };
}
