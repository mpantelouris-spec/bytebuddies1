import React, { useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { GAME_MODES } from '../data/gameModes';
import { PYTHON_CHALLENGES } from '../data/pythonChallenges';
import { readModeProgress } from './gamebuilder/GameModes';
import PythonChallenge, { readPyProgress } from './challenges/PythonChallenge';
import './challenges/challenges.css';
import { EmojiIcon, IconText } from './ui/Icon.jsx';

const LEVELS = { 1: 'Starter', 2: 'Explorer', 3: 'Expert' };

/** Every checked challenge on the platform, in one list. */
function allChallenges() {
  const games = GAME_MODES.flatMap((m) => m.challenges.map((c, i) => ({
    key: `gm:${m.id}:${c.id}`, kind: 'game', modeId: m.id, index: i, challengeId: c.id,
    title: c.title, group: m.title, emoji: m.emoji, color: m.color, concept: m.concept,
    level: i === 0 ? 1 : i >= m.challenges.length - 1 ? 3 : 2, task: c.goal,
  })));
  const python = PYTHON_CHALLENGES.map((c) => ({
    key: `py:${c.id}`, kind: 'python', challengeId: c.id, title: c.title, group: 'Python',
    emoji: c.emoji, color: '#3776ab', concept: c.concept, level: c.level, task: c.task, groupEmoji: '🐍',
  }));
  return [...games, ...python];
}

/** Monday-based week number, so the weekly challenge changes every Monday. */
function weekNumber(d = new Date()) {
  const monday = new Date(d); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Math.floor(monday.getTime() / (7 * 864e5));
}
const weekKey = () => `w${weekNumber()}`;

const WEEKLY_KEY = 'bb_weekly_challenges';
function readWeekly() { try { return JSON.parse(localStorage.getItem(WEEKLY_KEY) || '{}') || {}; } catch { return {}; } }

function Stars({ n = 0, size = 14 }) {
  return (
    <span className="ch-stars" style={{ fontSize: size }} aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((i) => <span key={i} className={i < n ? 'on' : ''}>★</span>)}
    </span>
  );
}

