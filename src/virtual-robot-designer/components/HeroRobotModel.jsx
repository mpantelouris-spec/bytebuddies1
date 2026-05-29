/**
 * HeroRobotModel.jsx
 * AAA-quality procedural robot — the visual centrepiece of the Hangar Experience.
 * Built entirely from Three.js primitives so no external assets are needed.
 */

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VIEWPORT } from '../constants/sizes.js';
import { VRD_COLORS } from '../constants/colors.js';
import ChassisBody from './workshop/ChassisBodies.jsx';

/* ── Material helpers ───────────────────────────────────────── */
function steelMat({ color = '#1a2a50', metalness = 0.88, roughness = 0.28, emissive = '#000000', emissiveIntensity = 0, product = false } = {}) {
  const c = new THREE.Color(color);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  const isBright = product || hsl.l > 0.82;
  return new THREE.MeshStandardMaterial({
    color,
    metalness: isBright ? 0.32 : metalness,
    roughness: isBright ? 0.34 : roughness,
    emissive,
    emissiveIntensity,
    envMapIntensity: isBright ? 0.52 : 0.95,
  });
}

function glowMat({ color = '#00d4ff', emissiveIntensity = 1.0 } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    metalness: 0.1,
    roughness: 0.5,
  });
}

function darkMat(color = '#0d1525') {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.55 });
}

/* ── Shared geometry instances ──────────────────────────────── */
const SPHERE_HI = new THREE.SphereGeometry(1, 20, 20);
const SPHERE_LO = new THREE.SphereGeometry(1, 10, 10);
const CYL_SM    = new THREE.CylinderGeometry(1, 1, 1, 12);
const CYL_LO    = new THREE.CylinderGeometry(1, 1, 1, 8);
const BOX_GEO   = new THREE.BoxGeometry(1, 1, 1);
const RING_GEO  = new THREE.TorusGeometry(1, 0.04, 8, 32);

/* ── Sub-components ─────────────────────────────────────────── */

/** A small structural rivet sphere */
function Rivet({ pos, r = 0.022, matColor = '#2a3a60' }) {
  const mat = useMemo(() => steelMat({ color: matColor, metalness: 0.92, roughness: 0.2 }), [matColor]);
  return (
    <mesh geometry={SPHERE_LO} material={mat} position={pos} scale={[r, r, r]} />
  );
}

/** A cylinder-style hydraulic piston */
function Hydraulic({ from, to, radius = 0.04, color = '#1e3060' }) {
  const mat = useMemo(() => steelMat({ color, metalness: 0.95, roughness: 0.15 }), [color]);
  const [start, end] = useMemo(() => [new THREE.Vector3(...from), new THREE.Vector3(...to)], [from, to]);
  const mid = useMemo(() => start.clone().add(end).multiplyScalar(0.5), [start, end]);
  const len = useMemo(() => start.distanceTo(end), [start, end]);
  const dir = useMemo(() => end.clone().sub(start).normalize(), [start, end]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);
  return (
    <mesh material={mat} position={mid} quaternion={quat} scale={[radius, len, radius]}>
      <cylinderGeometry args={[1, 1, 1, 8]} />
    </mesh>
  );
}

/** LED strip — thin emissive box */
function LEDStrip({ position, rotation = [0, 0, 0], size = [1, 0.025, 0.025], color = '#00d4ff', intensity = 1.0 }) {
  const mat = useMemo(() => glowMat({ color, emissiveIntensity: intensity }), [color, intensity]);
  return <mesh geometry={BOX_GEO} material={mat} position={position} rotation={rotation} scale={size} />;
}

/* ═══════════════════════════════════════════════════════════
   ROVER / ADVANCED ROBOT BODY
   ═══════════════════════════════════════════════════════════ */

