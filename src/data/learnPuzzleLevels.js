/**
 * Code.org-style block puzzle levels — 4 progressive puzzles per lesson.
 * Merged with learnInteractiveActivities for the activity step.
 */
import { getCodingLabConfig } from './learnCodingConfig.js';

const PUZZLE_OVERRIDES = {
  'y3-0': [
    {
      type: 'blocks', title: 'First Steps', description: 'Move Bolt forward to reach the star!',
      xp: 15, duration: '3 min', level: 1,
      config: {
        mission: { char: '🤖', goal: 'Reach the star ⭐', gridCols: 5, gridRows: 5,
          start: { col: 0, row: 2, dir: 0 }, target: { col: 4, row: 2 } },
        starterBlocks: [{ id: 'forward', param: 1 }],
        solutionBlocks: [{ id: 'forward', param: 4 }],
        hints: ['Bolt needs to move right across the grid.', 'Use Move Forward — click the number to change steps.', 'Forward(4) reaches the star!'],
      },
    },
    {
      type: 'grid', title: 'Turn and Move', description: 'Navigate around a corner to the goal.',
      xp: 20, duration: '4 min', level: 2,
      config: { size: 5, startPos: { x: 0, y: 0 }, goalPos: { x: 4, y: 4 },
        instructions: 'Plan a path: move right, then down to the star!' },
    },
    {
      type: 'seq', title: 'Morning Routine', description: 'Put the algorithm steps in order.',
      xp: 20, duration: '4 min', level: 3,
      steps: ['Wake up', 'Brush teeth', 'Get dressed', 'Eat breakfast', 'Go to school'],
      instructions: 'Drag steps into the correct morning order.',
    },
    {
      type: 'multiSeq', title: 'Algorithm Hunt', description: 'Match tasks with correct step order.',
      xp: 25, duration: '5 min', level: 4,
      tasks: [{ name: 'Making a sandwich', steps: ['Take out bread', 'Spread filling', 'Place top slice', 'Cut in half'] }],
    },
  ],
  'y3-1': [
    {
      type: 'blocks', title: 'Delivery Route', description: 'Help Bolt deliver the package!',
      xp: 20, duration: '5 min', level: 1,
      config: {
        mission: { char: '📦', goal: 'Deliver to the library', gridCols: 6, gridRows: 5,
          start: { col: 0, row: 2, dir: 0 }, target: { col: 3, row: 0 } },
        starterBlocks: [{ id: 'forward', param: 3 }],
        solutionBlocks: [{ id: 'forward', param: 3 }, { id: 'turn_left', param: 1 }, { id: 'forward', param: 2 }],
        hints: ['The library is right and up from Bolt.', 'Go forward, then turn left.', 'Forward(3) → Turn Left → Forward(2)'],
      },
    },
    {
      type: 'debug', title: 'Broken Delivery', description: 'Find the wrong turn in the route!',
      xp: 20, duration: '5 min', level: 2,
      blocks: ['DRIVE_NORTH 5', 'TURN_RIGHT', 'DRIVE 2', 'DELIVER', 'CONFIRM'],
      bugIdx: 1, fixOptions: ['TURN_LEFT', 'TURN_RIGHT', 'TURN_BACK'], correctFix: 0,
      instructions: 'Which block has the bug? Choose the correct fix.',
    },
    {
      type: 'grid', title: 'Delivery Race', description: 'Reach the star through obstacles.',
      xp: 25, duration: '5 min', level: 3,
      config: { size: 6, startPos: { x: 0, y: 3 }, goalPos: { x: 5, y: 3 },
        obstacles: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
        instructions: 'Plan the fastest route around the walls!' },
    },
    {
      type: 'collector', title: 'Multi-Drop Delivery', description: 'Collect all packages on the route!',
      xp: 30, duration: '6 min', level: 4,
      config: { size: 5, startPos: { x: 0, y: 2 },
        coins: [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 4 }],
        instructions: 'Visit every 📦 and grab each one!' },
    },
  ],
  'y3-2': [
    {
      type: 'blocks', title: 'Paint 3 Squares', description: 'Run the loop to paint 3 squares!',
      xp: 20, duration: '4 min', level: 1,
      config: {
        mission: { char: '🎨', goal: 'Paint 3 red squares', gridCols: 6, gridRows: 4,
          start: { col: 0, row: 2, dir: 0 }, target: null },
        starterBlocks: [{ id: 'repeat', param: 3 }, { id: 'paint', param: 'red' }, { id: 'forward', param: 1 }],
        solutionBlocks: [{ id: 'repeat', param: 3 }, { id: 'paint', param: 'red' }, { id: 'forward', param: 1 }],
        hints: ['The loop is already set up — just click Run!', 'Repeat runs the next 2 blocks 3 times.', 'Paint red, move forward — 3 times!'],
      },
    },
    {
      type: 'blocks', title: 'Paint 7 Squares', description: 'Change the repeat count to 7!',
      xp: 25, duration: '5 min', level: 2,
      config: {
        mission: { char: '🎨', goal: 'Paint 7 squares — change REPEAT to 7', gridCols: 8, gridRows: 4,
          start: { col: 0, row: 2, dir: 0 }, target: null },
        starterBlocks: [{ id: 'repeat', param: 3 }, { id: 'paint', param: 'red' }, { id: 'forward', param: 1 }],
        solutionBlocks: [{ id: 'repeat', param: 7 }, { id: 'paint', param: 'red' }, { id: 'forward', param: 1 }],
        hints: ['Click the number on the REPEAT block.', 'Change 3 to 7.', 'REPEAT(7) { PAINT RED, FORWARD 1 }'],
      },
    },
    {
      type: 'pattern', title: 'Red-Blue Pattern', description: 'Recreate the red-blue-red pattern.',
      xp: 25, duration: '6 min', level: 3,
      target: [[1,1,1,1,0,0,0,1,1,1,1]], showSeconds: 5,
    },
    {
      type: 'blocks', title: 'Loop Master Bonus', description: 'Paint 100 squares with nested loops!',
      xp: 35, duration: '8 min', level: 4,
      config: {
        mission: { char: '🏆', goal: 'Use loops efficiently — paint the whole row!', gridCols: 10, gridRows: 4,
          start: { col: 0, row: 2, dir: 0 }, target: null },
        starterBlocks: [{ id: 'repeat', param: 10 }, { id: 'paint', param: 'blue' }, { id: 'forward', param: 1 }],
        solutionBlocks: [{ id: 'repeat', param: 10 }, { id: 'paint', param: 'blue' }, { id: 'forward', param: 1 }],
        hints: ['One REPEAT block can do the work of 10 PAINT blocks!', 'Set REPEAT to 10.', 'REPEAT(10) { PAINT BLUE, FORWARD 1 } paints the whole row!'],
      },
    },
  ],
  'y3-3': [
    {
      type: 'debug', title: 'Find the Wrong Turn', description: 'The robot hits a wall — fix the bug!',
      xp: 20, duration: '4 min', level: 1,
      blocks: ['FORWARD', 'FORWARD', 'TURN_RIGHT', 'FORWARD', 'TURN_LEFT', 'FORWARD'],
      bugIdx: 4, fixOptions: ['TURN_LEFT', 'TURN_RIGHT', 'FORWARD'], correctFix: 1,
      instructions: 'Step 5 has the wrong turn. What should it be?',
      context: 'The robot needs to turn RIGHT, not LEFT!',
    },
    {
      type: 'grid', title: 'Escape the Maze', description: 'Guide Bolt out of the maze.',
      xp: 25, duration: '5 min', level: 2,
      config: { size: 5, startPos: { x: 0, y: 0 }, goalPos: { x: 4, y: 4 },
        obstacles: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 1 }],
        instructions: 'Trace the path carefully — one wrong move and you hit a wall!' },
    },
    {
      type: 'trace', title: 'Trace the Bug', description: 'Follow the code and find where it goes wrong.',
      xp: 25, duration: '5 min', level: 3,
      lines: ['FORWARD 3', 'TURN_RIGHT', 'FORWARD 2', 'TURN_LEFT  ← BUG', 'FORWARD 1'],
      questions: [{ q: 'Which line has the bug?', answer: 'TURN_LEFT' }],
      instructions: 'Read each line and identify the mistake.',
    },
    {
      type: 'debug', title: 'Glitch Attack', description: 'Fix three bugs to restore the factory!',
      xp: 30, duration: '6 min', level: 4,
      blocks: ['START', 'MOVE 5', 'TURN_LEFT', 'MOVE 3', 'GRAB', 'STOP'],
      bugIdx: 2, fixOptions: ['TURN_LEFT', 'TURN_RIGHT', 'MOVE 3'], correctFix: 1,
      instructions: 'The factory robot keeps crashing. Find and fix the bug!',
    },
  ],
  'y3-4': [
    {
      type: 'blocks', title: 'Shortest Path', description: 'Reach the goal in the fewest blocks!',
      xp: 20, duration: '4 min', level: 1,
      config: {
        mission: { char: '🏆', goal: 'Fastest route wins!', gridCols: 6, gridRows: 5,
          start: { col: 0, row: 4, dir: 0 }, target: { col: 5, row: 0 } },
        starterBlocks: [],
        solutionBlocks: [{ id: 'forward', param: 5 }, { id: 'turn_right', param: 1 }, { id: 'forward', param: 4 }],
        hints: ['Go straight first, then turn.', 'Forward 5, turn right, forward 4.', '3 blocks total — much better than 9 individual moves!'],
      },
    },
    {
      type: 'grid', title: 'Obstacle Course', description: 'Navigate the sports day course efficiently.',
      xp: 25, duration: '5 min', level: 2,
      config: { size: 7, startPos: { x: 0, y: 3 }, goalPos: { x: 6, y: 3 },
        obstacles: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 4, y: 3 }],
        instructions: 'Find the shortest path around obstacles!' },
    },
    {
      type: 'prediction', title: 'Predict the Winner', description: 'Which algorithm is faster?',
      xp: 20, duration: '4 min', level: 3,
      sequence: ['R','R','R','D','D'], start: { x: 0, y: 0 }, size: 6,
      options: ['(3, 2)', '(2, 3)', '(0, 0)', '(5, 5)'], answer: 0,
      instructions: 'Trace the path — where does the robot finish?',
    },
    {
      type: 'blocks', title: 'Race Champion', description: 'Beat the record with an optimized route!',
      xp: 35, duration: '6 min', level: 4,
      config: {
        mission: { char: '🥇', goal: 'Beat the record — fewest blocks!', gridCols: 8, gridRows: 6,
          start: { col: 0, row: 5, dir: 0 }, target: { col: 7, row: 0 },
          obstacles: [{ col: 3, row: 3 }, { col: 4, row: 3 }] },
        starterBlocks: [{ id: 'forward', param: 3 }],
        solutionBlocks: [{ id: 'forward', param: 3 }, { id: 'turn_right', param: 1 }, { id: 'forward', param: 5 }],
        hints: ['Think diagonal — go right then up.', 'Use turns to cut corners.', 'Forward → Turn Right → Forward is the winner!'],
      },
    },
  ],
};

