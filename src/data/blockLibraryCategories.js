import { getExtensionSidebarCategories, readEnabledExtensionIds } from './extensionsCatalog';

/** Core + extra categories: names, icons, colors, and palette block labels (unchanged strings where possible). */
export const blockCategories = [
  { name: 'Motion', icon: '🏃', color: '#4a9eff', blocks: ['move steps', 'turn degrees', 'glide to', 'go to x,y', 'set X to', 'set Y to', 'change X by', 'change Y by', 'point toward mouse', 'point in direction', 'bounce off edges', 'set speed'] },
  { name: 'Looks', icon: '👀', color: '#9b59b6', blocks: ['say', 'think', 'show / hide', 'switch costume', 'next costume', 'set size', 'grow by', 'shrink by', 'color effect', 'ghost effect', 'clear effects', 'go to front', 'go to back'] },
  { name: 'Sound', icon: '🔊', color: '#e91e8c', blocks: ['play sound', 'stop sounds', 'set volume', 'play note'] },
  { name: 'Events', icon: '⚡', color: '#f1c40f', blocks: ['on start', 'on key press', 'on click', 'on collision', 'on message', 'broadcast'] },
  { name: 'Control', icon: '🔧', color: '#ff7043', blocks: ['wait', 'stop all'] },
  { name: 'Loops', icon: '🔁', color: '#8d6e63', blocks: ['repeat N times', 'forever', 'while condition', 'for each in list', 'break / continue'] },
  { name: 'Logic', icon: '🧠', color: '#5c6bc0', blocks: ['if / else', 'and / or / not', 'compare (=, <, >)', 'true / false'] },
  { name: 'Sensing', icon: '🔍', color: '#00bcd4', blocks: ['touching edge?', 'touching sprite?', 'key pressed?', 'mouse X', 'mouse Y', 'distance to mouse', 'timer', 'reset timer'] },
  { name: 'Operators', icon: '➕', color: '#59c059', blocks: ['add / subtract', 'multiply / divide', 'random number', 'round / abs', 'compare (=, <, >)', 'and / or / not', 'modulo'] },
  { name: 'Variables', icon: '📦', color: '#ff9800', blocks: ['create variable', 'set variable', 'change by', 'show variable', 'create list', 'add to list', 'get item #'] },
  { name: 'Input/Output', icon: '💬', color: '#607d8b', blocks: ['print', 'ask and wait', 'alert'] },
  { name: 'Lists', icon: '📋', color: '#3498db', blocks: ['create list', 'add to list', 'get item #', 'length of list', 'sort list'] },
  { name: 'Text', icon: '📝', color: '#009688', blocks: ['create text', 'join text', 'length of', 'letter # of', 'contains'] },
  { name: 'My Blocks', icon: '🧩', color: '#ff6680', blocks: ['define my block', 'run my block', 'define function', 'call function', 'with parameters', 'return value'] },
  { name: 'Physics', icon: '💨', color: '#455a64', blocks: ['set velocity', 'set gravity', 'bounce off edges', 'jump', 'set friction', 'push'] },
  { name: 'Game', icon: '🎮', color: '#e74c3c', blocks: ['add to score', 'set score', 'lose a life', 'set lives', 'game over', 'you win', 'next level', 'spawn clone', 'destroy', 'pause game'] },
  { name: 'AI', icon: '🤖', color: '#7b1fa2', blocks: ['AI classify', 'AI generate text', 'AI detect object', 'AI translate', 'train model'] },
  { name: 'Image Classifier (ML)', icon: '🖼️', color: '#c084fc', blocks: ['AI classify', 'AI detect object', 'train model', 'AI translate'] },
  { name: 'Chat & prompts', icon: '✨', color: '#fb7185', blocks: ['AI generate text', 'ask and wait', 'print', 'alert'] },
  { name: 'Robot: line follower', icon: '🛤️', color: '#10b981', blocks: ['move steps', 'turn degrees', 'if / else', 'wait', 'touching edge?'] },
  { name: 'Music & notes', icon: '🎵', color: '#d946ef', blocks: ['play note', 'play sound', 'stop sounds', 'set volume'] },
];

