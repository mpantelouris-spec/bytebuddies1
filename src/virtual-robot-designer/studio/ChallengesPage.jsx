/**
 * ChallengesPage.jsx — Robot Studio mission and course library.
 * Keeps the existing challenge data and launch actions, with a clearer explorer UI.
 */
import React, { useMemo, useState } from 'react';
import {
  ROBOT_TRACKS, BONUS_COURSES, ALL_COURSES_CATALOG,
  COURSE_LENGTHS, TRACK_CATEGORIES, LEVELS_PER_TRACK,
} from '../data/robot-tracks.js';
import { GameProgress, fmtTime, fmtDist, LVL_THRESH } from '../services/game-progress.js';
import { ARCADE_GAMES } from '../arcade/games/index.js';
import { loadProgress } from '../arcade/engine.js';
import './ChallengesPage.css';
import { EmojiIcon } from '../../components/ui/Icon.jsx';

function loadRobotName() {
  try { return JSON.parse(localStorage.getItem('bb-studio-robot') || '{}').name || 'Robot'; }
  catch { return 'Robot'; }
}

function Meter({ value, color = '#8056f2' }) {
  return <span className="bb-ch-meter"><span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></span>;
}

function LevelCard({ level, track, robotName, onStart, compact = false }) {
  const completed = level.isBonus
    ? GameProgress.isCourseCompleted(robotName, level.id)
    : GameProgress.isTrackLevelCompleted(robotName, track?.id || level.trackId, level.level);
  const best = level.isBonus
    ? GameProgress.getBest(robotName, level.id)
    : GameProgress.getTrackBest(robotName, track?.id || level.trackId, level.level);
  const color = level.color || track?.color || '#8056f2';
  return (
    <article className={`bb-ch-level${completed ? ' is-complete' : ''}${compact ? ' is-compact' : ''}`} style={{ '--course-color': color }}>
      <div className="bb-ch-level-top">
        <span className="bb-ch-level-tag">{level.isBonus ? 'BONUS COURSE' : `LEVEL ${level.level}`}</span>
        <span className="bb-ch-level-length">{(COURSE_LENGTHS[level.length] || COURSE_LENGTHS.medium).icon} {(COURSE_LENGTHS[level.length] || COURSE_LENGTHS.medium).label}</span>
        {completed && <span className="bb-ch-complete-mark" aria-label="Completed">✓</span>}
      </div>
      <h3>{level.icon || track?.icon} {level.name}</h3>
      {!compact && <p className="bb-ch-level-desc">{level.desc}</p>}
      <div className="bb-ch-level-meta">
        <span>↔ {fmtDist(level.totalDist)}</span>
        {level.checkpoints > 0 && <span>⚑ {level.checkpoints} checkpoints</span>}
        {level.timeLimit > 0 && <span>◷ {fmtTime(level.timeLimit)}</span>}
        <span>~{level.estMinutes || Math.ceil(level.totalDist / 12)} min</span>
      </div>
      <div className="bb-ch-level-bottom">
        <span className="bb-ch-xp">✦ +{level.xpReward} XP</span>
        {best > 0 && <span className="bb-ch-best">Best {best}</span>}
        <button type="button" onClick={() => onStart({ ...level, trackName: track?.name || level.name, trackIcon: track?.icon || level.icon, trackColor: color })}>
          {completed ? 'Play again' : 'Play level'} <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

function ArcadeLibrary({ onPlay }) {
  if (!onPlay) return null;
  const games = [...Object.entries(ARCADE_GAMES), ['arenaquest', {
    id: 'arenaquest', title: 'Arena Quest', emoji: '🏟️', color: '#14b8a6',
    blurb: 'Explore tile adventures and arenas you build in Create!', levels: { length: 10 },
  }]];
  return (
    <section className="bb-ch-arcade" aria-labelledby="bb-ch-arcade-title">
      <div className="bb-ch-section-heading">
        <div><span className="bb-ch-eyebrow">PLAYABLE ROBOT GAMES</span><h2 id="bb-ch-arcade-title">Robot Arcade</h2></div>
        <span className="bb-ch-section-note">Pick a game, then code your robot to play</span>
      </div>
      <div className="bb-ch-arcade-grid">
        {games.map(([chassisId, game]) => {
          const stars = Object.values(loadProgress(game.id)).reduce((a, b) => a + b, 0);
          const total = (game.levels?.length || 10) * 3;
          return (
            <button className="bb-ch-arcade-card" key={chassisId} type="button" onClick={() => onPlay(chassisId)} style={{ '--game-color': game.color }}>
              <span className="bb-ch-arcade-icon" aria-hidden="true">{game.emoji}</span>
              <span className="bb-ch-arcade-copy"><b>{game.title}</b><span>{game.blurb}</span></span>
              <span className="bb-ch-arcade-footer"><span>★ {stars}/{total} stars · {game.levels?.length || 10} levels</span><i aria-hidden="true">→</i></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function ChallengesPage({ onStartChallenge, onPlayArcade, robotName: robotNameProp }) {
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
  const track = ROBOT_TRACKS.find((t) => t.id === selectedTrack) || ROBOT_TRACKS[0];
  const trackPct = GameProgress.getTrackCompletionPct(robotName, track.id);
  const nextXp = LVL_THRESH[lvl] ?? Infinity;
  const prevXp = LVL_THRESH[lvl - 1] || 0;
  const xpPct = nextXp === Infinity ? 100 : Math.min(100, ((xp - prevXp) / (nextXp - prevXp)) * 100);

  const filteredBonus = useMemo(() => BONUS_COURSES.filter((c) => {
    const q = search.trim().toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
      && (lenFilter === 'all' || c.length === lenFilter);
  }), [search, lenFilter]);
  const filteredAll = useMemo(() => ALL_COURSES_CATALOG.filter((c) => {
    const q = search.trim().toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || (c.trackName || '').toLowerCase().includes(q))
      && (catFilter === 'all' || c.category === catFilter)
      && (lenFilter === 'all' || c.length === lenFilter);
  }), [search, catFilter, lenFilter]);

  const tabs = [
    { id: 'tracks', title: 'STEM tracks', count: ROBOT_TRACKS.length * LEVELS_PER_TRACK, icon: '🧭' },
    { id: 'bonus', title: 'Bonus courses', count: BONUS_COURSES.length, icon: '🔥' },
    { id: 'all', title: 'All courses', count: ALL_COURSES_CATALOG.length, icon: '📚' },
  ];
  const categories = Object.entries(TRACK_CATEGORIES);

  return (
    <main className="bb-challenges">
      <div className="bb-ch-page-scroll">
        <section className="bb-ch-hero">
          <div className="bb-ch-hero-copy">
            <span className="bb-ch-eyebrow">ROBOT STUDIO · MISSION CONTROL</span>
            <h1>Choose your next challenge<span>.</span></h1>
            <p>Pick a robot game or follow a STEM track. Every course gives you a new coding skill to try.</p>
          </div>
          <div className="bb-ch-progress-card">
            <div className="bb-ch-progress-top"><span className="bb-ch-progress-orb"><EmojiIcon e="✦" /></span><div><small>YOUR PROGRESS</small><b>Level {lvl}</b></div><strong>{xp.toLocaleString()} <small>XP</small></strong></div>
            <Meter value={xpPct} />
            <div className="bb-ch-progress-bottom"><span>{totalDone} courses completed</span><span>{nextXp === Infinity ? 'Max level!' : `${Math.max(0, nextXp - xp)} XP to next level`}</span></div>
          </div>
        </section>

        <ArcadeLibrary onPlay={onPlayArcade} />

        <section className="bb-ch-courses" aria-labelledby="bb-ch-courses-title">
          <div className="bb-ch-section-heading bb-ch-course-heading">
            <div><span className="bb-ch-eyebrow">LEARN BY DOING</span><h2 id="bb-ch-courses-title">Course library</h2></div>
            <div className="bb-ch-course-count"><b>{ALL_COURSES_CATALOG.length}</b><span>robot courses</span></div>
          </div>
          <div className="bb-ch-browser-bar">
            <div className="bb-ch-tabs" role="tablist" aria-label="Course collections">
              {tabs.map((t) => <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}><span><EmojiIcon e={t.icon} /></span>{t.title}<i>{t.count}</i></button>)}
            </div>
            <div className="bb-ch-search-row">
              <label className="bb-ch-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses or tracks" aria-label="Search courses or tracks" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>}</label>
              {tab !== 'bonus' && <label className="bb-ch-select-wrap"><span className="sr-only">Category</span><select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}><option value="all">All categories</option>{categories.map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>}
              <label className="bb-ch-select-wrap"><span className="sr-only">Course length</span><select value={lenFilter} onChange={(e) => setLenFilter(e.target.value)}><option value="all">Any length</option>{Object.entries(COURSE_LENGTHS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
            </div>
          </div>

          <div className={`bb-ch-browser-layout ${tab === 'tracks' ? '' : 'no-track-nav'}`}>
            {tab === 'tracks' && <nav className="bb-ch-track-nav" aria-label="STEM tracks">
              <div className="bb-ch-track-nav-title">STEM tracks <span>{ROBOT_TRACKS.length}</span></div>
              {ROBOT_TRACKS.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())).map((t) => {
                const pct = GameProgress.getTrackCompletionPct(robotName, t.id);
                const selected = selectedTrack === t.id;
                const category = TRACK_CATEGORIES[t.category] || {};
                return <button type="button" key={t.id} className={`bb-ch-track-link${selected ? ' selected' : ''}`} style={{ '--track-color': t.color }} onClick={() => { setSelectedTrack(t.id); setTab('tracks'); }} aria-current={selected ? 'page' : undefined}>
                  <span className="bb-ch-track-icon"><EmojiIcon e={t.icon} /></span><span className="bb-ch-track-copy"><b>{t.name}</b><small><EmojiIcon e={category.icon} style={{ marginRight: '0.35em' }} />{category.label} · {LEVELS_PER_TRACK} levels</small><Meter value={pct} color={t.color} /></span><span className="bb-ch-track-pct">{pct}%</span>
                </button>;
              })}
            </nav>}

            <div className="bb-ch-results">
              {tab === 'tracks' && <>
                <header className="bb-ch-track-hero" style={{ '--track-color': track.color }}>
                  <span className="bb-ch-track-hero-icon"><EmojiIcon e={track.icon} /></span><div className="bb-ch-track-hero-copy"><span className="bb-ch-eyebrow">STEM TRACK · {TRACK_CATEGORIES[track.category]?.label || 'ROBOTICS'}</span><h3>{track.name}</h3><p>{track.desc}</p><div className="bb-ch-skills">{track.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div><div className="bb-ch-track-completion"><b>{trackPct}%</b><span>complete</span><small>{LEVELS_PER_TRACK} levels</small></div>
                </header>
                <div className="bb-ch-results-heading"><div><h3>Mission path</h3><p>Complete the levels in any order and build your skills as you go.</p></div><span>{track.levels.length} challenges</span></div>
                {search && !track.levels.some((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.desc.toLowerCase().includes(search.toLowerCase())) && <div className="bb-ch-empty">No matching levels in this track. Try a different track or clear your search.</div>}
                <div className="bb-ch-level-grid">{track.levels.filter((l) => !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.desc.toLowerCase().includes(search.toLowerCase())).map((level) => <LevelCard key={level.id} level={level} track={track} robotName={robotName} onStart={onStartChallenge} />)}</div>
              </>}
              {tab === 'bonus' && <>
                <div className="bb-ch-results-heading"><div><h3>Bonus courses</h3><p>Longer missions for when you’re ready to go further.</p></div><span>{filteredBonus.length} courses</span></div>
                {filteredBonus.length ? <div className="bb-ch-level-grid">{filteredBonus.map((level) => <LevelCard key={level.id} level={level} robotName={robotName} onStart={onStartChallenge} />)}</div> : <div className="bb-ch-empty">No courses match those filters. Try changing your search.</div>}
              </>}
              {tab === 'all' && <>
                <div className="bb-ch-results-heading"><div><h3>All robot courses</h3><p>Browse every level across all STEM tracks.</p></div><span>{filteredAll.length} courses</span></div>
                {filteredAll.length ? <div className="bb-ch-level-grid all-courses">{filteredAll.map((level) => <LevelCard key={level.id} level={level} track={ROBOT_TRACKS.find((t) => t.id === level.trackId)} robotName={robotName} onStart={onStartChallenge} compact />)}</div> : <div className="bb-ch-empty">No courses match those filters. Try changing your search.</div>}
              </>}
            </div>

            <aside className="bb-ch-aside">
              <section className="bb-ch-aside-card"><div className="bb-ch-aside-title"><span><EmojiIcon e="🏅" /></span><div><b>Your badges</b><small>{badges.length} earned</small></div></div>{badges.length ? <div className="bb-ch-badge-list">{badges.slice(0, 5).map((badge) => <div key={badge.id}><span><EmojiIcon e={badge.icon} /></span><b>{badge.name}</b><i>✓</i></div>)}</div> : <div className="bb-ch-first-badge"><span><EmojiIcon e="🌟" /></span><p>Finish your first course to earn a badge. Your achievements will show here.</p></div>}</section>
              <section className="bb-ch-aside-card"><div className="bb-ch-aside-title"><span><EmojiIcon e="🏁" /></span><div><b>Personal bests</b><small>Your top scores</small></div></div>{leaderboard.length ? <div className="bb-ch-best-list">{leaderboard.slice(0, 5).map((entry, i) => <div key={entry.id}><span>{String(i + 1).padStart(2, '0')}</span><b>{entry.id.replace(/_/g, ' ')}</b><strong>{entry.score}</strong></div>)}</div> : <p className="bb-ch-aside-empty">Your fastest runs will appear here.</p>}</section>
              <section className="bb-ch-length-guide"><span className="bb-ch-eyebrow">PICK YOUR PACE</span><h3>Course lengths</h3>{Object.entries(COURSE_LENGTHS).map(([key, value]) => <div key={key}><span><EmojiIcon e={value.icon} /></span><b>{value.label}</b><small>{value.minDist}–{value.maxDist === 999 ? '80+' : value.maxDist} m</small></div>)}</section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
