import { useState, useRef, useEffect, createContext, useContext } from "react";
import { DashIPCServiceType } from "../utils/dashIPCService";

/**
 * IPCMessageBrokerContext
 *
 * This context provides access to messages from the Electron main process,
 * including log messages and subprocess outputs.
 *
 * ## Usage
 *
 * 1. Wrap your component tree with the IPCMessageBrokerProvider:
 *    ```tsx
 *    // In your app root or where you need IPC message access
 *    <IPCMessageBrokerProvider>
 *      <YourComponent />
 *    </IPCMessageBrokerProvider>
 *    ```
 *
 * 2. Use the hook to access messages in any child component:
 *    ```tsx
 *    import { useIPCMessageBroker } from 'dash-utils';
 *
 *    const MyComponent = () => {
 *      const { logMessages, subprocessOutputs, lastMessage, idleStatus } = useIPCMessageBroker();
 *
 *      return (
 *        <div>
 *          <h3>Last Message: {lastMessage}</h3>
 *
 *          <h3>Log Messages:</h3>
 *          <ul>
 *            {logMessages.map((log, index) => (
 *              <li key={index} className={`log-${log.level}`}>
 *                [{log.timestamp}] {log.level}: {log.message}
 *              </li>
 *            ))}
 *          </ul>
 *
 *          <h3>Subprocess Output:</h3>
 *          <ul>
 *            {subprocessOutputs.map((output, index) => (
 *              <li key={index} className={`output-${output.type}`}>
 *                [{output.timestamp}] {output.type}: {output.message}
 *              </li>
 *            ))}
 *          </ul>
 *        </div>
 *      );
 *    };
 *    ```
 *
 * 3. The context also manages idle status and automatic resuscitation of
 *    background processes if they become idle for too long.
 *
 * Note: This context works in both Electron and non-Electron environments.
 * In non-Electron environments, it gracefully degrades and still provides the context API.
 */

export interface LogMessage {
  level: string;
  message: string;
  timestamp: string;
}

export interface SubprocessOutput {
  type: string;
  message: string;
  timestamp: string;
  pid?: number;
  exitCode?: number;
  error?: string;
}

export interface IPCMessageBrokerContextType {
  lastMessage: string | undefined;
  idleStatus: boolean;
  logMessages: LogMessage[];
  subprocessOutputs: SubprocessOutput[];
  isElectronAvailable: boolean;
}

export interface IPCMessageBrokerConfig {
  /** Time in milliseconds before idle status is set (default: 180000 = 3 minutes) */
  idleTime?: number;
  /** Time in milliseconds before resuscitation is triggered (default: 360000 = 6 minutes) */
  resuscitationTime?: number;
  /** Maximum number of log messages to keep in memory (default: 100) */
  maxLogMessages?: number;
  /** Maximum number of subprocess outputs to keep in memory (default: 100) */
  maxSubprocessOutputs?: number;
  /** Maximum initialization attempts (default: 5) */
  maxInitAttempts?: number;
  /** Delay between initialization attempts in ms (default: 500) */
  initRetryDelay?: number;
}

const DEFAULT_CONFIG: Required<IPCMessageBrokerConfig> = {
  idleTime: 180 * 1000,
  resuscitationTime: 360 * 1000,
  maxLogMessages: 100,
  maxSubprocessOutputs: 100,
  maxInitAttempts: 5,
  initRetryDelay: 500,
};

export const IPCMessageBrokerContext = createContext<IPCMessageBrokerContextType>({
  lastMessage: undefined,
  idleStatus: false,
  logMessages: [],
  subprocessOutputs: [],
  isElectronAvailable: false
});

/** Custom hook for accessing the IPC Message Broker context */
export const useIPCMessageBroker = () => useContext(IPCMessageBrokerContext);
// Global type declaration for DashIPCService
declare global {
  interface Window {
    DashIPCService?: DashIPCServiceType;
  }
}

interface IPCMessageBrokerProviderProps {
  children: React.ReactNode;
  config?: IPCMessageBrokerConfig;
}

