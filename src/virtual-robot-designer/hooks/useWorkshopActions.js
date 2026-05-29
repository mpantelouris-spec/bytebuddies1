/**
 * Shared invention workshop state + handlers (designer ↔ simulator same robot entity).
 */
import { useState, useEffect, useRef } from 'react';
import { migrateDesign } from '../config.js';
import {
  placePartOnSlot,
  removePartFromSlot,
  updateAssemblyBase,
  clearAllParts,
  syncDesignFromAssembly,
  migrateAssembly,
  setVisualMode,
} from '../services/assembly-service.js';
import {
  setBuildMode,
  placeBlock,
  removeBlock,
  rotateBlock,
  clearBlocks,
} from '../services/block-service.js';
import { checkAchievements } from '../services/design-service.js';
import { exportRobotSpec } from '../services/robot-schema.js';
import VirtualRobotDB from '../database/virtual-robot-db.js';
import { useRobotStore, useDesignActions } from '../store/robotStore.js';
import { useUiStore } from '../store/uiStore.js';
import { playVrdSoundSync } from '../utils/vrdSound.js';
import { CHASSIS_TYPES, slotAcceptsPart } from '../data/assembly-parts.js';
import { findFirstOpenSlot } from '../utils/build-slots.js';
import { createFreshRobotDesign } from '../utils/initRobotDesign.js';
import { applyRobotStyle } from '../services/robot-style.js';
import { useRobotStats } from './useRobotStats.js';
import { generateRobotClassPython } from '../services/robot-code-generator.js';

function emptyProgram() {
  return { mode: 'blocks', blocks: [], python: '', javascript: '' };
}

const NEXT_SLOT = ['movement', 'head', 'front', 'left', 'right', 'back', 'top', 'addon_a', 'addon_b'];

