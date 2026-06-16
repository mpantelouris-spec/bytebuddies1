/**
 * THEME ENVIRONMENTS — Premium visual overhaul for ByteBuddies simulator
 * Neon Cyber Arena, Fantasy Forest, Candy Kingdom, Space Station, Ice World, Lava World
 */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedParticles({ count = 50, color = '#00d9ff', speed = 0.5, scale = 0.1 }) {
  const meshRef = useRef();
  const positionAttribute = useRef(new Float32Array(count * 3));
  const velocityAttribute = useRef(new Float32Array(count * 3));

  useMemo(() => {
    for (let i = 0; i < count; i++) {
      positionAttribute.current[i * 3] = (Math.random() - 0.5) * 30;
      positionAttribute.current[i * 3 + 1] = Math.random() * 15;
      positionAttribute.current[i * 3 + 2] = (Math.random() - 0.5) * 30;

      velocityAttribute.current[i * 3] = (Math.random() - 0.5) * speed;
      velocityAttribute.current[i * 3 + 1] = (Math.random() - 0.5) * speed;
      velocityAttribute.current[i * 3 + 2] = (Math.random() - 0.5) * speed;
    }
  }, [count, speed]);

  useFrame(() => {
    if (!meshRef.current) return;
    const positions = positionAttribute.current;
    for (let i = 0; i < count; i++) {
      positions[i * 3] += velocityAttribute.current[i * 3];
      positions[i * 3 + 1] += velocityAttribute.current[i * 3 + 1];
      positions[i * 3 + 2] += velocityAttribute.current[i * 3 + 2];

      if (positions[i * 3] > 20) positions[i * 3] = -20;
      if (positions[i * 3] < -20) positions[i * 3] = 20;
      if (positions[i * 3 + 1] > 15) positions[i * 3 + 1] = -2;
      if (positions[i * 3 + 1] < -2) positions[i * 3 + 1] = 15;
      if (positions[i * 3 + 2] > 20) positions[i * 3 + 2] = -20;
      if (positions[i * 3 + 2] < -20) positions[i * 3 + 2] = 20;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positionAttribute.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={scale}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function GlowingFloor({ color = '#00d9ff', size = 30, intensity = 0.3 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.emissiveIntensity = intensity + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
  });
  return (
    <mesh ref={ref} position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
}

function AnimatedLight({ position, color = '#00d9ff', intensity = 2, range = 20 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.intensity = intensity + Math.sin(state.clock.elapsedTime * 2) * (intensity * 0.3);
  });
  return (
    <pointLight
      ref={ref}
      position={position}
      color={color}
      intensity={intensity}
      distance={range}
      castShadow
    />
  );
}

function Skybox({ color = '#0a0a1a' }) {
  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={color} side={THREE.BackSide} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEON CYBER ARENA
// ─────────────────────────────────────────────────────────────────────────────

export function NeoCyberArena() {
  return (
    <group>
      <Skybox color="#0a0a2e" />
      <fog attach="fog" args={['#0a0a2e', 5, 60]} />

      {/* Reflective floor with grid */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30, 30, 30]} />
        <meshStandardMaterial
          color="#0d0d3e"
          emissive="#0d0d3e"
          emissiveIntensity={0.15}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Glowing grid lines */}
      <group>
        {Array.from({ length: 15 }).map((_, i) => (
          <React.Fragment key={i}>
            <mesh position={[-15 + i * 2, 0, 0]} scale={[30, 0.05, 0.1]}>
              <boxGeometry />
              <meshBasicMaterial color="#00d9ff" emissive="#00d9ff" />
            </mesh>
            <mesh position={[0, 0, -15 + i * 2]} scale={[0.1, 0.05, 30]}>
              <boxGeometry />
              <meshBasicMaterial color="#00d9ff" emissive="#00d9ff" opacity={0.5} transparent />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* Animated corner pillars with lights */}
      {[[-7, 7], [7, 7], [-7, -7], [7, -7]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.4, 8, 8]} />
            <meshStandardMaterial
              color="#00d9ff"
              emissive="#0099ff"
              emissiveIntensity={0.4}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <AnimatedLight position={[0, 4, 0]} color="#00d9ff" intensity={2.5} />
          <AnimatedLight position={[0, 2, 0]} color="#ff00ff" intensity={1.5} />
        </group>
      ))}

      {/* Central holographic structure */}
      <group position={[0, 3, 0]}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <octahedronGeometry args={[3, 2]} />
          <meshStandardMaterial
            color="#00d9ff"
            emissive="#0099ff"
            emissiveIntensity={0.3}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>

      {/* Animated particles */}
      <AnimatedParticles count={100} color="#00d9ff" speed={0.3} scale={0.08} />

      {/* Ambient + directional lights */}
      <ambientLight intensity={0.4} color="#00d9ff" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FANTASY FOREST
// ─────────────────────────────────────────────────────────────────────────────

export function FantasyForest() {
  return (
    <group>
      <Skybox color="#1a0a2e" />
      <fog attach="fog" args={['#2d1b4e', 8, 70]} />

      {/* Earthy forest floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#3d2817"
          map={new THREE.CanvasTexture(
            (() => {
              const canvas = document.createElement('canvas');
              canvas.width = 256;
              canvas.height = 256;
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = '#3d2817';
              ctx.fillRect(0, 0, 256, 256);
              for (let i = 0; i < 100; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
                ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 20, Math.random() * 20);
              }
              return canvas;
            })()
          )}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Giant mushrooms */}
      {[[0, 5], [6, 3], [-8, 4], [7, -6]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Mushroom stem */}
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.6, 3, 12]} />
            <meshStandardMaterial color="#c9a96e" roughness={0.7} />
          </mesh>
          {/* Mushroom cap */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshStandardMaterial
              color="#d43636"
              emissive="#d43636"
              emissiveIntensity={0.15}
              roughness={0.6}
            />
          </mesh>
          {/* Cap spots */}
          {Array.from({ length: 5 }).map((_, j) => (
            <mesh
              key={j}
              position={[
                Math.cos((j / 5) * Math.PI * 2) * 1.3,
                2.5 + Math.sin(j) * 0.3,
                Math.sin((j / 5) * Math.PI * 2) * 1.3,
              ]}
            >
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffff99" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Glowing flowers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 8 + Math.sin(i) * 2;
        return (
          <group
            key={`flower-${i}`}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
          >
            <mesh>
              <cylinderGeometry args={[0.1, 0.15, 1.2, 6]} />
              <meshStandardMaterial color="#2d5016" />
            </mesh>
            {Array.from({ length: 5 }).map((_, p) => (
              <mesh
                key={p}
                position={[
                  Math.cos((p / 5) * Math.PI * 2) * 0.4,
                  1,
                  Math.sin((p / 5) * Math.PI * 2) * 0.4,
                ]}
              >
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial
                  color={`hsl(${60 + i * 15}, 100%, 60%)`}
                  emissive={`hsl(${60 + i * 15}, 100%, 60%)`}
                  emissiveIntensity={0.4}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Animated fireflies */}
      <AnimatedParticles count={60} color="#ffff99" speed={0.2} scale={0.12} />

      {/* Atmospheric lights */}
      <ambientLight intensity={0.5} color="#ffddaa" />
      <directionalLight
        position={[8, 6, 8]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANDY KINGDOM
// ─────────────────────────────────────────────────────────────────────────────

export function CandyKingdom() {
  return (
    <group>
      <Skybox color="#ffe0f0" />
      <fog attach="fog" args={['#fff0f8', 10, 80]} />

      {/* Candy-colored floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#ffe0f0"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Candy cane pillars */}
      {[[5, 5], [-5, 5], [5, -5], [-5, -5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.35, 0.35, 6, 12]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#cc0000"
              emissiveIntensity={0.2}
              roughness={0.4}
            />
          </mesh>
          {/* White stripes */}
          {Array.from({ length: 8 }).map((_, j) => (
            <mesh key={j} position={[0, -2 + j * 1.5, 0]}>
              <torusGeometry args={[0.38, 0.1, 12, 6]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Donut bridges */}
      {[[0, 4], [0, -4], [4, 0]].map(([x, z], i) => (
        <mesh
          key={i}
          position={[x, 0.5, z]}
          rotation={Math.abs(x) > 0.1 ? [0, Math.PI / 2, 0] : [Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[1.5, 0.4, 16, 32]} />
          <meshStandardMaterial
            color="#d4a574"
            emissive="#d4a574"
            emissiveIntensity={0.2}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Marshmallow clouds */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = (i - 2.5) * 8;
        const z = -10 + Math.sin(i) * 3;
        return (
          <group key={i} position={[x, 6 + Math.cos(i * 0.5) * 1, z]}>
            {Array.from({ length: 4 }).map((_, c) => (
              <mesh
                key={c}
                position={[c * 0.8 - 1.2, 0, 0]}
                castShadow
              >
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#fff9e6"
                  emissiveIntensity={0.2}
                  roughness={0.6}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Candy lights */}
      <AnimatedParticles count={40} color="#ffccff" speed={0.15} scale={0.1} />

      <ambientLight intensity={0.6} color="#ffddff" />
      <directionalLight
        position={[6, 8, 6]}
        intensity={0.9}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPACE STATION
// ─────────────────────────────────────────────────────────────────────────────

export function SpaceStation() {
  return (
    <group>
      <Skybox color="#000000" />
      <fog attach="fog" args={['#0a0a2e', 20, 120]} />

      {/* Metallic floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30, 20, 20]} />
        <meshStandardMaterial
          color="#2a2a3e"
          emissive="#1a1a2e"
          emissiveIntensity={0.1}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Planet visible through window */}
      <mesh position={[15, 5, -20]} scale={[8, 8, 8]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#ff3333"
          emissiveIntensity={0.3}
          roughness={0.6}
        />
      </mesh>

      {/* Moving stars */}
      <AnimatedParticles count={200} color="#ffffff" speed={0.1} scale={0.08} />

      {/* Holographic control panels */}
      {[[-6, 6], [6, 6], [-6, -6], [6, -6]].map(([x, z], i) => (
        <group key={i} position={[x, 1.5, z]}>
          <mesh castShadow>
            <boxGeometry args={[1.2, 2, 0.2]} />
            <meshStandardMaterial
              color="#00d9ff"
              emissive="#0099ff"
              emissiveIntensity={0.4}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
          {/* Screen lines */}
          {Array.from({ length: 6 }).map((_, j) => (
            <mesh key={j} position={[-0.5 + j * 0.2, 0, 0.15]}>
              <boxGeometry args={[0.15, 0.1, 0.05]} />
              <meshBasicMaterial color="#00ff99" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Corner beacon lights */}
      {[[-7, 7], [7, 7], [-7, -7], [7, -7]].map(([x, z], i) => (
        <group key={i} position={[x, 3, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.3, 1.5, 8]} />
            <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={0.5} />
          </mesh>
          <AnimatedLight position={[0, 1, 0]} color="#ffaa00" intensity={1.5} />
        </group>
      ))}

      <ambientLight intensity={0.3} color="#0099ff" />
      <directionalLight
        position={[10, 6, 10]}
        intensity={0.7}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICE WORLD
// ─────────────────────────────────────────────────────────────────────────────

export function IceWorld() {
  return (
    <group>
      <Skybox color="#e0f7ff" />
      <fog attach="fog" args={['#b0e0ff', 8, 100]} />

      {/* Icy floor with cracks */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#b0e0ff"
          emissive="#7fc9ff"
          emissiveIntensity={0.15}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>

      {/* Ice formations */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 8, 0, Math.sin(angle) * 8]}>
            <mesh castShadow>
              <coneGeometry args={[1, 4, 8]} />
              <meshStandardMaterial
                color="#a0d8ff"
                emissive="#7fb3ff"
                emissiveIntensity={0.2}
                metalness={0.6}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* Snow particles */}
      <AnimatedParticles count={120} color="#ffffff" speed={0.15} scale={0.12} />

      {/* Northern lights aurora */}
      <mesh position={[0, 8, -20]} scale={[30, 5, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.2}
        />
      </mesh>
      <mesh position={[0, 10, -20]} scale={[25, 4, 1]} rotation={[0, 0, 0.2]}>
        <planeGeometry />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Icy pillars */}
      {[[-5, 5], [5, 5], [-5, -5], [5, -5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.5, 5, 6]} />
            <meshStandardMaterial
              color="#c0e8ff"
              emissive="#80d0ff"
              emissiveIntensity={0.2}
              metalness={0.7}
              roughness={0.15}
            />
          </mesh>
        </group>
      ))}

      <ambientLight intensity={0.7} color="#a0d8ff" />
      <directionalLight
        position={[8, 5, 8]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAVA WORLD
// ─────────────────────────────────────────────────────────────────────────────

export function LavaWorld() {
  return (
    <group>
      <Skybox color="#330000" />
      <fog attach="fog" args={['#660000', 6, 60]} />

      {/* Lava floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#ff4500"
          emissive="#ff2200"
          emissiveIntensity={0.6}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Lava pillars */}
      {[[-6, 6], [6, 6], [-6, -6], [6, -6]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.6, 4, 12]} />
            <meshStandardMaterial
              color="#cc3300"
              emissive="#ff3300"
              emissiveIntensity={0.4}
              roughness={0.7}
            />
          </mesh>
        </group>
      ))}

      {/* Heat particles */}
      <AnimatedParticles count={80} color="#ff6600" speed={0.25} scale={0.15} />

      {/* Smoke particles */}
      <AnimatedParticles count={60} color="#666666" speed={0.2} scale={0.2} />

      {/* Heat glow lights */}
      {[[-7, 7], [7, 7], [-7, -7], [7, -7]].map(([x, z], i) => (
        <AnimatedLight key={i} position={[x, 3, z]} color="#ff3300" intensity={2} range={15} />
      ))}

      <ambientLight intensity={0.5} color="#ff6600" />
      <directionalLight
        position={[8, 6, 8]}
        intensity={1}
        color="#ffaa00"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeEnvironmentSelector({ arenaId }) {
  const themeMap = {
    // Neon themes
    'drone_neoncity': NeoCyberArena,
    'drone_slalom': NeoCyberArena,
    'ninja_laser_maze': NeoCyberArena,

    // Fantasy themes
    'spider_forest': FantasyForest,
    'spider_vine': FantasyForest,

    // Candy themes
    'heavy_lifting': CandyKingdom,

    // Space themes
    'drone_deep_space': SpaceStation,
    'drone_world_tour': SpaceStation,

    // Ice themes
    'drone_mountain': IceWorld,
    'ninja_fortress': IceWorld,

    // Lava themes
    'drone_volcano': LavaWorld,
    'heavy_boss': LavaWorld,
  };

  const EnvironmentComponent = themeMap[arenaId] || NeoCyberArena;
  return <EnvironmentComponent />;
}
