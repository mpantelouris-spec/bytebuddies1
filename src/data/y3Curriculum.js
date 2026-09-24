// ByteBuddies Year 3 Curriculum - UK National Curriculum Aligned
// 12 Units × 6 Lessons = 72 Lessons | Ages 7-8
// Full Academic Year Computer Science Education

function q(question, options, answer) { return { q: question, options, answer }; }

// ═══════════════════════════════════════════════════════════════════════════
// YEAR 3 LESSONS - Complete 72-Lesson Curriculum
// ═══════════════════════════════════════════════════════════════════════════

export const Y3_LESSONS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 1: Welcome to ByteBuddies! — Being a Digital Explorer (Lessons 0-5)
  // Theme: Digital Literacy & Computer Basics | Mascot: Beemo 🤖
  // ═══════════════════════════════════════════════════════════════════════════
  
  { id:'l0', title:'What is a Computer?', mission:'Identify computer types and parts', csTopics:['Digital Literacy','Computer Basics','Input/Output'], xp:50, emoji:'🖥️', character:'beemo',
    difficulty:1, estimatedMinutes:45, unit:1, unitName:'Welcome to ByteBuddies!',
    vocabulary:[{word:'Computer',def:'An electronic device that follows instructions'},{word:'Input',def:'Information going INTO the computer'},{word:'Output',def:'Information coming OUT of the computer'},{word:'CPU',def:'The brain of the computer that does the thinking'}],
    storyLine:'Welcome to ByteBuddies Academy! Beemo the Robot is your guide. Today we discover what computers are and learn their main parts.',
    conceptName:'Computer Parts', conceptExplain:'Computers need instructions to work. They have inputs (keyboard, mouse) to receive information and outputs (screen, speaker) to show results.',
    activities:['Parts of a Computer Labelling Game','Computer Safari — spot computers around school','Input vs Output Sort'],
    challenge:'Complete the Input/Output sort with 100% accuracy!',
    reflection:'What devices around you are actually computers?',
    quiz:[q('What does a computer need to work?',['Magic','Instructions','Sunshine','Friends'],1),q('Which is an INPUT device?',['Keyboard','Monitor','Speaker','Printer'],0),q('What does a monitor do?',['Types letters','Shows information','Makes sounds','Stores files'],1),q('A tablet is a computer. True or False?',['True','False'],0),q('Which part does the thinking?',['Mouse','Monitor','CPU','Keyboard'],2)],
    badge:'🖥️',
    companionActivity: {
      name: "Beemo's Body Parts",
      format: "Physical Game",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital labelling activity",
      materials: ["6 large laminated labels: MONITOR, KEYBOARD, MOUSE, CPU, SPEAKER, WEBCAM", "Masking tape or string loops to hang labels around necks"],
      learningConnection: "Reinforces naming and locating the main parts of a computer before children do the digital labelling activity, using their own bodies as the 'computer' so the vocabulary is physically anchored.",
      steps: [
        "Choose 6 children to wear one label each and stand at the front as 'Human Computer.'",
        "Call out a function ('I show you pictures,' 'I let you type,' 'I click and point') — the class points to the correct labelled child.",
        "The labelled child says their part's job in one sentence.",
        "Swap 6 new children in and repeat with different clues.",
        "Finish by asking: 'What does a computer need to do all this?' (Answer: instructions!) — leading into the day's theme."
      ],
      mascotTieIn: "Beemo 'malfunctions' comically if the class points to the wrong body part, prompting a laugh and a retry.",
      differentiation: { support: "Give the pointing child two label options to choose between instead of six.", extension: "Ask a confident child to invent a new 'part' (e.g. a printer) and explain its job to the class." }
    } },

  { id:'l1', title:'Algorithms: Giving Instructions', mission:'Write step-by-step instructions', csTopics:['Algorithms','Sequencing','Precision'], xp:55, emoji:'📋', character:'beemo',
    difficulty:1, estimatedMinutes:45, unit:1, unitName:'Welcome to ByteBuddies!',
    vocabulary:[{word:'Algorithm',def:'A set of step-by-step instructions to solve a problem'},{word:'Sequence',def:'Doing things in the correct order'},{word:'Precise',def:'Being exact and clear'}],
    storyLine:'Beemo needs help! Someone gave confusing instructions. Can you teach him what a good algorithm looks like?',
    conceptName:'Algorithms', conceptExplain:'An algorithm is a set of step-by-step instructions. The order matters!',
    activities:['Morning Routine Sequencer','Robot Sandwich activity','Beemo\'s Algorithm Builder'],
    challenge:'Write an algorithm for brushing teeth with exactly 5 steps!',
    reflection:'What happened when instructions were in the wrong order?',
    quiz:[q('What is an algorithm?',['A computer','Step-by-step instructions','A robot','A game'],1),q('Does ORDER matter?',['Yes','No'],0),q('Which word means correct order?',['Sequence','Computer','Robot','Loop'],0)],
    badge:null,
    companionActivity: {
      name: "Blindfold Algorithm Challenge",
      format: "Physical Game / Role-Play",
      time: "15 minutes",
      groupSize: "Pairs",
      placement: "Between platform activities",
      materials: ["1 soft blindfold or 'eyes closed' rule per pair", "A simple obstacle course of 3-4 chairs/cones"],
      learningConnection: "Directly reinforces the vocabulary 'algorithm,' 'sequence,' and 'precise' — children discover that vague instructions fail and precise, ordered ones succeed.",
      steps: [
        "Set up 3-4 obstacles in a clear path across the room.",
        "One child is blindfolded (or closes eyes); their partner gives only verbal step-by-step instructions to navigate the obstacles.",
        "If the instruction-giver says something vague ('go that way'), the blindfolded child must stop and say 'That's not precise!'",
        "Swap roles after one run-through.",
        "Discuss as a class: which instructions worked best, and why?"
      ],
      mascotTieIn: "Frame the blindfolded child as 'being Beemo' — Beemo can only do exactly what he's told, nothing more.",
      differentiation: { support: "Reduce to 2 obstacles and allow the instruction-giver to hold their partner's hand loosely for safety reassurance.", extension: "Instruction-giver must plan and write their 5 steps down BEFORE starting, without editing mid-course." },
      safetyNotes: "Clear the route of trip hazards; walk the space before the activity; the sighted partner should stay close enough to intervene if needed."
    } },

  { id:'l2', title:'Debugging: Finding and Fixing Mistakes', mission:'Hunt for bugs and fix them', csTopics:['Debugging','Testing','Problem Solving'], xp:55, emoji:'🐛', character:'beemo',
    difficulty:1, estimatedMinutes:45, unit:1, unitName:'Welcome to ByteBuddies!',
    vocabulary:[{word:'Bug',def:'A mistake in an algorithm or program'},{word:'Debug',def:'Finding and fixing a bug'},{word:'Test',def:'Trying out your algorithm to see if it works'}],
    storyLine:'In 1947, Grace Hopper found a real moth in a computer! Now Beemo\'s instructions have bugs. Time to become a Bug Hunter!',
    conceptName:'Debugging', conceptExplain:'Debugging means finding and fixing mistakes in a program.',
    activities:['Bug Hunt game','Human Algorithm Debugging','Debug the Recipe worksheet'],
    challenge:'Fix three different buggy algorithms!',
    reflection:'How did you find the bug?',
    quiz:[q('What is a bug?',['An insect','A mistake in code','A computer','A game'],1),q('What does debug mean?',['Add mistakes','Find and fix mistakes','Delete code','Run faster'],1),q('Who found the first computer bug?',['Beemo','Grace Hopper','A teacher','A robot'],1)],
    badge:'🐛',
    companionActivity: {
      name: "The Bug Squasher Freeze Game",
      format: "Physical Game",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital Bug Hunt",
      materials: ["None (or a bug/moth prop if available)"],
      learningConnection: "Reinforces the vocabulary 'bug,' 'debug,' and 'test' through a physical mistake-spotting game that primes children for finding logical errors.",
      steps: [
        "Teacher performs a 5-step 'algorithm' as actions (e.g. mime brushing teeth, but do the steps out of order).",
        "As soon as a child spots the 'bug' in the sequence, they shout 'BUG!' and freeze.",
        "That child explains what the bug was and suggests the fix ('debug' it).",
        "Teacher re-performs the corrected sequence to 'test' it.",
        "Repeat with 2-3 more deliberately buggy mimed sequences (making a sandwich, getting dressed)."
      ],
      mascotTieIn: "Tell the class Beemo is 'glitching' and needs their help — every correct bug-spot earns a class 'Bug Squasher' point on the board.",
      differentiation: { support: "Make the bug very obvious (e.g. shoes before socks) for the first round.", extension: "A confident child creates their own buggy mime for the class to debug." }
    } },

  { id:'l3', title:'Patterns and Loops', mission:'Spot patterns and use loops', csTopics:['Loops','Repetition','Patterns'], xp:60, emoji:'🔁', character:'beemo',
    difficulty:1, estimatedMinutes:45, unit:1, unitName:'Welcome to ByteBuddies!',
    vocabulary:[{word:'Loop',def:'A set of instructions that repeats'},{word:'Repeat',def:'Do something again'},{word:'Pattern',def:'Something that repeats in a regular way'}],
    storyLine:'Clap, clap, stamp! Can you spot the pattern? Loops help computers repeat things efficiently!',
    conceptName:'Loops', conceptExplain:'A loop tells a computer to repeat instructions instead of writing them over and over.',
    activities:['Pattern Spotting game','Loop Builder','Dance Loop Choreography'],
    challenge:'Paint 100 squares using loops!',
    reflection:'How many instructions did you save by using a loop?',
    quiz:[q('What is a loop?',['A mistake','Instructions that repeat','A part','A bug'],1),q('REPEAT 3 times runs how many?',['1','2','3','4'],2),q('Loops make programs shorter. True?',['True','False'],0)],
    badge:'🔁',
    companionActivity: {
      name: "Human Loop Dance",
      format: "Movement Activity",
      time: "10-12 minutes",
      groupSize: "Whole class",
      placement: "After platform Loop Builder, as consolidation",
      materials: ["Any source of music (phone/laptop)"],
      learningConnection: "Physically embodies the loop concept so children 'feel' what REPEAT 4 actually means before returning to digital practice.",
      steps: [
        "Teach a 4-beat move sequence: clap-clap-stomp-spin.",
        "Call out 'REPEAT 2' — children do the sequence twice in a row.",
        "Increase or decrease the repeat count: 'REPEAT 1,' 'REPEAT 4.'",
        "Challenge: pairs invent their own 4-beat loop and perform it for the class with a 'REPEAT n' call.",
        "Debrief: 'How is this like using a loop in code? What does the repeat number change?'"
      ],
      mascotTieIn: "Announce that the class is 'Programming Beemo to Dance' — Beemo loves learning new loops!",
      differentiation: { support: "Reduce the move sequence to 2 beats (clap-stomp).", extension: "Add an inner loop: 'REPEAT 2 of (clap-clap) INSIDE REPEAT 3' for nested challenge." }
    } },

  { id:'l4', title:'Decisions: If This, Then That', mission:'Use IF/THEN logic', csTopics:['Conditions','Selection','IF/THEN'], xp:60, emoji:'🔀', character:'beemo',
    difficulty:1, estimatedMinutes:45, unit:1, unitName:'Welcome to ByteBuddies!',
    vocabulary:[{word:'Condition',def:'Something that can be true or false'},{word:'Selection',def:'Choosing based on a condition'},{word:'IF/THEN',def:'If true, then do this'}],
    storyLine:'If it rains, take an umbrella! You just used an IF statement. Computers make decisions too!',
    conceptName:'IF/THEN Logic', conceptExplain:'Computers can make decisions. IF a condition is true, THEN they do something.',
    activities:['Decision Tree Game','Traffic Light Conditionals','Write Your Own IF/THEN'],
    challenge:'Guide Beemo using 8 different IF/THEN decisions!',
    reflection:'What decisions do you make every day using IF/THEN?',
    quiz:[q('What does IF/THEN mean?',['Repeat forever','If true, do action','Stop','Add bug'],1),q('What is a condition?',['A loop','Something true/false','A pattern','A computer'],1)],
    badge:null,
    companionActivity: {
      name: "Human Robot IF-THEN Relay",
      format: "Physical Game / Role-Play",
      time: "15 minutes",
      groupSize: "Teams of 4",
      placement: "Between platform activities to reinforce selection",
      materials: ["Condition cards (e.g. 'IF cone is red,' 'IF cone is blue')", "Action cards (e.g. 'THEN hop around it,' 'THEN crawl under')", "A few coloured cones or hoops"],
      learningConnection: "Gives embodied practice of conditions and selection logic — success depends on checking the condition accurately before executing the action.",
      steps: [
        "Set up 3 cones of different colours at one end of the hall.",
        "Each team sends one 'Robot' at a time; the team holds a drawn pair of IF-THEN cards.",
        "The robot must check the condition on the first cone. If it matches their IF card, they perform the THEN action. If not, they skip to the next cone.",
        "First team to have all members correctly execute their conditions wins the round.",
        "Shuffle the cards and repeat."
      ],
      mascotTieIn: "The team becomes 'Beemo's Brain Trust' — they programme Beemo (the running child) by deciding which cards to give.",
      differentiation: { support: "Limit to 2 cones and simpler conditions ('IF red, THEN hop').", extension: "Add IF-ELSE cards: 'IF red THEN hop, ELSE crawl.'" }
    } },

  { id:'l5', title:'Unit 1 Showcase: Algorithm Artists', mission:'Create an algorithm storybook', csTopics:['Algorithms','Loops','Debugging','Conditions'], xp:90, emoji:'🎖️', character:'beemo',
    difficulty:2, estimatedMinutes:45, unit:1, unitName:'Welcome to ByteBuddies!',
    vocabulary:[{word:'Project',def:'A bigger task combining skills'},{word:'Showcase',def:'Presenting your work'}],
    storyLine:'Create "A Day in Beemo\'s Life" — a storybook algorithm with sequences, loops, IF/THEN, and a bug you fixed!',
    conceptName:'Algorithm Design', conceptExplain:'A great algorithm combines sequences, loops, and conditions.',
    activities:['Create 6-panel storybook','Include a LOOP','Include IF/THEN','Fix a bug'],
    challenge:'Create and present your Algorithm Storybook!',
    reflection:'What was the hardest part? What are you most proud of?',
    quiz:[q('A good algorithm includes:',['Only loops','Sequences, loops, conditions','Only bugs','Nothing'],1),q('Testing helps:',['Add bugs','Find problems','Delete it','Make longer'],1)],
    badge:'🤖',
    companionActivity: {
      name: "Beemo's Day Storybook Gallery",
      format: "Creative + Discussion",
      time: "15 minutes",
      groupSize: "Pairs then whole class",
      placement: "After digital storybook creation, as plenary",
      materials: ["Finished digital storybooks (on screens)", "Optional: 'Showcase Passport' slips to collect peer stamps"],
      learningConnection: "Provides a real audience for the children's work, reinforcing that algorithms can be communicated to others — a key NC requirement.",
      steps: [
        "Children display their storybook on their screens.",
        "Pairs rotate to view 3 other storybooks (1 minute each).",
        "At each stop, the viewer must identify: 1 sequence, 1 loop, 1 IF/THEN, and where a bug was fixed.",
        "Optional: viewers give a stamp or sticker on a passport slip for each element found.",
        "Return to seats; select 2-3 storybooks to share on the big screen with class commentary."
      ],
      mascotTieIn: "Beemo 'reviews' the winning storybook on screen — display Beemo saying 'Great algorithm, friend!'",
      differentiation: { support: "Pair with a talk partner to discuss elements before rotating.", extension: "Viewer must also suggest one improvement or extension to the algorithm." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 2: Thinking Like a Computer — Computational Thinking (Lessons 6-11)
  // Theme: Decomposition, Abstraction, Pattern Recognition | Mascot: Pixel 🐱
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l6', title:'Decomposition: Breaking Problems Down', mission:'Break big problems into smaller parts', csTopics:['Decomposition','Problem Solving','Planning'], xp:55, emoji:'🧩', character:'pixel',
    difficulty:1, estimatedMinutes:45, unit:2, unitName:'Thinking Like a Computer',
    vocabulary:[{word:'Decomposition',def:'Breaking a big problem into smaller parts'},{word:'Sub-task',def:'A smaller part of a bigger task'}],
    storyLine:'How would you eat an elephant? One bite at a time! Meet Pixel the Cat and learn decomposition!',
    conceptName:'Decomposition', conceptExplain:'Decomposition means breaking a big problem into smaller, manageable parts.',
    activities:['Pizza Party Planning','Decompose a Game','Decomposition Challenge'],
    challenge:'Break down "Plan a class party" into at least 6 sub-tasks!',
    reflection:'Why is it easier to solve smaller problems?',
    quiz:[q('Decomposition means:',['Adding parts','Breaking into smaller parts','Making bigger','Deleting'],1),q('A sub-task is:',['The whole problem','A smaller part','A bug','A loop'],1)],
    badge:null,
    companionActivity: {
      name: "Decompose the Snack",
      format: "Hands-On / Discussion",
      time: "10 minutes",
      groupSize: "Small groups of 3-4",
      placement: "Hook, before Pizza Party Planning on screen",
      materials: ["A wrapped biscuit/snack pack per group (for demonstration, not eating)", "Sticky notes", "Marker pens"],
      learningConnection: "Physically unpacks a concrete task into sub-tasks — children literally see the problem 'broken down' before applying decomposition on-screen.",
      steps: [
        "Groups look at the wrapped snack but cannot open it.",
        "Teacher asks: 'What are ALL the steps to give this snack to a friend and have them enjoy it?' Groups brainstorm on sticky notes (e.g. 'pick up,' 'unwrap,' 'break in half,' 'pass to friend,' 'check if they like it').",
        "Groups stick their notes on the table in sequence order.",
        "Teacher reveals: 'You just DECOMPOSED the task into sub-tasks!'",
        "Discuss: Which sub-tasks could be swapped? Which MUST come first?"
      ],
      mascotTieIn: "Pixel is 'hungry but confused' — can only follow sub-tasks, not vague instructions.",
      differentiation: { support: "Provide sentence starters on cards: 'First I would…'.", extension: "Can groups further decompose one sub-task (e.g. 'unwrap' → 'peel corner,' 'pull film')?" }
    } },

  { id:'l7', title:'Pattern Recognition', mission:'Spot and use patterns', csTopics:['Patterns','Prediction','Logic'], xp:55, emoji:'🔣', character:'pixel',
    difficulty:1, estimatedMinutes:45, unit:2, unitName:'Thinking Like a Computer',
    vocabulary:[{word:'Pattern',def:'Something that repeats predictably'},{word:'Predict',def:'Guess what comes next based on patterns'}],
    storyLine:'Pixel found a pattern machine! Help work out the rules so it can make patterns again.',
    conceptName:'Pattern Recognition', conceptExplain:'Spotting patterns helps us write shorter, smarter algorithms.',
    activities:['Pixel\'s Pattern Gallery','Real-World Pattern Hunt','Predict the Next'],
    challenge:'Find the rule for 3 patterns and predict the next 2 items!',
    reflection:'Where do you see patterns in everyday life?',
    quiz:[q('A pattern is:',['Random','Something that repeats','A bug','A computer'],1),q('Next in 🔵🔴🔵🔴🔵?',['🔵','🔴'],1)],
    badge:null,
    companionActivity: {
      name: "Classroom Pattern Safari",
      format: "Movement / Observation",
      time: "10 minutes",
      groupSize: "Pairs",
      placement: "After Pixel's Pattern Gallery, as real-world transfer",
      materials: ["Mini whiteboards or clipboards with paper", "Pencils"],
      learningConnection: "Transfers digital pattern-spotting to the physical environment, showing patterns are everywhere — a key abstraction insight.",
      steps: [
        "Children walk around the classroom in pairs, looking for repeating patterns (e.g. tiles, window frames, book spines, bricks).",
        "They record at least 3 patterns by sketching or describing them on their whiteboard.",
        "Back at seats, pairs share their best pattern with the class.",
        "Class identifies the 'rule' for each pattern presented.",
        "Debrief: 'Why do designers use patterns?' (efficiency, beauty, predictability)."
      ],
      mascotTieIn: "Pixel 'purrs' when a pattern is correctly identified — children get a Pixel sticker for each valid pattern spotted.",
      differentiation: { support: "Give children a 'Pattern Checklist' with 3 examples to find (e.g. 'stripes,' 'grid,' 'colour repeat').", extension: "Challenge: find a pattern that breaks or changes — discuss why." }
    } },

  { id:'l8', title:'Abstraction: What\'s Important?', mission:'Keep only what matters', csTopics:['Abstraction','Simplification','Maps'], xp:55, emoji:'🗺️', character:'pixel',
    difficulty:1, estimatedMinutes:45, unit:2, unitName:'Thinking Like a Computer',
    vocabulary:[{word:'Abstraction',def:'Keeping only important information'},{word:'Simplify',def:'Make something easier by removing unnecessary details'}],
    storyLine:'Which is better for navigation: Google Maps or a photo? Maps use abstraction — keeping only what matters!',
    conceptName:'Abstraction', conceptExplain:'Abstraction means keeping only the important details and hiding the rest.',
    activities:['Design a Map of your bedroom','Icon Design Challenge','Information Sorter'],
    challenge:'Create an abstracted map using only 10 important features!',
    reflection:'What did you leave out? Why?',
    quiz:[q('Abstraction keeps:',['Everything','Only important info','Nothing','All details'],1),q('A map is an example of:',['No abstraction','Abstraction','A pattern','A bug'],1)],
    badge:null,
    companionActivity: {
      name: "Abstraction Art — Draw a Classmate",
      format: "Creative Activity",
      time: "12 minutes",
      groupSize: "Pairs",
      placement: "After Map Design, as creative transfer",
      materials: ["A4 paper", "Colouring pencils/crayons"],
      learningConnection: "Applies abstraction to drawing people — children must decide which features are 'important' to recognise someone, mirroring the icon design and map activities.",
      steps: [
        "Each child draws their partner using only 5 shapes and 3 colours.",
        "They must leave out details but keep enough to make the person recognisable.",
        "Partners swap pictures and identify: 'What did you keep? What did you leave out? Can I tell it's me?'",
        "Class votes on 'Most Recognisable' and 'Most Abstract' (fewest shapes).",
        "Debrief: 'How is this like what a computer does when it simplifies data?'"
      ],
      mascotTieIn: "Pixel is 'drawn' on the board with 5 shapes as a model before children start.",
      differentiation: { support: "Provide a template with 5 empty shapes to fill in.", extension: "Can they draw Pixel using only 3 shapes while keeping it recognisable?" }
    } },

  { id:'l9', title:'Computational Thinking in Action', mission:'Use all four pillars', csTopics:['Decomposition','Patterns','Abstraction','Algorithms'], xp:65, emoji:'🧠', character:'pixel',
    difficulty:2, estimatedMinutes:45, unit:2, unitName:'Thinking Like a Computer',
    vocabulary:[{word:'Computational Thinking',def:'Solving problems like a computer'}],
    storyLine:'Pixel needs to travel from school to the beach. Apply all four pillars of computational thinking!',
    conceptName:'Computational Thinking', conceptExplain:'Use decomposition, pattern recognition, abstraction, and algorithms together.',
    activities:['Plan Pixel\'s Adventure using all four pillars'],
    challenge:'Create a complete plan using decomposition, patterns, abstraction, and algorithm!',
    reflection:'Which pillar was most useful?',
    quiz:[q('Computational thinking includes:',['Only loops','Decomposition, patterns, abstraction, algorithms','Only bugs','Nothing'],1)],
    badge:null,
    companionActivity: {
      name: "Four Pillars Sorting Hat",
      format: "Card Sorting / Discussion",
      time: "12 minutes",
      groupSize: "Groups of 4",
      placement: "After digital Four Pillars activity, as consolidation",
      materials: ["Set of 8-12 scenario cards per group (pre-made)", "4 labelled 'pillar' cups or zones: Decomposition, Pattern Recognition, Abstraction, Algorithms"],
      learningConnection: "Children physically sort real-world examples into computational thinking categories, reinforcing understanding of each pillar's purpose.",
      steps: [
        "Each group receives a shuffled stack of scenario cards (e.g. 'Making a birthday cake,' 'Spot the repeat in 🔴🔵🔴🔵,' 'Draw a map of school').",
        "Groups discuss and place each card in the cup for the pillar it best represents.",
        "Groups rotate to view another group's sorting; any disagreements are noted.",
        "Class discussion: Which cards caused disagreement? Why might some scenarios use multiple pillars?",
        "Debrief: 'Can you use more than one pillar at once?' (Yes — computational thinking combines them!)"
      ],
      mascotTieIn: "Pixel 'wears' each pillar hat on the board as children sort — visual cue for each category.",
      differentiation: { support: "Reduce to 6 cards with clear single-pillar examples.", extension: "Add 2 tricky cards that could fit multiple pillars — groups must justify their choice." }
    } },

  { id:'l10', title:'Design a Game: Part 1', mission:'Design your own game', csTopics:['Game Design','Decomposition','Planning'], xp:60, emoji:'🎮', character:'pixel',
    difficulty:2, estimatedMinutes:45, unit:2, unitName:'Thinking Like a Computer',
    vocabulary:[{word:'Game Design',def:'Planning how a game works'}],
    storyLine:'Time to design your own game! Use computational thinking to plan every part.',
    conceptName:'Game Design', conceptExplain:'Use decomposition to break down your game into rules, pieces, and actions.',
    activities:['Brainstorm game ideas','Decompose into parts','Find patterns in game rules'],
    challenge:'Create a Game Design Document with all rules!',
    reflection:'What makes your game fun?',
    quiz:[q('Game design starts with:',['Coding','Planning and decomposition','Playing','Deleting'],1)],
    badge:null,
    companionActivity: {
      name: "Playground Game Decompose",
      format: "Discussion / Movement",
      time: "15 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital Game Design Document",
      materials: ["Whiteboard/flip chart", "Marker pens"],
      learningConnection: "Children decompose a game they already know, recognising that all games can be broken into sub-tasks — priming them for their own design.",
      steps: [
        "Class chooses a simple playground game they all know (e.g. Tag, Duck-Duck-Goose).",
        "Teacher writes the game name in the centre of the board.",
        "Class brainstorms sub-tasks: 'What do you need?' (players, space, rules) 'What are the rules?' (how to start, how to win, what you can't do).",
        "Each sub-task is written on a branch from the centre — creating a decomposition web.",
        "If time, briefly act out the game to check the decomposition is complete."
      ],
      mascotTieIn: "Pixel 'watches' from the board and 'mews' (a sound effect) when a new sub-task is added.",
      differentiation: { support: "Provide sentence starters: 'The game needs…' 'A rule is…'.", extension: "Can children add an IF/THEN rule to the game? (e.g. 'IF tagged, THEN sit down.')" }
    } },

  { id:'l11', title:'Design a Game: Part 2 — Showcase', mission:'Present your game design', csTopics:['Presentation','Game Design','Computational Thinking'], xp:95, emoji:'🏆', character:'pixel',
    difficulty:2, estimatedMinutes:45, unit:2, unitName:'Thinking Like a Computer',
    vocabulary:[{word:'Showcase',def:'Presenting your work to others'}],
    storyLine:'Present your game design! Show decomposition, patterns, and abstraction.',
    conceptName:'Complete Design', conceptExplain:'A complete game design uses all computational thinking skills.',
    activities:['Finalize Game Design Document','Present to class','Give peer feedback'],
    challenge:'Present your game and explain your computational thinking!',
    reflection:'What feedback did you receive?',
    quiz:[q('A good presentation:',['Hides thinking','Explains thinking','Has no design','Is silent'],1)],
    badge:'🐱',
    companionActivity: {
      name: "Pixel's Showcase Carousel",
      format: "Gallery Walk / Discussion",
      time: "15 minutes",
      groupSize: "Pairs rotating",
      placement: "After digital showcase creation, as plenary",
      materials: ["Screens displaying Game Design Documents", "Feedback sticky notes (2 colours: green for praise, pink for suggestion)"],
      learningConnection: "Children receive peer feedback on their design, reinforcing that good designs communicate clearly — a real-world computational thinking outcome.",
      steps: [
        "Children display their Game Design Document on their screens.",
        "Pairs rotate around the room (1-2 minutes per stop).",
        "At each stop, viewers write ONE green sticky (praise) and ONE pink sticky (question or suggestion).",
        "After rotation, children read their sticky notes and share one piece of feedback they'll act on.",
        "Optional: 2-3 volunteers present their design to the whole class."
      ],
      mascotTieIn: "Pixel 'awards' a badge sticker to designers who can name all four pillars they used.",
      differentiation: { support: "Pair with a confident talk partner for feedback discussion.", extension: "Viewer must identify the decomposition, pattern, and abstraction used in the design." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 3: Block Coding Adventures — Introduction to Block Code (Lessons 12-17)
  // Theme: Visual Block Programming | Mascot: Sparky ⚡
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l12', title:'Welcome to Block Code!', mission:'Run your first program', csTopics:['Block Coding','Programming','Sprites'], xp:55, emoji:'⚡', character:'sparky',
    difficulty:1, estimatedMinutes:45, unit:3, unitName:'Block Coding Adventures',
    vocabulary:[{word:'Block Code',def:'Programming by snapping blocks together'},{word:'Sprite',def:'A character in your program'},{word:'Stage',def:'Where the action happens'}],
    storyLine:'Meet Sparky the Coding Sprite! Learn to code by snapping blocks together like LEGO.',
    conceptName:'Block Coding', conceptExplain:'Block coding lets you program by connecting visual blocks.',
    activities:['Interface Tour','First Program: Move Sparky','Sparky Says Hello'],
    challenge:'Make Sparky move 50 steps and say your name!',
    reflection:'What happened when you clicked the green flag?',
    quiz:[q('The Green Flag:',['Stops program','Runs program','Deletes code','Adds sprites'],1),q('A Sprite is:',['A block','A character','The stage','A sound'],1)],
    badge:null,
    companionActivity: {
      name: "Human Scratch Interface",
      format: "Physical Role-Play",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before Interface Tour on screen",
      materials: ["Large paper labels: GREEN FLAG, RED STOP, SPRITE, STAGE, CODE BLOCKS (A3 or bigger)", "Blu-Tack or string"],
      learningConnection: "Familiarises children with key interface parts before they see them on screen — reducing cognitive load when they meet Scratch for the first time.",
      steps: [
        "Clear a space; designate areas for Stage (centre), Code Blocks (left side), Sprite Library (right side).",
        "Assign 5 children to hold the labels in position.",
        "Teacher 'clicks' the Green Flag child → the Sprite child moves or says hello.",
        "Teacher 'clicks' the Red Stop → everything freezes.",
        "Repeat with different children until the class can name all parts."
      ],
      mascotTieIn: "Sparky 'appears' on the whiteboard and thanks the class for learning his interface.",
      differentiation: { support: "Use a simple call-and-response: 'When I say GREEN FLAG, you say START!'", extension: "Children predict what happens if they drag a Code Block to the Sprite — simulate that too." }
    } },

  { id:'l13', title:'Movement and Direction', mission:'Control sprite movement', csTopics:['Movement','Direction','Angles'], xp:55, emoji:'➡️', character:'sparky',
    difficulty:1, estimatedMinutes:45, unit:3, unitName:'Block Coding Adventures',
    vocabulary:[{word:'Direction',def:'Which way the sprite faces'},{word:'Degrees',def:'A measure of turning'},{word:'Coordinates',def:'Position on the stage (x,y)'}],
    storyLine:'Make Sparky move around the stage! Learn about direction and turning.',
    conceptName:'Movement Blocks', conceptExplain:'Use move and turn blocks to control where your sprite goes.',
    activities:['Draw a Square','Maze Navigator Level 1-3'],
    challenge:'Navigate the maze using movement blocks!',
    reflection:'How many degrees make a right angle?',
    quiz:[q('A right angle is:',['45 degrees','90 degrees','180 degrees','360 degrees'],1),q('To draw a square, repeat move+turn:',['2 times','3 times','4 times','5 times'],2)],
    badge:null,
    companionActivity: {
      name: "Floor Grid Robot Walk",
      format: "Movement Activity",
      time: "12 minutes",
      groupSize: "Pairs",
      placement: "Between digital activities, to reinforce movement/turn concepts",
      materials: ["Floor tape grid (4×4 or 5×5 squares) or chalk squares outside", "Direction cards: FORWARD 1, TURN LEFT 90, TURN RIGHT 90"],
      learningConnection: "Children physically experience move-and-turn commands, making the connection between degrees and body rotation before applying it to sprites.",
      steps: [
        "One child is the 'Robot' standing on the grid; the other is the 'Programmer.'",
        "Programmer draws 3 direction cards and gives them one at a time.",
        "Robot executes each command — moving forward one square or turning in place.",
        "If the Robot would leave the grid, that command fails — Programmer must debug.",
        "Swap roles and repeat."
      ],
      mascotTieIn: "Sparky cheers when a Robot successfully reaches the opposite corner without errors.",
      differentiation: { support: "Use only FORWARD and one turn direction.", extension: "Add FORWARD 2 and TURN 180 cards for longer sequences." }
    } },

  { id:'l14', title:'Events and Interactions', mission:'Make interactive programs', csTopics:['Events','User Input','Interaction'], xp:60, emoji:'🎹', character:'sparky',
    difficulty:1, estimatedMinutes:45, unit:3, unitName:'Block Coding Adventures',
    vocabulary:[{word:'Event',def:'Something that triggers an action'},{word:'Key Press',def:'When a keyboard key is pressed'},{word:'Broadcast',def:'Sending a message to other sprites'}],
    storyLine:'Make Sparky respond to keyboard presses! Create interactive programs.',
    conceptName:'Events', conceptExplain:'Events trigger actions — like pressing a key or clicking the sprite.',
    activities:['Sparky\'s Dance Party — arrow key controls','Interactive Quiz Show'],
    challenge:'Create Sparky controlled by all 4 arrow keys!',
    reflection:'What events can trigger actions in your program?',
    quiz:[q('An event is:',['A loop','Something that triggers action','A bug','A sprite'],1),q('Multiple green flag blocks:',['Not allowed','Allowed','Cause bugs','Delete sprites'],1)],
    badge:null,
    companionActivity: {
      name: "Event Charades",
      format: "Physical Game",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital Sparky's Dance Party",
      materials: ["Event cards (pre-made): 'Green Flag clicked,' 'Space key pressed,' 'Sprite clicked,' 'Loud noise detected,' etc."],
      learningConnection: "Children act out real-world 'events' and 'responses,' making the abstract EVENT → ACTION relationship concrete before coding it.",
      steps: [
        "Child draws an Event card and mimes the event (e.g. pressing a key).",
        "Class shouts the event type (e.g. 'Key press!').",
        "Teacher asks: 'What action could that trigger?' (e.g. 'Sprite jumps!').",
        "Another child mimes the action as the 'response.'",
        "Repeat with new cards."
      ],
      mascotTieIn: "Sparky 'teaches' the event vocabulary on the board as each new event type appears.",
      differentiation: { support: "Provide word bank of event types on the board.", extension: "Children chain two events: 'When X happens, do Y, THEN when Y finishes, do Z.'" }
    } },

  { id:'l15', title:'Loops in Block Code', mission:'Use repeat and forever loops', csTopics:['Loops','Forever','Repeat'], xp:60, emoji:'🔄', character:'sparky',
    difficulty:1, estimatedMinutes:45, unit:3, unitName:'Block Coding Adventures',
    vocabulary:[{word:'Forever Loop',def:'Repeats forever until stopped'},{word:'Repeat Loop',def:'Repeats a set number of times'}],
    storyLine:'Make Sparky spin forever! Learn the difference between Repeat and Forever loops.',
    conceptName:'Loop Blocks', conceptExplain:'Use Forever for continuous actions, Repeat for a set number of times.',
    activities:['Sparky\'s Spinning Star','Rain Animation with loops'],
    challenge:'Create an animation using both Forever and Repeat loops!',
    reflection:'When would you use Forever vs Repeat?',
    quiz:[q('Forever loop:',['Runs once','Never stops','Runs 10 times','Is a bug'],1),q('Repeat 7 runs:',['1 time','7 times','Forever','0 times'],1)],
    badge:null,
    companionActivity: {
      name: "Forever vs Repeat Relay",
      format: "Physical Game / Movement",
      time: "10 minutes",
      groupSize: "Two teams",
      placement: "After digital Spinning Star, as consolidation",
      materials: ["2 cones per team", "Whistle (optional)"],
      learningConnection: "Children physically experience the difference between 'repeat a set number' and 'keep going until stopped,' cementing the loop concept.",
      steps: [
        "Divide class into two teams: REPEAT team and FOREVER team.",
        "REPEAT team: run to cone and back 3 times exactly, then stop.",
        "FOREVER team: keep jogging on the spot forever until the teacher says STOP.",
        "Discuss: Which loop is easier to control? When would you use each?",
        "Swap roles and repeat with different numbers."
      ],
      mascotTieIn: "Sparky 'shouts' FOREVER or REPEAT 3 on the board, and the matching team acts it out.",
      differentiation: { support: "Teacher holds up fingers to count REPEAT iterations.", extension: "Add a nested loop: 'REPEAT 2 of (jump 3 times)' — children must track both counts." }
    } },

  { id:'l16', title:'Variables: Remembering Information', mission:'Use variables to track data', csTopics:['Variables','Data','Score'], xp:65, emoji:'📊', character:'sparky',
    difficulty:2, estimatedMinutes:45, unit:3, unitName:'Block Coding Adventures',
    vocabulary:[{word:'Variable',def:'A named container that stores a value'},{word:'Score',def:'A number that changes during a game'},{word:'Set',def:'Give a variable a value'}],
    storyLine:'Create a score counter! Variables store information that can change.',
    conceptName:'Variables', conceptExplain:'Variables are containers with names that store values.',
    activities:['Score Keeper — click to score game','Variable Storyteller'],
    challenge:'Create a clicking game with a score that goes up!',
    reflection:'What information could you track with variables?',
    quiz:[q('A variable is:',['A loop','A container storing a value','A sprite','A sound'],1),q('To increase score by 1:',['Set score to 1','Change score by 1','Delete score','Hide score'],1)],
    badge:null,
    companionActivity: {
      name: "Scoreboard Keeper Game",
      format: "Physical Game / Maths",
      time: "12 minutes",
      groupSize: "Small groups of 4-5",
      placement: "Hook, before digital Score Keeper",
      materials: ["Mini whiteboard per group", "Dry-wipe marker", "Bean bag or soft ball"],
      learningConnection: "Children physically experience SET, CHANGE, and DISPLAY of a variable — transferring directly to the Scratch Score Keeper activity.",
      steps: [
        "One child is the 'Scoreboard' — holds the whiteboard showing a number starting at 0.",
        "Other children pass a bean bag. Each pass = teacher shouts 'CHANGE score by 1.'",
        "Scoreboard updates the number each time.",
        "Teacher occasionally shouts 'SET score to 5' — Scoreboard erases and writes 5.",
        "Discuss: What's the difference between SET and CHANGE?"
      ],
      mascotTieIn: "Sparky 'cheers' whenever the score crosses a multiple of 5.",
      differentiation: { support: "Use a number line strip for children to point at instead of writing.", extension: "Add 'CHANGE score by -2' to introduce negative changes." }
    } },

  { id:'l17', title:'Unit 3 Project: My First Game!', mission:'Build a complete game', csTopics:['Game Development','Variables','Events','Loops'], xp:100, emoji:'🎮', character:'sparky',
    difficulty:2, estimatedMinutes:45, unit:3, unitName:'Block Coding Adventures',
    vocabulary:[{word:'Game Mechanics',def:'How the game works'}],
    storyLine:'Build "Catch the ByteBuddy" — a complete game with score, lives, and game over!',
    conceptName:'Game Development', conceptExplain:'Combine movement, events, loops, and variables to make a game.',
    activities:['Set up stage and variables','Code player movement','Add falling objects','Add scoring and game over'],
    challenge:'Complete your game with score, lives, and game over screen!',
    reflection:'What was the hardest bug to fix?',
    quiz:[q('A game needs:',['Only sprites','Mechanics, score, challenge','Only loops','No code'],1)],
    badge:'⚡',
    companionActivity: {
      name: "Paper Prototype Playtest",
      format: "Creative + Discussion",
      time: "15 minutes",
      groupSize: "Pairs",
      placement: "Before digital game building, as planning",
      materials: ["A4 paper per child", "Pencils/crayons", "Scissors (optional)"],
      learningConnection: "Children design and test their game on paper before coding — reducing debugging time and reinforcing that planning comes before coding.",
      steps: [
        "Each child draws their 'stage' on paper — background and obstacles.",
        "Draw a small 'player' character on a separate scrap to move around.",
        "Pairs swap prototypes and 'playtest' each other's game by moving the character.",
        "Feedback: 'Does it have a score? Lives? Game over? Is it fun?'",
        "Revise the paper design, then open Scratch to code it."
      ],
      mascotTieIn: "Sparky reminds children: 'Plan first, code second!'",
      differentiation: { support: "Provide a template stage with scoring area marked.", extension: "Add a second level or enemy character to the prototype." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 4: More Block Coding — Storytelling and Animation (Lessons 18-23)
  // Theme: Creative Digital Storytelling | Mascot: Stella ⭐
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l18', title:'Digital Storytelling Basics', mission:'Create a multi-scene story', csTopics:['Storytelling','Scenes','Backdrops'], xp:55, emoji:'📖', character:'stella',
    difficulty:1, estimatedMinutes:45, unit:4, unitName:'Digital Storytelling',
    vocabulary:[{word:'Scene',def:'A part of a story with its own backdrop'},{word:'Backdrop',def:'The background image'},{word:'Narrative',def:'The story structure'}],
    storyLine:'Meet Stella the Storytelling Star! Create interactive stories with scenes and characters.',
    conceptName:'Digital Stories', conceptExplain:'Use backdrops and broadcasts to create multi-scene stories.',
    activities:['Story Map Creator','Three-Scene Story builder'],
    challenge:'Create a story with 3 different scenes!',
    reflection:'How do scenes make your story more interesting?',
    quiz:[q('A scene is:',['A sprite','Part of a story','A loop','A bug'],1),q('Backdrops are:',['Sprites','Background images','Sounds','Variables'],1)],
    badge:null,
    companionActivity: {
      name: "Story Spine Quick-Plan",
      format: "Oral Storytelling",
      time: "10 minutes",
      groupSize: "Pairs",
      placement: "Hook, before Story Map Creator on screen",
      materials: ["Story Spine prompt cards (one set per pair)"],
      learningConnection: "Gives children a proven narrative scaffold (story spine) before they create scenes digitally, ensuring their stories have structure.",
      steps: [
        "Pairs receive Story Spine cards: 'Once upon a time…' → 'Every day…' → 'But one day…' → 'Because of that…' → 'Until finally…'",
        "Taking turns, partners complete each card aloud to build a story.",
        "Each partner notes which parts will become Scene 1, Scene 2, Scene 3.",
        "Share one story with the class.",
        "Move to screens to build the story digitally."
      ],
      mascotTieIn: "Stella introduces the Story Spine as 'the secret recipe for great stories.'",
      differentiation: { support: "Provide example sentence starters for each card.", extension: "Add a 'twist' card: 'But then, unexpectedly…' for a fourth scene." }
    } },

  { id:'l19', title:'Characters and Dialogue', mission:'Make characters talk', csTopics:['Dialogue','Say Blocks','Timing'], xp:55, emoji:'💬', character:'stella',
    difficulty:1, estimatedMinutes:45, unit:4, unitName:'Digital Storytelling',
    vocabulary:[{word:'Dialogue',def:'What characters say'},{word:'Say Block',def:'Makes a sprite show a speech bubble'},{word:'Wait',def:'Pause between actions'}],
    storyLine:'Make your characters talk! Use say blocks and timing to create conversations.',
    conceptName:'Dialogue', conceptExplain:'Use say blocks with wait blocks to create natural conversations.',
    activities:['Two-character conversation','Timed dialogue'],
    challenge:'Create a 5-line conversation between two characters!',
    reflection:'How does timing affect your dialogue?',
    quiz:[q('Say blocks show:',['Sound','Speech bubbles','Movement','Costumes'],1)],
    badge:null,
    companionActivity: {
      name: "Dialogue Timing Skit",
      format: "Drama / Role-Play",
      time: "12 minutes",
      groupSize: "Pairs",
      placement: "Between digital activities, to practise timing",
      materials: ["Timer or stopwatch (phone)"],
      learningConnection: "Children physically practise dialogue timing — discovering why wait blocks matter before applying them in Scratch.",
      steps: [
        "Pairs write a 4-line conversation on paper (2 lines each).",
        "First run: both speak AS FAST AS POSSIBLE, overlapping each other. Discuss: 'Did that make sense?'",
        "Second run: pause 2 seconds between each line (teacher times it). Discuss: 'Easier to follow?'",
        "Third run: experiment with different pauses — some short, some long for effect.",
        "Debrief: 'Why do we need wait blocks in Scratch?'"
      ],
      mascotTieIn: "Stella demonstrates on board with speech bubbles: 'Pause here… and here…'",
      differentiation: { support: "Provide a 4-line script template.", extension: "Add an action between lines: 'walks away,' 'laughs' — how does this change timing?" }
    } },

  { id:'l20', title:'Animation with Costumes', mission:'Animate sprites', csTopics:['Animation','Costumes','Frames'], xp:60, emoji:'🎬', character:'stella',
    difficulty:1, estimatedMinutes:45, unit:4, unitName:'Digital Storytelling',
    vocabulary:[{word:'Animation',def:'Making things appear to move'},{word:'Costume',def:'Different appearances of a sprite'},{word:'Frame',def:'One picture in an animation'}],
    storyLine:'Make characters move! Switch between costumes to create animation.',
    conceptName:'Animation', conceptExplain:'Animation works by quickly switching between costumes.',
    activities:['Walking animation','Character emotions'],
    challenge:'Create a 4-frame walking animation!',
    reflection:'How many frames make smooth animation?',
    quiz:[q('Animation works by:',['One costume','Switching costumes quickly','No costumes','Sound'],1)],
    badge:null,
    companionActivity: {
      name: "Flipbook Animation",
      format: "Creative Activity",
      time: "15 minutes",
      groupSize: "Individual",
      placement: "Before digital Walking Animation, as concrete intro",
      materials: ["Sticky note pad per child (or small paper squares)", "Pencils"],
      learningConnection: "Children create a physical flipbook, directly experiencing how frames create animation — transferring to the costume-switching concept.",
      steps: [
        "Each child draws a simple shape (e.g. a ball) at the bottom of the first sticky note.",
        "On the next sticky note, draw the same shape slightly higher/changed.",
        "Repeat for 8-10 frames to create a simple animation (ball bouncing, stick figure walking).",
        "Stack the sticky notes and flip quickly — watch the animation!",
        "Discuss: 'Each sticky note is like a costume in Scratch.'"
      ],
      mascotTieIn: "Stella shows a digital flipbook on the board as a warm-up.",
      differentiation: { support: "Provide templates with a starting shape already drawn.", extension: "Create a 2-character flipbook with interaction (e.g. handshake)." }
    } },

  { id:'l21', title:'Sound and Music', mission:'Add audio to your story', csTopics:['Sound','Music','Audio'], xp:60, emoji:'🎵', character:'stella',
    difficulty:1, estimatedMinutes:45, unit:4, unitName:'Digital Storytelling',
    vocabulary:[{word:'Sound Effect',def:'Short audio for events'},{word:'Background Music',def:'Music that plays throughout'}],
    storyLine:'Stories come alive with sound! Add music and sound effects.',
    conceptName:'Audio', conceptExplain:'Use sound blocks for effects and music.',
    activities:['Add sound effects','Background music loop'],
    challenge:'Add 3 sound effects and background music to your story!',
    reflection:'How does sound change the mood?',
    quiz:[q('Sound effects are:',['Long music','Short audio for events','Costumes','Sprites'],1)],
    badge:null,
    companionActivity: {
      name: "Foley Sound Effects Workshop",
      format: "Creative / Performance",
      time: "12 minutes",
      groupSize: "Groups of 3-4",
      placement: "Before digital sound effects, as hook",
      materials: ["Classroom objects: paper, pencils, keys, water bottle, chair, etc."],
      learningConnection: "Children create real-world sound effects (Foley), understanding how sounds match actions before adding sounds in Scratch.",
      steps: [
        "Teacher reads a short scene: 'Stella walked through the creaky door, dropped her keys, and poured a drink.'",
        "Groups use classroom objects to create each sound live as the teacher re-reads.",
        "Groups share their sounds; class votes on the most realistic.",
        "Discuss: 'When did the sound play? At the start, during, or after the action?'",
        "Transfer: 'In Scratch, we time sound blocks the same way.'"
      ],
      mascotTieIn: "Stella 'directs' the Foley session — children are 'Stella's Sound Crew.'",
      differentiation: { support: "Provide a list of suggested objects for each sound.", extension: "Groups create a 10-second audio 'scene' entirely from classroom sounds." }
    } },

  { id:'l22', title:'Interactive Choices', mission:'Let readers make choices', csTopics:['Interactivity','Conditionals','Branching'], xp:65, emoji:'🔀', character:'stella',
    difficulty:2, estimatedMinutes:45, unit:4, unitName:'Digital Storytelling',
    vocabulary:[{word:'Branching',def:'When the story can go different ways'},{word:'Choice',def:'When the reader decides what happens'}],
    storyLine:'Let your readers choose! Create branching stories with different endings.',
    conceptName:'Interactive Stories', conceptExplain:'Use conditionals to let readers make choices.',
    activities:['Add a choice point','Create two different endings'],
    challenge:'Create a story with a choice that leads to 2 different endings!',
    reflection:'How do choices make stories more engaging?',
    quiz:[q('Branching means:',['One path','Story goes different ways','No ending','A bug'],1)],
    badge:null,
    companionActivity: {
      name: "Choose Your Own Adventure — Live",
      format: "Oral Storytelling / Drama",
      time: "12 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital branching activity",
      materials: ["None (or large A/B voting cards)"],
      learningConnection: "Children experience branching narrative live, understanding how reader choice changes the story before coding it.",
      steps: [
        "Teacher tells a short story, pausing at a choice point: 'Stella sees a cave. Should she go inside (A) or walk past (B)?'",
        "Class votes A or B (show of hands or voting cards).",
        "Teacher continues with the winning path; after 1 minute, another choice appears.",
        "Repeat twice more, then reveal: 'If you'd chosen differently, the story would have gone this way…'",
        "Discuss: 'How is this like a branching Scratch story?'"
      ],
      mascotTieIn: "Stella is the main character of the story — children control her fate.",
      differentiation: { support: "Limit to 2 choice points.", extension: "A child takes over as storyteller for the final choice." }
    } },

  { id:'l23', title:'Unit 4 Project: Story Festival', mission:'Create and present your story', csTopics:['Project','Presentation','Storytelling'], xp:100, emoji:'🌟', character:'stella',
    difficulty:2, estimatedMinutes:45, unit:4, unitName:'Digital Storytelling',
    vocabulary:[{word:'Festival',def:'A celebration of creative work'}],
    storyLine:'The Story Festival is here! Present your interactive story to the class.',
    conceptName:'Complete Story', conceptExplain:'Combine scenes, characters, dialogue, animation, sound, and choices.',
    activities:['Finalize your story','Practice presenting','Present at the festival'],
    challenge:'Complete a story with 5+ scenes, 2 characters, animation, sound, and choices!',
    reflection:'What feedback did you receive? What are you most proud of?',
    quiz:[q('A complete story has:',['Only text','Scenes, characters, dialogue, sound, choices','Only sprites','No animation'],1)],
    badge:'⭐',
    companionActivity: {
      name: "Story Festival Posters",
      format: "Creative + Gallery Walk",
      time: "15 minutes",
      groupSize: "Individual then pairs",
      placement: "Before presentations, as advertising",
      materials: ["A4 paper", "Colouring pencils/crayons"],
      learningConnection: "Children create 'movie poster' adverts for their stories, practising summarising their narrative — a key literacy skill.",
      steps: [
        "Each child creates a poster for their story: title, main character, tagline ('Will Stella find the treasure?'), 1 illustration.",
        "Posters are displayed around the room.",
        "Pairs do a gallery walk, choosing 2 stories they most want to 'watch.'",
        "Share choices; stories with the most votes are presented first.",
        "Posters remain on display during presentations."
      ],
      mascotTieIn: "Stella's poster is displayed as a model: 'Stella's Story Festival — See Stella shine!'",
      differentiation: { support: "Provide a poster template with labelled sections.", extension: "Add a QR code linking to the Scratch project (teacher sets this up)." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 5: Data Detectives — Understanding Data (Lessons 24-29)
  // Theme: Data, Information, and Representation | Mascot: Digit 🦕
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l24', title:'What is Data?', mission:'Learn about data and information', csTopics:['Data','Information','Database'], xp:55, emoji:'📊', character:'digit',
    difficulty:1, estimatedMinutes:45, unit:5, unitName:'Data Detectives',
    vocabulary:[{word:'Data',def:'Raw facts and figures'},{word:'Information',def:'Data that has been organised and given meaning'},{word:'Database',def:'An organised collection of data'}],
    storyLine:'Meet Digit the Data Dinosaur! Learn the difference between data and information.',
    conceptName:'Data vs Information', conceptExplain:'Data is raw facts. Information is data that has meaning.',
    activities:['Data vs Information Sort','Class Data Collection survey'],
    challenge:'Turn raw data into meaningful information!',
    reflection:'Why is organised data more useful?',
    quiz:[q('Data is:',['Organised facts','Raw facts and figures','A computer','A sprite'],1),q('A database is:',['Random data','Organised collection of data','A game','A loop'],1)],
    badge:null,
    companionActivity: {
      name: "Pocket Data Dump",
      format: "Hands-On / Discussion",
      time: "10 minutes",
      groupSize: "Pairs",
      placement: "Hook, before digital Data vs Information Sort",
      materials: ["Tray per pair", "Various small classroom objects (pencils, rubbers, paperclips, etc.)"],
      learningConnection: "Children physically sort random objects into categories, discovering that organised 'data' becomes useful 'information.'",
      steps: [
        "Pairs receive a tray with 10 mixed objects.",
        "First: 'What do you have?' — children list the raw data (3 pencils, 2 rubbers, etc.).",
        "Second: 'Sort them into groups.' — children organise by type, colour, or use.",
        "Third: 'Now what can you say?' — e.g. 'Most objects are for writing.'",
        "Discuss: 'Raw data → organised data → information.'"
      ],
      mascotTieIn: "Digit 'explains' on the board: 'Data is messy; information is tidy!'",
      differentiation: { support: "Provide sorting mats with labelled categories.", extension: "Can children create a question that their data answers? (e.g. 'Which type is most common?')" }
    } },

  { id:'l25', title:'Collecting and Organising Data', mission:'Design a survey', csTopics:['Data Collection','Surveys','Tables'], xp:55, emoji:'📋', character:'digit',
    difficulty:1, estimatedMinutes:45, unit:5, unitName:'Data Detectives',
    vocabulary:[{word:'Survey',def:'Questions to collect data'},{word:'Tally',def:'Counting using marks'},{word:'Table',def:'Organised rows and columns'}],
    storyLine:'Design your own survey! Collect and organise data from classmates.',
    conceptName:'Data Collection', conceptExplain:'Surveys help collect data. Tables help organise it.',
    activities:['Design a 5-question survey','Collect data from 5 classmates','Organise in a table'],
    challenge:'Create and run your own class survey!',
    reflection:'What did you discover from your data?',
    quiz:[q('A survey collects:',['Sprites','Data through questions','Sounds','Loops'],1)],
    badge:null,
    companionActivity: {
      name: "Human Tally Chart",
      format: "Movement / Maths",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "After digital survey design, before collecting data",
      materials: ["4 large A3 category cards (e.g. 'Dog,' 'Cat,' 'Fish,' 'Other')"],
      learningConnection: "Children become the data points, physically forming a tally chart before translating it to paper/screen.",
      steps: [
        "Place 4 category cards around the room (e.g. favourite pet: Dog, Cat, Fish, Other).",
        "Teacher asks: 'What is your favourite pet? Stand by your answer.'",
        "Children move to their category.",
        "Count each group; one child writes the tally on the card.",
        "Discuss: 'Which is the most popular? How do we know?'"
      ],
      mascotTieIn: "Digit stands at the 'dinosaur' category (if included) and encourages children to join!",
      differentiation: { support: "Use only 3 categories.", extension: "Children devise the next question and repeat the activity." }
    } },

  { id:'l26', title:'Presenting Data: Charts and Graphs', mission:'Create visualisations', csTopics:['Charts','Graphs','Visualisation'], xp:60, emoji:'📈', character:'digit',
    difficulty:1, estimatedMinutes:45, unit:5, unitName:'Data Detectives',
    vocabulary:[{word:'Bar Chart',def:'Shows data using bars'},{word:'Pictogram',def:'Shows data using pictures'},{word:'Pie Chart',def:'Shows parts of a whole'}],
    storyLine:'Turn data into pictures! Create charts that tell a story.',
    conceptName:'Data Visualisation', conceptExplain:'Charts make data easier to understand.',
    activities:['Chart Builder Studio','Chart Detectives quiz'],
    challenge:'Create 2 different charts from your survey data!',
    reflection:'Which chart tells your story best?',
    quiz:[q('A bar chart uses:',['Pictures','Bars','Slices','Nothing'],1),q('Charts make data:',['Harder to read','Easier to understand','Disappear','Random'],1)],
    badge:null,
    companionActivity: {
      name: "Human Bar Chart",
      format: "Movement / Maths",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital Chart Builder Studio",
      materials: ["Floor tape or chalk (to mark axes)", "Large axis labels"],
      learningConnection: "Children become bars in a living bar chart, physically feeling how bar height represents quantity.",
      steps: [
        "Mark an X-axis on the floor with tape; label categories (e.g. 'Pizza,' 'Pasta,' 'Salad').",
        "Teacher asks: 'What's your favourite lunch?'",
        "Children line up behind their category, standing shoulder-to-shoulder.",
        "Each line becomes a 'bar.' Discuss: 'Which bar is tallest? Shortest? What does that tell us?'",
        "Draw the chart on the board matching the human chart."
      ],
      mascotTieIn: "Digit holds the axis label and counts the bars aloud.",
      differentiation: { support: "Use 3 categories max.", extension: "Convert the human chart to a pictogram (e.g. 1 child = 2 people)." }
    } },

  { id:'l27', title:'Binary: The Language of Computers', mission:'Learn binary code', csTopics:['Binary','Bits','Bytes'], xp:65, emoji:'🔢', character:'digit',
    difficulty:2, estimatedMinutes:45, unit:5, unitName:'Data Detectives',
    vocabulary:[{word:'Binary',def:'Number system using only 0 and 1'},{word:'Bit',def:'A single 0 or 1'},{word:'Byte',def:'8 bits together'}],
    storyLine:'Computers only understand 0s and 1s! Learn the secret language of binary.',
    conceptName:'Binary', conceptExplain:'Computers use binary — only 0s and 1s — to store everything.',
    activities:['Binary Flashcards','Binary Art — create pixel art with 0s and 1s'],
    challenge:'Write your age in binary!',
    reflection:'Why do computers use binary?',
    quiz:[q('Binary uses:',['0-9','Only 0 and 1','Letters','All numbers'],1),q('A byte is:',['1 bit','8 bits','100 bits','A word'],1),q('5 in binary is:',['101','111','100','110'],0)],
    badge:'🔢',
    companionActivity: {
      name: "Binary Bracelet",
      format: "Creative Activity",
      time: "15 minutes",
      groupSize: "Individual",
      placement: "After digital Binary Flashcards, as consolidation",
      materials: ["String/thread per child", "Black and white beads (or two colours)"],
      learningConnection: "Children encode their initials in binary and create a wearable bracelet — a tangible, personal binary artifact.",
      steps: [
        "Provide each child with a binary alphabet chart (A=00001, B=00010, etc.).",
        "Children find the binary for their initials (e.g. AB = 00001 00010).",
        "Thread beads: black = 1, white = 0.",
        "Tie bracelet and wear it.",
        "Swap with a partner to decode each other's initials."
      ],
      mascotTieIn: "Digit wears a binary bracelet showing 'D' — children try to decode it.",
      differentiation: { support: "Provide pre-threaded bracelets with gaps to fill.", extension: "Encode a secret word (3-4 letters) for a partner to decode." }
    } },

  { id:'l28', title:'Data in Everyday Life', mission:'Find data around you', csTopics:['Data Collection','Privacy','Ethics'], xp:55, emoji:'🌍', character:'digit',
    difficulty:1, estimatedMinutes:45, unit:5, unitName:'Data Detectives',
    vocabulary:[{word:'Data Collection',def:'Gathering information'},{word:'Privacy',def:'Keeping personal information safe'}],
    storyLine:'Data is everywhere! Explore where data is collected in daily life.',
    conceptName:'Data Around Us', conceptExplain:'Many organisations collect data. Understanding this helps us be smart about privacy.',
    activities:['Data Diary — track data collection in your day','Data for Good research'],
    challenge:'Identify 10 moments when data is collected about you!',
    reflection:'Is data collection good or bad? Why?',
    companionActivity: {
      name: "Data Detectives Walk",
      format: "Movement / Observation",
      time: "12 minutes",
      groupSize: "Small groups of 3-4",
      placement: "After digital Data Diary, as real-world transfer",
      materials: ["Clipboards or mini whiteboards", "Pencils"],
      learningConnection: "Children walk around school/classroom spotting data collection points, making the abstract concept tangible.",
      steps: [
        "Groups walk around the classroom/corridor (supervised).",
        "They look for signs of data collection: register, library system, reward charts, CCTV signs, visitor book.",
        "Record each one: 'What data?' 'Who collects it?' 'Why?'",
        "Return to class; each group shares their best find.",
        "Discuss: 'Is this data used for good? What if it was misused?'"
      ],
      mascotTieIn: "Digit is the 'Chief Data Detective' — groups report their findings to Digit.",
      differentiation: { support: "Provide a checklist of 5 things to find.", extension: "Groups rank their findings from 'most private' to 'least private.'" }
    },
    quiz:[q('Data is collected by:',['No one','Many organisations','Only schools','Only games'],1)],
    badge:null },

  { id:'l29', title:'Unit 5 Project: Data Dashboard', mission:'Create a class data dashboard', csTopics:['Data Analysis','Visualisation','Presentation'], xp:100, emoji:'📊', character:'digit',
    difficulty:2, estimatedMinutes:45, unit:5, unitName:'Data Detectives',
    vocabulary:[{word:'Dashboard',def:'A display showing important data'}],
    storyLine:'Create a Data Dashboard showing what you discovered about your class!',
    conceptName:'Data Dashboard', conceptExplain:'Dashboards combine data, charts, and insights.',
    activities:['Design your survey','Collect data','Create charts','Write 5 insights'],
    challenge:'Create a complete dashboard with data, charts, and insights!',
    reflection:'What surprised you most about the data?',
    quiz:[q('A dashboard shows:',['One number','Important data together','No data','Only words'],1)],
    badge:'🦕',
    companionActivity: {
      name: "Dashboard Gallery Walk",
      format: "Gallery Walk / Discussion",
      time: "15 minutes",
      groupSize: "Pairs rotating",
      placement: "After digital dashboard creation, as plenary",
      materials: ["Screens displaying dashboards", "Sticky notes (2 colours)"],
      learningConnection: "Children present their data findings and receive peer feedback, reinforcing that data should communicate clearly.",
      steps: [
        "Children display their dashboard on screens.",
        "Pairs rotate (2 minutes per stop) and leave one green sticky (praise) and one pink sticky (question).",
        "After rotation, children read their stickies and identify one improvement.",
        "3 volunteers share their most interesting data insight with the class.",
        "Debrief: 'What makes a good data dashboard?'"
      ],
      mascotTieIn: "Digit awards 'Data Detective' certificates to children who can name all their data sources.",
      differentiation: { support: "Pair with confident partner during rotation.", extension: "Viewer must write one new insight they gained from the dashboard." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 6: Computers and Our World (Lessons 30-35)
  // Theme: Hardware, Software, and Systems | Mascot: Chip 💾
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l30', title:'Hardware and Software', mission:'Learn computer components', csTopics:['Hardware','Software','Operating System'], xp:55, emoji:'💻', character:'chip',
    difficulty:1, estimatedMinutes:45, unit:6, unitName:'Computers and Our World',
    vocabulary:[{word:'Hardware',def:'Physical parts you can touch'},{word:'Software',def:'Programs that run on hardware'},{word:'Operating System',def:'The main software running a computer'}],
    storyLine:'Meet Chip! Learn the difference between hardware and software.',
    conceptName:'Hardware vs Software', conceptExplain:'Hardware is physical. Software is programs.',
    activities:['Hardware vs Software Sort','Build a Virtual Computer'],
    challenge:'Sort 20 items into hardware or software!',
    reflection:'Can hardware work without software?',
    quiz:[q('Hardware is:',['Programs','Physical parts you touch','Apps','Websites'],1),q('Software is:',['Keyboard','Programs and apps','Mouse','Screen'],1)],
    badge:null,
    companionActivity: {
      name: "Hardware Hunt",
      format: "Movement / Observation",
      time: "10 minutes",
      groupSize: "Small groups",
      placement: "Hook, before digital Hardware vs Software Sort",
      materials: ["Clipboards or paper", "Pencils"],
      learningConnection: "Children physically locate hardware around the classroom, making the abstract 'hardware = touchable' concrete.",
      steps: [
        "Groups search the classroom for hardware they can touch (screen, keyboard, mouse, printer, router, etc.).",
        "List each item and whether you can touch it (yes = hardware).",
        "Return to seats; one child from each group shares their list.",
        "Teacher writes items on board; class decides: 'Can you touch it?'",
        "Discuss: 'What about software? Can you touch it?'"
      ],
      mascotTieIn: "Chip says: 'If you can touch it, it's hardware like me!'",
      differentiation: { support: "Provide a picture checklist of 5 items to find.", extension: "Groups also list software running on each hardware (e.g. 'Chrome on laptop')." }
    } },

  { id:'l31', title:'Input, Processing, Output', mission:'Understand the IPO model', csTopics:['Input','Processing','Output'], xp:55, emoji:'⚙️', character:'chip',
    difficulty:1, estimatedMinutes:45, unit:6, unitName:'Computers and Our World',
    vocabulary:[{word:'Input',def:'Data going in'},{word:'Processing',def:'The computer thinking'},{word:'Output',def:'The result coming out'}],
    storyLine:'Follow data through a computer! Input → Processing → Output.',
    conceptName:'IPO Model', conceptExplain:'Computers follow IPO: take input, process it, give output.',
    activities:['Trace data through a computer','IPO examples'],
    challenge:'Explain 3 everyday IPO examples!',
    reflection:'What processing happens in a calculator?',
    quiz:[q('IPO stands for:',['Input Process Output','In Phone Out','I Play Outside','Input Print Output'],0)],
    badge:null,
    companionActivity: {
      name: "Human IPO Machine",
      format: "Physical Role-Play",
      time: "12 minutes",
      groupSize: "Groups of 3",
      placement: "Hook, before digital IPO tracing",
      materials: ["Simple maths problem cards"],
      learningConnection: "Children physically become Input, Processing, and Output — experiencing the data flow before tracing it digitally.",
      steps: [
        "Groups of 3 sit in a line: Child 1 (Input), Child 2 (Processor), Child 3 (Output).",
        "Teacher gives a number card to Input (e.g. '5').",
        "Input passes it to Processor and says the task: 'Double it.'",
        "Processor thinks, writes the answer, passes to Output.",
        "Output announces the result aloud. Repeat with different inputs."
      ],
      mascotTieIn: "Chip is the 'master processor' — children pretend to be mini-Chips.",
      differentiation: { support: "Processor can use a calculator.", extension: "Add error-checking: Output must verify the answer is correct before announcing." }
    } },

  { id:'l32', title:'How Computers Store Information', mission:'Learn about storage', csTopics:['RAM','Storage','Memory'], xp:55, emoji:'💾', character:'chip',
    difficulty:1, estimatedMinutes:45, unit:6, unitName:'Computers and Our World',
    vocabulary:[{word:'RAM',def:'Short-term memory, fast but temporary'},{word:'Storage',def:'Long-term memory, slower but permanent'}],
    storyLine:'Where do computers keep information? Learn about RAM and storage.',
    conceptName:'Computer Memory', conceptExplain:'RAM is fast but temporary. Storage is permanent.',
    activities:['RAM vs Storage comparison','Memory relay game'],
    challenge:'Explain the difference between RAM and storage!',
    reflection:'What happens to RAM when you turn off the computer?',
    quiz:[q('RAM is:',['Permanent','Temporary fast memory','Storage','A program'],1),q('Storage is:',['Temporary','Permanent memory','RAM','A bug'],1)],
    badge:null,
    companionActivity: {
      name: "RAM vs Storage Relay",
      format: "Physical Game",
      time: "10 minutes",
      groupSize: "Two teams",
      placement: "Between digital activities",
      materials: ["Whiteboards for each team", "Information cards"],
      learningConnection: "Children experience RAM (fast but temporary) vs Storage (slower but permanent) through a relay game.",
      steps: [
        "Team 1 is 'RAM' — they memorise info for 10 seconds, then erase (teacher covers card).",
        "Team 2 is 'Storage' — they write info down and keep it.",
        "Both teams answer questions about the info.",
        "RAM answers faster but forgets when 'power off' (teacher claps).",
        "Storage is slower but keeps information. Discuss: 'Which is better? Why do we need both?'"
      ],
      mascotTieIn: "Chip explains: 'I use RAM to think fast, but Storage to remember forever!'",
      differentiation: { support: "Give RAM team 20 seconds instead of 10.", extension: "Add a 'cache' role — fastest but smallest memory." }
    } },

  { id:'l33', title:'How Computers Communicate', mission:'Learn about networks', csTopics:['Networks','Communication','Connection'], xp:60, emoji:'🔗', character:'chip',
    difficulty:1, estimatedMinutes:45, unit:6, unitName:'Computers and Our World',
    vocabulary:[{word:'Network',def:'Connected computers sharing information'},{word:'Router',def:'Device connecting to the internet'}],
    storyLine:'Computers talk to each other! Learn how networks work.',
    conceptName:'Networks', conceptExplain:'Networks let computers share information.',
    activities:['Network diagram activity','Message passing game'],
    challenge:'Draw your home network!',
    reflection:'What devices in your home are networked?',
    quiz:[q('A network is:',['One computer','Connected computers','A program','A sprite'],1)],
    badge:null,
    companionActivity: {
      name: "Human Network Message Pass",
      format: "Physical Game",
      time: "12 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital network diagram",
      materials: ["String or rope to connect children", "Message cards"],
      learningConnection: "Children become nodes in a network, physically passing messages and discovering how data travels.",
      steps: [
        "Children stand in a circle, each holding a piece of string connected to 2 neighbours.",
        "One child is the 'Server' (holds the message). Another is the 'Client' (wants the message).",
        "Message must pass from Server to Client through the network (person to person).",
        "Count how many 'hops' it takes. Try different routes.",
        "Discuss: 'What happens if one node is broken (sits down)? Can the message still reach?'"
      ],
      mascotTieIn: "Chip is the 'Router' in the middle — all messages go through Chip first.",
      differentiation: { support: "Use only 6-8 children to simplify the network.", extension: "Add multiple messages at once — does the network slow down?" }
    } },

  { id:'l34', title:'Computers in Different Jobs', mission:'Explore tech careers', csTopics:['Careers','Technology','Society'], xp:55, emoji:'👩‍💻', character:'chip',
    difficulty:1, estimatedMinutes:45, unit:6, unitName:'Computers and Our World',
    vocabulary:[{word:'Technology',def:'Tools that solve problems'},{word:'Career',def:'A job you do over time'}],
    storyLine:'Doctors, pilots, farmers — everyone uses computers! Explore tech in jobs.',
    conceptName:'Computers in Society', conceptExplain:'Almost every job uses computers in some way.',
    activities:['Career cards matching','Interview questions'],
    challenge:'Research 3 careers that use computers!',
    reflection:'What job would you like that uses technology?',
    quiz:[q('Computers are used by:',['Only programmers','Almost every job','No one','Only teachers'],1)],
    badge:null,
    companionActivity: {
      name: "Tech Careers Charades",
      format: "Drama / Game",
      time: "12 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital career matching",
      materials: ["Career cards (Doctor, Pilot, Farmer, Chef, Teacher, Game Designer, etc.)"],
      learningConnection: "Children act out careers and guess what technology each uses, making the 'computers everywhere' concept memorable.",
      steps: [
        "Child draws a career card and acts out the job (no talking).",
        "Class guesses the career.",
        "Once guessed, class brainstorms: 'What computer or technology does this job use?'",
        "Write answers on board (e.g. Doctor = patient records, MRI scanner).",
        "Repeat 5-6 times. Discuss: 'Were any careers without technology?'"
      ],
      mascotTieIn: "Chip 'helps' each career — 'Chip helps doctors with records!'",
      differentiation: { support: "Give hints by showing 2-3 options before guessing.", extension: "Children invent a NEW career that uses technology in an unusual way." }
    } },

  { id:'l35', title:'Unit 6 Project: Chip\'s Computer Diary', mission:'Document a computer journey', csTopics:['Systems','Hardware','Software'], xp:100, emoji:'📔', character:'chip',
    difficulty:2, estimatedMinutes:45, unit:6, unitName:'Computers and Our World',
    vocabulary:[{word:'Diary',def:'A written record'}],
    storyLine:'Write from Chip\'s perspective! Document data journeys through a computer.',
    conceptName:'Computer Systems', conceptExplain:'Put together everything about how computers work.',
    activities:['Write Chip\'s diary entries','Illustrate data journeys','Present to class'],
    challenge:'Create a 5-entry diary of data\'s journey through a computer!',
    reflection:'What part of the computer journey is most interesting?',
    quiz:[q('A computer system includes:',['Only hardware','Hardware, software, and users','Only software','Nothing'],1)],
    badge:'💾',
    companionActivity: {
      name: "Diary Comic Strip",
      format: "Creative Activity",
      time: "15 minutes",
      groupSize: "Individual",
      placement: "Before or alongside digital diary creation",
      materials: ["A4 paper folded into 6 panels", "Colouring pencils"],
      learningConnection: "Children illustrate Chip's data journey as a comic strip, making the IPO and storage concepts visual before writing digitally.",
      steps: [
        "Fold paper into 6 panels; each panel is a 'diary entry.'",
        "Panel 1: Input arrives (e.g. keypress). Panel 2: Data travels to RAM.",
        "Panel 3: CPU processes the data. Panel 4: Output sent to screen.",
        "Panel 5: Data saved to storage. Panel 6: Chip 'rests' (power off).",
        "Share comics; discuss: 'What did each step look like?'"
      ],
      mascotTieIn: "Chip is the main character of every comic — children draw Chip at each step.",
      differentiation: { support: "Provide template panels with step labels.", extension: "Add speech bubbles for Chip at each stage explaining what's happening." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 7: Online Safety Champions (Lessons 36-41)
  // Theme: Digital Citizenship & Online Safety | Mascot: Shield 🛡️
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l36', title:'My Digital Footprint', mission:'Understand online traces', csTopics:['Digital Footprint','Privacy','Personal Information'], xp:55, emoji:'👣', character:'shield',
    difficulty:1, estimatedMinutes:45, unit:7, unitName:'Online Safety Champions',
    vocabulary:[{word:'Digital Footprint',def:'The trail left by online activities'},{word:'Personal Information',def:'Details that identify you'},{word:'Private',def:'Information only for trusted people'}],
    storyLine:'Meet Shield the Safety Superhero! Learn about digital footprints.',
    conceptName:'Digital Footprint', conceptExplain:'Everything you do online leaves a trace that can last forever.',
    activities:['Private or Public Sort','Digital Footprint Story','My Safe Profile'],
    challenge:'Identify what\'s safe to share vs what\'s private!',
    reflection:'How many digital footprints do you leave in a day?',
    quiz:[q('A digital footprint is:',['A shoe print','Trail of online activity','A game','A sprite'],1),q('Home address is:',['Safe to share','Private','Public','Not important'],1)],
    badge:null,
    companionActivity: {
      name: "Footprint Trail Activity",
      format: "Movement / Discussion",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital Private or Public Sort",
      materials: ["Paper footprint shapes (10-12)", "Blu-Tack", "Marker pens"],
      learningConnection: "Children physically create and follow a footprint trail, making the 'digital footprint' metaphor tangible.",
      steps: [
        "Lay out footprint shapes in a trail across the room.",
        "On each footprint, write an online activity: 'posted a photo,' 'liked a video,' 'searched for a game,' etc.",
        "Children walk the trail, stopping at each footprint to discuss: 'Who might see this?'",
        "At the end, reveal: 'This trail stays forever — it's your digital footprint!'",
        "Discuss: 'Which footprints would you want a future employer to see?'"
      ],
      mascotTieIn: "Shield 'guards' the trail and asks: 'Is this footprint safe?'",
      differentiation: { support: "Pre-label footprints with 'safe' or 'private' colours.", extension: "Children write their own footprint examples for a second trail." }
    } },

  { id:'l37', title:'Cyberbullying: Be an Upstander', mission:'Stand up against cyberbullying', csTopics:['Cyberbullying','Kindness','Reporting'], xp:60, emoji:'💪', character:'shield',
    difficulty:1, estimatedMinutes:45, unit:7, unitName:'Online Safety Champions',
    vocabulary:[{word:'Cyberbullying',def:'Repeated unkind behaviour online'},{word:'Upstander',def:'Someone who stands up for others'},{word:'Report',def:'Tell a trusted adult'}],
    storyLine:'Be an Upstander, not a Bystander! Learn to stop cyberbullying.',
    conceptName:'Cyberbullying', conceptExplain:'Cyberbullying is wrong. Upstanders help stop it.',
    activities:['Upstander Game scenarios','Upstander Pledge'],
    challenge:'Create your Upstander Pledge!',
    reflection:'What would you do if you saw cyberbullying?',
    quiz:[q('An upstander:',['Does nothing','Helps people being bullied','Joins bullying','Ignores it'],1),q('If you see cyberbullying:',['Join in','Report to trusted adult','Ignore it','Share it'],1)],
    badge:null,
    companionActivity: {
      name: "Upstander Role-Play Scenarios",
      format: "Drama / Discussion",
      time: "15 minutes",
      groupSize: "Small groups of 4",
      placement: "After digital Upstander Game, as deepening",
      materials: ["Scenario cards (pre-written cyberbullying situations)"],
      learningConnection: "Children practise being upstanders in safe role-play, building confidence to act in real situations.",
      steps: [
        "Groups receive a scenario card (e.g. 'A classmate posts a mean comment about another child.').",
        "Groups plan: 1 person is the target, 1 is the bully, 1 is the bystander, 1 is the upstander.",
        "Groups act out the scene, showing what an upstander does.",
        "Class discusses: 'What did the upstander do? Was it effective? What else could they do?'",
        "Repeat with different scenarios."
      ],
      mascotTieIn: "Shield 'coaches' the upstanders: 'Remember: Don't engage the bully — support the target!'",
      differentiation: { support: "Provide upstander script prompts.", extension: "Groups create their own scenario for another group to act out." },
      safetyNotes: "Emphasise this is role-play; no real names or situations. Check in with children after the activity."
    } },

  { id:'l38', title:'Reliable Information: Is It True?', mission:'Spot fake information', csTopics:['Reliability','Fake News','Fact-checking'], xp:60, emoji:'🔍', character:'shield',
    difficulty:1, estimatedMinutes:45, unit:7, unitName:'Online Safety Champions',
    vocabulary:[{word:'Reliable',def:'Can be trusted'},{word:'Fake News',def:'False information spread as truth'},{word:'Fact-check',def:'Verify information is true'}],
    storyLine:'Not everything online is true! Learn to spot fake information.',
    conceptName:'Reliable Sources', conceptExplain:'Check sources before believing information.',
    activities:['True or Fake game','SIFT method practice','Fact-checking Challenge'],
    challenge:'Use SIFT to check 3 facts!',
    reflection:'How can you tell if something is fake?',
    quiz:[q('Fake news is:',['Always true','False information','Good to share','From teachers'],1),q('Before sharing you should:',['Share immediately','Check if it\'s true','Ignore it','Delete it'],1)],
    badge:null,
    companionActivity: {
      name: "Two Truths and a Lie — Fact Check Edition",
      format: "Game / Discussion",
      time: "12 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital True or Fake game",
      materials: ["Whiteboard", "Fact cards (2 true, 1 false per round)"],
      learningConnection: "Children practise spotting false information in a familiar game format before applying SIFT to digital content.",
      steps: [
        "Teacher reads 3 'facts' — 2 are true, 1 is made up.",
        "Children vote: which is the lie?",
        "Reveal the answer and discuss: 'What clues made it seem fake?'",
        "Repeat 3-4 rounds with different topics (animals, space, history).",
        "Introduce SIFT: 'Now let's learn a proper way to check facts online.'"
      ],
      mascotTieIn: "Shield 'investigates' each fact with a magnifying glass on the board.",
      differentiation: { support: "Make the lie more obvious.", extension: "A child creates the 3 facts for the next round." }
    } },

  { id:'l39', title:'Screen Time and Digital Wellbeing', mission:'Balance technology use', csTopics:['Screen Time','Wellbeing','Balance'], xp:55, emoji:'⚖️', character:'shield',
    difficulty:1, estimatedMinutes:45, unit:7, unitName:'Online Safety Champions',
    vocabulary:[{word:'Screen Time',def:'Time spent looking at screens'},{word:'Balance',def:'The right mix of activities'},{word:'Wellbeing',def:'Being healthy and happy'}],
    storyLine:'Too much screen time isn\'t healthy! Create your digital balance plan.',
    conceptName:'Digital Balance', conceptExplain:'Balance screen time with other activities.',
    activities:['Digital Balance Wheel','Wellbeing Plan'],
    challenge:'Create your personal Digital Wellbeing Plan!',
    reflection:'What activities could replace screen time?',
    quiz:[q('Good screen habits include:',['No breaks','Regular breaks','All day screens','No balance'],1)],
    badge:null,
    companionActivity: {
      name: "Balance Wheel Spinner",
      format: "Movement / Discussion",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital Balance Wheel",
      materials: ["Large floor spinner (or a hula hoop with sections)", "Activity cards (Screen Time, Exercise, Reading, Friends, Sleep, etc.)"],
      learningConnection: "Children physically spin and act out different activities, discovering what a 'balanced day' looks like.",
      steps: [
        "Place activity cards around the hula hoop on the floor.",
        "Child spins a pencil in the centre; it points to an activity.",
        "Child acts out the activity for 10 seconds; class guesses.",
        "After 5-6 spins, discuss: 'Did we get a balanced day? Too much screen time?'",
        "Rearrange cards to show a balanced day; discuss what that looks like."
      ],
      mascotTieIn: "Shield holds the 'balance scale' — too much of one thing tips the scale!",
      differentiation: { support: "Use picture cards for activities.", extension: "Children design their own balance wheel with time allocations." }
    } },

  { id:'l40', title:'Strong Passwords and Security', mission:'Protect your accounts', csTopics:['Passwords','Security','Protection'], xp:55, emoji:'🔐', character:'shield',
    difficulty:1, estimatedMinutes:45, unit:7, unitName:'Online Safety Champions',
    vocabulary:[{word:'Password',def:'Secret code to access accounts'},{word:'Strong Password',def:'Hard to guess, uses letters, numbers, symbols'},{word:'Security',def:'Keeping things safe'}],
    storyLine:'Protect yourself online! Learn to create strong passwords.',
    conceptName:'Password Security', conceptExplain:'Strong passwords keep your accounts safe.',
    activities:['Strong vs Weak passwords','Create a strong password'],
    challenge:'Create 3 strong passwords using the rules!',
    reflection:'Why should you never share passwords?',
    quiz:[q('A strong password has:',['Just your name','Letters, numbers, symbols','Only numbers','Your birthday'],1)],
    badge:null,
    companionActivity: {
      name: "Password Cracker Challenge",
      format: "Game / Discussion",
      time: "10 minutes",
      groupSize: "Pairs",
      placement: "Hook, before digital Strong vs Weak sorting",
      materials: ["Whiteboard", "Password cards (mix of weak and strong examples)"],
      learningConnection: "Children try to 'crack' weak passwords, discovering why strong passwords are important.",
      steps: [
        "Teacher shows a weak password on the board: 'password123.'",
        "Pairs have 30 seconds to guess it (teacher reveals after 30s).",
        "Show a strong password: 'Tg4$mK9!pL.' Can they guess in 30 seconds? (No!)",
        "Discuss: 'What made the first one easy to guess? What made the second one hard?'",
        "Introduce password rules: length, mix of characters, no personal info."
      ],
      mascotTieIn: "Shield demonstrates 'cracking' the weak password easily but 'bouncing off' the strong one.",
      differentiation: { support: "Use only 2 examples: very weak vs very strong.", extension: "Pairs create their own weak/strong password pairs for others to judge." }
    } },

  { id:'l41', title:'Unit 7 Project: Online Safety Guide', mission:'Create a safety resource', csTopics:['Online Safety','Presentation','Teaching'], xp:100, emoji:'📖', character:'shield',
    difficulty:2, estimatedMinutes:45, unit:7, unitName:'Online Safety Champions',
    vocabulary:[{word:'Guide',def:'Instructions to help others'}],
    storyLine:'Become an Online Safety Champion! Create a guide for Year 2 pupils.',
    conceptName:'Safety Education', conceptExplain:'Teaching others helps everyone stay safe online.',
    activities:['Create an Online Safety Guide','Include all safety topics','Present to younger students'],
    challenge:'Create a complete Online Safety Guide covering all topics!',
    reflection:'What was most important to include?',
    quiz:[q('A safety guide should:',['Be confusing','Be clear and helpful','Have no pictures','Be hidden'],1)],
    badge:'🛡️',
    companionActivity: {
      name: "Safety Poster Gallery",
      format: "Creative + Gallery Walk",
      time: "15 minutes",
      groupSize: "Pairs then whole class",
      placement: "After digital guide creation, as showcase",
      materials: ["A3 paper", "Colouring pencils/markers"],
      learningConnection: "Children create physical posters to accompany their digital guides, reinforcing key messages through visual design.",
      steps: [
        "Pairs choose one safety topic (footprints, cyberbullying, fake news, passwords, screen time).",
        "Create an A3 poster with a catchy slogan, illustration, and 3 key tips.",
        "Display posters around the room.",
        "Gallery walk: pairs view others' posters and leave one sticky note comment.",
        "Best posters go on display for younger students to see."
      ],
      mascotTieIn: "Shield 'awards' certificates to the 'Online Safety Champions' — every child receives one.",
      differentiation: { support: "Provide poster templates with labelled sections.", extension: "Children record a 30-second safety tip video to go with their poster." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 8: Networks and the Internet (Lessons 42-47)
  // Theme: How Computers Connect | Mascot: Netty 🌐
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l42', title:'What is the Internet?', mission:'Understand global networks', csTopics:['Internet','Networks','Servers'], xp:55, emoji:'🌐', character:'netty',
    difficulty:1, estimatedMinutes:45, unit:8, unitName:'Networks and the Internet',
    vocabulary:[{word:'Internet',def:'A global network of millions of computers'},{word:'World Wide Web',def:'Websites on the internet'},{word:'Server',def:'A computer that stores and sends data'}],
    storyLine:'Meet Netty the Network Navigator! Explore the world\'s biggest network.',
    conceptName:'The Internet', conceptExplain:'The internet is a global network connecting billions of devices.',
    activities:['String Network Activity','Internet vs Web Sort','Packet Passing Game'],
    challenge:'Explain the difference between Internet and World Wide Web!',
    reflection:'How many devices are connected to the internet?',
    quiz:[q('The internet is:',['One computer','A global network','A website','A program'],1),q('The World Wide Web is:',['The internet','Websites on the internet','A network','A server'],1)],
    badge:null,
    companionActivity: {
      name: "String Network Activity",
      format: "Physical Game",
      time: "12 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital Internet vs Web Sort",
      materials: ["Ball of string or yarn"],
      learningConnection: "Children physically create a network by passing string, experiencing how the internet connects millions of devices.",
      steps: [
        "Children stand in a circle. One child holds the string end and is the 'Server.'",
        "Server throws the ball to another child (keeping hold of their end) — that child is a 'Computer.'",
        "Continue until everyone is connected by string.",
        "Teacher asks: 'How many connections are there? What happens if one person lets go?'",
        "Reveal: 'This is like the internet — millions of computers connected!'"
      ],
      mascotTieIn: "Netty is the 'Router' in the centre, helping messages travel through the network.",
      differentiation: { support: "Use only 10-12 children for a smaller network.", extension: "Send a 'message' (ball) through the network — it must pass through each connection." }
    } },

  { id:'l43', title:'URLs and Web Browsers', mission:'Navigate the web', csTopics:['URLs','Browsers','Websites'], xp:55, emoji:'🔗', character:'netty',
    difficulty:1, estimatedMinutes:45, unit:8, unitName:'Networks and the Internet',
    vocabulary:[{word:'URL',def:'Web address like www.example.com'},{word:'Browser',def:'Program to view websites'},{word:'Website',def:'Pages on the internet'}],
    storyLine:'Learn to navigate the web safely! Understand URLs and browsers.',
    conceptName:'Web Navigation', conceptExplain:'URLs are addresses. Browsers help you visit them.',
    activities:['URL anatomy','Browser features tour'],
    challenge:'Identify the parts of 5 different URLs!',
    reflection:'How do you know if a website is safe?',
    quiz:[q('A URL is:',['A browser','A web address','A server','A network'],1),q('A browser is:',['A website','Program to view websites','A server','The internet'],1)],
    badge:null,
    companionActivity: {
      name: "URL Puzzle Build",
      format: "Hands-On / Discussion",
      time: "10 minutes",
      groupSize: "Pairs",
      placement: "After digital URL anatomy, as consolidation",
      materials: ["URL part cards (protocol: https://, domain: www.example, extension: .com/.org/.gov, path: /page)"],
      learningConnection: "Children physically assemble URLs from parts, reinforcing the anatomy before applying it digitally.",
      steps: [
        "Each pair receives shuffled URL part cards.",
        "Pairs assemble 3 complete URLs from the parts.",
        "Share with another pair: 'Is this a real URL? What type of website might it be?'",
        "Discuss: 'What does .gov mean? .org? .com?'",
        "Extension: 'Which parts could a hacker change to trick you?'"
      ],
      mascotTieIn: "Netty 'reads' each URL and says 'This looks safe!' or 'Watch out — check this domain!'",
      differentiation: { support: "Provide only 2 URL parts to assemble.", extension: "Children create a fake/phishing URL and explain how to spot it." }
    } },

  { id:'l44', title:'Search Engines', mission:'Find information online', csTopics:['Search Engines','Keywords','Research'], xp:55, emoji:'🔎', character:'netty',
    difficulty:1, estimatedMinutes:45, unit:8, unitName:'Networks and the Internet',
    vocabulary:[{word:'Search Engine',def:'Tool to find information online'},{word:'Keywords',def:'Important words for searching'},{word:'Results',def:'What the search finds'}],
    storyLine:'Search engines help find information! Learn to search effectively.',
    conceptName:'Searching', conceptExplain:'Good keywords give better search results.',
    activities:['Keyword Challenge','Search comparison'],
    challenge:'Find answers to 5 questions using good keywords!',
    reflection:'What makes a good search keyword?',
    quiz:[q('Search engines:',['Store websites','Find information','Create websites','Delete data'],1)],
    badge:null,
    companionActivity: {
      name: "Keyword Guessing Game",
      format: "Game / Discussion",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital Keyword Challenge",
      materials: ["Topic cards (e.g. 'Dinosaurs,' 'Space,' 'Vikings')"],
      learningConnection: "Children practise choosing keywords before using search engines, improving their search skills.",
      steps: [
        "Teacher draws a topic card and keeps it secret.",
        "Children ask yes/no questions using keywords: 'Is it about animals?' 'Is it in history?'",
        "After 5 questions, children guess the topic.",
        "Discuss: 'Which keywords helped most? Which were too vague?'",
        "Introduce: 'Good keywords narrow down results quickly!'"
      ],
      mascotTieIn: "Netty is the 'Search Engine' — only responds to good keywords!",
      differentiation: { support: "Give hints after 3 failed questions.", extension: "Children create their own topic cards for the next round." }
    } },

  { id:'l45', title:'Email: Digital Letters', mission:'Understand email', csTopics:['Email','Communication','Digital'], xp:55, emoji:'📧', character:'netty',
    difficulty:1, estimatedMinutes:45, unit:8, unitName:'Networks and the Internet',
    vocabulary:[{word:'Email',def:'Electronic mail sent over the internet'},{word:'Inbox',def:'Where received emails appear'},{word:'Attachment',def:'File sent with an email'}],
    storyLine:'Email is like instant mail! Learn how digital messages travel.',
    conceptName:'Email', conceptExplain:'Emails travel instantly across the internet.',
    activities:['Email anatomy','Practice writing emails'],
    challenge:'Write a polite email with correct parts!',
    reflection:'How is email different from paper letters?',
    quiz:[q('Email is:',['Paper mail','Electronic mail','A website','A game'],0)],
    badge:null,
    companionActivity: {
      name: "Pass the Email",
      format: "Physical Role-Play",
      time: "10 minutes",
      groupSize: "Groups of 5",
      placement: "Hook, before digital email anatomy",
      materials: ["Paper 'email' templates", "Envelopes"],
      learningConnection: "Children physically pass emails through a 'network,' experiencing how messages travel before writing digital ones.",
      steps: [
        "Each group has: Sender, Outbox, Router, Inbox, Receiver.",
        "Sender writes a short message on the email template.",
        "Email passes: Sender → Outbox → Router → Inbox → Receiver.",
        "Receiver reads aloud. Discuss: 'What if the Router broke?'",
        "Compare: 'How is this faster than paper post?'"
      ],
      mascotTieIn: "Netty is the 'Router' — helps emails find their destination.",
      differentiation: { support: "Reduce to 3 roles: Sender, Router, Receiver.", extension: "Add 'spam filter' role that rejects bad messages." }
    } },

  { id:'l46', title:'Networks Everywhere', mission:'Find networks in daily life', csTopics:['Networks','IoT','Smart Devices'], xp:60, emoji:'🏠', character:'netty',
    difficulty:1, estimatedMinutes:45, unit:8, unitName:'Networks and the Internet',
    vocabulary:[{word:'IoT',def:'Internet of Things — connected smart devices'},{word:'Smart Device',def:'Device connected to the internet'}],
    storyLine:'Networks are everywhere! Discover the Internet of Things.',
    conceptName:'IoT', conceptExplain:'Smart devices connect to networks to share information.',
    activities:['Smart device hunt','IoT benefits and risks'],
    challenge:'Find 10 connected devices in your life!',
    reflection:'Is everything being connected good or bad?',
    quiz:[q('IoT means:',['Internet of Toys','Internet of Things','Internet of Teams','Internet of Tools'],1)],
    badge:null,
    companionActivity: {
      name: "Smart Home Design Challenge",
      format: "Creative / Discussion",
      time: "12 minutes",
      groupSize: "Pairs",
      placement: "After digital smart device hunt, as application",
      materials: ["A4 paper", "Pencils"],
      learningConnection: "Children design a smart home, applying IoT concepts and discussing benefits and risks.",
      steps: [
        "Pairs draw a simple house outline.",
        "Add 5+ smart devices: smart fridge, thermostat, doorbell, lights, etc.",
        "Draw lines showing how devices connect (to router, to each other, to cloud).",
        "Discuss: 'What's good about this? What could go wrong?'",
        "Share designs; vote on 'most creative' and 'safest' smart home."
      ],
      mascotTieIn: "Netty lives in the 'cloud' at the centre of each smart home.",
      differentiation: { support: "Provide a pre-drawn house with device labels to place.", extension: "Design a smart classroom — what devices would help learning?" }
    } },

  { id:'l47', title:'Unit 8 Project: Design a Smart School', mission:'Plan a connected school', csTopics:['Networks','Design','IoT'], xp:100, emoji:'🏫', character:'netty',
    difficulty:2, estimatedMinutes:45, unit:8, unitName:'Networks and the Internet',
    vocabulary:[{word:'Smart School',def:'A school with connected technology'}],
    storyLine:'Design your ideal Smart School! Plan what devices would be connected.',
    conceptName:'Network Design', conceptExplain:'Plan what devices connect and how they help.',
    activities:['Design Smart School network','Explain how devices communicate','Present design'],
    challenge:'Design a Smart School with at least 8 connected devices!',
    reflection:'What problems could your Smart School solve?',
    quiz:[q('A Smart School has:',['No technology','Connected devices working together','Only one computer','No networks'],1)],
    badge:'🌐',
    companionActivity: {
      name: "Smart School Pitch",
      format: "Discussion / Presentation",
      time: "15 minutes",
      groupSize: "Groups of 4",
      placement: "After digital design, as showcase",
      materials: ["Group designs", "Presentation space"],
      learningConnection: "Groups pitch their smart school designs, explaining how devices connect and solve problems.",
      steps: [
        "Groups prepare a 2-minute pitch for their Smart School.",
        "Each pitch must cover: What devices? How do they connect? What problems do they solve?",
        "Groups present to the class.",
        "Class asks questions about each design.",
        "Vote for 'Most Innovative,' 'Most Practical,' and 'Best Presentation.'"
      ],
      mascotTieIn: "Netty 'awards' certificates to all teams for their network designs.",
      differentiation: { support: "Provide pitch template with sentence starters.", extension: "Groups must also explain what happens if the network fails." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 9: Creative Computing — Digital Art and Music (Lessons 48-53)
  // Theme: Digital Creativity | Mascot: Aria 🎨
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l48', title:'Digital Art: Pixels and Colours', mission:'Create digital artwork', csTopics:['Digital Art','Pixels','RGB'], xp:55, emoji:'🎨', character:'aria',
    difficulty:1, estimatedMinutes:45, unit:9, unitName:'Creative Computing',
    vocabulary:[{word:'Pixel',def:'Tiny square of colour making images'},{word:'RGB',def:'Red, Green, Blue — colours computers mix'},{word:'Resolution',def:'How detailed an image is'}],
    storyLine:'Meet Aria the Creative AI! Create digital art with pixels and colours.',
    conceptName:'Digital Images', conceptExplain:'Computer images are made of tiny pixels. Colours mix using RGB.',
    activities:['RGB Colour Mixer','Digital Self-Portrait pixel art'],
    challenge:'Create a pixel art portrait using at least 5 colours!',
    reflection:'How do red, green, and blue make other colours?',
    quiz:[q('Pixels are:',['Large squares','Tiny squares of colour','Sounds','Text'],1),q('RGB stands for:',['Red Green Blue','Really Good Bytes','Random Game Bits','Run Go Build'],0)],
    badge:null,
    companionActivity: {
      name: "Human Pixel Grid",
      format: "Movement / Art",
      time: "12 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital RGB Colour Mixer",
      materials: ["Coloured cards (red, green, blue, black, white)", "Open floor space"],
      learningConnection: "Children become pixels in a living image, understanding how pixels combine to create pictures.",
      steps: [
        "Children sit in a 5×5 grid on the floor, each holding a coloured card.",
        "Teacher calls out: 'All red cards up!' — those children raise cards.",
        "From the front, a simple shape/letter appears.",
        "Change colours to change the image.",
        "Discuss: 'Each of you is a pixel. What happens with more people?' (Higher resolution!)"
      ],
      mascotTieIn: "Aria says: 'Every picture is made of tiny pixels — just like you!'",
      differentiation: { support: "Use only 3×3 grid for simpler shapes.", extension: "Children design their own image for the grid to display." }
    } },

  { id:'l49', title:'Animation: Making Things Move', mission:'Create animations', csTopics:['Animation','Frames','Motion'], xp:55, emoji:'🎬', character:'aria',
    difficulty:1, estimatedMinutes:45, unit:9, unitName:'Creative Computing',
    vocabulary:[{word:'Animation',def:'Making things appear to move'},{word:'Frame',def:'One picture in an animation'},{word:'Frame Rate',def:'How fast frames change'}],
    storyLine:'Bring your art to life! Create animations that move.',
    conceptName:'Animation', conceptExplain:'Animation shows many frames quickly to create movement.',
    activities:['Flip book animation','Animate Your Creature project'],
    challenge:'Create a 4-frame walking animation!',
    reflection:'How many frames make smooth animation?',
    quiz:[q('Animation works by:',['One picture','Showing many frames quickly','Sound only','Text'],1)],
    badge:null,
    companionActivity: {
      name: "Stop-Motion Statues",
      format: "Movement / Drama",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital animation",
      materials: ["Open space"],
      learningConnection: "Children experience being 'frames' in an animation, understanding how small changes create movement.",
      steps: [
        "Teacher calls 'FREEZE!' — everyone holds a pose.",
        "Teacher says 'Next frame!' — children move slightly to a new pose.",
        "Repeat 6-8 times, each time changing pose slightly.",
        "Review: 'We just made a human animation! Each freeze was a frame.'",
        "Discuss: 'What happens if frames are too different? Too similar?'"
      ],
      mascotTieIn: "Aria 'directs' the animation, calling out frame changes.",
      differentiation: { support: "Give a theme for poses (e.g. 'running').", extension: "Small groups create a mini story with 10 frames." }
    } },

  { id:'l50', title:'Digital Music: Notes and Loops', mission:'Compose digital music', csTopics:['Digital Music','Notes','Loops'], xp:60, emoji:'🎵', character:'aria',
    difficulty:1, estimatedMinutes:45, unit:9, unitName:'Creative Computing',
    vocabulary:[{word:'Note',def:'A single musical sound'},{word:'Loop',def:'Music that repeats'},{word:'Tempo',def:'Speed of music'}],
    storyLine:'Computers make music! Compose using notes and loops.',
    conceptName:'Digital Music', conceptExplain:'Computers create music using notes, loops, and tempo.',
    activities:['Music with Loops','8-bar melody composition'],
    challenge:'Compose an 8-bar melody with loops!',
    reflection:'How do loops help create music?',
    quiz:[q('A music loop:',['Plays once','Repeats','Stops','Is silent'],1)],
    badge:null,
    companionActivity: {
      name: "Body Percussion Loops",
      format: "Music / Movement",
      time: "12 minutes",
      groupSize: "Groups of 4",
      placement: "Hook, before digital music composition",
      materials: ["None (use body percussion)"],
      learningConnection: "Children create musical loops using clapping and stomping, understanding repetition in music before composing digitally.",
      steps: [
        "Groups create a 4-beat body percussion pattern (e.g. clap-clap-stomp-snap).",
        "Each group performs their pattern once.",
        "Teacher says 'LOOP 4!' — groups repeat their pattern 4 times.",
        "Combine groups: one loops while another adds a different pattern.",
        "Discuss: 'How is this like programming music loops?'"
      ],
      mascotTieIn: "Aria 'conducts' the class orchestra of loops.",
      differentiation: { support: "Start with 2-beat patterns.", extension: "Add tempo changes (faster/slower loops)." }
    } },

  { id:'l51', title:'Sound Effects and Instruments', mission:'Add sound to creations', csTopics:['Sound Effects','Instruments','Audio'], xp:55, emoji:'🎹', character:'aria',
    difficulty:1, estimatedMinutes:45, unit:9, unitName:'Creative Computing',
    vocabulary:[{word:'Sound Effect',def:'Short audio for events'},{word:'Instrument',def:'Tool that makes music'},{word:'Soundtrack',def:'Music for a project'}],
    storyLine:'Add personality with sound! Create soundtracks and effects.',
    conceptName:'Audio Design', conceptExplain:'Sound effects and music make projects more engaging.',
    activities:['Sound effect library','Soundtrack Creator'],
    challenge:'Create a soundtrack with 3 effects and background music!',
    reflection:'How does sound change the mood?',
    quiz:[q('Sound effects are:',['Long music','Short audio for events','Images','Text'],1)],
    badge:null,
    companionActivity: {
      name: "Classroom Foley Studio",
      format: "Creative / Performance",
      time: "12 minutes",
      groupSize: "Groups of 3-4",
      placement: "Before digital Soundtrack Creator",
      materials: ["Classroom objects (paper, pencils, keys, etc.)"],
      learningConnection: "Children create real-world sound effects (Foley), understanding audio design before digital composition.",
      steps: [
        "Teacher reads a short scene with sound cues (e.g. 'door creaked, glass dropped').",
        "Groups use classroom objects to create each sound live.",
        "Groups share their best effect; class votes on 'most realistic.'",
        "Discuss: 'How does sound change how we feel about a scene?'",
        "Transfer to digital: 'Now we'll find or create these sounds digitally.'"
      ],
      mascotTieIn: "Aria directs the 'Foley Crew' from the front of the class.",
      differentiation: { support: "Provide object suggestions for each sound.", extension: "Groups create a 20-second audio scene." }
    } },

  { id:'l52', title:'Combining Art and Music', mission:'Create multimedia projects', csTopics:['Multimedia','Integration','Creativity'], xp:65, emoji:'✨', character:'aria',
    difficulty:2, estimatedMinutes:45, unit:9, unitName:'Creative Computing',
    vocabulary:[{word:'Multimedia',def:'Combining different media types'}],
    storyLine:'Put it all together! Combine art, animation, and music.',
    conceptName:'Multimedia', conceptExplain:'Multimedia combines images, animation, and sound.',
    activities:['Plan multimedia project','Combine elements'],
    challenge:'Create a 30-second multimedia experience!',
    reflection:'What element had the biggest impact?',
    quiz:[q('Multimedia combines:',['Only images','Images, animation, and sound','Only text','Only music'],1)],
    badge:null,
    companionActivity: {
      name: "Multimedia Storyboard",
      format: "Creative / Planning",
      time: "12 minutes",
      groupSize: "Pairs",
      placement: "Before digital project work",
      materials: ["A4 paper divided into 6 panels", "Colouring pencils"],
      learningConnection: "Children plan their multimedia project on paper, thinking about how images, animation, and sound work together.",
      steps: [
        "Pairs fold paper into 6 panels (storyboard frames).",
        "For each frame, sketch the visual AND write the sound/music.",
        "Mark where animation happens (arrows, 'MOVES' label).",
        "Share with another pair; get feedback on the plan.",
        "Move to digital creation with a clear plan."
      ],
      mascotTieIn: "Aria reviews storyboards and gives a 'Creative Approved' stamp.",
      differentiation: { support: "Provide template with labels (Image/Sound/Animation).", extension: "Add a 'mood' indicator for each frame." }
    } },

  { id:'l53', title:'Unit 9 Project: Digital Art Gallery', mission:'Showcase creative work', csTopics:['Portfolio','Presentation','Art'], xp:100, emoji:'🖼️', character:'aria',
    difficulty:2, estimatedMinutes:45, unit:9, unitName:'Creative Computing',
    vocabulary:[{word:'Gallery',def:'A place to display art'},{word:'Artist Statement',def:'Explanation of your art'}],
    storyLine:'The Digital Art Gallery opens! Showcase your creative computing work.',
    conceptName:'Creative Portfolio', conceptExplain:'Present your best creative work with explanations.',
    activities:['Compile all creative work','Write artist statements','Gallery presentation'],
    challenge:'Create a gallery with art, animation, and music!',
    reflection:'What piece are you most proud of?',
    quiz:[q('An artist statement:',['Hides your work','Explains your art','Deletes art','Is blank'],1)],
    badge:'🎨',
    companionActivity: {
      name: "Gallery Opening Night",
      format: "Gallery Walk / Presentation",
      time: "15 minutes",
      groupSize: "Individual then whole class",
      placement: "After digital gallery creation, as showcase",
      materials: ["Screens displaying galleries", "Name tags (optional)"],
      learningConnection: "Children present their galleries like a real art opening, practising explanation and receiving feedback.",
      steps: [
        "Children display their gallery on screens.",
        "Each child stands by their 'exhibit' for a 5-minute viewing session.",
        "Visitors (classmates) walk around, asking artists questions.",
        "After viewing, visitors write one positive comment on a sticky note.",
        "3-4 volunteers give a 1-minute 'artist talk' about their favourite piece."
      ],
      mascotTieIn: "Aria 'opens' the gallery with a welcome speech.",
      differentiation: { support: "Pair shy artists with a confident 'co-curator.'", extension: "Artists prepare a 30-second elevator pitch for each piece." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 10: Problem Solving with Code (Lessons 54-59)
  // Theme: Intermediate Programming | Mascot: Logic 🦁
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l54', title:'Debugging Challenges', mission:'Debug complex programs', csTopics:['Debugging','Testing','Problem Solving'], xp:60, emoji:'🔧', character:'logic',
    difficulty:2, estimatedMinutes:45, unit:10, unitName:'Problem Solving with Code',
    vocabulary:[{word:'Systematic',def:'Working in a careful, ordered way'},{word:'Trace',def:'Following code step by step'}],
    storyLine:'Meet Logic the Lion! Master debugging with systematic approaches.',
    conceptName:'Advanced Debugging', conceptExplain:'Systematic debugging means tracing code step by step.',
    activities:['Bug Buster Challenges — 8 buggy programs','Document bugs and fixes'],
    challenge:'Fix 8 different bugs and document your process!',
    reflection:'Which type of bug was hardest to find?',
    quiz:[q('Systematic debugging:',['Guesses randomly','Works step by step','Deletes everything','Ignores bugs'],1)],
    badge:null,
    companionActivity: {
      name: "Bug Detective Role-Play",
      format: "Drama / Discussion",
      time: "12 minutes",
      groupSize: "Groups of 4",
      placement: "Hook, before digital Bug Buster Challenges",
      materials: ["Bug scenario cards"],
      learningConnection: "Children role-play systematic debugging, practising the 'trace step by step' approach before applying it to code.",
      steps: [
        "Groups receive a 'buggy recipe' card (e.g. 'Toast: Turn on toaster, put bread in, get butter, spread butter, eat').",
        "Groups act out the recipe and identify the bug (butter before bread is toasted!).",
        "Groups fix the bug and re-perform.",
        "Share: 'What was the bug? How did you find it?'",
        "Introduce: 'We trace code step by step — just like acting out a recipe.'"
      ],
      mascotTieIn: "Logic 'roars' when a bug is found and fixed.",
      differentiation: { support: "Bugs are obvious (missing a whole step).", extension: "Bugs are subtle (wrong order, wrong amount)." }
    } },

  { id:'l55', title:'Functions: Reusable Code', mission:'Create custom blocks', csTopics:['Functions','Reusability','Organisation'], xp:65, emoji:'📦', character:'logic',
    difficulty:2, estimatedMinutes:45, unit:10, unitName:'Problem Solving with Code',
    vocabulary:[{word:'Function',def:'A reusable block of code'},{word:'Define',def:'Create a custom block'},{word:'Call',def:'Use a custom block'}],
    storyLine:'Write code once, use it many times! Create custom blocks.',
    conceptName:'Functions', conceptExplain:'Functions let you reuse code without copying it.',
    activities:['Build custom Draw Square block','Use functions for shapes'],
    challenge:'Create 3 custom blocks for different shapes!',
    reflection:'How do functions make code better?',
    quiz:[q('A function is:',['A bug','Reusable code block','A sprite','A sound'],1),q('Functions help by:',['Adding bugs','Reusing code','Deleting code','Slowing down'],1)],
    badge:null,
    companionActivity: {
      name: "Function Factory",
      format: "Physical Role-Play",
      time: "12 minutes",
      groupSize: "Groups of 4",
      placement: "Hook, before digital function building",
      materials: ["Function name cards", "Action instruction cards"],
      learningConnection: "Children become 'functions' that can be called, understanding how custom blocks work.",
      steps: [
        "Each child in a group is a 'function' with a name (e.g. 'JUMP', 'SPIN', 'WAVE').",
        "Teacher 'calls' a function: 'JUMP!' — that child performs their action.",
        "Combine: 'JUMP, then SPIN!' — children perform in sequence.",
        "Discuss: 'We defined the function once, but can call it many times.'",
        "Transfer: 'In code, we define a block once and use it whenever we need.'"
      ],
      mascotTieIn: "Logic is the 'main program' that calls functions.",
      differentiation: { support: "Each function does one simple action.", extension: "Create a function that calls other functions (e.g. 'DANCE' = JUMP + SPIN + WAVE)." }
    } },

  { id:'l56', title:'Complex Conditionals', mission:'Use advanced IF/ELSE', csTopics:['Conditionals','Logic','AND/OR'], xp:65, emoji:'🔀', character:'logic',
    difficulty:2, estimatedMinutes:45, unit:10, unitName:'Problem Solving with Code',
    vocabulary:[{word:'AND',def:'Both conditions must be true'},{word:'OR',def:'At least one condition is true'},{word:'Nested',def:'Conditions inside conditions'}],
    storyLine:'Make smarter decisions! Use AND, OR, and nested conditions.',
    conceptName:'Complex Conditions', conceptExplain:'Combine conditions with AND/OR for complex logic.',
    activities:['AND/OR experiments','Nested condition challenges'],
    challenge:'Create a program using AND, OR, and nested conditions!',
    reflection:'When would you use AND vs OR?',
    quiz:[q('AND means:',['One is true','Both must be true','Neither is true','Always false'],1),q('OR means:',['Both must be true','At least one is true','Neither is true','Always false'],1)],
    badge:null,
    companionActivity: {
      name: "AND/OR Human Gates",
      format: "Physical Game",
      time: "12 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital AND/OR experiments",
      materials: ["AND gate sign", "OR gate sign", "Condition cards (e.g. 'wearing blue', 'has glasses')"],
      learningConnection: "Children physically pass through AND/OR gates, experiencing boolean logic before coding it.",
      steps: [
        "Set up two gates: one labelled AND, one labelled OR.",
        "Each gate has two condition cards (e.g. 'wearing blue' AND 'has glasses').",
        "Children line up and try to pass through. For AND, both must be true. For OR, one is enough.",
        "Change conditions and repeat.",
        "Discuss: 'When did more people pass through? Why?'"
      ],
      mascotTieIn: "Logic guards the gates and explains the rules.",
      differentiation: { support: "Use only one gate at a time.", extension: "Add NOT condition: 'NOT wearing blue AND has glasses.'" }
    } },

  { id:'l57', title:'Game Physics: Gravity and Jumping', mission:'Add physics to games', csTopics:['Physics','Gravity','Jumping'], xp:70, emoji:'🎮', character:'logic',
    difficulty:2, estimatedMinutes:45, unit:10, unitName:'Problem Solving with Code',
    vocabulary:[{word:'Gravity',def:'Force pulling things down'},{word:'Velocity',def:'Speed in a direction'},{word:'Collision',def:'When things touch'}],
    storyLine:'Make games feel real! Add gravity and jumping physics.',
    conceptName:'Game Physics', conceptExplain:'Use variables to simulate gravity and movement.',
    activities:['Add gravity to a character','Implement jumping','Collision detection'],
    challenge:'Create a character that jumps and falls realistically!',
    reflection:'What makes game physics feel right?',
    quiz:[q('Gravity in games uses:',['No code','Variables changing each frame','Only sprites','Sound'],1)],
    badge:null,
    companionActivity: {
      name: "Human Physics Experiment",
      format: "Movement / Discussion",
      time: "10 minutes",
      groupSize: "Whole class",
      placement: "Hook, before digital physics coding",
      materials: ["Soft ball", "Open space"],
      learningConnection: "Children observe real gravity and jumping, then discuss how to code it.",
      steps: [
        "Teacher throws a ball up. Class observes: 'What happens? (Goes up, slows, stops, falls down, speeds up).'",
        "Children jump. Observe: 'What changes? (Push up, slow, land).'",
        "Discuss: 'If we were coding this, what would the variables be?' (y-position, velocity).",
        "Draw a simple graph on the board: velocity over time during a jump.",
        "Transfer: 'Now let's code this physics!'"
      ],
      mascotTieIn: "Logic says: 'Physics is just maths — and maths is code!'",
      differentiation: { support: "Focus only on up/down movement.", extension: "Discuss horizontal movement and air resistance." }
    } },

  { id:'l58', title:'Advanced Game Project: Part 1', mission:'Build a platform game', csTopics:['Game Development','Design','Planning'], xp:65, emoji:'🎯', character:'logic',
    difficulty:3, estimatedMinutes:45, unit:10, unitName:'Problem Solving with Code',
    vocabulary:[{word:'Platform Game',def:'Game with jumping between platforms'}],
    storyLine:'Build ByteBuddies Quest! A platform game with enemies and collectibles.',
    conceptName:'Platform Game', conceptExplain:'Platform games combine movement, physics, and challenges.',
    activities:['Design game levels','Code player movement','Add physics'],
    challenge:'Complete player movement with gravity and jumping!',
    reflection:'What makes your game fun?',
    quiz:[q('Platform games have:',['No jumping','Jumping between platforms','Only running','No movement'],1)],
    badge:null,
    companionActivity: {
      name: "Level Design on Paper",
      format: "Creative / Planning",
      time: "15 minutes",
      groupSize: "Individual",
      placement: "Before digital level creation",
      materials: ["Graph paper", "Coloured pencils"],
      learningConnection: "Children design levels on paper before coding, planning challenges and flow.",
      steps: [
        "Each child receives graph paper representing the game stage.",
        "Draw platforms, enemies, collectibles, start point, and goal.",
        "Mark where challenges are (e.g. 'difficult jump here').",
        "Swap with a partner; partner traces the level with their finger — does it work?",
        "Revise based on feedback, then build digitally."
      ],
      mascotTieIn: "Logic reviews designs and suggests: 'Where's the fun? Where's the challenge?'",
      differentiation: { support: "Provide template with start/goal already marked.", extension: "Design 2 levels with increasing difficulty." }
    } },

  { id:'l59', title:'Advanced Game Project: Part 2 — Complete', mission:'Finish your platform game', csTopics:['Game Development','Polish','Testing'], xp:105, emoji:'🏆', character:'logic',
    difficulty:3, estimatedMinutes:45, unit:10, unitName:'Problem Solving with Code',
    vocabulary:[{word:'Polish',def:'Making things look and feel great'}],
    storyLine:'Finish your game! Add enemies, collectibles, multiple levels, and game over.',
    conceptName:'Game Completion', conceptExplain:'A complete game has polish, challenge, and fun.',
    activities:['Add enemies','Add collectibles and scoring','Create 2 levels','Add game over screen'],
    challenge:'Complete ByteBuddies Quest with enemies, scoring, 2 levels, and game over!',
    reflection:'What was the hardest bug to fix?',
    quiz:[q('A complete game has:',['No challenge','Movement, scoring, challenge, game over','Only movement','No levels'],1)],
    badge:'🦁',
    companionActivity: {
      name: "Playtesting Session",
      format: "Testing / Discussion",
      time: "15 minutes",
      groupSize: "Pairs",
      placement: "During/after digital game completion",
      materials: ["Feedback forms (simple: 3 stars, 1 wish)"],
      learningConnection: "Children playtest each other's games, providing feedback to improve quality.",
      steps: [
        "Pairs swap games and play for 2-3 minutes.",
        "Write: 3 things they liked (stars), 1 thing to improve (wish).",
        "Share feedback verbally.",
        "Return to own game and make one improvement based on feedback.",
        "Optional: second playtest round."
      ],
      mascotTieIn: "Logic says: 'Real game developers playtest — bugs hide until players find them!'",
      differentiation: { support: "Provide feedback sentence starters.", extension: "Testers must find and report at least one bug." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 11: My Digital World (Lessons 60-65)
  // Theme: Integration and Reflection | Mascot: All ByteBuddies 🌟
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l60', title:'Digital Citizenship Portfolio: Part 1', mission:'Reflect on your learning', csTopics:['Portfolio','Reflection','Skills'], xp:55, emoji:'📁', character:'professorByte',
    difficulty:1, estimatedMinutes:45, unit:11, unitName:'My Digital World',
    vocabulary:[{word:'Portfolio',def:'Collection of your best work'},{word:'Reflection',def:'Thinking about what you learned'}],
    storyLine:'Look back at your year! Create a portfolio of your best work.',
    conceptName:'Digital Portfolio', conceptExplain:'A portfolio shows your learning journey.',
    activities:['Choose best work from each unit','Write reflections'],
    challenge:'Select your best work from 6 different units!',
    reflection:'What are you most proud of this year?',
    quiz:[q('A portfolio shows:',['Only failures','Your best work','Nothing','Random items'],1)],
    badge:null,
    companionActivity: {
      name: "Memory Lane Walk",
      format: "Discussion / Reflection",
      time: "12 minutes",
      groupSize: "Pairs",
      placement: "Hook, before digital portfolio selection",
      materials: ["Notebooks from the year", "Sticky notes"],
      learningConnection: "Children revisit their year's work, selecting highlights before curating digitally.",
      steps: [
        "Pairs flip through their notebooks/folders from the year.",
        "Place a sticky note on 3 pieces of work they're proud of.",
        "Share with partner: 'Why did I choose this?'",
        "Discuss: 'How has my work changed since the start of the year?'",
        "Use these insights to select digital portfolio pieces."
      ],
      mascotTieIn: "Professor Byte reminds them: 'Your portfolio tells YOUR story!'",
      differentiation: { support: "Provide prompts: 'Find one from Term 1, one from Term 2...'.", extension: "Add a 'before and after' comparison for growth." }
    } },

  { id:'l61', title:'Digital Citizenship Portfolio: Part 2', mission:'Complete your portfolio', csTopics:['Presentation','Organization','Growth'], xp:60, emoji:'📊', character:'professorByte',
    difficulty:1, estimatedMinutes:45, unit:11, unitName:'My Digital World',
    vocabulary:[{word:'Growth',def:'How you improved over time'}],
    storyLine:'Finish your portfolio! Show your growth as a digital citizen.',
    conceptName:'Showing Growth', conceptExplain:'Your portfolio shows how much you\'ve learned.',
    activities:['Organize portfolio','Add About Me section','Write what you want to learn next'],
    challenge:'Complete your portfolio with reflections on growth!',
    reflection:'How have you changed as a learner?',
    quiz:[q('A good portfolio:',['Has no reflection','Shows growth and learning','Is empty','Has only one item'],1)],
    badge:null,
    companionActivity: {
      name: "Future Me Letter",
      format: "Creative / Reflection",
      time: "10 minutes",
      groupSize: "Individual",
      placement: "After digital portfolio completion",
      materials: ["Envelopes", "Paper"],
      learningConnection: "Children write to their future selves, reflecting on learning goals.",
      steps: [
        "Write a letter to 'Future Me' (to be opened next year).",
        "Include: What you learned this year, what you're proud of, what you want to learn next.",
        "Seal in an envelope with name and date.",
        "Teacher collects and stores for next year's teacher to return.",
        "Share one learning goal with the class."
      ],
      mascotTieIn: "Professor Byte says: 'Your learning journey continues!'",
      differentiation: { support: "Provide letter template with sentence starters.", extension: "Include predictions about technology in one year." }
    } },

  { id:'l62', title:'Careers in Computing', mission:'Explore tech careers', csTopics:['Careers','Future','Skills'], xp:55, emoji:'👩‍💻', character:'professorByte',
    difficulty:1, estimatedMinutes:45, unit:11, unitName:'My Digital World',
    vocabulary:[{word:'Career',def:'A job you do over time'},{word:'Skills',def:'Things you can do well'}],
    storyLine:'What could you be? Explore exciting careers in technology!',
    conceptName:'Tech Careers', conceptExplain:'Computing skills open many career paths.',
    activities:['Career cards matching','My Future ByteBuddy design'],
    challenge:'Research 3 careers and design your future tech career!',
    reflection:'Which career interests you most?',
    quiz:[q('Computing skills are used by:',['Only programmers','Many different careers','No one','Only adults'],1)],
    badge:null,
    companionActivity: {
      name: "Career Speed Dating",
      format: "Discussion / Role-Play",
      time: "15 minutes",
      groupSize: "Pairs rotating",
      placement: "After digital career matching",
      materials: ["Career role cards"],
      learningConnection: "Children take on career roles and interview each other, deepening understanding.",
      steps: [
        "Half the class receives career cards (Game Designer, Data Scientist, etc.).",
        "Other half are 'journalists' who interview the careers.",
        "2 minutes per interview: 'What do you do? What skills do you need?'",
        "Rotate 3-4 times, then swap roles.",
        "Class shares most interesting discoveries."
      ],
      mascotTieIn: "Professor Byte introduces each career as 'ByteBuddy's cousin in the real world!'",
      differentiation: { support: "Provide interview question prompts.", extension: "Interviewees invent a day-in-the-life story." }
    } },

  { id:'l63', title:'The Future of Computing', mission:'Imagine tomorrow\'s technology', csTopics:['AI','Robots','Future'], xp:60, emoji:'🔮', character:'professorByte',
    difficulty:1, estimatedMinutes:45, unit:11, unitName:'My Digital World',
    vocabulary:[{word:'AI',def:'Artificial Intelligence — computers that can learn'},{word:'Robotics',def:'Building and programming robots'}],
    storyLine:'What will the future look like? Explore AI, robots, and what comes next.',
    conceptName:'Future Technology', conceptExplain:'Technology keeps changing. You can shape the future!',
    activities:['Future technology predictions','AI discussion','Debate: Should robots do human jobs?'],
    challenge:'Present your vision of technology in 2050!',
    reflection:'How might technology change your life?',
    quiz:[q('AI means:',['Always Inside','Artificial Intelligence','After Internet','Another Input'],1)],
    badge:null,
    companionActivity: {
      name: "Future Tech Invention",
      format: "Creative / Presentation",
      time: "15 minutes",
      groupSize: "Groups of 3-4",
      placement: "After digital predictions activity",
      materials: ["A4 paper", "Colouring pencils"],
      learningConnection: "Children invent and present future technology, imagining possibilities.",
      steps: [
        "Groups invent a technology that doesn't exist yet.",
        "Draw and label the invention; name it.",
        "Prepare a 1-minute 'pitch': What does it do? Who uses it? How does it help?",
        "Present to the class.",
        "Class votes: Most Helpful, Most Creative, Most Likely to Exist."
      ],
      mascotTieIn: "Professor Byte reveals: 'Some of YOUR ideas might become real!'",
      differentiation: { support: "Provide invention category prompts (health, transport, education).", extension: "Groups must also explain potential risks of their invention." }
    } },

  { id:'l64', title:'Guest Speakers and Q&A', mission:'Learn from tech professionals', csTopics:['Careers','Questions','Real World'], xp:50, emoji:'🎤', character:'professorByte',
    difficulty:1, estimatedMinutes:45, unit:11, unitName:'My Digital World',
    vocabulary:[{word:'Professional',def:'Someone who works in a field'}],
    storyLine:'Meet real tech professionals! Ask questions and learn from experts.',
    conceptName:'Real World Computing', conceptExplain:'Professionals use computing skills every day.',
    activities:['Prepare questions','Listen to speakers','Q&A session'],
    challenge:'Ask at least 2 thoughtful questions!',
    reflection:'What surprised you about their careers?',
    quiz:[q('Asking questions helps:',['Waste time','You learn more','Nothing','Annoy people'],1)],
    badge:null,
    companionActivity: {
      name: "Question Preparation Workshop",
      format: "Discussion / Writing",
      time: "10 minutes",
      groupSize: "Pairs",
      placement: "Before guest speaker arrives",
      materials: ["Question cards", "Pencils"],
      learningConnection: "Children prepare thoughtful questions, practising professional communication.",
      steps: [
        "Pairs brainstorm 3 questions they'd like to ask a tech professional.",
        "Sort questions: Is it yes/no or open-ended? (Open-ended is better!)",
        "Rewrite closed questions as open questions.",
        "Each pair selects their best question to potentially ask.",
        "Practice asking with good volume and eye contact."
      ],
      mascotTieIn: "Professor Byte models: 'Great questions start with HOW or WHY!'",
      differentiation: { support: "Provide question starters.", extension: "Children predict the answer before asking." }
    } },

  { id:'l65', title:'Unit 11 Wrap-Up', mission:'Prepare for the showcase', csTopics:['Preparation','Goals','Planning'], xp:55, emoji:'📋', character:'professorByte',
    difficulty:1, estimatedMinutes:45, unit:11, unitName:'My Digital World',
    vocabulary:[{word:'Showcase',def:'Presenting your best work'}],
    storyLine:'Get ready for the big finale! Choose and prepare your showcase project.',
    conceptName:'Showcase Preparation', conceptExplain:'Choose your best project and prepare to present it.',
    activities:['Choose showcase project','Plan presentation','Practice explaining'],
    challenge:'Finalize your showcase project choice and create a plan!',
    reflection:'Why did you choose this project?',
    quiz:[q('Good preparation:',['Is unnecessary','Helps you present better','Wastes time','Is boring'],1)],
    badge:'🌟',
    companionActivity: {
      name: "Showcase Pitch Practice",
      format: "Presentation / Discussion",
      time: "12 minutes",
      groupSize: "Groups of 3",
      placement: "After project selection",
      materials: ["None"],
      learningConnection: "Children practice explaining their project choice in 30 seconds, building confidence.",
      steps: [
        "Each child prepares a 30-second 'elevator pitch' for their chosen project.",
        "In groups of 3, take turns presenting: 'I chose this project because... It shows...'.",
        "Group gives 1 thing they liked and 1 question.",
        "Revise pitch based on feedback.",
        "Optional: 3-4 volunteers share with the whole class."
      ],
      mascotTieIn: "Professor Byte times the pitches: '30 seconds — ready, set, pitch!'",
      differentiation: { support: "Provide pitch template.", extension: "Add a 'hook' to grab attention in the first 5 seconds." }
    } },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 12: ByteBuddies Showcase! (Lessons 66-71)
  // Theme: End-of-Year Celebration | Mascot: All ByteBuddies 🏆
  // ═══════════════════════════════════════════════════════════════════════════

  { id:'l66', title:'Showcase Project: Development Day 1', mission:'Build your showcase project', csTopics:['Project','Development','Skills'], xp:65, emoji:'🔨', character:'professorByte',
    difficulty:2, estimatedMinutes:45, unit:12, unitName:'ByteBuddies Showcase',
    vocabulary:[{word:'Development',def:'Building your project'}],
    storyLine:'Build your greatest creation! Day 1 of showcase project development.',
    conceptName:'Project Development', conceptExplain:'Use all your skills to create something amazing.',
    activities:['Work on chosen project','Get teacher feedback'],
    challenge:'Make significant progress on your showcase project!',
    reflection:'What skills are you using?',
    quiz:[q('Development means:',['Deleting','Building your project','Watching','Copying'],1)],
    badge:null,
    companionActivity: {
      name: "Skills Checklist",
      format: "Reflection / Planning",
      time: "10 minutes",
      groupSize: "Individual",
      placement: "Start of development session",
      materials: ["Skills checklist sheets"],
      learningConnection: "Children identify which skills they'll use, reinforcing year-long learning.",
      steps: [
        "Review a checklist of skills from the year (loops, conditionals, decomposition, etc.).",
        "Tick which skills their project will use.",
        "Set 3 mini-goals for today's session.",
        "At the end, review: 'Did I meet my goals? What do I need tomorrow?'",
        "Share one goal with a partner."
      ],
      mascotTieIn: "All ByteBuddies appear on the checklist, each representing a skill.",
      differentiation: { support: "Highlight 5 key skills to focus on.", extension: "Add 'challenge skills' they want to try for the first time." }
    } },

  { id:'l67', title:'Showcase Project: Development Day 2', mission:'Continue building', csTopics:['Project','Iteration','Improvement'], xp:65, emoji:'🔨', character:'professorByte',
    difficulty:2, estimatedMinutes:45, unit:12, unitName:'ByteBuddies Showcase',
    vocabulary:[{word:'Iterate',def:'Improve through repeated tries'}],
    storyLine:'Keep building! Improve and polish your showcase project.',
    conceptName:'Iteration', conceptExplain:'Good projects improve through multiple iterations.',
    activities:['Continue development','Peer feedback session','Improve based on feedback'],
    challenge:'Complete the main features of your project!',
    reflection:'How did feedback help you improve?',
    quiz:[q('Iteration means:',['Doing once','Improving through tries','Giving up','Copying'],1)],
    badge:null,
    companionActivity: {
      name: "Pair Feedback Swap",
      format: "Testing / Discussion",
      time: "12 minutes",
      groupSize: "Pairs",
      placement: "Mid-session break",
      materials: ["Feedback forms (2 stars, 1 wish)"],
      learningConnection: "Children give and receive constructive feedback, improving through iteration.",
      steps: [
        "Pairs swap projects and explore for 2 minutes.",
        "Write: 2 stars (things they like), 1 wish (suggestion for improvement).",
        "Share feedback verbally.",
        "Return to own project; make one improvement based on feedback.",
        "Thank partner for helpful feedback."
      ],
      mascotTieIn: "Professor Byte models: 'Feedback is a gift!'",
      differentiation: { support: "Provide feedback sentence starters.", extension: "Tester must also find one potential bug." }
    } },

  { id:'l68', title:'Showcase Project: Development Day 3', mission:'Finalize your project', csTopics:['Polish','Testing','Completion'], xp:70, emoji:'✨', character:'professorByte',
    difficulty:2, estimatedMinutes:45, unit:12, unitName:'ByteBuddies Showcase',
    vocabulary:[{word:'Finalize',def:'Complete and polish your work'}],
    storyLine:'Final touches! Complete and test your showcase project.',
    conceptName:'Finalization', conceptExplain:'Polish and test to make sure everything works.',
    activities:['Final development','Bug testing','Polish and finish'],
    challenge:'Complete your project with no major bugs!',
    reflection:'What was the hardest part?',
    quiz:[q('Testing helps find:',['Nothing','Bugs before presenting','More features','Colours'],1)],
    badge:null,
    companionActivity: {
      name: "Bug Bash Testing",
      format: "Testing / Game",
      time: "15 minutes",
      groupSize: "Pairs rotating",
      placement: "End of development, before polish",
      materials: ["Bug report slips"],
      learningConnection: "Children systematically test each other's projects, finding bugs before the showcase.",
      steps: [
        "Pairs swap projects and try to 'break' them (find bugs).",
        "Write each bug on a slip: 'When I do X, Y happens (should do Z).'",
        "Return projects with bug slips.",
        "Fix bugs in priority order (worst first).",
        "Celebrate: 'I squashed X bugs today!'"
      ],
      mascotTieIn: "All ByteBuddies are 'Bug Hunters' today!",
      differentiation: { support: "Focus on 'does it start and end correctly?'", extension: "Testers write edge case tests (e.g. 'what if I click 100 times?')." }
    } },

  { id:'l69', title:'Rehearsal and Presentation Prep', mission:'Practice presenting', csTopics:['Presentation','Practice','Communication'], xp:55, emoji:'🎭', character:'professorByte',
    difficulty:1, estimatedMinutes:45, unit:12, unitName:'ByteBuddies Showcase',
    vocabulary:[{word:'Rehearse',def:'Practice before the real thing'},{word:'Presentation',def:'Showing and explaining your work'}],
    storyLine:'Practice makes perfect! Rehearse your showcase presentation.',
    conceptName:'Presentation Skills', conceptExplain:'Good presentations are practiced and planned.',
    activities:['Write 2-minute explanation','Practice demonstration','Rehearse with partner'],
    challenge:'Practice your presentation 3 times!',
    reflection:'What part of presenting is hardest?',
    quiz:[q('Rehearsing helps:',['Waste time','You present better','Nothing','Make bugs'],1)],
    badge:null,
    companionActivity: {
      name: "Presentation Stations",
      format: "Practice / Movement",
      time: "15 minutes",
      groupSize: "Groups rotating",
      placement: "Full rehearsal session",
      materials: ["Timer", "Feedback cards"],
      learningConnection: "Children rehearse presentations in small groups, building confidence through repetition.",
      steps: [
        "Set up 4-5 stations around the room; each group presents at their station.",
        "Groups rotate every 3 minutes; each child presents to a new audience.",
        "After each presentation, listeners give a thumbs up and one tip.",
        "By the end, each child has presented 3-4 times.",
        "Debrief: 'Did it get easier? What improved?'"
      ],
      mascotTieIn: "Professor Byte cheers: 'Practice makes progress!'",
      differentiation: { support: "Allow notes/cue cards.", extension: "Add a Q&A question at each station." }
    } },

  { id:'l70', title:'The Grand ByteBuddies Showcase: Day 1', mission:'Present to visitors', csTopics:['Presentation','Exhibition','Sharing'], xp:85, emoji:'🎉', character:'professorByte',
    difficulty:2, estimatedMinutes:45, unit:12, unitName:'ByteBuddies Showcase',
    vocabulary:[{word:'Exhibition',def:'A public display of work'}],
    storyLine:'The showcase is here! Present your work to visitors and peers.',
    conceptName:'Exhibition', conceptExplain:'Share your work and explain what you learned.',
    activities:['Set up exhibition stand','Present to visitors','Explain your project'],
    companionActivity: {
      name: "Exhibition Set-Up",
      format: "Preparation",
      time: "15 minutes",
      groupSize: "Individual",
      placement: "Start of showcase day",
      materials: ["Name cards", "Project signs"],
      learningConnection: "Children prepare their exhibition space, creating a professional presentation environment.",
      steps: [
        "Each child sets up their 'stand': screen/device, name card, project title.",
        "Optional: add a physical element (drawing, poster, prop).",
        "Practice their opening line: 'Hi, I'm X and I made Y.'",
        "Do a 'dress rehearsal' with a partner.",
        "Doors open — welcome visitors!"
      ],
      mascotTieIn: "All ByteBuddies are 'on display' around the room.",
      differentiation: { support: "Pair shy presenters with a supportive buddy.", extension: "Presenters add a 'fun fact' about their project." }
    },
    challenge:'Successfully present to at least 5 visitors!',
    reflection:'What questions did visitors ask?',
    quiz:[q('An exhibition is:',['Hidden work','Public display of work','A test','A lecture'],1)],
    badge:null },

  { id:'l71', title:'The Grand ByteBuddies Showcase: Day 2 — Celebration!', mission:'Celebrate and reflect', csTopics:['Celebration','Reflection','Achievement'], xp:100, emoji:'🏆', character:'professorByte',
    difficulty:1, estimatedMinutes:45, unit:12, unitName:'ByteBuddies Showcase',
    vocabulary:[{word:'Achievement',def:'Something you accomplished'},{word:'Graduate',def:'Complete a course of study'}],
    storyLine:'Congratulations ByteBuddies Graduate! Celebrate your amazing year of learning.',
    conceptName:'Achievement', conceptExplain:'You\'ve learned algorithms, coding, data, safety, creativity, and more!',
    activities:['Peer awards voting','Certificate ceremony','Year reflection'],
    challenge:'Receive your ByteBuddies Year 3 Graduate Certificate!',
    reflection:'What was your favorite part of the year? What will you learn next?',
    quiz:[q('You learned:',['Nothing','Algorithms, coding, data, safety, creativity, and more!','Only one thing','Just games'],1),q('A ByteBuddy Graduate:',['Stops learning','Keeps creating and learning','Forgets everything','Only plays'],1)],
    badge:'🏆',
    companionActivity: {
      name: "ByteBuddies Graduation Ceremony",
      format: "Celebration / Ceremony",
      time: "20 minutes",
      groupSize: "Whole class",
      placement: "End of year celebration",
      materials: ["Certificates", "Stickers", "Optional: music"],
      learningConnection: "A formal celebration marks the end of the year, honouring achievement and growth.",
      steps: [
        "Set up ceremony space: chairs in rows, 'stage' at front.",
        "Peer awards voting: 'Most Creative,' 'Best Debugger,' 'Kindest Helper,' etc.",
        "Each child walks across the 'stage' to receive their certificate.",
        "Class applauds each graduate.",
        "Final group photo with all ByteBuddies mascots on screen.",
        "Optional: celebratory music and treats!"
      ],
      mascotTieIn: "All ByteBuddies appear on screen to congratulate the graduates!",
      differentiation: { support: "Ensure every child receives meaningful recognition.", extension: "Graduates give a 10-second 'thank you' speech." }
    } },
];

// ═══════════════════════════════════════════════════════════════════════════
// TERMS METADATA - 6 Terms with 12 Lessons each
// ═══════════════════════════════════════════════════════════════════════════

export const Y3_TERMS = [
  { term: 1, name: 'Digital Literacy & Algorithms', focus: 'Units 1-2: Computer basics and computational thinking', color: '#10b981', range: [0, 11] },
  { term: 2, name: 'Programming with Block Code', focus: 'Units 3-4: Block coding and digital storytelling', color: '#3b82f6', range: [12, 23] },
  { term: 3, name: 'Data & Information', focus: 'Units 5-6: Data handling and computer systems', color: '#8b5cf6', range: [24, 35] },
  { term: 4, name: 'Networks & Online Safety', focus: 'Units 7-8: Internet safety and networks', color: '#ef4444', range: [36, 47] },
  { term: 5, name: 'Creative Computing', focus: 'Units 9-10: Digital art, music, and advanced coding', color: '#f59e0b', range: [48, 59] },
  { term: 6, name: 'Capstone Projects & Showcase', focus: 'Units 11-12: Portfolios and final showcase', color: '#ec4899', range: [60, 71] },
];

// Achievement Badges
export const Y3_BADGES = {
  unit1: { id: 'algorithm-explorer', name: 'Algorithm Explorer', emoji: '🤖', requirement: 'Complete Unit 1' },
  unit2: { id: 'computational-thinker', name: 'Computational Thinker', emoji: '🐱', requirement: 'Complete Unit 2' },
  unit3: { id: 'game-maker', name: 'Game Maker', emoji: '⚡', requirement: 'Complete Unit 3' },
  unit4: { id: 'digital-storyteller', name: 'Digital Storyteller', emoji: '⭐', requirement: 'Complete Unit 4' },
  unit5: { id: 'data-detective', name: 'Data Detective', emoji: '🦕', requirement: 'Complete Unit 5' },
  unit6: { id: 'computer-scientist', name: 'Computer Scientist', emoji: '💾', requirement: 'Complete Unit 6' },
  unit7: { id: 'online-safety-champion', name: 'Online Safety Champion', emoji: '🛡️', requirement: 'Complete Unit 7' },
  unit8: { id: 'network-navigator', name: 'Network Navigator', emoji: '🌐', requirement: 'Complete Unit 8' },
  unit9: { id: 'digital-creator', name: 'Digital Creator', emoji: '🎨', requirement: 'Complete Unit 9' },
  unit10: { id: 'logic-master', name: 'Logic Master', emoji: '🦁', requirement: 'Complete Unit 10' },
  unit11: { id: 'digital-citizen', name: 'Digital Citizen', emoji: '🌟', requirement: 'Complete Unit 11' },
  unit12: { id: 'bytebuddy-graduate', name: 'ByteBuddy Graduate', emoji: '🏆', requirement: 'Complete Year 3' },
};
