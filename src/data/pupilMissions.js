/**
 * Unique child-facing missions for all 152 KS2 weeks.
 */

const Q = (q, options, answer, rationale) => ({ q, options, answer, rationale });

function seed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return Math.abs(h);
}

const HOOKS = {
  3: [
    'Dot the robot only works when people are kind and clear. Today you learn the class computer rules.',
    'A sandwich recipe is an algorithm. Mix the steps and you get jam everywhere.',
    'Before Dot runs, guess where Dot will stop. If you are wrong, find the line that fooled you.',
    'Green flag, then move, then turn. That is your first on-screen sequence.',
    'Dot turned the wrong way. Fix just that one block — not the whole program.',
    'No new idea today. Prove you remember safety, algorithms, predicting and debugging.',
    'Plan Dot’s morning: get up, line up, log in. Tiny jobs first — code later.',
    'Repeating move ten times is boring. A loop does it with one block if the count is right.',
    'The green flag is an event. Something happens because you started it.',
    'Pen down, move, turn — Dot draws a pattern. Code can make art.',
    'A variable is a labelled box. Put a score in the box and change it when you win a star.',
    'A huge job is scary. Chop it into three little jobs you can actually finish.',
    'Autumn 2 check: loops, flags, scores and chopping jobs. Teach a partner one of them.',
    'Morning routine part 2: snap your paper plan into real blocks and test it.',
    'Data is facts we collect on purpose — favourite fruit, not your home address.',
    'Tally, then chart. Can someone else read what your class found out?',
    'Put a tally inside a program. The sprite’s score is data too.',
    'Two websites can disagree. Check who wrote it before you believe it.',
    'Kind comments, private details, tell a trusted adult. That is online power.',
    'Spring 1 check: data, search and kindness. One star, one wish.',
    'You are data detectives: a question, a table, a chart, a sentence of evidence.',
    'Paint with code: colour, stamp, repeat. Make a pattern the class can name.',
    'Two sprites, a beginning, a middle, an end. Animate a tiny story.',
    'Pair programming: one driver, one navigator. Swap every five minutes.',
    'Your buddy’s program has a planted bug. Write a kind bug ticket, then fix it.',
    'Messages hop from device to device. That hop is a network.',
    'Spring 2 check: stories, pairs, testing and networks.',
    'Make a mission poster AND a sprite that matches it. Two parts, one goal.',
    'If the path is red, turn. If not, go. That is a decision.',
    'Keyboard, mouse, sensor in — sound, move, light out. Inputs and outputs.',
    'Share a file without sharing a password. Collaborate with class rules.',
    'Drive a robot in the simulator to a star. Plan, then run.',
    'Pretend the class is a factory. Each person is a step in the system.',
    'Summer 1 retrieval: decisions, robots and systems.',
    'Capstone plan: one interactive scene. Must-haves only on the plan sheet.',
    'Build the scene. Change one thing when it breaks.',
    'Show your scene. One kind comment in, one kind comment out.',
    'Showcase day: celebrate, stay kind online, thank your helper.',
  ],
  4: [
    'Year 4 reboot: files have names, apps have jobs, your login is only yours.',
    'Write the football algorithm in plain words first. That is pseudocode.',
    'Longer traces: more lines, more chances to predict the finish square.',
    'Repeat can draw a square — and a hexagon if you change the number.',
    'A debug toolbox: predict, run, compare, change one thing, write it down.',
    'Autumn 1 review: files, pseudocode, shapes and debug tools.',
    'Adventure game part 1: rooms on paper, then one room in studio.',
    'A loop inside a loop draws wallpaper. Nested means pattern-in-a-pattern.',
    'Click, key, bump — events make the game listen to you.',
    'Collect the gems, stay inside the walls. Collector logic.',
    'Lives, score, timer: variables that actually change the game.',
    'Chop the game into world, player, collectibles. Design in pieces.',
    'Autumn 2 review: nested loops, events, collectors, variables.',
    'Adventure game part 2: join the rooms and test the path.',
    'Yes/no questions make a branching database. Like a guessing animal.',
    'Ask the class, tally, chart. A survey is data with a purpose.',
    'A list is many values in one named place. Like a backpack of items.',
    'Search results can be ads. Spot the clue before you click.',
    'Your digital footprint is the trail you leave. Make it a trail you are proud of.',
    'Spring 1 review: databases, surveys, lists, search, footprint.',
    'Data quest: a mystery number in a table. Prove your answer with the chart.',
    'A photo or sound can start when the sprite is clicked. Media plus code.',
    'Sprites bounce at the edge. Bounds keep them on the stage.',
    'Pair protocol: driver, navigator, no grabbing the mouse.',
    'A test plan is a list of “try this”. Tick it. Log the bug.',
    'The internet is networks of networks. Packets are little message parcels.',
    'Spring 2 review: media, sprites, pairs, tests, internet model.',
    'Invent a web page on paper: title, picture, two buttons, one kind rule.',
    'If coin then score else miss. Choices in games.',
    'Press A to jump. The keyboard is an input that needs a response.',
    'Shared docs: edit with names, never with someone else’s login.',
    'A robot with two sensors: “If wall AND dark, turn.” Two clues at once.',
    'Fewer blocks, same result. That is an efficient algorithm.',
    'Summer 1 review: if/else, input, collaboration, sensors, efficiency.',
    'Capstone: quiz game or maze. Pick one and write must-haves.',
    'Build it. Test with a partner who did not write it.',
    'Present: show the must-haves, then one extra if you have time.',
    'Year 4 showcase — play each other’s games, kind feedback only.',
  ],
  5: [
    'Accounts are keys. Strong passwords, log out, never share the key.',
    'A design document is a map before you build. Screens, sprites, success ticks.',
    'Play a tiny game, then explain WHY the winner’s algorithm worked.',
    'If/else inside a real studio project — not a toy example.',
    'Systematic debug: one hypothesis, one change, one retest. Log it.',
    'Autumn 1 review: security, design docs, reasoning, selection, debug.',
    'Storyboard a physical-computing idea: button, light, motor — on paper first.',
    'Repeat until the score is 10. Game loops that know when to stop.',
    'AND needs both. OR needs one. Boolean is a fancy yes/no.',
    'Mechanics: jump, cooldown, spawn. Name one mechanic in a game you like.',
    'Game state is “what is true right now”: paused, lives=3, level=2.',
    'A chunk of code with a name is easier to reuse. Modular means Lego bricks.',
    'Autumn 2 review: loops, Boolean, mechanics, state, modules.',
    'Storyboard part 2: build one brick of the physical idea in the simulator.',
    'A flat-file database is a table: rows are records, columns are fields.',
    'Sort the table, then say what you notice. Interpreting is the skill.',
    'Lists and records inside a program — a high-score table.',
    'A reliable source shows who wrote it and when. Unreliable shouts at you.',
    'Cyber-smart: phishing is a pretend adult. Stop, think, tell.',
    'Spring 1 review: databases, sort, structures, sources, cyber.',
    'Detective case: three tables, one missing clue. Write the evidence sentence.',
    'Vector art stays sharp. Video plus a start event. Media with control.',
    'Playtest, change one mechanic, playtest again. That is iteration.',
    'Roles: producer, coder, tester, presenter. Rotate so everyone codes.',
    'User testing: watch a classmate in silence, then ask “what confused you?”',
    'Search systems and networks: keywords travel; results come back.',
    'Spring 2 review: media, iteration, teams, testing, networks.',
    'Campaign micro-site: one message, one image, two facts, a call to action.',
    'A quiz that branches: wrong answer → hint, right answer → next question.',
    'Simulated sensors: light, distance, button. Pick the right one for the job.',
    'Python line: read it, predict the output, change one number, predict again.',
    'A tiny Python script: a variable and a print. Text that the computer reads.',
    'Code a mini system: input → process → output. Like a ticket machine.',
    'Summer 1 review: quizzes, sensors, Python, systems.',
    'Capstone product: game or quiz. Plan screens and success criteria.',
    'Build the product. Keep a change log.',
    'Launch: demo, feedback, one improvement you would make in Y6.',
    'Year 5 showcase — invite a younger class to play, stay kind.',
  ],
  6: [
    'Leavers use real tools: shared folders, kind comments, no pile-ons.',
    'Apps hide algorithms. A playlist shuffle is still a set of steps.',
    'Can you justify a line of code so a Year 4 child understands why it is there?',
    'Variables that steer the whole game: health, inventory, quest flag.',
    'Debug at scale: three bugs, a log, fix the highest-impact one first.',
    'Autumn 1 review: citizenship, patterns, justify, deep variables, debug.',
    'Web creation part 1: structure on paper — header, nav, main, footer.',
    'Sense and move: when the sensor fires, the sprite responds at once.',
    'Events PLUS variables: click adds one to score, score unlocks the door.',
    'A spreadsheet is a model of the real world. Change a cell, watch the total.',
    'Use the model to decide: which stall should the fair run? Data, not vibes.',
    'Capstone ideas chopped: research, build, test, present. Pick your slice.',
    'Autumn 2 review: web, sensing, events+vars, spreadsheets, decisions.',
    'Web part 2: build the page idea in the allowed tool. Alt text on images.',
    'Databases store structured data. Fields have types: word, number, yes/no.',
    'A real-ish data set: find the outlier and explain a possible reason.',
    'Lists and tables in code: loop through items, print or count them.',
    'AI text can sound sure and still be wrong. Check with a trusted source.',
    'Bias can hide in training data. Who is missing from the examples?',
    'Spring 1 review: structure, analyse, lists, AI, ethics.',
    'Spreadsheet challenge: a budget or a sports table. One chart, one insight.',
    'A 3D or media artefact that a key-press starts. Make it mean something.',
    'UX: big buttons, plain words, no trap clicks. Design for a Year 3 user.',
    'Save version 2, do not overwrite version 1. That is version habit.',
    'Peer review with a rubric: clear, works, kind, accessible. Evidence, not “nice”.',
    'Networks project: explain packets to a younger class with string or paper.',
    'Spring 2 review: media, UX, versions, rubrics, networks.',
    'App prototype: five screens on paper, arrows for taps, one user goal.',
    'Complex conditionals: if score>10 AND timeLeft else hint.',
    'Movement challenge: smooth, bounded, with one sensor or key combo.',
    'A Python function with one parameter: give it a name, give it a value.',
    'Capstone snippet in Python: one function you can explain line by line.',
    'Autonomous mission: the robot decides using sensors, not a human joystick.',
    'Summer 1 review: conditionals, movement, functions, autonomy.',
    'Complete system plan: users, data, algorithm, test, risk (including kindness).',
    'Build and test the system. Someone else tries it first.',
    'Present + portfolio: screenshot, what you learned, what secondary might ask.',
    'Leavers’ showcase and bridge: you are ready for KS3 — stay curious, stay kind.',
  ],
};

