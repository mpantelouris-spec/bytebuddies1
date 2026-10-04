/**
 * Plain-English teaching language for KS2 lessons and cover / supply notes.
 */

const VOCAB_DEFS = {
  device: 'A computer, tablet or other machine used in computing.',
  password: 'A secret that lets only you into an account. Never share it.',
  private: 'Information that should stay with you and trusted adults, not on the internet.',
  'trusted adult': 'A grown-up at school or home who will help if something worries you.',
  respect: 'Treating people and their work kindly.',
  responsibility: 'Doing the right thing with technology even when nobody is watching.',
  algorithm: 'A list of steps in a sensible order to reach a goal.',
  sequence: 'Doing instructions one after another, in order.',
  order: 'Which step comes first, next and last.',
  step: 'One small instruction in a list.',
  goal: 'What you want the program or algorithm to achieve.',
  predict: 'Guess what will happen before you run it.',
  trace: 'Follow each line with a finger and say what it does.',
  output: 'What the program shows, says or does after it runs.',
  reasoning: 'Explaining why you think something will happen.',
  check: 'Look back and see if you were right.',
  block: 'A puzzle piece of code you snap together.',
  sprite: 'A character or picture on the stage that the code can move.',
  run: 'Start the program and watch what it does.',
  reset: 'Put everything back to the start so you can try again.',
  event: 'Something that starts code, such as clicking the green flag.',
  debug: 'Find a mistake and fix it, then test again.',
  bug: 'A mistake that makes the program do the wrong thing.',
  error: 'When the program does not do what you planned.',
  fix: 'Change the one thing that is wrong.',
  test: 'Try it on purpose to see if it works.',
  review: 'Go back over ideas so they stick.',
  retrieve: 'Remember something without looking it up.',
  explain: 'Say it so someone else can understand.',
  apply: 'Use the idea in a new task.',
  evidence: 'Proof from your work, not a guess.',
  criteria: 'The list of what “finished and good” looks like.',
  audience: 'The people who will see or play your work.',
  prototype: 'A first version you can test, not the final masterpiece.',
  feedback: 'Kind, specific comments that help someone improve.',
  iterate: 'Change a little, test, then change again.',
  loop: 'A block that repeats a set of steps.',
  repeat: 'Do the same steps more than once.',
  efficient: 'Getting the same result with fewer, clearer steps.',
  pattern: 'Something that happens again and again in a regular way.',
  iteration: 'One time through a loop.',
  forever: 'A loop that does not stop unless you stop the program.',
  start: 'The first thing that makes the code run.',
  click: 'Pressing a button, flag or sprite with the mouse.',
  trigger: 'The thing that makes the next bit of code happen.',
  response: 'What the program does after an event.',
  interactive: 'The program listens to you (clicks, keys, sensors).',
  variable: 'A named box that stores a value which can change, like a score.',
  store: 'Keep a value so you can use it later.',
  score: 'A number that goes up or down as you play.',
  change: 'Add to or take away from a stored value.',
  value: 'What is currently in the variable box.',
  counter: 'A variable used to count how many times something happened.',
  decompose: 'Chop a big job into smaller jobs you can finish.',
  'sub-task': 'One small job that is part of a bigger project.',
  plan: 'Decide the steps on paper before you code.',
  phase: 'One stage of a project, such as plan, build, test.',
  data: 'Facts collected on purpose to answer a question.',
  collect: 'Gather facts carefully, without private details.',
  record: 'Write the facts down so you do not lose them.',
  chart: 'A picture of data, such as a bar chart, so you can compare.',
  question: 'What you are trying to find out.',
  search: 'Looking for information using school-approved tools.',
  source: 'Where a piece of information came from.',
  trust: 'Whether you can reasonably believe a source.',
  bias: 'When something is written to push one view or to sell something.',
  compare: 'Look at two sources and see if they agree.',
  kindness: 'Being helpful and fair in comments and messages.',
  privacy: 'Keeping personal details off the public internet.',
  report: 'Tell a trusted adult or use the school reporting route.',
  bullying: 'Repeated unkind behaviour, including online.',
  consent: 'Permission before you share a photo or information about someone.',
  network: 'Devices linked so they can share messages.',
  internet: 'Lots of networks joined together across the world.',
  packet: 'A small parcel of a message that travels across a network.',
  server: 'A computer that stores and sends information other devices ask for.',
  'Wi-Fi': 'A wireless way devices join a network.',
  if: 'A check: only do this if the condition is true.',
  else: 'What to do when the “if” is not true.',
  condition: 'The yes/no check a program makes, such as “score > 10”.',
  choice: 'Picking one path or another.',
  true: 'The condition is yes.',
  false: 'The condition is no.',
  Python: 'A text language where you type instructions instead of snapping blocks.',
  line: 'One instruction in a text program.',
  print: 'A Python command that shows something on the screen.',
  program: 'A set of instructions a computer can follow.',
  computer: 'A machine that follows instructions exactly.',
  solve: 'Find a way that works.',
  create: 'Make something new on purpose.',
  pseudocode: 'Plain-language steps that look a bit like code, written before the real program.',
  detail: 'Enough information that someone else could follow it.',
};

