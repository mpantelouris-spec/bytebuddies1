import React, { useRef, forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import PremiumVisualRig from '../common/PremiumVisualRig.jsx';
import { getCourseMeta } from '../../data/test-arena-courses.js';
import RobotAssemblyRoot from '../workshop/RobotAssemblyRoot.jsx';
import { getRobotPhysics } from '../../services/robot-runtime.js';
import { createSimExecutor } from '../../services/sim-robot-executor.js';
import SensorRays3D from '../SensorRays3D.jsx';
import TestArenaEnvironment from './TestArenaEnvironment.jsx';
import TestArenaCameraRig from './TestArenaCameraRig.jsx';
import { computeSimRobotScale } from '../../constants/test-arena-scene.js';
import { computeWorkshopAnchorY } from '../../constants/workshop-scene.js';
import { migrateDesign } from '../../config.js';

function TestArenaRobot({ design, simScale, anchorY, posRef, movingRef, physics, grabRef, camTargetRef, running, activeStep, arenaId }) {
  const groupRef = useRef(null);

  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const p = posRef.current;
    const baseHover = camTargetRef?.current?.hover ?? physics.hoverLift;
    const hover = baseHover + Math.sin(state.clock.elapsedTime * 2) * (physics.isFlying ? 0.1 : 0.025);
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
  { design, arenaId = 'open', arenaTheme = 'ground', onMove, running = false, activeStep = '', onSensorRead, cameraApiRef },
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
  const userInteractingRef = useRef(false);
  const [focusRequest, setFocusRequest] = useState(0);

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

  const resetCamera = () => setFocusRequest((n) => n + 1);

  useImperativeHandle(
    ref,
    () => ({
      execute,
      reset,
      resetState,
      resetCamera,
      zoomIn: () => cameraApiRef?.current?.zoomIn?.(),
      zoomOut: () => cameraApiRef?.current?.zoomOut?.(),
    }),
    [d, arenaId, execute, cameraApiRef],
  );

  const course = getCourseMeta(arenaId);
  const themeVisual = useMemo(() => {
    switch (arenaTheme) {
      case 'sky':
        return { bg: '#87b8f7', fog: '#a8d4ff', bloom: 0.42 };
      case 'underwater':
        return { bg: '#0c4a6e', fog: '#0369a1', bloom: 0.28 };
      case 'rough':
      case 'mining':
        return { bg: '#d6cfc4', fog: '#c4b8a8', bloom: 0.3 };
      case 'factory':
        return { bg: '#e8ecf2', fog: '#d0d8e4', bloom: 0.32 };
      case 'terrain':
        return { bg: '#c8e6c9', fog: '#a5d6a7', bloom: 0.34 };
      case 'hover':
        return { bg: '#1a1033', fog: '#2d1b69', bloom: 0.45 };
      case 'lego':
        return { bg: '#fff3e0', fog: '#ffe0b2', bloom: 0.36 };
      case 'ai':
        return { bg: '#ede9fe', fog: '#ddd6fe', bloom: 0.38 };
      default:
        return { bg: '#c5daf0', fog: '#d4e6f8', bloom: 0.34 };
    }
  }, [arenaTheme]);

  return (
    <>
      <color attach="background" args={[themeVisual.bg]} />
      <fog attach="fog" args={[themeVisual.fog, 20, 55]} />
      <PremiumVisualRig variant="arena" accent={course.color} bloomIntensity={themeVisual.bloom} />

      <TestArenaEnvironment arenaId={arenaId} arenaTheme={arenaTheme} />

      <TestArenaRobot
        design={d}
        simScale={simScale}
        anchorY={anchorY}
        posRef={posRef}
        movingRef={movingRef}
        physics={physics}
        grabRef={grabRef}
        camTargetRef={camTargetRef}
        running={running}
        activeStep={activeStep}
        arenaId={arenaId}
      />

      <TestArenaCameraRig
        controlsRef={cameraApiRef}
        targetRef={camTargetRef}
        running={running}
        userInteractingRef={userInteractingRef}
        focusRequest={focusRequest}
      />
    </>
  );
});

export default TestArenaScene;