function shortName(title) {
  return String(title)
    .replace(/^Mini-project:\s*/i, '')
    .replace(/^Capstone:\s*/i, '')
    .replace(/\s*[—–-]\s*/g, ' ')
    .trim();
}

function stepsFor(title, kind, primary) {
  const name = shortName(title);
  if (kind === 'review') {
    return [`Skim your book for ${name}`, 'Tell a partner one example', 'Fix one planted mistake', 'Set one goal for next week'];
  }
  if (kind === 'showcase') {
    return ['Set up your demo kindly', 'Explain one choice you made', 'Give one specific compliment', 'Thank a helper'];
  }
  if (kind === 'mini' || kind === 'capstone') {
    return [`List must-haves for ${name}`, 'Build only the first slice', 'Test with a partner', 'Save with a clear name'];
  }
  const by = {
    'DL-1': [`Pause — is ${name} kind and safe?`, 'Keep personal details private', 'Tell a trusted adult if worried', 'Carry on respectfully'],
    'CS-1': [`Name the goal of ${name}`, 'Chop it into small steps', 'Order the steps', 'Check the last step still makes sense'],
    'CS-2': ['Start with the green flag or first line', `Run the ${name} blocks in order`, 'Use a loop or if if it fits', 'Reset and try again if needed'],
    'CS-3': [`Predict what ${name} will do`, 'Run or trace it', 'Compare with your prediction', 'Change one thing and retest'],
    'IT-1': ['A device makes a message', 'The message travels on a path', 'Another device receives it', 'Stay kind on the shared path'],
    'IT-2': [`Write a clear question about ${name}`, 'Open two sources', 'Compare who wrote them', 'Decide what you trust'],
    'IT-3': [`Choose a tool for ${name}`, 'Collect or make the content', 'Check it against success ticks', 'Save with a sensible filename'],
  };
  return by[primary] || by['CS-1'];
}

