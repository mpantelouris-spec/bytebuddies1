import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { buildRobotFromDesign } from '../three/buildRobotFromDesign.js';
import { collectAnimatables } from '../three/collectAnimatables.js';
import { animatePreviewFrame } from '../three/animatePreviewFrame.js';

/** Imperative Three.js robot → React Three Fiber primitive */
export default function RobotModelR3F({ design, autoSpin = true, userRotation = 0 }) {
  const [root, setRoot] = useState(null);
  const animRef = useRef([]);
  const disposeRef = useRef(null);
  const spinRef = useRef(autoSpin);

  useEffect(() => {
    spinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    if (disposeRef.current) disposeRef.current();
    const built = buildRobotFromDesign(design);
    animRef.current = collectAnimatables(built.group);
    disposeRef.current = built.dispose;
    setRoot(built.group);
    return () => {
      built.dispose();
      disposeRef.current = null;
    };
  }, [design]);

  useFrame((state, dt) => {
    if (!root) return;
    animatePreviewFrame(animRef.current, state.clock.elapsedTime * 1000, dt);
    if (spinRef.current) {
      root.rotation.y += dt * 0.45;
      root.rotation.x = 0;
    } else {
      root.rotation.y = userRotation;
    }
    root.position.y = -0.15 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
  });

  if (!root) return null;
  return <primitive object={root} scale={1.35} />;
}
