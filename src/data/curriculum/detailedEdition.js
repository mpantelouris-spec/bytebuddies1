/**
 * ByteBuddies Global Primary Computing Curriculum — Detailed Edition
 * 152 lessons: teach, vocab, 3 activities (6 steps + check/support/stretch),
 * coding/debug, 4 quizzes with rationales, reflection, extension.
 */
import { getPupilMission } from '../pupilMissions.js';
import { kidObjectives, plainAbout } from './plainTeach.js';

const T = (title, purpose, type, mins, steps, check, support, stretch) => ({
  label: type === 'unplugged' ? 'Unplugged' : type === 'pair' ? 'Pair' : type === 'digital' ? 'Digital' : 'Paper',
  type,
  title,
  purpose,
  mins,
  steps,
  check,
  support,
  stretch,
});

const Q = (q, options, answer, rationale) => ({ q, options, answer, rationale });

function fill(s, title, year) {
  return String(s).replaceAll('{title}', title).replaceAll('{year}', String(year));
}

const VOCAB = {
  safety: ['device', 'password', 'private', 'trusted adult', 'respect', 'responsibility'],
  algorithm: ['algorithm', 'sequence', 'order', 'step', 'goal'],
  predict: ['predict', 'trace', 'output', 'reasoning', 'check'],
  sequence: ['sequence', 'block', 'sprite', 'run', 'reset', 'event'],
  debug: ['debug', 'bug', 'error', 'fix', 'test', 'predict'],
  review: ['review', 'retrieve', 'explain', 'apply', 'evidence'],
  project: ['criteria', 'audience', 'prototype', 'feedback', 'iterate'],
  loop: ['loop', 'repeat', 'efficient', 'pattern', 'iteration', 'forever'],
  events: ['event', 'start', 'click', 'trigger', 'response', 'interactive'],
  variables: ['variable', 'store', 'score', 'change', 'value', 'counter'],
  decomp: ['decompose', 'sub-task', 'plan', 'phase', 'goal'],
  data: ['data', 'collect', 'record', 'chart', 'question', 'evidence'],
  search: ['search', 'source', 'trust', 'bias', 'compare', 'evidence'],
  kindness: ['kindness', 'respect', 'privacy', 'report', 'bullying', 'consent'],
  network: ['network', 'internet', 'device', 'packet', 'server', 'Wi-Fi'],
  selection: ['if', 'else', 'condition', 'choice', 'true', 'false'],
  python: ['Python', 'line', 'print', 'variable', 'predict', 'output'],
  generic: ['program', 'computer', 'solve', 'create', 'test'],
  pseudo: ['pseudocode', 'plan', 'step', 'detail', 'order'],
};

const NOTES = {
  DL: "Maps to UNESCO digital literacy 'Safety' and CSTA citizenship; UK DL-1. Adapt 'trusted adult' to local safeguarding policy.",
  CS: 'Primary computing worldwide: CSTA K–5 algorithms/programming, ACARA Digital Technologies, IB PYP thinking skills. Adjust examples to local culture; keep safeguarding universal.',
  IT: 'Maps to CSTA data/networks, UNESCO communication and critical evaluation, ACARA digital systems. Use school-approved search tools.',
  review: 'Review weeks align with mastery-based progression (CSTA Concepts, UNESCO digital literacy competencies).',
  project: 'Project-based learning aligns with PBL schools globally and IB Approaches to Learning (collaboration, communication).',
};

function actsTopic(title, coding) {
  return [
    T(`Talk it out: ${title}`, `Understand ${title} without needing logins`, 'unplugged', 14, [
      `Write “${title}” in the middle of the board.`,
      'Ask: what do we already know? Collect four ideas as a class.',
      'Give pairs one real-life example (lining up, a game, a search, a message).',
      'Each pair writes four numbered steps that would actually work.',
      'One pair reads; the class says “stop” at the first missing step.',
      'Add the missing step. Photograph or copy into books.',
    ], `Can you explain “${title}” to a Year 2 child?`, 'Give a worked example on the board.', 'Write a 6-step version for a harder example.'),
    T('Partner check', `Apply “${title}” with a partner`, 'pair', 14, [
      `Give each pair a short problem about “${title}”.`,
      'One minute silent think: sketch or list steps.',
      'Partner A explains. Partner B may only ask “why?” once.',
      'Swap. Agree the version that would actually work.',
      'Join another pair and hear one idea you missed.',
      'Teacher asks two pairs to share in full sentences.',
    ], 'What did your partner notice that you missed?', 'Sentence starters on the board.', 'Write a harder problem for another pair.'),
    T(coding ? 'Try it on screen' : 'Try it on paper', coding ? 'Build a small version in ByteBuddies' : 'A paper version of the same idea', coding ? 'digital' : 'paper', 14, [
      coding
        ? 'Log in to ByteBuddies. Open this week’s coding lab or puzzle.'
        : `On paper, draw or write a working version of “${title}”.`,
      'Read the three success criteria twice.',
      'Do part 1. Teacher checks two tables before anyone goes on.',
      'Do part 2. If it fails, change one thing only.',
      'Tick the criteria. If one is missing, fix that one.',
      'Save the file or glue the paper into computing books.',
    ], 'Which success criterion was hardest?', 'Show a finished example on the visualiser.', 'Add one extra feature if they finish.'),
  ];
}

function actsReview() {
  return [
    T('Vocabulary relay', 'Fast recall of unit words in teams', 'unplugged', 14, [
      'Teams line up; teacher shows a definition card.',
      'First pupil runs and tags the matching word card on the wall.',
      'If wrong, next teammate tries; if right, team earns a point.',
      'Rotate through eight cards from the unit.',
      'Winning team explains one word they found hardest.',
      'Class agrees a shared definition for any disputed word.',
    ], 'Can you define one word without using the computer?', 'Picture cards for EAL learners.', 'Pupils write their own definition cards for homework.'),
    T('Teach-back', 'Partners explain a lesson topic to each other', 'pair', 15, [
      'Each pair receives a secret topic slip from the unit.',
      'Partner A has two minutes to teach the topic with an example.',
      'Partner B asks one clarifying question.',
      'Swap roles with a second slip.',
      "Pairs write one sentence: 'The most important skill this unit was …'",
      'Share three sentences with the class.',
    ], 'What question helped your partner understand better?', 'Topic slips with sentence starters.', 'Record a 30-second audio teach-back if devices allow.'),
    T('Mixed challenge checkpoint', 'Short studio or paper task combining two unit skills', 'digital', 14, [
      'Open the unit review project template (or use paper pseudo-code).',
      'Complete two tasks labelled A and B from the unit checklist.',
      'Self-mark using success criteria on screen.',
      'If stuck, use the class debugging poster before asking the teacher.',
      'Screenshot or submit one piece of evidence.',
      'Write one star and one wish for next unit.',
    ], 'Which success criterion was hardest?', 'Checklist with tick boxes and icons.', 'Create a third mini-task for a friend.'),
  ];
}

