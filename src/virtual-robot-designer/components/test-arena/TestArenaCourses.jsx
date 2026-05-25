import React from 'react';
import { TEST_ARENA_COURSES } from '../../data/test-arena-courses.js';

export default function TestArenaCourses({ activeId, onSelect, onRun, running, onStop }) {
  return (
    <aside className="ta-courses">
      <h2 className="ta-panel-heading">Challenge courses</h2>
      <p className="ta-panel-sub">Pick a test track for your robot</p>
      <div className="ta-course-list">
        {TEST_ARENA_COURSES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`ta-course-card ${activeId === c.id ? 'ta-course-card--active' : ''}`}
            style={{ '--course-accent': c.color }}
            onClick={() => onSelect(c.id)}
          >
            <span className="ta-course-icon">{c.icon}</span>
            <span className="ta-course-label">{c.label}</span>
            <span className="ta-course-desc">{c.desc}</span>
          </button>
        ))}
      </div>
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
