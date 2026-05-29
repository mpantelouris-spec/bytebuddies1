/**
 * Left palette — big kid-friendly zones + draggable parts (no engineering jargon).
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KID_PART_ZONES, getZoneItems } from '../../data/kid-part-zones.js';
import { BRIGHT_ROBOT_COLORS } from '../../data/academy-part-categories.js';
import { slotAcceptsPart } from '../../data/assembly-parts.js';
import { migrateAssembly } from '../../services/assembly-service.js';
import { findFirstOpenSlot } from '../../utils/build-slots.js';
import { useUiStore } from '../../store/uiStore.js';
import WorkshopCustomizePanel from './WorkshopCustomizePanel.jsx';

function dragPayload(e, payload) {
  e.dataTransfer.setData('application/vrd-part', JSON.stringify({ type: 'part', ...payload }));
  e.dataTransfer.effectAllowed = 'copy';
  useUiStore.getState().setDraggingPart(payload);
}

function endDrag() {
  useUiStore.getState().clearDragState();
}

function PartChip({ part, mounted, canUse, onPick }) {
  const { category, id, label, icon, chassis } = part;
  const isChassis = !!chassis;

  return (
    <motion.button
      type="button"
      className={`iw-part-chip ${mounted ? 'mounted' : ''} ${!canUse && !mounted ? 'disabled' : ''}`}
      draggable={!mounted && canUse}
      onDragStart={(e) => {
        if (isChassis) {
          e.dataTransfer.setData('application/vrd-chassis', chassis.id);
          useUiStore.getState().setDraggingPart({ category: 'chassis', id: chassis.id });
        } else {
          dragPayload(e, { category, id, label });
        }
      }}
      onDragEnd={endDrag}
      onClick={() => {
        if (isChassis || (!mounted && canUse)) onPick?.(part);
      }}
      whileHover={canUse && !mounted ? { scale: 1.06, y: -2 } : undefined}
      whileTap={canUse && !mounted ? { scale: 0.94 } : undefined}
      title={mounted ? 'Already on your robot' : `Drag onto robot — ${label}`}
    >
      <span className="iw-part-chip-icon">{icon}</span>
      <span className="iw-part-chip-label">{label}</span>
      {mounted && <span className="iw-part-chip-check">✓</span>}
    </motion.button>
  );
}

export default function WorkshopPartsPalette({
  design,
  selectedSlot,
  onSelectSlot,
  onMountPart,
  onUpdateBase,
  onSetBuildMode,
  onSetWheelCount,
  buildMode,
}) {
  const [zone, setZone] = useState('body');
  const asm = migrateAssembly(design);
  const activeZone = KID_PART_ZONES.find((z) => z.id === zone);
  const items = getZoneItems(zone);

  const isMounted = (category, partId) =>
    Object.values(asm.slots || {}).some((s) => s?.category === category && s?.partId === partId);

  const canUse = (category) =>
    selectedSlot && slotAcceptsPart(selectedSlot, category);

  const handlePick = (part) => {
    if (part.chassis) {
      const c = part.chassis;
      onUpdateBase?.({
        chassisType: c.id,
        shape: c.meshShape,
        width: c.width,
        height: c.height,
        depth: c.depth,
        scale: c.scale,
        color: asm.base?.color || '#FFFFFF',
        material: 'industrial',
      });
      return;
    }
    let slot = selectedSlot;
    const isArm = asm.base?.shape === 'arm';
    if (!slot || !slotAcceptsPart(slot, part.category)) {
      slot = findFirstOpenSlot(asm.slots, part.category, isArm);
    }
    if (slot) onMountPart?.(slot, part.category, part.id, part.label);
  };

  return (
    <aside className="iw-palette" aria-label="Robot parts">
      <header className="iw-palette-head">
        <h2>Parts</h2>
        <p>Drag onto your robot</p>
      </header>

      <div className="iw-zone-tabs" role="tablist">
        {KID_PART_ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            role="tab"
            aria-selected={zone === z.id}
            className={`iw-zone-tab ${zone === z.id ? 'active' : ''}`}
            onClick={() => setZone(z.id)}
            title={z.hint}
          >
            <span className="iw-zone-icon">{z.icon}</span>
            <span>{z.label}</span>
          </button>
        ))}
      </div>

      <p className="iw-zone-hint">{activeZone?.hint}</p>

      {zone === 'body' && (
        <WorkshopCustomizePanel
          design={design}
          onUpdateBase={onUpdateBase}
          onMountPart={onMountPart}
          onSetWheelCount={onSetWheelCount}
        />
      )}

      <div className="iw-parts-scroll">
        <div className="iw-parts-grid">
          {items.map((part) => {
            const cat = part.chassis ? 'movement' : part.category;
            const pid = part.chassis ? part.chassis.id : part.id;
            return (
              <PartChip
                key={`${cat}-${pid}`}
                part={part}
                mounted={part.chassis ? asm.base?.chassisType === part.chassis.id : isMounted(part.category, part.id)}
                canUse={part.chassis || canUse(part.category) || true}
                onPick={handlePick}
              />
            );
          })}
        </div>
      </div>

      <footer className="iw-palette-foot">
        <span className="iw-paint-label">Paint</span>
        <div className="iw-paint-row">
          {BRIGHT_ROBOT_COLORS.slice(0, 8).map((sw) => (
            <button
              key={sw.id}
              type="button"
              className={`iw-paint-dot ${asm.base?.color === sw.id ? 'active' : ''}`}
              style={{ background: sw.id }}
              title={sw.label}
              onClick={() => onUpdateBase?.({ color: sw.id, material: 'industrial' })}
            />
          ))}
        </div>
        <button
          type="button"
          className={`iw-mode-toggle ${buildMode === 'blocks' ? 'active' : ''}`}
          onClick={() => onSetBuildMode?.(buildMode === 'blocks' ? 'advanced' : 'blocks')}
        >
          {buildMode === 'blocks' ? '🔩 Part Mode' : '🧱 Block Builder'}
        </button>
      </footer>
    </aside>
  );
}