function actsProject() {
  return [
    T('Rubric gallery walk', "Understand what 'great' looks like", 'unplugged', 12, [
      'Display exemplar projects (anonymous or teacher-made).',
      'Pupils stick dots on criteria chart: clear, fun, works, accessible.',
      'Discuss one exemplar strength.',
      'Write personal target from rubric.',
      'Share target with partner.',
      'Teacher clarifies deadlines and teams.',
    ], 'Which criterion will you prioritise?', 'Simplified rubric with icons.', 'Pupils co-write one criterion.'),
    T('Plan and assign roles', 'Project management for children', 'pair', 15, [
      'Brainstorm features; circle three must-haves.',
      'Assign roles: builder, tester, presenter (rotate later).',
      'Sketch screen or robot path on paper.',
      'List materials and steps in order.',
      'Agree how to save and name files.',
      'Teacher approves plan with initials.',
    ], 'What is step one tomorrow?', 'Teacher template plan sheet.', 'Add timeline with three dates.'),
    T('Build or rehearse', 'Studio/Python/media work session', 'digital', 18, [
      'Open project file; follow plan for this week.',
      'Build first milestone only — no scope creep.',
      'Tester runs checklist every ten minutes.',
      'Log one bug and fix in bug book.',
      'Save version with date in filename.',
      'Prepare one sentence for showcase.',
    ], 'Does the project meet must-have 1?', 'Milestone checklist.', "Polish one 'nice to have' if time."),
  ];
}

function quizReview(year) {
  return [
    Q(`Year ${year} review: what is the main purpose of a review lesson?`, [
      'To learn brand-new topics',
      'To strengthen memory and connect ideas from the unit',
      'To skip computing for a week',
      'To replace the end-of-year test',
    ], 1, 'Review strengthens retrieval and metacognition.'),
    Q('Which is the best way to prove you understand an algorithm?', [
      "Memorise the teacher's words only",
      'Explain steps so someone else can follow them',
      'Hide your work from others',
      'Use the longest possible program',
    ], 1, 'Explainability is core to CS-3 worldwide.'),
    Q('If you are stuck debugging, what should you try first?', [
      'Delete the whole program',
      'Change random blocks until it works',
      'Read the program in order and predict each step',
      'Ask someone to fix it without looking',
    ], 2, 'Prediction before running is a universal debug strategy.'),
    Q('Why do schools teach online safety in computing lessons?', [
      'Only to scare pupils',
      'So pupils can use technology confidently and responsibly worldwide',
      'Because games are dangerous',
      'Safety is not part of computing',
    ], 1, 'Digital literacy is in UNESCO and many national curricula.'),
  ];
}

function quizProject() {
  return [
    Q('Success criteria help because…', ['They confuse pupils', 'They clarify what finished looks like', 'They replace teachers', 'They ban creativity'], 1, 'Assessment for learning.'),
    Q('Good feedback is…', ['Only mean', 'Specific and kind', 'Secret', 'Always grades'], 1, 'Peer review.'),
    Q('When collaborating, you should…', ['Let one person do everything', 'Share tasks and communicate', 'Hide your plan', "Delete partner's work"], 1, 'Collaboration IT-1.'),
    Q('At showcase, the audience learns best when you…', ['Mumble', 'Explain what you built and why', 'Never demo', 'Share passwords'], 1, 'Communication.'),
  ];
}

function quizTopic(title) {
  return [
    Q(`This week's topic '${title}' mainly helps us…`, ['Ignore computers', 'Solve problems with technology', 'Avoid all screens', 'Skip school'], 1, 'Purpose of this week’s lesson.'),
    Q('Computational thinking includes…', ['Only typing fast', 'Breaking problems into steps', 'Breaking devices', 'Guessing only'], 1, 'Global CT framing.'),
    Q('When stuck, a good learner…', ['Gives up', 'Tries a strategy and asks for help', 'Deletes work', 'Copies without understanding'], 1, 'Growth mindset.'),
    Q('Computing is for…', ['Some pupils only', 'Everyone to create and understand technology', 'Adults only', 'Nobody in primary'], 1, 'Inclusion.'),
  ];
}

function quizDebug() {
  return [
    Q('Debugging means…', ['Deleting the program', 'Finding and fixing errors', 'Adding random blocks', 'Turning off the computer'], 1, 'Definition.'),
    Q('A good first debug step is…', ['Guess', 'Predict what each line should do', 'Ignore errors', "Copy a friend's file"], 1, 'CS-3 strategy.'),
    Q('Which is a bug?', ['Program does what you planned', 'Sprite moves opposite to the key pressed', 'Saving your work', 'Writing a comment'], 1, 'Application.'),
    Q('Why keep a bug log?', ['To punish mistakes', 'To remember what you tried and learn', 'It is not useful', 'Only teachers need it'], 1, 'Metacognition.'),
  ];
}

function quizLoop() {
  return [
    Q('Why use a loop?', ['To avoid repeating the same instructions many times', 'To slow the program', 'To delete code', 'To hide bugs'], 0, 'Efficiency and clarity.'),
    Q('A repeat 4 loop runs its body how many times?', ['1', '4', '40', 'Forever'], 1, 'Count iterations.'),
    Q('Which is a loop in real life?', ['One clap', 'A chorus sung again and again', 'Opening a door once', 'Sitting down'], 1, 'Real-world repetition.'),
    Q('If a loop never stops, it may be…', ['Perfect', 'An infinite loop bug', 'Always correct', 'A variable'], 1, 'Stop conditions matter.'),
  ];
}

function quizEvents() {
  return [
    Q('An event in programming is…', ['A mistake', 'Something that triggers code to run', 'A variable', 'A loop'], 1, 'Events lesson core.'),
    Q('In ByteBuddies studio, many programs start when…', ['The computer is off', 'The green flag is clicked', 'You delete blocks', 'You print'], 1, 'Platform convention.'),
    Q('Which is an event-response pair?', ['Sleep — dream', 'Key pressed — sprite moves', 'Eat — grow taller instantly', 'Walk — become invisible'], 1, 'I/O concept.'),
    Q('Events help programs feel…', ['Boring', 'Interactive', 'Broken', 'Private'], 1, 'UX for children.'),
  ];
}

function quizVariables() {
  return [
    Q('A variable is used to…', ['Paint the screen one colour forever', 'Store a value that can change', 'Delete loops', 'Stop the internet'], 1, 'Variables definition.'),
    Q('If score starts at 0 and changes by 1 three times, score is…', ['0', '3', '30', '1'], 1, 'Arithmetic in context.'),
    Q('Which name is a clear variable name?', ['x', 'thing', 'playerScore', 'asdf'], 2, 'Naming conventions.'),
    Q('Set score to 0 usually happens when…', ['The game ends or restarts', 'You win forever', 'The computer breaks', 'You delete sprites'], 0, 'Game design pattern.'),
  ];
}

function quizDecomp(title) {
  return [
    Q('Decomposition means…', ['Breaking a problem into smaller parts', 'Deleting code', 'Only drawing', 'Skipping plans'], 0, 'CS-1'),
    Q('Why decompose before coding?', ['Plans reduce confusion and bugs', 'It wastes time always', 'Computers forbid it', 'Only for adults'], 0, 'Planning'),
    Q('A sub-task should be…', ['Small enough to explain clearly', 'The entire project', 'Secret', 'Random'], 0, 'Clarity'),
    Q(`This lesson '${title}' helps you…`, ['Plan big work in steps', 'Avoid all teamwork', 'Skip testing', 'Ignore users'], 0, 'Title link'),
  ];
}

function quizData() {
  return [
    Q('Data is…', ['Only numbers on a calculator', 'Facts collected to answer a question', 'A type of game', 'Always secret'], 1, 'Data definition.'),
    Q('Why avoid full names in a class survey?', ['Names are boring', 'Privacy and safety', 'Charts cannot show names', 'Teachers forbid all words'], 1, 'DL + IT-3.'),
    Q('A bar chart helps you…', ['Hide results', 'See and compare amounts quickly', 'Delete data', 'Write algorithms'], 1, 'Representation.'),
    Q('Good survey questions are…', ['Confusing', 'Clear and answerable', 'Always yes/no only', 'About passwords'], 1, 'Survey design.'),
  ];
}

