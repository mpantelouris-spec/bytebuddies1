/**
 * Full modular robotics engineering panel — browse, search, slot-pick, drag-drop.
 */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ACADEMY_PART_SECTIONS, BRIGHT_ROBOT_COLORS } from '../../data/academy-part-categories.js';
import { SNAP_SLOTS, slotAcceptsPart } from '../../data/assembly-parts.js';
import { migrateAssembly } from '../../services/assembly-service.js';
import { ALL_SLOT_IDS, MODULAR_PARTS, MODULAR_CHASSIS } from '../../data/modular-parts-registry.js';

const MODULAR_PARTS_COUNT = MODULAR_PARTS.length + MODULAR_CHASSIS.length;
import { getSlotLabel } from '../../utils/build-slots.js';
import PartDragGhost from './PartDragGhost.jsx';

function dragPart(e, payload) {
  e.dataTransfer.setData('application/vrd-part', JSON.stringify({ type: 'part', ...payload }));
  e.dataTransfer.effectAllowed = 'copy';
}

function PartTile({ part, mounted, canUse, selectedSlot, onPick }) {
  const { category, id, label, icon } = part;
  return (
    <motion.button
      type="button"
      className={`bb-part-tile ${mounted ? 'mounted' : ''} ${!canUse && !mounted ? 'disabled' : ''}`}
      title={mounted ? 'Already on robot' : canUse ? `Attach to ${getSlotLabel(selectedSlot)}` : 'Select a compatible socket'}
      draggable={!mounted && canUse}
      onDragStart={(e) => dragPart(e, { category, id, label })}
      onClick={() => {
        if (mounted || !canUse) return;
        onPick(part);
      }}
      whileHover={!mounted && canUse ? { scale: 1.06 } : undefined}
      whileTap={!mounted && canUse ? { scale: 0.96 } : undefined}
      layout
    >
      <span className="bb-part-tile-icon">{icon}</span>
      <span className="bb-part-tile-label">{label}</span>
      {mounted && <span className="bb-part-tile-badge">✓</span>}
    </motion.button>
  );
}

