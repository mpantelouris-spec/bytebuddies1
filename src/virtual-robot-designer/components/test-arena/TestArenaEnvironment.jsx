import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ARENA_OBSTACLES } from '../../services/robot-runtime.js';
import { getCourseMeta } from '../../data/test-arena-courses.js';
import TestArenaFacility from './TestArenaFacility.jsx';

function PulseRing({ position, color, scale = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const s = scale + Math.sin(state.clock.elapsedTime * 2.5) * 0.06;
    ref.current.scale.set(s, s, s);
    ref.current.material.opacity = 0.35 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <ringGeometry args={[0.55, 0.85, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.45} />
    </mesh>
  );
}

function SkyRing({ o, index }) {
  return (
    <group key={index} position={[o.x, 1.2, o.z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[o.r || 0.35, 0.06, 12, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.55} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function HoverPlatform({ o, index }) {
  return (
    <group key={index} position={[o.x, 0.35, o.z]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[o.r || 0.5, o.r || 0.5, 0.2, 24]} />
        <meshStandardMaterial color="#c026d3" emissive="#d946ef" emissiveIntensity={0.35} metalness={0.4} roughness={0.35} />
      </mesh>
      <PulseRing position={[0, 0.12, 0]} color="#e879f9" scale={1.1} />
    </group>
  );
}

function ArenaObstacle({ o, index }) {
  if (o.type === 'ring') return <SkyRing o={o} index={index} />;
  if (o.type === 'platform') return <HoverPlatform o={o} index={index} />;
  if (o.r) {
    return (
      <group key={index} position={[o.x, 0.55, o.z]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[o.r, o.r * 1.05, 1.1, 24]} />
          <meshStandardMaterial color="#ff8a80" emissive="#ff5252" emissiveIntensity={0.2} metalness={0.35} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#fff" emissive="#ffeb3b" emissiveIntensity={0.8} />
        </mesh>
      </group>
    );
  }
  if (o.type === 'wall') {
    return (
      <mesh key={index} position={[o.x, 0.55, o.z]} castShadow receiveShadow>
        <boxGeometry args={[o.w, 1.1, o.h]} />
        <meshStandardMaterial color="#b8c5d6" emissive="#7eb8ff" emissiveIntensity={0.08} metalness={0.25} roughness={0.55} />
      </mesh>
    );
  }
  if (o.type === 'ramp') {
    return (
      <mesh key={index} position={[o.x, 0.35, o.z]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[o.w, 0.5, o.h]} />
        <meshStandardMaterial color="#ffb74d" emissive="#ff9800" emissiveIntensity={0.12} roughness={0.5} />
      </mesh>
    );
  }
  return null;
}

function DeliveryZones() {
  return (
    <>
      <group position={[-4, 0, 0]}>
        <PulseRing position={[0, 0.04, 0]} color="#14b8a6" scale={1.2} />
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color="#5eead4" emissive="#14b8a6" emissiveIntensity={0.35} transparent opacity={0.85} />
        </mesh>
      </group>
      <group position={[4, 0, 0]}>
        <PulseRing position={[0, 0.04, 0]} color="#f472b6" scale={1.2} />
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.45, 20, 20]} />
          <meshStandardMaterial color="#fbcfe8" emissive="#ec4899" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </>
  );
}

function CollectTargets() {
  const spots = [
    [2.5, -2], [-2, 2.5], [3, 2], [-3, -1.5],
  ];
  return spots.map(([x, z], i) => (
    <group key={i} position={[x, 0, z]}>
      <PulseRing position={[0, 0.05, 0]} color="#a855f7" />
      <mesh position={[0, 0.55, 0]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={0.5} metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  ));
}

function AnimatedBeacons() {
  const refs = useRef([]);
  const positions = useMemo(
    () => [
      [-5.5, 0.8, -5.5], [5.5, 0.8, -5.5], [-5.5, 0.8, 5.5], [5.5, 0.8, 5.5],
    ],
    [],
  );
  useFrame((state) => {
    refs.current.forEach((m, i) => {
      if (m) m.position.y = 0.75 + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.12;
    });
  });
  return positions.map((pos, i) => (
    <mesh
      key={i}
      ref={(el) => { refs.current[i] = el; }}
      position={pos}
    >
      <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
      <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.6} />
    </mesh>
  ));
}

const FLOOR_BY_THEME = {
  sky: '#b8d9ff',
  underwater: '#0e7490',
  rough: '#b8a898',
  mining: '#78716c',
  factory: '#e2e8f0',
  terrain: '#c8e6c9',
  hover: '#312e81',
  lego: '#ffcc80',
  ai: '#ede9fe',
  ground: '#dce8f5',
};

export default function TestArenaEnvironment({ arenaId, arenaTheme = 'ground' }) {
  const course = getCourseMeta(arenaId);
  const obstacles = ARENA_OBSTACLES[arenaId] || ARENA_OBSTACLES.obstacles;
  const accent = course.color || '#1e90ff';
  const floorColor = FLOOR_BY_THEME[arenaTheme] || FLOOR_BY_THEME.ground;
  const isUnderwater = arenaTheme === 'underwater';

  return (
    <group>
      <TestArenaFacility accent={accent} />
      {isUnderwater && (
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[30, 8, 30]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color={floorColor} metalness={isUnderwater ? 0.5 : 0.28} roughness={0.42} envMapIntensity={1.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} receiveShadow>
        <ringGeometry args={[11.5, 13.8, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} transparent opacity={0.35} />
      </mesh>

      {/* Inner test pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[9, 48]} />
        <meshStandardMaterial color="#f0f6fc" metalness={0.22} roughness={0.38} envMapIntensity={1.1} />
      </mesh>

      {/* Boundary walls — soft futuristic panels */}
      {[
        [0, 1.1, -7.2, 14, 0.35], [0, 1.1, 7.2, 14, 0.35],
        [-7.2, 1.1, 0, 0.35, 14], [7.2, 1.1, 0, 0.35, 14],
      ].map(([x, y, z, w, h], i) => (
        <mesh key={`wall-${i}`} position={[x, y, z]} receiveShadow>
          <boxGeometry args={[w, 2.2, h]} />
          <meshStandardMaterial color="#e2eaf4" emissive="#94c5ff" emissiveIntensity={0.06} metalness={0.2} roughness={0.5} />
        </mesh>
      ))}

      <AnimatedBeacons />

      {obstacles.map((o, i) => (
        <ArenaObstacle key={`obs-${i}`} o={o} index={i} />
      ))}

      {arenaId === 'linefollow' && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
            <planeGeometry args={[0.4, 14]} />
            <meshStandardMaterial color="#00e676" emissive="#00c853" emissiveIntensity={0.35} />
          </mesh>
          <PulseRing position={[0, 0.03, -6]} color="#00c853" />
          <PulseRing position={[0, 0.03, 6]} color="#00c853" />
        </>
      )}

      {arenaId === 'square' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[3.2, 3.45, 4]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.25} />
        </mesh>
      )}

      {arenaId === 'delivery' && <DeliveryZones />}
      {arenaId === 'collect' && <CollectTargets />}

      {/* Start pad */}
      <group position={[0, 0, 0]}>
        <PulseRing position={[0, 0.04, 0]} color={accent} scale={1.4} />
      </group>
    </group>
  );
}
