/**
 * PartsLibrary.jsx
 * Interactive parts selection panel on the left
 * Every click immediately updates the 3D robot
 */

import React from 'react';
import '../styles/parts-library.css';

const CHASSIS_TYPES = [
  { id: 'rover', icon: '🚗', name: 'Rover', desc: 'Balanced all-rounder' },
  { id: 'tank', icon: '🛞', name: 'Tank', desc: 'Heavy & powerful' },
  { id: 'drone', icon: '✈️', name: 'Drone', desc: 'Fast & agile' },
  { id: 'humanoid', icon: '🤖', name: 'Humanoid', desc: 'Walks on legs' },
  { id: 'spider', icon: '🕷️', name: 'Spider', desc: 'Multiple legs' },
  { id: 'industrial', icon: '🏗️', name: 'Industrial', desc: 'Massive grip' },
];

const MOVEMENT_TYPES = [
  { id: 'wheels', icon: '⊙', name: 'Wheels' },
  { id: 'tracks', icon: '⫷', name: 'Tracks' },
  { id: 'legs', icon: '🦿', name: 'Legs' },
  { id: 'flying', icon: '✈️', name: 'Flying' },
];

const SENSORS = [
  { type: '📷 Camera', icon: '📷', name: 'Camera' },
  { type: '📡 Ultrasonic', icon: '📡', name: 'Ultrasonic' },
  { type: '🌡️ Thermal', icon: '🌡️', name: 'Thermal' },
  { type: '🧭 Gyro', icon: '🧭', name: 'Gyro' },
];

const TOOLS = [
  { type: '👐 Grabber', icon: '👐', name: 'Grabber' },
  { type: '🔫 Shooter', icon: '🔫', name: 'Shooter' },
  { type: '🧲 Magnet', icon: '🧲', name: 'Magnet' },
  { type: '🔨 Drill', icon: '🔨', name: 'Drill' },
];

const COLORS = [
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#FF6B6B', name: 'Red' },
  { hex: '#1E90FF', name: 'Blue' },
  { hex: '#00FF41', name: 'Green' },
  { hex: '#FFD700', name: 'Gold' },
  { hex: '#FF8C00', name: 'Orange' },
  { hex: '#9B59B6', name: 'Purple' },
];

export default function PartsLibrary({ robotConfig, updateConfig, onReset }) {
  const handleChassisChange = (type) => {
    updateConfig({ chassis: { type } });
  };

  const handleMovementChange = (type) => {
    updateConfig({ movement: { type } });
  };

  const handleWheelCountChange = (e) => {
    const count = parseInt(e.target.value);
    updateConfig({ movement: { count } });
  };

  const handleColorChange = (hex) => {
    updateConfig({ chassis: { color: hex } });
  };

  const handleAddSensor = (sensor) => {
    updateConfig({
      sensors: [...robotConfig.sensors, { id: Date.now(), type: sensor.type }],
    });
  };

  const handleAddTool = (tool) => {
    updateConfig({
      tools: [...robotConfig.tools, { id: Date.now(), type: tool.type }],
    });
  };

  const handleRemoveSensor = (id) => {
    updateConfig({
      sensors: robotConfig.sensors.filter(s => s.id !== id),
    });
  };

  const handleRemoveTool = (id) => {
    updateConfig({
      tools: robotConfig.tools.filter(t => t.id !== id),
    });
  };

  return (
    <div className="parts-library">
      <h3 className="parts-title">🛠️ Build Your Robot</h3>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* CHASSIS SELECTION */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="parts-section">
        <h4 className="section-title">🚗 Body Type</h4>
        <div className="parts-grid">
          {CHASSIS_TYPES.map(chassis => (
            <button
              key={chassis.id}
              className={`part-button ${robotConfig.chassis.type === chassis.id ? 'active' : ''}`}
              onClick={() => handleChassisChange(chassis.id)}
              title={chassis.desc}
            >
              <span className="part-icon">{chassis.icon}</span>
              <span className="part-name">{chassis.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* COLOR PICKER */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="parts-section">
        <h4 className="section-title">🎨 Paint</h4>
        <div className="color-grid">
          {COLORS.map(color => (
            <button
              key={color.hex}
              className={`color-button ${robotConfig.chassis.color === color.hex ? 'active' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleColorChange(color.hex)}
              title={color.name}
            />
          ))}
          <input
            type="color"
            className="color-custom"
            value={robotConfig.chassis.color}
            onChange={(e) => handleColorChange(e.target.value)}
            title="Custom color"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* MOVEMENT */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="parts-section">
        <h4 className="section-title">⚙️ Movement</h4>
        <div className="movement-buttons">
          {MOVEMENT_TYPES.map(move => (
            <button
              key={move.id}
              className={`movement-button ${robotConfig.movement.type === move.id ? 'active' : ''}`}
              onClick={() => handleMovementChange(move.id)}
            >
              <span>{move.icon}</span>
              <span>{move.name}</span>
            </button>
          ))}
        </div>

        {/* Wheel count slider */}
        {robotConfig.movement.type === 'wheels' && (
          <div className="slider-control">
            <label>Wheels: <strong>{robotConfig.movement.count}</strong></label>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={robotConfig.movement.count}
              onChange={handleWheelCountChange}
              className="wheel-slider"
            />
            <div className="slider-labels">
              <span>2</span>
              <span>8</span>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SENSORS */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="parts-section">
        <h4 className="section-title">📡 Sensors</h4>
        <div className="add-buttons">
          {SENSORS.map(sensor => (
            <button
              key={sensor.type}
              className="add-button"
              onClick={() => handleAddSensor(sensor)}
              title={`Add ${sensor.name}`}
            >
              <span>+ {sensor.icon} {sensor.name}</span>
            </button>
          ))}
        </div>
        {robotConfig.sensors.length > 0 && (
          <div className="parts-list">
            {robotConfig.sensors.map(sensor => (
              <div key={sensor.id} className="parts-list-item">
                <span>{sensor.type}</span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveSensor(sensor.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* TOOLS */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="parts-section">
        <h4 className="section-title">🔧 Tools</h4>
        <div className="add-buttons">
          {TOOLS.map(tool => (
            <button
              key={tool.type}
              className="add-button"
              onClick={() => handleAddTool(tool)}
              title={`Add ${tool.name}`}
            >
              <span>+ {tool.icon} {tool.name}</span>
            </button>
          ))}
        </div>
        {robotConfig.tools.length > 0 && (
          <div className="parts-list">
            {robotConfig.tools.map(tool => (
              <div key={tool.id} className="parts-list-item">
                <span>{tool.type}</span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveTool(tool.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* RESET BUTTON */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <button className="reset-button" onClick={onReset}>
        🗑️ Clear All
      </button>
    </div>
  );
}
