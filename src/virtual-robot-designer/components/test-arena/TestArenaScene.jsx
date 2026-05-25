import React, { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import RobotAssemblyRoot from '../workshop/RobotAssemblyRoot.jsx';
import { getRobotPhysics } from '../../services/robot-runtime.js';
import { createSimExecutor } from '../../services/sim-robot-executor.js';
import SensorRays3D from '../SensorRays3D.jsx';
import TestArenaEnvironment from './TestArenaEnvironment.jsx';
import TestArenaCamera from './TestArenaCamera.jsx';
import { computeSimRobotScale } from '../../constants/test-arena-scene.js';
import { computeWorkshopAnchorY } from '../../constants/workshop-scene.js';
import { migrateDesign } from '../../config.js';

function TestArenaRobot({ design, simScale, anchorY, posRef, movingRef, physics, grabRef, running, activeStep, arenaId }) {
  const groupRef = useRef(null);

  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const p = posRef.current;
    const hover = physics.hoverLift + Math.sin(state.clock.elapsedTime * 2) * (physics.isFlying ? 0.1 : 0.025);
    groupRef.current.position.set(p.x, anchorY + hover, p.z);
    groupRef.current.rotation.y = (p.angle * Math.PI) / 180;
    if (movingRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.025 * physics.weightFactor;
    }
    if (grabRef.current > 0) {
      grabRef.current = Math.max(0, grabRef.current - dt);
      groupRef.current.rotation.x = Math.sin(grabRef.current * 10) * 0.06;
    }
  });

  return (
    <group ref={groupRef} scale={[simScale, simScale, simScale]}>
      <RobotAssemblyRoot design={design} />
      {physics.isFlying && (
        <mesh position={[0, -physics.hoverLift / simScale - 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 1, 32]} />
          <meshBasicMaterial color="#1e90ff" transparent opacity={0.3} />
        </mesh>
      )}
      <SensorRays3D design={design} posRef={posRef} running={running} activeStep={activeStep} arenaId={arenaId} />
    </group>
  );
}

export const TestArenaScene = forwardRef(function TestArenaScene(
  { design, arenaId = 'open', onMove, running = false, activeStep = '', onSensorRead },
  ref,
) {
  const d = migrateDesign(design);
  const physics = getRobotPhysics(d);
  const simScale = useMemo(() => computeSimRobotScale(d), [d]);
  const anchorY = useMemo(() => computeWorkshopAnchorY(d, simScale) * 0.85, [d, simScale]);

  const posRef = useRef({ x: 0, z: 0, angle: -90 });
  const movingRef = useRef(false);
  const grabRef = useRef(0);
  const camTargetRef = useRef({ x: 0, z: 0, hover: physics.hoverLift, angle: -90, moving: false });

  useFrame(() => {
    const p = posRef.current;
    camTargetRef.current.x = p.x;
    camTargetRef.current.z = p.z;
    camTargetRef.current.angle = p.angle;
    camTargetRef.current.hover = physics.hoverLift;
    camTargetRef.current.moving = movingRef.current;
  });

  const execute = useMemo(
    () =>
      createSimExecutor({
        design: d,
        arenaId,
        posRef,
        movingRef,
        grabRef,
        camTargetRef,
        onMove,
        physics,
        onSensorRead,
      }),
    [d, arenaId, physics, onMove, onSensorRead],
  );

  const reset = () => {
    posRef.current = { x: 0, z: 0, angle: -90 };
    camTargetRef.current = { x: 0, z: 0, hover: physics.hoverLift, angle: -90, moving: false };
    movingRef.current = false;
  };

  const resetState = () => {
    posRef.current = { ...posRef.current, angle: -90 };
    movingRef.current = false;
  };

  useImperativeHandle(ref, () => ({ execute, reset, resetState }), [d, arenaId, execute]);

  return (
    <>
      <color attach="background" args={['#c5d9f0']} />
      <fog attach="fog" args={['#d4e4f7', 18, 42]} />
      <ambientLight intensity={0.65} color="#ffffff" />
      <hemisphereLight intensity={0.55} color="#ffffff" groundColor="#94a3b8" />
      <directionalLight position={[8, 14, 6]} intensity={1.25} castShadow shadow-mapSize={[2048, 2048]} color="#fffef8" />
      <directionalLight position={[-6, 8, -4]} intensity={0.45} color="#b3e5fc" />
      <pointLight position={[0, 6, 0]} intensity={0.35} color="#1e90ff" distance={20} />

      <TestArenaEnvironment arenaId={arenaId} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={18} blur={2.5} far={5} color="#64748b" />

      <TestArenaRobot
        design={d}
        simScale={simScale}
        anchorY={anchorY}
        posRef={posRef}
        movingRef={movingRef}
        physics={physics}
        grabRef={grabRef}
        running={running}
        activeStep={activeStep}
        arenaId={arenaId}
      />

      <TestArenaCamera targetRef={camTargetRef} running={running} />
    </>
  );
});

export default TestArenaScene;
