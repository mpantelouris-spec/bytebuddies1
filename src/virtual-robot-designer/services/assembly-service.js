import { migrateDesign } from '../config.js';
import { applyModulePatch } from '../data/robot-catalog.js';
import { applyMovementFromRegistry } from '../data/modular-parts-registry.js';
import { DEFAULT_ASSEMBLY, SNAP_SLOTS, getWorkshopPart, slotAcceptsPart } from '../data/assembly-parts.js';

export { DEFAULT_ASSEMBLY };

export function migrateAssembly(design) {
  const d = migrateDesign(design);
  const slotTransforms = {
    ...DEFAULT_ASSEMBLY.slotTransforms,
    ...d.assembly?.slotTransforms,
  };
  return {
    ...DEFAULT_ASSEMBLY,
    ...d.assembly,
    base: { ...DEFAULT_ASSEMBLY.base, ...d.assembly?.base },
    slots: { ...DEFAULT_ASSEMBLY.slots, ...d.assembly?.slots },
    slotTransforms,
    blocks: [...(d.assembly?.blocks || DEFAULT_ASSEMBLY.blocks)],
  };
}

export function updateSlotTransform(design, slotId, patch) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const prev = asm.slotTransforms?.[slotId] || { rotY: 0, scale: 1 };
  const nextTransforms = {
    ...asm.slotTransforms,
    [slotId]: { ...prev, ...patch },
  };
  return migrateDesign({
    ...d,
    assembly: { ...asm, slotTransforms: nextTransforms },
  });
}

export function setVisualMode(design, mode) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  return migrateDesign({
    ...d,
    assembly: { ...asm, visualMode: mode === 'lego' ? 'lego' : 'realistic' },
  });
}

/** Place a part on a snap slot — returns updated design (unchanged if invalid) */
export function placePartOnSlot(design, slotId, category, partId) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  if (!SNAP_SLOTS[slotId]) return d;
  if (!slotAcceptsPart(slotId, category)) return d;
  if (!getWorkshopPart(category, partId)) return d;

  const nextSlots = { ...asm.slots, [slotId]: { category, partId } };
  const next = syncSlotsToDesign(
    { ...d, assembly: { ...asm, mode: 'custom', slots: nextSlots } },
    nextSlots,
  );
  next.assembly = { ...asm, mode: 'custom', slots: nextSlots };
  return migrateDesign(next);
}

export function removePartFromSlot(design, slotId) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const nextSlots = { ...asm.slots, [slotId]: null };
  const next = syncSlotsToDesign({ ...d, assembly: { ...asm, slots: nextSlots } }, nextSlots);
  next.assembly = { ...asm, slots: nextSlots };
  return migrateDesign(next);
}

export function updateAssemblyBase(design, basePatch) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const base = { ...asm.base, ...basePatch };
  const next = {
    ...d,
    template: 'blank',
    assembly: { ...asm, mode: 'custom', base },
    chassis: {
      ...d.chassis,
      color: base.color ?? d.chassis.color,
      size: base.scale >= 1.2 ? 'large' : base.scale <= 0.85 ? 'small' : 'medium',
      material: base.material ?? d.chassis.material,
      shape: base.shape === 'round' ? 'circular' : base.shape === 'hex' ? 'circular' : 'rectangular',
    },
  };
  return migrateDesign(next);
}

function syncSlotsToDesign(design, slots) {
  let d = migrateDesign(design);
  d.template = 'blank';

  // Reset modular fields then rebuild from slots
  d.sensors = Object.fromEntries(Object.keys(d.sensors).map((k) => [k, false]));
  d.tools = { ...d.tools, pincer: false, gripper: false, bulldozer: false, magnet: false, drill: false, vacuum: false, laser: false, flamethrower: false, longArm: false, ballLauncher: false, dart: false, water: false };
  d.abilities = Object.fromEntries(Object.keys(d.abilities).map((k) => [k, false]));
  d.modules = {};
  d.wheels = { ...d.wheels, type: 'standard', count: 4 };

  Object.values(slots).forEach((placed) => {
    if (!placed) return;
    d = applyModulePatch(d, placed.category, placed.partId);
  });

  return applyMovementFromRegistry(d, slots.movement);
}

/** Keep sensors/tools/modules in sync with assembly slots only */
export function syncDesignFromAssembly(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  if (asm.mode !== 'custom') return d;
  const synced = syncSlotsToDesign({ ...d, assembly: { ...asm, mode: 'custom' } }, asm.slots);
  synced.assembly = { ...asm, mode: 'custom' };
  return migrateDesign(synced);
}

export function listPlacedParts(assembly) {
  const asm = assembly || DEFAULT_ASSEMBLY;
  return Object.entries(asm.slots || {})
    .filter(([, v]) => v)
    .map(([slotId, part]) => ({
      slotId,
      slotLabel: SNAP_SLOTS[slotId]?.label || slotId,
      ...part,
      partMeta: getWorkshopPart(part.category, part.partId),
    }));
}

export function countPlacedParts(assembly) {
  return listPlacedParts(assembly).length;
}

export function clearAllParts(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const emptySlots = Object.fromEntries(Object.keys(asm.slots).map((k) => [k, null]));
  const next = syncSlotsToDesign({ ...d, assembly: { ...asm, slots: emptySlots } }, emptySlots);
  next.assembly = { ...asm, mode: 'custom', slots: emptySlots };
  return migrateDesign(next);
}
