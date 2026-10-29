import React, { useState } from 'react';
import { GAME_MODES } from '../../data/gameModes';
import './gameModes.css';
import { EmojiIcon } from '../ui/Icon.jsx';
import { useUser } from '../../contexts/UserContext';

const PROGRESS_KEY = 'bb_gb_mode_progress';

/** Stars earned per mode/challenge: { [modeId]: { [challengeId]: 0..3 } } */
export function readModeProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') || {}; } catch { return {}; }
}
export function saveModeStars(modeId, challengeId, stars) {
  const all = readModeProgress();
  const prev = all[modeId]?.[challengeId] || 0;
  if (stars <= prev) return all;
  const next = { ...all, [modeId]: { ...(all[modeId] || {}), [challengeId]: stars } };
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}
const starsIn = (progress, mode) => mode.challenges.reduce((n, c) => n + (progress[mode.id]?.[c.id] || 0), 0);

/** The gallery of Game Modes. */
export function GameModesGallery({ onPick, onClose }) {
  const progress = readModeProgress();
  return (
    <div className="gm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gm-gallery" role="dialog" aria-label="Game Modes">
        <div className="gm-gallery-head">
          <div>
            <h2><EmojiIcon e="🎮" style={{ marginRight: '0.35em' }} />Game Modes</h2>
            <p>Pick a game to remix. Each one comes ready to play, with challenges that check your code and award up to 3 stars.</p>
          </div>
          <button className="gm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="gm-grid">
          {GAME_MODES.map((m) => {
            const earned = starsIn(progress, m);
            return (
              <button key={m.id} className="gm-card" style={{ '--gm-c': m.color }} onClick={() => onPick(m)}>
                <div className="gm-card-art">
                  <span className="gm-concept">{m.concept}</span>
                  {earned > 0 && <span className="gm-stars">⭐ {earned}/{m.challenges.length * 3}</span>}
                  {m.emoji}
                </div>
                <div className="gm-card-body">
                  <div className="gm-card-title">{m.title}<small>{m.subtitle}</small></div>
                  <div className="gm-card-blurb">{m.blurb}</div>
                  <div className="gm-card-foot">
                    <span className="gm-dots">{m.challenges.map((c) => <i key={c.id} className={progress[m.id]?.[c.id] ? 'on' : ''} />)}</span>
                    <span>{m.challenges.length} challenges</span>
                    <span className="gm-play">Play ▶</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * The challenge card under the stage: goal, hints, live check result and stars.
 * `status` comes from the Game Builder's checker while the game is playing.
 */
export function ChallengePanel({ mode, index, status, progress, onPickChallenge, onShowAnswer, onExit }) {
  const [hintsShown, setHintsShown] = useState(0);
  const [lastIndex, setLastIndex] = useState(index);
  // Model answers are for teachers only — pupils build the code themselves
  const isTeacher = (useUser() || {}).user?.role === 'teacher';
  if (lastIndex !== index) { setLastIndex(index); setHintsShown(0); }
  const ch = mode.challenges[index];
  if (!ch) return null;
  const stars = status?.stars || 0;
  const star2Label = ch.star2?.label || 'Used a loop';
  const won = status?.pass;
  return (
    <div className="gm-panel" style={{ '--gm-c': mode.color }}>
      <div className="gm-panel-head">
        <span style={{ fontSize: 18 }}>{mode.emoji}</span>
        <b>{mode.title} · {mode.subtitle}</b>
        <button className="gm-exit" onClick={onExit} title="Leave this game mode (your code stays)">Exit mode</button>
      </div>
      <div className="gm-steps">
        {mode.challenges.map((c, i) => {
          const s = progress?.[mode.id]?.[c.id] || 0;
          return (
            <button key={c.id} className={`gm-step${i === index ? ' is-on' : ''}`} onClick={() => onPickChallenge(i)} title={c.title}>
              {i + 1}<span className="s">{s ? '★'.repeat(s) : ''}</span>
            </button>
          );
        })}
      </div>
      <div className="gm-task-title">{index + 1}. {ch.title}</div>
      <div className="gm-goal">{ch.goal}</div>
      <div className={`gm-status${won ? ' is-win gm-cheer' : ''}${status?.fail ? ' is-fail' : ''}`}>
        {won ? <><b>Challenge complete!</b> {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</> : (status?.note || 'Press ▶ Play to test your code.')}
        <div className="gm-starrow">
          <span className={stars >= 1 ? 'on' : ''}>⭐ Complete it</span>
          <span className={stars >= 2 ? 'on' : ''}>⭐ {star2Label}</span>
          <span className={stars >= 3 ? 'on' : ''}>⭐ {ch.par} blocks or fewer{ch.parSprite ? ` (${ch.parSprite})` : ''}</span>
        </div>
      </div>
      {ch.hints.slice(0, hintsShown).map((h) => <div key={h} className="gm-hint"><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />{h}</div>)}
      <div className="gm-actions">
        {hintsShown < ch.hints.length && <button className="gm-btn" onClick={() => setHintsShown((n) => n + 1)}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Hint {hintsShown + 1}/{ch.hints.length}</button>}
        {won && index < mode.challenges.length - 1 && <button className="gm-btn primary" onClick={() => onPickChallenge(index + 1)}>Next challenge →</button>}
        {isTeacher && (ch.solution || ch.solutionFor) && <button className="gm-btn" onClick={() => onShowAnswer(ch)} title="For teachers: load a working answer"><EmojiIcon e="👩‍🏫" style={{ marginRight: '0.35em' }} />Model answer</button>}
      </div>
    </div>
  );
}
