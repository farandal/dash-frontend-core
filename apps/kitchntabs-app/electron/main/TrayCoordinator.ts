import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import log from 'electron-log';

interface TrayAppRecord {
  appId: string;
  appName: string;
  pid: number;
  startedAt: number;
}

interface TrayState {
  trayPid?: number;
  trayStartedAt?: number;
  apps: Record<string, TrayAppRecord>;
}

/**
 * TrayCoordinator manages multi-app reference counting for the shared system tray.
 *
 * When multiple Electron app instances (kitchntabs-app, kitchntabs-mall) are running,
 * only ONE system tray icon should be displayed. This coordinator ensures:
 * - First app to start spawns the tray process
 * - Subsequent apps register without spawning a new tray
 * - Last app to exit kills the tray process
 *
 * State is persisted in ~/.kt_service/tray_apps.json using atomic file operations.
 */
export class TrayCoordinator {
  private trayStateFile: string;
  private appId: string;
  private appName: string;
  private trayProcess: any = null;
  private trayBinary: string;
  private isCleaning = false;

  constructor(appName: string, trayBinary: string) {
    this.appName = appName;
    this.appId = `${appName}-${process.pid}`;
    this.trayBinary = trayBinary;

    // State file location: ~/.kt_service/tray_apps.json
    const ktServiceDir = path.join(homedir(), '.kt_service');
    this.trayStateFile = path.join(ktServiceDir, 'tray_apps.json');
  }

  /**
   * Initialize tray coordination - register this app and spawn tray if needed
   */
  async initialize(): Promise<boolean> {
    try {
      this.ensureStateDirectory();

      // Use mkdir-based mutex for atomic file operations
      const mutexDir = path.join(path.dirname(this.trayStateFile), '.tray_mutex');

      // Attempt to acquire mutex (mkdir is atomic on most filesystems)
      const acquired = await this.acquireMutex(mutexDir);
      if (!acquired) {
        log.warn(`[TrayCoordinator] Failed to acquire mutex, retrying...`);
        await this.wait(100);
        return this.initialize();
      }

      try {
        const state = this.readState();
        const shouldSpawnTray = !state.trayPid || !this.isProcessRunning(state.trayPid);

        // Register this app
        state.apps[this.appId] = {
          appId: this.appId,
          appName: this.appName,
          pid: process.pid,
          startedAt: Date.now(),
        };

        if (shouldSpawnTray) {
          log.info(`[TrayCoordinator] Spawning tray (first app or tray crashed)`);
          const trayPid = await this.spawnTray();
          if (trayPid) {
            state.trayPid = trayPid;
            state.trayStartedAt = Date.now();
            this.trayProcess = { pid: trayPid };
          }
        } else {
          log.info(`[TrayCoordinator] Tray already running (PID: ${state.trayPid})`);
          this.trayProcess = { pid: state.trayPid };
        }

        this.writeState(state);
        log.info(`[TrayCoordinator] App registered: ${this.appId} (total apps: ${Object.keys(state.apps).length})`);
        return true;
      } finally {
        await this.releaseMutex(mutexDir);
      }
    } catch (error) {
      log.error(`[TrayCoordinator] Initialization failed:`, error);
      return false;
    }
  }

  /**
   * Cleanup - deregister this app and kill tray if it's the last app
   */
  async cleanup(): Promise<void> {
    if (this.isCleaning) return;
    this.isCleaning = true;

    try {
      const mutexDir = path.join(path.dirname(this.trayStateFile), '.tray_mutex');

      const acquired = await this.acquireMutex(mutexDir);
      if (!acquired) {
        log.warn(`[TrayCoordinator] Failed to acquire cleanup mutex`);
        return;
      }

      try {
        const state = this.readState();

        // Deregister this app
        delete state.apps[this.appId];
        log.info(`[TrayCoordinator] App deregistered: ${this.appId} (remaining apps: ${Object.keys(state.apps).length})`);

        // If no more apps, kill the tray
        if (Object.keys(state.apps).length === 0) {
          if (state.trayPid) {
            log.info(`[TrayCoordinator] No more apps - killing tray (PID: ${state.trayPid})`);
            this.killProcess(state.trayPid);
          }
          // Remove state file if no apps
          this.deleteStateFile();
        } else {
          this.writeState(state);
        }
      } finally {
        await this.releaseMutex(mutexDir);
      }
    } catch (error) {
      log.error(`[TrayCoordinator] Cleanup failed:`, error);
    }
  }

