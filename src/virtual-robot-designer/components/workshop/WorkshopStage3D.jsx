/**
 * Assembly platform — dark cinematic stage with neon glow ring and holographic grid.
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLATFORM } from '../../constants/workshop-scene.js';

function BuildRing() {
  const outerRef = useRef();
  const pulseRef = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.rotation.z = t * 0.18;
      outerRef.current.material.opacity = 0.18 + Math.sin(t * 1.6) * 0.04;
    }
    if (pulseRef.current) {
      pulseRef.current.material.opacity = 0.04 + Math.sin(t * 0.9) * 0.015;
    }
  });
  return (
    <group position={[0, PLATFORM.topY + 0.012, 0]}>
      {/* Thin accent ring — slow spin */}
      <mesh ref={outerRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PLATFORM.ringOuter - 0.08, PLATFORM.ringOuter, 80]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Very subtle glow disc */}
      <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[PLATFORM.radius - 0.08, 64]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function HoloGrid() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.45) * 0.03;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY + 0.009, 0]}>
      <ringGeometry args={[0.4, PLATFORM.radius - 0.12, 48]} />
      <meshBasicMaterial color="#00d9ff" transparent opacity={0.1} wireframe depthWrite={false} />
    </mesh>
  );
}

function AssemblyMarks() {
  const marks = [];
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    marks.push(
      <mesh key={i} position={[Math.sin(a) * 1.55, PLATFORM.topY + 0.011, Math.cos(a) * 1.55]} rotation={[-Math.PI / 2, 0, -a]}>
        <planeGeometry args={[0.07, 0.018]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.5} depthWrite={false} />
      </mesh>,
    );
  }
  return <group>{marks}</group>;
}

export default function WorkshopStage3D() {
  return (
    <group>
      {/* Dark workshop floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY - 0.02, 0]} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#080c18" metalness={0.18} roughness={0.72} />
      </mesh>

      {/* Subtle floor grid lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY - 0.018, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshBasicMaterial color="#1e3060" transparent opacity={0.12} wireframe depthWrite={false} />
      </mesh>

      {/* Main assembly pedestal — very dark, non-reflective */}
      <mesh position={[0, PLATFORM.topY - PLATFORM.thickness / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[PLATFORM.radius, PLATFORM.radius + 0.1, PLATFORM.thickness, 64]} />
        <meshStandardMaterial color="#0a0f1e" metalness={0.3} roughness={0.65} envMapIntensity={0.15} />
      </mesh>

      {/* Beveled pedestal base ring */}
      <mesh position={[0, PLATFORM.topY - PLATFORM.thickness + 0.04, 0]}>
        <cylinderGeometry args={[PLATFORM.radius + 0.12, PLATFORM.radius + 0.18, 0.06, 64]} />
        <meshStandardMaterial color="#080c16" metalness={0.25} roughness={0.7} />
      </mesh>

      {/* Top plate — robot stands here */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY + 0.001, 0]} receiveShadow>
        <circleGeometry args={[PLATFORM.radius - 0.04, 64]} />
        <meshStandardMaterial color="#0e1628" metalness={0.55} roughness={0.45} envMapIntensity={0.3} />
      </mesh>

      {/* Minimal floor accent — just a faint halo outside the base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY - 0.12, 0]}>
        <ringGeometry args={[PLATFORM.radius + 0.05, PLATFORM.radius + 0.45, 48]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.025} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Neon edge rim — unlit so it doesn't bloom under directional specular */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY + 0.007, 0]}>
        <ringGeometry args={[PLATFORM.radius - 0.025, PLATFORM.radius, 64]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      <HoloGrid />
      <BuildRing />
      <AssemblyMarks />

      {/* Faint under-platform accent — too bright washes the cylinder sides */}
      <pointLight position={[0, PLATFORM.topY - 0.35, 0]} color="#00d9ff" intensity={0.04} distance={3} decay={2} />
      {/* Purple accent light from below */}
      <pointLight position={[-1.5, PLATFORM.topY - 0.4, -1]} color="#8b5cf6" intensity={0.22} distance={6} decay={2} />
    </group>
  );
}
