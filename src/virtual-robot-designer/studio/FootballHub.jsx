/**
 * Football Hub — mode select for Robot Football Arena.
 */
import React from 'react';
import { FOOTBALL_COURSES } from '../data/football-courses.js';

export function FootballHub({ courses = FOOTBALL_COURSES, currentId, onSelect, onClose, robotName = 'FootballBot' }) {
  const ordered = [...courses].sort((a, b) => {
    const rank = (c) => (c.id === 'football_fifa' ? 0 : c.id === 'football_penalties' ? 1 : 2);
    return rank(a) - rank(b);
  });
  return (
    <div className="fight-hub-overlay football-hub-overlay" role="dialog" aria-label="Robot Football modes">
      <div className="fight-hub-panel football-hub-panel">
        <header className="fight-hub-header">
          <div>
            <span className="fight-hub-icon">⚽</span>
            <h2>Robot Football Arena</h2>
            <p>Code your {robotName} to chase, pass &amp; score!</p>
          </div>
          {onClose && (
            <button type="button" className="fight-hub-close" onClick={onClose} aria-label="Close">✕</button>
          )}
        </header>

        <div className="fight-hub-stats football-hub-tip">
          <span>🏟️ FIFA 3v3 teams</span>
          <span>⚽ Pass &amp; shoot</span>
          <span>🥅 Beat the blue team</span>
        </div>

        <div className="fight-hub-grid">
          {ordered.map((c) => {
            const teamCode = (c.teamSize ?? 0) >= 3;
            const isFifa = c.id === 'football_fifa';
            const isPenalty = c.id === 'football_penalties';
            return (
            <button
              key={c.id}
              type="button"
              className={`fight-hub-card football-hub-card${currentId === c.id ? ' active' : ''}${isFifa ? ' hero' : ''}`}
              onClick={() => onSelect?.(c)}
            >
              <span className="fight-hub-card-icon">{c.icon}</span>
              <strong>{c.name}</strong>
              <span className={`football-hub-badge${teamCode ? ' team' : ' solo'}`}>
                {isFifa ? 'FULL MATCH — code 3 players' : isPenalty ? 'SOLO — one kicker only' : teamCode ? 'Code your team' : 'Solo drill — not a full match'}
              </span>
              <span className="fight-hub-card-tag">{c.shortName || c.matchMode}</span>
              <span className="fight-hub-card-desc">{c.tagline || c.desc}</span>
              <span className="football-hub-xp">+{c.xpReward || 150} XP</span>
            </button>
            );
          })}
        </div>

        <footer className="fight-hub-footer">
          <span>Tip: FIFA 3v3 has six players. Penalty is one kicker vs a keeper. Training is just you and the ball.</span>
        </footer>
      </div>
    </div>
  );
}

export default FootballHub;
