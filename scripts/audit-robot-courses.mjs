/**
 * Audit course counts per robot type (same filter as Live Lab picker).
 * Run: node scripts/audit-robot-courses.mjs
 */
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const { filterCoursesForRobot, ROBOT_REC_KEYS } = await import(
  pathToFileURL(join(root, 'src/virtual-robot-designer/data/course-game-logic.js')).href
);
const { expandGameMissionsAsCourses } = await import(
  pathToFileURL(join(root, 'src/virtual-robot-designer/data/game-missions.js')).href
);
const { expandFlagshipCourses } = await import(
  pathToFileURL(join(root, 'src/virtual-robot-designer/data/flagship-courses.js')).href
);
const { expandRobotMissionsAsCourses } = await import(
  pathToFileURL(join(root, 'src/virtual-robot-designer/data/robot-mission-campaign.js')).href
);

const page = readFileSync(join(root, 'src/virtual-robot-designer/studio/LiveLabPage.jsx'), 'utf8');
const block = page.slice(page.indexOf('const ALL_COURSES = ['), page.indexOf('];', page.indexOf('const ALL_COURSES = [')) + 2);
// Extract inline course objects (story worlds + ground/aerial blocks are string-defined)
const inlineCourses = [];
const courseRe = /\{id:'([^']+)'(?:[^{}]|\{[^{}]*\})*?rec:\[([^\]]*)\]/g;
let m;
while ((m = courseRe.exec(block)) !== null) {
  const rec = m[2].split(',').map((s) => s.replace(/['"\s]/g, '')).filter(Boolean);
  inlineCourses.push({ id: m[1], rec });
}

const byId = new Map();
[...expandGameMissionsAsCourses(), ...expandRobotMissionsAsCourses(), ...expandFlagshipCourses(), ...inlineCourses]
  .forEach((c) => byId.set(c.id, { ...byId.get(c.id), ...c }));
const ALL_COURSES = [...byId.values()];

const PROFILE_REC_KEYS = {
  rover: ['rover', 'race', 'delivery'],
  tank: ['tank', 'bulldozer', 'mining'],
  drone: ['drone', 'aerial', 'rescue'],
  jet: ['jet', 'aerial', 'stunt'],
  spider: ['spider', 'climbing', 'humanoid'],
  factory: ['factory', 'arm', 'assembly'],
  hover: ['hover', 'race', 'aerial'],
  underwater: ['underwater', 'submarine', 'ocean'],
  humanoid: ['humanoid', 'walker', 'temple'],
  security: ['security', 'stealth', 'patrol'],
  medbot: ['medbot', 'hospital', 'rescue'],
  firebot: ['firebot', 'fire', 'rescue'],
  racedrone: ['racedrone', 'race', 'aerial'],
  factorybot: ['factorybot', 'factory', 'assembly'],
  birdbot: ['birdbot'],
};

console.log('Robot type | Total | Campaign | Game | Catalog');
console.log('-----------|-------|----------|------|--------');
for (const t of Object.keys(PROFILE_REC_KEYS)) {
  const courses = filterCoursesForRobot(ALL_COURSES, t, PROFILE_REC_KEYS[t]);
  const camp = courses.filter((c) => c.isRobotMission).length;
  const game = courses.filter((c) => c.isGameMission).length;
  const catalog = courses.length - camp - game;
  const ok = courses.length >= 20 ? '✓' : courses.length >= 10 ? '~' : '⚠';
  console.log(`${ok} ${t.padEnd(9)}| ${String(courses.length).padStart(5)} | ${String(camp).padStart(8)} | ${String(game).padStart(4)} | ${String(catalog).padStart(7)}`);
}