export const workspaceBlockCategories = [
  { name: 'Motion', icon: '🏃', color: '#4a9eff', blocks: ['move steps', 'turn degrees', 'glide to', 'go to x,y', 'set X to', 'set Y to', 'change X by', 'change Y by', 'point toward mouse', 'point in direction', 'bounce off edges', 'set speed'] },
  { name: 'Looks', icon: '👀', color: '#9b59b6', blocks: ['say', 'think', 'show / hide', 'switch costume', 'next costume', 'set size', 'grow by', 'shrink by', 'color effect', 'ghost effect', 'clear effects', 'go to front', 'go to back'] },
  { name: 'Sound', icon: '🔊', color: '#e91e8c', blocks: ['play sound', 'stop sounds', 'set volume', 'play note'] },
  { name: 'Events', icon: '⚡', color: '#f1c40f', blocks: ['on start', 'on key press', 'on click', 'on collision', 'on message', 'broadcast'] },
  { name: 'Control', icon: '🔧', color: '#ff7043', blocks: ['wait', 'stop all'] },
  { name: 'Loops', icon: '🔁', color: '#8d6e63', blocks: ['repeat N times', 'forever', 'while condition', 'for each in list', 'break / continue'] },
  { name: 'Logic', icon: '🧠', color: '#5c6bc0', blocks: ['if / else', 'and / or / not', 'compare (=, <, >)', 'true / false'] },
  { name: 'Sensing', icon: '🔍', color: '#00bcd4', blocks: ['touching edge?', 'touching sprite?', 'key pressed?', 'mouse X', 'mouse Y', 'distance to mouse', 'timer', 'reset timer'] },
  { name: 'Operators', icon: '➕', color: '#59c059', blocks: ['add / subtract', 'multiply / divide', 'random number', 'round / abs', 'modulo'] },
  { name: 'Variables', icon: '📦', color: '#ff9800', blocks: ['create variable', 'set variable', 'change by', 'show variable'] },
  { name: 'Input/Output', icon: '💬', color: '#607d8b', blocks: ['print', 'ask and wait', 'alert'] },
  { name: 'Lists', icon: '📋', color: '#3498db', blocks: ['create list', 'add to list', 'get item #', 'length of list', 'sort list'] },
  { name: 'Text', icon: '📝', color: '#009688', blocks: ['create text', 'join text', 'length of', 'letter # of', 'contains'] },
  { name: 'My Blocks', icon: '🧩', color: '#ff6680', blocks: ['define my block', 'run my block', 'define function', 'call function', 'with parameters', 'return value'] },
  { name: 'Physics', icon: '💨', color: '#455a64', blocks: ['set velocity', 'set gravity', 'bounce off edges', 'jump', 'set friction', 'push'] },
  { name: 'Game', icon: '🎮', color: '#e74c3c', blocks: ['add to score', 'set score', 'lose a life', 'set lives', 'game over', 'you win', 'next level', 'spawn clone', 'destroy', 'pause game'] },
  { name: 'AI', icon: '🤖', color: '#7b1fa2', blocks: ['AI classify', 'AI generate text', 'AI detect object', 'AI translate', 'train model'] },
  { name: 'Image Classifier (ML)', icon: '🖼️', color: '#c084fc', blocks: ['AI classify', 'AI detect object', 'train model'] },
  { name: 'Chat & prompts', icon: '✨', color: '#fb7185', blocks: ['AI generate text', 'ask and wait', 'print'] },
  { name: 'Robot: line follower', icon: '🛤️', color: '#10b981', blocks: ['move steps', 'turn degrees', 'if / else', 'wait'] },
  { name: 'Music & notes', icon: '🎵', color: '#d946ef', blocks: ['play note', 'play sound', 'stop sounds', 'set volume'] },
];

export const starterCategories = [
  { name: 'Move', icon: '➡️', color: '#6366f1', blocks: ['move forward', 'move back', 'turn left', 'turn right'] },
  { name: 'Repeat', icon: '🔁', color: '#8b5cf6', blocks: ['repeat 2 times', 'repeat 3 times', 'repeat 5 times', 'repeat 10 times'] },
  { name: 'Look', icon: '👁️', color: '#06b6d4', blocks: ['show', 'hide', 'say hello', 'say goodbye'] },
  { name: 'Sound', icon: '🔊', color: '#10b981', blocks: ['play sound', 'celebrate', 'play note', 'stop sounds'] },
];

export const gameAssets = [
  { category: 'Characters', items: ['🧑‍🚀 Astronaut', '🦊 Fox', '🤖 Robot', '🧙 Wizard', '🦸 Hero', '👾 Alien'] },
  { category: 'Objects', items: ['⭐ Star', '💎 Gem', '🗝️ Key', '🎁 Gift', '💣 Bomb', '🏆 Trophy'] },
  { category: 'Backgrounds', items: ['🌌 Space', '🏔️ Mountains', '🌊 Ocean', '🏙️ City', '🌲 Forest', '🏜️ Desert'] },
  { category: 'Sounds', items: ['🔔 Bell', '💥 Explosion', '🎵 Music', '👏 Clap', '🎮 Game Over', '✨ Magic'] },
];

/**
 * Same category list as the Block Library sidebar (desktop + mobile drawer).
 * Extension categories are appended only when their title is not already in the base list (avoids duplicates).
 */
export function buildLibraryCategories({ currentPage, isStarter, enabledExtensionIds }) {
  const extensionCategories = isStarter ? [] : getExtensionSidebarCategories(enabledExtensionIds);

  let baseCategories;
  if (currentPage === 'gamebuilder') {
    baseCategories = [...blockCategories, ...gameAssets.map((a) => ({ name: a.category, icon: '🎨', color: '#f59e0b', blocks: a.items }))];
  } else if (isStarter) {
    return starterCategories;
  } else if (currentPage === 'workspace') {
    baseCategories = workspaceBlockCategories;
  } else {
    baseCategories = blockCategories;
  }

  if (isStarter) return baseCategories;

  const baseNames = new Set(baseCategories.map((c) => c.name));
  const dedupedExtensions = extensionCategories.filter((c) => !baseNames.has(c.name));
  return [...baseCategories, ...dedupedExtensions];
}

/** Category colour for a palette label (Blockly stubs). Scans workspace, game builder, and robot palettes. */
export function getCategoryColorForBlockLabel(label) {
  const k = String(label || '').trim().toLowerCase();
  if (!k) return '#5b5b8c';
  const enabledExtensionIds = readEnabledExtensionIds();
  for (const currentPage of ['workspace', 'gamebuilder', 'robot']) {
    const cats = buildLibraryCategories({
      currentPage,
      isStarter: false,
      enabledExtensionIds,
    });
    for (const cat of cats) {
      if ((cat.blocks || []).some((b) => String(b).trim().toLowerCase() === k)) return cat.color || '#5b5b8c';
    }
  }
  return '#5b5b8c';
}
