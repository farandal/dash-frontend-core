/// <reference types="window" />

// Global type declarations for third-party libraries
/// <reference types="window" />

declare global {
  interface Window {
    Laravel?: {
      csrfToken?: string;
    };
    Pusher?: any;
    io?: any;
  }

  const Vue: any;
  const axios: any;
  const jQuery: any;
  const Turbo: any;
}

export {};