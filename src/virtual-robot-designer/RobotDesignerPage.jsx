/**
 * RobotDesignerPage.jsx
 * Complete Robot Designer with:
 * - Left: Parts Library (interactive)
 * - Center: 3D Viewer (realistic vehicles)
 * - Right: Stats Panel (live feedback)
 * 
 * State flows: User clicks part → state updates → 3D updates instantly
 */

import React, { useState, useCallback } from 'react';
import RobotViewer3D from './components/RobotViewer3D';
import PartsLibrary from './components/PartsLibrary';
import StatsPanel from './components/StatsPanel';
import './styles/robot-designer.css';

export default function RobotDesignerPage() {
  // Main robot configuration state
  const [robotConfig, setRobotConfig] = useState({
    name: 'My Explorer Bot',
    
    // Chassis (body)
    chassis: {
      type: 'rover',        // 'rover' | 'tank' | 'drone' | 'humanoid' | 'spider' | 'industrial'
      color: '#FFFFFF',     // Hex color
      size: 'medium',       // 'small' | 'medium' | 'large'
    },
    
    // Movement
    movement: {
      type: 'wheels',       // 'wheels' | 'tracks' | 'legs' | 'flying'
      count: 4,            // 2-8 wheels
      color: '#1E90FF',    // Wheel color
      speed: 'medium',     // 'slow' | 'medium' | 'fast'
    },
    
    // Sensors (added parts)
    sensors: [],           // Array of { id, type: '📷 Camera' | '📡 Ultrasonic' | etc }
    
    // Tools (added parts)
    tools: [],             // Array of { id, type: '👐 Grabber' | etc }
  });

  // Handle configuration changes
  const updateConfig = useCallback((updates) => {
    setRobotConfig(prev => ({
      ...prev,
      ...updates,
      // Merge nested objects properly
      chassis: { ...prev.chassis, ...updates.chassis },
      movement: { ...prev.movement, ...updates.movement },
    }));
  }, []);

  // Reset to defaults
  const resetRobot = useCallback(() => {
    setRobotConfig({
      name: 'My Explorer Bot',
      chassis: { type: 'rover', color: '#FFFFFF', size: 'medium' },
      movement: { type: 'wheels', count: 4, color: '#1E90FF', speed: 'medium' },
      sensors: [],
      tools: [],
    });
  }, []);

  return (
    <div className="robot-designer-page">
      {/* Header */}
      <div className="vrd-header">
        <div className="vrd-header-title">
          <span className="vrd-header-icon">🤖</span>
          <div>
            <h1>Virtual Robot Designer</h1>
            <p>Design incredible robots, test them in simulation, generate code</p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="vrd-main-layout">
        
        {/* LEFT: Parts Library */}
        <div className="vrd-left-panel">
          <PartsLibrary 
            robotConfig={robotConfig}
            updateConfig={updateConfig}
            onReset={resetRobot}
          />
        </div>

        {/* CENTER: 3D Viewer */}
        <div className="vrd-center-viewport">
          <RobotViewer3D robotConfig={robotConfig} />
        </div>

        {/* RIGHT: Stats Panel */}
        <div className="vrd-right-panel">
          <StatsPanel 
            robotConfig={robotConfig}
            onNameChange={(name) => updateConfig({ name })}
          />
        </div>

      </div>
    </div>
  );
}
