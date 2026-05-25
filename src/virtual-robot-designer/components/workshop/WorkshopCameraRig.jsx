/**
 * Cinematic camera — frames robot, gentle orbit, dynamic zoom from robot size.
 */
import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import StudioOrbitControls from '../academy/StudioOrbitControls.jsx';
import { computeCameraFrame } from '../../constants/workshop-scene.js';

export default function WorkshopCameraRig({ controlsRef, displayScale, placedCount, userInteractingRef }) {
  const { camera } = useThree();
  const frame = computeCameraFrame(displayScale, placedCount);
  const targetVec = useRef(new THREE.Vector3(...frame.target));
  const autoAngle = useRef(0.6);

  useEffect(() => {
    camera.position.set(...frame.position);
    camera.fov = frame.fov;
    camera.near = 0.15;
    camera.far = 50;
    camera.updateProjectionMatrix();
    targetVec.current.set(...frame.target);
  }, [camera, displayScale, placedCount]);

  useFrame((state, delta) => {
    if (!userInteractingRef?.current) {
      autoAngle.current += delta * 0.1;
      const c = controlsRef.current?.controls;
      if (c?.setAzimuthalAngle) {
        c.setAzimuthalAngle(autoAngle.current);
        c.update();
      }
    } else if (controlsRef.current?.controls) {
      autoAngle.current = controlsRef.current.controls.getAzimuthalAngle?.() ?? autoAngle.current;
    }
  });

  return (
    <StudioOrbitControls
      apiRef={controlsRef}
      minDistance={frame.orbitMin}
      maxDistance={frame.orbitMax}
      target={frame.target}
      userInteractingRef={userInteractingRef}
    />
  );
}
