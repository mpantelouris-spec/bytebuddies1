import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BLOCK_TYPES,
  BLOCK_CATEGORIES,
  BLOCK_LAYERS,
  getBlockType,
  worldKey,
} from '../data/block-parts.js';
import { migrateAssembly } from '../services/assembly-service.js';

const GRID_SIZE = 5;
const GRID_OFFSET = Math.floor(GRID_SIZE / 2);

/** Futuristic voxel block builder — snap blocks on a holographic grid */
export default function BlockWorkshop({ design, onPlaceBlock, onRemoveBlock, onRotateBlock, onClearBlocks, onLayerChange, selectedType: selectedTypeProp, onSelectType }) {
  const [category, setCategory] = useState('structure');
  const [search, setSearch] = useState('');
  const [selectedTypeLocal, setSelectedTypeLocal] = useState('cube');
  const selectedType = selectedTypeProp ?? selectedTypeLocal;
  const setSelectedType = (id) => {
    setSelectedTypeLocal(id);
    onSelectType?.(id);
  };
  const [layerY, setLayerY] = useState(0);
  const asm = migrateAssembly(design);
  const blocks = asm.blocks || [];
  const blockMap = new Map(blocks.map((b) => [worldKey(b.x, b.y, b.z), b]));

  const parts = BLOCK_TYPES.filter((p) => p.category === category && (
    !search.trim() || p.label.toLowerCase().includes(search.toLowerCase())
  ));

  const handleCellClick = (gx, gz) => {
    const key = worldKey(gx, layerY, gz);
    const existing = blockMap.get(key);
    if (existing) {
      onRemoveBlock(existing.id);
      return;
    }
    onPlaceBlock(selectedType, gx, layerY, gz);
  };

  return (
    <div className="vrd-block-workshop">
      <motion.div className="vrd-block-head">
        <strong>🧱 LEGO BLOCK BUILDER</strong>
        <p>① Pick a block · ② Click the grid or 3D floor to snap · ③ Stack layers up</p>
        <input
          type="search"
          className="vrd-block-search"
          placeholder="Search blocks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <div className="vrd-block-layers">
        {BLOCK_LAYERS.map((layer) => (
          <button
            key={layer.id}
            type="button"
            className={`vrd-block-layer ${layerY === layer.y ? 'active' : ''}`}
            onClick={() => { setLayerY(layer.y); onLayerChange?.(layer.y); }}
          >
            {layer.label}
          </button>
        ))}
      </div>

      <div className="vrd-block-grid-wrap">
        <div className="vrd-block-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
            const gx = (i % GRID_SIZE) - GRID_OFFSET;
            const gz = Math.floor(i / GRID_SIZE) - GRID_OFFSET;
            const key = worldKey(gx, layerY, gz);
            const placed = blockMap.get(key);
            const type = placed ? getBlockType(placed.type) : null;
            return (
              <motion.button
                key={key}
                type="button"
                className={`vrd-block-cell ${placed ? 'filled' : ''} ${gx === 0 && gz === 0 ? 'center' : ''}`}
                onClick={() => handleCellClick(gx, gz)}
                whileTap={{ scale: 0.92 }}
                style={type ? { '--block-glow': type.color } : undefined}
                title={placed ? `${type?.label} — click to remove` : `Place ${getBlockType(selectedType)?.label}`}
              >
                {placed ? type?.icon : ''}
              </motion.button>
            );
          })}
        </div>
        <div className="vrd-block-grid-label">Layer Y={layerY} · Front view</div>
      </div>

      <div className="vrd-block-cats">
        {BLOCK_CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={`vrd-mod-cat ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
            <span>{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </div>

      <div className="vrd-block-palette">
        {parts.map((p) => (
          <motion.button
            key={p.id}
            type="button"
            className={`vrd-block-part ${selectedType === p.id ? 'active' : ''}`}
            onClick={() => setSelectedType(p.id)}
            whileTap={{ scale: 0.95 }}
            style={{ '--part-color': p.color }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="vrd-block-built">
        <div className="vrd-workshop-built-head">
          <h4>Block stack ({blocks.length})</h4>
          {blocks.length > 0 && (
            <button type="button" className="vrd-workshop-clear" onClick={onClearBlocks}>Clear blocks</button>
          )}
        </div>
        {blocks.length === 0 ? (
          <p className="vrd-workshop-empty">Place cube blocks to start your invention!</p>
        ) : (
          <ul className="vrd-workshop-list vrd-block-list">
            {blocks.slice(-6).map((b) => {
              const t = getBlockType(b.type);
              return (
                <li key={b.id}>
                  <span>{t?.icon} {t?.label}</span>
                  <span className="vrd-workshop-slot-tag">({b.x},{b.y},{b.z})</span>
                  <button type="button" onClick={() => onRotateBlock(b.id)} title="Rotate">↻</button>
                  <button type="button" onClick={() => onRemoveBlock(b.id)} aria-label="Remove">✕</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
