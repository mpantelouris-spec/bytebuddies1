import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import InteractiveRobotModel from './InteractiveRobotModel.jsx';
import { migrateDesign } from '../config.js';
import { migrateAssembly } from '../services/assembly-service.js';
import { SNAP_SLOTS } from '../data/assembly-parts.js';

/** Rocksi-style lab viewport — white robot, dark bg, clean white grid */
export default function LabViewport3D({
  design,
  highlightSlot = null,
  snapPulse = false,
  showControls = true,
  compact = false,
}) {
  const [autoSpin, setAutoSpin] = useState(false);
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const slotMeta = highlightSlot ? SNAP_SLOTS[highlightSlot] : null;
  const isArm = asm.base?.shape === 'arm';

  return (
    <div className={`vrd-lab-viewport ${compact ? 'vrd-lab-viewport--compact' : ''}`}>
      {showControls && (
        <div className="vrd-lab-hud">
          <span className="vrd-lab-badge">3D Preview</span>
          {slotMeta && !asm.slots[highlightSlot] && (
            <span className="vrd-lab-hint">Adding: {slotMeta.label}</span>
          )}
        </div>
      )}
      <div className={`vrd-lab-canvas-wrap ${snapPulse ? 'vrd-lab-canvas-wrap--pulse' : ''}`}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{
            position: isArm ? [2.2, 1.6, 2.8] : [1.4, 1.2, 3.2],
            fov: 42,
            near: 0.1,
            far: 100,
          }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        >
          <Suspense fallback={null}>
            <color attach="background" args={['#1e2433']} />
            <fog attach="fog" args={['#1e2433', 8, 28]} />
            <Environment preset="warehouse" />
            <ambientLight intensity={0.55} color="#ffffff" />
            <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#263238" />
            <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} color="#ffffff" />
            <directionalLight position={[-4, 4, -3]} intensity={0.35} color="#b0bec5" />

            <Grid
              position={[0, -0.56, 0]}
              args={[20, 20]}
              cellSize={0.5}
              cellThickness={0.6}
              cellColor="#546e7a"
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#78909c"
              fadeDistance={22}
              infiniteGrid
            />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.561, 0]} receiveShadow>
              <planeGeometry args={[30, 30]} />
              <meshStandardMaterial color="#263238" metalness={0.1} roughness={0.85} />
            </mesh>

            <ContactShadows position={[0, -0.56, 0]} opacity={0.45} scale={12} blur={2.5} far={4} color="#000000" />

            <InteractiveRobotModel
              design={d}
              autoSpin={autoSpin}
              highlightSlot={highlightSlot}
              snapPulse={snapPulse}
              labMode
            />

            <OrbitControls
              enablePan={false}
              minDistance={isArm ? 2 : 2.2}
              maxDistance={isArm ? 7 : 8}
              maxPolarAngle={Math.PI / 2 + 0.05}
              minPolarAngle={0.2}
              target={isArm ? [0, 0.5, 0] : [0, 0, 0]}
            />

            <EffectComposer multisampling={0}>
              <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.9} intensity={0.15} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>
      {showControls && (
        <div className="vrd-lab-controls">
          <button type="button" className="vrd-lab-btn" onClick={() => setAutoSpin((s) => !s)}>
            {autoSpin ? '⏸' : '▶'}
          </button>
          <span>Drag to orbit · Scroll to zoom</span>
        </div>
      )}
    </div>
  );
}
