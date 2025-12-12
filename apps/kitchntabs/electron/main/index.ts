import { app, BrowserWindow, shell, ipcMain, powerMonitor, dialog, Notification } from "electron";

import { release } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { update } from "./update";
import * as dotenv from "dotenv";
import * as path from "path";
import YAML from "yaml";
import * as fs from "fs";
import { exec, ExecException, spawn } from "child_process";
import log from 'electron-log';
import sound from "sound-play";
import readline from 'readline';
let isQuitting = false;
let isCleaningUp = false;
let ElectronStore;
(async () => {
  ElectronStore = (await import('electron-store')).default;
  const store = new ElectronStore();
  console.log("Initializing IPC electron-store")
  ipcMain.handle('electronStore:get', (_event, key) => store.get(key));
ipcMain.handle('electronStore:set', (_event, key, value) => store.set(key, value));
ipcMain.handle('electronStore:delete', (_event, key) => store.delete(key));
ipcMain.handle('electronStore:clear', () => store.clear());
ipcMain.handle('electronStore:getAll', () => store.store); // store.store is the raw object
})();



// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");


const isDev = process.env.NODE_ENV === 'development' && !app.isPackaged;
log.info(`isDev: ${isDev}`);

ipcMain.setMaxListeners(0); // disable the listener limit

const appPath = app.isPackaged
  ? process.platform === 'darwin' ? path.join(app.getAppPath(),`../../`) : app.getAppPath()
  : path.join(dirname(fileURLToPath(import.meta.url)), "../../");
  
log.info(`appPath: ${appPath}`);

const distElectron = app.isPackaged
  ? path.join(app.getAppPath(), "dist-electron")
  : path.join(appPath, "dist-electron");

const distVite = app.isPackaged
  ? path.join(app.getAppPath(), "dist")
  : path.join(appPath, "dist");

log.info(`distElectron: ${distElectron}`);

process.env.DIST_ELECTRON = distElectron;
process.env.DIST = distVite;

let pythonProcess: any;
let printProcess: any;
let soundProcess: any;

dotenv.config();
let config: any = {};


const BUILD_ENV: string = process.env.BUILD_ENV?.toLowerCase() || "prod";

// Get CUSTOM_MODE from environment (set during build process)
// e.g., "kitchntabs.development", "kitchntabs.production", "pinoywok.ngrok"
const CUSTOM_MODE: string | undefined = process.env.CUSTOM_MODE;

// Determine config file name based on CUSTOM_MODE
// If CUSTOM_MODE is set (e.g., "kitchntabs.development"), use "config.kitchntabs.development.yaml"
// Otherwise fall back to "config.yaml"
const getConfigFileName = (): string => {
  if (CUSTOM_MODE) {
    const customConfigFile = `config.${CUSTOM_MODE}.yaml`;
    // In development, check if the custom config file exists
    if (isDev) {
      const customConfigPath = path.join(appPath, "../../../dash-python-service");
      if (fs.existsSync(customConfigPath)) {
        log.info(`Using custom config file: ${customConfigFile}`);
        return customConfigFile;
      } else {
        log.warn(`Custom config file not found: ${customConfigPath}, falling back to config.yaml`);
      }
    } else {
      // In production, assume the custom config was bundled with the correct name
      return customConfigFile;
    }
  }
  return 'config.yaml';
};

const configFileName = getConfigFileName();
log.info(`CUSTOM_MODE: ${CUSTOM_MODE || 'not set'}`);
log.info(`Config file name: ${configFileName}`);

let configFile = "";
if(isDev) {
  // In development, check if we should use custom config from dash-python-service
  if (CUSTOM_MODE) {
    const customConfigPath = path.join(appPath, `../../../dash-python-service/${configFileName}`);
    if (fs.existsSync(customConfigPath)) {
      configFile = customConfigPath;
      log.info(`Using custom config file from dash-python-service: ${configFile}`);
    } else {
      configFile = path.join(appPath, `./${configFileName}`);
      log.warn(`Custom config file not found in dash-python-service, using local: ${configFile}`);
    }
  } else {
    configFile = path.join(appPath, `./${configFileName}`);
  }
} else {
  // In production, config files are in resources folder
  if (process.platform === 'darwin') {
    configFile = path.join(appPath, `./Resources/${configFileName}`);
  } else {
    // Linux/Windows: use app.getAppPath() for absolute path to resources
    configFile = path.join(app.getAppPath(), `../${configFileName}`);
  }
}
	
const iconsPath = isDev 
  ? path.join(appPath, `./icons`)
  : process.platform === 'darwin' 
    ? path.join(appPath, `./Resources/icons/`) 
    : path.join(app.getAppPath(), `../icons/`);

log.info(`CONFIG FILE: ${configFile}`);
const initVariables = {
  isDev,
  appPath,
  distElectron,
  distVite,
  BUILD_ENV,
  configFile
};


try {
  const _configFile = fs.readFileSync(configFile, "utf8");
  config = YAML.parse(_configFile);
  log.info(`CONFIG: ${JSON.stringify(config)}`);
} catch (err) {
  log.error("Error loading config file:", err);
  log.error("Config file path:", configFile);
  log.error("File exists:", fs.existsSync(configFile));
  app.quit();
}

// Ensure APP_NAME is set (with fallback)
const appName = config.APP_NAME || 'dash';
log.info(`APP_NAME: ${appName}`);

app.setPath('userData', path.join(
  process.env.APPDATA || 
  (process.platform === 'darwin' 
    /* @ts-ignore  */
    ? path.join(process.env.HOME, 'Library', 'Application Support') 
    /* @ts-ignore  */
    : path.join(process.env.HOME, '.config')),
    appName
));


const VITE_PROJECT_PATH: string = config.VITE_PROJECT_PATH || 'apps/dash'
log.info(`VITE_PROJECT_PATH: ${VITE_PROJECT_PATH}`);

const SPAWN_PYTHON_SERVICE: boolean =
  config?.SPAWN_PYTHON_SERVICE || false;

// Add .exe extension on Windows for production executables
const addExeExtension = (filePath: string): string => {
  if (process.platform === 'win32' && !filePath.endsWith('.exe')) {
    return filePath + '.exe';
  }
  return filePath;
};

// Get the resources path for production builds
const getResourcesPath = (): string => {
  if (app.isPackaged) {
    // process.resourcesPath gives us the correct resources directory on all platforms
    // macOS: .app/Contents/Resources
    // Windows/Linux: <app>/resources
    return process.resourcesPath;
  }
  return appPath;
};