function quizSearch() {
  return [
    Q('Why check more than one website?', ['First is always wrong', 'To compare reliability', 'It is illegal to use one', 'Computers cannot search'], 1, 'IT-2.'),
    Q('A trustworthy source often shows…', ['No author ever', 'Who wrote it and when', 'Only pop-ups', 'Your password'], 1, 'Source evaluation.'),
    Q('If a result looks like an ad, you should…', ['Trust it most', 'Notice it may promote something to sell', 'Click fastest', 'Share personal data'], 1, 'Critical literacy.'),
    Q('Copying text without credit is…', ['Always fine', 'Problematic; cite your source', 'Required', 'A programming loop'], 1, 'Academic honesty.'),
  ];
}

function quizKindness() {
  return [
    Q('If you see online bullying, a good first step is…', ['Join in', 'Support the target and tell a trusted adult', 'Post it publicly', 'Share passwords'], 1, 'DL-1.'),
    Q('Your digital footprint is…', ['A shoe size', 'Traces you leave online over time', 'A computer virus', 'A loop'], 1, 'Footprint lessons.'),
    Q('Before posting a photo of others you should…', ['Never ask', 'Get permission', 'Post anyway', 'Add their address'], 1, 'Consent.'),
    Q('Cybersecurity at school means…', ['Sharing logins', 'Protecting accounts and devices', 'Clicking all links', 'Disabling filters'], 1, 'Y5+ security.'),
  ];
}

function quizNetwork() {
  return [
    Q('The internet is…', ['One computer', 'Many connected networks', 'Only social media', 'A single cable in your town'], 1, 'IT-1.'),
    Q('Messages online often travel as…', ['Pigeons', 'Packets', 'Magic', 'One giant file always'], 1, 'Simplified model.'),
    Q('Collaborating online safely includes…', ['Sharing passwords', 'Kind communication and privacy', 'Meeting strangers alone', 'Posting addresses'], 1, 'DL+IT.'),
    Q('School Wi-Fi filters help…', ['Spy on families', 'Block harmful content at school', 'Delete homework', 'Stop all learning'], 1, 'Local policy discussion.'),
  ];
}

function quizSelection() {
  return [
    Q('Selection lets a program…', ['Always do the same thing', 'Choose different actions when conditions change', 'Delete variables', 'Stop loops'], 1, 'CS-2 selection.'),
    Q('If score > 10 then cheer else boo means cheer when…', ['Score is 5', 'Score is 15', 'Never', 'Always boo'], 1, 'Apply condition.'),
    Q('AND means both parts must be…', ['False', 'True', 'Deleted', 'Loops'], 1, 'Boolean Y5.'),
    Q('Games use if/then to…', ['Crash', 'Respond to player choices', 'Avoid all input', 'Remove art'], 1, 'Motivation.'),
  ];
}

function quizPython() {
  return [
    Q('In Python, print(3 + 2) shows…', ['32', '5', 'print', 'Nothing'], 1, 'Expression evaluation.'),
    Q('Before running code, predicting helps…', ['Waste time', 'Catch thinking errors', 'Delete files', 'Skip debugging'], 1, 'CS-3.'),
    Q('A variable in Python can store…', ['Only pictures', 'A value like a number or word', 'The keyboard', 'Electricity'], 1, 'Variables Y5-6.'),
    Q('Text programming differs from blocks because…', ['It is not real code', 'You type instructions as text', 'It cannot make games', 'It has no order'], 1, 'Transition to secondary.'),
  ];
}

