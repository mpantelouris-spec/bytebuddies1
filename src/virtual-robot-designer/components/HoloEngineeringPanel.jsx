/**
 * HoloEngineeringPanel.jsx
 * Left-side floating holographic engineering tool panels.
 * Part categories expand into snap-able part drawers.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  {
    id: 'chassis',
    label: 'Chassis',
    icon: '🤖',
    desc: 'Robot body type',
    items: [
      { id: 'rover',       label: 'Rover',       icon: '🚗', slot: null, isChassisType: true },
      { id: 'tank',        label: 'Tank',         icon: '🪖', slot: null, isChassisType: true },
      { id: 'drone',       label: 'Drone',        icon: '🚁', slot: null, isChassisType: true },
      { id: 'spider',      label: 'Spider',       icon: '🕷️', slot: null, isChassisType: true },
      { id: 'humanoid',    label: 'Humanoid',     icon: '🦾', slot: null, isChassisType: true },
      { id: 'racing',      label: 'Racing',       icon: '🏎️', slot: null, isChassisType: true },
    ],
  },
  {
    id: 'movement',
    label: 'Movement',
    icon: '⚙️',
    desc: 'Drive systems',
    items: [
      { id: 'standard',  label: 'Wheels',   icon: '🛞',  slot: 'movement', category: 'movement' },
      { id: 'tracks',    label: 'Tracks',   icon: '🏗️', slot: 'movement', category: 'movement' },
      { id: 'legs',      label: 'Legs',     icon: '🦿',  slot: 'movement', category: 'movement' },
      { id: 'hover',     label: 'Hover',    icon: '💨',  slot: 'movement', category: 'movement' },
      { id: 'omni',      label: 'Omni',     icon: '🔘',  slot: 'movement', category: 'movement' },
      { id: 'jet',       label: 'Jets',     icon: '🚀',  slot: 'movement', category: 'movement' },
    ],
  },
  {
    id: 'sensors',
    label: 'Sensors',
    icon: '📡',
    desc: 'Detection systems',
    items: [
      { id: 'ultrasonic', label: 'Ultrasonic', icon: '📡', slot: 'front',   category: 'sensors' },
      { id: 'lidar',      label: 'LIDAR',      icon: '🔦', slot: 'top',     category: 'sensors' },
      { id: 'thermal',    label: 'Thermal',    icon: '🌡️', slot: 'left',    category: 'sensors' },
      { id: 'proximity',  label: 'Proximity',  icon: '📍', slot: 'front',   category: 'sensors' },
      { id: 'gyro',       label: 'Gyroscope',  icon: '🧭', slot: 'addon_a', category: 'sensors' },
    ],
  },
  {
    id: 'ai',
    label: 'AI Core',
    icon: '🧠',
    desc: 'Intelligence modules',
    items: [
      { id: 'camera',    label: 'Camera Eye',  icon: '📷', slot: 'head',    category: 'head' },
      { id: 'ai_visor',  label: 'AI Visor',    icon: '🥽', slot: 'head',    category: 'head' },
      { id: 'tactical',  label: 'Tactical HUD',icon: '🎯', slot: 'head',    category: 'head' },
      { id: 'radar_pod', label: 'Radar Pod',   icon: '📻', slot: 'top',     category: 'head' },
      { id: 'holo_face', label: 'Holo Face',   icon: '😊', slot: 'head',    category: 'head' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: '🦾',
    desc: 'Utility attachments',
    items: [
      { id: 'claw',    label: 'Robotic Claw',  icon: '🦀', slot: 'front',  category: 'utility' },
      { id: 'gripper', label: 'Gripper',       icon: '🤏', slot: 'left',   category: 'utility' },
      { id: 'blade',   label: 'Dozer Blade',   icon: '🚜', slot: 'front',  category: 'utility' },
      { id: 'magnet',  label: 'Magnet',        icon: '🧲', slot: 'right',  category: 'utility' },
      { id: 'drill',   label: 'Drill',         icon: '⛏️', slot: 'front',  category: 'utility' },
      { id: 'laser',   label: 'Laser',         icon: '🔴', slot: 'right',  category: 'utility' },
    ],
  },
  {
    id: 'power',
    label: 'Power',
    icon: '⚡',
    desc: 'Energy systems',
    items: [
      { id: 'battery', label: 'Battery Pack',  icon: '🔋', slot: 'back',   category: 'power' },
      { id: 'fusion',  label: 'Fusion Core',   icon: '☢️', slot: 'back',   category: 'power' },
      { id: 'solar',   label: 'Solar Panel',   icon: '☀️', slot: 'top',    category: 'power' },
      { id: 'backup',  label: 'Backup Cell',   icon: '🔌', slot: 'addon_b', category: 'power' },
    ],
  },
  {
    id: 'comms',
    label: 'Comms',
    icon: '📶',
    desc: 'Communication gear',
    items: [
      { id: 'antenna',   label: 'Antenna',      icon: '📡', slot: 'top',    category: 'comms' },
      { id: 'dish',      label: 'Comm Dish',    icon: '🛰️', slot: 'back',   category: 'comms' },
      { id: 'holo_proj', label: 'Holo Projector',icon: '🌈', slot: 'top',  category: 'comms' },
    ],
  },
  {
    id: 'materials',
    label: 'Materials',
    icon: '🔩',
    desc: 'Hull materials',
    items: [
      { id: 'matte_steel', label: 'Matte Steel',   icon: '🪨', isMaterial: true },
      { id: 'aluminum',    label: 'Polished Al.',  icon: '🔩', isMaterial: true },
      { id: 'carbon',      label: 'Carbon Fiber',  icon: '⚫', isMaterial: true },
      { id: 'titanium',    label: 'Titanium',      icon: '🔒', isMaterial: true },
      { id: 'exotic',      label: 'Exotic Metal',  icon: '💎', isMaterial: true },
    ],
  },
  {
    id: 'paint',
    label: 'Paint',
    icon: '🎨',
    desc: 'Colours & effects',
    isColorPicker: true,
    colors: [
      '#1a3060', '#2563eb', '#7c3aed', '#db2777', '#dc2626',
      '#ea580c', '#d97706', '#16a34a', '#0891b2', '#374151',
    ],
  },
  {
    id: 'lego',
    label: 'LEGO Mode',
    icon: '🧱',
    desc: 'Block building',
    isModeToggle: true,
  },
];

/* ── Single part tile ───────────────────────────────────────── */
function PartTile({ item, isEquipped, onClick }) {
  return (
    <motion.button
      className={`holo-part-tile${isEquipped ? ' equipped' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      title={item.label}
    >
      <span className="holo-part-icon">{item.icon}</span>
      <span className="holo-part-name">{item.label}</span>
    </motion.button>
  );
}

/* ── Expandable category row ────────────────────────────────── */
function CategoryRow({
  cat,
  isOpen,
  onToggle,
  slots,
  buildMode,
  primaryColor,
  onPartClick,
  onChassisClick,
  onMaterialClick,
  onColorClick,
  onBuildModeChange,
}) {
  const isEquippedFn = (item) => {
    if (item.isMaterial) return false;
    if (item.isChassisType) return false;
    if (!item.slot) return false;
    return slots?.[item.slot]?.partId === item.id;
  };

  return (
    <div>
      <button
        className={`holo-cat-btn${isOpen ? ' active' : ''}`}
        onClick={onToggle}
        title={cat.desc}
      >
        <span className="holo-cat-icon">{cat.icon}</span>
        <span className="holo-cat-label">{cat.label}</span>
        <span className="holo-cat-arrow">▶</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="holo-parts-drawer open"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Mode toggle */}
            {cat.isModeToggle && (
              <div style={{ padding: '10px' }}>
                <div className="holo-build-mode">
                  <button
                    className={`holo-mode-toggle${buildMode === 'advanced' ? ' active' : ''}`}
                    onClick={() => onBuildModeChange('advanced')}
                  >
                    🤖 Advanced
                  </button>
                  <button
                    className={`holo-mode-toggle${buildMode === 'blocks' ? ' active' : ''}`}
                    onClick={() => onBuildModeChange('blocks')}
                  >
                    🧱 LEGO
                  </button>
                </div>
                <div style={{ padding: '8px 0 0', fontSize: 9, letterSpacing: '1px', color: 'rgba(100,180,255,0.6)', textTransform: 'uppercase', textAlign: 'center' }}>
                  {buildMode === 'blocks' ? 'Block construction mode active' : 'Advanced robotics mode active'}
                </div>
              </div>
            )}

            {/* Color picker */}
            {cat.isColorPicker && (
              <div style={{ padding: '10px' }}>
                <div className="holo-color-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {cat.colors.map((c) => (
                    <button
                      key={c}
                      className={`holo-color-swatch${primaryColor === c ? ' selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => onColorClick(c)}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Part grid */}
            {!cat.isColorPicker && !cat.isModeToggle && (
              <div className="holo-parts-grid">
                {cat.items.map((item) => (
                  <PartTile
                    key={item.id}
                    item={item}
                    isEquipped={isEquippedFn(item)}
                    onClick={() => {
                      if (item.isChassisType) { onChassisClick(item.id); return; }
                      if (item.isMaterial) { onMaterialClick(item.id); return; }
                      onPartClick(item);
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORTED COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function HoloEngineeringPanel({
  design,
  onMountPart,
  onUpdateBase,
  onBuildModeChange,
  onColorChange,
  onShowBlueprints,
}) {
  const [openCat, setOpenCat] = useState('movement');

  const slots     = design?.assembly?.slots  || {};
  const base      = design?.assembly?.base   || {};
  const buildMode = design?.assembly?.buildMode || 'advanced';
  const primaryColor = design?.cosmetics?.primaryColor || '#1a3060';

  const toggleCat = (id) => setOpenCat(prev => prev === id ? null : id);

  const handlePartClick = (item) => {
    if (!item.slot || !item.category) return;
    onMountPart(item.slot, item.category, item.id, item.label);
  };

  const handleChassisClick = (chassisId) => {
    const shapes = {
      rover: 'box', tank: 'box', drone: 'round',
      spider: 'hex', humanoid: 'box', racing: 'wedge',
    };
    onUpdateBase({ shape: shapes[chassisId] || 'box', chassisType: chassisId });
  };

  return (
    <div className="holo-eng-panel anim-left">
      {/* Blueprint button */}
      <button className="holo-blueprint-btn" onClick={onShowBlueprints}>
        ⬡ Load Blueprint
      </button>

      {/* Category rows */}
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="holo-panel">
            <span className="holo-corner-tl" />
            <span className="holo-corner-br" />
            <div className="holo-panel-inner">
              <CategoryRow
                cat={cat}
                isOpen={openCat === cat.id}
                onToggle={() => toggleCat(cat.id)}
                slots={slots}
                buildMode={buildMode}
                primaryColor={primaryColor}
                onPartClick={handlePartClick}
                onChassisClick={handleChassisClick}
                onMaterialClick={(matId) => onUpdateBase({ material: matId })}
                onColorClick={(c) => onColorChange(c)}
                onBuildModeChange={onBuildModeChange}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
