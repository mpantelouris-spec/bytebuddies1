import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildRobotFromDesign } from '../three/buildRobotFromDesign.js';
import { collectAnimatables } from '../three/collectAnimatables.js';
import { animatePreviewFrame } from '../three/animatePreviewFrame.js';
import { migrateAssembly } from '../services/assembly-service.js';
import SnapSocketMarkers from './SnapSocketMarkers.jsx';

function MountBurst({ active }) {
  const ref = useRef();
  const life = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    if (!active) {
      ref.current.visible = false;
      return;
    }
    life.current += dt;
    const t = life.current;
    ref.current.visible = t < 0.8;
    if (t < 0.8) {
      const scale = 0.5 + t * 2.5;
      ref.current.scale.setScalar(scale);
      ref.current.material.opacity = Math.max(0, 0.6 - t * 0.75);
    }
  });

  useEffect(() => {
    if (active) life.current = 0;
  }, [active]);

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} visible={false}>
      <ringGeometry args={[0.3, 0.55, 48]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function RobotScene({ root, animRef, autoSpin, mountAnim, isArm, heroScale = 1.35 }) {
  const groupRef = useRef();
  const yOff = useRef(isArm ? -0.35 : -0.05);
  const baseScale = heroScale;
  const scaleRef = useRef(baseScale);

  useFrame((state, dt) => {
    if (!root) return;
    animatePreviewFrame(animRef.current, state.clock.elapsedTime * 1000, dt);

    if (groupRef.current) {
      if (autoSpin) groupRef.current.rotation.y += dt * 0.005 * 60;

      // Mount animation: drop-in + bounce
      if (mountAnim.current > 0) {
        mountAnim.current = Math.max(0, mountAnim.current - dt * 1.8);
        const p = 1 - mountAnim.current;
        const bounce = Math.sin(p * Math.PI) * 0.12;
        groupRef.current.position.y = yOff.current + bounce;
        scaleRef.current = baseScale + Math.sin(p * Math.PI) * 0.06;
      } else {
        groupRef.current.position.y = yOff.current + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
        scaleRef.current = baseScale;
      }

      groupRef.current.scale.setScalar(scaleRef.current);
    }
  });

  return (
    <group ref={groupRef}>
      {root && <primitive object={root} />}
    </group>
  );
}

export default function InteractiveRobotModel({
  design,
  autoSpin = false,
  highlightSlot = null,
  snapPulse = false,
  buildMode = 'advanced',
  blockLayer = 0,
  heroScale = 1.35,
}) {
  const [root, setRoot] = useState(null);
  const [burst, setBurst] = useState(false);
  const animRef = useRef([]);
  const disposeRef = useRef(null);
  const mountAnim = useRef(0);
  const prevParts = useRef(0);
  const asm = migrateAssembly(design);
  const partCount = Object.values(asm.slots).filter(Boolean).length;
  const blockCount = (asm.blocks || []).length;
  const totalParts = partCount + blockCount;
  const isArm = asm.base?.shape === 'arm';
  const showSockets = buildMode !== 'blocks';

  useEffect(() => {
    if (disposeRef.current) disposeRef.current();
    const built = buildRobotFromDesign(design);
    animRef.current = collectAnimatables(built.group);
    disposeRef.current = built.dispose;
    setRoot(built.group);

    if (totalParts > prevParts.current) {
      mountAnim.current = 1;
      setBurst(true);
      setTimeout(() => setBurst(false), 900);
    }
    prevParts.current = totalParts;

    return () => { built.dispose(); disposeRef.current = null; };
  }, [design, totalParts]);

  return (
    <>
      <RobotScene root={root} animRef={animRef} autoSpin={autoSpin} mountAnim={mountAnim} isArm={isArm} heroScale={heroScale} />
      <MountBurst active={burst} />
      {showSockets && (
        <SnapSocketMarkers
          base={asm.base}
          slots={asm.slots}
          highlightSlot={highlightSlot}
          snapPulse={snapPulse}
        />
      )}
    </>
  );
}
