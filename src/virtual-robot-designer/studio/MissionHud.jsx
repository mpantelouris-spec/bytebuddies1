/**
 * MissionHud — Bible v2 Part 0: mission title, objective, timer, star tiers, minimap, gauges.
 */
import React from 'react';
import { getSecurityBotArena } from '../data/securitybot-arenas.js';

function objectiveFromChallenge(challenge) {
  const gp = challenge?.modeSpec?.gameplayDescription || '';
  const m = gp.match(/Objective:\s*([^.]+)/i);
  if (m) return m[1].trim();
  if (challenge?.primaryObjective?.label) return challenge.primaryObjective.label;
  if (challenge?.tagline) return challenge.tagline;
  if (challenge?.desc) return challenge.desc.slice(0, 72);
  if (challenge?.story) return challenge.story.slice(0, 72);
  return 'Reach the green goal';
}

function starsFromChallenge(challenge) {
  if (challenge?.starRequirements || challenge?.modeSpec?.quickInfo?.stars) {
    return challenge?.starRequirements || challenge?.modeSpec?.quickInfo?.stars;
  }
  if (challenge?.medals) {
    return { one: challenge.medals.bronze || 'Complete', two: challenge.medals.silver || 'Fast', three: challenge.medals.gold || 'Perfect' };
  }
  return null;
}

function showElevationGauge(challenge) {
  const genre = challenge?.genre || challenge?.modeSpec?.genre || '';
  const physics = challenge?.physics || '';
  return /climb|aerial|flight|sky|spider/i.test(`${genre} ${physics} ${challenge?.cat || ''}`);
}

function showSpeedGauge(challenge) {
  const genre = challenge?.genre || challenge?.modeSpec?.genre || '';
  return /racing|race|speed|aerial|flight|rescue/i.test(`${genre} ${challenge?.cat || ''}`);
}

