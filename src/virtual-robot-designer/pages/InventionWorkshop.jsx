/**
 * Invention Workshop — complete redesign. Robot-first, kid-friendly, modular invention.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { playVrdSoundSync } from '../utils/vrdSound.js';
import { useWorkshopActions } from '../hooks/useWorkshopActions.js';
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
  const evolutionLevel = Math.min(10, Math.max(1, countPlacedParts(w.asm) + 1));

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
            onCode={onGoCode}
            onTest={() => w.handleTestInSimulator(onGoSimulator)}
            onSave={() => w.setShowSave(true)}
            onLoad={() => w.setShowLoad(true)}
            onUndo={w.handleUndo}
            canUndo={w.canUndo}
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
