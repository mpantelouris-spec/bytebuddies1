/**
 * RacingHUD.jsx — Mario Kart-style racing HUD with live objectives panel.
 */
import React, { useState, useEffect, useRef } from 'react';
import { RacingMinimap } from './RacingMinimap.jsx';
import { CODERACER_HUD_CONFIG } from './CodeRacerHUDConfig.js';

const HUD = CODERACER_HUD_CONFIG;

const THEMES = {
  rainbow_road: {
    accent: '#ff44cc',
    speedStroke: '#ff8800',
    pillBg: 'rgba(8,4,24,0.78)',
    pillBorder: 'rgba(180,100,255,0.45)',
  },
  sunny_circuit: {
    accent: '#ff88cc',
    speedStroke: '#ff6699',
    pillBg: 'rgba(255,240,250,0.88)',
    pillBorder: 'rgba(255,120,180,0.55)',
  },
  dragon_skyway: {
    accent: '#ff8866',
    speedStroke: '#ffaa44',
    pillBg: 'rgba(12,24,48,0.82)',
    pillBorder: 'rgba(100,160,255,0.4)',
  },
  volcano_drift: {
    accent: '#ff5500',
    speedStroke: '#ffaa00',
    pillBg: 'rgba(40,16,8,0.82)',
    pillBorder: 'rgba(255,100,40,0.5)',
  },
  default: {
    accent: '#ef4444',
    speedStroke: '#fbbf24',
    pillBg: 'rgba(8,12,24,0.82)',
    pillBorder: 'rgba(255,255,255,0.15)',
  },
};

const POWERUP_META = {
  speed:  { icon: '⚡', label: 'Speed Boost' },
  shield: { icon: '🛡️', label: 'Shield' },
  magnet: { icon: '🧲', label: 'Magnet' },
  star:   { icon: '⭐', label: 'Star Power' },
};

