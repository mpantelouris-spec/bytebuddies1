import React from 'react';
import LabBuddy from '../CodingLab/LabBuddy.jsx';

/**
 * Sequence sprint shell for KS2 lessons — uses the year buddy, not emoji.
 */
export default function CodeRacerSequenceSprint({ activity, color = '#6366f1', children }) {
  const title = activity?.title || 'Sequence sprint';
  const name = activity?.characterName || 'Beemo';
  const image = activity?.characterImage;
  return (
    <div style={{
      borderRadius: 18,
      overflow: 'hidden',
      border: '2px solid rgba(99,102,241,0.45)',
      background: 'linear-gradient(165deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.85) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        background: 'linear-gradient(90deg, rgba(99,102,241,0.35), rgba(236,72,153,0.15))',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <LabBuddy image={image} name={name} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: '#a5b4fc' }}>
            {name.toUpperCase()} · SEQUENCE SPRINT
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#f8fafc' }}>{title}</div>
          {activity?.description && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
              {activity.description}
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        {children}
      </div>
    </div>
  );
}
