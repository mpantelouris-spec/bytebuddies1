import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveUserProfile } from '../firebase';

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
    const saved = localStorage.getItem('cv-user');
    if (saved) return { ...defaultUser, ...JSON.parse(saved) };
  } catch {}
  return defaultUser;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return localStorage.getItem('cv-loggedin') === 'true'; } catch { return false; }
  });

  // Persist user state
  useEffect(() => {
    localStorage.setItem('cv-user', JSON.stringify(user));
  }, [user]);

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
        saveUserProfile(merged);
        return merged;
      });
    }
    setIsLoggedIn(true);
    localStorage.setItem('cv-loggedin', 'true');
  };
  const logout = () => { setIsLoggedIn(false); localStorage.setItem('cv-loggedin', 'false'); };

  return (
    <UserContext.Provider value={{
      user,
      isLoggedIn,
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
