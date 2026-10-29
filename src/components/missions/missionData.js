/** Missions: the four campaigns, their checks and block starters. */
export const CAMPAIGNS = [
  {
    id: 'space',
    title: 'Space Explorer',
    emoji: '🚀',
    tagline: 'Master sequences & loops across the galaxy',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.4)',
    bg: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #0f0f3a 100%)',
    concept: 'Sequences & Loops',
    difficulty: 'Beginner',
    xpTotal: 500,
    missions: [
      { id: 'space-1', title: 'Launch Sequence', emoji: '🔥', story: 'Captain! The launch computer is offline. Mission control needs you to manually program the engine sequence before the window closes.', challenge: 'Create a sequence of at least 5 blocks that fires the rocket: countdown → ignite engines → release clamps → go!', xp: 75, hint: 'Use the "repeat" and "print" blocks to build your countdown.' },
      { id: 'space-2', title: 'Orbit Calculator', emoji: '🌍', story: 'You\'ve escaped Earth\'s atmosphere! Now you need to set the perfect orbit around the planet.', challenge: 'Use a loop to make your rocket orbit the planet exactly 3 times, adjusting speed at each pass.', xp: 100, hint: 'Use "repeat 3 times" with print blocks inside it.' },
      { id: 'space-3', title: 'Asteroid Field', emoji: '☄️', story: 'Danger! A field of asteroids is dead ahead. You\'ll need quick reactions to survive.', challenge: 'Write code that checks "if touching asteroid → dodge left". Add a score counter for each asteroid dodged.', xp: 100, hint: 'Use if blocks from Control and a variable to track your score.' },
      { id: 'space-4', title: 'Space Beacon', emoji: '📡', story: 'You\'ve found a distress beacon from a lost probe! You need to decode it and broadcast the reply.', challenge: 'Use a function to handle different beacon signals. Call it with at least 2 different signals.', xp: 125, hint: 'Define a function with a parameter, then call it multiple times.' },
      { id: 'space-5', title: 'Safe Landing', emoji: '🏆', story: 'The mission is complete. Now guide your ship through re-entry and land safely.', challenge: 'Build a full landing sequence using sequences, loops, conditions AND functions — all four concepts!', xp: 100, hint: 'Combine all the concepts from previous missions into one final program.' },
    ],
  },
  {
    id: 'ocean',
    title: 'Ocean Deep',
    emoji: '🌊',
    tagline: 'Explore the deep sea with conditions & events',
    color: '#0ea5e9',
    glow: 'rgba(14,165,233,0.4)',
    bg: 'linear-gradient(135deg, #001a2e 0%, #003a5c 50%, #001f3f 100%)',
    concept: 'Conditions & Events',
    difficulty: 'Intermediate',
    xpTotal: 600,
    missions: [
      { id: 'ocean-1', title: 'Dive Protocol', emoji: '🤿', story: 'The submarine systems are ready. Pressure increases with depth — your code must adapt.', challenge: 'Program the submarine to dive in stages: surface → 10m → 50m → 200m, checking pressure at each depth.', xp: 80, hint: 'Use variables for depth and if/else to check thresholds.' },
      { id: 'ocean-2', title: 'Coral Maze', emoji: '🪸', story: 'The coral reef is beautiful — but deadly to your sub. Navigate through without touching the walls.', challenge: 'Use if to detect coral and change direction. Make the sub navigate the whole maze without stopping.', xp: 120, hint: 'Use a repeat loop and if to dodge coral obstacles.' },
      { id: 'ocean-3', title: 'Shark Alert', emoji: '🦈', story: 'The sonar just lit up. Sharks in the area! Trigger 3 simultaneous responses.', challenge: 'When a shark is detected, trigger 3 functions: sound the alarm, flash the lights, and send a radio message.', xp: 120, hint: 'Define 3 functions and call them all inside an if block.' },
      { id: 'ocean-4', title: 'Treasure Grid', emoji: '💎', story: 'Ancient treasure is scattered on an 8×8 grid. Your robot arm needs to scan every square.', challenge: 'Use nested loops to scan every square of an 8×8 grid. Count how many treasures you find.', xp: 150, hint: 'Use two repeat loops — one inside the other — to cover a grid.' },
      { id: 'ocean-5', title: 'Surface!', emoji: '🏆', story: 'The oxygen supply is running low. Emergency ascent!', challenge: 'Build a full escape sequence — use a while loop, track oxygen, and surface before time runs out.', xp: 130, hint: 'Use a while loop with oxygen as the condition.' },
    ],
  },
  {
    id: 'city',
    title: 'City Builder',
    emoji: '🏙️',
    tagline: 'Build a thriving city with variables & data',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    bg: 'linear-gradient(135deg, #1a1200 0%, #3d2a00 50%, #1f1800 100%)',
    concept: 'Variables & Data',
    difficulty: 'Intermediate',
    xpTotal: 650,
    missions: [
      { id: 'city-1', title: 'Blueprint', emoji: '📐', story: 'You\'ve been appointed lead engineer! Set up the city variables before anything can be built.', challenge: 'Create 4 variables: population (100), budget (50000), happiness (75), days (0). Display them all.', xp: 80, hint: 'Use set variable blocks for each one, then print them.' },
      { id: 'city-2', title: 'Build the Roads', emoji: '🛣️', story: 'The citizens need roads! Each road costs money but increases happiness.', challenge: 'Loop 5 times: each iteration deduct 2000 from budget, add 3 to happiness, print the new values.', xp: 120, hint: 'Use change variable blocks inside a repeat loop.' },
      { id: 'city-3', title: 'Power Grid', emoji: '⚡', story: 'The city needs power across 4 districts.', challenge: 'Loop through 4 districts: if power < 50 → add power and deduct from budget. Report total cost.', xp: 130, hint: 'Use a repeat loop and if to check each district.' },
      { id: 'city-4', title: 'Population Boom', emoji: '📈', story: 'Your city is growing fast! Track growth over 10 days.', challenge: 'Simulate 10 days: each day population increases by 5% if happiness > 70, or by 1% if not.', xp: 160, hint: 'Use set population to int(population * 1.05) inside if/else inside a loop.' },
      { id: 'city-5', title: 'Grand Opening', emoji: '🏆', story: 'The mayor is arriving! Show off all your city\'s stats.', challenge: 'Build a report that displays all variables and calculates a "City Score" = (happiness × 10) + (population / 10).', xp: 160, hint: 'Create a city_score variable and calculate it from your other variables.' },
    ],
  },
  {
    id: 'cyber',
    title: 'Cyber Quest',
    emoji: '⚡',
    tagline: 'Master functions & AI to save the network',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    bg: 'linear-gradient(135deg, #001a0e 0%, #003320 50%, #001a0e 100%)',
    concept: 'Functions & AI',
    difficulty: 'Advanced',
    xpTotal: 750,
    missions: [
      { id: 'cyber-1', title: 'Debug Protocol', emoji: '🐛', story: 'The network is riddled with bugs! Write a fix function for each bug type.', challenge: 'Create a function called fixBug that takes a bug type as input. Call it 5 times with different inputs.', xp: 100, hint: 'Define a function with a parameter, then call it 5 times.' },
      { id: 'cyber-2', title: 'Pattern Lock', emoji: '🔐', story: 'The security vault uses a pattern lock. Crack the formula to unlock the door.', challenge: 'Write a function that generates the sequence: 2, 4, 8, 16, 32.', xp: 140, hint: 'Each step multiplies by 2. Use a loop inside your function.' },
      { id: 'cyber-3', title: 'Neural Guard', emoji: '🤖', story: 'The base AI has gone rogue! Train a new classifier to recognise safe vs threat signals.', challenge: 'Classify 5 different inputs as "safe" or "threat". For each "threat" trigger a lockdown function.', xp: 160, hint: 'Use a classify function with "if result = threat → call lockdown()" pattern.' },
      { id: 'cyber-4', title: 'Data Heist', emoji: '💾', story: 'The enemy has stolen the city\'s data! Decrypt it using recursive function calls.', challenge: 'Write a recursive function "decrypt" that calls itself until it reaches the base case.', xp: 200, hint: 'Recursion: a function that calls itself. Use if count > 0 → call decrypt(count - 1).' },
      { id: 'cyber-5', title: 'System Victory', emoji: '🏆', story: 'Run the final diagnostic — a function that calls all your previous functions.', challenge: 'Write a "runDiagnostic" function that calls fixBug, decrypt, and lockdown in order.', xp: 150, hint: 'Your final function should call all the functions you wrote in earlier missions.' },
    ],
  },
  {
    id: 'jungle',
    title: 'Jungle Expedition',
    emoji: '🌿',
    tagline: 'Explore the rainforest with lists & strings',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.4)',
    bg: 'linear-gradient(135deg, #021a0c 0%, #064e3b 50%, #022c16 100%)',
    concept: 'Lists & Strings',
    difficulty: 'Intermediate',
    xpTotal: 600,
    missions: [
      { id: 'jungle-1', title: 'Supply Pack', emoji: '🎒', story: 'The expedition leaves at dawn! Professor Fern needs every supply checked into the pack before the boat sails up the river.', challenge: 'Store the supplies in a list, use a loop to print each one as it is packed, then report how many there are with len().', xp: 100, hint: 'A for loop can visit every item in a list: for item in supplies:' },
      { id: 'jungle-2', title: 'Animal Spotter', emoji: '🦜', story: 'The rainforest is alive with animals. Every time you spot a new one, add it to the field notebook.', challenge: 'Start with a list of 2 animals. Use .append() to add 3 more as you spot them, then print how many you have seen.', xp: 110, hint: 'animals.append("toucan") adds toucan to the end of the list.' },
      { id: 'jungle-3', title: 'Secret Map Code', emoji: '🗺️', story: 'You found an old map with a message written backwards in lowercase. Decode it to find where the treasure is hidden!', challenge: 'Reverse the secret message and turn it into capital letters, then print where the treasure is.', xp: 120, hint: 'text[::-1] reverses a string and text.upper() makes it CAPITALS.' },
      { id: 'jungle-4', title: 'River Crossing', emoji: '🪨', story: 'The bridge is gone! You must hop across the river on stepping stones — but only the highest stone is safe to rest on.', challenge: 'Loop through the stone heights and use if to remember the highest one. Print the highest stone and which number it is.', xp: 130, hint: 'Keep a variable called highest. If a stone is taller than highest, update it.' },
      { id: 'jungle-5', title: 'Expedition Log', emoji: '📓', story: 'The expedition is over! Write up the log for the museum: one line for every day and what you found.', challenge: 'Loop through two lists together (days and finds) and print a log line for each day, then a final summary.', xp: 140, hint: 'for i in range(len(days)): lets you use days[i] and finds[i] together.' },
    ],
  },
  {
    id: 'dino',
    title: 'Dino Park Rescue',
    emoji: '🦕',
    tagline: 'Find and fix the bugs to keep the dinosaurs safe',
    color: '#14b8a6',
    glow: 'rgba(20,184,166,0.4)',
    bg: 'linear-gradient(135deg, #04201d 0%, #134e4a 50%, #042f2e 100%)',
    concept: 'Debugging',
    difficulty: 'All levels',
    xpTotal: 600,
    missions: [
      { id: 'dino-1', title: 'Broken Gate', emoji: '🚧', story: 'Oh no! The gate program crashed and the dinosaurs are wandering towards the gift shop. The code has two little mistakes in it.', challenge: 'Find and fix the bugs so the program runs, opens the gate and prints "Dinos safe".', xp: 100, hint: 'Read the error message — it tells you the line. Check that every piece of text has a quote mark at both ends, and that print is spelt correctly.' },
      { id: 'dino-2', title: 'Feeding Time', emoji: '🥬', story: 'Three hungry dinosaurs are waiting for lunch, but the feeding robot only feeds two of them. Someone is going to be grumpy!', challenge: 'Fix the loop so that every dinosaur in the list gets fed.', xp: 110, hint: 'How many times does the loop run? How many dinosaurs are in the list? Try len(dinos).' },
      { id: 'dino-3', title: 'Egg Hatchery', emoji: '🥚', story: 'The eggs hatch when they are warm enough — 30 degrees or more. The hatchery code is hatching the cold eggs instead!', challenge: 'Fix the if so that only eggs at 30 degrees or warmer hatch.', xp: 120, hint: 'The sign is the wrong way round. Which comparison means "30 or more"?' },
      { id: 'dino-4', title: 'Ranger Radio', emoji: '📻', story: 'A T-Rex has escaped into the forest! The radio code should call a ranger in every zone, but it crashes straight away.', challenge: 'Fix the function call so a ranger is called in all 3 zones.', xp: 130, hint: 'A function must be called by exactly the name it was given with def — capitals and underscores matter.' },
      { id: 'dino-5', title: 'Park Report', emoji: '📋', story: 'The park owner wants to know how many dinosaurs live in the park. The counting code says 9 — but there are many more than that!', challenge: 'Fix the running total so it adds up every pen and reports the right number of dinosaurs.', xp: 140, hint: 'Use total += count to ADD each pen. total = count throws away what you had before.' },
    ],
  },
];

