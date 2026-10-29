/**
 * ByteBuddiesStudio.jsx
 * Root component for the Robot Invention Studio.
 * Handles tab routing and shared robot config state.
 */
import { Icon, EmojiIcon } from '../components/ui/Icon.jsx';
import ProfileAvatar from '../components/ui/ProfileAvatar.jsx';
import { useUser } from '../contexts/UserContext';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import BuildPage          from './studio/BuildPage.jsx';
import LiveLabPage        from './studio/LiveLabPage.jsx';
import MyRobotsPage       from './studio/MyRobotsPage.jsx';
import ChallengesPage     from './studio/ChallengesPage.jsx';
import DevDebugPanel      from './studio/DevDebugPanel.jsx';
import ArcadeLab          from './arcade/ArcadeLab.jsx';
import CreateHub          from './create/CreateHub.jsx';
import { makeArenaGame, BUILTIN_ARENAS, loadMyArenas } from './arcade/games/arena.js';
import { arenaToLabCourse } from './studio/CustomArenaLab.js';
import { isArcadeChassis, RENAMED_ARCADE } from './arcade/games/index.js';
import { CHASSIS_DATA } from './services/studio-robot-builder.js';
import { validateRobot, validateCode, runPreflight } from './services/robotValidator.js';
import { GameProgress } from './services/game-progress.js';
import { trackToRaceCourse } from './create/raceTracks.js';
import { saveRobotToLibrary, asPrebuiltRobot, isCreatedRobot } from './services/studio-robot-store.js';
import './styles/studio.css';

const CP_LS_KEY = 'bb-studio-custom-parts';
const ROBOT_LS_KEY = 'bb-studio-robot';
const CODE_LS_KEY  = 'bb-studio-code';


function loadCustomParts() {
  try { return JSON.parse(localStorage.getItem(CP_LS_KEY)) || []; } catch { return []; }
}
function loadRobotConfig(def) {
  try {
    const saved = JSON.parse(localStorage.getItem(ROBOT_LS_KEY));
    if (saved && RENAMED_ARCADE[saved.chassisId]) saved.chassisId = RENAMED_ARCADE[saved.chassisId];
    return saved ? { ...def, ...saved } : def;
  } catch { return def; }
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
  trimColor:         '#FFD700',
  wheelColor:        '#1a1a1a',
  ledColor:          '#00D9FF',
  materialMetalness: 0.4,
  materialRoughness: 0.5,
  materialGlow:      1.0,
  movementId:   'wheels',
  headId:       null,
  armId:        null,
  powerId:      'battery',
  lightId:      null,
  sensors:      ['camera'],
  tools:        [],
  aiId:         null,
  commId:       null,
  aiModules:    [],
  commParts:    [],
  structParts:  [],
  decoParts:    [],
  legoParts:    [],
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
        transition: 'opacity 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      <span><EmojiIcon e={style.icon} /></span>
      {summary.label}
    </button>
  );
}

// Pipeline steps shown prominently in header
const PIPELINE_STEPS = [
  { id: 'build', icon: '🔧', label: 'Build', step: 1 },
  { id: 'lab',   icon: '🚀', label: 'Code + Simulate', step: 2 },
];

