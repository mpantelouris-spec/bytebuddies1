import { lazy } from 'react';

const CHUNK_RELOAD_KEY = 'bb_chunk_reload_attempted';

export function isChunkLoadError(err) {
  const msg = err?.message || String(err || '');
  return /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed|error loading dynamically imported module/i.test(msg);
}

/** Lazy import that auto-reloads once when a stale cached chunk 404s after deploy. */
export function lazyWithRetry(importFn) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (err) {
      if (!isChunkLoadError(err)) throw err;
      if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
        return new Promise(() => {});
      }
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      throw err;
    }
  });
}
