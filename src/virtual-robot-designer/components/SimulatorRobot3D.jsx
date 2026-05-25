import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HeroRobotModel from './HeroRobotModel.jsx';
import AssemblyAttachmentMeshes from './AssemblyAttachmentMeshes.jsx';
import { easeInOut, getRobotPhysics, checkObstacleAhead, checkPointCollision, ARENA_OBSTACLES } from '../services/robot-runtime.js';
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
      <group scale={[0.82, 0.82, 0.82]}>
        <HeroRobotModel design={design} productVisual />
        <AssemblyAttachmentMeshes design={design} />
      </group>
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

function sampleObstacleAlongPath(sx, sz, ex, ez, design, arenaId) {
  const steps = 10;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const x = sx + (ex - sx) * t;
    const z = sz + (ez - sz) * t;
    if (checkPointCollision(x, z, arenaId).hit) {
      return { blocked: true, stopT: Math.max(0, t - 0.12) };
    }
    const angle = (Math.atan2(ez - sz, ex - sx) * 180) / Math.PI;
    if (checkObstacleAhead({ x, z, angle }, angle, design, arenaId).hit) {
      return { blocked: true, stopT: Math.max(0, t - 0.15) };
    }
  }
  return { blocked: false, stopT: 1 };
}

export const SimRobotScene = forwardRef(function SimRobotScene(
  { design, arenaId = 'open', onMove, running = false, activeStep = '' },
  ref,
) {
  const physics = getRobotPhysics(design);
  const posRef = useRef({ x: 0, z: 0, angle: -90 });
  const movingRef = useRef(false);
  const grabRef = useRef(0);
  const camTargetRef = useRef({ x: 0, z: 0, hover: physics.hoverLift });

  const execute = (step) => new Promise((resolve) => {
    const id = step?.id;
    const params = step?.params || {};
    const p = posRef.current;
    const { pxPerMs, degPerMs, cmToUnit } = physics;

    if (id === 'stop') { movingRef.current = false; resolve(); return; }
    if (id === 'wait') { setTimeout(resolve, (params.secs || 1) * 1000); return; }
    if (id === 'scan') { setTimeout(resolve, 900); return; }
    if (id === 'lidar_sweep') { setTimeout(resolve, 1400); return; }
    if (id === 'grab' || id === 'release') { grabRef.current = 0.6; setTimeout(resolve, 700); return; }
    if (id === 'lights_on' || id === 'lights_off') { setTimeout(resolve, 300); return; }

    const FORWARD = ['forward', 'follow_line', 'avoid_wall'];
    const BACK = ['back'];
    const TURNL = ['left', 'spin_left'];
    const TURNR = ['right', 'spin_right'];

    if (FORWARD.includes(id) || BACK.includes(id)) {
      const cm = parseFloat(params.amount || 80);
      let dist = cm * cmToUnit;
      const rad = (p.angle * Math.PI) / 180;
      const dir = BACK.includes(id) ? -1 : 1;
      const sx = p.x; const sz = p.z;
      let ex = sx + Math.cos(rad) * dist * dir;
      let ez = sz + Math.sin(rad) * dist * dir;

      const pathCheck = sampleObstacleAlongPath(sx, sz, ex, ez, design, arenaId);
      if (pathCheck.blocked) {
        ex = sx + (ex - sx) * pathCheck.stopT;
        ez = sz + (ez - sz) * pathCheck.stopT;
        dist *= pathCheck.stopT;
      }

      const dur = Math.max(200, (dist / pxPerMs) * 1000);
      movingRef.current = true;
      const t0 = performance.now();
      const go = () => {
        const prog = Math.min(1, (performance.now() - t0) / dur);
        const e = easeInOut(prog);
        p.x = sx + (ex - sx) * e;
        p.z = sz + (ez - sz) * e;
        camTargetRef.current.x = p.x;
        camTargetRef.current.z = p.z;
        onMove?.({ ...p });
        if (prog < 1) requestAnimationFrame(go);
        else { movingRef.current = false; resolve(); }
      };
      requestAnimationFrame(go);
    } else if (TURNL.includes(id) || TURNR.includes(id)) {
      const deg = parseFloat(params.degrees || 90);
      const dir = TURNL.includes(id) ? -1 : 1;
      const total = deg * dir;
      const dur = (Math.abs(deg) / degPerMs) * 1000;
      const sa = p.angle;
      movingRef.current = true;
      const t0 = performance.now();
      const go = () => {
        const prog = Math.min(1, (performance.now() - t0) / dur);
        p.angle = sa + total * easeInOut(prog);
        onMove?.({ ...p });
        if (prog < 1) requestAnimationFrame(go);
        else { movingRef.current = false; resolve(); }
      };
      requestAnimationFrame(go);
    } else {
      resolve();
    }
  });

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
