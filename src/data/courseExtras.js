/** Dashboard / community extras (separate from lesson catalog). */

export const achievements = [
  { id: 1, icon: '🏆', name: 'First Code', desc: 'Complete your first lesson', earned: true },
  { id: 2, icon: '🐛', name: 'Bug Squasher', desc: 'Fix 10 bugs in your projects', earned: true },
  { id: 3, icon: '🔁', name: 'Loop Master', desc: 'Finish all loop lessons in a course', earned: true },
  { id: 4, icon: '🎮', name: 'Game Creator', desc: 'Build your first game', earned: true },
  { id: 5, icon: '🌐', name: 'Web Wizard', desc: 'Complete a web development course', earned: false },
  { id: 6, icon: '🔥', name: '7-Day Streak', desc: 'Learn for 7 days in a row', earned: false },
  { id: 7, icon: '🤖', name: 'AI Apprentice', desc: 'Complete an AI basics course', earned: false },
  { id: 8, icon: '👥', name: 'Team Player', desc: 'Collaborate on 5 projects', earned: false },
  { id: 9, icon: '⭐', name: 'Star Creator', desc: 'Get 100 likes on a project', earned: false },
  { id: 10, icon: '🧠', name: 'Polyglot', desc: 'Code in blocks, Python, and HTML', earned: false },
  { id: 11, icon: '🏗️', name: 'Architect', desc: 'Build 25 projects', earned: false },
  { id: 12, icon: '💎', name: 'Diamond Coder', desc: 'Reach level 50', earned: false },
];

export const dailyChallenges = [
  { id: 1, title: 'Complete 3 Lessons', difficulty: 'Easy', xp: 100, language: 'Any', completed: false },
  { id: 2, title: 'Perfect Quiz Score', difficulty: 'Medium', xp: 150, language: 'Any', completed: false },
  { id: 3, title: 'Try a New Course', difficulty: 'Easy', xp: 120, language: 'Any', completed: false },
];

export const dailyQuestTemplates = [
  { id: 'dq1', title: 'Finish 2 lessons', xp: 80, icon: '📚' },
  { id: 'dq2', title: 'Earn 200 XP today', xp: 100, icon: '⚡' },
  { id: 'dq3', title: 'Take a quiz', xp: 60, icon: '🧠' },
  { id: 'dq4', title: 'Open Game Builder', xp: 50, icon: '🎮' },
  { id: 'dq5', title: 'Review flashcards', xp: 70, icon: '🃏' },
];

export const leaderboard = [
  { rank: 1, name: 'AlgoQueen', level: 42, xp: 84200, avatar: 'AQ', badges: 28 },
  { rank: 2, name: 'ByteNinja', level: 38, xp: 72100, avatar: 'BN', badges: 24 },
  { rank: 3, name: 'CodeWizard', level: 35, xp: 65400, avatar: 'CW', badges: 22 },
  { rank: 4, name: 'PixelHero', level: 31, xp: 58900, avatar: 'PH', badges: 19 },
  { rank: 5, name: 'DataDragon', level: 29, xp: 53200, avatar: 'DD', badges: 17 },
  { rank: 6, name: 'WebStar', level: 27, xp: 49800, avatar: 'WS', badges: 15 },
  { rank: 7, name: 'CodeExplorer', level: 7, xp: 2450, avatar: 'CE', badges: 5, isUser: true },
  { rank: 8, name: 'BugHunter', level: 24, xp: 44100, avatar: 'BH', badges: 14 },
  { rank: 9, name: 'ScriptKid', level: 22, xp: 40500, avatar: 'SK', badges: 12 },
  { rank: 10, name: 'DevDynamo', level: 20, xp: 37200, avatar: 'DV', badges: 11 },
];

export const communityProjects = [
  { id: 'cp1', title: 'Neon Racer', author: 'AlgoQueen', type: 'game', likes: 342, views: 1820, remixes: 28, featured: true, preview: '🏎️', description: 'A fast-paced neon racing game with power-ups' },
  { id: 'cp2', title: 'Weather Dashboard', author: 'WebStar', type: 'website', likes: 189, views: 956, remixes: 15, featured: true, preview: '🌤️', description: 'Beautiful weather app with live data' },
  { id: 'cp3', title: 'AI Music Generator', author: 'ByteNinja', type: 'app', likes: 567, views: 3400, remixes: 82, featured: true, preview: '🎵', description: 'Generate unique music using AI' },
  { id: 'cp4', title: 'Pixel Art Editor', author: 'PixelHero', type: 'app', likes: 234, views: 1200, remixes: 41, featured: false, preview: '🎨', description: 'Create pixel art with export to PNG' },
  { id: 'cp5', title: 'Solar System Sim', author: 'DataDragon', type: 'simulation', likes: 445, views: 2100, remixes: 33, featured: true, preview: '🪐', description: 'Interactive solar system simulation' },
  { id: 'cp6', title: 'Chat Application', author: 'CodeWizard', type: 'app', likes: 156, views: 890, remixes: 12, featured: false, preview: '💬', description: 'Real-time chat with emoji support' },
];
