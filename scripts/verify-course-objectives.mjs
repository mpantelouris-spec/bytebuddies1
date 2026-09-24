/**
 * verify-course-objectives.mjs — Find courses missing game objectives.
 * Run: node scripts/verify-course-objectives.mjs
 */
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const { COURSE_GAME_LOGIC, enrichCourseWithGameLogic } = await import(
  pathToFileURL(join(root, 'src/virtual-robot-designer/data/course-game-logic.js')).href
);
const { expandGameMissionsAsCourses } = await import(
  pathToFileURL(join(root, 'src/virtual-robot-designer/data/game-missions.js')).href
);
const { expandFlagshipCourses } = await import(
  pathToFileURL(join(root, 'src/virtual-robot-designer/data/flagship-courses.js')).href
);
const { expandRobotMissionsAsCourses, ALL_ROBOT_MISSIONS } = await import(
  pathToFileURL(join(root, 'src/virtual-robot-designer/data/robot-mission-campaign.js')).href
);

const page = readFileSync(join(root, 'src/virtual-robot-designer/studio/LiveLabPage.jsx'), 'utf8');
const storiesBlock = page.slice(page.indexOf('const COURSE_STORIES = {'), page.indexOf('};', page.indexOf('const COURSE_STORIES = {')) + 2);
const storyIds = new Set([...storiesBlock.matchAll(/^\s+(\w+[\w_]*):/gm)].map((m) => m[1]));

const block = page.slice(page.indexOf('const ALL_COURSES = ['), page.indexOf('];', page.indexOf('const ALL_COURSES = [')) + 2);
const inlineCourses = [];
const courseRe = /\{id:'([^']+)'(?:[^{}]|\{[^{}]*\})*?rec:\[([^\]]*)\]/g;
let m;
while ((m = courseRe.exec(block)) !== null) {
  inlineCourses.push({ id: m[1], rec: m[2].split(',').map((s) => s.replace(/['"\s]/g, '')).filter(Boolean) });
}

const byId = new Map();
[...expandGameMissionsAsCourses(), ...expandRobotMissionsAsCourses(), ...expandFlagshipCourses(), ...inlineCourses]
  .forEach((c) => byId.set(c.id, { ...byId.get(c.id), ...c }));
const ALL_COURSES = [...byId.values()];

const missionById = Object.fromEntries(ALL_ROBOT_MISSIONS.map((m) => [m.id, m]));

function hasObjectives(course) {
  const enriched = enrichCourseWithGameLogic(course);
  if (enriched.gameObjectives?.length) return true;
  if (course.isRobotMission) {
    const rm = missionById[course.id];
    if (rm?.primaryObjective?.text && !/^Complete /i.test(rm.primaryObjective.text)) return true;
    if (rm?.primaryObjective?.text) return 'generic';
    return false;
  }
  if (storyIds.has(course.id)) {
    const objMatch = storiesBlock.match(new RegExp(`${course.id}:[\\s\\S]*?objectives:\\[([^\\]]+)\\]`));
    if (objMatch) return true;
  }
  return false;
}

const missing = [];
const generic = [];
for (const c of ALL_COURSES) {
  const status = hasObjectives(c);
  if (status === 'generic') generic.push(c.id);
  else if (!status) missing.push({ id: c.id, name: c.name, cat: c.cat });
}

console.log(`Total courses: ${ALL_COURSES.length}`);
console.log(`COURSE_GAME_LOGIC entries: ${Object.keys(COURSE_GAME_LOGIC).length}`);
console.log(`COURSE_STORIES entries: ${storyIds.size}`);
console.log(`Missing objectives: ${missing.length}`);
console.log(`Generic campaign objectives: ${generic.length}`);
if (missing.length) {
  console.log('\n--- Missing ---');
  missing.slice(0, 40).forEach((c) => console.log(`  ${c.id} (${c.name})`));
  if (missing.length > 40) console.log(`  ... and ${missing.length - 40} more`);
}
if (generic.length) {
  console.log('\n--- Generic campaign ---');
  generic.slice(0, 20).forEach((id) => console.log(`  ${id}`));
  if (generic.length > 20) console.log(`  ... and ${generic.length - 20} more`);
}
