/**
 * Post-fight / post-match results — victory/defeat card with rewards.
 */
import React from 'react';

export function FightingResults({
  variant = 'combat',
  won,
  course,
  stats = {},
  rewards = {},
  onRematch,
  onHub,
  onClose,
}) {
  const isFootball = variant === 'football';
  const title = won
    ? (isFootball ? 'FULL TIME — WIN!' : 'VICTORY!')
    : (isFootball ? 'FULL TIME — LOSS' : 'DEFEAT');
  const icon = won ? (isFootball ? '⚽' : '🏆') : (isFootball ? '😞' : '💔');
  const playerMax = stats.playerMax || 1000;
  const flawless = !isFootball && won && Math.round(stats.playerHp || 0) >= playerMax;

  return (
    <div className="fight-results-overlay fight-results-overlay--mk" role="dialog" aria-label={isFootball ? 'Match results' : 'Fight results'}>
      <div className={`fight-results-card fight-results-card--mk${won ? ' won' : ' lost'}`}>
        <div className="fight-results-icon">{icon}</div>
        <h2 className="fight-results-title">{title}</h2>
        {flawless && <p className="fight-results-flawless">FLAWLESS VICTORY</p>}
        <p className="fight-results-mode">{course?.name || (isFootball ? 'Football' : 'Combat')}</p>

        <div className="fight-results-stats">
          {isFootball ? (
            <>
              <div><span>Your goals</span><strong>{stats.playerGoals || 0}</strong></div>
              <div><span>Opponent goals</span><strong>{stats.enemyGoals || 0}</strong></div>
              <div><span>Passes / shots</span><strong>{stats.passes || 0} / {stats.shots || 0}</strong></div>
            </>
          ) : (
            <>
              <div><span>Damage dealt</span><strong>{stats.playerScore || 0}</strong></div>
              <div><span>Best combo</span><strong>{stats.bestCombo || stats.playerCombo || 0}-hit</strong></div>
              <div><span>Your HP</span><strong>{Math.max(0, Math.round(stats.playerHp || 0))}</strong></div>
            </>
          )}
        </div>

        {won && (
          <div className="fight-results-rewards">
            <span>+{rewards.xp || course?.xpReward || 100} XP</span>
            {rewards.coins > 0 && <span>+{rewards.coins} 🪙</span>}
            {!isFootball && rewards.newBelt && <span className="fight-results-belt">New belt earned!</span>}
          </div>
        )}

        <div className="fight-results-actions">
          <button type="button" className="fight-results-btn primary" onClick={onRematch}>
            ↺ Rematch
          </button>
          <button type="button" className="fight-results-btn" onClick={onHub}>
            {isFootball ? '🏟️ Football Modes' : '🥊 Modes'}
          </button>
          <button type="button" className="fight-results-btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default FightingResults;