function MissionMinimap({ minimap, robotX, robotZ, accent, checkpointsHit = 0 }) {
  if (!minimap?.points?.length) return null;
  const bounds = minimap.bounds || {};
  const minZ = bounds.camMinZ ?? -40;
  const maxZ = bounds.camMaxZ ?? 12;
  const maxX = bounds.camMaxX ?? 24;
  const w = 88;
  const h = 64;
  const mapX = (x) => ((x + maxX) / (maxX * 2)) * w;
  const mapZ = (z) => ((z - minZ) / (maxZ - minZ)) * h;
  const routeD = minimap.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x).toFixed(1)} ${mapZ(p.z).toFixed(1)}`).join(' ');
  const rx = robotX != null ? mapX(robotX) : null;
  const rz = robotZ != null ? mapZ(robotZ) : null;

  return (
    <div className="mission-hud-minimap" aria-label="Route minimap">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img">
        <rect x="0" y="0" width={w} height={h} rx="8" fill="rgba(8,12,24,0.85)" />
        <path d={routeD} fill="none" stroke={`${accent}88`} strokeWidth="2.5" strokeLinecap="round" />
        {(minimap.checkpoints || []).map((cp, i) => (
          <circle
            key={i}
            cx={mapX(cp.x)}
            cy={mapZ(cp.z)}
            r="3"
            fill={i < checkpointsHit ? '#22c55e' : '#64748b'}
            stroke="#fff"
            strokeWidth="0.5"
          />
        ))}
        {rx != null && rz != null && (
          <circle cx={rx} cy={rz} r="4.5" fill={accent} stroke="#fff" strokeWidth="1.2" />
        )}
      </svg>
    </div>
  );
}

export function MissionHud({ challenge, stats = {}, runMode = 'idle', minimal = false }) {
  const isMission = challenge?.isChassisMode || challenge?.isRobotMission;
  if (!isMission) return null;
  const active = runMode === 'running' || runMode === 'step' || runMode === 'paused';
  if (!active && !minimal) return null;

  const modeN = challenge.modeIndex || challenge.modeSpec?.modeNumber;
  const capstone = modeN === 10;
  const title = challenge.shortName || challenge.name || challenge.modeSpec?.modeName || 'Robot Mission';
  const securityArena = !challenge.arenaBible && challenge.chassisId === 'securitybot' ? getSecurityBotArena(modeN) : null;
  const env = securityArena?.title
    || challenge.environmentName
    || challenge.modeSpec?.environmentName
    || challenge.zoneName
    || 'Mission';
  const objective = objectiveFromChallenge(challenge);
  const stars = starsFromChallenge(challenge);
  const timeSec = Math.floor(stats.time || 0);
  const mins = String(Math.floor(timeSec / 60)).padStart(2, '0');
  const secs = String(timeSec % 60).padStart(2, '0');
  const collected = stats.collected || 0;
  const progress = Math.round((stats.progress || 0) * 100);
  const accent = challenge.color || '#38bdf8';
  const modeLabel = challenge.isRobotMission
    ? (challenge.missionType || 'Campaign')
    : `Mode ${modeN || 1}/10${capstone ? ' ★' : ''}`;
  const cpHit = stats.missionCheckpoint || 0;
  const cpTotal = stats.missionCheckpointsTotal || challenge.checkpoints || 0;
  const speed = stats.missionSpeed || 0;
  const elevation = stats.missionElevation || 0;
  const showMinimap = stats.missionMinimap?.points?.length > 0;
  const showCp = cpTotal > 0;
  const showSpeed = showSpeedGauge(challenge);
  const showElev = showElevationGauge(challenge);
  const paused = runMode === 'paused';

  return (
    <div className="mission-hud" aria-live="polite">
      {paused && stars && (
        <div className="mission-hud-pause" style={{ borderColor: `${accent}55` }}>
          <div className="mission-hud-pause-title">⏸ PAUSED — Star targets</div>
          <div className="mission-hud-stars mission-hud-stars-pause">
            <span>⭐ {stars.one}</span>
            <span>⭐⭐ {stars.two}</span>
            <span>⭐⭐⭐ {stars.three}</span>
          </div>
        </div>
      )}
      <div className="mission-hud-bar" style={{ borderColor: `${accent}55` }}>
        <div className="mission-hud-top">
          <span className="mission-hud-env">
            {challenge.environmentEmoji || '🎮'} {env} · {modeLabel}
          </span>
          <span className="mission-hud-timer">{mins}:{secs}</span>
        </div>
        <div className="mission-hud-title">{title}</div>
        <div className="mission-hud-objective">OBJECTIVE: {objective}</div>
        {stars && (
          <div className="mission-hud-stars">
            <span>⭐ {stars.one}</span>
            <span>⭐⭐ {stars.two}</span>
            <span>⭐⭐⭐ {stars.three}</span>
          </div>
        )}
        <div className="mission-hud-stats">
          {showCp && <span>🚩 {cpHit}/{cpTotal}</span>}
          {progress > 0 && <span>{progress}% route</span>}
          {collected > 0 && <span>{collected} collected</span>}
          {stats.collisions > 0 && <span>{stats.collisions} bumps</span>}
        </div>
        {(showSpeed || showElev) && (
          <div className="mission-hud-gauges">
            {showSpeed && (
              <div className="mission-hud-gauge">
                <span className="mission-hud-gauge-label">SPD</span>
                <div className="mission-hud-gauge-track">
                  <div
                    className="mission-hud-gauge-fill"
                    style={{ width: `${Math.min(100, speed * 12)}%`, background: accent }}
                  />
                </div>
                <span className="mission-hud-gauge-val">{speed.toFixed(1)}</span>
              </div>
            )}
            {showElev && (
              <div className="mission-hud-gauge">
                <span className="mission-hud-gauge-label">ALT</span>
                <div className="mission-hud-gauge-track">
                  <div
                    className="mission-hud-gauge-fill"
                    style={{ width: `${Math.min(100, Math.max(0, elevation) * 18)}%`, background: '#a855f7' }}
                  />
                </div>
                <span className="mission-hud-gauge-val">{elevation.toFixed(1)}m</span>
              </div>
            )}
          </div>
        )}
      </div>
      {showMinimap && (
        <MissionMinimap
          minimap={stats.missionMinimap}
          robotX={stats.missionRobotX}
          robotZ={stats.missionRobotZ}
          accent={accent}
          checkpointsHit={cpHit}
        />
      )}
    </div>
  );
}