function pairsFor(title, primary, kind) {
  const name = shortName(title);
  if (kind === 'review') {
    return [
      { left: 'Retrieve', right: 'Remember on purpose' },
      { left: 'Teach-back', right: 'Explain to a partner' },
      { left: 'Evidence', right: 'Show how you know' },
      { left: name.slice(0, 28), right: 'This week’s review focus' },
    ];
  }
  const packs = {
    'DL-1': [
      { left: 'Password', right: 'Keep private — never share' },
      { left: 'Trusted adult', right: 'The person you tell if worried' },
      { left: 'Kind comment', right: 'Specific and respectful' },
      { left: 'Personal data', right: 'Address, full name, school pin' },
    ],
    'CS-1': [
      { left: 'Algorithm', right: `Ordered steps for ${name}` },
      { left: 'Decompose', right: 'Chop a big job into little jobs' },
      { left: 'Plan', right: 'Think before you tap' },
      { left: 'Goal', right: 'What “finished” looks like' },
    ],
    'CS-2': [
      { left: 'Sequence', right: 'Top to bottom, in order' },
      { left: 'Event', right: 'The thing that starts the code' },
      { left: 'Loop', right: 'Repeat a pattern' },
      { left: 'Variable', right: 'A labelled box that can change' },
    ],
    'CS-3': [
      { left: 'Predict', right: 'Guess the result before you run' },
      { left: 'Trace', right: 'Follow each line with a finger' },
      { left: 'Bug', right: 'When it does the wrong thing' },
      { left: 'Retest', right: 'Run again after one change' },
    ],
    'IT-1': [
      { left: 'Network', right: 'Devices sharing messages' },
      { left: 'Packet', right: 'A little piece of a message' },
      { left: 'Collaborate', right: 'Work together with rules' },
      { left: 'Server', right: 'A computer that shares files' },
    ],
    'IT-2': [
      { left: 'Source', right: 'Where the information came from' },
      { left: 'Bias', right: 'A slant that can mislead' },
      { left: 'Compare', right: 'Check two pages, not one' },
      { left: 'Evidence', right: 'A fact you can point to' },
    ],
    'IT-3': [
      { left: 'Data', right: 'Facts collected on purpose' },
      { left: 'Chart', right: 'A picture of the numbers' },
      { left: 'Software', right: 'The tool you choose for the job' },
      { left: 'Filename', right: 'A name that helps you find it' },
    ],
  };
  return packs[primary] || packs['CS-1'];
}

