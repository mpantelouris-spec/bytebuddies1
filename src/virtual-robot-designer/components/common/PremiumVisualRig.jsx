/**
 * Shared HDR studio lighting — dark cinematic with neon accents for workshop & arena.
 */
import React from 'react';
import { Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const WORKSHOP_LIGHTS = (
  <>
    {/* Ambient — bright enough to see the robot clearly */}
    <ambientLight intensity={0.12} color="#0a1830" />
    <hemisphereLight intensity={0.22} color="#1a2850" groundColor="#06080e" />

    {/* Main key light — warm white, dominant */}
    <directionalLight
      position={[9, 6, 5]}
      intensity={1.15}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-near={0.4}
      shadow-camera-far={32}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-bias={-0.00012}
      shadow-normalBias={0.02}
      color="#fff8f0"
    />

    {/* Rim light from back-left — subtle separation only */}
    <directionalLight position={[-7, 6, -4]} intensity={0.18} color="#1e40a0" />

    {/* Cyan edge-catch — very dim, just a hint on the front face */}
    <pointLight position={[0, -0.4, 4.5]} intensity={0.06} color="#00d9ff" distance={8} decay={2} />

    {/* Purple atmospheric from back — dim */}
    <pointLight position={[-3, 4.5, -3]} intensity={0.18} color="#8b5cf6" distance={14} decay={2} />

    {/* Blue kicker from right — subtle */}
    <pointLight position={[4, 3, 1.5]} intensity={0.12} color="#1e90ff" distance={10} decay={2} />

    {/* Warm secondary fill from front-top */}
    <pointLight position={[0, 3.5, 4]} intensity={0.28} color="#fff8f0" distance={10} decay={2} />
  </>
);

const ARENA_LIGHTS = (
  <>
    <ambientLight intensity={0.22} color="#0a1830" />
    <hemisphereLight intensity={0.35} color="#1a3050" groundColor="#06080e" />
    <directionalLight
      position={[8, 16, 6]}
      intensity={1.65}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-near={0.5}
      shadow-camera-far={45}
      shadow-camera-left={-14}
      shadow-camera-right={14}
      shadow-camera-top={14}
      shadow-camera-bottom={-14}
      shadow-bias={-0.0001}
      color="#fff8f0"
    />
    <directionalLight position={[-8, 8, -5]} intensity={0.5} color="#1e3a8a" />
    <pointLight position={[0, 8, 0]} intensity={0.6} color="#1e90ff" distance={28} decay={2} />
    <pointLight position={[0, 2, 6]} intensity={0.8} color="#00d9ff" distance={18} decay={2} />
    <pointLight position={[-6, 4, -4]} intensity={0.4} color="#8b5cf6" distance={16} decay={2} />
  </>
);

export default function PremiumVisualRig({
  variant = 'workshop',
  accent = '#00d9ff',
  bloomIntensity = 0.32,
  environmentIntensity = 0.18,
  contactShadows = true,
}) {
  const lights = variant === 'arena' ? ARENA_LIGHTS : WORKSHOP_LIGHTS;
  const shadowY = variant === 'arena' ? 0.01 : -0.002;
  const shadowScale = variant === 'arena' ? 24 : 10;

  return (
    <>
      <Environment preset="night" environmentIntensity={0.04} />
      {lights}
      {contactShadows && (
        <ContactShadows
          position={[0, shadowY, 0]}
          opacity={variant === 'arena' ? 0.65 : 0.7}
          scale={shadowScale}
          blur={3.2}
          far={variant === 'arena' ? 7 : 5.5}
          color="#000814"
          frames={1}
        />
      )}
      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.72}
          luminanceSmoothing={0.88}
          intensity={bloomIntensity}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
