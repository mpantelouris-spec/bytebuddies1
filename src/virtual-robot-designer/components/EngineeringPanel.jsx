import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HoloPanel } from './HoloUI.jsx';
import { ROBOT_BLUEPRINTS } from '../data/blueprints.js';
import { migrateAssembly } from '../services/assembly-service.js';
import { getStyleMeta, ROBOT_STYLES, switchRobotStyle } from '../services/robot-style.js';
import BuildGuide from './BuildGuide.jsx';
import RobotWorkshop from './RobotWorkshop.jsx';
import BlockWorkshop from './BlockWorkshop.jsx';
import RobotQuickControls from './RobotQuickControls.jsx';

export default function EngineeringPanel({
  design,
  setDesign,
  buildMode,
  onSetBuildMode,
  onApplyBlueprint,
  selectedSlot,
  onSelectSlot,
  onMountPart,
  onUpdateBase,
  onRemovePart,
  onClearAll,
  onPlaceBlock,
  onRemoveBlock,
  onRotateBlock,
  onClearBlocks,
  blockLayer,
  onBlockLayerChange,
  selectedBlockType,
  onSelectBlockType,
  onLog,
}) {
  const [showBlueprints, setShowBlueprints] = useState(false);
  const asm = migrateAssembly(design);
  const isArm = asm.base?.shape === 'arm';
  const isLego = buildMode === 'blocks';
  const style = getStyleMeta(buildMode);

  const handleSwitchStyle = () => {
    const nextStyle = isLego ? 'advanced' : 'blocks';
    const label = ROBOT_STYLES[nextStyle].label;
    if (!window.confirm(`Switch to ${label}? Your current robot will reset to a fresh starter.`)) return;
    const next = switchRobotStyle(design, nextStyle);
    setDesign(next);
    onSetBuildMode(nextStyle);
    onLog?.(`> switched to ${label} mode`);
  };

  const filteredBlueprints = ROBOT_BLUEPRINTS.filter((bp) =>
    isLego ? bp.buildMode === 'blocks' : bp.buildMode === 'advanced',
  );

  return (
    <motion.div className="vrd-engineering">
      <div className={`vrd-panel-head vrd-panel-head--${buildMode}`}>
        <strong>{isLego ? '🧱 BUILD YOUR LEGO ROBOT' : '🤖 BUILD YOUR REAL ROBOT'}</strong>
        <button type="button" className="vrd-switch-style" onClick={handleSwitchStyle}>
          Switch to {isLego ? '🤖 Real' : '🧱 LEGO'}
        </button>
      </div>

      <motion.div className={`vrd-style-banner vrd-style-banner--${buildMode}`}>
        <span>{style.icon}</span>
        <motion.div>
          <strong>{style.label}</strong>
          <p>{isLego ? 'Click blocks below, then tap the grid or 3D floor to snap them on' : 'Pick a body, add wheels & parts — your robot appears in 3D'}</p>
        </motion.div>
      </motion.div>

      <BuildGuide design={design} buildMode={buildMode} />

      <HoloPanel title={isLego ? 'LEGO Starters' : 'Robot Templates'} icon="📐" defaultOpen={false}>
        <button type="button" className="vrd-blueprint-toggle" onClick={() => setShowBlueprints((s) => !s)}>
          {showBlueprints ? 'Hide templates' : 'Load a starter template…'}
        </button>
        {showBlueprints && (
          <motion.div className="vrd-blueprint-grid">
            {filteredBlueprints.map((bp) => (
              <motion.button
                key={bp.id}
                type="button"
                className="vrd-blueprint-card"
                onClick={() => { onApplyBlueprint(bp); setShowBlueprints(false); }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="vrd-blueprint-icon">{bp.icon}</span>
                <strong>{bp.name}</strong>
                <span>{bp.desc}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </HoloPanel>

      {isLego ? (
        <BlockWorkshop
          design={design}
          onPlaceBlock={onPlaceBlock}
          onRemoveBlock={onRemoveBlock}
          onRotateBlock={onRotateBlock}
          onClearBlocks={onClearBlocks}
          onLayerChange={onBlockLayerChange}
          selectedType={selectedBlockType}
          onSelectType={onSelectBlockType}
        />
      ) : (
        <>
          <RobotQuickControls design={design} setDesign={setDesign} onLog={onLog} showAdvanced />
          <RobotWorkshop
            design={design}
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
            onMountPart={onMountPart}
            onUpdateBase={onUpdateBase}
            onRemovePart={onRemovePart}
            onClearAll={onClearAll}
            isArm={isArm}
          />
        </>
      )}
    </motion.div>
  );
}
