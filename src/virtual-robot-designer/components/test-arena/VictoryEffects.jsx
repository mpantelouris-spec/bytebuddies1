/**
 * VICTORY & INTRO EFFECTS — Celebration animations, confetti, particles
 */
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI PARTICLE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

export function ConfettiExplosion({ trigger = false, count = 100 }) {
  const meshRef = useRef();
  const particleDataRef = useRef([]);

  useEffect(() => {
    if (!trigger) return;

    // Generate confetti particles
    particleDataRef.current = Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 10,
      y: 8,
      z: (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 3,
      vy: 3 + Math.random() * 4,
      vz: (Math.random() - 0.5) * 3,
      color: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff][Math.floor(Math.random() * 6)],
      life: 4,
    }));
  }, [trigger, count]);

  useFrame((state, delta) => {
    if (!meshRef.current || particleDataRef.current.length === 0) return;

    const positions = new Float32Array(particleDataRef.current.length * 3);
    const colors = new Float32Array(particleDataRef.current.length * 3);

    particleDataRef.current.forEach((p, i) => {
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;
      p.vy -= 9.8 * delta; // gravity
      p.life -= delta;

      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      const colorInt = p.color;
      const r = ((colorInt >> 16) & 255) / 255;
      const g = ((colorInt >> 8) & 255) / 255;
      const b = (colorInt & 255) / 255;

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    });

    meshRef.current.geometry.attributes.position.array = positions;
    meshRef.current.geometry.attributes.color.array = colors;
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.attributes.color.needsUpdate = true;
  });

  if (particleDataRef.current.length === 0) return null;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={new Float32Array(count * 3)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={new Float32Array(count * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        transparent
        vertexColors
        sizeAttenuation
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIREWORKS EFFECT
// ─────────────────────────────────────────────────────────────────────────────

export function FireworksExplosion({ position = [0, 5, 0], trigger = false }) {
  const groupRef = useRef();
  const [explosions, setExplosions] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newExplosions = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      startTime: i * 0.2,
      color: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff][i % 5],
      particles: Array.from({ length: 40 }).map(() => ({
        angle: Math.random() * Math.PI * 2,
        elevation: Math.random() * Math.PI / 2,
        speed: 8 + Math.random() * 6,
        life: 2,
      })),
    }));

    setExplosions(newExplosions);

    // Clear after duration
    const timeout = setTimeout(() => setExplosions([]), 3000);
    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <group ref={groupRef} position={position}>
      {explosions.map((explosion) => (
        <FireworkBurst
          key={explosion.id}
          explosion={explosion}
        />
      ))}
    </group>
  );
}

function FireworkBurst({ explosion }) {
  const particlesRef = useRef([]);
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const elapsed = state.clock.elapsedTime - explosion.startTime;
    if (elapsed < 0 || elapsed > 2.5) return;

    const positions = new Float32Array(explosion.particles.length * 3);
    const colors = new Float32Array(explosion.particles.length * 3);

    explosion.particles.forEach((p, i) => {
      const t = elapsed / 2.5;
      const x = Math.cos(p.angle) * Math.cos(p.elevation) * p.speed * t;
      const y = Math.sin(p.elevation) * p.speed * t - 4.9 * t * t;
      const z = Math.sin(p.angle) * Math.cos(p.elevation) * p.speed * t;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const color = explosion.color;
      const r = ((color >> 16) & 255) / 255;
      const g = ((color >> 8) & 255) / 255;
      const b = (color & 255) / 255;
      const alpha = 1 - t;

      colors[i * 3] = r * alpha;
      colors[i * 3 + 1] = g * alpha;
      colors[i * 3 + 2] = b * alpha;
    });

    meshRef.current.geometry.attributes.position.array = positions;
    meshRef.current.geometry.attributes.color.array = colors;
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={explosion.particles.length}
          array={new Float32Array(explosion.particles.length * 3)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={explosion.particles.length}
          array={new Float32Array(explosion.particles.length * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        transparent
        vertexColors
        sizeAttenuation
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAR BURST EFFECT
// ─────────────────────────────────────────────────────────────────────────────

export function StarBurst({ position = [0, 2, 0], trigger = false }) {
  const ref = useRef();
  const scaleRef = useRef(0);

  useEffect(() => {
    if (trigger) scaleRef.current = 1;
  }, [trigger]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    if (scaleRef.current > 0) {
      scaleRef.current -= delta * 2;
      ref.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
      ref.current.material.opacity = scaleRef.current * 0.8;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={0}>
      <octahedronGeometry args={[0.8, 1]} />
      <meshBasicMaterial
        color="#ffff00"
        emissive="#ffff00"
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING TEXT EFFECT (using Canvas texture)
// ─────────────────────────────────────────────────────────────────────────────

export function FloatingVictoryText({ text = '+100 XP', trigger = false }) {
  const ref = useRef();

  useFrame((state, delta) => {
    if (!ref.current) return;

    ref.current.position.y += delta * 2;
    ref.current.material.opacity -= delta * 0.5;
  });

  if (!trigger) return null;

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <planeGeometry args={[2, 1]} />
      <meshBasicMaterial
        color="#ffff00"
        emissive="#ffff00"
        transparent
        opacity={1}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROBOT CELEBRATION ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

export function RobotCelebration({ robotRef, active = false }) {
  const celebrationPhase = useRef(0);

  useFrame((state, delta) => {
    if (!robotRef?.current || !active) return;

    celebrationPhase.current += delta;

    // Jump, spin, and dance
    if (celebrationPhase.current < 1) {
      // Jump
      robotRef.current.position.y += Math.sin(celebrationPhase.current * Math.PI) * 0.5 * delta;
    } else if (celebrationPhase.current < 3) {
      // Spin
      robotRef.current.rotation.z += delta * Math.PI;
    } else {
      // Dance side to side
      robotRef.current.rotation.z = Math.sin(celebrationPhase.current * 3) * 0.2;
    }

    // Reset after full sequence
    if (celebrationPhase.current > 4) {
      celebrationPhase.current = 0;
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTRO COUNTDOWN
// ─────────────────────────────────────────────────────────────────────────────

export function IntroCountdown({ active = false, onComplete }) {
  const [countdownValue, setCountdownValue] = useState(3);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!active) return;

    timeRef.current += delta;

    if (timeRef.current > 1 && countdownValue > 0) {
      setCountdownValue(countdownValue - 1);
      timeRef.current = 0;
    }

    if (countdownValue === 0 && timeRef.current > 0.5) {
      onComplete?.();
    }
  });

  if (!active) return null;

  return (
    <group position={[0, 1, -5]}>
      {countdownValue > 0 && (
        <mesh>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial
            color={countdownValue === 1 ? '#ff0000' : countdownValue === 2 ? '#ffff00' : '#00ff00'}
            emissive={countdownValue === 1 ? '#ff0000' : countdownValue === 2 ? '#ffff00' : '#00ff00'}
          />
        </mesh>
      )}
      {countdownValue === 0 && (
        <mesh scale={[3, 3, 3]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#00ff00"
            emissive="#00ff00"
          />
        </mesh>
      )}
    </group>
  );
}
