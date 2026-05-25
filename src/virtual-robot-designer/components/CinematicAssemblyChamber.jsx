/**
 * CinematicAssemblyChamber.jsx
 * Full-screen R3F scene — the futuristic robotics hangar.
 * The robot dominates the centre; atmospheric world surrounds it.
 */

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Stars,
  Sparkles,
  ContactShadows,
  Grid,
  Environment,
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import HeroRobotModel from './HeroRobotModel.jsx';

/* ── Animated holographic hex floor ────────────────────────── */
function HoloFloor() {
  const ringRef1 = useRef();
  const ringRef2 = useRef();
  const ringRef3 = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef1.current) {
      const s = 1 + ((t * 0.3) % 1) * 5;
      ringRef1.current.scale.set(s, 1, s);
      ringRef1.current.material.opacity = Math.max(0, 0.35 - ((t * 0.3) % 1) * 0.35);
    }
    if (ringRef2.current) {
      const s = 1 + (((t * 0.3) + 0.33) % 1) * 5;
      ringRef2.current.scale.set(s, 1, s);
      ringRef2.current.material.opacity = Math.max(0, 0.35 - (((t * 0.3) + 0.33) % 1) * 0.35);
    }
    if (ringRef3.current) {
      const s = 1 + (((t * 0.3) + 0.66) % 1) * 5;
      ringRef3.current.scale.set(s, 1, s);
      ringRef3.current.material.opacity = Math.max(0, 0.35 - (((t * 0.3) + 0.66) % 1) * 0.35);
    }
  });

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00d4ff',
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  }), []);

  return (
    <group position={[0, -0.82, 0]}>
      {/* Dark reflective base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#010812" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Holographic grid lines */}
      <Grid
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#002244"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#003366"
        fadeDistance={25}
        fadeStrength={1.5}
        infiniteGrid
      />

      {/* Expanding holographic rings */}
      {[ringRef1, ringRef2, ringRef3].map((ref, i) => (
        <mesh key={i} ref={ref} rotation={[-Math.PI / 2, 0, 0]} material={ringMat}>
          <ringGeometry args={[0.8, 0.84, 48]} />
        </mesh>
      ))}

      {/* Assembly platform — elevated circle under robot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial color="#010f22" metalness={0.95} roughness={0.08}
          emissive="#001830" emissiveIntensity={0.3} />
      </mesh>

      {/* Platform border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.1, 2.22, 48]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.9}
          transparent opacity={0.8} />
      </mesh>

      {/* Secondary rings */}
      {[2.8, 3.6].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[r, r + 0.04, 48]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff"
            emissiveIntensity={0.4 - i * 0.15} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Corner markers */}
      {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
          <ringGeometry args={[0.06, 0.1, 8]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Assembly crane arms (background) ──────────────────────── */
function AssemblyCrane({ position, rotation = 0 }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a1428', metalness: 0.85, roughness: 0.4,
  }), []);
  const glowM = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fb923c', emissive: '#fb923c', emissiveIntensity: 0.9, metalness: 0.2, roughness: 0.5,
  }), []);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Vertical pillar */}
      <mesh material={mat} scale={[0.18, 6.5, 0.18]} position={[0, 3.2, 0]}>
        <boxGeometry />
      </mesh>
      {/* Horizontal arm */}
      <mesh material={mat} scale={[3.5, 0.14, 0.14]} position={[1.6, 6.5, 0]}>
        <boxGeometry />
      </mesh>
      {/* Hanging cable */}
      <mesh material={mat} scale={[0.03, 2.4, 0.03]} position={[3.2, 5.3, 0]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
      </mesh>
      {/* Hook */}
      <mesh material={mat} scale={[0.2, 0.14, 0.14]} position={[3.2, 4.1, 0]}>
        <boxGeometry />
      </mesh>
      {/* Warning lights */}
      <mesh material={glowM} scale={[0.1, 0.1, 0.1]} position={[3.25, 6.5, 0]}>
        <sphereGeometry args={[1, 8, 8]} />
        <pointLight color="#fb923c" intensity={0.8} distance={3} decay={2} />
      </mesh>
      {/* Cross braces */}
      <mesh material={mat} scale={[0.06, 2.8, 0.06]} position={[0, 4.2, 0]}
        rotation={[0, 0, Math.PI * 0.22]}>
        <boxGeometry />
      </mesh>
      {/* Structural detail strips */}
      {[1.5, 3.0, 4.5].map((y, i) => (
        <mesh key={i} material={mat} scale={[0.24, 0.06, 0.24]} position={[0, y, 0]}>
          <boxGeometry />
        </mesh>
      ))}
    </group>
  );
}