const resourcesPath = getResourcesPath();
log.info(`resourcesPath: ${resourcesPath}`);

// Python service binary path
// In production: 
//   macOS: .app/Contents/Resources/python-service/kt_service
//   Linux/Windows: resources/python-service/kt_service(.exe)
// In development: uses the path from config
const PYTHON_SERVICE_PATH_PROD: string = addExeExtension(
  app.isPackaged 
    ? path.join(
        resourcesPath,  // Already points to Resources folder on all platforms
        config?.PYTHON_SERVICE_PATH_PROD || './python-service/kt_service'
      )
    : path.join(
        process.platform === "win32" ? path.join(app.getAppPath(),"../") : appPath,
        "../../../",
        config?.PYTHON_SERVICE_PATH_PROD || './python-service/kt_service'
      )
);

log.info(`PYTHON_SERVICE_PATH_PROD: ${PYTHON_SERVICE_PATH_PROD}`);

// Config path for the Python service - needs to point to where the YAML files are in production
const PYTHON_SERVICE_CONFIG_PATH_PROD: string = app.isPackaged 
    ? path.join(resourcesPath, configFileName)  // All platforms: resources/<config>.yaml
    : path.join(
        process.platform === "win32" ? path.join(app.getAppPath(),"../") : appPath,
        configFileName
      );

log.info(`PYTHON_SERVICE_CONFIG_PATH_PROD: ${PYTHON_SERVICE_CONFIG_PATH_PROD}`);

// Development paths - only used when not packaged, provide fallbacks
const PYTHON_SERVICE_PATH_DEV: string = config?.PYTHON_SERVICE_PATH_DEV 
  ? path.join(appPath, config.PYTHON_SERVICE_PATH_DEV)
  : path.join(appPath, "../../../dash-python-service/src/kt_service.py");

// Platform-specific Python environment path
const getDevPythonEnvPath = (): string => {
  if (config?.DEV_PYTHON_ENV) {
    return path.join(appPath, config.DEV_PYTHON_ENV);
  }
  // Windows uses Scripts/python.exe, Unix uses bin/python3
  const pythonSubPath = process.platform === 'win32' 
    ? 'pw_env/Scripts/python.exe'
    : 'pw_env/bin/python3';
  return path.join(appPath, `../../../dash-python-service/${pythonSubPath}`);
};

const DEV_PYTHON_ENV: string = getDevPythonEnvPath();

//const preload = join(distElectron, "./preload/index.mjs");
//const preload = path.join(__dirname, '../preload/index.js');

log.info(join(appPath, VITE_PROJECT_PATH, "dist/index.html"));
log.info(join(appPath, VITE_PROJECT_PATH, "src/index.html"));
log.info("BUILD_ENV:", BUILD_ENV);
const indexHtml = BUILD_ENV === "prod" ? path.join(app.getAppPath(),"apps/kitchntabs/dist/index.html"): path.join(appPath,"src/index.html");


if (fs.existsSync(indexHtml)) {
  const content = fs.readFileSync(indexHtml, 'utf8');
  log.info("Index HTML content length:", content.length);
  log.info("Index HTML content excerpt:", content.substring(0, 200));
} else {
    throw new Error(`Index HTML file not found: ${indexHtml}`);
}

log.info(`User data: ${app.getPath("userData")}`);
log.info(`isPackaged: ${app.isPackaged}`);
log.info(`CWD: ${appPath}`);
log.info(`CONF: ${configFile}`);
log.info(`BUILD_ENV: ${BUILD_ENV}`);

// Comprehensive path diagnostics for debugging production issues
log.info('=== Path Diagnostics ===');
log.info(`Platform: ${process.platform}`);
log.info(`app.getAppPath(): ${app.getAppPath()}`);
log.info(`app.isPackaged: ${app.isPackaged}`);
log.info(`resourcesPath: ${resourcesPath}`);
log.info(`configFile: ${configFile}`);
log.info(`PYTHON_SERVICE_PATH_PROD: ${PYTHON_SERVICE_PATH_PROD}`);
log.info(`PYTHON_SERVICE_PATH_DEV: ${PYTHON_SERVICE_PATH_DEV}`);
log.info(`DEV_PYTHON_ENV: ${DEV_PYTHON_ENV}`);
log.info(`DEV_PYTHON_ENV exists: ${fs.existsSync(DEV_PYTHON_ENV)}`);
log.info(`PYTHON_SERVICE_CONFIG_PATH_PROD: ${PYTHON_SERVICE_CONFIG_PATH_PROD}`);
log.info(`Python binary exists: ${fs.existsSync(PYTHON_SERVICE_PATH_PROD)}`);
log.info(`Python config exists: ${fs.existsSync(PYTHON_SERVICE_CONFIG_PATH_PROD)}`);
log.info('========================');

const lockFile =
  isDev
    ? path.join(appPath, "./dash_process.lock")
    : path.join(app.getPath("userData"), "dash_process.lock");

// Create log directory if it doesn't exist
const ensureLogDirectory = () => {
  const logDir = isDev
    ? path.join(appPath, "logs")
    : path.join(app.getPath("userData"), "logs");
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    log.info(`Created log directory: ${logDir}`);
  }
  
  return logDir;
};

const logDir = ensureLogDirectory();
const logFileName = "electron-log.txt";

const logFile = path.join(logDir, logFileName);

log.info(`logFile: ${logFile}`);
log.info(`lockFile: ${lockFile}`);

// Configure electron-log with the correct path
log.transports.file.level = "info";
log.transports.file.resolvePathFn = () => logFile;
log.transports.console.level = "debug";
/*log.catchErrors({
  showDialog: false,
  onError(error) {
    log.error('Caught error:', error);
  }
});*/

log.info("LOG_FILE", logFile);
log.info("PYTHON_SERVICE_PATH_PROD", PYTHON_SERVICE_PATH_PROD);
log.info("PYTHON_SERVICE_PATH_DEV", PYTHON_SERVICE_PATH_DEV)


let win: BrowserWindow;

app.requestSingleInstanceLock();

let token;
let channel;
app.on("second-instance", (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, let's focus our window.
  if (win) {
    if (win.isMinimized()) {
      win.restore();
    }
    win.focus();
  }
});

/* HELPER FUNCTIONS */

/* sound */
function playSound(soundFile: string) {
  soundProcess = sound.play(`${soundFile}`);
}

function stopSound() {
  if (soundProcess) {
    soundProcess.stop();
    soundProcess = null;
  }
}

