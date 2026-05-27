/**
 * ChallengesPage.jsx
 * Grid of available challenges + leaderboard.
 */
import React, { useState } from 'react';

const CHALLENGES = [
  {
    id: 'obstacle',
    name: 'Obstacle Course',
    icon: '🏁',
    desc: 'Navigate around obstacles and reach the finish line without crashing!',
    difficulty: 'Easy',
    xp: 100,
    locked: false,
    completions: 1842,
    bestTime: '00:18',
    stars: 3,
  },
  {
    id: 'speedrun',
    name: 'Speed Run',
    icon: '⚡',
    desc: 'Race against the clock! Finish the track in the shortest time possible.',
    difficulty: 'Medium',
    xp: 200,
    locked: false,
    completions: 926,
    bestTime: '00:12',
    stars: 2,
  },
  {
    id: 'maze',
    name: 'Maze Navigator',
    icon: '🌀',
    desc: 'Find your way through a complex maze using your sensors.',
    difficulty: 'Hard',
    xp: 350,
    locked: false,
    completions: 412,
    bestTime: '01:05',
    stars: 1,
  },
  {
    id: 'battle',
    name: 'Battle Arena',
    icon: '⚔️',
    desc: 'Go head-to-head against other robots in the arena. Last one standing wins!',
    difficulty: 'Expert',
    xp: 500,
    locked: true,
    completions: 0,
    bestTime: '--:--',
    stars: 0,
  },
  {
    id: 'rescue',
    name: 'Rescue Mission',
    icon: '🚑',
    desc: 'Use your arm to rescue objects trapped in dangerous zones.',
    difficulty: 'Medium',
    xp: 275,
    locked: false,
    completions: 634,
    bestTime: '00:44',
    stars: 2,
  },
  {
    id: 'summit',
    name: 'Mountain Summit',
    icon: '⛰️',
    desc: 'Climb steep terrain and reach the summit before your battery runs out.',
    difficulty: 'Hard',
    xp: 400,
    locked: true,
    completions: 0,
    bestTime: '--:--',
    stars: 0,
  },
  {
    id: 'swarm',
    name: 'Swarm Control',
    icon: '🐝',
    desc: 'Coordinate with 3 other robots to complete a mission as a team.',
    difficulty: 'Expert',
    xp: 600,
    locked: true,
    completions: 0,
    bestTime: '--:--',
    stars: 0,
  },
  {
    id: 'stealth',
    name: 'Stealth Ops',
    icon: '👁️',
    desc: 'Move through the enemy base without triggering any sensors.',
    difficulty: 'Expert',
    xp: 550,
    locked: true,
    completions: 0,
    bestTime: '--:--',
    stars: 0,
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'RoboKing99',   robot: '🚙', score: 4280, badge: '👑' },
  { rank: 2, name: 'SpeedDemon',   robot: '⚡', score: 3950, badge: '🥈' },
  { rank: 3, name: 'Alex',         robot: '🤖', score: 3640, badge: '🥉', isMe: true },
  { rank: 4, name: 'TechWizard',   robot: '🌿', score: 3210, badge: '' },
  { rank: 5, name: 'RocketBot',    robot: '🛡️', score: 2980, badge: '' },
];

