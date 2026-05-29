/**
 * Pre-build course modules at compile time (avoids freezing the browser on load).
 * Run: node scripts/prebuildCourses.mjs
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Dynamic import of builder (Node can't resolve .js from src without full path)
const { buildCoursesFromCatalog } = await import(
  `file://${join(root, 'src/data/courseBuilderCore.js')}`
);

console.log('Building courses from catalog...');
const t0 = Date.now();
const courses = buildCoursesFromCatalog();
console.log(`Built ${courses.length} courses, ${courses.reduce((s, c) => s + c.modules.length, 0)} lessons in ${Date.now() - t0}ms`);

const outPath = join(root, 'src/data/courses.prebuilt.json');
writeFileSync(outPath, JSON.stringify(courses));
console.log(`Wrote ${outPath} (${(JSON.stringify(courses).length / 1024 / 1024).toFixed(2)} MB)`);
