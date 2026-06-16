import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  getObstaclesForArena,
  setDynamicObstacles,
  robotPosTracker,
} from '../../services/robot-runtime.js';
import { getCourseMeta } from '../../data/test-arena-courses.js';
import TestArenaFacility from './TestArenaFacility.jsx';

/* ── Shared helpers ──────────────────────────────────────────────────── */

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

function AnimatedBeacons() {
  const refs = useRef([]);
  const positions = useMemo(
    () => [[-5.5, 0.8, -5.5], [5.5, 0.8, -5.5], [-5.5, 0.8, 5.5], [5.5, 0.8, 5.5]],
    [],
  );
  useFrame((state) => {
    refs.current.forEach((m, i) => {
      if (m) m.position.y = 0.75 + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.12;
    });
  });
  return positions.map((pos, i) => (
    <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={pos}>
      <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
      <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.6} />
    </mesh>
  ));
}

/* ── Static-obstacle sub-components (existing) ───────────────────────── */

function SkyRing({ o, index }) {
  return (
    <group position={[o.x, o.y || 1.2, o.z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[o.r || 0.35, 0.06, 12, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.55} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function HoverPlatform({ o }) {
  return (
    <group position={[o.x, 0.35, o.z]}>
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
  if (o.type === 'platform') return <HoverPlatform o={o} />;
  if (o.r) {
    return (
      <group position={[o.x, 0.55, o.z]}>
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
      <mesh position={[o.x, 0.55, o.z]} castShadow receiveShadow>
        <boxGeometry args={[o.w, 1.1, o.h]} />
        <meshStandardMaterial color="#b8c5d6" emissive="#7eb8ff" emissiveIntensity={0.08} metalness={0.25} roughness={0.55} />
      </mesh>
    );
  }
  if (o.type === 'ramp') {
    return (
      <mesh position={[o.x, 0.35, o.z]} castShadow receiveShadow>
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
  const spots = [[2.5, -2], [-2, 2.5], [3, 2], [-3, -1.5]];
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

function TargetMarker({ position, color = '#ec4899' }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 1.4;
    ref.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
  });
  return (
    <group position={position}>
      <mesh ref={ref} position={[0, 0.65, 0]}>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} metalness={0.55} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.58, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.64, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function CheckpointPortal({ position, color = '#14b8a6', index = 0 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.6 + index * 0.8;
    ref.current.material.emissiveIntensity = 0.55 + Math.sin(state.clock.elapsedTime * 2.5 + index) * 0.2;
  });
  return (
    <group position={position}>
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.08, 12, 40]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.4} roughness={0.2} />
      </mesh>
      <PulseRing position={[0, 0.04, 0]} color={color} scale={0.9} />
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.72, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0.68, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
        <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function SpeedBoostStrip({ z, width = 10 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.25 + Math.sin(state.clock.elapsedTime * 4 + z) * 0.15;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, z]} receiveShadow>
      <planeGeometry args={[width, 0.35]} />
      <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} transparent opacity={0.7} />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DODGE COURSES
══════════════════════════════════════════════════════════════════════ */

/** DODGE EASY — 3 large balls rolling in predictable horizontal sweeps */
function DodgeRollingBalls({ arenaId }) {
  const configs = [
    { cx: 0, cz: -3.5, ax: 5.5, speed: 0.75, r: 0.7, color: '#ef4444', phase: 0 },
    { cx: 0, cz:  0.5, ax: 4.8, speed: 1.05, r: 0.65, color: '#3b82f6', phase: 2.1 },
    { cx: 0, cz:  4,   ax: 4.2, speed: 0.60, r: 0.75, color: '#eab308', phase: 4.2 },
  ];
  const meshRefs = useRef(configs.map(() => null));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const dynObs = configs.map((cfg, i) => {
      const x = cfg.cx + Math.sin(t * cfg.speed + cfg.phase) * cfg.ax;
      const z = cfg.cz;
      const mesh = meshRefs.current[i];
      if (mesh) {
        mesh.position.set(x, cfg.r, z);
        mesh.rotation.z = t * cfg.speed * 2.5;
      }
      return { x, z, r: cfg.r + 0.12 };
    });
    setDynamicObstacles(arenaId, dynObs);
  });

  return (
    <>
      {/* Lane lines */}
      {configs.map((cfg, i) => (
        <mesh key={`lane-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, cfg.cz]}>
          <planeGeometry args={[12, 0.12]} />
          <meshStandardMaterial color={cfg.color} transparent opacity={0.2} />
        </mesh>
      ))}
      {/* Balls */}
      {configs.map((cfg, i) => (
        <group key={i}>
          <mesh ref={(el) => { meshRefs.current[i] = el; }} castShadow>
            <sphereGeometry args={[cfg.r, 22, 22]} />
            <meshStandardMaterial
              color={cfg.color} emissive={cfg.color} emissiveIntensity={0.2}
              roughness={0.45} metalness={0.35}
            />
          </mesh>
        </group>
      ))}
      {/* Finish line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -7]}>
        <planeGeometry args={[12, 0.5]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 1, -7]}>
        <boxGeometry args={[12, 0.12, 0.08]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>
    </>
  );
}

/** DODGE MEDIUM — 6 spinning laser barriers */
function SpinningLaserBarrier({ cx, cz, speed, color, phase = 0 }) {
  const armRef = useRef();
  const tipRef = useRef();
  const armLen = 3.5;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const angle = t * speed + phase;
    if (armRef.current) armRef.current.rotation.y = angle;
    // tip glow pulse
    if (tipRef.current) {
      tipRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 8) * 0.4;
    }
  });

  return (
    <group position={[cx, 0.9, cz]}>
      {/* Post */}
      <mesh castShadow>
        <cylinderGeometry args={[0.11, 0.14, 1.8, 10]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Spinning arm */}
      <group ref={armRef}>
        <mesh position={[armLen / 2, 0, 0]}>
          <boxGeometry args={[armLen, 0.07, 0.07]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} transparent opacity={0.92} />
        </mesh>
        {/* Tip sphere */}
        <mesh ref={tipRef} position={[armLen, 0, 0]}>
          <sphereGeometry args={[0.14, 14, 14]} />
          <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={1.0} />
        </mesh>
      </group>
      {/* Danger ring on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.88, 0]}>
        <ringGeometry args={[armLen - 0.3, armLen + 0.1, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function DodgeLaserMaze({ arenaId }) {
  const barriers = [
    { cx: -4.5, cz: -2.5, speed:  1.1, color: '#22d3ee', phase: 0 },
    { cx: -4.5, cz:  2.5, speed: -0.9, color: '#22d3ee', phase: 1.8 },
    { cx:  0,   cz: -4.5, speed:  1.4, color: '#06b6d4', phase: 0.9 },
    { cx:  0,   cz:  4.5, speed: -1.2, color: '#06b6d4', phase: 2.7 },
    { cx:  4.5, cz: -2.5, speed:  0.8, color: '#22d3ee', phase: 3.6 },
    { cx:  4.5, cz:  2.5, speed: -1.5, color: '#22d3ee', phase: 1.2 },
  ];

  const phasedRefs = useRef(barriers.map(() => ({ angle: 0 })));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const armLen = 3.5;
    const dynObs = barriers.map((b, i) => {
      const angle = t * b.speed + b.phase;
      phasedRefs.current[i].angle = angle;
      // Tip of the laser beam is the most dangerous point
      const tipX = b.cx + Math.cos(angle) * armLen;
      const tipZ = b.cz + Math.sin(angle) * armLen;
      // Also register mid-arm
      return [
        { x: tipX, z: tipZ, r: 0.25 },
        { x: b.cx + Math.cos(angle) * (armLen * 0.5), z: b.cz + Math.sin(angle) * (armLen * 0.5), r: 0.2 },
      ];
    }).flat();
    setDynamicObstacles(arenaId, dynObs);
  });

  return (
    <>
      {/* Dark industrial floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      {/* Safe start/end zones */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 6.5]}>
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.35} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -6.5]}>
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.35} transparent opacity={0.5} />
      </mesh>
      {barriers.map((b, i) => (
        <SpinningLaserBarrier key={i} {...b} />
      ))}
    </>
  );
}

/** DODGE HARD — Asteroid field with 18 rocks flying in random directions */
function AsteroidField({ arenaId }) {
  const COUNT = 18;
  const BOUND = 9;
  const asteroids = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: (Math.random() - 0.5) * 16,
        z: (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 2.8,
        vz: (Math.random() - 0.5) * 2.8,
        r: 0.28 + Math.random() * 0.52,
        color: `hsl(${18 + Math.random() * 22}, ${15 + Math.random() * 15}%, ${30 + Math.random() * 25}%)`,
        rxSpeed: (Math.random() - 0.5) * 0.8,
        rzSpeed: (Math.random() - 0.5) * 0.7,
      })),
    [],
  );

  const posState = useRef(asteroids.map((a) => ({ x: a.x, z: a.z, vx: a.vx, vz: a.vz })));
  const meshRefs = useRef(asteroids.map(() => null));

  useFrame((_, dt) => {
    const dyn = posState.current.map((p, i) => {
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      if (Math.abs(p.x) > BOUND) { p.vx *= -1; p.x = Math.sign(p.x) * BOUND; }
      if (Math.abs(p.z) > BOUND) { p.vz *= -1; p.z = Math.sign(p.z) * BOUND; }
      const m = meshRefs.current[i];
      if (m) {
        m.position.set(p.x, asteroids[i].r * 0.55, p.z);
        m.rotation.x += dt * asteroids[i].rxSpeed;
        m.rotation.z += dt * asteroids[i].rzSpeed;
      }
      return { x: p.x, z: p.z, r: asteroids[i].r + 0.1 };
    });
    setDynamicObstacles(arenaId, dyn);
  });

  return (
    <>
      {/* Space-dark floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#0a0a1a" roughness={1} />
      </mesh>
      {/* Star field decoration discs */}
      {Array.from({ length: 40 }, (_, i) => {
        const px = (Math.random() - 0.5) * 22;
        const pz = (Math.random() - 0.5) * 22;
        return (
          <mesh key={`star-${i}`} position={[px, 0.008, pz]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4 + Math.random() * 0.5} />
          </mesh>
        );
      })}
      {/* Asteroids */}
      {asteroids.map((a, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} castShadow>
          <dodecahedronGeometry args={[a.r, 0]} />
          <meshStandardMaterial color={a.color} roughness={0.88} metalness={0.12} />
        </mesh>
      ))}
      {/* Finish beacon */}
      <group position={[0, 0, -8.5]}>
        <PulseRing position={[0, 0.03, 0]} color="#22c55e" scale={2} />
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.6, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.9} />
        </mesh>
      </group>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ESCAPE COURSES
══════════════════════════════════════════════════════════════════════ */

/** ESCAPE EASY — A massive stone wall advancing down a corridor */
function CrushingWall({ arenaId }) {
  const wallRef = useRef();
  const wallZ = useRef(9.5); // starts behind robot

  useFrame((_, dt) => {
    wallZ.current -= dt * 1.9;
    if (wallZ.current < -11) wallZ.current = 10; // reset
    if (wallRef.current) wallRef.current.position.z = wallZ.current;
    setDynamicObstacles(arenaId, [
      { x: 0, z: wallZ.current, w: 22, h: 1.2, type: 'wall' },
    ]);
  });

  return (
    <>
      {/* Corridor side walls */}
      {[[-2.8, '#5a4a3a'], [2.8, '#5a4a3a']].map(([z, col], i) => (
        <mesh key={i} position={[0, 1.2, z]} receiveShadow>
          <boxGeometry args={[22, 2.4, 0.35]} />
          <meshStandardMaterial color={col} roughness={0.9} />
        </mesh>
      ))}
      {/* Door / safe zone */}
      <group position={[0, 0, -9]}>
        <PulseRing position={[0, 0.04, 0]} color="#22c55e" scale={3} />
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[5.5, 3, 0.3]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} transparent opacity={0.5} />
        </mesh>
      </group>
      {/* Dust strips on floor */}
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={`dust-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
          <planeGeometry args={[0.12, 20]} />
          <meshBasicMaterial color="#b45309" transparent opacity={0.3} />
        </mesh>
      ))}
      {/* The crushing wall */}
      <mesh ref={wallRef} castShadow>
        <boxGeometry args={[6, 4.5, 0.7]} />
        <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.35} roughness={0.5} metalness={0.5} />
      </mesh>
    </>
  );
}

/** ESCAPE MEDIUM — 3 pursuing spheres that track the robot */
function HunterPursuers({ arenaId }) {
  const configs = [
    { startX: -8, startZ: -8, speed: 1.3, color: '#ef4444' },
    { startX:  8, startZ: -8, speed: 1.5, color: '#8b5cf6' },
    { startX:  0, startZ: -9, speed: 1.1, color: '#3b82f6' },
  ];
  const posRef = useRef(configs.map((c) => ({ x: c.startX, z: c.startZ })));
  const meshRefs = useRef(configs.map(() => null));
  const auraRefs = useRef(configs.map(() => null));

  useFrame((state, dt) => {
    const robot = robotPosTracker;
    const t = state.clock.elapsedTime;
    const dyn = posRef.current.map((p, i) => {
      const dx = robot.x - p.x;
      const dz = robot.z - p.z;
      const dist = Math.hypot(dx, dz) || 1;
      p.x += (dx / dist) * configs[i].speed * dt;
      p.z += (dz / dist) * configs[i].speed * dt;
      const hoverY = 0.52 + Math.sin(t * 2.5 + i * 1.5) * 0.08;
      if (meshRefs.current[i]) meshRefs.current[i].position.set(p.x, hoverY, p.z);
      if (auraRefs.current[i]) {
        auraRefs.current[i].position.set(p.x, 0.04, p.z);
        auraRefs.current[i].material.opacity = 0.2 + Math.sin(t * 4 + i) * 0.08;
      }
      return { x: p.x, z: p.z, r: 0.52 };
    });
    setDynamicObstacles(arenaId, dyn);
  });

  return (
    <>
      {/* Forest clearing floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#d4edda" roughness={0.95} />
      </mesh>
      {/* Safe zones */}
      {[[-6, -6], [6, 6], [-6, 6], [6, -6]].map(([x, z], i) => (
        <group key={`safe-${i}`} position={[x, 0, z]}>
          <PulseRing position={[0, 0.04, 0]} color="#22c55e" scale={1.6} />
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.1, 32]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.25} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
      {/* Finish zone */}
      <group position={[0, 0, 8]}>
        <PulseRing position={[0, 0.04, 0]} color="#f59e0b" scale={2.2} />
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 32]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.35} transparent opacity={0.45} />
        </mesh>
      </group>
      {/* Pursuers */}
      {configs.map((cfg, i) => (
        <group key={i}>
          <mesh ref={(el) => { meshRefs.current[i] = el; }} castShadow>
            <sphereGeometry args={[0.46, 18, 18]} />
            <meshStandardMaterial
              color={cfg.color} emissive={cfg.color} emissiveIntensity={0.35}
              roughness={0.3} metalness={0.5}
            />
          </mesh>
          {/* Aura ring on ground (separate mesh, needs its own position) */}
          <mesh
            ref={(el) => { auraRefs.current[i] = el; }}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.5, 0.85, 32]} />
            <meshBasicMaterial color={cfg.color} transparent opacity={0.25} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** ESCAPE HARD — Swarm of 10 coordinating attack drones */
function SwarmDrones({ arenaId }) {
  const COUNT = 10;
  const dronePositions = useRef(
    Array.from({ length: COUNT }, (_, i) => ({
      x: Math.cos((i / COUNT) * Math.PI * 2) * 9,
      z: Math.sin((i / COUNT) * Math.PI * 2) * 9,
    })),
  );
  const meshRefs = useRef(Array(COUNT).fill(null));

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const robot = robotPosTracker;
    const dyn = dronePositions.current.map((p, i) => {
      const dx = robot.x - p.x;
      const dz = robot.z - p.z;
      const dist = Math.hypot(dx, dz) || 1;
      // Seek + orbit blend — gets more aggressive over time
      const aggression = Math.min(1.5 + t * 0.04, 2.5);
      const seekX = (dx / dist) * aggression;
      const seekZ = (dz / dist) * aggression;
      const orbitX = (-dz / dist) * 0.6;
      const orbitZ = (dx / dist) * 0.6;
      p.x += (seekX + orbitX) * dt;
      p.z += (seekZ + orbitZ) * dt;
      const height = 1.0 + Math.sin(t * 3.5 + i * 0.9) * 0.25;
      const faceAngle = Math.atan2(dx, dz);
      if (meshRefs.current[i]) {
        meshRefs.current[i].position.set(p.x, height, p.z);
        meshRefs.current[i].rotation.y = faceAngle;
      }
      return { x: p.x, z: p.z, r: 0.42 };
    });
    setDynamicObstacles(arenaId, dyn);
  });

  return (
    <>
      {/* Sci-fi landscape floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.85} />
      </mesh>
      {/* Buildings for cover (match ARENA_OBSTACLES escape_hard) */}
      {[[-5, -5], [5, -5], [-5, 5], [5, 5], [0, 0]].map(([x, z], i) => {
        const h = i === 4 ? 2.8 : 2.2;
        return (
          <mesh key={`bld-${i}`} position={[x, h / 2, z]} castShadow>
            <boxGeometry args={[1.8, h, 1.8]} />
            <meshStandardMaterial color="#312e81" emissive="#4338ca" emissiveIntensity={0.12} metalness={0.4} roughness={0.55} />
          </mesh>
        );
      })}
      {/* Finish bunker */}
      <group position={[8.5, 0, 8.5]}>
        <PulseRing position={[0, 0.05, 0]} color="#22c55e" scale={2.5} />
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[2, 1.6, 2]} />
          <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 1.4, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
        </mesh>
      </group>
      {/* Drones */}
      {Array.from({ length: COUNT }, (_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }}>
          <boxGeometry args={[0.55, 0.12, 0.55]} />
          <meshStandardMaterial
            color="#dc2626" emissive="#ef4444" emissiveIntensity={0.45}
            metalness={0.6} roughness={0.25}
          />
        </mesh>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   COLLECTION COURSES
══════════════════════════════════════════════════════════════════════ */

function CollectItem({ position, color, shape = 'cube', size = 0.44 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 1.1;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.06;
    ref.current.material.emissiveIntensity = 0.45 + Math.sin(state.clock.elapsedTime * 3 + position[2]) * 0.2;
  });
  const geo = shape === 'fragile'
    ? <octahedronGeometry args={[size]} />
    : shape === 'heavy'
      ? <boxGeometry args={[size * 1.2, size * 1.2, size * 1.2]} />
      : <boxGeometry args={[size, size, size]} />;
  return (
    <group position={position}>
      <mesh ref={ref} castShadow>
        {geo}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -position[1] + 0.015, 0]}>
        <ringGeometry args={[size * 0.9, size * 1.4, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function DeliveryZone({ position, color = '#22c55e', size = 1.2 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.28 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  return (
    <group position={position}>
      <PulseRing position={[0, 0.04, 0]} color={color} scale={size} />
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[size * 0.85, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function CollectEasyCourse() {
  const items = [
    { position: [3.5, 0.38, -3], color: '#ef4444', shape: 'cube' },
    { position: [-3.5, 0.38, 1.5], color: '#3b82f6', shape: 'cube' },
    { position: [1.5, 0.38, 4.5], color: '#22c55e', shape: 'cube' },
  ];
  return (
    <>
      {/* Bright clean arena floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      {items.map((item, i) => (
        <CollectItem key={i} {...item} />
      ))}
      <DeliveryZone position={[0, 0, -5.5]} color="#22c55e" size={1.4} />
    </>
  );
}

function CollectMediumCourse() {
  const items = [
    { position: [5, 0.42, -5], color: '#a855f7', shape: 'fragile' },
    { position: [-5, 0.42, -3], color: '#f97316', shape: 'heavy', size: 0.5 },
    { position: [3, 0.38, 4], color: '#3b82f6', shape: 'cube' },
    { position: [-3, 0.42, 5], color: '#a855f7', shape: 'fragile' },
    { position: [6, 0.42, 2], color: '#f97316', shape: 'heavy', size: 0.5 },
  ];
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e8ecf2" roughness={0.65} />
      </mesh>
      {/* Mid walls matching ARENA_OBSTACLES */}
      {[[0, 0.55, -2.5, 5.5, 1.1, 0.25], [0, 0.55, 2.5, 5.5, 1.1, 0.25]].map(([x, y, z, w, ht, d], i) => (
        <mesh key={`wall-${i}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[w, ht, d]} />
          <meshStandardMaterial color="#cbd5e1" emissive="#94a3b8" emissiveIntensity={0.06} />
        </mesh>
      ))}
      {items.map((item, i) => <CollectItem key={i} {...item} />)}
      <DeliveryZone position={[-6, 0, 0]} color="#14b8a6" size={1.2} />
      <DeliveryZone position={[0, 0, -6]} color="#ec4899" size={1.2} />
    </>
  );
}

function CollectHardCourse() {
  const items = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const r = 3 + (i % 3) * 1.5;
    const shapes = ['cube', 'fragile', 'heavy'];
    const colors = ['#3b82f6', '#a855f7', '#f97316', '#22c55e', '#ef4444'];
    return {
      position: [Math.cos(angle) * r, 0.4, Math.sin(angle) * r],
      color: colors[i % colors.length],
      shape: shapes[i % shapes.length],
    };
  });
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>
      {/* Passage walls matching ARENA_OBSTACLES */}
      {[
        [-2.5, 0.6, -1, 0.25, 1.2, 4.5],
        [ 2.5, 0.6,  1, 0.25, 1.2, 4.5],
        [ 0,   0.6, -4, 5,   1.2, 0.25],
        [ 0,   0.6,  4, 5,   1.2, 0.25],
      ].map(([x, y, z, w, ht, d], i) => (
        <mesh key={`pw-${i}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[w, ht, d]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}
      {items.map((item, i) => <CollectItem key={i} {...item} />)}
      <DeliveryZone position={[0, 0, 0]} color="#22c55e" size={1.8} />
      <DeliveryZone position={[-6, 0, 6]} color="#14b8a6" size={1.2} />
      <DeliveryZone position={[6, 0, -6]} color="#ec4899" size={1.2} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FLIGHT COURSES  (rings floating at various heights)
══════════════════════════════════════════════════════════════════════ */

function FlightRingGate({ position, radius = 0.85, color = '#f59e0b', index = 0 }) {
  const torusRef = useRef();
  const glowRef = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (torusRef.current) {
      torusRef.current.rotation.z = t * 0.55 + index * 1.1;
      torusRef.current.material.emissiveIntensity = 0.55 + Math.sin(t * 2.2 + index) * 0.25;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + Math.sin(t * 1.8 + index * 0.7) * 0.06;
    }
  });
  const [px, py, pz] = position;
  return (
    <group position={[px, py, pz]}>
      {/* Main ring */}
      <mesh ref={torusRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 2.2, 0.13, 14, 52]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.45} roughness={0.18} />
      </mesh>
      {/* Inner glow disc */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 2.2, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Number badge */}
      <mesh position={[radius * 2.2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {/* Vertical support down to ground */}
      <mesh position={[0, -py / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, py, 6]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.5} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function FlightEasyCourse({ obstacles, courseColor }) {
  const rings = obstacles.filter((o) => o.type === 'ring');
  return (
    <>
      {/* Sky-gradient floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#bfdbfe" roughness={0.6} />
      </mesh>
      {/* Fluffy cloud shapes on floor */}
      {[[-5, -3], [4, 2], [-2, 5]].map(([x, z], i) => (
        <mesh key={`cloud-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
          <circleGeometry args={[1.2 + i * 0.4, 24]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.5} />
        </mesh>
      ))}
      {rings.map((o, i) => (
        <FlightRingGate
          key={i} position={[o.x, o.y || 2.2, o.z]}
          radius={o.r || 0.85} color="#f59e0b" index={i}
        />
      ))}
    </>
  );
}

function FlightMediumCourse({ obstacles, courseColor }) {
  const rings = obstacles.filter((o) => o.type === 'ring');
  const hazards = obstacles.filter((o) => o.r && o.type !== 'ring');
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#ccfbf1" roughness={0.65} />
      </mesh>
      {/* Mountain ridges on floor */}
      {[[-6, 3], [5, -4], [0, 7]].map(([x, z], i) => (
        <mesh key={`mtn-${i}`} position={[x, 0.8, z]} castShadow>
          <coneGeometry args={[1.8 - i * 0.2, 1.6, 6]} />
          <meshStandardMaterial color="#6b7280" roughness={0.9} />
        </mesh>
      ))}
      {rings.map((o, i) => (
        <FlightRingGate
          key={i} position={[o.x, o.y || 3, o.z]}
          radius={o.r || 0.62} color="#06b6d4" index={i}
        />
      ))}
      {/* Aerial hazard cylinders */}
      {hazards.map((o, i) => (
        <group key={`haz-${i}`} position={[o.x, 2.5, o.z]}>
          <mesh castShadow>
            <cylinderGeometry args={[o.r, o.r * 1.1, 4, 14]} />
            <meshStandardMaterial color="#b45309" emissive="#f97316" emissiveIntensity={0.18} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function FlightHardCourse({ obstacles }) {
  const rings = obstacles.filter((o) => o.type === 'ring');
  const hazards = obstacles.filter((o) => o.r && o.type !== 'ring');
  return (
    <>
      {/* Space backdrop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0f0c29" roughness={1} />
      </mesh>
      {/* Nebula smears */}
      {[[-7, -5], [6, 4], [0, -8]].map(([x, z], i) => (
        <mesh key={`neb-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
          <circleGeometry args={[3 + i * 0.8, 28]} />
          <meshBasicMaterial
            color={['#4f46e5', '#7c3aed', '#6366f1'][i]}
            transparent opacity={0.15}
          />
        </mesh>
      ))}
      {rings.map((o, i) => (
        <FlightRingGate
          key={i} position={[o.x, o.y || 4, o.z]}
          radius={o.r || 0.5} color="#818cf8" index={i}
        />
      ))}
      {/* Hazard columns */}
      {hazards.map((o, i) => (
        <group key={`haz-${i}`} position={[o.x, 3, o.z]}>
          <mesh castShadow>
            <cylinderGeometry args={[o.r, o.r, 6, 12]} />
            <meshStandardMaterial color="#7c3aed" emissive="#a855f7" emissiveIntensity={0.25} roughness={0.45} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EXPLORER SPIDER — JUNGLE TEMPLE ESCAPE
══════════════════════════════════════════════════════════════════════ */

function TorchFlame({ position }) {
  const flameRef = useRef();
  useFrame((state) => {
    if (!flameRef.current) return;
    const t = state.clock.elapsedTime;
    flameRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 6.3 + position[0]) * 0.4;
    flameRef.current.scale.y = 1 + Math.sin(t * 8 + position[2]) * 0.18;
  });
  return (
    <group position={position}>
      {/* torch shaft */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.7, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* bowl */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.04, 0.12, 12]} />
        <meshStandardMaterial color="#6b4c2a" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* flame */}
      <mesh ref={flameRef} position={[0, 0.14, 0]}>
        <coneGeometry args={[0.08, 0.28, 10]} />
        <meshStandardMaterial color="#ff6b00" emissive="#ff3300" emissiveIntensity={1.0} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function TempleArtifact({ position, color = '#ffd700' }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 1.8;
    ref.current.position.y = position[1] + 0.7 + Math.sin(state.clock.elapsedTime * 2.2) * 0.06;
  });
  return (
    <group position={position}>
      {/* glow ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.18, 0.32, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      {/* floating gem */}
      <mesh ref={ref} position={[0, 0.7, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} metalness={0.7} roughness={0.15} />
      </mesh>
    </group>
  );
}

function TempleVine({ x, z, height = 3, scale = 1 }) {
  return (
    <group position={[x, 0, z]}>
      {[0, 0.8, 1.6, 2.4].map((y, i) => (
        <mesh key={i} position={[Math.sin(i * 1.3) * 0.08 * scale, y, Math.cos(i * 0.9) * 0.06 * scale]}
          rotation={[0, i * 0.5, Math.sin(i * 0.7) * 0.2]}>
          <cylinderGeometry args={[0.03, 0.05, 0.9, 6]} />
          <meshStandardMaterial color="#2d5a1b" roughness={0.95} />
        </mesh>
      ))}
      {/* leaf clusters */}
      {[0.5, 1.4, 2.2].map((y, i) => (
        <mesh key={`lf-${i}`} position={[Math.sin(i * 2.1) * 0.12, y, 0]}
          rotation={[0.3, i * 1.2, 0]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color="#3a7a22" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function TempleColumn({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      {/* base */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.62, 0.3, 16]} />
        <meshStandardMaterial color="#5a5040" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* shaft */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.50, 2.5, 16]} />
        <meshStandardMaterial color="#6a6050" roughness={0.88} metalness={0.08} />
      </mesh>
      {/* capital */}
      <mesh position={[0, 2.75, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.45, 0.4, 16]} />
        <meshStandardMaterial color="#5a5040" roughness={0.85} />
      </mesh>
      {/* entablature beam */}
      <mesh position={[0, 3.1, 0]}>
        <boxGeometry args={[1.3, 0.25, 1.3]} />
        <meshStandardMaterial color="#504538" roughness={0.9} />
      </mesh>
    </group>
  );
}

function SpiderTempleCourse() {
  const artifactColors = ['#ffd700', '#00ff9a', '#ff6b6b', '#00d9ff', '#c084fc', '#fb923c'];
  const artifactPositions = [
    [-2, 0, -6], [4, 0, -3], [-5, 0, 1], [3, 0, 4], [-1, 0, 7], [6, 0, 0],
  ];

  return (
    <>
      {/* Mossy stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#3a3228" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Stone tile grid pattern */}
      {[...Array(7)].map((_, i) => [...Array(7)].map((_, j) => (
        <mesh key={`tile-${i}-${j}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[(i - 3) * 3.8, 0.005, (j - 3) * 3.8]}>
          <planeGeometry args={[3.6, 3.6]} />
          <meshStandardMaterial
            color={((i + j) % 2 === 0) ? '#3d3228' : '#352b22'}
            roughness={0.92} metalness={0.05}
          />
        </mesh>
      )))}

      {/* Ancient temple pillars */}
      {[[-3.5,-5],[3.5,-5],[-5,-1.5],[5,-1.5],[-5,1.5],[5,1.5],[-3.5,5],[3.5,5]].map(([x,z], i) => (
        <TempleColumn key={i} x={x} z={z} />
      ))}
      {/* Center altar pillar */}
      <TempleColumn x={0} z={0} />

      {/* Temple walls (narrow passage guides) */}
      {[
        [0, -3, 5, 0.3],
        [0,  3, 5, 0.3],
        [-6, 0, 0.3, 12],
        [ 6, 0, 0.3, 12],
      ].map(([x, z, w, h], i) => (
        <mesh key={`tw-${i}`} position={[x, 1.2, z]} castShadow>
          <boxGeometry args={[w, 2.4, h]} />
          <meshStandardMaterial color="#4a3e2e" roughness={0.92} metalness={0.05} />
        </mesh>
      ))}

      {/* Torches along columns */}
      {[[-3.5,-5,1.1],[3.5,-5,1.1],[-5,-1.5,1.1],[5,-1.5,1.1],
        [-5,1.5,1.1],[5,1.5,1.1],[-3.5,5,1.1],[3.5,5,1.1]].map(([x,z,y], i) => (
        <TorchFlame key={`torch-${i}`} position={[x + 0.4, y, z + 0.4]} />
      ))}

      {/* Vines creeping on columns */}
      {[[-3.5,-5],[3.5,-5],[-5,1.5],[5,-1.5]].map(([x,z], i) => (
        <TempleVine key={i} x={x - 0.3} z={z - 0.3} height={3} scale={1} />
      ))}

      {/* Floating collectible artifacts */}
      {artifactPositions.map((pos, i) => (
        <TempleArtifact key={i} position={pos} color={artifactColors[i % artifactColors.length]} />
      ))}

      {/* Fire trap indicators (glowing floor zones) */}
      {[[-2,-3],[2,-1],[0,2],[-3,3]].map(([x,z], i) => (
        <mesh key={`fire-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
          <circleGeometry args={[0.5, 20]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.35} />
        </mesh>
      ))}

      {/* Start zone */}
      <PulseRing position={[0, 0.04, -9]} color="#d97706" scale={1.2} />
      {/* Finish arch */}
      <group position={[0, 0, 9]}>
        <mesh position={[-1.2, 2, 0]}>
          <boxGeometry args={[0.25, 4, 0.25]} />
          <meshStandardMaterial color="#8b6914" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh position={[1.2, 2, 0]}>
          <boxGeometry args={[0.25, 4, 0.25]} />
          <meshStandardMaterial color="#8b6914" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[2.6, 0.3, 0.25]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* Atmospheric dust particles (static, just markers for depth) */}
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const r = 3 + (i % 5) * 1.5;
        return (
          <mesh key={`dust-${i}`} position={[Math.cos(angle) * r, 0.5 + (i % 3) * 0.8, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.025, 4, 4]} />
            <meshBasicMaterial color="#c8a96e" transparent opacity={0.6} />
          </mesh>
        );
      })}

      {/* Warm torchlight ambience */}
      <pointLight position={[-4, 3, -4]} color="#ff8c00" intensity={2.5} distance={10} decay={2} />
      <pointLight position={[ 4, 3, -4]} color="#ff8c00" intensity={2.5} distance={10} decay={2} />
      <pointLight position={[-4, 3,  4]} color="#ff8c00" intensity={2.0} distance={10} decay={2} />
      <pointLight position={[ 4, 3,  4]} color="#ff8c00" intensity={2.0} distance={10} decay={2} />
      <ambientLight color="#2a1a08" intensity={1.5} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EXPLORER SPIDER — WEB GAUNTLET
══════════════════════════════════════════════════════════════════════ */

function WebStrand({ from, to, color = '#7c3aed', thickness = 0.04 }) {
  const dx = to[0] - from[0];
  const dy = (to[1] || 0) - (from[1] || 0);
  const dz = to[2] - from[2];
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const cx = (from[0] + to[0]) / 2;
  const cy = ((from[1] || 0) + (to[1] || 0)) / 2;
  const cz = (from[2] + to[2]) / 2;
  const angle = Math.atan2(dx, dz);
  return (
    <mesh position={[cx, cy, cz]} rotation={[0, angle, 0]}>
      <cylinderGeometry args={[thickness, thickness, len, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} transparent opacity={0.75} />
    </mesh>
  );
}

function WebCrystal({ position, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 1.2;
    ref.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.3;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.42, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, 0.65, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} metalness={0.8} roughness={0.1} />
      </mesh>
      {/* crystal spire top */}
      <mesh position={[0, 1.0, 0]}>
        <coneGeometry args={[0.1, 0.4, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.7} roughness={0.15} />
      </mesh>
    </group>
  );
}

function EnemyCreature({ startPos, speed, phase }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    ref.current.position.x = startPos[0] + Math.sin(t) * 2.5;
    ref.current.position.z = startPos[2] + Math.cos(t * 0.7) * 2.0;
    ref.current.rotation.y = t;
    ref.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
  });
  return (
    <mesh ref={ref} position={startPos} castShadow>
      <icosahedronGeometry args={[0.24, 0]} />
      <meshStandardMaterial color="#ff1493" emissive="#cc0066" emissiveIntensity={0.6} metalness={0.5} roughness={0.2} />
    </mesh>
  );
}

function SpiderWebCourse() {
  const crystalData = [
    { pos: [0, 0, -6], color: '#a855f7' },
    { pos: [-6, 0, 0], color: '#06b6d4' },
    { pos: [6, 0, 0],  color: '#22d3ee' },
    { pos: [0, 0, 6],  color: '#ec4899' },
    { pos: [4, 0, 4],  color: '#34d399' },
  ];

  // Web strand grid
  const webGrid = useMemo(() => {
    const strands = [];
    for (let i = -3; i <= 3; i++) {
      strands.push({ from: [i * 2, 0.02, -8], to: [i * 2, 0.02, 8] });
      strands.push({ from: [-8, 0.02, i * 2], to: [8, 0.02, i * 2] });
    }
    return strands;
  }, []);

  return (
    <>
      {/* Dark space floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#06010f" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Glowing web floor grid */}
      {webGrid.map((s, i) => (
        <WebStrand key={i} from={s.from} to={s.to} color="#4c1d95" thickness={0.022} />
      ))}

      {/* Vertical web wall strands */}
      {[
        { from: [-5, 0, -2], to: [-5, 3, 4] },
        { from: [ 5, 0,  2], to: [ 5, 3, -4] },
        { from: [ 0, 0, -5], to: [4, 3, -5] },
        { from: [ 0, 0,  5], to: [-4, 3, 5] },
      ].map((s, i) => (
        <WebStrand key={`vert-${i}`} from={s.from} to={s.to} color="#7c3aed" thickness={0.055} />
      ))}

      {/* Diagonal ceiling webs */}
      {[
        { from: [-8, 3.5, -8], to: [8, 3.5, 8] },
        { from: [ 8, 3.5, -8], to: [-8, 3.5, 8] },
        { from: [-8, 3.5,  0], to: [8, 3.5, 0] },
        { from: [0, 3.5, -8], to: [0, 3.5, 8] },
      ].map((s, i) => (
        <WebStrand key={`ceil-${i}`} from={s.from} to={s.to} color="#5b21b6" thickness={0.035} />
      ))}

      {/* Collectible crystals */}
      {crystalData.map((c, i) => (
        <WebCrystal key={i} position={c.pos} color={c.color} />
      ))}

      {/* Enemy creatures patrolling */}
      <EnemyCreature startPos={[-3, 0.3, -3]} speed={0.8} phase={0} />
      <EnemyCreature startPos={[ 3, 0.3,  3]} speed={0.6} phase={2.1} />
      <EnemyCreature startPos={[ 0, 0.3, -4]} speed={1.0} phase={1.0} />

      {/* Bioluminescent web nodes */}
      {[[-3,-3],[3,-3],[-3,3],[3,3],[0,-5],[0,5],[-5,0],[5,0]].map(([x,z], i) => (
        <mesh key={`node-${i}`} position={[x, 0.04, z]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color="#7c3aed" emissive="#a855f7" emissiveIntensity={0.9} />
        </mesh>
      ))}

      {/* Boss spider indicator at center back */}
      <group position={[0, 0, 8]}>
        <mesh castShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color="#1e0038" emissive="#7c3aed" emissiveIntensity={0.4} metalness={0.3} roughness={0.4} />
        </mesh>
        {/* 8 spider legs */}
        {[...Array(8)].map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.9, -0.2, Math.sin(a) * 0.9]}
              rotation={[0, a, Math.PI / 4]}>
              <cylinderGeometry args={[0.05, 0.03, 1.4, 6]} />
              <meshStandardMaterial color="#2d0055" emissive="#6d28d9" emissiveIntensity={0.3} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial color="#ff0055" emissive="#ff0044" emissiveIntensity={1.2} />
        </mesh>
        <PulseRing position={[0, 0.04, 0]} color="#7c3aed" scale={1.5} />
      </group>

      {/* Purple atmospheric lights */}
      <pointLight position={[0, 5, 0]} color="#7c3aed" intensity={4} distance={18} decay={2} />
      <pointLight position={[-6, 2, -6]} color="#06b6d4" intensity={2} distance={12} decay={2} />
      <pointLight position={[ 6, 2,  6]} color="#ec4899" intensity={2} distance={12} decay={2} />
      <ambientLight color="#0d0520" intensity={1.2} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EXPLORER SPIDER — DEEP CAVE EXPEDITION
══════════════════════════════════════════════════════════════════════ */

function Stalactite({ position, len = 1.2, radius = 0.18 }) {
  return (
    <group position={position}>
      <mesh position={[0, -len / 2, 0]}>
        <coneGeometry args={[radius, len, 8]} />
        <meshStandardMaterial color="#1a2a28" roughness={0.92} metalness={0.06} />
      </mesh>
    </group>
  );
}

function BioMushroom({ position, color, size = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.25;
  });
  return (
    <group position={position} scale={[size, size, size]}>
      {/* stem */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.6, 8]} />
        <meshStandardMaterial color="#1a3a30" roughness={0.9} />
      </mesh>
      {/* cap */}
      <mesh ref={ref} position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.28, 12, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.9} roughness={0.6} />
      </mesh>
    </group>
  );
}

function CaveWaterPool({ position, size = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <circleGeometry args={[size, 24]} />
      <meshStandardMaterial color="#0e6080" emissive="#0891b2" emissiveIntensity={0.2} transparent opacity={0.55} metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function SpiderCaveCourse() {
  return (
    <>
      {/* Cave floor — dark wet stone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#101c1a" roughness={0.96} metalness={0.08} />
      </mesh>

      {/* Rock formations (stalagmites) */}
      {[
        [-4.5,-4,0.55],[ 4.5,-4,0.55],[-2,-2,0.45],[2,2,0.45],
        [-4.5, 4,0.55],[ 4.5, 4,0.55],[0,-6,0.50],[0,6,0.50],
        [-6,  0,0.50],[ 6,  0,0.50],[-2,5,0.38],[3,-5,0.42],
      ].map(([x, z, r], i) => (
        <group key={`rock-${i}`} position={[x, 0, z]}>
          <mesh castShadow>
            <coneGeometry args={[r, r * 4, 8]} />
            <meshStandardMaterial color="#182820" roughness={0.95} metalness={0.05} />
          </mesh>
        </group>
      ))}

      {/* Stalactites from ceiling */}
      {[[-3,5],[ 3,-5],[ 0, 3],[-5,2],[5,-2],[1,7],[-2,-7],[6,3],[-6,-3]].map(([x,z], i) => (
        <Stalactite key={i} position={[x, 5.5, z]} len={1.0 + (i % 3) * 0.5} radius={0.12 + (i % 4) * 0.05} />
      ))}

      {/* Bioluminescent mushrooms */}
      {[
        { pos: [-3,-1], color: '#00ffaa', size: 0.9 },
        { pos: [ 3, 1], color: '#22d3ee', size: 1.1 },
        { pos: [-1,-4], color: '#a855f7', size: 0.8 },
        { pos: [ 2, 5], color: '#34d399', size: 1.2 },
        { pos: [-5, 3], color: '#60a5fa', size: 0.9 },
        { pos: [ 5,-3], color: '#f0abfc', size: 1.0 },
        { pos: [ 0, 0], color: '#00ffaa', size: 0.7 },
        { pos: [-4,-6], color: '#22d3ee', size: 1.3 },
      ].map((m, i) => (
        <BioMushroom key={i} position={[m.pos[0], 0, m.pos[1]]} color={m.color} size={m.size} />
      ))}

      {/* Underground water pools */}
      <CaveWaterPool position={[-3, 0.01, 2]} size={1.2} />
      <CaveWaterPool position={[ 4, 0.01,-3]} size={0.9} />
      <CaveWaterPool position={[ 0, 0.01, 7]} size={1.5} />

      {/* Cave wall segments */}
      {[
        [-9, 0, 0.3, 20], [ 9, 0, 0.3, 20],
        [0, -9, 20, 0.3], [ 0, 9, 20, 0.3],
      ].map(([x, z, w, h], i) => (
        <mesh key={`cwall-${i}`} position={[x, 2, z]} castShadow>
          <boxGeometry args={[w, 4, h]} />
          <meshStandardMaterial color="#101c1a" roughness={0.97} />
        </mesh>
      ))}

      {/* Crystal deposit cluster at final area */}
      <group position={[0, 0, 8]}>
        {[[0,0],[0.5,0.2],[-0.4,0.15],[0.2,-0.3],[-0.3,-0.2]].map(([x,z], i) => (
          <mesh key={i} position={[x, 0.4 + i * 0.2, z]}>
            <octahedronGeometry args={[0.2 + i * 0.06, 0]} />
            <meshStandardMaterial color="#00ffaa" emissive="#00e590" emissiveIntensity={0.8} metalness={0.7} roughness={0.1} />
          </mesh>
        ))}
        <pointLight position={[0, 1, 0]} color="#00ffaa" intensity={3} distance={8} decay={2} />
        <PulseRing position={[0, 0.02, 0]} color="#00ffaa" scale={1.4} />
      </group>

      {/* Bioluminescent lighting */}
      <pointLight position={[-3, 1, -1]} color="#00ffaa" intensity={2.5} distance={10} decay={2} />
      <pointLight position={[ 3, 1,  1]} color="#22d3ee" intensity={2.5} distance={10} decay={2} />
      <pointLight position={[-1, 1, -4]} color="#a855f7" intensity={2.0} distance={8} decay={2} />
      <pointLight position={[ 2, 1,  5]} color="#34d399" intensity={2.0} distance={8} decay={2} />
      <ambientLight color="#050e0c" intensity={1.0} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   RACER DRONE — SKY RACE CHAMPIONSHIP
══════════════════════════════════════════════════════════════════════ */

function Cloud({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale * 0.6, scale]}>
      {[[0,0,0],[0.8,0.15,0],[-0.7,0.1,0],[0.2,0.3,0],[0.4,-0.1,0.4],[-0.3,0.05,0.35]].map(([x,y,z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.6 + (i % 3) * 0.2, 10, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.88} />
        </mesh>
      ))}
    </group>
  );
}

function RaceRing({ o, index, color = '#f59e0b' }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4 + index * 0.6) * 0.06;
    ref.current.material.emissiveIntensity = 0.7 + Math.sin(state.clock.elapsedTime * 2.5 + index) * 0.3;
  });
  const r = o.r || 1.0;
  const ringColor = [
    '#ffd700', '#ff6b35', '#22d3ee', '#a855f7', '#34d399',
    '#f59e0b', '#60a5fa', '#fb923c', '#c084fc', '#4ade80',
  ][index % 10];

  return (
    <group position={[o.x, o.y || 4, o.z]}>
      {/* outer decorative ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r + 0.15, 0.05, 10, 40]} />
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.3} metalness={0.5} roughness={0.2} transparent opacity={0.5} />
      </mesh>
      {/* main glowing ring */}
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.12, 12, 48]} />
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.8} metalness={0.4} roughness={0.15} />
      </mesh>
      {/* center glow disc */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r * 0.7, 32]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.08} />
      </mesh>
      {/* number badge */}
      <mesh position={[r + 0.3, 0, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#fff" emissive={ringColor} emissiveIntensity={0.6} />
      </mesh>
      {/* support column down to ground */}
      {o.y > 1 && (
        <mesh position={[0, -(o.y - 0.3) / 2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, o.y - 0.3, 6]} />
          <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.2} transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

function DroneSkyCourse({ obstacles }) {
  const rings = obstacles.filter((o) => o.type === 'ring');

  return (
    <>
      {/* Sky platform / airfield */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#87ceeb" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Runway markings */}
      {[-6, -2, 2, 6].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[8, 0.22]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Cloud layers at various heights */}
      <Cloud position={[-8, 5, -5]} scale={2.2} />
      <Cloud position={[ 7, 6, -3]} scale={1.8} />
      <Cloud position={[-5, 7, 4]}  scale={2.5} />
      <Cloud position={[ 6, 5, 7]}  scale={1.6} />
      <Cloud position={[0, 8, -8]}  scale={3.0} />
      <Cloud position={[-9, 4.5, 0]} scale={2.0} />
      <Cloud position={[ 9, 5.5, 2]} scale={1.9} />
      <Cloud position={[3,  9, 5]}   scale={2.3} />

      {/* Race ring gates */}
      {rings.map((o, i) => (
        <RaceRing key={i} o={o} index={i} />
      ))}

      {/* Start/finish portals */}
      <group position={[0, 3.5, -9]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.14, 12, 48]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={1.0} />
        </mesh>
        <PulseRing position={[0, -3.5, 0]} color="#ffd700" scale={1.4} />
      </group>

      {/* Finish arch */}
      <group position={[0, 4, 9]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.4, 0.16, 12, 48]} />
          <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={1.0} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.2, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.1} />
        </mesh>
      </group>

      {/* Sun / directional light atmosphere */}
      <hemisphereLight skyColor="#87ceeb" groundColor="#ddeeff" intensity={1.2} />
      <directionalLight position={[8, 12, -5]} color="#fffde8" intensity={2.5} castShadow />
      <ambientLight color="#b8d8f0" intensity={0.8} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   RACER DRONE — NEON CITY FLIGHT
══════════════════════════════════════════════════════════════════════ */

function NeonSkyscraper({ x, z, height, baseColor, topColor, width = 1.2 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2 + x) * 0.3;
  });
  return (
    <group position={[x, 0, z]}>
      {/* building body */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* neon top glow */}
      <mesh ref={ref} position={[0, height + 0.2, 0]}>
        <boxGeometry args={[width + 0.15, 0.35, width + 0.15]} />
        <meshStandardMaterial color={topColor} emissive={topColor} emissiveIntensity={0.6} transparent opacity={0.9} />
      </mesh>
      {/* neon side stripe */}
      <mesh position={[width / 2 + 0.02, height * 0.5, 0]}>
        <boxGeometry args={[0.05, height * 0.7, 0.1]} />
        <meshStandardMaterial color={topColor} emissive={topColor} emissiveIntensity={0.8} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function NeonRingGate({ o, index }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 3 + index * 0.8) * 0.4;
  });
  const r = o.r || 0.75;
  const colors = ['#ff00ff', '#00ffff', '#ff3366', '#33ff66', '#ffcc00', '#ff6600'];
  const c = colors[index % colors.length];
  return (
    <group position={[o.x, o.y || 5, o.z]}>
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.1, 12, 48]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} metalness={0.3} roughness={0.1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r, 40]} />
        <meshBasicMaterial color={c} transparent opacity={0.07} />
      </mesh>
      <pointLight position={[0, 0, 0]} color={c} intensity={1.5} distance={5} decay={2} />
    </group>
  );
}

function DroneNeonCityCourse({ obstacles }) {
  const rings = obstacles.filter((o) => o.type === 'ring');
  const buildings = obstacles.filter((o) => o.r && !o.type);

  const skyscrapers = [
    { x: -5, z: -5, h: 12, base: '#1a1a2e', top: '#00ffff' },
    { x:  5, z: -5, h: 10, base: '#1a1a2e', top: '#ff00ff' },
    { x: -5, z:  5, h: 14, base: '#1a2e1a', top: '#33ff66' },
    { x:  5, z:  5, h: 11, base: '#2e1a1a', top: '#ff3366' },
    { x:  0, z: -3, h: 8,  base: '#1a1a2e', top: '#ffcc00' },
    { x:  0, z:  3, h: 9,  base: '#2e1a1a', top: '#cc44ff' },
    { x: -3, z:  0, h: 7,  base: '#1a2e1a', top: '#00aaff' },
    { x:  3, z:  0, h: 8,  base: '#1a1a2e', top: '#ff6600' },
    // Extra background buildings
    { x: -8, z: -6, h: 16, base: '#111122', top: '#0066ff', width: 1.8 },
    { x:  8, z: -6, h: 13, base: '#221111', top: '#ff2244', width: 1.5 },
    { x: -8, z:  6, h: 18, base: '#112211', top: '#22ff66', width: 2.0 },
    { x:  8, z:  6, h: 15, base: '#111122', top: '#aa00ff', width: 1.6 },
  ];

  return (
    <>
      {/* Wet dark city floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#050508" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Neon puddle reflections */}
      {[[-3,-2,'#00ffff'],[ 3, 2,'#ff00ff'],[ 0,-4,'#ffcc00'],[-4, 3,'#33ff66'],[4,-3,'#ff3366']].map(([x,z,c], i) => (
        <mesh key={`puddle-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
          <ellipseGeometry args={[0.8 + (i % 3) * 0.4, 0.5 + (i % 2) * 0.3, 16]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.25} transparent opacity={0.35} metalness={0.9} roughness={0.05} />
        </mesh>
      ))}

      {/* Road grid markings */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <mesh key={`road-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, 0]}>
          <planeGeometry args={[0.08, 20]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.08} />
        </mesh>
      ))}

      {/* Skyscrapers */}
      {skyscrapers.map((s, i) => (
        <NeonSkyscraper key={i} x={s.x} z={s.z} height={s.h} baseColor={s.base} topColor={s.top} width={s.width || 1.2} />
      ))}

      {/* Neon holographic ring gates */}
      {rings.map((o, i) => (
        <NeonRingGate key={i} o={o} index={i} />
      ))}

      {/* Flying vehicle light trails */}
      {[[-4, 7, -6], [3, 5, 3], [-2, 8, 4]].map(([x, y, z], i) => (
        <group key={`flyer-${i}`}>
          <mesh position={[x, y, z]}>
            <boxGeometry args={[0.3, 0.1, 0.8]} />
            <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[x - 0.6, y, z]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#ff3300" emissive="#ff2200" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[x + 0.6, y, z]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#00aaff" emissive="#0088ff" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}

      {/* Atmospheric neon lighting */}
      <pointLight position={[-5, 8, -5]} color="#00ffff" intensity={4} distance={20} decay={2} />
      <pointLight position={[ 5, 8, -5]} color="#ff00ff" intensity={4} distance={20} decay={2} />
      <pointLight position={[-5, 8,  5]} color="#33ff66" intensity={3} distance={18} decay={2} />
      <pointLight position={[ 5, 8,  5]} color="#ff3366" intensity={3} distance={18} decay={2} />
      <ambientLight color="#050510" intensity={0.8} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   RACER DRONE — SPACE SLALOM FINALS
══════════════════════════════════════════════════════════════════════ */

function SpaceAsteroid({ x, z, size }) {
  return (
    <mesh position={[x, 0.3, z]} castShadow>
      <dodecahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color="#2a2835" roughness={0.95} metalness={0.2} />
    </mesh>
  );
}

function SpaceSlalomRing({ o, index }) {
  const ref = useRef();
  const tiltAngle = useMemo(() => (Math.random() - 0.5) * 0.6, []);
  const tiltAxis  = useMemo(() => (Math.random() - 0.5) * 0.4, []);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = tiltAngle + Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.04;
    ref.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.35;
  });
  const r = o.r || 0.5;
  const palette = ['#818cf8','#a78bfa','#60a5fa','#34d399','#f472b6','#fb923c','#38bdf8'];
  const c = palette[index % palette.length];
  return (
    <group position={[o.x, o.y || 5, o.z]} rotation={[tiltAxis, 0, 0]}>
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.09, 10, 44]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} metalness={0.3} roughness={0.15} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r, 40]} />
        <meshBasicMaterial color={c} transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function DroneSlalomCourse({ obstacles }) {
  const rings = obstacles.filter((o) => o.type === 'ring');
  const asteroids = obstacles.filter((o) => o.r && !o.type);

  return (
    <>
      {/* Deep space floor — starfield illusion */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#020108" roughness={1} metalness={0} />
      </mesh>

      {/* Star field */}
      {[...Array(80)].map((_, i) => {
        const a = (i / 80) * Math.PI * 2;
        const r = 8 + (i % 6) * 2.5;
        const h = 1 + (i % 10) * 1.0;
        return (
          <mesh key={`star-${i}`} position={[Math.cos(a) * r, h, Math.sin(a) * r]}>
            <sphereGeometry args={[0.04 + (i % 3) * 0.025, 4, 4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6 + (i % 4) * 0.1} />
          </mesh>
        );
      })}

      {/* Nebula cloud clusters */}
      {[[-10, 4, -8], [10, 6, 5], [-8, 7, 8], [12, 3, -3]].map(([x, y, z], i) => {
        const nc = ['#3730a3','#7c3aed','#be185d','#0369a1'][i];
        return (
          <mesh key={`neb-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[2.5 + (i % 3) * 0.8, 8, 6]} />
            <meshStandardMaterial color={nc} emissive={nc} emissiveIntensity={0.15} transparent opacity={0.18} />
          </mesh>
        );
      })}

      {/* Distant planet */}
      <mesh position={[-15, 8, -18]}>
        <sphereGeometry args={[5, 24, 20]} />
        <meshStandardMaterial color="#1e3a4a" roughness={0.8} emissive="#0e3050" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-15, 8, -18]} rotation={[0.3, 0, 0.4]}>
        <torusGeometry args={[7, 0.5, 8, 48]} />
        <meshStandardMaterial color="#3a2a15" emissive="#6b4f20" emissiveIntensity={0.15} transparent opacity={0.7} />
      </mesh>

      {/* Asteroid obstacles */}
      {asteroids.map((o, i) => (
        <SpaceAsteroid key={i} x={o.x} z={o.z} size={o.r * 1.2} />
      ))}
      {/* Extra asteroid field decorations */}
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 10 + (i % 4) * 1.5;
        return (
          <SpaceAsteroid key={`bg-${i}`} x={Math.cos(a) * r} z={Math.sin(a) * r} size={0.25 + (i % 5) * 0.15} />
        );
      })}

      {/* Slalom ring gates */}
      {rings.map((o, i) => (
        <SpaceSlalomRing key={i} o={o} index={i} />
      ))}

      {/* Space station reference */}
      <group position={[0, 3, 10]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.4, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[2.5, 0.15, 8, 32]} />
          <meshStandardMaterial color="#6366f1" emissive="#818cf8" emissiveIntensity={0.4} metalness={0.5} roughness={0.2} />
        </mesh>
        <pointLight position={[0, 0, 0]} color="#818cf8" intensity={3} distance={10} decay={2} />
      </group>

      {/* Wormhole at finish */}
      <group position={[0, 5, 8]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.5 - i * 0.35, 0.08 - i * 0.01, 8, 40]} />
            <meshStandardMaterial
              color={['#818cf8','#a78bfa','#c4b5fd'][i]}
              emissive={['#818cf8','#a78bfa','#c4b5fd'][i]}
              emissiveIntensity={0.9 - i * 0.2}
              transparent opacity={0.8}
            />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.0, 32]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.15} />
        </mesh>
        <pointLight position={[0, 0, 0]} color="#818cf8" intensity={5} distance={12} decay={2} />
      </group>

      {/* Deep space lighting */}
      <pointLight position={[0, 10, 0]} color="#4f46e5" intensity={3} distance={30} decay={2} />
      <pointLight position={[-12, 5, -5]} color="#7c3aed" intensity={2} distance={20} decay={2} />
      <ambientLight color="#020108" intensity={0.6} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HEAVY ROBOT — WAREHOUSE LOGISTICS
══════════════════════════════════════════════════════════════════════ */

function ShelvingUnit({ x, z, height = 3.5, color = '#475569' }) {
  const levels = 3;
  return (
    <group position={[x, 0, z]}>
      {/* side uprights */}
      {[-0.5, 0.5].map((dx, i) => (
        <mesh key={i} position={[dx, height / 2, 0]} castShadow>
          <boxGeometry args={[0.06, height, 0.05]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {/* horizontal shelves */}
      {[...Array(levels)].map((_, i) => (
        <mesh key={`shelf-${i}`} position={[0, (i + 1) * (height / (levels + 1)), 0]} castShadow>
          <boxGeometry args={[1.05, 0.06, 0.6]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
      {/* boxes on shelves */}
      {[...Array(levels)].map((_, i) => (
        <mesh key={`box-${i}`} position={[(i % 2 === 0 ? -0.18 : 0.18), (i + 1) * (height / (levels + 1)) + 0.2, 0]}>
          <boxGeometry args={[0.35, 0.35, 0.4]} />
          <meshStandardMaterial color={['#fbbf24','#60a5fa','#34d399'][i % 3]} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function DeliveryPad({ position, color, label = 'A' }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
  });
  return (
    <group position={position}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.6} />
      </mesh>
      {/* border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.0, 1.15, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.9} />
      </mesh>
      {/* corner posts */}
      {[[-0.8,0.8],[0.8,0.8],[-0.8,-0.8],[0.8,-0.8]].map(([dx,dz], i) => (
        <mesh key={i} position={[dx, 0.4, dz]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function CargoCrate({ position, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.15 + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.1;
  });
  return (
    <group position={position}>
      <mesh ref={ref} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} roughness={0.75} />
      </mesh>
      {/* crate bands */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.62, 0.06, 0.62]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function HeavyWarehouseCourse() {
  const deliveryPads = [
    { pos: [-7, 0, -5], color: '#fbbf24' },
    { pos: [ 7, 0, -5], color: '#60a5fa' },
    { pos: [-7, 0,  5], color: '#34d399' },
    { pos: [ 7, 0,  5], color: '#f472b6' },
    { pos: [  0, 0,  8], color: '#fb923c' },
  ];
  const crates = [
    { pos: [-2, 0.3, -6], color: '#fbbf24' },
    { pos: [ 2, 0.3, -7], color: '#60a5fa' },
    { pos: [-3, 0.3,  0], color: '#34d399' },
    { pos: [ 3, 0.3,  2], color: '#f472b6' },
    { pos: [ 0, 0.3,  5], color: '#fb923c' },
  ];

  return (
    <>
      {/* Concrete warehouse floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.92} metalness={0.08} />
      </mesh>
      {/* Floor grid lines (forklift lanes) */}
      {[-8,-4,0,4,8].map((z, i) => (
        <mesh key={`lane-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, z]}>
          <planeGeometry args={[20, 0.1]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.5} />
        </mesh>
      ))}
      {[-8,-4,0,4,8].map((x, i) => (
        <mesh key={`lanex-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, 0]}>
          <planeGeometry args={[0.1, 20]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Shelving units on both sides */}
      <ShelvingUnit x={-5} z={-4} />
      <ShelvingUnit x={-5} z={2} />
      <ShelvingUnit x={5} z={-2} />
      <ShelvingUnit x={5} z={4} />
      <ShelvingUnit x={0} z={0} />

      {/* Delivery pads */}
      {deliveryPads.map((p, i) => (
        <DeliveryPad key={i} position={p.pos} color={p.color} />
      ))}

      {/* Cargo crates to collect */}
      {crates.map((c, i) => (
        <CargoCrate key={i} position={c.pos} color={c.color} />
      ))}

      {/* Industrial ceiling lights */}
      {[[-4,-4],[ 4,-4],[-4, 4],[ 4, 4],[0,0]].map(([x,z], i) => (
        <group key={`light-${i}`} position={[x, 5.5, z]}>
          <mesh>
            <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <circleGeometry args={[0.3, 16]} />
            <meshStandardMaterial color="#fffde8" emissive="#fff8d0" emissiveIntensity={0.9} />
          </mesh>
          <pointLight position={[0, -0.3, 0]} color="#fffde8" intensity={2.5} distance={10} decay={2} />
        </group>
      ))}

      {/* Warehouse walls */}
      {[
        [0, -10, 20, 0.4], [0, 10, 20, 0.4],
        [-10, 0, 0.4, 20], [10, 0, 0.4, 20],
      ].map(([x, z, w, h], i) => (
        <mesh key={`wwall-${i}`} position={[x, 3, z]} castShadow>
          <boxGeometry args={[w, 6, h]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.85} metalness={0.1} />
        </mesh>
      ))}

      <ambientLight color="#d0d8e8" intensity={1.2} />
      <directionalLight position={[5, 10, 5]} color="#fffde8" intensity={1.8} castShadow />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HEAVY ROBOT — CONSTRUCTION SITE
══════════════════════════════════════════════════════════════════════ */

function ConstructionCone({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.16, 0.56, 8]} />
        <meshStandardMaterial color="#f97316" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.08, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
    </group>
  );
}

function ConstructionBarrier({ x, z, rotation = 0 }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.4, 1.0, 0.28]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.8} />
      </mesh>
      {/* stripes */}
      {[-0.7, 0, 0.7].map((dx, i) => (
        <mesh key={i} position={[dx, 0.5, 0.15]}>
          <boxGeometry args={[0.28, 1.02, 0.02]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1e293b' : '#fbbf24'} />
        </mesh>
      ))}
    </group>
  );
}

function MaterialPile({ x, z, color, count = 5 }) {
  return (
    <group position={[x, 0, z]}>
      {[...Array(count)].map((_, i) => {
        const px = (Math.random() * 0.6 - 0.3);
        const pz = (Math.random() * 0.6 - 0.3);
        const s = 0.3 + (i % 3) * 0.1;
        return (
          <mesh key={i} position={[px, s * 0.5 + i * 0.08, pz]} castShadow>
            <boxGeometry args={[s, s * 0.6, s]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

function HeavyConstructionCourse() {
  return (
    <>
      {/* Dirt construction floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#78593a" roughness={0.97} metalness={0.02} />
      </mesh>
      {/* Concrete paved section in center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Heavy machinery (simplified models) */}
      {/* Bulldozer body */}
      <group position={[-4, 0, -5]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.8, 1.0, 3.0]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* cab */}
        <mesh position={[0, 1.3, -0.5]} castShadow>
          <boxGeometry args={[1.4, 0.9, 1.2]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* blade */}
        <mesh position={[0, 0.6, 1.7]}>
          <boxGeometry args={[1.9, 1.2, 0.15]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* Excavator */}
      <group position={[4, 0, -5]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.6, 1.1, 2.4]} />
          <meshStandardMaterial color="#f97316" metalness={0.35} roughness={0.55} />
        </mesh>
        {/* arm */}
        <mesh position={[0, 1.5, 0.6]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.28, 2.0, 0.28]} />
          <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* bucket */}
        <mesh position={[0.0, 2.4, 1.2]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.5, 0.35, 0.6]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* Material piles */}
      <MaterialPile x={-3} z={4}  color="#78716c" count={6} />
      <MaterialPile x={3}  z={-4} color="#92400e" count={5} />
      <MaterialPile x={0}  z={2}  color="#64748b" count={4} />
      <MaterialPile x={-6} z={0}  color="#a16207" count={7} />
      <MaterialPile x={6}  z={0}  color="#4a5568" count={5} />

      {/* Safety cones */}
      {[[-2,-3],[2,-4],[0,0],[3,3],[-3,2],[-1,5],[1,-5],[4,-2],[-4,4]].map(([x,z], i) => (
        <ConstructionCone key={i} x={x} z={z} />
      ))}

      {/* Barrier fences */}
      <ConstructionBarrier x={0}  z={-3.5} />
      <ConstructionBarrier x={0}  z={3.5} />
      <ConstructionBarrier x={-3} z={0}    rotation={Math.PI / 2} />

      {/* Dust particle effect clusters */}
      {[...Array(25)].map((_, i) => {
        const a = (i / 25) * Math.PI * 2;
        const r = 2 + (i % 6) * 1.2;
        return (
          <mesh key={`dust-${i}`} position={[Math.cos(a) * r, 0.3 + (i % 4) * 0.5, Math.sin(a) * r]}>
            <sphereGeometry args={[0.04, 4, 4]} />
            <meshBasicMaterial color="#d4a86a" transparent opacity={0.35} />
          </mesh>
        );
      })}

      {/* Delivery pickup zone */}
      <DeliveryPad position={[0, 0, 7]} color="#22d3ee" />

      {/* Warning lights on machinery */}
      <pointLight position={[-4, 2, -5]} color="#fbbf24" intensity={2} distance={8} decay={2} />
      <pointLight position={[ 4, 2, -5]} color="#f97316" intensity={2} distance={8} decay={2} />
      <ambientLight color="#c0a882" intensity={1.3} />
      <directionalLight position={[8, 12, 5]} color="#fffbeb" intensity={2.0} castShadow />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HEAVY ROBOT — MEGA BUILD OPERATION
══════════════════════════════════════════════════════════════════════ */

function SteelBeam({ from, to, thickness = 0.12 }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const cx = (from[0] + to[0]) / 2;
  const cy = (from[1] + to[1]) / 2;
  const cz = (from[2] + to[2]) / 2;
  // approximate angle
  const rotZ = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
  const rotY = Math.atan2(dx, dz);
  return (
    <mesh position={[cx, cy, cz]} rotation={[0, rotY, -rotZ + Math.PI / 2]} castShadow>
      <cylinderGeometry args={[thickness, thickness, len, 6]} />
      <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.35} />
    </mesh>
  );
}

function SkyscraperFrame({ x, z, floors = 3 }) {
  const floorH = 2.5;
  const w = 4;
  return (
    <group position={[x, 0, z]}>
      {[...Array(floors)].map((_, f) => {
        const y0 = f * floorH;
        const y1 = y0 + floorH;
        const hw = w / 2;
        return (
          <group key={f}>
            {/* vertical columns */}
            <SteelBeam from={[-hw, y0, -hw]} to={[-hw, y1, -hw]} />
            <SteelBeam from={[ hw, y0, -hw]} to={[ hw, y1, -hw]} />
            <SteelBeam from={[-hw, y0,  hw]} to={[-hw, y1,  hw]} />
            <SteelBeam from={[ hw, y0,  hw]} to={[ hw, y1,  hw]} />
            {/* floor beams */}
            <SteelBeam from={[-hw, y1, -hw]} to={[ hw, y1, -hw]} />
            <SteelBeam from={[-hw, y1,  hw]} to={[ hw, y1,  hw]} />
            <SteelBeam from={[-hw, y1, -hw]} to={[-hw, y1,  hw]} />
            <SteelBeam from={[ hw, y1, -hw]} to={[ hw, y1,  hw]} />
            {/* cross braces */}
            <SteelBeam from={[-hw, y0, -hw]} to={[ hw, y1,  hw]} thickness={0.06} />
            <SteelBeam from={[ hw, y0, -hw]} to={[-hw, y1,  hw]} thickness={0.06} />
          </group>
        );
      })}
    </group>
  );
}

function HeavyMegaBuildCourse() {
  const deliveryZoneColors = [
    '#fbbf24', '#60a5fa', '#34d399', '#f472b6',
    '#fb923c', '#a78bfa', '#22d3ee',
  ];

  return (
    <>
      {/* Epic scale construction floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Grid markings */}
      {[-8,-4,0,4,8].map((v, i) => (
        <React.Fragment key={`grid-${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[v, 0.004, 0]}>
            <planeGeometry args={[0.06, 20]} />
            <meshStandardMaterial color="#64748b" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, v]}>
            <planeGeometry args={[20, 0.06]} />
            <meshStandardMaterial color="#64748b" transparent opacity={0.6} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Skyscraper frame — main structure under construction */}
      <SkyscraperFrame x={0} z={0} floors={3} />
      {/* Smaller structures in corners */}
      <SkyscraperFrame x={-7} z={-7} floors={1} />
      <SkyscraperFrame x={7}  z={-7} floors={2} />
      <SkyscraperFrame x={-7} z={7}  floors={2} />
      <SkyscraperFrame x={7}  z={7}  floors={1} />

      {/* Crane */}
      <group position={[8, 0, -3]}>
        {/* mast */}
        <mesh position={[0, 6, 0]} castShadow>
          <boxGeometry args={[0.35, 12, 0.35]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* boom */}
        <mesh position={[-3.5, 11.5, 0]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[7, 0.2, 0.2]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* counter boom */}
        <mesh position={[2, 11.5, 0]} castShadow>
          <boxGeometry args={[4, 0.18, 0.18]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* hook cable */}
        <mesh position={[-3.5, 9.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4, 4]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Material supply zones */}
      <MaterialPile x={-6}  z={-6}  color="#78716c" count={8} />
      <MaterialPile x={6}   z={-6}  color="#475569" count={6} />
      <MaterialPile x={-6}  z={6}   color="#92400e" count={7} />
      <MaterialPile x={6}   z={6}   color="#64748b" count={5} />

      {/* Delivery / build zones */}
      {deliveryZoneColors.slice(0, 5).map((c, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <DeliveryPad
            key={i}
            position={[Math.cos(angle) * 6, 0, Math.sin(angle) * 6]}
            color={c}
          />
        );
      })}
      {/* Boss challenge zone at center */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <ringGeometry args={[1.5, 2.0, 40]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.45} />
        </mesh>
        <PulseRing position={[0, 0.03, 0]} color="#fbbf24" scale={1.8} />
      </group>

      {/* Safety barriers around main structure */}
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <ConstructionBarrier
            key={i}
            x={Math.cos(a) * 3.5}
            z={Math.sin(a) * 3.5}
            rotation={a + Math.PI / 2}
          />
        );
      })}

      {/* Safety cones */}
      {[[-5,-3],[5,-3],[-5,3],[5,3],[0,-5],[0,5],[-3,-5],[3,5]].map(([x,z], i) => (
        <ConstructionCone key={i} x={x} z={z} />
      ))}

      {/* Industrial lighting rig */}
      {[[-5,-5],[ 5,-5],[-5, 5],[ 5, 5],[0,0]].map(([x,z], i) => (
        <group key={`mlight-${i}`} position={[x, 7, z]}>
          <mesh>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
          </mesh>
          <pointLight position={[0, -0.5, 0]} color="#fffde8" intensity={3} distance={14} decay={2} />
        </group>
      ))}

      <ambientLight color="#b0c0cc" intensity={1.0} />
      <directionalLight position={[10, 15, 8]} color="#fffde8" intensity={2.2} castShadow />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   100-COURSE EXPANSION — SPECTACULAR GAME ENVIRONMENTS
══════════════════════════════════════════════════════════════════════ */

// ── Shared micro-components ───────────────────────────────────────────

/** Floating, spinning collectible gem */
function GemCollectible({ position, color = '#ffd700', shape = 'octa', size = 0.22 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 2.2;
    ref.current.position.y = position[1] + 0.65 + Math.sin(state.clock.elapsedTime * 2.5 + position[0]) * 0.08;
    ref.current.material.emissiveIntensity = 0.65 + Math.sin(state.clock.elapsedTime * 4 + position[2]) * 0.25;
  });
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[size * 0.9, size * 1.7, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ref} position={[0, 0.65, 0]} castShadow>
        {shape === 'star' ? <octahedronGeometry args={[size, 0]} /> : <octahedronGeometry args={[size, 0]} />}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} metalness={0.8} roughness={0.1} />
      </mesh>
      <pointLight position={[0, 0.65, 0]} color={color} intensity={0.8} distance={3} decay={2} />
    </group>
  );
}

/** Animated lava crack on the floor */
function LavaCrack({ x, z, len = 3, angle = 0 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 3 + x) * 0.4;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, angle, 0]} position={[x, 0.012, z]}>
      <planeGeometry args={[0.12, len]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.8} transparent opacity={0.9} />
    </mesh>
  );
}

/** Animated torch on a wall/pillar */
function Torch({ position }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.material.emissiveIntensity = 0.9 + Math.sin(t * 7.3 + position[0]) * 0.4;
    ref.current.scale.y = 1 + Math.sin(t * 9 + position[2]) * 0.2;
  });
  return (
    <group position={position}>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.04, 0.1, 10]} />
        <meshStandardMaterial color="#78502e" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh ref={ref} position={[0, 0.18, 0]}>
        <coneGeometry args={[0.09, 0.32, 10]} />
        <meshStandardMaterial color="#ff6b00" emissive="#ff3300" emissiveIntensity={1.0} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 0.3, 0]} color="#ff8c00" intensity={1.8} distance={5} decay={2} />
    </group>
  );
}

/** Spinning danger laser barrier */
function SpinBarrier({ position, color = '#ef4444', speed = 0.8, radius = 1.5 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed;
  });
  return (
    <group position={position} ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, radius * 2, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>
      <pointLight color={color} intensity={1.5} distance={6} decay={2} />
    </group>
  );
}

/** Bobbing paper lantern */
function PaperLantern({ position, color = '#ff6b35' }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.15;
    ref.current.children[0].material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2.5 + position[2]) * 0.25;
  });
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.35, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, -0.22, 0]}><cylinderGeometry args={[0.04, 0.04, 0.06, 6]} /><meshStandardMaterial color="#1a0800" /></mesh>
      <pointLight color={color} intensity={1.2} distance={4} decay={2} />
    </group>
  );
}

