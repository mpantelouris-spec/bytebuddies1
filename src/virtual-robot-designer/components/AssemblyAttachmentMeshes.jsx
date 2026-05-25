import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { migrateAssembly } from '../services/assembly-service.js';
import { getSlotPosition } from '../data/assembly-parts.js';
import { buildIndustrialPart } from '../three/industrialMeshes.js';

const EXTRA_SLOTS = ['front', 'left', 'right', 'back', 'top', 'addon_a', 'addon_b'];

const SLOT_BASE_ROT = {
  front: 0,
  left: 0.4,
  right: -0.4,
  back: Math.PI,
  top: 0,
  addon_a: 0.25,
  addon_b: -0.25,
};

/** 3D meshes for all mounted extra-slot parts */
export default function AssemblyAttachmentMeshes({ design }) {
  const [root, setRoot] = useState(null);
  const disposeRef = React.useRef(null);

  useEffect(() => {
    if (disposeRef.current) disposeRef.current();

    const asm = migrateAssembly(design);
    const group = new THREE.Group();
    const disposables = [];

    EXTRA_SLOTS.forEach((slotId) => {
      const placed = asm.slots?.[slotId];
      if (!placed) return;
      if (slotId === 'front' && placed.category === 'sensors') return;

      const pos = getSlotPosition(slotId, asm.base);
      const xf = asm.slotTransforms?.[slotId] || { rotY: 0, scale: 1 };
      const part = buildIndustrialPart(placed.category, placed.partId, disposables);
      part.position.set(pos[0], pos[1], pos[2]);
      part.rotation.y = (SLOT_BASE_ROT[slotId] || 0) + (xf.rotY || 0);
      const s = xf.scale || 1;
      part.scale.set(s, s, s);
      group.add(part);
    });

    disposeRef.current = () => {
      group.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((m) => m.dispose());
        }
      });
      disposables.forEach((x) => { try { x?.dispose?.(); } catch { /* ignore */ } });
    };

    setRoot(group);
    return () => {
      if (disposeRef.current) disposeRef.current();
      disposeRef.current = null;
    };
  }, [design]);

  if (!root) return null;
  return <primitive object={root} />;
}
