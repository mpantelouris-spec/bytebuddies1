/**
 * Per-frame animation used to walk the whole track scene several times a frame
 * looking for things to spin or pulse. These helpers find them once and keep the
 * list, rescanning every few seconds in case something was added or removed.
 * (Kept in WeakMaps, not userData, so cloning a scene never copies them.)
 */
const RESCAN_MS = 3000;
const lists = new WeakMap();
const children = new WeakMap();

export function cachedNodes(root, key, test) {
  if (!root) return [];
  let store = lists.get(root);
  if (!store) { store = {}; lists.set(root, store); }
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let entry = store[key];
  if (!entry || now - entry.at > RESCAN_MS) {
    const list = [];
    root.traverse((o) => { if (test(o)) list.push(o); });
    entry = store[key] = { at: now, list };
  }
  return entry.list;
}

/** A named child, looked up once and remembered for that parent. */
export function cachedChild(obj, name) {
  let store = children.get(obj);
  if (!store) { store = {}; children.set(obj, store); }
  let c = store[name];
  if (c === undefined || (c && c.parent == null)) c = store[name] = obj.getObjectByName(name) || null;
  return c;
}
