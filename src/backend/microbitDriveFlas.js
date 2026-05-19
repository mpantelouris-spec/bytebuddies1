/**
 * BBC micro:bit Drive Flashing
 * Simple, reliable method: detect MICROBIT drive and copy hex file
 * Works on Windows and macOS
 *
 * This module requires Node.js (Electron main process or backend)
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Detect connected micro:bit drives
 * Windows: looks for volume named "MICROBIT"
 * macOS: looks in /Volumes/ for "MICROBIT"
 *
 * @returns {Promise<Array>} Array of mount points
 */
export async function detectMicrobitDrives() {
  const platform = os.platform();
  const drives = [];

  if (platform === 'win32') {
    drives.push(...await detectWindowsDrives());
  } else if (platform === 'darwin') {
    drives.push(...await detectMacDrives());
  } else if (platform === 'linux') {
    drives.push(...await detectLinuxDrives());
  }

  return drives;
}

/**
 * Detect micro:bit drives on Windows
 */
async function detectWindowsDrives() {
  const drives = [];

  // Check all possible drive letters (D: through Z:)
  for (let i = 68; i <= 90; i++) {
    const driveLetter = String.fromCharCode(i);
    const drivePath = `${driveLetter}:`;

    try {
      // Check if drive exists
      const stats = await fs.promises.stat(drivePath);
      if (!stats.isDirectory()) continue;

      // Check for DETAILS.TXT (micro:bit signature file)
      const detailsPath = path.join(drivePath, 'DETAILS.TXT');
      try {
        await fs.promises.stat(detailsPath);
        drives.push({
          path: drivePath,
          name: 'MICROBIT',
          platform: 'windows',
          drive: driveLetter,
        });
      } catch {
        // Not a micro:bit drive
      }
    } catch (error) {
      // Drive doesn't exist
    }
  }

  return drives;
}

/**
 * Detect micro:bit drives on macOS
 */
async function detectMacDrives() {
  const drives = [];
  const volumesPath = '/Volumes';

  try {
    const items = await fs.promises.readdir(volumesPath);

    for (const item of items) {
      if (item.toUpperCase() === 'MICROBIT') {
        const fullPath = path.join(volumesPath, item);
        const detailsPath = path.join(fullPath, 'DETAILS.TXT');

        try {
          await fs.promises.stat(detailsPath);
          drives.push({
            path: fullPath,
            name: 'MICROBIT',
            platform: 'darwin',
          });
        } catch {
          // Not a micro:bit
        }
      }
    }
  } catch (error) {
    console.error('Error reading /Volumes:', error);
  }

  return drives;
}

/**
 * Detect micro:bit drives on Linux
 */
async function detectLinuxDrives() {
  const drives = [];
  const mountPath = '/media';

  try {
    const items = await fs.promises.readdir(mountPath);

    for (const item of items) {
      const itemPath = path.join(mountPath, item);
      const detailsPath = path.join(itemPath, 'DETAILS.TXT');

      try {
        await fs.promises.stat(detailsPath);
        drives.push({
          path: itemPath,
          name: 'MICROBIT',
          platform: 'linux',
        });
      } catch {
        // Not a micro:bit
      }
    }
  } catch (error) {
    console.error('Error reading /media:', error);
  }

  return drives;
}

/**
 * Flash hex file to micro:bit drive
 *
 * @param {string} hexContent - Intel HEX file content
 * @param {string} microbitDrive - Path to MICROBIT drive
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Flash result
 */