export function vocabDef(word) {
  const key = String(word || '').trim();
  if (VOCAB_DEFS[key]) return VOCAB_DEFS[key];
  const lower = key.toLowerCase();
  const hit = Object.keys(VOCAB_DEFS).find((k) => k.toLowerCase() === lower);
  if (hit) return VOCAB_DEFS[hit];
  return `A word we use this week when we talk about ${key}.`;
}

export function kidObjectives(title, primary, coding, kind) {
  if (kind === 'review') {
    return [
      'Remember the important words from this unit and say them in a sentence',
      'Teach a partner one idea using a real example',
      'Finish a short mixed task (paper or screen) and say which part was hardest',
    ];
  }
  if (kind === 'showcase') {
    return [
      'Show your work clearly so someone else understands it',
      'Give one kind, specific comment to another pupil',
      'Thank a helper and follow the class safety rules while sharing',
    ];
  }
  if (kind === 'mini' || kind === 'capstone') {
    return [
      `Plan ${title} as small jobs, not one giant job`,
      'Build only this week’s milestone and test it',
      'Say what still needs fixing next lesson',
    ];
  }
  const byStrand = {
    'DL-1': [
      `Talk about “${title}” using kind, safe language`,
      'Name a trusted adult at school you could tell',
      'Say what to do if something on a screen worries you',
    ],
    'CS-1': [
      `Break “${title}” into small, numbered steps`,
      'Put those steps in an order that would actually work',
      'Check a partner can follow your steps without extra help',
    ],
    'CS-2': coding
      ? [
        `Build a short program that shows “${title}”`,
        'Run it and say what each main block does',
        'Change one thing, predict, then test',
      ]
      : [
        `Explain “${title}” with a real-life example`,
        'Put the steps in the right order on paper',
        'Spot what would go wrong if a step is missing',
      ],
    'CS-3': [
      `Predict what will happen in “${title}” before you run or act it out`,
      'Point to the step where a prediction went wrong',
      'Fix one thing only, then test again',
    ],
    'IT-1': [
      `Explain “${title}” as devices sharing messages`,
      'Give one reason we do not share passwords on a network',
      'Describe what happens if one link in the chain breaks',
    ],
    'IT-2': [
      `For “${title}”, use two sources before you believe an answer`,
      'Say who wrote a page (or that you cannot tell)',
      'Spot a result that might be an advert',
    ],
    'IT-3': [
      `Collect or show information for “${title}” without private details`,
      'Make a table, tally or chart someone else can read',
      'Write one sentence of what the information shows',
    ],
  };
  return byStrand[primary] || [
    `Explain “${title}” in your own words`,
    'Complete the talk task and the try-it task',
    'Show you understood with the exit quiz',
  ];
}

export function plainAbout(title, year, primary, kind, coding) {
  if (kind === 'review') {
    return `This is a check lesson, not a new topic. Year ${year} prove they remember the unit, teach a partner, and try a short mixed task. Title: ${title}.`;
  }
  if (kind === 'showcase') {
    return `Sharing day for Year ${year}: ${title}. Children show their work kindly, listen to others, and keep class safety rules. It is a celebration, not a test.`;
  }
  if (kind === 'mini' || kind === 'capstone') {
    return `A make-it lesson for Year ${year}: ${title}. They plan on paper, build only this week’s part, then test. Unfinished work is fine if the plan is clear.`;
  }
  const strand = {
    'DL-1': `Year ${year} learn how to stay kind and safe. This week is “${title}”. They practise what to say and who to tell. You do not need to be a computing specialist.`,
    'CS-1': `Year ${year} learn to chop a job into steps. This week is “${title}”. If the order is wrong, it will not work — that is the point of the lesson.`,
    'CS-2': coding
      ? `Year ${year} write a short program about “${title}”. First they talk and use paper, then they try it on screen if logins work.`
      : `Year ${year} learn how instructions work for “${title}”. Paper and talk are enough if devices are not ready.`,
    'CS-3': `Year ${year} practise guessing, checking and fixing. This week is “${title}”. Change one thing at a time — do not start again from scratch.`,
    'IT-1': `Year ${year} learn how devices pass messages. This week is “${title}”. Keep it concrete (string, paper notes, a simple diagram).`,
    'IT-2': `Year ${year} learn not to believe the first result. This week is “${title}”. Use only school-approved search. No personal searches.`,
    'IT-3': `Year ${year} collect or present information for “${title}”. No full names, addresses or real passwords in the examples.`,
  };
  return strand[primary] || `Year ${year} learn “${title}”. Keep the hour practical: talk, try, check.`;
}

