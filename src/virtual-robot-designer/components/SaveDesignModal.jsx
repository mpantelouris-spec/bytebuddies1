import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { exportRobotSpec } from '../services/robot-schema.js';
import { playVrdSoundSync } from '../utils/vrdSound.js';

const MAX_NAME = 100;
const MAX_DESC = 500;

export default function SaveDesignModal({ design, onSave, onClose }) {
  const [name, setName] = useState(design?.name || '');
  const [description, setDescription] = useState(design?.description || '');
  const [tags, setTags] = useState((design?.tags || []).join(', '));
  const [isPublic, setIsPublic] = useState(!!design?.is_public);
  const [exported, setExported] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Please enter a name for your robot.');
      playVrdSoundSync('error');
      return;
    }
    if (trimmed.length > MAX_NAME) {
      setNameError(`Name must be ${MAX_NAME} characters or fewer.`);
      playVrdSoundSync('error');
      return;
    }
    setNameError('');
    playVrdSoundSync('save');
    onSave({
      name: trimmed,
      description: description.trim().slice(0, MAX_DESC),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12),
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
    <motion.div
      className="vrd-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vrd-save-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div className="vrd-modal" initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
        <h2 id="vrd-save-title" style={{ margin: '0 0 16px' }}>💾 Save This Design</h2>
        <form onSubmit={handleSubmit}>
          <label className="vrd-field-label" htmlFor="vrd-save-name">Robot Name</label>
          <input
            id="vrd-save-name"
            className="vrd-input"
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="My Awesome Speed Rover…"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? 'vrd-save-name-err' : undefined}
          />
          {nameError && (
            <p id="vrd-save-name-err" className="vrd-field-error" role="alert">{nameError}</p>
          )}
          <label className="vrd-field-label" htmlFor="vrd-save-desc">Description (optional)</label>
          <textarea
            id="vrd-save-desc"
            className="vrd-input"
            rows={3}
            maxLength={MAX_DESC}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A fast 4-wheel robot for racing courses…"
          />
          <label className="vrd-field-label" htmlFor="vrd-save-tags">Tags (comma-separated)</label>
          <input id="vrd-save-tags" className="vrd-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="speed, racer, wheeled" />
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
