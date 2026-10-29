import { SOUND_BLOCKLY_DROPDOWN } from './soundOptions';
import { BACKDROP_BLOCKLY_DROPDOWN } from './stageLookOptions';

let costumeMenu = [['costume1', 'costume1']];
let soundMenu = SOUND_BLOCKLY_DROPDOWN;

function pairsFromNames(names, fallback) {
  const cleaned = (names || []).map((n) => String(n || '').trim()).filter(Boolean);
  if (!cleaned.length) return fallback;
  const seen = new Set();
  const out = [];
  for (const n of cleaned) {
    const k = n.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push([n, n]);
  }
  return out.length ? out : fallback;
}

export function setLiveCostumeNames(names) {
  costumeMenu = pairsFromNames(names, [['costume1', 'costume1']]);
}

export function setLiveSoundNames(names) {
  soundMenu = pairsFromNames(names, SOUND_BLOCKLY_DROPDOWN);
}

export function liveCostumeMenu() {
  return costumeMenu;
}

export function liveSoundMenu() {
  return soundMenu;
}

/* Sprite names for "touching", "go to", "point towards", "distance to", "of" and clone menus. */
let spriteNames = ['Sprite1'];
export function setLiveSpriteNames(names) {
  const list = pairsFromNames(names, []).map(([n]) => n);
  spriteNames = list.length ? list : ['Sprite1'];
}
export function liveSpriteNames() {
  return spriteNames;
}
/** Menu = fixed choices first (mouse, edge…), then every sprite in the project. */
export function liveSpriteMenu(fixed = [], { exclude = [] } = {}) {
  const skip = new Set(exclude.map((n) => String(n).toLowerCase()));
  return [...fixed, ...spriteNames.filter((n) => !skip.has(n.toLowerCase())).map((n) => [n, n])];
}

/* Backdrop menus: the project's own backdrops first (like PictoBlox), then the
   rest of the library so blocks saved with any backdrop name still load. */
let projectBackdrops = [];
export function setLiveBackdropNames(names) {
  projectBackdrops = pairsFromNames(names, []);
}
export function liveBackdropMenu() {
  const seen = new Set(projectBackdrops.map(([n]) => n.toLowerCase()));
  const rest = BACKDROP_BLOCKLY_DROPDOWN.filter(([, v]) => !seen.has(String(v).toLowerCase()));
  return [...projectBackdrops, ...rest];
}
