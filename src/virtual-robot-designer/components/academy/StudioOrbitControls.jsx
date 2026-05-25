import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';

/** Wraps drei OrbitControls with a stable API for UI buttons + workshop auto-orbit */
export default function StudioOrbitControls({
  apiRef,
  minDistance = 2.2,
  maxDistance = 6,
  target = [0, 0.35, 0],
  userInteractingRef,
}) {
  const controlsRef = useRef();

  useEffect(() => {
    if (!apiRef) return undefined;
    apiRef.current = {
      get controls() {
        return controlsRef.current;
      },
      rotateLeft(angle = Math.PI / 8) {
        const c = controlsRef.current;
        if (!c) return;
        c.setAzimuthalAngle(c.getAzimuthalAngle() + angle);
        c.update();
      },
      rotateRight(angle = Math.PI / 8) {
        const c = controlsRef.current;
        if (!c) return;
        c.setAzimuthalAngle(c.getAzimuthalAngle() - angle);
        c.update();
      },
      zoomIn(scale = 1.12) {
        const c = controlsRef.current;
        if (!c) return;
        if (typeof c.dollyIn === 'function') c.dollyIn(scale);
        else c.setDistance(Math.max(c.minDistance, c.getDistance() / scale));
        c.update();
      },
      zoomOut(scale = 1.12) {
        const c = controlsRef.current;
        if (!c) return;
        if (typeof c.dollyOut === 'function') c.dollyOut(scale);
        else c.setDistance(Math.min(c.maxDistance, c.getDistance() * scale));
        c.update();
      },
    };
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={Math.PI / 2.15}
      minPolarAngle={0.42}
      target={target}
      enableDamping
      dampingFactor={0.08}
      onStart={() => {
        if (userInteractingRef) userInteractingRef.current = true;
      }}
      onEnd={() => {
        if (userInteractingRef) userInteractingRef.current = false;
      }}
    />
  );
}