export default function ChallengesPage({ onStartChallenge }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const diffOrder = { Easy: 1, Medium: 2, Hard: 3, Expert: 4 };
  const filters = ['all', 'Easy', 'Medium', 'Hard', 'Expert'];

  const filtered = activeFilter === 'all'
    ? CHALLENGES
    : CHALLENGES.filter(c => c.difficulty === activeFilter);

  return (
    <div className="bb-studio-challenges">
      {/* Header */}
      <div className="bb-studio-challenges-head">
        <span className="bb-studio-challenges-title">🏆 Challenges</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none',
                background: activeFilter === f ? '#7c3aed' : '#fff',
                color: activeFilter === f ? '#fff' : '#666',
                fontWeight: 700, fontSize: 11, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                transition: 'all 0.15s',
                textTransform: activeFilter === f || f === 'all' ? 'none' : 'capitalize',
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Challenge tiles */}
        <div className="bb-studio-challenges-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))' }}>
          {filtered.map(ch => (
            <div
              key={ch.id}
              className={`bb-studio-ch-tile${ch.locked ? ' locked' : ''}${selected === ch.id ? ' active' : ''}`}
              onClick={() => !ch.locked && setSelected(selected === ch.id ? null : ch.id)}
            >
              {ch.locked && <div className="bb-studio-ch-lock">🔒</div>}
              <div className="bb-studio-ch-icon">{ch.icon}</div>
              <div className="bb-studio-ch-name">{ch.name}</div>
              <div className="bb-studio-ch-desc">{ch.desc}</div>

              {/* Star rating */}
              <div style={{ marginBottom: 10, color: '#ffd700', fontSize: 16 }}>
                {'★'.repeat(ch.stars)}{'☆'.repeat(3 - ch.stars)}
                <span style={{ fontSize: 11, color: '#aaa', marginLeft: 6, fontWeight: 600 }}>
                  {ch.completions > 0 ? `${ch.completions.toLocaleString()} completions` : 'Not yet attempted'}
                </span>
              </div>

              {ch.bestTime !== '--:--' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, color: '#555' }}>
                  <span>⏱️ Best time: <strong>{ch.bestTime}</strong></span>
                </div>
              )}

              <div className="bb-studio-ch-footer">
                <span className={`bb-studio-diff bb-studio-diff--${ch.difficulty.toLowerCase()}`}>
                  {ch.difficulty}
                </span>
                <span className="bb-studio-xp-reward">⭐ {ch.xp} XP</span>
              </div>

              {selected === ch.id && !ch.locked && (
                <button
                  onClick={(e) => { e.stopPropagation(); onStartChallenge?.(ch); }}
                  style={{
                    marginTop: 12, width: '100%', padding: '11px',
                    borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#00c851,#00a843)',
                    color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,200,81,0.35)',
                    transition: 'transform 0.12s',
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ▶ Start Challenge
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Leaderboard sidebar */}
        <div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#222', marginBottom: 14 }}>
              🏆 Global Leaderboard
            </div>
            {LEADERBOARD.map(entry => (
              <div
                key={entry.rank}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                  borderBottom: '1px solid #f5f5f5',
                  background: entry.isMe ? 'rgba(124,58,237,0.06)' : 'transparent',
                  borderRadius: entry.isMe ? 8 : 0,
                  paddingLeft: entry.isMe ? 8 : 0,
                }}
              >
                <span style={{ fontSize: 16, minWidth: 24, textAlign: 'center' }}>
                  {entry.badge || `#${entry.rank}`}
                </span>
                <span style={{ fontSize: 22 }}>{entry.robot}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: entry.isMe ? 900 : 700, color: entry.isMe ? '#7c3aed' : '#222' }}>
                    {entry.name} {entry.isMe && '(You)'}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{entry.score.toLocaleString()} XP</div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily challenge */}
          <div style={{
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            borderRadius: 16, padding: 18, color: '#fff',
            boxShadow: '0 4px 18px rgba(124,58,237,0.4)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.75, marginBottom: 6 }}>
              Daily Challenge
            </div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
            <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>Speed Run</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 14, lineHeight: 1.4 }}>
              Complete today's speed run for bonus XP! Resets in 8h 24m.
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 0', marginBottom: 12 }}>
              <div style={{ height: '100%', width: '62%', background: 'rgba(255,255,255,0.4)', borderRadius: 8, height: 8 }} />
            </div>
            <button style={{
              width: '100%', padding: 11, borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.22)', color: '#fff',
              fontWeight: 800, fontSize: 13, cursor: 'pointer',
              backdropFilter: 'blur(6px)',
            }}>
              ⭐ +400 Bonus XP →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
