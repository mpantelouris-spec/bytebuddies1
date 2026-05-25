import React from 'react';
import { motion } from 'framer-motion';
import { TEMPLATE_OPTIONS } from '../config.js';

const COLORS = [
  { c: '#FF006E', name: 'Pink' },
  { c: '#8B00FF', name: 'Purple' },
  { c: '#00FF41', name: 'Green' },
  { c: '#00D4FF', name: 'Blue' },
  { c: '#fbbf24', name: 'Gold' },
  { c: '#ef4444', name: 'Red' },
];

const MOVES = [
  { id: 'standard', icon: '🛞', label: 'Wheels' },
  { id: 'tracks', icon: '🏗️', label: 'Tracks' },
  { id: 'legs', icon: '🦿', label: 'Legs' },
  { id: 'hover', icon: '💨', label: 'Hover' },
];

const EXTRAS = [
  { kind: 'sensor', key: 'camera', icon: '👀', label: 'Eyes' },
  { kind: 'sensor', key: 'ultrasonic', icon: '📡', label: 'Ears' },
  { kind: 'tool', key: 'pincer', icon: '🦀', label: 'Claw' },
  { kind: 'tool', key: 'bulldozer', icon: '🚜', label: 'Blade' },
  { kind: 'cosmetic', key: 'accentLights', icon: '✨', label: 'Glow' },
  { kind: 'ability', key: 'speedBoost', icon: '⚡', label: 'Turbo' },
];

function BigBtn({ active, onClick, children, className = '' }) {
  return (
    <motion.button
      type="button"
      className={`vrd-kid-btn ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

/** Tap-to-build panel for primary students */
export default function KidRobotBuilder({
  design: d,
  onPickTemplate,
  onColor,
  onMove,
  onSize,
  onSpeed,
  onExtra,
  isExtraOn,
}) {
  return (
    <div className="vrd-kid-builder">
      <div className="vrd-kid-intro">
        <span className="vrd-kid-intro-icon">🤖</span>
        <div>
          <strong>Build your robot!</strong>
          <p>Tap the buttons — watch it appear in the chamber →</p>
        </div>
      </div>

      <section className="vrd-kid-step">
        <h3>1 · Pick a robot</h3>
        <div className="vrd-kid-robot-grid">
          {TEMPLATE_OPTIONS.map((t) => (
            <BigBtn key={t.id} active={d.template === t.id} onClick={() => onPickTemplate(t.id)} className="vrd-kid-robot">
              <span className="vrd-kid-robot-icon">{t.icon}</span>
              <span>{t.label}</span>
            </BigBtn>
          ))}
        </div>
      </section>

      <section className="vrd-kid-step">
        <h3>2 · Pick a color</h3>
        <div className="vrd-kid-colors">
          {COLORS.map(({ c, name }) => (
            <button
              key={c}
              type="button"
              className={`vrd-kid-color ${d.chassis.color === c ? 'active' : ''}`}
              style={{ background: c }}
              title={name}
              onClick={() => onColor(c)}
              aria-label={name}
            />
          ))}
        </div>
      </section>

      <section className="vrd-kid-step">
        <h3>3 · How does it move?</h3>
        <div className="vrd-kid-row">
          {MOVES.map((m) => (
            <BigBtn key={m.id} active={d.wheels.type === m.id} onClick={() => onMove(m.id)}>
              <span>{m.icon}</span> {m.label}
            </BigBtn>
          ))}
        </div>
      </section>

      <section className="vrd-kid-step">
        <h3>4 · Add cool parts</h3>
        <div className="vrd-kid-row vrd-kid-row--wrap">
          {EXTRAS.map((ex) => (
            <BigBtn key={ex.key} active={isExtraOn(ex)} onClick={() => onExtra(ex)}>
              <span>{ex.icon}</span> {ex.label}
            </BigBtn>
          ))}
        </div>
      </section>

      <section className="vrd-kid-step vrd-kid-step--inline">
        <div>
          <h3>Size</h3>
          <div className="vrd-kid-pills">
            {[
              { id: 'small', label: 'Small' },
              { id: 'medium', label: 'Medium' },
              { id: 'large', label: 'Big' },
            ].map((s) => (
              <button key={s.id} type="button" className={`vrd-kid-pill ${d.chassis.size === s.id ? 'active' : ''}`} onClick={() => onSize(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3>Speed</h3>
          <div className="vrd-kid-pills">
            {[
              { id: 'weak', label: 'Slow' },
              { id: 'medium', label: 'Normal' },
              { id: 'strong', label: 'Fast' },
            ].map((s) => (
              <button key={s.id} type="button" className={`vrd-kid-pill ${d.wheels.motor === s.id ? 'active' : ''}`} onClick={() => onSpeed(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
