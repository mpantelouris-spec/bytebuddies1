/**
 * Center 3D build studio — hero robot, platform, sockets, studio lighting.
 */
import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import StudioOrbitControls from './StudioOrbitControls.jsx';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import HeroRobotModel from '../HeroRobotModel.jsx';
import AssemblyAttachmentMeshes from '../AssemblyAttachmentMeshes.jsx';
import SnapSocketMarkers from '../SnapSocketMarkers.jsx';
import { migrateDesign } from '../../config.js';
import { migrateAssembly } from '../../services/assembly-service.js';
import { getVisibleSockets } from '../../utils/build-slots.js';

/** Studio 3-point + rim lighting for hero robot */
function HeroLighting() {
  return (
    <>
      <ambientLight intensity={0.85} color="#ffffff" />
      <hemisphereLight intensity={0.7} color="#ffffff" groundColor="#c5d0e0" />
      <directionalLight
        position={[4, 8, 6]}
        intensity={1.65}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color="#fffef8"
      />
      <directionalLight position={[-6, 5, -2]} intensity={0.55} color="#b8dcff" />
      <directionalLight position={[0, 2, -6]} intensity={0.35} color="#e8f4ff" />
      <spotLight
        position={[0, 5, 3]}
        angle={0.45}
        penumbra={0.6}
        intensity={0.9}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[0, 1.2, 2.5]} intensity={0.65} color="#00D9FF" distance={8} decay={2} />
      <pointLight position={[2.5, 0.8, 0]} intensity={0.3} color="#FF8C00" distance={6} decay={2} />
    </>
  );
}

function StudioPlatform({ snapPulse }) {
  const groupRef = useRef();
  const ringRef = useRef();
  useFrame((state, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.04;
    if (ringRef.current) {
      ringRef.current.material.opacity = 0.42 + Math.sin(state.clock.elapsedTime * 2) * 0.12 + (snapPulse ? 0.2 : 0);
    }
  });
  return (
    <group ref={groupRef} position={[0, -0.56, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.9, 2.05, 0.12, 64]} />
        <meshStandardMaterial color="#d4dae2" metalness={0.95} roughness={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[1.8, 64]} />
        <meshStandardMaterial color="#eef1f5" metalness={0.98} roughness={0.08} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[1.68, 2.1, 64]} />
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function SceneContent({
  design,
  highlightSlot,
  snapPulse,
  onSocketSelect,
  onSocketRemove,
}) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const visibleSockets = getVisibleSockets(asm, asm.base?.shape === 'arm', { freeBuild: true });
  const placedCount = Object.values(asm.slots || {}).filter(Boolean).length;

  return (
    <>
      <HeroLighting />

      <StudioPlatform snapPulse={snapPulse} />
      <ContactShadows position={[0, -0.55, 0]} opacity={0.5} scale={12} blur={3.2} far={8} color="#1a2a40" />

      <HeroRobotModel
        key={`robot-${placedCount}-${asm.base?.chassisType}-${asm.base?.color}-${asm.slots?.movement?.partId}`}
        design={d}
        productVisual
      />
      <AssemblyAttachmentMeshes design={d} />
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
  );
}

export default function ProductViewport({
  design,
  highlightSlot,
  snapPulse,
  dragOver,
  onSocketSelect,
  onSocketRemove,
  onDragOver,
  onDragLeave,
  onDrop,
  controlsRef,
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onPaint,
  onClear,
  onUndo,
  onCode,
  onTest,
  canUndo,
  robotName,
  editingName,
  onEditName,
  onNameChange,
  onNameSave,
  statusText,
}) {
  const cameraApiRef = useRef();
  const apiRef = controlsRef || cameraApiRef;

  const rotateLeft = () => apiRef.current?.rotateLeft?.(Math.PI / 8);
  const rotateRight = () => apiRef.current?.rotateRight?.(Math.PI / 8);
  const zoomIn = () => apiRef.current?.zoomIn?.(1.12);
  const zoomOut = () => apiRef.current?.zoomOut?.(1.12);

  return (
    <div
      className={`rd-viewport ${dragOver ? 'rd-viewport--drag-over' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <header className="rd-viewport-head">
        <div className="rd-viewport-title">
          <span className="rd-viewport-tag">3D BUILD STUDIO</span>
          {editingName ? (
            <input
              className="rd-robot-name-input"
              value={robotName}
              onChange={(e) => onNameChange?.(e.target.value)}
              onBlur={onNameSave}
              onKeyDown={(e) => e.key === 'Enter' && onNameSave?.()}
              autoFocus
            />
          ) : (
            <button type="button" className="rd-robot-name" onClick={onEditName}>
              {robotName || 'Explorer Bot'} <span aria-hidden>✎</span>
            </button>
          )}
        </div>
        <p className="rd-viewport-hint">{statusText}</p>
      </header>

      <div className={`rd-viewport-canvas-wrap ${snapPulse ? 'rd-viewport-canvas-wrap--snap' : ''}`}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0.72, 2.15], fov: 48, near: 0.1, far: 100 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.85 }}
        >
          <color attach="background" args={['#e4e8ee']} />
          <fog attach="fog" args={['#e4e8ee', 14, 32]} />
          <Environment preset="studio" />
          <Suspense fallback={null}>
            <SceneContent
              design={design}
              highlightSlot={highlightSlot}
              snapPulse={snapPulse}
              onSocketSelect={onSocketSelect}
              onSocketRemove={onSocketRemove}
            />
            <StudioOrbitControls
              apiRef={apiRef}
              minDistance={1.65}
              maxDistance={4.5}
              target={[0, 0.42, 0]}
            />
            <EffectComposer multisampling={0}>
              <Bloom luminanceThreshold={0.65} luminanceSmoothing={0.85} intensity={0.48} mipmapBlur />
            </EffectComposer>
          </Suspense>
        </Canvas>
        {dragOver && <div className="rd-drop-hint" aria-hidden>Drop part on robot</div>}
        {snapPulse && <div className="rd-snap-burst" aria-hidden />}
      </div>

      <footer className="rd-viewport-foot">
        <div className="rd-viewport-tools">
          <button type="button" className="rd-tool-btn" onClick={onRotateLeft || rotateLeft}>↶ Rotate</button>
          <button type="button" className="rd-tool-btn" onClick={onRotateRight || rotateRight}>Rotate ↷</button>
          <button type="button" className="rd-tool-btn" onClick={onZoomIn || zoomIn}>+ Zoom</button>
          <button type="button" className="rd-tool-btn" onClick={onZoomOut || zoomOut}>− Zoom</button>
          <button type="button" className="rd-tool-btn rd-tool-btn--paint" onClick={onPaint}>🎨 Paint</button>
        </div>
        <div className="rd-viewport-actions">
          <button type="button" className="rd-act-btn rd-act-btn--muted" onClick={onClear}>✕ Clear</button>
          <button type="button" className="rd-act-btn rd-act-btn--muted" onClick={onUndo} disabled={!canUndo}>↶ Undo</button>
          <button type="button" className="rd-act-btn rd-act-btn--code" onClick={onCode}>→ Code</button>
          <button type="button" className="rd-act-btn rd-act-btn--test" onClick={onTest}>✓ Test</button>
        </div>
      </footer>
    </div>
  );
}
