/**
 * Single transform for robot body, attachments, and sockets — fixes floating/disconnected parts.
 */
import React, { useMemo } from 'react';
import HeroRobotModel from '../HeroRobotModel.jsx';
import AssemblyAttachmentMeshes from '../AssemblyAttachmentMeshes.jsx';
import SnapSocketMarkers from '../SnapSocketMarkers.jsx';
import { migrateDesign } from '../../config.js';
import { migrateAssembly } from '../../services/assembly-service.js';
import { getVisibleSockets } from '../../utils/build-slots.js';
import { computeWorkshopRobotScale, computeWorkshopAnchorY } from '../../constants/workshop-scene.js';
import RobotMaterialEnhancer from './RobotMaterialEnhancer.jsx';
import SocketDropBridge from './SocketDropBridge.jsx';
import PartAttachGhost from './PartAttachGhost.jsx';

export default function RobotAssemblyRoot({
  design,
  highlightSlot,
  snapPulse,
  dragCategory,
  onSocketSelect,
  onSocketRemove,
}) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const displayScale = useMemo(() => computeWorkshopRobotScale(d), [d]);
  const anchorY = useMemo(() => computeWorkshopAnchorY(d, displayScale), [d, displayScale]);
  const visibleSockets = getVisibleSockets(asm, asm.base?.shape === 'arm', { freeBuild: true });
  const designKey = `${d.id}-${displayScale}-${Object.keys(asm.slots).filter((k) => asm.slots[k]).join(',')}`;
  const robotPosition = [0, anchorY, 0];

  return (
    <group position={robotPosition} scale={[displayScale, displayScale, displayScale]}>
      <SocketDropBridge
        base={asm.base}
        slots={asm.slots}
        visibleSlots={visibleSockets}
        robotPosition={robotPosition}
        robotScale={displayScale}
      />
      <PartAttachGhost base={asm.base} color={asm.base?.color || '#1E90FF'} />
      <RobotMaterialEnhancer designKey={designKey}>
      <HeroRobotModel
        key={`hero-${asm.base?.chassisType}-${asm.base?.shape}-${asm.base?.scale}-${asm.base?.width}-${asm.base?.color}-${Object.keys(asm.slots).filter((k) => asm.slots[k]).join('-')}`}
        design={d}
        productVisual
        workshopGrounded
        heroScale={1}
      />
      <AssemblyAttachmentMeshes design={d} />
      <SnapSocketMarkers
        base={asm.base}
        slots={asm.slots}
        highlightSlot={highlightSlot}
        snapPulse={snapPulse}
        dragCategory={dragCategory}
        productMode
        visibleSlots={visibleSockets}
        onSocketSelect={onSocketSelect}
        onSocketRemove={onSocketRemove}
      />
      </RobotMaterialEnhancer>
    </group>
  );
}
