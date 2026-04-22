import React, { useState, useMemo, useEffect } from 'react';
import { communityProjects } from '../data/courseData';
import { useUser } from '../contexts/UserContext';
import { saveStudioToFirestore, getAllStudios, deleteStudioFromFirestore } from '../firebase';

const TYPE_LABELS = { game: '🎮 Game', website: '🌐 Website', app: '📱 App', simulation: '🔬 Sim' };

const STUDIO_ICONS = ['🎮','🚀','🌊','🏙️','⚡','🎨','🤖','🧠','🔬','🎵','🦊','🌍'];
const STUDIO_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#0ea5e9','#8b5cf6','#ef4444','#06b6d4'];

function CreateStudioModal({ onClose, onCreate, userName }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState('🎮');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return setError('Studio name is required');
    onCreate({ id: Date.now().toString(), name: name.trim(), desc: desc.trim(), icon, color, projects: 0, members: 1, creator: userName, createdAt: new Date().toISOString() });
    onClose();
  };

  const inputStyle = { width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: 'var(--text-primary)', boxSizing: 'border-box', outline: 'none' };
  const label = { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 20, width: '100%', maxWidth: 460, border: '1px solid var(--border-color)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>🏛️ Create a Studio</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ padding: 10, borderRadius: 8, background: '#ef444420', color: '#ef4444', fontSize: 13 }}>{error}</div>}

          {/* Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 12 }}>
            <div style={{ fontSize: 36 }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{name || 'Studio Name'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc || 'Studio description'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>0 projects · 1 member</div>
            </div>
          </div>

          <div>
            <label style={label}>Studio Name *</label>
            <input style={inputStyle} placeholder="e.g. Game Dev Crew" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={label}>Description</label>
            <input style={inputStyle} placeholder="What's your studio about?" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div>
            <label style={label}>Icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STUDIO_ICONS.map(i => (
                <button key={i} onClick={() => setIcon(i)} style={{ width: 38, height: 38, borderRadius: 8, border: `2px solid ${icon === i ? 'var(--accent-primary)' : 'var(--border-color)'}`, background: icon === i ? 'rgba(99,102,241,0.15)' : 'var(--bg-primary)', fontSize: 18, cursor: 'pointer' }}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={label}>Colour</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {STUDIO_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: `3px solid ${color === c ? '#fff' : 'transparent'}`, cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button onClick={handleCreate} style={{ padding: '10px 20px', background: 'var(--accent-primary)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Create Studio</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Community() {
  const { user } = useUser();
  const [tab, setTab] = useState('trending');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [likedProjects, setLikedProjects] = useState(new Set());
  const [commentText, setCommentText] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [comments, setComments] = useState({});
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [showCreateStudio, setShowCreateStudio] = useState(false);
  const [studios, setStudios] = useState([]);
  const [studiosLoading, setStudiosLoading] = useState(true);
  const [selectedStudio, setSelectedStudio] = useState(null);

  // Load studios from Firestore on mount
  useEffect(() => {
    getAllStudios().then(data => {
      setStudios(data);
      setStudiosLoading(false);
    });
  }, []);

  const createStudio = async (studio) => {
    const ok = await saveStudioToFirestore(studio);
    if (ok) {
      setStudios(prev => [...prev, studio]);
    } else {
      // Firestore blocked — store locally as fallback so user isn't left hanging
      setStudios(prev => [...prev, { ...studio, localOnly: true }]);
    }
  };

  const deleteStudio = async (studioId) => {
    await deleteStudioFromFirestore(studioId);
    setStudios(prev => prev.filter(s => s.id !== studioId));
    if (selectedStudio?.id === studioId) setSelectedStudio(null);
  };

  const types = ['all', 'game', 'website', 'app', 'simulation'];
  const featuredProjects = communityProjects.filter(p => p.featured);

  const filtered = useMemo(() => {
    let list = communityProjects
      .filter(p => filter === 'all' || p.type === filter)
      .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase()));
    if (tab === 'popular') return [...list].sort((a, b) => b.likes - a.likes);
    if (tab === 'newest') return [...list].sort((a, b) => b.id.localeCompare(a.id));
    if (tab === 'featured') return list.filter(p => p.featured);
    return [...list].sort((a, b) => b.views - a.views); // trending
  }, [filter, search, tab]);

  const toggleLike = (id) => {
    setLikedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const addComment = (projectId) => {
    if (!commentText.trim()) return;
    setComments(prev => ({
      ...prev,
      [projectId]: [
        { user: user.name, text: commentText.trim(), time: 'Just now' },
        ...(prev[projectId] || []),
      ],
    }));
    setCommentText('');
  };

  if (selectedProject) {
    const p = selectedProject;
    const projectComments = comments[p.id] || [];
    return (
      <div className="page">
        <button className="btn btn-ghost mb-4" onClick={() => setSelectedProject(null)}>← Back to Community</button>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div className="card">
              <div style={{ height: 300, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, borderBottom: '1px solid var(--border-color)' }}>
                {p.preview}
              </div>
              <div className="card-body">
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800 }}>{p.title}</h2>
                  <span className={`tag ${p.type === 'game' ? 'tag-warning' : p.type === 'website' ? 'tag-primary' : 'tag-success'}`}>{TYPE_LABELS[p.type]}</span>
                  {p.featured && <span className="tag tag-warning">⭐ Featured</span>}
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{p.description}</p>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <button className={`btn ${likedProjects.has(p.id) ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleLike(p.id)}>
                    {likedProjects.has(p.id) ? '❤️' : '🤍'} {p.likes + (likedProjects.has(p.id) ? 1 : 0)}
                  </button>
                  <button className="btn btn-secondary">🔄 Remix</button>
                  <button className="btn btn-secondary">🔗 Share</button>
                  <button className="btn btn-success">▶ Open in Editor</button>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                  <span>👁️ {p.views} views</span>
                  <span>🔄 {p.remixes} remixes</span>
                  <span>By <strong style={{ color: 'var(--accent-primary)' }}>{p.author}</strong></span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: 360 }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>💬 Comments ({projectComments.length})</h3>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                {projectComments.map((c, i) => (
                  <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{c.user}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.text}</p>
                  </div>
                ))}
                {projectComments.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No comments yet. Be the first!</p>
                )}
              </div>
              <div style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
                <input className="input" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment(p.id)} />
                <button className="btn btn-primary btn-sm" onClick={() => addComment(p.id)}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>🌍 Community</h1>
        <p>Discover amazing projects, remix ideas, and share your creations with the world!</p>
      </div>

      {/* Featured rotating banner */}
      {featuredProjects.length > 0 && (
        <div style={{
          background: 'var(--gradient-primary)',
          borderRadius: 16,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:-30, right:60, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
          <div style={{ fontSize: 60, flexShrink: 0 }}>{featuredProjects[featuredIdx % featuredProjects.length].preview}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>⭐ Project of the Week</div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{featuredProjects[featuredIdx % featuredProjects.length].title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 12 }}>
              By <strong>{featuredProjects[featuredIdx % featuredProjects.length].author}</strong> · {featuredProjects[featuredIdx % featuredProjects.length].description}
            </p>
            <button className="btn" style={{ background: 'white', color: '#6366f1', fontWeight: 700, fontSize: 13 }}
              onClick={() => setSelectedProject(featuredProjects[featuredIdx % featuredProjects.length])}>
              View Project →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            {featuredProjects.map((_, i) => (
              <div key={i} onClick={() => setFeaturedIdx(i)} style={{ width: 8, height: i === featuredIdx % featuredProjects.length ? 24 : 8, background: 'rgba(255,255,255,0.8)', borderRadius: 4, cursor: 'pointer', transition: 'height 0.3s' }} />
            ))}
          </div>
        </div>
      )}

      {/* Search + filter row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="tab-nav">
            {['trending', 'featured', 'newest', 'popular'].map(t => (
              <button key={t} className={`tab-nav-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'trending' ? '🔥' : t === 'featured' ? '⭐' : t === 'newest' ? '🆕' : '❤️'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
            <input
              className="input"
              placeholder="Search projects or creators..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32, width: 220, fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {types.map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
                {f === 'all' ? '🗂️' : f === 'game' ? '🎮' : f === 'website' ? '🌐' : f === 'app' ? '📱' : '🔬'} {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Studios row */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>🏛️ Studios</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateStudio(true)}>+ Create Studio</button>
        </div>
        <div style={{ padding: '12px 16px' }}>
          {studiosLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>⏳ Loading studios…</div>
          ) : studios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏛️</div>
              <p style={{ fontSize: 13, margin: '0 0 12px' }}>No studios yet — create one to group projects with friends!</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreateStudio(true)}>+ Create the first studio</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {studios.map(s => (
                <button key={s.id} onClick={() => setSelectedStudio(s)} style={{
                  padding: '14px 18px', background: selectedStudio?.id === s.id ? `${s.color}20` : 'var(--bg-tertiary)',
                  border: `1px solid ${selectedStudio?.id === s.id ? s.color : 'var(--border-color)'}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', minWidth: 160,
                  transition: 'all 0.18s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { if (selectedStudio?.id !== s.id) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; } }}
                >
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{s.name}</div>
                  {s.desc && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.desc}</div>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.projects} projects · {s.members} member{s.members !== 1 ? 's' : ''}</div>
                  <div style={{ fontSize: 10, color: s.color, marginTop: 4, fontWeight: 600 }}>by {s.creator}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateStudio && <CreateStudioModal onClose={() => setShowCreateStudio(false)} onCreate={createStudio} userName={user.name} />}

      {/* Studio detail modal */}
      {selectedStudio && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setSelectedStudio(null)}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 20, width: '100%', maxWidth: 500, border: `1px solid ${selectedStudio.color}40`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `${selectedStudio.color}20`, border: `2px solid ${selectedStudio.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {selectedStudio.icon}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedStudio.name}</h2>
                  {selectedStudio.desc && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{selectedStudio.desc}</p>}
                </div>
              </div>
              <button onClick={() => setSelectedStudio(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-color)' }}>
              {[
                { val: selectedStudio.projects || 0, label: 'Projects' },
                { val: selectedStudio.members || 1, label: 'Members' },
                { val: new Date(selectedStudio.createdAt).toLocaleDateString(), label: 'Created' },
              ].map((s, i) => (
                <div key={s.label} style={{ flex: 1, padding: '16px 20px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: selectedStudio.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Body */}
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Created by <strong style={{ color: 'var(--text-primary)' }}>{selectedStudio.creator}</strong>
                {selectedStudio.localOnly && <span style={{ marginLeft: 8, fontSize: 11, color: '#f59e0b' }}>⚠️ Saved locally only</span>}
              </div>

              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                <p style={{ fontSize: 13, margin: '0 0 12px' }}>No projects in this studio yet.</p>
                <button className="btn btn-secondary" style={{ fontSize: 13 }}>+ Add a Project</button>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                {selectedStudio.creator === user.name && (
                  <button
                    onClick={() => { if (window.confirm(`Delete studio "${selectedStudio.name}"?`)) deleteStudio(selectedStudio.id); }}
                    style={{ padding: '9px 16px', background: 'none', border: '1px solid #ef444460', borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    🗑️ Delete Studio
                  </button>
                )}
                <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '9px 20px' }}>
                  👥 Invite Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No projects found</div>
          <div style={{ fontSize: 13 }}>Try a different search or filter</div>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: 20 }}>
          {filtered.map(project => (
            <div key={project.id} className="project-card" onClick={() => setSelectedProject(project)}>
              <div className="project-card-preview" style={{ background: `${project.type === 'game' ? '#ec489918' : project.type === 'website' ? '#06b6d418' : '#8b5cf618'}` }}>
                <span style={{ fontSize: 56 }}>{project.preview}</span>
                {project.featured && (
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <span className="tag tag-warning">⭐ Featured</span>
                  </div>
                )}
                <div className="overlay">
                  <button className="btn btn-primary">▶ View Project</button>
                </div>
              </div>
              <div className="project-card-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>{project.title}</h4>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginLeft: 8,
                    background: project.type === 'game' ? '#f9731620' : project.type === 'website' ? '#06b6d420' : '#8b5cf620',
                    color: project.type === 'game' ? '#f97316' : project.type === 'website' ? '#06b6d4' : '#8b5cf6',
                  }}>{TYPE_LABELS[project.type]}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>by <strong style={{ color: 'var(--text-secondary)' }}>{project.author}</strong></p>
                <div className="project-card-meta">
                  <span onClick={e => { e.stopPropagation(); toggleLike(project.id); }} style={{ cursor: 'pointer' }}>
                    {likedProjects.has(project.id) ? '❤️' : '🤍'} {project.likes + (likedProjects.has(project.id) ? 1 : 0)}
                  </span>
                  <span>👁️ {project.views}</span>
                  <span>🔄 {project.remixes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

