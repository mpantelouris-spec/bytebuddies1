/**
 * ByteBuddiesStudio.jsx
 * Root component for the Robot Invention Studio.
 * Handles tab routing and shared robot config state.
 */
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import BuildPage       from './studio/BuildPage.jsx';
import CodePage        from './studio/CodePage.jsx';
import SimulatorPage   from './studio/SimulatorPage.jsx';
import MyRobotsPage    from './studio/MyRobotsPage.jsx';
import ChallengesPage  from './studio/ChallengesPage.jsx';
import CustomPartsPage from './studio/CustomPartsPage.jsx';
import DevDebugPanel   from './studio/DevDebugPanel.jsx';
import { validateRobot, validateCode, runPreflight } from './services/robotValidator.js';
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

// Validation summary badge colors
const BADGE_STYLE = {
  ok:      { bg: '#14532d', border: '#22c55e', color: '#86efac', icon: '✓' },
  warning: { bg: '#431407', border: '#f97316', color: '#fdba74', icon: '⚠' },
  error:   { bg: '#450a0a', border: '#ef4444', color: '#fca5a5', icon: '✕' },
};

// ─── Validation Health Badge ────────────────────────────────────────────────
function HealthBadge({ summary, onClick }) {
  if (!summary) return null;
  const style = BADGE_STYLE[summary.level] || BADGE_STYLE.ok;
  return (
    <button
      onClick={onClick}
      title="Click to see robot health details"
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 12,
        border: `1px solid ${style.border}`,
        background: style.bg, color: style.color,
        fontSize: 11, fontWeight: 700, cursor: 'pointer',
        transition: 'opacity 0.2s',
      }}
    >
      <span>{style.icon}</span>
      {summary.label}
    </button>
  );
}

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
function StudioHeader({ activeTab, setActiveTab, robotConfig, userXP, robotValidation, onLogoClick }) {
  const tabs = [
    { id: 'challenges', icon: '🏆', label: 'Challenges' },
    { id: 'myrobots',   icon: '🤖', label: 'My Robots' },
    { id: 'create',     icon: '✨', label: 'Create' },
  ];

  return (
    <header className="bb-studio-header">
      {/* Logo — click 5× to open DevTools */}
      <div
        className="bb-studio-logo"
        onClick={onLogoClick}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        title="ByteBuddies Studio"
      >
        <div className="bb-studio-logo-icon">🤖</div>
        <span className="bb-studio-logo-text">ByteBuddies</span>
      </div>

      {/* Pipeline (Build → Code → Simulate) */}
      <PipelineBar activeTab={activeTab} onSelect={setActiveTab} />

      {/* Robot health badge */}
      {robotValidation?.summary && (
        <HealthBadge summary={robotValidation.summary} />
      )}

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
  const [devMode, setDevMode]           = useState(false);
  const [fps, setFps]                   = useState(null);
  const logoClickCount                  = useRef(0);
  const logoClickTimer                  = useRef(null);

  // ── Computed validation (live, memoized) ──────────────────────────────────
  const robotValidation = useMemo(
    () => validateRobot(robotConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(robotConfig)]
  );
  const codeValidation = useMemo(
    () => validateCode(robotCode, robotConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(robotCode), JSON.stringify(robotConfig)]
  );
  const preflight = useMemo(
    () => runPreflight(robotConfig, robotCode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(robotConfig), JSON.stringify(robotCode)]
  );

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

  // Dev mode: Shift+D keyboard shortcut
  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey && e.key === 'D') setDevMode(d => !d);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Dev mode: 5× logo click
  const handleLogoClick = useCallback(() => {
    logoClickCount.current++;
    clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 2000);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      setDevMode(d => !d);
    }
  }, []);

  const goToCode      = useCallback(() => setActiveTab('code'), []);
  const goToSimulator = useCallback(() => setActiveTab('simulator'), []);

  const editRobot = useCallback((robot) => {
    setRobotConfig({ ...DEFAULT_CONFIG, ...robot });
    setActiveTab('build');
  }, []);

  const startChallenge = useCallback(() => setActiveTab('simulator'), []);

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
            robotValidation={robotValidation}
          />
        );
      case 'code':
        return (
          <CodePage
            robotConfig={robotConfig}
            robotCode={robotCode}
            setRobotCode={setRobotCode}
            onSimulate={goToSimulator}
            codeValidation={codeValidation}
          />
        );
      case 'simulator':
        return (
          <SimulatorPage
            robotConfig={robotConfig}
            robotCode={robotCode}
            preflight={preflight}
            onFpsUpdate={setFps}
          />
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
        return <ChallengesPage onStartChallenge={startChallenge} />;
      case 'create':
        return <CustomPartsPage customParts={customParts} setCustomParts={setCustomParts} />;
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
        robotValidation={robotValidation}
        onLogoClick={handleLogoClick}
      />
      {renderBody()}

      {/* Developer debug panel — hidden by default, Shift+D or logo×5 */}
      {devMode && (
        <DevDebugPanel
          robotConfig={robotConfig}
          robotCode={robotCode}
          robotValidation={robotValidation}
          codeValidation={codeValidation}
          preflight={preflight}
          fps={fps}
          onClose={() => setDevMode(false)}
        />
      )}
    </div>
  );
}