/* ── Patrol drone ───────────────────────────────────────────── */
function PatrolDrone({ startAngle = 0, radius = 7, height = 4.5, speed = 0.3 }) {
  const droneRef = useRef();
  const propRefs = [useRef(), useRef(), useRef(), useRef()];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const angle = startAngle + t * speed;
    if (droneRef.current) {
      droneRef.current.position.x = Math.cos(angle) * radius;
      droneRef.current.position.z = Math.sin(angle) * radius;
      droneRef.current.position.y = height + Math.sin(t * 1.2) * 0.15;
      droneRef.current.rotation.y = angle + Math.PI / 2;
    }
    propRefs.forEach(r => {
      if (r.current) r.current.rotation.y += 0.25;
    });
  });

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a2840', metalness: 0.9, roughness: 0.25,
  }), []);
  const lightMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00d4ff', emissive: '#00d4ff', emissiveIntensity: 1.2,
  }), []);
  const armMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#141e32', metalness: 0.88, roughness: 0.3,
  }), []);

  const ARM_POSITIONS = useMemo(() => [
    [0.28, 0, 0.28], [-0.28, 0, 0.28], [0.28, 0, -0.28], [-0.28, 0, -0.28],
  ], []);

  return (
    <group ref={droneRef}>
      {/* Body disc */}
      <mesh material={bodyMat} scale={[0.32, 0.06, 0.32]}>
        <cylinderGeometry args={[1, 0.85, 1, 8]} />
      </mesh>
      {/* Underbelly camera */}
      <mesh material={lightMat} scale={[0.06, 0.06, 0.06]} position={[0, -0.05, 0]}>
        <sphereGeometry args={[1, 8, 8]} />
        <pointLight color="#00d4ff" intensity={0.5} distance={2} decay={2} />
      </mesh>
      {/* Arms + propellers */}
      {ARM_POSITIONS.map((armPos, i) => (
        <group key={i} position={armPos}>
          <mesh material={armMat} scale={[0.3, 0.018, 0.018]}>
            <boxGeometry />
          </mesh>
          <group ref={propRefs[i]}>
            <mesh material={bodyMat} scale={[0.22, 0.012, 0.045]}
              position={[0, 0.02, 0]} rotation={[0, Math.PI * 0.15, 0]}>
              <boxGeometry />
            </mesh>
            <mesh material={bodyMat} scale={[0.22, 0.012, 0.045]}
              position={[0, 0.02, 0]} rotation={[0, Math.PI * 0.65, 0]}>
              <boxGeometry />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/* ── Background industrial pillars ─────────────────────────── */
function IndustrialPillar({ position }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#080e1c', metalness: 0.85, roughness: 0.55,
  }), []);
  const stripM = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00d4ff', emissive: '#00d4ff', emissiveIntensity: 0.35,
  }), []);

  return (
    <group position={position}>
      <mesh material={mat} scale={[0.45, 8, 0.45]}>
        <boxGeometry />
      </mesh>
      {/* Light strips */}
      {[1, 2.5, 4, 5.5].map((y, i) => (
        <mesh key={i} material={stripM} scale={[0.46, 0.05, 0.46]}
          position={[0, y, 0]}>
          <boxGeometry />
        </mesh>
      ))}
    </group>
  );
}

/* ── Volumetric atmosphere particles ────────────────────────── */
function AtmosphereParticles() {
  return (
    <>
      <Sparkles
        count={80}
        scale={18}
        size={1.2}
        speed={0.15}
        opacity={0.25}
        color="#00d4ff"
        position={[0, 3, 0]}
      />
      <Sparkles
        count={40}
        scale={12}
        size={0.8}
        speed={0.08}
        opacity={0.18}
        color="#a855f7"
        position={[0, 5, 0]}
      />
    </>
  );
}

/* ── Cinematic lights ────────────────────────────────────────── */
function CinematicLighting() {
  const spotRef1 = useRef();
  const spotRef2 = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Very subtle light animation
    if (spotRef1.current) {
      spotRef1.current.intensity = 4.5 + Math.sin(t * 0.3) * 0.3;
    }
    if (spotRef2.current) {
      spotRef2.current.intensity = 2.5 + Math.sin(t * 0.5 + 1) * 0.2;
    }
  });

  return (
    <>
      {/* Ambient — deep space blue */}
      <ambientLight intensity={0.12} color="#0a1830" />

      {/* Key light — cool white from top-right */}
      <spotLight
        ref={spotRef1}
        position={[6, 10, 4]}
        angle={0.35}
        penumbra={0.7}
        intensity={4.5}
        color="#c8e0ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.001}
        target-position={[0, 0, 0]}
      />

      {/* Fill light — warm from left */}
      <spotLight
        ref={spotRef2}
        position={[-5, 7, 2]}
        angle={0.5}
        penumbra={0.9}
        intensity={2.5}
        color="#8090c8"
      />

      {/* Rim light — from behind, cyan */}
      <spotLight
        position={[0, 6, -7]}
        angle={0.6}
        penumbra={0.8}
        intensity={3.5}
        color="#0080ff"
      />

      {/* Floor bounce — warm */}
      <pointLight position={[0, -0.5, 0]} intensity={0.8} color="#001040" distance={8} decay={2} />

      {/* Atmosphere top light */}
      <hemisphereLight skyColor="#0a1840" groundColor="#000510" intensity={0.6} />

      {/* Ceiling industrial lights */}
      {[[-5, 9, 0], [5, 9, 0], [0, 9, -5], [0, 9, 5]].map((pos, i) => (
        <pointLight key={i} position={pos} intensity={0.4} color="#1a2850" distance={12} decay={1.5} />
      ))}
    </>
  );
}

