/**
 * CodeRacerHUD.jsx — Minimal chase HUD: 95% track, tiny overlays only.
 */
import React from 'react';
import { RacingHUD } from './RacingHUD.jsx';

export function CodeRacerHUD({ stats, challenge, arenaType, theme, onRestart }) {
  const build = typeof window !== 'undefined' ? window.__BYTEBUDDIES_BUILD : '';
  return (
    // Build stamp stays inspectable without being drawn over the block palette
    <div className="coderacer-3d-root coderacer-3d-root--minimal" aria-label="CodeRacer HUD" data-build={build || undefined}>
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
