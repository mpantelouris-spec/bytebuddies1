/* ═══════════════════════════════════════════════════
   ByteBuddies Courses — UK Year Groups 3-6
   Year 3 (ages 7-8), Year 4 (ages 8-9),
   Year 5 (ages 9-10), Year 6 (ages 10-11)
   ═══════════════════════════════════════════════════ */

export const courses = [
  /* ══════ YEAR 3 ══════ */
  {
    id: 'y3-first-steps',
    title: 'My First Code',
    description: 'Start your coding adventure! Learn what code is and create your first programs using blocks.',
    icon: '🧩',
    color: '#6366f1',
    yearGroup: 3,
    difficulty: 'Year 3',
    lessons: 14,
    duration: '6 hours',
    progress: 0,
    topics: ['Sequences', 'Instructions', 'Output', 'Debugging', 'Prediction'],
    modules: [
      {
        title: 'What is Code?',
        completed: false,
        xp: 40,
        content: {
          explanation: 'Code is a set of instructions that tells a computer what to do — just like a recipe tells you how to bake a cake! Computers follow instructions in order, one at a time.',
          example: '// Tell the computer to say hello\nsay("Hello, World!")\nsay("My name is ByteBuddies!")',
          activity: 'Use the SAY block to make a sprite introduce itself. Try adding three SAY blocks in a row!',
          keyWords: ['code', 'instruction', 'sequence', 'program'],
        },
        quiz: [
          { q: 'What is code?', options: ['A secret language', 'Instructions for a computer', 'A type of game', 'A website'], answer: 1 },
          { q: 'Computers follow instructions...', options: ['All at once', 'In random order', 'One at a time, in order', 'Backwards'], answer: 2 },
        ],
      },
      {
        title: 'Sequences',
        completed: false,
        xp: 50,
        content: {
          explanation: 'A sequence is a set of instructions in a specific order. The order matters! If you put your shoes on before your socks, it would be a bit silly!',
          example: '// Draw a square — order matters!\nmove(100)\nturn(90)\nmove(100)\nturn(90)\nmove(100)\nturn(90)\nmove(100)\nturn(90)',
          activity: 'Arrange the MOVE and TURN blocks in the right order to draw a triangle on the stage.',
          keyWords: ['sequence', 'order', 'step', 'instruction'],
        },
        quiz: [
          { q: 'What is a sequence?', options: ['A random set of steps', 'Steps in a specific order', 'A type of loop', 'A computer game'], answer: 1 },
          { q: 'What happens if you change the order of instructions?', options: ['Nothing changes', 'The program runs faster', 'You might get a different result', 'The computer breaks'], answer: 2 },
        ],
      },
      {
        title: 'Sprites & Movement',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Sprites are the characters and objects in your project. You can move them around the stage using code blocks! The stage is like a big grid.',
          example: '// Move the cat sprite\nchange x by 10   // moves right\nchange y by -10  // moves down\ngo to x: 200 y: 150',
          activity: 'Add a Cat sprite and use MOVE blocks to guide it from one side of the stage to the other.',
          keyWords: ['sprite', 'stage', 'position', 'x', 'y'],
        },
        quiz: [
          { q: 'What is a sprite?', options: ['A drink', 'A character or object on the stage', 'A type of block', 'A background'], answer: 1 },
          { q: 'What does "change x by 10" do?', options: ['Moves the sprite up', 'Moves the sprite right', 'Makes the sprite bigger', 'Turns the sprite'], answer: 1 },
        ],
      },
      {
        title: 'Debugging',
        completed: false,
        xp: 60,
        content: {
          explanation: 'A bug is a mistake in your code. Debugging means finding and fixing those mistakes. Even the best programmers make bugs — the skill is finding them!',
          example: '// This code has a bug! Can you spot it?\nsay("Helo World")  // Oops, "Hello" is misspelt!\nmove(10)\nturn(900)  // 900 should be 90!',
          activity: 'Fix the broken program: the sprite should draw a square, but the turn amounts are wrong. Debug it!',
          keyWords: ['bug', 'debug', 'fix', 'error', 'mistake'],
        },
        quiz: [
          { q: 'What is a bug in code?', options: ['An insect', 'A mistake in the program', 'A feature', 'A cool trick'], answer: 1 },
          { q: 'What is debugging?', options: ['Adding more code', 'Making the code longer', 'Finding and fixing mistakes', 'Deleting the program'], answer: 2 },
        ],
      },
      {
        title: 'Repetition with Loops',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Instead of writing the same code over and over, we can use a LOOP! A "repeat" loop runs instructions multiple times. It saves time and keeps code tidy.',
          example: '// Without a loop (long!):\nmove(50)\nturn(90)\nmove(50)\nturn(90)\nmove(50)\nturn(90)\nmove(50)\nturn(90)\n\n// With a loop (much better!):\nrepeat 4 times {\n  move(50)\n  turn(90)\n}',
          activity: 'Use a REPEAT loop to draw a hexagon (6 sides). Hint: the turn angle is 60!',
          keyWords: ['loop', 'repeat', 'iteration', 'pattern'],
        },
        quiz: [
          { q: 'Why do we use loops?', options: ['To make code look cool', 'To avoid repeating the same code', 'To make the code run slower', 'Loops are not useful'], answer: 1 },
          { q: 'repeat 3 { say("Hi") } — how many times is "Hi" said?', options: ['1', '2', '3', '0'], answer: 2 },
        ],
      },
      {
        title: 'Events',
        completed: false,
        xp: 60,
        content: {
          explanation: 'Events tell the computer WHEN to do something. "When the green flag is clicked" or "When the space key is pressed" are events. They start your code running!',
          example: '// Event: when green flag clicked\nwhen green flag clicked {\n  say("Game started!")\n}\n\n// Event: when space pressed\nwhen key space pressed {\n  change y by 20\n}',
          activity: 'Use KEY PRESS events to make a sprite move in four directions (up, down, left, right) using the arrow keys.',
          keyWords: ['event', 'trigger', 'key press', 'click', 'start'],
        },
        quiz: [
          { q: 'What does an event do?', options: ['Deletes code', 'Tells the computer when to run code', 'Makes code slower', 'Creates a bug'], answer: 1 },
          { q: 'Which is an event?', options: ['move(10)', 'say("Hi")', 'when space key pressed', 'change x by 5'], answer: 2 },
        ],
      },
      {
        title: 'Project: Animated Story',
        completed: false,
        xp: 150,
        content: {
          explanation: 'Time to combine everything you\'ve learned! Create an animated story with multiple sprites, movement, and dialogue. Plan your story first, then build it step by step.',
          example: '// Scene 1\nwhen green flag clicked {\n  Cat: say("Hello! Shall we go on an adventure?")\n  wait(2)\n  Cat: move(100)\n  Dog: say("Yes! Let\'s go!")\n  Dog: move(100)\n}',
          activity: 'Create a short story with at least 2 sprites. Use SAY blocks for dialogue, MOVE blocks for animation, and WAIT blocks for timing.',
          keyWords: ['project', 'story', 'animation', 'creativity'],
        },
        quiz: [
          { q: 'What should you do first when making a project?', options: ['Write all the code immediately', 'Plan what you want to make', 'Delete everything', 'Ask someone else to do it'], answer: 1 },
          { q: 'How many sprites should your story have?', options: ['None', 'Exactly 1', 'At least 2', 'At least 100'], answer: 2 },
        ],
      },
    ],
  },
  {
    id: 'y3-patterns',
    title: 'Patterns & Art',
    description: 'Use code to create amazing patterns, shapes, and digital art!',
    icon: '🎨',
    color: '#ec4899',
    yearGroup: 3,
    difficulty: 'Year 3',
    lessons: 12,
    duration: '5 hours',
    progress: 0,
    topics: ['Patterns', 'Shapes', 'Colours', 'Repetition', 'Creativity'],
    modules: [
      {
        title: 'Drawing Shapes',
        completed: false,
        xp: 40,
        content: {
          explanation: 'We can use MOVE and TURN blocks to draw shapes. A square has 4 sides and 4 turns of 90 degrees. A triangle has 3 sides and 3 turns of 120 degrees.',
          example: '// Draw a triangle\nrepeat 3 {\n  move(100)\n  turn(120)\n}\n\n// Draw a pentagon\nrepeat 5 {\n  move(70)\n  turn(72)\n}',
          activity: 'Draw a square, triangle, and pentagon. What do you notice about the turn angles?',
          keyWords: ['shape', 'angle', 'turn', 'side', 'polygon'],
        },
        quiz: [
          { q: 'How many degrees do you turn for each corner of a square?', options: ['45', '60', '90', '120'], answer: 2 },
          { q: 'A pentagon has how many sides?', options: ['3', '4', '5', '6'], answer: 2 },
        ],
      },
      {
        title: 'Colour & Style',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Change the colour of your sprite or the pen to make colourful drawings. Colours can be set using names or colour values.',
          example: '// Change colour before drawing\nset colour to "red"\nmove(100)\nset colour to "blue"\nturn(90)\nmove(100)',
          activity: 'Draw a rainbow: use 7 different colours to draw 7 arcs side by side.',
          keyWords: ['colour', 'pen', 'style', 'appearance'],
        },
        quiz: [
          { q: 'What block changes the drawing colour?', options: ['move', 'turn', 'set colour', 'repeat'], answer: 2 },
          { q: 'How many colours are in a rainbow?', options: ['3', '5', '7', '10'], answer: 2 },
        ],
      },
      {
        title: 'Repeating Patterns',
        completed: false,
        xp: 60,
        content: {
          explanation: 'The most beautiful patterns use repetition! By combining loops with shapes and colours, you can create spirals, stars, and tessellations.',
          example: '// Spiral pattern\nrepeat 36 {\n  move(50)\n  turn(100)\n}',
          activity: 'Create a spiral pattern by repeating a shape and changing the size or angle each time. Try different values!',
          keyWords: ['pattern', 'spiral', 'tessellation', 'repeat'],
        },
        quiz: [
          { q: 'What makes patterns interesting?', options: ['Using only one colour', 'Repetition with small changes', 'Making them as big as possible', 'Using no loops'], answer: 1 },
        ],
      },
      {
        title: 'Symmetry',
        completed: false,
        xp: 60,
        content: {
          explanation: 'Symmetry means both sides look the same, like a mirror image. You can code symmetrical patterns by drawing the same thing on both sides!',
          example: '// Draw a symmetrical butterfly wing\nmove(60)\nturn(60)\nmove(60)\nturn(120)\nmove(60)\nturn(60)\nmove(60)',
          activity: 'Code a symmetrical snowflake with 6 identical arms using a loop and a "draw arm" pattern.',
          keyWords: ['symmetry', 'mirror', 'reflection', 'balance'],
        },
        quiz: [
          { q: 'What is symmetry?', options: ['When something is random', 'When both sides are the same', 'When something is very big', 'A type of loop'], answer: 1 },
        ],
      },
      {
        title: 'Project: Art Gallery',
        completed: false,
        xp: 120,
        content: {
          explanation: 'Create your own digital art gallery! Make at least 3 different artworks using shapes, colours, patterns, and symmetry. Display them on different backdrops.',
          example: '// Artwork 1: Starry sky\nset backdrop to "night"\nrepeat 20 {\n  go to random position\n  set colour to "yellow"\n  draw star\n}',
          activity: 'Design 3 coded artworks. Each should use a different technique: shapes, repeating patterns, or symmetry.',
          keyWords: ['gallery', 'art', 'creative', 'design'],
        },
        quiz: [
          { q: 'What makes digital art unique?', options: ['It uses paper', 'It is created with code', 'It cannot use colour', 'It has no patterns'], answer: 1 },
        ],
      },
    ],
  },

  /* ══════ YEAR 4 ══════ */
  {
    id: 'y4-game-maker',
    title: 'Game Maker',
    description: 'Learn to build your own games with sprites, scoring, and player controls!',
    icon: '🎮',
    color: '#f97316',
    yearGroup: 4,
    difficulty: 'Year 4',
    lessons: 16,
    duration: '8 hours',
    progress: 0,
    topics: ['Game Design', 'Variables', 'Scoring', 'Conditions', 'Collision'],
    modules: [
      {
        title: 'What Makes a Game?',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Every game has rules, goals, and a challenge. Think about your favourite games — they all have something to achieve and something that makes it tricky!',
          example: '// A simple game has:\n// 1. A player (sprite you control)\n// 2. A goal (collect stars!)\n// 3. A challenge (avoid enemies!)\n// 4. A score (how well you did)',
          activity: 'Plan a simple game on paper. What is the player? What is the goal? What is the challenge? Then set up your sprites.',
          keyWords: ['game', 'rules', 'goal', 'challenge', 'player'],
        },
        quiz: [
          { q: 'What does every game need?', options: ['Only graphics', 'Rules and a goal', 'At least 10 sprites', 'No challenges'], answer: 1 },
          { q: 'What makes a game fun?', options: ['Being impossible to win', 'Having no rules', 'A good challenge that is not too easy or too hard', 'Being exactly the same every time'], answer: 2 },
        ],
      },
      {
        title: 'Variables & Score',
        completed: false,
        xp: 75,
        content: {
          explanation: 'A variable is like a labelled box that stores a value. In games, we use variables to keep track of things like the SCORE, LIVES, or TIMER.',
          example: '// Create a score variable\nset score to 0\n\n// When player collects a star:\nchange score by 10\nsay("Score: " + score)\n\n// When player loses a life:\nchange lives by -1',
          activity: 'Create a game where clicking on a moving star adds 10 points to your score. Display the score on screen!',
          keyWords: ['variable', 'score', 'value', 'store', 'change'],
        },
        quiz: [
          { q: 'What is a variable?', options: ['A type of sprite', 'A named box that stores a value', 'A loop block', 'A background'], answer: 1 },
          { q: 'If score is 20 and we "change score by 10", what is score now?', options: ['10', '20', '30', '200'], answer: 2 },
        ],
      },
      {
        title: 'If/Else Decisions',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Games need to make decisions! "IF the player touches the coin, add a point. ELSE IF they touch an enemy, lose a life." This is called a CONDITION.',
          example: 'if touching "star" {\n  change score by 10\n  hide star\n  say("Got it!")\n}\n\nif touching "enemy" {\n  change lives by -1\n  say("Ouch!")\n}',
          activity: 'Add conditions to your game: IF the player touches a collectible, gain points. IF they touch a hazard, lose a life.',
          keyWords: ['if', 'else', 'condition', 'touching', 'decision'],
        },
        quiz: [
          { q: 'What does an IF block do?', options: ['Runs code no matter what', 'Checks a condition and runs code only if true', 'Repeats code', 'Deletes a sprite'], answer: 1 },
          { q: 'In "if touching enemy", when does the code inside run?', options: ['Always', 'Never', 'Only when the sprites are touching', 'Only at the start'], answer: 2 },
        ],
      },
      {
        title: 'Player Controls',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Great games have responsive controls. Use key events to let the player move their sprite. You can adjust speed, add jumping, and create smooth movement.',
          example: 'when key "right" pressed {\n  change x by 8\n}\nwhen key "left" pressed {\n  change x by -8\n}\nwhen key "up" pressed {\n  change y by -12  // jump up!\n}',
          activity: 'Create a character that moves with arrow keys. Add a "speed" variable and use it in your movement blocks so you can easily change how fast the player moves.',
          keyWords: ['controls', 'movement', 'key press', 'speed', 'input'],
        },
        quiz: [
          { q: 'How do we make a sprite move right?', options: ['change y by 10', 'change x by 10', 'turn 90 degrees', 'set size to 10'], answer: 1 },
          { q: 'Why use a speed variable instead of a number?', options: ['It looks cooler', 'So we can easily change the speed in one place', 'It makes the game slower', 'Variables are not useful'], answer: 1 },
        ],
      },
      {
        title: 'Collision Detection',
        completed: false,
        xp: 100,
        content: {
          explanation: 'When sprites touch each other, that\'s a collision. Games use collision detection to know when the player hits an enemy, collects a coin, or reaches the finish line.',
          example: '// Check every frame\nforever {\n  if touching "coin" {\n    change score by 5\n    coin: go to random\n    play sound "ding"\n  }\n  if touching "wall" {\n    move backwards\n  }\n}',
          activity: 'Make a game where a player collects falling objects. Use collision detection to increase the score and reposition the collectible.',
          keyWords: ['collision', 'touching', 'detect', 'hit', 'overlap'],
        },
        quiz: [
          { q: 'What is collision detection?', options: ['When sprites are deleted', 'Checking if sprites are touching', 'A type of loop', 'An event'], answer: 1 },
        ],
      },
      {
        title: 'Timer & Levels',
        completed: false,
        xp: 100,
        content: {
          explanation: 'Add a timer to create urgency! You can also make levels — when the player reaches a score, make the game harder by increasing speed or adding more enemies.',
          example: 'set timer to 30\n\nforever {\n  change timer by -1\n  wait 1 second\n  if timer = 0 {\n    say("Game Over! Score: " + score)\n    stop all\n  }\n  // Level up!\n  if score > 50 {\n    set enemy speed to 6\n  }\n}',
          activity: 'Add a 30-second countdown timer to your game. When time runs out, display the final score. Add a level-up when the score reaches 50.',
          keyWords: ['timer', 'countdown', 'level', 'difficulty', 'game over'],
        },
        quiz: [
          { q: 'What does a timer add to a game?', options: ['Nothing', 'Urgency and excitement', 'More sprites', 'Better colours'], answer: 1 },
        ],
      },
      {
        title: 'Project: Catch Game',
        completed: false,
        xp: 200,
        content: {
          explanation: 'Build a complete "Catch the Falling Objects" game! The player moves left and right to catch good items (+points) and avoid bad items (-lives). Include a score, timer, and levels.',
          example: '// Game structure:\n// 1. Player moves left/right (arrow keys)\n// 2. Objects fall from the top randomly\n// 3. Good objects = +10 points\n// 4. Bad objects = -1 life\n// 5. Timer counts down from 60\n// 6. Speed increases every 20 points',
          activity: 'Build the complete catch game. Add at least 2 types of falling object, a score display, 3 lives, and a timer.',
          keyWords: ['project', 'catch game', 'complete', 'game design'],
        },
        quiz: [
          { q: 'What does your catch game need?', options: ['Only a player', 'Player, falling objects, score, and timer', 'Just one sprite', 'No variables'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'y4-web-basics',
    title: 'My First Website',
    description: 'Learn HTML and CSS to build your own web pages from scratch!',
    icon: '🌐',
    color: '#06b6d4',
    yearGroup: 4,
    difficulty: 'Year 4',
    lessons: 14,
    duration: '7 hours',
    progress: 0,
    topics: ['HTML', 'CSS', 'Headings', 'Paragraphs', 'Styling', 'Layout'],
    modules: [
      {
        title: 'What is a Website?',
        completed: false,
        xp: 40,
        content: {
          explanation: 'Websites are made of HTML (the structure and content) and CSS (the colours and layout). HTML uses tags like <h1>, <p>, and <img> to tell the browser what to show.',
          example: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello World!</h1>\n    <p>This is my first web page.</p>\n  </body>\n</html>',
          activity: 'Create a simple HTML page with a heading, a paragraph about yourself, and a title.',
          keyWords: ['HTML', 'website', 'tag', 'browser', 'page'],
        },
        quiz: [
          { q: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Making Language', 'Heading Text Made Longer'], answer: 0 },
          { q: 'Which tag makes the biggest heading?', options: ['<p>', '<h6>', '<h1>', '<title>'], answer: 2 },
        ],
      },
      {
        title: 'Tags & Elements',
        completed: false,
        xp: 50,
        content: {
          explanation: 'HTML tags come in pairs: an opening tag <p> and a closing tag </p>. The content goes between them. Some tags like <img> and <br> are self-closing.',
          example: '<h1>My Title</h1>\n<p>A paragraph of text.</p>\n<ul>\n  <li>First item</li>\n  <li>Second item</li>\n</ul>\n<img src="cat.jpg" alt="A cute cat">',
          activity: 'Build an "About Me" page with a heading, three paragraphs, an image, and a list of your hobbies.',
          keyWords: ['tag', 'element', 'opening', 'closing', 'self-closing'],
        },
        quiz: [
          { q: 'What is the closing tag for <h1>?', options: ['<h1/>', '</h1>', '<close h1>', '{/h1}'], answer: 1 },
          { q: 'Which tag creates a list item?', options: ['<ul>', '<ol>', '<li>', '<list>'], answer: 2 },
        ],
      },
      {
        title: 'CSS: Adding Style',
        completed: false,
        xp: 60,
        content: {
          explanation: 'CSS changes how your page looks — colours, fonts, sizes, and spacing. You write CSS rules with a selector and properties.',
          example: 'h1 {\n  color: blue;\n  font-size: 32px;\n  text-align: center;\n}\n\np {\n  color: grey;\n  font-family: Arial;\n  line-height: 1.6;\n}',
          activity: 'Style your "About Me" page: change the heading colour, paragraph font, and background colour.',
          keyWords: ['CSS', 'style', 'colour', 'font', 'property', 'selector'],
        },
        quiz: [
          { q: 'What does CSS control?', options: ['The content of a page', 'How a page looks', 'What language is used', 'The file name'], answer: 1 },
          { q: 'Which CSS property changes text colour?', options: ['font-size', 'text-align', 'color', 'margin'], answer: 2 },
        ],
      },
      {
        title: 'Layouts & Boxes',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Every HTML element is a box! CSS lets you control padding (space inside), margin (space outside), borders, and how boxes are arranged on the page.',
          example: '.card {\n  background: white;\n  border: 2px solid #ccc;\n  border-radius: 10px;\n  padding: 20px;\n  margin: 10px;\n  width: 300px;\n}',
          activity: 'Create a page with 3 "cards" — each card has a title, text, and a coloured border. Space them out nicely.',
          keyWords: ['padding', 'margin', 'border', 'box', 'layout', 'card'],
        },
        quiz: [
          { q: 'What is padding?', options: ['Space outside an element', 'Space inside an element', 'A type of tag', 'A font style'], answer: 1 },
          { q: 'What makes rounded corners?', options: ['margin', 'padding', 'border-radius', 'text-align'], answer: 2 },
        ],
      },
      {
        title: 'Images & Links',
        completed: false,
        xp: 60,
        content: {
          explanation: 'Use <img> to add images and <a> to create links. Links can go to other pages or other websites. Always add "alt" text to images for accessibility!',
          example: '<img src="photo.jpg" alt="A sunset">\n\n<a href="page2.html">Go to Page 2</a>\n<a href="https://example.com">Visit Example</a>',
          activity: 'Add images and links to your website. Create a second page and link between the two pages.',
          keyWords: ['image', 'link', 'href', 'src', 'alt', 'navigation'],
        },
        quiz: [
          { q: 'Which attribute tells the browser where a link goes?', options: ['src', 'alt', 'href', 'class'], answer: 2 },
          { q: 'Why do we add alt text to images?', options: ['For decoration', 'So search engines can read it and for accessibility', 'It changes the image size', 'It is required by CSS'], answer: 1 },
        ],
      },
      {
        title: 'Project: Personal Website',
        completed: false,
        xp: 150,
        content: {
          explanation: 'Build a complete personal website with at least 2 pages! Include a home page, an about page, images, links, and nice CSS styling.',
          example: '<!-- page structure -->\n<header>\n  <h1>Welcome to My Site!</h1>\n  <nav>\n    <a href="index.html">Home</a>\n    <a href="about.html">About</a>\n  </nav>\n</header>\n<main>\n  <p>This is my awesome website!</p>\n</main>',
          activity: 'Create a 2-page personal website. Include navigation links, styled headings, images, and a consistent colour scheme across both pages.',
          keyWords: ['website', 'project', 'navigation', 'multi-page'],
        },
        quiz: [
          { q: 'What element is commonly used for site navigation?', options: ['<footer>', '<main>', '<nav>', '<aside>'], answer: 2 },
        ],
      },
    ],
  },

  /* ══════ YEAR 5 ══════ */
  {
    id: 'y5-advanced-games',
    title: 'Advanced Game Design',
    description: 'Take your games to the next level with functions, cloning, physics, and AI enemies!',
    icon: '🕹️',
    color: '#8b5cf6',
    yearGroup: 5,
    difficulty: 'Year 5',
    lessons: 18,
    duration: '10 hours',
    progress: 0,
    topics: ['Functions', 'Cloning', 'Physics', 'Enemy AI', 'State Management'],
    modules: [
      {
        title: 'Functions: Reusable Code',
        completed: false,
        xp: 75,
        content: {
          explanation: 'A function is a named block of code you can reuse. Instead of copying code, you call the function by name! Functions can also take inputs called "parameters".',
          example: '// Define a function\nfunction drawStar(size) {\n  repeat 5 {\n    move(size)\n    turn(144)\n  }\n}\n\n// Use it multiple times!\ndrawStar(50)\nmove(100)\ndrawStar(30)',
          activity: 'Create a function called "spawnEnemy" that places an enemy at a random position. Call it 5 times to create 5 enemies.',
          keyWords: ['function', 'reusable', 'parameter', 'call', 'define'],
        },
        quiz: [
          { q: 'What is a function?', options: ['A variable', 'A named, reusable block of code', 'A type of sprite', 'A loop'], answer: 1 },
          { q: 'What are parameters?', options: ['Bugs', 'Inputs that functions accept', 'Types of events', 'Loop counters'], answer: 1 },
        ],
      },
      {
        title: 'Cloning Sprites',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Cloning creates copies of a sprite that can act independently. This is perfect for bullets, particles, falling objects, or swarms of enemies!',
          example: '// Create clones of a raindrop\nforever {\n  create clone of myself\n  wait 0.2 seconds\n}\n\n// When I start as a clone\nwhen I start as a clone {\n  set x to random(-200, 200)\n  set y to 180\n  repeat 30 {\n    change y by -8\n  }\n  delete this clone\n}',
          activity: 'Create a "starfield" effect: clone a star sprite and make each clone move downward at a random speed.',
          keyWords: ['clone', 'copy', 'spawn', 'instance', 'delete'],
        },
        quiz: [
          { q: 'What does cloning do?', options: ['Deletes a sprite', 'Creates an independent copy', 'Changes the colour', 'Stops the game'], answer: 1 },
          { q: 'Why should you delete clones when done?', options: ['For fun', 'To free memory and avoid slowdown', 'Clones delete themselves', 'You never need to delete clones'], answer: 1 },
        ],
      },
      {
        title: 'Gravity & Jumping',
        completed: false,
        xp: 100,
        content: {
          explanation: 'Realistic jumping uses a "velocity" variable. When you jump, set velocity UP. Each frame, add gravity (pulling DOWN). This creates a smooth arc!',
          example: 'set yVelocity to 0\nset gravity to -1\n\nforever {\n  change yVelocity by gravity\n  change y by yVelocity\n  \n  // On ground?\n  if y < groundLevel {\n    set y to groundLevel\n    set yVelocity to 0\n  }\n  \n  // Jump!\n  if key "space" pressed and on ground {\n    set yVelocity to 15\n  }\n}',
          activity: 'Create a platformer character with smooth jumping. The sprite should rise, slow down, then fall back to the ground.',
          keyWords: ['gravity', 'velocity', 'jump', 'physics', 'platformer'],
        },
        quiz: [
          { q: 'What does gravity do to yVelocity each frame?', options: ['Increases it upward', 'Makes it decrease (pulls down)', 'Sets it to zero', 'Doubles it'], answer: 1 },
          { q: 'When should the player be able to jump?', options: ['Always, even mid-air', 'Only when on the ground', 'Never', 'Only after scoring'], answer: 1 },
        ],
      },
      {
        title: 'Enemy AI Behaviour',
        completed: false,
        xp: 100,
        content: {
          explanation: 'AI (Artificial Intelligence) makes enemies seem smart. Simple AI: patrol left-right. Smarter AI: chase the player. Smartest AI: predict where the player is going!',
          example: '// Simple patrol AI\nforever {\n  move(3)\n  if touching "wall" {\n    turn(180)\n  }\n}\n\n// Chase AI\nforever {\n  point towards "player"\n  move(2)\n}',
          activity: 'Create two enemies: one that patrols back and forth, and one that chases the player. Which is scarier?',
          keyWords: ['AI', 'patrol', 'chase', 'enemy', 'behaviour', 'intelligence'],
        },
        quiz: [
          { q: 'What does "point towards player" help create?', options: ['A patrol enemy', 'A chasing enemy', 'A friendly NPC', 'A background effect'], answer: 1 },
        ],
      },
      {
        title: 'Game States',
        completed: false,
        xp: 100,
        content: {
          explanation: 'Games have different states: MENU, PLAYING, PAUSED, GAME OVER. Use a variable to track the current state and show different things based on it.',
          example: 'set gameState to "menu"\n\nforever {\n  if gameState = "menu" {\n    show title screen\n    if start button clicked {\n      set gameState to "playing"\n    }\n  }\n  if gameState = "playing" {\n    run game logic\n    if lives = 0 {\n      set gameState to "gameover"\n    }\n  }\n  if gameState = "gameover" {\n    show final score\n  }\n}',
          activity: 'Add three states to your game: a title screen, the main game, and a game over screen with a "play again" button.',
          keyWords: ['state', 'menu', 'game over', 'paused', 'screen'],
        },
        quiz: [
          { q: 'What is a game state?', options: ['The score', 'Which phase the game is in (menu, playing, etc.)', 'The player position', 'The number of sprites'], answer: 1 },
        ],
      },
      {
        title: 'Sound & Effects',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Sound effects make games feel alive! Play sounds when the player jumps, collects items, or gets hit. Background music sets the mood for the whole game.',
          example: '// Play sound when collecting\nif touching "coin" {\n  play sound "ding"\n  change score by 10\n}\n\n// Play sound when hit\nif touching "enemy" {\n  play sound "ouch"\n  change lives by -1\n}',
          activity: 'Add at least 3 sound effects to your game: one for collecting, one for getting hit, and one for game over.',
          keyWords: ['sound', 'music', 'effect', 'audio', 'feedback'],
        },
        quiz: [
          { q: 'Why are sound effects important in games?', options: ['They are not important', 'They give feedback and make games feel alive', 'They make games run faster', 'They replace graphics'], answer: 1 },
        ],
      },
      {
        title: 'Project: Platformer Game',
        completed: false,
        xp: 250,
        content: {
          explanation: 'Build a complete platformer game! Include gravity-based jumping, platforms to land on, collectible items, enemies with AI, sound effects, and game states.',
          example: '// Complete platformer checklist:\n// ✓ Player with gravity & jumping\n// ✓ Platforms to land on\n// ✓ Collectible coins\n// ✓ At least 1 enemy with AI\n// ✓ Score & lives display\n// ✓ Title screen & game over screen\n// ✓ Sound effects',
          activity: 'Build a platformer with at least 5 platforms, 10 collectibles, 2 enemies, sound effects, and 3 game states.',
          keyWords: ['platformer', 'project', 'complete game', 'polish'],
        },
        quiz: [
          { q: 'What physics concept is most important in a platformer?', options: ['Colour theory', 'Gravity and velocity', 'File management', 'Database design'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'y5-data-detective',
    title: 'Data Detective',
    description: 'Collect, organise, and display data using code. Become a data detective!',
    icon: '📊',
    color: '#10b981',
    yearGroup: 5,
    difficulty: 'Year 5',
    lessons: 14,
    duration: '7 hours',
    progress: 0,
    topics: ['Data', 'Lists', 'Charts', 'Sorting', 'Statistics'],
    modules: [
      {
        title: 'Working with Lists',
        completed: false,
        xp: 60,
        content: {
          explanation: 'A list (or array) stores multiple values in order. You can add items, remove items, and look up items by their position (index).',
          example: 'let fruits = ["apple", "banana", "cherry"]\n\n// Add an item\nfruits.push("date")\n\n// Access by index (starts at 0!)\nsay(fruits[0])  // "apple"\nsay(fruits[2])  // "cherry"\n\n// Length of list\nsay(fruits.length)  // 4',
          activity: 'Create a list of your class\'s favourite animals. Add at least 10 items and display the 1st, 5th, and last item.',
          keyWords: ['list', 'array', 'index', 'add', 'remove', 'length'],
        },
        quiz: [
          { q: 'What index is the FIRST item in a list?', options: ['1', '0', '-1', '10'], answer: 1 },
          { q: 'What does .length tell you?', options: ['The first item', 'How many items are in the list', 'The last item', 'If the list is empty'], answer: 1 },
        ],
      },
      {
        title: 'Counting & Tallying',
        completed: false,
        xp: 60,
        content: {
          explanation: 'You can use code to count how many times something appears in data. This is called tallying. It is useful for surveys and polls!',
          example: 'let votes = ["cat","dog","cat","fish","dog","cat"]\nlet catCount = 0\n\nfor each vote in votes {\n  if vote = "cat" {\n    change catCount by 1\n  }\n}\nsay("Cats: " + catCount)  // "Cats: 3"',
          activity: 'Run a class survey about favourite colours. Put all the answers in a list, then use code to count how many votes each colour got.',
          keyWords: ['count', 'tally', 'survey', 'frequency', 'data'],
        },
        quiz: [
          { q: 'What is tallying?', options: ['Adding numbers together', 'Counting how often something appears', 'Sorting a list', 'Drawing a chart'], answer: 1 },
        ],
      },
      {
        title: 'Sorting Data',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Sorting means putting data in order — alphabetically (A-Z) or numerically (smallest to biggest, or biggest to smallest). Sorted data is easier to read and understand.',
          example: 'let scores = [45, 82, 23, 91, 67]\n\n// Sort smallest to biggest\nscores.sort()  // [23, 45, 67, 82, 91]\n\nlet names = ["Zara", "Ali", "Beth"]\nnames.sort()   // ["Ali", "Beth", "Zara"]',
          activity: 'Sort a list of 10 test scores from highest to lowest. Display the top 3 and bottom 3.',
          keyWords: ['sort', 'order', 'ascending', 'descending', 'compare'],
        },
        quiz: [
          { q: 'What does ascending order mean?', options: ['Biggest to smallest', 'Random order', 'Smallest to biggest', 'Alphabetically backwards'], answer: 2 },
        ],
      },
      {
        title: 'Bar Charts',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Bar charts display data visually. Each category gets a bar, and the height represents the value. They make it easy to compare different groups.',
          example: '// Data\nlet animals = ["Cat", "Dog", "Fish"]\nlet counts =  [12,    8,     5]\n\n// Draw bars on stage\nfor i from 0 to 2 {\n  draw rectangle at x: i*80+40\n    width: 60\n    height: counts[i] * 10\n    colour: colours[i]\n  label: animals[i]\n}',
          activity: 'Collect data about favourite fruits from 20 people. Create a bar chart that shows the results. Add labels and colours.',
          keyWords: ['bar chart', 'visualise', 'compare', 'category', 'height'],
        },
        quiz: [
          { q: 'What does the height of a bar represent?', options: ['The colour', 'The label', 'The value or count', 'Nothing'], answer: 2 },
        ],
      },
      {
        title: 'Finding Averages',
        completed: false,
        xp: 75,
        content: {
          explanation: 'The mean average is the total divided by the count. The mode is the most common value. The range is the biggest minus the smallest. These help summarise data.',
          example: 'let scores = [70, 85, 90, 85, 60]\n\n// Mean: total ÷ count\nlet total = 70 + 85 + 90 + 85 + 60  // 390\nlet mean = total / 5  // 78\n\n// Range: max - min\nlet range = 90 - 60  // 30\n\n// Mode: most common = 85',
          activity: 'Calculate the mean, mode, and range for a set of 10 temperatures. Display the results with labels.',
          keyWords: ['mean', 'mode', 'range', 'average', 'statistics'],
        },
        quiz: [
          { q: 'How do you calculate the mean?', options: ['Biggest minus smallest', 'Total divided by count', 'Most common value', 'Middle value'], answer: 1 },
          { q: 'What is the mode?', options: ['The total', 'The average', 'The most common value', 'The range'], answer: 2 },
        ],
      },
      {
        title: 'Project: Class Survey',
        completed: false,
        xp: 175,
        content: {
          explanation: 'Conduct a proper survey, collect the data in lists, analyse it with code (counts, averages, sorting), and present your findings using charts!',
          example: '// Survey results for: "How many pets do you have?"\nlet petCounts = [0, 1, 2, 1, 3, 0, 1, 2, 1, 0,\n                 4, 1, 1, 0, 2, 1, 3, 1, 0, 2]\n\n// Analysis\nMean: 1.2 pets per person\nMode: 1 (most common answer)\nRange: 4 - 0 = 4\n\n// Display as bar chart + summary',
          activity: 'Design a survey question, collect real data from at least 15 people, analyse it (mean, mode, range), sort the results, and create a bar chart to present your findings.',
          keyWords: ['survey', 'analyse', 'present', 'findings', 'project'],
        },
        quiz: [
          { q: 'What are the steps of a data investigation?', options: ['Collect → Analyse → Present', 'Present → Collect → Analyse', 'Only collect', 'Only draw charts'], answer: 0 },
        ],
      },
    ],
  },

  /* ══════ YEAR 6 ══════ */
  {
    id: 'y6-app-inventor',
    title: 'App Inventor',
    description: 'Design and build interactive applications with user interfaces, databases, and real-world features!',
    icon: '📱',
    color: '#ef4444',
    yearGroup: 6,
    difficulty: 'Year 6',
    lessons: 20,
    duration: '12 hours',
    progress: 0,
    topics: ['App Design', 'UI/UX', 'Databases', 'APIs', 'Testing'],
    modules: [
      {
        title: 'Designing User Interfaces',
        completed: false,
        xp: 75,
        content: {
          explanation: 'A User Interface (UI) is what people see and interact with. Good UI design is clear, easy to use, and attractive. Plan your layout before you code!',
          example: '// UI components:\n// - Buttons: <button>Click Me</button>\n// - Text inputs: <input type="text">\n// - Dropdowns: <select><option>...</select>\n// - Labels: <label>Name:</label>\n// - Containers: <div class="card">...</div>\n\n// Wireframe your layout FIRST:\n// +--[Header/Title]--+\n// |  [Input field]    |\n// |  [Button] [Button]|\n// |  [Results area]   |\n// +---[Footer]--------+',
          activity: 'Draw a wireframe for a quiz app on paper, then build the basic HTML/CSS layout with a header, question area, 4 answer buttons, and a score display.',
          keyWords: ['UI', 'interface', 'wireframe', 'layout', 'component', 'design'],
        },
        quiz: [
          { q: 'What is UI?', options: ['A programming language', 'The visual part users interact with', 'A type of variable', 'A database'], answer: 1 },
          { q: 'What should you do before coding a UI?', options: ['Write all the code first', 'Plan/wireframe the layout', 'Choose random colours', 'Skip planning'], answer: 1 },
        ],
      },
      {
        title: 'Event-Driven Programming',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Apps respond to user actions: clicks, typing, hovering, submitting forms. Each action is an EVENT. You write "event handlers" — code that runs when events happen.',
          example: '// When button is clicked\nbutton.addEventListener("click", function() {\n  let name = input.value\n  display.textContent = "Hello, " + name + "!"\n})\n\n// When key is pressed\ninput.addEventListener("keyup", function(event) {\n  if (event.key === "Enter") {\n    submitForm()\n  }\n})',
          activity: 'Build a greeting app: the user types their name and clicks a button, and the app displays a personalised greeting with their name.',
          keyWords: ['event', 'handler', 'click', 'input', 'listener', 'callback'],
        },
        quiz: [
          { q: 'What is an event handler?', options: ['A type of variable', 'Code that runs when an event happens', 'A CSS property', 'A database query'], answer: 1 },
          { q: 'Which is an example of an event?', options: ['A variable changing', 'A button being clicked', 'A CSS style', 'An HTML tag'], answer: 1 },
        ],
      },
      {
        title: 'Storing Data',
        completed: false,
        xp: 100,
        content: {
          explanation: 'Apps need to remember data between sessions. Local storage saves data on the user\'s device as key-value pairs. It persists even after the page is closed!',
          example: '// Save data\nlocalStorage.setItem("highScore", "950")\nlocalStorage.setItem("username", "Alex")\n\n// Load data\nlet hs = localStorage.getItem("highScore")\nlet name = localStorage.getItem("username")\nsay("Welcome back, " + name + "! High score: " + hs)\n\n// Delete data\nlocalStorage.removeItem("highScore")',
          activity: 'Create a to-do list app that saves tasks to local storage. When you reload the page, your tasks should still be there!',
          keyWords: ['storage', 'persist', 'save', 'load', 'data', 'key-value'],
        },
        quiz: [
          { q: 'What does localStorage do?', options: ['Deletes all data', 'Saves data that persists between sessions', 'Only works while the page is open', 'Sends data to others'], answer: 1 },
          { q: 'How do you get a value from localStorage?', options: ['localStorage.save()', 'localStorage.getItem(key)', 'localStorage.delete()', 'localStorage.find()'], answer: 1 },
        ],
      },
      {
        title: 'Forms & Validation',
        completed: false,
        xp: 100,
        content: {
          explanation: 'Forms collect information from users. VALIDATION checks that the input makes sense before using it. For example: is the email correct? Is the age a number?',
          example: 'function validateForm() {\n  let name = nameInput.value\n  let age = parseInt(ageInput.value)\n  \n  if (name.length < 2) {\n    showError("Name must be at least 2 characters")\n    return false\n  }\n  if (isNaN(age) || age < 5 || age > 100) {\n    showError("Please enter a valid age")\n    return false\n  }\n  return true  // All good!\n}',
          activity: 'Build a sign-up form with name, age, and favourite colour. Validate that the name is not empty, the age is a number between 5 and 100, and a colour is selected.',
          keyWords: ['form', 'validation', 'input', 'check', 'error', 'submit'],
        },
        quiz: [
          { q: 'What is form validation?', options: ['Making forms look pretty', 'Checking that input data is correct', 'Deleting form data', 'Sending forms to a server'], answer: 1 },
          { q: 'Why is validation important?', options: ['It is not important', 'It prevents incorrect or missing data from being used', 'It makes forms slower', 'It only works in Chrome'], answer: 1 },
        ],
      },
      {
        title: 'Connecting to APIs',
        completed: false,
        xp: 125,
        content: {
          explanation: 'An API (Application Programming Interface) lets your app get data from other services. For example, you can get weather data, jokes, or Pokémon info from free APIs!',
          example: '// Fetch a random joke from an API\nfetch("https://official-joke-api.example.com/random_joke")\n  .then(response => response.json())\n  .then(data => {\n    say(data.setup)\n    wait(2)\n    say(data.punchline)\n  })',
          activity: 'Build an app that fetches data from a free API and displays it nicely. For example, a Pokémon lookup or random quote generator.',
          keyWords: ['API', 'fetch', 'data', 'JSON', 'request', 'response'],
        },
        quiz: [
          { q: 'What is an API?', options: ['A programming language', 'A way to get data from other services', 'A type of database', 'A CSS framework'], answer: 1 },
          { q: 'What format do most APIs return data in?', options: ['HTML', 'CSS', 'JSON', 'Plain text'], answer: 2 },
        ],
      },
      {
        title: 'Testing & Debugging',
        completed: false,
        xp: 100,
        content: {
          explanation: 'Professional developers test their code systematically. Write TEST CASES: what inputs should give what outputs? Test edge cases — what happens with unusual inputs?',
          example: '// Function to test\nfunction calculateGrade(score) {\n  if (score >= 90) return "A"\n  if (score >= 70) return "B"\n  if (score >= 50) return "C"\n  return "F"\n}\n\n// Test cases\nconsole.assert(calculateGrade(95) === "A", "Test 1 failed")\nconsole.assert(calculateGrade(70) === "B", "Test 2 failed")\nconsole.assert(calculateGrade(50) === "C", "Test 3 failed")\nconsole.assert(calculateGrade(30) === "F", "Test 4 failed")\n// Edge cases\nconsole.assert(calculateGrade(90) === "A", "Test 5 failed")\nconsole.assert(calculateGrade(0)  === "F", "Test 6 failed")',
          activity: 'Write a function that converts temperatures from Celsius to Fahrenheit. Then write at least 6 test cases, including edge cases like 0°C and 100°C.',
          keyWords: ['test', 'debug', 'edge case', 'assert', 'systematic'],
        },
        quiz: [
          { q: 'What is an edge case?', options: ['The most common input', 'An unusual or extreme input', 'A type of bug', 'A testing tool'], answer: 1 },
        ],
      },
      {
        title: 'Project: Interactive Quiz App',
        completed: false,
        xp: 275,
        content: {
          explanation: 'Build a complete interactive quiz application! It should have a welcome screen, multiple questions, score tracking, form validation, local storage for high scores, and a results screen.',
          example: '// Quiz App features:\n// ✓ Welcome screen with name input\n// ✓ At least 10 questions\n// ✓ Score tracking (displayed live)\n// ✓ Timer per question (10 seconds)\n// ✓ Results screen with grade\n// ✓ High scores saved in localStorage\n// ✓ "Play Again" button\n// ✓ Input validation on name',
          activity: 'Build the complete quiz app with all the features above. Choose a topic you enjoy (animals, geography, maths, etc.) and write the questions yourself.',
          keyWords: ['quiz app', 'project', 'interactive', 'complete'],
        },
        quiz: [
          { q: 'What should a quiz app save to localStorage?', options: ['The questions', 'The CSS', 'High scores and player names', 'Nothing'], answer: 2 },
        ],
      },
    ],
  },
  {
    id: 'y6-python-intro',
    title: 'Python Adventures',
    description: 'Transition from blocks to real Python code! Learn text-based programming with one of the world\'s most popular languages.',
    icon: '🐍',
    color: '#f59e0b',
    yearGroup: 6,
    difficulty: 'Year 6',
    lessons: 18,
    duration: '10 hours',
    progress: 0,
    topics: ['Python', 'Variables', 'Loops', 'Functions', 'Lists', 'Dictionaries'],
    modules: [
      {
        title: 'Hello Python!',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Python is a real programming language used by professionals! Instead of dragging blocks, you TYPE code. Python reads almost like English, making it a great first text language.',
          example: '# Your first Python program!\nprint("Hello, World!")\n\n# Ask for input\nname = input("What is your name? ")\nprint("Hello, " + name + "!")\n\n# Use f-strings (easier!)\nprint(f"Welcome, {name}!")',
          activity: 'Write a Python program that asks for the user\'s name and age, then prints a greeting including both.',
          keyWords: ['Python', 'print', 'input', 'text-based', 'type'],
        },
        quiz: [
          { q: 'What function prints text in Python?', options: ['say()', 'echo()', 'print()', 'display()'], answer: 2 },
          { q: 'What function gets input from the user?', options: ['get()', 'read()', 'ask()', 'input()'], answer: 3 },
        ],
      },
      {
        title: 'Variables & Types',
        completed: false,
        xp: 60,
        content: {
          explanation: 'Python variables can hold different TYPES of data: strings (text), integers (whole numbers), floats (decimal numbers), and booleans (True/False).',
          example: 'name = "Alice"       # string\nage = 11             # integer\nheight = 1.45        # float\nis_student = True    # boolean\n\n# Check the type\nprint(type(name))    # <class \'str\'>\nprint(type(age))     # <class \'int\'>\n\n# Convert types\nage_text = str(age)  # "11"\nnum = int("42")      # 42',
          activity: 'Create variables for a character in a story: name (string), age (int), height (float), and is_hero (boolean). Print them all in a sentence.',
          keyWords: ['variable', 'string', 'integer', 'float', 'boolean', 'type'],
        },
        quiz: [
          { q: 'What type is the value 3.14?', options: ['string', 'integer', 'float', 'boolean'], answer: 2 },
          { q: 'What does str(42) return?', options: ['42', '"42"', 'Error', 'True'], answer: 1 },
        ],
      },
      {
        title: 'If Statements',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Python uses if, elif (else if), and else to make decisions. INDENTATION matters in Python — the code inside an if block must be indented!',
          example: 'score = int(input("Enter your score: "))\n\nif score >= 90:\n    print("Grade: A - Excellent!")\nelif score >= 70:\n    print("Grade: B - Good job!")\nelif score >= 50:\n    print("Grade: C - Keep trying!")\nelse:\n    print("Grade: F - Try again!")\n\n# Comparison operators:\n# ==  equals\n# !=  not equals\n# >   greater than\n# <   less than\n# >=  greater or equal\n# <=  less or equal',
          activity: 'Write a "number guessing" program: pick a secret number, ask the user to guess, and tell them if they are too high, too low, or correct!',
          keyWords: ['if', 'elif', 'else', 'condition', 'indentation', 'comparison'],
        },
        quiz: [
          { q: 'What does "elif" mean in Python?', options: ['End if', 'Else if', 'Extra loop', 'Error handling'], answer: 1 },
          { q: 'Why is indentation important in Python?', options: ['It makes code look nice', 'It is optional', 'It tells Python which code belongs inside a block', 'It is only for comments'], answer: 2 },
        ],
      },
      {
        title: 'Loops in Python',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Python has FOR loops (repeat a specific number of times or for each item) and WHILE loops (repeat while a condition is true).',
          example: '# For loop with range\nfor i in range(5):\n    print(f"Count: {i}")  # 0, 1, 2, 3, 4\n\n# For loop over a list\ncolours = ["red", "green", "blue"]\nfor colour in colours:\n    print(f"I like {colour}!")\n\n# While loop\ncount = 10\nwhile count > 0:\n    print(f"{count}...")\n    count -= 1\nprint("Blast off! 🚀")',
          activity: 'Write a countdown from 10 to 1 using a while loop, then write a times table generator using a for loop.',
          keyWords: ['for', 'while', 'range', 'loop', 'iterate', 'count'],
        },
        quiz: [
          { q: 'What does range(5) give you?', options: ['1,2,3,4,5', '0,1,2,3,4', '0,1,2,3,4,5', '5,4,3,2,1'], answer: 1 },
          { q: 'When does a while loop stop?', options: ['After 10 times', 'When the condition becomes False', 'Never', 'When it reaches the end of a list'], answer: 1 },
        ],
      },
      {
        title: 'Functions in Python',
        completed: false,
        xp: 100,
        content: {
          explanation: 'Functions in Python are defined with the "def" keyword. They can take parameters and return values. Functions help organise code into reusable pieces.',
          example: '# Define a function\ndef greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\n# Call the function\nmessage = greet("Alice")\nprint(message)  # "Hello, Alice!"\n\nprint(greet("Bob", "Hi"))  # "Hi, Bob!"\n\n# Function with calculations\ndef area_of_circle(radius):\n    pi = 3.14159\n    return pi * radius * radius\n\nprint(area_of_circle(5))  # 78.53975',
          activity: 'Write functions for: greeting a user, calculating the area of a rectangle, and converting Celsius to Fahrenheit. Call each function with different inputs.',
          keyWords: ['def', 'function', 'parameter', 'return', 'call'],
        },
        quiz: [
          { q: 'What keyword defines a function in Python?', options: ['function', 'func', 'def', 'define'], answer: 2 },
          { q: 'What does "return" do?', options: ['Prints a value', 'Sends a value back from the function', 'Stops the program', 'Creates a variable'], answer: 1 },
        ],
      },
      {
        title: 'Lists & Dictionaries',
        completed: false,
        xp: 100,
        content: {
          explanation: 'Lists store ordered collections. Dictionaries store key-value pairs — like a real dictionary where you look up a word (key) to find its meaning (value).',
          example: '# Lists\nscores = [85, 92, 78, 95, 88]\nscores.append(91)\nprint(max(scores))  # 95\nprint(min(scores))  # 78\nprint(sum(scores) / len(scores))  # average\n\n# Dictionaries\nstudent = {\n    "name": "Alice",\n    "age": 11,\n    "subjects": ["Maths", "Science"]\n}\nprint(student["name"])  # "Alice"\nstudent["grade"] = "A"  # add new key',
          activity: 'Create a dictionary-based "address book" program. The user can add a contact (name → phone number), look up a contact, and list all contacts.',
          keyWords: ['list', 'dictionary', 'key', 'value', 'append', 'lookup'],
        },
        quiz: [
          { q: 'What is a dictionary?', options: ['An ordered list', 'A set of key-value pairs', 'A type of loop', 'A Python module'], answer: 1 },
          { q: 'How do you add to a list?', options: ['list.add()', 'list.append()', 'list.push()', 'list.insert()'], answer: 1 },
        ],
      },
      {
        title: 'Project: Text Adventure Game',
        completed: false,
        xp: 275,
        content: {
          explanation: 'Build a text-based adventure game in Python! The player reads descriptions and types choices. Use functions for each room, dictionaries for game state, and if/else for decisions.',
          example: 'def dark_cave():\n    print("You are in a dark cave.")\n    print("You see a torch and a door.")\n    choice = input("Take torch (t) or open door (d)? ")\n    \n    if choice == "t":\n        inventory.append("torch")\n        print("You picked up the torch!")\n        dark_cave()  # return to same room\n    elif choice == "d":\n        if "torch" in inventory:\n            print("You light the way and enter!")\n            treasure_room()\n        else:\n            print("Too dark! You stumble and get lost.")\n            game_over()',
          activity: 'Build a text adventure with at least 5 rooms, 3 items to collect, 2 puzzles to solve, and multiple endings. Use functions, dictionaries, and lists.',
          keyWords: ['text adventure', 'game', 'Python project', 'interactive fiction'],
        },
        quiz: [
          { q: 'What data structure is good for storing inventory?', options: ['A string', 'A list', 'An integer', 'A float'], answer: 1 },
          { q: 'What data structure is good for storing room descriptions?', options: ['A list', 'A dictionary', 'A boolean', 'A loop'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'y6-cyber-smart',
    title: 'Cyber Smart',
    description: 'Stay safe online! Learn about digital security, encryption, data privacy, and how to protect yourself.',
    icon: '🛡️',
    color: '#6366f1',
    yearGroup: 6,
    difficulty: 'Year 6',
    lessons: 12,
    duration: '6 hours',
    progress: 0,
    topics: ['Online Safety', 'Encryption', 'Passwords', 'Privacy', 'Digital Footprint'],
    modules: [
      {
        title: 'Your Digital Footprint',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Everything you do online leaves a trace — your digital footprint. Posts, comments, searches, and even likes are all recorded. Once something is online, it can be very hard to remove!',
          example: '// Things that create a digital footprint:\n// - Social media posts and comments\n// - Websites you visit\n// - Photos you upload\n// - Messages you send\n// - Apps you download\n// - Online purchases\n//\n// Ask yourself: "Would I be happy for\n// my teacher or parents to see this?"',
          activity: 'Create a poster (using HTML/CSS) about digital footprints. Include 5 tips for keeping a positive online presence.',
          keyWords: ['digital footprint', 'online presence', 'privacy', 'trace'],
        },
        quiz: [
          { q: 'What is a digital footprint?', options: ['A type of computer virus', 'The trail of data you leave online', 'Your computer\'s processor', 'A coding language'], answer: 1 },
          { q: 'Can you fully delete your digital footprint?', options: ['Yes, easily', 'It is very difficult once data is shared online', 'Footprints delete after a week', 'Only if you restart your computer'], answer: 1 },
        ],
      },
      {
        title: 'Password Security',
        completed: false,
        xp: 60,
        content: {
          explanation: 'Strong passwords are long, unique, and mix uppercase, lowercase, numbers, and symbols. Never reuse passwords! A password manager can help you remember them all.',
          example: '// Weak passwords:\n// "password123"   (too common)\n// "alice"          (too short)\n// "12345678"       (no letters)\n\n// Strong passwords:\n// "Purple-Tiger-Runs-42!"\n// "My$ecureP@ss2024"\n\n// Password strength checker\nfunction checkStrength(password) {\n  let score = 0\n  if (password.length >= 12) score += 1\n  if (/[A-Z]/.test(password)) score += 1\n  if (/[0-9]/.test(password)) score += 1\n  if (/[^A-Za-z0-9]/.test(password)) score += 1\n  return score  // 0=weak, 4=strong\n}',
          activity: 'Build a "password strength meter" app. The user types a password and sees a strength rating (weak/medium/strong) with colour coding (red/amber/green).',
          keyWords: ['password', 'security', 'strong', 'unique', 'manager'],
        },
        quiz: [
          { q: 'Which is the strongest password?', options: ['password', '12345678', 'dog', 'Purple-Tiger-42!'], answer: 3 },
          { q: 'Should you use the same password for every website?', options: ['Yes, easier to remember', 'No, if one site is hacked, all your accounts are at risk', 'It does not matter', 'Only for important sites'], answer: 1 },
        ],
      },
      {
        title: 'Encryption Basics',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Encryption scrambles data so only authorised people can read it. A simple example is the Caesar cipher, which shifts each letter. Modern encryption is much more complex!',
          example: '// Caesar cipher (shift of 3)\n// A → D,  B → E,  C → F ...\n// "HELLO" becomes "KHOOR"\n\nfunction encrypt(text, shift) {\n  let result = ""\n  for (let char of text) {\n    if (char >= "A" && char <= "Z") {\n      let code = ((char.charCodeAt(0) - 65 + shift) % 26) + 65\n      result += String.fromCharCode(code)\n    } else {\n      result += char\n    }\n  }\n  return result\n}\n\nencrypt("HELLO", 3)  // "KHOOR"',
          activity: 'Build a Caesar cipher encoder and decoder. The user types a message and a shift number, and your app encrypts or decrypts it.',
          keyWords: ['encryption', 'cipher', 'Caesar', 'shift', 'decode', 'encode'],
        },
        quiz: [
          { q: 'What does encryption do?', options: ['Deletes data', 'Scrambles data so only authorised people can read it', 'Makes data bigger', 'Sends data faster'], answer: 1 },
          { q: 'In a Caesar cipher with shift 3, what does A become?', options: ['B', 'C', 'D', 'Z'], answer: 2 },
        ],
      },
      {
        title: 'Spotting Scams',
        completed: false,
        xp: 60,
        content: {
          explanation: 'Phishing scams try to trick you into giving away personal information. They use fake emails, websites, and messages that LOOK real but are not. Always check carefully!',
          example: '// Red flags in emails/messages:\n// ⚠️ "URGENT! Your account will be deleted!"\n// ⚠️ Misspellings or bad grammar\n// ⚠️ Sender\'s email looks wrong\n// ⚠️ "Click here NOW" pressure\n// ⚠️ Asks for your password or bank details\n// ⚠️ Too-good-to-be-true offers\n//\n// Safe practices:\n// ✓ Check the sender\'s email address carefully\n// ✓ Don\'t click suspicious links\n// ✓ Go directly to the real website instead\n// ✓ Tell a trusted adult if unsure',
          activity: 'Create an interactive "Spot the Scam" quiz. Show 6 messages (emails/texts) and ask the user to identify which are real and which are scams. Explain why.',
          keyWords: ['phishing', 'scam', 'fake', 'suspicious', 'verify'],
        },
        quiz: [
          { q: 'What is phishing?', options: ['A real fishing trip', 'Fake messages trying to steal your information', 'A secure email', 'A type of encryption'], answer: 1 },
          { q: 'What should you do if you get a suspicious email?', options: ['Click the link to check', 'Reply with your password', 'Delete it and tell a trusted adult', 'Forward it to friends'], answer: 2 },
        ],
      },
      {
        title: 'Project: Security Toolkit',
        completed: false,
        xp: 175,
        content: {
          explanation: 'Build a "Security Toolkit" web app with multiple tools: a password strength checker, a Caesar cipher encoder/decoder, and a phishing quiz!',
          example: '// Security Toolkit layout:\n// [Tab: Password Checker] [Tab: Cipher] [Tab: Scam Quiz]\n//\n// Password Checker: strength meter + tips\n// Cipher: encode/decode with adjustable shift\n// Scam Quiz: 6 questions, score tracking',
          activity: 'Build the complete security toolkit with all 3 tools. Style it nicely and include helpful tips on each page.',
          keyWords: ['toolkit', 'security', 'project', 'multi-tool'],
        },
        quiz: [
          { q: 'Why is cybersecurity education important?', options: ['It is not important', 'It helps protect you and others online', 'Only adults need to know about it', 'Computers handle security automatically'], answer: 1 },
        ],
      },
    ],
  },
];

export const achievements = [
  { id: 1, icon: '🏆', name: 'First Code', desc: 'Write your first program', earned: true },
  { id: 2, icon: '🐛', name: 'Bug Squasher', desc: 'Fix 10 bugs', earned: true },
  { id: 3, icon: '🔁', name: 'Loop Master', desc: 'Complete all loop challenges', earned: true },
  { id: 4, icon: '🎮', name: 'Game Creator', desc: 'Build your first game', earned: true },
  { id: 5, icon: '🌐', name: 'Web Wizard', desc: 'Create 3 websites', earned: true },
  { id: 6, icon: '🔥', name: '7-Day Streak', desc: 'Code for 7 days in a row', earned: false },
  { id: 7, icon: '🤖', name: 'AI Apprentice', desc: 'Complete AI basics course', earned: false },
  { id: 8, icon: '👥', name: 'Team Player', desc: 'Collaborate on 5 projects', earned: false },
  { id: 9, icon: '⭐', name: 'Star Creator', desc: 'Get 100 likes on a project', earned: false },
  { id: 10, icon: '🧠', name: 'Polyglot', desc: 'Code in 3 different languages', earned: false },
  { id: 11, icon: '🏗️', name: 'Architect', desc: 'Build 25 projects', earned: false },
  { id: 12, icon: '💎', name: 'Diamond Coder', desc: 'Reach level 50', earned: false },
];

export const dailyChallenges = [
  { id: 1, title: 'Fibonacci Generator', difficulty: 'Medium', xp: 150, language: 'Python', completed: false },
  { id: 2, title: 'CSS Art Challenge', difficulty: 'Easy', xp: 100, language: 'HTML/CSS', completed: true },
  { id: 3, title: 'Sorting Algorithm', difficulty: 'Hard', xp: 250, language: 'JavaScript', completed: false },
];

export const leaderboard = [
  { rank: 1, name: 'AlgoQueen', level: 42, xp: 84200, avatar: 'AQ', badges: 28 },
  { rank: 2, name: 'ByteNinja', level: 38, xp: 72100, avatar: 'BN', badges: 24 },
  { rank: 3, name: 'CodeWizard', level: 35, xp: 65400, avatar: 'CW', badges: 22 },
  { rank: 4, name: 'PixelHero', level: 31, xp: 58900, avatar: 'PH', badges: 19 },
  { rank: 5, name: 'DataDragon', level: 29, xp: 53200, avatar: 'DD', badges: 17 },
  { rank: 6, name: 'WebStar', level: 27, xp: 49800, avatar: 'WS', badges: 15 },
  { rank: 7, name: 'CodeExplorer', level: 7, xp: 2450, avatar: 'CE', badges: 5, isUser: true },
  { rank: 8, name: 'BugHunter', level: 24, xp: 44100, avatar: 'BH', badges: 14 },
  { rank: 9, name: 'ScriptKid', level: 22, xp: 40500, avatar: 'SK', badges: 12 },
  { rank: 10, name: 'DevDynamo', level: 20, xp: 37200, avatar: 'DV', badges: 11 },
];

export const communityProjects = [
  {
    id: 'cp1', title: 'Neon Racer', author: 'AlgoQueen', type: 'game',
    likes: 342, views: 1820, remixes: 28, featured: true,
    preview: '🏎️', description: 'A fast-paced neon racing game with power-ups',
  },
  {
    id: 'cp2', title: 'Weather Dashboard', author: 'WebStar', type: 'website',
    likes: 189, views: 956, remixes: 15, featured: true,
    preview: '🌤️', description: 'Beautiful weather app with live data',
  },
  {
    id: 'cp3', title: 'AI Music Generator', author: 'ByteNinja', type: 'app',
    likes: 567, views: 3400, remixes: 82, featured: true,
    preview: '🎵', description: 'Generate unique music using AI',
  },
  {
    id: 'cp4', title: 'Pixel Art Editor', author: 'PixelHero', type: 'app',
    likes: 234, views: 1200, remixes: 41, featured: false,
    preview: '🎨', description: 'Create pixel art with export to PNG',
  },
  {
    id: 'cp5', title: 'Solar System Sim', author: 'DataDragon', type: 'simulation',
    likes: 445, views: 2100, remixes: 33, featured: true,
    preview: '🪐', description: 'Interactive 3D solar system simulation',
  },
  {
    id: 'cp6', title: 'Chat Application', author: 'CodeWizard', type: 'app',
    likes: 156, views: 890, remixes: 12, featured: false,
    preview: '💬', description: 'Real-time chat with emoji support',
  },
];
