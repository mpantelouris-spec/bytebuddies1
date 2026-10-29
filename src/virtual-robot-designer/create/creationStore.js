/**
 * Where Create Studio keeps each pupil's own creations (arenas, race tracks) on this device.
 * Lists are stored per signed-in account, so pupils who share a computer each see only their
 * own. Lists saved before this (one shared list per device) are moved into the first
 * account that opens them.
 */
export function creatorId() {
  try {
    const u = JSON.parse(localStorage.getItem('cv-user') || '{}');
    return String(u.uid || u.email || u.id || 'guest').trim().toLowerCase();
  } catch {
    return 'guest';
  }
}

const parse = (raw) => { try { const l = JSON.parse(raw || '[]'); return Array.isArray(l) ? l : []; } catch { return []; } };

export function loadCreations(base) {
  try {
    const who = creatorId();
    const key = `${base}:${who}`;
    let list = parse(localStorage.getItem(key));
    // Bring in creations from before lists were per account, and any made while the page
    // still showed the guest account (before sign-in finished loading)
    const extra = [base, ...(who !== 'guest' ? [`${base}:guest`] : [])];
    let moved = false;
    extra.forEach((k) => {
      const more = parse(localStorage.getItem(k));
      if (!more.length) return;
      const have = new Set(list.map((x) => x.id));
      list = [...list, ...more.filter((x) => !have.has(x.id))];
      localStorage.removeItem(k);
      moved = true;
    });
    if (moved) localStorage.setItem(key, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

export function saveCreations(base, list) {
  try { localStorage.setItem(`${base}:${creatorId()}`, JSON.stringify(list)); } catch { /* storage full or blocked */ }
}

/** "just now", "5 min ago", "yesterday", "3 Oct" */
export function savedAgo(ms) {
  if (!ms) return '';
  const s = (Date.now() - ms) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 172800) return 'yesterday';
  return new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
