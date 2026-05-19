import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import { buildLibraryCategories } from '../data/blockLibraryCategories';
import { readEnabledExtensionIds } from '../data/extensionsCatalog';
import { BB_EXTENSIONS_CHANGED, emitAddSidebarBlock } from '../utils/blockLibraryEvents';
import BlocklySidebarFlyout from './BlocklySidebarFlyout';
import SidebarBlockPreview, { isPaletteBlockEntry } from './SidebarBlockPreview';
import { markSidebarBlockDragging, setSidebarBlockDragImage } from '../utils/sidebarBlockDragImage';

function darken(hex, amt = 44) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function Sidebar({ currentPage }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [extVersion, setExtVersion] = useState(0);
  const { projects, activeProject, setActiveProject, createProject } = useProject();
  const { user } = useUser();

  const isStarter = user?.ageMode === 'starter';

  const refreshExtensions = useCallback(() => {
    setExtVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const onExtChange = () => refreshExtensions();
    window.addEventListener(BB_EXTENSIONS_CHANGED, onExtChange);
    const onStorage = (e) => {
      if (e.key === 'bb_enabled_extensions_v1') refreshExtensions();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(BB_EXTENSIONS_CHANGED, onExtChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshExtensions]);

  const categories = useMemo(() => {
    return buildLibraryCategories({
      currentPage,
      isStarter,
      enabledExtensionIds: readEnabledExtensionIds(),
    });
  }, [currentPage, isStarter, extVersion]);

  const filtered = searchTerm
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.blocks || []).some((b) => String(b).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : categories;
  const pageKey = String(currentPage || '').toLowerCase();
  const pictoStylePages = new Set(['workspace', 'gamebuilder', 'learn', 'robot']);
  const usePictoBlockStyle = pictoStylePages.has(pageKey);
  const useBlocklyFlyout = pageKey === 'robot';
  const isGameBuilder = pageKey === 'gamebuilder';
  const blocksSectionStyle = { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' };
  const [showProjects, setShowProjects] = useState(!isGameBuilder);

  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>{currentPage === 'gamebuilder' ? 'Game Assets' : isStarter ? 'Starter Blocks' : 'Block Library'}</span>
      </div>
      {!isStarter && (
        <div style={{ padding: '8px', flexShrink: 0 }}>
          <input
            className="input"
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{fontSize: 12}}
          />
        </div>
      )}

      <div className="sidebar-content">
        <div className="sidebar-section" style={{ flexShrink: 0 }}>
          <button
            type="button"
            className="sidebar-section-title"
            onClick={() => setShowProjects((v) => !v)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 0,
              marginBottom: showProjects ? 8 : 0,
            }}
          >
            <span>Projects</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{showProjects ? '▼' : '▶'}</span>
          </button>
          {showProjects && projects.slice(0, 5).map(p => (
            <button
              key={p.id}
              className={`sidebar-item ${activeProject?.id === p.id ? 'active' : ''}`}
              onClick={() => setActiveProject(p)}
            >
              <span className="sidebar-item-icon">
                {p.type === 'game' ? '🎮' : p.type === 'website' ? '🌐' : '📱'}
              </span>
              <span className="truncate">{p.name}</span>
            </button>
          ))}
          {showProjects && (
          <button
            className="sidebar-item"
            style={{color: 'var(--accent-primary)'}}
            onClick={() => createProject({ name: 'New Project', type: 'app', language: 'python', code: '# New Project\nprint("Hello!")\n', blocks: true, starred: false })}
          >
            <span className="sidebar-item-icon">➕</span>
            <span>New Project</span>
          </button>
          )}
        </div>

        <div
          className={`sidebar-section sidebar-section--blocks${useBlocklyFlyout ? ' sidebar-blocks-workspace' : ''}`}
          style={blocksSectionStyle}
        >
          <div className="sidebar-section-title">
            {currentPage === 'gamebuilder' ? 'Assets & Blocks' : 'Blocks'}
          </div>
          {useBlocklyFlyout ? (
            <div className="sidebar-blocks-flyout-wrap">
              <BlocklySidebarFlyout categories={filtered} />
            </div>
          ) : (
          <div className="sidebar-blocks-scroll">
          <>
          {filtered.map((cat) => (
            <div key={cat.extensionId || cat.name}>
              <button
                type="button"
                className={`sidebar-item sidebar-category-toggle ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                style={{ borderLeft: `3px solid ${cat.color}` }}
              >
                <span className="sidebar-item-icon">{cat.icon}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0, display: 'inline-block' }} />
                  {cat.name}
                </span>
                <span style={{marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)'}}>
                  {activeCategory === cat.name ? '▼' : '▶'}
                </span>
              </button>
              {activeCategory === cat.name && (
                <div style={{ paddingLeft: 16, marginBottom: 8, maxWidth: '100%', overflow: 'auto' }}>
                  {(cat.blocks || []).map((block, bi) => {
                    const blockName = String(block);
                    const showBlocklyPreview = usePictoBlockStyle && isPaletteBlockEntry(blockName);

                    return showBlocklyPreview ? (
                      <div
                        key={`${cat.name}-${bi}-${blockName.slice(0, 32)}`}
                        className="sidebar-block-drag-source"
                        draggable
                        onDragStart={(e) => {
                          const payload = { name: blockName, color: cat.color || null };
                          e.dataTransfer.effectAllowed = 'copy';
                          e.dataTransfer.setData('text/plain', blockName);
                          e.dataTransfer.setData('application/x-bb-sidebar-block', JSON.stringify(payload));
                          markSidebarBlockDragging(e.currentTarget, true);
                          setSidebarBlockDragImage(e);
                        }}
                        onDragEnd={(e) => markSidebarBlockDragging(e.currentTarget, false)}
                        onClick={() => emitAddSidebarBlock(blockName, null, cat.color)}
                        style={{
                          cursor: 'pointer',
                          marginBottom: 5,
                          padding: '2px 0',
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0.85,
                          transition: 'opacity 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                      >
                        <SidebarBlockPreview blockName={blockName} categoryColor={cat.color} />
                      </div>
                    ) : (
                      <div
                        key={`${cat.name}-${bi}-${blockName.slice(0, 32)}`}
                        className="sidebar-item"
                        draggable
                        onDragStart={(e) => {
                          const payload = { name: blockName, color: cat.color || null };
                          e.dataTransfer.effectAllowed = 'copy';
                          e.dataTransfer.setData('text/plain', blockName);
                          e.dataTransfer.setData('application/x-bb-sidebar-block', JSON.stringify(payload));
                        }}
                        onClick={() => emitAddSidebarBlock(blockName, null, cat.color)}
                        style={{
                          fontSize: isStarter ? 14 : 12,
                          padding: isStarter ? '12px 12px' : '8px 10px',
                          borderLeft: usePictoBlockStyle ? 'none' : `3px solid ${cat.color}`,
                          marginBottom: isStarter ? 8 : 6,
                          borderRadius: usePictoBlockStyle
                            ? (blockName.toLowerCase().startsWith('on ') ? '14px 14px 6px 6px' : 8)
                            : '0 6px 6px 0',
                          cursor: 'pointer',
                          minHeight: isStarter ? 48 : 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          color: usePictoBlockStyle ? '#fff' : undefined,
                          fontWeight: usePictoBlockStyle ? 700 : undefined,
                          background: usePictoBlockStyle
                            ? `linear-gradient(180deg, ${cat.color} 0%, ${darken(cat.color, 30)} 100%)`
                            : undefined,
                          boxShadow: usePictoBlockStyle
                            ? `0 3px 0 ${darken(cat.color, 72)}, inset 0 1px 0 rgba(255,255,255,0.2)`
                            : undefined,
                          position: usePictoBlockStyle ? 'relative' : undefined,
                          textShadow: usePictoBlockStyle ? '0 1px 0 rgba(0,0,0,0.28)' : undefined,
                        }}
                      >
                        <span style={{ lineHeight: 1.3 }}>{block}</span>
                        {usePictoBlockStyle && (
                          <span
                            aria-hidden
                            style={{
                              position: 'absolute',
                              left: 12,
                              bottom: -7,
                              width: 18,
                              height: 7,
                              borderRadius: '0 0 4px 4px',
                              background: darken(cat.color, 72),
                              pointerEvents: 'none',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          </>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
