// Coding lab configs for every Learn World coding lesson
import { COURSES } from './learnKs2Courses.js';
import { designLab } from './learnLabMissions.js';

// Dot is the one robot pupils code in every year, so the lab always matches the lessons.
const DOT = { id: 'dot', name: 'Dot', image: '' };

export function buddyForLesson() {
  return DOT;
}

/** Y3–4: blocks only. Y5: blocks, then Python from the spring. Y6: Python after a blocks recap. */
function defaultEditor(yr, lessonIdx, lesson) {
  const yearNum = parseInt(yr.replace('y', ''), 10);
  if (/python/i.test(lesson?.title || '')) return 'python';
  if (yearNum <= 4) return 'blocks';
  if (yearNum === 5) return lessonIdx < 20 ? 'blocks' : 'python';
  return lessonIdx < 5 ? 'blocks' : 'python';
}

/** Weeks that should include a real on-screen coding activity (blocks or Python). */
export function isCodingLesson(lesson) {
  if (!lesson) return false;
  if (lesson.codingLab) return true;
  if (lesson.kind === 'showcase') return false;
  const primary = lesson.statutory?.primary || lesson.ukCurriculum?.[0] || '';
  if (primary === 'CS-1' || primary === 'CS-2' || primary === 'CS-3') return true;
  const blob = `${lesson.title || ''} ${lesson.conceptName || ''} ${(lesson.csTopics || []).join(' ')}`.toLowerCase();
  return /\b(python|scratch|block coding|green flag|studio|sprite|loop|variable|selection|debug|algorithm|sequence|program|decomposition|pseudocode|boolean|function|repeat until)\b/.test(blob);
}

export function getCodingLabConfig(yr, lessonIdx) {
  const lesson = COURSES[yr]?.lessons?.[lessonIdx];
  if (!lesson || !isCodingLesson(lesson)) return null;

  const yearNum = parseInt(yr.replace('y', ''), 10);
  const editor = defaultEditor(yr, lessonIdx, lesson);
  const lab = designLab(lesson, yr, lessonIdx, editor);
  const m = lab.blocks;

  return {
    editor,
    allowModeSwitch: yearNum >= 5,
    defaultEditor: editor,
    kind: lab.kind,
    title: lesson.title,
    challenge: editor === 'python' ? lab.python.goal : m.goal,
    blocksGoal: m.goal,
    pythonGoal: lab.python.goal,
    concept: lesson.conceptName,
    xp: 25,
    characterName: DOT.name,
    characterImage: DOT.image,
    mission: {
      goal: m.goal,
      gridCols: m.cols,
      gridRows: m.rows,
      start: m.start,
      target: m.target,
      obstacles: m.walls,
      gems: m.gems,
      paintTargets: m.paintTargets,
      checkpoints: m.checkpoints,
      parcel: m.parcel,
      house: m.house,
      maxBlocks: m.maxBlocks || null,
      requireBlock: m.requireBlock || null,
      predict: !!m.predict,
      charName: DOT.name,
    },
    hints: m.hints,
    starterBlocks: m.starter,
    solutionBlocks: m.solution,
    pythonHints: lab.python.hints,
    starterCode: lab.python.starterCode,
    solutionCode: lab.python.solutionCode,
    pythonPredict: !!lab.python.predict,
    validate: lab.python.validate,
  };
}

export function codingBlocksPuzzle(yr, lessonIdx) {
  const coding = getCodingLabConfig(yr, lessonIdx);
  if (!coding) return null;
  return {
    type: 'blocks',
    title: coding.editor === 'python' ? 'Code this week’s idea' : 'Block coding',
    description: coding.challenge || 'Build a program for this week’s challenge.',
    xp: coding.xp || 25,
    duration: '6 min',
    level: 1,
    config: {
      characterName: coding.characterName,
      characterImage: coding.characterImage,
      mission: coding.mission,
      starterBlocks: coding.starterBlocks,
      solutionBlocks: coding.solutionBlocks,
      hints: coding.hints,
    },
    characterName: coding.characterName,
    characterImage: coding.characterImage,
  };
}

export function codingModeKey(yr, idx) {
  return `bb_coding_mode_${yr}_${idx}`;
}

export function codingStorageKey(yr, idx) {
  return `bb_coding_${yr}_${idx}`;
}