function thirdPuzzle(id, title, primary, kind, year, weekIndex) {
  const name = shortName(title);
  const s = seed(id);
  const size = 5 + (s % 2);
  const start = { x: s % 2, y: Math.floor(size / 2) };
  const goal = { x: size - 1, y: (start.y + 1 + (s % 2)) % size };
  const lane = (weekIndex + year) % 5;
  const t = title.toLowerCase();

  if (primary === 'DL-1' || /kind|safe|citizen|cyber|ethic|footprint/.test(t)) {
    return {
      type: 'sorting',
      title: `${name}: always or never?`,
      description: 'Sort the choices — this week’s safety mission.',
      xp: 20, duration: '4 min',
      config: {
        categories: [
          { id: 'ok', label: 'Do this ✅' },
          { id: 'no', label: 'Never 🚫' },
        ],
        items: [
          { id: 'a', label: 'Tell a trusted adult if you worry', category: 'ok' },
          { id: 'b', label: 'Share a password to be helpful', category: 'no' },
          { id: 'c', label: 'Keep home address private', category: 'ok' },
          { id: 'd', label: 'Pile on in a group chat', category: 'no' },
          { id: 'e', label: 'Use your own login', category: 'ok' },
        ],
      },
    };
  }
  if (lane === 0) {
    return {
      type: 'prediction', title: `Where does it finish? (${name})`,
      description: 'Trace before you tap.', xp: 20, duration: '4 min',
      sequence: ['R', 'R', 'D', s % 2 ? 'L' : 'D'], start: { x: 0, y: 0 }, size: 5,
      options: ['(2, 2)', '(2, 1)', '(1, 2)', '(0, 0)'], answer: s % 2 ? 1 : 0,
      instructions: `Predict the path for ${name}.`,
    };
  }
  if (lane === 1) {
    return {
      type: 'debug', title: `One-change fix: ${name}`,
      description: 'Change only the buggy line.', xp: 22, duration: '4 min',
      blocks: ['FORWARD 2', 'TURN_RIGHT', 'FORWARD 2', 'TURN_LEFT'],
      bugIdx: 3, fixOptions: ['TURN_RIGHT', 'TURN_LEFT', 'STOP'], correctFix: 0,
      instructions: `The last turn is wrong for ${name}.`,
    };
  }
  if (lane === 2) {
    return {
      type: 'grid', title: `Guide the mission: ${name}`,
      description: `Year ${year} grid — not the same path as last week.`,
      xp: 22, duration: '5 min',
      config: { size, startPos: start, goalPos: goal, instructions: `Plan a route that fits ${name}.` },
    };
  }
  if (lane === 3) {
    return {
      type: 'quiz', title: `Hinge questions: ${name}`,
      description: 'Two quick checks for this week only.', xp: 16, duration: '3 min',
      config: {
        questions: [
          { question: `What is ${name} mainly about?`, options: ['A brand-new unrelated topic', 'This week’s computing idea in action', 'Skipping computing'], correct: 1 },
          { question: 'If you are stuck, what first?', options: ['Delete everything', 'Predict, then try one change', 'Give up'], correct: 1 },
        ],
      },
    };
  }
  return {
    type: 'trace', title: `Trace ${name}`, description: 'Find the line that would go wrong.',
    xp: 20, duration: '4 min',
    config: {
      lines: ['FORWARD 2', 'TURN_RIGHT', 'FORWARD 1', 'TURN_LEFT'],
      bugIdx: (s + weekIndex) % 4,
      instructions: `Which line would spoil ${name}?`,
    },
  };
}