/** Build 4 puzzle levels for any lesson — prioritize Y3_ACTIVITIES, then overrides, then coding config */
export function getPuzzleLevels(yr, lessonIdx, fallbackInteractives = []) {
  const key = `${yr}-${lessonIdx}`;
  
  // Prioritize Y3_ACTIVITIES when they have 2+ activities (new lesson-matched content)
  const fromInteractives = fallbackInteractives.slice(0, 4);
  if (fromInteractives.length >= 2) return fromInteractives;
  
  // Fall back to PUZZLE_OVERRIDES for lessons without Y3_ACTIVITIES
  if (PUZZLE_OVERRIDES[key]) return PUZZLE_OVERRIDES[key];

  if (fromInteractives.length >= 4) return fromInteractives;

  const coding = getCodingLabConfig(yr, lessonIdx);
  const puzzles = [...fromInteractives];

  if (coding && coding.editor === 'blocks' && puzzles.length < 4) {
    puzzles.unshift({
      type: 'blocks',
      title: 'Block Coding Challenge',
      description: coding.challenge,
      xp: coding.xp || 20,
      duration: '5 min',
      level: 1,
      config: {
        mission: coding.mission,
        starterBlocks: coding.starterBlocks,
        solutionBlocks: coding.solutionBlocks,
        hints: coding.hints,
      },
    });
  }

  while (puzzles.length < 4 && fallbackInteractives[puzzles.length]) {
    puzzles.push(fallbackInteractives[puzzles.length]);
  }

  return puzzles.slice(0, 4);
}

export function hasCustomPuzzles(yr, lessonIdx) {
  return Boolean(PUZZLE_OVERRIDES[`${yr}-${lessonIdx}`]);
}
