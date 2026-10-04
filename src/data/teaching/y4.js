/** Year 4 teaching content (ages 8–9). Same shape as y3.js. */
export default {
  0: {
    objectives: [
      'I can organise my work into files and folders',
      'I can explain the difference between an app and a file',
      'I can use school systems responsibly',
    ],
    big: 'You saved your story yesterday. Where is it now — and how would you find it fast?',
    explain: [
      'A computer system has hardware (the parts you can touch) and software (the programs that run on it). Apps are software that do jobs for us, like drawing or writing.',
      'The work you make in an app is saved as a file. Files live in folders, and folders can sit inside other folders — like drawers in a cupboard.',
      'Good file names say what is inside: “Y4-Science-Plants-Report” is easier to find than “Untitled 7”. Being responsible means saving carefully, logging out, and only opening your own work.',
    ],
    example: {
      type: 'steps',
      title: 'A tidy folder path',
      items: ['📁 My Work', '  📁 Computing', '    📁 Spring term', '      📄 Y4-Maze-Game-Plan.docx'],
      caption: 'Each folder narrows it down until you reach the exact file.',
    },
    mistake: { wrong: 'Saving everything as “Untitled” on the desktop.', fix: 'Give every file a clear name and put it in the right folder the first time.' },
    tryIt: { q: 'Is a drawing app a file or an app? Is your drawing of a castle a file or an app?', a: 'The drawing app is an app (software). Your castle picture is a file made with it.' },
    realWorld: 'Hospitals and businesses store millions of files — clear names and folders mean they can find the right one in seconds.',
    summary: ['Hardware + software = a system', 'Apps make files; files live in folders', 'Name files clearly and log out'],
  },

  1: {
    objectives: [
      'I can write an algorithm with several steps',
      'I can write pseudocode — code-like plain English',
      'I can check an algorithm by following it exactly',
    ],
    big: 'Could you write instructions so precise that a robot could score a penalty?',
    explain: [
      'Real problems need algorithms with many steps. Before coding them, programmers write pseudocode: instructions in plain English that look a bit like code.',
      'Pseudocode uses short, exact lines and words like REPEAT, IF and UNTIL. It doesn’t need perfect spelling of blocks — it’s for thinking clearly.',
      'Test pseudocode by acting it out exactly as written. If you have to guess, the algorithm isn’t precise enough yet.',
    ],
    example: {
      type: 'code',
      title: 'Pseudocode: take a penalty',
      code: 'PLACE ball on the spot\nWALK back 4 steps\nWAIT for the whistle\nRUN to the ball\nIF goalkeeper moves left\n    KICK to the right corner\nELSE\n    KICK to the left corner',
    },
    mistake: { wrong: '“Kick the ball really well.”', fix: 'Too vague! Precise steps say exactly what to do: where, how far, which direction.' },
    tryIt: { q: 'Rewrite “make a sandwich” as 5 lines of pseudocode.', a: 'For example: GET 2 slices of bread · SPREAD butter on one side of each · PLACE cheese on 1 slice · PUT the other slice on top · CUT in half.' },
    realWorld: 'Professional programmers often write pseudocode on a whiteboard before they write a single line of real code.',
    summary: ['Big problems need multi-step algorithms', 'Pseudocode = plain-English code', 'Test by following it exactly'],
  },

  2: {
    objectives: [
      'I can trace a long sequence and keep track of position and direction',
      'I can predict the outcome of a program with loops',
      'I can find the exact step where a prediction went wrong',
    ],
    big: 'How can you keep track when a program has 10 steps and lots of turns?',
    explain: [
      'Longer programs are harder to keep in your head, so we use a trace table: one row per step, writing down the position and direction after each one.',
      'When a loop appears, write out each time round the loop as its own rows. Slow and steady beats fast and wrong.',
      'Compare the trace to what really happened. The first row that doesn’t match is where the problem is.',
    ],
    example: {
      type: 'table',
      title: 'Trace table — Dot starts at (0,0) facing right',
      head: ['Step', 'Block', 'Position', 'Facing'],
      rows: [['1', 'move 2', '(2,0)', 'right'], ['2', 'turn right', '(2,0)', 'down'], ['3', 'move 1', '(2,1)', 'down'], ['4', 'turn left', '(2,1)', 'right'], ['5', 'move 3', '(5,1)', 'right']],
    },
    mistake: { wrong: 'Doing the whole trace in your head and losing count.', fix: 'Write every step in the table. It is how professional programmers do it too.' },
    tryIt: { q: 'Dot faces right at (0,0). Program: repeat 2 { move 2, turn right }. Where does Dot end and which way is it facing?', a: 'At (2,2) facing left. (move 2 → (2,0), turn → down, move 2 → (2,2), turn → left.)' },
    realWorld: 'Debugging tools in professional software show a trace of every step, just like a trace table.',
    summary: ['Use a trace table for long programs', 'Write out every loop pass', 'The first wrong row shows the bug'],
  },

  3: {
    objectives: [
      'I can draw regular shapes using repeat',
      'I can work out the turn angle for a shape',
      'I can change one number and predict the new shape',
    ],
    big: 'What do a square, a triangle and a hexagon have in common?',
    explain: [
      'A regular shape has equal sides and equal angles, so it can be drawn with one loop: repeat { move, turn }.',
      'The repeat number is the number of sides. The turn is 360 ÷ number of sides, because the sprite must turn a full circle (360°) by the end.',
      'Square: repeat 4, turn 90. Triangle: repeat 3, turn 120. Hexagon: repeat 6, turn 60.',
    ],
    example: {
      type: 'table',
      title: 'The shape rule: turn = 360 ÷ sides',
      head: ['Shape', 'Sides (repeat)', 'Turn'],
      rows: [['Triangle', '3', '120°'], ['Square', '4', '90°'], ['Pentagon', '5', '72°'], ['Hexagon', '6', '60°'], ['Octagon', '8', '45°']],
    },
    mistake: { wrong: 'Using turn 60 for a triangle (because the inside angle is 60°).', fix: 'The sprite turns the OUTSIDE angle: 360 ÷ 3 = 120°.' },
    tryIt: { q: 'What blocks draw a regular pentagon?', a: 'repeat 5 { move 80, turn right 72 }' },
    realWorld: 'Honeycombs, footballs and floor tiles use regular shapes because they fit together perfectly.',
    summary: ['Repeat = number of sides', 'Turn = 360 ÷ sides', 'One loop draws any regular shape'],
  },

  4: {
    objectives: [
      'I can choose a debugging strategy for a problem',
      'I can use “one change, then test” to find a bug',
      'I can explain a bug and its fix clearly',
    ],
    big: 'When your program is broken, what is the very first thing you do?',
    explain: [
      'Great debuggers have a toolbox of strategies and pick the right one for the job.',
      'Read it: trace the code slowly. Watch it: run it at slow speed and spot the first wrong moment. Split it: test one part on its own. Explain it: talk through each block to a partner (or a rubber duck!).',
      'Whatever strategy you use, change one thing at a time and test after each change.',
    ],
    example: {
      type: 'table',
      title: 'The debugging toolbox',
      head: ['Tool', 'When to use it'],
      rows: [['🔍 Trace it', 'Short programs — follow each block with a finger'], ['🐢 Slow it down', 'Things happen too fast to see'], ['✂️ Split it', 'Long programs — test one part at a time'], ['🦆 Explain it', 'You’re stuck — say each step out loud'], ['1️⃣ One change', 'Always — change one thing, then test']],
    },
    mistake: { wrong: 'Deleting the whole program and starting again.', fix: 'Most of it probably works! Find the one broken part and fix just that.' },
    tryIt: { q: 'Your game works for the first 10 seconds, then the score stops going up. Which tool would you try first?', a: 'Split it — test the scoring script on its own (or slow it down to watch what happens at 10 seconds).' },
    realWorld: '“Rubber duck debugging” is real: programmers explain their code to a toy duck and often spot the bug mid-sentence!',
    summary: ['Have a toolbox of strategies', 'Pick the right tool for the bug', 'One change, then test'],
  },

  6: {
    objectives: [
      'I can design an adventure game as an algorithm',
      'I can write success criteria for a game',
      'I can plan the first version I will build',
    ],
    big: 'What makes a good adventure game: the story, the challenge, or the choices?',
    explain: [
      'An adventure game is an algorithm with choices: the player moves through places, makes decisions and tries to reach a goal.',
      'Plan it as a map of scenes. For each scene write: what the player sees, what they can do, and where each choice leads.',
      'Agree success criteria and choose a small first version — two or three scenes that work — before adding more.',
    ],
    example: {
      type: 'table',
      title: 'Adventure plan: Dot’s lost key',
      head: ['Scene', 'Player choice', 'Leads to'],
      rows: [['Garden gate', 'Go left / go right', 'Pond / Shed'], ['Pond', 'Fish for the key', 'Key found → Win'], ['Shed', 'Open the box', 'Spider! → back to gate']],
    },
    mistake: { wrong: 'Planning 20 scenes for a 2-lesson project.', fix: 'Start with 3 scenes that work. Extra scenes are a bonus, not the plan.' },
    tryIt: { q: 'Write one success criterion for an adventure game.', a: 'For example: “Every choice leads somewhere — there are no dead ends.”' },
    realWorld: 'Games studios build a small “vertical slice” of a game first, to prove the idea works.',
    summary: ['Adventure game = algorithm with choices', 'Plan scenes and where choices lead', 'Build a small first version'],
  },

  7: {
    objectives: [
      'I can explain what a nested loop is',
      'I can use a loop inside a loop to make a pattern',
      'I can work out how many times the inner blocks run',
    ],
    big: 'How could you draw a row of 5 squares without writing the square code 5 times?',
    explain: [
      'A nested loop is a loop inside another loop. The inner loop runs all the way through every time the outer loop goes round once.',
      'To draw 5 squares: the inner loop draws one square (repeat 4 { move, turn }); the outer loop does that 5 times, moving along between squares.',
      'To count how many times the inner blocks run, multiply: outer × inner. 5 squares × 4 sides = 20 lines drawn.',
    ],
    example: {
      type: 'blocks',
      title: 'A row of 5 squares',
      blocks: ['when ▶ clicked', 'pen down', 'repeat 5', '  repeat 4', '    move 40', '    turn right 90', '  end', '  pen up', '  move 60', '  pen down', 'end'],
      caption: 'Outer loop: 5 squares. Inner loop: 4 sides each. 5 × 4 = 20 lines.',
    },
    mistake: { wrong: 'Putting the “move along” blocks inside the inner loop.', fix: 'Moving to the next square happens once per square, so it belongs in the OUTER loop.' },
    tryIt: { q: 'repeat 3 { repeat 6 { clap } }. How many claps?', a: '18  (3 × 6)' },
    realWorld: 'A clock is a nested loop: the minute hand goes round 60 times for every one time round of the hour.',
    summary: ['A nested loop is a loop inside a loop', 'Inner runs fully for each outer pass', 'Total = outer × inner'],
  },

  8: {
    objectives: [
      'I can use different events to control a program',
      'I can make sprites react to clicks and key presses',
      'I can use broadcast to make one sprite trigger another',
    ],
    big: 'In a game, how does pressing one key make several things happen?',
    explain: [
      'Interactive programs wait for events from the user: clicks, key presses, even sounds.',
      'Each sprite can have scripts for different events. The player is in control: their actions decide which code runs.',
      'Broadcast lets sprites talk to each other. One sprite broadcasts a message (“game over”), and any script starting “when I receive game over” runs.',
    ],
    example: {
      type: 'compare',
      title: 'One event, two sprites',
      left: { label: '🐱 Cat', blocks: true, items: ['when space key pressed', 'say Ready… go!', 'broadcast start race'] },
      right: { label: '🚗 Car', blocks: true, items: ['when I receive start race', 'repeat 20', '  move 10', 'end'] },
    },
    mistake: { wrong: 'Broadcasting “start race” but the car is waiting for “start-race”.', fix: 'Message names must match exactly. Use the dropdown to choose the same message.' },
    tryIt: { q: 'You want the music to stop when the player clicks the stop button sprite. Which two blocks do you need?', a: '“when this sprite clicked” on the button, and “stop all sounds” (or broadcast “stop” to the music sprite).' },
    realWorld: 'When you tap “send” on a message, the app broadcasts an event so the chat, the sound and the tick all update at once.',
    summary: ['Users trigger events', 'Each script waits for its event', 'Broadcast lets sprites talk'],
  },

  9: {
    objectives: [
      'I can program a sprite to collect items and reach a goal',
      'I can use “if touching” to detect a collection',
      'I can keep count of items collected',
    ],
    big: 'How does a game know you have picked up a coin?',
    explain: [
      'Collector games check over and over: IS the player touching a coin? That needs an if inside a forever loop.',
      'When the answer is yes, three things happen: the coin hides, the score goes up, and a sound plays.',
      'The goal can check the score: IF score = 5 THEN “You win!”. That is collector logic.',
    ],
    example: {
      type: 'blocks',
      title: 'Coin script',
      blocks: ['when ▶ clicked', 'show', 'forever', '  if touching Dot? then', '    change score by 1', '    play sound collect', '    hide', '  end', 'end'],
    },
    mistake: { wrong: 'Forgetting to hide the coin, so it is collected again and again.', fix: 'Hide the coin as soon as it is collected so the score only goes up once.' },
    tryIt: { q: 'There are 5 coins worth 1 point and 1 gem worth 5 points. What is the maximum score?', a: '10  (5 × 1 + 5)' },
    realWorld: 'Self-service checkouts use the same logic: IF an item is scanned THEN add its price to the total.',
    summary: ['Keep checking with forever + if', 'Collect = hide + score + sound', 'Check the score to win'],
  },

  10: {
    objectives: [
      'I can choose good names for variables',
      'I can use variables for lives, time and speed',
      'I can explain how a variable changes during a game',
    ],
    big: 'Which numbers does a game need to remember while you play?',
    explain: [
      'Variables matter because games depend on them: score, lives, timer, speed, level.',
      'Give variables clear names. “lives” is much better than “x”, because anyone reading the code knows what it stores.',
      'A variable can control other things: as “speed” goes up, the sprite moves faster — so the game gets harder.',
    ],
    example: {
      type: 'blocks',
      title: 'A game that speeds up',
      blocks: ['when ▶ clicked', 'set lives to 3', 'set speed to 2', 'forever', '  move speed', '  if touching edge? then', '    change speed by 1', '    turn right 180', '  end', 'end'],
      caption: 'Every bounce adds 1 to speed, so the sprite gets faster and faster.',
    },
    mistake: { wrong: 'Naming variables “a”, “b” and “thing”.', fix: 'Name the variable after what it stores: lives, timer, speed.' },
    tryIt: { q: 'lives starts at 3. The player is hit twice and collects one extra life. What is lives now?', a: '2  (3 − 1 − 1 + 1)' },
    realWorld: 'A fitness tracker stores variables for steps, heart rate and distance that change all day.',
    summary: ['Games depend on variables', 'Clear names, always', 'Variables can control other things'],
  },

  11: {
    objectives: [
      'I can break a game design into parts',
      'I can decide which part to build first',
      'I can write a short plan a partner could follow',
    ],
    big: 'If you were building a maze game, what are all the separate parts?',
    explain: [
      'A game is made of parts: characters, controls, the level, scoring, winning and losing. Decomposition splits the game into these parts.',
      'Each part becomes a small job you can build and test on its own.',
      'Build in a sensible order: controls first (so you can test), then the level, then scoring, then winning.',
    ],
    example: {
      type: 'table',
      title: 'Decompose: maze game',
      head: ['Part', 'What it needs', 'Build order'],
      rows: [['Player', 'Arrow keys move Dot', '1'], ['Level', 'Walls Dot can’t pass', '2'], ['Collectables', 'Coins add to score', '3'], ['Win / lose', 'Reach the flag; a timer runs out', '4']],
    },
    mistake: { wrong: 'Building the win screen before the player can even move.', fix: 'Build the parts you need to test everything else first.' },
    tryIt: { q: 'Decompose a “catch the falling fruit” game into four parts.', a: 'For example: basket controls, falling fruit, score, game over when 3 fruit are missed.' },
    realWorld: 'Big games have whole teams for each part: art, levels, sound, controls and testing.',
    summary: ['Split a game into parts', 'Each part is a small job', 'Build in a testable order'],
  },

  13: {
    objectives: [
      'I can build my adventure game in stages',
      'I can test every choice in my game',
      'I can improve my game using feedback',
    ],
    big: 'How can you be sure every path in your game works?',
    explain: [
      'Build one scene at a time and test it before moving on.',
      'Games with choices have many paths. Test each one on purpose — make every choice at least once — so no player gets stuck.',
      'Ask a partner to play without your help. Watch where they get confused: that is valuable feedback.',
    ],
    example: {
      type: 'table',
      title: 'Path testing',
      head: ['Path', 'Expected', 'Result'],
      rows: [['Gate → Pond → Fish', 'Win message', '✅'], ['Gate → Shed → Box', 'Back to gate', '✅'], ['Gate → Shed → Leave', 'Back to gate', '❌ game freezes']],
    },
    mistake: { wrong: 'Only testing the path that wins.', fix: 'Test every choice. Players will always try the path you didn’t!' },
    tryIt: { q: 'A game has 2 choices in scene 1 and 2 choices in each next scene. How many paths through 2 scenes?', a: '4  (2 × 2)' },
    realWorld: 'Testers map every possible path through apps so nobody ends up stuck on a blank screen.',
    summary: ['Build scene by scene', 'Test every path', 'Watch others play'],
  },

  14: {
    objectives: [
      'I can sort objects using yes/no questions',
      'I can build a branching database',
      'I can explain why good questions split groups clearly',
    ],
    big: 'Can you guess an animal by asking only yes/no questions?',
    explain: [
      'A branching database sorts things using yes/no questions. Each question splits the group into two smaller groups, like branches on a tree.',
      'Keep asking questions until every object is alone at the end of a branch.',
      'Good questions have clear answers anyone would agree on: “Does it have legs?” works; “Is it cute?” doesn’t, because people disagree.',
    ],
    example: {
      type: 'flow',
      title: 'Sorting animals',
      question: 'Does it live in water?',
      yes: 'Does it have legs? → yes: frog · no: fish',
      no: 'Can it fly? → yes: owl · no: dog',
    },
    mistake: { wrong: 'Asking opinion questions such as “Is it big?”', fix: 'Use questions with facts: “Is it longer than 1 metre?”' },
    tryIt: { q: 'Write a yes/no question that splits apple, banana, strawberry and grape into two groups.', a: 'For example: “Does it grow on a tree?” (apple, banana — yes; strawberry, grape — no).' },
    realWorld: 'Doctors and scientists use branching keys to identify illnesses, plants and minerals.',
    summary: ['Yes/no questions split groups', 'Keep going until each item is alone', 'Use clear, factual questions'],
  },

  15: {
    objectives: [
      'I can design a fair survey question',
      'I can choose the right chart for my data',
      'I can explain what my chart shows and what it doesn’t',
    ],
    big: 'Would asking only your best friends give a fair answer about the whole school?',
    explain: [
      'A survey collects answers from lots of people. Fair surveys ask clear questions and give sensible answer choices.',
      'Choose the chart that fits: bar charts compare categories; line graphs show change over time; pictograms are great for younger audiences.',
      'Be careful with conclusions. A survey of one class tells you about that class — not the whole country.',
    ],
    example: {
      type: 'bars',
      title: 'Favourite lunch — Year 4 (30 pupils)',
      data: [['Pasta', 11], ['Pizza', 9], ['Jacket potato', 6], ['Salad', 4]],
      caption: 'Pasta is most popular in Year 4 — but we can’t say that is true for the whole school.',
    },
    mistake: { wrong: 'A leading question: “Don’t you agree pizza is the best?”', fix: 'Ask neutrally: “Which lunch do you like most?” and list the options.' },
    tryIt: { q: 'You measured the temperature every day for a month. Which chart is best?', a: 'A line graph — it shows how the temperature changes over time.' },
    realWorld: 'Elections use huge, carefully designed surveys called polls to predict results.',
    summary: ['Fair questions, sensible choices', 'Pick the chart that fits the data', 'Don’t over-claim conclusions'],
  },

  16: {
    objectives: [
      'I can explain what a list is',
      'I can add items to a list and read them back',
      'I can use a list in a program',
    ],
    big: 'How would a game remember every item in your backpack?',
    explain: [
      'A variable stores one value. A list stores lots of values in order, under one name — like a shopping list.',
      'Each item has a position number: item 1, item 2, item 3… We can add items, remove items and ask how many there are.',
      'Lists are perfect for inventories, high scores, quiz questions and names of players.',
    ],
    example: {
      type: 'blocks',
      title: 'Backpack inventory',
      blocks: ['when ▶ clicked', 'delete all of backpack', 'add map to backpack', 'add torch to backpack', 'add key to backpack', 'say join I am carrying  length of backpack', 'say item 2 of backpack'],
      caption: 'Dot says “I am carrying 3”, then “torch” — the item in position 2.',
    },
    mistake: { wrong: 'Not clearing the list at the start, so items pile up every time you play.', fix: 'Start with “delete all of …” so each game begins with an empty list.' },
    tryIt: { q: 'The list is [apple, pear, plum, fig]. What is item 3? What is the length?', a: 'Item 3 is plum. The length is 4.' },
    realWorld: 'Your music playlist is a list: songs in order, and you can add, remove or shuffle them.',
    summary: ['A list stores many values in order', 'Items have position numbers', 'Clear the list at the start'],
  },

  17: {
    objectives: [
      'I can judge whether a website is reliable',
      'I can tell adverts from real search results',
      'I can check facts using more than one source',
    ],
    big: 'Two websites disagree. How do you decide which one to trust?',
    explain: [
      'Search results are ranked by a computer algorithm — not by how true they are. Adverts are paid for and can appear at the top.',
      'Check a website with questions: Who made it? Why did they make it (to inform, persuade or sell)? When was it updated? Do other trusted sites agree?',
      'Websites from museums, universities, the BBC or the government (.gov.uk) are usually reliable — but still check.',
    ],
    example: {
      type: 'table',
      title: 'Website detective questions',
      head: ['Ask', 'Good sign', 'Warning sign'],
      rows: [['Who?', 'A named expert or organisation', 'No author at all'], ['Why?', 'To inform or teach', 'To sell you something'], ['When?', 'Updated recently', 'Years out of date'], ['Agree?', 'Other sites say the same', 'Only this site says it']],
    },
    mistake: { wrong: '“It’s the first result, so it must be the best.”', fix: 'Ranking isn’t truth. Check who made it and look for a second source.' },
    tryIt: { q: 'A site selling vitamins says “Our vitamins make you 10 times smarter!” What warning signs can you spot?', a: 'Its purpose is to sell; the claim is extreme; there’s no evidence from other trusted sources.' },
    realWorld: 'Fact-checkers check viral stories every day before they are shared widely.',
    summary: ['Ranking ≠ truth', 'Ask who, why, when, and does anyone agree?', 'Spot the adverts'],
  },

  18: {
    objectives: [
      'I can explain what a digital footprint is',
      'I can think before I post',
      'I can respect other people’s privacy and work online',
    ],
    big: 'If you post something online and then delete it, is it really gone?',
    explain: [
      'Your digital footprint is the trail of everything you do online: posts, comments, photos, likes and searches.',
      'Things posted online can be copied, screenshotted and shared, so they may never really disappear. Future schools and employers might see them.',
      'Respect other people’s footprints too: ask before posting a photo of a friend, and never share someone else’s private information.',
    ],
    example: {
      type: 'compare',
      title: 'Think before you post',
      left: { label: '👣 Leaves a bad footprint', items: ['Posting a friend’s photo without asking', 'Angry comments', 'Sharing your address', 'Copying someone’s art as your own'] },
      right: { label: '🌟 Leaves a good footprint', items: ['Asking “Can I share this?”', 'Kind, helpful comments', 'Keeping details private', 'Crediting the artist'] },
    },
    mistake: { wrong: '“It’s fine, I can delete it later.”', fix: 'Assume anything posted could be kept forever. If you wouldn’t want a teacher to see it, don’t post it.' },
    tryIt: { q: 'Your friend looks silly in a funny photo. Should you post it?', a: 'Only if your friend says yes. Their photo is part of their footprint, not yours.' },
    realWorld: 'Some universities and employers look at people’s online footprints before offering them a place or job.',
    summary: ['Your footprint is everything you do online', 'Posts can last forever', 'Ask before sharing others'],
  },

  20: {
    objectives: [
      'I can plan and carry out a data investigation',
      'I can choose a database, survey or chart to answer it',
      'I can present a conclusion backed by evidence',
    ],
    big: 'What is the most interesting question you could answer about our school?',
    explain: [
      'Your data quest uses everything from this half term: fair surveys, branching databases and charts.',
      'Plan: write the question, decide what data you need and how you will collect it fairly.',
      'Present it so an audience understands: a clear chart, a conclusion with numbers, and one thing you would investigate next.',
    ],
    example: {
      type: 'steps',
      title: 'Data quest plan',
      items: ['Question: “Do younger pupils read more books than older pupils?”', 'Data: books read last week, by year group', 'Collect: anonymous survey of 20 pupils per year', 'Present: bar chart — year group vs average books', 'Conclude with numbers + one next question'],
    },
    mistake: { wrong: 'Collecting data first and thinking of a question afterwards.', fix: 'Start with the question — it tells you exactly what data to collect.' },
    tryIt: { q: 'Your question is “Which day has the most rain?”. What data do you need?', a: 'Rainfall measured each day (in mm) over several weeks, recorded with the day of the week.' },
    realWorld: 'Scientists start every experiment with a question and a plan for collecting fair data.',
    summary: ['Question first', 'Collect fairly', 'Conclude with evidence'],
  },

  21: {
    objectives: [
      'I can add photos and sound to a coded project',
      'I can trigger media with events',
      'I can use media that I made or have permission to use',
    ],
    big: 'How do sound and pictures make a game feel more exciting?',
    explain: [
      'Media means pictures, photos, sound and video. Code can control media: play a sound, switch a backdrop, change a costume.',
      'Events decide WHEN media plays: a cheer when you score, a new backdrop when you reach level 2.',
      'Only use media you made yourself or have permission to use. Copying other people’s pictures or music without permission isn’t fair to them.',
    ],
    example: {
      type: 'blocks',
      title: 'Level complete!',
      blocks: ['when I receive level complete', 'play sound cheer', 'switch backdrop to Level 2', 'switch costume to Dot-celebrate', 'say Well done! for 2 seconds'],
    },
    mistake: { wrong: 'Using a song from the internet without permission.', fix: 'Record your own sounds or use the library of free sounds provided.' },
    tryIt: { q: 'Which event would you use to play a “boing” every time a ball hits the edge?', a: 'Inside a forever loop: if touching edge? then play sound boing.' },
    realWorld: 'Sound designers record real objects — like celery snapping — to make sound effects for films and games.',
    summary: ['Code controls media', 'Events decide when', 'Use media you’re allowed to use'],
  },

  22: {
    objectives: [
      'I can move a sprite using x and y coordinates',
      'I can stop a sprite leaving the screen',
      'I can control a sprite with the arrow keys',
    ],
    big: 'How does a game know exactly where a character is on the screen?',
    explain: [
      'The stage is a grid. Every position has an x (left–right) and a y (down–up) coordinate. The centre is (0, 0).',
      'Change x by 10 moves right; change x by −10 moves left. Change y by 10 moves up.',
      'Bounds are the edges. Checking “if x > 220” lets you stop the sprite or wrap it to the other side, so it never disappears.',
    ],
    example: {
      type: 'blocks',
      title: 'Arrow-key movement with bounds',
      blocks: ['when right arrow key pressed', 'change x by 10', 'if x position > 220 then', '  set x to 220', 'end'],
      caption: 'Copy this for each arrow. The “if” stops Dot going past the right edge.',
    },
    mistake: { wrong: 'Using change y by 10 for the down arrow.', fix: 'Down is negative: change y by −10.' },
    tryIt: { q: 'Dot is at (0, 0). It moves change x by 30, then change y by −20. Where is it now?', a: '(30, −20) — right 30 and down 20.' },
    realWorld: 'Maps and GPS use coordinates (latitude and longitude) to pinpoint every place on Earth.',
    summary: ['x = left/right, y = up/down', 'Negative numbers go left or down', 'Check bounds to stay on screen'],
  },

  23: {
    objectives: [
      'I can follow a pair-programming routine',
      'I can give clear instructions as a navigator',
      'I can resolve disagreements by testing ideas',
    ],
    big: 'What should you do when you and your partner disagree about the code?',
    explain: [
      'A protocol is an agreed set of rules. Pair programming works best with a clear protocol everyone follows.',
      'Driver types and thinks aloud; navigator reads the plan and checks each block. Swap on a timer.',
      'If you disagree, don’t argue — test both ideas! The program will show you which one works.',
    ],
    example: {
      type: 'steps',
      title: 'Our pair protocol',
      items: ['Read the task together', 'Agree the next small step', 'Driver builds and talks aloud', 'Navigator checks and asks questions', 'Test it', 'Swap roles every 5 minutes', 'Disagree? Test both ideas'],
    },
    mistake: { wrong: 'The navigator grabbing the mouse.', fix: 'Only the driver touches the mouse. The navigator uses words.' },
    tryIt: { q: 'You think the loop needs 4 repeats, your partner thinks 5. What does the protocol say?', a: 'Test both ideas and see which one works.' },
    realWorld: 'Software companies such as those making banking apps often require pair programming for important code.',
    summary: ['A protocol is agreed rules', 'Clear driver and navigator roles', 'Settle disagreements by testing'],
  },

  24: {
    objectives: [
      'I can write a test plan before testing',
      'I can record bugs in a clear bug ticket',
      'I can retest after a fix',
    ],
    big: 'How do big companies make sure their apps work for millions of people?',
    explain: [
      'A test plan lists the tests you will do BEFORE you start: what you will try, and what should happen.',
      'When a test fails, write a bug ticket: what you did (steps), what you expected, what actually happened, and how serious it is.',
      'After the bug is fixed, run the test again — this is called retesting. Also check you didn’t break something else.',
    ],
    example: {
      type: 'table',
      title: 'Bug ticket #12',
      head: ['Field', 'Details'],
      rows: [['Steps', 'Start game → collect 3 coins → touch spike'], ['Expected', 'Lives goes from 3 to 2'], ['Actual', 'Lives goes to 0, game over'], ['Priority', 'High — game ends unfairly'], ['Status', 'Fixed ✅ (retested)']],
    },
    mistake: { wrong: 'A bug ticket that just says “It’s broken”.', fix: 'Include the exact steps so someone else can make the bug happen again.' },
    tryIt: { q: 'Write the “Expected” line for a test: pressing space should make Dot jump.', a: '“Expected: Dot moves up, then comes back down to the ground.”' },
    realWorld: 'Big apps have thousands of bug tickets, sorted by priority, so teams fix the worst bugs first.',
    summary: ['Plan tests before testing', 'Bug ticket: steps, expected, actual', 'Retest after every fix'],
  },

  25: {
    objectives: [
      'I can explain that the internet is a network of networks',
      'I can describe how data travels in packets',
      'I can explain why routes can change if a link breaks',
    ],
    big: 'When you watch a video, where is it actually coming from?',
    explain: [
      'The internet is a network of networks: millions of school, home and business networks all linked together.',
      'Data is split into small packets. Each packet is labelled with where it is going and travels through routers, which pass it along like a relay race.',
      'Packets can take different routes. If a link breaks, routers send packets another way, and they are put back together in order at the end.',
    ],
    example: {
      type: 'steps',
      title: 'Sending a photo across the internet',
      items: ['The photo is split into numbered packets', 'Each packet gets an address label', 'Routers pass packets towards the address', 'Packets may take different routes', 'The receiving device puts them back in order'],
    },
    mistake: { wrong: '“The internet is the same as the World Wide Web.”', fix: 'The internet is the network (the roads). The web is one service that uses it (websites), like email and video calls also do.' },
    tryIt: { q: 'A photo is split into 6 packets. Packet 4 arrives last. Can the photo be shown?', a: 'Yes — once all 6 have arrived, they are put back in order using their numbers.' },
    realWorld: 'Huge cables under the oceans carry internet packets between continents.',
    summary: ['Internet = network of networks', 'Data travels in packets', 'Routers find a route'],
  },

  27: {
    objectives: [
      'I can plan a web page for an audience',
      'I can sketch a layout with headings, text and images',
      'I can explain how links connect pages',
    ],
    big: 'What makes a website easy to use?',
    explain: [
      'A web page is a document on the World Wide Web. It has headings, text, images and links to other pages.',
      'Plan for your audience: what do they need to find quickly? Put the most important thing at the top.',
      'Sketch a wireframe — a simple box drawing showing where everything goes — before you build.',
    ],
    example: {
      type: 'table',
      title: 'Wireframe: “Our School Garden” page',
      head: ['Area', 'Content'],
      rows: [['Top', 'Big heading + garden photo'], ['Middle', 'What we grow this term (short paragraphs)'], ['Side', 'Links: Planting diary · How to help · Contact'], ['Bottom', 'Credits for photos']],
    },
    mistake: { wrong: 'Walls of tiny text and no headings.', fix: 'Short paragraphs, clear headings and pictures make pages easy to scan.' },
    tryIt: { q: 'Who is the audience for a school website’s “New Parents” page, and what do they need first?', a: 'Parents of new pupils — they need start times, what to bring and who to contact.' },
    realWorld: 'Web designers test pages with real users to see where they click and where they get lost.',
    summary: ['Pages have headings, text, images, links', 'Plan for your audience', 'Sketch a wireframe first'],
  },

  28: {
    objectives: [
      'I can use if … else to choose between two actions',
      'I can explain what happens when the condition is true or false',
      'I can use if … else to make game choices',
    ],
    big: 'What should a game do if you get the answer wrong?',
    explain: [
      'An “if … then” block does something only when the condition is true. An “if … else” block always does one of two things: one when it’s true, the other when it’s false.',
      'Think of a fork in the road: the condition decides which path the program takes.',
      'Quiz games use if … else all the time: IF the answer is correct THEN add a point ELSE say “Try again”.',
    ],
    example: {
      type: 'flow',
      title: 'Quiz question',
      question: 'Is answer = 12?',
      yes: 'say “Correct!” · change score by 1',
      no: 'say “Not quite — it’s 12”',
      blocks: ['ask What is 3 × 4? and wait', 'if answer = 12 then', '  say Correct!', '  change score by 1', 'else', '  say Not quite — it’s 12', 'end'],
    },
    mistake: { wrong: 'Using two separate “if” blocks and forgetting one case.', fix: 'When there are exactly two outcomes, use one “if … else” — it always covers both.' },
    tryIt: { q: 'IF temperature > 25 THEN say “Shorts!” ELSE say “Jumper!”. What is said when it’s 18°?', a: '“Jumper!” — 18 is not greater than 25, so the else part runs.' },
    realWorld: 'A thermostat: IF the room is cold THEN turn the heating on ELSE turn it off.',
    summary: ['if … else always picks one of two', 'True → then part, false → else part', 'Great for quizzes and choices'],
  },

  29: {
    objectives: [
      'I can use key presses as inputs',
      'I can program different responses to different keys',
      'I can choose between key-press events and “key pressed?” checks',
    ],
    big: 'Why does holding down a key in some games feel smoother than tapping it?',
    explain: [
      'The keyboard is an input device. Programs can respond to keys in two ways.',
      '“when key pressed” is an event — it runs once each time the key is pressed. Good for jumping or firing.',
      '“if key pressed?” inside a forever loop checks continuously, so holding the key keeps the action going. Good for smooth movement.',
    ],
    example: {
      type: 'compare',
      title: 'Two ways to use keys',
      left: { label: 'Event — once per press', blocks: true, items: ['when space key pressed', 'change y by 50', 'wait 0.3', 'change y by -50'] },
      right: { label: 'Check — smooth while held', blocks: true, items: ['when ▶ clicked', 'forever', '  if key right arrow pressed? then', '    change x by 5', '  end', 'end'] },
    },
    mistake: { wrong: 'Using “when right arrow pressed” for movement, so it stutters.', fix: 'For smooth movement, check “key pressed?” inside a forever loop.' },
    tryIt: { q: 'Which way is best for a “fire” button that shoots one star each press?', a: 'The event “when space key pressed” — one star per press.' },
    realWorld: 'Game controllers send inputs hundreds of times per second so movement feels instant.',
    summary: ['Keys are inputs', 'Events run once per press', 'Checks in a loop give smooth movement'],
  },

  30: {
    objectives: [
      'I can choose a suitable online tool for working together',
      'I can manage who can see and edit my work',
      'I can collaborate respectfully and safely',
    ],
    big: 'How could four pupils make one presentation without being in the same room?',
    explain: [
      'Collaboration tools let people work on the same document, slides or project online. Changes appear for everyone.',
      'Sharing settings control who can view, comment or edit. Share with your class and teacher only — never “anyone with the link” unless an adult says so.',
      'Version history saves older versions, so mistakes can be undone. Respect others: edit your own part, comment on theirs.',
    ],
    example: {
      type: 'table',
      title: 'Sharing settings',
      head: ['Setting', 'They can…', 'Use it for'],
      rows: [['Viewer', 'Only look', 'Showing finished work'], ['Commenter', 'Look and leave comments', 'Getting feedback'], ['Editor', 'Change anything', 'Your team only']],
    },
    mistake: { wrong: 'Making everyone an editor, then someone deletes a slide.', fix: 'Give editing rights only to your team, and use version history to restore mistakes.' },
    tryIt: { q: 'You want your teacher to give feedback but not change your work. Which setting?', a: 'Commenter.' },
    realWorld: 'Engineers in different countries design cars together using shared online tools.',
    summary: ['Tools let teams work together online', 'Control who can view, comment, edit', 'Version history undoes mistakes'],
  },

  31: {
    objectives: [
      'I can explain what sensors tell a robot',
      'I can combine information from more than one sensor',
      'I can write an algorithm for a robot using sensor checks',
    ],
    big: 'How does a robot vacuum avoid falling down the stairs?',
    explain: [
      'Sensors are a robot’s senses. A distance sensor measures how far away things are; a light sensor detects brightness; a touch sensor feels bumps.',
      'Clever robots combine sensors. A robot vacuum uses a bump sensor for walls, a cliff sensor for stairs and a dirt sensor for messy spots.',
      'The program checks each sensor in a loop and decides what to do.',
    ],
    example: {
      type: 'code',
      title: 'Robot vacuum algorithm (pseudocode)',
      code: 'REPEAT FOREVER\n    IF cliff sensor sees a drop\n        REVERSE and TURN\n    ELSE IF bump sensor is pressed\n        TURN 90 degrees\n    ELSE IF dirt sensor detects dirt\n        SPIN brush faster\n    ELSE\n        MOVE forward',
    },
    mistake: { wrong: 'Checking the less important sensor first.', fix: 'Check the most important (safety) sensor first — the stairs matter more than the dirt!' },
    tryIt: { q: 'A greenhouse robot has a light sensor and a soil-moisture sensor. Write one rule using both.', a: 'For example: IF the soil is dry AND it is daytime THEN water the plants.' },
    realWorld: 'Self-driving cars use cameras, radar and laser sensors together to understand the road.',
    summary: ['Sensors are a robot’s senses', 'Combine sensors for smarter robots', 'Check the safety sensor first'],
  },

  32: {
    objectives: [
      'I can explain what makes an algorithm efficient',
      'I can make a program shorter without changing what it does',
      'I can compare two solutions and justify the better one',
    ],
    big: 'Two programs both reach the star. Is one of them better? Why?',
    explain: [
      'An efficient algorithm reaches the goal with fewer steps, less time or less effort.',
      'Ways to be efficient: use loops instead of repeated blocks, take the shortest route, and remove blocks that do nothing (like turn left then turn right).',
      'Efficiency matters: a shorter program is quicker to read, easier to fix and often runs faster.',
    ],
    example: {
      type: 'compare',
      title: 'Same result, fewer blocks',
      left: { label: '9 blocks', blocks: true, items: ['move 1', 'move 1', 'move 1', 'turn left', 'turn right', 'move 1', 'move 1', 'turn right', 'move 2'] },
      right: { label: '3 blocks', blocks: true, items: ['move 5', 'turn right', 'move 2'] },
      caption: '“Turn left, turn right” cancels out, and five move 1s become one move 5.',
    },
    mistake: { wrong: 'Making a program shorter but breaking it.', fix: 'Efficient only counts if it still works. Test after every change.' },
    tryIt: { q: 'Make this efficient: move 2, move 2, turn right, turn right, turn right, turn right, move 1.', a: 'move 5 — four right turns is a full circle, so they can all go, and the moves add to 5.' },
    realWorld: 'Delivery companies use efficient route algorithms to save fuel and time every day.',
    summary: ['Efficient = fewer steps, same result', 'Loops, shortest routes, no wasted blocks', 'Always test after tidying'],
  },

  34: {
    objectives: [
      'I can choose and plan a quiz or maze game',
      'I can decompose it into parts with success criteria',
      'I can plan which programming ideas I will use',
    ],
    big: 'Quiz or maze: which would you build, and why?',
    explain: [
      'Your capstone is a game that shows off everything you have learned: events, loops, variables, if … else, lists.',
      'Plan it carefully: draw the screens, decompose the parts, and write success criteria that include the programming ideas you will use.',
      'Choose milestones for each lesson so you finish on time.',
    ],
    example: {
      type: 'table',
      title: 'Capstone plan — Space Maze',
      head: ['Part', 'Programming idea', 'Milestone'],
      rows: [['Arrow-key rocket', 'Events, key checks', 'Lesson 1'], ['Walls that bounce you back', 'if … touching', 'Lesson 1'], ['Stars to collect', 'Variable: score', 'Lesson 2'], ['3 lives, game over', 'Variable + if … else', 'Lesson 2'], ['High-score list', 'List', 'Bonus']],
    },
    mistake: { wrong: 'Success criteria such as “make it good”.', fix: 'Make them checkable: “The score goes up by 1 for every star.”' },
    tryIt: { q: 'Which programming idea would you use to give the player 3 lives?', a: 'A variable called lives: set it to 3, change by −1 when hit, and if lives = 0 then game over.' },
    realWorld: 'Game studios write a “design document” before building — just like this plan.',
    summary: ['Show off everything you have learned', 'Plan parts, ideas and milestones', 'Checkable success criteria'],
  },

  35: {
    objectives: [
      'I can build my game milestone by milestone',
      'I can use my test plan to find bugs',
      'I can record progress and next steps',
    ],
    big: 'What is the most important part of your game to get working first?',
    explain: [
      'Build the core first: the thing the player does most (moving, answering). Then add scoring, then winning and losing.',
      'Test each milestone with your test plan. Fix bugs before adding new features.',
      'Keep a build log so you know where to start next lesson.',
    ],
    example: {
      type: 'table',
      title: 'Build log',
      head: ['Feature', 'Tested?', 'Notes'],
      rows: [['Rocket moves with arrows', '✅', 'Smooth with key checks'], ['Walls bounce back', '✅', ''], ['Stars add score', '🐞', 'Score adds 2 — star not hiding fast enough'], ['Lives and game over', '⏳', 'Next lesson']],
    },
    mistake: { wrong: 'Adding a cool new feature while the score is still broken.', fix: 'Fix first, then add. New features on top of bugs make more bugs.' },
    tryIt: { q: 'A star adds 2 points instead of 1. What might be wrong?', a: 'The star isn’t hidden straight away, so the touch is detected twice — hide it first, then add the score.' },
    realWorld: 'Professional teams hold a “bug bash” before release, where everyone hunts for bugs together.',
    summary: ['Core features first', 'Test each milestone', 'Fix before adding'],
  },

  36: {
    objectives: [
      'I can demonstrate my game to an audience',
      'I can explain the code behind key features',
      'I can evaluate my game against the success criteria',
    ],
    big: 'If you had one more week, what would you add to your game?',
    explain: [
      'Presenting is part of programming. Show the game, then explain how one feature works using computing vocabulary.',
      'Evaluate honestly: which success criteria did you meet? Which not yet? What would you improve?',
      'Listen to feedback with an open mind — it is free advice for your next version.',
    ],
    example: {
      type: 'table',
      title: 'Evaluation',
      head: ['Success criterion', 'Met?', 'Evidence'],
      rows: [['Rocket controlled by arrow keys', '✅', 'Smooth movement using key checks'], ['Score goes up for each star', '✅', 'Variable + if touching'], ['Game over at 0 lives', '✅', 'if lives = 0 then stop all'], ['High-score list', '❌', 'Ran out of time — next version']],
    },
    mistake: { wrong: 'Only talking about what the game looks like.', fix: 'Explain the code too: “I used a variable called lives that…”' },
    tryIt: { q: 'Turn “The game is fun” into an evaluation sentence with evidence.', a: 'For example: “Testers played for 5 minutes and asked to play again, so the difficulty seems right.”' },
    realWorld: 'App stores ask users for reviews — real feedback that shapes the next version.',
    summary: ['Demo, then explain the code', 'Evaluate against criteria with evidence', 'Use feedback for next time'],
  },

  37: {
    objectives: [
      'I can share my best computing work from Year 4',
      'I can explain how my skills have grown',
      'I can give specific praise to others',
    ],
    big: 'What can you do now that you couldn’t do in September?',
    explain: [
      'This year you went deeper: pseudocode, nested loops, if … else, lists, coordinates, sensors and efficiency.',
      'Choose one project to show. Explain one thing that was hard and how you solved it.',
      'Celebrate others with specific praise about their ideas and their code.',
    ],
    example: {
      type: 'table',
      title: 'Year 4 big ideas',
      head: ['Idea', 'Example'],
      rows: [['Pseudocode', 'Plain-English plan before code'], ['Nested loops', 'repeat 5 { repeat 4 { … } }'], ['if … else', 'Correct! / Try again'], ['Lists', 'Backpack inventory'], ['Coordinates', 'x and y on the stage'], ['Efficiency', 'Fewer blocks, same result']],
    },
    mistake: { wrong: 'Comparing yourself with others instead of your September self.', fix: 'Look at how far YOU have come — that is what progress means.' },
    tryIt: { q: 'Which Year 4 idea would you use to store the names of all players in a game?', a: 'A list.' },
    realWorld: 'In Year 5 you’ll start planning bigger systems and even write your first Python.',
    summary: ['Celebrate progress', 'Explain a challenge you solved', 'Specific praise for others'],
  },
};
