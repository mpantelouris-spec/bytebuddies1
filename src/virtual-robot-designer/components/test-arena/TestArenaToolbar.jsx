import React from 'react';
import { getCourseMeta } from '../../data/test-arena-courses.js';

const SPEEDS = [
  { id: 0.5, label: '0.5×' },
  { id: 1, label: '1×' },
  { id: 2, label: '2×' },
  { id: 3, label: 'Turbo' },
];

export default function TestArenaToolbar({
  arenaId,
  robotName,
  running,
  paused,
  speedMult,
  onPause,
  onSpeedChange,
  onReset,
  onCameraReset,
  onZoomIn,
  onZoomOut,
  onFullscreen,
  isFullscreen,
  cinemaMode,
  onCinemaToggle,
  onGoDesign,
  onGoCode,
}) {
  const course = getCourseMeta(arenaId);

  return (
    <header className="ta-toolbar">
      <div className="ta-toolbar-brand">
        <span className="ta-toolbar-badge">🚀 Test Arena — NEW</span>
        <h1>{course.label}</h1>
        <p>Running <strong>{robotName || 'your robot'}</strong> — same invention from the lab</p>
      </div>

      <div className="ta-toolbar-controls">
        <button type="button" className="ta-tool-btn" disabled={!running} onClick={onPause}>
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button type="button" className="ta-tool-btn" onClick={onReset}>
          ↺ Reset robot
        </button>
        <button type="button" className="ta-tool-btn" onClick={onZoomOut} title="Zoom out — see more of the arena">
          －
        </button>
        <button type="button" className="ta-tool-btn" onClick={onZoomIn} title="Zoom in — closer to robot">
          ＋
        </button>
        <button type="button" className="ta-tool-btn" onClick={onCameraReset} title="Reset camera view">
          ◎ View
        </button>
        <button
          type="button"
          className={`ta-tool-btn ${cinemaMode ? 'ta-tool-btn--on' : ''}`}
          onClick={onCinemaToggle}
          title="Hide side panels — giant arena view"
        >
          {cinemaMode ? '◧ Panels' : '▣ Focus'}
        </button>
        <button type="button" className="ta-tool-btn" onClick={onFullscreen}>
          {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
        </button>
        <div className="ta-speed-pills" role="group" aria-label="Simulation speed">
          {SPEEDS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`ta-speed-pill ${speedMult === s.id ? 'ta-speed-pill--on' : ''}`}
              onClick={() => onSpeedChange?.(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ta-toolbar-nav">
        {onGoCode && (
          <button type="button" className="ta-nav-btn" onClick={onGoCode}>
            ⌨ Code
          </button>
        )}
        {onGoDesign && (
          <button type="button" className="ta-nav-btn ta-nav-btn--primary" onClick={onGoDesign}>
            ← Invention Lab
          </button>
        )}
      </div>
    </header>
  );
}
