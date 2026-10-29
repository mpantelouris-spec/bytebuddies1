import React, { useEffect, useMemo, useRef, useState } from 'react';
import { COURSES } from '../../data/learnKs2Courses';
import { buildKs2LessonInteractives } from '../../data/ks2LessonInteractives.js';
import { getPuzzleLevels } from '../../data/learnPuzzleLevels';
import PuzzleProgression from './activities/PuzzleProgression';
import CodingLabPanel from './CodingLab/CodingLabPanel';
import { LessonPicture, MeetDotPortrait, pictureForSlide } from './LessonArt.jsx';
import { LOOKS } from './art/LessonScene.jsx';
import { topicFor } from '../../data/funActivities.js';
import { UniqueHeader, HeaderMark, worldMarkKind, activityMarkKind } from './LessonHeaders.jsx';
import { YEAR_WORLDS } from '../../data/pupilMissions.js';
import {
  loadTeacherContent, saveTeacherContent, subscribeTeacherContent, newSlide,
} from '../../utils/teacherLessonContent.js';
import { isCodingLesson } from '../../data/learnCodingConfig.js';
import { readWork, recordWork } from '../../utils/workLog.js';
import { useUser } from '../../contexts/UserContext';
import { getTeaching } from '../../data/teaching/index.js';
import TeachingVisual from './TeachingVisual.jsx';
import { EmojiIcon } from '../ui/Icon.jsx';

const INK = '#0f172a';
const MUTED = '#475569';

function NumberedList({ items, accent, size = 18, tick }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((o, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: size, lineHeight: 1.45 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10, background: accent, color: '#fff', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900,
          }}>{tick ? '✓' : i + 1}</span>
          <span style={{ paddingTop: 2 }}>{o}</span>
        </div>
      ))}
    </div>
  );
}

/** A question for the class with the answer hidden until the teacher reveals it. */
function RevealCard({ q, a, options, accent, n }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `2px solid ${accent}44`, borderRadius: 16, padding: '16px 18px', background: '#fff' }}>
      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.4 }}>{n ? <span style={{ color: accent }}>{n}. </span> : null}{q}</div>
      {options?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 12 }}>
          {options.map((o, i) => (
            <div key={i} style={{
              padding: '10px 12px', borderRadius: 10, fontSize: 17,
              border: `2px solid ${open && o === a ? '#40c057' : '#e2e8f0'}`, background: open && o === a ? '#ebfbee' : '#f8fafc',
              fontWeight: open && o === a ? 800 : 500,
            }}>{String.fromCharCode(65 + i)}. {o}</div>
          ))}
        </div>
      )}
      {open && !options?.length && (
        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: '#ebfbee', border: '2px solid #b2f2bb', fontSize: 19, whiteSpace: 'pre-wrap' }}>
          <b style={{ color: '#2b8a3e' }}>Answer: </b>{a}
        </div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} style={{
        marginTop: 12, minHeight: 40, padding: '0 16px', borderRadius: 10, border: `2px solid ${accent}`,
        background: open ? '#fff' : accent, color: open ? accent : '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
      }}>{open ? 'Hide answer' : 'Reveal answer'}</button>
    </div>
  );
}

