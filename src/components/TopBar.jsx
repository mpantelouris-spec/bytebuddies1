import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useProject } from '../contexts/ProjectContext';
import { Icon, EmojiIcon } from './ui/Icon';
import ProfileAvatar from './ui/ProfileAvatar.jsx';

/* The ByteBuddies mascot, same as in Robot Studio */
const Logo = () => (
  <img className="topbar-logo-mascot" src="/images/bytebuddies-mascot-head.webp" alt="" draggable="false" />
);

/* Renders a dropdown menu via portal so it escapes all parent overflow/stacking */
function PortalDropdown({ anchorRef, onClose, children, width }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const dropdownWidth = Math.min(width || 180, window.innerWidth - 16);
    const preferredRight = window.innerWidth - r.right;
    const maxRight = window.innerWidth - dropdownWidth - 8;
    setPos({ top: r.bottom + 6, right: Math.max(8, Math.min(preferredRight, maxRight)) });
  }, [anchorRef, width]);

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
        minWidth: Math.min(width || 180, window.innerWidth - 16),
        maxWidth: 'calc(100vw - 16px)',
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
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [navMode, setNavMode] = useState(() => {
    if (typeof window === 'undefined') return 'full';
    if (window.innerWidth <= 768) return 'mobile';
    return window.innerWidth <= 1340 ? 'compact' : 'full';
  });
  const [readNotifs, setReadNotifs] = useState(new Set());
  const avatarRef = useRef(null);
  const bellRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const updateNavMode = () => {
      const width = window.innerWidth;
      setNavMode(width <= 768 ? 'mobile' : width <= 1340 ? 'compact' : 'full');
    };
    window.addEventListener('resize', updateNavMode);
    return () => window.removeEventListener('resize', updateNavMode);
  }, []);

  const notifications = [
    { id: 1, text: 'ByteNinja liked your Space Defender!', time: '2m ago', icon: '❤️' },
    { id: 2, text: 'You earned 150 XP from Daily Challenge!', time: '1h ago', icon: '⚡' },
    { id: 3, text: 'New challenge available: CSS Art', time: '3h ago', icon: '🎯' },
    { id: 4, text: 'PixelKing remixed your project', time: '5h ago', icon: '🔄' },
  ];
  const unreadCount = notifications.filter(n => !readNotifs.has(n.id)).length;

  const pages = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'missions', label: 'Missions', icon: '🗺️' },
    { id: 'workspace', label: 'Python', icon: '🐍' },
    { id: 'gamebuilder', label: 'Game Builder', icon: '🎮' },
    { id: 'learn', label: 'Learn', icon: '📚' },
    { id: 'community', label: 'Community', icon: '🌍' },
    { id: 'classroom', label: 'Classroom', icon: '🏫' },
    { id: 'challenges', label: 'Challenges', icon: '⚡' },
    { id: 'studio', label: 'Robot Studio', icon: '🤖' },
    { id: 'robot', label: 'Robot Lab', icon: '🔬' },
  ];
  const visiblePageIds = navMode === 'full'
    ? ['dashboard', 'missions', 'workspace', 'gamebuilder', 'learn', 'classroom', 'studio']
    : navMode === 'compact'
      ? ['dashboard', 'missions', 'classroom', 'studio']
      : [];
  const primaryPages = pages.filter(p => visiblePageIds.includes(p.id));
  const menuPages = pages.filter(p => !visiblePageIds.includes(p.id));

  return (
    <div className="topbar">
      <div className="topbar-logo" onClick={() => onNavigate('dashboard')}>
        <Logo />
        <span>ByteBuddies</span>
      </div>

      <div className="topbar-navigation">
        <nav className="topbar-nav" aria-label="Primary navigation">
          {primaryPages.map(p => (
            <button
              key={p.id}
              className={`topbar-nav-btn ${currentPage === p.id ? 'active' : ''}`}
              onClick={() => onNavigate(p.id)}
              aria-current={currentPage === p.id ? 'page' : undefined}
            >
              <EmojiIcon e={p.icon} style={{ marginRight: 6 }} />
              {p.label}
            </button>
          ))}
        </nav>

        <button
          ref={menuRef}
          className={`topbar-menu-toggle ${showMainMenu ? 'is-open' : ''}`}
          onClick={() => { setShowMainMenu(v => !v); setShowNotifs(false); setShowUserMenu(false); }}
          title="More destinations"
          aria-label="More destinations"
          aria-expanded={showMainMenu}
          aria-controls="topbar-main-menu"
        >
          <span className="topbar-menu-icon" aria-hidden="true"><Icon name="dots-three" /></span>
          <span>More</span>
          <span className="topbar-menu-chevron" aria-hidden="true"><Icon name="caret-down" size="0.9em" /></span>
        </button>
      </div>
      {showMainMenu && (
        <PortalDropdown anchorRef={menuRef} onClose={() => setShowMainMenu(false)} width={240}>
          <nav id="topbar-main-menu" aria-label="Main menu">
            {menuPages.map(p => (
              <button
                key={p.id}
                className="dropdown-item"
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left' }}
                onClick={() => { onNavigate(p.id); setShowMainMenu(false); }}
              >
                <EmojiIcon e={p.icon} />
                <span>{p.label}</span>
              </button>
            ))}
            {(['mpantelouris@britishschool.sch.ae','fudoh@britishschool.sch.ae'].includes(user?.email) || user?.role === 'admin') && (
              <button
                className="dropdown-item"
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', color: '#f59e0b' }}
                onClick={() => { onNavigate('admin'); setShowMainMenu(false); }}
              >
                <Icon name="shield-check" />
                <span>Admin</span>
              </button>
            )}
          </nav>
        </PortalDropdown>
      )}

      <div className="topbar-actions">
        <div className="xp-bar" title={`${user.xp} / ${user.xpToNext} XP`} style={{ gap: 4 }}>
          <span style={{ fontSize: 11, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lightning" color="#fbbf24" /> Lv.{user.level}</span>
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
          <Icon name="bell" size="1.25em" />
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
                <EmojiIcon e={n.icon} size="1.1em" style={{ flexShrink: 0, marginTop: 1, color: 'var(--accent, #6366f1)' }} />
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
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="1.25em" />
        </button>

        {/* Avatar */}
        <div
          ref={avatarRef}
          className="avatar cursor-pointer"
          onClick={() => { setShowUserMenu(v => !v); setShowNotifs(false); }}
          style={{ background: 'none', padding: 0, overflow: 'hidden' }}
          title="Your profile"
        >
          <ProfileAvatar value={user.avatarEmoji} name={user.name} size={36} />
        </div>

        {showUserMenu && (
          <PortalDropdown anchorRef={avatarRef} onClose={() => setShowUserMenu(false)}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border-color)'}}>
              <div style={{fontWeight:700,fontSize:14}}>{user.name}</div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>Level {user.level} • {user.badges.length} badges</div>
            </div>
            <button className="dropdown-item" onClick={() => { onNavigate('dashboard'); setShowUserMenu(false); }}><Icon name="chart-bar" style={{ marginRight: 8 }} />My Dashboard</button>
            <button className="dropdown-item" onClick={() => { onNavigate('settings'); setShowUserMenu(false); }}><Icon name="gear-six" style={{ marginRight: 8 }} />Settings</button>
            <button className="dropdown-item" onClick={() => { onNavigate('portfolio'); setShowUserMenu(false); }}><Icon name="medal" style={{ marginRight: 8 }} />My Portfolio</button>
            <button className="dropdown-item" onClick={() => { onNavigate('workspace'); setShowUserMenu(false); }}><Icon name="folder" style={{ marginRight: 8 }} />My Projects</button>
            <button className="dropdown-item" onClick={() => { onNavigate('missions'); setShowUserMenu(false); }}><Icon name="map-trifold" style={{ marginRight: 8 }} />Mission Mode</button>
            <button className="dropdown-item" onClick={() => { onNavigate('parent'); setShowUserMenu(false); }}><Icon name="users-three" style={{ marginRight: 8 }} />Parent View</button>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={onAuth}><Icon name="key" style={{ marginRight: 8 }} />Account</button>
          </PortalDropdown>
        )}
      </div>
    </div>
  );
}
