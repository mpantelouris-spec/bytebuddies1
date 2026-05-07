import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useProject } from '../contexts/ProjectContext';

const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 100 100" style={{flexShrink:0}}>
    <defs>
      <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#6366f1'}}/>
        <stop offset="50%" style={{stopColor:'#8b5cf6'}}/>
        <stop offset="100%" style={{stopColor:'#06b6d4'}}/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#lg)"/>
    <text x="50" y="62" textAnchor="middle" fill="white" fontFamily="monospace" fontSize="38" fontWeight="bold">&lt;/&gt;</text>
  </svg>
);

/* Renders a dropdown menu via portal so it escapes all parent overflow/stacking */
function PortalDropdown({ anchorRef, onClose, children, width }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
  }, [anchorRef]);

  if (!pos) return null;

  return createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose} />
      <div style={{
        position: 'fixed',
        top: pos.top,
        right: pos.right,
        zIndex: 9999,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: width || 180,
        padding: 4,
        animation: 'slideUp 0.15s ease',
      }}>
        {children}
      </div>
    </>,
    document.body
  );
}

export default function TopBar({ currentPage, onNavigate, onExport, onAuth }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { activeProject } = useProject();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [readNotifs, setReadNotifs] = useState(new Set());
  const avatarRef = useRef(null);
  const bellRef = useRef(null);

  const notifications = [
    { id: 1, text: 'ByteNinja liked your Space Defender!', time: '2m ago', icon: '❤️' },
    { id: 2, text: 'You earned 150 XP from Daily Challenge!', time: '1h ago', icon: '⚡' },
    { id: 3, text: 'New challenge available: CSS Art', time: '3h ago', icon: '🎯' },
    { id: 4, text: 'PixelKing remixed your project', time: '5h ago', icon: '🔄' },
  ];
  const unreadCount = notifications.filter(n => !readNotifs.has(n.id)).length;

  const pages = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'missions', label: 'Missions', icon: '🗺️', highlight: true },
    { id: 'workspace', label: 'Workspace', icon: '💻' },
    { id: 'gamebuilder', label: 'Game Builder', icon: '🎮' },
    { id: 'learn', label: 'Learn', icon: '📚' },
    { id: 'community', label: 'Community', icon: '🌍' },
    { id: 'classroom', label: 'Classroom', icon: '🏫' },
    { id: 'challenges', label: 'Challenges', icon: '⚡' },
    { id: 'robot', label: 'Robot Lab', icon: '🤖' },
  ];

  return (
    <div className="topbar">
      <div className="topbar-logo" onClick={() => onNavigate('dashboard')}>
        <Logo />
        <span>ByteBuddies</span>
      </div>

      <div className="topbar-nav">
        {pages.map(p => (
          <button
            key={p.id}
            className={`topbar-nav-btn ${currentPage === p.id ? 'active' : ''}`}
            onClick={() => onNavigate(p.id)}
            style={p.highlight && currentPage !== p.id ? { color: '#818cf8', position: 'relative' } : {}}
          >
            <span style={{marginRight: 4}}>{p.icon}</span>
            {p.label}
            {p.highlight && currentPage !== p.id && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 7, height: 7, borderRadius: '50%', background: '#6366f1' }} />
            )}
          </button>
        ))}
        {(['mpantelouris@britishschool.sch.ae','fudoh@britishschool.sch.ae'].includes(user?.email) || user?.role === 'admin') && (
          <button
            className={`topbar-nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => onNavigate('admin')}
            style={{ color: '#f59e0b' }}
          >
            <span style={{marginRight: 4}}>🛡️</span>
            Admin
          </button>
        )}
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-actions" style={{ flexShrink: 0 }}>
        <div className="xp-bar" title={`${user.xp} / ${user.xpToNext} XP`} style={{ gap: 4 }}>
          <span style={{ fontSize: 11, whiteSpace: 'nowrap' }}>⚡ Lv.{user.level}</span>
          <div className="xp-bar-fill" style={{ width: 60 }}>
            <div
              className="xp-bar-fill-inner"
              style={{ width: `${(user.xp / user.xpToNext) * 100}%`, transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            />
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{user.xp} XP</span>
        </div>

        {/* Notifications bell */}
        <button
          ref={bellRef}
          className="btn btn-ghost btn-icon"
          onClick={() => { setShowNotifs(v => !v); setShowUserMenu(false); }}
          title="Notifications"
          style={{ position: 'relative' }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              background: '#ef4444', color: 'white',
              fontSize: 9, fontWeight: 800,
              width: 15, height: 15, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1, pointerEvents: 'none',
            }}>{unreadCount}</span>
          )}
        </button>

        {showNotifs && (
          <PortalDropdown anchorRef={bellRef} onClose={() => setShowNotifs(false)} width={300}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => setReadNotifs(new Set(notifications.map(n => n.id)))}>Mark all read</button>
            </div>
            {notifications.map(n => (
              <button key={n.id} className="dropdown-item" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 16px' }}
                onClick={() => setReadNotifs(prev => new Set([...prev, n.id]))}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 12, lineHeight: 1.4, color: readNotifs.has(n.id) ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: readNotifs.has(n.id) ? 400 : 600 }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                </div>
                {!readNotifs.has(n.id) && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 4 }} />}
              </button>
            ))}
          </PortalDropdown>
        )}

        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Avatar */}
        <div
          ref={avatarRef}
          className="avatar cursor-pointer"
          onClick={() => { setShowUserMenu(v => !v); setShowNotifs(false); }}
          style={{ fontSize: user.avatarEmoji ? 20 : undefined }}
        >
          {user.avatarEmoji || user.avatar}
        </div>

        {showUserMenu && (
          <PortalDropdown anchorRef={avatarRef} onClose={() => setShowUserMenu(false)}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border-color)'}}>
              <div style={{fontWeight:700,fontSize:14}}>{user.name}</div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>Level {user.level} • {user.badges.length} badges</div>
            </div>
            <button className="dropdown-item" onClick={() => { onNavigate('dashboard'); setShowUserMenu(false); }}>📊 My Dashboard</button>
            <button className="dropdown-item" onClick={() => { onNavigate('settings'); setShowUserMenu(false); }}>⚙️ Settings</button>
            <button className="dropdown-item" onClick={() => { onNavigate('portfolio'); setShowUserMenu(false); }}>🏅 My Portfolio</button>
            <button className="dropdown-item" onClick={() => { onNavigate('workspace'); setShowUserMenu(false); }}>📁 My Projects</button>
            <button className="dropdown-item" onClick={() => { onNavigate('missions'); setShowUserMenu(false); }}>🗺️ Mission Mode</button>
            <button className="dropdown-item" onClick={() => { onNavigate('parent'); setShowUserMenu(false); }}>👨‍👩‍👧 Parent View</button>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={onAuth}>🔑 Account</button>
          </PortalDropdown>
        )}
      </div>
    </div>
  );
}
