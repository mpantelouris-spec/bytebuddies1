import React, { useState, useEffect, Component, Suspense } from 'react';
import AppMode from './utils/AppMode';
import { lazyWithRetry, isChunkLoadError } from './utils/lazyWithRetry';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ClassroomProvider } from './contexts/ClassroomContext';
import TopBar from './components/TopBar';
const Sidebar = lazyWithRetry(() => import('./components/Sidebar'));
import Dashboard from './components/Dashboard';
import ExportModal from './components/ExportModal';
import AuthModal from './components/AuthModal';
import LevelUpCelebration from './components/LevelUpCelebration';
import LandingPage from './components/LandingPage';
import TeacherHome from './components/TeacherHome';
import SparkStudioDashboard from './components/SparkStudioDashboard';

const WorkspaceEditor = lazyWithRetry(() => import('./components/WorkspaceEditor'));
const LearnSection = lazyWithRetry(() => import('./components/learn/LearnSection.jsx'));
const LearningHub = lazyWithRetry(() => import('./components/LearningHub'));
const Community = lazyWithRetry(() => import('./components/Community'));
const Classroom = lazyWithRetry(() => import('./components/Classroom'));
const GameBuilder = lazyWithRetry(() => import('./components/GameBuilder'));
const Settings = lazyWithRetry(() => import('./components/Settings'));
const Challenges = lazyWithRetry(() => import('./components/Challenges'));
const ParentDashboard = lazyWithRetry(() => import('./components/ParentDashboard'));
const RobotPanel = lazyWithRetry(() => import('./components/RobotPanel'));
const RobotDesignerPage = lazyWithRetry(() => import('./virtual-robot-designer/RobotDesignerPage.jsx'));
const ByteBuddiesStudio = lazyWithRetry(() => import('./virtual-robot-designer/ByteBuddiesStudio.jsx'));
const VirtualRobotDesignerApp = lazyWithRetry(() => import('./virtual-robot-designer/VirtualRobotDesignerApp.jsx'));
const TeacherDashboard = lazyWithRetry(() => import('./components/TeacherDashboard'));
const AdminPanel = lazyWithRetry(() => import('./components/AdminPanel'));
const MissionMode = lazyWithRetry(() => import('./components/MissionMode'));
const Portfolio = lazyWithRetry(() => import('./components/Portfolio'));
const WhitePaper = lazyWithRetry(() => import('./components/WhitePaper'));
const RainbowSimulatorPage = lazyWithRetry(() => import('./pages/RainbowSimulatorPage.tsx'));

const KNOWN_PAGES = new Set([
  'dashboard', 'workspace', 'learn', 'learningHub', 'community', 'classroom',
  'gamebuilder', 'settings', 'challenges', 'parent', 'vrd', 'academy', 'studio',
  'robot', 'admin', 'missions', 'portfolio', 'whitepaper', 'rainbow-sim',
]);