// ── Mission Block Editor ────────────────────────────────────────────────────

export const MBLOCK_DEFS = {
  print:      { label: 'Print',           color: '#10b981', icon: '📢',
    params: [{ key: 'message', label: 'Value', default: '"Hello!"' }],
    gen: (p) => {
      const msg = (p.message || '""').trim();
      // Quoted text, f-strings, names, numbers and calculations are code; plain words become text
      const isCode = /^f?["']/.test(msg) || /^-?\d+(\.\d+)?$/.test(msg) || /^[a-zA-Z_][\w.]*$/.test(msg)
        || (/[+\-*/%()[\]<>=,]/.test(msg) && !/^[A-Za-z][A-Za-z ]*[!?.]*$/.test(msg));
      if (isCode) return `print(${msg})`;
      return `print("${msg.replace(/"/g, '\\"')}")`;
    },
  },
  repeat:     { label: 'Repeat',          color: '#f59e0b', icon: '🔄',
    params: [{ key: 'times', label: 'Times', default: '3' }],
    gen: (p, v) => `for ${v || 'i'} in range(${p.times || '3'}):`, container: true,
  },
  while:      { label: 'While',           color: '#f97316', icon: '🔁',
    params: [{ key: 'cond', label: 'Condition', default: 'x > 0' }],
    gen: (p) => `while ${p.cond || 'True'}:`, container: true,
  },
  if:         { label: 'If',              color: '#8b5cf6', icon: '❓',
    params: [{ key: 'cond', label: 'Condition', default: 'x > 0' }],
    gen: (p) => `if ${p.cond || 'True'}:`, container: true,
  },
  'var-set':  { label: 'Set Variable',    color: '#0ea5e9', icon: '📦',
    params: [{ key: 'name', label: 'Name', default: 'x' }, { key: 'value', label: 'Value', default: '0' }],
    gen: (p) => `${p.name || 'x'} = ${p.value || '0'}`,
  },
  'var-change': { label: 'Change Var',   color: '#0284c7', icon: '🔧',
    params: [{ key: 'name', label: 'Name', default: 'x' }, { key: 'op', label: 'Op', default: '+=' }, { key: 'amount', label: 'By', default: '1' }],
    gen: (p) => `${p.name || 'x'} ${p.op || '+='} ${p.amount || '1'}`,
  },
  'func-def': { label: 'Define Function', color: '#ec4899', icon: '⚡',
    params: [{ key: 'name', label: 'Name', default: 'myFunc' }, { key: 'args', label: 'Args', default: '' }],
    gen: (p) => `def ${p.name || 'myFunc'}(${p.args || ''}):`, container: true,
  },
  'func-call':{ label: 'Call Function',  color: '#db2777', icon: '📞',
    params: [{ key: 'name', label: 'Name', default: 'myFunc' }, { key: 'args', label: 'Args', default: '' }],
    gen: (p) => `${p.name || 'myFunc'}(${p.args || ''})`,
  },
  return:     { label: 'Return',          color: '#ef4444', icon: '↩',
    params: [{ key: 'value', label: 'Value', default: '' }],
    gen: (p) => p.value ? `return ${p.value}` : 'return',
  },
  comment:    { label: 'Comment',         color: '#6b7280', icon: '#',
    params: [{ key: 'text', label: 'Text', default: 'My note' }],
    gen: (p) => `# ${p.text || ''}`,
  },
  elif:       { label: 'Else if',         color: '#7c3aed', icon: '❓',
    params: [{ key: 'cond', label: 'Condition', default: 'x > 0' }],
    gen: (p) => `elif ${p.cond || 'True'}:`, container: true,
  },
  else:       { label: 'Else',            color: '#6d28d9', icon: '↩',
    params: [],
    gen: () => 'else:', container: true,
  },
  'for-each': { label: 'For each',        color: '#d97706', icon: '🔁',
    params: [{ key: 'var', label: 'Item', default: 'item' }, { key: 'list', label: 'In', default: '[1, 2, 3]' }],
    gen: (p) => `for ${p.var || 'item'} in ${p.list || '[]'}:`, container: true,
  },
  code:       { label: 'Python line',     color: '#475569', icon: '🐍',
    params: [{ key: 'code', label: 'Code', default: 'x = 1' }],
    gen: (p) => p.code || 'pass',
  },
};

/** Blocks every mission gets on top of its own palette. */
const ALWAYS = ['comment', 'code'];
const WITH_IF = ['elif', 'else'];

export const MISSION_PALETTE = {
  'jungle-1': ['var-set', 'for-each', 'print', 'comment'],
  'jungle-2': ['var-set', 'func-call', 'print', 'comment'],
  'jungle-3': ['var-set', 'print', 'comment'],
  'jungle-4': ['var-set', 'for-each', 'if', 'print', 'comment'],
  'jungle-5': ['var-set', 'repeat', 'for-each', 'print', 'comment'],
  'dino-1': ['print', 'var-set', 'comment'],
  'dino-2': ['var-set', 'repeat', 'for-each', 'print', 'comment'],
  'dino-3': ['var-set', 'for-each', 'if', 'print', 'comment'],
  'dino-4': ['func-def', 'func-call', 'print', 'comment'],
  'dino-5': ['var-set', 'var-change', 'for-each', 'print', 'comment'],
  'space-1':  ['print', 'comment'],
  'space-2':  ['repeat', 'print', 'var-set', 'comment'],
  'space-3':  ['var-set', 'var-change', 'repeat', 'if', 'print', 'comment'],
  'space-4':  ['func-def', 'func-call', 'if', 'print', 'comment'],
  'space-5':  ['func-def', 'func-call', 'var-set', 'var-change', 'repeat', 'if', 'return', 'print', 'comment'],
  'ocean-1':  ['var-set', 'var-change', 'repeat', 'if', 'print', 'comment'],
  'ocean-2':  ['var-set', 'var-change', 'repeat', 'if', 'print', 'comment'],
  'ocean-3':  ['func-def', 'func-call', 'var-set', 'if', 'print', 'comment'],
  'ocean-4':  ['var-set', 'var-change', 'repeat', 'if', 'print', 'comment'],
  'ocean-5':  ['var-set', 'var-change', 'while', 'if', 'print', 'comment'],
  'city-1':   ['var-set', 'print', 'comment'],
  'city-2':   ['var-set', 'var-change', 'repeat', 'if', 'print', 'comment'],
  'city-3':   ['var-set', 'var-change', 'repeat', 'if', 'print', 'comment'],
  'city-4':   ['var-set', 'var-change', 'repeat', 'if', 'print', 'comment'],
  'city-5':   ['var-set', 'var-change', 'print', 'comment'],
  'cyber-1':  ['func-def', 'func-call', 'if', 'print', 'comment'],
  'cyber-2':  ['func-def', 'func-call', 'var-set', 'var-change', 'repeat', 'return', 'print', 'comment'],
  'cyber-3':  ['func-def', 'func-call', 'var-set', 'var-change', 'repeat', 'if', 'return', 'print', 'comment'],
  'cyber-4':  ['func-def', 'func-call', 'var-set', 'var-change', 'if', 'return', 'print', 'comment'],
  'cyber-5':  ['func-def', 'func-call', 'var-set', 'var-change', 'print', 'comment'],
};

// Extend each mission's palette: Else / Else-if next to If, For-each next to loops,
// and a Python line for anything the blocks can't say.
for (const [id, list] of Object.entries(MISSION_PALETTE)) {
  const out = [...list];
  if (out.includes('if')) out.splice(out.indexOf('if') + 1, 0, ...WITH_IF.filter((t) => !out.includes(t)));
  if ((out.includes('repeat') || out.includes('while')) && !out.includes('for-each')) out.splice(out.indexOf(out.includes('repeat') ? 'repeat' : 'while') + 1, 0, 'for-each');
  ALWAYS.forEach((t) => { if (!out.includes(t)) out.push(t); });
  MISSION_PALETTE[id] = out;
}

export function mb(type, indent, params) {
  return { id: Math.random().toString(36).slice(2), type, indent, params };
}

export function genPyFromBlocks(blocks) {
  if (!blocks.length) return '# Add blocks from the palette!\n';
  const loopVars = ['i', 'j', 'k', 'n'];
  const lines = [];
  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];
    const def = MBLOCK_DEFS[block.type];
    if (!def) continue;
    const indent = block.indent || 0;
    const pad = '    '.repeat(indent);
    const loopVar = loopVars[indent] || 'x';
    lines.push(pad + def.gen(block.params || {}, loopVar));
    if (def.container) {
      const nextIndent = idx + 1 < blocks.length ? (blocks[idx + 1].indent || 0) : -1;
      if (nextIndent <= indent) lines.push(pad + '    pass');
    }
  }
  return lines.join('\n');
}

