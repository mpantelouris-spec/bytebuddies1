import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VirtualRobotDB from '../database/virtual-robot-db.js';
import { migrateDesign } from '../config.js';
import { importRobotSpec } from '../services/robot-schema.js';
import { playVrdSoundSync } from '../utils/vrdSound.js';

export default function LoadDesignModal({ onLoad, onClose }) {
  const [designs, setDesigns] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    setDesigns(VirtualRobotDB.listDesigns().sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleLoad = (d) => {
    playVrdSoundSync('success');
    onLoad(migrateDesign(d));
    onClose();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this design?')) return;
    VirtualRobotDB.deleteDesign(id);
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    playVrdSoundSync('click');
  };

  const handleDuplicate = (d, e) => {
    e.stopPropagation();
    const copy = VirtualRobotDB.duplicateDesign(d.id);
    if (copy) {
      setDesigns(VirtualRobotDB.listDesigns().sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)));
      playVrdSoundSync('success');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const spec = JSON.parse(reader.result);
        const imported = importRobotSpec(spec);
        if (!imported) throw new Error('Invalid robot file');
        playVrdSoundSync('success');
        onLoad(imported);
        onClose();
      } catch (err) {
        alert(`Could not import: ${err.message || 'invalid JSON'}`);
        playVrdSoundSync('error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <motion.div
      className="vrd-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vrd-load-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div className="vrd-modal vrd-modal--wide" initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
        <h2 id="vrd-load-title" style={{ margin: '0 0 16px' }}>📂 Load Saved Design</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button type="button" className="vrd-btn" onClick={() => fileRef.current?.click()}>
            ⬇ Import robot.json
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={handleImportFile} />
        </div>

        {designs.length === 0 ? (
          <p className="vrd-hint">No saved designs yet. Build a robot and hit Save!</p>
        ) : (
          <ul className="vrd-load-list">
            {designs.map((d) => (
              <li key={d.id}>
                <button type="button" className="vrd-load-item" onClick={() => handleLoad(d)}>
                  <span className="vrd-load-item-color" style={{ background: d.assembly?.base?.color || d.chassis?.color || '#5A2E8F' }} />
                  <span className="vrd-load-item-info">
                    <strong>{d.name || 'Untitled'}</strong>
                    <span>{d.description || 'No description'} · {new Date(d.updated_date).toLocaleDateString()}</span>
                  </span>
                  {d.is_public && <span className="vrd-load-badge">Public</span>}
                </button>
                <button type="button" className="vrd-load-dup" title="Duplicate" onClick={(e) => handleDuplicate(d, e)}>⧉</button>
                <button type="button" className="vrd-load-delete" onClick={(e) => handleDelete(d.id, e)} aria-label={`Delete ${d.name || 'design'}`}>✕</button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="vrd-btn" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={onClose}>Close</button>
      </motion.div>
    </motion.div>
  );
}
