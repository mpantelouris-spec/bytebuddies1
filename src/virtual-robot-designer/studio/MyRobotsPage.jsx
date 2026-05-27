/**
 * MyRobotsPage.jsx
 * Visual library of saved robot designs.
 */
import React, { useState } from 'react';
import { SAMPLE_ROBOTS, CHASSIS_DATA } from '../services/studio-robot-builder.js';

const GRAD_PRESETS = [
  ['#FFF3E0', '#FFE0B2'],
  ['#E3F2FD', '#BBDEFB'],
  ['#E8F5E9', '#C8E6C9'],
  ['#F3E5F5', '#E1BEE7'],
  ['#FFF8E1', '#FFECB3'],
  ['#E0F7FA', '#B2EBF2'],
];

export default function MyRobotsPage({ onEditRobot, onTestRobot, onNewRobot }) {
  const [robots, setRobots] = useState(SAMPLE_ROBOTS);
  const [activeId, setActiveId] = useState(1);
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all',   label: 'All Robots' },
    { id: 'fast',  label: '⚡ Speed' },
    { id: 'heavy', label: '🛡️ Heavy' },
    { id: 'smart', label: '🧠 Smart' },
  ];

  const chassis = (r) => CHASSIS_DATA.find(c => c.id === r.chassisId) || CHASSIS_DATA[0];

  return (
    <div className="bb-studio-myrobots">
      {/* Header */}
      <div className="bb-studio-myrobots-head">
        <span className="bb-studio-myrobots-title">🤖 My Robots</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {filters.map(f => (
            <button
              key={f.id}
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
            onClick={onNewRobot}
            style={{
              padding: '8px 18px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff',
              fontWeight: 800, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
              transition: 'transform 0.12s',
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
          { label: 'Total XP Earned', value: robots.reduce((a, r) => a + r.xp, 0), icon: '⭐' },
          { label: 'Missions Won', value: 12, icon: '🏆' },
          { label: 'Parts Used', value: robots.reduce((a, r) => a + r.sensors.length + r.tools.length, 0), icon: '🔧' },
        ].map(s => (
          <div
            key={s.label}
            style={{
              background: '#fff', borderRadius: 12, padding: '12px 18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)', flex: 1,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#222' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Robot grid */}
      <div className="bb-studio-myrobots-grid">
        {robots.map((robot, i) => {
          const ch = chassis(robot);
          const grad = robot.bgGrad || GRAD_PRESETS[i % GRAD_PRESETS.length];
          return (
            <div
              key={robot.id}
              className={`bb-studio-robot-card${activeId === robot.id ? ' active' : ''}`}
              onClick={() => setActiveId(robot.id)}
            >
              {/* Thumbnail */}
              <div
                className="bb-studio-robot-card-thumb"
                style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
              >
                <span style={{ fontSize: 64, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
                  {robot.icon}
                </span>
                {activeId === robot.id && (
                  <span className="bb-studio-robot-card-badge">SELECTED</span>
                )}
                {/* XP badge */}
                <span style={{
                  position: 'absolute', bottom: 8, right: 8,
                  background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                  color: '#ffd700', fontSize: 10, fontWeight: 900,
                  padding: '3px 8px', borderRadius: 8,
                }}>
                  ⭐ {robot.xp} XP
                </span>
              </div>

              {/* Body */}
              <div className="bb-studio-robot-card-body">
                <div className="bb-studio-robot-card-name">{robot.name}</div>
                <div className="bb-studio-robot-card-stats">
                  {ch.name} · {robot.wheels} wheels · {robot.sensors.length} sensors
                </div>

                {/* Mini stat bars */}
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
                    className="bb-studio-rcb bb-studio-rcb--edit"
                    onClick={(e) => { e.stopPropagation(); onEditRobot?.(robot); }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="bb-studio-rcb bb-studio-rcb--test"
                    onClick={(e) => { e.stopPropagation(); onTestRobot?.(robot); }}
                  >
                    ▶ Test
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* New robot card */}
        <div className="bb-studio-new-card" onClick={onNewRobot}>
          <div className="bb-studio-new-card-icon">＋</div>
          <div className="bb-studio-new-card-text">New Robot</div>
          <div style={{ fontSize: 11, color: '#ccc' }}>Start from scratch</div>
        </div>
      </div>
    </div>
  );
}