/** Stone / ruin obstacle column */
function RuinColumn({ x, z, height = 3, cracked = false }) {
  const col = cracked ? '#4a3e2e' : '#5a5040';
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.62, 0.3, 16]} />
        <meshStandardMaterial color={col} roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh position={[0, height * 0.5 + 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.50, height, 16]} />
        <meshStandardMaterial color={col} roughness={0.9} metalness={0.06} />
      </mesh>
      {!cracked && (
        <mesh position={[0, height + 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.44, 0.35, 16]} />
          <meshStandardMaterial color={col} roughness={0.85} />
        </mesh>
      )}
    </group>
  );
}

function GenericCylinder({ o, color = '#ef4444', emissive = '#dc2626', glowColor = '#f87171' }) {
  return (
    <group position={[o.x, 0.55, o.z]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[o.r * 0.9, o.r, 1.1, 16]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.25} metalness={0.4} roughness={0.5} />
      </mesh>
      <PulseRing position={[0, 0.02, 0]} color={glowColor} scale={o.r * 1.8} />
    </group>
  );
}

function GenericWall({ o, color = '#475569', emissive = '#334155' }) {
  return (
    <mesh position={[o.x, 0.55, o.z]} castShadow receiveShadow>
      <boxGeometry args={[o.w, 1.1, o.h]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.12} metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

function GenericRing({ o, color = '#38bdf8', emissive = '#0ea5e9' }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 2.5 + o.x) * 0.3;
  });
  return (
    <group position={[o.x, o.y ?? 4, o.z]}>
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[o.r ?? 0.75, 0.08, 10, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.7} transparent opacity={0.9} />
      </mesh>
      <pointLight color={color} intensity={1.2} distance={5} decay={2} />
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════
// SPIDER — TIER 1  ·  Jungle Temple
// Firefly swarm + roaming guardian spider + gem collectibles
// ════════════════════════════════════════════════════════════════════════

function FireflySwarm() {
  const COUNT = 18;
  const flies = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    ox: (Math.random() - 0.5) * 14,
    oz: (Math.random() - 0.5) * 14,
    oy: 0.4 + Math.random() * 1.4,
    speed: 0.4 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
    r: 1.5 + Math.random() * 3,
    color: ['#a3e635','#4ade80','#fde047','#86efac'][i % 4],
  })), []);
  const refs = useRef(flies.map(() => null));
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    flies.forEach((f, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.position.x = f.ox + Math.cos(t * f.speed + f.phase) * f.r;
      m.position.z = f.oz + Math.sin(t * f.speed * 0.7 + f.phase) * f.r;
      m.position.y = f.oy + Math.sin(t * 2.1 + f.phase) * 0.3;
      m.material.emissiveIntensity = 0.7 + Math.sin(t * 5 + f.phase) * 0.5;
    });
  });
  return (
    <>
      {flies.map((f, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={1.0} />
        </mesh>
      ))}
    </>
  );
}