export default function Challenges({ onNavigate }) {
  const { user } = useUser();
  const [filter, setFilter] = useState('all');
  const [level, setLevel] = useState(0);
  const [openPy, setOpenPy] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const list = useMemo(allChallenges, []);
  const gm = useMemo(readModeProgress, [refresh]);
  const py = useMemo(readPyProgress, [refresh]);
  const weekly = useMemo(readWeekly, [refresh]);
  const starsOf = (c) => (c.kind === 'game' ? gm[c.modeId]?.[c.challengeId] || 0 : py[c.challengeId]?.stars || 0);

  // This week's featured challenge: rotates through the mid-level challenges every Monday
  const featuredPool = list.filter((c) => c.level === 2);
  const featured = featuredPool[weekNumber() % featuredPool.length];
  const weeklyDone = !!weekly[weekKey()] || starsOf(featured) > 0;

  const earned = list.reduce((n, c) => n + starsOf(c), 0);
  const solved = list.filter((c) => starsOf(c) > 0).length;
  const gamesSolved = list.filter((c) => c.kind === 'game' && starsOf(c) > 0).length;
  const pySolved = list.filter((c) => c.kind === 'python' && starsOf(c) > 0).length;
  const perfect = list.filter((c) => starsOf(c) === 3).length;

  const badges = [
    { id: 'first', icon: '🌟', name: 'First star', got: solved >= 1, need: 'Solve any challenge' },
    { id: 'designer', icon: '🎮', name: 'Game designer', got: gamesSolved >= 10, need: `Solve 10 game challenges (${Math.min(gamesSolved, 10)}/10)` },
    { id: 'python', icon: '🐍', name: 'Pythonista', got: pySolved >= 5, need: `Solve 5 Python challenges (${Math.min(pySolved, 5)}/5)` },
    { id: 'perfect', icon: '💎', name: 'Perfectionist', got: perfect >= 5, need: `Get 3 stars 5 times (${Math.min(perfect, 5)}/5)` },
    { id: 'weekly', icon: '📅', name: 'Weekly hero', got: Object.keys(weekly).length >= 1, need: 'Finish a weekly challenge' },
    { id: 'all', icon: '🏆', name: 'Challenge champion', got: solved === list.length, need: `Solve every challenge (${solved}/${list.length})` },
  ];

  const play = (c) => {
    if (c.kind === 'python') { setOpenPy(c.challengeId); return; }
    try { localStorage.setItem('bb_gb_open_mode', JSON.stringify({ id: c.modeId, challenge: c.index })); } catch { /* ignore */ }
    onNavigate('gamebuilder');
  };

  const onPySolved = (id) => {
    if (featured.kind === 'python' && featured.challengeId === id) {
      const w = readWeekly(); w[weekKey()] = featured.key;
      try { localStorage.setItem(WEEKLY_KEY, JSON.stringify(w)); } catch { /* ignore */ }
    }
    setRefresh((r) => r + 1);
  };

  if (openPy) {
    const c = PYTHON_CHALLENGES.find((x) => x.id === openPy);
    const idx = PYTHON_CHALLENGES.indexOf(c);
    return (
      <PythonChallenge
        challenge={c}
        onBack={() => { setOpenPy(null); setRefresh((r) => r + 1); }}
        onSolved={onPySolved}
        onNext={idx < PYTHON_CHALLENGES.length - 1 ? () => setOpenPy(PYTHON_CHALLENGES[idx + 1].id) : null}
      />
    );
  }

  const shown = list
    .filter((c) => filter === 'all' || c.kind === filter || (filter === 'todo' && starsOf(c) === 0))
    .filter((c) => !level || c.level === level);
  const groups = [...new Set(shown.map((c) => c.group))];

  return (
    <div className="page ch-page">
      <header className="ch-hero">
        <div>
          <h1><EmojiIcon e="⚡" style={{ marginRight: '0.35em' }} />Challenges</h1>
          <p>Every challenge checks your work and awards up to 3 stars. Build games, write Python, and collect badges.</p>
        </div>
        <div className="ch-stats">
          <div><b>{earned}</b><span>of {list.length * 3} stars</span></div>
          <div><b>{solved}</b><span>solved</span></div>
          <div><b>{user?.streak || 0}🔥</b><span>day streak</span></div>
        </div>
      </header>

      <section className="ch-weekly" style={{ '--c': featured.color }}>
        <div className="ch-weekly-tag"><EmojiIcon e="📅" style={{ marginRight: '0.35em' }} />This week's challenge</div>
        <div className="ch-weekly-main">
          <span className="ch-weekly-emoji"><IconText>{featured.emoji}</IconText></span>
          <div>
            <h2>{featured.title}</h2>
            <p>{featured.task}</p>
            <small>{featured.group} · {featured.concept} · new challenge every Monday</small>
          </div>
          <div className="ch-weekly-cta">
            {weeklyDone ? <span className="ch-done"><EmojiIcon e="✅" style={{ marginRight: '0.35em' }} />Solved</span> : null}
            <button type="button" className="btn btn-primary" onClick={() => play(featured)}>{weeklyDone ? 'Play again' : 'Take the challenge ▶'}</button>
          </div>
        </div>
      </section>

      <div className="ch-layout">
        <main>
          <div className="ch-filters">
            {[['all', '✨ All'], ['game', '🎮 Game Builder'], ['python', '🐍 Python'], ['todo', '🎯 Not solved yet']].map(([id, label]) => (
              <button key={id} type="button" className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{label}</button>
            ))}
            <span className="ch-sep" />
            {[0, 1, 2, 3].map((l) => (
              <button key={l} type="button" className={level === l ? 'on' : ''} onClick={() => setLevel(l)}>{l ? LEVELS[l] : 'Any level'}</button>
            ))}
          </div>

          {groups.length === 0 && <p className="ch-empty">Nothing here — every challenge in this view is solved! 🎉</p>}
          {groups.map((g) => (
            <section key={g} className="ch-group">
              <h3><IconText>{g === "Python" ? "🐍" : shown.find((c) => c.group === g).emoji}</IconText> {g}<small>{g === 'Python' ? 'Real code, checked automatically' : shown.find((c) => c.group === g).concept}</small></h3>
              <div className="ch-grid">
                {shown.filter((c) => c.group === g).map((c) => {
                  const s = starsOf(c);
                  return (
                    <button key={c.key} type="button" className={`ch-card${s ? ' solved' : ''}`} style={{ '--c': c.color }} onClick={() => play(c)}>
                      <div className="ch-card-top">
                        <span className={`ch-level l${c.level}`}>{LEVELS[c.level]}</span>
                        <Stars n={s} />
                      </div>
                      <div className="ch-card-title">{c.title}</div>
                      <div className="ch-card-task">{c.task}</div>
                      <div className="ch-card-go">{s ? 'Play again' : 'Start'} ▶</div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </main>

        <aside className="ch-side">
          <div className="ch-panel">
            <h4><EmojiIcon e="🏅" style={{ marginRight: '0.35em' }} />Badges</h4>
            <div className="ch-badges">
              {badges.map((b) => (
                <div key={b.id} className={`ch-badge${b.got ? ' got' : ''}`} title={b.need}>
                  <span><EmojiIcon e={b.icon} /></span>
                  <b>{b.name}</b>
                  <small>{b.got ? 'Earned!' : b.need}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="ch-panel ch-how">
            <h4>⭐ How stars work</h4>
            <p><b>★</b> Solve the challenge</p>
            <p><b>★★</b> Use the idea it teaches (like a loop)</p>
            <p><b>★★★</b> Solve it neatly — few blocks, or no hints</p>
            <p className="ch-tip">Stuck in the Game Builder? Press <b>Ask Byte</b> for clues.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
