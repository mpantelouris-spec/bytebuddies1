/**
 * Single source of truth — modular robotics parts catalog.
 * Data lives in modular-parts-full-catalog.js; helpers stay here.
 */
import {
  FULL_CHASSIS,
  FULL_CATEGORIES,
  FULL_PARTS,
  FULL_PART_COUNT,
  FULL_CHASSIS_COUNT,
} from './modular-parts-full-catalog.js';

export const MODULAR_CHASSIS = FULL_CHASSIS;
export const REGISTRY_CATEGORIES = FULL_CATEGORIES;
export const MODULAR_PARTS = FULL_PARTS;
export const CATALOG_PART_COUNT = FULL_PART_COUNT;
export const CATALOG_CHASSIS_COUNT = FULL_CHASSIS_COUNT;

export function getRegistryPart(category, partId) {
  return MODULAR_PARTS.find((p) => p.category === category && p.id === partId);
}

export function getRegistryChassis(id) {
  return MODULAR_CHASSIS.find((c) => c.id === id);
}

/** Flat list for workshop / assembly validation */
export const MODULAR_WORKSHOP_PARTS = MODULAR_PARTS.map(({ category, id, label, icon }) => ({
  category,
  id,
  label,
  icon,
}));

/** Build MODULE_PARTS map for robot-catalog applyModulePatch */
export function buildModulePartsMap() {
  const map = {};
  for (const p of MODULAR_PARTS) {
    if (!map[p.category]) map[p.category] = [];
    map[p.category].push({
      id: p.id,
      label: p.label,
      icon: p.icon,
      patch: p.patch,
      unlocks: p.unlocks,
    });
  }
  map.chassis = MODULAR_CHASSIS.map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    patch: {
      template: c.template || 'rover',
      chassis: {
        shape: c.meshShape === 'round' || c.meshShape === 'hex' ? 'circular' : 'rectangular',
        material: 'plastic',
        size: c.scale >= 1.1 ? 'large' : c.scale <= 0.85 ? 'small' : 'medium',
      },
    },
  }));
  return map;
}

export function applyMovementFromRegistry(design, movementSlot) {
  if (!movementSlot) return design;
  const meta = getRegistryPart(movementSlot.category, movementSlot.partId);
  if (!meta?.wheelType) return design;
  return {
    ...design,
    wheels: {
      ...design.wheels,
      type: meta.wheelType,
      count: meta.wheelCount ?? (meta.wheelType === 'tracks' ? 2 : meta.wheelType === 'legs' ? 4 : 4),
      size: meta.wheelSize || design.wheels?.size || 'medium',
      motor: meta.motor || design.wheels?.motor,
    },
  };
}

export const ALL_SLOT_IDS = [
  'movement', 'head', 'front', 'left', 'right', 'back', 'top', 'addon_a', 'addon_b',
];

/** Sum statMods from every part mounted on assembly slots */
export function aggregatePartStatMods(slots = {}) {
  const totals = { speed: 0, power: 0, agility: 0, weight: 0, battery: 0, stability: 0 };
  for (const slot of Object.values(slots)) {
    if (!slot?.category || !slot?.partId) continue;
    const reg = getRegistryPart(slot.category, slot.partId);
    const mods = reg?.statMods;
    if (!mods) continue;
    for (const [key, val] of Object.entries(mods)) {
      if (typeof val === 'number' && key in totals) totals[key] += val;
    }
  }
  return totals;
}
