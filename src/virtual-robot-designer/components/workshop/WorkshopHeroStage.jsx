/**
 * Cinematic hero stage — grounded robot on assembly platform, pro lighting & camera.
 */
import React, { Suspense, useRef, useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import RobotAssemblyRoot from './RobotAssemblyRoot.jsx';
import WorkshopStage3D from './WorkshopStage3D.jsx';
import WorkshopBackdrop3D from './WorkshopBackdrop3D.jsx';
import WorkshopSceneLighting from './WorkshopSceneLighting.jsx';
import WorkshopCameraRig from './WorkshopCameraRig.jsx';
import SnapParticles from '../common/SnapParticles.jsx';
import { migrateDesign } from '../../config.js';
import { migrateAssembly, countPlacedParts } from '../../services/assembly-service.js';
import { useUiStore } from '../../store/uiStore.js';
import { computeWorkshopRobotScale } from '../../constants/workshop-scene.js';
import { PLATFORM } from '../../constants/workshop-scene.js';
import { countBlocks } from '../../services/block-service.js';

function WorkshopScene(props) {
  const d = migrateDesign(props.design);
  const asm = migrateAssembly(d);
  const displayScale = useMemo(() => computeWorkshopRobotScale(d), [d]);
  const placedCount = countPlacedParts(asm);
  const blockCount = countBlocks(asm);

  return (
    <>
      <WorkshopBackdrop3D />
      <WorkshopStage3D />
      <WorkshopSceneLighting />
      <RobotAssemblyRoot {...props} />
      <ContactShadows
        position={[0, PLATFORM.topY + 0.002, 0]}
        opacity={0.45}
        scale={8}
        blur={2.2}
        far={4.5}
        color="#64748b"
        frames={1}
      />
      <WorkshopCameraRig
        controlsRef={props.controlsRef}
        displayScale={displayScale}
        placedCount={placedCount}
        blockCount={blockCount}
        buildMode={asm.buildMode || 'advanced'}
        userInteractingRef={props.userInteractingRef}
        focusRequest={props.focusRequest}
      />
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
  const userInteractingRef = useRef(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const handleFocus = useCallback(() => {
    controlsRef.current?.focusRobot?.();
    setFocusRequest((n) => n + 1);
  }, []);
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
          Drop on a <span className="iw-drop-valid">green</span> socket
        </div>
      )}

      <div className="iw-camera-toolbar" role="toolbar" aria-label="3D view controls">
        <button type="button" className="iw-cam-btn" title="Rotate left" onClick={() => controlsRef.current?.rotateLeft?.()}>↶</button>
        <button type="button" className="iw-cam-btn" title="Rotate right" onClick={() => controlsRef.current?.rotateRight?.()}>↷</button>
        <button type="button" className="iw-cam-btn" title="Zoom in" onClick={() => controlsRef.current?.zoomIn?.()}>＋</button>
        <button type="button" className="iw-cam-btn" title="Zoom out" onClick={() => controlsRef.current?.zoomOut?.()}>－</button>
        <button type="button" className="iw-cam-btn iw-cam-btn--focus" title="Center on robot (double-click canvas too)" onClick={handleFocus}>◎</button>
      </div>

      <p className="iw-camera-hint">Drag to spin · scroll to zoom · double-click to center</p>

      <Canvas
        onDoubleClick={handleFocus}
        className="iw-hero-canvas"
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.9, 2.4], fov: 42, near: 0.15, far: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.02,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={['#eef2f7']} />
        <fog attach="fog" args={['#eef2f7', 16, 36]} />
        <Suspense fallback={null}>
          <WorkshopScene
            design={design}
            highlightSlot={highlightSlot}
            snapPulse={snapPulse}
            dragCategory={draggingPart?.category}
            onSocketSelect={onSocketSelect}
            onSocketRemove={onSocketRemove}
            controlsRef={controlsRef}
            userInteractingRef={userInteractingRef}
            focusRequest={focusRequest}
          />
        </Suspense>
      </Canvas>

      {(snapPulse || snapBurst) && <div className="iw-snap-burst" aria-hidden />}
      <SnapParticles active={snapPulse || snapBurst} />
    </div>
  );
}
