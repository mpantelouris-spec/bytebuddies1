import React, { useMemo, useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useProject } from '../contexts/ProjectContext';
import { achievements, dailyChallenges, leaderboard, courses, dailyQuestTemplates } from '../data/courseData';
import { getWeakModules, buildWhatNextCards } from '../utils/adaptiveLearning';

const CAMPAIGN_META = [
  { id: 'space', title: 'Space Explorer', emoji: '🚀', color: '#6366f1', missions: 5 },
  { id: 'ocean', title: 'Ocean Deep', emoji: '🌊', color: '#0ea5e9', missions: 5 },
  { id: 'city', title: 'City Builder', emoji: '🏙️', color: '#f59e0b', missions: 5 },
  { id: 'cyber', title: 'Cyber Quest', emoji: '⚡', color: '#10b981', missions: 5 },
];

export default function Dashboard({ onNavigate }) {
  const { user, useStreakProtection, incrementQuestProgress } = useUser();
  const { projects } = useProject();

  // Use real weeklyXP from user context, fall back to demo data
  const weeklyXP = useMemo(() => {
    const w = user.weeklyXP || [0,0,0,0,0,0,0];
    const hasData = w.some(v => v > 0);
    return hasData ? w : [120, 250, 80, 300, 150, 420, 180];
  }, [user.weeklyXP]);
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const maxWeeklyXP = Math.max(...weeklyXP, 1);

  // Stable 12-week × 7-day heatmap (0 = none, 1–4 = intensity)
  const heatmap = useMemo(() => [
    [0,1,0,0,2,0,1],[1,0,2,1,0,0,0],[0,2,1,0,1,2,0],[1,1,0,2,0,1,0],
    [0,0,1,0,2,1,0],[1,2,0,1,1,0,2],[0,1,1,0,2,0,1],[2,0,1,2,0,1,0],
    [1,1,0,0,1,2,1],[0,2,1,1,0,0,2],[1,0,2,0,1,1,0],[2,3,1,2,3,1,2],
  ], []);
  const heatColors = ['var(--bg-tertiary)', '#c7d2fe', '#818cf8', '#6366f1', '#4338ca'];

  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);

  // Coding skills from localStorage
  const [cvConcepts, setCvConcepts] = useState({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cv_concepts');
      if (raw) setCvConcepts(JSON.parse(raw));
    } catch {}
  }, []);

  const skillDefs = [
    { key: 'loops',      label: 'Loops',      icon: '🔄', color: '#6366f1' },
    { key: 'conditions', label: 'Conditions', icon: '🔀', color: '#f59e0b' },
    { key: 'variables',  label: 'Variables',  icon: '📦', color: '#22c55e' },
    { key: 'motion',     label: 'Motion',     icon: '🚀', color: '#3b82f6' },
    { key: 'hardware',   label: 'Hardware',   icon: '⚙️',  color: '#a855f7' },
  ];

  const getLevel = (count) => {
    if (count >= 20) return { label: 'Expert',   color: '#f59e0b' };
    if (count >= 10) return { label: 'Builder',  color: '#6366f1' };
    if (count >= 3)  return { label: 'Learner',  color: '#22c55e' };
    return              { label: 'Beginner', color: '#94a3b8' };
  };

  const formatLastActive = (iso) => {
    if (!iso) return 'Never';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return d.toLocaleDateString();
  };

  // Adaptive "What's Next" — review weak modules first
  const whatNext = useMemo(() => {
    const weak = getWeakModules(user.quizScores || {}, courses || []);
    return buildWhatNextCards(weak, user);
  }, [user.quizScores, user.level]);

  // Daily quests — 2 quests seeded from today's date
  const todayQuests = useMemo(() => {
    const templates = dailyQuestTemplates || [];
    const dayIdx = Math.floor(Date.now() / 86400000);
    return templates.filter((_, i) => (dayIdx + i) % 2 === 0).slice(0, 2);
  }, []);

  // Mission progress
  const [missionProgress, setMissionProgress] = useState({});
  useEffect(() => {
    try { setMissionProgress(JSON.parse(localStorage.getItem('bb-mission-progress') || '{}')); } catch {}
  }, []);
  const activeCampaign = CAMPAIGN_META.find(c => {
    const cp = missionProgress[c.id] || { completed: [] };
    return cp.completed.length > 0 && !cp.campaignComplete;
  }) || (!Object.values(missionProgress).some(cp => cp?.completed?.length > 0) ? CAMPAIGN_META[0] : null);

  const earnedAchievements = achievements.filter(a => a.earned);
  const unearnedAchievements = achievements.filter(a => !a.earned);
  const achievementProgress = {
    6:  { progress: 5,  total: 7,  label: '5 of 7 days' },
    7:  { progress: 3,  total: 5,  label: '3 modules done' },
    8:  { progress: 2,  total: 5,  label: '2 collabs' },
    9:  { progress: 67, total: 100, label: '67 likes total' },
    10: { progress: 2,  total: 3,  label: '2 languages used' },
    11: { progress: 12, total: 25, label: '12 / 25 projects' },
    12: { progress: 7,  total: 50, label: 'Level 7 / 50' },
  };

  return (
    <div className="page">
      {/* ─── Hero ─── */}
      <div style={{
        background: 'var(--gradient-primary)',
        borderRadius: 20,
        padding: '30px 36px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position:'absolute', top:-50, right:220, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-70, right:80, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />

        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <h1 style={{ color:'white', fontSize:26, fontWeight:800 }}>Welcome back, {user.name}! 👋</h1>
            {user.streak >= 3 && (
              <span style={{ background:'rgba(251,191,36,0.2)', border:'1px solid rgba(251,191,36,0.45)', color:'#fbbf24', padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>🔥 ON FIRE · {user.streak} days</span>
            )}
          </div>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, marginBottom:18 }}>
            You've earned <strong style={{color:'#fbbf24'}}>{user.xp.toLocaleString()} XP</strong> — only {(user.xpToNext - user.xp).toLocaleString()} more to Level {user.level + 1}!
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn" style={{ background:'white', color:'#6366f1', fontWeight:700 }} onClick={() => onNavigate('workspace')}>💻 Open Workspace</button>
            <button className="btn" style={{ background:'rgba(255,255,255,0.18)', color:'white', border:'1px solid rgba(255,255,255,0.3)' }} onClick={() => onNavigate('learn')}>📚 Continue Learning</button>
          </div>
        </div>

        {/* Circular XP ring */}
        <div style={{ textAlign:'center', flexShrink:0 }}>
          <div style={{ position:'relative', width:110, height:110 }}>
            <svg width="110" height="110" style={{ transform:'rotate(-90deg)', position:'absolute', inset:0 }}>
              <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <circle cx="55" cy="55" r="46" fill="none" stroke="#fbbf24" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - xpPercent / 100)}`}
              />
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ color:'white', fontWeight:800, fontSize:20, lineHeight:1.1 }}>Lv {user.level}</div>
              <div style={{ color:'rgba(255,255,255,0.65)', fontSize:11, marginTop:2 }}>{xpPercent}%</div>
            </div>
          </div>
          <div style={{ color:'rgba(255,255,255,0.65)', fontSize:11, marginTop:6 }}>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</div>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-4" style={{ gap:16, marginBottom:24 }}>
        {[
          { value: user.level,            label: 'Level',        trend: '▲ 1 this week', color: '#6366f1' },
          { value: user.projectCount,     label: 'Projects',     trend: '▲ 2 this week', color: '#22c55e' },
          { value: user.completedLessons, label: 'Lessons Done', trend: '3 in progress', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>{s.trend}</div>
          </div>
        ))}
        {/* Streak card with protection mechanic */}
        <div className="stat-card" style={{ position:'relative' }}>
          <div className="stat-card-value" style={{ color:'#ef4444' }}>🔥 {user.streak}</div>
          <div className="stat-card-label">Day Streak</div>
          {user.streakProtected ? (
            <div style={{ fontSize:10, color:'#10b981', marginTop:4, fontWeight:700 }}>🛡️ Protected!</div>
          ) : (
            <button
              style={{ marginTop:6, fontSize:10, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:6, padding:'2px 8px', color:'var(--accent-primary)', cursor:'pointer', fontWeight:600 }}
              onClick={useStreakProtection}
              title="Spend 50 XP to protect your streak for today"
            >
              🛡️ Protect (-50 XP)
            </button>
          )}
        </div>
      </div>

      {/* ─── Mission Mode Banner ─── */}
      {activeCampaign && (
        <div style={{
          background: `linear-gradient(135deg, ${activeCampaign.color}18, ${activeCampaign.color}08)`,
          border: `1px solid ${activeCampaign.color}40`,
          borderRadius: 16, padding: '18px 24px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 36, flexShrink: 0 }}>{activeCampaign.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: activeCampaign.color, textTransform: 'uppercase', letterSpacing: 1 }}>Active Mission</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>{activeCampaign.title} Campaign</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array(activeCampaign.missions).fill(0).map((_, i) => (
                <div key={i} style={{ width: 32, height: 4, borderRadius: 2, background: i < (missionProgress[activeCampaign.id]?.completed?.length || 0) ? activeCampaign.color : 'var(--bg-tertiary)' }} />
              ))}
            </div>
          </div>
          <button
            className="btn"
            style={{ background: activeCampaign.color, color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 700, flexShrink: 0 }}
            onClick={() => onNavigate('missions')}
          >
            {(missionProgress[activeCampaign.id]?.completed?.length || 0) === 0 ? '🚀 Start Mission' : '▶ Continue'}
          </button>
        </div>
      )}

      {/* ─── Coding Skills ─── */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-header">
          <h3 style={{ fontSize:15, fontWeight:700 }}>🧠 My Coding Skills</h3>
          <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--text-muted)' }}>
            <span>Programs Run: <strong style={{ color:'var(--text-primary)' }}>{cvConcepts.totalRuns || 0}</strong></span>
            <span>Last Active: <strong style={{ color:'var(--text-primary)' }}>{formatLastActive(cvConcepts.lastRun)}</strong></span>
          </div>
        </div>
        <div style={{ padding:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
            {skillDefs.map(skill => {
              const count = cvConcepts[skill.key] || 0;
              const pct = Math.min(100, Math.round((count / 20) * 100));
              const lvl = getLevel(count);
              return (
                <div key={skill.key} style={{ padding:14, background:'var(--bg-tertiary)', borderRadius:12, border:`1px solid var(--border-color)`, textAlign:'center' }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>{skill.icon}</div>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{skill.label}</div>
                  <div style={{ width:'100%', height:6, background:'var(--bg-secondary)', borderRadius:3, marginBottom:6, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:skill.color, borderRadius:3, transition:'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4 }}>{count} uses</div>
                  <span style={{ fontSize:10, fontWeight:700, color:lvl.color, background:`${lvl.color}18`, padding:'2px 8px', borderRadius:20 }}>{lvl.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Your Week: XP chart + Activity heatmap ─── */}
      <div style={{ display:'flex', gap:20, marginBottom:24 }}>
        {/* weekly bar chart */}
        <div className="card" style={{ flex:1 }}>
          <div className="card-header">
            <h3 style={{ fontSize:15, fontWeight:700 }}>📈 This Week's XP</h3>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{weeklyXP.reduce((a,b)=>a+b,0).toLocaleString()} XP total</span>
          </div>
          <div style={{ padding:'12px 16px 16px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
              {weeklyXP.map((xp, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ fontSize:9, color:'var(--text-muted)', lineHeight:1 }}>{xp}</div>
                  <div style={{
                    width:'100%',
                    height: `${Math.max(4, (xp / maxWeeklyXP) * 54)}px`,
                    background: i === 6 ? 'var(--gradient-primary)' : 'rgba(99,102,241,0.55)',
                    borderRadius:'4px 4px 0 0',
                    transition:'height 0.5s ease',
                  }} />
                  <div style={{ fontSize:9, color:'var(--text-muted)' }}>{dayLabels[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* activity heatmap */}
        <div className="card" style={{ flex:1.6 }}>
          <div className="card-header">
            <h3 style={{ fontSize:15, fontWeight:700 }}>🗓️ Coding Activity</h3>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Last 12 weeks</span>
          </div>
          <div style={{ padding:'10px 16px 16px' }}>
            <div style={{ display:'flex', gap:3 }}>
              {heatmap.map((week, w) => (
                <div key={w} style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  {week.map((lvl, d) => (
                    <div key={d} title={lvl === 0 ? 'No activity' : `~${lvl * 60}+ XP earned`} style={{ width:13, height:13, borderRadius:2, background:heatColors[lvl], cursor:'default' }} />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
              <span style={{ fontSize:10, color:'var(--text-muted)' }}>Less</span>
              {heatColors.map((c, i) => (
                <div key={i} style={{ width:10, height:10, borderRadius:2, background:c }} />
              ))}
              <span style={{ fontSize:10, color:'var(--text-muted)' }}>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── What's Next ─── */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-header">
          <h3 style={{ fontSize:15, fontWeight:700 }}>🚀 What's Next For You</h3>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>Personalised for Level {user.level}</span>
        </div>
        <div style={{ padding:16, display:'flex', gap:14, flexWrap:'wrap' }}>
          {whatNext.map((item, i) => (
            <button key={item.id || i} style={{
              flex:'1 1 160px', background: item.urgent ? 'rgba(245,158,11,0.06)' : 'var(--bg-tertiary)',
              border:`1px solid ${item.urgent ? '#f59e0b55' : 'var(--border-color)'}`,
              borderRadius:12, padding:14, cursor:'pointer', textAlign:'left', color:'var(--text-primary)',
              transition:'all 0.18s', position:'relative',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=item.color; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 20px ${item.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=item.urgent?'#f59e0b55':'var(--border-color)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
              onClick={() => onNavigate(item.action)}
            >
              {item.urgent && <span style={{ position:'absolute', top:8, right:8, fontSize:9, fontWeight:700, background:'#f59e0b', color:'#000', borderRadius:6, padding:'1px 5px' }}>REVIEW</span>}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:22 }}>{item.icon}</span>
                {item.badge && <span style={{ fontSize:10, fontWeight:700, color:item.color }}>{item.badge}</span>}
              </div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>{item.title}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{item.desc || item.sub}</div>
              <div style={{ marginTop:10, fontSize:12, color:item.color, fontWeight:600 }}>Go →</div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Daily Challenges ─── */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-header">
          <h3 style={{ fontSize:15, fontWeight:700 }}>⚡ Daily Challenges</h3>
          <span className="tag tag-warning">Resets in 6h</span>
        </div>
        <div style={{ padding:16, display:'flex', gap:14 }}>
          {dailyChallenges.map(ch => (
            <div key={ch.id} style={{ flex:1, padding:14, background: ch.completed ? 'rgba(16,185,129,0.08)' : 'var(--bg-tertiary)', borderRadius:10, border:`1px solid ${ch.completed ? 'var(--accent-success)' : 'var(--border-color)'}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{ch.title}</div>
                <div style={{ display:'flex', gap:8, fontSize:11, color:'var(--text-muted)' }}>
                  <span className={`tag ${ch.difficulty === 'Easy' ? 'tag-success' : ch.difficulty === 'Medium' ? 'tag-warning' : 'tag-danger'}`}>{ch.difficulty}</span>
                  <span>{ch.language}</span>
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
                {ch.completed ? (
                  <span style={{ color:'var(--accent-success)', fontWeight:700 }}>✅ Done</span>
                ) : (
                  <>
                    <div style={{ color:'var(--accent-warning)', fontWeight:700, fontSize:14 }}>+{ch.xp} XP</div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop:4 }} onClick={() => onNavigate('workspace')}>Start</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Daily Quests ─── */}
      {todayQuests.length > 0 && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-header">
            <h3 style={{ fontSize:15, fontWeight:700 }}>🎯 Daily Quests</h3>
            <span className="tag tag-primary">Resets at midnight</span>
          </div>
          <div style={{ padding:16, display:'flex', gap:14, flexWrap:'wrap' }}>
            {todayQuests.map(quest => {
              const progress = user.questProgress?.[quest.id] || 0;
              const done = user.dailyQuestsCompleted?.includes(quest.id);
              const pct = Math.min(100, Math.round((progress / quest.goal) * 100));
              return (
                <div key={quest.id} style={{
                  flex:'1 1 200px', padding:14, background: done ? 'rgba(16,185,129,0.08)' : 'var(--bg-tertiary)',
                  borderRadius:10, border:`1px solid ${done ? 'var(--accent-success)' : 'var(--border-color)'}`,
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{quest.title}</div>
                    <span style={{ color:'var(--accent-warning)', fontWeight:700, fontSize:12 }}>+{quest.xp} XP</span>
                  </div>
                  <div style={{ background:'var(--bg-secondary)', borderRadius:4, height:6, overflow:'hidden' }}>
                    <div style={{ width:`${done ? 100 : pct}%`, height:'100%', background: done ? 'var(--accent-success)' : 'var(--accent-primary)', transition:'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>
                    {done ? '✅ Complete!' : `${progress} / ${quest.goal}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Leaderboard ─── */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-header">
          <h3 style={{ fontSize:15, fontWeight:700 }}>🏆 Weekly Leaderboard</h3>
          <span className="tag tag-primary">Global</span>
        </div>
        <div>
          {leaderboard.slice(0, 7).map(entry => (
            <div key={entry.rank} className="leaderboard-row" style={{ background: entry.isUser ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
              <span className={`leaderboard-rank ${entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? 'bronze' : ''}`}>
                {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : `#${entry.rank}`}
              </span>
              <div className="avatar avatar-sm" style={{ background: entry.isUser ? 'var(--gradient-accent)' : 'var(--gradient-primary)' }}>{entry.avatar}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{entry.name} {entry.isUser && <span style={{ color:'var(--accent-primary)' }}>(You)</span>}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Lv.{entry.level} · {entry.badges} badges</div>
              </div>
              <div style={{ fontWeight:700, fontSize:13, color:'var(--accent-warning)' }}>{entry.xp.toLocaleString()} XP</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Achievements ─── */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-header">
          <h3 style={{ fontSize:15, fontWeight:700 }}>🏅 Achievements</h3>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{earnedAchievements.length}/{achievements.length} earned</span>
            <div style={{ width:80, height:6, background:'var(--bg-tertiary)', borderRadius:3 }}>
              <div style={{ width:`${(earnedAchievements.length/achievements.length)*100}%`, height:'100%', background:'var(--gradient-primary)', borderRadius:3 }} />
            </div>
          </div>
        </div>
        <div style={{ padding:16 }}>
          {/* Earned badges */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>✅ Earned</div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {earnedAchievements.map(badge => (
                <div key={badge.id} title={badge.desc} style={{ textAlign:'center', padding:'12px 14px', background:'var(--bg-tertiary)', borderRadius:12, border:'2px solid var(--accent-primary)', minWidth:76 }}>
                  <div style={{ fontSize:30 }}>{badge.icon}</div>
                  <div style={{ fontSize:11, fontWeight:600, marginTop:4 }}>{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
          {/* In-progress badges */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>🔒 In Progress</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {unearnedAchievements.map(badge => {
                const prog = achievementProgress[badge.id];
                const pct = prog ? Math.round((prog.progress / prog.total) * 100) : 0;
                return (
                  <div key={badge.id} style={{ padding:14, background:'var(--bg-primary)', borderRadius:12, border:'1px solid var(--border-color)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <span style={{ fontSize:22 }}>{badge.icon}</span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600 }}>{badge.name}</div>
                        <div style={{ fontSize:10, color:'var(--text-muted)' }}>{badge.desc}</div>
                      </div>
                    </div>
                    <div style={{ width:'100%', height:5, background:'var(--bg-tertiary)', borderRadius:3 }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:'var(--gradient-primary)', borderRadius:3 }} />
                    </div>
                    {prog && <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>{prog.label} · {pct}%</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Projects ─── */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize:15, fontWeight:700 }}>📁 Recent Projects</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('workspace')}>View All</button>
        </div>
        <div style={{ padding:16 }}>
          <div className="grid grid-3" style={{ gap:16 }}>
            {projects.slice(0, 3).map(p => (
              <div key={p.id} className="project-card" onClick={() => onNavigate('workspace')}>
                <div className="project-card-preview" style={{ height:100 }}>
                  <span style={{ fontSize:36 }}>{p.type === 'game' ? '🎮' : p.type === 'website' ? '🌐' : '📱'}</span>
                </div>
                <div className="project-card-info">
                  <h4>{p.name}</h4>
                  <div className="project-card-meta">
                    <span>{p.language}</span>
                    <span>Modified {p.modified}</span>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🚀</div>
                <div style={{ fontWeight:600, marginBottom:8 }}>No projects yet!</div>
                <button className="btn btn-primary" onClick={() => onNavigate('workspace')}>Create your first project</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
