/**
 * Year 3 teaching content (ages 7–8) — what goes on the board.
 *
 * Each lesson: objectives (pupil "I can"), big (starter question), explain
 * (the teaching), example (a visual — see TeachingVisual), mistake, tryIt
 * (a question for the class with a reveal), realWorld and summary.
 */
export default {
  0: {
    objectives: [
      'I can use school devices carefully and kindly',
      'I can name information that must stay private',
      'I can say what to do if something online worries me',
    ],
    big: 'Dot found a game that asks for your name, address and school. Should Dot type them in? Why?',
    explain: [
      'Computers, tablets and the internet are brilliant tools. We look after them like any precious tool: clean hands, two hands to carry, and only the apps our teacher has chosen.',
      'Some information is private. Your full name together with your address, your school, your phone number, your passwords and photos of you in uniform could help a stranger find you. Private information stays with you and your trusted adults.',
      'If something on a screen makes you feel worried, scared or confused, you are never in trouble for telling. Stop, turn the screen over or close it, and tell a trusted adult straight away.',
    ],
    example: {
      type: 'compare',
      title: 'Private or OK to share?',
      left: { label: '🔒 Keep it private', items: ['Your home address', 'Your password', 'Your phone number', 'The name of your school', 'Photos of you in uniform'] },
      right: { label: '✅ Usually OK to share', items: ['Your favourite colour', 'Your favourite animal', 'A drawing of a dragon', 'What you thought of a book'] },
    },
    mistake: { wrong: '“If I tell an adult what I saw online, I’ll get into trouble.”', fix: 'Telling is always the right thing to do. Trusted adults want to help — you have done nothing wrong.' },
    tryIt: { q: 'A pop-up says: “Type your home address to win a prize!” What should you do?', a: 'Don’t type it — your address is private. Close the pop-up and tell a trusted adult.' },
    realWorld: 'Grown-ups follow the same rules: a real bank will never ask for your password, and good apps keep your details locked away.',
    summary: ['Look after devices and use them kindly', 'Private information stays private', 'Worried? Stop, cover the screen, tell an adult'],
  },

  1: {
    objectives: [
      'I can say what an algorithm is in my own words',
      'I can put muddled steps into a working order',
      'I can give an example of an algorithm in everyday life',
    ],
    big: 'How would you explain to an alien how to brush their teeth — step by step?',
    explain: [
      'An algorithm is a set of clear steps, in the right order, that solves a problem or gets a job done.',
      'You follow algorithms all day long: getting dressed, making a sandwich, crossing the road safely. If the steps are in the wrong order, the result goes wrong — imagine putting your shoes on before your socks!',
      'Computers can’t guess what you mean. They do exactly what the steps say, so an algorithm for a computer must be precise: every step clear and nothing missed out.',
    ],
    example: {
      type: 'steps',
      title: 'Algorithm: jam on toast',
      items: ['Put a slice of bread in the toaster', 'Push the lever down', 'Wait until the toast pops up', 'Put the toast on a plate', 'Spread jam on the toast'],
    },
    mistake: { wrong: 'Spread the jam first, then toast the bread.', fix: 'Order matters! Jam in a toaster makes a sticky mess. Check every step happens at the right time.' },
    tryIt: { q: 'Put these in order: “Brush your teeth”, “Put toothpaste on the brush”, “Rinse the brush”, “Pick up your toothbrush”.', a: 'Pick up your toothbrush → Put toothpaste on the brush → Brush your teeth → Rinse the brush.' },
    realWorld: 'Sat navs use algorithms to find the quickest way home, and traffic lights follow an algorithm to change colour safely.',
    summary: ['An algorithm is a set of steps in order', 'The order of the steps matters', 'Computers need exact, precise steps'],
  },

  2: {
    objectives: [
      'I can trace a short program one step at a time',
      'I can predict where a sprite will finish',
      'I can find the step where my prediction went wrong',
    ],
    big: 'Can you tell what a program will do before you press Go?',
    explain: [
      'To predict means to work out what will happen before it happens.',
      'Programmers trace a program: they follow it one block at a time with a finger, keeping track of where the sprite is and which way it is facing.',
      'If the program does something different from your prediction, that is useful! The step where your prediction went wrong shows you where to look — it might be a bug, or something new to learn.',
    ],
    example: {
      type: 'grid',
      title: 'Trace it: where does Dot stop?',
      cols: 5, rows: 4, start: [0, 1], dir: 'right',
      program: ['when ▶ clicked', 'move 2', 'turn right', 'move 2'],
      path: [[0, 1], [1, 1], [2, 1], [2, 2], [2, 3]],
      caption: 'Dot starts facing right. Move 2 → turn right (now facing down) → move 2. Dot stops 2 across and 2 down.',
    },
    mistake: { wrong: 'Forgetting which way Dot is facing after a turn.', fix: 'After every turn, point your finger the new way before you count the next move.' },
    tryIt: { q: 'Dot faces right. Program: move 3, turn left, move 1. Which way is Dot facing at the end? How many squares did Dot move?', a: 'Dot is facing up. Dot moved 4 squares altogether (3 + 1).' },
    realWorld: 'Game designers predict what their code will do before they test it — it saves hours of guessing.',
    summary: ['Predict before you run', 'Trace one step at a time', 'A wrong prediction shows you where to look'],
  },

  3: {
    objectives: [
      'I can start a program with the green flag',
      'I can build a sequence of move and turn blocks',
      'I can use reset to test again from the start',
    ],
    big: 'What does a computer need before it starts running your program?',
    explain: [
      'A sequence is a list of instructions that run one after another, from top to bottom.',
      'In block coding a program begins with a hat block such as “when ▶ clicked”. Only blocks that are snapped underneath a hat will run.',
      'Before you test, reset the sprite back to its starting place. Then every test starts the same way, so you can see what changed.',
    ],
    example: {
      type: 'blocks',
      title: 'My first sequence',
      blocks: ['when ▶ clicked', 'go to start', 'move 3', 'turn right', 'move 2'],
      caption: 'The hat starts it. Reset first, then move, turn, move — top to bottom.',
    },
    mistake: { wrong: 'Blocks left floating on their own, not snapped under the hat.', fix: 'Loose blocks never run. Drag them until they click into place under “when ▶ clicked”.' },
    tryIt: { q: 'Which block must go at the very top of a program that starts when you click the green flag?', a: '“when ▶ clicked” — the hat block.' },
    realWorld: 'A washing machine runs a sequence too: fill with water, wash, rinse, spin — always in that order.',
    summary: ['A sequence runs top to bottom', 'Programs start with a hat block', 'Reset before every test'],
  },

  4: {
    objectives: [
      'I can explain what a bug is',
      'I can find a wrong block by watching the program run',
      'I can fix one thing at a time and test again',
    ],
    big: 'Dot was meant to reach the star but went the wrong way. How would you find out why?',
    explain: [
      'A bug is a mistake in a program that makes it do something we didn’t want. Debugging means finding the bug and fixing it.',
      'Good debuggers have a plan: run the program, watch carefully, and spot the first moment it goes wrong. The bug is usually in the block just before that moment.',
      'Change only ONE thing, then test again. If you change lots of things at once you won’t know which change fixed it — or which one made it worse.',
    ],
    example: {
      type: 'compare',
      title: 'Spot the bug',
      left: { label: '🐞 Buggy: Dot goes up', blocks: true, items: ['when ▶ clicked', 'move 3', 'turn left', 'move 2'] },
      right: { label: '✅ Fixed: Dot goes down to the star', blocks: true, items: ['when ▶ clicked', 'move 3', 'turn right', 'move 2'] },
      caption: 'Only one block changed: turn left → turn right.',
    },
    mistake: { wrong: 'Changing lots of blocks at once when something goes wrong.', fix: 'Change one block, test, then decide. One change at a time.' },
    tryIt: { q: 'Describe this bug in one sentence: “I expected Dot to stop on the star, but…”', a: 'For example: “…Dot turned left instead of right, so it went up instead of down.” A good bug sentence says what you expected AND what really happened.' },
    realWorld: 'The word “bug” became famous in 1947 when a real moth was found stuck inside a computer!',
    summary: ['A bug is a mistake in the code', 'Watch for the first thing that goes wrong', 'Change one thing, then test again'],
  },

  6: {
    objectives: [
      'I can split a routine into phases',
      'I can write success criteria for a project',
      'I can sketch a first version before I code',
    ],
    big: 'If you had to teach a robot your morning routine, where would you start?',
    explain: [
      'A project is a big job. Good programmers plan before they build, so they don’t get lost halfway.',
      'First, split the job into phases — big chunks such as “wake up”, “get ready” and “leave the house”. Then list the steps inside each phase.',
      'Success criteria say what “finished and good” looks like, so everyone can check the work fairly. Sketch your plan on paper first — paper is quick to change!',
    ],
    example: {
      type: 'table',
      title: 'Robot morning routine — plan',
      head: ['Phase', 'Steps'],
      rows: [['1 · Wake up', 'Alarm rings → stretch → get out of bed'], ['2 · Get ready', 'Wash → get dressed → eat breakfast'], ['3 · Leave', 'Pack bag → shoes on → wave goodbye']],
    },
    mistake: { wrong: 'Jumping straight onto the computer with no plan.', fix: 'Plan the phases and criteria first. Ten minutes of planning saves an hour of fixing.' },
    tryIt: { q: 'Write one success criterion for the robot routine.', a: 'For example: “The robot does all three phases in the right order” or “Every phase has at least three steps.”' },
    realWorld: 'Engineers sketch and plan every new game, app and robot before writing a single line of code.',
    summary: ['Split a big job into phases', 'Success criteria say what “good” looks like', 'Sketch and plan before you build'],
  },

  7: {
    objectives: [
      'I can explain that a loop repeats a set of steps',
      'I can replace repeated blocks with a repeat block',
      'I can fix a loop that repeats the wrong number of times',
    ],
    big: 'If Dot had to clap 100 times, would you really write “clap” 100 times?',
    explain: [
      'A loop repeats a set of instructions. Instead of writing the same blocks again and again, we wrap them in a repeat block and say how many times.',
      'To draw a square, Dot moves and turns, moves and turns, four times. With a loop that becomes: repeat 4 { move, turn }. Shorter, and much easier to change.',
      'The number in the repeat matters. Repeat 3 for a square leaves a side missing; repeat 4 is just right.',
    ],
    example: {
      type: 'compare',
      title: 'Same square, two programs',
      left: { label: 'Without a loop — 8 blocks', blocks: true, items: ['move 3', 'turn right', 'move 3', 'turn right', 'move 3', 'turn right', 'move 3', 'turn right'] },
      right: { label: 'With a loop — 3 blocks', blocks: true, items: ['repeat 4', '  move 3', '  turn right', 'end'] },
    },
    mistake: { wrong: 'repeat 3 { move, turn } to draw a square.', fix: 'A square has 4 sides, so it needs repeat 4. Count the sides before you set the number.' },
    tryIt: { q: 'How many times should you repeat “move, turn” to draw a triangle?', a: '3 times — a triangle has 3 sides.' },
    realWorld: 'A dishwasher loops: spray, scrub, spray, scrub… A music app loops a song you love.',
    summary: ['A loop repeats steps', 'Loops make programs shorter', 'Check the repeat number is right'],
  },

  8: {
    objectives: [
      'I can explain what an event is',
      'I can start scripts with different event blocks',
      'I can predict which script runs when something happens',
    ],
    big: 'What makes a game start? What makes a character jump?',
    explain: [
      'An event is something that happens which makes code start. Clicking the green flag is an event. So is clicking a sprite, or pressing a key.',
      'Every script begins with an event hat block. The script waits quietly until its event happens, then runs.',
      'One project can have lots of scripts, each waiting for a different event. That is how games react to the player.',
    ],
    example: {
      type: 'compare',
      title: 'Two scripts, two events',
      left: { label: 'Runs at the start', blocks: true, items: ['when ▶ clicked', 'go to start', 'say Hello!'] },
      right: { label: 'Runs when you press space', blocks: true, items: ['when space key pressed', 'move 1', 'play sound boing'] },
    },
    mistake: { wrong: 'Expecting a “when space key pressed” script to run when you click the green flag.', fix: 'Each script only runs for its own event. Press space to test that script.' },
    tryIt: { q: 'A game should play a sound when you click on the cat. Which event block do you need?', a: '“when this sprite clicked”.' },
    realWorld: 'Every tap on a phone is an event: tapping an app icon makes the app’s code start running.',
    summary: ['An event starts a script', 'Every script begins with a hat', 'Different events, different scripts'],
  },

  9: {
    objectives: [
      'I can use the pen to draw as a sprite moves',
      'I can make a pattern with a loop',
      'I can change one number and predict the new pattern',
    ],
    big: 'How could a computer draw a flower made of squares?',
    explain: [
      'When the pen is down, a sprite leaves a line wherever it moves — like dragging a pencil across paper. Pen up stops the line.',
      'A pattern is something that repeats in a regular way. Loops are perfect for patterns: draw a shape, turn a little, and repeat.',
      'Change one number and the whole pattern changes. Bigger turns make fewer petals; smaller turns make more.',
    ],
    example: {
      type: 'blocks',
      title: 'A square flower',
      blocks: ['when ▶ clicked', 'pen down', 'repeat 8', '  repeat 4', '    move 50', '    turn right 90', '  end', '  turn right 45', 'end'],
      caption: 'Draw a square, turn 45°, and do it 8 times: 8 × 45° = a full circle of squares.',
    },
    mistake: { wrong: 'Forgetting “pen down”, so the sprite moves but nothing is drawn.', fix: 'Put pen down before you move. Use pen up to move without drawing.' },
    tryIt: { q: 'Which turn makes a square: 45°, 90° or 120°?', a: '90° — a quarter turn. Four quarter turns make a full turn.' },
    realWorld: 'Wallpaper, fabric and video-game backgrounds are often drawn by code using repeating patterns.',
    summary: ['Pen down draws, pen up stops', 'Loops make patterns', 'One number can change the whole pattern'],
  },

  10: {
    objectives: [
      'I can explain that a variable stores a value that can change',
      'I can set a score to 0 at the start of a game',
      'I can change a score when something happens',
    ],
    big: 'How does a game remember your score?',
    explain: [
      'A variable is like a labelled box that stores a value. The label is its name, such as “score”, and the value inside can change.',
      'At the start of a game we set score to 0. When the player collects a coin we change score by 1. The box now holds 1, then 2, then 3…',
      'Variables let programs remember things: lives, time left, coins, level.',
    ],
    example: {
      type: 'compare',
      title: 'Keeping score',
      left: { label: 'At the start', blocks: true, items: ['when ▶ clicked', 'set score to 0', 'show variable score'] },
      right: { label: 'When you get a coin', blocks: true, items: ['when I receive coin', 'change score by 1', 'play sound ding'] },
    },
    mistake: { wrong: 'Forgetting to set score to 0 at the start.', fix: 'Without a reset, the new game starts with the old score. Always set variables at the beginning.' },
    tryIt: { q: 'Score starts at 0. You collect 3 coins (+1 each) and hit a spike (−1). What is the score?', a: '2  (0 + 1 + 1 + 1 − 1)' },
    realWorld: 'A football scoreboard is a variable for each team: it starts at 0 and changes every time someone scores.',
    summary: ['A variable is a named box', 'Set it at the start', 'Change it when something happens'],
  },

  11: {
    objectives: [
      'I can break a big problem into smaller parts',
      'I can put the parts in an order that works',
      'I can check a partner can follow my plan',
    ],
    big: 'How do you eat an elephant? (One bite at a time!)',
    explain: [
      'Decomposition means breaking a big problem into smaller problems that are easier to solve.',
      'Small jobs are easier to understand, easier to share with a team and easier to check. When every small job is done, the big job is done.',
      'Keep breaking a job down until each piece is something you could actually do right now.',
    ],
    example: {
      type: 'table',
      title: 'Decompose: plan a class party',
      head: ['Smaller job', 'Even smaller steps'],
      rows: [['Invitations', 'Choose a date → write invites → hand them out'], ['Food', 'Ask about allergies → choose snacks → set the table'], ['Games', 'Pick 3 games → collect equipment → explain the rules'], ['Tidy up', 'Bin bags → wipe tables → stack chairs']],
    },
    mistake: { wrong: 'Sub-jobs that are still too big, like “make the game”.', fix: 'Ask “Could I start this right now?” If not, break it down again.' },
    tryIt: { q: 'Break “tidy the classroom” into four smaller jobs.', a: 'For example: books back on shelves, pencils into pots, chairs under tables, rubbish in the bin.' },
    realWorld: 'Building a house is decomposed into foundations, walls, roof, wiring and painting — different teams do each part.',
    summary: ['Decomposition = break it down', 'Small jobs are easier to solve', 'Keep breaking until you can start'],
  },

  13: {
    objectives: [
      'I can build my project one phase at a time',
      'I can test my work against our success criteria',
      'I can give and use kind, helpful feedback',
    ],
    big: 'How do you know when a project is really finished?',
    explain: [
      'Build one phase at a time and test it before you start the next. Small tests catch bugs early, while they are easy to find.',
      'When you think you are done, check every success criterion. Can you tick them all? If not, that is your next job.',
      'Feedback helps us improve. Use “two stars and a wish”: two things that work well and one thing that could be even better.',
    ],
    example: {
      type: 'table',
      title: 'Checking our robot routine',
      head: ['Success criterion', 'Done?'],
      rows: [['All three phases are included', '✅'], ['Phases are in the right order', '✅'], ['Each phase has at least three steps', '❌ “Leave” only has two']],
    },
    mistake: { wrong: 'Building everything, then testing only at the very end.', fix: 'Test after each phase. If something breaks, you know exactly where to look.' },
    tryIt: { q: 'Your robot does “get ready” before “wake up”. Which criterion fails, and how do you fix it?', a: '“Phases are in the right order” fails. Move the wake-up blocks above the get-ready blocks.' },
    realWorld: 'App makers release small updates and test each one, rather than changing everything at once.',
    summary: ['Build and test one phase at a time', 'Check every success criterion', 'Two stars and a wish'],
  },

  14: {
    objectives: [
      'I can explain what data is',
      'I can collect data with a tally',
      'I can say what my data shows in a sentence',
    ],
    big: 'What could we find out about our class without asking anyone’s name?',
    explain: [
      'Data is facts and information. It can be numbers, words, pictures, sounds or measurements.',
      'We collect data to answer a question, like “What is our class’s favourite fruit?”. A tally chart is a quick way to count as we collect.',
      'Good data collectors keep people private: we count answers, we don’t need names.',
    ],
    example: {
      type: 'table',
      title: 'Question: what is our favourite fruit?',
      head: ['Fruit', 'Tally', 'Total'],
      rows: [['🍎 Apple', '𝍸 ||', '7'], ['🍌 Banana', '𝍸 𝍸 |', '11'], ['🍓 Strawberry', '𝍸 𝍸 𝍸', '15'], ['🍇 Grapes', '||||', '4']],
      caption: 'Each 𝍸 is a gate of five. The data shows strawberries are the class favourite.',
    },
    mistake: { wrong: 'Writing down people’s names and addresses when you only need to count answers.', fix: 'Only collect the data you need to answer your question.' },
    tryIt: { q: 'Which of these are data: today’s temperature, a photo of a tree, the number of pupils in our class?', a: 'All of them! Numbers, pictures and facts are all data.' },
    realWorld: 'Weather forecasters collect millions of pieces of data — temperature, wind, rain — to predict tomorrow’s weather.',
    summary: ['Data is facts and information', 'Tallies help us count', 'Collect only what you need'],
  },

  15: {
    objectives: [
      'I can choose a question to investigate',
      'I can show data in a clear chart',
      'I can read a chart and explain what it shows',
    ],
    big: 'Why might a chart be easier to understand than a long list of answers?',
    explain: [
      'Data detectives follow four steps: ask a question → collect data → present it → explain what it shows.',
      'A bar chart turns numbers into pictures. The taller the bar, the bigger the number, so you can compare at a glance.',
      'A good chart has a title, labels on both axes and bars that are the same width.',
    ],
    example: {
      type: 'bars',
      title: 'How do we get to school?',
      data: [['Walk', 12], ['Car', 8], ['Bus', 5], ['Bike', 3], ['Scooter', 2]],
      caption: 'Walking is most popular. 4 more pupils walk than come by car.',
    },
    mistake: { wrong: 'A chart with no title or labels.', fix: 'Without labels nobody knows what the bars mean. Always add a title and label the axes.' },
    tryIt: { q: 'Using the chart: how many pupils come by bus or bike altogether?', a: '8  (5 by bus + 3 by bike)' },
    realWorld: 'Supermarkets chart what people buy so they know how much bread to bake tomorrow.',
    summary: ['Question → collect → present → explain', 'Bar charts make comparing easy', 'Title and labels every time'],
  },

  16: {
    objectives: [
      'I can explain how a program stores data',
      'I can use an answer typed by the user',
      'I can predict what a program will show',
    ],
    big: 'How could a program say hello to you using your name?',
    explain: [
      'Programs use data all the time. They store it in variables so they can use it later.',
      'The “ask” block lets the user type something in. Whatever they type is stored in a special variable called “answer”.',
      'The program can then use that data — to greet you, to check if you are right, or to keep track of a score.',
    ],
    example: {
      type: 'blocks',
      title: 'A friendly program',
      blocks: ['when ▶ clicked', 'ask What is your name? and wait', 'say join Hello  answer', 'set lives to 3'],
      caption: 'If you type “Amira”, the sprite says “Hello Amira”. The program also stores lives = 3.',
    },
    mistake: { wrong: 'Using “answer” before the “ask” block has run.', fix: 'The answer box is empty until someone types. Ask first, then use the answer.' },
    tryIt: { q: 'A game timer starts at 30 and goes down by 1 every second. What does it show after 10 seconds?', a: '20' },
    realWorld: 'When a website says “Welcome back, Sam!”, it is using data it stored about you.',
    summary: ['Programs store data in variables', '“ask” collects data from the user', 'Use data to make programs respond'],
  },

  17: {
    objectives: [
      'I can use a search engine with good key words',
      'I can spot an advert in search results',
      'I can check information in two places before I believe it',
    ],
    big: 'If a website says something, does that make it true?',
    explain: [
      'A search engine finds web pages that match your key words. Choose a few important words, such as “tallest animal world”, rather than a long question.',
      'The first results are often adverts. Look for the word “Sponsored” or “Ad” — those companies paid to be at the top.',
      'Anyone can put anything online. Be a sceptic: ask who wrote it, and check a second trusted source before you believe it.',
    ],
    example: {
      type: 'steps',
      title: 'Smart search checklist',
      items: ['Use 2–4 key words', 'Skip results marked “Sponsored” or “Ad”', 'Ask: who made this website?', 'Check the fact on a second trusted site', 'Still not sure? Ask an adult'],
    },
    mistake: { wrong: 'Believing the very first result because it is at the top.', fix: 'Top results can be adverts. Check who wrote it and find a second source.' },
    tryIt: { q: 'One website says the Moon is made of cheese. How could you check?', a: 'Look at a second trusted source such as a science website, an encyclopedia or a library book — and check who wrote the first site.' },
    realWorld: 'Journalists must check facts with more than one source before a story is printed.',
    summary: ['Use good key words', 'Spot the adverts', 'Check two sources'],
  },

  18: {
    objectives: [
      'I can explain how to be kind online',
      'I can say what to do if someone is unkind',
      'I can name a trusted adult I could tell',
    ],
    big: 'Is being unkind online different from being unkind in the playground?',
    explain: [
      'Online, people can’t see your face or hear your voice, so words can feel stronger. Before you post or message, THINK: is it True, Helpful, Inspiring, Necessary and Kind?',
      'Things posted online can be copied and shared and are hard to delete. Keep your private information private, even with people you think you know.',
      'If someone is unkind to you or a friend: don’t reply, take a screenshot if you can, block them, and tell a trusted adult.',
    ],
    example: {
      type: 'compare',
      title: 'Replying to a friend’s drawing',
      left: { label: '❌ Unkind', items: ['“That’s rubbish.”', '“LOL who drew THAT?”', 'Sharing it to laugh at it'] },
      right: { label: '✅ Kind and helpful', items: ['“I love the colours!”', '“The dragon looks great — maybe add a tail?”', 'Asking before you share it'] },
    },
    mistake: { wrong: 'Replying to an unkind message with another unkind message.', fix: 'Don’t reply. Screenshot, block and tell. Adults can help sort it out.' },
    tryIt: { q: 'Someone in a game keeps sending you mean messages. What are three things you could do?', a: 'Don’t reply, block them, and tell a trusted adult (and take a screenshot if you can).' },
    realWorld: 'Most apps and games have report and block buttons, because kindness online matters to everyone.',
    summary: ['THINK before you post', 'Keep private information private', 'Don’t reply — block and tell'],
  },

  20: {
    objectives: [
      'I can plan an investigation as a team',
      'I can collect, present and explain data',
      'I can review our work against success criteria',
    ],
    big: 'What question about our school would you most like to answer with data?',
    explain: [
      'Today your team are data detectives. You will choose a question, collect the evidence, present it in a chart and share what you found out.',
      'Give everyone a role — question writer, data collector, chart maker, presenter — so the work is shared fairly.',
      'Finish with a conclusion: one clear sentence that answers your question using the data.',
    ],
    example: {
      type: 'steps',
      title: 'Data detective case file',
      items: ['Question: “Which playground game is most popular?”', 'Collect: tally 30 votes at lunchtime', 'Present: bar chart with a title and labels', 'Conclude: “Tag is most popular — 12 out of 30 votes.”'],
    },
    mistake: { wrong: 'A conclusion that doesn’t use the data, such as “Tag is the best game”.', fix: 'Use numbers from your chart: “Tag got the most votes: 12 out of 30.”' },
    tryIt: { q: 'Your chart shows 9 votes for football and 6 for skipping. Write a conclusion.', a: 'For example: “Football is more popular than skipping — 3 more people voted for it.”' },
    realWorld: 'Councils survey people before building a new park, so they build what people really want.',
    summary: ['Question → collect → present → conclude', 'Everyone has a role', 'Use numbers in your conclusion'],
  },

  21: {
    objectives: [
      'I can make digital art using code',
      'I can use loops and colour changes to make a design',
      'I can change one value and explain what changed',
    ],
    big: 'Can a computer be an artist?',
    explain: [
      'Digital art can be made by writing code instead of using a brush. The artist writes the rules and the computer draws.',
      'Loops repeat shapes, turns spin them round, and changing the pen colour each time makes rainbows.',
      'Adding “pick random” makes the art different every time you press the flag — no two pictures the same!',
    ],
    example: {
      type: 'blocks',
      title: 'Rainbow star',
      blocks: ['when ▶ clicked', 'pen down', 'repeat 36', '  change pen colour by 10', '  move 100', '  turn right 170', 'end'],
      caption: '36 lines, each a slightly different colour, turning almost all the way round each time.',
    },
    mistake: { wrong: 'Changing several numbers at once and not knowing what made the difference.', fix: 'Change one number at a time, predict, then run. That’s how artists who code experiment.' },
    tryIt: { q: 'What do you think happens if “repeat 36” becomes “repeat 18”?', a: 'Only half the lines are drawn, so the star has half as many points and looks less full.' },
    realWorld: 'Film studios use code to draw millions of leaves, hairs and waves that would take forever by hand.',
    summary: ['Code can make art', 'Loops + turns + colour = patterns', 'Experiment one change at a time'],
  },

  22: {
    objectives: [
      'I can animate a sprite by changing costumes',
      'I can use wait blocks to control timing',
      'I can sequence scenes to tell a story',
    ],
    big: 'How do cartoons make pictures look like they are moving?',
    explain: [
      'Animation is lots of pictures shown quickly, one after another. Our eyes blend them into movement.',
      'In block coding, each picture is a costume. “Next costume” switches to the next picture; a short wait controls the speed.',
      'A story is a sequence of events: characters speak, move and change in order. Wait blocks give the audience time to read.',
    ],
    example: {
      type: 'blocks',
      title: 'Walking cat',
      blocks: ['when ▶ clicked', 'say Once upon a time… for 2 seconds', 'repeat 10', '  next costume', '  move 10', '  wait 0.2', 'end', 'say The end! for 2 seconds'],
    },
    mistake: { wrong: 'No wait block, so the costumes change too fast to see.', fix: 'Add a short wait (like 0.2 seconds) inside the loop.' },
    tryIt: { q: 'The cat runs much too fast. Which number would you change, and how?', a: 'Make the wait longer, e.g. 0.2 → 0.5 seconds (or make the move smaller).' },
    realWorld: 'Animated films show 24 pictures every second — that’s 144,000 pictures in a 100-minute film!',
    summary: ['Animation = pictures changing quickly', 'Costumes + wait = movement', 'Stories are sequences of events'],
  },

  23: {
    objectives: [
      'I can explain the driver and navigator roles',
      'I can share a coding task fairly with a partner',
      'I can give my partner clear, kind instructions',
    ],
    big: 'Is it easier to code alone or with a partner? Why?',
    explain: [
      'Pair programming means two people working on one program together.',
      'The driver uses the mouse and keyboard. The navigator reads the plan, spots mistakes and says what comes next. Swap roles every few minutes so both people do both jobs.',
      'Talk kindly and clearly: “Let’s try a turn right there” works better than “No, that’s wrong!”',
    ],
    example: {
      type: 'compare',
      title: 'Two roles, one goal',
      left: { label: '🖱️ Driver', items: ['Controls the mouse and keyboard', 'Builds the blocks', 'Says what they are doing'] },
      right: { label: '🧭 Navigator', items: ['Reads the plan', 'Spots bugs early', 'Suggests the next step'] },
      caption: 'Swap every 5 minutes.',
    },
    mistake: { wrong: 'One person does everything while the other watches.', fix: 'Set a timer and swap. Both of you must be able to explain the program.' },
    tryIt: { q: 'Your partner (the driver) puts a block in the wrong place. What could you say?', a: 'Something kind and clear, e.g. “I think that turn should go after the move — shall we test it?”' },
    realWorld: 'Many software companies make programmers work in pairs because they make fewer mistakes.',
    summary: ['Driver builds, navigator guides', 'Swap roles often', 'Kind, clear talk'],
  },

  24: {
    objectives: [
      'I can test a program on purpose',
      'I can compare what I expected with what happened',
      'I can report a bug clearly and kindly',
    ],
    big: 'How can you prove a program works?',
    explain: [
      'Testing means trying a program on purpose to see if it does what it should.',
      'Before each test, write what you EXPECT to happen. Then run it and write what ACTUALLY happened. If they are different, you have found a bug.',
      'Report bugs kindly and clearly so your buddy can fix them: what you did, what you expected, what happened.',
    ],
    example: {
      type: 'table',
      title: 'Test table for a quiz game',
      head: ['Test', 'Expected', 'Actual', 'Pass?'],
      rows: [['Press the flag', 'Score shows 0', 'Score shows 0', '✅'], ['Type the right answer', 'Score goes to 1', 'Score goes to 1', '✅'], ['Type a wrong answer', 'Says “Try again”', 'Score goes up!', '❌']],
    },
    mistake: { wrong: 'Only testing the right answers.', fix: 'Test wrong answers and silly answers too — that’s where bugs hide.' },
    tryIt: { q: 'Write a kind bug report for the failed test above.', a: 'For example: “When I typed a wrong answer, I expected ‘Try again’, but the score went up by 1.”' },
    realWorld: 'Game companies hire testers whose whole job is to try to break games before players do.',
    summary: ['Testing proves it works', 'Expected vs actual', 'Report bugs clearly and kindly'],
  },

  25: {
    objectives: [
      'I can explain that a network is devices connected to share messages',
      'I can describe what happens when a link breaks',
      'I can explain why passwords protect a network',
    ],
    big: 'How does a message get from your tablet to a friend’s tablet in another school?',
    explain: [
      'A network is two or more devices connected so they can share information. Our school computers are joined in a network.',
      'Devices connect with cables or with Wi-Fi (radio waves). Messages travel along the links, often through a router that sends them the right way.',
      'If a link breaks, messages can’t get through — unless there is another route. Passwords stop strangers joining the network and reading private messages.',
    ],
    example: {
      type: 'steps',
      title: 'A message’s journey',
      items: ['Your tablet sends the message over Wi-Fi', 'The school router passes it on', 'It travels across the internet', 'Your friend’s school router receives it', 'Their tablet shows the message'],
    },
    mistake: { wrong: '“Wi-Fi means there are no connections.”', fix: 'Wi-Fi is still a connection — it just uses invisible radio waves instead of a cable.' },
    tryIt: { q: 'In our string network, the string between two pupils is cut. What happens to messages that used that link?', a: 'They can’t get through that way. They need another route, or they stop until it is fixed.' },
    realWorld: 'The internet is the biggest network of all — billions of devices joined together around the world.',
    summary: ['A network connects devices', 'Messages travel along links', 'Passwords keep networks safe'],
  },

  27: {
    objectives: [
      'I can design a poster and sprite for an audience',
      'I can use code to make my sprite share a message',
      'I can improve my work using feedback',
    ],
    big: 'What makes a poster catch your eye?',
    explain: [
      'Every design has an audience — the people who will see it. A poster for Year 1 looks different from a poster for grown-ups.',
      'Your mission poster has a clear title, a few key words and a sprite that tells people the message when they click it.',
      'Use the success criteria to check your work, then ask a partner for two stars and a wish.',
    ],
    example: {
      type: 'blocks',
      title: 'Poster sprite',
      blocks: ['when this sprite clicked', 'play sound pop', 'say Save energy — switch off the lights! for 3 seconds', 'next costume'],
    },
    mistake: { wrong: 'Too much writing in tiny text.', fix: 'Big title, few words, clear picture. Let the sprite say the extra details.' },
    tryIt: { q: 'Who is the audience for a poster about road safety in the infant playground?', a: 'Young children (and their parents) — so it needs big pictures and simple words.' },
    realWorld: 'Advert designers test posters with real people before they print thousands of copies.',
    summary: ['Know your audience', 'Clear title, few words', 'Improve with feedback'],
  },

  28: {
    objectives: [
      'I can explain what a condition is',
      'I can use “if … then” to make a program decide',
      'I can predict what happens when the condition is true or false',
    ],
    big: 'If it is raining, what do you take to school?',
    explain: [
      'People make decisions all the time: IF it is raining THEN take an umbrella.',
      'The bit after “if” is called a condition. It is a question with only two answers: true or false. If it is true, the code inside runs. If it is false, it is skipped.',
      'Decisions make programs clever: a game can check IF the player touched a coin THEN add a point.',
    ],
    example: {
      type: 'flow',
      title: 'A decision in a game',
      question: 'Is Dot touching red?',
      yes: 'say “Ouch!” and go back to start',
      no: 'keep moving',
      blocks: ['forever', '  move 1', '  if touching red? then', '    say Ouch!', '    go to start', '  end', 'end'],
    },
    mistake: { wrong: 'Checking the condition only once at the start.', fix: 'Put the “if” inside a forever loop so the game keeps checking.' },
    tryIt: { q: 'IF the score is 10 THEN say “You win!”. The score is 7. What happens?', a: 'Nothing — the condition is false, so the “You win!” block is skipped.' },
    realWorld: 'Automatic doors use a condition: IF someone is near THEN open.',
    summary: ['A condition is true or false', 'If true, the code runs', 'Keep checking inside a loop'],
  },

  29: {
    objectives: [
      'I can name inputs and outputs on a device',
      'I can explain input → process → output',
      'I can build a program that reacts to an input',
    ],
    big: 'How does a computer know you have pressed a key?',
    explain: [
      'An input is information going INTO a computer: a key press, a mouse click, your voice in a microphone, a sensor reading.',
      'The computer processes the input — it follows its program to decide what to do.',
      'An output is what comes OUT: a picture on the screen, a sound from a speaker, a motor turning, a light turning on.',
    ],
    example: {
      type: 'table',
      title: 'Input → process → output',
      head: ['Input', 'Process', 'Output'],
      rows: [['Press the right arrow', 'Program says: move right', 'Sprite moves on screen'], ['Clap near the microphone', 'Is it loud? Yes', 'Robot lights flash'], ['Press a lift button', 'Which floor?', 'Lift moves, door opens']],
    },
    mistake: { wrong: 'Mixing up inputs and outputs, e.g. “the speaker is an input”.', fix: 'Ask: is information going in or coming out? Speakers send sound out, so they are outputs.' },
    tryIt: { q: 'Sort these: keyboard, screen, microphone, speaker, mouse, printer.', a: 'Inputs: keyboard, microphone, mouse. Outputs: screen, speaker, printer.' },
    realWorld: 'A self-checkout: scanning a barcode is the input, the till works out the price, the screen and beep are outputs.',
    summary: ['Inputs go in', 'The program processes', 'Outputs come out'],
  },

  30: {
    objectives: [
      'I can work on a shared document safely',
      'I can leave kind and helpful comments',
      'I can explain why we never share passwords',
    ],
    big: 'How can a whole class work on the same document at the same time?',
    explain: [
      'Online tools let people write, draw and build together, even from different rooms. Everyone sees changes as they happen.',
      'Only share work with people you know in real life, like your class and teacher. Keep your password to yourself — even from friends — because anyone with it can pretend to be you.',
      'Leave comments that are kind, specific and helpful. Never delete or spoil other people’s work.',
    ],
    example: {
      type: 'compare',
      title: 'Comments on a shared story',
      left: { label: '❌ Not helpful', items: ['“Boring.”', 'Deleting a friend’s paragraph', 'Typing in someone else’s section'] },
      right: { label: '✅ Helpful', items: ['“Great opening! Could the dragon have a name?”', 'Adding a suggestion as a comment', 'Asking before changing their work'] },
    },
    mistake: { wrong: 'Telling your best friend your password “because we share everything”.', fix: 'Passwords are never shared — only with a trusted adult at home or school if needed.' },
    tryIt: { q: 'You don’t like how your partner has written the ending. What should you do?', a: 'Leave a kind comment with a suggestion, or talk to them — don’t delete their work.' },
    realWorld: 'Scientists in different countries write research papers together using shared online documents.',
    summary: ['Share only with people you know', 'Kind, specific comments', 'Passwords stay private'],
  },

  31: {
    objectives: [
      'I can plan a robot’s route before I code it',
      'I can write the route as numbered steps',
      'I can test the route in the simulator and fix it',
    ],
    big: 'Why do engineers test robots in a simulator before using a real one?',
    explain: [
      'A simulator is a computer model of the real world. Engineers test robots there first — a crash in a simulator costs nothing!',
      'Plan the route on paper: draw the path, count the squares, and note every turn.',
      'Turn your plan into numbered steps, then into blocks. Test, find the first mistake, fix it, test again.',
    ],
    example: {
      type: 'grid',
      title: 'Plan the route',
      cols: 6, rows: 4, start: [0, 3], dir: 'right',
      program: ['move 3', 'turn left', 'move 2', 'turn right', 'move 2'],
      path: [[0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [4, 1], [5, 1]],
      walls: [[2, 1], [4, 2], [4, 3]],
      caption: 'Count first, then code: 3 along, up 2, 2 along — avoiding the walls.',
    },
    mistake: { wrong: 'Coding the whole route without testing any of it.', fix: 'Test after the first turn. If Dot is in the right place, keep going.' },
    tryIt: { q: 'Dot faces right and must go 2 right then 3 down. Write the steps.', a: 'move 2 → turn right → move 3' },
    realWorld: 'Mars rovers are tested in simulators on Earth before every drive, because nobody can go and rescue them!',
    summary: ['Plan on paper first', 'Turn the plan into steps', 'Test, fix, test again'],
  },

  32: {
    objectives: [
      'I can explain what a system is',
      'I can describe a simple system as steps that repeat',
      'I can use code to simulate a system',
    ],
    big: 'How does a traffic light know when to change?',
    explain: [
      'A system is a set of parts that work together to do a job. A traffic light, a school bell and a vending machine are all systems.',
      'Many systems follow the same steps over and over. A traffic light goes red → red and amber → green → amber → red… forever.',
      'A simulation is a program that copies how a real system works, so we can test ideas safely.',
    ],
    example: {
      type: 'blocks',
      title: 'Traffic light simulation',
      blocks: ['when ▶ clicked', 'forever', '  switch costume to red', '  wait 3', '  switch costume to red-amber', '  wait 1', '  switch costume to green', '  wait 3', '  switch costume to amber', '  wait 1', 'end'],
    },
    mistake: { wrong: 'Getting the order of the lights wrong.', fix: 'Watch a real crossing or check a diagram first. A simulation is only useful if it copies the real thing.' },
    tryIt: { q: 'What comes after green on a UK traffic light?', a: 'Amber (on its own), then red.' },
    realWorld: 'Engineers simulate traffic in a whole town before they add a new road or set of lights.',
    summary: ['A system is parts working together', 'Many systems repeat in a loop', 'Simulations copy real systems'],
  },

  34: {
    objectives: [
      'I can plan an interactive scene with a storyboard',
      'I can choose the events that make my scene react',
      'I can agree success criteria with my team',
    ],
    big: 'What makes a game or story fun to interact with?',
    explain: [
      'An interactive scene reacts to the user: click a character and they talk, press a key and something moves.',
      'Plan with a storyboard: draw each part of the scene in a box and write what event makes it happen.',
      'Agree your success criteria now, so you know what you are building and how you will check it.',
    ],
    example: {
      type: 'table',
      title: 'Storyboard: Dot’s garden',
      head: ['Box', 'What happens', 'Event'],
      rows: [['1', 'Dot says hello', 'when ▶ clicked'], ['2', 'A flower grows', 'when flower clicked'], ['3', 'Dot waters the flower', 'when space key pressed'], ['4', 'A bee flies in', 'when I receive watered']],
    },
    mistake: { wrong: 'Planning far too much for the time you have.', fix: 'Plan 3–4 boxes that you can definitely finish. You can add extras later.' },
    tryIt: { q: 'Write one success criterion for an interactive scene.', a: 'For example: “At least two sprites react when they are clicked.”' },
    realWorld: 'Every film and video game starts life as a storyboard.',
    summary: ['Interactive = reacts to the user', 'Storyboard each part and its event', 'Agree success criteria first'],
  },

  35: {
    objectives: [
      'I can build my project in small milestones',
      'I can test each milestone before moving on',
      'I can record what still needs fixing',
    ],
    big: 'What’s the smallest piece of your project you could finish and test today?',
    explain: [
      'A milestone is a small, finished part of a bigger project — like one box of your storyboard working properly.',
      'Build one milestone, test it, debug it, and only then move to the next.',
      'At the end of the lesson write a “next time” note: what works, and what still needs fixing.',
    ],
    example: {
      type: 'table',
      title: 'Build log',
      head: ['Milestone', 'Status'],
      rows: [['Dot says hello on green flag', '✅ works'], ['Flower grows when clicked', '✅ works'], ['Watering with space key', '🐞 waters twice — fix next lesson'], ['Bee flies in', '⏳ not started']],
    },
    mistake: { wrong: 'Starting box 4 while box 3 is still broken.', fix: 'Finish and fix one milestone before starting the next. Bugs pile up otherwise.' },
    tryIt: { q: 'The flower grows when you press the flag instead of when you click it. What would you check?', a: 'The event hat on the flower’s script — it should be “when this sprite clicked”, not “when ▶ clicked”.' },
    realWorld: 'Big apps are built in “sprints” — each sprint finishes and tests a small set of features.',
    summary: ['Build in milestones', 'Test before moving on', 'Keep a build log'],
  },

  36: {
    objectives: [
      'I can present my project and explain how it works',
      'I can use computing words to describe my code',
      'I can give and receive helpful feedback',
    ],
    big: 'How would you explain your project to someone who has never coded?',
    explain: [
      'When you present, show what your project does, then explain HOW: which events start it, where you used a loop or a variable, and a bug you fixed.',
      'Use the computing words you have learned: algorithm, sequence, event, loop, variable, debug.',
      'Reviewers give two stars (what works well) and a wish (one idea to make it even better).',
    ],
    example: {
      type: 'steps',
      title: 'Presentation recipe',
      items: ['Show it running', 'Explain one event and what it starts', 'Point to a loop or variable and say why you used it', 'Tell the story of one bug you fixed', 'Ask for two stars and a wish'],
    },
    mistake: { wrong: 'Feedback like “It’s good.”', fix: 'Be specific: “I liked how the bee only appears after watering — clever use of an event!”' },
    tryIt: { q: 'Give a specific star for a project where a cat jumps when you press space.', a: 'For example: “I like how you used ‘when space key pressed’ so the player controls the jump.”' },
    realWorld: 'Programmers present “demos” of their work to their team every few weeks.',
    summary: ['Show it, then explain how it works', 'Use computing vocabulary', 'Two stars and a wish'],
  },

  37: {
    objectives: [
      'I can share my best work from the year',
      'I can explain what I learned and how I improved',
      'I can celebrate other people’s work kindly',
    ],
    big: 'What are you most proud of from this year in computing?',
    explain: [
      'This year you learned to think like a programmer: algorithms, sequences, loops, events, variables, decisions and debugging.',
      'Today we celebrate. Choose one piece of work you are proud of, and be ready to say what it does and what you learned making it.',
      'Visit other people’s work and leave a kind, specific comment.',
    ],
    example: {
      type: 'table',
      title: 'Our year in computing',
      head: ['Big idea', 'What it means'],
      rows: [['Algorithm', 'Steps in order to solve a problem'], ['Loop', 'Repeat steps'], ['Event', 'Something that starts code'], ['Variable', 'A named box that stores a value'], ['Condition', 'A true/false question for decisions'], ['Debug', 'Find and fix mistakes']],
    },
    mistake: { wrong: 'Thinking mistakes mean you are bad at coding.', fix: 'Every programmer makes bugs. Fixing them is how you got better!' },
    tryIt: { q: 'Which big idea did you use most this year? Give an example.', a: 'Answers will vary, e.g. “Loops — I used repeat 4 to draw squares in my flower pattern.”' },
    realWorld: 'Next year you will build bigger games with nested loops, lists and if-else decisions.',
    summary: ['Celebrate your progress', 'Explain what you learned', 'Kind, specific comments'],
  },
};
