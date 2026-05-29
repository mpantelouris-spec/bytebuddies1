import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/blocks.css'
import './styles/block-shape.css'

window.__BYTEBUDDIES_BUILD = '2026-04-22-1708';

// Global error catch — shows message if app fails to mount
window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<div style="padding:40px;color:#f87171;font-family:monospace;background:#0f0f1a;min-height:100vh">
      <h2>⚠️ ByteBuddies failed to load</h2>
      <pre style="color:#fca5a5;font-size:13px;white-space:pre-wrap;margin-top:16px">${e.message}\n\n${e.filename}:${e.lineno}</pre>
      <button onclick="location.reload()" style="margin-top:20px;padding:8px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer">Reload</button>
    </div>`;
  }
});

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  console.error('React mount error:', e);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:40px;color:#f87171;font-family:monospace;background:#0f0f1a;min-height:100vh">
      <h2>⚠️ Failed to start</h2>
      <pre style="color:#fca5a5;font-size:13px;white-space:pre-wrap;margin-top:16px">${e.message}\n\n${e.stack}</pre>
      <button onclick="location.reload()" style="margin-top:20px;padding:8px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer">Reload</button>
    </div>`;
  }
}
