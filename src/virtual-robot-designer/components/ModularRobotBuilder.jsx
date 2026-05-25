import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODULE_CATEGORIES, MODULE_PARTS, ROBOT_COLORS, getActivePartId } from '../data/robot-catalog.js';

function PartTile({ part, active, onClick }) {
  return (
    <motion.button
      type="button"
      className={`vrd-mod-part ${active ? 'active' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="vrd-mod-part-icon">{part.icon}</span>
      <span className="vrd-mod-part-label">{part.label}</span>
    </motion.button>
  );
}

/** Cinematic modular assembly panel — engineering parts, not kid buttons */
export default function ModularRobotBuilder({ design, onApplyModule, onColor, onMotor, onSize, recentPart }) {
  const [category, setCategory] = useState('chassis');

  const parts = MODULE_PARTS[category] || [];
  const activeId = getActivePartId(design, category);
  const catMeta = MODULE_CATEGORIES.find((c) => c.id === category);

  return (
    <div className="vrd-mod-builder">
      <div className="vrd-mod-header">
        <div className="vrd-mod-header-glow" />
        <span className="vrd-mod-header-icon">◈</span>
        <div>
          <strong>MODULAR ASSEMBLY</strong>
          <p>Engineer your machine from professional components</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {recentPart && (
          <motion.div
            key={recentPart}
            className="vrd-mod-snap-toast"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
          >
            ⚡ {recentPart} locked into chassis
          </motion.div>
        )}
      </AnimatePresence>

      <div className="vrd-mod-categories">
        {MODULE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`vrd-mod-cat ${category === c.id ? 'active' : ''}`}
            onClick={() => setCategory(c.id)}
            title={c.desc}
          >
            <span>{c.icon}</span>
            <span>{c.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="vrd-mod-panel">
        <div className="vrd-mod-panel-head">
          <span>{catMeta?.icon} {catMeta?.label}</span>
          <span className="vrd-mod-panel-desc">{catMeta?.desc}</span>
        </div>
        <div className="vrd-mod-parts-grid">
          {parts.map((p) => (
            <PartTile
              key={p.id}
              part={p}
              active={activeId === p.id || (category === 'movement' && design.wheels?.type === p.id)}
              onClick={() => onApplyModule(category, p.id, p.label)}
            />
          ))}
        </div>
      </div>

      <div className="vrd-mod-tuning">
        <div className="vrd-mod-tuning-block">
          <label>Hull Color</label>
          <div className="vrd-mod-colors">
            {ROBOT_COLORS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`vrd-mod-color ${design.chassis?.color === id ? 'active' : ''}`}
                style={{ background: id }}
                title={label}
                onClick={() => onColor(id)}
              />
            ))}
          </div>
        </div>
        <div className="vrd-mod-tuning-row">
          <div>
            <label>Scale</label>
            <div className="vrd-mod-pills">
              {['small', 'medium', 'large'].map((s) => (
                <button key={s} type="button" className={`vrd-mod-pill ${design.chassis?.size === s ? 'active' : ''}`} onClick={() => onSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label>Motor</label>
            <div className="vrd-mod-pills">
              {[
                { id: 'weak', label: 'Eco' },
                { id: 'medium', label: 'Std' },
                { id: 'strong', label: 'Pro' },
                { id: 'turbo', label: 'Turbo' },
              ].map((m) => (
                <button key={m.id} type="button" className={`vrd-mod-pill ${design.wheels?.motor === m.id ? 'active' : ''}`} onClick={() => onMotor(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