/*if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}*/



// Update the showNotification function
function showNotification(title: string, body: string, iconPath?: string) {
    const notificationOptions: Electron.NotificationConstructorOptions = {
      title: title,
      body: body
    };
  
    log.info(`Notification: ${title} - ${body}`);
  
    // Use provided icon or default app icon
    if (iconPath) {
      notificationOptions.icon = iconPath;
    } else {
      // Use the app icon as default
      notificationOptions.icon = getIconPath('icon');
    }
    
    new Notification(notificationOptions).show();
  }
  

// Update the showDialog function
const showDialog = (type = 'info', title = 'Dialog', message = '', buttons = ['OK']) => {
    dialog.showMessageBox({
      /* @ts-ignore */
      type,
      title,
      message,
      buttons,
      icon: getIconPath('icon')
    }, (response: any) => {
      // Handle the user's response
      if (response === 0) {
        log.info(`User clicked ${buttons[0]}`);
      } else {
        log.info(`User clicked ${buttons[1]}`);
      }
    });
  }
  
async function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

// Function to check if a process with a given PID is running
function isProcessRunning(pid: number): boolean {
  try {
    // For Windows, use a different approach than process.kill(pid, 0)
    if (process.platform === 'win32') {
      const result = spawn('tasklist', ['/FI', `PID eq ${pid}`], { 
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'ignore']
      });
      const output = result.stdout.toString();
      return output.includes(pid.toString());
    } else {
      // On Unix-like systems, process.kill with signal 0 checks if process exists
      process.kill(pid, 0);
      return true;
    }
  } catch (e) {
    return false;
  }
}

// Function to check and acquire a lock for the Python process
function checkAndAcquireLock(): boolean {
  // Check if lock file exists
  if (fs.existsSync(lockFile)) {
    try {
      // Read PID from lock file
      const pid = parseInt(fs.readFileSync(lockFile, 'utf8'), 10);
      
      // Check if process with this PID is still running
      if (isProcessRunning(pid)) {
        log.info(`Process with PID ${pid} is already running`);
        showNotification("Info", "Subprocess is already running");
        return false;
      } else {
        log.info(`Found stale lock file for PID ${pid}. Removing it.`);
        // Process not running, so remove the stale lock file
        fs.unlinkSync(lockFile);
      }
    } catch (error) {
      log.error("Error checking lock file:", error);
      // If there's an error reading the lock file, assume it's corrupted and remove it
      try {
        fs.unlinkSync(lockFile);
      } catch (e) {
        log.error("Error removing corrupted lock file:", e);
        return false;
      }
    }
  }
  
  // At this point, either no lock file exists or we've removed a stale one
  return true;
}

// Helper function to get the sound path
const getSoundPath = (soundName: string): string => {
  if (isDev) {
    return path.join(appPath, "electron", "assets", `${soundName}.mp3`);
  } else {
    // In production, sounds are in resources/sounds (same on all platforms via process.resourcesPath)
    return path.join(process.resourcesPath, "sounds", `${soundName}.mp3`);
  }
};

// Speech/TTS service path (similar to Python service)
const SPEECH_SERVICE_PATH_PROD: string = addExeExtension(
  app.isPackaged 
    ? path.join(process.resourcesPath, config?.SPEECH_SERVICE_PATH_PROD || './python-service/tts_service')
    : path.join(appPath, "../../../dash-python-service/src/tts_service.py")
);

const SPEECH_SERVICE_PATH_DEV: string = config?.SPEECH_SERVICE_PATH_DEV
  ? path.join(appPath, config.SPEECH_SERVICE_PATH_DEV)
  : path.join(appPath, "../../../dash-python-service/src/tts_service.py");

log.info(`SPEECH_SERVICE_PATH_PROD: ${SPEECH_SERVICE_PATH_PROD}`);
log.info(`SPEECH_SERVICE_PATH_DEV: ${SPEECH_SERVICE_PATH_DEV}`);

// Speak a message using the Python TTS service
let speechProcess: any = null;

const speakMessage = (message: string, lang?: string) => {
  try {
    const speechLang = lang || config?.SPEECH_LANGUAGE || 'es';
    log.info(`Speaking message: "${message}" (lang: ${speechLang})`);
    
    let speechCmd: string;
    let speechArgs: string[];
    
    if (BUILD_ENV === "prod") {
      // Production: use compiled speech service binary
      speechCmd = process.platform === 'win32' ? `"${SPEECH_SERVICE_PATH_PROD}"` : SPEECH_SERVICE_PATH_PROD;
      speechArgs = [message, speechLang];
      
      // Verify binary exists
      if (!fs.existsSync(SPEECH_SERVICE_PATH_PROD)) {
        log.warn(`Speech service binary not found at: ${SPEECH_SERVICE_PATH_PROD}`);
        log.info('Falling back to main Python service for speech');
        // If main python process is running, we could send it a speech command
        // For now, just log the message
        return;
      }
    } else {
      // Development: use Python interpreter
      speechCmd = process.platform === 'darwin' ? DEV_PYTHON_ENV : path.normalize(DEV_PYTHON_ENV);
      speechArgs = [SPEECH_SERVICE_PATH_DEV, message, speechLang];
      
      // Verify Python env exists
      if (!fs.existsSync(speechCmd)) {
        log.error(`Python environment not found at: ${speechCmd}`);
        return;
      }
    }
    
    log.info(`Speech command: ${speechCmd} ${speechArgs.join(' ')}`);
    
    // Spawn the speech process
    speechProcess = spawn(speechCmd, speechArgs, {
      ...(process.platform === 'win32' && {
        shell: true,
        windowsVerbatimArguments: true
      })
    });
    
    speechProcess.stdout?.on('data', (data: Buffer) => {
      log.info(`Speech service: ${data.toString()}`);
    });
    
    speechProcess.stderr?.on('data', (data: Buffer) => {
      log.error(`Speech service error: ${data.toString()}`);
    });
    
    speechProcess.on('close', (code: number) => {
      log.info(`Speech service exited with code ${code}`);
      speechProcess = null;
    });
    
    speechProcess.on('error', (err: Error) => {
      log.error(`Speech service error: ${err.message}`);
      speechProcess = null;
    });
    
  } catch (error) {
    log.error('Error in speakMessage:', error);
  }
};

