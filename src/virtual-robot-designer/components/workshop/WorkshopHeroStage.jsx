/**
 * Cinematic hero stage — robot dominates the center of the invention workshop.
 */
import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import HeroRobotModel from '../HeroRobotModel.jsx';
import AssemblyAttachmentMeshes from '../AssemblyAttachmentMeshes.jsx';
import SnapSocketMarkers from '../SnapSocketMarkers.jsx';
import WorkshopEnvironment3D from './WorkshopEnvironment3D.jsx';
import StudioOrbitControls from '../academy/StudioOrbitControls.jsx';
import SnapParticles from '../common/SnapParticles.jsx';
import { migrateDesign } from '../../config.js';
import { migrateAssembly } from '../../services/assembly-service.js';
import { getVisibleSockets } from '../../utils/build-slots.js';
import { useUiStore } from '../../store/uiStore.js';
import { WORKSHOP_VIEWPORT } from '../../constants/sizes.js';

function RobotScene({
  design,
  highlightSlot,
  snapPulse,
  dragCategory,
  onSocketSelect,
  onSocketRemove,
}) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const placedCount = Object.values(asm.slots || {}).filter(Boolean).length;
  const visibleSockets = getVisibleSockets(asm, asm.base?.shape === 'arm', { freeBuild: true });

  return (
    <>
      <WorkshopEnvironment3D />
      <group position={[0, 0.05, 0]}>
        <HeroRobotModel
          key={`hero-${placedCount}-${asm.base?.chassisType}-${asm.base?.color}`}
          design={d}
          productVisual
          heroScale={WORKSHOP_VIEWPORT.heroScale}
        />
        <AssemblyAttachmentMeshes design={d} />
        <SnapSocketMarkers
          base={asm.base}
          slots={asm.slots}
          highlightSlot={highlightSlot}
          snapPulse={snapPulse}
          dragCategory={dragCategory}
          productMode
          visibleSlots={visibleSockets}
          onSocketSelect={onSocketSelect}
          onSocketRemove={onSocketRemove}
        />
      </group>
      <ContactShadows position={[0, -0.54, 0]} opacity={0.55} scale={14} blur={2.8} far={9} color="#8aa4c0" />
    </>
  );
}

export default function WorkshopHeroStage({
  design,
  highlightSlot,
  snapPulse,
  dragOver,
  robotName,
  editingName,
  onEditName,
  onNameChange,
  onNameSave,
  onSocketSelect,
  onSocketRemove,
  onDragOver,
  onDragLeave,
  onDrop,
  evolutionLevel,
}) {
  const controlsRef = useRef();
  const snapBurst = useUiStore((s) => s.snapBurst);
  const draggingPart = useUiStore((s) => s.draggingPart);
  const dragOverStore = useUiStore((s) => s.dragOverViewport);
  const showDrag = dragOver || dragOverStore;

  return (
    <div
      className={`iw-hero-stage ${showDrag ? 'iw-hero-stage--drag' : ''} ${snapPulse ? 'iw-hero-stage--snap' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="iw-hero-float-name">
        {editingName ? (
          <input
            className="iw-hero-name-input"
            value={robotName}
            onChange={(e) => onNameChange?.(e.target.value)}
            onBlur={onNameSave}
            onKeyDown={(e) => e.key === 'Enter' && onNameSave?.()}
            autoFocus
            aria-label="Robot name"
          />
        ) : (
          <button type="button" className="iw-hero-name" onClick={onEditName}>
            {robotName || 'My Invention'} <span aria-hidden>✎</span>
          </button>
        )}
        <span className="iw-hero-evolution">Level {evolutionLevel} invention</span>
      </div>

      {showDrag && (
        <div className="iw-drop-hint" role="status">
          Drop on a glowing socket
        </div>
      )}

      <Canvas
        className="iw-hero-canvas"
        shadows
        dpr={[1, 2]}
        camera={{ position: WORKSHOP_VIEWPORT.cameraPos, fov: WORKSHOP_VIEWPORT.cameraFov, near: 0.1, far: 80 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.75 }}
      >
        <color attach="background" args={['#e8edf4']} />
        <fog attach="fog" args={['#e8edf4', 18, 40]} />
        <Environment preset="warehouse" />
        <Suspense fallback={null}>
          <RobotScene
            design={design}
            highlightSlot={highlightSlot}
            snapPulse={snapPulse}
            dragCategory={draggingPart?.category}
            onSocketSelect={onSocketSelect}
            onSocketRemove={onSocketRemove}
          />
          <StudioOrbitControls
            apiRef={controlsRef}
            minDistance={WORKSHOP_VIEWPORT.orbitMin}
            maxDistance={WORKSHOP_VIEWPORT.orbitMax}
            target={[0, 0.5, 0]}
          />
          <EffectComposer multisampling={0}>
            <Bloom luminosityThreshold={0.72} luminanceSmoothing={0.9} intensity={0.35} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {(snapPulse || snapBurst) && <div className="iw-snap-burst" aria-hidden />}
      <SnapParticles active={snapPulse || snapBurst} />
    </div>
  );
}
