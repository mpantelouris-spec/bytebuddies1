/**
 * Invention Workshop — complete redesign. Robot-first, kid-friendly, modular invention.
 */
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { playVrdSoundSync } from '../utils/vrdSound.js';
import { useWorkshopActions } from '../hooks/useWorkshopActions.js';
import { useRobotStore, useDesignActions } from '../store/robotStore.js';
import { migrateDesign } from '../config.js';
import { generateRobotClassPython } from '../services/robot-code-generator.js';
import { countPlacedParts } from '../services/assembly-service.js';
import WorkshopWelcome from '../components/workshop/WorkshopWelcome.jsx';
import WorkshopPartsPalette from '../components/workshop/WorkshopPartsPalette.jsx';
import WorkshopHeroStage from '../components/workshop/WorkshopHeroStage.jsx';
import WorkshopRobotPanel from '../components/workshop/WorkshopRobotPanel.jsx';
import WorkshopInventoryTray from '../components/workshop/WorkshopInventoryTray.jsx';
import InteractiveBuildChamber from '../components/InteractiveBuildChamber.jsx';
import SaveDesignModal from '../components/SaveDesignModal.jsx';
import LoadDesignModal from '../components/LoadDesignModal.jsx';

export default function InventionWorkshop({
  onGoSimulator,
  onGoCode,
  onGoCreations,
  onGoGallery,
  onBack,
}) {
  const w = useWorkshopActions();
  const { setDesign } = useDesignActions();
  const evolutionLevel = Math.min(10, Math.max(1, countPlacedParts(w.asm) + 1));

  const handleCodeMyRobot = useCallback(() => {
    const design = migrateDesign(useRobotStore.getState().design);
    const python = generateRobotClassPython(design);
    const prog = design.program || { mode: 'blocks', blocks: [], python: '', javascript: '' };
    setDesign({ ...design, program: { ...prog, mode: 'python', python } });
    playVrdSoundSync('success');
    onGoCode?.();
  }, [setDesign, onGoCode]);

  if (w.showWelcome) {
    return <WorkshopWelcome onStart={w.handleWelcomeStart} />;
  }

  return (
    <div className="iw-app">
      {w.savedToast && (
        <motion.div className="iw-toast iw-toast--ok" role="status" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          ✓ Robot saved!
        </motion.div>
      )}
      {w.errorToast && (
        <motion.div className="iw-toast iw-toast--err" role="alert" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {w.errorToast}
        </motion.div>
      )}

      <header className="iw-header">
        <button type="button" className="iw-header-back" onClick={onBack}>
          ← ByteBuddies
        </button>
        <div className="iw-header-brand">
          <span className="iw-header-logo" aria-hidden>⚡</span>
          <span>Robot Invention Lab</span>
        </div>
        <nav className="iw-header-nav">
          <button type="button" onClick={onGoCreations}>My Robots</button>
          <button type="button" onClick={onGoGallery}>Gallery</button>
        </nav>
      </header>

      {w.buildMode === 'blocks' ? (
        <main className="iw-blocks-main">
          <InteractiveBuildChamber
            design={w.d}
            highlightSlot={w.selectedSlot}
            snapPulse={w.snapPulse}
            buildMode="blocks"
            visualStyle="workshop"
            blockLayer={w.blockLayer}
            selectedBlockType={w.selectedBlockType}
            onPlaceBlock={w.placeBlock}
            onRemoveBlock={w.removeBlock}
          />
          <button
            type="button"
            className="iw-blocks-exit"
            onClick={() => w.handleSetBuildMode('advanced')}
          >
            ← Back to Part Inventor
          </button>
        </main>
      ) : (
        <>
          <WorkshopPartsPalette
            design={w.d}
            selectedSlot={w.selectedSlot}
            onSelectSlot={w.setSelectedSlot}
            onMountPart={w.handleMountPart}
            onUpdateBase={w.handleUpdateBase}
            onSetBuildMode={w.handleSetBuildMode}
            onSetWheelCount={w.handleSetWheelCount}
            buildMode={w.buildMode}
          />

          <WorkshopHeroStage
            design={w.d}
            highlightSlot={w.selectedSlot}
            snapPulse={w.snapPulse}
            dragOver={w.dragOver}
            robotName={w.robotName}
            editingName={w.editingName}
            onEditName={() => w.setEditingName(true)}
            onNameChange={w.setRobotName}
            onNameSave={w.handleRobotNameSave}
            evolutionLevel={evolutionLevel}
            onSocketSelect={(slotId) => {
              w.setSelectedSlot(slotId);
              playVrdSoundSync('click');
            }}
            onSocketRemove={(slotId) => {
              w.handleRemovePart(slotId);
              w.setSelectedSlot(slotId);
            }}
            onDragOver={w.handleViewportDragOver}
            onDragLeave={() => w.setDragOver(false)}
            onDrop={w.handleViewportDrop}
          />

          <WorkshopRobotPanel
            design={w.d}
            stats={w.stats}
            onCode={handleCodeMyRobot}
            onTest={() => w.handleTestInSimulator(onGoSimulator)}
            onSave={() => w.setShowSave(true)}
            onLoad={() => w.setShowLoad(true)}
            onUndo={w.handleUndo}
            onRedo={w.handleRedo}
            canUndo={w.canUndo}
            canRedo={w.canRedo}
          />

          <WorkshopInventoryTray
            slots={w.asm.slots}
            selectedSlot={w.selectedSlot}
            onSelectSlot={w.setSelectedSlot}
            onRemovePart={w.handleRemovePart}
            onClear={w.handleClearAll}
          />
        </>
      )}

      {w.showSave && <SaveDesignModal design={w.d} onSave={w.handleSave} onClose={() => w.setShowSave(false)} />}
      {w.showLoad && <LoadDesignModal onLoad={w.handleLoadDesign} onClose={() => w.setShowLoad(false)} />}
    </div>
  );
}