// Play welcome message when Python service starts successfully
const playWelcomeMessage = () => {
  try {
    const welcomePath = getSoundPath('welcome');
    log.info(`Playing welcome message: ${welcomePath}`);
    
    if (fs.existsSync(welcomePath)) {
      playSound(welcomePath);
    } else {
      // Fallback to bip sound if welcome doesn't exist
      const fallbackPath = getSoundPath('bip');
      log.warn(`Welcome sound not found at ${welcomePath}, trying fallback: ${fallbackPath}`);
      if (fs.existsSync(fallbackPath)) {
        playSound(fallbackPath);
      }
    }
  } catch (err) {
    log.error('Error playing welcome message:', err);
  }
};

// Update the startPythonProcess function to forward subprocess output to renderer
const startPythonProcess = async (t: string, c: string) => {
  // Check if we can acquire a lock
  if (!checkAndAcquireLock()) {
    //log.info("Cannot start a new process as one is already running");
    await killProcess();
    //return;
  }

  showNotification('info', "Starting subprocess");
  token = t;
  channel = c;

  // Track if we've seen a successful connection
  let connectionEstablished = false;

  const outputFunction = (data: any) => {
    const stdout = data.toString();
    log.info(`> ${stdout}`);
    
    // Check for successful WebSocket connection
    if (!connectionEstablished && (
      stdout.includes('Connected successfully') || 
      stdout.includes('connection_established') ||
      stdout.includes('subscription_succeeded')
    )) {
      connectionEstablished = true;
      showNotification("KitchnTabs", "✅ Background service connected successfully!");
      // Note: Welcome audio is now handled by the Python service using gTTS
    }
    
    // Send subprocess stdout to renderer
    if (win && win.webContents) {
      win.webContents.send('subprocess-output', {
        type: 'stdout',
        message: stdout,
        timestamp: new Date().toISOString(),
        pid: pythonProcess?.pid
      });
    }
  };
 
  // Use a try-catch block to handle potential errors
  try {
    let pythonCmd, scriptPath, args;
    showNotification("Info", `Executing subprocess`);
    if (BUILD_ENV === "prod") {
      // For production
      pythonCmd =  process.platform === 'win32' ? `"${PYTHON_SERVICE_PATH_PROD}"` : PYTHON_SERVICE_PATH_PROD;
      
      // Verify the Python service binary exists
      const binaryPath = process.platform === 'win32' 
        ? PYTHON_SERVICE_PATH_PROD.replace(/"/g, '') 
        : PYTHON_SERVICE_PATH_PROD;
      
      log.info(`Checking Python service binary at: ${binaryPath}`);
      
      if (!fs.existsSync(binaryPath)) {
        const errorMsg = `Python service binary not found at: ${binaryPath}`;
        log.error(errorMsg);
        showNotification("❌ Error - Python Service", 
          `${binaryPath}`);
        
        // Send error to renderer
        if (win && win.webContents) {
          win.webContents.send('subprocess-output', {
            type: 'error',
            message: errorMsg,
            timestamp: new Date().toISOString(),
            error: 'ENOENT: Python service binary not found'
          });
        }
        return;
      }
      
      log.info(`✅ Python service binary found at: ${binaryPath}`);
      
      args = [
        process.platform === 'win32' ? `"${token}"` : token,       
        channel,
        process.platform === 'win32' ? `"${PYTHON_SERVICE_CONFIG_PATH_PROD}"` : PYTHON_SERVICE_CONFIG_PATH_PROD,        
        process.platform === 'win32' ? `"${logFile}"` : logFile     
      ];

      log.info(`Python service command: ${pythonCmd}`);
      log.info(`Config path: ${PYTHON_SERVICE_CONFIG_PATH_PROD}`);
    } else {
      // For development
      pythonCmd = process.platform === 'darwin' ? DEV_PYTHON_ENV : path.normalize(DEV_PYTHON_ENV);      
      scriptPath = PYTHON_SERVICE_PATH_DEV;

      // Verify Python environment exists
      if (!fs.existsSync(pythonCmd)) {
        const errorMsg = `Python environment not found at: ${pythonCmd}`;
        log.error(errorMsg);
        showNotification("❌ Error - Python Environment", 
          `${pythonCmd}`);
        return;
      }

      log.info(
        `Command: "${pythonCmd}" "${scriptPath}" "${token}" ${channel} ${configFile} "${logFile}"`
      );

      args = [
        scriptPath,
        process.platform === 'win32' ? `"${token}"` : token,       
        channel,
        process.platform === 'win32' ? `"${configFile}"` : configFile,        
        process.platform === 'win32' ? `"${logFile}"` : logFile     
     ];
    
     log.info(`Python dev command: ${pythonCmd}`);

    }
    log.info("Spawning", `> ${pythonCmd}`);
    
    // Spawn the process with proper quoted paths for Windows
    pythonProcess = spawn(pythonCmd, args, {
      ...(process.platform === 'win32' && {
        shell: true,
        windowsVerbatimArguments: true
      })
    });

    log.info('Python process command:', pythonCmd, 'args:', args);

    // Handle process output
    pythonProcess.stdout.on("data", outputFunction);
    pythonProcess.stderr.on("data", (data) => {
      const stderr = data.toString();
      log.error(`> ${stderr}`);
      
      // Show notification for critical errors
      if (stderr.includes('Error') || stderr.includes('Exception') || stderr.includes('Traceback')) {
        showNotification("⚠️ Python Service Warning", stderr.substring(0, 200));
      }
      
      // Send subprocess stderr to renderer
      if (win && win.webContents) {
        win.webContents.send('subprocess-output', {
          type: 'stderr',
          message: stderr,
          timestamp: new Date().toISOString(),
          pid: pythonProcess?.pid
        });
      }
    });

    // Update event handlers for process termination
    pythonProcess.on("close", (code) => {
      log.info(`Python process exited with code ${code}`);
      
      // Show notification based on exit code
      if (code !== 0 && code !== null) {
        showNotification("❌ Python Service Stopped", 
          `The background service exited unexpectedly with code ${code}.\n\nCheck the logs for more details.`);
      }
      
      // Send process termination message to renderer
      if (win && win.webContents) {
        win.webContents.send('subprocess-output', {
          type: 'exit',
          message: `Process exited with code ${code}`,
          timestamp: new Date().toISOString(),
          exitCode: code
        });
      }
      
      releaseLock();
      pythonProcess = null;
    });

    pythonProcess.on("error", (err: NodeJS.ErrnoException) => {
      log.error("Python process error:", err);
      
      // Provide specific error messages based on error type
      let errorTitle = "❌ Failed to Start Python Service";
      let errorMessage = `Error: ${err.message}`;
      
      if (err.code === 'ENOENT') {
        errorMessage = `The Python service executable was not found.\n\nPath: ${pythonCmd}\n\nThis usually means:\n- The application was not installed correctly\n- The binary is missing or corrupted\n- Permission issues`;
      } else if (err.code === 'EACCES') {
        errorMessage = `Permission denied when trying to execute Python service.\n\nPath: ${pythonCmd}\n\nTry running the application with appropriate permissions.`;
      } else if (err.code === 'EPERM') {
        errorMessage = `Operation not permitted. The system blocked execution of the Python service.\n\nOn macOS, you may need to allow the app in System Preferences > Security & Privacy.`;
      }
      
      showNotification(errorTitle, errorMessage);
      
      // Send process error message to renderer
      if (win && win.webContents) {
        win.webContents.send('subprocess-output', {
          type: 'error',
          message: `Process error: ${err.message}`,
          timestamp: new Date().toISOString(),
          error: err.toString(),
          code: err.code
        });
      }
      
      releaseLock();
      pythonProcess = null;
    });

    // Create lock file with PID
    if (pythonProcess && pythonProcess.pid) {
      log.info("Process ID:", pythonProcess.pid);
      try {
        fs.writeFileSync(lockFile, pythonProcess.pid.toString());
        showNotification("Info", `Python service started (PID: ${pythonProcess.pid})`);
      } catch (err) {
        log.error(`Failed to write lock file: ${err}`);
      }
    } else {
      log.error("Failed to get process ID - spawn may have failed silently");
      showNotification("⚠️ Warning", "Python process started but couldn't get PID. Check if the binary is executable.");
    }
  } catch (error: any) {
    log.error("Error starting Python process:", error);
    showNotification("❌ Error Starting Python Service", 
      `An unexpected error occurred: ${error.message}\n\nCheck the logs for more details.`);
    releaseLock();
  }
};


const printOrder = (id: string) => {

  log.info("Spawning Python print subprocess");

  switch (BUILD_ENV) {
    case "prod":
      printProcess = spawn(config.PRINT_SERVICE_PATH_PROD, [id, configFile, logFile], {
        //cwd: PYTHON_SCRIPT_DIR,
        stdio: "pipe",
      });

      log.info(BUILD_ENV, config.PRINT_SERVICE_PATH_PROD)
      log.info([id, configFile, logFile])

      win.webContents.send("service", BUILD_ENV);
      win.webContents.send("service", config.PRINT_SERVICE_PATH_PROD);
      win.webContents.send("service", [id, configFile, logFile]);
      break;
    case "dev":
    default:
      printProcess = spawn(DEV_PYTHON_ENV, [config.PRINT_SERVICE_PATH_DEV], {
        //cwd: PYTHON_SCRIPT_DIR,.
        stdio: "pipe",
      });
      log.info(BUILD_ENV, DEV_PYTHON_ENV, config.PRINT_SERVICE_PATH_DEV, id, path.normalize(configFile), path.normalize(logFile))

      break;
  }

  // Wait for the script to finish or send a signal
  printProcess.stdout.on('data', (data: any) => {
    const lines = data.toString().split(/[\n\r]+/);

    for (const line of lines) {
      win.webContents.send("service", line.slice(9));
      
      // Also send to subprocess-output channel
      win.webContents.send('subprocess-output', {
        type: 'print-stdout',
        message: line,
        timestamp: new Date().toISOString()
      });
      
      log.info(line);
      return;
    }

    log.info(`Python script: ${data}`);
  });

  printProcess.stderr.on('data', (data: any) => {
    const stderr = data.toString();
    log.error(`Print process error: ${stderr}`);
    
    // Send print process stderr to renderer
    win.webContents.send('subprocess-output', {
      type: 'print-stderr',
      message: stderr,
      timestamp: new Date().toISOString()
    });
  });

  printProcess.on('close', (code: any) => {
    log.info(`Python script exited with code ${code}`);
    // If the script exits with a specific code, you can exit the wait loop
    if (code === 0) {
      log.info('Python script completed successfully');
      // Exit the wait loop
      return;
    }



  });

  // Wait for the script to finish or send a signal
  printProcess.on('exit', (code: any) => {
    log.info(`Python script exited with code ${code}`);
    // If the script exits with a specific code, you can exit the wait loop
    if (code === 0) {
      log.info('Python script completed successfully');
      // Exit the wait loop
      return;
    }


  });

}

// Add this before creating the window


async function createWindow() {

  //if (process.platform === 'win32') {
  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.commandLine.appendSwitch('disable-gpu');
  //}
  
  //cleanup();
  
  log.info("PLATFORM");
  log.info(process.platform)

  win = new BrowserWindow({
    title: config?.APP_NAME || "Dashpanel",
    width: 800,
    height: 600,
    //vibrancy: 'under-window' ,
    //titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' :'hidden', // Change this line
    //frame: false, // Make sure this is false
    //transparent: true,
    //backgroundColor: '#00000000', // Transparent 
    hasShadow: true, // Optional: adds shadow effect
    

       // Add this line to set the window/taskbar icon
       /*icon: path.join(process.platform === 'win32' 
        ? path.resolve(iconsPath, './win/icon.ico')
        : path.resolve(iconsPath, './png/512x512.png')), */

    // Update the icon path
    icon: getIconPath('icon'),
      
    //icon: join(process.env.VITE_PUBLIC, "favicon.ico"),

    
    
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: true,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      nodeIntegration: false,
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      contextIsolation: true,
      devTools: true
    },
  });
  // On macOS, make window corners rounded
  if (process.platform === 'darwin') {
    win.setWindowButtonVisibility(true); // Optional: hides default macOS traffic lights
  }

  // In your createWindow function:
  if (isDev) {
    log.info('Creating window in development mode');

    // Load from dev server in development
    const devPort = process.env.PORT || '3006';
    win.loadURL(`http://localhost:${devPort}`);
    // Open DevTools
    win.webContents.openDevTools();
  } else {
    log.info('Creating window in production mode');
    log.info('Loading file', indexHtml);
    // Load from built files in production
   
    win.loadFile(indexHtml);
    // Do not open DevTools in production
  }

  win.webContents.on('did-finish-load', async () => {
    log.info('Window content finished loading');
    
    win.webContents.setZoomFactor(0.7);

    showNotification("PinoyWok Dash Panel", "Application started successfully!");
   
    log.info("userData",  app.getPath("userData"))
    log.info("LOG_FILE", logFile)
    log.info("PYTHON_SERVICE_PATH_PROD", PYTHON_SERVICE_PATH_PROD)
    });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log.error('Failed to load:', errorCode, errorDescription);
    showNotification("PinoyWok Dash Panel", "Application failed to start.");
  });


  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });


  //const scriptDirectory = path.dirname(path.normalize(PYTHON_SCRIPT));
  log.info(process.platform);


  try {
    log.info("About to call update function");
    update(win);
    log.info("Update function completed");
  } catch (error) {
    log.error("Error in update function:", error);
  }

  powerMonitor.on("resume", async () => {
    log.info("System has resumed from suspension.");
    showNotification("Info", "System has resumed from suspension");
   
    await wait(5);
    if (token && channel) {
    await killProcess();
    await startPythonProcess(token, channel);
    }
  });


 
}

