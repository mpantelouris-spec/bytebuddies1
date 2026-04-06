/* ===================================================================
   ByteBuddies Courses - UK Year Groups 3-6
   Year 3 (ages 7-8), Year 4 (ages 8-9),
   Year 5 (ages 9-10), Year 6 (ages 10-11)

   12 full courses with 10-15 modules each, 3-4 quiz questions per module
   Dedicated Sprite tracks (Y3, Y4) and Python tracks (Y5, Y6)
   =================================================================== */

export const courses = [

  /* ====== YEAR 3 - Ages 7-8 ====== */

  // ---- COURSE 1: My First Code ----
  {
    id: 'y3-first-steps',
    title: 'My First Code',
    description: 'Start your coding adventure! Learn what code is, how computers follow instructions, and create your own programs using colourful drag-and-drop blocks.',
    icon: '🧩',
    color: '#6366f1',
    yearGroup: 3,
    difficulty: 'Year 3',
    lessons: 24,
    duration: '12 hours',
    progress: 0,
    topics: ['Sequences', 'Instructions', 'Output', 'Debugging', 'Prediction', 'Loops', 'Events', 'Input'],
    modules: [
      {
        title: 'What is Code?',
        completed: false,
        xp: 40,
        content: {
          explanation: 'Code is a set of instructions that tells a computer what to do — just like a recipe tells you how to bake a cake! Computers do EXACTLY what you tell them, nothing more and nothing less. They follow instructions in order, one step at a time. This is called a SEQUENCE.\n\nEvery app, game, and website you\'ve ever used was built with code. Programmers write code in many different languages, but today we\'ll use colourful blocks that snap together like LEGO!',
          example: '// Tell the computer to say hello\nsay("Hello, World!")\nsay("My name is ByteBuddies!")\nsay("I love to code!")',
          activity: 'Use the SAY block to make a sprite introduce itself. Add three SAY blocks — one for a greeting, one for the sprite\'s name, and one for its favourite hobby.',
          keyWords: ['code', 'instruction', 'sequence', 'program', 'computer'],
        },
        quiz: [
          { q: 'What is code?', options: ['A secret language only adults use', 'Instructions that tell a computer what to do', 'A type of video game', 'A website address'], answer: 1 },
          { q: 'Computers follow instructions...', options: ['All at once', 'In random order', 'One at a time, in order', 'Backwards'], answer: 2 },
          { q: 'What is a sequence?', options: ['A random set of actions', 'Steps arranged in a specific order', 'A picture on screen', 'A type of computer'], answer: 1 },
        ],
      },
      {
        title: 'Sequences & Order',
        completed: false,
        xp: 50,
        content: {
          explanation: 'A sequence is a set of instructions in a specific order. The order matters a LOT! Think about getting dressed — if you put your shoes on before your socks, it would be silly! In code, instructions run from top to bottom, one after another.\n\nWhen we draw shapes with code, the order of MOVE and TURN blocks determines what shape appears. Changing even one instruction can create a completely different result!',
          example: '// Draw a square — order matters!\nmove(100)   // Step 1: go forward\nturn(90)    // Step 2: turn right\nmove(100)   // Step 3: go forward\nturn(90)    // Step 4: turn right\nmove(100)   // Step 5: go forward\nturn(90)    // Step 6: turn right\nmove(100)   // Step 7: go forward\nturn(90)    // Step 8: turn right — back to start!',
          activity: 'Arrange the MOVE and TURN blocks in the right order to draw a triangle on the stage. Remember — a triangle has 3 sides and each turn is 120 degrees!',
          keyWords: ['sequence', 'order', 'step', 'instruction', 'algorithm'],
        },
        quiz: [
          { q: 'Why does the order of instructions matter?', options: ['It doesn\'t matter', 'Different order can give different results', 'Computers ignore the order', 'Only the last instruction counts'], answer: 1 },
          { q: 'What happens if you swap two instructions?', options: ['Nothing changes', 'The computer crashes', 'You might get a different result', 'The code deletes itself'], answer: 2 },
          { q: 'How many MOVE and TURN blocks do you need to draw a square?', options: ['2', '4', '8', '16'], answer: 2 },
        ],
      },
      {
        title: 'Output: Showing Things',
        completed: false,
        xp: 50,
        content: {
          explanation: 'OUTPUT is anything your program shows to the user — text on screen, sounds, sprite movements, or drawings. The most basic output is displaying text. In block coding, we use the SAY block or PRINT block.\n\nYou can combine text and numbers to create messages. This is really useful for showing scores, greetings, or telling a story!',
          example: '// Different kinds of output\nsay("Welcome to my program!")    // speech bubble\nprint("Score: 100")              // text on screen\nplay sound "meow"                // audio output\nmove(50)                         // visual output',
          activity: 'Create a program that displays your name, your age, and your favourite food using SAY blocks. Add a sound between each message!',
          keyWords: ['output', 'display', 'say', 'print', 'show'],
        },
        quiz: [
          { q: 'What is output?', options: ['The code you write', 'What the program shows to the user', 'The keyboard', 'The computer screen'], answer: 1 },
          { q: 'Which of these is a type of output?', options: ['Typing on the keyboard', 'Text shown on screen', 'Clicking the mouse', 'Plugging in headphones'], answer: 1 },
          { q: 'What does the SAY block do?', options: ['Listens to the user', 'Shows a speech bubble on the sprite', 'Deletes the sprite', 'Changes the background'], answer: 1 },
        ],
      },
      {
        title: 'Input: Getting Information',
        completed: false,
        xp: 55,
        content: {
          explanation: 'INPUT is information that comes INTO your program from the user. When you ask someone their name using an ASK block, that\'s input! The user types an answer, and your program stores it in a variable so you can use it later.\n\nInput makes programs INTERACTIVE — the user can talk to your program and get personalised responses!',
          example: '// Ask for input and use the answer\nask("What is your name?")\nsay("Hello, " + answer + "!")\n\nask("How old are you?")\nsay("Wow, " + answer + " is a great age!")\n\nask("What is your favourite colour?")\nset background colour to answer',
          activity: 'Make an interactive greeting program: ask the user 3 questions (name, favourite animal, favourite colour) and use their answers in personalised SAY blocks.',
          keyWords: ['input', 'ask', 'answer', 'interactive', 'user'],
        },
        quiz: [
          { q: 'What is input?', options: ['What the program shows on screen', 'Information the user gives to the program', 'A type of sprite', 'A sound effect'], answer: 1 },
          { q: 'What block do we use to get input?', options: ['SAY', 'MOVE', 'ASK', 'TURN'], answer: 2 },
          { q: 'Where is the user\'s answer stored?', options: ['In the background', 'In the answer variable', 'It disappears', 'On the stage'], answer: 1 },
        ],
      },
      {
        title: 'Debugging: Finding Mistakes',
        completed: false,
        xp: 60,
        content: {
          explanation: 'A BUG is a mistake in your code that makes it do something wrong or unexpected. DEBUGGING means finding and fixing those mistakes. The word "bug" comes from a real moth that got stuck in an early computer!\n\nEven the best programmers make bugs ALL the time — the important skill is knowing how to FIND them. Read your code step by step, predict what each line does, and compare it to what actually happens.',
          example: '// This code has 3 bugs! Can you spot them?\nsay("Helo World")    // Bug 1: "Hello" is misspelt!\nmove(10)\nturn(900)            // Bug 2: should be 90, not 900!\nmove(10)\nturn(90)\nmove(100)            // Bug 3: should be 10 to match the others!\nturn(90)',
          activity: 'Fix the broken program: the sprite should draw a square, but there are 3 bugs. Find and fix each one. Test your solution to make sure the square looks correct!',
          keyWords: ['bug', 'debug', 'fix', 'error', 'mistake', 'test'],
        },
        quiz: [
          { q: 'What is a bug in code?', options: ['An insect in your computer', 'A mistake that makes the program behave incorrectly', 'A feature', 'A type of block'], answer: 1 },
          { q: 'What is debugging?', options: ['Adding more code', 'Making the code longer', 'Finding and fixing mistakes', 'Deleting everything and starting again'], answer: 2 },
          { q: 'When you find a bug, what should you do first?', options: ['Panic!', 'Delete all your code', 'Read the code slowly to understand the mistake', 'Ask someone else to fix it'], answer: 2 },
        ],
      },
      {
        title: 'Prediction: What Happens Next?',
        completed: false,
        xp: 55,
        content: {
          explanation: 'PREDICTION means looking at code and working out what it will do BEFORE you run it. This is a superpower for programmers! If you can predict what code will do, you can plan better programs and find bugs more easily.\n\nPractise by reading code line by line and imagining you are the computer. Where will the sprite be after each step? What will appear on screen?',
          example: '// Predict: what shape does this draw?\nmove(80)\nturn(120)\nmove(80)\nturn(120)\nmove(80)\nturn(120)\n// Answer: a triangle!\n\n// Predict: what does this say?\nset name to "Alex"\nsay("Hi " + name)   // "Hi Alex"',
          activity: 'Look at 4 code snippets WITHOUT running them. Write down your prediction for each one. Then run them and check — were you right?',
          keyWords: ['predict', 'trace', 'read', 'understand', 'expect'],
        },
        quiz: [
          { q: 'What does prediction mean in coding?', options: ['Guessing randomly', 'Working out what code will do before running it', 'Writing code very fast', 'Copying someone else\'s code'], answer: 1 },
          { q: 'Why is prediction useful?', options: ['It is not useful', 'It helps you plan and find bugs', 'It makes the computer faster', 'It changes the code'], answer: 1 },
          { q: 'If code says move(50) then turn(90) four times, what shape is drawn?', options: ['Triangle', 'Circle', 'Square', 'Pentagon'], answer: 2 },
        ],
      },
      {
        title: 'Repetition: Loops',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Instead of writing the same code over and over, we use a LOOP! A REPEAT loop runs a set of instructions multiple times. This saves time, reduces mistakes, and keeps your code tidy.\n\nFor example, to draw a square you could write 8 lines of code... or just 2 lines inside a "repeat 4" loop! Loops are one of the most powerful ideas in all of programming.',
          example: '// Without a loop (8 lines!):\nmove(50)\nturn(90)\nmove(50)\nturn(90)\nmove(50)\nturn(90)\nmove(50)\nturn(90)\n\n// With a loop (3 lines!):\nrepeat 4 {\n  move(50)\n  turn(90)\n}',
          activity: 'Use a REPEAT loop to draw a hexagon (6 sides). Hint: the turn angle for a hexagon is 60 degrees. Then try drawing an octagon (8 sides, 45 degree turns)!',
          keyWords: ['loop', 'repeat', 'iteration', 'pattern', 'efficiency'],
        },
        quiz: [
          { q: 'Why do we use loops?', options: ['To make code look fancy', 'To avoid repeating the same code many times', 'To make the program slower', 'Loops are not useful'], answer: 1 },
          { q: 'repeat 3 { say("Hi") } — how many times does the sprite say "Hi"?', options: ['1', '2', '3', '0'], answer: 2 },
          { q: 'What is the turn angle for a regular hexagon?', options: ['90°', '45°', '60°', '120°'], answer: 2 },
          { q: 'Which is better: 100 separate MOVE blocks, or a loop?', options: ['100 blocks is better', 'A loop — it is shorter and easier to change', 'They are exactly the same', 'Neither works'], answer: 1 },
        ],
      },
      {
        title: 'Events: When Things Happen',
        completed: false,
        xp: 60,
        content: {
          explanation: 'EVENTS tell the computer WHEN to do something. "When the green flag is clicked" — that\'s an event! "When the space key is pressed" — that\'s another event! Events are like triggers that start your code running.\n\nWithout events, your code would have no way to know when to start or respond to the user. Events make programs interactive and responsive.',
          example: '// Event: when the program starts\nwhen green flag clicked {\n  say("Welcome to my game!")\n}\n\n// Event: when a key is pressed\nwhen key "space" pressed {\n  change y by 20   // jump!\n}\n\n// Event: when sprite is clicked\nwhen this sprite clicked {\n  say("You clicked me!")\n  change score by 1\n}',
          activity: 'Create a simple game: the sprite says hello when the green flag is clicked, moves right when the right arrow is pressed, and moves left when the left arrow is pressed.',
          keyWords: ['event', 'trigger', 'key press', 'click', 'start', 'when'],
        },
        quiz: [
          { q: 'What does an event do?', options: ['Deletes code', 'Tells the computer WHEN to run code', 'Makes code slower', 'Creates a variable'], answer: 1 },
          { q: 'Which of these is an event?', options: ['move(10)', 'say("Hi")', 'when space key pressed', 'change x by 5'], answer: 2 },
          { q: '"When green flag clicked" is an example of...', options: ['A variable', 'An event', 'A loop', 'An error'], answer: 1 },
        ],
      },
      {
        title: 'Conditions: Yes or No?',
        completed: false,
        xp: 70,
        content: {
          explanation: 'A CONDITION is a question that has a YES (true) or NO (false) answer. "Is the score greater than 10?" "Is the sprite touching the edge?" Conditions let your program make DECISIONS.\n\nWe use IF blocks to check conditions. If the answer is yes, the code inside runs. If not, it is skipped. You can also add ELSE to run different code when the answer is no.',
          example: '// Simple condition\nif score > 10 {\n  say("Great job!")\n}\n\n// If-else condition\nif touching "edge" {\n  turn(180)        // bounce back\n} else {\n  move(10)         // keep going\n}\n\n// Multiple conditions\nif score > 100 {\n  say("Champion!")\n} else if score > 50 {\n  say("Well done!")\n} else {\n  say("Keep trying!")\n}',
          activity: 'Make a sprite that walks across the screen. When it touches the edge, it should bounce back (turn 180 degrees). Add a condition: if the sprite reaches the star, display "You win!".',
          keyWords: ['condition', 'if', 'else', 'true', 'false', 'decision', 'compare'],
        },
        quiz: [
          { q: 'What is a condition?', options: ['A type of loop', 'A question with a yes/no answer', 'A sound effect', 'A variable name'], answer: 1 },
          { q: 'What happens if the condition in an IF block is false?', options: ['The code inside runs anyway', 'The code inside is skipped', 'The program crashes', 'The sprite disappears'], answer: 1 },
          { q: 'What does ELSE mean?', options: ['Do this if the condition is true', 'Do this if the condition is false', 'Always do this', 'Never do this'], answer: 1 },
        ],
      },
      {
        title: 'Variables: Storing Information',
        completed: false,
        xp: 70,
        content: {
          explanation: 'A VARIABLE is like a labelled box that holds a value. You give it a name (like "score" or "lives") and store a number or word inside. You can change the value at any time!\n\nVariables are essential because they let your program REMEMBER things. Without variables, you couldn\'t keep score, track lives, or remember the user\'s name.',
          example: '// Create and use variables\nset score to 0\nset lives to 3\nset playerName to "Alex"\n\n// Change a variable\nchange score by 10     // score is now 10\nchange lives by -1     // lives is now 2\n\n// Use a variable in output\nsay("Hi, " + playerName + "! Score: " + score)',
          activity: 'Create a clicking game: make a variable called "score" starting at 0. When the sprite is clicked, increase the score by 1 and display it. Can you reach 20 clicks in 10 seconds?',
          keyWords: ['variable', 'value', 'store', 'change', 'name', 'set'],
        },
        quiz: [
          { q: 'What is a variable?', options: ['A type of sprite', 'A named container that holds a value', 'A sound block', 'A background'], answer: 1 },
          { q: 'If score is 15 and you "change score by 5", what is score now?', options: ['5', '15', '20', '150'], answer: 2 },
          { q: 'Why are variables important?', options: ['They make code look pretty', 'They let the program remember information', 'They are not important', 'They only work in Python'], answer: 1 },
        ],
      },
      {
        title: 'Combining Ideas',
        completed: false,
        xp: 80,
        content: {
          explanation: 'Now you know sequences, input, output, conditions, loops, events, and variables — let\'s combine them! Real programs use ALL of these ideas together.\n\nA game might use EVENTS to detect key presses, VARIABLES to track the score, CONDITIONS to check for collisions, LOOPS to keep the game running, and OUTPUT to display messages. Combining ideas is where coding gets really exciting!',
          example: '// A mini game combining everything!\nwhen green flag clicked {\n  set score to 0\n  ask("What is your name?")\n  say("Good luck, " + answer + "!")\n  \n  repeat 10 {\n    move(20)\n    if touching "star" {\n      change score by 10\n      say("Got one! Score: " + score)\n    }\n  }\n  \n  if score > 50 {\n    say("Amazing!")\n  } else {\n    say("Good try!")\n  }\n}',
          activity: 'Build a mini quiz program: ask 3 questions (use ASK blocks), check each answer with IF blocks, give 10 points per correct answer with a variable, and display the final score.',
          keyWords: ['combine', 'integrate', 'design', 'program', 'solve'],
        },
        quiz: [
          { q: 'Can you use loops, conditions, and variables in the same program?', options: ['No, you can only use one at a time', 'Yes! Real programs combine many coding concepts', 'Only professionals can do that', 'The computer would get confused'], answer: 1 },
          { q: 'What does a game need to track the score?', options: ['A loop', 'A variable', 'A background', 'A sound'], answer: 1 },
          { q: 'To make a game that runs until the player loses, you would use...', options: ['An event only', 'A loop with a condition', 'Just one SAY block', 'Three variables'], answer: 1 },
        ],
      },
      {
        title: 'Project: My Interactive Story',
        completed: false,
        xp: 150,
        content: {
          explanation: 'Time to create your first big project! You will build an INTERACTIVE STORY — a story where the user makes choices and the story changes based on their answers.\n\nYour story needs: at least 2 characters (sprites), dialogue using SAY blocks, at least 1 question where the user chooses what happens next, and a happy ending. Plan your story on paper first, then build it step by step!',
          example: '// Plan your story:\n// Scene 1: Two characters meet\n// Scene 2: They discover a mystery\n// Scene 3: The user chooses which path to take\n// Scene 4a: Path A outcome\n// Scene 4b: Path B outcome\n\nwhen green flag clicked {\n  Cat: say("Hello! Shall we explore the forest?")\n  wait(2)\n  ask("Do you want to go left or right?")\n  if answer = "left" {\n    Cat: say("Let\'s go left!")\n    // Adventure continues...\n  } else {\n    Cat: say("Right it is!")\n    // Different adventure...\n  }\n}',
          activity: 'Build a 3-scene interactive story with 2 sprites. Include dialogue, user choices (using ASK), and different endings based on the user\'s decisions. Make it fun and creative!',
          keyWords: ['project', 'story', 'interactive', 'creative', 'dialogue', 'choice'],
        },
        quiz: [
          { q: 'What makes a story "interactive"?', options: ['It has pictures', 'The user makes choices that affect what happens', 'It is very long', 'It uses lots of colours'], answer: 1 },
          { q: 'What should you do BEFORE coding your story?', options: ['Start coding immediately', 'Plan the story on paper first', 'Delete all your old work', 'Ask someone else to do it'], answer: 1 },
          { q: 'What block lets the user choose what happens next?', options: ['SAY', 'MOVE', 'ASK', 'REPEAT'], answer: 2 },
        ],
      },
    ],
  },

  // ---- COURSE 2: Sprite School (Y3 Sprite Course) ----
  {
    id: 'y3-sprite-school',
    title: 'Sprite School',
    description: 'Master the art of sprites! Learn to create, move, animate, and control characters on the stage. Build your own sprite animations and simple games!',
    icon: '🎭',
    color: '#ec4899',
    yearGroup: 3,
    difficulty: 'Year 3',
    lessons: 22,
    duration: '11 hours',
    progress: 0,
    topics: ['Sprites', 'Movement', 'Costumes', 'Animation', 'Backdrops', 'Sound', 'Coordination'],
    modules: [
      {
        title: 'Meet the Sprites',
        completed: false,
        xp: 40,
        content: {
          explanation: 'Sprites are the characters, objects, and everything that moves in your projects! Each sprite lives on the STAGE — a big area where the action happens. You can have many sprites at once, and each one has its own code.\n\nSprites can be animals, people, objects, or anything you can imagine! The sprite library has hundreds of ready-made sprites, or you can draw your own.',
          example: '// Each sprite has properties:\n// Name: "Cat", "Dog", "Star"\n// Position: x (left-right), y (up-down)\n// Size: 100 means normal size\n// Direction: which way it faces (0-360)\n\n// Look at a sprite\'s properties:\nsprite name: "Cat"\nx position: 0\ny position: 0\nsize: 100%\ndirection: 90 (facing right)',
          activity: 'Add 3 different sprites to the stage from the sprite library: an animal, a person, and an object. Move each one to a different position using the mouse. Then add a backdrop!',
          keyWords: ['sprite', 'stage', 'character', 'position', 'library'],
        },
        quiz: [
          { q: 'What is a sprite?', options: ['The background image', 'A character or object on the stage', 'A type of code block', 'The whole screen'], answer: 1 },
          { q: 'Where do sprites live?', options: ['In the code editor', 'On the stage', 'In the menu', 'On the desktop'], answer: 1 },
          { q: 'Can you have more than one sprite?', options: ['No, only one', 'Yes, you can have many sprites', 'Only two at a time', 'Only in Year 6'], answer: 1 },
        ],
      },
      {
        title: 'Moving Sprites Around',
        completed: false,
        xp: 50,
        content: {
          explanation: 'The stage is like a grid with an X axis (left and right) and a Y axis (up and down). The centre is x:0, y:0. Moving RIGHT increases x. Moving UP increases y.\n\nYou can move sprites using MOVE, GLIDE, GO TO, and CHANGE X/Y blocks. MOVE goes forward in the direction the sprite faces. GLIDE moves smoothly over time. GO TO jumps instantly.',
          example: '// Move forward 50 steps\nmove(50)\n\n// Glide smoothly to a position (takes 1 second)\nglide 1 sec to x: 100 y: 50\n\n// Jump instantly to a position\ngo to x: -200 y: 0\n\n// Move just left/right or up/down\nchange x by 30    // move right 30\nchange y by -20   // move down 20',
          activity: 'Make a sprite travel in a big square around the stage using GLIDE blocks. Start at the top-left, glide to top-right, then bottom-right, then bottom-left, then back to the start!',
          keyWords: ['move', 'glide', 'go to', 'x', 'y', 'position', 'direction'],
        },
        quiz: [
          { q: 'What does "change x by 10" do?', options: ['Moves the sprite up', 'Moves the sprite to the right', 'Makes the sprite bigger', 'Rotates the sprite'], answer: 1 },
          { q: 'What is the centre of the stage?', options: ['x: 100, y: 100', 'x: 0, y: 0', 'x: -100, y: -100', 'x: 50, y: 50'], answer: 1 },
          { q: 'What is the difference between MOVE and GLIDE?', options: ['No difference', 'MOVE is instant, GLIDE moves smoothly over time', 'GLIDE is faster', 'MOVE only works on cats'], answer: 1 },
        ],
      },
      {
        title: 'Costumes & Looks',
        completed: false,
        xp: 55,
        content: {
          explanation: 'Every sprite can have multiple COSTUMES — these are different pictures of the sprite. A cat might have legs up, legs down, etc. Switching between costumes quickly creates ANIMATION!\n\nYou can also change a sprite\'s size, make it visible or invisible, apply colour effects, and add speech or thought bubbles.',
          example: '// Switch costume\nswitch costume to "cat-walk-1"\nwait(0.2)\nswitch costume to "cat-walk-2"\n\n// Change size\nset size to 150%   // bigger!\nset size to 50%    // smaller!\nchange size by 10  // grow a little\n\n// Visual effects\nset colour effect to 50\nset ghost effect to 30   // semi-transparent\nclear graphic effects     // reset everything',
          activity: 'Choose a sprite that has multiple costumes (like the cat or the dancer). Write code that switches between costumes every 0.3 seconds inside a loop to create a walking animation!',
          keyWords: ['costume', 'switch', 'size', 'effect', 'animation', 'appearance'],
        },
        quiz: [
          { q: 'What is a costume?', options: ['A Halloween outfit', 'A different picture of the same sprite', 'A type of background', 'A sound effect'], answer: 1 },
          { q: 'How do you make a sprite look like it is walking?', options: ['Move it very fast', 'Switch between different costumes quickly', 'Make it spin', 'Change its colour'], answer: 1 },
          { q: 'What does "set size to 200%" do?', options: ['Makes the sprite invisible', 'Makes the sprite twice as big', 'Makes the sprite half as big', 'Doubles the sprite\'s speed'], answer: 1 },
        ],
      },
      {
        title: 'Animating with Loops',
        completed: false,
        xp: 60,
        content: {
          explanation: 'By combining costumes and loops, you can create smooth, realistic animations! The key is to switch costume, wait a tiny bit, then switch again — all inside a FOREVER or REPEAT loop.\n\nYou can also animate movement: make a sprite glide back and forth, bounce around the stage, or spin in a circle. Add size changes for a "breathing" or "pulsing" effect!',
          example: '// Walking animation\nforever {\n  next costume\n  move(5)\n  wait(0.1)\n  if touching "edge" {\n    turn(180)\n  }\n}\n\n// Pulsing animation\nforever {\n  repeat 10 {\n    change size by 2   // grow\n    wait(0.05)\n  }\n  repeat 10 {\n    change size by -2  // shrink\n    wait(0.05)\n  }\n}',
          activity: 'Create a sprite that walks across the stage, bounces off the edges, and "breathes" (grows slightly then shrinks) while walking. Use nested loops!',
          keyWords: ['animate', 'loop', 'forever', 'costume switch', 'smooth', 'wait'],
        },
        quiz: [
          { q: 'What makes animation look smooth?', options: ['Using very long waits', 'Switching costumes quickly with short waits between', 'Using only one costume', 'Making the sprite invisible'], answer: 1 },
          { q: 'What does a FOREVER loop do?', options: ['Runs once', 'Runs 10 times', 'Runs until you stop the program', 'Runs backwards'], answer: 2 },
          { q: 'Why do we add WAIT blocks in animation?', options: ['To make the program crash', 'To slow it down so we can see each costume change', 'Waits are not needed', 'To delete the sprite'], answer: 1 },
        ],
      },
      {
        title: 'Backdrops & Scenes',
        completed: false,
        xp: 55,
        content: {
          explanation: 'BACKDROPS are the background images for your stage. Just like costumes for sprites, the stage can have multiple backdrops that you switch between to create different SCENES in your story or game.\n\nYou can change backdrops using code, which is great for making multi-scene projects like animated stories, level-based games, or presentations!',
          example: '// Switch backdrop\nswitch backdrop to "beach"\nwait(3)\nswitch backdrop to "forest"\n\n// Use backdrop change as an event\nwhen backdrop switches to "game over" {\n  say("Thanks for playing!")\n  stop all\n}\n\n// Scene system\nset scene to 1\nswitch backdrop to "scene1"\n// ... later ...\nchange scene by 1\nswitch backdrop to "scene2"',
          activity: 'Create a 3-scene story: Scene 1 (bedroom — morning), Scene 2 (school — daytime), Scene 3 (park — afternoon). Add a sprite that says something different in each scene!',
          keyWords: ['backdrop', 'scene', 'background', 'switch', 'stage'],
        },
        quiz: [
          { q: 'What is a backdrop?', options: ['A type of sprite', 'The background image for the stage', 'A sound effect', 'A variable'], answer: 1 },
          { q: 'How do you change scenes?', options: ['Delete the stage', 'Switch to a different backdrop', 'Create a new project', 'Close the browser'], answer: 1 },
          { q: 'Can you trigger code when a backdrop changes?', options: ['No, backdrops are just pictures', 'Yes, using "when backdrop switches to" event', 'Only in Python', 'Only adults can do that'], answer: 1 },
        ],
      },
      {
        title: 'Sound & Music',
        completed: false,
        xp: 55,
        content: {
          explanation: 'Sound brings your projects to life! You can play pre-made sounds from the library, record your own, or even make music with code. Sounds can play alongside other code, or you can wait until a sound finishes.\n\nEach sprite can have its own collection of sounds. Time your sounds with animations for professional-feeling projects!',
          example: '// Play a sound and wait for it to finish\nplay sound "meow" until done\n\n// Play a sound without waiting (good for background music)\nstart sound "dance music"\n\n// Musical notes\nplay note 60 for 0.5 beats   // middle C\nplay note 64 for 0.5 beats   // E\nplay note 67 for 0.5 beats   // G\n\n// Sound effects\nset volume to 80%\nchange pitch effect by 30',
          activity: 'Create a musical keyboard: add 7 sprites (one for each note C to B). When each sprite is clicked, play the correct musical note. Then compose a simple tune!',
          keyWords: ['sound', 'music', 'play', 'note', 'volume', 'audio'],
        },
        quiz: [
          { q: 'What is the difference between "play sound" and "start sound"?', options: ['No difference', '"Play sound until done" waits, "start sound" plays alongside other code', '"Start sound" is louder', '"Play sound" is faster'], answer: 1 },
          { q: 'Can sprites have their own sounds?', options: ['No, sounds are only on the stage', 'Yes, each sprite has its own sound library', 'Only the cat sprite can have sounds', 'Sounds only work in games'], answer: 1 },
          { q: 'How do you make a sound quieter?', options: ['Delete it', 'Change the volume', 'Play it backwards', 'Make the sprite smaller'], answer: 1 },
        ],
      },
      {
        title: 'Sprite Communication',
        completed: false,
        xp: 65,
        content: {
          explanation: 'When you have multiple sprites, they need to COMMUNICATE! Broadcasting is like sending a radio message. One sprite BROADCASTS a message, and other sprites listen for it with "when I receive" blocks.\n\nThis is how you coordinate timing between sprites — like making two characters have a conversation, or triggering an explosion when a bullet hits an enemy.',
          example: '// Sprite 1 (Cat) sends a message\nwhen green flag clicked {\n  say("Hey Dog, fetch the ball!")\n  wait(2)\n  broadcast "fetch"\n}\n\n// Sprite 2 (Dog) receives the message\nwhen I receive "fetch" {\n  say("Woof! On it!")\n  glide 1 sec to x: 100 y: -50\n  say("Got it!")\n  broadcast "return"\n}\n\n// Sprite 1 (Cat) receives the response\nwhen I receive "return" {\n  say("Good boy!")\n}',
          activity: 'Create a conversation between 3 sprites using BROADCAST. Sprite 1 talks, then broadcasts to Sprite 2, who responds and broadcasts to Sprite 3, who has the last word!',
          keyWords: ['broadcast', 'receive', 'message', 'communicate', 'coordinate', 'timing'],
        },
        quiz: [
          { q: 'What does BROADCAST do?', options: ['Deletes a message', 'Sends a message all sprites can listen for', 'Moves a sprite', 'Changes the backdrop'], answer: 1 },
          { q: 'How does a sprite listen for a broadcast?', options: ['It doesn\'t need to', 'Using "when I receive [message]"', 'Using the ASK block', 'Using a variable'], answer: 1 },
          { q: 'Why is broadcasting useful?', options: ['It makes sprites louder', 'It coordinates timing between multiple sprites', 'It saves memory', 'It only works with two sprites'], answer: 1 },
        ],
      },
      {
        title: 'Drawing with the Pen',
        completed: false,
        xp: 60,
        content: {
          explanation: 'The PEN tool lets your sprite draw lines on the stage as it moves — like holding a marker and dragging it across paper! You can change the pen colour, thickness, and even stamp copies of the sprite.\n\nCombine pen drawing with loops to create amazing patterns, geometric art, and spirals!',
          example: '// Basic pen drawing\npen down           // start drawing\nmove(100)\nturn(90)\nmove(100)\npen up             // stop drawing\n\n// Change pen properties\nset pen colour to "red"\nset pen size to 5\n\n// Draw a colourful spiral\npen down\nrepeat 36 {\n  move(50)\n  turn(100)\n  change pen colour by 10\n}',
          activity: 'Use the pen to draw a house: a square for the walls and a triangle for the roof. Colour the walls blue and the roof red. Add a yellow door!',
          keyWords: ['pen', 'draw', 'pen down', 'pen up', 'colour', 'stamp'],
        },
        quiz: [
          { q: 'When does the pen start drawing?', options: ['Automatically', 'When you use "pen down"', 'When the sprite moves', 'When you press space'], answer: 1 },
          { q: 'How do you stop drawing?', options: ['Delete the sprite', 'Use "pen up"', 'Close the project', 'Change the backdrop'], answer: 1 },
          { q: 'What does STAMP do?', options: ['Deletes the sprite', 'Leaves a copy of the sprite\'s image on the stage', 'Makes a sound', 'Changes the pen colour'], answer: 1 },
        ],
      },
      {
        title: 'Sprite Interactions',
        completed: false,
        xp: 65,
        content: {
          explanation: 'Sprites can detect when they TOUCH each other or touch specific colours! This is called COLLISION DETECTION and it\'s essential for games.\n\nUse "touching [sprite]?" and "touching colour?" conditions inside IF blocks to trigger actions when sprites interact — like scoring points, losing lives, or collecting items.',
          example: '// Detect touching another sprite\nforever {\n  if touching "Star" {\n    say("Got a star!")\n    change score by 10\n    Star: go to random position\n  }\n}\n\n// Detect touching a colour\nforever {\n  if touching colour "red" {\n    say("Ouch! That\'s lava!")\n    change lives by -1\n    go to x: 0 y: 0  // reset position\n  }\n}\n\n// Detect touching the edge\nif touching "edge" {\n  bounce\n}',
          activity: 'Make a simple collector game: the player sprite moves with arrow keys, stars appear randomly, and when the player touches a star, the score goes up and the star moves to a new spot!',
          keyWords: ['touching', 'collision', 'detect', 'interact', 'overlap'],
        },
        quiz: [
          { q: 'What is collision detection?', options: ['Crashing the program', 'Checking if two sprites are touching', 'Deleting sprites', 'A type of variable'], answer: 1 },
          { q: 'What block checks if a sprite is touching another?', options: ['move(10)', 'touching "Star"?', 'say("Hi")', 'set x to 100'], answer: 1 },
          { q: 'Why is collision detection important in games?', options: ['It is not important', 'It tells the game when players collect items or hit enemies', 'It makes the game slower', 'It only works with the cat sprite'], answer: 1 },
        ],
      },
      {
        title: 'Cloning Sprites',
        completed: false,
        xp: 70,
        content: {
          explanation: 'CLONING creates copies of a sprite that act independently! Each clone has its own position, size, and behaviour. This is perfect for creating many similar objects: rain drops, falling stars, enemies, or particles.\n\nYou create clones with "create clone of myself" and give them behaviour with "when I start as a clone." Always delete clones when done to keep your project running smoothly!',
          example: '// Create rain drops\nforever {\n  create clone of myself\n  wait(0.1)\n}\n\n// Each clone falls down\nwhen I start as a clone {\n  set size to random(30, 80)%\n  go to x: random(-240, 240) y: 180\n  repeat 40 {\n    change y by -8\n  }\n  delete this clone\n}',
          activity: 'Create a snowfall effect: clone a snowflake sprite. Each clone should start at a random x position at the top, fall down at a random speed, and delete itself when it reaches the bottom.',
          keyWords: ['clone', 'create', 'copy', 'instance', 'delete', 'independent'],
        },
        quiz: [
          { q: 'What does cloning do?', options: ['Deletes a sprite', 'Creates an independent copy of a sprite', 'Changes the sprite\'s costume', 'Stops the program'], answer: 1 },
          { q: 'Why should you delete clones when they are done?', options: ['For fun', 'Too many clones slow down the project', 'Clones delete automatically', 'You never need to delete clones'], answer: 1 },
          { q: 'How does each clone know what to do?', options: ['They copy the original sprite\'s code', 'Using "when I start as a clone" blocks', 'They have no behaviour', 'They read your mind'], answer: 1 },
        ],
      },
      {
        title: 'Project: Sprite Animation Show',
        completed: false,
        xp: 150,
        content: {
          explanation: 'Create an amazing ANIMATION SHOW! This is a 30-second animated performance featuring multiple sprites, costume animations, backdrops, sound, broadcasting, and pen effects.\n\nThink of it like a short animated film! Plan your scenes, choreograph your sprites, and time everything perfectly. This is your chance to show off everything you\'ve learned!',
          example: '// Animation Show Plan:\n// Scene 1 (0-10s): Intro — title appears, background music starts\n// Scene 2 (10-20s): Main act — sprites dance, change costumes, use pen\n// Scene 3 (20-30s): Finale — all sprites come together, fireworks (clones!)\n\nwhen green flag clicked {\n  switch backdrop to "title"\n  start sound "music"\n  wait(3)\n  broadcast "start show"\n}\n\nwhen I receive "start show" {\n  switch backdrop to "stage"\n  // Sprite animations begin...\n}',
          activity: 'Build a 30-second animation show with: at least 3 sprites, costume animations, 2+ backdrops, sound effects/music, broadcasting for timing, and a grand finale! Share it with friends!',
          keyWords: ['animation', 'show', 'project', 'choreograph', 'creative', 'performance'],
        },
        quiz: [
          { q: 'What should you do before coding an animation show?', options: ['Start coding immediately', 'Plan the scenes and timing first', 'Delete old projects', 'Only use one sprite'], answer: 1 },
          { q: 'How do you coordinate sprites in a show?', options: ['Hope they work together', 'Use BROADCAST and RECEIVE blocks', 'Only use one sprite', 'Turn off the computer'], answer: 1 },
          { q: 'What makes a good animation show?', options: ['Only movement', 'Movement, sound, costumes, and good timing', 'Lots of bugs', 'No planning'], answer: 1 },
        ],
      },
    ],
  },

  // ---- COURSE 3: Patterns & Art (Y3) ----
  {
    id: 'y3-patterns',
    title: 'Patterns & Art',
    description: 'Combine maths and creativity to make stunning digital art! Learn to code geometric patterns, spirals, symmetry, and colourful designs.',
    icon: '🎨',
    color: '#f43f5e',
    yearGroup: 3,
    difficulty: 'Year 3',
    lessons: 20,
    duration: '10 hours',
    progress: 0,
    topics: ['Patterns', 'Shapes', 'Colours', 'Repetition', 'Symmetry', 'Angles', 'Pen Art'],
    modules: [
      {
        title: 'Drawing Basic Shapes',
        completed: false,
        xp: 40,
        content: {
          explanation: 'Every shape is made of straight lines and turns! A square has 4 sides with 90° turns. A triangle has 3 sides with 120° turns. The secret formula: the turn angle is 360 ÷ number of sides.\n\nSo a pentagon (5 sides) needs 360÷5 = 72° turns. A hexagon (6 sides) needs 360÷6 = 60° turns. With this formula, you can draw ANY regular polygon!',
          example: '// Draw a triangle (360 ÷ 3 = 120°)\npen down\nrepeat 3 {\n  move(100)\n  turn(120)\n}\n\n// Draw a pentagon (360 ÷ 5 = 72°)\npen down\nrepeat 5 {\n  move(80)\n  turn(72)\n}\n\n// Draw any polygon:\n// sides = 8, angle = 360 ÷ 8 = 45°\nrepeat 8 {\n  move(60)\n  turn(45)\n}',
          activity: 'Draw a triangle, square, pentagon, hexagon, and octagon. Label each one. What happens if you try 36 sides — does it look like a circle?',
          keyWords: ['shape', 'polygon', 'angle', 'turn', 'side', 'degrees'],
        },
        quiz: [
          { q: 'What is the turn angle for a square?', options: ['45°', '60°', '90°', '120°'], answer: 2 },
          { q: 'How do you calculate the turn angle for any polygon?', options: ['Random guess', '360 ÷ number of sides', 'Number of sides × 2', '180 ÷ number of sides'], answer: 1 },
          { q: 'A hexagon has how many sides?', options: ['4', '5', '6', '8'], answer: 2 },
        ],
      },
      {
        title: 'Colour & Style',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Colour makes your art come alive! You can set the pen colour using colour names, colour numbers (0-199 on the colour wheel), or RGB values. Changing colour inside a loop creates rainbow effects!\n\nYou can also change the pen SIZE (thickness) to make thick or thin lines, creating depth and contrast in your artwork.',
          example: '// Set specific colours\nset pen colour to "red"\nmove(100)\nset pen colour to "blue"\nmove(100)\n\n// Rainbow effect in a loop\nrepeat 36 {\n  change pen colour by 5   // shift through rainbow\n  move(50)\n  turn(100)\n}\n\n// Change pen thickness\nset pen size to 1    // thin\nmove(100)\nset pen size to 10   // thick\nmove(100)',
          activity: 'Draw a rainbow: 7 arcs in red, orange, yellow, green, blue, indigo, violet. Each arc should be slightly smaller than the last. Change the pen size for each colour!',
          keyWords: ['colour', 'pen', 'style', 'rainbow', 'thickness', 'hue'],
        },
        quiz: [
          { q: 'What does "change pen colour by 5" do?', options: ['Makes the pen bigger', 'Shifts the colour along the colour wheel', 'Deletes the colour', 'Makes the background change'], answer: 1 },
          { q: 'How do you make thicker lines?', options: ['Draw faster', 'Increase pen size', 'Use capital letters', 'Use a bigger sprite'], answer: 1 },
          { q: 'How many colours are in a rainbow?', options: ['3', '5', '7', '10'], answer: 2 },
        ],
      },
      {
        title: 'Repeating Patterns',
        completed: false,
        xp: 60,
        content: {
          explanation: 'The most beautiful patterns come from repetition with small changes! Draw a shape, rotate slightly, draw it again, and keep going. The slight rotation creates spirals, flowers, and stunning geometric designs.\n\nThe key insight: patterns emerge from simple rules applied many times. Even tiny changes in angle or size compound into complex and beautiful results!',
          example: '// Star burst pattern\nrepeat 36 {\n  move(100)\n  turn(170)\n}\n\n// Spiral squares\nset size to 10\nrepeat 50 {\n  repeat 4 {\n    move(size)\n    turn(90)\n  }\n  change size by 3\n  turn(10)\n  change pen colour by 3\n}\n\n// Flower pattern\nrepeat 12 {\n  repeat 4 {\n    move(60)\n    turn(90)\n  }\n  turn(30)\n}',
          activity: 'Create 3 different patterns by changing the repeat count, move distance, and turn angle in a simple loop. Screenshot your favourite and share it! Try turn angles like 170, 144, and 160.',
          keyWords: ['pattern', 'spiral', 'repetition', 'rotation', 'geometric'],
        },
        quiz: [
          { q: 'What makes patterns interesting?', options: ['Using only one colour', 'Repetition with small changes each time', 'Drawing one big shape', 'Using only straight lines'], answer: 1 },
          { q: 'What happens if you repeat { move(50) turn(170) } many times?', options: ['Nothing', 'A square', 'A beautiful star/spiral pattern', 'An error'], answer: 2 },
          { q: 'Why are loops essential for patterns?', options: ['They look nice', 'You need to repeat the same steps many times', 'They are not essential', 'They change colours'], answer: 1 },
        ],
      },
      {
        title: 'Symmetry in Code',
        completed: false,
        xp: 60,
        content: {
          explanation: 'SYMMETRY means both sides look the same, like a mirror image. Snowflakes have 6-fold symmetry, butterflies have 2-fold symmetry, and stars can have 5-fold symmetry.\n\nTo code symmetry, draw one "arm" of the pattern, then rotate by (360 ÷ number of arms) and draw it again. A function or "my block" lets you define the arm once and reuse it!',
          example: '// 6-fold symmetry (like a snowflake)\ndefine draw-arm {\n  move(60)\n  turn(45)\n  move(30)\n  turn(-90)\n  move(30)\n  turn(45)\n  move(-60)   // return to centre\n}\n\nrepeat 6 {\n  draw-arm\n  turn(60)     // 360 ÷ 6\n}',
          activity: 'Code a snowflake with 6 symmetrical arms. Design your own arm pattern — make it as simple or complex as you like. Change the pen colour for each arm!',
          keyWords: ['symmetry', 'mirror', 'reflection', 'arm', 'fold', 'centre'],
        },
        quiz: [
          { q: 'What is symmetry?', options: ['When things are random', 'When both sides match like a mirror', 'When shapes are very big', 'A type of loop'], answer: 1 },
          { q: 'A snowflake has which type of symmetry?', options: ['2-fold', '4-fold', '6-fold', '100-fold'], answer: 2 },
          { q: 'To code 5-fold symmetry, how many degrees do you rotate between arms?', options: ['72°', '90°', '60°', '45°'], answer: 0 },
        ],
      },
      {
        title: 'Stamp Art',
        completed: false,
        xp: 55,
        content: {
          explanation: 'The STAMP block leaves a copy of the sprite\'s current image on the stage. Combined with movement, costume changes, and size changes, you can create amazing collage-style art!\n\nTry stamping at different sizes, rotations, and colours to create tile patterns, mandalas, or abstract compositions.',
          example: '// Stamp pattern\nrepeat 12 {\n  stamp\n  turn(30)\n  change size by -5\n  change colour effect by 15\n}\n\n// Grid of stamps\ngo to x: -200 y: 150\nrepeat 5 {\n  repeat 5 {\n    stamp\n    change x by 80\n  }\n  set x to -200\n  change y by -80\n  next costume\n}',
          activity: 'Create a grid of stamps: 4 rows × 4 columns. Each row should use a different costume and colour. Then create a circular stamp mandala by stamping while rotating around the centre!',
          keyWords: ['stamp', 'copy', 'grid', 'mandala', 'collage', 'art'],
        },
        quiz: [
          { q: 'What does the STAMP block do?', options: ['Deletes the sprite', 'Leaves a copy of the sprite image on the stage', 'Changes the background', 'Plays a sound'], answer: 1 },
          { q: 'Can you stamp at different sizes?', options: ['No, stamps are always the same size', 'Yes, change the sprite\'s size before stamping', 'Stamps don\'t have sizes', 'Only big stamps work'], answer: 1 },
        ],
      },
      {
        title: 'Project: Digital Art Gallery',
        completed: false,
        xp: 130,
        content: {
          explanation: 'Create your own DIGITAL ART GALLERY with at least 4 coded artworks! Each artwork should use a different technique: geometric shapes, colour patterns, symmetry, and stamp art.\n\nPresent them on different backdrops like a real gallery. Add labels with titles and a "next" button to navigate between artworks!',
          example: '// Gallery structure:\n// Backdrop 1: "Welcome to my Gallery"\n// Backdrop 2: Artwork 1 — Geometric Pattern\n// Backdrop 3: Artwork 2 — Rainbow Spiral\n// Backdrop 4: Artwork 3 — Snowflake Symmetry\n// Backdrop 5: Artwork 4 — Stamp Collage\n\nwhen key "right" pressed {\n  erase all\n  next backdrop\n  broadcast "draw art"\n}',
          activity: 'Build a 4-artwork gallery. Each artwork must use a DIFFERENT technique. Add a title for each piece, and use the right arrow key to move between artworks. Make something you\'re proud of!',
          keyWords: ['gallery', 'art', 'creative', 'portfolio', 'exhibition', 'design'],
        },
        quiz: [
          { q: 'How many artworks should your gallery have?', options: ['1', '2', 'At least 4', 'Exactly 100'], answer: 2 },
          { q: 'What makes a good art gallery project?', options: ['Only one technique', 'Variety — different techniques in each piece', 'No colours', 'All the same pattern'], answer: 1 },
        ],
      },
    ],
  },


  /* ====== YEAR 4 - Ages 8-9 ====== */

  // ---- COURSE 4: Game Maker (Y4) ----
  {
    id: 'y4-game-maker',
    title: 'Game Maker',
    description: 'Design and build real games from scratch! Learn scoring, player controls, collision detection, levels, and game polish. Create games your friends will want to play!',
    icon: '🎮',
    color: '#f97316',
    yearGroup: 4,
    difficulty: 'Year 4',
    lessons: 28,
    duration: '14 hours',
    progress: 0,
    topics: ['Game Design', 'Variables', 'Scoring', 'Conditions', 'Collision', 'Levels', 'Polish'],
    modules: [
      {
        title: 'What Makes a Great Game?',
        completed: false,
        xp: 50,
        content: {
          explanation: 'Every great game has 4 key elements: a PLAYER (who you control), a GOAL (what you are trying to achieve), a CHALLENGE (what makes it difficult), and FEEDBACK (how the game tells you what is happening).\n\nThink about Minecraft: the player explores, the goal is to survive and build, the challenge is monsters and hunger, and the feedback is health bars and inventory. Before coding, PLAN your game!',
          example: '// Game Design Document:\n// Name: Star Catcher\n// Player: A spaceship (controlled with arrow keys)\n// Goal: Collect 20 stars before time runs out\n// Challenge: Asteroids to dodge, 60-second timer\n// Feedback: Score display, timer, sound effects\n// Levels: Speed increases every 10 stars\n\n// Always plan BEFORE you code!',
          activity: 'Create a Game Design Document for your dream game. Write down: the name, what the player does, what the goal is, what makes it challenging, and how you will give the player feedback.',
          keyWords: ['game design', 'player', 'goal', 'challenge', 'feedback', 'plan'],
        },
        quiz: [
          { q: 'What are the 4 key elements of a game?', options: ['Code, sprites, sounds, backdrops', 'Player, goal, challenge, feedback', 'Start, middle, end, credits', 'Keyboard, mouse, screen, speakers'], answer: 1 },
          { q: 'Why should you plan a game before coding?', options: ['You should not plan', 'Planning helps you build a better game with fewer bugs', 'Planning wastes time', 'Only adults need to plan'], answer: 1 },
          { q: 'What is "feedback" in a game?', options: ['When players complain', 'How the game tells you what is happening (sounds, scores, effects)', 'Coding errors', 'The game controls'], answer: 1 },
        ],
      },
      {
        title: 'Player Controls',
        completed: false,
        xp: 60,
        content: {
          explanation: 'The most important part of any game is how the player CONTROLS their character. Good controls feel smooth, responsive, and intuitive. Use key press events for movement, and consider using a speed variable so you can easily adjust how fast the player moves.\n\nThere are different control styles: 4-direction (arrow keys), 8-direction (diagonal too), mouse following, or click to move. Choose what works best for your game type!',
          example: '// 4-direction arrow key controls\nwhen key "right" pressed {\n  change x by speed\n}\nwhen key "left" pressed {\n  change x by (speed * -1)\n}\nwhen key "up" pressed {\n  change y by speed\n}\nwhen key "down" pressed {\n  change y by (speed * -1)\n}\n\n// Smooth continuous movement (better!)\nforever {\n  if key "right" pressed { change x by speed }\n  if key "left" pressed { change x by (speed * -1) }\n  if key "up" pressed { change y by speed }\n  if key "down" pressed { change y by (speed * -1) }\n}',
          activity: 'Create a player sprite with smooth 4-direction movement. Add a "speed" variable starting at 5. Add buttons (sprites) that increase or decrease the speed. Notice how smooth movement feels different from event-based movement!',
          keyWords: ['controls', 'movement', 'arrow keys', 'speed', 'smooth', 'responsive'],
        },
        quiz: [
          { q: 'Why use a speed variable instead of a fixed number?', options: ['Variables are slower', 'So you can easily change the speed in one place', 'It does not matter', 'Computers prefer variables'], answer: 1 },
          { q: 'What is the difference between event-based and continuous movement?', options: ['No difference', 'Continuous movement (forever loop) feels smoother', 'Event-based is always better', 'Continuous uses more sprites'], answer: 1 },
          { q: 'How do you move a sprite left?', options: ['change x by positive number', 'change x by negative number', 'change y by positive number', 'change y by negative number'], answer: 1 },
        ],
      },
      {
        title: 'Variables: Score, Lives & Timer',
        completed: false,
        xp: 75,
        content: {
          explanation: 'Games need to track MULTIPLE variables at once! The most common are SCORE (how well you are doing), LIVES (how many chances you have left), and TIMER (how long you have).\n\nCreate these variables at the start of the game, display them on screen, and update them when things happen. When lives reach 0 or the timer runs out — game over!',
          example: '// Setup at game start\nwhen green flag clicked {\n  set score to 0\n  set lives to 3\n  set timer to 60\n  \n  // Show variables on screen\n  show variable "score"\n  show variable "lives"\n  show variable "timer"\n}\n\n// Countdown timer\nforever {\n  wait(1)\n  change timer by -1\n  if timer = 0 {\n    broadcast "game over"\n  }\n}\n\n// Score when collecting\nif touching "coin" {\n  change score by 10\n  play sound "ding"\n}\n\n// Lose life when hit\nif touching "enemy" {\n  change lives by -1\n  if lives = 0 {\n    broadcast "game over"\n  }\n}',
          activity: 'Build the scoring system for a collector game: create score (starts at 0), lives (starts at 3), and timer (starts at 30). When the player touches a coin, +10 score. When they touch an enemy, -1 life. When timer reaches 0, game over!',
          keyWords: ['score', 'lives', 'timer', 'variable', 'track', 'display', 'game over'],
        },
        quiz: [
          { q: 'What three variables do most games track?', options: ['x, y, size', 'Score, lives, timer', 'Name, age, colour', 'Speed, direction, costume'], answer: 1 },
          { q: 'When should the game end?', options: ['Never', 'When lives reach 0 or time runs out', 'When the score reaches 100', 'After 1 minute always'], answer: 1 },
          { q: 'What does "change lives by -1" do?', options: ['Adds a life', 'Removes a life', 'Sets lives to -1', 'Creates a new variable'], answer: 1 },
        ],
      },
      {
        title: 'Collision Detection',
        completed: false,
        xp: 80,
        content: {
          explanation: 'COLLISION DETECTION is how your game knows when sprites touch each other. It is the backbone of nearly every game mechanic: collecting items, hitting enemies, reaching goals, and touching walls.\n\nCheck for collisions inside a FOREVER loop so the game constantly monitors what is happening. When a collision occurs, trigger the appropriate response: gain points, lose a life, play a sound, etc.',
          example: '// Continuous collision checking\nforever {\n  // Collect coins\n  if touching "Coin" {\n    change score by 5\n    play sound "collect"\n    Coin: go to random position\n  }\n  \n  // Hit by enemy\n  if touching "Enemy" {\n    change lives by -1\n    play sound "hurt"\n    go to x: 0 y: 0   // reset position\n    wait(1)            // brief invincibility\n  }\n  \n  // Reach the goal\n  if touching "Flag" {\n    broadcast "level complete"\n  }\n  \n  // Wall collision\n  if touching colour "black" {\n    move(-5)  // push back\n  }\n}',
          activity: 'Create a maze game: the player navigates through a maze (drawn with the pen or using a backdrop). If they touch the walls (a specific colour), they get pushed back. If they reach the end, they win!',
          keyWords: ['collision', 'touching', 'detect', 'response', 'collect', 'hit'],
        },
        quiz: [
          { q: 'Why check collisions in a forever loop?', options: ['It looks nice', 'So the game constantly checks if sprites are touching', 'It makes the game faster', 'You only need to check once'], answer: 1 },
          { q: 'What should happen when the player touches a coin?', options: ['Nothing', 'Increase score, play sound, move coin to new spot', 'End the game', 'Delete the player'], answer: 1 },
          { q: 'How can you detect walls in a maze?', options: ['Use a variable', 'Check if touching a specific colour', 'Count the sprites', 'Use a timer'], answer: 1 },
        ],
      },
      {
        title: 'Enemy Behaviour',
        completed: false,
        xp: 85,
        content: {
          explanation: 'Great games need interesting ENEMIES! You can program different AI behaviours to make enemies challenging:\n\n1. PATROL: Move back and forth in a set pattern\n2. CHASE: Follow the player\n3. RANDOM: Move in random directions\n4. GUARD: Stay in one area but attack if the player gets close\n\nStart simple and add complexity. Even basic patrol enemies can make a game exciting!',
          example: '// Patrol enemy (moves left-right)\nforever {\n  repeat 60 {\n    change x by 3\n  }\n  repeat 60 {\n    change x by -3\n  }\n}\n\n// Chase enemy (follows the player)\nforever {\n  point towards "Player"\n  move(2)\n  wait(0.05)\n}\n\n// Random wanderer\nforever {\n  move(3)\n  if touching "edge" { turn(180) }\n  if random(1, 100) < 5 {\n    turn(random(-90, 90))  // occasionally change direction\n  }\n}',
          activity: 'Add 3 different enemies to a game: one that patrols back and forth, one that chases the player, and one that wanders randomly. Which is the hardest to avoid?',
          keyWords: ['enemy', 'AI', 'patrol', 'chase', 'random', 'behaviour', 'guard'],
        },
        quiz: [
          { q: 'What are the 4 types of enemy behaviour described?', options: ['Fast, slow, medium, stopped', 'Patrol, chase, random, guard', 'Left, right, up, down', 'Big, small, tall, short'], answer: 1 },
          { q: 'How does a chase enemy work?', options: ['It runs away from the player', 'It points towards the player and moves forward', 'It stays still', 'It moves randomly'], answer: 1 },
          { q: 'What makes a patrol enemy turn around?', options: ['It reaches the edge or a set number of steps', 'It gets tired', 'The player clicks it', 'It changes costume'], answer: 0 },
        ],
      },
      {
        title: 'Levels & Difficulty',
        completed: false,
        xp: 85,
        content: {
          explanation: 'The best games get progressively HARDER! This is called DIFFICULTY SCALING. As the player improves, you increase the challenge to keep them engaged.\n\nWays to increase difficulty:\n- Increase enemy speed\n- Add more enemies\n- Decrease the timer\n- Make gaps smaller in platformers\n- Introduce new obstacle types\n\nUse a "level" variable and change game parameters based on it!',
          example: '// Level system\nset level to 1\nset enemySpeed to 2\nset spawnRate to 2\n\n// When player completes a level\nwhen I receive "level complete" {\n  change level by 1\n  change enemySpeed by 1\n  change spawnRate by -0.3\n  \n  say("Level " + level + "!")\n  wait(2)\n  broadcast "start level"\n}\n\n// Enemies use the speed variable\n// Enemy code:\nforever {\n  move(enemySpeed)\n  if touching "edge" { bounce }\n}',
          activity: 'Add a level system to your game: start at Level 1 with slow enemies. Every 50 points, advance to the next level — enemies get faster and spawn more frequently. Display the current level on screen!',
          keyWords: ['level', 'difficulty', 'scaling', 'speed', 'progression', 'harder'],
        },
        quiz: [
          { q: 'Why should games get harder?', options: ['To annoy the player', 'To keep the player challenged and engaged', 'Games should always be easy', 'Only professional games get harder'], answer: 1 },
          { q: 'Name one way to increase difficulty', options: ['Make the screen bigger', 'Increase enemy speed', 'Add more colours', 'Change the background'], answer: 1 },
          { q: 'What variable tracks the current level?', options: ['score', 'lives', 'level', 'timer'], answer: 2 },
        ],
      },
      {
        title: 'Sound Effects & Juice',
        completed: false,
        xp: 70,
        content: {
          explanation: '"GAME JUICE" is what makes games FEEL good — it is all the little details that make actions satisfying. Sound effects, screen shakes, particle effects, size pops, and flashes.\n\nWhen a player collects a coin: play a "ding" sound + briefly increase the coin\'s size + add sparkle particles. When they get hit: play a "crunch" sound + flash the sprite red + briefly shake. These details make the difference between an OK game and a GREAT game!',
          example: '// Juicy coin collect\nif touching "Coin" {\n  play sound "collect"\n  \n  // Pop effect on coin\n  Coin: set size to 150%\n  Coin: wait(0.1)\n  Coin: set size to 100%\n  Coin: go to random position\n  \n  // Flash player\n  set colour effect to 50\n  wait(0.1)\n  clear graphic effects\n  \n  change score by 10\n}\n\n// Screen shake when hit\nif touching "Enemy" {\n  play sound "hit"\n  repeat 5 {\n    change x by random(-5, 5)\n    change y by random(-5, 5)\n    wait(0.02)\n  }\n  go to x: 0 y: 0\n}',
          activity: 'Add "juice" to your game: add sound effects for collecting, getting hit, and game over. Add visual effects: size pops on collection, colour flash when hit, and a screen shake for big events!',
          keyWords: ['juice', 'sound', 'effects', 'polish', 'feedback', 'satisfying'],
        },
        quiz: [
          { q: 'What is "game juice"?', options: ['A type of drink', 'Little details that make actions feel satisfying', 'A bug in the code', 'Extra levels'], answer: 1 },
          { q: 'Why are sound effects important?', options: ['They are not important', 'They give the player instant feedback about what happened', 'They make the game louder', 'They slow the game down'], answer: 1 },
          { q: 'What is a "screen shake" used for?', options: ['To break the screen', 'To emphasise impactful moments like explosions or hits', 'To fix bugs', 'To change the backdrop'], answer: 1 },
        ],
      },
      {
        title: 'Game States & Menus',
        completed: false,
        xp: 80,
        content: {
          explanation: 'Professional games have different STATES: Title Screen, Playing, Paused, and Game Over. A variable called "gameState" tracks which state the game is in, and different code runs depending on the state.\n\nTitle screens make your game look professional. A game over screen with the final score gives the player closure. A "play again" button keeps them engaged!',
          example: '// Game state system\nset gameState to "title"\n\nforever {\n  if gameState = "title" {\n    switch backdrop to "title screen"\n    show sprite "Start Button"\n    hide sprite "Player"\n  }\n  if gameState = "playing" {\n    switch backdrop to "game"\n    hide sprite "Start Button"\n    show sprite "Player"\n    // Run game logic...\n  }\n  if gameState = "gameover" {\n    switch backdrop to "game over"\n    show sprite "Play Again Button"\n    say("Final Score: " + score)\n  }\n}\n\n// Start button\nwhen this sprite clicked {\n  set gameState to "playing"\n  set score to 0\n  set lives to 3\n}',
          activity: 'Add 3 game states to your game: a title screen (with game name and start button), the main game, and a game over screen (showing final score and a play again button). Make transitions smooth!',
          keyWords: ['state', 'title screen', 'game over', 'menu', 'play again', 'transition'],
        },
        quiz: [
          { q: 'What are the main game states?', options: ['Left, right, up, down', 'Title, playing, game over', 'Fast, medium, slow', 'Easy, normal, hard'], answer: 1 },
          { q: 'Why have a title screen?', options: ['It wastes time', 'It makes the game look professional and lets the player choose when to start', 'Title screens are old-fashioned', 'Only big companies use title screens'], answer: 1 },
          { q: 'What should a game over screen show?', options: ['Nothing', 'The final score and a way to play again', 'Just the word "bad"', 'A blank screen'], answer: 1 },
        ],
      },
      {
        title: 'Project: Complete Arcade Game',
        completed: false,
        xp: 200,
        content: {
          explanation: 'Build a COMPLETE ARCADE GAME from start to finish! Your game must include: player controls, collectibles with scoring, enemies with AI behaviour, a timer, lives, levels that get harder, game states (title, playing, game over), sound effects, and visual polish.\n\nChoose a game type: Collector (catch falling items), Maze Runner (navigate to the exit), Space Dodger (avoid asteroids), or design your own!',
          example: '// Complete Game Checklist:\n// [x] Player with smooth controls\n// [x] Score, lives (3), and timer variables\n// [x] At least 2 types of collectible\n// [x] At least 2 enemies with different AI\n// [x] Collision detection for all interactions\n// [x] 3+ levels with increasing difficulty\n// [x] Title screen with start button\n// [x] Game over screen with final score\n// [x] Play again functionality\n// [x] At least 4 sound effects\n// [x] Visual juice (pops, flashes, effects)',
          activity: 'Build the complete arcade game meeting ALL requirements on the checklist. Playtest it yourself and with friends. Fix any bugs you find. Polish it until it feels fun and satisfying!',
          keyWords: ['arcade', 'complete', 'project', 'game', 'playtest', 'polish'],
        },
        quiz: [
          { q: 'How many game states should your game have?', options: ['0', '1', 'At least 3 (title, playing, game over)', 'Exactly 100'], answer: 2 },
          { q: 'What is playtesting?', options: ['Writing more code', 'Playing your game to find bugs and improve it', 'Deleting the game', 'Asking someone else to build it'], answer: 1 },
          { q: 'What makes a game "complete"?', options: ['Having one sprite', 'Having all the features: controls, scoring, levels, menus, polish', 'Being very long', 'Having no bugs at all'], answer: 1 },
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
