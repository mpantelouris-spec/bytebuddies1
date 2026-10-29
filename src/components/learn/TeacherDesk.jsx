import React, { useEffect, useMemo, useState } from 'react';
import { COURSES, COURSE_ORDER } from '../../data/learnKs2Courses';
import { KS2_STATUTORY } from '../../data/curriculum/ks2Statutory';
import {
  loadTeacherContent, saveTeacherContent, hasTeacherContent, hasMeaningfulContent,
  newSlide, newTask,
} from '../../utils/teacherLessonContent.js';
import { isCodingLesson } from '../../data/learnCodingConfig.js';

const PAPER = '#f6f1e7';
const INK = '#1c1917';
const MUTED = '#57534e';
const RULE = '#d6d3d1';
const TEAL = '#0f766e';
const TEAL_DK = '#115e59';
const AMBER = '#b45309';
const WHITE = '#fffdf8';

const KIND_LABEL = {
  normal: 'Weekly lesson',
  review: 'Review',
  mini: 'Mini-project',
  capstone: 'Capstone',
  showcase: 'Showcase',
};

function doneKey(yr, i) { return `bb_world_${yr}_l${i}`; }
function isTaught(yr, i) { return localStorage.getItem(doneKey(yr, i)) === '1'; }
function markTaught(yr, i) { localStorage.setItem(doneKey(yr, i), '1'); }

function StaffToggle({ onPupil }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 3, borderRadius: 10, background: '#e7e5e4' }}>
      <button type="button" onClick={onPupil} style={chipBtn(false)}>Pupil games</button>
      <button type="button" style={chipBtn(true)}>Staff planner</button>
    </div>
  );
}

function chipBtn(active) {
  return {
    border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, padding: '8px 12px', borderRadius: 8,
    background: active ? TEAL : 'transparent', color: active ? '#fff' : MUTED,
  };
}

function Bar({ children }) {
  return (
    <div style={{
      background: TEAL_DK, color: '#ecfdf5', padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      borderBottom: `3px solid ${TEAL}`,
    }}>
      {children}
    </div>
  );
}

function Ghost({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      background: 'transparent', border: '1px solid rgba(255,255,255,0.35)', color: '#ecfdf5',
      padding: '8px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
    }}>{children}</button>
  );
}

function Solid({ children, onClick, tone = 'teal' }) {
  const bg = tone === 'amber' ? AMBER : TEAL;
  return (
    <button type="button" onClick={onClick} style={{
      background: bg, border: 'none', color: '#fff', padding: '9px 14px', borderRadius: 8,
      fontWeight: 800, fontSize: 13, cursor: 'pointer',
    }}>{children}</button>
  );
}

function Card({ title, children, wide }) {
  return (
    <section style={{
      background: WHITE, border: `1px solid ${RULE}`, borderRadius: 12, padding: '16px 18px',
      marginBottom: 14, boxShadow: '0 1px 0 rgba(28,25,23,0.04)',
      gridColumn: wide ? '1 / -1' : undefined,
    }}>
      {title && (
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: TEAL, marginBottom: 10, textTransform: 'uppercase' }}>
          {title}
        </div>
      )}
      {children}
    </section>
  );
}

function timingFor(lesson) {
  const acts = lesson.bibleActivities || [];
  const input = 10;
  const plenary = 8;
  const actMins = acts.reduce((s, a) => s + (a.mins || 12), 0);
  const total = lesson.estimatedMinutes || Math.min(60, input + actMins + plenary);
  return { input, actMins, plenary, total, acts };
}

function resourcesFor(lesson) {
  const acts = lesson.bibleActivities || [];
  const items = ['Computing books or whiteboards', 'Class visualiser / IWB'];
  if (acts.some((a) => a.type === 'unplugged')) items.push('Printed cards or sticky notes');
  if (isCodingLesson(lesson)) items.push('Logged-in devices · ByteBuddies coding lab');
  else items.push('Paper-first — devices optional');
  if ((lesson.ukCurriculum || []).includes('DL-1')) items.push('Safeguarding: trusted-adult poster visible');
  return items;
}

