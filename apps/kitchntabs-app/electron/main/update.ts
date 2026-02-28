import { app, ipcMain } from 'electron';
import path from 'path';
import log from 'electron-log';
//const { autoUpdater } = await import('electron-updater');
import { autoUpdater }  from 'electron-updater';
//const log = (await import('electron-log')).default;

// Define interfaces for type safety
interface UpdateInfo {
  version: string;
}

interface ProgressInfo {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

interface UpdateDownloadedEvent {
  version: string;
}

export async function update(win: Electron.BrowserWindow) {
  try {
    // Try to import electron-updater
    //const { autoUpdater } = await import('electron-updater');

    // When set to false, the update download will be triggered through the API
    autoUpdater.autoDownload = false;
    autoUpdater.disableWebInstaller = false;
    autoUpdater.allowDowngrade = false;

    // start check
    autoUpdater.on('checking-for-update', function () {
      log.info('Checking for update...');
    });
    // update available
    autoUpdater.on('update-available', (arg: UpdateInfo) => {
      log.info('Update available:', arg);
      win.webContents.send('update-can-available', {
        update: true,
        version: app.getVersion(),
        newVersion: arg?.version,
      });
    });
    // update not available
    autoUpdater.on('update-not-available', (arg: UpdateInfo) => {
      log.info('No update available');
      win.webContents.send('update-can-available', {
        update: false,
        version: app.getVersion(),
        newVersion: arg?.version,
      });
    });

    // Checking for updates
    ipcMain.handle('check-update', async () => {
      if (!app.isPackaged) {
        const error = new Error('The update feature is only available after the package.');
        return { message: error.message, error };
      }

      try {
        return await autoUpdater.checkForUpdatesAndNotify();
      } catch (error) {
        return { message: 'Network error', error };
      }
    });

    // Start downloading and feedback on progress
    ipcMain.handle('start-download', (event: Electron.IpcMainInvokeEvent) => {
      // Add a function to handle download progress and completion
      const startDownload = () => {
        autoUpdater.on('download-progress', (info: ProgressInfo) => {
          event.sender.send('download-progress', info);
        });

        autoUpdater.on('error', (error: Error) => {
          event.sender.send('update-error', { message: error.message, error });
        });

        autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent) => {
          event.sender.send('update-downloaded');
        });

        autoUpdater.downloadUpdate();
      };

      startDownload();
    });

    // Install now
    ipcMain.handle('quit-and-install', () => {
      autoUpdater.quitAndInstall(false, true);
    });

    log.info('Auto-updater successfully initialized');
  } catch (error) {
    // Log error but don't crash the app if updater isn't available
    log.error('Failed to initialize auto-updater:', error);
    win.webContents.send('update-error', {
      message: 'Auto-updater not available',
      error,
    });
  }
}