export default function ModularPartsPanel({
  design,
  selectedSlot,
  onSelectSlot,
  onMountPart,
  onRemovePart,
  onUpdateBase,
  onSetBuildMode,
  onSlotTransform,
  onSetVisualMode,
}) {
  const asm = migrateAssembly(design);
  const [activeSection, setActiveSection] = useState('chassis');
  const [search, setSearch] = useState('');
  const slotTransform = asm.slotTransforms?.[selectedSlot] || { rotY: 0, scale: 1 };
  const partCount = MODULAR_PARTS_COUNT;

  const section = ACADEMY_PART_SECTIONS.find((s) => s.id === activeSection) || ACADEMY_PART_SECTIONS[0];

  const filteredItems = useMemo(() => {
    if (!section?.items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return section.items;
    return section.items.filter((p) => p.label.toLowerCase().includes(q) || p.id.includes(q));
  }, [section, search]);

  const isPartMounted = (category, partId) =>
    Object.values(asm.slots || {}).some((s) => s?.category === category && s?.partId === partId);

  const canAttachToSlot = (category) =>
    selectedSlot && slotAcceptsPart(selectedSlot, category);

  const mount = (slotId, category, partId, label) => {
    onSelectSlot?.(slotId);
    onMountPart?.(slotId, category, partId, label);
  };

  const handlePartClick = (part) => {
    const { category, id, label } = part;
    if (isPartMounted(category, id)) return;
    let slot = selectedSlot;
    if (!slot || !slotAcceptsPart(slot, category)) {
      slot = ALL_SLOT_IDS.find((sid) => !asm.slots[sid] && slotAcceptsPart(sid, category));
    }
    if (slot) mount(slot, category, id, label);
  };

  return (
    <div className="bb-parts-panel bb-parts-panel--engineering">
      <header className="bb-parts-panel-head">
        <h2 className="bb-parts-panel-title">Parts Library</h2>
        <p className="bb-parts-panel-sub">{partCount}+ modules · invent anything</p>
        <div className="bb-visual-mode-toggle">
          <button
            type="button"
            className={asm.visualMode !== 'lego' ? 'active' : ''}
            onClick={() => onSetVisualMode?.('realistic')}
          >
            🔩 Realistic
          </button>
          <button
            type="button"
            className={asm.visualMode === 'lego' ? 'active' : ''}
            onClick={() => onSetVisualMode?.('lego')}
          >
            🧱 Toy Look
          </button>
        </div>
        <input
          type="search"
          className="bb-parts-search"
          placeholder="Search parts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="bb-slot-bar" role="tablist" aria-label="Mount sockets">
        {ALL_SLOT_IDS.map((slotId) => {
          const filled = asm.slots?.[slotId];
          const active = selectedSlot === slotId;
          return (
            <button
              key={slotId}
              type="button"
              role="tab"
              aria-selected={active}
              className={`bb-slot-chip ${active ? 'active' : ''} ${filled ? 'filled' : ''}`}
              onClick={() => onSelectSlot?.(slotId)}
              title={SNAP_SLOTS[slotId]?.label}
            >
              <span className="bb-slot-chip-icon">{SNAP_SLOTS[slotId]?.icon}</span>
              <span className="bb-slot-chip-label">{SNAP_SLOTS[slotId]?.label?.split(' ')[0]}</span>
              {filled && (
                <span
                  className="bb-slot-chip-remove"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePart?.(slotId);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && onRemovePart?.(slotId)}
                  aria-label="Remove part"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>

      {asm.slots?.[selectedSlot] && (
        <div className="bb-transform-bar">
          <span className="bb-transform-label">Socket: {getSlotLabel(selectedSlot)}</span>
          <button type="button" onClick={() => onSlotTransform?.(selectedSlot, { rotY: slotTransform.rotY + Math.PI / 4 })}>
            ↻ Rotate
          </button>
          <button type="button" onClick={() => onSlotTransform?.(selectedSlot, { scale: Math.min(1.6, slotTransform.scale + 0.1) })}>
            ＋ Bigger
          </button>
          <button type="button" onClick={() => onSlotTransform?.(selectedSlot, { scale: Math.max(0.5, slotTransform.scale - 0.1) })}>
            － Smaller
          </button>
          <button type="button" onClick={() => onSlotTransform?.(selectedSlot, { rotY: 0, scale: 1 })}>
            Reset
          </button>
        </div>
      )}

      <nav className="bb-category-tabs" aria-label="Part categories">
        {ACADEMY_PART_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`bb-cat-tab ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => {
              setActiveSection(s.id);
              setSearch('');
            }}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <div className="bb-parts-scroll">
        {section.type === 'chassis' ? (
          <div className="bb-chassis-grid">
            {filteredItems.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`bb-chassis-tile ${asm.base?.chassisType === c.id ? 'active' : ''}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/vrd-chassis', c.id);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => onUpdateBase?.({
                  chassisType: c.chassis.id,
                  shape: c.chassis.meshShape,
                  width: c.chassis.width,
                  height: c.chassis.height,
                  depth: c.chassis.depth,
                  scale: c.chassis.scale,
                  color: asm.base.color || '#FFFFFF',
                  material: 'industrial',
                })}
              >
                <span className="bb-chassis-icon">{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="bb-parts-grid">
            {filteredItems.map((part) => (
              <PartTile
                key={`${part.category}-${part.id}`}
                part={part}
                mounted={isPartMounted(part.category, part.id)}
                canUse={canAttachToSlot(part.category) || !!ALL_SLOT_IDS.find(
                  (sid) => !asm.slots[sid] && slotAcceptsPart(sid, part.category),
                )}
                selectedSlot={selectedSlot}
                onPick={handlePartClick}
              />
            ))}
          </div>
        )}
        {filteredItems.length === 0 && (
          <p className="bb-parts-empty">No parts match your search.</p>
        )}
      </div>

      <footer className="bb-parts-panel-foot">
        <div className="bb-paint-row">
          <span className="bb-paint-label">Paint</span>
          {BRIGHT_ROBOT_COLORS.map((sw) => (
            <button
              key={sw.id}
              type="button"
              className={`bb-paint-swatch ${asm.base?.color === sw.id ? 'active' : ''}`}
              style={{ background: sw.id }}
              title={sw.label}
              onClick={() => onUpdateBase?.({ color: sw.id, material: 'industrial' })}
            />
          ))}
        </div>
        <button
          type="button"
          className="bb-blocks-mode-btn"
          onClick={() => onSetBuildMode?.('blocks')}
        >
          🧱 LEGO Block Mode
        </button>
      </footer>

      <PartDragGhost />
    </div>
  );
}
