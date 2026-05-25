import React from 'react';
import { motion } from 'framer-motion';
import { migrateDesign } from '../../config.js';
import { migrateAssembly } from '../../services/assembly-service.js';
import { getWorkshopPart } from '../../data/assembly-parts.js';
import { detectRobotArchetype } from '../../services/robot-archetypes.js';
import AnimatedNumber from '../AnimatedNumber.jsx';
import { statBarColor } from '../../hooks/useRobotStats.js';

function StatBar({ label, value, color, icon }) {
  const pct = Math.max(0, Math.min(100, value));
  const barColor = color || statBarColor(pct);
  return (
    <motion.div
      className="bb-stat-row"
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="bb-stat-row-head">
        <span>{icon} {label}</span>
        <strong>
          <AnimatedNumber value={pct} suffix="%" />
        </strong>
      </div>
      <div className="bb-stat-bar">
        <motion.div
          className="bb-stat-bar-fill"
          style={{ background: barColor, color: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </motion.div>
  );
}

export default function AcademyStatusPanel({
  stats,
  design,
  onTest,
  onCalibrate,
  onReset,
  onSave,
  onLoad,
}) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const attached = Object.entries(asm.slots || {})
    .filter(([, v]) => v)
    .map(([slot, v]) => {
      const meta = getWorkshopPart(v.category, v.partId);
      return { slot, label: meta?.label || v.partId, icon: meta?.icon || '◆' };
    });

  const sensorsOn = Object.entries(d.sensors || {}).filter(([, on]) => on);
  const archetype = detectRobotArchetype(d);
  const placedCount = attached.length;
  const sensorPct = Math.min(100, sensorsOn.length * 22 + attached.length * 8);

  return (
    <aside className="bb-status-panel">
      <div className="bb-status-header">
        <h2>Your Invention</h2>
        <motion.span
          className="bb-status-badge ok"
          key={placedCount}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          {placedCount ? '✅ Modules active' : '◻ Empty canvas'}
        </motion.span>
      </div>

      <motion.div
        className="bb-archetype-card"
        layout
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <span className="bb-archetype-icon" aria-hidden>{archetype.icon}</span>
        <div>
          <strong>{archetype.label}</strong>
          <p className="bb-archetype-missions">
            Missions: {archetype.missions.slice(0, 2).join(' · ')}
          </p>
        </div>
      </motion.div>

      <div className="bb-status-hero-card">
        <div className="bb-status-thumb" aria-hidden>{archetype.icon}</div>
        <div>
          <strong>{d.name || 'My Invention'}</strong>
          <p>{placedCount} modules · {sensorsOn.length} sensors active</p>
        </div>
      </div>

      <StatBar label="Power" value={stats.battery} color={statBarColor(stats.battery)} icon="🔋" />
      <StatBar label="Speed" value={stats.speed} color={statBarColor(stats.speed, 50, 25)} icon="⚡" />
      <StatBar label="Sensors" value={sensorPct} color="#1E90FF" icon="📡" />
      <StatBar label="Durability" value={stats.stability} color={statBarColor(stats.stability, 55, 30)} icon="🛡️" />

      {attached.length > 0 && (
        <div className="bb-status-modules">
          <span className="bb-status-modules-title">Modules attached</span>
          <ul>
            {attached.map((m, i) => (
              <motion.li
                key={m.slot}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                ✓ {m.icon} {m.label}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className="bb-status-actions">
        <motion.button
          type="button"
          className="bb-action-btn bb-action-btn--primary"
          onClick={onTest}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          ▶ Test in Simulator
        </motion.button>
        <button type="button" className="bb-action-btn bb-action-btn--warn" onClick={onCalibrate}>
          ⚙️ Calibrate Robot
        </button>
        <button type="button" className="bb-action-btn bb-action-btn--danger" onClick={onReset}>
          ↻ Reset Robot
        </button>
        <button type="button" className="bb-action-btn bb-action-btn--ghost" onClick={onSave} aria-label="Save design">
          💾 Save Design
        </button>
        <button type="button" className="bb-action-btn bb-action-btn--ghost" onClick={onLoad} aria-label="Load saved design">
          📂 Load Design
        </button>
      </div>
    </aside>
  );
}
