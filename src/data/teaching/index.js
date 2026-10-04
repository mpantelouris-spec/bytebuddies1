/**
 * Teaching content for every KS2 lesson: the explanation, worked example,
 * common mistake and class question that go on the board.
 *
 * Review weeks are assembled from the lessons since the previous review, so
 * retrieval always matches what the class has actually been taught.
 */
import { COURSES } from '../learnKs2Courses.js';
import y3 from './y3.js';
import y4 from './y4.js';
import y5 from './y5.js';
import y6 from './y6.js';

const BY_YEAR = { y3, y4, y5, y6 };

function reviewFor(yr, idx) {
  const lessons = COURSES[yr]?.lessons || [];
  let from = idx - 1;
  while (from > 0 && lessons[from - 1]?.kind !== 'review') from -= 1;
  const covered = [];
  for (let i = from; i < idx; i++) {
    const t = BY_YEAR[yr]?.[i];
    if (t && lessons[i]?.kind !== 'review') covered.push({ title: lessons[i].title, t });
  }
  if (!covered.length) return null;
  const pick = covered.filter((c) => c.t.tryIt).slice(-4);
  return {
    review: true,
    objectives: [
      'I can remember the big ideas from the last few weeks',
      'I can explain them using the right computing words',
      'I can use what I remember to answer new questions',
    ],
    big: `Without looking back: what do you remember about ${covered.slice(0, 3).map((c) => `“${c.title}”`).join(', ')}?`,
    explain: [
      'Remembering something without looking it up makes it stick in your long-term memory. That is why we review.',
      'For each topic, try to say the big idea in one sentence before you reveal it. Getting it wrong is fine — that is how review works.',
    ],
    example: {
      type: 'table',
      title: 'What we have learned',
      head: ['Lesson', 'Big ideas'],
      rows: covered.map((c) => [c.title, (c.t.summary || []).join(' · ')]),
    },
    tryIt: pick.map((c) => c.t.tryIt),
    summary: covered.slice(-3).map((c) => c.t.summary?.[0]).filter(Boolean),
  };
}

/** Fallback for any lesson without written content: use its own fields, minus teacher scripting. */
function fromLesson(lesson) {
  if (!lesson) return null;
  return {
    objectives: lesson.objectives || [],
    big: lesson.pupilHook || lesson.mission,
    explain: [lesson.conceptExplain || lesson.mission].filter(Boolean),
    summary: [],
  };
}

export function getTeaching(yr, idx) {
  const lesson = COURSES[yr]?.lessons?.[idx];
  const written = BY_YEAR[yr]?.[idx];
  if (written) return written;
  if (lesson?.kind === 'review') return reviewFor(yr, idx) || fromLesson(lesson);
  return fromLesson(lesson);
}

export function hasTeaching(yr, idx) {
  return !!BY_YEAR[yr]?.[idx];
}
