/**
 * Lesson-Specific Interactive Challenges for ByteBuddies
 * 100+ unique, diverse challenges tied to specific lessons
 * NOT generic — each challenge is unique to its lesson topic
 */

// ============================================================================
// YEAR 3 CHALLENGES - Visual, Simple, Block-Focused
// ============================================================================

export const YEAR3_CHALLENGES = {
  'y3-block-coding': {
    'lesson-0': {
      type: 'block_explorer',
      title: 'Discover Block Powers',
      description: 'Click on each block to discover what it does. Match the block to its effect.',
      blocks: [
        { name: 'Move', effect: '→ sprite slides right', color: '#3b82f6' },
        { name: 'Turn', effect: '↻ sprite spins', color: '#3b82f6' },
        { name: 'Wait', effect: '⏸ sprite pauses', color: '#f59e0b' },
        { name: 'Say', effect: '💬 sprite talks', color: '#8b5cf6' },
      ],
      xp: 50,
    },
    'lesson-1': {
      type: 'sequence_puzzle',
      title: 'Make a Sprite Dance',
      description: 'Arrange blocks to make your sprite dance. Watch each step happen!',
      sequence: ['Turn 90°', 'Move forward', 'Turn 90°', 'Move forward', 'Turn 90°', 'Move forward'],
      pattern: 'square',
      xp: 75,
    },
    'lesson-2': {
      type: 'visual_pattern',
      title: 'Repeat to Create Patterns',
      description: 'Use the repeat block to create spirals. More repeats = tighter spiral.',
      targetPattern: 'spiral',
      hint: 'Repeat 5 times: Move 20, Turn 10°',
      xp: 75,
    },
    'lesson-3': {
      type: 'conversation_builder',
      title: 'Sprite Chat Scenario',
      description: 'Two sprites greet each other. Write the dialogue!',
      sprites: ['Cat', 'Dog'],
      lines: 3,
      xp: 100,
    },
    'lesson-4': {
      type: 'color_match',
      title: 'Match Sprite Colors',
      description: 'Change sprite colors to match the targets shown.',
      targets: [
        { sprite: 'Bear', color: '#ef4444', name: 'Red' },
        { sprite: 'Fox', color: '#f59e0b', name: 'Orange' },
        { sprite: 'Parrot', color: '#22c55e', name: 'Green' },
      ],
      xp: 50,
    },
  },

  'y3-pixel-art': {
    'lesson-0': {
      type: 'pixel_canvas',
      title: 'Draw Your First Pixel Art',
      description: 'Color squares on a 8×8 grid to create a simple design.',
      grid: 8,
      targetImage: 'heart',
      xp: 75,
    },
    'lesson-1': {
      type: 'pattern_builder',
      title: 'Create Repeating Patterns',
      description: 'Design a pattern that repeats across the canvas.',
      gridWidth: 16,
      gridHeight: 8,
      repeatUnit: 4,
      xp: 100,
    },
    'lesson-2': {
      type: 'sprite_design',
      title: 'Design a Game Character',
      description: 'Create a character for your game! 16×16 pixels.',
      grid: 16,
      theme: 'character',
      xp: 125,
    },
  },

  'y3-storytelling': {
    'lesson-0': {
      type: 'scene_builder',
      title: 'Create a Story Scene',
      description: 'Place characters and objects to set up your story.',
      scenes: 3,
      elements: ['characters', 'objects', 'backgrounds'],
      xp: 100,
    },
    'lesson-1': {
      type: 'dialogue_writer',
      title: 'Write Character Dialogue',
      description: 'Give characters personality through dialogue.',
      characters: 3,
      dialogueLines: 2,
      xp: 75,
    },
    'lesson-2': {
      type: 'story_sequencer',
      title: 'Arrange Story Events',
      description: 'Put events in the correct order to tell the story.',
      events: ['Introduction', 'Problem', 'Solution', 'Ending'],
      xp: 100,
    },
  },

  'y3-music': {
    'lesson-0': {
      type: 'note_sequencer',
      title: 'Compose a Simple Tune',
      description: 'Place notes on a 4-beat staff to create a melody.',
      beats: 8,
      notes: ['C', 'D', 'E', 'F', 'G'],
      xp: 75,
    },
    'lesson-1': {
      type: 'rhythm_pattern',
      title: 'Create a Rhythm',
      description: 'Use blocks to play a rhythm pattern.',
      beats: 8,
      sounds: ['drum', 'bell', 'chime'],
      xp: 75,
    },
    'lesson-2': {
      type: 'music_game',
      title: 'Play Notes in Order',
      description: 'Click buttons to play notes in the correct sequence.',
      sequence: 5,
      difficulty: 'beginner',
      xp: 100,
    },
  },

  'y3-math': {
    'lesson-0': {
      type: 'counting_game',
      title: 'Count the Objects',
      description: 'Count objects on screen and select the correct number.',
      items: 12,
      range: [1, 20],
      xp: 50,
    },
    'lesson-1': {
      type: 'shape_sorter',
      title: 'Sort Shapes by Type',
      description: 'Drag shapes to the correct category.',
      shapes: ['circle', 'square', 'triangle'],
      perShape: 3,
      xp: 75,
    },
    'lesson-2': {
      type: 'number_sequence',
      title: 'Complete Number Sequences',
      description: 'Fill in the missing numbers in a sequence.',
      sequences: 3,
      range: [1, 30],
      xp: 75,
    },
  },

  'y3-animals': {
    'lesson-0': {
      type: 'animal_facts',
      title: 'Learn Animal Facts',
      description: 'Match animals to fun facts about them.',
      animals: 5,
      factsPerAnimal: 2,
      xp: 50,
    },
    'lesson-1': {
      type: 'habitat_builder',
      title: 'Build Animal Habitats',
      description: 'Place animals in their correct environments.',
      habitats: ['forest', 'desert', 'ocean', 'arctic'],
      animalsPerHabitat: 3,
      xp: 100,
    },
    'lesson-2': {
      type: 'animal_animator',
      title: 'Make Animals Move',
      description: 'Code simple animations for different animals.',
      animals: 3,
      animationType: 'walk',
      xp: 100,
    },
  },

  'y3-sports': {
    'lesson-0': {
      type: 'sport_match',
      title: 'Match Sports to Equipment',
      description: 'Drag sports to their correct equipment.',
      sports: 5,
      xp: 50,
    },
    'lesson-1': {
      type: 'game_rules',
      title: 'Learn Simple Game Rules',
      description: 'Read rules and answer questions about sports.',
      games: 2,
      questionsPerGame: 3,
      xp: 75,
    },
    'lesson-2': {
      type: 'sport_simulator',
      title: 'Simple Sport Challenge',
      description: 'Click to make your player perform actions.',
      actions: ['jump', 'kick', 'throw'],
      xp: 100,
    },
  },
};

