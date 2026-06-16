/**
 * PREMIUM ROBOT VISUALS — Enhanced materials, animations, and details
 * Better shadows, metallic surfaces, glowing elements, animated parts
 */
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED MATERIALS LIBRARY
// ─────────────────────────────────────────────────────────────────────────────

export const materials = {
  chromeShiny: new THREE.MeshStandardMaterial({
    color: '#cccccc',
    metalness: 0.95,
    roughness: 0.05,
    envMapIntensity: 1,
  }),

  plasticGloss: new THREE.MeshStandardMaterial({
    color: '#1a1a2e',
    metalness: 0.1,
    roughness: 0.3,
  }),

  rubberMatte: new THREE.MeshStandardMaterial({
    color: '#333333',
    metalness: 0,
    roughness: 0.9,
  }),

  neonGlow: (color = '#00d9ff') => new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.5,
    metalness: 0.3,
    roughness: 0.2,
  }),

  ledLight: (color = '#ff0000') => new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.8,
    metalness: 0.6,
    roughness: 0.1,
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED WHEEL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function AnimatedWheel({ position, radius = 0.4, speed = 1, isMoving = false }) {
  const wheelRef = useRef();

  useFrame((state, delta) => {
    if (wheelRef.current && isMoving) {
      wheelRef.current.rotation.x += delta * speed * 4;
    }
  });

  return (
    <group position={position} ref={wheelRef}>
      {/* Wheel rim */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.2, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Tire tread */}
      <mesh>
        <torusGeometry args={[radius * 0.95, radius * 0.08, 12, 20]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>

      {/* Hub cap with glow */}
      <mesh position={[-0.12, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.4, radius * 0.4, 0.08, 16]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#0099ff"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Opposite hub cap */}
      <mesh position={[0.12, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.4, radius * 0.4, 0.08, 16]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#0099ff"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROBOT BODY WITH ENHANCED MATERIALS
// ─────────────────────────────────────────────────────────────────────────────

export function EnhancedRobotBody({ color = '#1a1a2e', glowColor = '#00d9ff' }) {
  const bodyRef = useRef();

  return (
    <group ref={bodyRef}>
      {/* Main chassis - metallic with depth */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.8, 1.6]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Top panel - slightly rounded, glossy */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.1, 1.6]} />
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={0.1}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* Vents on sides */}
      {[-0.5, 0.5].map((x, i) => (
        <group key={i} position={[x, 0, 0.8]}>
          {Array.from({ length: 3 }).map((_, j) => (
            <mesh key={j} position={[0, -0.25 + j * 0.25, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.1]} />
              <meshStandardMaterial color="#000000" roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}

      {/* LED indicator lights */}
      {[[-0.3, '#ff0000'], [0, '#00ff00'], [0.3, '#0000ff']].map(([x, ledColor], i) => (
        <group key={i} position={[x, 0.43, -0.7]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 12]} />
            <meshStandardMaterial
              color={ledColor}
              emissive={ledColor}
              emissiveIntensity={0.7}
              metalness={0.5}
            />
          </mesh>
          {/* LED lens */}
          <mesh position={[0, 0.03, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial
              color={ledColor}
              emissive={ledColor}
              emissiveIntensity={0.9}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Sensor dome on front */}
      <mesh position={[0, 0.2, 0.85]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial
          color="#333333"
          emissive={glowColor}
          emissiveIntensity={0.2}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Bolts and details */}
      {[[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.42, z]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color="#888888"
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED ROBOT HEAD WITH EYES AND BLINKING
// ─────────────────────────────────────────────────────────────────────────────

export function AnimatedRobotHead({ glowColor = '#00d9ff' }) {
  const headRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const blinkStateRef = useRef(0);

  useFrame((state, delta) => {
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }

    // Blinking animation
    blinkStateRef.current = (blinkStateRef.current + delta) % 4;
    const blinkPhase = blinkStateRef.current;
    let eyeScale = 1;

    if (blinkPhase > 3.5) {
      eyeScale = 1 - (blinkPhase - 3.5) * 2; // Close
    } else if (blinkPhase < 0.3) {
      eyeScale = 1 - (0.3 - blinkPhase) * 2; // Open
    }

    if (leftEyeRef.current) {
      leftEyeRef.current.scale.y = Math.max(0.1, eyeScale);
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.y = Math.max(0.1, eyeScale);
    }
  });

  return (
    <group ref={headRef} position={[0, 1.2, 0]}>
      {/* Head body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Face plate */}
      <mesh position={[0, 0, 0.22]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial
          color="#000000"
          emissive={glowColor}
          emissiveIntensity={0.1}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Left eye */}
      <group position={[-0.12, 0.1, 0.25]}>
        <mesh ref={leftEyeRef} castShadow>
          <boxGeometry args={[0.1, 0.12, 0.02]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={0.8}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* Right eye */}
      <group position={[0.12, 0.1, 0.25]}>
        <mesh ref={rightEyeRef} castShadow>
          <boxGeometry args={[0.1, 0.12, 0.02]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={0.8}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* Antenna */}
      <group position={[0, 0.3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.03, 0.02, 0.4, 8]} />
          <meshStandardMaterial
            color="#00d9ff"
            emissive="#0099ff"
            emissiveIntensity={0.4}
            metalness={0.7}
          />
        </mesh>
        {/* Antenna tip - LED */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.9}
          />
        </mesh>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROBOT ARM WITH JOINT ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

export function RobotArm({ position, isMoving = false }) {
  const shoulderRef = useRef();
  const elbowRef = useRef();
  const wristRef = useRef();

  useFrame((state, delta) => {
    if (isMoving) {
      if (shoulderRef.current) {
        shoulderRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.8;
      }
      if (elbowRef.current) {
        elbowRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + 1) * 1.2;
      }
      if (wristRef.current) {
        wristRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2.5) * 0.6;
      }
    }
  });

  return (
    <group position={position}>
      {/* Upper arm */}
      <group ref={shoulderRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.6, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Forearm */}
        <group position={[0.3, 0, 0]} ref={elbowRef}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.08, 0.5, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial
              color="#1a1a2e"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>

          {/* Hand/Gripper */}
          <group position={[0.25, 0, 0]} ref={wristRef}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.15, 0.08, 0.15]} />
              <meshStandardMaterial
                color="#00d9ff"
                emissive="#0099ff"
                emissiveIntensity={0.2}
                metalness={0.7}
              />
            </mesh>

            {/* Gripper fingers */}
            {[-0.08, 0.08].map((y, i) => (
              <mesh key={i} position={[0.1, y, 0]} castShadow>
                <boxGeometry args={[0.08, 0.04, 0.05]} />
                <meshStandardMaterial
                  color="#1a1a2e"
                  metalness={0.6}
                  roughness={0.3}
                />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUSPENSION/WEIGHT SHIFT ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

export function SuspensionAnimation({ robotRef, isMoving = false }) {
  useFrame((state, delta) => {
    if (robotRef?.current && isMoving) {
      robotRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.03;
      robotRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 4) * 0.02;
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE EFFECTS FOR MOVEMENT
// ─────────────────────────────────────────────────────────────────────────────

export function DustParticles({ position, isMoving = false, count = 20 }) {
  const particlesRef = useRef([]);
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current || !isMoving) return;

    const positions = meshRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5 + position[0];
      positions[i * 3 + 1] = Math.random() * 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5 + position[2];
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const positionArray = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positionArray[i * 3] = (Math.random() - 0.5) * 1.5;
    positionArray[i * 3 + 1] = Math.random() * 0.3;
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
  }

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positionArray}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#aa8844" transparent opacity={0.6} />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AMBIENT GLOW EFFECT AROUND ROBOT
// ─────────────────────────────────────────────────────────────────────────────

export function RobotGlowAura({ color = '#00d9ff' }) {
  const auraRef = useRef();

  useFrame((state) => {
    if (auraRef.current) {
      auraRef.current.scale.set(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.15,
        1 + Math.cos(state.clock.elapsedTime * 1.5) * 0.1,
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.15
      );
      auraRef.current.material.opacity = 0.25 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <mesh ref={auraRef}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshBasicMaterial
        color={color}
        emissive={color}
        transparent
        opacity={0.25}
        wireframe
      />
    </mesh>
  );
}