function formatRaceTime(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '00:00.0';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

function ordinalPlace(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function RaceNotification({ message }) {
  if (!message) return null;
  const nc = HUD.notificationCenter;
  return (
    <div
      className="rc-hud-notify rc-hud-notify--show"
      role="status"
      style={{
        fontSize: nc.fontSize,
        color: nc.textColor,
        background: nc.backgroundColor,
        borderRadius: nc.borderRadius,
        padding: `${nc.padding[0]}px ${nc.padding[1]}px`,
      }}
    >
      {message}
    </div>
  );
}

function MinimalRaceHUD({
  stats, challenge, theme, t, lap, totalLaps, isFinalLap, timeStr,
  racePosition, speed, speedPct, arcFill, arcColor, arcTotal, boostColor, textCol,
  atGrid, countdown, POWERUP_META,
}) {
  const powerTypes = ['speed', 'shield', 'magnet'].slice(0, HUD.powerUpInventory.maxVisible);
  return (
    <>
      {atGrid && (
        <div className="rc-hud-ready rc-hud-ready--minimal" style={{ borderColor: t.pillBorder, background: t.pillBg, color: t.accent }}>
          {countdown > 0 ? `${countdown}…` : '🏁 READY — ↑/W to drive'}
        </div>
      )}

      <div className="rc-minimal-lap-badge" style={{ background: HUD.lapDisplay.backgroundColor, borderColor: t.pillBorder }}>
        <span>LAP</span>
        <strong>{lap}/{totalLaps}</strong>
      </div>
      <div className="rc-minimal-position-badge" style={{ background: HUD.positionDisplay.backgroundColor, borderColor: t.pillBorder }}>
        <strong>{ordinalPlace(racePosition).toUpperCase()}</strong>
      </div>
      <div className="rc-minimal-time-badge">
        {timeStr}
      </div>

      <div
        className="rc-hud-powertray rc-hud-powertray--minimal"
        style={{
          display: 'none',
          bottom: HUD.powerUpInventory.offset[1],
          right: HUD.powerUpInventory.offset[0],
          gap: HUD.powerUpInventory.spacing,
          padding: `${HUD.powerUpInventory.padding[0]}px ${HUD.powerUpInventory.padding[1]}px`,
          background: HUD.powerUpInventory.backgroundColor,
          borderRadius: HUD.powerUpInventory.borderRadius,
          opacity: HUD.powerUpInventory.opacity,
        }}
      >
        {powerTypes.map((type) => {
          const meta = POWERUP_META[type];
          const count = stats.racePowerups?.[type] || 0;
          const activeNow = (type === 'speed' && stats.raceBoostActive)
            || (type === 'magnet' && stats.raceMagnetActive)
            || (type === 'shield' && (stats.raceShieldCount || 0) > 0);
          return (
            <div
              key={type}
              className={`rc-power-chip rc-power-chip--mini${activeNow ? ' rc-power-chip-on' : ''}`}
              style={{
                width: HUD.powerUpInventory.iconSize,
                height: HUD.powerUpInventory.iconSize,
                minWidth: HUD.powerUpInventory.iconSize,
                background: activeNow ? `color-mix(in srgb, ${t.accent} 25%, rgba(0,0,0,0.4))` : 'rgba(0,0,0,0.4)',
                borderColor: activeNow ? t.accent : 'rgba(255,255,255,0.2)',
                color: textCol,
              }}
              title={meta.label}
            >
              <span className="rc-power-icon">{meta.icon}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** Live in-race objectives checklist panel. */
function RaceObjectivesPanel({ objectives, stats, theme }) {
  const t = THEMES[theme] || THEMES.default;
  const isLight = theme === 'sunny_circuit';
  const textCol = isLight ? '#1a0a2e' : '#ffffff';
  const mutedCol = isLight ? 'rgba(30,10,60,0.5)' : 'rgba(255,255,255,0.45)';

  // Track which objectives just completed so we can animate them
  const prevDoneRef = useRef({});
  const [justDone, setJustDone] = useState({});

  useEffect(() => {
    const newJustDone = {};
    let changed = false;
    for (const obj of objectives) {
      const val = obj.get(stats);
      const done = val >= obj.target;
      if (done && !prevDoneRef.current[obj.id]) {
        newJustDone[obj.id] = true;
        changed = true;
      }
    }
    if (changed) {
      // Build new prev state
      const newPrev = {};
      for (const obj of objectives) {
        newPrev[obj.id] = obj.get(stats) >= obj.target;
      }
      prevDoneRef.current = newPrev;
      setJustDone(newJustDone);
      setTimeout(() => setJustDone({}), 1400);
    } else {
      // Keep prev state updated silently
      const newPrev = {};
      for (const obj of objectives) {
        newPrev[obj.id] = obj.get(stats) >= obj.target;
      }
      prevDoneRef.current = newPrev;
    }
  });

  const doneCount = objectives.filter((o) => o.get(stats) >= o.target).length;

  return (
    <div className="rc-objectives-panel" style={{
      background: t.pillBg,
      borderColor: t.pillBorder,
    }}>
      <div className="rc-obj-header" style={{ color: t.accent }}>
        <span className="rc-obj-title-icon">🎮</span>
        <span className="rc-obj-title">OBJECTIVES</span>
        <span className="rc-obj-count" style={{ background: t.accent, color: '#000' }}>
          {doneCount}/{objectives.length}
        </span>
      </div>
      <div className="rc-obj-list">
        {objectives.map((obj) => {
          const val = obj.get(stats);
          const done = val >= obj.target;
          const pct = Math.min(100, (val / obj.target) * 100);
          const flash = justDone[obj.id];
          return (
            <div
              key={obj.id}
              className={`rc-obj-item${done ? ' rc-obj-done' : ''}${flash ? ' rc-obj-flash' : ''}`}
            >
              <span className="rc-obj-icon">{obj.icon}</span>
              <div className="rc-obj-body">
                <div className="rc-obj-label" style={{ color: done ? '#4ade80' : textCol }}>
                  {obj.label}
                </div>
                {!done && obj.target > 1 && (
                  <div className="rc-obj-bar-wrap">
                    <div
                      className="rc-obj-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: t.accent,
                        boxShadow: `0 0 6px ${t.accent}88`,
                      }}
                    />
                  </div>
                )}
                {!done && obj.target > 1 && (
                  <div className="rc-obj-progress" style={{ color: mutedCol }}>
                    {val} / {obj.target}
                  </div>
                )}
              </div>
              <div className="rc-obj-check">
                {done ? (
                  <span className="rc-obj-check-yes" style={{ color: '#4ade80', filter: flash ? 'drop-shadow(0 0 8px #4ade80)' : undefined }}>
                    ✓
                  </span>
                ) : (
                  <span className="rc-obj-check-no" style={{ color: mutedCol }}>○</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RacingHUD({ stats, challenge, theme = 'default', onRestart, hideMinimap = false, minimal = false }) {
  const baseTheme = THEMES[theme] || THEMES.default;
  const t = challenge?.color
    ? { ...baseTheme, accent: challenge.color, speedStroke: challenge.color }
    : baseTheme;
  const isLight = theme === 'sunny_circuit';
  const primaryRally = challenge?.isPrimaryMission && challenge?.modeIndex === 10;
  const lap = stats.raceLap || 1;
  const totalLaps = stats.raceTotalLaps || (primaryRally ? 3 : (challenge?.laps || challenge?.racing?.laps || 1));
  const isFinalLap = lap >= totalLaps;
  const cp = stats.raceCheckpoint ?? 0;
  const cpTotal = stats.raceCheckpointsTotal ?? challenge?.checkpoints ?? challenge?.racing?.checkpointCount ?? 4;
  const speed = stats.raceSpeedKmh != null ? Math.round(stats.raceSpeedKmh) : 0;
  const maxSpeed = 180;
  const speedPct = Math.min(100, (speed / maxSpeed) * 100);
  const arcTotal = 198;
  const arcFill = (speedPct / 100) * arcTotal;
  const timeStr = stats.raceLapTimeStr || formatRaceTime(stats.raceLapTime ?? stats.time);
  const racePosition = stats.racePosition ?? 1;
  const raceTotalRacers = stats.raceTotalRacers ?? (primaryRally ? 4 : 1);
  const atGrid = (stats.raceSpeedKmh ?? 0) < 8 && ((stats.raceLapTime ?? stats.time ?? 0) < 0.35 || stats.raceCountdown > 0);
  const countdown = stats.raceCountdown > 0 ? Math.ceil(stats.raceCountdown) : 0;
  const textCol = isLight ? '#1a0a2e' : '#ffffff';
  const mutedCol = isLight ? 'rgba(30,10,60,0.6)' : 'rgba(255,255,255,0.5)';
  const boostColor = '#00e5ff';
  const arcColor = stats.raceBoostActive ? boostColor : (speedPct > 80 ? '#ff4444' : speedPct > 50 ? '#ffaa00' : '#22c55e');

  const prevCpRef = useRef(cp);
  const prevLapRef = useRef(lap);
  const prevBoostRef = useRef(false);
  const prevCollisionsRef = useRef(stats.collisions ?? 0);
  const [notifyMsg, setNotifyMsg] = useState('');
  const notifyTimerRef = useRef(null);

  const flashNotify = (key) => {
    const msg = HUD.notificationCenter.messages[key];
    if (!msg) return;
    setNotifyMsg(msg);
    clearTimeout(notifyTimerRef.current);
    notifyTimerRef.current = setTimeout(
      () => setNotifyMsg(''),
      HUD.notificationCenter.displayTime,
    );
  };

  useEffect(() => {
    if (!minimal) return;
    if (cp > prevCpRef.current && cp > 0) flashNotify('checkpoint_reached');
    if (lap > prevLapRef.current && prevLapRef.current > 0) {
      setNotifyMsg(`Lap ${lap}! 🏁`);
      clearTimeout(notifyTimerRef.current);
      notifyTimerRef.current = setTimeout(() => setNotifyMsg(''), HUD.notificationCenter.displayTime);
    }
    if (stats.raceBoostActive && !prevBoostRef.current) flashNotify('boost_activated');
    if ((stats.collisions ?? 0) > prevCollisionsRef.current) flashNotify('collision');
    if (stats.done && stats.progress >= 100) flashNotify('mission_complete');
    prevCpRef.current = cp;
    prevLapRef.current = lap;
    prevBoostRef.current = !!stats.raceBoostActive;
    prevCollisionsRef.current = stats.collisions ?? 0;
  }, [cp, lap, minimal, stats.raceBoostActive, stats.collisions, stats.done, stats.progress]);

  useEffect(() => () => clearTimeout(notifyTimerRef.current), []);

  if (minimal) {
    return (
      <div className="rc-hud rc-hud--minimal">
        <MinimalRaceHUD
          stats={stats}
          challenge={challenge}
          theme={theme}
          t={t}
          lap={lap}
          totalLaps={totalLaps}
          isFinalLap={isFinalLap}
          timeStr={timeStr}
          racePosition={racePosition}
          speed={speed}
          speedPct={speedPct}
          arcFill={arcFill}
          arcColor={arcColor}
          arcTotal={arcTotal}
          boostColor={boostColor}
          textCol={textCol}
          atGrid={atGrid}
          countdown={countdown}
          POWERUP_META={POWERUP_META}
        />
        {!hideMinimap && (
          <RacingMinimap
            stats={stats}
            challenge={challenge}
            arenaType={challenge?.arenaType}
            themeAccent={t.accent}
            pillBg={t.pillBg}
            pillBorder={t.pillBorder}
            className="rc-minimap--coderacer"
          />
        )}
        <RaceNotification message={notifyMsg} />
        {stats.raceOptimizeHint && (
          <div className="rc-hud-hint rc-hud-hint--minimal">{stats.raceOptimizeHint}</div>
        )}
        {stats.raceCodeHint && (
          <div className="rc-hud-hint rc-hud-hint--minimal">{stats.raceCodeHint}</div>
        )}
        {stats.raceOffTrack && <div className="rc-hud-warn rc-hud-warn--minimal">⚠ Off track!</div>}
        {stats.raceWrongWay && <div className="rc-hud-warn rc-hud-warn--minimal">⚠ Wrong way</div>}
      </div>
    );
  }

  return (
    <>
      {atGrid && (
        <div className="rc-hud-ready" style={{ borderColor: t.pillBorder, background: t.pillBg, color: t.accent }}>
          {countdown > 0 ? `${countdown}…` : '🏁 READY — START LINE'}
        </div>
      )}
      {/* ── Top HUD bar — LAP / TIME / POSITION ───────────────── */}
      <div className="rc-hud-topbar">
        <div className="rc-hud-pill rc-pill-lap" style={{ background: t.pillBg, borderColor: t.pillBorder }}>
          <span className="rc-pill-lbl" style={{ color: mutedCol }}>
            {isFinalLap ? '🏁 FINAL LAP' : '🏁 LAP'}
          </span>
          <strong className="rc-pill-val" style={{ color: isFinalLap ? '#ff4444' : t.accent }}>
            {lap} / {totalLaps}
          </strong>
        </div>

        <div className="rc-hud-pill" style={{ background: t.pillBg, borderColor: t.pillBorder }}>
          <span className="rc-pill-lbl" style={{ color: mutedCol }}>TIME</span>
          <strong className="rc-pill-val" style={{ color: textCol }}>{timeStr}</strong>
        </div>

        <div className="rc-hud-pill" style={{ background: t.pillBg, borderColor: t.pillBorder }}>
          <span className="rc-pill-lbl" style={{ color: mutedCol }}>POSITION</span>
          <strong className="rc-pill-val" style={{ color: textCol }}>
            {racePosition} / {raceTotalRacers}
          </strong>
        </div>

        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            style={{
              background: t.pillBg,
              border: `1px solid ${t.pillBorder}`,
              borderRadius: 14,
              color: textCol,
              fontSize: 13,
              fontWeight: 700,
              padding: '6px 14px',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              letterSpacing: '0.03em',
            }}
            title="Restart race — puts car back at the start"
          >
            ↩ Restart
          </button>
        )}
      </div>

      {stats.raceWrongWay && (
        <div className="rc-hud-warn">⚠ WRONG WAY!</div>
      )}
      {stats.raceFalling && (
        <div className="rc-hud-warn rc-hud-fall">☄️ FALLING INTO SPACE!</div>
      )}

      {/* ── Minimap — top right (optional; hidden in 3D CodeRacer) ── */}
      {!hideMinimap && (
        <RacingMinimap
          stats={stats}
          challenge={challenge}
          themeAccent={t.accent}
          pillBg={t.pillBg}
          pillBorder={t.pillBorder}
        />
      )}

      {/* ── Objectives panel — top left ────────────────────────── */}
      {(() => {
        const raceObjs = (stats.raceObjectives || challenge?.objectives || []).filter((o) => o && typeof o.get === 'function');
        if (!raceObjs.length) return null;
        return (
          <RaceObjectivesPanel
            objectives={raceObjs}
            stats={stats}
            theme={theme}
          />
        );
      })()}

      {/* ── Speedometer — bottom right ────────────────────────── */}
      <div className="rc-hud-speedo-br" style={{ borderColor: t.pillBorder, background: t.pillBg }}>
        {stats.raceBoostActive && (
          <div className="rc-hud-boost-br" style={{ color: boostColor }}>⚡ BOOST</div>
        )}
        <svg viewBox="0 0 120 120" className="rc-speedo-svg">
          {/* Outer glow ring */}
          <circle cx="60" cy="60" r="54" fill="none"
            stroke={t.accent} strokeWidth="1" opacity="0.15" />
          {/* Track arc (270°, from 135° to 405°/45°) */}
          <circle cx="60" cy="60" r="50" fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="10"
            strokeDasharray={`${arcTotal} ${264 - arcTotal}`}
            strokeLinecap="round"
            transform="rotate(135 60 60)" />
          {/* Speed arc — colour based on speed */}
          <circle cx="60" cy="60" r="50" fill="none"
            stroke={arcColor} strokeWidth="10"
            strokeDasharray={`${arcFill} ${264 - arcFill}`}
            strokeLinecap="round"
            transform="rotate(135 60 60)"
            style={{ filter: `drop-shadow(0 0 6px ${arcColor})`, transition: 'stroke-dasharray 0.15s' }} />
          {/* Tick marks */}
          {[0,0.25,0.5,0.75,1].map((f, i) => {
            const angle = (135 + f * 270) * Math.PI / 180;
            const r1 = 42, r2 = 38;
            return <line key={i}
              x1={60 + r1 * Math.cos(angle)} y1={60 + r1 * Math.sin(angle)}
              x2={60 + r2 * Math.cos(angle)} y2={60 + r2 * Math.sin(angle)}
              stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />;
          })}
        </svg>
        <div className="rc-speedo-inner">
          <div className="rc-speedo-val" style={{ color: textCol }}>{speed}</div>
          <div className="rc-speedo-unit" style={{ color: mutedCol }}>KM/H</div>
        </div>
      </div>

      {/* ── Power-up tray — bottom centre ────────────────────── */}
      <div className="rc-hud-powertray">
        {Object.entries(POWERUP_META).map(([type, meta]) => {
          const count = stats.racePowerups?.[type] || 0;
          const activeNow = (type === 'speed' && stats.raceBoostActive)
            || (type === 'magnet' && stats.raceMagnetActive)
            || (type === 'shield' && (stats.raceShieldCount || 0) > 0);
          return (
            <div key={type}
              className={`rc-power-chip${activeNow ? ' rc-power-chip-on' : ''}`}
              style={{
                background: activeNow
                  ? `color-mix(in srgb, ${t.accent} 20%, ${t.pillBg})`
                  : t.pillBg,
                borderColor: activeNow ? t.accent : t.pillBorder,
                color: textCol,
                boxShadow: activeNow ? `0 0 12px ${t.accent}88` : undefined,
              }}
              title={meta.label}>
              <span className="rc-power-icon">{meta.icon}</span>
              <span className="rc-power-count">{count}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default RacingHUD;
