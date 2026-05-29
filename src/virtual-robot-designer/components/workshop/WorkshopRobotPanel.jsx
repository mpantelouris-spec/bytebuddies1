/**
 * Right panel — live stats bars + code / test / save actions.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { migrateAssembly, listPlacedParts } from '../../services/assembly-service.js';
import { getWorkshopPart } from '../../data/assembly-parts.js';
import AnimatedNumber from '../AnimatedNumber.jsx';
import { CATALOG_PART_COUNT, CATALOG_CHASSIS_COUNT } from '../../data/modular-parts-registry.js';
import { analyzeRobot } from '../../services/robot-profile.js';

function StatBar({ icon, label, value, color, hint }) {
  return (
    <div className="iw-stat-bar">
      <div className="iw-stat-bar-head">
        <span className="iw-stat-icon">{icon}</span>
        <span className="iw-stat-label">{label}</span>
        <strong style={{ color }}>
          <AnimatedNumber value={value} suffix="%" />
        </strong>
      </div>
      <div className="iw-stat-bar-track" aria-hidden>
        <motion.div
          className="iw-stat-bar-fill"
          style={{ background: color }}
          initial={false}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
      {hint && <span className="iw-stat-hint">{hint}</span>}
    </div>
  );
}

export default function WorkshopRobotPanel({
  design,
  stats,
  onCode,
  onTest,
  onSave,
  onLoad,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  const asm = migrateAssembly(design);
  const profile = analyzeRobot(design);
  const parts = listPlacedParts(asm).map((p) => ({
    ...p,
    meta: getWorkshopPart(p.category, p.partId),
  }));
  const partCount = parts.length;
  const weightKg = (stats.weight / 10).toFixed(1);
  const efficiency = stats.efficiency ?? Math.round((stats.power / Math.max(stats.weight, 20)) * 12);
  const effLabel = efficiency >= 70 ? 'Excellent' : efficiency >= 50 ? 'Good' : 'Needs power';
  const effColor = efficiency >= 70 ? '#00C853' : efficiency >= 50 ? '#1E90FF' : '#f59e0b';

  return (
    <aside className="iw-robot-panel" aria-label="Your robot">
      <header className="iw-panel-head">
        <span className="iw-panel-mascot" aria-hidden>🤖</span>
        <div>
          <h2>Your Robot</h2>
          <p>
            {partCount ? `${partCount} parts attached` : 'Drag parts onto green sockets'}
            {' · '}
            {CATALOG_PART_COUNT}+ parts · {CATALOG_CHASSIS_COUNT} bodies
            {' · '}
            {profile.archetype.icon} {profile.arenaLabel}
          </p>
          <p className="iw-profile-hint">{profile.recommend}</p>
        </div>
      </header>

      <div className="iw-stat-bars">
        <StatBar icon="⚡" label="Speed" value={stats.speed} color="#1E90FF" hint={`${stats.topSpeedMs} m/s top`} />
        <StatBar icon="🔋" label="Power" value={stats.power} color="#00C853" hint={`${stats.runtimeHours}h runtime est.`} />
        <StatBar icon="🛡️" label="Durability" value={stats.stability} color="#8B5CF6" />
        <StatBar icon="⚖️" label="Efficiency" value={efficiency} color={effColor} hint={effLabel} />
      </div>

      <div className="iw-stat-meta">
        <span>Weight <strong>{weightKg} kg</strong></span>
        <span>Battery <strong>{stats.battery}%</strong></span>
        <span>Sensors <strong>{stats.sensorCount}</strong></span>
      </div>

      {partCount > 0 && (
        <ul className="iw-attached-list">
          {parts.slice(0, 6).map((p) => (
            <li key={p.slotId}>
              {p.meta?.icon || '◆'} {p.meta?.label || p.partId}
            </li>
          ))}
          {parts.length > 6 && <li className="iw-more">+{parts.length - 6} more</li>}
        </ul>
      )}

      <div className="iw-action-stack">
        <motion.button
          type="button"
          className="iw-btn iw-btn--test"
          onClick={onTest}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          ▶ Test My Robot
        </motion.button>
        <motion.button
          type="button"
          className="iw-btn iw-btn--code"
          onClick={onCode}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          ⌨ Code My Robot
        </motion.button>
        <button type="button" className="iw-btn iw-btn--ghost" onClick={onSave} aria-label="Save design">
          💾 Save
        </button>
        <button type="button" className="iw-btn iw-btn--ghost" onClick={onLoad} aria-label="Load design">
          📂 Load
        </button>
        <div className="iw-undo-row">
          <button type="button" className="iw-btn iw-btn--ghost" onClick={onUndo} disabled={!canUndo}>
            ↶ Undo
          </button>
          <button type="button" className="iw-btn iw-btn--ghost" onClick={onRedo} disabled={!canRedo}>
            ↷ Redo
          </button>
        </div>
      </div>

      <p className="iw-panel-tip">
        Cyan rings = empty sockets · Magenta = filled · Green = drop here · Red = wrong part
      </p>
    </aside>
  );
}
