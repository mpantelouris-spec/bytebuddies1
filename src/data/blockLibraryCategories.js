import { getExtensionSidebarCategories, readEnabledExtensionIds } from './extensionsCatalog';
import AppMode from '../utils/AppMode';

/** Core + extra categories: names, icons, colors, and palette block labels (unchanged strings where possible). */
export const blockCategories = [
  { name: 'Motion', icon: '🏃', color: '#4a9eff', blocks: ['move steps', 'turn clockwise degrees', 'turn anticlockwise degrees', 'go to random position', 'go to mouse-pointer', 'go to', 'go to x,y', 'glide secs to random position', 'glide secs to', 'glide secs to x,y', 'point in direction', 'point towards', 'change x by', 'set x to', 'change y by', 'set y to', 'if on edge, bounce', 'set rotation style', 'x position', 'y position', 'direction'] },
  { name: 'Looks', icon: '👀', color: '#9b59b6', blocks: ['say for seconds', 'say', 'think for seconds', 'think', 'switch costume to', 'next costume', 'switch backdrop to', 'next backdrop', 'change color effect by', 'set color effect to', 'clear graphic effects', 'change size by', 'set size to', 'show', 'hide', 'go to front layer', 'go to back layer', 'go forward layers', 'costume number', 'backdrop number', 'size'] },
  { name: 'Sound', icon: '🔊', color: '#e91e8c', blocks: ['start sound', 'play sound until done', 'stop all sounds', 'change pitch effect by', 'set pitch effect to', 'clear sound effects', 'set volume to', 'volume'] },
  { name: 'Events', icon: '⚡', color: '#f1c40f', blocks: ['when green flag clicked', 'when key pressed', 'when this sprite clicked', 'when backdrop switches to', 'when greater than', 'when I receive message', 'broadcast', 'broadcast and wait'] },
  { name: 'Control', icon: '🔧', color: '#ff7043', blocks: ['wait seconds', 'repeat', 'forever', 'if then', 'if then else', 'wait until', 'repeat until', 'stop', 'when I start as a clone', 'create clone of', 'delete this clone'] },
  { name: 'Sensing', icon: '🔍', color: '#00bcd4', blocks: ['touching', 'touching color', 'color is touching', 'distance to', 'ask and wait', 'answer', 'key pressed', 'mouse down', 'mouse x', 'mouse y', 'set drag mode', 'loudness', 'timer', 'reset timer', 'current year', 'days since 2000', 'username'] },
  { name: 'Operators', icon: '➕', color: '#59c059', blocks: ['add', 'subtract', 'multiply', 'divide', 'pick random to', 'greater than', 'less than', 'equals', 'and', 'or', 'not', 'join', 'letter of', 'length of', 'contains', 'mod', 'round', 'math operation of'] },
  { name: 'Variables', icon: '📦', color: '#ff9800', blocks: ['set variable to', 'change variable by', 'show variable', 'hide variable'] },
  { name: 'Lists', icon: '📋', color: '#3498db', blocks: ['add to list', 'delete of list', 'delete all of list', 'insert at of list', 'replace item of list with', 'item of list', 'item # of in list', 'length of list', 'list contains', 'show list', 'hide list'] },
  { name: 'Text', icon: '📝', color: '#009688', blocks: ['letter of', 'length of', 'contains'] },
  { name: 'My Blocks', icon: '🧩', color: '#ff6680', blocks: ['define', 'run custom block'] },
];

