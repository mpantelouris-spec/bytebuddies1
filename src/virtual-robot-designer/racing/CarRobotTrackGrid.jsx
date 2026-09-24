/**
 * CarRobotTrackGrid — 2×5 picker aligned to ByteBuddies Car Robot Racing Tracks mockup.
 */
import React from 'react';
import { CAR_KID_TRACK_TILES } from '../data/car-racing-tracks.js';

export function CarRobotTrackGrid({
  courses = [],
  currentId,
  currentArenaType,
  currentModeIndex,
  onSelectCourse,
  disabled,
}) {
  const activeMode = currentModeIndex
    ?? courses.find((c) => c.id === currentId)?.modeIndex
    ?? null;

  const pickCourse = (mode) => {
    const byMode = courses.find((c) => (c.modeIndex ?? 0) === mode);
    if (byMode) {
      onSelectCourse?.(byMode);
      return;
    }
    const tile = CAR_KID_TRACK_TILES.find((t) => t.mode === mode);
    const byArena = tile && courses.find(
      (c) => c.arenaType === tile.arenaId || c.environmentId === tile.arenaId,
    );
    if (byArena) onSelectCourse?.(byArena);
  };

  return (
    <div className="bb-car-track-grid" role="navigation" aria-label="Car robot racing tracks">
      <div className="bb-car-track-grid-head">
        <span className="bb-car-track-grid-kicker">ByteBuddies</span>
        <h3 className="bb-car-track-grid-title">Car Robot Racing Tracks</h3>
        <p className="bb-car-track-grid-sub">
          Ten unique circuits — pick a track, code your lap, then hit Run.
        </p>
      </div>
      <div className="bb-car-track-grid-tiles">
        {CAR_KID_TRACK_TILES.map((tile) => {
          const active = activeMode === tile.mode
            || (!activeMode && currentArenaType && currentArenaType === tile.arenaId);
          return (
            <button
              key={tile.mode}
              type="button"
              className={`bb-car-track-tile${active ? ' bb-car-track-tile--active' : ''}`}
              disabled={disabled}
              title={tile.story || tile.label}
              onClick={() => pickCourse(tile.mode)}
            >
              <span className="bb-car-track-tile-bg" style={{ background: tile.gradient }} aria-hidden />
              <span className="bb-car-track-tile-emoji">{tile.emoji}</span>
              <span className="bb-car-track-tile-label">{tile.label}</span>
              <span className="bb-car-track-tile-mode">Mode {tile.mode}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CarRobotTrackGrid;
