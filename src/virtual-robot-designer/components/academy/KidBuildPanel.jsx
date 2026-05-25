import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ACADEMY_PART_SECTIONS, BRIGHT_ROBOT_COLORS } from '../../data/academy-part-categories.js';
import { CHASSIS_TYPES, slotAcceptsPart } from '../../data/assembly-parts.js';
import { migrateAssembly } from '../../services/assembly-service.js';
import { getBuildPhase, getSlotLabel } from '../../utils/build-slots.js';
import PartDragGhost from './PartDragGhost.jsx';

const QUICK_WHEELS = [
  { id: 'standard', label: 'Wheels', icon: '🛞' },
  { id: 'tracks', label: 'Tracks', icon: '🏗️' },
  { id: 'hover', label: 'Hover', icon: '💨' },
];

const QUICK_HEADS = [
  { id: 'camera', label: 'Camera', icon: '📷', category: 'head' },
  { id: 'holo_face', label: 'Smiley Face', icon: '😊', category: 'head' },
  { id: 'ultrasonic', label: 'Eyes', icon: '📡', category: 'sensors' },
];

function dragPart(e, payload) {
  e.dataTransfer.setData('application/vrd-part', JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'copy';
}

function QuickBtn({ icon, label, onClick, done, dragPayload }) {
  return (
    <button
      type="button"
      className={`bb-quick-btn ${done ? 'done' : ''}`}
      onClick={onClick}
      draggable
      onDragStart={(e) => dragPayload && dragPart(e, dragPayload)}
    >
      <span className="bb-quick-btn-icon">{icon}</span>
      <span>{label}</span>
      {done && <span className="bb-quick-btn-check">✓</span>}
    </button>
  );
}

export default function KidBuildPanel({
  design,
  selectedSlot,
  onSelectSlot,
  onMountPart,
  onUpdateBase,
  onSetBuildMode,
}) {
  const asm = migrateAssembly(design);
  const phase = getBuildPhase(asm, asm.base?.shape === 'arm');
  const [showAllParts, setShowAllParts] = useState(false);

  const mount = (slotId, category, partId, label) => {
    onSelectSlot?.(slotId);
    onMountPart?.(slotId, category, partId, label);
  };

  const sectionForPhase = ACADEMY_PART_SECTIONS.find((s) => s.id === phase.panelSection);
  const chassisSection = ACADEMY_PART_SECTIONS.find((s) => s.id === 'chassis');

  const pickSlot = (category) => {
    if (category === 'movement') return 'movement';
    if (['head', 'sensors'].includes(category)) return 'head';
    if (phase.phase === 'extras') {
      const open = ['front', 'left', 'right', 'back', 'top'].find(
        (id) => !asm.slots[id] && slotAcceptsPart(id, category),
      );
      return open || phase.activeSlot;
    }
    return phase.activeSlot;
  };

  const renderPartGrid = (section) => (
    <div className="bb-parts-grid">
      {section.items.map((part) => {
        const { category, id: partId, label, icon } = part;
        const target = pickSlot(category);
        const canUse = target && slotAcceptsPart(target, category);
        const mounted = Object.values(asm.slots || {}).some(
          (s) => s?.partId === partId && s?.category === category,
        );
        return (
          <button
            key={`${category}-${partId}`}
            type="button"
            className={`bb-part-tile ${mounted ? 'active' : ''} ${!canUse && !mounted ? 'disabled' : ''}`}
            disabled={!canUse && !mounted}
            draggable={!mounted && canUse}
            onDragStart={(e) => dragPart(e, { category, id: partId, label })}
            onClick={() => {
              if (mounted || !canUse) return;
              mount(target, category, partId, label);
            }}
          >
            <span className="bb-part-tile-icon">{icon}</span>
            <span className="bb-part-tile-label">{label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="bb-parts-panel bb-parts-panel--kid">
      <PartDragGhost />
      <div className="bb-kid-steps" aria-label="Build progress">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`bb-kid-step ${phase.step >= n ? 'on' : ''} ${phase.step === n ? 'current' : ''}`}
          >
            {n}
          </div>
        ))}
      </div>

      <div className="bb-kid-phase-title">
        <h2>{phase.title}</h2>
        <p>{phase.detail}</p>
      </div>

      {phase.phase === 'wheels' && (
        <div className="bb-quick-add-row">
          {QUICK_WHEELS.map((w) => (
            <QuickBtn
              key={w.id}
              icon={w.icon}
              label={w.label}
              done={asm.slots.movement?.partId === w.id}
              onClick={() => mount('movement', 'movement', w.id, w.label)}
              dragPayload={{ category: 'movement', id: w.id, label: w.label }}
            />
          ))}
        </div>
      )}

      {phase.phase === 'head' && (
        <div className="bb-quick-add-row">
          {QUICK_HEADS.map((h) => (
            <QuickBtn
              key={h.id}
              icon={h.icon}
              label={h.label}
              done={
                (h.category === 'head' && asm.slots.head?.partId === h.id)
                || (h.category === 'sensors' && asm.slots.head?.partId === h.id)
              }
              onClick={() => mount('head', h.category, h.id, h.label)}
              dragPayload={{ category: h.category, id: h.id, label: h.label }}
            />
          ))}
        </div>
      )}

      <div className="bb-parts-slot-hint bb-parts-slot-hint--kid">
        <span>Next spot:</span>
        <strong>{getSlotLabel(selectedSlot || phase.activeSlot)}</strong>
      </div>

      {chassisSection && (
        <section className="bb-parts-section bb-parts-section--compact">
          <h3 className="bb-parts-section-label">{chassisSection.icon} Body shape</h3>
          <div className="bb-parts-grid bb-parts-grid--chassis">
            {CHASSIS_TYPES.slice(0, 6).map((c) => (
              <button
                key={c.id}
                type="button"
                className={`bb-part-tile ${(asm.base.chassisType || 'rover') === c.id ? 'active' : ''}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/vrd-chassis', c.id);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => onUpdateBase?.({
                  chassisType: c.id,
                  shape: c.meshShape,
                  width: c.width,
                  height: c.height,
                  depth: c.depth,
                  scale: c.scale,
                  color: asm.base.color || '#FFFFFF',
                  material: 'industrial',
                })}
              >
                <span className="bb-part-tile-icon">{c.icon}</span>
                <span className="bb-part-tile-label">{c.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {sectionForPhase && !showAllParts && renderPartGrid(sectionForPhase)}

      {phase.phase === 'extras' && (
        <button
          type="button"
          className="bb-show-more-parts"
          onClick={() => setShowAllParts((v) => !v)}
        >
          {showAllParts ? '▲ Show less' : '▼ More parts (tools, power, fun)'}
        </button>
      )}

      {showAllParts && phase.phase === 'extras' && (
        <div className="bb-parts-sections">
          {ACADEMY_PART_SECTIONS.filter((s) => !['chassis', 'movement'].includes(s.id)).map((section) => (
            <section key={section.id} className="bb-parts-section">
              <h3 className="bb-parts-section-label">{section.icon} {section.label}</h3>
              {renderPartGrid(section)}
            </section>
          ))}
        </div>
      )}

      <div className="bb-parts-colors">
        <span className="bb-parts-colors-label">Paint color</span>
        <div className="bb-parts-color-row">
          {BRIGHT_ROBOT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`bb-parts-color-swatch ${asm.base.color === c.id ? 'active' : ''}`}
              style={{ background: c.id, borderColor: c.id === '#FFFFFF' ? '#94a3b8' : c.id }}
              title={c.label}
              onClick={() => onUpdateBase?.({ color: c.id })}
            />
          ))}
        </div>
      </div>

      <div className="bb-parts-mode-toggle">
        <button type="button" className="bb-mode-toggle active" onClick={() => onSetBuildMode?.('advanced')}>
          🤖 Build Robot
        </button>
        <button type="button" className="bb-mode-toggle" onClick={() => onSetBuildMode?.('blocks')}>
          🧱 LEGO Blocks
        </button>
      </div>
    </div>
  );
}
