import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildLibraryCategories } from '../data/blockLibraryCategories';
import { readEnabledExtensionIds } from '../data/extensionsCatalog';
import { emitAddSidebarBlock, BB_OPEN_EXTENSIONS } from '../utils/blockLibraryEvents';

/**
 * Full-screen block picker for narrow viewports (sidebar is hidden ≤768px).
 */
export default function BlockLibraryDrawer({ open, onClose, currentPage, isStarter }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => {
    const enabled = readEnabledExtensionIds();
    return buildLibraryCategories({ currentPage, isStarter, enabledExtensionIds: enabled });
  }, [currentPage, isStarter, open]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const q = searchTerm.trim().toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.blocks.some((b) => b.toLowerCase().includes(q)),
    );
  }, [categories, searchTerm]);

  if (!open || typeof document === 'undefined') return null;

  const pickBlock = (name) => {
    emitAddSidebarBlock(name);
    onClose();
  };

  return createPortal(
    <div
      className="block-library-drawer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Block library"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="block-library-drawer" onClick={(e) => e.stopPropagation()}>
        <header className="block-library-drawer-header">
          <h2 className="block-library-drawer-title">Block library</h2>
          <button type="button" className="btn btn-sm" onClick={onClose}>
            Close
          </button>
        </header>
        {!isStarter && (
          <div style={{ padding: '0 14px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              className="input"
              placeholder="Search blocks…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: 14 }}
            />
            {(currentPage === 'workspace' || currentPage === 'gamebuilder') && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent(BB_OPEN_EXTENSIONS));
                  onClose();
                }}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 600,
                }}
              >
                🧩 Extensions gallery
              </button>
            )}
          </div>
        )}
        <div className="block-library-drawer-scroll">
          {filtered.map((cat) => (
            <div key={cat.extensionId || cat.name} className="block-library-drawer-cat">
              <button
                type="button"
                className="block-library-drawer-cat-btn"
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                style={{ borderLeftColor: cat.color }}
              >
                <span>{cat.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{cat.name}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{activeCategory === cat.name ? '▼' : '▶'}</span>
              </button>
              {activeCategory === cat.name && (
                <div className="block-library-drawer-blocks">
                  {cat.blocks.map((block, bi) => (
                    <button
                      key={`${cat.name}-${bi}-${block}`}
                      type="button"
                      className="block-library-drawer-block-row"
                      style={{ borderLeftColor: cat.color }}
                      onClick={() => pickBlock(block)}
                    >
                      {block}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="block-library-drawer-hint">Tap a block to add it to the canvas (same as the desktop sidebar).</p>
      </div>
    </div>,
    document.body,
  );
}