// ─── Pipeline Bar ──────────────────────────────────────────────────────────
function PipelineBar({ activeTab, onSelect }) {
  const activeStep = PIPELINE_STEPS.findIndex(s => s.id === activeTab);
  return (
    <div className="bb-studio-pipeline" style={{
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
              <EmojiIcon e={step.icon} size="1.05em" />
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
function StudioUserAvatar() {
  const { user } = useUser() || {};
  return <ProfileAvatar value={user?.avatarEmoji} name={user?.name} size={34} />;
}

function StudioHeader({ activeTab, setActiveTab, robotConfig, userXP, robotValidation, onLogoClick, onExit }) {
  const tabs = [
    { id: 'challenges', icon: '🏆', label: 'Challenges' },
    { id: 'myrobots',   icon: '🤖', label: 'My Robots' },
    { id: 'create',     icon: '✨', label: 'Create' },
  ];

  return (
    <header className="bb-studio-header">
      {onExit && (
        <button
          type="button"
          className="bb-studio-exit"
          onClick={onExit}
          title="Back to homepage"
          aria-label="Back to homepage"
        >
          <Icon name="arrow-left" />
          <span className="bb-studio-exit-label">Back</span>
        </button>
      )}
      {/* Logo — click 5× to open DevTools */}
      <div
        className="bb-studio-logo"
        onClick={onLogoClick}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        title="ByteBuddies Studio"
      >
        <img className="bb-studio-logo-mascot" src="/images/bytebuddies-mascot-head.webp" alt="" draggable="false" />
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
            title={tab.label}
            aria-label={tab.label}
          >
            <span className="bb-studio-nav-icon"><EmojiIcon e={tab.icon} /></span>
            <span className="bb-studio-nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="bb-studio-user">
        <div className="bb-studio-status">
          <span className="bb-studio-status-dot" />
          {activeTab === 'simulator' || activeTab === 'lab' || activeTab === 'code' ? 'Live Lab' : activeTab === 'build' ? 'Building' : 'Exploring'}
        </div>
        <div className="bb-studio-xp">
          <Icon name="star" color="#fde047" />
          {userXP} XP
        </div>
        <StudioUserAvatar />
      </div>
    </header>
  );
}

// ─── Main Studio ────────────────────────────────────────────────────────────
export default function ByteBuddiesStudio({ onExit }) {
  const [activeTab, setActiveTab]       = useState('build');
  const [robotConfig, setRobotConfig]   = useState(() => loadRobotConfig(DEFAULT_CONFIG));
  const [robotCode, setRobotCode]       = useState(loadRobotCode);
  const [userXP, setUserXP]             = useState(0);
  const [labChallenge, setLabChallenge] = useState(null);
  // An Arena Maker arena being played: it opens in the lab whatever robot is selected
  const [myArenaRun, setMyArenaRun] = useState(null);
  useEffect(() => { if (activeTab !== 'lab') setMyArenaRun(null); }, [activeTab]);
  // My Robots → open a created robot (or a new one) straight in the Robot Builder
  const [createOpen, setCreateOpen] = useState(null);
  useEffect(() => { if (activeTab !== 'create') setCreateOpen(null); }, [activeTab]);
  const [arenaPlay, setArenaPlay]       = useState({ id: null, key: 0 });
  const [customParts, setCustomParts]   = useState(loadCustomParts);
  const [devMode, setDevMode]           = useState(false);
  const [fps, setFps]                   = useState(null);
  const logoClickCount                  = useRef(0);
  const logoClickTimer                  = useRef(null);

  useEffect(() => {
    const name = robotConfig?.name || 'Robot';
    setUserXP(GameProgress.get(name).xp || 0);
  }, [activeTab, robotConfig?.name]);

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

  const [saveToast, setSaveToast] = useState('');
  const showSaved = useCallback((name) => {
    setSaveToast(`💾 Saved “${name}” to My Robots`);
    setTimeout(() => setSaveToast(''), 2600);
  }, []);

  const applyRobot = useCallback((cfg) => {
    if (!cfg) return null;
    const next = { ...DEFAULT_CONFIG, ...cfg };
    try {
      // Keep the saved id and name so the next save updates this robot instead of adding another
      const { entry } = saveRobotToLibrary(next);
      setRobotConfig({ ...next, id: entry.id, name: entry.name });
      return entry;
    } catch { setRobotConfig(next); return null; }
  }, []);

  // Create Studio "Save robot": store it as its own robot in My Robots without swapping
  // the robot currently in use (that only happens on Test drive / Play)
  const saveCreatedRobot = useCallback((cfg) => {
    if (!cfg) return null;
    try { return saveRobotToLibrary({ ...DEFAULT_CONFIG, ...cfg }, { makeCurrent: false }).entry; } catch { return null; }
  }, []);

  // Build page "Save Design": save the robot on screen to My Robots
  const saveDesign = useCallback(() => {
    try {
      const { entry } = saveRobotToLibrary(robotConfig);
      setRobotConfig((c) => ({ ...c, id: entry.id, name: entry.name }));
      showSaved(entry.name);
    } catch { /* ignore */ }
  }, [robotConfig, showSaved]);

  const goToLab = useCallback(() => setActiveTab('lab'), []);

  const editRobot = useCallback((robot) => {
    setRobotConfig({ ...DEFAULT_CONFIG, ...robot, chassisId: RENAMED_ARCADE[robot?.chassisId] || robot?.chassisId });
    setActiveTab('build');
  }, []);

  const testRobot = useCallback((robot) => {
    setMyArenaRun(null);
    setRobotConfig({ ...DEFAULT_CONFIG, ...robot, chassisId: RENAMED_ARCADE[robot?.chassisId] || robot?.chassisId });
    setLabChallenge(null);
    setActiveTab('lab');
  }, []);

  const startChallenge = useCallback((challenge) => {
    setLabChallenge(challenge || null);
    setActiveTab('lab');
  }, []);
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__bbPlayTrack = (track) => { const course = trackToRaceCourse(track); setMyArenaRun(course); startChallenge(course); };
  }

  // Jump straight into an arcade game: switch to that robot (keeping the paint job) and open its game.
  const playArcade = useCallback((chassisId) => {
    setMyArenaRun(null);
    if (chassisId === 'arenaquest') { setArenaPlay((a) => ({ id: null, key: a.key + 1 })); setActiveTab('arena'); return; }
    const ch = CHASSIS_DATA.find((c) => c.id === chassisId);
    setRobotConfig((prev) => (prev.chassisId === chassisId && !isCreatedRobot(prev) ? prev : {
      ...asPrebuiltRobot(prev),
      chassisId,
      name: ch?.name || prev.name,
      primaryColor: ch?.primaryColor || prev.primaryColor,
      accentColor: ch?.accentColor || prev.accentColor,
      movementId: chassisId === 'jumpbot' ? 'legs' : 'wheels',
      socketAttachments: {},
    }));
    setLabChallenge(null);
    setActiveTab('lab');
  }, []);

  const renderBody = () => {
    switch (activeTab) {
      case 'build':
        return (
          <BuildPage
            robotConfig={robotConfig}
            setRobotConfig={setRobotConfig}
            onSimulate={goToLab}
            customParts={customParts}
            onGoCreate={() => setActiveTab('create')}
            robotValidation={robotValidation}
            onSaveDesign={saveDesign}
          />
        );
      case 'lab':
      case 'code':
      case 'simulator':
        // Arcade robots have their own game screen.
        if (isArcadeChassis(robotConfig?.chassisId) && !myArenaRun) {
          return <ArcadeLab key={robotConfig.chassisId} robotConfig={robotConfig} onBack={() => setActiveTab('build')} />;
        }
        return (
          <LiveLabPage
            robotConfig={robotConfig}
            robotCode={robotCode}
            setRobotCode={setRobotCode}
            preflight={preflight}
            onFpsUpdate={setFps}
            initialChallenge={labChallenge}
            initialCourseId={labChallenge?.id || labChallenge?.arenaType || null}
            onChallengeConsumed={() => setLabChallenge(null)}
            onExit={onExit}
          />
        );
      case 'myrobots':
        return (
          <MyRobotsPage
            onEditRobot={editRobot}
            onTestRobot={testRobot}
            onEditCreated={(r) => { setCreateOpen(r); setActiveTab('create'); }}
            onBuildNew={() => { setCreateOpen('new'); setActiveTab('create'); }}
            onNewRobot={() => { setRobotConfig(DEFAULT_CONFIG); setActiveTab('build'); }}
          />
        );
      case 'challenges':
        return <ChallengesPage onStartChallenge={startChallenge} onPlayArcade={playArcade} robotName={robotConfig.name} />;
      case 'create':
        return (
          <CreateHub
            openRobot={createOpen}
            robotConfig={robotConfig}
            onSaveRobot={saveCreatedRobot}
            onPlayRobot={(cfg) => { const entry = applyRobot(cfg); setArenaPlay((a) => ({ id: null, key: a.key + 1 })); setActiveTab('lab'); return entry; }}
            onPlayArena={(id) => { setArenaPlay((a) => ({ id, key: a.key + 1 })); setActiveTab('arena'); }}
            onPlayMyArena={(arena) => { const course = arenaToLabCourse(arena); setMyArenaRun(course); startChallenge(course); }}
            onPlayMyTrack={(track) => { const course = trackToRaceCourse(track); setMyArenaRun(course); startChallenge(course); }}
            onChooseRobot={(choice) => {
              if (choice.made) setRobotConfig({ ...DEFAULT_CONFIG, ...choice.made });
              else if (choice.chassis) {
                const ch = choice.chassis;
                setRobotConfig((prev) => ({
                  ...asPrebuiltRobot(prev), chassisId: ch.id, name: ch.name, socketAttachments: {},
                  primaryColor: ch.primaryColor || prev.primaryColor, accentColor: ch.accentColor || prev.accentColor,
                  movementId: ({ wheels: 'wheels', wheels6: 'wheels6', tracks: 'tracks', legs: 'legs', flying: 'flying', hover: 'flying', swim: 'flying', jets: 'jets' })[ch.movementHint] || prev.movementId,
                }));
              }
            }}
          />
        );
      case 'arena':
        return (
          <ArcadeLab
            key={`arena-${arenaPlay.key}`}
            robotConfig={robotConfig}
            gameOverride={makeArenaGame([...BUILTIN_ARENAS, ...loadMyArenas()])}
            startLevelId={arenaPlay.id}
            onBack={() => setActiveTab('create')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bb-studio">
      {saveToast && (
        <div role="status" style={{ position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>{saveToast}</div>
      )}
      <StudioHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        robotConfig={robotConfig}
        userXP={userXP}
        robotValidation={robotValidation}
        onLogoClick={handleLogoClick}
        onExit={onExit}
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