  /**
   * Spawn the tray process
   */
  private async spawnTray(): Promise<number | null> {
    try {
      log.info(`[TrayCoordinator] Spawning tray binary: ${this.trayBinary}`);

      const trayProcess = spawn(this.trayBinary, [], {
        detached: true,
        stdio: 'ignore',
        ...(process.platform === 'win32' && { windowsHide: true })
      });

      // Unref so parent process can exit independently
      trayProcess.unref();

      log.info(`[TrayCoordinator] Tray spawned with PID: ${trayProcess.pid}`);
      return trayProcess.pid;
    } catch (error) {
      log.error(`[TrayCoordinator] Failed to spawn tray:`, error);
      return null;
    }
  }

  /**
   * Read current tray state from file
   */
  private readState(): TrayState {
    try {
      if (fs.existsSync(this.trayStateFile)) {
        const data = fs.readFileSync(this.trayStateFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      log.warn(`[TrayCoordinator] Failed to read state:`, error);
    }
    return { apps: {} };
  }

  /**
   * Write tray state to file (atomic write with temp file + rename)
   */
  private writeState(state: TrayState): void {
    try {
      const tempFile = `${this.trayStateFile}.tmp`;
      const data = JSON.stringify(state, null, 2);
      fs.writeFileSync(tempFile, data, 'utf8');

      // Atomic rename
      if (fs.existsSync(this.trayStateFile)) {
        fs.unlinkSync(this.trayStateFile);
      }
      fs.renameSync(tempFile, this.trayStateFile);
    } catch (error) {
      log.error(`[TrayCoordinator] Failed to write state:`, error);
    }
  }

  /**
   * Delete state file (when no more apps)
   */
  private deleteStateFile(): void {
    try {
      if (fs.existsSync(this.trayStateFile)) {
        fs.unlinkSync(this.trayStateFile);
      }
    } catch (error) {
      log.error(`[TrayCoordinator] Failed to delete state file:`, error);
    }
  }

  /**
   * Ensure ~/.kt_service directory exists
   */
  private ensureStateDirectory(): void {
    const dir = path.dirname(this.trayStateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Acquire mutex via mkdir (atomic on most filesystems)
   */
  private async acquireMutex(mutexDir: string, retries: number = 5): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        fs.mkdirSync(mutexDir, { recursive: false });
        return true;
      } catch (error: any) {
        if (error.code === 'EEXIST' && i < retries - 1) {
          await this.wait(50);
          continue;
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Release mutex
   */
  private async releaseMutex(mutexDir: string): Promise<void> {
    try {
      if (fs.existsSync(mutexDir)) {
        fs.rmdirSync(mutexDir);
      }
    } catch (error) {
      log.warn(`[TrayCoordinator] Failed to release mutex:`, error);
    }
  }

  /**
   * Check if a process is running (cross-platform)
   */
  private isProcessRunning(pid: number): boolean {
    try {
      // POSIX: process.kill(pid, 0) throws if process doesn't exist
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Kill a process (cross-platform)
   */
  private killProcess(pid: number): void {
    try {
      if (process.platform === 'win32') {
        // Windows: use taskkill
        spawn('taskkill', ['/pid', pid.toString(), '/f', '/t'], { stdio: 'ignore' });
      } else {
        // Unix: use kill signal
        process.kill(pid, 'SIGTERM');
      }
    } catch (error) {
      log.error(`[TrayCoordinator] Failed to kill process ${pid}:`, error);
    }
  }

  /**
   * Utility: wait
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get tray process PID (for debugging)
   */
  getTrayPid(): number | undefined {
    return this.trayProcess?.pid;
  }
}
