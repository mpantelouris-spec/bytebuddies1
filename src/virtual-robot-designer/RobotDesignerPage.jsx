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
    // vrd-designer sets the 3-column CSS grid defined in robot-designer.css
    // --vrd-bottom-h:0 removes the empty bottom row
    <div className="vrd-designer" style={{ '--vrd-bottom-h': '0px' }}>

      {/* Header — grid-area: header */}
      <div className="vrd-designer-header" style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 24px', background: '#1a1a2e',
        borderBottom: '1px solid rgba(0,217,255,0.15)',
      }}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>Virtual Robot Designer</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Design robots · test in simulation · generate code</p>
        </div>
      </div>

      {/* vrd-designer-body uses display:contents so children go straight into the grid */}
      <div className="vrd-designer-body">

        {/* LEFT — grid-area: left */}
        <div className="vrd-designer-left">
          <PartsLibrary
            robotConfig={robotConfig}
            updateConfig={updateConfig}
            onReset={resetRobot}
          />
        </div>

        {/* CENTER — grid-area: center */}
        <div className="vrd-designer-center">
          <RobotViewer3D robotConfig={robotConfig} />
        </div>

        {/* RIGHT — grid-area: right */}
        <div className="vrd-designer-right">
          <StatsPanel
            robotConfig={robotConfig}
            onNameChange={(name) => updateConfig({ name })}
          />
        </div>

      </div>
    </div>
  );
}
