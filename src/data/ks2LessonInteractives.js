/**
 * Curriculum Bible–aligned digital activities (38 weeks × 4 years).
 * Titles and tasks match ks2CurriculumLessons / ks2WeekSpine — not legacy Y3 packs.
 */
import { COURSES } from './learnKs2Courses.js';
import { getCodingLabConfig, isCodingLesson, codingBlocksPuzzle } from './learnCodingConfig.js';
import { getPupilMission } from './pupilMissions.js';

function shortTitle(title, max = 52) {
  if (!title) return 'This lesson';
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

export function sequenceStepsForLesson(lesson) {
  const primary = lesson.statutory?.primary || lesson.ukCurriculum?.[0] || 'CS-1';
  const kind = lesson.kind || 'normal';

  if (kind === 'review') {
    return [
      'Skim earlier weeks in this term',
      'Explain one idea to a partner',
      'Fix one deliberate mistake',
      'Answer a retrieval question',
      'Set one goal for next week',
    ];
  }
  if (kind === 'capstone' || kind === 'mini') {
    return [
      'List success criteria',
      'Break work into small steps',
      'Build or draft one part',
      'Test and debug one change',
      'Prepare to share learning',
    ];
  }
  if (kind === 'showcase') {
    return [
      'Celebrate work safely',
      'Explain one project choice',
      'Give kind peer feedback',
      'Thank your teacher or helper',
      'Stay proud and respectful online',
    ];
  }

  const byCode = {
    'DL-1': [
      'Pause before you post or click',
      'Is it kind and safe?',
      'Keep personal details private',
      'Tell a trusted adult if worried',
      'Continue respectfully',
    ],
    'CS-1': [
      'Break the problem into steps',
      'Write step one clearly',
      'Add the next small step',
      'Test the full order',
      'Fix any step that fails',
    ],
    'CS-2': [
      'Press the green flag to start',
      'Run blocks in sequence',
      'Add a loop if steps repeat',
      'Check output matches the goal',
      'Debug one block at a time',
    ],
    'CS-3': [
      'Predict what the program will do',
      'Run and watch carefully',
      'Compare with your prediction',
      'Find where it went wrong',
      'Change one thing and retest',
    ],
    'IT-1': [
      'One device creates a message',
      'The message travels on a network',
      'Another device receives it',
      'Collaborate with agreed rules',
      'Ask an adult if unsure online',
    ],
    'IT-2': [
      'Search with clear keywords',
      'Open two different sources',
      'Compare the information',
      'Decide if it is trustworthy',
      'Ask an adult if unsure',
    ],
    'IT-3': [
      'Pick software for the goal',
      'Collect or create content',
      'Combine tools if needed',
      'Check it meets success criteria',
      'Save with a clear filename',
    ],
  };

  return byCode[primary] || byCode['CS-1'];
}

function themedActivities(lesson, yr, lessonIdx) {
  const primary = lesson.statutory?.primary || 'CS-1';
  const title = shortTitle(lesson.title);
  const out = [];

  if (lesson.codingLab || isCodingLesson(lesson)) {
    const coding = getCodingLabConfig(yr, lessonIdx);
    if (coding?.editor === 'blocks') {
      out.push({
        type: 'blocks',
        title: `Studio: ${title}`,
        description: coding.challenge,
        xp: coding.xp || 25,
        duration: '6 min',
        config: {
          mission: coding.mission,
          starterBlocks: coding.starterBlocks,
          solutionBlocks: coding.solutionBlocks,
          hints: coding.hints,
        },
      });
    }
  }

  if (primary === 'DL-1' || primary === 'IT-2') {
    out.push({
      type: 'matching',
      title: 'Stay safe online',
      description: `Match situations to the safest choice — ${title}.`,
      xp: 20,
      duration: '4 min',
      config: {
        pairs: [
          { left: 'Someone asks for your password', right: 'Tell a trusted adult — never share' },
          { left: 'Unkind message online', right: 'Screenshot, block, tell an adult' },
          { left: 'Website looks odd or too good to be true', right: 'Close it and check with an adult' },
          { left: 'Stranger wants to meet up', right: 'Never agree — tell an adult straight away' },
        ],
      },
    });
    out.push({
      type: 'quiz',
      title: 'Digital check-in',
      description: 'Quick questions on this week\'s theme.',
      xp: 15,
      duration: '3 min',
      config: {
        questions: [
          {
            question: 'Who should you tell if something online worries you?',
            options: ['Nobody', 'A trusted adult', 'A random contact'],
            correct: 1,
          },
          {
            question: 'Is it OK to share your full name with everyone online?',
            options: ['Yes, always', 'No — keep personal data private', 'Only with strangers'],
            correct: 1,
          },
        ],
      },
    });
  } else if (primary === 'IT-3') {
    out.push({
      type: 'sorting',
      title: 'Data or not?',
      description: 'Sort items for a class project — no real personal data.',
      xp: 20,
      duration: '4 min',
      config: {
        categories: [
          { id: 'data', label: 'Useful data 📊' },
          { id: 'not', label: 'Not for school 🚫' },
        ],
        items: [
          { id: 'fav', label: 'Favourite fruit (class tally)', category: 'data' },
          { id: 'pet', label: 'Class pet count', category: 'data' },
          { id: 'home', label: 'Your home address', category: 'not' },
          { id: 'pwd', label: 'Password', category: 'not' },
          { id: 'weather', label: 'Weather chart', category: 'data' },
        ],
      },
    });
    out.push({
      type: 'multiSeq',
      title: 'Plan the project',
      description: 'Put project steps in a sensible order.',
      xp: 25,
      duration: '5 min',
      tasks: [{
        name: title,
        steps: ['Gather data safely', 'Record in a table', 'Make a chart', 'Explain one finding'],
      }],
    });
  } else if (primary === 'IT-1') {
    out.push({
      type: 'simulation',
      title: 'Message on a network',
      description: 'Choose what happens when devices share information.',
      xp: 20,
      duration: '4 min',
      config: {
        steps: [
          {
            situation: 'Your tablet sends a drawing to a friend\'s tablet — what happens first?',
            choices: [
              { text: 'The message is split and sent on the network', feedback: 'Yes — networks carry messages between devices.' },
              { text: 'The drawing prints automatically', feedback: 'Not unless you send it to a printer.' },
              { text: 'Nothing — devices cannot share', feedback: 'Networks let devices collaborate.' },
            ],
            correct: 0,
          },
          {
            situation: 'Something online feels wrong — what should you do?',
            choices: [
              { text: 'Tell a trusted adult', feedback: 'Correct — IT-1 includes safe collaboration.' },
              { text: 'Share your password to fix it', feedback: 'Never share passwords.' },
              { text: 'Ignore it forever', feedback: 'Always tell an adult when worried.' },
            ],
            correct: 0,
          },
        ],
      },
    });
    out.push({
      type: 'matching',
      title: 'Network words',
      description: 'Match computing words to meanings.',
      xp: 15,
      duration: '3 min',
      config: {
        pairs: [
          { left: 'Network', right: 'Devices sharing information' },
          { left: 'Internet', right: 'Many networks connected together' },
          { left: 'Collaborate', right: 'Work together with agreed rules' },
          { left: 'Message', right: 'Data sent from one device to another' },
        ],
      },
    });
  } else if (primary === 'CS-3' || lesson.title?.toLowerCase().includes('debug')) {
    out.push({
      type: 'trace',
      title: 'Micro-debug trace',
      description: lesson.codeDebug || 'Find the line that causes wrong behaviour.',
      xp: 20,
      duration: '4 min',
      config: {
        lines: ['FORWARD 2', 'TURN_RIGHT', 'FORWARD 2', 'TURN_LEFT'],
        bugIdx: 3,
        instructions: 'Which line would send the robot the wrong way?',
      },
    });
    out.push({
      type: 'debug',
      title: 'Fix the command',
      description: 'Choose the fix for the buggy block script.',
      xp: 25,
      duration: '5 min',
      blocks: ['FORWARD 3', 'TURN_RIGHT', 'FORWARD 2', 'TURN_RIGHT', 'FORWARD 1'],
      bugIdx: 3,
      fixOptions: ['TURN_LEFT', 'TURN_RIGHT', 'TURN_BACK'],
      correctFix: 0,
      instructions: 'Which block should change so the robot reaches the goal?',
    });
  } else {
    out.push({
      type: 'grid',
      title: 'Human robot grid',
      description: `Guide the robot — ${title}.`,
      xp: 22,
      duration: '5 min',
      config: {
        size: 5,
        startPos: { x: 0, y: 2 },
        goalPos: { x: 4, y: 2 },
        instructions: 'Plan up to five moves to reach the star.',
      },
    });
    out.push({
      type: 'prediction',
      title: 'Predict the path',
      description: 'Trace before you run — logical reasoning (CS-3).',
      xp: 20,
      duration: '4 min',
      sequence: ['R', 'R', 'D', 'D'],
      start: { x: 0, y: 0 },
      size: 5,
      options: ['(2, 2)', '(0, 2)', '(4, 0)', '(1, 3)'],
      answer: 0,
      instructions: 'Where does the robot finish?',
    });
  }

  if (lesson.kind === 'review') {
    out.unshift({
      type: 'multiSeq',
      title: 'Retrieval sprint',
      description: 'Match quick revision tasks to sensible orders.',
      xp: 20,
      duration: '4 min',
      tasks: [{
        name: 'Review lesson',
        steps: ['Recall key words', 'Explain to partner', 'Fix one error', 'Quiz yourself'],
      }],
    });
  }

  return out.slice(0, 3);
}

/** Three to four digital activities aligned to Curriculum Bible week titles. */
const Y3_WEEK_PUZZLES = {
  0: [
    {
      type: 'sorting', title: 'Always, sometimes, never',
      description: 'Sort class computer rules — Device charter.',
      xp: 20, duration: '4 min',
      config: {
        categories: [
          { id: 'always', label: 'Always ✅' },
          { id: 'never', label: 'Never 🚫' },
        ],
        items: [
          { id: 'pwd', label: 'Keep your password private', category: 'always' },
          { id: 'kind', label: 'Be kind on shared devices', category: 'always' },
          { id: 'addr', label: 'Post your home address online', category: 'never' },
          { id: 'login', label: 'Let a friend use your login', category: 'never' },
          { id: 'adult', label: 'Tell a trusted adult if you worry', category: 'always' },
        ],
      },
    },
    {
      type: 'matching', title: 'Private or share?',
      description: 'Match each thing to keep private or OK to share in class.',
      xp: 20, duration: '4 min',
      config: {
        pairs: [
          { left: 'Home address', right: 'Keep private' },
          { left: 'Favourite colour', right: 'OK to share in class' },
          { left: 'Password', right: 'Keep private' },
          { left: 'A hobby you enjoy', right: 'OK to share in class' },
        ],
      },
    },
    {
      type: 'quiz', title: 'Dot’s safety check',
      description: 'Dot only works when people are kind and clear.',
      xp: 15, duration: '3 min',
      config: {
        questions: [
          { question: 'If something online worries you, who do you tell?', options: ['Nobody', 'A trusted adult', 'A stranger'], correct: 1 },
          { question: 'Should you share your password with your best friend?', options: ['Yes', 'No', 'Only at weekend'], correct: 1 },
        ],
      },
    },
  ],
  1: [
    {
      type: 'codeRacerSeq', title: 'Sandwich algorithm',
      description: 'Put the recipe in an order that actually works.',
      xp: 18, duration: '3 min',
      steps: ['Get two slices of bread', 'Spread jam', 'Put slices together', 'Take a bite'],
      instructions: 'Wrong order = jam disaster. Make a working algorithm.',
    },
    {
      type: 'matching', title: 'Algorithm words',
      description: 'Match the computing words.',
      xp: 15, duration: '3 min',
      config: {
        pairs: [
          { left: 'Algorithm', right: 'Steps in order to reach a goal' },
          { left: 'Sequence', right: 'One step after another' },
          { left: 'Goal', right: 'What you want to finish with' },
          { left: 'Wrong order', right: 'Often gives the wrong result' },
        ],
      },
    },
    {
      type: 'grid', title: 'Desk-tile robot',
      description: 'Guide the toy robot across the desk.',
      xp: 20, duration: '4 min',
      config: { size: 5, startPos: { x: 0, y: 2 }, goalPos: { x: 4, y: 2 }, instructions: 'Plan a path — this is an algorithm too.' },
    },
  ],
  2: [
    {
      type: 'prediction', title: 'Where does Dot stop?',
      description: 'Trace before you run.',
      xp: 20, duration: '4 min',
      sequence: ['R', 'R', 'D', 'D'], start: { x: 0, y: 0 }, size: 5,
      options: ['(2, 2)', '(0, 2)', '(4, 0)', '(1, 3)'], answer: 0,
      instructions: 'Predict the finish square.',
    },
    {
      type: 'trace', title: 'Circle the wrong line',
      description: 'Last turn sends Dot the wrong way.',
      xp: 20, duration: '4 min',
      config: {
        lines: ['FORWARD 2', 'TURN_RIGHT', 'FORWARD 2', 'TURN_LEFT'],
        bugIdx: 3,
        instructions: 'Which line is the bug if the star is to the right?',
      },
    },
    {
      type: 'quiz', title: 'Predict, then check',
      description: 'Quick reasoning check.',
      xp: 15, duration: '3 min',
      config: {
        questions: [
          { question: 'If your prediction was wrong, what next?', options: ['Ignore it', 'Compare line by line', 'Delete the file'], correct: 1 },
          { question: 'Tracing means…', options: ['Guessing once', 'Following each step in order', 'Skipping turns'], correct: 1 },
        ],
      },
    },
  ],
  3: [
    {
      type: 'codeRacerSeq', title: 'Green flag first',
      description: 'A program needs a start event.',
      xp: 18, duration: '3 min',
      steps: ['Green flag (start)', 'Move', 'Turn 90', 'Reset if you need to try again'],
      instructions: 'What order makes a working first sequence?',
    },
    {
      type: 'grid', title: 'Move then turn',
      description: 'Reach the star with a short path.',
      xp: 22, duration: '5 min',
      config: { size: 5, startPos: { x: 0, y: 2 }, goalPos: { x: 4, y: 2 }, instructions: 'Think: start, move, turn — like studio blocks.' },
    },
    {
      type: 'debug', title: 'Hat not attached',
      description: 'Nothing happens — the move is not under the green flag.',
      xp: 22, duration: '4 min',
      blocks: ['GREEN FLAG', 'MOVE 50', 'TURN 90'],
      bugIdx: 0,
      fixOptions: ['Snap MOVE under the flag', 'Delete TURN', 'Add ten more MOVEs'],
      correctFix: 0,
      instructions: 'How do you start the sequence?',
    },
  ],
  4: [
    {
      type: 'trace', title: 'Wrong-turn hunt',
      description: 'Find the line that misses the star.',
      xp: 20, duration: '4 min',
      config: {
        lines: ['FORWARD 2', 'FORWARD 2', 'TURN_LEFT', 'FORWARD 1'],
        bugIdx: 2,
        instructions: 'The plan needed TURN RIGHT. Which line is the bug?',
      },
    },
    {
      type: 'debug', title: 'Change one thing',
      description: 'Fix only the last turn.',
      xp: 25, duration: '5 min',
      blocks: ['FORWARD 3', 'TURN_RIGHT', 'FORWARD 2', 'TURN_LEFT', 'FORWARD 1'],
      bugIdx: 3,
      fixOptions: ['TURN_RIGHT', 'TURN_LEFT', 'FORWARD 9'],
      correctFix: 0,
      instructions: 'Change one block, then retest — the one-change rule.',
    },
    {
      type: 'quiz', title: 'Debug like a pro',
      description: 'Strategy, not guessing.',
      xp: 15, duration: '3 min',
      config: {
        questions: [
          { question: 'Best first debug step?', options: ['Change lots of blocks', 'Predict each line, then run', 'Turn the computer off'], correct: 1 },
          { question: 'Debugging means…', options: ['Finding and fixing errors', 'Deleting the program', 'Adding random blocks'], correct: 0 },
        ],
      },
    },
  ],
  5: [
    {
      type: 'matching', title: 'Weeks 1–5 words',
      description: 'Retrieval: match the words you already know.',
      xp: 18, duration: '4 min',
      config: {
        pairs: [
          { left: 'Algorithm', right: 'Steps in order to a goal' },
          { left: 'Debug', right: 'Find and fix an error' },
          { left: 'Green flag', right: 'Starts the program' },
          { left: 'Private', right: 'Do not share online' },
        ],
      },
    },
    {
      type: 'multiSeq', title: 'Review sprint',
      description: 'Order a sensible revision session.',
      xp: 18, duration: '3 min',
      tasks: [{ name: 'Autumn 1 review', steps: ['Recall key words', 'Explain to a partner', 'Fix one planted bug', 'Take the quiz'] }],
    },
    {
      type: 'debug', title: 'Old bug returns',
      description: 'Week 5’s wrong turn is back.',
      xp: 20, duration: '4 min',
      blocks: ['FORWARD 2', 'TURN_RIGHT', 'FORWARD 2', 'TURN_LEFT'],
      bugIdx: 3,
      fixOptions: ['TURN_RIGHT', 'TURN_LEFT', 'STOP'],
      correctFix: 0,
      instructions: 'Fix last week’s bug again.',
    },
  ],
  6: [
    {
      type: 'multiSeq', title: 'Dot’s morning phases',
      description: 'Break the morning into three jobs.',
      xp: 20, duration: '4 min',
      tasks: [{
        name: 'Robot morning routine',
        steps: ['Home: get ready', 'School: line up kindly', 'Class: log in with your own account'],
      }],
    },
    {
      type: 'sorting', title: 'Must-have or later?',
      description: 'Scope the first studio version.',
      xp: 18, duration: '4 min',
      config: {
        categories: [
          { id: 'must', label: 'Must-have this week' },
          { id: 'later', label: 'Later / extra' },
        ],
        items: [
          { id: 'flag', label: 'Starts with green flag', category: 'must' },
          { id: 'steps', label: 'At least 4 clear steps', category: 'must' },
          { id: 'fire', label: 'Firework animation', category: 'later' },
          { id: 'turn', label: 'Includes one turn', category: 'must' },
          { id: 'movie', label: 'Full movie soundtrack', category: 'later' },
        ],
      },
    },
    {
      type: 'grid', title: 'Paper path on a grid',
      description: 'Walk the prototype before coding.',
      xp: 20, duration: '5 min',
      config: { size: 5, startPos: { x: 0, y: 4 }, goalPos: { x: 4, y: 0 }, instructions: 'This is your morning path — notice where you get stuck.' },
    },
  ],
  7: [
    {
      type: 'matching', title: 'Why loops?',
      description: 'Match loop ideas.',
      xp: 15, duration: '3 min',
      config: {
        pairs: [
          { left: 'Loop', right: 'Repeat a set of steps' },
          { left: 'repeat 4', right: 'Do the body four times' },
          { left: 'Wrong count', right: 'Square missing a side' },
          { left: 'Long copy-paste', right: 'Harder to change later' },
        ],
      },
    },
    {
      type: 'codeRacerSeq', title: 'Build a square loop',
      description: 'Order the loop idea.',
      xp: 18, duration: '3 min',
      steps: ['Start (green flag)', 'Repeat 4 times', 'Move', 'Turn 90'],
      instructions: 'This is repeat 4 { move, turn 90 }.',
    },
    {
      type: 'debug', title: 'Repeat 3 by mistake',
      description: 'The square is missing a side.',
      xp: 22, duration: '4 min',
      blocks: ['REPEAT 3', 'MOVE', 'TURN 90'],
      bugIdx: 0,
      fixOptions: ['REPEAT 4', 'REPEAT 3', 'REPEAT 100'],
      correctFix: 0,
      instructions: 'Fix the count — change one number.',
    },
  ],
};

export function buildKs2LessonInteractives(yr, lessonIdx) {
  const lesson = COURSES[yr]?.lessons?.[lessonIdx];
  if (!lesson) return [];

  let pack = [];
  if (yr === 'y3' && Y3_WEEK_PUZZLES[lessonIdx]) {
    pack = Y3_WEEK_PUZZLES[lessonIdx];
  } else {
    const year = { y3: 3, y4: 4, y5: 5, y6: 6 }[yr];
    const pup = getPupilMission(year, lessonIdx, lesson.title, lesson.kind, lesson.statutory?.primary || lesson.ukCurriculum?.[0]);
    if (pup?.puzzles?.length) pack = pup.puzzles;
  }

  if (!pack.length) {
    const title = shortTitle(lesson.title);
    const steps = sequenceStepsForLesson(lesson);
    const sprint = {
      type: 'codeRacerSeq',
      title: 'CodeRacer sequence sprint',
      description: 'Short sequence practice — order the steps before the green flag.',
      xp: 15,
      duration: '2 min',
      steps,
      instructions: `Finish this week’s sequence: ${title}.`,
      context: 'CodeRacer · KS2 sequence practice (British English)',
    };
    pack = [sprint, ...themedActivities(lesson, yr, lessonIdx)];
  }

  const coding = codingBlocksPuzzle(yr, lessonIdx);
  if (coding && !pack.some((p) => p.type === 'blocks')) pack = [coding, ...pack];
  return pack.slice(0, 4);
}
