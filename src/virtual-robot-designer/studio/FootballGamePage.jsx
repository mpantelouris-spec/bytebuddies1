/**
 * FootballGamePage — Studio tab entry for Robot Football Arena.
 */
import React from 'react';
import { FootballHub } from './FootballHub.jsx';

export default function FootballGamePage({ robotName = 'FootballBot', onStartCourse }) {
  return (
    <div className="football-game-page">
      <FootballHub robotName={robotName} onSelect={onStartCourse} />
    </div>
  );
}
