// AUTO-GENERATED: UK National Curriculum CS Lessons Y3-Y6 (52 lessons)
// Do not edit by hand

export const csCurriculumCourses = [
  {
    "id": "y3-cs-foundations",
    "title": "Year 3: CS Foundations",
    "tagline": "Algorithms, sequences, loops & debugging with robots",
    "year": "Year 3",
    "color": "#10B981",
    "icon": "🤖",
    "totalXP": 1085,
    "modules": [
      {
        "title": "What are Algorithms?",
        "xp": 80,
        "content": {
          "explanation": "An algorithm is a set of step-by-step instructions that tells a computer — or a robot — exactly what to do. Just like a recipe tells a chef how to bake a cake, an algorithm tells a program how to solve a problem.\n\nThe order of instructions matters enormously. If you put your shoes on before your socks, something goes wrong! Computers are very literal: they follow each instruction exactly as written, in the exact order you give them.\n\nAlgorithms are everywhere in real life. When you get dressed in the morning, make a sandwich, or walk to school, you're following an algorithm — a sequence of steps that gets you to your goal. Programmers write algorithms every day to make apps, games, robots, and websites work.",
          "example": "// Algorithm: Make a sandwich\n// Step 1: Get two slices of bread\n// Step 2: Spread butter on one slice\n// Step 3: Add filling\n// Step 4: Place second slice on top\n// Step 5: Cut in half\n// Result: Sandwich ready to eat!",
          "activity": "Think of an everyday task you do each morning. Write out every single step as an algorithm. Swap with a friend and see if they can follow your instructions exactly — even if they seem silly or obvious!",
          "keyWords": [
            "algorithm",
            "sequence",
            "instruction",
            "order",
            "step"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Daily Life Algorithms",
              "duration": "15 mins",
              "desc": "Discover algorithms all around you",
              "steps": [
                "Discuss: how do you make a sandwich?",
                "Write each step on the board in order",
                "Change the order — what goes wrong?",
                "Spot the pattern: ORDER matters!",
                "Name three other daily-life algorithms"
              ]
            },
            {
              "num": 2,
              "title": "Robot Instruction Sequences",
              "duration": "20 mins",
              "desc": "Watch a robot follow instructions",
              "steps": [
                "Look at a pre-programmed ByteBuddies robot",
                "Robot follows: Move forward, Turn right, Move forward",
                "Draw on paper where the robot ends up",
                "Predict what happens if we swap two steps",
                "Test your prediction — were you right?"
              ]
            },
            {
              "num": 3,
              "title": "Create Your Own Sequence",
              "duration": "10 mins",
              "desc": "Write an algorithm for a classmate to follow",
              "steps": [
                "Choose a task: get to the classroom door",
                "Write every step in order",
                "Partner acts it out following your instructions exactly",
                "Spot any missing steps or wrong order",
                "Fix and improve your algorithm"
              ]
            }
          ],
          "extension": "Challenge: Write an algorithm for a robot to navigate from the classroom to the school library. Include every turn and how many steps to take.",
          "reflection": "What is an algorithm? Can you think of three algorithms you used today before coming to school? Share your favourite with the class.",
          "objectives": [
            "Understand what an algorithm is",
            "Recognise algorithms in daily life",
            "Follow a sequence of instructions",
            "Understand that computers follow instructions exactly"
          ],
          "ukCurriculum": [
            "Understand what algorithms are and how they are implemented as programs on digital devices",
            "Sequence of instructions"
          ]
        },
        "quiz": [
          {
            "q": "What is an algorithm?",
            "options": [
              "A type of computer",
              "A set of step-by-step instructions",
              "A kind of robot",
              "A programming language"
            ],
            "answer": 1
          },
          {
            "q": "Why does the ORDER of steps in an algorithm matter?",
            "options": [
              "It doesn't matter",
              "Computers are random",
              "Doing things out of order can give wrong results",
              "It makes the computer faster"
            ],
            "answer": 2
          },
          {
            "q": "Which of these is an example of a real-life algorithm?",
            "options": [
              "A colour",
              "A recipe for baking bread",
              "A type of sensor",
              "A computer screen"
            ],
            "answer": 1
          },
          {
            "q": "What does it mean that computers follow instructions 'exactly'?",
            "options": [
              "They guess what you mean",
              "They skip confusing steps",
              "They do precisely what is written, no more, no less",
              "They always ask for help"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Following Instructions with Robots",
        "xp": 80,
        "content": {
          "explanation": "Now that you know what algorithms are, it is time to program a real robot! Robots need instructions that are crystal clear. If you tell a robot to 'move forward a bit,' it has no idea how far 'a bit' is. You must be precise: 'Move forward 30 centimetres.'\n\nProgramming a robot is like writing a very detailed recipe. Every instruction must say exactly what to do, in exactly what order. The slightest mistake — a turn in the wrong direction, one step too many — and the robot ends up somewhere it shouldn't be.\n\nThe best way to understand instructions is to predict, then test. Before you run your program, trace through the steps in your head (or on paper) and predict where the robot will end up. Then run it and compare. If your prediction was wrong, you have discovered a bug — and now you can fix it!",
          "example": "// Instructions for robot obstacle course:\nwhen start clicked\nmove forward 40 cm\nturn right 90 degrees\nmove forward 20 cm\nturn left 90 degrees\nmove forward 30 cm\n// Robot should now be past the obstacle!",
          "activity": "Set up a mini obstacle course using books or boxes. Write instructions to navigate your robot around it. Predict where the robot will end up after each instruction, then run the program and see if you were right.",
          "keyWords": [
            "instruction",
            "precise",
            "predict",
            "test",
            "program",
            "obstacle"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Robot Obstacle Course",
              "duration": "20 mins",
              "desc": "Watch a robot navigate a real course",
              "steps": [
                "Set up a course: two obstacles in a line",
                "Show the robot following a pre-set program",
                "Students observe and draw the robot's path",
                "Predict the robot's position after each step",
                "Discuss: how did the programmer know what to write?"
              ]
            },
            {
              "num": 2,
              "title": "Predict and Check",
              "duration": "15 mins",
              "desc": "Test your prediction skills",
              "steps": [
                "Show instruction list on screen (arrows + distances)",
                "Students predict final position on a grid map",
                "Run the robot program",
                "Compare prediction to actual result",
                "Discuss: what was different and why?"
              ]
            },
            {
              "num": 3,
              "title": "Fix the Instructions",
              "duration": "10 mins",
              "desc": "Debug a broken program",
              "steps": [
                "Show a robot that does NOT reach its goal",
                "Students identify which step is wrong",
                "Suggest a fix (change a number, change a direction)",
                "Test the fix",
                "Celebrate when the robot reaches the goal!"
              ]
            }
          ],
          "extension": "Challenge: Write instructions to get the robot to an exact spot in exactly 4 moves. Design your own obstacle course and write the navigation program.",
          "reflection": "What happens when a robot gets an unclear instruction? Why is being precise so important? Can you think of a time when unclear instructions caused problems in real life?",
          "objectives": [
            "Follow a sequence of robot instructions",
            "Understand robots need clear, precise instructions",
            "Predict robot movement from instructions",
            "Identify and fix unclear instructions"
          ],
          "ukCurriculum": [
            "Use sequence in programs",
            "Design programs that accomplish specific goals",
            "Understand cause and effect in programs"
          ]
        },
        "quiz": [
          {
            "q": "Why must robot instructions be precise?",
            "options": [
              "Robots like detail",
              "Robots cannot guess what vague words like 'a bit' mean",
              "Precision makes robots faster",
              "It looks more professional"
            ],
            "answer": 1
          },
          {
            "q": "What is the best way to check if your instructions work?",
            "options": [
              "Hope for the best",
              "Predict the result first, then test and compare",
              "Ask a friend to run it",
              "Skip testing"
            ],
            "answer": 1
          },
          {
            "q": "A robot turns right when it should turn left. This is called a...",
            "options": [
              "Feature",
              "Variable",
              "Bug",
              "Loop"
            ],
            "answer": 2
          },
          {
            "q": "What should you do after you find a bug?",
            "options": [
              "Delete the whole program",
              "Fix the specific instruction and test again",
              "Write a new program from scratch",
              "Ignore it"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Sequencing & Debugging",
        "xp": 85,
        "content": {
          "explanation": "Sequencing means putting instructions in the right order. Even the tiniest mistake in a sequence can stop a program from working. A bug is any error in a program — it could be a wrong number, a missing step, or an instruction in the wrong place.\n\nDebugging is the skill of finding and fixing bugs. Professional programmers spend a huge amount of their time debugging! It is not a sign of failure — it is a normal, important part of coding. Every great programmer is also a great debugger.\n\nThe best way to debug is to trace through your code step by step. Pretend you are the computer: follow each instruction exactly as written. When something goes wrong, you have found your bug! Then you change the instruction, test again, and repeat until the program works perfectly.",
          "example": "// Buggy program — can you spot the error?\nwhen start clicked\nmove forward 30 cm\nturn left 90 degrees   // BUG: should be turn RIGHT\nmove forward 30 cm\n// Robot goes the wrong way!\n\n// Fixed program:\nwhen start clicked\nmove forward 30 cm\nturn right 90 degrees  // Fixed!\nmove forward 30 cm",
          "activity": "Here is a buggy sequence: [Move forward 10] [Turn right 90] [Move backward 10] [Turn right 90]. The robot should make a square but it draws a 'Z' shape instead. Can you find the bug and fix it?",
          "keyWords": [
            "sequence",
            "bug",
            "debugging",
            "error",
            "trace",
            "fix",
            "test"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Spot the Bug",
              "duration": "20 mins",
              "desc": "Find bugs in robot programs",
              "steps": [
                "Show robot running a buggy program (turns wrong way)",
                "Students watch and describe what went wrong",
                "Discuss: which instruction is the bug?",
                "Generate different ways to fix it",
                "Test each fix — which one works?"
              ]
            },
            {
              "num": 2,
              "title": "Fix the Robot Challenge",
              "duration": "15 mins",
              "desc": "Debug and fix a broken program",
              "steps": [
                "Each student gets a program with one intentional bug",
                "Bug: robot takes 5 steps instead of 3",
                "Students must find and fix the bug",
                "Test the fixed program",
                "Verify robot reaches the goal"
              ]
            },
            {
              "num": 3,
              "title": "Sequence Card Game",
              "duration": "10 mins",
              "desc": "Put instructions in the right order",
              "steps": [
                "Receive shuffled instruction cards (arrows + actions)",
                "Arrange cards to navigate robot to goal",
                "Test the sequence with a robot",
                "If wrong, swap cards and re-test",
                "Play again with a harder route"
              ]
            }
          ],
          "extension": "Create your own buggy sequence for a classmate to debug. Include two bugs: one obvious (wrong direction) and one subtle (one step too many). See if your classmate can find both!",
          "reflection": "Think about a time you had to fix something that went wrong. What steps did you take? How is that similar to debugging a computer program?",
          "objectives": [
            "Understand that sequences must be precise",
            "Recognise bugs (errors) in programs",
            "Fix bugs by changing specific instructions",
            "Test and verify fixes work correctly"
          ],
          "ukCurriculum": [
            "Debug programs that do not work correctly",
            "Use logical reasoning to detect and fix bugs"
          ]
        },
        "quiz": [
          {
            "q": "What is a 'bug' in programming?",
            "options": [
              "An insect on the keyboard",
              "An error or mistake in a program",
              "A type of robot",
              "A difficult challenge"
            ],
            "answer": 1
          },
          {
            "q": "What is 'debugging'?",
            "options": [
              "Writing a new program",
              "Making programs run faster",
              "Finding and fixing errors in a program",
              "Adding more instructions"
            ],
            "answer": 2
          },
          {
            "q": "What is the best strategy for finding a bug?",
            "options": [
              "Delete everything and start again",
              "Trace through each instruction step by step pretending to be the robot",
              "Ask the computer to fix itself",
              "Ignore it and hope it goes away"
            ],
            "answer": 1
          },
          {
            "q": "After you fix a bug, what MUST you do?",
            "options": [
              "Show a friend",
              "Test the program to verify it now works",
              "Add more features",
              "Save and close"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Loops & Repetition",
        "xp": 85,
        "content": {
          "explanation": "Imagine you need to move forward 10 times. You could write 'move forward' ten separate times — but that is very long! A loop lets you repeat instructions without writing them over and over. You simply say: 'Repeat 10 times: move forward.'\n\nLoops make programs shorter, easier to read, and easier to fix. If you want to change the action, you only change it once inside the loop — not ten times!\n\nLoops are everywhere in computer programs. Games use loops to keep running until you press stop. Apps use loops to check for new messages. Even your robot uses a loop every time it follows a repeating pattern like drawing a square.",
          "example": "// Without a loop (too long!):\nmove forward 30 cm\nturn right 90 degrees\nmove forward 30 cm\nturn right 90 degrees\nmove forward 30 cm\nturn right 90 degrees\nmove forward 30 cm\nturn right 90 degrees\n\n// With a loop (much better!):\nrepeat 4 times:\n  move forward 30 cm\n  turn right 90 degrees\n// Same result, much shorter code!",
          "activity": "Use loops to make your robot draw: (1) a square — repeat 4 times [forward + turn 90°], (2) a triangle — repeat 3 times [forward + turn 120°], (3) a hexagon — repeat 6 times [forward + turn 60°].",
          "keyWords": [
            "loop",
            "repeat",
            "iteration",
            "pattern",
            "efficient"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Physical Loop Activity",
              "duration": "15 mins",
              "desc": "Experience loops with your own body",
              "steps": [
                "Teacher walks: forward, turn, forward, turn, forward, turn",
                "Ask: do you see a pattern? What repeats?",
                "Students rewrite as: Repeat 3 times: walk forward, turn",
                "Try it — walk the loop yourselves",
                "Discuss: which version was easier to remember?"
              ]
            },
            {
              "num": 2,
              "title": "Loop with Robot",
              "duration": "20 mins",
              "desc": "Use loops to make a robot draw shapes",
              "steps": [
                "Show robot drawing a square the long way (8 separate instructions)",
                "Show the same square using a loop (2 instructions × 4)",
                "Students add the loop blocks in the coding interface",
                "Run the program and watch the square being drawn",
                "Try changing the number of sides to make a different shape"
              ]
            },
            {
              "num": 3,
              "title": "Create Loop Challenges",
              "duration": "10 mins",
              "desc": "Write loop programs for different shapes",
              "steps": [
                "Challenge 1: Robot draws a square using a repeat-4 loop",
                "Challenge 2: Robot draws a triangle using a repeat-3 loop",
                "Challenge 3: Robot draws a pentagon using a repeat-5 loop",
                "Drag and drop loop blocks in the interface",
                "Check: does your robot draw the correct shape?"
              ]
            }
          ],
          "extension": "Advanced challenge: Can you make a loop inside a loop? Try to program the robot to draw 3 squares, each in a different position. Hint: use an outer loop that repeats 3 times, and inside it put the square-drawing loop.",
          "reflection": "Why are loops useful? Write two examples of loops you follow in real life (things you repeat). What would happen if programs could NOT use loops?",
          "objectives": [
            "Understand what loops are and why they are useful",
            "Recognise repeating patterns in programs",
            "Use loops to repeat instructions",
            "Write programs with count-controlled loops"
          ],
          "ukCurriculum": [
            "Use repetition in programs",
            "Understand that loops improve code efficiency",
            "Recognise patterns and use abstraction"
          ]
        },
        "quiz": [
          {
            "q": "What is a loop in programming?",
            "options": [
              "A mistake in a program",
              "A way to repeat instructions without rewriting them",
              "A type of robot movement",
              "A variable that changes"
            ],
            "answer": 1
          },
          {
            "q": "Which program draws a square more efficiently?",
            "options": [
              "8 separate move and turn instructions",
              "repeat 4 times: {move forward, turn right 90}",
              "A variable set to 90",
              "A conditional statement"
            ],
            "answer": 1
          },
          {
            "q": "How many times does 'repeat 5 times' execute its instructions?",
            "options": [
              "4",
              "5",
              "6",
              "Until stopped"
            ],
            "answer": 1
          },
          {
            "q": "Loops are useful because they...",
            "options": [
              "Make programs run slower",
              "Require more typing",
              "Make programs shorter and easier to change",
              "Are harder to understand"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Variables: Storing Information",
        "xp": 85,
        "content": {
          "explanation": "A variable is like a labelled box that stores information your program needs to remember. You give it a name (like 'score' or 'steps') and store a value inside it (like 100 or 0). Whenever your program needs that information, it looks inside the box.\n\nThe brilliant thing about variables is that their value can change while the program is running. A score variable starts at 0 and increases every time you collect a point. A steps variable counts how far the robot has moved.\n\nChoosing good variable names is very important. 'score' is much clearer than 's', and 'distanceFromHome' is much clearer than 'x'. Good names make your code easy to read and debug — even months later!",
          "example": "// Variables in action:\nscore = 0         // Create variable, set to 0\nsteps = 0         // Another variable\n\nwhen robot moves:\n  steps = steps + 1    // Increase steps by 1\n\nwhen collect coin:\n  score = score + 10   // Increase score by 10\n\n// Display both:\nshow score\nshow steps",
          "activity": "Program the robot with a 'steps' variable that starts at 0. Each time the robot moves forward, increase steps by 1. Display the steps on screen. Challenge: program the robot to stop automatically after exactly 10 steps.",
          "keyWords": [
            "variable",
            "value",
            "store",
            "update",
            "counter",
            "name"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Real-Life Variables",
              "duration": "15 mins",
              "desc": "Find variables all around you",
              "steps": [
                "Discuss: what information do games need to remember? (score, lives, level)",
                "Students brainstorm: what changes while a game runs?",
                "Connect to variables: each changing piece of data is a variable",
                "Play a quick game — what variables would track your progress?",
                "Draw a 'variable box' labelled with name and current value"
              ]
            },
            {
              "num": 2,
              "title": "Variable Demonstration",
              "duration": "15 mins",
              "desc": "See a variable change in real time",
              "steps": [
                "Show robot counter program on projector",
                "Variable: steps (starts at 0)",
                "Run program — counter increases with each move",
                "Students call out the new value before it updates",
                "Discuss: where is the information being stored?"
              ]
            },
            {
              "num": 3,
              "title": "Create a Variable Program",
              "duration": "15 mins",
              "desc": "Program your own variable counter",
              "steps": [
                "Open coding interface, create variable called 'steps'",
                "Set steps = 0 at the start",
                "Add: each move → steps = steps + 1",
                "Show steps on the screen while robot moves",
                "Challenge: can you make the robot stop when steps reaches 10?"
              ]
            }
          ],
          "extension": "Create a program with TWO variables: 'steps' (counts moves) and 'coins' (counts collected items). Display both on screen and make the robot collect 5 coins on a mini course.",
          "reflection": "What would happen if computers could not store information? Think about a game without a score — would it still be fun? What other programs use variables?",
          "objectives": [
            "Understand what variables are and why they are needed",
            "Recognise variables in real-life contexts",
            "Create and use variables in programs",
            "Update variable values during program execution"
          ],
          "ukCurriculum": [
            "Use variables and input/output in programs",
            "Understand how data is stored and used"
          ]
        },
        "quiz": [
          {
            "q": "What is a variable in programming?",
            "options": [
              "A type of loop",
              "A labelled storage box for information that can change",
              "A kind of error",
              "A step in an algorithm"
            ],
            "answer": 1
          },
          {
            "q": "A game score starts at 0 and increases by 10 each time you win. After 3 wins, what is the score?",
            "options": [
              "10",
              "20",
              "30",
              "3"
            ],
            "answer": 2
          },
          {
            "q": "Which variable name is the BEST choice?",
            "options": [
              "x",
              "thing1",
              "playerScore",
              "stuff"
            ],
            "answer": 2
          },
          {
            "q": "What does it mean when we say a variable's value 'updates'?",
            "options": [
              "The variable is deleted",
              "The variable's stored value changes",
              "A new variable is created",
              "The program stops"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Introduction to Conditionals",
        "xp": 90,
        "content": {
          "explanation": "A conditional is an instruction that only happens IF a certain condition is true. In everyday life, you use conditionals all the time: 'IF it is raining, THEN take an umbrella.' If it's not raining, you don't need the umbrella — you only do the action when the condition is true.\n\nIn programming, conditionals let your robot (or program) make decisions. Without conditionals, a robot just mindlessly follows the same instructions over and over. With conditionals, it can react to the world around it: 'IF I detect an obstacle, THEN stop and turn.'\n\nThe simplest form is: IF [condition] THEN [action]. The condition is always something that is either TRUE or FALSE — like 'Is the distance less than 30 cm?' Yes or No. True or False. The robot checks the condition and decides what to do.",
          "example": "// Conditional: robot stops when close to obstacle\nwhen start clicked\nrepeat forever:\n  IF distance < 30 cm THEN\n    stop\n  ELSE\n    move forward 5 cm\n// Robot moves until it gets close to something, then stops",
          "activity": "Program the robot with a conditional: IF obstacle detected THEN stop, ELSE move forward. Place an obstacle at different distances and observe when the robot stops. Try changing the distance number.",
          "keyWords": [
            "conditional",
            "if",
            "then",
            "condition",
            "true",
            "false",
            "decision",
            "sensor"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Real-Life If/Then",
              "duration": "15 mins",
              "desc": "Discover conditionals in your own life",
              "steps": [
                "Discussion: what do you do IF it is raining?",
                "Generate IF/THEN statements: IF hungry THEN eat, IF tired THEN sleep",
                "Students write 3 of their own IF/THEN examples",
                "Share with a partner and compare",
                "Spot: the condition is always TRUE or FALSE"
              ]
            },
            {
              "num": 2,
              "title": "Robot Decision Making",
              "duration": "15 mins",
              "desc": "See a robot use a conditional",
              "steps": [
                "Show robot with distance sensor moving forward",
                "Place a book in the path",
                "Conditional activates: IF distance < 30 cm THEN stop",
                "Remove and replace the book — robot responds each time",
                "Discuss: the robot is making a decision!"
              ]
            },
            {
              "num": 3,
              "title": "Build a Simple Conditional",
              "duration": "15 mins",
              "desc": "Write your first conditional program",
              "steps": [
                "Open coding interface, drag an IF block",
                "Condition: distance < 30 cm",
                "Action: stop",
                "Test: place obstacle close (robot stops), then far (robot keeps going)",
                "Change the distance number — what difference does it make?"
              ]
            }
          ],
          "extension": "Extend your conditional: instead of just stopping, program the robot to turn right when close to an obstacle (and keep moving forward when the path is clear). This is the start of autonomous navigation!",
          "reflection": "Can you think of five IF/THEN rules that a self-driving car might use? Compare your list with a partner. Which rules are most important for safety?",
          "objectives": [
            "Understand basic conditional logic (if/then)",
            "Recognise conditions in real-life situations",
            "Create simple if/then programs",
            "Test conditional logic with different inputs"
          ],
          "ukCurriculum": [
            "Use selection (if) in programs",
            "Understand that programs respond to inputs using decisions",
            "Use logical conditions to control program flow"
          ]
        },
        "quiz": [
          {
            "q": "What is a conditional in programming?",
            "options": [
              "A type of loop",
              "An instruction that only runs IF a condition is true",
              "A variable that stores true or false",
              "A type of bug"
            ],
            "answer": 1
          },
          {
            "q": "In 'IF raining THEN take umbrella' — what is the CONDITION?",
            "options": [
              "take umbrella",
              "raining",
              "IF",
              "THEN"
            ],
            "answer": 1
          },
          {
            "q": "A condition must always be...",
            "options": [
              "A number",
              "True or False",
              "A variable name",
              "An instruction"
            ],
            "answer": 1
          },
          {
            "q": "What does a sensor help a robot do in a conditional?",
            "options": [
              "Move faster",
              "Store variables",
              "Check whether a condition is true or false (e.g. is something nearby?)",
              "Draw shapes"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Testing & Verification",
        "xp": 85,
        "content": {
          "explanation": "Testing is how you check that your program actually does what you intended. It sounds simple, but it is one of the most important skills in all of computing. Professional programmers at companies like Google and Apple spend enormous amounts of time testing their code.\n\nA test case is a specific situation you test your program with. For example: 'What happens when the obstacle is very close?' or 'What happens when there is NO obstacle?' Good testing means trying many different situations — especially the ones you did not think about when writing the program.\n\nThe golden rule: always test your program. Never assume it works just because it looks right! Programs that seem fine can have hidden bugs that only appear in unusual situations. Testing catches those bugs before they cause problems.",
          "example": "// Test plan for obstacle-avoidance robot:\n// Test 1: obstacle at 10cm → robot should STOP ✓\n// Test 2: obstacle at 50cm → robot should KEEP MOVING ✓\n// Test 3: no obstacle → robot should KEEP MOVING ✓\n// Test 4: obstacle at exactly 30cm → robot should STOP ✓\n// All tests pass! Program is working correctly.",
          "activity": "Write a test plan with 3 test cases for your conditional robot program. For each test, write: (1) what you will do, (2) what you EXPECT to happen, (3) what ACTUALLY happens. Record pass or fail.",
          "keyWords": [
            "testing",
            "test case",
            "verify",
            "pass",
            "fail",
            "expected",
            "actual",
            "systematic"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Why We Test",
              "duration": "15 mins",
              "desc": "Understand why testing is essential",
              "steps": [
                "Show image of a car crash test",
                "Discuss: why do engineers test cars before selling them?",
                "Brainstorm: what could go wrong if robot code is NOT tested?",
                "Share examples of real software bugs that caused problems",
                "Agree: testing is not optional — it is essential!"
              ]
            },
            {
              "num": 2,
              "title": "Create Test Cases",
              "duration": "15 mins",
              "desc": "Design a systematic test plan",
              "steps": [
                "Students design a simple robot program (stop when close)",
                "Create 3 test cases on a worksheet",
                "Test 1: obstacle very close (robot should stop)",
                "Test 2: obstacle far away (robot should keep going)",
                "Test 3: no obstacle (robot should keep going)"
              ]
            },
            {
              "num": 3,
              "title": "Execute Test Plan",
              "duration": "15 mins",
              "desc": "Run every test and record results",
              "steps": [
                "Students run Test 1 — record PASS or FAIL",
                "Run Test 2 — record PASS or FAIL",
                "Run Test 3 — record PASS or FAIL",
                "If any test fails, identify and fix the bug",
                "Re-run failed tests to confirm fix worked"
              ]
            }
          ],
          "extension": "Add an 'edge case' test to your plan: what happens if the obstacle is placed at EXACTLY the boundary distance (e.g. exactly 30 cm)? Is this a Pass or a Fail? Edge cases often reveal hidden bugs!",
          "reflection": "Why is testing important even if you think your code is correct? Can you think of a real-world example (not computing) where testing before use is very important?",
          "objectives": [
            "Understand the importance of systematic testing",
            "Create test cases for programs",
            "Execute test plans and record results",
            "Fix bugs discovered during testing"
          ],
          "ukCurriculum": [
            "Use logical reasoning to predict behavior of programs",
            "Debug programs that do not work correctly",
            "Test and refine programs"
          ]
        },
        "quiz": [
          {
            "q": "What is a 'test case'?",
            "options": [
              "A type of variable",
              "A specific situation used to check if a program works correctly",
              "A kind of loop",
              "A debugging tool"
            ],
            "answer": 1
          },
          {
            "q": "If a test FAILS, what should you do?",
            "options": [
              "Delete the program",
              "Ignore it — it probably does not matter",
              "Identify the bug and fix it, then re-test",
              "Change the test so it passes"
            ],
            "answer": 2
          },
          {
            "q": "Why should you test unusual situations ('edge cases')?",
            "options": [
              "To make testing take longer",
              "Because those situations often reveal hidden bugs",
              "Edge cases are not important",
              "To impress your teacher"
            ],
            "answer": 1
          },
          {
            "q": "When should you stop testing a program?",
            "options": [
              "After the first test passes",
              "Only when you run out of time",
              "When all planned test cases pass",
              "Never — you can always test more"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Problem Solving with Robots",
        "xp": 85,
        "content": {
          "explanation": "Programming is really a form of problem solving. When you write a program, you are solving a problem — how to get the robot to do what you want. Great programmers are great problem solvers.\n\nThe best approach to any problem is to break it into smaller steps. This is called decomposition. Instead of thinking 'how do I get the robot through the whole maze?' you think: 'how do I get it around this first corner? Then the second? Then the third?'\n\nA useful four-step process: (1) Understand the problem — what exactly does it need to do? (2) Plan a solution — think before you code! (3) Code the solution — write your program. (4) Test and debug — check it works and fix any bugs. This process works for every programming problem, from simple to very complex.",
          "example": "// Problem: navigate a maze to reach the goal\n// Step 1: UNDERSTAND — maze has 3 turns, goal is bottom-right\n// Step 2: PLAN (pseudocode):\n//   move forward past first wall\n//   turn right\n//   move forward past second wall\n//   turn left\n//   move forward to goal\n// Step 3: CODE — convert plan into instructions\n// Step 4: TEST — run program, fix any bugs",
          "activity": "Here is a simple maze printed on paper. Trace the robot's path with a pencil first. Then write your algorithm as numbered steps. Finally, code it in the interface and test it.",
          "keyWords": [
            "decomposition",
            "problem solving",
            "plan",
            "pseudocode",
            "maze",
            "algorithm"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Problem-Solving Process",
              "duration": "20 mins",
              "desc": "Learn the four-step approach",
              "steps": [
                "Introduce the four steps: Understand, Plan, Code, Test",
                "Apply to a simple maze: identify start, goal, turns",
                "Step 2: draw the path on paper first",
                "Step 3: convert drawing to written algorithm",
                "Step 4: run it and fix bugs"
              ]
            },
            {
              "num": 2,
              "title": "Solve a Simple Maze",
              "duration": "15 mins",
              "desc": "Work through a maze step by step",
              "steps": [
                "Students receive printed maze (3 turns, clear goal)",
                "Trace the path with a pencil",
                "Write algorithm: turn left, move forward 4 squares, turn right...",
                "Enter code in robot programming interface",
                "Test: does the robot reach the goal?"
              ]
            },
            {
              "num": 3,
              "title": "Increasingly Complex Mazes",
              "duration": "10 mins",
              "desc": "Level up the challenge",
              "steps": [
                "Maze 1: 2 turns (easy)",
                "Maze 2: 4 turns with a dead-end (medium)",
                "Maze 3: student-designed maze (hard)",
                "Use the 4-step process for each",
                "Celebrate: everyone finds different solutions!"
              ]
            }
          ],
          "extension": "Design your OWN maze for a classmate to solve. Make it challenging but solvable! Write the solution algorithm too, so you can check if they solved it correctly.",
          "reflection": "What strategy did you use to solve the maze? Did you try a random approach or did you plan it first? Which approach worked better? Why does planning before coding save time?",
          "objectives": [
            "Apply a systematic problem-solving process",
            "Decompose large problems into smaller steps",
            "Use algorithms to solve problems",
            "Persist and iterate when stuck"
          ],
          "ukCurriculum": [
            "Design and debug programs",
            "Use logical reasoning to predict and verify program behavior",
            "Understand decomposition"
          ]
        },
        "quiz": [
          {
            "q": "What does 'decomposition' mean in computing?",
            "options": [
              "Drawing diagrams",
              "Breaking a large problem into smaller, manageable parts",
              "A type of loop",
              "Making code run faster"
            ],
            "answer": 1
          },
          {
            "q": "What is the FIRST step of good problem solving?",
            "options": [
              "Start coding immediately",
              "Test the program",
              "Understand the problem clearly before doing anything else",
              "Debug the errors"
            ],
            "answer": 2
          },
          {
            "q": "Pseudocode is...",
            "options": [
              "Computer code that runs on a machine",
              "An informal written description of an algorithm in plain language",
              "A type of variable",
              "A debugging tool"
            ],
            "answer": 1
          },
          {
            "q": "What should you do if your robot does not solve the maze on the first try?",
            "options": [
              "Give up",
              "Delete your code",
              "Trace through each step to find the bug and fix it",
              "Write a completely new program"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Programs in Real Life",
        "xp": 80,
        "content": {
          "explanation": "Computer programs are not just in computers — they are in almost every electronic device you use! Your microwave, car, washing machine, phone, traffic lights, and cash machines all run programs. The world is full of algorithms!\n\nEvery program was written by a human to solve a problem. The traffic light runs an algorithm: count 30 seconds, change to amber, count 5 seconds, change to red. The washing machine runs an algorithm: fill with water, spin for 10 minutes, drain, spin again.\n\nComputational thinking — the skill of thinking like a programmer — is incredibly useful even when you are not near a computer. It means breaking problems into steps, spotting patterns, and designing efficient solutions. These are life skills!",
          "example": "// Traffic light algorithm:\ncurrentLight = green\ntimer = 0\n\nrepeat forever:\n  timer = timer + 1\n  IF timer >= 30 AND currentLight = green THEN\n    currentLight = amber\n    timer = 0\n  IF timer >= 5 AND currentLight = amber THEN\n    currentLight = red\n    timer = 0\n  IF timer >= 30 AND currentLight = red THEN\n    currentLight = green\n    timer = 0",
          "activity": "Walk around your house tonight and list 5 devices that contain programs. For each one, describe (in plain English) one algorithm the device uses. Share your list in class tomorrow.",
          "keyWords": [
            "real-world",
            "computational thinking",
            "device",
            "embedded",
            "everyday",
            "algorithm"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Find Programs Around Us",
              "duration": "20 mins",
              "desc": "Discover computing in everyday objects",
              "steps": [
                "Students list as many devices with programs as they can in 3 minutes",
                "Share lists as a class — combine into one big list",
                "For each device: what does its program do?",
                "Vote: which device would be most useless without its program?",
                "Key insight: computing is EVERYWHERE"
              ]
            },
            {
              "num": 2,
              "title": "Understand a Real Program",
              "duration": "15 mins",
              "desc": "Analyse a real algorithm",
              "steps": [
                "Case study: traffic light algorithm",
                "Walk through each step: green, wait 30s, amber, wait 5s, red, wait 30s, repeat",
                "Discuss: who benefits? Pedestrians? Drivers?",
                "What if the timer was wrong — too short? Too long?",
                "Realise: programs directly affect people's lives"
              ]
            },
            {
              "num": 3,
              "title": "Design a Program for a Real Problem",
              "duration": "10 mins",
              "desc": "Apply algorithmic thinking to a school problem",
              "steps": [
                "Problem: the school lunch queue is chaotic — people push in",
                "Challenge: design an algorithm to make it fair and efficient",
                "Think: what does the program need to know? What should it do?",
                "Share designs with the class",
                "Vote on best solution"
              ]
            }
          ],
          "extension": "Research one specific program that is used in medicine (like a hospital monitor or medical scanner). Write a short description of what algorithm it uses and why it is so important to get it right.",
          "reflection": "What would school life be like without any computers or programs? List five things that would change. Which would you miss most?",
          "objectives": [
            "Recognise algorithms in real-world devices and applications",
            "Understand that programs control everyday devices",
            "Appreciate computational thinking as a life skill",
            "Consider the social impact of computing"
          ],
          "ukCurriculum": [
            "Understand computer use beyond entertainment",
            "Recognise how digital technology is used in the wider world",
            "Consider ethical implications of programs"
          ]
        },
        "quiz": [
          {
            "q": "Which of these everyday objects contains a computer program?",
            "options": [
              "A wooden chair",
              "A glass window",
              "A microwave oven",
              "A metal spoon"
            ],
            "answer": 2
          },
          {
            "q": "Why is computational thinking useful even away from computers?",
            "options": [
              "It is not useful away from computers",
              "It helps you think logically, break problems into steps, and design solutions in any situation",
              "Only programmers need it",
              "It makes you better at maths"
            ],
            "answer": 1
          },
          {
            "q": "If a traffic light's timer program had a bug, what could happen?",
            "options": [
              "Nothing — traffic lights don't need programs",
              "Lights could stay red too long, causing dangerous traffic jams",
              "The lights would get brighter",
              "Cars would drive faster"
            ],
            "answer": 1
          },
          {
            "q": "Who writes the programs that run in everyday devices?",
            "options": [
              "They write themselves",
              "Robots",
              "Human programmers",
              "The devices themselves"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Digital Citizenship & Safety",
        "xp": 80,
        "content": {
          "explanation": "Being online is a huge part of modern life — for school, friends, entertainment, and learning. But just as we have rules for being safe and kind in the real world, we have rules for being safe and kind online too. This is called digital citizenship.\n\nDigital citizenship means using technology responsibly: being kind online, protecting your own privacy, keeping your passwords safe, and knowing what to do when something online makes you feel uncomfortable or unsafe.\n\nA strong password is your first line of defence online. A good password is long (at least 8 characters), uses a mix of letters, numbers, and symbols, and does not contain your name or birthday. NEVER share your password with anyone except a trusted adult — not even your best friend!",
          "example": "// What makes a STRONG password?\n// Weak: password123 (too obvious!)\n// Weak: yourname2010 (personal info!)\n// Weak: abc (too short!)\n\n// Strong password characteristics:\n// ✓ At least 8 characters long\n// ✓ Mix of UPPERCASE, lowercase, numbers, symbols\n// ✓ Not personal information\n// ✓ Unique (different for each account)\n// Example: Tr33-R0ck-Sky#9 (strong!)",
          "activity": "Evaluate these passwords: (1) jack2012, (2) P@ssw0rd!, (3) ilovecats, (4) X7#mK2!pQ. Which are strong? Which are weak? Explain why for each one.",
          "keyWords": [
            "digital citizenship",
            "password",
            "privacy",
            "safety",
            "online",
            "responsibility",
            "kindness"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Digital Rights and Responsibilities",
              "duration": "15 mins",
              "desc": "Understand your digital role",
              "steps": [
                "Discuss: what are your rights online? (privacy, safety, fair treatment)",
                "Discuss: what are your responsibilities? (respect others, follow rules, stay safe)",
                "Create a class 'Digital Citizenship Pledge' together",
                "Sign it and display it in the classroom",
                "Key message: rights AND responsibilities go together"
              ]
            },
            {
              "num": 2,
              "title": "Password Security",
              "duration": "15 mins",
              "desc": "Learn to create strong passwords",
              "steps": [
                "Show examples of weak passwords and explain why they are dangerous",
                "Teach the LUMS rule: Long, Unique, Mixed characters, Symbols",
                "Practice: rate these passwords as weak/medium/strong",
                "Create a strong password (do NOT use your real one!)",
                "Golden rule: NEVER share passwords except with a trusted adult"
              ]
            },
            {
              "num": 3,
              "title": "Online Safety Scenarios",
              "duration": "15 mins",
              "desc": "Know what to do in tricky situations",
              "steps": [
                "Scenario 1: a stranger online asks where you live",
                "Scenario 2: you see a friend being called mean names in a chat",
                "Scenario 3: you accidentally see something upsetting online",
                "Discuss: what is the right thing to do in each case?",
                "Key answers: tell a trusted adult, report it, never reply to strangers"
              ]
            }
          ],
          "extension": "Create an online safety poster for younger students in Year 1 or 2. Use simple words and pictures. Include 3 key rules for staying safe online.",
          "reflection": "Think about the internet — what are its three biggest benefits and its three biggest risks? How can we enjoy the benefits while protecting ourselves from the risks?",
          "objectives": [
            "Understand digital rights and responsibilities",
            "Practice safe technology use",
            "Create and evaluate strong passwords",
            "Make smart decisions in online safety scenarios"
          ],
          "ukCurriculum": [
            "Use technology safely and respectfully",
            "Keep personal information private",
            "Recognise acceptable and unacceptable online behaviour",
            "Know where to report online concerns"
          ]
        },
        "quiz": [
          {
            "q": "What is 'digital citizenship'?",
            "options": [
              "Using computers at school",
              "Responsible, safe, and kind use of technology",
              "A type of password",
              "A social media platform"
            ],
            "answer": 1
          },
          {
            "q": "Which password is the STRONGEST?",
            "options": [
              "jack2012",
              "password",
              "R7#mZ!2pQ",
              "ilovecats"
            ],
            "answer": 2
          },
          {
            "q": "If a stranger online asks for your address, you should...",
            "options": [
              "Tell them — they seem friendly",
              "Ignore it for now and reply later",
              "Tell a trusted adult immediately and do not reply",
              "Share your school name but not your home address"
            ],
            "answer": 2
          },
          {
            "q": "Why should you NEVER share your password with a friend?",
            "options": [
              "Friends always change passwords",
              "They could use it to access your accounts, even accidentally",
              "Passwords are too long to remember",
              "There are no consequences to sharing"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Collaborative Coding Challenge",
        "xp": 85,
        "content": {
          "explanation": "In the real world, programs are rarely written by one person alone. At big companies, teams of programmers work together on the same project. They divide the work, communicate constantly, and combine their code at the end.\n\nCollaboration in coding is a skill. It means: communicating your ideas clearly so others understand, dividing tasks fairly so everyone contributes, and testing carefully when you combine work so everything fits together.\n\nWhen you work in a team on a coding challenge, you learn something incredibly important: two brains really ARE better than one. Teams often find solutions that no individual would think of alone. They also catch each other's bugs!",
          "example": "// Team challenge: two robots navigate maze together\n// Robot 1 code (programmed by Person A):\nmove forward 40 cm\nturn right 90 degrees\nmove forward 30 cm\n\n// Robot 2 code (programmed by Person B):\nwait 3 seconds  // Wait for Robot 1 to clear the way\nmove forward 40 cm\nturn right 90 degrees\nmove forward 30 cm\n// Both robots reach goal without colliding!",
          "activity": "Work in a team of 3. One person plans the approach, one codes Robot A, one codes Robot B. Your goal: both robots must navigate through a maze to reach the goal without colliding with each other.",
          "keyWords": [
            "collaboration",
            "teamwork",
            "communication",
            "divide",
            "combine",
            "coordinate"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Challenge Introduction",
              "duration": "15 mins",
              "desc": "Understand the collaborative goal",
              "steps": [
                "Introduce challenge: two robots navigate the same maze",
                "Rules: robots cannot collide, both must reach the goal",
                "Divide into teams of 3: Planner, Coder A, Coder B",
                "Teams spend 5 minutes discussing their approach",
                "Draw the plan on paper before coding"
              ]
            },
            {
              "num": 2,
              "title": "Plan and Design",
              "duration": "15 mins",
              "desc": "Create the coordination plan",
              "steps": [
                "Teams discuss: which path does each robot take?",
                "Coder A writes Robot 1's algorithm",
                "Coder B writes Robot 2's algorithm (including timing)",
                "Planner checks: will the robots collide? Add a wait if needed",
                "Get feedback from another team"
              ]
            },
            {
              "num": 3,
              "title": "Code, Test and Iterate",
              "duration": "15 mins",
              "desc": "Bring it all together",
              "steps": [
                "Code both robot programs in the interface",
                "Run both robots at the same time",
                "Did they collide? Adjust timing",
                "Did both reach the goal? Celebrate!",
                "If not, debug and try again — iteration is normal"
              ]
            }
          ],
          "extension": "Take it further: can you coordinate THREE robots in the same maze? This requires even more careful planning and timing. What additional challenges does a third robot create?",
          "reflection": "What made collaboration difficult? What made it better? How did it feel when both robots successfully reached the goal? What would you do differently next time?",
          "objectives": [
            "Work collaboratively on a programming challenge",
            "Communicate technical ideas clearly",
            "Combine and coordinate code from different team members",
            "Test and debug collaborative work"
          ],
          "ukCurriculum": [
            "Work collaboratively to design and create programs",
            "Communicate effectively about technical problems",
            "Understand how large programs are divided into parts"
          ]
        },
        "quiz": [
          {
            "q": "Why do real programmers usually work in teams?",
            "options": [
              "Working alone is not allowed",
              "Teams can divide tasks, combine skills, and catch each other's errors",
              "Programs are too long for one person to read",
              "Computers work better with multiple users"
            ],
            "answer": 1
          },
          {
            "q": "When two robots work together, what is the most important extra thing to think about?",
            "options": [
              "Making both programs exactly the same",
              "Timing and coordination so they do not interfere with each other",
              "Only one robot actually needs to reach the goal",
              "Making one robot faster than the other"
            ],
            "answer": 1
          },
          {
            "q": "If Robot A and Robot B collide in the maze, what should you check?",
            "options": [
              "Delete Robot B's program",
              "Add a timing delay so one robot waits for the other to pass first",
              "Make both robots go faster",
              "Change the maze"
            ],
            "answer": 1
          },
          {
            "q": "'Iterate' means...",
            "options": [
              "Do it once and stop",
              "Try, find problems, improve, and try again repeatedly",
              "Work alone",
              "Move faster"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Project: Build Your Own Challenge",
        "xp": 90,
        "content": {
          "explanation": "It is project time! This is your chance to bring together everything you have learned this term. You will design your own coding challenge — something you are genuinely proud of — and present it to the class.\n\nGreat projects start with a clear plan. Before you write a single line of code, think: what is my robot going to do? What does success look like? What challenges might I face? Then design, code, test, fix bugs, and test again.\n\nRemember: all good programmers iterate. Your first version will probably not be perfect — and that is completely fine! Every bug you find and fix makes your project better. The goal is not a perfect first attempt; the goal is a finished, working project you are proud of.",
          "example": "// Example project: robot dance routine\nwhen start clicked\n// Verse 1: spin and move\nrepeat 2 times:\n  turn right 180 degrees\n  move forward 20 cm\n// Chorus: draw a square and spin\nrepeat 4 times:\n  move forward 30 cm\n  turn right 90 degrees\nturn left 360 degrees\n// Show off your robot!",
          "activity": "Choose your project type, write your algorithm on paper first, then code it, test it thoroughly, fix any bugs, and practise your 1-minute presentation. Remember to explain WHAT your robot does and HOW your code works.",
          "keyWords": [
            "project",
            "design",
            "algorithm",
            "code",
            "test",
            "debug",
            "present",
            "iterate"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Choose Your Project",
              "duration": "10 mins",
              "desc": "Pick a project that excites you",
              "steps": [
                "Option A: Design a maze and program the robot to navigate it",
                "Option B: Create a robot dance (sequences + loops + timing)",
                "Option C: Build an obstacle course and time the navigation",
                "Option D: Your own idea (check with teacher first)",
                "Students choose based on their interests and skills"
              ]
            },
            {
              "num": 2,
              "title": "Plan and Design",
              "duration": "20 mins",
              "desc": "Create a solid plan before coding",
              "steps": [
                "Sketch the design on paper: what will the robot do?",
                "Write a step-by-step algorithm in plain English first",
                "List potential challenges: what might go wrong?",
                "Brainstorm solutions for each challenge",
                "Get teacher approval for your plan"
              ]
            },
            {
              "num": 3,
              "title": "Build, Test and Present",
              "duration": "25 mins",
              "desc": "Create, test and share your project",
              "steps": [
                "Code the project following your algorithm",
                "Test thoroughly — does it work exactly as planned?",
                "Fix bugs found during testing",
                "Practise your 1-minute presentation",
                "Present: explain what your robot does and how the code works"
              ]
            }
          ],
          "extension": "Peer testing: swap projects with another team and try to find a bug in each other's code. Give constructive feedback: 'This works well because... One improvement could be...'",
          "reflection": "What was the hardest part of your project? What did you learn from debugging it? If you had more time, what one feature would you add? Would you approach the design differently next time?",
          "objectives": [
            "Apply all year's learning to a creative project",
            "Design a coding challenge and write the algorithm",
            "Code, test, and debug the project",
            "Present and explain your project clearly"
          ],
          "ukCurriculum": [
            "Design and write programs to accomplish specific goals",
            "Test and debug programs",
            "Demonstrate understanding of algorithms and programming through creative work"
          ]
        },
        "quiz": [
          {
            "q": "What is the FIRST thing you should do when starting a coding project?",
            "options": [
              "Start coding immediately to save time",
              "Plan and design the algorithm on paper first",
              "Find bugs",
              "Test it"
            ],
            "answer": 1
          },
          {
            "q": "Why is iteration important in project work?",
            "options": [
              "It wastes time",
              "Real projects are never perfect first time — improving through testing makes them better",
              "Iteration means making everything faster",
              "Only beginners iterate"
            ],
            "answer": 1
          },
          {
            "q": "When presenting your project, what should you explain?",
            "options": [
              "Just show it running — no explanation needed",
              "What the robot does AND how your code makes it happen",
              "Only the bugs you found",
              "How long it took"
            ],
            "answer": 1
          },
          {
            "q": "What does 'constructive feedback' mean?",
            "options": [
              "Only saying nice things",
              "Only saying what is wrong",
              "Giving specific, helpful comments about both strengths and improvements",
              "Keeping your thoughts to yourself"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Reflection & Looking Forward",
        "xp": 75,
        "content": {
          "explanation": "Congratulations! You have completed a whole year of computing! Take a moment to look back at everything you have learned. At the start of Year 3, you might not have known what an algorithm was. Now you can write them, debug them, use loops, use variables, and even use conditionals!\n\nReflection is one of the most powerful learning tools there is. When you think about what you learned, what was hard, and how you overcame challenges, you strengthen those memories and skills. It is a bit like saving your progress in a video game.\n\nNext year in Year 4, you will build on everything you have done. You will design more complex algorithms, use if/then/else conditionals, work with lists of data, write functions, and create much bigger programs. The skills you have built this year are the foundation for everything that comes next!",
          "example": "// Your Year 3 skills checklist:\n// ✓ Algorithms: step-by-step instructions\n// ✓ Sequences: order matters!\n// ✓ Debugging: finding and fixing bugs\n// ✓ Loops: repeat without rewriting\n// ✓ Variables: storing information\n// ✓ Conditionals: IF this THEN that\n// ✓ Testing: always check your work!\n// ✓ Problem solving: decompose and conquer\n// ✓ Collaboration: teams code better\n// ✓ Digital citizenship: be safe and kind online",
          "activity": "Write a 'Letter to Year 4 You' — describe the most important thing you learned this year, the biggest challenge you overcame, and one piece of advice for yourself as you start Year 4.",
          "keyWords": [
            "reflection",
            "growth mindset",
            "progress",
            "celebrate",
            "look forward",
            "review"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Learning Reflection",
              "duration": "20 mins",
              "desc": "Think back on your year of learning",
              "steps": [
                "What was your favourite lesson and why?",
                "What was your biggest challenge — and how did you overcome it?",
                "What did you learn about algorithms that you did not know before?",
                "What did you discover about yourself as a coder?",
                "Write or discuss reflections with a partner"
              ]
            },
            {
              "num": 2,
              "title": "Skill Celebration",
              "duration": "15 mins",
              "desc": "Celebrate your growth",
              "steps": [
                "Teacher reads out all Year 3 skills (algorithms, loops, variables...)",
                "For each skill, students rate themselves: Beginner / Developing / Confident",
                "Celebrate progress — everyone has grown!",
                "Share one skill you feel most proud of",
                "Share one skill you still want to improve"
              ]
            },
            {
              "num": 3,
              "title": "Year 4 Preview",
              "duration": "10 mins",
              "desc": "Get excited about what comes next",
              "steps": [
                "Preview Year 4 topics: if/then/else, nested loops, functions, data lists",
                "Show an example of a Year 4 program (more complex, but built on Year 3 skills)",
                "Set one personal goal for Year 4",
                "Discuss: what are you most excited to learn?",
                "End with a class round of applause for completing Year 3!"
              ]
            }
          ],
          "extension": "Create a digital portfolio: collect your best work from this year (algorithms, programs, projects) and write a short paragraph for each explaining what you learned from it.",
          "reflection": "If a Year 2 student asked you 'what is computing?', how would you explain it in simple words? What is the most important thing you have learned this year?",
          "objectives": [
            "Reflect on a year of computing learning",
            "Celebrate progress and achievements",
            "Set goals for Year 4",
            "Develop growth mindset"
          ],
          "ukCurriculum": [
            "Reflect on progress in computing",
            "Understand how skills build over time",
            "Prepare for more advanced computing concepts"
          ]
        },
        "quiz": [
          {
            "q": "What is the purpose of reflecting on your learning?",
            "options": [
              "To show off",
              "To strengthen memories and skills by thinking about what you learned and how",
              "It is not useful",
              "To fill time at the end of term"
            ],
            "answer": 1
          },
          {
            "q": "Which of these did you learn about in Year 3?",
            "options": [
              "Object-oriented programming",
              "Machine learning",
              "Algorithms, loops, variables, conditionals, and debugging",
              "Database management"
            ],
            "answer": 2
          },
          {
            "q": "A 'growth mindset' means...",
            "options": [
              "You are the best at everything",
              "Believing that effort and practice help you improve and learn",
              "Thinking that skills are fixed and cannot change",
              "Avoiding hard challenges"
            ],
            "answer": 1
          },
          {
            "q": "In Year 4, you will learn about more complex versions of...",
            "options": [
              "Completely new topics with no connection to Year 3",
              "The same foundational concepts (algorithms, conditions, loops) applied in more sophisticated ways",
              "Topics from secondary school",
              "History of computing"
            ],
            "answer": 1
          }
        ]
      }
    ]
  },
  {
    "id": "y4-cs-problem-solver",
    "title": "Year 4: Problem Solver",
    "tagline": "Conditionals, functions, data & multi-sensor robots",
    "year": "Year 4",
    "color": "#3B82F6",
    "icon": "🧩",
    "totalXP": 1175,
    "modules": [
      {
        "title": "Algorithms with Multiple Steps",
        "xp": 90,
        "content": {
          "explanation": "In Year 3 you wrote simple algorithms. Now it is time to design more complex ones. A complex algorithm breaks a big problem into sub-problems. Each sub-problem has its own smaller algorithm, and together they solve the whole challenge.\n\nBefore coding, great programmers write pseudocode: an informal plain-English description of the algorithm. It is not real code — you cannot run it — but it forces you to think through every step before you start typing. Programmers who plan in pseudocode make far fewer bugs!\n\nWhen you design an algorithm, think about efficiency too. Is there a shorter way to achieve the same result? Can some steps be combined? Could a loop replace repeated steps? The best algorithms are not just correct — they are elegant and efficient.",
          "example": "// Algorithm design: navigate a figure-8 path\n// Pseudocode first:\n// START\n// Loop 1: draw first circle (4 steps)\n//   Repeat 4: move forward 40cm, turn right 90°\n// Cross over: move forward 10cm\n// Loop 2: draw second circle (4 steps)\n//   Repeat 4: move forward 40cm, turn left 90°\n// END\n\n// Now code it:\nrepeat 4: {move forward 40, turn right 90}\nmove forward 10\nrepeat 4: {move forward 40, turn left 90}",
          "activity": "Design an algorithm for a robot to navigate a figure-8 path. Write pseudocode first, then convert to actual code. Compare your pseudocode with a partner — are there differences? Which approach is more efficient?",
          "keyWords": [
            "pseudocode",
            "algorithm design",
            "sub-problem",
            "efficient",
            "elegant",
            "decompose",
            "plan"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Algorithm Design Process",
              "duration": "20 mins",
              "desc": "Plan a complex algorithm step by step",
              "steps": [
                "Problem: navigate a figure-8 path",
                "Step 1: visualise — draw the path on paper",
                "Step 2: identify sub-problems: circle 1, crossover, circle 2",
                "Step 3: write pseudocode for each sub-problem",
                "Step 4: check pseudocode: does it make sense? Are steps clear?"
              ]
            },
            {
              "num": 2,
              "title": "Write Pseudocode",
              "duration": "15 mins",
              "desc": "Convert plans into pseudocode",
              "steps": [
                "Use pseudocode template: START, numbered steps, END",
                "Write pseudocode for the figure-8 algorithm",
                "Convert pseudocode to actual code instructions",
                "Test the program — does it draw the correct path?",
                "Refine: can any steps be merged or looped?"
              ]
            },
            {
              "num": 3,
              "title": "Compare Approaches",
              "duration": "10 mins",
              "desc": "Discover there are multiple solutions",
              "steps": [
                "Two students share their algorithms for the same problem",
                "Compare: are they different? Is one shorter?",
                "Discuss: which is more efficient? Which is easier to read?",
                "Realise: multiple correct solutions always exist",
                "Choose: which would you prefer to maintain? Why?"
              ]
            }
          ],
          "extension": "Optimize your algorithm: find at least one way to make it shorter or more efficient. Count the number of instructions before and after. How much shorter is the improved version?",
          "reflection": "When might you use pseudocode in a non-computing situation? Can you think of a complex task — like planning a school trip — and write pseudocode for it?",
          "objectives": [
            "Design complex algorithms with multiple steps",
            "Break problems into sub-problems",
            "Write and use pseudocode",
            "Compare and evaluate different algorithmic approaches"
          ],
          "ukCurriculum": [
            "Design and write programs to accomplish specific goals",
            "Use decomposition to break problems into smaller parts",
            "Plan before coding using informal descriptions"
          ]
        },
        "quiz": [
          {
            "q": "What is pseudocode?",
            "options": [
              "Real code you can run on a computer",
              "An informal plain-English description of an algorithm used for planning",
              "A type of loop",
              "A programming error"
            ],
            "answer": 1
          },
          {
            "q": "Why is it useful to write pseudocode before coding?",
            "options": [
              "It wastes time",
              "It forces you to think through every step and reduces bugs",
              "Computers can run pseudocode directly",
              "Pseudocode is faster to execute"
            ],
            "answer": 1
          },
          {
            "q": "Decomposition means...",
            "options": [
              "Making code run faster",
              "Breaking a large problem into smaller, more manageable sub-problems",
              "A type of conditional statement",
              "Running a program step by step"
            ],
            "answer": 1
          },
          {
            "q": "Which algorithm is BETTER for the same task?",
            "options": [
              "The longer one, because more steps means more detail",
              "The one with more variables",
              "The more efficient one that achieves the same result with fewer steps",
              "They are always equally good"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Conditional Logic — If/Then/Else",
        "xp": 90,
        "content": {
          "explanation": "In Year 3 you learned IF/THEN: if a condition is true, do an action. Now you are ready for IF/THEN/ELSE. The ELSE part handles what happens when the condition is FALSE. This means your program handles BOTH possibilities — it never gets stuck wondering what to do.\n\n'If it is sunny, go outside. Else, stay indoors.' Whether it is sunny or not, you know what to do! Programs with IF/THEN/ELSE are much more robust than programs that only handle one case.\n\nYou can also chain multiple conditions: IF condition1 THEN action1, ELSE IF condition2 THEN action2, ELSE action3. This creates programs that can handle many different situations, like a robot that responds differently to bright light, dim light, and complete darkness.",
          "example": "// If/Then/Else examples:\nIF battery > 50 THEN\n  move forward fast\nELSE IF battery > 20 THEN\n  move forward slowly\nELSE\n  return to charging station\n\n// Robot makes THREE different decisions!\n// All possible battery levels are handled.",
          "activity": "Program a robot with an IF/THEN/ELSE: IF obstacle detected THEN turn right, ELSE move forward. Test with an obstacle in different positions. Then add a second condition: IF obstacle AND battery < 20% THEN return home.",
          "keyWords": [
            "if",
            "then",
            "else",
            "condition",
            "branch",
            "decision",
            "true",
            "false",
            "elif"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Real-World If/Then/Else",
              "duration": "15 mins",
              "desc": "Understand both branches of a decision",
              "steps": [
                "'If sunny, wear sunscreen — ELSE wear a jacket'",
                "Identify: condition, then-action, else-action",
                "Why is ELSE important? (handles the case when condition is false)",
                "Students generate 5 IF/THEN/ELSE examples from daily life",
                "Draw flowcharts showing the two branches"
              ]
            },
            {
              "num": 2,
              "title": "Robot with Two Decisions",
              "duration": "20 mins",
              "desc": "See a robot handle both conditions",
              "steps": [
                "Program: IF light bright THEN move forward ELSE stop and blink",
                "Test in bright light: robot moves",
                "Cover the sensor: robot stops and blinks",
                "Both cases handled!",
                "Add: ELSE IF dim THEN move slowly (three cases now)"
              ]
            },
            {
              "num": 3,
              "title": "Build a Conditional Chain",
              "duration": "10 mins",
              "desc": "Handle multiple conditions",
              "steps": [
                "Program: IF distance < 20 THEN turn right ELSE turn left",
                "Test with obstacle in different positions",
                "Verify each case works correctly",
                "Test the boundary: exactly 20cm — what happens?",
                "Edge cases often reveal bugs!"
              ]
            }
          ],
          "extension": "Create a robot program that has IF/THEN/ELSE IF/ELSE with at least THREE different conditions. For example: bright light → speed up, medium light → normal speed, dark → stop and shine light.",
          "reflection": "Think of a real computer system (like a bank's fraud detection, or a weather app) that needs to handle many different conditions. What IF/ELSE decisions might it make?",
          "objectives": [
            "Understand if/then/else conditional structure",
            "Write conditional statements with else clause",
            "Handle true and false outcomes correctly",
            "Create programs with multiple decision branches"
          ],
          "ukCurriculum": [
            "Use selection (if/then/else) in programs",
            "Handle multiple conditions in decision structures",
            "Test conditional logic with different inputs"
          ]
        },
        "quiz": [
          {
            "q": "What does the ELSE clause in an IF/THEN/ELSE do?",
            "options": [
              "It is optional and does nothing",
              "It handles the situation when the IF condition is false",
              "It creates a loop",
              "It stores a variable"
            ],
            "answer": 1
          },
          {
            "q": "If the condition in an IF statement is false and there is no ELSE, what happens?",
            "options": [
              "The program crashes",
              "The program asks the user what to do",
              "The action is skipped and the program continues",
              "The condition is re-checked"
            ],
            "answer": 2
          },
          {
            "q": "Which situation is best handled by IF/THEN/ELSE?",
            "options": [
              "Repeating the same action 10 times",
              "Choosing between different actions depending on whether a condition is true or false",
              "Adding two numbers",
              "Storing information in a variable"
            ],
            "answer": 1
          },
          {
            "q": "'ELSE IF' allows you to...",
            "options": [
              "Create a loop",
              "Check an additional condition if the first one is false",
              "Store multiple values",
              "Debug your program"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Using Variables Effectively",
        "xp": 90,
        "content": {
          "explanation": "Variables are one of the most powerful tools in programming. In Year 3 you created simple counters. Now you will use variables to track battery levels, distances, and scores — and even use variables inside mathematical expressions.\n\nThe name of a variable should describe exactly what it stores. A variable called 'x' tells you nothing. A variable called 'distanceToObstacle' tells you exactly what is inside. Clear names make your code readable to yourself and to others.\n\nVariables can be used in calculations: batteryLevel = batteryLevel - 5 reduces the battery by 5 each time. Or: score = score + (10 * multiplier) adds points multiplied by the current multiplier. Variables working together create complex, adaptive programs.",
          "example": "// Variables working together:\nbatteryLevel = 100\nstepsFromHome = 0\nspeed = 10\n\nwhile moving:\n  batteryLevel = batteryLevel - 2   // Battery drains\n  stepsFromHome = stepsFromHome + 1  // Count distance\n  \n  IF batteryLevel < 20 THEN\n    speed = 5                         // Slow down when low\n  IF batteryLevel < 5 THEN\n    returnHome()                       // Go back!",
          "activity": "Create a program with three variables: batteryLevel (starts at 100), stepsCount (starts at 0), and speed. Program the robot to slow down when battery drops below 30, and stop when it reaches 0. Display all three variables on screen.",
          "keyWords": [
            "variable",
            "meaningful name",
            "calculation",
            "update",
            "expression",
            "track",
            "interact"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Variable Naming Best Practice",
              "duration": "15 mins",
              "desc": "Learn to choose great variable names",
              "steps": [
                "Show two programs — identical but one uses x,y,z and one uses descriptive names",
                "Which is easier to understand?",
                "Bad names: x, t, stuff, thing1",
                "Good names: batteryLevel, stepsFromHome, playerScore",
                "Why: you might read your code months later — would you understand it?"
              ]
            },
            {
              "num": 2,
              "title": "Variables in Calculations",
              "duration": "15 mins",
              "desc": "Use variables in mathematical expressions",
              "steps": [
                "Program: track robot battery level",
                "batteryLevel starts at 100",
                "Each move: batteryLevel = batteryLevel - 5",
                "Display current level",
                "What level does it reach after 10 moves? After 20?"
              ]
            },
            {
              "num": 3,
              "title": "Adaptive Program with Variables",
              "duration": "15 mins",
              "desc": "Variables controlling robot behaviour",
              "steps": [
                "Create variables: batteryLevel, stepsFromHome, speed",
                "Program: IF batteryLevel < 20 THEN speed = 3 (slow down)",
                "Program: IF batteryLevel < 5 THEN return home",
                "Run the simulation and watch variables change",
                "Discuss: the robot is adapting to its situation!"
              ]
            }
          ],
          "extension": "Create a game-like robot program: variable 'score' increases by 10 each time the robot collects a coin (obstacle avoidance = coin collected), variable 'lives' decreases by 1 each time it hits a wall. Display score and lives on screen.",
          "reflection": "Can you think of 5 variables a hospital patient-monitoring machine might use? What would happen if one of those variables was given the wrong value by a programmer?",
          "objectives": [
            "Use variables to store and update data",
            "Choose meaningful variable names",
            "Use variables in mathematical calculations",
            "Create programs where multiple variables interact"
          ],
          "ukCurriculum": [
            "Use variables and data in programs",
            "Understand the importance of naming conventions",
            "Write programs that adapt based on variable values"
          ]
        },
        "quiz": [
          {
            "q": "Which variable name follows best practice?",
            "options": [
              "v1",
              "speed",
              "x",
              "thing"
            ],
            "answer": 1
          },
          {
            "q": "A robot battery starts at 100. Each move costs 8 units. After 5 moves, what is the battery level?",
            "options": [
              "95",
              "60",
              "8",
              "40"
            ],
            "answer": 1
          },
          {
            "q": "Why are clear variable names important?",
            "options": [
              "They make programs run faster",
              "They make code readable and understandable, especially when you return to it later",
              "They are required by the computer",
              "Short names are always better"
            ],
            "answer": 1
          },
          {
            "q": "What does this instruction do? score = score + 10",
            "options": [
              "Creates a new variable called 10",
              "Adds 10 to the current value of score",
              "Sets score to 10",
              "Multiplies score by 10"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Loops — Nested and Conditional",
        "xp": 90,
        "content": {
          "explanation": "You already know count-controlled loops (repeat 4 times). Now you will learn two more powerful types: nested loops and while loops.\n\nA nested loop is a loop inside another loop. Imagine drawing a grid: the outer loop goes row by row, and for each row, the inner loop fills in each column. Nested loops create complex patterns and are used everywhere in real programming — from drawing graphics to processing spreadsheets.\n\nA while loop repeats as long as a condition is TRUE: 'While battery > 0: keep moving.' As soon as the condition becomes false, the loop stops. While loops are perfect when you do not know in advance how many times you will need to repeat.",
          "example": "// Nested loop: robot draws 3×4 grid\nrepeat 3 times:          // 3 rows\n  repeat 4 times:        // 4 columns per row\n    move forward 20 cm\n    turn left 90 degrees\n  move to next row\n\n// While loop: move until close to obstacle\nwhile distance > 30 cm:\n  move forward 5 cm\nstop  // Loop ends when distance becomes <= 30",
          "activity": "Program a nested loop that draws a 3×3 grid pattern. Then write a while loop: the robot keeps moving toward a wall and stops when it gets within 20 cm. What happens if you change the condition to 10 cm?",
          "keyWords": [
            "nested loop",
            "while loop",
            "condition",
            "outer loop",
            "inner loop",
            "iteration",
            "infinite loop"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Nested Loops",
              "duration": "20 mins",
              "desc": "Create complex patterns with nested loops",
              "steps": [
                "Visualise a 3×4 grid on the board",
                "Outer loop: 3 rows, inner loop: 4 columns per row",
                "Trace through by hand: what is the robot doing at each step?",
                "Code the nested loop in the interface",
                "Run it and observe the grid pattern"
              ]
            },
            {
              "num": 2,
              "title": "While Loop — Conditional Repetition",
              "duration": "15 mins",
              "desc": "Loop until a condition changes",
              "steps": [
                "Program: WHILE distance > 30 cm: move forward 5 cm",
                "Place wall — robot moves until close, then stops",
                "Remove wall — robot runs forever (discuss: infinite loop danger!)",
                "Always ensure a while loop CAN end",
                "Discuss: when would you use WHILE instead of REPEAT?"
              ]
            },
            {
              "num": 3,
              "title": "Loop Optimization Challenge",
              "duration": "10 mins",
              "desc": "Use loops to simplify code",
              "steps": [
                "Show a long program: 12 separate instructions for a grid pattern",
                "Challenge: how many lines can loops save?",
                "Students rewrite using nested loops",
                "Compare: how many instructions before vs after?",
                "Fewer instructions = easier to maintain and debug"
              ]
            }
          ],
          "extension": "WARNING! Try creating an infinite loop deliberately (while true: move forward). What happens? Why must every while loop have a way to become false eventually? Discuss why infinite loops are dangerous in real programs.",
          "reflection": "Where might nested loops be used in a real program? Think about: games with grids (like chess or Minecraft), spreadsheets with rows and columns, searching through a list of lists.",
          "objectives": [
            "Use nested loops to create complex patterns",
            "Use while loops for condition-controlled repetition",
            "Understand the danger of infinite loops",
            "Optimise code by choosing appropriate loop types"
          ],
          "ukCurriculum": [
            "Use different types of loops appropriately",
            "Understand count-controlled and condition-controlled repetition",
            "Recognise infinite loops and understand why they are problematic"
          ]
        },
        "quiz": [
          {
            "q": "What is a nested loop?",
            "options": [
              "A loop that never stops",
              "A loop inside another loop, used to create patterns and process grids",
              "A type of conditional",
              "A loop that counts backwards"
            ],
            "answer": 1
          },
          {
            "q": "When should you use a WHILE loop instead of REPEAT?",
            "options": [
              "Always — while loops are always better",
              "When you know exactly how many repetitions you need",
              "When you want to repeat until a condition changes, and you do not know how many times that will take",
              "While loops are the same as repeat loops"
            ],
            "answer": 2
          },
          {
            "q": "What is an 'infinite loop'?",
            "options": [
              "A loop that is shaped like a circle",
              "A very large loop",
              "A loop whose condition never becomes false, so it runs forever and freezes the program",
              "A loop that runs exactly once"
            ],
            "answer": 2
          },
          {
            "q": "A nested loop with 3 outer iterations and 4 inner iterations runs the inner action how many times?",
            "options": [
              "3",
              "4",
              "7",
              "12"
            ],
            "answer": 3
          }
        ]
      },
      {
        "title": "Functions and Modularity",
        "xp": 95,
        "content": {
          "explanation": "Imagine you need to draw 5 squares in your program. Without functions, you would write the square-drawing code 5 times — that is a lot of repeated code! With a function, you write the code once, give it a name like 'drawSquare()', and call it 5 times. Much better!\n\nA function is a named, reusable block of code. Functions make programs shorter, easier to read, and much easier to fix — if the square-drawing code has a bug, you fix it in ONE place, not in five.\n\nFunctions can also accept parameters: inputs that change their behaviour. 'drawSquare(50)' draws a small square, 'drawSquare(200)' draws a large square — the same function, different input, different result. This is called abstraction: hiding the complexity of 'how' inside the function so you only need to know 'what' it does.",
          "example": "// Without functions (repetition!):\nmove forward 30, turn right 90 [×4 times]\nmove to new position\nmove forward 30, turn right 90 [×4 times]\n\n// WITH functions (much better!):\nfunction drawSquare(size):\n  repeat 4 times:\n    move forward size cm\n    turn right 90 degrees\n\n// Call it multiple times:\ndrawSquare(30)\nmoveTo(50, 0)\ndrawSquare(30)\nmoveTo(100, 0)\ndrawSquare(30)",
          "activity": "Write a function called 'drawShape(sides, size)' that draws any regular shape. Test it: drawShape(4,30) should draw a square, drawShape(3,40) should draw a triangle, drawShape(6,20) should draw a hexagon.",
          "keyWords": [
            "function",
            "parameter",
            "call",
            "reuse",
            "abstraction",
            "DRY",
            "modular"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Identify Repetition",
              "duration": "15 mins",
              "desc": "Spot where functions would help",
              "steps": [
                "Show a long program with the same sequence repeated 4 times",
                "Ask: what is the same each time?",
                "Highlight the repeated section",
                "Suggest: create a function for this section",
                "Discuss: how many lines would we save?"
              ]
            },
            {
              "num": 2,
              "title": "Write and Use Functions",
              "duration": "20 mins",
              "desc": "Create and call your first function",
              "steps": [
                "Create function: makeSquare()",
                "Inside: repeat 4 times: move forward 30, turn right 90",
                "Call makeSquare() three times in the main program",
                "Three squares drawn with 3 lines, not 12!",
                "Discuss: what if we want different sized squares?"
              ]
            },
            {
              "num": 3,
              "title": "Functions with Parameters",
              "duration": "10 mins",
              "desc": "Make functions flexible with parameters",
              "steps": [
                "Modify makeSquare to accept a size parameter: makeSquare(size)",
                "Inside: move forward SIZE, turn right 90",
                "Call: makeSquare(20), makeSquare(50), makeSquare(100)",
                "Three different squares from ONE function!",
                "Key insight: parameters make functions flexible"
              ]
            }
          ],
          "extension": "Create a 'robot dance' using only function calls in your main program. Define at least 4 functions: spinRight(), wiggle(), moveForward(steps), drawCircle(). Your main program should be readable like a story: spinRight(), wiggle(3), moveForward(50)...",
          "reflection": "The DRY principle means 'Don't Repeat Yourself.' Can you find examples of DRY (or the opposite — WET: Write Everything Twice) in your previous programs? How would you refactor them using functions?",
          "objectives": [
            "Understand functions as reusable, named blocks of code",
            "Write functions with parameters",
            "Use functions to eliminate repeated code",
            "Understand abstraction and the DRY principle"
          ],
          "ukCurriculum": [
            "Use functions and procedures in programs",
            "Understand how programs can be divided into named sections",
            "Apply the principle of abstraction"
          ]
        },
        "quiz": [
          {
            "q": "What is a function in programming?",
            "options": [
              "A type of variable",
              "A named, reusable block of code that can be called multiple times",
              "A loop that runs forever",
              "A type of conditional"
            ],
            "answer": 1
          },
          {
            "q": "What is a 'parameter' in a function?",
            "options": [
              "The function's name",
              "An error inside a function",
              "An input value that changes the function's behaviour",
              "The output of a function"
            ],
            "answer": 2
          },
          {
            "q": "The DRY principle stands for...",
            "options": [
              "Design Really Youthfully",
              "Debug Remove Yield",
              "Don't Repeat Yourself — write code once in a function and reuse it",
              "Data Retrieval Yield"
            ],
            "answer": 2
          },
          {
            "q": "If you fix a bug inside a function, how many places in the code are fixed?",
            "options": [
              "Only the places where you manually fix it",
              "One — the function itself, and the fix applies everywhere the function is called",
              "Every line separately",
              "You need to fix each call separately"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Debugging Complex Programs",
        "xp": 90,
        "content": {
          "explanation": "As programs get bigger and more complex, debugging becomes more challenging. There are two main types of errors: syntax errors and logic errors. Syntax errors are mistakes in the structure of your code (like a missing bracket) — the computer catches these immediately and tells you. Logic errors are much trickier: the code runs fine but produces the wrong result.\n\nProfessional programmers use several strategies to debug complex programs. Tracing means following each line of code by hand, pretending to be the computer. Print debugging means adding temporary output statements to show what variables contain at different points. Step-by-step execution means running the program one line at a time to see exactly where things go wrong.\n\nThe most important debugging skill is persistence. Every programmer hits bugs. The best ones do not panic — they investigate methodically, systematically checking each possibility until they find the culprit.",
          "example": "// Syntax error (computer spots this):\nif distance < 30    // Missing : at end!\n  stop\n\n// Logic error (harder to find):\n// Bug: loop runs 3 times instead of 4:\nrepeat 3 times:       // Should be 4!\n  move forward 30\n  turn right 90\n// Square is actually a triangle — why?\n\n// Debug: add print statements\nsteps = 0\nrepeat 4 times:\n  steps = steps + 1\n  print('Step: ' + steps)  // Shows: 1,2,3,4",
          "activity": "Here is a buggy program: it should draw a square but draws a triangle. Find the bug using ONLY the step-by-step method (trace by hand). Then fix it and verify.",
          "keyWords": [
            "syntax error",
            "logic error",
            "trace",
            "print debugging",
            "step-by-step",
            "investigate",
            "methodical"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Syntax vs Logic Errors",
              "duration": "15 mins",
              "desc": "Learn to identify different error types",
              "steps": [
                "Syntax error example: missing bracket in IF statement",
                "Show: computer catches it immediately with an error message",
                "Logic error example: loop runs 3 times instead of 4",
                "Show: code runs without error but draws a triangle not a square",
                "Key difference: syntax = computer spots it; logic = you must spot it"
              ]
            },
            {
              "num": 2,
              "title": "Debugging Strategies",
              "duration": "20 mins",
              "desc": "Master four debugging techniques",
              "steps": [
                "Strategy 1: Trace by hand (follow each instruction on paper)",
                "Strategy 2: Add print statements to show variable values",
                "Strategy 3: Run step by step using the debugger",
                "Strategy 4: Test small sections separately",
                "Practice each strategy on a buggy example program"
              ]
            },
            {
              "num": 3,
              "title": "Find and Fix Logic Errors",
              "duration": "10 mins",
              "desc": "Apply debugging skills to real bugs",
              "steps": [
                "Students receive a program with one logic error (loop count wrong)",
                "Use any debugging strategy to find it",
                "Fix the bug",
                "Verify the fix works",
                "Share: which strategy did you use? Why?"
              ]
            }
          ],
          "extension": "Create a 'bug hunt' challenge for a classmate: write a working program, then introduce exactly two bugs (one syntax, one logic). Document the bugs separately. Swap with a classmate and see if they can find both!",
          "reflection": "Famous real bug: in 1962, a NASA rocket had to be destroyed because of a missing hyphen in the code. Research this story. What does it teach you about the importance of careful testing and debugging?",
          "objectives": [
            "Identify and distinguish syntax errors from logic errors",
            "Use multiple debugging strategies systematically",
            "Trace code by hand to find logic errors",
            "Persist through difficult debugging challenges"
          ],
          "ukCurriculum": [
            "Debug programs that do not work correctly",
            "Use logical reasoning to detect errors",
            "Understand that errors are normal and fixable through systematic investigation"
          ]
        },
        "quiz": [
          {
            "q": "What is the difference between a syntax error and a logic error?",
            "options": [
              "There is no difference",
              "Syntax errors are spotted by the computer immediately; logic errors run but give wrong results",
              "Logic errors are always more dangerous",
              "Syntax errors are harder to fix"
            ],
            "answer": 1
          },
          {
            "q": "Which debugging technique involves adding temporary output statements to show variable values?",
            "options": [
              "Tracing by hand",
              "Step-by-step execution",
              "Print debugging",
              "Guessing"
            ],
            "answer": 2
          },
          {
            "q": "A program draws a triangle when it should draw a square. This is most likely...",
            "options": [
              "A syntax error",
              "A logic error (perhaps the loop runs 3 times instead of 4)",
              "Not a bug at all",
              "A hardware failure"
            ],
            "answer": 1
          },
          {
            "q": "The best attitude when faced with a difficult bug is...",
            "options": [
              "Give up and delete the program",
              "Panic and ask for help immediately",
              "Investigate methodically and systematically, checking each possibility",
              "Randomly change things until it works"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Testing Strategies",
        "xp": 90,
        "content": {
          "explanation": "A test plan is a systematic approach to checking your program. Instead of running the program once and hoping it works, you create a list of specific test cases — situations that cover all the important scenarios, including edge cases.\n\nEdge cases are the tricky boundary situations: what happens when the input is zero? When it is the maximum possible value? When there is no input at all? Most bugs hide in edge cases because programmers often forget to think about unusual inputs.\n\nTest coverage measures how much of your code is tested. High coverage means you have tested most paths through your program. Low coverage means there are parts of your code that might contain undiscovered bugs. Professional programmers aim for the highest possible test coverage.",
          "example": "// Test plan example: obstacle-avoidance robot\n// Test 1: obstacle at 10cm    → robot stops      [PASS]\n// Test 2: obstacle at 50cm    → robot moves       [PASS]\n// Test 3: no obstacle         → robot moves       [PASS]\n// Test 4: obstacle at 30cm    → robot stops       [PASS] (edge case: exactly at boundary)\n// Test 5: obstacle at 0cm     → robot stops       [FAIL] bug found!\n// Fix: handle distance = 0 as a special case\n// Retest 5: obstacle at 0cm  → robot stops       [PASS]",
          "activity": "Design a 5-case test plan for a robot program. Include at least 2 edge cases. Execute each test and record Pass/Fail. If any fail, fix the bug and retest.",
          "keyWords": [
            "test plan",
            "edge case",
            "test coverage",
            "boundary",
            "systematic",
            "pass",
            "fail",
            "regression"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Create a Test Plan",
              "duration": "20 mins",
              "desc": "Design a comprehensive testing approach",
              "steps": [
                "Program to test: robot navigates maze",
                "Create 5 test cases covering different scenarios",
                "Include: simple maze, tight corridor, dead end, no obstacles, very complex path",
                "Document: what is the input? What is the expected output?",
                "Discuss: what edge cases exist for maze navigation?"
              ]
            },
            {
              "num": 2,
              "title": "Execute Test Plan",
              "duration": "15 mins",
              "desc": "Run tests and record results",
              "steps": [
                "Run each test case one by one",
                "Record: PASS (expected = actual) or FAIL (different)",
                "If FAIL: describe precisely what went wrong",
                "Prioritise: which failures to fix first?",
                "Fix one bug at a time"
              ]
            },
            {
              "num": 3,
              "title": "Edge Case Testing",
              "duration": "10 mins",
              "desc": "Push programs to their boundaries",
              "steps": [
                "Test: obstacle at exactly 0cm (robot touching wall)",
                "Test: robot starting at the goal already",
                "Test: maze with no valid path",
                "Does program handle these gracefully or crash?",
                "Fix any edge case failures found"
              ]
            }
          ],
          "extension": "Regression testing: after fixing a bug, re-run ALL your previous tests to make sure the fix did not accidentally break something else. This is called a regression test. Why is it so important?",
          "reflection": "Think about testing in other fields: medicine (clinical trials), engineering (stress tests), aviation (flight simulators). What do all these have in common with software testing? Why is comprehensive testing so important when lives are at stake?",
          "objectives": [
            "Create comprehensive test plans",
            "Test edge cases and boundary conditions",
            "Understand test coverage",
            "Identify and fix bugs discovered through testing"
          ],
          "ukCurriculum": [
            "Test and refine programs",
            "Use systematic testing to verify program correctness",
            "Understand the importance of edge cases"
          ]
        },
        "quiz": [
          {
            "q": "What is an 'edge case' in testing?",
            "options": [
              "A very common scenario",
              "A boundary or extreme situation that often reveals hidden bugs (e.g. zero, maximum, empty input)",
              "A type of syntax error",
              "A test that always passes"
            ],
            "answer": 1
          },
          {
            "q": "Test coverage measures...",
            "options": [
              "How fast tests run",
              "What percentage of your code is checked by your tests",
              "How many test cases you have",
              "The difficulty of your tests"
            ],
            "answer": 1
          },
          {
            "q": "After fixing a bug, you should...",
            "options": [
              "Assume everything else still works",
              "Only retest the specific bug you fixed",
              "Re-run ALL previous tests (regression testing) to check nothing else broke",
              "Add more features immediately"
            ],
            "answer": 2
          },
          {
            "q": "A test FAILS when...",
            "options": [
              "The program crashes during the test",
              "The actual result is different from the expected result",
              "The test takes too long to run",
              "You run out of time"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Data and Lists",
        "xp": 90,
        "content": {
          "explanation": "So far your variables have stored a single value. But what if you need to store a whole collection of values — like the last 10 sensor readings, or a student's scores for all 5 subjects? That is where lists come in.\n\nA list is an ordered collection of items. Each item has a position called an index. The first item is at index 0 (in most programming languages), the second at index 1, and so on. You can add items, remove items, and access any item by its index.\n\nLists and loops are a powerful combination: you can use a loop to process every item in a list automatically. Instead of writing separate instructions for each item, you write one loop that handles them all.",
          "example": "// Creating and using a list:\nspeedSettings = [5, 10, 15, 20, 25]  // List of 5 speeds\nsensorReadings = []                    // Empty list\n\n// Add readings to list:\nrepeat 5 times:\n  reading = getDistanceSensor()\n  sensorReadings.append(reading)       // Add to list\n\n// Loop through list:\nfor speed in speedSettings:\n  setRobotSpeed(speed)\n  wait 2 seconds\n\n// Access by index:\nfirstSpeed = speedSettings[0]  // = 5\nlastSpeed = speedSettings[4]   // = 25",
          "activity": "Create a list of 5 speed values. Use a loop to make the robot move at each speed in turn. Then create a list to store 10 distance sensor readings as the robot moves, and display all readings at the end.",
          "keyWords": [
            "list",
            "index",
            "element",
            "append",
            "iterate",
            "collection",
            "ordered"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Real-World Lists",
              "duration": "15 mins",
              "desc": "Discover lists all around you",
              "steps": [
                "What lists do you use daily? (shopping list, playlist, timetable)",
                "How are lists ordered? Does order matter?",
                "How do lists help organise data?",
                "Connect: in computing, lists store related data together",
                "Discuss: what makes lists different from single variables?"
              ]
            },
            {
              "num": 2,
              "title": "Create and Use a List",
              "duration": "20 mins",
              "desc": "Build a list in code",
              "steps": [
                "Program: robot takes 5 distance readings as it moves",
                "Each reading added to a list: sensorReadings.append(value)",
                "Robot finishes route and displays all readings",
                "Can you spot when an obstacle got closer?",
                "Discuss: we recorded the robot's entire journey in one list!"
              ]
            },
            {
              "num": 3,
              "title": "Process List Data",
              "duration": "10 mins",
              "desc": "Loop through a list automatically",
              "steps": [
                "Create list: speeds = [5, 10, 15, 20]",
                "Use FOR loop: for each speed in list → set robot speed → wait 2 seconds",
                "Watch robot accelerate through each speed setting",
                "Modify the list — robot automatically uses new speeds",
                "Key insight: loop + list = powerful combination"
              ]
            }
          ],
          "extension": "Write a program that stores 10 sensor readings in a list, then finds the minimum (closest obstacle distance) and maximum values in the list. Display both results.",
          "reflection": "Lists are everywhere in computing: music playlists, Instagram feeds, search results, shopping carts. Choose one and explain what is stored in that list and how it might be sorted or searched.",
          "objectives": [
            "Understand lists as ordered collections of data",
            "Create lists and add elements",
            "Access list elements using their index",
            "Use loops to process list elements"
          ],
          "ukCurriculum": [
            "Use variables and data structures in programs",
            "Understand how collections of data are stored and accessed",
            "Combine loops and lists to process data"
          ]
        },
        "quiz": [
          {
            "q": "What is a list in programming?",
            "options": [
              "A type of loop",
              "An ordered collection of items where each has an index position",
              "A type of conditional",
              "A single variable that changes"
            ],
            "answer": 1
          },
          {
            "q": "If a list is [10, 20, 30, 40], what value is at index 2?",
            "options": [
              "10",
              "20",
              "30",
              "40"
            ],
            "answer": 2
          },
          {
            "q": "What is the best way to process every item in a list?",
            "options": [
              "Write separate instructions for each item",
              "Use a loop to iterate through all items automatically",
              "Use an IF statement",
              "Create a new variable for each item"
            ],
            "answer": 1
          },
          {
            "q": "What does list.append(value) do?",
            "options": [
              "Removes the last item",
              "Adds a new item to the end of the list",
              "Sorts the list",
              "Finds an item in the list"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Algorithms and Efficiency",
        "xp": 90,
        "content": {
          "explanation": "Multiple algorithms can solve the same problem — but some are much faster and more efficient than others. Efficiency matters more and more as your data gets bigger. Sorting 10 numbers by hand is fast no matter what method you use. Sorting 1,000,000 numbers is a very different story.\n\nBubble sort is a simple sorting algorithm that repeatedly compares pairs of items and swaps them if they are in the wrong order. It is easy to understand but slow. Merge sort is more complex but dramatically faster for large lists. The best algorithm for a job depends on the situation.\n\nFor robots, efficiency means fewer moves (saves battery), shorter paths (saves time), and smarter decisions (handles more situations). A robot that plans an efficient route has more battery left for the return journey!",
          "example": "// Bubble sort: simple but slow\nlist = [64, 34, 25, 12, 22]\n// Compare pairs and swap if wrong order\n// Round 1: [34,25,12,22,64]\n// Round 2: [25,12,22,34,64]\n// Round 3: [12,22,25,34,64] ← sorted!\n\n// For 1000 items, bubble sort takes ~500,000 comparisons\n// Merge sort takes only ~10,000 comparisons\n// For 10 items, the difference is tiny\n// For 1,000,000 items, it is enormous!",
          "activity": "Sort this list by hand using bubble sort: [5, 3, 8, 1, 9, 2]. Count how many comparisons you need. Then research merge sort — how many fewer comparisons does it use for the same list?",
          "keyWords": [
            "efficiency",
            "sorting",
            "bubble sort",
            "algorithm comparison",
            "optimise",
            "path planning",
            "trade-off"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Multiple Solutions to One Problem",
              "duration": "20 mins",
              "desc": "Compare different approaches",
              "steps": [
                "Problem: find shortest path through maze",
                "Approach 1: random searching (try random directions)",
                "Approach 2: wall-following (keep right hand on wall)",
                "Approach 3: breadth-first search (systematic, guaranteed shortest)",
                "Count moves for each approach — which is most efficient?"
              ]
            },
            {
              "num": 2,
              "title": "Optimise Robot Movement",
              "duration": "15 mins",
              "desc": "Plan an efficient collection route",
              "steps": [
                "Setup: 6 coins scattered in a room, robot must collect all",
                "First attempt: collect in random order",
                "Count total distance travelled",
                "Optimization: plan the most efficient route (nearest first)",
                "Compare distances — how much shorter is the optimal route?"
              ]
            },
            {
              "num": 3,
              "title": "Algorithm Comparison",
              "duration": "10 mins",
              "desc": "Experience the difference in sorting algorithms",
              "steps": [
                "Give students 8 numbered cards",
                "Bubble sort: compare pairs, swap — count comparisons needed",
                "Merge sort (simplified): split, sort halves, merge — count comparisons",
                "Compare counts — difference is small for 8 items",
                "Discuss: for 1,000,000 items, the difference becomes enormous!"
              ]
            }
          ],
          "extension": "Research binary search: how does it find an item in a sorted list much faster than checking every item? Write pseudocode for binary search and explain why it is so much more efficient than linear search.",
          "reflection": "If a hospital needs to search through 10 million patient records to find a match, why does the choice of search algorithm matter so much? What would be the real-world consequences of using an inefficient algorithm?",
          "objectives": [
            "Compare algorithms solving the same problem",
            "Understand efficiency and optimisation",
            "Choose appropriate algorithms for specific tasks",
            "Apply algorithmic thinking to real-world optimisation"
          ],
          "ukCurriculum": [
            "Understand that different algorithms can solve the same problem",
            "Compare algorithms for efficiency",
            "Appreciate that algorithm choice has real consequences"
          ]
        },
        "quiz": [
          {
            "q": "Why does algorithm efficiency matter more with large amounts of data?",
            "options": [
              "It does not matter — all algorithms are equally fast",
              "With large data, inefficient algorithms take exponentially longer and can become unusable",
              "Larger data is always processed faster",
              "Computers get faster automatically for large data"
            ],
            "answer": 1
          },
          {
            "q": "What does 'sorting' mean in computing?",
            "options": [
              "Making code run faster",
              "Arranging items in a list in a specific order (e.g. smallest to largest)",
              "Removing duplicates from a list",
              "Searching for an item"
            ],
            "answer": 1
          },
          {
            "q": "A robot planning an efficient route is trying to...",
            "options": [
              "Move as slowly as possible",
              "Minimise total distance and time, saving battery",
              "Visit every possible location",
              "Avoid all obstacles"
            ],
            "answer": 1
          },
          {
            "q": "Bubble sort is...",
            "options": [
              "The fastest sorting algorithm",
              "Simple to understand but slow for large lists",
              "Never used in real programs",
              "The same as merge sort"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Robotics: Multi-Sensor Integration",
        "xp": 95,
        "content": {
          "explanation": "Real robots do not rely on a single sensor — they combine information from multiple sensors to build a better picture of the world. This is called sensor fusion. A self-driving car uses cameras, radar, LIDAR, and GPS all at once. No single sensor can do the job alone.\n\nWhen designing a program that uses multiple sensors, you need to think about priorities: what happens when two sensors give conflicting information? What if the light sensor says 'bright' but the distance sensor says 'obstacle ahead'? Your program must handle all combinations.\n\nMulti-sensor programs are also harder to test: you need test cases for each sensor separately AND for all combinations. Systematic testing becomes even more important when complexity increases.",
          "example": "// Multi-sensor robot: navigate dark room safely\nsensors: distance, light, line\n\nrepeat forever:\n  dist = readDistanceSensor()\n  light = readLightSensor()\n  onLine = readLineSensor()\n  \n  IF dist < 20 THEN\n    stop and turn              // Obstacle avoidance\n  ELSE IF onLine THEN\n    follow line                // Path following\n  ELSE IF light < 30 THEN\n    slow down                  // Dark = cautious\n  ELSE\n    move forward normally      // All clear!",
          "activity": "Program a robot to use three sensors together: distance (avoid obstacles), line (follow path), and light level (slow down in dark areas). Test each sensor separately first, then combine them.",
          "keyWords": [
            "sensor fusion",
            "integrate",
            "priority",
            "combine",
            "autonomous",
            "multi-sensor",
            "real-time"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Sensor Review",
              "duration": "10 mins",
              "desc": "Understand what each sensor provides",
              "steps": [
                "Distance sensor: how far to the nearest object",
                "Light sensor: how bright is the environment",
                "Line sensor: is there a line below the robot?",
                "Color sensor: what color is below?",
                "Discuss: what can each sensor detect? What can it NOT detect?"
              ]
            },
            {
              "num": 2,
              "title": "Design a Multi-Sensor Program",
              "duration": "15 mins",
              "desc": "Plan how sensors work together",
              "steps": [
                "Problem: navigate a path in a dark room with obstacles",
                "Sensor 1: distance → avoid obstacles",
                "Sensor 2: light level → adjust speed in darkness",
                "Sensor 3: line sensor → follow the path",
                "Write pseudocode showing how all three interact"
              ]
            },
            {
              "num": 3,
              "title": "Code, Test, and Refine",
              "duration": "20 mins",
              "desc": "Build and test the integrated system",
              "steps": [
                "Code the multi-sensor program from your pseudocode",
                "Test each sensor separately first (unit testing)",
                "Combine all three sensors and test together",
                "Adjust sensitivity values based on test results",
                "Celebrate: your robot navigates autonomously!"
              ]
            }
          ],
          "extension": "Add a fourth sensor: color sensor. Program the robot to stop at a red zone, speed up at a green zone, and turn at a yellow zone. Update your test plan to include all combinations of sensor states.",
          "reflection": "Self-driving cars use sensor fusion with cameras, radar, LIDAR, and GPS. Research ONE famous incident where a self-driving car was involved in an accident. What sensor failed or gave wrong data? What can we learn from it?",
          "objectives": [
            "Integrate multiple sensors in a single program",
            "Use sensor fusion to build a more complete picture",
            "Handle conflicting sensor data with priority rules",
            "Test multi-sensor programs systematically"
          ],
          "ukCurriculum": [
            "Design programs that respond to inputs from multiple sources",
            "Apply systems thinking to robotics",
            "Test complex programs systematically"
          ]
        },
        "quiz": [
          {
            "q": "What is 'sensor fusion'?",
            "options": [
              "Using only the most accurate sensor",
              "Combining data from multiple sensors to make better decisions than any single sensor alone",
              "A type of loop for sensor programs",
              "Averaging sensor readings"
            ],
            "answer": 1
          },
          {
            "q": "When two sensors give conflicting information, a robot should...",
            "options": [
              "Ignore both sensors",
              "Follow a priority rule defined in the program to decide which to trust",
              "Crash and stop",
              "Ask the user"
            ],
            "answer": 1
          },
          {
            "q": "Why should you test each sensor separately BEFORE combining them?",
            "options": [
              "It wastes time",
              "Separate testing ensures each sensor works correctly, making combined testing much easier to debug",
              "It is a programming rule",
              "Sensors cannot be tested together"
            ],
            "answer": 1
          },
          {
            "q": "A robot that uses sensors to navigate without human input is called...",
            "options": [
              "Broken",
              "Manual",
              "Autonomous",
              "Fragile"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Digital World and Networks",
        "xp": 90,
        "content": {
          "explanation": "Computers do not work in isolation — they connect to each other through networks. A network is any group of connected computers that can share data. Your school Wi-Fi is a network. The Internet is the world's biggest network — billions of computers all connected together.\n\nWhen you send a message, it does not travel as one piece — it is broken into small packets, each labelled with a destination address. These packets travel independently across the network and are reassembled at the destination. This is called packet switching and it makes the Internet very robust — if one path is blocked, packets find another route.\n\nFor robots, wireless connectivity opens exciting possibilities: robots sharing sensor data, a fleet of robots coordinating their movements, or a remote operator sending instructions. Understanding networks helps you build smarter, connected systems.",
          "example": "// Wireless robot communication example:\n// Robot 1 sends: 'obstacle at position (3,4)'\n// Data packet: {from: Robot1, to: Robot2, data: obstacle_at_3_4}\n// Travels over WiFi network\n// Robot 2 receives: adjusts its path to avoid (3,4)\n// Result: robots cooperate without human intervention!\n\n// Network basics:\n// IP address: unique label for each device\n// Packet: small chunk of data with destination address\n// Router: directs packets to correct destination",
          "activity": "Draw a network diagram showing: 3 computers, 1 robot, 1 printer, and 1 router all connected. Label which devices could communicate with each other. Which device directs the traffic?",
          "keyWords": [
            "network",
            "internet",
            "packet",
            "WiFi",
            "Bluetooth",
            "IP address",
            "router",
            "wireless"
          ],
          "activities": [
            {
              "num": 1,
              "title": "How Networks Work",
              "duration": "20 mins",
              "desc": "Understand data transmission",
              "steps": [
                "Computer A wants to send a photo to Computer B",
                "Photo is broken into packets (like cutting a letter into pieces)",
                "Each packet has a destination address (like a postal address)",
                "Packets travel through the network (may take different routes!)",
                "Arrive at destination and are reassembled in order"
              ]
            },
            {
              "num": 2,
              "title": "Wireless Robot Communication Demo",
              "duration": "15 mins",
              "desc": "See networks enable robot cooperation",
              "steps": [
                "Show two robots with wireless communication enabled",
                "Robot 1 detects an obstacle: sends location to Robot 2 via WiFi",
                "Robot 2 adjusts its path before reaching the obstacle",
                "Ask: how did information travel? WiFi → router → WiFi",
                "Real example: Amazon warehouse robots communicate like this"
              ]
            },
            {
              "num": 3,
              "title": "Connected Robots Discussion",
              "duration": "10 mins",
              "desc": "Imagine the future of networked robotics",
              "steps": [
                "How could 10 robots working together be better than 1?",
                "What information could they share? (obstacle positions, task completion)",
                "What are the risks? (one hacked robot could compromise all)",
                "Real examples: drone swarms, self-driving car fleets",
                "Draw: what would a fleet of 5 networked robots look like?"
              ]
            }
          ],
          "extension": "Research the Internet of Things (IoT): everyday devices connected to the Internet (smart fridges, smart lights, smart watches). What are the benefits? What are the privacy and security risks?",
          "reflection": "If every robot in a school could communicate with every other robot over a network, what would you program them to do together? Write a short plan for a multi-robot school project.",
          "objectives": [
            "Understand how computers connect in networks",
            "Learn how data travels as packets",
            "Understand wireless communication for robotics",
            "Consider benefits and risks of connected devices"
          ],
          "ukCurriculum": [
            "Understand computer networks including the internet",
            "Understand how data is transmitted",
            "Consider the opportunities and risks of connectivity"
          ]
        },
        "quiz": [
          {
            "q": "What is a network?",
            "options": [
              "A single powerful computer",
              "A group of connected computers that can share data",
              "A type of software",
              "A programming language"
            ],
            "answer": 1
          },
          {
            "q": "What is a 'packet' in networking?",
            "options": [
              "A physical parcel",
              "A small chunk of data with a destination address, sent independently across a network",
              "A type of wireless signal",
              "An error message"
            ],
            "answer": 1
          },
          {
            "q": "What device directs network traffic to the correct destination?",
            "options": [
              "A sensor",
              "A variable",
              "A router",
              "A loop"
            ],
            "answer": 2
          },
          {
            "q": "What is one RISK of connecting robots to a network?",
            "options": [
              "They become slower",
              "They might communicate too much",
              "Security vulnerabilities — a hacked robot could cause harm or compromise the whole fleet",
              "Networks always fail"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Collaborative Challenge Project",
        "xp": 95,
        "content": {
          "explanation": "Time to put everything together in a major team project! This week you will work in a team to solve a complex challenge: programme three coordinated robots to collect items from a maze and return to base, as efficiently as possible.\n\nThis requires every skill from Year 4: algorithm design, conditionals, variables, loops, functions, debugging, testing, sensor fusion, and network coordination. Great teams divide the work smartly: each person owns a piece, but everyone understands the whole.\n\nIn professional software development, teams work this way all the time. A project manager coordinates the work. Developers build individual components. Testers verify everything works. A release manager deploys the final product. Today, you are all of those roles.",
          "example": "// Team project structure:\n// Person A: Robot 1 program (left side of maze)\n// Person B: Robot 2 program (right side of maze)\n// Person C: Robot 3 program (centre + coordination)\n\n// Shared coordination rules:\n// All robots send position updates every 2 seconds\n// If two robots are within 30cm, Robot 3 waits\n// Robots signal 'done' when returning to base\n// Timer tracks overall completion time",
          "activity": "Team of 3: each person codes one robot's navigation and collection program. Robots must communicate to avoid collisions. Your goal: all items collected and all robots back at base in the shortest possible time.",
          "keyWords": [
            "team project",
            "coordinate",
            "collaborate",
            "integration",
            "divide",
            "conquer",
            "test together"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Challenge Introduction and Planning",
              "duration": "15 mins",
              "desc": "Understand the goal and divide the work",
              "steps": [
                "Introduce the 3-robot collection challenge",
                "Define success: all items collected, no collisions, fastest time",
                "Assign roles: Coder A (Robot 1), Coder B (Robot 2), Coordinator (Robot 3 + timing)",
                "Create a shared plan: which robot collects which items?",
                "Document the interface: how will robots communicate?"
              ]
            },
            {
              "num": 2,
              "title": "Develop and Integrate",
              "duration": "20 mins",
              "desc": "Build and combine the components",
              "steps": [
                "Each person codes their robot's program using agreed interface",
                "Meet every 5 minutes to sync progress",
                "Test each robot individually first",
                "Integrate: run all three together",
                "Debug interactions: does anything clash?"
              ]
            },
            {
              "num": 3,
              "title": "Optimise and Present",
              "duration": "20 mins",
              "desc": "Polish, improve, and showcase",
              "steps": [
                "Run the full challenge and record completion time",
                "Identify the slowest bottleneck — can it be improved?",
                "Optimize one thing and re-test",
                "Time the improved version",
                "Present: explain your team approach and what you optimised"
              ]
            }
          ],
          "extension": "Competitive extension: two teams run the SAME challenge. Which team completes it faster? After each run, teams can observe each other's approach and improve. What can you learn from the competing team?",
          "reflection": "What was the hardest part of team programming? What would make collaboration easier if you did this project again? How do real software companies manage large teams working on the same codebase?",
          "objectives": [
            "Apply all Year 4 skills in a complex team project",
            "Divide complex tasks among team members",
            "Integrate individual components into a working system",
            "Optimise performance through iterative testing"
          ],
          "ukCurriculum": [
            "Work collaboratively to design and create programs",
            "Plan, test, and refine team-developed software",
            "Demonstrate understanding of all Year 4 computing concepts"
          ]
        },
        "quiz": [
          {
            "q": "What is the first thing a team should do when starting a large programming project?",
            "options": [
              "Start coding immediately to save time",
              "Plan the approach, divide tasks, and agree on how components will connect",
              "Let one person do all the coding",
              "Test first, then code"
            ],
            "answer": 1
          },
          {
            "q": "What does 'integration testing' mean?",
            "options": [
              "Testing one component in isolation",
              "Testing all the components together to see if they work as a system",
              "Deleting old tests",
              "Testing only the most important parts"
            ],
            "answer": 1
          },
          {
            "q": "What is a 'bottleneck' in a system?",
            "options": [
              "A type of error",
              "The fastest part of the program",
              "The slowest component that limits the overall performance",
              "A debugging tool"
            ],
            "answer": 2
          },
          {
            "q": "Why is it important for team members to communicate during a coding project?",
            "options": [
              "Communication wastes time",
              "To ensure individual components will work together and to catch problems early",
              "Only the project leader needs to communicate",
              "Computers do this automatically"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Year 4 Reflection and Year 5 Preview",
        "xp": 80,
        "content": {
          "explanation": "What a year! You have grown enormously as a programmer. At the start of Year 4, you knew basic sequences and loops. Now you design multi-step algorithms, write if/then/else conditionals, use functions with parameters, work with lists, debug complex programs, and even coordinate multiple robots over a network!\n\nReflection is not just a nice way to end the year — it is a powerful learning technique. Psychologists call it 'retrieval practice': when you recall what you have learned, you strengthen those memories and make them easier to access next time. So this lesson really IS making you a better coder.\n\nYear 5 is going to be exciting. You will learn about algorithms that sort and search large datasets, write reusable classes and objects, work with files, and build complete robotic systems from requirements. The skills you have built this year are the engine for everything that follows.",
          "example": "// Your Year 4 skills:\n// ✓ Pseudocode and algorithm design\n// ✓ If/Then/Else with multiple conditions\n// ✓ Meaningful variable names and calculations\n// ✓ Nested loops and while loops\n// ✓ Functions with parameters (DRY principle)\n// ✓ Debugging: syntax vs logic errors\n// ✓ Systematic testing with edge cases\n// ✓ Lists and iteration\n// ✓ Algorithm efficiency\n// ✓ Multi-sensor integration\n// ✓ Networks and wireless communication",
          "activity": "Write a self-assessment: for each Year 4 skill, rate yourself 1-3 (1=still learning, 2=getting it, 3=confident). Choose your lowest-rated skill and write one sentence about how you plan to improve it in Year 5.",
          "keyWords": [
            "reflection",
            "self-assessment",
            "growth mindset",
            "progress",
            "Year 5 preview",
            "achievement"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Year 4 Skill Reflection",
              "duration": "20 mins",
              "desc": "Look back at everything you achieved",
              "steps": [
                "Review all 12 Year 4 topics as a class",
                "For each: what did you find hardest? What clicked?",
                "Rate yourself on each skill (1-3)",
                "Identify: your strongest skill and one to improve",
                "Celebrate: compare to where you were in September!"
              ]
            },
            {
              "num": 2,
              "title": "Favourite Project and Lesson",
              "duration": "15 mins",
              "desc": "Share your highlights",
              "steps": [
                "What was your favourite lesson and why?",
                "What project are you most proud of?",
                "What was your biggest 'lightbulb moment'?",
                "What surprised you most this year?",
                "Share with a partner, then share with the class"
              ]
            },
            {
              "num": 3,
              "title": "Year 5 Preview and Goal Setting",
              "duration": "10 mins",
              "desc": "Look ahead with excitement",
              "steps": [
                "Preview Y5: sorting algorithms, object-oriented programming, cybersecurity, data analysis",
                "Show an exciting Year 5 program (complex but recognisable from Year 4 skills)",
                "Set one personal goal for Year 5",
                "Write it down and seal it in an envelope to open in September",
                "End with a class celebration!"
              ]
            }
          ],
          "extension": "Research one famous computer scientist who inspires you. Write a paragraph about their work and explain which Year 4 computing concept they used or invented. Present your findings to the class.",
          "reflection": "If you could design ONE app or robot using everything you have learned in Year 4, what would it do? Sketch it out and describe the algorithms, variables, and conditions it would use.",
          "objectives": [
            "Reflect on Year 4 computing growth",
            "Celebrate achievements and acknowledge challenges",
            "Set personal goals for Year 5",
            "Maintain growth mindset for continued learning"
          ],
          "ukCurriculum": [
            "Reflect on progress in computing",
            "Prepare for more advanced concepts in Year 5",
            "Understand how computing skills develop progressively"
          ]
        },
        "quiz": [
          {
            "q": "Which Year 4 skill means 'write code once and reuse it'?",
            "options": [
              "Debugging",
              "Functions (DRY principle)",
              "Nested loops",
              "Testing"
            ],
            "answer": 1
          },
          {
            "q": "What did you learn that an IF/THEN/ELSE statement handles?",
            "options": [
              "Only situations where the condition is true",
              "Both the true case AND the false case of a condition",
              "Only loops",
              "Only variables"
            ],
            "answer": 1
          },
          {
            "q": "'Sensor fusion' means...",
            "options": [
              "Using only one sensor",
              "Combining data from multiple sensors for better decision-making",
              "Breaking sensors apart",
              "A type of debugging"
            ],
            "answer": 1
          },
          {
            "q": "Setting goals for Year 5 is useful because...",
            "options": [
              "Goals are mandatory",
              "Having a clear direction helps you focus your learning and measure your progress",
              "Teachers require it",
              "It fills time"
            ],
            "answer": 1
          }
        ]
      }
    ]
  },
  {
    "id": "y5-cs-advanced",
    "title": "Year 5: Advanced Computing",
    "tagline": "Algorithms, OOP, recursion, sorting, cybersecurity",
    "year": "Year 5",
    "color": "#8B5CF6",
    "icon": "⚡",
    "totalXP": 1295,
    "modules": [
      {
        "title": "Algorithm Analysis and Complexity",
        "xp": 100,
        "content": {
          "explanation": "You have been writing algorithms for two years. Now it is time to analyse them: how efficient are they, and how can you measure that? Computer scientists use Big O notation (pronounced 'big oh') to describe how an algorithm's performance scales as the amount of data grows.\n\nO(1) means the algorithm always takes the same time regardless of data size — very fast! O(n) means it takes time proportional to the data size — a doubled list takes twice as long. O(n²) means it takes time proportional to the square of the size — a doubled list takes four times as long. For large data, this difference is enormous.\n\nUnderstanding complexity helps you choose the right algorithm. For a school register of 30 students, almost any algorithm works. For a streaming service with 200 million users, choosing O(log n) over O(n²) could be the difference between a product that works and one that crashes.",
          "example": "// Comparing algorithm complexity:\n\n// O(1): Always instant — regardless of list size\nfunction getFirstElement(list):\n  return list[0]          // Always 1 step\n\n// O(n): Scales linearly — 10x data = 10x slower  \nfunction linearSearch(list, target):\n  for item in list:\n    if item == target: return True  // Up to n steps\n\n// O(n^2): Quadratic — 10x data = 100x slower!\nfunction bubbleSort(list):\n  for i in range(len(list)):\n    for j in range(len(list)-1):\n      if list[j] > list[j+1]: swap  // n*n steps",
          "activity": "Count the number of comparisons needed to find the number 7 in: [3,9,7,1,5] using linear search. Then count how many comparisons bubble sort needs to sort [5,3,8,1,9]. Can you see why O(n²) is slow for large data?",
          "keyWords": [
            "Big O notation",
            "complexity",
            "O(n)",
            "O(n²)",
            "O(1)",
            "scalability",
            "efficiency",
            "linear",
            "quadratic"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Why Complexity Matters",
              "duration": "20 mins",
              "desc": "Experience algorithm scaling",
              "steps": [
                "Sort 5 cards with bubble sort — count comparisons needed",
                "Sort 10 cards — count comparisons again",
                "Sort 15 cards — notice the increase is quadratic!",
                "Compare: 5 cards=10 comp, 10 cards=45 comp, 15 cards=105 comp",
                "Key insight: O(n²) grows much faster than the data"
              ]
            },
            {
              "num": 2,
              "title": "Identify Complexity Classes",
              "duration": "15 mins",
              "desc": "Classify algorithms by how they scale",
              "steps": [
                "O(1): accessing list[0] — always instant",
                "O(n): linear search — check each item once",
                "O(n²): nested loops — check each pair",
                "O(log n): binary search — halve the problem each time",
                "Match each to a real algorithm example"
              ]
            },
            {
              "num": 3,
              "title": "Choose the Right Algorithm",
              "duration": "10 mins",
              "desc": "Apply complexity thinking",
              "steps": [
                "Scenario: search 100 names for a match",
                "Linear search: up to 100 comparisons",
                "Binary search (sorted list): up to 7 comparisons!",
                "For 1,000,000 names: linear=1M, binary=20 comparisons",
                "Discuss: when does algorithm choice really matter?"
              ]
            }
          ],
          "extension": "Research Merge Sort's O(n log n) complexity. Write pseudocode for merge sort and explain why it is better than bubble sort for large lists. At what data size does the difference become significant?",
          "reflection": "If a poorly-chosen O(n²) algorithm runs a hospital's patient matching system, and the hospital has 500,000 patients, how many comparisons might be needed versus an O(n log n) algorithm? Calculate and discuss the real-world impact.",
          "objectives": [
            "Understand algorithm complexity and Big O notation",
            "Compare O(1), O(n), and O(n²) algorithms",
            "Choose appropriate algorithms based on data size",
            "Apply complexity thinking to real-world scenarios"
          ],
          "ukCurriculum": [
            "Understand that different algorithms have different efficiency characteristics",
            "Apply computational thinking to algorithm selection",
            "Prepare for secondary school computer science"
          ]
        },
        "quiz": [
          {
            "q": "What does O(n²) mean for an algorithm?",
            "options": [
              "It always runs in the same time",
              "It takes time proportional to the square of the data size — doubling data quadruples the time",
              "It takes twice as long when data doubles",
              "It runs in logarithmic time"
            ],
            "answer": 1
          },
          {
            "q": "Binary search has O(log n) complexity. For 1,024 items, how many steps does binary search need at most?",
            "options": [
              "1,024",
              "512",
              "10",
              "1"
            ],
            "answer": 2
          },
          {
            "q": "When does algorithm complexity matter MOST?",
            "options": [
              "When there is only a small amount of data",
              "When the data size is very large — millions of items",
              "For simple programs",
              "When using loops"
            ],
            "answer": 1
          },
          {
            "q": "What is the complexity of accessing list[0] regardless of list size?",
            "options": [
              "O(n)",
              "O(n²)",
              "O(1)",
              "O(log n)"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Object-Oriented Programming",
        "xp": 100,
        "content": {
          "explanation": "Object-Oriented Programming (OOP) is a way of organising code around 'objects' — models of real things. A Robot object might have properties (name, batteryLevel, speed) and behaviours (move, stop, charge). Instead of writing separate variables and functions for everything, you bundle them together into a class.\n\nA class is like a blueprint. You define it once and create many objects from it. Every robot built from the Robot class has the same properties and behaviours, but different values: Robot1 has battery=100, Robot2 has battery=75. This makes code much more organised, reusable, and easy to expand.\n\nOOP uses four key principles: Encapsulation (bundle data and methods together), Inheritance (a SpecialRobot class can inherit from Robot and add extra features), Polymorphism (different objects respond differently to the same method), and Abstraction (hide internal complexity).",
          "example": "# Object-Oriented Robot in Python:\nclass Robot:\n    def __init__(self, name, battery=100):\n        self.name = name\n        self.battery = battery\n        self.steps = 0\n    \n    def move(self, distance):\n        self.battery -= distance * 0.5\n        self.steps += distance\n        print(f'{self.name} moved {distance}cm')\n    \n    def status(self):\n        print(f'Battery: {self.battery}%, Steps: {self.steps}')\n\n# Create robot objects:\nrobot1 = Robot('Sparky')\nrobot2 = Robot('Bolt', battery=50)\nrobot1.move(20)\nrobot2.status()",
          "activity": "Create a Robot class in Python with properties: name, batteryLevel, stepsCount. Add methods: move(distance), charge(), and getStatus(). Create two robot objects with different names and simulate a short journey for each.",
          "keyWords": [
            "class",
            "object",
            "method",
            "property",
            "OOP",
            "encapsulation",
            "inheritance",
            "instance"
          ],
          "activities": [
            {
              "num": 1,
              "title": "What is OOP?",
              "duration": "15 mins",
              "desc": "Understand objects and classes through real examples",
              "steps": [
                "Analogy: a cookie cutter (class) creates many cookies (objects)",
                "Each cookie (object) has the same shape but different decorations (property values)",
                "Robot class: blueprint with name, battery, speed",
                "Robot objects: specific robots created from the blueprint",
                "Why OOP: organised, reusable, easy to extend"
              ]
            },
            {
              "num": 2,
              "title": "Write Your First Class",
              "duration": "20 mins",
              "desc": "Create a Robot class in Python",
              "steps": [
                "Write the Robot class with __init__ method",
                "Add properties: name, batteryLevel",
                "Add move() method: decreases battery, increases steps",
                "Create two robot objects with different names",
                "Call move() on each — watch their properties change independently"
              ]
            },
            {
              "num": 3,
              "title": "Extend with Inheritance",
              "duration": "10 mins",
              "desc": "Build on existing classes",
              "steps": [
                "Create FlyingRobot class that inherits from Robot",
                "Add: altitude property, fly() method",
                "FlyingRobot automatically has all Robot features PLUS flying!",
                "Discuss: inheritance saves rewriting code",
                "Test: FlyingRobot can move AND fly"
              ]
            }
          ],
          "extension": "Create a full OOP simulation: a Classroom class that contains a list of Student objects. Each Student has name, score, grade. Add methods to the Classroom to: add a student, find the highest scorer, calculate class average.",
          "reflection": "Research how OOP is used in a real game engine like Unity or Unreal Engine. What classes exist? How do objects like Player, Enemy, and Bullet relate to each other through inheritance?",
          "objectives": [
            "Understand classes and objects in OOP",
            "Create classes with properties and methods",
            "Use objects as instances of a class",
            "Understand and apply basic inheritance"
          ],
          "ukCurriculum": [
            "Understand object-oriented programming concepts",
            "Apply OOP to organise complex programs",
            "Prepare for secondary school Python programming"
          ]
        },
        "quiz": [
          {
            "q": "What is a class in OOP?",
            "options": [
              "A school lesson",
              "A blueprint or template used to create objects",
              "A type of loop",
              "A variable that holds many values"
            ],
            "answer": 1
          },
          {
            "q": "What is an object in OOP?",
            "options": [
              "A piece of hardware",
              "A specific instance created from a class blueprint, with its own property values",
              "A type of method",
              "A conditional statement"
            ],
            "answer": 1
          },
          {
            "q": "What is 'inheritance' in OOP?",
            "options": [
              "Receiving money from a relative",
              "A subclass automatically receiving all properties and methods from its parent class",
              "Copying and pasting code",
              "A type of variable"
            ],
            "answer": 1
          },
          {
            "q": "Why is OOP useful for large programs?",
            "options": [
              "It makes programs shorter",
              "It organises code into logical, reusable units that are easier to understand and extend",
              "It makes programs faster",
              "OOP is not useful for large programs"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Arrays and Advanced Data Structures",
        "xp": 100,
        "content": {
          "explanation": "You already know lists. Now you will explore more sophisticated ways to organise data. A 2D array (list of lists) is like a grid or table — perfect for representing a game board, a spreadsheet, or a robot's map of the environment.\n\nA dictionary (also called a hash map) stores key-value pairs: like a real dictionary where you look up a word (key) to get its definition (value). robotSensors = {'distance': 45, 'light': 78, 'battery': 92} lets you access any sensor reading by name.\n\nChoosing the right data structure for your problem is just as important as choosing the right algorithm. A list is perfect for ordered sequences; a dictionary is perfect for labelled data; a 2D array is perfect for grids. Using the wrong structure makes your code unnecessarily complex.",
          "example": "# 2D array: robot's map of environment\ngrid = [\n    [0, 0, 1, 0, 0],\n    [0, 1, 1, 0, 0],\n    [0, 0, 0, 0, 1],\n    [1, 0, 0, 0, 0],\n]  # 0=free space, 1=obstacle\n\n# Access cell at row 2, column 3:\ncell = grid[2][3]  # = 0 (free)\n\n# Dictionary: sensor readings by name\nsensors = {'distance': 45, 'light': 78, 'battery': 92}\ndist = sensors['distance']  # = 45",
          "activity": "Create a 4×4 grid (2D list) representing a robot's map where 0=empty and 1=obstacle. Mark 5 obstacles. Then write code to print the grid row by row and count how many obstacles there are.",
          "keyWords": [
            "2D array",
            "dictionary",
            "data structure",
            "key",
            "value",
            "grid",
            "hash map",
            "nested list"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Real-World Data Structures",
              "duration": "15 mins",
              "desc": "Choose the right structure for the data",
              "steps": [
                "List: ordered sequence (sensor history, steps taken)",
                "Dictionary: labelled data (sensor readings by name)",
                "2D array: grid data (map, game board, image pixels)",
                "Match: 'robot grid map' → 2D array; 'sensor names and values' → dictionary",
                "Ask: what data structure would a self-driving car use for its environment map?"
              ]
            },
            {
              "num": 2,
              "title": "Build a 2D Map",
              "duration": "20 mins",
              "desc": "Work with 2D arrays",
              "steps": [
                "Create 4×4 grid: all zeros initially",
                "Place obstacles: grid[1][2] = 1",
                "Print the grid in a readable format",
                "Count obstacles using nested loops",
                "Discuss: a robot could use this as its world model"
              ]
            },
            {
              "num": 3,
              "title": "Sensor Dictionary",
              "duration": "10 mins",
              "desc": "Use dictionaries for labelled data",
              "steps": [
                "Create sensors = {'distance':45, 'light':78, 'battery':92}",
                "Access: sensors['distance'] = 45",
                "Update: sensors['battery'] = 91 (after movement)",
                "Add new sensor: sensors['temperature'] = 22",
                "Discuss: why is a dictionary better than a list for named data?"
              ]
            }
          ],
          "extension": "Implement a simple pathfinding algorithm using a 2D grid: start at (0,0), goal at (3,3), obstacles in the grid. Use a while loop to explore possible paths and find a route to the goal. This is the foundation of real robot navigation!",
          "reflection": "Game developers use 2D arrays for tile maps, enemy positions, and collision detection. Research how Minecraft represents its world — what data structure stores the block grid? How large can this grid get?",
          "objectives": [
            "Understand and use 2D arrays for grid data",
            "Create and use dictionaries for key-value data",
            "Choose appropriate data structures for different problems",
            "Apply data structures to robot navigation concepts"
          ],
          "ukCurriculum": [
            "Use appropriate data structures to solve problems",
            "Understand how data can be organised in multiple dimensions",
            "Apply data structures to real-world computing problems"
          ]
        },
        "quiz": [
          {
            "q": "What is a 2D array most suitable for representing?",
            "options": [
              "A simple list of scores",
              "A grid or table of values such as a robot's map",
              "A single sensor reading",
              "A sequence of robot instructions"
            ],
            "answer": 1
          },
          {
            "q": "In Python, how do you access row 2, column 3 of a 2D array called 'grid'?",
            "options": [
              "grid[3][2]",
              "grid[2,3]",
              "grid[2][3]",
              "grid.get(2,3)"
            ],
            "answer": 2
          },
          {
            "q": "What is a dictionary (key-value store) best used for?",
            "options": [
              "Ordered sequences where position matters",
              "Named/labelled data where you look up values by meaningful keys",
              "Storing a robot's path",
              "Sorting data"
            ],
            "answer": 1
          },
          {
            "q": "sensors['battery'] = 45 in a dictionary does what?",
            "options": [
              "Creates a new dictionary",
              "Updates or adds an entry with key 'battery' and value 45",
              "Deletes the 'battery' entry",
              "Prints the battery value"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Recursive Algorithms",
        "xp": 100,
        "content": {
          "explanation": "Recursion is when a function calls itself! It sounds strange at first, but it is a remarkably elegant way to solve certain problems. A recursive function solves a large problem by solving a smaller version of the same problem, then using that result.\n\nImagine calculating a countdown: countdown(5) says '5!' then calls countdown(4), which says '4!' then calls countdown(3)... all the way down to countdown(0) which says 'Done!' without calling itself again. This stopping condition is called the base case — it is crucial! Without a base case, a recursive function calls itself forever (infinite recursion), crashing the program.\n\nRecursion is used in many classic algorithms: binary search, merge sort, and traversing tree structures. Once you understand it, you will see it everywhere in computer science.",
          "example": "# Recursive countdown:\ndef countdown(n):\n    if n == 0:            # Base case: STOP\n        print('Done!')\n    else:                 # Recursive case\n        print(n)\n        countdown(n - 1)  # Calls itself with smaller n!\n\ncountdown(5)  # Prints: 5, 4, 3, 2, 1, Done!\n\n# Recursive factorial:\ndef factorial(n):\n    if n == 1: return 1     # Base case\n    return n * factorial(n-1)  # 5! = 5 × 4!\n\nprint(factorial(5))  # = 120",
          "activity": "Write a recursive function that calculates the sum of numbers from 1 to n. Test it with n=5 (should give 15), n=10 (should give 55). Then trace through factorial(4) by hand — write every function call and its return value.",
          "keyWords": [
            "recursion",
            "base case",
            "recursive case",
            "function call",
            "self-reference",
            "stack",
            "factorial"
          ],
          "activities": [
            {
              "num": 1,
              "title": "What is Recursion?",
              "duration": "15 mins",
              "desc": "Understand the concept through physical examples",
              "steps": [
                "Demonstrate: stand between two mirrors — infinite reflections!",
                "Recursion is similar: function that calls itself",
                "Key: it MUST get smaller each time",
                "Key: it MUST have a base case to stop",
                "Trace countdown(3) together: 3→2→1→Done!"
              ]
            },
            {
              "num": 2,
              "title": "Write Recursive Functions",
              "duration": "20 mins",
              "desc": "Code countdown and factorial",
              "steps": [
                "Code countdown(n) together: if n=0 print Done else print n and call countdown(n-1)",
                "Test with n=5 — watch the output",
                "Code factorial(n): if n=1 return 1 else return n * factorial(n-1)",
                "Test factorial(5) = 120",
                "Discuss: what happens if you forget the base case?"
              ]
            },
            {
              "num": 3,
              "title": "Recursion vs Iteration",
              "duration": "10 mins",
              "desc": "Compare recursive and iterative approaches",
              "steps": [
                "Write factorial() using a loop (iterative)",
                "Write factorial() using recursion",
                "Run both — same result!",
                "Which is easier to understand? (often recursion for this type)",
                "Which is more efficient? (iteration uses less memory)",
                "Key: recursion is elegant, iteration is often faster"
              ]
            }
          ],
          "extension": "Implement recursive binary search: given a sorted list and target, return the index. At each step, check the middle element — if too high, search the left half recursively; if too low, search the right half. This is O(log n)!",
          "reflection": "Fibonacci sequence is recursive: fib(n) = fib(n-1) + fib(n-2). Write a recursive Fibonacci function. Then try calculating fib(40) — it will be very slow! Research why, and find the memoization technique that makes it fast.",
          "objectives": [
            "Understand recursive algorithms with base cases",
            "Write recursive functions in Python",
            "Trace recursive execution step by step",
            "Compare recursive and iterative approaches"
          ],
          "ukCurriculum": [
            "Apply advanced programming concepts including recursion",
            "Understand how functions can call themselves",
            "Develop problem-solving through mathematical thinking"
          ]
        },
        "quiz": [
          {
            "q": "What is the 'base case' in a recursive function?",
            "options": [
              "The first function call",
              "The condition that STOPS the recursion, preventing infinite loops",
              "The largest input the function handles",
              "The return value"
            ],
            "answer": 1
          },
          {
            "q": "What happens if a recursive function has NO base case?",
            "options": [
              "It runs faster",
              "It calls itself indefinitely, causing a stack overflow crash",
              "It returns None",
              "It works normally"
            ],
            "answer": 1
          },
          {
            "q": "factorial(4) = 4 × factorial(3). What does factorial(3) equal?",
            "options": [
              "3 × factorial(2)",
              "3",
              "6",
              "3 × 3"
            ],
            "answer": 0
          },
          {
            "q": "When is recursion particularly elegant compared to iteration?",
            "options": [
              "Never — iteration is always better",
              "When the problem naturally breaks into smaller versions of itself (like trees, sorting, searching)",
              "When you want to use more memory",
              "For simple counting tasks"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Advanced Conditionals and Boolean Logic",
        "xp": 100,
        "content": {
          "explanation": "You already know IF/THEN/ELSE. Now you will master the full power of conditional logic using AND, OR, and NOT. Boolean logic is the mathematics of TRUE and FALSE — the foundation of every circuit and every decision a computer makes.\n\nAND: true only when BOTH sides are true. OR: true when at least one side is true. NOT: flips true to false. You can combine these operators to create very precise conditions that handle complex real-world situations.\n\nDe Morgan's Laws help simplify complex conditions: NOT (A AND B) equals (NOT A) OR (NOT B). Understanding how to build and simplify Boolean expressions makes you a much more powerful programmer — you can express exactly the right conditions in fewer, clearer lines.",
          "example": "# Complex Boolean conditions:\nbatteryLow = battery < 20\nobstacleNear = distance < 30\nmissionDone = collected >= target\n\n# Robot decision — all cases handled:\nif missionDone or (batteryLow and not obstacleNear):\n    returnHome()\nelif obstacleNear and not batteryLow:\n    avoidObstacle()\nelse:\n    continueNavigating()\n\n# De Morgan: NOT (A AND B) = (NOT A) OR (NOT B)\nprint(not (True and False))       # True\nprint((not True) or (not False))  # True -- same!",
          "activity": "Build a truth table for (A AND B) OR C for all 8 input combinations. Then write a Python condition that returns True when: battery < 20 OR (both sensors detect obstacles). Test it with 6 different variable combinations.",
          "keyWords": [
            "AND",
            "OR",
            "NOT",
            "boolean",
            "truth table",
            "compound condition",
            "De Morgan",
            "simplify"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Truth Tables for AND, OR, NOT",
              "duration": "15 mins",
              "desc": "Master the three Boolean operators",
              "steps": [
                "Draw AND truth table: T+T=T, T+F=F, F+T=F, F+F=F",
                "Draw OR truth table: T+T=T, T+F=T, F+T=T, F+F=F",
                "NOT: flips the value",
                "Complete truth table for (A AND B) OR C with all 8 rows",
                "Verify each row by evaluating step by step"
              ]
            },
            {
              "num": 2,
              "title": "Compound Conditions in Robot Programs",
              "duration": "20 mins",
              "desc": "Apply Boolean logic to robotics",
              "steps": [
                "Scenario: robot stops if obstacle OR battery critical OR mission done",
                "Write Python IF combining all three with AND/OR/NOT",
                "Test each condition independently first",
                "Then test all 8 combinations",
                "Verify: correct behavior in every scenario?"
              ]
            },
            {
              "num": 3,
              "title": "Simplify with De Morgan",
              "duration": "10 mins",
              "desc": "Make conditions readable and elegant",
              "steps": [
                "Messy condition: IF NOT (distanceClear AND batteryOK) THEN stop",
                "Apply De Morgan: NOT(A AND B) = (NOT A) OR (NOT B)",
                "Rewrite: IF (NOT distanceClear) OR (NOT batteryOK) THEN stop",
                "Verify: same logical result, clearer to read",
                "When is simplified clearer? When is explicit clearer?"
              ]
            }
          ],
          "extension": "Build a 4-condition robot decision system: emergency_stop (distance<5), avoid_obstacle (distance<25), return_home (battery<15%), normal_navigation (all clear). Implement with correct AND/OR/NOT priority order.",
          "reflection": "Research how Boolean logic is physically implemented in computer chips as logic gates (AND gate, OR gate, NOT gate). How do these tiny transistor circuits relate to the Python IF statements you wrote today?",
          "objectives": [
            "Master AND, OR, NOT Boolean operators",
            "Build compound conditional statements",
            "Create truth tables for complex expressions",
            "Apply Boolean logic to robot decision-making"
          ],
          "ukCurriculum": [
            "Apply complex conditional logic in programs",
            "Understand Boolean algebra foundations",
            "Design programs with multiple interacting conditions"
          ]
        },
        "quiz": [
          {
            "q": "When is (A AND B) TRUE?",
            "options": [
              "When at least one is true",
              "Only when BOTH A and B are true",
              "When neither is true",
              "Always"
            ],
            "answer": 1
          },
          {
            "q": "NOT (A AND B) is equivalent to (De Morgan):",
            "options": [
              "NOT A AND NOT B",
              "(NOT A) OR (NOT B)",
              "A OR B",
              "NOT A OR B"
            ],
            "answer": 1
          },
          {
            "q": "When is (A OR B) FALSE?",
            "options": [
              "When both A and B are false",
              "When A is true",
              "When B is false",
              "Never"
            ],
            "answer": 0
          },
          {
            "q": "In Python, 'if A and B or C' evaluates:",
            "options": [
              "C first",
              "A and B first (AND > OR precedence), then OR with C",
              "All at once",
              "B and C first"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Sorting Algorithms",
        "xp": 100,
        "content": {
          "explanation": "Sorting is one of the most fundamental problems in computing. Every search engine, database, and operating system uses sorting constantly. Understanding how sorting algorithms work — and why some are faster than others — is core computer science knowledge.\n\nBubble sort is the simplest: repeatedly compare adjacent pairs and swap if out of order. It's easy to understand but O(n²) — slow for large data. Selection sort finds the minimum each pass. Insertion sort builds the sorted list one item at a time. Merge sort uses a divide-and-conquer strategy and achieves O(n log n) — much faster for large data.\n\nThe best sort for a situation depends on: how much data you have, whether it is mostly sorted already, and how much memory you can use. Understanding trade-offs is a key skill in algorithm design.",
          "example": "# Bubble sort step by step:\ndef bubbleSort(arr):\n    n = len(arr)\n    for i in range(n):       # n passes\n        for j in range(n-i-1):  # Compare pairs\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]  # Swap!\n    return arr\n\n# Before: [64, 34, 25, 12, 22]\n# After:  [12, 22, 25, 34, 64]\n\n# Merge sort (recursive, O(n log n)):\ndef mergeSort(arr):\n    if len(arr) <= 1: return arr  # Base case\n    mid = len(arr) // 2\n    left = mergeSort(arr[:mid])   # Sort left half\n    right = mergeSort(arr[mid:])  # Sort right half\n    return merge(left, right)     # Merge sorted halves",
          "activity": "Sort [5, 2, 8, 1, 9, 3] using bubble sort by hand, showing each pass. Count total swaps. Then sort the same list using selection sort (find minimum, move to front each pass). Which needed fewer swaps?",
          "keyWords": [
            "bubble sort",
            "merge sort",
            "selection sort",
            "comparison",
            "swap",
            "divide and conquer",
            "O(n log n)"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Cards Sorting Race",
              "duration": "20 mins",
              "desc": "Experience different sort algorithms physically",
              "steps": [
                "8 students each hold a number card",
                "Bubble sort: repeatedly walk along the line swapping adjacent out-of-order cards",
                "Count swaps needed",
                "Try insertion sort: pick up each card and insert in the right position",
                "Count steps — which was faster for this size?"
              ]
            },
            {
              "num": 2,
              "title": "Code Bubble Sort",
              "duration": "15 mins",
              "desc": "Implement and visualise bubble sort",
              "steps": [
                "Code bubble sort in Python",
                "Add print statements to show the array after each pass",
                "Run on [64,34,25,12,22] — watch it sort",
                "Count: how many comparisons for 5 items? For 10?",
                "Discuss: why O(n²) is slow for large lists"
              ]
            },
            {
              "num": 3,
              "title": "Merge Sort Concept",
              "duration": "10 mins",
              "desc": "Understand divide-and-conquer sorting",
              "steps": [
                "Split [38,27,43,3,9,82,10] into halves",
                "Sort each half (recursively)",
                "Merge sorted halves: compare front of each, take smaller",
                "Result: sorted in O(n log n) steps!",
                "For 1M items: bubble sort=500B steps, merge sort=20M steps"
              ]
            }
          ],
          "extension": "Implement merge sort in Python. Run both bubble sort and merge sort on a list of 1000 randomly generated numbers. Use Python's time module to measure how long each takes. Plot the results.",
          "reflection": "Research Tim Sort, the algorithm used in Python's built-in sorted() function. Why did Python choose it over pure merge sort? What real-world sorting characteristics does it take advantage of?",
          "objectives": [
            "Implement and trace bubble sort",
            "Understand merge sort's divide-and-conquer approach",
            "Compare sorting algorithms by efficiency",
            "Apply Big O analysis to sorting"
          ],
          "ukCurriculum": [
            "Understand classic algorithms including sorting",
            "Apply computational thinking to algorithm design",
            "Compare algorithmic efficiency in practical terms"
          ]
        },
        "quiz": [
          {
            "q": "What does bubble sort do in each pass?",
            "options": [
              "Splits the list in half",
              "Finds the minimum element",
              "Compares adjacent pairs and swaps them if in the wrong order",
              "Removes duplicates"
            ],
            "answer": 2
          },
          {
            "q": "Why is merge sort O(n log n) better than bubble sort O(n²) for large data?",
            "options": [
              "It is not better",
              "For large n, n log n grows much more slowly than n², making merge sort dramatically faster",
              "Merge sort uses less code",
              "O(n²) is actually faster"
            ],
            "answer": 1
          },
          {
            "q": "'Divide and conquer' means...",
            "options": [
              "Attacking problems aggressively",
              "Splitting a problem in half, solving each half, then combining the solutions",
              "Using loops instead of recursion",
              "A type of conditional"
            ],
            "answer": 1
          },
          {
            "q": "For which situation is bubble sort still acceptable?",
            "options": [
              "A list of 10 million items",
              "When the list is already nearly sorted or is very short (10-20 items)",
              "Always — bubble sort is the best",
              "Never — merge sort is always better"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Searching Algorithms",
        "xp": 100,
        "content": {
          "explanation": "Searching — finding a specific item in a collection — is something computers do billions of times per second. Every time you Google something, search your email, or look up a friend's phone number, a search algorithm runs.\n\nLinear search checks every item from the start until it finds the target: O(n). For large unsorted data, this is the only option. Binary search works on sorted data by repeatedly halving the search space: check the middle — if target is less, search left half; if greater, search right half. This is O(log n) — dramatically faster.\n\nFor a sorted list of 1,000,000 items: linear search needs up to 1,000,000 comparisons. Binary search needs at most 20! Understanding when each applies is crucial — binary search requires the data to be sorted first, which has its own cost.",
          "example": "# Linear search: O(n)\ndef linearSearch(lst, target):\n    for i, item in enumerate(lst):\n        if item == target:\n            return i  # Found at index i\n    return -1  # Not found\n\n# Binary search: O(log n) — list MUST be sorted!\ndef binarySearch(lst, target):\n    low, high = 0, len(lst) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if lst[mid] == target:\n            return mid      # Found!\n        elif lst[mid] < target:\n            low = mid + 1   # Search right half\n        else:\n            high = mid - 1  # Search left half\n    return -1  # Not found",
          "activity": "Implement binary search. Test it on a sorted list of 16 numbers. Count how many comparisons it takes to find each number. What is the maximum comparisons for a list of 16? (Answer: 4, since log₂16=4)",
          "keyWords": [
            "linear search",
            "binary search",
            "sorted",
            "halving",
            "O(log n)",
            "comparison",
            "index",
            "search space"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Guess the Number Game",
              "duration": "15 mins",
              "desc": "Experience binary search instinctively",
              "steps": [
                "Teacher thinks of number 1-100",
                "Students guess — teacher says 'higher' or 'lower'",
                "Observe: good students halve the range each guess",
                "Worst case: 7 guesses for 1-100 (log₂100 ≈ 7)",
                "Random guessing could take 100 guesses — binary search is SO much better!"
              ]
            },
            {
              "num": 2,
              "title": "Implement Both Searches",
              "duration": "20 mins",
              "desc": "Code linear and binary search in Python",
              "steps": [
                "Code linearSearch: iterate and compare",
                "Code binarySearch: low/high/mid, adjust range",
                "Test both on same sorted list of 20 numbers",
                "Add comparison counter to each — compare counts",
                "For which inputs does linear search perform better?"
              ]
            },
            {
              "num": 3,
              "title": "When to Use Each",
              "duration": "10 mins",
              "desc": "Apply searching knowledge",
              "steps": [
                "Unsorted data: MUST use linear search",
                "Sorted data: binary search is almost always better",
                "Sorting cost: if you search once, sort+binary may not be worth it",
                "If you search many times: sort first, then binary search every time",
                "Real example: phone contacts are sorted so binary search can work fast"
              ]
            }
          ],
          "extension": "Create a phonebook simulation: a dictionary with 100 randomly generated names. Compare how many operations it takes to find a name using linear search vs looking up directly in the dictionary. Dictionaries use O(1) lookup — even faster than binary search!",
          "reflection": "Google processes approximately 8.5 billion searches per day. If each search uses linear search over 50 billion web pages, how long would it take? Research how Google's PageRank and indexing systems make search O(1) in practice.",
          "objectives": [
            "Implement and trace linear search",
            "Implement and trace binary search",
            "Understand when each search is appropriate",
            "Apply O notation to search algorithm analysis"
          ],
          "ukCurriculum": [
            "Understand searching algorithms and their applications",
            "Compare algorithmic approaches for efficiency",
            "Apply binary search as a fundamental CS algorithm"
          ]
        },
        "quiz": [
          {
            "q": "What is the requirement for binary search that linear search does NOT have?",
            "options": [
              "Binary search needs more memory",
              "Binary search only works on sorted data",
              "Binary search requires Python",
              "Binary search cannot handle duplicates"
            ],
            "answer": 1
          },
          {
            "q": "For a sorted list of 1024 items, how many comparisons does binary search need at most?",
            "options": [
              "1024",
              "512",
              "10",
              "1024"
            ],
            "answer": 2
          },
          {
            "q": "Linear search is the only option when...",
            "options": [
              "You have a sorted list",
              "The data is unsorted and you need to find a specific item",
              "You have a dictionary",
              "The list has fewer than 10 items"
            ],
            "answer": 1
          },
          {
            "q": "Why is O(log n) so much faster than O(n) for large data?",
            "options": [
              "log n grows much more slowly than n — for 1 million items, log n is only about 20",
              "They are the same speed",
              "O(log n) uses less memory",
              "O(n) is actually faster"
            ],
            "answer": 0
          }
        ]
      },
      {
        "title": "File Input and Output",
        "xp": 95,
        "content": {
          "explanation": "So far your programs lose all their data when they stop running. Files let you save data permanently. Programs can write to files (save data) and read from files (load data). This is how every app you use stores its information: your contacts, game saves, and preferences are all in files.\n\nIn Python, you open a file, read or write data, then close it. Modern Python uses the 'with' statement which automatically closes the file even if an error occurs.\n\nFor robot programming, file I/O is essential: saving sensor logs for analysis, loading maps, recording journeys, and storing configuration settings. A robot that can learn from its experiences and save that knowledge becomes much more capable over time.",
          "example": "# Writing to a file:\nwith open('robot_log.txt', 'w') as f:\n    f.write('Robot started\\n')\n    f.write('Moved forward 30cm\\n')\n    f.write('Battery: 85%\\n')\n\n# Reading from a file:\nwith open('robot_log.txt', 'r') as f:\n    log = f.readlines()\n    for line in log:\n        print(line.strip())\n\n# CSV data (comma-separated):\nimport csv\nwith open('sensor_data.csv', 'w') as f:\n    writer = csv.writer(f)\n    writer.writerow(['time', 'distance', 'battery'])\n    writer.writerow([0.5, 45, 98])",
          "activity": "Write a Python program that: (1) creates a robot journey log file, (2) writes 10 simulated sensor readings to it, (3) reads the file back and prints the maximum and minimum distance values.",
          "keyWords": [
            "file",
            "read",
            "write",
            "open",
            "close",
            "with",
            "CSV",
            "persistent",
            "data",
            "log"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Why Files Matter",
              "duration": "10 mins",
              "desc": "Understand persistent storage",
              "steps": [
                "Without files: all data lost when program stops",
                "With files: data survives, can be shared, can be loaded by other programs",
                "Real examples: game save files, spreadsheets, robot sensor logs",
                "File types: txt (human-readable), csv (data tables), json (structured data)",
                "Discuss: what data from your robot programs should you save?"
              ]
            },
            {
              "num": 2,
              "title": "Read and Write Files in Python",
              "duration": "20 mins",
              "desc": "Master the with open pattern",
              "steps": [
                "Write: with open('log.txt','w') as f: f.write('Started\\n')",
                "Read: with open('log.txt','r') as f: content = f.read()",
                "Why 'with': automatically closes file, even if error occurs",
                "Practice: write 5 sensor readings to a file",
                "Read back and print each line"
              ]
            },
            {
              "num": 3,
              "title": "Robot Data Logger",
              "duration": "15 mins",
              "desc": "Build a real logging system",
              "steps": [
                "Create robot_log.csv with columns: time, step, distance, battery",
                "Simulate 20 robot movements, writing each reading to file",
                "Read the CSV back and find: min distance (closest obstacle), max battery, total steps",
                "Visualise: print a simple text chart of distance over time",
                "Discuss: this is exactly how real robot logging works!"
              ]
            }
          ],
          "extension": "Build a robot configuration system: create a settings.json file with robot properties (name, speed, turnRadius, sensorRange). Write a Python program that reads this file at startup and uses those settings. Change the settings file and re-run — the robot behaves differently without changing any code!",
          "reflection": "Research how computer games save their progress. What file format do you think they use? What data needs to be saved? What would happen if the save file gets corrupted?",
          "objectives": [
            "Read and write text files in Python",
            "Use the 'with' statement for safe file handling",
            "Write and read CSV data files",
            "Apply file I/O to robot data logging"
          ],
          "ukCurriculum": [
            "Understand persistent data storage",
            "Apply file input/output to real-world programming tasks",
            "Handle data in multiple formats"
          ]
        },
        "quiz": [
          {
            "q": "Why is file I/O important in programming?",
            "options": [
              "Files make programs faster",
              "Files allow data to persist beyond the program's lifetime — it can be saved, loaded, and shared",
              "Files are required by Python",
              "Files replace variables"
            ],
            "answer": 1
          },
          {
            "q": "What does 'w' mean in open('file.txt', 'w')?",
            "options": [
              "Wait",
              "Wide format",
              "Write mode — creates or overwrites the file for writing",
              "Windows only"
            ],
            "answer": 2
          },
          {
            "q": "Why use 'with open(...)' instead of just 'open(...)'?",
            "options": [
              "With is faster",
              "'With' automatically closes the file when done, preventing data loss and resource leaks",
              "They are identical",
              "With is required for reading only"
            ],
            "answer": 1
          },
          {
            "q": "What format is best for storing tabular data (like sensor readings with multiple columns)?",
            "options": [
              "txt",
              "CSV (comma-separated values)",
              "Both are equally good",
              "Neither"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Cybersecurity and Encryption",
        "xp": 100,
        "content": {
          "explanation": "Every time you use the internet, your data travels through networks where others could potentially read it. Cybersecurity is the practice of protecting digital systems, data, and networks from attack. Encryption is the most important tool: it scrambles data so that only the intended recipient can read it.\n\nCaesar cipher is the simplest encryption: shift every letter by a fixed number. 'HELLO' with shift 3 becomes 'KHOOR'. It is easy to break, but illustrates the principle: without knowing the key (shift number), the message is meaningless.\n\nModern encryption (like HTTPS on websites) uses mathematical algorithms so complex that even the most powerful computers would take billions of years to break them by brute force. The padlock icon in your browser means your data is encrypted in transit.",
          "example": "# Caesar cipher: shift each letter by 'shift'\ndef encrypt(message, shift):\n    result = ''\n    for char in message:\n        if char.isalpha():\n            # Shift letter within A-Z or a-z\n            base = ord('A') if char.isupper() else ord('a')\n            shifted = (ord(char) - base + shift) % 26 + base\n            result += chr(shifted)\n        else:\n            result += char  # Keep spaces and punctuation\n    return result\n\ndef decrypt(message, shift):\n    return encrypt(message, 26 - shift)  # Reverse shift!\n\nprint(encrypt('Hello World', 3))  # 'Khoor Zruog'\nprint(decrypt('Khoor Zruog', 3))  # 'Hello World'",
          "activity": "Implement a Caesar cipher. Encrypt the message 'THE ROBOT IS READY' with shift 7. Write the decrypt function and verify you can recover the original message. Then try to crack 'OLSSV DVYSK' without knowing the shift — use brute force (try all 26 shifts).",
          "keyWords": [
            "encryption",
            "decryption",
            "cipher",
            "key",
            "cybersecurity",
            "HTTPS",
            "brute force",
            "shift"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Why Security Matters",
              "duration": "15 mins",
              "desc": "Understand real cybersecurity threats",
              "steps": [
                "Statistics: millions of cyberattacks happen every day",
                "Show: HTTP vs HTTPS — what is the difference?",
                "Without encryption: like sending a postcard (anyone can read it)",
                "With encryption: like sending a locked box (only recipient has key)",
                "Real example: your school's login is encrypted with HTTPS"
              ]
            },
            {
              "num": 2,
              "title": "Implement Caesar Cipher",
              "duration": "20 mins",
              "desc": "Build encrypt and decrypt functions",
              "steps": [
                "Write encrypt(message, shift) function",
                "Test: encrypt('HELLO', 3) = 'KHOOR'",
                "Write decrypt as encrypt with reverse shift",
                "Test: decrypt('KHOOR', 3) = 'HELLO'",
                "Send an encrypted message to a partner — can they decode it?"
              ]
            },
            {
              "num": 3,
              "title": "Brute Force Attack",
              "duration": "10 mins",
              "desc": "Experience how simple ciphers are broken",
              "steps": [
                "Given: 'OLSSV DVYSK' (unknown shift)",
                "Try shift 1: decrypt → does it make sense? No.",
                "Try shift 2, 3... keep going",
                "Shift 7: 'HELLO WORLD' — found it!",
                "Discuss: Caesar cipher has only 26 possible keys — easy to brute force. Modern encryption has 2^256 possible keys!"
              ]
            }
          ],
          "extension": "Research the Vigenère cipher: a more complex cipher that uses a keyword instead of a single shift. Implement it in Python. Then research why this is still vulnerable and what makes modern AES encryption unbreakable in practice.",
          "reflection": "In 2021, the Colonial Pipeline ransomware attack shut down fuel supplies for the US East Coast. Research this attack: what type of cyberattack was it? How did the attackers get in? What cybersecurity lessons did it teach?",
          "objectives": [
            "Understand why cybersecurity and encryption are important",
            "Implement a Caesar cipher in Python",
            "Understand brute force attacks",
            "Know what HTTPS and modern encryption mean"
          ],
          "ukCurriculum": [
            "Understand online safety and cybersecurity",
            "Apply computing concepts to real-world security",
            "Understand how encryption protects data"
          ]
        },
        "quiz": [
          {
            "q": "What does encryption do to data?",
            "options": [
              "Deletes it",
              "Makes it faster to send",
              "Scrambles it so only the intended recipient with the correct key can read it",
              "Compresses it to save space"
            ],
            "answer": 2
          },
          {
            "q": "The HTTPS padlock in a browser means...",
            "options": [
              "The website is trustworthy",
              "Your data is encrypted in transit between your device and the website",
              "The site is popular",
              "The site has good reviews"
            ],
            "answer": 1
          },
          {
            "q": "Caesar cipher with shift 3 encrypts 'D' as...",
            "options": [
              "D",
              "G",
              "A",
              "C"
            ],
            "answer": 1
          },
          {
            "q": "What is a 'brute force' attack?",
            "options": [
              "Physically breaking a computer",
              "Trying every possible key until the right one is found",
              "A very fast sorting algorithm",
              "A type of virus"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Sensor Data Analysis",
        "xp": 100,
        "content": {
          "explanation": "Robots collect enormous amounts of sensor data. A robot that records distance readings 10 times per second for 10 minutes generates 6,000 data points! Making sense of this data — finding patterns, detecting anomalies, making predictions — is what data analysis is about.\n\nBasic statistics are your first tools: mean (average), median (middle value), and mode (most common value) summarize a dataset. Standard deviation tells you how spread out the data is. These values help you understand what is 'normal' for your robot's environment.\n\nData visualisation makes patterns visible that are invisible in raw numbers. A simple line graph of distance over time immediately shows you when the robot approached an obstacle. Good data analysis leads to better robot behaviour — informed by evidence, not guesswork.",
          "example": "# Sensor data analysis in Python:\nimport statistics\n\ndistances = [45, 43, 47, 12, 8, 9, 44, 46, 48, 43]\n\nmean = statistics.mean(distances)    # Average: 34.5\nmedian = statistics.median(distances) # Middle value: 44.0\nstdev = statistics.stdev(distances)  # Spread: 18.2\n\n# Find anomalies (values far from mean):\nthreshold = mean - stdev\nanomalies = [x for x in distances if x < threshold]\nprint('Obstacle detected at:', anomalies)  # [12, 8, 9]",
          "activity": "Analyse a list of 20 robot distance readings. Calculate mean, median, and standard deviation. Plot a simple text graph. Identify which readings are more than one standard deviation below the mean — these represent when the robot was near an obstacle.",
          "keyWords": [
            "mean",
            "median",
            "standard deviation",
            "data analysis",
            "visualisation",
            "anomaly",
            "statistics",
            "pattern"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Why Analyse Robot Data?",
              "duration": "10 mins",
              "desc": "Understand the value of data",
              "steps": [
                "Robot logs 6000 readings in 10 minutes — impossible to scan by hand",
                "Statistics summarise: mean distance, typical range",
                "Anomaly detection: unusually low distance = obstacle encountered!",
                "Visualisation: graph distance over time — patterns jump out",
                "Real example: NASA analyses Mars Rover data exactly like this"
              ]
            },
            {
              "num": 2,
              "title": "Calculate Statistics in Python",
              "duration": "20 mins",
              "desc": "Hands-on data analysis",
              "steps": [
                "Load 20 sensor readings into a Python list",
                "Calculate: mean, median, min, max using statistics module",
                "Calculate standard deviation",
                "Find anomalies: values below mean-stdev",
                "Discuss what each anomaly means physically for the robot"
              ]
            },
            {
              "num": 3,
              "title": "Visualise with Text Graphs",
              "duration": "15 mins",
              "desc": "See patterns in data",
              "steps": [
                "Print a text bar chart: each reading as a row of asterisks",
                "Scale values to fit 20-character wide chart",
                "Spot: where did values drop suddenly? (obstacle!)",
                "Discuss: visualisation reveals patterns invisible in raw numbers",
                "Extension: count how many times distance was below 20cm"
              ]
            }
          ],
          "extension": "Collect 100 distance readings from a simulated robot moving through an environment. Calculate rolling average (average of last 5 readings) to smooth noisy data. Graph both raw and smoothed data. When is smoothing useful?",
          "reflection": "Research how self-driving cars analyse sensor data in real time. They receive LiDAR data with millions of points per second! What statistical and AI techniques do they use to identify pedestrians, other cars, and road boundaries?",
          "objectives": [
            "Calculate mean, median, and standard deviation",
            "Identify anomalies in sensor data",
            "Visualise data with simple text graphs",
            "Apply data analysis to robot sensor interpretation"
          ],
          "ukCurriculum": [
            "Apply mathematical techniques to data analysis",
            "Understand data-driven decision making",
            "Prepare for data science concepts in Year 6"
          ]
        },
        "quiz": [
          {
            "q": "The mean of [4, 8, 2, 10, 6] is...",
            "options": [
              "6",
              "8",
              "5",
              "4"
            ],
            "answer": 0
          },
          {
            "q": "Why is data visualisation useful?",
            "options": [
              "It replaces calculations",
              "It makes patterns in data immediately visible that would be hard to spot in raw numbers",
              "It is required by Python",
              "It makes data more accurate"
            ],
            "answer": 1
          },
          {
            "q": "An anomaly in sensor data is...",
            "options": [
              "The most common value",
              "A data point significantly different from the expected range — possibly indicating an obstacle or error",
              "The average value",
              "A deleted reading"
            ],
            "answer": 1
          },
          {
            "q": "Standard deviation measures...",
            "options": [
              "The average value",
              "The middle value",
              "How spread out the data is from the mean",
              "The maximum value"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Robotics System Design Project",
        "xp": 105,
        "content": {
          "explanation": "A system is a collection of components that work together to achieve a goal. Designing a system means: understanding the requirements, choosing components, designing how they interact, building and testing each part, then integrating everything.\n\nThis lesson challenges you to design and build a complete robotic system from scratch, following a real engineering design process. You will start with requirements (what must it do?), design the hardware and software architecture, build and test components individually, integrate them, and validate the whole system against the original requirements.\n\nThis process is how real robots, apps, and software systems are built. Whether you are designing a Mars rover, a hospital robot, or a school app, the engineering design process is the same.",
          "example": "// System requirements for crop inspection robot:\n// FR1: Navigate field in systematic grid pattern\n// FR2: Detect unhealthy crops (color analysis)\n// FR3: Record GPS position of each detection\n// FR4: Avoid obstacles (rocks, weeds)\n// FR5: Return to base when battery < 20%\n// FR6: Log all data to CSV file\n\n// Architecture:\n// navigation_module: grid movement\n// sensor_module: distance + color sensors\n// data_logger: writes CSV file\n// battery_monitor: tracks charge level\n// main_controller: coordinates all modules",
          "activity": "Design a robot system for a library: it must navigate shelves, scan barcodes, and identify misplaced books. Write formal requirements, draw an architecture diagram with modules and their connections, then code and test the navigation module.",
          "keyWords": [
            "system design",
            "requirements",
            "architecture",
            "module",
            "integration",
            "validation",
            "engineering",
            "specification"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Define Requirements",
              "duration": "20 mins",
              "desc": "Write formal system requirements",
              "steps": [
                "Problem: design inspection robot for a school garden",
                "Must do: navigate path, detect dead plants, log findings, avoid obstacles, return when low battery",
                "Write formal requirements: 'FR1: The robot shall navigate...'",
                "Requirements must be: specific, measurable, testable",
                "Review: could you write a test for each requirement?"
              ]
            },
            {
              "num": 2,
              "title": "Design System Architecture",
              "duration": "20 mins",
              "desc": "Plan before building",
              "steps": [
                "Draw architecture diagram: main_controller, sensors, navigation, data_logger",
                "Define interfaces: what data does each module send/receive?",
                "Hardware design: which sensors, which movement type, battery capacity",
                "Software design: which module runs first? Which runs continuously?",
                "Peer review: have a partner check your design makes sense"
              ]
            },
            {
              "num": 3,
              "title": "Build and Test Modules",
              "duration": "25 mins",
              "desc": "Implement and validate",
              "steps": [
                "Code the navigation module first (it is the foundation)",
                "Test it independently: does it navigate correctly?",
                "Code the sensor module: read distance and light",
                "Integrate: navigation + sensors — test together",
                "Add data logger last: verify CSV is written correctly"
              ]
            }
          ],
          "extension": "Complete the full system: all 5 modules working together. Write a validation report: test each formal requirement (FR1-FR5) and document Pass/Fail. Any fails must be fixed and retested.",
          "reflection": "Research the engineering design of the NASA Perseverance Mars Rover. What sensors does it have? What are its system requirements? How do engineers test a rover that will be 140 million miles away?",
          "objectives": [
            "Apply systems thinking to complete robot design",
            "Write formal system requirements",
            "Design modular software architecture",
            "Build, test, and integrate system components"
          ],
          "ukCurriculum": [
            "Apply all Year 5 concepts in a complex systems design project",
            "Understand professional engineering design processes",
            "Design and build complete robotic systems"
          ]
        },
        "quiz": [
          {
            "q": "What is the first step in designing a robot system?",
            "options": [
              "Start coding the most interesting module",
              "Define clear, testable requirements for what the system must do",
              "Choose the programming language",
              "Pick the sensors"
            ],
            "answer": 1
          },
          {
            "q": "Why design software in separate modules?",
            "options": [
              "Modules are faster",
              "Separate modules are easier to test individually, debug, and replace without breaking other parts",
              "Modules use less memory",
              "All programs must use modules"
            ],
            "answer": 1
          },
          {
            "q": "What is 'validation' in system design?",
            "options": [
              "Making the system look good",
              "Testing that the completed system meets all the original requirements",
              "Writing the requirements",
              "Coding the modules"
            ],
            "answer": 1
          },
          {
            "q": "What is a 'system architecture'?",
            "options": [
              "The physical appearance of the robot",
              "A plan showing how the system's components fit together and interact",
              "A list of requirements",
              "A type of algorithm"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Collaborative Large-Scale Project",
        "xp": 105,
        "content": {
          "explanation": "You are ready for the biggest programming challenge yet. In teams of four, you will build a complete multi-robot coordination system. This is not just a coding challenge — it is a project management challenge too.\n\nLarge teams face unique problems: two people might change the same code and cause conflicts. One person's delay can block everyone else. Interfaces between components must be agreed in advance. This is why real software companies use version control (like Git), code reviews, and agile development methodologies.\n\nYour team will use a simplified version of these professional practices: daily stand-ups (brief status updates), agreed interfaces between modules, code reviews before integration, and a shared test plan. These skills are as important as the code itself.",
          "example": "// Team project: 4-robot warehouse automation\n// Person A: Robot pathfinding algorithm\n// Person B: Inventory management system\n// Person C: Collision avoidance coordinator\n// Person D: Dashboard and data visualisation\n\n// Agreed interfaces (defined BEFORE coding):\n// Robot → Coordinator: send_position(robotId, x, y)\n// Coordinator → Robot: set_waypoint(robotId, x, y)\n// Inventory → Dashboard: update_stock(itemId, count)\n// All modules → Dashboard: log_event(source, message)",
          "activity": "With your team of 4, agree on the system interfaces BEFORE anyone writes code. Then each person builds their module to meet the agreed interface. Integration test together — do the modules connect correctly?",
          "keyWords": [
            "team",
            "project management",
            "interface",
            "version control",
            "stand-up",
            "code review",
            "integration",
            "milestone"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Project Kickoff",
              "duration": "15 mins",
              "desc": "Plan the team project professionally",
              "steps": [
                "Define the system: 4-robot warehouse automation",
                "Assign roles: pathfinding, inventory, collision, dashboard",
                "KEY STEP: agree ALL interfaces before coding starts",
                "Create a simple project plan with milestones",
                "Set checkpoint: everyone codes to the agreed interface"
              ]
            },
            {
              "num": 2,
              "title": "Develop and Checkpoint",
              "duration": "20 mins",
              "desc": "Build with regular sync points",
              "steps": [
                "20 minutes of independent coding on individual modules",
                "5-minute stand-up: 'What have I done? What's next? Any blockers?'",
                "Code to the agreed interface — do not change the interface without team agreement!",
                "Peer review: swap code with partner, look for bugs",
                "Checkpoint: can you run your module independently yet?"
              ]
            },
            {
              "num": 3,
              "title": "Integrate and Optimise",
              "duration": "20 mins",
              "desc": "Bring everything together",
              "steps": [
                "Integration: connect all four modules",
                "Integration test: run the full system",
                "Debug any interface mismatches",
                "Measure performance: how fast does the warehouse process items?",
                "Optimise the bottleneck and re-measure"
              ]
            }
          ],
          "extension": "Retrospective: after the project, hold a 5-minute team retrospective. Answer: What went well? What was difficult? What would you change next time? Write one sentence of advice for a team starting a similar project.",
          "reflection": "Research agile software development: what are 'sprints', 'user stories', and 'retrospectives'? How do companies like Spotify or Amazon use agile methodology to build software? How does your project today relate to agile?",
          "objectives": [
            "Work in a team on a large-scale programming project",
            "Define and agree interfaces before coding",
            "Use basic project management practices",
            "Integrate and test team-developed components"
          ],
          "ukCurriculum": [
            "Collaborate on complex programming projects",
            "Apply project management to software development",
            "Demonstrate mastery of all Year 5 computing concepts"
          ]
        },
        "quiz": [
          {
            "q": "Why must team members agree on interfaces BEFORE they start coding?",
            "options": [
              "It wastes time",
              "Agreed interfaces ensure individual modules can be connected without having to rewrite them",
              "Only the project leader needs to know the interfaces",
              "Interfaces change constantly, so there is no point agreeing first"
            ],
            "answer": 1
          },
          {
            "q": "What is a 'stand-up' in software development?",
            "options": [
              "A demonstration of the final product",
              "A brief daily team meeting where everyone shares progress and blockers",
              "A type of code review",
              "A stand-alone program"
            ],
            "answer": 1
          },
          {
            "q": "Why is 'code review' (having someone else check your code) valuable?",
            "options": [
              "It slows down development unnecessarily",
              "Another person catches bugs you missed and ensures the code is readable and correct",
              "Reviews are mandatory in Python",
              "Only expert programmers benefit from reviews"
            ],
            "answer": 1
          },
          {
            "q": "A 'bottleneck' in a team project is...",
            "options": [
              "The best-performing team member",
              "The slowest module or process that limits the entire system's performance",
              "A type of debugging technique",
              "The interface between two modules"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Year 5 Reflection and Year 6 Preview",
        "xp": 90,
        "content": {
          "explanation": "Three years of computing done! You have gone from simple sequences and loops to recursive algorithms, object-oriented programming, file I/O, cybersecurity, sorting, searching, and data analysis. That is an extraordinary range of skills.\n\nYear 5 introduced you to concepts that professional software engineers use every day. Big O notation, sorting algorithms, OOP, cybersecurity, sensor data analysis — these are not just school topics. These are the building blocks of real software.\n\nYear 6 will take you to the highest level. You will optimise algorithms, explore machine learning basics, work with databases, write network-aware programs, and complete a major capstone project that showcases everything you have learned. By the end of Year 6, you will have the foundations to pursue computing at secondary school with real confidence.",
          "example": "// Year 5 skills you've mastered:\n// ✓ Big O complexity: O(1), O(n), O(n²), O(log n)\n// ✓ Object-Oriented Programming: classes, objects, inheritance\n// ✓ Advanced data structures: 2D arrays, dictionaries\n// ✓ Recursive algorithms with base cases\n// ✓ Sorting: bubble sort, merge sort concepts\n// ✓ Searching: linear and binary search\n// ✓ File I/O: reading and writing persistent data\n// ✓ Cybersecurity: encryption, Caesar cipher, HTTPS\n// ✓ Sensor data analysis: statistics, anomaly detection\n// ✓ System design: requirements → architecture → build → test",
          "activity": "Create a 'Year 5 Skills Portfolio': for each of the 10 major topics, write one sentence describing what it is and one example of where it is used in real-world computing. Then rate your confidence (1-5) on each.",
          "keyWords": [
            "reflection",
            "portfolio",
            "Year 6 preview",
            "growth",
            "achievement",
            "celebrate",
            "goal setting"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Year 5 Skills Review",
              "duration": "20 mins",
              "desc": "Celebrate and consolidate your learning",
              "steps": [
                "Walk through all 10 Year 5 topics as a class",
                "For each: what was the key concept? One real-world application?",
                "Students self-assess: which do they feel most/least confident about?",
                "Identify: which concept has the most exciting real-world applications?",
                "Celebrate: compare to what you knew at the start of Year 5!"
              ]
            },
            {
              "num": 2,
              "title": "Showcase Your Best Work",
              "duration": "15 mins",
              "desc": "Present your highlights",
              "steps": [
                "Choose your proudest Year 5 piece of work",
                "Explain: what does it do? What concepts does it use? What was hardest?",
                "Present to a partner",
                "Partner asks: one question about the technical approach",
                "Explain to a non-programmer why this project is impressive"
              ]
            },
            {
              "num": 3,
              "title": "Year 6 Preview and Goal Setting",
              "duration": "10 mins",
              "desc": "Look ahead with excitement",
              "steps": [
                "Preview: advanced algorithms, databases, machine learning basics, network programming, capstone project",
                "Show an exciting Year 6 example (recognisably built on Year 5 skills)",
                "Set ONE goal for Year 6 in terms of a skill to master",
                "Write it on a card to open at the start of Year 6",
                "End: class round of applause for completing Year 5!"
              ]
            }
          ],
          "extension": "Teach it back: explain Big O notation, binary search, and OOP to a Year 4 student (or write an explanation aimed at Year 4 level). Teaching something is the most powerful way to know whether you truly understand it.",
          "reflection": "Research a software product that uses many of the techniques you learned in Year 5 — for example, Spotify (uses recommendation algorithms, databases, OOP) or Google Maps (graph algorithms, data structures, optimisation). How many Year 5 concepts can you identify?",
          "objectives": [
            "Reflect on Year 5 computing achievement",
            "Celebrate range and depth of skills developed",
            "Set goals for Year 6",
            "Prepare for advanced Year 6 computing concepts"
          ],
          "ukCurriculum": [
            "Reflect on significant progress in computing",
            "Prepare for secondary-level computing concepts",
            "Develop confidence in applying advanced programming skills"
          ]
        },
        "quiz": [
          {
            "q": "Which Year 5 concept describes how algorithm speed scales with data size?",
            "options": [
              "OOP",
              "File I/O",
              "Big O notation",
              "Recursion"
            ],
            "answer": 2
          },
          {
            "q": "A class in Python is best described as...",
            "options": [
              "A type of loop",
              "A blueprint for creating objects with shared properties and methods",
              "A kind of file",
              "A sorting algorithm"
            ],
            "answer": 1
          },
          {
            "q": "Binary search requires the data to be... before searching",
            "options": [
              "Very large",
              "Randomly ordered",
              "Sorted",
              "Stored in a dictionary"
            ],
            "answer": 2
          },
          {
            "q": "Which concept protects data as it travels across a network?",
            "options": [
              "Recursion",
              "Merge sort",
              "Encryption",
              "File I/O"
            ],
            "answer": 2
          }
        ]
      }
    ]
  },
  {
    "id": "y6-cs-expert",
    "title": "Year 6: Expert Programmer",
    "tagline": "Databases, ML basics, autonomous systems & capstone",
    "year": "Year 6",
    "color": "#F59E0B",
    "icon": "🏆",
    "totalXP": 1420,
    "modules": [
      {
        "title": "Advanced Algorithm Design and Patterns",
        "xp": 110,
        "content": {
          "explanation": "In Year 6 you move from learning algorithms to designing and optimising them professionally. Real algorithms are judged not just on correctness but on efficiency, robustness, and elegance. The best algorithm for a problem is the one that is correct, fast enough for the scale of data, uses acceptable memory, and is readable by other programmers.\n\nDesign patterns are reusable solutions to common programming problems. Just as architects reuse building plans, programmers reuse algorithmic patterns. Divide and conquer (split → solve → merge) solves sorting and searching. Dynamic programming solves optimisation problems by remembering previous answers. Greedy algorithms make the locally best choice at each step.\n\nUnderstanding these patterns means you do not need to invent solutions from scratch. You recognise: 'This is a divide-and-conquer problem' and reach for the right pattern immediately.",
          "example": "# Greedy algorithm: coin change problem\n# Find minimum coins to make change for amount\ndef minCoins(amount, coins=[50,20,10,5,1]):\n    result = []\n    for coin in coins:      # Try largest first\n        while amount >= coin:\n            result.append(coin)\n            amount -= coin\n    return result\n\nprint(minCoins(67))  # [50, 10, 5, 1, 1] = 5 coins\n\n# Dynamic programming: memoized fibonacci\nfib_cache = {}\ndef fib(n):\n    if n in fib_cache: return fib_cache[n]  # Reuse!\n    if n <= 1: return n\n    fib_cache[n] = fib(n-1) + fib(n-2)     # Cache it\n    return fib_cache[n]",
          "activity": "Implement the greedy coin change algorithm. Test with amounts: 67p, 99p, 36p. Does it always find the MINIMUM number of coins? Discover: for most standard coin systems it does, but can you find a case where it fails?",
          "keyWords": [
            "design pattern",
            "divide and conquer",
            "dynamic programming",
            "greedy algorithm",
            "memoization",
            "optimise",
            "elegant",
            "robust"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Algorithm Design Patterns",
              "duration": "20 mins",
              "desc": "Recognise and categorise patterns",
              "steps": [
                "Pattern 1: Divide and conquer — split problem, solve halves, combine (merge sort, binary search)",
                "Pattern 2: Greedy — always pick the best-looking option now (coin change, route planning)",
                "Pattern 3: Dynamic programming — remember previous answers to avoid recalculating",
                "Match: 'find cheapest route' → greedy or DP?",
                "Match: 'sort a list' → divide and conquer"
              ]
            },
            {
              "num": 2,
              "title": "Implement a Greedy Algorithm",
              "duration": "15 mins",
              "desc": "Code and test coin change",
              "steps": [
                "Code minCoins(amount, coins) using greedy approach",
                "Test: 67p → [50,10,5,1,1] (5 coins)",
                "Test: 99p → [50,20,20,5,2,2] — verify",
                "Try unusual coin systems: [7,3,1] — does greedy still work?",
                "Discover: greedy fails for [6,4,1] with amount=8"
              ]
            },
            {
              "num": 3,
              "title": "Dynamic Programming: Memoization",
              "duration": "10 mins",
              "desc": "Optimise recursive algorithms",
              "steps": [
                "Run recursive fib(40) without cache — notice how slow it is",
                "Add memoization: store calculated values in dictionary",
                "Run fib(40) with cache — instant!",
                "Understand: DP avoids recalculating work you have already done",
                "Calculate: fib(40) without DP needs millions of calls; with DP just 40"
              ]
            }
          ],
          "extension": "Implement dynamic programming solution to coin change (minimum coins guaranteed). Compare to greedy approach. For which coin systems do they give the same answer? For which does greedy fail?",
          "reflection": "Research the Traveling Salesman Problem (TSP) — what is it, why is it famously hard, and what greedy and approximate algorithms are used to solve it in practice? How does it relate to robot route planning?",
          "objectives": [
            "Understand and apply common algorithm design patterns",
            "Implement greedy algorithms",
            "Understand memoization and dynamic programming",
            "Evaluate algorithm correctness and efficiency trade-offs"
          ],
          "ukCurriculum": [
            "Design and optimise advanced algorithms",
            "Apply algorithmic patterns to new problems",
            "Understand trade-offs between correctness and efficiency"
          ]
        },
        "quiz": [
          {
            "q": "A greedy algorithm...",
            "options": [
              "Always finds the optimal solution",
              "Makes the locally best choice at each step — fast but not always globally optimal",
              "Is the slowest type of algorithm",
              "Requires recursion"
            ],
            "answer": 1
          },
          {
            "q": "Memoization improves recursive algorithms by...",
            "options": [
              "Making them shorter",
              "Storing previously computed results to avoid recalculating them",
              "Making the base case larger",
              "Using loops instead of recursion"
            ],
            "answer": 1
          },
          {
            "q": "The 'divide and conquer' pattern works by...",
            "options": [
              "Ignoring half the data",
              "Splitting the problem in half, solving each half independently, then combining the results",
              "Trying every possible solution",
              "Guessing the answer and checking"
            ],
            "answer": 1
          },
          {
            "q": "Dynamic programming is most useful when...",
            "options": [
              "You have small amounts of data",
              "The problem has overlapping sub-problems that would be recalculated many times without caching",
              "You want the simplest code",
              "Recursion is not available"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Databases and Structured Data",
        "xp": 110,
        "content": {
          "explanation": "Almost every application stores its data in a database. A database is an organised collection of data that can be searched, sorted, filtered, and updated efficiently. Unlike a file with raw text, a database has structure: tables, rows, columns, and relationships between tables.\n\nSQL (Structured Query Language) is the language used to interact with relational databases. You can SELECT data, INSERT new records, UPDATE existing ones, and DELETE records. SQL has been around since the 1970s and is still the most widely used database language today.\n\nFor robot systems, a database is perfect for storing sensor logs, user preferences, map data, and route history — data that needs to persist, be queried, and be shared between multiple programs.",
          "example": "# SQLite database in Python:\nimport sqlite3\n\n# Create database and table:\nconn = sqlite3.connect('robot_data.db')\ncursor = conn.cursor()\ncursor.execute('''CREATE TABLE IF NOT EXISTS sensor_log\n    (id INTEGER PRIMARY KEY, timestamp REAL,\n     distance INTEGER, battery INTEGER)''')\n\n# Insert data:\ncursor.execute('INSERT INTO sensor_log (timestamp, distance, battery) VALUES (?,?,?)',\n               (1.5, 45, 92))\nconn.commit()\n\n# Query data:\ncursor.execute('SELECT * FROM sensor_log WHERE distance < 20')\ncloseReadings = cursor.fetchall()\nprint(closeReadings)  # Rows where distance < 20",
          "activity": "Create a SQLite database for a robot's journey log. Add 15 simulated readings. Write SQL queries to: (1) find all readings where distance < 20, (2) find the average battery level, (3) find the 5 readings with lowest battery.",
          "keyWords": [
            "database",
            "SQL",
            "table",
            "row",
            "column",
            "SELECT",
            "INSERT",
            "query",
            "SQLite",
            "relational"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Why Databases?",
              "duration": "15 mins",
              "desc": "Understand databases vs files",
              "steps": [
                "A file stores data as plain text — no structure, no fast search",
                "A database stores data in structured tables — fast search, filter, sort",
                "Example: 10,000 sensor readings in a file vs a database",
                "File: to find distance < 20, read ALL 10,000 lines",
                "Database: SQL query finds them instantly",
                "Real example: every website you use has a database"
              ]
            },
            {
              "num": 2,
              "title": "Create and Query a Database",
              "duration": "20 mins",
              "desc": "Hands-on SQL in Python",
              "steps": [
                "Create sensor_log table with columns: id, timestamp, distance, battery",
                "Insert 10 readings using Python sqlite3 module",
                "SELECT * FROM sensor_log (show all)",
                "SELECT * FROM sensor_log WHERE distance < 20 (filter)",
                "SELECT AVG(battery) FROM sensor_log (aggregate function)"
              ]
            },
            {
              "num": 3,
              "title": "Advanced Queries",
              "duration": "10 mins",
              "desc": "Sort, count, and find extremes",
              "steps": [
                "ORDER BY battery ASC (sort by battery level)",
                "LIMIT 5 (only first 5 results)",
                "COUNT(*) (how many rows?)",
                "MIN(distance) and MAX(battery)",
                "Discuss: SQL is incredibly powerful for data analysis"
              ]
            }
          ],
          "extension": "Design a database schema for a school robot management system: tables for robots, students, sessions (who used which robot when), and session_data (sensor readings per session). Write the CREATE TABLE SQL for each. What are the relationships between tables?",
          "reflection": "Research NoSQL databases (like MongoDB used by many apps). How are they different from relational SQL databases? When would you choose NoSQL over SQL? What companies use NoSQL at massive scale?",
          "objectives": [
            "Understand database structure and purpose",
            "Create SQLite databases in Python",
            "Write basic SQL queries (SELECT, INSERT, WHERE, ORDER BY)",
            "Apply databases to robot data storage"
          ],
          "ukCurriculum": [
            "Understand how data is stored and managed at scale",
            "Apply SQL to real-world data scenarios",
            "Prepare for data management in secondary school computing"
          ]
        },
        "quiz": [
          {
            "q": "What is a database?",
            "options": [
              "A type of Python file",
              "An organised, structured collection of data that can be efficiently searched, filtered, and updated",
              "A programming language",
              "A type of encryption"
            ],
            "answer": 1
          },
          {
            "q": "What does this SQL do? SELECT * FROM robots WHERE battery < 20",
            "options": [
              "Deletes robots with low battery",
              "Returns all columns from the robots table where the battery column is less than 20",
              "Updates battery to 20",
              "Counts robots"
            ],
            "answer": 1
          },
          {
            "q": "Why is a database better than a plain text file for 10,000 sensor readings?",
            "options": [
              "Databases use less disk space",
              "Databases allow instant structured queries, filtering, and sorting — far faster than reading all text",
              "Text files are not allowed in Python",
              "They are equally good"
            ],
            "answer": 1
          },
          {
            "q": "What does SQL stand for?",
            "options": [
              "Structured Query Language",
              "Sequential Query Loop",
              "Systematic Queue Lookup",
              "Simple Query Logic"
            ],
            "answer": 0
          }
        ]
      },
      {
        "title": "Complex Conditional Logic and Boolean Algebra",
        "xp": 110,
        "content": {
          "explanation": "By Year 6 you can use complex multi-condition logic to create sophisticated decision-making systems. Boolean algebra — the mathematics of true and false — underpins all computing. Every circuit in a computer, every decision in every program, reduces to AND, OR, and NOT.\n\nDe Morgan's Laws tell us how to simplify complex conditions: NOT (A AND B) = (NOT A) OR (NOT B). This equivalence can make conditions dramatically shorter and more readable. Understanding Boolean simplification helps you write cleaner, more efficient code.\n\nShort-circuit evaluation is a performance technique: in (A AND B), if A is false, B is never evaluated (because the whole expression must be false). In (A OR B), if A is true, B is never evaluated. This can prevent errors (checking if a list is not empty before accessing it) and improve performance.",
          "example": "# Complex Boolean logic in Python:\n# Robot decides whether to return to base:\nbatteryLow = battery < 20\nobstacleClear = distance > 50\nmissionComplete = collected_items == target_items\n\n# Complex condition:\nshould_return = batteryLow or missionComplete or (not obstacleClear and battery < 40)\n\n# Short-circuit evaluation:\n# If batteryLow is True, Python doesn't check the rest!\n\n# De Morgan's Law:\n# NOT (A AND B) is the same as (NOT A) OR (NOT B)\n# NOT (A OR B) is the same as (NOT A) AND (NOT B)\nprint(not (True and False))     # True\nprint((not True) or (not False)) # True (same result!)",
          "activity": "Write a complex conditional for a robot: it should return to base if: battery < 15% OR (obstacles on all sides AND battery < 40%) OR mission is complete. Simplify using De Morgan's Laws and verify the simplified version gives the same result.",
          "keyWords": [
            "boolean algebra",
            "AND",
            "OR",
            "NOT",
            "De Morgan",
            "short-circuit",
            "truth table",
            "simplify"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Boolean Algebra Foundations",
              "duration": "15 mins",
              "desc": "Master AND, OR, NOT",
              "steps": [
                "Truth tables: A AND B, A OR B, NOT A",
                "When is (A AND B) true? Only when BOTH A and B are true",
                "When is (A OR B) true? When at least one is true",
                "When is NOT A true? When A is false",
                "Apply to robots: 'IF distance < 20 AND battery < 30 THEN emergency stop'"
              ]
            },
            {
              "num": 2,
              "title": "De Morgan's Laws",
              "duration": "15 mins",
              "desc": "Simplify complex conditions",
              "steps": [
                "NOT (A AND B) = (NOT A) OR (NOT B)",
                "NOT (A OR B) = (NOT A) AND (NOT B)",
                "Verify with truth table: they always give the same result!",
                "Example: NOT (sunny AND warm) = cloudy OR cold",
                "Simplify a complex robot condition using De Morgan"
              ]
            },
            {
              "num": 3,
              "title": "Short-Circuit Evaluation",
              "duration": "15 mins",
              "desc": "Understand Python's evaluation order",
              "steps": [
                "Run: False and expensive_function() — function is NOT called!",
                "Python stops as soon as result is determined",
                "Practical use: if list and list[0] == target — safe because list is checked first",
                "Write a program demonstrating short-circuit evaluation",
                "Discuss: why this can be both a feature and a source of bugs"
              ]
            }
          ],
          "extension": "Build a truth table generator in Python: given two boolean variables A and B, print all four combinations (TT, TF, FT, FF) and evaluate a given expression for each. Use it to verify De Morgan's Laws programmatically.",
          "reflection": "Research how Boolean logic is used in VLSI chip design. How many billions of transistors are in a modern processor, and how do they implement AND, OR, NOT gates? What does this have to do with what you learned today?",
          "objectives": [
            "Apply complex multi-condition Boolean logic",
            "Understand and apply De Morgan's Laws",
            "Use short-circuit evaluation correctly",
            "Build truth tables and verify logical equivalence"
          ],
          "ukCurriculum": [
            "Apply Boolean algebra to complex program logic",
            "Understand the mathematical foundations of computing",
            "Optimise conditional expressions"
          ]
        },
        "quiz": [
          {
            "q": "When is (A AND B) true?",
            "options": [
              "When at least one of A or B is true",
              "Only when BOTH A and B are true",
              "When neither A nor B is true",
              "Always"
            ],
            "answer": 1
          },
          {
            "q": "De Morgan's Law states that NOT (A AND B) is equivalent to...",
            "options": [
              "NOT A AND NOT B",
              "(NOT A) OR (NOT B)",
              "A OR B",
              "NOT A OR B"
            ],
            "answer": 1
          },
          {
            "q": "Short-circuit evaluation means...",
            "options": [
              "The circuit breaks",
              "If the result of an AND/OR expression can be determined from the first condition alone, the second is not evaluated",
              "Evaluation happens in random order",
              "Only one condition is ever checked"
            ],
            "answer": 1
          },
          {
            "q": "Which expression safely checks if list is not empty before accessing list[0]?",
            "options": [
              "list[0] == target",
              "list is not None",
              "list and list[0] == target (short-circuit: checks list first)",
              "list[0] if list"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Advanced Functions and Code Quality",
        "xp": 110,
        "content": {
          "explanation": "Professional code is not just correct — it is clean, readable, well-documented, and easy to maintain. Code quality matters because programs are read far more often than they are written. You might write a function in an hour and read it hundreds of times over years.\n\nHigher-order functions take other functions as arguments. Python's map(), filter(), and sorted() all accept functions as parameters, enabling elegant, concise solutions. Lambda functions are small, anonymous functions defined inline — perfect for one-line operations.\n\nDocstrings, type hints, and meaningful names make your code self-documenting. PEP 8 is Python's style guide — it defines conventions that all Python programmers follow so that reading anyone's Python code feels familiar. Following these conventions is a professional habit.",
          "example": "# Higher-order functions and lambda:\nnumbers = [3, 1, 7, 2, 9, 4]\n\n# sorted with key function:\nsorted_list = sorted(numbers, key=lambda x: -x)  # Descending\n# Result: [9, 7, 4, 3, 2, 1]\n\n# filter: keep only even numbers\nevens = list(filter(lambda x: x % 2 == 0, numbers))\n# Result: [2, 4]\n\n# map: square each number\nsquared = list(map(lambda x: x**2, numbers))\n# Result: [9, 1, 49, 4, 81, 16]\n\n# Well-documented function with type hints:\ndef calculateBatteryTime(battery: int, drainRate: float) -> float:\n    '''Calculate remaining runtime in minutes.\n    Args: battery (int): current level 0-100\n          drainRate (float): percent per minute\n    Returns: float: minutes remaining\n    '''\n    return battery / drainRate",
          "activity": "Use map() to calculate battery remaining after [5,10,15,20,25] km trips at 5% drain per km. Use filter() to find which trips leave battery above 50%. Write a well-documented function with type hints for each operation.",
          "keyWords": [
            "higher-order function",
            "lambda",
            "map",
            "filter",
            "type hints",
            "docstring",
            "PEP 8",
            "code quality",
            "clean code"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Code Quality Principles",
              "duration": "15 mins",
              "desc": "Understand what makes code 'good'",
              "steps": [
                "Show two programs: same function, one messy, one clean",
                "Clean code: meaningful names, docstring, type hints, consistent spacing",
                "Ask: which would you rather debug at 11pm?",
                "DRY: no repeated code (use functions)",
                "KISS: Keep It Simple — do not over-engineer",
                "Show PEP 8 style guide highlights"
              ]
            },
            {
              "num": 2,
              "title": "Higher-Order Functions",
              "duration": "15 mins",
              "desc": "Use map, filter, and sorted",
              "steps": [
                "map(function, list): apply function to every element",
                "filter(function, list): keep elements where function returns True",
                "sorted(list, key=function): sort using a custom key",
                "Use lambda for short inline functions",
                "Practice: filter robot readings where distance < 30"
              ]
            },
            {
              "num": 3,
              "title": "Write Professional Code",
              "duration": "15 mins",
              "desc": "Document and type-hint your functions",
              "steps": [
                "Write calculateRobotBattery(steps, speed) function",
                "Add docstring: what does it do? What are the arguments? What does it return?",
                "Add type hints: def calculateRobotBattery(steps: int, speed: float) -> float",
                "Check PEP 8 compliance (naming, spacing)",
                "Peer review: swap with partner — is their code readable without explanation?"
              ]
            }
          ],
          "extension": "Refactor your Year 4 or Year 5 project code to meet professional standards: add docstrings to every function, add type hints, rename any unclear variables, remove duplicated code (replace with functions), and check PEP 8 compliance.",
          "reflection": "Research Robert C. Martin's 'Clean Code' principles. Choose three principles that resonate most with you and explain how they apply to Python programming with an example from your own code.",
          "objectives": [
            "Use higher-order functions (map, filter, sorted)",
            "Write lambda functions",
            "Apply type hints and docstrings",
            "Follow PEP 8 code quality standards"
          ],
          "ukCurriculum": [
            "Write professional-quality, well-documented code",
            "Apply advanced Python features",
            "Prepare for secondary school computing and beyond"
          ]
        },
        "quiz": [
          {
            "q": "What does a docstring do?",
            "options": [
              "Makes code run faster",
              "Documents what a function does, its arguments, and return value — embedded in the code",
              "Creates variables",
              "Replaces type hints"
            ],
            "answer": 1
          },
          {
            "q": "What does map(lambda x: x*2, [1,2,3]) return?",
            "options": [
              "[1,2,3]",
              "[2,4,6]",
              "6",
              "None"
            ],
            "answer": 1
          },
          {
            "q": "Type hints in Python (e.g. def f(x: int) -> str:) do what?",
            "options": [
              "Force strict type checking at runtime",
              "Document the expected types, improving readability and tool support",
              "Make the function faster",
              "Are required by Python"
            ],
            "answer": 1
          },
          {
            "q": "The PEP 8 style guide exists to...",
            "options": [
              "Force all Python to run faster",
              "Establish consistent coding conventions so all Python code looks familiar to any Python programmer",
              "Prevent bugs",
              "Define which algorithms to use"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Optimising Programs and Performance",
        "xp": 110,
        "content": {
          "explanation": "Optimisation means making your program faster, use less memory, or use less battery. Sometimes a slow program is fast enough — optimisation is only worth doing when performance actually matters. The golden rule: first make it work, then make it fast.\n\nProfiling tells you WHERE your program is slow — which functions consume the most time. Without profiling, you might optimise the wrong code. A common mistake: spending hours optimising a function that takes 0.001% of execution time.\n\nFor robot programs, optimisation often means: fewer sensor reads (each takes time), smarter algorithms (fewer movements save battery), efficient data structures (faster lookups), and lazy evaluation (don't calculate what you don't need).",
          "example": "# Profiling: find where time is being spent\nimport time\n\nstart = time.time()\nslow_function()         # The one to profile\nelapsed = time.time() - start\nprint(f'Took {elapsed:.3f} seconds')\n\n# Optimisation: cache expensive calculations\n_distance_cache = {}\ndef getDistance(x1,y1,x2,y2):\n    key = (x1,y1,x2,y2)\n    if key in _distance_cache:\n        return _distance_cache[key]  # Already calculated!\n    result = ((x2-x1)**2 + (y2-y1)**2)**0.5\n    _distance_cache[key] = result\n    return result\n\n# Optimisation: choose right data structure\n# List lookup: O(n) — slow for large collections\n# Set/dict lookup: O(1) — always fast!",
          "activity": "Time your bubble sort vs Python's built-in sort on a list of 10,000 random numbers. How many times faster is the built-in? Now time your linear search vs Python's 'in' operator on a set of 10,000 items. What does this reveal about data structures?",
          "keyWords": [
            "optimisation",
            "profiling",
            "cache",
            "time complexity",
            "memory",
            "bottleneck",
            "benchmark",
            "lazy evaluation"
          ],
          "activities": [
            {
              "num": 1,
              "title": "The Golden Rule of Optimisation",
              "duration": "15 mins",
              "desc": "Know when and what to optimise",
              "steps": [
                "'Premature optimisation is the root of all evil' (Donald Knuth)",
                "First: make it correct. Second: make it fast (only if needed)",
                "Profiling: time individual functions to find real bottlenecks",
                "Common mistake: optimise wrong code, waste hours, no improvement",
                "Rule: measure first, then optimise only what matters"
              ]
            },
            {
              "num": 2,
              "title": "Time Your Programs",
              "duration": "15 mins",
              "desc": "Profile and measure performance",
              "steps": [
                "Use time.time() to measure function duration",
                "Benchmark bubble sort vs sorted() on 5,000 numbers",
                "Measure: linear search in list vs lookup in set (1,000 items)",
                "Record results in a table: algorithm, data size, time",
                "Which optimisation gave the biggest improvement?"
              ]
            },
            {
              "num": 3,
              "title": "Apply Optimisation Techniques",
              "duration": "15 mins",
              "desc": "Improve real programs",
              "steps": [
                "Technique 1: Caching (memoization) — save computed results",
                "Technique 2: Right data structure — set for lookups, list for sequences",
                "Technique 3: Avoid re-computation in loops (calculate outside the loop)",
                "Technique 4: Break early — return as soon as answer is found",
                "Apply two techniques to a robot program and measure improvement"
              ]
            }
          ],
          "extension": "Implement an A* pathfinding algorithm for robot navigation on a grid. Compare its performance to a brute-force path search. Measure both on grids of increasing size (5×5, 10×10, 20×20). Plot the comparison.",
          "reflection": "Research how game engines optimise real-time 3D rendering for 60+ frames per second. What optimisation techniques do they use? How do concepts like frustum culling, level of detail, and object pooling relate to principles you learned today?",
          "objectives": [
            "Apply profiling to identify performance bottlenecks",
            "Implement caching optimisation",
            "Choose data structures for performance",
            "Apply time complexity knowledge to optimisation decisions"
          ],
          "ukCurriculum": [
            "Optimise programs for efficiency",
            "Apply professional performance techniques",
            "Understand the importance of profiling before optimising"
          ]
        },
        "quiz": [
          {
            "q": "The golden rule of optimisation is...",
            "options": [
              "Always optimise from the start",
              "Optimise every function you write",
              "First make it work correctly, then profile to find real bottlenecks, then optimise only those",
              "Optimise using only loops"
            ],
            "answer": 1
          },
          {
            "q": "What does profiling tell you?",
            "options": [
              "How to write faster code",
              "Where your program actually spends its time — identifying real bottlenecks",
              "How much memory a program uses",
              "Whether your program is correct"
            ],
            "answer": 1
          },
          {
            "q": "Why is set lookup O(1) while list lookup is O(n)?",
            "options": [
              "Sets are smaller",
              "Lists are stored sorted",
              "Sets use a hash table, allowing direct access by value; lists must scan each item sequentially",
              "Sets are always in memory"
            ],
            "answer": 2
          },
          {
            "q": "Caching (memoization) improves performance by...",
            "options": [
              "Making functions shorter",
              "Storing previously computed results and reusing them instead of recalculating",
              "Using less memory",
              "Making loops faster"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Network Programming",
        "xp": 110,
        "content": {
          "explanation": "Modern robots do not work in isolation. They connect to the internet to download maps, upload sensor data, receive remote commands, and coordinate with other robots. Network programming — writing code that communicates over networks — is an essential skill.\n\nHTTP (HyperText Transfer Protocol) is how web browsers communicate with web servers. A GET request asks for data; a POST request sends data. REST APIs use HTTP to enable programs to communicate with web services — like a weather API that returns current conditions, or a robot fleet management API.\n\nFor security, network communication must be authenticated (prove who you are), authorised (prove you have permission), and encrypted (HTTPS). A robot that broadcasts unencrypted data over WiFi is a security risk — anyone nearby could read it or interfere with it.",
          "example": "# HTTP request to a web API in Python:\nimport urllib.request, json\n\n# GET request: fetch data from a web API\nurl = 'https://api.example.com/robots/status'\nwith urllib.request.urlopen(url) as response:\n    data = json.loads(response.read())\n    print(data['battery'])    # Use the JSON data\n\n# Simulated robot API:\n# GET  /api/robots/1       → get robot 1 status\n# POST /api/robots/1/move  → send move command\n# GET  /api/robots/1/log   → get sensor log\n# Each response is JSON: {status: 'ok', data: {...}}",
          "activity": "Build a simple local robot command server using Python's http.server module. Your server should respond to GET /status (return battery and position) and POST /move (accept direction and distance). Test with a browser or Python requests.",
          "keyWords": [
            "HTTP",
            "GET",
            "POST",
            "REST API",
            "JSON",
            "network",
            "server",
            "client",
            "request",
            "response"
          ],
          "activities": [
            {
              "num": 1,
              "title": "How the Web Works",
              "duration": "15 mins",
              "desc": "Understand HTTP communication",
              "steps": [
                "Browser types URL → sends HTTP GET request to server",
                "Server processes request → sends HTTP response with HTML/JSON",
                "Every web interaction is request-response",
                "Show: what happens when you visit bytebuddies.technology?",
                "Real robot APIs work the same way — just data instead of HTML"
              ]
            },
            {
              "num": 2,
              "title": "Make API Requests in Python",
              "duration": "20 mins",
              "desc": "Fetch data from a web service",
              "steps": [
                "Use urllib to make a GET request to a public JSON API",
                "Parse JSON response: data = json.loads(response)",
                "Extract: print the relevant data fields",
                "Handle error: what if the server is down?",
                "Discuss: robot could fetch its next assignment from a cloud API"
              ]
            },
            {
              "num": 3,
              "title": "Design a Robot REST API",
              "duration": "10 mins",
              "desc": "Think like an API designer",
              "steps": [
                "Design REST API endpoints for a robot fleet system",
                "GET /robots: list all robots",
                "GET /robots/1: get robot 1 status",
                "POST /robots/1/command: send a command",
                "DELETE /robots/1/log: clear robot 1's log",
                "What data format would each endpoint use?"
              ]
            }
          ],
          "extension": "Build a working robot telemetry dashboard: a Python HTTP server that receives POST requests from a simulated robot (sending position and battery data every second), stores the history, and responds to GET requests with the last 10 readings as JSON.",
          "reflection": "Research how Tesla's cars communicate over the internet — they download software updates, upload driving data, and can be remotely commanded. What security measures protect these communications? What could happen if the communication was not secured?",
          "objectives": [
            "Understand HTTP request-response communication",
            "Make API calls in Python",
            "Design REST API endpoints",
            "Understand authentication and security in network programming"
          ],
          "ukCurriculum": [
            "Understand network communication protocols",
            "Apply networking to robot systems",
            "Prepare for web development and advanced networking concepts"
          ]
        },
        "quiz": [
          {
            "q": "What does a GET request do?",
            "options": [
              "Sends data to a server",
              "Deletes data on a server",
              "Requests data FROM a server",
              "Updates data on a server"
            ],
            "answer": 2
          },
          {
            "q": "JSON is used in web APIs because...",
            "options": [
              "It is the fastest data format",
              "It is human-readable and language-independent — any programming language can parse it",
              "Python requires it",
              "It is encrypted"
            ],
            "answer": 1
          },
          {
            "q": "What is a REST API?",
            "options": [
              "A robot programming language",
              "A web interface that allows programs to communicate using HTTP requests and responses",
              "A type of database",
              "A sorting algorithm"
            ],
            "answer": 1
          },
          {
            "q": "Why must robot network communication be encrypted?",
            "options": [
              "To make it faster",
              "Unencrypted data can be read or tampered with by anyone within network range",
              "Encryption is required by Python",
              "Robots cannot use WiFi without encryption"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Data Analysis and Machine Learning Introduction",
        "xp": 110,
        "content": {
          "explanation": "Data science means extracting knowledge and insight from data. Machine learning is a subset of data science where computers learn patterns from data instead of following explicitly programmed rules.\n\nA simple machine learning idea: train a robot to recognise obstacles by collecting thousands of sensor readings labelled 'obstacle' or 'clear'. The ML model learns which sensor patterns predict obstacles. Then, when it sees a new pattern, it predicts whether there is an obstacle — without you having to program all the rules yourself.\n\nYou will not train real ML models in this lesson (that requires much more data and computing power), but you will understand the core ideas: training data, features, model training, and prediction. These concepts underpin every AI system in the world today.",
          "example": "# Simple nearest-neighbour classifier (ML basics):\n# Training data: [features] → label\ntraining = [\n    {'distance': 45, 'light': 80, 'label': 'clear'},\n    {'distance': 12, 'light': 75, 'label': 'obstacle'},\n    {'distance': 8,  'light': 70, 'label': 'obstacle'},\n    {'distance': 50, 'light': 85, 'label': 'clear'},\n]\n\ndef predict(distance, light, k=1):\n    # Find k nearest training examples and vote\n    distances = [(abs(t['distance']-distance)+abs(t['light']-light),\n                  t['label']) for t in training]\n    distances.sort()\n    return distances[0][1]  # Nearest neighbour's label\n\nprint(predict(15, 72))  # → 'obstacle' (close to examples 2,3)",
          "activity": "Collect 20 sensor readings from a robot simulation, labelled 'obstacle' (distance < 25) or 'clear'. Implement a nearest-neighbour classifier. Test it with 5 new readings. Calculate accuracy: (correct predictions / total) × 100%.",
          "keyWords": [
            "machine learning",
            "training data",
            "features",
            "classifier",
            "prediction",
            "model",
            "nearest neighbour",
            "accuracy",
            "AI"
          ],
          "activities": [
            {
              "num": 1,
              "title": "What is Machine Learning?",
              "duration": "15 mins",
              "desc": "Understand the ML paradigm",
              "steps": [
                "Traditional programming: programmer writes rules explicitly",
                "Machine learning: system learns rules from examples",
                "Example: spam filter — learns which emails are spam from thousands of examples",
                "Example: image recognition — learns what cats look like from millions of cat photos",
                "Robot example: learns to recognise obstacles without hard-coded distance thresholds"
              ]
            },
            {
              "num": 2,
              "title": "Collect and Prepare Training Data",
              "duration": "20 mins",
              "desc": "Build a labelled dataset",
              "steps": [
                "Run robot simulation: collect 20 sensor readings (distance, light level)",
                "Label each: 'obstacle' (distance < 25) or 'clear' (distance >= 25)",
                "Discuss: these labels are the ground truth we learn from",
                "Split data: 15 training examples, 5 test examples",
                "Visualise: plot distance vs light, colour by label"
              ]
            },
            {
              "num": 3,
              "title": "Implement and Evaluate Classifier",
              "duration": "10 mins",
              "desc": "Build and test a simple ML model",
              "steps": [
                "Implement nearest-neighbour classifier",
                "Find the training example with closest features to new input",
                "Predict same label as the nearest neighbour",
                "Test on 5 held-out examples — count correct predictions",
                "Calculate accuracy: how well does the model perform?"
              ]
            }
          ],
          "extension": "Research k-NN classification (k nearest neighbours): instead of the 1 nearest neighbour, use k=3 (majority vote from 3 nearest). Implement k=3 and k=5. Which k gives better accuracy on your 5 test examples?",
          "reflection": "Research one real-world application of machine learning that affects your daily life (recommendation systems, voice assistants, image filters, fraud detection). What training data was used? What does the model predict? What could go wrong if the model is biased?",
          "objectives": [
            "Understand core machine learning concepts",
            "Implement a simple nearest-neighbour classifier",
            "Collect and label training data",
            "Evaluate model accuracy"
          ],
          "ukCurriculum": [
            "Understand how AI systems learn from data",
            "Apply data science to robotics",
            "Prepare for secondary school AI and data science topics"
          ]
        },
        "quiz": [
          {
            "q": "What makes machine learning different from traditional programming?",
            "options": [
              "ML programs are shorter",
              "In ML, the system learns patterns from data rather than following explicitly programmed rules",
              "ML always uses Python",
              "Traditional programming cannot solve the same problems"
            ],
            "answer": 1
          },
          {
            "q": "Training data in machine learning is...",
            "options": [
              "Random data used to test the program",
              "Labelled examples from which the ML model learns patterns",
              "The final output of the model",
              "Data the model is never shown"
            ],
            "answer": 1
          },
          {
            "q": "In nearest-neighbour classification, a new input is classified as...",
            "options": [
              "The most common label in all training data",
              "The opposite of the nearest training example",
              "The same label as the training example with the most similar features",
              "A random label"
            ],
            "answer": 2
          },
          {
            "q": "Model 'accuracy' is measured as...",
            "options": [
              "Speed of classification",
              "Number of training examples",
              "Correct predictions divided by total predictions, as a percentage",
              "Memory used"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Autonomous Robot Systems",
        "xp": 110,
        "content": {
          "explanation": "An autonomous system operates independently without human input. Modern autonomous robots — from self-driving cars to warehouse robots to Mars rovers — combine everything you have learned: sensors, algorithms, OOP, data analysis, networking, and ML.\n\nAutonomy requires robust software design. If the program crashes or freezes, the robot is in trouble. Autonomous systems must: handle sensor failures gracefully, recover from unexpected situations, maintain safe behaviour even when something goes wrong, and communicate their status so humans can monitor them.\n\nBehavior trees are a design pattern for autonomous robots: a hierarchy of conditions and actions that determines what the robot does in any situation. Unlike simple state machines, behavior trees are modular and easy to extend — you add a new branch without changing existing code.",
          "example": "# Behavior tree for autonomous robot:\nclass BehaviourTree:\n    def tick(self, robot):\n        # Priority: safety first\n        if robot.batteryLevel < 10:\n            return robot.returnToBase()\n        if robot.obstacleDetected():\n            return robot.avoidObstacle()\n        if robot.isAtGoal():\n            return robot.collectItem()\n        # Default: navigate to next goal\n        return robot.navigateToNextGoal()\n\n# Main loop: tick the behavior tree every 0.1 seconds\nwhile robot.isActive():\n    bt.tick(robot)\n    time.sleep(0.1)",
          "activity": "Implement a simple behavior tree for a robot with 4 behaviors (priority order): returnHome if battery < 15%, avoidObstacle if obstacle < 20cm, collectItem if at goal, else navigate. Test all 4 paths work correctly.",
          "keyWords": [
            "autonomous",
            "behavior tree",
            "state machine",
            "priority",
            "safety",
            "robust",
            "monitoring",
            "graceful degradation"
          ],
          "activities": [
            {
              "num": 1,
              "title": "What Makes a System Autonomous?",
              "duration": "15 mins",
              "desc": "Understand requirements for autonomy",
              "steps": [
                "Autonomous = operates without continuous human input",
                "Requires: sensing (know the world), planning (decide what to do), acting (do it)",
                "Must handle failures: sensor error, unexpected obstacle, low battery",
                "Safety-critical: a robot that freezes in dangerous position is dangerous",
                "Key design: fail-safe (when in doubt, do the safest thing)"
              ]
            },
            {
              "num": 2,
              "title": "Implement a Behavior Tree",
              "duration": "20 mins",
              "desc": "Build the control architecture",
              "steps": [
                "Define 4 behaviors as Python functions: returnHome, avoidObstacle, collectItem, navigate",
                "Build BehaviorTree class with tick() method",
                "Tick runs every 0.1 seconds in main loop",
                "Priority order: safety first, then mission, then navigation",
                "Test each branch: simulate low battery, obstacle, goal reached, no goal"
              ]
            },
            {
              "num": 3,
              "title": "Test Robustness",
              "duration": "10 mins",
              "desc": "Verify safe behavior in edge cases",
              "steps": [
                "Test: battery = 9 → must return home (even if goal is right there!)",
                "Test: obstacle appears while collecting → must avoid first",
                "Test: sensor read fails → program must not crash",
                "Test: goal not reachable → robot should stop and alert (not spin forever)",
                "Discuss: what makes autonomous systems trustworthy?"
              ]
            }
          ],
          "extension": "Extend your behavior tree with a new branch: if two obstacles are detected simultaneously (left AND right sensors), stop and alert for human help. This is a 'stuck' detection. Add a recovery behavior: back up and turn 90° before re-attempting navigation.",
          "reflection": "Research the autonomy levels for self-driving cars (SAE levels 0-5). At what level are current commercial vehicles? What technical challenges remain for fully autonomous (Level 5) vehicles? What role do behavior trees or similar architectures play?",
          "objectives": [
            "Design and implement behavior trees for autonomous robots",
            "Handle sensor failures and edge cases gracefully",
            "Understand safety requirements for autonomous systems",
            "Test robustness of autonomous programs"
          ],
          "ukCurriculum": [
            "Design complex autonomous robot systems",
            "Apply all Year 6 concepts to autonomous programming",
            "Understand safety-critical software requirements"
          ]
        },
        "quiz": [
          {
            "q": "What does 'graceful degradation' mean for a robot?",
            "options": [
              "The robot becomes prettier when things go wrong",
              "When something fails, the robot falls back to safe minimal behavior rather than crashing completely",
              "The robot stops permanently on any error",
              "Degradation is always catastrophic"
            ],
            "answer": 1
          },
          {
            "q": "In a behavior tree, behaviors should be ordered by...",
            "options": [
              "Alphabetical order",
              "Random order",
              "Priority — most critical behaviors (safety) checked first",
              "Fastest behaviors first"
            ],
            "answer": 2
          },
          {
            "q": "Why must every autonomous system have a 'fail-safe' mode?",
            "options": [
              "Fail-safe is optional for robots",
              "In unexpected situations, a predictable safe behavior prevents harm — a robot that does nothing dangerous when confused is better than one that does something random",
              "Fail-safe modes are too slow",
              "Autonomous systems never fail"
            ],
            "answer": 1
          },
          {
            "q": "What is the main advantage of a behavior tree over a simple if/else chain?",
            "options": [
              "Behavior trees are faster",
              "Behavior trees are modular — new behaviors can be added as branches without changing existing code",
              "There is no advantage",
              "Behavior trees use less memory"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Capstone Project: Complete Robot System",
        "xp": 115,
        "content": {
          "explanation": "You have reached the capstone of four years of computing. This project brings together everything: algorithms, OOP, data structures, file I/O, databases, networking, encryption, data analysis, and autonomous systems design.\n\nYour challenge: design and build a complete, autonomous robot system that solves a real problem. You choose the problem. You design the architecture. You write the code, test it thoroughly, analyse performance data, and present it professionally.\n\nThis is how real engineering works. You are not just a student doing exercises — you are an engineer solving a problem. The skills you have built over four years are real. The code you write this week is the best evidence of what you can do.",
          "example": "// Capstone project options:\n// Option A: Agricultural inspection robot\n//   - Navigate grid systematically\n//   - Detect and log 'unhealthy' zones (color sensor)\n//   - Avoid obstacles, return when battery low\n//   - Generate report with statistics and visualisation\n\n// Option B: Warehouse automation system\n//   - Multiple robots coordinated over network\n//   - Collect items, avoid each other, optimise routes\n//   - Database logging, performance dashboard\n\n// Option C: Environmental monitoring station\n//   - Collect data over time, store in database\n//   - Detect anomalies (data analysis)\n//   - Send alerts via network API\n//   - Visualise trends over time",
          "activity": "Choose your capstone project. Write formal requirements. Design the architecture. Build modularly. Test each component. Integrate and test the full system. Present with a live demonstration and a written technical report.",
          "keyWords": [
            "capstone",
            "project",
            "system",
            "requirements",
            "architecture",
            "integration",
            "demonstration",
            "professional"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Choose Project and Write Requirements",
              "duration": "20 mins",
              "desc": "Define what you will build",
              "steps": [
                "Review project options (or propose your own to teacher)",
                "Choose based on what excites you most",
                "Write 5-8 formal requirements: 'The system shall...'",
                "Each requirement must be specific and testable",
                "Define: what does success look like? How will you know when done?"
              ]
            },
            {
              "num": 2,
              "title": "Design and Build",
              "duration": "30 mins",
              "desc": "Architect and code your system",
              "steps": [
                "Draw architecture diagram: modules, data flow, interfaces",
                "Code modularly: navigation, sensors, data, UI separately",
                "Test each module as you build it (don't wait until the end!)",
                "Use OOP, functions, databases, file I/O appropriately",
                "After each module: quick smoke test before moving to next"
              ]
            },
            {
              "num": 3,
              "title": "Integrate, Test, and Present",
              "duration": "25 mins",
              "desc": "Complete and showcase",
              "steps": [
                "Integration test: all modules together",
                "Validate against requirements: does each FR pass?",
                "Measure performance: any bottlenecks to optimise?",
                "Prepare 3-minute presentation: problem, approach, demo, learnings",
                "Present to class — celebrate four years of growth!"
              ]
            }
          ],
          "extension": "Write a technical report for your capstone project: (1) Problem statement, (2) System requirements, (3) Architecture description, (4) Key algorithms used, (5) Test results, (6) Lessons learned, (7) Future improvements. This is a professional engineering document.",
          "reflection": "Imagine you are presenting your project to a panel of engineers from a robotics company for a summer internship. What would you emphasise? What questions would they ask? Prepare answers to five likely technical questions about your system.",
          "objectives": [
            "Apply all four years of computing to a complete project",
            "Design, build, test, and document a real system",
            "Present technical work professionally",
            "Celebrate four years of computing growth"
          ],
          "ukCurriculum": [
            "Demonstrate mastery of all KS2 computing objectives",
            "Apply computing to solve real-world problems",
            "Prepare for secondary school computing and beyond"
          ]
        },
        "quiz": [
          {
            "q": "What is the most important thing to do BEFORE writing any code for a large project?",
            "options": [
              "Choose your programming language",
              "Write formal, testable requirements that define exactly what success looks like",
              "Find the most complex algorithm",
              "Start with the hardest module"
            ],
            "answer": 1
          },
          {
            "q": "Why test each module BEFORE integrating them all?",
            "options": [
              "Module testing is optional",
              "Finding bugs in a single module is much easier than finding them in an integrated system",
              "Integration testing is faster",
              "Modules don't need testing if the code looks right"
            ],
            "answer": 1
          },
          {
            "q": "What makes a technical presentation compelling?",
            "options": [
              "Using as many technical words as possible",
              "A clear problem statement, a live demonstration, and honest discussion of challenges and learnings",
              "Being very long and detailed",
              "Only showing the parts that worked perfectly"
            ],
            "answer": 1
          },
          {
            "q": "What is a 'technical report' for a software project?",
            "options": [
              "A marketing document",
              "A document describing the problem, design decisions, implementation, test results, and lessons learned",
              "A list of bugs found",
              "A presentation slide deck"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Ethics in Computing and AI",
        "xp": 110,
        "content": {
          "explanation": "Computing is not neutral. Every algorithm encodes choices about what matters, whose data is used, and whose interests are served. As algorithms make more decisions — who gets a loan, which job application succeeds, what news you see — the ethics of computing become critically important.\n\nBias in AI occurs when training data reflects historical inequalities. An AI trained on past hiring decisions might learn to discriminate just as its trainers did. This is not a theoretical problem — real AI systems have shown documented bias in facial recognition, loan approval, and criminal justice.\n\nDigital rights — privacy, the right to explanation when an algorithm decides about you, the right to human review — are becoming as fundamental as traditional civil rights. Being a responsible programmer means thinking about who your code affects, and whether those effects are fair.",
          "example": "# Thinking about algorithmic bias:\n# Scenario: AI scores loan applications\n# Training data: historical approved loans\n# Problem: data reflects past discrimination\n# Result: AI learns and replicates the bias\n\n# Responsible AI design:\n# - Use representative, diverse training data\n# - Audit decisions regularly across demographic groups\n# - Provide human review for borderline decisions\n# - Explain WHY a decision was made (transparency)\n# - Allow people to appeal algorithmic decisions\n# - Monitor outcomes after deployment",
          "activity": "Analyse a hypothetical AI hiring system. What data would it use? What biases could it learn? Design 3 concrete safeguards. Present your findings to the class.",
          "keyWords": [
            "ethics",
            "bias",
            "fairness",
            "privacy",
            "transparency",
            "algorithmic decision",
            "digital rights",
            "responsibility"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Algorithms That Make Decisions",
              "duration": "15 mins",
              "desc": "Understand the real-world stakes",
              "steps": [
                "List AI systems making decisions: loan approval, job screening, medical diagnosis, parole",
                "Who benefits? Who might be harmed?",
                "Should you have the right to know an algorithm decided about you?",
                "Should humans always be able to override AI?",
                "Discuss: is there such a thing as a truly neutral algorithm?"
              ]
            },
            {
              "num": 2,
              "title": "Bias in Training Data",
              "duration": "20 mins",
              "desc": "Understand how AI learns harmful patterns",
              "steps": [
                "Facial recognition case: trained mostly on lighter-skinned faces, worse accuracy on others",
                "Amazon's AI hiring tool: trained on biased historical data, discriminated against women (discontinued)",
                "Why it happens: training data reflects past inequalities",
                "How to reduce it: diverse training data, regular fairness audits, transparency requirements",
                "Who is responsible: the programmers? The company? The buyers of the system?"
              ]
            },
            {
              "num": 3,
              "title": "Design Ethical Guidelines",
              "duration": "10 mins",
              "desc": "Apply ethics to real design decisions",
              "steps": [
                "Task: design ethical guidelines for a school AI recommending which students get extra help",
                "Must be: accurate, unbiased across all groups, transparent, appealable",
                "What data should NOT be used? (postcode, names, parents' jobs?)",
                "How would you test for fairness?",
                "Present your ethical framework to the class"
              ]
            }
          ],
          "extension": "Research the EU AI Act (2024). What categories of high-risk AI does it restrict? What transparency rights does it give citizens? Write a short opinion: do these regulations go far enough? Too far?",
          "reflection": "If you were designing a completely fair AI system for university admissions, what principles would guide it? What data would you use? What would you refuse to use? How would you prove it is fair?",
          "objectives": [
            "Understand ethical implications of algorithms and AI",
            "Recognise and analyse bias in computing systems",
            "Understand digital rights and responsibilities",
            "Apply ethical thinking to computing design"
          ],
          "ukCurriculum": [
            "Understand responsible use of technology",
            "Recognise social and ethical impact of computing",
            "Apply ethical principles to computing design"
          ]
        },
        "quiz": [
          {
            "q": "Algorithmic bias means:",
            "options": [
              "A programming bug",
              "When AI produces unfair outcomes for certain groups due to skewed training data",
              "An intentional feature",
              "Only affects old systems"
            ],
            "answer": 1
          },
          {
            "q": "An AI trained on historically biased data will:",
            "options": [
              "Automatically correct the bias",
              "Neutralise all inequalities",
              "Learn and replicate the same discriminatory patterns",
              "Always be fair"
            ],
            "answer": 2
          },
          {
            "q": "Algorithmic transparency means:",
            "options": [
              "Open-source code",
              "People can understand and question how an algorithm made a decision about them",
              "Making algorithms run faster",
              "Publishing training data"
            ],
            "answer": 1
          },
          {
            "q": "The most important safeguard for high-stakes AI decisions is:",
            "options": [
              "Making it faster",
              "Keeping the algorithm secret",
              "Allowing humans to review, understand, and appeal decisions",
              "Using more data"
            ],
            "answer": 2
          }
        ]
      },
      {
        "title": "Version Control and Collaborative Development",
        "xp": 105,
        "content": {
          "explanation": "Every professional programmer uses version control. Git tracks every change to every file — who changed it, when, why, and what was changed. If a change breaks something, you can instantly revert to any previous version. Git also makes team collaboration possible: it manages simultaneous changes from multiple developers.\n\nGit was created by Linus Torvalds (creator of Linux) in 2005. GitHub hosts millions of repositories and enables global open-source collaboration. Python, Linux, and countless other projects are developed openly on GitHub with thousands of contributors from around the world.\n\nVersion control changes how you think about work: nothing is permanently lost, experiments are safe, and changes are documented with messages explaining WHY. These habits distinguish professional developers from beginners.",
          "example": "# Core Git workflow:\n# 1. Initialise a repository:\n#    git init\n\n# 2. Stage and commit changes:\n#    git add robot.py\n#    git commit -m 'Fix obstacle detection threshold'\n#    (commit message: WHY you changed, not just what)\n\n# 3. View history:\n#    git log --oneline\n\n# 4. Create a branch for experiments:\n#    git checkout -b sensor-improvement\n\n# 5. Merge when done:\n#    git checkout main\n#    git merge sensor-improvement\n\n# 6. Share on GitHub:\n#    git push origin main",
          "activity": "Practice the Git workflow on your robot project: init, make 3 commits with meaningful messages, create a branch to try a new feature, then merge it back. Write commit messages that explain WHY you made each change.",
          "keyWords": [
            "git",
            "version control",
            "commit",
            "branch",
            "merge",
            "repository",
            "history",
            "GitHub",
            "open source"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Why Version Control Matters",
              "duration": "15 mins",
              "desc": "Understand the problem Git solves",
              "steps": [
                "Without version control: file_v1.py, file_v2.py, file_FINAL_ACTUALFINAL.py...",
                "Everyone has experienced this chaos!",
                "Git solution: one file, complete history of every change",
                "Scenario: your robot code breaks — Git shows you exactly what changed",
                "Open source: thousands of people collaborating on one codebase via Git"
              ]
            },
            {
              "num": 2,
              "title": "Core Git Commands",
              "duration": "20 mins",
              "desc": "Practice the essential workflow",
              "steps": [
                "git init: create a new repository",
                "git add filename: stage changes",
                "git commit -m 'message': save a snapshot with description",
                "git log --oneline: see history",
                "Practice: create repo, add robot.py, make 3 commits with clear 'why' messages"
              ]
            },
            {
              "num": 3,
              "title": "Branches and Merging",
              "duration": "10 mins",
              "desc": "Experiment safely with branches",
              "steps": [
                "Branch: independent copy for experimentation or features",
                "git checkout -b new-feature: create branch",
                "Make changes without affecting main code",
                "Test changes thoroughly on the branch",
                "git merge new-feature: bring it back when ready"
              ]
            }
          ],
          "extension": "Collaborative exercise: one student creates a repo, another forks it and modifies a function, then creates a pull request. The first student reviews, requests one change, then approves. This is exactly how open-source software development works!",
          "reflection": "Research the Linux kernel development process. How many contributors are active? How do changes get reviewed and approved? How many lines of code are added and removed each day? What does this tell you about the power of version control for large projects?",
          "objectives": [
            "Understand version control and why it is essential for programming",
            "Learn core Git commands (init, add, commit, log, branch, merge)",
            "Understand branching for safe experimentation",
            "Apply version control concepts to robot programming projects"
          ],
          "ukCurriculum": [
            "Understand professional software development tools",
            "Apply version control to collaborative work",
            "Prepare for real-world computing environments"
          ]
        },
        "quiz": [
          {
            "q": "What does a Git 'commit' represent?",
            "options": [
              "An error",
              "A saved snapshot of code at a specific moment with a description of what changed and why",
              "Sending code to GitHub",
              "Deleting old files"
            ],
            "answer": 1
          },
          {
            "q": "Why are Git 'branches' useful?",
            "options": [
              "They make Git faster",
              "They allow independent work on a feature without risking the main working code",
              "Required for all commits",
              "They replace commits"
            ],
            "answer": 1
          },
          {
            "q": "What makes a good Git commit message?",
            "options": [
              "Using technical jargon",
              "Being as short as possible (e.g. 'fix')",
              "Explaining WHY the change was made, not just what (e.g. 'Fix sensor threshold to prevent false stops')",
              "Using today's date"
            ],
            "answer": 2
          },
          {
            "q": "A 'pull request' on GitHub is:",
            "options": [
              "Downloading code",
              "A request for team members to review your branch and approve merging it",
              "A type of bug",
              "A mandatory step before committing"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Project Planning and Software Engineering",
        "xp": 110,
        "content": {
          "explanation": "Professional software engineering is much more than writing code. It requires understanding real user needs, planning architecture, managing risks and timelines, communicating with stakeholders, and adapting when requirements change. These are skills as important as any algorithm.\n\nAgile methodology is the dominant approach in modern software companies. Instead of planning everything upfront, you work in short sprints (1-2 weeks), deliver working software at each sprint's end, get user feedback, and adapt your plan. This means you can respond to change and deliver value early rather than presenting everything at once months later.\n\nUser stories capture requirements from the user's perspective: 'As a teacher, I want to see each student's lesson progress so that I can identify who needs extra support.' This keeps development focused on genuine needs rather than imagined features.",
          "example": "// Software engineering process:\n// DISCOVER: Who are users? What problem? What is success?\n// DESIGN: Architecture, user stories, sprint plan\n// BUILD: Sprints of 1-2 weeks, working software each time\n// TEST: Automated + manual testing throughout\n// DELIVER: Deploy to users, gather feedback\n// MAINTAIN: Fix bugs, add features based on real usage\n\n// User story format:\n// 'As a [user], I want [feature] so that [benefit]'\n// Example:\n// As a student, I want to see my XP so that I feel motivated\n// As a teacher, I want class reports so that I can track progress\n// As a parent, I want to see my child's achievements so that I can celebrate with them",
          "activity": "Write 5 user stories for a robot teaching platform. Estimate complexity (small/medium/large). Plan a 2-week sprint: which stories fit? Create a sprint board with To Do / In Progress / Done columns.",
          "keyWords": [
            "agile",
            "sprint",
            "user story",
            "stakeholder",
            "requirements",
            "software engineering",
            "retrospective",
            "backlog"
          ],
          "activities": [
            {
              "num": 1,
              "title": "What is Software Engineering?",
              "duration": "15 mins",
              "desc": "Understand the full development process",
              "steps": [
                "Show: Discovery, Design, Build, Test, Release, Maintain — the full lifecycle",
                "Compare to your own projects — you have been following this process!",
                "Stakeholders: who cares about the software? (users, teachers, parents, school)",
                "Good software: meets real needs, is reliable, and can grow",
                "Failure modes: building the wrong thing, building the right thing badly"
              ]
            },
            {
              "num": 2,
              "title": "Write User Stories",
              "duration": "20 mins",
              "desc": "Capture requirements from users",
              "steps": [
                "Template: As a [user], I want [feature] so that [benefit]",
                "Write 5 user stories for a robot learning app: teacher, student, parent, admin",
                "Estimate complexity: small (1 day), medium (3 days), large (7 days)",
                "Prioritise: which stories deliver most value to real users first?",
                "Identify dependencies: which stories must be done before others?"
              ]
            },
            {
              "num": 3,
              "title": "Sprint Planning Exercise",
              "duration": "10 mins",
              "desc": "Plan like a real development team",
              "steps": [
                "You have 10 days and a team of 3 people",
                "Which stories fit in this sprint? (small=1day, medium=3, large=7)",
                "Create sprint board: To Do, In Progress, Done",
                "Daily stand-up: what did I do? What today? Any blockers?",
                "Sprint review: demo to class, get feedback, plan next sprint"
              ]
            }
          ],
          "extension": "Research Scrum: what are the specific roles (Product Owner, Scrum Master, Development Team), artifacts (Product Backlog, Sprint Backlog), and ceremonies (Daily Stand-up, Sprint Review, Retrospective)? How does Scrum compare to traditional 'waterfall' planning?",
          "reflection": "You are pitching ByteBuddies to your school's head teacher. Write a 2-minute pitch: what problem does it solve? Who benefits and how? What evidence shows it works? What does successful adoption look like in one year's time?",
          "objectives": [
            "Understand agile software development methodology",
            "Write user stories from stakeholder perspectives",
            "Plan sprints and prioritise work",
            "Apply project management to computing projects"
          ],
          "ukCurriculum": [
            "Apply professional software engineering practices",
            "Understand how real software is built and delivered",
            "Prepare for computing in secondary school and beyond"
          ]
        },
        "quiz": [
          {
            "q": "A user story follows the format:",
            "options": [
              "Bug: [description], Fix: [solution]",
              "As a [user], I want [feature] so that [benefit]",
              "Feature name: [name], Priority: [level]",
              "Step 1: [action], Step 2: [result]"
            ],
            "answer": 1
          },
          {
            "q": "An agile 'sprint' is:",
            "options": [
              "A very fast algorithm",
              "A short, fixed-duration cycle (1-2 weeks) that produces working software and gets user feedback",
              "A type of team meeting",
              "A testing methodology"
            ],
            "answer": 1
          },
          {
            "q": "The main advantage of agile over 'plan everything upfront' is:",
            "options": [
              "Agile requires less work",
              "You can respond to feedback and changing needs, delivering value early instead of everything at once",
              "Traditional planning always produces better software",
              "Agile needs fewer team members"
            ],
            "answer": 1
          },
          {
            "q": "A sprint retrospective is for:",
            "options": [
              "Demonstrating completed features to stakeholders",
              "The team reflecting on what went well and what to improve to continuously get better",
              "Estimating the next sprint's work",
              "Writing user stories"
            ],
            "answer": 1
          }
        ]
      },
      {
        "title": "Professional Practices and Looking Ahead",
        "xp": 100,
        "content": {
          "explanation": "You have completed four years of computing education. You have gone from writing your first algorithm to building autonomous robotic systems. You understand algorithms, OOP, data structures, cybersecurity, machine learning, databases, networking, and professional coding practices. That is an extraordinary achievement.\n\nProfessional programmers continue learning throughout their careers. Technology changes rapidly: the Python you have learned will serve you in secondary school and beyond, but new languages, frameworks, and paradigms keep emerging. The most important skill you have developed is not any specific language feature — it is computational thinking: the ability to break complex problems into manageable parts, design systematic solutions, and evaluate trade-offs.\n\nComputing offers some of the most exciting career opportunities in the world. Robotics, artificial intelligence, cybersecurity, game development, medical technology, climate science, and countless other fields all need people who can think computationally and code. You are ready.",
          "example": "// Four years of skills:\n// Year 3: Algorithms, sequences, loops, variables, conditionals, debugging\n// Year 4: Pseudocode, if/else, functions, testing, lists, networks\n// Year 5: Big O, OOP, recursion, sorting, searching, files, encryption\n// Year 6: Design patterns, databases, optimisation, ML, autonomous systems\n\n// Professional practices mastered:\n// ✓ Write clean, documented, typed code\n// ✓ Design before coding\n// ✓ Test systematically including edge cases\n// ✓ Debug methodically\n// ✓ Use version control concepts\n// ✓ Work collaboratively\n// ✓ Explain technical ideas clearly",
          "activity": "Write a 'Computing Journey Letter' to Year 3 students. Explain what computing can do, what they will learn over four years, and one piece of advice from you. Make it inspiring — you remember what it felt like not to know any of this!",
          "keyWords": [
            "professional",
            "career",
            "computational thinking",
            "secondary school",
            "lifelong learning",
            "reflection",
            "celebration"
          ],
          "activities": [
            {
              "num": 1,
              "title": "Four-Year Skills Celebration",
              "duration": "20 mins",
              "desc": "Reflect on extraordinary growth",
              "steps": [
                "Walk through all four years: Year 3 basics to Year 6 professional skills",
                "For each year: what was the most surprising or exciting thing learned?",
                "Compare: Year 3 you vs Year 6 you — what can you do now that seemed impossible then?",
                "Self-assess: which areas do you feel most confident? Most excited to develop further?",
                "Class: stand up for each skill you feel confident about!"
              ]
            },
            {
              "num": 2,
              "title": "Career Exploration",
              "duration": "15 mins",
              "desc": "See where computing can take you",
              "steps": [
                "Robotics engineer: designs robots for manufacturing, space, medicine",
                "AI researcher: develops machine learning systems",
                "Game developer: creates games using everything you learned",
                "Cybersecurity expert: protects systems from attackers",
                "Data scientist: finds insights in huge datasets",
                "Medical technologist: programs life-saving devices",
                "Which excites you most? Why?"
              ]
            },
            {
              "num": 3,
              "title": "Secondary School Preview",
              "duration": "10 mins",
              "desc": "What comes next",
              "steps": [
                "A-level Computing: deeper algorithms, systems programming, databases",
                "University Computing: AI, computer architecture, advanced software engineering",
                "Every field needs computational thinkers: medicine, law, journalism, engineering, art",
                "The skills you have are genuinely rare and valuable",
                "End: class celebration of four years of incredible learning!"
              ]
            }
          ],
          "extension": "Create your 'Computing Portfolio': gather your best work from all four years. For each piece, write a brief reflection: what did you learn? How does it connect to real-world computing? What would you improve? This portfolio demonstrates your growth to secondary school.",
          "reflection": "Research a problem in the world that you care about (climate change, disease, poverty, space exploration). How could computing and robotics help solve it? Design a high-level solution — what systems would you build? What skills from your four years would you use?",
          "objectives": [
            "Reflect on four years of computing education",
            "Explore career paths in computing and technology",
            "Prepare for secondary school computing",
            "Celebrate achievements and maintain growth mindset"
          ],
          "ukCurriculum": [
            "Demonstrate mastery across all KS2 computing objectives",
            "Understand the real-world value of computational thinking",
            "Prepare for continued computing education"
          ]
        },
        "quiz": [
          {
            "q": "What is 'computational thinking'?",
            "options": [
              "Only useful for programmers",
              "The ability to break complex problems into parts, design systematic solutions, and evaluate trade-offs — useful in any field",
              "Thinking about computers all the time",
              "Writing code quickly"
            ],
            "answer": 1
          },
          {
            "q": "Which Year 6 skill is used in every modern AI system?",
            "options": [
              "Bubble sort",
              "Caesar cipher",
              "Machine learning from labelled training data",
              "Physical robot design"
            ],
            "answer": 2
          },
          {
            "q": "Why is 'design before coding' considered a professional practice?",
            "options": [
              "Designs always stay exactly the same",
              "Planning reduces bugs, saves time, and ensures the final system meets requirements",
              "Code writes itself once designed",
              "Design is only for beginners"
            ],
            "answer": 1
          },
          {
            "q": "Computing careers are available in...",
            "options": [
              "Only the technology sector",
              "Almost every field: medicine, climate science, entertainment, security, finance, space exploration, and more",
              "Only for mathematicians",
              "Only for people who study computing at university"
            ],
            "answer": 1
          }
        ]
      }
    ]
  }
];

export default csCurriculumCourses;
