/**
 * Part factory — catalog definitions → 3D meshes, physics hints, socket metadata.
 */
import * as THREE from 'three';
import { getRegistryPart, getRegistryChassis } from '../data/modular-parts-registry.js';
import { buildAttachedPart } from '../three/premiumMeshes.js';
import { slotAcceptsPart } from '../data/assembly-parts.js';

const MATERIAL_PRESETS = {
  metal: { metalness: 0.8, roughness: 0.2 },
  plastic: { metalness: 0.1, roughness: 0.6 },
  rubber: { metalness: 0, roughness: 0.9 },
  glossy: { metalness: 0.6, roughness: 0.1 },
};

export function getPartDefinition(category, partId) {
  if (category === 'chassis') {
    const c = getRegistryChassis(partId);
    if (!c) return null;
    return {
      category: 'chassis',
      id: partId,
      label: c.label,
      icon: c.icon,
      meshShape: c.meshShape,
      template: c.template,
      physics: { mass: 2 + (c.scale ?? 1) * 0.5 },
    };
  }
  const reg = getRegistryPart(category, partId);
  if (!reg) return null;
  return {
    category,
    id: partId,
    label: reg.label,
    icon: reg.icon,
    visual: reg.visual,
    meshKey: reg.meshKey,
    patch: reg.patch,
    unlocks: reg.unlocks,
    wheelType: reg.wheelType,
    statMods: reg.statMods || {},
    physics: estimatePhysics(reg),
  };
}

function estimatePhysics(reg) {
  const cat = reg.category;
  if (cat === 'movement') return { mass: reg.wheelType === 'tracks' ? 1.2 : 0.5 };
  if (cat === 'sensors') return { mass: 0.2 };
  if (cat === 'utility') return { mass: 0.4 };
  if (cat === 'power') return { mass: 0.6 };
  if (cat === 'armor' || cat === 'structure') return { mass: 0.35 };
  return { mass: 0.25 };
}

export function createPartMeshGroup(category, partId, color = '#1E90FF', disposables = []) {
  const mesh = buildAttachedPart(category, partId, color, disposables);
  if (mesh) {
    mesh.userData.partFactory = { category, partId };
  }
  return mesh;
}

export function getMaterialPreset(name) {
  return MATERIAL_PRESETS[name] || MATERIAL_PRESETS.plastic;
}

/** Valid socket ids for a dragged part category */
export function getValidSocketsForCategory(slots, category, visibleSlots, isArm = false) {
  const list = visibleSlots || Object.keys(slots || {});
  return list.filter((slotId) => !slots[slotId] && slotAcceptsPart(slotId, category));
}

export function cloneGhostMesh(category, partId, color, disposables) {
  const g = createPartMeshGroup(category, partId, color, disposables);
  if (!g) return null;
  g.traverse((c) => {
    if (c.isMesh && c.material) {
      c.material = c.material.clone();
      c.material.transparent = true;
      c.material.opacity = 0.45;
      c.material.depthWrite = false;
    }
  });
  return g;
}

export function disposeMeshGroup(group) {
  if (!group) return;
  group.traverse((c) => {
    if (c.geometry) c.geometry.dispose();
    if (c.material) {
      const mats = Array.isArray(c.material) ? c.material : [c.material];
      mats.forEach((m) => m.dispose());
    }
  });
}
