import React from 'react';
import { getCourseMeta } from '../../data/test-arena-courses.js';

/** HUD overlays on the arena viewport — progress, celebration, robot badge */
export default function TestArenaOverlay({
  arenaId,
  robotName,
  running,
  paused,
  status,
  elapsed,
  distance,
  showCelebrate,
}) {
  const course = getCourseMeta(arenaId);
  const progress = Math.min(100, (distance / 12) * 100 + (running ? elapsed * 2 : 0));

  return (
    <div className="ta-overlay" aria-hidden={false}>
      {showCelebrate && (
        <div className="ta-celebrate" role="status">
          <span className="ta-celebrate-burst">🎉</span>
          <strong>Mission complete!</strong>
          <span>Your robot nailed it!</span>
        </div>
      )}

      <div className="ta-robot-badge">
        <span className="ta-robot-badge-icon">🤖</span>
        <span>{robotName || 'Your Robot'}</span>
      </div>

      {running && (
        <div className="ta-mission-progress">
          <div className="ta-mission-progress-head">
            <span>{paused ? 'Paused' : 'Mission progress'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="ta-mission-progress-bar">
            <span style={{ width: `${progress}%`, background: course.color }} />
          </div>
        </div>
      )}
    </div>
  );
}
