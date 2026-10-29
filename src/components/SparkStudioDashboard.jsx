import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useProject } from '../contexts/ProjectContext';
import {
  fetchClass, fetchAssignments, readMyProgress, findSub, pupilId, statusFor, STATUS, dueLabel,
} from '../utils/classroomStore.js';
import { KIND_META, classroomHash } from './classroom/assignables.js';
import './SparkStudioDashboard.css';
import { EmojiIcon, IconText } from './ui/Icon.jsx';

const TOTAL_LESSONS = 152;

const modes = [
  { id: 'gamebuilder', icon: '🎮', name: 'Arena Builder', blurb: 'Make a world to play in', color: 'coral', tags: ['obstacles', 'power-ups'] },
  { id: 'studio', icon: '🤖', name: 'Robot Workshop', blurb: 'Invent your new best friend', color: 'violet', tags: ['design', 'behaviour'] },
  { id: 'missions', icon: '🚀', name: 'Coding Adventure', blurb: 'Solve a mission in space', color: 'cyan', tags: ['quests', 'blocks'] },
  { id: 'robot', icon: '🔬', name: 'Robot Lab', blurb: 'Program a real micro:bit robot', color: 'mint', tags: ['hardware', 'sensors'] },
];

const extraModes = [
  { id: 'learn', icon: '📚', name: 'Lessons', blurb: 'Learn something new, step by step', color: 'gold', tags: ['quizzes', 'badges'] },
  { id: 'challenges', icon: '🧩', name: 'Challenges', blurb: 'Crack a brain-twisting puzzle', color: 'blue', tags: ['logic', 'secrets'] },
];

import { CAMPAIGNS as MISSION_WORLDS } from './missions/missionData.js';

// Every mission world, straight from the missions data (new worlds appear automatically)
const CAMPAIGNS = MISSION_WORLDS.map(({ id, title, emoji, color, missions }) => ({ id, title, emoji, color, missions: missions.length }));

const SPARKS = [
  { icon: '⚡', title: 'Make it move', desc: 'Give a robot a movement block and send it across the map.', page: 'missions' },
  { icon: '🔁', title: 'Loop the loop', desc: 'Use a repeat block to draw a perfect square.', page: 'gamebuilder' },
  { icon: '👋', title: 'Say hello', desc: 'Make a sprite say hello when it is clicked.', page: 'gamebuilder' },
  { icon: '🛰️', title: 'Sense the world', desc: 'Add a sensor to your robot and test it in the arena.', page: 'studio' },
  { icon: '📖', title: 'One more lesson', desc: 'Finish one lesson and answer its quiz.', page: 'learn' },
  { icon: '🎨', title: 'Change the scene', desc: 'Switch the backdrop when your game starts.', page: 'gamebuilder' },
  { icon: '🧠', title: 'Decide it', desc: 'Use an if block so your sprite reacts to a key.', page: 'gamebuilder' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function readMissionProgress() {
  try { return JSON.parse(localStorage.getItem('bb-mission-progress') || '{}') || {}; } catch { return {}; }
}

/** Pupils in a class see the work their teacher has set that still needs doing. */
function useClassWork(user) {
  const [state, setState] = useState({ cls: null, items: [] });
  useEffect(() => {
    if (!user?.classroomId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const [cls, asg] = await Promise.all([fetchClass(user.classroomId), fetchAssignments(user.classroomId)]);
        if (cancelled || !cls) return;
        const progress = readMyProgress();
        const me = pupilId(user);
        const items = (asg || [])
          .map((a) => ({ a, st: statusFor(a, findSub(cls.submissions, a.id, me), progress) }))
          .filter(({ st }) => st === 'todo' || st === 'late')
          .sort((x, y) => (x.a.dueDate || '9999').localeCompare(y.a.dueDate || '9999'));
        setState({ cls, items });
      } catch { /* offline — the dashboard still works without class data */ }
    })();
    return () => { cancelled = true; };
  }, [user?.classroomId]); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}

