import React, { Suspense, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { TestArenaScene } from './TestArenaScene.jsx';
import { migrateDesign } from '../../config.js';

const TestArenaViewport = forwardRef(function TestArenaViewport(
  { design, arenaId, running, activeStep, onMove, onSensorRead, cameraReset },
  ref,
) {
  const d = migrateDesign(design);

  return (
    <div className="ta-viewport-canvas-wrap">
      <Canvas
        className="ta-viewport-canvas"
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 4, 7], fov: 44, near: 0.1, far: 60 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <TestArenaScene
            ref={ref}
            design={d}
            arenaId={arenaId}
            running={running}
            activeStep={activeStep}
            onMove={onMove}
            onSensorRead={onSensorRead}
          />
        </Suspense>
      </Canvas>
      <div className="ta-viewport-vignette" aria-hidden />
      {running && <div className="ta-viewport-live" aria-hidden>LIVE</div>}
    </div>
  );
});

export default TestArenaViewport;
