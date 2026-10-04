/**
 * TrackThemes.js — one look per kart world, shared by the road surface,
 * roadside and landmark kits so every piece of a track agrees.
 *
 * surface: road texture painter in RoadSurfaceKit
 * fence:   'rail' metal guard rail | 'plank' wooden rail | 'stone' balustrade | 'glow' lit barrier
 * kerbs:   red/white kerbs only suit tarmac circuits
 * accent:  chevron boost-sign colour
 */
export const TRACK_THEMES = [
  {
    id: 'city', match: /neon|metro|cyber|city|boulevard/,
    surface: 'asphalt', kerbs: true, centreLine: false,
    verge: 0x6a7288, fence: 'rail', post: 0xaab4c8, rail: 0xdfe6f2, glow: 0x3fa7ff, accent: '#3fa7ff',
  },
  {
    id: 'beach', match: /sunset|cove|beach|tropic/,
    surface: 'boardwalk', kerbs: false, centreLine: false,
    verge: 0xf0d9a0, fence: 'plank', post: 0x8a5a2a, rail: 0xb8844a, accent: '#ffb020',
  },
  {
    id: 'canyon', match: /dry_dry|desert|dune|canyon/,
    surface: 'dirt', kerbs: false, centreLine: false,
    verge: 0xd08a50, fence: 'plank', post: 0x6e4a2a, rail: 0x9a6a3a, accent: '#ffb020',
  },
  {
    id: 'snow', match: /frost|glacial|snow|ice_/,
    surface: 'snow', kerbs: false, centreLine: false,
    verge: 0xf2f7ff, fence: 'plank', post: 0x5a3f2a, rail: 0x7a553a, accent: '#6a5cff',
  },
  {
    id: 'volcano', match: /lava|volcano|foundry|thunder/,
    surface: 'lava', kerbs: false, centreLine: false,
    verge: 0x2e2626, fence: 'plank', post: 0x3a2a22, rail: 0x5a3a26, glow: 0xff7a1a, accent: '#ffb020',
  },
  {
    id: 'forest', match: /fairy|forest|glen|magic|maze/,
    surface: 'forest', kerbs: false, centreLine: false,
    verge: 0x5cb84a, fence: 'plank', post: 0x7a5230, rail: 0x9a6a3a, accent: '#ffb020',
  },
  {
    id: 'space', match: /star|space|station|galaxy|moon/,
    surface: 'metal', kerbs: false, centreLine: false,
    verge: 0x4a5270, fence: 'glow', post: 0xc8d2e0, rail: 0xe8eef8, glow: 0x5ee0ff, accent: '#3fa7ff',
  },
  {
    id: 'sky', match: /cloud|sky|citadel|island/,
    surface: 'stone', kerbs: false, centreLine: false,
    verge: 0x6fd26a, fence: 'glow', post: 0xf4f4f4, rail: 0xffffff, glow: 0x4ab8ff, accent: '#3fa7ff',
  },
  {
    id: 'reef', match: /underwater|coral|reef/,
    surface: 'glass', kerbs: false, centreLine: false,
    verge: 0xe8d8a8, fence: 'glow', post: 0x9ad8ff, rail: 0xc8f0ff, glow: 0x2fe0ff, accent: '#3fa7ff',
  },
  {
    id: 'castle', match: /jungle|ruins|castle|kingdom|temple/,
    surface: 'cobble', kerbs: false, centreLine: false,
    verge: 0x6fbf5a, fence: 'stone', post: 0xc8bca4, rail: 0xd8cdb4, accent: '#ffd23f',
  },
];

export const DEFAULT_THEME = TRACK_THEMES[0];

export function trackThemeFor(arenaType = '') {
  return TRACK_THEMES.find((t) => t.match.test(arenaType)) || DEFAULT_THEME;
}
