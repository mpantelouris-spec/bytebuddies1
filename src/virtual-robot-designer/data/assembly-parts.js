import { MODULAR_CHASSIS, MODULAR_WORKSHOP_PARTS, getRegistryPart } from './modular-parts-registry.js';

/** Snap points — modular mount nodes on the robot body */
export const SNAP_SLOTS = {
  movement: { label: 'Movement', icon: '⚙', accepts: ['movement'], required: false },
  head: { label: 'Head', icon: '👁', accepts: ['head', 'sensors', 'ai', 'face'] },
  front: { label: 'Front', icon: '🔧', accepts: ['utility', 'sensors', 'structure', 'armor'] },
  left: { label: 'Left Arm', icon: '🦾', accepts: ['utility', 'fun', 'armor', 'structure'] },
  right: { label: 'Right Arm', icon: '🦾', accepts: ['utility', 'fun', 'armor', 'structure'] },
  back: { label: 'Back', icon: '🔋', accepts: ['power', 'comms', 'armor', 'structure'] },
  top: { label: 'Top', icon: '📡', accepts: ['comms', 'sensors', 'head', 'ai', 'armor', 'lighting'] },
  addon_a: { label: 'Side L', icon: '➕', accepts: ['cosmetic', 'fun', 'comms', 'sensors', 'armor', 'structure', 'lighting', 'decoration', 'face'] },
  addon_b: { label: 'Side R', icon: '➕', accepts: ['cosmetic', 'fun', 'comms', 'sensors', 'armor', 'structure', 'lighting', 'decoration', 'face'] },
};

export const CHASSIS_TYPES = MODULAR_CHASSIS.map((c) => ({
  id: c.id,
  label: c.label,
  icon: c.icon,
  meshShape: c.meshShape,
  width: c.width,
  height: c.height,
  depth: c.depth,
  scale: c.scale,
}));

export const BASE_SHAPES = CHASSIS_TYPES.map(({ id, label, icon, meshShape }) => ({
  id: meshShape === 'arm' ? 'arm' : meshShape,
  chassisType: id,
  label,
  icon,
}));

export const BASE_MATERIALS = [
  { id: 'matte_steel', label: 'Matte Steel', metalness: 0.75, roughness: 0.55 },
  { id: 'aluminum', label: 'Polished Aluminum', metalness: 0.92, roughness: 0.18 },
  { id: 'carbon', label: 'Carbon Fiber', metalness: 0.78, roughness: 0.22 },
  { id: 'titanium', label: 'Titanium', metalness: 0.88, roughness: 0.28 },
  { id: 'neon_plastic', label: 'Neon Plastic', metalness: 0.25, roughness: 0.42 },
  { id: 'exotic', label: 'Exotic Metal', metalness: 0.95, roughness: 0.12 },
  { id: 'industrial', label: 'Lab White', metalness: 0.12, roughness: 0.45 },
  { id: 'metal', label: 'Metal', metalness: 0.85, roughness: 0.25 },
  { id: 'plastic', label: 'Plastic', metalness: 0.2, roughness: 0.6 },
];

export const WORKSHOP_PARTS = MODULAR_WORKSHOP_PARTS;

export const WORKSHOP_CATEGORIES = [
  { id: 'movement', label: 'Move', icon: '⚙' },
  { id: 'head', label: 'Head', icon: '👁' },
  { id: 'sensors', label: 'Sense', icon: '📡' },
  { id: 'utility', label: 'Tools', icon: '🦾' },
  { id: 'power', label: 'Power', icon: '🔋' },
  { id: 'ai', label: 'AI', icon: '🧠' },
  { id: 'comms', label: 'Comms', icon: '📶' },
  { id: 'armor', label: 'Armor', icon: '🛡' },
  { id: 'structure', label: 'Frame', icon: '🔩' },
  { id: 'lighting', label: 'Lights', icon: '💡' },
  { id: 'cosmetic', label: 'Style', icon: '✨' },
  { id: 'fun', label: 'Fun', icon: '🎉' },
  { id: 'face', label: 'Face', icon: '😊' },
  { id: 'decoration', label: 'Deco', icon: '🎨' },
];

export function getWorkshopPart(category, partId) {
  return getRegistryPart(category, partId) || WORKSHOP_PARTS.find((p) => p.category === category && p.id === partId);
}

export function getSlotPosition(slotId, base) {
  const w = (base.width ?? 1) * (base.scale ?? 1);
  const h = (base.height ?? 0.6) * (base.scale ?? 1);
  const d = (base.depth ?? 1.2) * (base.scale ?? 1);
  const map = {
    movement: [0, -h * 0.55, 0],
    head: [0, h * 0.65, d * 0.35],
    front: [0, h * 0.05, d * 0.58],
    left: [-w * 0.62, h * 0.15, 0],
    right: [w * 0.62, h * 0.15, 0],
    back: [0, h * 0.25, -d * 0.52],
    top: [0, h * 0.72, 0],
    addon_a: [-w * 0.4, h * 0.45, d * 0.35],
    addon_b: [w * 0.4, h * 0.45, -d * 0.25],
  };
  return map[slotId] || [0, 0, 0];
}

export function slotAcceptsPart(slotId, category) {
  const slot = SNAP_SLOTS[slotId];
  if (!slot) return false;
  if (slot.accepts.includes('*')) return true;
  return slot.accepts.includes(category);
}

const EMPTY_SLOTS = {
  movement: null,
  head: null,
  front: null,
  left: null,
  right: null,
  back: null,
  top: null,
  addon_a: null,
  addon_b: null,
};

const DEFAULT_SLOT_TRANSFORMS = Object.fromEntries(
  Object.keys(EMPTY_SLOTS).map((k) => [k, { rotY: 0, scale: 1 }]),
);

export const DEFAULT_ASSEMBLY = {
  mode: 'custom',
  buildMode: 'advanced',
  visualMode: 'realistic',
  base: {
    chassisType: 'cube',
    shape: 'box',
    width: 1,
    height: 0.62,
    depth: 1,
    scale: 1,
    color: '#FFFFFF',
    material: 'industrial',
  },
  slots: { ...EMPTY_SLOTS },
  slotTransforms: { ...DEFAULT_SLOT_TRANSFORMS },
  blocks: [],
};
