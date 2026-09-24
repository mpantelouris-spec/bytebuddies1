import React, { useState, useCallback } from 'react';
import ActivityRenderer from './ActivityRenderer';

const LEVEL_META = [
  { label: 'Level 1', tier: 'Warm-up', emoji: '🌱', desc: 'Build confidence — 2–3 blocks needed' },
  { label: 'Level 2', tier: 'Challenge', emoji: '⚡', desc: 'Standard puzzle — think it through' },
  { label: 'Level 3', tier: 'Hard', emoji: '🔥', desc: 'Real challenge — may need debugging' },
  { label: 'Level 4', tier: 'Bonus', emoji: '⭐', desc: 'Optional — optimize or extend' },
];

/**
 * Code.org-style 4-level puzzle progression per lesson.
 * Students must complete each level before unlocking the next.
 */
export default function PuzzleProgression({ puzzles, color, onAllComplete }) {
  const levels = puzzles.slice(0, 4);
  const [completed, setCompleted] = useState(() => new Set());
  const [activeLevel, setActiveLevel] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  const allDone = levels.length > 0 && levels.every((_, i) => completed.has(i));
  const unlocked = useCallback((i) => i === 0 || completed.has(i - 1), [completed]);

  function handleLevelComplete(idx) {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1800);

    if (idx < levels.length - 1) {
      setTimeout(() => setActiveLevel(idx + 1), 600);
    } else {
      setTimeout(() => onAllComplete?.(), 800);
    }
  }

  if (!levels.length) {
    return (
      <div style={{ textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.5)' }}>
        No puzzles available for this lesson yet.
      </div>
    );
  }

  const meta = LEVEL_META[activeLevel] || LEVEL_META[0];
  const puzzle = levels[activeLevel];

  return (
    <div>
      {/* Level selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {levels.map((p, i) => {
          const done = completed.has(i);
          const open = unlocked(i);
          const current = i === activeLevel;
          return (
            <button
              key={i}
              type="button"
              disabled={!open && !done}
              onClick={() => open && setActiveLevel(i)}
              style={{
                flex: '1 1 100px', minWidth: 90, maxWidth: 140, padding: '10px 8px',
                borderRadius: 14, cursor: open || done ? 'pointer' : 'not-allowed',
                border: `2px solid ${current ? color : done ? '#10b981' : open ? `${color}55` : 'rgba(255,255,255,0.08)'}`,
                background: current ? `${color}22` : done ? 'rgba(16,185,129,0.12)' : open ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                opacity: open || done ? 1 : 0.45, transition: 'all 0.2s',
                boxShadow: current ? `0 0 16px ${color}44` : 'none',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 2 }}>{done ? '✅' : LEVEL_META[i]?.emoji || '🧩'}</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: current ? color : done ? '#6ee7b7' : '#e2e8f0' }}>
                {LEVEL_META[i]?.label || `Level ${i + 1}`}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {done ? 'Complete' : open ? LEVEL_META[i]?.tier : '🔒 Locked'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active level header */}
      <div style={{
        background: `linear-gradient(135deg, ${color}18, transparent)`,
        border: `1px solid ${color}44`, borderRadius: 16, padding: '14px 18px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 24 }}>{meta.emoji}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 1 }}>
              {meta.label} · {meta.tier}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>{puzzle.title}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{meta.desc}</div>
      </div>

      {/* Puzzle content */}
      <div key={`level-${activeLevel}`} style={{ animation: 'fade-up 0.35s ease' }}>
        <ActivityRenderer
          activity={puzzle}
          color={color}
          completed={completed.has(activeLevel)}
          onComplete={() => handleLevelComplete(activeLevel)}
        />
      </div>

      {/* Celebration banner */}
      {celebrate && (
        <div style={{
          marginTop: 16, padding: '14px 18px', borderRadius: 14, textAlign: 'center',
          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
          animation: 'bounce-in 0.5s ease', color: '#6ee7b7', fontWeight: 800,
        }}>
          🎉 {activeLevel < levels.length - 1 ? 'Great job! Next level unlocked!' : 'All puzzles complete!'}
        </div>
      )}

      {allDone && (
        <div style={{
          marginTop: 16, padding: '16px 20px', borderRadius: 16, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(16,185,129,0.1))',
          border: '1px solid rgba(251,191,36,0.35)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🏆</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#fbbf24' }}>Puzzle Master!</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
            You completed all {levels.length} puzzle levels. Continue to the quiz!
          </div>
        </div>
      )}
    </div>
  );
}
