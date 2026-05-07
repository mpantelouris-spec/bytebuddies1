import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { signInWithGoogle, lookupClassByCode, addStudentToClass } from '../firebase';

const GoogleLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function GooglePickerModal({ onSelect, onClose }) {
  const [step, setStep] = useState('pick'); // pick | email | password | name
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleEmailNext = () => {
    if (!googleEmail.trim() || !googleEmail.includes('@')) return setError('Enter a valid email address.');
    setError('');
    setStep('password');
  };

  const handlePasswordNext = () => {
    if (googlePassword.length < 1) return setError('Enter your password.');
    setError('');
    // Derive a display name from the email
    const guessed = googleEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    setDisplayName(guessed);
    setStep('name');
  };

  const handleFinish = () => {
    if (!displayName.trim()) return setError('Please enter a display name.');
    onSelect({ email: googleEmail, name: displayName.trim() });
  };

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    box: { background: '#fff', borderRadius: 28, width: 360, boxShadow: '0 8px 40px rgba(0,0,0,0.3)', overflow: 'hidden', fontFamily: '"Google Sans",Roboto,sans-serif' },
    header: { padding: '36px 40px 20px', textAlign: 'center' },
    body: { padding: '0 40px 32px', display: 'flex', flexDirection: 'column', gap: 16 },
    input: { width: '100%', border: '1px solid #dadce0', borderRadius: 4, padding: '13px 14px', fontSize: 16, color: '#202124', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    btnBlue: { background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-end', fontFamily: 'inherit' },
    link: { color: '#1a73e8', fontSize: 14, cursor: 'pointer', textDecoration: 'none', fontWeight: 500 },
    err: { color: '#d93025', fontSize: 12 },
  };

  if (step === 'pick') return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <GoogleLogo />
          <h2 style={{ margin: '16px 0 4px', fontSize: 24, fontWeight: 400, color: '#202124' }}>Choose an account</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#5f6368' }}>to continue to ByteBuddies</p>
        </div>
        <div style={{ borderTop: '1px solid #e8eaed' }}>
          <div style={{ padding: '8px 0' }}
            onClick={() => setStep('email')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 500 }}>+</div>
              <span style={{ fontSize: 14, color: '#202124' }}>Use another account</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #e8eaed', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5f6368' }}>
          <a href="#" style={s.link} onClick={e => e.preventDefault()}>Privacy Policy</a>
          <a href="#" style={s.link} onClick={e => e.preventDefault()}>Terms of Service</a>
        </div>
      </div>
    </div>
  );

  if (step === 'email') return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <GoogleLogo />
          <h2 style={{ margin: '16px 0 4px', fontSize: 24, fontWeight: 400, color: '#202124' }}>Sign in</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#5f6368' }}>with your Google Account</p>
        </div>
        <div style={s.body}>
          {error && <p style={s.err}>{error}</p>}
          <input style={s.input} placeholder="Email or phone" value={googleEmail}
            onChange={e => setGoogleEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailNext()}
            autoFocus />
          <a href="#" style={{ ...s.link, fontSize: 13 }} onClick={e => e.preventDefault()}>Forgot email?</a>
          <p style={{ margin: 0, fontSize: 13, color: '#5f6368', lineHeight: 1.5 }}>
            Not your computer? Use a private browsing window to sign in.{' '}
            <a href="#" style={s.link} onClick={e => e.preventDefault()}>Learn more</a>
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <a href="#" style={s.link} onClick={e => { e.preventDefault(); setStep('pick'); setError(''); }}>Create account</a>
            <button style={s.btnBlue} onClick={handleEmailNext}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === 'password') return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <GoogleLogo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 16, border: '1px solid #dadce0', borderRadius: 20, padding: '6px 16px', width: 'fit-content', margin: '16px auto 0' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600 }}>
              {googleEmail[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: 14, color: '#202124' }}>{googleEmail}</span>
            <span style={{ fontSize: 16, color: '#5f6368' }}>▾</span>
          </div>
          <h2 style={{ margin: '20px 0 4px', fontSize: 24, fontWeight: 400, color: '#202124' }}>Welcome</h2>
        </div>
        <div style={s.body}>
          {error && <p style={s.err}>{error}</p>}
          <input style={s.input} type="password" placeholder="Enter your password" value={googlePassword}
            onChange={e => setGooglePassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePasswordNext()}
            autoFocus />
          <a href="#" style={{ ...s.link, fontSize: 13 }} onClick={e => e.preventDefault()}>Forgot password?</a>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <a href="#" style={s.link} onClick={e => { e.preventDefault(); setStep('email'); setError(''); }}>← Back</a>
            <button style={s.btnBlue} onClick={handlePasswordNext}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === 'name') return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 600, margin: '0 auto 16px' }}>
            {displayName[0]?.toUpperCase() || 'U'}
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 400, color: '#202124' }}>One more step</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#5f6368' }}>Choose your display name for ByteBuddies</p>
        </div>
        <div style={s.body}>
          {error && <p style={s.err}>{error}</p>}
          <input style={s.input} placeholder="Display name" value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFinish()}
            autoFocus />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button style={s.btnBlue} onClick={handleFinish}>Get Started →</button>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}

