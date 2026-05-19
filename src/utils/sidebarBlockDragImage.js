/**
 * Drag ghost for sidebar Blockly previews — clone the rendered preview (keeps number fields, colours).
 */

function setEmptyDragImage(dragEvent) {
  const ghost = document.createElement('div');
  ghost.style.cssText = 'width:1px;height:1px;position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;';
  document.body.appendChild(ghost);
  dragEvent.dataTransfer.setDragImage(ghost, 0, 0);
  requestAnimationFrame(() => ghost.remove());
}

function cleanPreviewClone(root) {
  root.querySelectorAll('.blocklyMainBackground').forEach((el) => el.remove());
  root.querySelectorAll('.blocklyScrollbarVertical, .blocklyScrollbarHorizontal, .blocklyMainWorkspaceScrollbar').forEach((el) => {
    el.remove();
  });
  const svg = root.querySelector('.blocklySvg');
  if (svg) {
    svg.style.background = 'transparent';
    svg.style.overflow = 'visible';
  }
  root.style.background = 'transparent';
  root.style.border = 'none';
  root.style.boxShadow = 'none';
  root.style.pointerEvents = 'none';
}

/**
 * @param {DragEvent} dragEvent
 * @param {HTMLElement} [dragRoot]
 */
export function setSidebarBlockDragImage(dragEvent, dragRoot = dragEvent.currentTarget) {
  const previewHost = dragRoot?.querySelector?.('.sidebar-blockly-preview');
  if (!previewHost) {
    setEmptyDragImage(dragEvent);
    return;
  }

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;pointer-events:none;background:transparent;overflow:visible;';

  const clone = previewHost.cloneNode(true);
  cleanPreviewClone(clone);
  clone.style.width = `${previewHost.offsetWidth}px`;
  clone.style.height = `${previewHost.offsetHeight}px`;
  clone.style.maxWidth = 'none';
  wrap.appendChild(clone);
  document.body.appendChild(wrap);

  const offsetX = Math.min(Math.max(0, dragEvent.offsetX || 0), previewHost.offsetWidth);
  const offsetY = Math.min(Math.max(0, dragEvent.offsetY || 0), previewHost.offsetHeight);
  dragEvent.dataTransfer.setDragImage(wrap, offsetX, offsetY);
  requestAnimationFrame(() => wrap.remove());
}

/** Dim/hide sidebar source while dragging so only one block is visible. */
export function markSidebarBlockDragging(dragRoot, dragging) {
  if (!dragRoot) return;
  dragRoot.classList.toggle('sidebar-block-dragging', dragging);
}
