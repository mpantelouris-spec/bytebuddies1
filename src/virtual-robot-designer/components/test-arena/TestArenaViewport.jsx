import React, { Suspense, forwardRef, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { TestArenaScene } from './TestArenaScene.jsx';
import { migrateDesign } from '../../config.js';
import { ARENA_CAMERA } from '../../constants/test-arena-scene.js';

const TestArenaViewport = forwardRef(function TestArenaViewport(
  { design, arenaId, arenaTheme, difficulty = 'easy', running, activeStep, onMove, onSensorRead },
  ref,
) {
  const d = migrateDesign(design);
  const cameraApiRef = useRef();

  return (
    <div className="ta-viewport-canvas-wrap">
      <Canvas
        className="ta-viewport-canvas"
        shadows
        dpr={[1, 1.75]}
        onDoubleClick={() => ref?.current?.resetCamera?.()}
        camera={{
          position: [0, 5, ARENA_CAMERA.defaultDistance],
          fov: ARENA_CAMERA.fov,
          near: 0.1,
          far: 90,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <TestArenaScene
            ref={ref}
            cameraApiRef={cameraApiRef}
            design={d}
            arenaId={arenaId}
            arenaTheme={arenaTheme}
            difficulty={difficulty}
            running={running}
            activeStep={activeStep}
            onMove={onMove}
            onSensorRead={onSensorRead}
          />
        </Suspense>
      </Canvas>
      <p className="ta-viewport-hint">Drag to spin · scroll to zoom out · double-click to reset view</p>
      <div className="ta-viewport-vignette" aria-hidden />
      {running && <div className="ta-viewport-live" aria-hidden>LIVE</div>}
    </div>
  );
});

export default TestArenaViewport;
