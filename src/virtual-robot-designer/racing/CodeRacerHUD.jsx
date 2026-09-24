/**
 * CodeRacerHUD.jsx — Minimal chase HUD: 95% track, tiny overlays only.
 */
import React from 'react';
import { RacingHUD } from './RacingHUD.jsx';

export function CodeRacerHUD({ stats, challenge, arenaType, theme, onRestart }) {
  const build = typeof window !== 'undefined' ? window.__BYTEBUDDIES_BUILD : '';
  return (
    <div className="coderacer-3d-root coderacer-3d-root--minimal" aria-label="CodeRacer HUD">
      {build && (
        <div className="coderacer-build-stamp" style={{
          position: 'fixed', bottom: 6, left: 8, fontSize: 10, opacity: 0.55,
          color: '#94a3b8', zIndex: 5, pointerEvents: 'none',
        }}>
          {build}
        </div>
      )}
      <RacingHUD
        stats={stats}
        challenge={challenge}
        theme={theme || arenaType}
        onRestart={onRestart}
        minimal
      />
    </div>
  );
}

export default CodeRacerHUD;
