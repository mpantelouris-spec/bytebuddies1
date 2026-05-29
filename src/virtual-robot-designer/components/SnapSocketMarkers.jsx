import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { getSlotPosition, SNAP_SLOTS, slotAcceptsPart } from '../data/assembly-parts.js';
import { useUiStore } from '../store/uiStore.js';

function SocketPillar({
  position,
  label,
  active,
  filled,
  pulse,
  invalid,
  validDrop,
  hoveredTarget,
  productMode,
  onSelect,
  onRemove,
}) {
  const ringRef = useRef();
  const beamRef = useRef();
  const flowRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * (active ? 1.2 : 0.4);
      const base = invalid ? 0.7 : filled ? 0.65 : active ? 0.55 : hovered ? 0.45 : 0.25;
      ringRef.current.material.opacity = base + Math.sin(t * (invalid ? 5 : active ? 4 : 2)) * (invalid ? 0.25 : active && !filled ? 0.2 : 0.08);
      const col = invalid ? '#ef4444' : filled ? '#1E90FF' : active || hovered ? '#00FF41' : '#00D9FF';
      ringRef.current.material.color.set(col);
    }
    if (beamRef.current && active && !filled) {
      beamRef.current.material.opacity = 0.12 + Math.sin(t * 3) * 0.08;
    }
    if (flowRef.current && filled) {
      flowRef.current.rotation.z = t * 2;
      flowRef.current.material.opacity = 0.35 + Math.sin(t * 5) * 0.15;
    }
  });

  const color = invalid ? '#ef4444' : filled ? '#1E90FF' : active || hovered ? '#00FF41' : '#00D9FF';
  const hitR = productMode ? 0.28 : 0.18;

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (filled) onRemove?.();
          else onSelect?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = filled ? 'default' : 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[hitR, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, filled ? 0.2 : active ? 0.17 : 0.14, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>

      {!filled && (active || hovered) && (
        <Text
          position={[0, 0.42, 0]}
          fontSize={productMode ? 0.09 : 0.06}
          color="#00FF41"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.004}
          outlineColor="#000000"
        >
          {productMode ? '+' : label}
        </Text>
      )}

      {filled && (
        <mesh ref={flowRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.06, 0.12, 24]} />
          <meshBasicMaterial color="#FF006E" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {hoveredTarget && !filled && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.16, 0.3, 32]} />
          <meshBasicMaterial color="#00FF41" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {!filled && (
        <mesh ref={beamRef} position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.35, 6]} />
          <meshBasicMaterial color="#00D9FF" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {pulse && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.05, 0.32, 32]} />
          <meshBasicMaterial color="#00FF41" transparent opacity={0.55} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {validDrop && !filled && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.14, 0.26, 32]} />
          <meshBasicMaterial color="#00FF41" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {invalid && !filled && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.12, 0.22, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
    </group>
  );
}

/** Clickable attachment sockets — kids tap + to choose where to build */
export default function SnapSocketMarkers({
  base,
  slots,
  highlightSlot,
  snapPulse,
  dragCategory = null,
  productMode = false,
  visibleSlots = null,
  onSocketSelect,
  onSocketRemove,
}) {
  const hoveredSocket = useUiStore((s) => s.hoveredSocket);
  const snapPulseSlot = useUiStore((s) => s.snapPulseSlot);

  return (
    <>
      {Object.entries(SNAP_SLOTS).map(([slotId, meta]) => {
        if (visibleSlots && !visibleSlots.includes(slotId)) return null;
        const pos = getSlotPosition(slotId, base);
        const filled = !!slots[slotId];
        const active = highlightSlot === slotId;
        const invalid = dragCategory && !filled && !slotAcceptsPart(slotId, dragCategory);
        const validDrop = dragCategory && !filled && slotAcceptsPart(slotId, dragCategory);
        const hoveredTarget = hoveredSocket === slotId && validDrop;
        if (base?.shape === 'arm' && !['front', 'right', 'left', 'top'].includes(slotId)) return null;
        return (
          <SocketPillar
            key={slotId}
            position={pos}
            label={meta.label}
            active={active}
            filled={filled}
            invalid={invalid}
            validDrop={validDrop}
            hoveredTarget={hoveredTarget}
            pulse={(active && snapPulse) || snapPulseSlot === slotId}
            productMode={productMode}
            onSelect={() => onSocketSelect?.(slotId)}
            onRemove={() => onSocketRemove?.(slotId)}
          />
        );
      })}
    </>
  );
}
