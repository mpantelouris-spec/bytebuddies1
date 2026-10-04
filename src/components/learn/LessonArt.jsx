import React from 'react';
import DotBot from './art/DotBot.jsx';
import LessonScene from './art/LessonScene.jsx';
import { COURSES } from '../../data/learnKs2Courses.js';
import { getTeaching } from '../../data/teaching/index.js';
import { topicFor } from '../../data/funActivities.js';


export const THEMES = {
  safety: { bg: '#dbeafe', wall: '#dbeafe', accent: '#0f766e', ink: '#134e4a', label: 'Stay safe' },
  algorithm: { bg: '#ffedd5', wall: '#ffedd5', accent: '#b45309', ink: '#7c2d12', label: 'Step by step' },
  sequence: { bg: '#e0e7ff', wall: '#e0e7ff', accent: '#4338ca', ink: '#1e1b4b', label: 'In order' },
  debug: { bg: '#d1fae5', wall: '#d1fae5', accent: '#047857', ink: '#064e3b', label: 'Fix the bug' },
  loop: { bg: '#f3e8ff', wall: '#f3e8ff', accent: '#7e22ce', ink: '#581c87', label: 'Repeat it' },
  event: { bg: '#dcfce7', wall: '#dcfce7', accent: '#15803d', ink: '#14532d', label: 'Make it start' },
  data: { bg: '#cffafe', wall: '#cffafe', accent: '#0e7490', ink: '#164e63', label: 'Facts & charts' },
  search: { bg: '#e2e8f0', wall: '#e2e8f0', accent: '#334155', ink: '#0f172a', label: 'Check sources' },
  kindness: { bg: '#ffe4e6', wall: '#ffe4e6', accent: '#be123c', ink: '#881337', label: 'Be kind' },
  network: { bg: '#dbeafe', wall: '#dbeafe', accent: '#1d4ed8', ink: '#1e3a8a', label: 'Connected' },
  selection: { bg: '#fef3c7', wall: '#fef3c7', accent: '#a16207', ink: '#713f12', label: 'If / else' },
  robot: { bg: '#e0f2fe', wall: '#e0f2fe', accent: '#0369a1', ink: '#0c4a6e', label: 'Robots' },
  art: { bg: '#f3e8ff', wall: '#f3e8ff', accent: '#6d28d9', ink: '#4c1d95', label: 'Make art' },
  variable: { bg: '#fef3c7', wall: '#fef3c7', accent: '#b45309', ink: '#78350f', label: 'Store a value' },
  python: { bg: '#d1fae5', wall: '#d1fae5', accent: '#047857', ink: '#064e3b', label: 'Python' },
  project: { bg: '#ffedd5', wall: '#ffedd5', accent: '#c2410c', ink: '#7c2d12', label: 'Build it' },
  review: { bg: '#e0e7ff', wall: '#e0e7ff', accent: '#3730a3', ink: '#1e1b4b', label: 'Show what you know' },
  privacy: { bg: '#e0f2fe', wall: '#e0f2fe', accent: '#0f766e', ink: '#134e4a', label: 'Keep private' },
  charter: { bg: '#ccfbf1', wall: '#ccfbf1', accent: '#0f766e', ink: '#134e4a', label: 'Class rules' },
  meetDot: { bg: '#ccfbf1', wall: '#ccfbf1', accent: '#0f766e', ink: '#134e4a', label: 'Meet Dot' },
  default: { bg: '#e0f2fe', wall: '#e0f2fe', accent: '#0f766e', ink: '#134e4a', label: 'Computing' },
};

export function lessonThemeId(lesson) {
  const t = `${lesson?.title || ''} ${(lesson?.csTopics || []).join(' ')} ${(lesson?.ukCurriculum || []).join(' ')} ${lesson?.conceptName || ''} ${lesson?.kind || ''}`.toLowerCase();
  if (lesson?.kind === 'review') return 'review';
  if (lesson?.kind === 'capstone' || lesson?.kind === 'showcase' || lesson?.kind === 'mini') return 'project';
  if (/python/.test(t)) return 'python';
  if (/safe|private|password|citizen|dl-1|cyber/.test(t)) return 'safety';
  if (/kind|bully|comment|respect|footprint/.test(t)) return 'kindness';
  if (/debug|bug|error|fix/.test(t)) return 'debug';
  if (/loop|repeat|nested|iteration/.test(t)) return 'loop';
  if (/event|green flag|click|trigger/.test(t)) return 'event';
  if (/search|website|source|bias|trust/.test(t)) return 'search';
  if (/data|survey|chart|tally|spreadsheet|database|list/.test(t)) return 'data';
  if (/network|internet|packet|wifi|connect/.test(t)) return 'network';
  if (/\bif\b|select|boolean|condition|decision/.test(t)) return 'selection';
  if (/robot|sensor|simulate|autonomous/.test(t)) return 'robot';
  if (/art|pen|pattern|photo|media|animate|paint/.test(t)) return 'art';
  if (/variable|score|counter|store/.test(t)) return 'variable';
  if (/algorithm|pseudo|recipe|sequence|order|decomp|plan/.test(t)) return 'algorithm';
  if (/block|sprite|scratch|code|program/.test(t)) return 'sequence';
  return lesson?.codingLab ? 'sequence' : 'default';
}

/** What to draw for a slide: the lesson itself plus which slide it is. */
export function pictureForSlide(lesson, slideId = 'title') {
  return { lessonId: lesson?.id, slide: slideId };
}

/** Dot, the Learn robot (see art/DotBot.jsx). */
export function Dot({ x = 0, y = 0, scale = 1, flip = false, pose = 'idle', mood }) {
  return <DotBot x={x} y={y} scale={scale} flip={flip} pose={pose} mood={mood} />;
}

export function MeetDotPortrait({ size = 200 }) {
  return (
    <svg viewBox="-14 -14 128 186" width={size} height={size * 1.45} aria-hidden style={{ display: 'block', maxWidth: 150, flexShrink: 0 }}>
      <DotBot pose="wave" />
    </svg>
  );
}

const WORLD_TOPIC = { algorithm: 'algorithms', network: 'network', python: 'python', project: 'project' };

export function LessonPicture({ theme, style, className, wide }) {
  let scene;
  if (theme && typeof theme === 'object' && theme.lessonId) {
    const [yr, w] = theme.lessonId.split('-w');
    const idx = parseInt(w, 10) - 1;
    const lesson = COURSES[yr]?.lessons?.[idx];
    scene = <LessonScene topic={topicFor(lesson)} lesson={lesson} teaching={getTeaching(yr, idx)} slide={theme.slide || 'title'} wide={wide} />;
  } else {
    scene = <LessonScene topic={WORLD_TOPIC[theme] || theme || 'algorithms'} slide="title" wide={wide} />;
  }
  return (
    <div className={className} style={{
      overflow: 'hidden', minHeight: 0, height: '100%', alignSelf: 'stretch',
      display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0f2fe', ...style,
    }}>
      {scene}
    </div>
  );
}
