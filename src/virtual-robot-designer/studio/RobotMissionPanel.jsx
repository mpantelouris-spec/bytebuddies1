/**
 * RobotMissionPanel.jsx — Narrative mission panel for campaign missions
 */
import React, { useState, useMemo } from 'react';
import { MISSION_TYPE_LABELS } from '../data/robot-mission-campaign.js';
import { RobotMissionProgress } from '../services/robot-mission-progress.js';

export function RobotMissionPanel({
  challenge,
  story,
  stats,
  robotName,
  missionXp = 0,
  onEndMission,
}) {
  const [expanded, setExpanded] = useState(true);
  const progress = useMemo(
    () => RobotMissionProgress.getMission(robotName, challenge?.robotMissionId || challenge?.id),
    [robotName, challenge?.robotMissionId, challenge?.id],
  );

  const typeMeta = MISSION_TYPE_LABELS[challenge?.missionType] || MISSION_TYPE_LABELS.CD;
  const difficulty = challenge?.difficulty || 1;
  const stars = '⭐'.repeat(difficulty);
  const earnedXp = progress.xpEarned || missionXp || 0;
  const maxXp = story?.maxXp || challenge?.xpReward || 100;

  return (
    <aside className={`rmp-panel${expanded ? '' : ' rmp-collapsed'}`}>
      <div className="rmp-head" style={{ '--mission-col': challenge?.color || '#22c55e' }}>
        <div className="rmp-head-top">
          <span className="rmp-type-badge" style={{ background: typeMeta.color }}>
            {typeMeta.icon} {typeMeta.label}
          </span>
          <span className="rmp-diff">{stars}</span>
          <button type="button" className="rmp-collapse" onClick={() => setExpanded((e) => !e)}>
            {expanded ? '◀' : '▶'}
          </button>
        </div>
        {expanded && (
          <>
            <div className="rmp-code">{challenge?.code}</div>
            <h2 className="rmp-title">{story?.title || challenge?.shortName || challenge?.name}</h2>
            {story?.zoneName && (
              <div className="rmp-zone">{story.zoneName} · {story.zoneSubtitle}</div>
            )}
          </>
        )}
      </div>

      {expanded && (
        <>
          <p className="rmp-story">{story?.story || challenge?.desc}</p>

          <div className="rmp-xp-bar">
            <span>🎮 Mission XP</span>
            <span className="rmp-xp-val">{earnedXp} / {maxXp}</span>
            <div className="rmp-xp-track">
              <div className="rmp-xp-fill" style={{ width: `${Math.min(100, (earnedXp / maxXp) * 100)}%` }} />
            </div>
          </div>

          <div className="rmp-stars-row">
            <span>Stars earned:</span>
            <span>{'★'.repeat(progress.stars || 0)}{'☆'.repeat(3 - (progress.stars || 0))}</span>
          </div>

          <div className="rmp-stats">
            <div className="rmp-stat"><span>🔋</span><span>{Math.round(stats.battery)}%</span></div>
            <div className="rmp-stat"><span>💎</span><span>{stats.collected || 0}</span></div>
            <div className="rmp-stat"><span>💥</span><span>{stats.collisions || 0}</span></div>
            <div className="rmp-stat"><span>📏</span><span>{stats.dist?.toFixed?.(1) || 0}m</span></div>
          </div>

          {story?.teaches?.length > 0 && (
            <div className="rmp-teaches">
              <span>Learn:</span> {story.teaches.join(' · ')}
            </div>
          )}

          {onEndMission && (
            <button type="button" className="rmp-end" onClick={onEndMission}>End Mission</button>
          )}
        </>
      )}
    </aside>
  );
}

/** Auto-dismiss coding tip popup */
export function MissionCodingTip({ concept, onDismiss }) {
  React.useEffect(() => {
    const t = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  if (!concept) return null;
  return (
    <div className="rmp-coding-tip" role="status">
      <div className="rmp-tip-label">CODING TIP</div>
      <p>{concept}</p>
      <button type="button" className="rmp-tip-dismiss" onClick={onDismiss}>Got it!</button>
    </div>
  );
}

/** Mission-specific victory overlay text */
export function MissionVictoryBanner({ winText, xp, stars }) {
  return (
    <div className="rmp-victory" aria-live="polite">
      <div className="rmp-victory-burst">✨🏆✨</div>
      <div className="rmp-victory-title">{winText || 'MISSION COMPLETE!'}</div>
      {xp > 0 && <div className="rmp-victory-xp">+{xp} XP</div>}
      {stars > 0 && <div className="rmp-victory-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>}
    </div>
  );
}
