import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveUserProfile, firebaseSignOut, onFirebaseAuthChange, firebaseUserToProfile, completeGoogleRedirect, readRememberedAuthRole, isLicenseAdmin, watchAccountLicense } from '../firebase';

function lsGet(key, fallback = null) {
  try { return localStorage.getItem(key); } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* managed Chrome / guest profile */ }
}

const UserContext = createContext();

const defaultUser = {
  name: 'Coder',
  avatar: '?',
  avatarEmoji: '🧑‍💻',
  level: 1,
  xp: 0,
  xpToNext: 500,
  badges: [],
  streak: 0,
  projectCount: 0,
  completedLessons: 0,
  joinDate: new Date().toISOString().split('T')[0],
  // New fields
  role: 'student',              // 'student' | 'teacher' | 'parent'
  ageMode: 'standard',          // 'standard' | 'starter'
  quizScores: {},               // { 'courseId-moduleIndex': score% }
  weeklyXP: [0, 0, 0, 0, 0, 0, 0],
  timeSpent: 0,                 // cumulative minutes
  streakProtected: false,
  lastActiveDate: null,
  dailyQuestsCompleted: [],
  questProgress: {},            // { questId: count }
  unlockedThemes: ['default'],
  selectedBlockTheme: 'default',
  classroomId: null,
  leveledUp: false,
};

