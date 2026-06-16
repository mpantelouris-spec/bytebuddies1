/**
 * MissionStudioPanel.jsx — Game creation mission UI
 * Edit / Play / Preview modes · zone progression · systems built tracker
 */
import React, { useMemo, useState, useEffect } from 'react';
import { GAME_GENRES, ZONE_PHASES, getUnlockedSystems } from '../data/game-missions.js';
import { DesignerProgress } from '../services/game-designer-progress.js';

const STUDIO_MODES = [
  { id: 'edit',    icon: '✏️', label: 'Edit',    tip: 'Build & wire up game systems' },
  { id: 'play',    icon: '▶️', label: 'Play',    tip: 'Test your game live' },
  { id: 'preview', icon: '👁', label: 'Preview', tip: 'Watch the world without running code' },
];

export function MissionStudioPanel({
  mission,
  challenge,
  stats,
  zoneInfo,
  story,
  studioMode = 'edit',
  onModeChange,
  robotName,
  onEndMission,
  blockCount = 0,
}) {
  const [expanded, setExpanded] = useState(true);
  const [showRemix, setShowRemix] = useState(false);

  const genre = mission ? GAME_GENRES[mission.genre] : null;
  const currentZoneNum = zoneInfo?.num || 1;
  const zoneDef = mission?.zones?.find((z) => z.num === currentZoneNum);
  const totalZones = mission?.zones?.length || challenge?.zoneCount || 10;
  const isSandbox = zoneDef?.isSandbox || currentZoneNum >= 10;

  useEffect(() => {
    if (isSandbox) setShowRemix(true);
  }, [isSandbox]);

  const unlockedSystems = useMemo(
    () => getUnlockedSystems(mission, currentZoneNum),
    [mission, currentZoneNum]
  );
  const designerData = useMemo(() => DesignerProgress.get(robotName || 'Robot'), [robotName]);
  const missionProgress = mission
    ? DesignerProgress.getMissionProgress(robotName || 'Robot', mission.id)
    : { zonesCleared: [], highestZone: 0 };

  const systemsProgress = mission?.systemsBuilt?.length
    ? Math.round((unlockedSystems.length / mission.systemsBuilt.length) * 100)
    : Math.round((currentZoneNum / totalZones) * 100);

  if (!mission && !challenge?.isGameMission) return null;

  return (
    <aside className={`bb-studio-panel${expanded ? '' : ' bb-studio-collapsed'}`}>
      {/* Genre + title header */}
      <div className="bb-studio-head">
        <div className="bb-studio-head-top">
          {genre && (
            <span className="bb-studio-genre" style={{ '--genre-col': genre.color }}>
              {genre.icon} {genre.label}
            </span>
          )}
          <button type="button" className="bb-studio-collapse" onClick={() => setExpanded((e) => !e)}>
            {expanded ? '◀' : '▶'}
          </button>
        </div>
        {expanded && (
          <>
            <h2 className="bb-studio-title">{mission?.name || challenge?.name || 'Mission'}</h2>
            <p className="bb-studio-tagline">{mission?.tagline || challenge?.desc}</p>
          </>
        )}
      </div>

      {expanded && (
        <>
          {/* Edit / Play / Preview toggles */}
          <div className="bb-studio-modes">
            {STUDIO_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`bb-studio-mode${studioMode === m.id ? ' active' : ''}${isSandbox && m.id === 'edit' ? ' highlight' : ''}`}
                onClick={() => onModeChange?.(m.id)}
                title={m.tip}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Designer XP bar */}
          <div className="bb-studio-designer-xp">
            <div className="bb-studio-xp-head">
              <span>🎨 Game Designer Lv.{designerData.complexityUnlocked || 1}</span>
              <span>{designerData.designerXp || 0} XP</span>
            </div>
            <div className="bb-studio-xp-track">
              <div
                className="bb-studio-xp-fill"
                style={{ width: `${Math.min(100, ((designerData.designerXp || 0) % 500) / 5)}%` }}
              />
            </div>
            <div className="bb-studio-xp-meta">
              <span>⚙️ {designerData.systemsBuilt?.length || 0} systems</span>
              <span>✨ {designerData.creativityScore || 0} creativity</span>
            </div>
          </div>

          {/* Zone progression — 10 zones */}
          <div className="bb-studio-zones">
            <div className="bb-studio-zones-head">
              <span>Building Your Game</span>
              <span className="bb-studio-zones-count">Zone {currentZoneNum}/{totalZones}</span>
            </div>
            <div className="bb-studio-zone-track">
              {(mission?.zones || Array.from({ length: totalZones }, (_, i) => ({ num: i + 1 }))).map((z) => {
                const done = z.num < currentZoneNum || missionProgress.zonesCleared.includes(z.num);
                const active = z.num === currentZoneNum;
                const isCreate = z.phase === 'create' || z.num === 10;
                return (
                  <div
                    key={z.num}
                    className={`bb-studio-zone-dot${done ? ' done' : ''}${active ? ' active' : ''}${isCreate ? ' remix' : ''}`}
                    title={z.name || `Zone ${z.num}`}
                  >
                    {isCreate ? '🎨' : (done ? '✓' : z.num)}
                  </div>
                );
              })}
            </div>
            {zoneDef && (
              <div className="bb-studio-zone-detail" style={{ '--zone-col': genre?.color || '#7c3aed' }}>
                <div className="bb-studio-zone-phase">
                  {zoneDef.phaseMeta?.icon || '📍'} {zoneDef.phaseMeta?.label || `Zone ${currentZoneNum}`}
                </div>
                <div className="bb-studio-zone-name">{zoneDef.name}</div>
                <p className="bb-studio-zone-mechanic">{zoneDef.mechanic || story?.mechanic}</p>
                {zoneDef.codingRequired === false && (
                  <span className="bb-studio-no-code">👀 Explore first — coding starts next!</span>
                )}
                {isSandbox && (
                  <div className="bb-studio-remix-banner">
                    🎨 REMIX MODE — Redesign rules, layout & mechanics!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Systems complexity tracker */}
          <div className="bb-studio-systems">
            <div className="bb-studio-systems-head">
              <span>Systems Built</span>
              <span>{systemsProgress}%</span>
            </div>
            <div className="bb-studio-systems-track">
              <div className="bb-studio-systems-fill" style={{ width: `${systemsProgress}%` }} />
            </div>
            <div className="bb-studio-systems-chips">
              {(mission?.systemsBuilt || unlockedSystems).map((sys) => {
                const unlocked = unlockedSystems.includes(sys);
                return (
                  <span key={sys} className={`bb-studio-sys-chip${unlocked ? ' unlocked' : ''}`}>
                    {unlocked ? '✓' : '○'} {sys.replace(/_/g, ' ')}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Live stats */}
          <div className="bb-studio-stats">
            <div className="bb-studio-stat">
              <span>🔋</span>
              <span>{Math.round(stats.battery)}%</span>
            </div>
            <div className="bb-studio-stat">
              <span>🧩</span>
              <span>{blockCount} blocks</span>
            </div>
            <div className="bb-studio-stat">
              <span>💎</span>
              <span>{stats.collected || 0}</span>
            </div>
            <div className="bb-studio-stat">
              <span>📍</span>
              <span>{stats.dist?.toFixed?.(0) || 0}m</span>
            </div>
          </div>

          {story?.tip && (
            <div className="bb-studio-tip">💡 {story.tip}</div>
          )}

          {onEndMission && (
            <button type="button" className="bb-studio-end" onClick={onEndMission}>
              Exit Mission
            </button>
          )}
        </>
      )}
    </aside>
  );
}

/** Zone intro overlay — Zone 1 story, no coding */
export function MissionZoneIntro({ mission, zoneNum, onDismiss }) {
  const zone = mission?.zones?.find((z) => z.num === zoneNum);
  if (!zone || zoneNum !== 1) return null;
  const genre = GAME_GENRES[mission.genre];

  return (
    <div className="bb-zone-intro">
      <div className="bb-zone-intro-card">
        <span className="bb-zone-intro-genre" style={{ '--genre-col': genre?.color }}>
          {genre?.icon} {genre?.label} Mission
        </span>
        <h2>{mission.name}</h2>
        <p className="bb-zone-intro-story">{zone.story}</p>
        <p className="bb-zone-intro-mechanic">{zone.mechanic}</p>
        <div className="bb-zone-intro-meta">
          <span>⏱ ~{mission.estMinutes} min</span>
          <span>🎮 10 zones + remix</span>
          <span>⚙️ {mission.systemsBuilt?.length || 0} systems to build</span>
        </div>
        <button type="button" className="bb-zone-intro-go" onClick={onDismiss}>
          Enter the World →
        </button>
      </div>
    </div>
  );
}

/** Remix mode unlock banner */
export function MissionRemixBanner({ mission, onEnterRemix }) {
  return (
    <div className="bb-remix-banner">
      <div className="bb-remix-inner">
        <span className="bb-remix-icon">🎨</span>
        <div>
          <strong>Zone 10 — Create Your Game!</strong>
          <p>Remix {mission?.name}: change rules, add obstacles, redesign mechanics.</p>
        </div>
        <button type="button" className="bb-remix-btn" onClick={onEnterRemix}>Start Remixing</button>
      </div>
    </div>
  );
}

export default MissionStudioPanel;
