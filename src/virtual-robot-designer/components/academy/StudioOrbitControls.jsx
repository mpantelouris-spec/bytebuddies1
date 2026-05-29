import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  damp,
  dampVec3,
  getOrbitDistance,
  setOrbitDistance,
} from '../../utils/workshop-camera.js';

const _desiredTarget = new THREE.Vector3();
const _smoothTarget = new THREE.Vector3();

/**
 * Kid-friendly orbit controls — damped zoom, robot-centered target, smooth API.
 */
export default function StudioOrbitControls({
  apiRef,
  minDistance = 2.2,
  maxDistance = 8,
  target = [0, 0.35, 0],
  userInteractingRef,
  zoomSpeed = 0.38,
  rotateSpeed = 0.62,
  enableIdleOrbit = false,
}) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const smoothDistance = useRef(null);
  const idleTimer = useRef(0);

  useEffect(() => {
    _desiredTarget.set(...target);
    _smoothTarget.copy(_desiredTarget);
    if (!controlsRef.current) return undefined;
    controlsRef.current.target.copy(_desiredTarget);
    controlsRef.current.minDistance = minDistance;
    controlsRef.current.maxDistance = maxDistance;
    controlsRef.current.update();
    return undefined;
  }, [target, minDistance, maxDistance]);

  useEffect(() => {
    if (!apiRef) return undefined;

    apiRef.current = {
      get controls() {
        return controlsRef.current;
      },
      setDesiredTarget(vec3) {
        _desiredTarget.copy(vec3);
      },
      setDesiredDistance(d) {
        smoothDistance.current = THREE.MathUtils.clamp(d, minDistance, maxDistance);
      },
      rotateLeft(angle = Math.PI / 10) {
        const c = controlsRef.current;
        if (!c) return;
        c.setAzimuthalAngle(c.getAzimuthalAngle() + angle);
        c.update();
      },
      rotateRight(angle = Math.PI / 10) {
        const c = controlsRef.current;
        if (!c) return;
        c.setAzimuthalAngle(c.getAzimuthalAngle() - angle);
        c.update();
      },
      zoomIn(step = 0.14) {
        const c = controlsRef.current;
        if (!c) return;
        const d = getOrbitDistance(c, camera);
        smoothDistance.current = THREE.MathUtils.clamp(
          d * (1 - step),
          minDistance,
          maxDistance,
        );
      },
      zoomOut(step = 0.2) {
        const c = controlsRef.current;
        if (!c) return;
        const d = getOrbitDistance(c, camera);
        smoothDistance.current = THREE.MathUtils.clamp(
          d * (1 + step),
          minDistance,
          maxDistance,
        );
      },
      focusRobot() {
        const c = controlsRef.current;
        if (!c) return;
        _desiredTarget.set(...target);
        c.target.copy(_desiredTarget);
        c.setAzimuthalAngle(0.38);  // matches workshop-camera.js
        c.setPolarAngle(1.22);     // matches workshop-camera.js
        if (smoothDistance.current != null) {
          setOrbitDistance(c, camera, smoothDistance.current);
        }
        c.update();
      },
    };
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef, camera, minDistance, maxDistance, target]);

  useFrame((_, delta) => {
    const c = controlsRef.current;
    if (!c) return;

    c.minDistance = minDistance;
    c.maxDistance = maxDistance;

    const interacting = userInteractingRef?.current;
    if (interacting) idleTimer.current = 0;
    else idleTimer.current += delta;

    dampVec3(c.target, c.target, _desiredTarget, interacting ? 14 : 5.5, delta);
    _smoothTarget.copy(c.target);

    const currentDist = getOrbitDistance(c, camera);
    if (smoothDistance.current == null) {
      smoothDistance.current = currentDist;
    }
    const goalDist = smoothDistance.current;
    const nextDist = damp(currentDist, goalDist, interacting ? 18 : 8, delta);
    if (Math.abs(nextDist - currentDist) > 0.0005) {
      setOrbitDistance(c, camera, nextDist);
    }

    if (enableIdleOrbit && !interacting && idleTimer.current > 14) {
      c.setAzimuthalAngle(c.getAzimuthalAngle() + delta * 0.04);
      c.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={Math.PI / 2.08}
      minPolarAngle={0.52}
      target={target}
      enableDamping
      dampingFactor={0.12}
      zoomSpeed={zoomSpeed}
      rotateSpeed={rotateSpeed}
      enableZoom
      screenSpacePanning={false}
      onStart={() => {
        if (userInteractingRef) userInteractingRef.current = true;
        smoothDistance.current = getOrbitDistance(controlsRef.current, camera);
      }}
      onChange={() => {
        if (userInteractingRef?.current && controlsRef.current) {
          smoothDistance.current = getOrbitDistance(controlsRef.current, camera);
        }
      }}
      onEnd={() => {
        if (userInteractingRef) userInteractingRef.current = false;
        if (controlsRef.current) {
          smoothDistance.current = getOrbitDistance(controlsRef.current, camera);
        }
      }}
    />
  );
}
