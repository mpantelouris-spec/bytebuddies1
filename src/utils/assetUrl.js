/**
 * Resolve static asset paths for Vite (base: './') and production.
 * Absolute "/assets/..." URLs break when the app is not served from domain root.
 */
export function assetUrl(pathWithQuery = '') {
  if (!pathWithQuery) return pathWithQuery;
  if (/^(https?:|data:|blob:)/i.test(pathWithQuery)) return pathWithQuery;

  const qIndex = pathWithQuery.indexOf('?');
  const pathPart = qIndex >= 0 ? pathWithQuery.slice(0, qIndex) : pathWithQuery;
  const query = qIndex >= 0 ? pathWithQuery.slice(qIndex) : '';

  const clean = pathPart.replace(/^\//, '');
  let base = import.meta.env.BASE_URL || '/';
  if (!base.endsWith('/')) base += '/';

  const joined = `${base}${clean}`.replace(/([^:]\/)\/+/g, '$1');
  return `${joined}${query}`;
}

export default assetUrl;
