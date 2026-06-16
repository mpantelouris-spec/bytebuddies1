/**
 * ChallengesPage.jsx — 120 STEM tracks + 60 epic bonus courses
 */
import React, { useState, useMemo } from 'react';
import {
  ROBOT_TRACKS, BONUS_COURSES, ALL_COURSES_CATALOG,
  COURSE_LENGTHS, TRACK_CATEGORIES, LEVELS_PER_TRACK,
} from '../data/robot-tracks.js';
import { GameProgress, fmtTime, fmtDist, LVL_THRESH } from '../services/game-progress.js';

function loadRobotName() {
  try {
    return JSON.parse(localStorage.getItem('bb-studio-robot') || '{}').name || 'Robot';
  } catch { return 'Robot'; }
}

function LengthBadge({ length }) {
  const cfg = COURSE_LENGTHS[length] || COURSE_LENGTHS.medium;
  return (
    <span style={{ fontSize: 9, fontWeight: 800, color: cfg.color, background: `${cfg.color}18`, borderRadius: 5, padding: '2px 7px' }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function LevelCard({ level, track, robotName, onStart, compact }) {
  const completed = level.isBonus
    ? GameProgress.isCourseCompleted(robotName, level.id)
    : GameProgress.isTrackLevelCompleted(robotName, track?.id || level.trackId, level.level);
  const best = level.isBonus
    ? GameProgress.getBest(robotName, level.id)
    : GameProgress.getTrackBest(robotName, track?.id || level.trackId, level.level);
  const color = level.color || track?.color || '#7c3aed';

  return (
    <div style={{
      background: completed ? `${color}14` : '#fff',
      border: `1.5px solid ${completed ? color : '#e5e7eb'}`,
      borderRadius: compact ? 10 : 12, padding: compact ? '10px 12px' : '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {!level.isBonus && (
          <span style={{ fontSize: 9, fontWeight: 800, color, background: `${color}22`, borderRadius: 5, padding: '2px 7px' }}>
            L{level.level}
          </span>
        )}
        <LengthBadge length={level.length} />
        {completed && <span style={{ fontSize: 10, color, fontWeight: 800, marginLeft: 'auto' }}>✓ Done</span>}
      </div>
      <div style={{ fontSize: compact ? 12 : 13, fontWeight: 900, color: '#111', lineHeight: 1.25 }}>
        {level.icon || track?.icon} {level.name}
      </div>
      {!compact && <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.4 }}>{level.desc}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
        <span>📏 {fmtDist(level.totalDist)}</span>
        {level.checkpoints > 0 && <span>📍 {level.checkpoints} CP</span>}
        {level.timeLimit > 0 && <span>⏱ {fmtTime(level.timeLimit)}</span>}
        <span>~{level.estMinutes || Math.ceil(level.totalDist / 12)} min</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: 10 }}>+{level.xpReward} XP</span>
        {best > 0 && <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 10 }}>Best: {best}</span>}
      </div>
      <button
        onClick={() => onStart({ ...level, trackName: track?.name || level.name, trackIcon: track?.icon || level.icon, trackColor: color })}
        style={{
          marginTop: 6, width: '100%', padding: '8px 0', borderRadius: 8, border: 'none',
          background: `linear-gradient(135deg, ${color}, ${color}bb)`,
          color: '#fff', fontWeight: 800, fontSize: 11, cursor: 'pointer',
        }}
      >
        ▶ {completed ? 'Play Again' : 'Start Course'}
      </button>
    </div>
  );
}

