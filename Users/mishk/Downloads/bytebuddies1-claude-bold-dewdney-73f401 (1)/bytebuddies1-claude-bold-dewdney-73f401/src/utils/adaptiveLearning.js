/**
 * Adaptive learning utility for ByteBuddies.
 * Analyses quiz scores to identify weak areas and build personalised recommendations.
 */

/**
 * Returns modules where the student scored below the threshold.
 * @param {Object} quizScores - { 'courseId-moduleIndex': score% }
 * @param {Array}  courses    - full course data array
 * @param {number} threshold  - score below which a module is "weak" (default 70%)
 */
export function getWeakModules(quizScores, courses, threshold = 70) {
  const weak = [];
  for (const [key, score] of Object.entries(quizScores || {})) {
    if (score >= threshold) continue;
    const [courseId, moduleIndexStr] = key.split('-');
    const moduleIndex = parseInt(moduleIndexStr, 10);
    const course = courses.find(c => c.id === courseId);
    if (!course) continue;
    const module = course.modules?.[moduleIndex];
    if (!module) continue;
    weak.push({
      courseId,
      moduleIndex,
      score,
      courseTitle: course.title,
      moduleTitle: module.title,
      courseColor: course.color,
      courseIcon: course.icon,
      xp: module.xp,
    });
  }
  // Sort by lowest score first
  return weak.sort((a, b) => a.score - b.score);
}

/**
 * Builds the "What's Next" cards array for the Dashboard.
 * Weak-area review cards are prepended ahead of standard progression.
 */
export function buildWhatNextCards(weakModules, user) {
  const cards = [];

  // Review cards for weak modules (up to 2)
  const toReview = weakModules.slice(0, 2);
  for (const mod of toReview) {
    cards.push({
      id: `review-${mod.courseId}-${mod.moduleIndex}`,
      icon: '📖',
      title: `Review: ${mod.moduleTitle}`,
      desc: `You scored ${mod.score}% — try again to earn full XP!`,
      action: 'learn',
      color: '#f59e0b',
      badge: `${mod.score}%`,
      urgent: true,
    });
  }

  // Standard progression cards
  const standard = [
    {
      id: 'next-lesson',
      icon: '📚',
      title: 'Continue Learning',
      desc: 'Pick up where you left off in the Learning Hub',
      action: 'learn',
      color: '#6366f1',
    },
    {
      id: 'workspace',
      icon: '💻',
      title: 'Build Something',
      desc: 'Open the workspace and create a new project',
      action: 'workspace',
      color: '#8b5cf6',
    },
    {
      id: 'challenge',
      icon: '🏆',
      title: 'Take a Challenge',
      desc: 'Test your skills with a daily coding challenge',
      action: 'challenges',
      color: '#10b981',
    },
    {
      id: 'community',
      icon: '👥',
      title: 'Explore Community',
      desc: 'See what other students are building',
      action: 'community',
      color: '#06b6d4',
    },
  ];

  // Add standard cards (skip if already have 4+ from reviews)
  for (const card of standard) {
    if (cards.length >= 4) break;
    cards.push(card);
  }

  return cards.slice(0, 4);
}

/**
 * Determines a letter grade from an average score.
 */
export function scoreToGrade(avgScore) {
  if (avgScore >= 90) return { grade: 'A*', color: '#10b981' };
  if (avgScore >= 80) return { grade: 'A', color: '#22c55e' };
  if (avgScore >= 70) return { grade: 'B', color: '#6366f1' };
  if (avgScore >= 60) return { grade: 'C', color: '#f59e0b' };
  if (avgScore >= 50) return { grade: 'D', color: '#ef4444' };
  return { grade: 'E', color: '#dc2626' };
}

/**
 * Calculates overall course completion as a percentage.
 */
export function getCourseCompletion(quizScores, course) {
  const totalModules = course.modules?.length || 0;
  if (!totalModules) return 0;
  let completed = 0;
  for (let i = 0; i < totalModules; i++) {
    const key = `${course.id}-${i}`;
    if (quizScores[key] !== undefined) completed++;
  }
  return Math.round((completed / totalModules) * 100);
}
