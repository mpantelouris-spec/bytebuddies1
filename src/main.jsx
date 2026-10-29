import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// OpenDyslexic for the accessibility setting — the browser only downloads it when that setting is on
import '@fontsource/opendyslexic/latin-400.css'
import '@fontsource/opendyslexic/latin-700.css'
import './index.css'
import './styles/blocks.css'
import './styles/block-shape.css'
import { EmojiIcon } from './components/ui/Icon.jsx';

window.__BYTEBUDDIES_BUILD = window.__BYTEBUDDIES_BUILD || 'dev';
window.__BB_BUNDLE = '2026-10-11-costumes';

setTimeout(() => {
  const touchTablet = (typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 1)
    && !!window.matchMedia?.('(pointer: coarse)')?.matches;
  if (touchTablet) return;
  import('./virtual-robot-designer/racing/mk-tracks/TrackAssetManifest.js')
    .then((m) => m.prewarmCupTrackAssets?.())
    .catch(() => {});
  import('./virtual-robot-designer/studio/football/FootballAssetManifest.js')
    .then((m) => m.prewarmFootballAssets?.())
    .catch(() => {});
  import('./virtual-robot-designer/ByteBuddiesStudio.jsx').catch(() => {});
}, 2500);

if (import.meta.env.PROD && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./bb-offline.js').catch(() => {});
  });
}

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

function bootApp() {
  try {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    appBooted = true;
    window.__BB_BOOTED = true;
    window.dispatchEvent(new Event('bb-app-ready'));
  } catch (e) {
    console.error('React mount error:', e);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `<div style="padding:40px;color:#f87171;font-family:monospace;background:#0f0f1a;min-height:100vh">
        <h2><EmojiIcon e="⚠️" style={{ marginRight: '0.35em' }} />Failed to start</h2>
        <pre style="color:#fca5a5;font-size:13px;white-space:pre-wrap;margin-top:16px">${e.message}\n\n${e.stack}</pre>
        <button onclick="location.reload()" style="margin-top:20px;padding:8px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer">Reload</button>
      </div>`;
    }
  }
}

// Back from Google's same-tab sign-in (hidden Classroom test route): save the token first
if (window.location.pathname === '/gc-callback') {
  import('./utils/googleClassroom.js').then((m) => m.completeGcRedirect()).catch(() => {}).finally(bootApp);
} else {
  bootApp();
}
