import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { BLOCK_CELL, gridToWorld, getBlockType, worldKey } from '../data/block-parts.js';
import { migrateAssembly } from '../services/assembly-service.js';

const GRID_RANGE = 2;

function GhostBlock({ typeId, position, opacity = 0.45 }) {
  const type = getBlockType(typeId);
  if (!type) return null;
  const color = type.color || '#8B00FF';
  return (
    <mesh position={position}>
      <boxGeometry args={[BLOCK_CELL * 0.88, BLOCK_CELL * 0.88, BLOCK_CELL * 0.88]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        transparent
        opacity={opacity}
        wireframe={opacity < 0.5}
      />
    </mesh>
  );
}

function GridCell({ gx, gy, gz, occupied, selectedType, onPlace, onRemove, hovered, setHovered }) {
  const [wx, wy, wz] = gridToWorld(gx, gy, gz);
  const isHover = hovered?.gx === gx && hovered?.gy === gy && hovered?.gz === gz;

  return (
    <mesh
      position={[wx, wy - BLOCK_CELL * 0.48, wz]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered({ gx, gy, gz }); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered((h) => (h?.gx === gx && h?.gy === gy && h?.gz === gz ? null : h)); }}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (occupied) onRemove(gx, gy, gz);
        else onPlace(selectedType, gx, gy, gz);
      }}
    >
      <boxGeometry args={[BLOCK_CELL * 0.92, BLOCK_CELL * 0.06, BLOCK_CELL * 0.92]} />
      <meshBasicMaterial
        color={occupied ? '#00ff88' : isHover ? '#00d4ff' : '#8b00ff'}
        transparent
        opacity={occupied ? 0.25 : isHover ? 0.35 : 0.08}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** Click cells in the 3D chamber to snap blocks — synced with UI grid */
export default function BlockPlacement3D({
  design,
  layerY = 0,
  selectedType = 'cube',
  onPlace,
  onRemove,
  enabled = true,
}) {
  const [hovered, setHovered] = useState(null);
  const asm = migrateAssembly(design);
  const blocks = asm.blocks || [];

  const occupiedMap = useMemo(() => {
    const m = new Map();
    blocks.forEach((b) => m.set(worldKey(b.x, b.y, b.z), b));
    return m;
  }, [blocks]);

  const cells = useMemo(() => {
    const list = [];
    for (let gx = -GRID_RANGE; gx <= GRID_RANGE; gx += 1) {
      for (let gz = -GRID_RANGE; gz <= GRID_RANGE; gz += 1) {
        list.push({ gx, gy: layerY, gz, key: worldKey(gx, layerY, gz) });
      }
    }
    return list;
  }, [layerY]);

  if (!enabled) return null;

  const hoverPos = hovered ? gridToWorld(hovered.gx, hovered.gy, hovered.gz) : null;
  const hoverOccupied = hovered ? occupiedMap.has(worldKey(hovered.gx, hovered.gy, hovered.gz)) : false;

  return (
    <group position={[0, 0.02, 0]}>
      {cells.map(({ gx, gy, gz, key }) => (
        <GridCell
          key={key}
          gx={gx}
          gy={gy}
          gz={gz}
          occupied={occupiedMap.has(key)}
          selectedType={selectedType}
          onPlace={onPlace}
          onRemove={() => {
            const b = occupiedMap.get(key);
            if (b) onRemove(b.id);
          }}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
      {hovered && !hoverOccupied && hoverPos && (
        <GhostBlock typeId={selectedType} position={hoverPos} opacity={0.55} />
      )}
    </group>
  );
}
