import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getAllUsers } from '../firebase';

const ADMIN_EMAILS = ['mpantelouris@britishschool.sch.ae', 'fudoh@britishschool.sch.ae'];

const card = {
  background: 'var(--bg-secondary)',
  borderRadius: 16,
  border: '1px solid var(--border-color)',
  padding: 24,
};

const statBox = {
  background: 'var(--bg-secondary)',
  borderRadius: 12,
  border: '1px solid var(--border-color)',
  padding: 20,
  textAlign: 'center',
  flex: 1,
  minWidth: 130,
};

const badge = (color) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  background: color + '20',
  color,
});

const th = { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' };
const td = { fontSize: 13, color: 'var(--text-primary)', padding: '12px 14px', borderBottom: '1px solid var(--border-color)' };

function Section({ title, icon, children, action }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{icon}</span> {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 13, margin: 0 }}>{text}</p>
    </div>
  );
}

export default function AdminPanel() {
  const { user } = useUser();
  const [tab, setTab] = useState('overview');
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const cls = JSON.parse(localStorage.getItem('bb-classes') || '[]');
    setClasses(cls);
    setAssignments(JSON.parse(localStorage.getItem('bb-assignments') || '[]'));

    // Seed with current user from localStorage, then merge Firestore results
    const localUser = (() => {
      try { const u = JSON.parse(localStorage.getItem('cv-user') || '{}'); return u.name ? u : null; } catch { return null; }
    })();

    getAllUsers().then(firestoreUsers => {
      const map = new Map();
      if (localUser) map.set(localUser.email || localUser.name, localUser);
      firestoreUsers.forEach(u => {
        const key = u.email || u.id || u.name;
        if (key && !map.has(key)) map.set(key, u);
      });
      // Also pull students embedded in local classes
      cls.forEach(c => (c.students || []).forEach(s => {
        const key = s.email || s.id;
        if (key && !map.has(key)) map.set(key, { ...s, role: 'student' });
      }));
      setAllUsers(Array.from(map.values()));
    });
  }, [refreshKey]);

  // Guard: only allow admin
  if (!ADMIN_EMAILS.includes(user?.email) && user?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ fontSize: 64 }}>🔒</div>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>This page is restricted to ByteBuddies administrators.</p>
      </div>
    );
  }

  const lsKeys = Object.keys(localStorage).filter(k => k.startsWith('cv-') || k.startsWith('bb-'));
  const totalStudents = classes.reduce((s, c) => s + (c.students?.length || 0), 0);
  const overdueAssignments = assignments.filter(a => a.dueDate && new Date(a.dueDate) < new Date()).length;

  const stats = [
    { label: 'Active Users', value: allUsers.length, icon: '👤', color: '#6366f1' },
    { label: 'Classes', value: classes.length, icon: '🏫', color: '#10b981' },
    { label: 'Assignments', value: assignments.length, icon: '📋', color: '#f59e0b' },
    { label: 'Students', value: totalStudents, icon: '🎓', color: '#3b82f6' },
    { label: 'Overdue', value: overdueAssignments, icon: '⚠️', color: '#ef4444' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ];

  const deleteClass = (id) => {
    const updated = classes.filter(c => c.id !== id);
    localStorage.setItem('bb-classes', JSON.stringify(updated));
    setRefreshKey(k => k + 1);
  };

  const deleteAssignment = (id) => {
    const updated = assignments.filter(a => a.id !== id);
    localStorage.setItem('bb-assignments', JSON.stringify(updated));
    setRefreshKey(k => k + 1);
  };

  const clearKey = (key) => {
    if (window.confirm(`Delete localStorage key "${key}"?`)) {
      localStorage.removeItem(key);
      setRefreshKey(k => k + 1);
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            🛡️ Admin Panel
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            ByteBuddies platform oversight — signed in as <strong>{user?.name}</strong>
          </p>
        </div>
        <button
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: 13 }}
          onClick={() => setRefreshKey(k => k + 1)}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === t.id ? 'var(--accent-primary)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={statBox}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Classes */}
          <Section title="Recent Classes" icon="🏫" action={
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{classes.length} total</span>
          }>
            {classes.length === 0 ? <EmptyState icon="🏫" text="No classes created yet" /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  {['Class Name', 'Subject', 'Grade', 'Students', 'Invite Code', 'Created'].map(h => <th key={h} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {classes.slice(-5).reverse().map(c => (
                    <tr key={c.id}>
                      <td style={td}><strong>{c.name}</strong></td>
                      <td style={td}>{c.subject}</td>
                      <td style={td}>{c.grade}</td>
                      <td style={td}>{c.students?.length || 0}</td>
                      <td style={td}><code style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 4, fontWeight: 700, color: 'var(--accent-primary)' }}>{c.inviteCode}</code></td>
                      <td style={td}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          {/* Recent Assignments */}
          <Section title="Recent Assignments" icon="📋" action={
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{assignments.length} total</span>
          }>
            {assignments.length === 0 ? <EmptyState icon="📋" text="No assignments created yet" /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  {['Title', 'Class', 'Due Date', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {assignments.slice(-5).reverse().map(a => {
                    const cls = classes.find(c => c.id === a.classId);
                    const overdue = a.dueDate && new Date(a.dueDate) < new Date();
                    const upcoming = a.dueDate && new Date(a.dueDate) >= new Date();
                    return (
                      <tr key={a.id}>
                        <td style={td}><strong>{a.title}</strong></td>
                        <td style={td}>{cls?.name || '—'}</td>
                        <td style={td}>{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}</td>
                        <td style={td}>
                          <span style={badge(overdue ? '#ef4444' : upcoming ? '#10b981' : '#6366f1')}>
                            {overdue ? 'Overdue' : upcoming ? 'Active' : 'No date'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Section>
        </>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <Section title="Registered Users" icon="👥">
          {allUsers.length === 0 ? <EmptyState icon="👤" text="No user data found" /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Name', 'Email', 'Role', 'Level', 'XP', 'Streak', 'Joined'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {allUsers.map((u, i) => (
                  <tr key={i}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                          {u.avatarEmoji || u.avatar || '?'}
                        </div>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td style={{ ...td, fontSize: 12, color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                    <td style={td}><span style={badge(u.role === 'teacher' ? '#10b981' : '#6366f1')}>{u.role || 'student'}</span></td>
                    <td style={td}>Lv.{u.level || 1}</td>
                    <td style={td}>{u.xp || 0} XP</td>
                    <td style={td}>🔥 {u.streak || 0}</td>
                    <td style={td}>{u.joinDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {/* Classes Tab */}
      {tab === 'classes' && (
        <Section title="All Classes" icon="🏫" action={
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{classes.length} classes</span>
        }>
          {classes.length === 0 ? <EmptyState icon="🏫" text="No classes created yet" /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Class Name', 'Subject', 'Grade', 'Invite Code', 'Students', 'Assignments', 'Created', ''].map(h => <th key={h} style={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {classes.map(c => (
                  <tr key={c.id}>
                    <td style={td}><strong>{c.name}</strong></td>
                    <td style={td}>{c.subject}</td>
                    <td style={td}>{c.grade}</td>
                    <td style={td}><code style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 4, fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: 2 }}>{c.inviteCode}</code></td>
                    <td style={td}>{c.students?.length || 0}</td>
                    <td style={td}>{assignments.filter(a => a.classId === c.id).length}</td>
                    <td style={{ ...td, fontSize: 12, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={td}>
                      <button onClick={() => deleteClass(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {/* Assignments Tab */}
      {tab === 'assignments' && (
        <Section title="All Assignments" icon="📋" action={
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{assignments.length} assignments</span>
        }>
          {assignments.length === 0 ? <EmptyState icon="📋" text="No assignments created yet" /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Title', 'Class', 'Description', 'Due Date', 'Status', ''].map(h => <th key={h} style={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {assignments.map(a => {
                  const cls = classes.find(c => c.id === a.classId);
                  const overdue = a.dueDate && new Date(a.dueDate) < new Date();
                  const active = a.dueDate && new Date(a.dueDate) >= new Date();
                  return (
                    <tr key={a.id}>
                      <td style={td}><strong>{a.title}</strong></td>
                      <td style={td}>{cls?.name || '—'}</td>
                      <td style={{ ...td, fontSize: 12, color: 'var(--text-muted)', maxWidth: 200 }}>{a.description || '—'}</td>
                      <td style={td}>{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}</td>
                      <td style={td}><span style={badge(overdue ? '#ef4444' : active ? '#10b981' : '#6b7280')}>{overdue ? 'Overdue' : active ? 'Active' : 'No date'}</span></td>
                      <td style={td}>
                        <button onClick={() => deleteAssignment(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {/* System Tab */}
      {tab === 'system' && (
        <>
          <Section title="Platform Info" icon="ℹ️">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {[
                { label: 'Platform', value: 'ByteBuddies' },
                { label: 'Domain', value: 'bytebuddies.technology' },
                { label: 'Server', value: 'Oracle Cloud UAE (Abu Dhabi)' },
                { label: 'Auth', value: 'Firebase / Google OAuth' },
                { label: 'SSL', value: 'Let\'s Encrypt + Cloudflare' },
                { label: 'Build', value: 'React + Vite' },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="localStorage Data" icon="💾">
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>
              All platform data stored in browser localStorage. {lsKeys.length} keys found.
            </p>
            {lsKeys.length === 0 ? <EmptyState icon="💾" text="No platform data found" /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  {['Key', 'Size', 'Preview', ''].map(h => <th key={h} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {lsKeys.map(key => {
                    const val = localStorage.getItem(key) || '';
                    return (
                      <tr key={key}>
                        <td style={td}><code style={{ fontSize: 12 }}>{key}</code></td>
                        <td style={{ ...td, fontSize: 12, color: 'var(--text-muted)' }}>{val.length} chars</td>
                        <td style={{ ...td, fontSize: 11, color: 'var(--text-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {val.slice(0, 80)}{val.length > 80 ? '…' : ''}
                        </td>
                        <td style={td}>
                          <button onClick={() => clearKey(key)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0 }}>Clear</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="Danger Zone" icon="⚠️">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn"
                style={{ padding: '10px 20px', fontSize: 13, background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { if (window.confirm('Delete ALL classes?')) { localStorage.removeItem('bb-classes'); setRefreshKey(k => k + 1); } }}
              >
                🗑️ Clear All Classes
              </button>
              <button
                className="btn"
                style={{ padding: '10px 20px', fontSize: 13, background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { if (window.confirm('Delete ALL assignments?')) { localStorage.removeItem('bb-assignments'); setRefreshKey(k => k + 1); } }}
              >
                🗑️ Clear All Assignments
              </button>
              <button
                className="btn"
                style={{ padding: '10px 20px', fontSize: 13, background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { if (window.confirm('Reset ALL platform data? This cannot be undone.')) { lsKeys.forEach(k => localStorage.removeItem(k)); setRefreshKey(k => k + 1); } }}
              >
                💥 Reset All Platform Data
              </button>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
