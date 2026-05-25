import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { migrateDesign } from '../config.js';
import {
  placePartOnSlot,
  removePartFromSlot,
  updateAssemblyBase,
  clearAllParts,
  syncDesignFromAssembly,
  migrateAssembly,
  updateSlotTransform,
  setVisualMode,
} from '../services/assembly-service.js';
import {
  setBuildMode,
  placeBlock,
  removeBlock,
  rotateBlock,
  clearBlocks,
  applyBlueprint,
} from '../services/block-service.js';
import { checkAchievements } from '../services/design-service.js';
import { exportRobotSpec } from '../services/robot-schema.js';
import VirtualRobotDB from '../database/virtual-robot-db.js';
import vrdApi from '../apis/vrd-api.js';
import { useRobotStore, useDesignActions } from '../store/robotStore.js';
import { playVrdSoundSync } from '../utils/vrdSound.js';
import InteractiveBuildChamber from '../components/InteractiveBuildChamber.jsx';
import AcademyHeader from '../components/academy/AcademyHeader.jsx';
import ModularPartsPanel from '../components/academy/ModularPartsPanel.jsx';
import AcademyStatusPanel from '../components/academy/AcademyStatusPanel.jsx';
import AcademyBottomBar from '../components/academy/AcademyBottomBar.jsx';
import ProductViewport from '../components/academy/ProductViewport.jsx';
import { CHASSIS_TYPES, slotAcceptsPart } from '../data/assembly-parts.js';
import { findFirstOpenSlot, getEngineeringStatus } from '../utils/build-slots.js';
import { createFreshRobotDesign } from '../utils/initRobotDesign.js';
import BlockWorkshop from '../components/BlockWorkshop.jsx';
import VariantModal from '../components/VariantModal.jsx';
import SaveDesignModal from '../components/SaveDesignModal.jsx';
import LoadDesignModal from '../components/LoadDesignModal.jsx';
import WelcomeScreen from '../components/WelcomeScreen.jsx';
import { applyRobotStyle, ROBOT_STYLES } from '../services/robot-style.js';
import { useRobotStats } from '../hooks/useRobotStats.js';
import { useUiStore } from '../store/uiStore.js';

const NEXT_SLOT = ['movement', 'head', 'front', 'left', 'right', 'back', 'top', 'addon_a', 'addon_b'];

