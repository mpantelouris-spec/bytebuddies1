/**
 * Workshop camera — auto-frames robot, smooth zoom, double-click focus, safe limits.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import StudioOrbitControls from '../academy/StudioOrbitControls.jsx';
import { computeRobotCameraFrame, getFocusPose } from '../../utils/workshop-camera.js';

export default function WorkshopCameraRig({
  controlsRef,
  displayScale,
  placedCount,
  buildMode = 'advanced',
  blockCount = 0,
  userInteractingRef,
  focusRequest = 0,
}) {
  const { camera } = useThree();
  const frame = useMemo(
    () =>
      computeRobotCameraFrame({
        displayScale,
        placedCount,
        blockCount,
        buildMode,
      }),
    [displayScale, placedCount, blockCount, buildMode],
  );

  const prevScale = useRef(displayScale);
  const prevParts = useRef(placedCount);

  useEffect(() => {
    camera.fov = frame.fov;
    camera.near = 0.12;
    camera.far = 55;
    camera.updateProjectionMatrix();
  }, [camera, frame.fov]);

  useEffect(() => {
    const api = controlsRef.current;
    if (!api) return;

    const grew =
      displayScale > prevScale.current + 0.02 ||
      placedCount > prevParts.current;
    prevScale.current = displayScale;
    prevParts.current = placedCount;

    const pose = getFocusPose(frame);
    api.setDesiredTarget?.(new THREE.Vector3(...pose.target));
    api.setDesiredDistance?.(pose.distance);

    if (grew && !userInteractingRef?.current) {
      const current = api.controls?.getDistance?.() ?? pose.distance;
      api.setDesiredDistance?.(
        THREE.MathUtils.lerp(current, pose.distance * 1.06, 0.35),
      );
    }
  }, [controlsRef, displayScale, placedCount, frame, userInteractingRef]);

  useEffect(() => {
    if (focusRequest <= 0) return;
    const pose = getFocusPose(frame);
    controlsRef.current?.setDesiredTarget?.(new THREE.Vector3(...pose.target));
    controlsRef.current?.setDesiredDistance?.(pose.distance);
    controlsRef.current?.focusRobot?.();
  }, [focusRequest, controlsRef, frame]);

  return (
    <StudioOrbitControls
      apiRef={controlsRef}
      minDistance={frame.minDistance}
      maxDistance={frame.maxDistance}
      target={frame.target}
      userInteractingRef={userInteractingRef}
      zoomSpeed={0.36}
      rotateSpeed={0.58}
      enableIdleOrbit={false}
    />
  );
}
