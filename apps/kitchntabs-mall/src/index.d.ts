/// <reference types="vite/client" />

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.ttf';
declare module '*.woff';
declare module '*.woff2';

interface Window {
    electronStore?: {
        syncToLocalStorage: () => Promise<Record<string, any>>;
        set: (key: string, value: any) => Promise<void>;
        get: (key: string) => Promise<any>;
        delete: (key: string) => Promise<void>;
    };
    DashIPCService?: {
        action: (action: string) => void;
        speak: (text: string) => void;
    };
}
