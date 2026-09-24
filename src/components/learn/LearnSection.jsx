import React, { useState, useEffect, useCallback, useMemo, Component } from 'react';
import { COURSES, CHARACTERS, COURSE_ORDER, getLevelInfo } from '../../data/learnWorldData';
import { getLessonInteractives } from '../../data/learnInteractiveActivities';
import { getPuzzleLevels } from '../../data/learnPuzzleLevels';
import PuzzleProgression from './activities/PuzzleProgression';
import ActivityRenderer from './activities/ActivityRenderer';
import CodingLabPanel from './CodingLab/CodingLabPanel';

// Safe fallbacks - handle undefined imports gracefully
const SAFE_COURSE_ORDER = COURSE_ORDER && Array.isArray(COURSE_ORDER) ? COURSE_ORDER : ['y3', 'y4', 'y5', 'y6'];
const SAFE_COURSES = COURSES && typeof COURSES === 'object' ? COURSES : {};

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
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>{this.state.error?.message || 'Unknown error'}</p>
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
const doneKey  = (yr, i) => `bb_world_${yr}_l${i}`;
const badgeKey = (yr)    => `bb_world_badge_${yr}`;

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
const BG = '#060611';
const CARD_BG = 'rgba(255,255,255,0.04)';
const CARD_BORDER = 'rgba(255,255,255,0.1)';
const TEXT = '#f8fafc';
const TEXT_DIM = 'rgba(255,255,255,0.6)';

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
      .bb-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:8px}
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
          width:s.size, height:s.size, borderRadius:'50%', background:'#fff',
          animation:`twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }} />
      ))}
    </div>
  );
}

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
function ProgressBar({ pct, color, height = 8, style = {} }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:99, height, overflow:'hidden', ...style }}>
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
        <div style={{ fontSize:14, color:'#e2e8f0', lineHeight:1.55 }}>{text}</div>
      </div>
    </div>
  );
}

function CompanionActivitySection({ activity, color }) {
  const [expanded, setExpanded] = useState(false);
  if (!activity) return null;
  
  return (
    <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}33`, borderRadius: 18, overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', cursor: 'pointer', color: '#e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🎓</span>
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
              <div style={{ fontSize: 11, fontWeight: 800, color, marginBottom: 4 }}>💡 LEARNING CONNECTION</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>{activity.learningConnection}</div>
            </div>
          )}
          
          {activity.materials && activity.materials.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 8 }}>📦 MATERIALS NEEDED</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {activity.materials.map((m, i) => (
                  <span key={i} style={{ fontSize: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px', color: '#d1d5db' }}>{m}</span>
                ))}
              </div>
            </div>
          )}
          
          {activity.steps && activity.steps.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 10 }}>📝 ACTIVITY STEPS</div>
              {activity.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, paddingTop: 3 }}>{step}</div>
                </div>
              ))}
            </div>
          )}
          
          {activity.mascotTieIn && (
            <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', marginBottom: 4 }}>🤖 MASCOT TIE-IN</div>
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
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#a855f7', marginBottom: 4 }}>🚀 EXTENSION</div>
                  <div style={{ fontSize: 12, color: '#c4b5fd', lineHeight: 1.5 }}>{activity.differentiation.extension}</div>
                </div>
              )}
            </div>
          )}
          
          {activity.safetyNotes && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 12px', marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', marginBottom: 4 }}>⚠️ SAFETY NOTES</div>
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
function WorldMap({ onSelectYear, onContinue }) {
  const totalXP = getTotalXP();
  const lvl = getLevelInfo(totalXP);
  const cont = findContinue();
  const xpInLevel = totalXP - lvl.xpForLevel;
  const xpSpan = Math.max(1, lvl.xpToNext - lvl.xpForLevel);
  const lvlPct = Math.round((xpInLevel / xpSpan) * 100);

  return (
    <div style={{ minHeight:'100%', background:BG, color:TEXT, position:'relative',
      padding:'0 0 60px' }}>
      <GlobalStyles />
      {/* HERO */}
      <div style={{ position:'relative', padding:'48px 24px 36px', textAlign:'center', overflow:'hidden',
        background:'radial-gradient(120% 90% at 50% 0%, rgba(99,102,241,0.22), transparent 70%)' }}>
        <Stars count={70} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'clamp(28px,5vw,46px)', fontWeight:900, letterSpacing:-1,
            background:'linear-gradient(90deg,#818cf8,#a855f7,#ec4899)', WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent', marginBottom:6 }}>
            🌍 ByteBuddies Learning World
          </div>
          <div style={{ color:TEXT_DIM, fontSize:15, maxWidth:540, margin:'0 auto' }}>
            Four worlds. Endless missions. Become a technology creator.
          </div>
        </div>
      </div>

      {/* PLAYER LEVEL CARD */}
      <div style={{ maxWidth:760, margin:'0 auto', padding:'0 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:18, background:`linear-gradient(135deg, ${lvl.color}22, ${lvl.color}08)`,
          border:`1px solid ${lvl.color}44`, borderRadius:20, padding:'18px 22px', marginBottom:28 }}>
          <div style={{ fontSize:46, lineHeight:1, animation:'float 4s ease-in-out infinite' }}>{lvl.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6, flexWrap:'wrap', gap:8 }}>
              <span style={{ fontWeight:900, fontSize:18 }}>Level {lvl.level} · {lvl.title}</span>
              <span style={{ fontWeight:800, color:'#fbbf24', fontSize:14 }}>{totalXP.toLocaleString()} XP</span>
            </div>
            <ProgressBar pct={lvlPct} color={lvl.color} height={10} />
            <div style={{ color:TEXT_DIM, fontSize:11, marginTop:5 }}>{xpInLevel} / {xpSpan} XP to Level {lvl.level + 1}</div>
          </div>
        </div>

        {/* CONTINUE BUTTON */}
        {cont && SAFE_COURSES[cont.yr]?.lessons?.[cont.idx] && (
          <div style={{ marginBottom:26, textAlign:'center' }}>
            <Btn color="#a855f7" variant="ghost" onClick={() => onContinue(cont)} style={{ animation:'pulse-glow 2.5s infinite' }}>
              ▶ Continue Adventure — {SAFE_COURSES[cont.yr].lessons[cont.idx].emoji} {SAFE_COURSES[cont.yr].lessons[cont.idx].title}
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
            return (
              <button key={yr} onClick={() => onSelectYear(yr)}
                style={{ textAlign:'left', cursor:'pointer', borderRadius:22, padding:'22px',
                  background:`linear-gradient(135deg, ${col}20, ${col}08)`, border:`1px solid ${col}44`,
                  color:TEXT, transition:'transform .2s, box-shadow .2s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 40px ${col}33`; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
                  <div style={{ fontSize:48, lineHeight:1 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:col, letterSpacing:1 }}>YEAR {c.year} · {c.ages}</div>
                    <div style={{ fontSize:20, fontWeight:900 }}>{c.regionName}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, fontWeight:800, color:col, marginBottom:4 }}>{c.storyTitle}</div>
                <div style={{ fontSize:13, color:TEXT_DIM, lineHeight:1.5, marginBottom:14, fontStyle:'italic' }}>{c.tagline}</div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:TEXT_DIM, marginBottom:6 }}>
                  <span>{prog.done}/{prog.total} lessons</span>
                  <span style={{ fontWeight:800, color:col }}>{prog.pct}%</span>
                </div>
                <ProgressBar pct={prog.pct} color={col} />
                <div style={{ marginTop:16, display:'inline-block', padding:'8px 18px', borderRadius:12,
                  background:col, color:'#fff', fontWeight:800, fontSize:13 }}>
                  {prog.done === 0 ? '▶ Start' : prog.done === prog.total ? '✓ Complete' : '▶ Continue'}
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
function YearView({ yr, onBack, onSelectLesson }) {
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
          <div style={{ fontSize:36 }}>{c.icon}</div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:11, fontWeight:800, color:col, letterSpacing:1 }}>YEAR {c.year} · {c.regionName}</div>
            <div style={{ fontSize:22, fontWeight:900 }}>{c.storyTitle}</div>
          </div>
          <div style={{ minWidth:120 }}>
            <div style={{ fontSize:11, color:TEXT_DIM, marginBottom:4, textAlign:'right' }}>{prog.done}/{prog.total} · {prog.pct}%</div>
            <ProgressBar pct={prog.pct} color={col} />
          </div>
        </div>
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
                const nodeColor = done ? '#10b981' : isCurrent ? term.color : 'rgba(255,255,255,0.3)';
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
                          border:`3px solid ${nodeColor}`, color:nodeColor,
                          background: done ? 'linear-gradient(135deg,#065f46,#10b981)' : isCurrent ? `linear-gradient(135deg, ${term.color}, ${term.color}88)` : 'rgba(255,255,255,0.05)',
                          fontSize:30, display:'flex', alignItems:'center', justifyContent:'center',
                          animation: isCurrent ? 'pulse-glow 2s infinite' : 'none', transition:'transform .15s' }}
                        onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
                        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                        {lesson.emoji}
                        <span style={{ position:'absolute', bottom:-6, right:-6, width:26, height:26, borderRadius:'50%',
                          background: done ? '#10b981' : isCurrent ? term.color : '#1e293b', color:'#fff',
                          fontSize:13, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center',
                          border:`2px solid ${BG}` }}>
                          {done ? '✓' : isCurrent ? '►' : idx + 1}
                        </span>
                      </button>
                      <div style={{ fontSize:12, fontWeight:700, maxWidth:150, textAlign:'center', color:TEXT }}>{lesson.title}</div>
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
const STEP_LABELS = ['Intro','Story','Learn','Learn','Learn','Learn','Activity','Code','Quiz','Reward'];