function parseHash() {
  const raw = window.location.hash.replace('#', '') || 'dashboard';
  const [pathPart, queryPart] = raw.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const page = segments[0] || 'dashboard';
  const subPath = segments.slice(1).join('/');
  const params = new URLSearchParams(queryPart || '');
  return { page, subPath, params, raw };
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', color: '#94a3b8', fontFamily: 'system-ui' }}>
      Loading…
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(error, info) {
    console.error('[ByteBuddies ErrorBoundary]', error, info?.componentStack);
    try {
      window.__BB_LAST_ERROR = {
        message: error?.message || String(error),
        stack: error?.stack || '',
        componentStack: info?.componentStack || '',
      };
    } catch { /* ignore */ }
  }
  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || '';
      const isChunk = isChunkLoadError(this.state.error);
      if (/webgl/i.test(msg)) {
        return (
          <div style={{ padding: 40, color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', background: '#0f0f1a', minHeight: '100vh', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <h2 style={{ color: '#a5b4fc', marginBottom: 12 }}>Open ByteBuddies in Chrome</h2>
            <p style={{ color: '#94a3b8', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.6 }}>
              3D graphics could not start in this window. Use Chrome, Safari, or Edge with hardware acceleration on — not a built-in preview pane.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ padding: '12px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
            >
              Try again
            </button>
          </div>
        );
      }
      if (isChunk) {
        return (
          <div style={{ padding: 40, color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', background: '#0f0f1a', minHeight: '100vh', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
            <h2 style={{ color: '#a5b4fc', marginBottom: 12 }}>ByteBuddies just updated</h2>
            <p style={{ color: '#94a3b8', maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Your browser had an old version saved. Click reload — Robot Lab will open normally.
            </p>
            <button
              type="button"
              onClick={() => { sessionStorage.removeItem('bb_chunk_reload_attempted'); window.location.reload(); }}
              style={{ padding: '12px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
            >
              Reload ByteBuddies
            </button>
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 20 }}>Or press Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)</p>
          </div>
        );
      }
      return (
      <div style={{ padding: 40, color: '#f87171', fontFamily: 'monospace', background: '#0f0f1a', minHeight: '100vh' }}>
        <h2>⚠️ Runtime Error</h2>
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16, color: '#fca5a5', fontSize: 13 }}>
          {msg}{'\n\n'}{this.state.error?.stack}
        </pre>
        <button onClick={() => { this.setState({ error: null }); window.location.hash = 'dashboard'; }}
          style={{ marginTop: 20, padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          ← Back to Dashboard
        </button>
      </div>
    );
    }
    return this.props.children;
  }
}

function AppInner() {
  const [{ page: currentPage, subPath }, setRoute] = useState(parseHash);
  const [showExport, setShowExport] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authRole, setAuthRole] = useState(null);
  const { user, isLoggedIn } = useUser();

  const navigate = (page) => {
    window.location.hash = page;
  };

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      const oldMode = AppMode.getCurrentMode(currentPage);
      const newMode = AppMode.getCurrentMode(next.page);
      setRoute(next);
      if (oldMode !== newMode) {
        AppMode.notifyModeChange(oldMode, newMode, next.page);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) {
      window.location.replace('#dashboard');
    }
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [currentPage]);

  // Legacy deep links: #vrd/test → #academy (simulator)
  useEffect(() => {
    if (currentPage === 'vrd' && subPath === 'test') {
      window.location.replace('#academy');
    }
  }, [currentPage, subPath]);

  useEffect(() => {
    if (currentPage === 'gamebuilder' && !isLoggedIn) {
      navigate('dashboard');
    }
  }, [currentPage, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      document.documentElement.classList.add('landing-open');
      return () => document.documentElement.classList.remove('landing-open');
    }
    document.documentElement.classList.remove('landing-open');
    return undefined;
  }, [isLoggedIn]);

  const renderPage = () => {
    if (currentPage === 'gamebuilder' && !isLoggedIn) {
      return <Dashboard onNavigate={navigate} />;
    }

    switch (currentPage) {
      case 'dashboard':  return user.role === 'teacher'
        ? <TeacherHome onNavigate={navigate} />
        : <SparkStudioDashboard onNavigate={navigate} />;
      case 'workspace':  return <WorkspaceEditor />;
      case 'learn':      return <LearnSection />;
      case 'learningHub':return <LearningHub />;
      case 'community':  return <Community />;
      case 'classroom':  return user.role === 'teacher'
        ? <TeacherDashboard onNavigate={navigate} />
        : <Classroom />;
      case 'gamebuilder':return <GameBuilder />;
      case 'settings':   return <Settings />;
      case 'challenges': return <Challenges onNavigate={navigate} />;
      case 'parent':     return <ParentDashboard onNavigate={navigate} />;
      case 'vrd':        return <RobotDesignerPage />;
      case 'academy':    return <VirtualRobotDesignerApp />;
      case 'studio':     return <ByteBuddiesStudio />;
      case 'robot':      return <RobotPanel onNavigate={navigate} />;
      case 'admin':      return <AdminPanel />;
      case 'missions':   return <MissionMode onNavigate={navigate} />;
      case 'portfolio':  return <Portfolio onNavigate={navigate} />;
      case 'whitepaper': return <WhitePaper />;
      case 'rainbow-sim': return <RainbowSimulatorPage />;
      default:           return KNOWN_PAGES.has(currentPage)
        ? <Dashboard onNavigate={navigate} />
        : <Dashboard onNavigate={navigate} />;
    }
  };

  if (currentPage === 'whitepaper') {
    return (
      <Suspense fallback={<PageLoader />}>
        <WhitePaper />
      </Suspense>
    );
  }

  const isStandaloneApp = currentPage === 'vrd' || currentPage === 'robot' || currentPage === 'studio' || currentPage === 'academy' || currentPage === 'rainbow-sim';

  if (isStandaloneApp) {
    return (
      <div className="app-layout" style={{ height: '100vh' }}>
        <ErrorBoundary key={currentPage}>
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </ErrorBoundary>
        {user.leveledUp && <LevelUpCelebration />}
      </div>
    );
  }

  if (!isLoggedIn) return (
    <>
      <LandingPage
        onLogin={() => { setAuthRole('teacher'); setShowAuth(true); }}
        onSignup={() => { setAuthRole('student'); setShowAuth(true); }}
      />
      {showAuth && <AuthModal key={authRole} onClose={() => { setShowAuth(false); setAuthRole(null); }} initialRole={authRole} />}
    </>
  );

  const mobileNav = [
    { id: 'dashboard',  icon: '🏠', label: 'Home' },
    { id: 'workspace',  icon: '💻', label: 'Code' },
    { id: 'learn',      icon: '📚', label: 'Learn' },
    { id: 'studio',     icon: '🤖', label: 'Studio' },
    { id: 'gamebuilder',icon: '🎮', label: 'Games' },
    { id: 'missions',   icon: '🗺️', label: 'Missions' },
    { id: 'community',  icon: '👥', label: 'Community' },
    { id: 'settings',   icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="app-layout">
      <TopBar
        currentPage={currentPage}
        onNavigate={navigate}
        onExport={() => setShowExport(true)}
        onAuth={() => setShowAuth(true)}
      />
      <div className="app-main">
        {(currentPage === 'workspace' || currentPage === 'gamebuilder') && (
          <Suspense fallback={null}>
            <Sidebar currentPage={currentPage} />
          </Suspense>
        )}
        <div className="app-content">
          <ErrorBoundary key={currentPage}>
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Main navigation">
        {mobileNav.map(btn => (
          <button
            key={btn.id}
            type="button"
            className={`mobile-bottom-nav-btn ${currentPage === btn.id ? 'active' : ''}`}
            onClick={() => navigate(btn.id)}
            aria-current={currentPage === btn.id ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </nav>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {user.leveledUp && <LevelUpCelebration />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ProjectProvider>
          <ClassroomProvider>
            <AppInner />
          </ClassroomProvider>
        </ProjectProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
