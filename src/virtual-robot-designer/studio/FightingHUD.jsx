/**
 * FightingHUD.jsx — health, stamina, distance, combos, rounds, AI status.
 */
import React from 'react';

export function FightingHUD({ combat = {}, robotName = 'You', enemyName = 'Opponent', academyLayout = false, minimal = false }) {
  if (!combat.active) return null;
  if (minimal || academyLayout) {
    return (
      <div className="fight-hud fight-hud--minimal" aria-live="polite">
        {combat.damageNumbers?.map((d) => (
          <div
            key={d.id}
            className={`fight-dmg-num${d.critical ? ' critical' : ''}${d.blocked ? ' blocked' : ''}${d.combo ? ' combo' : ''}`}
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          >
            {d.miss ? 'MISS' : d.blocked ? d.amount : d.critical ? d.amount : d.amount}
          </div>
        ))}
      </div>
    );
  }
  const playerPct = combat.playerMax > 0 ? (combat.playerHp / combat.playerMax) * 100 : 0;
  const enemyPct = combat.enemyMax > 0 ? (combat.enemyHp / combat.enemyMax) * 100 : 0;
  const staminaPct = combat.playerStaminaMax > 0
    ? (combat.playerStamina / combat.playerStaminaMax) * 100
    : 100;
  const enemyStaminaPct = (combat.enemyStaminaPct ?? (combat.enemyStamina / 100)) * 100;
  const specialPct = (combat.specialMeterPct ?? 0) * 100;
  const energyPct = (combat.energyPct ?? combat.specialMeterPct ?? 0) * 100;
  const playerCol = playerPct > 75 ? '#22c55e' : playerPct > 25 ? '#fbbf24' : '#ef4444';
  const staminaCol = staminaPct > 50 ? '#22c55e' : staminaPct > 20 ? '#fbbf24' : '#ef4444';
  const band = combat.distanceBand || {};
  const mins = Math.floor((combat.roundTimeLeft || 0) / 60);
  const secs = Math.ceil((combat.roundTimeLeft || 0) % 60);
  const showRounds = combat.useBoxingRounds || combat.boxingRound > 1 || (combat.roundWinsPlayer + combat.roundWinsEnemy) > 0;

  return (
    <div className={`fight-hud${academyLayout ? ' fight-hud--academy' : ''}`} aria-live="polite">
      {combat.betweenRounds && (
        <div className="fight-round-overlay">
          <div className="fight-round-banner">
            <span className="fight-round-bell">🔔</span>
            <span>Round {combat.boxingRound} — Rest</span>
            <span className="fight-round-score">
              {combat.roundWinsPlayer || 0} — {combat.roundWinsEnemy || 0}
            </span>
          </div>
        </div>
      )}

      {/* Victory presentation lives in the FightingResults modal — no duplicate banner here */}

      <div className="fight-hud-top">
        <div className="fight-hud-mode">{combat.modeLabel || '⚔️ Combat'}</div>
        {combat.difficulty && <div className="fight-hud-diff">AI: {combat.difficulty}</div>}
        {combat.wave > 0 && <div className="fight-hud-wave">Wave {combat.wave}</div>}
        {combat.strategyLabel && (
          <div className="fight-hud-scenario">
            Scenario {(combat.strategyScenario || 0) + 1}/{combat.strategyScenarioGoal || 3}: {combat.strategyLabel}
          </div>
        )}
        {(combat.roundTimeLeft > 0 || showRounds) && (
          <div className="fight-hud-timer">
            {combat.betweenRounds ? 'Rest…' : `⏱ ${mins}:${String(secs).padStart(2, '0')}`}
          </div>
        )}
        {showRounds && (
          <div className="fight-hud-round">
            Rd {combat.boxingRound || 1} · {combat.roundWinsPlayer || 0}-{combat.roundWinsEnemy || 0}
          </div>
        )}
        {combat.round > 0 && combat.totalRounds > 0 && (
          <div className="fight-hud-round">Match {combat.round}/{combat.totalRounds}</div>
        )}
      </div>

      {combat.fightPhase?.label && (
        <div className="fight-hud-phase-bar">{combat.fightPhase.label}</div>
      )}

      {!academyLayout && (
      <div className="fight-hud-enemy-bar">
        <span className="fight-hud-name">{enemyName}</span>
        <div className="fight-hp-track">
          <div className="fight-hp-fill enemy" style={{ width: `${enemyPct}%`, background: combat.enemyColor || '#ef4444' }} />
        </div>
        <div className="fight-stamina-row compact">
          <span className="fight-stamina-label">STA</span>
          <div className="fight-stamina-track">
            <div className="fight-stamina-fill enemy-sta" style={{ width: `${enemyStaminaPct}%` }} />
          </div>
        </div>
        <span className="fight-hp-num">{Math.max(0, Math.round(combat.enemyHp))} HP</span>
      </div>
      )}

      {/* Center-screen chips removed — no text floating over the fighters.
          Combo still shows briefly since it's a reward moment. */}
      <div className="fight-hud-center-info">
        {combat.playerCombo > 2 && (
          <span className="fight-combo-chip">🔥 {combat.playerCombo}-Hit Combo!</span>
        )}
      </div>

      {(combat.playerScore > 0 || combat.enemyScore > 0) && combat.mode !== 'training' && (
        <div className="fight-scorecard">
          <span>Points: You {combat.playerScore || 0}</span>
          <span>·</span>
          <span>Foe {combat.enemyScore || 0}</span>
        </div>
      )}

      {combat.boss && combat.phase > 1 && (
        <div className="fight-hud-phase">Phase {combat.phase} — {combat.phaseLabel || 'Enraged!'}</div>
      )}

      {!academyLayout && (
      <div className="fight-hud-player-bar">
        <div className="fight-stamina-row">
          <span className="fight-stamina-label">Stamina</span>
          <div className="fight-stamina-track">
            <div className="fight-stamina-fill" style={{ width: `${staminaPct}%`, background: staminaCol }} />
          </div>
        </div>
        <div className="fight-stamina-row">
          <span className="fight-stamina-label">Energy</span>
          <div className="fight-stamina-track">
            <div className="fight-stamina-fill energy" style={{ width: `${energyPct}%` }} />
          </div>
        </div>
        <div className="fight-hp-track large">
          <div className="fight-hp-fill player" style={{ width: `${playerPct}%`, background: playerCol }} />
        </div>
        <span className="fight-hp-num">{Math.max(0, Math.round(combat.playerHp))} / {combat.playerMax} HP</span>
        <span className="fight-hud-name player">{robotName}</span>
      </div>
      )}

      {!academyLayout && (
      <div className="fight-hud-special-meter">
        <span className="fight-special-label">
          {combat.specialActive ? '⚡ SPECIAL ACTIVE' : combat.specialReady ? '⭐ READY' : 'Special'}
        </span>
        <div className="fight-special-track">
          <div
            className={`fight-special-fill${combat.specialActive ? ' active' : ''}${combat.specialReady ? ' ready' : ''}`}
            style={{ width: `${specialPct}%` }}
          />
        </div>
      </div>
      )}

      {!academyLayout && !combat.over && (
        <div className="fight-controls-hint">
          <span>J Jab</span><span>K Cross</span><span>B Block</span><span>Shift Dodge</span><span>W/S Move</span><span>Q Special</span>
        </div>
      )}

      {/* Word-feedback banner removed — impact reads through animation,
          knockback, particles, and damage numbers instead of text. */}

      {combat.damageNumbers?.map((d) => (
        <div
          key={d.id}
          className={`fight-dmg-num${d.critical ? ' critical' : ''}${d.blocked ? ' blocked' : ''}${d.combo ? ' combo' : ''}`}
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
        >
          {d.miss ? 'MISS' : d.blocked ? d.amount : d.critical ? d.amount : d.amount}
        </div>
      ))}

      {combat.statusEffects?.length > 0 && (
        <div className="fight-status-fx">
          {combat.statusEffects.map((fx) => (
            <span key={fx} className="fight-status-chip">{fx}</span>
          ))}
        </div>
      )}

      {/* Also shown in MissionStudioPanel's hit-progress bar — avoid a third copy */}
      {!academyLayout && (combat.trainingHits != null || combat.trainingProgress != null) && (
        <div className="fight-training-progress">
          Training hits: {combat.trainingHits ?? combat.trainingProgress} / {combat.trainingGoal || 5}
        </div>
      )}
    </div>
  );
}

export default FightingHUD;
