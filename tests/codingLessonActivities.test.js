import { COURSES } from '../src/data/learnKs2Courses.js';
import { isCodingLesson, getCodingLabConfig } from '../src/data/learnCodingConfig.js';
import { getPuzzleLevels } from '../src/data/learnPuzzleLevels.js';
import { buildKs2LessonInteractives } from '../src/data/ks2LessonInteractives.js';

describe('coding lessons have coding activities', () => {
  test('algorithm week is a coding lesson even without codingLab flag', () => {
    const lesson = COURSES.y3.lessons[1];
    expect(lesson.title).toMatch(/algorithm/i);
    expect(lesson.codingLab).toBe(false);
    expect(isCodingLesson(lesson)).toBe(true);
    expect(getCodingLabConfig('y3', 1)).toBeTruthy();
  });

  test('safety week is not forced into coding lab', () => {
    const lesson = COURSES.y3.lessons[0];
    expect(isCodingLesson(lesson)).toBe(false);
    expect(getCodingLabConfig('y3', 0)).toBeNull();
  });

  // Coding weeks get one full Coding Lab, so the puzzles above it skip the mini blocks lab
  test('every CS coding week has a lab config and puzzles that do not repeat it', () => {
    const missing = [];
    for (const yr of ['y3', 'y4', 'y5', 'y6']) {
      COURSES[yr].lessons.forEach((lesson, idx) => {
        if (!isCodingLesson(lesson)) return;
        const puzzles = getPuzzleLevels(yr, idx, buildKs2LessonInteractives(yr, idx));
        const repeatsLab = puzzles.some((p) => p.type === 'blocks');
        if (!puzzles.length || repeatsLab || !getCodingLabConfig(yr, idx)) {
          missing.push(`${yr} w${idx + 1} ${lesson.title}`);
        }
      });
    }
    expect(missing).toEqual([]);
  });
});