function GuardianSpider({ arenaId }) {
  const pos = useRef({ x: 5, z: -5 });
  const ref = useRef();
  const PATROL = [{ x: 5, z: -5 }, { x: -5, z: -4 }, { x: -4, z: 5 }, { x: 5, z: 4 }];
  const target = useRef(0);
  useFrame((_, dt) => {
    const t = PATROL[target.current];
    const dx = t.x - pos.current.x;
    const dz = t.z - pos.current.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.4) { target.current = (target.current + 1) % PATROL.length; return; }
    pos.current.x += (dx / dist) * 1.4 * dt;
    pos.current.z += (dz / dist) * 1.4 * dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 0.28, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    setDynamicObstacles(arenaId, [{ x: pos.current.x, z: pos.current.z, r: 0.55 }]);
  });
  return (
    <group ref={ref} castShadow>
      <mesh><sphereGeometry args={[0.32, 12, 12]} /><meshStandardMaterial color="#2d1a0a" emissive="#8b4513" emissiveIntensity={0.3} roughness={0.7} /></mesh>
      {[0,1,2,3,4,5,6,7].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/4)*0.38, -0.1, Math.sin(i*Math.PI/4)*0.38]} rotation={[0,0,i%2?0.4:-0.4]}>
          <cylinderGeometry args={[0.04, 0.02, 0.5, 5]} />
          <meshStandardMaterial color="#1a0e05" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0,0.15,0.2]}><sphereGeometry args={[0.1,8,8]} /><meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={1.2} /></mesh>
    </group>
  );
}

