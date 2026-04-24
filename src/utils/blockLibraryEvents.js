export const BB_ADD_SIDEBAR_BLOCK = 'bb-add-sidebar-block';

/** Mobile drawer asks the (still-mounted) Sidebar to open the extensions modal. */
export const BB_OPEN_EXTENSIONS = 'bb-open-extensions';

/** Fired after extension enable/disable is saved (Sidebar refreshes categories). */
export const BB_EXTENSIONS_CHANGED = 'bb-extensions-changed';

/** Click-to-add from sidebar / mobile drawer — canvas listeners append the block. */
export function emitAddSidebarBlock(name) {
  if (typeof window === 'undefined' || !name) return;
  window.dispatchEvent(new CustomEvent(BB_ADD_SIDEBAR_BLOCK, { detail: { name: String(name) } }));
}
