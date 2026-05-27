/**
 * ByteBuddiesStudio.jsx
 * Root component for the Robot Invention Studio.
 * Handles tab routing and shared robot config state.
 */
import React, { useState, useCallback, useEffect } from 'react';
import BuildPage       from './studio/BuildPage.jsx';
import CodePage        from './studio/CodePage.jsx';
import SimulatorPage   from './studio/SimulatorPage.jsx';
import MyRobotsPage    from './studio/MyRobotsPage.jsx';
import ChallengesPage  from './studio/ChallengesPage.jsx';
import CustomPartsPage from './studio/CustomPartsPage.jsx';
import './styles/studio.css';

const CP_LS_KEY = 'bb-studio-custom-parts';
const ROBOT_LS_KEY = 'bb-studio-robot';
const CODE_LS_KEY  = 'bb-studio-code';

function loadCustomParts() {
  try { return JSON.parse(localStorage.getItem(CP_LS_KEY)) || []; } catch { return []; }
}
function loadRobotConfig(def) {
  try { return JSON.parse(localStorage.getItem(ROBOT_LS_KEY)) || def; } catch { return def; }
}
function loadRobotCode() {
  try { return JSON.parse(localStorage.getItem(CODE_LS_KEY)) || []; } catch { return []; }
}

// Default robot configuration
const DEFAULT_CONFIG = {
  name:         'Rover X1',
  chassisId:    'rover',
  primaryColor: '#FF8C00',
  accentColor:  '#FFD700',
  movementId:   'wheels',
  headId:       null,
  armId:        null,
  powerId:      'battery',
  lightId:      null,
  sensors:      ['camera'],
  tools:        [],
};

// Pipeline steps shown prominently in header
const PIPELINE_STEPS = [
  { id: 'build',     icon: '🔧', label: 'Build',    step: 1 },
  { id: 'code',      icon: '📝', label: 'Code',     step: 2 },
  { id: 'simulator', icon: '▶️', label: 'Simulate', step: 3 },
];

// ─── Pipeline Bar ──────────────────────────────────────────────────────────
function PipelineBar({ activeTab, onSelect }) {
  const activeStep = PIPELINE_STEPS.findIndex(s => s.id === activeTab);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      background: 'rgba(0,0,0,0.25)', borderRadius: 20,
      padding: '4px 6px',
    }}>
      {PIPELINE_STEPS.map((step, i) => {
        const isActive  = step.id === activeTab;
        const isDone    = activeStep > i;
        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onSelect(step.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 14, border: 'none',
                background: isActive ? '#7c3aed' : isDone ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: isActive ? '#fff' : isDone ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                fontWeight: isActive ? 800 : 600,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 14 }}>{step.icon}</span>
              {step.label}
              {isDone && <span style={{ fontSize: 10, marginLeft: 2 }}>✓</span>}
            </button>
            {i < PIPELINE_STEPS.length - 1 && (
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, margin: '0 2px' }}>→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────
function StudioHeader({ activeTab, setActiveTab, robotConfig, userXP }) {
  const tabs = [
    { id: 'challenges', icon: '🏆', label: 'Challenges' },
    { id: 'myrobots',   icon: '🤖', label: 'My Robots' },
    { id: 'create',     icon: '✨', label: 'Create' },
  ];

  return (
    <header className="bb-studio-header">
      {/* Logo */}
      <div className="bb-studio-logo">
        <div className="bb-studio-logo-icon">🤖</div>
        <span className="bb-studio-logo-text">ByteBuddies</span>
      </div>

      {/* Pipeline (Build → Code → Simulate) */}
      <PipelineBar activeTab={activeTab} onSelect={setActiveTab} />

      {/* Secondary nav */}
      <nav className="bb-studio-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`bb-studio-nav-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="bb-studio-nav-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="bb-studio-user">
        <div className="bb-studio-status">
          <span className="bb-studio-status-dot" />
          {activeTab === 'simulator' ? 'Simulating' : activeTab === 'code' ? 'Coding' : 'Building'}
        </div>
        <div className="bb-studio-xp">
          <span>⭐</span>
          {userXP} XP
        </div>
        <div className="bb-studio-avatar">A</div>
      </div>
    </header>
  );
}

// ─── Main Studio ────────────────────────────────────────────────────────────
export default function ByteBuddiesStudio() {
  const [activeTab, setActiveTab]       = useState('build');
  const [robotConfig, setRobotConfig]   = useState(() => loadRobotConfig(DEFAULT_CONFIG));
  const [robotCode, setRobotCode]       = useState(loadRobotCode);
  const [userXP, setUserXP]             = useState(450);
  const [customParts, setCustomParts]   = useState(loadCustomParts);

  // Persist robot config to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(ROBOT_LS_KEY, JSON.stringify(robotConfig)); } catch { /* ignore */ }
  }, [robotConfig]);

  // Persist robot code to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(CODE_LS_KEY, JSON.stringify(robotCode)); } catch { /* ignore */ }
  }, [robotCode]);

  // Keep customParts in sync with localStorage (other tabs, etc.)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CP_LS_KEY) {
        try { setCustomParts(JSON.parse(e.newValue) || []); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Navigate to Code page (called from Build page)
  const goToCode = useCallback(() => {
    setActiveTab('code');
  }, []);

  // Navigate to simulator
  const goToSimulator = useCallback(() => {
    setActiveTab('simulator');
  }, []);

  // Navigate back to Build with a robot loaded
  const editRobot = useCallback((robot) => {
    setRobotConfig({
      ...DEFAULT_CONFIG,
      name:         robot.name,
      chassisId:    robot.chassisId,
      primaryColor: robot.primaryColor,
      accentColor:  robot.accentColor,
      sensors:      robot.sensors,
      tools:        robot.tools,
    });
    setActiveTab('build');
  }, []);

  // Start challenge → switch to simulator
  const startChallenge = useCallback(() => {
    setActiveTab('simulator');
  }, []);

  const renderBody = () => {
    switch (activeTab) {
      case 'build':
        return (
          <BuildPage
            robotConfig={robotConfig}
            setRobotConfig={setRobotConfig}
            onSimulate={goToCode}
            customParts={customParts}
            onGoCreate={() => setActiveTab('create')}
          />
        );
      case 'code':
        return (
          <CodePage
            robotConfig={robotConfig}
            robotCode={robotCode}
            setRobotCode={setRobotCode}
            onSimulate={goToSimulator}
          />
        );
      case 'simulator':
        return (
          <SimulatorPage robotConfig={robotConfig} robotCode={robotCode} />
        );
      case 'myrobots':
        return (
          <MyRobotsPage
            onEditRobot={editRobot}
            onTestRobot={() => setActiveTab('simulator')}
            onNewRobot={() => { setRobotConfig(DEFAULT_CONFIG); setActiveTab('build'); }}
          />
        );
      case 'challenges':
        return (
          <ChallengesPage onStartChallenge={startChallenge} />
        );
      case 'create':
        return (
          <CustomPartsPage
            customParts={customParts}
            setCustomParts={setCustomParts}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bb-studio">
      <StudioHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        robotConfig={robotConfig}
        userXP={userXP}
      />
      {renderBody()}
    </div>
  );
}