// ============================================================================
// YEAR 4 CHALLENGES - Game Dev, More Logic, Some Coding
// ============================================================================

export const YEAR4_CHALLENGES = {
  'y4-game-dev': {
    'lesson-0': {
      type: 'game_mechanics_puzzle',
      title: 'Identify Game Mechanics',
      description: 'Watch a simple game and identify what makes it work.',
      mechanics: ['collision', 'scoring', 'timer', 'lives'],
      xp: 75,
    },
    'lesson-1': {
      type: 'sprite_collision',
      title: 'Build a Catch Game',
      description: 'Create a game where player catches falling objects.',
      objective: 'catch 10 objects',
      hazards: 3,
      xp: 150,
    },
    'lesson-2': {
      type: 'game_debug',
      title: 'Fix the Buggy Game',
      description: 'Game provided with 3 bugs. Find and fix them all.',
      bugs: [
        'Collision not working',
        'Score counting wrong',
        'Game too easy',
      ],
      xp: 150,
    },
    'lesson-3': {
      type: 'level_design',
      title: 'Design a Level',
      description: 'Place obstacles and collectibles to create a challenging level.',
      obstacles: 5,
      collectibles: 8,
      xp: 125,
    },
    'lesson-4': {
      type: 'game_balance',
      title: 'Balance Game Difficulty',
      description: 'Adjust parameters to make the game perfectly balanced.',
      parameters: ['speed', 'spawnRate', 'difficulty'],
      xp: 150,
    },
  },

  'y4-variables': {
    'lesson-0': {
      type: 'variable_hunt',
      title: 'Find Variables in Code',
      description: 'Identify variables in a provided code snippet.',
      codeSnippets: 3,
      variablesPerSnippet: 2,
      xp: 75,
    },
    'lesson-1': {
      type: 'score_tracker',
      title: 'Track a Game Score',
      description: 'Use a variable to keep track of score in a game.',
      maxScore: 100,
      xp: 125,
    },
    'lesson-2': {
      type: 'counter_puzzle',
      title: 'Build a Click Counter',
      description: 'Variable counts clicks. Display the count.',
      startValue: 0,
      incrementValue: 1,
      xp: 100,
    },
    'lesson-3': {
      type: 'timer_builder',
      title: 'Create a Timer',
      description: 'Use a variable to count down from 30 seconds.',
      startTime: 30,
      xp: 125,
    },
  },

  'y4-conditionals': {
    'lesson-0': {
      type: 'if_then_explorer',
      title: 'Understand If-Then Logic',
      description: 'Predict what happens with different if-then conditions.',
      scenarios: 4,
      xp: 75,
    },
    'lesson-1': {
      type: 'collision_detector',
      title: 'Detect Collisions',
      description: 'Use if-then to detect when sprites touch.',
      sprites: 2,
      actions: 3,
      xp: 150,
    },
    'lesson-2': {
      type: 'score_threshold',
      title: 'Win Condition',
      description: 'Code: "If score > 50, show You Win!"',
      targetScore: 50,
      xp: 125,
    },
    'lesson-3': {
      type: 'key_input',
      title: 'Keyboard Input Handler',
      description: 'If key pressed, make sprite move.',
      keys: ['up', 'down', 'left', 'right'],
      xp: 150,
    },
  },

  'y4-game-design': {
    'lesson-0': {
      type: 'game_concept',
      title: 'Design Your Game Concept',
      description: 'Write down your game idea with title, rules, goal.',
      sections: ['title', 'rules', 'goal', 'characters'],
      xp: 100,
    },
    'lesson-1': {
      type: 'character_design',
      title: 'Design Game Characters',
      description: 'Create stats and personality for 2 game characters.',
      attributes: ['health', 'speed', 'power'],
      characters: 2,
      xp: 125,
    },
    'lesson-2': {
      type: 'level_progression',
      title: 'Plan Level Progression',
      description: 'Design 3 levels with increasing difficulty.',
      levels: 3,
      attributes: ['obstacles', 'enemies', 'speed'],
      xp: 150,
    },
  },

  'y4-web': {
    'lesson-0': {
      type: 'html_structure',
      title: 'Build HTML Structure',
      description: 'Create a simple webpage with heading, image, paragraph.',
      elements: ['h1', 'img', 'p'],
      xp: 100,
    },
    'lesson-1': {
      type: 'css_styling',
      title: 'Style a Webpage',
      description: 'Use CSS to color, size, and position elements.',
      properties: ['color', 'fontSize', 'position'],
      xp: 125,
    },
    'lesson-2': {
      type: 'responsive_layout',
      title: 'Make It Responsive',
      description: 'Adjust layout to work on phone, tablet, desktop.',
      breakpoints: [320, 768, 1024],
      xp: 150,
    },
  },

  'y4-cyber': {
    'lesson-0': {
      type: 'phishing_detector',
      title: 'Spot Phishing Emails',
      description: 'Identify which emails are suspicious phishing attempts.',
      emails: 5,
      suspicious: 2,
      xp: 75,
    },
    'lesson-1': {
      type: 'password_strength',
      title: 'Create Strong Passwords',
      description: 'Rate and improve weak passwords.',
      passwords: 4,
      xp: 100,
    },
    'lesson-2': {
      type: 'privacy_settings',
      title: 'Protect Your Privacy',
      description: 'Adjust privacy settings on social media profile.',
      platforms: 2,
      settingsPerPlatform: 3,
      xp: 100,
    },
  },

  'y4-algorithms': {
    'lesson-0': {
      type: 'sorting_visualizer',
      title: 'Understand Sorting',
      description: 'Watch different sorting methods and order numbers.',
      numbers: 6,
      xp: 75,
    },
    'lesson-1': {
      type: 'search_game',
      title: 'Linear Search Game',
      description: 'Find a number in a list as fast as you can.',
      listSize: 10,
      rounds: 3,
      xp: 100,
    },
    'lesson-2': {
      type: 'pattern_finder',
      title: 'Find Hidden Patterns',
      description: 'Identify the pattern and predict the next numbers.',
      patterns: 3,
      numbersInPattern: 5,
      xp: 125,
    },
  },

  'y4-ai': {
    'lesson-0': {
      type: 'ai_prediction',
      title: 'Train a Simple Classifier',
      description: 'Teach AI to identify cats vs dogs with examples.',
      trainingExamples: 6,
      testExamples: 3,
      xp: 150,
    },
    'lesson-1': {
      type: 'chatbot_builder',
      title: 'Build a Simple Chatbot',
      description: 'Create a chatbot that responds to keywords.',
      keywords: 5,
      responses: 2,
      xp: 125,
    },
  },
};

