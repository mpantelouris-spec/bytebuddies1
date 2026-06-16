// Auto-generated interactive activities for ByteBuddies Learn World (80 lessons)
import { COURSES, COURSE_ORDER } from './learnWorldData.js';

export const LESSON_INTERACTIVES = {
  "y3": [
    [
      {
        "type": "multiSeq",
        "title": "Algorithm Hunt",
        "description": "Match everyday tasks with their correct step order.",
        "xp": 10,
        "duration": "5 min",
        "tasks": [
          {
            "name": "Making a sandwich",
            "steps": [
              "Take out bread",
              "Spread peanut butter",
              "Place second bread slice",
              "Put sandwich on plate",
              "Cut sandwich",
              "Open peanut butter jar"
            ]
          },
          {
            "name": "Getting dressed",
            "steps": [
              "Put on underwear",
              "Put on trousers/skirt",
              "Put on top",
              "Put on socks",
              "Put on shoes"
            ]
          },
          {
            "name": "Brushing teeth",
            "steps": [
              "Pick up toothbrush",
              "Apply toothpaste",
              "Brush for 2 minutes",
              "Rinse mouth",
              "Rinse toothbrush"
            ]
          },
          {
            "name": "Making a bed",
            "steps": [
              "Remove pillows",
              "Straighten sheet",
              "Pull up duvet",
              "Place pillows back",
              "Smooth the cover"
            ]
          }
        ]
      },
      {
        "type": "characters",
        "title": "Meet the Robots",
        "description": "Explore the Academy and meet your robot friends.",
        "xp": 25,
        "duration": "4 min"
      },
      {
        "type": "grid",
        "title": "Robot Movement Simulator",
        "description": "Program Bolt to reach the goal on the grid.",
        "xp": 15,
        "duration": "5 min",
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Click arrows to program Bolt, then press Run!"
        }
      },
      {
        "type": "grid",
        "title": "Human Robot Challenge",
        "description": "Program precise instructions — robots follow exactly!",
        "xp": 20,
        "duration": "4 min",
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 3
            },
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Bolt follows EXACTLY what you program. Be precise!"
        }
      },
      {
        "type": "glossary",
        "title": "Glossary Explorer",
        "description": "Learn key CS terms for this lesson.",
        "xp": 25,
        "duration": "2 min",
        "terms": [
          {
            "term": "Algorithm",
            "def": "A set of step-by-step instructions to solve a problem.",
            "example": "Recipe for making a sandwich"
          },
          {
            "term": "Program",
            "def": "A set of coded instructions a computer can run.",
            "example": "Robot movement commands"
          },
          {
            "term": "Sequence",
            "def": "Instructions in a specific order.",
            "example": "First put on socks, then shoes"
          },
          {
            "term": "Instruction",
            "def": "A single command telling the computer what to do.",
            "example": "Move forward 3 steps"
          },
          {
            "term": "Robot",
            "def": "A machine that follows programmed instructions.",
            "example": "Bolt the delivery robot"
          }
        ]
      }
    ],
    [
      {
        "type": "seq",
        "title": "Arrange the Route",
        "description": "Fix Bolt's scrambled delivery route.",
        "xp": 25,
        "duration": "6 min",
        "steps": [
          "Leave starting warehouse",
          "Drive north on Main Street",
          "Turn left at traffic light",
          "Drive 2 blocks",
          "Arrive at library",
          "Deliver package",
          "Confirm delivery with librarian"
        ],
        "instructions": "Drag steps into the correct delivery order.",
        "context": "Bolt must deliver before confirming!"
      },
      {
        "type": "debug",
        "title": "Broken Delivery",
        "description": "The robot turns the wrong way — find the bug!",
        "xp": 20,
        "duration": "5 min",
        "blocks": [
          "DRIVE_NORTH 5",
          "TURN_RIGHT",
          "DRIVE 2",
          "DELIVER_PACKAGE",
          "CONFIRM"
        ],
        "bugIdx": 1,
        "fixOptions": [
          "TURN_LEFT",
          "TURN_RIGHT",
          "TURN_BACK"
        ],
        "correctFix": 0,
        "instructions": "Step 1: Click the buggy block. Step 2: Choose the correct replacement.",
        "context": "Wrong turn — the robot can't reach the delivery point!"
      },
      {
        "type": "grid",
        "title": "Delivery Race",
        "description": "Navigate to all delivery points efficiently.",
        "xp": 30,
        "duration": "5 min",
        "config": {
          "size": 6,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 5,
            "y": 3
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            },
            {
              "x": 3,
              "y": 4
            }
          ],
          "instructions": "Reach the star — plan the fastest route!"
        }
      },
      {
        "type": "grid",
        "title": "Create Your Own Route",
        "description": "Build a custom delivery path.",
        "xp": 30,
        "duration": "4 min",
        "config": {
          "size": 6,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 5,
            "y": 5
          },
          "obstacles": [
            {
              "x": 1,
              "y": 1
            },
            {
              "x": 3,
              "y": 2
            }
          ],
          "instructions": "Visit all locations — use fewest moves for bonus XP!"
        }
      },
      {
        "type": "prediction",
        "title": "Prediction Challenge",
        "description": "Predict where the robot will end up.",
        "xp": 15,
        "duration": "3 min",
        "sequence": [
          "N",
          "N",
          "N",
          "E",
          "E",
          "S"
        ],
        "start": {
          "x": 0,
          "y": 0
        },
        "size": 6,
        "options": [
          "(2, 1)",
          "(3, 2)",
          "(0, 0)",
          "(1, 3)"
        ],
        "answer": 0,
        "instructions": "N=North, E=East, S=South. Where does the robot finish?"
      }
    ],
    [
      {
        "type": "pattern",
        "title": "Pattern Painter",
        "description": "Program the paint robot to create patterns.",
        "xp": 35,
        "duration": "7 min",
        "target": [
          [
            1,
            1,
            1,
            1,
            1
          ],
          [
            0,
            0,
            0,
            0,
            0
          ],
          [
            1,
            1,
            1,
            1,
            1
          ]
        ],
        "colors": [
          "#ef4444",
          "#3b82f6"
        ]
      },
      {
        "type": "pattern",
        "title": "Copy the Pattern",
        "description": "Recreate the target pattern from memory.",
        "xp": 20,
        "duration": "4 min",
        "target": [
          [
            1,
            0,
            1,
            0,
            1
          ],
          [
            0,
            1,
            0,
            1,
            0
          ],
          [
            1,
            0,
            1,
            0,
            1
          ]
        ],
        "showSeconds": 3
      },
      {
        "type": "grid",
        "title": "Factory Production Line",
        "description": "Navigate the factory floor efficiently.",
        "xp": 50,
        "duration": "4 min",
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [
            {
              "x": 1,
              "y": 1
            },
            {
              "x": 2,
              "y": 2
            },
            {
              "x": 3,
              "y": 1
            }
          ],
          "instructions": "Reach all stations — be efficient!"
        }
      },
      {
        "type": "pattern",
        "title": "Design Your Masterpiece",
        "description": "Create your own pattern on the canvas.",
        "xp": 50,
        "duration": "3 min",
        "creative": true
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Help a lost robot escape the maze",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Debugging"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "debug",
        "title": "Debug the Program",
        "description": "Find and fix the bug.",
        "xp": 25,
        "blocks": [
          "repeat 4 times",
          "  move forward",
          "  turn right 90",
          "turn left 90",
          "end repeat"
        ],
        "bugIdx": 3,
        "fixOptions": [
          "turn right 90",
          "turn left 90",
          "move backward"
        ],
        "correctFix": 0,
        "instructions": "The square drawing program has a wrong turn!",
        "context": "The Maze of Mistakes"
      },
      {
        "type": "trace",
        "title": "Trace the Bug",
        "description": "Follow the code and find the error.",
        "xp": 20,
        "lines": [
          "steps = 0",
          "repeat 3 times:",
          "  steps = steps + 1",
          "steps = steps + 2",
          "show steps"
        ],
        "questions": [
          {
            "q": "What is steps after the loop? (type a number)",
            "answer": "9",
            "hint": "Add 1 three times, then add 2 once"
          }
        ],
        "instructions": "Trace each line carefully."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Fix three different buggy maze programs — each one has a different type of error!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Fix three different buggy maze programs — each one has a different type of error!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Order the Algorithm",
        "description": "Put the steps for \"The Robot Sports Day\" in the correct order.",
        "xp": 20,
        "steps": [
          "Understand the problem",
          "Plan each step",
          "Write instructions in order",
          "Test the sequence",
          "Fix any mistakes"
        ],
        "instructions": "Swap steps until the algorithm makes sense from start to finish.",
        "context": "Train robots for the Academy Games"
      },
      {
        "type": "grid",
        "title": "Robot Path Challenge",
        "description": "Program the robot to reach the goal.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Use arrow buttons to build a path to the star ⭐"
        }
      },
      {
        "type": "debug",
        "title": "Fix the Algorithm",
        "description": "Find and fix the bug in this sequence.",
        "xp": 25,
        "blocks": [
          "Step 1: Start",
          "Step 2: Do the main action",
          "Step 3: Finish too early",
          "Step 4: Complete task"
        ],
        "bugIdx": 2,
        "fixOptions": [
          "Step 3: Check conditions",
          "Step 3: Skip everything",
          "Step 3: Delete program"
        ],
        "correctFix": 0,
        "instructions": "One step is in the wrong place — find it!",
        "context": "Efficiency"
      },
      {
        "type": "grid",
        "title": "Robot Path Challenge",
        "description": "Program the robot to reach the goal.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Use arrow buttons to build a path to the star ⭐"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create the fastest possible obstacle course route — fewer instructions wins!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create the fastest possible obstacle course route — fewer instructions wins!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: The factory needs thousands of patterns",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Loops"
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "trace",
        "title": "Loop Counter",
        "description": "How many times does the loop run?",
        "xp": 22,
        "lines": [
          "count = 0",
          "repeat 5 times:",
          "  move forward",
          "  count = count + 1",
          "show count"
        ],
        "questions": [
          {
            "q": "What is count at the end?",
            "answer": "5"
          }
        ],
        "instructions": "Count each loop iteration."
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a factory floor pattern using only ONE loop with 3 instructions inside!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a factory floor pattern using only ONE loop with 3 instructions inside!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Program robots for the dance competition",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Loop Patterns"
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "trace",
        "title": "Loop Counter",
        "description": "How many times does the loop run?",
        "xp": 22,
        "lines": [
          "count = 0",
          "repeat 5 times:",
          "  move forward",
          "  count = count + 1",
          "show count"
        ],
        "questions": [
          {
            "q": "What is count at the end?",
            "answer": "5"
          }
        ],
        "instructions": "Count each loop iteration."
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create the most impressive dance using only 2 loops and 6 total instructions!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create the most impressive dance using only 2 loops and 6 total instructions!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Create musical robot performances",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Timing & Repetition"
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "trace",
        "title": "Loop Counter",
        "description": "How many times does the loop run?",
        "xp": 22,
        "lines": [
          "count = 0",
          "repeat 5 times:",
          "  move forward",
          "  count = count + 1",
          "show count"
        ],
        "questions": [
          {
            "q": "What is count at the end?",
            "answer": "5"
          }
        ],
        "instructions": "Count each loop iteration."
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a 3-verse concert performance using loops for each verse and a different chorus!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a 3-verse concert performance using loops for each verse and a different chorus!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Automate the robot harvest",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Automation"
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "trace",
        "title": "Loop Counter",
        "description": "How many times does the loop run?",
        "xp": 22,
        "lines": [
          "count = 0",
          "repeat 5 times:",
          "  move forward",
          "  count = count + 1",
          "show count"
        ],
        "questions": [
          {
            "q": "What is count at the end?",
            "answer": "5"
          }
        ],
        "instructions": "Count each loop iteration."
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Automate the entire farm: plant, water, and harvest 10 rows with one compact program!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Automate the entire farm: plant, water, and harvest 10 rows with one compact program!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Complete the ultimate loop challenge series",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Loop Mastery"
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "trace",
        "title": "Loop Counter",
        "description": "How many times does the loop run?",
        "xp": 22,
        "lines": [
          "count = 0",
          "repeat 5 times:",
          "  move forward",
          "  count = count + 1",
          "show count"
        ],
        "questions": [
          {
            "q": "What is count at the end?",
            "answer": "5"
          }
        ],
        "instructions": "Count each loop iteration."
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Replicate a complex pattern using under 15 total instructions using loops!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Replicate a complex pattern using under 15 total instructions using loops!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "glossary",
        "title": "Events Glossary",
        "description": "Learn the key terms.",
        "xp": 15,
        "duration": "3 min",
        "terms": [
          {
            "term": "Events",
            "def": "An event is something that happens — like a button click or key press — that causes a program to react and do something.",
            "example": "Explore what happens when different buttons are pressed on the pet robot"
          },
          {
            "term": "Interaction",
            "def": "An event is something that happens — like a button click or key press — that causes a program to react and do something.",
            "example": "Create responses for 3 different events: tap, shake, double-tap"
          },
          {
            "term": "Input/Output",
            "def": "An event is something that happens — like a button click or key press — that causes a program to react and do something.",
            "example": "Chain events together to create complex interactive behaviours"
          },
          {
            "term": "Events",
            "def": "An event is something that happens — like a button click or key press — that causes a program to react and do something.",
            "example": "Train a virtual robot pet"
          }
        ]
      },
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Train a virtual robot pet",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Events"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Program the pet to have 5 different responses to 5 different events!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Program the pet to have 5 different responses to 5 different events!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: The robot animals have escaped!",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Event Triggers"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a capture system with 6 different triggers responding to 3 different animal types!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a capture system with 6 different triggers responding to 3 different animal types!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Discover the mysterious buttons",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Input & Output"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Design a 5-button control panel for the Academy — decide what each button controls!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Design a 5-button control panel for the Academy — decide what each button controls!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Build a simple interactive game",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Interactive Systems"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a complete 1-player game with: start button, score system, and game-over condition!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a complete 1-player game with: start button, score system, and game-over condition!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Showcase your interactive project",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Computational Thinking"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a final version of your game with at least: 2 events, 1 loop, 1 algorithm, and 0 bugs!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a final version of your game with at least: 2 events, 1 loop, 1 algorithm, and 0 bugs!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Stop Glitch from breaking the Academy",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Systematic Debugging"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "debug",
        "title": "Debug the Program",
        "description": "Find and fix the bug.",
        "xp": 25,
        "blocks": [
          "repeat 4 times",
          "  move forward",
          "  turn right 90",
          "turn left 90",
          "end repeat"
        ],
        "bugIdx": 3,
        "fixOptions": [
          "turn right 90",
          "turn left 90",
          "move backward"
        ],
        "correctFix": 0,
        "instructions": "The square drawing program has a wrong turn!",
        "context": "The Glitch Attack"
      },
      {
        "type": "trace",
        "title": "Trace the Bug",
        "description": "Follow the code and find the error.",
        "xp": 20,
        "lines": [
          "steps = 0",
          "repeat 3 times:",
          "  steps = steps + 1",
          "steps = steps + 2",
          "show steps"
        ],
        "questions": [
          {
            "q": "What is steps after the loop? (type a number)",
            "answer": "9",
            "hint": "Add 1 three times, then add 2 once"
          }
        ],
        "instructions": "Trace each line carefully."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Fix 5 broken Academy programs in the fastest time — accuracy counts!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Fix 5 broken Academy programs in the fastest time — accuracy counts!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Repair the malfunctioning factory systems",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Types of Errors"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "debug",
        "title": "Debug the Program",
        "description": "Find and fix the bug.",
        "xp": 25,
        "blocks": [
          "repeat 4 times",
          "  move forward",
          "  turn right 90",
          "turn left 90",
          "end repeat"
        ],
        "bugIdx": 3,
        "fixOptions": [
          "turn right 90",
          "turn left 90",
          "move backward"
        ],
        "correctFix": 0,
        "instructions": "The square drawing program has a wrong turn!",
        "context": "The Broken Factory"
      },
      {
        "type": "trace",
        "title": "Trace the Bug",
        "description": "Follow the code and find the error.",
        "xp": 20,
        "lines": [
          "steps = 0",
          "repeat 3 times:",
          "  steps = steps + 1",
          "steps = steps + 2",
          "show steps"
        ],
        "questions": [
          {
            "q": "What is steps after the loop? (type a number)",
            "answer": "9",
            "hint": "Add 1 three times, then add 2 once"
          }
        ],
        "instructions": "Trace each line carefully."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Fix the complete factory system — 8 programs with 3 different error types!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Fix the complete factory system — 8 programs with 3 different error types!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Diagnose malfunctioning robots",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Diagnostic Thinking"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "debug",
        "title": "Debug the Program",
        "description": "Find and fix the bug.",
        "xp": 25,
        "blocks": [
          "repeat 4 times",
          "  move forward",
          "  turn right 90",
          "turn left 90",
          "end repeat"
        ],
        "bugIdx": 3,
        "fixOptions": [
          "turn right 90",
          "turn left 90",
          "move backward"
        ],
        "correctFix": 0,
        "instructions": "The square drawing program has a wrong turn!",
        "context": "The Robot Hospital"
      },
      {
        "type": "trace",
        "title": "Trace the Bug",
        "description": "Follow the code and find the error.",
        "xp": 20,
        "lines": [
          "steps = 0",
          "repeat 3 times:",
          "  steps = steps + 1",
          "steps = steps + 2",
          "show steps"
        ],
        "questions": [
          {
            "q": "What is steps after the loop? (type a number)",
            "answer": "9",
            "hint": "Add 1 three times, then add 2 once"
          }
        ],
        "instructions": "Trace each line carefully."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Diagnose and fix 6 robot patients — record symptoms, diagnosis and treatment for each!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Diagnose and fix 6 robot patients — record symptoms, diagnosis and treatment for each!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Find hidden bugs across the Academy",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Advanced Debugging"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "debug",
        "title": "Debug the Program",
        "description": "Find and fix the bug.",
        "xp": 25,
        "blocks": [
          "repeat 4 times",
          "  move forward",
          "  turn right 90",
          "turn left 90",
          "end repeat"
        ],
        "bugIdx": 3,
        "fixOptions": [
          "turn right 90",
          "turn left 90",
          "move backward"
        ],
        "correctFix": 0,
        "instructions": "The square drawing program has a wrong turn!",
        "context": "The Secret Bug Hunt"
      },
      {
        "type": "trace",
        "title": "Trace the Bug",
        "description": "Follow the code and find the error.",
        "xp": 20,
        "lines": [
          "steps = 0",
          "repeat 3 times:",
          "  steps = steps + 1",
          "steps = steps + 2",
          "show steps"
        ],
        "questions": [
          {
            "q": "What is steps after the loop? (type a number)",
            "answer": "9",
            "hint": "Add 1 three times, then add 2 once"
          }
        ],
        "instructions": "Trace each line carefully."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Find all 15 hidden bugs in the Academy codebase — in under 30 minutes!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Find all 15 hidden bugs in the Academy codebase — in under 30 minutes!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Prove you are a Master Debugger",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Year 3 Review"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "debug",
        "title": "Debug the Program",
        "description": "Find and fix the bug.",
        "xp": 25,
        "blocks": [
          "repeat 4 times",
          "  move forward",
          "  turn right 90",
          "turn left 90",
          "end repeat"
        ],
        "bugIdx": 3,
        "fixOptions": [
          "turn right 90",
          "turn left 90",
          "move backward"
        ],
        "correctFix": 0,
        "instructions": "The square drawing program has a wrong turn!",
        "context": "Master Debugger Assessment"
      },
      {
        "type": "trace",
        "title": "Trace the Bug",
        "description": "Follow the code and find the error.",
        "xp": 20,
        "lines": [
          "steps = 0",
          "repeat 3 times:",
          "  steps = steps + 1",
          "steps = steps + 2",
          "show steps"
        ],
        "questions": [
          {
            "q": "What is steps after the loop? (type a number)",
            "answer": "9",
            "hint": "Add 1 three times, then add 2 once"
          }
        ],
        "instructions": "Trace each line carefully."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Completely repair a complex program with 5 bugs of different types — in under 15 minutes!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Completely repair a complex program with 5 bugs of different types — in under 15 minutes!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ]
  ],
  "y4": [
    [
      {
        "type": "glossary",
        "title": "Variables Glossary",
        "description": "Learn the key terms.",
        "xp": 15,
        "duration": "3 min",
        "terms": [
          {
            "term": "Variables",
            "def": "A variable is a labelled storage box in a computer's memory that holds information which can change — like a robot's battery level or a delivery count.",
            "example": "Explore Robot City's data systems on the map"
          },
          {
            "term": "Data",
            "def": "A variable is a labelled storage box in a computer's memory that holds information which can change — like a robot's battery level or a delivery count.",
            "example": "Identify what information each system needs to track"
          },
          {
            "term": "Information Storage",
            "def": "A variable is a labelled storage box in a computer's memory that holds information which can change — like a robot's battery level or a delivery count.",
            "example": "Create your first variable: a robot's battery level, starting at 100"
          },
          {
            "term": "Variables",
            "def": "A variable is a labelled storage box in a computer's memory that holds information which can change — like a robot's battery level or a delivery count.",
            "example": "Join the Smart City Engineering Team"
          }
        ]
      },
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Join the Smart City Engineering Team",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Variables"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "trace",
        "title": "Track the Variable",
        "description": "Follow the variable value.",
        "xp": 22,
        "lines": [
          "score = 0",
          "score = score + 10",
          "score = score + 10",
          "score = score + 5",
          "show score"
        ],
        "questions": [
          {
            "q": "What is score?",
            "answer": "25"
          }
        ],
        "instructions": "Update the variable at each step."
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Set up 4 city monitoring variables: power, traffic, deliveries, and temperature!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Set up 4 city monitoring variables: power, traffic, deliveries, and temperature!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Robots are running out of power",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Changing Variables"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "trace",
        "title": "Track the Variable",
        "description": "Follow the variable value.",
        "xp": 22,
        "lines": [
          "score = 0",
          "score = score + 10",
          "score = score + 10",
          "score = score + 5",
          "show score"
        ],
        "questions": [
          {
            "q": "What is score?",
            "answer": "25"
          }
        ],
        "instructions": "Update the variable at each step."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Build a battery management system that alerts when any robot drops below 20%!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Build a battery management system that alerts when any robot drops below 20%!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Program racing robots with multiple variables",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Multiple Variables"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "trace",
        "title": "Track the Variable",
        "description": "Follow the variable value.",
        "xp": 22,
        "lines": [
          "score = 0",
          "score = score + 10",
          "score = score + 10",
          "score = score + 5",
          "show score"
        ],
        "questions": [
          {
            "q": "What is score?",
            "answer": "25"
          }
        ],
        "instructions": "Update the variable at each step."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a complete race management system that automatically declares the winner!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a complete race management system that automatically declares the winner!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Manage city-wide robot deliveries",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Data Systems"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "trace",
        "title": "Track the Variable",
        "description": "Follow the variable value.",
        "xp": 22,
        "lines": [
          "score = 0",
          "score = score + 10",
          "score = score + 10",
          "score = score + 5",
          "show score"
        ],
        "questions": [
          {
            "q": "What is score?",
            "answer": "25"
          }
        ],
        "instructions": "Update the variable at each step."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Build a delivery dashboard that shows the city's live delivery stats!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Build a delivery dashboard that shows the city's live delivery stats!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Complete the variable mastery test",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Variable Mastery"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "trace",
        "title": "Track the Variable",
        "description": "Follow the variable value.",
        "xp": 22,
        "lines": [
          "score = 0",
          "score = score + 10",
          "score = score + 10",
          "score = score + 5",
          "show score"
        ],
        "questions": [
          {
            "q": "What is score?",
            "answer": "25"
          }
        ],
        "instructions": "Update the variable at each step."
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Build a complete Robot City monitoring dashboard using at least 8 variables!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Build a complete Robot City monitoring dashboard using at least 8 variables!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Traffic lights are malfunctioning across the city",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "If/Else Statements"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Build a smart 4-way intersection that manages traffic from all directions!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Build a smart 4-way intersection that manages traffic from all directions!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Guide an exploration robot through caves",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Conditional Logic"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Navigate a 5-room cave system using only IF/ELSE conditions — no direct control!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Navigate a 5-room cave system using only IF/ELSE conditions — no direct control!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Create an intelligent patrol robot",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Multiple Conditions"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a security system with 6 different condition-based responses!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a security system with 6 different condition-based responses!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Build a smart environmental monitor",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Conditions with Variables"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Build a complete weather response system with 5 automated environmental controls!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Build a complete weather response system with 5 automated environmental controls!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Build a complete smart city system",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Logic Engineering"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a fully automated Smart City with no human intervention needed!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a fully automated Smart City with no human intervention needed!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "glossary",
        "title": "Nested Loops Glossary",
        "description": "Learn the key terms.",
        "xp": 15,
        "duration": "3 min",
        "terms": [
          {
            "term": "Nested Loops",
            "def": "A nested loop is a loop inside another loop — the inner loop runs completely for every single step of the outer loop, creating powerful repeating patterns.",
            "example": "Understand how a nested loop works by tracing its execution step by step"
          },
          {
            "term": "Repetition",
            "def": "A nested loop is a loop inside another loop — the inner loop runs completely for every single step of the outer loop, creating powerful repeating patterns.",
            "example": "Write a nested loop to plant seeds across a grid of 10x10 fields"
          },
          {
            "term": "Patterns",
            "def": "A nested loop is a loop inside another loop — the inner loop runs completely for every single step of the outer loop, creating powerful repeating patterns.",
            "example": "Count the total number of instructions that execute"
          },
          {
            "term": "Nested Loops",
            "def": "A nested loop is a loop inside another loop — the inner loop runs completely for every single step of the outer loop, creating powerful repeating patterns.",
            "example": "Automate a massive farming operation"
          }
        ]
      },
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Automate a massive farming operation",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Nested Loops"
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "trace",
        "title": "Loop Counter",
        "description": "How many times does the loop run?",
        "xp": 22,
        "lines": [
          "count = 0",
          "repeat 5 times:",
          "  move forward",
          "  count = count + 1",
          "show count"
        ],
        "questions": [
          {
            "q": "What is count at the end?",
            "answer": "5"
          }
        ],
        "instructions": "Count each loop iteration."
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Write a nested loop program to harvest a 20x20 field grid with only 6 lines of code!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Write a nested loop program to harvest a 20x20 field grid with only 6 lines of code!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Program a robot assembly production line",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Loop-Based Systems"
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "trace",
        "title": "Loop Counter",
        "description": "How many times does the loop run?",
        "xp": 22,
        "lines": [
          "count = 0",
          "repeat 5 times:",
          "  move forward",
          "  count = count + 1",
          "show count"
        ],
        "questions": [
          {
            "q": "What is count at the end?",
            "answer": "5"
          }
        ],
        "instructions": "Count each loop iteration."
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Optimise the factory to produce 1000 robots using the most compact code possible!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Optimise the factory to produce 1000 robots using the most compact code possible!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Create visual patterns with mathematical loops",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Mathematical Loops"
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "trace",
        "title": "Loop Counter",
        "description": "How many times does the loop run?",
        "xp": 22,
        "lines": [
          "count = 0",
          "repeat 5 times:",
          "  move forward",
          "  count = count + 1",
          "show count"
        ],
        "questions": [
          {
            "q": "What is count at the end?",
            "answer": "5"
          }
        ],
        "instructions": "Count each loop iteration."
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Generate a diamond pattern using only nested loops and a counter variable!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Generate a diamond pattern using only nested loops and a counter variable!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Order the Algorithm",
        "description": "Put the steps for \"The Mega Maze\" in the correct order.",
        "xp": 20,
        "steps": [
          "Understand the problem",
          "Plan each step",
          "Write instructions in order",
          "Test the sequence",
          "Fix any mistakes"
        ],
        "instructions": "Swap steps until the algorithm makes sense from start to finish.",
        "context": "Generate and solve mazes automatically"
      },
      {
        "type": "grid",
        "title": "Robot Path Challenge",
        "description": "Program the robot to reach the goal.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Use arrow buttons to build a path to the star ⭐"
        }
      },
      {
        "type": "debug",
        "title": "Fix the Algorithm",
        "description": "Find and fix the bug in this sequence.",
        "xp": 25,
        "blocks": [
          "Step 1: Start",
          "Step 2: Do the main action",
          "Step 3: Finish too early",
          "Step 4: Complete task"
        ],
        "bugIdx": 2,
        "fixOptions": [
          "Step 3: Check conditions",
          "Step 3: Skip everything",
          "Step 3: Delete program"
        ],
        "correctFix": 0,
        "instructions": "One step is in the wrong place — find it!",
        "context": "General Algorithms"
      },
      {
        "type": "grid",
        "title": "Robot Path Challenge",
        "description": "Program the robot to reach the goal.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Use arrow buttons to build a path to the star ⭐"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Code a maze solver that can escape any maze Glitch generates — without looking at the map!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Code a maze solver that can escape any maze Glitch generates — without looking at the map!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Build a fully automated city system",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "System Automation"
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "trace",
        "title": "Loop Counter",
        "description": "How many times does the loop run?",
        "xp": 22,
        "lines": [
          "count = 0",
          "repeat 5 times:",
          "  move forward",
          "  count = count + 1",
          "show count"
        ],
        "questions": [
          {
            "q": "What is count at the end?",
            "answer": "5"
          }
        ],
        "instructions": "Count each loop iteration."
      },
      {
        "type": "grid",
        "title": "Square Path with Loops",
        "description": "Reach the goal efficiently.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [
            {
              "x": 2,
              "y": 2
            }
          ],
          "instructions": "Find the shortest path!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create an autonomous city system that runs for 100 simulated days without breaking!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create an autonomous city system that runs for 100 simulated days without breaking!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Monitor and analyse city weather data",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Data Collection"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Collect a full week of weather data and present it as a readable report!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Collect a full week of weather data and present it as a readable report!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Analyse robot competition results",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Data Analysis"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Find 3 insights from the sports data and present recommendations to improve Bolt's team!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Find 3 insights from the sports data and present recommendations to improve Bolt's team!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Track robot wildlife populations over time",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Trends & Predictions"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Identify 3 species trends and write a conservation recommendation based on your data analysis!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Identify 3 species trends and write a conservation recommendation based on your data analysis!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Analyse energy consumption patterns",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Data-Driven Decisions"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a 24-hour optimised energy plan that eliminates all power spikes!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a 24-hour optimised energy plan that eliminates all power spikes!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Complete a full investigation project",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Data Science"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Complete and present a full data science investigation with at least 3 original insights!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Complete and present a full data science investigation with at least 3 original insights!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ]
  ],
  "y5": [
    [
      {
        "type": "glossary",
        "title": "Functions Glossary",
        "description": "Learn the key terms.",
        "xp": 15,
        "duration": "3 min",
        "terms": [
          {
            "term": "Functions",
            "def": "A function is a named, reusable block of code — write it once, use it anywhere.",
            "example": "Identify blocks of repeated code in the broken delivery system"
          },
          {
            "term": "Reusable Code",
            "def": "A function is a named, reusable block of code — write it once, use it anywhere.",
            "example": "Extract them into named functions"
          },
          {
            "term": "Decomposition",
            "def": "A function is a named, reusable block of code — write it once, use it anywhere.",
            "example": "Call those functions from multiple places in the program"
          },
          {
            "term": "Functions",
            "def": "A function is a named, reusable block of code — write it once, use it anywhere. Functions make programs shorter, cleaner, and much easier to maintain.",
            "example": "Repair a global robot delivery network"
          }
        ]
      },
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Repair a global robot delivery network",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Functions"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Reduce a 60-line program to under 20 lines using functions — without changing what it does!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Reduce a 60-line program to under 20 lines using functions — without changing what it does!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Teach robots new skills using functions",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Function Parameters"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a robot using only reusable parameterised functions — no repeated code allowed!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a robot using only reusable parameterised functions — no repeated code allowed!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Coordinate rescue robots with functions",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Decomposition"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Coordinate 5 rescue teams simultaneously using functions — each team needs a different role!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Coordinate 5 rescue teams simultaneously using functions — each team needs a different role!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Build a modular production line",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Modular Design"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Rebuild the factory and then demonstrate that improving one function improves the whole pipeline!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Rebuild the factory and then demonstrate that improving one function improves the whole pipeline!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Build a fully functional logistics system",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Function Mastery"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a logistics system with 10 functions, each tested with at least 3 different inputs!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a logistics system with 10 functions, each tested with at least 3 different inputs!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Connect cities across the global network",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Networks"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Design a network where every city can communicate with every other city through at least 2 different routes!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Design a network where every city can communicate with every other city through at least 2 different routes!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Deliver a critical message through the damaged network",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Packets & Routing"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Deliver a 10-packet message through a network where 3 routes are broken — find alternative paths!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Deliver a 10-packet message through a network where 3 routes are broken — find alternative paths!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Allow robots to share information and coordinate",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Clients & Servers"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Build a robot coordination system where 5 client robots share data through one server!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Build a robot coordination system where 5 client robots share data through one server!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Build a cloud-based robot control system",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Cloud Computing"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Design a cloud system that manages 1000 robots from a single central control!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Design a cloud system that manages 1000 robots from a single central control!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Design a complete communication infrastructure",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Network Engineering"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Design and present a resilient global network that survives the loss of any 3 connections!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Design and present a resilient global network that survives the loss of any 3 connections!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "glossary",
        "title": "Cyber Security Glossary",
        "description": "Learn the key terms.",
        "xp": 15,
        "duration": "3 min",
        "terms": [
          {
            "term": "Cyber Security",
            "def": "Cyber security is the practice of protecting computers, networks, and data from digital attacks, unauthorised access, and damage.",
            "example": "Learn the main categories of cyber threats: malware, phishing, hacking, ransomware"
          },
          {
            "term": "Threats",
            "def": "Cyber security is the practice of protecting computers, networks, and data from digital attacks, unauthorised access, and damage.",
            "example": "Identify vulnerabilities in a simulated system"
          },
          {
            "term": "Digital Safety",
            "def": "Cyber security is the practice of protecting computers, networks, and data from digital attacks, unauthorised access, and damage.",
            "example": "Understand why cyber security matters for individuals, businesses, and governments"
          },
          {
            "term": "Cyber Security",
            "def": "Cyber security is the practice of protecting computers, networks, and data from digital attacks, unauthorised access, and damage.",
            "example": "Begin training as a cyber security specialist"
          }
        ]
      },
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Begin training as a cyber security specialist",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Cyber Security"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Conduct a security audit of a simulated system and identify 5 different vulnerabilities!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Conduct a security audit of a simulated system and identify 5 different vulnerabilities!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Protect sensitive information with strong authentication",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Strong Authentication"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Redesign the password policy for the entire Alliance network — and justify each rule!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Redesign the password policy for the entire Alliance network — and justify each rule!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Defend Robot City against a live cyber attack",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Ethical Hacking"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Stop Glitch's attack, trace it back to its source, and patch all 5 exploited vulnerabilities!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Stop Glitch's attack, trace it back to its source, and patch all 5 exploited vulnerabilities!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Protect communications with encryption",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Encryption"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create your own encryption system and challenge a partner to crack it!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create your own encryption system and challenge a partner to crack it!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Complete the city-wide security simulation",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Cyber Defence"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Achieve a perfect defence score — protect all city systems across the full 1-hour simulation!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Achieve a perfect defence score — protect all city systems across the full 1-hour simulation!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Design a complete colony support system",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Systems Thinking"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Design a complete Mars Colony tech system architecture — every system must connect logically!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Design a complete Mars Colony tech system architecture — every system must connect logically!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Design your software solution",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Software Design"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Produce a complete design document for your Mars Colony system — no code, just clear design!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Produce a complete design document for your Mars Colony system — no code, just clear design!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Implement your designed solution",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Iterative Development"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Complete 3 working modules of your Mars Colony system — each fully tested before moving on!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Complete 3 working modules of your Mars Colony system — each fully tested before moving on!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Thoroughly test and improve your system",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Quality Assurance"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Achieve zero critical bugs in your Mars Colony system across 50 different test scenarios!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Achieve zero critical bugs in your Mars Colony system across 50 different test scenarios!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Present your complete project to the Alliance",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Technical Communication"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Receive a \"go-live\" rating of 4/5 or higher from the Alliance board!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Receive a \"go-live\" rating of 4/5 or higher from the Alliance board!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ]
  ],
  "y6": [
    [
      {
        "type": "glossary",
        "title": "Artificial Intelligence Glossary",
        "description": "Learn the key terms.",
        "xp": 15,
        "duration": "3 min",
        "terms": [
          {
            "term": "Artificial Intelligence",
            "def": "AI is the development of computer systems that can perform tasks that normally require human intelligence — like recognising images, understanding language, and making decisions.",
            "example": "Explore 10 real-world examples of AI and classify what type of task each performs"
          },
          {
            "term": "Machine Learning",
            "def": "AI is the development of computer systems that can perform tasks that normally require human intelligence — like recognising images, understanding language, and making decisions.",
            "example": "Identify AI systems you used today without realising"
          },
          {
            "term": "AI Ethics",
            "def": "AI is the development of computer systems that can perform tasks that normally require human intelligence — like recognising images, understanding language, and making decisions.",
            "example": "Discuss: what can AI do that humans can't? What can humans do that AI can't?"
          },
          {
            "term": "Artificial Intelligence",
            "def": "AI is the development of computer systems that can perform tasks that normally require human intelligence — like recognising images, understanding language, and making decisions.",
            "example": "Discover what AI is — and what it isn't"
          }
        ]
      },
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Discover what AI is — and what it isn't",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Artificial Intelligence"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create a presentation: \"AI vs Humans — A Fair Comparison\" — covering 5 key differences!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create a presentation: \"AI vs Humans — A Fair Comparison\" — covering 5 key differences!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Create and train an AI companion",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Training Data"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Train your AI pet to recognise 4 different moods with over 90% accuracy!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Train your AI pet to recognise 4 different moods with over 90% accuracy!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Teach AI to identify and classify objects",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Classification"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Achieve 95% classification accuracy across all 5 object categories!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Achieve 95% classification accuracy across all 5 object categories!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Investigate unfair AI decision-making",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "AI Bias"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Redesign the training dataset to remove bias and demonstrate measurably fairer AI decisions!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Redesign the training dataset to remove bias and demonstrate measurably fairer AI decisions!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Design a complete AI solution to a real problem",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Responsible AI Design"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Present a complete AI solution design including ethics review and fairness plan!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Present a complete AI solution design including ethics review and fairness plan!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Organise millions of robot records",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Databases"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Design a complete database structure for all 10 million robots — what tables and fields do you need?",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Design a complete database structure for all 10 million robots — what tables and fields do you need?",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Search, sort, and filter database records",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Database Queries"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Find the missing research file using only 3 database queries — each must narrow down the results!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Find the missing research file using only 3 database queries — each must narrow down the results!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Manage critical information for an orbiting station",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Relational Databases"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Answer 5 complex questions about the space station using multi-table queries!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Answer 5 complex questions about the space station using multi-table queries!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Build a searchable knowledge management system",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Information Systems"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Build a Digital Library that can find any of 100 test items using 3 different search methods!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Build a Digital Library that can find any of 100 test items using 3 different search methods!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Design a complete enterprise database solution",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Data Architecture"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Create and present a complete data architecture that can scale to 1 billion records!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Create and present a complete data architecture that can scale to 1 billion records!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "glossary",
        "title": "Pathfinding Algorithms Glossary",
        "description": "Learn the key terms.",
        "xp": 15,
        "duration": "3 min",
        "terms": [
          {
            "term": "Algorithms",
            "def": "Pathfinding algorithms find the shortest or most efficient route through a network — they power GPS navigation, network routing, and delivery optimisation.",
            "example": "Compare different routes between 10 cities by testing manually"
          },
          {
            "term": "Pathfinding",
            "def": "Pathfinding algorithms find the shortest or most efficient route through a network — they power GPS navigation, network routing, and delivery optimisation.",
            "example": "Learn how Dijkstra's algorithm systematically finds the shortest path"
          },
          {
            "term": "Optimisation",
            "def": "Pathfinding algorithms find the shortest or most efficient route through a network — they power GPS navigation, network routing, and delivery optimisation.",
            "example": "Apply the algorithm to find optimal routes in a 50-city network"
          },
          {
            "term": "Pathfinding Algorithms",
            "def": "Pathfinding algorithms find the shortest or most efficient route through a network — they power GPS navigation, network routing, and delivery optimisation.",
            "example": "Optimise delivery routes across a continent"
          }
        ]
      },
      {
        "type": "seq",
        "title": "Order the Algorithm",
        "description": "Put the steps for \"The Robot Delivery Network\" in the correct order.",
        "xp": 20,
        "steps": [
          "Understand the problem",
          "Plan each step",
          "Write instructions in order",
          "Test the sequence",
          "Fix any mistakes"
        ],
        "instructions": "Swap steps until the algorithm makes sense from start to finish.",
        "context": "Optimise delivery routes across a continent"
      },
      {
        "type": "grid",
        "title": "Robot Path Challenge",
        "description": "Program the robot to reach the goal.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Use arrow buttons to build a path to the star ⭐"
        }
      },
      {
        "type": "debug",
        "title": "Fix the Algorithm",
        "description": "Find and fix the bug in this sequence.",
        "xp": 25,
        "blocks": [
          "Step 1: Start",
          "Step 2: Do the main action",
          "Step 3: Finish too early",
          "Step 4: Complete task"
        ],
        "bugIdx": 2,
        "fixOptions": [
          "Step 3: Check conditions",
          "Step 3: Skip everything",
          "Step 3: Delete program"
        ],
        "correctFix": 0,
        "instructions": "One step is in the wrong place — find it!",
        "context": "Pathfinding Algorithms"
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Find the optimal delivery route visiting all 50 cities with minimum total distance!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Find the optimal delivery route visiting all 50 cities with minimum total distance!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Navigate increasingly complex mazes with efficient algorithms",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Algorithm Complexity"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Solve Glitch's largest maze (1000x1000) in under 5 seconds using an efficient algorithm!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Solve Glitch's largest maze (1000x1000) in under 5 seconds using an efficient algorithm!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Optimise a city's entire transport network",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "System Optimisation"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Reduce the average journey time across the entire city by at least 15%!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Reduce the average journey time across the entire city by at least 15%!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Optimise resources for a growing Mars colony",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Constraint Optimisation"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Keep the Mars colony alive for 12 simulated months with the minimum number of rocket launches!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Keep the Mars colony alive for 12 simulated months with the minimum number of rocket launches!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Order the Algorithm",
        "description": "Put the steps for \"Algorithm Master Challenge\" in the correct order.",
        "xp": 20,
        "steps": [
          "Understand the problem",
          "Plan each step",
          "Write instructions in order",
          "Test the sequence",
          "Fix any mistakes"
        ],
        "instructions": "Swap steps until the algorithm makes sense from start to finish.",
        "context": "Design the most efficient solution to a complex problem"
      },
      {
        "type": "grid",
        "title": "Robot Path Challenge",
        "description": "Program the robot to reach the goal.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Use arrow buttons to build a path to the star ⭐"
        }
      },
      {
        "type": "debug",
        "title": "Fix the Algorithm",
        "description": "Find and fix the bug in this sequence.",
        "xp": 25,
        "blocks": [
          "Step 1: Start",
          "Step 2: Do the main action",
          "Step 3: Finish too early",
          "Step 4: Complete task"
        ],
        "bugIdx": 2,
        "fixOptions": [
          "Step 3: Check conditions",
          "Step 3: Skip everything",
          "Step 3: Delete program"
        ],
        "correctFix": 0,
        "instructions": "One step is in the wrong place — find it!",
        "context": "Algorithm Design"
      },
      {
        "type": "grid",
        "title": "Robot Path Challenge",
        "description": "Program the robot to reach the goal.",
        "xp": 25,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Use arrow buttons to build a path to the star ⭐"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Demonstrate that your algorithm outperforms the standard approach by at least 20%!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Demonstrate that your algorithm outperforms the standard approach by at least 20%!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Choose and plan your major technology challenge",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Requirements Analysis"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 0
          },
          "goalPos": {
            "x": 4,
            "y": 2
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Produce a complete, approved requirements document — with at least 10 clear, testable requirements!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Produce a complete, approved requirements document — with at least 10 clear, testable requirements!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Create detailed technical designs before coding",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Technical Design"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 1
          },
          "goalPos": {
            "x": 4,
            "y": 3
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Produce a complete technical design document that another developer could use to build your system!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Produce a complete technical design document that another developer could use to build your system!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Develop your solution following the design",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Professional Development"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 2
          },
          "goalPos": {
            "x": 4,
            "y": 4
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Complete at least 60% of your planned system, fully commented and tested module by module!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Complete at least 60% of your planned system, fully commented and tested module by module!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Conduct thorough testing and improvement cycles",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "Test-Driven Quality"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 3
          },
          "goalPos": {
            "x": 4,
            "y": 0
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Achieve zero critical bugs and a user satisfaction score of 4/5 or higher!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Achieve zero critical bugs and a user satisfaction score of 4/5 or higher!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ],
    [
      {
        "type": "seq",
        "title": "Mission Steps",
        "description": "Order the steps for: Present your complete project — Graduate as a Master Innovator",
        "xp": 18,
        "steps": [
          "Plan",
          "Code",
          "Test",
          "Debug",
          "Complete"
        ],
        "instructions": "Put the mission steps in the best order.",
        "context": "The ByteBuddies Journey"
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "grid",
        "title": "Robot Challenge",
        "description": "Guide the robot to the goal.",
        "xp": 22,
        "config": {
          "size": 5,
          "startPos": {
            "x": 0,
            "y": 4
          },
          "goalPos": {
            "x": 4,
            "y": 1
          },
          "obstacles": [],
          "instructions": "Build your program with arrow buttons!"
        }
      },
      {
        "type": "seq",
        "title": "Coding Challenge",
        "description": "Receive the Master Innovator award — a perfect showcase score from the panel!",
        "xp": 30,
        "duration": "5 min",
        "steps": [
          "Read the challenge",
          "Plan your approach",
          "Write the solution",
          "Test it",
          "Submit"
        ],
        "instructions": "Receive the Master Innovator award — a perfect showcase score from the panel!",
        "context": "Challenge steps — order your problem-solving process!"
      }
    ]
  ]
};

