/**
 * Dark cinematic workshop backdrop — industrial sci-fi facility with neon accents.
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RoboticArm({ position, rotY = 0 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.28 + rotY) * 0.1;
  });
  return (
    <group ref={ref} position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 1.2, 0]} castShadow={false}>
        <boxGeometry args={[0.1, 2.5, 0.1]} />
        <meshStandardMaterial color="#1a2540" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0.5, 2.25, 0]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[1.1, 0.08, 0.08]} />
        <meshStandardMaterial color="#142035" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Accent glow on arm tip */}
      <mesh position={[0.95, 2.55, 0]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function EquipmentRack({ position }) {
  return (
    <group position={position}>
      <mesh castShadow={false}>
        <boxGeometry args={[1.8, 2.4, 0.5]} />
        <meshStandardMaterial color="#0d1525" metalness={0.6} roughness={0.45} />
      </mesh>
      {/* Shelf lines */}
      {[0.5, 1.1, 1.7].map((y) => (
        <mesh key={y} position={[0, y - 1.1, 0.26]}>
          <boxGeometry args={[1.6, 0.03, 0.42]} />
          <meshStandardMaterial color="#1a2848" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {/* LED status bars */}
      {[0.5, 1.1, 1.7].map((y, i) => (
        <mesh key={`led-${y}`} position={[0.7, y - 1.1, 0.28]}>
          <boxGeometry args={[0.35, 0.02, 0.02]} />
          <meshStandardMaterial
            color={['#00d9ff', '#00ff41', '#1e90ff'][i]}
            emissive={['#00d9ff', '#00ff41', '#1e90ff'][i]}
            emissiveIntensity={1.0}
          />
        </mesh>
      ))}
    </group>
  );
}

function HoloPanel({ position, rotY = 0 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.material.opacity = 0.2 + Math.sin(t * 1.1 + rotY) * 0.08;
    }
  });
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh ref={ref}>
        <planeGeometry args={[1.5, 0.9]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Panel frame */}
      <mesh>
        <boxGeometry args={[1.55, 0.95, 0.02]} />
        <meshStandardMaterial color="#0a1428" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Top status line */}
      <mesh position={[0, 0.44, 0.015]}>
        <boxGeometry args={[1.4, 0.03, 0.01]} />
        <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function CeilingLightPanel({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.8, 0.06, 0.55]} />
        <meshStandardMaterial color="#0d1525" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Emissive light strip */}
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[1.6, 0.01, 0.42]} />
        <meshStandardMaterial color="#c8e0ff" emissive="#c8e0ff" emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
}

export default function WorkshopBackdrop3D() {
  return (
    <group position={[0, 0, -5.5]}>
      {/* Dark back wall */}
      <mesh position={[0, 2.8, 0]} receiveShadow>
        <boxGeometry args={[20, 7, 0.18]} />
        <meshStandardMaterial color="#080c18" metalness={0.08} roughness={0.65} />
      </mesh>

      {/* Wall panel lines (horizontal) */}
      {[-0.4, 1.2, 2.8].map((y) => (
        <mesh key={y} position={[0, y, 0.1]}>
          <boxGeometry args={[18, 0.02, 0.02]} />
          <meshStandardMaterial color="#1a2848" metalness={0.8} roughness={0.3} emissive="#1a2848" emissiveIntensity={0.1} />
        </mesh>
      ))}

      {/* Neon accent lines */}
      <mesh position={[0, 0.6, 0.11]}>
        <boxGeometry args={[14, 0.012, 0.012]} />
        <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.62, 0.11]}>
        <boxGeometry args={[10, 0.006, 0.006]} />
        <meshStandardMaterial color="#1e90ff" emissive="#1e90ff" emissiveIntensity={0.6} />
      </mesh>

      {/* Dark side glass panels */}
      {[-6.5, 6.5].map((x) => (
        <mesh key={x} position={[x, 2.2, 0.8]}>
          <boxGeometry args={[2.8, 4.0, 0.05]} />
          <meshStandardMaterial color="#0a1428" transparent opacity={0.85} metalness={0.25} roughness={0.35} />
        </mesh>
      ))}

      <RoboticArm position={[-4.5, 0, 1.5]} rotY={0.38} />
      <RoboticArm position={[4.5, 0, 1.5]} rotY={-0.38} />
      <EquipmentRack position={[-5.5, 0.8, 2]} />
      <EquipmentRack position={[5.5, 0.8, 2]} />

      {/* Dark work tables */}
      {[-3.5, 3.5].map((x) => (
        <group key={x} position={[x, 0.45, 2.4]}>
          <mesh castShadow={false}>
            <boxGeometry args={[1.5, 0.06, 0.75]} />
            <meshStandardMaterial color="#0d1525" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[1.4, 0.9, 0.04]} />
            <meshStandardMaterial color="#0a1020" metalness={0.3} roughness={0.5} />
          </mesh>
        </group>
      ))}

      <HoloPanel position={[-2.0, 2.4, 0.5]} rotY={0.08} />
      <HoloPanel position={[2.0, 2.4, 0.5]} rotY={-0.08} />

      {/* Ceiling panels */}
      {[-2.5, 0, 2.5].map((x) => (
        <CeilingLightPanel key={x} position={[x, 4.9, 0.8]} />
      ))}

      {/* Subtle ambient fill lights for depth */}
      <pointLight position={[-5, 3, 2]} color="#1e3060" intensity={0.4} distance={8} decay={2} />
      <pointLight position={[5, 3, 2]} color="#1e3060" intensity={0.4} distance={8} decay={2} />
      <pointLight position={[0, 4, 0.5]} color="#c8e0ff" intensity={0.3} distance={12} decay={2} />
    </group>
  );
}
