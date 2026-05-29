import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
/** Bright robotics testing facility — walls, polished floor, holograms, animated accents */
export default function TestArenaFacility({ accent = '#1e90ff' }) {
  const holoRef = useRef();
  const holoPlaneRef = useRef();
  const lightRef = useRef();
  const scannerRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (holoRef.current) holoRef.current.rotation.y = t * 0.15;
    if (holoPlaneRef.current?.material) {
      holoPlaneRef.current.material.opacity = 0.22 + Math.sin(t * 2) * 0.08;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.45 + Math.sin(t * 1.2) * 0.08;
    }
    if (scannerRef.current) {
      scannerRef.current.rotation.y = t * 0.4;
      scannerRef.current.material.opacity = 0.15 + Math.sin(t * 3) * 0.06;
    }
  });

  return (
    <group>
      <mesh scale={[1, 1, 1]}>
        <sphereGeometry args={[24, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.15]} />
        <meshBasicMaterial color="#dceaf8" side={THREE.BackSide} />
      </mesh>

      {/* Polished arena floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} receiveShadow>
        <circleGeometry args={[11, 80]} />
        <meshStandardMaterial color="#d4e2f2" metalness={0.55} roughness={0.16} envMapIntensity={1.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[9.5, 11, 80]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.06} metalness={0.5} roughness={0.25} transparent opacity={0.35} />
      </mesh>

      {/* Curved back wall panels */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 7.5, 2.2, -7]} rotation={[0, side * 0.15, 0]} receiveShadow>
          <boxGeometry args={[5, 4.2, 0.2]} />
          <meshStandardMaterial color="#f0f4f8" metalness={0.12} roughness={0.38} envMapIntensity={1.05} />
        </mesh>
      ))}
      <mesh position={[0, 2.4, -8.2]} receiveShadow>
        <boxGeometry args={[14, 4.8, 0.25]} />
        <meshStandardMaterial color="#f0f4f8" metalness={0.12} roughness={0.38} envMapIntensity={1.05} />
      </mesh>

      {/* Overhead soft boxes */}
      {[-4, 0, 4].map((x) => (
        <group key={x} position={[x, 5.8, -1]}>
          <mesh>
            <boxGeometry args={[3.2, 0.12, 0.5]} />
            <meshStandardMaterial color="#fffef8" emissive="#fffef5" emissiveIntensity={0.4} metalness={0.1} roughness={0.3} />
          </mesh>
          <pointLight position={[0, -0.35, 0]} intensity={0.38} color="#fffef8" distance={10} />
        </group>
      ))}

      <pointLight ref={lightRef} position={[0, 7, 0]} intensity={0.45} color="#ffffff" distance={28} />

      {/* Holographic mission ring */}
      <group ref={holoRef} position={[0, 3.4, -5.5]}>
        <mesh>
          <torusGeometry args={[2.4, 0.05, 20, 64]} />
          <meshBasicMaterial color={accent} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={holoPlaneRef} rotation={[0.35, 0, 0]}>
          <planeGeometry args={[4.5, 1]} />
          <meshBasicMaterial color={accent} transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Rotating floor scanner */}
      <mesh ref={scannerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.5, 3.65, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Corner pylons */}
      {[[-6.5, -6.5], [6.5, -6.5], [-6.5, 6.5], [6.5, 6.5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.2, 2.5, 12]} />
            <meshStandardMaterial color="#c5d4e8" emissive={accent} emissiveIntensity={0.12} metalness={0.88} roughness={0.22} envMapIntensity={1.2} />
          </mesh>
          <mesh position={[0, 2.65, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.85} metalness={0.4} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Distant charging stations */}
      {[-5, 5].map((x) => (
        <group key={x} position={[x, 0, -6.8]}>
          <mesh castShadow>
            <boxGeometry args={[1.2, 1.6, 0.5]} />
            <meshStandardMaterial color="#e8eef5" metalness={0.25} roughness={0.42} envMapIntensity={1.1} />
          </mesh>
          <mesh position={[0, 0.9, 0.28]}>
            <boxGeometry args={[0.5, 0.35, 0.08]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      <gridHelper args={[22, 22, accent, '#b8cce0']} position={[0, 0.015, 0]} />
    </group>
  );
}
