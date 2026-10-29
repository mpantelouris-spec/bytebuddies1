/**
 * MyRobotsPage.jsx
 * Visual library of saved robot designs.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { CHASSIS_DATA } from '../services/studio-robot-builder.js';
import { loadRobotLibrary, filterRobotsByTag, isCreatedRobot } from '../services/studio-robot-store.js';
import { renderRobotThumb } from '../create/robotThumbs.js';
import { GameProgress } from '../services/game-progress.js';
import { EmojiIcon } from '../../components/ui/Icon.jsx';

const GRAD_PRESETS = [
  ['#FFF3E0', '#FFE0B2'],
  ['#E3F2FD', '#BBDEFB'],
  ['#E8F5E9', '#C8E6C9'],
  ['#F3E5F5', '#E1BEE7'],
  ['#FFF8E1', '#FFECB3'],
  ['#E0F7FA', '#B2EBF2'],
];

/** A 3D picture of a robot made in Create Studio. */
function CreatedThumb({ robot, fallback }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let live = true;
    renderRobotThumb(robot).then((u) => { if (live) setSrc(u); }).catch(() => {});
    return () => { live = false; };
  }, [robot]);
  return src
    ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    : <span style={{ fontSize: 64 }}>{fallback}</span>;
}

export default function MyRobotsPage({ onEditRobot, onEditCreated, onSelectRobot, onTestRobot, onNewRobot, onBuildNew }) {
  const [robots, setRobots] = useState(() => loadRobotLibrary());
  const [activeId, setActiveId] = useState(() => loadRobotLibrary()[0]?.id ?? 1);
  const [filter, setFilter] = useState('all');

  const refresh = useCallback(() => {
    const lib = loadRobotLibrary();
    setRobots(lib);
    if (!lib.find((r) => r.id === activeId)) setActiveId(lib[0]?.id ?? null);
  }, [activeId]);

  const filters = [
    { id: 'all',   label: 'All Robots' },
    { id: 'fast',  label: '⚡ Speed' },
    { id: 'heavy', label: '🛡️ Heavy' },
    { id: 'smart', label: '🧠 Smart' },
  ];

  const visibleRobots = filterRobotsByTag(robots, filter);
  // Robots made in Create Studio are kept in their own group, apart from the Studio robots
  const created = visibleRobots.filter(isCreatedRobot);
  const studio = visibleRobots.filter((r) => !isCreatedRobot(r));
  const chassis = (r) => CHASSIS_DATA.find(c => c.id === r.chassisId) || CHASSIS_DATA[0];

  return (
    <div className="bb-studio-myrobots">
      {/* Header */}
      <div className="bb-studio-myrobots-head">
        <span className="bb-studio-myrobots-title"><EmojiIcon e="🤖" style={{ marginRight: '0.35em' }} />My Robots</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {filters.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none',
                background: filter === f.id ? '#7c3aed' : '#fff',
                color: filter === f.id ? '#fff' : '#666',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { refresh(); onNewRobot?.(); }}
            style={{
              padding: '8px 18px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff',
              fontWeight: 800, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
            }}
          >
            ＋ New Robot
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Robots', value: robots.length, icon: '🤖' },
          { label: 'Total XP Earned', value: robots.reduce((a, r) => a + (r.xp || 0), 0), icon: '⭐' },
          { label: 'Missions Won', value: robots.reduce((a, r) => a + GameProgress.getTotalCompletedLevels(r.name), 0), icon: '🏆' },
          { label: 'Parts Used', value: robots.reduce((a, r) => a + (r.sensors?.length || 0) + (r.tools?.length || 0), 0), icon: '🔧' },
        ].map(s => (
          <div
            key={s.label}
            style={{
              background: '#fff', borderRadius: 12, padding: '12px 18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)', flex: 1,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <span style={{ fontSize: 28 }}><EmojiIcon e={s.icon} /></span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#222' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {created.length > 0 && <h3 className="bb-studio-myrobots-section"><EmojiIcon e="🔧" style={{ marginRight: '0.35em' }} />Robots I created</h3>}
      {created.length > 0 && <div className="bb-studio-myrobots-grid" style={{ marginBottom: 22 }}>{created.map((r, i) => renderCard(r, i, true))}
        {onBuildNew && (
          <div className="bb-studio-new-card" onClick={onBuildNew} role="button" tabIndex={0}>
            <div className="bb-studio-new-card-icon">＋</div>
            <div className="bb-studio-new-card-text">Build another</div>
            <div style={{ fontSize: 11, color: '#ccc' }}>In the Robot Builder</div>
          </div>
        )}
      </div>}
      {created.length > 0 && <h3 className="bb-studio-myrobots-section"><EmojiIcon e="🤖" style={{ marginRight: '0.35em' }} />Studio robots</h3>}

      {/* Robot grid */}
      <div className="bb-studio-myrobots-grid">
        {studio.map((robot, i) => renderCard(robot, i, false))}

        <div className="bb-studio-new-card" onClick={onNewRobot} role="button" tabIndex={0}>
          <div className="bb-studio-new-card-icon">＋</div>
          <div className="bb-studio-new-card-text">New Robot</div>
          <div style={{ fontSize: 11, color: '#ccc' }}>Start from scratch</div>
        </div>
      </div>
    </div>
  );

  function renderCard(robot, i, isMade) {
    const ch = chassis(robot);
    const grad = robot.bgGrad || GRAD_PRESETS[i % GRAD_PRESETS.length];
    return (
      <div
        key={robot.id}
        className={`bb-studio-robot-card${activeId === robot.id ? ' active' : ''}`}
        onClick={() => setActiveId(robot.id)}
        onKeyDown={(e) => { if (e.key === 'Enter') setActiveId(robot.id); }}
        role="button"
        tabIndex={0}
      >
        {/* Thumbnail */}
        <div
          className="bb-studio-robot-card-thumb"
          style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
        >
          {isMade ? <CreatedThumb robot={robot} fallback={robot.icon || ch.icon} /> : (
            <span style={{ fontSize: 64, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
              {robot.icon || ch.icon}
            </span>
          )}
          {activeId === robot.id && (
            <span className="bb-studio-robot-card-badge">SELECTED</span>
          )}
          <span style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
            color: '#ffd700', fontSize: 10, fontWeight: 900,
            padding: '3px 8px', borderRadius: 8,
          }}>
            ⭐ {robot.xp || 0} XP
          </span>
        </div>

        {/* Body */}
        <div className="bb-studio-robot-card-body">
          <div className="bb-studio-robot-card-name">{robot.name}</div>
          <div className="bb-studio-robot-card-stats">
            {isMade
              ? `Built by you · ${robot.build?.pieces ? `${robot.build.pieces.length} piece${robot.build.pieces.length === 1 ? '' : 's'}` : 'Create Studio'}`
              : `${ch.name} · ${robot.wheels ?? 4} wheels · ${(robot.sensors || []).length} sensors`}
          </div>

          <div style={{ marginBottom: 10 }}>
            {[
              { label: 'Speed',    val: ch.speed,    color: '#1E90FF' },
              { label: 'Power',    val: ch.power,    color: '#9B59B6' },
              { label: 'Durable', val: ch.durability, color: '#00C851' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#aaa', marginBottom: 2 }}>
                  <span style={{ fontWeight: 700 }}>{s.label}</span>
                  <span>{s.val}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: '#f0f0f0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.val}%`, background: s.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bb-studio-robot-card-btns">
            <button
              type="button"
              className="bb-studio-rcb bb-studio-rcb--edit"
              onClick={(e) => { e.stopPropagation(); if (isMade && onEditCreated) onEditCreated(robot); else onEditRobot?.(robot); }}
            >
              <EmojiIcon e="✏️" style={{ marginRight: '0.35em' }} />Edit
            </button>
            <button
              type="button"
              className="bb-studio-rcb bb-studio-rcb--test"
              onClick={(e) => { e.stopPropagation(); onTestRobot?.(robot); }}
            >
              <EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Test
            </button>
          </div>
        </div>
      </div>
    );
  }
}