function quizFor(year, title, primary, kind) {
  const name = shortName(title);
  if (kind === 'review') {
    return [
      Q(`This ${name} week is for…`, ['Brand new topics only', 'Remembering and connecting earlier weeks', 'Skipping computing', 'Replacing the year test'], 1, 'Retrieval, not new content.'),
      Q('Best proof you understand is…', ['Copying silently', 'Explaining so someone else can follow', 'Hiding your book', 'The longest program'], 1, 'Explainability.'),
      Q('If you are stuck, try first…', ['Delete the file', 'Read in order and predict', 'Change ten things at once', 'Guess with eyes closed'], 1, 'Predict then test.'),
      Q(`Year ${year} computing is for…`, ['Only some children', 'Everyone to create and understand technology', 'Adults only', 'Break time only'], 1, 'Inclusion.'),
    ];
  }
  if (kind === 'mini' || kind === 'capstone' || kind === 'showcase') {
    return [
      Q(`For ${name}, success criteria help because…`, ['They confuse you', 'They show what finished looks like', 'They ban fun', 'They replace teachers'], 1, 'Assessment for learning.'),
      Q('A good first version should…', ['Do the whole year at once', 'Meet the must-haves only', 'Never be tested', 'Stay secret from your partner'], 1, 'Scope.'),
      Q('Kind feedback is…', ['Only mean', 'Specific and helpful', 'A secret grade', 'Copying their work'], 1, 'Peer review.'),
      Q('If the kit fails you should…', ['Do nothing', 'Switch to the paper/unplugged plan', 'Share a password', 'Delete the class files'], 1, 'Resilience.'),
    ];
  }
  const bank = {
    'DL-1': [
      Q(`In ${name}, which should stay private?`, ['Favourite colour', 'Home address', 'A hobby', 'Favourite subject'], 1, 'Personal data.'),
      Q('If something online worries you…', ['Keep it secret', 'Tell a trusted adult', 'Reply angrily', 'Share it widely'], 1, 'Safeguarding.'),
      Q('A strong password is usually…', ['Your name', '1234', 'Long, unique, hard to guess', 'Shared with friends'], 2, 'Password hygiene.'),
      Q('Using school devices well means…', ['Games only', 'Following class rules and respecting work', 'Lending your login', 'Ignoring the teacher'], 1, 'Charter.'),
    ],
    'CS-1': [
      Q(`An algorithm for ${name} must have…`, ['Steps in a sensible order', 'No steps', 'Only pictures', 'Random order'], 0, 'Order matters.'),
      Q('Decomposition means…', ['Doing everything at once', 'Breaking a big job into smaller jobs', 'Deleting the plan', 'Only drawing'], 1, 'CS-1.'),
      Q('If step 3 happens before step 1…', ['Nothing changes', 'The outcome can be wrong', 'The computer guesses', 'Algorithms vanish'], 1, 'Order.'),
      Q('A plan helps because…', ['It wastes time', 'You notice missing steps early', 'It bans coding', 'Only adults plan'], 1, 'Planning.'),
    ],
    'CS-2': [
      Q(`In ${name}, a sequence is…`, ['Instructions in order', 'Random taps', 'Only one block ever', 'The Wi-Fi'], 0, 'CS-2.'),
      Q('A loop is for…', ['Doing a step once', 'Repeating a pattern efficiently', 'Deleting sprites', 'Passwords'], 1, 'Repetition.'),
      Q('A variable is…', ['A labelled value that can change', 'A type of mouse', 'Always a picture', 'The internet'], 0, 'State.'),
      Q('An event (like green flag)…', ['Starts or triggers code', 'Deletes the project', 'Turns sound off forever', 'Saves passwords'], 0, 'Events.'),
    ],
    'CS-3': [
      Q(`Predicting in ${name} helps because…`, ['You catch thinking errors early', 'It slows you forever', 'It replaces testing', 'Computers dislike it'], 0, 'Reasoning.'),
      Q('If prediction and result differ…', ['Ignore it', 'Compare line by line', 'Delete all work', 'Change computers'], 1, 'Debug habit.'),
      Q('Debugging means…', ['Deleting the program', 'Finding and fixing errors', 'Adding random blocks', 'Turning off'], 1, 'Definition.'),
      Q('Change how many things at once?', ['As many as possible', 'One, then retest', 'None, ever', 'Only colours'], 1, 'Control.'),
    ],
    'IT-1': [
      Q(`In ${name}, a network is…`, ['Devices sharing information', 'A single pencil', 'Only phones', 'A password'], 0, 'IT-1.'),
      Q('A packet is…', ['A little piece of a message', 'A lunchbox only', 'A bug', 'A sprite costume'], 0, 'Model.'),
      Q('Safe collaboration means…', ['Share logins', 'Use class rules and your own account', 'Hide the work', 'Post home addresses'], 1, 'Citizenship.'),
      Q('If a link feels wrong…', ['Tell a trusted adult', 'Click faster', 'Share it to the class chat', 'Type your password in'], 0, 'Safety.'),
    ],
    'IT-2': [
      Q(`For ${name}, a good next step is…`, ['Believe the first hit', 'Compare two sources', 'Ignore dates', 'Only use shouty pages'], 1, 'Evaluation.'),
      Q('An advert in results is often trying to…', ['Sell something', 'Be your teacher', 'Mark your book', 'Fix bugs'], 0, 'Media literacy.'),
      Q('Bias means…', ['A slant that can mislead', 'A type of loop', 'A green flag', 'A robot sensor'], 0, 'Critical.'),
      Q('If two pages disagree you should…', ['Pick the prettier one', 'Investigate why and check a trusted source', 'Give up', 'Copy both'], 1, 'Scepticism.'),
    ],
    'IT-3': [
      Q(`Data for ${name} should be…`, ['Collected on purpose and safe', 'Everyone’s home address', 'Random secrets', 'Passwords'], 0, 'IT-3.'),
      Q('A chart helps because…', ['It hides the numbers', 'It makes a pattern easier to see', 'It replaces thinking', 'It is only for adults'], 1, 'Presentation.'),
      Q('Choose software based on…', ['The goal of the task', 'Whatever is loudest', 'Your favourite colour only', 'Random'], 0, 'Tools.'),
      Q('A good filename…', ['asdf.jpg', 'Helps you find the work later', 'Is your password', 'Is blank'], 1, 'Organisation.'),
    ],
  };
  return bank[primary] || bank['CS-1'];
}

