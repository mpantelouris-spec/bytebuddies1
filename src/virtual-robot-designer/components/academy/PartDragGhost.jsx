import React, { useEffect, useState } from 'react';

/** Follows cursor while dragging parts from the library */
export default function PartDragGhost() {
  const [ghost, setGhost] = useState(null);

  useEffect(() => {
    const onDragStart = (e) => {
      const tile = e.target.closest?.('.bb-part-tile, .bb-quick-btn');
      if (!tile) return;
      const icon = tile.querySelector('.bb-part-tile-icon, .bb-quick-btn-icon');
      const label = tile.querySelector('.bb-part-tile-label, span:last-child');
      setGhost({
        icon: icon?.textContent || '🔧',
        label: label?.textContent || 'Part',
        x: e.clientX,
        y: e.clientY,
      });
    };
    const onDrag = (e) => {
      if (e.clientX === 0 && e.clientY === 0) return;
      setGhost((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : null));
    };
    const onDragEnd = () => setGhost(null);

    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('drag', onDrag);
    document.addEventListener('dragend', onDragEnd);
    return () => {
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('drag', onDrag);
      document.removeEventListener('dragend', onDragEnd);
    };
  }, []);

  if (!ghost) return null;

  return (
    <div
      className="bb-drag-ghost"
      style={{ left: ghost.x + 12, top: ghost.y + 12 }}
      aria-hidden
    >
      <span className="bb-drag-ghost-icon">{ghost.icon}</span>
      <span className="bb-drag-ghost-label">{ghost.label}</span>
    </div>
  );
}