/* handle ipc messages */
ipcMain.on("ipc-action", async (event, action, payload) => {
  //console.log(`Received message from renderer: ${action}`, payload);
  switch (action) {
    case "sound":
      //soundPlayer = soundPlay.play(`./electron/assets/${payload}.mp3`);
      //console.log(`playing sound ${appPath}/sounds/${payload}.mp3`)
      log.info("playing sound", payload)
      const soundPath = getSoundPath(payload);
      log.info("sound path:", soundPath);
      if (fs.existsSync(soundPath)) {
        playSound(soundPath);
      } else {
        log.error(`Sound file not found: ${soundPath}`);
      }
      break;
    case "dialog":
      showDialog(payload?.type || 'info', payload?.title || action, payload?.message || JSON.stringify(payload));
      break;
    case "notification":
      showNotification(payload?.title || action, payload?.message || JSON.stringify(payload));
      break;
    case "print":
      // Orders are printed listening to the tenant system channel.
      //printOrder(payload);
      break;
    case "start-bg-service":

      //killProcess();
      await startPythonProcess(payload.token, payload.channel); // The payload should be the user token to authenticate

      break;
    case "stop-bg-service":

      stopPythonProcess().then(success => {
        // Optionally inform renderer about success/failure
        if (win) {
          win.webContents.send("service-status", { action: "stopped", success });
        }
      });
      break;
    case "stop-sound":
      stopSound();
      break;
    case "speech":
      // Speak a message using Python TTS service
      // payload can be: string | { message: string, lang?: string }
      const speechMessage = typeof payload === 'string' ? payload : payload?.message;
      const speechLang = typeof payload === 'object' ? payload?.lang : undefined;
      if (speechMessage) {
        log.info(`Speech request: "${speechMessage}" (lang: ${speechLang || 'default'})`);
        speakMessage(speechMessage, speechLang);
      } else {
        log.error('Speech action called without message');
      }
      break;
    case "resucitate":
      /* if (pythonProcess) {
          pythonProcess.kill();
        }
        startPythonProcess();*/
      break;
  }
});