export const YEAR_WORLDS = {
  y3: {
    world: 'Dot’s Garden',
    tag: 'Ages 7–8 · first sequences',
    blurb: 'Meet Dot. Learn rules, recipes, flags, loops and kindness — one garden path a week.',
  },
  y4: {
    world: 'Robot City',
    tag: 'Ages 8–9 · games and data',
    blurb: 'Pseudocode, nested loops, collectors, the internet model, and your own adventure game.',
  },
  y5: {
    world: 'Storm Lab',
    tag: 'Ages 9–10 · systems and Python',
    blurb: 'Design docs, Boolean, databases, cyber-smart, then your first Python lines.',
  },
  y6: {
    world: 'Leavers’ HQ',
    tag: 'Ages 10–11 · systems for real',
    blurb: 'AI sense-checks, spreadsheets, UX, functions, and a complete system to present.',
  },
};

export function getPupilMission(year, weekIndex, title, kind, primary) {
  const id = `y${year}-w${String(weekIndex + 1).padStart(2, '0')}`;
  const hook = HOOKS[year]?.[weekIndex] || `This week is ${title}. Play, then quiz.`;
  const name = shortName(title);
  return {
    id,
    hook,
    puzzles: [
      {
        type: 'codeRacerSeq',
        title: `${name} — order the mission`,
        description: 'Put this week’s steps in a working order.',
        xp: 16, duration: '3 min',
        steps: stepsFor(title, kind, primary),
        instructions: `🏁 Year ${year} Week ${weekIndex + 1}: ${name}`,
      },
      {
        type: 'matching',
        title: `${name} words`,
        description: 'Match this week’s ideas — not last week’s.',
        xp: 16, duration: '3 min',
        config: { pairs: pairsFor(title, primary, kind) },
      },
      thirdPuzzle(id, title, primary, kind, year, weekIndex),
    ],
    quiz: quizFor(year, title, primary, kind),
  };
}

