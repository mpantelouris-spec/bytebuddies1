import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BUILD_MODES = [
  {
    id: 'advanced',
    label: 'Modular Engineer',
    icon: '🔩',
    tagline: 'Snap real robot parts together',
    desc: 'Wheels, legs, drones, arms, sensors — invent ANY robot from scratch. No templates.',
  },
  {
    id: 'blocks',
    label: 'LEGO Inventor',
    icon: '🧱',
    tagline: 'Build with colorful blocks',
    desc: 'Stack bricks, hinges, and motor blocks like a toy engineering kit. Total creative freedom.',
  },
];

export default function WelcomeScreen({ onStart }) {
  const [phase, setPhase] = useState('loading');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase('welcome'), 900);
    return () => clearTimeout(t);
  }, []);

  const begin = (styleId) => {
    if (!styleId || typeof onStart !== 'function') return;
    onStart(styleId);
  };

  if (phase === 'loading') {
    return (
      <motion.div className="vrd-welcome vrd-welcome--loading">
        <motion.div className="vrd-welcome-logo" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          ◈
        </motion.div>
        <h2 className="vrd-welcome-title">ROBOT INVENTION LAB</h2>
        <p className="vrd-welcome-sub">Loading modular parts universe…</p>
        <motion.div className="vrd-welcome-bar" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.9 }} />
      </motion.div>
    );
  }

  return (
    <motion.div className="vrd-welcome vrd-welcome--choose vrd-welcome--invention">
      <motion.div className="vrd-welcome-bg" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.h1 className="vrd-welcome-title" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Build your own invention from scratch
      </motion.h1>
      <motion.p className="vrd-welcome-sub vrd-welcome-sub--big" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
        No prebuilt robots. No templates. Pick how you want to invent — then combine any parts you imagine.
      </motion.p>

      <div className="vrd-welcome-styles">
        {BUILD_MODES.map((m, i) => (
          <motion.button
            key={m.id}
            type="button"
            className={`vrd-welcome-style ${selected === m.id ? 'active' : ''} vrd-welcome-style--${m.id}`}
            onClick={() => setSelected(m.id)}
            onDoubleClick={() => begin(m.id)}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="vrd-welcome-style-visual" aria-hidden>
              {m.id === 'blocks' ? (
                <span className="vrd-lego-preview"><span /><span /><span /><span /></span>
              ) : (
                <span className="vrd-real-preview">⚙️</span>
              )}
            </span>
            <span className="vrd-welcome-mode-icon">{m.icon}</span>
            <strong>{m.label}</strong>
            <em>{m.tagline}</em>
            <span className="vrd-welcome-style-desc">{m.desc}</span>
          </motion.button>
        ))}
      </div>

      <button
        type="button"
        className="vrd-welcome-enter"
        disabled={!selected}
        onClick={() => begin(selected)}
      >
        {selected ? 'Start Inventing →' : 'Choose your build style'}
      </button>
      <button type="button" className="vrd-welcome-skip" onClick={() => begin('advanced')}>
        Skip — blank robot canvas
      </button>
    </motion.div>
  );
}
