/**
 * CINEMATIC CAMERA SYSTEM — Enhanced with smooth follow, dynamic zoom, shake effects
 * Replaces TestArenaCameraRig with premium cinematography
 */
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { damp } from '../../utils/workshop-camera.js';

const _lookTarget = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();

export default function CinematicCameraRig({
  controlsRef,
  targetRef,
  running,
  userInteractingRef,
  focusRequest = 0,
  cameraShakeIntensity = 0,
}) {
  const followAzimuth = useRef(null);
  const cameraShakeRef = useRef(0);
  const shakeTimeRef = useRef(0);

  // Trigger camera shake on impact (called by collision system)
  const triggerShake = (intensity = 0.3, duration = 0.2) => {
    cameraShakeRef.current = intensity;
    shakeTimeRef.current = duration;
  };

  // Focus on robot with smooth animation
  useEffect(() => {
    if (focusRequest <= 0) return;
    const api = controlsRef.current;
    if (!api) return;

    const t = targetRef.current;
    _lookTarget.set(t?.x ?? 0, 0.8, t?.z ?? 0);
    api.setDesiredTarget?.(_lookTarget);
    api.setDesiredDistance?.(5.5);
    api.focusRobot?.();
    followAzimuth.current = null;
  }, [focusRequest, controlsRef, targetRef]);

  useFrame((state, delta) => {
    const t = targetRef.current;
    const api = controlsRef.current;
    if (!t || !api) return;

    // Camera shake effect
    if (cameraShakeRef.current > 0) {
      shakeTimeRef.current -= delta;
      if (shakeTimeRef.current <= 0) {
        cameraShakeRef.current = 0;
      }
    }

    const { camera } = state;
    const basePos = camera.position.clone();

    // Smooth camera target with lookahead during movement
    const moveDir = Math.atan2(t.z - (targetRef.current?.prevZ ?? 0), t.x - (targetRef.current?.prevX ?? 0));
    const lookAheadDist = t.moving ? 1.2 : 0;

    _lookTarget.set(
      t.x + Math.cos(moveDir) * lookAheadDist,
      0.8 + (t.hover || 0),
      t.z + Math.sin(moveDir) * lookAheadDist
    );
    api.setDesiredTarget?.(_lookTarget);

    // Dynamic zoom based on speed
    const interacting = userInteractingRef?.current;
    const c = api.controls;
    if (!c) return;

    if (running && !interacting) {
      const angleRad = ((t.angle ?? -90) * Math.PI) / 180;
      const behind = angleRad + Math.PI;

      if (followAzimuth.current == null) followAzimuth.current = c.getAzimuthalAngle();
      followAzimuth.current = damp(followAzimuth.current, behind, 5.5, delta);
      c.setAzimuthalAngle(followAzimuth.current);

      // Dynamic distance based on movement
      const baseDistance = 5.5;
      const distGoal = THREE.MathUtils.clamp(
        baseDistance * (t.moving ? 1.15 : 0.95),
        3.5,
        8.5
      );
      api.setDesiredDistance?.(distGoal);

      // Slight elevation shift based on movement
      const elevationGoal = t.moving ? 1.1 : 0.9;
      const polarAngle = c.getPolarAngle?.();
      if (polarAngle) {
        const newPolar = damp(polarAngle, elevationAngle, 3, delta);
        c.setPolarAngle?.(newPolar);
      }
    } else if (!interacting) {
      followAzimuth.current = c.getAzimuthalAngle();
    }

    // Apply camera shake
    if (cameraShakeRef.current > 0) {
      const shakeX = (Math.random() - 0.5) * cameraShakeRef.current;
      const shakeY = (Math.random() - 0.5) * cameraShakeRef.current;
      const shakeZ = (Math.random() - 0.5) * cameraShakeRef.current;

      camera.position.x += shakeX;
      camera.position.y += shakeY;
      camera.position.z += shakeZ;

      cameraShakeRef.current *= 0.85; // Decay
    }

    // Store prev position for lookahead
    if (targetRef.current) {
      targetRef.current.prevX = t.x;
      targetRef.current.prevZ = t.z;
    }
  });

  // Expose shake function
  useEffect(() => {
    controlsRef.current = controlsRef.current || {};
    controlsRef.current.triggerCameraShake = triggerShake;
  }, [controlsRef]);

  return (
    <group>
      {/* Placeholder — controls handled in useFrame above */}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VICTORY CAMERA MODE
// ─────────────────────────────────────────────────────────────────────────────

export function VictoryCameraSequence({ active, targetRef, cameraRef }) {
  useFrame((state, delta) => {
    if (!active || !cameraRef?.current || !targetRef?.current) return;

    const { camera } = state;
    const t = targetRef.current;
    const elapsedTime = state.clock.elapsedTime;

    // Cinematic orbit around robot
    const orbitRadius = 6 + Math.sin(elapsedTime * 0.8) * 0.5;
    const angle = elapsedTime * 1.2;
    const height = 3 + Math.sin(elapsedTime * 1.5) * 0.8;

    camera.position.x = t.x + Math.cos(angle) * orbitRadius;
    camera.position.y = height;
    camera.position.z = t.z + Math.sin(angle) * orbitRadius;

    camera.lookAt(t.x, 1.2, t.z);
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTRO CAMERA SWEEP
// ─────────────────────────────────────────────────────────────────────────────

export function IntroCameraSweep({ active, sceneCenter, cameraRef, duration = 3 }) {
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!active || !cameraRef?.current) return;

    timeRef.current += delta;
    const progress = Math.min(timeRef.current / duration, 1);

    const { camera } = state;
    const center = sceneCenter || [0, 0, 0];

    // Wide sweeping camera motion
    const radius = 12 * (1 - progress * 0.4);
    const angle = progress * Math.PI * 1.2;
    const height = 4 + progress * 2;

    camera.position.x = center[0] + Math.cos(angle) * radius;
    camera.position.y = height;
    camera.position.z = center[2] + Math.sin(angle) * radius;

    camera.lookAt(center[0], center[1] + 1, center[2]);

    // Auto-end sweep
    if (progress >= 1) {
      active = false;
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMOOTH ZOOM CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

export const zoomControls = {
  zoomIn: (controlsRef, amount = 0.5) => {
    const api = controlsRef?.current;
    if (api?.setDesiredDistance) {
      const currentDist = api.getDistance?.() || 5.5;
      api.setDesiredDistance?.(Math.max(3, currentDist - amount));
    }
  },

  zoomOut: (controlsRef, amount = 0.5) => {
    const api = controlsRef?.current;
    if (api?.setDesiredDistance) {
      const currentDist = api.getDistance?.() || 5.5;
      api.setDesiredDistance?.(Math.min(10, currentDist + amount));
    }
  },

  resetZoom: (controlsRef) => {
    const api = controlsRef?.current;
    if (api?.setDesiredDistance) {
      api.setDesiredDistance?.(5.5);
    }
  },
};
