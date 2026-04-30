console.log("Preload loaded from Electron context");

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('DashIPCService', {
  runPythonScript: (filePath: string, scriptPath: string, args: string[]) => {
    ipcRenderer.send('run-python-script', filePath, scriptPath, args);
  },
  action: (action: string, payload: any) => {
    ipcRenderer.send('ipc-action', action, payload);
  },
  // Convenience method for speech - speaks a message using Python TTS
  // Usage: DashIPCService.speak("Hello world") or DashIPCService.speak({ message: "Hola", lang: "es" })
  speak: (payload: string | { message: string; lang?: string }) => {
    ipcRenderer.send('ipc-action', 'speech', payload);
  },
  // Play a sound file by name (e.g., 'bip', 'ringtone')
  playSound: (soundName: string) => {
    ipcRenderer.send('ipc-action', 'sound', soundName);
  },
  // Stop currently playing sound
  stopSound: () => {
    ipcRenderer.send('ipc-action', 'stop-sound');
  },
  // Show a notification
  notify: (title: string, message: string) => {
    ipcRenderer.send('ipc-action', 'notification', { title, message });
  },
  
  // ==================== SERVICE METHODS (IPC) ====================
  
  /**
   * Print a PDF from a URL using the thermal printer.
   * Downloads the PDF and sends it to the configured thermal printer.
   * @param url URL of the PDF to download and print
   * @returns Promise with print results including stdout, stderr, and exit code
   * @example 
   *   const result = await window.DashIPCService?.print("https://api.example.com/receipt.pdf");
   *   console.log(result.success); // true if printed
   */
  print: (url: string): Promise<any> => {
    return ipcRenderer.invoke('ipc-print', url);
  },
  
  /**
   * Speak a message using the TTS service (alternative to speak() which is fire-and-forget).
   * This version returns a promise with the result.
   * @param text Text to speak
   * @param lang Optional language code (default: "es")
   * @returns Promise with speech results
   * @example 
   *   const result = await window.DashIPCService?.speakAsync("Hello world", "en");
   *   console.log(result.success); // true if audio played
   */
  speakAsync: (text: string, lang?: string): Promise<any> => {
    return ipcRenderer.invoke('ipc-speak', { text, lang });
  },
  
  // ==================== END SERVICE METHODS ====================
  
  // ==================== AUTO UPDATE METHODS ====================
  
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  startDownload: () => ipcRenderer.invoke('start-download'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),

  onUpdateAvailable: (callback: any) => {
    ipcRenderer.on('update-can-available', (event, arg) => callback(arg));
  },
  onDownloadProgress: (callback: any) => {
    ipcRenderer.on('download-progress', (event, arg) => callback(arg));
  },
  onUpdateDownloaded: (callback: any) => {
    ipcRenderer.on('update-downloaded', (event, arg) => callback(arg));
  },
  onUpdateError: (callback: any) => {
    ipcRenderer.on('update-error', (event, arg) => callback(arg));
  },

  // ==================== END AUTO UPDATE METHODS ====================

  onPythonOutput: (callback: any) => {
    ipcRenderer.on('python-output', (event, data) => callback(data));
  },
  onServiceMessage: (callback: any) => {
    ipcRenderer.on('service', (event, data) => callback(data));
  },
  onStdout: (callback: any) => {
    ipcRenderer.on('stdout', (event, data) => callback(data));
  },
  onElectronLog: (callback: any) => {
    ipcRenderer.on('electron-log', (event, logData) => callback(logData));
  },
  onSubprocessOutput: (callback: any) => {
    ipcRenderer.on('subprocess-output', (event, data) => callback(data));
  },
  windowControls: (action: string) => ipcRenderer.send('window-controls', action),
  startDrag: () => ipcRenderer.send('window-drag-start'),
});


contextBridge.exposeInMainWorld('electronStore', {
  get: (key: string) => ipcRenderer.invoke('electronStore:get', key),
  set: (key: string, value: any) => ipcRenderer.invoke('electronStore:set', key, value),
  delete: (key: string) => ipcRenderer.invoke('electronStore:delete', key),
  clear: () => ipcRenderer.invoke('electronStore:clear'),
  getAll: () => ipcRenderer.invoke('electronStore:getAll'),
  syncToLocalStorage: async () => {
    const all = await ipcRenderer.invoke('electronStore:getAll');
    // This function will be called in the renderer, not here!
    return all;
  }
});

