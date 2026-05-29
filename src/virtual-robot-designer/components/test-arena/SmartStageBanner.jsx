/**
 * Shows why this arena fits the child's robot — smart stage recommendation.
 */
import React from 'react';
import { analyzeRobot } from '../../services/robot-profile.js';

export default function SmartStageBanner({ design, activeCourse }) {
  const profile = analyzeRobot(design);
  const course = profile.courses.find((c) => c.id === activeCourse);

  return (
    <div className="ta-smart-banner" role="status">
      <div className="ta-smart-banner-icon" aria-hidden>{profile.tipIcon}</div>
      <div className="ta-smart-banner-body">
        <strong>{profile.arenaLabel}</strong>
        <p>{profile.recommend}</p>
        {course?.mission && (
          <span className="ta-smart-mission">
            Mission: {course.mission}
          </span>
        )}
      </div>
      <span className="ta-smart-profile-pill">{profile.archetype.icon} {profile.archetype.label}</span>
    </div>
  );
}