function RoverBody({ primaryColor, accentColor, product = false }) {
  const bodyMat  = useMemo(() => steelMat({ color: primaryColor, metalness: 0.85, roughness: 0.32, product }), [primaryColor, product]);
  const armorMat = useMemo(() => steelMat({ color: primaryColor, metalness: 0.92, roughness: 0.2, product }), [primaryColor, product]);
  const darkM    = useMemo(() => darkMat('#0d1525'), []);
  const accentM  = useMemo(() => glowMat({ color: accentColor, emissiveIntensity: 0.9 }), [accentColor]);
  const coreM    = useMemo(() => glowMat({ color: product ? accentColor : '#a855f7', emissiveIntensity: product ? 1.2 : 1.6 }), [accentColor, product]);

  const rivets = useMemo(() => [
    [-0.55, 0.38, 0.62], [0.55, 0.38, 0.62], [-0.55, -0.1, 0.62], [0.55, -0.1, 0.62],
    [-0.6, 0.35, 0.42], [0.6, 0.35, 0.42],
  ], []);

  return (
    <group position={[0, 0.05, 0]}>
      {/* Rounded corner caps (smoother product look) */}
      {product && [[-0.62, 0.54, 0.72], [0.62, 0.54, 0.72], [-0.62, 0.54, -0.72], [0.62, 0.54, -0.72]].map((p, i) => (
        <mesh key={i} geometry={SPHERE_LO} material={bodyMat} position={p} scale={[0.14, 0.14, 0.14]} />
      ))}

      {/* ── Main hull ── */}
      <mesh geometry={BOX_GEO} material={bodyMat} scale={[1.25, 0.62, 1.55]} position={[0, 0.54, 0]} />

      {/* Orange racing stripe */}
      {product && (
        <mesh geometry={BOX_GEO} position={[-0.64, 0.54, 0]} scale={[0.04, 0.45, 1.35]}>
          <meshStandardMaterial color="#FF8C00" metalness={0.4} roughness={0.35} emissive="#FF8C00" emissiveIntensity={0.15} />
        </mesh>
      )}

      {/* Upper deck plate */}
      <mesh geometry={BOX_GEO} material={armorMat} scale={[1.18, 0.06, 1.42]} position={[0, 0.88, 0]} />

      {/* Front face armour overlay */}
      <mesh geometry={BOX_GEO} material={armorMat} scale={[1.25, 0.62, 0.05]} position={[0, 0.54, 0.78]} />

      {/* Front upper bevel */}
      <mesh geometry={BOX_GEO} material={darkM} scale={[1.25, 0.14, 0.12]} position={[0, 0.88, 0.71]}
        rotation={[Math.PI * 0.22, 0, 0]} />

      {/* Side skirts */}
      <mesh geometry={BOX_GEO} material={armorMat} scale={[0.055, 0.5, 1.4]} position={[-0.65, 0.4, 0]} />
      <mesh geometry={BOX_GEO} material={armorMat} scale={[0.055, 0.5, 1.4]} position={[ 0.65, 0.4, 0]} />

      {/* Shoulder pauldrons */}
      <mesh geometry={BOX_GEO} material={armorMat} scale={[0.1, 0.3, 0.8]} position={[-0.7, 0.72, 0.1]} />
      <mesh geometry={BOX_GEO} material={armorMat} scale={[0.1, 0.3, 0.8]} position={[ 0.7, 0.72, 0.1]} />

      {/* Chest core housing */}
      <mesh material={darkM} position={[0, 0.56, 0.81]} scale={[0.25, 0.25, 0.06]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
      </mesh>
      {/* Chest core glow sphere */}
      <mesh geometry={SPHERE_HI} material={coreM} scale={[0.1, 0.1, 0.1]} position={[0, 0.56, 0.84]}>
        <pointLight color="#a855f7" intensity={3} distance={2.5} decay={2} />
      </mesh>

      {/* Front sensor visor strip */}
      <LEDStrip position={[0, 0.74, 0.8]} size={[0.85, 0.04, 0.03]} color={accentColor} intensity={1.2} />

      {/* Side LED strips */}
      <LEDStrip position={[-0.63, 0.62, 0]}   rotation={[0, 0, 0]}  size={[0.03, 0.03, 1.3]}  color={accentColor} />
      <LEDStrip position={[ 0.63, 0.62, 0]}   rotation={[0, 0, 0]}  size={[0.03, 0.03, 1.3]}  color={accentColor} />
      <LEDStrip position={[0, 0.865, 0]}       rotation={[0, 0, 0]}  size={[1.18, 0.03, 0.03]} color={accentColor} intensity={0.7} />

      {/* Back detail strip */}
      <LEDStrip position={[0, 0.62, -0.78]} size={[0.9, 0.03, 0.03]} color={accentColor} intensity={0.6} />

      {/* Panel line details */}
      <mesh geometry={BOX_GEO} material={darkM} scale={[0.012, 0.55, 0.03]} position={[-0.42, 0.54, 0.8]} />
      <mesh geometry={BOX_GEO} material={darkM} scale={[0.012, 0.55, 0.03]} position={[ 0.42, 0.54, 0.8]} />
      <mesh geometry={BOX_GEO} material={darkM} scale={[1.25, 0.01, 0.03]} position={[0, 0.38, 0.8]} />

      {/* Rivets */}
      {rivets.map((p, i) => <Rivet key={i} pos={p} />)}

      {/* Back power unit */}
      <mesh geometry={BOX_GEO} material={armorMat} scale={[1.1, 0.4, 0.18]} position={[0, 0.6, -0.86]} />
      <mesh geometry={BOX_GEO} material={darkM}   scale={[0.95, 0.28, 0.1]}  position={[0, 0.6, -0.96]} />
      {/* Vent slits */}
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <mesh key={i} geometry={BOX_GEO} material={darkM} scale={[0.04, 0.22, 0.12]} position={[x, 0.6, -0.97]} />
      ))}
      <LEDStrip position={[0, 0.8, -0.86]} size={[1.05, 0.03, 0.02]} color="#fb923c" intensity={0.8} />
    </group>
  );
}

