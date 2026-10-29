import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';

const ProjectContext = createContext();

const sampleProjects = [
  {
    id: '2',
    isExample: true,
    name: 'My Portfolio',
    type: 'website',
    language: 'html',
    created: '2025-11-20',
    modified: '2026-02-10',
    blocks: false,
    code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Portfolio</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; }\n    .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; }\n    .hero h1 { font-size: 4rem; background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n    .hero p { font-size: 1.2rem; color: #94a3b8; margin-top: 1rem; }\n    .projects { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }\n    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }\n    .card { background: #1e293b; border-radius: 12px; padding: 2rem; border: 1px solid #334155; }\n    .card h3 { color: #6366f1; margin-bottom: 0.5rem; }\n  </style>\n</head>\n<body>\n  <section class="hero">\n    <div>\n      <h1>Hello, I'm a Creator</h1>\n      <p>Building cool things with code</p>\n    </div>\n  </section>\n  <section class="projects">\n    <h2>My Projects</h2>\n    <div class="grid">\n      <div class="card"><h3>Game Engine</h3><p>A 2D game engine built from scratch</p></div>\n      <div class="card"><h3>Chat App</h3><p>Real-time messaging application</p></div>\n      <div class="card"><h3>AI Art</h3><p>Neural network that generates art</p></div>\n    </div>\n  </section>\n</body>\n</html>`,
    starred: false,
  },
  {
    id: '3',
    isExample: true,
    name: 'Chatbot AI',
    type: 'app',
    language: 'javascript',
    created: '2026-01-05',
    modified: '2026-03-01',
    blocks: true,
    code: `// Simple AI Chatbot\nconst responses = {\n  greeting: ["Hello! How can I help?", "Hi there! What's up?", "Hey! Ask me anything!"],\n  farewell: ["Goodbye! Have a great day!", "See you later!", "Bye! Keep coding!"],\n  help: ["I can answer questions about coding!", "Try asking me about JavaScript or Python!"],\n  default: ["That's interesting! Tell me more.", "I'm still learning about that.", "Can you rephrase that?"]\n};\n\nfunction classify(input) {\n  const lower = input.toLowerCase();\n  if (lower.match(/\\b(hi|hello|hey)\\b/)) return 'greeting';\n  if (lower.match(/\\b(bye|goodbye|see you)\\b/)) return 'farewell';\n  if (lower.match(/\\b(help|what can you)\\b/)) return 'help';\n  return 'default';\n}\n\nfunction getResponse(input) {\n  const category = classify(input);\n  const options = responses[category];\n  return options[Math.floor(Math.random() * options.length)];\n}\n\n// Test the chatbot\nconsole.log(getResponse("Hello!"));\nconsole.log(getResponse("What can you do?"));\nconsole.log(getResponse("Tell me about space"));\n`,
    starred: true,
  },
];

/** Each pupil's own projects (e.g. Python files) are kept on this device under their account. */
const storeKey = (user) => `bb-projects-v1:${user?.uid || user?.id || user?.email || 'guest'}`;
function loadProjects(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (Array.isArray(saved)) return saved.filter((p) => p && p.name !== 'Space Invaders');
  } catch { /* ignore */ }
  return sampleProjects;
}

export function ProjectProvider({ children }) {
  const { user } = useUser() || {};
  const key = storeKey(user);
  const [projects, setProjects] = useState(() => loadProjects(key));
  const [activeProject, setActiveProject] = useState(() => loadProjects(key)[0] || null);
  const [loadedKey, setLoadedKey] = useState(key);

  // Switching account: load that pupil's projects
  useEffect(() => {
    if (key === loadedKey) return;
    const next = loadProjects(key);
    setProjects(next);
    setActiveProject(next[0] || null);
    setLoadedKey(key);
  }, [key, loadedKey]);

  useEffect(() => {
    if (key !== loadedKey) return;
    try { localStorage.setItem(key, JSON.stringify(projects)); } catch { /* storage full or blocked */ }
  }, [projects, key, loadedKey]);
  const [viewMode, setViewMode] = useState('blocks'); // 'blocks' | 'code' | 'split'

  const createProject = useCallback((project) => {
    const newProject = {
      ...project,
      isExample: false,
      id: Date.now().toString(),
      created: new Date().toISOString().split('T')[0],
      modified: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    return newProject;
  }, []);

  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, isExample: false, modified: new Date().toISOString().split('T')[0] } : p));
    setActiveProject(prev => prev?.id === id ? { ...prev, ...updates, isExample: false } : prev);
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setActiveProject(prev => (prev?.id === id ? null : prev));
  }, []);

  const duplicateProject = useCallback((id) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      createProject({ ...project, isExample: false, name: `${project.name} (Copy)` });
    }
  }, [projects, createProject]);

  return (
    <ProjectContext.Provider value={{
      projects, activeProject, viewMode,
      setActiveProject, setViewMode,
      createProject, updateProject, deleteProject, duplicateProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);
