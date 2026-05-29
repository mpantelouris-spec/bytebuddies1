/**
 * Code.org-style Learn UI: Years → Units → Lesson path → Level player (Read / Practice / Check).
 */
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { courses } from '../../data/courseData';
import { useUser } from '../../contexts/UserContext';
import { INTERACTIVE } from '../../data/interactiveContent';
import { getReadInteractives, getPracticeInteractives, getPracticeMode } from '../../data/lessonInteractives';
import { LessonInteractivePanel } from './LessonInteractives';
import PythonRunner from '../PythonRunner';
import HtmlEditor from '../HtmlEditor';

function darkenColor(hex, factor = 0.25) {
  if (!hex || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * (1 - factor))}, ${Math.round(g * (1 - factor))}, ${Math.round(b * (1 - factor))})`;
}

function pathGradient(color) {
  if (!color || color.length < 7) return 'linear-gradient(180deg, #3d3d9e 0%, #5b5bd6 40%, #7c5cbf 100%)';
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `linear-gradient(180deg, rgb(${Math.round(r*0.55)},${Math.round(g*0.55)},${Math.round(b*0.55)}) 0%, rgb(${r},${g},${b}) 40%, rgb(${Math.round(r*0.75)},${Math.round(g*0.75)},${Math.round(b*0.75)}) 100%)`;
}

const YEAR_META = [
  {
    year: 3, title: 'CS Fundamentals', subtitle: 'Year 3', ages: 'Ages 8–9',
    color: '#5b5bd6', gradient: 'linear-gradient(135deg, #5b5bd6 0%, #7c3aed 100%)', icon: '🌱',
    blurb: 'Start your coding adventure with blocks, pixel art, and digital stories.',
    flavor: 'No typing needed — drag colourful blocks to bring sprites to life! Every lesson has fun challenges and a mini quiz.',
    activities: ['🧩 Block Coding', '🎨 Pixel Art', '📖 Storytelling', '🎵 Music', '🧮 Maths Games'],
    skills: ['Sequences', 'Loops', 'Events', 'Creativity'],
    startHint: 'Perfect for complete beginners — start here!',
  },
  {
    year: 4, title: 'CS Discoveries', subtitle: 'Year 4', ages: 'Ages 9–10',
    color: '#e11d8f', gradient: 'linear-gradient(135deg, #db2777 0%, #f97316 100%)', icon: '🚀',
    blurb: 'Build real games, design web pages, and discover how the internet works.',
    flavor: 'Create games with score, lives, and levels. Then build your first real web page using HTML.',
    activities: ['🎮 Game Design', '🌐 Web Pages', '🔢 Variables', '🔒 Cybersecurity', '🤖 AI Basics'],
    skills: ['Variables', 'Conditionals', 'HTML Basics', 'Game Logic'],
    startHint: 'You\'ve done Year 3? Level up here!',
  },
  {
    year: 5, title: 'CS Principles', subtitle: 'Year 5', ages: 'Ages 10–11',
    color: '#059669', gradient: 'linear-gradient(135deg, #059669 0%, #06b6d4 100%)', icon: '⚡',
    blurb: 'Learn Python, design websites, sort data, and solve algorithm challenges.',
    flavor: 'Type real Python code, run it instantly, and see your output. Think like a professional developer!',
    activities: ['🐍 Python Coding', '🌐 Web Design', '📊 Data & Lists', '🔢 Algorithms', '🤖 Machine Learning Intro'],
    skills: ['Python', 'Functions', 'Data Structures', 'Algorithms'],
    startHint: 'Ready for real programming? Start here.',
  },
  {
    year: 6, title: 'CS Capstone', subtitle: 'Year 6', ages: 'Ages 11–12',
    color: '#d97706', gradient: 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)', icon: '🏆',
    blurb: 'Master advanced Python, explore AI, and build your capstone project.',
    flavor: 'Train AI models, call web APIs, and build full apps — real-world developer challenges.',
    activities: ['🤖 AI & Machine Learning', '🏆 Competitive Coding', '☁️ Cloud & APIs', '📱 App Development', '🔐 Advanced Security'],
    skills: ['Advanced Python', 'AI Concepts', 'Data Science', 'APIs & Cloud'],
    startHint: 'The ultimate challenge — graduate-level thinking!',
  },
];

const PYTHON_COURSE_IDS = /^y(5-python|6-python|5-ml|6-ai|5-algorithms|6-algorithms|6-competitive)/;
const HTML_COURSE_IDS = /-(web|web-pro)$/;

function getDefaultEditorType(courseId) {
  if (PYTHON_COURSE_IDS.test(courseId)) return 'python';
  if (HTML_COURSE_IDS.test(courseId)) return 'html';
  if (/^y[34]-/.test(courseId) || courseId.startsWith('y3-')) return 'blocks';
  return null;
}

function getUnitTypeBadge(courseId) {
  if (HTML_COURSE_IDS.test(courseId)) return { label: '🌐 HTML/CSS', color: '#06b6d4' };
  if (PYTHON_COURSE_IDS.test(courseId)) return { label: '🐍 Python', color: '#10b981' };
  if (/^y[34]-/.test(courseId) || courseId.startsWith('y3-')) return { label: '🧩 Blocks', color: '#6366f1' };
  return { label: '💡 Interactive', color: '#f59e0b' };
}

function moduleKey(courseId, lessonIdx) {
  return `${courseId}-${lessonIdx}`;
}

function levelKey(courseId, lessonIdx, levelIdx) {
  return `${courseId}-${lessonIdx}-L${levelIdx}`;
}

function getCompletedLessons(completedSet, course) {
  return course.modules.filter((_, i) => completedSet.has(moduleKey(course.id, i))).length;
}

function isLessonUnlocked(completedSet, course, lessonIdx) {
  if (lessonIdx === 0) return true;
  return completedSet.has(moduleKey(course.id, lessonIdx - 1));
}

function simplifyText(text) {
  const flat = (text || '').replace(/\n+/g, ' ').trim();
  const parts = flat.match(/[^.!?]+[.!?]+(\s|$)/g) || [flat];
  return parts.slice(0, 2).join(' ').trim();
}

/** Convert **bold** markdown to <strong> and newlines to <br> for safe inline display. */
function md(text) {
  return (text || '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

/** ——— Year catalog (Code.org home) ——— */
export function CodeOrgYearCatalog({ completedSet, onSelectYear, onContinue }) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return (
      <div className="corg-catalog" style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ fontSize: 18, fontWeight: 700 }}>Loading lessons…</p>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>If this stays blank, refresh the page.</p>
      </div>
    );
  }

  const continueTarget = useMemo(() => {
    for (const y of YEAR_META) {
      const units = courses.filter((c) => c.yearGroup === y.year);
      for (const course of units) {
        const done = getCompletedLessons(completedSet, course);
        if (done > 0 && done < course.modules.length) {
          const nextIdx = done;
          return { year: y, course, lessonIdx: nextIdx };
        }
      }
    }
    return null;
  }, [completedSet]);

  return (
    <div className="corg-catalog">
      <div className="corg-catalog-hero">
        <h1>Learn to code, step by step 🚀</h1>
        <p>Pick your year group and follow the lesson path. Each lesson has reading, hands-on practice, and a quiz checkpoint.</p>
        {continueTarget && onContinue && (
          <button type="button" className="corg-btn-continue" onClick={() => onContinue(continueTarget)}>
            ▶ Continue: {continueTarget.course.modules[continueTarget.lessonIdx]?.title || 'Next lesson'}
          </button>
        )}
      </div>
      <div className="corg-year-grid">
        {YEAR_META.map((y) => {
          const units = courses.filter((c) => c.yearGroup === y.year);
          const totalLessons = units.reduce((s, c) => s + c.modules.length, 0);
          const doneLessons = units.reduce((s, c) => s + getCompletedLessons(completedSet, c), 0);
          const pct = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
          return (
            <button
              key={y.year}
              type="button"
              className="corg-year-card"
              style={{ background: y.gradient }}
              onClick={() => onSelectYear(y.year)}
            >
              <span className="corg-year-card-icon">{y.icon}</span>
              <div className="corg-year-card-body">
                <div className="corg-year-card-tag">{y.subtitle} · {y.ages}</div>
                <h2>{y.title}</h2>
                <p>{y.blurb}</p>
                <div className="corg-year-activities">
                  {y.activities.map((act) => (
                    <span key={act} className="corg-year-activity-chip">{act}</span>
                  ))}
                </div>
                <div className="corg-year-card-meta" style={{ marginTop: 10 }}>
                  <span>{units.length} units</span>
                  <span>{totalLessons} lessons</span>
                  <span>{pct}% complete</span>
                </div>
                <div className="corg-year-card-bar">
                  <div style={{ width: `${pct}%` }} />
                </div>
                {y.startHint && pct === 0 && (
                  <div className="corg-year-start-hint">{y.startHint}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** ——— Unit list for a year ——— */
export function CodeOrgUnitList({ year, completedSet, onSelectUnit, onBack }) {
  const meta = YEAR_META.find((y) => y.year === year);
  const units = courses.filter((c) => c.yearGroup === year);

  return (
    <div className="corg-units-page">
      <nav className="corg-breadcrumb">
        <button type="button" onClick={onBack}>All courses</button>
        <span>›</span>
        <span>Year {year}</span>
      </nav>

      {/* Year-flavored welcome banner */}
      {meta && (
        <div className="corg-year-banner" style={{ background: meta.gradient }}>
          <div className="corg-year-banner-inner">
            <span className="corg-year-banner-icon">{meta.icon}</span>
            <div>
              <h2 className="corg-year-banner-title">{meta.title} — {meta.ages}</h2>
              <p className="corg-year-banner-flavor">{meta.flavor}</p>
              <div className="corg-year-banner-skills">
                {meta.skills.map((s) => (
                  <span key={s} className="corg-year-banner-skill">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="corg-units-header" style={{ borderColor: meta?.color }}>
        <span className="corg-units-icon">{meta?.icon}</span>
        <div>
          <h1>{meta?.title || `Year ${year}`}</h1>
          <p>{meta?.ages} · {units.length} units · {units.reduce((s, c) => s + c.modules.length, 0)} lessons</p>
        </div>
      </header>
      <div className="corg-unit-list">
        {units.map((course, unitIdx) => {
          const done = getCompletedLessons(completedSet, course);
          const pct = Math.round((done / course.modules.length) * 100);
          const complete = done === course.modules.length;
          const typeBadge = getUnitTypeBadge(course.id);
          return (
            <button
              key={course.id}
              type="button"
              className="corg-unit-row"
              onClick={() => onSelectUnit(course)}
            >
              <div className="corg-unit-num" style={{ background: course.color }}>Unit {unitIdx + 1}</div>
              <span className="corg-unit-icon">{course.icon}</span>
              <div className="corg-unit-info">
                <h3>{course.title}</h3>
                <p>{simplifyText(course.description)}</p>
                <div className="corg-unit-progress">
                  <div className="corg-unit-progress-bar"><div style={{ width: `${pct}%`, background: course.color }} /></div>
                  <span>{done}/{course.modules.length} lessons{complete ? ' · ✓' : ''}</span>
                </div>
                <div className="corg-unit-extras">
                  <span className="corg-unit-diff" style={{ background: `${course.color}20`, color: course.color }}>{course.difficulty}</span>
                  <span className="corg-unit-type-badge" style={{ background: `${typeBadge.color}18`, color: typeBadge.color, border: `1px solid ${typeBadge.color}30` }}>{typeBadge.label}</span>
                  <span className="corg-unit-xp">⚡ {course.modules.reduce((s, m) => s + (m.xp || 0), 0)} XP</span>
                </div>
              </div>
              <span className="corg-unit-arrow">→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** ——— Lesson path (zigzag bubbles) ——— */
export function CodeOrgLessonPath({ course, completedSet, onSelectLesson, onBack }) {
  const pathRef = useRef(null);
  const nodeH = 88;
  const pathH = course.modules.length * nodeH + 80;

  const nodes = course.modules.map((m, i) => {
    const key = moduleKey(course.id, i);
    const done = completedSet.has(key);
    const unlocked = isLessonUnlocked(completedSet, course, i);
    return { m, i, done, unlocked, key };
  });
  const currentIdx = nodes.findIndex((n) => n.unlocked && !n.done);
  nodes.forEach((n, i) => { n.isCurrent = i === currentIdx; });

  return (
    <div className="corg-path-page" style={{ '--unit-color': course.color, background: pathGradient(course.color) }}>
      <nav className="corg-breadcrumb corg-breadcrumb-light">
        <button type="button" onClick={onBack}>Year {course.yearGroup}</button>
        <span>›</span>
        <span>{course.title}</span>
      </nav>
      <div className="corg-path-header">
        <span>{course.icon}</span>
        <div>
          <h1>{course.title}</h1>
          <p>{course.modules.length} lessons · {course.difficulty} · {getUnitTypeBadge(course.id).label}</p>
        </div>
      </div>
      <div className="corg-path-scroll" ref={pathRef}>
        <div className="corg-path-canvas" style={{ minHeight: pathH }}>
          <svg className="corg-path-lines" width="100%" height={pathH} preserveAspectRatio="none">
            {nodes.slice(0, -1).map((n, i) => {
              const x1 = i % 2 === 0 ? 28 : 72;
              const x2 = (i + 1) % 2 === 0 ? 28 : 72;
              const y1 = 56 + i * nodeH;
              const y2 = 56 + (i + 1) * nodeH;
              const on = n.done;
              return (
                <line
                  key={i}
                  x1={`${x1}%`}
                  y1={y1}
                  x2={`${x2}%`}
                  y2={y2}
                  stroke={on ? '#22c55e' : 'rgba(255,255,255,0.25)'}
                  strokeWidth={on ? 4 : 3}
                  strokeDasharray={on ? undefined : '8 6'}
                />
              );
            })}
          </svg>
          {nodes.map(({ m, i, done, unlocked, isCurrent }) => (
            <button
              key={i}
              type="button"
              disabled={!unlocked}
              className={`corg-path-node ${done ? 'done' : ''} ${isCurrent ? 'current' : ''} ${!unlocked ? 'locked' : ''}`}
              style={{ top: 24 + i * nodeH, left: i % 2 === 0 ? '12%' : '58%' }}
              onClick={() => unlocked && onSelectLesson(i)}
            >
              <span className="corg-path-node-inner">
                {!unlocked ? '🔒' : done ? '✓' : i + 1}
              </span>
              <span className="corg-path-node-label">{m.title}</span>
              {m.duration && <span className="corg-path-node-time">⏱ {m.duration}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Block Snap Practice — interactive mini block-coding environment
// Kids click blocks to build a program, press Run, and watch a
// character animate across a grid to complete a mission.
// ─────────────────────────────────────────

const SNAP_MISSIONS = [
  { goal: 'Guide the robot to the star!',      target: { col: 6, row: 2 }, tEmoji: '⭐', char: '🤖', hint: 'Use Move Right blocks.' },
  { goal: 'Help the cat reach the fish!',       target: { col: 5, row: 4 }, tEmoji: '🐟', char: '🐱', hint: 'Combine Right and Down.' },
  { goal: 'Fly the rocket to the moon!',        target: { col: 7, row: 0 }, tEmoji: '🌙', char: '🚀', hint: 'Go right, then go up!' },
  { goal: 'Bring the bee to the flower!',       target: { col: 4, row: 0 }, tEmoji: '🌸', char: '🐝', hint: 'Go up first, then right!' },
  { goal: 'Help the dog find the bone!',        target: { col: 3, row: 5 }, tEmoji: '🦴', char: '🐶', hint: 'Go right AND down.' },
  { goal: 'Dance! Try some turn blocks!',       target: null,               tEmoji: null, char: '🎭', hint: 'Try Turn Left and Turn Right!' },
  { goal: 'Lead the frog to the lily pad!',     target: { col: 2, row: 4 }, tEmoji: '🌿', char: '🐸', hint: 'Just a few hops needed!' },
  { goal: 'Get the lion to the trophy!',        target: { col: 7, row: 0 }, tEmoji: '🏆', char: '🦁', hint: 'Up first, then all the way right!' },
  { goal: 'Bring the penguin to the igloo!',    target: { col: 5, row: 5 }, tEmoji: '🏠', char: '🐧', hint: 'Waddle right AND down.' },
  { goal: 'Help the alien reach the UFO!',      target: { col: 7, row: 3 }, tEmoji: '🛸', char: '👽', hint: 'Beam up — go right!' },
];

const SNAP_BLOCKS = [
  { id: 'move_right', label: 'Move Right', color: '#6366f1', icon: '→' },
  { id: 'move_left',  label: 'Move Left',  color: '#6366f1', icon: '←' },
  { id: 'move_up',    label: 'Move Up',    color: '#6366f1', icon: '↑' },
  { id: 'move_down',  label: 'Move Down',  color: '#6366f1', icon: '↓' },
  { id: 'turn_right', label: 'Turn Right', color: '#f59e0b', icon: '↻' },
  { id: 'turn_left',  label: 'Turn Left',  color: '#f59e0b', icon: '↺' },
  { id: 'say_hi',     label: 'Say "Hi!"',  color: '#ec4899', icon: '💬' },
  { id: 'celebrate',  label: 'Celebrate!', color: '#10b981', icon: '🎉' },
];

function BlockSnapPractice({ course, lessonIdx, onMissionComplete }) {
  const COLS = 8, ROWS = 6, CELL = 44;
  const mission = useMemo(() => SNAP_MISSIONS[lessonIdx % SNAP_MISSIONS.length], [lessonIdx]);
  const INITIAL = useMemo(() => ({ col: 0, row: Math.floor(ROWS / 2), dir: 0 }), []);

  const [workspace, setWorkspace] = useState([]);
  const [frames, setFrames] = useState([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [pos, setPos] = useState(INITIAL);
  const [trail, setTrail] = useState([]);
  const [running, setRunning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [speech, setSpeech] = useState(null);

  const compile = useCallback((blocks) => {
    let cur = { ...INITIAL, speech: null };
    const result = [{ ...cur }];
    blocks.forEach((b) => {
      const nxt = { ...cur, speech: null };
      if      (b.id === 'move_right') nxt.col = Math.min(COLS - 1, cur.col + 1);
      else if (b.id === 'move_left')  nxt.col = Math.max(0,        cur.col - 1);
      else if (b.id === 'move_up')    nxt.row = Math.max(0,        cur.row - 1);
      else if (b.id === 'move_down')  nxt.row = Math.min(ROWS - 1, cur.row + 1);
      else if (b.id === 'turn_right') nxt.dir  = cur.dir + 90;
      else if (b.id === 'turn_left')  nxt.dir  = cur.dir - 90;
      else if (b.id === 'say_hi')     nxt.speech = 'Hi! 👋';
      else if (b.id === 'celebrate')  nxt.speech = '🎉 Woohoo!';
      cur = nxt;
      result.push({ ...nxt });
    });
    return result;
  }, [INITIAL]);

  const run = () => {
    if (workspace.length === 0 || running) return;
    const compiled = compile(workspace);
    setFrames(compiled);
    setPos({ ...INITIAL });
    setTrail([]);
    setSuccess(false);
    setSpeech(null);
    setRunning(true);
    setFrameIdx(0);
  };

  const reset = () => {
    setWorkspace([]);
    setFrameIdx(-1);
    setPos({ ...INITIAL });
    setTrail([]);
    setRunning(false);
    setSuccess(false);
    setSpeech(null);
  };

  const targetCol = mission.target?.col ?? null;
  const targetRow = mission.target?.row ?? null;

  // Animation tick — advance one frame every 450 ms
  useEffect(() => {
    if (frameIdx < 0 || frameIdx >= frames.length) return;
    const frame = frames[frameIdx];
    setPos(frame);
    setTrail((prev) => {
      const key = `${frame.col},${frame.row}`;
      return prev.some((p) => `${p.col},${p.row}` === key) ? prev : [...prev, { col: frame.col, row: frame.row }];
    });
    if (frame.speech) setSpeech(frame.speech);
    if (targetCol !== null && frame.col === targetCol && frame.row === targetRow) {
      setSuccess(true);
      onMissionComplete?.();
    }
    if (frameIdx < frames.length - 1) {
      const t = setTimeout(() => setFrameIdx((i) => i + 1), 450);
      return () => clearTimeout(t);
    } else {
      setRunning(false);
      setFrameIdx(-1);
      if (targetCol === null && workspace.length >= 2) {
        setSuccess(true);
        onMissionComplete?.();
      }
    }
  }, [frameIdx, frames, targetCol, targetRow, workspace.length, onMissionComplete]);

  // Auto-clear speech bubble after 2 s
  useEffect(() => {
    if (!speech) return;
    const t = setTimeout(() => setSpeech(null), 2200);
    return () => clearTimeout(t);
  }, [speech]);

  const gridW = COLS * CELL;
  const gridH = ROWS * CELL;

  return (
    <div style={{ padding: '14px 18px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10, boxSizing: 'border-box', background: 'var(--bg-secondary)' }}>
      {/* Mission banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: `${course.color}14`, border: `1.5px solid ${course.color}35`, borderRadius: 10, padding: '10px 16px', flexShrink: 0 }}>
        <span style={{ fontSize: 26, lineHeight: 1 }}>{mission.char}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: course.color }}>🎯 {mission.goal}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>💡 {mission.hint}</div>
        </div>
        {success && (
          <div style={{ background: '#22c55e', color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 800, flexShrink: 0, animation: 'snap-success 0.4s ease' }}>
            ✓ Mission Complete!
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0 }}>

        {/* ── Block palette ── */}
        <div style={{ width: 132, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2 }}>Blocks</div>
          {SNAP_BLOCKS.map((b) => (
            <button
              key={b.id}
              onClick={() => !running && setWorkspace((w) => [...w, { ...b, uid: `${b.id}-${Date.now()}-${Math.random()}` }])}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                padding: '8px 10px', border: `2px solid ${b.color}44`,
                borderRadius: 9, background: `${b.color}18`,
                color: b.color, fontWeight: 700, fontSize: 12,
                cursor: running ? 'not-allowed' : 'pointer', transition: 'all 0.12s',
                opacity: running ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 14 }}>{b.icon}</span>
              <span>{b.label}</span>
            </button>
          ))}
        </div>

        {/* ── Program workspace ── */}
        <div style={{ width: 164, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            My Program {workspace.length > 0 ? `(${workspace.length})` : ''}
          </div>
          <div style={{ flex: 1, background: 'var(--bg-primary)', border: '2px dashed var(--border-color)', borderRadius: 10, padding: 6, overflowY: 'auto' }}>
            {workspace.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.7 }}>
                👆 Click blocks<br />to build your<br />program here!
              </div>
            ) : (
              workspace.map((b, i) => (
                <div
                  key={b.uid}
                  onClick={() => !running && setWorkspace((w) => w.filter((x) => x.uid !== b.uid))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px',
                    margin: '2px 0', background: `${b.color}14`, border: `1.5px solid ${b.color}40`,
                    borderRadius: 7, cursor: running ? 'default' : 'pointer', fontSize: 11,
                    fontWeight: 700, color: b.color, transition: 'opacity 0.1s',
                  }}
                >
                  <span style={{ background: b.color, color: '#fff', borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, fontWeight: 900 }}>{i + 1}</span>
                  <span style={{ fontSize: 12 }}>{b.icon}</span>
                  <span style={{ flex: 1 }}>{b.label}</span>
                  {!running && <span style={{ opacity: 0.3, fontSize: 9 }}>✕</span>}
                </div>
              ))
            )}
          </div>
          {/* Run / Reset */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={run}
              disabled={running || workspace.length === 0}
              style={{
                flex: 1, padding: '9px 4px', border: 'none', borderRadius: 9,
                fontWeight: 800, fontSize: 13, transition: 'all 0.15s',
                cursor: running || workspace.length === 0 ? 'not-allowed' : 'pointer',
                background: running ? '#6b7280' : success ? '#22c55e' : '#22c55e',
                color: '#fff', boxShadow: running ? 'none' : '0 3px 0 #16a34a',
              }}
            >
              {running ? '⏳ Running…' : '▶ Run'}
            </button>
            <button
              onClick={reset}
              disabled={running}
              title="Reset"
              style={{ padding: '9px 12px', border: '1.5px solid var(--border-color)', borderRadius: 9, fontWeight: 800, fontSize: 14, cursor: running ? 'not-allowed' : 'pointer', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', transition: 'all 0.15s' }}
            >
              ↺
            </button>
          </div>
        </div>

        {/* ── Grid canvas ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'relative', width: gridW, height: gridH, flexShrink: 0 }}>

            {/* Grid cells */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`, border: '2px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', background: '#0f172a', width: gridW, height: gridH }}>
              {Array.from({ length: ROWS * COLS }, (_, idx) => {
                const col = idx % COLS;
                const row = Math.floor(idx / COLS);
                const isTarget = targetCol === col && targetRow === row;
                const isTrail = trail.some((p) => p.col === col && p.row === row);
                const isStart = col === INITIAL.col && row === INITIAL.row;
                return (
                  <div
                    key={idx}
                    style={{
                      width: CELL, height: CELL, boxSizing: 'border-box',
                      border: '1px solid rgba(255,255,255,0.04)',
                      background: isTarget && success
                        ? 'rgba(34,197,94,0.3)'
                        : isTarget
                        ? 'rgba(245,158,11,0.2)'
                        : isTrail
                        ? `${course.color}28`
                        : isStart && trail.length === 0
                        ? 'rgba(255,255,255,0.04)'
                        : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, transition: 'background 0.3s',
                    }}
                  >
                    {isTarget && (success ? '✨' : mission.tEmoji)}
                  </div>
                );
              })}
            </div>

            {/* Character */}
            <div
              style={{
                position: 'absolute',
                left: pos.col * CELL + CELL / 2,
                top: pos.row * CELL + CELL / 2,
                transform: `translate(-50%, -50%) rotate(${pos.dir}deg)`,
                fontSize: 26, lineHeight: 1,
                transition: 'left 0.38s cubic-bezier(0.34,1.56,0.64,1), top 0.38s cubic-bezier(0.34,1.56,0.64,1), transform 0.28s ease',
                zIndex: 10, pointerEvents: 'none', userSelect: 'none',
              }}
            >
              {mission.char}
            </div>

            {/* Speech bubble */}
            {speech && (
              <div
                style={{
                  position: 'absolute',
                  left: Math.min(pos.col * CELL + CELL / 2 + 18, gridW - 96),
                  top: Math.max(pos.row * CELL + CELL / 2 - 48, 4),
                  background: '#fff', color: '#111', borderRadius: 10,
                  padding: '5px 12px', fontSize: 12, fontWeight: 700,
                  boxShadow: '0 2px 14px rgba(0,0,0,0.45)',
                  whiteSpace: 'nowrap', zIndex: 20, pointerEvents: 'none',
                  animation: 'snap-pop 0.18s ease',
                }}
              >
                {speech}
              </div>
            )}

            {/* Success sparkle flash */}
            {success && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'rgba(34,197,94,0.12)', pointerEvents: 'none', animation: 'snap-success 0.5s ease' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** ——— Level player ——— */
export function CodeOrgLevelPlayer({
  course,
  lessonIdx,
  completedSet,
  levelCompletedSet,
  onCompleteLesson,
  onCompleteLevel,
  onBack,
  onNextLesson,
}) {
  const { addXP, recordQuizScore } = useUser();
  const mod = course.modules[lessonIdx];
  const levels = mod.levels || [
    { id: 'read', type: 'read', label: 'Read', icon: '📖' },
    { id: 'practice', type: 'practice', label: 'Practice', icon: '💻' },
    { id: 'check', type: 'check', label: 'Check', icon: '✓' },
  ];
  const [activeLevel, setActiveLevel] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [xpBurst, setXpBurst] = useState(null);
  const [readTasksDone, setReadTasksDone] = useState(false);
  const [practiceTasksDone, setPracticeTasksDone] = useState(false);
  const [blockMissionDone, setBlockMissionDone] = useState(false);

  const mKey = moduleKey(course.id, lessonIdx);
  const lessonDone = completedSet.has(mKey);
  const content = mod.content || {};
  const quizList = mod.quiz || [];

  const isLevelDone = (li) => levelCompletedSet.has(levelKey(course.id, lessonIdx, li));
  const allLevelsDone = levels.every((_, li) => isLevelDone(li));

  const finishLevel = useCallback((li, score = 100) => {
    const lk = levelKey(course.id, lessonIdx, li);
    if (!levelCompletedSet.has(lk)) onCompleteLevel(lk);
    if (li < levels.length - 1) setActiveLevel(li + 1);
    else if (!lessonDone) {
      addXP(mod.xp);
      setXpBurst(mod.xp);
      onCompleteLesson(mKey);
      if (quizList.length) recordQuizScore(course.id, lessonIdx, score);
    }
  }, [course.id, lessonIdx, lessonDone, levels.length, mod.xp, onCompleteLesson, onCompleteLevel, levelCompletedSet, addXP, recordQuizScore, quizList.length, mKey]);

  const level = levels[activeLevel];
  const defined = INTERACTIVE[course.id]?.[lessonIdx];
  const practiceMode = getPracticeMode(course.id);
  const editorType = level?.type === 'practice'
    ? (defined?.type || (practiceMode === 'blocks' ? 'blocks' : practiceMode === 'python' ? 'python' : practiceMode === 'html' ? 'html' : 'interactive'))
    : null;

  const readTasks = useMemo(() => getReadInteractives(course.id, lessonIdx, mod), [course.id, lessonIdx, mod]);
  const practiceTasks = useMemo(() => getPracticeInteractives(course.id, lessonIdx, mod), [course.id, lessonIdx, mod]);

  useEffect(() => {
    setReadTasksDone(false);
    setPracticeTasksDone(false);
    setBlockMissionDone(false);
  }, [course.id, lessonIdx, activeLevel]);

  const showReadPanel = level?.type === 'read';
  const showPracticePanel = level?.type === 'practice' && (editorType === 'interactive' || editorType === 'blocks');
  const showCodeEditor = level?.type === 'practice' && (editorType === 'python' || editorType === 'html');
  const showWorkspace = showReadPanel || showPracticePanel || showCodeEditor;

  const canFinishRead = readTasksDone;
  const canFinishPractice =
    editorType === 'blocks'
      ? blockMissionDone
      : editorType === 'interactive' || editorType === 'python' || editorType === 'html'
      ? practiceTasksDone
      : true;

  const correctCount = Object.entries(quizAnswers)
    .filter(([k]) => k.startsWith(`${lessonIdx}-`))
    .filter(([k, v]) => quizList[parseInt(k.split('-')[1], 10)]?.answer === v).length;

  return (
    <div className="corg-player">
      {xpBurst && (
        <div className="corg-xp-burst">+{xpBurst} XP!</div>
      )}
      <header className="corg-player-top" style={{ background: `linear-gradient(135deg, ${darkenColor(course.color, 0.2)} 0%, ${course.color} 100%)` }}>
        <nav className="corg-breadcrumb corg-breadcrumb-dark">
          <button type="button" onClick={onBack}>{course.title}</button>
          <span>›</span>
          <span>Lesson {lessonIdx + 1}</span>
        </nav>
        <h1>{mod.title}</h1>
        <div className="corg-level-tabs">
          {levels.map((lv, li) => {
            const done = isLevelDone(li);
            const active = activeLevel === li;
            const locked = li > 0 && !isLevelDone(li - 1);
            return (
              <button
                key={lv.id}
                type="button"
                disabled={locked}
                className={`corg-level-tab ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                onClick={() => !locked && setActiveLevel(li)}
              >
                <span>{done ? '✓' : lv.icon}</span> {lv.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className={`corg-player-body ${showWorkspace ? 'with-editor' : ''}`}>
        <aside className="corg-instructions">
          {level?.type === 'read' && (
            <>
              <h2>Instructions</h2>
              <div className="corg-inst-steps">
                {/* Year-group activity type badge */}
                {(() => {
                  const badge = getUnitTypeBadge(course.id);
                  return (
                    <div className="corg-lesson-type-badge" style={{ background: `${badge.color}18`, color: badge.color, border: `1px solid ${badge.color}35` }}>
                      {badge.label} · Year {course.yearGroup} · {course.difficulty}
                    </div>
                  );
                })()}
                <p className="corg-inst-lead">{mod.description || mod.title}</p>
                {content.explanation && (
                  <div className="corg-inst-block">
                    <h3>📖 Learn</h3>
                    <p dangerouslySetInnerHTML={{ __html: md(content.explanation) }} />
                  </div>
                )}
                {content.example && (
                  <div className="corg-inst-block">
                    <h3>💻 Example</h3>
                    <pre className="corg-code-pre">{content.example}</pre>
                  </div>
                )}
                <div className="corg-inst-block corg-inst-activity">
                  <h3>🎮 Your mission</h3>
                  <p>Complete all <strong>{readTasks.length} interactive challenges</strong> on the right → then continue!</p>
                </div>
              </div>
              <button
                type="button"
                className="corg-btn-finish"
                disabled={!canFinishRead}
                onClick={() => finishLevel(activeLevel)}
              >
                {canFinishRead ? 'Finish reading →' : `Complete ${readTasks.length} challenges →`}
              </button>
            </>
          )}

          {level?.type === 'practice' && (
            <>
              <h2>Practice</h2>
              <p className="corg-inst-lead">
                {editorType === 'blocks'
                  ? 'Guide your character to the goal using blocks!'
                  : editorType === 'python' || editorType === 'html'
                  ? 'Try the warm-up challenges, then code in the editor.'
                  : 'Complete the fun challenges to master this lesson!'}
              </p>
              {editorType === 'blocks' && (
                <div className="corg-snap-guide">
                  <div className="corg-snap-guide-step"><span>1</span> Pick blocks from the palette</div>
                  <div className="corg-snap-guide-step"><span>2</span> Build your program in order</div>
                  <div className="corg-snap-guide-step"><span>3</span> Press <strong>▶ Run</strong> — reach the target!</div>
                  <div className="corg-snap-guide-step"><span>4</span> Mission complete unlocks Continue</div>
                </div>
              )}
              {editorType === 'interactive' && content.activity && (
                <div className="corg-inst-block corg-inst-activity">
                  <h3>🌟 Bonus challenge</h3>
                  <p dangerouslySetInnerHTML={{ __html: md(content.activity) }} />
                </div>
              )}
              <button
                type="button"
                className="corg-btn-finish"
                disabled={!canFinishPractice}
                onClick={() => finishLevel(activeLevel)}
              >
                {!canFinishPractice
                  ? (editorType === 'blocks' ? '🎯 Complete the mission first' : '🎮 Finish all challenges')
                  : 'Continue →'}
              </button>
            </>
          )}

          {level?.type === 'check' && quizList.length > 0 && (() => {
            const showResults = currentQuizIdx >= quizList.length;
            if (showResults) {
              const perfect = correctCount === quizList.length;
              const score = Math.round((correctCount / quizList.length) * 100);
              return (
                <>
                  <h2>Quiz Results</h2>
                  <div className="corg-quiz-results">
                    <div className={`corg-quiz-results-score ${perfect ? 'perfect' : ''}`}>
                      {correctCount}/{quizList.length}
                    </div>
                    <p className="corg-quiz-results-msg">
                      {perfect
                        ? '🎉 Perfect score! Brilliant work!'
                        : correctCount >= Math.ceil(quizList.length / 2)
                        ? '👍 Good effort! Review the ones you missed.'
                        : '📖 Keep studying — you\'ve got this!'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                      {!lessonDone && (
                        <button type="button" className="corg-btn-finish" onClick={() => finishLevel(activeLevel, score)}>
                          {perfect ? 'Finish Lesson ✓' : 'Continue Anyway →'}
                        </button>
                      )}
                      {lessonDone && <p style={{ color: 'var(--accent-success)', fontWeight: 700 }}>✅ Lesson already complete!</p>}
                      <button type="button" className="corg-btn-secondary" onClick={() => { setQuizAnswers({}); setCurrentQuizIdx(0); }}>
                        🔄 Try Again
                      </button>
                    </div>
                  </div>
                </>
              );
            }
            const currentQ = quizList[currentQuizIdx];
            const currentAns = quizAnswers[`${lessonIdx}-${currentQuizIdx}`];
            const isLastQ = currentQuizIdx === quizList.length - 1;
            return (
              <>
                <h2>Check your understanding</h2>
                <div className="corg-quiz-header">
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Question {currentQuizIdx + 1} of {quizList.length}</span>
                  <div className="corg-quiz-prog-track">
                    {quizList.map((q, qi) => {
                      const a = quizAnswers[`${lessonIdx}-${qi}`];
                      return (
                        <div key={qi} className={`corg-quiz-prog-dot ${a != null ? (a === q.answer ? 'correct' : 'wrong') : qi === currentQuizIdx ? 'active' : ''}`} />
                      );
                    })}
                  </div>
                </div>
                <div className="corg-quiz-q">
                  <p><strong>Q{currentQuizIdx + 1}.</strong> {currentQ.q}</p>
                  <div className="corg-quiz-opts">
                    {currentQ.options.map((opt, oi) => (
                      <button
                        key={oi}
                        type="button"
                        disabled={currentAns != null}
                        className={`corg-quiz-opt ${currentAns === oi ? (oi === currentQ.answer ? 'correct' : 'wrong') : ''} ${currentAns != null && oi === currentQ.answer ? 'correct' : ''}`}
                        onClick={() => setQuizAnswers((p) => ({ ...p, [`${lessonIdx}-${currentQuizIdx}`]: oi }))}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                      </button>
                    ))}
                  </div>
                  {currentAns != null && (
                    <div className={`corg-quiz-feedback ${currentAns === currentQ.answer ? 'correct' : 'wrong'}`}>
                      {currentAns === currentQ.answer ? '✓ Correct!' : `✗ The answer was: ${currentQ.options[currentQ.answer]}`}
                    </div>
                  )}
                </div>
                {currentAns != null && (
                  <button type="button" className="corg-btn-finish" onClick={() => setCurrentQuizIdx((s) => s + 1)}>
                    {isLastQ ? 'See Results →' : 'Next Question →'}
                  </button>
                )}
              </>
            );
          })()}

          {level?.type === 'check' && quizList.length === 0 && (
            <>
              <h2>Check</h2>
              <p>No quiz for this lesson — mark complete when ready.</p>
              <button type="button" className="corg-btn-finish" onClick={() => finishLevel(activeLevel)}>
                Complete lesson →
              </button>
            </>
          )}
        </aside>

        {showWorkspace && (
          <main className="corg-workspace">
            {showReadPanel && (
              <LessonInteractivePanel
                tasks={readTasks}
                color={course.color}
                onAllComplete={() => setReadTasksDone(true)}
              />
            )}
            {showPracticePanel && editorType === 'blocks' && (
              <BlockSnapPractice
                course={course}
                lessonIdx={lessonIdx}
                onMissionComplete={() => setBlockMissionDone(true)}
              />
            )}
            {showPracticePanel && editorType === 'interactive' && (
              <LessonInteractivePanel
                tasks={practiceTasks}
                color={course.color}
                onAllComplete={() => setPracticeTasksDone(true)}
              />
            )}
            {showCodeEditor && editorType === 'python' && (
              <div className="corg-split-workspace">
                <LessonInteractivePanel
                  tasks={practiceTasks.slice(0, 2)}
                  color={course.color}
                  compact
                  onAllComplete={() => setPracticeTasksDone(true)}
                />
                <PythonRunner starterCode={defined?.code || content.example || '# Your code\n'} editorHeight="min(420px, 45vh)" />
              </div>
            )}
            {showCodeEditor && editorType === 'html' && (
              <div className="corg-split-workspace">
                <LessonInteractivePanel
                  tasks={practiceTasks.slice(0, 2)}
                  color={course.color}
                  compact
                  onAllComplete={() => setPracticeTasksDone(true)}
                />
                <HtmlEditor starterCode={defined?.code || content.example || '<p>Hello</p>'} editorHeight="min(420px, 45vh)" />
              </div>
            )}
          </main>
        )}
      </div>

      <footer className="corg-player-footer">
        <button type="button" className="corg-btn-secondary" onClick={() => onBack()}>
          ← Unit map
        </button>
        {lessonDone && lessonIdx < course.modules.length - 1 && onNextLesson && (
          <button type="button" className="corg-btn-finish" style={{ margin: 0 }} onClick={onNextLesson}>
            Next Lesson →
          </button>
        )}
        {lessonDone && lessonIdx >= course.modules.length - 1 && (
          <span className="corg-footer-msg">🎉 Unit complete!</span>
        )}
      </footer>
    </div>
  );
}

export { YEAR_META, moduleKey, levelKey, getCompletedLessons };
