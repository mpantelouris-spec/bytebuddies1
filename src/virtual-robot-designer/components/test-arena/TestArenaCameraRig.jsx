/**
 * Test arena camera — scroll/button zoom with wide range + smooth follow while running.
 */
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StudioOrbitControls from '../academy/StudioOrbitControls.jsx';
import { ARENA_CAMERA } from '../../constants/test-arena-scene.js';
import { damp } from '../../utils/workshop-camera.js';

const _lookTarget = new THREE.Vector3();

export default function TestArenaCameraRig({
  controlsRef,
  targetRef,
  running,
  userInteractingRef,
  focusRequest = 0,
}) {
  const followAzimuth = useRef(null);

  useEffect(() => {
    if (focusRequest <= 0) return;
    const api = controlsRef.current;
    if (!api) return;
    const t = targetRef.current;
    api.setDesiredTarget?.(_lookTarget.set(t?.x ?? 0, ARENA_CAMERA.targetY, t?.z ?? 0));
    api.setDesiredDistance?.(ARENA_CAMERA.defaultDistance);
    api.focusRobot?.();
    followAzimuth.current = null;
  }, [focusRequest, controlsRef, targetRef]);

  useFrame((_, delta) => {
    const t = targetRef.current;
    const api = controlsRef.current;
    if (!t || !api) return;

    _lookTarget.set(t.x, ARENA_CAMERA.targetY + (t.hover || 0), t.z);
    api.setDesiredTarget?.(_lookTarget);

    const interacting = userInteractingRef?.current;
    const c = api.controls;
    if (!c) return;

    if (running && !interacting) {
      const angleRad = ((t.angle ?? -90) * Math.PI) / 180;
      const behind = angleRad + Math.PI;
      if (followAzimuth.current == null) followAzimuth.current = c.getAzimuthalAngle();
      followAzimuth.current = damp(followAzimuth.current, behind, 5.5, delta);
      c.setAzimuthalAngle(followAzimuth.current);
      const distGoal = THREE.MathUtils.clamp(
        ARENA_CAMERA.defaultDistance * (t.moving ? 1.08 : 1),
        ARENA_CAMERA.minDistance,
        ARENA_CAMERA.maxDistance,
      );
      api.setDesiredDistance?.(distGoal);
    } else if (!interacting) {
      followAzimuth.current = c.getAzimuthalAngle();
    }
  });

  return (
    <StudioOrbitControls
      apiRef={controlsRef}
      minDistance={ARENA_CAMERA.minDistance}
      maxDistance={ARENA_CAMERA.maxDistance}
      target={[0, ARENA_CAMERA.targetY, 0]}
      userInteractingRef={userInteractingRef}
      zoomSpeed={0.5}
      rotateSpeed={0.55}
    />
  );
}
