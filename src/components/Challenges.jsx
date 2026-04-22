import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';

const CHALLENGES = [
  {
    id: 'c1', title: 'Fibonacci Sequence',
    description: 'Write a function that returns the Nth Fibonacci number. Can you do it in under 5 lines?',
    difficulty: 'Medium', xp: 150, type: 'code',
    timeLimit: 20, icon: '🔢', starter: 'function fibonacci(n) {\n  // your code here\n}',
    hint: 'Think about the relationship: fib(n) = fib(n-1) + fib(n-2)',
    testCases: ['fib(1) → 1', 'fib(5) → 5', 'fib(10) → 55'],
  },
  {
    id: 'c2', title: 'CSS Neon Card',
    description: 'Create a glowing neon card using only CSS. Make it look amazing!',
    difficulty: 'Easy', xp: 100, type: 'design',
    timeLimit: 15, icon: '🎨', starter: '.neon-card {\n  /* your styles here */\n}',
    hint: 'Use box-shadow with a bright color and text-shadow too!',
    testCases: ['Has glow effect', 'Uses border-radius', 'Has hover effect'],
  },
  {
    id: 'c3', title: 'Merge Sort',
    description: 'Implement the merge sort algorithm and sort a list of numbers in ascending order.',
    difficulty: 'Hard', xp: 250, type: 'code',
    timeLimit: 30, icon: '⚙️', starter: 'function mergeSort(arr) {\n  // your code here\n}',
    hint: 'Divide the array in half, sort each half, then merge them back together.',
    testCases: ['[3,1,2] → [1,2,3]', '[9,4,7,2] → [2,4,7,9]', '[] → []'],
  },
  {
    id: 'c4', title: 'Palindrome Checker',
    description: 'Write a function that checks if a word reads the same forwards and backwards.',
    difficulty: 'Easy', xp: 80, type: 'code',
    timeLimit: 10, icon: '🔄', starter: 'function isPalindrome(word) {\n  // your code here\n}',
    hint: 'Compare the string to its reverse!',
    testCases: ['"racecar" → true', '"hello" → false', '"level" → true'],
  },
  {
    id: 'c5', title: 'Space Shooter Game',
    description: 'Build a mini space shooter in Scratch-style blocks. Move a ship and shoot at asteroids!',
    difficulty: 'Medium', xp: 200, type: 'game',
    timeLimit: 45, icon: '🚀', starter: '// Use the Game Builder to create your space shooter',
    hint: 'Start with player movement, then add shooting, then enemies!',
    testCases: ['Ship moves', 'Can shoot', 'Asteroids appear'],
  },
  {
    id: 'c6', title: 'Weather App UI',
    description: 'Design a beautiful weather app interface using HTML & CSS. Show temperature, icons and forecast cards.',
    difficulty: 'Medium', xp: 175, type: 'design',
    timeLimit: 25, icon: '🌦️', starter: '<div class="weather-app">\n  <!-- your HTML here -->\n</div>',
    hint: 'Use flexbox for the forecast row and gradients for the background!',
    testCases: ['Shows temperature', 'Has weather icon', 'Forecast row'],
  },
];

const WEEKLY_LEADERBOARD = [];

const DIFF_COLOR = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };
const DIFF_BG = { Easy: '#22c55e18', Medium: '#f59e0b18', Hard: '#ef444418' };
const TYPE_COLOR = { code: '#6366f1', design: '#ec4899', game: '#f97316' };
const TYPE_LABEL = { code: '💻 Code', design: '🎨 Design', game: '🎮 Game' };

function CountdownTimer({ minutes, onExpire }) {
  const [seconds, setSeconds] = useState(minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) { onExpire?.(); return; }
    const id = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, seconds]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const pct = seconds / (minutes * 60);
  const color = pct > 0.5 ? '#22c55e' : pct > 0.2 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
        <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 32}`}
          strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct)}`}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
      </svg>
      <div style={{ marginTop: -52, marginBottom: 32, fontSize: 18, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn btn-primary btn-sm" onClick={() => setRunning(r => !r)}>
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setSeconds(minutes * 60); setRunning(false); }}>↺ Reset</button>
      </div>
    </div>
  );
}

