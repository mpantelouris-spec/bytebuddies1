/**
 * StatsPanel.jsx
 * Right panel showing robot stats, components, and actions
 * Stats are calculated from the robot configuration
 */

import React, { useMemo } from 'react';
import '../styles/stats-panel.css';

// Calculate robot stats from configuration
function calculateStats(config) {
  let speed = 50;
  let power = 60;
  let durability = 50;
  let weight = 1.0;

  // Chassis stats
  const chassisStats = {
    'rover': { speed: 60, power: 55, durability: 65, weight: 2.0 },
    'tank': { speed: 30, power: 85, durability: 95, weight: 4.5 },
    'drone': { speed: 85, power: 50, durability: 40, weight: 1.2 },
    'humanoid': { speed: 50, power: 60, durability: 55, weight: 3.0 },
    'spider': { speed: 70, power: 55, durability: 50, weight: 2.5 },
    'industrial': { speed: 25, power: 90, durability: 95, weight: 6.0 },
  };

  const chassis = chassisStats[config.chassis.type] || chassisStats['rover'];
  speed = chassis.speed;
  power = chassis.power;
  durability = chassis.durability;
  weight = chassis.weight;

  // Movement affects speed
  if (config.movement.type === 'wheels') {
    speed += Math.min(config.movement.count - 4, 2) * 3; // More wheels = slightly faster
  } else if (config.movement.type === 'flying') {
    speed += 15;
    power -= 20; // Flying costs power
  } else if (config.movement.type === 'legs') {
    speed -= 10; // Legs are slower
  }

  // Sensors drain power
  power -= Math.min(config.sensors.length * 4, 20);

  // Tools add weight and power drain
  power -= Math.min(config.tools.length * 5, 25);
  weight += config.tools.length * 0.5;

  // Cap at 0-100
  speed = Math.max(0, Math.min(100, speed));
  power = Math.max(0, Math.min(100, power));
  durability = Math.max(0, Math.min(100, durability));

  return { speed, power, durability, weight: weight.toFixed(1) };
}

// Stat bar component with animation
function StatBar({ label, value, color }) {
  const getColor = () => {
    if (value >= 70) return '#00FF41'; // Green
    if (value >= 40) return '#FFD700'; // Yellow
    return '#FF6B6B'; // Red
  };

  const barColor = color || getColor();

  return (
    <div className="stat-bar">
      <div className="stat-bar-label">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{Math.round(value)}%</span>
      </div>
      <div className="stat-bar-background">
        <div
          className="stat-bar-fill"
          style={{
            width: `${value}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 10px ${barColor}`,
          }}
        />
      </div>
    </div>
  );
}

export default function StatsPanel({ robotConfig, onNameChange }) {
  const stats = useMemo(() => calculateStats(robotConfig), [robotConfig]);

  return (
    <div className="stats-panel">
      <h3 className="stats-title">📊 Robot Stats</h3>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* ROBOT NAME */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="robot-name-section">
        <input
          type="text"
          className="robot-name-input"
          value={robotConfig.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Robot name..."
          maxLength={40}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* PERFORMANCE STATS */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="stats-section">
        <h4>⚡ Performance</h4>
        <StatBar label="🏃 Speed" value={stats.speed} />
        <StatBar label="🔋 Power" value={stats.power} />
        <StatBar label="💪 Durability" value={stats.durability} />
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SPECS */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="specs-section">
        <h4>📏 Specs</h4>
        <div className="spec-item">
          <span className="spec-label">⚖️ Weight</span>
          <span className="spec-value">{stats.weight} kg</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">🚗 Chassis</span>
          <span className="spec-value">
            {robotConfig.chassis.type.charAt(0).toUpperCase() + robotConfig.chassis.type.slice(1)}
          </span>
        </div>
        <div className="spec-item">
          <span className="spec-label">⚙️ Movement</span>
          <span className="spec-value">
            {robotConfig.movement.count}× {robotConfig.movement.type}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* COMPONENTS */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="components-section">
        <h4>🔧 Components</h4>
        <div className="components-list">
          <div className="component-item">
            <span className="component-badge">✓</span>
            <span>{robotConfig.chassis.type.toUpperCase()} Chassis</span>
          </div>
          <div className="component-item">
            <span className="component-badge">✓</span>
            <span>{robotConfig.movement.count}× {robotConfig.movement.type}</span>
          </div>
          
          {robotConfig.sensors.length > 0 && (
            <div className="component-item">
              <span className="component-badge">📡</span>
              <span>{robotConfig.sensors.length} sensor{robotConfig.sensors.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {robotConfig.tools.length > 0 && (
            <div className="component-item">
              <span className="component-badge">🔧</span>
              <span>{robotConfig.tools.length} tool{robotConfig.tools.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* ACTION BUTTONS */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="action-buttons">
        <button className="action-btn btn-primary">
          ▶️ Simulate
        </button>
        <button className="action-btn btn-secondary">
          💾 Save Design
        </button>
        <button className="action-btn btn-secondary">
          📝 Code Robot
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* INFO BOX */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="info-box">
        <p>
          💡 <strong>Tip:</strong> Different chassis types have different strengths.
          Mix parts to create your perfect robot!
        </p>
      </div>
    </div>
  );
}
