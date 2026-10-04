/** Year 5 teaching content (ages 9–10). Same shape as y3.js. */
export default {
  0: {
    objectives: [
      'I can explain how accounts and passwords protect systems',
      'I can create a strong password using a safe method',
      'I can recognise a phishing message',
    ],
    big: 'Why does a school computer ask who you are before letting you in?',
    explain: [
      'An account tells a system who you are and what you are allowed to do. Logging in proves it is really you — that is called authentication.',
      'Strong passwords are long and hard to guess. A good method is three random words joined together, like “PurpleTrainCactus!”. Never reuse the same password everywhere.',
      'Phishing is a trick message pretending to be from someone you trust, trying to get your password. Warning signs: urgency, spelling mistakes, odd links, and asking for your login.',
    ],
    example: {
      type: 'compare',
      title: 'Weak or strong?',
      left: { label: '❌ Weak', items: ['password', '123456', 'Your pet’s name', 'Your birthday', 'The same password for everything'] },
      right: { label: '✅ Strong', items: ['Three random words: CloudPencilRiver', 'Add a number and symbol: CloudPencilRiver7!', 'Different for each important account', 'Kept secret'] },
    },
    mistake: { wrong: 'Clicking a link in an email that says “Your account will be deleted in 1 hour — log in now!”', fix: 'Urgent messages asking for logins are classic phishing. Don’t click — tell an adult or go to the real website yourself.' },
    tryIt: { q: 'Spot three phishing warning signs: “URGENT!! Your gaem account is locked. Click hear and enter you’re password.”', a: 'Urgency (URGENT!!), spelling mistakes (gaem, hear, you’re) and asking for your password.' },
    realWorld: 'Most cyber attacks start with a phishing message — which is why companies train every employee to spot them.',
    summary: ['Accounts prove who you are', 'Three random words make strong passwords', 'Spot phishing: urgency, errors, asks for logins'],
  },

  1: {
    objectives: [
      'I can write a design document before coding',
      'I can describe inputs, outputs and rules for a program',
      'I can use a design to explain my plan to others',
    ],
    big: 'Would you build a treehouse without a plan? Why do programmers plan?',
    explain: [
      'A design document describes what a program will do before anyone builds it. It saves time because problems are spotted on paper, not after hours of coding.',
      'A good design includes: the goal and audience, screen sketches, inputs and outputs, the rules (algorithm) and the variables you will need.',
      'Others can read your design and give feedback before you start — and you can check your finished program against it.',
    ],
    example: {
      type: 'table',
      title: 'Design document: Times-Table Trainer',
      head: ['Section', 'Plan'],
      rows: [['Goal & audience', 'Help Year 3 practise times tables'], ['Inputs', 'Typed answers'], ['Outputs', 'Question on screen, “Correct!” sound, final score'], ['Rules', '10 random questions; +1 for each correct answer'], ['Variables', 'score, questionNumber, a, b']],
    },
    mistake: { wrong: 'A design with only a picture of the screen.', fix: 'Pictures help, but include the rules and variables — that is what turns into code.' },
    tryIt: { q: 'List the variables a “guess my number” game needs.', a: 'For example: secretNumber, guess, numberOfTries.' },
    realWorld: 'App teams write design documents and get them reviewed before a single developer starts coding.',
    summary: ['Design before you code', 'Goal, inputs, outputs, rules, variables', 'Designs can be checked and improved'],
  },

  2: {
    objectives: [
      'I can use logical reasoning to explain what a program does',
      'I can work out a game strategy using rules',
      'I can explain my reasoning step by step',
    ],
    big: 'In noughts and crosses, is there a move that guarantees you never lose?',
    explain: [
      'Logical reasoning means using facts and rules to work out what must be true — like a detective.',
      'Programmers reason about code: “Because x starts at 0 and goes up by 2 each loop, after 5 loops it must be 10.”',
      'Games are great practice. In “Nim”, players take 1–3 counters and whoever takes the last one wins. Reasoning shows you can always win if you leave your opponent a multiple of 4!',
    ],
    example: {
      type: 'table',
      title: 'Reasoning about Nim (take 1–3; last counter wins)',
      head: ['Counters left on your turn', 'Best move', 'Because…'],
      rows: [['5', 'Take 1', 'Leave 4 — any move they make, you can take the rest'], ['6', 'Take 2', 'Leave 4'], ['7', 'Take 3', 'Leave 4'], ['8', 'No safe move', 'Whatever you take, they can leave you 4']],
    },
    mistake: { wrong: '“I just think it will work.”', fix: 'Give a reason: “It will work BECAUSE…” Reasoning uses evidence, not guesses.' },
    tryIt: { q: 'x = 3. A loop runs 4 times; each time x = x × 2. What is x at the end? Explain how you know.', a: '48. Each loop doubles x: 3 → 6 → 12 → 24 → 48.' },
    realWorld: 'Chess computers reason through millions of possible moves to choose the best one.',
    summary: ['Reasoning uses rules and facts', 'Say “because…”', 'Trace values step by step'],
  },

  3: {
    objectives: [
      'I can use selection to control program flow',
      'I can use if … else if … else for more than two outcomes',
      'I can test every branch of a selection',
    ],
    big: 'A game has three levels of difficulty. How does the code pick the right one?',
    explain: [
      'Selection means the program selects which code to run based on a condition. You already know if and if … else.',
      'When there are more than two outcomes, chain the conditions: if … else if … else. The program checks them in order and runs the FIRST one that is true.',
      'Order matters! Check the most specific condition first.',
    ],
    example: {
      type: 'code',
      title: 'Giving a grade',
      code: 'IF score >= 90\n    say "Gold medal!"\nELSE IF score >= 70\n    say "Silver medal!"\nELSE IF score >= 50\n    say "Bronze medal!"\nELSE\n    say "Keep practising!"',
      caption: 'A score of 75 fails the first test, passes the second, and stops there: Silver.',
    },
    mistake: { wrong: 'Checking score >= 50 first, so a score of 95 gets Bronze.', fix: 'Put the highest (most specific) condition first. The first true condition wins.' },
    tryIt: { q: 'Using the code above, what does a score of 50 get? And 49?', a: '50 → “Bronze medal!” (50 >= 50 is true). 49 → “Keep practising!”' },
    realWorld: 'Online shops use selection to choose delivery: next-day, standard or free, depending on how much you spend.',
    summary: ['Selection chooses which code runs', 'else if handles many outcomes', 'First true condition wins — order matters'],
  },

  4: {
    objectives: [
      'I can debug systematically instead of guessing',
      'I can use print/say statements to see inside a program',
      'I can explain the cause of a bug, not just the symptom',
    ],
    big: 'What is the difference between a symptom and a cause?',
    explain: [
      'A symptom is what you see going wrong (“the score shows 200”). The cause is the actual mistake in the code (“the score increases every frame while touching”).',
      'Systematic debugging follows a method: reproduce the bug, form a hypothesis about the cause, test it, then fix and retest.',
      'Use “say” or “print” to show variable values while the program runs — it lets you see inside the program.',
    ],
    example: {
      type: 'steps',
      title: 'The systematic debugging cycle',
      items: ['Reproduce: make the bug happen on purpose', 'Observe: add say/print to show key variables', 'Hypothesise: “I think it’s because…”', 'Test the hypothesis with one change', 'Fix, then retest the whole program'],
    },
    mistake: { wrong: 'Fixing the symptom: “I’ll just set score back to 10 at the end.”', fix: 'Find the cause. Hiding the symptom leaves the real bug in place.' },
    tryIt: { q: 'Symptom: lives goes from 3 straight to 0 when you touch a spike once. Suggest a likely cause.', a: 'The “change lives by −1” runs every frame while touching. Fix: move the player away or wait after a hit.' },
    realWorld: 'Professional developers use “logging” — printing values while programs run — to find bugs in huge systems.',
    summary: ['Find the cause, not just the symptom', 'Reproduce → observe → hypothesise → test → fix', 'Print values to see inside'],
  },

  6: {
    objectives: [
      'I can plan a physical computing project as a storyboard',
      'I can identify the inputs, processes and outputs',
      'I can write success criteria for a device',
    ],
    big: 'If you could invent a gadget for the classroom, what would it do?',
    explain: [
      'Physical computing means code that senses and controls things in the real world: buttons, lights, motors, buzzers and sensors.',
      'Storyboard how the device is used: who uses it, what happens step by step, and what the device does in response.',
      'Label every input (button, sensor), process (the rules) and output (LED, buzzer, motor).',
    ],
    example: {
      type: 'table',
      title: 'Storyboard: “Quiet Please” noise monitor',
      head: ['Step', 'What happens', 'Type'],
      rows: [['1', 'Microphone measures the noise level', 'Input'], ['2', 'IF level > 70 for 5 seconds…', 'Process'], ['3', '…light turns red and buzzer beeps', 'Output'], ['4', 'ELSE the light stays green', 'Output']],
    },
    mistake: { wrong: 'A gadget idea with no clear input.', fix: 'Every device needs to sense something (input) before it can react.' },
    tryIt: { q: 'Identify the input, process and output for an automatic night light.', a: 'Input: light sensor. Process: IF it is dark THEN… Output: LED turns on.' },
    realWorld: 'Smart doorbells, plant waterers and fitness bands are all physical computing devices.',
    summary: ['Code can control real things', 'Storyboard how it is used', 'Label inputs, processes, outputs'],
  },

  7: {
    objectives: [
      'I can use “repeat until” to loop until a condition is true',
      'I can explain how a game loop works',
      'I can choose between repeat, forever and repeat until',
    ],
    big: 'How many times should a game loop run?',
    explain: [
      'Sometimes we don’t know in advance how many times to repeat. “Repeat until” keeps going until a condition becomes true — then it stops.',
      'Games run a game loop: check inputs, update positions and scores, draw the screen… over and over until the game is over.',
      'Choose the right loop: repeat N when you know the count, forever when it never stops, repeat until when it stops at a condition.',
    ],
    example: {
      type: 'blocks',
      title: 'A game loop that ends',
      blocks: ['when ▶ clicked', 'set lives to 3', 'repeat until lives = 0', '  move 5', '  if touching spike? then', '    change lives by -1', '    go to start', '  end', 'end', 'say Game over!'],
    },
    mistake: { wrong: 'A “repeat until” whose condition can never become true.', fix: 'Make sure something inside the loop changes the condition — otherwise it loops forever.' },
    tryIt: { q: 'Which loop would you use to keep asking a question until the answer is correct?', a: 'repeat until answer = correct answer.' },
    realWorld: 'A kettle repeats heating UNTIL the water reaches 100°C, then switches off.',
    summary: ['repeat until stops at a condition', 'Games run a game loop', 'Pick the loop that fits'],
  },

  8: {
    objectives: [
      'I can use AND to check that two conditions are both true',
      'I can use OR to check that at least one is true',
      'I can predict the result of Boolean expressions',
    ],
    big: 'To go out to play you need your coat AND it must be playtime. Is that the same as coat OR playtime?',
    explain: [
      'A Boolean is a value that can only be true or false. Conditions are Boolean expressions.',
      'AND is true only if BOTH sides are true. OR is true if AT LEAST ONE side is true. NOT flips true and false.',
      'Combining conditions lets programs make smarter decisions: “if answer = 12 OR answer = twelve”.',
    ],
    example: {
      type: 'table',
      title: 'Truth table',
      head: ['A', 'B', 'A AND B', 'A OR B'],
      rows: [['true', 'true', 'true', 'true'], ['true', 'false', 'false', 'true'], ['false', 'true', 'false', 'true'], ['false', 'false', 'false', 'false']],
    },
    mistake: { wrong: 'Using AND when you mean OR: “if answer = 12 AND answer = twelve”.', fix: 'The answer can’t be both at once! Use OR when any one of the options should count.' },
    tryIt: { q: 'age = 10, hasTicket = false. Is (age > 8 AND hasTicket) true? Is (age > 8 OR hasTicket) true?', a: 'AND is false (no ticket). OR is true (age > 8 is true).' },
    realWorld: 'Search engines use AND/OR: “dogs AND training” finds pages with both words.',
    summary: ['Booleans are true or false', 'AND = both, OR = at least one', 'NOT flips the answer'],
  },

  9: {
    objectives: [
      'I can explain common game mechanics such as gravity and collisions',
      'I can use variables to simulate movement',
      'I can adjust values to improve game feel',
    ],
    big: 'How does a game make a character fall back down after jumping?',
    explain: [
      'Game mechanics are the rules that make a game work: gravity, jumping, collisions, timers, power-ups.',
      'Gravity is simulated with a speed variable: each frame, change speed by −1 and change y by speed. The character rises, slows, then falls faster and faster — like real life.',
      'Tweaking the numbers changes the game feel. Stronger gravity feels heavy; weaker gravity feels floaty, like the Moon.',
    ],
    example: {
      type: 'blocks',
      title: 'Jump with gravity',
      blocks: ['when space key pressed', 'set ySpeed to 12', 'repeat until touching ground?', '  change y by ySpeed', '  change ySpeed by -1', 'end'],
      caption: 'Speed starts at +12 (up), drops by 1 every frame, becomes negative (down) until Dot lands.',
    },
    mistake: { wrong: 'Moving the sprite down by a fixed amount, so falling looks robotic.', fix: 'Use a speed variable that changes each frame — that creates natural acceleration.' },
    tryIt: { q: 'What change would make the jump higher?', a: 'Start ySpeed at a bigger number (e.g. 15), or make gravity weaker (change ySpeed by −0.5).' },
    realWorld: 'Game physics engines use these same equations — often borrowed directly from real science.',
    summary: ['Mechanics are the rules of a game', 'Gravity = speed changing every frame', 'Tweak values to change game feel'],
  },

  10: {
    objectives: [
      'I can explain what game state is',
      'I can use a state variable to control what the game is doing',
      'I can switch between states with events',
    ],
    big: 'Is a game doing the same thing on the title screen as during play?',
    explain: [
      'Game state is everything the game needs to remember right now: score, lives, level, position — and which mode it is in.',
      'A state variable stores the mode, such as “menu”, “playing”, “paused” or “gameOver”. Scripts check the state before acting.',
      'Changing one variable switches the whole game’s behaviour cleanly — this keeps big programs organised.',
    ],
    example: {
      type: 'table',
      title: 'State machine for a game',
      head: ['State', 'What happens', 'Changes to…'],
      rows: [['menu', 'Show title, wait for space', 'playing (space pressed)'], ['playing', 'Move, score, check lives', 'paused (P) or gameOver (lives = 0)'], ['paused', 'Everything frozen', 'playing (P again)'], ['gameOver', 'Show score', 'menu (space pressed)']],
    },
    mistake: { wrong: 'Enemies still moving while the game is paused.', fix: 'Wrap enemy movement in “if state = playing”.' },
    tryIt: { q: 'The game is in state “playing” and lives becomes 0. What should the state change to?', a: '“gameOver”.' },
    realWorld: 'Traffic lights, lifts and vending machines are all controlled by state machines.',
    summary: ['Game state is what the game remembers', 'A state variable holds the mode', 'Check state before acting'],
  },

  11: {
    objectives: [
      'I can split code into reusable chunks',
      'I can create and use a custom block (procedure)',
      'I can explain why modular code is easier to fix',
    ],
    big: 'If you wrote the same 10 blocks in five places and found a bug, how many places would you fix?',
    explain: [
      'Modular code splits a program into chunks that each do one job. In block coding these are custom blocks (“My Blocks”); in Python they are functions.',
      'You define a chunk once — like “draw star” — then use it as many times as you like.',
      'If there is a bug, you fix it in one place and every use is fixed. Chunks also give your code readable names.',
    ],
    example: {
      type: 'compare',
      title: 'Define once, use many times',
      left: { label: 'Define it', blocks: true, items: ['define draw square (size)', 'repeat 4', '  move size', '  turn right 90', 'end'] },
      right: { label: 'Use it', blocks: true, items: ['when ▶ clicked', 'pen down', 'draw square (30)', 'draw square (60)', 'draw square (90)'] },
      caption: 'Three different squares from one chunk of code. The input “size” makes it flexible.',
    },
    mistake: { wrong: 'A custom block that tries to do everything.', fix: 'One chunk, one job. “draw house” can use “draw square” and “draw triangle”.' },
    tryIt: { q: 'Which chunks could a “draw a street” program be split into?', a: 'For example: draw house, draw tree, draw car, draw road — and “draw house” could use draw square and draw triangle.' },
    realWorld: 'Huge apps like video-call software are built from thousands of small modules made by different teams.',
    summary: ['Split programs into chunks', 'Define once, use many times', 'Fix once, fixed everywhere'],
  },

  13: {
    objectives: [
      'I can build my physical computing project from my storyboard',
      'I can test inputs and outputs separately',
      'I can evaluate my device against success criteria',
    ],
    big: 'How do you test a device when you can’t see inside it?',
    explain: [
      'Build in layers: first test that each input works (show the sensor value), then each output (turn the LED on), then join them with your rules.',
      'Testing parts separately tells you whether a problem is in the input, the output or the rules.',
      'Finish by checking your success criteria and asking a user to try it.',
    ],
    example: {
      type: 'table',
      title: 'Layer testing the noise monitor',
      head: ['Layer', 'Test', 'Result'],
      rows: [['Input', 'Show microphone level on screen', '✅ 20 quiet, 85 shouting'], ['Output', 'Turn LED red, then green', '✅'], ['Rules', 'Shout for 5 s → red light', '❌ turns red instantly'], ['Fix', 'Add a 5-second timer check', '✅ retested']],
    },
    mistake: { wrong: 'Wiring everything up at once, then nothing works and you don’t know why.', fix: 'Test each layer on its own first.' },
    tryIt: { q: 'Your night light never turns on. The LED works when tested alone. What should you test next?', a: 'The input — display the light-sensor value and check what number “dark” gives.' },
    realWorld: 'Engineers test every component of a car on its own before testing the whole car.',
    summary: ['Build and test in layers', 'Inputs, then outputs, then rules', 'Evaluate with real users'],
  },

  14: {
    objectives: [
      'I can explain what a database is',
      'I can describe records and fields',
      'I can search a database to answer a question',
    ],
    big: 'How does a library find one book among thousands in under a second?',
    explain: [
      'A database is an organised collection of data that a computer can search and sort quickly.',
      'A flat-file database is like one big table. Each row is a record (one thing, like one animal). Each column is a field (one type of information, like weight).',
      'Searches use conditions: “find animals where diet = herbivore AND weight > 100 kg”.',
    ],
    example: {
      type: 'table',
      title: 'Animal database',
      head: ['Name', 'Habitat', 'Diet', 'Weight (kg)'],
      rows: [['Elephant', 'Savannah', 'Herbivore', '6000'], ['Lion', 'Savannah', 'Carnivore', '190'], ['Penguin', 'Antarctic', 'Carnivore', '23'], ['Giraffe', 'Savannah', 'Herbivore', '1200'], ['Panda', 'Forest', 'Herbivore', '100']],
      caption: '5 records, 4 fields. Search: Habitat = Savannah AND Diet = Herbivore → Elephant, Giraffe.',
    },
    mistake: { wrong: 'Mixing units in one field: “6 tonnes”, “190kg”, “23”.', fix: 'Keep each field consistent (all kg as numbers) so the computer can sort and compare.' },
    tryIt: { q: 'Using the table: which animals weigh more than 150 kg?', a: 'Elephant, Lion and Giraffe.' },
    realWorld: 'Your school keeps a database of pupils; hospitals keep databases of patients and medicines.',
    summary: ['A database is organised data', 'Records = rows, fields = columns', 'Search with conditions'],
  },

  15: {
    objectives: [
      'I can sort data to reveal patterns',
      'I can filter data to answer a question',
      'I can interpret results and spot misleading conclusions',
    ],
    big: 'Is the most common answer always the most important?',
    explain: [
      'Sorting puts records in order (smallest to largest, A to Z). It helps you spot the top and bottom quickly.',
      'Filtering shows only the records that match a condition, hiding the rest.',
      'Interpreting means explaining what the data shows — and what it doesn’t. Correlation isn’t always cause: ice-cream sales and sunburn both rise in summer, but ice cream doesn’t cause sunburn!',
    ],
    example: {
      type: 'table',
      title: 'Sorted by minutes of reading (highest first)',
      head: ['Class', 'Avg reading (min/day)', 'Avg screen time (min/day)'],
      rows: [['5B', '42', '60'], ['5A', '35', '75'], ['5C', '28', '95'], ['5D', '20', '110']],
      caption: 'Pattern: classes that read more have less screen time. But the data doesn’t prove one causes the other.',
    },
    mistake: { wrong: '“Screens make you read less — the data proves it.”', fix: 'Say “the data shows a link”. Other things might explain both.' },
    tryIt: { q: 'Filter the table: which classes read more than 30 minutes a day?', a: '5B and 5A.' },
    realWorld: 'Scientists must be careful to separate correlation from cause when testing new medicines.',
    summary: ['Sort to see order', 'Filter to focus', 'A link isn’t always a cause'],
  },

  16: {
    objectives: [
      'I can use lists to store many values in a program',
      'I can loop through a list to process every item',
      'I can explain when to use a list instead of many variables',
    ],
    big: 'How would you store the scores of 30 players — 30 variables?',
    explain: [
      'A data structure is a way of organising data in a program. The list (also called an array) is the most common.',
      'One list can store any number of items. Looping through a list lets the program do something with every item — find the biggest, add them up, check for a match.',
      'Use a list when you have many values of the same kind: names, scores, questions, positions.',
    ],
    example: {
      type: 'code',
      title: 'Find the high score (pseudocode)',
      code: 'scores = [12, 45, 7, 31, 45, 19]\nbest = 0\nFOR EACH score IN scores\n    IF score > best\n        best = score\nSAY "High score: " + best',
      caption: 'The loop visits all 6 scores and remembers the biggest so far: 45.',
    },
    mistake: { wrong: 'Making score1, score2, score3 … score30 variables.', fix: 'Use one list called scores. Loops can handle any number of items.' },
    tryIt: { q: 'scores = [4, 9, 2, 7]. What does the loop above say? What is the total of the list?', a: 'High score: 9. The total is 22.' },
    realWorld: 'Leaderboards in online games are lists sorted by score.',
    summary: ['Lists store many values', 'Loop through to process every item', 'One list beats many variables'],
  },

  17: {
    objectives: [
      'I can evaluate whether online sources are reliable',
      'I can recognise bias and opinion presented as fact',
      'I can use lateral reading to check a source',
    ],
    big: 'Can a website be completely accurate but still give you a one-sided picture?',
    explain: [
      'Reliable sources are accurate, up to date and written by people who know the topic.',
      'Bias means only showing one side, often because the writer wants to persuade you. Look for loaded words (“disgusting”, “amazing”) and missing viewpoints.',
      'Lateral reading: instead of only reading the page, open new tabs and search for what OTHER sources say about the website and its claims.',
    ],
    example: {
      type: 'compare',
      title: 'Fact or opinion?',
      left: { label: '💬 Opinion / biased', items: ['“Homework is a total waste of time.”', '“The best phone ever made.”', 'Only quotes people who agree'] },
      right: { label: '📊 Fact / balanced', items: ['“A 2023 study of 2,000 pupils found…”', '“The phone has a 6-inch screen.”', 'Gives arguments for and against'] },
    },
    mistake: { wrong: 'Judging a website by how professional it looks.', fix: 'Anyone can make a slick website. Check what other sources say about it (lateral reading).' },
    tryIt: { q: 'Turn this opinion into a fact you could check: “Our town has terrible traffic.”', a: 'For example: “It took 25 minutes to drive 2 km through the town centre at 8:30 am on Monday.”' },
    realWorld: 'Professional fact-checkers use lateral reading — they spend more time on other tabs than on the original page.',
    summary: ['Reliable = accurate, current, expert', 'Watch for bias and opinion', 'Read laterally'],
  },

  18: {
    objectives: [
      'I can recognise common online risks such as scams and pressure',
      'I can choose a safe response in tricky situations',
      'I can explain how to report and get help',
    ],
    big: 'What would you do if a new online “friend” asked you to keep a secret?',
    explain: [
      'Being cyber smart means spotting risks: scams that promise prizes, people who pressure you, fake profiles and requests for photos or personal details.',
      'Red flags: someone asks you to keep it secret, to move to a private chat, to send pictures, or makes you feel guilty or scared.',
      'Safe response: stop, don’t reply or send anything, save evidence, block, report in the app, and tell a trusted adult. You are never to blame.',
    ],
    example: {
      type: 'table',
      title: 'Scenario → safe response',
      head: ['Scenario', 'Red flag', 'Safe response'],
      rows: [['“You’ve won a free tablet! Enter your address.”', 'Too good to be true', 'Don’t enter details; close it; tell an adult'], ['A gamer says “Let’s chat on another app, don’t tell your parents.”', 'Secrecy, moving chats', 'Say no, block, report, tell an adult'], ['A friend shares an embarrassing photo of someone', 'Unkind, not consented', 'Don’t share; support the person; tell an adult']],
    },
    mistake: { wrong: '“I’ll get in trouble if I tell, because I clicked it.”', fix: 'Adults want to help, not blame. Telling early stops problems getting bigger.' },
    tryIt: { q: 'Name three red flags that an online contact might not be safe.', a: 'Asks for secrecy; wants to move to a private chat; asks for photos or personal details (also: gifts, pressure, guilt).' },
    realWorld: 'Organisations like Childline (0800 1111) and CEOP help young people who feel unsafe online.',
    summary: ['Know the red flags', 'Stop, save, block, report, tell', 'You are never to blame'],
  },

  20: {
    objectives: [
      'I can investigate a question using a database',
      'I can sort, filter and chart data as evidence',
      'I can present a conclusion and its limits',
    ],
    big: 'What mystery could data help us solve?',
    explain: [
      'In this case you are a data detective. The evidence is in a database; your job is to search, sort and filter it to answer the question.',
      'Record each step of your investigation: what you searched for and what you found — like a detective’s notebook.',
      'Present your conclusion with evidence, and say what the data can’t tell you.',
    ],
    example: {
      type: 'steps',
      title: 'Case: “Why is the library so busy on Thursdays?”',
      items: ['Search: visits by day → Thursday highest (142)', 'Filter: Thursday visits by year group → Year 5 = 60', 'Check timetable: Year 5 has reading club on Thursday', 'Conclusion: reading club explains a big part of the rise', 'Limit: we only had data for one term'],
    },
    mistake: { wrong: 'Picking the answer first and only looking for data that agrees.', fix: 'Follow the evidence. Include data that surprises you.' },
    tryIt: { q: 'Write a limit (something the data can’t tell you) for a survey of 20 pupils about favourite sports.', a: 'For example: “It only asked 20 pupils, so it might not represent the whole school.”' },
    realWorld: 'Police and scientists use databases to find patterns that help solve real cases.',
    summary: ['Search, sort, filter for evidence', 'Record your steps', 'Conclusion + limits'],
  },

  21: {
    objectives: [
      'I can explain the difference between vector and bitmap images',
      'I can create and edit vector graphics',
      'I can combine graphics and video with code',
    ],
    big: 'Why do some pictures go blurry when you make them bigger?',
    explain: [
      'Bitmap images are made of tiny squares called pixels. Zoom in too far and you see the squares — they go blocky.',
      'Vector images are made of shapes described by maths: lines, curves and fills. They stay sharp at any size, which is perfect for logos and game characters.',
      'Code can bring media to life: move vector sprites, play video clips, and change costumes at the right moments.',
    ],
    example: {
      type: 'compare',
      title: 'Bitmap vs vector',
      left: { label: '🟦 Bitmap (pixels)', items: ['Photos', 'Goes blocky when enlarged', 'Edit pixel by pixel', 'Files can be large'] },
      right: { label: '🔷 Vector (shapes)', items: ['Logos, icons, cartoons', 'Sharp at any size', 'Edit shapes and points', 'Usually small files'] },
    },
    mistake: { wrong: 'Using a tiny photo as a full-screen background.', fix: 'Enlarged bitmaps go blurry. Use a bigger image or draw it as a vector.' },
    tryIt: { q: 'A school needs a logo for a website AND a giant banner. Vector or bitmap?', a: 'Vector — it will stay sharp at both sizes.' },
    realWorld: 'Animation studios draw characters as vectors so they look sharp on phones and cinema screens alike.',
    summary: ['Bitmaps are pixels', 'Vectors are shapes', 'Code can animate both'],
  },

  22: {
    objectives: [
      'I can explain the iterative design cycle',
      'I can improve a game using test results',
      'I can record what changed between versions',
    ],
    big: 'Was your favourite game perfect the day it came out?',
    explain: [
      'Iteration means improving something in cycles: design → build → test → evaluate → improve, then round again.',
      'Each version (v1, v2, v3…) should fix problems found in testing or add one planned feature.',
      'Keep a changelog — a list of what changed in each version — so you can explain your improvements.',
    ],
    example: {
      type: 'table',
      title: 'Changelog: Jungle Jump',
      head: ['Version', 'Change', 'Why'],
      rows: [['v1', 'Basic jumping and platforms', 'Core game'], ['v2', 'Gravity weaker, jump higher', 'Testers said level 2 was impossible'], ['v3', 'Added a checkpoint', 'Players hated restarting from the beginning'], ['v4', 'Coins + score', 'Testers wanted a reason to explore']],
    },
    mistake: { wrong: 'Changing ten things between versions.', fix: 'Change a few things per version so you know what made it better (or worse).' },
    tryIt: { q: 'Testers say the game is too easy. Suggest two changes for v5.', a: 'For example: faster enemies, fewer lives, a time limit, or smaller platforms.' },
    realWorld: 'Most apps on your phone update every few weeks — each update is another iteration.',
    summary: ['Design → build → test → improve', 'Small changes per version', 'Keep a changelog'],
  },

  23: {
    objectives: [
      'I can describe roles in a tech team',
      'I can choose a role that suits a task',
      'I can work as a team to meet a shared goal',
    ],
    big: 'Is making an app just about coding?',
    explain: [
      'Real tech projects need many skills. Teams have roles such as project manager, designer, developer, tester and presenter.',
      'Each role has responsibilities. The project manager keeps the plan on track; designers decide how it looks and feels; developers build; testers find bugs.',
      'Teams succeed when everyone knows their job, communicates and helps each other meet the shared goal.',
    ],
    example: {
      type: 'table',
      title: 'Tech team roles',
      head: ['Role', 'Responsibilities'],
      rows: [['Project manager', 'Plan, deadlines, check progress'], ['Designer', 'Sketches, colours, user experience'], ['Developer', 'Writes and debugs the code'], ['Tester', 'Writes test plans, reports bugs'], ['Presenter', 'Explains the product to the audience']],
    },
    mistake: { wrong: 'Everyone wants to be the developer, so nobody tests.', fix: 'Agree roles at the start, and rotate them in future projects.' },
    tryIt: { q: 'The team keeps missing deadlines. Which role should act, and what could they do?', a: 'The project manager — break the work into smaller tasks with dates and check progress each lesson.' },
    realWorld: 'A big video game can have hundreds of people: artists, musicians, writers, coders, testers and producers.',
    summary: ['Tech needs many skills', 'Clear roles and responsibilities', 'Communicate towards one goal'],
  },

  24: {
    objectives: [
      'I can plan a user test',
      'I can collect useful feedback without leading the user',
      'I can turn feedback into improvements',
    ],
    big: 'Why should someone else test your program, not just you?',
    explain: [
      'You know how your program is meant to work, so you won’t make the mistakes a new user makes. User testing shows what real people do.',
      'Give the tester a task (“Try to reach level 2”), then watch quietly. Don’t help! Note where they hesitate, get stuck or smile.',
      'Ask open questions afterwards: “What was confusing?” rather than “Did you like it?”. Then choose the most important improvements.',
    ],
    example: {
      type: 'table',
      title: 'User test notes',
      head: ['Observation', 'Problem', 'Improvement'],
      rows: [['Tester pressed every key to find “jump”', 'Controls unclear', 'Add a controls screen'], ['Stuck on level 1 for 3 minutes', 'Too hard at the start', 'Make the first gap smaller'], ['Laughed at the sound effect', '—', 'Keep it!']],
    },
    mistake: { wrong: 'Asking “You like it, don’t you?”', fix: 'That leads the tester. Ask open questions: “What would you change?”' },
    tryIt: { q: 'Rewrite as an open question: “Was it easy?”', a: 'For example: “Which part was hardest to work out, and why?”' },
    realWorld: 'Companies run “usability labs” where they watch real people use new products.',
    summary: ['Real users find real problems', 'Watch, don’t help', 'Open questions → improvements'],
  },

  25: {
    objectives: [
      'I can describe the parts of a network and what they do',
      'I can explain how a search engine finds and ranks pages',
      'I can explain how networks share resources',
    ],
    big: 'How can a search engine search billions of pages in less than a second?',
    explain: [
      'Networks share resources: files on a server, a printer, an internet connection. Key parts include devices, switches, routers, servers and cables or Wi-Fi.',
      'Search engines don’t search the web live. Programs called crawlers visit pages in advance and build a giant index — like the index at the back of a book.',
      'When you search, the engine looks up your words in the index and ranks results using an algorithm that considers things like relevance and how many trusted pages link to each one.',
    ],
    example: {
      type: 'steps',
      title: 'How a search engine works',
      items: ['Crawl: bots follow links to discover pages', 'Index: record which words appear on which pages', 'Search: look up your key words in the index', 'Rank: order results by relevance and trust', 'Show: display the results (with adverts marked)'],
    },
    mistake: { wrong: '“The top result is the most true.”', fix: 'It’s the highest ranked by an algorithm — which can be gamed by advertisers and popular-but-wrong pages.' },
    tryIt: { q: 'Why can a search engine answer so fast if the web is enormous?', a: 'Because it searches its pre-built index, not the live web.' },
    realWorld: 'Search engines crawl hundreds of billions of pages and update their index constantly.',
    summary: ['Networks share resources', 'Crawl → index → rank', 'Ranking isn’t the same as truth'],
  },

  27: {
    objectives: [
      'I can plan a micro-site for a campaign',
      'I can write persuasive, accurate content for an audience',
      'I can link pages so users can navigate easily',
    ],
    big: 'What would you campaign for in our school or community?',
    explain: [
      'A campaign tries to change what people think or do, such as “Walk to School Week”. A micro-site is a small website (3–4 pages) for one campaign.',
      'Content should be persuasive AND accurate: use real facts, clear calls to action (“Sign up!”), and images you have permission to use.',
      'Plan navigation: every page links to the others with a clear menu, so users never get lost.',
    ],
    example: {
      type: 'table',
      title: 'Site map: “Walk to School Week”',
      head: ['Page', 'Purpose', 'Call to action'],
      rows: [['Home', 'Hook + key fact', '“Join the challenge!”'], ['Why walk?', 'Health and environment facts', '“Read the facts”'], ['Safe routes', 'Map and road-safety tips', '“Plan your route”'], ['Sign up', 'Pledge form', '“Make your pledge”']],
    },
    mistake: { wrong: 'Persuasion with made-up statistics.', fix: 'Persuasive doesn’t mean untrue. Use real facts and say where they came from.' },
    tryIt: { q: 'Write a call to action for a “Switch it off” energy campaign.', a: 'For example: “Be a Power Ranger — switch off lights when you leave the room this week!”' },
    realWorld: 'Charities build micro-sites for appeals; good ones raise millions by being clear and trustworthy.',
    summary: ['Campaigns aim to change minds or actions', 'Persuasive and accurate', 'Clear navigation'],
  },

  28: {
    objectives: [
      'I can write quizzes with nested and combined conditions',
      'I can accept different correct versions of an answer',
      'I can give helpful feedback based on the answer',
    ],
    big: 'How could a quiz give a helpful hint when you are close to the right answer?',
    explain: [
      'Deep selection combines everything: if … else if … else, AND, OR, and conditions inside conditions (nesting).',
      'Good quizzes accept reasonable answers: “Paris” OR “paris” OR “PARIS”. Many languages have a way to ignore capitals.',
      'Clever feedback checks HOW wrong an answer is: if the guess is within 2 of the answer, say “So close!”.',
    ],
    example: {
      type: 'code',
      title: 'Quiz feedback with selection',
      code: 'ASK "How many legs does a spider have?"\nIF answer = 8 OR answer = "eight"\n    SAY "Correct!"\n    score = score + 1\nELSE IF answer = 6\n    SAY "That’s an insect. Spiders have more!"\nELSE IF answer > 6 AND answer < 10\n    SAY "So close!"\nELSE\n    SAY "Not quite — it’s 8."',
    },
    mistake: { wrong: 'Marking “Eight” wrong because the code only checks “eight”.', fix: 'Accept different forms of a correct answer, or convert the answer to lower case first.' },
    tryIt: { q: 'Using the code: what is said if the answer is 6? 9? 20?', a: '6 → “That’s an insect. Spiders have more!”; 9 → “So close!”; 20 → “Not quite — it’s 8.”' },
    realWorld: 'Online learning apps give targeted hints using exactly this kind of selection.',
    summary: ['Combine and nest conditions', 'Accept different correct forms', 'Feedback that helps'],
  },

  29: {
    objectives: [
      'I can explain how sensors turn the world into numbers',
      'I can use thresholds to make decisions from sensor data',
      'I can simulate a sensor in a program',
    ],
    big: 'How does a phone know to turn its screen dimmer in a dark room?',
    explain: [
      'Sensors measure the real world and turn it into numbers: light level, temperature, distance, tilt, sound.',
      'Programs make decisions using thresholds — boundary values. IF light < 30 THEN it’s dark.',
      'We can simulate sensors in code by using a variable (or a slider) for the reading, then test our rules before building the real device.',
    ],
    example: {
      type: 'code',
      title: 'Simulated parking sensor',
      code: 'distance = 25   # pretend sensor reading in cm\n\nif distance < 10:\n    print("BEEEEP — stop!")\nelif distance < 30:\n    print("beep beep")\nelse:\n    print("all clear")',
      caption: 'Change the distance value to test every threshold before using a real sensor.',
    },
    mistake: { wrong: 'Choosing thresholds without testing real readings.', fix: 'Measure actual values first (what number is “dark” in your room?) then set the threshold.' },
    tryIt: { q: 'What does the program print when distance = 9, 10 and 45?', a: '9 → “BEEEEP — stop!”; 10 → “beep beep” (10 is not less than 10); 45 → “all clear”.' },
    realWorld: 'Cars use distance sensors with thresholds to beep faster as you get closer when parking.',
    summary: ['Sensors turn the world into numbers', 'Thresholds turn numbers into decisions', 'Simulate before you build'],
  },

  30: {
    objectives: [
      'I can read a Python program and explain each line',
      'I can predict the output before running it',
      'I can change one line and predict the new output',
    ],
    big: 'Can you understand a language you have never been taught, just by reading it carefully?',
    explain: [
      'Python is a text-based programming language used by real programmers, scientists and game makers. Instead of snapping blocks, we type instructions.',
      'Python runs top to bottom, like blocks. print() shows something on the screen. A variable is created with = (for example steps = 3).',
      'The best way to learn: read → predict → run → change one thing → predict again. This is called PRIMM.',
    ],
    example: {
      type: 'code',
      title: 'Read and predict',
      code: 'name = "Dot"\nsteps = 3\nprint(name, "is ready")\nprint("Steps:", steps * 2)',
      caption: 'Prediction: “Dot is ready” then “Steps: 6”. The * means multiply.',
    },
    mistake: { wrong: 'Forgetting the quote marks: print(Hello).', fix: 'Text must be inside quotes: print("Hello"). Without quotes Python thinks Hello is a variable.' },
    tryIt: { q: 'Change line 2 to steps = 10. What will the last line print now?', a: 'Steps: 20' },
    realWorld: 'Python is used by NASA, Netflix and scientists studying climate change.',
    summary: ['Python is typed, top to bottom', 'print() shows output; = stores a value', 'Read → predict → run → change'],
  },

  31: {
    objectives: [
      'I can write a Python script that uses variables',
      'I can print text and variables together',
      'I can change variables and explain the effect',
    ],
    big: 'How could a robot introduce itself using code?',
    explain: [
      'Variables in Python are created by giving them a value: battery = 80. They can store numbers or text (strings, in quotes).',
      'print() can show text and variables together, separated by commas: print("Battery:", battery).',
      'Variables can be changed and used in calculations: battery = battery - 10 takes 10 away.',
    ],
    example: {
      type: 'code',
      title: 'Robot status report',
      code: 'name = "Dot"\nbattery = 80\nprint(name, "reporting for duty!")\nbattery = battery - 15\nprint("Battery left:", battery, "%")',
      caption: 'Output: “Dot reporting for duty!” then “Battery left: 65 %”.',
    },
    mistake: { wrong: 'Writing battery - 15 on its own and expecting battery to change.', fix: 'You must store the result: battery = battery - 15.' },
    tryIt: { q: 'coins = 5, then coins = coins * 3, then coins = coins - 2. What is coins?', a: '13  (5 × 3 = 15, 15 − 2 = 13)' },
    realWorld: 'Every app you use is full of variables: your username, your volume level, your battery percentage.',
    summary: ['Variables store numbers or text', 'print() can mix text and variables', 'x = x − 1 changes a variable'],
  },

  32: {
    objectives: [
      'I can model a real-world system with code',
      'I can use variables, loops and selection in a simulation',
      'I can change inputs to test “what if?” questions',
    ],
    big: 'How could we find out what happens to a pond’s fish over 10 years without waiting 10 years?',
    explain: [
      'A simulation uses code to model a real system over time. Each loop is one step of time — a day, a month, a year.',
      'Variables hold the state (number of fish); rules inside the loop change it (fish are born, some are eaten); selection handles events (IF the pond is too crowded THEN fewer babies).',
      'Change the starting values to ask “what if?”. Simulations can’t be perfect, but they help us understand and predict.',
    ],
    example: {
      type: 'code',
      title: 'Fish pond simulation',
      code: 'fish = 20\nfor year in range(1, 6):\n    fish = fish + fish // 2      # babies\n    if fish > 60:\n        fish = 60                # pond is full\n    print("Year", year, ":", fish, "fish")',
      caption: 'Output grows 30, 45, 60, 60, 60 — the pond limit stops the population growing forever.',
    },
    mistake: { wrong: 'Believing a simulation is exactly what will happen.', fix: 'Simulations are models with simplified rules. They show likely trends, not certain facts.' },
    tryIt: { q: 'If the pond limit were 100 instead of 60, what would year 4 be?', a: '100. Year 3 = 67, then year 4 = 67 + 33 = 100 — exactly the limit, so nothing is cut.' },
    realWorld: 'Weather forecasts, pandemic planning and climate predictions all come from computer simulations.',
    summary: ['Simulations model systems over time', 'Variables + loops + selection', 'Ask “what if?” by changing inputs'],
  },

  34: {
    objectives: [
      'I can plan a game or quiz product for a real audience',
      'I can write a design document with success criteria',
      'I can plan which programming constructs I will use',
    ],
    big: 'Who will use your product — and what do they need it to do?',
    explain: [
      'A product is made for real users. Start with the audience and their need: “Year 2 need fun phonics practice.”',
      'Your design document includes: audience, features (must-have and nice-to-have), screens, variables and data structures, and success criteria.',
      'Plan milestones for each build lesson, with the must-haves first.',
    ],
    example: {
      type: 'table',
      title: 'Product plan: Phonics Pop',
      head: ['Feature', 'Priority', 'Construct'],
      rows: [['Shows a word, plays its sound', 'Must', 'Events, media'], ['Player picks the matching picture', 'Must', 'Selection'], ['Score and 3 lives', 'Must', 'Variables, repeat until'], ['10 random questions', 'Must', 'List, random'], ['Leaderboard', 'Nice', 'List, sorting']],
    },
    mistake: { wrong: 'Planning only nice-to-have features that look cool.', fix: 'Must-haves first: what does the user need for the product to work at all?' },
    tryIt: { q: 'Which construct would store 10 quiz questions?', a: 'A list.' },
    realWorld: 'Product managers in tech companies sort features into must-have and nice-to-have every week.',
    summary: ['Start with audience and need', 'Must-haves before nice-to-haves', 'Plan constructs and milestones'],
  },

  35: {
    objectives: [
      'I can build my product using modular code',
      'I can test systematically using a test plan',
      'I can track progress against milestones',
    ],
    big: 'Halfway through a build, how do you know if you are on track?',
    explain: [
      'Build each must-have feature as its own chunk (custom block or function) so it can be tested separately.',
      'Run your test plan after every milestone, including unusual inputs.',
      'Check progress against milestones. If you are behind, cut a nice-to-have — never the testing.',
    ],
    example: {
      type: 'table',
      title: 'Milestone tracker',
      head: ['Milestone', 'Status', 'Tests'],
      rows: [['Question display + sound', '✅ done', '5/5 pass'], ['Picture choice + feedback', '✅ done', '4/5 — fix capitals'], ['Score and lives', '🔄 in progress', '—'], ['Leaderboard', '✂️ cut', 'Out of time — v2']],
    },
    mistake: { wrong: 'Skipping tests to finish more features.', fix: 'A product with fewer features that works beats lots of features that crash.' },
    tryIt: { q: 'You have one lesson left and two features unfinished: lives (must) and themes (nice). What do you do?', a: 'Finish and test lives; leave themes for a future version.' },
    realWorld: 'Software teams “cut scope” all the time to release on time with quality.',
    summary: ['Build in chunks', 'Test after every milestone', 'Cut nice-to-haves, not testing'],
  },

  36: {
    objectives: [
      'I can launch my product to its audience',
      'I can explain my design decisions and code',
      'I can evaluate my product using user feedback',
    ],
    big: 'How will you know if your product was a success?',
    explain: [
      'Launching means sharing your product with real users and explaining it clearly.',
      'In your pitch, cover: the problem, your solution, a demo, one clever bit of code, and what testing showed.',
      'Evaluate with evidence from users: did they reach the goal? What did they enjoy? What would you build next?',
    ],
    example: {
      type: 'steps',
      title: 'Launch pitch (2 minutes)',
      items: ['The problem: who needs this and why', 'Our solution: what it does', 'Live demo', 'Code spotlight: one construct and why we chose it', 'Evidence: what user testing showed', 'Next version: what we would add'],
    },
    mistake: { wrong: '“Everyone loved it.”', fix: 'Use evidence: “8 of 10 testers finished level 1; 3 asked for harder words.”' },
    tryIt: { q: 'Write a code spotlight sentence for a quiz that uses a list.', a: 'For example: “We stored the questions in a list, so adding a new question only means adding one item.”' },
    realWorld: 'Start-ups pitch products to investors using almost exactly this structure.',
    summary: ['Problem → solution → demo', 'Explain your code choices', 'Evaluate with evidence'],
  },

  37: {
    objectives: [
      'I can showcase my best work from Year 5',
      'I can explain my growth as a programmer',
      'I can set a goal for Year 6',
    ],
    big: 'Which piece of work shows best how you think like a computer scientist?',
    explain: [
      'Year 5 took you from blocks towards text: selection, Boolean logic, game state, modular code, databases — and your first Python.',
      'Showcase one piece and explain the thinking behind it: the problem, your design, a bug you beat.',
      'Set yourself a goal for Year 6 — a skill you want to master.',
    ],
    example: {
      type: 'table',
      title: 'Year 5 big ideas',
      head: ['Idea', 'In a sentence'],
      rows: [['Selection', 'Choosing which code runs'], ['Boolean logic', 'AND, OR, NOT with true/false'], ['Game state', 'One variable for the game’s mode'], ['Modular code', 'Define once, use many times'], ['Databases', 'Records and fields you can search'], ['Python', 'Typed code: print, variables, if']],
    },
    mistake: { wrong: 'Choosing the prettiest project instead of the one you learned most from.', fix: 'Pick the work that shows your thinking — even if it isn’t perfect.' },
    tryIt: { q: 'Which Year 5 idea lets you fix a bug once for every place a chunk of code is used?', a: 'Modular code (custom blocks / functions).' },
    realWorld: 'Year 6 brings functions, complex conditions, data analysis and a full system capstone.',
    summary: ['Show your thinking', 'Celebrate growth', 'Set a Year 6 goal'],
  },
};
