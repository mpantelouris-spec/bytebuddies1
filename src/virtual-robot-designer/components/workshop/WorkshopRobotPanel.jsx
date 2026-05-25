/**
 * Right panel — simple companion stats + big kid actions (code, test, save).
 */
import React from 'react';
import { motion } from 'framer-motion';
import { migrateAssembly, listPlacedParts } from '../../services/assembly-service.js';
import { getWorkshopPart } from '../../data/assembly-parts.js';
import AnimatedNumber from '../AnimatedNumber.jsx';

function StatPill({ icon, label, value, color }) {
  return (
    <div className="iw-stat-pill">
      <span className="iw-stat-icon">{icon}</span>
      <div>
        <span className="iw-stat-label">{label}</span>
        <strong style={{ color }}>
          <AnimatedNumber value={value} suffix="%" />
        </strong>
      </div>
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
  canUndo,
}) {
  const asm = migrateAssembly(design);
  const parts = listPlacedParts(asm).map((p) => ({
    ...p,
    meta: getWorkshopPart(p.category, p.partId),
  }));
  const partCount = parts.length;

  return (
    <aside className="iw-robot-panel" aria-label="Your robot">
      <header className="iw-panel-head">
        <span className="iw-panel-mascot" aria-hidden>🤖</span>
        <div>
          <h2>Your Robot</h2>
          <p>{partCount ? `${partCount} parts attached` : 'Start dragging parts!'}</p>
        </div>
      </header>

      <div className="iw-stat-row">
        <StatPill icon="⚡" label="Speed" value={stats.speed} color="#1E90FF" />
        <StatPill icon="🔋" label="Power" value={stats.battery} color="#00C853" />
        <StatPill icon="🧠" label="Smarts" value={Math.min(100, stats.sensorCount * 18 + partCount * 6)} color="#8B5CF6" />
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
        <button type="button" className="iw-btn iw-btn--ghost" onClick={onUndo} disabled={!canUndo}>
          ↶ Undo
        </button>
      </div>

      <p className="iw-panel-tip">
        Tip: Green sockets = good spot. Red = wrong part.
      </p>
    </aside>
  );
}
