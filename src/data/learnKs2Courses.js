// KS2 Curriculum Bible — loaded only by Learn hub (keeps dev server startup fast)
import { KS2_COURSES, KS2_LESSON_COUNT } from './ks2CurriculumLessons.js';
import { KS2_TERM_RANGES } from './curriculum/ks2Statutory.js';

export { KS2_LESSON_COUNT };

export const TERMS = KS2_TERM_RANGES;

function attachKs2CourseMeta(id) {
  const base = KS2_COURSES[id];
  const lessons = base.lessons || [];
  return {
    ...base,
    terms: KS2_TERM_RANGES[id],
    totalXP: lessons.reduce((s, l) => s + (l.xp || 0), 0),
    lessonCount: lessons.length,
  };
}

export const COURSES = {
  y3: attachKs2CourseMeta('y3'),
  y4: attachKs2CourseMeta('y4'),
  y5: attachKs2CourseMeta('y5'),
  y6: attachKs2CourseMeta('y6'),
};

export const COURSE_ORDER = ['y3', 'y4', 'y5', 'y6'];

export function getTotalLessons() {
  return KS2_LESSON_COUNT;
}