// ============================================================================
// YEAR 5 CHALLENGES - Python, Web, Complex Logic
// ============================================================================

export const YEAR5_CHALLENGES = {
  'y5-python': {
    'lesson-0': {
      type: 'python_hello',
      title: 'Hello World Challenge',
      description: 'Write your first Python program.',
      task: 'Print "Hello, [Your Name]!"',
      xp: 100,
    },
    'lesson-1': {
      type: 'python_variables',
      title: 'Work with Variables',
      description: 'Create variables and perform operations on them.',
      operations: ['add', 'subtract', 'concatenate'],
      xp: 125,
    },
    'lesson-2': {
      type: 'python_loops',
      title: 'Loop Challenge',
      description: 'Use loops to print patterns.',
      patterns: ['pyramid', 'grid'],
      xp: 150,
    },
    'lesson-3': {
      type: 'python_function',
      title: 'Write Functions',
      description: 'Create functions to solve problems.',
      functions: 2,
      xp: 150,
    },
    'lesson-4': {
      type: 'python_list',
      title: 'Master Lists',
      description: 'Create and manipulate lists of data.',
      operations: ['append', 'sort', 'filter'],
      xp: 150,
    },
    'lesson-5': {
      type: 'python_dict',
      title: 'Use Dictionaries',
      description: 'Store and access data with key-value pairs.',
      keys: 5,
      xp: 150,
    },
  },

  'y5-web': {
    'lesson-0': {
      type: 'html_forms',
      title: 'Build HTML Forms',
      description: 'Create a form with text input, checkbox, button.',
      fields: ['name', 'email', 'subscribe'],
      xp: 150,
    },
    'lesson-1': {
      type: 'css_flexbox',
      title: 'Master CSS Flexbox',
      description: 'Use flexbox to layout elements.',
      layouts: 3,
      xp: 150,
    },
    'lesson-2': {
      type: 'javascript_interactivity',
      title: 'Add JavaScript Interactivity',
      description: 'Make buttons, forms, and dynamic content.',
      interactions: 3,
      xp: 175,
    },
    'lesson-3': {
      type: 'api_integration',
      title: 'Fetch Data from API',
      description: 'Fetch weather or joke data and display it.',
      endpoints: 1,
      xp: 175,
    },
  },

  'y5-data-structures': {
    'lesson-0': {
      type: 'array_operations',
      title: 'Master Arrays',
      description: 'Create, modify, and search arrays.',
      operations: ['push', 'pop', 'indexOf', 'map'],
      xp: 150,
    },
    'lesson-1': {
      type: 'object_operations',
      title: 'Work with Objects',
      description: 'Create and access object properties.',
      objectSize: 5,
      xp: 150,
    },
    'lesson-2': {
      type: 'nested_structures',
      title: 'Nested Data Challenge',
      description: 'Work with arrays of objects.',
      complexity: 'intermediate',
      xp: 175,
    },
  },

  'y5-algorithms': {
    'lesson-0': {
      type: 'bubble_sort',
      title: 'Implement Bubble Sort',
      description: 'Code bubble sort and visualize it.',
      arraySize: 10,
      xp: 150,
    },
    'lesson-1': {
      type: 'merge_sort',
      title: 'Implement Merge Sort',
      description: 'Code merge sort and compare efficiency.',
      arraySize: 20,
      xp: 175,
    },
    'lesson-2': {
      type: 'binary_search',
      title: 'Binary Search Challenge',
      description: 'Implement efficient binary search.',
      targetValue: 42,
      arraySize: 100,
      xp: 175,
    },
    'lesson-3': {
      type: 'recursion',
      title: 'Recursive Functions',
      description: 'Write recursive functions (factorial, fibonacci).',
      functions: 2,
      xp: 175,
    },
  },

  'y5-databases': {
    'lesson-0': {
      type: 'database_design',
      title: 'Design a Database Schema',
      description: 'Plan tables and relationships for a simple app.',
      tables: 3,
      relationships: 2,
      xp: 150,
    },
    'lesson-1': {
      type: 'sql_select',
      title: 'SQL SELECT Queries',
      description: 'Query data with WHERE, ORDER BY, LIMIT.',
      queries: 4,
      xp: 150,
    },
    'lesson-2': {
      type: 'sql_join',
      title: 'SQL JOINs',
      description: 'Combine data from multiple tables.',
      tables: 3,
      joinTypes: ['INNER', 'LEFT'],
      xp: 175,
    },
  },

  'y5-cyber': {
    'lesson-0': {
      type: 'encryption_basics',
      title: 'Learn Encryption',
      description: 'Encrypt and decrypt messages using Caesar cipher.',
      messages: 3,
      xp: 100,
    },
    'lesson-1': {
      type: 'hash_simulation',
      title: 'Understand Hashing',
      description: 'See how hashing protects passwords.',
      demonstrations: 3,
      xp: 125,
    },
    'lesson-2': {
      type: 'security_audit',
      title: 'Security Audit',
      description: 'Find vulnerabilities in sample code.',
      codeSnippets: 3,
      xp: 150,
    },
  },

  'y5-game-advanced': {
    'lesson-0': {
      type: 'physics_engine',
      title: 'Add Physics',
      description: 'Implement gravity, bounce, and friction.',
      objects: 3,
      properties: ['gravity', 'bounce', 'friction'],
      xp: 175,
    },
    'lesson-1': {
      type: 'ai_opponent',
      title: 'Create AI Opponent',
      description: 'Code an opponent with simple AI logic.',
      difficulty: 'medium',
      behaviors: 3,
      xp: 200,
    },
    'lesson-2': {
      type: 'game_optimization',
      title: 'Optimize Game Performance',
      description: 'Profile and improve frame rate.',
      bottlenecks: 3,
      xp: 175,
    },
  },

  'y5-ml': {
    'lesson-0': {
      type: 'dataset_exploration',
      title: 'Explore a Dataset',
      description: 'Load CSV data and analyze statistics.',
      dataset: 'iris',
      xp: 150,
    },
    'lesson-1': {
      type: 'model_training',
      title: 'Train a Classification Model',
      description: 'Prepare data, train, and evaluate model.',
      algorithm: 'decision_tree',
      xp: 200,
    },
    'lesson-2': {
      type: 'feature_engineering',
      title: 'Feature Engineering',
      description: 'Create and select important features.',
      features: 5,
      xp: 175,
    },
  },
};

