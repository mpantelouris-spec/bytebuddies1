import React, { useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useProject } from '../contexts/ProjectContext';
import './SparkStudioDashboard.css';

const modes = [
  { id: 'gamebuilder', icon: '🎮', name: 'Arena Builder', blurb: 'Make a world to play in', color: 'coral', tags: ['obstacles', 'power-ups'] },
  { id: 'studio', icon: '🤖', name: 'Robot Workshop', blurb: 'Invent your new best friend', color: 'violet', tags: ['design', 'behaviour'] },
  { id: 'missions', icon: '🚀', name: 'Coding Adventure', blurb: 'Solve a mission in space', color: 'cyan', tags: ['quests', 'blocks'] },
  { id: 'gamebuilder', icon: '🌲', name: 'World Builder', blurb: 'Paint a world from scratch', color: 'mint', tags: ['terrain', 'weather'] },
];

const featured = [
  { title: 'Neon Skyway', author: 'Maya', icon: '🌃', color: '#2b225e', type: 'Racing', players: '1.2k' },
  { title: 'The Tiny Kingdom', author: 'Leo', icon: '🏰', color: '#493249', type: 'Adventure', players: '846' },
  { title: 'Moonbase 04', author: 'Ari', icon: '🌙', color: '#153d55', type: 'Sandbox', players: '2.4k' },
];