export default function Challenges({ onNavigate }) {
  const { user } = useUser();
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set(['c2']));
  const [filterDiff, setFilterDiff] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showHint, setShowHint] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const totalXP = useMemo(() => CHALLENGES.filter(c => completedIds.has(c.id)).reduce((s, c) => s + c.xp, 0), [completedIds]);

  const filtered = CHALLENGES
    .filter(c => filterDiff === 'all' || c.difficulty === filterDiff)
    .filter(c => filterType === 'all' || c.type === filterType);

  if (activeChallenge) {
    const c = activeChallenge;
    const done = completedIds.has(c.id);
    return (
      <div className="page">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => { setActiveChallenge(null); setShowHint(false); setTimedOut(false); }}>
          ← Back to Challenges
        </button>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Main challenge pane */}
          <div style={{ flex: 1 }}>
            <div className="card">
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--gradient-primary)', borderRadius: '12px 12px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 36 }}>{c.icon}</span>
                  <div>
                    <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{c.title}</h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ background: DIFF_BG[c.difficulty], color: DIFF_COLOR[c.difficulty], fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{c.difficulty}</span>
                      <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>⚡ {c.xp} XP</span>
                      <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{TYPE_LABEL[c.type]}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.7 }}>{c.description}</p>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: 16, marginBottom: 20, fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {c.starter}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>✅ Test Cases</h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {c.testCases.map((tc, i) => (
                      <span key={i} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{tc}</span>
                    ))}
                  </div>
                </div>
                {showHint && (
                  <div style={{ background: '#f59e0b18', border: '1px solid #f59e0b40', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: 13 }}>💡 Hint: </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.hint}</span>
                  </div>
                )}
                {timedOut && (
                  <div style={{ background: '#ef444418', border: '1px solid #ef444440', borderRadius: 10, padding: 14, marginBottom: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>⏱️</div>
                    <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 14 }}>Time's up! Keep practising — you've got this!</div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  {!done ? (
                    <>
                      <button className="btn btn-success" onClick={() => { setCompletedIds(prev => new Set([...prev, c.id])); }}>
                        ✅ Submit & Complete
                      </button>
                      {!showHint && <button className="btn btn-ghost" onClick={() => setShowHint(true)}>💡 Hint (-25 XP)</button>}
                      <button className="btn btn-primary" onClick={() => onNavigate('workspace')}>🖥️ Open in Workspace</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#22c55e18', border: '1px solid #22c55e40', borderRadius: 10, padding: '12px 16px', width: '100%' }}>
                      <span style={{ fontSize: 28 }}>🏆</span>
                      <div>
                        <div style={{ fontWeight: 800, color: '#22c55e', fontSize: 15 }}>Challenge Completed!</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>You earned {c.xp} XP for this challenge.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header"><h4 style={{ fontSize: 14, fontWeight: 700 }}>⏱️ Timer</h4></div>
              <div style={{ padding: 16 }}>
                <CountdownTimer minutes={c.timeLimit} onExpire={() => setTimedOut(true)} />
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Recommended: {c.timeLimit} min</div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h4 style={{ fontSize: 14, fontWeight: 700 }}>📊 Your Progress</h4></div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Weekly XP earned</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-primary)' }}>{totalXP} XP</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>from {completedIds.size} challenges</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>⚡ Challenges</h1>
        <p>Test your skills with coding challenges. Earn XP, climb the leaderboard, and unlock achievements!</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-4" style={{ gap: 16, marginBottom: 24 }}>
        {[
          { icon: '✅', label: 'Completed', value: completedIds.size, sub: `of ${CHALLENGES.length} total` },
          { icon: '⚡', label: 'XP Earned', value: `${totalXP}`, sub: 'this week' },
          { icon: '🏆', label: 'Your Rank', value: `#7`, sub: 'weekly board' },
          { icon: '🔥', label: 'Streak', value: `${user.streak} days`, sub: 'keep it up!' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-primary)' }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Challenge list */}
        <div style={{ flex: 1 }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'Easy', 'Medium', 'Hard'].map(d => (
                <button key={d} className={`btn btn-sm ${filterDiff === d ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterDiff(d)}>
                  {d === 'all' ? '🗂️ All' : d === 'Easy' ? '🟢 Easy' : d === 'Medium' ? '🟡 Med' : '🔴 Hard'}
                </button>
              ))}
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'code', 'design', 'game'].map(t => (
                <button key={t} className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterType(t)}>
                  {t === 'all' ? '✨ All' : TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(c => {
              const done = completedIds.has(c.id);
              return (
                <div key={c.id} className="card" style={{ cursor: 'pointer', opacity: done ? 0.8 : 1, transition: 'all 0.18s', border: done ? '1px solid #22c55e40' : '1px solid var(--border-color)' }}
                  onClick={() => setActiveChallenge(c)}
                  onMouseEnter={e => { if (!done) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 36, flexShrink: 0 }}>{done ? '✅' : c.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</h3>
                        <span style={{ background: DIFF_BG[c.difficulty], color: DIFF_COLOR[c.difficulty], fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{c.difficulty}</span>
                        <span style={{ background: `${TYPE_COLOR[c.type]}18`, color: TYPE_COLOR[c.type], fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{TYPE_LABEL[c.type]}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{c.description}</p>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>⏱️ {c.timeLimit} min</span>
                        <span>⚡ {c.xp} XP</span>
                        <span>✅ {c.testCases.length} tests</span>
                      </div>
                    </div>
                    <button className={`btn ${done ? 'btn-success' : 'btn-primary'} btn-sm`} style={{ flexShrink: 0 }}>
                      {done ? '✅ Done' : '▶ Start'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>🏆 Weekly Leaderboard</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Resets Sunday</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {WEEKLY_LEADERBOARD.map((entry) => (
                <div key={entry.rank} className="leaderboard-row" style={{ background: entry.isUser ? 'var(--accent-primary)18' : 'transparent', borderLeft: entry.isUser ? '3px solid var(--accent-primary)' : '3px solid transparent' }}>
                  <span className="leaderboard-rank" style={{ color: entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#94a3b8' : entry.rank === 3 ? '#f97316' : 'var(--text-muted)' }}>
                    {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                  </span>
                  <div className="avatar avatar-sm" style={{ background: entry.isUser ? 'var(--gradient-primary)' : 'var(--bg-tertiary)', fontSize: 10, color: entry.isUser ? 'white' : 'var(--text-primary)' }}>
                    {entry.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: entry.isUser ? 800 : 600, color: entry.isUser ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{entry.name}{entry.isUser ? ' (you)' : ''}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>🔥 {entry.streak}d streak</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-secondary)' }}>{entry.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tip of the day */}
          <div className="card" style={{ marginTop: 16, border: '1px solid #f59e0b40', background: '#f59e0b08' }}>
            <div className="card-body">
              <div style={{ fontSize: 22, marginBottom: 8 }}>💡</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Tip of the Day</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Break problems into tiny steps before coding. Write out what your function should <em>do</em>, then figure out <em>how</em>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