// ============================================================================
// YEAR 6 CHALLENGES - Advanced Python, Full-Stack, Optimization
// ============================================================================

export const YEAR6_CHALLENGES = {
  'y6-python': {
    'lesson-0': {
      type: 'file_io',
      title: 'File Input/Output',
      description: 'Read from and write to files.',
      operations: ['read', 'write', 'append'],
      xp: 150,
    },
    'lesson-1': {
      type: 'exception_handling',
      title: 'Exception Handling',
      description: 'Catch and handle errors gracefully.',
      exceptionTypes: 3,
      xp: 150,
    },
    'lesson-2': {
      type: 'class_design',
      title: 'Object-Oriented Programming',
      description: 'Design and implement classes.',
      classes: 2,
      inheritance: true,
      xp: 200,
    },
    'lesson-3': {
      type: 'decorator_challenge',
      title: 'Decorators Challenge',
      description: 'Create and apply decorators.',
      decorators: 2,
      xp: 175,
    },
  },

  'y6-web-pro': {
    'lesson-0': {
      type: 'fullstack_setup',
      title: 'Full-Stack Architecture',
      description: 'Design backend API and frontend.',
      components: ['frontend', 'api', 'database'],
      xp: 200,
    },
    'lesson-1': {
      type: 'rest_api',
      title: 'Build REST API',
      description: 'Create endpoints for CRUD operations.',
      endpoints: 5,
      xp: 200,
    },
    'lesson-2': {
      type: 'react_component',
      title: 'React Components',
      description: 'Build reusable React components.',
      components: 3,
      xp: 175,
    },
    'lesson-3': {
      type: 'deployment',
      title: 'Deploy Your App',
      description: 'Deploy to Heroku or similar platform.',
      platform: 'cloud',
      xp: 200,
    },
  },

  'y6-data-structures': {
    'lesson-0': {
      type: 'linked_list',
      title: 'Implement Linked List',
      description: 'Create and operate on linked list.',
      operations: ['insert', 'delete', 'traverse'],
      xp: 175,
    },
    'lesson-1': {
      type: 'stack_queue',
      title: 'Stacks and Queues',
      description: 'Implement stack and queue data structures.',
      structures: 2,
      xp: 175,
    },
    'lesson-2': {
      type: 'binary_tree',
      title: 'Binary Trees',
      description: 'Build and traverse binary trees.',
      operations: ['insert', 'search', 'traverse'],
      xp: 200,
    },
    'lesson-3': {
      type: 'graph_algorithms',
      title: 'Graph Algorithms',
      description: 'Implement BFS and DFS.',
      algorithms: 2,
      nodes: 8,
      xp: 200,
    },
  },

  'y6-algorithms': {
    'lesson-0': {
      type: 'quicksort',
      title: 'Quicksort Implementation',
      description: 'Implement quicksort and analyze complexity.',
      arraySize: 50,
      xp: 175,
    },
    'lesson-1': {
      type: 'dijkstra',
      title: 'Dijkstra\'s Algorithm',
      description: 'Find shortest path in weighted graph.',
      nodes: 10,
      xp: 200,
    },
    'lesson-2': {
      type: 'dynamic_programming',
      title: 'Dynamic Programming',
      description: 'Solve classic problems with DP.',
      problems: 2,
      xp: 200,
    },
    'lesson-3': {
      type: 'backtracking',
      title: 'Backtracking Algorithms',
      description: 'Solve N-Queens and Sudoku.',
      problems: 2,
      xp: 200,
    },
  },

  'y6-databases': {
    'lesson-0': {
      type: 'normalization',
      title: 'Database Normalization',
      description: 'Normalize database schema.',
      normalForms: 3,
      xp: 175,
    },
    'lesson-1': {
      type: 'transaction_management',
      title: 'Transactions & ACID',
      description: 'Implement atomic, consistent transactions.',
      scenarios: 3,
      xp: 175,
    },
    'lesson-2': {
      type: 'query_optimization',
      title: 'Query Optimization',
      description: 'Optimize slow SQL queries.',
      queries: 3,
      xp: 175,
    },
    'lesson-3': {
      type: 'mongo_challenge',
      title: 'NoSQL with MongoDB',
      description: 'Work with document database.',
      operations: ['insert', 'find', 'update'],
      xp: 175,
    },
  },

  'y6-cyber-pro': {
    'lesson-0': {
      type: 'penetration_testing',
      title: 'Penetration Testing Basics',
      description: 'Find vulnerabilities in sample app.',
      vulnerabilities: 3,
      xp: 200,
    },
    'lesson-1': {
      type: 'owasp_top10',
      title: 'OWASP Top 10',
      description: 'Identify and fix common vulnerabilities.',
      vulnerabilities: 5,
      xp: 200,
    },
    'lesson-2': {
      type: 'cryptography',
      title: 'Advanced Cryptography',
      description: 'RSA encryption and digital signatures.',
      algorithms: 2,
      xp: 200,
    },
  },

  'y6-ai-advanced': {
    'lesson-0': {
      type: 'neural_network',
      title: 'Build Neural Network',
      description: 'Create and train simple neural network.',
      layers: 3,
      neurons: 10,
      xp: 250,
    },
    'lesson-1': {
      type: 'nlp_challenge',
      title: 'Natural Language Processing',
      description: 'Text classification and sentiment analysis.',
      samples: 20,
      xp: 225,
    },
    'lesson-2': {
      type: 'computer_vision',
      title: 'Computer Vision Project',
      description: 'Image classification with CNN.',
      images: 100,
      xp: 250,
    },
  },

  'y6-git': {
    'lesson-0': {
      type: 'git_workflow',
      title: 'Git Workflow Mastery',
      description: 'Branches, commits, merges, rebases.',
      operations: 5,
      xp: 150,
    },
    'lesson-1': {
      type: 'conflict_resolution',
      title: 'Resolve Merge Conflicts',
      description: 'Handle and resolve conflicting changes.',
      conflicts: 2,
      xp: 150,
    },
    'lesson-2': {
      type: 'github_collaboration',
      title: 'GitHub Collaboration',
      description: 'Pull requests, code review, contributions.',
      xp: 150,
    },
  },

  'y6-mobile': {
    'lesson-0': {
      type: 'react_native_app',
      title: 'Build Mobile App',
      description: 'Create cross-platform mobile app.',
      screens: 3,
      xp: 225,
    },
    'lesson-1': {
      type: 'mobile_optimization',
      title: 'Mobile Optimization',
      description: 'Optimize app for performance and battery.',
      optimizations: 3,
      xp: 175,
    },
  },

  'y6-cloud': {
    'lesson-0': {
      type: 'cloud_deployment',
      title: 'Cloud Deployment',
      description: 'Deploy app to AWS, Azure, or GCP.',
      services: 3,
      xp: 225,
    },
    'lesson-1': {
      type: 'microservices',
      title: 'Microservices Architecture',
      description: 'Design scalable microservices.',
      services: 4,
      xp: 225,
    },
    'lesson-2': {
      type: 'containerization',
      title: 'Docker & Kubernetes',
      description: 'Containerize and orchestrate apps.',
      xp: 225,
    },
  },

  'y6-competitive': {
    'lesson-0': {
      type: 'competitive_coding',
      title: 'Competitive Programming',
      description: 'Solve algorithm challenges under time pressure.',
      problems: 5,
      timeLimit: 60,
      xp: 250,
    },
    'lesson-1': {
      type: 'coding_interview',
      title: 'Coding Interview Prep',
      description: 'Practice common interview questions.',
      problems: 3,
      xp: 225,
    },
  },

  'y6-capstone': {
    'lesson-0': {
      type: 'capstone_project',
      title: 'Full Capstone Project',
      description: 'Design and build a complete application.',
      scope: 'large',
      phases: 5,
      xp: 500,
    },
  },

  'y6-careers': {
    'lesson-0': {
      type: 'career_exploration',
      title: 'Tech Career Paths',
      description: 'Explore different tech careers and skills.',
      careerPaths: 6,
      xp: 100,
    },
    'lesson-1': {
      type: 'portfolio_building',
      title: 'Build Your Portfolio',
      description: 'Showcase your best projects.',
      projects: 3,
      xp: 150,
    },
    'lesson-2': {
      type: 'interview_practice',
      title: 'Interview Skills',
      description: 'Practice common interview questions.',
      xp: 150,
    },
  },

  'y6-blockchain': {
    'lesson-0': {
      type: 'blockchain_basics',
      title: 'Blockchain Fundamentals',
      description: 'Understand blockchain and cryptocurrency.',
      concepts: 4,
      xp: 150,
    },
    'lesson-1': {
      type: 'smart_contracts',
      title: 'Smart Contracts',
      description: 'Write and deploy smart contracts.',
      contracts: 2,
      xp: 225,
    },
  },

  'y6-arvr': {
    'lesson-0': {
      type: 'ar_app',
      title: 'Build AR App',
      description: 'Create augmented reality application.',
      features: 3,
      xp: 225,
    },
    'lesson-1': {
      type: 'vr_environment',
      title: 'VR Environment',
      description: 'Build immersive VR experience.',
      scenes: 2,
      xp: 250,
    },
  },

  'y6-robotics': {
    'lesson-0': {
      type: 'robot_control',
      title: 'Program Robot Movement',
      description: 'Code complex robot behaviors.',
      behaviors: 3,
      xp: 200,
    },
    'lesson-1': {
      type: 'robot_ai',
      title: 'Robot AI Challenge',
      description: 'Implement navigation and decision-making.',
      xp: 225,
    },
  },

  'y6-sound': {
    'lesson-0': {
      type: 'audio_processing',
      title: 'Audio Processing',
      description: 'Manipulate audio with code.',
      effects: 3,
      xp: 175,
    },
    'lesson-1': {
      type: 'music_generation',
      title: 'Generative Music',
      description: 'Create music algorithmically.',
      xp: 200,
    },
  },

  'y6-game-pro': {
    'lesson-0': {
      type: 'game_engine',
      title: 'Advanced Game Development',
      description: 'Build game with professional engine.',
      features: 5,
      xp: 250,
    },
    'lesson-1': {
      type: 'game_networking',
      title: 'Multiplayer Networking',
      description: 'Implement multiplayer game.',
      players: 4,
      xp: 250,
    },
  },

  'y6-modding': {
    'lesson-0': {
      type: 'game_modding',
      title: 'Game Modding',
      description: 'Create mods for popular games.',
      mods: 2,
      xp: 200,
    },
  },

  'y6-chatbots': {
    'lesson-0': {
      type: 'chatbot_advanced',
      title: 'Advanced Chatbot',
      description: 'Build intelligent conversational AI.',
      intents: 10,
      xp: 225,
    },
    'lesson-1': {
      type: 'dialogue_system',
      title: 'Complex Dialogue System',
      description: 'Implement branching dialogue.',
      branches: 5,
      xp: 200,
    },
  },
};

