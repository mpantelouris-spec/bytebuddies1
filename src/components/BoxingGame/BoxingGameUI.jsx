/**
 * Professional boxing match UI — scoring, rounds, knockdown count, controls.
 */
import React from 'react';
import { useBoxingGameStore } from './BoxingGameState.js';
import { BOXING_CONTROLS_HELP } from './BoxingGameInput.js';
import { getStateColor, getHealthColor } from './boxingGameMechanics.js';
import { MATCH } from './boxingGameConstants.js';
import './BoxingGame.css';

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.ceil(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function BoxingGameUI({ robotName = 'STRIKER', onStart, onReset, running = false }) {
  const s = useBoxingGameStore();

  const playerHpPct = s.playerHealth / MATCH.MAX_HEALTH;
  const oppHpPct = s.opponentHealth / MATCH.MAX_HEALTH;
  const roundDots = Array.from({ length: MATCH.ROUNDS }, (_, i) => {
    const w = s.judgeCard[i]?.winner;
    if (!w) return i + 1 === s.currentRound ? 'current' : 'pending';
    return w === 'player' ? 'won' : w === 'opponent' ? 'lost' : 'draw';
  });
  const mins = formatTime(s.roundTimeRemaining);
  const showCombo = s.playerCombo >= 2;
  const showKnockdown = s.isOpponentKnockedDown || s.isPlayerKnockedDown;

  const matchOver = s.matchState === 'MATCH_OVER';
  const showRest = s.matchState === 'REST' && s.isResting;
  const showRoundSummary = s.roundSummary && !showRest && s.matchState === 'ROUND_END';

  return (
    <div className="boxing-game-ui" aria-label="Boxing match HUD">
      {/* Top left — player */}
      <aside className="boxing-panel boxing-panel--player">
        <div className="boxing-round">ROUND {s.currentRound}/{MATCH.ROUNDS}</div>
        <div className="boxing-timer">{mins}</div>
        <div className="boxing-score">YOU: {s.playerScore} PTS</div>
        <div className="boxing-hp">
          {Math.round(s.playerHealth)}/{MATCH.MAX_HEALTH} HP
        </div>
        <div className="boxing-bar boxing-bar--hp">
          <div style={{ width: `${playerHpPct * 100}%`, background: getHealthColor(playerHpPct) }} />
        </div>
        <div className="boxing-stamina-label">STAMINA {Math.round(s.playerStamina)}%</div>
        <div className="boxing-bar boxing-bar--stamina">
          <div style={{ width: `${(s.playerStamina / MATCH.MAX_STAMINA) * 100}%` }} />
        </div>
      </aside>

      {/* Top right — opponent */}
      <aside className="boxing-panel boxing-panel--opponent">
        <div className="boxing-label">OPPONENT</div>
        <div className="boxing-score">OPPONENT: {s.opponentScore} PTS</div>
        <div className="boxing-hp">
          {Math.round(s.opponentHealth)}/{MATCH.MAX_HEALTH} HP
        </div>
        <div className="boxing-bar boxing-bar--hp-opponent">
          <div style={{ width: `${oppHpPct * 100}%`, background: getHealthColor(oppHpPct) }} />
        </div>
      </aside>

      <div className="boxing-round-dots" aria-hidden>
        {roundDots.map((d, i) => (
          <span key={i} className={`boxing-dot boxing-dot--${d}`} title={`Round ${i + 1}`} />
        ))}
      </div>

      {/* Center top */}
      {showCombo && (
        <div className={`boxing-combo ${s.playerCombo >= 5 ? 'boxing-combo--hot' : s.playerCombo >= 3 ? 'boxing-combo--warm' : ''}`}>
          COMBO ×{s.playerCombo}
        </div>
      )}
      {showKnockdown && (
        <div className="boxing-knockdown-msg">KNOCKDOWN!</div>
      )}
      {(s.isOpponentKnockedDown || s.isPlayerKnockedDown) && s.centerMessage && /^\d+$/.test(s.centerMessage) && (
        <div className="boxing-count">{s.centerMessage}</div>
      )}
      {s.centerMessage && !/^\d+$/.test(s.centerMessage) && !showRest && !showRoundSummary && (
        <div className="boxing-center-msg">{s.centerMessage}</div>
      )}

      {/* Floating +PTS popups */}
      <div className="boxing-floating-hits" aria-hidden>
        {s.floatingHits.slice(-3).map((hit, i) => (
          <span
            key={hit.id}
            className={`boxing-float-pts ${hit.blocked ? 'boxing-float-pts--blocked' : ''} ${hit.critical ? 'boxing-float-pts--crit' : ''}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {hit.blocked ? 'BLOCKED' : `+${hit.amount} PTS`}
          </span>
        ))}
      </div>

      {/* Rest between rounds */}
      {showRest && (
        <div className="boxing-rest-banner">
          <div className="boxing-rest-title">REST</div>
          <div className="boxing-rest-timer">{Math.ceil(s.restTimeRemaining)}s</div>
          <p className="boxing-rest-hint">Corner time — next round starts soon</p>
        </div>
      )}

      {/* Round summary card */}
      {showRoundSummary && (
        <div className="boxing-round-summary">
          <h3>Round {s.roundSummary.round} Complete</h3>
          <div className="boxing-round-summary-scores">
            <span>YOU: {s.roundSummary.playerScore}</span>
            <span className="boxing-round-summary-vs">VS</span>
            <span>OPPONENT: {s.roundSummary.opponentScore}</span>
          </div>
          <p className="boxing-round-summary-winner">
            {s.roundSummary.winner === 'player'
              ? 'You win the round!'
              : s.roundSummary.winner === 'opponent'
                ? 'Opponent wins the round'
                : 'Round is a draw'}
          </p>
        </div>
      )}

      {/* Bottom left — last hit */}
      <aside className="boxing-panel boxing-panel--bottom-left">
        {s.lastHitPoints > 0 && (
          <div className="boxing-last-hit">+{s.lastHitPoints} PTS!</div>
        )}
        {s.lastComboMult > 1 && (
          <div className="boxing-mult">×{s.lastComboMult.toFixed(1)}</div>
        )}
        <div
          className="boxing-state-text"
          style={{ color: getStateColor(s.playerState) }}
        >
          {s.stateLabel}
        </div>
      </aside>

      {/* Bottom right — controls */}
      <aside className="boxing-panel boxing-panel--controls">
        <div className="boxing-controls-title">Controls</div>
        <ul className="boxing-controls-list">
          {BOXING_CONTROLS_HELP.slice(0, 6).map((c) => (
            <li key={c.keys}><kbd>{c.keys}</kbd> {c.action}</li>
          ))}
        </ul>
      </aside>

      {/* Center bottom — action state */}
      <div className="boxing-action-bar">
        {s.playerState === 'ATTACKING' && <span className="boxing-action boxing-action--attack">PUNCHING</span>}
        {s.playerState === 'BLOCKING' && <span className="boxing-action boxing-action--block">BLOCKING</span>}
        {s.playerState === 'KNOCKDOWN' && <span className="boxing-action boxing-action--kd">KNOCKED DOWN</span>}
      </div>

      {/* Match over / judge card */}
      {matchOver && (
        <div className="boxing-match-over">
          <h2>{s.winMethod === 'KO' ? 'KNOCKOUT!' : 'MATCH OVER'}</h2>
          <p className="boxing-winner">
            {s.winner === 'player' ? `${robotName} WINS` : s.winner === 'opponent' ? 'OPPONENT WINS' : 'DRAW'}
            {s.winMethod && ` BY ${s.winMethod}`}
          </p>
          <p className="boxing-final-score">
            FINAL: {s.playerTotalScore} — {s.opponentTotalScore} points
          </p>
          {s.judgeCard.length > 0 && (
            <div className="boxing-judge-card">
              {s.judgeCard.map((r) => (
                <div key={r.round} className="boxing-judge-row">
                  Round {r.round}: YOU {r.winner === 'player' ? '●' : '○'} OPPONENT {r.winner === 'opponent' ? '●' : '○'}
                  <span className="boxing-judge-pts">{r.playerScore} — {r.opponentScore}</span>
                </div>
              ))}
            </div>
          )}
          <button type="button" className="boxing-btn" onClick={onReset}>Fight Again</button>
        </div>
      )}

      {/* Start overlay */}
      {!running && !matchOver && (
        <div className="boxing-start-overlay">
          <h2>Arcade Fight</h2>
          <p>{robotName} vs Training Dummy — Street Fighter style · 3 Rounds</p>
          <button type="button" className="boxing-btn boxing-btn--primary" onClick={onStart}>
            FIGHT!
          </button>
        </div>
      )}
    </div>
  );
}

export default BoxingGameUI;
