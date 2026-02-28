// Add this new file to define the isQuitting property on the app object
import { App } from 'electron';

declare module 'electron' {
  interface App {
    isQuitting: boolean;
  }
}
