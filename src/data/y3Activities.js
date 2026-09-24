// Year 3 Interactive Activities - ALL 72 Lessons with UNIQUE activities
// Each activity is specifically designed for its lesson theme

export const Y3_ACTIVITIES = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 1: Welcome to ByteBuddies! (Lessons 0-5) - Beemo 🤖
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Lesson 0: What is a Computer?
  [
    { type: "matching", title: "Computer Part Match! 🖥️", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "Monitor 🖥️", right: "Shows pictures and text" },
        { left: "Keyboard ⌨️", right: "You type on this" },
        { left: "Mouse 🖱️", right: "Moves the pointer" },
        { left: "CPU 🧠", right: "The brain that thinks" },
        { left: "Speaker 🔊", right: "Makes sounds" }
      ]}},
    { type: "sorting", title: "INPUT vs OUTPUT! 📥📤", xp: 20, duration: "4 min",
      config: { categories: [{ id: "input", label: "INPUT 📥" }, { id: "output", label: "OUTPUT 📤" }],
        items: [
          { id: "keyboard", label: "Keyboard ⌨️", category: "input" },
          { id: "mouse", label: "Mouse 🖱️", category: "input" },
          { id: "monitor", label: "Monitor 🖥️", category: "output" },
          { id: "speaker", label: "Speaker 🔊", category: "output" },
          { id: "microphone", label: "Microphone 🎤", category: "input" },
          { id: "printer", label: "Printer 🖨️", category: "output" }
        ]}},
    { type: "quiz", title: "Computer Quiz! 🎯", xp: 15, duration: "3 min",
      config: { questions: [
        { question: "What does a computer need to work?", options: ["Magic ✨", "Instructions 📋", "Sunshine ☀️"], correct: 1 },
        { question: "Is a smartphone a computer?", options: ["Yes! 👍", "No 👎"], correct: 0 },
        { question: "Which is an INPUT device?", options: ["Monitor", "Keyboard ✅", "Speaker"], correct: 1 }
      ]}}
  ],

  // Lesson 1: Algorithms
  [
    { type: "grid", title: "Guide Beemo Home! 🤖", xp: 25, duration: "5 min",
      config: { size: 4, startPos: { x: 0, y: 3 }, goalPos: { x: 3, y: 0 }, obstacles: [{ x: 1, y: 1 }] }},
    { type: "simulation", title: "Robot Sandwich! 🥪", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Making a sandwich - what's FIRST?", choices: [
          { text: "Get bread 🍞", feedback: "Perfect start!" },
          { text: "Spread butter", feedback: "Nothing to spread on!" },
          { text: "Eat it 😋", feedback: "No sandwich yet!" }
        ], correct: 0 },
        { situation: "You have bread. Now what?", choices: [
          { text: "Open the jar 🫙", feedback: "Yes! Open before spreading!" },
          { text: "Spread peanut butter", feedback: "Jar is closed!" },
          { text: "Cut it in half", feedback: "Nothing on it yet!" }
        ], correct: 0 }
      ]}},
    { type: "quiz", title: "Algorithm Quiz! 📋", xp: 15, duration: "3 min",
      config: { questions: [
        { question: "An algorithm is...", options: ["A robot 🤖", "Step-by-step instructions 📝", "A game 🎮"], correct: 1 },
        { question: "Does ORDER matter in algorithms?", options: ["Yes! ✅", "No ❌"], correct: 0 }
      ]}}
  ],

  // Lesson 2: Debugging
  [
    { type: "debug", title: "Bug Hunt! 🐛", xp: 25, duration: "5 min",
      config: { challenges: [
        { title: "Getting Dressed", buggySteps: ["Put on shoes 👟", "Put on socks 🧦", "Walk outside"], correctSteps: ["Put on socks 🧦", "Put on shoes 👟", "Walk outside"], hint: "Socks go UNDER shoes!" },
        { title: "Making Toast", buggySteps: ["Butter the toast 🧈", "Put bread in toaster", "Wait for toast"], correctSteps: ["Put bread in toaster", "Wait for toast", "Butter the toast 🧈"], hint: "Need TOAST before butter!" }
      ]}},
    { type: "quiz", title: "Debug Quiz! 🔍", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "What is a BUG?", options: ["A real insect 🦗", "A mistake in code ✅", "A feature"], correct: 1 },
        { question: "DEBUGGING means...", options: ["Adding bugs", "Finding and FIXING bugs ✅", "Ignoring problems"], correct: 1 },
        { question: "Who found the first computer bug?", options: ["Grace Hopper 👩‍💻", "A cat 🐱", "Nobody"], correct: 0 }
      ]}}
  ],

  // Lesson 3: Patterns and Loops
  [
    { type: "pattern", title: "Pattern Power! 🎨", xp: 20, duration: "4 min",
      target: [["👏", "👏", "🦶", "👏", "👏", "🦶"], ["🔴", "🔵", "🔴", "🔵", "🔴", "🔵"]], showSeconds: 4 },
    { type: "quiz", title: "Loop Quiz! 🔁", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "REPEAT 4 means do it...", options: ["Once", "4 times ✅", "Forever"], correct: 1 },
        { question: "👏👏🦶 👏👏🦶 👏👏❓", options: ["👏 Clap", "🦶 Stamp ✅", "🙌 Wave"], correct: 1 },
        { question: "Why use loops?", options: ["Make code LONGER", "Make code SHORTER ✅", "Add bugs"], correct: 1 }
      ]}},
    { type: "simulation", title: "Loop Calculator! 🔢", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "REPEAT 3: Clap, Stamp. Total actions?", choices: [
          { text: "3", feedback: "Clap AND Stamp each time!" },
          { text: "6 ✅", feedback: "Yes! 3 × 2 = 6!" },
          { text: "2", feedback: "That's one repeat only!" }
        ], correct: 1 }
      ]}}
  ],

  // Lesson 4: Decisions (IF-THEN)
  [
    { type: "simulation", title: "IF-THEN Adventure! 🔀", xp: 25, duration: "5 min",
      config: { steps: [
        { situation: "IF it is RAINING... 🌧️", choices: [
          { text: "THEN take umbrella ☂️ ✅", feedback: "Stay dry!" },
          { text: "THEN wear sunglasses", feedback: "Won't help in rain!" }
        ], correct: 0 },
        { situation: "IF light is RED... 🔴", choices: [
          { text: "THEN STOP! 🛑 ✅", feedback: "Safety first!" },
          { text: "THEN go faster!", feedback: "Danger!" }
        ], correct: 0 },
        { situation: "IF hungry... 🍽️", choices: [
          { text: "THEN eat 🍎 ✅", feedback: "Good logic!" },
          { text: "THEN go sleep", feedback: "Tummy rumbling!" }
        ], correct: 0 }
      ]}},
    { type: "matching", title: "IF-THEN Match! 🔗", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "IF sunny ☀️", right: "THEN wear sunscreen" },
        { left: "IF cold ❄️", right: "THEN wear coat" },
        { left: "IF tired 😴", right: "THEN sleep" },
        { left: "IF thirsty", right: "THEN drink water" }
      ]}},
    { type: "quiz", title: "Condition Quiz! 🧠", xp: 15, duration: "3 min",
      config: { questions: [
        { question: "A CONDITION is...", options: ["A wish", "TRUE or FALSE ✅", "A loop"], correct: 1 },
        { question: "ELSE means...", options: ["Same thing", "Otherwise... ✅", "Stop"], correct: 1 }
      ]}}
  ],

  // Lesson 5: Unit 1 Showcase
  [
    { type: "quiz", title: "Unit 1 Champion! 🏆", xp: 30, duration: "5 min",
      config: { questions: [
        { question: "An ALGORITHM is...", options: ["Instructions ✅", "A computer part", "A game"], correct: 0 },
        { question: "A BUG is...", options: ["An insect", "A code mistake ✅", "Good"], correct: 1 },
        { question: "REPEAT 3: Jump means...", options: ["1 jump", "3 jumps ✅", "No jumps"], correct: 1 },
        { question: "IF sunny THEN...", options: ["Wear raincoat", "Wear sunglasses ✅", "Stay inside"], correct: 1 }
      ]}},
    { type: "grid", title: "Beemo's Adventure! 🌟", xp: 25, duration: "5 min",
      config: { size: 5, startPos: { x: 0, y: 4 }, goalPos: { x: 4, y: 0 }, obstacles: [{ x: 1, y: 1 }, { x: 3, y: 2 }] }},
    { type: "characters", title: "🎉 Algorithm Explorer Badge!", xp: 20, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 2: Thinking Like a Computer (Lessons 6-11) - Pixel 🐱
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 6: Decomposition
  [
    { type: "simulation", title: "Pizza Party Planner! 🍕", xp: 25, duration: "5 min",
      config: { steps: [
        { situation: "Planning a party is BIG! First sub-task?", choices: [
          { text: "Choose date 📅 ✅", feedback: "Great decomposition!" },
          { text: "Eat pizza 🍕", feedback: "No pizza yet!" },
          { text: "Clean up 🧹", feedback: "Party hasn't happened!" }
        ], correct: 0 },
        { situation: "Date set! Next?", choices: [
          { text: "Invite friends 💌 ✅", feedback: "Who's coming?" },
          { text: "Open presents", feedback: "No presents yet!" }
        ], correct: 0 }
      ]}},
    { type: "matching", title: "Game Parts! 🎮", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "Players 👥", right: "Who plays" },
        { left: "Goal 🎯", right: "What to achieve" },
        { left: "Rules 📜", right: "What you can do" },
        { left: "Start 🏁", right: "How it begins" }
      ]}},
    { type: "quiz", title: "Decomposition Quiz! 🧩", xp: 15, duration: "3 min",
      config: { questions: [
        { question: "DECOMPOSITION means...", options: ["Making bigger", "Breaking into smaller parts ✅", "Adding bugs"], correct: 1 },
        { question: "A SUB-TASK is...", options: ["A big problem", "A small part ✅", "A bug"], correct: 1 }
      ]}}
  ],

  // Lesson 7: Pattern Recognition
  [
    { type: "pattern", title: "Pattern Detective! 🔍", xp: 25, duration: "4 min",
      target: [["🔴", "🔵", "🔴", "🔵", "🔴", "🔵"], ["🐱", "🐱", "🐶", "🐱", "🐱", "🐶"]], showSeconds: 4 },
    { type: "quiz", title: "Predict the Pattern! 🔮", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "🔵🔴🔵🔴🔵❓ Next?", options: ["🔵", "🔴 ✅", "🟢"], correct: 1 },
        { question: "⭐⭐🌙⭐⭐🌙⭐⭐❓", options: ["⭐", "🌙 ✅", "☀️"], correct: 1 },
        { question: "2, 4, 6, 8, ❓", options: ["9", "10 ✅", "12"], correct: 1 }
      ]}},
    { type: "collector", title: "Real Patterns! 🌍", xp: 15, duration: "3 min",
      config: { items: [
        { id: "zebra", emoji: "🦓", label: "Zebra stripes", isTarget: true },
        { id: "music", emoji: "🎵", label: "Music beat", isTarget: true },
        { id: "bricks", emoji: "🧱", label: "Brick wall", isTarget: true },
        { id: "cloud", emoji: "☁️", label: "Random cloud", isTarget: false }
      ], targetCount: 3 }}
  ],

  // Lesson 8: Abstraction
  [
    { type: "quiz", title: "What's Important? 🗺️", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "For a MAP to school, what matters?", options: ["Every grass blade", "Roads and turns ✅", "Bird names"], correct: 1 },
        { question: "A stick figure represents a...", options: ["Dog", "Car", "Person ✅"], correct: 2 },
        { question: "Why use icons?", options: ["They're pretty", "They SIMPLIFY ideas ✅", "No reason"], correct: 1 }
      ]}},
    { type: "collector", title: "Map to the Park! 🏞️", xp: 20, duration: "4 min",
      config: { instructions: "Choose ONLY important things for your map!",
        items: [
          { id: "roads", emoji: "🛣️", label: "Roads", isTarget: true },
          { id: "turns", emoji: "↪️", label: "Turns", isTarget: true },
          { id: "clouds", emoji: "☁️", label: "Clouds", isTarget: false },
          { id: "bugs", emoji: "🐛", label: "Bugs on path", isTarget: false }
        ], targetCount: 2 }},
    { type: "matching", title: "Symbols Match! 🔣", xp: 15, duration: "3 min",
      config: { pairs: [
        { left: "🚗", right: "A car" },
        { left: "✈️", right: "An airplane" },
        { left: "📱", right: "A phone" },
        { left: "❤️", right: "Love/health" }
      ]}}
  ],

  // Lesson 9: Computational Thinking in Action
  [
    { type: "simulation", title: "Pixel's Beach Trip! 🏖️", xp: 30, duration: "5 min",
      config: { steps: [
        { situation: "🧩 DECOMPOSE: First small part?", choices: [
          { text: "Pack bag 🎒 ✅", feedback: "Great decomposition!" },
          { text: "Already at beach!", feedback: "Haven't left yet!" }
        ], correct: 0 },
        { situation: "🔁 PATTERN: You always pack...", choices: [
          { text: "Sunscreen, towel, snack ✅", feedback: "You spot patterns!" },
          { text: "Winter coat", feedback: "Not a beach pattern!" }
        ], correct: 0 },
        { situation: "🎯 ABSTRACTION: What matters for directions?", choices: [
          { text: "A simple map 🗺️ ✅", feedback: "Maps show only important info!" },
          { text: "Cloud shapes", feedback: "Won't help!" }
        ], correct: 0 }
      ]}},
    { type: "quiz", title: "Four Pillars! 🏛️", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "BREAKING into parts is...", options: ["Decomposition ✅", "Looping", "Debugging"], correct: 0 },
        { question: "FINDING repeats is...", options: ["Abstraction", "Pattern Recognition ✅", "Sequencing"], correct: 1 },
        { question: "KEEPING only what matters is...", options: ["Debugging", "Abstraction ✅", "Looping"], correct: 1 }
      ]}}
  ],

  // Lesson 10: Design a Game Part 1
  [
    { type: "simulation", title: "Game Designer! 🎮", xp: 25, duration: "5 min",
      config: { steps: [
        { situation: "What TYPE of game?", choices: [
          { text: "Racing 🏎️", feedback: "Zoom! Exciting!" },
          { text: "Puzzle 🧩", feedback: "Clever! Think hard!" },
          { text: "Adventure 🗺️", feedback: "Explore new worlds!" }
        ], correct: null },
        { situation: "What's the GOAL?", choices: [
          { text: "Collect 10 coins 🪙", feedback: "Clear goal!" },
          { text: "Reach finish 🏁", feedback: "Race to win!" },
          { text: "Solve mystery 🔍", feedback: "Intriguing!" }
        ], correct: null }
      ]}},
    { type: "matching", title: "Game Elements! 🎯", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "Player 🎮", right: "Who plays" },
        { left: "Goal 🎯", right: "What to achieve" },
        { left: "Rules 📜", right: "What you can do" },
        { left: "Challenge 💪", right: "What makes it hard" }
      ]}},
    { type: "quiz", title: "Design Quiz! 🕹️", xp: 15, duration: "3 min",
      config: { questions: [
        { question: "Good games need...", options: ["No goal", "A CLEAR goal ✅", "Bugs"], correct: 1 },
        { question: "Before making a game...", options: ["Just start", "PLAN first ✅", "Give up"], correct: 1 }
      ]}}
  ],

  // Lesson 11: Design a Game Part 2 + Badge
  [
    { type: "quiz", title: "Review Checklist! ✅", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "Before sharing, check for...", options: ["Only title", "Goal, Rules, Challenge ✅", "Nothing"], correct: 1 },
        { question: "Feedback helps you...", options: ["Feel sad", "IMPROVE ✅", "Give up"], correct: 1 },
        { question: "PLAYTESTING means...", options: ["Playing forever", "Testing to find problems ✅", "Ignoring bugs"], correct: 1 }
      ]}},
    { type: "simulation", title: "Present Your Game! 🎤", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Start presentation with...", choices: [
          { text: "Game name and goal 🎯 ✅", feedback: "Great opening!" },
          { text: "The ending", feedback: "Don't skip ahead!" }
        ], correct: 0 },
        { situation: "Friend gives feedback. You...", choices: [
          { text: "Say 'Thanks!' and consider it ✅", feedback: "Feedback helps!" },
          { text: "Get angry", feedback: "Feedback is helpful!" }
        ], correct: 0 }
      ]}},
    { type: "characters", title: "🏆 Computational Thinker Badge!", xp: 20, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 3: Block Coding Adventures (Lessons 12-17) - Sparky ⚡
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 12: Welcome to Block Code
  [
    { type: "matching", title: "Block Code Interface! 🧩", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "🚩 Green Flag", right: "START program" },
        { left: "🛑 Red Stop", right: "STOP program" },
        { left: "🐱 Sprite", right: "Character you program" },
        { left: "📋 Blocks", right: "Commands that snap together" }
      ]}},
    { type: "quiz", title: "Block Coding Basics! 💻", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Block coding is like...", options: ["Sand", "LEGO bricks ✅", "Water"], correct: 1 },
        { question: "To START, click the...", options: ["Red button", "Green flag ✅", "Blue square"], correct: 1 },
        { question: "A SPRITE is...", options: ["A drink", "A character ✅", "A bug"], correct: 1 }
      ]}},
    { type: "grid", title: "Move Sparky! ⚡", xp: 25, duration: "5 min",
      config: { size: 4, startPos: { x: 0, y: 1 }, goalPos: { x: 3, y: 1 }, obstacles: [] }}
  ],

  // Lesson 13: Movement and Direction
  [
    { type: "grid", title: "Draw a Square! 🟦", xp: 25, duration: "5 min",
      config: { size: 5, startPos: { x: 1, y: 3 }, goalPos: { x: 1, y: 3 }, obstacles: [] }},
    { type: "quiz", title: "Direction Quiz! 🧭", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "A RIGHT ANGLE is...", options: ["45°", "90° ✅", "180°"], correct: 1 },
        { question: "A FULL SPIN is...", options: ["90°", "180°", "360° ✅"], correct: 2 },
        { question: "A SQUARE has how many turns?", options: ["2", "3", "4 ✅"], correct: 2 }
      ]}},
    { type: "simulation", title: "Turn Practice! 🤖", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "Facing UP ⬆️. Turn RIGHT 90°. Now facing?", choices: [
          { text: "➡️ Right ✅", feedback: "90° to the right!" },
          { text: "⬅️ Left", feedback: "That's turn LEFT!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 14: Events and Interactions
  [
    { type: "matching", title: "Events Match! 🎹", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "🚩 Flag Clicked", right: "Start program" },
        { left: "⬆️ Up Pressed", right: "Move up" },
        { left: "👆 Sprite Clicked", right: "Do something when clicked" },
        { left: "⌨️ Space Pressed", right: "Jump/special action" }
      ]}},
    { type: "quiz", title: "Events Quiz! ⚡", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "An EVENT is...", options: ["A bug", "Something that TRIGGERS action ✅", "A sprite"], correct: 1 },
        { question: "Pressing SPACE is an...", options: ["Event ✅", "Sprite", "Stage"], correct: 0 },
        { question: "Can one program have MANY events?", options: ["No", "Yes! ✅"], correct: 1 }
      ]}},
    { type: "simulation", title: "Dance Events! 💃", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "JUMP when SPACE pressed. The event is...", choices: [
          { text: "When SPACE → Jump ✅", feedback: "Perfect event!" },
          { text: "When clicked → Jump", feedback: "Different trigger!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 15: Loops in Block Code
  [
    { type: "quiz", title: "Loop Types! 🔄", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "REPEAT 10 runs code...", options: ["Once", "10 times ✅", "Forever"], correct: 1 },
        { question: "FOREVER loop runs...", options: ["Once", "10 times", "Until STOPPED ✅"], correct: 2 },
        { question: "For endless animation, use...", options: ["REPEAT 100", "FOREVER ✅"], correct: 1 }
      ]}},
    { type: "grid", title: "Loop Art! 🌀", xp: 25, duration: "5 min",
      config: { size: 5, startPos: { x: 0, y: 2 }, goalPos: { x: 4, y: 2 }, obstacles: [] }},
    { type: "simulation", title: "Animation Loops! 🌧️", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Rain that NEVER stops. Which loop?", choices: [
          { text: "FOREVER ♾️ ✅", feedback: "Rain doesn't stop!" },
          { text: "REPEAT 1", feedback: "One drop isn't rain!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 16: Variables
  [
    { type: "simulation", title: "Score Keeper! 📊", xp: 25, duration: "5 min",
      config: { steps: [
        { situation: "Keep SCORE in a game. You need a...", choices: [
          { text: "Variable 📦 ✅", feedback: "Variables store values!" },
          { text: "Sprite", feedback: "Sprites are characters!" }
        ], correct: 0 },
        { situation: "SET score TO 0. Get a point. SET score TO...", choices: [
          { text: "0", feedback: "Add the point!" },
          { text: "1 ✅", feedback: "SET gives a specific value!" }
        ], correct: 1 },
        { situation: "Score is 5. CHANGE BY 2. Now score is...", choices: [
          { text: "5", feedback: "CHANGE adds!" },
          { text: "2", feedback: "CHANGE adds, not replaces!" },
          { text: "7 ✅", feedback: "5 + 2 = 7!" }
        ], correct: 2 }
      ]}},
    { type: "quiz", title: "Variable Quiz! 📈", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "A VARIABLE is like a...", options: ["Closed door", "Box holding VALUE ✅", "Bug"], correct: 1 },
        { question: "SET score TO 10 makes score...", options: ["0", "10 ✅", "100"], correct: 1 },
        { question: "CHANGE lives BY -1 means...", options: ["Add life", "LOSE life ✅", "Nothing"], correct: 1 }
      ]}}
  ],

  // Lesson 17: My First Game
  [
    { type: "quiz", title: "Game Checklist! ✅", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "A game needs a clear...", options: ["Nothing", "GOAL ✅", "Bug"], correct: 1 },
        { question: "What makes a game CHALLENGING?", options: ["Being easy", "Obstacles/time limits ✅", "Bugs"], correct: 1 },
        { question: "GAME OVER when...", options: ["You start", "Lives reach 0 ✅", "Score goes up"], correct: 1 }
      ]}},
    { type: "simulation", title: "Game Logic! 🎮", xp: 25, duration: "5 min",
      config: { steps: [
        { situation: "Catch a ByteBuddy! What code runs?", choices: [
          { text: "CHANGE score BY 1, HIDE ✅", feedback: "Score up, disappears!" },
          { text: "Do nothing", feedback: "Players want rewards!" }
        ], correct: 0 },
        { situation: "Timer reaches 0...", choices: [
          { text: "Game continues", feedback: "Time's up!" },
          { text: "Show GAME OVER ✅", feedback: "See how you did!" }
        ], correct: 1 }
      ]}},
    { type: "characters", title: "🎮 Game Maker Badge!", xp: 25, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 4: Digital Storytelling (Lessons 18-23) - Stella ⭐
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 18: Story Basics
  [
    { type: "matching", title: "Story Parts! 📖", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "🌅 Beginning", right: "Where story starts" },
        { left: "🔥 Middle", right: "Problem/adventure" },
        { left: "🎬 End", right: "How resolved" },
        { left: "🦸 Character", right: "Who it's about" }
      ]}},
    { type: "simulation", title: "Story Builder! 📚", xp: 25, duration: "5 min",
      config: { steps: [
        { situation: "BEGINNING: Where does your story start?", choices: [
          { text: "Magic forest 🌲", feedback: "Mysterious!" },
          { text: "Outer space 🚀", feedback: "Adventure!" },
          { text: "Under sea 🌊", feedback: "Splash!" }
        ], correct: null }
      ]}},
    { type: "quiz", title: "Story Quiz! 📕", xp: 15, duration: "3 min",
      config: { questions: [
        { question: "A SCENE is like a...", options: ["Bug", "Chapter/moment ✅", "Variable"], correct: 1 },
        { question: "Good stories have...", options: ["No characters", "Beginning, middle, END ✅", "Only action"], correct: 1 }
      ]}}
  ],

  // Lesson 19: Characters & Backdrops
  [
    { type: "quiz", title: "Character Quiz! 🎭", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Good characters have...", options: ["No personality", "Wants and challenges ✅", "Nothing"], correct: 1 },
        { question: "A character's GOAL is...", options: ["What they WANT ✅", "Where they live", "Costume"], correct: 0 }
      ]}},
    { type: "simulation", title: "Character Interview! 🎤", xp: 25, duration: "4 min",
      config: { steps: [
        { situation: "What does your character WANT?", choices: [
          { text: "Find treasure 💎", feedback: "Clear goal!" },
          { text: "Make friend 🤝", feedback: "Heartwarming!" },
          { text: "Solve mystery 🔍", feedback: "Intriguing!" }
        ], correct: null }
      ]}},
    { type: "matching", title: "Emotions Match! 😀", xp: 15, duration: "3 min",
      config: { pairs: [
        { left: "😀 Happy", right: "'This is wonderful!'" },
        { left: "😢 Sad", right: "'I miss my friend'" },
        { left: "😱 Scared", right: "'What was that?!'" }
      ]}}
  ],

  // Lesson 20: Dialogue & Transitions
  [
    { type: "matching", title: "Broadcast Match! 📨", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "Broadcast: Scene 2", right: "Switch backdrop" },
        { left: "Broadcast: Dance", right: "All characters dance" },
        { left: "Broadcast: Game Over", right: "Show final score" }
      ]}},
    { type: "quiz", title: "Dialogue Quiz! 💬", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "SAY block creates a...", options: ["Sound", "Speech bubble ✅", "Movement"], correct: 1 },
        { question: "SAY 'Hello' FOR 2 SECONDS means...", options: ["Say forever", "Show bubble 2 seconds ✅"], correct: 1 },
        { question: "BROADCAST is used to...", options: ["Delete", "Send message to trigger events ✅", "Nothing"], correct: 1 }
      ]}},
    { type: "simulation", title: "Scene Transitions! 🎬", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "'Let's go to the forest!' What happens?", choices: [
          { text: "BROADCAST 'Forest' to change backdrop ✅", feedback: "Perfect!" },
          { text: "Nothing", feedback: "Need code to change!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 21: Sound & Interactivity
  [
    { type: "matching", title: "Sound Types! 🔊", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "🎵 Background music", right: "Plays whole time" },
        { left: "💥 Sound effect", right: "Short action sound" },
        { left: "🎤 Dialogue", right: "Characters speaking" }
      ]}},
    { type: "quiz", title: "Sound Quiz! 🎧", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "A SOUND EFFECT is...", options: ["Long music", "SHORT action sound ✅", "Silence"], correct: 1 },
        { question: "Background music should...", options: ["Play once", "LOOP/REPEAT ✅", "Stop"], correct: 1 }
      ]}},
    { type: "simulation", title: "Add Sound! 🎬", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "SPOOKY forest... Add what?", choices: [
          { text: "🎵 Creepy music ✅", feedback: "Sets the mood!" },
          { text: "🎺 Party music", feedback: "Not spooky!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 22: Story Festival Day 1
  [
    { type: "quiz", title: "Story Review! ✅", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Complete story has...", options: ["Only beginning", "Beginning, MIDDLE, end ✅", "No characters"], correct: 1 },
        { question: "Good dialogue needs...", options: ["No pauses", "WAIT blocks ✅", "All at once"], correct: 1 }
      ]}},
    { type: "simulation", title: "Give Feedback! ⭐", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Give feedback about...", choices: [
          { text: "What you LIKED ✅", feedback: "Positive and specific!" },
          { text: "'It was OK'", feedback: "Not helpful!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 23: Story Festival Day 2
  [
    { type: "quiz", title: "Storytelling Champion! 🌟", xp: 30, duration: "5 min",
      config: { questions: [
        { question: "Stories need...", options: ["Beginning, middle, END ✅", "Only action", "No characters"], correct: 0 },
        { question: "Characters should have...", options: ["No goals", "A WANT and OBSTACLE ✅", "Nothing"], correct: 1 },
        { question: "Sound makes stories...", options: ["Boring", "Come ALIVE ✅", "Confusing"], correct: 1 }
      ]}},
    { type: "characters", title: "🌟 Digital Storyteller Badge!", xp: 25, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 5: Data Detectives (Lessons 24-29) - Digit 🦕
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 24: What is Data?
  [
    { type: "sorting", title: "Data vs Information! 📊", xp: 25, duration: "4 min",
      config: { categories: [{ id: "data", label: "RAW DATA 📋" }, { id: "info", label: "INFORMATION 💡" }],
        items: [
          { id: "numbers", label: "23, 45, 12, 67", category: "data" },
          { id: "temps", label: "Hottest day was 23°", category: "info" },
          { id: "names", label: "Amy, Ben, Carol", category: "data" },
          { id: "winner", label: "Amy won with most votes", category: "info" }
        ]}},
    { type: "quiz", title: "Data Quiz! 📈", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "DATA is...", options: ["Already understood", "Raw facts/numbers ✅", "A picture"], correct: 1 },
        { question: "INFORMATION is...", options: ["Messy numbers", "Data that makes SENSE ✅", "Nothing"], correct: 1 }
      ]}},
    { type: "matching", title: "Data Examples! 🗃️", xp: 15, duration: "3 min",
      config: { pairs: [
        { left: "🌡️ 23, 25, 21, 24", right: "Temperature data" },
        { left: "📊 Avg temp is 23°", right: "Temperature info" },
        { left: "🗳️ 12, 15, 8", right: "Vote count data" }
      ]}}
  ],

  // Lesson 25: Collecting Data
  [
    { type: "simulation", title: "Tally Master! 📋", xp: 25, duration: "5 min",
      config: { steps: [
        { situation: "Survey: What's your favourite colour? How to record?", choices: [
          { text: "Tally marks: IIII II ✅", feedback: "Easy to count!" },
          { text: "Remember in head", feedback: "You'll forget!" }
        ], correct: 0 },
        { situation: "Red has IIII, Blue has IIII II. Which has more?", choices: [
          { text: "Red (4)", feedback: "Count again!" },
          { text: "Blue (7) ✅", feedback: "7 > 4!" }
        ], correct: 1 }
      ]}},
    { type: "quiz", title: "Survey Quiz! 📝", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "A SURVEY collects...", options: ["Random stuff", "DATA from people ✅", "Nothing"], correct: 1 },
        { question: "TALLY marks help us...", options: ["Get confused", "COUNT easily ✅", "Draw pictures"], correct: 1 }
      ]}}
  ],

  // Lesson 26: Presenting Data
  [
    { type: "matching", title: "Chart Types! 📊", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "📊 Bar Chart", right: "Compare amounts" },
        { left: "🥧 Pie Chart", right: "Show parts of whole" },
        { left: "📈 Line Graph", right: "Show change over time" },
        { left: "🖼️ Pictogram", right: "Use pictures to show data" }
      ]}},
    { type: "quiz", title: "Charts Quiz! 📉", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "To compare favourite foods, use...", options: ["Line graph", "Bar chart ✅", "Nothing"], correct: 1 },
        { question: "To show change over time, use...", options: ["Bar chart", "Pie chart", "Line graph ✅"], correct: 2 }
      ]}},
    { type: "simulation", title: "Human Bar Chart! 📊", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "10 like pizza, 5 like pasta. Bar chart shows...", choices: [
          { text: "Pizza bar is TALLER ✅", feedback: "More votes = taller bar!" },
          { text: "Same height", feedback: "Different amounts!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 27: Binary
  [
    { type: "quiz", title: "Binary Basics! 0️⃣1️⃣", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "Computers only understand...", options: ["Words", "0s and 1s ✅", "Pictures"], correct: 1 },
        { question: "Binary has how many digits?", options: ["10", "2 ✅", "26"], correct: 1 },
        { question: "In binary, 0 means...", options: ["ON", "OFF ✅", "Maybe"], correct: 1 },
        { question: "In binary, 1 means...", options: ["ON ✅", "OFF", "Maybe"], correct: 0 }
      ]}},
    { type: "matching", title: "Binary Match! 💾", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "0", right: "OFF / False" },
        { left: "1", right: "ON / True" },
        { left: "01", right: "Number 1" },
        { left: "10", right: "Number 2" }
      ]}},
    { type: "simulation", title: "Binary Flashcards! 🔢", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Cards 8,4,2,1. Make 5. Which UP?", choices: [
          { text: "4 and 1 (4+1=5) ✅", feedback: "Binary thinking!" },
          { text: "8 and 4", feedback: "That's 12!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 28: Data in Everyday Life
  [
    { type: "collector", title: "Data Detective! 🔍", xp: 25, duration: "4 min",
      config: { instructions: "Find where DATA is collected!",
        items: [
          { id: "school", emoji: "🏫", label: "School register", isTarget: true },
          { id: "doctor", emoji: "🏥", label: "Doctor's records", isTarget: true },
          { id: "game", emoji: "🎮", label: "Game saves progress", isTarget: true },
          { id: "cloud", emoji: "☁️", label: "A cloud", isTarget: false }
        ], targetCount: 3 }},
    { type: "quiz", title: "Data Privacy! 🔒", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Data about YOU is...", options: ["Not important", "PERSONAL data ✅", "Shareable anywhere"], correct: 1 },
        { question: "Who should see your data?", options: ["Everyone", "Only trusted people ✅", "Nobody ever"], correct: 1 }
      ]}}
  ],

  // Lesson 29: Data Dashboard
  [
    { type: "quiz", title: "Dashboard Check! 📊", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "A DASHBOARD shows...", options: ["Random stuff", "Key information at a glance ✅", "Nothing"], correct: 1 },
        { question: "Good dashboards are...", options: ["Confusing", "Clear and visual ✅", "Text only"], correct: 1 },
        { question: "Charts help us...", options: ["Get confused", "UNDERSTAND data ✅", "Nothing"], correct: 1 }
      ]}},
    { type: "simulation", title: "Dashboard Gallery! 🖼️", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Give feedback on a dashboard...", choices: [
          { text: "Is it easy to read? ✅", feedback: "Good question!" },
          { text: "What colour is it?", feedback: "Not the most important!" }
        ], correct: 0 }
      ]}},
    { type: "characters", title: "🦕 Data Detective Badge!", xp: 25, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 6: How Computers Work (Lessons 30-35) - Chip 💾
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 30: Hardware & Software
  [
    { type: "sorting", title: "Hard vs Soft Sort! 💻", xp: 25, duration: "4 min",
      config: { categories: [{ id: "hardware", label: "HARDWARE (touch it)" }, { id: "software", label: "SOFTWARE (can't touch)" }],
        items: [
          { id: "keyboard", label: "Keyboard ⌨️", category: "hardware" },
          { id: "monitor", label: "Monitor 🖥️", category: "hardware" },
          { id: "scratch", label: "Scratch app", category: "software" },
          { id: "youtube", label: "YouTube", category: "software" },
          { id: "mouse", label: "Mouse 🖱️", category: "hardware" },
          { id: "word", label: "Microsoft Word", category: "software" }
        ]}},
    { type: "quiz", title: "Hardware/Software Quiz! 🔧", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "HARDWARE is...", options: ["Programs", "Physical parts you touch ✅", "Websites"], correct: 1 },
        { question: "SOFTWARE is...", options: ["Programs/instructions ✅", "Physical parts", "Cables"], correct: 0 },
        { question: "Is YouTube hardware or software?", options: ["Hardware", "Software ✅"], correct: 1 }
      ]}}
  ],

  // Lesson 31: IPO Model
  [
    { type: "matching", title: "IPO Match! ⚙️", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "INPUT 📥", right: "Info going IN" },
        { left: "PROCESSING 🧠", right: "Computer thinks" },
        { left: "OUTPUT 📤", right: "Info coming OUT" }
      ]}},
    { type: "simulation", title: "Human Computer! 🤖", xp: 25, duration: "5 min",
      config: { steps: [
        { situation: "Type 3+5 on keyboard. That's...", choices: [
          { text: "INPUT ✅", feedback: "Info going IN!" },
          { text: "OUTPUT", feedback: "That's what comes OUT!" }
        ], correct: 0 },
        { situation: "CPU calculates 3+5=8. That's...", choices: [
          { text: "PROCESSING ✅", feedback: "Computer thinking!" },
          { text: "INPUT", feedback: "That already happened!" }
        ], correct: 0 },
        { situation: "Screen shows '8'. That's...", choices: [
          { text: "OUTPUT ✅", feedback: "Info coming OUT!" },
          { text: "INPUT", feedback: "That goes IN!" }
        ], correct: 0 }
      ]}},
    { type: "quiz", title: "IPO Quiz! 💭", xp: 15, duration: "3 min",
      config: { questions: [
        { question: "Microphone captures sound. That's...", options: ["Input ✅", "Output", "Processing"], correct: 0 },
        { question: "Speaker plays music. That's...", options: ["Input", "Output ✅", "Processing"], correct: 1 }
      ]}}
  ],

  // Lesson 32: Storage (RAM vs Hard Drive)
  [
    { type: "matching", title: "Storage Types! 💾", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "RAM 🧠", right: "Fast but TEMPORARY" },
        { left: "Hard Drive 💿", right: "Slower but PERMANENT" },
        { left: "USB stick 🔌", right: "Portable storage" }
      ]}},
    { type: "quiz", title: "Memory Quiz! 🧠", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "RAM is...", options: ["Permanent", "Temporary - clears when OFF ✅", "A hard drive"], correct: 1 },
        { question: "Hard drive keeps data when power is...", options: ["On only", "Off too! ✅"], correct: 1 },
        { question: "Why use RAM if it forgets?", options: ["No reason", "It's FAST! ✅", "It's cheap"], correct: 1 }
      ]}},
    { type: "simulation", title: "RAM Bucket! 🪣", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "RAM is like a bucket with holes. When you stop pouring (power off)...", choices: [
          { text: "It empties! ✅", feedback: "RAM forgets when power is off!" },
          { text: "Stays full", feedback: "RAM empties when off!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 33: Networks
  [
    { type: "matching", title: "Network Parts! 🌐", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "Router 📡", right: "Connects devices to internet" },
        { left: "WiFi 📶", right: "Wireless connection" },
        { left: "Cable 🔌", right: "Wired connection" },
        { left: "Server 🖥️", right: "Stores websites" }
      ]}},
    { type: "quiz", title: "Network Quiz! 🕸️", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "A NETWORK is...", options: ["One computer", "Connected computers ✅", "A printer"], correct: 1 },
        { question: "A ROUTER does what?", options: ["Prints", "Connects to internet ✅", "Types"], correct: 1 },
        { question: "WiFi uses...", options: ["Cables", "Radio waves ✅", "Magic"], correct: 1 }
      ]}},
    { type: "simulation", title: "Network String Web! 🕷️", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "If one path is blocked, data...", choices: [
          { text: "Finds another way! ✅", feedback: "Networks have many paths!" },
          { text: "Gives up", feedback: "Networks are clever!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 34: Careers in Computing
  [
    { type: "matching", title: "Tech Jobs Match! 💼", xp: 25, duration: "4 min",
      config: { pairs: [
        { left: "Game Developer 🎮", right: "Makes video games" },
        { left: "Web Designer 🌐", right: "Creates websites" },
        { left: "Data Scientist 📊", right: "Analyzes data" },
        { left: "Cybersecurity 🔒", right: "Keeps data safe" }
      ]}},
    { type: "quiz", title: "Career Quiz! 👷", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Doctors use computers for...", options: ["Nothing", "X-rays, patient records ✅", "Playing games"], correct: 1 },
        { question: "Farmers use computers for...", options: ["Nothing", "GPS tractors, planning ✅", "Playing games"], correct: 1 },
        { question: "Are there jobs WITHOUT computers?", options: ["Most jobs", "Very few now! ✅", "All jobs"], correct: 1 }
      ]}}
  ],

  // Lesson 35: Future of Computing
  [
    { type: "quiz", title: "Future Tech! 🔮", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "AI means...", options: ["Alien Intelligence", "Artificial Intelligence ✅", "Any Intelligence"], correct: 1 },
        { question: "Robots in future might...", options: ["Take all jobs", "Help humans with tasks ✅", "Nothing"], correct: 1 },
        { question: "Self-driving cars use...", options: ["Magic", "Sensors and AI ✅", "Horses"], correct: 1 }
      ]}},
    { type: "simulation", title: "Robot Jobs Debate! 🤖", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Should robots do human jobs?", choices: [
          { text: "Yes - help with hard tasks", feedback: "One view!" },
          { text: "No - humans should work", feedback: "Another view!" },
          { text: "Depends - some jobs ✅", feedback: "Balanced thinking!" }
        ], correct: 2 }
      ]}},
    { type: "characters", title: "💾 Hardware Hero Badge!", xp: 25, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 7: Online Safety (Lessons 36-41) - Shield 🛡️
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 36: Digital Footprint
  [
    { type: "quiz", title: "Digital Footprint! 👣", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "A digital footprint is...", options: ["Your real footprint", "Trail you leave ONLINE ✅", "A game"], correct: 1 },
        { question: "Do online posts disappear?", options: ["Yes, always", "NO - they can last FOREVER ✅"], correct: 1 },
        { question: "Before posting, ask...", options: ["Who cares?", "Will I be proud of this later? ✅", "Nothing"], correct: 1 }
      ]}},
    { type: "sorting", title: "Good vs Bad Footprints! 👣", xp: 20, duration: "4 min",
      config: { categories: [{ id: "good", label: "GOOD footprint 👍" }, { id: "bad", label: "BAD footprint 👎" }],
        items: [
          { id: "kind", label: "Kind comment", category: "good" },
          { id: "help", label: "Helping others", category: "good" },
          { id: "mean", label: "Mean message", category: "bad" },
          { id: "secret", label: "Sharing secrets", category: "bad" }
        ]}}
  ],

  // Lesson 37: Cyberbullying
  [
    { type: "quiz", title: "Upstander Quiz! 🦸", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "CYBERBULLYING is...", options: ["Fun", "Hurting others ONLINE ✅", "A game"], correct: 1 },
        { question: "A BYSTANDER does...", options: ["Nothing, watches", "Helps ✅", "Joins in"], correct: 0 },
        { question: "An UPSTANDER does...", options: ["Nothing", "HELPS the person being bullied ✅", "Joins in"], correct: 1 }
      ]}},
    { type: "simulation", title: "Upstander Role-Play! 💪", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "You see mean comments about a classmate. You...", choices: [
          { text: "Tell a trusted adult ✅", feedback: "UPSTANDER action!" },
          { text: "Join in", feedback: "That's bullying!" },
          { text: "Ignore it", feedback: "That's being a bystander" }
        ], correct: 0 },
        { situation: "Someone sends you a mean message. You...", choices: [
          { text: "Reply angrily", feedback: "Don't engage!" },
          { text: "Screenshot, don't reply, tell adult ✅", feedback: "Safe response!" }
        ], correct: 1 }
      ]}}
  ],

  // Lesson 38: Reliable Information
  [
    { type: "quiz", title: "Fake or Real? 🔍", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "Everything online is...", options: ["True", "NOT always true ✅", "Always fake"], correct: 1 },
        { question: "Before believing news, you should...", options: ["Share immediately", "CHECK the source ✅", "Ignore it"], correct: 1 },
        { question: "SIFT means...", options: ["Share It Fast Today", "Stop, Investigate, Find, Trace ✅", "Nothing"], correct: 1 }
      ]}},
    { type: "simulation", title: "SIFT Challenge! 🕵️", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "'Goldfish have 3-second memories' - is this true?", choices: [
          { text: "Yes, I heard it before", feedback: "That doesn't make it true!" },
          { text: "SIFT - check other sources! ✅", feedback: "Good! (It's actually FALSE!)" }
        ], correct: 1 }
      ]}}
  ],

  // Lesson 39: Screen Time
  [
    { type: "quiz", title: "Balance Quiz! ⚖️", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Too much screen time can...", options: ["Be fine always", "Affect sleep and health ✅", "Nothing"], correct: 1 },
        { question: "Balance means...", options: ["All screens", "Mix of activities ✅", "No screens"], correct: 1 }
      ]}},
    { type: "collector", title: "Healthy Activities! 🏃", xp: 20, duration: "4 min",
      config: { instructions: "Choose activities for BALANCE!",
        items: [
          { id: "exercise", emoji: "🏃", label: "Exercise", isTarget: true },
          { id: "reading", emoji: "📖", label: "Reading", isTarget: true },
          { id: "family", emoji: "👨‍👩‍👧", label: "Family time", isTarget: true },
          { id: "endless", emoji: "📱", label: "Endless scrolling", isTarget: false }
        ], targetCount: 3 }},
    { type: "simulation", title: "Balance Wheel! ⚖️", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "Your wheel shows MOSTLY screen time. You should...", choices: [
          { text: "Add more exercise/outdoor time ✅", feedback: "Balance!" },
          { text: "Add more screen time", feedback: "Already too much!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 40: Safety Project Part 1
  [
    { type: "matching", title: "Safety Topics! 🛡️", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "Digital Footprint 👣", right: "Trail you leave online" },
        { left: "Cyberbullying 😢", right: "Hurting others online" },
        { left: "Fake News 📰", right: "False information" },
        { left: "Screen Time ⏰", right: "How long on devices" }
      ]}},
    { type: "quiz", title: "Planning Quiz! 📝", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Your safety guide is for...", options: ["Adults", "Younger kids (Year 2) ✅", "Yourself"], correct: 1 },
        { question: "Good guide needs...", options: ["Just pictures", "Clear tips and pictures ✅", "Long words"], correct: 1 }
      ]}}
  ],

  // Lesson 41: Safety Project Part 2
  [
    { type: "quiz", title: "Safety Champion! 🏆", xp: 30, duration: "5 min",
      config: { questions: [
        { question: "Digital footprints last...", options: ["1 day", "Forever ✅", "1 week"], correct: 1 },
        { question: "Upstanders...", options: ["Do nothing", "HELP bullied people ✅", "Join in"], correct: 1 },
        { question: "Before sharing, always...", options: ["Just share", "Check if TRUE ✅", "Don't care"], correct: 1 },
        { question: "Good balance means...", options: ["All screens", "Mix of activities ✅", "No screens"], correct: 1 }
      ]}},
    { type: "characters", title: "🛡️ Online Safety Champion Badge!", xp: 25, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 8: Networks & Internet (Lessons 42-47) - Netty 🌐
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 42: What is the Internet?
  [
    { type: "matching", title: "Internet vs Web! 🕸️", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "Internet 🌐", right: "Network of computers" },
        { left: "World Wide Web 🕸️", right: "Websites on internet" },
        { left: "Packet 📦", right: "Small piece of data" },
        { left: "Router 📡", right: "Directs packets" }
      ]}},
    { type: "quiz", title: "Internet Quiz! 🌐", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "The Internet is...", options: ["A website", "A network of NETWORKS ✅", "A computer"], correct: 1 },
        { question: "Data travels in...", options: ["One big file", "Small PACKETS ✅", "Magic"], correct: 1 },
        { question: "Packets can take...", options: ["Only one path", "Different paths ✅", "No paths"], correct: 1 }
      ]}},
    { type: "simulation", title: "Packet Relay! 📦", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "A message is split into 4 packets. They can...", choices: [
          { text: "Travel different routes and reassemble ✅", feedback: "Yes! That's how internet works!" },
          { text: "Only travel together", feedback: "Packets can split up!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 43: URLs & Browsers
  [
    { type: "matching", title: "URL Parts! 🔗", xp: 25, duration: "4 min",
      config: { pairs: [
        { left: "https://", right: "Protocol (secure)" },
        { left: "www.", right: "World Wide Web" },
        { left: ".com / .org", right: "Domain extension" },
        { left: "/page", right: "Path to specific page" }
      ]}},
    { type: "quiz", title: "URL Quiz! 🌐", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "URL stands for...", options: ["Under Real Lines", "Uniform Resource Locator ✅", "Nothing"], correct: 1 },
        { question: "A BROWSER is...", options: ["A website", "Software to view websites ✅", "A game"], correct: 1 },
        { question: "https means...", options: ["Not secure", "Secure ✅", "Slow"], correct: 1 }
      ]}}
  ],

  // Lesson 44: Search Engines
  [
    { type: "quiz", title: "Search Quiz! 🔍", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "A search engine...", options: ["Stores all websites", "FINDS websites for you ✅", "Creates websites"], correct: 1 },
        { question: "Good keywords are...", options: ["Very long sentences", "Specific words ✅", "Random letters"], correct: 1 },
        { question: "First result is always...", options: ["Best", "NOT always best ✅", "Only option"], correct: 1 }
      ]}},
    { type: "simulation", title: "Keyword Hunt! 🎯", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Find when the Great Fire of London happened. Search...", choices: [
          { text: "'Great Fire of London date' ✅", feedback: "Specific keywords!" },
          { text: "'stuff about history'", feedback: "Too vague!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 45: Email
  [
    { type: "matching", title: "Email Parts! ✉️", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "To:", right: "Who receives it" },
        { left: "Subject:", right: "What it's about" },
        { left: "Body:", right: "The message" },
        { left: "Attachment 📎", right: "Extra files" }
      ]}},
    { type: "quiz", title: "Email Quiz! 📧", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "CC means...", options: ["Carbon Copy (extra recipients) ✅", "Computer Code", "Nothing"], correct: 0 },
        { question: "An attachment is...", options: ["The subject", "An extra FILE ✅", "The sender"], correct: 1 },
        { question: "Reply goes to...", options: ["Everyone", "Just the sender ✅", "Nobody"], correct: 1 }
      ]}},
    { type: "simulation", title: "Postal Email! 📬", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "Wrong email address means...", choices: [
          { text: "Message still arrives", feedback: "Like wrong postal address!" },
          { text: "Message can't be delivered ✅", feedback: "Correct address matters!" }
        ], correct: 1 }
      ]}}
  ],

  // Lesson 46: Networks Everywhere
  [
    { type: "collector", title: "Network Hunt! 🔍", xp: 25, duration: "4 min",
      config: { instructions: "Find network equipment!",
        items: [
          { id: "router", emoji: "📡", label: "WiFi Router", isTarget: true },
          { id: "cable", emoji: "🔌", label: "Ethernet Cable", isTarget: true },
          { id: "printer", emoji: "🖨️", label: "Network Printer", isTarget: true },
          { id: "pencil", emoji: "✏️", label: "Pencil", isTarget: false }
        ], targetCount: 3 }},
    { type: "quiz", title: "Networks Quiz! 🌐", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "School computers connect via...", options: ["Magic", "A NETWORK ✅", "Hopes"], correct: 1 },
        { question: "If router breaks...", options: ["Nothing happens", "No internet for connected devices ✅"], correct: 1 }
      ]}}
  ],

  // Lesson 47: IoT Smart School
  [
    { type: "matching", title: "Smart Devices! 🏠", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "Smart thermostat 🌡️", right: "Controls temperature" },
        { left: "Smart lights 💡", right: "Turn on/off remotely" },
        { left: "Security camera 📷", right: "Monitors area" },
        { left: "Smart speaker 🔊", right: "Voice assistant" }
      ]}},
    { type: "quiz", title: "IoT Quiz! 🔌", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "IoT means...", options: ["Internet of Things ✅", "I own Technology", "Nothing"], correct: 0 },
        { question: "Smart devices connect to...", options: ["Nothing", "Internet/network ✅", "Only each other"], correct: 1 },
        { question: "IoT can make schools...", options: ["The same", "More efficient ✅", "Worse"], correct: 1 }
      ]}},
    { type: "characters", title: "🌐 Network Navigator Badge!", xp: 25, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 9: Creative Computing (Lessons 48-53) - Aria 🎨
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 48: Digital Art - RGB
  [
    { type: "matching", title: "RGB Colours! 🌈", xp: 25, duration: "4 min",
      config: { pairs: [
        { left: "R 🔴", right: "Red light" },
        { left: "G 🟢", right: "Green light" },
        { left: "B 🔵", right: "Blue light" },
        { left: "All 3 mixed", right: "White light!" }
      ]}},
    { type: "quiz", title: "Colour Quiz! 🎨", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Red + Green light =", options: ["Brown", "Yellow! ✅", "Purple"], correct: 1 },
        { question: "RGB mixing is called...", options: ["Subtractive", "Additive ✅", "Neither"], correct: 1 },
        { question: "A PIXEL is...", options: ["A sprite", "Tiny colour dot ✅", "A file"], correct: 1 }
      ]}},
    { type: "simulation", title: "Colour Mixing! 🔬", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "Red + Blue light =", choices: [
          { text: "Purple/Magenta! ✅", feedback: "Light mixing!" },
          { text: "Green", feedback: "That's different!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 49: Animation
  [
    { type: "quiz", title: "Animation Quiz! 🎬", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "Animation is many...", options: ["Sounds", "Pictures shown quickly ✅", "Words"], correct: 1 },
        { question: "Each picture is called a...", options: ["Slide", "FRAME ✅", "Page"], correct: 1 },
        { question: "Smooth animation needs...", options: ["Few frames", "Many frames ✅", "One frame"], correct: 1 }
      ]}},
    { type: "simulation", title: "Flip Book! 📓", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Bouncing ball needs how many frames to look smooth?", choices: [
          { text: "2 frames", feedback: "Too jerky!" },
          { text: "10+ frames ✅", feedback: "Smooth motion!" }
        ], correct: 1 },
        { situation: "Professional animation uses... per second", choices: [
          { text: "1-5 frames", feedback: "Way too slow!" },
          { text: "24-30 frames ✅", feedback: "Industry standard!" }
        ], correct: 1 }
      ]}}
  ],

  // Lesson 50: Music Loops
  [
    { type: "matching", title: "Music Terms! 🎵", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "NOTE 🎵", right: "Single sound" },
        { left: "LOOP 🔁", right: "Repeating pattern" },
        { left: "TEMPO ⏱️", right: "Speed of music" },
        { left: "BEAT 🥁", right: "Rhythm pulse" }
      ]}},
    { type: "quiz", title: "Music Quiz! 🎶", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "A music LOOP...", options: ["Plays once", "REPEATS ✅", "Is silent"], correct: 1 },
        { question: "TEMPO is the...", options: ["Volume", "Speed ✅", "Pitch"], correct: 1 },
        { question: "Loops can be...", options: ["Only drums", "Any instruments ✅", "Only singing"], correct: 1 }
      ]}},
    { type: "simulation", title: "Body Percussion! 👏", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "CLAP group and STOMP group play together. This is...", choices: [
          { text: "Layering loops ✅", feedback: "Building music!" },
          { text: "A mistake", feedback: "It's meant to layer!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 51: Sound Effects
  [
    { type: "matching", title: "Sound Types! 🔊", xp: 20, duration: "4 min",
      config: { pairs: [
        { left: "Foley 🎬", right: "Recreated sound effects" },
        { left: "Footsteps 👣", right: "Walking sounds" },
        { left: "Ambience 🌳", right: "Background sounds" }
      ]}},
    { type: "quiz", title: "Foley Quiz! 🎤", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "FOLEY artists...", options: ["Sing songs", "Create sound effects ✅", "Write scripts"], correct: 1 },
        { question: "Movie rain sounds might use...", options: ["Real rain only", "Bacon sizzling! ✅", "Silence"], correct: 1 },
        { question: "Sound effects add...", options: ["Nothing", "Emotion and realism ✅", "Confusion"], correct: 1 }
      ]}},
    { type: "simulation", title: "Create Sounds! 🎵", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "Need a fire crackling sound. You could use...", choices: [
          { text: "Crumpling cellophane ✅", feedback: "Creative foley!" },
          { text: "Real fire only", feedback: "Foley is creative!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 52: Exhibition Prep
  [
    { type: "quiz", title: "Artist Statement! 🎨", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "An artist statement explains...", options: ["The price", "What you made and WHY ✅", "Nothing"], correct: 1 },
        { question: "Good statements are...", options: ["Very long", "Clear and personal ✅", "Confusing"], correct: 1 }
      ]}},
    { type: "simulation", title: "Write Statement! ✍️", xp: 25, duration: "4 min",
      config: { steps: [
        { situation: "Your statement should include...", choices: [
          { text: "What you made, why, what you're proud of ✅", feedback: "Complete statement!" },
          { text: "Just the title", feedback: "Explain more!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 53: Gallery Opening
  [
    { type: "quiz", title: "Creative Champion! 🏆", xp: 30, duration: "5 min",
      config: { questions: [
        { question: "RGB stands for...", options: ["Red Green Blue ✅", "Really Good Bytes", "Nothing"], correct: 0 },
        { question: "Animation uses many...", options: ["Loops", "FRAMES ✅", "Songs"], correct: 1 },
        { question: "Music loops...", options: ["Play once", "REPEAT ✅", "Are silent"], correct: 1 },
        { question: "Foley is...", options: ["A name", "Creating sound effects ✅", "A colour"], correct: 1 }
      ]}},
    { type: "characters", title: "🎨 Digital Creator Badge!", xp: 25, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 10: Advanced Coding (Lessons 54-59) - Logic 🦁
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 54: Debugging Challenges
  [
    { type: "debug", title: "Bug Buster! 🐛", xp: 30, duration: "5 min",
      config: { challenges: [
        { title: "Wrong Variable", buggySteps: ["SET score TO 0", "CHANGE score BY -1", "SHOW score"], correctSteps: ["SET score TO 0", "CHANGE score BY 1", "SHOW score"], hint: "Should ADD not subtract!" },
        { title: "Missing Event", buggySteps: ["MOVE 10 steps", "TURN 90"], correctSteps: ["WHEN flag clicked", "MOVE 10 steps", "TURN 90"], hint: "Needs a trigger!" }
      ]}},
    { type: "quiz", title: "Debug Quiz! 🔧", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "First step in debugging...", options: ["Delete everything", "FIND the bug ✅", "Give up"], correct: 1 },
        { question: "TRACE means...", options: ["Draw pictures", "Follow code step by step ✅", "Run fast"], correct: 1 }
      ]}}
  ],

  // Lesson 55: Functions Part 1
  [
    { type: "matching", title: "Function Basics! ⚙️", xp: 25, duration: "4 min",
      config: { pairs: [
        { left: "DEFINE 📝", right: "Create a custom block" },
        { left: "CALL 📞", right: "Use the custom block" },
        { left: "Reusable 🔁", right: "Use many times" }
      ]}},
    { type: "quiz", title: "Functions Quiz! 🧩", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "A function is...", options: ["A bug", "Reusable code block ✅", "A sprite"], correct: 1 },
        { question: "Why use functions?", options: ["Add bugs", "SAVE TIME, reuse code ✅", "No reason"], correct: 1 },
        { question: "DEFINE creates...", options: ["A bug", "A new custom block ✅", "Nothing"], correct: 1 }
      ]}},
    { type: "simulation", title: "Assembly Line! 🏭", xp: 15, duration: "3 min",
      config: { steps: [
        { situation: "Draw square: Move, Turn, Move, Turn, Move, Turn, Move, Turn. OR...", choices: [
          { text: "CALL 'Draw Square' once ✅", feedback: "Functions save time!" },
          { text: "Type it all every time", feedback: "That's a lot of work!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 56: Functions Part 2
  [
    { type: "quiz", title: "Function Recipe! 📖", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "A function RECIPE includes...", options: ["Just the name", "Name, what's inside, when to use ✅", "Nothing"], correct: 1 },
        { question: "Functions can call...", options: ["Nothing", "Other functions ✅", "Only sprites"], correct: 1 }
      ]}},
    { type: "simulation", title: "Recipe Book! 📒", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Your 'Draw Star' function. Ingredients are...", choices: [
          { text: "Move, Turn 144°, REPEAT 5 ✅", feedback: "Great recipe!" },
          { text: "Just a star picture", feedback: "Need the code inside!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 57: Movement & Gravity
  [
    { type: "quiz", title: "Physics Quiz! 🎮", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "In games, gravity pulls...", options: ["Up", "DOWN ✅", "Sideways"], correct: 1 },
        { question: "Y-VELOCITY changes for...", options: ["Turning", "Falling/jumping ✅", "Moving left"], correct: 1 },
        { question: "Jump = sudden...", options: ["Downward push", "UPWARD velocity ✅", "Nothing"], correct: 1 }
      ]}},
    { type: "simulation", title: "Paper Prototype! 📄", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Character jumps. First they move...", choices: [
          { text: "UP then gravity pulls DOWN ✅", feedback: "Jump physics!" },
          { text: "Only down", feedback: "Jump goes UP first!" }
        ], correct: 0 },
        { situation: "Falling gets...", choices: [
          { text: "Faster (accelerates) ✅", feedback: "Gravity accelerates!" },
          { text: "Slower", feedback: "Gravity makes you go faster!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 58: Enemies & AI
  [
    { type: "quiz", title: "Enemy AI Quiz! 👾", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "AI stands for...", options: ["Always Intelligent", "Artificial Intelligence ✅", "Any Ideas"], correct: 1 },
        { question: "Enemy AI uses...", options: ["Magic", "IF-THEN decisions ✅", "Nothing"], correct: 1 },
        { question: "IF player nearby THEN...", options: ["Do nothing", "CHASE ✅", "Disappear"], correct: 1 }
      ]}},
    { type: "simulation", title: "Decision Tree! 🌳", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Enemy decision: IF player is close...", choices: [
          { text: "THEN chase player ✅", feedback: "Good AI logic!" },
          { text: "THEN run away", feedback: "That's for the player!" }
        ], correct: 0 },
        { situation: "IF player NOT close...", choices: [
          { text: "THEN patrol back and forth ✅", feedback: "Smart patrol!" },
          { text: "THEN stand still", feedback: "Boring enemy!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 59: Game Showcase
  [
    { type: "quiz", title: "Logic Master! 🏆", xp: 30, duration: "5 min",
      config: { questions: [
        { question: "Functions are...", options: ["Bugs", "Reusable code ✅", "Sprites"], correct: 1 },
        { question: "Debugging means...", options: ["Adding bugs", "Finding and FIXING bugs ✅", "Ignoring"], correct: 1 },
        { question: "Game gravity uses...", options: ["X variable", "Y velocity ✅", "Score"], correct: 1 },
        { question: "Enemy AI makes decisions with...", options: ["Random", "IF-THEN rules ✅", "Magic"], correct: 1 }
      ]}},
    { type: "characters", title: "🦁 Logic Master Badge!", xp: 25, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 11: My Digital World (Lessons 60-65) - All ByteBuddies 🌟
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 60: Portfolio Part 1
  [
    { type: "quiz", title: "Portfolio Quiz! 📁", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "A portfolio shows...", options: ["Nothing", "Your BEST work ✅", "Only failures"], correct: 1 },
        { question: "Include work from...", options: ["One unit", "ALL units ✅", "No units"], correct: 1 }
      ]}},
    { type: "collector", title: "Evidence Hunt! 🔍", xp: 25, duration: "4 min",
      config: { instructions: "Choose portfolio pieces!",
        items: [
          { id: "coding", emoji: "💻", label: "Best coding project", isTarget: true },
          { id: "data", emoji: "📊", label: "Data dashboard", isTarget: true },
          { id: "story", emoji: "📖", label: "Digital story", isTarget: true },
          { id: "random", emoji: "❓", label: "Random doodle", isTarget: false }
        ], targetCount: 3 }}
  ],

  // Lesson 61: Portfolio Part 2
  [
    { type: "quiz", title: "Reflection Quiz! 🪞", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "Reflection means...", options: ["Looking in mirror", "Thinking about your learning ✅", "Nothing"], correct: 1 },
        { question: "Good reflection includes...", options: ["Just 'it was good'", "What you learned, what was hard ✅", "Nothing"], correct: 1 }
      ]}},
    { type: "simulation", title: "Reflection Stations! 📝", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "My biggest achievement was...", choices: [
          { text: "Completing a challenging project ✅", feedback: "Celebrate success!" },
          { text: "Nothing", feedback: "You did lots of great things!" }
        ], correct: 0 },
        { situation: "I want to learn more about...", choices: [
          { text: "AI and game design ✅", feedback: "Future goals!" },
          { text: "Nothing ever again", feedback: "Keep learning!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 62: Careers Part 1
  [
    { type: "matching", title: "Career Match! 💼", xp: 25, duration: "4 min",
      config: { pairs: [
        { left: "Software Developer", right: "Writes programs" },
        { left: "Data Scientist", right: "Analyzes data" },
        { left: "Game Designer", right: "Creates games" },
        { left: "AI Engineer", right: "Builds AI systems" }
      ]}},
    { type: "quiz", title: "Careers Quiz! 👷", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Computing jobs need...", options: ["No skills", "Problem-solving skills ✅", "Luck only"], correct: 1 },
        { question: "You can work in tech if you like...", options: ["Only coding", "Many things - art, music, writing too! ✅", "Nothing"], correct: 1 }
      ]}}
  ],

  // Lesson 63: Careers Part 2
  [
    { type: "simulation", title: "Future ByteBuddy! 🤖", xp: 25, duration: "5 min",
      config: { steps: [
        { situation: "What computing career interests you?", choices: [
          { text: "Game Developer 🎮", feedback: "Create fun experiences!" },
          { text: "AI Researcher 🧠", feedback: "Shape the future!" },
          { text: "Cybersecurity Expert 🔒", feedback: "Keep people safe!" }
        ], correct: null },
        { situation: "What skill from this year helps that career?", choices: [
          { text: "Problem-solving ✅", feedback: "Essential skill!" },
          { text: "Coding ✅", feedback: "Building blocks!" },
          { text: "Creativity ✅", feedback: "Innovation!" }
        ], correct: null }
      ]}},
    { type: "quiz", title: "Future Quiz! 🔮", xp: 15, duration: "3 min",
      config: { questions: [
        { question: "Year 3 skills connect to...", options: ["Nothing", "Future careers ✅", "Only school"], correct: 1 }
      ]}}
  ],

  // Lesson 64: Guest Speakers Prep
  [
    { type: "quiz", title: "Questions Quiz! ❓", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Good questions are...", options: ["Yes/No only", "Open-ended ✅", "Confusing"], correct: 1 },
        { question: "'What do you like about your job?' is...", options: ["Bad question", "Good question ✅", "Rude"], correct: 1 }
      ]}},
    { type: "simulation", title: "Question Workshop! 📝", xp: 25, duration: "4 min",
      config: { steps: [
        { situation: "Write a question for a software developer...", choices: [
          { text: "'What skills do you use?' ✅", feedback: "Great open question!" },
          { text: "'Do you like computers?'", feedback: "Too simple - yes/no!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 65: Guest Speakers Reflection
  [
    { type: "quiz", title: "Thank You! 💌", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Thank-you cards should include...", options: ["Nothing", "Thanks + something you learned ✅", "Just your name"], correct: 1 },
        { question: "Gratitude means...", options: ["Being rude", "Saying THANK YOU ✅", "Ignoring people"], correct: 1 }
      ]}},
    { type: "simulation", title: "Thank-You Card! 📝", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Your thank-you card says...", choices: [
          { text: "Thank you + I learned about AI ✅", feedback: "Specific and grateful!" },
          { text: "Just 'thanks'", feedback: "Add what you learned!" }
        ], correct: 0 }
      ]}},
    { type: "characters", title: "🌟 Digital Citizen Badge!", xp: 25, duration: "2 min" }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 12: ByteBuddies Showcase! (Lessons 66-71) - Celebration 🎉
  // ═══════════════════════════════════════════════════════════════════════════

  // Lesson 66: Showcase Dev Day 1
  [
    { type: "quiz", title: "Project Options! 🎯", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Showcase projects could be...", options: ["Only games", "Games, stories, data, art, safety guides ✅", "Nothing"], correct: 1 },
        { question: "Choose based on...", options: ["Random", "What you're PASSIONATE about ✅", "What's easiest"], correct: 1 }
      ]}},
    { type: "simulation", title: "Project Auction! 🏷️", xp: 25, duration: "4 min",
      config: { steps: [
        { situation: "Which project type excites YOU most?", choices: [
          { text: "Game 🎮", feedback: "Build something playable!" },
          { text: "Story 📖", feedback: "Tell a tale!" },
          { text: "Data Investigation 📊", feedback: "Discover insights!" },
          { text: "Digital Art/Music 🎨", feedback: "Express creativity!" }
        ], correct: null }
      ]}}
  ],

  // Lesson 67: Showcase Dev Day 2
  [
    { type: "quiz", title: "Progress Check! ✅", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "Getting feedback helps you...", options: ["Feel bad", "IMPROVE your project ✅", "Give up"], correct: 1 },
        { question: "Good feedback is...", options: ["Mean", "Specific and helpful ✅", "Vague"], correct: 1 }
      ]}},
    { type: "simulation", title: "Peer Check! 👀", xp: 25, duration: "4 min",
      config: { steps: [
        { situation: "Share progress. Partner says 'Add more sound effects'. You...", choices: [
          { text: "Consider the suggestion ✅", feedback: "Feedback helps!" },
          { text: "Ignore it", feedback: "Listen to ideas!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 68: Showcase Dev Day 3
  [
    { type: "quiz", title: "Bug-Fix Support! 🐛", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "If you're stuck, you should...", options: ["Give up", "ASK for help ✅", "Delete everything"], correct: 1 },
        { question: "Helping others is...", options: ["Wasting time", "A great skill ✅", "Cheating"], correct: 1 }
      ]}},
    { type: "simulation", title: "Help Circle! 🤝", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Classmate can't fix their bug. You...", choices: [
          { text: "Offer to help them look ✅", feedback: "Teamwork!" },
          { text: "Say 'not my problem'", feedback: "Help each other!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 69: Rehearsal
  [
    { type: "quiz", title: "Presentation Tips! 🎤", xp: 20, duration: "4 min",
      config: { questions: [
        { question: "2-minute pitch includes...", options: ["Everything ever", "What you made, why, what you're proud of ✅", "Just title"], correct: 1 },
        { question: "Practice helps you feel...", options: ["Worse", "More CONFIDENT ✅", "Nothing"], correct: 1 }
      ]}},
    { type: "simulation", title: "Pitch Practice! 🎯", xp: 25, duration: "4 min",
      config: { steps: [
        { situation: "Start your pitch with...", choices: [
          { text: "I made a... and it does... ✅", feedback: "Clear intro!" },
          { text: "Umm, I don't know", feedback: "Practice your opener!" }
        ], correct: 0 },
        { situation: "End with...", choices: [
          { text: "The hardest bug I fixed was... ✅", feedback: "Shows problem-solving!" },
          { text: "That's all bye", feedback: "Strong ending!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 70: Grand Showcase Day 1
  [
    { type: "quiz", title: "Showcase Ready! 🎪", xp: 25, duration: "4 min",
      config: { questions: [
        { question: "When presenting to visitors...", options: ["Mumble quietly", "Speak clearly with enthusiasm ✅", "Run away"], correct: 1 },
        { question: "If asked a question, you...", options: ["Panic", "Answer as best you can ✅", "Ignore them"], correct: 1 }
      ]}},
    { type: "simulation", title: "Exhibition Host! 🎭", xp: 20, duration: "4 min",
      config: { steps: [
        { situation: "Visitor approaches your stand. You...", choices: [
          { text: "Greet them and start your pitch ✅", feedback: "Great presenting!" },
          { text: "Look at the floor", feedback: "Engage with visitors!" }
        ], correct: 0 }
      ]}}
  ],

  // Lesson 71: Graduation!
  [
    { type: "quiz", title: "Year 3 Champion! 🎓", xp: 40, duration: "5 min",
      config: { questions: [
        { question: "An algorithm is...", options: ["Step-by-step instructions ✅", "A robot", "A game"], correct: 0 },
        { question: "DECOMPOSITION means...", options: ["Making bigger", "Breaking into smaller parts ✅", "Coding"], correct: 1 },
        { question: "A variable stores...", options: ["Sprites", "Values that can change ✅", "Nothing"], correct: 1 },
        { question: "Digital footprints last...", options: ["1 day", "Potentially FOREVER ✅", "1 hour"], correct: 1 },
        { question: "RGB mixing creates...", options: ["Darkness", "All colours from light ✅", "Sound"], correct: 1 },
        { question: "You are now a...", options: ["Beginner", "ByteBuddies GRADUATE! 🎓✅", "Robot"], correct: 1 }
      ]}},
    { type: "characters", title: "🎉🎓 BYTEBUDDIES YEAR 3 GRADUATE! 🎓🎉", xp: 50, duration: "3 min" }
  ]
];
