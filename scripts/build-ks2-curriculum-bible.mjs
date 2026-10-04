/**
 * Builds KS2 Curriculum Bible lessons (152) for Learn Hub + csCurriculum tracks.
 * Run: node scripts/build-ks2-curriculum-bible.mjs
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { KS2_WEEK_SPINE } from '../src/data/curriculum/ks2WeekSpine.js';
import { KS2_STATUTORY, KS2_TRACKS, KS2_TERM_RANGES } from '../src/data/curriculum/ks2Statutory.js';
import { getDetailedEdition } from '../src/data/curriculum/detailedEdition.js';
import { weekEmoji } from '../src/data/pupilMissions.js';
import {
  vocabDef, buildTeachScript, buildCoverNotes, kidConcept,
} from '../src/data/curriculum/plainTeach.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const CONCEPT = {
  'CS-1': { name: 'Decomposition', explain: 'Breaking a big problem into smaller, manageable steps so you can design, write and debug programs.' },
  'CS-2': { name: 'Programs', explain: 'Using sequence, selection, repetition, variables, and input/output to control what a computer does.' },
  'CS-3': { name: 'Logical reasoning', explain: 'Predicting what code will do, explaining choices, and finding and fixing errors systematically.' },
  'IT-1': { name: 'Networks', explain: 'How devices share information and how people collaborate safely online.' },
  'IT-2': { name: 'Search and evaluation', explain: 'Finding information effectively and judging whether digital content is trustworthy.' },
  'IT-3': { name: 'Digital content and data', explain: 'Choosing and combining software to create content and handle data for a purpose.' },
  'DL-1': { name: 'Digital citizenship', explain: 'Using technology safely, respectfully and responsibly, and knowing when to ask for help.' },
};

const CHAR = { 3: 'beemo', 4: 'professorByte', 5: 'bolt', 6: 'vision' };
const EMOJI = { review: '🔄', mini: '🛠️', capstone: '🏆', showcase: '🎉', normal: '📘' };

function xpFor(kind) {
  if (kind === 'mini' || kind === 'capstone') return 105;
  if (kind === 'showcase') return 78;
  return 78;
}

function vocabObjects(words) {
  return (words || []).map((w) => {
    if (w && typeof w === 'object' && w.word) {
      const def = w.def && !/^key term/i.test(w.def) ? w.def : vocabDef(w.word);
      return { word: w.word, def };
    }
    return { word: w, def: vocabDef(w) };
  });
}

function buildLesson(year, weekIndex, row, nextTitle) {
  const w = weekIndex + 1;
  const id = `y${year}-w${String(w).padStart(2, '0')}`;
  const concept = CONCEPT[row.primary];
  const xp = xpFor(row.kind);
  const codingLab = row.coding;
  const d = getDetailedEdition(id, year, row.title, row.kind, row.primary, codingLab);
  const activities = d.activities;
  const vocabulary = vocabObjects(d.vocabulary);
  const teachScript = buildTeachScript({
    year,
    title: row.title,
    kind: row.kind,
    primary: row.primary,
    about: d.about,
    objectives: d.objectives,
    pupilHook: d.pupilHook,
    coding: codingLab,
    vocabulary,
  });
  const coverNotes = buildCoverNotes({
    year,
    title: row.title,
    kind: row.kind,
    primary: row.primary,
    pupilHook: d.pupilHook,
    activities,
    objectives: d.objectives,
    extension: d.extension,
    quiz: d.quiz,
    nextTitle,
    coding: codingLab,
    estimatedMinutes: row.kind === 'mini' || row.kind === 'capstone' || row.kind === 'showcase' ? 60 : 55,
  });

  return {
    id,
    week: w,
    title: row.title,
    mission: d.about,
    pupilHook: d.pupilHook || `This week: ${row.title}. Play the games, then take the quiz.`,
    trackId: KS2_TRACKS[year],
    ukCurriculum: [row.primary, row.secondary],
    statutory: { primary: row.primary, secondary: row.secondary },
    kind: row.kind,
    codingLab,
    xp,
    emoji: weekEmoji(row.title, row.kind, codingLab),
    character: CHAR[year],
    difficulty: year - 2,
    estimatedMinutes: row.kind === 'mini' || row.kind === 'capstone' || row.kind === 'showcase' ? 60 : 55,
    objectives: d.objectives,
    csTopics: [concept.name, row.primary],
    vocabulary,
    international: d.international,
    teach: teachScript,
    teachScript,
    coverNotes,
    storyLine: d.about,
    conceptName: concept.name,
    conceptExplain: kidConcept(row.primary, row.title, d.about),
    activities: activities.map((a) => a.title),
    bibleActivities: activities,
    codeDebug: d.codeDebug,
    challenge: row.kind === 'capstone' ? 'Meet your capstone success criteria and prepare to present.' : `Apply ${concept.name.toLowerCase()} in today's mission.`,
    reflection: d.reflection,
    extension: d.extension,
    parentPrompt: `Ask your child to explain one word from this week (${(d.vocabulary || []).slice(0, 3).join(', ')}) — no devices required.`,
    quiz: d.quiz,
    badge: row.kind === 'showcase' ? '🎓' : row.kind === 'capstone' && w === 37 ? '🏆' : null,
  };
}

function buildYearLessons(year) {
  const spine = KS2_WEEK_SPINE[year];
  if (!spine || spine.length !== 38) throw new Error(`Year ${year} spine must have 38 weeks, got ${spine?.length}`);
  return spine.map((row, i) => buildLesson(year, i, row, spine[i + 1]?.title));
}

const y3 = buildYearLessons(3);
const y4 = buildYearLessons(4);
const y5 = buildYearLessons(5);
const y6 = buildYearLessons(6);
const ALL = [...y3, ...y4, ...y5, ...y6];
if (ALL.length !== 152) throw new Error(`Expected 152 lessons, got ${ALL.length}`);

const COURSE_META = {
  y3: {
    regionName: 'ByteBuddies Academy',
    storyTitle: 'KS2 Computing — Year 3',
    storyText: 'Thirty-eight weeks aligned to the ByteBuddies Curriculum Bible. Digital citizenship, algorithms, block coding, data, networks, and capstone projects — British English, ages 7–8.',
    ages: 'Ages 7–8',
    icon: '🌱',
    color: '#10b981',
    gradient: 'linear-gradient(135deg,#064e3b 0%,#10b981 100%)',
    mainCharacter: 'beemo',
    tagline: '38 weeks · statutory KS2 computing',
    completionBadge: '🏆',
    completionBadgeLabel: 'Year 3 Computing Graduate',
  },
  y4: {
    regionName: 'Robot City',
    storyTitle: 'KS2 Computing — Year 4',
    storyText: 'Thirty-eight weeks: pseudocode, nested loops, data quests, internet models, and a capstone game — ages 8–9.',
    ages: 'Ages 8–9',
    icon: '🏙️',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#3b82f6 100%)',
    mainCharacter: 'professorByte',
    tagline: 'Problem-solving with code and data',
    completionBadge: '🥈',
    completionBadgeLabel: 'Year 4 Computing Graduate',
  },
  y5: {
    regionName: 'Global Network HQ',
    storyTitle: 'KS2 Computing — Year 5',
    storyText: 'Thirty-eight weeks including Python snippets, cyber scenarios, campaign projects, and capstone launch — ages 9–10.',
    ages: 'Ages 9–10',
    icon: '🌐',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#3b1f6e 0%,#8b5cf6 100%)',
    mainCharacter: 'bolt',
    tagline: 'Advanced programs and digital projects',
    completionBadge: '🥇',
    completionBadgeLabel: 'Year 5 Computing Graduate',
  },
  y6: {
    regionName: 'AI Research Centre',
    storyTitle: 'KS2 Computing — Year 6',
    storyText: 'Thirty-eight weeks: AI literacy, spreadsheets, Python functions, complete-system capstone, leavers showcase — ages 10–11.',
    ages: 'Ages 10–11',
    icon: '🔮',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg,#3b0764 0%,#a855f7 100%)',
    mainCharacter: 'vision',
    tagline: 'Expert projects and secondary bridge',
    completionBadge: '🏆',
    completionBadgeLabel: 'Year 6 Computing Graduate',
  },
};

function toLearnCourses() {
  const byYear = { y3, y4, y5, y6 };
  const out = {};
  for (const key of ['y3', 'y4', 'y5', 'y6']) {
    const lessons = byYear[key];
    const meta = COURSE_META[key];
    out[key] = {
      id: key,
      year: parseInt(key.slice(1), 10),
      ...meta,
      lessons,
      terms: KS2_TERM_RANGES[key],
      totalXP: lessons.reduce((s, l) => s + l.xp, 0),
      lessonCount: 38,
    };
  }
  return out;
}

function toCsCurriculumModule(lesson, modIndex) {
  const acts = lesson.bibleActivities.map((a, i) => ({
    num: i + 1,
    title: a.title,
    duration: '15 mins',
    desc: a.type,
    steps: a.steps,
  }));
  return {
    title: lesson.title,
    xp: lesson.xp,
    content: {
      explanation: lesson.teachScript || lesson.teach,
      example: lesson.codeDebug,
      activity: acts.map((a) => a.steps.join('\n')).join('\n\n'),
      keyWords: lesson.csTopics,
      activities: acts,
      extension: lesson.extension || lesson.reflection,
      reflection: lesson.reflection,
      objectives: lesson.objectives,
      ukCurriculum: lesson.ukCurriculum.map((code) => KS2_STATUTORY[code] || code),
      parentPrompt: lesson.parentPrompt,
    },
    quiz: lesson.quiz.map(({ q, options, answer, rationale }) => ({
      q,
      options,
      answer,
      rationale,
    })),
  };
}

function toCsCurriculumCourses() {
  const yearMeta = {
    3: { title: 'Year 3: CS Foundations', tagline: 'Algorithms, sequences, loops & debugging with robots', color: '#10B981', icon: '🤖' },
    4: { title: 'Year 4: CS Problem Solver', tagline: 'Variables, selection, data & game logic', color: '#3B82F6', icon: '🏙️' },
    5: { title: 'Year 5: CS Advanced', tagline: 'Modules, Python, networks & projects', color: '#8B5CF6', icon: '🌐' },
    6: { title: 'Year 6: CS Expert', tagline: 'AI literacy, systems & capstone', color: '#A855F7', icon: '🔮' },
  };
  return [3, 4, 5, 6].map((year) => {
    const lessons = { 3: y3, 4: y4, 5: y5, 6: y6 }[year];
    const meta = yearMeta[year];
    return {
      id: KS2_TRACKS[year],
      title: meta.title,
      tagline: meta.tagline,
      year: `Year ${year}`,
      color: meta.color,
      icon: meta.icon,
      totalXP: lessons.reduce((s, l) => s + l.xp, 0),
      modules: lessons.map((l, i) => toCsCurriculumModule(l, i)),
    };
  });
}

const learnOut = `// AUTO-GENERATED by scripts/build-ks2-curriculum-bible.mjs — do not edit by hand
// ByteBuddies Curriculum Bible: 152 lessons (38×4), KS2 England

export const KS2_LESSON_COUNT = 152;

export const KS2_COURSES = ${JSON.stringify(toLearnCourses(), null, 2)};

export const KS2_ALL_LESSONS = ${JSON.stringify(ALL, null, 2)};

export default KS2_COURSES;
`;

const csOut = `// AUTO-GENERATED by scripts/build-ks2-curriculum-bible.mjs — do not edit by hand
// 38 modules × 4 years — Curriculum Bible tracks

export const csCurriculumCourses = ${JSON.stringify(toCsCurriculumCourses(), null, 2)};

export default csCurriculumCourses;
`;

writeFileSync(join(root, 'src/data/ks2CurriculumLessons.js'), learnOut);
writeFileSync(join(root, 'src/data/csCurriculum.js'), csOut);

console.log('Wrote ks2CurriculumLessons.js (152 lessons) and csCurriculum.js (4×38 modules)');