// ==================== PRINT & SPEAK IPC HANDLERS ====================
// These handlers call the existing print_service and tts_service directly
// In production: uses compiled binaries
// In development: uses Python scripts via Python interpreter

// Print service paths
const PRINT_SERVICE_PATH_DEV_IPC: string = path.join(
  appPath,
  config?.PRINT_SERVICE_PATH_DEV || "../../../dash-python-service/src/print_service.py"
);

const PRINT_SERVICE_PATH_PROD_IPC: string = addExeExtension(
  app.isPackaged 
    ? path.join(process.resourcesPath, config?.PRINT_SERVICE_PATH_PROD || './python-service/print_service')
    : path.join(appPath, "../../../dash-python-service/dist/print_service")
);

// TTS service paths
const TTS_SERVICE_PATH_DEV_IPC: string = path.join(
  appPath,
  config?.TTS_SERVICE_PATH_DEV || "../../../dash-python-service/src/tts_service.py"
);

const TTS_SERVICE_PATH_PROD_IPC: string = addExeExtension(
  app.isPackaged 
    ? path.join(process.resourcesPath, config?.TTS_SERVICE_PATH_PROD || './python-service/tts_service')
    : path.join(appPath, "../../../dash-python-service/dist/tts_service")
);

log.info(`PRINT_SERVICE_PATH_DEV_IPC: ${PRINT_SERVICE_PATH_DEV_IPC}`);
log.info(`PRINT_SERVICE_PATH_PROD_IPC: ${PRINT_SERVICE_PATH_PROD_IPC}`);
log.info(`TTS_SERVICE_PATH_DEV_IPC: ${TTS_SERVICE_PATH_DEV_IPC}`);
log.info(`TTS_SERVICE_PATH_PROD_IPC: ${TTS_SERVICE_PATH_PROD_IPC}`);

/**
 * Run a service and capture output
 */