/**
 * Helper function to get challenges for a specific course and lesson
 * @param {string} courseId - e.g., 'y3-block-coding'
 * @param {number} lessonIdx - 0-based lesson index
 * @returns {object} Challenge object or null if not found
 */
export function getChallengeForLesson(courseId, lessonIdx) {
  const year = courseId.substring(0, 2);
  const challenges = year === 'y3' ? YEAR3_CHALLENGES :
                      year === 'y4' ? YEAR4_CHALLENGES :
                      year === 'y5' ? YEAR5_CHALLENGES :
                      year === 'y6' ? YEAR6_CHALLENGES :
                      null;

  if (!challenges || !challenges[courseId]) return null;

  const lessonKey = `lesson-${lessonIdx}`;
  return challenges[courseId][lessonKey] || null;
}

/**
 * Get all challenges for a course
 * @param {string} courseId
 * @returns {array} Array of challenges
 */
export function getAllCourseChallenges(courseId) {
  const year = courseId.substring(0, 2);
  const challenges = year === 'y3' ? YEAR3_CHALLENGES :
                      year === 'y4' ? YEAR4_CHALLENGES :
                      year === 'y5' ? YEAR5_CHALLENGES :
                      year === 'y6' ? YEAR6_CHALLENGES :
                      null;

  if (!challenges || !challenges[courseId]) return [];
  return Object.values(challenges[courseId]);
}

export default {
  YEAR3_CHALLENGES,
  YEAR4_CHALLENGES,
  YEAR5_CHALLENGES,
  YEAR6_CHALLENGES,
  getChallengeForLesson,
  getAllCourseChallenges,
};
