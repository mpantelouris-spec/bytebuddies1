/**
 * MissionCampaignHUD.jsx — Premium in-game HUD for robot campaign missions (racing-parity polish).
 */
import React from 'react';

const ZONE_THEMES = {
  robot_reef:     { accent: '#00e5ff', pillBg: 'rgba(4,24,48,0.82)', pillBorder: 'rgba(0,229,255,0.4)' },
  desert_rally:   { accent: '#f59e0b', pillBg: 'rgba(40,24,8,0.85)',  pillBorder: 'rgba(245,158,11,0.45)' },
  neon_city:      { accent: '#a855f7', pillBg: 'rgba(12,8,32,0.85)',  pillBorder: 'rgba(168,85,247,0.45)' },
  arctic_station: { accent: '#93c5fd', pillBg: 'rgba(8,24,48,0.85)',  pillBorder: 'rgba(147,197,253,0.45)' },
  jungle:         { accent: '#4ade80', pillBg: 'rgba(8,24,12,0.85)',   pillBorder: 'rgba(74,222,128,0.4)' },
  default:        { accent: '#22c55e', pillBg: 'rgba(8,16,12,0.85)',  pillBorder: 'rgba(34,197,94,0.4)' },
};

function formatTime(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function MissionCampaignHUD({ stats, challenge }) {
  const arena = challenge?.arenaType || 'default';
  const t = ZONE_THEMES[arena] || ZONE_THEMES.default;
  const timeLeft = challenge?.timeLimit
    ? Math.max(0, challenge.timeLimit - (stats.time || 0))
    : null;

  return (
    <div className="rc-hud-topbar">
      <div className="rc-hud-pill" style={{ background: t.pillBg, borderColor: t.pillBorder, color: '#fff' }}>
        <span className="rc-pill-lbl" style={{ color: 'rgba(255,255,255,0.55)' }}>MISSION</span>
        <strong style={{ color: t.accent }}>{challenge?.code || challenge?.shortName || '—'}</strong>
      </div>
      {timeLeft != null && (
        <div className="rc-hud-pill" style={{ background: t.pillBg, borderColor: t.pillBorder, color: '#fff' }}>
          <span className="rc-pill-lbl" style={{ color: 'rgba(255,255,255,0.55)' }}>TIME</span>
          <strong style={{ color: timeLeft < 30 ? '#ff4444' : '#fff' }}>{formatTime(timeLeft)}</strong>
        </div>
      )}
      <div className="rc-hud-pill" style={{ background: t.pillBg, borderColor: t.pillBorder, color: '#fff' }}>
        <span className="rc-pill-lbl" style={{ color: 'rgba(255,255,255,0.55)' }}>BATTERY</span>
        <strong style={{ color: (stats.battery ?? 100) < 25 ? '#ff4444' : '#fff' }}>{Math.round(stats.battery ?? 100)}%</strong>
      </div>
    </div>
  );
}
