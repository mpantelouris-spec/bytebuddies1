/**
 * Bright futuristic robotics workshop — rich ambient environment behind the hero robot.
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RoboticArm({ position = [0, 0, 0], rotation = [0, 0, 0], speed = 0.4 }) {
  const armRef = useRef();
  const jointRef = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (armRef.current) armRef.current.rotation.z = Math.sin(t) * 0.18;
    if (jointRef.current) jointRef.current.rotation.x = Math.sin(t * 1.3) * 0.25;
  });
  return (
    <group ref={armRef} position={position} rotation={rotation}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.14, 0.7, 0.14]} />
        <meshStandardMaterial color="#d4dce6" metalness={0.9} roughness={0.18} />
      </mesh>
      <group ref={jointRef} position={[0, 0.7, 0]}>
        <mesh position={[0.28, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.55, 10]} />
          <meshStandardMaterial color="#b8c8d8" metalness={0.88} roughness={0.22} />
        </mesh>
        <mesh position={[0.52, 0.2, 0]}>
          <sphereGeometry args={[0.07, 14, 14]} />
          <meshStandardMaterial color="#1e90ff" emissive="#1e90ff" emissiveIntensity={0.4} metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function HoloTable({ position }) {
  const ringRef = useRef();
  const innerRef = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.35;
      ringRef.current.material.opacity = 0.32 + Math.sin(t * 2) * 0.12;
    }
    if (innerRef.current) innerRef.current.rotation.z = -t * 0.55;
  });
  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.9, 64]} />
        <meshStandardMaterial color="#eef2f7" metalness={0.94} roughness={0.06} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[2.15, 2.85, 72]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.38} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={innerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.2, 1.45, 48]} />
        <meshBasicMaterial color="#1e90ff" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function ConveyorBelt({ position }) {
  const beltRef = useRef();
  useFrame((state) => {
    if (beltRef.current) beltRef.current.position.x = ((state.clock.elapsedTime * 0.15) % 2) - 1;
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[2.4, 0.08, 0.5]} />
        <meshStandardMaterial color="#c5ced8" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh ref={beltRef} position={[0, 0.12, 0]}>
        <boxGeometry args={[0.25, 0.12, 0.25]} />
        <meshStandardMaterial color="#1e90ff" emissive="#1e90ff" emissiveIntensity={0.15} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function HoloScreen({ position, rotation = [0, 0, 0] }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.material.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <planeGeometry args={[1.2, 0.7]} />
      <meshBasicMaterial color="#00d9ff" transparent opacity={0.6} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function ToolRack({ position }) {
  return (
    <group position={position}>
      {[0, 0.35, 0.7].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.2]} />
          <meshStandardMaterial color="#fff" metalness={0.2} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.2, 0.5, 0.15]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

function CeilingLight({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#f8fafc" emissive="#fffef5" emissiveIntensity={0.35} />
      </mesh>
      <pointLight position={[0, -0.4, 0]} intensity={0.35} color="#fffef5" distance={8} />
    </group>
  );
}

export default function WorkshopEnvironment3D() {
  return (
    <>
      <ambientLight intensity={1.15} color="#ffffff" />
      <hemisphereLight intensity={0.9} color="#f8fbff" groundColor="#d8e0ea" />
      <directionalLight position={[6, 12, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} color="#fffef8" />
      <directionalLight position={[-5, 8, -4]} intensity={0.5} color="#b8dcff" />
      <pointLight position={[0, 4, 2]} intensity={0.55} color="#00d9ff" distance={14} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.58, 0]} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#eef1f6" metalness={0.18} roughness={0.32} />
      </mesh>

      {/* Reflective floor accent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.57, 0]}>
        <circleGeometry args={[4.5, 48]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.65} roughness={0.15} transparent opacity={0.5} />
      </mesh>

      {/* Back wall + glass panels */}
      <mesh position={[0, 2.4, -5]} receiveShadow>
        <boxGeometry args={[16, 5.5, 0.15]} />
        <meshStandardMaterial color="#f4f7fb" metalness={0.05} roughness={0.48} />
      </mesh>
      {[-4.5, 4.5].map((x) => (
        <mesh key={x} position={[x, 2, -4.85]}>
          <boxGeometry args={[3.2, 2.8, 0.06]} />
          <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.35} transparent opacity={0.82} />
        </mesh>
      ))}

      <HoloTable position={[0, -0.55, 0]} />
      <RoboticArm position={[-3.5, -0.15, -1.4]} rotation={[0, 0.5, 0]} speed={0.35} />
      <RoboticArm position={[3.5, -0.15, -1.4]} rotation={[0, -0.5, 0]} speed={0.42} />
      <ConveyorBelt position={[-2.8, -0.5, 2.2]} />
      <ToolRack position={[2.6, -0.1, 2]} />
      <HoloScreen position={[-1.5, 1.8, -4.2]} rotation={[0, 0.2, 0]} />
      <HoloScreen position={[1.5, 1.8, -4.2]} rotation={[0, -0.2, 0]} />
      <CeilingLight position={[0, 4.2, 0]} />
      <CeilingLight position={[-3, 4, -1]} />
      <CeilingLight position={[3, 4, -1]} />

      {/* Holographic pillars */}
      {[-2.8, 2.8].map((x) => (
        <mesh key={x} position={[x, 0.7, -3.2]}>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 10]} />
          <meshBasicMaterial color="#1e90ff" transparent opacity={0.22} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      {/* Side workbenches */}
      {[-5.5, 5.5].map((x) => (
        <group key={x} position={[x, -0.35, -0.5]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.7, 0.9]} />
            <meshStandardMaterial color="#e8ecf2" metalness={0.3} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </>
  );
}