export default function ChallengesPage({ onStartChallenge, robotName: robotNameProp }) {
  const robotName = robotNameProp || loadRobotName();
  const [tab, setTab] = useState('tracks');
  const [selectedTrack, setSelectedTrack] = useState(ROBOT_TRACKS[0].id);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [lenFilter, setLenFilter] = useState('all');

  const prog = useMemo(() => GameProgress.get(robotName), [robotName]);
  const xp = prog.xp || 0;
  const lvl = GameProgress.level(xp);
  const totalDone = GameProgress.getTotalCompletedLevels(robotName);
  const badges = GameProgress.getBadges(robotName);
  const leaderboard = GameProgress.getPersonalLeaderboard(robotName);

  const track = ROBOT_TRACKS.find(t => t.id === selectedTrack) || ROBOT_TRACKS[0];
  const trackPct = GameProgress.getTrackCompletionPct(robotName, track.id);

  const filteredBonus = useMemo(() => {
    let list = BONUS_COURSES;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
    }
    if (lenFilter !== 'all') list = list.filter(c => c.length === lenFilter);
    return list;
  }, [search, lenFilter]);

  const filteredAll = useMemo(() => {
    let list = ALL_COURSES_CATALOG;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || (c.trackName || '').toLowerCase().includes(q));
    }
    if (catFilter !== 'all') list = list.filter(c => c.category === catFilter);
    if (lenFilter !== 'all') list = list.filter(c => c.length === lenFilter);
    return list;
  }, [search, catFilter, lenFilter]);

  const nextXp = LVL_THRESH[lvl] ?? Infinity;
  const prevXp = LVL_THRESH[lvl - 1] || 0;
  const xpPct = nextXp === Infinity ? 100 : Math.min(100, ((xp - prevXp) / (nextXp - prevXp)) * 100);

  const TABS = [
    { id: 'tracks', label: '🏁 STEM Tracks', count: ROBOT_TRACKS.length * LEVELS_PER_TRACK },
    { id: 'bonus', label: '🔥 Epic Bonus', count: BONUS_COURSES.length },
    { id: 'all', label: '📚 All Courses', count: ALL_COURSES_CATALOG.length },
  ];

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#111' }}>🏆 Course Library</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {ALL_COURSES_CATALOG.length} courses · up to 82 m · 12 tracks × 10 levels
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Level {lvl} · {xp.toLocaleString()} XP</div>
              <div style={{ width: 130, height: 6, background: '#e5e7eb', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ background: '#7c3aed15', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#7c3aed' }}>{totalDone}</div>
              <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>COMPLETED</div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11,
              background: tab === t.id ? '#7c3aed' : '#f3f4f6', color: tab === t.id ? '#fff' : '#6b7280',
            }}>
              {t.label} <span style={{ opacity: 0.8 }}>({t.count})</span>
            </button>
          ))}
        </div>
        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses…"
            style={{ flex: 1, minWidth: 160, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          {tab !== 'bonus' && (
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 11 }}>
              <option value="all">All categories</option>
              {Object.entries(TRACK_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          )}
          <select value={lenFilter} onChange={e => setLenFilter(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 11 }}>
            <option value="all">All lengths</option>
            {Object.entries(COURSE_LENGTHS).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: tab === 'tracks' ? '260px 1fr 240px' : '1fr 240px', gap: 14, padding: 14, minHeight: 0, overflow: 'hidden' }}>
        {/* Track sidebar (tracks tab only) */}
        {tab === 'tracks' && (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ROBOT_TRACKS.map(t => {
              const pct = GameProgress.getTrackCompletionPct(robotName, t.id);
              const sel = selectedTrack === t.id;
              const cat = TRACK_CATEGORIES[t.category] || {};
              return (
                <button key={t.id} onClick={() => setSelectedTrack(t.id)} style={{
                  textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: sel ? `${t.color}18` : '#fff', outline: sel ? `2px solid ${t.color}` : '1px solid #e5e7eb',
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 22 }}>{t.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#111' }}>{t.name}</div>
                      <div style={{ fontSize: 9, color: cat.color }}>{cat.icon} {cat.label} · {LEVELS_PER_TRACK} levels</div>
                      <div style={{ marginTop: 4, height: 3, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: t.color }} />
                      </div>
                      <div style={{ fontSize: 9, color: '#9ca3af' }}>{pct}% complete</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Main content */}
        <div style={{ overflowY: 'auto', minHeight: 0 }}>
          {tab === 'tracks' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 40 }}>{track.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: track.color }}>{track.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 1.45 }}>{track.desc}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                    {track.skills.map(s => (
                      <span key={s} style={{ fontSize: 9, background: `${track.color}15`, color: track.color, borderRadius: 5, padding: '2px 7px', fontWeight: 700 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 60 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: track.color }}>{trackPct}%</div>
                  <div style={{ fontSize: 9, color: '#9ca3af' }}>{LEVELS_PER_TRACK} levels</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {track.levels.map(level => (
                  <LevelCard key={level.id} level={level} track={track} robotName={robotName} onStart={onStartChallenge} />
                ))}
              </div>
            </div>
          )}

          {tab === 'bonus' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 10 }}>
                🔥 Epic Bonus Courses — {filteredBonus.length} long-distance challenges
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {filteredBonus.map(level => (
                  <LevelCard key={level.id} level={level} robotName={robotName} onStart={onStartChallenge} />
                ))}
              </div>
            </div>
          )}

          {tab === 'all' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 10 }}>
                📚 Full catalog — {filteredAll.length} courses
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {filteredAll.map(level => {
                  const tr = ROBOT_TRACKS.find(t => t.id === level.trackId);
                  return (
                    <LevelCard key={level.id} level={level} track={tr} robotName={robotName} onStart={onStartChallenge} compact />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>🏅 Badges ({badges.length})</div>
            {badges.length === 0 ? (
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Complete courses to earn badges!</div>
            ) : badges.slice(0, 6).map(b => (
              <div key={b.id} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 11 }}>
                <span>{b.icon}</span>
                <span style={{ fontWeight: 700, color: '#374151' }}>{b.name}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>📊 Personal Bests</div>
            {leaderboard.length === 0 ? (
              <div style={{ fontSize: 11, color: '#9ca3af' }}>No records yet</div>
            ) : leaderboard.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', gap: 6, padding: '5px 0', fontSize: 10, borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#9ca3af' }}>#{i + 1}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' }}>{e.id.replace(/_/g, ' ')}</span>
                <span style={{ fontWeight: 800, color: '#f59e0b' }}>{e.score}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg,#7c3aed,#4338ca)', borderRadius: 12, padding: 14, color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.85, marginBottom: 6 }}>COURSE LENGTH GUIDE</div>
            {Object.entries(COURSE_LENGTHS).map(([k, v]) => (
              <div key={k} style={{ fontSize: 10, marginBottom: 4, opacity: 0.9 }}>
                {v.icon} <strong>{v.label}</strong> — {v.minDist}–{v.maxDist === 999 ? '80+' : v.maxDist} m
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