const UNIQUE = {
  'y3-w01': {
    pupilHook: 'Meet Dot the robot. Dot only works when people are kind and clear — today you learn the class computer rules.',
    about: 'Pupils learn what the computing course is for, how devices are used respectfully in school, and their rights and responsibilities online and offline. ByteBuddies introduces Dot, a robot who only works when people are kind and clear.',
    objectives: [
      'Describe how we use school devices safely',
      'Name two personal details that must stay private',
      'Explain what to do if something online worries you',
    ],
    vocabulary: VOCAB.safety,
    international: NOTES.DL,
    activities: [
      T('Device charter', 'Co-create classroom rules for technology', 'unplugged', 14, [
        'Brainstorm: what helps our class learn with computers?',
        'Brainstorm: what gets in the way or hurts others?',
        "Sort ideas into 'always', 'sometimes with permission', 'never'.",
        'Draft six charter statements in pupil-friendly language.',
        'Everyone signs or adds a fingerprint to the poster.',
        'Display charter next to the device trolley or lab.',
      ], "Why is 'never share passwords' an 'always' rule?", 'Icons beside each rule.', 'Translate charter for families on the class blog.'),
      T('Private or share?', 'Sort scenarios into safe to share vs keep private', 'pair', 15, [
        'Pairs receive twelve scenario cards (favourite colour, home address, etc.).',
        "Sort into 'OK to share in class' and 'keep private'.",
        'Compare with another pair; discuss disagreements.',
        'Classify three grey-area cards with teacher guidance.',
        'Record two rules in notebooks.',
        'Share one rule with the whole class.',
      ], 'Why is your full name plus school sometimes risky online?', 'Fewer cards with pictures.', 'Write one new scenario for next year.'),
      T('Meet Dot', 'Meet Dot the robot, then log in and explore Learn — no personal data entered', 'digital', 12, [
        'Meet Dot: Dot only works when people are kind and clear.',
        'Log in with class credentials; do not change passwords.',
        'Find the Learn section and your year group.',
        'Locate XP and the first module title only — do not rush ahead.',
        'Log out correctly.',
        'Tell a partner one kind, clear rule for Dot.',
      ], 'Where would you report a worrying message at school?', 'Teacher demo first; buddy pairs.', 'Help a new pupil find Learn next lesson.'),
    ],
    codeDebug: 'No coding today. Optional: label parts of a computer diagram.',
    quiz: [
      Q('Which detail should you keep private online?', ['Your favourite animal', 'Your full home address', 'Your favourite subject', 'A hobby you enjoy'], 1, 'Addresses identify where you live.'),
      Q('If something online makes you uncomfortable, you should…', ['Keep it secret forever', 'Tell a trusted adult and use school reporting tools', 'Reply angrily', 'Share it with strangers'], 1, 'Universal safeguarding response.'),
      Q('Using school devices responsibly means…', ['Using them only for games', "Following class rules and respecting others' work", 'Letting friends use your login', 'Ignoring teacher instructions'], 1, 'Links to class charter activity.'),
      Q('A strong password is usually…', ['Your name', '1234', 'Long, unique, and hard to guess', 'Shared with best friends'], 2, 'Password hygiene is taught globally in upper primary.'),
    ],
    reflection: 'One way I will be respectful with technology this month is…',
    extension: "Design a badge icon for 'Safety Champion'.",
  },
  'y3-w02': {
    pupilHook: 'A sandwich recipe is an algorithm. Mix up the steps and you get jam on the bread before you open the jar.',
    about: 'Algorithms are ordered steps in recipes, games, and programs. Pupils find algorithms at school and home and see that changing step order changes results.',
    objectives: [
      'Say what an algorithm is in your own words',
      'Put a mixed-up recipe back into a working order',
      'Give one example of an algorithm that is not cooking',
    ],
    vocabulary: VOCAB.algorithm,
    international: NOTES.CS,
    activities: [
      T('Recipe rescue', 'Fix a recipe with steps in the wrong order', 'unplugged', 15, [
        'Display six sandwich steps out of order (open bag, spread jam, eat…).',
        'Groups sort into an order that would actually work.',
        'One group reads aloud; class mimes the disaster order.',
        'Swap two steps; discuss what went wrong.',
        'Write: An algorithm is steps in a sensible order to reach a goal.',
        'Share one non-food algorithm (lining up, brushing teeth).',
      ], 'Why does order change the result?', 'Picture cards.', 'Write an algorithm for tidying a desk.'),
      T('Classroom algorithms hunt', 'Spot ordered steps around school', 'pair', 14, [
        'Pairs list three school routines (register, PE kit, logging in).',
        'Write 4–6 numbered steps for one routine.',
        'Swap lists; partner tries to follow without extra help.',
        'Mark any missing step that made them stuck.',
        'Add the missing step.',
        'Two pairs share the funniest missing step.',
      ], 'Which missing step caused the biggest problem?', 'Sentence starters on board.', 'Time the routine and trim one wasteful step.'),
      T('Order the block cards', 'Physical sequence before studio', 'unplugged', 12, [
        'Give six printed move / turn / start cards shuffled.',
        'Build a path for a toy robot across four desk tiles.',
        'Partner tests the path with the toy.',
        'If it fails, change only one card.',
        'Photograph the working stack.',
        'Name the stack: our algorithm.',
      ], 'Which card had to come first?', 'Fewer tiles.', 'Add a wait card.'),
    ],
    codeDebug: 'Paper: six shuffled sandwich cards — photograph the working order before next week’s studio.',
    quiz: [
      Q('An algorithm must have…', ['Steps in a sensible order', 'No steps', 'Only pictures', 'Random order always OK'], 0, 'Order is part of the meaning.'),
      Q('A morning routine is an algorithm because…', ['It is a series of steps to a goal', 'It uses Wi-Fi', 'It is only on phones', 'It cannot go wrong'], 0, 'Everyday algorithms.'),
      Q('If you butter bread after eating it…', ['Nothing changes', 'The outcome is probably wrong', 'Computers guess the rest', 'It is still the same algorithm'], 1, 'Wrong order, wrong result.'),
      Q('Programs use algorithms as…', ['Precise instructions for a device', 'Only videos', 'Magic', 'Decorations'], 0, 'Link to next week’s studio.'),
    ],
    reflection: 'One algorithm I use every day is…',
    extension: 'Write a 5-step algorithm for making a drink at home.',
  },
  'y3-w03': {
    pupilHook: 'Before Dot runs, you guess where Dot will stop. If you are wrong, you find the line that fooled you.',
    about: 'Before running code, pupils trace instructions line by line and predict sprites or robots. Prediction makes debugging faster and builds logical reasoning.',
    objectives: [
      'Trace a 5-step paper program with a finger',
      'Predict the end square before moving a counter',
      'Circle the line where a prediction went wrong',
    ],
    vocabulary: VOCAB.predict,
    international: NOTES.CS,
    activities: [
      T('Human program trace', 'Trace a paper program with a finger', 'unplugged', 14, [
        'Each pair gets a 5-line arrow program on a 4×4 grid.',
        'Trace with a finger; write the predicted end square.',
        'Move a counter; compare.',
        'Circle the line where the prediction broke.',
        'Fix that one line together.',
        'Share one surprise with the class.',
      ], 'Did you run it in your head first?', 'Larger grid dots.', 'Write a 6-line program for a friend.'),
      T('Prediction duel', 'A vs B: who predicted correctly?', 'pair', 12, [
        'Teacher shows a short move/turn list on the board.',
        'Each child writes end position in secret.',
        'Teacher runs with a floor robot or counter.',
        'Tick if you matched.',
        'If wrong, explain which line you skipped.',
        'Repeat with a second list that includes a left turn.',
      ], 'Which line did you skip?', 'Start with 3 lines.', 'Invent a trickier list.'),
      T('Bug spotlight', 'Find the line that sends Dot the wrong way', 'unplugged', 12, [
        'Show four lines: forward, turn right, forward, turn left (last is wrong for the goal).',
        'Children vote which line is the bug.',
        'Reveal: last turn should be right.',
        'Rewrite the last line.',
        'Re-predict the end square.',
        'Run and check.',
      ], 'Why not change every line at once?', 'Highlight turns in colour.', 'Add a fifth line.'),
    ],
    codeDebug: 'Paper trace: FORWARD 2, TURN RIGHT, FORWARD 2, TURN LEFT — last turn is the bug if the goal is a right-hand star.',
    quiz: [
      Q('Predicting before running helps because…', ['You notice thinking errors early', 'It slows learning forever', 'It replaces testing', 'Computers dislike it'], 0, 'CS-3 habit.'),
      Q('If prediction and result differ, you should…', ['Ignore it', 'Compare line by line to find why', 'Delete all work', 'Change computers'], 1, 'Debug habit.'),
      Q('Tracing means…', ['Following each step in order in your head or with a finger', 'Guessing once', 'Only watching videos', 'Skipping turns'], 0, 'Definition.'),
      Q('Logical reasoning here means…', ['Explaining why steps produce an outcome', 'Memorising passwords', 'Buying hardware', 'Only for adults'], 0, 'CS-3.'),
    ],
    reflection: 'When my prediction was wrong, I learned…',
    extension: 'Trace a sibling’s Lego-build steps before they build.',
  },
  'y3-w04': {
    pupilHook: 'Green flag, then move, then turn. Today Dot follows your first real on-screen sequence.',
    about: 'First structured studio lesson: green flag event, move and turn blocks, running and resetting. Pupils learn that programs are ordered sequences on screen.',
    objectives: [
      'Start a program with the green flag',
      'Build a sequence: move then turn',
      'Use reset to try again from the start',
    ],
    vocabulary: VOCAB.sequence,
    international: NOTES.CS,
    activities: [
      T('Block puzzle on desks', 'Physical blocks before digital', 'unplugged', 12, [
        'Printed cards: green flag, move, turn 90.',
        'Build a legal stack: flag on top.',
        'Invalid stacks (move with no flag) discussed.',
        'Partner walks the desk as the sprite.',
        'Photograph the working stack.',
        'Open studio and match the stack.',
      ], 'Which card must come first?', 'Colour-coded cards.', 'Preview a repeat card.'),
      T('Flag–move–turn race', 'Pairs race to a working 3-block program', 'pair', 14, [
        'Success: sprite moves then turns once after green flag.',
        'Partner A drives the mouse; B reads the checklist.',
        'Run; if stuck, reset — do not pile extra blocks.',
        'Swap roles and repeat.',
        'Screenshot the working script.',
        'One pair demos reset vs run.',
      ], 'What does reset save you from?', 'Teacher demo on loop.', 'Add a second move.'),
      T('Broken hat debug', 'Find why nothing happens', 'digital', 12, [
        'Open a project where move is not under the green flag.',
        'Predict: nothing / something / crash.',
        'Run and watch.',
        'Snap the flag hat back on.',
        'Run again.',
        'Write: Events start the sequence.',
      ], 'Why did the sprite sit still?', 'Arrow stickers on the hat.', 'Add a say block after move.'),
    ],
    codeDebug: 'Studio: when green flag clicked → move 50 → turn 90. Bug: move block not attached under the flag hat.',
    quiz: [
      Q('A sequence in programming is…', ['Instructions run from top to bottom', 'Random actions', 'Only one block ever', 'The internet'], 0, 'CS-2.'),
      Q('The green flag usually…', ['Starts the main program', 'Deletes sprites', 'Turns sound off forever', 'Saves passwords'], 0, 'Events.'),
      Q('Reset helps you…', ['Try again from the start', 'Break the computer', 'Skip debugging', 'Avoid saving'], 0, 'Practice.'),
      Q('This lesson is about…', ['Ordered blocks that move a sprite', 'Python only', 'Websites', 'Email'], 0, 'First studio sequence.'),
    ],
    reflection: 'The first block in my program is… because…',
    extension: 'Show a family member the green flag and what happens when you press it.',
  },
  'y3-w05': {
    pupilHook: 'Dot turned the wrong way. You will find the buggy line and fix just that — not the whole program.',
    about: 'Pupils debug like professionals: predict, run, compare, change one thing, retest. Wrong turns and extra repeats are the first studio bugs.',
    objectives: [
      'Name one strategy: change only one thing then retest',
      'Find a wrong turn in a short script',
      'Explain the bug in a sentence',
    ],
    vocabulary: VOCAB.debug,
    international: NOTES.CS,
    activities: [
      T('One-change rule', 'Class chant the debug steps', 'unplugged', 10, [
        'Poster: Predict → Run → Compare → Change one thing → Retest.',
        'Children mime each step.',
        'Teacher “fixes” three things at once — class boos.',
        'Teacher fixes one turn — class cheers.',
        'Copy the five words into books.',
        'Point to which step you skip most often.',
      ], 'Why is changing everything at once a problem?', 'Icons on the poster.', 'Add ask a buddy as step 6.'),
      T('Wrong-turn theatre', 'Human robots with one planted bug', 'pair', 14, [
        'Script on card: F, F, turn left, F (should be turn right).',
        'Runner follows exactly; navigator watches.',
        'Stop when they miss the star on the floor.',
        'Circle the buggy command.',
        'Replace only that command.',
        'Rerun to the star.',
      ], 'Which command was the bug?', 'Start on a 3-square path.', 'Two bugs next round.'),
      T('Studio: fix the turn', 'Change one block, then green flag', 'digital', 15, [
        'Open the debug-like-a-pro starter (wrong last turn).',
        'Predict the path out loud.',
        'Run once without changing anything.',
        'Change the last turn only.',
        'Retest.',
        'Write the bug in the class bug book.',
      ], 'Did you change only one thing?', 'Highlight the last block.', 'Fix a second planted extra move.'),
    ],
    codeDebug: 'Open debug practice: last turn is LEFT but the star is to the right. Fix the turn; leave the forwards.',
    quiz: [
      Q('Debugging means…', ['Deleting the program', 'Finding and fixing errors', 'Adding random blocks', 'Turning the computer off'], 1, 'Definition.'),
      Q('A good first debug step is…', ['Guess lots of changes', 'Predict what each line should do', 'Ignore errors', "Copy a friend's file"], 1, 'Predict first.'),
      Q('Which is a bug in a path program?', ['Sprite reaches the star', 'Sprite turns opposite to the plan', 'Saving your work', 'Using green flag'], 1, 'Application.'),
      Q('Why keep a bug log?', ['To punish mistakes', 'To remember what you tried', 'It is useless', 'Only teachers need it'], 1, 'Metacognition.'),
    ],
    reflection: 'The bug I found today was… I fixed it by…',
    extension: 'If a game controller feels wrong, describe one thing you would test first.',
  },
  'y3-w06': {
    pupilHook: 'No new idea today — you prove you remember safety, algorithms, predicting, sequences, and debugging.',
    about: 'Autumn 1 review: retrieve vocabulary, teach-back a partner, and mix skills in a short checkpoint. No new content.',
    objectives: [
      'Recall five key words from weeks 1–5',
      'Teach a partner one idea with an example',
      'Score well on a mixed quiz',
    ],
    vocabulary: VOCAB.review,
    international: NOTES.review,
    activities: [
      T('Word wall relay', 'Match definitions from weeks 1–5', 'unplugged', 14, [
        'Cards: device, algorithm, predict, sequence, debug, green flag.',
        'Teams tag the matching definition on the wall.',
        'Wrong tag — next teammate tries.',
        'Winning team explains the hardest word.',
        'Class agrees a shared kid-friendly definition.',
        'Photograph the wall.',
      ], 'Can you define debug without saying computer?', 'Picture clues.', 'Pupils write a new card.'),
      T('Teach-back 90 seconds', 'Partner explains one week', 'pair', 12, [
        'Slips: charter, recipe algorithm, tracing, green flag, wrong turn.',
        'A teaches for 90 seconds with an example.',
        'B asks one why question.',
        'Swap with a new slip.',
        'Write: The most important skill so far was…',
        'Three sentences shared with the class.',
      ], 'What question helped your partner?', 'Sentence starters.', '30-second audio if devices allow.'),
      T('Mixed checkpoint', 'Mini studio or paper mix', 'digital', 14, [
        'Task A: order 4 safety/algorithm steps.',
        'Task B: spot one planted turn bug.',
        'Self-mark against the two criteria.',
        'Use the debug poster before asking.',
        'Submit one screenshot or glued sheet.',
        'Star and wish for Autumn 2.',
      ], 'Which criterion was amber?', 'Checklist icons.', 'A third mini-task if both green.'),
    ],
    codeDebug: 'Review template: one deliberate wrong turn from week 5 — fix it, then stop.',
    quiz: [
      Q('This review week is for…', ['Brand-new topics only', 'Remembering and connecting weeks 1–5', 'Skipping computing', 'Replacing the year test'], 1, 'Retrieval.'),
      Q('Best proof you understand an algorithm is…', ["Memorise the teacher's words", 'Explain steps so someone else can follow', 'Hide your work', 'Use the longest program'], 1, 'Explainability.'),
      Q('If you are stuck debugging, try first…', ['Delete everything', 'Change random blocks', 'Read in order and predict each step', 'Ask someone to fix it without looking'], 2, 'Predict before run.'),
      Q('We teach online safety in computing because…', ['To scare pupils', 'So we can use technology confidently and kindly', 'Games are always dangerous', 'Safety is not computing'], 1, 'DL-1.'),
    ],
    reflection: 'I am proud of… Next I will practise…',
    extension: 'Write one quiz question for a Year 2 child about algorithms.',
  },
  'y3-w07': {
    pupilHook: 'You will plan Dot’s morning: get up, line up, log in. Break it into tiny jobs before you code next week.',
    about: 'Mini-project part 1: Robot morning routine. Pupils decompose a morning into phases, agree success criteria, and paper-prototype before studio.',
    objectives: [
      'Split a morning routine into three phases',
      'Write success criteria the class can tick',
      'Sketch or list the first studio version',
    ],
    vocabulary: VOCAB.project,
    international: NOTES.project,
    activities: [
      T('Morning on sticky notes', 'Decompose get-up-to-login', 'unplugged', 15, [
        'Brainstorm every morning step (home and school).',
        'Cluster into three phases: home, journey, classroom login.',
        'Bin steps that are not needed for the robot story.',
        'Number the surviving steps.',
        'Stick the plan on a large sheet.',
        'Teacher initials the plan.',
      ], 'What is phase one tomorrow in studio?', 'Teacher template sheet.', 'Add a timeline of three dates.'),
      T('Criteria gallery', 'What does a good routine program look like?', 'pair', 12, [
        'Show two teacher exemplars: messy vs clear.',
        'Pairs stick dots: clear, works, kind, short enough.',
        'Write one personal target from the rubric.',
        'Share target with partner.',
        'Add must-haves: starts with flag, at least 4 steps, one turn.',
        'Teacher clarifies teams and save names.',
      ], 'Which criterion will you prioritise?', 'Icon rubric.', 'Co-write one extra criterion.'),
      T('Paper prototype', 'Walk the routine before screens', 'unplugged', 15, [
        'Floor tiles = classroom.',
        'One child is Dot; the other reads the numbered plan.',
        'Note where the human got stuck.',
        'Fix the paper plan only — no devices yet.',
        'Photograph the path.',
        'Save the photo in the project folder (teacher).',
      ], 'Where did Dot get stuck?', 'Fewer tiles.', 'Add a kind greeting say step.'),
    ],
    codeDebug: 'No studio build yet. Paper path must match the three phases; next week you snap it in blocks.',
    quiz: [
      Q('Success criteria help because…', ['They confuse pupils', 'They show what finished looks like', 'They replace teachers', 'They ban creativity'], 1, 'AfL.'),
      Q('Decomposition means…', ['Doing everything at once', 'Breaking a big job into smaller jobs', 'Deleting the plan', 'Only drawing'], 1, 'CS-1.'),
      Q('A good first studio version should…', ['Do the whole year in one go', 'Meet the must-haves only', 'Never be tested', 'Hide from your partner'], 1, 'Scope.'),
      Q('Why paper-prototype first?', ['To delay coding forever', 'To find stuck points cheaply', 'Paper is required by law', 'Robots cannot use screens'], 1, 'Planning.'),
    ],
    reflection: 'My three phases are…',
    extension: 'Time a real morning step at home and see if your algorithm matches.',
  },
  'y3-w08': {
    pupilHook: 'Repeating move ten times is boring. A loop does the same job with one block — if you set the count right.',
    about: 'Loops save time: repeat a move/turn pattern instead of duplicating blocks. Pupils compare long vs looped scripts and debug a wrong repeat count.',
    objectives: [
      'Explain that a loop repeats a set of steps',
      'Replace repeated moves with repeat N',
      'Fix a loop that repeats the wrong number of times',
    ],
    vocabulary: VOCAB.loop,
    international: NOTES.CS,
    activities: [
      T('Clap repeat', 'Feel a loop in the hall', 'unplugged', 10, [
        'Teacher: clap, step, clap, step… ten times spoken individually — groan.',
        'Then: repeat 10 { clap, step }.',
        'Class performs both.',
        'Count how many instructions were spoken.',
        'Write: loops make repeated work shorter.',
        'Invent a 3-action loop for lining up.',
      ], 'What number goes in the repeat?', 'Count with fingers.', 'Nested tease: repeat 2 { repeat 2 clap }.'),
      T('Long script vs loop', 'Same square, two programs', 'pair', 14, [
        'Cards: four move+turn pairs vs one repeat 4 wrapping move+turn.',
        'Build both on desks.',
        'Walk both; they should match.',
        'Count cards.',
        'Discuss which is easier to change if the square grows.',
        'Photograph both.',
      ], 'If you need a hexagon, which script is easier to edit?', 'Colour the loop body.', 'Wrong count 3 vs 4.'),
      T('Studio square', 'repeat 4 { move, turn 90 }', 'digital', 16, [
        'Open loops starter.',
        'First try without a loop (allowed to feel the pain).',
        'Rebuild with repeat 4.',
        'Planted bug: repeat 3 — predict a missing side.',
        'Fix the count to 4.',
        'Optional: repeat 6 for a hexagon.',
      ], 'Why did repeat 3 fail the square?', 'Show the count parameter.', 'Pen down for a drawn square.'),
    ],
    codeDebug: 'Square uses repeat 3 instead of 4 (or turn 80° not 90°). Change one number, retest.',
    quiz: [
      Q('A loop is for…', ['Doing a step once only', 'Repeating a pattern efficiently', 'Deleting sprites', 'Saving passwords'], 1, 'CS-2.'),
      Q('repeat 4 { move, turn 90 } should draw…', ['A square', 'A straight line', 'Nothing', 'A circle always'], 0, 'Geometry link.'),
      Q('If the square is missing a side, check…', ['The repeat count', 'The school Wi-Fi password', 'The volume', 'The printer'], 0, 'Debug the count.'),
      Q('Why not copy-paste move ten times?', ['Copy-paste is illegal', 'A loop is shorter and easier to change', 'Computers forbid move blocks', 'Green flag breaks'], 1, 'Maintainability.'),
    ],
    reflection: 'I used a loop to…',
    extension: 'Count a real repeated job at home (folding towels) and write repeat N { … }.',
  },
  'y4-w02': {
    about: 'Pseudocode is planning in plain language before blocks or text code. Multi-step algorithms need clear, ordered detail.',
    objectives: [
      'Describe the main idea of Multi-step algorithms and pseudocode using lesson vocabulary',
      'Take part in unplugged, pair, and application tasks',
      'Answer four quiz questions about this topic',
    ],
    vocabulary: VOCAB.pseudo,
    international: NOTES.CS,
    activities: [
      T('Plain-language football', 'Introduce Multi-step algorithms and pseudocode without devices', 'unplugged', 14, [
        'Challenge: score a paper-cup goal.',
        'Write steps in everyday language only.',
        'Partner follows literally.',
        'Add missing measurements (how many steps?).',
        'Underline words that might become loops.',
        'Share clearest plan on board.',
      ], 'Can you explain the idea in one sentence?', 'Visual support.', 'Teach a younger pupil.'),
      T('Predict–run–discuss', 'Apply ideas from Multi-step algorithms and pseudocode with a partner', 'pair', 14, [
        'Teacher displays a problem card for: Multi-step algorithms and pseudocode.',
        'Partner A predicts the outcome in writing (one sentence).',
        'Partner B runs the demo, studio project, or paper trace.',
        'Compare prediction and result; label match or surprise.',
        'If surprise, write one possible cause (bug, wrong order, wrong number).',
        'Swap roles with a second card from the same lesson.',
      ], 'What evidence changed your mind?', "Sentence starters: 'I thought… because…'", 'Create a third card for homework.'),
      T('Lesson task checkpoint', 'Complete the main task for Multi-step algorithms and pseudocode', 'pair', 15, [
        'Open worksheet or paper pseudo-code for this week (teacher link or QR).',
        'Read success criteria aloud with your partner.',
        'Finish part A only; raise hand for teacher checkpoint.',
        'Finish part B; use the class debugging poster if stuck.',
        'Self-mark with traffic-light stickers (red/amber/green).',
        'Save, screenshot, or glue work into computing book.',
      ], 'Which criterion is green? Which is amber?', 'Teacher demo video loop on board.', 'Extension task on card if all green.'),
    ],
    codeDebug: 'Translate three pseudocode lines to blocks in studio.',
    quiz: [
      Q('Pseudocode is…', ['Human-readable plan before code', 'A secret language', 'Only for Python', 'A virus'], 0, 'Definition'),
      Q('Good pseudocode includes…', ['Clear order and enough detail', 'Only one word', 'Passwords', 'Random emoji'], 0, 'Quality'),
      Q('Multi-step algorithms need…', ['Each step defined', 'No steps', 'Only pictures', 'Luck'], 0, 'CS-1'),
      Q('After Multi-step algorithms and pseudocode, you can…', ['Plan before touching blocks', 'Never plan', 'Skip debugging', 'Avoid pairs'], 0, 'Lesson'),
    ],
    reflection: 'After Multi-step algorithms and pseudocode, what can you do now that you could not before?',
    extension: 'Teach a family member one idea from Multi-step algorithms and pseudocode without using jargon.',
  },
};

