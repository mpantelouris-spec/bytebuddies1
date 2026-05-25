import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BLOCK_CELL, gridToWorld, getBlockType } from '../data/block-parts.js';
import { migrateAssembly } from '../services/assembly-service.js';

const GRID_RANGE = 2;

/** Holographic 3D snap grid — visible during block/hybrid building */
export default function BlockGrid3D({ design, highlightLayer = 0, pulse = false }) {
  const groupRef = useRef();
  const asm = migrateAssembly(design);
  const blocks = asm.blocks || [];
  const occupied = new Set(blocks.map((b) => `${b.x},${b.y},${b.z}`));

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.02;
    }
  });

  const cells = [];
  for (let gx = -GRID_RANGE; gx <= GRID_RANGE; gx += 1) {
    for (let gz = -GRID_RANGE; gz <= GRID_RANGE; gz += 1) {
      for (let gy = 0; gy <= 3; gy += 1) {
        const key = `${gx},${gy},${gz}`;
        const [wx, wy, wz] = gridToWorld(gx, gy, gz);
        const isOccupied = occupied.has(key);
        const isHighlightLayer = gy === highlightLayer;
        cells.push({ key, wx, wy, wz, isOccupied, isHighlightLayer });
      }
    }
  }

  return (
    <group ref={groupRef} position={[0, -0.05, 0]}>
      {cells.map(({ key, wx, wy, wz, isOccupied, isHighlightLayer }) => {
        if (isOccupied) return null;
        if (!isHighlightLayer && !pulse) return null;
        return (
          <mesh key={key} position={[wx, wy - BLOCK_CELL * 0.5, wz]}>
            <boxGeometry args={[BLOCK_CELL * 0.92, BLOCK_CELL * 0.04, BLOCK_CELL * 0.92]} />
            <meshBasicMaterial
              color={isHighlightLayer ? '#00d4ff' : '#8b00ff'}
              transparent
              opacity={isHighlightLayer ? (pulse ? 0.35 : 0.12) : 0.06}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
      {blocks.map((block) => {
        const type = getBlockType(block.type);
        const [wx, wy, wz] = gridToWorld(block.x, block.y, block.z);
        return (
          <group key={block.id} position={[wx, wy, wz]}>
            <mesh>
              <boxGeometry args={[BLOCK_CELL * 0.95, BLOCK_CELL * 0.95, BLOCK_CELL * 0.95]} />
              <meshBasicMaterial
                color={type?.color || '#8B00FF'}
                transparent
                opacity={0.08}
                wireframe
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