export function getLessonInteractives(yr, lessonIdx) {
  return LESSON_INTERACTIVES[yr]?.[lessonIdx] ?? [];
}

export function getInteractiveCount() {
  return COURSE_ORDER.reduce((sum, yr) =>
    sum + (LESSON_INTERACTIVES[yr]?.reduce((s, acts) => s + acts.length, 0) ?? 0), 0);
}

export const SKILL_BADGES = [
  { id: 'algorithm-finder', emoji: '🔍', name: 'Algorithm Finder', desc: 'Complete Algorithm Hunt perfectly' },
  { id: 'route-master', emoji: '🗺️', name: 'Route Master', desc: 'Master a delivery sequence challenge' },
  { id: 'bug-hunter', emoji: '🐛', name: 'Bug Hunter', desc: 'Fix all debugging challenges in a lesson' },
  { id: 'pattern-master', emoji: '🎨', name: 'Pattern Master', desc: 'Create 5 correct patterns' },
  { id: 'quiz-master', emoji: '🧠', name: 'Quiz Master', desc: 'Score 100% on a lesson quiz' },
  { id: 'perfect-programmer', emoji: '⭐', name: 'Perfect Programmer', desc: 'Complete all activities in one lesson' },
  { id: 'speed-delivery', emoji: '⚡', name: 'Speed Delivery', desc: 'Win a delivery race challenge' },
  { id: 'loop-master', emoji: '🔁', name: 'Loop Master', desc: 'Master loop tracing activities' },
];
