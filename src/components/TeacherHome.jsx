import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getAllUsers } from '../firebase';

const card = {
  background: 'var(--bg-secondary)',
  borderRadius: 16,
  border: '1px solid var(--border-color)',
  padding: 24,
};

const statBox = {
  background: 'var(--bg-secondary)',
  borderRadius: 16,
  border: '1px solid var(--border-color)',
  padding: 20,
  textAlign: 'center',
  flex: 1,
  minWidth: 130,
};

export default function TeacherHome({ onNavigate }) {
  const { user } = useUser();
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [showGClassroom, setShowGClassroom] = useState(false);

  useEffect(() => {
    const cls = JSON.parse(localStorage.getItem('bb-classes') || '[]');
    const asgn = JSON.parse(localStorage.getItem('bb-assignments') || '[]');
    setClasses(cls);
    setAssignments(asgn);
    setStudentCount(cls.reduce((sum, c) => sum + (c.students?.length || 0), 0));
  }, []);

  const now = new Date();
  const upcoming = assignments
    .filter(a => a.dueDate && new Date(a.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);
  const overdue = assignments.filter(a => a.dueDate && new Date(a.dueDate) < now).length;

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { label: 'Classes', value: classes.length, icon: '🏫', color: '#6366f1', page: 'classroom' },
    { label: 'Students', value: studentCount, icon: '👥', color: '#10b981', page: 'classroom' },
    { label: 'Assignments', value: assignments.length, icon: '📋', color: '#f59e0b', page: 'classroom' },
    { label: 'Overdue', value: overdue, icon: '⚠️', color: overdue > 0 ? '#ef4444' : '#6b7280', page: 'classroom' },
  ];

  const quickActions = [
    {
      icon: '🏫',
      title: 'Manage Classes',
      desc: 'View students, assignments and invite codes for your classes',
      color: '#6366f1',
      page: 'classroom',
    },
    {
      icon: '🎮',
      title: 'Game Builder',
      desc: 'Open the block coding environment — great for demo lessons',
      color: '#10b981',
      page: 'gamebuilder',
    },
    {
      icon: '📚',
      title: 'Learning Hub',
      desc: 'Browse lessons and courses available to your students',
      color: '#f59e0b',
      page: 'learn',
    },
    {
      icon: '👥',
      title: 'Community',
      desc: 'See what students are building and sharing',
      color: '#3b82f6',
      page: 'community',
    },
    {
      icon: '⚙️',
      title: 'Settings',
      desc: 'Update your profile, theme and preferences',
      color: '#8b5cf6',
      page: 'settings',
    },
    {
      icon: '🛡️',
      title: 'Admin Panel',
      desc: 'Platform-wide overview — all users and classes',
      color: '#ef4444',
      page: 'admin',
    },
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            {greeting()}, {user.name}!
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Here's a snapshot of your ByteBuddies classroom today.
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600 }}
          onClick={() => onNavigate('classroom')}
        >
          Go to Classroom →
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {stats.map(s => (
          <button
            key={s.label}
            style={{ ...statBox, cursor: 'pointer', transition: 'transform 0.15s', border: '1px solid var(--border-color)' }}
            onClick={() => onNavigate(s.page)}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Upcoming Assignments */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Upcoming Assignments
          </h2>
          <button
            style={{ fontSize: 13, color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => onNavigate('classroom')}
          >
            View all →
          </button>
        </div>
        {upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <p style={{ fontSize: 13, margin: 0 }}>
              {assignments.length === 0
                ? 'No assignments yet. Head to Classroom to create one.'
                : 'No upcoming deadlines.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map(a => {
              const cls = classes.find(c => c.id === a.classId);
              const daysLeft = Math.ceil((new Date(a.dueDate) - now) / (1000 * 60 * 60 * 24));
              const urgent = daysLeft <= 2;
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 20 }}>{a.assignType === 'blocks' ? '🧩' : '💻'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{cls?.name || '—'}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: urgent ? '#f59e0b' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft} days`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Google Classroom Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(66,133,244,0.12), rgba(66,133,244,0.06))', border: '1px solid rgba(66,133,244,0.25)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setShowGClassroom(true)}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(66,133,244,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#4285F4"/>
            <rect x="10" y="14" width="28" height="20" rx="2" fill="white"/>
            <rect x="16" y="20" width="16" height="8" rx="1" fill="#4285F4"/>
            <circle cx="24" cy="24" r="3" fill="white"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>Connect Google Classroom</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Import your class roster automatically — no invite codes needed for students</div>
        </div>
        <button style={{ padding: '9px 20px', background: '#4285F4', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
          Connect →
        </button>
      </div>

      {/* Google Classroom Modal */}
      {showGClassroom && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowGClassroom(false)}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 20, width: '100%', maxWidth: 440, border: '1px solid var(--border-color)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(66,133,244,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="10" fill="#4285F4"/><rect x="10" y="14" width="28" height="20" rx="2" fill="white"/><rect x="16" y="20" width="16" height="8" rx="1" fill="#4285F4"/><circle cx="24" cy="24" r="3" fill="white"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Google Classroom Sync</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Import your class roster automatically</div>
              </div>
              <button onClick={() => setShowGClassroom(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#4285F4', fontWeight: 600, marginBottom: 8 }}>How it works</div>
              {['Sign in with your school Google account', 'Select which Classroom class to import', 'Students are added automatically — no invite codes needed', 'Assignments sync back to Google Classroom'].map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#4285F4', fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>{s}
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#f59e0b' }}>
              Available on the School plan — contact us to activate for your school.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowGClassroom(false)} style={{ flex: 1, padding: '11px', background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>Close</button>
              <button onClick={() => { alert('Email us at hello@bytebuddies.io to activate Google Classroom for your school.'); setShowGClassroom(false); }} style={{ flex: 1, padding: '11px', background: '#4285F4', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Contact Us →</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Quick Navigation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {quickActions.map(action => (
            <button
              key={action.title}
              onClick={() => onNavigate(action.page)}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 14,
                border: '1px solid var(--border-color)',
                padding: '18px 20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'transform 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = action.color + '60'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{action.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{action.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Classes summary */}
      {classes.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Your Classes</h2>
            <button
              style={{ fontSize: 13, color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => onNavigate('classroom')}
            >
              Manage →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {classes.map(cls => (
              <div
                key={cls.id}
                style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-color)', cursor: 'pointer' }}
                onClick={() => onNavigate('classroom')}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{cls.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{cls.subject} · {cls.grade}</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>👥 {cls.students?.length || 0}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📋 {assignments.filter(a => a.classId === cls.id).length}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: 1 }}>{cls.inviteCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
