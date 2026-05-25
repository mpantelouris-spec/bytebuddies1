/** Modular robotics catalog — patches & coding unlocks (derived from registry) */
import { buildModulePartsMap, MODULAR_PARTS, getRegistryPart } from './modular-parts-registry.js';

export const MODULE_CATEGORIES = [
  { id: 'chassis', label: 'Chassis Systems', icon: '⬡', desc: 'Core body frame' },
  { id: 'movement', label: 'Movement', icon: '⚙', desc: 'Locomotion systems' },
  { id: 'sensors', label: 'Sensors', icon: '📡', desc: 'Robot intelligence' },
  { id: 'head', label: 'AI Head', icon: '👁', desc: 'Vision & AI modules' },
  { id: 'utility', label: 'Utility Tools', icon: '🦾', desc: 'Arms & attachments' },
  { id: 'power', label: 'Power Core', icon: '🔋', desc: 'Energy systems' },
  { id: 'ai', label: 'Computers', icon: '🧠', desc: 'AI & navigation' },
  { id: 'comms', label: 'Comms', icon: '📶', desc: 'Signal & broadcast' },
  { id: 'armor', label: 'Armor', icon: '🛡️', desc: 'Protection' },
  { id: 'structure', label: 'Structure', icon: '🔩', desc: 'Frames & joints' },
  { id: 'lighting', label: 'Lighting', icon: '💡', desc: 'Lights & beacons' },
  { id: 'cosmetic', label: 'Cosmetics', icon: '✨', desc: 'Visual upgrades' },
  { id: 'fun', label: 'Fun Modules', icon: '🎉', desc: 'Creative extras' },
  { id: 'face', label: 'Face Parts', icon: '😊', desc: 'Eyes, mouth, expression' },
  { id: 'decoration', label: 'Decoration', icon: '🎨', desc: 'Flags, fins, style' },
];

export const MODULE_PARTS = buildModulePartsMap();

export const ROBOT_COLORS = [
  { id: '#FFFFFF', label: 'Lab White' },
  { id: '#1E90FF', label: 'Bright Blue' },
  { id: '#FF8C00', label: 'Orange' },
  { id: '#00FF41', label: 'Lime' },
  { id: '#E8E8E8', label: 'Silver' },
  { id: '#00D9FF', label: 'Cyan Glow' },
  { id: '#0A0A1A', label: 'Deep Black' },
  { id: '#8B00FF', label: 'Glow Purple' },
  { id: '#FF006E', label: 'Magenta Neon' },
  { id: '#0066FF', label: 'Holographic Blue' },
  { id: '#fbbf24', label: 'Solar Gold' },
  { id: '#ef4444', label: 'Alert Red' },
  { id: '#1e293b', label: 'Stealth Black' },
  { id: '#64748b', label: 'Steel Gray' },
];

export function getPart(categoryId, partId) {
  return MODULE_PARTS[categoryId]?.find((p) => p.id === partId) || getRegistryPart(categoryId, partId);
}

export function getActivePartId(design, categoryId) {
  const mods = design.modules || {};
  if (mods[categoryId]) return mods[categoryId];
  if (categoryId === 'chassis') return design.template || 'rover';
  if (categoryId === 'movement') return design.wheels?.type || 'standard';
  return null;
}

export function applyModulePatch(design, categoryId, partId) {
  const part = getPart(categoryId, partId);
  if (!part) return design;
  const patch = part.patch || {};
  const next = { ...design, modules: { ...(design.modules || {}), [categoryId]: partId } };
  if (patch.template) next.template = patch.template;
  if (patch.chassis) next.chassis = { ...next.chassis, ...patch.chassis };
  if (patch.wheels) next.wheels = { ...next.wheels, ...patch.wheels };
  if (patch.sensors) next.sensors = { ...next.sensors, ...patch.sensors };
  if (patch.tools) next.tools = { ...next.tools, ...patch.tools };
  if (patch.abilities) next.abilities = { ...next.abilities, ...patch.abilities };
  if (patch.cosmetics) next.cosmetics = { ...next.cosmetics, ...patch.cosmetics };
  return next;
}

export function getUnlockedBlocks(design) {
  const blocks = new Set();
  const addFromPart = (p) => p?.unlocks?.forEach((b) => blocks.add(b));

  Object.entries(design.modules || {}).forEach(([, partId]) => {
    MODULAR_PARTS.filter((p) => p.id === partId).forEach(addFromPart);
  });

  MODULAR_PARTS.forEach((p) => {
    const patch = p.patch || {};
    if (patch.sensors) {
      const key = Object.keys(patch.sensors).find((k) => design.sensors?.[k]);
      if (key) addFromPart(p);
    }
    if (patch.tools) {
      const active = Object.entries(patch.tools).some(([k, v]) => v && design.tools?.[k]);
      if (active) addFromPart(p);
    }
  });

  if (design.cosmetics?.accentLights) blocks.add('lights_on');
  return [...blocks];
}
