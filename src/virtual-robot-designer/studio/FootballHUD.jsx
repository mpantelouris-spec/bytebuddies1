/**
 * FootballHUD — FIFA TV broadcast overlays for Robot Football.
 */
import React from 'react';
import { FOOTBALL_CONTROLS_HELP } from './football-keyboard-controls.js';

function formatMatchClock(matchTime = 0, timeLimit = 180) {
  const matchMinute = Math.min(90, Math.floor((matchTime / Math.max(1, timeLimit)) * 90));
  const sec = Math.floor(matchTime % 60);
  return `${String(matchMinute).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function CircularRadar({ match }) {
  const bots = match.radar || [];
  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const hx = 20;
  const hz = 12.5;
  const toPx = (x, z) => ({
    left: cx + (x / hx) * (r * 0.86),
    top: cy + (z / hz) * (r * 0.86),
  });
  const ball = toPx(match.ballX ?? 0, match.ballZ ?? 0);
  const facing = match.playerFacing ?? 0;
  const wedgeDeg = (facing * 180) / Math.PI;

  return (
    <div className="fifa-tv-radar" aria-hidden="true">
      <div className="fifa-tv-radar-ring">
        <div
          className="fifa-tv-radar-wedge"
          style={{
            left: cx,
            top: cy,
            transform: `translate(-50%, -50%) rotate(${wedgeDeg}deg)`,
          }}
        />
        {bots.map((b) => {
          const p = toPx(b.x, b.z);
          return (
            <span
              key={b.id}
              className={`fifa-tv-radar-dot ${b.team === 'player' ? 'home' : 'away'}${b.isPlayer ? ' you' : ''}`}
              style={{ left: p.left, top: p.top }}
            />
          );
        })}
        <span className="fifa-tv-radar-ball" style={{ left: ball.left, top: ball.top }} />
      </div>
    </div>
  );
}

export function FootballHUD({
  match = {},
  robotName = 'You',
  enemyName = 'Opponent',
  challenge = {},
  visible = true,
  codingLabel = '',
  showControls = false,
  controlsHelp = FOOTBALL_CONTROLS_HELP,
  onPause,
  isPaused = false,
  isRunning = false,
}) {
  if (!visible || !match.active) return null;

  const isTraining = ['training', 'penalties', 'freekick', 'keeper'].includes(challenge?.matchMode);
  const isPenalty = challenge?.matchMode === 'penalties';
  const isKeeper = challenge?.matchMode === 'keeper';
  const isStreet = challenge?.id === 'football_street';
  const isArcade = challenge?.id === 'football_arcade';
  const isTeamMatch = challenge?.matchMode === 'fifa3v3' || (match.teamSize ?? 0) >= 3;
  const goalsToWin = match.goalsToWin ?? challenge?.goalsToWin ?? 3;
  const feedback = match.feedback?.text || (typeof match.feedback === 'string' ? match.feedback : null);
  const drillHint = match.drillHint;
  const homeName = isTeamMatch ? 'GREEN' : (robotName || 'YOU').slice(0, 10).toUpperCase();
  const awayName = isTeamMatch ? 'BLUE' : (enemyName || 'CPU').slice(0, 10).toUpperCase();
  const homeGoals = isKeeper ? (match.saves ?? 0) : (match.playerGoals ?? 0);
  const awayGoals = match.enemyGoals ?? 0;
  const kickoff = match.kickoffBanner;
  const scored = (match.goalFlash ?? 0) > 0;
  const timeLimit = match.timeLeft != null ? (match.matchTime ?? 0) + match.timeLeft : 180;
  const clock = formatMatchClock(match.matchTime || 0, timeLimit);
  const modeLabel = match.modeLabel || challenge?.shortName || 'MATCH';
  const compTitle = isKeeper ? 'KEEPER HERO'
    : isPenalty ? 'PENALTY'
      : isArcade ? 'ARCADE RUSH'
        : isStreet ? 'STREET CUP'
          : isTeamMatch ? 'BYTEBUDDIES CUP'
            : isTraining ? 'TRAINING'
              : 'MATCH';

  const codedAction = match.codedActionLabel || '';
  const scriptBadge = codedAction || codingLabel;
  const stamina = Math.max(0, Math.min(1, match.playerStamina ?? 1));
  const playerLabel = match.playerLabel || '#9 STRIKER';
  const showTvLayout = isTeamMatch && !isTraining;

  return (
    <div className={`football-hud fifa-hud${showTvLayout ? ' fifa-hud--tv' : ''}`} aria-live="polite">
      {kickoff && <div className="football-kickoff-banner">KICK OFF</div>}
      {scored && (
        <div className="football-goal-banner">
          GOAL!
          {match.lastScorer ? <span className="football-goal-scorer">{match.lastScorer}</span> : null}
        </div>
      )}

      {showTvLayout ? (
        <>
          <div className={`fifa-tv-scorebar${kickoff ? ' kickoff' : ''}`}>
            <div className="fifa-tv-scorebar-accent fifa-tv-scorebar-accent--green" />
            <div className="fifa-tv-scorebar-accent fifa-tv-scorebar-accent--blue" />
            <div className="fifa-tv-scorebar-body">
              <span className="fifa-tv-team fifa-tv-team--green">{homeName}</span>
              <span className="fifa-tv-score">{homeGoals} - {awayGoals}</span>
              <span className="fifa-tv-team fifa-tv-team--blue">{awayName}</span>
            </div>
            <span className="fifa-tv-comp">{compTitle}</span>
          </div>

          <div className="fifa-tv-clock-block">
            <span className="fifa-tv-clock">{clock}</span>
            {(isRunning || isPaused) && onPause && (
              <button
                type="button"
                className="fifa-tv-pause"
                onClick={onPause}
                aria-label={isPaused ? 'Resume match' : 'Pause match'}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
            )}
          </div>

          <CircularRadar match={match} />

          <div className="fifa-tv-player-card">
            <div className="fifa-tv-player-name">{playerLabel}</div>
            <div className="fifa-tv-stamina">
              <span className={`fifa-tv-stamina-bolt${match.userSprinting ? ' on' : ''}`}>⚡</span>
              <div className="fifa-tv-stamina-track">
                <div
                  className="fifa-tv-stamina-fill"
                  style={{ width: `${stamina * 100}%` }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={`fifa-scorebar${kickoff ? ' kickoff' : ''}`}>
          <div className="fifa-scorebar-inner">
            <span className="fifa-comp">{compTitle}</span>
            <div className="fifa-teams">
              <span className="fifa-crest fifa-crest--home" />
              <span className="fifa-team fifa-team--home">{isKeeper ? 'KEEPER' : isPenalty ? 'KICKER' : homeName}</span>
              <span className="fifa-score">
                {isKeeper ? `${homeGoals}/${goalsToWin}` : (isPenalty || isTraining ? `${awayGoals === 0 ? homeGoals : homeGoals}/${goalsToWin}` : `${homeGoals} – ${awayGoals}`)}
              </span>
              <span className="fifa-team fifa-team--away">{isKeeper ? 'SHOOTER' : isPenalty ? 'KEEPER' : awayName}</span>
              <span className="fifa-crest fifa-crest--away" />
            </div>
            {!isPenalty && <span className="fifa-clock">{clock}</span>}
          </div>
        </div>
      )}

      {scriptBadge && isTeamMatch && (
        <div className={`football-coding-badge${codedAction ? ' live-script' : ''}`}>{scriptBadge}</div>
      )}
      {showControls && isTeamMatch && !kickoff && (
        <div className="football-controls-hint" title={controlsHelp}>
          {controlsHelp.split('·').map((part) => (
            <span key={part.trim()}>{part.trim()}</span>
          ))}
        </div>
      )}
      {drillHint && <div className="football-drill-hint">{drillHint}</div>}
      {feedback && <div className="football-feedback">{feedback}</div>}
    </div>
  );
}

export default FootballHUD;
