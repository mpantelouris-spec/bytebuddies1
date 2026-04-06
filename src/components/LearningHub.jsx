import React, { useState, useRef, useEffect } from 'react';
import { courses } from '../data/courseData';
import { useUser } from '../contexts/UserContext';
import BlockEditor from './BlockEditor';
import PythonRunner from './PythonRunner';
import { INTERACTIVE } from '../data/interactiveContent';

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const YEAR_COLORS = { 3: '#6366f1', 4: '#ec4899', 5: '#10b981', 6: '#f59e0b' };
const YEAR_FILTER_COLORS = { all: '#6366f1', '3': '#6366f1', '4': '#ec4899', '5': '#10b981', '6': '#f59e0b' };

// Skill-tree grid positions [row, col]
const TREE_LAYOUT = {
  'y3-first-steps':       [0, 0], 'y3-sprite-school':     [0, 1], 'y3-patterns':          [0, 2],
  'y4-game-maker':        [1, 0], 'y4-sprite-adventures': [1, 1], 'y4-web-basics':        [1, 2],
  'y5-advanced-games':    [2, 0], 'y5-python-basics':     [2, 1], 'y5-data-detective':    [2, 2],
  'y6-app-inventor':      [3, 0], 'y6-python-adventures': [3, 1], 'y6-cyber-smart':       [3, 2],
};
const YEAR_LABELS = ['Year 3', 'Year 4', 'Year 5', 'Year 6'];
const YEAR_AGES   = ['Ages 7–8', 'Ages 8–9', 'Ages 9–10', 'Ages 10–11'];

function simplifyText(text) {
  const flat = (text || '').replace(/\n+/g, ' ').trim();
  const parts = flat.match(/[^.!?]+[.!?]+(\s|$)/g) || [flat];
  return parts.slice(0, 2).join(' ').trim();
}

function getDailyQuestion() {
  const all = [];
  courses.forEach(c => c.modules.forEach(m =>
    (m.quiz || []).forEach(q => all.push({ ...q, courseTitle: c.title, color: c.color, icon: c.icon }))
  ));
  if (!all.length) return null;
  const day = Math.floor(Date.now() / 86400000);
  return all[day % all.length];
}

function getTotalXP(course) {
  return course.modules.reduce((sum, m) => sum + (m.xp || 0), 0);
}

function getCompletedModules(completedSet, course) {
  return course.modules.filter((_, i) => completedSet.has(`${course.id}-${i}`)).length;
}