export function weekEmoji(title, kind, coding) {
  const t = String(title).toLowerCase();
  if (kind === 'review') return '🧠';
  if (kind === 'showcase') return '🎉';
  if (kind === 'capstone') return '🏆';
  if (kind === 'mini') return '🛠️';
  if (/python/.test(t)) return '🐍';
  if (/loop|repeat/.test(t)) return '🔁';
  if (/debug/.test(t)) return '🐛';
  if (/safe|privacy|kind|citizen|cyber|ethic|password|account/.test(t)) return '🛡️';
  if (/search|website|source|ai-generated|sceptical/.test(t)) return '🔍';
  if (/data|survey|chart|spreadsheet|database|list|table/.test(t)) return '📊';
  if (/network|internet|connect|packet|collaborat/.test(t)) return '📡';
  if (/variable|score|counter|state/.test(t)) return '🔢';
  if (/event|green flag|keyboard|input/.test(t)) return '🚩';
  if (/if|select|boolean|condition|decision/.test(t)) return '🔀';
  if (/robot|sensor|simulate|autonomous/.test(t)) return '🤖';
  if (/art|pen|pattern|photo|media|3d|animate|vector|video/.test(t)) return '🎨';
  if (/pair|team|buddy/.test(t)) return '🤝';
  if (/algorithm|pseudo|decomp|plan|efficiency/.test(t)) return '🧩';
  if (/web|page|app|ux/.test(t)) return '🖥️';
  if (coding) return '💻';
  return '⭐';
}
