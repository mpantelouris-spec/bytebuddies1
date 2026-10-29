import React, { useEffect, useRef, useState } from 'react';
import { getCachedArenaPreview, requestArenaPreview } from './arena-preview.js';

/**
 * A game-mode card's picture: a snapshot of the mode's real arena.
 * Shows `fallback` until the snapshot is ready (or if it can't be drawn).
 * Only cards scrolled into view ask for a snapshot.
 */
export default function ArenaPreviewImage({ course, title, fallback = null }) {
  const [url, setUrl] = useState(() => getCachedArenaPreview(course) || null);
  const ref = useRef(null);
  useEffect(() => {
    let alive = true;
    const cached = getCachedArenaPreview(course);
    if (cached !== undefined) { setUrl(cached); return undefined; }
    setUrl(null);
    const el = ref.current;
    const go = () => requestArenaPreview(course).then((u) => { if (alive) setUrl(u); });
    if (!el || typeof IntersectionObserver !== 'function') { go(); return () => { alive = false; }; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); go(); }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => { alive = false; io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, course?.chassisId, course?.modeIndex, course?.arenaType, course?.raceThemeId, course?.raceVisualId, course?.expandedCarTrack?.visualId]);
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {url
        ? <img src={url} alt={`${title || 'Arena'} preview`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : fallback}
    </div>
  );
}
