/**
 * HangarExperience.jsx
 * The complete immersive futuristic robotics hangar experience.
 * Full-screen 3D canvas + all floating holographic UI overlays.
 * This is the NEW Virtual Robot Designer.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useRobotStore, useDesignActions } from '../store/robotStore.js';
import { migrateDesign } from '../config.js';
import {
  placePartOnSlot,
  updateAssemblyBase,
  clearAllParts,
  syncDesignFromAssembly,
  migrateAssembly,
} from '../services/assembly-service.js';
import {
  setBuildMode,
  applyBlueprint,
} from '../services/block-service.js';
import { exportRobotSpec } from '../services/robot-schema.js';
import VirtualRobotDB           from '../database/virtual-robot-db.js';
import { playVrdSoundSync }     from '../utils/vrdSound.js';
import { ROBOT_BLUEPRINTS }     from '../data/blueprints.js';

import CinematicAssemblyChamber from './CinematicAssemblyChamber.jsx';
import HoloEngineeringPanel     from './HoloEngineeringPanel.jsx';
import AICoreDiagnostics        from './AICoreDiagnostics.jsx';
import CommandTerminal          from './CommandTerminal.jsx';

import '../styles/hangar-experience.css';

/* ── Blueprint overlay ──────────────────────────────────────── */
function BlueprintOverlay({ onSelect, onClose }) {
  return (
    <motion.div
      className="blueprint-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="blueprint-title">SELECT BLUEPRINT</div>
      <div className="blueprint-subtitle">Choose a starting configuration — fully editable</div>

      <motion.div
        className="blueprint-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        {/* Blank start */}
        <motion.div
          className="blueprint-card"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(null)}
        >
          <span className="blueprint-card-icon">⬡</span>
          <div className="blueprint-card-name">Blank Build</div>
          <div className="blueprint-card-desc">Start from scratch</div>
        </motion.div>

        {ROBOT_BLUEPRINTS.map(bp => (
          <motion.div
            key={bp.id}
            className="blueprint-card"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(bp)}
          >
            <span className="blueprint-card-icon">{bp.icon}</span>
            <div className="blueprint-card-name">{bp.name}</div>
            <div className="blueprint-card-desc">{bp.desc}</div>
          </motion.div>
        ))}
      </motion.div>

      <button className="blueprint-close-btn" onClick={onClose}>
        ✕ Cancel
      </button>
    </motion.div>
  );
}

/* ── Toast message ──────────────────────────────────────────── */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="hangar-toast"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      {message}
    </motion.div>
  );
}

/* ── Code Studio / Simulator inner views (minimal wrappers) ─── */
function CodeView({ onBack }) {
  const CodeStudioPage = React.lazy(() => import('../pages/CodeStudio.jsx'));
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 150,
      background: '#000814',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(0,200,255,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="hangar-back-btn" onClick={onBack} style={{ position: 'static' }}>
          ← Back to Hangar
        </button>
        <span style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(0,200,255,0.65)', textTransform: 'uppercase' }}>
          Code Studio
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <React.Suspense fallback={<div style={{ color: '#00d4ff', padding: 40, textAlign: 'center' }}>Loading...</div>}>
          <CodeStudioPage onGoSimulator={onBack} onGoDesign={onBack} />
        </React.Suspense>
      </div>
    </div>
  );
}

function SimView({ onBack }) {
  const SimulatorPage = React.lazy(() => import('../pages/Simulator.jsx'));
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 150,
      background: '#000814',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(0,200,255,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="hangar-back-btn" onClick={onBack} style={{ position: 'static' }}>
          ← Back to Hangar
        </button>
        <span style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(0,200,255,0.65)', textTransform: 'uppercase' }}>
          Simulator
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <React.Suspense fallback={<div style={{ color: '#00d4ff', padding: 40, textAlign: 'center' }}>Loading...</div>}>
          <SimulatorPage onGoDesign={onBack} onGoCode={onBack} />
        </React.Suspense>
      </div>
    </div>
  );
}