function SpiderJungleCourse({ obstacles }) {
  const gemPos = [[-3,0,-5],[4,0,-2],[-5,0,2],[2,0,6],[-1,0,4],[5,0,0]];
  const gemColors = ['#ffd700','#00ff9a','#ff6b6b','#00d9ff','#c084fc','#fb923c'];
  return (
    <>
      {/* Mossy jungle floor with tile variation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial color="#1a3a0e" roughness={0.97} metalness={0.01} />
      </mesh>
      {[...Array(6)].map((_, i) => [...Array(6)].map((_, j) => (
        <mesh key={`tile-${i}-${j}`} rotation={[-Math.PI/2,0,0]} position={[(i-2.5)*5.2, 0.003, (j-2.5)*5.2]}>
          <planeGeometry args={[5.0,5.0]} />
          <meshStandardMaterial color={((i+j)%2===0)?'#1f3e10':'#162e09'} roughness={0.96} />
        </mesh>
      )))}
      {/* Ancient temple columns */}
      {[[-4,-5],[4,-5],[-5.5,0],[5.5,0],[-4,5],[4,5],[-1,-7],[1,7]].map(([x,z],i) => (
        <RuinColumn key={i} x={x} z={z} height={3.5} cracked={i%3===0} />
      ))}
      {/* Temple walls */}
      {obstacles.filter(o=>o.type==='wall').map((o,i) => (
        <mesh key={i} position={[o.x, 1.1, o.z]} castShadow receiveShadow>
          <boxGeometry args={[o.w, 2.2, o.h]} />
          <meshStandardMaterial color="#3d3228" roughness={0.92} emissive="#1a1408" emissiveIntensity={0.05} />
        </mesh>
      ))}
      {/* Rocky obstacles */}
      {obstacles.filter(o=>o.r&&!o.type).map((o,i) => (
        <mesh key={i} position={[o.x, 0.5*o.r, o.z]} castShadow>
          <dodecahedronGeometry args={[o.r*0.95, 0]} />
          <meshStandardMaterial color="#2d4a1a" roughness={0.93} />
        </mesh>
      ))}
      {/* Jungle trees in background */}
      {[[-9,-4],[9,-5],[-8,4],[9,3],[-9,0],[0,-9],[0,9],[-6,-8],[6,8]].map(([x,z],i) => (
        <group key={`tree-${i}`} position={[x, 0, z]}>
          <mesh castShadow><cylinderGeometry args={[0.22,0.32,3.5+i%2,8]} /><meshStandardMaterial color="#3d2318" roughness={0.95} /></mesh>
          <mesh position={[0,3.5+i%2,0]}><sphereGeometry args={[1.2+(i%3)*0.3,8,8]} /><meshStandardMaterial color="#254a12" roughness={0.9} /></mesh>
        </group>
      ))}
      {/* Glowing fern ground plants */}
      {[[-2,-3],[3,-1],[-4,2],[1,5],[-5,-1],[4,3]].map(([x,z],i) => (
        <mesh key={`fern-${i}`} position={[x, 0.3, z]} rotation={[0.4, i*1.1, 0]}>
          <sphereGeometry args={[0.4,6,6]} />
          <meshStandardMaterial color="#34d399" emissive="#22c55e" emissiveIntensity={0.2} roughness={0.9} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Collectible gem artifacts */}
      {gemPos.map((p,i) => <GemCollectible key={i} position={p} color={gemColors[i]} />)}
      {/* Torches on columns */}
      {[[-4,-5,2.2],[4,-5,2.2],[-5.5,0,2.2],[5.5,0,2.2],[-4,5,2.2],[4,5,2.2]].map(([x,y,z],i) => (
        <Torch key={`t-${i}`} position={[x+0.5, y, z+0.5]} />
      ))}
      {/* Start glow */}
      <PulseRing position={[0, 0.04, -8.5]} color="#4ade80" scale={1.5} />
      {/* Finish arch */}
      <group position={[0,0,8.5]}>
        {[-1.2,1.2].map((dx,i) => (
          <mesh key={i} position={[dx,2,0]}><boxGeometry args={[0.22,4,0.22]} /><meshStandardMaterial color="#8b6914" metalness={0.4} roughness={0.6} /></mesh>
        ))}
        <mesh position={[0,4.1,0]}><boxGeometry args={[2.7,0.28,0.22]} /><meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.5} /></mesh>
      </group>
      {/* Fireflies */}
      <FireflySwarm />
      {/* Roaming guardian */}
      <GuardianSpider arenaId="spider_jungle_guardian" />
      {/* Lighting */}
      <ambientLight color="#1a2e08" intensity={1.2} />
      <directionalLight position={[4, 12, 4]} color="#a8e060" intensity={2.0} castShadow />
      <pointLight position={[-5, 4, -5]} color="#ff8c00" intensity={2.5} distance={10} decay={2} />
      <pointLight position={[ 5, 4,  5]} color="#ff8c00" intensity={2.5} distance={10} decay={2} />
      <pointLight position={[0, 5, 0]} color="#4ade80" intensity={1.5} distance={18} decay={2} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// SPIDER — TIER 2  ·  Ancient Web City / Dark Forest
// Web network + orbiting will-o-wisps + duo patrol spiders
// ════════════════════════════════════════════════════════════════════════

function WillOWisp({ ox, oz, speed, phase, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = ox + Math.cos(t * speed + phase) * 3.5;
    ref.current.position.z = oz + Math.sin(t * speed * 0.8 + phase) * 3.5;
    ref.current.position.y = 0.7 + Math.sin(t * 1.8 + phase) * 0.4;
    ref.current.children[0].material.emissiveIntensity = 0.8 + Math.sin(t * 4 + phase) * 0.5;
  });
  return (
    <group ref={ref}>
      <mesh><sphereGeometry args={[0.12, 10, 10]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} transparent opacity={0.85} /></mesh>
      <pointLight color={color} intensity={1.5} distance={5} decay={2} />
    </group>
  );
}

function SpiderAdvancedCourse({ obstacles }) {
  const wisps = useMemo(() => [
    { ox: 3, oz: -3, speed: 0.5, phase: 0, color: '#a78bfa' },
    { ox: -4, oz: 2, speed: 0.4, phase: 2.1, color: '#818cf8' },
    { ox: 0, oz: 5, speed: 0.6, phase: 4.2, color: '#c084fc' },
    { ox: 4, oz: 4, speed: 0.35, phase: 1.5, color: '#7dd3fc' },
  ], []);
  const gemPos = [[-4,0,-4],[4,0,-3],[0,0,-6],[5,0,3],[-3,0,5],[0,0,7]];
  return (
    <>
      {/* Dark mossy stone floor */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#0e0c08" roughness={0.95} metalness={0.08} />
      </mesh>
      {[...Array(7)].map((_,i) => [...Array(7)].map((_,j) => (
        <mesh key={`t-${i}-${j}`} rotation={[-Math.PI/2,0,0]} position={[(i-3)*4.8, 0.004, (j-3)*4.8]}>
          <planeGeometry args={[4.6,4.6]} />
          <meshStandardMaterial color={((i+j)%2===0)?'#131008':'#0c0a06'} roughness={0.94} />
        </mesh>
      )))}
      {/* Web strands across the arena */}
      {[
        [[-6,-5],[6,-5]],[[-6,5],[6,5]],[[-5,-5],[-5,5]],[[5,-5],[5,5]],
        [[-6,-5],[5,5]],[[6,-5],[-5,5]],[[-6,0],[6,0]],[[0,-6],[0,6]],
      ].map(([from,to],i) => (
        <WebStrand key={i} from={[from[0],1.4,from[1]]} to={[to[0],1.4,to[1]]} color="#4c1d95" thickness={0.035} />
      ))}
      {/* Glowing rune circles on floor */}
      {[[-3,-3],[3,-2],[0,4],[-4,3],[2,-5]].map(([x,z],i) => (
        <mesh key={`rune-${i}`} rotation={[-Math.PI/2,0,0]} position={[x, 0.008, z]}>
          <ringGeometry args={[0.4,0.55,16]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Ancient broken columns */}
      {obstacles.filter(o=>o.r&&!o.type).map((o,i) => (
        <group key={i} position={[o.x, 0, o.z]}>
          <mesh castShadow position={[0, o.r*0.7, 0]}>
            <cylinderGeometry args={[o.r*0.7, o.r*0.8, o.r*1.4, 12]} />
            <meshStandardMaterial color="#2a1f10" roughness={0.92} emissive="#1a1208" emissiveIntensity={0.08} />
          </mesh>
          <PulseRing position={[0, 0.04, 0]} color="#7c3aed" scale={o.r*1.6} />
        </group>
      ))}
      {/* Web walls */}
      {obstacles.filter(o=>o.type==='wall').map((o,i) => (
        <mesh key={i} position={[o.x, 0.9, o.z]} castShadow>
          <boxGeometry args={[o.w, 1.8, o.h]} />
          <meshStandardMaterial color="#1a140a" roughness={0.9} emissive="#4c1d95" emissiveIntensity={0.06} />
        </mesh>
      ))}
      {/* Gem collectibles */}
      {gemPos.map((p,i) => <GemCollectible key={i} position={p} color={['#a78bfa','#818cf8','#c084fc','#7dd3fc','#e879f9','#38bdf8'][i]} />)}
      {/* Will-o-wisps */}
      {wisps.map((w,i) => <WillOWisp key={i} {...w} />)}
      {/* Background dead trees */}
      {[[-8,-6],[8,-5],[-7,5],[8,4],[-9,0],[0,-9],[0,9]].map(([x,z],i) => (
        <group key={`dt-${i}`} position={[x,0,z]}>
          <mesh castShadow><cylinderGeometry args={[0.18,0.28,4,6]} /><meshStandardMaterial color="#1a1008" roughness={0.95} /></mesh>
          {[0,1,2].map(b => <mesh key={b} position={[Math.cos(b*2.1)*0.5, 2.5-(b*0.4), Math.sin(b*2.1)*0.5]} rotation={[0,0,0.5]}><cylinderGeometry args={[0.06,0.04,1,5]} /><meshStandardMaterial color="#120c06" roughness={0.95} /></mesh>)}
        </group>
      ))}
      <ambientLight color="#0e0808" intensity={0.8} />
      <pointLight position={[0,8,0]} color="#7c3aed" intensity={3.5} distance={28} decay={2} />
      <pointLight position={[-6,3,-4]} color="#4c1d95" intensity={2} distance={14} decay={2} />
      <pointLight position={[6,3,4]} color="#6d28d9" intensity={2} distance={14} decay={2} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// SPIDER — TIER 3  ·  Elemental Ruins / Labyrinth
// Fire vents that erupt + ice crystal formations + dual spider patrols
// ════════════════════════════════════════════════════════════════════════

function FireVent({ x, z }) {
  const ref = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state) => {
    if (!ref.current) return;
    const active = Math.sin(state.clock.elapsedTime * 1.8 + phase) > 0.3;
    ref.current.scale.y = active ? (1 + Math.sin(state.clock.elapsedTime * 12 + phase) * 0.4) : 0.05;
    ref.current.material.emissiveIntensity = active ? (0.9 + Math.sin(state.clock.elapsedTime * 15) * 0.3) : 0;
    ref.current.visible = active;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
        <circleGeometry args={[0.28, 12]} />
        <meshStandardMaterial color="#7c2d12" emissive="#dc2626" emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={ref} position={[0, 0.6, 0]}>
        <coneGeometry args={[0.22, 1.2, 10]} />
        <meshStandardMaterial color="#f97316" emissive="#ef4444" emissiveIntensity={1.0} transparent opacity={0.88} />
      </mesh>
      <pointLight position={[0,0.8,0]} color="#ff4400" intensity={2.5} distance={5} decay={2} />
    </group>
  );
}

function IceCrystal({ x, z, h = 1.4, color = '#7dd3fc' }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.35 + Math.sin(state.clock.elapsedTime * 2.2 + x) * 0.2;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh ref={ref} position={[0, h*0.5, 0]} castShadow>
        <coneGeometry args={[0.18, h, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.5} roughness={0.1} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.14, h*0.3, 0.1]} castShadow>
        <coneGeometry args={[0.10, h*0.65, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.5} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0,h*0.5,0]} color={color} intensity={0.8} distance={4} decay={2} />
    </group>
  );
}

function SpiderEliteCourse({ obstacles }) {
  return (
    <>
      {/* Scorched stone floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[36,36]} />
        <meshStandardMaterial color="#140a04" roughness={0.9} metalness={0.12} />
      </mesh>
      {[...Array(6)].map((_,i) => [...Array(6)].map((_,j) => (
        <mesh key={`ft-${i}-${j}`} rotation={[-Math.PI/2,0,0]} position={[(i-2.5)*5.4, 0.005, (j-2.5)*5.4]}>
          <planeGeometry args={[5.1,5.1]} />
          <meshStandardMaterial color={((i+j)%2===0)?'#1a0e06':'#130b04'} roughness={0.9} />
        </mesh>
      )))}
      {/* Lava cracks */}
      {[[-2,-3,3,0.2],[3,-1,2.5,1.0],[0,3,4,0.5],[-3,2,2,0.8],[2,4,3,0.3]].map(([x,z,l,a],i) => (
        <LavaCrack key={i} x={x} z={z} len={l} angle={a} />
      ))}
      {/* Elemental columns - ruin style */}
      {obstacles.filter(o=>o.r&&!o.type).map((o,i) => (
        <group key={i} position={[o.x,0,o.z]}>
          <mesh castShadow position={[0,o.r*0.8,0]}>
            <cylinderGeometry args={[o.r*0.65, o.r*0.8, o.r*1.6, 10]} />
            <meshStandardMaterial color="#3d1a08" roughness={0.88} emissive="#8b2500" emissiveIntensity={0.15} metalness={0.15} />
          </mesh>
          <PulseRing position={[0,0.04,0]} color="#f97316" scale={o.r*1.7} />
        </group>
      ))}
      {/* Labyrinth walls */}
      {obstacles.filter(o=>o.type==='wall').map((o,i) => (
        <mesh key={i} position={[o.x,1.1,o.z]} castShadow>
          <boxGeometry args={[o.w,2.2,o.h]} />
          <meshStandardMaterial color="#2a1408" roughness={0.9} emissive="#7c2d12" emissiveIntensity={0.08} />
        </mesh>
      ))}
      {/* Fire vents scattered around */}
      {[[-3,-4],[3,-3],[0,2],[-4,3],[2,-6],[4,5],[-1,6]].map(([x,z],i) => (
        <FireVent key={i} x={x} z={z} />
      ))}
      {/* Ice crystal clusters (elemental contrast) */}
      {[[-5,-3,1.6,'#7dd3fc'],[5,-4,1.2,'#bae6fd'],[-5,3,1.8,'#e0f2fe'],[5,4,1.4,'#93c5fd'],[-7,0,2.0,'#60a5fa']].map(([x,z,h,c],i) => (
        <IceCrystal key={i} x={x} z={z} h={h} color={c} />
      ))}
      {/* Gold gem collectibles */}
      {[[-3,0,-5],[4,0,-2],[0,0,5],[-2,0,3],[5,0,1]].map((p,i) => (
        <GemCollectible key={i} position={p} color={['#fbbf24','#fb923c','#f472b6','#a78bfa','#34d399'][i]} />
      ))}
      {/* Runic portal at finish */}
      <group position={[0,0,8]}>
        <PulseRing position={[0,0.04,0]} color="#f97316" scale={2} />
        {[-1.4,1.4].map((dx,i)=>(
          <mesh key={i} position={[dx,2.5,0]}><boxGeometry args={[0.25,5,0.25]} /><meshStandardMaterial color="#8b2500" emissive="#f97316" emissiveIntensity={0.4} /></mesh>
        ))}
        <mesh position={[0,5.2,0]}><boxGeometry args={[3.1,0.28,0.25]} /><meshStandardMaterial color="#ff6b00" emissive="#ff4400" emissiveIntensity={0.7} /></mesh>
      </group>
      <ambientLight color="#140806" intensity={0.9} />
      <pointLight position={[0,10,0]} color="#f97316" intensity={4} distance={30} decay={2} />
      <pointLight position={[-6,4,-5]} color="#dc2626" intensity={2.5} distance={16} decay={2} />
      <pointLight position={[6,3,5]} color="#7dd3fc" intensity={1.5} distance={14} decay={2} />
      <directionalLight position={[5,14,-3]} color="#ff8040" intensity={1.8} castShadow />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// SPIDER — TIER 4  ·  The Ultimate Gauntlet / Void Realm
// Lava eruptions + 3 hunting boss spiders + chaos void floor
// ════════════════════════════════════════════════════════════════════════

function BossSpiderHunter({ arenaId, startX, startZ, speed, color }) {
  const pos = useRef({ x: startX, z: startZ });
  const ref = useRef();
  useFrame((_, dt) => {
    const { x: rx, z: rz } = robotPosTracker;
    const dx = rx - pos.current.x;
    const dz = rz - pos.current.z;
    const dist = Math.hypot(dx, dz) || 1;
    pos.current.x += (dx / dist) * speed * dt;
    pos.current.z += (dz / dist) * speed * dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 0.38, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
  });
  return (
    <group ref={ref} castShadow>
      <mesh><sphereGeometry args={[0.44, 12, 12]} /><meshStandardMaterial color="#1a0808" emissive={color} emissiveIntensity={0.45} roughness={0.6} /></mesh>
      {[0,1,2,3,4,5,6,7].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/4)*0.5, -0.12, Math.sin(i*Math.PI/4)*0.5]}>
          <cylinderGeometry args={[0.055, 0.03, 0.65, 5]} />
          <meshStandardMaterial color="#0d0505" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0,0.2,0.28]}><sphereGeometry args={[0.14,8,8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} /></mesh>
      <pointLight color={color} intensity={2} distance={6} decay={2} />
    </group>
  );
}

function LavaGeyser({ x, z }) {
  const ref = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state) => {
    if (!ref.current) return;
    const burst = Math.sin(state.clock.elapsedTime * 1.2 + phase) > 0.6;
    ref.current.scale.y = burst ? (1.5 + Math.sin(state.clock.elapsedTime * 20) * 0.5) : 0.1;
    ref.current.material.opacity = burst ? 0.9 : 0;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
        <circleGeometry args={[0.35,14]} />
        <meshStandardMaterial color="#7c2d12" emissive="#ff2200" emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={ref} position={[0,0.8,0]}>
        <cylinderGeometry args={[0.18,0.3,1.8,8]} />
        <meshStandardMaterial color="#ff6b00" emissive="#ff2200" emissiveIntensity={1.0} transparent opacity={0.88} />
      </mesh>
      <pointLight color="#ff3300" intensity={3} distance={7} decay={2} />
    </group>
  );
}

function SpiderEpicCourse({ obstacles }) {
  const bossSpiders = useMemo(() => [
    { startX: 7, startZ: -6, speed: 1.8, color: '#ef4444' },
    { startX: -7, startZ: 5, speed: 2.0, color: '#f97316' },
    { startX: 0, startZ: -8, speed: 1.6, color: '#dc2626' },
  ], []);
  return (
    <>
      {/* Void floor with lava glow seams */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[42,42]} />
        <meshStandardMaterial color="#050202" roughness={0.82} metalness={0.3} />
      </mesh>
      {/* Lava seam grid */}
      {[-6,-2,2,6].map((v,i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI/2,0,0]} position={[v,0.006,0]}><planeGeometry args={[0.1,30]} /><meshStandardMaterial color="#ff2200" emissive="#ff1100" emissiveIntensity={0.7} transparent opacity={0.6} /></mesh>
          <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.006,v]}><planeGeometry args={[30,0.1]} /><meshStandardMaterial color="#ff2200" emissive="#ff1100" emissiveIntensity={0.7} transparent opacity={0.6} /></mesh>
        </group>
      ))}
      {/* Massive obsidian columns */}
      {obstacles.filter(o=>o.r&&!o.type).map((o,i) => (
        <group key={i} position={[o.x,0,o.z]}>
          <mesh castShadow position={[0,o.r+0.5,0]}>
            <cylinderGeometry args={[o.r*0.7, o.r*0.9, (o.r+0.5)*2, 8]} />
            <meshStandardMaterial color="#1a0808" roughness={0.75} metalness={0.4} emissive="#8b0000" emissiveIntensity={0.2} />
          </mesh>
          <PulseRing position={[0,0.05,0]} color="#ef4444" scale={o.r*1.8} />
          <pointLight color="#ff2200" intensity={1.5} distance={6} decay={2} />
        </group>
      ))}
      {/* Void walls */}
      {obstacles.filter(o=>o.type==='wall').map((o,i) => (
        <mesh key={i} position={[o.x,1.4,o.z]} castShadow>
          <boxGeometry args={[o.w,2.8,o.h]} />
          <meshStandardMaterial color="#120606" roughness={0.8} emissive="#8b0000" emissiveIntensity={0.12} metalness={0.3} />
        </mesh>
      ))}
      {/* Lava geysers */}
      {[[-3,-4],[3,-2],[-1,3],[4,4],[-5,1],[1,-6],[5,-5],[-4,-7]].map(([x,z],i) => (
        <LavaGeyser key={i} x={x} z={z} />
      ))}
      {/* Boss spider hunters */}
      {bossSpiders.map((cfg,i) => <BossSpiderHunter key={i} arenaId={`spider_epic_boss_${i}`} {...cfg} />)}
      {/* Diamond collectibles */}
      {[[-4,0,-5],[5,0,-3],[0,0,6],[3,0,4],[-2,0,7]].map((p,i) => (
        <GemCollectible key={i} position={p} color={['#f87171','#fb923c','#fbbf24','#a78bfa','#f472b6'][i]} />
      ))}
      {/* Glowing void stones */}
      {[[-7,-7],[7,-6],[-6,7],[7,6],[-9,0],[9,0],[0,-9],[0,9]].map(([x,z],i) => (
        <group key={`vs-${i}`} position={[x,0,z]}>
          <mesh castShadow><dodecahedronGeometry args={[0.6+(i%2)*0.3,0]} /><meshStandardMaterial color="#200808" emissive="#8b1a00" emissiveIntensity={0.4} roughness={0.8} metalness={0.2} /></mesh>
          <pointLight color="#ff2200" intensity={1.2} distance={7} decay={2} />
        </group>
      ))}
      <ambientLight color="#100204" intensity={0.7} />
      <pointLight position={[0,12,0]} color="#ff0000" intensity={6} distance={45} decay={2} />
      <pointLight position={[-8,5,-6]} color="#dc2626" intensity={3} distance={22} decay={2} />
      <pointLight position={[8,4,6]} color="#f97316" intensity={2.5} distance={18} decay={2} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// DRONE — TIER 1  ·  Sky Academy
// Drifting clouds + spinning rainbow ring gates + star collectibles
// ════════════════════════════════════════════════════════════════════════

function DriftCloud({ ox, oy, oz, size, speed }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.x = ox + Math.sin(state.clock.elapsedTime * speed * 0.3) * 3;
    ref.current.position.y = oy + Math.sin(state.clock.elapsedTime * speed * 0.7) * 0.4;
  });
  return (
    <group ref={ref} position={[ox, oy, oz]}>
      {[0,1,2].map(i => (
        <mesh key={i} position={[(i-1)*size*0.55, Math.sin(i)*size*0.18, 0]}>
          <sphereGeometry args={[size*(0.8+i*0.12), 8, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.55} roughness={1.0} />
        </mesh>
      ))}
    </group>
  );
}

function SpinningRingGate({ o, index }) {
  const ref = useRef();
  const colors = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#06b6d4','#ec4899','#84cc16'];
  const c = colors[index % colors.length];
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.9 + index * 0.8;
    ref.current.children[0].material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.35;
  });
  return (
    <group position={[o.x, o.y ?? 4, o.z]}>
      <group ref={ref}>
        <mesh rotation={[Math.PI/2,0,0]}>
          <torusGeometry args={[o.r ?? 0.78, 0.1, 12, 36]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} metalness={0.3} roughness={0.1} />
        </mesh>
        {/* 4 spoke markers */}
        {[0,1,2,3].map(s => (
          <mesh key={s} rotation={[Math.PI/2, s*Math.PI/2, 0]} position={[0, (o.r??0.78)*0.9, 0]}>
            <boxGeometry args={[0.08, 0.25, 0.06]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>
      <pointLight color={c} intensity={2} distance={6} decay={2} />
    </group>
  );
}

function DroneAcademyCourse({ obstacles }) {
  const rings = obstacles.filter(o => o.type === 'ring');
  const cols = obstacles.filter(o => o.r && !o.type);
  return (
    <>
      {/* Grass ground far below */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-8,0]} receiveShadow>
        <planeGeometry args={[80,80]} />
        <meshStandardMaterial color="#4ade80" roughness={0.98} metalness={0.0} />
      </mesh>
      {/* Checkerboard fields pattern */}
      {[-4,-2,0,2,4].map((x,i) => [-4,-2,0,2,4].map((z,j) => (
        <mesh key={`f-${i}-${j}`} rotation={[-Math.PI/2,0,0]} position={[x*3,-7.99,z*3]}>
          <planeGeometry args={[2.9,2.9]} />
          <meshStandardMaterial color={((i+j)%2===0)?'#22c55e':'#4ade80'} roughness={0.98} />
        </mesh>
      )))}
      {/* Drifting clouds */}
      {[[-5,6,-4,1.2,0.4],[4,5,-5,0.9,0.3],[0,7,6,1.1,0.5],[-3,8,3,0.8,0.45],[6,5,2,1.0,0.35],[-6,6,5,0.75,0.5]].map(([x,y,z,s,sp],i) => (
        <DriftCloud key={i} ox={x} oy={y} oz={z} size={s} speed={sp} />
      ))}
      {/* Floating launch platform at start */}
      <group position={[0,0,8]}>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
          <circleGeometry args={[2.5,24]} />
          <meshStandardMaterial color="#1e40af" roughness={0.5} metalness={0.4} />
        </mesh>
        <PulseRing position={[0,0.04,0]} color="#22c55e" scale={2} />
      </group>
      {/* Star collectibles floating in the air */}
      {[[2,3.5,-5],[-3,4.5,-3],[0,5,0],[4,3,3],[-4,4,4],[0,6,-7]].map((p,i) => (
        <GemCollectible key={i} position={p} color={['#fde047','#fb923c','#4ade80','#38bdf8','#a78bfa','#f472b6'][i]} />
      ))}
      {/* Spinning rainbow ring gates */}
      {rings.map((o,i) => <SpinningRingGate key={i} o={o} index={i} />)}
      {/* Pillar obstacles as floating cloud-top columns */}
      {cols.map((o,i) => (
        <group key={i} position={[o.x, 1.5, o.z]}>
          <mesh castShadow><cylinderGeometry args={[o.r*0.7,o.r*0.9,3,12]} /><meshStandardMaterial color="#f0f9ff" roughness={0.6} metalness={0.2} /></mesh>
          <mesh position={[0,1.8,0]}><sphereGeometry args={[o.r*1.1,10,10]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.6} roughness={1.0} /></mesh>
        </group>
      ))}
      <ambientLight color="#70a8e0" intensity={1.4} />
      <directionalLight position={[8,16,5]} color="#fff9e8" intensity={3.0} castShadow />
      <pointLight position={[0,10,0]} color="#38bdf8" intensity={2} distance={30} decay={2} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// DRONE — TIER 2  ·  Storm / Asteroid Challenge
// Real moving meteor rocks + lightning flash + speed trial gates
// ════════════════════════════════════════════════════════════════════════

function StormCloud({ x, y, z }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.x = x + Math.sin(state.clock.elapsedTime * 0.25 + x) * 2;
    ref.current.children[0].material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 1.5 + z) * 0.2;
  });
  return (
    <group ref={ref} position={[x, y, z]}>
      {[0,1,2].map(i => (
        <mesh key={i} position={[(i-1)*1.2, Math.sin(i)*0.25, 0]}>
          <sphereGeometry args={[1.0 + i*0.2, 7, 7]} />
          <meshStandardMaterial color="#1e293b" transparent opacity={0.7} roughness={1.0} />
        </mesh>
      ))}
    </group>
  );
}

function LightningBolt({ x, z }) {
  const ref = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state) => {
    if (!ref.current) return;
    const flash = Math.sin(state.clock.elapsedTime * 3.5 + phase) > 0.85;
    ref.current.visible = flash;
    ref.current.material.emissiveIntensity = flash ? (1.5 + Math.sin(state.clock.elapsedTime * 30) * 0.5) : 0;
  });
  return (
    <mesh ref={ref} position={[x, 5, z]} rotation={[0, 0, 0.15]}>
      <boxGeometry args={[0.06, 10, 0.04]} />
      <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={1.5} transparent opacity={0.9} />
    </mesh>
  );
}

