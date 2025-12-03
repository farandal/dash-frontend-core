/**
 * DashIPCMessageBrokerContext - Re-export from dash-utils
 * 
 * This file re-exports the IPCMessageBrokerContext from dash-utils
 * with Dash prefix for dash-app-common consistency.
 * 
 * All core functionality is now in the dash-utils package.
 * New code should import directly from 'dash-utils'.
 */

export {
  IPCMessageBrokerContext as DashIPCMessageBrokerContext,
  IPCMessageBrokerProvider as DashIPCMessageBrokerProvider,
  useIPCMessageBroker as useDashIPCMessageBroker,
  type LogMessage as DashLogMessage,
  type SubprocessOutput as DashSubprocessOutput,
  type IPCMessageBrokerContextType as DashIPCMessageBrokerContextType,
  type IPCMessageBrokerConfig as DashIPCMessageBrokerConfig
} from 'dash-utils';

// Default export for backward compatibility
export { IPCMessageBrokerProvider as default } from 'dash-utils';
