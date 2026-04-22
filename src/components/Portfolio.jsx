import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useProject } from '../contexts/ProjectContext';
import { achievements } from '../data/courseData';

const CAMPAIGNS = [
  { id: 'space', title: 'Space Explorer', emoji: '🚀', color: '#6366f1' },
  { id: 'ocean', title: 'Ocean Deep', emoji: '🌊', color: '#0ea5e9' },
  { id: 'city', title: 'City Builder', emoji: '🏙️', color: '#f59e0b' },
  { id: 'cyber', title: 'Cyber Quest', emoji: '⚡', color: '#10b981' },
];

export default function Portfolio({ onNavigate }) {
  const { user } = useUser();
  const { projects } = useProject();
  const [missionProgress, setMissionProgress] = useState({});
  const [tab, setTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setMissionProgress(JSON.parse(localStorage.getItem('bb-mission-progress') || '{}'));
    } catch {}
  }, []);

  const totalMissionsDone = CAMPAIGNS.reduce((sum, c) => sum + (missionProgress[c.id]?.completed?.length || 0), 0);
  const completedCampaigns = CAMPAIGNS.filter(c => missionProgress[c.id]?.campaignComplete).length;
  const earnedBadges = achievements.filter(a => a.earned);

  const shareUrl = `${window.location.origin}#portfolio`;
  const copyShareLink = () => {
    navigator.clipboard.writeText(`Check out my ByteBuddies profile! I'm Level ${user.level} with ${user.xp.toLocaleString()} XP 🚀 ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const skillDefs = [
    { key: 'loops', label: 'Loops', icon: '🔄', color: '#6366f1' },
    { key: 'conditions', label: 'Conditions', icon: '🔀', color: '#f59e0b' },
    { key: 'variables', label: 'Variables', icon: '📦', color: '#22c55e' },
    { key: 'motion', label: 'Motion', icon: '🚀', color: '#3b82f6' },
    { key: 'hardware', label: 'Hardware', icon: '⚙️', color: '#a855f7' },
  ];
  const [cvConcepts, setCvConcepts] = useState({});
  useEffect(() => {
    try { const r = localStorage.getItem('cv_concepts'); if (r) setCvConcepts(JSON.parse(r)); } catch {}
  }, []);

  const xpPct = Math.round((user.xp / user.xpToNext) * 100);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'missions', label: 'Missions', icon: '🗺️' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'badges', label: 'Badges', icon: '🏅' },
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: 960, margin: '0 auto' }}>

      {/* Hero card */}
      <div style={{
        background: 'var(--gradient-primary)',
        borderRadius: 24,
        padding: '32px 36px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 120, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 42, flexShrink: 0,
          }}>
            {user.avatarEmoji || '🧑‍💻'}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 4px' }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#fff', fontWeight: 700 }}>
                {user.role === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student'}
              </span>
              {user.streak >= 3 && (
                <span style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>
                  🔥 {user.streak} day streak
                </span>
              )}
              {completedCampaigns > 0 && (
                <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#10b981', fontWeight: 700 }}>
                  🏆 {completedCampaigns} campaign{completedCampaigns > 1 ? 's' : ''} complete
                </span>
              )}
            </div>

            {/* XP bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>Level {user.level}</span>
              <div style={{ flex: 1, maxWidth: 200, height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${xpPct}%`, height: '100%', background: '#fbbf24', borderRadius: 4, transition: 'width 0.8s ease' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={copyShareLink}
            style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0 }}
          >
            {copied ? '✅ Copied!' : '🔗 Share Profile'}
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 32, marginTop: 24, flexWrap: 'wrap', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          {[
            { val: user.xp.toLocaleString(), label: 'Total XP' },
            { val: earnedBadges.length, label: 'Badges' },
            { val: projects.length, label: 'Projects' },
            { val: totalMissionsDone, label: 'Missions Done' },
            { val: user.completedLessons || 0, label: 'Lessons' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, border: '1px solid var(--border-color)', marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: tab === t.id ? 'var(--accent-primary)' : 'transparent',
            color: tab === t.id ? '#fff' : 'var(--text-secondary)',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Coding skills */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>🧠 Coding Skills</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {skillDefs.map(skill => {
                const count = cvConcepts[skill.key] || 0;
                const pct = Math.min(100, Math.round((count / 20) * 100));
                return (
                  <div key={skill.key} style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{skill.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{skill.label}</div>
                    <div style={{ width: '100%', height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: skill.color, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{count} uses</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { icon: '🔥', label: 'Current Streak', value: `${user.streak} days`, color: '#ef4444' },
              { icon: '⭐', label: 'XP This Level', value: `${user.xp} / ${user.xpToNext}`, color: '#f59e0b' },
              { icon: '🗓️', label: 'Joined', value: user.joinDate || 'Today', color: '#6366f1' },
              { icon: '🎮', label: 'Campaigns Done', value: `${completedCampaigns} / 4`, color: '#10b981' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border-color)', padding: '18px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MISSIONS */}
      {tab === 'missions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {CAMPAIGNS.map(camp => {
            const cp = missionProgress[camp.id] || { completed: [] };
            const pct = Math.round((cp.completed.length / 5) * 100);
            return (
              <div key={camp.id} style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ fontSize: 36, flexShrink: 0 }}>{camp.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{camp.title}</div>
                    {cp.campaignComplete && <span style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>🏆 Complete</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < cp.completed.length ? camp.color : 'var(--bg-primary)' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cp.completed.length}/5 missions · {pct}%</div>
                </div>
                <button onClick={() => onNavigate('missions')} style={{ padding: '8px 16px', background: 'none', border: `1px solid ${camp.color}60`, borderRadius: 8, color: camp.color, cursor: 'pointer', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                  {pct === 100 ? 'Replay' : pct === 0 ? 'Start' : 'Continue'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* PROJECTS */}
      {tab === 'projects' && (
        <div>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
              <p style={{ fontSize: 14, margin: '0 0 20px' }}>No projects yet.</p>
              <button className="btn btn-primary" onClick={() => onNavigate('workspace')}>Create your first project</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {projects.map(p => (
                <div key={p.id} onClick={() => onNavigate('workspace')} style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ height: 100, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                    {p.type === 'game' ? '🎮' : p.type === 'website' ? '🌐' : '📱'}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.language} · {p.modified}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BADGES */}
      {tab === 'badges' && (
        <div>
          {earnedBadges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
              <p style={{ fontSize: 14, margin: '0 0 20px' }}>No badges yet — complete challenges and missions to earn them!</p>
              <button className="btn btn-primary" onClick={() => onNavigate('missions')}>Start a Mission</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
              {earnedBadges.map(badge => (
                <div key={badge.id} title={badge.desc} style={{ textAlign: 'center', padding: '20px 14px', background: 'var(--bg-secondary)', borderRadius: 14, border: '2px solid var(--accent-primary)' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{badge.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{badge.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