function XPBurst({ xp, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 9999,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        color: '#fff', borderRadius: 24, padding: '28px 48px',
        fontSize: 32, fontWeight: 900, boxShadow: '0 0 60px #f59e0b88',
        animation: 'lh-burst 2.2s ease forwards',
      }}>
        ⚡ +{xp} XP!
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// UNIQUE FEATURE 1: CODE TRACER
// Step through any code example line-by-line
// with the inline comment as live narration.
// Nothing like this exists on Scratch / Code.org / Tynker.
// ─────────────────────────────────────────
function CodeTracer({ code, color }) {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const lines = (code || '').split('\n');
  const nonBlankIdx = lines.reduce((acc, l, i) => { if (l.trim() !== '') acc.push(i); return acc; }, []);
  const curLineIdx = nonBlankIdx[stepIdx] ?? 0;
  const curLine = lines[curLineIdx] || '';
  const comment = curLine.includes('//') ? curLine.split('//').slice(1).join('//').trim() : null;
  const isLast = stepIdx >= nonBlankIdx.length - 1;

  if (!active) {
    return (
      <div>
        <pre style={{ background: 'var(--bg-primary)', padding: '16px 20px', margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12.5, overflow: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-primary)' }}>
          {code}
        </pre>
        <button
          onClick={() => { setActive(true); setStepIdx(0); }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '6px 16px 12px', background: `${color}18`, color, border: `1.5px solid ${color}35`, borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
        >
          ▶ Step Through Code
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 12 }}>
      <pre style={{ background: 'var(--bg-primary)', padding: '10px 16px', margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.7, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
        {lines.map((line, i) => {
          const isBlank = line.trim() === '';
          const posInSteps = nonBlankIdx.indexOf(i);
          const isActive = i === curLineIdx;
          const isPast = !isBlank && posInSteps !== -1 && posInSteps < stepIdx;
          return (
            <span key={i} style={{
              display: 'block', padding: '2px 8px', borderRadius: 4,
              background: isActive ? `${color}28` : 'transparent',
              borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
              color: isPast ? 'var(--text-muted)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
              {line || ' '}
            </span>
          );
        })}
      </pre>

      {/* Narration bubble */}
      <div style={{ margin: '10px 16px 0', padding: '10px 14px', borderRadius: 8, background: `${color}12`, border: `1px solid ${color}25`, fontSize: 13, minHeight: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
        {comment
          ? <><span style={{ fontSize: 16 }}>💬</span><span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}><strong style={{ color }}>{comment}</strong></span></>
          : <span style={{ color: 'var(--text-muted)' }}>Executing: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, background: `${color}15`, padding: '1px 6px', borderRadius: 4 }}>{curLine.trim()}</code></span>
        }
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 16px 0' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 64 }}>Step {stepIdx + 1}/{nonBlankIdx.length}</span>
        <div style={{ flex: 1, height: 4, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((stepIdx + 1) / nonBlankIdx.length) * 100}%`, background: color, borderRadius: 4, transition: 'width 0.25s' }} />
        </div>
        <button disabled={stepIdx === 0} onClick={() => setStepIdx(s => s - 1)}
          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', opacity: stepIdx === 0 ? 0.4 : 1 }}>
          ← Back
        </button>
        {!isLast
          ? <button onClick={() => setStepIdx(s => s + 1)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: color, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff' }}>Next →</button>
          : <button onClick={() => { setActive(false); setStepIdx(0); }} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#10b981', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff' }}>Done ✓</button>
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// UNIQUE FEATURE 2: FLASHCARD REVIEW
// Spaced-repetition flashcards auto-generated
// from every completed module's key words.
// "Got it ✓" removes from deck; "See again 🔁" requeues.
// ─────────────────────────────────────────
function FlashcardMode({ course, completedSet, onClose }) {
  const buildDeck = () => {
    const deck = [];
    course.modules.forEach((m, i) => {
      if (!completedSet.has(`${course.id}-${i}`)) return;
      (m.content?.keyWords || []).forEach(word => {
        const expl = m.content?.explanation || '';
        const sentences = expl.split(/\.\s+|!\s+|\?\s+/).filter(Boolean);
        const context = sentences.find(s => s.toLowerCase().includes(word.toLowerCase())) || sentences[0] || expl.slice(0, 140);
        deck.push({ word, context: context.trim(), module: m.title });
      });
    });
    return deck;
  };

  const [queue, setQueue] = useState(() => buildDeck().sort(() => Math.random() - 0.5));
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [review, setReview] = useState([]);

  if (queue.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
        <h3 style={{ marginBottom: 8 }}>No flashcards yet!</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 13 }}>Complete some modules first to unlock your flashcard deck.</p>
        <button className="btn btn-secondary" onClick={onClose}>← Back to Lesson</button>
      </div>
    );
  }

  if (cardIdx >= queue.length) {
    const allDone = review.length === 0;
    return (
      <div style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{allDone ? '🏆' : '🔁'}</div>
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{allDone ? 'Deck Complete!' : 'Round Done!'}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 13 }}>
          ✅ {known.length} known &nbsp;·&nbsp; 🔁 {review.length} to review
        </p>
        {allDone
          ? <><p style={{ color: 'var(--accent-success)', fontWeight: 700, marginBottom: 20 }}>You nailed every word! 🎉</p>
              <button className="btn btn-secondary" onClick={onClose}>← Back to Lesson</button></>
          : <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={onClose}>← Back</button>
              <button className="btn btn-primary" style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}bb)` }}
                onClick={() => { setQueue([...review]); setCardIdx(0); setFlipped(false); setKnown(k => [...k, ...known]); setReview([]); }}>
                🔁 Review {review.length} cards
              </button>
            </div>
        }
      </div>
    );
  }

  const card = queue[cardIdx];
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800 }}>🃏 Flashcard Review</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cardIdx + 1} / {queue.length}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: '100%', width: `${(cardIdx / queue.length) * 100}%`, background: course.color, transition: 'width 0.3s', borderRadius: 4 }} />
      </div>

      {/* Card face */}
      <div onClick={() => setFlipped(f => !f)} style={{
        minHeight: 190, borderRadius: 16, cursor: 'pointer', userSelect: 'none',
        background: flipped ? `${course.color}14` : 'var(--bg-tertiary)',
        border: `2px solid ${flipped ? course.color : 'var(--border-color)'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px 28px', textAlign: 'center', transition: 'all 0.25s', marginBottom: 20,
        boxShadow: flipped ? `0 0 20px ${course.color}28` : 'none',
      }}>
        {!flipped ? (
          <>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', mb: 8, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Key Word</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: course.color, marginBottom: 8 }}>{card.word}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>from: {card.module}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, opacity: 0.6 }}>👆 Tap to reveal</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>In Context</div>
            <div style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text-secondary)' }}>{card.context}</div>
          </>
        )}
      </div>

      {flipped ? (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => { setReview(r => [...r, card]); setFlipped(false); setCardIdx(i => i + 1); }}
            style={{ flex: 1, maxWidth: 155, padding: '11px 20px', borderRadius: 10, border: '1.5px solid #ef444444', background: '#ef444415', color: 'var(--accent-danger)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            🔁 See Again
          </button>
          <button onClick={() => { setKnown(k => [...k, card]); setFlipped(false); setCardIdx(i => i + 1); }}
            style={{ flex: 1, maxWidth: 155, padding: '11px 20px', borderRadius: 10, border: '1.5px solid #10b98144', background: '#10b98115', color: 'var(--accent-success)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            ✓ Got It!
          </button>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
          ↑ Tap the card to see the definition
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// UNIQUE FEATURE 3: VISUAL SKILL TREE
// Interactive node graph showing all 12 courses.
// SVG bezier curves connect year rows.
// Completed courses glow; locked ones are dimmed.
// No Scratch, Code.org, or Tynker has this.
// ─────────────────────────────────────────
const NODE_W = 164, NODE_H = 86;
const COL_STEP = 228, ROW_STEP = 155;
const LABEL_W = 82, PAD = 22;

function SkillTreeView({ completedSet, onSelectCourse }) {
  const svgW = LABEL_W + PAD + 3 * NODE_W + 2 * (COL_STEP - NODE_W) + PAD;
  const svgH = PAD + 4 * NODE_H + 3 * (ROW_STEP - NODE_H) + PAD;

  const nodePos = (row, col) => ({
    x: LABEL_W + PAD + col * COL_STEP,
    y: PAD + row * ROW_STEP,
  });

  // Build a map from "row-col" → course
  const coursesByPos = {};
  courses.forEach(c => {
    const pos = TREE_LAYOUT[c.id];
    if (pos) coursesByPos[`${pos[0]}-${pos[1]}`] = c;
  });

  const lines = [];
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++) {
      const from = nodePos(row, col);
      const to = nodePos(row + 1, col);
      const cx = from.x + NODE_W / 2;
      const y1 = from.y + NODE_H, y2 = to.y;
      const fromCourse = coursesByPos[`${row}-${col}`];
      const unlocked = fromCourse && getCompletedModules(completedSet, fromCourse) === fromCourse.modules.length;
      lines.push({ cx, y1, y2, unlocked, row });
    }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 660 }}>
      <div style={{ position: 'relative', width: svgW, height: svgH, minWidth: 680 }}>

        {/* Year row labels */}
        {[0, 1, 2, 3].map(row => {
          const yc = PAD + row * ROW_STEP + NODE_H / 2;
          return (
            <div key={row} style={{ position: 'absolute', left: 0, top: yc - 20, width: LABEL_W - 8, textAlign: 'right', paddingRight: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: Object.values(YEAR_COLORS)[row], lineHeight: 1.2 }}>{YEAR_LABELS[row]}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{YEAR_AGES[row]}</div>
            </div>
          );
        })}

        {/* SVG connecting lines */}
        <svg style={{ position: 'absolute', left: 0, top: 0, width: svgW, height: svgH, pointerEvents: 'none', overflow: 'visible' }}>
          {lines.map(({ cx, y1, y2, unlocked, row }, i) => (
            <path key={i}
              d={`M ${cx} ${y1} C ${cx} ${y1 + 28}, ${cx} ${y2 - 28}, ${cx} ${y2}`}
              stroke={unlocked ? Object.values(YEAR_COLORS)[row] : 'var(--border-color)'}
              strokeWidth={unlocked ? 2.5 : 1.5}
              fill="none"
              strokeDasharray={unlocked ? undefined : '5,4'}
              opacity={unlocked ? 0.75 : 0.3}
            />
          ))}
        </svg>

        {/* Course nodes */}
        {Object.entries(TREE_LAYOUT).map(([id, [row, col]]) => {
          const course = coursesByPos[`${row}-${col}`];
          if (!course) return null;
          const { x, y } = nodePos(row, col);
          const done = getCompletedModules(completedSet, course);
          const total = course.modules.length;
          const pct = Math.round((done / total) * 100);
          const isComplete = done === total;
          const yc = YEAR_COLORS[course.yearGroup];
          return (
            <div key={id} onClick={() => onSelectCourse(course)}
              style={{
                position: 'absolute', left: x, top: y, width: NODE_W, height: NODE_H,
                background: isComplete ? `linear-gradient(135deg, ${yc}22, ${yc}0a)` : 'var(--bg-card)',
                border: `2px solid ${done > 0 ? yc + (isComplete ? 'cc' : '55') : 'var(--border-color)'}`,
                borderRadius: 12, cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: isComplete ? `0 0 16px ${yc}44` : 'var(--shadow-sm)',
                transition: 'all 0.2s', zIndex: 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.zIndex = '10'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.zIndex = '1'; }}
            >
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{course.icon}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, lineHeight: 1.3, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{total} modules · {getTotalXP(course)} XP</div>
                </div>
                {isComplete && <span style={{ fontSize: 14, flexShrink: 0 }}>✅</span>}
              </div>
              <div style={{ height: 4, background: 'var(--bg-tertiary)' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: yc, transition: 'width 0.4s' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// UNIQUE FEATURE 4: DAILY BRAIN TEASER
// A fresh question every 24h, seeded by today's date.
// Answer for bonus +15 XP. Never seen on any kids platform.
// ─────────────────────────────────────────
function DailyChallenge({ addXP }) {
  const q = getDailyQuestion();
  const [answered, setAnswered] = useState(null);
  const [claimed, setClaimed] = useState(false);
  if (!q) return null;

  return (
    <div style={{ background: 'linear-gradient(135deg, #6366f115, #8b5cf612)', border: '1.5px solid #6366f130', borderRadius: 16, padding: '20px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 90, opacity: 0.04, pointerEvents: 'none', lineHeight: 1 }}>🧠</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>☀️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Daily Brain Teaser</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.icon} {q.courseTitle} · refreshes each day</div>
          </div>
        </div>
        {answered === null && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, background: '#f59e0b18', border: '1px solid #f59e0b30', padding: '3px 10px', borderRadius: 20 }}>+15 XP</span>}
        {answered !== null && answered === q.answer && !claimed && (
          <button onClick={() => { addXP(15); setClaimed(true); }}
            style={{ padding: '6px 16px', borderRadius: 20, border: 'none', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            Claim +15 XP ⚡
          </button>
        )}
        {claimed && <span style={{ color: 'var(--accent-success)', fontWeight: 700, fontSize: 13 }}>✅ +15 XP Claimed!</span>}
      </div>

      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text-primary)' }}>{q.q}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {q.options.map((opt, i) => {
          const isSel = answered === i, isAns = i === q.answer;
          let bg = 'var(--bg-tertiary)', brd = 'var(--border-color)', col = 'var(--text-secondary)';
          if (answered != null) {
            if (isAns) { bg = '#10b98116'; brd = '#10b98155'; col = 'var(--accent-success)'; }
            else if (isSel) { bg = '#ef444416'; brd = '#ef444455'; col = 'var(--accent-danger)'; }
          }
          return (
            <button key={i} disabled={answered != null} onClick={() => setAnswered(i)}
              style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${brd}`, background: bg, color: col, fontWeight: 600, fontSize: 12, cursor: answered != null ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {String.fromCharCode(65 + i)}. {opt}
              {answered != null && isAns && ' ✓'}
              {answered != null && isSel && !isAns && ' ✗'}
            </button>
          );
        })}
      </div>
      {answered !== null && (
        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: answered === q.answer ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
          {answered === q.answer ? '🎉 Correct! Brilliant work!' : `❌ Not quite — the answer was: ${q.options[q.answer]}`}
        </div>
      )}
    </div>
  );
}