function StaffShell({ children, onBack, onPupil, right }) {
  return (
    <div className="bb-staff" style={{
      minHeight: '100%', background: PAPER, color: INK, fontFamily: 'Georgia, "Iowan Old Style", serif',
    }}>
      <style>{`
        .bb-staff button, .bb-staff input, .bb-staff textarea { font-family: Inter, system-ui, sans-serif; }
        .bb-staff table { font-family: Inter, system-ui, sans-serif; }
        @media print {
          .bb-staff-noprint { display: none !important; }
          .bb-staff { background: white; }
        }
      `}</style>
      <Bar>
        {onBack ? (
          <button type="button" onClick={onBack} className="bb-staff-noprint" style={{
            background: 'none', border: 'none', color: '#a7f3d0', fontWeight: 800, cursor: 'pointer', fontSize: 13,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>← Planner</button>
        ) : (
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, opacity: 0.8 }}>KS2 computing</span>
        )}
        <div style={{ fontWeight: 800, letterSpacing: 0.4, flex: 1, fontFamily: 'Inter, system-ui, sans-serif' }}>
          ByteBuddies · Staff planner
        </div>
        <div className="bb-staff-noprint" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {right}
          <StaffToggle onPupil={onPupil} />
        </div>
      </Bar>
      {children}
    </div>
  );
}

export function TeacherHome({ onSelectYear, onOpenLesson, onOpenPlan, onPupil }) {
  return (
    <StaffShell onPupil={onPupil} onBack={null} right={null}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px 48px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: TEAL, letterSpacing: 1.4, fontFamily: 'Inter, sans-serif', margin: '0 0 8px' }}>
          FOR THE CLASS TEACHER — NOT THE PUPIL PATH
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, margin: '0 0 10px', lineHeight: 1.2 }}>
          Scheme of work
        </h1>
        <p style={{ color: MUTED, fontSize: 17, lineHeight: 1.55, maxWidth: 640, margin: '0 0 28px' }}>
          38 lessons per year group, 152 across Years 3–6. The grid is the plan. Open a week to teach the lesson (WALT, input, tasks, plenary). Answers stay on the plan. You can add your own notes, slides and tasks on any week — they stay on this device.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
          {COURSE_ORDER.map((yr) => {
            const c = COURSES[yr];
            const taught = (c.lessons || []).filter((_, i) => isTaught(yr, i)).length;
            return (
              <button key={yr} type="button" onClick={() => onSelectYear(yr)} style={{
                textAlign: 'left', background: WHITE, border: `1px solid ${RULE}`, borderRadius: 14,
                padding: 18, cursor: 'pointer', color: INK,
              }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 800, color: TEAL }}>YEAR {c.year}</div>
                <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 8px' }}>{c.ages}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: MUTED, lineHeight: 1.45 }}>
                  38 lessons · {c.tagline}
                </div>
                <div style={{ marginTop: 12, fontFamily: 'Inter, sans-serif', fontSize: 12, color: MUTED }}>
                  Marked taught: {taught}/38
                </div>
              </button>
            );
          })}
        </div>
        <Card title="Start here this week">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Y3 W1 — Welcome to ByteBuddies</div>
              <div style={{ color: MUTED, fontSize: 15, marginTop: 4 }}>Device charter · private vs share · trusted adult</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Solid onClick={() => onOpenLesson('y3', 0)}>Open the lesson</Solid>
              {onOpenPlan && (
                <button type="button" onClick={() => onOpenPlan('y3', 0)} style={{
                  background: 'transparent', border: `1px solid ${TEAL}`, color: TEAL, padding: '9px 14px',
                  borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer',
                }}>View plan</button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </StaffShell>
  );
}

