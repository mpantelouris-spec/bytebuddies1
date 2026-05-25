import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HoloStat } from './HoloUI.jsx';
import AnimatedNumber from './AnimatedNumber.jsx';
import { getBalanceStatus } from '../services/design-service.js';
import { migrateDesign } from '../config.js';
import { migrateAssembly } from '../services/assembly-service.js';
import { statValueColor, statHealthLabel } from '../utils/statColors.js';

const SENSOR_LABELS = {
  camera: 'Camera',
  ultrasonic: 'Ultrasonic',
  lidar: 'LIDAR',
  thermal: 'Thermal',
  gyroscope: 'Gyroscope',
  accelerometer: 'Accelerometer',
  proximity: 'Proximity',
  collision: 'Collision',
};

function TelemetryRow({ label, value, accent, children }) {
  return (
    <div className="vrd-telemetry-row">
      <span>{label}</span>
      {children || <strong style={accent ? { color: accent } : undefined}>{value}</strong>}
    </div>
  );
}

function TelemetrySection({ title, children }) {
  return (
    <div className="vrd-telemetry-section">
      <div className="vrd-telemetry-section-title">{title}</div>
      {children}
    </div>
  );
}

export default function TelemetryHUD({
  stats,
  design,
  running = false,
  onGoCode,
  onGoSimulator,
  onSave,
  onGenerateAI,
  generating = false,
}) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const balance = getBalanceStatus(stats);
  const [tick, setTick] = useState(0);
  const health = statHealthLabel(stats.battery);
  const powerDraw = Math.round(20 + stats.power * 0.35);
  const cpuLoad = Math.round(40 + stats.speed * 0.25 + (running ? 15 : 0));
  const memUsed = Math.round(180 + stats.weight * 1.2);
  const activeSensorKeys = Object.entries(d.sensors || {}).filter(([, v]) => v).map(([k]) => k);
  const weightKg = (stats.weight / 40).toFixed(1);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="vrd-telemetry vrd-telemetry--spec">
      <div className="vrd-telemetry-header">
        <span className="vrd-telemetry-title">ROBOT STATISTICS</span>
        <span className="vrd-telemetry-pulse">{running ? 'RUN' : 'REC'}</span>
      </div>

      <div className="vrd-telemetry-robot-name">
        <span>Name:</span>
        <strong>{d.name || 'My Robot'}</strong>
      </div>

      <div className="vrd-telemetry-radar" aria-hidden>
        <div className="vrd-radar-sweep" />
        <div className="vrd-radar-grid" />
      </div>

      <TelemetrySection title="POWER SYSTEMS">
        <TelemetryRow label="Battery" accent={statValueColor(stats.battery)}>
          <AnimatedNumber value={stats.battery} suffix="%" style={{ color: statValueColor(stats.battery), fontWeight: 700 }} />
        </TelemetryRow>
        <HoloStat label="BATTERY" value={stats.battery} color={statValueColor(stats.battery)} />
        <TelemetryRow label="Power Draw" value={`${powerDraw}W`} />
        <TelemetryRow label="Runtime" value={`~${stats.runtimeHours}h`} accent="#00D9FF" />
        <TelemetryRow label="System Health" value={health.text} accent={health.color} />
      </TelemetrySection>

      <TelemetrySection title="MOVEMENT">
        <TelemetryRow label="Motor 1" value={`${Math.round(stats.power * 0.75)}% power`} />
        <TelemetryRow label="Motor 2" value={`${Math.round(stats.power * 0.75)}% power`} />
        <TelemetryRow label="Top Speed" accent="#00D9FF">
          <AnimatedNumber value={stats.topSpeedMs} decimals={1} suffix=" m/s" style={{ color: '#00D9FF', fontWeight: 700 }} />
        </TelemetryRow>
        <HoloStat label="SPEED" value={stats.speed} color={statValueColor(stats.speed)} />
        <HoloStat label="TORQUE" value={stats.power} color={statValueColor(stats.power)} />
      </TelemetrySection>

      <TelemetrySection title="WEIGHT & BALANCE">
        <TelemetryRow label="Total Weight" value={`${weightKg} kg`} />
        <TelemetryRow label="Load Capacity" value={`${stats.loadCapacity} kg`} accent="#00FF41" />
        <HoloStat label="STABILITY" value={stats.stability} color={statValueColor(stats.stability)} />
      </TelemetrySection>

      <TelemetrySection title={`SENSORS ACTIVE: ${activeSensorKeys.length}/12`}>
        {activeSensorKeys.length === 0 ? (
          <p className="vrd-hint">No sensors — enable in left panel</p>
        ) : (
          <ul className="vrd-telemetry-sensor-list">
            {activeSensorKeys.map((k) => (
              <li key={k}>✓ {SENSOR_LABELS[k] || k}</li>
            ))}
          </ul>
        )}
      </TelemetrySection>

      <TelemetrySection title="AI SYSTEMS">
        <TelemetryRow label="AI Status" value="🟢 Online" accent="#00FF41" />
        <TelemetryRow label="Behavior" value={`${asm.base?.chassisType || d.template || 'Explorer'} Mode`} />
        <TelemetryRow label="Decision Queue" value={`${3 + (tick % 4)} pending`} />
      </TelemetrySection>

      <TelemetrySection title="DIAGNOSTICS">
        <TelemetryRow label="CPU Load" value={`${cpuLoad}%`} />
        <TelemetryRow label="Memory" value={`${memUsed}MB / 512MB`} />
        <TelemetryRow label="Thermal" value={`${42 + (tick % 5)}°C`} />
        <TelemetryRow label="Errors" value="0" accent="#00FF41" />
      </TelemetrySection>

      <motion.div
        className="vrd-telemetry-status"
        style={{ borderColor: balance.color, color: balance.color }}
        animate={{ boxShadow: [`0 0 12px ${balance.color}44`, `0 0 24px ${balance.color}66`, `0 0 12px ${balance.color}44`] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {balance.label}
      </motion.div>

      <div className="vrd-telemetry-actions">
        {onGoCode && (
          <button type="button" className="vrd-telemetry-action" onClick={onGoCode}>🤖 Code Studio</button>
        )}
        {onGoSimulator && (
          <button type="button" className="vrd-telemetry-action vrd-telemetry-action--primary" onClick={onGoSimulator}>⚡ Test Simulator</button>
        )}
        {onGenerateAI && (
          <button type="button" className="vrd-telemetry-action" disabled={generating} onClick={onGenerateAI}>
            {generating ? '…' : '🤖 AI Variants'}
          </button>
        )}
        {onSave && (
          <button type="button" className="vrd-telemetry-action" onClick={onSave}>💾 Save Design</button>
        )}
      </div>

      <div className="vrd-telemetry-log">
        <motion.div className={tick % 4 === 0 ? 'active' : ''}>&gt; chassis: {asm.base?.chassisType || 'rover'}</motion.div>
        <motion.div className={tick % 4 === 1 ? 'active' : ''}>&gt; mode: {asm.buildMode || 'advanced'}</motion.div>
        <motion.div className={tick % 4 === 2 ? 'active' : ''}>&gt; blocks: {(asm.blocks || []).length}</motion.div>
      </div>
    </div>
  );
}
