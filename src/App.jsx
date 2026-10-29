import React, { useState, useEffect, Component, Suspense } from 'react';
import AppMode from './utils/AppMode';
import { lazyWithRetry, isChunkLoadError } from './utils/lazyWithRetry';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { pushMyProgress, syncMyWork } from './utils/classroomStore';
import TopBar from './components/TopBar';
const Sidebar = lazyWithRetry(() => import('./components/Sidebar'));
import Dashboard from './components/Dashboard';
import ExportModal from './components/ExportModal';
import AuthModal from './components/AuthModal';
import LevelUpCelebration from './components/LevelUpCelebration';
import LandingPage, { CONTACT_EMAIL } from './components/LandingPage';
import TeacherHome from './components/TeacherHome';
import SparkStudioDashboard from './components/SparkStudioDashboard';
import { EmojiIcon, IconText } from './components/ui/Icon.jsx';

const WorkspaceEditor = lazyWithRetry(() => import('./components/WorkspaceEditor'));
const LearnSection = lazyWithRetry(() => import('./components/learn/LearnSection.jsx'));
const LearningHub = lazyWithRetry(() => import('./components/LearningHub'));
const Community = lazyWithRetry(() => import('./components/Community'));
const StudentClassroom = lazyWithRetry(() => import('./components/classroom/StudentClassroom.jsx'));
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

