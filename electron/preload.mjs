import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('bytebuddiesNative', {
  microbit: {
    listDrives: () => ipcRenderer.invoke('microbit:listDrives'),
    flashUsb: (hex, opts = {}) =>
      ipcRenderer.invoke('microbit:flashUsb', {
        hex,
        mountPath: opts.mountPath,
        filename: opts.filename,
      }),
    startDriveMonitoring: () => ipcRenderer.invoke('microbit:startDriveMonitoring'),
    stopDriveMonitoring: () => ipcRenderer.invoke('microbit:stopDriveMonitoring'),
    onFlashProgress: (cb) => {
      const handler = (_e, payload) => cb(payload);
      ipcRenderer.on('microbit:flash-progress', handler);
      return () => ipcRenderer.removeListener('microbit:flash-progress', handler);
    },
    onDrivesChanged: (cb) => {
      const handler = (_e, drives) => cb(drives);
      ipcRenderer.on('microbit:drives-changed', handler);
      return () => ipcRenderer.removeListener('microbit:drives-changed', handler);
    },
  },
});
