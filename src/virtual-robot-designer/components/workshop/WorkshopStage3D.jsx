/**
 * Assembly platform — grounds the robot, build ring, markings, reflections.
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLATFORM } from '../../constants/workshop-scene.js';

function BuildRing() {
  const outerRef = useRef();
  const innerRef = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.rotation.z = t * 0.2;
      outerRef.current.material.opacity = 0.42 + Math.sin(t * 1.8) * 0.08;
    }
    if (innerRef.current) innerRef.current.rotation.z = -t * 0.35;
  });
  return (
    <group position={[0, PLATFORM.topY + 0.012, 0]}>
      <mesh ref={outerRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PLATFORM.ringInner, PLATFORM.ringOuter, 80]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={innerRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.38, 64]} />
        <meshBasicMaterial color="#1e90ff" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function AssemblyMarks() {
  const marks = [];
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    marks.push(
      <mesh key={i} position={[Math.sin(a) * 1.55, PLATFORM.topY + 0.011, Math.cos(a) * 1.55]} rotation={[-Math.PI / 2, 0, -a]}>
        <planeGeometry args={[0.08, 0.02]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.35} />
      </mesh>,
    );
  }
  return <group>{marks}</group>;
}

export default function WorkshopStage3D() {
  const gridRef = useRef();
  useFrame((state) => {
    if (gridRef.current) gridRef.current.material.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
  });

  return (
    <group>
      {/* Workshop floor beyond platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY - 0.02, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#e8ecf2" metalness={0.12} roughness={0.42} />
      </mesh>

      {/* Main assembly pedestal */}
      <mesh position={[0, PLATFORM.topY - PLATFORM.thickness / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[PLATFORM.radius, PLATFORM.radius + 0.08, PLATFORM.thickness, 64]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.78} roughness={0.22} />
      </mesh>

      {/* Top plate — robot stands here */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY + 0.001, 0]} receiveShadow>
        <circleGeometry args={[PLATFORM.radius - 0.05, 64]} />
        <meshStandardMaterial color="#fafbfc" metalness={0.88} roughness={0.14} envMapIntensity={0.6} />
      </mesh>

      {/* Subtle holo grid on platform */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY + 0.008, 0]}>
        <ringGeometry args={[0.5, PLATFORM.radius - 0.15, 48]} />
        <meshBasicMaterial color="#1e90ff" transparent opacity={0.12} wireframe />
      </mesh>

      <BuildRing />
      <AssemblyMarks />

      {/* Edge accent rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATFORM.topY + 0.006, 0]}>
        <ringGeometry args={[PLATFORM.radius - 0.02, PLATFORM.radius, 64]} />
        <meshStandardMaterial color="#1e90ff" metalness={0.6} roughness={0.3} emissive="#1e90ff" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}