export async function flashHexToDrive(hexContent, microbitDrive, onProgress = null) {
  const report = (msg, status = 'info') => {
    if (onProgress) {
      onProgress({ message: msg, status });
    }
  };

  try {
    // Step 1: Validate inputs
    report('Validating hex file...', 'info');
    if (!hexContent || !hexContent.includes(':')) {
      throw new Error('Invalid hex file format');
    }

    if (!microbitDrive) {
      throw new Error('No micro:bit drive specified');
    }

    // Step 2: Check drive exists
    report('Checking micro:bit drive...', 'info');
    try {
      await fs.promises.stat(microbitDrive);
    } catch {
      throw new Error(`Drive not found: ${microbitDrive}`);
    }

    // Step 3: Verify it's a micro:bit
    report('Verifying device...', 'info');
    const detailsPath = path.join(microbitDrive, 'DETAILS.TXT');
    try {
      await fs.promises.stat(detailsPath);
    } catch {
      throw new Error('This is not a micro:bit drive (missing DETAILS.TXT)');
    }

    // Step 4: Write hex file
    report('Writing firmware...', 'info');
    const hexPath = path.join(microbitDrive, 'program.hex');

    await fs.promises.writeFile(hexPath, hexContent, 'utf-8');

    // Step 5: Verify write
    report('Verifying write...', 'info');
    try {
      const written = await fs.promises.readFile(hexPath, 'utf-8');
      if (written !== hexContent) {
        throw new Error('File verification failed - contents do not match');
      }
    } catch (error) {
      throw new Error(`Verification failed: ${error.message}`);
    }

    // Step 6: Wait for device to flash (device reboots)
    report('Device flashing...', 'info');
    await new Promise(r => setTimeout(r, 2000));

    // Step 7: Success
    report('✅ Program flashed successfully!', 'success');

    return {
      success: true,
      message: 'Hex file written to micro:bit',
      hexPath,
      drive: microbitDrive,
    };

  } catch (error) {
    const errorMsg = `❌ Flash failed: ${error.message}`;
    report(errorMsg, 'error');

    throw {
      success: false,
      message: error.message,
      stage: 'flashing',
      recoverySteps: getRecoverySteps(error.message),
    };
  }
}

/**
 * Get user-friendly recovery steps for specific errors
 */
function getRecoverySteps(errorMessage) {
  if (errorMessage.includes('not found')) {
    return [
      'Plug in your micro:bit via USB',
      'Wait for it to appear as a MICROBIT drive',
      'Try flashing again',
    ];
  }

  if (errorMessage.includes('Verification failed')) {
    return [
      'The drive may be write-protected',
      'Try a different USB cable',
      'Plug into a different USB port',
      'Unplug and replug the device',
    ];
  }

  if (errorMessage.includes('DETAILS.TXT')) {
    return [
      'This is not a micro:bit drive',
      'Make sure you selected the right drive',
      'Plug in your micro:bit and try again',
    ];
  }

  return [
    'Unplug and replug the micro:bit',
    'Try a different USB port',
    'Try a different USB cable',
    'Restart your computer',
  ];
}

/**
 * Complete auto-flash workflow
 * 1. Detect micro:bit drive
 * 2. Flash hex file
 * 3. Report status
 */
export async function autoFlash(hexContent, onProgress = null) {
  const report = (msg, status = 'info') => {
    if (onProgress) {
      onProgress({ message: msg, status });
    }
  };

  try {
    // Step 1: Detect drives
    report('🔍 Scanning for connected micro:bit...', 'info');
    const drives = await detectMicrobitDrives();

    if (drives.length === 0) {
      report(
        '❌ No micro:bit found. Plug in your device via USB.',
        'error'
      );
      throw new Error('No micro:bit drive detected');
    }

    report(`Found micro:bit at: ${drives[0].path}`, 'info');

    // Step 2: Flash to first drive found
    report('💾 Writing hex file...', 'info');
    const result = await flashHexToDrive(hexContent, drives[0].path, onProgress);

    return {
      ...result,
      drive: drives[0],
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Monitor for micro:bit drive connection
 * Useful for watching when user plugs in device
 */
export function monitorMicrobitDrives(onConnect, onDisconnect, interval = 1000) {
  let previousDrives = [];

  const check = async () => {
    try {
      const currentDrives = await detectMicrobitDrives();

      // Detect new connections
      for (const drive of currentDrives) {
        const wasConnected = previousDrives.some(
          d => d.path === drive.path
        );
        if (!wasConnected) {
          onConnect?.(drive);
        }
      }

      // Detect disconnections
      for (const drive of previousDrives) {
        const stillConnected = currentDrives.some(
          d => d.path === drive.path
        );
        if (!stillConnected) {
          onDisconnect?.(drive);
        }
      }

      previousDrives = currentDrives;
    } catch (error) {
      console.error('Error monitoring drives:', error);
    }
  };

  const intervalId = setInterval(check, interval);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

export default {
  detectMicrobitDrives,
  flashHexToDrive,
  autoFlash,
  monitorMicrobitDrives,
};
