// Coding lab configs for all 80 Learn World lessons
import { COURSES } from './learnWorldData.js';

const CHARS = ['🤖', '📦', '🎨', '🌀', '⚡', '🚀', '🔧', '📷'];
const GOALS = ['⭐', '🎯', '🏁', '💎', '🌟'];

function buildPathBlocks(start, target) {
  const blocks = [];
  let { col, row, dir } = { ...start };
  const dx = target.col - col;
  const dy = target.row - row;

  if (dx > 0) {
    if (dir !== 0) { blocks.push({ id: 'turn_right', param: 1 }); dir = 0; }
    blocks.push({ id: 'forward', param: dx });
    col = target.col;
  } else if (dx < 0) {
    if (dir !== 180) { blocks.push({ id: 'turn_left', param: 1 }); blocks.push({ id: 'turn_left', param: 1 }); dir = 180; }
    blocks.push({ id: 'forward', param: -dx });
    col = target.col;
  }

  if (dy < 0) {
    if (dir !== 90) {
      blocks.push(dir === 0 ? { id: 'turn_left', param: 1 } : { id: 'turn_right', param: 1 });
      dir = dir === 0 ? 90 : 90;
    }
    blocks.push({ id: 'forward', param: row - target.row });
  } else if (dy > 0) {
    if (dir !== 270) {
      blocks.push(dir === 0 ? { id: 'turn_right', param: 1 } : { id: 'turn_left', param: 1 });
    }
    blocks.push({ id: 'forward', param: target.row - row });
  }

  if (blocks.length === 0) blocks.push({ id: 'forward', param: 1 });
  return blocks;
}

function pythonStarter(lesson) {
  return `# ByteBuddies Coding Lab — ${lesson.title}
# Challenge: ${lesson.challenge}

def main():
    # Your code here — use print() to show what your program does
    print("Program started!")
    # Example: forward(3); turn_left(); forward(2)

main()
`;
}

function pythonSolution(lesson, idx) {
  const topics = String(lesson.csTopics?.[0] || 'coding').toLowerCase();
  return `# Solution — ${lesson.title}
def main():
    print("Starting ${topics} program...")
    steps = ${Math.min(3 + (idx % 4), 8)}
    for i in range(steps):
        print(f"Step {i + 1}: executing instruction")
    print("Program completed successfully!")

main()
`;
}

function pythonTrafficStarter() {
  return `# Smart Traffic System
def traffic_light(car_detected):
    if car_detected:
        return "GREEN"
    return "RED"

print("Light (car):", traffic_light(True))
print("Light (no car):", traffic_light(False))
`;
}

function pythonColonyStarter() {
  return `# Mars Colony System
class Colony:
    def __init__(self):
        self.power = 100
        self.water = 50
        self.residents = 10

    def manage_power(self):
        if self.power < 20:
            print("Activating solar panels!")
            self.power += 30

    def run(self):
        for day in range(1, 6):
            self.manage_power()
            print(f"Day {day}: power={self.power}")

mars = Colony()
mars.run()
`;
}

/** Y3–4: blocks only. Y5–6: blocks or python per lesson (no JavaScript). */
function defaultEditor(yr, lessonIdx) {
  const yearNum = parseInt(yr.replace('y', ''), 10);
  if (yearNum <= 4) return 'blocks';
  // Y5: first half blocks (transition), second half python
  if (yearNum === 5) return lessonIdx < 10 ? 'blocks' : 'python';
  // Y6: mostly python; first 5 lessons keep blocks for recap
  return lessonIdx < 5 ? 'blocks' : 'python';
}