/** Scanning head that rotates left/right */
function RobotHead({ accentColor, headRef, product = false, mountY = 1.05, mountZ = 0.32 }) {
  const bodyMat  = useMemo(() => steelMat({ color: '#141e38', metalness: 0.88, roughness: 0.26, product }), [product]);
  const armorMat = useMemo(() => steelMat({ color: '#1a2640', metalness: 0.94, roughness: 0.18, product }), [product]);
  const eyeM     = useMemo(() => glowMat({ color: accentColor, emissiveIntensity: 1.8 }), [accentColor]);
  const darkM    = useMemo(() => darkMat('#080e1c'), []);

  return (
    <group ref={headRef} position={[0, mountY, mountZ]}>
      {/* Neck */}
      <mesh material={darkM} scale={[0.18, 0.22, 0.18]}>
        <cylinderGeometry args={[1, 1.2, 1, 8]} />
      </mesh>
      <mesh material={armorMat} scale={[0.24, 0.06, 0.24]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
      </mesh>

      {/* Head block */}
      <mesh geometry={BOX_GEO} material={bodyMat} scale={[0.55, 0.38, 0.48]} position={[0, 0.26, 0.04]} />

      {/* Forehead armour */}
      <mesh geometry={BOX_GEO} material={armorMat} scale={[0.55, 0.1, 0.05]} position={[0, 0.42, 0.25]} />

      {/* Main visor / eye strip */}
      <mesh geometry={BOX_GEO} material={darkM} scale={[0.48, 0.1, 0.04]} position={[0, 0.24, 0.25]} />

      {/* Eye lenses */}
      <mesh material={eyeM} scale={[0.07, 0.07, 0.03]} position={[-0.12, 0.24, 0.27]}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <pointLight color={accentColor} intensity={1.5} distance={1.2} decay={2} />
      </mesh>
      <mesh material={eyeM} scale={[0.07, 0.07, 0.03]} position={[0.12, 0.24, 0.27]}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
      </mesh>

      {/* Side panels */}
      <mesh geometry={BOX_GEO} material={armorMat} scale={[0.05, 0.32, 0.38]} position={[-0.28, 0.26, 0.04]} />
      <mesh geometry={BOX_GEO} material={armorMat} scale={[0.05, 0.32, 0.38]} position={[ 0.28, 0.26, 0.04]} />

      {/* Chin */}
      <mesh geometry={BOX_GEO} material={darkM} scale={[0.42, 0.08, 0.3]} position={[0, 0.08, 0.14]} />

      {/* Status LED top */}
      <LEDStrip position={[0, 0.46, 0.08]} size={[0.45, 0.025, 0.025]} color={accentColor} intensity={0.8} />
    </group>
  );
}

/** 4 wheel pods with animated spinning wheels */
function WheelSystem({ primaryColor, accentColor, wheelsRef, product = false }) {
  const hubMat = useMemo(() => steelMat({ color: product ? '#1a1a2e' : '#0e1828', metalness: 0.9, roughness: 0.35 }), [product]);
  const tireMat = useMemo(() => steelMat({ color: '#0a0e18', metalness: 0.55, roughness: 0.8 }), []);
  const wheelBlueM = useMemo(() => steelMat({ color: '#1E90FF', metalness: 0.35, roughness: 0.28, product: true }), []);
  const houseMat = useMemo(
    () => (product ? wheelBlueM : steelMat({ color: primaryColor, metalness: 0.82, roughness: 0.38, product })),
    [primaryColor, product, wheelBlueM],
  );
  const armMat = useMemo(() => steelMat({ color: '#1a2848', metalness: 0.88, roughness: 0.3 }), []);
  const rimGlowM = useMemo(() => glowMat({ color: product ? '#1E90FF' : accentColor, emissiveIntensity: product ? 1.0 : 0.7 }), [accentColor, product]);

  const pods = useMemo(() => [
    { pos: [-0.68, -0.12, 0.58],  mirror: 1  },
    { pos: [ 0.68, -0.12, 0.58],  mirror: -1 },
    { pos: [-0.68, -0.12, -0.5],  mirror: 1  },
    { pos: [ 0.68, -0.12, -0.5],  mirror: -1 },
  ], []);

  return (
    <group>
      {pods.map((pod, i) => (
        <group key={i} position={pod.pos}>
          {/* Suspension arm */}
          <mesh geometry={BOX_GEO} material={armMat} scale={[0.22, 0.06, 0.06]} position={[pod.mirror * -0.05, 0, 0]} />
          {/* Wheel housing */}
          <mesh geometry={BOX_GEO} material={houseMat} scale={[0.22, 0.42, 0.52]} position={[pod.mirror * 0.05, 0, 0]} />
          {/* Tire — cylinder rotated 90° so it faces sideways (rolls on X axis) */}
          <mesh material={tireMat} position={[pod.mirror * 0.10, 0, 0]} scale={[0.22, 0.32, 0.32]}
            rotation={[0, 0, Math.PI / 2]}
            ref={el => { if (wheelsRef.current) wheelsRef.current[i] = el; }}>
            <cylinderGeometry args={[1, 1, 1, 20]} />
          </mesh>
          {/* Hub cap */}
          <mesh material={hubMat} position={[pod.mirror * 0.18, 0, 0]} scale={[0.04, 0.16, 0.16]}>
            <cylinderGeometry args={[1, 1, 1, 8]} />
          </mesh>
          {/* Rim glow ring */}
          <mesh material={rimGlowM} position={[pod.mirror * 0.10, 0, 0]} rotation={[0, 0, Math.PI / 2]}
            scale={[0.30, 0.30, 0.30]}>
            <torusGeometry args={[1, 0.06, 8, 24]} />
          </mesh>
          {/* Hydraulic strut */}
          <Hydraulic from={[0, 0.14, 0]} to={[0, -0.06, 0]} radius={0.025} color="#1e3050" />
        </group>
      ))}
    </group>
  );
}

/** Walking leg system */
function LegSystem({ primaryColor, accentColor, legCount = 4 }) {
  const legMat = useMemo(() => steelMat({ color: primaryColor, metalness: 0.5, roughness: 0.4, product: true }), [primaryColor]);
  const jointMat = useMemo(() => steelMat({ color: '#1a2848', metalness: 0.85, roughness: 0.3 }), []);
  const footMat = useMemo(() => glowMat({ color: accentColor, emissiveIntensity: 0.6 }), [accentColor]);

  const positions = useMemo(() => {
    if (legCount >= 6) {
      return [
        [-0.55, -0.2, 0.45], [0.55, -0.2, 0.45], [-0.55, -0.2, 0], [0.55, -0.2, 0],
        [-0.55, -0.2, -0.45], [0.55, -0.2, -0.45],
      ];
    }
    return [[-0.5, -0.15, 0.5], [0.5, -0.15, 0.5], [-0.5, -0.15, -0.5], [0.5, -0.15, -0.5]];
  }, [legCount]);

  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh geometry={BOX_GEO} material={jointMat} scale={[0.08, 0.08, 0.08]} position={[0, 0.2, 0]} />
          <mesh geometry={BOX_GEO} material={legMat} scale={[0.06, 0.35, 0.06]} position={[0, 0, 0]} />
          <mesh geometry={BOX_GEO} material={footMat} scale={[0.1, 0.05, 0.14]} position={[0, -0.22, 0.05]} />
        </group>
      ))}
    </group>
  );
}