export function useWorkshopActions() {
  const design = useRobotStore((s) => s.design);
  const { setDesign, replaceDesign, undo, redo, canUndo, canRedo } = useDesignActions();

  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('movement');
  const [snapPulse, setSnapPulse] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [blockLayer, setBlockLayer] = useState(0);
  const [selectedBlockType, setSelectedBlockType] = useState('cube');
  const syncedRef = useRef(false);
  const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem('vrd_welcome_done'));
  const [robotName, setRobotName] = useState('My Invention');
  const [editingName, setEditingName] = useState(false);

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
    setRobotName(d.name || 'My Invention');
  }, [d.name]);

  const showError = (message) => {
    setErrorToast(message);
    playVrdSoundSync('error');
    setTimeout(() => setErrorToast(null), 3200);
  };

  const isPartOnSlot = (des, slotId, category, partId) => {
    const slot = migrateAssembly(migrateDesign(des)).slots?.[slotId];
    return slot?.category === category && slot?.partId === partId;
  };

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

  const handleMountPart = (slotId, category, partId, label) => {
    if (!slotAcceptsPart(slotId, category)) {
      showError(`Cannot attach ${label || partId} to that socket — try a green glow spot!`);
      return;
    }
    const next = placePartOnSlot(d, slotId, category, partId);
    if (!isPartOnSlot(next, slotId, category, partId)) {
      showError('Could not attach — try a green socket!');
      return;
    }
    setDesign(next);
    setSelectedSlot(slotId);
    setSnapPulse(true);
    useUiStore.getState().setSnapPulseSlot(slotId);
    triggerSnapBurst();
    playVrdSoundSync('snap');
    setTimeout(() => {
      setSnapPulse(false);
      useUiStore.getState().setSnapPulseSlot(null);
    }, 600);
    if (!asm.slots[slotId]) advanceSlot(slotId);
  };

  const handleUpdateBase = (patch) => {
    setDesign((prev) => updateAssemblyBase(migrateDesign(prev), patch));
    playVrdSoundSync('snap');
    if (patch.shape === 'arm') setSelectedSlot('front');
    else if (patch.shape) setSelectedSlot('movement');
  };

  const handleRemovePart = (slotId) => {
    setDesign((prev) => removePartFromSlot(migrateDesign(prev), slotId));
    playVrdSoundSync('click');
  };

  const handleClearAll = () => {
    replaceDesign(createFreshRobotDesign(d));
    setSelectedSlot('movement');
    playVrdSoundSync('click');
  };

  const handleSetWheelCount = (count) => {
    setDesign((prev) => {
      const m = migrateDesign(prev);
      return { ...m, wheels: { ...(m.wheels || { type: 'standard', size: 'medium' }), count } };
    });
    playVrdSoundSync('click');
  };

  const handleWelcomeStart = (styleId) => {
    sessionStorage.setItem('vrd_welcome_done', '1');
    setShowWelcome(false);
    let next = createFreshRobotDesign(useRobotStore.getState().design);
    next = applyRobotStyle(next, styleId === 'blocks' ? 'blocks' : 'advanced', { blank: true });
    replaceDesign(next);
    setRobotName('My Invention');
    playVrdSoundSync('success');
  };

  const handleSetBuildMode = (mode) => {
    setDesign((prev) => setBuildMode(migrateDesign(prev), mode));
    playVrdSoundSync('click');
  };

  const handleSave = (fields) => {
    const result = VirtualRobotDB.saveDesign({ ...d, ...fields });
    if (!result.ok) {
      showError(result.error === 'storage_full' ? 'Storage full — delete an old robot first.' : 'Could not save. Try again!');
      return;
    }
    replaceDesign(result.design);
    setShowSave(false);
    setSavedToast(true);
    playVrdSoundSync('save');
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleLoadDesign = (loaded) => {
    replaceDesign(loaded);
    playVrdSoundSync('success');
  };

  const handleRobotNameSave = () => {
    const trimmed = robotName.trim() || 'My Invention';
    setDesign((prev) => ({ ...migrateDesign(prev), name: trimmed }));
    setEditingName(false);
  };

  function handleCodeMyRobot(onGoCode) {
    const python = generateRobotClassPython(migrateDesign(d));
    const prog = d.program || emptyProgram();
    setDesign((prev) => ({
      ...migrateDesign(prev),
      program: { ...prog, mode: 'python', python },
    }));
    playVrdSoundSync('success');
    onGoCode?.();
  }

  const handleDropPart = (payload, forcedSlot = null) => {
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
      }
      return;
    }
    if (payload.type === 'part' || payload.category) {
      const { category, id, label } = payload;
      const hovered = forcedSlot || useUiStore.getState().hoveredSocket;
      let slot = hovered;
      if (!slot || !slotAcceptsPart(slot, category)) {
        slot = selectedSlot;
      }
      if (!slot || !slotAcceptsPart(slot, category)) {
        slot = findFirstOpenSlot(asm.slots, category, isArm);
      }
      if (slot && slotAcceptsPart(slot, category)) {
        handleMountPart(slot, category, id, label);
      } else if (hovered && !slotAcceptsPart(hovered, category)) {
        showError(`Cannot attach ${label || id} to that socket — wrong spot!`);
      } else {
        showError('No room for that part — drag to a green glowing socket!');
      }
    }
  };

  const handleTestInSimulator = (onGoSimulator) => {
    const spec = exportRobotSpec(migrateDesign(d));
    sessionStorage.setItem('vrd_sim_robot_spec', JSON.stringify(spec));
    useRobotStore.setState({ simAutoRun: true });
    onGoSimulator?.();
  };

  const updateDragPointer = (e) => {
    const canvas = e.currentTarget.querySelector('.iw-hero-canvas');
    const rect = canvas?.getBoundingClientRect();
    if (rect) {
      useUiStore.getState().setDragPointer({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  const handleViewportDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
    setDragOverViewport(true);
    updateDragPointer(e);
  };

  const handleViewportDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const hovered = useUiStore.getState().hoveredSocket;
    clearDragState();
    const chassisId = e.dataTransfer.getData('application/vrd-chassis');
    if (chassisId) {
      handleDropPart({ type: 'chassis', id: chassisId });
      return;
    }
    const raw = e.dataTransfer.getData('application/vrd-part');
    if (raw) {
      try {
        handleDropPart({ type: 'part', ...JSON.parse(raw) }, hovered);
      } catch { /* ignore */ }
    }
  };

  return {
    d,
    asm,
    stats,
    buildMode,
    isArm,
    robotName,
    setRobotName,
    editingName,
    setEditingName,
    selectedSlot,
    setSelectedSlot,
    snapPulse,
    dragOver,
    showWelcome,
    showSave,
    setShowSave,
    showLoad,
    setShowLoad,
    savedToast,
    errorToast,
    canUndo,
    canRedo,
    blockLayer,
    setBlockLayer,
    selectedBlockType,
    setSelectedBlockType,
    handleMountPart,
    handleUpdateBase,
    handleRemovePart,
    handleClearAll,
    handleUndo: () => undo() && playVrdSoundSync('undo'),
    handleRedo: () => redo() && playVrdSoundSync('click'),
    handleWelcomeStart,
    handleSetBuildMode,
    handleSetWheelCount,
    handleSave,
    handleLoadDesign,
    handleRobotNameSave,
    handleDropPart,
    handleTestInSimulator,
    handleCodeMyRobot,
    handleViewportDragOver,
    handleViewportDrop,
    setDragOver: (v) => { setDragOver(v); if (!v) setDragOverViewport(false); },
    setDesign,
    placeBlock: (typeId, gx, gy, gz) => {
      setDesign((prev) => placeBlock(migrateDesign(prev), typeId, gx, gy, gz));
      setSnapPulse(true);
      playVrdSoundSync('snap');
      setTimeout(() => setSnapPulse(false), 500);
    },
    removeBlock: (id) => setDesign((prev) => removeBlock(migrateDesign(prev), id)),
    rotateBlock: (id) => setDesign((prev) => rotateBlock(migrateDesign(prev), id)),
    clearBlocks: () => setDesign((prev) => clearBlocks(migrateDesign(prev))),
    setVisualMode: (mode) => setDesign((prev) => setVisualMode(migrateDesign(prev), mode)),
  };
}
