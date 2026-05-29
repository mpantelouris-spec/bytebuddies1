/**
 * Semi-transparent 3D preview of dragged part at hovered socket.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSlotPosition } from '../../data/assembly-parts.js';
import { useUiStore } from '../../store/uiStore.js';
import { cloneGhostMesh, disposeMeshGroup } from '../../services/part-factory.js';

export default function PartAttachGhost({ base, color = '#1E90FF' }) {
  const draggingPart = useUiStore((s) => s.draggingPart);
  const hoveredSocket = useUiStore((s) => s.hoveredSocket);
  const groupRef = useRef();
  const [ghost, setGhost] = useState(null);

  useEffect(() => {
    if (!draggingPart || draggingPart.category === 'chassis' || !hoveredSocket) {
      setGhost((prev) => {
        if (prev) disposeMeshGroup(prev);
        return null;
      });
      return undefined;
    }
    const disposables = [];
    const mesh = cloneGhostMesh(draggingPart.category, draggingPart.id, color, disposables);
    setGhost((prev) => {
      if (prev) disposeMeshGroup(prev);
      return mesh;
    });
    return () => {
      disposables.forEach((x) => {
        try { x?.dispose?.(); } catch { /* ignore */ }
      });
    };
  }, [draggingPart?.category, draggingPart?.id, hoveredSocket, color]);

  useEffect(() => () => {
    if (ghost) disposeMeshGroup(ghost);
  }, [ghost]);

  useFrame((state) => {
    if (!groupRef.current || !ghost || !hoveredSocket) return;
    const pos = getSlotPosition(hoveredSocket, base);
    groupRef.current.position.set(pos[0], pos[1], pos[2]);
    const t = state.clock.elapsedTime;
    groupRef.current.scale.setScalar(1 + Math.sin(t * 6) * 0.04);
  });

  if (!ghost || !hoveredSocket) return null;

  return (
    <group ref={groupRef}>
      <primitive object={ghost} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.12, 0.22, 32]} />
        <meshBasicMaterial color="#00FF41" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