function actsDebug(title) {
  return [
    T('Bug hunt stories', `Explore ${title} without devices`, 'unplugged', 14, [
      "Read three short 'robot went wrong' stories.",
      'Identify whether bug is wrong order, wrong number, or missing step.',
      'Place bug type stickers on the story.',
      "Rewrite one story's fix.",
      'Share fixes in pairs.',
      'Add one bug story to the class bug museum wall.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing where helpful.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', 'digital', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function actsLoop(title) {
  return [
    T('Loop dance', `Explore ${title} without devices`, 'unplugged', 14, [
      'Learn a four-beat clap-stamp pattern.',
      'Teacher says: repeat four times — class performs.',
      "Write instructions using 'repeat 4' instead of four lines.",
      'Change to repeat 6; predict length.',
      'Discuss: loops save time when writing programs.',
      'Draw the loop block diagram on mini-whiteboards.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', 'digital', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function actsEvents(title) {
  return [
    T('Green flag game', `Explore ${title} without devices`, 'unplugged', 14, [
      'When teacher raises green card, pupils stand; red card, sit.',
      "Discuss: the card is an 'event'; standing is the 'response'.",
      'Add blue card = hands on head.',
      'Write event-response table on board.',
      "Link to 'when flag clicked' in programming.",
      'Pupils invent one new event for the class.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', 'digital', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function actsVariables(title) {
  return [
    T('Score cup game', `Explore ${title} without devices`, 'unplugged', 14, [
      'Teams earn counters for correct answers in a quick quiz.',
      "Variable 'score' changes; name stays the same.",
      'Reset score to zero and play again.',
      'Graph scores on board.',
      "Relate cup counters to 'set score to' and 'change score by'.",
      'Predict score after three +1 changes.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', 'digital', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function actsDecomp(title) {
  return [
    T('Split the challenge', `Introduce ${title} without devices`, 'unplugged', 14, [
      'Show photo of a complex object (bicycle, sandwich shop).',
      'Groups brainstorm sub-tasks on sticky notes.',
      'Cluster into phases; order them.',
      'Each group names one sub-algorithm.',
      'Discuss what happens if a phase is skipped.',
      'Link to capstone planning later in the year.',
    ], 'Can you explain the idea in one sentence?', 'Visual support.', 'Teach a younger pupil.'),
    T('Predict–run–discuss', `Apply ideas from ${title} with a partner`, 'pair', 14, [
      `Teacher displays a problem card for: ${title}.`,
      'Partner A predicts the outcome in writing (one sentence).',
      'Partner B runs the demo, studio project, or paper trace.',
      'Compare prediction and result; label match or surprise.',
      'If surprise, write one possible cause (bug, wrong order, wrong number).',
      'Swap roles with a second card from the same lesson.',
    ], 'What evidence changed your mind?', "Sentence starters: 'I thought… because…'", 'Create a third card for homework.'),
    T('Lesson task checkpoint', `Complete the main task for ${title}`, 'pair', 15, [
      'Open worksheet or paper pseudo-code for this week (teacher link or QR).',
      'Read success criteria aloud with your partner.',
      'Finish part A only; raise hand for teacher checkpoint.',
      'Finish part B; use the class debugging poster if stuck.',
      'Self-mark with traffic-light stickers (red/amber/green).',
      'Save, screenshot, or glue work into computing book.',
    ], 'Which criterion is green? Which is amber?', 'Teacher demo video loop on board.', 'Extension task on card if all green.'),
  ];
}

function actsData(title, coding) {
  return [
    T('Class survey', `Explore ${title} without devices`, 'unplugged', 14, [
      'Agree one question (e.g. favourite fruit).',
      'Tally votes with paper or digital form — no full names.',
      'Convert tallies to bar chart.',
      'Interpret: which is most common? any surprises?',
      'Discuss ethical collection: consent, privacy.',
      'Link data to programs that use numbers later.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', coding ? 'digital' : 'pair', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function actsSearch(title) {
  return [
    T('Two-source challenge', `Explore ${title} without devices`, 'unplugged', 14, [
      'Teacher assigns a factual question (e.g. largest mammal).',
      'Pupils use approved search or provided links only.',
      'Find two sources; note title and date if shown.',
      'Do sources agree? If not, investigate why.',
      "Write answer with 'According to…'",
      'Discuss ads vs facts on results pages.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', 'pair', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function actsKindness(title) {
  return [
    T('Scenario circles', `Explore ${title} without devices`, 'unplugged', 14, [
      'Read scenario: unkind comment in class chat.',
      'Discuss options: ignore, join in, report, support target.',
      'Role-play supportive bystander response.',
      'List school reporting routes.',
      "Create 'STOP' poster: Stop, Tell, Okay to ask help.",
      'No personal stories required — use fictional names.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', 'pair', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function actsNetwork(title, coding) {
  return [
    T('String network', `Explore ${title} without devices`, 'unplugged', 14, [
      "Pupils hold string between desks as 'cables'.",
      "Pass paper 'message' along one path.",
      'Cut one link — discuss broken connection.',
      'Introduce router as pupil who chooses path.',
      'Compare to Wi-Fi and school filter safety.',
      'Never share network passwords activity.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', coding ? 'digital' : 'pair', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function actsSelection(title) {
  return [
    T('If this then that cards', `Explore ${title} without devices`, 'unplugged', 14, [
      "Cards: 'If raining' / 'take umbrella' / 'wear sunglasses'.",
      'Match condition to sensible action.',
      "Add else: 'else wear hat in sun'.",
      'Play with weather scenarios teacher calls out.',
      'Translate one card pair to pseudo-code on board.',
      'Relate to games: if touching edge, bounce.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', 'digital', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function actsPython(title) {
  return [
    T('Predict the output', `Explore ${title} without devices`, 'unplugged', 14, [
      'Display four-line script on board.',
      'Pupils predict output on whiteboards without running.',
      'Run and compare.',
      'Change one line teacher-chosen; predict again.',
      'Discuss: order matters in text programs too.',
      'Pupils suggest one safe line change.',
    ], "Can you explain the idea without saying 'computer'?", 'Visual aids and home-language pairing.', 'Create a poster teaching the idea.'),
    T('Think-pair-share challenge', 'Apply the lesson idea with a partner', 'pair', 14, [
      `Read the problem card for '${title}'.`,
      'Individually sketch a solution for one minute.',
      'Partner explains; listener asks one why question.',
      'Agree on best approach.',
      'Present one insight to another pair.',
      'Teacher cold-calls two pairs for summary.',
    ], 'What did your partner see that you missed?', 'Problem card with diagram.', 'Write a harder problem card for next lesson.'),
    T('Apply in studio or on paper', 'Hands-on task for this topic', 'digital', 14, [
      "Open the week's task (studio, simulator, or worksheet).",
      'Read success criteria twice.',
      'Complete part 1 with teacher checkpoint.',
      'Complete part 2; debug if needed.',
      'Self-assess against criteria.',
      'Save or glue work into computing book.',
    ], 'Which criterion was hardest?', 'Completed example on board.', 'Add a creative extra feature.'),
  ];
}

function familyOf(id, title, kind, primary) {
  if (UNIQUE[id]) return 'unique';
  const t = title.toLowerCase();
  if (id === 'y3-w36' || /debug like a pro|debugging strategies|systematic debugging|debug at scale|capstone: build and debug/.test(t)) return 'debug';
  if (id === 'y3-w37' || /present and peer review/.test(t)) return 'review';
  if (kind === 'review') return 'review';
  if (kind === 'mini' || kind === 'capstone' || kind === 'showcase') return 'project';
  if (/python/.test(t)) return 'python';
  if (/loop|repeat until|nested loop/.test(t)) return 'loop';
  if (/event|green flag/.test(t)) return 'events';
  if (/variable|score and counter|game state/.test(t)) return 'variables';
  if (/decompos|break it down|modular chunks/.test(t)) return 'decomp';
  if (/boolean|if, else|if this, then|selection in/.test(t) || /complex conditionals/.test(t)) return 'selection';
  if (/search smart|evaluate website|reliable source|evaluate ai|searching systems/.test(t) || primary === 'IT-2') return 'search';
  if (/kindness|footprint|cyber smart|ethics: ai/.test(t)) return 'kindness';
  if (/network|internet works|computers connect|wi-fi|communication and networks/.test(t) || (primary === 'IT-1' && /collaborat|team roles/.test(t) === false)) {
    if (/collaborat|team roles|online collaboration/.test(t)) return 'topic';
    return 'network';
  }
  if (/what is data|collect and present|data in your|data detective|data quest|branching database|surveys and charts|flat-file|sort and interpret|data structures|data-driven|analyse data|structured data/.test(t)) return 'data';
  return 'topic';
}

const CODE = {
  debug: 'Open debug practice project; fix wrong turn direction and wrong repeat count.',
  loop: 'Studio: draw a square using repeat 4 (move + turn). Extension: repeat 6 for a hexagon. Bug version uses turn 80° not 90°.',
  events: 'Add when green flag clicked; sprite says hello and moves once. Add key press event extension.',
  variables: 'Create score variable; change by 1 when sprite touches star. Bug: uses change before set.',
  decomp: 'Paper: split the problem into three phases.',
  dataPaper: 'Paper chart only.',
  dataCode: 'Use a variable to store tally; optional studio bar chart project.',
  search: 'No code; optional trusted-link bookmark folder activity.',
  kindness: "Design a 'kind comment' sprite message in studio — optional.",
  network: "Optional: send variable 'message' between two sprites as metaphor.",
  selection: 'Implement if touching colour then sound else move. Boolean quiz: AND/OR on two questions.',
  python: 'Trace/edit scaffolded script: score variable and print. One intentional typo to fix.',
  review: 'Use the unit review template; fix one deliberate bug from earlier in the term.',
  project: 'Project coding as per plan; showcase week may be presentation only.',
  topicCode: 'Studio task linked to this week. Follow teacher checklist in Learn Hub.',
  topicPaper: 'Paper trace for this week’s topic.',
};

export function getDetailedEdition(id, year, title, kind, primary, coding) {
  const weekIndex = Math.max(0, parseInt(String(id).split('-w')[1], 10) - 1);
  const pup = getPupilMission(year, weekIndex, title, kind, primary);
  if (UNIQUE[id]) {
    return { ...UNIQUE[id], pupilHook: UNIQUE[id].pupilHook || pup.hook };
  }
  const fam = familyOf(id, title, kind, primary);
  const codingLab = !!coding;

  if (fam === 'review') {
    return {
      about: `This review lesson consolidates the unit. Pupils retrieve vocabulary, explain ideas to a partner, and apply skills in a short mixed challenge. No new content is introduced; depth comes from connection and explanation.`,
      objectives: [
        'Recall key vocabulary from the unit',
        'Explain at least two ideas using examples from lessons',
        'Answer retrieval and application questions accurately',
      ],
      vocabulary: VOCAB.review,
      international: NOTES.review,
      activities: actsReview(),
      codeDebug: CODE.review,
      quiz: pup.quiz,
      pupilHook: pup.hook,
      reflection: 'What are you proud of from this unit? What one skill will you practise next week?',
      extension: 'Design a one-question quiz for a younger class about this unit.',
    };
  }

  if (fam === 'project') {
    return {
      about: kind === 'showcase'
        ? `Celebration lesson: ${title}. Pupils share learning with an audience, using planning, criteria, and reflection.`
        : `Project lesson: ${title}. Pupils apply multiple skills in an extended task with planning, criteria, and reflection.`,
      objectives: [
        'Meet agreed success criteria',
        'Collaborate and communicate about design',
        'Reflect on strengths and next steps',
      ],
      vocabulary: VOCAB.project,
      international: NOTES.project,
      activities: actsProject(),
      codeDebug: CODE.project,
      quiz: pup.quiz,
      pupilHook: pup.hook,
      reflection: 'What would you improve with one more week?',
      extension: 'Write instructions so another class can play your project.',
    };
  }

  const packs = {
    debug: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.debug, international: NOTES.CS, activities: actsDebug(title),
      codeDebug: CODE.debug, quiz: quizDebug(),
    },
    loop: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.loop, international: NOTES.CS, activities: actsLoop(title),
      codeDebug: CODE.loop, quiz: quizLoop(),
    },
    events: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.events, international: NOTES.CS, activities: actsEvents(title),
      codeDebug: CODE.events, quiz: quizEvents(),
    },
    variables: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.variables, international: NOTES.CS, activities: actsVariables(title),
      codeDebug: CODE.variables, quiz: quizVariables(),
    },
    decomp: {
      about: `Topic: ${title} (Year ${year}). Decomposition breaks big problems into smaller sub-problems. Pupils plan projects as phases before coding.`,
      objectives: [`Describe the main idea of '${title}' using lesson vocabulary`, 'Take part in unplugged, pair, and application tasks', 'Answer four quiz questions about this topic'],
      vocabulary: VOCAB.decomp, international: NOTES.CS, activities: actsDecomp(title),
      codeDebug: fill(CODE.decomp, title, year), quiz: quizDecomp(title),
    },
    data: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.data, international: NOTES.IT, activities: actsData(title, codingLab),
      codeDebug: codingLab ? CODE.dataCode : CODE.dataPaper, quiz: quizData(),
    },
    search: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.search, international: NOTES.IT, activities: actsSearch(title),
      codeDebug: CODE.search, quiz: quizSearch(),
    },
    kindness: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.kindness, international: NOTES.DL, activities: actsKindness(title),
      codeDebug: CODE.kindness, quiz: quizKindness(),
    },
    network: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.network, international: NOTES.IT, activities: actsNetwork(title, codingLab),
      codeDebug: CODE.network, quiz: quizNetwork(),
    },
    selection: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.selection, international: NOTES.CS, activities: actsSelection(title),
      codeDebug: CODE.selection, quiz: quizSelection(),
    },
    python: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.python, international: NOTES.CS, activities: actsPython(title),
      codeDebug: CODE.python, quiz: quizPython(),
    },
    topic: {
      about: `Pupils engage with ${title} (Year ${year}). This lesson develops strand ${primary} through practical tasks that work in any primary school with or without 1:1 devices.`,
      objectives: [`Explain the main idea of '${title}' in their own words`, 'Complete unplugged, pair, and digital/paper tasks', 'Answer quiz questions that apply the lesson, not generic facts only'],
      vocabulary: VOCAB.generic, international: NOTES.CS, activities: actsTopic(title, codingLab),
      codeDebug: codingLab ? `Studio task linked to: ${title}. Follow teacher checklist in Learn Hub.` : `Paper trace for: ${title}.`,
      quiz: quizTopic(title),
    },
  };

  const pack = packs[fam] || packs.topic;
  return {
    ...pack,
    about: plainAbout(title, year, primary, kind, codingLab),
    objectives: kidObjectives(title, primary, codingLab, kind),
    pupilHook: pup.hook,
    quiz: pup.quiz,
    reflection: pack.reflection || `After today I can… / I still need help with…`,
    extension: pack.extension || `Write four steps so a younger child could try “${title}”.`,
  };
}