function loadUser() {
  try {
    const saved = lsGet('cv-user');
    if (saved) return { ...defaultUser, ...JSON.parse(saved) };
  } catch {}
  return defaultUser;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [isLoggedIn, setIsLoggedIn] = useState(() => lsGet('cv-loggedin') === 'true');
  const [licenseStatus, setLicenseStatus] = useState('checking');
  const [accountLicense, setAccountLicense] = useState(null);

  // Licence access is read from Firestore for the authenticated Firebase user.
  // The local profile and localStorage login flag never grant a licence.
  useEffect(() => {
    let stopLicenseWatch = () => {};
    const stopAuthWatch = onFirebaseAuthChange((fbUser) => {
      stopLicenseWatch();
      setAccountLicense(null);
      if (!fbUser?.email) {
        setLicenseStatus('unlicensed');
        setAccountLicense(null);
        return;
      }
      if (isLicenseAdmin(fbUser.email)) {
        setLicenseStatus('active');
        setAccountLicense({ role: 'admin', studentLimit: Infinity });
        return;
      }
      setLicenseStatus('checking');
      stopLicenseWatch = watchAccountLicense(fbUser.email, (license, error) => {
        if (error) {
          console.error('[Access] Could not verify account licence:', error);
          setLicenseStatus('unverified');
          setAccountLicense(null);
          return;
        }
        setAccountLicense(license);
        const expiry = license?.expiresAt ? new Date(license.expiresAt) : null;
        const current = license?.status === 'active' && (!expiry || expiry.getTime() >= Date.now());
        setLicenseStatus(current ? 'active' : license?.status === 'suspended' ? 'suspended' : 'unlicensed');
      });
    });
    return () => {
      stopAuthWatch();
      stopLicenseWatch();
    };
  }, []);

  // Persist user state
  useEffect(() => {
    lsSet('cv-user', JSON.stringify(user));
  }, [user]);

  // Finish Google redirect (Chromebooks) before the auth listener runs.
  useEffect(() => {
    let cancelled = false;
    completeGoogleRedirect()
      .then((profile) => {
        if (cancelled || !profile) return;
        const role = readRememberedAuthRole();
        setUser((prev) => {
          const merged = { ...prev, ...profile, role };
          try { lsSet('bb_learn_role', role === 'teacher' ? 'teacher' : 'pupil'); } catch {}
          saveUserProfile(merged);
          return merged;
        });
        setIsLoggedIn(true);
        lsSet('cv-loggedin', 'true');
      })
      .catch((e) => console.error('[Auth] redirect complete failed', e));
    return () => { cancelled = true; };
  }, []);

  // Sync login state with Firebase session
  useEffect(() => {
    const unsub = onFirebaseAuthChange((fbUser) => {
      if (fbUser) {
        const alreadySession = lsGet('cv-loggedin') === 'true';
        const profile = firebaseUserToProfile(fbUser);
        setUser(prev => {
          const merged = { ...prev, ...profile };
          if (alreadySession && prev.role) {
            merged.role = prev.role;
            saveUserProfile(merged);
          } else if (!alreadySession) {
            // New sign-in: do not inherit a leftover teacher role from this browser.
            // AuthModal.login() sets the role the user actually picked.
            merged.role = readRememberedAuthRole() || 'student';
          }
          return merged;
        });
        if (alreadySession) {
          setIsLoggedIn(true);
          lsSet('cv-loggedin', 'true');
        }
      } else if (lsGet('cv-loggedin') !== 'true') {
        setIsLoggedIn(false);
      }
    });
    return unsub;
  }, []);

  const addXP = (amount) => {
    setUser(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;
      let didLevelUp = false;
      while (newXP >= newXpToNext) {
        newXP -= newXpToNext;
        newLevel++;
        newXpToNext = Math.floor(newXpToNext * 1.3);
        didLevelUp = true;
      }
      // Update weeklyXP for today
      const todayIdx = new Date().getDay();
      const weeklyXP = [...(prev.weeklyXP || [0,0,0,0,0,0,0])];
      weeklyXP[todayIdx] = (weeklyXP[todayIdx] || 0) + amount;
      // Unlock themes at milestones
      const totalXP = (prev.level - 1) * prev.xpToNext + prev.xp + amount;
      const unlockedThemes = [...(prev.unlockedThemes || ['default'])];
      if (totalXP >= 5000 && !unlockedThemes.includes('pastel')) unlockedThemes.push('pastel');
      if (totalXP >= 10000 && !unlockedThemes.includes('neon')) unlockedThemes.push('neon');
      if (totalXP >= 15000 && !unlockedThemes.includes('ocean')) unlockedThemes.push('ocean');
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        xpToNext: newXpToNext,
        leveledUp: didLevelUp || prev.leveledUp,
        weeklyXP,
        unlockedThemes,
      };
    });
  };

  const spendXP = (amount) => {
    setUser(prev => ({ ...prev, xp: Math.max(0, prev.xp - amount) }));
  };

  const clearLevelUp = () => {
    setUser(prev => ({ ...prev, leveledUp: false }));
  };

  const recordQuizScore = (courseId, moduleIndex, score) => {
    setUser(prev => ({
      ...prev,
      quizScores: { ...prev.quizScores, [`${courseId}-${moduleIndex}`]: score },
    }));
    if (score >= 70) addXP(Math.round(score / 2));
  };

  const updateAgeMode = (mode) => {
    setUser(prev => ({ ...prev, ageMode: mode }));
  };

  const updateRole = (role) => {
    setUser(prev => ({ ...prev, role }));
    lsSet('bb_learn_role', role === 'teacher' ? 'teacher' : 'pupil');
  };

  const completeQuest = (questId, xpReward = 50) => {
    setUser(prev => {
      if (prev.dailyQuestsCompleted.includes(questId)) return prev;
      return {
        ...prev,
        dailyQuestsCompleted: [...prev.dailyQuestsCompleted, questId],
      };
    });
    addXP(xpReward);
  };

  const incrementQuestProgress = (questId) => {
    setUser(prev => ({
      ...prev,
      questProgress: {
        ...prev.questProgress,
        [questId]: (prev.questProgress[questId] || 0) + 1,
      },
    }));
  };

  const useStreakProtection = () => {
    setUser(prev => {
      if (prev.xp < 50) return prev;
      return { ...prev, streakProtected: true };
    });
    spendXP(50);
  };

  const unlockTheme = (themeId) => {
    setUser(prev => {
      if (prev.unlockedThemes.includes(themeId)) return prev;
      return { ...prev, unlockedThemes: [...prev.unlockedThemes, themeId] };
    });
  };

  const login = (userData) => {
    if (userData) {
      setUser(prev => {
        const merged = { ...prev, ...userData };
        lsSet('bb_learn_role', merged.role === 'teacher' ? 'teacher' : 'pupil');
        saveUserProfile(merged);
        return merged;
      });
    }
    setIsLoggedIn(true);
    lsSet('cv-loggedin', 'true');
  };
  const logout = async () => {
    try { await firebaseSignOut(); } catch (e) { console.error('[Auth] sign out failed:', e); }
    setIsLoggedIn(false);
    setUser({ ...defaultUser });
    lsSet('cv-loggedin', 'false');
    lsSet('cv-user', JSON.stringify(defaultUser));
    try { localStorage.removeItem('bb_learn_role'); } catch {}
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoggedIn,
      licenseStatus,
      accountLicense,
      addXP,
      spendXP,
      clearLevelUp,
      recordQuizScore,
      updateAgeMode,
      updateRole,
      completeQuest,
      incrementQuestProgress,
      useStreakProtection,
      unlockTheme,
      login,
      logout,
      setUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