const runServiceWithOutput = (serviceCmd: string, serviceArgs: string[], timeoutMs: number = 60000): Promise<any> => {
  return new Promise((resolve) => {
    log.info(`Running service: ${serviceCmd} ${serviceArgs.join(' ')}`);
    
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    
    const serviceProcess = spawn(serviceCmd, serviceArgs, {
      ...(process.platform === 'win32' && {
        shell: true,
        windowsVerbatimArguments: true
      })
    });
    
    serviceProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      stdout += output;
      log.info(`Service: ${output}`);
      
      if (win && win.webContents) {
        win.webContents.send('subprocess-output', {
          type: 'service-stdout',
          message: output,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    serviceProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString();
      stderr += output;
      log.error(`Service error: ${output}`);
      
      if (win && win.webContents) {
        win.webContents.send('subprocess-output', {
          type: 'service-stderr',
          message: output,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    serviceProcess.on('close', (code: number) => {
      if (timedOut) return;
      
      log.info(`Service exited with code ${code}`);
      resolve({
        success: code === 0,
        exitCode: code,
        stdout,
        stderr,
        logFile: logFile
      });
    });
    
    serviceProcess.on('error', (err: Error) => {
      if (timedOut) return;
      
      log.error(`Service error: ${err.message}`);
      resolve({
        success: false,
        error: err.message,
        stderr,
        stdout
      });
    });
    
    setTimeout(() => {
      if (serviceProcess && !serviceProcess.killed) {
        timedOut = true;
        serviceProcess.kill('SIGTERM');
        resolve({
          success: false,
          error: `Service timed out after ${timeoutMs / 1000} seconds`,
          stdout,
          stderr
        });
      }
    }, timeoutMs);
  });
};

/**
 * IPC handler: Print a PDF from URL or print test page
 * Usage: 
 *   window.DashIPCService.print("https://example.com/receipt.pdf") - prints PDF from URL
 *   window.DashIPCService.print("") - prints test page
 *   window.DashIPCService.print("test") - prints test page
 */
ipcMain.handle('ipc-print', async (_event, url: string) => {
  // Determine if this is a test print (empty string or "test")
  const isTestMode = !url || url === '' || url.toLowerCase() === 'test';
  const printArg = isTestMode ? 'test' : url;
  
  log.info(`Print request received: ${isTestMode ? 'TEST MODE' : `URL: ${url}`}`);
  
  try {
    let serviceCmd: string;
    let serviceArgs: string[];
    let servicePath: string;
    
    if (BUILD_ENV === "prod") {
      // Production: use compiled binary
      servicePath = PRINT_SERVICE_PATH_PROD_IPC;
      serviceCmd = process.platform === 'win32' ? `"${servicePath}"` : servicePath;
      // Args: print_service <url_or_test> <config> <log>
      serviceArgs = [printArg, configFile, logFile];
    } else {
      // Development: use Python interpreter
      serviceCmd = process.platform === 'darwin' ? DEV_PYTHON_ENV : path.normalize(DEV_PYTHON_ENV);
      servicePath = PRINT_SERVICE_PATH_DEV_IPC;
      // Args: python print_service.py <url_or_test> <config> <log>
      serviceArgs = [servicePath, printArg, configFile, logFile];
    }
    
    // Check if service exists
    const pathToCheck = servicePath.replace(/"/g, '');
    if (BUILD_ENV === "prod" && !fs.existsSync(pathToCheck)) {
      return {
        success: false,
        error: `Print service not found at: ${pathToCheck}`,
        servicePath,
        env: BUILD_ENV
      };
    }
    
    log.info(`Executing print: ${serviceCmd} ${serviceArgs.join(' ')}`);
    
    const result = await runServiceWithOutput(serviceCmd, serviceArgs, 60000);
    
    return {
      ...result,
      service: 'print',
      mode: isTestMode ? 'test' : 'url',
      url: isTestMode ? null : url,
      servicePath,
      env: BUILD_ENV
    };
    
  } catch (error: any) {
    log.error('Print error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      service: 'print'
    };
  }
});

/**
 * IPC handler: Speak text using TTS service (async version with result)
 * Usage: window.DashIPCService.speakAsync("Hello world", "en")
 */
ipcMain.handle('ipc-speak', async (_event, payload: { text: string; lang?: string }) => {
  const text = payload?.text;
  const lang = payload?.lang || config?.SPEECH_LANGUAGE || 'es';
  
  log.info(`Speak request: "${text}" (lang: ${lang})`);
  
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      error: 'Text is required',
      service: 'tts'
    };
  }
  
  try {
    let serviceCmd: string;
    let serviceArgs: string[];
    let servicePath: string;
    
    if (BUILD_ENV === "prod") {
      // Production: use compiled binary
      servicePath = TTS_SERVICE_PATH_PROD_IPC;
      serviceCmd = process.platform === 'win32' ? `"${servicePath}"` : servicePath;
      serviceArgs = [text, lang];
    } else {
      // Development: use Python interpreter
      serviceCmd = process.platform === 'darwin' ? DEV_PYTHON_ENV : path.normalize(DEV_PYTHON_ENV);
      servicePath = TTS_SERVICE_PATH_DEV_IPC;
      serviceArgs = [servicePath, text, lang];
    }
    
    // Check if service exists
    const pathToCheck = servicePath.replace(/"/g, '');
    if (BUILD_ENV === "prod" && !fs.existsSync(pathToCheck)) {
      return {
        success: false,
        error: `TTS service not found at: ${pathToCheck}`,
        servicePath,
        env: BUILD_ENV
      };
    }
    
    log.info(`Executing speak: ${serviceCmd} ${serviceArgs.join(' ')}`);
    
    const result = await runServiceWithOutput(serviceCmd, serviceArgs, 30000);
    
    return {
      ...result,
      service: 'tts',
      text,
      language: lang,
      servicePath,
      env: BUILD_ENV
    };
    
  } catch (error: any) {
    log.error('Speak error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      service: 'tts'
    };
  }
});

// ==================== END PRINT & SPEAK IPC HANDLERS ====================

const cleanup = async () => {
  log.info("Running cleanup process");

  // Kill Python process if it exists
  if (pythonProcess) {
    try {
      log.info(`Killing Python process with PID: ${pythonProcess.pid}`);
      await killProcess(); // <-- Await here!
      log.info("Python process cleanup completed");
    } catch (error) {
      log.error("Error during Python process cleanup:", error);
      releaseLock();
    }
  } else {
    // Even if pythonProcess is null, we should check and remove any lock file
    releaseLock();
  }

  // Kill print process if it exists
  if (printProcess) {
    try {
      log.info(`Killing Print process with PID: ${printProcess.pid}`);
      printProcess.kill('SIGTERM');
    } catch (error) {
      log.error("Error killing Print process:", error);
    }
  }

  // Kill sound process if it exists
  if (soundProcess) {
    try {
      stopSound();
    } catch (error) {
      log.error("Error stopping sound:", error);
    }
  }

  // Remove the lock file if it exists (redundant, but safe)
  if (fs.existsSync(lockFile)) {
    log.info("Removing lock file:", lockFile);
    try {
      fs.unlinkSync(lockFile);
    } catch (error) {
      log.error("Error removing lock file:", error);
    }
  }
};

/* Electron lifecycle functions */

// Add this to your existing ipc handlers
ipcMain.on("window-controls", (event, action) => {
  // Find the window that sent the event
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  switch (action) {
    case "minimize":
      win.minimize();
      break;
    case "maximize":
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      break;
    case "close":
      win.close();
      break;
  }
});

ipcMain.on('window-drag-start', (event) => {
  // This is a no-op in the main process
  // The actual dragging is handled by the CSS -webkit-app-region property
  // and we don't need to do anything special in the main process

  // You can log that the drag was requested if helpful for debugging
  log.info("Window drag initiated");
});

/*ipcMain.on('window-drag-start', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.webContents.executeJavaScript(`
      // This is needed for Linux/Windows support
      if (process.platform === 'darwin') {
        return;
      }
      // This tells the OS to start dragging the window
      window.electron.startDrag();
    `);
    
    // For Windows/Linux, we need to implement native dragging
    if (process.platform === 'win32') {
      win.beginWindowDrag();
    } else if (process.platform === 'linux') {
      // Alternative implementation for Linux
      // You might need a more complex solution for Linux
    }
  }
});*/



/*app.on("before-quit", () => {
    //showDialog('info', "before-quit", "before-quit");
    cleanup();
});*/


app.on("second-instance", () => {
  /* if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }*/
  return false;
});

app.on("activate", () => {
  log.info("activate");
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    icon: path.join(appPath, "public/icons/pinoywok_white.ico"),

    //win32icon: path.join(appPath, 'path/to/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      devTools: true
    },
  });

  childWindow.loadFile(indexHtml, { hash: arg });

});
log.info("app ready");
app.whenReady().then(createWindow);


// First, add a helper function to get the correct icon path
function getIconPath(iconName) {
    // For packaged app, use the resources directory
    if (app.isPackaged) {
      return path.join(
        process.resourcesPath, 
        'icons',
        process.platform === 'win32'
          ? `win/${iconName}.ico`
          : process.platform === 'darwin'
            ? `mac/${iconName}.icns`
            : `png/512x512.png`
      );
    } 
    // For development, use the icons directory in the project
    else {
      return path.join(
        app.getAppPath(),
        'icons',
        process.platform === 'win32'
          ? `win/${iconName}.ico`
          : process.platform === 'darwin'
            ? `mac/${iconName}.icns`
            : `png/512x512.png`
      );
    }
  }
  

  // Redirect console output to both file and IPC
const originalConsoleLog = console.log;
console.log = (...args) => {
  log.info(...args);
  if (win) {
    win.webContents.send('stdout', args.join(' '));
  }
};

const originalConsoleError = console.error;
console.error = (...args) => {
  log.error(...args);
  if (win) {
    win.webContents.send('stdout', args.join(' '));
  }
};

// Also wrap electron-log methods to send to webContents
const originalLogInfo = log.info;
const originalLogError = log.error;
const originalLogWarn = log.warn;
const originalLogDebug = log.debug;
const originalLogVerbose = log.verbose;

// Create a function to handle redirecting to webContents
const redirectLogToRenderer = (level, ...args) => {
  try {
    // Check if win exists and isn't destroyed
    if (win && !win.isDestroyed() && win.webContents && !win.webContents.isDestroyed()) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      win.webContents.send('electron-log', {
        level,
        message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    // Don't attempt to log this error through our normal channels
    console.error('Error in redirectLogToRenderer:', error);
  }
};


// Helper to wrap log methods
function wrapLogMethod(methodName: keyof typeof log, originalFn: (...args: any[]) => void) {
  return (...args: any[]) => {
    originalFn(...args);
    if (!isQuitting) {
      redirectLogToRenderer(methodName, ...args);
    }
    return log;
  };
}

// Override log methods with safer implementations
log.info = wrapLogMethod('info', originalLogInfo);
log.error = wrapLogMethod('error', originalLogError);
log.warn = wrapLogMethod('warn', originalLogWarn);
log.debug = wrapLogMethod('debug', originalLogDebug);
log.verbose = wrapLogMethod('verbose', originalLogVerbose);
// Improved cleanup to run only once and return a promise
const safeCleanup = async () => {
  if (isCleaningUp) return;
  isCleaningUp = true;
  await cleanup();
};

// Electron app event handlers
app.on("before-quit", async (event) => {
  if (isQuitting) return;
  isQuitting = true;
  log.info('App is quitting, running cleanup');
  event.preventDefault();
  await safeCleanup();
  log.info('exit');
  app.exit(0); // Force exit after cleanup
});

app.on("window-all-closed", async () => {
  if (isQuitting) return;
  isQuitting = true;
  log.info('window-all-closed, running cleanup');
  await safeCleanup();
   log.info('exit');
  app.exit(0);
});

// Node process event handlers
const shutdownHandler = async (msg: string, code = 0) => {
  if (isQuitting) return;
  isQuitting = true;
  log.info(msg);
  await safeCleanup();
  log.info('process exit');
  process.exit(code);
};

process.on('exit', async () => {
  if (isQuitting) return;
  isQuitting = true;
  log.info('Process exit event detected');
  await safeCleanup();
});

process.on('SIGINT', () => shutdownHandler('SIGINT received', 0));
process.on('SIGTERM', () => shutdownHandler('SIGTERM received', 0));
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  shutdownHandler('Uncaught exception', 1);
});
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled rejection at:', promise, 'reason:', reason);
  shutdownHandler('Unhandled rejection', 1);
});


// For Windows-specific handling
if (process.platform === 'win32') {
  // Replace require with import

  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', () => {
    log.info('SIGINT received (Windows)');
    process.emit('SIGINT');
  });
}

