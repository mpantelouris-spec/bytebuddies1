import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';

const blockCategories = [
  { name: 'Motion',    icon: '🏃', color: '#4a9eff', blocks: ['move steps','turn degrees','glide to','go to x,y','set X to','set Y to','change X by','change Y by','point toward mouse','point in direction','bounce off edges','set speed'] },
  { name: 'Looks',     icon: '👀', color: '#9b59b6', blocks: ['say','think','show / hide','switch costume','next costume','set size','grow by','shrink by','color effect','ghost effect','clear effects','go to front','go to back'] },
  { name: 'Sound',     icon: '🔊', color: '#e91e8c', blocks: ['play sound','stop sounds','set volume','play note'] },
  { name: 'Events',    icon: '⚡', color: '#ffab19', blocks: ['on start','on key press','on click','on collision','on message','broadcast'] },
  { name: 'Control',   icon: '🔧', color: '#ff8c1a', blocks: ['wait','repeat N times','forever','if / else','while condition','stop all','for each in list'] },
  { name: 'Sensing',   icon: '🔍', color: '#5bc0de', blocks: ['touching edge?','touching sprite?','key pressed?','mouse X','mouse Y','distance to mouse','timer','reset timer'] },
  { name: 'Operators', icon: '➕', color: '#59c059', blocks: ['add / subtract','multiply / divide','random number','round / abs','compare (=, <, >)','and / or / not','modulo'] },
  { name: 'Variables', icon: '📦', color: '#ff8c1a', blocks: ['create variable','set variable','change by','show variable','create list','add to list','get item #'] },
  { name: 'My Blocks', icon: '🧩', color: '#ff6680', blocks: ['define my block','run my block','define function','call function','with parameters','return value'] },
  { name: 'Physics',   icon: '💨', color: '#1abc9c', blocks: ['set velocity','set gravity','bounce off edges','jump','set friction','push'] },
  { name: 'Game',      icon: '🎮', color: '#e74c3c', blocks: ['add to score','set score','lose a life','set lives','game over','you win','next level','spawn clone','destroy','pause game'] },
  { name: 'AI',        icon: '🤖', color: '#f97316', blocks: ['AI classify','AI generate text','AI detect object','AI translate','train model'] },
];

const starterCategories = [
  {
    name: 'Move',
    icon: '➡️',
    color: '#6366f1',
    blocks: ['move forward', 'move back', 'turn left', 'turn right'],
  },
  {
    name: 'Repeat',
    icon: '🔁',
    color: '#8b5cf6',
    blocks: ['repeat 2 times', 'repeat 3 times', 'repeat 5 times', 'repeat 10 times'],
  },
  {
    name: 'Look',
    icon: '👁️',
    color: '#06b6d4',
    blocks: ['show', 'hide', 'say hello', 'say goodbye'],
  },
  {
    name: 'Sound',
    icon: '🔊',
    color: '#10b981',
    blocks: ['play sound', 'celebrate', 'play note', 'stop sounds'],
  },
];

const gameAssets = [
  { category: 'Characters', items: ['🧑‍🚀 Astronaut', '🦊 Fox', '🤖 Robot', '🧙 Wizard', '🦸 Hero', '👾 Alien'] },
  { category: 'Objects', items: ['⭐ Star', '💎 Gem', '🗝️ Key', '🎁 Gift', '💣 Bomb', '🏆 Trophy'] },
  { category: 'Backgrounds', items: ['🌌 Space', '🏔️ Mountains', '🌊 Ocean', '🏙️ City', '🌲 Forest', '🏜️ Desert'] },
  { category: 'Sounds', items: ['🔔 Bell', '💥 Explosion', '🎵 Music', '👏 Clap', '🎮 Game Over', '✨ Magic'] },
];

export default function Sidebar({ currentPage }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { projects, activeProject, setActiveProject, createProject } = useProject();
  const { user } = useUser();

  const isStarter = user?.ageMode === 'starter';

  const categories = currentPage === 'gamebuilder'
    ? [...blockCategories, ...gameAssets.map(a => ({ name: a.category, icon: '🎨', color: '#f59e0b', blocks: a.items }))]
    : isStarter ? starterCategories : blockCategories;

  const filtered = searchTerm
    ? categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.blocks.some(b => b.toLowerCase().includes(searchTerm.toLowerCase())))
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
          {filtered.map(cat => (
            <div key={cat.name}>
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
                <div style={{paddingLeft: 16, marginBottom: 8}}>
                  {cat.blocks.map(block => (
                    <div
                      key={block}
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
