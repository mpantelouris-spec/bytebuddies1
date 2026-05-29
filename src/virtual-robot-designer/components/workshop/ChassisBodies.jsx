/**
 * Procedural chassis meshes — each chassis type renders a distinct 3D body.
 */
import React, { useMemo } from 'react';
import * as THREE from 'three';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 24);
const CYL6 = new THREE.CylinderGeometry(1, 1, 1, 6);

function bodyMat(color, product, materialId = 'plastic') {
  const presets = {
    plastic: { metalness: product ? 0.32 : 0.35, roughness: 0.38 },
    metal: { metalness: 0.88, roughness: 0.2 },
    carbon: { metalness: 0.78, roughness: 0.22 },
    rubber: { metalness: 0.05, roughness: 0.85 },
    industrial: { metalness: 0.12, roughness: 0.45 },
  };
  const p = presets[materialId] || presets.plastic;
  return new THREE.MeshStandardMaterial({
    color,
    metalness: p.metalness,
    roughness: p.roughness,
    emissive: new THREE.Color(color),
    emissiveIntensity: product ? 0.0 : 0.04,
    envMapIntensity: 0.15,
  });
}

function accentMat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.22,
    metalness: 0.2,
    roughness: 0.4,
  });
}

/** Standard rover — car-like hull with cab, hood, windshield, headlights */
export function RoverBodyMesh({ primaryColor, accentColor, product, sx = 1.25, sy = 0.62, sz = 1.55, material = 'plastic' }) {
  const bodyM = useMemo(() => bodyMat(primaryColor, product, material), [primaryColor, product, material]);
  const accentM = useMemo(() => accentMat(accentColor), [accentColor]);
  const darkM = useMemo(() => new THREE.MeshStandardMaterial({ color: '#050d1a', metalness: 0.55, roughness: 0.42, envMapIntensity: 0.1 }), []);
  const headlightM = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff8e6', emissive: '#fff8e6', emissiveIntensity: 0.95, metalness: 0, roughness: 0.5 }), []);
  return (
    <group position={[0, sy * 0.45, 0]}>
      {/* Lower chassis — main hull */}
      <mesh geometry={BOX} material={bodyM} scale={[sx, sy, sz]} castShadow receiveShadow />
      {/* Cab — raised section sitting on top of rear hull */}
      <mesh geometry={BOX} material={bodyM} scale={[sx * 0.76, sy * 0.55, sz * 0.46]} position={[0, sy * 0.775, -sz * 0.06]} castShadow />
      {/* Hood — lower front section */}
      <mesh geometry={BOX} material={bodyM} scale={[sx * 0.88, sy * 0.26, sz * 0.34]} position={[0, sy * 0.63, sz * 0.31]} castShadow />
      {/* Roof panel */}
      <mesh geometry={BOX} material={bodyM} scale={[sx * 0.72, sy * 0.06, sz * 0.44]} position={[0, sy * 1.08, -sz * 0.06]} />
      {/* Windshield — angled dark glass */}
      <mesh geometry={BOX} material={darkM} scale={[sx * 0.66, sy * 0.44, sz * 0.04]} position={[0, sy * 0.775, sz * 0.11]} rotation={[-0.44, 0, 0]} />
      {/* Rear window */}
      <mesh geometry={BOX} material={darkM} scale={[sx * 0.58, sy * 0.38, sz * 0.04]} position={[0, sy * 0.80, -sz * 0.30]} rotation={[0.30, 0, 0]} />
      {/* Front bumper */}
      <mesh geometry={BOX} material={bodyM} scale={[sx * 0.98, sy * 0.14, sz * 0.055]} position={[0, -sy * 0.04, sz * 0.528]} />
      {/* Headlights */}
      <mesh geometry={BOX} material={headlightM} scale={[sx * 0.14, sy * 0.09, sz * 0.014]} position={[-sx * 0.32, sy * 0.21, sz * 0.51]} />
      <mesh geometry={BOX} material={headlightM} scale={[sx * 0.14, sy * 0.09, sz * 0.014]} position={[ sx * 0.32, sy * 0.21, sz * 0.51]} />
      {/* Tail lights — accent color */}
      <mesh geometry={BOX} material={accentM} scale={[sx * 0.12, sy * 0.08, sz * 0.014]} position={[-sx * 0.32, sy * 0.21, -sz * 0.51]} />
      <mesh geometry={BOX} material={accentM} scale={[sx * 0.12, sy * 0.08, sz * 0.014]} position={[ sx * 0.32, sy * 0.21, -sz * 0.51]} />
      {/* Side LED strips on cab edges */}
      <mesh geometry={BOX} material={accentM} scale={[sx * 0.008, sy * 0.50, sz * 0.44]} position={[-sx * 0.385, sy * 0.775, -sz * 0.06]} />
      <mesh geometry={BOX} material={accentM} scale={[sx * 0.008, sy * 0.50, sz * 0.44]} position={[ sx * 0.385, sy * 0.775, -sz * 0.06]} />
      {/* Front grille accent strip */}
      <mesh geometry={BOX} material={accentM} scale={[sx * 0.55, sy * 0.055, sz * 0.018]} position={[0, sy * 0.10, sz * 0.514]} />
      {product && (
        <mesh geometry={BOX} position={[-sx * 0.52, sy * 0.0, 0]} scale={[0.04, sy * 0.88, sz * 0.75]}>
          <meshStandardMaterial color="#FF8C00" emissive="#FF8C00" emissiveIntensity={0.15} metalness={0.4} roughness={0.35} />
        </mesh>
      )}
    </group>
  );
}

