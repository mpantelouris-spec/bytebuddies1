import {
  emptyTeacherContent,
  normalizeTeacherContent,
  hasMeaningfulContent,
} from '../src/utils/teacherLessonContent.js';
import { COURSES } from '../src/data/learnKs2Courses.js';
import { vocabDef } from '../src/data/curriculum/plainTeach.js';

describe('teacher lesson extras', () => {
  test('empty is not meaningful', () => {
    expect(hasMeaningfulContent(emptyTeacherContent())).toBe(false);
  });

  test('notes and slides survive normalize', () => {
    const n = normalizeTeacherContent({
      notes: 'Table 3 example',
      showOnBoard: true,
      slides: [{ title: 'School rule', body: 'Use our poster' }],
      tasks: [{ title: 'Walk the room', mins: 8, steps: ['Stop at each table'] }],
      resources: ['Drive folder'],
      homework: 'Talk at home',
    });
    expect(n.notes).toBe('Table 3 example');
    expect(n.slides[0].title).toBe('School rule');
    expect(n.tasks[0].mins).toBe(8);
    expect(n.resources).toEqual(['Drive folder']);
    expect(hasMeaningfulContent(n)).toBe(true);
  });
});

describe('every KS2 lesson is teachable in plain English', () => {
  const all = ['y3', 'y4', 'y5', 'y6'].flatMap((yr) => COURSES[yr].lessons.map((l) => ({ yr, l })));

  test('152 lessons with a teach script and cover notes', () => {
    expect(all.length).toBe(152);
    const weak = all.filter(({ l }) => {
      const cover = l.coverNotes || {};
      return !l.teachScript
        || /pupils engage with|international notes:/i.test(l.teachScript)
        || !cover.whatThisHourIs
        || !cover.sayAtTheStart
        || !(cover.doInOrder || []).length
        || /key term for this week/i.test(JSON.stringify(l.vocabulary));
    }).map(({ yr, l }) => `${yr} ${l.title}`);
    expect(weak).toEqual([]);
  });

  test('vocab words have real meanings', () => {
    expect(vocabDef('algorithm')).toMatch(/steps/i);
    expect(vocabDef('trusted adult')).toMatch(/help/i);
  });
});
