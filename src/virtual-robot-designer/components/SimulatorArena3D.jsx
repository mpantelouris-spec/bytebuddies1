import React, { Suspense, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { SimRobotScene } from './SimulatorRobot3D.jsx';
import { migrateDesign } from '../config.js';

/** Cinematic full-screen simulation facility — same robot as builder */
const SimulatorArena3D = forwardRef(function SimulatorArena3D({ design, arenaId = 'open', running, activeStep, onMove }, ref) {
  const d = migrateDesign(design);

  return (
    <div className="vrd-sim-arena3d">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [-4, 5, 6], fov: 50, near: 0.1, far: 80 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <color attach="background" args={['#020208']} />
        <fog attach="fog" args={['#020208', 8, 35]} />
        <ambientLight intensity={0.25} color="#4c1d95" />
        <hemisphereLight intensity={0.4} color="#8b5cf6" groundColor="#0a0014" />
        <directionalLight position={[8, 12, 6]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-6, 4, 4]} intensity={1.5} color="#ff006e" />
        <pointLight position={[6, 3, -4]} intensity={1.2} color="#00d4ff" />

        <Grid
          position={[0, 0, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#312e81"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#7c3aed"
          fadeDistance={22}
          infiniteGrid
        />

        <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={16} blur={2.5} far={6} color="#8b00ff" />

        <Suspense fallback={null}>
          <SimRobotScene ref={ref} design={d} arenaId={arenaId} onMove={onMove} running={running} activeStep={activeStep} />
        </Suspense>

        <OrbitControls enablePan={false} minDistance={4} maxDistance={18} maxPolarAngle={Math.PI / 2.2} minPolarAngle={0.3} enabled={!running} />

        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.85} intensity={0.55} />
        </EffectComposer>
      </Canvas>
      <div className="vrd-sim-arena-scan" aria-hidden />
    </div>
  );
});

export default SimulatorArena3D;
