/**
 * Runtime course data — pre-built JSON (fast load). Regenerate: npm run prebuild:courses
 */
import prebuiltCourses from './courses.prebuilt.json';
import { buildCoursesFromCatalog } from './courseBuilderCore.js';

export { buildCoursesFromCatalog };
export const courses = prebuiltCourses;