function MiniQuiz({ lesson, accent, onBack, onScore, workKey }) {
  const qs = lesson.quiz || [];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const picksRef = useRef([]);
  const q = qs[i];
  if (!q) {
    return (
      <div style={{ padding: 28, textAlign: 'center' }}>
        <p>No quiz for this week.</p>
        <button type="button" onClick={onBack} style={textBtn(accent)}>Back to the lesson</button>
      </div>
    );
  }
  function choose(oi) {
    if (picked != null) return;
    setPicked(oi);
    picksRef.current[i] = { q: q.q, chosen: q.options?.[oi] ?? String(oi), correct: q.options?.[q.answer] ?? '', ok: oi === q.answer };
    const nextScore = score + (oi === q.answer ? 1 : 0);
    setScore(nextScore);
    setTimeout(() => {
      if (i + 1 < qs.length) {
        setI(i + 1);
        setPicked(null);
      } else {
        const stars = nextScore >= qs.length ? 3 : nextScore >= Math.ceil(qs.length * 0.6) ? 2 : 1;
        // Keep the pupil's answers so their teacher can see the real work when marking.
        const prev = readWork(workKey);
        recordWork(workKey, { type: 'lesson', title: lesson.title, quiz: picksRef.current.slice(), score: nextScore, total: qs.length, stars, attempts: (prev?.attempts || 0) + 1, completedAt: new Date().toISOString() });
        onScore(nextScore, qs.length, stars);
      }
    }, 650);
  }
  return (
    <div style={{ padding: '24px 28px 36px' }}>
      <button type="button" onClick={onBack} style={textBtn(accent)}>← Lesson</button>
      <div style={{ fontFamily: '"Trebuchet MS", sans-serif', fontSize: 13, fontWeight: 800, color: accent, margin: '12px 0 8px' }}>
        Dot’s quiz · {i + 1} of {qs.length}
      </div>
      <h2 style={{ fontSize: 22, lineHeight: 1.35, margin: '0 0 16px' }}>{q.q}</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {(q.options || []).map((opt, oi) => {
          const show = picked != null;
          const ok = oi === q.answer;
          const mine = oi === picked;
          let border = '#cbd5e1';
          let bg = '#fff';
          if (show && ok) { border = '#16a34a'; bg = '#f0fdf4'; }
          if (show && mine && !ok) { border = '#dc2626'; bg = '#fef2f2'; }
          return (
            <button key={oi} type="button" onClick={() => choose(oi)} style={{
              textAlign: 'left', padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${border}`, background: bg, color: INK, fontSize: 16, fontWeight: 700,
            }}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

const textBtn = (accent) => ({
  background: 'none', border: 'none', color: accent, fontWeight: 800, cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, padding: 0,
});

const barBtn = (filled, accent) => ({
  border: filled ? 'none' : '1px solid rgba(255,255,255,0.4)',
  background: filled ? '#fff' : 'transparent',
  color: filled ? accent : '#fff',
  padding: '8px 12px', borderRadius: 8, fontWeight: 800, fontSize: 12,
  cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
});

function SlideChrome({ children, picture, header, footer, wide, interactive }) {
  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
      margin: 0, background: '#fff', overflow: 'hidden',
    }}>
      <style>{`
        .bb-lesson-slide {
          display: grid;
          grid-template-columns: minmax(200px, min(42vw, 420px)) 1fr;
          flex: 1 1 auto;
          min-height: 0;
          height: 100%;
        }
        .bb-lesson-slide .bb-lesson-art {
          min-height: 0 !important;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bb-lesson-slide .bb-lesson-art svg {
          display: block;
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
        }
        .bb-lesson-slide--wide { grid-template-columns: 1fr; }
        @media (min-width: 1200px) and (min-height: 700px) { .bb-slide-zoom { zoom: 1.2; } }
        @media (min-width: 1600px) and (min-height: 850px) { .bb-slide-zoom { zoom: 1.4; } }
        @media (min-width: 2200px) and (min-height: 1100px) { .bb-slide-zoom { zoom: 1.75; } }
        .bb-lesson-slide--wide > div { max-width: 1040px; width: 100%; margin: 0 auto; box-sizing: border-box; }
        @media (max-width: 760px) {
          .bb-lesson-slide { grid-template-columns: 1fr; }
          .bb-lesson-slide .bb-lesson-art { height: 220px; min-height: 220px !important; }
        }
      `}</style>
      <div className={wide ? 'bb-lesson-slide bb-lesson-slide--wide' : 'bb-lesson-slide'}>
        {!wide && <LessonPicture theme={picture} className="bb-lesson-art" />}
        <div style={{ padding: '22px 24px 8px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
          <div className={interactive ? undefined : 'bb-slide-zoom'} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {header}
            <div style={{ fontSize: 18, lineHeight: 1.55, color: INK, flex: 1 }}>{children}</div>
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0, borderTop: '1px solid #e2e8f0' }}>{footer}</div>
    </div>
  );
}

export default function ClassroomLesson({
  yr, idx, role, onBack, onPlan, onRoleChange, onComplete, onNextLesson, onMap,
}) {
  const c = COURSES[yr];
  const lesson = c?.lessons?.[idx];
  const term = (c?.terms || []).find((t) => idx >= t.range[0] && idx <= t.range[1]);
  const [phase, setPhase] = useState('board');
  const [slide, setSlide] = useState(0);
  const [score, setScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [extras, setExtras] = useState(() => loadTeacherContent(yr, idx));
  const [addOpen, setAddOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const jumpToId = useRef(null);
  const interactives = buildKs2LessonInteractives(yr, idx);
  const puzzleLevels = getPuzzleLevels(yr, idx, interactives);

  const { user, isLoggedIn } = useUser();
  const lockPupil = isLoggedIn && (user?.role === 'student' || user?.role === 'parent');
  const themeId = topicFor(lesson || {});
  const look = LOOKS[themeId] || LOOKS.algorithms;
  const palette = { bg: look.sky[0], wall: look.blob[0], accent: look.accent, ink: '#1e293b' };
  const isTeacher = !lockPupil && role === 'teacher';
  const acts = lesson?.bibleActivities || [];

  const teaching = useMemo(() => getTeaching(yr, idx), [yr, idx]);

  const slides = useMemo(() => {
    if (!lesson) return [];
    const T = teaching || {};
    const objectives = (T.objectives?.length ? T.objectives : lesson.objectives || []).slice(0, 4);
    const vocab = lesson.vocabulary || [];
    const week = lesson.week || idx + 1;
    const world = YEAR_WORLDS[yr]?.world || `Year ${c.year}`;
    const worldKind = worldMarkKind(yr);
    const hook = lesson.pupilHook || lesson.mission;
    const accent = palette.accent;
    const H = (kind, label, title) => (
      <UniqueHeader color={accent} ink={palette.ink} kind={kind} label={label} title={title} />
    );
    const tryIts = Array.isArray(T.tryIt) ? T.tryIt : T.tryIt ? [T.tryIt] : [];
    const words = vocab.map((v) => (typeof v === 'string' ? { word: v, def: '' } : v)).filter((v) => v?.word);

    const S = {
      title: {
        id: 'title',
        picture: pictureForSlide(lesson, 'title'),
        header: H(worldKind, `${world} · Week ${week}${T.review ? ' · Review' : ''}`, lesson.title),
        body: (
          <>
            <p style={{ fontSize: 22, lineHeight: 1.5, margin: '0 0 18px' }}>{hook}</p>
            {/meet|welcome/i.test(lesson.title) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <MeetDotPortrait size={130} />
                <p style={{ margin: 0, fontWeight: 800, color: palette.ink, fontSize: 19 }}>This is Dot — your coding buddy all the way through KS2.</p>
              </div>
            )}
          </>
        ),
      },
      objectives: {
        id: 'objectives',
        picture: pictureForSlide(lesson, 'walt'),
        header: H('mission', 'Learning objectives', 'Today I can…'),
        body: <NumberedList items={objectives} accent={accent} size={21} />,
      },
      starter: T.big && {
        id: 'starter',
        picture: pictureForSlide(lesson, 'starter'),
        header: H('talk', 'Starter · think, pair, share', 'Big question'),
        body: (
          <>
            <p style={{ fontSize: 28, lineHeight: 1.4, fontWeight: 800, margin: '0 0 22px', color: palette.ink }}>{T.big}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['🤔 Think on your own', '👥 Talk with a partner', '🙋 Share with the class'].map((s) => (
                <span key={s} style={{ background: palette.bg, border: `2px solid ${accent}55`, borderRadius: 999, padding: '8px 14px', fontWeight: 800, fontSize: 16 }}>{s}</span>
              ))}
            </div>
          </>
        ),
      },
      words: words.length > 0 && {
        id: 'words',
        picture: pictureForSlide(lesson, 'learn'),
        header: H('paper', 'Key vocabulary', 'Words we will use'),
        body: (
          <div style={{ display: 'grid', gap: 10 }}>
            {words.slice(0, 6).map((w) => (
              <div key={w.word} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 160px) 1fr', gap: 12, alignItems: 'baseline', padding: '10px 14px', background: palette.bg, borderRadius: 12, borderLeft: `6px solid ${accent}` }}>
                <b style={{ fontSize: 21, color: palette.ink }}>{w.word}</b>
                <span style={{ fontSize: 18 }}>{!/^key term/i.test(w.def || '') ? w.def : ''}</span>
              </div>
            ))}
          </div>
        ),
      },
      learn: T.explain?.length > 0 && {
        id: 'learn',
        picture: pictureForSlide(lesson, 'learn'),
        header: H('learn', 'Learn', lesson.conceptName && !/^(programs|computing)$/i.test(lesson.conceptName) ? lesson.conceptName : 'The big idea'),
        body: (
          <>
            {T.explain.map((p, i) => <p key={i} style={{ fontSize: 20, lineHeight: 1.6, margin: '0 0 14px' }}>{p}</p>)}
            {T.realWorld && (
              <div style={{ marginTop: 6, padding: '12px 14px', borderRadius: 12, background: '#eff6ff', border: '2px solid #bfdbfe', fontSize: 17 }}>
                <b><EmojiIcon e="🌍" style={{ marginRight: '0.35em' }} />In the real world: </b>{T.realWorld}
              </div>
            )}
          </>
        ),
      },
      example: T.example && {
        id: 'example',
        wide: true,
        header: H('blocks', T.review ? 'Remember' : 'Worked example', T.example.title || 'Let’s look closely'),
        body: <TeachingVisual example={{ ...T.example, title: undefined }} accent={accent} large />,
      },
      mistake: T.mistake && {
        id: 'mistake',
        picture: pictureForSlide(lesson, 'practice'),
        header: H('check', 'Watch out', 'A common mistake'),
        body: (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ padding: '14px 16px', borderRadius: 14, background: '#fff5f5', border: '2px solid #ffc9c9', fontSize: 20 }}>
              <b style={{ color: '#c92a2a' }}><EmojiIcon e="❌" style={{ marginRight: '0.35em' }} />The mistake: </b>{T.mistake.wrong}
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 14, background: '#ebfbee', border: '2px solid #b2f2bb', fontSize: 20 }}>
              <b style={{ color: '#2b8a3e' }}><EmojiIcon e="✅" style={{ marginRight: '0.35em' }} />Instead: </b>{T.mistake.fix}
            </div>
          </div>
        ),
      },
      tryIt: tryIts.length > 0 && {
        id: 'try',
        wide: true,
        header: H('hands', 'Your turn', tryIts.length > 1 ? 'Quick-fire questions' : 'Try it together'),
        body: (
          <div style={{ display: 'grid', gap: 14 }}>
            {tryIts.map((t, i) => <RevealCard key={`${idx}-${i}`} q={t.q} a={t.a} accent={accent} n={tryIts.length > 1 ? i + 1 : null} />)}
          </div>
        ),
      },
      summary: T.summary?.length > 0 && {
        id: 'summary',
        picture: pictureForSlide(lesson, 'plenary'),
        header: H('done', 'Summary', 'What we learned today'),
        body: (
          <>
            <NumberedList items={T.summary} accent={accent} size={21} tick />
            {lesson.reflection && (
              <p style={{ marginTop: 18, fontSize: 19, padding: '12px 14px', background: palette.bg, borderRadius: 12 }}>
                <b>Exit ticket: </b>finish the sentence — “{lesson.reflection.replace(/…$/, '')}…”
              </p>
            )}
          </>
        ),
      },
    };

    const codeLab = isCodingLesson(lesson) && {
      id: 'code-lab',
      wide: true,
      header: H('blocks', 'Coding', 'Build it in code'),
      body: <CodingLabPanel yr={yr} idx={idx} lesson={lesson} color={accent} />,
    };

    if (!isTeacher) {
      return [
        S.title, S.objectives, S.learn, S.example, S.mistake, S.tryIt,
        {
          id: 'play',
          wide: true,
          header: H('play', 'Play', 'Dot’s playground'),
          body: puzzleLevels.length > 0 ? <PuzzleProgression puzzles={puzzleLevels} color={accent} minLevelsToPass={1} /> : null,
        },
        codeLab,
        S.summary,
        {
          id: 'check',
          picture: pictureForSlide(lesson, 'plenary'),
          header: H('check', 'Quiz time', 'Show Dot what you know'),
          body: (
            <>
              <p style={{ fontSize: 20, margin: '0 0 16px' }}>{(lesson.quiz || []).length} quick questions about today’s lesson.</p>
              <button type="button" onClick={() => { window.scrollTo(0, 0); setPhase('quiz'); }} style={{
                ...barBtn(true, accent), background: accent, color: '#fff', padding: '14px 22px', fontSize: 16,
              }}>Start the quiz →</button>
            </>
          ),
        },
      ].filter((s) => s && s.body);
    }

    return [
      S.title, S.objectives, S.starter, S.words, S.learn, S.example, S.mistake, S.tryIt,
      ...acts.map((act, i) => ({
        id: `task-${i}`,
        picture: pictureForSlide(lesson, `task-${i}`, act),
        header: H(activityMarkKind(act.type), `${act.label || 'Activity'} · ${act.mins || 12} min`, act.title),
        body: (
          <>
            {act.purpose && <p style={{ margin: '0 0 12px', fontWeight: 800, color: palette.ink, fontSize: 19 }}>{act.purpose}</p>}
            <ol style={{ margin: 0, paddingLeft: 24, fontSize: 19 }}>
              {(act.steps || []).map((s, si) => <li key={si} style={{ marginBottom: 8 }}>{s.replace(/^Teacher:\s*/i, '')}</li>)}
            </ol>
            {act.check && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: palette.bg, borderRadius: 12, borderLeft: `6px solid ${accent}`, fontSize: 18 }}>
                <b>Think about it: </b>{act.check}
              </div>
            )}
          </>
        ),
      })),
      codeLab,
      ...(extras.showOnBoard !== false ? [
        ...extras.slides.filter((s) => (s.title || '').trim() || (s.body || '').trim()).map((s) => ({
          id: `yours-${s.id}`,
          picture: pictureForSlide(lesson, 'learn'),
          header: H('paper', 'Your class', s.title || 'Your slide'),
          body: <p style={{ fontSize: 20, margin: 0, whiteSpace: 'pre-wrap' }}>{s.body || ''}</p>,
        })),
        ...extras.tasks.filter((t) => (t.title || '').trim() || (t.steps || []).length).map((t) => ({
          id: `your-task-${t.id}`,
          picture: pictureForSlide(lesson, 'practice'),
          header: H('hands', `Your task · ${t.mins || 10} min`, t.title || 'Class task'),
          body: (
            <ol style={{ margin: 0, paddingLeft: 22 }}>
              {(t.steps || []).map((step, si) => <li key={si} style={{ marginBottom: 8 }}>{step}</li>)}
            </ol>
          ),
        })),
        (extras.resources || []).length ? {
          id: 'your-resources',
          picture: pictureForSlide(lesson, 'learn'),
          header: H('paper', 'Your class', 'Extra resources'),
          body: (
            <ul style={{ margin: 0, paddingLeft: 22, fontSize: 18 }}>
              {extras.resources.map((r, i) => <li key={i} style={{ marginBottom: 8 }}>{r}</li>)}
            </ul>
          ),
        } : null,
        extras.homework.trim() ? {
          id: 'your-homework',
          picture: pictureForSlide(lesson, 'plenary'),
          header: H('check', 'Your class', 'Follow-up'),
          body: <p style={{ fontSize: 20, margin: 0, whiteSpace: 'pre-wrap' }}>{extras.homework}</p>,
        } : null,
      ] : []),
      S.summary,
      (lesson.quiz || []).length > 0 && {
        id: 'plenary',
        wide: true,
        header: H('check', 'Plenary', 'Check for understanding'),
        body: (
          <div style={{ display: 'grid', gap: 12 }}>
            {lesson.quiz.map((q, qi) => (
              <RevealCard key={`${idx}-q${qi}`} n={qi + 1} q={q.q} accent={accent}
                options={q.options} a={q.options?.[q.answer]} />
            ))}
          </div>
        ),
      },
    ].filter((s) => s && s.body);
  }, [lesson, teaching, c, idx, palette, isTeacher, acts, puzzleLevels, yr, extras]);

  useEffect(() => { setPhase('board'); setSlide(0); }, [yr, idx, role]);

  useEffect(() => {
    setExtras(loadTeacherContent(yr, idx));
    return subscribeTeacherContent(yr, idx, setExtras);
  }, [yr, idx]);

  useEffect(() => {
    if (!jumpToId.current) return;
    const i = slides.findIndex((s) => s.id === jumpToId.current);
    jumpToId.current = null;
    if (i >= 0) setSlide(i);
  }, [slides]);

  useEffect(() => {
    function onKey(e) {
      if (phase !== 'board') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setSlide((s) => Math.min(s + 1, Math.max(0, slides.length - 1)));
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setSlide((s) => Math.max(0, s - 1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, slides.length]);

  if (!lesson) {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: '#e2e8f0', minHeight: '100%' }}>
        <p>Lesson not found.</p>
        <button type="button" onClick={onBack} style={textBtn('#2563eb')}>Go back</button>
      </div>
    );
  }

  const week = lesson.week || idx + 1;
  const worldInfo = YEAR_WORLDS[yr] || { world: `Year ${c.year}` };
  const barBg = { y3: '#0f766e', y4: '#1e3a8a', y5: '#6d28d9', y6: '#b45309' }[yr] || palette.ink;
  const barKind = worldMarkKind(yr);
  const nextIdx = idx + 1 < (c.lessons || []).length ? idx + 1 : null;
  const nextLesson = nextIdx != null ? c.lessons[nextIdx] : null;
  const current = slides[Math.min(slide, Math.max(0, slides.length - 1))] || slides[0];
  const last = slide >= slides.length - 1;

  return (
    <div className="bb-class-lesson" style={{
      flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column',
      background: palette.bg, color: INK, fontFamily: 'Nunito, Inter, Georgia, sans-serif',
    }}>
      <div style={{
        flexShrink: 0, background: barBg, color: '#fff',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        fontFamily: '"Trebuchet MS", Nunito, sans-serif',
      }}>
        <button type="button" onClick={onBack} style={barBtn(false, palette.accent)}>← {isTeacher ? 'Scheme' : 'Path'}</button>
        <div style={{
          flex: 1, fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <HeaderMark kind={barKind} color="#fff" size={20} />
            {worldInfo.world}
          </span>
          <span style={{
            background: 'rgba(255,255,255,.18)', padding: '4px 10px', borderRadius: 999, fontSize: 13,
          }}>Week {week}</span>
          <span style={{ opacity: 0.85, fontSize: 13 }}>{slide + 1} / {slides.length}</span>
        </div>
        {isTeacher && onPlan && (
          <button type="button" onClick={onPlan} style={barBtn(false, palette.accent)}>Lesson plan</button>
        )}
        {isTeacher && (
          <button type="button" onClick={() => { setDraftTitle(''); setDraftBody(''); setAddOpen(true); }} style={barBtn(false, palette.accent)}>
            Add your content
          </button>
        )}
        {!lockPupil && (
        <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 3 }}>
          <button type="button" onClick={() => onRoleChange?.('pupil')} style={barBtn(!isTeacher, palette.accent)}>Pupil</button>
          <button type="button" onClick={() => onRoleChange?.('teacher')} style={barBtn(isTeacher, palette.accent)}>Teacher</button>
        </div>
        )}
      </div>

      {phase === 'quiz' && (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', background: '#fff', borderRadius: 20, border: `4px solid ${palette.accent}`, overflow: 'hidden' }}>
          <LessonPicture theme={pictureForSlide(lesson, 'quiz')} style={{ height: 160 }} wide />
          <MiniQuiz
            workKey={`lesson:${yr}:${idx}`}
            lesson={lesson}
            accent={palette.accent}
            onBack={() => setPhase('board')}
            onScore={(s, total) => {
              setScore(s);
              setQuizTotal(total);
              onComplete?.(yr, idx, lesson.xp);
              setPhase('done');
            }}
          />
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ maxWidth: 860, margin: '24px auto', background: '#fff', borderRadius: 24, border: `6px solid ${palette.accent}`, overflow: 'hidden' }}>
          <LessonPicture theme={pictureForSlide(lesson, 'done')} style={{ height: 200 }} wide />
          <div style={{ padding: '20px 20px 28px' }}>
            <UniqueHeader color={palette.accent} ink={palette.ink} kind="done" label="Finished" title="You did it!" />
            <p style={{ textAlign: 'center', color: MUTED, margin: '0 0 16px' }}>{score} / {quizTotal} on Dot’s quiz</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              {nextLesson && (
                <button type="button" onClick={() => onNextLesson?.(yr, nextIdx)} style={{
                  ...barBtn(true, palette.accent), background: palette.accent, color: '#fff', padding: '12px 18px', fontSize: 14,
                }}>Next lesson →</button>
              )}
              <button type="button" onClick={onMap} style={{ ...barBtn(false, palette.accent), color: palette.ink, border: `2px solid ${palette.accent}` }}>Map</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'board' && current && (
        <SlideChrome
          key={current.id}
          wide={current.wide}
          interactive={current.id === 'code-lab' || current.id === 'play'}
          picture={current.picture}
          header={current.header}
          footer={(
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px',
              fontFamily: 'Inter, system-ui, sans-serif', flexWrap: 'wrap',
            }}>
              <button type="button" disabled={slide === 0} onClick={() => setSlide((s) => Math.max(0, s - 1))} style={{
                ...barBtn(true, palette.accent), background: slide === 0 ? '#e2e8f0' : palette.bg,
                color: palette.ink, border: `2px solid ${palette.wall}`, padding: '12px 16px', fontSize: 14,
              }}>← Back</button>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                {slides.map((sl, i) => (
                  <button key={sl.id} type="button" aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)} style={{
                    width: i === slide ? 22 : 10, height: 10, borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: i === slide ? palette.accent : palette.wall,
                  }} />
                ))}
              </div>
              <button type="button" onClick={() => {
                if (last) {
                  if (!isTeacher) { setPhase('quiz'); }
                  return;
                }
                setSlide((s) => s + 1);
              }} style={{
                ...barBtn(true, palette.accent), background: palette.accent, color: '#fff', padding: '12px 18px', fontSize: 14,
              }}>{last ? (isTeacher ? 'Last slide' : 'Check →') : 'Next →'}</button>
            </div>
          )}
        >
          {current.body}
        </SlideChrome>
      )}

      {isTeacher && addOpen && (
        <div
          role="dialog"
          aria-label="Add your own slide"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={() => setAddOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(520px, 100%)', background: '#fff', borderRadius: 16, padding: 20,
              boxShadow: '0 16px 50px rgba(15,23,42,0.25)', color: INK,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: palette.accent, letterSpacing: 1, marginBottom: 6 }}>YOUR CONTENT</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20 }}>Add a slide to this lesson</h3>
            <p style={{ margin: '0 0 14px', color: MUTED, fontSize: 14, lineHeight: 1.45 }}>
              For this class only. Saved in this browser. Open the lesson plan to add notes, tasks, resources or homework.
            </p>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Slide title"
              style={{
                width: '100%', boxSizing: 'border-box', marginBottom: 8, padding: '10px 12px',
                border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 15,
              }}
            />
            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={5}
              placeholder="What should appear on the board?"
              style={{
                width: '100%', boxSizing: 'border-box', marginBottom: 14, padding: '10px 12px',
                border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 15, resize: 'vertical', lineHeight: 1.5,
              }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {onPlan && (
                <button type="button" onClick={onPlan} style={{ ...barBtn(false, palette.accent), color: palette.ink, border: `2px solid ${palette.accent}` }}>
                  Full editor on the plan
                </button>
              )}
              <button type="button" onClick={() => setAddOpen(false)} style={{ ...barBtn(false, palette.accent), color: palette.ink, border: '1px solid #cbd5e1' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const slideItem = { ...newSlide(), title: draftTitle.trim() || 'Your slide', body: draftBody };
                  jumpToId.current = `yours-${slideItem.id}`;
                  const next = saveTeacherContent(yr, idx, {
                    ...extras,
                    showOnBoard: true,
                    slides: [...(extras.slides || []), slideItem],
                  });
                  setExtras(next);
                  setAddOpen(false);
                }}
                style={{ ...barBtn(true, palette.accent), background: palette.accent, color: '#fff', padding: '10px 16px' }}
              >
                Save on this lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
