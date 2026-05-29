/**
 * Primary-school friendly part zones — maps to full modular registry.
 */
import { ACADEMY_PART_SECTIONS } from './academy-part-categories.js';

export const KID_PART_ZONES = [
  { id: 'body', label: 'Body', icon: '🚗', hint: 'Pick your robot shape', sectionId: 'chassis' },
  { id: 'go', label: 'Go', icon: '⚙️', hint: 'Wheels, tracks, legs, fly', sectionId: 'movement' },
  { id: 'see', label: 'See', icon: '👁', hint: 'Eyes, cameras, sensors', sectionIds: ['head', 'sensors', 'face'] },
  { id: 'grab', label: 'Grab', icon: '🦾', hint: 'Arms and tools', sectionIds: ['utility'] },
  { id: 'power', label: 'Power', icon: '🔋', hint: 'Batteries, AI brains, radio', sectionIds: ['power', 'ai', 'comms'] },
  { id: 'shield', label: 'Shield', icon: '🛡️', hint: 'Armor and strong frames', sectionIds: ['armor', 'structure'] },
  { id: 'lights', label: 'Lights', icon: '💡', hint: 'Headlights, neon, beacons', sectionIds: ['lighting'] },
  { id: 'style', label: 'Style', icon: '✨', hint: 'Decals, stripes, glow', sectionIds: ['cosmetic', 'decoration'] },
  { id: 'fun', label: 'Fun', icon: '🎉', hint: 'Foam, shields, LEGO blocks', sectionIds: ['fun'] },
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
