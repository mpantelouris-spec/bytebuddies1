/**
 * Primary-school friendly part zones — maps to full modular registry.
 */
import { ACADEMY_PART_SECTIONS } from './academy-part-categories.js';

export const KID_PART_ZONES = [
  { id: 'body', label: 'Body', icon: '🚗', hint: 'Pick your robot shape', sectionId: 'chassis' },
  { id: 'go', label: 'Go', icon: '⚙️', hint: 'Wheels, tracks, legs, fly', sectionId: 'movement' },
  { id: 'see', label: 'See', icon: '👁', hint: 'Eyes, cameras, sensors', sectionIds: ['head', 'sensors'] },
  { id: 'grab', label: 'Grab', icon: '🦾', hint: 'Arms and tools', sectionIds: ['utility', 'structure'] },
  { id: 'power', label: 'Power', icon: '🔋', hint: 'Batteries and energy', sectionIds: ['power', 'comms'] },
  { id: 'fun', label: 'Fun', icon: '🎉', hint: 'Lights and silly stuff', sectionIds: ['fun', 'lighting', 'cosmetic', 'face'] },
];

export function getZoneItems(zoneId) {
  const zone = KID_PART_ZONES.find((z) => z.id === zoneId);
  if (!zone) return [];
  if (zone.sectionId) {
    const sec = ACADEMY_PART_SECTIONS.find((s) => s.id === zone.sectionId);
    return sec?.items || [];
  }
  const ids = zone.sectionIds || [];
  return ACADEMY_PART_SECTIONS.filter((s) => ids.includes(s.id)).flatMap((s) => s.items || []);
}
