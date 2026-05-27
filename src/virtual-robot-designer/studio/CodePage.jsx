/**
 * CodePage.jsx
 * Visual block-coding studio for robots.
 * 
 * Layout: Left panel (block palette) | Center (workspace) | Right (robot preview + run)
 * 
 * Blocks unlock dynamically based on robot parts:
 *  - wheels/tracks/legs/flying → movement blocks
 *  - camera → vision blocks
 *  - ultrasonic/lidar → scan blocks
 *  - grabber/claw → grab blocks
 *  - drill → drill blocks
 *  - laser → laser blocks
 *  - lights → light blocks
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { buildRobotModel } from '../services/studio-robot-builder.js';

// ─── Block Definitions ───────────────────────────────────────────────────────
const BLOCK_PALETTE = [
  // ── Movement (always unlocked) ──────────────────────────────────────────
  { id: 'move_forward',  category: 'move',    icon: '⬆️',  label: 'Move Forward',   color: '#22c55e', darkColor: '#15803d', requires: null, params: [{ name: 'steps', type: 'range', min: 1, max: 10, default: 2, unit: 'steps' }] },
  { id: 'move_backward', category: 'move',    icon: '⬇️',  label: 'Move Backward',  color: '#22c55e', darkColor: '#15803d', requires: null, params: [{ name: 'steps', type: 'range', min: 1, max: 10, default: 1, unit: 'steps' }] },
  { id: 'turn_left',     category: 'move',    icon: '↺',    label: 'Turn Left',      color: '#3b82f6', darkColor: '#1d4ed8', requires: null, params: [{ name: 'degrees', type: 'select', options: [45, 90, 135, 180], default: 90, unit: '°' }] },
  { id: 'turn_right',    category: 'move',    icon: '↻',    label: 'Turn Right',     color: '#3b82f6', darkColor: '#1d4ed8', requires: null, params: [{ name: 'degrees', type: 'select', options: [45, 90, 135, 180], default: 90, unit: '°' }] },
  { id: 'spin',          category: 'move',    icon: '🌀',   label: 'Spin Around',    color: '#06b6d4', darkColor: '#0e7490', requires: null, params: [] },
  { id: 'stop',          category: 'move',    icon: '⏹',   label: 'Stop',           color: '#ef4444', darkColor: '#b91c1c', requires: null, params: [] },
  { id: 'wait',          category: 'control', icon: '⏸',   label: 'Wait',           color: '#8b5cf6', darkColor: '#5b21b6', requires: null, params: [{ name: 'seconds', type: 'range', min: 0.5, max: 5, step: 0.5, default: 1, unit: 's' }] },
  { id: 'repeat',        category: 'control', icon: '🔁',  label: 'Repeat',         color: '#ec4899', darkColor: '#9d174d', requires: null, params: [{ name: 'times', type: 'range', min: 2, max: 10, default: 3, unit: 'times' }], hasBody: true },
  // ── Hover / Drone (unlocked by flying movement) ─────────────────────────
  { id: 'fly_up',        category: 'move',    icon: '🚀',  label: 'Fly Up',         color: '#0ea5e9', darkColor: '#0369a1', requires: ['flying', 'jets'], params: [{ name: 'height', type: 'range', min: 1, max: 5, default: 2, unit: 'm' }] },
  { id: 'fly_down',      category: 'move',    icon: '📉',  label: 'Fly Down',       color: '#0ea5e9', darkColor: '#0369a1', requires: ['flying', 'jets'], params: [{ name: 'height', type: 'range', min: 1, max: 5, default: 2, unit: 'm' }] },
  // ── Sensing (unlocked by sensors) ───────────────────────────────────────
  { id: 'scan',          category: 'sense',   icon: '📡',  label: 'Scan Distance',  color: '#f97316', darkColor: '#c2410c', requires: ['ultrasonic', 'lidar'], params: [] },
  { id: 'if_obstacle',   category: 'sense',   icon: '🚧',  label: 'If Obstacle',    color: '#f97316', darkColor: '#c2410c', requires: ['ultrasonic', 'lidar'], params: [{ name: 'action', type: 'select', options: ['turn left', 'turn right', 'stop', 'back up'], default: 'turn left' }], hasBody: false },
  { id: 'look',          category: 'sense',   icon: '👁',  label: 'Look for Object',color: '#a855f7', darkColor: '#7e22ce', requires: ['camera'], params: [] },
  { id: 'if_see_object', category: 'sense',   icon: '🎯',  label: 'If I See Object',color: '#a855f7', darkColor: '#7e22ce', requires: ['camera'], params: [], hasBody: false },
  // ── Tools (unlocked by tools) ────────────────────────────────────────────
  { id: 'grab',          category: 'tools',   icon: '✊',  label: 'Grab Object',    color: '#d97706', darkColor: '#92400e', requires: ['grabber', 'claw'], params: [] },
  { id: 'release',       category: 'tools',   icon: '👐', label: 'Release',         color: '#d97706', darkColor: '#92400e', requires: ['grabber', 'claw'], params: [] },
  { id: 'drill',         category: 'tools',   icon: '🔩',  label: 'Drill',          color: '#6b7280', darkColor: '#374151', requires: ['drill'], params: [{ name: 'seconds', type: 'range', min: 1, max: 5, default: 2, unit: 's' }] },
  { id: 'fire_laser',    category: 'tools',   icon: '⚡',  label: 'Fire Laser',     color: '#c026d3', darkColor: '#7e22ce', requires: ['laser'], params: [] },
  // ── Lights (unlocked by lights) ──────────────────────────────────────────
  { id: 'lights_on',     category: 'lights',  icon: '💡',  label: 'Lights On',      color: '#fbbf24', darkColor: '#d97706', requires: ['led-white', 'led-cyan', 'led-red', 'searchlight', 'strobes', 'ring'], params: [] },
  { id: 'lights_off',    category: 'lights',  icon: '🌑',  label: 'Lights Off',     color: '#fbbf24', darkColor: '#d97706', requires: ['led-white', 'led-cyan', 'led-red', 'searchlight', 'strobes', 'ring'], params: [] },
  { id: 'flash',         category: 'lights',  icon: '✨',  label: 'Flash Lights',   color: '#fbbf24', darkColor: '#d97706', requires: ['strobes', 'ring', 'led-cyan', 'led-red'], params: [{ name: 'times', type: 'range', min: 1, max: 5, default: 3, unit: 'x' }] },
];

const CATEGORIES = [
  { id: 'move',    label: '⚙️ Movement', color: '#22c55e' },
  { id: 'control', label: '🔁 Control',  color: '#ec4899' },
  { id: 'sense',   label: '📡 Sensing',  color: '#f97316' },
  { id: 'tools',   label: '🔧 Tools',    color: '#d97706' },
  { id: 'lights',  label: '💡 Lights',   color: '#fbbf24' },
];

// ─── Check if a block is unlocked by the robot's parts ───────────────────────
function isUnlocked(block, robotConfig) {
  if (!block.requires) return true;
  const req = Array.isArray(block.requires) ? block.requires : [block.requires];
  // movement blocks: check movement type
  const movementTypes = ['wheels', 'wheels6', 'tracks', 'legs', 'flying', 'jets'];
  if (req.some(r => movementTypes.includes(r))) {
    return req.includes(robotConfig.movementId);
  }
  // sensor blocks
  if (req.some(r => ['ultrasonic', 'lidar', 'camera'].includes(r))) {
    return (robotConfig.sensors || []).some(s => req.includes(s));
  }
  // tool blocks
  if (req.some(r => ['grabber', 'claw', 'drill', 'laser'].includes(r))) {
    return (robotConfig.tools || []).some(t => req.includes(t));
  }
  // light blocks
  if (req.some(r => r.startsWith('led') || ['searchlight', 'strobes', 'ring'].includes(r))) {
    return req.includes(robotConfig.lightId);
  }
  return false;
}

// ─── Tiny 3D Robot Preview ────────────────────────────────────────────────────
function RobotPreview({ robotConfig }) {
  const divRef = useRef(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    const W = el.clientWidth;
    const H = el.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(2.2, 1.4, 2.8);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(4, 6, 3);
    dir.castShadow = true;
    scene.add(dir);
    const accent = new THREE.PointLight(0x00d9ff, 0.4);
    accent.position.set(-2, 2, 2);
    scene.add(accent);

    // Platform
    const platGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.06, 32);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const plat = new THREE.Mesh(platGeom, platMat);
    plat.position.y = -0.03;
    plat.receiveShadow = true;
    scene.add(plat);

    // Robot
    const group = buildRobotModel(robotConfig);
    scene.add(group);

    let id;
    const animate = () => {
      id = requestAnimationFrame(animate);
      group.rotation.y += 0.006;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(id);
      el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [robotConfig.chassisId, robotConfig.primaryColor, robotConfig.movementId]);

  return <div ref={divRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />;
}

// ─── Block Instance (in workspace) ───────────────────────────────────────────
function WorkspaceBlock({ block, index, onDelete, onMoveUp, onMoveDown, onParamChange, isFirst, isLast, errorMsg }) {
  const hasError = !!errorMsg;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 6,
    }}>
      {/* Sequence number */}
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: hasError ? '#ef4444' : block.color,
        color: '#fff',
        fontSize: 11,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 6,
      }}>
        {hasError ? '!' : index + 1}
      </div>

      {/* Block card */}
      <div style={{
        flex: 1,
        background: hasError
          ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.08) 100%)'
          : `linear-gradient(135deg, ${block.color}22 0%, ${block.darkColor}15 100%)`,
        border: hasError ? '2px solid #ef4444' : `2px solid ${block.color}55`,
        borderLeft: hasError ? '4px solid #ef4444' : `4px solid ${block.color}`,
        borderRadius: 10,
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{block.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{block.label}</span>
          {hasError && (
            <span style={{
              background: '#ef4444', color: '#fff',
              fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 8,
              marginLeft: 'auto',
            }}>⚠ NEEDS FIX</span>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: 6, padding: '5px 8px',
            fontSize: 11, color: '#fca5a5', lineHeight: 1.4,
          }}>
            {errorMsg}
          </div>
        )}

        {/* Parameters */}
        {block.params?.map(param => (
          <div key={param.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#94a3b8', minWidth: 50 }}>{param.name}:</span>
            {param.type === 'range' && (
              <>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step || 1}
                  value={block.paramValues?.[param.name] ?? param.default}
                  onChange={(e) => onParamChange(block.instanceId, param.name, Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 12, color: '#fff', minWidth: 32, textAlign: 'right', fontWeight: 700 }}>
                  {block.paramValues?.[param.name] ?? param.default}{param.unit}
                </span>
              </>
            )}
            {param.type === 'select' && (
              <select
                value={block.paramValues?.[param.name] ?? param.default}
                onChange={(e) => onParamChange(block.instanceId, param.name, e.target.value)}
                style={{
                  flex: 1,
                  background: '#1e293b',
                  color: '#fff',
                  border: `1px solid ${block.color}55`,
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 12,
                }}
              >
                {param.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
        <button onClick={() => onMoveUp(index)} disabled={isFirst} style={btnStyle(isFirst ? '#333' : '#334155')}>↑</button>
        <button onClick={() => onMoveDown(index)} disabled={isLast} style={btnStyle(isLast ? '#333' : '#334155')}>↓</button>
        <button onClick={() => onDelete(block.instanceId)} style={btnStyle('#7f1d1d')}>✕</button>
      </div>
    </div>
  );
}

function btnStyle(bg) {
  return {
    width: 24, height: 24, borderRadius: 4, border: 'none',
    background: bg, color: '#fff', fontSize: 11, fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0,
  };
}

// ─── Main CodePage ────────────────────────────────────────────────────────────
let _instanceId = 0;
function nextId() { return ++_instanceId; }

export default function CodePage({ robotConfig, robotCode, setRobotCode, onSimulate, codeValidation }) {
  const [activeCategory, setActiveCategory] = useState('move');

  // Build a map from instanceId → error message for fast lookup
  const blockErrorMap = useMemo(() => {
    const map = {};
    if (codeValidation?.results) {
      for (const r of codeValidation.results) {
        if (r.blockId !== undefined && r.severity === 'error') {
          map[r.blockId] = r.message;
        }
      }
    }
    return map;
  }, [codeValidation]);

  const codeErrors   = (codeValidation?.results || []).filter(r => r.severity === 'error');
  const codeWarnings = (codeValidation?.results || []).filter(r => r.severity === 'warning');

  // Blocks unlocked by this robot's parts
  const unlockedBlocks = useMemo(
    () => BLOCK_PALETTE.filter(b => isUnlocked(b, robotConfig)),
    [robotConfig.movementId, robotConfig.sensors, robotConfig.tools, robotConfig.lightId]
  );

  const visibleBlocks = useMemo(
    () => unlockedBlocks.filter(b => b.category === activeCategory),
    [unlockedBlocks, activeCategory]
  );

  const lockedCount = useMemo(
    () => BLOCK_PALETTE.filter(b => !isUnlocked(b, robotConfig)).length,
    [robotConfig]
  );

  // Add block to workspace
  const addBlock = useCallback((blockDef) => {
    const instance = {
      ...blockDef,
      instanceId: nextId(),
      paramValues: Object.fromEntries((blockDef.params || []).map(p => [p.name, p.default])),
    };
    setRobotCode(prev => [...prev, instance]);
  }, [setRobotCode]);

  // Remove block
  const deleteBlock = useCallback((instanceId) => {
    setRobotCode(prev => prev.filter(b => b.instanceId !== instanceId));
  }, [setRobotCode]);

  // Reorder
  const moveUp = useCallback((index) => {
    if (index === 0) return;
    setRobotCode(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, [setRobotCode]);

  const moveDown = useCallback((index) => {
    setRobotCode(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, [setRobotCode]);

  // Update param value
  const onParamChange = useCallback((instanceId, paramName, value) => {
    setRobotCode(prev => prev.map(b =>
      b.instanceId === instanceId
        ? { ...b, paramValues: { ...b.paramValues, [paramName]: value } }
        : b
    ));
  }, [setRobotCode]);

  const clearCode = () => setRobotCode([]);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#0f172a', gap: 0 }}>

      {/* ─── LEFT: Block Palette ────────────────────────────────────────────── */}
      <div style={{
        width: 220,
        background: '#111827',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Category tabs */}
        <div style={{ padding: '12px 12px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Blocks
          </div>
          {CATEGORIES.map(cat => {
            const count = unlockedBlocks.filter(b => b.category === cat.id).length;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  marginBottom: 4,
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? `${cat.color}22` : 'transparent',
                  color: isActive ? cat.color : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{cat.label}</span>
                <span style={{
                  background: count > 0 ? `${cat.color}33` : '#1e293b',
                  color: count > 0 ? cat.color : '#475569',
                  borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Block list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {visibleBlocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 11 }}>
              🔒 Add matching parts in Build to unlock these blocks
            </div>
          ) : (
            visibleBlocks.map(block => (
              <button
                key={block.id}
                onClick={() => addBlock(block)}
                title={`Click to add ${block.label}`}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: 6,
                  padding: '9px 10px',
                  borderRadius: 8,
                  border: `1px solid ${block.color}44`,
                  background: `${block.color}18`,
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 16 }}>{block.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{block.label}</div>
                  {block.params?.length > 0 && (
                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>
                      {block.params.map(p => p.name).join(', ')}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Locked hint */}
        {lockedCount > 0 && (
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: 10,
            color: '#475569',
            lineHeight: 1.4,
          }}>
            🔒 {lockedCount} blocks locked — add parts in Build tab to unlock
          </div>
        )}
      </div>

      {/* ─── CENTER: Code Workspace ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#111827',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
              📝 Code My Robot
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Add blocks below. Click ▶️ to run!
            </div>
          </div>

          {/* Validation summary */}
          {robotCode.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 8,
              background: codeErrors.length > 0 ? 'rgba(239,68,68,0.15)' : codeWarnings.length > 0 ? 'rgba(249,115,22,0.15)' : 'rgba(34,197,94,0.15)',
              border: `1px solid ${codeErrors.length > 0 ? '#ef4444' : codeWarnings.length > 0 ? '#f97316' : '#22c55e'}44`,
              fontSize: 11, fontWeight: 700,
              color: codeErrors.length > 0 ? '#fca5a5' : codeWarnings.length > 0 ? '#fdba74' : '#86efac',
            }}>
              {codeErrors.length > 0
                ? `⚠ ${codeErrors.length} block issue${codeErrors.length > 1 ? 's' : ''} to fix`
                : codeWarnings.length > 0
                ? `💡 ${codeWarnings.length} tip${codeWarnings.length > 1 ? 's' : ''}`
                : '✓ Code looks good!'}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            {robotCode.length > 0 && (
              <button
                onClick={clearCode}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #7f1d1d',
                  background: '#450a0a',
                  color: '#fca5a5',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                🗑 Clear All
              </button>
            )}
            <button
              onClick={onSimulate}
              disabled={robotCode.length === 0}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: robotCode.length === 0
                  ? '#1e293b'
                  : 'linear-gradient(135deg,#22c55e,#15803d)',
                color: robotCode.length === 0 ? '#475569' : '#fff',
                fontWeight: 800,
                fontSize: 13,
                cursor: robotCode.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ▶️ Run in Simulator
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {robotCode.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#475569',
              gap: 12,
            }}>
              <div style={{ fontSize: 48 }}>👈</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>Click blocks on the left to add them here</div>
              <div style={{ fontSize: 13, color: '#475569', textAlign: 'center', maxWidth: 300 }}>
                Build a sequence of actions for your robot to follow. When you're ready, hit ▶️ to test it!
              </div>
            </div>
          ) : (
            <div>
              {/* Start cap */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                padding: '10px 16px',
                background: '#134e4a',
                border: '2px solid #0d9488',
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#5eead4' }}>When Run is pressed</span>
              </div>

              {robotCode.map((block, i) => (
                <WorkspaceBlock
                  key={block.instanceId}
                  block={block}
                  index={i}
                  onDelete={deleteBlock}
                  onMoveUp={moveUp}
                  onMoveDown={moveDown}
                  onParamChange={onParamChange}
                  isFirst={i === 0}
                  isLast={i === robotCode.length - 1}
                  errorMsg={blockErrorMap[block.instanceId]}
                />
              ))}

              {/* End cap */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
                padding: '10px 16px',
                background: '#1e1b4b',
                border: '2px solid #6366f1',
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 18 }}>🏁</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#a5b4fc' }}>Program ends</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: Robot Preview ───────────────────────────────────────────── */}
      <div style={{
        width: 260,
        background: '#111827',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Robot preview */}
        <div style={{ padding: '12px 12px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            My Robot
          </div>
          <div style={{ height: 180, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RobotPreview robotConfig={robotConfig} />
          </div>
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{robotConfig.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {robotConfig.chassisId} · {robotConfig.movementId}
            </div>
          </div>
        </div>

        {/* Parts summary */}
        <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Unlocked By Your Parts
          </div>

          {/* Movement */}
          <div style={capsulesRow}>
            <span style={capsule('#22c55e')}>⚙️ {robotConfig.movementId}</span>
            <span style={capsule('#64748b', true)}>→ movement blocks</span>
          </div>

          {/* Sensors */}
          {(robotConfig.sensors || []).map(s => {
            const blocks = BLOCK_PALETTE.filter(b => {
              const req = Array.isArray(b.requires) ? b.requires : [b.requires];
              return req.includes(s);
            });
            return (
              <div key={s} style={capsulesRow}>
                <span style={capsule('#f97316')}>📡 {s}</span>
                <span style={capsule('#64748b', true)}>→ {blocks.length} blocks</span>
              </div>
            );
          })}

          {/* Tools */}
          {(robotConfig.tools || []).map(t => {
            const blocks = BLOCK_PALETTE.filter(b => {
              const req = Array.isArray(b.requires) ? b.requires : [b.requires];
              return req.includes(t);
            });
            return (
              <div key={t} style={capsulesRow}>
                <span style={capsule('#d97706')}>🔧 {t}</span>
                <span style={capsule('#64748b', true)}>→ {blocks.length} blocks</span>
              </div>
            );
          })}

          {/* Code summary */}
          {robotCode.length > 0 && (
            <div style={{
              marginTop: 16,
              padding: '12px',
              background: '#1e293b',
              borderRadius: 8,
              fontSize: 11,
            }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: 8 }}>📋 Program</div>
              {robotCode.map((b, i) => (
                <div key={b.instanceId} style={{ color: '#94a3b8', padding: '2px 0' }}>
                  {i + 1}. {b.label}
                  {b.params?.map(p => (
                    <span key={p.name} style={{ color: b.color }}>
                      {' '}({b.paramValues?.[p.name] ?? p.default}{p.unit || ''})
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Run button at bottom */}
        <div style={{ padding: '12px' }}>
          <button
            onClick={onSimulate}
            disabled={robotCode.length === 0}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: robotCode.length === 0
                ? '#1e293b'
                : 'linear-gradient(135deg,#22c55e 0%,#15803d 100%)',
              color: robotCode.length === 0 ? '#475569' : '#fff',
              fontWeight: 800,
              fontSize: 14,
              cursor: robotCode.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ▶️ Test My Robot!
          </button>
        </div>
      </div>
    </div>
  );
}

const capsulesRow = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 };
function capsule(color, muted = false) {
  return {
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    background: muted ? '#1e293b' : `${color}22`,
    color: muted ? '#64748b' : color,
    border: `1px solid ${muted ? '#1e293b' : color + '44'}`,
  };
}