/* ── Full hangar world ──────────────────────────────────────── */
function HangarWorld() {
  return (
    <>
      <HoloFloor />

      {/* Assembly cranes */}
      <AssemblyCrane position={[-9, -0.82, -6]} rotation={Math.PI * 0.15} />
      <AssemblyCrane position={[ 9, -0.82, -7]} rotation={-Math.PI * 0.2} />
      <AssemblyCrane position={[-8, -0.82,  5]} rotation={Math.PI * 0.4} />

      {/* Pillars */}
      <IndustrialPillar position={[-9, -0.82, -9]} />
      <IndustrialPillar position={[ 9, -0.82, -9]} />
      <IndustrialPillar position={[-9, -0.82,  8]} />
      <IndustrialPillar position={[ 9, -0.82,  8]} />

      {/* Patrol drones */}
      <PatrolDrone startAngle={0}            radius={8} height={4.5} speed={0.25} />
      <PatrolDrone startAngle={Math.PI}      radius={7} height={5.5} speed={0.18} />
      <PatrolDrone startAngle={Math.PI / 2}  radius={9} height={3.8} speed={0.30} />

      {/* Distant stars / machinery sparks */}
      <Stars radius={35} depth={30} count={800} factor={2} saturation={0.3} fade speed={0.5} />

      {/* Atmosphere particles */}
      <AtmosphereParticles />

      {/* Ground contact shadows */}
      <ContactShadows
        position={[0, -0.81, 0]}
        width={6}
        height={6}
        far={4}
        blur={2.5}
        opacity={0.7}
        color="#000020"
      />

      {/* Background wall */}
      <mesh position={[0, 5, -16]} rotation={[0, 0, 0]}>
        <planeGeometry args={[50, 22]} />
        <meshStandardMaterial color="#04080f" metalness={0.5} roughness={0.8} />
      </mesh>
      <mesh position={[0, 5, 16]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[50, 22]} />
        <meshStandardMaterial color="#03060c" metalness={0.5} roughness={0.8} />
      </mesh>
      <mesh position={[-16, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[50, 22]} />
        <meshStandardMaterial color="#040810" metalness={0.5} roughness={0.8} />
      </mesh>
      <mesh position={[16, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[50, 22]} />
        <meshStandardMaterial color="#040810" metalness={0.5} roughness={0.8} />
      </mesh>
    </>
  );
}

/* ── Postprocessing stack ────────────────────────────────────── */
function PostFX() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.25}
        luminanceSmoothing={0.4}
        intensity={1.8}
        radius={0.6}
        blendFunction={BlendFunction.ADD}
      />
      <ChromaticAberration
        offset={[0.0012, 0.0012]}
        blendFunction={BlendFunction.NORMAL}
      />
      <Vignette
        eskil={false}
        offset={0.15}
        darkness={0.65}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXPORTED CANVAS COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function CinematicAssemblyChamber({ design, onPartAdd }) {
  return (
    <Canvas
      className="hangar-canvas"
      camera={{ position: [4.5, 3, 8], fov: 48, near: 0.1, far: 200 }}
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      scene={{ background: new THREE.Color('#000814'), fog: new THREE.FogExp2('#000814', 0.045) }}
    >
      <Suspense fallback={null}>
        <CinematicLighting />
        <HangarWorld />

        {/* THE HERO ROBOT — centrepiece of the entire scene */}
        <HeroRobotModel design={design} onPartAdd={onPartAdd} />

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI * 0.22}
          maxPolarAngle={Math.PI * 0.62}
          minDistance={4}
          maxDistance={16}
          autoRotate
          autoRotateSpeed={0.4}
          dampingFactor={0.06}
          enableDamping
          target={[0, 0.4, 0]}
        />

        <PostFX />
      </Suspense>
    </Canvas>
  );
}
