import React, { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { courses } from '../data/courseData';
import { scoreToGrade, getCourseCompletion } from '../utils/adaptiveLearning';

export default function ParentDashboard({ onNavigate }) {
  const { user } = useUser();

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weeklyXP = user.weeklyXP || [0, 0, 0, 0, 0, 0, 0];
  const maxXP = Math.max(...weeklyXP, 1);
  const totalWeekXP = weeklyXP.reduce((a, b) => a + b, 0);

  // Compute average quiz score and grade
  const avgScore = useMemo(() => {
    const scores = Object.values(user.quizScores || {});
    if (!scores.length) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [user.quizScores]);

  const gradeInfo = avgScore !== null ? scoreToGrade(avgScore) : null;

  // Course completions
  const courseCompletions = useMemo(() => {
    return courses.map(c => ({
      ...c,
      completion: getCourseCompletion(user.quizScores || {}, c),
    })).filter(c => c.completion > 0);
  }, [user.quizScores]);

  // Time spent (minutes → hours/mins display)
  const timeSpent = user.timeSpent || 0;
  const hours = Math.floor(timeSpent / 60);
  const mins = timeSpent % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Weekly summary sentence
  const summaryParts = [];
  if (totalWeekXP > 0) summaryParts.push(`earned ${totalWeekXP} XP`);
  if (user.completedLessons > 0) summaryParts.push(`completed ${user.completedLessons} lessons`);
  if (user.streak > 1) summaryParts.push(`maintained a ${user.streak}-day streak`);
  const summary = summaryParts.length
    ? `${user.name} has ${summaryParts.join(', ')} this week!`
    : `${user.name} is just getting started — encourage them to code today!`;

  return (
    <div className="page" style={{ maxWidth: 780, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>👨‍👩‍👧 Parent Dashboard</h1>
          <p>A summary of {user.name}'s coding progress</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('dashboard')}>
          ← Back
        </button>
      </div>

      {/* ─── Hero card ─── */}
      <div style={{
        background: 'var(--gradient-primary)', borderRadius: 20, padding: '28px 32px',
        marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center',
      }}>
        <div style={{ fontSize: 64 }}>{user.avatarEmoji || '🧑‍💻'}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{user.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 12 }}>{summary}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Level', value: user.level, icon: '⚡' },
              { label: 'Streak', value: `${user.streak} days`, icon: '🔥' },
              { label: 'Badges', value: user.badges.length, icon: '🏆' },
              { label: 'This week', value: `${totalWeekXP} XP`, icon: '📈' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {gradeInfo && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: gradeInfo.color, lineHeight: 1 }}>{gradeInfo.grade}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 }}>Quiz Average</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{avgScore}%</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* This week's XP chart */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>📅 This Week</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{totalWeekXP} XP total</span>
          </div>
          <div style={{ padding: '12px 16px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {weeklyXP.map((xp, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{xp || ''}</div>
                  <div style={{
                    width: '100%',
                    height: `${Math.max(4, (xp / maxXP) * 60)}px`,
                    background: xp > 0 ? 'var(--gradient-primary)' : 'rgba(99,102,241,0.2)',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.5s ease',
                  }} />
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{dayLabels[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time & activity */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>⏱️ Activity</h3>
          </div>
          <div style={{ padding: 16 }}>
            {[
              { label: 'Time on platform', value: timeLabel || 'Just started', icon: '⏱️' },
              { label: 'Projects created', value: user.projectCount || 0, icon: '💻' },
              { label: 'Lessons completed', value: user.completedLessons || 0, icon: '📚' },
              { label: 'Challenges done', value: user.badges.length, icon: '🏆' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.icon} {s.label}</span>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Progress */}
      {courseCompletions.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>📚 Course Progress</h3>
          </div>
          <div style={{ padding: 16 }}>
            {courseCompletions.map(c => (
              <div key={c.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span>{c.icon} {c.title}</span>
                  <span style={{ fontWeight: 700, color: c.color }}>{c.completion}%</span>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${c.completion}%`, height: '100%', background: c.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Year {c.yearGroup} · {c.difficulty}</div>
              </div>
            ))}
            {courseCompletions.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No courses started yet. Encourage {user.name} to visit the Learning Hub!</p>
            )}
          </div>
        </div>
      )}

      {/* Badges earned */}
      {user.badges.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>🏅 Badges Earned</h3>
          </div>
          <div style={{ padding: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {user.badges.map((badge, i) => (
              <div key={i} style={{
                background: 'var(--gradient-primary)', borderRadius: 20, padding: '6px 14px',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                🏆 {badge}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parent tips */}
      <div className="card" style={{ marginBottom: 24, background: 'rgba(99,102,241,0.06)' }}>
        <div className="card-header">
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>💡 Tips for Supporting Your Child</h3>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Ask your child to show you what they\'ve built — sharing boosts confidence!',
            'Code for 15-20 minutes daily is better than long, infrequent sessions.',
            'Let them struggle a little before helping — problem-solving is the skill.',
            'Celebrate creativity over correctness. A "broken" game they built is amazing!',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>💙</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
