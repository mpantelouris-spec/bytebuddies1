import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import { buildLibraryCategories } from '../data/blockLibraryCategories';
import { readEnabledExtensionIds } from '../data/extensionsCatalog';
import { BB_EXTENSIONS_CHANGED } from '../utils/blockLibraryEvents';

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

  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>{currentPage === 'gamebuilder' ? 'Game Assets' : isStarter ? 'Starter Blocks' : 'Block Library'}</span>
      </div>
      {!isStarter && (
        <div style={{padding: '8px'}}>
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
        {/* Project selector */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Projects</div>
          {projects.slice(0, 5).map(p => (
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
          <button
            className="sidebar-item"
            style={{color: 'var(--accent-primary)'}}
            onClick={() => createProject({ name: 'New Project', type: 'app', language: 'python', code: '# New Project\nprint("Hello!")\n', blocks: true, starred: false })}
          >
            <span className="sidebar-item-icon">➕</span>
            <span>New Project</span>
          </button>
        </div>

        {/* Block categories */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            {currentPage === 'gamebuilder' ? 'Assets & Blocks' : 'Blocks'}
          </div>
          {filtered.map((cat) => (
            <div key={cat.extensionId || cat.name}>
              <button
                className={`sidebar-item ${activeCategory === cat.name ? 'active' : ''}`}
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
                <div style={{ paddingLeft: 16, marginBottom: 8 }}>
                  {(cat.blocks || []).map((block, bi) => (
                    <div
                      key={`${cat.name}-${bi}-${String(block).slice(0, 32)}`}
                      className="sidebar-item"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', block)}
                      style={{
                        fontSize: isStarter ? 14 : 12,
                        padding: isStarter ? '14px 12px' : '5px 10px',
                        borderLeft: `3px solid ${cat.color}`,
                        marginBottom: isStarter ? 6 : 2,
                        borderRadius: '0 6px 6px 0',
                        cursor: 'grab',
                        minHeight: isStarter ? 48 : 'auto',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {block}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
