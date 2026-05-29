/**
 * Course builder logic (used by prebuild script and dev regeneration).
 */
import { LESSON_CATALOG } from './lessonCatalog.js';
import { buildBetterQuiz } from './lessonInteractives.js';

const XP_BY_DIFFICULTY = { Beginner: 60, Intermediate: 100, Advanced: 150 };
const DURATION_BY_DIFFICULTY = { Beginner: '20 mins', Intermediate: '30 mins', Advanced: '40 mins' };

const BLOCK_CATEGORIES = new Set([
  'y3-block-coding', 'y3-storytelling', 'y3-music', 'y3-math', 'y3-animals', 'y3-sports',
  'y4-game-dev', 'y4-variables', 'y4-conditionals', 'y4-game-design',
]);
const PYTHON_CATEGORIES = new Set([
  'y5-python', 'y6-python', 'y5-algorithms', 'y6-algorithms', 'y5-ml', 'y6-ai-advanced',
]);
const HTML_CATEGORIES = new Set(['y4-web', 'y5-web', 'y6-web-pro']);

function pickSkills(categoryTitle, lessonTitle, difficulty) {
  const base = categoryTitle.split(/\s+/).slice(0, 2);
  const words = lessonTitle.replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 3);
  const skills = [...new Set([...words.slice(0, 2), ...base, difficulty === 'Advanced' ? 'problem solving' : 'creativity'])];
  return skills.slice(0, 5);
}

function buildExample(categoryId, lessonTitle) {
  if (BLOCK_CATEGORIES.has(categoryId)) {
    return `// ${lessonTitle}\nwhen 🚩 clicked\n  say "Let's learn: ${lessonTitle}!"\n  wait 1 secs\n  // Add your blocks here`;
  }
  if (PYTHON_CATEGORIES.has(categoryId)) {
    return `# ${lessonTitle}\nprint("Welcome to ${lessonTitle}!")\n# Your Python code here`;
  }
  if (HTML_CATEGORIES.has(categoryId)) {
    return `<!DOCTYPE html>\n<html>\n<head><title>${lessonTitle}</title></head>\n<body>\n  <h1>${lessonTitle}</h1>\n  <p>Your webpage content here.</p>\n</body>\n</html>`;
  }
  return `// ${lessonTitle}\n// Explore the concepts from this lesson in the Game Builder or your project.`;
}

function buildQuiz(lessonTitle, skills, categoryId, lessonIdx) {
  return buildBetterQuiz(lessonTitle, skills, categoryId, lessonIdx);
}

function buildModule(lesson, moduleIndex, category, yearMeta) {
  const difficulty = category.difficulty || yearMeta.defaultDifficulty;
  const skills = pickSkills(category.title, lesson.title, difficulty);
  const xp = XP_BY_DIFFICULTY[difficulty] + (moduleIndex % 3) * 10;
  const explanation = [
    `🎯 ${lesson.title}`,
    `${lesson.blurb}.`,
    `You'll explore ${category.title} (Year ${yearMeta.year}). Complete the interactive challenges on the right to earn XP and level up!`,
    `Ready to begin? Work through each challenge, then press "Finish reading" to continue. 🚀`,
  ].join('\n\n');

  return {
    title: lesson.title,
    completed: false,
    xp,
    duration: DURATION_BY_DIFFICULTY[difficulty],
    description: lesson.blurb,
    keySkills: skills,
    tags: [category.title, `Year ${yearMeta.year}`, difficulty],
    prerequisites: moduleIndex > 0 ? [`${category.title} — previous lesson`] : [],
    levels: [
      { id: 'read', type: 'read', label: 'Read', icon: '📖' },
      { id: 'practice', type: 'practice', label: 'Practice', icon: '💻' },
      { id: 'check', type: 'check', label: 'Check', icon: '✓' },
    ],
    content: {
      explanation,
      example: buildExample(category.id, lesson.title),
      activity: `Complete the **Practice** challenges, then try this in Game Builder:\n\n🌟 ${lesson.blurb}\n\n💡 Tip: Change one thing at a time and press Run to see what happens!`,
      keyWords: skills,
    },
    quiz: buildQuiz(lesson.title, skills, category.id, moduleIndex),
  };
}

function buildCategoryCourse(yearMeta, category) {
  const difficulty = category.difficulty || yearMeta.defaultDifficulty;
  const modules = category.lessons.map((lesson, i) =>
    buildModule(lesson, i, { ...category, difficulty }, yearMeta),
  );
  const totalXp = modules.reduce((s, m) => s + m.xp, 0);
  const hours = Math.max(1, Math.round((modules.length * 20) / 60));
  const topics = modules.slice(0, 8).map((m) => m.title);

  return {
    id: category.id,
    title: category.title,
    description: `Master ${category.title} with ${modules.length} interactive lessons for Year ${yearMeta.year} students. ${modules[0]?.description || 'Start your coding adventure!'}`,
    icon: category.icon,
    color: category.color,
    yearGroup: yearMeta.year,
    difficulty,
    lessons: modules.length,
    duration: `${hours} hour${hours > 1 ? 's' : ''}`,
    progress: 0,
    topics,
    tags: [category.title, `Year ${yearMeta.year}`, difficulty],
    modules,
    totalXp,
  };
}

export function buildCoursesFromCatalog(catalog = LESSON_CATALOG) {
  const built = [];
  catalog.forEach((yearMeta) => {
    yearMeta.categories.forEach((category) => {
      built.push(buildCategoryCourse(yearMeta, category));
    });
  });
  return built;
}
