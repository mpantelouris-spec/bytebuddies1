import React from 'react';
import { analyzeRobot } from '../../services/robot-profile.js';

export default function TestArenaCourses({ design, activeId, onSelect, onRun, running, onStop }) {
  const profile = analyzeRobot(design);
  const recommended = profile.courses.filter((c) => c.recommended);
  const other = profile.courses.filter((c) => !c.recommended);

  const renderCard = (c) => (
    <button
      key={c.id}
      type="button"
      className={`ta-course-card ${activeId === c.id ? 'ta-course-card--active' : ''} ${c.recommended ? 'ta-course-card--star' : ''}`}
      style={{ '--course-accent': c.color }}
      onClick={() => onSelect(c.id)}
    >
      {c.recommended && <span className="ta-course-star" aria-label="Recommended">★</span>}
      <span className="ta-course-icon">{c.icon}</span>
      <span className="ta-course-label">{c.label}</span>
      <span className="ta-course-desc">{c.mission || c.desc}</span>
    </button>
  );

  return (
    <aside className="ta-courses">
      <h2 className="ta-panel-heading">Smart stages</h2>
      <p className="ta-panel-sub">
        {profile.tipIcon} Built for <strong>{profile.archetype.label}</strong> robots
      </p>

      {recommended.length > 0 && (
        <>
          <p className="ta-course-section-label">Best for your robot</p>
          <div className="ta-course-list">{recommended.map(renderCard)}</div>
        </>
      )}

      {other.length > 0 && (
        <>
          <p className="ta-course-section-label">More challenges</p>
          <div className="ta-course-list">{other.map(renderCard)}</div>
        </>
      )}

      <button
        type="button"
        className={`ta-run-btn ${running ? 'ta-run-btn--stop' : ''}`}
        onClick={running ? onStop : onRun}
      >
        {running ? '⏹ Stop mission' : '▶ Run my robot!'}
      </button>
    </aside>
  );
}
