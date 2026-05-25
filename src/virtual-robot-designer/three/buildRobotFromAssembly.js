import * as THREE from 'three';
import { migrateAssembly } from '../services/assembly-service.js';
import { getSlotPosition } from '../data/assembly-parts.js';
import {
  buildPremiumBase,
  buildPremiumArm,
  buildMovementSystem,
  buildAttachedPart,
} from './premiumMeshes.js';
import {
  buildIndustrialArm,
  buildIndustrialMobileBase,
  buildIndustrialMovement,
  buildIndustrialPart,
} from './industrialMeshes.js';

function mountAssemblySlots(group, asm, base, design, disposables, useIndustrial) {
  const built = useIndustrial
    ? buildIndustrialMobileBase(base, group, disposables)
    : buildPremiumBase(base, group, disposables);
  const dims = { bodyW: built.bodyW, bodyH: built.bodyH, bodyD: built.bodyD };

  Object.entries(asm.slots).forEach(([slotId, placed]) => {
    if (!placed) return;
    if (slotId === 'movement') {
      if (useIndustrial) buildIndustrialMovement(group, placed.partId, dims, design, disposables);
      else buildMovementSystem(group, placed.partId, dims, design, disposables);
      return;
    }
    const pos = getSlotPosition(slotId, base);
    const part = useIndustrial
      ? buildIndustrialPart(placed.category, placed.partId, disposables)
      : buildAttachedPart(placed.category, placed.partId, base.color, disposables);
    part.position.set(pos[0], pos[1], pos[2]);
    group.add(part);
  });
  return built;
}

/** AAA premium futuristic robot build from modular assembly */
export function buildRobotFromAssembly(design) {
  const asm = migrateAssembly(design);
  const group = new THREE.Group();
  const disposables = [];
  const base = asm.base;
  const useIndustrial = base.material === 'industrial';

  let built;
  if (base.shape === 'arm') {
    built = useIndustrial
      ? buildIndustrialArm(group, disposables)
      : buildPremiumArm(group, disposables, base.color);
    const front = asm.slots.front || asm.slots.right;
    if (front) {
      const tool = useIndustrial
        ? buildIndustrialPart(front.category, front.partId, disposables)
        : buildAttachedPart(front.category, front.partId, base.color, disposables);
      tool.position.set(0, 1.05, 0.38);
      tool.rotation.x = -0.4;
      group.add(tool);
    }
  } else {
    built = mountAssemblySlots(group, asm, base, design, disposables, useIndustrial);
  }

  const dispose = () => {
    group.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach((m) => m.dispose());
    });
    disposables.forEach((x) => { try { x?.dispose?.(); } catch { /* ignore */ } });
  };

  return { group, dispose, glowColor: base.color || '#8B00FF', dims: built, assembly: asm };
}

export { getSlotPosition };
