import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, ContactShadows, Grid, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import RobotModelR3F from './RobotModelR3F.jsx';
import { migrateDesign } from '../config.js';

function ChamberRing({ color }) {
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <ringGeometry args={[2.1, 2.55, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.54, 0]}>
        <ringGeometry args={[1.85, 1.95, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </mesh>
    </Float>
  );
}

function ChamberScene({ design, autoSpin, userYaw }) {
  const d = migrateDesign(design);
  const glow = d.chassis?.color || d.cosmetics?.primaryColor || '#8B00FF';

  return (
    <>
      <color attach="background" args={['#030308']} />
      <fog attach="fog" args={['#030308', 6, 22]} />
      <ambientLight intensity={0.35} color="#6b21a8" />
      <hemisphereLight intensity={0.5} color="#8b5cf6" groundColor="#0a0014" />
      <directionalLight position={[5, 8, 4]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-4, 3, 3]} intensity={2} color="#8b00ff" />
      <pointLight position={[4, 2, -2]} intensity={1.5} color="#ff006e" />
      <pointLight position={[0, 1, 5]} intensity={1} color="#00d4ff" />

      <Stars radius={80} depth={40} count={3000} factor={3} saturation={0} fade speed={0.6} />
      <Sparkles count={80} scale={8} size={2} speed={0.35} opacity={0.45} color="#ff006e" />
      <Sparkles count={50} scale={6} size={1.5} speed={0.2} opacity={0.35} color="#00d4ff" position={[0, 1, 0]} />

      <Grid
        position={[0, -0.56, 0]}
        args={[12, 12]}
        cellSize={0.35}
        cellThickness={0.6}
        cellColor="#4c1d95"
        sectionSize={1.4}
        sectionThickness={1.2}
        sectionColor="#8b00ff"
        fadeDistance={14}
        infiniteGrid
      />

      <ChamberRing color={glow} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.57, 0]} receiveShadow>
        <circleGeometry args={[3.2, 64]} />
        <meshStandardMaterial color="#0a0a18" metalness={0.9} roughness={0.2} emissive="#1a0a3a" emissiveIntensity={0.15} />
      </mesh>

      <ContactShadows position={[0, -0.55, 0]} opacity={0.55} scale={8} blur={2.5} far={4} color="#8b00ff" />

      <RobotModelR3F design={design} autoSpin={autoSpin} userRotation={userYaw} />

      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={9}
        maxPolarAngle={Math.PI / 2 + 0.15}
        minPolarAngle={0.35}
        autoRotate={false}
      />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.9} intensity={0.65} />
        <Vignette eskil={false} offset={0.12} darkness={0.65} />
      </EffectComposer>
    </>
  );
}

function AssemblyDrone({ position, color }) {
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh position={position}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} metalness={0.9} roughness={0.2} />
      </mesh>
      <pointLight position={position} intensity={0.4} color={color} distance={2} />
    </Float>
  );
}

/** Cinematic holographic robot assembly chamber */
export default function AssemblyChamber({ design, className = '', assemblyPulse = '' }) {
  const [autoSpin, setAutoSpin] = useState(true);
  const [userYaw] = useState(0);
  const d = migrateDesign(design);

  return (
    <div className={`vrd-chamber ${className}`}>
      <div className="vrd-chamber-hud">
        <span className="vrd-chamber-tag">◈ ASSEMBLY CHAMBER</span>
        <span className="vrd-chamber-status">● SYSTEMS ONLINE</span>
      </div>
      <div className={`vrd-chamber-frame ${assemblyPulse ? 'vrd-chamber-frame--pulse' : ''}`}>
        <div className="vrd-chamber-corner vrd-chamber-corner--tl" />
        <div className="vrd-chamber-corner vrd-chamber-corner--tr" />
        <div className="vrd-chamber-corner vrd-chamber-corner--bl" />
        <div className="vrd-chamber-corner vrd-chamber-corner--br" />
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0.6, 0.75, 4.8], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <Suspense fallback={null}>
            <ChamberScene design={d} autoSpin={autoSpin} userYaw={userYaw} />
            <AssemblyDrone position={[-2.2, 1.2, 1.5]} color="#ff006e" />
            <AssemblyDrone position={[2.4, 0.9, -1.2]} color="#00d4ff" />
            <AssemblyDrone position={[0, 2, -2]} color="#8b00ff" />
          </Suspense>
        </Canvas>
        <div className="vrd-chamber-scan" aria-hidden />
      </div>
      <div className="vrd-chamber-controls">
        <button type="button" className="vrd-chamber-ctrl" onClick={() => setAutoSpin((s) => !s)}>
          {autoSpin ? '⏸ Hold rotation' : '⟳ Auto rotate'}
        </button>
        <span className="vrd-chamber-hint">Drag to orbit · Scroll to zoom</span>
      </div>
    </div>
  );
}
