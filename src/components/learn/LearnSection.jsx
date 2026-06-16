import React, { useState, useEffect, useCallback } from 'react';
import { COURSES, CHARACTERS, COURSE_ORDER, getLevelInfo } from '../../data/learnWorldData';
import { getLessonInteractives, getInteractiveCount, SKILL_BADGES } from '../../data/learnInteractiveActivities';
import ActivityRenderer from './activities/ActivityRenderer';
import CodingLabPanel from './CodingLab/CodingLabPanel';

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
  const lessons = COURSES[yr].lessons;
  const done = lessons.filter((_, i) => isLessonDone(yr, i)).length;
  return { done, total: lessons.length, pct: Math.round(done / lessons.length * 100) };
}
function isYearUnlocked() { return true; }
function findContinue() {
  for (const yr of COURSE_ORDER) {
    if (!isYearUnlocked(yr)) continue;
    const c = COURSES[yr];
    for (let i = 0; i < c.lessons.length; i++) {
      if (!isLessonDone(yr, i)) return { yr, idx: i };
    }
  }
  return null;
}
function getTermForLesson(yr, idx) {
  return COURSES[yr].terms.find(t => idx >= t.range[0] && idx <= t.range[1]);
}

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
function ProgressBar({ pct, color, height=8, style={} }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:99, height, overflow:'hidden', ...style }}>
      <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:99,
                    transition:'width 0.6s ease', boxShadow:`0 0 8px ${color}88` }} />
    </div>
  );
}

function XPBadge({ xp, style={} }) {
  return <span style={{ fontSize:11, fontWeight:800, color:'#fbbf24', background:'rgba(251,191,36,0.12)',
    border:'1px solid rgba(251,191,36,0.3)', borderRadius:20, padding:'3px 10px', ...style }}>+{xp} XP</span>;
}

function CharBubble({ characterId, text, style={} }) {
  const ch = CHARACTERS[characterId];
  if (!ch) return null;
  return (
    <div style={{ display:'flex', gap:12, alignItems:'flex-start', background:ch.bg,
                  border:`1px solid ${ch.color}44`, borderRadius:16, padding:'14px 16px', ...style }}>
      <div style={{ fontSize:28, flexShrink:0, lineHeight:1 }}>{ch.emoji}</div>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:ch.color, marginBottom:4 }}>{ch.name}</div>
        <div style={{ fontSize:14, color:'#e2e8f0', lineHeight:1.55 }}>{text}</div>
      </div>
    </div>
  );
}

function Chip({ label, color='#818cf8' }) {
  return <span style={{ fontSize:10, fontWeight:700, color, background:`${color}18`,
    border:`1px solid ${color}44`, borderRadius:20, padding:'2px 8px', whiteSpace:'nowrap' }}>{label}</span>;
}

function QuizBlock({ questions, onScore }) {
  const [answers, setAnswers]   = useState({});
  const [submitted, setSubmit]  = useState(false);

  function submit() {
    const score = questions.filter((q,i) => answers[i] === q.answer).length;
    setSubmit(true);
    onScore(score, questions.length);
  }

  return (
    <div>
      {questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom:20 }}>
          <div style={{ fontWeight:600, color:'#e2e8f0', marginBottom:10, fontSize:14 }}>
            {qi+1}. {q.q}
          </div>
          {q.options.map((opt, oi) => {
            const chosen = answers[qi] === oi;
            const correct = submitted && oi === q.answer;
            const wrong   = submitted && chosen && oi !== q.answer;
            return (
              <button key={oi} disabled={submitted}
                onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                style={{ display:'block', width:'100%', textAlign:'left', padding:'10px 14px',
                  marginBottom:6, borderRadius:10, fontSize:13,
                  border:`1.5px solid ${correct ? '#10b981' : wrong ? '#ef4444' : chosen ? '#818cf8' : 'rgba(255,255,255,0.12)'}`,
                  background: correct ? 'rgba(16,185,129,0.12)' : wrong ? 'rgba(239,68,68,0.12)' : chosen ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.04)',
                  color: correct ? '#6ee7b7' : wrong ? '#fca5a5' : '#e2e8f0', cursor: submitted ? 'default' : 'pointer' }}>
                {correct && '✓ '}{wrong && '✗ '}{opt}
              </button>
            );
          })}
        </div>
      ))}
      {!submitted && Object.keys(answers).length === questions.length && (
        <button onClick={submit}
          style={{ marginTop:8, padding:'10px 24px', background:'#6366f1', color:'#fff',
            border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 }}>
          Submit Answers
        </button>
      )}
      {submitted && (
        <div style={{ marginTop:12, padding:'12px 16px', background:'rgba(16,185,129,0.1)',
          border:'1px solid rgba(16,185,129,0.3)', borderRadius:12, color:'#6ee7b7', fontWeight:600 }}>
          {questions.filter((q,i) => answers[i] === q.answer).length}/{questions.length} correct!{' '}
          {questions.filter((q,i) => answers[i] === q.answer).length === questions.length ? '🎉 Perfect!' : ''}
        </div>
      )}
    </div>
  );
}