/** Hover pods / rotors / jet thrusters */
function HoverSystem({ accentColor, partId = 'hover' }) {
  const podMat = useMemo(() => glowMat({ color: accentColor, emissiveIntensity: 0.9 }), [accentColor]);
  const ringMat = useMemo(() => steelMat({ color: '#37474f', metalness: 0.7, roughness: 0.35 }), []);
  const isJet = partId === 'jet' || partId === 'antigrav';
  const isRotor = partId === 'rotors' || partId === 'quad_props';

  const pods = useMemo(() => {
    if (isRotor) {
      return [[-0.55, 0.35, 0.55], [0.55, 0.35, 0.55], [-0.55, 0.35, -0.55], [0.55, 0.35, -0.55]];
    }
    return [[-0.45, -0.35, 0.5], [0.45, -0.35, 0.5], [-0.45, -0.35, -0.5], [0.45, -0.35, -0.5]];
  }, [isRotor]);

  return (
    <group>
      {pods.map((pos, i) => (
        <group key={i} position={pos}>
          {isRotor ? (
            <mesh material={ringMat} rotation={[Math.PI / 2, 0, 0]} scale={[0.35, 0.35, 0.02]}>
              <cylinderGeometry args={[1, 1, 1, 16]} />
            </mesh>
          ) : (
            <mesh material={podMat} scale={[0.2, isJet ? 0.12 : 0.08, 0.2]}>
              <cylinderGeometry args={[1, 1, 1, 20]} />
            </mesh>
          )}
          <pointLight color={accentColor} intensity={0.4} distance={1.5} decay={2} />
        </group>
      ))}
    </group>
  );
}