export const IPCMessageBrokerProvider = ({
  children,
  config: userConfig
}: IPCMessageBrokerProviderProps) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  const [lastMessage, setLastMessage] = useState<string>();
  const [idleStatus, setIdleStatus] = useState(false);
  const [idleTimeout, setIdleTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [logMessages, setLogMessages] = useState<LogMessage[]>([]);
  const [subprocessOutputs, setSubprocessOutputs] = useState<SubprocessOutput[]>([]);
  const [isElectronAvailable, setIsElectronAvailable] = useState<boolean>(false);
  const initAttempts = useRef(0);

  const resetIdleStatus = () => {
    setIdleStatus(false);
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
    setIdleTimeout(setTimeout(() => {
      setIdleStatus(true);
    }, config.idleTime));
  };

  // Safely call a method if it exists
  const safeMethodCall = <T extends (...args: any[]) => any>(
    obj: any,
    methodName: string,
    fallback: T | null = null
  ): T | null => {
    if (obj && typeof obj[methodName] === 'function') {
      return obj[methodName].bind(obj);
    }
    console.warn(`Method ${methodName} is not available on DashIPCService`);
    return fallback;
  };

  // Setup IPC listeners with retry mechanism
  const setupIPCListeners = () => {
    if (typeof window === 'undefined') return false;

    // Check if DashIPCService is available
    if (!window.DashIPCService) {
      console.log(`DashIPCService not available yet. Attempt ${initAttempts.current + 1}/${config.maxInitAttempts}`);
      initAttempts.current += 1;

      if (initAttempts.current < config.maxInitAttempts) {
        setTimeout(setupIPCListeners, config.initRetryDelay);
      } else {
        console.warn('Failed to initialize DashIPCService after multiple attempts');
      }
      return false;
    }

    console.log('DashIPCService is available, setting up listeners');
    setIsElectronAvailable(true);

    const handleMessage = (message: string) => {
      setLastMessage(message);
      resetIdleStatus();
    };

    const handleLogMessage = (logData: LogMessage) => {
      console.log('Log message received:', logData);
      setLogMessages(prev => [...prev.slice(-(config.maxLogMessages - 1)), logData]);
      resetIdleStatus();
    };

    const handleSubprocessOutput = (data: SubprocessOutput) => {
      console.log('Subprocess output received:', data);
      setSubprocessOutputs(prev => [...prev.slice(-(config.maxSubprocessOutputs - 1)), data]);
      resetIdleStatus();
    };

    // Safely set up event listeners
    const onServiceMessage = safeMethodCall(window.DashIPCService, 'onServiceMessage');
    const onElectronLog = safeMethodCall(window.DashIPCService, 'onElectronLog');
    const onSubprocessOutput = safeMethodCall(window.DashIPCService, 'onSubprocessOutput');
    const onStdout = safeMethodCall(window.DashIPCService, 'onStdout');

    // Set up listeners if methods exist
    if (onServiceMessage) {
      onServiceMessage((data: any) => {
        handleMessage(data);
      });
    }

    if (onElectronLog) {
      onElectronLog((data: LogMessage) => {
        handleLogMessage(data);
      });
    }

    if (onSubprocessOutput) {
      onSubprocessOutput((data: SubprocessOutput) => {
        handleSubprocessOutput(data);
      });
    }

    // Fallback to stdout if onElectronLog is not available
    if (!onElectronLog && onStdout) {
      onStdout((message: string) => {
        // Try to parse stdout messages as log entries
        try {
          if (message.includes('{') && message.includes('}')) {
            const jsonStart = message.indexOf('{');
            const jsonEnd = message.lastIndexOf('}') + 1;
            const jsonStr = message.substring(jsonStart, jsonEnd);
            const data = JSON.parse(jsonStr);

            if (data.level && data.message) {
              handleLogMessage({
                level: data.level,
                message: data.message,
                timestamp: data.timestamp || new Date().toISOString()
              });
              return;
            }
          }
        } catch {
          // Not JSON or not a log structure, use as plain message
        }

        // Fallback: treat as a generic log message
        handleLogMessage({
          level: 'info',
          message: message,
          timestamp: new Date().toISOString()
        });
      });
    }

    // Start initial idle timer
    resetIdleStatus();
    return true;
  };

  useEffect(() => {
    setupIPCListeners();

    return () => {
      if (idleTimeout) {
        clearTimeout(idleTimeout);
      }
    };
  }, []);

  useEffect(() => {
    if (idleStatus && window.DashIPCService && typeof window.DashIPCService.action === 'function') {
      const resuscitateTimeout = setTimeout(() => {
        window.DashIPCService!.action!('resuscitate', null);
      }, config.resuscitationTime - config.idleTime);

      return () => {
        clearTimeout(resuscitateTimeout);
      };
    }
  }, [idleStatus, config.resuscitationTime, config.idleTime]);

  const contextValue: IPCMessageBrokerContextType = {
    lastMessage,
    idleStatus,
    logMessages,
    subprocessOutputs,
    isElectronAvailable
  };

  return (
    <IPCMessageBrokerContext.Provider value={contextValue}>
      {children}
    </IPCMessageBrokerContext.Provider>
  );
};

export default IPCMessageBrokerProvider;
