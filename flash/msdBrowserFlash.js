/**
 * Copy .hex to the MICROBIT USB drive in Chrome/Edge (same as drag-and-drop).
 * Uses File System Access API — pick the MICROBIT volume once, then reuse.
 */

const DB_NAME = 'bytebuddies-microbit';
const DB_VERSION = 1;
const STORE = 'handles';
const HANDLE_KEY = 'microbit-dir';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
  });
}

export async function getStoredMicrobitDirHandle() {
  if (typeof indexedDB === 'undefined') return null;
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function storeMicrobitDirHandle(handle) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearStoredMicrobitDirHandle() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function isBrowserMsdFlashSupported() {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

/** True if folder looks like the micro:bit mass-storage volume. */
export async function verifyMicrobitDirHandle(dirHandle) {
  try {
    await dirHandle.getFileHandle('DETAILS.TXT');
    return true;
  } catch {
    return false;
  }
}

async function ensureWritePermission(dirHandle) {
  const opts = { mode: 'readwrite' };
  let perm = await dirHandle.queryPermission(opts);
  if (perm === 'granted') return;
  perm = await dirHandle.requestPermission(opts);
  if (perm !== 'granted') {
    throw new Error('Need permission to write to the MICROBIT folder.');
  }
}

/**
 * Ask user to pick the MICROBIT volume (must run inside a click handler).
 */
export async function pickMicrobitDirHandle() {
  if (!isBrowserMsdFlashSupported()) {
    throw new Error('Use Chrome or Edge to flash via the MICROBIT drive.');
  }
  const handle = await window.showDirectoryPicker({
    id: 'bytebuddies-microbit',
    mode: 'readwrite',
    startIn: 'desktop',
  });
  if (!(await verifyMicrobitDirHandle(handle))) {
    throw new Error(
      'That folder is not the micro:bit. In the picker, choose the MICROBIT drive (it has DETAILS.TXT inside).',
    );
  }
  await storeMicrobitDirHandle(handle);
  return handle;
}

/**
 * Copy Intel HEX onto the MICROBIT drive (same as manual drag-and-drop).
 * @param {string} hexContent
 * @param {string} [filename='program.hex']
 * @param {{ onProgress?: (p:{percent:number,message:string,stage?:string})=>void, dirHandle?: FileSystemDirectoryHandle, promptIfMissing?: boolean }} [options]
 */
export async function flashHexToBrowserMsd(hexContent, filename = 'program.hex', options = {}) {
  const { onProgress, promptIfMissing = true } = options;
  const report = (percent, message, stage = 'flashing') => {
    onProgress?.({ percent, message, stage });
  };

  if (!hexContent || !String(hexContent).includes(':')) {
    throw new Error('Invalid Intel HEX');
  }

  let dirHandle = options.dirHandle;
  if (!dirHandle) {
    dirHandle = await getStoredMicrobitDirHandle();
  }
  if (!dirHandle && promptIfMissing) {
    report(8, 'Choose the MICROBIT drive in the folder picker…', 'preparing');
    dirHandle = await pickMicrobitDirHandle();
  }
  if (!dirHandle) {
    throw new Error('MICROBIT folder not linked. Click “Link MICROBIT drive” or use Copy hex.');
  }

  if (!(await verifyMicrobitDirHandle(dirHandle))) {
    await clearStoredMicrobitDirHandle();
    throw new Error('Saved folder is not MICROBIT anymore — link the drive again.');
  }

  await ensureWritePermission(dirHandle);

  report(15, `Copying ${filename} to MICROBIT…`, 'flashing');
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(hexContent);
  await writable.close();

  report(92, 'Waiting for micro:bit to reboot (LED should update)…', 'verifying');
  await new Promise((r) => setTimeout(r, 5000));
  report(100, 'Copied to MICROBIT — LEDs should update.', 'completed');

  return { success: true, method: 'browser-msd', filename };
}
