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
