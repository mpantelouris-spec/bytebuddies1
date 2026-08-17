import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/blocks.css'
import './styles/block-shape.css'
import { prewarmCupTrackAssets } from './virtual-robot-designer/racing/mk-tracks/TrackAssetManifest.js'

window.__BYTEBUDDIES_BUILD = '2026-08-17-v54-mega-scenery';
setTimeout(() => prewarmCupTrackAssets(), 200);

let appBooted = false;

// Global error catch — only replaces the page if the app never finished mounting
function showBootError(title, detail) {
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = `<div style="padding:40px;color:#f87171;font-family:monospace;background:#0f0f1a;min-height:100vh">
    <h2>⚠️ ${title}</h2>
    <pre style="color:#fca5a5;font-size:13px;white-space:pre-wrap;margin-top:16px">${detail}</pre>
    <button onclick="location.reload(true)" style="margin-top:20px;padding:8px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer">Reload</button>
  </div>`;
}

window.addEventListener('error', (e) => {
  if (!appBooted) {
    showBootError('ByteBuddies failed to load', `${e.message}\n\n${e.filename}:${e.lineno}`);
    return;
  }
  console.error('[ByteBuddies runtime error]', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  const msg = e.reason?.message || String(e.reason || '');
  if (/Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(msg)) {
    showBootError(
      'App update needed — please reload',
      `${msg}\n\nYour browser may have a cached old version. Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) to hard refresh.`
    );
  }
});

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  appBooted = true;
  window.__BB_BOOTED = true;
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