const killProcess = async () => {
  log.info("Killing Python process:");
  if (pythonProcess) {
    try {
      log.info(`Attempting to kill Python process with PID: ${pythonProcess.pid}`);
      pythonProcess.kill('SIGTERM');
      await wait(5);
      
      // Check if process is still running after the wait
      if (pythonProcess.pid && isProcessRunning(pythonProcess.pid)) {
        log.info(`Process still running after SIGTERM, using force kill`);
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', pythonProcess.pid.toString(), '/f', '/t']);
        } else {
          process.kill(pythonProcess.pid, 'SIGKILL');
        }
      }
    } catch (error) {
      log.error("Error killing Python process:", error);
      showNotification("Error", "Error closing sub process");
    } finally {
      releaseLock();
      pythonProcess = null;
      log.info("Python process reference cleared");
    }
  } else {
    log.info("No Python process to kill");
    // Even if pythonProcess is null, we should check and remove any lock file
    releaseLock();
  }
  
  return true; // Return success status
}

const stopPythonProcess = async () => {
  showNotification('Info', "Stopping background service");
  
  try {
    const success = await killProcess();
    if (success) {
      showNotification("Info", "Background service stopped successfully");
      // Reset token and channel when service is intentionally stopped
      token = null;
      channel = null;
      return true;
    } else {
      showNotification("Warning", "Service may not have stopped properly");
      return false;
    }
  } catch (error) {
    log.error("Error in stopPythonProcess:", error);
    showNotification("Error", "Failed to stop background service");
    return false;
  }
}


// Function to release the lock when the process terminates
function releaseLock(): void {
  if (fs.existsSync(lockFile)) {
    try {
      fs.unlinkSync(lockFile);
      log.info("Lock file removed successfully");
    } catch (error) {
      log.error("Error removing lock file:", error);
    }
  }
}