/** Tank track system */
function TrackSystem({ primaryColor, accentColor }) {
  const trackMat = useMemo(() => steelMat({ color: '#0a0e18', metalness: 0.6, roughness: 0.7 }), []);
  const sprocket = useMemo(() => steelMat({ color: '#1a2640', metalness: 0.9, roughness: 0.2 }), []);
  const guardMat = useMemo(() => steelMat({ color: primaryColor, metalness: 0.82, roughness: 0.38 }), [primaryColor]);

  const TRACK_LINKS = 14;
  const trackLinks = useMemo(() => {
    const out = [];
    for (let i = 0; i < TRACK_LINKS; i++) {
      const a = (i / TRACK_LINKS) * Math.PI * 2;
      const rx = 0.72, ry = 0.23;
      out.push({ x: Math.cos(a) * rx, y: Math.sin(a) * ry, angle: a });
    }
    return out;
  }, []);

  return (
    <group>
      {[-0.78, 0.78].map((xOff, si) => (
        <group key={si} position={[xOff, 0.26, 0]}>
          {/* Track guard */}
          <mesh geometry={BOX_GEO} material={guardMat} scale={[0.14, 0.5, 1.62]} position={[0, 0, 0]} />
          {/* Track links */}
          {trackLinks.map((l, i) => (
            <mesh key={i} geometry={BOX_GEO} material={trackMat}
              position={[0, l.y, l.x]}
              rotation={[l.angle + Math.PI / 2, 0, 0]}
              scale={[0.1, 0.1, 0.14]}
            />
          ))}
          {/* Sprockets */}
          {[-0.68, 0.68].map((z, j) => (
            <mesh key={j} material={sprocket} position={[0, 0, z]} scale={[0.06, 0.28, 0.28]}
              rotation={[0, 0, 0]}>
              <cylinderGeometry args={[1, 1, 1, 8]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Top antenna with blinking tip */
function Antenna({ accentColor, antennaRef }) {
  const poleMat = useMemo(() => steelMat({ color: '#1a2848', metalness: 0.95, roughness: 0.15 }), []);
  const tipMat  = useMemo(() => glowMat({ color: accentColor, emissiveIntensity: 2.0 }), [accentColor]);

  return (
    <group ref={antennaRef} position={[0.3, 1.0, -0.1]}>
      {/* Main pole */}
      <mesh material={poleMat} scale={[0.018, 0.45, 0.018]}>
        <cylinderGeometry args={[1, 1.2, 1, 6]} />
      </mesh>
      {/* Cross bar */}
      <mesh geometry={BOX_GEO} material={poleMat} scale={[0.12, 0.012, 0.012]} position={[0, 0.18, 0]} />
      {/* Blinking tip */}
      <mesh ref={antennaRef} geometry={SPHERE_LO} material={tipMat} scale={[0.038, 0.038, 0.038]} position={[0, 0.235, 0]}>
        <pointLight color={accentColor} intensity={1.2} distance={0.8} decay={2} />
      </mesh>
    </group>
  );
}

/** Sensor assembly on front */
function SensorPod({ accentColor, partId = 'ultrasonic', position = [0, 0.54, 0.86] }) {
  const podMat     = useMemo(() => darkMat('#0a0f1e'), []);
  const sensorGlow = useMemo(() => glowMat({ color: accentColor, emissiveIntensity: 1.4 }), [accentColor]);
  const lidarM     = useMemo(() => glowMat({ color: '#00ff82', emissiveIntensity: 1.6 }), []);

  if (partId === 'lidar') {
    return (
      <group position={position}>
        <mesh material={podMat} scale={[0.18, 0.06, 0.18]}>
          <cylinderGeometry args={[1, 1, 1, 12]} />
        </mesh>
        <mesh material={lidarM} scale={[0.15, 0.03, 0.15]} position={[0, 0.04, 0]}>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <pointLight color="#00ff82" intensity={1.2} distance={1.5} decay={2} />
        </mesh>
      </group>
    );
  }

  // Default: ultrasonic pair
  return (
    <group position={position}>
      {[-0.1, 0.1].map((xOff, i) => (
        <group key={i} position={[xOff, 0, 0]}>
          <mesh material={podMat} scale={[0.072, 0.072, 0.06]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
          </mesh>
          <mesh material={sensorGlow} scale={[0.055, 0.055, 0.02]} position={[0, 0, 0.035]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** LEGO-style block robot for block build mode */
function LegoRobot({ blocks = [], primaryColor = '#4a90e2', accentColor = '#00d4ff' }) {
  const colors = useMemo(() => ({
    cube:     new THREE.MeshStandardMaterial({ color: primaryColor, metalness: 0.4, roughness: 0.45 }),
    armor:    new THREE.MeshStandardMaterial({ color: '#1e3a6e', metalness: 0.75, roughness: 0.25 }),
    hinge:    new THREE.MeshStandardMaterial({ color: '#1a1a2e', metalness: 0.88, roughness: 0.2  }),
    wheel:    new THREE.MeshStandardMaterial({ color: '#0d1525', metalness: 0.7, roughness: 0.6   }),
    track:    new THREE.MeshStandardMaterial({ color: '#14203a', metalness: 0.8, roughness: 0.5   }),
    stud:     new THREE.MeshStandardMaterial({ color: '#243050', metalness: 0.9, roughness: 0.15  }),
    connector: new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.5 }),
  }), [primaryColor, accentColor]);

  const activeCells = useMemo(() => {
    if (blocks && blocks.length > 0) return blocks;
    // Default LEGO robot if no blocks
    const defs = [];
    // Body row 1
    for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) defs.push({ x, y: 0, z, type: 'cube' });
    // Body row 2
    for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) defs.push({ x, y: 1, z, type: 'armor' });
    // Row 3 (narrower)
    for (let x = -1; x <= 1; x++) defs.push({ x, y: 2, z: 0, type: 'armor' });
    // Head
    defs.push({ x: 0, y: 3, z: 0, type: 'hinge' });
    // Wheels
    [[-2, 0, -1], [2, 0, -1], [-2, 0, 1], [2, 0, 1]].forEach(([x,y,z]) =>
      defs.push({ x, y, z, type: 'wheel' }));
    return defs;
  }, [blocks]);

  const BLOCK = 0.38;

  return (
    <group scale={[0.9, 0.9, 0.9]}>
      {activeCells.map((cell, i) => {
        const mat = colors[cell.type] || colors.cube;
        const bx = cell.x * BLOCK;
        const by = cell.y * BLOCK;
        const bz = cell.z * BLOCK;

        if (cell.type === 'wheel') {
          return (
            <group key={i} position={[bx, by + 0.12, bz]}>
              <mesh material={mat} scale={[BLOCK * 0.7, BLOCK * 0.7, BLOCK * 0.38]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[1, 1, 1, 16]} />
              </mesh>
            </group>
          );
        }

        return (
          <group key={i} position={[bx, by, bz]}>
            {/* Block body */}
            <mesh geometry={BOX_GEO} material={mat} scale={[BLOCK * 0.95, BLOCK * 0.82, BLOCK * 0.95]} />
            {/* Stud on top */}
            <mesh material={colors.stud} position={[0, BLOCK * 0.44, 0]} scale={[BLOCK * 0.28, BLOCK * 0.16, BLOCK * 0.28]}>
              <cylinderGeometry args={[1, 1, 1, 12]} />
            </mesh>
            {/* Connector glow on active face */}
            {cell.connector && (
              <mesh material={colors.connector} position={[0, BLOCK * 0.45, 0]} scale={[BLOCK * 0.22, BLOCK * 0.04, BLOCK * 0.22]}>
                <cylinderGeometry args={[1, 1, 1, 12]} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN HERO ROBOT COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function HeroRobotModel({
  design,
  onPartAdd,
  productVisual = false,
  workshopGrounded = false,
  heroScale: heroScaleProp,
}) {
  const groupRef   = useRef();
  const headRef    = useRef();
  const antennaRef = useRef();
  const wheelsRef  = useRef(new Array(4).fill(null));
  const timeRef    = useRef(0);

  // Design defaults
  const asm         = design?.assembly || {};
  const buildMode   = asm.buildMode || 'advanced';
  const base        = asm.base || {};
  const slots       = asm.slots || {};
  const cosmetics   = design?.cosmetics || {};

  const primaryColor = productVisual
    ? (base.color && base.color !== '#8B00FF' ? base.color : '#1a3060')
    : (cosmetics.primaryColor || base.color || '#1a3060');
  const accentColor = productVisual
    ? (cosmetics.ledColor || VRD_COLORS.cyan)
    : (cosmetics.ledColor || '#00d4ff');
  const template     = design?.template || 'rover';

  const movementType = slots.movement?.partId || design?.wheels?.type || 'standard';
  const wheelType = design?.wheels?.type || 'standard';
  const legCount = design?.wheels?.count || 4;
  const hasMovement  = !!slots.movement;
  const showHead     = !!slots.head;
  const frontPlaced  = slots.front;
  const showFrontSensor = !!(frontPlaced && frontPlaced.category === 'sensors');
  const sensorType   = frontPlaced?.partId || 'ultrasonic';
  const showAntenna  = !!(slots.back?.category === 'comms' || slots.top?.category === 'comms');

  const chassisType = base.chassisType || 'rover';
  const bodyH = (base.height ?? 0.62) * (base.scale ?? 1);
  const bodyD = (base.depth ?? 1.2) * (base.scale ?? 1);
  const headMountY = 0.54 + bodyH * 0.52;
  const headMountZ = bodyD * 0.28;

  const chassisMul = useMemo(() => {
    const m = {
      rover: 1,
      tank: 1.12,
      humanoid: 0.92,
      drone: 0.78,
      spider: 1.02,
      industrial: 1.15,
      racing: 1.08,
      exploration: 1,
    };
    return m[chassisType] || 1;
  }, [chassisType]);

  // Animation loop
  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    if (groupRef.current) {
      const breathe = workshopGrounded ? 0.004 : productVisual ? 0.012 : 0.025;
      groupRef.current.position.y = Math.sin(t * 0.8) * breathe;
      if (workshopGrounded) {
        groupRef.current.rotation.y = 0;
      } else if (productVisual) {
        groupRef.current.rotation.y += delta * 0.22;
      } else {
        groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.04;
      }
    }

    // Head scan
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.55) * 0.48;
      headRef.current.rotation.x = Math.sin(t * 0.3) * 0.06;
    }

    // Antenna blink (scale pulse)
    if (antennaRef.current) {
      const blink = Math.sin(t * 4) > 0.7 ? 1.0 : 0.15;
      antennaRef.current.scale.setScalar(0.038 * (0.85 + blink * 0.15));
    }

    // Wheel spin
    wheelsRef.current.forEach(w => {
      if (w) w.rotation.x += delta * 1.4;
    });
  });

  if (buildMode === 'blocks') {
    return (
      <group ref={groupRef} position={[0, workshopGrounded ? 0.08 : 0.5, 0]}>
        <LegoRobot blocks={asm.blocks} primaryColor={primaryColor} accentColor={accentColor} />
      </group>
    );
  }

  const trackIds = ['tracks', 'mini_tracks', 'rubber_tracks', 'heavy'];
  const legIds = ['legs', 'spider_legs', 'hydraulic_legs', 'walker', 'climbing_legs'];
  const hoverIds = ['hover', 'jet', 'rotors', 'quad_props', 'antigrav', 'amphibious_prop', 'magnetic_rail'];
  const useTracks = wheelType === 'tracks' || trackIds.includes(movementType);
  const useLegs = wheelType === 'legs' || legIds.includes(movementType);
  const useHover = wheelType === 'hover' || hoverIds.includes(movementType);
  const baseHero = heroScaleProp ?? (productVisual ? VIEWPORT.heroScale : 1.4);
  const heroScale = baseHero * chassisMul;
  const bodyYOffset = workshopGrounded
    ? (useHover ? 0.12 : hasMovement ? 0 : 0.02)
    : (useHover ? 0.22 : hasMovement ? 0 : -0.08);

  return (
    <group ref={groupRef} position={[0, bodyYOffset, 0]} scale={[heroScale, heroScale, heroScale]}>
      {!workshopGrounded && (
        <>
          <pointLight position={[0, -0.3, 0]} color="#1a2850" intensity={0.4} distance={3} decay={2} />
          <pointLight position={[0, 0.56, 0.5]} color={accentColor} intensity={0.6} distance={3} decay={2} />
        </>
      )}

      {/* Main body — switches mesh by chassisType + shape */}
      <ChassisBody
        chassisType={chassisType}
        shape={base.shape}
        width={base.width ?? 1}
        height={base.height ?? 0.62}
        depth={base.depth ?? 1.2}
        scale={base.scale ?? 1}
        primaryColor={primaryColor}
        accentColor={accentColor}
        product={productVisual}
        material={base.material || 'plastic'}
      />

      {/* Head */}
      {showHead && (
        <RobotHead
          accentColor={accentColor}
          headRef={headRef}
          product={productVisual}
          mountY={headMountY}
          mountZ={headMountZ}
        />
      )}

      {/* Movement — only after kid adds wheels/tracks */}
      {hasMovement && useTracks && (
        <TrackSystem primaryColor={primaryColor} accentColor={accentColor} />
      )}
      {hasMovement && useLegs && !useTracks && (
        <LegSystem primaryColor={primaryColor} accentColor={accentColor} legCount={legCount} />
      )}
      {hasMovement && useHover && !useTracks && !useLegs && (
        <HoverSystem accentColor={accentColor} partId={movementType} />
      )}
      {hasMovement && !useTracks && !useLegs && !useHover && (
        <WheelSystem primaryColor={primaryColor} accentColor={accentColor} wheelsRef={wheelsRef} product={productVisual} />
      )}

      {/* Front sensor module */}
      {showFrontSensor && <SensorPod accentColor={accentColor} partId={sensorType} />}

      {/* Comms antenna */}
      {showAntenna && <Antenna accentColor={accentColor} antennaRef={antennaRef} />}

      {/* Chassis floor plate */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.38, 0.06, 1.68]} />
        <meshStandardMaterial color="#0a1128" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
}