function BadgePop({ badge, label, color, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}
      onClick={onDone}>
      <div style={{ textAlign:'center', animation:'bb-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        background:`linear-gradient(135deg, ${color}33, ${color}11)`,
        border:`2px solid ${color}88`, borderRadius:24, padding:'48px 56px',
        boxShadow:`0 0 60px ${color}66` }}>
        <div style={{ fontSize:72, lineHeight:1, marginBottom:16 }}>{badge}</div>
        <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:8 }}>{label}</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Click anywhere to continue</div>
      </div>
      <style>{`@keyframes bb-pop { from { opacity:0; transform:scale(0.3) rotate(-10deg); } to { opacity:1; transform:scale(1) rotate(0deg); } }`}</style>
    </div>
  );
}

// ─── STAR FIELD ───────────────────────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    left: `${(i * 37.3 + 13) % 100}%`, top: `${(i * 59.7 + 7) % 100}%`,
    size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
    opacity: 0.3 + (i % 7) * 0.08,
  }));
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
      {stars.map((s, i) => (
        <div key={i} style={{ position:'absolute', left:s.left, top:s.top,
          width:s.size, height:s.size, borderRadius:'50%', background:'#fff', opacity:s.opacity }} />
      ))}
    </div>
  );
}

// ─── WORLD MAP ────────────────────────────────────────────────────────────────
function WorldMap({ onSelectYear, onContinue }) {
  const xp        = getTotalXP();
  const lvl       = getLevelInfo(xp);
  const cont      = findContinue();

  return (
    <div style={{ minHeight:'100vh', background:'#060611', color:'#fff', position:'relative', overflow:'auto' }}>
      <Stars />
      <div style={{ position:'relative', zIndex:1, maxWidth:780, margin:'0 auto', padding:'32px 20px 60px' }}>

        {/* Header: player level */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:16, padding:'14px 20px', marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:32, lineHeight:1 }}>{lvl.icon}</div>
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:lvl.color }}>Level {lvl.level}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{lvl.title}</div>
            </div>
          </div>
          <div style={{ flex:1, margin:'0 20px' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:4, textAlign:'right' }}>
              {xp} / {lvl.xpToNext} XP
            </div>
            <ProgressBar pct={Math.round((xp - lvl.xpForLevel) / (lvl.xpToNext - lvl.xpForLevel) * 100)} color={lvl.color} />
          </div>
          {cont && (
            <button onClick={onContinue}
              style={{ flexShrink:0, padding:'8px 16px', background:'#6366f1', color:'#fff',
                border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer',
                boxShadow:'0 0 20px rgba(99,102,241,0.4)' }}>
              Continue →
            </button>
          )}
        </div>

        {/* Title */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.5px' }}>🌍 ByteBuddies Learning World</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,0.45)', marginTop:6 }}>
            80 story-driven lessons · {getInteractiveCount()}+ interactive activities
          </div>
        </div>

        {/* Region cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {COURSE_ORDER.map(yr => {
            const c       = COURSES[yr];
            const unlocked= isYearUnlocked(yr);
            const prog    = getYearProgress(yr);
            const started = prog.done > 0;
            return (
              <div key={yr} onClick={() => unlocked && onSelectYear(yr)}
                style={{ borderRadius:20, border:`1.5px solid ${unlocked ? c.color+'66' : 'rgba(255,255,255,0.08)'}`,
                  background: unlocked ? `linear-gradient(135deg, ${c.color}12, rgba(255,255,255,0.02))` : 'rgba(255,255,255,0.02)',
                  padding:'22px 24px', cursor: unlocked ? 'pointer' : 'default', transition:'all 0.2s',
                  opacity: unlocked ? 1 : 0.45, position:'relative', overflow:'hidden' }}>
                {!unlocked && (
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                    background:'rgba(6,6,17,0.6)', backdropFilter:'blur(2px)', borderRadius:20, zIndex:2 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:28 }}>🔒</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:4 }}>
                        Complete Year {c.year - 1} to unlock
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                  <div style={{ fontSize:44, lineHeight:1, flexShrink:0 }}>{c.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                      <div style={{ fontWeight:800, fontSize:18 }}>{c.regionName}</div>
                      <Chip label={`Year ${c.year}`} color={c.color} />
                      <Chip label={c.ages} color={c.color} />
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color:c.color, marginTop:4, letterSpacing:'0.5px' }}>
                      {c.storyTitle}
                    </div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:6, lineHeight:1.4 }}>
                      {c.storyText.slice(0, 110)}...
                    </div>
                    <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:12 }}>
                      <ProgressBar pct={prog.pct} color={c.color} style={{ flex:1 }} />
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap' }}>
                        {prog.done}/{prog.total} lessons
                      </div>
                      {prog.done === prog.total && prog.total > 0 && (
                        <div style={{ fontSize:18 }}>{c.completionBadge}</div>
                      )}
                    </div>
                    {unlocked && (
                      <div style={{ marginTop:10 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:c.color }}>
                          {prog.done === 0 ? '▶ Begin Adventure' : prog.done === prog.total ? '✓ Completed!' : '▶ Continue'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Skill badges */}
        <div style={{ marginTop:24, textAlign:'center' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)', marginBottom:10, letterSpacing:'0.08em' }}>
            SKILL BADGES TO EARN
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {SKILL_BADGES.slice(0, 6).map(b => (
              <div key={b.id} title={b.desc}
                style={{ padding:'6px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:11 }}>
                {b.emoji} {b.name}
              </div>
            ))}
          </div>
        </div>

        {/* Characters row */}
        <div style={{ marginTop:40, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          {Object.values(CHARACTERS).map(ch => (
            <div key={ch.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
              background:ch.bg, border:`1px solid ${ch.color}33`, borderRadius:12 }}>
              <span style={{ fontSize:20 }}>{ch.emoji}</span>
              <span style={{ fontSize:12, fontWeight:600, color:ch.color }}>{ch.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REGION SCREEN ────────────────────────────────────────────────────────────
function RegionScreen({ yr, onBack, onSelectLesson }) {
  const c    = COURSES[yr];
  const prog = getYearProgress(yr);

  return (
    <div style={{ minHeight:'100vh', background:'#060611', color:'#fff' }}>
      {/* Hero */}
      <div style={{ background:c.gradient, padding:'28px 24px 32px', position:'relative', overflow:'hidden' }}>
        <Stars />
        <div style={{ position:'relative', zIndex:1, maxWidth:720, margin:'0 auto' }}>
          <button onClick={onBack} style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.2)',
            color:'#fff', padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:13, marginBottom:20 }}>
            ← World Map
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ fontSize:52, lineHeight:1 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:24, fontWeight:900 }}>{c.regionName}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:700, letterSpacing:'1px',
                marginTop:2 }}>{c.storyTitle}</div>
              <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
                <Chip label={c.ages} color="rgba(255,255,255,0.9)" />
                <Chip label={`${prog.done}/${prog.total} lessons`} color="rgba(255,255,255,0.9)" />
                <XPBadge xp={c.totalXP} style={{ fontSize:11 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'28px 20px 60px' }}>
        {/* Story arc */}
        <CharBubble characterId={c.mainCharacter} text={c.storyText} style={{ marginBottom:24 }} />

        {/* Progress */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:14, padding:'16px 20px', marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontWeight:700, fontSize:14 }}>Year Progress</span>
            <span style={{ fontSize:13, color:c.color, fontWeight:700 }}>{prog.pct}%</span>
          </div>
          <ProgressBar pct={prog.pct} color={c.color} height={10} />
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:8 }}>
            {prog.done} of {prog.total} lessons complete · {c.totalXP} total XP available
          </div>
        </div>

        {/* Terms */}
        {c.terms.map(term => {
          const termLessons = c.lessons.slice(term.range[0], term.range[1] + 1);
          const termDone    = termLessons.filter((_, i) => isLessonDone(yr, term.range[0] + i)).length;

          return (
            <div key={term.term} style={{ marginBottom:24 }}>
              {/* Term header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:term.color,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:800, fontSize:13, flexShrink:0 }}>{term.term}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{term.name}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{term.focus}</div>
                </div>
                <div style={{ marginLeft:'auto', fontSize:12, color:term.color, fontWeight:600 }}>
                  {termDone}/{termLessons.length}
                </div>
              </div>

              {/* Lesson nodes */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', paddingLeft:40 }}>
                {termLessons.map((lesson, li) => {
                  const absIdx  = term.range[0] + li;
                  const done    = isLessonDone(yr, absIdx);
                  return (
                    <button key={lesson.id}
                      onClick={() => onSelectLesson(absIdx)}
                      title={lesson.title}
                      style={{ width:44, height:44, borderRadius:'50%',
                        border:`2px solid ${done ? term.color : term.color + '88'}`,
                        background: done ? term.color : 'rgba(255,255,255,0.08)',
                        color: done ? '#fff' : '#fff',
                        fontSize:18, cursor:'pointer',
                        transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {done ? '✓' : lesson.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Completion badge preview */}
        <div style={{ marginTop:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ fontSize:36 }}>{c.completionBadge}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>{c.completionBadgeLabel} Badge</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>
              Complete all {c.lessons.length} lessons to earn this badge
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INTERACTIVE ACTIVITY FLOW ────────────────────────────────────────────────
const actDoneKey = (yr, li, ai) => `bb_act_${yr}_${li}_${ai}`;

function InteractiveActivityPanel({ yr, idx, lesson, color, onAllComplete, onActivityXP }) {
  const interactives = getLessonInteractives(yr, idx);
  const [activeAct, setActiveAct] = useState(0);
  const [completed, setCompleted] = useState(() =>
    interactives.map((_, i) => localStorage.getItem(actDoneKey(yr, idx, i)) === '1')
  );

  useEffect(() => {
    setCompleted(interactives.map((_, i) => localStorage.getItem(actDoneKey(yr, idx, i)) === '1'));
    setActiveAct(interactives.findIndex((_, i) => localStorage.getItem(actDoneKey(yr, idx, i)) !== '1'));
  }, [yr, idx, interactives.length]);

  const doneCount = completed.filter(Boolean).length;
  const allDone = doneCount >= interactives.length && interactives.length > 0;

  useEffect(() => { if (allDone) onAllComplete?.(); }, [allDone, onAllComplete]);

  function handleComplete(actIdx, xp) {
    if (localStorage.getItem(actDoneKey(yr, idx, actIdx)) === '1') return;
    localStorage.setItem(actDoneKey(yr, idx, actIdx), '1');
    addXP(xp);
    onActivityXP?.(xp);
    setCompleted(prev => {
      const next = [...prev];
      next[actIdx] = true;
      return next;
    });
    const nextIncomplete = interactives.findIndex((_, i) => i !== actIdx && !completed[i] && i !== actIdx);
    const nextIdx = interactives.findIndex((_, i) => i > actIdx && localStorage.getItem(actDoneKey(yr, idx, i)) !== '1');
    if (nextIdx >= 0) setTimeout(() => setActiveAct(nextIdx), 600);
    else if (actIdx < interactives.length - 1) setTimeout(() => setActiveAct(actIdx + 1), 600);
  }

  if (!interactives.length) {
    return (
      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>
        Interactive activities loading…
      </div>
    );
  }

  const act = interactives[activeAct] || interactives[0];

  return (
    <div>
      {/* Progress header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:140 }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:4 }}>
            Activity {Math.min(activeAct + 1, interactives.length)} of {interactives.length}
          </div>
          <ProgressBar pct={Math.round(doneCount / interactives.length * 100)} color={color} height={8} />
        </div>
        <div style={{ fontSize:13, fontWeight:700, color: allDone ? '#6ee7b7' : color }}>
          {doneCount}/{interactives.length} complete
        </div>
      </div>

      {/* Activity selector pills */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
        {interactives.map((a, i) => (
          <button key={i} onClick={() => setActiveAct(i)}
            style={{ padding:'6px 12px', borderRadius:20, cursor:'pointer', fontSize:11, fontWeight:700,
              border:`1.5px solid ${completed[i] ? '#10b981' : i === activeAct ? color : 'rgba(255,255,255,0.15)'}`,
              background: completed[i] ? 'rgba(16,185,129,0.12)' : i === activeAct ? color + '22' : 'rgba(255,255,255,0.04)',
              color: completed[i] ? '#6ee7b7' : i === activeAct ? '#fff' : 'rgba(255,255,255,0.5)' }}>
            {completed[i] ? '✓' : i + 1}. {a.title.length > 22 ? a.title.slice(0, 20) + '…' : a.title}
          </button>
        ))}
      </div>

      {/* Active activity */}
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:16, padding:'20px 22px', marginBottom:20 }}>
        <ActivityRenderer
          key={`${yr}-${idx}-${activeAct}`}
          activity={act}
          color={color}
          completed={completed[activeAct]}
          onComplete={() => handleComplete(activeAct, act.xp || 15)}
        />
        {completed[activeAct] && (
          <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(16,185,129,0.1)',
            border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, color:'#6ee7b7', fontSize:13, fontWeight:600 }}>
            ✅ Activity complete! +{act.xp || 15} XP earned
          </div>
        )}
      </div>

      {allDone && (
        <div style={{ background:`linear-gradient(135deg, ${color}22, transparent)`,
          border:`1.5px solid ${color}55`, borderRadius:14, padding:'16px 20px', marginBottom:16, textAlign:'center' }}>
          <div style={{ fontSize:28, marginBottom:8 }}>🎯</div>
          <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>All Activities Complete!</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)' }}>
            You earned {interactives.reduce((s, a) => s + (a.xp || 15), 0)} bonus XP from activities.
            {doneCount === interactives.length && ' Perfect Programmer badge unlocked!'}
          </div>
        </div>
      )}

      {/* Text activity checklist (teacher reference) */}
      <details style={{ marginTop:8 }}>
        <summary style={{ cursor:'pointer', fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>
          📋 Classroom activity guide ({lesson.activities.length} offline tasks)
        </summary>
        <div style={{ marginTop:10 }}>
          {lesson.activities.map((act, i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:8, fontSize:13, color:'rgba(255,255,255,0.6)' }}>
              <span style={{ color, fontWeight:800 }}>{i + 1}.</span> {act}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

// ─── LESSON VIEWER ────────────────────────────────────────────────────────────
const TABS = [
  { id:'story',      label:'📖 Story'      },
  { id:'learn',      label:'🧠 Learn'      },
  { id:'activities', label:'🎯 Activities' },
  { id:'code',       label:'💻 Code'       },
  { id:'quiz',       label:'❓ Quiz'       },
  { id:'complete',   label:'🏆 Complete'   },
];

function LessonViewer({ yr, idx, onBack, onComplete }) {
  const c       = COURSES[yr];
  const lesson  = c.lessons[idx];
  const term    = getTermForLesson(yr, idx);
  const done    = isLessonDone(yr, idx);
  const [tab, setTab]         = useState('story');
  const [quizScore, setScore] = useState(null);
  const [marked, setMarked]   = useState(done);
  const [actsDone, setActsDone] = useState(false);
  const [codeDone, setCodeDone] = useState(false);
  const [bonusXP, setBonusXP] = useState(0);

  useEffect(() => {
    const interactives = getLessonInteractives(yr, idx);
    const allPrev = interactives.length > 0 && interactives.every((_, i) =>
      localStorage.getItem(`bb_act_${yr}_${idx}_${i}`) === '1'
    );
    if (allPrev || done) setActsDone(true);
    if (localStorage.getItem(`bb_coding_${yr}_${idx}`) === '1' || done) setCodeDone(true);
  }, [yr, idx, done]);

  function handleComplete() {
    if (!marked) {
      markDone(yr, idx);
      addXP(lesson.xp);
      setMarked(true);
      onComplete(lesson.xp, lesson.badge);
    } else {
      onBack();
    }
  }

  const ch = CHARACTERS[lesson.character];

  return (
    <div style={{ minHeight:'100vh', background:'#060611', color:'#fff' }}>
      {/* Top bar */}
      <div style={{ background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.08)',
        padding:'12px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)',
          color:'#fff', padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:13 }}>
          ← Back
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>
            {c.regionName} · Term {term?.term} · Lesson {idx + 1}
          </div>
          <div style={{ fontWeight:700, fontSize:15 }}>{lesson.title}</div>
        </div>
        <XPBadge xp={lesson.xp} />
        {marked && <span style={{ fontSize:18 }}>✅</span>}
      </div>

      {/* CS Topics */}
      <div style={{ padding:'12px 20px', display:'flex', gap:6, flexWrap:'wrap',
        borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        {lesson.csTopics.map(t => <Chip key={t} label={t} color={c.color} />)}
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.08)', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:'0 0 auto', padding:'12px 16px', background:'none', border:'none', cursor:'pointer',
              color: tab === t.id ? c.color : 'rgba(255,255,255,0.4)',
              borderBottom: tab === t.id ? `2px solid ${c.color}` : '2px solid transparent',
              fontWeight: tab === t.id ? 700 : 500, fontSize:13, whiteSpace:'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: tab === 'code' ? 1100 : 700, margin:'0 auto', padding:'24px 20px 60px' }}>

        {tab === 'story' && (
          <div>
            <div style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>{lesson.title}</div>
            <div style={{ fontSize:14, color:c.color, fontWeight:700, marginBottom:20 }}>
              🎯 Mission: {lesson.mission}
            </div>
            <CharBubble characterId={lesson.character} text={lesson.storyLine} style={{ marginBottom:24 }} />
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:14, padding:'16px 20px', marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:10, letterSpacing:'0.5px' }}>
                🎯 LEARNING OBJECTIVES
              </div>
              <ul style={{ margin:0, paddingLeft:18, color:'#e2e8f0', fontSize:14, lineHeight:1.7 }}>
                <li>Understand <strong style={{color:c.color}}>{lesson.conceptName}</strong></li>
                {lesson.csTopics.map(t => <li key={t}>Apply <strong>{t}</strong> concepts hands-on</li>)}
                <li>Complete {getLessonInteractives(yr, idx).length} interactive activities + quiz</li>
              </ul>
            </div>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontWeight:700, fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:10, letterSpacing:'0.5px' }}>
                YOUR MISSION
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:'#f0f0ff', lineHeight:1.5 }}>
                {lesson.mission}
              </div>
            </div>
            <button onClick={() => setTab('learn')}
              style={{ marginTop:20, padding:'12px 28px', background:c.color, color:'#fff',
                border:'none', borderRadius:12, cursor:'pointer', fontWeight:700, fontSize:14,
                boxShadow:`0 0 24px ${c.color}55` }}>
              Let's Learn → 🧠
            </button>
          </div>
        )}

        {tab === 'learn' && (
          <div>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:20 }}>The CS Concept</div>
            <div style={{ background:`linear-gradient(135deg, ${c.color}18, ${c.color}06)`,
              border:`1.5px solid ${c.color}44`, borderRadius:16, padding:'24px' }}>
              <div style={{ fontWeight:900, fontSize:20, marginBottom:12 }}>{lesson.conceptName}</div>
              <div style={{ fontSize:15, color:'#e2e8f0', lineHeight:1.65 }}>{lesson.conceptExplain}</div>
            </div>
            <CharBubble characterId={lesson.character} text={`Remember: ${ch?.quote || 'Keep learning!'}`}
              style={{ marginTop:20 }} />
            <div style={{ marginTop:20, padding:'14px 18px', background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.08)', borderRadius:12 }}>
              <div style={{ fontWeight:700, fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>
                CS TOPICS THIS LESSON
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {lesson.csTopics.map(t => <Chip key={t} label={t} color={c.color} />)}
              </div>
            </div>
            <button onClick={() => setTab('activities')}
              style={{ marginTop:20, padding:'12px 28px', background:c.color, color:'#fff',
                border:'none', borderRadius:12, cursor:'pointer', fontWeight:700, fontSize:14 }}>
              Let's Do It → 🎯
            </button>
          </div>
        )}

        {tab === 'activities' && (
          <div>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>Interactive Activities</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:20 }}>
              Complete all {getLessonInteractives(yr, idx).length} activities to unlock the quiz. Each activity teaches a CS concept through gameplay!
            </div>

            <InteractiveActivityPanel
              yr={yr} idx={idx} lesson={lesson} color={c.color}
              onAllComplete={() => setActsDone(true)}
              onActivityXP={xp => setBonusXP(b => b + xp)}
            />

            <div style={{ marginTop:20, background:`${c.color}15`, border:`1.5px solid ${c.color}44`,
              borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontWeight:800, fontSize:13, color:c.color, marginBottom:8 }}>
                ⚡ CODING CHALLENGE
              </div>
              <div style={{ fontSize:14, color:'#e2e8f0', lineHeight:1.55, marginBottom:12 }}>{lesson.challenge}</div>
              <button onClick={() => setTab('code')}
                style={{ padding:'8px 18px', background:c.color, color:'#fff', border:'none', borderRadius:9, cursor:'pointer', fontWeight:700, fontSize:13 }}>
                Open Coding Lab → 💻
              </button>
            </div>
            {lesson.reflection && (
              <div style={{ marginTop:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:14, padding:'14px 18px' }}>
                <div style={{ fontWeight:700, fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>
                  🤔 REFLECT
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>{lesson.reflection}</div>
              </div>
            )}
            <button onClick={() => setTab('quiz')} disabled={!actsDone && !done}
              style={{ marginTop:20, padding:'12px 28px',
                background: actsDone || done ? c.color : 'rgba(255,255,255,0.08)',
                color: actsDone || done ? '#fff' : 'rgba(255,255,255,0.35)',
                border:'none', borderRadius:12,
                cursor: actsDone || done ? 'pointer' : 'not-allowed', fontWeight:700, fontSize:14 }}>
              {actsDone || done ? 'Take the Quiz → ❓' : `Complete all activities first (${getLessonInteractives(yr, idx).length} total)`}
            </button>
          </div>
        )}

        {tab === 'code' && (
          <CodingLabPanel
            yr={yr} idx={idx} lesson={lesson} color={c.color}
            onComplete={() => setCodeDone(true)}
            onXP={xp => { addXP(xp); setBonusXP(b => b + xp); }}
          />
        )}

        {tab === 'quiz' && (
          <div>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>Quick Quiz</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:20 }}>
              Test what you have learned in this lesson!
            </div>
            <QuizBlock questions={lesson.quiz} onScore={(score, total) => setScore({ score, total })} />
            {quizScore && (
              <button onClick={() => setTab('complete')}
                style={{ marginTop:20, padding:'12px 28px', background:c.color, color:'#fff',
                  border:'none', borderRadius:12, cursor:'pointer', fontWeight:700, fontSize:14 }}>
                Complete Lesson → 🏆
              </button>
            )}
          </div>
        )}

        {tab === 'complete' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>
              {marked ? '✅' : '🎯'}
            </div>
            <div style={{ fontSize:22, fontWeight:900, marginBottom:8 }}>
              {marked ? 'Lesson Complete!' : 'Ready to complete this lesson?'}
            </div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.55)', marginBottom:28, lineHeight:1.6 }}>
              {marked
                ? `You've already completed "${lesson.title}" and earned ${lesson.xp} XP!`
                : `Complete "${lesson.title}" to earn ${lesson.xp} XP and continue your adventure.`}
            </div>

            {quizScore && (
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:14, padding:'16px', marginBottom:24, display:'inline-block', minWidth:200 }}>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>Quiz Score</div>
                <div style={{ fontSize:24, fontWeight:900, color:c.color }}>
                  {quizScore.score}/{quizScore.total}
                </div>
              </div>
            )}

            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <div style={{ background:`${c.color}15`, border:`1.5px solid ${c.color}44`,
                borderRadius:12, padding:'14px 20px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>XP Reward</div>
                <div style={{ fontWeight:900, fontSize:22, color:'#fbbf24' }}>+{lesson.xp}</div>
              </div>
              {lesson.badge && (
                <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)',
                  borderRadius:12, padding:'14px 20px', textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>Badge</div>
                  <div style={{ fontSize:28 }}>{lesson.badge}</div>
                </div>
              )}
            </div>

            <button onClick={handleComplete}
              style={{ display:'block', width:'100%', maxWidth:320, margin:'28px auto 0',
                padding:'14px', background: marked ? 'rgba(255,255,255,0.08)' : c.color, color:'#fff',
                border:`2px solid ${marked ? 'rgba(255,255,255,0.15)' : c.color}`,
                borderRadius:14, cursor:'pointer', fontWeight:800, fontSize:16,
                boxShadow: marked ? 'none' : `0 0 30px ${c.color}55` }}>
              {marked ? '← Back to Lessons' : `✓ Mark Complete & Earn ${lesson.xp} XP`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function LearnSection() {
  const [screen, setScreen]   = useState('world');   // 'world' | 'region' | 'lesson'
  const [activeYr, setYr]     = useState(null);
  const [activeIdx, setIdx]   = useState(null);
  const [badge, setBadge]     = useState(null);       // { emoji, label, color }
  const [, tick]              = useState(0);

  const refresh = useCallback(() => tick(n => n + 1), []);

  function goTo(s, yr = null, idx = null) {
    setYr(yr); setIdx(idx); setScreen(s);
  }

  function handleContinue() {
    const cont = findContinue();
    if (cont) goTo('lesson', cont.yr, cont.idx);
  }

  function handleComplete(xp, lessonBadge) {
    const yr    = activeYr;
    const c     = COURSES[yr];
    const prog  = getYearProgress(yr);

    refresh();

    // Show lesson badge if any
    if (lessonBadge) {
      setBadge({ emoji: lessonBadge, label: 'Badge Earned!', color: c.color });
      return;
    }
    // Show year completion badge
    if (prog.done === prog.total && !isBadgeShown(yr)) {
      markBadgeShown(yr);
      setBadge({ emoji: c.completionBadge, label: `${c.completionBadgeLabel} Badge Earned!`, color: c.color });
      return;
    }
    goTo('region', yr);
  }

  if (badge) {
    return <BadgePop {...badge} onDone={() => { setBadge(null); if (activeYr) goTo('region', activeYr); else goTo('world'); }} />;
  }

  if (screen === 'world') {
    return <WorldMap
      onSelectYear={yr => goTo('region', yr)}
      onContinue={handleContinue}
    />;
  }

  if (screen === 'region') {
    return <RegionScreen
      yr={activeYr}
      onBack={() => goTo('world')}
      onSelectLesson={idx => goTo('lesson', activeYr, idx)}
    />;
  }

  if (screen === 'lesson') {
    return <LessonViewer
      yr={activeYr}
      idx={activeIdx}
      onBack={() => goTo('region', activeYr)}
      onComplete={handleComplete}
    />;
  }

  return null;
}
