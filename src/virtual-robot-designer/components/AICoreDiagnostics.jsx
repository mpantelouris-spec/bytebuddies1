/**
 * AICoreDiagnostics.jsx
 * Right-side floating AI Core panel — live robot brain diagnostics.
 * Values animate constantly to make the robot feel alive.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* ── Animated stat bar ──────────────────────────────────────── */
function DiagBar({ label, value, color = 'cyan', unit = '%' }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div className="aicore-diag-row">
        <span className="aicore-diag-label">{label}</span>
        <span className={`aicore-diag-value ${color}`}>{value}{unit}</span>
      </div>
      <div className="aicore-bar-track">
        <div
          className={`aicore-bar-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* ── System status item ─────────────────────────────────────── */
function SysItem({ label, status = 'online' }) {
  return (
    <div className="aicore-sys-item">
      <span className={`aicore-sys-dot ${status}`} />
      <span>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: 8, color: status === 'online' ? 'rgba(0,255,130,0.7)' : status === 'standby' ? 'rgba(251,191,36,0.7)' : 'rgba(255,80,80,0.6)' }}>
        {status === 'online' ? 'ONLINE' : status === 'standby' ? 'STANDBY' : 'OFFLINE'}
      </span>
    </div>
  );
}

/* ── Pulsing data stream ─────────────────────────────────────── */
function DataStream({ value, color = '#00d4ff' }) {
  return (
    <div style={{
      display: 'flex', gap: 2, alignItems: 'flex-end', height: 18,
    }}>
      {value.map((v, i) => (
        <div key={i} style={{
          width: 3,
          height: `${v}%`,
          background: color,
          opacity: 0.6 + v / 250,
          boxShadow: `0 0 3px ${color}`,
          transition: 'height 0.4s ease',
        }} />
      ))}
    </div>
  );
}

/* ── Compute stats from design ──────────────────────────────── */
function computeDiags(design) {
  const slots  = design?.assembly?.slots  || {};
  const base   = design?.assembly?.base   || {};
  const cosm   = design?.cosmetics        || {};

  const partCount  = Object.values(slots).filter(Boolean).length;
  const hasLidar   = slots.front?.partId === 'lidar' || slots.top?.partId === 'lidar';
  const hasCamera  = slots.head?.category === 'head';
  const hasPower   = !!slots.back;
  const movType    = slots.movement?.partId;
  const speedBase  = movType === 'jet' ? 95 : movType === 'hover' ? 82 : movType === 'standard' ? 70 : movType === 'legs' ? 48 : movType === 'tracks' ? 62 : 55;
  const powerLevel = hasPower ? 88 + Math.floor(Math.random() * 8) : 62;
  const aiLevel    = hasCamera ? 78 : 45;
  const sensors    = hasLidar ? 94 : 58;
  const integrity  = 60 + partCount * 6;

  return {
    speed:    Math.min(speedBase + partCount * 2, 99),
    power:    Math.min(powerLevel, 99),
    ai:       Math.min(aiLevel + partCount, 99),
    sensors:  Math.min(sensors, 99),
    integrity: Math.min(integrity, 99),
    partCount,
    hasLidar,
    hasCamera,
    movType: movType || 'none',
  };
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORTED COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AICoreDiagnostics({ design, stats }) {
  const [animVals, setAnimVals] = useState({
    speed: 0, power: 0, ai: 0, sensors: 0, integrity: 0,
  });
  const [stream1, setStream1] = useState(new Array(10).fill(20));
  const [stream2, setStream2] = useState(new Array(10).fill(30));
  const [tick,    setTick   ] = useState(0);
  const targetRef = useRef({});

  const diags = computeDiags(design);

  // Animate values towards target
  useEffect(() => {
    targetRef.current = diags;
  }, [diags.speed, diags.power, diags.ai, diags.sensors, diags.integrity]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimVals(prev => {
        const t = targetRef.current;
        return {
          speed:     Math.round(prev.speed     + (t.speed     - prev.speed)     * 0.12),
          power:     Math.round(prev.power     + (t.power     - prev.power)     * 0.08),
          ai:        Math.round(prev.ai        + (t.ai        - prev.ai)        * 0.1),
          sensors:   Math.round(prev.sensors   + (t.sensors   - prev.sensors)   * 0.1),
          integrity: Math.round(prev.integrity + (t.integrity - prev.integrity) * 0.06),
        };
      });

      // Animate data streams
      setStream1(prev => {
        const next = [...prev.slice(1), 20 + Math.random() * 65];
        return next;
      });
      setStream2(prev => {
        const next = [...prev.slice(1), 15 + Math.random() * 55];
        return next;
      });

      setTick(t => t + 1);
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const sysStatus = [
    { label: 'AI PROCESSOR',    status: diags.ai > 60       ? 'online'  : 'standby' },
    { label: 'POWER GRID',      status: diags.power > 50    ? 'online'  : 'standby' },
    { label: 'LIDAR ARRAY',     status: diags.hasLidar      ? 'online'  : 'offline' },
    { label: 'CAMERA SYSTEM',   status: diags.hasCamera     ? 'online'  : 'offline' },
    { label: 'MOVEMENT SYS',    status: diags.movType !== 'none' ? 'online' : 'standby' },
    { label: 'COMMS LINK',      status: 'online' },
    { label: 'TARGETING',       status: diags.hasCamera     ? 'online'  : 'standby' },
  ];

  const speedColor     = animVals.speed     > 80 ? 'green'  : 'cyan';
  const powerColor     = animVals.power     > 60 ? 'green'  : 'amber';
  const aiColor        = animVals.ai        > 70 ? 'purple' : 'cyan';
  const sensorsColor   = animVals.sensors   > 70 ? 'cyan'   : 'orange';

  return (
    <div className="holo-aicore-panel anim-right">
      {/* Header */}
      <div className="holo-panel">
        <span className="holo-corner-tl" />
        <span className="holo-corner-br" />
        <div className="holo-panel-inner aicore-header">
          <div>
            <span className="aicore-status-dot" />
            <span className="aicore-title">AI CORE</span>
          </div>
          <div className="aicore-subtitle">DIAGNOSTIC SYSTEM v4.2</div>
        </div>
      </div>

      {/* Main stats bars */}
      <div className="holo-panel">
        <span className="holo-corner-tl" />
        <span className="holo-corner-br" />
        <div className="holo-panel-inner aicore-diag">
          <DiagBar label="SPEED"     value={animVals.speed}     color={speedColor}   />
          <DiagBar label="POWER"     value={animVals.power}     color={powerColor}   />
          <DiagBar label="AI CORE"   value={animVals.ai}        color={aiColor}      />
          <DiagBar label="SENSORS"   value={animVals.sensors}   color={sensorsColor} />
          <DiagBar label="INTEGRITY" value={animVals.integrity} color="cyan"         />
        </div>
      </div>

      {/* Live data streams */}
      <div className="holo-panel">
        <span className="holo-corner-tl" />
        <span className="holo-corner-br" />
        <div className="holo-panel-inner" style={{ padding: '8px 12px' }}>
          <div className="holo-label" style={{ padding: '0 0 5px' }}>NEURAL ACTIVITY</div>
          <DataStream value={stream1} color="#00d4ff" />
          <div style={{ marginTop: 4 }}>
            <DataStream value={stream2} color="#a855f7" />
          </div>
        </div>
      </div>

      {/* Numeric stat cells */}
      <div className="holo-panel">
        <span className="holo-corner-tl" />
        <span className="holo-corner-br" />
        <div className="holo-panel-inner aicore-stats">
          <div className="aicore-stat-cell">
            <span className="aicore-stat-val">{diags.partCount}</span>
            <div className="aicore-stat-label">Modules</div>
          </div>
          <div className="aicore-stat-cell">
            <span className="aicore-stat-val" style={{ color: '#a855f7', textShadow: '0 0 10px rgba(168,85,247,0.5)' }}>
              {animVals.ai}
            </span>
            <div className="aicore-stat-label">AI Score</div>
          </div>
          <div className="aicore-stat-cell">
            <span className="aicore-stat-val" style={{ color: '#00ff82', textShadow: '0 0 10px rgba(0,255,130,0.5)' }}>
              {animVals.speed}
            </span>
            <div className="aicore-stat-label">Speed</div>
          </div>
          <div className="aicore-stat-cell">
            <span className="aicore-stat-val" style={{ color: '#fbbf24' }}>
              {animVals.power}
            </span>
            <div className="aicore-stat-label">Power</div>
          </div>
        </div>
      </div>

      {/* System status list */}
      <div className="holo-panel">
        <span className="holo-corner-tl" />
        <span className="holo-corner-br" />
        <div className="holo-panel-inner aicore-sys-list">
          <div className="holo-label" style={{ padding: '0 0 4px' }}>SYSTEM STATUS</div>
          {sysStatus.map((s, i) => (
            <SysItem key={i} label={s.label} status={s.status} />
          ))}
        </div>
      </div>

      {/* Movement system display */}
      <div className="holo-panel">
        <span className="holo-corner-tl" />
        <span className="holo-corner-br" />
        <div className="holo-panel-inner" style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="aicore-diag-label">DRIVE SYSTEM</span>
            <span className="aicore-diag-value cyan" style={{ fontSize: 10 }}>
              {(diags.movType || 'NONE').toUpperCase()}
            </span>
          </div>
          <div style={{ marginTop: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="aicore-diag-label">BATTERY</span>
            <span className="aicore-diag-value" style={{ color: '#fbbf24', fontSize: 10 }}>
              {animVals.power}%
            </span>
          </div>
          <div style={{ marginTop: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="aicore-diag-label">UPTIME</span>
            <span className="aicore-diag-value green" style={{ fontSize: 10 }}>
              {String(Math.floor(Math.floor(tick * 0.18) / 60)).padStart(2, '0')}:{String(Math.floor(tick * 0.18) % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