export default function SparkStudioDashboard({ onNavigate }) {
  const { user } = useUser();
  const { projects = [] } = useProject();
  const [activeMode, setActiveMode] = useState(null);
  const [showAllModes, setShowAllModes] = useState(false);
  const [toast, setToast] = useState('');

  const recentProjects = useMemo(() => projects.slice(0, 3), [projects]);
  const displayName = user?.name || 'Builder';
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2400); };

  const chooseMode = (mode) => {
    setActiveMode(mode.id);
    notify(`${mode.name} is ready — let’s build!`);
    window.setTimeout(() => onNavigate(mode.id), 260);
  };

  return (
    <main className="spark-home">
      <div className="spark-orb spark-orb-one" />
      <div className="spark-orb spark-orb-two" />
      <div className="spark-stars" aria-hidden="true">✦　·　✧　　·　✦　　　·　✧　·</div>

      <section className="spark-hero">
        <div className="spark-hero-copy">
          <div className="spark-kicker"><span className="spark-live-dot" /> CREATOR HEADQUARTERS <span className="spark-kicker-line" /></div>
          <h1>Hey {displayName.split(' ')[0]}!<br /><span>What will you build?</span></h1>
          <p>Pick a world, bring an idea, and make it playable in under a minute.</p>
          <div className="spark-hero-actions">
            <button className="spark-primary-btn" onClick={() => chooseMode(modes[0])}><span>⚡</span> Start building</button>
            <button className="spark-ghost-btn" onClick={() => onNavigate('community')}><span>✨</span> Explore worlds</button>
          </div>
          <div className="spark-hero-meta"><span>🔥 {user?.streak || 0} day streak</span><span>✦ {user?.xp || 0} XP</span><span>◉ All systems online</span></div>
        </div>
        <div className="spark-hero-scene" aria-label="A floating robot workshop">
          <div className="spark-moon" /><div className="spark-planet planet-back" /><div className="spark-planet planet-front" />
          <div className="spark-platform"><span className="platform-grid" /></div>
          <div className="spark-robot"><div className="robot-antenna" /><div className="robot-head"><i /><i /></div><div className="robot-body"><b>✦</b></div><div className="robot-leg left" /><div className="robot-leg right" /></div>
          <div className="spark-float-card card-build"><strong>+ 120 XP</strong><small>New creation</small></div>
          <div className="spark-float-card card-weather"><span>☀️</span><small>Sunny skies</small></div>
        </div>
      </section>

      <div className="spark-section-heading"><div><span className="spark-eyebrow">CHOOSE YOUR ADVENTURE</span><h2>Build something brilliant</h2></div><button className="spark-text-btn" onClick={() => setShowAllModes(!showAllModes)}>{showAllModes ? 'Show less' : 'View all modes'} <span>→</span></button></div>
      <section className="spark-mode-grid">
        {(showAllModes ? [...modes, { id: 'gamebuilder', icon: '🏁', name: 'Racing Designer', blurb: 'Design a lightning-fast track', color: 'gold', tags: ['boosts', 'laps'] }, { id: 'gamebuilder', icon: '🧩', name: 'Puzzle Lab', blurb: 'Invent a brain-twisting challenge', color: 'blue', tags: ['logic', 'secrets'] }] : modes).map((mode, index) => (
          <button key={`${mode.name}-${index}`} className={`spark-mode-card ${mode.color} ${activeMode === mode.id ? 'is-selected' : ''}`} onClick={() => chooseMode(mode)}>
            <div className="spark-mode-top"><span className="spark-mode-icon">{mode.icon}</span><span className="spark-arrow">↗</span></div>
            <strong>{mode.name}</strong><span>{mode.blurb}</span><div className="spark-tags">{mode.tags.map(tag => <em key={tag}>{tag}</em>)}</div>
          </button>
        ))}
      </section>

      <section className="spark-content-grid">
        <div className="spark-panel spark-project-panel"><div className="spark-panel-head"><div><span className="spark-eyebrow">YOUR HANGAR</span><h3>Continue building</h3></div><button className="spark-icon-btn" onClick={() => onNavigate('portfolio')}>•••</button></div>
          {recentProjects.length ? recentProjects.map((project, i) => <button className="spark-project-row" key={project.id || i} onClick={() => onNavigate('gamebuilder')}><span className={`project-thumb thumb-${i}`}>{['🌌', '🏝️', '🤖'][i % 3]}</span><span className="project-info"><strong>{project.name || `Untitled World ${i + 1}`}</strong><small>Edited recently · {project.type || 'Adventure world'}</small><span className="spark-progress"><i style={{ width: `${[72, 38, 91][i % 3]}%` }} /></span></span><span className="spark-row-arrow">→</span></button>) : <button className="spark-empty-project" onClick={() => chooseMode(modes[0])}><span>✦</span><strong>Your first world is waiting</strong><small>Start with a blank canvas or a playful template →</small></button>}
          <button className="spark-panel-link" onClick={() => onNavigate('portfolio')}>Open project library <span>→</span></button>
        </div>
        <div className="spark-panel spark-challenge-panel"><div className="spark-panel-head"><div><span className="spark-eyebrow">DAILY SPARK</span><h3>One tiny challenge</h3></div><span className="spark-reward">+50 XP</span></div><div className="spark-challenge-art">⚡</div><h4>Make it move</h4><p>Place a robot in your world and give it a movement block.</p><div className="spark-challenge-foot"><span><b>0/1</b> complete</span><button onClick={() => onNavigate('missions')}>Try it →</button></div></div>
      </section>

      <div className="spark-section-heading featured-heading"><div><span className="spark-eyebrow">FROM THE COMMUNITY</span><h2>Worlds worth visiting</h2></div><button className="spark-text-btn" onClick={() => onNavigate('community')}>See the gallery <span>→</span></button></div>
      <section className="spark-featured-grid">{featured.map(world => <button className="spark-world-card" key={world.title} onClick={() => notify(`Opening ${world.title}…`)}><div className="world-art" style={{ '--world-color': world.color }}><span>{world.icon}</span><small>PLAY WORLD ↗</small></div><div className="world-card-copy"><div><strong>{world.title}</strong><small>by {world.author}</small></div><span className="world-players">◉ {world.players}</span></div><div className="world-type">{world.type}</div></button>)}</section>
      {toast && <div className="spark-toast">✦ {toast}</div>}
    </main>
  );
}
