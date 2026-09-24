/**
 * Football glTF manifest — preload probes (like TrackAssetManifest).
 */
const BASE = '/assets/football';

/** Use polished procedural kits until bespoke football GLB rigs ship. */
export const FOOTBALL_GLB_PLAYERS_ENABLED = false;

export const FOOTBALL_GLB = {
  playerGreen: `${BASE}/player_green.glb`,
  playerBlue: `${BASE}/player_blue.glb`,
  footballer: `${BASE}/footballer.glb`,
  cornerFlag: `${BASE}/corner_flag.glb`,
  crowdCard: `${BASE}/crowd_card.png`,
};

const _verified = new Map();
const _pending = new Map();

async function probeUrl(url) {
  if (_verified.has(url)) return _verified.get(url);
  if (_pending.has(url)) return _pending.get(url);
  const promise = fetch(url, { method: 'HEAD', cache: 'force-cache', signal: AbortSignal.timeout(5000) })
    .then((res) => {
      const len = parseInt(res.headers.get('content-length') || '0', 10);
      const ok = res.ok && (len === 0 || len > 512);
      _verified.set(url, ok);
      if (!ok) console.info('[FootballAssets] glTF not found — procedural players:', url);
      return ok;
    })
    .catch(() => {
      _verified.set(url, false);
      return false;
    })
    .finally(() => _pending.delete(url));
  _pending.set(url, promise);
  return promise;
}

export async function probeFootballGlb(which = 'player_green') {
  const url = which === 'player_blue' ? FOOTBALL_GLB.playerBlue : FOOTBALL_GLB.playerGreen;
  return probeUrl(url);
}

export function footballGlbReady(teamColor = 'green') {
  if (!FOOTBALL_GLB_PLAYERS_ENABLED) return false;
  const url = teamColor === 'blue' ? FOOTBALL_GLB.playerBlue : FOOTBALL_GLB.playerGreen;
  return _verified.get(url) === true;
}

/** Warm football glTF into loader cache (non-blocking). */
export function prewarmFootballAssets() {
  if (typeof window === 'undefined' || !FOOTBALL_GLB_PLAYERS_ENABLED) return;
  probeFootballGlb('player_green').then((okGreen) => {
    probeFootballGlb('player_blue').then((okBlue) => {
      if (!okGreen && !okBlue) return;
      import('./FootballPlayerKit.js').then(({ preloadFootballGlbTemplates }) => {
        preloadFootballGlbTemplates();
      });
    });
  });
}