function LessonView({ course, completedSet, onComplete, onBack }) {
  const { addXP, recordQuizScore, incrementQuestProgress } = useUser();
  const [activeModule, setActiveModule] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [xpBurst, setXpBurst] = useState(null);
  const [eli5, setEli5] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState({});
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showReviewBanner, setShowReviewBanner] = useState(false);
  const contentRef = useRef(null);

  const mod = course.modules[activeModule];
  const content = mod.content;
  const quizList = mod.quiz || [];
  const currentQuiz = quizList[currentQuizIdx];
  const moduleKey = `${course.id}-${activeModule}`;
  const isModuleDone = completedSet.has(moduleKey);
  const hasCompletedAny = course.modules.some((_, i) => completedSet.has(`${course.id}-${i}`));

  const answeredCount = Object.keys(quizAnswers).filter(k => k.startsWith(`${activeModule}-`)).length;
  const correctCount = Object.entries(quizAnswers)
    .filter(([k]) => k.startsWith(`${activeModule}-`))
    .filter(([k, v]) => quizList[parseInt(k.split('-')[1])]?.answer === v).length;
  const quizFinished = answeredCount >= quizList.length && quizList.length > 0;
  const quizPerfect = quizFinished && correctCount === quizList.length;

  const handleQuizAnswer = (aIdx) => {
    const key = `${activeModule}-${currentQuizIdx}`;
    if (quizAnswers[key] != null) return;
    setQuizAnswers(prev => ({ ...prev, [key]: aIdx }));
  };

  const handleModuleComplete = () => {
    if (!isModuleDone) {
      const score = quizList.length > 0 ? Math.round((correctCount / quizList.length) * 100) : 100;
      addXP(mod.xp);
      setXpBurst(mod.xp);
      onComplete(moduleKey);
      recordQuizScore(course.id, activeModule, score);
      incrementQuestProgress('q-quiz');
      // Show review banner if score is low
      if (score < 70 && quizList.length > 0) {
        setShowReviewBanner(true);
      }
    }
    if (activeModule < course.modules.length - 1) {
      goToModule(activeModule + 1);
    }
  };

  const goToModule = (idx) => {
    setActiveModule(idx);
    setShowQuiz(false);
    setCurrentQuizIdx(0);
    setEli5(false);
    setShowNotes(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const completedInCourse = getCompletedModules(completedSet, course);
  const courseProgress = Math.round((completedInCourse / course.modules.length) * 100);
  const difficultyStyle = { background: `${course.color}22`, color: course.color, border: `1px solid ${course.color}44` };

  // Show flashcard overlay
  if (showFlashcards) {
    return (
      <div className="page">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <FlashcardMode course={course} completedSet={completedSet} onClose={() => setShowFlashcards(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingBottom: 40 }}>
      {xpBurst && <XPBurst xp={xpBurst} onDone={() => setXpBurst(null)} />}

      {/* Course header banner */}
      <div style={{
        background: `linear-gradient(135deg, ${course.color}22 0%, ${course.color}08 100%)`,
        border: `1px solid ${course.color}33`,
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{ fontSize: 52, lineHeight: 1 }}>{course.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: 0 }}
            >
              📚 Learning Hub
            </button>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{course.title}</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{course.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span className="tag" style={difficultyStyle}>{course.difficulty}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {completedInCourse}/{course.modules.length} modules
            </span>
            <span style={{ fontSize: 12, color: 'var(--accent-warning)', fontWeight: 700 }}>
              ⚡ {getTotalXP(course)} XP total
            </span>
            <div style={{ flex: 1, minWidth: 120, maxWidth: 200 }}>
              <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${courseProgress}%`, background: `linear-gradient(90deg, ${course.color}, ${course.color}99)`, borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{courseProgress}% complete</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Module sidebar */}
        <div style={{ width: 260, flexShrink: 0, position: 'sticky', top: 0 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: 13 }}>
              📋 Modules
            </div>
            <div style={{ maxHeight: 450, overflowY: 'auto', padding: 8 }}>
              {course.modules.map((m, i) => {
                const done = completedSet.has(`${course.id}-${i}`);
                const active = activeModule === i;
                return (
                  <button
                    key={i}
                    onClick={() => goToModule(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: active ? `${course.color}22` : 'transparent',
                      borderLeft: active ? `3px solid ${course.color}` : '3px solid transparent',
                      marginBottom: 2, textAlign: 'left', transition: 'all 0.15s',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{done ? '✅' : active ? '▶️' : '📖'}</span>
                    <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, flex: 1, lineHeight: 1.3 }}>{m.title}</span>
                    <span style={{ fontSize: 10, color: 'var(--accent-warning)', fontWeight: 700, flexShrink: 0 }}>+{m.xp}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* UNIQUE FEATURE 2 (entry point): Flashcard Review */}
          {hasCompletedAny && (
            <button
              onClick={() => setShowFlashcards(true)}
              style={{
                width: '100%', marginTop: 10, padding: '10px 16px', borderRadius: 10,
                background: `${course.color}14`, border: `1.5px solid ${course.color}30`,
                color: course.color, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s',
              }}
            >
              🃏 Flashcard Review
            </button>
          )}
        </div>

        {/* Lesson content */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 0 }}>
          {/* Module header */}
          <div style={{
            background: `linear-gradient(135deg, ${course.color}18, transparent)`,
            border: `1px solid ${course.color}33`, borderRadius: 14, padding: '18px 24px', marginBottom: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Module {activeModule + 1} of {course.modules.length}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900 }}>{mod.title}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                ⚡ +{mod.xp} XP
              </span>
              {isModuleDone && (
                <span style={{ fontSize: 11, color: 'var(--accent-success)', fontWeight: 700 }}>✅ Completed</span>
              )}
            </div>
          </div>

          {/* Content card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body" style={{ fontSize: 14, lineHeight: 1.85 }}>

              {/* UNIQUE FEATURE 5: ELI5 toggle on explanation */}
              {content?.explanation && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>📝</span>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Lesson</h4>
                    </div>
                    <button
                      onClick={() => setEli5(e => !e)}
                      title="Toggle simplified explanation"
                      style={{
                        padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
                        border: `1.5px solid ${eli5 ? '#f59e0b55' : 'var(--border-color)'}`,
                        background: eli5 ? '#f59e0b18' : 'transparent',
                        color: eli5 ? '#f59e0b' : 'var(--text-muted)',
                      }}
                    >
                      🧒 {eli5 ? 'Simple mode ON' : 'Simplify'}
                    </button>
                  </div>
                  {eli5 && (
                    <div style={{ background: '#f59e0b0a', border: '1px solid #f59e0b25', borderRadius: 8, padding: '8px 14px', marginBottom: 10, fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
                      🧒 Showing a simplified version — tap again to see the full explanation.
                    </div>
                  )}
                  <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                    {eli5 ? simplifyText(content.explanation) : content.explanation}
                  </p>
                </div>
              )}

              {/* Key Words */}
              {content?.keyWords && content.keyWords.length > 0 && (
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>🔑 Key words:</span>
                  {content.keyWords.map(w => (
                    <span key={w} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${course.color}20`, color: course.color, fontWeight: 700, border: `1px solid ${course.color}30` }}>{w}</span>
                  ))}
                </div>
              )}

              {/* UNIQUE FEATURE 1: Code Example with Code Tracer */}
              {content?.example && (
                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 20, border: `1px solid ${course.color}33` }}>
                  <div style={{ background: `${course.color}22`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15 }}>💻</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: course.color }}>Code Example</span>
                    </div>
                    <span style={{ fontSize: 10, color: course.color, opacity: 0.7, fontWeight: 600 }}>▶ Step through available below</span>
                  </div>
                  <CodeTracer code={content.example} color={course.color} />
                </div>
              )}

              {/* Activity */}
              {content?.activity && (
                <div style={{ background: 'linear-gradient(135deg, #f59e0b12, #ef444412)', borderRadius: 12, padding: '16px 20px', marginBottom: 16, border: '1px solid #f59e0b30' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>🌟</span>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: '#f59e0b' }}>Try It Yourself</h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{content.activity}</p>
                </div>
              )}

              {/* UNIQUE FEATURE 6: Module Notes */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 8 }}>
                <button
                  onClick={() => setShowNotes(n => !n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}
                >
                  📒 {showNotes ? 'Hide Notes' : 'My Notes'}
                  {notes[moduleKey] ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} /> : null}
                </button>
                {showNotes && (
                  <textarea
                    value={notes[moduleKey] || ''}
                    onChange={e => setNotes(n => ({ ...n, [moduleKey]: e.target.value }))}
                    placeholder="Jot down anything you want to remember from this lesson..."
                    style={{
                      width: '100%', marginTop: 8, minHeight: 88, resize: 'vertical',
                      background: '#f59e0b08', border: '1.5px solid #f59e0b2a',
                      borderRadius: 10, padding: '10px 14px', fontSize: 13,
                      color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
                      lineHeight: 1.6, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          {quizList.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-body">
                {!showQuiz ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>
                      {isModuleDone ? 'Quiz Complete!' : 'Ready to test your knowledge?'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                      {quizList.length} question{quizList.length !== 1 ? 's' : ''} · Earn <strong style={{ color: '#f59e0b' }}>+{mod.xp} XP</strong> for a perfect score
                    </p>
                    <button
                      className="btn btn-primary"
                      style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)` }}
                      onClick={() => { setShowQuiz(true); setQuizAnswers({}); setCurrentQuizIdx(0); }}
                    >
                      {isModuleDone ? '🔄 Retake Quiz' : '📝 Start Quiz'}
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Quiz header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800 }}>🧠 Quiz</h4>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {quizList.map((_, i) => (
                          <div key={i} style={{
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700,
                            background: quizAnswers[`${activeModule}-${i}`] != null
                              ? (quizAnswers[`${activeModule}-${i}`] === quizList[i].answer ? '#10b98133' : '#ef444433')
                              : (i === currentQuizIdx ? `${course.color}33` : 'var(--bg-tertiary)'),
                            color: quizAnswers[`${activeModule}-${i}`] != null
                              ? (quizAnswers[`${activeModule}-${i}`] === quizList[i].answer ? 'var(--accent-success)' : 'var(--accent-danger)')
                              : (i === currentQuizIdx ? course.color : 'var(--text-muted)'),
                            border: i === currentQuizIdx ? `2px solid ${course.color}` : '2px solid transparent',
                            cursor: 'pointer',
                          }} onClick={() => setCurrentQuizIdx(i)}>
                            {quizAnswers[`${activeModule}-${i}`] != null
                              ? (quizAnswers[`${activeModule}-${i}`] === quizList[i].answer ? '✓' : '✗')
                              : i + 1
                            }
                          </div>
                        ))}
                      </div>
                    </div>

                    {!quizFinished ? (
                      <>
                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: '16px 20px', marginBottom: 16, border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Question {currentQuizIdx + 1} of {quizList.length}
                          </div>
                          <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5 }}>{currentQuiz.q}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {currentQuiz.options.map((opt, i) => {
                            const answered = quizAnswers[`${activeModule}-${currentQuizIdx}`];
                            const isSelected = answered === i;
                            const isCorrect = i === currentQuiz.answer;
                            let bg = 'var(--bg-tertiary)', border = 'var(--border-color)', color = 'var(--text-primary)';
                            if (answered != null) {
                              if (isCorrect) { bg = '#10b98120'; border = '#10b98155'; color = 'var(--accent-success)'; }
                              else if (isSelected) { bg = '#ef444420'; border = '#ef444455'; color = 'var(--accent-danger)'; }
                              else { bg = 'var(--bg-tertiary)'; color = 'var(--text-muted)'; }
                            }
                            return (
                              <button
                                key={i}
                                disabled={answered != null}
                                onClick={() => handleQuizAnswer(i)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 12,
                                  padding: '12px 16px', borderRadius: 10,
                                  background: bg, border: `1.5px solid ${border}`, color,
                                  cursor: answered != null ? 'default' : 'pointer',
                                  fontWeight: 600, fontSize: 14, textAlign: 'left',
                                  transition: 'all 0.15s',
                                  opacity: answered != null && !isSelected && !isCorrect ? 0.45 : 1,
                                }}
                              >
                                <span style={{
                                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                                  background: answered != null ? 'transparent' : `${course.color}20`,
                                  color: answered != null ? 'inherit' : course.color,
                                  border: `1.5px solid ${answered != null ? 'transparent' : course.color + '44'}`,
                                }}>
                                  {answered != null && isCorrect ? '✓' : answered != null && isSelected ? '✗' : String.fromCharCode(65 + i)}
                                </span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizAnswers[`${activeModule}-${currentQuizIdx}`] != null && (
                          <div style={{ marginTop: 16 }}>
                            <div style={{
                              padding: '10px 16px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600,
                              background: quizAnswers[`${activeModule}-${currentQuizIdx}`] === currentQuiz.answer ? '#10b98118' : '#ef444418',
                              color: quizAnswers[`${activeModule}-${currentQuizIdx}`] === currentQuiz.answer ? 'var(--accent-success)' : 'var(--accent-danger)',
                              border: `1px solid ${quizAnswers[`${activeModule}-${currentQuizIdx}`] === currentQuiz.answer ? '#10b98133' : '#ef444433'}`,
                            }}>
                              {quizAnswers[`${activeModule}-${currentQuizIdx}`] === currentQuiz.answer
                                ? '🎉 Correct! Great job!'
                                : `❌ Not quite! The correct answer is: ${String.fromCharCode(65 + currentQuiz.answer)}. ${currentQuiz.options[currentQuiz.answer]}`
                              }
                            </div>
                            {currentQuizIdx < quizList.length - 1 && (
                              <button className="btn btn-primary" style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}bb)` }} onClick={() => setCurrentQuizIdx(p => p + 1)}>
                                Next Question →
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      /* Quiz results */
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <div style={{ fontSize: 52, marginBottom: 12 }}>{quizPerfect ? '🏆' : correctCount >= quizList.length / 2 ? '👍' : '📖'}</div>
                        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
                          {quizPerfect ? 'Perfect Score!' : `${correctCount}/${quizList.length} Correct`}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                          {quizPerfect
                            ? `Outstanding! You nailed every question!`
                            : correctCount >= quizList.length / 2
                              ? `Good effort! Review the missed questions and try again.`
                              : `Keep studying and give it another go — you've got this!`
                          }
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <button className="btn btn-secondary" onClick={() => { setQuizAnswers({}); setCurrentQuizIdx(0); }}>
                            🔄 Retake
                          </button>
                          {quizPerfect && !isModuleDone && (
                            <button
                              className="btn btn-success"
                              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                              onClick={handleModuleComplete}
                            >
                              ✅ Complete & Earn +{mod.xp} XP →
                            </button>
                          )}
                          {quizPerfect && isModuleDone && activeModule < course.modules.length - 1 && (
                            <button className="btn btn-primary" style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}bb)` }} onClick={() => goToModule(activeModule + 1)}>
                              Next Module →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review banner for low quiz scores */}
          {showReviewBanner && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>📖 Review Recommended</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You scored below 70% — reviewing this module will help you remember it better!</div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }} onClick={() => setShowReviewBanner(false)}>✕</button>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <button
              className="btn btn-secondary"
              disabled={activeModule === 0}
              onClick={() => goToModule(activeModule - 1)}
              style={{ minWidth: 130 }}
            >
              ← Previous
            </button>
            {quizList.length === 0 && !isModuleDone && (
              <button
                className="btn btn-success"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', flex: 1, maxWidth: 260 }}
                onClick={handleModuleComplete}
              >
                ✅ Mark Complete & Earn +{mod.xp} XP
              </button>
            )}
            <button
              className="btn btn-secondary"
              disabled={activeModule === course.modules.length - 1}
              onClick={() => goToModule(activeModule + 1)}
              style={{ minWidth: 130 }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearningHub() {
  const { addXP } = useUser();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'tree'
  const [completedSet, setCompletedSet] = useState(() => new Set());

  const handleComplete = (key) => setCompletedSet(prev => new Set([...prev, key]));

  if (selectedCourse) {
    return (
      <LessonView
        course={selectedCourse}
        completedSet={completedSet}
        onComplete={handleComplete}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  const yearGroups = [
    { key: 'all', label: '🌍 All Years' },
    { key: '3', label: 'Year 3', ages: '7–8' },
    { key: '4', label: 'Year 4', ages: '8–9' },
    { key: '5', label: 'Year 5', ages: '9–10' },
    { key: '6', label: 'Year 6', ages: '10–11' },
  ];

  const filtered = filter === 'all' ? courses : courses.filter(c => String(c.yearGroup) === filter);
  const totalXP = courses.reduce((s, c) => s + getTotalXP(c), 0);
  const completedModules = courses.reduce((s, c) => s + getCompletedModules(completedSet, c), 0);
  const totalModules = courses.reduce((s, c) => s + c.modules.length, 0);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>📚 Learning Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Structured courses from Year 3 to Year 6. Learn at your own pace!</p>
        </div>
        {/* View mode buttons */}
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 10, padding: 3, border: '1px solid var(--border-color)', flexShrink: 0 }}>
          {[{ key: 'grid', label: '⊞ Grid' }, { key: 'tree', label: '🗺️ Skill Map' }].map(v => (
            <button key={v.key} onClick={() => setViewMode(v.key)}
              style={{ padding: '6px 16px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                background: viewMode === v.key ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === v.key ? '#fff' : 'var(--text-muted)' }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { icon: '📖', label: 'Courses', value: courses.length },
          { icon: '🧩', label: 'Modules', value: totalModules },
          { icon: '✅', label: 'Completed', value: completedModules },
          { icon: '⚡', label: 'XP Available', value: totalXP.toLocaleString() },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 120 }}>
            <span style={{ fontSize: 22 }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* UNIQUE FEATURE 4: Daily Brain Teaser */}
      <DailyChallenge addXP={addXP} />

      {/* UNIQUE FEATURE 3: Skill Map view */}
      {viewMode === 'tree' ? (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>🗺️ Learning Path</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Your full journey from Year 3 to Year 6. Complete a course to unlock connections.</p>
          </div>
          <SkillTreeView completedSet={completedSet} onSelectCourse={setSelectedCourse} />
        </div>
      ) : (
        <>
          {/* Year group filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {yearGroups.map(yg => {
              const active = filter === yg.key;
              const col = YEAR_FILTER_COLORS[yg.key];
              const count = yg.key === 'all' ? courses.length : courses.filter(c => String(c.yearGroup) === yg.key).length;
              return (
                <button key={yg.key} onClick={() => setFilter(yg.key)}
                  style={{ padding: '8px 18px', borderRadius: 20, border: `1.5px solid ${active ? col : 'var(--border-color)'}`, background: active ? `${col}20` : 'var(--bg-card)', color: active ? col : 'var(--text-secondary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {yg.label}
                  {yg.ages && <span style={{ fontSize: 11, opacity: 0.7 }}>({yg.ages})</span>}
                  <span style={{ background: active ? col : 'var(--bg-tertiary)', color: active ? '#fff' : 'var(--text-muted)', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Course grid */}
          <div className="grid grid-3" style={{ gap: 22 }}>
            {filtered.map(course => {
              const totalXPCourse = getTotalXP(course);
              const done = getCompletedModules(completedSet, course);
              const progress = Math.round((done / course.modules.length) * 100);
              const statusLabel = done === 0 ? 'Start Learning' : done === course.modules.length ? '✅ Completed!' : `Continue (${progress}%)`;
              const statusColor = done === course.modules.length ? '#10b981' : done > 0 ? course.color : 'var(--text-muted)';
              return (
                <div key={course.id} className="course-card" onClick={() => setSelectedCourse(course)} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${course.color}30 0%, ${course.color}10 100%)`, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ fontSize: 56, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{course.icon}</div>
                    <div style={{ position: 'absolute', top: 10, right: 10, background: `${course.color}25`, border: `1px solid ${course.color}40`, color: course.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>{course.difficulty}</div>
                    {done > 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, background: `linear-gradient(90deg, ${course.color}, ${course.color}55)`, width: `${progress}%`, transition: 'width 0.4s' }} />}
                  </div>
                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 5 }}>{course.title}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6, flex: 1 }}>{course.description}</p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                      {course.topics.slice(0, 4).map(t => (
                        <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${course.color}18`, color: course.color, fontWeight: 700, border: `1px solid ${course.color}28` }}>{t}</span>
                      ))}
                      {course.topics.length > 4 && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontWeight: 700 }}>+{course.topics.length - 4}</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                      <span>📖 {course.modules.length} modules</span>
                      <span>⏱️ {course.duration}</span>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>⚡ {totalXPCourse} XP</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${course.color}, ${course.color}88)`, borderRadius: 4, transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
