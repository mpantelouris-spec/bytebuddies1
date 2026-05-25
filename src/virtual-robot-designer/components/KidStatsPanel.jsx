import React from 'react';
import { motion } from 'framer-motion';
import { statBarColor, getKidBalanceStatus } from '../services/design-service.js';
import { countActiveSensors, countActiveTools } from '../services/design-service.js';

function KidBar({ emoji, label, value, statKey }) {
  const color = statBarColor(statKey, value);
  return (
    <div className="vrd-kid-stat">
      <div className="vrd-kid-stat-head">
        <span>{emoji} {label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="vrd-kid-stat-track">
        <motion.div className="vrd-kid-stat-fill" style={{ background: color }} animate={{ width: `${value}%` }} transition={{ type: 'spring', stiffness: 100 }} />
      </div>
    </div>
  );
}

export default function KidStatsPanel({ stats, design }) {
  const d = design;
  const balance = getKidBalanceStatus(stats);
  const parts = countActiveSensors(d) + countActiveTools(d);

  return (
    <div className="vrd-kid-stats">
      <div className="vrd-kid-stats-head">
        <span>⭐ Robot Power</span>
      </div>

      <KidBar emoji="🏃" label="Speed" value={stats.speed} statKey="speed" />
      <KidBar emoji="💪" label="Strength" value={stats.power} statKey="power" />
      <KidBar emoji="🔄" label="Turning" value={stats.agility} statKey="agility" />
      <KidBar emoji="🔋" label="Battery" value={stats.battery} statKey="battery" />

      <div className="vrd-kid-parts-badge">
        {parts} cool parts added
      </div>

      <motion.div
        className="vrd-kid-status"
        style={{ borderColor: balance.color, color: balance.color, background: `${balance.color}18` }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
      >
        {balance.emoji} {balance.label}
      </motion.div>

      <p className="vrd-kid-tip">{balance.tip}</p>
    </div>
  );
}
