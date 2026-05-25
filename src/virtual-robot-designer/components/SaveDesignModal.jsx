import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { exportRobotSpec } from '../services/robot-schema.js';
import { playVrdSoundSync } from '../utils/vrdSound.js';

export default function SaveDesignModal({ design, onSave, onClose }) {
  const [name, setName] = useState(design?.name || '');
  const [description, setDescription] = useState(design?.description || '');
  const [tags, setTags] = useState((design?.tags || []).join(', '));
  const [isPublic, setIsPublic] = useState(!!design?.is_public);
  const [exported, setExported] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    playVrdSoundSync('save');
    onSave({
      name: name.trim() || 'My Robot',
      description: description.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      is_public: isPublic,
    });
  };

  const handleExport = () => {
    const spec = exportRobotSpec(design);
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(name || 'robot').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    playVrdSoundSync('success');
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <motion.div className="vrd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="vrd-modal" initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 16px' }}>💾 Save This Design</h2>
        <form onSubmit={handleSubmit}>
          <label className="vrd-field-label">Robot Name</label>
          <input className="vrd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Speed Rover…" />
          <label className="vrd-field-label">Description (optional)</label>
          <textarea className="vrd-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A fast 4-wheel robot for racing courses…" />
          <label className="vrd-field-label">Tags (comma-separated)</label>
          <input className="vrd-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="speed, racer, wheeled" />
          <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
              <input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} /> 🔒 Private
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
              <input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} /> 🌍 Public / Share
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" className="vrd-btn vrd-btn-primary" style={{ flex: 1, minWidth: 120, justifyContent: 'center' }}>Save</button>
            <button type="button" className="vrd-btn" style={{ flex: 1, minWidth: 120, justifyContent: 'center' }} onClick={handleExport}>
              {exported ? '✓ Exported' : '⬇ Export JSON'}
            </button>
            <button type="button" className="vrd-btn" style={{ flex: 1, minWidth: 120, justifyContent: 'center', background: 'rgba(255,255,255,0.1)', color: '#ccc' }} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
