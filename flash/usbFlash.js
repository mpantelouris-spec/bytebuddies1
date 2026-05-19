/**
 * USB "drag-and-drop" style flashing: copy .hex to the MICROBIT MSD volume.
 * Node.js / Electron main process only (uses fs).
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const DETAILS = 'DETAILS.TXT';
const DEFAULT_HEX_NAME = 'program.hex';

async function pathExists(p) {
  try {
    await fs.promises.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function isMicrobitMount(mountPoint) {
  const detailsPath = path.join(mountPoint, DETAILS);
  return pathExists(detailsPath);
}

export async function detectMicrobitDrives() {
  const platform = os.platform();
  if (platform === 'win32') return detectWindowsDrives();
  if (platform === 'darwin') return detectMacDrives();
  return detectLinuxDrives();
}

async function detectWindowsDrives() {
  const drives = [];
  for (let i = 68; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const drivePath = `${letter}:\\`;
    if (!(await pathExists(drivePath))) continue;
    if (await isMicrobitMount(drivePath)) {
      drives.push({ path: drivePath, name: 'MICROBIT', platform: 'windows', drive: letter });
    }
  }
  return drives;
}

async function detectMacDrives() {
  const drives = [];
  const volumesPath = '/Volumes';
  if (!(await pathExists(volumesPath))) return drives;
  const items = await fs.promises.readdir(volumesPath);
  for (const item of items) {
    if (item.toUpperCase() !== 'MICROBIT') continue;
    const fullPath = path.join(volumesPath, item);
    if (await isMicrobitMount(fullPath)) {
      drives.push({ path: fullPath, name: 'MICROBIT', platform: 'darwin' });
    }
  }
  return drives;
}

async function detectLinuxDrives() {
  const drives = [];
  const roots = ['/media', '/run/media'];
  for (const root of roots) {
    if (!(await pathExists(root))) continue;
    let users = [];
    try {
      users = await fs.promises.readdir(root);
    } catch {
      continue;
    }
    for (const u of users) {
      const base = path.join(root, u);
      let subs = [];
      try {
        subs = await fs.promises.readdir(base);
      } catch {
        continue;
      }
      for (const sub of subs) {
        const fullPath = path.join(base, sub);
        if (sub.toUpperCase() === 'MICROBIT' && (await isMicrobitMount(fullPath))) {
          drives.push({ path: fullPath, name: 'MICROBIT', platform: 'linux' });
        } else if (await isMicrobitMount(fullPath)) {
          drives.push({ path: fullPath, name: sub, platform: 'linux' });
        }
      }
    }
  }
  return drives;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function flashHexToDrive(hexContent, mountPoint, options = {}) {
  const { filename = DEFAULT_HEX_NAME, onProgress, maxAttempts = 4 } = options;
  const report = (percent, message, stage = 'flashing') => {
    onProgress?.({ percent, message, stage });
  };

  if (!hexContent || !String(hexContent).includes(':')) {
    throw new Error('Invalid Intel HEX content');
  }
  if (!mountPoint) throw new Error('No MICROBIT mount path');

  report(5, 'Verifying MICROBIT drive…', 'preparing');
  if (!(await pathExists(mountPoint))) throw new Error(`Drive not found: ${mountPoint}`);
  if (!(await isMicrobitMount(mountPoint))) {
    throw new Error('Selected path is not a micro:bit (missing DETAILS.TXT)');
  }

  const targetPath = path.join(mountPoint, filename);
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      report(15 + attempt * 5, `Writing ${filename}… (attempt ${attempt}/${maxAttempts})`, 'flashing');
      await fs.promises.writeFile(targetPath, hexContent, 'utf8');
      // After a successful write, the micro:bit often reboots and macOS ejects the volume
      // immediately — a read-back then fails with "device disappeared". Treat write as success.
      try {
        await fs.promises.access(targetPath, fs.constants.R_OK);
        const written = await fs.promises.readFile(targetPath, 'utf8');
        if (written === hexContent) {
          report(90, 'Verified file on drive.', 'verifying');
        }
      } catch {
        report(
          90,
          'Drive ejected during verify (normal). Check for ✓ on the micro:bit.',
          'verifying'
        );
      }
      report(95, 'Waiting for micro:bit to reboot…', 'verifying');
      await sleep(1500);
      report(100, 'USB copy complete — device should show the check mark.', 'completed');
      return { success: true, method: 'usb-msd', path: targetPath, mountPoint };
    } catch (e) {
      lastErr = e;
      await sleep(400 * attempt);
    }
  }
  throw new Error(lastErr?.message || 'USB copy failed after retries');
}

export async function autoFlashUsb(hexContent, onProgress) {
  onProgress?.({ percent: 0, message: 'Scanning for MICROBIT drive…', stage: 'preparing' });
  const drives = await detectMicrobitDrives();
  if (!drives.length) throw new Error('No MICROBIT USB drive found. Plug in the micro:bit and wait for the drive to appear.');
  onProgress?.({ percent: 5, message: `Found: ${drives[0].path}`, stage: 'preparing' });
  return flashHexToDrive(hexContent, drives[0].path, { onProgress });
}

/**
 * Poll for drive attach/detach. Returns stop function.
 */
export function watchMicrobitVolumes({ onChange, intervalMs = 1500 } = {}) {
  let last = [];
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    try {
      const cur = await detectMicrobitDrives();
      const curJson = JSON.stringify(cur.map(d => d.path).sort());
      const lastJson = JSON.stringify(last.map(d => d.path).sort());
      if (curJson !== lastJson) {
        last = cur;
        onChange?.(cur);
      }
    } catch {
      /* ignore */
    }
  };
  tick();
  const id = setInterval(tick, intervalMs);
  return () => {
    stopped = true;
    clearInterval(id);
  };
}

export default {
  detectMicrobitDrives,
  flashHexToDrive,
  autoFlashUsb,
  watchMicrobitVolumes,
};
