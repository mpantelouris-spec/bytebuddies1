/**
 * Bright futuristic robotics workshop — ambient environment behind the hero robot.
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RoboticArm({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const armRef = useRef();
  useFrame((state) => {
    if (armRef.current) {
      armRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
      armRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.2;
    }
  });
  return (
    <group ref={armRef} position={position} rotation={rotation}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.12, 0.8, 0.12]} />
        <meshStandardMaterial color="#c8d4e0" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.35, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
        <meshStandardMaterial color="#a8b8c8" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0.7, 0.85, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#1E90FF" emissive="#1E90FF" emissiveIntensity={0.35} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function HoloTable({ position }) {
  const ringRef = useRef();
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.35;
      ringRef.current.material.opacity = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.8, 48]} />
        <meshStandardMaterial color="#e8ecf2" metalness={0.92} roughness={0.08} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.2, 2.75, 64]} />
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export default function WorkshopEnvironment3D() {
  return (
    <>
      <ambientLight intensity={1.1} color="#ffffff" />
      <hemisphereLight intensity={0.85} color="#f8fbff" groundColor="#d0d8e4" />
      <directionalLight position={[5, 10, 6]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} color="#fffef5" />
      <directionalLight position={[-4, 6, -3]} intensity={0.45} color="#b8dcff" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#00D9FF" distance={12} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.58, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#eef1f6" metalness={0.15} roughness={0.35} />
      </mesh>

      {/* Back wall panels */}
      <mesh position={[0, 2.2, -4.5]} receiveShadow>
        <boxGeometry args={[14, 5, 0.2]} />
        <meshStandardMaterial color="#f4f6fa" metalness={0.05} roughness={0.5} />
      </mesh>
      <mesh position={[-5, 1.8, -4.3]}>
        <boxGeometry args={[3, 2.5, 0.08]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.4} transparent opacity={0.85} />
      </mesh>
      <mesh position={[5, 1.8, -4.3]}>
        <boxGeometry args={[3, 2.5, 0.08]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.4} transparent opacity={0.85} />
      </mesh>

      <HoloTable position={[0, -0.55, 0]} />
      <RoboticArm position={[-3.2, -0.2, -1.2]} rotation={[0, 0.4, 0]} />
      <RoboticArm position={[3.2, -0.2, -1.2]} rotation={[0, -0.4, 0]} />

      {/* Holographic accent pillars */}
      {[-2.5, 2.5].map((x) => (
        <mesh key={x} position={[x, 0.6, -2.8]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshBasicMaterial color="#1E90FF" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </>
  );
}
