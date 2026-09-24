/**
 * FightingAcademyHUD — slim edge-mounted combat UI for Live Lab simulate.
 * Keeps the ring clear; health + timer live in a thin top bar only.
 */
import React from 'react';
import { getHealthBarColor } from '../data/fighting-boxing-mechanics.js';

export function FightingAcademyHUD({
  combat = {},
  robotName = 'STRIKER',
  challenge = {},
  visible = true,
  showControls = false,
}) {
  if (!visible) return null;

  const active = !!combat.active;
  const playerPct = active && combat.playerMax > 0 ? combat.playerHp / combat.playerMax : 1;
  const enemyPct = active && combat.enemyMax > 0 ? combat.enemyHp / combat.enemyMax : 1;
  const mins = Math.floor((active ? combat.roundTimeLeft : 60) / 60);
  const secs = Math.ceil((active ? combat.roundTimeLeft : 60) % 60);
  const comboCount = combat.playerCombo || 0;
  const isTraining = combat.mode === 'training' || challenge?.fightMode === 'training';
  const trainingHits = combat.trainingHits ?? 0;
  const trainingGoal = combat.trainingGoal ?? 5;
  const feedbackText = combat.feedback?.text;
  const showFeedback = feedbackText
    && !/^(Advance|Retreat|Sidestep|High guard|Mid guard|Crouch block|Blocked!)/i.test(feedbackText);

  return (
    <div className="fight-academy-hud fight-academy-hud--slim" aria-hidden="false">
      <div className="fight-slim-topbar">
        <div className="fight-slim-fighter fight-slim-fighter--player">
          <span className="fight-slim-name">{robotName}</span>
          <div className="fight-slim-hp-track">
            <div
              className="fight-slim-hp-fill fight-slim-hp-fill--player"
              style={{ width: `${playerPct * 100}%`, background: getHealthBarColor(playerPct) }}
            />
          </div>
          <span className="fight-slim-hp-num">{Math.max(0, Math.round(combat.playerHp ?? 1000))}</span>
        </div>

        <div className="fight-slim-center">
          {isTraining ? (
            <span className="fight-slim-training">
              🎯 {trainingHits}/{trainingGoal}
            </span>
          ) : (
            <span className="fight-slim-round">R{combat.boxingRound || combat.round || 1}</span>
          )}
          {active && (
            <span className="fight-slim-clock">
              {mins}:{String(secs).padStart(2, '0')}
            </span>
          )}
        </div>

        <div className="fight-slim-fighter fight-slim-fighter--enemy">
          <span className="fight-slim-hp-num">{Math.max(0, Math.round(combat.enemyHp ?? 1000))}</span>
          <div className="fight-slim-hp-track">
            <div
              className="fight-slim-hp-fill fight-slim-hp-fill--enemy"
              style={{ width: `${enemyPct * 100}%`, background: getHealthBarColor(enemyPct) }}
            />
          </div>
          <span className="fight-slim-name">FOE</span>
        </div>
      </div>

      {comboCount >= 3 && (
        <div className={`fight-slim-combo${comboCount >= 5 ? ' fight-slim-combo--hot' : ''}`}>
          {comboCount}-HIT
        </div>
      )}

      {showFeedback && (
        <div
          className={`fight-slim-toast${combat.guardBroken ? ' fight-slim-toast--danger' : ''}`}
          key={feedbackText}
        >
          {feedbackText}
        </div>
      )}

      {showControls && !active && (
        <aside className="fight-academy-panel fight-academy-tips fight-academy-tips--idle">
          <h3>Controls</h3>
          <ul>
            <li><strong>A</strong> Light kick · <strong>D</strong> Roundhouse · <strong>Hold D</strong> Heavy</li>
            <li><strong>↓ + A</strong> Sweep · <strong>X/Z</strong> Punches · <strong>←</strong> Block</li>
            <li>Drag kick blocks from <strong>Striker</strong> in the Code panel</li>
          </ul>
        </aside>
      )}
    </div>
  );
}

export default FightingAcademyHUD;