const FREE_DOMAINS = [
  'gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com',
  'live.com','mail.com','protonmail.com','aol.com','msn.com',
  'yahoo.co.uk','hotmail.co.uk','googlemail.com','me.com',
];

function isPersonalEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return FREE_DOMAINS.includes(domain);
}

function validateClassCode(code) {
  const classes = JSON.parse(localStorage.getItem('bb-classes') || '[]');
  return classes.find(c => c.inviteCode === code.toUpperCase().trim()) || null;
}

export default function AuthModal({ onClose, initialRole }) {
  const { login, setUser, updateRole, isLoggedIn, logout, user } = useUser();

  console.log('[AuthModal] initialRole=', initialRole, 'user.role=', user?.role, 'isLoggedIn=', isLoggedIn);
  const savedRole = !initialRole ? (user?.role || null) : null;
  const startStep = isLoggedIn ? 'account' : (initialRole || savedRole ? 'signin' : 'role');

  const [authStep, setAuthStep] = useState(startStep);
  const [selectedRole, setSelectedRole] = useState(initialRole || savedRole || null);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [pendingUserData, setPendingUserData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Ensure initialRole always wins over any cached user role
  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
      if (!isLoggedIn) setAuthStep('signin');
    }
  }, [initialRole]); // eslint-disable-line

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setAuthStep('signin');
  };

  const finishLogin = (userData, role, classId) => {
    const r = role || selectedRole;
    if (r) updateRole(r);
    if (userData) setUser(prev => ({ ...prev, ...userData, classroomId: classId || prev.classroomId }));
  };

  const validateTeacherEmail = (emailAddr) => {
    if (selectedRole === 'teacher' && isPersonalEmail(emailAddr)) {
      setError('Teachers must sign in with a school or work email address. Personal emails (Gmail, Yahoo, etc.) are not permitted.');
      return false;
    }
    return true;
  };

  // Called after sign-in if student — shows class code step
  const proceedAfterSignIn = (userData) => {
    if (selectedRole === 'student') {
      setPendingUserData(userData);
      setAuthStep('classCode');
    } else {
      finishLogin(userData);
      login();
      setSuccess('Signed in successfully!');
      setTimeout(() => onClose(), 800);
    }
  };

  const handleClassCodeSubmit = async () => {
    setError('');
    let matched = validateClassCode(classCode);
    if (!matched) matched = await lookupClassByCode(classCode);
    if (!matched) return setError('Invalid class code. Ask your teacher for the correct code.');
    const studentData = {
      id: pendingUserData?.email || Date.now().toString(),
      name: pendingUserData?.name || 'Student',
      email: pendingUserData?.email || '',
      joinedAt: new Date().toISOString(),
    };
    addStudentToClass(matched.id, studentData);
    finishLogin(pendingUserData, 'student', matched.id);
    login();
    setSuccess(`Joined ${matched.name}! Welcome to ByteBuddies 🎉`);
    setTimeout(() => onClose(), 1000);
  };

  const handleSubmit = () => {
    setError('');
    if (mode === 'signup') {
      if (!name.trim()) return setError('Please enter a username');
      if (name.trim().length < 2) return setError('Username must be at least 2 characters');
    }
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (!validateTeacherEmail(email)) return;

    const userData = mode === 'signup'
      ? { name: name.trim(), avatar: name.trim().slice(0, 2).toUpperCase() }
      : {};
    proceedAfterSignIn(userData);
  };

  const handleLogout = () => {
    logout();
    setSuccess('Signed out.');
    setTimeout(() => onClose(), 600);
  };

  const handleGoogleSelect = ({ email: gEmail, name: gName }) => {
    setShowGooglePicker(false);
    if (!validateTeacherEmail(gEmail)) return;
    const displayName = selectedRole === 'student' ? (gEmail.split('@')[0] || 'Student') : gName;
    proceedAfterSignIn({ name: displayName, avatar: displayName.slice(0, 2).toUpperCase(), email: gEmail });
  };

  const handleRealGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const userData = await signInWithGoogle();
      if (!validateTeacherEmail(userData.email || '')) {
        setGoogleLoading(false);
        return;
      }
      const displayName = selectedRole === 'student' ? (userData.email?.split('@')[0] || 'Student') : userData.name;
      proceedAfterSignIn({ name: displayName, avatar: displayName.slice(0, 2).toUpperCase(), email: userData.email });
    } catch (e) {
      console.error('[Auth] Google sign-in error:', e);
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(`Google sign-in failed: ${e.message || e.code || 'Unknown error'}`);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const roleCardBase = {
    flex: 1,
    padding: '24px 20px',
    borderRadius: 16,
    border: '2px solid var(--border-color)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    background: 'var(--bg-secondary)',
  };

  const roleCardSelected = {
    ...roleCardBase,
    border: '2px solid transparent',
    background: 'linear-gradient(var(--bg-secondary), var(--bg-secondary)) padding-box, linear-gradient(135deg, #6366f1, #8b5cf6) border-box',
  };

  return (
    <>
      {showGooglePicker && (
        <GooglePickerModal onSelect={handleGoogleSelect} onClose={() => setShowGooglePicker(false)} />
      )}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              {authStep === 'role' ? '👋 Welcome to ByteBuddies'
                : authStep === 'account' ? '👤 My Account'
                : authStep === 'classCode' ? '🎓 Verify Student'
                : (mode === 'login' ? '👋 Welcome Back' : '🚀 Join ByteBuddies')}
            </h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Account View (already logged in) */}
            {authStep === 'account' && (
              <>
                {success && (
                  <div style={{ padding: 12, borderRadius: 8, background: '#10b98120', color: '#10b981', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                    {success}
                  </div>
                )}
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 auto 12px' }}>
                    {user?.avatarEmoji || user?.avatar || '?'}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{user?.name}</div>
                  {user?.email && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <span style={{ fontSize: 14 }}>{user?.role === 'teacher' ? '👩‍🏫' : '🎓'}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', textTransform: 'capitalize' }}>{user?.role || 'Student'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Level</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Lv.{user?.level} — {user?.xp} XP</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Streak</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>🔥 {user?.streak || 0} days</span>
                  </div>
                </div>
                <button className="btn btn-danger w-full" style={{ padding: 12, marginTop: 4 }} onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            )}

            {/* Role Selection Step */}
            {authStep === 'role' && (
              <>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                  First, tell us who you are
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <div
                    style={selectedRole === 'student' ? roleCardSelected : roleCardBase}
                    onClick={() => handleRoleSelect('student')}
                    onMouseEnter={e => { if (selectedRole !== 'student') e.currentTarget.style.borderColor = '#6366f1'; }}
                    onMouseLeave={e => { if (selectedRole !== 'student') e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--text-primary)' }}>I'm a Student</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>Access your coding workspace, games and challenges</div>
                  </div>
                  <div
                    style={selectedRole === 'teacher' ? roleCardSelected : roleCardBase}
                    onClick={() => handleRoleSelect('teacher')}
                    onMouseEnter={e => { if (selectedRole !== 'teacher') e.currentTarget.style.borderColor = '#6366f1'; }}
                    onMouseLeave={e => { if (selectedRole !== 'teacher') e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>👩‍🏫</div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--text-primary)' }}>I'm a Teacher</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>Manage your classroom and track student progress</div>
                  </div>
                </div>
              </>
            )}

            {/* Class Code Step (students only) */}
            {authStep === 'classCode' && (
              <>
                <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏫</div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Enter Your Class Code</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Ask your teacher for the class code to verify you're an enrolled student.
                  </p>
                </div>
                {error && (
                  <div style={{ padding: 12, borderRadius: 8, background: '#ef444420', color: '#ef4444', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{ padding: 12, borderRadius: 8, background: '#10b98120', color: '#10b981', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                    {success}
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Class Code</label>
                  <input
                    className="input"
                    placeholder="e.g. AB1234"
                    value={classCode}
                    onChange={e => setClassCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleClassCodeSubmit()}
                    style={{ textTransform: 'uppercase', letterSpacing: 4, fontSize: 18, fontWeight: 700, textAlign: 'center' }}
                    autoFocus
                    maxLength={6}
                  />
                </div>
                <button className="btn btn-primary w-full" style={{ padding: 12, fontSize: 14 }} onClick={handleClassCodeSubmit}>
                  Join Class →
                </button>
                <button
                  style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'center' }}
                  onClick={() => { setAuthStep('signin'); setError(''); }}
                >
                  ← Back
                </button>
              </>
            )}

            {/* Sign In Step */}
            {authStep === 'signin' && (
              <>
                {selectedRole && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(99,102,241,0.1)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)' }}>
                    <span style={{ fontSize: 16 }}>{selectedRole === 'teacher' ? '👩‍🏫' : '🎓'}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                      Signing in as {selectedRole === 'teacher' ? 'Teacher' : 'Student'}
                    </span>
                    <button
                      style={{ marginLeft: 'auto', fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setAuthStep('role')}
                    >
                      Change
                    </button>
                  </div>
                )}

                {isLoggedIn && (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <p style={{ fontSize: 14, marginBottom: 12 }}>You are currently signed in.</p>
                    <button className="btn btn-danger w-full" style={{ padding: 10 }} onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
                {success && (
                  <div style={{ padding: 12, borderRadius: 8, background: '#10b98120', color: '#10b981', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                    {success}
                  </div>
                )}
                {error && (
                  <div style={{ padding: 12, borderRadius: 8, background: '#ef444420', color: '#ef4444', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <button
                  className="btn btn-secondary w-full"
                  style={{ padding: 12, fontSize: 14, justifyContent: 'center', gap: 10, opacity: googleLoading ? 0.7 : 1 }}
                  onClick={handleRealGoogle}
                  disabled={googleLoading}
                >
                  <GoogleLogo />
                  {googleLoading ? 'Opening Google...' : 'Continue with Google'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                </div>

                {mode === 'signup' && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Username</label>
                    <input className="input" placeholder="Choose a username" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
                  <input className="input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Password</label>
                  <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button className="btn btn-primary w-full" style={{ padding: 12, fontSize: 14 }} onClick={handleSubmit}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setAuthStep('role')}
                  >
                    ← Back
                  </button>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <span
                      style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    >
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
