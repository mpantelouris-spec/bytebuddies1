import React, { Suspense, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, ContactShadows, Grid, Float, Environment } from '@react-three/drei';
import StudioOrbitControls from './academy/StudioOrbitControls.jsx';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import InteractiveRobotModel from './InteractiveRobotModel.jsx';
import HeroRobotModel from './HeroRobotModel.jsx';
import AssemblyAttachmentMeshes from './AssemblyAttachmentMeshes.jsx';
import SnapSocketMarkers from './SnapSocketMarkers.jsx';
import BlockGrid3D from './BlockGrid3D.jsx';
import BlockPlacement3D from './BlockPlacement3D.jsx';
import { migrateDesign } from '../config.js';
import { migrateAssembly } from '../services/assembly-service.js';
import { SNAP_SLOTS } from '../data/assembly-parts.js';
import { getBuildPhase, getVisibleSockets } from '../utils/build-slots.js';

function AssemblyDrone({ position, color }) {
  return (
    <Float speed={2.2} rotationIntensity={0.5} floatIntensity={0.7}>
      <mesh position={position}>
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} metalness={0.95} roughness={0.1} />
      </mesh>
      <pointLight position={position} intensity={0.6} color={color} distance={2.5} />
    </Float>
  );
}

function RotatingPlatform({ color, snapPulse }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.08;
  });
  return (
    <group ref={ref} position={[0, -0.56, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.08, 64]} />
        <meshStandardMaterial color="#080812" metalness={0.95} roughness={0.12} emissive={color} emissiveIntensity={snapPulse ? 0.35 : 0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.8, 2.1, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function AssemblyArm({ position, rotation, color }) {
  const armRef = useRef();
  useFrame((state) => {
    if (armRef.current) {
      armRef.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.8) * 0.12;
    }
  });
  return (
    <group position={position} rotation={rotation}>
      <group ref={armRef}>
        <mesh position={[0.6, 0.3, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} emissive={color} emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[1.15, 0.15, 0]}>
          <boxGeometry args={[0.08, 0.35, 0.08]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.85} roughness={0.15} />
        </mesh>
      </group>
    </group>
  );
}

function ScanRing() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      ref.current.material.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]}>
      <ringGeometry args={[0.5, 2.5, 64, 1, 0, Math.PI * 0.4]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Spec Part 3 — 8-pointed star platform with neon outlines */
function StarPlatform({ color, snapPulse }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.06;
  });
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const spikes = 8;
    const outer = 2.15;
    const inner = 1.05;
    for (let i = 0; i < spikes * 2; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  return (
    <group ref={ref} position={[0, -0.58, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[starShape]} />
        <meshStandardMaterial color="#080812" metalness={0.95} roughness={0.1} emissive={color} emissiveIntensity={snapPulse ? 0.4 : 0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.4, 2.2, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function HolographicWalls() {
  const ref1 = useRef();
  const ref2 = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref1.current) ref1.current.position.y = Math.sin(t * 0.3) * 0.05;
    if (ref2.current) ref2.current.rotation.y = t * 0.08;
  });
  return (
    <group>
      <mesh ref={ref1} position={[-4.5, 1.2, -3]} rotation={[0, 0.4, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshBasicMaterial color="#0066FF" transparent opacity={0.06} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ref2} position={[4.2, 1, -3.5]} rotation={[0, -0.5, 0]}>
        <planeGeometry args={[2.8, 2.2]} />
        <meshBasicMaterial color="#5A2E8F" transparent opacity={0.05} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ChamberFloorRing({ color }) {
  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.555, 0]}>
        <ringGeometry args={[2, 2.8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
    </Float>
  );
}

function ChamberCamera({ isArm, controlsRef, isProduct }) {
  const target = isArm ? [0, 0.5, 0] : [0, 0.1, 0];
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={isProduct ? (isArm ? 2.1 : 2.35) : (isArm ? 2.4 : 2.8)}
      maxDistance={isProduct ? (isArm ? 5.5 : 6.2) : (isArm ? 6.5 : 7.5)}
      maxPolarAngle={Math.PI / 2 + 0.08}
      minPolarAngle={0.32}
      target={target}
      enableDamping
      dampingFactor={0.06}
    />
  );
}

function ProductPlatform({ color, snapPulse }) {
  const ref = useRef();
  const ringRef = useRef();
  useFrame((state, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.05;
    if (ringRef.current) {
      ringRef.current.material.opacity = (snapPulse ? 0.7 : 0.45) + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  return (
    <group ref={ref} position={[0, -0.56, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.85, 2, 0.1, 64]} />
        <meshStandardMaterial color="#c0c8d4" metalness={0.92} roughness={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.75, 64]} />
        <meshStandardMaterial color="#e8ecf0" metalness={0.95} roughness={0.12} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[1.65, 2.08, 64]} />
        <meshBasicMaterial color={color || '#00D9FF'} transparent opacity={0.45} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export default function InteractiveBuildChamber({
  design,
  highlightSlot = null,
  snapPulse = false,
  buildMode = 'advanced',
  visualStyle = 'product',
  compact = false,
  blockLayer = 0,
  selectedBlockType = 'cube',
  onPlaceBlock,
  onRemoveBlock,
  onPaint,
  onSocketSelect,
  onSocketRemove,
  onDropPart,
  onClear,
  onUndo,
  onCode,
  onTest,
  canUndo = false,
}) {
  const [autoSpin, setAutoSpin] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const controlsRef = useRef();
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const glow = asm.base?.color || d.chassis?.color || '#1E90FF';
  const slotMeta = highlightSlot ? SNAP_SLOTS[highlightSlot] : null;
  const slotFilled = highlightSlot ? !!asm.slots[highlightSlot] : false;
  const isArm = asm.base?.shape === 'arm';
  const isProduct = visualStyle === 'product';
  const modeLabel = buildMode === 'blocks' ? 'LEGO BUILD' : 'EXPLORER BOT';
  const placedCount = Object.values(asm.slots || {}).filter(Boolean).length;
  const buildPhase = isProduct ? getBuildPhase(asm, asm.base?.shape === 'arm') : null;
  const visibleSockets = isProduct ? getVisibleSockets(asm, asm.base?.shape === 'arm', { freeBuild: true }) : null;
  const showExtrasMeshes = isProduct;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const chassisId = e.dataTransfer.getData('application/vrd-chassis');
    if (chassisId) {
      onDropPart?.({ type: 'chassis', id: chassisId });
      return;
    }
    const raw = e.dataTransfer.getData('application/vrd-part');
    if (raw) {
      try {
        onDropPart?.({ type: 'part', ...JSON.parse(raw) });
      } catch { /* ignore */ }
    }
  };

  return (
    <div
      className={`vrd-chamber vrd-chamber--interactive vrd-chamber--premium vrd-chamber--hero ${isProduct ? 'vrd-chamber--product' : ''} ${compact ? 'vrd-chamber--compact' : ''} ${dragOver ? 'vrd-chamber--drag-over' : ''}`}
      onDragOver={isProduct ? handleDragOver : undefined}
      onDragLeave={isProduct ? handleDragLeave : undefined}
      onDrop={isProduct ? handleDrop : undefined}
    >
      <div className="vrd-chamber-hud">
        <span className="vrd-chamber-tag">{isProduct ? '3D BUILD STUDIO' : `◈ ${modeLabel}`}</span>
        <span className="vrd-chamber-status">
          {slotMeta
            ? (slotFilled ? `✓ ${slotMeta.label} attached` : `Tap a part on the left — it snaps on here`)
            : (isProduct && buildPhase
              ? buildPhase.detail
              : '◈ HOLOGRAPHIC ASSEMBLY BAY ACTIVE')}
        </span>
      </div>
      <div className={`vrd-chamber-frame ${snapPulse ? 'vrd-chamber-frame--pulse' : ''}`}>
        <div className="vrd-chamber-corner vrd-chamber-corner--tl" />
        <div className="vrd-chamber-corner vrd-chamber-corner--tr" />
        <div className="vrd-chamber-corner vrd-chamber-corner--bl" />
        <div className="vrd-chamber-corner vrd-chamber-corner--br" />
        <div className="vrd-chamber-vignette" aria-hidden />
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: isProduct ? [0, 1.35, 3.5] : [0, 1.5, 4], fov: isProduct ? 68 : 75, near: 0.1, far: 1000 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: isProduct ? 1.55 : 1.15 }}
        >
          <Suspense fallback={null}>
            <color attach="background" args={[isProduct ? '#e8e8e8' : '#0A0A1A']} />
            <fog attach="fog" args={[isProduct ? '#e8e8e8' : '#0A0A1A', 12, 28]} />
            <Environment preset={isProduct ? 'studio' : 'night'} />
            <ambientLight intensity={isProduct ? 0.85 : 0.6} color="#ffffff" />
            <hemisphereLight intensity={isProduct ? 0.7 : 0.45} color="#ffffff" groundColor={isProduct ? '#374151' : '#0A0A1A'} />
            <directionalLight position={[5, 8, 4]} intensity={isProduct ? 1.35 : 1.0} castShadow shadow-mapSize={[2048, 2048]} color="#ffffff" />
            <directionalLight position={[-4, 5, -2]} intensity={isProduct ? 0.5 : 0.2} color="#e0f2fe" />
            {isProduct && <pointLight position={[0, 2.5, 2]} intensity={0.55} color="#ffffff" />}
            {isProduct && <pointLight position={[2, 1, -1]} intensity={0.35} color="#00D9FF" />}
            {isProduct && <pointLight position={[-2, 1.5, 1]} intensity={0.2} color="#8B00FF" />}
            {!isProduct && <pointLight position={[-4, 3, 3]} intensity={0.3} color="#8B00FF" />}
            {!isProduct && <pointLight position={[4, 2, -3]} intensity={0.2} color="#00D9FF" />}
            {!isProduct && <Stars radius={90} depth={45} count={3500} factor={3} saturation={0} fade speed={0.5} />}
            {!isProduct && <Sparkles count={80} scale={9} size={2.5} speed={0.3} opacity={0.45} color="#ff006e" />}
            {!isProduct && <Sparkles count={50} scale={7} size={1.8} speed={0.2} opacity={0.35} color="#00d4ff" position={[0, 0.5, 0]} />}
            {!isProduct && (
            <Grid
              position={[0, -0.56, 0]}
              args={[14, 14]}
              cellSize={0.35}
              cellThickness={0.4}
              cellColor="#5A2E8F"
              sectionSize={1.4}
              sectionThickness={0.8}
              sectionColor="#00D9FF"
              fadeDistance={16}
              infiniteGrid
            />
            )}
            {isProduct ? (
              <ProductPlatform color="#00D9FF" snapPulse={snapPulse} />
            ) : (
              <>
                <StarPlatform color={glow} snapPulse={snapPulse} />
                <RotatingPlatform color={glow} snapPulse={snapPulse} />
                <ChamberFloorRing color={glow} />
                <ScanRing />
                <HolographicWalls />
                <AssemblyArm position={[-2.5, 0.5, 0.5]} rotation={[0, 0.4, 0.5]} color="#ff006e" />
                <AssemblyArm position={[2.5, 0.5, -0.5]} rotation={[0, -0.4, -0.5]} color="#00d4ff" />
              </>
            )}
            <ContactShadows position={[0, -0.55, 0]} opacity={isProduct ? 0.5 : 0.65} scale={9} blur={2.5} far={5} color="#000000" />
            {(buildMode === 'blocks' || buildMode === 'hybrid') && (
              <BlockGrid3D design={d} highlightLayer={blockLayer} pulse={!!snapPulse} />
            )}
            {(buildMode === 'blocks' || buildMode === 'hybrid') && onPlaceBlock && (
              <BlockPlacement3D
                design={d}
                layerY={blockLayer}
                selectedType={selectedBlockType}
                onPlace={onPlaceBlock}
                onRemove={onRemoveBlock}
                enabled
              />
            )}
            {(buildMode === 'blocks' || buildMode === 'hybrid') ? (
              <InteractiveRobotModel
                design={d}
                autoSpin={autoSpin}
                highlightSlot={highlightSlot}
                snapPulse={snapPulse}
                buildMode={buildMode}
                blockLayer={blockLayer}
                heroScale={1.35}
              />
            ) : isProduct ? (
              <>
                <HeroRobotModel
                  key={`hero-${placedCount}-${asm.base?.chassisType}-${asm.base?.color}`}
                  design={d}
                  productVisual
                />
                {showExtrasMeshes && <AssemblyAttachmentMeshes design={d} />}
                <SnapSocketMarkers
                  base={asm.base}
                  slots={asm.slots}
                  highlightSlot={highlightSlot}
                  snapPulse={snapPulse}
                  productMode
                  visibleSlots={visibleSockets}
                  onSocketSelect={onSocketSelect}
                  onSocketRemove={onSocketRemove}
                />
              </>
            ) : (
              <InteractiveRobotModel
                design={d}
                autoSpin={autoSpin}
                highlightSlot={highlightSlot}
                snapPulse={snapPulse}
                buildMode={buildMode}
                blockLayer={blockLayer}
                heroScale={1.35}
              />
            )}
            {!isProduct && (
              <>
                <AssemblyDrone position={[-2.4, 1.3, 1.6]} color="#ff006e" />
                <AssemblyDrone position={[2.6, 1.0, -1.4]} color="#00d4ff" />
                <AssemblyDrone position={[0, 2.2, -2.2]} color="#8b00ff" />
              </>
            )}
            <ChamberCamera isArm={isArm} controlsRef={controlsRef} isProduct={isProduct} />
            {isProduct ? (
              <EffectComposer multisampling={0}>
                <Bloom luminanceThreshold={0.75} luminanceSmoothing={0.9} intensity={0.35} mipmapBlur />
              </EffectComposer>
            ) : (
              <EffectComposer multisampling={0}>
                <Bloom luminanceThreshold={0.32} luminanceSmoothing={0.85} intensity={0.3} mipmapBlur />
                <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0004, 0.0006]} />
                <Vignette eskil={false} offset={0.08} darkness={0.65} />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
        <div className="vrd-chamber-scan" aria-hidden />
        {snapPulse && <div className="vrd-chamber-flash vrd-chamber-flash--product" aria-hidden />}
      </div>
      {!compact && (
      <div className="vrd-chamber-controls">
        <div className="vrd-viewport-btns">
          <button type="button" className="vrd-chamber-ctrl vrd-chamber-ctrl--light" onClick={() => controlsRef.current?.rotateLeft?.(Math.PI / 8)}>↶ Rotate</button>
          <button type="button" className="vrd-chamber-ctrl vrd-chamber-ctrl--light" onClick={() => controlsRef.current?.rotateRight?.(Math.PI / 8)}>Rotate ↷</button>
          <button type="button" className="vrd-chamber-ctrl vrd-chamber-ctrl--light" onClick={() => controlsRef.current?.zoomIn?.(1.15)}>+ Zoom</button>
          <button type="button" className="vrd-chamber-ctrl vrd-chamber-ctrl--light" onClick={() => controlsRef.current?.zoomOut?.(1.15)}>− Zoom</button>
          {isProduct && onPaint && (
            <button type="button" className="vrd-chamber-ctrl vrd-chamber-ctrl--paint" onClick={onPaint}>🎨 Paint</button>
          )}
        </div>
        {isProduct && (
          <div className="vrd-viewport-actions">
            <button type="button" className="vrd-action-btn vrd-action-btn--muted" onClick={onClear}>✕ Clear</button>
            <button type="button" className="vrd-action-btn vrd-action-btn--muted" onClick={onUndo} disabled={!canUndo}>↶ Undo</button>
            <button type="button" className="vrd-action-btn vrd-action-btn--code" onClick={onCode}>→ Code</button>
            <button type="button" className="vrd-action-btn vrd-action-btn--test" onClick={onTest}>✓ Test</button>
          </div>
        )}
        {!isProduct && (
          <>
            <button type="button" className="vrd-chamber-ctrl" onClick={() => setAutoSpin((s) => !s)}>
              {autoSpin ? '⏸ Stop spin' : '⟳ Spin preview'}
            </button>
            <span className="vrd-chamber-hint">Drag to orbit · modules snap instantly · same robot in simulator</span>
          </>
        )}
      </div>
      )}
    </div>
  );
}