export function kidConcept(primary, title, about) {
  if (about && !/pupils engage with/i.test(about) && !/^topic:/i.test(about) && !/^project lesson:/i.test(about) && !/^this review lesson/i.test(about)) {
    const first = String(about).split(/(?<=\.)\s/)[0];
    if (first && first.length < 220) {
      return first
        .replace(/^Pupils learn /, 'You will learn ')
        .replace(/^Pupils /, 'You ')
        .replace(/^This review lesson consolidates the unit\. /, 'No new topic today. ')
        .replace(/^Project lesson: /, '');
    }
  }
  const map = {
    'DL-1': 'Kind and safe comes first. If something worries you, tell a trusted adult.',
    'CS-1': 'Big jobs are easier when you chop them into small steps in the right order.',
    'CS-2': 'A program is instructions. The computer does exactly what you asked — even the mistakes.',
    'CS-3': 'Guess first, then run, then fix one thing. That is how you find bugs.',
    'IT-1': 'Messages hop from one device to another. That hop is a network.',
    'IT-2': 'Two pages can disagree. Check who wrote it before you believe it.',
    'IT-3': 'Data is facts we collect on purpose — not private details.',
  };
  return `${map[primary] || 'Talk, try, check.'} Today: ${title}.`;
}

export function buildTeachScript({
  year, title, kind, primary, about, objectives, pupilHook, coding, vocabulary,
}) {
  const obj = (objectives || []).filter(Boolean);
  const words = (vocabulary || []).map((v) => (typeof v === 'string' ? v : v.word)).filter(Boolean);
  const idea = kidConcept(primary, title, about);
  const lines = [];
  lines.push(`Read this out:\n“${pupilHook || `Today we are learning ${title}.`}”`);
  lines.push(`Then say it in your own words:\n${idea}`);
  if (words.length) {
    const gloss = words.slice(0, 6).map((w) => `${w} — ${vocabDef(w)}`).join('\n');
    lines.push(`Write these words up and read the meanings:\n${gloss}`);
  }
  if (obj.length) {
    lines.push(`Tell them what “finished” looks like:\n${obj.map((o, i) => `${i + 1}. ${o}`).join('\n')}`);
  }
  if (coding) {
    lines.push('After the talk task, open ByteBuddies if logins work. If they do not, stay on paper — that still counts as the lesson.');
  } else {
    lines.push('This week is talk and paper first. Devices are optional.');
  }
  if (primary === 'DL-1') {
    lines.push('This is a safety lesson. Use “trusted adult” the way your school does. Do not collect home addresses or real passwords as class examples.');
  }
  lines.push(`You are teaching Year ${year}: ${title}. You do not need extra computing knowledge beyond this page.`);
  return lines.join('\n\n');
}

export function buildCoverNotes({
  year, title, kind, primary, pupilHook, activities = [], objectives = [],
  extension, quiz, nextTitle, coding, estimatedMinutes,
}) {
  const act1 = activities[0];
  const act2 = activities[1];
  const q1 = quiz?.[0]?.q;
  const mins = estimatedMinutes || 55;
  const safety = primary === 'DL-1';
  const doInOrder = [
    `Minutes 0–5: Sit them down. Read the starter sentence out loud. (It is on this page.)`,
    `Minutes 5–15: Teach using the “Say this when you teach” script on the Plan tab. Ask two children to repeat the idea in their own words.`,
    act1
      ? `Minutes 15–30: Do “${act1.title}”. This works even if computers are off. Follow the numbered steps on the lesson page.`
      : 'Minutes 15–30: Do the first activity on the lesson page.',
    act2
      ? `Minutes 30–45: If they are coping, do “${act2.title}”. If the class is unsettled, skip this and go to the quiz.`
      : 'Minutes 30–45: Second activity if there is time.',
    q1
      ? `Minutes 45–${mins}: Ask this out loud (do not show the Answer key tab): “${q1}” Then let them try the on-screen quiz if devices work.`
      : `Minutes 45–${mins}: Exit: ask one child to explain today’s idea in one sentence.`,
  ];
  return {
    whoThisIsFor: 'Anyone covering this class — you do not need to be a computing teacher.',
    whatThisHourIs: plainAbout(title, year, primary, kind, coding),
    sayAtTheStart: pupilHook || `Today we are learning ${title}.`,
    doInOrder,
    ifComputersFail: act1
      ? `Stay on “${act1.title}”. Skip the coding lab. Photograph or collect paper work.`
      : 'Stay on paper. Skip anything that needs a login.',
    ifTheyFinishEarly: extension || 'Ask them to write a 4-step instruction card for a younger child.',
    howYouKnowItWorked: objectives[0]
      ? `Most children can: ${objectives[0].charAt(0).toLowerCase()}${objectives[0].slice(1)}.`
      : 'Most children can explain today’s idea to a partner.',
    watchFor: safety
      ? 'If a child talks about something worrying online or at home, stop the discussion, thank them, and follow your school safeguarding policy. Do not investigate in front of the class.'
      : 'If someone is stuck, ask them to show the last step that worked. Change one thing only.',
    leaveForTheTeacher: 'Leave a short note: who found it hard, who finished the stretch, and any safeguarding concern (follow school policy — do not write secrets on a sticky note left on the desk).',
    nextWeek: nextTitle ? `Next week the class teacher has: ${nextTitle}.` : 'This is the last week in the year scheme.',
  };
}