/** Per-lesson overrides for featured lessons from the mega prompt */
const OVERRIDES = {
  'y3-1': {
    mission: { target: { col: 3, row: 0 }, start: { col: 0, row: 2, dir: 0 } },
    starterBlocks: [{ id: 'forward', param: 3 }],
    solutionBlocks: [{ id: 'forward', param: 3 }, { id: 'turn_left', param: 1 }, { id: 'forward', param: 2 }],
    hints: [
      'You need to move forward, then turn.',
      'Try: Forward(3), Turn Left, Forward(2)',
      'Forward(3) → Turn Left → Forward(2) reaches the goal!',
    ],
  },
  'y3-2': {
    starterBlocks: [{ id: 'paint', param: 'red' }, { id: 'forward', param: 1 }],
    solutionBlocks: [
      { id: 'repeat', param: 5 },
      { id: 'paint', param: 'red' },
      { id: 'forward', param: 1 },
    ],
    hints: [
      'Use REPEAT to paint a line of squares.',
      'Repeat 5 times: Paint Red, then Forward 1.',
      'REPEAT(5) { PAINT RED, FORWARD 1 }',
    ],
  },
  'y4-5': {
    editor: 'python',
    starterCode: pythonTrafficStarter(),
    solutionCode: pythonTrafficStarter(),
  },
  'y5-0': {
    editor: 'python',
    starterCode: `def deliver_package(location):
    """Navigate to location and deliver."""
    print(f"Navigating to {location}...")
    print("Package delivered!")
    return "base"

deliver_package("library")
`,
  },
  'y6-15': {
    editor: 'python',
    starterCode: pythonColonyStarter(),
    solutionCode: pythonColonyStarter(),
  },
};

export function getCodingLabConfig(yr, lessonIdx) {
  const lesson = COURSES[yr]?.lessons?.[lessonIdx];
  if (!lesson) return null;

  const yearNum = parseInt(yr.replace('y', ''), 10);
  const key = `${yr}-${lessonIdx}`;
  const override = OVERRIDES[key] || {};

  const editor = override.editor || defaultEditor(yr, lessonIdx);
  const allowModeSwitch = yearNum >= 5;
  const gridCols = 8;
  const gridRows = 6;
  const start = { col: 0, row: Math.floor(gridRows / 2), dir: 0 };
  const target = {
    col: Math.min(gridCols - 1, 2 + (lessonIdx % 5)),
    row: Math.min(gridRows - 1, 1 + (Math.floor(lessonIdx / 3) % (gridRows - 1))),
  };

  const solutionBlocks = override.solutionBlocks || buildPathBlocks(start, target);
  const defaultHints = [
    `Focus on ${lesson.conceptName || 'the concept'}: ${(lesson.conceptExplain || '').slice(0, 90)}…`,
    lesson.activities?.[0] || 'Break the challenge into smaller steps.',
    editor === 'blocks'
      ? 'Use Forward and Turn blocks to reach the ⭐ goal.'
      : 'Write a function, run it, and check the console output.',
  ];

  return {
    editor,
    allowModeSwitch,
    defaultEditor: editor,
    title: lesson.title,
    challenge: lesson.challenge,
    concept: lesson.conceptName,
    xp: 25,
    mission: {
      goal: lesson.challenge,
      char: CHARS[lessonIdx % CHARS.length],
      tEmoji: GOALS[lessonIdx % GOALS.length],
      target,
      start,
      gridCols,
      gridRows,
      obstacles: lessonIdx % 7 === 0 ? [{ col: 3, row: 2 }] : [],
      ...override.mission,
    },
    hints: override.hints || defaultHints,
    starterBlocks: override.starterBlocks || [{ id: 'forward', param: 1 }],
    solutionBlocks,
    starterCode: override.starterCode || pythonStarter(lesson),
    solutionCode: override.solutionCode || pythonSolution(lesson, lessonIdx),
    validate: editor === 'blocks'
      ? { type: 'reachGoal' }
      : { type: 'runsClean' },
  };
}

export function codingModeKey(yr, idx) {
  return `bb_coding_mode_${yr}_${idx}`;
}

export function codingStorageKey(yr, idx) {
  return `bb_coding_${yr}_${idx}`;
}