export default function DesignPage({ onGoSimulator, onGoCode, onGoMissions, onGoCreations, onGoGallery, onBack }) {
  const design = useRobotStore((s) => s.design);
  const { setDesign, replaceDesign, undo, redo, canUndo, canRedo } = useDesignActions();

  const [variants, setVariants] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('movement');
  const [snapPulse, setSnapPulse] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const controlsRef = useRef();
  const [blockLayer, setBlockLayer] = useState(0);
  const [selectedBlockType, setSelectedBlockType] = useState('cube');
  const syncedRef = useRef(false);
  const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem('vrd_welcome_done'));
  const [editingName, setEditingName] = useState(false);
  const [robotName, setRobotName] = useState('Explorer Bot');
  const [savedLabel, setSavedLabel] = useState('All changes saved');

  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const stats = useRobotStats(d);
  const triggerSnapBurst = useUiStore((s) => s.triggerSnapBurst);
  const setDragOverViewport = useUiStore((s) => s.setDragOverViewport);
  const clearDragState = useUiStore((s) => s.clearDragState);
  const buildMode = asm.buildMode || 'advanced';
  const isArm = asm.base?.shape === 'arm';
  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    replaceDesign(syncDesignFromAssembly(migrateDesign(useRobotStore.getState().design)));
  }, [replaceDesign]);

  useEffect(() => {
    VirtualRobotDB.recordMaxSpeed(stats.speed);
    const dbStats = VirtualRobotDB.getStats();
    checkAchievements(stats, dbStats).forEach((id) => VirtualRobotDB.unlockAchievement(id));
  }, [design, stats]);


  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (undo()) {
          playVrdSoundSync('undo');
          log('> undo');
        }
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (redo()) {
          playVrdSoundSync('click');
          log('> redo');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const log = () => {};

  useEffect(() => {
    setRobotName(d.name || 'Explorer Bot');
  }, [d.name]);

  const advanceSlot = (fromSlot) => {
    const slots = isArm ? ['front', 'right', 'left'] : NEXT_SLOT;
    const idx = slots.indexOf(fromSlot);
    for (let i = idx + 1; i < slots.length; i += 1) {
      if (!asm.slots?.[slots[i]]) {
        setSelectedSlot(slots[i]);
        return;
      }
    }
  };

  const showError = (message) => {
    setErrorToast(message);
    playVrdSoundSync('error');
    setTimeout(() => setErrorToast(null), 3200);
  };

  const isPartOnSlot = (design, slotId, category, partId) => {
    const slot = migrateAssembly(migrateDesign(design)).slots?.[slotId];
    return slot?.category === category && slot?.partId === partId;
  };

  const handleMountPart = (slotId, category, partId, label) => {
    if (!slotAcceptsPart(slotId, category)) {
      showError('That part does not fit this socket. Try a highlighted green socket.');
      return;
    }
    const next = placePartOnSlot(d, slotId, category, partId);
    if (!isPartOnSlot(next, slotId, category, partId)) {
      if (asm.slots[slotId]) {
        showError('This socket already has a part. Remove it first or pick another socket.');
      } else {
        showError('Could not attach part. Pick another socket and try again.');
      }
      return;
    }
    setDesign(next);
    setSnapPulse(true);
    triggerSnapBurst();
    playVrdSoundSync('snap');
    log(`> module locked: ${label}`);
    setTimeout(() => setSnapPulse(false), 600);
    if (!asm.slots[slotId]) advanceSlot(slotId);
  };

  const handlePartReuse = (_fromSlotId, category, partId, label) => {
    let slot = findFirstOpenSlot(asm.slots, category, isArm);
    if (!slot && selectedSlot && slotAcceptsPart(selectedSlot, category) && !asm.slots[selectedSlot]) {
      slot = selectedSlot;
    }
    if (slot) handleMountPart(slot, category, partId, label);
    else showError('No open socket for this part. Select a green socket on the robot first.');
  };

  const handleSetWheelCount = (count) => {
    setDesign((prev) => {
      const m = migrateDesign(prev);
      return {
        ...m,
        wheels: { ...(m.wheels || { type: 'standard', size: 'medium' }), count },
      };
    });
    playVrdSoundSync('click');
  };

  const handleUpdateBase = (patch) => {
    setDesign((prev) => updateAssemblyBase(migrateDesign(prev), patch));
    playVrdSoundSync('click');
    if (patch.shape === 'arm') setSelectedSlot('front');
    if (patch.shape && patch.shape !== 'arm') setSelectedSlot('movement');
    log('> chassis reconfigured');
  };

  const handleRemovePart = (slotId) => {
    setDesign((prev) => removePartFromSlot(migrateDesign(prev), slotId));
    playVrdSoundSync('click');
    log('> module detached');
  };

  const handleClearAll = () => {
    replaceDesign(createFreshRobotDesign(d));
    setSelectedSlot('movement');
    playVrdSoundSync('click');
    log('> all modules cleared');
  };

  const handleUndo = () => {
    if (undo()) {
      playVrdSoundSync('undo');
      log('> undo last change');
    }
  };

  const handleRedo = () => {
    if (redo()) {
      playVrdSoundSync('click');
      log('> redo');
    }
  };

  const handleWelcomeStart = (styleId) => {
    sessionStorage.setItem('vrd_welcome_done', '1');
    setShowWelcome(false);
    try {
      let next = createFreshRobotDesign(useRobotStore.getState().design);
      const buildStyle = styleId === 'blocks' ? 'blocks' : 'advanced';
      next = applyRobotStyle(next, buildStyle, { blank: true });
      replaceDesign(next);
      setSelectedSlot(buildStyle === 'blocks' ? 'movement' : 'movement');
      setRobotName('My Invention');
      playVrdSoundSync('success');
      const label = styleId === 'blocks' ? 'LEGO Inventor' : 'Modular Engineer';
      log(`> ${label} selected`);
    } catch (err) {
      console.error('[VRD] Failed to start invention lab:', err);
      replaceDesign(createFreshRobotDesign(useRobotStore.getState().design));
    }
  };

  const handleSetBuildMode = (mode) => {
    setDesign((prev) => setBuildMode(migrateDesign(prev), mode));
    playVrdSoundSync('click');
    log(`> engineering mode: ${mode.toUpperCase()}`);
  };

  const handleSlotTransform = (slotId, patch) => {
    setDesign((prev) => updateSlotTransform(migrateDesign(prev), slotId, patch));
    playVrdSoundSync('click');
  };

  const handleSetVisualMode = (mode) => {
    setDesign((prev) => setVisualMode(migrateDesign(prev), mode));
  };

  const handlePlaceBlock = (typeId, gx, gy, gz) => {
    setDesign((prev) => placeBlock(migrateDesign(prev), typeId, gx, gy, gz));
    setSnapPulse(true);
    playVrdSoundSync('snap');
    log(`> block snapped: ${typeId}`);
    setTimeout(() => setSnapPulse(false), 500);
  };

  const handleRemoveBlock = (blockId) => {
    setDesign((prev) => removeBlock(migrateDesign(prev), blockId));
    log('> block removed');
  };

  const handleRotateBlock = (blockId) => {
    setDesign((prev) => rotateBlock(migrateDesign(prev), blockId));
    log('> block rotated 90°');
  };

  const handleClearBlocks = () => {
    setDesign((prev) => clearBlocks(migrateDesign(prev)));
    log('> block stack cleared');
  };

  const handleApplyBlueprint = (bp) => {
    setDesign((prev) => applyBlueprint(migrateDesign(prev), bp));
    playVrdSoundSync('success');
    log(`> blueprint loaded: ${bp.name}`);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await vrdApi.generateVariants(d.id || 'draft', d);
      setVariants(result);
      setShowVariantModal(true);
      playVrdSoundSync('success');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = (fields) => {
    const result = VirtualRobotDB.saveDesign({ ...d, ...fields });
    if (!result.ok) {
      const msg = result.error === 'storage_full'
        ? 'Storage is full. Delete old designs or free browser space, then try again.'
        : 'Could not save your design. Check your connection and try again.';
      showError(msg);
      return;
    }
    replaceDesign(result.design);
    setShowSave(false);
    setSavedToast(true);
    setSavedLabel('All changes saved');
    playVrdSoundSync('save');
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleRobotNameSave = () => {
    const trimmed = robotName.trim() || 'Explorer Bot';
    setDesign((prev) => ({ ...migrateDesign(prev), name: trimmed }));
    setEditingName(false);
    setSavedLabel('All changes saved');
  };

  const handleHeaderNav = (id) => {
    if (id === 'test') onGoSimulator?.();
    else if (id === 'code') onGoCode?.();
    else if (id === 'missions') onGoMissions?.();
    else if (id === 'creations') onGoCreations?.();
    else if (id === 'gallery') onGoGallery?.();
  };

  const handleCalibrate = () => {
    playVrdSoundSync('click');
    setSavedLabel('Calibration complete');
  };

  const handleLoadDesign = (loaded) => {
    replaceDesign(loaded);
    log(`> design loaded: ${loaded.name || 'My Robot'}`);
  };

  const handleDropPart = (payload) => {
    if (payload.type === 'chassis') {
      const chassis = CHASSIS_TYPES.find((c) => c.id === payload.id);
      if (chassis) {
        handleUpdateBase({
          chassisType: chassis.id,
          shape: chassis.meshShape,
          width: chassis.width,
          height: chassis.height,
          depth: chassis.depth,
          scale: chassis.scale,
          color: asm.base.color || '#FFFFFF',
          material: 'industrial',
        });
        if (!asm.slots.movement && chassis.meshShape !== 'arm') setSelectedSlot('movement');
      }
      return;
    }
    if (payload.type === 'part' || (payload.category && payload.id)) {
      const { category, id, label } = payload;
      let slot = selectedSlot;
      if (!slot || !slotAcceptsPart(slot, category)) {
        slot = findFirstOpenSlot(asm.slots, category, isArm);
      }
      if (slot && slotAcceptsPart(slot, category)) {
        handleMountPart(slot, category, id, label);
      } else {
        showError('No valid socket for this part. Drag onto a green socket or pick one in the parts panel.');
      }
    }
  };

  const handleTestInSimulator = () => {
    const spec = exportRobotSpec(migrateDesign(d));
    sessionStorage.setItem('vrd_sim_robot_spec', JSON.stringify(spec));
    useRobotStore.setState({ simAutoRun: true });
    onGoSimulator?.();
  };

  const statusText = getEngineeringStatus(asm, isArm);

  const handleViewportDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
    setDragOverViewport(true);
  };

  return (
    <div className="vrd-designer">
      {savedToast && (
        <motion.div className="vrd-toast" role="status" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          ✓ Design saved!
        </motion.div>
      )}
      {errorToast && (
        <motion.div className="vrd-toast vrd-toast--error" role="alert" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {errorToast}
        </motion.div>
      )}

      {showWelcome && (
        <WelcomeScreen onStart={handleWelcomeStart} />
      )}

      {!showWelcome && (
        <>
        <AcademyHeader
          className="vrd-designer-header"
          onNav={handleHeaderNav}
          onBack={onBack || (() => { window.location.hash = 'dashboard'; })}
        />

      <div className="vrd-designer-body">
        <aside className="vrd-designer-left">
          {buildMode === 'blocks' ? (
            <div className="bb-parts-panel">
              <BlockWorkshop
                design={d}
                onPlaceBlock={handlePlaceBlock}
                onRemoveBlock={handleRemoveBlock}
                onRotateBlock={handleRotateBlock}
                onClearBlocks={handleClearBlocks}
                blockLayer={blockLayer}
                onBlockLayerChange={setBlockLayer}
                selectedBlockType={selectedBlockType}
                onSelectBlockType={setSelectedBlockType}
              />
            </div>
          ) : (
            <ModularPartsPanel
              design={d}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              onMountPart={handleMountPart}
              onRemovePart={handleRemovePart}
              onUpdateBase={handleUpdateBase}
              onSetBuildMode={handleSetBuildMode}
              onSlotTransform={handleSlotTransform}
              onSetVisualMode={handleSetVisualMode}
              onSetWheelCount={handleSetWheelCount}
            />
          )}
        </aside>

        <main className="vrd-designer-center">
          {buildMode === 'blocks' ? (
            <InteractiveBuildChamber
              design={d}
              highlightSlot={selectedSlot}
              snapPulse={snapPulse}
              buildMode={buildMode}
              visualStyle="product"
              blockLayer={blockLayer}
              selectedBlockType={selectedBlockType}
              onPlaceBlock={handlePlaceBlock}
              onRemoveBlock={handleRemoveBlock}
            />
          ) : (
            <ProductViewport
              design={d}
              highlightSlot={selectedSlot}
              snapPulse={snapPulse}
              dragOver={dragOver}
              controlsRef={controlsRef}
              robotName={robotName}
              editingName={editingName}
              onEditName={() => setEditingName(true)}
              onNameChange={setRobotName}
              onNameSave={handleRobotNameSave}
              statusText={statusText}
              onSocketSelect={(slotId) => {
                setSelectedSlot(slotId);
                playVrdSoundSync('click');
              }}
              onSocketRemove={(slotId) => {
                handleRemovePart(slotId);
                setSelectedSlot(slotId);
              }}
              onDragOver={handleViewportDragOver}
              onDragLeave={() => {
                setDragOver(false);
                setDragOverViewport(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                clearDragState();
                const chassisId = e.dataTransfer.getData('application/vrd-chassis');
                if (chassisId) {
                  handleDropPart({ type: 'chassis', id: chassisId });
                  return;
                }
                const raw = e.dataTransfer.getData('application/vrd-part');
                if (raw) {
                  try {
                    handleDropPart({ type: 'part', ...JSON.parse(raw) });
                  } catch { /* ignore */ }
                }
              }}
              onPaint={() => setSelectedSlot('head')}
              onClear={handleClearAll}
              onUndo={handleUndo}
              onCode={() => onGoCode?.()}
              onTest={handleTestInSimulator}
              canUndo={canUndo}
            />
          )}
        </main>

        <aside className="vrd-designer-right">
          <AcademyStatusPanel
            stats={stats}
            design={d}
            onTest={handleTestInSimulator}
            onCalibrate={handleCalibrate}
            onReset={handleClearAll}
            onSave={() => setShowSave(true)}
            onLoad={() => setShowLoad(true)}
          />
        </aside>
      </div>

      <footer className="vrd-designer-bottom">
        <AcademyBottomBar
          design={d}
          buildMode={buildMode}
          onSetBuildMode={handleSetBuildMode}
          onPartReuse={handlePartReuse}
          onAddPart={() => setSelectedSlot(isArm ? 'front' : 'movement')}
        />
      </footer>
        </>
      )}

      {showVariantModal && (
        <VariantModal
          variants={variants}
          onClose={() => setShowVariantModal(false)}
          onLoad={(next) => replaceDesign(migrateDesign(next))}
          onTest={() => onGoSimulator?.()}
          onSave={(v) => handleSave({ ...v.robot_config, name: v.variant_name })}
        />
      )}
      {showSave && <SaveDesignModal design={d} onSave={handleSave} onClose={() => setShowSave(false)} />}
      {showLoad && <LoadDesignModal onLoad={handleLoadDesign} onClose={() => setShowLoad(false)} />}
    </div>
  );
}
