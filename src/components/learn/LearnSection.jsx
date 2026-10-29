import React, { useState, useEffect, useCallback, useMemo, Component } from 'react';
import { CHARACTERS, getLevelInfo } from '../../data/learnWorldData';
import { COURSES, COURSE_ORDER, KS2_LESSON_COUNT } from '../../data/learnKs2Courses';
import { KS2_STATUTORY } from '../../data/curriculum/ks2Statutory';
import { buildKs2LessonInteractives } from '../../data/ks2LessonInteractives.js';
import { getPuzzleLevels } from '../../data/learnPuzzleLevels';
import PuzzleProgression from './activities/PuzzleProgression';
import ActivityRenderer from './activities/ActivityRenderer';
import CodingLabPanel from './CodingLab/CodingLabPanel';
import { YEAR_WORLDS } from '../../data/pupilMissions.js';
import { TeacherHome, TeacherScheme, TeacherLesson } from './TeacherDesk.jsx';
import ClassroomLesson from './ClassroomLesson.jsx';
import { LessonPicture, lessonThemeId, pictureForSlide } from './LessonArt.jsx';
import { UniqueHeader, HeaderMark, worldMarkKind, themeMarkKind } from './LessonHeaders.jsx';
import { isCodingLesson } from '../../data/learnCodingConfig.js';
import { useUser } from '../../contexts/UserContext';
import { getTeaching } from '../../data/teaching/index.js';
import PupilLearn from './PupilLearn.jsx';
import { readWork, recordWork } from '../../utils/workLog.js';
import { EmojiIcon, IconText } from '../ui/Icon.jsx';

// Safe fallbacks - handle undefined imports gracefully
const SAFE_COURSE_ORDER = COURSE_ORDER && Array.isArray(COURSE_ORDER) ? COURSE_ORDER : ['y3', 'y4', 'y5', 'y6'];
const SAFE_COURSES = COURSES && typeof COURSES === 'object' ? COURSES : {};
function parseLearnRoute(subPath) {
  const parts = String(subPath || '').split('/').filter(Boolean);
  if (parts[0] === 'world') return { screen: 'world', yr: 'y3', idx: 0 };
  const yr = SAFE_COURSES[parts[0]] ? parts[0] : 'y3';
  const lessons = SAFE_COURSES[yr]?.lessons || [];
  if (parts[1] == null || parts[1] === '') return { screen: 'year', yr, idx: 0 };
  const token = parts[1];
  const idx = /^w/i.test(token) ? parseInt(token.slice(1), 10) - 1 : parseInt(token, 10);
  if (!Number.isFinite(idx) || idx < 0 || idx >= lessons.length) return { screen: 'year', yr, idx: 0 };
  if (String(parts[2] || '').toLowerCase() === 'plan') return { screen: 'plan', yr, idx };
  return { screen: 'lesson', yr, idx };
}

const WORLD_PIC = { y3: 'algorithm', y4: 'network', y5: 'python', y6: 'project' };

function FeaturedWeekCard({ yr = 'y3', idx = 0, onOpen, role = 'pupil' }) {
  const lesson = SAFE_COURSES[yr]?.lessons?.[idx];
  if (!lesson) return null;
  const hook = lesson.pupilHook || lesson.mission;
  const theme = pictureForSlide(lesson, 'title');
  return (
    <div style={{ maxWidth: 760, margin: '0 auto 28px', borderRadius: 22, overflow: 'hidden',
      background: 'linear-gradient(160deg, rgba(16,185,129,0.18), rgba(99,102,241,0.12))',
      border: '2px solid rgba(52,211,153,0.55)' }}>
      <div className="bb-pupil-split" style={{ marginBottom: 0, gap: 0 }}>
        <LessonPicture theme={theme} className="bb-pupil-split__art" style={{ minHeight: 150, borderRadius: 0, border: 'none' }} />
        <div style={{ padding: '18px 18px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#6ee7b7', marginBottom: 6 }}>
            {role === 'teacher' ? 'This week' : 'Jump in here'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, lineHeight: 1.25 }}>{lesson.title}</div>
          <div style={{ fontSize: 14, color: TEXT_DIM, lineHeight: 1.55, marginBottom: 14 }}>{hook}</div>
          <Btn color="#10b981" onClick={onOpen}>{role === 'teacher' ? 'Open the lesson →' : 'Play this mission →'}</Btn>
        </div>
      </div>
    </div>
  );
}

// Error Boundary to catch rendering errors
class LearnErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('LearnSection Error:', error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#fff', background: '#1a1a2e', minHeight: '100vh' }}>
          <h2 style={{ color: '#ef4444' }}>Something went wrong</h2>
          <p style={{ color: 'rgba(var(--ls-ink),0.6)' }}>{this.state.error?.message || 'Unknown error'}</p>
          <pre style={{ textAlign: 'left', background: '#000', padding: 16, borderRadius: 8, overflow: 'auto', maxHeight: 300, fontSize: 11, color: '#fca5a5' }}>
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const XP_KEY   = 'bb_world_xp';
const KS2_MAX_YEAR_KEY = 'bb_ks2_max_year';
const LEARN_ROLE_KEY = 'bb_learn_role';
function getLearnRole() {
  try {
    if (localStorage.getItem('cv-loggedin') === 'true') {
      const account = JSON.parse(localStorage.getItem('cv-user') || '{}');
      if (account.role === 'student' || account.role === 'parent') return 'pupil';
      if (account.role === 'teacher') return 'teacher';
    }
  } catch {}
  return localStorage.getItem(LEARN_ROLE_KEY) === 'teacher' ? 'teacher' : 'pupil';
}
function setLearnRole(role) {
  localStorage.setItem(LEARN_ROLE_KEY, role === 'teacher' ? 'teacher' : 'pupil');
}
const doneKey  = (yr, i) => `bb_world_${yr}_l${i}`;
const badgeKey = (yr)    => `bb_world_badge_${yr}`;

function getKs2MaxYear() {
  const n = parseInt(localStorage.getItem(KS2_MAX_YEAR_KEY) || '6', 10);
  return Number.isFinite(n) ? Math.min(6, Math.max(3, n)) : 6;
}
function setKs2MaxYear(year) {
  localStorage.setItem(KS2_MAX_YEAR_KEY, String(Math.min(6, Math.max(3, year))));
}
function getTotalXP()         { return parseInt(localStorage.getItem(XP_KEY) || '0'); }
function addXP(n)             { localStorage.setItem(XP_KEY, String(getTotalXP() + n)); }
function isLessonDone(yr, i)  { return localStorage.getItem(doneKey(yr,i)) === '1'; }
function markDone(yr, i)      { localStorage.setItem(doneKey(yr,i), '1'); }
function isBadgeShown(yr)     { return localStorage.getItem(badgeKey(yr)) === '1'; }
function markBadgeShown(yr)   { localStorage.setItem(badgeKey(yr), '1'); }

function getYearProgress(yr) {
  const lessons = SAFE_COURSES[yr]?.lessons || [];
  if (lessons.length === 0) return { done: 0, total: 0, pct: 0 };
  const done = lessons.filter((_, i) => isLessonDone(yr, i)).length;
  return { done, total: lessons.length, pct: Math.round(done / lessons.length * 100) };
}
function findContinue() {
  for (const yr of SAFE_COURSE_ORDER) {
    const c = SAFE_COURSES[yr];
    const lessons = c?.lessons || [];
    for (let i = 0; i < lessons.length; i++) {
      if (!isLessonDone(yr, i)) return { yr, idx: i };
    }
  }
  return null;
}
function getTermForLesson(yr, idx) {
  const course = SAFE_COURSES[yr];
  if (!course || !course.terms) return null;
  return course.terms.find(t => idx >= t.range[0] && idx <= t.range[1]) || null;
}

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
// Theme-aware: the --ls-* colours are defined for dark and light mode in index.css
const BG = 'var(--ls-bg)';
const CARD_BG = 'var(--ls-card)';
const CARD_BORDER = 'var(--ls-border)';
const TEXT = 'var(--ls-text)';
const TEXT_DIM = 'var(--ls-dim)';

// ─── GLOBAL ANIMATIONS ──────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @keyframes pulse-glow { 0%,100%{box-shadow:0 0 12px currentColor} 50%{box-shadow:0 0 28px currentColor,0 0 50px currentColor} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes slide-in { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
      @keyframes confetti-fall { to{transform:translateY(120vh) rotate(720deg); opacity:0} }
      @keyframes bounce-in { 0%{transform:scale(0.3)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
      @keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:1} }
      .bb-scroll::-webkit-scrollbar{width:8px}
      .bb-scroll::-webkit-scrollbar-thumb{background:rgba(var(--ls-ink),0.15);border-radius:8px}
    `}</style>
  );
}

// ─── STAR FIELD ─────────────────────────────────────────────────────────────
function Stars({ count = 60 }) {
  const stars = useMemo(() => Array.from({ length: count }, () => ({
    top: Math.random() * 100, left: Math.random() * 100,
    size: Math.random() * 2 + 1, delay: Math.random() * 3, dur: Math.random() * 2 + 2,
  })), [count]);
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {stars.map((s, i) => (
        <div key={i} style={{ position:'absolute', top:`${s.top}%`, left:`${s.left}%`,
          width:s.size, height:s.size, borderRadius:'50%', background:'var(--ls-star)',
          animation:`twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }} />
      ))}
    </div>
  );
}

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
function ProgressBar({ pct, color, height = 8, style = {} }) {
  return (
    <div style={{ background:'rgba(var(--ls-ink),0.1)', borderRadius:99, height, overflow:'hidden', ...style }}>
      <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:99,
        transition:'width 0.6s ease', boxShadow:`0 0 8px ${color}88` }} />
    </div>
  );
}

