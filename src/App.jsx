import React, { useState, useEffect, Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 40, color: '#f87171', fontFamily: 'monospace', background: '#0f0f1a', minHeight: '100vh' }}>
        <h2>⚠️ Runtime Error</h2>
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16, color: '#fca5a5', fontSize: 13 }}>
          {this.state.error?.message}{'\n\n'}{this.state.error?.stack}
        </pre>
        <button onClick={() => { this.setState({ error: null }); window.location.hash = 'dashboard'; }}
          style={{ marginTop: 20, padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          ← Back to Dashboard
        </button>
      </div>
    );
    return this.props.children;
  }
}
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ClassroomProvider } from './contexts/ClassroomContext';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import WorkspaceEditor from './components/WorkspaceEditor';
import Dashboard from './components/Dashboard';
import LearningHub from './components/LearningHub';
import Community from './components/Community';
import Classroom from './components/Classroom';
import GameBuilder from './components/GameBuilder';
import ExportModal from './components/ExportModal';
import AuthModal from './components/AuthModal';
import Settings from './components/Settings';
import Challenges from './components/Challenges';
import LevelUpCelebration from './components/LevelUpCelebration';
import ParentDashboard from './components/ParentDashboard';
import RobotPanel from './components/RobotPanel';
import LandingPage from './components/LandingPage';
import TeacherDashboard from './components/TeacherDashboard';
import TeacherHome from './components/TeacherHome';
import AdminPanel from './components/AdminPanel';
import MissionMode from './components/MissionMode';
import Portfolio from './components/Portfolio';
import WhitePaper from './components/WhitePaper';

/* Inner app — has access to UserContext */
function AppInner() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });
  const [showExport, setShowExport] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authRole, setAuthRole] = useState(null);
  const { user, isLoggedIn } = useUser();

  // Navigate: set hash — browser automatically adds a history entry
  const navigate = (page) => {
    window.location.hash = page;
  };

  // Sync React state whenever the hash changes (back/forward/direct navigate)
  useEffect(() => {
    const onHashChange = () => {
      const page = window.location.hash.replace('#', '') || 'dashboard';
      setCurrentPage(page);
    };
    window.addEventListener('hashchange', onHashChange);
    // Set initial hash if not already set
    if (!window.location.hash) {
      window.location.replace('#dashboard');
    }
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return user.role === 'teacher'
        ? <TeacherHome onNavigate={navigate} />
        : <Dashboard onNavigate={navigate} />;
      case 'workspace':  return <WorkspaceEditor />;
      case 'learn':      return <LearningHub />;
      case 'community':  return <Community />;
      case 'classroom':  return user.role === 'teacher'
        ? <TeacherDashboard onNavigate={navigate} />
        : <Classroom />;
      case 'gamebuilder':return <GameBuilder />;
      case 'settings':   return <Settings />;
      case 'challenges': return <Challenges onNavigate={navigate} />;
      case 'parent':     return <ParentDashboard onNavigate={navigate} />;
      case 'robot':      return <RobotPanel />;
      case 'admin':      return <AdminPanel />;
      case 'missions':   return <MissionMode onNavigate={navigate} />;
      case 'portfolio':  return <Portfolio onNavigate={navigate} />;
      case 'whitepaper': return <WhitePaper />;
      default:           return <WorkspaceEditor />;
    }
  };

  if (currentPage === 'whitepaper') return <WhitePaper />;

  if (!isLoggedIn) return (
    <>
      <LandingPage
        onLogin={() => { setAuthRole('teacher'); setShowAuth(true); }}
        onSignup={() => { setAuthRole('student'); setShowAuth(true); }}
      />
      {showAuth && <AuthModal key={authRole} onClose={() => { setShowAuth(false); setAuthRole(null); }} initialRole={authRole} />}
    </>
  );

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
          <Sidebar currentPage={currentPage} />
        )}
        <div className="app-content">
          <ErrorBoundary key={currentPage}>
            {renderPage()}
          </ErrorBoundary>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {[
          { id: 'dashboard',  icon: '🏠', label: 'Home' },
          { id: 'workspace',  icon: '💻', label: 'Code' },
          { id: 'learn',      icon: '📚', label: 'Learn' },
          { id: 'community',  icon: '👥', label: 'Community' },
          { id: 'settings',   icon: '⚙️', label: 'Settings' },
        ].map(btn => (
          <button
            key={btn.id}
            className={`mobile-bottom-nav-btn ${currentPage === btn.id ? 'active' : ''}`}
            onClick={() => navigate(btn.id)}
          >
            <span className="nav-icon">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </nav>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Level-up celebration overlay */}
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
