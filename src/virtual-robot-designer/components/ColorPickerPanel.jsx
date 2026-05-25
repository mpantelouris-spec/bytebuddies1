import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROBOT_COLORS } from '../data/robot-catalog.js';
import { playVrdSoundSync } from '../utils/vrdSound.js';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
}

const RECENT_KEY = 'vrd_recent_colors';

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 6);
  } catch {
    return [];
  }
}

function pushRecent(hex) {
  const list = [hex, ...loadRecent().filter((c) => c !== hex)].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  return list;
}

export default function ColorPickerPanel({ value, onChange, label = 'Colors' }) {
  const [showCustom, setShowCustom] = useState(false);
  const [recent, setRecent] = useState(loadRecent);
  const rgb = hexToRgb(value || '#00D9FF');

  const apply = (hex) => {
    onChange(hex);
    setRecent(pushRecent(hex));
    playVrdSoundSync('click');
  };

  const setRgbChannel = (channel, val) => {
    const next = { ...rgb, [channel]: Number(val) };
    apply(rgbToHex(next.r, next.g, next.b));
  };

  return (
    <div className="vrd-color-panel">
      <h4 className="vrd-color-panel-title">{label}</h4>
      <motion.div className="vrd-mod-colors vrd-mod-colors--grid">
        {ROBOT_COLORS.map(({ id, label: lbl }) => (
          <motion.button
            key={id}
            type="button"
            className={`vrd-mod-color ${value === id ? 'active' : ''}`}
            style={{ background: id }}
            title={lbl}
            onClick={() => apply(id)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            aria-label={`Color ${lbl}`}
          />
        ))}
      </motion.div>

      {recent.length > 0 && (
        <div className="vrd-color-recent">
          <span className="vrd-color-recent-label">Recent</span>
          <div className="vrd-mod-colors">
            {recent.map((hex) => (
              <button key={hex} type="button" className={`vrd-mod-color ${value === hex ? 'active' : ''}`} style={{ background: hex }} onClick={() => apply(hex)} title={hex} />
            ))}
          </div>
        </div>
      )}

      <button type="button" className="vrd-color-custom-toggle" onClick={() => setShowCustom((s) => !s)}>
        Custom Picker {showCustom ? '▲' : '▼'}
      </button>

      <AnimatePresence>
        {showCustom && (
          <motion.div className="vrd-color-custom" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="vrd-color-custom-row">
              <input type="color" className="vrd-color-picker" value={value?.startsWith('#') ? value : '#00D9FF'} onChange={(e) => apply(e.target.value)} aria-label="Color wheel" />
              <input className="vrd-input vrd-color-hex" value={value || ''} onChange={(e) => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) apply(e.target.value); }} placeholder="#00D9FF" spellCheck={false} />
            </div>
            {(['r', 'g', 'b']).map((ch) => (
              <label key={ch} className="vrd-color-rgb">
                <span>{ch.toUpperCase()}</span>
                <input type="range" min={0} max={255} value={rgb[ch]} onChange={(e) => setRgbChannel(ch, e.target.value)} />
                <span>{rgb[ch]}</span>
              </label>
            ))}
            <div className="vrd-color-preview" style={{ background: value, boxShadow: `0 0 20px ${value}88` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
