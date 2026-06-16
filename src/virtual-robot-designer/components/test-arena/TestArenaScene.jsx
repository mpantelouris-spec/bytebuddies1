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
import { robotPosTracker } from '../../services/robot-runtime.js';

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
  { design, arenaId = 'open', arenaTheme = 'ground', difficulty = 'easy', onMove, running = false, activeStep = '', onSensorRead, cameraApiRef },
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
    // Keep global tracker updated so escape-course pursuers can target the robot
    robotPosTracker.x = p.x;
    robotPosTracker.z = p.z;
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
    // ── Signature course overrides (by arenaId) ──────────────────────────
    if (arenaId === 'spider_temple')    return { bg: '#1a0e04', fog: '#2e1905', bloom: 0.38 };
    if (arenaId === 'spider_web')       return { bg: '#080318', fog: '#160635', bloom: 0.55 };
    if (arenaId === 'spider_cave')      return { bg: '#060d12', fog: '#0a1a22', bloom: 0.42 };
    // Spider Tier 1
    if (arenaId === 'spider_bridges')   return { bg: '#0d1f0a', fog: '#152e10', bloom: 0.36 };
    if (arenaId === 'spider_vine')      return { bg: '#091a06', fog: '#112510', bloom: 0.34 };
    if (arenaId === 'spider_maze')      return { bg: '#100e04', fog: '#1e1a08', bloom: 0.36 };
    if (arenaId === 'spider_guardian')  return { bg: '#180c08', fog: '#261510', bloom: 0.40 };
    // Spider Tier 2
    if (arenaId === 'spider_interior')  return { bg: '#0a0a14', fog: '#14142a', bloom: 0.44 };
    if (arenaId === 'spider_river')     return { bg: '#061218', fog: '#0c2030', bloom: 0.38 };
    if (arenaId === 'spider_forest')    return { bg: '#081408', fog: '#102010', bloom: 0.32 };
    if (arenaId === 'spider_race')      return { bg: '#100a20', fog: '#1a1035', bloom: 0.46 };
    if (arenaId === 'spider_web_city')  return { bg: '#080618', fog: '#120e2e', bloom: 0.52 };
    if (arenaId === 'spider_warzone')   return { bg: '#140808', fog: '#221010', bloom: 0.42 };
    // Spider Tier 3
    if (arenaId === 'spider_elemental') return { bg: '#0e0818', fog: '#1a1028', bloom: 0.50 };
    if (arenaId === 'spider_labyrinth') return { bg: '#0c0c04', fog: '#1a1a08', bloom: 0.38 };
    if (arenaId === 'spider_ruin_race') return { bg: '#180e04', fog: '#2a1808', bloom: 0.40 };
    if (arenaId === 'spider_trials')    return { bg: '#0a1020', fog: '#122030', bloom: 0.48 };
    // Spider Tier 4
    if (arenaId === 'spider_infinite')  return { bg: '#04020e', fog: '#0a0820', bloom: 0.60 };
    if (arenaId === 'spider_hunt')      return { bg: '#080204', fog: '#140608', bloom: 0.55 };
    if (arenaId === 'spider_gauntlet')  return { bg: '#02020e', fog: '#080818', bloom: 0.65 };
    // Drone (existing)
    if (arenaId === 'drone_skyrace')    return { bg: '#4fc8f0', fog: '#82d9f8', bloom: 0.40 };
    if (arenaId === 'drone_neoncity')   return { bg: '#060b14', fog: '#0e1828', bloom: 0.58 };
    if (arenaId === 'drone_slalom')     return { bg: '#04031a', fog: '#0a083a', bloom: 0.52 };
    // Drone Tier 1
    if (arenaId === 'drone_academy')    return { bg: '#6ab4e8', fog: '#90ccf5', bloom: 0.36 };
    if (arenaId === 'drone_cloud_race') return { bg: '#7abcee', fog: '#a0d2f8', bloom: 0.38 };
    if (arenaId === 'drone_gates')      return { bg: '#5aaee0', fog: '#7ac8f0', bloom: 0.38 };
    if (arenaId === 'drone_wind')       return { bg: '#88c8f0', fog: '#aad8f8', bloom: 0.34 };
    if (arenaId === 'drone_gauntlet_easy') return { bg: '#70b8e8', fog: '#98cef5', bloom: 0.38 };
    // Drone Tier 2
    if (arenaId === 'drone_mountain')   return { bg: '#a8c4d8', fog: '#c0d8e8', bloom: 0.32 };
    if (arenaId === 'drone_asteroid')   return { bg: '#101828', fog: '#202838', bloom: 0.50 };
    if (arenaId === 'drone_storm')      return { bg: '#1a2030', fog: '#283040', bloom: 0.45 };
    if (arenaId === 'drone_speed_trials') return { bg: '#0a1020', fog: '#18202e', bloom: 0.52 };
    if (arenaId === 'drone_battle')     return { bg: '#120820', fog: '#201030', bloom: 0.55 };
    // Drone Tier 3-4
    if (arenaId === 'drone_volcano')    return { bg: '#200808', fog: '#381010', bloom: 0.60 };
    if (arenaId === 'drone_deep_space') return { bg: '#02020a', fog: '#08081a', bloom: 0.70 };
    if (arenaId === 'drone_world_tour') return { bg: '#0a1820', fog: '#142030', bloom: 0.55 };
    if (arenaId === 'drone_elite')      return { bg: '#06041a', fog: '#0e0a2e', bloom: 0.65 };
    if (arenaId === 'drone_infinite_race') return { bg: '#040218', fog: '#0a0828', bloom: 0.68 };
    if (arenaId === 'drone_legend')     return { bg: '#020110', fog: '#080620', bloom: 0.72 };
    if (arenaId === 'drone_ultimate')   return { bg: '#010108', fog: '#060418', bloom: 0.75 };
    // Heavy (existing)
    if (arenaId === 'heavy_warehouse')    return { bg: '#c8cdd6', fog: '#d8dde6', bloom: 0.28 };
    if (arenaId === 'heavy_construction') return { bg: '#b8a88a', fog: '#c8b89a', bloom: 0.30 };
    if (arenaId === 'heavy_megabuild')    return { bg: '#a8c0d0', fog: '#b8d0e0', bloom: 0.32 };
    // Heavy Tier 1
    if (arenaId === 'heavy_basics')     return { bg: '#d0cec8', fog: '#e0deda', bloom: 0.26 };
    if (arenaId === 'heavy_lifting')    return { bg: '#c8c4bc', fog: '#dad8d0', bloom: 0.28 };
    if (arenaId === 'heavy_drill_run')  return { bg: '#c0bab0', fog: '#d0cac0', bloom: 0.30 };
    if (arenaId === 'heavy_cargo')      return { bg: '#b8b4ac', fog: '#c8c8c0', bloom: 0.28 };
    if (arenaId === 'heavy_clear')      return { bg: '#d0c8b8', fog: '#e0d8c8', bloom: 0.28 };
    // Heavy Tier 2-3
    if (arenaId === 'heavy_mining')     return { bg: '#908070', fog: '#a89888', bloom: 0.32 };
    if (arenaId === 'heavy_bridge')     return { bg: '#c0c8d0', fog: '#d0d8e0', bloom: 0.30 };
    if (arenaId === 'heavy_urban')      return { bg: '#a8b0b8', fog: '#b8c0c8', bloom: 0.30 };
    if (arenaId === 'heavy_salvage')    return { bg: '#988878', fog: '#a89888', bloom: 0.32 };
    if (arenaId === 'heavy_demolition') return { bg: '#b08870', fog: '#c09880', bloom: 0.34 };
    if (arenaId === 'heavy_disaster')   return { bg: '#a08878', fog: '#b09888', bloom: 0.36 };
    if (arenaId === 'heavy_deep_mine')  return { bg: '#302820', fog: '#403830', bloom: 0.40 };
    if (arenaId === 'heavy_world_build') return { bg: '#c0c8d8', fog: '#d0d8e8', bloom: 0.30 };
    if (arenaId === 'heavy_boss')       return { bg: '#200c08', fog: '#381810', bloom: 0.48 };
    // Heavy Tier 4
    if (arenaId === 'heavy_infinite')   return { bg: '#180c08', fog: '#281810', bloom: 0.52 };
    if (arenaId === 'heavy_legendary')  return { bg: '#100808', fog: '#201010', bloom: 0.55 };
    if (arenaId === 'heavy_ultimate')   return { bg: '#080404', fog: '#180c0c', bloom: 0.60 };
    // Ninja Tier 1
    if (arenaId === 'ninja_training')   return { bg: '#0a1420', fog: '#142030', bloom: 0.42 };
    if (arenaId === 'ninja_stealth')    return { bg: '#080e1a', fog: '#101828', bloom: 0.46 };
    if (arenaId === 'ninja_target')     return { bg: '#0c1018', fog: '#181e28', bloom: 0.44 };
    if (arenaId === 'ninja_infiltrate') return { bg: '#060c16', fog: '#0e1822', bloom: 0.48 };
    if (arenaId === 'ninja_escape')     return { bg: '#0a0c18', fog: '#141828', bloom: 0.46 };
    // Ninja Tier 2
    if (arenaId === 'ninja_city_strike') return { bg: '#0c0e1c', fog: '#181a2e', bloom: 0.52 };
    if (arenaId === 'ninja_heat_scan')  return { bg: '#140810', fog: '#221018', bloom: 0.50 };
    if (arenaId === 'ninja_laser_maze') return { bg: '#08040e', fog: '#120a1c', bloom: 0.58 };
    if (arenaId === 'ninja_night_ops')  return { bg: '#040408', fog: '#0a0a14', bloom: 0.55 };
    if (arenaId === 'ninja_assassin')   return { bg: '#060408', fog: '#100812', bloom: 0.56 };
    // Ninja Tier 3
    if (arenaId === 'ninja_fortress')   return { bg: '#04060e', fog: '#0a0e1c', bloom: 0.60 };
    if (arenaId === 'ninja_dogfight')   return { bg: '#080412', fog: '#100818', bloom: 0.58 };
    if (arenaId === 'ninja_base_raid')  return { bg: '#060408', fog: '#0e0a10', bloom: 0.60 };
    if (arenaId === 'ninja_shadow_war') return { bg: '#040206', fog: '#0c080e', bloom: 0.62 };
    if (arenaId === 'ninja_elite_ops')  return { bg: '#040208', fog: '#0a0610', bloom: 0.64 };
    // Ninja Tier 4
    if (arenaId === 'ninja_black_site') return { bg: '#020108', fog: '#08060e', bloom: 0.68 };
    if (arenaId === 'ninja_super_stealth') return { bg: '#02010a', fog: '#060410', bloom: 0.70 };
    if (arenaId === 'ninja_infinite_war') return { bg: '#020208', fog: '#08060e', bloom: 0.72 };
    if (arenaId === 'ninja_legendary')  return { bg: '#010106', fog: '#06040c', bloom: 0.74 };
    if (arenaId === 'ninja_ultimate')   return { bg: '#010104', fog: '#04040a', bloom: 0.76 };
    // Humanoid Tier 1
    if (arenaId === 'human_basics')     return { bg: '#d0d8e0', fog: '#e0e8f0', bloom: 0.26 };
    if (arenaId === 'human_combat_intro') return { bg: '#c8d0d8', fog: '#d8e0e8', bloom: 0.28 };
    if (arenaId === 'human_platform')   return { bg: '#c0c8d4', fog: '#d0d8e4', bloom: 0.28 };
    if (arenaId === 'human_shield')     return { bg: '#c4ccd8', fog: '#d4dce8', bloom: 0.30 };
    if (arenaId === 'human_first_boss') return { bg: '#1a1010', fog: '#2a1818', bloom: 0.44 };
    // Humanoid Tier 2
    if (arenaId === 'human_arena')      return { bg: '#c0a840', fog: '#d0b850', bloom: 0.40 };
    if (arenaId === 'human_jungle')     return { bg: '#0e200a', fog: '#183010', bloom: 0.34 };
    if (arenaId === 'human_city')       return { bg: '#a0aab8', fog: '#b0bac8', bloom: 0.32 };
    if (arenaId === 'human_dodge')      return { bg: '#180c10', fog: '#281820', bloom: 0.46 };
    if (arenaId === 'human_weapons')    return { bg: '#141018', fog: '#201828', bloom: 0.50 };
    // Humanoid Tier 3
    if (arenaId === 'human_tournament') return { bg: '#a88020', fog: '#b89030', bloom: 0.45 };
    if (arenaId === 'human_army')       return { bg: '#0c1808', fog: '#182810', bloom: 0.38 };
    if (arenaId === 'human_ruins')      return { bg: '#301e10', fog: '#402e18', bloom: 0.42 };
    if (arenaId === 'human_elemental')  return { bg: '#100820', fog: '#1a1030', bloom: 0.52 };
    if (arenaId === 'human_shadow')     return { bg: '#080408', fog: '#140c14', bloom: 0.58 };
    // Humanoid Tier 4
    if (arenaId === 'human_championship') return { bg: '#180c04', fog: '#281808', bloom: 0.55 };
    if (arenaId === 'human_warrior')    return { bg: '#100608', fog: '#200c10', bloom: 0.60 };
    if (arenaId === 'human_infinite')   return { bg: '#0c0408', fog: '#180808', bloom: 0.62 };
    if (arenaId === 'human_legend')     return { bg: '#080206', fog: '#140408', bloom: 0.66 };
    if (arenaId === 'human_ultimate')   return { bg: '#040102', fog: '#0c0404', bloom: 0.70 };
    // ── Theme-based fallback ─────────────────────────────────────────────
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
  }, [arenaTheme, arenaId]);

  return (
    <>
      <color attach="background" args={[themeVisual.bg]} />
      <fog attach="fog" args={[themeVisual.fog, 20, 55]} />
      <PremiumVisualRig variant="arena" accent={course.color} bloomIntensity={themeVisual.bloom} />

      <TestArenaEnvironment arenaId={arenaId} arenaTheme={arenaTheme} difficulty={difficulty} />

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
