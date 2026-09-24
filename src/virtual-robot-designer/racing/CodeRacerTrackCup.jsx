/**
 * CodeRacerTrackCup — pick any of the 10 Mario Kart–style cup tracks.
 */
import React from 'react';
import { BIOME_TRACKS } from './mk-tracks/BiomeTrackRegistry.js';
import { MK_RACING_COURSE_BY_ID } from '../data/mk-racing-courses.js';

export function CodeRacerTrackCup({ arenaType, onSelect, disabled, variant = 'dock' }) {
  return (
    <div
      className={`bb-track-cup${variant === 'top' ? ' bb-track-cup--top' : ''}${variant === 'inline' ? ' bb-track-cup--inline' : ''}${variant === 'toolbar' ? ' bb-track-cup--toolbar' : ''}`}
      role="navigation"
      aria-label="CodeRacer track cup"
    >
      <span className="bb-track-cup-label">🏎️ Cup tracks</span>
      <div className="bb-track-cup-scroll">
        {BIOME_TRACKS.map((t) => {
          const course = MK_RACING_COURSE_BY_ID[t.arenaType] || MK_RACING_COURSE_BY_ID[t.courseId];
          const active = arenaType === t.arenaType;
          const shortLabel = t.label.replace(/\s+(Circuit|Speedway|Rush|Loop|Rally|Descent|Forge|Ring|Gardens|Challenge)$/i, '');
          return (
            <button
              key={t.arenaType}
              type="button"
              className={`bb-track-cup-btn${active ? ' bb-track-cup-btn--active' : ''}`}
              disabled={disabled || !course}
              title={t.label}
              onClick={() => course && onSelect(course)}
            >
              <span className="bb-track-cup-emoji">{t.emoji}</span>
              <span className="bb-track-cup-name">{shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CodeRacerTrackCup;