function StepBar({ step, color }) {
  return (
    <div style={{ display:'flex', gap:6, padding:'14px 0', alignItems:'center', justifyContent:'center', flexWrap:'wrap' }}>
      {STEP_LABELS.map((lab, i) => (
        <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, minWidth:28 }}>
          <div style={{ width: i === step ? 14 : 9, height: i === step ? 14 : 9, borderRadius:'50%',
            background: i < step ? '#10b981' : i === step ? color : 'rgba(255,255,255,0.18)',
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
  return [
    { type:'concept', title:`What is ${cn}?`, emoji:'🧠', content: lesson.conceptExplain || 'A key computing idea.', example: lesson.mission },
    { type:'illustration', title:'How it works', emoji:'⚙️', content:`${cn} works step by step, helping computers do amazing things.`, example: lesson.challenge },
    { type:'realworld', title:'In the real world', emoji:'🌍', content:`${cn} is used in technology all around you, every single day.`, example:'Phones, games, robots and websites all rely on it!' },
    { type:'check', title:'Quick check!', emoji:'❓', content: lesson.quiz?.[0]?.q || `What did we learn about ${cn}?`, answer: lesson.quiz?.[0] ? lesson.quiz[0].options[lesson.quiz[0].answer] : 'Think it through!', hint:'Look back at the concept card.' },
    { type:'transition', title:'Your mission awaits!', emoji:'🚀', content: lesson.mission, characterQuote:'Let\'s put what you learned into action!' },
  ];
}

function TeachingCards({ lesson, color, character, onDone, onBack }) {
  const cards = cardsFor(lesson);
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
        <div style={{ fontSize:16, lineHeight:1.65, color:'#e2e8f0', textAlign:'center', marginBottom:18 }}>{card.content}</div>

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
          <div style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${CARD_BORDER}`,
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

function QuizStep({ lesson, color, onScore, onBack }) {
  const questions = (lesson.quiz && lesson.quiz.length >= 2) ? lesson.quiz : buildFallbackQuiz(lesson);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = questions.filter((qz, i) => answers[i] === qz.answer).length;
  const stars = score === questions.length ? 3 : score >= Math.ceil(questions.length * 0.6) ? 2 : score >= 1 ? 1 : 0;
  const allAnswered = Object.keys(answers).length === questions.length;
  const letters = ['A','B','C','D','E'];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%', animation:'fade-up .4s ease' }}>
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ fontSize:26, fontWeight:900 }}>🎯 Knowledge Check</div>
        <div style={{ color:TEXT_DIM, fontSize:13 }}>Answer all {questions.length} questions</div>
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
                  background: correct ? 'rgba(16,185,129,0.14)' : wrong ? 'rgba(239,68,68,0.14)' : chosen ? `${color}22` : 'rgba(255,255,255,0.03)',
                  color: correct ? '#6ee7b7' : wrong ? '#fca5a5' : '#e2e8f0' }}>
                <span style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, fontWeight:900, fontSize:12,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: correct ? '#10b981' : wrong ? '#ef4444' : 'rgba(255,255,255,0.1)', color:'#fff' }}>
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
        </div>
      ))}

      {!submitted ? (
        <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
          <Btn variant="ghost" color="#94a3b8" onClick={onBack}>← Back</Btn>
          <Btn color={color} disabled={!allAnswered} onClick={() => setSubmitted(true)}>Submit Answers</Btn>
        </div>
      ) : (
        <div style={{ textAlign:'center', background:CARD_BG, border:`1px solid ${color}44`, borderRadius:20, padding:'24px' }}>
          <div style={{ fontSize:38, color:'#fbbf24', marginBottom:6 }}><Stars3 n={stars} /></div>
          <div style={{ fontSize:22, fontWeight:900 }}>{score}/{questions.length} correct!</div>
          <div style={{ color:TEXT_DIM, fontSize:14, marginBottom:16 }}>
            {stars === 3 ? 'Perfect! 🎉' : stars === 2 ? 'Great job! 👍' : 'Keep practising! 💪'}
          </div>
          <Chip label={`+${lesson.xp} XP ready to collect`} color="#fbbf24" style={{ fontSize:13 }} />
          <div style={{ marginTop:18 }}>
            <Btn color={color} onClick={() => onScore(score, questions.length, stars)}>Collect Reward →</Btn>
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
        <div style={{ fontSize:70, animation:'bounce-in .6s ease' }}>🎉</div>
        <div style={{ fontSize:28, fontWeight:900, marginBottom:4 }}>Lesson Complete!</div>
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
            <div style={{ fontSize:48 }}>{lesson.badge}</div>
            <div style={{ fontSize:13, fontWeight:800, color }}>Badge Unlocked!</div>
          </div>
        )}

        {nextLesson && (
          <div style={{ background:CARD_BG, border:`1px solid ${CARD_BORDER}`, borderRadius:18, padding:'16px',
            maxWidth:360, margin:'0 auto 22px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:34 }}>{nextLesson.emoji}</div>
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

function LessonPlayer({ yr, idx, onBack, onComplete, onNextLesson, onMap }) {
  const c = SAFE_COURSES[yr];
  const lessons = c?.lessons || [];
  const lesson = lessons[idx];
  const term = getTermForLesson(yr, idx);
  const color = (term && term.color) || c?.color || '#6366f1';
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [stars, setStars] = useState(0);
  const [activityDone, setActivityDone] = useState(false);
  const interactives = getLessonInteractives(yr, idx);
  const puzzleLevels = getPuzzleLevels(yr, idx, interactives);
  
  // Guard against missing lesson
  if (!lesson) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        <p>Lesson not found.</p>
        <button onClick={onBack} style={{ marginTop: 20, padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>
          ← Go Back
        </button>
      </div>
    );
  }
  
  const activity = lesson.activity || null;
  const nextIdx = idx + 1 < lessons.length ? idx + 1 : null;
  const nextLesson = nextIdx != null ? lessons[nextIdx] : null;

  const go = useCallback(d => setStep(s => Math.max(0, Math.min(10, s + d))), []);

  useEffect(() => { document.querySelector('.bb-lesson-scroll')?.scrollTo(0, 0); }, [step]);

  const diff = lesson.difficulty || 1;
  const mins = lesson.estimatedMinutes || 20;
  const objectives = lesson.objectives || [lesson.conceptName && `Understand ${lesson.conceptName}`, lesson.mission, 'Complete the mission challenge'].filter(Boolean);
  const keywords = lesson.keywords || lesson.csTopics || [];

  let content;
  if (step === 0) {
    // INTRO
    content = (
      <StepFrame color={color} onBack={onBack} onNext={() => go(1)} nextLabel="Begin Mission ▶">
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:80, animation:'float 3s ease-in-out infinite' }}>{lesson.emoji}</div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', margin:'8px 0 12px' }}>
            <Chip label={`Year ${c.year} · Term ${term ? term.term : 1}`} color={color} />
            <Chip label={`${'★'.repeat(diff)}${'☆'.repeat(3 - diff)} difficulty`} color="#fbbf24" />
            <Chip label={`⏱ ${mins} min`} color="#94a3b8" />
          </div>
          <div style={{ fontSize:28, fontWeight:900, marginBottom:6 }}>{lesson.title}</div>
          <div style={{ color:TEXT_DIM, fontSize:14, marginBottom:20 }}>{lesson.mission}</div>
        </div>
        <div style={{ background:CARD_BG, border:`1px solid ${CARD_BORDER}`, borderRadius:18, padding:'18px', marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:800, color, letterSpacing:1, marginBottom:10 }}>🎯 MISSION OBJECTIVES</div>
          {objectives.slice(0, 3).map((o, i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:8, fontSize:14, color:'#e2e8f0' }}>
              <span style={{ color }}>{i + 1}.</span>{o}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
          {keywords.slice(0, 5).map((k, i) => <Chip key={i} label={k} color="#a855f7" />)}
        </div>
        {(lesson.vocabulary || []).length > 0 && (
          <div style={{ background:CARD_BG, border:`1px solid ${color}33`, borderRadius:18, padding:'16px 18px', marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:800, color, letterSpacing:1, marginBottom:10 }}>📚 KEY VOCABULARY</div>
            {(lesson.vocabulary || []).slice(0, 4).map((v, i) => (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ fontWeight:800, fontSize:14, color:'#e2e8f0' }}>{v.word}</div>
                <div style={{ fontSize:13, color:TEXT_DIM, lineHeight:1.5 }}>{v.def}</div>
              </div>
            ))}
          </div>
        )}
        <CharBubble characterId={lesson.character} text={CHARACTERS[lesson.character]?.quote || 'Let\'s get started!'} />
        
        {/* Companion Activity Section for Teachers */}
        {lesson.companionActivity && (
          <CompanionActivitySection activity={lesson.companionActivity} color={color} />
        )}
      </StepFrame>
    );
  } else if (step === 1) {
    // STORY
    content = (
      <StepFrame color={color} onBack={() => go(-1)} onNext={() => go(1)} nextLabel="Next: Start Learning →">
        <div style={{ background:'linear-gradient(160deg, #0a0a1f, #12122e)', border:`1px solid ${color}44`,
          borderRadius:24, padding:'30px 26px', flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{ textAlign:'center', marginBottom:18 }}>
            {CHARACTERS[lesson.character]?.image ? (
              <img 
                src={CHARACTERS[lesson.character].image} 
                alt={CHARACTERS[lesson.character].name}
                style={{ width:120, height:120, objectFit:'contain', animation:'float 3.5s ease-in-out infinite' }}
              />
            ) : (
              <div style={{ fontSize:48, animation:'float 3.5s ease-in-out infinite' }}>{CHARACTERS[lesson.character]?.emoji}</div>
            )}
            <div style={{ fontSize:15, fontWeight:800, color: CHARACTERS[lesson.character]?.color, marginTop:8 }}>
              {CHARACTERS[lesson.character]?.name}
            </div>
            <div style={{ fontSize:11, color:'#94a3b8', fontStyle:'italic' }}>
              {CHARACTERS[lesson.character]?.role}
            </div>
          </div>
          <div style={{ fontSize:17, lineHeight:1.8, fontStyle:'italic', color:'#e2e8f0', textAlign:'center',
            fontFamily:'Georgia, serif' }}>
            “{lesson.storyLine}”
          </div>
        </div>
      </StepFrame>
    );
  } else if (step >= 2 && step <= 6) {
    // TEACHING CARDS (spans steps 2-6)
    content = (
      <TeachingCards lesson={lesson} color={color} character={lesson.character}
        onDone={() => setStep(7)} onBack={() => setStep(1)} />
    );
  } else if (step === 7) {
    // PUZZLE PROGRESSION (Code.org-style 4 levels)
    content = (
      <StepFrame color={color} onBack={() => setStep(2)} onNext={() => go(1)}
        nextLabel="Continue →" canNext={activityDone || puzzleLevels.length === 0}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:800, color, letterSpacing:1 }}>🎮 PUZZLE PROGRESSION</div>
          <div style={{ fontSize:22, fontWeight:900 }}>{lesson.challenge || 'Mission Challenge'}</div>
          <div style={{ color:TEXT_DIM, fontSize:13 }}>Complete all 4 levels — warm-up → challenge → hard → bonus</div>
        </div>
        {puzzleLevels.length > 0 ? (
          <PuzzleProgression puzzles={puzzleLevels} color={color} onAllComplete={() => setActivityDone(true)} />
        ) : activity ? (
          <ActivityRenderer activity={activity} color={color} completed={activityDone}
            onComplete={() => setActivityDone(true)} />
        ) : (
          <div style={{ background:CARD_BG, border:`1px solid ${CARD_BORDER}`, borderRadius:20, padding:'30px',
            textAlign:'center', animation:'fade-up .5s ease' }}>
            <div style={{ fontSize:54, marginBottom:12, animation:'float 3s infinite' }}>🛠️</div>
            <div style={{ fontSize:16, color:'#e2e8f0', lineHeight:1.6, marginBottom:18 }}>{lesson.challenge}</div>
            <Btn color={color} onClick={() => setActivityDone(true)}>
              {activityDone ? '✓ Completed' : 'Mark as Complete'}
            </Btn>
          </div>
        )}
      </StepFrame>
    );
  } else if (step === 8) {
    // CODE
    content = (
      <StepFrame color={color} onBack={() => setStep(7)} onNext={() => go(1)} nextLabel="On to the Quiz →">
        <div style={{ textAlign:'center', marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:800, color, letterSpacing:1 }}>💻 CODING LAB</div>
          <div style={{ fontSize:22, fontWeight:900 }}>Try it in code!</div>
          <div style={{ color:TEXT_DIM, fontSize:13 }}>Experiment with what you learned.</div>
        </div>
        <div style={{ flex:1 }}>
          <CodingLabPanel yr={yr} idx={idx} lesson={lesson} color={color} />
        </div>
      </StepFrame>
    );
  } else if (step === 9) {
    // QUIZ
    content = (
      <QuizStep lesson={lesson} color={color} onBack={() => setStep(8)}
        onScore={(s, total, st) => {
          setScore(s); setQuizTotal(total); setStars(st);
          onComplete(yr, idx, lesson.xp);
          setStep(10);
        }} />
    );
  } else {
    // REWARD (step 10)
    content = (
      <RewardStep lesson={lesson} color={color} score={score} quizTotal={quizTotal} stars={stars} nextLesson={nextLesson}
        onNextLesson={() => nextIdx != null && onNextLesson(yr, nextIdx)} onMap={onMap} />
    );
  }

  return (
    <div style={{ height:'100%', background:BG, color:TEXT, display:'flex', flexDirection:'column' }}>
      <GlobalStyles />
      <div style={{ borderBottom:`1px solid ${CARD_BORDER}`, padding:'0 16px' }}>
        <StepBar step={Math.min(step, 9)} color={color} />
      </div>
      <div className="bb-lesson-scroll bb-scroll" style={{ flex:1, overflowY:'auto', padding:'20px',
        maxWidth: step === 7 ? 920 : 640, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
        {content}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════
function LearnSectionInner() {
  const [screen, setScreen] = useState('world'); // world | year | lesson
  const [activeYr, setActiveYr] = useState('y3');
  const [activeIdx, setActiveIdx] = useState(0);
  const [, force] = useState(0);
  const refresh = useCallback(() => force(n => n + 1), []);

  function handleComplete(yr, idx, xp) {
    if (!isLessonDone(yr, idx)) { markDone(yr, idx); addXP(xp); }
    const prog = getYearProgress(yr);
    if (prog.done === prog.total && !isBadgeShown(yr)) markBadgeShown(yr);
    refresh();
  }

  if (screen === 'world') {
    return (
      <div style={{ position:'absolute', inset:0, overflowY:'auto' }}>
        <WorldMap
          onSelectYear={yr => { setActiveYr(yr); setScreen('year'); }}
          onContinue={({ yr, idx }) => { setActiveYr(yr); setActiveIdx(idx); setScreen('lesson'); }}
        />
      </div>
    );
  }

  if (screen === 'year') {
    return (
      <div style={{ position:'absolute', inset:0, overflowY:'auto' }}>
        <YearView yr={activeYr} onBack={() => setScreen('world')}
          onSelectLesson={idx => { setActiveIdx(idx); setScreen('lesson'); }} />
      </div>
    );
  }

  // lesson
  return (
    <div style={{ position:'absolute', inset:0 }}>
      <LessonPlayer
        key={`${activeYr}-${activeIdx}`}
        yr={activeYr} idx={activeIdx}
        onBack={() => setScreen('year')}
        onComplete={handleComplete}
        onNextLesson={(yr, idx) => { setActiveYr(yr); setActiveIdx(idx); setScreen('lesson'); }}
        onMap={() => setScreen('world')}
      />
    </div>
  );
}

export default function LearnSection() {
  return (
    <LearnErrorBoundary>
      <LearnSectionInner />
    </LearnErrorBoundary>
  );
}