export const workspaceBlockCategories = [
  { name: 'Motion', icon: '🏃', color: '#4a9eff', blocks: ['move steps', 'turn clockwise degrees', 'turn anticlockwise degrees', 'go to random position', 'go to mouse-pointer', 'go to', 'go to x,y', 'glide secs to random position', 'glide secs to', 'glide secs to x,y', 'point in direction', 'point towards', 'change x by', 'set x to', 'change y by', 'set y to', 'if on edge, bounce', 'set rotation style', 'x position', 'y position', 'direction'] },
  { name: 'Looks', icon: '👀', color: '#9b59b6', blocks: ['say for seconds', 'say', 'think for seconds', 'think', 'switch costume to', 'next costume', 'switch backdrop to', 'next backdrop', 'change color effect by', 'set color effect to', 'clear graphic effects', 'change size by', 'set size to', 'show', 'hide', 'go to front layer', 'go to back layer', 'go forward layers', 'costume number', 'backdrop number', 'size'] },
  { name: 'Sound', icon: '🔊', color: '#e91e8c', blocks: ['start sound', 'play sound until done', 'stop all sounds', 'change pitch effect by', 'set pitch effect to', 'clear sound effects', 'set volume to', 'volume'] },
  { name: 'Events', icon: '⚡', color: '#f1c40f', blocks: ['when green flag clicked', 'when key pressed', 'when this sprite clicked', 'when backdrop switches to', 'when greater than', 'when I receive message', 'broadcast', 'broadcast and wait'] },
  { name: 'Control', icon: '🔧', color: '#ff7043', blocks: ['wait seconds', 'repeat', 'forever', 'if then', 'if then else', 'wait until', 'repeat until', 'stop', 'when I start as a clone', 'create clone of', 'delete this clone'] },
  { name: 'Sensing', icon: '🔍', color: '#00bcd4', blocks: ['touching', 'touching color', 'color is touching', 'distance to', 'ask and wait', 'answer', 'key pressed', 'mouse down', 'mouse x', 'mouse y', 'set drag mode', 'loudness', 'timer', 'reset timer', 'current year', 'days since 2000', 'username'] },
  { name: 'Operators', icon: '➕', color: '#59c059', blocks: ['add', 'subtract', 'multiply', 'divide', 'pick random to', 'greater than', 'less than', 'equals', 'and', 'or', 'not', 'join', 'letter of', 'length of', 'contains', 'mod', 'round', 'math operation of'] },
  { name: 'Variables', icon: '📦', color: '#ff9800', blocks: ['set variable to', 'change variable by', 'show variable', 'hide variable'] },
  { name: 'Lists', icon: '📋', color: '#3498db', blocks: ['add to list', 'delete of list', 'delete all of list', 'insert at of list', 'replace item of list with', 'item of list', 'item # of in list', 'length of list', 'list contains', 'show list', 'hide list'] },
  { name: 'Text', icon: '📝', color: '#009688', blocks: ['letter of', 'length of', 'contains'] },
  { name: 'My Blocks', icon: '🧩', color: '#ff6680', blocks: ['define', 'run custom block'] },
];

export const starterCategories = [
  { name: 'Move', icon: '➡️', color: '#6366f1', blocks: ['move forward', 'move back', 'turn left', 'turn right'] },
  { name: 'Repeat', icon: '🔁', color: '#8b5cf6', blocks: ['repeat 2 times', 'repeat 3 times', 'repeat 5 times', 'repeat 10 times'] },
  { name: 'Look', icon: '👁️', color: '#06b6d4', blocks: ['show', 'hide', 'say hello', 'say goodbye'] },
  { name: 'Sound', icon: '🔊', color: '#10b981', blocks: ['celebrate', 'play note', 'stop sounds'] },
];

export const gameAssets = [
  { category: 'Characters', items: ['🧑‍🚀 Astronaut', '🦊 Fox', '🤖 Robot', '🧙 Wizard', '🦸 Hero', '👾 Alien'] },
  { category: 'Objects', items: ['⭐ Star', '💎 Gem', '🗝️ Key', '🎁 Gift', '💣 Bomb', '🏆 Trophy'] },
  { category: 'Backgrounds', items: ['🌌 Space', '🏔️ Mountains', '🌊 Ocean', '🏙️ City', '🌲 Forest', '🏜️ Desert'] },
  { category: 'Sounds', items: ['🔔 Bell', '💥 Explosion', '🎵 Music', '👏 Clap', '🎮 Game Over', '✨ Magic'] },
];

/** Game Builder sprite/sound palette rows (not Blockly blocks). */
export const GAME_ASSET_CATEGORY_NAMES = new Set(gameAssets.map((a) => a.category));

/**
 * Same category list as the Block Library sidebar (desktop + mobile drawer).
 * Extension categories are appended only when their title is not already in the base list (avoids duplicates).
 *
 * SCOPE GUARD: Blocks are ONLY available in Game Builder mode.
 * All other modes return empty array to disable block UI.
 */
export function buildLibraryCategories({ currentPage, isStarter, enabledExtensionIds }) {
  // Mode guard: Only Game Builder and Workspace can have blocks
  // All other modes get no blocks
  const allowedBlockModes = ['gamebuilder', 'workspace'];
  const pageStr = String(currentPage || '').toLowerCase();

  if (!allowedBlockModes.includes(pageStr)) {
    // Not an allowed mode for blocks - return empty
    return [];
  }

  const extensionCategories = isStarter ? [] : getExtensionSidebarCategories(enabledExtensionIds);

  let baseCategories;
  if (currentPage === 'gamebuilder') {
    // Coding blocks only — sprites/backgrounds are added from the stage sprite library, not this sidebar.
    baseCategories = [...blockCategories];
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
