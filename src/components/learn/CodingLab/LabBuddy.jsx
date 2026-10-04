import React from 'react';
import { Dot } from '../LessonArt.jsx';

/** Dot, the Learn World robot, drawn as crisp SVG at any size. */
export default function LabBuddy({ name = 'Dot', size = 36, mood, style }) {
  return (
    <svg
      viewBox="-8 -14 116 186"
      width={size * 0.6}
      height={size}
      role="img"
      aria-label={name}
      style={{
        display: 'block',
        overflow: 'visible',
        filter: 'drop-shadow(0 2px 3px rgba(15,23,42,0.35))',
        pointerEvents: 'none',
        flexShrink: 0,
        animation: mood === 'happy' ? 'bb-dot-hop 0.5s ease-in-out 3' : undefined,
        ...style,
      }}
    >
      <Dot x={0} y={0} pose={mood === 'happy' ? 'cheer' : 'idle'} />
    </svg>
  );
}

export function GoalMark({ size = 14 }) {
  return <span aria-hidden style={{ fontSize: size * 1.4, lineHeight: 1, filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.8))' }}>⭐</span>;
}
