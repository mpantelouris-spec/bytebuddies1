/** Challenge courses — legacy export + smart-stage integration */
import { getCoursesForProfile, getCourseDisplay, COURSE_DISPLAY } from './smart-stage-courses.js';
import { analyzeRobot } from '../services/robot-profile.js';

/** @deprecated Use analyzeRobot(design).courses — kept for backward compatibility */
export const TEST_ARENA_COURSES = Object.entries(COURSE_DISPLAY).map(([id, meta]) => ({
  id,
  ...meta,
}));

export function getCourseMeta(id) {
  return getCourseDisplay(id);
}

/** Courses tailored to the child's current robot build. */
export function getSmartCoursesForDesign(design) {
  return analyzeRobot(design).courses;
}

export function getDefaultCourseForDesign(design) {
  return analyzeRobot(design).defaultCourseId;
}

export { getCoursesForProfile, getCourseDisplay };
