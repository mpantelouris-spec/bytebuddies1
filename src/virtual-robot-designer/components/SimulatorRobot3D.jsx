import React, { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import RobotAssemblyRoot from './workshop/RobotAssemblyRoot.jsx';
import { getRobotPhysics, ARENA_OBSTACLES } from '../services/robot-runtime.js';
import { createSimExecutor } from '../services/sim-robot-executor.js';
import SensorRays3D from './SensorRays3D.jsx';

function ArenaEnvironment({ arenaId }) {
  const obstacles = ARENA_OBSTACLES[arenaId] || ARENA_OBSTACLES.obstacles;

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#0a0a14" metalness={0.85} roughness={0.25} emissive="#1a0a2e" emissiveIntensity={0.08} />
      </mesh>
      {obstacles.map((o, i) => {
        if (o.r) {
          return (
            <group key={i} position={[o.x, 0.5, o.z]}>
              <mesh castShadow>
                <cylinderGeometry args={[o.r, o.r, 1, 20]} />
                <meshStandardMaterial color="#ef4444" emissive="#ff006e" emissiveIntensity={0.35} metalness={0.6} roughness={0.35} />
              </mesh>
              <mesh position={[0, 0.55, 0]}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshBasicMaterial color="#ff006e" transparent opacity={0.6} />
              </mesh>
            </group>
          );
        }
        if (o.type === 'wall') {
          return (
            <mesh key={i} position={[o.x, 0.5, o.z]} castShadow>
              <boxGeometry args={[o.w, 1, o.h]} />
              <meshStandardMaterial color="#312e81" emissive="#7c3aed" emissiveIntensity={0.15} metalness={0.7} roughness={0.4} />
            </mesh>
          );
        }
        return null;
      })}
      {arenaId === 'linefollow' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[0.35, 16]} />
          <meshBasicMaterial color="#00ff41" />
        </mesh>
      )}
      {arenaId === 'square' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[3, 3.15, 4]} />
          <meshBasicMaterial color="#00d4ff" wireframe opacity={0.4} transparent />
        </mesh>
      )}
    </>
  );
}

function SimRobotMesh({ design, posRef, movingRef, physics, grabRef, running, activeStep, arenaId }) {
  const groupRef = useRef(null);

  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const p = posRef.current;
    const hover = physics.hoverLift + Math.sin(state.clock.elapsedTime * 2) * (physics.isFlying ? 0.08 : 0.02);
    groupRef.current.position.set(p.x, hover, p.z);
    groupRef.current.rotation.y = (p.angle * Math.PI) / 180;
    if (movingRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 12) * 0.02 * physics.weightFactor;
    }
    if (grabRef.current > 0) {
      grabRef.current = Math.max(0, grabRef.current - dt);
      groupRef.current.rotation.x = Math.sin(grabRef.current * 12) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <RobotAssemblyRoot design={design} />
      {physics.isFlying && (
        <mesh position={[0, -physics.hoverLift - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.9, 32]} />
          <meshBasicMaterial color="#8b00ff" transparent opacity={0.25} />
        </mesh>
      )}
      <SensorRays3D design={design} posRef={posRef} running={running} activeStep={activeStep} arenaId={arenaId} />
    </group>
  );
}

function FollowCamera({ targetRef }) {
  const { camera } = useThree();
  useFrame(() => {
    const t = targetRef.current;
    camera.position.lerp({ x: t.x - 3.5, y: 4.5 + (t.hover || 0), z: t.z + 5.5 }, 0.06);
    camera.lookAt(t.x, 0.55, t.z);
  });
  return null;
}

export const SimRobotScene = forwardRef(function SimRobotScene(
  { design, arenaId = 'open', onMove, running = false, activeStep = '', onSensorRead },
  ref,
) {
  const physics = getRobotPhysics(design);
  const posRef = useRef({ x: 0, z: 0, angle: -90 });
  const movingRef = useRef(false);
  const grabRef = useRef(0);
  const camTargetRef = useRef({ x: 0, z: 0, hover: physics.hoverLift });

  const execute = useMemo(
    () =>
      createSimExecutor({
        design,
        arenaId,
        posRef,
        movingRef,
        grabRef,
        camTargetRef,
        onMove,
        physics,
        onSensorRead,
      }),
    [design, arenaId, physics, onMove, onSensorRead],
  );

  const reset = () => {
    posRef.current = { x: 0, z: 0, angle: -90 };
    camTargetRef.current = { x: 0, z: 0, hover: physics.hoverLift };
    movingRef.current = false;
  };

  const resetState = () => {
    posRef.current = { ...posRef.current, angle: -90 };
    movingRef.current = false;
  };

  useImperativeHandle(ref, () => ({ execute, reset, resetState }), [design, arenaId]);

  return (
    <>
      <FollowCamera targetRef={camTargetRef} />
      <ArenaEnvironment arenaId={arenaId} />
      <SimRobotMesh
        design={design}
        posRef={posRef}
        movingRef={movingRef}
        physics={physics}
        grabRef={grabRef}
        running={running}
        activeStep={activeStep}
        arenaId={arenaId}
      />
    </>
  );
});

export default SimRobotScene;
