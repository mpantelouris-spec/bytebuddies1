import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ACADEMY_PART_SECTIONS, BRIGHT_ROBOT_COLORS } from '../../data/academy-part-categories.js';
import { slotAcceptsPart } from '../../data/assembly-parts.js';
import { migrateAssembly } from '../../services/assembly-service.js';
import { canAttachPartAnywhere, findFirstOpenSlot } from '../../utils/build-slots.js';

function PartTile({ part, active, disabled, onClick, onDragStart }) {
  return (
    <motion.button
      type="button"
      className={`bb-part-tile ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      draggable={!disabled}
      onDragStart={onDragStart}
      whileHover={disabled ? {} : { scale: 1.08 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      title={part.label}
    >
      <span className="bb-part-tile-icon">{part.icon}</span>
      <span className="bb-part-tile-label">{part.label}</span>
    </motion.button>
  );
}

export default function AcademyPartsPanel({
  design,
  buildMode,
  selectedSlot,
  onSelectSlot,
  onMountPart,
  onUpdateBase,
  onSetBuildMode,
  onChassisPick,
  highlightSection = null,
  isArm = false,
}) {
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(ACADEMY_PART_SECTIONS.map((s) => [s.id, true])),
  );
  const asm = migrateAssembly(design);
  const isLego = buildMode === 'blocks';

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChassis = (chassis) => {
    onChassisPick?.(chassis);
    onUpdateBase?.({
      chassisType: chassis.id,
      shape: chassis.meshShape,
      width: chassis.width,
      height: chassis.height,
      depth: chassis.depth,
      scale: chassis.scale,
      color: asm.base.color || '#FFFFFF',
      material: 'industrial',
    });
    if (!asm.slots.movement) onSelectSlot?.('movement');
  };

  const handlePart = (part) => {
    let slot = selectedSlot;
    if (!slot || !slotAcceptsPart(slot, part.category)) {
      slot = findFirstOpenSlot(asm.slots, part.category, isArm);
      if (slot) onSelectSlot?.(slot);
    }
    if (slot && slotAcceptsPart(slot, part.category)) {
      onMountPart?.(slot, part.category, part.id, part.label);
    }
  };

  return (
    <div className="bb-parts-panel">
      <div className="bb-parts-panel-head">
        <h2>Add Parts</h2>
        <p>Tap a part — or drag it onto the robot · green + shows where it goes</p>
      </div>

      <div className="bb-parts-slot-hint">
        <span>Attaching to:</span>
        <strong>{selectedSlot ? selectedSlot.replace('_', ' ') : 'pick a socket'}</strong>
      </div>

      <div className="bb-parts-sections">
        {ACADEMY_PART_SECTIONS.map((section) => {
          const open = openSections[section.id];
          return (
            <section
              key={section.id}
              className={`bb-parts-section ${highlightSection === section.id ? 'bb-parts-section--guide' : ''}`}
            >
              <button
                type="button"
                className="bb-parts-section-title"
                onClick={() => toggleSection(section.id)}
              >
                <span>{section.icon} {section.label}</span>
                <span>{open ? '▼' : '▶'}</span>
              </button>
              {open && (
                <div className="bb-parts-grid">
                  {section.type === 'chassis'
                    ? section.items.map((item) => (
                        <PartTile
                          key={item.id}
                          part={item}
                          active={(asm.base.chassisType || 'rover') === item.id}
                          onClick={() => handleChassis(item.chassis)}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/vrd-chassis', item.id);
                          }}
                        />
                      ))
                    : section.items.map((part) => {
                        const canAttach = canAttachPartAnywhere(asm.slots, part.category, isArm)
                          || (selectedSlot && slotAcceptsPart(selectedSlot, part.category));
                        const mounted = Object.values(asm.slots || {}).some(
                          (s) => s?.partId === part.id && s?.category === part.category,
                        );
                        return (
                          <PartTile
                            key={`${part.category}-${part.id}`}
                            part={part}
                            active={mounted}
                            disabled={!canAttach && !mounted}
                            onClick={() => handlePart(part)}
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                'application/vrd-part',
                                JSON.stringify({ category: part.category, id: part.id, label: part.label }),
                              );
                            }}
                          />
                        );
                      })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="bb-parts-colors">
        <span className="bb-parts-colors-label">Paint</span>
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
        <button
          type="button"
          className={`bb-mode-toggle ${!isLego ? 'active' : ''}`}
          onClick={() => onSetBuildMode?.('advanced')}
        >
          🤖 Advanced
        </button>
        <button
          type="button"
          className={`bb-mode-toggle ${isLego ? 'active' : ''}`}
          onClick={() => onSetBuildMode?.('blocks')}
        >
          🧱 LEGO Mode
        </button>
      </div>
    </div>
  );
}
