/**
 * Resolve static asset paths for Vite (base: './') and production.
 * Absolute "/assets/..." URLs break when the app is not served from domain root.
 */
const WEB_SIZED = /assets\/(characters|backgrounds)\/.+\.(png|jpe?g)$/i;

export function assetUrl(pathWithQuery = '') {
  if (!pathWithQuery) return pathWithQuery;
  if (/^(https?:|data:|blob:)/i.test(pathWithQuery)) return pathWithQuery;

  const qIndex = pathWithQuery.indexOf('?');
  const pathPart = qIndex >= 0 ? pathWithQuery.slice(0, qIndex) : pathWithQuery;
  let query = qIndex >= 0 ? pathWithQuery.slice(qIndex) : '';
  // Sprites and backdrops are served web-sized; older saved projects still hold URLs from
  // before that, so tag them too or browsers/CDN keep serving the old full-size copies.
  if (WEB_SIZED.test(pathPart) && !/[?&]o=/.test(query)) query = query ? `?o=1&${query.slice(1)}` : '?o=1';

  const clean = pathPart.replace(/^\//, '');
  let base = import.meta.env.BASE_URL || '/';
  if (!base.endsWith('/')) base += '/';

  const joined = `${base}${clean}`.replace(/([^:]\/)\/+/g, '$1');
  return `${joined}${query}`;
}

export default assetUrl;
