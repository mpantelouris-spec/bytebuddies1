/** Security Bot — 10 optimistic kid-friendly worlds (canonical names for UI + 3D). */
export const SECURITY_BOT_ARENAS = {
  1: { id: 'neo_city_central', title: 'Neo City Central', emoji: '🏙️', landmark: 'ByteBuddies HQ' },
  2: { id: 'international_airport', title: 'International Airport', emoji: '✈️', landmark: 'Control Tower' },
  3: { id: 'national_museum', title: 'National Museum', emoji: '🏛️', landmark: 'Dinosaur Hall' },
  4: { id: 'airport_gates', title: 'Airport Security Gates', emoji: '🛂', landmark: 'Departure Hall' },
  5: { id: 'robotics_lab', title: 'Secret Robotics Lab', emoji: '🔬', landmark: 'AI Core' },
  6: { id: 'grand_stadium', title: 'Grand Sports Stadium', emoji: '🏟️', landmark: 'Main Stand' },
  7: { id: 'music_festival', title: 'Music Festival', emoji: '🎪', landmark: 'Main Stage' },
  8: { id: 'luxury_mall', title: 'Luxury Shopping District', emoji: '🛍️', landmark: 'Glass Skylight' },
  9: { id: 'robotics_vault', title: 'Secret Robotics Vault', emoji: '🔐', landmark: 'Prototype Vault' },
  10: { id: 'emergency_centre', title: 'Smart City Emergency Centre', emoji: '🚨', landmark: 'Command Wall' },
};

export function getSecurityBotArena(modeIndex = 1) {
  const mode = Math.max(1, Math.min(10, Number(modeIndex) || 1));
  return SECURITY_BOT_ARENAS[mode] || SECURITY_BOT_ARENAS[1];
}

export function applySecurityBotArenaMeta(mode) {
  if (!mode || mode.chassisId !== 'securitybot') return mode;
  const arena = getSecurityBotArena(mode.modeIndex || mode.modeNumber || 1);
  return {
    ...mode,
    environmentId: arena.id,
    environmentName: arena.title,
    environmentEmoji: arena.emoji,
  };
}
