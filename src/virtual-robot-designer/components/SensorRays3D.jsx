import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { migrateDesign } from '../config.js';
import { checkObstacleAhead } from '../services/robot-runtime.js';

/** Live 3D sensor visualization during simulation */
export default function SensorRays3D({ design, posRef, running, activeStep, arenaId = 'obstacles' }) {
  const sonicRef = useRef();
  const lidarRef = useRef();
  const d = migrateDesign(design);

  useFrame((state) => {
    const p = posRef.current;
    const rad = (p.angle * Math.PI) / 180;
    const t = state.clock.elapsedTime;

    if (sonicRef.current && d.sensors?.ultrasonic) {
      sonicRef.current.position.set(p.x, 0.35, p.z);
      sonicRef.current.rotation.y = rad;
      sonicRef.current.material.opacity = running && activeStep === 'forward'
        ? 0.35 + Math.sin(t * 8) * 0.15
        : 0.12;
    }

    if (lidarRef.current && d.sensors?.lidar) {
      lidarRef.current.position.set(p.x, 0.55, p.z);
      lidarRef.current.rotation.y = t * 2.5;
      lidarRef.current.material.opacity = running ? 0.25 : 0.08;
    }
  });

  if (!running) return null;

  const reach = d.sensors?.lidar ? 4 : d.sensors?.ultrasonic ? 2.5 : 0;

  return (
    <group>
      {d.sensors?.ultrasonic && (
        <mesh ref={sonicRef} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.35, reach, 16, 1, true]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
      {d.sensors?.lidar && (
        <mesh ref={lidarRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, reach, 32, 1, 0, Math.PI / 3]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
      {d.sensors?.camera && (
        <mesh position={[posRef.current.x, 0.4, posRef.current.z]}>
          <boxGeometry args={[0.15, 0.02, 0.08]} />
          <meshBasicMaterial color="#ff006e" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
    </group>
  );
}

export function useObstacleAtPosition(pos, angleDeg, design, arenaId) {
  return checkObstacleAhead(pos, angleDeg, design, arenaId);
}
