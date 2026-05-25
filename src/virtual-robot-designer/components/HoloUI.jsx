import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function HoloPanel({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`vrd-holo-panel ${open ? 'open' : ''}`}>
      <button type="button" className="vrd-holo-panel-head" onClick={() => setOpen((o) => !o)}>
        <span className="vrd-holo-panel-icon">{icon}</span>
        <span className="vrd-holo-panel-title">{title}</span>
        <span className="vrd-holo-panel-chevron">{open ? '▾' : '▸'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="vrd-holo-panel-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HoloTile({ icon, label, active, onClick }) {
  return (
    <motion.button
      type="button"
      className={`vrd-holo-tile ${active ? 'active' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="vrd-holo-tile-glow" aria-hidden />
      <span className="vrd-holo-tile-icon">{icon}</span>
      <span className="vrd-holo-tile-label">{label}</span>
    </motion.button>
  );
}

export function HoloChip({ label, active, onClick }) {
  return (
    <button type="button" className={`vrd-holo-chip ${active ? 'active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}

export function HoloStat({ label, value, color, max = 100 }) {
  return (
    <div className="vrd-holo-stat">
      <div className="vrd-holo-stat-head">
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="vrd-holo-stat-track">
        <motion.div
          className="vrd-holo-stat-fill"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(max, value)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}

export function HoloSelect({ value, onChange, options }) {
  return (
    <div className="vrd-holo-select-wrap">
      <select className="vrd-holo-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
      <span className="vrd-holo-select-arrow">▾</span>
    </div>
  );
}