function LicenseGate({ status, user, onSignOut }) {
  const verifying = status === 'checking';
  const needsHelp = status === 'unverified';
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, boxSizing: 'border-box', background: 'var(--bg-primary, #0b0b14)', color: 'var(--text-primary, #f8fafc)' }}>
      <section style={{ width: 'min(520px, 100%)', padding: 'clamp(24px, 5vw, 40px)', borderRadius: 22, border: '1px solid var(--border, #29283d)', background: 'var(--bg-secondary, #171729)', boxShadow: '0 22px 70px rgba(0,0,0,.32)', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}><IconText>{verifying ? '🔐' : needsHelp ? '⚠️' : '🏫'}</IconText></div>
        <h1 style={{ margin: '0 0 10px', fontSize: 25 }}>{verifying ? 'Checking your access…' : needsHelp ? 'We couldn’t verify your access' : 'School access required'}</h1>
        <p style={{ margin: '0 auto 22px', maxWidth: 430, color: 'var(--text-muted, #a1a1b8)', lineHeight: 1.65 }}>
          {verifying
            ? 'ByteBuddies is checking the licence for your account.'
            : needsHelp
              ? 'Your account is signed in, but the licence check could not be completed. Please try again or contact ByteBuddies.'
              : status === 'suspended'
                ? 'This school licence is currently paused. Contact ByteBuddies if you think this is a mistake.'
                : `Access for ${user?.email || 'this account'} has not been activated yet. Once your school has agreed its quote, ByteBuddies can switch access on here.`}
        </p>
        {!verifying && <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('ByteBuddies school access')}&body=${encodeURIComponent(`Please help with ByteBuddies access for ${user?.email || ''}.`)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 17px', borderRadius: 10, textDecoration: 'none', color: '#fff', background: 'linear-gradient(110deg,#6366f1,#8b5cf6)', fontWeight: 750 }}><EmojiIcon e="✉️" style={{ marginRight: '0.35em' }} />Contact ByteBuddies</a>
          <button type="button" onClick={onSignOut} style={{ padding: '11px 17px', borderRadius: 10, border: '1px solid var(--border, #29283d)', color: 'var(--text-primary, #f8fafc)', background: 'transparent', fontWeight: 650, cursor: 'pointer' }}>Sign out</button>
        </div>}
      </section>
    </main>
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
            <div style={{ fontSize: 48, marginBottom: 16 }}><EmojiIcon e="🤖" /></div>
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
            <div style={{ fontSize: 48, marginBottom: 16 }}><EmojiIcon e="🔄" /></div>
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
        <h2><EmojiIcon e="⚠️" style={{ marginRight: '0.35em' }} />Runtime Error</h2>
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
  const [authMode, setAuthMode] = useState('login');
  const { user, isLoggedIn, login, logout, licenseStatus } = useUser();
  const learnWithoutLogin = currentPage === 'learn';

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

  useEffect(() => {
    if (isLoggedIn) return;
    const { page, raw } = parseHash();
    if (page === 'login') {
      setAuthRole(null);
      setShowAuth(true);
      return;
    }
    if (page && KNOWN_PAGES.has(page)) {
      sessionStorage.setItem('bb_post_login_hash', page === 'classroom' ? raw : page);
    }
  }, [isLoggedIn, currentPage]);

  // Pupils in a class share their lesson/mission progress with their teacher as they move around.
  useEffect(() => {
    if (isLoggedIn && user.role !== 'teacher' && user.classroomId) {
      pushMyProgress(user.classroomId, user);
      syncMyWork(user.classroomId, user);
    }
  }, [currentPage, isLoggedIn, user.classroomId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentPage === 'learningHub') {
      window.location.replace('#learn');
    }
  }, [currentPage]);

  const finishLocalLogin = (profile) => {
    login(profile);
    const dest = sessionStorage.getItem('bb_post_login_hash') || 'dashboard';
    sessionStorage.removeItem('bb_post_login_hash');
    window.location.hash = dest;
  };

  const renderPage = () => {
    if (currentPage === 'gamebuilder' && !isLoggedIn) {
      return <Dashboard onNavigate={navigate} />;
    }

    switch (currentPage) {
      case 'dashboard':  return user.role === 'teacher'
        ? <TeacherHome onNavigate={navigate} />
        : <SparkStudioDashboard onNavigate={navigate} />;
      case 'workspace':  return <WorkspaceEditor />;
      case 'learn':      return <LearnSection subPath={subPath} />;
      case 'learningHub':return <LearningHub />;
      case 'community':  return <Community onNavigate={navigate} />;
      case 'classroom':  return user.role === 'teacher'
        ? <TeacherDashboard onNavigate={navigate} subPath={subPath} />
        : <StudentClassroom />;
      case 'gamebuilder':return <GameBuilder />;
      case 'settings':   return <Settings />;
      case 'challenges': return <Challenges onNavigate={navigate} />;
      case 'parent':     return <ParentDashboard onNavigate={navigate} />;
      case 'vrd':        return <RobotDesignerPage />;
      case 'academy':    return <VirtualRobotDesignerApp />;
      case 'studio':     return <ByteBuddiesStudio onExit={() => navigate('dashboard')} />;
      case 'robot':      return <RobotPanel onNavigate={navigate} />;
      case 'admin':      return <AdminPanel />;
      case 'missions':   return <MissionMode onNavigate={navigate} subPath={subPath} />;
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

  // A browser-stored login flag is not a paid-access grant. Protected pages
  // stay unavailable until Firebase confirms an active account licence.
  // Local development only: the "Dev guest" button has no Firebase account to licence
  const devGuest = import.meta.env.DEV && user?.email === 'guest@localhost.dev';
  if (isLoggedIn && !devGuest && currentPage !== 'admin' && currentPage !== 'learn' && licenseStatus !== 'active') {
    return <LicenseGate status={licenseStatus} user={user} onSignOut={logout} />;
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

  // Standalone 3D apps skip the main shell.

  if (!isLoggedIn && !learnWithoutLogin) return (
    <>
      <LandingPage
        onLogin={() => { setAuthRole(null); setAuthMode('login'); setShowAuth(true); }}
        onTeacherLogin={() => { setAuthRole('teacher'); setAuthMode('login'); setShowAuth(true); }}
        onSignup={() => { setAuthRole(null); setAuthMode('signup'); setShowAuth(true); }}
        onDevGuest={import.meta.env.DEV ? () => {
          sessionStorage.setItem('bb_post_login_hash', 'learn');
          finishLocalLogin({
            name: 'Local Guest',
            // dev only: sessionStorage bb_dev_guest_role = 'teacher' to check the teacher views
            role: sessionStorage.getItem('bb_dev_guest_role') === 'teacher' ? 'teacher' : 'student',
            avatar: 'LG',
            avatarEmoji: '🎓',
            email: 'guest@localhost.dev',
          });
        } : undefined}
      />
      {showAuth && (
        <AuthModal
          key={`${authMode}-${authRole || 'pick'}`}
          onClose={() => { setShowAuth(false); setAuthRole(null); }}
          initialRole={authRole}
          initialMode={authMode}
        />
      )}
    </>
  );

  if (!isLoggedIn && learnWithoutLogin) {
    return (
      <div className="app-layout" style={{ height: '100vh', height: '100dvh' }}>
        <ErrorBoundary key="learn-preview">
          <Suspense fallback={<PageLoader />}>
            <LearnSection subPath={subPath} />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }

  const mobileNav = [
    { id: 'dashboard',  icon: '🏠', label: 'Home' },
    { id: 'workspace',  icon: '🐍', label: 'Python' },
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
        {currentPage === 'gamebuilder' && (
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
            <span className="nav-icon" aria-hidden="true"><EmojiIcon e={btn.icon} /></span>
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
          <AppInner />
        </ProjectProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
