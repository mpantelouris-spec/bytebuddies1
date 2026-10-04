import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useProject } from '../contexts/ProjectContext';
import {
  fetchClass, fetchAssignments, readMyProgress, findSub, pupilId, statusFor, STATUS, dueLabel,
} from '../utils/classroomStore.js';
import { KIND_META, classroomHash } from './classroom/assignables.js';
import './SparkStudioDashboard.css';

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

const CAMPAIGNS = [
  { id: 'space', title: 'Space Explorer', emoji: '🚀', color: '#6366f1', missions: 5 },
  { id: 'ocean', title: 'Ocean Deep', emoji: '🌊', color: '#0ea5e9', missions: 5 },
  { id: 'city', title: 'City Builder', emoji: '🏙️', color: '#f59e0b', missions: 5 },
  { id: 'cyber', title: 'Cyber Quest', emoji: '⚡', color: '#10b981', missions: 5 },
];

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
  const { projects = [] } = useProject();
  const [activeMode, setActiveMode] = useState(null);
  const [showAllModes, setShowAllModes] = useState(false);
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
      : { label: 'Start your first lesson', go: () => onNavigate('learn') };

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
      <div className="spark-orb spark-orb-one" />
      <div className="spark-orb spark-orb-two" />

      <section className="spark-hero">
        <div className="spark-hero-copy">
          <div className="spark-kicker"><span className="spark-live-dot" /> CREATOR HEADQUARTERS <span className="spark-kicker-line" /></div>
          <h1>Hey {firstName}!<br /><span>What will you build?</span></h1>
          <p>Pick a world, bring an idea, and make it playable in under a minute.</p>
          <div className="spark-hero-actions">
            <button className="spark-primary-btn" onClick={nextStep.go}><span>▶</span> {nextStep.label}</button>
            <button className="spark-ghost-btn" onClick={() => chooseMode(modes[0])}><span>⚡</span> Start building</button>
          </div>
          <div className="spark-hero-meta">
            <span className="spark-chip">🔥 {user?.streak || 0} day streak</span>
            <span className="spark-chip">✦ {xp.toLocaleString()} XP</span>
            {cls && <span className="spark-chip">🏫 {cls.name}</span>}
          </div>
        </div>
        <div className="spark-hero-scene" aria-hidden="true">
          <div className="spark-stars">✦　·　✧　　·　✦　　　·　✧</div>
          <div className="spark-moon" /><div className="spark-planet planet-back" /><div className="spark-planet planet-front" />
          <div className="spark-platform"><span className="platform-grid" /></div>
          <div className="spark-robot"><div className="robot-antenna" /><div className="robot-head"><i /><i /></div><div className="robot-body"><b>✦</b></div><div className="robot-leg left" /><div className="robot-leg right" /></div>
          <div className="spark-float-card card-build"><strong>Level {user?.level || 1}</strong><small>{levelPct}% to level {(user?.level || 1) + 1}</small></div>
          <div className="spark-float-card card-weather"><span>{user?.avatarEmoji || '🧑‍💻'}</span><small>{firstName}</small></div>
        </div>
      </section>

      {/* ─── Progress at a glance ─── */}
      <section className="spark-stats" aria-label="Your progress">
        <div className="spark-stat">
          <div className="spark-stat-top"><span className="spark-stat-label">Level</span><span className="spark-stat-icon">🏅</span></div>
          <b>{user?.level || 1}</b>
          <div className="spark-meter"><i style={{ width: `${levelPct}%` }} /></div>
          <small>{Math.max(0, xpToNext - xp).toLocaleString()} XP to next level</small>
        </div>
        <div className="spark-stat">
          <div className="spark-stat-top"><span className="spark-stat-label">This week</span><span className="spark-stat-icon">📈</span></div>
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
          <div className="spark-stat-top"><span className="spark-stat-label">Lessons</span><span className="spark-stat-icon">📚</span></div>
          <b>{lessonsDone} <em>/ {TOTAL_LESSONS}</em></b>
          <div className="spark-meter spark-meter--violet"><i style={{ width: `${(lessonsDone / TOTAL_LESSONS) * 100}%` }} /></div>
          <small>{lessonsDone ? 'Keep the run going!' : 'Your first lesson takes 10 minutes'}</small>
        </div>
        <div className="spark-stat">
          <div className="spark-stat-top"><span className="spark-stat-label">Missions</span><span className="spark-stat-icon">🚀</span></div>
          <b>{missionsDone} <em>/ {missionsTotal}</em></b>
          <div className="spark-meter spark-meter--pink"><i style={{ width: `${(missionsDone / missionsTotal) * 100}%` }} /></div>
          <small>{missionsDone ? `${missionsTotal - missionsDone} left to save the worlds` : 'Four worlds need your code'}</small>
        </div>
      </section>

      {/* ─── Up next + daily spark ─── */}
      <section className="spark-content-grid">
        <div className="spark-panel">
          <div className="spark-panel-head">
            <div>
              <span className="spark-eyebrow">{classWork.length ? 'FROM YOUR TEACHER' : 'UP NEXT'}</span>
              <h3>{classWork.length ? `${classWork.length} thing${classWork.length === 1 ? '' : 's'} to do` : 'Pick up where you left off'}</h3>
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
                  <span className="spark-list-icon" style={{ '--row-color': s.color }}>{s.icon}</span>
                  <span className="spark-list-copy"><strong>{s.title}</strong><small>{s.sub}</small></span>
                  <span className="spark-row-arrow">→</span>
                </button>
              ))}
          </div>
        </div>
        <div className="spark-panel spark-challenge-panel">
          <div className="spark-panel-head">
            <div><span className="spark-eyebrow">TODAY’S SPARK</span><h3>One tiny challenge</h3></div>
            <span className="spark-reward">+50 XP</span>
          </div>
          <div className="spark-challenge-art">{spark.icon}</div>
          <h4>{spark.title}</h4>
          <p>{spark.desc}</p>
          <div className="spark-challenge-foot">
            <span>New spark every day</span>
            <button onClick={() => onNavigate(spark.page)}>Try it →</button>
          </div>
        </div>
      </section>

      {/* ─── Build modes ─── */}
      <div className="spark-section-heading">
        <div><span className="spark-eyebrow">CHOOSE YOUR ADVENTURE</span><h2>Build something brilliant</h2></div>
        <button className="spark-text-btn" onClick={() => setShowAllModes(!showAllModes)}>{showAllModes ? 'Show less' : 'View all modes'} <span>→</span></button>
      </div>
      <section className="spark-mode-grid">
        {(showAllModes ? [...modes, ...extraModes] : modes).map((mode) => (
          <button key={mode.name} className={`spark-mode-card ${mode.color} ${activeMode === mode.name ? 'is-selected' : ''}`} onClick={() => chooseMode(mode)}>
            <div className="spark-mode-top"><span className="spark-mode-icon">{mode.icon}</span><span className="spark-arrow">↗</span></div>
            <strong>{mode.name}</strong><span className="spark-mode-blurb">{mode.blurb}</span>
            <div className="spark-tags">{mode.tags.map((tag) => <em key={tag}>{tag}</em>)}</div>
          </button>
        ))}
      </section>

      {/* ─── Projects + missions ─── */}
      <section className="spark-content-grid spark-content-grid--even">
        <div className="spark-panel">
          <div className="spark-panel-head">
            <div><span className="spark-eyebrow">YOUR HANGAR</span><h3>Continue building</h3></div>
            <button className="spark-text-btn" onClick={() => onNavigate('portfolio')}>All projects <span>→</span></button>
          </div>
          {recentProjects.length ? (
            <div className="spark-list">
              {recentProjects.map((project, i) => (
                <button className="spark-list-row" key={project.id || i} onClick={() => onNavigate('gamebuilder')}>
                  <span className={`project-thumb thumb-${i % 3}`}>{project.type === 'game' ? '🎮' : project.type === 'website' ? '🌐' : ['🌌', '🏝️', '🤖'][i % 3]}</span>
                  <span className="spark-list-copy">
                    <strong>{project.name || `Untitled World ${i + 1}`}</strong>
                    <small>{project.modified ? `Edited ${project.modified}` : 'Edited recently'} · {project.language || project.type || 'Blocks'}</small>
                  </span>
                  <span className="spark-row-arrow">→</span>
                </button>
              ))}
            </div>
          ) : (
            <button className="spark-empty-project" onClick={() => chooseMode(modes[0])}>
              <span>✦</span><strong>Your first world is waiting</strong><small>Start with a blank canvas or a playful template →</small>
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

      {toast && <div className="spark-toast" role="status">✦ {toast}</div>}
    </main>
  );
}
