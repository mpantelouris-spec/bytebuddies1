import React from 'react';
import { useUser } from '../../../contexts/UserContext';

const NAV = [
  { id: 'design', label: 'Design', active: true },
  { id: 'test', label: 'Test' },
  { id: 'code', label: 'Code' },
  { id: 'missions', label: 'Missions' },
  { id: 'creations', label: 'My Creations' },
  { id: 'gallery', label: 'Gallery' },
];

export default function AcademyHeader({
  className = '',
  robotName,
  editingName,
  onEditName,
  onNameChange,
  onNameSave,
  savedLabel,
  onNav,
  onBack,
}) {
  const { user } = useUser();
  const xpPct = user.xpToNext ? Math.round((user.xp / user.xpToNext) * 100) : 0;

  return (
    <header className={`bb-academy-header ${className}`.trim()}>
      <div className="bb-academy-header-left">
        <button type="button" className="bb-academy-logo" onClick={onBack}>
          <span className="bb-academy-logo-mark">🤖</span>
          <span className="bb-academy-logo-text">
            <strong>ByteBuddies</strong>
            <small>Robotics Academy</small>
          </span>
        </button>
      </div>

      <nav className="bb-academy-nav" aria-label="Robot designer sections">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`bb-academy-nav-btn ${item.active ? 'active' : ''}`}
            onClick={() => onNav?.(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="bb-academy-header-right">
        <div className="bb-academy-user">
          <span className="bb-academy-avatar" aria-hidden>{user.avatarEmoji || '🧑‍💻'}</span>
          <div className="bb-academy-user-meta">
            <span className="bb-academy-level">Level {user.level}</span>
            <div className="bb-academy-xp-bar">
              <div className="bb-academy-xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <span className="bb-academy-xp-text">{user.xp} / {user.xpToNext} XP</span>
          </div>
        </div>
        <div className="bb-academy-stars" title="Stars">
          ⭐ <strong>{(user.xp || 0).toLocaleString()}</strong>
        </div>
      </div>

      <div className="bb-academy-robot-title-bar">
        {editingName ? (
          <input
            className="bb-academy-robot-name-input"
            value={robotName}
            onChange={(e) => onNameChange?.(e.target.value)}
            onBlur={onNameSave}
            onKeyDown={(e) => { if (e.key === 'Enter') onNameSave?.(); }}
            autoFocus
          />
        ) : (
          <button type="button" className="bb-academy-robot-name" onClick={onEditName}>
            {robotName || 'Explorer Bot'} <span className="bb-academy-edit">✎</span>
          </button>
        )}
        <span className="bb-academy-save-hint">{savedLabel || 'All changes saved'}</span>
      </div>
    </header>
  );
}