export function TeacherScheme({ yr, onBack, onSelectYear, onSelectLesson, onPupil }) {
  const c = COURSES[yr];
  const lessons = c?.lessons || [];
  const [term, setTerm] = useState('all');
  const terms = c?.terms || [];
  const rows = useMemo(() => {
    return lessons.map((lesson, idx) => {
      const t = terms.find((x) => idx >= x.range[0] && idx <= x.range[1]);
      return { lesson, idx, t };
    }).filter((r) => term === 'all' || String(r.t?.term) === String(term));
  }, [lessons, terms, term]);

  return (
    <StaffShell onBack={onBack} onPupil={onPupil}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 48px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }} className="bb-staff-noprint">
          {COURSE_ORDER.map((id) => (
            <button key={id} type="button" onClick={() => onSelectYear(id)} style={{
              ...chipBtn(id === yr), padding: '8px 14px', borderRadius: 999,
            }}>Year {COURSES[id].year}</button>
          ))}
        </div>
        <h1 style={{ fontSize: 32, margin: '0 0 6px' }}>Year {c.year} scheme</h1>
        <p style={{ color: MUTED, margin: '0 0 18px', fontSize: 16 }}>{c.storyText}</p>
        <div className="bb-staff-noprint" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <button type="button" onClick={() => setTerm('all')} style={chipBtn(term === 'all')}>All terms</button>
          {terms.map((t) => (
            <button key={t.term} type="button" onClick={() => setTerm(String(t.term))} style={chipBtn(term === String(t.term))}>
              {t.name}
            </button>
          ))}
        </div>
        <div style={{ overflowX: 'auto', background: WHITE, border: `1px solid ${RULE}`, borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#e7e5e4', textAlign: 'left' }}>
                {['Wk', 'Lesson', 'Strand', 'Type', 'Mins', 'Kit', 'Yours', 'Taught'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', fontWeight: 800, color: MUTED, fontSize: 11, letterSpacing: 0.6 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ lesson, idx, t }) => {
                const taught = isTaught(yr, idx);
                const strand = lesson.ukCurriculum?.[0] || '';
                return (
                  <tr key={lesson.id || idx} onClick={() => onSelectLesson(idx)}
                    style={{ cursor: 'pointer', borderTop: `1px solid ${RULE}`, background: taught ? '#ecfdf5' : 'transparent' }}>
                    <td style={{ padding: '11px 12px', fontWeight: 800, color: TEAL }}>{lesson.week || idx + 1}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ fontWeight: 700 }}>{lesson.title}</div>
                      <div style={{ color: MUTED, fontSize: 12 }}>{t?.name} · {t?.focus}</div>
                    </td>
                    <td style={{ padding: '11px 12px' }}>{strand}</td>
                    <td style={{ padding: '11px 12px' }}>{KIND_LABEL[lesson.kind] || lesson.kind}</td>
                    <td style={{ padding: '11px 12px' }}>{lesson.estimatedMinutes || 55}</td>
                    <td style={{ padding: '11px 12px' }}>{isCodingLesson(lesson) ? 'Studio coding' : 'Unplugged / paper'}</td>
                    <td style={{ padding: '11px 12px', fontWeight: 700, color: hasTeacherContent(yr, idx) ? TEAL : MUTED }}>
                      {hasTeacherContent(yr, idx) ? 'Added' : '—'}
                    </td>
                    <td style={{ padding: '11px 12px' }}>{taught ? 'Yes' : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </StaffShell>
  );
}

export function TeacherLesson({ yr, idx, onBack, onPupil, onComplete, onNext, onPrev, onOpenLesson }) {
  const c = COURSES[yr];
  const lesson = c?.lessons?.[idx];
  const [tab, setTab] = useState('run');
  const [taught, setTaught] = useState(() => isTaught(yr, idx));
  const [mine, setMine] = useState(() => loadTeacherContent(yr, idx));
  const term = (c?.terms || []).find((t) => idx >= t.range[0] && idx <= t.range[1]);

  useEffect(() => {
    setMine(loadTeacherContent(yr, idx));
    setTaught(isTaught(yr, idx));
  }, [yr, idx]);

  if (!lesson) {
    return (
      <StaffShell onBack={onBack} onPupil={onPupil}>
        <div style={{ padding: 40 }}>Lesson not found.</div>
      </StaffShell>
    );
  }

  const time = timingFor(lesson);
  const acts = lesson.bibleActivities || [];
  const quiz = lesson.quiz || [];
  const codes = lesson.ukCurriculum || [];
  const dl = codes.includes('DL-1');

  function saveTaught() {
    markTaught(yr, idx);
    setTaught(true);
    onComplete?.(yr, idx, 0);
  }

  const tabs = [
    ['run', 'Plan'],
    ['mine', hasMeaningfulContent(mine) ? 'Your content · added' : 'Your content'],
    ['assess', 'Answer key'],
    ['cover', 'Cover / supply'],
  ];

  return (
    <StaffShell
      onBack={onBack}
      onPupil={onPupil}
      right={(
        <>
          <Ghost onClick={() => window.print()}>Print plan</Ghost>
          {onOpenLesson && <Solid onClick={onOpenLesson}>Open the lesson</Solid>}
          {onPrev && <Ghost onClick={onPrev}>Prev week</Ghost>}
          {onNext && <Ghost onClick={onNext}>Next week</Ghost>}
          <Solid tone={taught ? 'teal' : 'amber'} onClick={saveTaught}>
            {taught ? 'Taught ✓' : 'Mark as taught'}
          </Solid>
        </>
      )}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '22px 16px 56px' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 800, color: TEAL, letterSpacing: 1 }}>
          YEAR {c.year} · WEEK {lesson.week || idx + 1} · {term?.name || ''} · {KIND_LABEL[lesson.kind] || 'Lesson'}
        </div>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', margin: '6px 0 10px', lineHeight: 1.2 }}>{lesson.title}</h1>
        <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.5, margin: '0 0 16px' }}>
          {time.total} minutes · {isCodingLesson(lesson) ? 'Includes on-screen coding lab' : 'Works unplugged or on paper'} · {codes.join(' · ')}
        </p>

        {dl && (
          <div style={{
            background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 10, padding: '12px 14px',
            marginBottom: 16, fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9a3412', lineHeight: 1.5,
          }}>
            <b>Safeguarding.</b> This week includes DL-1. Use “trusted adult” as in your school policy. Do not collect home addresses or real passwords in class examples.
          </div>
        )}

        <div className="bb-staff-noprint" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {tabs.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)} style={{
              ...chipBtn(tab === id), borderRadius: 999, padding: '8px 14px',
            }}>{label}</button>
          ))}
        </div>

        {(tab === 'run') && (
          <>
            <div style={{
              background: '#ecfdf5', border: `1px solid ${TEAL}44`, borderRadius: 12, padding: '14px 16px',
              marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 800, color: TEAL }}>HOW TO TEACH THIS</div>
                <div style={{ fontSize: 16, marginTop: 4 }}>Read the script, then open the lesson page so children see the slides — not this planner.</div>
              </div>
              {onOpenLesson && <Solid onClick={onOpenLesson}>Open the lesson →</Solid>}
            </div>
            <Card title="Say this when you teach">
              <div style={{ fontSize: 16, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{lesson.teachScript || lesson.teach}</div>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: 14 }}>
              {[
                ['Starter / hook', '5 min', 'On the lesson page — do not project this plan.'],
                ['Input', `${time.input} min`, 'Teach script is on the lesson page (WALT / Let’s learn).'],
                ['Activities', `${time.actMins || 36} min`, acts.map((a) => `${a.mins || 12}′ ${a.title}`).join(' · ') || 'Three tasks'],
                ['Plenary / quiz', `${time.plenary} min`, 'Answers on the Answer key tab only.'],
              ].map(([h, m, b]) => (
                <div key={h} style={{ background: WHITE, border: `1px solid ${RULE}`, borderRadius: 10, padding: 12 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800, color: TEAL }}>{h}</div>
                  <div style={{ fontWeight: 800, margin: '4px 0' }}>{m}</div>
                  <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.4 }}>{b}</div>
                </div>
              ))}
            </div>
            <Card title="Learning objectives (for the planner)">
              {(lesson.objectives || []).map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 16 }}>
                  <span style={{ color: TEAL, fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>{i + 1}</span>
                  <span>{o}</span>
                </div>
              ))}
            </Card>
            <Card title="Resources">
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 15 }}>
                {resourcesFor(lesson).map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Card>
            <Card title="National curriculum language">
              {codes.map((code) => (
                <div key={code} style={{ marginBottom: 8, fontSize: 15, lineHeight: 1.5 }}>
                  <b style={{ fontFamily: 'Inter, sans-serif', color: TEAL }}>{code}</b>
                  {' — '}{KS2_STATUTORY[code] || ''}
                </div>
              ))}
            </Card>
            {lesson.international && (
              <Card title="If you teach outside England">
                <div style={{ fontSize: 15, lineHeight: 1.6, color: MUTED }}>{lesson.international}</div>
              </Card>
            )}
            {hasMeaningfulContent(mine) && (
              <Card title="Your additions (this class)">
                {mine.notes.trim() && <p style={{ fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{mine.notes}</p>}
                {mine.slides.map((s) => (
                  <div key={s.id} style={{ marginBottom: 8, fontSize: 15 }}><b>{s.title || 'Slide'}</b> — {s.body.slice(0, 160)}</div>
                ))}
                {mine.tasks.map((t) => (
                  <div key={t.id} style={{ marginBottom: 8, fontSize: 15 }}><b>{t.title}</b> ({t.mins} min)</div>
                ))}
                {mine.homework.trim() && <p style={{ fontSize: 15 }}><b>Follow-up:</b> {mine.homework}</p>}
                <button type="button" className="bb-staff-noprint" onClick={() => setTab('mine')} style={{
                  background: 'transparent', border: `1px solid ${TEAL}`, color: TEAL, padding: '8px 12px',
                  borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer', marginTop: 8,
                }}>Edit your content</button>
              </Card>
            )}
          </>
        )}

        {tab === 'mine' && (
          <YourContentEditor
            yr={yr}
            idx={idx}
            value={mine}
            onChange={(next) => {
              const saved = saveTeacherContent(yr, idx, next);
              setMine(saved);
            }}
          />
        )}

        {tab === 'assess' && (
          <>
            <Card title="Hinge / exit quiz — answers shown (do not project this tab)">
              {quiz.map((q, qi) => (
                <div key={qi} style={{ marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${RULE}` }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{qi + 1}. {q.q}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: MUTED }}>
                    {(q.options || []).map((opt, oi) => (
                      <li key={oi} style={{
                        marginBottom: 4,
                        color: oi === q.answer ? TEAL_DK : MUTED,
                        fontWeight: oi === q.answer ? 800 : 400,
                      }}>
                        {opt}{oi === q.answer ? '  ← correct' : ''}
                      </li>
                    ))}
                  </ul>
                  {q.rationale && (
                    <div style={{ marginTop: 6, fontSize: 14, color: MUTED }}><i>Why: {q.rationale}</i></div>
                  )}
                </div>
              ))}
            </Card>
            {lesson.reflection && (
              <Card title="Exit sentence">{lesson.reflection}</Card>
            )}
            {lesson.extension && (
              <Card title="If they finish early">{lesson.extension}</Card>
            )}
            {lesson.parentPrompt && (
              <Card title="Optional home talk">{lesson.parentPrompt}</Card>
            )}
          </>
        )}

        {tab === 'cover' && (
          <CoverSheet lesson={lesson} nextTitle={c.lessons[idx + 1]?.title} />
        )}
      </div>
    </StaffShell>
  );
}

const field = {
  width: '100%', boxSizing: 'border-box', border: `1px solid ${RULE}`, borderRadius: 8,
  padding: '10px 12px', fontSize: 15, color: INK, background: '#fff',
};

function CoverSheet({ lesson, nextTitle }) {
  const n = lesson.coverNotes || {};
  const sections = [
    ['Who this is for', n.whoThisIsFor],
    ['What this hour is', n.whatThisHourIs],
    ['Read this out at the start', n.sayAtTheStart ? `“${n.sayAtTheStart}”` : lesson.pupilHook],
    ['If the computers will not log in', n.ifComputersFail],
    ['If they finish early', n.ifTheyFinishEarly || lesson.extension],
    ['You know it went well if', n.howYouKnowItWorked],
    ['Watch for', n.watchFor],
    ['Leave a note for the class teacher', n.leaveForTheTeacher],
    ['Next week', n.nextWeek || (nextTitle ? `Next week: ${nextTitle}` : 'Last week of the year scheme.')],
  ];
  return (
    <>
      <Card title="Cover / supply notes — plain English">
        <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 0 }}>
          You can teach this lesson from this page. You do not need extra computing knowledge.
          Open the lesson page for the children; keep this tab for yourself.
        </p>
        {sections.map(([h, b]) => b ? (
          <div key={h} style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 800, color: TEAL, letterSpacing: 0.6, textTransform: 'uppercase' }}>{h}</div>
            <div style={{ fontSize: 16, lineHeight: 1.6, marginTop: 4 }}>{b}</div>
          </div>
        ) : null)}
      </Card>
      <Card title="Run the hour in this order">
        <ol style={{ fontSize: 16, lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          {(n.doInOrder || []).map((step, i) => <li key={i} style={{ marginBottom: 8 }}>{step}</li>)}
        </ol>
      </Card>
      {lesson.teachScript && (
        <Card title="If you need the full teaching script">
          <div style={{ fontSize: 16, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{lesson.teachScript}</div>
        </Card>
      )}
    </>
  );
}

function YourContentEditor({ value, onChange }) {
  const v = value || {};

  function patch(partial) {
    onChange({ ...v, ...partial });
  }

  return (
    <>
      <div style={{
        background: '#ecfdf5', border: `1px solid ${TEAL}44`, borderRadius: 12, padding: '14px 16px', marginBottom: 16,
      }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 800, color: TEAL }}>ADD YOUR OWN</div>
        <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: 1.5 }}>
          Keep the ByteBuddies week as it is, then add notes, extra slides, a task, resources or homework for this class.
          Saved in this browser. Extra slides appear on the lesson board if you tick the box below.
        </p>
      </div>
      <Card title="Show on the lesson board">
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={v.showOnBoard !== false}
            onChange={(e) => patch({ showOnBoard: e.target.checked })}
            style={{ marginTop: 4 }}
          />
          <span>Put my extra slides and tasks on the IWB lesson (after the ByteBuddies activities, before plenary). Private notes stay on this plan only.</span>
        </label>
      </Card>
      <Card title="Private notes (not shown to pupils)">
        <textarea
          value={v.notes || ''}
          onChange={(e) => patch({ notes: e.target.value })}
          rows={5}
          placeholder="e.g. Use table 3’s example from last week. Check laptops 12–14. Link to our school e-safety policy slide 4."
          style={{ ...field, minHeight: 120, resize: 'vertical', lineHeight: 1.5 }}
        />
      </Card>
      <Card title="Extra slides for the board">
        {(v.slides || []).map((s, i) => (
          <div key={s.id} style={{ border: `1px solid ${RULE}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 800, color: TEAL }}>Slide {i + 1}</div>
              <button type="button" onClick={() => patch({ slides: v.slides.filter((x) => x.id !== s.id) })} style={{
                background: 'none', border: 'none', color: AMBER, fontWeight: 800, cursor: 'pointer', fontSize: 13,
              }}>Remove</button>
            </div>
            <input
              value={s.title}
              onChange={(e) => patch({
                slides: v.slides.map((x) => x.id === s.id ? { ...x, title: e.target.value } : x),
              })}
              placeholder="Slide title"
              style={{ ...field, marginBottom: 8 }}
            />
            <textarea
              value={s.body}
              onChange={(e) => patch({
                slides: v.slides.map((x) => x.id === s.id ? { ...x, body: e.target.value } : x),
              })}
              rows={4}
              placeholder="What you want on the board — a prompt, example, or school-specific point."
              style={{ ...field, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        ))}
        <button type="button" onClick={() => patch({ slides: [...(v.slides || []), newSlide()] })} style={{
          background: TEAL, border: 'none', color: '#fff', padding: '9px 14px', borderRadius: 8,
          fontWeight: 800, fontSize: 13, cursor: 'pointer',
        }}>+ Add a slide</button>
      </Card>
      <Card title="Extra task">
        {(v.tasks || []).map((t, i) => (
          <div key={t.id} style={{ border: `1px solid ${RULE}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 800, color: TEAL }}>Task {i + 1}</div>
              <button type="button" onClick={() => patch({ tasks: v.tasks.filter((x) => x.id !== t.id) })} style={{
                background: 'none', border: 'none', color: AMBER, fontWeight: 800, cursor: 'pointer', fontSize: 13,
              }}>Remove</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 8, marginBottom: 8 }}>
              <input
                value={t.title}
                onChange={(e) => patch({
                  tasks: v.tasks.map((x) => x.id === t.id ? { ...x, title: e.target.value } : x),
                })}
                placeholder="Task title"
                style={field}
              />
              <input
                type="number"
                min={1}
                max={60}
                value={t.mins}
                onChange={(e) => patch({
                  tasks: v.tasks.map((x) => x.id === t.id ? { ...x, mins: e.target.value } : x),
                })}
                style={field}
                aria-label="Minutes"
              />
            </div>
            <textarea
              value={(t.steps || []).join('\n')}
              onChange={(e) => patch({
                tasks: v.tasks.map((x) => x.id === t.id ? { ...x, steps: e.target.value.split('\n') } : x),
              })}
              rows={4}
              placeholder="One step per line"
              style={{ ...field, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        ))}
        <button type="button" onClick={() => patch({ tasks: [...(v.tasks || []), newTask()] })} style={{
          background: TEAL, border: 'none', color: '#fff', padding: '9px 14px', borderRadius: 8,
          fontWeight: 800, fontSize: 13, cursor: 'pointer',
        }}>+ Add a task</button>
      </Card>
      <Card title="Extra resources (one per line)">
        <textarea
          value={(v.resources || []).join('\n')}
          onChange={(e) => patch({ resources: e.target.value.split('\n') })}
          rows={4}
          placeholder="School drive folder, printed sheet, YouTube clip your school allows…"
          style={{ ...field, resize: 'vertical', lineHeight: 1.5 }}
        />
      </Card>
      <Card title="Follow-up / homework">
        <textarea
          value={v.homework || ''}
          onChange={(e) => patch({ homework: e.target.value })}
          rows={3}
          placeholder="Optional. e.g. Practise the three class rules at home. Do not set passwords as homework."
          style={{ ...field, resize: 'vertical', lineHeight: 1.5 }}
        />
      </Card>
    </>
  );
}