function Chip({ label, color = '#818cf8', style = {} }) {
  return <span style={{ fontSize:11, fontWeight:700, color, background:`${color}18`,
    border:`1px solid ${color}44`, borderRadius:20, padding:'3px 10px', whiteSpace:'nowrap', ...style }}>{label}</span>;
}

function Stars3({ n }) {
  return <span style={{ letterSpacing:2 }}>{'★'.repeat(n)}<span style={{ opacity:0.25 }}>{'★'.repeat(3 - n)}</span></span>;
}

function ModeToggle({ role, onChange }) {
  const { user, isLoggedIn } = useUser();
  if (isLoggedIn && (user?.role === 'student' || user?.role === 'parent')) return null;
  return (
    <div style={{ display:'inline-flex', padding:4, borderRadius:14, background:'rgba(var(--ls-ink),0.06)',
      border:`1px solid ${CARD_BORDER}`, gap:4 }}>
      {[['pupil', 'I’m a pupil'], ['teacher', 'I’m a teacher']].map(([id, label]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          style={{ padding:'8px 14px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:800, fontSize:12,
            background: role === id ? '#10b981' : 'transparent',
            color: role === id ? '#042f2e' : TEXT_DIM }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Btn({ children, onClick, color = '#6366f1', variant = 'solid', style = {}, disabled }) {
  const solid = variant === 'solid';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding:'13px 26px', borderRadius:14, fontWeight:800, fontSize:15, cursor:disabled?'not-allowed':'pointer',
        border: solid ? 'none' : `1.5px solid ${color}66`,
        background: solid ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'transparent',
        color: solid ? '#fff' : color, opacity:disabled?0.4:1,
        boxShadow: solid ? `0 8px 24px ${color}55` : 'none', transition:'transform .15s', ...style }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.96)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
      {children}
    </button>
  );
}

function CharBubble({ characterId, text, style = {} }) {
  const ch = CHARACTERS[characterId];
  if (!ch) return null;
  return (
    <div style={{ display:'flex', gap:12, alignItems:'flex-start', background:ch.bg,
      border:`1px solid ${ch.color}44`, borderRadius:16, padding:'14px 16px', ...style }}>
      <div style={{ fontSize:30, flexShrink:0, lineHeight:1, animation:'float 3s ease-in-out infinite' }}>{ch.emoji}</div>
      <div>
        <div style={{ fontSize:11, fontWeight:800, color:ch.color, marginBottom:4 }}>{ch.name}</div>
        <div style={{ fontSize:14, color:'var(--ls-text2)', lineHeight:1.55 }}>{text}</div>
      </div>
    </div>
  );
}

function CompanionActivitySection({ activity, color }) {
  const [expanded, setExpanded] = useState(false);
  if (!activity) return null;
  
  return (
    <div style={{ marginTop: 20, background: 'rgba(var(--ls-ink),0.03)', border: `1px solid ${color}33`, borderRadius: 18, overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ls-text2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}><EmojiIcon e="🎓" /></span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: 1 }}>TEACHER COMPANION ACTIVITY</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{activity.name}</div>
          </div>
        </div>
        <span style={{ fontSize: 18, color: TEXT_DIM, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
      </button>
      
      {expanded && (
        <div style={{ padding: '0 18px 18px', animation: 'fade-up 0.3s ease' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Chip label={`📋 ${activity.format}`} color="#10b981" />
            <Chip label={`⏱ ${activity.time}`} color="#f59e0b" />
            <Chip label={`👥 ${activity.groupSize}`} color="#3b82f6" />
            {activity.placement && <Chip label={`📍 ${activity.placement}`} color="#a855f7" />}
          </div>
          
          {activity.learningConnection && (
            <div style={{ background: `${color}15`, border: `1px solid ${color}33`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color, marginBottom: 4 }}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />LEARNING CONNECTION</div>
              <div style={{ fontSize: 13, color: 'var(--ls-text2)', lineHeight: 1.6 }}>{activity.learningConnection}</div>
            </div>
          )}
          
          {activity.materials && activity.materials.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ls-dim2)', marginBottom: 8 }}><EmojiIcon e="📦" style={{ marginRight: '0.35em' }} />MATERIALS NEEDED</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {activity.materials.map((m, i) => (
                  <span key={i} style={{ fontSize: 12, background: 'rgba(var(--ls-ink),0.06)', border: '1px solid rgba(var(--ls-ink),0.1)', borderRadius: 8, padding: '4px 10px', color: '#d1d5db' }}>{m}</span>
                ))}
              </div>
            </div>
          )}
          
          {activity.steps && activity.steps.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ls-dim2)', marginBottom: 10 }}><EmojiIcon e="📝" style={{ marginRight: '0.35em' }} />ACTIVITY STEPS</div>
              {activity.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: 'var(--ls-text2)', lineHeight: 1.5, paddingTop: 3 }}>{step}</div>
                </div>
              ))}
            </div>
          )}
          
          {activity.mascotTieIn && (
            <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', marginBottom: 4 }}><EmojiIcon e="🤖" style={{ marginRight: '0.35em' }} />MASCOT TIE-IN</div>
              <div style={{ fontSize: 13, color: '#fde68a', lineHeight: 1.5 }}>{activity.mascotTieIn}</div>
            </div>
          )}
          
          {activity.differentiation && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {activity.differentiation.support && (
                <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#60a5fa', marginBottom: 4 }}>🆘 SUPPORT</div>
                  <div style={{ fontSize: 12, color: '#93c5fd', lineHeight: 1.5 }}>{activity.differentiation.support}</div>
                </div>
              )}
              {activity.differentiation.extension && (
                <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#a855f7', marginBottom: 4 }}><EmojiIcon e="🚀" style={{ marginRight: '0.35em' }} />EXTENSION</div>
                  <div style={{ fontSize: 12, color: '#c4b5fd', lineHeight: 1.5 }}>{activity.differentiation.extension}</div>
                </div>
              )}
            </div>
          )}
          
          {activity.safetyNotes && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 12px', marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', marginBottom: 4 }}><EmojiIcon e="⚠️" style={{ marginRight: '0.35em' }} />SAFETY NOTES</div>
              <div style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>{activity.safetyNotes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — WORLD MAP
// ════════════════════════════════════════════════════════════════════════════
function WorldMap({ onSelectYear, onContinue, role, onRoleChange }) {
  const totalXP = getTotalXP();
  const lvl = getLevelInfo(totalXP);
  const cont = findContinue();
  const xpInLevel = totalXP - lvl.xpForLevel;
  const xpSpan = Math.max(1, lvl.xpToNext - lvl.xpForLevel);
  const lvlPct = Math.round((xpInLevel / xpSpan) * 100);
  const [maxYear, setMaxYear] = useState(getKs2MaxYear);

  function pickYear(yr) {
    const y = SAFE_COURSES[yr]?.year;
    if (y && y > maxYear) return;
    onSelectYear(yr);
  }

  return (
    <div style={{ minHeight:'100%', background:BG, color:TEXT, position:'relative',
      padding:'0 0 60px' }}>
      <GlobalStyles />
      {/* HERO */}
      <div style={{ position:'relative', padding:'48px 24px 36px', textAlign:'center', overflow:'hidden',
        background:'radial-gradient(120% 90% at 50% 0%, rgba(99,102,241,0.22), transparent 70%)' }}>
        <Stars count={70} />
        <div style={{ position:'relative', zIndex:1, maxWidth: 720, margin: '0 auto' }}>
          <UniqueHeader
            tone="night"
            color="#a78bfa"
            kind="mission"
            label={role === 'teacher' ? 'Staff planner' : 'ByteBuddies Learn'}
            title={role === 'teacher' ? 'KS2 computing plans' : 'Pick your world'}
          />
          <div style={{ color:TEXT_DIM, fontSize:15, maxWidth:580, margin:'0 auto 18px', textAlign: 'left' }}>
            {role === 'teacher'
              ? 'Open a week for the classroom plan. Switch to pupil view to see the mission children play.'
              : 'Year 3 garden, Year 4 city, Year 5 lab, Year 6 HQ. Click a world, then play Dot’s weekly mission.'}
          </div>
          <ModeToggle role={role} onChange={onRoleChange} />
        </div>
      </div>

      {/* PLAYER LEVEL CARD */}
      <div style={{ maxWidth:760, margin:'0 auto', padding:'0 20px' }}>
        {(() => {
          const contYr = cont?.yr || 'y3';
          const contIdx = cont?.idx ?? 0;
          return <FeaturedWeekCard yr={contYr} idx={contIdx} role={role} onOpen={() => onContinue({ yr: contYr, idx: contIdx })} />;
        })()}
        <div style={{ display:'flex', alignItems:'center', gap:18, background:`linear-gradient(135deg, ${lvl.color}22, ${lvl.color}08)`,
          border:`1px solid ${lvl.color}44`, borderRadius:20, padding:'18px 22px', marginBottom:28 }}>
          <div style={{ fontSize:46, lineHeight:1, animation:'float 4s ease-in-out infinite' }}>
            <HeaderMark kind="done" color={lvl.color} size={46} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6, flexWrap:'wrap', gap:8 }}>
              <span style={{ fontWeight:900, fontSize:18 }}>Level {lvl.level} · {lvl.title}</span>
              <span style={{ fontWeight:800, color:'#fbbf24', fontSize:14 }}>{totalXP.toLocaleString()} XP</span>
            </div>
            <ProgressBar pct={lvlPct} color={lvl.color} height={10} />
            <div style={{ color:TEXT_DIM, fontSize:11, marginTop:5 }}>{xpInLevel} / {xpSpan} XP to Level {lvl.level + 1}</div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, flexWrap:'wrap',
          marginBottom:22, padding:'12px 16px', borderRadius:16, background:CARD_BG, border:`1px solid ${CARD_BORDER}` }}>
          <span style={{ fontSize:13, fontWeight:700, color:TEXT_DIM }}>My school year:</span>
          {[3, 4, 5, 6].map(y => (
            <button key={y} type="button"
              onClick={() => { setKs2MaxYear(y); setMaxYear(y); }}
              style={{ padding:'8px 14px', borderRadius:12, fontWeight:800, fontSize:13, cursor:'pointer',
                border:`1.5px solid ${maxYear === y ? '#818cf8' : CARD_BORDER}`,
                background: maxYear === y ? 'rgba(99,102,241,0.25)' : 'rgba(var(--ls-ink),0.04)',
                color: maxYear === y ? '#c7d2fe' : TEXT_DIM }}>
              Year {y}
            </button>
          ))}
          <span style={{ fontSize:11, color:TEXT_DIM, maxWidth:220 }}>Higher years unlock when you change this setting.</span>
        </div>

        {/* CONTINUE BUTTON */}
        {cont && SAFE_COURSES[cont.yr]?.lessons?.[cont.idx] && (
          <div style={{ marginBottom:26, textAlign:'center' }}>
            <Btn color="#a855f7" variant="ghost" onClick={() => onContinue(cont)} style={{ animation:'pulse-glow 2.5s infinite' }}>
              Continue — {SAFE_COURSES[cont.yr].lessons[cont.idx].title}
            </Btn>
          </div>
        )}

        {/* YEAR CARDS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:18 }}>
          {SAFE_COURSE_ORDER.map(yr => {
            const c = SAFE_COURSES[yr];
            if (!c) return null;
            const prog = getYearProgress(yr);
            const col = c.color || '#6366f1';
            const locked = c.year > maxYear;
            return (
              <button key={yr} onClick={() => pickYear(yr)} disabled={locked}
                style={{ textAlign:'left', cursor: locked ? 'not-allowed' : 'pointer', borderRadius:22, padding:0,
                  background:`linear-gradient(135deg, ${col}20, ${col}08)`, border:`1px solid ${col}44`,
                  color:TEXT, opacity: locked ? 0.45 : 1,
                  transition:'transform .2s, box-shadow .2s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e => { if (!locked) { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 40px ${col}33`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <LessonPicture theme={WORLD_PIC[yr] || 'algorithm'} style={{ height: 130, minHeight: 130 }} wide />
                <div style={{ padding: '18px 20px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, background: col, display: 'grid', placeItems: 'center',
                    transform: 'rotate(-5deg)', flexShrink: 0,
                  }}>
                    <HeaderMark kind={worldMarkKind(yr)} color="#fff" size={30} />
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:col, letterSpacing:1 }}>YEAR {c.year} · {YEAR_WORLDS[yr]?.tag || c.ages}</div>
                    <div style={{ fontSize:20, fontWeight:900 }}>{YEAR_WORLDS[yr]?.world || c.regionName}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, fontWeight:800, color:col, marginBottom:4 }}>{c.lessons?.[0]?.title ? `Week 1: ${c.lessons[0].title}` : c.storyTitle}</div>
                <div style={{ fontSize:13, color:TEXT_DIM, lineHeight:1.5, marginBottom:14 }}>{YEAR_WORLDS[yr]?.blurb || c.tagline}</div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:TEXT_DIM, marginBottom:6 }}>
                  <span>{prog.done}/{prog.total} lessons · {c.lessons?.length || prog.total} in this year</span>
                  <span style={{ fontWeight:800, color:col }}>{prog.pct}%</span>
                </div>
                <ProgressBar pct={prog.pct} color={col} />
                <div style={{ marginTop:16, display:'inline-block', padding:'8px 18px', borderRadius:12,
                  background: locked ? 'rgba(var(--ls-ink),0.12)' : col, color: locked ? 'var(--ls-dim)' : '#fff', fontWeight:800, fontSize:13 }}>
                  {locked ? 'Unlocks in Year ' + c.year : prog.done === 0 ? 'Start' : prog.done === prog.total ? 'Complete' : 'Continue'}
                </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — YEAR VIEW (Duolingo-style path)
// ════════════════════════════════════════════════════════════════════════════
function YearView({ yr, onBack, onSelectLesson, role, onRoleChange }) {
  const c = SAFE_COURSES[yr];
  const lessons = c?.lessons || [];
  const prog = getYearProgress(yr);
  const col = c?.color || '#6366f1';
  const firstUndone = lessons.findIndex((_, i) => !isLessonDone(yr, i));
  const currentIdx = firstUndone === -1 ? Math.max(0, lessons.length - 1) : firstUndone;

  return (
    <div style={{ minHeight:'100%', background:BG, color:TEXT, padding:'0 0 80px' }}>
      <GlobalStyles />
      {/* HEADER */}
      <div style={{ position:'sticky', top:0, zIndex:5, background:`linear-gradient(180deg, ${col}22, ${BG}f5)`,
        backdropFilter:'blur(10px)', padding:'16px 20px', borderBottom:`1px solid ${col}33` }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:col, fontWeight:800, fontSize:14, cursor:'pointer', marginBottom:8 }}>
          ← Worlds
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: col, display: 'grid', placeItems: 'center',
            transform: 'rotate(-6deg)',
          }}>
            <HeaderMark kind={worldMarkKind(yr)} color="#fff" size={26} />
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:11, fontWeight:800, color:col, letterSpacing:1 }}>{YEAR_WORLDS[yr]?.world || `YEAR ${c.year}`}</div>
            <div style={{ fontSize:22, fontWeight:900 }}>{YEAR_WORLDS[yr]?.tag || `Year ${c.year} missions`}</div>
          </div>
          <ModeToggle role={role} onChange={onRoleChange} />
          <div style={{ minWidth:120 }}>
            <div style={{ fontSize:11, color:TEXT_DIM, marginBottom:4, textAlign:'right' }}>{prog.done}/{prog.total} · {prog.pct}%</div>
            <ProgressBar pct={prog.pct} color={col} />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ textAlign:'center', color:TEXT_DIM, maxWidth:520, margin:'0 auto 12px', fontSize:14 }}>{YEAR_WORLDS[yr]?.blurb}</p>
        <FeaturedWeekCard yr={yr} idx={0} role={role} onOpen={() => onSelectLesson(0)} />
      </div>

      {/* PATH */}
      <div style={{ maxWidth:560, margin:'0 auto', padding:'28px 20px 0' }}>
        {(c?.terms || []).map(term => {
          const lessonsInTerm = [];
          for (let i = term.range[0]; i <= term.range[1] && i < lessons.length; i++) lessonsInTerm.push(i);
          return (
            <div key={term.term}>
              {/* TERM BANNER */}
              <div style={{ margin:'10px 0 24px', padding:'12px 18px', borderRadius:16, textAlign:'center',
                background:`linear-gradient(135deg, ${term.color}33, ${term.color}11)`, border:`1px solid ${term.color}55` }}>
                <div style={{ fontSize:11, fontWeight:800, color:term.color, letterSpacing:2 }}>TERM {term.term}</div>
                <div style={{ fontSize:17, fontWeight:900 }}>{term.name}</div>
                <div style={{ fontSize:12, color:TEXT_DIM }}>{term.focus}</div>
              </div>

              {lessonsInTerm.map((idx, ord) => {
                const lesson = lessons[idx];
                const done = isLessonDone(yr, idx);
                const isCurrent = idx === currentIdx && !done;
                const indent = ord % 2 === 0 ? -64 : 64;
                const nodeColor = done ? '#10b981' : isCurrent ? term.color : 'rgba(var(--ls-ink),0.3)';
                return (
                  <div key={idx} style={{ position:'relative', display:'flex', justifyContent:'center', marginBottom:14 }}>
                    {/* connecting dashed line */}
                    <div style={{ position:'absolute', top:0, left:'50%', width:0, height:'100%',
                      borderLeft:`3px dashed ${col}44`, transform:'translateX(-50%)', zIndex:0 }} />
                    <div style={{ transform:`translateX(${indent}px)`, position:'relative', zIndex:1, display:'flex',
                      flexDirection:'column', alignItems:'center', gap:6 }}>
                      <button onClick={() => onSelectLesson(idx)}
                        title={lesson.title}
                        style={{ width:78, height:78, borderRadius:'50%', cursor:'pointer', position:'relative',
                          border:`3px solid ${nodeColor}`, color: done || isCurrent ? '#fff' : 'var(--ls-text)',
                          background: done ? 'linear-gradient(135deg,#065f46,#10b981)' : isCurrent ? `linear-gradient(135deg, ${term.color}, ${term.color}88)` : 'rgba(var(--ls-ink),0.05)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          animation: isCurrent ? 'pulse-glow 2s infinite' : 'none', transition:'transform .15s' }}
                        onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
                        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                        <HeaderMark kind={themeMarkKind(lessonThemeId(lesson))} color="#fff" size={34} />
                        <span style={{ position:'absolute', bottom:-6, right:-6, width:26, height:26, borderRadius:'50%',
                          background: done ? '#10b981' : isCurrent ? term.color : 'var(--ls-node)', color:'#fff',
                          fontSize:13, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center',
                          border:`2px solid ${BG}` }}>
                          {done ? '✓' : isCurrent ? '►' : idx + 1}
                        </span>
                      </button>
                      <div style={{ fontSize:12, fontWeight:700, maxWidth:180, textAlign:'center', color:TEXT }}>{lesson.title}</div>
                      {role === 'teacher' && lesson.bibleActivities?.[0]?.title && (
                        <div style={{ fontSize:10, color:TEXT_DIM, maxWidth:180, textAlign:'center' }}>
                          {lesson.bibleActivities[0].title}
                          {isCodingLesson(lesson) ? ' · coding' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — LESSON PLAYER
// ════════════════════════════════════════════════════════════════════════════
const STEP_LABELS_PUPIL = ['Goal', 'Play', 'Quiz', 'Done'];

function StepBar({ step, color, labels = STEP_LABELS_PUPIL }) {
  return (
    <div style={{ display:'flex', gap:6, padding:'14px 0', alignItems:'center', justifyContent:'center', flexWrap:'wrap' }}>
      {labels.map((lab, i) => (
        <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, minWidth:28 }}>
          <div style={{ width: i === step ? 14 : 9, height: i === step ? 14 : 9, borderRadius:'50%',
            background: i < step ? '#10b981' : i === step ? color : 'rgba(var(--ls-ink),0.18)',
            boxShadow: i === step ? `0 0 12px ${color}` : 'none', transition:'all .3s' }} />
          {i === step && <div style={{ fontSize:9, color, fontWeight:800 }}>{lab}</div>}
        </div>
      ))}
    </div>
  );
}

function StepFrame({ children, color, onBack, onNext, nextLabel = 'Continue →', canNext = true, hideNav }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      <div style={{ flex:1, animation:'fade-up .4s ease', display:'flex', flexDirection:'column' }}>{children}</div>
      {!hideNav && (
        <div style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'20px 0 8px', marginTop:'auto' }}>
          <Btn variant="ghost" color="#94a3b8" onClick={onBack}>← Back</Btn>
          <Btn color={color} onClick={onNext} disabled={!canNext}>{nextLabel}</Btn>
        </div>
      )}
    </div>
  );
}

// ── Teaching card content fallback ──
function cardsFor(lesson) {
  if (lesson.teachingCards && lesson.teachingCards.length) return lesson.teachingCards;
  const cn = lesson.conceptName || 'this concept';
  if (lesson.teach) {
    const mid = Math.max(180, Math.floor(lesson.teach.length / 2));
    const splitAt = lesson.teach.lastIndexOf('. ', mid);
    const cut = splitAt > 120 ? splitAt + 1 : mid;
    const parts = lesson.teach.length > 360
      ? [lesson.teach.slice(0, cut).trim(), lesson.teach.slice(cut).trim()]
      : [lesson.teach];
    const teachCards = parts.map((content, i) => ({
      type: 'concept',
      title: i === 0 ? 'Teacher-led input' : 'Continue learning',
      emoji: '📖',
      content,
    }));
    return [
      ...teachCards,
      { type:'realworld', title:'In the classroom', emoji:'🌍', content: lesson.conceptExplain || lesson.mission,
        example: lesson.parentPrompt || lesson.challenge },
      { type:'check', title:'Quick check!', emoji:'❓',
        content: lesson.quiz?.[0]?.q || `What did we learn about ${cn}?`,
        answer: lesson.quiz?.[0] ? lesson.quiz[0].options[lesson.quiz[0].answer] : 'Think it through!',
        hint:'Aim for at least 3/4 on the end-of-lesson quiz.' },
      { type:'transition', title:'Activities next', emoji:'🚀', content: lesson.mission,
        characterQuote:'Three classroom activities — then the knowledge check!' },
    ];
  }
  return [
    { type:'concept', title:`What is ${cn}?`, emoji:'🧠', content: lesson.conceptExplain || 'A key computing idea.', example: lesson.mission },
    { type:'illustration', title:'How it works', emoji:'⚙️', content:`${cn} works step by step, helping computers do amazing things.`, example: lesson.challenge },
    { type:'realworld', title:'In the real world', emoji:'🌍', content:`${cn} is used in technology all around you, every single day.`, example:'Phones, games, robots and websites all rely on it!' },
    { type:'check', title:'Quick check!', emoji:'❓', content: lesson.quiz?.[0]?.q || `What did we learn about ${cn}?`, answer: lesson.quiz?.[0] ? lesson.quiz[0].options[lesson.quiz[0].answer] : 'Think it through!', hint:'Look back at the concept card.' },
    { type:'transition', title:'Your mission awaits!', emoji:'🚀', content: lesson.mission, characterQuote:'Let\'s put what you learned into action!' },
  ];
}

function BibleActivitiesPanel({ activities, color, completed, onComplete, hideMark }) {
  const [open, setOpen] = useState(() => new Set((activities || []).map((_, i) => i)));
  if (!activities?.length) return null;
  function toggle(ai) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(ai)) next.delete(ai);
      else next.add(ai);
      return next;
    });
  }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {activities.map((act, ai) => (
        <div key={ai} style={{ background:CARD_BG, border:`1px solid ${color}33`, borderRadius:18, overflow:'hidden' }}>
          <button type="button" onClick={() => toggle(ai)}
            style={{ width:'100%', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center',
              background:'transparent', border:'none', cursor:'pointer', color:TEXT, textAlign:'left' }}>
            <div>
              <Chip label={act.label || act.type} color={color} style={{ marginBottom:6 }} />
              <div style={{ fontWeight:800, fontSize:16 }}>{act.title}{act.mins ? ` · ${act.mins} min` : ''}</div>
              {act.purpose && <div style={{ fontSize:12, color:TEXT_DIM, marginTop:4 }}>{act.purpose}</div>}
            </div>
            <span style={{ color:TEXT_DIM }}>{open.has(ai) ? '▲' : '▼'}</span>
          </button>
          {open.has(ai) && (
            <div style={{ padding:'0 18px 16px' }}>
              <ol style={{ margin:0, padding:'0 0 8px 20px', color:'var(--ls-text2)', fontSize:14, lineHeight:1.55 }}>
                {(act.steps || []).map((step, si) => (
                  <li key={si} style={{ marginBottom:8 }}>{step}</li>
                ))}
              </ol>
              {act.check && <div style={{ fontSize:13, color:'#86efac', marginBottom:6 }}><b>Check:</b> {act.check}</div>}
              {act.support && <div style={{ fontSize:13, color:TEXT_DIM, marginBottom:6 }}><b>Support:</b> {act.support}</div>}
              {act.stretch && <div style={{ fontSize:13, color:'#fcd34d' }}><b>Stretch:</b> {act.stretch}</div>}
            </div>
          )}
        </div>
      ))}
      {!hideMark && <Btn color={color} onClick={onComplete}>{completed ? '✓ Ready for next step' : 'Mark activities reviewed'}</Btn>}
    </div>
  );
}

function CodeDebugBanner({ lesson, color }) {
  if (!lesson?.codeDebug) return null;
  return (
    <div style={{ marginBottom: 18, background: `linear-gradient(135deg, ${color}14, transparent)`,
      border: `1px solid ${color}44`, borderRadius: 16, padding: '14px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 1, marginBottom: 6 }}>
        <IconText>{lesson.codingLab ? '🚩 CODING / DEBUG' : '📝 MICRO-DEBUG'}</IconText>
      </div>
      <div style={{ fontSize: 14, color: 'var(--ls-text2)', lineHeight: 1.55 }}>{lesson.codeDebug}</div>
      {lesson.reflection && (
        <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 10, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 800, color: '#c4b5fd' }}>Reflect: </span>{lesson.reflection}
        </div>
      )}
      {lesson.extension && (
        <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 8, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 800, color: '#fcd34d' }}>Extension: </span>{lesson.extension}
        </div>
      )}
    </div>
  );
}

function TeachingCards({ lesson, color, character, onDone, onBack }) {
  const hook = lesson.pupilHook || lesson.mission;
  const cn = lesson.conceptName || 'this idea';
  const cards = [
    { type: 'concept', emoji: lesson.emoji || '🤖', title: 'Your mission', content: hook },
    { type: 'concept', emoji: '💡', title: cn, content: lesson.conceptExplain || hook },
    { type: 'transition', emoji: '🎮', title: 'Play time', content: 'Beat the games, then take the quiz.', characterQuote: hook },
  ];
  const [ci, setCi] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = cards[ci];

  function next() {
    if (ci < cards.length - 1) { setCi(ci + 1); setRevealed(false); }
    else onDone();
  }
  function prev() {
    if (ci > 0) { setCi(ci - 1); setRevealed(false); }
    else onBack();
  }

  return (
    <StepFrame color={color} onBack={prev} onNext={next}
      nextLabel={ci < cards.length - 1 ? 'Next card →' : 'Start Mission →'}>
      <div style={{ textAlign:'center', marginBottom:14 }}>
        <Chip label={`Card ${ci + 1} of ${cards.length}`} color={color} />
      </div>
      <div key={ci} style={{ animation:'slide-in .4s ease', background:CARD_BG, border:`1px solid ${color}44`,
        borderRadius:24, padding:'32px 26px', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ fontSize:64, textAlign:'center', marginBottom:16, animation:'float 3.5s ease-in-out infinite' }}>{card.emoji}</div>
        <div style={{ fontSize:24, fontWeight:900, textAlign:'center', marginBottom:14, color }}>{card.title}</div>
        <div style={{ fontSize:16, lineHeight:1.65, color:'var(--ls-text2)', textAlign:'center', marginBottom:18 }}>{card.content}</div>

        {card.type === 'check' ? (
          <div style={{ textAlign:'center' }}>
            {!revealed ? (
              <Btn color={color} variant="ghost" onClick={() => setRevealed(true)}>Reveal answer 👀</Btn>
            ) : (
              <div style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.4)',
                borderRadius:14, padding:'14px 18px', color:'#6ee7b7' }}>
                <div style={{ fontWeight:900, marginBottom:4 }}>✓ {card.answer}</div>
                {card.hint && <div style={{ fontSize:13, color:TEXT_DIM }}>{card.hint}</div>}
              </div>
            )}
          </div>
        ) : card.type === 'transition' && card.characterQuote ? (
          <CharBubble characterId={character} text={card.characterQuote} />
        ) : card.example ? (
          <div style={{ background:'rgba(var(--ls-ink),0.05)', border:`1px solid ${CARD_BORDER}`,
            borderRadius:14, padding:'12px 16px', fontSize:13, color:TEXT_DIM }}>
            <span style={{ fontWeight:800, color }}>Example: </span>{card.example}
          </div>
        ) : null}
      </div>
    </StepFrame>
  );
}

