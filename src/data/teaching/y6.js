/** Year 6 teaching content (ages 10–11). Same shape as y3.js. */
export default {
  0: {
    objectives: [
      'I can choose suitable tools for collaborating online',
      'I can explain my rights and responsibilities as a digital citizen',
      'I can respond responsibly when things go wrong online',
    ],
    big: 'What makes someone a good citizen online — and is it different from offline?',
    explain: [
      'A digital citizen uses technology responsibly, respectfully and safely. Online communities have rules, just like real ones.',
      'Rights include privacy and being treated with respect. Responsibilities include crediting other people’s work, protecting your accounts and standing up for others.',
      'When collaborating, use shared tools with sensible permissions, communicate clearly, and resolve disagreements respectfully — in the comments, not by deleting work.',
    ],
    example: {
      type: 'table',
      title: 'Rights and responsibilities',
      head: ['I have the right to…', 'So I have the responsibility to…'],
      rows: [['Privacy', 'Respect other people’s privacy'], ['Be treated kindly', 'Be kind and report unkindness'], ['Get credit for my work', 'Credit others and not copy'], ['Feel safe', 'Tell an adult when something is wrong']],
    },
    mistake: { wrong: '“It was just a joke” after posting something hurtful.', fix: 'Impact matters more than intention. Apologise, remove it if you can, and think first next time.' },
    tryIt: { q: 'You see a classmate being excluded from a group chat with mean comments. What could an upstander do?', a: 'Don’t join in; message the person kindly; save evidence; tell a trusted adult.' },
    realWorld: 'Online communities like Wikipedia work because millions of digital citizens follow shared rules.',
    summary: ['Rights come with responsibilities', 'Credit, respect, protect', 'Be an upstander'],
  },

  1: {
    objectives: [
      'I can recognise common algorithm patterns in real apps',
      'I can explain how searching and sorting algorithms work',
      'I can compare two algorithms for the same task',
    ],
    big: 'How does a music app find one song among 100 million in an instant?',
    explain: [
      'Many apps reuse a small number of algorithm patterns: searching, sorting, matching and recommending.',
      'Linear search checks items one by one. Binary search works on SORTED data: check the middle, throw away the half that can’t contain the answer, repeat. It is far faster on big lists.',
      'Sorting algorithms put data in order so other algorithms can work faster. Different algorithms can solve the same problem with very different speeds.',
    ],
    example: {
      type: 'table',
      title: 'Find 73 in a sorted list of 1–100',
      head: ['Guess', 'Result', 'Range left'],
      rows: [['50', 'Too low', '51–100'], ['75', 'Too high', '51–74'], ['62', 'Too low', '63–74'], ['68', 'Too low', '69–74'], ['71', 'Too low', '72–74'], ['73', 'Found! ✅', '6 guesses (linear search could need 73)']],
    },
    mistake: { wrong: 'Using binary search on unsorted data.', fix: 'Binary search only works if the data is sorted first.' },
    tryIt: { q: 'With binary search, about how many guesses are needed to find a number between 1 and 1,000?', a: 'About 10 — each guess halves the range: 1000 → 500 → 250 → … → 1.' },
    realWorld: 'Contacts apps, dictionaries and databases all use searching and sorting algorithms millions of times a day.',
    summary: ['Apps reuse algorithm patterns', 'Binary search halves the problem each step', 'Algorithms differ in efficiency'],
  },

  2: {
    objectives: [
      'I can explain precisely what a piece of code does',
      'I can justify why code is written a particular way',
      'I can use technical vocabulary accurately',
    ],
    big: 'Is it enough for code to work — or should you be able to explain it?',
    explain: [
      'Explaining code means describing what each part does and how the parts work together.',
      'Justifying code means giving reasons: “I used a repeat until loop because we don’t know how many guesses it will take.”',
      'Use precise vocabulary — variable, condition, iteration, selection, function, parameter — so other programmers understand you exactly.',
    ],
    example: {
      type: 'code',
      title: 'Explain and justify',
      code: 'secret = 7\nguess = 0\ntries = 0\nwhile guess != secret:\n    guess = int(input("Guess: "))\n    tries = tries + 1\nprint("Got it in", tries, "tries")',
      caption: 'Explain: the while loop repeats until guess equals secret, counting tries. Justify: a while loop fits because we can’t know how many guesses are needed.',
    },
    mistake: { wrong: '“This bit does the thing with the numbers.”', fix: 'Be precise: “This line increases the variable tries by 1 on each iteration.”' },
    tryIt: { q: 'Justify why tries is set to 0 before the loop.', a: 'So the count starts from zero each game; otherwise it would continue from a previous value (or not exist yet).' },
    realWorld: 'In “code review”, professional programmers must explain and justify their code before it is accepted.',
    summary: ['Explain = what it does', 'Justify = why it’s done that way', 'Use precise vocabulary'],
  },

  3: {
    objectives: [
      'I can use several variables to manage a game',
      'I can explain the scope of a variable (for all sprites or one sprite)',
      'I can use variables to balance difficulty',
    ],
    big: 'In a game with 10 enemies, should they all share one “health” variable?',
    explain: [
      'Complex games use many variables: global ones (for all sprites, like score) and local ones (for this sprite only, like each enemy’s health).',
      'Choosing the right scope matters. If all enemies shared one health variable, hitting one would damage them all!',
      'Variables also balance difficulty: speed can increase with level, and spawn time can decrease as the score rises.',
    ],
    example: {
      type: 'table',
      title: 'Variables in a tower-defence game',
      head: ['Variable', 'Scope', 'Purpose'],
      rows: [['score', 'All sprites', 'Total points'], ['level', 'All sprites', 'Controls difficulty'], ['health', 'This sprite only', 'Each enemy’s own health'], ['speed', 'This sprite only', 'Set from level: 2 + level']],
    },
    mistake: { wrong: 'Making every variable “for all sprites”.', fix: 'Ask: does each copy need its own value? If yes, use “for this sprite only”.' },
    tryIt: { q: 'speed = 2 + level × 0.5. What is speed on level 4?', a: '4  (2 + 4 × 0.5 = 2 + 2)' },
    realWorld: 'Online games store variables for each player separately — your health isn’t shared with everyone else’s!',
    summary: ['Global vs local variables', 'Scope prevents strange bugs', 'Variables balance difficulty'],
  },

  4: {
    objectives: [
      'I can debug larger programs efficiently',
      'I can isolate a bug by testing parts separately',
      'I can use comments and logs to understand code',
    ],
    big: 'Your program is 200 lines long and something is wrong. Where do you even start?',
    explain: [
      'In big programs, reading every line is too slow. Debugging at scale means narrowing down where the bug is.',
      'Divide and conquer: check the middle of the program. Is the data correct there? If yes, the bug is later; if no, it’s earlier. Keep halving.',
      'Logging (printing values) and comments (notes explaining code) make large programs much easier to debug — for you and for others.',
    ],
    example: {
      type: 'code',
      title: 'Logging to find a bug',
      code: 'total = 0\nprices = [2, 5, 3]\nfor p in prices:\n    total = p          # BUG: should be total + p\n    print("LOG: total is", total)\nprint("Total cost:", total)',
      caption: 'The log shows 2, 5, 3 instead of 2, 7, 10 — so the bug is in how total is updated.',
    },
    mistake: { wrong: 'Adding random changes all over the program hoping something works.', fix: 'Narrow it down first with logs and divide-and-conquer, then make one targeted fix.' },
    tryIt: { q: 'Fix the bug in the example. What should the total be?', a: 'total = total + p. The total should be 10.' },
    realWorld: 'Large companies use automated logs from millions of devices to spot and fix bugs quickly.',
    summary: ['Narrow down before fixing', 'Divide and conquer', 'Logs and comments help'],
  },

  6: {
    objectives: [
      'I can explain how HTML structures a web page',
      'I can plan a website’s pages, layout and navigation',
      'I can design for accessibility',
    ],
    big: 'What is a web page actually made of?',
    explain: [
      'Web pages are written in HTML (HyperText Markup Language). Tags label each part: <h1> for a heading, <p> for a paragraph, <img> for an image, <a> for a link.',
      'CSS controls the style: colours, fonts and layout. HTML is the structure; CSS is the decoration.',
      'Accessible websites work for everyone: alt text describes images for screen readers, colours have strong contrast, and text is big enough to read.',
    ],
    example: {
      type: 'code',
      title: 'A tiny web page',
      code: '<h1>Year 6 Eco Club</h1>\n<p>We are making our school greener.</p>\n<img src="garden.jpg" alt="Pupils planting seeds">\n<a href="join.html">Join the club</a>',
    },
    mistake: { wrong: 'Images with no alt text.', fix: 'Always add alt text — people using screen readers rely on it.' },
    tryIt: { q: 'Which tag would you use for the main heading? Which for a link?', a: '<h1> for the main heading; <a> for a link.' },
    realWorld: 'Every website you visit — from the BBC to your favourite game — is built on HTML.',
    summary: ['HTML = structure, CSS = style', 'Tags label parts of a page', 'Design for accessibility'],
  },

  7: {
    objectives: [
      'I can use sensor input to control movement',
      'I can write algorithms that react continuously to a sensor',
      'I can tune values to make movement smooth',
    ],
    big: 'How does a robot follow a black line on the floor?',
    explain: [
      'Sensing and movement work together in a loop: read the sensor, decide, move — many times a second.',
      'A line-following robot uses a light sensor. Over the black line it reads dark; over the white floor it reads light. If it sees light, it has drifted off the line, so it steers back.',
      'Tuning matters: turning too much makes the robot zig-zag; too little and it loses the line. Engineers test and adjust values.',
    ],
    example: {
      type: 'code',
      title: 'Line follower (pseudocode)',
      code: 'REPEAT FOREVER\n    reading = light_sensor()\n    IF reading < 40          # dark: on the line\n        steer slightly LEFT\n    ELSE                     # light: off the line\n        steer slightly RIGHT\n    MOVE forward a little',
      caption: 'The robot wobbles along the edge of the line, constantly correcting.',
    },
    mistake: { wrong: 'Reading the sensor once before the loop.', fix: 'The world keeps changing, so read the sensor inside the loop every time.' },
    tryIt: { q: 'The robot zig-zags wildly. What value would you change?', a: 'Make the steering amount smaller (turn less on each correction), or slow the robot down.' },
    realWorld: 'Warehouse robots follow lines and markers on the floor to move goods around.',
    summary: ['Sense → decide → move, in a loop', 'Read sensors inside the loop', 'Tune values for smooth movement'],
  },

  8: {
    objectives: [
      'I can combine events and variables to control a program',
      'I can use broadcasts to coordinate several sprites',
      'I can trace how variables change as events happen',
    ],
    big: 'In a game, what should happen when the timer runs out — and who needs to know?',
    explain: [
      'Events start code; variables remember what has happened. Together they make interactive systems.',
      'A timer event changes a variable each second; when it reaches 0, a broadcast tells every sprite the game is over.',
      'Tracing events helps: list each event in order and how each variable changes.',
    ],
    example: {
      type: 'table',
      title: 'Event trace: quiz game',
      head: ['Event', 'score', 'time', 'What happens'],
      rows: [['Green flag', '0', '30', 'Game starts'], ['Correct answer', '1', '24', 'Ding sound'], ['Wrong answer', '1', '18', 'Buzz sound'], ['Correct answer', '2', '9', 'Ding sound'], ['time = 0', '2', '0', 'broadcast game over → final score shown']],
    },
    mistake: { wrong: 'Each sprite checking “if time = 0” separately and some miss it.', fix: 'Have one script detect it and broadcast “game over” to everyone.' },
    tryIt: { q: 'score starts at 0; +10 for correct, −5 for wrong. Events: correct, correct, wrong, correct. Final score?', a: '25  (10 + 10 − 5 + 10)' },
    realWorld: 'Smart homes combine events (door opens) with variables (who’s home) to decide whether to turn on lights.',
    summary: ['Events start code, variables remember', 'Broadcast to coordinate sprites', 'Trace events to understand state'],
  },

  9: {
    objectives: [
      'I can explain what a spreadsheet model is',
      'I can use formulas that update automatically',
      'I can change inputs to test “what if?” questions',
    ],
    big: 'How could you plan a class party budget so it updates instantly when prices change?',
    explain: [
      'A spreadsheet is a grid of cells. Each cell has an address, like B3 (column B, row 3).',
      'Formulas start with = and calculate using other cells: =B2*C2 multiplies, =SUM(D2:D5) adds a range.',
      'A model uses formulas to represent a real situation. Change an input and every result updates — perfect for “what if?” questions.',
    ],
    example: {
      type: 'table',
      title: 'Party budget model',
      head: ['', 'A: Item', 'B: Price (£)', 'C: Quantity', 'D: Cost'],
      rows: [['2', 'Pizza', '6', '5', '=B2*C2 → 30'], ['3', 'Juice', '1.50', '10', '=B3*C3 → 15'], ['4', 'Balloons', '3', '2', '=B4*C4 → 6'], ['5', 'TOTAL', '', '', '=SUM(D2:D4) → 51']],
    },
    mistake: { wrong: 'Typing the answer 30 instead of the formula =B2*C2.', fix: 'Typed answers never update. Use formulas so the model recalculates.' },
    tryIt: { q: 'Pizza price rises to £7. What is the new total?', a: '£56  (7 × 5 = 35; 35 + 15 + 6 = 56)' },
    realWorld: 'Businesses, scientists and governments use spreadsheet models to plan budgets and predict outcomes.',
    summary: ['Cells have addresses', 'Formulas start with =', 'Models answer “what if?”'],
  },

  10: {
    objectives: [
      'I can use data to support a decision',
      'I can weigh up evidence from more than one data set',
      'I can explain the limits of data-driven decisions',
    ],
    big: 'Should our school spend money on a new climbing frame or more books? How could data help?',
    explain: [
      'Data-driven decisions use evidence instead of guesses. First, decide what data would help answer the question.',
      'Look at more than one data set and check they agree. Present the evidence clearly, then make a recommendation.',
      'Remember the limits: data can be incomplete or biased, and some things (like happiness) are hard to measure. Good decisions combine data with people’s views and values.',
    ],
    example: {
      type: 'table',
      title: 'Evidence for the decision',
      head: ['Data', 'Climbing frame', 'More books'],
      rows: [['Pupil vote (n = 200)', '120 votes', '80 votes'], ['Library loans per week', '—', 'Up 30% this year'], ['Playground injuries', 'Old frame: 6 this year', '—'], ['Cost', '£3,000', '£1,500']],
      caption: 'Recommendation: replace the frame (safety + vote), but plan a smaller book order too.',
    },
    mistake: { wrong: 'Choosing based on one number, such as the vote only.', fix: 'Weigh several pieces of evidence, and explain what the data can’t show.' },
    tryIt: { q: 'Give one limit of the pupil vote in the example.', a: 'For example: younger pupils might vote for what looks fun, or 200 pupils might not be the whole school.' },
    realWorld: 'Hospitals use data to decide how many nurses are needed each night.',
    summary: ['Decide what evidence you need', 'Weigh several data sets', 'Know the limits'],
  },

  11: {
    objectives: [
      'I can decompose a large project into sub-systems',
      'I can identify dependencies between parts',
      'I can order tasks so the project can be built and tested',
    ],
    big: 'What has to exist before anything else in your project can work?',
    explain: [
      'Large projects are decomposed into sub-systems — parts with their own job, like “user input”, “game logic” and “display”.',
      'Some parts depend on others: you can’t test scoring until the player can move. These are dependencies.',
      'Order your tasks so each part can be tested as soon as it is built.',
    ],
    example: {
      type: 'table',
      title: 'Capstone: smart greenhouse',
      head: ['Sub-system', 'Depends on', 'Order'],
      rows: [['Sensor readings (light, moisture)', '—', '1'], ['Decision rules (water? lights?)', 'Sensors', '2'], ['Outputs (pump, lamp)', 'Rules', '3'], ['Dashboard display', 'Sensors + rules', '4'], ['Daily data log', 'Sensors', '5']],
    },
    mistake: { wrong: 'Starting with the dashboard because it looks fun.', fix: 'Build what everything else depends on first — here, the sensor readings.' },
    tryIt: { q: 'In a quiz app, what depends on the “question list”?', a: 'Displaying questions, checking answers and scoring all depend on it.' },
    realWorld: 'Building projects use “critical path” charts to show which tasks must finish before others can start.',
    summary: ['Split into sub-systems', 'Spot dependencies', 'Build foundations first'],
  },

  13: {
    objectives: [
      'I can build web pages with HTML structure and CSS style',
      'I can link pages together with navigation',
      'I can test my site for usability and accessibility',
    ],
    big: 'If a visitor can’t find what they need in 10 seconds, what happens?',
    explain: [
      'Build each page with clear HTML structure: headings in order, short paragraphs, images with alt text.',
      'Add CSS for a consistent style across every page, and a navigation menu that appears on every page.',
      'Test it: can a new user find key information quickly? Does it work with large text? Do all links work?',
    ],
    example: {
      type: 'code',
      title: 'Navigation + style',
      code: '<nav>\n  <a href="index.html">Home</a>\n  <a href="projects.html">Projects</a>\n  <a href="join.html">Join</a>\n</nav>\n\n/* style.css */\nnav a { color: white; background: green; padding: 8px; }',
    },
    mistake: { wrong: 'A different colour scheme on every page.', fix: 'Use one CSS file for all pages so the site feels consistent.' },
    tryIt: { q: 'A link to “join.html” shows an error. Name two things to check.', a: 'The file name spelling (join.html vs Join.html) and whether the file is in the same folder.' },
    realWorld: 'Web designers run “broken link checkers” and accessibility tests before every launch.',
    summary: ['Clear HTML structure', 'One CSS style for all pages', 'Test usability and links'],
  },

  14: {
    objectives: [
      'I can explain why structured data is useful',
      'I can describe tables, records, fields and data types',
      'I can explain how databases link tables together',
    ],
    big: 'Why do online shops not store your address on every single order?',
    explain: [
      'Structured data follows a fixed format: every record has the same fields, and each field has a data type (number, text, date, true/false).',
      'Relational databases split data into linked tables. A Customers table and an Orders table are linked by a customer ID, so the address is stored once.',
      'Structure means data can be searched, sorted, checked and combined reliably.',
    ],
    example: {
      type: 'compare',
      title: 'Two linked tables',
      left: { label: 'Customers', items: ['ID 1 · Ana · Leeds', 'ID 2 · Ben · Bath', 'ID 3 · Chen · York'] },
      right: { label: 'Orders', items: ['Order 501 · Customer 2 · Book', 'Order 502 · Customer 1 · Lamp', 'Order 503 · Customer 2 · Pen'] },
      caption: 'Ben’s address is stored once. His two orders point to him using customer ID 2.',
    },
    mistake: { wrong: 'Storing dates as free text: “3rd May”, “05/03”, “May 3”.', fix: 'Use the date data type so the database can sort and compare dates.' },
    tryIt: { q: 'Which customer made order 502? Where do they live?', a: 'Customer 1 — Ana, who lives in Leeds.' },
    realWorld: 'Every online shop, bank and hospital runs on relational databases.',
    summary: ['Structured = same fields, set data types', 'Tables link by IDs', 'Structure enables reliable searching'],
  },

  15: {
    objectives: [
      'I can calculate averages and ranges from data',
      'I can spot trends and outliers',
      'I can draw evidence-based conclusions',
    ],
    big: 'If one pupil scored 100 and everyone else scored 10, what is the “average”?',
    explain: [
      'Analysing data means finding meaning in it. Useful measures: the mean (add up and divide by how many), the median (the middle value), the mode (most common) and the range (biggest − smallest).',
      'Trends show how data changes; outliers are values very different from the rest. Outliers can skew the mean, so the median is sometimes fairer.',
      'Conclusions should quote the evidence and mention any outliers or limits.',
    ],
    example: {
      type: 'table',
      title: 'Minutes of exercise per day (7 pupils)',
      head: ['Measure', 'Data: 20, 25, 30, 30, 35, 40, 180', 'Value'],
      rows: [['Mean', '360 ÷ 7', '≈ 51 min'], ['Median', 'middle value', '30 min'], ['Mode', 'most common', '30 min'], ['Range', '180 − 20', '160 min']],
      caption: 'The outlier (180) pulls the mean up. The median (30) better describes a typical pupil.',
    },
    mistake: { wrong: 'Always using the mean.', fix: 'If there are outliers, the median often gives a fairer picture.' },
    tryIt: { q: 'Data: 4, 6, 6, 8, 11. Find the mean, median, mode and range.', a: 'Mean 7, median 6, mode 6, range 7.' },
    realWorld: 'News reports use median house prices because a few mansions would make the mean misleading.',
    summary: ['Mean, median, mode, range', 'Watch for outliers', 'Conclusions quote evidence'],
  },

  16: {
    objectives: [
      'I can use lists in Python',
      'I can use a table (list of lists) to store records',
      'I can loop through structured data to answer questions',
    ],
    big: 'How could a program store a whole class’s quiz results neatly?',
    explain: [
      'In Python a list uses square brackets: scores = [12, 18, 9]. Items are counted from 0, so scores[0] is 12.',
      'A table can be stored as a list of lists — each inner list is one record (row).',
      'A for loop visits each record, so you can total, filter or find the best.',
    ],
    example: {
      type: 'code',
      title: 'Class results table',
      code: 'results = [\n    ["Ana", 18],\n    ["Ben", 12],\n    ["Chen", 20],\n]\nfor row in results:\n    name = row[0]\n    score = row[1]\n    if score >= 15:\n        print(name, "passed with", score)',
      caption: 'Output: Ana passed with 18 · Chen passed with 20.',
    },
    mistake: { wrong: 'Thinking the first item is scores[1].', fix: 'Python counts from 0. The first item is scores[0].' },
    tryIt: { q: 'colours = ["red", "blue", "green"]. What is colours[2]? What is len(colours)?', a: 'colours[2] is "green"; len(colours) is 3.' },
    realWorld: 'Data scientists store huge tables of data and loop through them with Python every day.',
    summary: ['Lists use [ ] and count from 0', 'Tables are lists of lists', 'Loop through to analyse'],
  },

  17: {
    objectives: [
      'I can explain how AI tools generate content',
      'I can identify errors and made-up facts in AI output',
      'I can verify AI content using trusted sources',
    ],
    big: 'If an AI chatbot sounds confident, does that mean it is right?',
    explain: [
      'Generative AI tools create text, images and sound by learning patterns from huge amounts of data. They predict what is likely to come next — they don’t “know” facts the way people do.',
      'This means AI can make mistakes and even invent convincing facts, quotes or sources (sometimes called “hallucinations”). AI images can be fake but look real.',
      'Always verify: check important facts with trusted sources, look for signs of fake images, and say when you have used AI.',
    ],
    example: {
      type: 'steps',
      title: 'Checking AI output',
      items: ['Is the claim specific? Find it in a trusted source', 'Are quotes or references real? Search for them', 'Does an image have odd details (hands, text, shadows)?', 'Is anything missing or one-sided?', 'Be honest: say where AI helped you'],
    },
    mistake: { wrong: 'Copying an AI answer into homework without checking.', fix: 'Treat AI as a starting point. Verify facts and write it in your own words.' },
    tryIt: { q: 'An AI says “The Eiffel Tower was built in 1999 by Leonardo da Vinci.” How would you check?', a: 'Search trusted sources (an encyclopedia, a museum site). It was built in 1889 by Gustave Eiffel’s company — the AI invented it.' },
    realWorld: 'Lawyers have been fined for submitting AI-written documents containing made-up court cases.',
    summary: ['AI predicts patterns, it doesn’t “know”', 'AI can invent facts and fake images', 'Always verify and be honest'],
  },

  18: {
    objectives: [
      'I can explain how AI systems learn from training data',
      'I can explain how biased data leads to biased results',
      'I can discuss fair and responsible uses of AI',
    ],
    big: 'If an AI only ever saw pictures of ginger cats, what would it think a cat is?',
    explain: [
      'Machine learning systems learn from training data: lots of examples labelled with the right answer.',
      'If the training data is unbalanced or unfair, the AI learns that unfairness. This is called bias. An AI trained mostly on one group of people may work badly for others.',
      'Ethics asks “Is this right and fair?”. Responsible AI needs diverse data, testing on everyone it affects, and humans checking important decisions.',
    ],
    example: {
      type: 'table',
      title: 'How bias gets in',
      head: ['Training data', 'What the AI learns', 'Problem'],
      rows: [['Photos of doctors: 90% men', '“Doctors are men”', 'Unfair to women doctors'], ['Voices: mostly adults', 'Understands adults best', 'Struggles with children’s voices'], ['Fruit photos all in daylight', 'Fruit looks bright', 'Fails in dim light']],
    },
    mistake: { wrong: '“Computers are neutral, so AI can’t be unfair.”', fix: 'AI copies patterns in its data — including unfair ones. People must check and fix bias.' },
    tryIt: { q: 'A school builds an AI to recognise handwriting, trained only on Year 6 writing. Who might it work badly for?', a: 'Younger pupils, and anyone whose handwriting looks different from the training examples.' },
    realWorld: 'Some face-recognition systems have worked less accurately for people with darker skin because of unbalanced training data.',
    summary: ['AI learns from training data', 'Biased data → biased AI', 'Test fairly; keep humans in charge'],
  },

  20: {
    objectives: [
      'I can build a spreadsheet to solve a real problem',
      'I can use formulas, functions and charts',
      'I can present my findings and recommendation',
    ],
    big: 'Could a spreadsheet help plan our class trip?',
    explain: [
      'The challenge: build a spreadsheet model for a real problem, such as planning a trip within a budget.',
      'Use formulas for costs, SUM for totals, and conditions (e.g. =IF(total > budget, "Over", "OK")) to check limits.',
      'Add a chart that makes the key comparison obvious, and write a recommendation backed by your model.',
    ],
    example: {
      type: 'table',
      title: 'Trip planner',
      head: ['Option', 'Coach', 'Tickets (30)', 'Total', 'Within £600?'],
      rows: [['Science museum', '£250', '£300', '=B2+C2 → £550', '=IF(D2>600,"Over","OK") → OK'], ['Zoo', '£300', '£450', '£750', 'Over'], ['Castle', '£200', '£240', '£440', 'OK']],
    },
    mistake: { wrong: 'Hiding the formulas so no one can check your working.', fix: 'Label inputs clearly so anyone can change them and see results update.' },
    tryIt: { q: 'Which options are within budget? Which is cheapest?', a: 'The science museum and the castle; the castle is cheapest at £440.' },
    realWorld: 'Event planners and accountants use spreadsheet models exactly like this.',
    summary: ['Model a real problem', 'Formulas, functions, IF checks', 'Recommend with evidence'],
  },

  21: {
    objectives: [
      'I can explain how 3D objects are built from shapes',
      'I can describe how 3D scenes use coordinates, lighting and cameras',
      'I can link a 3D or media artefact to code',
    ],
    big: 'How are characters in animated films and video games built?',
    explain: [
      '3D objects are built from many flat shapes called polygons (usually triangles). More polygons mean smoother, more detailed models.',
      '3D scenes use x, y AND z coordinates (z is depth). A virtual camera decides what we see, and virtual lights create shadows and mood.',
      'Code brings 3D to life: rotating objects, moving the camera, reacting to the user.',
    ],
    example: {
      type: 'table',
      title: 'Building blocks of a 3D scene',
      head: ['Part', 'What it does'],
      rows: [['Mesh', 'The shape, made of triangles'], ['Material', 'Colour and texture of the surface'], ['Coordinates (x, y, z)', 'Where things are, including depth'], ['Camera', 'Which view the user sees'], ['Light', 'Brightness, shadows and mood']],
    },
    mistake: { wrong: 'Adding millions of polygons to everything.', fix: 'More detail is slower to draw. Use detail where it matters (faces) and keep backgrounds simple.' },
    tryIt: { q: 'An object is at (0, 0, 0). It moves to (0, 0, −10). Has it moved left, up or away?', a: 'Neither left nor up — it moved 10 along z, the depth axis, so it moved further into (or out of) the scene.' },
    realWorld: 'The ByteBuddies Robot Studio is a 3D scene: meshes, materials, lights and cameras, all controlled by code!',
    summary: ['3D models are made of polygons', 'x, y, z + camera + lights', 'Code animates 3D scenes'],
  },

  22: {
    objectives: [
      'I can explain what user experience (UX) means',
      'I can design an app screen with the user in mind',
      'I can improve a design using UX principles',
    ],
    big: 'Why do some apps feel easy, and others make you want to throw your phone?',
    explain: [
      'User experience (UX) is how it feels to use a product: is it easy, clear and enjoyable?',
      'Good UX principles: keep it simple, make important buttons big and obvious, be consistent, give feedback when something happens, and let users undo mistakes.',
      'Designers sketch screens, test them with users, and improve them — before any code is written.',
    ],
    example: {
      type: 'compare',
      title: 'UX makeover: a homework app',
      left: { label: '❌ Poor UX', items: ['10 tiny buttons on one screen', 'No message after “Submit”', 'Different colours on every page', 'Delete with no “Are you sure?”'] },
      right: { label: '✅ Good UX', items: ['3 clear choices on the home screen', '“Homework sent ✓” message', 'Consistent colours and icons', 'Undo for 10 seconds after delete'] },
    },
    mistake: { wrong: 'Designing for yourself instead of the real user.', fix: 'Ask who the user is, and test with them. A Year 1 pupil needs a very different design from a teacher.' },
    tryIt: { q: 'Suggest one UX improvement for a form that just clears itself when you make a mistake.', a: 'Keep what was typed and highlight only the wrong field with a helpful message.' },
    realWorld: 'Companies employ UX researchers who study how people use apps, then redesign them.',
    summary: ['UX = how it feels to use', 'Simple, clear, consistent, feedback, undo', 'Design and test with real users'],
  },

  23: {
    objectives: [
      'I can explain why programmers save versions of their work',
      'I can describe a version-control workflow',
      'I can write useful descriptions of changes',
    ],
    big: 'You changed your game and now it’s broken. How do you get yesterday’s working version back?',
    explain: [
      'Version control keeps a history of every saved change to a project, so you can see what changed, when, and go back if needed.',
      'Each saved snapshot (often called a commit) has a short message describing the change: “Added double-jump” — not “stuff”.',
      'Teams use version control to work on the same project without overwriting each other’s work.',
    ],
    example: {
      type: 'table',
      title: 'Version history',
      head: ['Version', 'Message', 'Status'],
      rows: [['v1', 'Player moves with arrow keys', '✅ works'], ['v2', 'Added coins and score', '✅ works'], ['v3', 'Added enemies', '✅ works'], ['v4', 'Changed gravity value', '❌ player falls through floor'], ['→', 'Restore v3, try a smaller gravity change', '']],
    },
    mistake: { wrong: 'Saving over the same file all the time with no history.', fix: 'Save new versions after each working change, with a clear message.' },
    tryIt: { q: 'Write a good version message for: you fixed the bug where the score went up twice.', a: 'For example: “Fixed double-scoring by hiding coins before adding points.”' },
    realWorld: 'Tools like Git store the history of almost all professional software — even this website!',
    summary: ['Version control = history of changes', 'Clear messages for each version', 'Go back when something breaks'],
  },

  24: {
    objectives: [
      'I can use a rubric to review code fairly',
      'I can give specific, actionable feedback',
      'I can respond to feedback to improve my work',
    ],
    big: 'What makes feedback actually useful?',
    explain: [
      'A rubric is a table of criteria with descriptions of different quality levels. It makes reviews fair and consistent.',
      'Code review looks at: does it work, is it readable (clear names, comments), is it efficient, and is it well tested?',
      'Useful feedback is specific and actionable: it says exactly what and how to improve, kindly.',
    ],
    example: {
      type: 'table',
      title: 'Code review rubric',
      head: ['Criterion', 'Developing', 'Secure', 'Excellent'],
      rows: [['Works', 'Some features work', 'All features work', 'Handles unusual inputs too'], ['Readable', 'Unclear names', 'Clear names', 'Clear names + helpful comments'], ['Efficient', 'Lots of repetition', 'Uses loops', 'Uses loops and functions'], ['Tested', 'Tried once', 'Test plan', 'Test plan + edge cases']],
    },
    mistake: { wrong: '“It’s good but could be better.”', fix: 'Actionable: “Rename variable x to lives so it’s clear what it stores.”' },
    tryIt: { q: 'Turn “the code is messy” into actionable feedback.', a: 'For example: “The draw-star blocks appear 4 times — make a custom block so you only fix it in one place.”' },
    realWorld: 'At most tech companies, no code goes live until another programmer has reviewed it.',
    summary: ['Rubrics make reviews fair', 'Works, readable, efficient, tested', 'Specific and actionable feedback'],
  },

  25: {
    objectives: [
      'I can explain how messages travel across networks',
      'I can describe protocols and why they matter',
      'I can explain how encryption keeps messages private',
    ],
    big: 'When you send a message to a friend, who else could read it on the way?',
    explain: [
      'Messages are split into packets that travel through many routers. Protocols are agreed rules that let any two devices communicate — like a shared language (TCP/IP for the internet, HTTP for websites).',
      'Packets pass through computers you don’t control, so private data must be protected.',
      'Encryption scrambles a message using a key so only the right person can unscramble it. The padlock in your browser (HTTPS) means the connection is encrypted.',
    ],
    example: {
      type: 'table',
      title: 'Caesar cipher — shift each letter by 3',
      head: ['Plain text', 'H', 'E', 'L', 'L', 'O'],
      rows: [['Encrypted', 'K', 'H', 'O', 'O', 'R']],
      caption: 'Simple ciphers like this are easy to crack; modern encryption uses huge mathematical keys.',
    },
    mistake: { wrong: '“If a website has a padlock, it must be safe and honest.”', fix: 'The padlock means the connection is encrypted — not that the website itself is trustworthy.' },
    tryIt: { q: 'Decrypt this Caesar shift-3 message: FRGH', a: 'CODE  (shift each letter back by 3)' },
    realWorld: 'Messaging apps use end-to-end encryption so even the company can’t read your messages.',
    summary: ['Packets + protocols', 'Data passes through many computers', 'Encryption keeps it private'],
  },

  27: {
    objectives: [
      'I can design an app prototype for a real user need',
      'I can storyboard the user journey screen by screen',
      'I can test a paper prototype and improve it',
    ],
    big: 'What problem in your life could a small app solve?',
    explain: [
      'Great apps solve a real problem for a specific user. Start by describing the user and their need.',
      'A user journey shows each step the user takes, screen by screen. Storyboard it with simple sketches.',
      'A paper prototype lets you test the idea quickly: a tester “taps” paper buttons and you swap the screens. Improve it before any coding.',
    ],
    example: {
      type: 'table',
      title: 'User journey: “Pack My Bag” app',
      head: ['Screen', 'User does', 'App does'],
      rows: [['1 · Today', 'Opens app in the morning', 'Shows today’s timetable'], ['2 · Checklist', 'Ticks items', 'PE kit appears on PE days'], ['3 · Done', 'Taps “All packed”', 'Celebration + reminder time']],
    },
    mistake: { wrong: 'An app that tries to do 15 things.', fix: 'Solve one problem really well. Extra features can come later.' },
    tryIt: { q: 'Write a one-sentence user need for an app.', a: 'For example: “Year 6 pupils need a reminder of what to bring each day so they don’t forget PE kit.”' },
    realWorld: 'Designers at big companies test paper prototypes before spending months on code.',
    summary: ['Start with a user need', 'Storyboard the journey', 'Test a paper prototype'],
  },

  28: {
    objectives: [
      'I can combine AND, OR and NOT in complex conditions',
      'I can use nested selection',
      'I can test conditions systematically',
    ],
    big: 'Can you enter the cinema if you are 11, the film is a 12A, and you are with an adult?',
    explain: [
      'Complex conditions combine AND, OR and NOT. Brackets show which part is worked out first, just like in maths.',
      'Nested selection puts an if inside another if — useful when one decision depends on another.',
      'Test systematically: try every combination of true/false, especially the boundaries (exactly 12, exactly 11).',
    ],
    example: {
      type: 'code',
      title: 'Cinema entry',
      code: 'age = 11\nwith_adult = True\nrating = "12A"\n\nif rating == "U" or age >= 12 or (rating == "12A" and with_adult):\n    print("Enjoy the film!")\nelse:\n    print("Sorry, you can’t watch this one.")',
      caption: '11-year-old + adult + 12A: the bracket is True, so the whole condition is True.',
    },
    mistake: { wrong: 'Missing brackets: age >= 12 or rating == "12A" and with_adult — unclear which goes first.', fix: 'Use brackets to make the logic exactly what you mean.' },
    tryIt: { q: 'Same code: age = 10, with_adult = False, rating = "12A". What is printed?', a: '“Sorry, you can’t watch this one.” — every part of the OR is False.' },
    realWorld: 'Banks use complex conditions to decide whether a payment looks normal or suspicious.',
    summary: ['Combine AND, OR, NOT', 'Brackets control the order', 'Test every combination'],
  },

  29: {
    objectives: [
      'I can design an algorithm that uses several sensors',
      'I can program movement that responds to sensor data',
      'I can test and refine my algorithm in a simulation',
    ],
    big: 'How does an automatic lawnmower know where the garden ends?',
    explain: [
      'This challenge combines everything: sensing, decisions, loops and movement.',
      'Plan the robot’s behaviour as rules in priority order: safety first, then the main job, then extras.',
      'Simulate, observe, refine: change one value or rule at a time and record the effect.',
    ],
    example: {
      type: 'code',
      title: 'Robot lawnmower rules',
      code: 'while battery > 10:\n    if boundary_wire_detected():\n        turn(random_angle())\n    elif obstacle_distance() < 20:\n        reverse()\n        turn(90)\n    else:\n        forward()\n        cut_grass()\nreturn_to_charger()',
    },
    mistake: { wrong: 'Checking “cut grass” before checking the boundary.', fix: 'Safety and boundary rules go first so the robot never leaves the garden.' },
    tryIt: { q: 'What happens when the battery drops to 10?', a: 'The while condition becomes false, so the loop ends and the robot returns to its charger.' },
    realWorld: 'Robot lawnmowers, vacuums and delivery robots all follow priority rules like these.',
    summary: ['Rules in priority order', 'Sense, decide, act in a loop', 'Simulate and refine'],
  },

  30: {
    objectives: [
      'I can define a Python function with one parameter',
      'I can call a function with different arguments',
      'I can explain how functions reduce repetition',
    ],
    big: 'How could you write “greet a person” once and use it for everyone in the class?',
    explain: [
      'A function is a named, reusable block of code. In Python it starts with def, followed by its name and brackets.',
      'A parameter is a variable in the brackets that receives a value when the function is called. The value you pass in is called an argument.',
      'Functions avoid repetition: write it once, call it many times with different arguments.',
    ],
    example: {
      type: 'code',
      title: 'A function with a parameter',
      code: 'def cheer(name):\n    print("Go", name + "!")\n    print(name, "is a coding star ⭐")\n\ncheer("Aisha")\ncheer("Tom")',
      caption: 'name is the parameter. "Aisha" and "Tom" are arguments. Four lines of output from two calls.',
    },
    mistake: { wrong: 'Defining the function but never calling it.', fix: 'def only creates the function. You must call it — cheer("Aisha") — for it to run.' },
    tryIt: { q: 'Write a function double(n) that prints n × 2. What does double(7) print?', a: 'def double(n):\n    print(n * 2)\ndouble(7) prints 14.' },
    realWorld: 'print() and len() are functions too — written by someone else so you can reuse them.',
    summary: ['def creates a function', 'Parameters receive arguments', 'Write once, call many times'],
  },

  31: {
    objectives: [
      'I can combine variables, selection, loops and functions in Python',
      'I can plan a small program before writing it',
      'I can test my program with normal and unusual inputs',
    ],
    big: 'Can you build a complete mini-program using everything you know?',
    explain: [
      'A capstone snippet is a small but complete program that uses all the key constructs: variables, selection, iteration (loops) and functions.',
      'Plan first in pseudocode, then write one function at a time and test it.',
      'Test with normal inputs (“7”), boundary inputs (“0”, “10”) and silly inputs (“banana”) — real users will try them!',
    ],
    example: {
      type: 'code',
      title: 'Times-table quiz',
      code: 'def ask(a, b):\n    answer = int(input(str(a) + " x " + str(b) + " = "))\n    return answer == a * b\n\nscore = 0\nfor b in range(1, 6):\n    if ask(7, b):\n        score = score + 1\nprint("You scored", score, "out of 5")',
      caption: 'Function (ask), parameters (a, b), loop (for), selection (if), variable (score).',
    },
    mistake: { wrong: 'Writing the whole program before running it once.', fix: 'Build one piece, run it, then add the next. Errors are easier to find in small pieces.' },
    tryIt: { q: 'Which line of the example uses selection? Which uses iteration?', a: 'Selection: “if ask(7, b):”. Iteration: “for b in range(1, 6):”.' },
    realWorld: 'Every big program is built from these same four building blocks.',
    summary: ['Variables, selection, iteration, functions', 'Plan, then build piece by piece', 'Test normal, boundary and silly inputs'],
  },

  32: {
    objectives: [
      'I can design an algorithm for an autonomous robot',
      'I can combine sensing, decisions and actions into a mission',
      'I can evaluate how well my robot completes its mission',
    ],
    big: 'What does it mean for a robot to be autonomous?',
    explain: [
      'An autonomous robot makes its own decisions without a human controlling it, using sensors and an algorithm.',
      'A mission has a goal (deliver a parcel), constraints (avoid obstacles, don’t run out of battery) and success measures (time taken, collisions).',
      'Design the decision loop, simulate the mission, measure the results, and improve the algorithm.',
    ],
    example: {
      type: 'code',
      title: 'Delivery mission (pseudocode)',
      code: 'WHILE parcel not delivered\n    IF battery < 15\n        GO to charger\n    ELSE IF obstacle ahead\n        PLAN a new route\n    ELSE IF at the house\n        RELEASE parcel\n    ELSE\n        MOVE along the route\nREPORT time taken and collisions',
    },
    mistake: { wrong: 'Only testing in an empty arena.', fix: 'Test with obstacles, low battery and moved targets — the real world is messy.' },
    tryIt: { q: 'Name one success measure for an autonomous delivery robot.', a: 'For example: time taken, number of collisions, battery used, or parcels delivered without damage.' },
    realWorld: 'Autonomous delivery robots already carry food and parcels on pavements in some UK towns.',
    summary: ['Autonomous = decides for itself', 'Goal, constraints, success measures', 'Simulate, measure, improve'],
  },

  34: {
    objectives: [
      'I can specify a complete system for a real user need',
      'I can decompose it into sub-systems with dependencies',
      'I can write measurable success criteria',
    ],
    big: 'What system would make a real difference to someone in our school?',
    explain: [
      'Your final capstone is a complete system: inputs, processing, outputs and stored data, designed for real users.',
      'Write a specification: the user need, features (must/should/could), sub-systems, data you will store, and how you will test it.',
      'Success criteria must be measurable — you should be able to prove you met them.',
    ],
    example: {
      type: 'table',
      title: 'Specification: Lunch Queue Helper',
      head: ['Section', 'Plan'],
      rows: [['User need', 'Shorter lunch queues for Years 3–6'], ['Inputs', 'Pupils choose lunch on a tablet in the morning'], ['Processing', 'Count each choice; estimate serving time'], ['Outputs', 'Kitchen dashboard + suggested year-group order'], ['Data', 'List of choices per day'], ['Success criteria', 'Dashboard updates within 2 seconds; tested with 30 sample orders']],
    },
    mistake: { wrong: '“Success criteria: it works well.”', fix: 'Measurable: “It correctly totals 30 test orders” or “A Year 3 can order in under 30 seconds.”' },
    tryIt: { q: 'Make this measurable: “The app is easy to use.”', a: 'For example: “4 out of 5 testers complete an order without help in under 30 seconds.”' },
    realWorld: 'Engineers write specifications before building anything from bridges to banking apps.',
    summary: ['A system: inputs, processing, outputs, data', 'Specification with must/should/could', 'Measurable success criteria'],
  },

  35: {
    objectives: [
      'I can build my system in tested increments',
      'I can use version control to manage changes',
      'I can test against my specification and fix issues',
    ],
    big: 'How will you prove your system meets its specification?',
    explain: [
      'Build incrementally: one sub-system at a time, tested before moving on, in dependency order.',
      'Save a version after each working increment with a clear message, so you can always roll back.',
      'Test against each success criterion and record the evidence: what you tested, the result, and any fix.',
    ],
    example: {
      type: 'table',
      title: 'Test log against the specification',
      head: ['Criterion', 'Test', 'Result'],
      rows: [['Totals orders correctly', '30 sample orders', '✅ 30/30 correct'], ['Updates within 2 s', 'Timed 10 updates', '✅ max 1.2 s'], ['Year 3 orders in < 30 s', '5 testers', '❌ 2 took 45 s → bigger buttons added'], ['Retest after fix', '5 testers', '✅ all under 30 s']],
    },
    mistake: { wrong: 'Leaving all the testing for the final lesson.', fix: 'Test every increment. Problems found early are cheaper to fix.' },
    tryIt: { q: 'A test fails after you add a new feature. What does version control let you do?', a: 'Compare with the last working version to find what changed, or roll back to it.' },
    realWorld: 'Professional teams run automatic tests every time someone saves a new version.',
    summary: ['Build in tested increments', 'Version after each success', 'Evidence for every criterion'],
  },

  36: {
    objectives: [
      'I can present my system clearly to an audience',
      'I can evaluate it against the specification with evidence',
      'I can reflect on my growth and build a portfolio',
    ],
    big: 'What would you tell your Year 3 self about learning to code?',
    explain: [
      'Present like a professional: the user need, a live demo, how it works (the algorithm and data), and the evidence from testing.',
      'Evaluate honestly against your specification: what you met, what you didn’t, and what version 2 would include.',
      'Your portfolio collects your best work across KS2 with short reflections — evidence of how far you have come.',
    ],
    example: {
      type: 'steps',
      title: 'Portfolio page',
      items: ['Project title and the problem it solves', 'Screenshot or photo', 'The clever bit: one algorithm explained', 'A bug I beat and how', 'Evidence: test results or user feedback', 'What I would do next'],
    },
    mistake: { wrong: 'Hiding the parts that didn’t work.', fix: 'Evaluators respect honesty. Explain what didn’t work and what you learned from it.' },
    tryIt: { q: 'Write one reflective sentence for your portfolio.', a: 'For example: “I learned that testing early saves time — my first version had 6 bugs, but testing each sub-system found them quickly.”' },
    realWorld: 'Designers, engineers and developers use portfolios to show their work when applying for jobs and courses.',
    summary: ['Demo, explain, evidence', 'Honest evaluation', 'Portfolio shows your journey'],
  },

  37: {
    objectives: [
      'I can celebrate my achievements in computing',
      'I can explain the big ideas I have mastered across KS2',
      'I can describe what I will learn next in secondary school',
    ],
    big: 'You started with “move 10 steps”. What can you build now?',
    explain: [
      'Across KS2 you have learned to think like a computer scientist: decompose problems, design algorithms, write and debug programs, handle data and stay safe online.',
      'In secondary school you will go further: more Python, how computers work inside, networks and cyber security, and bigger projects.',
      'Celebrate — and keep creating. The best programmers are curious and never stop building.',
    ],
    example: {
      type: 'table',
      title: 'Your KS2 computing journey',
      head: ['Year', 'Big step'],
      rows: [['Year 3', 'Algorithms, sequences, loops, events, first variables'], ['Year 4', 'Pseudocode, nested loops, if … else, lists, sensors'], ['Year 5', 'Selection, Boolean logic, modular code, databases, first Python'], ['Year 6', 'Functions, complex conditions, data analysis, AI ethics, full systems']],
    },
    mistake: { wrong: '“I’m not a computer person.”', fix: 'Everyone in this room has built programs, fixed bugs and solved problems. That IS being a computer person.' },
    tryIt: { q: 'Name one thing you want to build next, and one idea from KS2 you would use.', a: 'Answers will vary, e.g. “A football stats app — I’d use lists and a function to work out averages.”' },
    realWorld: 'Many of today’s apps and games were started by people who first learned to code at school.',
    summary: ['You think like a computer scientist', 'Secondary school goes further', 'Stay curious and keep building'],
  },
};
