/**
 * Everything a teacher can set as classwork, and where it opens for pupils.
 * Lessons and missions tick themselves off when the pupil finishes them;
 * activities and written tasks are handed in.
 */

export const ACTIVITIES = [
  { id: 'gamebuilder', title: 'Make a game', emoji: '🎮', hash: 'gamebuilder', blurb: 'Pupils build a game with blocks and hand in the project straight from Game Builder.', handIn: 'project', color: '#10b981' },
  { id: 'robot', title: 'Robot Lab challenge', emoji: '🤖', hash: 'robot', blurb: 'Program a micro:bit, mBot, Arduino or Quarky — hand in the code or a photo.', handIn: 'work', color: '#0ea5e9' },
  { id: 'studio', title: 'Robot Studio', emoji: '🏎️', hash: 'studio', blurb: 'Design and drive a 3D robot through an arena course.', handIn: 'work', color: '#f97316' },
  { id: 'workspace', title: 'Python workspace', emoji: '🐍', hash: 'workspace', blurb: 'Write and run Python, then hand in the code.', handIn: 'work', color: '#8b5cf6' },
];

export const KIND_META = {
  lesson: { label: 'Lesson', emoji: '📚', color: '#6366f1', auto: true },
  mission: { label: 'Mission', emoji: '🚀', color: '#ec4899', auto: true },
  activity: { label: 'Activity', emoji: '🧩', color: '#0ea5e9', auto: false },
  task: { label: 'Task', emoji: '✏️', color: '#f59e0b', auto: false },
};

let cache = null;
/** Loads lesson + mission lists (big data files, so only when the picker opens). */
export async function loadLibrary() {
  if (cache) return cache;
  const [{ COURSES, COURSE_ORDER }, { CAMPAIGNS }] = await Promise.all([
    import('../../data/learnKs2Courses.js'),
    import('../missions/missionData.js'),
  ]);
  const years = COURSE_ORDER.map((yr) => {
    const c = COURSES[yr];
    return {
      yr,
      label: `Year ${c.year}`,
      icon: c.icon,
      color: c.color,
      terms: (c.terms || []).map((t) => ({ name: t.name, focus: t.focus, color: t.color, range: t.range })),
      lessons: c.lessons.map((l, idx) => ({
        kind: 'lesson',
        key: `lesson:${yr}:${idx}`,
        title: l.title,
        emoji: l.emoji || '📘',
        week: l.week || idx + 1,
        blurb: l.pupilHook || '',
        minutes: l.estimatedMinutes || 45,
        target: { yr, idx },
        hash: `learn/${yr}/${idx}`,
      })),
    };
  });
  const campaigns = CAMPAIGNS.map((c) => ({
    id: c.id,
    title: c.title,
    emoji: c.emoji,
    color: c.color,
    concept: c.concept,
    missions: c.missions.map((m) => ({
      kind: 'mission',
      key: `mission:${c.id}:${m.id}`,
      title: `${c.title}: ${m.title}`,
      shortTitle: m.title,
      emoji: m.emoji,
      blurb: m.story,
      target: { campaign: c.id, mission: m.id },
      hash: `missions/${c.id}/${m.id}`,
    })),
  }));
  cache = { years, campaigns };
  return cache;
}

/** Hash that opens an assignment for a pupil (works in Google Classroom links too). */
export function openHash(a) {
  if (a.kind === 'lesson' || a.kind === 'mission') return a.hash;
  if (a.kind === 'activity') return ACTIVITIES.find((x) => x.id === a.target?.activity)?.hash || 'workspace';
  return 'classroom';
}

/** Link posted to Google Classroom: joins the class if needed, then opens the work. */
export function classroomHash(a, cls) {
  const p = new URLSearchParams({ join: cls.inviteCode, assign: a.id });
  return `classroom?${p.toString()}`;
}
