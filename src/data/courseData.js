/* ===================================================================
   ByteBuddies Courses - UK Year Groups 3-6
   Year 3 (ages 7-8), Year 4 (ages 8-9),
   Year 5 (ages 9-10), Year 6 (ages 10-11)

   12 full courses with 10-15 modules each, 3-4 quiz questions per module
   Dedicated Sprite tracks (Y3, Y4) and Python tracks (Y5, Y6)
   =================================================================== */

export const courses = [

  /* ====== YEAR 3 - Ages 7-8 ====== */


  /* ====== YEAR 3 - Ages 7-8 ====== */

{
  id: 'y3-first-steps',
  title: 'My First Code',
  description: 'Start your coding adventure! Learn to control a sprite using colourful blocks, draw amazing shapes, and create your very first program.',
  icon: '🧩',
  color: '#6366f1',
  yearGroup: 3,
  difficulty: 'Beginner',
  lessons: 12,
  duration: '6 hours',
  progress: 0,
  topics: ['Events', 'Sequences', 'Output', 'Movement', 'Turning', 'Pen Drawing', 'Loops', 'Colour', 'Pen Size', 'Coordinates', 'Polygons', 'Creative Project'],
  modules: [
    {
      title: 'Meet the Blocks!',
      completed: false,
      xp: 40,
      content: {
        explanation: 'Welcome to block coding! Instead of typing letters and words, you drag colourful blocks that snap together like LEGO bricks. Each block gives your sprite one instruction to follow. The most important block of all is the "when 🚩 clicked" block — it is the START button for your whole program. Without it, nothing happens!\n\nThink of it like a race. The green flag is the starting pistol — when you fire it, your sprite springs into action and follows every block underneath it in order, from top to bottom. Computers always follow instructions in order, one at a time. This is called a sequence.\n\nYou will find the "when 🚩 clicked" block in the Events section, and it is usually bright yellow. Every program you make in this course will begin with this block. Try clicking the green flag at the top of the stage — you will see your sprite get ready to run your instructions!\n\nToday you are going to write your very first program. It only needs one block: the "when 🚩 clicked" block all on its own. When you click the flag, your sprite will simply be ready and waiting — and that is already a real program!',
        example: '// Your very first program!\nwhen 🚩 clicked',
        activity: '1️⃣ Look at the block palette on the left side of the screen.\n2️⃣ Find the bright yellow "when 🚩 clicked" block — it is at the very top of the Events section.\n3️⃣ Drag it onto the white coding area in the middle (called the workspace).\n4️⃣ Click the green flag at the top of the stage on the right.\n5️⃣ Watch your sprite — it is now ready and waiting for more instructions!\n6️⃣ Try clicking the flag three times. Notice how the sprite resets to the start each time.\n\n🌟 Challenge: Can you explain to a friend sitting next to you what the green flag does? Use the words "start" and "sequence" in your explanation!',
        keyWords: ['block', 'sprite', 'flag', 'sequence', 'workspace', 'instruction', 'program'],
      },
      quiz: [
        { q: 'What does the "when 🚩 clicked" block do?', options: ['It starts the program running', 'It stops the program', 'It moves the sprite forward', 'It draws a line'], answer: 0 },
        { q: 'In block coding, blocks are dragged onto the...', options: ['Stage', 'Workspace', 'Palette', 'Toolbox'], answer: 1 },
        { q: 'What is it called when a computer follows instructions one after another in order?', options: ['A loop', 'A repeat', 'A sequence', 'A bug'], answer: 2 },
        { q: 'Where do you find the "when 🚩 clicked" block?', options: ['In the Motion section', 'In the Pen section', 'In the Events section', 'In the Looks section'], answer: 2 },
      ],
    },
    {
      title: 'Make Your Sprite Talk',
      completed: false,
      xp: 45,
      content: {
        explanation: 'Now that you know how to start a program, let\'s make your sprite say something! The "say _" block makes a speech bubble appear above your sprite with any message you choose. Just type your words into the white box inside the block. It is like giving your sprite a voice!\n\nYou can stack as many "say _" blocks as you like underneath the "when 🚩 clicked" block. However, watch out — each new "say _" block will replace the previous speech bubble straight away. So if you put three "say _" blocks in a row, you will only see the last one! Later you will learn how to fix this using the "wait _" block.\n\nThe "say _" block is brilliant for making your sprite introduce itself, tell a joke, or share a fun fact. Think about your favourite character from a book or TV show — what would they say? You can make your sprite say exactly that! Speech bubbles appear on the stage for the audience to read.\n\nRemember: the words you type go inside the white oval box in the "say _" block. You can type anything — your name, a greeting, even an emoji! Computers will display exactly what you type, so be careful with your spelling.',
        example: '// Make your sprite talk!\nwhen 🚩 clicked\n  say "Hello! I am a coding sprite!"\n  say "I love making things with blocks!"\n  say "Let\'s code together!"',
        activity: '1️⃣ Start with the "when 🚩 clicked" block in your workspace.\n2️⃣ Find the "say _" block in the Looks section — it is usually purple.\n3️⃣ Drag a "say _" block and snap it underneath the flag block.\n4️⃣ Click inside the white box and type: "Hi! My name is Sparky!"\n5️⃣ Add a second "say _" block underneath and type: "I love block coding!"\n6️⃣ Click the green flag. What do you see? Only the last message shows — can you spot why?\n7️⃣ Try adding a third "say _" block with your own favourite message.\n\n🌟 Challenge: Write a short story using five "say _" blocks. Give your sprite a name and a personality — is it brave, funny, or shy? Add an introduction, a problem, and a happy ending!',
        keyWords: ['say', 'speech bubble', 'message', 'sprite', 'text', 'output'],
      },
      quiz: [
        { q: 'What does the "say _" block do?', options: ['It moves the sprite', 'It makes a speech bubble appear', 'It draws a line', 'It stops the program'], answer: 1 },
        { q: 'If you stack three "say _" blocks with no waits, which message will you see?', options: ['All three at once', 'The first one only', 'The last one only', 'A random one'], answer: 2 },
        { q: 'Where would you find the "say _" block in the palette?', options: ['Motion', 'Events', 'Pen', 'Looks'], answer: 3 },
        { q: 'What goes inside the white oval box in the "say _" block?', options: ['A number', 'Your message or words', 'A colour', 'A direction'], answer: 1 },
      ],
    },
    {
      title: 'Wait for It...',
      completed: false,
      xp: 50,
      content: {
        explanation: 'Remember the problem from last lesson — all the "say _" blocks replaced each other instantly? The "wait _ secs" block is the solution! It pauses your program for a set number of seconds before moving on to the next block. This lets your audience actually read each speech bubble before it disappears.\n\nThink of the "wait _ secs" block like a pause button in a film. If you put "wait 2 secs" after a "say _" block, the speech bubble stays on screen for two whole seconds before the next instruction runs. You can choose any number of seconds — even 0.5 for a quick flash, or 5 for a long dramatic pause!\n\nCombining "say _" and "wait _ secs" blocks is how you create a proper animated story or dialogue. It is like writing a script for your sprite to perform. The audience watches the stage and reads each line, just like watching a play. You are now a real storyteller and a coder at the same time!\n\nYou can also use "wait _ secs" on its own to create suspense — like pausing before the punchline of a joke. Try making your sprite say "Why did the chicken cross the road?" and then wait two seconds before saying the answer!',
        example: '// A proper story with timing!\nwhen 🚩 clicked\n  say "Once upon a time..."\n  wait 2 secs\n  say "There was a brave little sprite."\n  wait 2 secs\n  say "It learned to code..."\n  wait 2 secs\n  say "And lived happily ever after! 🎉"',
        activity: '1️⃣ Clear your workspace and start fresh with "when 🚩 clicked".\n2️⃣ Add a "say _" block: "Knock knock!"\n3️⃣ Add a "wait _ secs" block and set it to 2.\n4️⃣ Add another "say _" block: "Who\'s there?"\n5️⃣ Add another "wait _ secs" block set to 2.\n6️⃣ Add a "say _" block: "Lettuce!"\n7️⃣ Add "wait _ secs" set to 2.\n8️⃣ Add a final "say _" block: "Lettuce in, it\'s cold out here! 🥬"\n9️⃣ Click the green flag and enjoy your joke!\n\n🌟 Challenge: Create a three-line poem where your sprite says each line with a 1.5 second wait between them. Make the poem about your favourite animal!',
        keyWords: ['wait', 'seconds', 'pause', 'timing', 'sequence', 'story', 'dialogue'],
      },
      quiz: [
        { q: 'What does the "wait _ secs" block do?', options: ['It moves the sprite backwards', 'It pauses the program for a number of seconds', 'It repeats the last action', 'It clears the stage'], answer: 1 },
        { q: 'How do you make a speech bubble stay visible for 3 seconds?', options: ['Use three "say _" blocks', 'Put "wait 3 secs" after the "say _" block', 'Click the sprite three times', 'Use the repeat block'], answer: 1 },
        { q: 'What number would you put in "wait _ secs" for half a second?', options: ['0', '0.5', '2', '50'], answer: 1 },
        { q: 'Which combination creates an animated story?', options: ['"move _" and "turn _"', '"say _" and "wait _ secs" alternating', '"pen down" and "pen up"', '"repeat _" only'], answer: 1 },
      ],
    },
    {
      title: 'Move Your Sprite',
      completed: false,
      xp: 50,
      content: {
        explanation: 'Time to get your sprite moving! The "move _ steps" block makes your sprite walk forward in whichever direction it is currently facing. Steps are tiny units of distance on the stage — think of them like small footsteps. Ten steps is a tiny shuffle, one hundred steps is a big stride across the stage!\n\nThe stage is the white rectangle on the right where your sprite lives. It is like a theatre stage or a football pitch — your sprite can move anywhere on it. When your sprite reaches the edge, it will just stop or even disappear off the screen, so be careful with big numbers!\n\nYou can use negative numbers too — "move -50 steps" makes the sprite walk backwards! This is a great trick for making sprites bounce back and forth. But for now, let\'s focus on moving forward and watching the sprite travel across the stage.\n\nHere is an important tip: if you click the green flag again, the sprite starts from wherever it ended up last time. If you want it to always start from the same place, you can use the "go to x: _ y: _" block (coming in a later lesson!) or simply drag the sprite back to the middle by hand between runs.',
        example: '// Move your sprite across the stage\nwhen 🚩 clicked\n  say "Time to move!"\n  wait 1 secs\n  move 100 steps\n  wait 1 secs\n  move 100 steps\n  wait 1 secs\n  say "I walked 200 steps!"',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "say _": "I\'m going on a walk!"\n3️⃣ Add "wait _ secs" set to 1.\n4️⃣ Add "move _ steps" and set it to 50. Click the flag — where does the sprite go?\n5️⃣ Change the number to 150. Click the flag again — farther or shorter?\n6️⃣ Now add three "move _ steps" blocks all set to 50. How far does it go altogether?\n7️⃣ Try a negative number like -100. Which way does it go?\n8️⃣ Add "say _": "I made it!" at the end.\n\n🌟 Challenge: Make your sprite walk 50 steps, say "One third of the way!", walk 50 more, say "Two thirds!", walk 50 more, say "I reached 150 steps total! 🏁"',
        keyWords: ['move', 'steps', 'distance', 'stage', 'forward', 'backward', 'direction'],
      },
      quiz: [
        { q: 'What does "move 100 steps" do?', options: ['Turns the sprite 100 degrees', 'Moves the sprite 100 steps forward', 'Waits for 100 seconds', 'Repeats an action 100 times'], answer: 1 },
        { q: 'What happens if you use a negative number in "move _ steps"?', options: ['The sprite stops', 'The sprite jumps up', 'The sprite moves backwards', 'The sprite grows bigger'], answer: 2 },
        { q: 'What is the stage?', options: ['The block palette', 'The workspace where you drag blocks', 'The white area where the sprite moves', 'The score counter'], answer: 2 },
        { q: 'If you use "move 50 steps" three times, how far does the sprite travel in total?', options: ['50 steps', '53 steps', '150 steps', '500 steps'], answer: 2 },
      ],
    },
    {
      title: 'Turn and Change Direction',
      completed: false,
      xp: 55,
      content: {
        explanation: 'Moving in a straight line is fun, but turning is what lets you draw shapes and explore the whole stage! There are two turning blocks: "turn ↻ _ degrees" spins your sprite to the right (clockwise, like a clock\'s hands), and "turn ↺ _ degrees" spins it to the left (anticlockwise, the opposite direction).\n\nDegrees are the units we use to measure turning. A full spin all the way around is 360 degrees. Half a spin is 180 degrees — your sprite will face the opposite direction. A quarter turn is 90 degrees — like turning a corner. By combining "move _ steps" and "turn _ degrees" blocks, you can make your sprite walk in any direction!\n\nImagine you are controlling a robot by radio remote. You press "forward" and "turn right" buttons to navigate it around an obstacle course. That is exactly what you are doing with these blocks! The sprite is your robot, and your blocks are the remote control buttons.\n\nHere is a fun challenge: how many degrees do you need to turn to make a perfect corner for a square? The answer is 90! And for a triangle? You need to turn 120 degrees at each corner. Different shapes need different turning angles — you will explore this more in the coming lessons.',
        example: '// Turn and move to make an L-shape\nwhen 🚩 clicked\n  move 100 steps\n  turn ↻ 90 degrees\n  move 100 steps',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "move _ steps" set to 100.\n3️⃣ Add "turn ↻ _ degrees" set to 90. Click the flag — the sprite turns right!\n4️⃣ Add another "move _ steps" set to 100. Now it draws an L-shape path.\n5️⃣ Add "turn ↻ _ degrees" set to 90, then "move _ steps" set to 100.\n6️⃣ Keep adding turns and moves — try to get back to where you started!\n7️⃣ Now experiment with "turn ↺ _ degrees" (turning left). What happens if you turn left instead?\n\n🌟 Challenge: Try to make your sprite walk in a Z-shape! Plan on paper first: which direction do you move, and which way do you turn at each corner?',
        keyWords: ['turn', 'degrees', 'clockwise', 'anticlockwise', 'direction', 'angle', 'rotate'],
      },
      quiz: [
        { q: 'How many degrees is a complete full circle turn?', options: ['360', '90', '180', '270'], answer: 0 },
        { q: 'What does "turn ↻ 90 degrees" do?', options: ['Turns the sprite 90 degrees to the left', 'Turns the sprite 90 degrees to the right', 'Moves the sprite 90 steps', 'Waits for 90 seconds'], answer: 1 },
        { q: 'How many degrees do you turn at each corner of a square?', options: ['45', '60', '90', '120'], answer: 2 },
        { q: 'Which two blocks do you combine to draw a shape?', options: ['"say _" and "wait _"', '"move _ steps" and "turn _ degrees"', '"pen down" and "pen up"', '"repeat _" and "wait _"'], answer: 1 },
      ],
    },
    {
      title: 'Pick Up the Pen!',
      completed: false,
      xp: 60,
      content: {
        explanation: 'So far your sprite has been moving around but not leaving any marks. Now it is time to give your sprite a pen! The "pen down" block makes the sprite draw a line wherever it walks, like pressing a felt-tip pen onto paper. The "pen up" block lifts the pen off, so the sprite can move without drawing.\n\nImagine your sprite is a snail leaving a trail of slime behind it — when the pen is down, it leaves a colourful line as it walks. When the pen is up, it just moves without leaving a mark. You can switch between pen down and pen up as many times as you like to create dotted lines, separate shapes, or complex patterns.\n\nTo start drawing, just place "pen down" before your first "move _ steps" block. The pen will keep drawing until you add a "pen up" block. If you want to start fresh, click the stage area and look for the red stop button or a clear/erase option — this wipes the drawing clean for a new attempt.\n\nCombining pen, move, and turn blocks is the foundation of all computer art programs! Famous artists and mathematicians have used this method — called "turtle graphics" — to create stunning patterns since the 1960s. Today, you are joining that tradition!',
        example: '// Draw your first line!\nwhen 🚩 clicked\n  pen down\n  move 100 steps\n  pen up\n  move 50 steps\n  pen down\n  move 100 steps',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "pen down" — this starts drawing.\n3️⃣ Add "move _ steps" set to 150.\n4️⃣ Click the green flag. You should see a line appear on the stage!\n5️⃣ Now add "pen up" after the move block.\n6️⃣ Add "move _ steps" set to 50 (the sprite moves without drawing — a gap!).\n7️⃣ Add "pen down" then "move _ steps" set to 150 again.\n8️⃣ Click the flag — you should see two separate lines with a gap between them.\n\n🌟 Challenge: Create a dotted line! Use "pen down", "move 20 steps", "pen up", "move 20 steps" repeated several times. How many dots can you make before your sprite reaches the edge?',
        keyWords: ['pen down', 'pen up', 'draw', 'line', 'trail', 'turtle graphics', 'trace'],
      },
      quiz: [
        { q: 'What does "pen down" do?', options: ['Makes the sprite draw a line as it moves', 'Lifts the pen so the sprite can move without drawing', 'Changes the pen colour', 'Stops the program'], answer: 0 },
        { q: 'What does "pen up" do?', options: ['Starts drawing', 'Lifts the pen so no line is drawn when moving', 'Increases pen size', 'Turns the sprite upside down'], answer: 1 },
        { q: 'In what order should you put blocks to draw a line of 100 steps?', options: ['"move 100" then "pen down"', '"pen up" then "move 100"', '"pen down" then "move 100"', '"turn 90" then "pen down"'], answer: 2 },
        { q: 'How do you create a dotted line effect?', options: ['Use only "pen up"', 'Use "pen down" then "move" then "pen up" then "move" repeatedly', 'Use only "pen down"', 'Use "turn" blocks between moves'], answer: 1 },
      ],
    },
    {
      title: 'Repeat Block Magic',
      completed: false,
      xp: 70,
      content: {
        explanation: 'Have you ever had to write the same thing over and over? It is boring and takes ages! Programmers are clever — they use the "repeat _" block to run a set of blocks lots of times without having to type them out again and again. This is called a loop!\n\nThe "repeat _" block is shaped like a jaw or a C-shape — you drag other blocks inside it, and they will repeat however many times you choose. Think of it like a merry-go-round: it goes around and around the same instructions the number of times you set. When it has gone around enough times, it stops and the program carries on with whatever comes next.\n\nHere is the magical thing about repeat loops and drawing: to draw a square, you need to do "move 100, turn 90" exactly four times. Instead of writing those blocks four times, you can put them inside "repeat 4" and write them just once! It saves time and makes your code much neater.\n\nThe formula for drawing any square or rectangle shape is: put "move _ steps" and "turn ↻ 90 degrees" inside a "repeat 4" block. Each time around the loop, the sprite draws one side and turns one corner. After four times, it has completed the whole square and returned to where it started. Magic!',
        example: '// Draw a square using a repeat loop!\nwhen 🚩 clicked\n  pen down\n  repeat 4\n    move 100 steps\n    turn ↻ 90 degrees',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "pen down".\n3️⃣ Find the "repeat _" block — it has a curved jaw shape.\n4️⃣ Drag "repeat _" into the workspace and set the number to 4.\n5️⃣ Drag "move _ steps" (set to 100) inside the repeat block.\n6️⃣ Drag "turn ↻ _ degrees" (set to 90) inside the repeat block, below the move block.\n7️⃣ Click the green flag — watch a square appear!\n8️⃣ Now change the repeat number to 8 and the turn to 45. What shape do you get?\n\n🌟 Challenge: Change "repeat 4" to "repeat 6" and "turn 90" to "turn 60". What shape appears? Can you name it? (Hint: it has six sides!)',
        keyWords: ['repeat', 'loop', 'iteration', 'square', 'sides', 'efficient', 'pattern'],
      },
      quiz: [
        { q: 'What does the "repeat _" block do?', options: ['It runs the blocks inside it a set number of times', 'It moves the sprite repeatedly without any blocks', 'It repeats the last sound', 'It copies the sprite'], answer: 0 },
        { q: 'To draw a square, how many times should you repeat "move + turn 90°"?', options: ['2', '3', '4', '6'], answer: 2 },
        { q: 'What is a loop in coding?', options: ['A type of bug', 'A set of instructions that runs over and over', 'A way to draw a circle', 'A type of variable'], answer: 1 },
        { q: 'If "repeat 4" runs "move 50 steps" each time, how far does the sprite travel in total?', options: ['50 steps', '54 steps', '200 steps', '400 steps'], answer: 2 },
      ],
    },
    {
      title: 'Colourful Drawing',
      completed: false,
      xp: 60,
      content: {
        explanation: 'Black lines are fine, but colourful drawings are brilliant! The "set pen color to [colour]" block lets you choose any colour for your sprite\'s pen. You can pick from a colour palette — rainbow reds, electric blues, sunny yellows, lush greens, and everything in between. Changing the colour makes your drawings come alive!\n\nYou can change the pen colour at any point in your program — even in the middle of a drawing. If you change the colour before drawing each side of a shape, you can make each side a different colour! Imagine a square where each side is red, yellow, blue, and green — like a rainbow frame.\n\nThink of it like having a box of felt-tip pens. Normally you would have to swap pens by hand, but with code, you just add a "set pen color" block and the colour changes instantly. No mess, no lost lids!\n\nHere is a tip: always set your pen colour before you put the pen down, or you can change it while drawing — the colour changes straight away from that point onwards. Experiment with different colour combinations to find your favourite palette. There are no wrong answers in art!',
        example: '// Draw a colourful square!\nwhen 🚩 clicked\n  set pen color to [red]\n  pen down\n  move 100 steps\n  turn ↻ 90 degrees\n  set pen color to [blue]\n  move 100 steps\n  turn ↻ 90 degrees\n  set pen color to [green]\n  move 100 steps\n  turn ↻ 90 degrees\n  set pen color to [yellow]\n  move 100 steps\n  turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "set pen color to [red]".\n3️⃣ Add "pen down".\n4️⃣ Add "move _ steps" set to 100, then "turn ↻ _ degrees" set to 90.\n5️⃣ Add "set pen color to [blue]".\n6️⃣ Add "move _ steps" set to 100, then "turn ↻ _ degrees" set to 90.\n7️⃣ Repeat steps 5-6 with green and yellow to finish the square.\n8️⃣ Add "pen up" at the end.\n9️⃣ Click the flag and admire your rainbow square!\n\n🌟 Challenge: Draw two squares next to each other — one in warm colours (red, orange, yellow) and one in cool colours (blue, green, purple). Use "pen up" and "move _ steps" between the shapes to reposition without drawing a joining line.',
        keyWords: ['pen colour', 'colour', 'palette', 'rainbow', 'art', 'creative', 'design'],
      },
      quiz: [
        { q: 'What does "set pen color to [blue]" do?', options: ['Makes the sprite blue', 'Changes the pen colour to blue for future drawing', 'Fills the stage with blue', 'Changes the background'], answer: 1 },
        { q: 'When does the colour change take effect?', options: ['At the very end of the program', 'From that point onwards in the program', 'Only on the next shape', 'Never — you must restart'], answer: 1 },
        { q: 'If you want each side of a square to be a different colour, where do you place the "set pen color" blocks?', options: ['All at the start', 'All at the end', 'Before each "move _ steps" block', 'Inside the repeat block, after the move'], answer: 2 },
        { q: 'How many different colours can you use in one drawing?', options: ['Only one', 'Only two', 'Up to four', 'As many as you like'], answer: 3 },
      ],
    },
    {
      title: 'Thick and Thin Lines',
      completed: false,
      xp: 55,
      content: {
        explanation: 'Did you know your sprite\'s pen can draw thick chunky lines or thin delicate ones? The "set pen size to _" block controls how thick the pen line is. The number you choose sets the width of the line in pixels — 1 is a very thin hair-like line, while 20 gives you a thick felt-tip marker stroke, and 50 is like painting with a wide brush!\n\nPen size is perfect for adding depth and variety to your drawings. Think about how artists use different brush sizes — a fine detail brush for small features and a wide brush for large areas of colour. You are doing exactly the same thing with code!\n\nYou can change the pen size at any point, just like you change colour. Try drawing a shape with a thin outline first, then switching to a thick pen size for the next shape. The contrast between thin and thick lines creates a really professional artistic effect.\n\nHere is a fun trick: draw the same square twice — once with pen size 1 for a thin outline, and once with pen size 10 for a thick border. Place them in the same spot and they will look like a picture frame! Combining colour and pen size opens up a whole world of creative possibilities.',
        example: '// Draw shapes with different pen sizes\nwhen 🚩 clicked\n  set pen size to 1\n  set pen color to [blue]\n  pen down\n  repeat 4\n    move 80 steps\n    turn ↻ 90 degrees\n  pen up\n  set pen size to 8\n  set pen color to [red]\n  pen down\n  repeat 4\n    move 80 steps\n    turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "set pen size to _" and set it to 1.\n3️⃣ Add "set pen color to [black]" then "pen down".\n4️⃣ Add "repeat 4" with "move 100 steps" and "turn ↻ 90 degrees" inside.\n5️⃣ Add "pen up".\n6️⃣ Now change the pen size to 5 and try a new shape.\n7️⃣ Change it to 15 and draw another shape — notice how chunky it looks!\n8️⃣ Experiment by changing colour AND size at the same time for maximum effect.\n\n🌟 Challenge: Draw a house shape (a square with a triangle on top) where the walls are drawn with a thick red pen (size 8) and the roof with a thin blue pen (size 2). Remember: a triangle needs 3 sides with 120-degree turns!',
        keyWords: ['pen size', 'thick', 'thin', 'line width', 'pixels', 'brush', 'stroke'],
      },
      quiz: [
        { q: 'What does "set pen size to 10" do?', options: ['Sets the number of steps to 10', 'Makes the pen draw lines 10 pixels thick', 'Waits for 10 seconds', 'Turns the sprite 10 degrees'], answer: 1 },
        { q: 'Which pen size gives the thinnest line?', options: ['50', '20', '10', '1'], answer: 3 },
        { q: 'When should you set the pen size?', options: ['Only at the very start', 'Only at the very end', 'Before you want the size to change, at any point in the program', 'Only inside a repeat block'], answer: 2 },
        { q: 'You draw two squares in the same position — one with pen size 1 and one with pen size 15. What effect does this create?', options: ['They disappear', 'They look like a picture frame', 'Only the second one shows', 'The stage crashes'], answer: 1 },
      ],
    },
    {
      title: 'Jump to Any Spot',
      completed: false,
      xp: 60,
      content: {
        explanation: 'So far your sprite has been moving from wherever it happens to be. The "go to x: _ y: _" block lets you jump your sprite to any exact spot on the stage instantly! This is incredibly useful — you can place your sprite precisely where you want it before you start drawing, or teleport it to a new position between shapes.\n\nThe stage uses a coordinate system with two numbers: X and Y. Think of it like a treasure map. The X number tells you how far left or right to go — X=0 is the middle, positive X numbers go right, and negative X numbers go left. The Y number tells you how far up or down to go — Y=0 is the middle, positive Y goes up, and negative Y goes down. The very centre of the stage is X:0, Y:0.\n\nImagine the stage is a big grid like graph paper. The middle is (0, 0) — called the origin. Moving 100 units right gives you X:100. Moving 50 units down gives you Y:-50. So the position X:100, Y:-50 is 100 units right and 50 units below the centre.\n\nThis block is perfect for placing shapes in specific spots. Want a shape in the top-left corner? Use "go to x: -150, y: 100". Want one in the bottom-right? Try "go to x: 150, y: -100". With coordinates, you have total control over where everything appears!',
        example: '// Place shapes at exact positions\nwhen 🚩 clicked\n  go to x: 0 y: 0\n  pen down\n  repeat 4\n    move 80 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: -150 y: 80\n  pen down\n  repeat 4\n    move 50 steps\n    turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "go to x: 0 y: 0" to start in the centre.\n3️⃣ Add "pen down", then "repeat 4" with "move 80 steps" and "turn ↻ 90 degrees" inside.\n4️⃣ Add "pen up".\n5️⃣ Add "go to x: -150 y: 0" — this jumps left.\n6️⃣ Add "pen down", draw another square (repeat 4, move 80, turn 90), then "pen up".\n7️⃣ Add "go to x: 150 y: 0" — this jumps right.\n8️⃣ Draw a third square in the same way.\n9️⃣ Click the flag — you should have three squares in a row!\n\n🌟 Challenge: Place four squares in the four corners of the stage — top-left (x:-150, y:80), top-right (x:80, y:80), bottom-left (x:-150, y:-80), and bottom-right (x:80, y:-80). Make each a different colour!',
        keyWords: ['coordinates', 'x', 'y', 'position', 'stage', 'origin', 'teleport', 'go to'],
      },
      quiz: [
        { q: 'What does "go to x: 0 y: 0" do?', options: ['Moves the sprite 0 steps forward', 'Jumps the sprite to the exact centre of the stage', 'Stops the sprite', 'Clears the stage'], answer: 1 },
        { q: 'On the stage, what does a positive X value mean?', options: ['Move up', 'Move down', 'Move right', 'Move left'], answer: 2 },
        { q: 'Which coordinates place the sprite in the top-left area of the stage?', options: ['x:100 y:100', 'x:-100 y:100', 'x:100 y:-100', 'x:-100 y:-100'], answer: 1 },
        { q: 'Why is "go to x: _ y: _" useful when drawing multiple shapes?', options: ['It changes the pen colour', 'It lets you place each shape at a precise position', 'It makes shapes bigger', 'It adds a wait between shapes'], answer: 1 },
      ],
    },
    {
      title: 'Shapes Galore!',
      completed: false,
      xp: 65,
      content: {
        explanation: 'Here is a brilliant secret that mathematicians discovered: every regular shape (where all sides are equal) can be drawn using the same magic formula. The formula is: 360 divided by the number of sides equals the turning angle. So for a triangle (3 sides), you turn 120 degrees. For a square (4 sides), 90 degrees. A pentagon (5 sides)? 72 degrees. A hexagon (6 sides)? 60 degrees!\n\nThis works because the sprite always has to spin a total of 360 degrees to get back to its starting direction — one complete turn. If there are 4 corners, each corner is 360 ÷ 4 = 90 degrees. If there are 6 corners, each is 360 ÷ 6 = 60 degrees. The formula works for any number of sides!\n\nWith the "repeat _" block, you just set the repeat number to equal the number of sides, and put the calculated turn angle inside. The sprite will automatically trace out any polygon you choose. Try a 12-sided shape (dodecagon) — the turn angle is only 30 degrees, and it starts to look almost like a circle!\n\nCan you imagine the power this gives you? With one formula, you can draw any regular polygon in the world. Square, hexagon, octagon, star-polygon — just change two numbers. This is the real magic of mathematics and coding working together!',
        example: '// The magic formula: 360 ÷ sides = turn angle\n// Triangle: repeat 3, turn 120°\nwhen 🚩 clicked\n  pen down\n  repeat 3\n    move 100 steps\n    turn ↻ 120 degrees\n  pen up\n// Pentagon: repeat 5, turn 72°\n// Hexagon: repeat 6, turn 60°\n// Octagon: repeat 8, turn 45°',
        activity: '1️⃣ Start with "when 🚩 clicked" and "pen down".\n2️⃣ Add "repeat 3" with "move 100 steps" and "turn ↻ 120 degrees" inside. Click the flag — triangle!\n3️⃣ Change "repeat 3" to "repeat 5" and the turn to 72. Click — pentagon!\n4️⃣ Change to "repeat 6" and turn to 60. Click — hexagon!\n5️⃣ Try "repeat 8" and turn 45 — octagon!\n6️⃣ Try "repeat 12" and turn 30 — it looks almost circular!\n7️⃣ Each time, change the pen colour to see the different shapes clearly.\n\n🌟 Challenge: Can you draw a heptagon (7 sides)? Use the formula: 360 ÷ 7 = about 51.4 degrees. Try 51 or 52 degrees and see how close you get!',
        keyWords: ['polygon', 'formula', 'sides', 'angle', 'triangle', 'pentagon', 'hexagon', 'octagon', 'regular shape'],
      },
      quiz: [
        { q: 'What is the magic formula for drawing any regular polygon?', options: ['360 ÷ sides = turn angle', '180 ÷ sides = angle', '360 × sides = angle', 'sides × 90 = angle'], answer: 0 },
        { q: 'To draw a hexagon (6 sides), what turn angle should you use?', options: ['90 degrees', '72 degrees', '60 degrees', '45 degrees'], answer: 2 },
        { q: 'To draw a triangle using a repeat loop, how many times should it repeat?', options: ['2', '3', '4', '6'], answer: 1 },
        { q: 'As you increase the number of sides of a polygon, what does the shape start to resemble?', options: ['A star', 'A spiral', 'A circle', 'A cross'], answer: 2 },
      ],
    },
    {
      title: 'Project: My Block Masterpiece!',
      completed: false,
      xp: 150,
      content: {
        explanation: 'Congratulations — you have learned every block available in this course! Now it is time to bring them all together and create your very own masterpiece. This is your chance to be a real programmer AND an artist at the same time. There are no wrong answers here — only creative ones!\n\nFor your project, you are going to design and code an original scene or pattern using all the blocks you have learned: "when 🚩 clicked", "say _", "wait _ secs", "move _ steps", "turn ↻ / ↺ _ degrees", "pen down/up", "repeat _", "set pen color to", "set pen size to", and "go to x: _ y: _".\n\nBefore you start coding, take a moment to plan your masterpiece on paper. Sketch what you want to draw and think about: How many shapes? What colours? Where on the stage does each shape go? Will your sprite say anything? Programmers always plan before they code — this is called designing an algorithm.\n\nChallenge yourself to use at least six different block types in your project. Think about telling a story with your drawing — maybe a colourful house scene, a space pattern, an abstract geometric artwork, or a character made from shapes. The stage is your canvas, and the blocks are your brushes. Make it amazing!',
        example: '// Example scene: a simple house\nwhen 🚩 clicked\n  say "Building my house!"\n  wait 1 secs\n  go to x: -40 y: -50\n  set pen color to [red]\n  set pen size to 3\n  pen down\n  repeat 4\n    move 80 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: -40 y: 30\n  set pen color to [blue]\n  pen down\n  repeat 3\n    move 80 steps\n    turn ↻ 120 degrees\n  pen up\n  say "My house is finished! 🏠"',
        activity: '1️⃣ On paper, sketch your scene or pattern. Label each shape and choose your colours.\n2️⃣ Plan your block sequence — what does your sprite do first, second, third?\n3️⃣ Start coding with "when 🚩 clicked".\n4️⃣ Use "say _" to have your sprite introduce the project at the start.\n5️⃣ Use "go to x: _ y: _" to position each shape precisely.\n6️⃣ Use "pen down", shapes with "repeat", "move", and "turn", then "pen up" for each shape.\n7️⃣ Use at least three different pen colours and two different pen sizes.\n8️⃣ Add a "say _" at the end with your sprite proudly announcing "Masterpiece complete! 🎨".\n9️⃣ Click the green flag and enjoy your creation!\n\n🌟 Challenge: Add a "wait _ secs" between drawing each shape so the audience watches it build piece by piece — like a magic drawing show! Then share your project with a classmate and explain what each section of your code does.',
        keyWords: ['project', 'masterpiece', 'algorithm', 'plan', 'design', 'creative', 'scene', 'combine'],
      },
      quiz: [
        { q: 'What should you do BEFORE you start coding a project?', options: ['Press the green flag immediately', 'Plan and sketch your idea on paper first', 'Add as many blocks as possible', 'Ask the computer to decide'], answer: 1 },
        { q: 'Which block do you use to place your sprite at an exact position before drawing a shape?', options: ['"move _ steps"', '"pen down"', '"go to x: _ y: _"', '"repeat _"'], answer: 2 },
        { q: 'If you want the audience to watch your drawing appear slowly, which block helps?', options: ['"pen up"', '"set pen size to _"', '"wait _ secs" between shapes', '"turn ↻ _ degrees"'], answer: 2 },
        { q: 'Using all your blocks together in one project is called...', options: ['Debugging', 'A sequence', 'Combining — creating a complete program', 'Looping'], answer: 2 },
      ],
    },
  ],
},
{
  id: 'y3-sprite-school',
  title: 'Shape & Pattern Studio',
  description: 'Become a digital artist! Draw triangles, stars, spirals and rainbow patterns using the magic of loops, coordinates, and colour.',
  icon: '🎨',
  color: '#ec4899',
  yearGroup: 3,
  difficulty: 'Beginner',
  lessons: 10,
  duration: '5 hours',
  progress: 0,
  topics: ['Triangles', 'Polygon Formula', 'Stars', 'Rainbow Loops', 'Mandala Patterns', 'Coordinate Grids', 'Slow Drawing', 'Story Drawing', 'Shape Creatures', 'Creative Project'],
  modules: [
    {
      title: 'Triangle Time',
      completed: false,
      xp: 45,
      content: {
        explanation: 'Let\'s kick off this course by drawing the simplest polygon: the triangle! A triangle has three sides and three corners. At each corner, you need to turn 120 degrees. Why 120? Because of the magic formula: 360 ÷ 3 sides = 120 degrees per turn. The sprite needs to make a total rotation of 360 degrees to get back to its starting direction, and it does this in three equal turns.\n\nTo draw a triangle, you use the "repeat 3" block with "move _ steps" and "turn ↻ 120 degrees" inside it. Each time the loop runs, the sprite draws one side and turns one corner. After three times, it has completed the full triangle and faces the same direction it started!\n\nTriangles are everywhere in real life — roof shapes, slices of pizza, warning road signs, and mountain peaks. Engineers love triangles because they are the strongest shape — bridges and cranes are built with triangular supports. By learning to code a triangle, you are tapping into the same geometry that architects and engineers use every day.\n\nOnce you can draw a triangle, try making it bigger or smaller by changing the move steps. A triangle with 50-step sides is tiny, while 150-step sides is large. Experiment with different sizes and colours to create a family of triangles!',
        example: '// Draw a triangle\nwhen 🚩 clicked\n  pen down\n  repeat 3\n    move 100 steps\n    turn ↻ 120 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "pen down".\n3️⃣ Add "repeat 3".\n4️⃣ Inside the repeat, add "move _ steps" set to 100.\n5️⃣ Inside the repeat, add "turn ↻ _ degrees" set to 120.\n6️⃣ After the repeat block, add "pen up".\n7️⃣ Click the green flag — a triangle should appear!\n8️⃣ Try changing the move to 50 — smaller triangle. Try 150 — bigger triangle.\n9️⃣ Add "set pen color to [green]" and "set pen size to 4" before "pen down" to style it up.\n\n🌟 Challenge: Draw three triangles of different sizes (sides 40, 80, and 120 steps) each in a different colour. Use "go to x: _ y: _" and "pen up" to position them side by side.',
        keyWords: ['triangle', 'three sides', '120 degrees', 'polygon', 'repeat', 'geometry'],
      },
      quiz: [
        { q: 'How many degrees do you turn at each corner of a triangle?', options: ['90', '60', '120', '180'], answer: 2 },
        { q: 'How many times should the repeat block run when drawing a triangle?', options: ['2', '3', '4', '6'], answer: 1 },
        { q: 'Why is the turn angle for a triangle 120 degrees?', options: ['Because triangles are big', 'Because 360 ÷ 3 = 120', 'Because 3 × 3 = 9', 'Because the formula is 180 ÷ 3'], answer: 1 },
        { q: 'If you change "move 100 steps" to "move 50 steps" in a triangle, what happens?', options: ['The sprite draws faster', 'The triangle becomes smaller', 'The triangle gains more sides', 'Nothing changes'], answer: 1 },
      ],
    },
    {
      title: 'The Magic Formula',
      completed: false,
      xp: 50,
      content: {
        explanation: 'Last lesson you learned the triangle. Now let\'s explore the full power of the magic formula: 360 ÷ number of sides = turning angle. This formula unlocks every regular polygon — a shape where all sides are equal length and all angles are equal. Square, pentagon, hexagon, heptagon, octagon — they are all just one formula away!\n\nHere is how to use it step by step. Choose how many sides you want. Divide 360 by that number to get the turn angle. Set your "repeat _" to the number of sides. Set "turn ↻ _ degrees" to the answer from your division. And that\'s it — your sprite will draw that polygon perfectly!\n\nThe more sides a polygon has, the smaller the turn angle gets, and the more it starts to look like a circle. A 12-sided shape (dodecagon) uses 30-degree turns and looks almost round. A 36-sided shape with 10-degree turns looks almost exactly like a circle! This is actually how computers draw circles — they use lots and lots of tiny straight lines.\n\nHere are the most useful polygons and their angles: Triangle (3 sides, 120°), Square (4 sides, 90°), Pentagon (5 sides, 72°), Hexagon (6 sides, 60°), Octagon (8 sides, 45°), Decagon (10 sides, 36°). Print this list in your head — it will help you every time you want to draw a new shape!',
        example: '// Using the formula for different polygons\nwhen 🚩 clicked\n  set pen color to [purple]\n  pen down\n  repeat 5\n    move 80 steps\n    turn ↻ 72 degrees\n  pen up\n  go to x: 100 y: 0\n  set pen color to [orange]\n  pen down\n  repeat 8\n    move 50 steps\n    turn ↻ 45 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "pen down" and use the formula to draw a PENTAGON: repeat 5, move 80, turn 72.\n3️⃣ Add "pen up" then "go to x: -150 y: 0".\n4️⃣ Change the colour and draw a HEXAGON: repeat 6, move 70, turn 60.\n5️⃣ Add "pen up" then "go to x: 0 y: -80".\n6️⃣ Change the colour and draw an OCTAGON: repeat 8, move 50, turn 45.\n7️⃣ Click the flag — three different polygons!\n8️⃣ Label each one by adding "say _" blocks before drawing each shape.\n\n🌟 Challenge: Can you draw a decagon (10 sides)? Use the formula to work out the angle (360 ÷ 10 = 36 degrees). Use "repeat 10" and "turn ↻ 36 degrees" with "move 40 steps". What does it look like?',
        keyWords: ['formula', '360 divided by sides', 'polygon', 'pentagon', 'hexagon', 'octagon', 'regular shape'],
      },
      quiz: [
        { q: 'What is the magic formula for any regular polygon?', options: ['sides × 90 = angle', '180 ÷ sides = angle', '360 ÷ sides = turn angle', 'sides + 360 = angle'], answer: 2 },
        { q: 'What turn angle do you need for a pentagon (5 sides)?', options: ['90°', '72°', '60°', '45°'], answer: 1 },
        { q: 'As the number of sides increases, what does the polygon start to look like?', options: ['A star', 'A spiral', 'A circle', 'A triangle'], answer: 2 },
        { q: 'A decagon has 10 sides. What is the turn angle?', options: ['45°', '30°', '36°', '40°'], answer: 2 },
      ],
    },
    {
      title: 'Stars and Starbursts!',
      completed: false,
      xp: 55,
      content: {
        explanation: 'Stars are one of the most exciting shapes to draw with code, and the secret to a five-point star is a special turn angle: 144 degrees! Unlike regular polygons, a star skips over corners, so the angle is larger than you might expect. The formula for a star is 360 × 2 ÷ 5 = 144 degrees (because you skip every other point).\n\nTo draw a five-point star, use "repeat 5" with "move 100 steps" and "turn ↻ 144 degrees" inside. The sprite draws five long lines, turning sharply at each point, and the lines cross over each other to create the star shape. Watch carefully as each line appears — it is like drawing without lifting your pencil!\n\nIf you want a bigger or smaller star, just change the number of steps. More steps = bigger star. You can also make a six-point star by using "repeat 6" and "turn ↻ 60 degrees" — but that creates a Star of David made from two overlapping triangles, which looks different from a five-point star. Try both!\n\nStars with more points look different too. A seven-point star uses "repeat 7" with a carefully calculated angle. The world of star polygons is huge — mathematicians call them "stellated polygons" and study them extensively. You are touching on real mathematical art today!',
        example: '// Draw a five-point star\nwhen 🚩 clicked\n  set pen color to [yellow]\n  set pen size to 3\n  pen down\n  repeat 5\n    move 120 steps\n    turn ↻ 144 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "set pen color to [yellow]" and "set pen size to 3".\n3️⃣ Add "pen down".\n4️⃣ Add "repeat 5".\n5️⃣ Inside, add "move _ steps" set to 120.\n6️⃣ Inside, add "turn ↻ _ degrees" set to 144.\n7️⃣ Add "pen up" after the repeat.\n8️⃣ Click the flag — a star appears! ⭐\n9️⃣ Try changing the move steps to make it bigger or smaller.\n\n🌟 Challenge: Make a "night sky" — use "pen up" and "go to x: _ y: _" to place three stars of different sizes in different positions on the stage. Use white or yellow pen colour and a pen size of 2 for a delicate starry effect!',
        keyWords: ['star', 'five points', '144 degrees', 'star polygon', 'stellated', 'starburst', 'skip'],
      },
      quiz: [
        { q: 'What turn angle creates a five-point star?', options: ['72°', '108°', '144°', '120°'], answer: 2 },
        { q: 'How many times should you repeat to draw a five-point star?', options: ['3', '4', '5', '10'], answer: 2 },
        { q: 'What happens to the star if you increase the "move _ steps" value?', options: ['It gets more points', 'It gets bigger', 'It gets smaller', 'It changes colour'], answer: 1 },
        { q: 'How is a star different from a regular polygon when it comes to the turn angle?', options: ['Star angles are smaller', 'Star angles are the same', 'Star angles are larger because they skip corners', 'Stars don\'t need turn blocks'], answer: 2 },
      ],
    },
    {
      title: 'Rainbow Loops',
      completed: false,
      xp: 60,
      content: {
        explanation: 'What if you could change the pen colour automatically on every side of a shape? By placing "set pen color to" blocks inside your "repeat" loop, you can give each side of a shape its own colour! Imagine a hexagon where every single side glows in a different rainbow colour — red, orange, yellow, green, blue, and purple.\n\nTo do this, you need to plan carefully. A hexagon has six sides, so inside your "repeat 6" block, you will place six "set pen color" blocks — one before each "move _ steps" block. When the loop runs, the first iteration sets red and draws a side, the second sets orange and draws a side, and so on through all six colours.\n\nWait — but if the blocks inside the repeat run the same each time, how do you get different colours? The trick is that you use multiple "set pen color" blocks one after another inside the loop, but since a repeat loop runs everything inside it on each pass, you need to structure it carefully. The best approach for Year 3 is: set colour, move, turn — and use six separate repeat blocks each with a single colour for clarity, OR use one repeat block and change pen colour smartly.\n\nActually, the most reliable rainbow loop approach for this block set is: draw each side manually (6 blocks of set colour, move, turn) without a loop first, then wrap it all in "repeat 1" for tidiness. But an even better technique is six separate colour-move-turn sequences, which gives you full colour control. Let\'s try that approach today!',
        example: '// Rainbow hexagon - each side a different colour\nwhen 🚩 clicked\n  pen down\n  set pen color to [red]\n  move 80 steps\n  turn ↻ 60 degrees\n  set pen color to [orange]\n  move 80 steps\n  turn ↻ 60 degrees\n  set pen color to [yellow]\n  move 80 steps\n  turn ↻ 60 degrees\n  set pen color to [green]\n  move 80 steps\n  turn ↻ 60 degrees\n  set pen color to [blue]\n  move 80 steps\n  turn ↻ 60 degrees\n  set pen color to [purple]\n  move 80 steps\n  turn ↻ 60 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked" and "pen down".\n2️⃣ Add "set pen color to [red]", then "move _ steps" (80), then "turn ↻ _ degrees" (60).\n3️⃣ Repeat for orange, yellow, green, blue, and purple — six sets in total.\n4️⃣ Add "pen up" at the end.\n5️⃣ Click the flag and see your rainbow hexagon!\n6️⃣ Try changing all the move values to 100 for a bigger hexagon.\n7️⃣ Change the pen size to 5 for chunkier rainbow lines.\n\n🌟 Challenge: Draw a rainbow triangle! Use three colours (red, yellow, blue) with 120-degree turns and "move 100 steps" for each side. Then draw a rainbow square below it using four colours and 90-degree turns.',
        keyWords: ['rainbow', 'colour change', 'hexagon', 'sides', 'sequence', 'colour loop', 'pen colour'],
      },
      quiz: [
        { q: 'How do you give each side of a hexagon a different colour?', options: ['Use one "set pen color" at the start', 'Place a "set pen color" block before each "move _ steps"', 'Use a wait block between colours', 'Change the background colour'], answer: 1 },
        { q: 'A hexagon has how many sides?', options: ['4', '5', '6', '8'], answer: 2 },
        { q: 'What turn angle is needed for each corner of a hexagon?', options: ['90°', '72°', '60°', '45°'], answer: 2 },
        { q: 'Why does placing "set pen color" inside a drawing sequence change each side\'s colour?', options: ['Because the stage resets each time', 'Because the colour block runs before the next move, changing the pen for that side', 'Because colours loop automatically', 'Because pen up resets colour'], answer: 1 },
      ],
    },
    {
      title: 'Spinning Pattern Magic',
      completed: false,
      xp: 70,
      content: {
        explanation: 'Now for some real magic — nested loops! A nested loop is a "repeat" block inside another "repeat" block. It sounds complicated, but think of it like a clock: the outer loop is like the hour hand (goes around slowly), and the inner loop is like the minute hand (goes around quickly every time the hour hand moves one position).\n\nHere is the plan for a spinning mandala pattern: the outer loop repeats 12 times. Each time it runs, the inner loop draws a small triangle (repeat 3, move 60, turn 120). After drawing the triangle, the sprite turns 30 degrees (360 ÷ 12 = 30) to face a new direction. The outer loop then runs again, drawing another triangle at the new angle. After 12 triangles, each rotated 30 degrees from the last, you get a stunning mandala-like star pattern!\n\nThe outer repeat controls how many times the whole inner shape is drawn and rotated. The inner repeat draws one complete shape. This two-level loop structure is one of the most powerful tools in creative coding — professional generative artists use exactly this technique to create beautiful mathematical art.\n\nThink of it like a flower: the inner loop draws one petal, and the outer loop places petals evenly all the way around in a circle. With just two repeat blocks and a few move and turn blocks, you can create artwork that would take hours to draw by hand!',
        example: '// Spinning mandala: 12 triangles, each rotated 30°\nwhen 🚩 clicked\n  pen down\n  set pen color to [blue]\n  repeat 12\n    repeat 3\n      move 60 steps\n      turn ↻ 120 degrees\n    turn ↻ 30 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "set pen color to [blue]" and "set pen size to 2".\n3️⃣ Add "pen down".\n4️⃣ Add an outer "repeat _" block set to 12.\n5️⃣ Inside the outer repeat, add an inner "repeat _" block set to 3 (for a triangle).\n6️⃣ Inside the inner repeat, add "move 60 steps" and "turn ↻ 120 degrees".\n7️⃣ Outside the inner repeat (but still inside the outer repeat), add "turn ↻ 30 degrees".\n8️⃣ After the outer repeat, add "pen up".\n9️⃣ Click the flag and watch the mandala build! ✨\n\n🌟 Challenge: Change the inner shape from a triangle (repeat 3, turn 120) to a square (repeat 4, turn 90). Then change the outer repeat to 8 and the outer turn to 45 (360 ÷ 8 = 45). What new pattern appears?',
        keyWords: ['nested loop', 'mandala', 'rotation', 'outer loop', 'inner loop', 'pattern', 'symmetry'],
      },
      quiz: [
        { q: 'What is a nested loop?', options: ['A loop that stops early', 'A repeat block placed inside another repeat block', 'A loop that goes backwards', 'Two loops running at the same time'], answer: 1 },
        { q: 'In the mandala pattern, what does the inner "repeat 3" loop draw?', options: ['A square', 'A triangle', 'A hexagon', 'A star'], answer: 1 },
        { q: 'Why is the outer turn angle 30 degrees in the example?', options: ['Because 30 is a small number', 'Because 360 ÷ 12 = 30, spacing the shapes evenly around a circle', 'Because triangles need 30-degree turns', 'Because the pen size is 30'], answer: 1 },
        { q: 'If you change the outer repeat from 12 to 6, how many triangles will appear in the pattern?', options: ['12', '3', '6', '18'], answer: 2 },
      ],
    },
    {
      title: 'Shape Grid',
      completed: false,
      xp: 65,
      content: {
        explanation: 'In this lesson, you will use the "go to x: _ y: _" block to place shapes in a precise grid layout — like organising items on a shelf or arranging pictures on a wall. A grid is a set of rows and columns, like the squares on a chessboard. By choosing specific X and Y coordinates, you can place each shape exactly where you want it.\n\nThe stage coordinates go from roughly -200 to 200 horizontally (X) and -150 to 150 vertically (Y). To make a 2×3 grid of shapes, you might use X values of -120, 0, and 120 (three columns) and Y values of 60 and -60 (two rows). That gives you six evenly spaced positions!\n\nThe workflow for each shape is: "pen up" to make sure you are not drawing a line as you travel, "go to x: _ y: _" to jump to position, then "pen down", draw your shape, then "pen up" again. Repeat this for each position in the grid.\n\nGrid layouts are used everywhere in real life — photo galleries, app icons on your phone, tiles on a floor, seats in a cinema. When designers lay out a website or app, they use a grid system just like the one you are making today. By learning grid layouts in code, you are thinking like a professional designer!',
        example: '// 2x3 grid of shapes at different positions\nwhen 🚩 clicked\n  pen up\n  go to x: -120 y: 60\n  set pen color to [red]\n  pen down\n  repeat 4\n    move 50 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 0 y: 60\n  set pen color to [blue]\n  pen down\n  repeat 4\n    move 50 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 120 y: 60\n  set pen color to [green]\n  pen down\n  repeat 4\n    move 50 steps\n    turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ For position 1 (top-left): "pen up", "go to x:-120 y:60", set a colour, "pen down", draw a square (repeat 4, move 50, turn 90), "pen up".\n3️⃣ For position 2 (top-middle): "go to x:0 y:60", change colour, draw a triangle (repeat 3, move 50, turn 120), "pen up".\n4️⃣ For position 3 (top-right): "go to x:120 y:60", change colour, draw a pentagon (repeat 5, move 40, turn 72), "pen up".\n5️⃣ For position 4 (bottom-left): "go to x:-120 y:-60", different colour, draw a hexagon (repeat 6, move 40, turn 60), "pen up".\n6️⃣ For position 5 (bottom-middle): "go to x:0 y:-60", draw a star (repeat 5, move 50, turn 144), "pen up".\n7️⃣ For position 6 (bottom-right): "go to x:120 y:-60", draw an octagon (repeat 8, move 35, turn 45), "pen up".\n\n🌟 Challenge: Add "say _" before drawing each shape so your sprite announces it: "Drawing a square!", "Drawing a triangle!" etc. Add "wait 0.5 secs" after each say block.',
        keyWords: ['grid', 'coordinates', 'x position', 'y position', 'layout', 'rows', 'columns', 'position'],
      },
      quiz: [
        { q: 'What is the best way to move the sprite to a new position without drawing a line?', options: ['"pen down" then "go to x y"', '"pen up" then "go to x y"', '"move _ steps" to reposition', '"turn ↻ 180" to reverse'], answer: 1 },
        { q: 'What coordinates place the sprite at the exact centre of the stage?', options: ['x:100 y:100', 'x:-100 y:100', 'x:0 y:0', 'x:200 y:200'], answer: 2 },
        { q: 'To place shapes in 3 columns, what should the X values be?', options: ['All the same', 'All 0', 'Three different X values spaced apart', 'Random values'], answer: 2 },
        { q: 'What real-life example uses a grid layout similar to what we coded?', options: ['A clock face', 'App icons on a phone screen', 'A traffic light', 'A snowflake'], answer: 1 },
      ],
    },
    {
      title: 'Slow and Steady',
      completed: false,
      xp: 55,
      content: {
        explanation: 'When your program runs at full speed, shapes appear almost instantly — blink and you miss it! Adding "wait _ secs" blocks between drawing steps lets the audience watch the picture build up slowly, step by step. This transforms a boring instant reveal into a dramatic performance!\n\nThink of it like watching a skilled street artist at work. They do not produce a painting instantly — you watch each brushstroke appear, slowly revealing the final image. Adding wait blocks gives your coding art that same magical "reveal" quality.\n\nYou can add waits at different points: between individual "move _ steps" blocks (to see each line appear slowly), between sides of a shape (to watch the shape grow corner by corner), or between separate shapes (to create a big dramatic pause before the next element appears).\n\nSmaller wait values like 0.3 or 0.5 seconds create a gentle animation — fast enough to not be boring, slow enough to appreciate. Larger waits like 1 or 2 seconds create a slow, theatrical build-up. You choose the pace of your own art show! Combining "wait _ secs" with "say _" lets your sprite provide live commentary while the drawing unfolds.',
        example: '// Watch a square build slowly\nwhen 🚩 clicked\n  say "Watch me draw..."\n  wait 1 secs\n  pen down\n  move 100 steps\n  wait 0.5 secs\n  turn ↻ 90 degrees\n  move 100 steps\n  wait 0.5 secs\n  turn ↻ 90 degrees\n  move 100 steps\n  wait 0.5 secs\n  turn ↻ 90 degrees\n  move 100 steps\n  pen up\n  say "Square complete! ✅"',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "say _": "I\'m going to draw a triangle slowly..."\n3️⃣ Add "wait _ secs" set to 1.\n4️⃣ Add "pen down" and "set pen color to [purple]".\n5️⃣ Add "move 100 steps", then "wait 0.5 secs".\n6️⃣ Add "turn ↻ 120 degrees".\n7️⃣ Repeat the move + wait + turn sequence two more times (for the other two sides).\n8️⃣ Add "pen up".\n9️⃣ Add "say _": "Ta-da! A triangle! 🔺"\n\n🌟 Challenge: Draw a hexagon slowly, with a 0.3-second wait between each side. At the halfway point (after 3 sides), have your sprite say "Half a hexagon so far!" then continue to completion.',
        keyWords: ['wait', 'slow motion', 'animation', 'reveal', 'dramatic', 'pause', 'timing'],
      },
      quiz: [
        { q: 'What effect does adding "wait 0.5 secs" between move blocks create?', options: ['It makes the shapes bigger', 'It shows the drawing building up slowly', 'It changes the pen colour', 'It stops the program halfway'], answer: 1 },
        { q: 'Which wait value creates a faster, gentler animation?', options: ['5 secs', '3 secs', '0.3 secs', '10 secs'], answer: 2 },
        { q: 'Where should you place "wait" blocks to see each side of a shape appear one at a time?', options: ['Before "pen down"', 'After each "move _ steps" block', 'Only at the end', 'Before "when 🚩 clicked"'], answer: 1 },
        { q: 'Combining "say _" and "wait _" while drawing lets your sprite do what?', options: ['Draw faster', 'Provide live commentary while the drawing builds', 'Change the background colour', 'Copy the drawing twice'], answer: 1 },
      ],
    },
    {
      title: 'Story While You Draw',
      completed: false,
      xp: 60,
      content: {
        explanation: 'Now you are going to combine everything — drawing, talking, and timing — into a rich storytelling experience! Your sprite will narrate what it is drawing as it draws it, creating a live commentary show. The audience watches the stage while reading speech bubbles, just like a presenter on a cooking show describing each step.\n\nThe key technique is interleaving "say _" and "wait _" blocks between drawing sections. Before you start drawing a shape, your sprite announces it: "I\'m going to draw a big red square!" Then it draws the square. When done, it says: "There\'s the square! Now for a triangle!" And so on.\n\nThis technique is used in real educational software and animated tutorials — you are creating something similar to Khan Academy or BBC Bitesize, but totally made by you! The combination of visual output (the drawing) and verbal output (the speech bubbles) makes the experience much more engaging and easier to follow.\n\nThink carefully about the pacing. The speech bubble should appear long enough for the audience to read it. Use "wait 2 secs" after each "say _" block so people have time to read. The drawing itself can happen at whatever speed feels right — use shorter waits between drawing blocks and longer waits between speech sections.',
        example: '// Narrated drawing performance\nwhen 🚩 clicked\n  say "Hello! Today I\'ll draw two shapes!"\n  wait 2 secs\n  say "First, a red square!"\n  wait 1 secs\n  go to x: -60 y: 20\n  set pen color to [red]\n  pen down\n  repeat 4\n    move 80 steps\n    turn ↻ 90 degrees\n  pen up\n  say "There\'s the square! Now a blue triangle!"\n  wait 2 secs\n  go to x: 60 y: 20\n  set pen color to [blue]\n  pen down\n  repeat 3\n    move 80 steps\n    turn ↻ 120 degrees\n  pen up\n  say "Show complete! 🎉"',
        activity: '1️⃣ Plan your show on paper: two or three shapes, a colour for each, and a sentence for your sprite to say for each one.\n2️⃣ Start with "when 🚩 clicked".\n3️⃣ Add "say _": "Welcome to my drawing show!"\n4️⃣ Add "wait 2 secs".\n5️⃣ Announce shape 1 with "say _", wait 1 sec, then draw it.\n6️⃣ After drawing, add a "say _" comment about the finished shape, then "wait 2 secs".\n7️⃣ Announce shape 2, wait, then draw it.\n8️⃣ End with an enthusiastic "say _": "That\'s all folks! Thanks for watching! 👏"\n\n🌟 Challenge: Add a third shape and make the narration rhyme! For example: "Here comes a circle... well, almost round! The prettiest shape that was ever found!"',
        keyWords: ['narration', 'story', 'commentary', 'say', 'wait', 'timing', 'performance', 'interleave'],
      },
      quiz: [
        { q: 'What technique combines drawing, speaking, and timing?', options: ['Looping', 'Debugging', 'Narrated drawing — interleaving say, wait, and draw blocks', 'Coordinate mapping'], answer: 2 },
        { q: 'Why should you add "wait 2 secs" after a "say _" block in a narrated show?', options: ['To make the program slower', 'To give the audience time to read the speech bubble', 'To change the pen colour', 'To reset the stage'], answer: 1 },
        { q: 'What is the correct order for a narrated shape?', options: ['"say" → draw → "wait"', '"say" → "wait" → draw', 'Draw → "say" → "wait"', '"wait" → draw → "say"'], answer: 1 },
        { q: 'Narrated drawing is similar to which type of real-world content?', options: ['Silent movies', 'Educational tutorial videos', 'Board games', 'Printed books'], answer: 1 },
      ],
    },
    {
      title: 'Creature from Shapes',
      completed: false,
      xp: 65,
      content: {
        explanation: 'Did you know you can build a character entirely from geometric shapes? A face can be made from a large circle (the head), two small squares (the eyes), a triangle (the nose), and a wide rectangle (the smile). By positioning shapes carefully using "go to x: _ y: _", you can assemble them into any creature you imagine!\n\nThe trick is planning your creature on paper first. Sketch it out and decide: where is the head? What shape are the eyes? Is the body a circle or a square? Then work out the approximate coordinates for each part. The head might be centred at X:0, Y:20. The left eye at X:-30, Y:40. The right eye at X:30, Y:40. The nose at X:0, Y:20. And the mouth as a wide shape at X:-30, Y:-10.\n\nFor shapes that look like circles (like a head or round eyes), remember the trick from the formula lesson — use "repeat 36" with "move 5 steps" and "turn ↻ 10 degrees". This draws a 36-sided polygon that looks beautifully circular! The total distance is 36 × 5 = 180 steps around the perimeter.\n\nThis kind of shape-assembly art is the basis of all cartoon and graphic design work. Professional illustrators in games, animation, and apps use simple geometric shapes layered together to build complex characters. By the end of this lesson, you will have created your very own block-coded creature!',
        example: '// A simple face from shapes\nwhen 🚩 clicked\n  go to x: 0 y: 0\n  set pen color to [orange]\n  set pen size to 2\n  pen down\n  repeat 36\n    move 5 steps\n    turn ↻ 10 degrees\n  pen up\n  go to x: -25 y: 20\n  set pen color to [black]\n  pen down\n  repeat 4\n    move 15 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 25 y: 20\n  pen down\n  repeat 4\n    move 15 steps\n    turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Sketch your creature on paper first. Decide on 4-5 body parts and their shapes.\n2️⃣ Start with "when 🚩 clicked".\n3️⃣ Draw the head: use "go to x:0 y:0", then a circle shape (repeat 36, move 5, turn 10).\n4️⃣ Draw the left eye: "pen up", "go to x:-25 y:20", "pen down", small square (repeat 4, move 12, turn 90), "pen up".\n5️⃣ Draw the right eye similarly at x:25 y:20.\n6️⃣ Draw the nose: "go to x:0 y:0", small triangle (repeat 3, move 15, turn 120).\n7️⃣ Add a mouth, ears, or any other features!\n8️⃣ Have your sprite "say" the creature\'s name at the start.\n\n🌟 Challenge: Give your creature a body! Draw a square or rectangle below the head for a torso, and two small rectangles for arms. Position them using coordinates so they line up with the head.',
        keyWords: ['creature', 'shapes', 'face', 'assembly', 'coordinates', 'design', 'character', 'layers'],
      },
      quiz: [
        { q: 'What is the best first step before coding a creature from shapes?', options: ['Click the green flag immediately', 'Sketch the creature and plan coordinates on paper', 'Add as many blocks as possible', 'Start with the smallest shape first'], answer: 1 },
        { q: 'Which block series draws a shape that looks like a circle?', options: ['"repeat 4" with "move 50" and "turn 90"', '"repeat 36" with "move 5" and "turn 10"', '"repeat 3" with "move 100" and "turn 120"', '"repeat 5" with "move 80" and "turn 144"'], answer: 1 },
        { q: 'How do you move to a new position to draw the next body part without drawing a connecting line?', options: ['"pen down" then move', '"pen up" then "go to x: _ y: _"', '"turn 180" then move', '"wait 1 secs" then move'], answer: 1 },
        { q: 'What real-world profession uses geometric shapes layered together to build characters?', options: ['Plumbing', 'Graphic design and animation', 'Architecture only', 'Music production'], answer: 1 },
      ],
    },
    {
      title: 'Project: Pattern Gallery',
      completed: false,
      xp: 150,
      content: {
        explanation: 'This is your showcase project — creating a Pattern Gallery! You will divide the stage into four quadrants (like a window with four panes of glass) and fill each one with a completely different pattern. This tests everything you have learned: shapes, colours, pen sizes, coordinates, loops, nested loops, stars, and narration.\n\nThe four quadrants of the stage are: top-left (X:-100 to 0, Y:0 to 100), top-right (X:0 to 100, Y:0 to 100), bottom-left (X:-100 to 0, Y:-100 to 0), and bottom-right (X:0 to 100, Y:-100 to 0). Each quadrant will hold one special pattern from your creative toolkit.\n\nFor each quadrant, choose something different: perhaps a spinning mandala in the top-left, a rainbow hexagon in the top-right, a star cluster in the bottom-left, and a creature face in the bottom-right. Use different colour schemes and pen sizes for each quadrant to make them visually distinct.\n\nBefore you code, plan your four patterns on paper. Think about what starting coordinates suit each quadrant, and make sure your shapes are small enough to fit within their section without overlapping. This is professional thinking — graphic designers always plan layouts before they create them. Your finished gallery will be something to be really proud of!',
        example: '// Pattern Gallery - four quadrants\nwhen 🚩 clicked\n  say "Welcome to my Pattern Gallery!"\n  wait 2 secs\n  // Quadrant 1: top-left mandala\n  go to x: -80 y: 60\n  set pen color to [blue]\n  pen down\n  repeat 6\n    repeat 3\n      move 40 steps\n      turn ↻ 120 degrees\n    turn ↻ 60 degrees\n  pen up\n  // Quadrant 2: top-right star\n  go to x: 60 y: 60\n  set pen color to [yellow]\n  pen down\n  repeat 5\n    move 60 steps\n    turn ↻ 144 degrees\n  pen up\n  say "Gallery complete! 🖼️"',
        activity: '1️⃣ Plan on paper: write down what pattern goes in each of the four quadrants and what colours you will use.\n2️⃣ Start with "when 🚩 clicked" and an intro "say _": "My Pattern Gallery!"\n3️⃣ For each quadrant, use "pen up" and "go to x: _ y: _" to position before drawing.\n4️⃣ Quadrant 1 (top-left, near x:-100 y:70): draw a spinning mandala (nested repeat).\n5️⃣ Quadrant 2 (top-right, near x:60 y:70): draw a rainbow shape or star.\n6️⃣ Quadrant 3 (bottom-left, near x:-100 y:-50): draw a polygon grid or creature.\n7️⃣ Quadrant 4 (bottom-right, near x:60 y:-50): draw your most creative pattern.\n8️⃣ Use at least three different pen colours and two different pen sizes across the gallery.\n9️⃣ End with "say _": "Which pattern is your favourite? 🎨"\n\n🌟 Challenge: Add "say _" + "wait _" commentary before each quadrant so your sprite acts as a tour guide: "And here in the bottom right, I\'ve created a spinning star mandala!" Make it as theatrical as possible!',
        keyWords: ['gallery', 'quadrant', 'layout', 'variety', 'showcase', 'project', 'design', 'creative'],
      },
      quiz: [
        { q: 'The stage is divided into four quadrants. What is in the top-left quadrant?', options: ['Positive X and positive Y values', 'Negative X and positive Y values', 'Negative X and negative Y values', 'Positive X and negative Y values'], answer: 1 },
        { q: 'What is the first thing you should do before coding your gallery project?', options: ['Immediately click the green flag', 'Plan the four patterns on paper first', 'Use only one colour for simplicity', 'Write the code without planning'], answer: 1 },
        { q: 'What block do you use to move between quadrants without drawing a connecting line?', options: ['"pen down" then move', '"move _ steps" directly', '"pen up" then "go to x: _ y: _"', '"wait _ secs" then move'], answer: 2 },
        { q: 'Why use different colours and pen sizes in each quadrant?', options: ['To use up more blocks', 'To make each pattern visually distinct and interesting', 'Because it is required by the rules', 'To make the program run faster'], answer: 1 },
      ],
    },
  ],
},
{
  id: 'y3-patterns',
  title: 'Creative Patterns',
  description: 'Take your art to the next level! Discover layered shapes, concentric rings, overlapping designs, and learn to debug code like a professional.',
  icon: '✨',
  color: '#10b981',
  yearGroup: 3,
  difficulty: 'Intermediate',
  lessons: 8,
  duration: '4 hours',
  progress: 0,
  topics: ['Layered Shapes', 'Colour Sequences', 'Overlapping', 'Concentric Rings', 'Geometric Art', 'Growing Shapes', 'Debugging', 'Creative Project'],
  modules: [
    {
      title: 'Layered Shapes',
      completed: false,
      xp: 50,
      content: {
        explanation: 'What happens when you draw the same shape multiple times, each slightly bigger than the last, all centred in the same spot? You get a beautiful layered effect — like the rings of a tree trunk, or the layers of an onion, or a target on a dartboard! This technique is called concentric shapes (meaning they share the same centre point).\n\nThe trick is to always start each shape from the same centre position using "go to x: 0 y: 0". Then draw the shape, come back to the centre, and draw a slightly larger version. To draw a larger version, simply increase the "move _ steps" value — a square with sides of 40 is small, 80 is medium, and 120 is large, but they all look centred if you start each from the same point.\n\nYou can also combine different pen sizes for visual impact. Use a thick pen (size 8) for the outermost shape and a thin pen (size 1) for the innermost, creating a sense of depth. Or reverse it — thick in the centre, thin on the outside. There is no right or wrong answer in art!\n\nFor different shape types — like squares — note that "go to x: 0 y: 0" places the starting corner at the origin, so shapes of different sizes will share a bottom-left corner rather than a true centre. For perfectly centred squares, you would need to offset the starting position based on size. For this lesson, starting from the same point still creates a very satisfying layered look!',
        example: '// Three layered squares, same starting point\nwhen 🚩 clicked\n  go to x: -60 y: -60\n  set pen color to [red]\n  set pen size to 4\n  pen down\n  repeat 4\n    move 120 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: -40 y: -40\n  set pen color to [orange]\n  set pen size to 3\n  pen down\n  repeat 4\n    move 80 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: -20 y: -20\n  set pen color to [yellow]\n  set pen size to 2\n  pen down\n  repeat 4\n    move 40 steps\n    turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Draw the LARGEST square first: "go to x:-60 y:-60", "set pen color to [blue]", "set pen size to 5", "pen down", repeat 4 (move 120, turn 90), "pen up".\n3️⃣ Draw the MEDIUM square: "go to x:-40 y:-40", purple, size 3, repeat 4 (move 80, turn 90), "pen up".\n4️⃣ Draw the SMALLEST square: "go to x:-20 y:-20", pink, size 1, repeat 4 (move 40, turn 90), "pen up".\n5️⃣ Click the flag and see the layered square effect!\n6️⃣ Try the same with triangles: go to x:0 y:0, draw triangles with sides 120, 80, and 40 steps.\n\n🌟 Challenge: Create five layered hexagons, each 20 steps larger than the last. Start at size 20 and go up to 100. Use a rainbow of colours from innermost to outermost.',
        keyWords: ['layered', 'concentric', 'nested shapes', 'centre', 'rings', 'size', 'depth'],
      },
      quiz: [
        { q: 'What is the effect of drawing the same shape repeatedly with increasing sizes from the same starting point?', options: ['A star pattern', 'A layered or concentric effect', 'A spiral', 'A grid'], answer: 1 },
        { q: 'How do you make a square larger while keeping the same shape?', options: ['Increase the turn angle', 'Increase the "move _ steps" value', 'Use more repeat loops', 'Change the pen colour'], answer: 1 },
        { q: 'What does "concentric" mean?', options: ['Very colourful', 'Shapes that share the same centre point', 'Shapes that rotate', 'Shapes that are different sizes but different positions'], answer: 1 },
        { q: 'Which pen size creates the most dramatic layered effect when combined with a smaller inner shape?', options: ['Pen size 1 for the outer shape', 'Same pen size for all shapes', 'Larger pen size for the outer shape, smaller for the inner', 'Only pen size 10 works'], answer: 2 },
      ],
    },
    {
      title: 'Colour Sequences',
      completed: false,
      xp: 55,
      content: {
        explanation: 'A colour sequence is a planned, systematic progression of colours through your artwork. Instead of choosing colours randomly, you make intentional decisions: warm colours (red, orange, yellow) for one group of shapes, cool colours (blue, green, purple) for another. Or you might follow the rainbow order: red, orange, yellow, green, blue, indigo, violet.\n\nSystematic colour changes make your artwork feel designed and professional rather than accidental. Think about how a professional artist plans a colour palette before starting a painting — they choose colours that work well together and create a mood. You are doing exactly the same thing with code!\n\nIn practice, you will write a sequence of shape-drawing blocks, each preceded by a "set pen color to" block. By carefully choosing the colour order, you can create warm-to-cool transitions, light-to-dark gradients, or complementary colour pairs (colours opposite each other on the colour wheel, like red and green, or blue and orange).\n\nHere is a design challenge to think about: what emotion do warm colours suggest? (Energy, warmth, excitement.) What about cool colours? (Calm, mystery, depth.) By choosing your colour sequence, you are not just making pretty pictures — you are creating a mood and telling a visual story. That is the power of colour in art and design!',
        example: '// Warm to cool colour sequence across shapes\nwhen 🚩 clicked\n  set pen size to 3\n  go to x: -160 y: 0\n  set pen color to [red]\n  pen down\n  repeat 4\n    move 50 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: -80 y: 0\n  set pen color to [orange]\n  pen down\n  repeat 4\n    move 50 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 0 y: 0\n  set pen color to [yellow]\n  pen down\n  repeat 4\n    move 50 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 80 y: 0\n  set pen color to [green]\n  pen down\n  repeat 4\n    move 50 steps\n    turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Plan your colour sequence on paper: choose 5 colours in a specific order (e.g., rainbow order or warm-to-cool).\n2️⃣ Start with "when 🚩 clicked" and "set pen size to 3".\n3️⃣ For each colour, use "pen up", "go to x: _ y: _" to a new position, "set pen color to", "pen down", draw a pentagon (repeat 5, move 50, turn 72), "pen up".\n4️⃣ Space the pentagons across a horizontal line at Y:0, using X values: -160, -80, 0, 80, 160.\n5️⃣ Click the flag — five pentagons in your chosen colour sequence!\n6️⃣ Now try the same but with a vertical line (same X:0, different Y values).\n\n🌟 Challenge: Redesign your sequence so every other shape is a warm colour and the ones in between are cool colours (e.g., red, blue, orange, green, yellow, purple). What visual rhythm does this alternating pattern create?',
        keyWords: ['colour sequence', 'warm colours', 'cool colours', 'palette', 'design', 'systematic', 'transition'],
      },
      quiz: [
        { q: 'What is a colour sequence in art and coding?', options: ['A random selection of colours', 'A planned, systematic progression of colours through the artwork', 'Using only one colour', 'Changing colour by accident'], answer: 1 },
        { q: 'Which colours are considered "warm" colours?', options: ['Blue, green, purple', 'Red, orange, yellow', 'Black and white only', 'Any bright colour'], answer: 1 },
        { q: 'What real-world design practice matches choosing a colour sequence in code?', options: ['Choosing a font size', 'Planning a colour palette before starting artwork', 'Writing lyrics to a song', 'Building a database'], answer: 1 },
        { q: 'Where do you place the "set pen color" block to change each shape\'s colour?', options: ['At the very end only', 'Before drawing each shape', 'Inside the repeat block', 'After "pen up"'], answer: 1 },
      ],
    },
    {
      title: 'Overlapping Shapes',
      completed: false,
      xp: 65,
      content: {
        explanation: 'When two shapes are drawn so that they overlap, something magical happens — the overlapping area creates a new visual region that looks different from both original shapes! This is the foundation of Venn diagrams, stained glass art, and much of modern graphic design. By deliberately overlapping shapes, you can create complex patterns from simple shapes.\n\nIn coding, overlapping shapes just means drawing two shapes at positions close enough that their edges cross. Because we are only drawing outlines (lines, not filled shapes), the overlapping area shows both sets of lines crossing through it, creating an interesting mesh effect.\n\nTry drawing two large squares rotated at 45 degrees from each other and overlapping in the centre — this creates the classic "Star of David" or "Union Jack" effect. Or draw three overlapping circles in red, yellow, and blue to recreate the primary colour diagram from science class!\n\nThe key skill here is planning where to position each shape so it overlaps the others in an interesting way. Think about the centres of your shapes and how far apart they are. If two squares each have sides of 100 steps, their centres need to be less than 100 units apart for them to overlap significantly. Experiment with different amounts of overlap — a small overlap creates a gentle intersection, while a large overlap creates a dense crossed pattern.',
        example: '// Two overlapping squares - rotated versions\nwhen 🚩 clicked\n  go to x: -30 y: -50\n  set pen color to [red]\n  set pen size to 3\n  pen down\n  repeat 4\n    move 100 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 10 y: -30\n  set pen color to [blue]\n  pen down\n  repeat 4\n    move 100 steps\n    turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Draw Shape 1: "go to x:-40 y:-40", set colour to red, size 3, "pen down", repeat 4 (move 100, turn 90), "pen up".\n3️⃣ Draw Shape 2: "go to x:-10 y:-10", set colour to blue, "pen down", repeat 4 (move 100, turn 90), "pen up".\n4️⃣ Click the flag — two overlapping red and blue squares!\n5️⃣ Now add a third shape: "go to x:-25 y:10", set colour to green, "pen down", repeat 3 (move 100, turn 120), "pen up".\n6️⃣ Adjust the positions to get interesting overlap areas.\n\n🌟 Challenge: Draw three circles (using repeat 36, move 5, turn 10) centred at three positions forming a triangle arrangement (x:-50 y:0, x:50 y:0, x:0 y:70). Use red, yellow, and blue. The overlapping areas will look like the primary colour mixing diagram!',
        keyWords: ['overlap', 'intersection', 'Venn diagram', 'overlay', 'layers', 'crossing', 'position'],
      },
      quiz: [
        { q: 'What visual effect is created when two drawn shapes overlap?', options: ['They cancel each other out', 'Both sets of lines appear in the overlap area, creating an intersection effect', 'The older shape disappears', 'The colours merge automatically'], answer: 1 },
        { q: 'How do you make two squares overlap in code?', options: ['Draw them at the same coordinates', 'Use a large pen size', 'Place them close enough that their edges cross', 'Use nested loops'], answer: 2 },
        { q: 'In real life, where do you see the deliberate overlapping of shapes?', options: ['In a calculator', 'In stained glass art and Venn diagrams', 'In a number line', 'In a phone keypad'], answer: 1 },
        { q: 'If two squares each have sides of 100 steps, roughly how far apart should their starting corners be to create overlap?', options: ['More than 200 apart', 'Exactly 100 apart', 'Less than 100 apart', 'Exactly 0 — identical position'], answer: 2 },
      ],
    },
    {
      title: 'Concentric Rings',
      completed: false,
      xp: 70,
      content: {
        explanation: 'Let\'s explore a clever trick to draw shapes that look like circles! A true circle is impossible with just straight-line blocks, but we can get extremely close using the "repeat 36" with "move _ steps" and "turn ↻ 10 degrees" technique. Since 36 × 10 = 360 degrees (one full turn), and each step is a tiny straight line, the result looks beautifully circular to the eye!\n\nTo make rings of different sizes (concentric circles), we draw this pattern multiple times from the same starting point, but with different "move _ steps" values. A small ring uses "move 3 steps", a medium ring uses "move 6 steps", and a large ring uses "move 9 steps". All start at the same position, giving rings that look perfectly nested inside each other.\n\nHere is the maths: the "radius" of each near-circle is proportional to the move steps multiplied by a factor. Moving 5 steps 36 times creates a circle with a total perimeter of 180 steps (36 × 5). The visual radius of this circle is approximately 180 ÷ (2 × 3.14) ≈ 29 pixels. So doubling the move steps doubles the apparent size of the ring!\n\nConcentric circles appear everywhere in nature and art: ripples in a pond, tree rings, the cross-section of a kiwi fruit, a vinyl record, a target, and the pupil of an eye surrounded by the iris. Today you will create your own ripple effect using code — beautiful and mathematically precise!',
        example: '// Concentric rings of different sizes\nwhen 🚩 clicked\n  go to x: 0 y: -15\n  set pen color to [red]\n  set pen size to 2\n  pen down\n  repeat 36\n    move 3 steps\n    turn ↻ 10 degrees\n  pen up\n  go to x: 0 y: -30\n  set pen color to [orange]\n  pen down\n  repeat 36\n    move 6 steps\n    turn ↻ 10 degrees\n  pen up\n  go to x: 0 y: -45\n  set pen color to [yellow]\n  pen down\n  repeat 36\n    move 9 steps\n    turn ↻ 10 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Draw Ring 1 (smallest): "go to x:0 y:-8", "set pen color to [purple]", size 2, "pen down", repeat 36 (move 2, turn 10), "pen up".\n3️⃣ Draw Ring 2: "go to x:0 y:-20", "set pen color to [blue]", "pen down", repeat 36 (move 5, turn 10), "pen up".\n4️⃣ Draw Ring 3: "go to x:0 y:-35", "set pen color to [green]", "pen down", repeat 36 (move 8, turn 10), "pen up".\n5️⃣ Draw Ring 4 (biggest): "go to x:0 y:-50", "set pen color to [red]", "pen down", repeat 36 (move 11, turn 10), "pen up".\n6️⃣ Click the flag — four concentric rings like a ripple!\n7️⃣ The Y offset needs adjusting slightly for each ring so they appear centred — experiment!\n\n🌟 Challenge: Add "wait 0.5 secs" between drawing each ring so the audience watches the ripple appear outward from the centre, like throwing a stone into a pond.',
        keyWords: ['concentric', 'rings', 'circle approximation', 'repeat 36', 'ripple', 'radius', 'perimeter'],
      },
      quiz: [
        { q: 'Why do we use "repeat 36" with "turn 10 degrees" to approximate a circle?', options: ['Because 36 is a lucky number', 'Because 36 × 10 = 360 degrees, making a full turn with tiny steps', 'Because circles have 36 sides', 'Because 36 is the number of pixels in a circle'], answer: 1 },
        { q: 'To make a bigger circle using this technique, what do you change?', options: ['Increase the repeat count', 'Decrease the turn angle', 'Increase the "move _ steps" value', 'Decrease the pen size'], answer: 2 },
        { q: 'What natural phenomenon do concentric rings resemble?', options: ['A lightning bolt', 'Ripples spreading out from a stone dropped in water', 'A mountain range', 'A rainbow'], answer: 1 },
        { q: 'If you use "move 10 steps" instead of "move 5 steps" in the circle pattern, what happens?', options: ['The circle disappears', 'The circle becomes twice as large', 'The circle has fewer sides', 'The circle draws backwards'], answer: 1 },
      ],
    },
    {
      title: 'Geometric Art',
      completed: false,
      xp: 75,
      content: {
        explanation: 'Geometric art uses mathematical shapes arranged with precision and symmetry to create visually stunning patterns. Famous artistic movements like Bauhaus, De Stijl, and Islamic geometric art are built entirely on this principle. Today, you will create a complex symmetric pattern that combines everything you have learned!\n\nSymmetry means that a pattern looks the same when you flip it or rotate it. Rotational symmetry is when a pattern looks identical after being rotated by a certain angle. The spinning mandala from the Shape & Pattern Studio course had 12-fold rotational symmetry — it looked the same after rotating 30 degrees (360 ÷ 12). Today we will create 8-fold symmetry (8 copies of a shape, each rotated 45 degrees).\n\nHere is the plan: use a nested repeat structure. The outer loop repeats 8 times and rotates 45 degrees each time (360 ÷ 8 = 45). Inside, draw a more complex shape — not just a triangle, but a combination of a square and a triangle, or a hexagon, or even a star. Each repetition adds another copy of your complex shape, rotated 45 degrees from the previous one.\n\nThe result is a kaleidoscope-like pattern with eight-fold symmetry. Professional designers use this exact technique to create Islamic geometric tiles, Celtic knotwork patterns, and modern logo designs. You are tapping into thousands of years of mathematical art history!',
        example: '// 8-fold geometric art\nwhen 🚩 clicked\n  set pen color to [blue]\n  set pen size to 2\n  pen down\n  repeat 8\n    repeat 4\n      move 60 steps\n      turn ↻ 90 degrees\n    turn ↻ 45 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "set pen color to [purple]", "set pen size to 2", "pen down".\n3️⃣ Add outer "repeat 8".\n4️⃣ Inside the outer repeat, add inner "repeat 6" (for a hexagon).\n5️⃣ Inside the inner repeat: "move 50 steps", "turn ↻ 60 degrees".\n6️⃣ After the inner repeat (but inside the outer): "turn ↻ 45 degrees".\n7️⃣ Add "pen up" after the outer repeat.\n8️⃣ Click the flag — 8 hexagons in a ring!\n9️⃣ Try changing the inner shape to a triangle (repeat 3, turn 120) or star (repeat 5, turn 144).\n\n🌟 Challenge: Change the outer loop to 12 repeats with a 30-degree turn (360 ÷ 12 = 30). Use a pentagon as the inner shape (repeat 5, turn 72). Add a second colour by changing pen colour after the first 6 outer iterations.',
        keyWords: ['symmetry', 'rotational symmetry', 'geometric', 'Bauhaus', 'kaleidoscope', 'nested loops', 'pattern'],
      },
      quiz: [
        { q: 'What is rotational symmetry?', options: ['When a pattern can be flipped upside down', 'When a pattern looks identical after being rotated by a certain angle', 'When all shapes are the same size', 'When colours are evenly distributed'], answer: 1 },
        { q: 'For 8-fold rotational symmetry, how many degrees should the outer turn be?', options: ['90°', '60°', '45°', '30°'], answer: 2 },
        { q: 'In a nested loop pattern, what does the inner loop draw?', options: ['The full pattern', 'One complete shape repeated', 'Just a single line', 'The background'], answer: 1 },
        { q: 'Which art movement is famous for geometric, mathematically precise designs?', options: ['Impressionism', 'Bauhaus and Islamic geometric art', 'Surrealism', 'Watercolour painting'], answer: 1 },
      ],
    },
    {
      title: 'The Spiral Effect',
      completed: false,
      xp: 80,
      content: {
        explanation: 'A spiral is a shape that curves outward (or inward) as it goes around. True spirals are hard to make without variables, but we can create a beautiful approximation by drawing squares of gradually increasing sizes, all starting from the same point. Each square is bigger than the last, and because they all start in the same corner, they create a spiral-like growing pattern!\n\nThe technique: draw a square with side 20, then a square with side 40, then 60, then 80, and so on. Each starts from approximately the same position. Because each larger square extends further out from the same starting corner, the visual effect looks like a growing, expanding spiral pattern.\n\nAnother approach is to draw the squares rotated slightly each time. Use "pen up", "go to x:0 y:0", set a slightly different starting direction, then draw a square. Repeat this for 8-12 different orientations, each with a slightly larger size. The overlapping rotated squares create a beautiful pinwheel effect that feels very dynamic.\n\nYou can also use nested loops here: outer repeat 8, with "turn ↻ 10 degrees" after each inner square. Combined with slightly increasing move values (you can only do this manually without variables — manually write out different sizes), you get a genuinely impressive spiral art piece. Plan carefully and be patient — this module is your biggest coding challenge yet!',
        example: '// Growing squares spiral approximation\nwhen 🚩 clicked\n  set pen color to [blue]\n  set pen size to 2\n  go to x: 0 y: 0\n  pen down\n  repeat 4\n    move 20 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 0 y: 0\n  set pen color to [green]\n  pen down\n  repeat 4\n    move 40 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 0 y: 0\n  set pen color to [purple]\n  pen down\n  repeat 4\n    move 60 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 0 y: 0\n  set pen color to [red]\n  pen down\n  repeat 4\n    move 80 steps\n    turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Plan your spiral: you will draw 6 squares, sizes 20, 35, 50, 65, 80, and 95.\n3️⃣ For each square: "pen up", "go to x:0 y:0", set a new pen colour, "pen down", repeat 4 (move [your size], turn 90), "pen up".\n4️⃣ Use six different colours going through the rainbow: red, orange, yellow, green, blue, purple.\n5️⃣ Click the flag — six nested squares in rainbow colours!\n6️⃣ Now add a twist: after each "go to x:0 y:0", add "turn ↻ 15 degrees" before "pen down". Each square will be rotated 15 degrees from the last one, creating a pinwheel effect!\n\n🌟 Challenge: Extend the pattern to 8 squares (adding sizes 110 and 125) and add "wait 0.3 secs" after drawing each square so the pattern builds dramatically from smallest to largest.',
        keyWords: ['spiral', 'growing', 'expanding', 'pinwheel', 'size progression', 'rotation', 'dynamic'],
      },
      quiz: [
        { q: 'How do we approximate a spiral effect without variables?', options: ['Use a very large repeat number', 'Draw the same shape multiple times with gradually increasing sizes', 'Draw a circle and spin it', 'Use only the pen up block'], answer: 1 },
        { q: 'What visual effect is created if each square in the sequence starts rotated by 15 degrees from the last?', options: ['Concentric squares', 'A pinwheel or rotating fan effect', 'A straight line', 'Random chaos'], answer: 1 },
        { q: 'What is the correct order of sizes for a growing square spiral?', options: ['100, 50, 80, 20, 60', '20, 40, 60, 80, 100', '100, 80, 60, 40, 20', 'All the same size'], answer: 1 },
        { q: 'Why must you use "go to x:0 y:0" before each square in the spiral?', options: ['To change the pen colour', 'To ensure each square starts from the same reference point', 'To clear the stage', 'To make the sprite jump'], answer: 1 },
      ],
    },
    {
      title: 'Debugging Art',
      completed: false,
      xp: 70,
      content: {
        explanation: 'Even the best programmers write code with bugs! A bug is a mistake in a program that makes it do the wrong thing. Debugging means finding and fixing those mistakes. This is not a sign of failure — it is a normal, essential part of programming. Experienced coders spend roughly half their time debugging!\n\nThere are common types of bugs in block coding art programs. Wrong turn angle: if you write "turn 90" when you meant "turn 120", your triangle becomes a bent squiggle. Wrong repeat count: "repeat 3" for a square only draws three sides, leaving it open. Pen blocks in the wrong order: "move 100" before "pen down" means the first side is invisible! Incorrect step count: using "move 10" when you need "move 100" creates a tiny, hard-to-see shape.\n\nWhen debugging, use a systematic approach: read the code top to bottom and predict what each block will do. Then run the program and compare what you expected to what actually happened. Find the first point where reality differs from expectation — that is likely where the bug is!\n\nLook at the example below — it has three deliberate bugs. Can you spot them before reading the activity? Read each block carefully and think: what will this actually do? Compare it to what a correct hexagon program should look like.',
        example: '// BUGGY CODE — can you find the 3 bugs?\nwhen 🚩 clicked\n  pen down\n  repeat 6\n    move 80 steps\n    turn ↻ 90 degrees    // Bug 1: wrong angle for hexagon\n  pen up\n  go to x: 100 y: 0\n  set pen color to [red]\n  pen up                  // Bug 2: should be pen down!\n  repeat 5               // Bug 3: wrong repeat for triangle\n    move 60 steps\n    turn ↻ 120 degrees\n  pen up',
        activity: '1️⃣ Read the buggy code in the example carefully.\n2️⃣ Find Bug 1: the hexagon turn angle is wrong. What should it be? (360 ÷ 6 = ?)\n3️⃣ Find Bug 2: the second shape will be invisible. Why? What block is wrong?\n4️⃣ Find Bug 3: the second shape says it\'s a triangle but the repeat count is wrong. What should it be for a triangle?\n5️⃣ Now TYPE the corrected program in your workspace:\n   - Correct the hexagon turn to 60 degrees.\n   - Change "pen up" to "pen down" before the triangle.\n   - Fix the repeat to 3 for a triangle.\n6️⃣ Click the flag — a working hexagon and triangle should appear!\n7️⃣ Now deliberately introduce your own bug, swap your code with a partner, and challenge them to find and fix it!\n\n🌟 Challenge: Write a program with two deliberate bugs hidden inside it and give it to a classmate to debug. Write a hint card for them: "The program should draw [describe the expected result]." How good are you at hiding bugs and finding them?',
        keyWords: ['bug', 'debugging', 'error', 'fix', 'systematic', 'predict', 'compare', 'test'],
      },
      quiz: [
        { q: 'What is a bug in a computer program?', options: ['A mistake that makes the program do the wrong thing', 'An insect found on the keyboard', 'A feature that was added accidentally', 'A type of repeat loop'], answer: 0 },
        { q: 'What is the best approach when debugging?', options: ['Delete everything and start again', 'Read the code top to bottom, predict what each block does, and compare to actual output', 'Run the program faster', 'Add more blocks until it works'], answer: 1 },
        { q: 'In the buggy example, the hexagon turn angle was 90 degrees. What is the correct angle?', options: ['45°', '72°', '60°', '120°'], answer: 2 },
        { q: 'If a shape is drawing but no line appears on the stage, which block is likely missing or wrong?', options: ['"go to x: _ y: _" is missing', '"pen down" is missing or replaced by "pen up"', 'The repeat count is too high', 'The turn angle is wrong'], answer: 1 },
      ],
    },
    {
      title: 'Project: Digital Masterpiece',
      completed: false,
      xp: 160,
      content: {
        explanation: 'This is your ultimate creative project — a completely free Digital Masterpiece! You have a full toolkit of blocks and all the skills from this course. There are no instructions telling you what to draw — only guidance on making it the best it can be. Your masterpiece should feel ambitious, personal, and polished.\n\nA great digital masterpiece has several qualities: variety (different shapes, sizes, and colours), intentionality (every choice is deliberate, not random), composition (shapes are arranged thoughtfully across the stage, not just piled in the centre), and narrative (the artwork tells a story or conveys a feeling).\n\nThink about themes: a geometric landscape (hills as triangles, sun as a circle, a house shape), an abstract kaleidoscope pattern, a constellation map, a robot face, a circuit board design. Let your imagination lead!\n\nBefore you code, spend five minutes sketching and planning. Great programmers are great planners. Map out your shapes, their positions, their colours, and any special effects (slow reveals, narration, layering). Think about what you have learned across all three modules of this course — layering, colour sequences, overlapping, concentric rings, geometric symmetry, spirals, and debugging. This is your chance to show all of it!',
        example: '// Example theme: geometric landscape\nwhen 🚩 clicked\n  say "My Digital Masterpiece!"\n  wait 2 secs\n  // Sun (concentric circles)\n  go to x: 80 y: 80\n  set pen color to [yellow]\n  set pen size to 4\n  pen down\n  repeat 36\n    move 8 steps\n    turn ↻ 10 degrees\n  pen up\n  // Mountain (triangle)\n  go to x: -100 y: -60\n  set pen color to [green]\n  set pen size to 3\n  pen down\n  repeat 3\n    move 120 steps\n    turn ↻ 120 degrees\n  pen up\n  say "Done! 🎨"',
        activity: '1️⃣ Choose a theme for your masterpiece and sketch it on paper.\n2️⃣ Plan: at least 5 different shapes, at least 4 different colours, and at least 2 different pen sizes.\n3️⃣ Include at least ONE nested loop (e.g., a mandala, a geometric ring pattern).\n4️⃣ Include at least ONE concentric shape effect (layered sizes).\n5️⃣ Use "go to x: _ y: _" to position everything thoughtfully across the stage.\n6️⃣ Add narration with "say _" and "wait _" to guide the audience through your artwork.\n7️⃣ Add "wait 0.3 secs" between major sections to create a dramatic build-up.\n8️⃣ Before you finalise, check your code for bugs: does it run correctly all the way through?\n9️⃣ Show your masterpiece to a classmate and explain what each section of code does.\n\n🌟 Challenge: Write a 3-sentence artist\'s statement: "My masterpiece is about [theme]. I used [techniques] to create [effect]. The most challenging part was [challenge] and I solved it by [solution]." Can you present this to the class?',
        keyWords: ['masterpiece', 'project', 'creative', 'theme', 'composition', 'variety', 'intentional', 'narrative'],
      },
      quiz: [
        { q: 'What makes a digital masterpiece "intentional" rather than random?', options: ['Using as many blocks as possible', 'Every design choice is deliberate and contributes to the overall artwork', 'Using only one colour', 'Drawing shapes as fast as possible'], answer: 1 },
        { q: 'Which of these is good planning practice before coding a masterpiece?', options: ['Click the green flag immediately', 'Sketch the design and plan shapes and colours on paper first', 'Start with the most difficult part', 'Only plan the colour scheme'], answer: 1 },
        { q: 'What does "composition" mean in art?', options: ['The list of colours used', 'How shapes and elements are arranged across the artwork', 'The number of repeat loops', 'The size of the pen'], answer: 1 },
        { q: 'What should you do if your masterpiece has a bug partway through?', options: ['Delete the whole program', 'Use the debugging skills: read top to bottom, find the first wrong block, fix it', 'Add more blocks after the bug', 'Run the program faster'], answer: 1 },
      ],
    },
  ],
},
{
  id: 'y4-game-maker',
  title: 'Block Adventures',
  description: 'Level up your coding skills! Master debugging, complex patterns, colour gradients, coordinate art, animated stories, and create a fully animated scene.',
  icon: '🎮',
  color: '#f59e0b',
  yearGroup: 4,
  difficulty: 'Intermediate',
  lessons: 10,
  duration: '5 hours',
  progress: 0,
  topics: ['Debugging', 'Nested Loops', 'Colour Gradients', 'Coordinate Art', 'Animated Drawing', 'Story Animation', 'Complex Patterns', 'Algorithm Design', 'Partner Patterns', 'Animated Scene Project'],
  modules: [
    {
      title: 'Debugging Like a Pro',
      completed: false,
      xp: 60,
      content: {
        explanation: 'Welcome to Year 4 Block Adventures! This course starts with one of the most important skills in all of programming: debugging. Professional programmers at Google, Apple, and NASA spend a huge amount of their time finding and fixing bugs. Getting good at debugging is just as important as getting good at writing code in the first place!\n\nThere are four common bug categories in block art programs. Category 1 — Logic bugs: the code runs without crashing but draws the wrong shape (e.g., using turn 90 instead of turn 120 for a triangle). Category 2 — Sequence bugs: blocks are in the wrong order (e.g., "pen down" after the move, so the first line is invisible). Category 3 — Count bugs: the wrong repeat number is used (e.g., "repeat 5" for a hexagon that needs 6). Category 4 — Value bugs: a number is right but slightly off (e.g., turn 89 instead of 90 for a square, creating a slightly skewed shape).\n\nA systematic debugging process has four steps: Predict (read the code and say what you expect it to do), Run (execute the program and observe the output), Compare (find where actual output differs from predicted output), and Fix (change the incorrect block). This four-step method — Predict, Run, Compare, Fix — is used by professional software engineers every day.\n\nIn this lesson you will analyse buggy programs, categorise the bugs you find, fix them, and then test your fixes. Being a great debugger makes you a much more confident coder because you know that even if something goes wrong, you have the skills to diagnose and solve the problem.',
        example: '// BUGGY CODE — four bugs to find!\nwhen 🚩 clicked\n  go to x: 0 y: 0\n  pen down              // Should pen up come first to reposition?\n  repeat 4\n    move 100 steps\n    turn ↻ 60 degrees   // Bug 1: wrong angle for square (should be 90)\n  pen up\n  go to x: 100 y: 0\n  pen down\n  repeat 3             // Bug 2: wrong count for pentagon (should be 5)\n    move 70 steps\n    turn ↻ 72 degrees\n  pen up\n  go to x: -100 y: 0\n  pen up               // Bug 3: should be pen down!\n  repeat 6\n    move 60 steps\n    turn ↻ 60 degrees\n  set pen color to [blue]  // Bug 4: colour set AFTER drawing, not before',
        activity: '1️⃣ Read the buggy code in the example. Write down what you think it is SUPPOSED to draw (three shapes in a row).\n2️⃣ Identify all four bugs by category (logic, sequence, count, or value).\n3️⃣ Bug 1: the square turn is 60° — what should it be? (Category: Value)\n4️⃣ Bug 2: the repeat is 3 for a pentagon — what should it be? (Category: Count)\n5️⃣ Bug 3: "pen up" before the hexagon means nothing draws — fix it! (Category: Sequence)\n6️⃣ Bug 4: the colour is set after drawing — where should it go? (Category: Sequence)\n7️⃣ Retype the corrected program and click the flag to verify all three shapes appear correctly.\n8️⃣ Write down: which bug was hardest to spot? Why?\n\n🌟 Challenge: Write a program with exactly three bugs — one from each category (value, count, sequence). Challenge a classmate to find and categorise them. Give a clue: "This program is supposed to draw [describe expected output]."',
        keyWords: ['debugging', 'bug', 'logic bug', 'sequence bug', 'count bug', 'value bug', 'predict', 'test', 'fix'],
      },
      quiz: [
        { q: 'What are the four steps of the professional debugging process?', options: ['Predict, Run, Compare, Fix', 'Write, Run, Delete, Restart', 'Plan, Code, Test, Submit', 'Read, Think, Click, Hope'], answer: 0 },
        { q: 'A program runs but draws a triangle when it should draw a square. What type of bug is this?', options: ['Sequence bug', 'Count bug', 'Value bug — wrong angle used', 'No bug, it is correct'], answer: 2 },
        { q: 'The pen draw block comes AFTER the move block, so the first line is invisible. What type of bug is this?', options: ['Value bug', 'Count bug', 'Logic bug', 'Sequence bug — blocks in wrong order'], answer: 3 },
        { q: '"repeat 5" is used for a hexagon (which needs 6 sides). What type of bug is this?', options: ['Value bug', 'Count bug', 'Sequence bug', 'Logic bug'], answer: 1 },
      ],
    },
    {
      title: 'Complex Patterns',
      completed: false,
      xp: 65,
      content: {
        explanation: 'In Year 3 you used nested loops to create simple mandalas. Now in Year 4 it is time to push nested loops much further to create genuinely complex geometric patterns. The key insight is that you can nest shapes inside shapes inside shapes — three levels of loops! Each level adds another layer of repetition and complexity.\n\nHere is a powerful pattern structure: an outer loop repeats 8 times and turns 45 degrees each time. Inside, a middle loop repeats 3 times and turns 120 degrees each time (a triangle). Inside the triangle loop, a small inner pattern of move-turn adds detail to each side of the triangle. This three-level structure creates incredibly intricate results from just a few blocks!\n\nAnother powerful technique is using two separate nested loop patterns drawn at different positions. Draw a 12-fold mandala centred at X:-80, Y:0, then draw an 8-fold mandala centred at X:80, Y:0. The two patterns side by side create a rich, gallery-worthy artwork.\n\nThe key skill here is reading nested loops carefully. To understand what a nested loop does, work from the inside out: what does the innermost block do? Then what does the inner loop do? Then what does the outer loop do? This inside-out reading skill is how professional developers understand complex code, and it applies to programming languages far beyond block coding.',
        example: '// Three-level nested pattern\nwhen 🚩 clicked\n  set pen color to [purple]\n  set pen size to 1\n  pen down\n  repeat 12\n    repeat 4\n      move 50 steps\n      turn ↻ 90 degrees\n    turn ↻ 30 degrees\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "set pen color to [blue]", "set pen size to 1", "pen down".\n3️⃣ Add outer "repeat 12".\n4️⃣ Inside: add middle "repeat 5" (pentagon).\n5️⃣ Inside the pentagon loop: "move 40 steps", "turn ↻ 72 degrees".\n6️⃣ After the pentagon loop (inside the outer loop): "turn ↻ 30 degrees".\n7️⃣ After the outer loop: "pen up".\n8️⃣ Click the flag — 12 pentagons in a ring! ✨\n9️⃣ Now add a second pattern: "pen up", "go to x: 120 y: 0", "set pen color to [red]", repeat the whole pattern but with triangles (inner repeat 3, turn 120) and outer repeat 8 (turn 45).\n\n🌟 Challenge: Create a three-level pattern: outer repeat 6 (turn 60), middle repeat 4 (square, turn 90), inner — inside each square side, add an extra "turn ↻ 45" before the next move to add a zigzag detail. What does this create?',
        keyWords: ['nested loops', 'three levels', 'complexity', 'mandala', 'inside-out reading', 'iteration', 'pattern'],
      },
      quiz: [
        { q: 'To understand a nested loop pattern, which direction should you read it?', options: ['Outside in — start with the outermost loop', 'Inside out — start with the innermost blocks', 'Top to bottom only', 'Bottom to top'], answer: 1 },
        { q: 'An outer loop repeats 12 times and turns 30 degrees each time. What total rotation does this create?', options: ['30°', '120°', '360°', '180°'], answer: 2 },
        { q: 'In a nested pattern where the outer loop repeats 8 times and the inner loop draws a triangle, how many triangles appear in total?', options: ['3', '8', '24', '11'], answer: 1 },
        { q: 'What determines the number of "petals" or repeated shapes in a mandala-style pattern?', options: ['The inner loop repeat count', 'The move steps value', 'The outer loop repeat count', 'The pen size'], answer: 2 },
      ],
    },
    {
      title: 'Colour Gradients',
      completed: false,
      xp: 70,
      content: {
        explanation: 'A colour gradient is when colour changes smoothly through an artwork — from deep red to bright orange to sunny yellow, or from dark blue to electric cyan to pale white. Gradients make artwork feel dynamic, alive, and professional. In this lesson you will create gradients by carefully sequencing colour changes through your drawing program.\n\nWithout variables, we create gradients by manually placing "set pen color to" blocks at strategic points in the program, combined with "set pen size to" changes. The trick is planning: decide on five or six "colour stops" — the key colours in your gradient — and place them evenly through the drawing sequence.\n\nFor example, to create a gradient spiral of growing squares, draw 8 squares of increasing size (20, 35, 50, 65, 80, 95, 110, 125 steps). Before each square, set the pen colour to the next colour in your gradient: deep blue, blue, cyan, green, yellow, orange, red, deep red. The result is a rainbow spiral that transitions smoothly through the spectrum!\n\nYou can also combine colour gradients with pen size gradients — make the pen thicker as the squares grow larger. Start with pen size 1 for the smallest and increase to pen size 6 for the largest. This creates a double gradient effect — colour AND thickness — that looks incredibly sophisticated. Plan both gradients on paper before you code.',
        example: '// Colour and size gradient through growing squares\nwhen 🚩 clicked\n  go to x: 0 y: 0\n  set pen color to [blue]\n  set pen size to 1\n  pen down\n  repeat 4\n    move 25 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 0 y: 0\n  set pen color to [cyan]\n  set pen size to 2\n  pen down\n  repeat 4\n    move 50 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 0 y: 0\n  set pen color to [green]\n  set pen size to 3\n  pen down\n  repeat 4\n    move 75 steps\n    turn ↻ 90 degrees\n  pen up\n  go to x: 0 y: 0\n  set pen color to [yellow]\n  set pen size to 4\n  pen down\n  repeat 4\n    move 100 steps\n    turn ↻ 90 degrees\n  pen up',
        activity: '1️⃣ Plan your gradient on paper: choose 6 colours in order and 6 pen sizes (e.g., 1, 2, 3, 4, 5, 6).\n2️⃣ Choose 6 square sizes: 20, 40, 60, 80, 100, 120 steps.\n3️⃣ Start with "when 🚩 clicked".\n4️⃣ For each square: "go to x:0 y:0", set your colour, set your pen size, "pen down", repeat 4 (move [size], turn 90), "pen up".\n5️⃣ Colours in order: purple, blue, cyan, green, yellow, red.\n6️⃣ Pen sizes in order: 1, 2, 3, 4, 5, 6.\n7️⃣ Click the flag — a rainbow gradient of nested squares!\n\n🌟 Challenge: Apply the same gradient technique to hexagons instead of squares. Use 6 hexagons of increasing size (repeat 6, turn 60, move values 15, 30, 45, 60, 75, 90). Does the hexagon gradient look more circular?',
        keyWords: ['gradient', 'colour stops', 'transition', 'progression', 'pen size gradient', 'sequence', 'spectrum'],
      },
      quiz: [
        { q: 'What is a colour gradient?', options: ['Using only one colour throughout', 'A smooth transition between colours through the artwork', 'Changing colour randomly', 'Making all shapes the same colour'], answer: 1 },
        { q: 'Without variables, how do you create a gradient in block code?', options: ['Use a special gradient block', 'Manually place "set pen color" blocks at strategic points through the sequence', 'Use the pen up block between colours', 'Repeat blocks automatically change colour'], answer: 1 },
        { q: 'What is a "colour stop" in gradient design?', options: ['A block that stops colour from changing', 'One of the key colour points in the gradient sequence', 'The last colour used in the artwork', 'A pause in the animation'], answer: 1 },
        { q: 'Combining a colour gradient with a pen size gradient creates what effect?', options: ['Shapes that disappear', 'A double gradient — both colour AND line thickness change through the artwork', 'Faster drawing speed', 'Shapes that overlap more'], answer: 1 },
      ],
    },
    {
      title: 'Drawing with Coordinates',
      completed: false,
      xp: 75,
      content: {
        explanation: 'Coordinates are the superpower that lets you place anything exactly where you want it on the stage. By combining precise "go to x: _ y: _" blocks with "pen down" and "pen up", you can draw shapes that require exact positioning — like a clock face, a grid of shapes, a bar chart, or a pixel art image.\n\nThe stage coordinate system: X goes from -240 (far left) to 240 (far right). Y goes from -180 (bottom) to 180 (top). Centre is (0,0). Knowing this, you can calculate exactly where any shape should start. A clock face has numbers arranged in a circle — each at a specific X,Y position calculated from the centre.\n\nFor a bar chart: draw five vertical rectangles (or just lines) of different heights at evenly spaced X positions. Use pen up to jump to each bar\'s starting position, pen down to draw the bar (a narrow rectangle), then pen up to move to the next. With coordinates, each bar lands perfectly in its column.\n\nCoordinate drawings are a gateway to understanding how all digital graphics work. Every pixel on your screen has an X,Y address. Every character in a video game has a position tracked by coordinates. Every icon in an app is placed at precise pixel coordinates. The coordinate system you are using today is the same system used in professional game engines, design software, and scientific visualisation tools.',
        example: '// Five vertical bars at precise X positions\nwhen 🚩 clicked\n  set pen color to [blue]\n  set pen size to 20\n  pen up\n  go to x: -120 y: -80\n  pen down\n  go to x: -120 y: 20\n  pen up\n  go to x: -60 y: -80\n  set pen color to [red]\n  pen down\n  go to x: -60 y: 60\n  pen up\n  go to x: 0 y: -80\n  set pen color to [green]\n  pen down\n  go to x: 0 y: -10\n  pen up',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Draw a coordinate cross: set pen colour to black, size 1. Go to x:-200 y:0, pen down, go to x:200 y:0, pen up (horizontal axis). Go to x:0 y:-150, pen down, go to x:0 y:150, pen up (vertical axis).\n3️⃣ Now draw four shapes at the four quadrant centres:\n   - Top-left (x:-80, y:60): a triangle (repeat 3, move 50, turn 120)\n   - Top-right (x:80, y:60): a pentagon (repeat 5, move 40, turn 72)\n   - Bottom-left (x:-80, y:-60): a star (repeat 5, move 50, turn 144)\n   - Bottom-right (x:80, y:-60): a hexagon (repeat 6, move 40, turn 60)\n4️⃣ Use different pen colours for each shape.\n5️⃣ Click the flag — four shapes precisely positioned in four quadrants!\n\n🌟 Challenge: Create a simple bar chart with 4 bars. Each bar is a vertical line drawn from y:-100 upward to different heights: bar heights of 50, 120, 80, and 160 steps respectively. Place them at x:-90, x:-30, x:30, and x:90. Use "set pen size to 18" to make them wide like real chart bars. Give each bar a different colour.',
        keyWords: ['coordinates', 'x axis', 'y axis', 'precise positioning', 'bar chart', 'pixel', 'grid', 'origin'],
      },
      quiz: [
        { q: 'What are the coordinates of the exact centre of the stage?', options: ['x:100 y:100', 'x:0 y:0', 'x:-100 y:-100', 'x:240 y:180'], answer: 1 },
        { q: 'To draw a straight vertical line using coordinates, which values do you change?', options: ['Both X and Y', 'Only X stays the same, Y changes', 'Only Y stays the same, X changes', 'Neither changes'], answer: 1 },
        { q: 'Drawing with coordinates is similar to which professional technology?', options: ['Word processing', 'Video game engines and design software', 'Audio recording', 'Email systems'], answer: 1 },
        { q: 'To draw a line from (x:-100, y:0) to (x:100, y:0) using the go-to blocks, what is the correct sequence?', options: ['"pen down" → go to -100,0 → go to 100,0 → "pen up"', '"pen up" → go to -100,0 → "pen down" → go to 100,0 → "pen up"', 'go to -100,0 → "pen down" → "pen up" → go to 100,0', '"pen down" → go to 0,0 → "pen up"'], answer: 1 },
      ],
    },
    {
      title: 'Animated Drawing',
      completed: false,
      xp: 80,
      content: {
        explanation: 'Animation is the art of making things change over time. In block coding, you create animation by using "wait _ secs" blocks to slow down your drawing so the audience watches it build up step by step. This transforms a static drawing into a live performance — and it is far more engaging to watch!\n\nThe key to great animated drawing is pacing. Too fast and the effect is lost. Too slow and it becomes boring. The sweet spot for most shapes is 0.2 to 0.5 seconds between each step. For dramatic reveals, you might use 1-2 seconds between major sections. Think of it like a TV cooking show — you watch each ingredient added, not just the finished dish.\n\nFor complex patterns, you can create a "drawing show" where the audience watches a mandala or star pattern build up one petal at a time. Between each iteration of the outer loop, add a "wait _ secs". The mandala appears to grow organically, with each new shape rotating into position. It is genuinely mesmerising to watch!\n\nThere is also a technique called "pause for effect" — adding a longer wait at a dramatic moment. If you are drawing a star pattern, add "wait 0.5 secs" between each line of the star. When the last line closes the shape, add "wait 1 secs" and have the sprite say "Complete! ⭐" The dramatic pause at the end makes the reveal feel special.',
        example: '// Animated mandala building up slowly\nwhen 🚩 clicked\n  say "Watch this build..."\n  wait 1 secs\n  set pen color to [blue]\n  set pen size to 2\n  pen down\n  repeat 8\n    repeat 4\n      move 50 steps\n      turn ↻ 90 degrees\n    turn ↻ 45 degrees\n    wait 0.4 secs\n  pen up\n  say "Mandala complete! ✨"\n  wait 1 secs',
        activity: '1️⃣ Start with "when 🚩 clicked".\n2️⃣ Add "say _": "Get ready for an animation show!" and "wait 1.5 secs".\n3️⃣ Add "set pen color to [purple]", "set pen size to 2", "pen down".\n4️⃣ Add outer "repeat 6".\n5️⃣ Inside, add inner "repeat 3" (triangle): "move 70 steps", "turn ↻ 120 degrees".\n6️⃣ After the inner repeat (inside outer): "turn ↻ 60 degrees" and "wait 0.5 secs".\n7️⃣ After the outer repeat: "pen up".\n8️⃣ Add "say _": "Six triangles — one mandala! 🌟" then "wait 2 secs".\n9️⃣ Click the flag and watch your mandala build triangle by triangle!\n\n🌟 Challenge: Create a "drawing race" — animate two separate patterns building up side by side. Draw one shape from pattern A, wait 0.3 secs, draw one shape from pattern B, wait 0.3 secs, and alternate until both are complete. Use "go to x: _ y: _" to switch between the two pattern centres.',
        keyWords: ['animation', 'wait', 'pacing', 'reveal', 'dramatic', 'timing', 'mandala build', 'step by step'],
      },
      quiz: [
        { q: 'What makes a "drawing show" more engaging than an instant drawing?', options: ['Using more colours', 'The audience watches the drawing build up step by step with wait blocks', 'Drawing faster', 'Using bigger shapes'], answer: 1 },
        { q: 'Where do you place "wait _ secs" to see each petal of a mandala appear separately?', options: ['Before "pen down" only', 'After each iteration of the outer loop', 'At the very end only', 'Between every single "move" block'], answer: 1 },
        { q: 'What wait value range provides a "sweet spot" for animated drawing — engaging but not too slow?', options: ['5 to 10 seconds', '2 to 3 seconds', '0.2 to 0.5 seconds', '0.001 seconds'], answer: 2 },
        { q: 'What is a "pause for effect" in animated drawing?', options: ['Stopping the program permanently', 'A longer wait at a dramatic moment to make a reveal feel special', 'Using pen up to pause drawing', 'Repeating the same shape twice'], answer: 1 },
      ],
    },
    {
      title: 'Story Animation',
      completed: false,
      xp: 85,
      content: {
        explanation: 'Now you are going to combine everything: drawing, animation, timing, and storytelling! A story animation is a program where your sprite narrates a story while simultaneously drawing the scenes from that story. As the sprite says "Once upon a time, there was a tall mountain...", a triangle shape appears on stage. When it says "...and a bright shining sun", a circle shape appears. The words and the drawing happen together.\n\nThis is how early computer animation worked — and it is still how many animated explainer videos are made today. The narrator\'s voice (here, our sprite\'s speech bubbles) guides the audience through a visual story. Timing is everything: the drawing should appear just as the words describe it.\n\nStructure your story animation as a sequence of say+wait+draw blocks. First, say the next line of the story and wait long enough for it to be read. Then draw the corresponding shape. Then say the next line, wait, draw the next shape. And so on. Planning on paper first is essential — write out your story, decide which shapes represent what, and map out the approximate stage positions for each.\n\nThe most important rule is that the speech bubble timing and the drawing timing must work together. If a shape takes 2 seconds to draw (because you have waits inside it), then the speech bubble announcing that shape should appear at least 2 seconds before drawing starts. Think of it like a film director timing a voiceover with the action on screen!',
        example: '// Story animation: "The Mountain and the Sun"\nwhen 🚩 clicked\n  say "Once upon a time, there was a mountain..."\n  wait 2 secs\n  go to x: -80 y: -80\n  set pen color to [green]\n  set pen size to 3\n  pen down\n  repeat 3\n    move 120 steps\n    turn ↻ 120 degrees\n  pen up\n  say "And above it, a golden sun shone brightly."\n  wait 2 secs\n  go to x: 80 y: 80\n  set pen color to [yellow]\n  set pen size to 4\n  pen down\n  repeat 36\n    move 6 steps\n    turn ↻ 10 degrees\n  pen up\n  say "And they lived happily ever after! 🌟"\n  wait 2 secs',
        activity: '1️⃣ Write a short 3-scene story. Example: "There was a house. Near it was a garden. Above it all, stars shone."\n2️⃣ Decide which shapes represent each scene: house = square + triangle roof, garden = series of small triangles in a row, stars = small star shapes at various positions.\n3️⃣ Code the story:\n   - "say _" (scene 1 narration) + "wait 2 secs"\n   - Draw scene 1 shapes\n   - "say _" (scene 2 narration) + "wait 2 secs"\n   - Draw scene 2 shapes\n   - "say _" (scene 3 narration) + "wait 2 secs"\n   - Draw scene 3 shapes\n4️⃣ End with "say _": "The End! 📖" + "wait 2 secs".\n5️⃣ Click the flag and watch your story animation unfold!\n\n🌟 Challenge: Add animated reveals to each shape — draw each one slowly with waits between steps. Add dramatic pauses between scenes. Make the speech bubbles describe the drawing action: "Watch as the house takes shape..." then draw the house slowly, side by side.',
        keyWords: ['story animation', 'narration', 'timing', 'scenes', 'visual storytelling', 'synchronise', 'director'],
      },
      quiz: [
        { q: 'In a story animation, what should happen just before drawing each scene\'s shape?', options: ['The sprite should move to the centre', 'The sprite should say the relevant story line and wait', 'The pen should go up', 'A new colour should be set'], answer: 1 },
        { q: 'Why is planning on paper essential for story animations?', options: ['It is not necessary', 'To map out which shapes represent which story moments and their stage positions', 'To calculate the exact pixel count', 'Because the computer cannot run without a paper plan'], answer: 1 },
        { q: 'What real-world creative role does timing a narration with animation resemble?', options: ['A plumber', 'A film director timing a voiceover with screen action', 'A scientist running an experiment', 'A sports coach'], answer: 1 },
        { q: 'What is the best order for a single narrated scene?', options: ['Draw → "say" → "wait"', '"wait" → draw → "say"', '"say" → "wait" → draw', 'Draw → "wait" → "say"'], answer: 2 },
      ],
    },
    {
      title: 'The Big Pattern Challenge',
      completed: false,
      xp: 80,
      content: {
        explanation: 'This lesson is a full creative challenge using every block available! The Big Pattern Challenge means designing and coding the most complex, beautiful pattern you can create using only the allowed blocks. No shortcuts — every choice must be deliberate and contribute to the whole design.\n\nA truly impressive pattern has multiple layers of complexity. It might start with a coordinate-placed background of simple shapes, then add a large mandala in the centre using nested loops, then overlay some rings using the circle technique, then finish with a frame of colour-gradient squares around the edges. Each layer adds visual richness without obscuring what came before.\n\nTo manage this complexity, use a top-down planning approach. Define the four main sections of your pattern: background, centrepiece, details, and frame. Plan each section separately on paper, working out the coordinates, shapes, colours, and sizes for each. Then code each section one at a time, testing as you go.\n\nOne professional technique is progressive refinement: code a rough version first with simple shapes and no colour, just to check positioning. Then refine it — add colours, adjust sizes, add detail shapes. Then refine again — add pen size variation, gradient effects, animation. Building in stages like this prevents mistakes and makes debugging much easier because you only change small amounts at a time.',
        example: '// Multi-layer pattern: background + mandala + frame\nwhen 🚩 clicked\n  // Layer 1: Background triangle grid\n  set pen color to [cyan]\n  set pen size to 1\n  go to x: -100 y: -60\n  pen down\n  repeat 3\n    move 50 steps\n    turn ↻ 120 degrees\n  pen up\n  go to x: 50 y: -60\n  pen down\n  repeat 3\n    move 50 steps\n    turn ↻ 120 degrees\n  pen up\n  // Layer 2: Centre mandala\n  go to x: 0 y: 0\n  set pen color to [purple]\n  set pen size to 2\n  pen down\n  repeat 8\n    repeat 4\n      move 40 steps\n      turn ↻ 90 degrees\n    turn ↻ 45 degrees\n  pen up',
        activity: '1️⃣ Plan your Big Pattern on paper with four labelled layers.\n2️⃣ Layer 1 — Background: use "go to x: _ y: _" to place 4-6 small shapes around the stage edges.\n3️⃣ Layer 2 — Centrepiece: a nested loop mandala at x:0 y:0 (outer repeat 8-12, inner shape of your choice).\n4️⃣ Layer 3 — Accent details: 3-4 small precise shapes placed with coordinates between the centrepiece and edges.\n5️⃣ Layer 4 — Frame: draw a large square outline around the stage edge as a border (go to corner, pen down, move large value, turn 90, repeat 4).\n6️⃣ Use at least 4 different colours and 2 different pen sizes across all layers.\n7️⃣ Add "say _" + "wait _" between layers to announce each section.\n8️⃣ Test each layer as you add it — do not wait until the end to run the program!\n\n🌟 Challenge: Add animation to the centrepiece mandala by inserting "wait 0.3 secs" after each outer loop iteration. This makes the centrepiece build up dramatically while the background is already visible.',
        keyWords: ['layers', 'complexity', 'progressive refinement', 'centrepiece', 'background', 'frame', 'composition', 'design'],
      },
      quiz: [
        { q: 'What is the "top-down planning approach" in coding a complex pattern?', options: ['Planning from the bottom of the screen up', 'Dividing the design into major sections and planning each separately before coding', 'Writing all the code first, then planning', 'Using only the top half of the stage'], answer: 1 },
        { q: 'What is "progressive refinement" in coding?', options: ['Adding more loops each time', 'Building in stages — rough version first, then adding detail and colour in passes', 'Refining means deleting most of your code', 'Making the program progressively faster'], answer: 1 },
        { q: 'Why should you test each layer of a complex pattern as you add it?', options: ['To show your teacher progress', 'So bugs are caught early in small amounts of code, not buried in a large program', 'Because the computer requires it', 'To reset the stage between layers'], answer: 1 },
        { q: 'Which layer type goes last in a multi-layer pattern design?', options: ['Centrepiece', 'Background', 'Detail accents', 'Frame or border — drawn last so it appears on top'], answer: 3 },
      ],
    },
    {
      title: 'Plan Before You Code',
      completed: false,
      xp: 70,
      content: {
        explanation: 'One of the most important habits of professional programmers is planning before writing a single line of code. This planning process is called algorithm design — creating a step-by-step description of what the program needs to do before you actually write the blocks. Great programmers say "think ten minutes, code two minutes" rather than "code ten minutes, debug two hours!"\n\nAn algorithm is like a recipe — a precise, ordered set of steps that tells you exactly how to achieve a goal. Before coding a drawing program, your algorithm might look like: 1) Move to starting position (x:-50, y:0). 2) Set pen colour to blue, size 3. 3) Put pen down. 4) Draw a hexagon (repeat 6, move 80, turn 60). 5) Lift pen. 6) Move to next position. And so on. Writing this out in plain words BEFORE touching the blocks helps you spot problems early.\n\nTools for algorithm design include: numbered step lists (like a recipe), sketches with coordinate labels (for positioning), shape reference tables (shape: hexagon, sides: 6, angle: 60°, move: 80), and flowcharts (boxes and arrows showing the program flow). You do not need to use all of these — even a simple numbered list is better than no plan at all.\n\nResearch into professional software development shows that teams that spend more time planning and designing produce better software with fewer bugs. The best coders are not the fastest typers — they are the best thinkers. This lesson is about developing your thinking skills, which will benefit every subject you study, not just coding.',
        example: '// Algorithm written BEFORE coding:\n// 1. Jump to x:-80, y:0 (no drawing)\n// 2. Set colour: red, size: 3\n// 3. Pen down\n// 4. Draw pentagon: repeat 5, move 60, turn 72\n// 5. Pen up\n// 6. Jump to x:80, y:0\n// 7. Set colour: blue, size: 3\n// 8. Pen down\n// 9. Draw hexagon: repeat 6, move 60, turn 60\n// 10. Pen up\n// 11. Say "Shapes complete!"\n\n// NOW translate the algorithm to blocks:\nwhen 🚩 clicked\n  pen up\n  go to x: -80 y: 0\n  set pen color to [red]\n  set pen size to 3\n  pen down\n  repeat 5\n    move 60 steps\n    turn ↻ 72 degrees\n  pen up',
        activity: '1️⃣ Before touching ANY blocks, write a numbered algorithm on paper for a 3-shape program.\n2️⃣ Your algorithm must specify for each shape: starting position (X, Y), colour, pen size, shape type (and sides), move steps, turn angle.\n3️⃣ Write your algorithm clearly enough that a classmate could code it from your instructions alone.\n4️⃣ Swap algorithms with a classmate. Code THEIR algorithm exactly as written.\n5️⃣ Compare the coded result with what your classmate expected. Did the algorithm describe the shapes precisely enough?\n6️⃣ Identify any ambiguities or gaps in the algorithm. How could you rewrite it to be clearer?\n\n🌟 Challenge: Write an algorithm for a complex nested-loop mandala in plain steps, without using block notation. For example: "The outer loop runs 8 times. Each time it runs, it draws a triangle and then turns 45 degrees." Could a friend who has never coded understand and follow your algorithm? Refine it until they can!',
        keyWords: ['algorithm', 'planning', 'design', 'steps', 'recipe', 'flowchart', 'pseudocode', 'specification'],
      },
      quiz: [
        { q: 'What is an algorithm in programming?', options: ['A precise, ordered set of steps describing how to achieve a goal', 'A type of mathematical formula only', 'A specific block in the palette', 'The name for a repeat loop'], answer: 0 },
        { q: 'Why do professional programmers plan before coding?', options: ['It is a rule they must follow', 'Planning catches problems early and produces better code with fewer bugs', 'Computers require a plan first', 'Planning takes less time than coding'], answer: 1 },
        { q: 'Which planning tool is most similar to writing an algorithm?', options: ['A colour palette', 'A numbered recipe or step-by-step list', 'A photo of the expected output', 'A timer'], answer: 1 },
        { q: 'What is the key advantage of swapping algorithms with a classmate?', options: ['It takes less time', 'It reveals whether the algorithm is clear and precise enough for someone else to follow', 'It is more fun', 'The teacher requires it'], answer: 1 },
      ],
    },
    {
      title: 'Partner Patterns',
      completed: false,
      xp: 75,
      content: {
        explanation: 'Real software is almost never written by just one person — it is a team effort. Professional developers collaborate, divide tasks, and write code that connects together into a larger system. In this lesson, you will experience collaborative coding by creating two programs that together form one complete artwork.\n\nThe challenge: you and a partner each write half of a drawing program. Your half draws shapes in the left half of the stage (X values -240 to 0). Your partner\'s half draws shapes in the right half (X values 0 to 240). When both programs run one after the other (or together), they create a complete, balanced composition.\n\nFor this to work well, you both need to agree on a shared plan before you start coding. Decide: What is the overall theme? What colours will each half use? Will the two halves mirror each other (use the same shapes, just flipped horizontally) or complement each other (use different but harmonious shapes and colours)? A mirrored design uses positive X values on the right corresponding to the same negative X values on the left.\n\nWhen combining the two halves, one partner\'s full block sequence runs first, then the other partner\'s full sequence starts where the first left off. The second program uses "pen up" and "go to x: _ y: _" at the start to position correctly in their half. The result is a collaborative artwork where each coder\'s style contributes to the whole.',
        example: '// Partner A\'s half (left side, X: -240 to 0)\nwhen 🚩 clicked\n  set pen color to [blue]\n  set pen size to 2\n  go to x: -80 y: 20\n  pen down\n  repeat 8\n    repeat 4\n      move 30 steps\n      turn ↻ 90 degrees\n    turn ↻ 45 degrees\n  pen up\n  say "Partner A done! Partner B — your turn!"\n  wait 2 secs\n\n// Partner B\'s half (right side, X: 0 to 240)\n// (add below Partner A\'s blocks)\n  set pen color to [red]\n  go to x: 80 y: 20\n  pen down\n  repeat 8\n    repeat 4\n      move 30 steps\n      turn ↻ 90 degrees\n    turn ↻ 45 degrees\n  pen up\n  say "Both halves complete! 🎉"',
        activity: '1️⃣ With your partner, agree on a theme and a colour scheme (one colour family each, or one colour per partner).\n2️⃣ Agree on the overall composition: will your halves mirror each other or use different shapes?\n3️⃣ Partner A: plan and code shapes for the LEFT half (use X values from -200 to -20).\n4️⃣ Partner B: plan and code shapes for the RIGHT half (use X values from 20 to 200).\n5️⃣ Each partner should include at least 2 different shapes and use at least 2 colours.\n6️⃣ Combine both code sequences into one program (Partner A\'s blocks first, then Partner B\'s blocks underneath).\n7️⃣ Click the flag together and watch the full collaborative artwork appear!\n8️⃣ Discuss: does the combined artwork look balanced? What would you change?\n\n🌟 Challenge: Make your halves perfectly mirror each other. If Partner A draws a hexagon at x:-80, Partner B draws an identical hexagon at x:80. If Partner A uses a blue pentagon at x:-120, Partner B uses a blue pentagon at x:120. A perfectly mirrored artwork has reflective symmetry along the Y axis.',
        keyWords: ['collaboration', 'partner', 'team coding', 'left half', 'right half', 'mirror', 'composition', 'symmetry'],
      },
      quiz: [
        { q: 'In the partner patterns activity, what does Partner A\'s program draw?', options: ['The top half of the stage', 'The right half of the stage', 'The left half of the stage', 'The centre circle only'], answer: 2 },
        { q: 'What must partners agree on BEFORE they start coding separately?', options: ['Nothing — just start immediately', 'The overall theme, colour scheme, and composition plan', 'The exact number of blocks each will use', 'Which computer to use'], answer: 1 },
        { q: 'In a perfectly mirrored partner artwork, if Partner A draws at x:-80, where does Partner B draw the same shape?', options: ['x:-80 (same position)', 'x:0 (centre)', 'x:80 (mirror position)', 'x:-160 (double distance)'], answer: 2 },
        { q: 'Why is collaborative coding an important real-world skill?', options: ['It is not used in real software', 'Professional software is almost always built by teams, not individuals', 'It only applies to art programs', 'It is only used in schools'], answer: 1 },
      ],
    },
    {
      title: 'Project: Animated Scene',
      completed: false,
      xp: 200,
      content: {
        explanation: 'This is your ultimate Year 4 project — creating a fully animated scene with narration, multiple shapes, colour gradients, precise positioning, and dramatic timing. This project should showcase every skill you have developed across all four courses: events, sequences, movement, turns, pen drawing, repeat loops, colour, pen size, coordinates, nested loops, animation timing, and storytelling.\n\nAn animated scene tells a story visually. Think of it as directing your very own short animated film, where you control every element: the dialogue (say blocks), the timing (wait blocks), the scenery (drawn shapes using pen blocks), and the camera work (coordinate positioning using go-to blocks). You are the writer, director, animator, and artist all in one!\n\nYour scene should have at least three distinct "shots" or sections: an establishing shot (overview of the scene — background shapes), a main action sequence (the centrepiece animation with narration), and a closing shot (a final shape or message). Each section should be clearly signalled with a "say" block so the audience knows what is happening.\n\nThe technical requirements for full marks: at least 5 different shapes, at least 4 different colours, at least 1 nested loop, at least 1 animated sequence (with waits between steps), at least 3 "say" + "wait" pairs for narration, precise coordinate positioning for at least 3 shapes, and variation in pen size across the scene. This is a big project — plan carefully, code section by section, test frequently, and debug systematically. You have all the skills you need. Go make something amazing!',
        example: '// Animated Scene: "A Night in Space"\nwhen 🚩 clicked\n  say "A Night in Space..."\n  wait 2 secs\n  // Background: stars\n  set pen color to [white]\n  set pen size to 3\n  go to x: -150 y: 100\n  pen down\n  repeat 5\n    move 30 steps\n    turn ↻ 144 degrees\n  pen up\n  go to x: 100 y: 80\n  pen down\n  repeat 5\n    move 25 steps\n    turn ↻ 144 degrees\n  pen up\n  say "And in the middle... a great spinning galaxy!"\n  wait 2 secs\n  // Centrepiece: animated mandala\n  go to x: 0 y: 0\n  set pen color to [blue]\n  set pen size to 2\n  pen down\n  repeat 12\n    repeat 3\n      move 50 steps\n      turn ↻ 120 degrees\n    turn ↻ 30 degrees\n    wait 0.3 secs\n  pen up\n  say "Our galaxy — complete! 🌌"\n  wait 2 secs',
        activity: '1️⃣ Choose a theme for your animated scene: space, underwater, a garden, a city, a dream world — any theme you like!\n2️⃣ Plan on paper: sketch your scene and write a script (the say blocks). Plan your three sections.\n3️⃣ Section 1 — Establishing: draw 3-4 background shapes quickly (no animation waits needed here).\n4️⃣ Section 2 — Main action: draw your centrepiece shape with animation waits. Include narration before and during.\n5️⃣ Section 3 — Closing: draw a final shape or detail, end with a closing "say" block.\n6️⃣ Technical checklist: 5+ shapes, 4+ colours, 1+ nested loop, 1+ animated section, 3+ say/wait pairs, 3+ coordinate positions, 2+ pen sizes.\n7️⃣ Code section by section — test after each section!\n8️⃣ Debug systematically using the Predict-Run-Compare-Fix method.\n9️⃣ Present your scene to the class and explain the code behind one of your favourite parts.\n\n🌟 Challenge: Add a title card at the very start — your sprite says the title of your scene (e.g., "A Night in Space — by [Your Name]") and waits 3 seconds before anything draws. This makes your project feel like a real film with a title sequence!',
        keyWords: ['animated scene', 'project', 'narration', 'timing', 'composition', 'layers', 'showcase', 'film direction'],
      },
      quiz: [
        { q: 'What are the three main "shots" or sections a good animated scene should have?', options: ['Introduction, middle, and conclusion — any type', 'Establishing shot, main action sequence, and closing shot', 'Fast section, slow section, fast section', 'Background, text, and music'], answer: 1 },
        { q: 'What is the minimum number of different shapes required for full marks on this project?', options: ['2', '3', '5', '10'], answer: 2 },
        { q: 'Which debugging method should you use if something goes wrong in your scene?', options: ['Delete everything and restart', 'Predict what the code should do, run it, compare, then fix the difference', 'Add more wait blocks', 'Randomly change numbers until it works'], answer: 1 },
        { q: 'Adding a "title card" at the start (say the title, wait 3 secs before drawing) is similar to what film technique?', options: ['A plot twist', 'An opening title sequence', 'A credits roll', 'A cliffhanger ending'], answer: 1 },
      ],
    },
  ],
},


  // ---- COURSE 5: Sprite Adventures (Y4 Advanced Sprites) ----
  {
    id: 'y4-sprite-adventures',
    title: 'Sprite Adventures',
    description: 'Take your sprite skills to the next level! Create advanced animations, sprite-based physics, interactive stories with multiple endings, and polished mini-games.',
    icon: '🌟',
    color: '#14b8a6',
    yearGroup: 4,
    difficulty: 'Year 4',
    lessons: 24,
    duration: '12 hours',
    progress: 0,
    topics: ['Advanced Animation', 'Physics', 'Scrolling', 'Parallax', 'Multi-sprite Games', 'Custom Blocks'],
    modules: [
      {
        title: 'Custom Blocks (My Blocks)',
        completed: false,
        xp: 60,
        content: {
          explanation: 'CUSTOM BLOCKS (also called "My Blocks") let you create your own reusable code blocks! Instead of copying the same code many times, define it once as a custom block and use it wherever you need it.\n\nCustom blocks can also take INPUTS (parameters). For example, "draw polygon (sides) (size)" — you define the code once, and call it with different values each time!',
          example: '// Define a custom block with inputs\ndefine draw polygon (sides) (size) {\n  repeat (sides) {\n    move(size)\n    turn(360 / sides)\n  }\n}\n\n// Use it many times with different inputs!\npen down\ndraw polygon 3 100   // triangle\nmove(150)\ndraw polygon 5 80    // pentagon\nmove(150)\ndraw polygon 8 60    // octagon',
          activity: 'Create a custom block called "draw star" that takes a (size) input. Use your custom block to draw 5 stars of different sizes spread across the stage!',
          keyWords: ['custom block', 'my blocks', 'define', 'reusable', 'parameter', 'input'],
        },
        quiz: [
          { q: 'What is a custom block?', options: ['A pre-made block from the library', 'A reusable block you define yourself', 'A type of sprite', 'A debugging tool'], answer: 1 },
          { q: 'Why use custom blocks?', options: ['They look cool', 'You can reuse code without copying it', 'They make code slower', 'They only work once'], answer: 1 },
          { q: 'What is a parameter in a custom block?', options: ['A type of bug', 'An input value that can change each time you use the block', 'A sound effect', 'A backdrop'], answer: 1 },
        ],
      },
      {
        title: 'Smooth Animation Techniques',
        completed: false,
        xp: 65,
        content: {
          explanation: 'Professional animations use EASING — starting slow, speeding up, then slowing down. This looks much more natural than constant-speed movement. You can create easing by changing the speed variable each frame.\n\nAnother technique is TWEENING: smoothly transitioning between two values over time. Instead of jumping from size 50 to size 100, gradually increase it each frame.',
          example: '// Ease-out movement (fast start, slow end)\nset targetX to 200\nforever {\n  set dx to (targetX - x position) / 10\n  change x by dx\n  // Gets closer each frame but slows down!\n}\n\n// Smooth size tween\nset targetSize to 200\nrepeat 30 {\n  set currentSize to size\n  set diff to (targetSize - currentSize) / 5\n  change size by diff\n  wait(0.03)\n}\n\n// Bounce animation\nset bounceHeight to 0\nforever {\n  change bounceHeight by -2  // gravity\n  change y by bounceHeight\n  if y < -140 {\n    set y to -140\n    set bounceHeight to (bounceHeight * -0.8) // bounce with energy loss\n  }\n}',
          activity: 'Create a ball sprite that bounces realistically: it falls with gravity, bounces when it hits the ground, and each bounce is slightly lower than the last (energy loss). Add a shadow that moves with the ball!',
          keyWords: ['easing', 'tween', 'smooth', 'bounce', 'physics', 'natural'],
        },
        quiz: [
          { q: 'What is easing?', options: ['Moving at constant speed', 'Gradually changing speed for natural-looking movement', 'Stopping suddenly', 'Moving backwards'], answer: 1 },
          { q: 'How do you make a bounce lose energy?', options: ['Multiply bounce height by a number less than 1', 'Add 100 to the height', 'Delete the sprite', 'Change the backdrop'], answer: 0 },
          { q: 'What is tweening?', options: ['A type of sprite', 'Smoothly transitioning between two values over time', 'A coding error', 'A sound effect'], answer: 1 },
        ],
      },
      {
        title: 'Gravity & Platformer Physics',
        completed: false,
        xp: 80,
        content: {
          explanation: 'Platformer games use GRAVITY to pull the player down and JUMPING to push them up. The key is a "yVelocity" variable: gravity decreases it each frame (pulling down), and jumping sets it to a positive value (pushing up).\n\nThe player should only be able to jump when ON THE GROUND — otherwise they could fly! Check if the sprite is touching the ground colour before allowing a jump.',
          example: '// Platformer physics\nset yVelocity to 0\nset gravity to -1\nset jumpPower to 15\nset onGround to false\n\nforever {\n  // Apply gravity\n  change yVelocity by gravity\n  change y by yVelocity\n  \n  // Ground check\n  if touching colour "brown" {\n    set onGround to true\n    set yVelocity to 0\n    // Push out of ground\n    repeat until not touching colour "brown" {\n      change y by 1\n    }\n  } else {\n    set onGround to false\n  }\n  \n  // Jump (only if on ground)\n  if key "space" pressed and onGround {\n    set yVelocity to jumpPower\n    play sound "jump"\n  }\n  \n  // Left/right movement\n  if key "right" pressed { change x by 5 }\n  if key "left" pressed { change x by -5 }\n}',
          activity: 'Build a platformer with: gravity, smooth jumping, platforms to land on (drawn with specific colours), and left/right movement. The player should be able to jump between 3 platforms of different heights!',
          keyWords: ['gravity', 'velocity', 'jump', 'platform', 'physics', 'ground'],
        },
        quiz: [
          { q: 'What does gravity do to yVelocity?', options: ['Increases it upward', 'Decreases it (pulls down) each frame', 'Sets it to zero', 'Doubles it'], answer: 1 },
          { q: 'When should the player be allowed to jump?', options: ['Always', 'Only when on the ground', 'Never', 'Only when score is high'], answer: 1 },
          { q: 'What variable controls how high the player jumps?', options: ['gravity', 'x position', 'jumpPower', 'score'], answer: 2 },
        ],
      },
      {
        title: 'Scrolling Backgrounds',
        completed: false,
        xp: 75,
        content: {
          explanation: 'In professional games, the camera follows the player! Instead of the player moving across a fixed stage, the BACKGROUND moves while the player stays near the centre. This creates the illusion of a much larger world.\n\nYou can also create PARALLAX scrolling: the foreground moves fast and the background moves slowly, creating a 3D depth effect!',
          example: '// Simple horizontal scrolling\n// Background sprite moves opposite to player input\nforever {\n  if key "right" pressed {\n    Background: change x by -3   // background moves left\n    Platforms: change x by -3  // platforms move too\n  }\n  if key "left" pressed {\n    Background: change x by 3\n    Platforms: change x by 3\n  }\n}\n\n// Parallax: multiple layers at different speeds\n// Far background: change x by -1\n// Mid background: change x by -2\n// Foreground: change x by -3\n// This creates depth!',
          activity: 'Create a side-scrolling scene with parallax: draw 3 background layers (sky, hills, ground). When the player presses right, move the sky slowly, hills medium, and ground fast. It should feel like a real 3D world!',
          keyWords: ['scroll', 'parallax', 'camera', 'background', 'depth', 'layer'],
        },
        quiz: [
          { q: 'What is scrolling?', options: ['Zooming in', 'Moving the background to create the illusion of a larger world', 'Spinning the sprite', 'Changing backdrops'], answer: 1 },
          { q: 'What is parallax?', options: ['A type of sprite', 'Layers moving at different speeds to create depth', 'A coding language', 'A sound effect'], answer: 1 },
          { q: 'In parallax, which layer moves fastest?', options: ['The farthest away', 'The middle layer', 'The closest (foreground)', 'All move at the same speed'], answer: 2 },
        ],
      },
      {
        title: 'Power-ups & Items',
        completed: false,
        xp: 70,
        content: {
          explanation: 'POWER-UPS make games exciting by giving the player temporary abilities! Speed boosts, shields, score multipliers, and extra lives are all classic power-ups.\n\nPower-ups should be temporary — use a timer variable that counts down. When it reaches 0, the effect ends. Make power-ups rare and visually distinct so players get excited when they appear!',
          example: '// Speed boost power-up\nif touching "Speed Star" {\n  set speed to 10          // double speed!\n  set speedTimer to 150     // lasts 5 seconds (at 30 fps)\n  play sound "powerup"\n  Speed Star: hide\n}\n\n// Timer countdown\nforever {\n  if speedTimer > 0 {\n    change speedTimer by -1\n    // Visual indicator\n    set colour effect to 30\n    if speedTimer = 0 {\n      set speed to 5    // back to normal\n      clear graphic effects\n    }\n  }\n}\n\n// Shield power-up\nif touching "Shield" {\n  set shielded to true\n  set shieldTimer to 200\n}\n// When shielded, ignore enemy collisions!',
          activity: 'Add 3 power-ups to your game: Speed Boost (+speed for 5 seconds), Shield (invincible for 3 seconds), and Score Multiplier (double points for 4 seconds). Each should have a visual effect and a timer!',
          keyWords: ['power-up', 'boost', 'temporary', 'timer', 'ability', 'shield'],
        },
        quiz: [
          { q: 'How long should power-ups last?', options: ['Forever', 'A temporary duration using a timer', 'Exactly 1 second', 'Until the game ends'], answer: 1 },
          { q: 'Why should power-ups be rare?', options: ['To make the game harder', 'So players get excited and strategic about using them', 'They should not be rare', 'To save memory'], answer: 1 },
          { q: 'How do you track when a power-up expires?', options: ['You cannot track it', 'Use a countdown timer variable', 'Check the score', 'Ask the player'], answer: 1 },
        ],
      },
      {
        title: 'Project: Platformer Adventure',
        completed: false,
        xp: 200,
        content: {
          explanation: 'Build a platformer adventure game! Your game needs: gravity-based jumping, at least 5 platforms at different heights, collectibles, enemies, a power-up, scrolling background, levels, score/lives tracking, and polished game states.\n\nThis is a BIG project — plan carefully, build one feature at a time, and test frequently!',
          example: '// Platformer Checklist:\n// [x] Gravity and smooth jumping\n// [x] At least 5 platforms\n// [x] Collectible items (+points)\n// [x] 2 enemy types (patrol + chase)\n// [x] 1 power-up with timer\n// [x] Scrolling background\n// [x] 3 levels with increasing difficulty\n// [x] Score, lives, and level display\n// [x] Title screen and game over\n// [x] Sound effects and visual polish',
          activity: 'Build the complete platformer adventure! Work through the checklist one feature at a time. Test after adding each feature. Get friends to playtest and give feedback!',
          keyWords: ['platformer', 'adventure', 'project', 'complete', 'polished'],
        },
        quiz: [
          { q: 'What physics does a platformer need?', options: ['Only left/right movement', 'Gravity, velocity, and jumping', 'No physics', 'Only falling'], answer: 1 },
          { q: 'How should you approach building a big game?', options: ['Code everything at once', 'Build one feature at a time and test frequently', 'Copy someone else\'s game', 'Hope it works first try'], answer: 1 },
        ],
      },
    ],
  },

  // ---- COURSE 6: My First Website (Y4) ----
  {
    id: 'y4-web-basics',
    title: 'My First Website',
    description: 'Learn HTML and CSS to build real web pages from scratch! Create your own personal website with images, links, layouts, and beautiful styling.',
    icon: '🌐',
    color: '#06b6d4',
    yearGroup: 4,
    difficulty: 'Year 4',
    lessons: 24,
    duration: '12 hours',
    progress: 0,
    topics: ['HTML', 'CSS', 'Headings', 'Paragraphs', 'Styling', 'Layout', 'Links', 'Images'],
    modules: [
      {
        title: 'What is a Website?',
        completed: false,
        xp: 45,
        content: {
          explanation: 'Websites are made of two main languages: HTML (the structure and content) and CSS (the colours, fonts, and layout). HTML uses TAGS like <h1>, <p>, and <img> to tell the browser WHAT to show. CSS tells the browser HOW it should look.\n\nThink of HTML as the skeleton of a building, and CSS as the paint, furniture, and decorations. Every website you visit — Google, YouTube, BBC — is built with HTML and CSS!',
          example: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello World!</h1>\n    <p>This is my very first web page.</p>\n    <p>I built this with HTML!</p>\n  </body>\n</html>',
          activity: 'Create your first web page with a title, a large heading (h1), and two paragraphs about yourself. Open it in the preview panel and see your creation!',
          keyWords: ['HTML', 'CSS', 'website', 'tag', 'browser', 'page'],
        },
        quiz: [
          { q: 'What does HTML control?', options: ['The colours and fonts', 'The structure and content of a page', 'How fast the page loads', 'The sounds on a page'], answer: 1 },
          { q: 'What does CSS control?', options: ['The structure', 'The appearance — colours, fonts, spacing', 'The page address', 'The content text'], answer: 1 },
          { q: 'Which tag creates the biggest heading?', options: ['<p>', '<h6>', '<h1>', '<title>'], answer: 2 },
        ],
      },
      {
        title: 'HTML Tags & Elements',
        completed: false,
        xp: 55,
        content: {
          explanation: 'HTML tags come in pairs: an opening tag <p> and a closing tag </p>. The content goes between them to form an ELEMENT. Some important tags:\n\n- <h1> to <h6>: Headings (biggest to smallest)\n- <p>: Paragraph of text\n- <ul> and <li>: Bullet lists\n- <ol> and <li>: Numbered lists\n- <strong>: Bold text\n- <em>: Italic text\n- <br>: Line break (no closing tag needed)',
          example: '<h1>About Me</h1>\n<h2>My Hobbies</h2>\n<p>I love <strong>coding</strong> and <em>reading</em>!</p>\n\n<h3>My Favourites:</h3>\n<ul>\n  <li>Colour: Blue</li>\n  <li>Food: Pizza</li>\n  <li>Sport: Football</li>\n</ul>\n\n<h3>Top 3 Games:</h3>\n<ol>\n  <li>Minecraft</li>\n  <li>Roblox</li>\n  <li>Mario Kart</li>\n</ol>',
          activity: 'Build an "About Me" page with: an h1 title, an h2 subtitle, 3 paragraphs (with bold and italic), a bullet list of hobbies, and a numbered list of top 3 favourite things.',
          keyWords: ['tag', 'element', 'heading', 'paragraph', 'list', 'bold', 'italic'],
        },
        quiz: [
          { q: 'What is the closing tag for <h1>?', options: ['<h1/>', '</h1>', '<close h1>', '<end>'], answer: 1 },
          { q: 'Which tag makes a bullet list?', options: ['<ol>', '<ul>', '<li>', '<list>'], answer: 1 },
          { q: 'What does <strong> do?', options: ['Makes text italic', 'Makes text bold', 'Makes text bigger', 'Makes text coloured'], answer: 1 },
        ],
      },
      {
        title: 'CSS: Adding Colour & Style',
        completed: false,
        xp: 65,
        content: {
          explanation: 'CSS rules change how HTML elements look. Each rule has a SELECTOR (which elements to style) and PROPERTIES (what to change). You write CSS inside a <style> tag in the <head>, or in a separate .css file.\n\nCommon CSS properties:\n- color: text colour\n- background-color: background colour\n- font-size: text size in pixels\n- font-family: the font to use\n- text-align: left, centre, or right',
          example: '<style>\n  body {\n    background-color: #f0f4ff;\n    font-family: Arial, sans-serif;\n  }\n  \n  h1 {\n    color: #6366f1;\n    font-size: 36px;\n    text-align: center;\n  }\n  \n  p {\n    color: #333;\n    font-size: 16px;\n    line-height: 1.6;\n  }\n  \n  .highlight {\n    color: #ef4444;\n    font-weight: bold;\n  }\n</style>',
          activity: 'Style your About Me page: give the body a background colour, change the heading colour and font, style paragraphs with a readable font size, and create a CSS class called "highlight" for important words.',
          keyWords: ['CSS', 'style', 'colour', 'font', 'property', 'selector', 'class'],
        },
        quiz: [
          { q: 'What does the CSS property "color" change?', options: ['The background', 'The text colour', 'The font size', 'The page title'], answer: 1 },
          { q: 'Where do you write CSS?', options: ['In the <body>', 'In a <style> tag in the <head>, or a .css file', 'In a <p> tag', 'In the browser address bar'], answer: 1 },
          { q: 'What does "text-align: center" do?', options: ['Makes text bold', 'Centres text horizontally', 'Changes the font', 'Adds a border'], answer: 1 },
        ],
      },
      {
        title: 'The Box Model & Layout',
        completed: false,
        xp: 70,
        content: {
          explanation: 'Every HTML element is a BOX! The CSS Box Model has 4 layers:\n\n1. CONTENT — the text or image inside\n2. PADDING — space between content and border\n3. BORDER — a visible line around the element\n4. MARGIN — space between this element and others\n\nUnderstanding the box model is KEY to making beautiful, well-spaced layouts!',
          example: '.card {\n  /* Content properties */\n  width: 300px;\n  \n  /* Padding: space inside */\n  padding: 20px;\n  \n  /* Border: visible outline */\n  border: 2px solid #6366f1;\n  border-radius: 12px;\n  \n  /* Margin: space outside */\n  margin: 16px;\n  \n  /* Extra styling */\n  background-color: white;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n}',
          activity: 'Create 3 styled cards on your page. Each card should have padding, a coloured border with rounded corners, margin between them, and a box shadow. Put a heading and text inside each card.',
          keyWords: ['box model', 'padding', 'margin', 'border', 'layout', 'spacing'],
        },
        quiz: [
          { q: 'What is padding?', options: ['Space outside an element', 'Space between content and border', 'The border width', 'A type of font'], answer: 1 },
          { q: 'What is margin?', options: ['Space inside an element', 'The border colour', 'Space outside an element, between it and others', 'The font size'], answer: 2 },
          { q: 'What does border-radius do?', options: ['Changes the border colour', 'Rounds the corners', 'Adds a shadow', 'Changes the font'], answer: 1 },
        ],
      },
      {
        title: 'Images & Links',
        completed: false,
        xp: 60,
        content: {
          explanation: 'Images use the <img> tag with a "src" attribute (the image location) and an "alt" attribute (description for accessibility). Links use the <a> tag with an "href" attribute (where the link goes).\n\nAlways add alt text to images — it helps visually impaired users and search engines understand your page. Links can go to other pages, other websites, or sections within the same page!',
          example: '<!-- Image -->\n<img src="photo.jpg" alt="A beautiful sunset" width="400">\n\n<!-- Link to another page -->\n<a href="about.html">Go to About Page</a>\n\n<!-- Link to a website -->\n<a href="https://example.com" target="_blank">Visit Example</a>\n\n<!-- Image as a link -->\n<a href="gallery.html">\n  <img src="thumbnail.jpg" alt="View gallery">\n</a>\n\n<!-- CSS for links -->\na {\n  color: #6366f1;\n  text-decoration: none;\n}\na:hover {\n  text-decoration: underline;\n}',
          activity: 'Add at least 2 images and 3 links to your website. Style the links to change colour when hovered. Create a second HTML page and link between the two pages!',
          keyWords: ['image', 'link', 'src', 'href', 'alt', 'accessibility', 'navigation'],
        },
        quiz: [
          { q: 'What attribute tells the browser where to find an image?', options: ['href', 'alt', 'src', 'class'], answer: 2 },
          { q: 'Why add alt text to images?', options: ['It looks pretty', 'For accessibility and search engines', 'It changes the image', 'Alt text is optional and useless'], answer: 1 },
          { q: 'What does <a href="..."> create?', options: ['An image', 'A paragraph', 'A clickable link', 'A heading'], answer: 2 },
        ],
      },
      {
        title: 'Project: Personal Website',
        completed: false,
        xp: 160,
        content: {
          explanation: 'Build a complete PERSONAL WEBSITE with at least 3 pages! Include a home page, about page, and gallery or hobbies page. Use consistent styling, navigation links between pages, images, and the CSS techniques you have learned.\n\nThis is YOUR website — make it reflect who you are and what you care about!',
          example: '<!-- Navigation bar (same on every page) -->\n<nav>\n  <a href="index.html">Home</a>\n  <a href="about.html">About Me</a>\n  <a href="hobbies.html">Hobbies</a>\n  <a href="gallery.html">Gallery</a>\n</nav>\n\n<!-- Consistent CSS across all pages -->\nnav {\n  background-color: #6366f1;\n  padding: 16px;\n  text-align: center;\n}\nnav a {\n  color: white;\n  margin: 0 16px;\n  text-decoration: none;\n  font-weight: bold;\n}',
          activity: 'Build a 3+ page personal website with: navigation on every page, consistent styling, at least 4 images, styled cards, and pages about yourself, your hobbies, and your interests. Make it look professional!',
          keyWords: ['website', 'personal', 'navigation', 'multi-page', 'project'],
        },
        quiz: [
          { q: 'What should appear on EVERY page of a website?', options: ['A different style each time', 'Navigation links to other pages', 'The same paragraph of text', 'A video'], answer: 1 },
          { q: 'How many pages should your website have?', options: ['Just 1', 'At least 3', 'Exactly 10', 'As few as possible'], answer: 1 },
        ],
      },
    ],
  },


  /* ====== YEAR 5 - Ages 9-10 ====== */

  // ---- COURSE 7: Advanced Game Design (Y5) ----
  {
    id: 'y5-advanced-games',
    title: 'Advanced Game Design',
    description: 'Master professional game development techniques! Multiplayer mechanics, save systems, procedural generation, polished UI, and complex AI. Build games that rival real indie titles!',
    icon: '🕹️',
    color: '#8b5cf6',
    yearGroup: 5,
    difficulty: 'Year 5',
    lessons: 30,
    duration: '15 hours',
    progress: 0,
    topics: ['Functions', 'Clones', 'Gravity', 'AI', 'Procedural Generation', 'Save System', 'UI'],
    modules: [
      {
        title: 'Functions & Clean Code',
        completed: false,
        xp: 60,
        content: {
          explanation: 'As games get bigger, keeping code ORGANISED is essential. Functions (custom blocks with clear names) help you break complex logic into manageable pieces.\n\nGood code reads like English: "handlePlayerMovement()", "spawnEnemy()", "checkCollisions()", "updateScore()". This makes bugs easier to find and code easier to change later.',
          example: '// Bad: everything in one huge forever loop\nforever {\n  // 100 lines of mixed-up code...\n}\n\n// Good: clean, organised functions\ndefine handleMovement() {\n  if key "right" pressed { change x by speed }\n  if key "left" pressed { change x by (speed * -1) }\n  applyGravity()\n}\n\ndefine applyGravity() {\n  change yVelocity by -1\n  change y by yVelocity\n  checkGroundCollision()\n}\n\ndefine checkGroundCollision() {\n  if touching colour "brown" {\n    set yVelocity to 0\n    set onGround to true\n  }\n}\n\n// Main loop is now clean!\nforever {\n  handleMovement()\n  checkCollisions()\n  updateUI()\n}',
          activity: 'Refactor (reorganise) one of your previous games to use clean functions. Create at least 5 custom blocks with descriptive names, and make the main forever loop only 5-6 lines long!',
          keyWords: ['function', 'organise', 'clean code', 'refactor', 'readable', 'maintainable'],
        },
        quiz: [
          { q: 'Why use functions in big projects?', options: ['They make the code longer', 'They organise code into manageable, reusable pieces', 'They are not useful', 'They slow down the game'], answer: 1 },
          { q: 'What does "refactor" mean?', options: ['Delete the code', 'Reorganise code to be cleaner without changing what it does', 'Add more features', 'Start over completely'], answer: 1 },
          { q: 'What makes a good function name?', options: ['A single letter like "f"', 'A descriptive name like "handleMovement"', 'A random number', 'It does not matter'], answer: 1 },
        ],
      },
      {
        title: 'Clone Systems',
        completed: false,
        xp: 75,
        content: {
          explanation: 'CLONES are copies of a sprite that you create with code. Instead of making 50 coin sprites by hand, create ONE coin and CLONE it! Clones are essential for: bullets, enemies that spawn, particles, collectibles, and anything you need many of.\n\nEach clone is independent — it has its own position, variables, and behaviour. When you do not need a clone anymore, DELETE it to keep performance smooth.',
          example: '// Spawn enemies using clones\nwhen green flag clicked {\n  forever {\n    create clone of myself\n    wait(spawnRate)  // gets faster at higher levels\n  }\n}\n\nwhen I start as a clone {\n  go to x: 240 y: random(-170, 170)\n  show\n  forever {\n    change x by (enemySpeed * -1)\n    if touching "Player" {\n      broadcast "player hit"\n      delete this clone\n    }\n    if x < -240 {\n      change score by 1   // dodged!\n      delete this clone\n    }\n  }\n}\n\n// Particle effect with clones\ndefine spawnParticles(count) {\n  repeat count {\n    create clone of "Particle"\n  }\n}\n\n// Particle clone behaviour\nwhen I start as a clone {\n  point in direction random(1, 360)\n  set size to random(20, 60)\n  repeat 20 {\n    move(3)\n    change ghost effect by 5\n    change size by -2\n  }\n  delete this clone\n}',
          activity: 'Build a space shooter: the player shoots bullet clones upward, and enemy clones spawn from the top moving downward. When a bullet hits an enemy, both are deleted and score increases. Add particle explosion clones!',
          keyWords: ['clone', 'spawn', 'create', 'delete', 'independent', 'particle'],
        },
        quiz: [
          { q: 'What are clones?', options: ['Copies of a backdrop', 'Copies of a sprite created with code', 'A type of variable', 'A sound effect'], answer: 1 },
          { q: 'Why delete clones you no longer need?', options: ['It does not matter', 'To keep the game running smoothly (performance)', 'Because they are always broken', 'To make the score higher'], answer: 1 },
          { q: 'When does clone code run?', options: ['When the green flag is clicked', 'When I start as a clone', 'When the game ends', 'When you press space'], answer: 1 },
        ],
      },
      {
        title: 'Procedural Generation',
        completed: false,
        xp: 85,
        content: {
          explanation: 'PROCEDURAL GENERATION means using code to create content RANDOMLY — so the game is different every time! Instead of hand-designing every level, you write rules for how levels should be generated.\n\nExamples: random terrain in Minecraft, random dungeon layouts, random enemy waves, random item placement. This gives your games INFINITE replayability!',
          example: '// Random terrain generation\nwhen green flag clicked {\n  set terrainX to -240\n  set terrainY to -50\n  \n  // Generate random terrain\n  repeat 24 {\n    create clone of "Ground Block"\n    set terrainX to terrainX + 20\n    // Random height changes\n    set terrainY to terrainY + random(-20, 20)\n    // Keep within bounds\n    if terrainY > 0 { set terrainY to 0 }\n    if terrainY < -100 { set terrainY to -100 }\n  }\n}\n\n// Random enemy wave\ndefine spawnWave(numEnemies) {\n  repeat numEnemies {\n    // Random type: 1=patrol, 2=chase, 3=shooter\n    set enemyType to random(1, 3)\n    create clone of "Enemy"\n    wait(0.5)\n  }\n}',
          activity: 'Create a game with procedurally generated content: each time you play, the platforms, enemies, and collectibles should be in different random positions. The game should feel like a new experience every time!',
          keyWords: ['procedural', 'random', 'generate', 'infinite', 'replayability', 'algorithm'],
        },
        quiz: [
          { q: 'What is procedural generation?', options: ['Designing every level by hand', 'Using code and randomness to create content', 'Copying other games', 'A type of sprite'], answer: 1 },
          { q: 'What is the main benefit of procedural generation?', options: ['The game looks worse', 'Every playthrough is different (infinite replayability)', 'It saves storage', 'It is easier to code'], answer: 1 },
          { q: 'Name one game that uses procedural generation', options: ['Super Mario (original)', 'Minecraft', 'Pac-Man', 'Tetris'], answer: 1 },
        ],
      },
      {
        title: 'Advanced AI: State Machines',
        completed: false,
        xp: 90,
        content: {
          explanation: 'A STATE MACHINE gives enemies different MODES of behaviour. Instead of always doing the same thing, enemies switch between states based on conditions.\n\nFor example, a guard enemy has 3 states:\n- IDLE: stand still, look around\n- ALERT: player detected, start chasing\n- ATTACK: close enough to strike\n\nThis creates much more realistic and challenging enemy behaviour!',
          example: '// Enemy state machine\nset enemyState to "idle"\n\nforever {\n  set distToPlayer to distance to "Player"\n  \n  if enemyState = "idle" {\n    // Stand still, look around\n    turn(1)\n    if distToPlayer < 200 {\n      set enemyState to "alert"\n      say("!")\n    }\n  }\n  \n  if enemyState = "alert" {\n    // Chase the player\n    point towards "Player"\n    move(3)\n    if distToPlayer < 50 {\n      set enemyState to "attack"\n    }\n    if distToPlayer > 300 {\n      set enemyState to "idle"  // lost the player\n      say("?")\n    }\n  }\n  \n  if enemyState = "attack" {\n    // Attack!\n    say("ATTACK!")\n    broadcast "player damage"\n    wait(1)\n    set enemyState to "alert"\n  }\n}',
          activity: 'Create a guard enemy with 3 states: IDLE (wanders slowly), ALERT (chases when player is near), ATTACK (damages player when very close). Add visual indicators for each state (speech bubbles, colour changes)!',
          keyWords: ['state machine', 'AI', 'idle', 'alert', 'attack', 'behaviour', 'mode'],
        },
        quiz: [
          { q: 'What is a state machine?', options: ['A type of computer', 'A system where behaviour changes based on conditions', 'A random number generator', 'A sprite costume'], answer: 1 },
          { q: 'What might cause an enemy to switch from "idle" to "alert"?', options: ['Nothing', 'The player getting close enough', 'The score reaching 100', 'A timer running out'], answer: 1 },
          { q: 'Why are state machines better than simple AI?', options: ['They are not better', 'They create more realistic, varied behaviour', 'They use fewer blocks', 'They are simpler'], answer: 1 },
        ],
      },
      {
        title: 'UI Design & HUD',
        completed: false,
        xp: 70,
        content: {
          explanation: 'A game\'s UI (User Interface) or HUD (Heads-Up Display) shows the player important information: score, health bar, mini-map, inventory, and messages. Good UI is clear, unobtrusive, and visually appealing.\n\nCreate UI elements as separate sprites on the top layer. Use custom blocks to update them dynamically based on game variables.',
          example: '// Health bar using a sprite\nwhen green flag clicked {\n  go to x: -200 y: 170\n  set size to 100%\n  go to front layer\n  forever {\n    // Resize based on health\n    set size to (health * 2) %  // 50 health = 100% width\n    // Colour based on health\n    if health > 60 {\n      set colour to "green"\n    } else if health > 30 {\n      set colour to "yellow"\n    } else {\n      set colour to "red"\n    }\n  }\n}\n\n// Floating text message\ndefine showMessage(text, duration) {\n  MessageSprite: show\n  MessageSprite: say(text)\n  wait(duration)\n  MessageSprite: hide\n}\n\n// Usage:\nshowMessage("Level Complete!", 3)\nshowMessage("New high score!", 2)',
          activity: 'Design a complete HUD for your game: health bar (changes colour based on amount), score display, level indicator, a mini timer, and a floating message system that shows alerts like "Level Up!" or "New High Score!".',
          keyWords: ['UI', 'HUD', 'health bar', 'interface', 'display', 'design'],
        },
        quiz: [
          { q: 'What does HUD stand for?', options: ['Huge Ugly Display', 'Heads-Up Display', 'Hard to Understand Data', 'High Ultra Definition'], answer: 1 },
          { q: 'Where should UI elements appear?', options: ['Behind all sprites', 'On the front layer so they are always visible', 'Only in menus', 'Nowhere'], answer: 1 },
          { q: 'Why should a health bar change colour?', options: ['To look pretty', 'To quickly show the player how much health remains', 'It should not change colour', 'To confuse the player'], answer: 1 },
        ],
      },
      {
        title: 'Save System & High Scores',
        completed: false,
        xp: 80,
        content: {
          explanation: 'Players love beating records! A HIGH SCORE system saves the best score even after the game is closed. In block-based coding, you can use CLOUD variables (stored on the server) to create global leaderboards.\n\nFor local saves, you can store data in lists and variables that persist between sessions. Track: best score, fastest time, highest level reached!',
          example: '// High score system\nwhen green flag clicked {\n  // Load high score (stored in cloud or local variable)\n  if score > highScore {\n    set highScore to score\n    say("New high score: " + highScore + "!")\n    play sound "fanfare"\n  }\n}\n\n// Top 5 leaderboard using a list\nwhen green flag clicked {\n  // Check if score qualifies\n  if length of "Top Scores" < 5 or score > item(5) of "Top Scores" {\n    add score to "Top Scores"\n    sort "Top Scores" descending\n    if length of "Top Scores" > 5 {\n      delete item 6 of "Top Scores"\n    }\n  }\n}\n\n// Display leaderboard\ndefine showLeaderboard() {\n  repeat length of "Top Scores" {\n    say(item(i) of "Top Scores")\n  }\n}',
          activity: 'Add a high score system to your game: save the top 5 scores in a list. After each game, check if the score qualifies and insert it in the right position. Display the leaderboard on the game over screen!',
          keyWords: ['save', 'high score', 'leaderboard', 'cloud', 'persist', 'record'],
        },
        quiz: [
          { q: 'What is a high score system?', options: ['A type of enemy', 'A way to save and display the best scores', 'A sound effect', 'A background image'], answer: 1 },
          { q: 'How do you keep a top 5 leaderboard?', options: ['Delete all scores', 'Sort scores and remove any below the top 5', 'Only save one score', 'It is impossible'], answer: 1 },
          { q: 'Why do players enjoy high scores?', options: ['They do not', 'It motivates them to improve and replay', 'It makes the game slower', 'To fill the screen'], answer: 1 },
        ],
      },
      {
        title: 'Multiplayer Mechanics',
        completed: false,
        xp: 85,
        content: {
          explanation: 'Two-player games on the same computer use SPLIT CONTROLS: Player 1 uses arrow keys, Player 2 uses WASD. Each player has their own sprite, score, and lives.\n\nYou can make cooperative games (work together), competitive games (compete against each other), or a mix of both!',
          example: '// Player 1: Arrow keys\nforever {\n  if key "right" pressed { P1: change x by 5 }\n  if key "left" pressed { P1: change x by -5 }\n  if key "up" pressed { P1: change y by 5 }\n  if key "down" pressed { P1: change y by -5 }\n}\n\n// Player 2: WASD keys\nforever {\n  if key "d" pressed { P2: change x by 5 }\n  if key "a" pressed { P2: change x by -5 }\n  if key "w" pressed { P2: change y by 5 }\n  if key "s" pressed { P2: change y by -5 }\n}\n\n// Competitive: separate scores\nset P1_score to 0\nset P2_score to 0\n\n// Cooperative: shared health\nset teamHealth to 100',
          activity: 'Build a 2-player game! Player 1 uses arrows, Player 2 uses WASD. They can either cooperate (collect items together) or compete (race to collect the most). Track separate scores and declare a winner!',
          keyWords: ['multiplayer', 'two-player', 'WASD', 'cooperative', 'competitive', 'split controls'],
        },
        quiz: [
          { q: 'What keys does Player 2 typically use?', options: ['Arrow keys', 'WASD', 'Number keys', 'Function keys'], answer: 1 },
          { q: 'What is a cooperative game?', options: ['Players compete against each other', 'Players work together toward a common goal', 'A single-player game', 'A game with no rules'], answer: 1 },
          { q: 'What does each player need their own of?', options: ['Computer', 'Sprite, controls, score, and lives', 'Keyboard', 'Screen'], answer: 1 },
        ],
      },
      {
        title: 'Project: Polished Indie Game',
        completed: false,
        xp: 250,
        content: {
          explanation: 'Build a polished, professional-quality game that you would be proud to publish! It should include ALL the techniques from this course: clean functions, clone systems, a state machine enemy, procedural generation, a full HUD, high score system, and multiplayer or advanced single-player mechanics.\n\nSpend time PLAYTESTING and POLISHING. The difference between a good game and a great game is in the small details!',
          example: '// Professional Game Checklist:\n// [x] Clean code with functions\n// [x] Clone-based enemies and projectiles\n// [x] At least 1 enemy with state machine AI\n// [x] Procedurally generated elements\n// [x] Full HUD (health, score, level, messages)\n// [x] High score / save system\n// [x] 2-player option OR advanced single-player\n// [x] 5+ levels with progression\n// [x] Menu system (title, pause, game over)\n// [x] 8+ sound effects and music\n// [x] Extensive game juice and polish',
          activity: 'Create your polished indie game! Spend several sessions building, testing, and refining. Have at least 3 people playtest and give feedback. Fix issues and add polish based on feedback.',
          keyWords: ['indie', 'professional', 'polished', 'publish', 'playtest', 'quality'],
        },
        quiz: [
          { q: 'What separates a good game from a great game?', options: ['More code', 'Attention to small details and polish', 'More sprites', 'A longer title'], answer: 1 },
          { q: 'Why get others to playtest?', options: ['They will find bugs and issues you missed', 'To show off', 'It is not useful', 'To waste their time'], answer: 0 },
          { q: 'How many times should you test your game?', options: ['Once', 'Twice', 'Many times throughout development', 'Never'], answer: 2 },
        ],
      },
    ],
  },

  // ---- COURSE 8: Python Beginner (Y5) ----
  {
    id: 'y5-python-basics',
    title: 'Python Beginner',
    description: 'Start your Python journey! Write real text-based programs, learn variables, data types, conditionals, loops, functions, and lists. Python is used by millions of professional developers!',
    icon: '🐍',
    color: '#22c55e',
    yearGroup: 5,
    difficulty: 'Year 5',
    lessons: 30,
    duration: '15 hours',
    progress: 0,
    topics: ['Python', 'Variables', 'Data Types', 'If Statements', 'Loops', 'Functions', 'Lists', 'Input/Output'],
    modules: [
      {
        title: 'Hello Python!',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Python is one of the most popular programming languages in the world! It is used by Google, NASA, Netflix, and millions of developers. Unlike block-based coding, Python uses TEXT — you type out your instructions.\n\nThe print() function displays text on the screen. Whatever you put inside the brackets (in quotes) will be shown. This is your first Python command!',
          example: '# Your first Python program!\nprint("Hello, World!")\nprint("My name is Alex")\nprint("I am learning Python!")\n\n# You can print numbers too\nprint(42)\nprint(3.14)\n\n# And calculations!\nprint(10 + 5)\nprint(100 - 37)\nprint("10 + 5 =", 10 + 5)',
          activity: 'Write a Python program that prints: your name, your age, your favourite food, and a fun fact about yourself. Use at least 5 print() statements!',
          keyWords: ['Python', 'print', 'text-based', 'programming', 'output', 'language'],
        },
        quiz: [
          { q: 'What does print() do in Python?', options: ['Prints on paper', 'Displays text on the screen', 'Creates a variable', 'Opens a file'], answer: 1 },
          { q: 'How do you print text in Python?', options: ['say("hello")', 'print("hello")', 'display("hello")', 'show("hello")'], answer: 1 },
          { q: 'Which companies use Python?', options: ['None', 'Only small companies', 'Google, NASA, Netflix and many more', 'Only schools'], answer: 2 },
        ],
      },
      {
        title: 'Variables & Data Types',
        completed: false,
        xp: 65,
        content: {
          explanation: 'VARIABLES store data in Python. You create them with the = sign. Python has several DATA TYPES:\n\n- str (string): Text — "Hello"\n- int (integer): Whole numbers — 42\n- float: Decimal numbers — 3.14\n- bool (boolean): True or False\n\nPython figures out the type automatically! You can check a variable\'s type with type().',
          example: '# String (text)\nname = "Alex"\nfavourite_colour = "blue"\n\n# Integer (whole number)\nage = 10\nscore = 0\n\n# Float (decimal number)\nheight = 1.45\npi = 3.14159\n\n# Boolean (True/False)\nis_student = True\nhas_pet = False\n\n# Print variables\nprint("Name:", name)\nprint("Age:", age)\nprint("Height:", height)\nprint("Student:", is_student)\n\n# Check types\nprint(type(name))    # <class \'str\'>\nprint(type(age))     # <class \'int\'>\nprint(type(height))  # <class \'float\'>',
          activity: 'Create variables for: your name (string), your age (integer), your height in metres (float), whether you like coding (boolean). Print each variable along with its type!',
          keyWords: ['variable', 'string', 'integer', 'float', 'boolean', 'type', 'assign'],
        },
        quiz: [
          { q: 'How do you create a variable called "name" with value "Alex"?', options: ['name == "Alex"', 'name = "Alex"', 'var name = "Alex"', 'set name to "Alex"'], answer: 1 },
          { q: 'What type is the number 3.14?', options: ['str', 'int', 'float', 'bool'], answer: 2 },
          { q: 'What type is True or False?', options: ['str', 'int', 'float', 'bool'], answer: 3 },
        ],
      },
      {
        title: 'Input: Asking the User',
        completed: false,
        xp: 60,
        content: {
          explanation: 'The input() function asks the user to type something and stores their answer. IMPORTANT: input() always returns a STRING, even if the user types a number! To use it as a number, convert it with int() or float().',
          example: '# Ask for text input\nname = input("What is your name? ")\nprint("Hello, " + name + "!")\n\n# Ask for a number (convert with int)\nage = int(input("How old are you? "))\nnext_year = age + 1\nprint("Next year you will be", next_year)\n\n# Ask for a decimal (convert with float)\nheight = float(input("How tall are you in metres? "))\nprint("You are", height, "metres tall")\n\n# Fun interactive program\nfav_animal = input("Favourite animal? ")\nfav_food = input("Favourite food? ")\nprint("Imagine a " + fav_animal + " eating " + fav_food + "!")',
          activity: 'Write an interactive "Get to Know You" program that asks 5 questions (name, age, favourite colour, hobby, and a number), stores the answers, then prints a fun summary about the user!',
          keyWords: ['input', 'ask', 'user', 'convert', 'int', 'float', 'interactive'],
        },
        quiz: [
          { q: 'What does input() return?', options: ['An integer', 'A float', 'Always a string', 'A boolean'], answer: 2 },
          { q: 'How do you convert input to a whole number?', options: ['float(input())', 'str(input())', 'int(input())', 'num(input())'], answer: 2 },
          { q: 'What goes inside the input() brackets?', options: ['The answer', 'The question / prompt to show the user', 'A number', 'Nothing'], answer: 1 },
        ],
      },
      {
        title: 'If Statements: Making Decisions',
        completed: false,
        xp: 75,
        content: {
          explanation: 'IF statements let your program make DECISIONS! The code inside an "if" block only runs if the condition is True. You can add "elif" (else if) for additional conditions, and "else" as a catch-all.\n\nPython uses INDENTATION (spaces at the start) to show which code belongs inside the if block. This is very important — wrong indentation causes errors!',
          example: '# Simple if/else\nage = int(input("How old are you? "))\n\nif age >= 18:\n    print("You are an adult!")\nelif age >= 13:\n    print("You are a teenager!")\nelse:\n    print("You are a child!")\n\n# Multiple conditions with and/or\nscore = int(input("Enter your score: "))\n\nif score >= 90:\n    print("Grade: A - Excellent!")\nelif score >= 70:\n    print("Grade: B - Good job!")\nelif score >= 50:\n    print("Grade: C - Keep trying!")\nelse:\n    print("Grade: F - Try again!")\n\n# Using \'and\' and \'or\'\ntemp = int(input("Temperature? "))\nif temp > 20 and temp < 30:\n    print("Perfect weather!")',
          activity: 'Write a quiz program that asks 5 questions. For each answer, use if/elif/else to check if it is correct and give appropriate feedback. Track the score and give a final grade at the end!',
          keyWords: ['if', 'elif', 'else', 'condition', 'boolean', 'indentation', 'decision'],
        },
        quiz: [
          { q: 'What does "elif" mean?', options: ['End if', 'Else if — another condition to check', 'Error', 'Extra line'], answer: 1 },
          { q: 'Why is indentation important in Python?', options: ['It looks nice', 'Python uses indentation to know which code belongs to which block', 'It is not important', 'To make code slower'], answer: 1 },
          { q: 'What operator means "greater than or equal to"?', options: ['>', '<', '>=', '=='], answer: 2 },
        ],
      },
      {
        title: 'While Loops',
        completed: false,
        xp: 70,
        content: {
          explanation: 'A WHILE loop repeats code AS LONG AS a condition is True. It is like a forever loop with a stop condition. Be careful: if the condition never becomes False, you get an INFINITE LOOP (the program never stops)!\n\nWhile loops are perfect for: games that run until the player loses, menus that repeat until the user exits, and input validation (asking again until they give a valid answer).',
          example: '# Countdown\ncount = 10\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("Blast off!")\n\n# Guessing game\nimport random\nsecret = random.randint(1, 100)\nguess = 0\nattempts = 0\n\nwhile guess != secret:\n    guess = int(input("Guess the number (1-100): "))\n    attempts = attempts + 1\n    if guess < secret:\n        print("Too low!")\n    elif guess > secret:\n        print("Too high!")\n\nprint("Correct! You got it in", attempts, "attempts!")\n\n# Input validation\nage = -1\nwhile age < 0 or age > 120:\n    age = int(input("Enter your age (0-120): "))\n    if age < 0 or age > 120:\n        print("Invalid! Try again.")',
          activity: 'Build a number guessing game: the computer picks a random number 1-100, and the player guesses until they get it right. Give "too high" or "too low" hints. Count their attempts and print a message based on how many tries it took!',
          keyWords: ['while', 'loop', 'repeat', 'condition', 'infinite', 'validation'],
        },
        quiz: [
          { q: 'When does a while loop stop?', options: ['After 10 repetitions', 'When the condition becomes False', 'When the computer is tired', 'It never stops'], answer: 1 },
          { q: 'What is an infinite loop?', options: ['A very fast loop', 'A loop that never stops because the condition is always True', 'A loop with no code', 'A type of error message'], answer: 1 },
          { q: 'What module do you import for random numbers?', options: ['math', 'random', 'numbers', 'guess'], answer: 1 },
        ],
      },
      {
        title: 'For Loops & Range',
        completed: false,
        xp: 70,
        content: {
          explanation: 'A FOR loop repeats code a SPECIFIC number of times or goes through each item in a collection. The range() function generates numbers: range(5) gives 0, 1, 2, 3, 4.\n\nYou can also loop through strings, lists, and other iterables. For loops are cleaner than while loops when you know how many repetitions you need.',
          example: '# Count from 0 to 4\nfor i in range(5):\n    print("Count:", i)\n\n# Count from 1 to 10\nfor i in range(1, 11):\n    print(i)\n\n# Count by 2s\nfor i in range(0, 21, 2):\n    print(i)  # 0, 2, 4, 6, 8... 20\n\n# Loop through a string\nfor letter in "Hello":\n    print(letter)\n\n# Loop with calculation\nfor num in range(1, 13):\n    print(f"{num} x 7 = {num * 7}")\n\n# Fun: build a pyramid\nfor i in range(1, 6):\n    print("*" * i)',
          activity: 'Write 3 programs: (1) Print the 1-12 times table for any number the user chooses, (2) Print a number pyramid (1, 12, 123, 1234...), (3) Print all EVEN numbers from 2 to 100.',
          keyWords: ['for', 'range', 'iterate', 'loop', 'collection', 'count'],
        },
        quiz: [
          { q: 'What does range(5) produce?', options: ['1, 2, 3, 4, 5', '0, 1, 2, 3, 4', '5, 5, 5, 5, 5', '0, 5'], answer: 1 },
          { q: 'How do you count from 1 to 10?', options: ['range(10)', 'range(1, 10)', 'range(1, 11)', 'range(0, 10)'], answer: 2 },
          { q: 'What does "for letter in word" do?', options: ['Deletes the word', 'Goes through each character in the word one by one', 'Prints the whole word', 'Creates a variable'], answer: 1 },
        ],
      },
      {
        title: 'Functions',
        completed: false,
        xp: 80,
        content: {
          explanation: 'FUNCTIONS are reusable blocks of code that you define with "def". They can take PARAMETERS (inputs) and RETURN values (outputs). Functions help you organise code, avoid repetition, and solve problems step-by-step.\n\nGood function names describe what the function does: greet(name), calculate_area(width, height), is_even(number).',
          example: '# Simple function\ndef greet(name):\n    print(f"Hello, {name}! Welcome!")\n\ngreet("Alex")  # Hello, Alex! Welcome!\ngreet("Sam")   # Hello, Sam! Welcome!\n\n# Function with return value\ndef add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(result)  # 8\n\n# Function with multiple parameters\ndef calculate_area(width, height):\n    area = width * height\n    return area\n\nroom = calculate_area(5, 4)\nprint(f"Room area: {room} square metres")\n\n# Function with default parameter\ndef power(base, exponent=2):\n    return base ** exponent\n\nprint(power(5))     # 25 (uses default exponent 2)\nprint(power(2, 10))  # 1024',
          activity: 'Write these functions: (1) calculate_bmi(weight, height) that returns BMI, (2) is_even(number) that returns True/False, (3) fizzbuzz(n) that prints FizzBuzz for numbers 1 to n. Test each function with several inputs!',
          keyWords: ['function', 'def', 'parameter', 'return', 'reusable', 'call'],
        },
        quiz: [
          { q: 'How do you define a function in Python?', options: ['function myFunc():', 'def myFunc():', 'create myFunc():', 'make myFunc():'], answer: 1 },
          { q: 'What does "return" do?', options: ['Prints to the screen', 'Sends a value back from the function', 'Ends the program', 'Creates a variable'], answer: 1 },
          { q: 'What is a parameter?', options: ['A type of loop', 'An input value that a function receives', 'A Python keyword', 'A data type'], answer: 1 },
        ],
      },
      {
        title: 'Lists',
        completed: false,
        xp: 75,
        content: {
          explanation: 'LISTS store multiple items in a single variable. They are ordered, changeable, and can contain different data types. Lists use square brackets [] and items are separated by commas.\n\nYou can add items (append), remove items (remove/pop), access items by index (starting at 0), sort them, and loop through them. Lists are one of the most useful tools in Python!',
          example: '# Create a list\nfruits = ["apple", "banana", "cherry", "date"]\nscores = [85, 92, 78, 95, 88]\n\n# Access by index (starts at 0!)\nprint(fruits[0])   # apple\nprint(fruits[-1])  # date (last item)\n\n# Modify\nfruits.append("elderberry")  # add to end\nfruits.remove("banana")      # remove specific item\nfruits[0] = "avocado"        # change by index\n\n# Useful operations\nprint(len(fruits))       # number of items\nprint(max(scores))       # highest: 95\nprint(min(scores))       # lowest: 78\nprint(sum(scores))       # total: 438\n\n# Loop through a list\nfor fruit in fruits:\n    print(f"I like {fruit}!")\n\n# Sort\nscores.sort()              # ascending\nscores.sort(reverse=True)  # descending',
          activity: 'Create a shopping list program: the user can ADD items, REMOVE items, VIEW the list, and QUIT. Use a while loop for the menu. Display the list nicely with numbering!',
          keyWords: ['list', 'append', 'remove', 'index', 'sort', 'loop', 'collection'],
        },
        quiz: [
          { q: 'What index is the first item in a list?', options: ['1', '0', '-1', 'first'], answer: 1 },
          { q: 'How do you add an item to the end of a list?', options: ['list.add(item)', 'list.append(item)', 'list.insert(item)', 'list.push(item)'], answer: 1 },
          { q: 'What does len(myList) return?', options: ['The last item', 'The first item', 'The number of items in the list', 'The sum of all items'], answer: 2 },
        ],
      },
      {
        title: 'String Methods & F-Strings',
        completed: false,
        xp: 65,
        content: {
          explanation: 'Strings have many useful METHODS (built-in functions): .upper(), .lower(), .strip(), .replace(), .split(), .count(), and more. F-STRINGS (formatted strings) let you embed variables directly inside text using f"..." and {curly braces}.\n\nF-strings are much cleaner than string concatenation with + signs!',
          example: '# String methods\ntext = "  Hello, World!  "\nprint(text.upper())        # "  HELLO, WORLD!  "\nprint(text.lower())        # "  hello, world!  "\nprint(text.strip())        # "Hello, World!" (removes spaces)\nprint(text.replace("World", "Python"))  # "  Hello, Python!  "\n\nwords = "apple,banana,cherry"\nfruit_list = words.split(",")  # ["apple", "banana", "cherry"]\n\n# F-strings (the best way to format!)\nname = "Alex"\nage = 10\nscore = 95.5\n\nprint(f"Hi, I am {name} and I am {age} years old!")\nprint(f"My score is {score}%")\nprint(f"Next year I will be {age + 1}")\nprint(f"My name in caps: {name.upper()}")',
          activity: 'Write a program that takes a sentence from the user and: counts the words, counts a specific letter they choose, reverses the sentence, and converts it to upper and lower case. Use f-strings for all output!',
          keyWords: ['string', 'method', 'f-string', 'format', 'upper', 'lower', 'split', 'replace'],
        },
        quiz: [
          { q: 'What does .upper() do?', options: ['Moves text up', 'Converts text to all capitals', 'Deletes the text', 'Makes text bold'], answer: 1 },
          { q: 'How do you write an f-string?', options: ['f"text {variable}"', '"text" + variable', 'format("text", variable)', 'printf("text")'], answer: 0 },
          { q: 'What does .split(",") do?', options: ['Adds commas', 'Splits a string into a list at each comma', 'Removes commas', 'Counts commas'], answer: 1 },
        ],
      },
      {
        title: 'Project: Text Adventure Game',
        completed: false,
        xp: 200,
        content: {
          explanation: 'Build a complete TEXT ADVENTURE GAME in Python! The player reads descriptions and makes choices by typing commands. Use everything you have learned: variables, input, if/elif/else, loops, functions, lists, and string methods.\n\nCreate a story with at least 5 rooms/locations, items to collect, enemies to avoid, and multiple endings based on the player\'s choices!',
          example: '# Text Adventure Structure\ndef start():\n    print("=" * 40)\n    print("  THE DARK DUNGEON  ")\n    print("=" * 40)\n    print("\\nYou wake up in a dark dungeon...")\n    print("There is a door to the NORTH and a tunnel to the EAST.")\n    \n    player = {"health": 100, "items": [], "score": 0}\n    current_room = "dungeon"\n    \n    while player["health"] > 0:\n        command = input("\\n> ").lower().strip()\n        \n        if current_room == "dungeon":\n            if command == "north":\n                current_room = "hallway"\n                print("You enter a long hallway...")\n            elif command == "east":\n                current_room = "tunnel"\n                print("You crawl into a narrow tunnel...")\n            else:\n                print("I don\'t understand. Try \'north\' or \'east\'.")\n    \n    print(f"Game Over! Score: {player[\'score\']}")\n\nstart()',
          activity: 'Create a text adventure with: at least 5 rooms, 3 items to find, 2 enemies, health tracking, a scoring system, and at least 2 different endings. Make the story engaging and fun to explore!',
          keyWords: ['text adventure', 'game', 'project', 'interactive', 'choices', 'story'],
        },
        quiz: [
          { q: 'What makes text adventures fun?', options: ['Graphics', 'The story, choices, and multiple outcomes', 'Speed', 'Sound effects'], answer: 1 },
          { q: 'How do you handle player commands?', options: ['Random choice', 'Use input() and if/elif to check what they typed', 'Ignore them', 'Pre-program all commands'], answer: 1 },
          { q: 'Why convert commands to lowercase with .lower()?', options: ['It looks better', 'So "NORTH", "North", and "north" all work the same', 'It is faster', 'Python requires it'], answer: 1 },
        ],
      },
    ],
  },

  // ---- COURSE 9: Data Detective (Y5) ----
  {
    id: 'y5-data-detective',
    title: 'Data Detective',
    description: 'Become a data detective! Learn to collect, organise, analyse, and visualise data using code. Create charts, find patterns, calculate statistics, and present your findings!',
    icon: '📊',
    color: '#f59e0b',
    yearGroup: 5,
    difficulty: 'Year 5',
    lessons: 22,
    duration: '11 hours',
    progress: 0,
    topics: ['Data Collection', 'Lists', 'Sorting', 'Searching', 'Charts', 'Averages', 'Patterns'],
    modules: [
      {
        title: 'What is Data?',
        completed: false,
        xp: 45,
        content: {
          explanation: 'DATA is information that can be collected, stored, and analysed. It can be numbers (quantitative) like heights, scores, temperatures; or categories (qualitative) like colours, names, opinions.\n\nComputers are brilliant at processing data — they can analyse millions of records in seconds! Learning to work with data is one of the most valuable skills in the modern world.',
          example: '# Different types of data\n\n# Quantitative (numbers you can calculate with)\ntest_scores = [85, 92, 78, 95, 88, 73, 91]\ntemperatures = [18.5, 22.3, 15.8, 20.1, 24.6]\n\n# Qualitative (categories)\nfavourite_colours = ["blue", "red", "blue", "green", "blue", "red"]\npet_types = ["dog", "cat", "fish", "dog", "hamster", "cat", "dog"]\n\n# You can count qualitative data\nblue_count = favourite_colours.count("blue")\nprint(f"Blue is liked by {blue_count} people")',
          activity: 'Collect data from your class (or make up realistic data): favourite colours of 15 people, their heights, and their ages. Store each as a Python list. Count how many chose each colour!',
          keyWords: ['data', 'quantitative', 'qualitative', 'collect', 'analyse', 'information'],
        },
        quiz: [
          { q: 'What is quantitative data?', options: ['Data about qualities', 'Numerical data you can calculate with', 'Data about opinions', 'Data stored in a computer'], answer: 1 },
          { q: 'What is qualitative data?', options: ['Number-based data', 'Category-based data like colours or names', 'Data from quizzes', 'Scientific data'], answer: 1 },
          { q: 'How can you count items in a Python list?', options: ['list.total(item)', 'list.count(item)', 'len(item)', 'count(list)'], answer: 1 },
        ],
      },
      {
        title: 'Organising & Sorting Data',
        completed: false,
        xp: 55,
        content: {
          explanation: 'Before analysing data, you need to ORGANISE it. Sorting data makes patterns visible. Python can sort lists with .sort() (modifies the list) or sorted() (returns a new sorted list).\n\nYou can sort ascending (smallest to largest) or descending (largest to smallest). For text, sorting goes alphabetically.',
          example: '# Sorting numbers\nscores = [85, 42, 97, 63, 78, 91, 55]\n\nscores.sort()  # Ascending: [42, 55, 63, 78, 85, 91, 97]\nprint("Lowest to highest:", scores)\n\nscores.sort(reverse=True)  # Descending: [97, 91, 85, 78, 63, 55, 42]\nprint("Highest to lowest:", scores)\n\n# Sorting text alphabetically\nnames = ["Zara", "Alex", "Mia", "Ben"]\nnames.sort()\nprint(names)  # ["Alex", "Ben", "Mia", "Zara"]\n\n# Finding specific values\nprint(f"Highest score: {max(scores)}")\nprint(f"Lowest score: {min(scores)}")\nprint(f"Total scores: {len(scores)}")',
          activity: 'Create a program that takes 10 test scores from the user, stores them in a list, then displays: the scores sorted ascending and descending, the highest and lowest scores, and their positions!',
          keyWords: ['sort', 'organise', 'ascending', 'descending', 'max', 'min', 'order'],
        },
        quiz: [
          { q: 'What does .sort() do?', options: ['Deletes the list', 'Sorts the list in ascending order', 'Reverses the list', 'Copies the list'], answer: 1 },
          { q: 'How do you sort in descending order?', options: ['.sort(down=True)', '.sort(reverse=True)', '.sort(desc=True)', '.sort(backwards=True)'], answer: 1 },
          { q: 'What does max() return?', options: ['The average', 'The smallest value', 'The largest value', 'The middle value'], answer: 2 },
        ],
      },
      {
        title: 'Averages: Mean, Median, Mode',
        completed: false,
        xp: 75,
        content: {
          explanation: 'There are 3 types of average:\n\n- MEAN: Add all values and divide by the count. Best for evenly spread data.\n- MEDIAN: The middle value when sorted. Good when there are extreme outliers.\n- MODE: The most common value. Good for categorical data.\n\nEach tells a different story about your data!',
          example: '# Calculate mean\nscores = [85, 92, 78, 95, 88, 73, 91]\nmean = sum(scores) / len(scores)\nprint(f"Mean: {mean:.1f}")  # 86.0\n\n# Calculate median\nsorted_scores = sorted(scores)\nmid = len(sorted_scores) // 2\nif len(sorted_scores) % 2 == 0:\n    median = (sorted_scores[mid-1] + sorted_scores[mid]) / 2\nelse:\n    median = sorted_scores[mid]\nprint(f"Median: {median}")  # 88\n\n# Calculate mode\ndef find_mode(data):\n    counts = {}\n    for item in data:\n        counts[item] = counts.get(item, 0) + 1\n    max_count = max(counts.values())\n    modes = [k for k, v in counts.items() if v == max_count]\n    return modes\n\ncolours = ["blue", "red", "blue", "green", "blue", "red"]\nprint(f"Mode: {find_mode(colours)}")  # ["blue"]',
          activity: 'Write functions for mean(), median(), and mode(). Test them with: class test scores, daily temperatures for a week, and favourite colours of 20 people. Which average is most useful for each dataset?',
          keyWords: ['mean', 'median', 'mode', 'average', 'statistics', 'calculate'],
        },
        quiz: [
          { q: 'What is the mean?', options: ['The middle value', 'The sum divided by the count', 'The most common value', 'The highest value'], answer: 1 },
          { q: 'When is the median better than the mean?', options: ['Always', 'When there are extreme outliers (very high or low values)', 'Never', 'For text data'], answer: 1 },
          { q: 'What is the mode?', options: ['The average', 'The middle value', 'The most frequently occurring value', 'The range'], answer: 2 },
        ],
      },
      {
        title: 'Text-Based Charts',
        completed: false,
        xp: 70,
        content: {
          explanation: 'You can create simple charts using text characters! Bar charts use repeated characters (like * or #) to show the size of values. This is a great way to visualise data without any special libraries.\n\nScale the bars so the largest value fits nicely on screen. Add labels and a title for clarity.',
          example: '# Horizontal bar chart\ndef bar_chart(title, labels, values):\n    print(f"\\n{title}")\n    print("=" * 40)\n    max_val = max(values)\n    for i in range(len(labels)):\n        bar_length = int(values[i] / max_val * 30)\n        bar = "#" * bar_length\n        print(f"{labels[i]:>10} | {bar} {values[i]}")\n\nsubjects = ["Maths", "English", "Science", "Art", "PE"]\nscores = [85, 72, 91, 68, 95]\nbar_chart("My Test Scores", subjects, scores)\n\n# Output:\n# My Test Scores\n# ========================================\n#      Maths | ########################## 85\n#    English | ####################### 72\n#    Science | ############################ 91\n#        Art | ###################### 68\n#         PE | ############################## 95',
          activity: 'Create a bar chart function and use it to visualise 3 different datasets: favourite fruits of 20 people, test scores by subject, and daily step counts for a week.',
          keyWords: ['chart', 'bar chart', 'visualise', 'graph', 'display', 'scale'],
        },
        quiz: [
          { q: 'Why visualise data?', options: ['It looks nice', 'Patterns and comparisons become much easier to see', 'To fill space', 'It is always required'], answer: 1 },
          { q: 'Why scale bar lengths to the maximum value?', options: ['So all bars are the same length', 'So the bars fit on screen and are proportional', 'To make the chart smaller', 'It does not matter'], answer: 1 },
          { q: 'What character is commonly used for text bars?', options: ['Letters', '# or *', 'Numbers', 'Spaces'], answer: 1 },
        ],
      },
      {
        title: 'Searching & Filtering Data',
        completed: false,
        xp: 70,
        content: {
          explanation: 'SEARCHING finds specific items in data. LINEAR SEARCH checks each item one by one until it finds a match. FILTERING keeps only items that meet a condition.\n\nPython makes filtering elegant with list comprehensions: a compact way to create new lists from existing ones with conditions!',
          example: '# Linear search\ndef search(data, target):\n    for i in range(len(data)):\n        if data[i] == target:\n            return i  # found! return position\n    return -1  # not found\n\nnames = ["Alex", "Sam", "Mia", "Ben", "Zoe"]\npos = search(names, "Mia")\nprint(f"Mia found at position {pos}")  # 2\n\n# Filtering with list comprehension\nscores = [85, 42, 97, 63, 78, 91, 55, 88]\n\nhigh_scores = [s for s in scores if s >= 80]\nprint(f"High scores: {high_scores}")  # [85, 97, 91, 88]\n\nfailing = [s for s in scores if s < 50]\nprint(f"Below 50: {failing}")  # [42]\n\n# Filter with multiple conditions\npassing_not_perfect = [s for s in scores if s >= 50 and s < 100]\nprint(f"Passing (not perfect): {passing_not_perfect}")',
          activity: 'Create a student records system with names and scores. Write functions to: search for a student by name, filter students scoring above a threshold, find students below average, and display results!',
          keyWords: ['search', 'filter', 'linear search', 'list comprehension', 'find', 'condition'],
        },
        quiz: [
          { q: 'What is a linear search?', options: ['Sorting data first', 'Checking each item one by one', 'Searching with lines', 'A type of chart'], answer: 1 },
          { q: 'What is a list comprehension?', options: ['A list of explanations', 'A compact way to create new lists with conditions', 'A type of loop', 'A sorting method'], answer: 1 },
          { q: 'What does filtering do?', options: ['Deletes all data', 'Keeps only items that meet a condition', 'Sorts the data', 'Counts the data'], answer: 1 },
        ],
      },
      {
        title: 'Project: Data Investigation',
        completed: false,
        xp: 170,
        content: {
          explanation: 'Conduct a complete DATA INVESTIGATION! Choose a topic (e.g. weather, sports, school), collect or create the data, organise it, calculate statistics (mean, median, mode), create visualisations, search and filter, and present your findings.\n\nWrite your program to output a full report with introduction, data, analysis, charts, and conclusions!',
          example: '# Data Investigation Template\ndef investigate():\n    print("DATA INVESTIGATION: Class Test Results")\n    print("=" * 45)\n    \n    # 1. Collect data\n    names = ["Alex", "Sam", "Mia", ...]\n    scores = [85, 92, 78, ...]\n    \n    # 2. Calculate statistics\n    avg = sum(scores) / len(scores)\n    print(f"\\nAverage score: {avg:.1f}")\n    \n    # 3. Visualise\n    bar_chart("Score Distribution", names, scores)\n    \n    # 4. Filter & analyse\n    top_students = [n for n, s in zip(names, scores) if s >= 90]\n    print(f"\\nTop students: {top_students}")\n    \n    # 5. Conclusions\n    print(f"\\nConclusion: Most students scored above {avg:.0f}...")\n\ninvestigate()',
          activity: 'Choose a topic and build a complete data investigation program. Collect at least 20 data points, calculate all 3 types of average, create at least 2 bar charts, and write automated conclusions!',
          keyWords: ['investigation', 'report', 'analysis', 'conclusions', 'present', 'data'],
        },
        quiz: [
          { q: 'What are the steps of a data investigation?', options: ['Just make a chart', 'Collect, organise, analyse, visualise, conclude', 'Only calculate averages', 'Copy data from the internet'], answer: 1 },
          { q: 'Why is data analysis important?', options: ['It is not', 'It helps us find patterns and make informed decisions', 'To fill time', 'Only scientists need it'], answer: 1 },
        ],
      },
    ],
  },


  /* ====== YEAR 6 - Ages 10-11 ====== */

  // ---- COURSE 10: App Inventor (Y6) ----
  {
    id: 'y6-app-inventor',
    title: 'App Inventor',
    description: 'Design and prototype real mobile apps! Learn UI/UX design, event-driven programming, data storage, forms, and how professional app developers work.',
    icon: '📱',
    color: '#ec4899',
    yearGroup: 6,
    difficulty: 'Year 6',
    lessons: 26,
    duration: '13 hours',
    progress: 0,
    topics: ['App Design', 'UI/UX', 'Events', 'Storage', 'Forms', 'Testing', 'Prototyping'],
    modules: [
      {
        title: 'How Apps Work',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Every app you use — Instagram, YouTube, Google Maps — follows the same pattern: a USER INTERFACE (what you see and tap), EVENT HANDLERS (code that runs when you interact), and DATA (information the app stores and processes).\n\nApps are EVENT-DRIVEN: nothing happens until the user does something (taps a button, swipes, types). Then the app responds. This is different from games that run continuously!',
          example: '// App structure\n// 1. UI (User Interface) — what the user sees\n// - Screens/pages\n// - Buttons, text fields, images\n// - Navigation menus\n\n// 2. Events — when the user interacts\nwhen Button1 clicked {\n  // Do something!\n  set Label1.text to "You clicked me!"\n}\n\nwhen TextBox1 changed {\n  // React to typing\n  set CharCount.text to length of TextBox1.text\n}\n\n// 3. Data — information to store\n// - User preferences\n// - Saved content\n// - Scores, settings',
          activity: 'Choose 3 apps you use every day. For each, list: what the UI looks like (screens, buttons), what events happen (taps, swipes), and what data it stores. Draw a simple diagram of each app!',
          keyWords: ['app', 'UI', 'event-driven', 'interface', 'interaction', 'data'],
        },
        quiz: [
          { q: 'What are the 3 main parts of an app?', options: ['Code, bugs, updates', 'UI, event handlers, data', 'Screens, colours, sounds', 'Download, install, open'], answer: 1 },
          { q: 'What does "event-driven" mean?', options: ['The app runs all the time', 'Code runs in response to user actions', 'Events are planned in advance', 'The app creates events automatically'], answer: 1 },
          { q: 'What is a UI?', options: ['A programming language', 'The visual elements the user sees and interacts with', 'A type of database', 'An error message'], answer: 1 },
        ],
      },
      {
        title: 'Designing User Interfaces',
        completed: false,
        xp: 60,
        content: {
          explanation: 'Great apps are EASY TO USE. Good UI/UX (User Experience) design follows these principles:\n\n1. CLARITY: Users should immediately understand what to do\n2. CONSISTENCY: Same actions should work the same way everywhere\n3. FEEDBACK: The app should respond to every action\n4. SIMPLICITY: Do not overwhelm with too many options\n\nAlways design for the USER, not for yourself!',
          example: '// Good UI Design Principles:\n\n// Clear labels\nButton: "Save Note"  // Good - clear action\nButton: "Go"       // Bad - go where?\n\n// Consistent styling\n// All primary buttons: blue, rounded, same size\n// All cancel buttons: grey, same position\n\n// Visual hierarchy\n// Title: large, bold (most important)\n// Subtitle: medium\n// Body text: small, regular weight\n\n// Layout (using rows and columns)\nScreen {\n  Row { Logo, AppTitle }\n  Column {\n    SearchBar\n    ContentList\n  }\n  BottomBar { HomeBtn, SearchBtn, ProfileBtn }\n}',
          activity: 'Design the UI for a Notes app on paper first: sketch the main screen, the "create new note" screen, and the "view note" screen. Label every button, text field, and image. Follow the design principles!',
          keyWords: ['UI', 'UX', 'design', 'layout', 'clarity', 'consistency', 'feedback'],
        },
        quiz: [
          { q: 'What does UX stand for?', options: ['Universal Experience', 'User Experience', 'Ultra Exclusive', 'Unique Extension'], answer: 1 },
          { q: 'Why is consistency important?', options: ['It makes the app boring', 'Users learn patterns and can use the app faster', 'It saves code', 'It is not important'], answer: 1 },
          { q: 'What makes a button label "good"?', options: ['It is short like "X"', 'It clearly describes the action like "Save Note"', 'It is colourful', 'It is hidden'], answer: 1 },
        ],
      },
      {
        title: 'Event Handlers & Buttons',
        completed: false,
        xp: 65,
        content: {
          explanation: 'EVENT HANDLERS are code blocks that run when something happens. The most common event is a button click, but there are many others: text input changes, screen loads, timer fires, shake detected.\n\nEach component (button, text box, etc.) can have multiple event handlers for different interactions.',
          example: '// Button click events\nwhen SaveButton clicked {\n  set Status.text to "Saved!"\n  set Status.colour to "green"\n  after(2000) { set Status.text to "" }\n}\n\nwhen DeleteButton clicked {\n  if confirm("Are you sure?") {\n    deleteNote(currentNote)\n    navigate("HomeScreen")\n  }\n}\n\n// Text input events\nwhen SearchBox textChanged {\n  filterNotes(SearchBox.text)\n  updateResults()\n}\n\n// Screen events\nwhen HomeScreen opens {\n  loadNotes()\n  updateNoteCount()\n}\n\n// Timer events\nwhen AutoSaveTimer fires {\n  saveCurrentNote()\n  set Status.text to "Auto-saved"\n}',
          activity: 'Build an app screen with 5 buttons, each with different click handlers: one changes the background colour, one increments a counter, one resets the counter, one shows/hides text, and one plays a sound!',
          keyWords: ['event', 'handler', 'click', 'button', 'trigger', 'respond'],
        },
        quiz: [
          { q: 'When does a click event handler run?', options: ['When the app opens', 'When the user clicks/taps the button', 'Every second', 'When the screen changes'], answer: 1 },
          { q: 'Can one component have multiple events?', options: ['No, only one', 'Yes, different events for different interactions', 'Only buttons can', 'Only if you pay extra'], answer: 1 },
          { q: 'What is an auto-save timer?', options: ['A clock display', 'A timer that automatically saves data at regular intervals', 'A count-down for the user', 'A type of button'], answer: 1 },
        ],
      },
      {
        title: 'Multiple Screens & Navigation',
        completed: false,
        xp: 70,
        content: {
          explanation: 'Real apps have MULTIPLE SCREENS. A navigation system lets users move between them. Common patterns include:\n\n- TAB BAR: Icons at the bottom (Home, Search, Profile)\n- STACK NAVIGATION: Push new screens, go back\n- DRAWER: Side menu that slides out\n\nPass data between screens so each screen knows what to display!',
          example: '// Navigate between screens\nwhen HomeButton clicked {\n  navigate("HomeScreen")\n}\nwhen ProfileButton clicked {\n  navigate("ProfileScreen")\n}\n\n// Pass data to next screen\nwhen NoteItem clicked {\n  set selectedNote to NoteItem.data\n  navigate("ViewNoteScreen", { note: selectedNote })\n}\n\n// Receive data on new screen\nwhen ViewNoteScreen opens {\n  set TitleLabel.text to params.note.title\n  set ContentLabel.text to params.note.content\n  set DateLabel.text to params.note.date\n}\n\n// Back button\nwhen BackButton clicked {\n  navigateBack()\n}',
          activity: 'Create a 3-screen app: Home (list of items), Detail (shows one item), and Settings. Add navigation buttons to move between all screens. Pass and display data correctly on each screen!',
          keyWords: ['navigation', 'screen', 'tab bar', 'pass data', 'navigate', 'back'],
        },
        quiz: [
          { q: 'What is a tab bar?', options: ['A search field', 'Icons at the bottom for main navigation', 'A table of data', 'A progress bar'], answer: 1 },
          { q: 'Why pass data between screens?', options: ['It is not needed', 'So each screen knows what information to display', 'To slow down the app', 'For security'], answer: 1 },
          { q: 'What does navigateBack() do?', options: ['Goes to the home screen', 'Returns to the previous screen', 'Exits the app', 'Refreshes the page'], answer: 1 },
        ],
      },
      {
        title: 'Forms & Input Validation',
        completed: false,
        xp: 75,
        content: {
          explanation: 'FORMS collect information from users: text fields, dropdowns, checkboxes, and date pickers. VALIDATION ensures the data is correct before saving — check that required fields are filled in, emails have @ symbols, numbers are within range.\n\nAlways validate BEFORE saving! Show clear, friendly error messages when something is wrong.',
          example: '// Form with validation\nwhen SaveButton clicked {\n  // Validate required fields\n  if NameField.text = "" {\n    showError("Please enter your name")\n    return\n  }\n  if EmailField.text = "" {\n    showError("Please enter your email")\n    return\n  }\n  // Validate email format\n  if not contains(EmailField.text, "@") {\n    showError("Please enter a valid email")\n    return\n  }\n  // Validate age range\n  if AgeField.value < 5 or AgeField.value > 100 {\n    showError("Age must be between 5 and 100")\n    return\n  }\n  \n  // All valid — save!\n  saveUser(NameField.text, EmailField.text, AgeField.value)\n  showSuccess("Profile saved!")\n  navigate("HomeScreen")\n}',
          activity: 'Build a registration form with: name (required), email (must contain @), age (5-100), favourite colour (dropdown), and agree to terms (checkbox, required). Validate everything and show appropriate error messages!',
          keyWords: ['form', 'input', 'validation', 'required', 'error', 'submit'],
        },
        quiz: [
          { q: 'Why validate form data?', options: ['To annoy users', 'To ensure data is correct and complete before saving', 'Validation is optional', 'To make the app slower'], answer: 1 },
          { q: 'What should happen when validation fails?', options: ['Save anyway', 'Show a clear, friendly error message', 'Crash the app', 'Delete the form'], answer: 1 },
          { q: 'How do you check if an email is likely valid?', options: ['Check if it is long', 'Check if it contains an @ symbol', 'Check if it starts with a capital', 'You cannot check'], answer: 1 },
        ],
      },
      {
        title: 'Data Storage',
        completed: false,
        xp: 80,
        content: {
          explanation: 'Apps need to SAVE data so it persists when the app is closed. There are different types of storage:\n\n- LOCAL STORAGE: Simple key-value pairs on the device (settings, preferences)\n- DATABASE: Structured storage for lots of records (notes, contacts)\n- CLOUD: Data stored online, accessible from any device\n\nChoose the right storage for each type of data!',
          example: '// Local storage (simple key-value)\nfunction savePreference(key, value) {\n  localStorage.set(key, value)\n}\nfunction loadPreference(key) {\n  return localStorage.get(key)\n}\n\n// Save user settings\nsavePreference("theme", "dark")\nsavePreference("fontSize", 16)\n\n// Load on app start\nwhen App starts {\n  set theme to loadPreference("theme")\n  set fontSize to loadPreference("fontSize")\n  applyTheme(theme)\n}\n\n// Database for structured data\nfunction saveNote(title, content) {\n  database.add("notes", {\n    title: title,\n    content: content,\n    date: today(),\n    id: generateId()\n  })\n}\n\nfunction loadAllNotes() {\n  return database.getAll("notes")\n}',
          activity: 'Add data storage to your Notes app: save notes to local storage, load them when the app opens, allow editing and deleting, and save the user\'s theme preference (light/dark mode)!',
          keyWords: ['storage', 'save', 'load', 'persist', 'database', 'local', 'cloud'],
        },
        quiz: [
          { q: 'Why do apps need storage?', options: ['They do not', 'So data persists when the app is closed', 'To use more memory', 'For decoration'], answer: 1 },
          { q: 'What is local storage best for?', options: ['Large databases', 'Simple preferences and settings', 'Sharing data online', 'Videos'], answer: 1 },
          { q: 'What is the advantage of cloud storage?', options: ['It is faster', 'Data is accessible from any device', 'It costs nothing', 'It deletes data automatically'], answer: 1 },
        ],
      },
      {
        title: 'Project: Complete App',
        completed: false,
        xp: 200,
        content: {
          explanation: 'Design and build a complete app prototype! Choose from: a Note-Taking App, a Quiz App, a Todo List, a Weather Dashboard, or your own idea. Your app needs: multiple screens, navigation, forms with validation, data storage, event handlers, and polished UI design.\n\nFollow the professional process: plan, wireframe, build, test, iterate!',
          example: '// App Checklist:\n// [x] 3+ screens with navigation\n// [x] Consistent, clean UI design\n// [x] At least 1 form with validation\n// [x] Data storage (save and load)\n// [x] Event handlers for all interactions\n// [x] Error handling with friendly messages\n// [x] Settings/preferences screen\n// [x] Professional look and feel\n// [x] Tested with 3+ users\n// [x] Bugs fixed based on testing',
          activity: 'Build your complete app! Follow the checklist. Wireframe first (draw on paper), then build one screen at a time. Test with friends and get feedback. Iterate until it feels polished and professional!',
          keyWords: ['app', 'prototype', 'complete', 'project', 'professional', 'iterate'],
        },
        quiz: [
          { q: 'What is a wireframe?', options: ['A type of cable', 'A rough sketch of the app layout before coding', 'A debugging tool', 'A type of storage'], answer: 1 },
          { q: 'What does "iterate" mean?', options: ['Give up', 'Improve step by step based on testing and feedback', 'Copy another app', 'Start from scratch'], answer: 1 },
          { q: 'How many screens should your app have?', options: ['1', 'At least 3', 'Exactly 10', 'As many as possible'], answer: 1 },
        ],
      },
    ],
  },

  // ---- COURSE 11: Python Adventures (Y6 Advanced Python) ----
  {
    id: 'y6-python-adventures',
    title: 'Python Adventures',
    description: 'Level up your Python skills! Master dictionaries, file handling, error handling, object-oriented programming, modules, and algorithms. Write Python like a professional developer!',
    icon: '🚀',
    color: '#10b981',
    yearGroup: 6,
    difficulty: 'Year 6',
    lessons: 30,
    duration: '15 hours',
    progress: 0,
    topics: ['Dictionaries', 'File Handling', 'Error Handling', 'OOP', 'Modules', 'Algorithms', 'Projects'],
    modules: [
      {
        title: 'Dictionaries',
        completed: false,
        xp: 70,
        content: {
          explanation: 'DICTIONARIES store data as KEY-VALUE pairs — like a real dictionary where you look up a word (key) to find its meaning (value). They are written with curly braces {} and colons between keys and values.\n\nDictionaries are perfect for storing structured data: a person\'s name, age, and email; a game character\'s stats; or a product\'s details.',
          example: '# Create a dictionary\nperson = {\n    "name": "Alex",\n    "age": 11,\n    "school": "Springfield Primary",\n    "hobbies": ["coding", "gaming", "reading"]\n}\n\n# Access values by key\nprint(person["name"])   # Alex\nprint(person["age"])    # 11\n\n# Add/modify\nperson["email"] = "alex@example.com"\nperson["age"] = 12\n\n# Check if key exists\nif "name" in person:\n    print(f"Name: {person[\'name\']}")\n\n# Loop through dictionary\nfor key, value in person.items():\n    print(f"{key}: {value}")\n\n# List of dictionaries (like a database!)\nstudents = [\n    {"name": "Alex", "score": 85},\n    {"name": "Sam", "score": 92},\n    {"name": "Mia", "score": 78}\n]\nfor s in students:\n    print(f"{s[\'name\']}: {s[\'score\']}")',
          activity: 'Create a contacts book program using dictionaries. Allow: adding contacts (name, phone, email), searching by name, editing contacts, deleting contacts, and displaying all contacts in a formatted table!',
          keyWords: ['dictionary', 'key', 'value', 'pair', 'structured', 'lookup'],
        },
        quiz: [
          { q: 'How do you access a value in a dictionary?', options: ['dict(key)', 'dict[key]', 'dict.get_value(key)', 'dict->key'], answer: 1 },
          { q: 'What characters surround a dictionary?', options: ['[] square brackets', '{} curly braces', '() parentheses', '<> angle brackets'], answer: 1 },
          { q: 'Can dictionary values be lists?', options: ['No', 'Yes, values can be any data type', 'Only strings', 'Only numbers'], answer: 1 },
        ],
      },
      {
        title: 'File Handling: Reading & Writing',
        completed: false,
        xp: 75,
        content: {
          explanation: 'FILE HANDLING lets Python read from and write to files on your computer. This is how programs save data permanently! The open() function opens a file, and "with" ensures it is properly closed.\n\nFile modes: "r" = read, "w" = write (overwrites!), "a" = append (add to end). Always use "with" for safe file handling.',
          example: '# Writing to a file\nwith open("notes.txt", "w") as file:\n    file.write("My First Note\\n")\n    file.write("This is saved to a file!\\n")\n    file.write("Python is amazing!\\n")\n\n# Reading a file\nwith open("notes.txt", "r") as file:\n    content = file.read()\n    print(content)\n\n# Reading line by line\nwith open("notes.txt", "r") as file:\n    for line in file:\n        print(line.strip())\n\n# Appending (adding without overwriting)\nwith open("notes.txt", "a") as file:\n    file.write("This is a new line!\\n")\n\n# Saving a list\nscores = [85, 92, 78, 95]\nwith open("scores.txt", "w") as file:\n    for score in scores:\n        file.write(f"{score}\\n")\n\n# Loading a list\nwith open("scores.txt", "r") as file:\n    scores = [int(line.strip()) for line in file]',
          activity: 'Create a diary program: the user can write entries (with date), save them to a file, load and display all entries, and search entries by date. Each entry should be saved permanently!',
          keyWords: ['file', 'read', 'write', 'open', 'save', 'load', 'permanent'],
        },
        quiz: [
          { q: 'What does "w" mode do?', options: ['Reads the file', 'Writes to the file (overwrites existing content)', 'Appends to the file', 'Deletes the file'], answer: 1 },
          { q: 'Why use "with open()" instead of just "open()"?', options: ['It is faster', 'It automatically closes the file properly', 'There is no difference', 'It opens multiple files'], answer: 1 },
          { q: 'What does "a" mode do?', options: ['Analyses the file', 'Adds new content to the end without erasing existing content', 'Archives the file', 'Alphabetises the file'], answer: 1 },
        ],
      },
      {
        title: 'Error Handling: Try/Except',
        completed: false,
        xp: 70,
        content: {
          explanation: 'Errors (EXCEPTIONS) happen! Users type letters when you expect numbers, files might not exist, network connections can fail. PROFESSIONAL code handles errors gracefully instead of crashing.\n\nUse try/except to "catch" errors and respond nicely. This makes your programs ROBUST — they keep running even when things go wrong.',
          example: '# Without error handling — crashes!\n# age = int(input("Age: "))  # Crashes if user types "abc"\n\n# With error handling — robust!\ntry:\n    age = int(input("Enter your age: "))\n    print(f"You are {age} years old!")\nexcept ValueError:\n    print("That is not a valid number!")\n\n# Handle multiple error types\ntry:\n    file = open("data.txt", "r")\n    content = file.read()\n    number = int(content)\nexcept FileNotFoundError:\n    print("File not found! Creating it...")\n    with open("data.txt", "w") as f:\n        f.write("0")\nexcept ValueError:\n    print("File does not contain a valid number!")\n\n# Safe input function\ndef get_number(prompt):\n    while True:\n        try:\n            return int(input(prompt))\n        except ValueError:\n            print("Please enter a valid number!")',
          activity: 'Create a calculator program that handles ALL errors gracefully: division by zero, invalid input, and missing operators. The program should never crash, no matter what the user types!',
          keyWords: ['error', 'exception', 'try', 'except', 'robust', 'handle', 'crash'],
        },
        quiz: [
          { q: 'What does try/except do?', options: ['Makes code faster', 'Catches errors so the program does not crash', 'Creates new variables', 'Tests for speed'], answer: 1 },
          { q: 'What error occurs when you convert "abc" to int?', options: ['FileNotFoundError', 'TypeError', 'ValueError', 'SyntaxError'], answer: 2 },
          { q: 'What does "robust" code mean?', options: ['Code that is very long', 'Code that handles errors and keeps running', 'Code written by robots', 'Code that runs fast'], answer: 1 },
        ],
      },
      {
        title: 'Object-Oriented Programming (OOP)',
        completed: false,
        xp: 90,
        content: {
          explanation: 'CLASSES are blueprints for creating objects. A Dog class defines what all dogs have (name, breed, age) and what they can do (bark, fetch, sit). You then create INSTANCES — individual dogs with specific values.\n\nOOP organises code around objects that contain both DATA (attributes) and ACTIONS (methods). This is how most professional software is built!',
          example: '# Define a class (blueprint)\nclass Pet:\n    def __init__(self, name, species, age):\n        self.name = name\n        self.species = species\n        self.age = age\n        self.hunger = 50\n    \n    def feed(self):\n        self.hunger = max(0, self.hunger - 20)\n        print(f"{self.name} eats happily! Hunger: {self.hunger}")\n    \n    def play(self):\n        self.hunger += 10\n        print(f"{self.name} plays fetch! Hunger: {self.hunger}")\n    \n    def status(self):\n        mood = "happy" if self.hunger < 50 else "hungry"\n        print(f"{self.name} the {self.species}, age {self.age} - {mood}")\n\n# Create instances (actual pets)\nbuddy = Pet("Buddy", "Dog", 3)\nwhiskers = Pet("Whiskers", "Cat", 5)\n\nbuddy.feed()\nbuddy.play()\nbuddy.status()\nwhiskers.feed()\nwhiskers.status()',
          activity: 'Create a virtual pet game using OOP! Define a Pet class with: name, hunger, happiness, energy. Add methods: feed(), play(), sleep(), and status(). Create 3 different pets and interact with them through a menu!',
          keyWords: ['class', 'object', 'OOP', 'instance', 'method', 'attribute', 'self'],
        },
        quiz: [
          { q: 'What is a class?', options: ['A school room', 'A blueprint for creating objects', 'A type of variable', 'A loop'], answer: 1 },
          { q: 'What is an instance?', options: ['An example', 'A specific object created from a class', 'A type of error', 'A function'], answer: 1 },
          { q: 'What does "self" refer to in a class method?', options: ['The programmer', 'The current instance of the class', 'The class name', 'A global variable'], answer: 1 },
        ],
      },
      {
        title: 'Modules & Libraries',
        completed: false,
        xp: 65,
        content: {
          explanation: 'MODULES are pre-written code packages that add functionality to Python. Instead of writing everything from scratch, you IMPORT modules and use their functions.\n\nPython has many built-in modules: random (random numbers), math (advanced maths), datetime (dates and times), json (data format), os (operating system). There are also thousands of third-party libraries!',
          example: 'import random\nimport math\nimport datetime\nimport json\n\n# random module\nnumber = random.randint(1, 100)\nchoice = random.choice(["rock", "paper", "scissors"])\nshuffled = random.sample(range(1, 50), 6)  # lottery!\n\n# math module\nprint(math.pi)          # 3.14159...\nprint(math.sqrt(144))   # 12.0\nprint(math.ceil(4.3))   # 5\n\n# datetime module\nnow = datetime.datetime.now()\nprint(f"Today: {now.strftime(\'%d/%m/%Y\')}")\nprint(f"Time: {now.strftime(\'%H:%M\')}")\n\n# json module (save/load structured data)\ndata = {"name": "Alex", "scores": [85, 92, 78]}\n\n# Save to file\nwith open("data.json", "w") as f:\n    json.dump(data, f)\n\n# Load from file\nwith open("data.json", "r") as f:\n    loaded = json.load(f)\nprint(loaded["name"])  # Alex',
          activity: 'Build a program that uses at least 4 different modules: generate random passwords (random), calculate circle areas (math), display dates (datetime), and save/load user data (json)!',
          keyWords: ['module', 'import', 'library', 'random', 'math', 'datetime', 'json'],
        },
        quiz: [
          { q: 'How do you use a module?', options: ['download it manually', 'import moduleName', 'include moduleName', 'require moduleName'], answer: 1 },
          { q: 'What does the json module do?', options: ['Creates graphics', 'Handles saving and loading structured data', 'Generates random numbers', 'Calculates maths'], answer: 1 },
          { q: 'What does random.choice() do?', options: ['Picks a random number', 'Picks a random item from a list', 'Creates a random list', 'Shuffles a list'], answer: 1 },
        ],
      },
      {
        title: 'Algorithms: Searching & Sorting',
        completed: false,
        xp: 85,
        content: {
          explanation: 'ALGORITHMS are step-by-step instructions to solve a problem. Two fundamental algorithms in computer science are SEARCHING and SORTING.\n\nBINARY SEARCH is much faster than linear search for sorted data: it eliminates half the remaining items each step! BUBBLE SORT compares neighbours and swaps them until sorted.',
          example: '# Binary Search (list must be sorted!)\ndef binary_search(sorted_list, target):\n    low = 0\n    high = len(sorted_list) - 1\n    \n    while low <= high:\n        mid = (low + high) // 2\n        if sorted_list[mid] == target:\n            return mid\n        elif sorted_list[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nnumbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\nresult = binary_search(numbers, 23)\nprint(f"Found at index: {result}")  # 5\n\n# Bubble Sort\ndef bubble_sort(data):\n    n = len(data)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if data[j] > data[j+1]:\n                data[j], data[j+1] = data[j+1], data[j]\n    return data\n\nunsorted = [64, 34, 25, 12, 22, 11, 90]\nprint(bubble_sort(unsorted))  # [11, 12, 22, 25, 34, 64, 90]',
          activity: 'Implement both binary search and bubble sort. Test with lists of 20+ items. Count how many comparisons each algorithm makes. Then compare: how many steps does linear search vs binary search take to find a number in a list of 1000 items?',
          keyWords: ['algorithm', 'binary search', 'bubble sort', 'efficiency', 'comparison', 'steps'],
        },
        quiz: [
          { q: 'Why is binary search faster than linear search?', options: ['It uses more memory', 'It eliminates half the items each step', 'It only works on small lists', 'It is not faster'], answer: 1 },
          { q: 'What requirement does binary search have?', options: ['Large lists only', 'The list must be sorted first', 'Numbers only', 'No requirements'], answer: 1 },
          { q: 'How does bubble sort work?', options: ['Picks random elements', 'Compares neighbouring items and swaps if out of order', 'Divides the list in half', 'Only sorts numbers'], answer: 1 },
        ],
      },
      {
        title: 'Project: Python Portfolio App',
        completed: false,
        xp: 250,
        content: {
          explanation: 'Build a comprehensive PYTHON APPLICATION that showcases everything you have learned! Choose from: a Contact Manager, Student Grade Tracker, Quiz Creator, Library System, or Inventory Manager.\n\nYour project must use: dictionaries, file handling (JSON), error handling, at least one class, imported modules, and a search/sort algorithm. This is your Python portfolio piece!',
          example: '# Portfolio Project Checklist:\n# [x] Dictionaries for structured data\n# [x] File handling (save/load with JSON)\n# [x] Try/except error handling throughout\n# [x] At least 1 class with methods\n# [x] At least 3 imported modules\n# [x] Binary search or bubble sort\n# [x] Menu-driven interface\n# [x] Input validation on all user input\n# [x] At least 5 functions\n# [x] Clean, well-organised code\n# [x] Comments explaining complex logic',
          activity: 'Build your portfolio application! Plan the data structure first, then implement features one at a time. Test thoroughly with edge cases (empty inputs, invalid data, missing files). Make it robust and professional!',
          keyWords: ['portfolio', 'project', 'comprehensive', 'professional', 'showcase', 'application'],
        },
        quiz: [
          { q: 'What makes a program "professional quality"?', options: ['It is very long', 'Error handling, clean code, good UX, thorough testing', 'Using many languages', 'Having no comments'], answer: 1 },
          { q: 'Why save data as JSON?', options: ['It is the only format', 'JSON is structured and easy to read and load', 'JSON is faster than text', 'JSON cannot be read by humans'], answer: 1 },
          { q: 'What should you test with edge cases?', options: ['Only the happy path', 'Unusual inputs like empty strings, very large numbers, and missing data', 'Only one test', 'Nothing'], answer: 1 },
        ],
      },
    ],
  },

  // ---- COURSE 12: Cyber Smart (Y6) ----
  {
    id: 'y6-cyber-smart',
    title: 'Cyber Smart',
    description: 'Master digital citizenship and online safety! Learn about digital footprints, password security, encryption, spotting scams, privacy settings, and cyberbullying prevention.',
    icon: '🛡️',
    color: '#6366f1',
    yearGroup: 6,
    difficulty: 'Year 6',
    lessons: 20,
    duration: '10 hours',
    progress: 0,
    topics: ['Digital Footprint', 'Passwords', 'Encryption', 'Scams', 'Privacy', 'Cyberbullying', 'Online Safety'],
    modules: [
      {
        title: 'Your Digital Footprint',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Everything you do online leaves a DIGITAL FOOTPRINT — a trail of data about you. Posts, searches, likes, comments, photos, and even which websites you visit are all recorded.\n\nYour digital footprint is PERMANENT and PUBLIC — future schools, employers, and others can find it. Think before you post: "Would I be happy if my grandparent, teacher, or future employer saw this?"',
          example: '// What creates your digital footprint?\n// ACTIVE footprint (things YOU post):\n// - Social media posts and photos\n// - Comments on videos/articles\n// - Messages and emails\n// - Form submissions\n\n// PASSIVE footprint (collected WITHOUT you doing anything):\n// - Websites you visit (cookies)\n// - Your location data\n// - Search history\n// - Shopping/browsing patterns\n\n// Quick check program\ndef footprint_check(action):\n    questions = [\n        "Would you be happy if your teacher saw this?",\n        "Would you be happy if this was on the news?",\n        "Will you still be proud of this in 5 years?",\n    ]\n    print(f"Before: \'{action}\'")\n    for q in questions:\n        answer = input(f"  {q} (yes/no): ")\n        if answer.lower() == "no":\n            print("  STOP! Do not post this.")\n            return\n    print("  Looks safe to share!")',
          activity: 'Write a "Digital Footprint Checker" program: it asks the user to describe what they want to post, then asks 5 safety check questions. Based on the answers, it advises whether it is safe to post or not.',
          keyWords: ['digital footprint', 'permanent', 'privacy', 'online', 'data', 'trail'],
        },
        quiz: [
          { q: 'What is a digital footprint?', options: ['Your shoe size', 'The trail of data you leave online', 'A type of file', 'A computer virus'], answer: 1 },
          { q: 'Can employers see your digital footprint?', options: ['No, it is private', 'Yes, and they often check before hiring', 'Only if you share your password', 'Only on school computers'], answer: 1 },
          { q: 'What is a "passive" digital footprint?', options: ['Posts you make', 'Data collected without you actively doing anything', 'Deleted posts', 'Offline data'], answer: 1 },
        ],
      },
      {
        title: 'Password Security',
        completed: false,
        xp: 60,
        content: {
          explanation: 'A strong password is your first line of defence online. Weak passwords (like "123456" or "password") can be cracked in SECONDS by hackers.\n\nStrong passwords: 12+ characters, mix of upper/lowercase, numbers, and symbols. Better yet, use a PASSPHRASE: 4+ random words strung together like "correct-horse-battery-staple". Never reuse passwords across sites!',
          example: '# Password strength checker\nimport re\n\ndef check_password_strength(password):\n    score = 0\n    feedback = []\n    \n    if len(password) >= 12:\n        score += 2\n    elif len(password) >= 8:\n        score += 1\n    else:\n        feedback.append("Too short! Use 12+ characters")\n    \n    if re.search(r"[A-Z]", password): score += 1\n    else: feedback.append("Add uppercase letters")\n    \n    if re.search(r"[a-z]", password): score += 1\n    else: feedback.append("Add lowercase letters")\n    \n    if re.search(r"[0-9]", password): score += 1\n    else: feedback.append("Add numbers")\n    \n    if re.search(r"[!@#$%^&*]", password): score += 1\n    else: feedback.append("Add symbols (!@#$%)")\n    \n    strength = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"]\n    print(f"Strength: {strength[min(score, 5)]}")\n    for tip in feedback:\n        print(f"  Tip: {tip}")',
          activity: 'Build a Password Strength Checker that analyses a password and gives it a score. Check for: length, uppercase, lowercase, numbers, symbols, and common patterns (like "123" or "abc"). Give specific tips to improve weak passwords!',
          keyWords: ['password', 'strong', 'weak', 'security', 'passphrase', 'characters'],
        },
        quiz: [
          { q: 'Which is the strongest password?', options: ['password123', 'MyDogRex', 'Tr0pic@l-Sunset-42!', '12345678'], answer: 2 },
          { q: 'How long should a strong password be?', options: ['4 characters', '6 characters', '8 characters', '12 or more characters'], answer: 3 },
          { q: 'Why should you not reuse passwords?', options: ['It is fine to reuse', 'If one site is hacked, all your accounts are compromised', 'It saves time', 'There is no reason'], answer: 1 },
        ],
      },
      {
        title: 'Encryption Basics',
        completed: false,
        xp: 70,
        content: {
          explanation: 'ENCRYPTION scrambles data so only authorised people can read it. It is like writing in a secret code! When you visit a secure website (https://), your data is encrypted so hackers cannot read it.\n\nA simple encryption method is the CAESAR CIPHER: shift each letter by a fixed number. A→D, B→E with shift 3. The "key" is the number of shifts.',
          example: '# Caesar Cipher — encryption\ndef encrypt(text, shift):\n    result = ""\n    for char in text:\n        if char.isalpha():\n            base = ord("A") if char.isupper() else ord("a")\n            shifted = (ord(char) - base + shift) % 26 + base\n            result += chr(shifted)\n        else:\n            result += char  # keep spaces/punctuation\n    return result\n\ndef decrypt(text, shift):\n    return encrypt(text, -shift)  # reverse the shift!\n\n# Encrypt a message\nsecret = encrypt("Hello World", 3)\nprint(f"Encrypted: {secret}")  # Khoor Zruog\n\n# Decrypt it back\noriginal = decrypt(secret, 3)\nprint(f"Decrypted: {original}")  # Hello World',
          activity: 'Build a Secret Messenger program: the user types a message, chooses a shift key, and sees the encrypted version. They can also paste in encrypted text and decrypt it. Add a "brute force" mode that tries all 26 shifts!',
          keyWords: ['encryption', 'decrypt', 'cipher', 'key', 'secure', 'Caesar', 'shift'],
        },
        quiz: [
          { q: 'What does encryption do?', options: ['Deletes data', 'Scrambles data so only authorised people can read it', 'Makes data bigger', 'Speeds up the internet'], answer: 1 },
          { q: 'What is a Caesar cipher?', options: ['A type of virus', 'A method that shifts each letter by a fixed number', 'A Roman calendar', 'A password manager'], answer: 1 },
          { q: 'What is the "key" in a Caesar cipher?', options: ['A physical key', 'The number of positions to shift letters', 'A password', 'The first letter'], answer: 1 },
        ],
      },
      {
        title: 'Spotting Scams & Phishing',
        completed: false,
        xp: 65,
        content: {
          explanation: 'PHISHING is when scammers pretend to be a trusted company (bank, school, game service) to trick you into giving away personal information, passwords, or money.\n\nRed flags: unexpected urgency ("Act NOW!"), asking for passwords, suspicious links, spelling errors, too-good-to-be-true offers, and threatening language. When in doubt, go directly to the real website — never click links in suspicious emails!',
          example: '# Phishing email detector\ndef check_email(subject, sender, body):\n    warnings = []\n    \n    # Check for urgency words\n    urgent_words = ["urgent", "immediately", "act now", "warning", "suspended"]\n    for word in urgent_words:\n        if word in body.lower():\n            warnings.append(f"Urgency language detected: \'{word}\'")\n    \n    # Check for suspicious requests\n    if "password" in body.lower():\n        warnings.append("Asks for password — legitimate companies NEVER do this!")\n    if "click here" in body.lower():\n        warnings.append("Contains \'click here\' link — could be malicious")\n    \n    # Check sender\n    if sender.count("@") != 1:\n        warnings.append("Invalid email address")\n    \n    if len(warnings) == 0:\n        print("Low risk — but always be cautious!")\n    else:\n        print(f"WARNING: {len(warnings)} red flag(s) found!")\n        for w in warnings:\n            print(f"  ⚠ {w}")',
          activity: 'Build a Phishing Email Detector that analyses email text and flags suspicious elements: urgency words, requests for personal info, suspicious links, spelling errors, and unusual sender addresses. Test it with 5 real and 5 fake example emails!',
          keyWords: ['phishing', 'scam', 'suspicious', 'fraud', 'trick', 'red flag'],
        },
        quiz: [
          { q: 'What is phishing?', options: ['A fishing game', 'Scammers pretending to be trusted companies to steal information', 'A type of virus', 'A search engine'], answer: 1 },
          { q: 'Which is a red flag in an email?', options: ['A personalised greeting', 'Urgently asking you to click a link and enter your password', 'Coming from a friend', 'Normal formatting'], answer: 1 },
          { q: 'What should you do if you receive a suspicious email?', options: ['Click the link to check', 'Reply with your details', 'Do not click links — go directly to the real website', 'Forward it to everyone'], answer: 2 },
        ],
      },
      {
        title: 'Privacy & Data Protection',
        completed: false,
        xp: 60,
        content: {
          explanation: 'YOUR DATA IS VALUABLE. Companies collect and use your personal data to target adverts, make recommendations, and build profiles about you. Understanding PRIVACY SETTINGS and DATA PROTECTION laws helps you control your information.\n\nThe UK\'s Data Protection Act and GDPR give you rights: the right to see what data companies hold about you, the right to have it deleted, and the right to say no to data collection.',
          example: '# Privacy audit program\ndef privacy_audit():\n    print("PRIVACY AUDIT")\n    print("=" * 30)\n    \n    checks = [\n        ("Do you check privacy settings on new apps?", "Always check privacy settings when installing a new app"),\n        ("Do you read permissions before installing apps?", "Apps should only request permissions they need"),\n        ("Is your social media set to private?", "Set profiles to private — only friends can see your posts"),\n        ("Do you share your location?", "Turn off location sharing unless absolutely needed"),\n        ("Do you use the same password everywhere?", "Use unique passwords for each account"),\n    ]\n    \n    score = 0\n    for question, tip in checks:\n        answer = input(f"{question} (yes/no): ")\n        if answer.lower() == "yes":\n            score += 1\n        else:\n            print(f"  TIP: {tip}")\n    \n    print(f"\\nPrivacy Score: {score}/{len(checks)}")',
          activity: 'Create a Privacy Audit Tool that asks users 10 questions about their online habits and gives a privacy score. Include personalised tips for improving weak areas!',
          keyWords: ['privacy', 'data protection', 'GDPR', 'settings', 'permissions', 'rights'],
        },
        quiz: [
          { q: 'What does GDPR protect?', options: ['Game data', 'Your personal data and privacy rights', 'Computer hardware', 'Internet speed'], answer: 1 },
          { q: 'Why should you check app permissions?', options: ['To make apps run faster', 'To ensure apps only access data they actually need', 'Permissions do not matter', 'To uninstall apps'], answer: 1 },
          { q: 'What right does GDPR give you?', options: ['Free internet', 'The right to see and delete your data', 'Unlimited storage', 'No adverts ever'], answer: 1 },
        ],
      },
      {
        title: 'Cyberbullying & Digital Citizenship',
        completed: false,
        xp: 55,
        content: {
          explanation: 'CYBERBULLYING is using technology to harass, threaten, embarrass, or target another person. It includes mean messages, spreading rumours online, sharing embarrassing photos without consent, and exclusion.\n\nBeing a DIGITAL CITIZEN means treating others online the same way you would face-to-face: with respect and kindness. If you see cyberbullying: do not join in, save the evidence, and tell a trusted adult.',
          example: '// Digital citizenship guide\ncitizenship_rules = [\n    "1. Think before you post — words online are permanent",\n    "2. Treat others as you want to be treated",\n    "3. Ask permission before sharing photos of others",\n    "4. Stand up for others being bullied (safely)",\n    "5. Report harmful content to a trusted adult",\n    "6. Do not share personal information with strangers",\n    "7. Give credit when using others\' work",\n    "8. Take breaks from screens regularly",\n    "9. Do not believe everything you read online",\n    "10. Be brave enough to ask for help",\n]\n\nfor rule in citizenship_rules:\n    print(rule)',
          activity: 'Create an interactive Digital Citizenship Quiz with 10 scenario-based questions. For each scenario (e.g. "Someone posts a mean comment about your friend"), give 4 options and explain why the best answer is the right choice!',
          keyWords: ['cyberbullying', 'digital citizen', 'respect', 'report', 'consent', 'kindness'],
        },
        quiz: [
          { q: 'What should you do if you see cyberbullying?', options: ['Join in', 'Ignore it completely', 'Save evidence, do not join in, tell a trusted adult', 'Share it with friends'], answer: 2 },
          { q: 'What is a digital citizen?', options: ['Someone who lives online', 'Someone who uses technology responsibly and treats others with respect', 'Someone who has a phone', 'Someone who plays games'], answer: 1 },
          { q: 'Why should you ask before sharing photos of others?', options: ['It takes too long', 'People have the right to control their own image (consent)', 'Photos are not important', 'Only adults need to ask'], answer: 1 },
        ],
      },
      {
        title: 'Project: Cyber Safety Campaign',
        completed: false,
        xp: 180,
        content: {
          explanation: 'Create a comprehensive CYBER SAFETY TOOLKIT — a Python program that brings together everything you have learned! Include: a password strength checker, a phishing email detector, a privacy audit, an encryption tool, and a digital citizenship quiz.\n\nPresent it as a menu-driven program that could genuinely help people stay safer online!',
          example: '# Cyber Safety Toolkit Menu\ndef main():\n    while True:\n        print("\\n=== CYBER SAFETY TOOLKIT ===")\n        print("1. Password Strength Checker")\n        print("2. Phishing Email Detector")\n        print("3. Privacy Audit")\n        print("4. Secret Message Encryptor")\n        print("5. Digital Citizenship Quiz")\n        print("6. Exit")\n        \n        choice = input("\\nChoose a tool (1-6): ")\n        if choice == "1": password_checker()\n        elif choice == "2": phishing_detector()\n        elif choice == "3": privacy_audit()\n        elif choice == "4": encryption_tool()\n        elif choice == "5": citizenship_quiz()\n        elif choice == "6": break\n\nmain()',
          activity: 'Build the complete Cyber Safety Toolkit with all 5 tools. Each tool should be thorough and genuinely useful. Test it with friends and family. This is a project you can be truly proud of!',
          keyWords: ['toolkit', 'campaign', 'safety', 'project', 'comprehensive', 'tools'],
        },
        quiz: [
          { q: 'What tools should your toolkit include?', options: ['Just one tool', 'Password checker, phishing detector, privacy audit, encryption, and quiz', 'Only games', 'Only passwords'], answer: 1 },
          { q: 'Why is a menu-driven interface good?', options: ['It looks complex', 'Users can easily choose which tool they want to use', 'It is the only way', 'It is not good'], answer: 1 },
          { q: 'Who is the target audience for this toolkit?', options: ['Only programmers', 'Anyone who wants to be safer online', 'Only adults', 'Only teachers'], answer: 1 },
        ],
      },
    ],
  },

  /* ====== YEAR 5 - Python Basics ====== */
  {
    id: 'y5-python-basics',
    title: 'Python Basics',
    description: 'Write and run real Python code! Start with printing messages, then learn variables, decisions, loops and lists. Every lesson has a live code editor — just press Run!',
    icon: '🐍',
    color: '#a78bfa',
    yearGroup: 5,
    difficulty: 'Year 5',
    lessons: 9,
    duration: '5 hours',
    progress: 0,
    topics: ['print()', 'Variables', 'Input', 'if/elif/else', 'for loops', 'while loops', 'Lists', 'Functions'],
    modules: [
      {
        title: 'Hello, Python!',
        completed: false,
        xp: 40,
        content: {
          explanation: 'Python is a real programming language used by engineers at Google, NASA, and thousands of companies. Unlike block coding, Python uses TEXT commands — you type instructions and the computer follows them.\n\nThe most important command to start with is print(). It shows text on screen. Anything inside the brackets and speech marks gets displayed. You can have as many print() commands as you like — they run one after another.',
          keyWords: ['python', 'print()', 'string', 'comment', 'run'],
          example: '# This is a comment — Python ignores it\nprint("Hello, World!")\nprint("I am learning Python!")',
          activity: 'Edit the Python editor below. Add three print() commands — your name, your school, and your favourite subject. Then click Run!',
        },
        quiz: [
          { q: 'What does print() do in Python?', options: ['Prints the screen', 'Shows text as output', 'Deletes code', 'Saves a file'], answer: 1 },
          { q: 'What symbol starts a comment in Python?', options: ['//', '##', '#', '//'], answer: 2 },
          { q: 'print("Hello") — what appears on screen?', options: ['print', 'Hello', '"Hello"', 'Nothing'], answer: 1 },
        ],
      },
      {
        title: 'Variables',
        completed: false,
        xp: 50,
        content: {
          explanation: 'A variable is like a labelled box that stores a value. You give it a name and use = to put something inside. In Python, you can store text (called a string), whole numbers (integers), or decimal numbers (floats).\n\nVariable names should be descriptive — "score" is better than "s". Use underscores instead of spaces: player_name, not player name.',
          keyWords: ['variable', 'string', 'integer', 'float', '=', 'assign'],
          example: 'name = "Alex"\nage = 10\nheight = 1.52\n\nprint(name)\nprint(age)\nprint("Height:", height)',
          activity: 'Create 4 variables: your name, age, favourite number, and favourite food. Print them all with descriptive messages.',
        },
        quiz: [
          { q: 'What symbol assigns a value to a variable?', options: ['==', ':=', '=', '<-'], answer: 2 },
          { q: 'What type is the value "Hello"?', options: ['Integer', 'Float', 'String', 'Boolean'], answer: 2 },
          { q: 'Which variable name follows Python style?', options: ['myName', 'my name', 'my_name', 'MyName'], answer: 2 },
        ],
      },
      {
        title: 'Numbers and Maths',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Python is brilliant at maths! You can add (+), subtract (-), multiply (*), divide (/), and find remainders (%). The % operator gives you the remainder after division — very useful for checking if a number is even or odd.\n\nYou can update variables using the result of maths: score = score + 10.',
          keyWords: ['+', '-', '*', '/', '%', 'integer', 'float', 'remainder'],
          example: 'a = 20\nb = 6\nprint(a + b)   # 26\nprint(a * b)   # 120\nprint(a % b)   # 2 (remainder)',
          activity: 'Create a simple calculator: store two numbers in variables and print the result of all 5 operations (+, -, *, /, %). Then try computing the area of a rectangle (length × width).',
        },
        quiz: [
          { q: 'What does % do in Python?', options: ['Percentage', 'Remainder after division', 'Multiply', 'Divide'], answer: 1 },
          { q: '17 % 5 equals...', options: ['3', '2', '12', '85'], answer: 1 },
          { q: 'score = score + 10 — what does this do?', options: ['Creates a new variable', 'Increases score by 10', 'Replaces score with 10', 'Does nothing'], answer: 1 },
        ],
      },
      {
        title: 'Getting User Input',
        completed: false,
        xp: 55,
        content: {
          explanation: 'input() pauses your program and asks the user to type something. The answer is always stored as a string (text). If you need a number, wrap it in int() to convert it: int(input("Enter a number: "))\n\nThis makes your programs interactive — different users get different results!',
          keyWords: ['input()', 'int()', 'str()', 'convert', 'interactive'],
          example: 'name = input("What is your name? ")\nprint("Hello,", name)\n\nage = int(input("How old are you? "))\nprint("Next year:", age + 1)',
          activity: 'Write a program that asks the user for their name and two numbers. Print their name and the sum of the two numbers.',
        },
        quiz: [
          { q: 'What type does input() always return?', options: ['Integer', 'Float', 'String', 'Boolean'], answer: 2 },
          { q: 'How do you convert the string "42" to the number 42?', options: ['str("42")', 'int("42")', 'num("42")', 'convert("42")'], answer: 1 },
          { q: 'Why do we use input()?', options: ['To save files', 'To make programs interactive', 'To print output', 'To create variables'], answer: 1 },
        ],
      },
      {
        title: 'If Statements',
        completed: false,
        xp: 65,
        content: {
          explanation: 'If statements let your program make decisions. Python checks a condition — if it is True, the indented code runs. If not, it skips to elif (else if) or else.\n\nIMPORTANT: Python uses indentation (4 spaces) to show which code belongs inside the if. Forgetting the indent is one of the most common mistakes!',
          keyWords: ['if', 'elif', 'else', 'condition', 'True', 'False', 'indentation', '>=', '=='],
          example: 'score = 85\n\nif score >= 90:\n    print("A grade")\nelif score >= 70:\n    print("B grade")\nelse:\n    print("Keep trying")',
          activity: 'Write a program that asks the user for a number. If it is greater than 100, print "Big number!". If it equals 42, print "The answer!". Otherwise print "Regular number."',
        },
        quiz: [
          { q: 'What does Python use to show code is inside an if?', options: ['Curly braces {}', 'Indentation (spaces)', 'Brackets ()', 'BEGIN/END'], answer: 1 },
          { q: 'What does elif mean?', options: ['Else if', 'Error if', 'End loop', 'Equal if'], answer: 0 },
          { q: '== checks...', options: ['Assignment', 'Equality (are they the same?)', 'Greater than', 'Less than'], answer: 1 },
        ],
      },
      {
        title: 'For Loops',
        completed: false,
        xp: 65,
        content: {
          explanation: 'A for loop repeats code for each item in a sequence. range(1, 6) gives the numbers 1, 2, 3, 4, 5 — the end number is NOT included. range(5) gives 0, 1, 2, 3, 4.\n\nYou can loop over a list too: for fruit in fruits: — this processes each fruit one by one.',
          keyWords: ['for', 'range()', 'loop', 'iterate', 'in'],
          example: 'for i in range(1, 6):\n    print(i)\n\nfor i in range(1, 11):\n    print("5 x", i, "=", 5*i)',
          activity: 'Write a program that prints the 7 times table (1×7 to 12×7). Then write a loop that prints all even numbers from 2 to 20 using range(2, 22, 2).',
        },
        quiz: [
          { q: 'range(1, 5) gives...', options: ['1, 2, 3, 4, 5', '1, 2, 3, 4', '0, 1, 2, 3, 4', '1, 2, 3'], answer: 1 },
          { q: 'What does range(5) give?', options: ['1, 2, 3, 4, 5', '0, 1, 2, 3, 4', '0, 1, 2, 3, 4, 5', '1, 2, 3, 4'], answer: 1 },
          { q: 'How many times does this run? for i in range(3):', options: ['0', '2', '3', '4'], answer: 2 },
        ],
      },
      {
        title: 'While Loops',
        completed: false,
        xp: 65,
        content: {
          explanation: 'A while loop keeps running as long as a condition is True. You must update the variable inside the loop, otherwise it runs forever (an infinite loop)!\n\nWhile loops are useful when you do not know in advance how many times to repeat — like asking the user a question until they give a valid answer.',
          keyWords: ['while', 'condition', 'infinite loop', 'True', 'False', 'update'],
          example: 'count = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1\nprint("Done!")',
          activity: 'Write a countdown from 10 to 1 using a while loop, then print "Blast off! 🚀". Then write a loop that adds up all numbers from 1 to 100 and prints the total.',
        },
        quiz: [
          { q: 'When does a while loop stop?', options: ['After 10 times', 'When the condition becomes False', 'Never', 'When you press stop'], answer: 1 },
          { q: 'What happens if you forget to update the variable in a while loop?', options: ['It crashes', 'It runs once', 'It runs forever (infinite loop)', 'It skips'], answer: 2 },
          { q: 'Which is better for a times table: for or while?', options: ['for — you know how many times', 'while — you never know', 'They are the same', 'Neither works'], answer: 0 },
        ],
      },
      {
        title: 'Lists',
        completed: false,
        xp: 70,
        content: {
          explanation: 'A list stores multiple values in order. Create one with square brackets: fruits = ["apple", "banana"]. Items are numbered from 0, so fruits[0] is "apple".\n\nUseful list operations: len(list) gives the length, list.append(item) adds to the end, and you can loop over a list with for item in list.',
          keyWords: ['list', 'index', 'append()', 'len()', 'for in'],
          example: 'colours = ["red", "green", "blue"]\nprint(colours[0])    # red\nprint(len(colours))  # 3\n\nfor colour in colours:\n    print(colour)',
          activity: 'Create a list of 5 of your favourite foods. Print the first and last item. Use a for loop to print them all with a number (1. pizza, 2. pasta...). Then add one more food with append().',
        },
        quiz: [
          { q: 'What index is the FIRST item in a Python list?', options: ['1', '0', '-1', 'first'], answer: 1 },
          { q: 'How do you add an item to a list?', options: ['list.add()', 'list.insert()', 'list.append()', 'list.push()'], answer: 2 },
          { q: 'len(["a","b","c"]) equals...', options: ['2', '3', '4', '0'], answer: 1 },
        ],
      },
      {
        title: 'Functions',
        completed: false,
        xp: 80,
        content: {
          explanation: 'A function is a reusable block of code with a name. Define it with def, give it a name, and put the code inside (indented). Call it by writing its name with brackets.\n\nFunctions can take parameters (inputs) and return values. They help you avoid repeating the same code and make programs easier to read.',
          keyWords: ['def', 'function', 'parameter', 'return', 'call', 'reuse'],
          example: 'def greet(name):\n    print("Hello,", name + "!")\n\ndef add(a, b):\n    return a + b\n\ngreet("Alex")\nresult = add(5, 3)\nprint(result)',
          activity: 'Write a function called calculate_area that takes width and height as parameters and returns the area (width × height). Call it 3 times with different values and print the results.',
        },
        quiz: [
          { q: 'What keyword defines a function in Python?', options: ['function', 'def', 'func', 'define'], answer: 1 },
          { q: 'What does return do?', options: ['Prints a value', 'Ends the program', 'Sends a value back from the function', 'Creates a variable'], answer: 2 },
          { q: 'Why use functions?', options: ['They are required', 'To avoid repeating code and improve readability', 'To make code slower', 'Functions do not help'], answer: 1 },
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

export const leaderboard = [];

export const communityProjects = [];



export const dailyQuestTemplates = [
  { id: 'q-run',   title: 'Run your code 3 times',    goal: 3,  type: 'runs',     xp: 40  },
  { id: 'q-quiz',  title: 'Complete a quiz module',   goal: 1,  type: 'quiz',     xp: 75  },
  { id: 'q-lines', title: 'Write 10 lines of code',   goal: 10, type: 'lines',    xp: 50  },
  { id: 'q-visit', title: 'Visit the Learning Hub',   goal: 1,  type: 'navigate', xp: 20  },
];
