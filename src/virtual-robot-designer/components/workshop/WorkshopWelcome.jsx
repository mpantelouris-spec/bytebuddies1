/**
 * Kid-friendly welcome — invention universe, not engineering dashboard.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MODES = [
  {
    id: 'advanced',
    icon: '🛠',
    title: 'Invent with Parts',
    desc: 'Drag wheels, sensors, arms, and power onto YOUR robot.',
    visual: 'parts',
  },
  {
    id: 'blocks',
    icon: '🧱',
    title: 'Block Builder',
    desc: 'Snap futuristic blocks together — like LEGO for robots!',
    visual: 'blocks',
  },
];

export default function WorkshopWelcome({ onStart }) {
  const [picked, setPicked] = useState('advanced');

  return (
    <motion.div
      className="iw-welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-labelledby="iw-welcome-title"
    >
      <div className="iw-welcome-bg" aria-hidden />
      <motion.div className="iw-welcome-card" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <span className="iw-welcome-badge">Robotics Invention Universe</span>
        <h1 id="iw-welcome-title">Build YOUR Robot</h1>
        <p className="iw-welcome-lead">
          Not a template. Not a preset. A real invention you design, code, and bring to life.
        </p>

        <div className="iw-welcome-modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`iw-welcome-mode ${picked === m.id ? 'active' : ''}`}
              onClick={() => setPicked(m.id)}
            >
              <span className="iw-welcome-mode-icon">{m.icon}</span>
              <strong>{m.title}</strong>
              <span>{m.desc}</span>
            </button>
          ))}
        </div>

        <motion.button
          type="button"
          className="iw-welcome-go"
          onClick={() => onStart?.(picked)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          Start Inventing →
        </motion.button>
        <button type="button" className="iw-welcome-skip" onClick={() => onStart?.('advanced')}>
          Skip intro
        </button>
      </motion.div>
    </motion.div>
  );
}