function DroneChallengeCourse({ obstacles }) {
  const rings = obstacles.filter(o => o.type === 'ring');
  const cols = obstacles.filter(o => o.r && !o.type);
  // Moving asteroid field
  const ACOUNT = 10;
  const asteroids = useMemo(() => Array.from({length:ACOUNT}, (_,i) => ({
    x: (Math.random()-0.5)*18, z: (Math.random()-0.5)*18, y: 1+Math.random()*4,
    vx: (Math.random()-0.5)*2.2, vz: (Math.random()-0.5)*2.2,
    r: 0.3+Math.random()*0.5, rx: Math.random()*0.7, rz: Math.random()*0.7,
    color: `hsl(${20+Math.random()*20},${15+Math.random()*15}%,${28+Math.random()*20}%)`,
  })), []);
  const aState = useRef(asteroids.map(a => ({x:a.x,z:a.z,vx:a.vx,vz:a.vz})));
  const aRefs = useRef(asteroids.map(()=>null));
  useFrame((_,dt) => {
    const BOUND = 10;
    aState.current.forEach((p,i) => {
      p.x += p.vx*dt; p.z += p.vz*dt;
      if(Math.abs(p.x)>BOUND){p.vx*=-1;p.x=Math.sign(p.x)*BOUND;}
      if(Math.abs(p.z)>BOUND){p.vz*=-1;p.z=Math.sign(p.z)*BOUND;}
      const m = aRefs.current[i];
      if(m){m.position.set(p.x, asteroids[i].y, p.z); m.rotation.x+=dt*asteroids[i].rx; m.rotation.z+=dt*asteroids[i].rz;}
    });
  });
  return (
    <>
      {/* Dark storm-lit ground far below */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-12,0]}>
        <planeGeometry args={[80,80]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} />
      </mesh>
      {/* Storm clouds */}
      {[[-4,8,-5],[4,9,-4],[-2,10,4],[5,8,3],[-6,7,0],[0,11,-6],[3,9,6]].map(([x,y,z],i) => (
        <StormCloud key={i} x={x} y={y} z={z} />
      ))}
      {/* Lightning bolts */}
      {[[-3,-5],[4,-3],[-5,4],[2,6]].map(([x,z],i) => <LightningBolt key={i} x={x} z={z} />)}
      {/* Moving asteroids */}
      {asteroids.map((a,i) => (
        <mesh key={i} ref={el=>{aRefs.current[i]=el;}} castShadow>
          <dodecahedronGeometry args={[a.r,0]} />
          <meshStandardMaterial color={a.color} roughness={0.88} metalness={0.15} />
        </mesh>
      ))}
      {/* Ring gates — orange danger color */}
      {rings.map((o,i) => (
        <group key={i} position={[o.x, o.y??4.5, o.z]}>
          <mesh rotation={[Math.PI/2,0,0]}>
            <torusGeometry args={[o.r??0.7, 0.1, 10, 32]} />
            <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.9} metalness={0.3} roughness={0.2} />
          </mesh>
          <pointLight color="#f97316" intensity={2} distance={6} decay={2} />
        </group>
      ))}
      {/* Rocky spire columns */}
      {cols.map((o,i) => (
        <mesh key={i} position={[o.x, o.r*1.2, o.z]} castShadow>
          <cylinderGeometry args={[o.r*0.6, o.r*0.9, o.r*2.4, 7]} />
          <meshStandardMaterial color="#1e2940" roughness={0.92} metalness={0.2} />
        </mesh>
      ))}
      {/* Speed boost pads */}
      {[[-3,4],[3,-3],[0,0]].map(([x,z],i) => (
        <mesh key={`sp-${i}`} rotation={[-Math.PI/2,0,0]} position={[x,0.01,z]}>
          <circleGeometry args={[0.6,12]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
      ))}
      <ambientLight color="#080e18" intensity={0.8} />
      <pointLight position={[0,10,0]} color="#60a5fa" intensity={3} distance={35} decay={2} />
      <pointLight position={[-7,5,-4]} color="#1d4ed8" intensity={2} distance={18} decay={2} />
      <directionalLight position={[5,14,-5]} color="#a0c0e8" intensity={1.5} castShadow />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// DRONE — TIER 3-4  ·  Deep Space / Infinite Race
// Moving asteroid field + enemy drone squadron pursuing + nebula glow
// ════════════════════════════════════════════════════════════════════════

function EnemyDronePursuer({ startX, startZ, speed, color, arenaId }) {
  const pos = useRef({ x: startX, z: startZ });
  const ref = useRef();
  useFrame((state, dt) => {
    const { x: rx, z: rz } = robotPosTracker;
    const dx = rx - pos.current.x; const dz = rz - pos.current.z;
    const dist = Math.hypot(dx, dz) || 1;
    pos.current.x += (dx/dist)*speed*dt;
    pos.current.z += (dz/dist)*speed*dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 2.5+Math.sin(state.clock.elapsedTime*3+startX)*0.4, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
  });
  return (
    <group ref={ref}>
      <mesh><boxGeometry args={[0.5,0.1,0.5]} /><meshStandardMaterial color="#1a1a2e" emissive={color} emissiveIntensity={0.4} metalness={0.7} roughness={0.2} /></mesh>
      <mesh position={[0.3,0,0.3]}><cylinderGeometry args={[0.1,0.1,0.06,8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} /></mesh>
      <mesh position={[-0.3,0,0.3]}><cylinderGeometry args={[0.1,0.1,0.06,8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} /></mesh>
      <mesh position={[0.3,0,-0.3]}><cylinderGeometry args={[0.1,0.1,0.06,8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} /></mesh>
      <mesh position={[-0.3,0,-0.3]}><cylinderGeometry args={[0.1,0.1,0.06,8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} /></mesh>
      <pointLight color={color} intensity={1.5} distance={5} decay={2} />
    </group>
  );
}

function DroneEpicCourse({ obstacles }) {
  const rings = obstacles.filter(o => o.type === 'ring');
  const cols = obstacles.filter(o => o.r && !o.type);
  // Asteroid field
  const ACOUNT = 14;
  const asteroids = useMemo(() => Array.from({length:ACOUNT}, (_,i) => ({
    x: (Math.random()-0.5)*20, z: (Math.random()-0.5)*20, y: 2+Math.random()*6,
    vx: (Math.random()-0.5)*1.8, vz: (Math.random()-0.5)*1.8,
    r: 0.25+Math.random()*0.65, rx: Math.random()*0.6, rz: Math.random()*0.6,
    color: `hsl(${240+Math.random()*40},${20+Math.random()*20}%,${20+Math.random()*20}%)`,
  })), []);
  const aState = useRef(asteroids.map(a=>({x:a.x,z:a.z,vx:a.vx,vz:a.vz})));
  const aRefs = useRef(asteroids.map(()=>null));
  useFrame((_,dt) => {
    const BOUND=12;
    aState.current.forEach((p,i)=>{
      p.x+=p.vx*dt; p.z+=p.vz*dt;
      if(Math.abs(p.x)>BOUND){p.vx*=-1;p.x=Math.sign(p.x)*BOUND;}
      if(Math.abs(p.z)>BOUND){p.vz*=-1;p.z=Math.sign(p.z)*BOUND;}
      const m=aRefs.current[i];
      if(m){m.position.set(p.x,asteroids[i].y,p.z);m.rotation.x+=dt*asteroids[i].rx;m.rotation.z+=dt*asteroids[i].rz;}
    });
  });
  const enemyDrones = useMemo(() => [
    {startX:8,startZ:-7,speed:1.8,color:'#818cf8',arenaId:'d1'},
    {startX:-8,startZ:6,speed:2.1,color:'#a78bfa',arenaId:'d2'},
    {startX:0,startZ:-9,speed:1.6,color:'#6366f1',arenaId:'d3'},
  ], []);
  return (
    <>
      {/* Deep space void */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-10,0]}>
        <planeGeometry args={[100,100]} />
        <meshStandardMaterial color="#01000a" roughness={0.9} />
      </mesh>
      {/* Star field */}
      {Array.from({length:80},(_,i)=>{
        const px=(Math.random()-0.5)*50, pz=(Math.random()-0.5)*50, py=-9.95+Math.random()*0.1;
        return <mesh key={`star-${i}`} rotation={[-Math.PI/2,0,0]} position={[px,py,pz]}><circleGeometry args={[0.04+Math.random()*0.06,6]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.3+Math.random()*0.6} /></mesh>;
      })}
      {/* Nebula smears */}
      {[[-8,0.5,-6,'#4f46e5'],[6,0.5,5,'#7c3aed'],[0,0.5,-10,'#2563eb'],[-5,0.5,7,'#6d28d9']].map(([x,y,z,c],i) => (
        <mesh key={`neb-${i}`} rotation={[-Math.PI/2,0,0]} position={[x,y,z]}>
          <circleGeometry args={[4+i,20]} />
          <meshBasicMaterial color={c} transparent opacity={0.1} />
        </mesh>
      ))}
      {/* Moving asteroids */}
      {asteroids.map((a,i) => (
        <mesh key={i} ref={el=>{aRefs.current[i]=el;}} castShadow>
          <dodecahedronGeometry args={[a.r,0]} />
          <meshStandardMaterial color={a.color} roughness={0.88} metalness={0.25} />
        </mesh>
      ))}
      {/* Epic holographic ring gates */}
      {rings.map((o,i) => {
        const colors=['#818cf8','#a78bfa','#6366f1','#7c3aed','#4f46e5'];
        const c=colors[i%colors.length];
        return (
          <group key={i} position={[o.x, o.y??5, o.z]}>
            <mesh rotation={[Math.PI/2,0,0]}>
              <torusGeometry args={[o.r??0.7, 0.1, 12, 40]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.0} metalness={0.3} roughness={0.1} />
            </mesh>
            <mesh rotation={[Math.PI/2,0,0]}>
              <circleGeometry args={[o.r??0.7, 36]} />
              <meshBasicMaterial color={c} transparent opacity={0.07} />
            </mesh>
            <pointLight color={c} intensity={2.5} distance={7} decay={2} />
          </group>
        );
      })}
      {/* Asteroid-pillar obstacles */}
      {cols.map((o,i) => (
        <mesh key={i} position={[o.x,o.r,o.z]} castShadow>
          <dodecahedronGeometry args={[o.r*0.9,1]} />
          <meshStandardMaterial color="#1a1428" roughness={0.85} metalness={0.4} emissive="#4f46e5" emissiveIntensity={0.1} />
        </mesh>
      ))}
      {/* Enemy pursuer drones */}
      {enemyDrones.map((cfg,i) => <EnemyDronePursuer key={i} {...cfg} />)}
      {/* Star collectibles */}
      {[[3,4,-4],[-3,5,3],[0,6,-6],[5,4,4],[-5,5,-3]].map((p,i) => (
        <GemCollectible key={i} position={p} color={['#818cf8','#a78bfa','#6366f1','#c084fc','#e879f9'][i]} />
      ))}
      {/* Wormhole portal destination */}
      <group position={[0,3,8]}>
        <mesh rotation={[Math.PI/2,0,0]}>
          <torusGeometry args={[2,0.15,16,48]} />
          <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={1.2} />
        </mesh>
        <mesh rotation={[Math.PI/2,0,0]}>
          <circleGeometry args={[2,40]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.12} />
        </mesh>
        <pointLight color="#6366f1" intensity={5} distance={15} decay={2} />
      </group>
      <ambientLight color="#02010a" intensity={0.6} />
      <pointLight position={[0,14,0]} color="#6366f1" intensity={5} distance={50} decay={2} />
      <pointLight position={[-10,6,-6]} color="#7c3aed" intensity={3} distance={25} decay={2} />
      <pointLight position={[10,5,6]} color="#ec4899" intensity={2.5} distance={20} decay={2} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// HEAVY — TIER 1  ·  Training Yard / Basics
// Safety-striped floor + glowing cargo collectibles + score targets
// ════════════════════════════════════════════════════════════════════════

function SafetyStripe({ x1, z1, x2, z2 }) {
  const dx=x2-x1, dz=z2-z1, len=Math.hypot(dx,dz), cx=(x1+x2)/2, cz=(z1+z2)/2;
  return (
    <mesh rotation={[-Math.PI/2, Math.atan2(dx,dz), 0]} position={[cx,0.007,cz]}>
      <planeGeometry args={[0.35, len]} />
      <meshStandardMaterial color="#fbbf24" transparent opacity={0.7} />
    </mesh>
  );
}

function PulsingScoreTarget({ position, color='#ef4444' }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime*3+position[0])*0.35;
    ref.current.rotation.y = state.clock.elapsedTime*0.8;
  });
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
        <ringGeometry args={[0.35,0.6,24]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <mesh ref={ref} position={[0,1.1,0]} castShadow>
        <dodecahedronGeometry args={[0.28,0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.5} roughness={0.2} />
      </mesh>
      <pointLight position={[0,1.2,0]} color={color} intensity={1} distance={4} decay={2} />
    </group>
  );
}

function HeavyBasicsCourse({ obstacles }) {
  return (
    <>
      {/* Concrete training yard floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[34,34]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Safety stripe grid */}
      {[[-6,0,6,0],[-6,-3,6,-3],[-6,3,6,3],[0,-6,0,6],[-3,-6,-3,6],[3,-6,3,6]].map(([x1,z1,x2,z2],i) => (
        <SafetyStripe key={i} x1={x1} z1={z1} x2={x2} z2={z2} />
      ))}
      {/* Safety cones */}
      {[[-3,-3],[3,-4],[-4,3],[4,4],[0,-6],[-5,0],[5,0],[0,6]].map(([x,z],i) => (
        <group key={i} position={[x,0,z]}>
          <mesh castShadow position={[0,0.25,0]}><coneGeometry args={[0.15,0.5,6]} /><meshStandardMaterial color="#f97316" roughness={0.75} /></mesh>
          <mesh position={[0,0.14,0]}><torusGeometry args={[0.16,0.035,6,12]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[0,0.28,0]}><torusGeometry args={[0.13,0.03,6,12]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
      ))}
      {/* Shelving racks */}
      {[[-5,-4],[5,-3],[-5,4],[5,3]].map(([x,z],i) => (
        <group key={`rack-${i}`} position={[x,0,z]}>
          {[-0.5,0.5].map((dx,j)=><mesh key={j} position={[dx,2,0]} castShadow><boxGeometry args={[0.06,4,0.05]} /><meshStandardMaterial color="#374151" metalness={0.7} /></mesh>)}
          {[1,2,3].map(j=><mesh key={`s-${j}`} position={[0,j*1.1,0]} castShadow><boxGeometry args={[1.1,0.06,0.55]} /><meshStandardMaterial color="#4b5563" metalness={0.6} /></mesh>)}
        </group>
      ))}
      {/* Obstacle pillars */}
      {obstacles.filter(o=>o.r&&!o.type).map((o,i)=>(
        <group key={i} position={[o.x,0,o.z]}>
          <mesh castShadow position={[0,o.r,0]}><cylinderGeometry args={[o.r*0.8,o.r,o.r*2,12]} /><meshStandardMaterial color="#6b7280" roughness={0.85} metalness={0.2} /></mesh>
          <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}><ringGeometry args={[o.r*0.9,o.r*1.5,20]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0.35} /></mesh>
        </group>
      ))}
      {/* Obstacle walls */}
      {obstacles.filter(o=>o.type==='wall').map((o,i)=>(
        <mesh key={i} position={[o.x,0.55,o.z]} castShadow>
          <boxGeometry args={[o.w,1.1,o.h]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.85} />
        </mesh>
      ))}
      {/* Score target collectibles */}
      {[[-3,0,-4],[3,0,-2],[0,0,4],[-4,0,2],[4,0,3]].map((p,i)=>(
        <PulsingScoreTarget key={i} position={p} color={['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7'][i]} />
      ))}
      {/* Forklift path markings */}
      {[-7,-3.5,0,3.5,7].map((z,i)=>(
        <mesh key={`lane-${i}`} rotation={[-Math.PI/2,0,0]} position={[0,0.005,z]}>
          <planeGeometry args={[20,0.12]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.45} />
        </mesh>
      ))}
      {/* Ceiling rig lights */}
      {[[-4,-4],[4,-4],[-4,4],[4,4],[0,0]].map(([x,z],i)=>(
        <group key={`lgt-${i}`} position={[x,6,z]}>
          <mesh><boxGeometry args={[0.25,0.25,0.25]} /><meshStandardMaterial color="#374155" metalness={0.7} /></mesh>
          <pointLight color="#fffde0" intensity={4} distance={12} decay={2} />
        </group>
      ))}
      <ambientLight color="#c0c8d0" intensity={1.1} />
      <directionalLight position={[8,14,5]} color="#fff8e8" intensity={2.0} castShadow />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// HEAVY — TIER 2-3  ·  Mining / Construction / Urban
// Animated conveyor belt + swinging crane arm + moving excavator obstacle
// ════════════════════════════════════════════════════════════════════════

function ConveyorBelt({ x, z, len = 6, angle = 0 }) {
  const texRef = useRef();
  useFrame((state) => {
    // Scroll the belt by animating emissive pulse along it
    if (texRef.current) texRef.current.material.emissiveIntensity = 0.12 + Math.sin(state.clock.elapsedTime * 4) * 0.06;
  });
  return (
    <group position={[x, 0.08, z]} rotation={[0, angle, 0]}>
      <mesh ref={texRef} castShadow>
        <boxGeometry args={[1.4, 0.16, len]} />
        <meshStandardMaterial color="#374151" emissive="#1e293b" emissiveIntensity={0.12} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Belt slat lines */}
      {Array.from({length:Math.floor(len/0.5)},(_,i)=>(
        <mesh key={i} position={[0,0.09,(i-(len/0.5/2))*0.5]}>
          <boxGeometry args={[1.45,0.04,0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* Rollers at ends */}
      {[-len/2, len/2].map((dz,i)=>(
        <mesh key={i} position={[0,0,dz]} rotation={[Math.PI/2,0,0]}>
          <cylinderGeometry args={[0.2,0.2,1.5,12]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function SwingingCrane({ x, z }) {
  const armRef = useRef();
  useFrame((state) => {
    if (!armRef.current) return;
    armRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * Math.PI * 0.4;
  });
  return (
    <group position={[x, 0, z]}>
      {/* Crane tower */}
      <mesh position={[0,3.5,0]} castShadow>
        <boxGeometry args={[0.4,7,0.4]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Rotating boom */}
      <group ref={armRef} position={[0,6.5,0]}>
        <mesh position={[2.5,0,0]} castShadow>
          <boxGeometry args={[5,0.2,0.2]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Hanging cable + hook */}
        <mesh position={[4.5,-1.5,0]}>
          <cylinderGeometry args={[0.03,0.03,3,6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[4.5,-3.1,0]}>
          <boxGeometry args={[0.4,0.3,0.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      <pointLight position={[0,7,0]} color="#fbbf24" intensity={2} distance={12} decay={2} />
    </group>
  );
}

function HeavyAdvancedCourse({ obstacles }) {
  return (
    <>
      {/* Mining/construction site floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[36,36]} />
        <meshStandardMaterial color="#78716c" roughness={0.94} metalness={0.1} />
      </mesh>
      {/* Tire track marks */}
      {[-3,0,3].map((z,i)=>(
        <mesh key={`tr-${i}`} rotation={[-Math.PI/2,0,0]} position={[0,0.005,z]}>
          <planeGeometry args={[22,0.45]} />
          <meshStandardMaterial color="#5c534e" roughness={0.95} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Conveyor belts */}
      <ConveyorBelt x={-5} z={0} len={6} angle={Math.PI/2} />
      <ConveyorBelt x={5} z={-2} len={5} angle={0} />
      {/* Swinging cranes */}
      <SwingingCrane x={-7} z={-6} />
      <SwingingCrane x={7} z={5} />
      {/* Ore pile obstacles */}
      {obstacles.filter(o=>o.r&&!o.type).map((o,i)=>(
        <group key={i} position={[o.x,0,o.z]}>
          <mesh castShadow position={[0,o.r*0.55,0]}>
            <dodecahedronGeometry args={[o.r*0.85,0]} />
            <meshStandardMaterial color="#57534e" roughness={0.9} metalness={0.2} />
          </mesh>
          {/* Glowing ore veins */}
          <mesh position={[0,o.r*0.3,0]}>
            <sphereGeometry args={[o.r*0.35,8,8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} metalness={0.3} roughness={0.3} />
          </mesh>
          <PulseRing position={[0,0.04,0]} color="#f59e0b" scale={o.r*1.6} />
        </group>
      ))}
      {/* Barrier walls */}
      {obstacles.filter(o=>o.type==='wall').map((o,i)=>(
        <mesh key={i} position={[o.x,0.7,o.z]} castShadow>
          <boxGeometry args={[o.w,1.4,o.h]} />
          <meshStandardMaterial color="#374151" roughness={0.85} metalness={0.3} emissive="#1f2937" emissiveIntensity={0.07} />
        </mesh>
      ))}
      {/* Cargo crate collectibles */}
      {[[-3,0,-5],[4,0,-2],[0,0,5],[-4,0,3],[5,0,2]].map((p,i)=>(
        <GemCollectible key={i} position={p} color={['#fbbf24','#f97316','#22c55e','#60a5fa','#f472b6'][i]} size={0.26} />
      ))}
      {/* Site lighting poles */}
      {[[-7,-6],[7,-5],[-7,5],[7,4]].map(([x,z],i)=>(
        <group key={`pole-${i}`} position={[x,0,z]}>
          <mesh castShadow position={[0,3.5,0]}><cylinderGeometry args={[0.06,0.08,7,8]} /><meshStandardMaterial color="#374151" metalness={0.6} /></mesh>
          <pointLight position={[0,7,0]} color="#ffeebb" intensity={4} distance={14} decay={2} />
        </group>
      ))}
      <ambientLight color="#a09080" intensity={1.0} />
      <directionalLight position={[8,14,4]} color="#ffe8c8" intensity={1.8} castShadow />
      <pointLight position={[0,8,0]} color="#f59e0b" intensity={2.5} distance={28} decay={2} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// HEAVY — TIER 4  ·  Boss Megabuild / Volcanic Epic
// Giant boss robot chasing + lava rivers + erupting pillars
// ════════════════════════════════════════════════════════════════════════

function GiantBossRobot({ arenaId }) {
  const pos = useRef({ x: 7, z: -6 });
  const ref = useRef();
  useFrame((_, dt) => {
    const { x: rx, z: rz } = robotPosTracker;
    const dx = rx - pos.current.x; const dz = rz - pos.current.z;
    const dist = Math.hypot(dx, dz) || 1;
    pos.current.x += (dx/dist)*1.3*dt; pos.current.z += (dz/dist)*1.3*dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 0, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    setDynamicObstacles(arenaId, [{ x: pos.current.x, z: pos.current.z, r: 0.9 }]);
  });
  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0,1.2,0]} castShadow>
        <boxGeometry args={[1.2,1.4,0.9]} />
        <meshStandardMaterial color="#374151" emissive="#dc2626" emissiveIntensity={0.3} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0,2.3,0]} castShadow>
        <boxGeometry args={[0.9,0.8,0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} emissive="#ef4444" emissiveIntensity={0.4} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.2,2.5,0.41]}><sphereGeometry args={[0.12,8,8]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} /></mesh>
      <mesh position={[-0.2,2.5,0.41]}><sphereGeometry args={[0.12,8,8]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} /></mesh>
      {/* Arms */}
      {[-0.85,0.85].map((dx,i)=>(
        <mesh key={i} position={[dx,1.1,0]} castShadow>
          <boxGeometry args={[0.4,1.1,0.4]} />
          <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* Legs */}
      {[-0.35,0.35].map((dx,i)=>(
        <mesh key={i} position={[dx,0.3,0]} castShadow>
          <boxGeometry args={[0.35,0.6,0.35]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <pointLight color="#ef4444" intensity={4} distance={8} decay={2} />
    </group>
  );
}

function HeavyEpicCourse({ obstacles }) {
  return (
    <>
      {/* Scorched volcanic floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[42,42]} />
        <meshStandardMaterial color="#1a0a04" roughness={0.88} metalness={0.18} />
      </mesh>
      {/* Lava river channels */}
      {[[-7,0,14,0],[0,-7,0,14],[-4,-4,8,0],[4,-4,8,0]].map(([x,z,len,ang],i)=>(
        <group key={`lava-${i}`} position={[x,0.01,z]} rotation={[0,ang,0]}>
          <mesh rotation={[-Math.PI/2,0,0]}>
            <planeGeometry args={[1.2,len]} />
            <meshStandardMaterial color="#ff2200" emissive="#ff1100" emissiveIntensity={0.9} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
      {/* Lava cracks */}
      {[[-3,-4,4,0.3],[2,3,3,0.7],[-1,5,3.5,0.1],[4,-2,2.5,1.2],[-5,1,3,0.5]].map(([x,z,l,a],i)=>(
        <LavaCrack key={i} x={x} z={z} len={l} angle={a} />
      ))}
      {/* Erupting lava pillars */}
      {[[-4,-5],[4,-4],[-5,4],[4,5],[0,-7],[0,7]].map(([x,z],i)=>(
        <LavaGeyser key={i} x={x} z={z} />
      ))}
      {/* Massive structural columns */}
      {obstacles.filter(o=>o.r&&!o.type).map((o,i)=>(
        <group key={i} position={[o.x,0,o.z]}>
          <mesh castShadow position={[0,o.r+0.6,0]}>
            <cylinderGeometry args={[o.r*0.75,o.r*0.95,(o.r+0.6)*2+0.5,10]} />
            <meshStandardMaterial color="#2d1408" roughness={0.85} metalness={0.35} emissive="#8b2000" emissiveIntensity={0.2} />
          </mesh>
          <pointLight color="#ff3300" intensity={2} distance={7} decay={2} />
          <PulseRing position={[0,0.04,0]} color="#ef4444" scale={o.r*2.0} />
        </group>
      ))}
      {/* Boss arena walls */}
      {obstacles.filter(o=>o.type==='wall').map((o,i)=>(
        <mesh key={i} position={[o.x,1.5,o.z]} castShadow>
          <boxGeometry args={[o.w,3,o.h]} />
          <meshStandardMaterial color="#1a0a04" roughness={0.85} metalness={0.3} emissive="#8b0000" emissiveIntensity={0.12} />
        </mesh>
      ))}
      {/* Giant boss robot */}
      <GiantBossRobot arenaId="heavy_epic_boss" />
      {/* Legendary gem collectibles */}
      {[[-3,0,-5],[4,0,-3],[0,0,6],[3,0,5],[-4,0,3]].map((p,i)=>(
        <GemCollectible key={i} position={p} color={['#fbbf24','#f97316','#ef4444','#a78bfa','#f472b6'][i]} />
      ))}
      {/* Boss arena epic pillars with fire crowns */}
      {[[-6,-6],[6,-6],[-6,6],[6,6]].map(([x,z],i)=>(
        <group key={`bp-${i}`} position={[x,0,z]}>
          <mesh castShadow><cylinderGeometry args={[0.55,0.7,6,10]} /><meshStandardMaterial color="#2d1208" metalness={0.5} roughness={0.5} /></mesh>
          <Torch position={[0,6.3,0]} />
        </group>
      ))}
      <ambientLight color="#180a04" intensity={0.8} />
      <pointLight position={[0,12,0]} color="#ef4444" intensity={7} distance={45} decay={2} />
      <pointLight position={[-7,5,-5]} color="#dc2626" intensity={3.5} distance={22} decay={2} />
      <pointLight position={[7,4,5]} color="#f97316" intensity={3} distance={20} decay={2} />
    </>
  );
}

// ── Ninja drone courses ───────────────────────────────────────────────

// ── Ninja dojo sub-components ──────────────────────────────────────────
function BlossomPetal({ startX, startZ, delay }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime + delay) % 6;
    ref.current.position.set(
      startX + Math.sin(t * 0.8 + delay) * 1.2,
      8 - t * 1.3,
      startZ + Math.cos(t * 0.6 + delay) * 0.9,
    );
    ref.current.rotation.z = t * 2.1;
    ref.current.rotation.x = t * 1.4;
  });
  return (
    <mesh ref={ref} position={[startX, 8, startZ]}>
      <circleGeometry args={[0.06, 5]} />
      <meshBasicMaterial color="#ffb7c5" transparent opacity={0.85} side={2} />
    </mesh>
  );
}

function SpinningTarget({ position }) {
  const diskRef = useRef();
  useFrame((state) => {
    if (diskRef.current) diskRef.current.rotation.z = state.clock.elapsedTime * 2.2;
  });
  return (
    <group position={position}>
      {/* post */}
      <mesh castShadow position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 1.2, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* spinning disc stack */}
      <group ref={diskRef}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.55, 0.06, 24]} />
          <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.06, 24]} />
          <meshStandardMaterial color="#f5f5f5" emissive="#e5e5e5" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
          <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.06, 12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} />
        </mesh>
      </group>
      <pointLight position={[0, 0.5, 0]} color="#fbbf24" intensity={0.8} distance={4} decay={2} />
    </group>
  );
}

function DojoPunchBag({ position }) {
  const bagRef = useRef();
  useFrame((state) => {
    if (!bagRef.current) return;
    bagRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.8) * 0.12;
    bagRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.3 + 1) * 0.06;
  });
  return (
    <group position={position}>
      {/* chain */}
      {[0,0.15,0.30].map((dy, i) => (
        <mesh key={i} position={[0, 1.6 - dy, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <group ref={bagRef} position={[0, 0.9, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.22, 1.1, 14]} />
          <meshStandardMaterial color="#1e1010" roughness={0.9} metalness={0.1} />
        </mesh>
        {/* tape stripes */}
        {[-0.3, 0, 0.3].map((dy, i) => (
          <mesh key={i} position={[0, dy, 0]}>
            <cylinderGeometry args={[0.225, 0.225, 0.05, 14]} />
            <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DojoGuardBot({ arenaId }) {
  const pos = useRef({ x: -5, z: -3 });
  const ref = useRef();
  const waypoints = useMemo(() => [[-5,-3],[5,-3],[5,3],[-5,3]], []);
  const wpIdx = useRef(0);
  useFrame((_, dt) => {
    const [tx, tz] = waypoints[wpIdx.current];
    const dx = tx - pos.current.x; const dz = tz - pos.current.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.3) { wpIdx.current = (wpIdx.current + 1) % waypoints.length; return; }
    pos.current.x += (dx / dist) * 2.0 * dt;
    pos.current.z += (dz / dist) * 2.0 * dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 0, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    setDynamicObstacles(arenaId, [{ x: pos.current.x, z: pos.current.z, r: 0.45 }]);
  });
  return (
    <group ref={ref} position={[-5, 0, -3]}>
      {/* body */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[0.4, 0.55, 0.28]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#16213e" emissiveIntensity={0.3} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[0.28, 0.22, 0.22]} />
        <meshStandardMaterial color="#0f3460" emissive="#16213e" emissiveIntensity={0.4} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* eyes */}
      <mesh position={[0.07, 1.12, 0.11]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[-0.07, 1.12, 0.11]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2.5} />
      </mesh>
      {/* legs */}
      {[[-0.12,0],[0.12,0]].map(([lx],li) => (
        <mesh key={li} castShadow position={[lx, 0.22, 0]}>
          <boxGeometry args={[0.12, 0.44, 0.15]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <pointLight color="#00ffaa" intensity={1.2} distance={4} decay={2} />
    </group>
  );
}

function NinjaTrainingCourse({ obstacles }) {
  const arenaId = 'ninja_training';
  const petalSeeds = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    x: (Math.sin(i * 2.3) * 7),
    z: (Math.cos(i * 1.7) * 7),
    delay: i * 0.4,
  })), []);
  return (
    <>
      {/* Tatami-style dojo floor — alternating panel tiles */}
      {Array.from({ length: 7 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => {
          const fx = (col - 3) * 2.6; const fz = (row - 3) * 2.6;
          const even = (row + col) % 2 === 0;
          return (
            <mesh key={`${row}-${col}`} rotation={[-Math.PI/2,0,0]} position={[fx,0.001,fz]} receiveShadow>
              <planeGeometry args={[2.55, 2.55]} />
              <meshStandardMaterial color={even ? '#2a1e10' : '#241a0d'} roughness={0.92} metalness={0.04} />
            </mesh>
          );
        })
      )}
      {/* border frame */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a1208" roughness={0.95} />
      </mesh>

      {/* Bamboo posts — perimeter */}
      {[[-6,-6],[-3,-6],[0,-6],[3,-6],[6,-6],
        [-6,6],[-3,6],[0,6],[3,6],[6,6],
        [-6,-3],[-6,0],[-6,3],[6,-3],[6,0],[6,3]].map(([x,z],i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.08, 4.5, 8]} />
            <meshStandardMaterial color="#5a7a2a" roughness={0.85} />
          </mesh>
          {/* bamboo nodes */}
          {[0.8, 1.8, 2.8, 3.8].map((ny,ni) => (
            <mesh key={ni} position={[0, ny - 2.25 + 0.5, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.08, 8]} />
              <meshStandardMaterial color="#4a6a1e" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Hanging paper lanterns */}
      {[[-4,3.5,-1],[0,3.5,-5],[4,3.5,2],[-2,3.5,5],[3,3.5,-5]].map((pos,i) => (
        <PaperLantern key={i} position={pos} color={['#ff6b35','#ff3388','#ffaa00','#ff6b35','#cc0044'][i]} />
      ))}

      {/* Cherry blossom petals */}
      {petalSeeds.map((s, i) => (
        <BlossomPetal key={i} startX={s.x} startZ={s.z} delay={s.delay} />
      ))}

      {/* Cherry blossom tree */}
      <group position={[-7, 0, -7]}>
        <mesh castShadow position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 3.6, 7]} />
          <meshStandardMaterial color="#3d1e0a" roughness={0.9} />
        </mesh>
        {[[0,3.2,0],[0.6,2.8,0.5],[-0.5,2.6,-0.4],[0.3,3.5,-0.5]].map((bp,bi) => (
          <mesh key={bi} position={bp} castShadow>
            <sphereGeometry args={[0.7 + bi*0.1, 10, 10]} />
            <meshStandardMaterial color="#e75480" emissive="#c0306a" emissiveIntensity={0.25} roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* Spinning target boards */}
      {[[-4,0.8,-4],[4,0.8,-5],[-5,0.8,4],[4,0.8,4],[0,0.8,-7]].map((pos,i) => (
        <SpinningTarget key={i} position={pos} />
      ))}

      {/* Punch bag in corner */}
      <DojoPunchBag position={[6, 0, 6]} />

      {/* Dojo entrance gate (torii style) */}
      <group position={[0, 0, -8]}>
        {/* pillars */}
        {[-1.2, 1.2].map((px, pi) => (
          <mesh key={pi} castShadow position={[px, 1.8, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 3.6, 10]} />
            <meshStandardMaterial color="#8b0000" emissive="#4a0000" emissiveIntensity={0.3} metalness={0.2} roughness={0.7} />
          </mesh>
        ))}
        {/* crossbeam */}
        <mesh castShadow position={[0, 3.8, 0]}>
          <boxGeometry args={[3.0, 0.18, 0.16]} />
          <meshStandardMaterial color="#8b0000" emissive="#4a0000" emissiveIntensity={0.3} metalness={0.2} roughness={0.7} />
        </mesh>
        {/* second crossbeam */}
        <mesh castShadow position={[0, 3.45, 0]}>
          <boxGeometry args={[2.6, 0.12, 0.14]} />
          <meshStandardMaterial color="#8b0000" emissive="#4a0000" emissiveIntensity={0.3} metalness={0.2} roughness={0.7} />
        </mesh>
      </group>

      {/* Training mat markings */}
      {[[-2.5,0,-2.5],[2.5,0,-2.5],[-2.5,0,2.5],[2.5,0,2.5]].map(([x,y,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,0.002,z]}>
          <ringGeometry args={[0.6, 0.7, 20]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Guard bot patrolling */}
      <DojoGuardBot arenaId={arenaId} />

      {/* Score gems */}
      {[[-3,0.6,-7],[3,0.6,-7],[0,0.6,7],[-6,0.6,0],[6,0.6,0]].map((pos,i) => (
        <GemCollectible key={i} position={pos} color={['#ffd700','#ff3399','#00ffaa','#ff6600','#00ccff'][i]} />
      ))}

      {/* Start PulseRing */}
      <PulseRing position={[0, 0.05, 8]} color="#22d3ee" scale={1.4} />

      {/* Finish arch */}
      <group position={[0, 0, -9]}>
        <mesh position={[0, 2.2, 0]}>
          <torusGeometry args={[1.1, 0.1, 10, 28, Math.PI]} />
          <meshStandardMaterial color="#ffd700" emissive="#c09000" emissiveIntensity={0.7} metalness={0.6} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} color="#ffd700" intensity={2.5} distance={8} decay={2} />
      </group>

      {/* Atmosphere — warm amber dojo lighting */}
      <ambientLight color="#1a0e08" intensity={0.9} />
      <pointLight position={[0, 6, 0]} color="#ff8c35" intensity={3} distance={24} decay={2} />
      <pointLight position={[-5, 4, -5]} color="#ff3388" intensity={1.5} distance={14} decay={2} />
      <pointLight position={[5, 4, 5]} color="#ffaa00" intensity={1.5} distance={14} decay={2} />
      <directionalLight position={[6, 14, -4]} color="#fff0d8" intensity={1.2} castShadow />
    </>
  );
}

// ── Ninja city-ops sub-components ──────────────────────────────────────
function SweeepingAlarmLight({ position }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 1.4;
  });
  return (
    <group position={position}>
      {/* lamp housing */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.22, 12]} />
        <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.3} />
      </mesh>
      <group ref={ref}>
        <pointLight color="#ff3300" intensity={4} distance={14} decay={2} />
        {/* beam cone */}
        <mesh position={[0, -0.25, 0.5]} rotation={[Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.18, 1.0, 10, 1, true]} />
          <meshBasicMaterial color="#ff5500" transparent opacity={0.18} side={2} />
        </mesh>
      </group>
    </group>
  );
}

function RainStreak({ x, z, delay }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * 2.2 + delay) % 1;
    ref.current.position.y = 6 - t * 9;
    ref.current.material.opacity = 0.18 * (1 - Math.abs(t - 0.5) * 2);
  });
  return (
    <mesh ref={ref} position={[x, 6, z]}>
      <cylinderGeometry args={[0.008, 0.008, 0.55, 4]} />
      <meshBasicMaterial color="#8ab4cc" transparent opacity={0.18} />
    </mesh>
  );
}

function CityGuardBot({ arenaId, startX, startZ, waypointSet }) {
  const pos = useRef({ x: startX, z: startZ });
  const ref = useRef();
  const wpIdx = useRef(0);
  useFrame((_, dt) => {
    const [tx, tz] = waypointSet[wpIdx.current];
    const dx = tx - pos.current.x; const dz = tz - pos.current.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.3) { wpIdx.current = (wpIdx.current + 1) % waypointSet.length; return; }
    pos.current.x += (dx / dist) * 2.2 * dt;
    pos.current.z += (dz / dist) * 2.2 * dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 0, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    setDynamicObstacles(arenaId, [{ x: pos.current.x, z: pos.current.z, r: 0.5 }]);
  });
  return (
    <group ref={ref} position={[startX, 0, startZ]}>
      {/* armored body */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[0.48, 0.65, 0.32]} />
        <meshStandardMaterial color="#0a0a18" emissive="#14143a" emissiveIntensity={0.25} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* visor head */}
      <mesh castShadow position={[0, 1.18, 0]}>
        <boxGeometry args={[0.34, 0.24, 0.28]} />
        <meshStandardMaterial color="#060614" emissive="#0a0a20" emissiveIntensity={0.2} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* red visor strip */}
      <mesh position={[0, 1.18, 0.14]}>
        <boxGeometry args={[0.26, 0.06, 0.02]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={3.0} />
      </mesh>
      {/* legs */}
      {[[-0.14,0],[0.14,0]].map(([lx],li) => (
        <mesh key={li} castShadow position={[lx, 0.22, 0]}>
          <boxGeometry args={[0.14, 0.44, 0.18]} />
          <meshStandardMaterial color="#0a0a18" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <pointLight color="#ff2200" intensity={1.5} distance={5} decay={2} />
    </group>
  );
}

function NeonWindowGrid({ x, z, h, w }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.9]} />
        <meshStandardMaterial color="#070510" emissive="#0d0b1c" emissiveIntensity={0.06} metalness={0.6} roughness={0.5} />
      </mesh>
      {/* window rows */}
      {Array.from({ length: Math.floor(h / 1.2) }, (_, row) =>
        Array.from({ length: Math.floor(w / 0.8) }, (_, col) => {
          const wx = (col - Math.floor(w / 0.8) / 2 + 0.5) * 0.75;
          const wy = row * 1.1 - h * 0.35;
          const colors = ['#7c3aed','#3b82f6','#06b6d4','#8b5cf6'];
          const c = colors[(row * 3 + col) % colors.length];
          return (
            <mesh key={`${row}-${col}`} position={[wx, wy, 0.46]}>
              <planeGeometry args={[0.28, 0.36]} />
              <meshBasicMaterial color={c} transparent opacity={0.55 + (row % 2) * 0.2} />
            </mesh>
          );
        })
      )}
    </group>
  );
}

function StrobeLaserBarrier({ position, color = '#ff0088' }) {
  const ref = useRef();
  const lightRef = useRef();
  useFrame((state) => {
    const on = Math.sin(state.clock.elapsedTime * 8) > 0;
    if (ref.current) ref.current.visible = on;
    if (lightRef.current) lightRef.current.intensity = on ? 3 : 0;
  });
  return (
    <group position={position}>
      {/* emitter posts */}
      {[-0.8, 0.8].map((px, pi) => (
        <mesh key={pi} castShadow position={[px, 0.9, 0]}>
          <boxGeometry args={[0.12, 1.8, 0.12]} />
          <meshStandardMaterial color="#1a0020" emissive={color} emissiveIntensity={0.5} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      {/* laser beam */}
      <mesh ref={ref} position={[0, 0.9, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.6, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.9, 0]} color={color} intensity={3} distance={5} decay={2} />
    </group>
  );
}

function NinjaStrikeCourse({ obstacles }) {
  const arenaId = 'ninja_city_strike';
  const rainSeeds = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    x: (Math.sin(i * 1.9) * 9), z: (Math.cos(i * 2.3) * 9), delay: i * 0.18,
  })), []);
  return (
    <>
      {/* Dark wet city floor with puddle sheen */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#060408" roughness={0.12} metalness={0.82} />
      </mesh>
      {/* tile lines on road */}
      {[-6,-4,-2,0,2,4,6].map((x,i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x, 0.002, 0]}>
          <planeGeometry args={[0.04, 20]} />
          <meshBasicMaterial color="#1a1a2e" transparent opacity={0.5} />
        </mesh>
      ))}
      {[-6,-4,-2,0,2,4,6].map((z,i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[0, 0.002, z]}>
          <planeGeometry args={[20, 0.04]} />
          <meshBasicMaterial color="#1a1a2e" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* City building blocks — left side */}
      <NeonWindowGrid x={-8} z={-6} h={10} w={1.6} />
      <NeonWindowGrid x={-8} z={0} h={13} w={1.4} />
      <NeonWindowGrid x={-8} z={6} h={9} w={1.8} />
      {/* City building blocks — right side */}
      <NeonWindowGrid x={8} z={-5} h={12} w={1.5} />
      <NeonWindowGrid x={8} z={2} h={9} w={1.6} />
      <NeonWindowGrid x={8} z={7} h={14} w={1.3} />
      {/* Background buildings far */}
      <NeonWindowGrid x={-6} z={-9} h={7} w={3.0} />
      <NeonWindowGrid x={4} z={-10} h={8} w={2.5} />

      {/* Neon signs on buildings */}
      {[[-7.5, 5.5, -6], [-7.5, 6.0, 0], [7.5, 5.0, -5]].map(([sx,sy,sz],i) => (
        <mesh key={i} position={[sx, sy, sz]}>
          <boxGeometry args={[0.8, 0.2, 0.05]} />
          <meshStandardMaterial color={['#8b5cf6','#06b6d4','#ec4899'][i]} emissive={['#7c3aed','#0891b2','#db2777'][i]} emissiveIntensity={2.0} />
        </mesh>
      ))}

      {/* Sweeping alarm spotlights on building tops */}
      <SweeepingAlarmLight position={[-7.5, 10.5, -5]} />
      <SweeepingAlarmLight position={[7.5, 9.5, 1]} />

      {/* Strobe laser trip wires across lanes */}
      <StrobeLaserBarrier position={[-2, 0, -3]} color="#ff0088" />
      <StrobeLaserBarrier position={[3, 0, 0]} color="#ff0088" />
      <StrobeLaserBarrier position={[-1, 0, 4]} color="#ff0088" />
      <StrobeLaserBarrier position={[2, 0, -6]} color="#ff0088" />

      {/* Patrol guard bots */}
      <CityGuardBot arenaId={arenaId} startX={-4} startZ={-2}
        waypointSet={[[-4,-2],[4,-2],[4,2],[-4,2]]} />
      <CityGuardBot arenaId={arenaId} startX={0} startZ={5}
        waypointSet={[[0,5],[0,-5]]} />

      {/* Rain streaks */}
      {rainSeeds.map((s,i) => (
        <RainStreak key={i} x={s.x} z={s.z} delay={s.delay} />
      ))}

      {/* Score gems */}
      {[[-4,0.6,-6],[4,0.6,-5],[-5,0.6,5],[5,0.6,5],[0,0.6,-8]].map((pos,i) => (
        <GemCollectible key={i} position={pos} color={['#8b5cf6','#ec4899','#06b6d4','#a855f7','#3b82f6'][i]} />
      ))}

      {/* Start / finish */}
      <PulseRing position={[0, 0.05, 8]} color="#8b5cf6" scale={1.4} />
      <group position={[0, 0, -9.5]}>
        {[-1,1].map((px,pi) => (
          <mesh key={pi} castShadow position={[px*0.9, 2, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 4, 8]} />
            <meshStandardMaterial color="#1a0020" emissive="#8b5cf6" emissiveIntensity={0.6} metalness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 4.1, 0]}>
          <boxGeometry args={[2.2, 0.15, 0.14]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#7c3aed" emissiveIntensity={1.5} metalness={0.4} />
        </mesh>
        <pointLight position={[0, 4.1, 0]} color="#8b5cf6" intensity={3} distance={10} decay={2} />
      </group>

      {/* Atmosphere */}
      <ambientLight color="#04020c" intensity={0.7} />
      <pointLight position={[0, 10, 0]} color="#3b0080" intensity={4} distance={35} decay={2} />
      <pointLight position={[-6, 4, -4]} color="#0044ff" intensity={2} distance={18} decay={2} />
      <pointLight position={[6, 4, 3]} color="#8b5cf6" intensity={2} distance={18} decay={2} />
    </>
  );
}

// ── Ninja elite / black-ops sub-components ─────────────────────────────
function ElitePursuerDrone({ arenaId, startX, startZ, id }) {
  const pos = useRef({ x: startX, z: startZ });
  const ref = useRef();
  const rotorRefs = useRef([]);
  useFrame((state, dt) => {
    const { x: rx, z: rz } = robotPosTracker;
    const dx = rx - pos.current.x; const dz = rz - pos.current.z;
    const dist = Math.hypot(dx, dz) || 1;
    pos.current.x += (dx / dist) * 2.8 * dt;
    pos.current.z += (dz / dist) * 2.8 * dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 2.2, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    rotorRefs.current.forEach((r) => { if (r) r.rotation.y += 18 * dt; });
    setDynamicObstacles(arenaId, [{ x: pos.current.x, z: pos.current.z, r: 0.55, y: 2.2 }]);
  });
  return (
    <group ref={ref} position={[startX, 2.2, startZ]}>
      {/* body */}
      <mesh castShadow>
        <boxGeometry args={[0.38, 0.12, 0.38]} />
        <meshStandardMaterial color="#0a0010" emissive="#200040" emissiveIntensity={0.5} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* rotors on 4 arms */}
      {[[0.28,0,0.28],[0.28,0,-0.28],[-0.28,0,0.28],[-0.28,0,-0.28]].map(([ax,ay,az],ri) => (
        <group key={ri} position={[ax, ay, az]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 8]} />
            <meshStandardMaterial color="#111111" metalness={0.8} />
          </mesh>
          <mesh ref={(el) => { rotorRefs.current[id * 4 + ri] = el; }}>
            <cylinderGeometry args={[0.18, 0.18, 0.015, 6]} />
            <meshBasicMaterial color="#d946ef" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
      {/* eye sensor */}
      <mesh position={[0, -0.04, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={4} />
      </mesh>
      <pointLight color="#d946ef" intensity={2} distance={6} decay={2} />
    </group>
  );
}

function BossSentinelDrone({ arenaId }) {
  const pos = useRef({ x: 0, z: -5 });
  const ref = useRef();
  const rotorRefs = useRef([]);
  const alarmRef = useRef();
  useFrame((state, dt) => {
    const { x: rx, z: rz } = robotPosTracker;
    const dx = rx - pos.current.x; const dz = rz - pos.current.z;
    const dist = Math.hypot(dx, dz) || 1;
    pos.current.x += (dx / dist) * 3.5 * dt;
    pos.current.z += (dz / dist) * 3.5 * dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 2.6, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    rotorRefs.current.forEach((r, i) => { if (r) r.rotation.y += (i % 2 === 0 ? 22 : -22) * dt; });
    if (alarmRef.current) alarmRef.current.intensity = 3 + Math.sin(state.clock.elapsedTime * 12) * 1.5;
    setDynamicObstacles(arenaId, [{ x: pos.current.x, z: pos.current.z, r: 0.8, y: 2.6 }]);
  });
  return (
    <group ref={ref} position={[0, 2.6, -5]}>
      {/* oversized boss body */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.22, 0.7]} />
        <meshStandardMaterial color="#06000e" emissive="#2a0060" emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* underbelly cannon */}
      <mesh position={[0, -0.18, 0.15]}>
        <cylinderGeometry args={[0.06, 0.04, 0.35, 8]} />
        <meshStandardMaterial color="#0a0010" emissive="#ff0055" emissiveIntensity={1.5} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* 4 heavy rotors */}
      {[[0.42,0,0.42],[0.42,0,-0.42],[-0.42,0,0.42],[-0.42,0,-0.42]].map(([ax,ay,az],ri) => (
        <group key={ri} position={[ax,ay,az]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 10]} />
            <meshStandardMaterial color="#111111" metalness={0.9} />
          </mesh>
          <mesh ref={(el) => { rotorRefs.current[ri] = el; }}>
            <cylinderGeometry args={[0.28, 0.28, 0.02, 8]} />
            <meshBasicMaterial color="#ff0055" transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
      {/* alarm light */}
      <pointLight ref={alarmRef} color="#ff0000" intensity={3} distance={10} decay={2} />
      {/* target reticle under drone */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.2,0]}>
        <ringGeometry args={[0.6, 0.75, 20]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function AlarmBeacon({ position }) {
  const lightRef = useRef();
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 8) * 1.5;
    }
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.3, 8]} />
        <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={4} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.3, 0]} color="#ff2200" intensity={2} distance={8} decay={2} />
    </group>
  );
}

function NinjaEliteCourse({ obstacles }) {
  const arenaId = 'ninja_fortress';
  return (
    <>
      {/* Ultra-dark tech floor with grid etch */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#02000a" roughness={0.55} metalness={0.55} />
      </mesh>
      {/* floor grid lines */}
      {[-8,-6,-4,-2,0,2,4,6,8].map((v,i) => (
        <React.Fragment key={i}>
          <mesh rotation={[-Math.PI/2,0,0]} position={[v, 0.001, 0]}>
            <planeGeometry args={[0.03, 20]} />
            <meshBasicMaterial color="#200040" transparent opacity={0.7} />
          </mesh>
          <mesh rotation={[-Math.PI/2,0,0]} position={[0, 0.001, v]}>
            <planeGeometry args={[20, 0.03]} />
            <meshBasicMaterial color="#200040" transparent opacity={0.7} />
          </mesh>
        </React.Fragment>
      ))}
      {/* tech panel floor markings — danger zones */}
      {[[-3,0,-4],[3,0,-4],[0,0,0]].map(([x,y,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x, 0.002, z]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color="#ff0055" transparent opacity={0.35} />
        </mesh>
      ))}

      {/* Military base walls / bunkers */}
      {[[-8,0,-4],[8,0,-4],[-8,0,4],[8,0,4]].map(([x,y,z],i) => (
        <group key={i} position={[x,y,z]}>
          <mesh castShadow>
            <boxGeometry args={[1.2, 3.5, 2.5]} />
            <meshStandardMaterial color="#0a080e" emissive="#120a20" emissiveIntensity={0.12} metalness={0.6} roughness={0.5} />
          </mesh>
          {/* vent slots */}
          {[0.5, 1.5, 2.5].map((vy,vi) => (
            <mesh key={vi} position={[x > 0 ? -0.62 : 0.62, vy - 1.5, 0]}>
              <boxGeometry args={[0.06, 0.1, 0.6]} />
              <meshBasicMaterial color="#d946ef" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Laser trip-wire grid */}
      <StrobeLaserBarrier position={[-3, 0, -2]} color="#ff0088" />
      <StrobeLaserBarrier position={[3, 0, -2]} color="#ff0088" />
      <StrobeLaserBarrier position={[0, 0, 2]} color="#ff0088" />
      <StrobeLaserBarrier position={[-4, 0, 4]} color="#ff0088" />
      <StrobeLaserBarrier position={[4, 0, -5]} color="#ff0088" />

      {/* Alarm beacons */}
      {[[-6,0.15,0],[6,0.15,0],[0,0.15,-7],[0,0.15,7]].map((pos,i) => (
        <AlarmBeacon key={i} position={pos} />
      ))}

      {/* Pursuit drones */}
      <ElitePursuerDrone arenaId={arenaId} startX={-5} startZ={3} id={0} />
      <ElitePursuerDrone arenaId={arenaId} startX={5} startZ={-3} id={1} />
      <ElitePursuerDrone arenaId={arenaId} startX={-4} startZ={-6} id={2} />

      {/* Boss Sentinel drone */}
      <BossSentinelDrone arenaId={arenaId} />

      {/* Score gems — ultra violet */}
      {[[-5,0.6,-6],[5,0.6,-6],[-6,0.6,6],[6,0.6,6],[0,0.6,-8]].map((pos,i) => (
        <GemCollectible key={i} position={pos} color={['#d946ef','#7c3aed','#8b5cf6','#c026d3','#a855f7'][i]} />
      ))}

      {/* Exit portal */}
      <group position={[0, 0, -9.5]}>
        <mesh rotation={[0,0,0]} position={[0, 2, 0]}>
          <torusGeometry args={[1.2, 0.12, 12, 36]} />
          <meshStandardMaterial color="#d946ef" emissive="#a21caf" emissiveIntensity={2} metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <circleGeometry args={[1.18, 36]} />
          <meshBasicMaterial color="#1a0030" transparent opacity={0.7} />
        </mesh>
        <pointLight position={[0, 2, 0]} color="#d946ef" intensity={5} distance={12} decay={2} />
      </group>

      <PulseRing position={[0, 0.05, 8]} color="#d946ef" scale={1.4} />

      {/* Atmosphere — ultra dark purple ops */}
      <ambientLight color="#03000a" intensity={0.55} />
      <pointLight position={[0, 11, 0]} color="#6600cc" intensity={5} distance={42} decay={2} />
      <pointLight position={[-7, 5, -5]} color="#7c3aed" intensity={2.5} distance={22} decay={2} />
      <pointLight position={[7, 5, 5]} color="#d946ef" intensity={2.5} distance={22} decay={2} />
    </>
  );
}

// ── Humanoid courses ──────────────────────────────────────────────────

function SpinningSparringDummy({ position }) {
  const armRef = useRef();
  useFrame((state) => {
    if (armRef.current) armRef.current.rotation.y = state.clock.elapsedTime * 2.8;
  });
  return (
    <group position={position}>
      {/* pole */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.1, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* body torso */}
      <mesh castShadow position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.7, 12]} />
        <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={0.3} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#c2410c" roughness={0.8} />
      </mesh>
      {/* spinning arm beam */}
      <group ref={armRef} position={[0, 1.35, 0]}>
        <mesh castShadow position={[0.5, 0, 0]}>
          <boxGeometry args={[0.9, 0.08, 0.08]} />
          <meshStandardMaterial color="#1e40af" emissive="#1d4ed8" emissiveIntensity={0.4} metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
      <pointLight position={[0, 1.5, 0]} color="#60a5fa" intensity={0.8} distance={3} decay={2} />
    </group>
  );
}

function TrainingScoreRing({ position, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.4 + position[0]) * 0.06;
      ref.current.scale.set(s, 1, s);
      ref.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3 + position[2]) * 0.15;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI/2,0,0]} position={[position[0], 0.01, position[2]]}>
      <ringGeometry args={[0.8, 1.0, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} />
    </mesh>
  );
}

function HumanoidBasicsCourse({ obstacles }) {
  return (
    <>
      {/* Bright gym floor — checker tiles */}
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const even = (row + col) % 2 === 0;
          return (
            <mesh key={`${row}-${col}`} rotation={[-Math.PI/2,0,0]} position={[(col-3.5)*2.4, 0.001, (row-3.5)*2.4]} receiveShadow>
              <planeGeometry args={[2.38, 2.38]} />
              <meshStandardMaterial color={even ? '#e2e8f0' : '#cbd5e1'} roughness={0.88} metalness={0.06} />
            </mesh>
          );
        })
      )}
      {/* Outer floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[40,40]} />
        <meshStandardMaterial color="#b8ccd8" roughness={0.92} />
      </mesh>

      {/* Lane markings */}
      {[-4,0,4].map((x,i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x, 0.003, 0]}>
          <planeGeometry args={[0.05, 18]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Spinning sparring dummies */}
      {[[-4,0,-3],[0,0,-5],[4,0,-4],[-4,0,3],[4,0,3]].map((pos,i) => (
        <SpinningSparringDummy key={i} position={pos} />
      ))}

      {/* Animated punch bag (reuse DojoPunchBag) */}
      <DojoPunchBag position={[0, 0, 3]} />

      {/* Training score rings on floor */}
      {[[-4,0,-3],[0,0,-5],[4,0,-4],[-4,0,3],[4,0,3],[0,0,0]].map((pos,i) => (
        <TrainingScoreRing key={i} position={pos} color={['#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#06b6d4'][i]} />
      ))}

      {/* Gym wall padding (foam blocks) */}
      {[[-9,0,-6],[-9,0,-2],[-9,0,2],[-9,0,6],[9,0,-6],[9,0,-2],[9,0,2],[9,0,6]].map(([x,y,z],i) => (
        <mesh key={i} castShadow position={[x, 0.6, z]}>
          <boxGeometry args={[0.4, 1.2, 1.0]} />
          <meshStandardMaterial color={['#dc2626','#1d4ed8','#dc2626','#1d4ed8','#1d4ed8','#dc2626','#1d4ed8','#dc2626'][i]} roughness={0.95} />
        </mesh>
      ))}

      {/* Score gems collectibles */}
      {[[-6,0.6,-6],[6,0.6,-6],[-6,0.6,6],[6,0.6,6],[0,0.6,-8]].map((pos,i) => (
        <GemCollectible key={i} position={pos} color={['#ffd700','#60a5fa','#34d399','#f472b6','#a78bfa'][i]} />
      ))}

      {/* Overhead gym rigs */}
      {[-4,0,4].map((x,i) => (
        <group key={i} position={[x, 0, -1]}>
          <mesh castShadow position={[0, 4.5, 0]}>
            <boxGeometry args={[0.1, 0.1, 10]} />
            <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
          </mesh>
          <pointLight position={[0, 4.2, 0]} color="#fff8e1" intensity={2.5} distance={12} decay={2} />
        </group>
      ))}

      {/* Start / finish */}
      <PulseRing position={[0, 0.05, 8]} color="#3b82f6" scale={1.4} />
      <group position={[0, 0, -9.5]}>
        {[-1, 1].map((px,pi) => (
          <mesh key={pi} castShadow position={[px * 0.9, 2.2, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 4.4, 8]} />
            <meshStandardMaterial color="#1e40af" emissive="#1d4ed8" emissiveIntensity={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[2.2, 0.15, 0.12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.5} />
        </mesh>
        <pointLight position={[0, 4.5, 0]} color="#fbbf24" intensity={3} distance={10} decay={2} />
      </group>

      {/* Bright training lighting */}
      <ambientLight color="#c0d0e8" intensity={1.1} />
      <directionalLight position={[8, 16, 5]} color="#fff8f0" intensity={2.5} castShadow />
      <pointLight position={[0, 10, 0]} color="#60a5fa" intensity={2} distance={28} decay={2} />
      <pointLight position={[-6, 5, 0]} color="#fbbf24" intensity={1.2} distance={16} decay={2} />
      <pointLight position={[6, 5, 0]} color="#fbbf24" intensity={1.2} distance={16} decay={2} />
    </>
  );
}

// ── Arena sub-components ──────────────────────────────────────────────
function ColossumTorch({ position }) {
  const flameRef = useRef();
  const lightRef = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (flameRef.current) {
      const s = 0.9 + Math.sin(t * 7.2 + position[0]) * 0.18;
      flameRef.current.scale.set(s, 0.9 + Math.cos(t * 5.8) * 0.2, s);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2.5 + Math.sin(t * 6 + position[2]) * 1.2;
    }
  });
  return (
    <group position={position}>
      {/* stone pillar */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 3.6, 10]} />
        <meshStandardMaterial color="#78614a" roughness={0.9} />
      </mesh>
      {/* capital */}
      <mesh castShadow position={[0, 3.8, 0]}>
        <cylinderGeometry args={[0.28, 0.18, 0.35, 8]} />
        <meshStandardMaterial color="#5a4a36" roughness={0.88} />
      </mesh>
      {/* bowl */}
      <mesh castShadow position={[0, 4.05, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.2, 10, 1, true]} />
        <meshStandardMaterial color="#3d2b1a" roughness={0.85} metalness={0.3} />
      </mesh>
      {/* flame */}
      <mesh ref={flameRef} position={[0, 4.4, 0]}>
        <coneGeometry args={[0.14, 0.55, 10]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2.5} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 4.25, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ff9900" emissive="#ff6600" emissiveIntensity={3} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 4.5, 0]} color="#ff8c00" intensity={2.5} distance={9} decay={2} />
    </group>
  );
}

function ArenaOpponentBot({ arenaId }) {
  const pos = useRef({ x: 4, z: 0 });
  const ref = useRef();
  const waypoints = useMemo(() => [[4,0],[4,-5],[-4,-5],[-4,5],[4,5],[4,0]], []);
  const wpIdx = useRef(0);
  useFrame((_, dt) => {
    const [tx, tz] = waypoints[wpIdx.current];
    const dx = tx - pos.current.x; const dz = tz - pos.current.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.3) { wpIdx.current = (wpIdx.current + 1) % waypoints.length; return; }
    pos.current.x += (dx / dist) * 2.6 * dt;
    pos.current.z += (dz / dist) * 2.6 * dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 0, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    setDynamicObstacles(arenaId, [{ x: pos.current.x, z: pos.current.z, r: 0.55 }]);
  });
  return (
    <group ref={ref} position={[4, 0, 0]}>
      {/* torso */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.35]} />
        <meshStandardMaterial color="#92400e" emissive="#451a03" emissiveIntensity={0.25} metalness={0.5} roughness={0.5} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 1.3, 0]}>
        <boxGeometry args={[0.35, 0.3, 0.3]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* eye visor */}
      <mesh position={[0, 1.3, 0.16]}>
        <boxGeometry args={[0.24, 0.08, 0.02]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2.5} />
      </mesh>
      {/* legs */}
      {[[-0.15,0],[0.15,0]].map(([lx],li) => (
        <mesh key={li} castShadow position={[lx, 0.25, 0]}>
          <boxGeometry args={[0.14, 0.5, 0.18]} />
          <meshStandardMaterial color="#92400e" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
      <pointLight color="#fbbf24" intensity={1.5} distance={5} decay={2} />
    </group>
  );
}

function HumanoidArenaCourse({ obstacles }) {
  const arenaId = 'human_arena';
  return (
    <>
      {/* Golden sandy arena floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#b45309" roughness={0.92} metalness={0.06} />
      </mesh>
      {/* sand texture patches */}
      {[[-3,-3],[3,-3],[-3,3],[3,3],[0,0]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x, 0.002, z]}>
          <planeGeometry args={[2.8, 2.8]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.95} metalness={0.02} />
        </mesh>
      ))}

      {/* Arena circle markings */}
      {[2.0, 4.5, 7.5].map((r,i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[0, 0.003, 0]}>
          <ringGeometry args={[r - 0.06, r, 40]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.4 - i*0.1} />
        </mesh>
      ))}

      {/* Colosseum-style torches around perimeter */}
      {[
        [-8,-8],[0,-9],[8,-8],
        [-9,0],[9,0],
        [-8,8],[0,9],[8,8],
      ].map((pos,i) => (
        <ColossumTorch key={i} position={[pos[0], 0, pos[1]]} />
      ))}

      {/* Low arena spectator wall suggestion */}
      {[
        [-9.5, 1.2, 0, 0, 20, 2.4],
        [9.5, 1.2, 0, 0, 20, 2.4],
        [0, 1.2, -9.5, Math.PI/2, 20, 2.4],
        [0, 1.2, 9.5, Math.PI/2, 20, 2.4],
      ].map(([x,y,z,ry,w,h],i) => (
        <mesh key={i} castShadow position={[x,y,z]} rotation={[0,ry,0]}>
          <boxGeometry args={[0.5, h, w]} />
          <meshStandardMaterial color="#78614a" roughness={0.9} />
        </mesh>
      ))}

      {/* Silhouette crowd on top of walls */}
      {Array.from({length:14},(_,i) => {
        const angle = (i/14)*Math.PI*2;
        const r = 10; const hgt = 2.8;
        return (
          <mesh key={i} castShadow position={[Math.cos(angle)*r, hgt, Math.sin(angle)*r]}>
            <sphereGeometry args={[0.18, 6, 6]} />
            <meshStandardMaterial color="#1c1208" roughness={1} />
          </mesh>
        );
      })}

      {/* Arena opponent bot on patrol */}
      <ArenaOpponentBot arenaId={arenaId} />

      {/* Victory arch at far end */}
      <group position={[0, 0, -10]}>
        {[-1.4, 1.4].map((px,pi) => (
          <mesh key={pi} castShadow position={[px, 2.5, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 5, 10]} />
            <meshStandardMaterial color="#a16207" roughness={0.7} metalness={0.3} />
          </mesh>
        ))}
        <mesh castShadow position={[0, 5.2, 0]}>
          <torusGeometry args={[1.4, 0.18, 10, 28, Math.PI]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.8} metalness={0.5} roughness={0.3} />
        </mesh>
        <pointLight position={[0, 5.2, 0]} color="#fbbf24" intensity={4} distance={12} decay={2} />
      </group>

      {/* Score gems collectibles */}
      {[[-5,0.6,-7],[5,0.6,-7],[-7,0.6,0],[7,0.6,0],[0,0.6,-8]].map((pos,i) => (
        <GemCollectible key={i} position={pos} color={['#ffd700','#ff8c00','#fbbf24','#f59e0b','#ffd700'][i]} />
      ))}

      <PulseRing position={[0, 0.05, 9]} color="#fbbf24" scale={1.4} />

      {/* Golden colosseum lighting */}
      <ambientLight color="#2a1a08" intensity={0.85} />
      <pointLight position={[0, 12, 0]} color="#fbbf24" intensity={4} distance={32} decay={2} />
      <pointLight position={[-6, 5, -5]} color="#ff8c00" intensity={2.5} distance={18} decay={2} />
      <pointLight position={[6, 5, 5]} color="#ff8c00" intensity={2.5} distance={18} decay={2} />
      <directionalLight position={[6, 14, -4]} color="#ffd580" intensity={2.2} castShadow />
    </>
  );
}

// ── Humanoid epic sub-components ──────────────────────────────────────
function ChampionBossHumanoid({ arenaId }) {
  const pos = useRef({ x: 0, z: -4 });
  const ref = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  useFrame((state, dt) => {
    const { x: rx, z: rz } = robotPosTracker;
    const dx = rx - pos.current.x; const dz = rz - pos.current.z;
    const dist = Math.hypot(dx, dz) || 1;
    pos.current.x += (dx / dist) * 3.8 * dt;
    pos.current.z += (dz / dist) * 3.8 * dt;
    if (ref.current) {
      ref.current.position.set(pos.current.x, 0, pos.current.z);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    const pulse = 2.5 + Math.sin(state.clock.elapsedTime * 10) * 1.5;
    if (eyeLeftRef.current) eyeLeftRef.current.material.emissiveIntensity = pulse;
    if (eyeRightRef.current) eyeRightRef.current.material.emissiveIntensity = pulse;
    setDynamicObstacles(arenaId, [{ x: pos.current.x, z: pos.current.z, r: 0.7 }]);
  });
  return (
    <group ref={ref} position={[0, 0, -4]}>
      {/* massive armored torso */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <boxGeometry args={[0.72, 0.9, 0.48]} />
        <meshStandardMaterial color="#1a0808" emissive="#3a0808" emissiveIntensity={0.35} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* chest armor plate */}
      <mesh castShadow position={[0, 0.95, 0.25]}>
        <boxGeometry args={[0.55, 0.7, 0.08]} />
        <meshStandardMaterial color="#2a0808" emissive="#ef4444" emissiveIntensity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* shoulder pads */}
      {[[-0.45,0],[0.45,0]].map(([sx],si) => (
        <mesh key={si} castShadow position={[sx, 1.2, 0]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color="#220808" emissive="#dc2626" emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* head */}
      <mesh castShadow position={[0, 1.65, 0]}>
        <boxGeometry args={[0.42, 0.38, 0.38]} />
        <meshStandardMaterial color="#150505" emissive="#200808" emissiveIntensity={0.2} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* visor */}
      <mesh position={[0, 1.65, 0.2]}>
        <boxGeometry args={[0.32, 0.12, 0.04]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
      </mesh>
      {/* eyes */}
      <mesh ref={eyeLeftRef} position={[-0.1, 1.68, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={2.5} />
      </mesh>
      <mesh ref={eyeRightRef} position={[0.1, 1.68, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={2.5} />
      </mesh>
      {/* arms */}
      {[[-0.5,0],[0.5,0]].map(([ax],ai) => (
        <mesh key={ai} castShadow position={[ax, 0.85, 0]}>
          <boxGeometry args={[0.18, 0.65, 0.22]} />
          <meshStandardMaterial color="#1a0808" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* legs */}
      {[[-0.2,0],[0.2,0]].map(([lx],li) => (
        <mesh key={li} castShadow position={[lx, 0.28, 0]}>
          <boxGeometry args={[0.2, 0.56, 0.28]} />
          <meshStandardMaterial color="#150505" metalness={0.75} roughness={0.25} />
        </mesh>
      ))}
      <pointLight color="#ff0000" intensity={4} distance={10} decay={2} />
    </group>
  );
}

function LavaRiver({ x, z, length, angle }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.material.emissiveIntensity = 1.8 + Math.sin(state.clock.elapsedTime * 2.5) * 0.6;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI/2, angle, 0]} position={[x, 0.01, z]}>
      <planeGeometry args={[1.4, length]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff3300" emissiveIntensity={2} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function LightningStrike({ x, z, delay }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const active = Math.sin((state.clock.elapsedTime + delay) * 4.5) > 0.88;
    ref.current.visible = active;
  });
  return (
    <mesh ref={ref} position={[x, 4, z]}>
      <boxGeometry args={[0.06, 8, 0.06]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
    </mesh>
  );
}

function HumanoidEpicCourse({ obstacles }) {
  const arenaId = 'human_championship';
  return (
    <>
      {/* Championship arena floor — dark with metallic sheen */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#0c0204" roughness={0.55} metalness={0.45} />
      </mesh>
      {/* Floor runes / tech etching */}
      {[0,1,2,3,4,5].map(i => {
        const angle = (i/6)*Math.PI*2;
        const r = 5.5;
        return (
          <mesh key={i} rotation={[-Math.PI/2, angle, 0]} position={[Math.cos(angle)*r, 0.002, Math.sin(angle)*r]}>
            <planeGeometry args={[0.08, 2.5]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
          </mesh>
        );
      })}
      {/* Arena circles */}
      {[2.5, 5.5, 8.5].map((r,i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[0, 0.003, 0]}>
          <ringGeometry args={[r - 0.07, r, 40]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.3 - i*0.08} />
        </mesh>
      ))}

      {/* Lava moat channels around arena */}
      <LavaRiver x={0} z={-9} length={20} angle={Math.PI/2} />
      <LavaRiver x={0} z={9} length={20} angle={Math.PI/2} />
      <LavaRiver x={-9} z={0} length={20} angle={0} />
      <LavaRiver x={9} z={0} length={20} angle={0} />

      {/* Massive pillar columns at corners */}
      {[[-7,-7],[7,-7],[-7,7],[7,7]].map(([x,z],i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 3, 0]}>
            <cylinderGeometry args={[0.55, 0.7, 6, 12]} />
            <meshStandardMaterial color="#1a0808" metalness={0.6} roughness={0.5} />
          </mesh>
          {/* column crown ring */}
          <mesh position={[0, 6.2, 0]}>
            <torusGeometry args={[0.7, 0.1, 8, 20]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.2} metalness={0.6} />
          </mesh>
          <Torch position={[0, 6.8, 0]} />
          <PulseRing position={[0, 0.05, 0]} color="#ef4444" scale={1.2} />
          <pointLight position={[0, 6, 0]} color="#ef4444" intensity={3} distance={12} decay={2} />
        </group>
      ))}

      {/* Lava geysers */}
      {[[-4,0,-5],[4,0,-5],[-5,0,0],[5,0,0],[-4,0,5],[4,0,5]].map((pos,i) => (
        <LavaGeyser key={i} position={pos} delay={i * 0.8} />
      ))}

      {/* LavaCracks on floor */}
      {[[0,-3,4,0],[0,3,4,0],[-3,0,3,Math.PI/2],[3,0,3,Math.PI/2],[-2,-2,2,Math.PI/4]].map(([x,z,l,a],i) => (
        <LavaCrack key={i} x={x} z={z} len={l} angle={a} />
      ))}

      {/* Lightning strikes */}
      {[[-6,-6,0.3],[6,-6,1.1],[-6,6,1.8],[6,6,0.7],[0,-8,0.5]].map(([x,z,d],i) => (
        <LightningStrike key={i} x={x} z={z} delay={d} />
      ))}

      {/* Champion boss humanoid — pursuer */}
      <ChampionBossHumanoid arenaId={arenaId} />

      {/* Legendary gem collectibles */}
      {[[-5,0.6,-7],[5,0.6,-7],[-7,0.6,0],[7,0.6,0],[0,0.6,-8]].map((pos,i) => (
        <GemCollectible key={i} position={pos} color={['#ffd700','#ef4444','#ff6600','#fbbf24','#dc2626'][i]} />
      ))}

      {/* Victory portal */}
      <group position={[0, 0, -10]}>
        <mesh rotation={[0,0,0]} position={[0, 2.5, 0]}>
          <torusGeometry args={[1.5, 0.14, 12, 36]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3} metalness={0.6} />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
          <circleGeometry args={[1.46, 36]} />
          <meshBasicMaterial color="#ff2200" transparent opacity={0.35} />
        </mesh>
        <pointLight position={[0, 2.5, 0]} color="#ffd700" intensity={8} distance={16} decay={2} />
      </group>

      <PulseRing position={[0, 0.05, 9]} color="#ef4444" scale={1.5} />

      {/* HELL-FIRE championship atmosphere */}
      <ambientLight color="#0a0202" intensity={0.55} />
      <pointLight position={[0, 13, 0]} color="#ef4444" intensity={7} distance={45} decay={2} />
      <pointLight position={[-8, 5, -6]} color="#f97316" intensity={3} distance={24} decay={2} />
      <pointLight position={[8, 5, 6]} color="#dc2626" intensity={3} distance={24} decay={2} />
      <pointLight position={[0, 4, 0]} color="#fbbf24" intensity={2.5} distance={20} decay={2} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FLOOR & THEME MAPS
══════════════════════════════════════════════════════════════════════ */

const FLOOR_BY_THEME = {
  sky: '#b8d9ff', underwater: '#0e7490', rough: '#b8a898', mining: '#78716c',
  factory: '#e2e8f0', terrain: '#c8e6c9', hover: '#312e81',
  lego: '#ffcc80', ai: '#ede9fe', ground: '#dce8f5',
};

const DIFF_FLOOR_TINT = { easy: null, medium: '#fffbea', hard: '#fff0f0' };

/* ══════════════════════════════════════════════════════════════════════
   ROBOT-EXCLUSIVE COURSE ENVIRONMENTS
══════════════════════════════════════════════════════════════════════ */

// ── Rover: Underground Transit Tunnel ────────────────────────────────
function RoverTransitCourse() {
  const cyanTrack = '#00e5ff';
  const panelAmber = '#ffaa00';
  const tunnelMetal = '#2a2a3a';
  const rails = [-0.18, 0.18];

  const railSegments = Array.from({ length: 20 }, (_, i) => i - 10);
  const wallPanels = [-4, -2, 0, 2, 4];

  return (
    <group>
      {/* Tunnel floor — dark gunmetal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[12, 50]} />
        <meshStandardMaterial color={tunnelMetal} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Glowing cyan track strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[0.18, 50]} />
        <meshStandardMaterial color={cyanTrack} emissive={cyanTrack} emissiveIntensity={0.9} />
      </mesh>

      {/* Track rails (two thin bars) */}
      {rails.map((x, i) => (
        <mesh key={`rail-${i}`} position={[x, 0.03, 0]}>
          <boxGeometry args={[0.04, 0.04, 50]} />
          <meshStandardMaterial color="#4a4a60" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Tunnel walls */}
      {[-5.5, 5.5].map((x, i) => (
        <mesh key={`wall-${i}`} position={[x, 2.0, 0]} receiveShadow>
          <boxGeometry args={[0.6, 4.0, 50]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh position={[0, 4.1, 0]} receiveShadow>
        <boxGeometry args={[12, 0.4, 50]} />
        <meshStandardMaterial color="#14141e" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Ceiling light strips */}
      {railSegments.map((z) => (
        <group key={`light-${z}`} position={[0, 3.85, z * 2.5]}>
          <mesh>
            <boxGeometry args={[6, 0.06, 0.3]} />
            <meshStandardMaterial color="#e0f0ff" emissive="#b0d8ff" emissiveIntensity={0.6} />
          </mesh>
          <pointLight color="#ddeeff" intensity={0.4} distance={5} decay={2} />
        </group>
      ))}

      {/* Cyan track point lights */}
      {[-10, -5, 0, 5, 10].map((z) => (
        <pointLight key={`cyan-${z}`} position={[0, 0.3, z]} color={cyanTrack} intensity={0.5} distance={6} decay={2} />
      ))}

      {/* Wall tech panels with amber warning lights */}
      {wallPanels.map((z, i) => (
        <group key={`panel-${i}`} position={[5.2, 1.8, z * 4]}>
          <mesh>
            <boxGeometry args={[0.06, 1.2, 0.8]} />
            <meshStandardMaterial color="#2a3040" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0.05, 0.4, 0]}>
            <boxGeometry args={[0.04, 0.15, 0.15]} />
            <meshStandardMaterial color={panelAmber} emissive={panelAmber} emissiveIntensity={0.8} />
          </mesh>
          <pointLight color={panelAmber} intensity={0.3} distance={3} decay={2} position={[0.2, 0.4, 0]} />
        </group>
      ))}

      {/* Speed limit signs */}
      {[-8, -4, 0, 4, 8].map((z, i) => (
        <group key={`sign-${i}`} position={[-4.5, 2.8, z]}>
          <mesh>
            <boxGeometry args={[0.04, 0.5, 0.5]} />
            <meshStandardMaterial color={panelAmber} emissive={panelAmber} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      {/* Mist at tunnel ends */}
      {[-24, 24].map((z, i) => (
        <mesh key={`mist-${i}`} position={[0, 2, z]} rotation={[0, 0, 0]}>
          <planeGeometry args={[12, 4]} />
          <meshStandardMaterial color="#003355" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      ))}

      {/* Ambient fill */}
      <ambientLight color="#001122" intensity={0.15} />
      <directionalLight color="#002244" intensity={0.2} position={[0, 5, 0]} />
    </group>
  );
}

// ── Rover: City Delivery Grid ─────────────────────────────────────────
function RoverDeliveryCourse() {
  const asphalt = '#2a2a32';
  const lineWhite = '#e8e8e8';
  const buildingGray = '#5a6070';
  const deliveryGreen = '#00ff88';

  const buildings = [
    [-6, 0, -8, 3, 5, 2.5], [-6, 0, -3, 3, 6, 2], [-6, 0, 3, 3, 4, 2.5],
    [6, 0, -8, 3, 7, 2], [6, 0, -2, 3, 5, 2.5], [6, 0, 5, 3, 6, 2],
  ];

  const deliveryZones = [
    [-4.5, -6], [-4.5, 0], [-4.5, 6],
    [4.5, -6], [4.5, 0], [4.5, 6],
  ];

  const streetLamps = [-8, -4, 0, 4, 8];

  return (
    <group>
      {/* Asphalt road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 36]} />
        <meshStandardMaterial color={asphalt} roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Road lane markings */}
      {[-12, -8, -4, 0, 4, 8, 12].map((z) => (
        <mesh key={`mark-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[0.12, 1.5]} />
          <meshStandardMaterial color={lineWhite} />
        </mesh>
      ))}

      {/* Buildings */}
      {buildings.map(([x, y, z, w, h, d], i) => (
        <group key={`bld-${i}`}>
          <mesh position={[x, h / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={buildingGray} metalness={0.3} roughness={0.7} />
          </mesh>
          {/* Windows */}
          {[1, 2, 3].map((row) => (
            <mesh key={`win-${row}`} position={[x + (x < 0 ? 1.51 : -1.51), row, z]}>
              <planeGeometry args={[0.4, 0.35]} />
              <meshStandardMaterial color="#7ab8e8" emissive="#5090c0" emissiveIntensity={0.3} transparent opacity={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Delivery zones — glowing green squares */}
      {deliveryZones.map(([x, z], i) => (
        <group key={`dz-${i}`} position={[x, 0.01, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial color={deliveryGreen} emissive={deliveryGreen} emissiveIntensity={0.5} transparent opacity={0.7} />
          </mesh>
          <pointLight color={deliveryGreen} intensity={0.4} distance={3} decay={2} position={[0, 0.5, 0]} />
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.06, 1.0, 0.06]} />
            <meshStandardMaterial color={deliveryGreen} emissive={deliveryGreen} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Street lamps */}
      {streetLamps.map((z, i) => (
        <group key={`lamp-${i}`} position={[-5, 0, z]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
            <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0.3, 3.0, 0]}>
            <boxGeometry args={[0.6, 0.15, 0.15]} />
            <meshStandardMaterial color="#ffeecc" emissive="#ffcc66" emissiveIntensity={0.7} />
          </mesh>
          <pointLight color="#ffddaa" intensity={0.6} distance={6} decay={2} position={[0.3, 2.9, 0]} />
        </group>
      ))}

      {/* Daylight */}
      <ambientLight color="#c8d8e8" intensity={0.6} />
      <directionalLight color="#fff8e0" intensity={1.2} position={[5, 12, 5]} castShadow />
    </group>
  );
}

// ── Spider: Pipeline Inspection ───────────────────────────────────────
function SpiderPipelineCourse() {
  const pipeMetal = '#4a4040';
  const rustColor = '#6b3010';
  const faultRed = '#ff3333';
  const inspectGreen = '#00ff88';

  const faultPositions = [
    [1.8, 2.5, -8], [-2.0, 0.5, -3], [2.2, 3.5, 2], [-1.5, 1.5, 7], [1.9, 4.0, 12],
  ];
  const jointPositions = [-10, -5, 0, 5, 10, 15];

  return (
    <group>
      {/* Main pipe interior — cylindrical tube */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[2.8, 2.8, 50, 24, 1, true]} />
        <meshStandardMaterial color={pipeMetal} metalness={0.7} roughness={0.5} side={THREE.BackSide} />
      </mesh>

      {/* Pipe floor (robot walks on bottom) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
        <planeGeometry args={[4, 50]} />
        <meshStandardMaterial color="#3a3030" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Rust patches */}
      {[[-2, 1.5, -6], [2, 2.0, 0], [-1.5, 3.5, 8]].map(([x, y, z], i) => (
        <mesh key={`rust-${i}`} position={[x, y, z]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshStandardMaterial color={rustColor} roughness={0.95} />
        </mesh>
      ))}

      {/* Fault markers — glowing red on pipe walls */}
      {faultPositions.map(([x, y, z], i) => (
        <group key={`fault-${i}`} position={[x, y, z]}>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={faultRed} emissive={faultRed} emissiveIntensity={1.0} />
          </mesh>
          <pointLight color={faultRed} intensity={0.8} distance={3} decay={2} />
          {/* Inspection beam from below */}
          <mesh position={[0, -y + 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.08, Math.abs(y) - 0.1, 6]} />
            <meshStandardMaterial color={inspectGreen} emissive={inspectGreen} emissiveIntensity={0.6} transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      {/* Pipe joint rings */}
      {jointPositions.map((z) => (
        <group key={`joint-${z}`} position={[0, 2.0, z]}>
          <mesh>
            <torusGeometry args={[2.8, 0.2, 8, 24]} />
            <meshStandardMaterial color="#555050" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Joint utility light */}
          <pointLight color="#cc8833" intensity={0.4} distance={4} decay={2} />
          <mesh position={[0, -1.8, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.3]} />
            <meshStandardMaterial color="#cc8833" emissive="#aa6622" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      {/* Water drip particles (simple meshes) */}
      {[-5, 3, 10].map((z, i) => (
        <mesh key={`drip-${i}`} position={[0.5, 0.8, z]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#1a6080" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Very dim ambient — torch effect */}
      <ambientLight color="#110800" intensity={0.08} />
    </group>
  );
}

// ── Drone: Canyon Flight ──────────────────────────────────────────────
function DroneCanyonCourse() {
  const sandstone = '#c84b18';
  const sandstoneLight = '#e8a060';
  const sky = '#4a90d9';
  const shadow = '#2a1a0a';

  const wallSegments = Array.from({ length: 12 }, (_, i) => i - 6);

  return (
    <group>
      {/* Canyon floor far below */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]} receiveShadow>
        <planeGeometry args={[30, 60]} />
        <meshStandardMaterial color={shadow} roughness={0.9} />
      </mesh>

      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[40, 16, 8]} />
        <meshStandardMaterial color={sky} side={THREE.BackSide} />
      </mesh>

      {/* Left canyon wall */}
      {wallSegments.map((i) => (
        <group key={`lw-${i}`} position={[-4.5 + (Math.sin(i * 1.3) * 0.5), 2, i * 5]}>
          <mesh castShadow>
            <boxGeometry args={[3.5, 14 + Math.abs(Math.sin(i * 0.7)) * 4, 5.5]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? sandstone : sandstoneLight}
              roughness={0.95}
              metalness={0.05}
            />
          </mesh>
        </group>
      ))}

      {/* Right canyon wall */}
      {wallSegments.map((i) => (
        <group key={`rw-${i}`} position={[4.5 + (Math.sin(i * 1.1) * 0.4), 2, i * 5]}>
          <mesh castShadow>
            <boxGeometry args={[3.5, 12 + Math.abs(Math.cos(i * 0.9)) * 5, 5.5]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? sandstoneLight : sandstone}
              roughness={0.92}
              metalness={0.05}
            />
          </mesh>
        </group>
      ))}

      {/* Wind stream particles — horizontal planes suggesting airflow */}
      {[-10, 0, 10, 20].map((z, i) => (
        <mesh key={`wind-${i}`} position={[0, 1.5, z]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 8]} />
          <meshStandardMaterial color="#f0f0ff" transparent opacity={0.06} depthWrite={false} />
        </mesh>
      ))}

      {/* Warm canyon-wall reflected fill */}
      <ambientLight color="#301808" intensity={0.3} />
      <directionalLight color="#ffe0a0" intensity={1.5} position={[0, 20, 10]} castShadow />
      {/* Shadow-zone fill lights */}
      {[-15, 15].map((z, i) => (
        <pointLight key={`shadow-${i}`} color="#180e04" intensity={0.2} distance={10} position={[0, 0, z]} />
      ))}
    </group>
  );
}

// ── Tank: Demolition Yard ─────────────────────────────────────────────
function TankDemolitionCourse() {
  const concrete = '#8a8880';
  const rubble = '#6a6460';
  const dumpZone = '#ffaa00';
  const safetyFence = '#ff6600';

  const debrisChunks = [
    [-3, 0, -4, 1.2, 0.7, 0.9],
    [1, 0, -6, 1.5, 0.8, 1.0],
    [-1, 0, -2, 0.9, 0.6, 0.8],
    [3, 0, -5, 1.3, 0.9, 1.1],
    [0, 0, -8, 1.0, 0.7, 0.8],
    [-4, 0, 0, 1.4, 0.8, 1.0],
  ];

  const dumpZones = [[-7, 0, 0], [7, 0, 0], [0, 0, -12]];

  return (
    <group>
      {/* Concrete yard floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 30]} />
        <meshStandardMaterial color={concrete} roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Debris chunks (pushable targets) */}
      {debrisChunks.map(([x, y, z, w, h, d], i) => (
        <group key={`debris-${i}`} position={[x, h / 2, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={rubble} roughness={0.95} metalness={0.05} />
          </mesh>
          {/* Rebar sticking out */}
          <mesh position={[w * 0.3, h * 0.5, 0]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
            <meshStandardMaterial color="#555" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Dump zones — bright amber marked areas */}
      {dumpZones.map(([x, y, z], i) => (
        <group key={`dump-${i}`} position={[x, 0.01, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, 2.5]} />
            <meshStandardMaterial color={dumpZone} emissive={dumpZone} emissiveIntensity={0.3} transparent opacity={0.6} />
          </mesh>
          <pointLight color={dumpZone} intensity={0.5} distance={4} decay={2} position={[0, 1, 0]} />
          {/* Corner markers */}
          {[[-1.2, 0, -1.2], [1.2, 0, -1.2], [-1.2, 0, 1.2], [1.2, 0, 1.2]].map(([cx, cy, cz], ci) => (
            <mesh key={ci} position={[cx, 0.4, cz]}>
              <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
              <meshStandardMaterial color={safetyFence} emissive={safetyFence} emissiveIntensity={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Safety fencing at boundaries */}
      {[-9, 9].map((x, i) => (
        <mesh key={`fence-${i}`} position={[x, 0.75, 0]}>
          <boxGeometry args={[0.15, 1.5, 28]} />
          <meshStandardMaterial color={safetyFence} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Industrial crane overhead (simplified) */}
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[18, 0.3, 0.3]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 8, 6]} />
        <meshStandardMaterial color="#666" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Dust cloud particles */}
      {[-2, 2, 0].map((x, i) => (
        <mesh key={`dust-${i}`} position={[x, 0.3, -3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial color="#c0b8a0" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      ))}

      {/* Industrial lighting — halogen floodlights from poles */}
      <ambientLight color="#e0d8c8" intensity={0.7} />
      <directionalLight color="#fff0e0" intensity={1.0} position={[5, 15, 5]} castShadow />
      {[-6, 6].map((x, i) => (
        <pointLight key={`flood-${i}`} color="#ffe8c0" intensity={1.5} distance={16} decay={2} position={[x, 6, 0]} />
      ))}
    </group>
  );
}

// ── Humanoid: Factory Assembly Line ──────────────────────────────────
function HumanoidAssemblyCourse() {
  const floorColor = '#d0d0d8';
  const conveyorGray = '#5a6070';
  const partColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];

  const partsOnBelt = [-6, -3, 0, 3, 6];
  const assemblyStations = [-4, 0, 4];

  return (
    <group>
      {/* Factory floor — bright white */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 20]} />
        <meshStandardMaterial color={floorColor} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Conveyor belt — long horizontal strip */}
      <mesh position={[0, 0.55, 0]} receiveShadow>
        <boxGeometry args={[14, 0.5, 1.2]} />
        <meshStandardMaterial color={conveyorGray} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Belt surface stripes */}
      {partsOnBelt.map((x, i) => (
        <mesh key={`stripe-${i}`} position={[x, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[1.1, 0.08]} />
          <meshStandardMaterial color="#888" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Parts arriving on belt */}
      {partsOnBelt.map((x, i) => (
        <mesh key={`part-${i}`} position={[x, 0.95, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={partColors[i % partColors.length]} metalness={0.3} roughness={0.5} />
        </mesh>
      ))}

      {/* Assembly stations */}
      {assemblyStations.map((z, i) => (
        <group key={`station-${i}`} position={[0, 0, z + 3]}>
          <mesh position={[0, 0.5, 0]} receiveShadow>
            <boxGeometry args={[2.5, 1, 1.5]} />
            <meshStandardMaterial color="#8090a0" metalness={0.4} roughness={0.5} />
          </mesh>
          {/* Output bay indicator */}
          <mesh position={[0, 1.05, 0]}>
            <planeGeometry args={[2, 0.8]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} transparent opacity={0.5} />
          </mesh>
          <pointLight color="#22c55e" intensity={0.3} distance={3} decay={2} position={[0, 1.5, 0]} />
        </group>
      ))}

      {/* Background robot arms (ambient) */}
      {[-5, 5].map((x, i) => (
        <group key={`arm-${i}`} position={[x, 0, 5]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 3, 6]} />
            <meshStandardMaterial color="#6a7080" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0.5, 2.5, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 1.2, 6]} />
            <meshStandardMaterial color="#7a8090" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Product count display */}
      <mesh position={[0, 3.5, -8]}>
        <boxGeometry args={[3, 1.5, 0.1]} />
        <meshStandardMaterial color="#1a2230" emissive="#002244" emissiveIntensity={0.3} />
      </mesh>

      {/* Bright factory overhead lighting */}
      <ambientLight color="#e8eef4" intensity={0.9} />
      <directionalLight color="#ffffff" intensity={1.5} position={[0, 12, 0]} castShadow />
      {[-4, 0, 4].map((z, i) => (
        <pointLight key={`factory-${i}`} color="#f0f4ff" intensity={0.8} distance={8} decay={2} position={[0, 5, z]} />
      ))}
    </group>
  );
}

// ── Robot Arm: Micro Surgery (circuit board) ──────────────────────────
function ArmSurgeryCourse() {
  const boardGreen = '#1a3a1a';
  const traceCopper = '#b87333';
  const faultRed = '#ff2222';
  const cleanRoom = '#d8e4f0';

  const faultPoints = [[-2, 0, -1.5], [1.5, 0, 0.5], [-0.5, 0, 2], [2.5, 0, -2], [0, 0, -3]];
  const components = [
    [0, 0, 0, 0.8, 0.3, 0.5], [-2, 0, 1, 0.4, 0.5, 0.4],
    [1, 0, -1, 1.2, 0.2, 0.8], [-1, 0, -2, 0.6, 0.4, 0.6],
    [2, 0, 1, 0.5, 0.6, 0.5],
  ];

  return (
    <group>
      {/* Clean-room floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={cleanRoom} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Bench / work surface */}
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <boxGeometry args={[10, 0.5, 10]} />
        <meshStandardMaterial color="#c0c8d0" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Circuit board (massively enlarged) */}
      <group position={[0, 0.56, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color={boardGreen} roughness={0.7} />
        </mesh>

        {/* Copper trace grid */}
        {[-3, -1, 1, 3].map((x) => (
          <mesh key={`trace-h-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, 0]}>
            <planeGeometry args={[0.06, 8]} />
            <meshStandardMaterial color={traceCopper} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        {[-3, -1, 1, 3].map((z) => (
          <mesh key={`trace-v-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, z]}>
            <planeGeometry args={[8, 0.06]} />
            <meshStandardMaterial color={traceCopper} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}

        {/* Electronic components */}
        {components.map(([x, y, z, w, h, d], i) => (
          <mesh key={`comp-${i}`} position={[x, y + h / 2 + 0.005, z]} castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#1a1a2a' : '#2a1a1a'} metalness={0.4} roughness={0.5} />
          </mesh>
        ))}

        {/* Fault markers — glowing red */}
        {faultPoints.map(([x, y, z], i) => (
          <group key={`fault-${i}`} position={[x, y + 0.01, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.2, 16]} />
              <meshStandardMaterial color={faultRed} emissive={faultRed} emissiveIntensity={1.0} transparent opacity={0.8} />
            </mesh>
            <pointLight color={faultRed} intensity={0.5} distance={2} decay={2} position={[0, 0.3, 0]} />
          </group>
        ))}
      </group>

      {/* Ring light around work area (microscope style) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <pointLight
            key={`ring-${i}`}
            color="#f0f8ff"
            intensity={0.4}
            distance={6}
            decay={2}
            position={[Math.cos(rad) * 5, 4, Math.sin(rad) * 5]}
          />
        );
      })}

      {/* Clean room ambience */}
      <ambientLight color="#ddeeff" intensity={1.0} />
      <directionalLight color="#ffffff" intensity={0.8} position={[0, 8, 0]} castShadow />
    </group>
  );
}

// ─── ROVER SURVEY ─────────────────────────────────────────────────────────
function RoverSurveyCourse() {
  return (
    <group>
      {/* Open terrain — rolling hills, survey beacons */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[60,60]} />
        <meshStandardMaterial color="#c9a96e" roughness={0.9} />
      </mesh>
      {/* Survey marker beacons */}
      {[[-12,0,-8],[0,0,-14],[12,0,-8],[18,0,4],[-18,0,4],[0,0,14]].map(([x,y,z],i)=>(
        <group key={i} position={[x,0,z]}>
          <mesh position={[0,0.6,0]} castShadow>
            <cylinderGeometry args={[0.08,0.08,1.2,8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0,1.4,0]}>
            <sphereGeometry args={[0.18,8,8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
          </mesh>
          <pointLight color="#fbbf24" intensity={0.6} distance={4} position={[0,1.5,0]} />
        </group>
      ))}
      {/* Rocky outcrops */}
      {[[-8,0,6],[10,0,10],[-14,0,14],[6,0,-18]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,0.4,z]} castShadow>
          <dodecahedronGeometry args={[0.9,0]} />
          <meshStandardMaterial color="#8b7355" roughness={1} />
        </mesh>
      ))}
      {/* GPS satellite overhead (decorative) */}
      <mesh position={[0,14,0]}>
        <boxGeometry args={[1.2,0.2,1.2]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      <ambientLight color="#ffe8a0" intensity={1.2} />
      <directionalLight color="#fff3d0" intensity={1.0} position={[10,20,5]} castShadow />
      <pointLight color="#fbbf24" intensity={0.3} distance={40} position={[0,10,0]} />
    </group>
  );
}

// ─── SPIDER RUINS ─────────────────────────────────────────────────────────
function SpiderRuinsCourse() {
  return (
    <group>
      {/* Cracked stone floor */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[50,50]} />
        <meshStandardMaterial color="#6b5a3e" roughness={1} />
      </mesh>
      {/* Collapsed pillars to climb over */}
      {[[-6,0,0],[-2,0,4],[4,0,-2],[8,0,6],[-10,0,8],[2,0,12]].map(([x,y,z],i)=>(
        <group key={i} position={[x,0,z]} rotation={[0,i*0.5,0]}>
          <mesh position={[0,0.6,0]} rotation={[0,0,Math.PI/2 * (i%2)]} castShadow>
            <cylinderGeometry args={[0.5,0.6,1.2,10]} />
            <meshStandardMaterial color="#7a6848" roughness={0.95} />
          </mesh>
          {/* Stone chunk debris */}
          <mesh position={[0.5,0.15,0.3]} castShadow>
            <dodecahedronGeometry args={[0.3,0]} />
            <meshStandardMaterial color="#5e4f34" roughness={1} />
          </mesh>
        </group>
      ))}
      {/* Standing half-wall */}
      {[[-14,1.5,0],[14,1.5,0],[0,1.5,-14]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]} castShadow>
          <boxGeometry args={[0.8,3,6]} />
          <meshStandardMaterial color="#6b5a3e" roughness={0.9} />
        </mesh>
      ))}
      {/* Web strands (spider cues) */}
      {[0,1,2,3].map(i=>(
        <mesh key={i} position={[Math.cos(i*1.57)*8, 3, Math.sin(i*1.57)*8]} rotation={[0,i*1.57,0.3]}>
          <cylinderGeometry args={[0.02,0.02,6,4]} />
          <meshStandardMaterial color="#e8e8e8" transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Warm torchlight from wall sconces */}
      {[[-12,2.5,0],[12,2.5,0],[0,2.5,-12]].map(([x,y,z],i)=>(
        <pointLight key={i} color="#ff8833" intensity={1.0} distance={12} position={[x,y,z]} />
      ))}
      <ambientLight color="#4a3820" intensity={0.6} />
      <directionalLight color="#7a5530" intensity={0.4} position={[0,10,5]} />
      <fog attach="fog" args={['#2a1f0e', 10, 35]} />
    </group>
  );
}

// ─── SPIDER RESCUE ────────────────────────────────────────────────────────
function SpiderRescueCourse() {
  return (
    <group>
      {/* Urban rubble floor */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[60,60]} />
        <meshStandardMaterial color="#4a4a4a" roughness={1} />
      </mesh>
      {/* Collapsed building sections */}
      {[[-8,1.5,-6],[6,2,2],[-4,1,8],[10,1.5,-10],[-12,2.5,4]].map(([x,y,z],i)=>(
        <group key={i} position={[x,0,z]}>
          <mesh position={[0,y/2,0]} castShadow>
            <boxGeometry args={[3+i*0.5, y, 2.5]} />
            <meshStandardMaterial color={`hsl(${210+i*10},8%,${30+i*5}%)`} roughness={0.95} />
          </mesh>
        </group>
      ))}
      {/* Survivor markers (orange glow) */}
      {[[-6,0.1,4],[4,0.1,-8],[0,0.1,14]].map(([x,y,z],i)=>(
        <group key={i} position={[x,y,z]}>
          <mesh>
            <cylinderGeometry args={[0.4,0.4,0.1,12]} />
            <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={1.0} />
          </mesh>
          <pointLight color="#ff4400" intensity={1.2} distance={6} />
        </group>
      ))}
      {/* Emergency light beams */}
      <pointLight color="#0044ff" intensity={2.0} distance={20} position={[-10,8,0]} />
      <pointLight color="#ff0000" intensity={2.0} distance={20} position={[10,8,0]} />
      <ambientLight color="#334455" intensity={0.4} />
      <directionalLight color="#6688aa" intensity={0.3} position={[0,12,0]} />
      <fog attach="fog" args={['#1a1a2a', 8, 30]} />
    </group>
  );
}

// ─── DRONE ROOFTOP ────────────────────────────────────────────────────────
function DroneRooftopCourse() {
  return (
    <group>
      {/* Sky backdrop — high altitude */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2,0]}>
        <planeGeometry args={[200,200]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
      {/* Rooftop platforms at varying heights */}
      {[
        [0,0,0, 8,0.4,8],
        [12,2,0, 6,0.4,6],
        [-12,1,4, 5,0.4,5],
        [0,4,-14, 7,0.4,7],
        [16,3,-12, 5,0.4,5],
        [-8,5,-18, 4,0.4,4],
      ].map(([x,y,z,w,h,d],i)=>(
        <group key={i} position={[x,y,z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w,h,d]} />
            <meshStandardMaterial color="#7a8799" roughness={0.7} metalness={0.2} />
          </mesh>
          {/* Rooftop details */}
          <mesh position={[w/2-0.5,0.3,0]}>
            <boxGeometry args={[0.3,0.6,d*0.8]} />
            <meshStandardMaterial color="#5a6370" />
          </mesh>
        </group>
      ))}
      {/* Delivery package targets */}
      {[[12,2.4,0],[0,4.4,-14],[-8,5.4,-18]].map(([x,y,z],i)=>(
        <group key={i} position={[x,y,z]}>
          <mesh>
            <boxGeometry args={[0.8,0.8,0.8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
          </mesh>
          <pointLight color="#38bdf8" intensity={0.8} distance={5} />
        </group>
      ))}
      {/* City buildings in far background */}
      {[-30,-20,-10,10,20,30].map((x,i)=>(
        <mesh key={i} position={[x,-5+i%3*2,-25]} castShadow>
          <boxGeometry args={[4, 15+i*3, 4]} />
          <meshStandardMaterial color="#445566" />
        </mesh>
      ))}
      <ambientLight color="#c0d8f0" intensity={1.4} />
      <directionalLight color="#fff8e0" intensity={1.2} position={[20,30,10]} castShadow />
      <pointLight color="#ffa020" intensity={0.6} distance={50} position={[0,20,0]} />
    </group>
  );
}

// ─── DRONE SURVEY ─────────────────────────────────────────────────────────
function DroneSurveyCourse() {
  return (
    <group>
      {/* Green countryside below */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1,0]}>
        <planeGeometry args={[100,100]} />
        <meshStandardMaterial color="#4a7c3f" roughness={0.9} />
      </mesh>
      {/* Survey grid waypoints (photo markers) */}
      {[
        [-16,4,-16],[0,5,-16],[16,4,-16],
        [-16,6,0], [0,7,0],  [16,6,0],
        [-16,4,16], [0,5,16], [16,4,16],
      ].map(([x,y,z],i)=>(
        <group key={i} position={[x,y,z]}>
          <mesh>
            <octahedronGeometry args={[0.3,0]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
          </mesh>
          <pointLight color="#22c55e" intensity={0.5} distance={5} />
        </group>
      ))}
      {/* Trees (countryside) */}
      {[[-8,0,8],[4,0,12],[-14,0,4],[10,0,-6],[-4,0,-10],[14,0,8]].map(([x,y,z],i)=>(
        <group key={i} position={[x,-1,z]}>
          <mesh position={[0,1.2,0]}>
            <cylinderGeometry args={[0.15,0.2,2.4,6]} />
            <meshStandardMaterial color="#5c3a1e" />
          </mesh>
          <mesh position={[0,3.2,0]}>
            <coneGeometry args={[1.1,2.4,7]} />
            <meshStandardMaterial color="#2d6a1a" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Farm fields (flat color patches) */}
      {[[-25,0.01,-25],[25,0.01,-25],[-25,0.01,25]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]} rotation={[-Math.PI/2,0,0]}>
          <planeGeometry args={[14,14]} />
          <meshStandardMaterial color={['#d4a853','#8bc34a','#c8862e'][i]} />
        </mesh>
      ))}
      <ambientLight color="#d0f0a0" intensity={1.3} />
      <directionalLight color="#fffbe0" intensity={1.1} position={[15,25,10]} castShadow />
      <pointLight color="#a0e060" intensity={0.4} distance={60} position={[0,15,0]} />
    </group>
  );
}

// ─── TANK MOUNTAIN ────────────────────────────────────────────────────────
function TankMountainCourse() {
  return (
    <group>
      {/* Rocky base */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[70,70]} />
        <meshStandardMaterial color="#6e5c4a" roughness={1} />
      </mesh>
      {/* Switchback ramp sections */}
      {[
        [0, 0.5, 5,   20,1,4, 0],
        [-7,1.5,-2,  4,1,12, 0.3],
        [5, 2.5,-8,  14,1,4, 0],
        [-4,3.5,-14, 4,1,10, -0.3],
        [4, 4.5,-18, 10,1,4, 0],
      ].map(([x,y,z,w,h,d,ry],i)=>(
        <mesh key={i} position={[x,y,z]} rotation={[0,ry,0]} castShadow receiveShadow>
          <boxGeometry args={[w,h,d]} />
          <meshStandardMaterial color={`hsl(25,${25+i*5}%,${32+i*4}%)`} roughness={0.95} />
        </mesh>
      ))}
      {/* Boulders blocking path */}
      {[[-4,1.5,2],[3,2.5,-5],[-2,3.5,-11],[6,4.5,-16]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]} castShadow>
          <dodecahedronGeometry args={[0.8+i*0.2,0]} />
          <meshStandardMaterial color="#5a4835" roughness={1} />
        </mesh>
      ))}
      {/* Summit flag */}
      <mesh position={[4,6.5,-18]}>
        <cylinderGeometry args={[0.05,0.05,2,6]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[4,7.5,-18]}>
        <planeGeometry args={[1.2,0.7]} />
        <meshStandardMaterial color="#ef4444" side={2} />
      </mesh>
      <ambientLight color="#c0a070" intensity={0.8} />
      <directionalLight color="#fff0d0" intensity={0.9} position={[10,20,5]} castShadow />
      <pointLight color="#e8c070" intensity={0.5} distance={30} position={[0,10,0]} />
      <fog attach="fog" args={['#a09080', 20, 50]} />
    </group>
  );
}

// ─── HUMANOID STAIRWELL ───────────────────────────────────────────────────
function HumanStairwellCourse() {
  const floors = 6;
  const stairH = 2.4;
  return (
    <group>
      {/* Concrete floor */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[20,20]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.8} />
      </mesh>
      {/* Stair flights — alternating sides */}
      {Array.from({length:floors}).map((_,i)=>{
        const y = i * stairH;
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <group key={i} position={[side*2.5, y, 0]}>
            {/* Landing */}
            <mesh position={[0, stairH/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[4, 0.2, 3]} />
              <meshStandardMaterial color={i%2===0?'#d1d5db':'#9ca3af'} roughness={0.7} />
            </mesh>
            {/* Stair steps */}
            {Array.from({length:8}).map((_,s)=>(
              <mesh key={s} position={[-side*0.25*s, stairH/2 - 0.25*s - 0.1, -1.5]} castShadow>
                <boxGeometry args={[0.5,0.2,3]} />
                <meshStandardMaterial color="#b0b8c4" roughness={0.8} />
              </mesh>
            ))}
            {/* Handrail */}
            <mesh position={[side*1.8, stairH/2+0.5, 0]}>
              <cylinderGeometry args={[0.03,0.03,stairH,6]} />
              <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* Floor number light */}
            <pointLight color="#60a5fa" intensity={0.6} distance={5} position={[0,stairH/2+1,0]} />
          </group>
        );
      })}
      {/* Top exit door */}
      <mesh position={[0, floors*stairH+0.1, -1]}>
        <boxGeometry args={[1.2, 2.4, 0.15]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <ambientLight color="#e0e8f0" intensity={0.8} />
      <directionalLight color="#ffffff" intensity={0.5} position={[0,20,5]} />
    </group>
  );
}

// ─── ARM SORT ─────────────────────────────────────────────────────────────
function ArmSortCourse() {
  const beltColors = ['#ef4444','#22c55e','#3b82f6','#f59e0b'];
  return (
    <group>
      {/* Factory floor */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[30,30]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.6} />
      </mesh>
      {/* Conveyor belt structure */}
      <mesh position={[0,0.5,0]} castShadow>
        <boxGeometry args={[16,0.2,2]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Belt surface */}
      <mesh position={[0,0.62,0]}>
        <boxGeometry args={[15.8,0.05,1.8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.3} />
      </mesh>
      {/* Colored packages on belt */}
      {[-6,-3,0,3,6].map((x,i)=>(
        <mesh key={i} position={[x,0.85,0]} castShadow>
          <boxGeometry args={[0.6,0.5,0.6]} />
          <meshStandardMaterial color={beltColors[i%4]} emissive={beltColors[i%4]} emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* Sort bins at the end */}
      {beltColors.map((c,i)=>(
        <group key={i} position={[8, 0, (i-1.5)*2.2]}>
          <mesh castShadow>
            <boxGeometry args={[1.5,1.2,1.8]} />
            <meshStandardMaterial color={c} transparent opacity={0.4} />
          </mesh>
          <pointLight color={c} intensity={0.5} distance={4} />
        </group>
      ))}
      {/* Robot arm base */}
      <mesh position={[0,0.9,2.5]} castShadow>
        <cylinderGeometry args={[0.4,0.5,1.8,12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
      </mesh>
      <ambientLight color="#f0f4f8" intensity={1.2} />
      <directionalLight color="#ffffff" intensity={1.0} position={[5,10,5]} castShadow />
      <pointLight color="#06b6d4" intensity={0.4} distance={20} position={[0,5,0]} />
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════════ */

export default function TestArenaEnvironment({ arenaId, arenaTheme = 'ground', difficulty = 'easy' }) {
  const course = getCourseMeta(arenaId);
  const obstacles = getObstaclesForArena(arenaId, difficulty);
  const accent = course.color || '#1e90ff';
  const baseFull = FLOOR_BY_THEME[arenaTheme] || FLOOR_BY_THEME.ground;
  const floorColor = DIFF_FLOOR_TINT[difficulty] || baseFull;
  const isUnderwater = arenaTheme === 'underwater';

  // ── Course-type detection ──────────────────────────────────────────
  const isTargetCourse    = arenaId === 'targets'    || arenaId.startsWith('targets_');
  const isCheckpointCourse = arenaId === 'checkpoint' || arenaId.startsWith('checkpoint_');
  const isSpeedrunCourse  = arenaId === 'speedrun'   || arenaId.startsWith('speedrun_');
  const isDodgeEasy       = arenaId === 'dodge_easy';
  const isDodgeMedium     = arenaId === 'dodge_medium';
  const isDodgeHard       = arenaId === 'dodge_hard';
  const isEscapeEasy      = arenaId === 'escape_easy';
  const isEscapeMedium    = arenaId === 'escape_medium';
  const isEscapeHard      = arenaId === 'escape_hard';
  const isCollectEasy     = arenaId === 'collect_easy';
  const isCollectMedium   = arenaId === 'collect_medium';
  const isCollectHard     = arenaId === 'collect_hard';
  const isFlightEasy      = arenaId === 'flight_easy';
  const isFlightMedium    = arenaId === 'flight_medium';
  const isFlightHard      = arenaId === 'flight_hard';
  // ── Signature robot courses ──────────────────────────────────────────
  // ── New robot-exclusive courses ───────────────────────────────────────
  const isRoverTransit    = arenaId === 'rover_transit';
  const isRoverDelivery   = arenaId === 'rover_delivery';
  const isRoverSurvey     = arenaId === 'rover_survey';
  const isSpiderPipeline  = arenaId === 'spider_pipeline';
  const isSpiderRuins     = arenaId === 'spider_ruins';
  const isSpiderRescue    = arenaId === 'spider_rescue';
  const isDroneCanyonNew  = arenaId === 'drone_canyon';
  const isDroneRooftop    = arenaId === 'drone_rooftop';
  const isDroneSurvey     = arenaId === 'drone_survey';
  const isTankDemolition  = arenaId === 'tank_demolition';
  const isTankMountain    = arenaId === 'tank_mountain';
  const isHumanAssembly   = arenaId === 'human_assembly';
  const isHumanStairwell  = arenaId === 'human_stairwell';
  const isArmSurgery      = arenaId === 'arm_surgery';
  const isArmSort         = arenaId === 'arm_sort';

  const isSpiderTemple     = arenaId === 'spider_temple';
  const isSpiderWeb        = arenaId === 'spider_web';
  const isSpiderCave       = arenaId === 'spider_cave';
  const isDroneSkyrace     = arenaId === 'drone_skyrace';
  const isDroneNeonCity    = arenaId === 'drone_neoncity';
  const isDroneSlalom      = arenaId === 'drone_slalom';
  const isHeavyWarehouse   = arenaId === 'heavy_warehouse';
  const isHeavyConstruction = arenaId === 'heavy_construction';
  const isHeavyMegaBuild   = arenaId === 'heavy_megabuild';

  // ── New 100-course expansion ──────────────────────────────────────────
  // Spider groups
  const isSpiderJungle   = ['spider_bridges','spider_vine','spider_maze','spider_guardian'].includes(arenaId);
  const isSpiderAdvanced = ['spider_interior','spider_river','spider_forest','spider_race','spider_web_city','spider_warzone'].includes(arenaId);
  const isSpiderElite    = ['spider_elemental','spider_labyrinth','spider_ruin_race','spider_trials'].includes(arenaId);
  const isSpiderEpic     = ['spider_infinite','spider_hunt','spider_gauntlet'].includes(arenaId);
  // Drone groups
  const isDroneAcademy   = ['drone_academy','drone_cloud_race','drone_gates','drone_wind','drone_gauntlet_easy'].includes(arenaId);
  const isDroneChallenge = ['drone_mountain','drone_asteroid','drone_storm','drone_speed_trials','drone_battle'].includes(arenaId);
  const isDroneEpic      = ['drone_volcano','drone_deep_space','drone_world_tour','drone_elite','drone_infinite_race','drone_legend','drone_ultimate'].includes(arenaId);
  // Heavy groups
  const isHeavyBasics    = ['heavy_basics','heavy_lifting','heavy_drill_run','heavy_cargo','heavy_clear'].includes(arenaId);
  const isHeavyAdvanced  = ['heavy_mining','heavy_bridge','heavy_urban','heavy_salvage','heavy_demolition','heavy_disaster','heavy_deep_mine','heavy_world_build','heavy_boss'].includes(arenaId);
  const isHeavyEpic      = ['heavy_infinite','heavy_legendary','heavy_ultimate'].includes(arenaId);
  // Ninja groups
  const isNinjaTraining  = ['ninja_training','ninja_stealth','ninja_target','ninja_infiltrate','ninja_escape'].includes(arenaId);
  const isNinjaStrike    = ['ninja_city_strike','ninja_heat_scan','ninja_laser_maze','ninja_night_ops','ninja_assassin'].includes(arenaId);
  const isNinjaElite     = ['ninja_fortress','ninja_dogfight','ninja_base_raid','ninja_shadow_war','ninja_elite_ops','ninja_black_site','ninja_super_stealth','ninja_infinite_war','ninja_legendary','ninja_ultimate'].includes(arenaId);
  // Humanoid groups
  const isHumanBasics    = ['human_basics','human_combat_intro','human_platform','human_shield','human_first_boss'].includes(arenaId);
  const isHumanArena     = ['human_arena','human_jungle','human_city','human_dodge','human_weapons','human_tournament','human_army','human_ruins','human_elemental','human_shadow'].includes(arenaId);
  const isHumanEpic      = ['human_championship','human_warrior','human_infinite','human_legend','human_ultimate'].includes(arenaId);

  const isNewExpansionCourse = isSpiderJungle || isSpiderAdvanced || isSpiderElite || isSpiderEpic
    || isDroneAcademy || isDroneChallenge || isDroneEpic
    || isHeavyBasics || isHeavyAdvanced || isHeavyEpic
    || isNinjaTraining || isNinjaStrike || isNinjaElite
    || isHumanBasics || isHumanArena || isHumanEpic;

  // Shorthand flags
  const isNewCourse = isDodgeEasy || isDodgeMedium || isDodgeHard
    || isEscapeEasy || isEscapeMedium || isEscapeHard
    || isCollectEasy || isCollectMedium || isCollectHard
    || isFlightEasy || isFlightMedium || isFlightHard
    || isSpiderTemple || isSpiderWeb || isSpiderCave
    || isDroneSkyrace || isDroneNeonCity || isDroneSlalom
    || isHeavyWarehouse || isHeavyConstruction || isHeavyMegaBuild
    || isNewExpansionCourse
    || isRoverTransit || isRoverDelivery || isRoverSurvey
    || isSpiderPipeline || isSpiderRuins || isSpiderRescue
    || isDroneCanyonNew || isDroneRooftop || isDroneSurvey
    || isTankDemolition || isTankMountain
    || isHumanAssembly || isHumanStairwell
    || isArmSurgery || isArmSort;

  // Obstacle sub-sets for existing courses
  const checkpointObs = obstacles.filter((o) => o.type === 'ring');
  const targetObs     = obstacles.filter((o) => o.r && !o.type);

  return (
    <group>
      {/* ── Facility shell (only for non-custom-floor courses) ── */}
      {!isNewCourse && <TestArenaFacility accent={accent} />}

      {/* ── Underwater volume ── */}
      {isUnderwater && (
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[30, 8, 30]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}

      {/* ── Standard arena base (only for existing courses) ── */}
      {!isNewCourse && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <circleGeometry args={[14, 64]} />
            <meshStandardMaterial color={floorColor} metalness={isUnderwater ? 0.5 : 0.28} roughness={0.42} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} receiveShadow>
            <ringGeometry args={[11.5, 13.8, 64]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} transparent opacity={0.35} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
            <circleGeometry args={[9, 48]} />
            <meshStandardMaterial color="#f0f6fc" metalness={0.22} roughness={0.38} />
          </mesh>
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
        </>
      )}

      {/* ══════════════════════════════════════════════
          EXISTING COURSE RENDERING
         ══════════════════════════════════════════════ */}

      {!isNewCourse && (
        <>
          {isTargetCourse
            ? targetObs.map((o, i) => (
                <TargetMarker key={`tgt-${i}`} position={[o.x, 0, o.z]} color={course.color || '#ec4899'} />
              ))
            : isCheckpointCourse
              ? checkpointObs.map((o, i) => (
                  <CheckpointPortal key={`cp-${i}`} position={[o.x, 0.78, o.z]} color={course.color || '#14b8a6'} index={i} />
                ))
              : obstacles.map((o, i) => <ArenaObstacle key={`obs-${i}`} o={o} index={i} />)
          }

          {isSpeedrunCourse && (
            <>
              {[-4, -2, 0, 2, 4].map((z) => <SpeedBoostStrip key={z} z={z} />)}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, -5]}>
                <planeGeometry args={[10, 0.6]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
              </mesh>
            </>
          )}

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
          {(difficulty === 'medium' || difficulty === 'hard') && arenaId === 'linefollow' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.027, 0]}>
              <planeGeometry args={[difficulty === 'hard' ? 0.22 : 0.30, 14]} />
              <meshStandardMaterial color="#00e676" emissive="#00c853" emissiveIntensity={0.55} transparent opacity={0.7} />
            </mesh>
          )}

          {arenaId === 'square' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[3.2, 3.45, 4]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.25} />
            </mesh>
          )}

          {arenaId === 'delivery' && <DeliveryZones />}
          {arenaId === 'collect'   && <CollectTargets />}

          {difficulty !== 'easy' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.009, 0]}>
              <ringGeometry args={[10, 10.5, 48]} />
              <meshStandardMaterial
                color={difficulty === 'hard' ? '#ef4444' : '#f59e0b'}
                emissive={difficulty === 'hard' ? '#ef4444' : '#f59e0b'}
                emissiveIntensity={0.18} transparent opacity={0.4}
              />
            </mesh>
          )}

          <group position={[0, 0, 0]}>
            <PulseRing position={[0, 0.04, 0]} color={accent} scale={1.4} />
          </group>
        </>
      )}

      {/* ══════════════════════════════════════════════
          NEW ANIMATED COURSE RENDERING
         ══════════════════════════════════════════════ */}

      {/* — DODGE — */}
      {isDodgeEasy   && <DodgeRollingBalls arenaId={arenaId} />}
      {isDodgeMedium && <DodgeLaserMaze arenaId={arenaId} />}
      {isDodgeHard   && <AsteroidField arenaId={arenaId} />}

      {/* — ESCAPE — */}
      {isEscapeEasy   && <CrushingWall arenaId={arenaId} />}
      {isEscapeMedium && <HunterPursuers arenaId={arenaId} />}
      {isEscapeHard   && <SwarmDrones arenaId={arenaId} />}

      {/* — COLLECT — */}
      {isCollectEasy   && <CollectEasyCourse />}
      {isCollectMedium && <CollectMediumCourse />}
      {isCollectHard   && <CollectHardCourse />}

      {/* — FLIGHT — */}
      {isFlightEasy   && <FlightEasyCourse obstacles={obstacles} courseColor={course.color} />}
      {isFlightMedium && <FlightMediumCourse obstacles={obstacles} courseColor={course.color} />}
      {isFlightHard   && <FlightHardCourse obstacles={obstacles} />}

      {/* ══════════════════════════════════════════════
          SIGNATURE ROBOT COURSES
         ══════════════════════════════════════════════ */}

      {/* — EXPLORER SPIDER — */}
      {isSpiderTemple && <SpiderTempleCourse />}
      {isSpiderWeb    && <SpiderWebCourse />}
      {isSpiderCave   && <SpiderCaveCourse />}

      {/* — RACER DRONE — */}
      {isDroneSkyrace  && <DroneSkyCourse obstacles={obstacles} />}
      {isDroneNeonCity && <DroneNeonCityCourse obstacles={obstacles} />}
      {isDroneSlalom   && <DroneSlalomCourse obstacles={obstacles} />}

      {/* — HEAVY ROBOT — */}
      {isHeavyWarehouse    && <HeavyWarehouseCourse />}
      {isHeavyConstruction && <HeavyConstructionCourse />}
      {isHeavyMegaBuild    && <HeavyMegaBuildCourse />}

      {/* ══════════════════════════════════════════════
          100-COURSE EXPANSION ENVIRONMENTS
         ══════════════════════════════════════════════ */}

      {/* — SPIDER EXPANSION — */}
      {isSpiderJungle   && <SpiderJungleCourse   obstacles={obstacles} />}
      {isSpiderAdvanced && <SpiderAdvancedCourse obstacles={obstacles} />}
      {isSpiderElite    && <SpiderEliteCourse    obstacles={obstacles} />}
      {isSpiderEpic     && <SpiderEpicCourse     obstacles={obstacles} />}

      {/* — DRONE EXPANSION — */}
      {isDroneAcademy   && <DroneAcademyCourse   obstacles={obstacles} />}
      {isDroneChallenge && <DroneChallengeCourse obstacles={obstacles} />}
      {isDroneEpic      && <DroneEpicCourse      obstacles={obstacles} />}

      {/* — HEAVY EXPANSION — */}
      {isHeavyBasics    && <HeavyBasicsCourse    obstacles={obstacles} />}
      {isHeavyAdvanced  && <HeavyAdvancedCourse  obstacles={obstacles} />}
      {isHeavyEpic      && <HeavyEpicCourse      obstacles={obstacles} />}

      {/* — NINJA EXPANSION — */}
      {isNinjaTraining  && <NinjaTrainingCourse  obstacles={obstacles} />}
      {isNinjaStrike    && <NinjaStrikeCourse    obstacles={obstacles} />}
      {isNinjaElite     && <NinjaEliteCourse     obstacles={obstacles} />}

      {/* — HUMANOID EXPANSION — */}
      {isHumanBasics    && <HumanoidBasicsCourse obstacles={obstacles} />}
      {isHumanArena     && <HumanoidArenaCourse  obstacles={obstacles} />}
      {isHumanEpic      && <HumanoidEpicCourse   obstacles={obstacles} />}

      {/* ══════════════════════════════════════════════
          ROBOT-EXCLUSIVE SIGNATURE ENVIRONMENTS
         ══════════════════════════════════════════════ */}
      {isRoverTransit   && <RoverTransitCourse />}
      {isRoverDelivery  && <RoverDeliveryCourse />}
      {isRoverSurvey    && <RoverSurveyCourse />}
      {isSpiderPipeline && <SpiderPipelineCourse />}
      {isSpiderRuins    && <SpiderRuinsCourse />}
      {isSpiderRescue   && <SpiderRescueCourse />}
      {isDroneCanyonNew && <DroneCanyonCourse />}
      {isDroneRooftop   && <DroneRooftopCourse />}
      {isDroneSurvey    && <DroneSurveyCourse />}
      {isTankDemolition && <TankDemolitionCourse />}
      {isTankMountain   && <TankMountainCourse />}
      {isHumanAssembly  && <HumanoidAssemblyCourse />}
      {isHumanStairwell && <HumanStairwellCourse />}
      {isArmSurgery     && <ArmSurgeryCourse />}
      {isArmSort        && <ArmSortCourse />}
    </group>
  );
}
