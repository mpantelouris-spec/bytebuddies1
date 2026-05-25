/**
 * Distant workshop decor — behind robot, low contrast, no collision with build area.
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function DistantArm({ position, rotY = 0 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + rotY) * 0.12;
  });
  return (
    <group ref={ref} position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 1.2, 0]} castShadow={false}>
        <boxGeometry args={[0.1, 2.4, 0.1]} />
        <meshStandardMaterial color="#d8e0ea" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.5, 2.2, 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[1, 0.08, 0.08]} />
        <meshStandardMaterial color="#c5d0dc" metalness={0.75} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ShelfUnit({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.8, 2.2, 0.5]} />
        <meshStandardMaterial color="#f4f7fb" metalness={0.1} roughness={0.55} />
      </mesh>
      {[0.4, 1.0, 1.6].map((y) => (
        <mesh key={y} position={[0, y - 1, 0.26]}>
          <boxGeometry args={[1.6, 0.04, 0.4]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function HoloDisplay({ position }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.material.opacity = 0.28 + Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
  });
  return (
    <mesh ref={ref} position={position} rotation={[0, 0, 0]}>
      <planeGeometry args={[1.4, 0.85]} />
      <meshBasicMaterial color="#00d9ff" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function WorkshopBackdrop3D() {
  return (
    <group position={[0, 0, -5.5]}>
      {/* Back wall */}
      <mesh position={[0, 2.8, 0]} receiveShadow>
        <boxGeometry args={[18, 6, 0.2]} />
        <meshStandardMaterial color="#f0f4f8" metalness={0.05} roughness={0.5} />
      </mesh>

      {/* Side glass panels */}
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, 2.2, 0.8]}>
          <boxGeometry args={[2.5, 3.5, 0.06]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.55} metalness={0.15} roughness={0.4} />
        </mesh>
      ))}

      <DistantArm position={[-4.5, 0, 1.5]} rotY={0.35} />
      <DistantArm position={[4.5, 0, 1.5]} rotY={-0.35} />
      <ShelfUnit position={[-5.5, 0.8, 2]} />
      <ShelfUnit position={[5.5, 0.8, 2]} />

      {/* Work tables (low, far) */}
      {[-3.5, 3.5].map((x) => (
        <mesh key={x} position={[x, 0.45, 2.5]} castShadow={false}>
          <boxGeometry args={[1.4, 0.9, 0.7]} />
          <meshStandardMaterial color="#e8edf2" metalness={0.25} roughness={0.4} />
        </mesh>
      ))}

      <HoloDisplay position={[-1.8, 2.4, 0.5]} />
      <HoloDisplay position={[1.8, 2.4, 0.5]} />

      {/* Ceiling light panels (visual only) */}
      {[-2.5, 0, 2.5].map((x) => (
        <mesh key={x} position={[x, 4.8, 1]}>
          <boxGeometry args={[1.6, 0.08, 0.5]} />
          <meshStandardMaterial color="#fffef8" emissive="#fffef5" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}
