import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectMicrobitDrives, flashHexToDrive, watchMicrobitVolumes } from '../flash/usbFlash.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow = null;
let driveWatcher = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const devUrl = process.env.ELECTRON_START_URL || process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('microbit:listDrives', async () => detectMicrobitDrives());

ipcMain.handle('microbit:flashUsb', async (event, { hex, mountPath, filename }) => {
  const target = mountPath || (await detectMicrobitDrives())[0]?.path;
  if (!target) {
    throw new Error('No MICROBIT drive found');
  }
  const sender = event.sender;
  return flashHexToDrive(hex, target, {
    filename: filename || 'program.hex',
    onProgress: (p) => {
      try {
        sender.send('microbit:flash-progress', p);
      } catch {
        // window closed
      }
    },
  });
});

/**
 * Monitor USB drive changes and notify renderer
 */
ipcMain.handle('microbit:startDriveMonitoring', async () => {
  if (driveWatcher) return;
  driveWatcher = watchMicrobitVolumes({
    onChange: (drives) => {
      if (mainWindow) {
        mainWindow.webContents.send('microbit:drives-changed', drives);
      }
    },
    intervalMs: 1500,
  });
});

ipcMain.handle('microbit:stopDriveMonitoring', async () => {
  if (driveWatcher) {
    driveWatcher();
    driveWatcher = null;
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (driveWatcher) {
    driveWatcher();
    driveWatcher = null;
  }
  if (process.platform !== 'darwin') app.quit();
});
