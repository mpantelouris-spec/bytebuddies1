import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  WORKSHOP_CATEGORIES,
  WORKSHOP_PARTS,
  CHASSIS_TYPES,
  BASE_MATERIALS,
  SNAP_SLOTS,
  slotAcceptsPart,
} from '../data/assembly-parts.js';
import ColorPickerPanel from './ColorPickerPanel.jsx';
import { listPlacedParts, migrateAssembly } from '../services/assembly-service.js';

const SLOT_ORDER = ['movement', 'head', 'front', 'left', 'right', 'back', 'top', 'addon_a', 'addon_b'];
const ARM_SLOTS = ['front', 'right', 'left', 'top'];

/** Slot-first builder: pick WHERE → pick WHAT → part mounts instantly */
export default function RobotWorkshop({
  design,
  selectedSlot,
  onSelectSlot,
  onMountPart,
  onUpdateBase,
  onRemovePart,
  onClearAll,
  isArm = false,
  compact = false,
}) {
  const [category, setCategory] = useState('movement');
  const asm = migrateAssembly(design);
  const placed = listPlacedParts(asm);
  const slotMeta = SNAP_SLOTS[selectedSlot];
  const slotPart = asm.slots[selectedSlot];
  const parts = WORKSHOP_PARTS.filter((p) => p.category === category && slotAcceptsPart(selectedSlot, p.category));

  const handlePartClick = (part) => {
    if (!slotAcceptsPart(selectedSlot, part.category)) return;
    onMountPart(selectedSlot, part.category, part.id, part.label);
  };

  return (
    <div className={`vrd-workshop ${compact ? 'vrd-workshop--compact' : ''}`}>
      <div className="vrd-workshop-head">
        <strong>◈ BUILD YOUR ROBOT</strong>
        <p>① Shape body → ② Pick a slot → ③ Tap a part</p>
      </div>

      <section className="vrd-workshop-base">
        <h4>① Chassis type</h4>
        <div className="vrd-workshop-shapes vrd-workshop-shapes--chassis">
          {CHASSIS_TYPES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`vrd-workshop-shape ${(asm.base.chassisType || 'rover') === c.id ? 'active' : ''}`}
              onClick={() => onUpdateBase({
                chassisType: c.id,
                shape: c.meshShape,
                width: c.width,
                height: c.height,
                depth: c.depth,
                scale: c.scale,
              })}
            >
              <span>{c.icon}</span><span>{c.label}</span>
            </button>
          ))}
        </div>
        <div className="vrd-workshop-sliders">
          <label>Width<input type="range" min="0.7" max="1.4" step="0.05" value={asm.base.scale ?? 1} onChange={(e) => onUpdateBase({ scale: parseFloat(e.target.value) })} /></label>
          <label>Height<input type="range" min="0.4" max="1" step="0.05" value={asm.base.height ?? 0.62} onChange={(e) => onUpdateBase({ height: parseFloat(e.target.value) })} /></label>
        </div>
        <div className="vrd-workshop-materials">
          {BASE_MATERIALS.map((m) => (
            <button key={m.id} type="button" className={`vrd-mod-pill ${asm.base.material === m.id ? 'active' : ''}`} onClick={() => onUpdateBase({ material: m.id })}>{m.label}</button>
          ))}
        </div>
        <ColorPickerPanel value={asm.base.color} onChange={(color) => onUpdateBase({ color })} label="④ Colors" />
      </section>

      <section className="vrd-workshop-slots">
        <h4>② Where does it go?</h4>
        <div className="vrd-slot-rail">
          {(isArm ? ARM_SLOTS : SLOT_ORDER).map((slotId) => {
            const meta = SNAP_SLOTS[slotId];
            const filled = !!asm.slots[slotId];
            const active = selectedSlot === slotId;
            return (
              <button
                key={slotId}
                type="button"
                className={`vrd-slot-btn ${active ? 'active' : ''} ${filled ? 'filled' : ''}`}
                onClick={() => onSelectSlot(slotId)}
                title={meta.label}
              >
                <span className="vrd-slot-btn-icon">{filled ? '✓' : meta.icon}</span>
                <span className="vrd-slot-btn-label">{meta.label}</span>
              </button>
            );
          })}
        </div>
        {slotPart ? (
          <div className="vrd-slot-equipped">
            ✓ {WORKSHOP_PARTS.find((p) => p.category === slotPart.category && p.id === slotPart.partId)?.label || slotPart.partId}
            <button type="button" onClick={() => onRemovePart(selectedSlot)}>Remove</button>
          </div>
        ) : (
          <div className="vrd-slot-hint">Selected: <strong>{slotMeta?.label}</strong> — pick a part below</div>
        )}
      </section>

      <section className="vrd-workshop-parts">
        <h4>③ Choose a part</h4>
        <div className="vrd-mod-categories">
          {WORKSHOP_CATEGORIES.map((c) => (
            <button key={c.id} type="button" className={`vrd-mod-cat ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
              <span>{c.icon}</span><span>{c.label}</span>
            </button>
          ))}
        </div>
        {parts.length === 0 ? (
          <p className="vrd-workshop-empty">No parts in this category fit <strong>{slotMeta?.label}</strong>. Try another category or slot.</p>
        ) : (
          <div className="vrd-workshop-part-grid">
            {parts.map((p) => (
              <motion.button
                key={`${p.category}-${p.id}`}
                type="button"
                className="vrd-workshop-part"
                onClick={() => handlePartClick(p)}
                whileTap={{ scale: 0.95 }}
                disabled={!!slotPart}
              >
                <span className="vrd-workshop-part-icon">{p.icon}</span>
                <span>{p.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      <section className="vrd-workshop-built">
        <div className="vrd-workshop-built-head">
          <h4>Your robot ({placed.length} parts)</h4>
          {placed.length > 0 && <button type="button" className="vrd-workshop-clear" onClick={onClearAll}>Clear all</button>}
        </div>
        {placed.length === 0 ? (
          <p className="vrd-workshop-empty">{isArm ? 'Add a tool to the end effector slot.' : 'Your robot is just a body right now. Add movement first!'}</p>
        ) : (
          <ul className="vrd-workshop-list">
            {placed.map(({ slotId, slotLabel, partMeta }) => (
              <li key={slotId}>
                <span>{partMeta?.icon} {partMeta?.label}</span>
                <span className="vrd-workshop-slot-tag">{slotLabel}</span>
                <button type="button" onClick={() => { onSelectSlot(slotId); onRemovePart(slotId); }} aria-label="Remove">✕</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
