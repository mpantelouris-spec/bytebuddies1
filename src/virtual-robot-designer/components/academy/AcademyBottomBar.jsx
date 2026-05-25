import React from 'react';
import { listPlacedParts } from '../../services/assembly-service.js';
import { getWorkshopPart } from '../../data/assembly-parts.js';
import { migrateAssembly } from '../../services/assembly-service.js';

export default function AcademyBottomBar({
  design,
  buildMode,
  onSetBuildMode,
  onPartReuse,
  onAddPart,
}) {
  const asm = migrateAssembly(design);
  const placed = listPlacedParts(asm);
  const isLego = buildMode === 'blocks';

  return (
    <footer className="bb-my-parts-bar">
      <div className="bb-my-parts-head">
        <h3>My Parts</h3>
        <span>Drag onto the robot to attach again</span>
      </div>
      <div className="bb-my-parts-scroll">
        {placed.map((p) => {
          const meta = p.partMeta || getWorkshopPart(p.category, p.partId);
          return (
            <button
              key={`${p.slotId}-${p.partId}`}
              type="button"
              className="bb-my-part-card"
              onClick={() => onPartReuse?.(p.slotId, p.category, p.partId, meta?.label)}
              title={meta?.label}
            >
              <span className="bb-my-part-icon">{meta?.icon || '◆'}</span>
              <span className="bb-my-part-name">{meta?.label || p.partId}</span>
              <span className="bb-my-part-heart">♥</span>
            </button>
          );
        })}
        <button type="button" className="bb-my-part-card bb-my-part-add" onClick={onAddPart}>
          <span className="bb-my-part-add-icon">+</span>
          <span>Add to My Parts</span>
        </button>
      </div>
      <div className="bb-my-parts-modes">
        <button
          type="button"
          className={`bb-mode-toggle ${!isLego ? 'active' : ''}`}
          onClick={() => onSetBuildMode?.('advanced')}
        >
          🤖 Advanced Mode
        </button>
        <button
          type="button"
          className={`bb-mode-toggle ${isLego ? 'active' : ''}`}
          onClick={() => onSetBuildMode?.('blocks')}
        >
          🧱 LEGO Mode
        </button>
      </div>
    </footer>
  );
}
