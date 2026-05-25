/**
 * Bottom tray — mounted parts inventory + quick socket picker.
 */
import React from 'react';
import { SNAP_SLOTS } from '../../data/assembly-parts.js';
import { getWorkshopPart } from '../../data/assembly-parts.js';

export default function WorkshopInventoryTray({
  slots,
  selectedSlot,
  onSelectSlot,
  onRemovePart,
  onClear,
}) {
  const mounted = Object.entries(slots || {}).filter(([, v]) => v);

  return (
    <footer className="iw-tray" aria-label="Parts on your robot">
      <div className="iw-tray-sockets">
        <span className="iw-tray-label">Sockets</span>
        {Object.keys(SNAP_SLOTS).map((slotId) => {
          const filled = slots?.[slotId];
          const active = selectedSlot === slotId;
          return (
            <button
              key={slotId}
              type="button"
              className={`iw-socket-btn ${active ? 'active' : ''} ${filled ? 'filled' : ''}`}
              onClick={() => onSelectSlot?.(slotId)}
              title={SNAP_SLOTS[slotId].label}
            >
              <span>{SNAP_SLOTS[slotId].icon}</span>
              {filled && (
                <span
                  className="iw-socket-remove"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePart?.(slotId);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && onRemovePart?.(slotId)}
                  aria-label="Remove"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="iw-tray-parts">
        <span className="iw-tray-label">On robot</span>
        <div className="iw-tray-chips">
          {mounted.length === 0 ? (
            <span className="iw-tray-empty">Drag parts from the left — your robot will grow!</span>
          ) : (
            mounted.map(([slotId, part]) => {
              const meta = getWorkshopPart(part.category, part.partId);
              return (
                <span key={slotId} className="iw-tray-chip">
                  {meta?.icon || '◆'} {meta?.label || part.partId}
                </span>
              );
            })
          )}
        </div>
      </div>

      <button type="button" className="iw-tray-clear" onClick={onClear}>
        Start over
      </button>
    </footer>
  );
}