export function TankBodyMesh({ primaryColor, accentColor, product, sx = 1.35, sy = 0.72, sz = 1.45, material = 'metal' }) {
  const bodyM = useMemo(() => bodyMat(primaryColor, product, material), [primaryColor, product, material]);
  return (
    <group position={[0, sy * 0.42, 0]}>
      <mesh geometry={BOX} material={bodyM} scale={[sx, sy, sz]} castShadow />
      <mesh geometry={BOX} material={bodyM} scale={[sx * 0.85, sy * 0.35, sz * 0.2]} position={[0, sy * 0.55, sz * 0.42]} />
    </group>
  );
}

export function HumanoidBodyMesh({ primaryColor, accentColor, product, sx = 0.85, sy = 0.95, sz = 0.7, material = 'plastic' }) {
  const bodyM = useMemo(() => bodyMat(primaryColor, product, material), [primaryColor, product, material]);
  const accentM = useMemo(() => accentMat(accentColor), [accentColor]);
  return (
    <group position={[0, sy * 0.5, 0]}>
      <mesh geometry={BOX} material={bodyM} scale={[sx, sy, sz]} castShadow />
      <mesh geometry={BOX} material={accentM} scale={[sx * 0.35, sy * 0.2, sz * 0.15]} position={[0, sy * 0.35, sz * 0.42]} />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={BOX} material={bodyM} scale={[sx * 0.22, sy * 0.28, sz * 0.2]} position={[s * sx * 0.62, sy * 0.15, 0]} />
      ))}
    </group>
  );
}

export function DroneBodyMesh({ primaryColor, accentColor, product, sx = 0.9, sy = 0.35, sz = 0.9, material = 'plastic' }) {
  const bodyM = useMemo(() => bodyMat(primaryColor, product, material), [primaryColor, product, material]);
  const accentM = useMemo(() => accentMat(accentColor), [accentColor]);
  return (
    <group position={[0, sy * 0.6, 0]}>
      <mesh geometry={CYL} material={bodyM} scale={[sx * 0.55, sy, sz * 0.55]} castShadow />
      <mesh geometry={CYL} material={accentM} scale={[sx * 0.2, sy * 0.3, sz * 0.2]} position={[0, sy * 0.5, 0]} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
        <mesh key={i} geometry={CYL} material={accentM} scale={[0.12, 0.02, 0.35]} rotation={[0, 0, Math.atan2(b, a)]} position={[a * sx * 0.65, sy * 0.2, b * sz * 0.65]} />
      ))}
    </group>
  );
}

export function SpiderBodyMesh({ primaryColor, product, sx = 1, sy = 0.45, sz = 1, material = 'plastic' }) {
  const bodyM = useMemo(() => bodyMat(primaryColor, product, material), [primaryColor, product, material]);
  return (
    <group position={[0, sy * 0.55, 0]}>
      <mesh geometry={CYL6} material={bodyM} scale={[sx * 0.6, sy, sz * 0.6]} castShadow />
      <mesh geometry={CYL6} material={bodyM} scale={[sx * 0.35, sy * 0.5, sz * 0.35]} position={[0, sy * 0.35, 0]} />
    </group>
  );
}

export function WedgeBodyMesh({ primaryColor, product, sx = 1.1, sy = 0.42, sz = 1.5, material = 'plastic', low = true }) {
  const bodyM = useMemo(() => bodyMat(primaryColor, product, material), [primaryColor, product, material]);
  return (
    <group position={[0, sy * 0.48, 0]}>
      <mesh geometry={BOX} material={bodyM} scale={[sx, sy * 0.85, sz]} castShadow />
      <mesh geometry={BOX} material={bodyM} scale={[sx * 0.75, sy * 0.55, sz * 0.35]} position={[0, sy * (low ? 0.05 : 0.15), sz * 0.42]} rotation={[low ? -0.35 : -0.25, 0, 0]} />
    </group>
  );
}

export function IndustrialBodyMesh({ primaryColor, product, sx = 1.25, sy = 0.78, sz = 1.4, material = 'metal' }) {
  const bodyM = useMemo(() => bodyMat(primaryColor, product, material), [primaryColor, product, material]);
  return (
    <group position={[0, sy * 0.4, 0]}>
      <mesh geometry={BOX} material={bodyM} scale={[sx, sy, sz]} castShadow />
      <mesh geometry={BOX} material={bodyM} scale={[sx * 0.9, sy * 0.15, sz * 0.85]} position={[0, sy * 0.55, 0]} />
    </group>
  );
}