export default function SparkStudioDashboard({ onNavigate }) {
  const { user } = useUser();
  const { projects = [], setActiveProject } = useProject();
  const [activeMode, setActiveMode] = useState(null);
  const [showAllModes, setShowAllModes] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [toast, setToast] = useState('');

  const firstName = (user?.name || 'Builder').split(' ')[0];
  const recentProjects = useMemo(() => projects.slice(0, 3), [projects]);
  const progress = useMemo(() => readMyProgress(), []);
  const missionProgress = useMemo(() => readMissionProgress(), []);
  const { cls, items: classWork } = useClassWork(user);

  const xp = user?.xp || 0;
  const xpToNext = Math.max(1, user?.xpToNext || 500);
  const levelPct = Math.min(100, Math.round((xp / xpToNext) * 100));
  const weeklyXP = user?.weeklyXP?.length === 7 ? user.weeklyXP : [0, 0, 0, 0, 0, 0, 0];
  const weekTotal = weeklyXP.reduce((a, b) => a + b, 0);
  const weekMax = Math.max(...weeklyXP, 1);
  const today = new Date().getDay();
  const lessonsDone = progress.lessonsDone.length;
  const missionsDone = progress.missionsDone.length;
  const isFirstVisit = lessonsDone === 0 && missionsDone === 0 && xp === 0;
  const missionsTotal = CAMPAIGNS.reduce((n, c) => n + c.missions, 0);
  const spark = SPARKS[Math.floor(Date.now() / 86400000) % SPARKS.length];

  const activeCampaign = CAMPAIGNS.find((c) => {
    const done = missionProgress[c.id]?.completed?.length || 0;
    return done > 0 && done < c.missions;
  }) || CAMPAIGNS.find((c) => (missionProgress[c.id]?.completed?.length || 0) < c.missions) || CAMPAIGNS[0];
  const activeDone = missionProgress[activeCampaign.id]?.completed?.length || 0;

  // The single most useful next step, shown as the hero's main button.
  const nextStep = classWork[0]
    ? { label: `Do: ${classWork[0].a.title}`, go: () => { window.location.hash = classroomHash(classWork[0].a, cls); } }
    : lessonsDone > 0
      ? { label: 'Continue learning', go: () => onNavigate('learn') }
      : { label: 'Start Year 3, Week 1', go: () => onNavigate('learn/y3/w01') };

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2400); };

  const chooseMode = (mode) => {
    setActiveMode(mode.name);
    notify(`${mode.name} is ready — let’s build!`);
    window.setTimeout(() => onNavigate(mode.id), 260);
  };

  const suggestions = [
    {
      icon: '📚', title: lessonsDone ? 'Pick up your lessons' : 'Start Year 3, Week 1',
      sub: lessonsDone ? `${lessonsDone} of ${TOTAL_LESSONS} lessons done` : 'Meet Dot the robot and learn the class rules',
      go: () => onNavigate(lessonsDone ? 'learn' : 'learn/y3/w01'), color: '#6366f1',
    },
    {
      icon: activeCampaign.emoji, title: `${activeCampaign.title} mission`,
      sub: activeDone ? `${activeDone} of ${activeCampaign.missions} missions complete` : 'A new story is waiting for your code',
      go: () => onNavigate('missions'), color: activeCampaign.color,
    },
    {
      icon: '🤖', title: 'Robot Studio', sub: 'Design a robot and test it on a course',
      go: () => onNavigate('studio'), color: '#ec4899',
    },
  ];

  return (
    <main className="spark-home">
      <section className="spark-hero">
        <div className="spark-hero-copy">
          <div className="spark-kicker"><EmojiIcon e="✨" style={{ marginRight: '0.35em' }} />YOUR CODING SPACE <span className="spark-kicker-line" /></div>
          <h1>Hi, {firstName}!<br /><span>What shall we make today?</span></h1>
          <p>Choose a mission, make something cool, or carry on where you left off.</p>
          <div className="spark-hero-actions">
            <button className="spark-primary-btn" onClick={isFirstVisit ? () => document.querySelector('.spark-first-visit')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) : nextStep.go}><span><EmojiIcon e="▶" /></span> {isFirstVisit ? 'Choose an adventure' : nextStep.label}</button>
            <button className="spark-ghost-btn" onClick={() => onNavigate('portfolio')}><span>▤</span> My projects</button>
          </div>
          <div className="spark-hero-meta">
            <span className="spark-chip">Level {user?.level || 1}</span>
            <span className="spark-chip">{xp.toLocaleString()} XP</span>
            {cls && <span className="spark-chip">Class · {cls.name}</span>}
          </div>
          <div className="spark-welcome-robot" aria-hidden="true">
            <img src="/images/bytebuddies-robot-mascot.webp" alt="" />
          </div>
        </div>
        <div className="spark-hero-scene">
          <div className="spark-focus-copy">
            <div className="spark-focus-label"><EmojiIcon e="🚀" style={{ marginRight: '0.35em' }} />YOUR NEXT MISSION</div>
            <h2>{classWork[0]?.a.title || (lessonsDone ? 'Continue your learning' : 'Start with a guided lesson')}</h2>
            <p>{classWork[0] ? `${(KIND_META[classWork[0].a.kind] || KIND_META.task).label} · ${dueLabel(classWork[0].a.dueDate)}` : lessonsDone ? `${lessonsDone} lesson${lessonsDone === 1 ? '' : 's'} completed so far` : 'Learn the basics, then apply them in your own projects.'}</p>
          </div>
          <div className="spark-focus-progress"><span style={{ width: `${levelPct}%` }} /></div>
          <div className="spark-focus-foot"><span>Level {user?.level || 1}</span><span>{Math.max(0, xpToNext - xp).toLocaleString()} XP until your next level-up</span></div>
        </div>
      </section>

      {isFirstVisit && !showExplore && (
        <section className="spark-first-visit" aria-labelledby="first-session-title">
          <div className="spark-first-visit-heading">
            <span className="spark-first-visit-emoji" aria-hidden="true"><EmojiIcon e="🧭" /></span>
            <div>
              <span className="spark-eyebrow">YOUR FIRST ADVENTURE</span>
              <h2 id="first-session-title">What sounds fun?</h2>
              <p>Pick something to try. You can always explore the other activities later!</p>
            </div>
          </div>
          <div className="spark-adventure-grid">
            <button className="spark-adventure-card adventure-learn" onClick={() => onNavigate('learn/y3/w01')}>
              <span aria-hidden="true"><EmojiIcon e="📚" /></span><strong>Learn to code</strong><small>Try your first guided lesson</small><b aria-hidden="true">→</b>
            </button>
            <button className="spark-adventure-card adventure-game" onClick={() => onNavigate('gamebuilder')}>
              <span aria-hidden="true"><EmojiIcon e="🎮" /></span><strong>Make a game</strong><small>Build something you can play</small><b aria-hidden="true">→</b>
            </button>
            <button className="spark-adventure-card adventure-robot" onClick={() => onNavigate('studio')}>
              <span aria-hidden="true"><EmojiIcon e="🤖" /></span><strong>Meet the robots</strong><small>Design and test your ideas</small><b aria-hidden="true">→</b>
            </button>
          </div>
          <button className="spark-text-btn spark-all-activities" onClick={() => setShowExplore(true)}>See all activities →</button>
        </section>
      )}

      {(!isFirstVisit || showExplore) && <>
      {/* ─── Progress at a glance ─── */}
      <section className="spark-stats" aria-label="Your progress">
        <div className="spark-stat">
          <div className="spark-stat-top"><span className="spark-stat-label">Level</span><span className="spark-stat-icon"><EmojiIcon e="🏅" /></span></div>
          <b>{user?.level || 1}</b>
          <div className="spark-meter"><i style={{ width: `${levelPct}%` }} /></div>
          <small>{Math.max(0, xpToNext - xp).toLocaleString()} XP to next level</small>
        </div>
        <div className="spark-stat">
          <div className="spark-stat-top"><span className="spark-stat-label">This week</span><span className="spark-stat-icon"><EmojiIcon e="📈" /></span></div>
          <b>{weekTotal.toLocaleString()} <em>XP</em></b>
          <div className="spark-week" aria-label={`XP each day this week: ${weeklyXP.join(', ')}`}>
            {weeklyXP.map((v, i) => (
              <div key={i} className={`spark-week-day${i === today ? ' is-today' : ''}`} title={`${v} XP`}>
                <span style={{ height: `${Math.max(8, (v / weekMax) * 100)}%` }} className={v ? 'has-xp' : ''} />
                <small>{DAY_LABELS[i]}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="spark-stat">
          <div className="spark-stat-top"><span className="spark-stat-label">Lessons</span><span className="spark-stat-icon"><EmojiIcon e="📚" /></span></div>
          <b>{lessonsDone} <em>/ {TOTAL_LESSONS}</em></b>
          <div className="spark-meter spark-meter--violet"><i style={{ width: `${(lessonsDone / TOTAL_LESSONS) * 100}%` }} /></div>
          <small>{lessonsDone ? 'Continue at your own pace' : 'A short introduction to coding'}</small>
        </div>
        <div className="spark-stat">
          <div className="spark-stat-top"><span className="spark-stat-label">Missions</span><span className="spark-stat-icon"><EmojiIcon e="🚀" /></span></div>
          <b>{missionsDone} <em>/ {missionsTotal}</em></b>
          <div className="spark-meter spark-meter--pink"><i style={{ width: `${(missionsDone / missionsTotal) * 100}%` }} /></div>
          <small>{missionsDone ? `${missionsTotal - missionsDone} remaining` : 'Explore the available missions'}</small>
        </div>
      </section>

      {/* ─── Up next + daily spark ─── */}
      <section className="spark-content-grid">
        <div className="spark-panel">
          <div className="spark-panel-head">
            <div>
              <span className="spark-eyebrow">{classWork.length ? 'FROM YOUR TEACHER' : 'UP NEXT'}</span>
              <h3>{classWork.length ? `${classWork.length} assignment${classWork.length === 1 ? '' : 's'} to try` : 'Pick your next adventure'}</h3>
            </div>
            {classWork.length > 0 && <button className="spark-text-btn" onClick={() => onNavigate('classroom')}>My class <span>→</span></button>}
          </div>
          <div className="spark-list">
            {classWork.length > 0
              ? classWork.slice(0, 4).map(({ a, st }) => {
                const meta = KIND_META[a.kind] || KIND_META.task;
                return (
                  <button key={a.id} className="spark-list-row" onClick={() => { window.location.hash = classroomHash(a, cls); }}>
                    <span className="spark-list-icon" style={{ '--row-color': meta.color }}>{a.emoji || meta.emoji}</span>
                    <span className="spark-list-copy"><strong>{a.title}</strong><small>{meta.label} · {dueLabel(a.dueDate)}</small></span>
                    {st === 'late' && <span className="spark-pill spark-pill--late">{STATUS.late.label}</span>}
                    <span className="spark-row-arrow">→</span>
                  </button>
                );
              })
              : suggestions.map((s) => (
                <button key={s.title} className="spark-list-row" onClick={s.go}>
                  <span className="spark-list-icon" style={{ '--row-color': s.color }}><EmojiIcon e={s.icon} /></span>
                  <span className="spark-list-copy"><strong>{s.title}</strong><small>{s.sub}</small></span>
                  <span className="spark-row-arrow">→</span>
                </button>
              ))}
          </div>
        </div>
        <div className="spark-panel spark-challenge-panel">
          <div className="spark-panel-head">
            <div><span className="spark-eyebrow"><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />TRY A MINI CHALLENGE</span><h3>A coding idea</h3></div>
          </div>
          <div className="spark-challenge-art"><EmojiIcon e={spark.icon} /></div>
          <h4>{spark.title}</h4>
          <p>{spark.desc}</p>
          <div className="spark-challenge-foot">
            <span>Optional practice</span>
            <button onClick={() => onNavigate(spark.page)}>Try it →</button>
          </div>
        </div>
      </section>

      {/* ─── Build modes ─── */}
      <div className="spark-section-heading">
        <div><span className="spark-eyebrow">TOOLS</span><h2>Learn and create</h2></div>
        <button className="spark-text-btn" onClick={() => setShowAllModes(!showAllModes)}>{showAllModes ? 'Show less' : 'View all modes'} <span>→</span></button>
      </div>
      <section className="spark-mode-grid">
        {(showAllModes ? [...modes, ...extraModes] : modes).map((mode) => (
          <button key={mode.name} className={`spark-mode-card ${mode.color} ${activeMode === mode.name ? 'is-selected' : ''}`} onClick={() => chooseMode(mode)}>
            <div className="spark-mode-top"><span className="spark-mode-icon"><EmojiIcon e={mode.icon} /></span><span className="spark-arrow">↗</span></div>
            <strong>{mode.name}</strong><span className="spark-mode-blurb">{mode.blurb}</span>
            <div className="spark-tags">{mode.tags.map((tag) => <em key={tag}>{tag}</em>)}</div>
          </button>
        ))}
      </section>

      {/* ─── Projects + missions ─── */}
      <section className="spark-content-grid spark-content-grid--even">
        <div className="spark-panel">
          <div className="spark-panel-head">
            <div><span className="spark-eyebrow">PROJECTS</span><h3>{recentProjects.some((project) => project.isExample) ? 'Examples to explore' : 'Continue building'}</h3></div>
            <button className="spark-text-btn" onClick={() => onNavigate('portfolio')}>All projects <span>→</span></button>
          </div>
          {recentProjects.length ? (
            <div className="spark-list">
              {recentProjects.map((project, i) => (
                <button className="spark-list-row" key={project.id || i} onClick={() => { setActiveProject?.(project); onNavigate('workspace'); }}>
                  <span className={`project-thumb thumb-${i % 3}`}><IconText>{project.type === 'game' ? '🎮' : project.type === 'website' ? '🌐' : ['🌌', '🏝️', '🤖'][i % 3]}</IconText></span>
                  <span className="spark-list-copy">
                    <strong>{project.isExample ? `Example · ${project.name || `Untitled World ${i + 1}`}` : project.name || `Untitled World ${i + 1}`}</strong>
                    <small>{project.isExample ? `Open to explore and remix · ${project.language || project.type || 'Blocks'}` : `${project.modified ? `Edited ${project.modified}` : 'Edited recently'} · ${project.language || project.type || 'Blocks'}`}</small>
                  </span>
                  <span className="spark-row-arrow">→</span>
                </button>
              ))}
            </div>
          ) : (
            <button className="spark-empty-project" onClick={() => chooseMode(modes[0])}>
              <span>＋</span><strong>Create your first project</strong><small>Start with a blank canvas or a template →</small>
            </button>
          )}
        </div>
        <div className="spark-panel">
          <div className="spark-panel-head">
            <div><span className="spark-eyebrow">MISSION CONTROL</span><h3>Your campaigns</h3></div>
            <button className="spark-text-btn" onClick={() => onNavigate('missions')}>Open missions <span>→</span></button>
          </div>
          <div className="spark-campaigns">
            {CAMPAIGNS.map((c) => {
              const done = missionProgress[c.id]?.completed?.length || 0;
              return (
                <button key={c.id} className="spark-campaign" onClick={() => onNavigate('missions')} style={{ '--camp': c.color }}>
                  <span className="spark-campaign-emoji">{c.emoji}</span>
                  <span className="spark-campaign-copy">
                    <strong>{c.title}</strong>
                    <span className="spark-campaign-steps">
                      {Array.from({ length: c.missions }, (_, i) => <i key={i} className={i < done ? 'is-done' : ''} />)}
                    </span>
                  </span>
                  <small>{done === c.missions ? '✓ Done' : `${done}/${c.missions}`}</small>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {toast && <div className="spark-toast" role="status"><EmojiIcon e="✦" style={{ marginRight: '0.35em' }} />{toast}</div>}
      </>}
    </main>
  );
}
