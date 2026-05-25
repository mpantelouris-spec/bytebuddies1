import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { damp, dampVec3 } from '../../utils/workshop-camera.js';
import { SIM_CAMERA } from '../../constants/test-arena-scene.js';

const _target = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();

/** Cinematic follow — keeps robot centered, smooth damping, auto distance */
export default function TestArenaCamera({ targetRef, running }) {
  const { camera } = useThree();
  const smoothLook = useRef(new THREE.Vector3(0, 0.55, 0));
  const distRef = useRef(SIM_CAMERA.baseDistance);

  useFrame((_, delta) => {
    const t = targetRef.current;
    if (!t) return;

    _target.set(t.x, 0.55 + (t.hover || 0), t.z);
    const speed = t.moving ? 1.15 : 1;
    const idealDist = THREE.MathUtils.clamp(
      SIM_CAMERA.baseDistance * speed,
      SIM_CAMERA.minDistance,
      SIM_CAMERA.maxDistance,
    );
    distRef.current = damp(distRef.current, idealDist, SIM_CAMERA.zoomLambda, delta);
    const dist = distRef.current;

    const angleRad = ((t.angle ?? -90) * Math.PI) / 180;
    const behindX = Math.cos(angleRad) * dist * 0.85;
    const behindZ = Math.sin(angleRad) * dist * 0.85;

    _desiredPos.set(
      t.x - behindX + SIM_CAMERA.sideOffset * 0.35,
      dist * 0.42 + SIM_CAMERA.heightOffset * 0.35 + (t.hover || 0),
      t.z - behindZ + dist * 0.55,
    );

    const lambda = running ? SIM_CAMERA.followLambda * 1.4 : SIM_CAMERA.followLambda;
    dampVec3(camera.position, camera.position, _desiredPos, lambda, delta);
    dampVec3(smoothLook.current, smoothLook.current, _target, lambda * 1.2, delta);
    camera.lookAt(smoothLook.current);
    camera.fov = damp(camera.fov, SIM_CAMERA.fov, 4, delta);
    camera.updateProjectionMatrix();
  });

  return null;
}
