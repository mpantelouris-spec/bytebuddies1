/** Full modular library sections for the engineering panel */
import { MODULAR_CHASSIS, MODULAR_PARTS, REGISTRY_CATEGORIES } from './modular-parts-registry.js';

export const ACADEMY_PART_SECTIONS = REGISTRY_CATEGORIES.map((cat) => {
  if (cat.id === 'chassis') {
    return {
      id: 'chassis',
      label: cat.label,
      icon: cat.icon,
      type: 'chassis',
      items: MODULAR_CHASSIS.map((c) => ({
        id: c.id,
        label: c.label,
        icon: c.icon,
        chassis: {
          id: c.id,
          label: c.label,
          icon: c.icon,
          meshShape: c.meshShape,
          width: c.width,
          height: c.height,
          depth: c.depth,
          scale: c.scale,
        },
      })),
    };
  }
  return {
    id: cat.id,
    label: cat.label,
    icon: cat.icon,
    categories: [cat.id],
    items: MODULAR_PARTS.filter((p) => p.category === cat.id).map((p) => ({
      category: p.category,
      id: p.id,
      label: p.label,
      icon: p.icon,
    })),
  };
});

export const BRIGHT_ROBOT_COLORS = [
  { id: '#FFFFFF', label: 'White' },
  { id: '#1E90FF', label: 'Bright Blue' },
  { id: '#FF8C00', label: 'Orange' },
  { id: '#00FF41', label: 'Lime' },
  { id: '#E8E8E8', label: 'Silver' },
  { id: '#00D9FF', label: 'Cyan Glow' },
  { id: '#8B00FF', label: 'Purple' },
  { id: '#ef4444', label: 'Red' },
  { id: '#1e293b', label: 'Stealth' },
  { id: '#fbbf24', label: 'Gold' },
];
