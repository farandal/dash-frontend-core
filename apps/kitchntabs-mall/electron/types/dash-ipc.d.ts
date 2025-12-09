/**
 * DashIPCService Type Definitions
 * 
 * This file provides TypeScript type definitions for the DashIPCService
 * exposed to the renderer process via contextBridge.
 * 
 * Usage in renderer:
 *   window.DashIPCService?.print("https://api.example.com/receipt.pdf")
 *   window.DashIPCService?.speakAsync("Hello world", "en")
 *   window.DashIPCService?.speak("Hola")
 */

/** Response from service IPC calls */
export interface ServiceResponse {
  success: boolean;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  logFile?: string;
  error?: string;
  service?: 'tts' | 'print';
  servicePath?: string;
  env?: string;
}

/** Response from print service */
export interface PrintResponse extends ServiceResponse {
  service: 'print';
  mode?: 'test' | 'url';
  url?: string | null;
}

/** Response from speak service */
export interface SpeakResponse extends ServiceResponse {
  service: 'tts';
  text?: string;
  language?: string;
}

/** Electron log entry */
export interface ElectronLogEntry {
  level: 'info' | 'error' | 'warn' | 'debug' | 'verbose';
  message: string;
  timestamp: string;
}

/** Subprocess output event */
export interface SubprocessOutput {
  type: 'stdout' | 'stderr' | 'exit' | 'error' | 'print-stdout' | 'print-stderr' | 'service-stdout' | 'service-stderr';
  message: string;
  timestamp: string;
  pid?: number;
  exitCode?: number;
  error?: string;
  code?: string;
}

/** DashIPCService interface */
export interface IDashIPCService {
  /** Run a Python script with the given arguments */
  runPythonScript: (filePath: string, scriptPath: string, args: string[]) => void;
  
  /** Send an action to the main process */
  action: (action: string, payload: any) => void;
  
  /** 
   * Speak a message using Python TTS service (fire-and-forget)
   * @param payload - Text to speak, or object with message and optional language
   * @example DashIPCService.speak("Hello world")
   * @example DashIPCService.speak({ message: "Hola", lang: "es" })
   */
  speak: (payload: string | { message: string; lang?: string }) => void;
  
  /**
   * Play a sound file by name
   * @param soundName - Name of the sound file (without extension)
   * @example DashIPCService.playSound("bip")
   */
  playSound: (soundName: string) => void;
  
  /** Stop the currently playing sound */
  stopSound: () => void;
  
  /**
   * Show a system notification
   * @param title - Notification title
   * @param message - Notification body text
   */
  notify: (title: string, message: string) => void;
  
  // ==================== SERVICE METHODS ====================
  
  /**
   * Print a PDF from a URL or print a test page.
   * - Pass a URL to download and print a PDF
   * - Pass empty string "" or "test" to print a test page
   * 
   * In production: calls the compiled print_service binary
   * In development: calls print_service.py via Python interpreter
   * 
   * @param url - URL of the PDF to print, or "" / "test" for test page
   * @returns Promise with print results including stdout, stderr, and exit code
   * @example 
   *   // Print a PDF from URL
   *   const result = await window.DashIPCService?.print("https://api.example.com/receipt.pdf");
   *   console.log(result.success); // true if printed successfully
   * 
   *   // Print a test page
   *   const testResult = await window.DashIPCService?.print("");
   *   console.log(testResult.mode); // "test"
   * 
   *   // Alternative test page invocation
   *   await window.DashIPCService?.print("test");
   */
  print: (url: string) => Promise<PrintResponse>;
  
  /**
   * Speak text using TTS service (async version with result).
   * In production: calls the compiled tts_service binary
   * In development: calls tts_service.py via Python interpreter
   * @param text - Text to speak
   * @param lang - Optional language code (default: "es")
   * @returns Promise with speech results
   * @example 
   *   const result = await window.DashIPCService?.speakAsync("Hello world", "en");
   *   console.log(result.success); // true if audio played
   */
  speakAsync: (text: string, lang?: string) => Promise<SpeakResponse>;
  
  // ==================== EVENT LISTENERS ====================
  
  /** Subscribe to Python script output */
  onPythonOutput: (callback: (data: any) => void) => void;
  
  /** Subscribe to service messages */
  onServiceMessage: (callback: (data: any) => void) => void;
  
  /** Subscribe to stdout messages */
  onStdout: (callback: (data: string) => void) => void;
  
  /** Subscribe to Electron log events */
  onElectronLog: (callback: (logData: ElectronLogEntry) => void) => void;
  
  /** Subscribe to subprocess output events */
  onSubprocessOutput: (callback: (data: SubprocessOutput) => void) => void;
  
  // ==================== WINDOW CONTROLS ====================
  
  /**
   * Control the Electron window
   * @param action - 'minimize' | 'maximize' | 'close'
   */
  windowControls: (action: 'minimize' | 'maximize' | 'close') => void;
  
  /** Start window drag operation */
  startDrag: () => void;
}

/** Electron store interface */
export interface IElectronStore {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAll: () => Promise<Record<string, any>>;
  syncToLocalStorage: () => Promise<Record<string, any>>;
}

declare global {
  interface Window {
    /** IPC service for communicating with Electron main process */
    DashIPCService?: IDashIPCService;
    
    /** Electron store for persistent data */
    electronStore?: IElectronStore;
    
    /** Debug utilities */
    __DASH_DEBUG__?: any;
  }
}

export {};