/**
 * Turn a Python program into mission blocks, so a mission's Blocks starter is the
 * same unfinished program as its Python starter. Anything the blocks can't
 * express becomes a "Python line" block, so nothing is ever lost.
 */
export function pyToBlocks(code) {
  const loopVars = ['i', 'j', 'k', 'n'];
  const out = [];
  for (const raw of String(code || '').split('\n')) {
    if (!raw.trim()) continue;
    const indent = Math.floor((raw.match(/^ */)[0].length) / 4);
    const t = raw.trim();
    let m;
    const add = (type, params) => out.push(mb(type, indent, params));
    if ((m = t.match(/^#\s?(.*)$/))) add('comment', { text: m[1] });
    else if ((m = t.match(/^print\((.*)\)$/))) add('print', { message: m[1] });
    else if ((m = t.match(/^for\s+(\w+)\s+in\s+range\(\s*([^,()]+?)\s*\):$/)) && m[1] === loopVars[indent]) add('repeat', { times: m[2] });
    else if ((m = t.match(/^for\s+(\w+)\s+in\s+(.+):$/))) add('for-each', { var: m[1], list: m[2] });
    else if ((m = t.match(/^while\s+(.+):$/))) add('while', { cond: m[1] });
    else if ((m = t.match(/^if\s+(.+):$/))) add('if', { cond: m[1] });
    else if ((m = t.match(/^elif\s+(.+):$/))) add('elif', { cond: m[1] });
    else if (t === 'else:') add('else', {});
    else if ((m = t.match(/^def\s+(\w+)\((.*)\):$/))) add('func-def', { name: m[1], args: m[2] });
    else if ((m = t.match(/^return(?:\s+(.+))?$/))) add('return', { value: m[1] || '' });
    else if ((m = t.match(/^(\w+)\s*(\+=|-=|\*=|\/=|\/\/=)\s*(.+)$/))) add('var-change', { name: m[1], op: m[2], amount: m[3] });
    else if ((m = t.match(/^(\w+)\s*=\s*(?!=)(.+)$/))) add('var-set', { name: m[1], value: m[2] });
    else if ((m = t.match(/^(\w+)\((.*)\)$/))) add('func-call', { name: m[1], args: m[2] });
    else add('code', { code: t });
  }
  return out;
}
