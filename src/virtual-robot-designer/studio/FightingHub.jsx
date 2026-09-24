/**
 * Boxing Hub — mode select for the Robot Boxing Training Arena.
 */
import React from 'react';
import { FIGHTING_COURSES } from '../data/fighting-courses.js';
import { getFightCareer, isFightUnlocked, getFightUnlockLabel } from '../services/fight-career-progress.js';

export function FightingHub({ courses = FIGHTING_COURSES, currentId, onSelect, onClose, career = getFightCareer() }) {
  return (
    <div className="fight-hub-overlay" role="dialog" aria-label="Boxing modes">
      <div className="fight-hub-panel">
        <header className="fight-hub-header">
          <div>
            <span className="fight-hub-icon">🥊</span>
            <h2>Robot Boxing Arena</h2>
            <p>ByteBuddies Academy · Training Hub</p>
          </div>
          <button type="button" className="fight-hub-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="fight-hub-stats">
          <span>Lv {career.level}</span>
          <span>🪙 {career.coins}</span>
          <span>W {career.wins} · L {career.losses}</span>
          {career.belts?.length > 0 && (
            <span className="fight-hub-belts">{career.belts.map((b) => (b === 'champion' ? '🏆' : '🥇')).join(' ')}</span>
          )}
        </div>

        <div className="fight-hub-grid">
          {courses.map((c) => {
            const unlocked = isFightUnlocked(c.id);
            const cleared = career.cleared?.includes(c.id);
            const lockHint = !unlocked ? getFightUnlockLabel(c.id) : null;
            return (
              <button
                key={c.id}
                type="button"
                className={`fight-hub-card${currentId === c.id ? ' active' : ''}${!unlocked ? ' locked' : ''}${cleared ? ' cleared' : ''}`}
                disabled={!unlocked}
                onClick={() => unlocked && onSelect(c)}
              >
                <span className="fight-hub-card-icon">{c.icon}</span>
                <strong>{c.name}</strong>
                <span className="fight-hub-card-tag">{c.shortName || c.fightMode}</span>
                <span className="fight-hub-card-desc">{c.tagline || c.desc}</span>
                {cleared && <span className="fight-hub-cleared">✓ Cleared</span>}
                {lockHint && <span className="fight-hub-lock">🔒 {lockHint}</span>}
              </button>
            );
          })}
        </div>

        <footer className="fight-hub-footer">
          <span>Keyboard: J jab · K cross · B block · Shift dodge · W/S move · Q special</span>
        </footer>
      </div>
    </div>
  );
}

export default FightingHub;