export function RoundBodyMesh({ primaryColor, product, sx = 1, sy = 0.5, sz = 1, material = 'plastic' }) {
  const bodyM = useMemo(() => bodyMat(primaryColor, product, material), [primaryColor, product, material]);
  return (
    <group position={[0, sy * 0.55, 0]}>
      <mesh geometry={CYL} material={bodyM} scale={[sx * 0.55, sy, sz * 0.55]} castShadow />
    </group>
  );
}

const CHASSIS_DEFAULTS = {
  rover: { sx: 1.25, sy: 0.62, sz: 1.55 },
  tank: { sx: 1.35, sy: 0.72, sz: 1.45 },
  humanoid: { sx: 0.85, sy: 0.95, sz: 0.7 },
  drone: { sx: 0.9, sy: 0.35, sz: 0.9 },
  spider: { sx: 1, sy: 0.45, sz: 1 },
  industrial: { sx: 1.25, sy: 0.78, sz: 1.4 },
  racing: { sx: 1.1, sy: 0.42, sz: 1.5 },
  exploration: { sx: 1.05, sy: 0.58, sz: 1.25 },
  hauler: { sx: 1.35, sy: 0.8, sz: 1.55 },
  mech: { sx: 1.4, sy: 1.1, sz: 1.2 },
  mini: { sx: 0.65, sy: 0.45, sz: 0.75 },
};

/** Pick body mesh from chassis type + shape override */
export default function ChassisBody({
  chassisType = 'rover',
  shape,
  width = 1,
  height = 0.62,
  depth = 1.2,
  scale = 1,
  primaryColor,
  accentColor,
  product = false,
  material = 'plastic',
}) {
  const dims = useMemo(() => {
    const def = CHASSIS_DEFAULTS[chassisType] || CHASSIS_DEFAULTS.rover;
    const mul = scale ?? 1;
    return {
      sx: (width ?? 1) * def.sx * mul,
      sy: (height ?? 0.62) * def.sy * mul,
      sz: (depth ?? 1.2) * def.sz * mul,
    };
  }, [chassisType, width, height, depth, scale]);

  const meshShape = shape || 'box';
  const props = { primaryColor, accentColor, product, material, ...dims };

  if (meshShape === 'round' || meshShape === 'hex' || chassisType === 'drone' || chassisType === 'circular' || chassisType === 'companion') {
    if (meshShape === 'hex' || chassisType === 'spider' || chassisType === 'sci_fi') {
      return <SpiderBodyMesh {...props} />;
    }
    if (chassisType === 'drone' || chassisType === 'hover_platform') {
      return <DroneBodyMesh {...props} />;
    }
    return <RoundBodyMesh {...props} />;
  }

  if (meshShape === 'wedge' || ['racing', 'exploration', 'scout', 'amphibious', 'aero', 'rescue',
    'racing_rover', 'exploration_rover', 'jet_fighter', 'glider', 'stunt_plane', 'stealth_drone', 'hover_racing'].includes(chassisType)) {
    return <WedgeBodyMesh {...props} low={['racing', 'aero', 'racing_rover', 'jet_fighter', 'stunt_plane', 'hover_racing'].includes(chassisType)} />;
  }

  switch (chassisType) {
    case 'humanoid':
    case 'mech':
      return <HumanoidBodyMesh {...props} />;
    case 'tank':
    case 'combat':
    case 'battle_bot':
    case 'forklift':
      return <TankBodyMesh {...props} />;
    case 'spider':
      return <SpiderBodyMesh {...props} />;
    case 'drone':
    case 'hover_platform':
    case 'quadcopter':
    case 'racing_drone':
    case 'cargo_drone':
    case 'aquatic_drone':
    case 'anti_gravity_platform':
      return <DroneBodyMesh {...props} />;
    case 'transport_plane':
      return <IndustrialBodyMesh {...props} sx={dims.sx * 1.15} sz={dims.sz * 1.2} />;
    case 'industrial':
    case 'utility':
    case 'hauler':
    case 'factory_base':
    case 'crane_platform':
    case 'cargo_rover':
    case 'armored_rover':
      return <IndustrialBodyMesh {...props} />;
    case 'submarine_hull':
    case 'underwater':
      return <WedgeBodyMesh {...props} low={false} />;
    case 'climbing_spider':
    case 'tactical_spider':
    case 'stealth_spider':
      return <SpiderBodyMesh {...props} />;
    case 'android_body':
    case 'athletic_humanoid':
      return <HumanoidBodyMesh {...props} />;
    case 'space_rover':
      return <RoundBodyMesh {...props} />;
    case 'racing':
    case 'aero':
      return <WedgeBodyMesh {...props} low />;
    case 'exploration':
    case 'scout':
    case 'rescue':
    case 'amphibious':
      return <WedgeBodyMesh {...props} low={false} />;
    case 'mini':
      return <RoverBodyMesh {...props} sx={dims.sx * 0.9} sy={dims.sy * 0.9} sz={dims.sz * 0.9} />;
    default:
      return <RoverBodyMesh {...props} />;
  }
}
