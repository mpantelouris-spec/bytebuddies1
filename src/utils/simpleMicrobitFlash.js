/**
 * Simple Micro:bit Flashing
 * Most reliable method: Download hex and show clear instructions
 * User drops file on MICROBIT drive - works 100% of the time
 */

/**
 * Download hex file and guide user through flashing
 */
export async function downloadAndFlash(hexString, filename = 'program.hex') {
  return new Promise((resolve, reject) => {
    try {
      // Create blob from hex string
      const blob = new Blob([hexString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      resolve({
        success: true,
        message: 'Hex file downloaded successfully',
        filename,
      });
    } catch (error) {
      reject({
        success: false,
        message: `Download failed: ${error.message}`,
        error,
      });
    }
  });
}

/**
 * Get platform-specific instructions for flashing
 */
export function getFlashingInstructions() {
  const platform = detectPlatform();

  const instructions = {
    windows: {
      title: '💾 Your Hex File is Ready!',
      steps: [
        '1️⃣ The file "program.hex" should have downloaded',
        '2️⃣ Plug in your micro:bit via USB',
        '3️⃣ Wait for it to appear as a "MICROBIT" drive on your computer',
        '4️⃣ Open File Explorer → Look for the MICROBIT drive',
        '5️⃣ Drag "program.hex" from Downloads to the MICROBIT drive',
        '6️⃣ Device will flash and restart automatically',
        '✅ Look for a checkmark (✓) on the micro:bit display',
      ],
      keyPoints: [
        '⚠️ Make sure to drag the file (don\'t copy/paste)',
        '⚠️ Wait for the progress indicator while copying',
        '⚠️ Device restarts when flashing is complete',
      ],
    },
    mac: {
      title: '💾 Your Hex File is Ready!',
      steps: [
        '1️⃣ The file "program.hex" should have downloaded',
        '2️⃣ Plug in your micro:bit via USB',
        '3️⃣ Wait for it to appear as a "MICROBIT" volume on your desktop',
        '4️⃣ Open Finder → Look for MICROBIT in Locations',
        '5️⃣ Drag "program.hex" from Downloads to the MICROBIT volume',
        '6️⃣ Device will flash and restart automatically',
        '✅ Look for a checkmark (✓) on the micro:bit display',
      ],
      keyPoints: [
        '⚠️ Make sure to drag the file (don\'t copy/paste)',
        '⚠️ Device will eject automatically when done',
        '⚠️ Device restarts when flashing is complete',
      ],
    },
    linux: {
      title: '💾 Your Hex File is Ready!',
      steps: [
        '1️⃣ The file "program.hex" should have downloaded',
        '2️⃣ Plug in your micro:bit via USB',
        '3️⃣ Open file manager and look for MICROBIT mount',
        '4️⃣ Drag "program.hex" from Downloads to MICROBIT',
        '5️⃣ Device will flash and restart automatically',
        '✅ Look for a checkmark (✓) on the micro:bit display',
      ],
      keyPoints: [
        '⚠️ Device will unmount when flashing completes',
      ],
    },
  };

  return instructions[platform] || instructions.windows;
}

/**
 * Detect operating system
 */
function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'mac';
  if (ua.includes('linux')) return 'linux';
  return 'windows'; // Default to Windows
}

/**
 * Check if file was successfully copied to micro:bit
 * (Simple check - looks for recently modified file on MICROBIT drive)
 */
export async function checkFlashStatus() {
  // This would require Electron IPC or a backend API
  // For now, return a placeholder that users need to confirm manually
  return {
    checked: false,
    message: 'Please confirm the file was copied to the MICROBIT drive',
    helpText: 'Look for a checkmark (✓) on the micro:bit display to confirm flashing worked',
  };
}

/**
 * Get troubleshooting steps for common issues
 */
export function getTroubleshootingSteps() {
  return {
    'No MICROBIT drive appears': [
      '✓ Check the USB cable - try a different port',
      '✓ Try a different USB cable',
      '✓ Plug device into computer\'s USB port (not USB hub)',
      '✓ On Windows: Check Device Manager for unknown devices',
      '✓ On Mac: Check System Report → USB for "BBC micro:bit"',
      '✓ Restart your computer',
    ],
    'File won\'t copy to drive': [
      '✓ Try dragging again slowly (don\'t rush)',
      '✓ Device may be write-locked - try unplugging and replugging',
      '✓ Try copying to a different location on the drive',
      '✓ Close any other programs accessing the drive',
    ],
    'Checkmark didn\'t appear': [
      '✓ Wait a few seconds - flashing takes time',
      '✓ Try pressing the reset button on the back',
      '✓ Device might be flashing in background - wait longer',
      '✓ Check that you dropped the .hex file (not a folder)',
    ],
    'Device disconnected during flash': [
      '✓ USB cable may be loose - plug it back in',
      '✓ Try a different USB port',
      '✓ Try a different USB cable',
      '✓ Wait for device to reconnect, then try again',
    ],
  };
}

/**
 * User-friendly status messages
 */
export const STATUS_MESSAGES = {
  DOWNLOADING: {
    message: '📥 Downloading hex file...',
    status: 'info',
  },
  READY: {
    message: '✅ Hex file ready! Follow the instructions below.',
    status: 'success',
  },
  INSTRUCTIONS_SHOWN: {
    message: '📋 Detailed instructions are displayed. Follow them step-by-step.',
    status: 'info',
  },
  WAITING_FOR_COPY: {
    message: '⏳ Waiting for you to copy file to MICROBIT drive...',
    status: 'info',
  },
  FLASHING: {
    message: '⚡ Device is flashing! Do not unplug.',
    status: 'info',
  },
  SUCCESS: {
    message: '🎉 Success! Your program is running on the micro:bit.',
    status: 'success',
  },
  ERROR_NO_FILE: {
    message: '❌ Download failed. Please try again.',
    status: 'error',
  },
  ERROR_NO_DEVICE: {
    message: '❌ No MICROBIT drive found. Plug in your device.',
    status: 'error',
  },
  ERROR_COPY_FAILED: {
    message: '❌ Failed to copy file. Check drive permissions.',
    status: 'error',
  },
};

export default {
  downloadAndFlash,
  getFlashingInstructions,
  checkFlashStatus,
  getTroubleshootingSteps,
  STATUS_MESSAGES,
  detectPlatform,
};