function CreationsView({ onBack }) {
  const MyCreationsPage = React.lazy(() => import('../pages/MyCreations.jsx'));
  const { replaceDesign } = useDesignActions();
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 150,
      background: '#000814',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(0,200,255,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="hangar-back-btn" onClick={onBack} style={{ position: 'static' }}>
          ← Back to Hangar
        </button>
        <span style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(0,200,255,0.65)', textTransform: 'uppercase' }}>
          My Robots
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <React.Suspense fallback={<div style={{ color: '#00d4ff', padding: 40, textAlign: 'center' }}>Loading...</div>}>
          <MyCreationsPage
            onLoadDesign={(d) => { replaceDesign(migrateDesign(d)); onBack(); }}
            onGoDesign={onBack}
            onGoSimulator={onBack}
          />
        </React.Suspense>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN HANGAR EXPERIENCE
   ═══════════════════════════════════════════════════════════ */
export default function HangarExperience() {
  const design          = useRobotStore(s => s.design);
  const { setDesign, replaceDesign, undo, redo } = useDesignActions();

  const [innerView,       setInnerView]       = useState(null);  // null | 'code' | 'test' | 'bots'
  const [showBlueprints,  setShowBlueprints]  = useState(false);
  const [toast,           setToast]           = useState(null);
  const [terminalLines,   setTerminalLines]   = useState([]);
  const [robotName,       setRobotName]       = useState('');
  const [editingName,     setEditingName]     = useState(false);
  const syncedRef = useRef(false);

  // Sync design on mount
  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    replaceDesign(syncDesignFromAssembly(migrateDesign(useRobotStore.getState().design)));
  }, [replaceDesign]);

  // Derive robot name from design
  useEffect(() => {
    setRobotName(design?.name || 'My Robot');
  }, [design?.name]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo();
        log({ text: '> undo applied', type: 'sys' });
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo();
        log({ text: '> redo applied', type: 'sys' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const log = useCallback((entry) => {
    const text = typeof entry === 'string' ? entry : entry.text;
    setTerminalLines(prev => [...prev.slice(-30), text]);
  }, []);

  const showToast = (msg) => setToast(msg);

  /* ── Handlers ── */

  const handleMountPart = useCallback((slotId, category, partId, label) => {
    setDesign(prev => placePartOnSlot(migrateDesign(prev), slotId, category, partId));
    playVrdSoundSync('snap');
    log(`> module locked: ${label} → [${slotId.toUpperCase()}]`);
    showToast(`${label} installed`);
  }, [setDesign, log]);

  const handleUpdateBase = useCallback((patch) => {
    setDesign(prev => updateAssemblyBase(migrateDesign(prev), patch));
    playVrdSoundSync('click');
    if (patch.chassisType) log(`> chassis reconfigured: ${patch.chassisType.toUpperCase()}`);
    if (patch.material)    log(`> hull material: ${patch.material.toUpperCase()}`);
  }, [setDesign, log]);

  const handleBuildModeChange = useCallback((mode) => {
    setDesign(prev => setBuildMode(migrateDesign(prev), mode));
    playVrdSoundSync('click');
    log({ text: `> build mode: ${mode === 'blocks' ? 'LEGO BLOCK ASSEMBLY' : 'ADVANCED ROBOTICS'}`, type: 'sys' });
    showToast(mode === 'blocks' ? 'LEGO Mode active' : 'Advanced Mode active');
  }, [setDesign, log]);

  const handleColorChange = useCallback((color) => {
    setDesign(prev => {
      const d = migrateDesign(prev);
      return { ...d, cosmetics: { ...(d.cosmetics || {}), primaryColor: color, ledColor: color } };
    });
    playVrdSoundSync('click');
    log({ text: `> hull colour updated: ${color}`, type: 'ai' });
  }, [setDesign, log]);

  const handleBlueprintSelect = useCallback((bp) => {
    if (!bp) {
      setDesign(prev => clearAllParts(migrateDesign(prev)));
      log({ text: '> starting blank build — all modules cleared', type: 'sys' });
    } else {
      setDesign(prev => applyBlueprint(migrateDesign(prev), bp));
      log({ text: `> blueprint loaded: ${bp.name.toUpperCase()}`, type: 'sys' });
      showToast(`Blueprint: ${bp.name} loaded`);
    }
    setShowBlueprints(false);
    playVrdSoundSync('snap');
  }, [setDesign, log]);

  const handleRobotNameSave = () => {
    const trimmed = robotName.trim() || 'My Robot';
    setDesign(prev => ({ ...migrateDesign(prev), name: trimmed }));
    setEditingName(false);
    log({ text: `> robot renamed: "${trimmed}"`, type: 'info' });
  };

  const handleSaveDesign = () => {
    try {
      VirtualRobotDB.saveDesign(design);
      log({ text: '> design saved to local storage', type: null });
      showToast('Design saved!');
      playVrdSoundSync('snap');
    } catch {
      log({ text: '> save failed', type: 'err' });
    }
  };

  const handleTestInSimulator = () => {
    // Store robot spec for simulator
    const spec = exportRobotSpec(migrateDesign(design));
    sessionStorage.setItem('vrd_sim_robot_spec', JSON.stringify(spec));
    log({ text: '> transferring robot to simulator...', type: 'sys' });
    log({ text: '> robot spec serialised — all modules included', type: null });
    useRobotStore.setState({ simAutoRun: true });
    setInnerView('test');
    playVrdSoundSync('snap');
  };

  const goBack = () => { window.location.hash = 'dashboard'; };

  const d   = migrateDesign(design);
  const asm = migrateAssembly(d);

  /* ── Inner view overlay ── */
  if (innerView === 'code') {
    return <div className="hangar-root"><CodeView onBack={() => setInnerView(null)} /></div>;
  }
  if (innerView === 'test') {
    return <div className="hangar-root"><SimView onBack={() => setInnerView(null)} /></div>;
  }
  if (innerView === 'bots') {
    return <div className="hangar-root"><CreationsView onBack={() => setInnerView(null)} /></div>;
  }

  return (
    <div className="hangar-root">
      {/* ── Full-screen 3D Scene ── */}
      <CinematicAssemblyChamber design={d} onPartAdd={handleMountPart} />

      {/* ── Top status bar ── */}
      <div className="hangar-topbar">
        <button className="hangar-back-btn" onClick={goBack}>← ByteBuddies</button>

        {/* Robot name */}
        <div className="hangar-robot-title">
          {editingName ? (
            <input
              className="hangar-robot-name-input"
              value={robotName}
              onChange={e => setRobotName(e.target.value)}
              onBlur={handleRobotNameSave}
              onKeyDown={e => { if (e.key === 'Enter') handleRobotNameSave(); }}
              autoFocus
            />
          ) : (
            <div
              className="hangar-robot-name"
              onClick={() => setEditingName(true)}
              title="Click to rename"
              style={{ cursor: 'pointer' }}
            >
              {design?.name || 'MY ROBOT'}
            </div>
          )}
          <div className="hangar-robot-subtitle">
            {asm.buildMode === 'blocks' ? '🧱 LEGO Mode' : '🤖 Advanced Mode'} · {Object.values(asm.slots || {}).filter(Boolean).length} modules
          </div>
        </div>

        {/* Mode navigation */}
        <nav className="hangar-mode-nav">
          <button className="hangar-mode-btn active">BUILD</button>
          <button className="hangar-mode-btn" onClick={() => setInnerView('code')}>CODE</button>
          <button className="hangar-mode-btn mode-test" onClick={handleTestInSimulator}>⚡ TEST</button>
          <button className="hangar-mode-btn" onClick={() => setInnerView('bots')}>MY BOTS</button>
          <button className="hangar-mode-btn" onClick={handleSaveDesign} title="Save design">💾</button>
        </nav>
      </div>

      {/* ── Left holographic engineering panel ── */}
      <HoloEngineeringPanel
        design={d}
        onMountPart={handleMountPart}
        onUpdateBase={handleUpdateBase}
        onBuildModeChange={handleBuildModeChange}
        onColorChange={handleColorChange}
        onShowBlueprints={() => setShowBlueprints(true)}
      />

      {/* ── Right AI Core diagnostics ── */}
      <AICoreDiagnostics design={d} />

      {/* ── Bottom command terminal ── */}
      <CommandTerminal lines={terminalLines} design={d} />

      {/* ── Floating action buttons ── */}
      <div className="hangar-actions">
        <motion.button
          className="holo-action-btn"
          onClick={() => {
            setDesign(prev => clearAllParts(migrateDesign(prev)));
            log({ text: '> all modules detached — clean slate', type: 'warn' });
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          ✕ Clear
        </motion.button>

        <motion.button
          className="holo-action-btn"
          onClick={() => { if (undo()) log({ text: '> undo', type: 'sys' }); }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          ↩ Undo
        </motion.button>

        <motion.button
          className="holo-action-btn"
          onClick={() => setInnerView('code')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          ⌨ Program
        </motion.button>

        <motion.button
          className="holo-action-btn primary"
          onClick={handleTestInSimulator}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ⚡ Test in Simulator
        </motion.button>
      </div>

      {/* ── Blueprint overlay ── */}
      <AnimatePresence>
        {showBlueprints && (
          <BlueprintOverlay
            onSelect={handleBlueprintSelect}
            onClose={() => setShowBlueprints(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
