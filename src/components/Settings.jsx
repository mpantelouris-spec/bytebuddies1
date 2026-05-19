import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

const AVATARS = ['🧑‍💻','🦊','🤖','🧙','🦸','👾','🐱','🦄','🐼','🐸','🦁','🐧','🦋','🌟','🚀','🎮'];
const BLOCK_THEMES = [
  { id: 'default', label: 'Default',  preview: '🎨' },
  { id: 'pastel',  label: 'Pastel',   preview: '🌸', xpRequired: 5000 },
  { id: 'neon',    label: 'Neon',     preview: '⚡', xpRequired: 10000 },
  { id: 'ocean',   label: 'Ocean',    preview: '🌊', xpRequired: 15000 },
];
const COLORBLIND_MODES = [
  { id: 'none',         label: 'None (Default)' },
  { id: 'deuteranopia', label: 'Deuteranopia (Red-Green)' },
  { id: 'protanopia',   label: 'Protanopia (Red-Green alt)' },
  { id: 'tritanopia',   label: 'Tritanopia (Blue-Yellow)' },
];

export default function Settings() {
  const { theme, toggleTheme, colorblindMode, setColorblindMode, highContrast, setHighContrast, dyslexicFont, setDyslexicFont, blockColorTheme, setBlockColorTheme } = useTheme();
  const { user, setUser, isLoggedIn, updateAgeMode, updateRole } = useUser();

  const [editName, setEditName] = useState(user.name);
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('cv-font-size') || '14');
  const [saved, setSaved] = useState('');

  const handleSaveProfile = () => {
    if (!editName.trim() || editName.trim().length < 2) return;
    setUser(prev => ({ ...prev, name: editName.trim() }));
    setSaved('profile');
    setTimeout(() => setSaved(''), 2000);
  };

  const handleFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('cv-font-size', size);
    document.documentElement.style.setProperty('--editor-font-size', size + 'px');
    setSaved('editor');
    setTimeout(() => setSaved(''), 2000);
  };

  const sectionStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: 6,
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
  };

  const totalXPApprox = (user.level - 1) * (user.xpToNext || 3000) + (user.xp || 0);

  return (
    <div className="page" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Customise your ByteBuddies experience</p>
      </div>

      {/* ─── Profile ─── */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>👤 Profile</h3>
        {saved === 'profile' && (
          <div style={{ padding: 10, borderRadius: 8, background: '#10b98120', color: '#10b981', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            ✅ Profile saved!
          </div>
        )}

        {/* Avatar selection */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Choose Your Avatar</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AVATARS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setUser(prev => ({ ...prev, avatarEmoji: emoji }))}
                style={{
                  width: 48, height: 48, fontSize: 28, border: `2px solid ${user.avatarEmoji === emoji ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: 12, background: user.avatarEmoji === emoji ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 36, flexShrink: 0 }}>
            {user.avatarEmoji || user.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Username</label>
            <input
              className="input"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Your username"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSaveProfile}>Save Profile</button>

        {isLoggedIn && (
          <div style={{ marginTop: 16, padding: '12px 0 0', borderTop: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-muted)' }}>
            <strong>Level:</strong> {user.level} &nbsp;•&nbsp;
            <strong>XP:</strong> {user.xp}/{user.xpToNext} &nbsp;•&nbsp;
            <strong>Badges:</strong> {user.badges.length} &nbsp;•&nbsp;
            <strong>Streak:</strong> {user.streak} days
          </div>
        )}
      </div>

      {/* ─── Role & Classroom ─── */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🏫 Role & Classroom</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>I am a…</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['student', 'teacher', 'parent'].map(role => (
              <button
                key={role}
                className={`btn btn-sm ${user.role === role ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updateRole(role)}
                style={{ textTransform: 'capitalize' }}
              >
                {role === 'student' ? '🎓' : role === 'teacher' ? '👩‍🏫' : '👨‍👩‍👧'} {role}
              </button>
            ))}
          </div>
        </div>
        {user.role === 'student' && (
          <div>
            <label style={labelStyle}>Join a Classroom (class code)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="e.g. CV-2026-ABC"
                defaultValue={user.classroomId || ''}
                onBlur={e => setUser(prev => ({ ...prev, classroomId: e.target.value.trim() || null }))}
                style={{ maxWidth: 200 }}
              />
            </div>
          </div>
        )}
        {user.role === 'teacher' && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Your class code: <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>CV-2026-{user.name?.slice(0,3).toUpperCase() || 'ABC'}</strong>
            <span style={{ marginLeft: 8, fontSize: 11 }}>(share this with students)</span>
          </div>
        )}
      </div>

      {/* ─── Age Mode ─── */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>👶 Age Mode</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Starter Mode uses large icon-only blocks — perfect for ages 5-7.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { id: 'standard', label: 'Standard Mode', desc: 'Ages 7-11 · Full block editor', icon: '💻' },
            { id: 'starter',  label: 'Starter Mode',  desc: 'Ages 5-7 · Icon-only blocks',  icon: '🌟' },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => updateAgeMode(mode.id)}
              style={{
                flex: 1, padding: 16, borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                background: user.ageMode === mode.id ? 'rgba(99,102,241,0.12)' : 'var(--bg-tertiary)',
                border: `2px solid ${user.ageMode === mode.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                color: 'var(--text-primary)', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{mode.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{mode.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Appearance ─── */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎨 Appearance</h3>
        <div style={rowStyle}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Theme</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Switch between dark and light mode</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme} style={{ minWidth: 100 }}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div style={rowStyle}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Editor Font Size</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Adjust the code editor text size</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['12', '14', '16', '18'].map(size => (
              <button key={size} className={`btn btn-sm ${fontSize === size ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleFontSize(size)} style={{ minWidth: 36 }}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Block colour themes */}
        <div style={{ ...rowStyle, borderBottom: 'none', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Block Colour Theme</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Earn XP to unlock new themes</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {BLOCK_THEMES.map(bt => {
              const unlocked = user.unlockedThemes?.includes(bt.id);
              const active = blockColorTheme === bt.id;
              return (
                <button
                  key={bt.id}
                  onClick={() => unlocked && setBlockColorTheme(bt.id)}
                  title={unlocked ? bt.label : `Unlock at ${bt.xpRequired?.toLocaleString()} XP`}
                  style={{
                    padding: '10px 16px', borderRadius: 10, border: `2px solid ${active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    background: active ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                    cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.5,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 72,
                    color: 'var(--text-primary)', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{bt.preview}</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{bt.label}</span>
                  {!unlocked && <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>🔒 {(bt.xpRequired/1000).toFixed(0)}K XP</span>}
                </button>
              );
            })}
          </div>
        </div>

        {saved === 'editor' && (
          <div style={{ padding: 10, borderRadius: 8, background: '#10b98120', color: '#10b981', fontSize: 13, fontWeight: 600, marginTop: 8 }}>
            ✅ Editor settings saved!
          </div>
        )}
      </div>

      {/* ─── Accessibility ─── */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>♿ Accessibility</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Colour-Blind Mode</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {COLORBLIND_MODES.map(mode => (
              <label key={mode.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="radio"
                  name="colorblind"
                  checked={colorblindMode === mode.id}
                  onChange={() => setColorblindMode(mode.id)}
                />
                {mode.label}
              </label>
            ))}
          </div>
        </div>

        <div style={rowStyle}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>High Contrast Mode</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Maximum contrast for readability</div>
          </div>
          <Toggle value={highContrast} onChange={setHighContrast} />
        </div>

        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>OpenDyslexic Font</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dyslexia-friendly font for all text</div>
          </div>
          <Toggle value={dyslexicFont} onChange={setDyslexicFont} />
        </div>
      </div>

      {/* ─── Preferences ─── */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🔔 Preferences</h3>
        <ToggleSetting label="Sound Effects" description="Play sounds for achievements and XP gains" storageKey="cv-sounds" defaultVal={true} />
        <ToggleSetting label="Animations" description="Enable interface animations and transitions" storageKey="cv-animations" defaultVal={true} />
        <ToggleSetting label="Auto-save Projects" description="Automatically save your work every 30 seconds" storageKey="cv-autosave" defaultVal={true} />
        <ToggleSetting label="Show Line Numbers" description="Display line numbers in the code editor" storageKey="cv-line-numbers" defaultVal={true} noBorder />
      </div>

      {/* ─── Data ─── */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💾 Data</h3>
        <div style={rowStyle}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Reset Progress</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reset all XP, levels, and course progress</div>
          </div>
          <ResetButton setUser={setUser} />
        </div>
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Clear Local Storage</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Remove all saved preferences and cached data</div>
          </div>
          <ClearStorageButton />
        </div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: value ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: value ? 23 : 3, transition: 'left 0.2s',
      }} />
    </button>
  );
}

function ToggleSetting({ label, description, storageKey, defaultVal, noBorder }) {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? saved === 'true' : defaultVal;
  });

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(storageKey, String(next));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: noBorder ? 'none' : '1px solid var(--border-color)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</div>
      </div>
      <Toggle value={enabled} onChange={() => toggle()} />
    </div>
  );
}

function ResetButton({ setUser }) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-danger btn-sm" onClick={() => {
          setUser(prev => ({ ...prev, level: 1, xp: 0, xpToNext: 500, badges: [], streak: 0, completedLessons: 0 }));
          setConfirm(false);
        }}>Confirm</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setConfirm(false)}>Cancel</button>
      </div>
    );
  }

  return <button className="btn btn-danger btn-sm" onClick={() => setConfirm(true)}>Reset</button>;
}

function ClearStorageButton() {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-danger btn-sm" onClick={() => { localStorage.clear(); window.location.reload(); }}>Confirm</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setConfirm(false)}>Cancel</button>
      </div>
    );
  }

  return <button className="btn btn-danger btn-sm" onClick={() => setConfirm(true)}>Clear</button>;
}