// ── Quiz step ──
function buildFallbackQuiz(lesson) {
  const cn = lesson.conceptName || lesson.title;
  const ce = lesson.conceptExplain || `${cn} is an important computing concept.`;
  const tc = lesson.teachingCards || [];
  const q1answer = tc[3]?.answer || ce.slice(0, 40);
  return [
    { q: `What is ${cn}?`, options: [ce.slice(0,50), 'A type of robot', 'A computer virus', 'A keyboard shortcut'], answer: 0 },
    { q: `When would you use ${cn}?`, options: ['Never', 'Only at home', lesson.challenge?.slice(0,50) || 'To solve problems in computing', 'Only with robots'], answer: 2 },
    { q: tc[3]?.content || `What is a key feature of ${cn}?`, options: [q1answer, 'It always crashes', 'It needs the internet', 'It only works once'], answer: 0 },
  ];
}

function QuizStep({ lesson, color, onScore, onBack, workKey }) {
  const questions = (lesson.quiz && lesson.quiz.length >= 2) ? lesson.quiz : buildFallbackQuiz(lesson);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = questions.filter((qz, i) => answers[i] === qz.answer).length;
  const passMark = Math.ceil(questions.length * 0.75);
  const passed = score >= passMark;
  const stars = score === questions.length ? 3 : score >= passMark ? 2 : score >= 1 ? 1 : 0;
  const allAnswered = Object.keys(answers).length === questions.length;
  const letters = ['A','B','C','D','E'];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%', animation:'fade-up .4s ease' }}>
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ fontSize:26, fontWeight:900 }}>Dot’s quiz</div>
        <div style={{ color:TEXT_DIM, fontSize:13 }}>Answer all {questions.length} questions · pass with {passMark}/{questions.length}+</div>
      </div>
      {questions.map((qz, qi) => (
        <div key={qi} style={{ marginBottom:22, background:CARD_BG, border:`1px solid ${CARD_BORDER}`, borderRadius:18, padding:'18px' }}>
          <div style={{ fontWeight:800, marginBottom:12, fontSize:15 }}>{qi + 1}. {qz.q || 'Question'}</div>
          {(qz.options || []).map((opt, oi) => {
            const chosen = answers[qi] === oi;
            const correct = submitted && oi === qz.answer;
            const wrong = submitted && chosen && oi !== qz.answer;
            return (
              <button key={oi} disabled={submitted}
                onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                style={{ display:'flex', gap:10, alignItems:'center', width:'100%', textAlign:'left', padding:'11px 14px',
                  marginBottom:7, borderRadius:12, fontSize:14, cursor: submitted ? 'default' : 'pointer',
                  border:`1.5px solid ${correct ? '#10b981' : wrong ? '#ef4444' : chosen ? color : CARD_BORDER}`,
                  background: correct ? 'rgba(16,185,129,0.14)' : wrong ? 'rgba(239,68,68,0.14)' : chosen ? `${color}22` : 'rgba(var(--ls-ink),0.03)',
                  color: correct ? '#6ee7b7' : wrong ? '#fca5a5' : '#e2e8f0' }}>
                <span style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, fontWeight:900, fontSize:12,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: correct ? '#10b981' : wrong ? '#ef4444' : 'rgba(var(--ls-ink),0.1)', color: correct || wrong ? '#fff' : 'var(--ls-text2)' }}>
                  {correct ? '✓' : wrong ? '✗' : letters[oi]}
                </span>
                {opt}
              </button>
            );
          })}
          {submitted && answers[qi] !== qz.answer && qz.options && (
            <div style={{ fontSize:12, color:'#6ee7b7', marginTop:4 }}>
              ✓ Correct answer: {qz.options[qz.answer]}
            </div>
          )}
          {submitted && qz.rationale && (
            <div style={{ fontSize:12, color:TEXT_DIM, marginTop:8, lineHeight:1.5, fontStyle:'italic' }}>
              {qz.rationale}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
          <Btn variant="ghost" color="#94a3b8" onClick={onBack}>← Back</Btn>
          <Btn color={color} disabled={!allAnswered} onClick={() => {
            setSubmitted(true);
            const prev = readWork(workKey);
            recordWork(workKey, {
              type: 'lesson', title: lesson.title, score, total: questions.length, stars, attempts: (prev?.attempts || 0) + 1, completedAt: new Date().toISOString(),
              quiz: questions.map((qz, qi) => ({ q: qz.q, chosen: qz.options?.[answers[qi]] ?? '', correct: qz.options?.[qz.answer] ?? '', ok: answers[qi] === qz.answer })),
            });
          }}>Submit Answers</Btn>
        </div>
      ) : (
        <div style={{ textAlign:'center', background:CARD_BG, border:`1px solid ${color}44`, borderRadius:20, padding:'24px' }}>
          <div style={{ fontSize:38, color:'#fbbf24', marginBottom:6 }}><Stars3 n={stars} /></div>
          <div style={{ fontSize:22, fontWeight:900 }}>{score}/{questions.length} correct!</div>
          <div style={{ color:TEXT_DIM, fontSize:14, marginBottom:16 }}>
            {passed
              ? (stars === 3 ? 'Perfect score!' : 'Great job — you passed!')
              : `You need ${passMark} or more to pass. Read the notes and try again.`}
          </div>
          {passed && <Chip label={`+${lesson.xp} XP ready to collect`} color="#fbbf24" style={{ fontSize:13 }} />}
          <div style={{ marginTop:18, display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            {passed ? (
              <Btn color={color} onClick={() => onScore(score, questions.length, stars)}>Collect Reward →</Btn>
            ) : (
              <Btn color={color} onClick={() => { setSubmitted(false); setAnswers({}); }}>Try Quiz Again</Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reward step ──
function RewardStep({ lesson, color, score, quizTotal, stars, nextLesson, onNextLesson, onMap }) {
  const [shownXP, setShownXP] = useState(0);
  useEffect(() => {
    let v = 0; const target = lesson.xp; const step = Math.max(1, Math.round(target / 30));
    const t = setInterval(() => { v += step; if (v >= target) { v = target; clearInterval(t); } setShownXP(v); }, 30);
    return () => clearInterval(t);
  }, [lesson.xp]);

  const confetti = useMemo(() => Array.from({ length: 50 }, () => ({
    left: Math.random() * 100, delay: Math.random() * 2, dur: Math.random() * 2 + 2.2,
    color: ['#fbbf24','#10b981','#3b82f6','#a855f7','#ec4899','#f87171'][Math.floor(Math.random() * 6)],
    size: Math.random() * 8 + 6,
  })), []);

  return (
    <div style={{ position:'relative', textAlign:'center', paddingTop:10, minHeight:'100%' }}>
      {/* confetti */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {confetti.map((c, i) => (
          <div key={i} style={{ position:'absolute', top:-20, left:`${c.left}%`, width:c.size, height:c.size * 1.4,
            background:c.color, borderRadius:2, animation:`confetti-fall ${c.dur}s linear ${c.delay}s infinite` }} />
        ))}
      </div>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ margin: '0 auto 8px', width: 72, height: 72, borderRadius: 22, background: color, display: 'grid', placeItems: 'center', transform: 'rotate(-8deg)' }}>
          <HeaderMark kind="done" color="#fff" size={40} />
        </div>
        <div style={{ fontSize:28, fontWeight:900, marginBottom:4 }}>Mission complete</div>
        <div style={{ color:TEXT_DIM, marginBottom:20 }}>{lesson.title}</div>

        <div style={{ display:'inline-block', background:`linear-gradient(135deg, ${color}33, ${color}11)`,
          border:`1px solid ${color}55`, borderRadius:24, padding:'24px 40px', marginBottom:20 }}>
          <div style={{ fontSize:54, fontWeight:900, color:'#fbbf24', textShadow:'0 0 24px #fbbf2466' }}>+{shownXP}</div>
          <div style={{ fontSize:13, fontWeight:800, color:'#fbbf24', letterSpacing:2 }}>XP EARNED</div>
          <div style={{ fontSize:28, color:'#fbbf24', marginTop:8 }}><Stars3 n={stars} /></div>
          <div style={{ fontSize:12, color:TEXT_DIM }}>{score}/{quizTotal} quiz correct</div>
        </div>

        {lesson.badge && (
          <div style={{ marginBottom:20, animation:'bounce-in .8s ease' }}>
            <HeaderMark kind="cup" color={color} size={40} />
            <div style={{ fontSize:13, fontWeight:800, color, marginTop: 6 }}>Badge unlocked</div>
          </div>
        )}

        {nextLesson && (
          <div style={{ background:CARD_BG, border:`1px solid ${CARD_BORDER}`, borderRadius:18, padding:'16px',
            maxWidth:360, margin:'0 auto 22px', display:'flex', alignItems:'center', gap:12 }}>
            <HeaderMark kind={themeMarkKind(lessonThemeId(nextLesson))} color={color} size={32} />
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:11, color:TEXT_DIM, fontWeight:700 }}>UP NEXT</div>
              <div style={{ fontWeight:800 }}>{nextLesson.title}</div>
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          {nextLesson && <Btn color={color} onClick={onNextLesson}>Next Lesson →</Btn>}
          <Btn variant="ghost" color="#94a3b8" onClick={onMap}>Back to Map</Btn>
        </div>
      </div>
    </div>
  );
}

function kidTeach(lesson) {
  const raw = String(lesson.teach || lesson.mission || '');
  const cut = raw.split(/\s*International notes:/i)[0].trim();
  return cut || lesson.storyLine || lesson.mission || '';
}

function LessonPlayer({ yr, idx, onBack, onComplete, onNextLesson, onMap, role, onRoleChange }) {
  const c = SAFE_COURSES[yr];
  const lessons = c?.lessons || [];
  const lesson = lessons[idx];
  const term = getTermForLesson(yr, idx);
  const color = (term && term.color) || c?.color || '#6366f1';
  const [score, setScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [stars, setStars] = useState(0);
  const [phase, setPhase] = useState('intro');
  const interactives = buildKs2LessonInteractives(yr, idx);
  const puzzleLevels = getPuzzleLevels(yr, idx, interactives);

  useEffect(() => { setPhase('intro'); }, [yr, idx, role]);

  if (!lesson) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'rgba(var(--ls-ink),0.5)', background: BG, height: '100%' }}>
        <p>Lesson not found.</p>
        <button onClick={onBack} style={{ marginTop: 20, padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  const nextIdx = idx + 1 < lessons.length ? idx + 1 : null;
  const nextLesson = nextIdx != null ? lessons[nextIdx] : null;
  const hasCodingLab = isCodingLesson(lesson);
  const hook = lesson.pupilHook || lesson.mission;
  const theme = pictureForSlide(lesson, 'title');
  const mark = themeMarkKind(lessonThemeId(lesson));
  const teaching = getTeaching(yr, idx);
  const goals = (teaching?.objectives?.length ? teaching.objectives : lesson.objectives || []).slice(0, 3);
  const words = (lesson.vocabulary || []).slice(0, 4).map((v) => v?.word || v).filter(Boolean);
  const phaseLabel = { intro: 'Goal', learn: 'Learn', play: 'Play', quiz: 'Quiz', done: 'Done' }[phase] || 'Goal';

  const shell = (inner) => (
    <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', background: BG, color: TEXT }}>
      <GlobalStyles />
      <div style={{
        flexShrink: 0, background: BG, borderBottom: `1px solid ${CARD_BORDER}`,
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color, fontWeight: 800, cursor: 'pointer' }}>← Path</button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 14 }}>Week {lesson.week || idx + 1} · {phaseLabel}</div>
        <ModeToggle role={role} onChange={onRoleChange} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px 16px 20px', maxWidth: 920, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {inner}
      </div>
    </div>
  );

  if (phase === 'quiz') {
    return shell(
      <QuizStep workKey={`lesson:${yr}:${idx}`} lesson={lesson} color={color} onBack={() => setPhase('play')}
        onScore={(s, total, st) => {
          setScore(s); setQuizTotal(total); setStars(st);
          onComplete(yr, idx, lesson.xp);
          setPhase('done');
        }} />
    );
  }

  if (phase === 'done') {
    return shell(
      <RewardStep lesson={lesson} color={color} score={score} quizTotal={quizTotal} stars={stars} nextLesson={nextLesson}
        onNextLesson={() => nextIdx != null && onNextLesson(yr, nextIdx)} onMap={onMap} />
    );
  }

  if (phase === 'learn') {
    return shell(
      <StepFrame color={color} onBack={() => setPhase('intro')} onNext={() => setPhase('play')} nextLabel="Play now →">
        <UniqueHeader tone="night" color={color} kind="learn" label="Learn" title={lesson.title} />
        <PupilLearn teaching={teaching} color={color} />
      </StepFrame>
    );
  }

  if (phase === 'play') {
    return shell(
      <StepFrame color={color} onBack={() => setPhase(teaching ? 'learn' : 'intro')} onNext={() => setPhase('quiz')} nextLabel="Take the quiz →">
        <UniqueHeader tone="night" color={color} kind="play" label="Play" title="Beat Dot’s challenges" />
        <p style={{ color: TEXT_DIM, margin: '0 0 16px', fontSize: 15, lineHeight: 1.5 }}>{hook}</p>
        {puzzleLevels.length > 0 ? (
          <PuzzleProgression puzzles={puzzleLevels} color={color} minLevelsToPass={1} />
        ) : (
          <ActivityRenderer activity={{ type: 'seq', title: 'Sequence sprint', steps: ['Plan', 'Predict', 'Run', 'Check'],
            instructions: 'Put the steps in order.' }} color={color} />
        )}
        {hasCodingLab && (
          <div style={{ marginTop: 20 }}>
            <UniqueHeader tone="night" color="#fbbf24" kind="blocks" label="Studio" title="Build it in code" />
            <CodingLabPanel yr={yr} idx={idx} lesson={lesson} color={color} />
          </div>
        )}
      </StepFrame>
    );
  }

  return shell(
    <StepFrame color={color} onBack={onBack} onNext={() => setPhase(teaching ? 'learn' : 'play')} nextLabel={teaching ? 'Start learning →' : 'Play now →'}>
      <div className="bb-pupil-split">
        <LessonPicture theme={theme} className="bb-pupil-split__art" />
        <div>
          <UniqueHeader
            tone="night"
            color={color}
            kind={mark}
            label={`Year ${c.year} · Week ${lesson.week || idx + 1} · ${term?.name || 'Term'}`}
            title={lesson.title}
          />
          <p style={{ color: 'var(--ls-text2)', fontSize: 16, lineHeight: 1.6, margin: '0 0 10px' }}>{hook}</p>
          {words.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {words.map((w) => <Chip key={w} label={w} color={color} />)}
            </div>
          )}
        </div>
      </div>
      {goals.length > 0 && (
        <ul className="bb-pupil-goals">
          {goals.map((g, i) => (
            <li key={i}>
              <b style={{ background: color }}>{i + 1}</b>
              <span>{g}</span>
            </li>
          ))}
        </ul>
      )}
    </StepFrame>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════
function LearnSectionInner({ subPath = '' }) {
  const { user, isLoggedIn } = useUser();
  const accountLocksPupil = isLoggedIn && (user?.role === 'student' || user?.role === 'parent');
  const initial = parseLearnRoute(subPath);
  const [screen, setScreen] = useState(initial.screen);
  const [activeYr, setActiveYr] = useState(initial.yr);
  const [activeIdx, setActiveIdx] = useState(initial.idx);
  const [role, setRole] = useState(() => (accountLocksPupil ? 'pupil' : getLearnRole()));
  const [, force] = useState(0);
  const refresh = useCallback(() => force(n => n + 1), []);

  function changeRole(next) {
    if (accountLocksPupil) {
      setLearnRole('pupil');
      setRole('pupil');
      return;
    }
    setLearnRole(next);
    setRole(next);
  }

  useEffect(() => {
    if (accountLocksPupil) {
      setLearnRole('pupil');
      setRole('pupil');
    }
  }, [accountLocksPupil]);

  useEffect(() => {
    const next = parseLearnRoute(subPath);
    setScreen(next.screen);
    setActiveYr(next.yr);
    setActiveIdx(next.idx);
  }, [subPath]);

  function hashYear(yr) { window.location.hash = `learn/${yr}`; }
  function hashLesson(yr, idx) {
    window.location.hash = `learn/${yr}/w${String(idx + 1).padStart(2, '0')}`;
  }
  function hashPlan(yr, idx) {
    window.location.hash = `learn/${yr}/w${String(idx + 1).padStart(2, '0')}/plan`;
  }
  function hashWorld() { window.location.hash = 'learn/world'; }

  function handleComplete(yr, idx, xp) {
    if (!isLessonDone(yr, idx)) {
      markDone(yr, idx);
      if (xp) addXP(xp);
    }
    const prog = getYearProgress(yr);
    if (prog.done === prog.total && !isBadgeShown(yr)) markBadgeShown(yr);
    refresh();
  }

  if (role === 'teacher') {
    if (screen === 'world') {
      return (
        <div className="bb-learn-screen">
          <TeacherHome
            onPupil={() => changeRole('pupil')}
            onSelectYear={hashYear}
            onOpenLesson={(yr, idx) => hashLesson(yr, idx)}
            onOpenPlan={(yr, idx) => hashPlan(yr, idx)}
          />
        </div>
      );
    }
    if (screen === 'year') {
      return (
        <div className="bb-learn-screen">
          <TeacherScheme
            yr={activeYr}
            onBack={hashWorld}
            onPupil={() => changeRole('pupil')}
            onSelectYear={hashYear}
            onSelectLesson={(idx) => hashPlan(activeYr, idx)}
          />
        </div>
      );
    }
    const lessons = SAFE_COURSES[activeYr]?.lessons || [];
    if (screen === 'plan' || screen === 'lesson') {
      if (screen === 'plan') {
        return (
          <div className="bb-learn-screen bb-learn-screen--staff">
            <TeacherLesson
              yr={activeYr}
              idx={activeIdx}
              onBack={() => { window.location.hash = `learn/${activeYr}`; }}
              onPupil={() => changeRole('pupil')}
              onComplete={handleComplete}
              onOpenLesson={() => hashLesson(activeYr, activeIdx)}
              onPrev={activeIdx > 0 ? () => hashPlan(activeYr, activeIdx - 1) : null}
              onNext={activeIdx + 1 < lessons.length ? () => hashPlan(activeYr, activeIdx + 1) : null}
            />
          </div>
        );
      }
      return (
        <div className="bb-learn-screen bb-learn-screen--lesson">
          <ClassroomLesson
            key={`${activeYr}-${activeIdx}-teacher`}
            yr={activeYr} idx={activeIdx}
            role="teacher" onRoleChange={changeRole}
            onBack={() => window.location.hash = `learn/${activeYr}`}
            onPlan={() => hashPlan(activeYr, activeIdx)}
            onComplete={handleComplete}
            onNextLesson={(yr, idx) => hashLesson(yr, idx)}
            onMap={() => { window.location.hash = 'learn/world'; }}
          />
        </div>
      );
    }
  }

  if (screen === 'world') {
    return (
      <div className="bb-learn-screen">
        <WorldMap
          role={role}
          onRoleChange={changeRole}
          onSelectYear={hashYear}
          onContinue={({ yr, idx }) => hashLesson(yr, idx)}
        />
      </div>
    );
  }

  if (screen === 'year') {
    return (
      <div className="bb-learn-screen">
        <YearView yr={activeYr} role={role} onRoleChange={changeRole} onBack={hashWorld}
          onSelectLesson={idx => hashLesson(activeYr, idx)} />
      </div>
    );
  }

  return (
    <div className="bb-learn-screen bb-learn-screen--lesson">
      <LessonPlayer
        key={`${activeYr}-${activeIdx}-pupil`}
        yr={activeYr} idx={activeIdx}
        role={role} onRoleChange={changeRole}
        onBack={() => { window.location.hash = `learn/${activeYr}`; }}
        onComplete={handleComplete}
        onNextLesson={(yr, idx) => hashLesson(yr, idx)}
        onMap={() => { window.location.hash = 'learn/world'; }}
      />
    </div>
  );
}

export default function LearnSection({ subPath = '' }) {
  return (
    <LearnErrorBoundary>
      <div className="bb-learn-hub">
        <LearnSectionInner subPath={subPath} />
      </div>
    </LearnErrorBoundary>
  );
}
