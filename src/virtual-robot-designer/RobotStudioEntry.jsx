import React, { useEffect, useRef, useState } from 'react';
import { resolveStudioSelection } from './services/studio-entry-route.js';
import './styles/game-studio-entry.css';

/**
 * Robot Studio's complete replacement. Its document owns the 3D engine,
 * physics, Blockly editor, asset inspector and three playable game kits.
 * Isolating the editor avoids conflicting with the site's other Blockly apps.
 * Libraries are bundled with the site, with no localhost or CDN references.
 */
export default function RobotStudioEntry() {
  const frame = useRef(null);
  const [selection, setSelection] = useState(() => resolveStudioSelection(window.location.hash));
  useEffect(() => {
    const onHash = () => setSelection(resolveStudioSelection(window.location.hash));
    const onMessage = (event) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'bytebuddies:studio:navigate' && event.data.destination === 'home') {
        window.location.hash = 'dashboard';
      }
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('message', onMessage);
    };
  }, []);
  return (
    <section className="bb-game-studio-entry" aria-label="ByteBuddies Robot Game Studio">
      <iframe
        ref={frame}
        className="bb-game-studio-frame"
        title="Robot Studio — build and code 3D games"
        src={`${import.meta.env.BASE_URL}robot-studio/index.html?game=${selection.game}&robot=${selection.robot}&track=${selection.track}`}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </section>
  );
}
