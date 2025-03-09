declare module '*.png';
declare module '*.jpeg';
declare module '*.jpg';


declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
}

/// <reference types="vite/client" />

declare module 'socket.io-client/dist/socket.io.js' {
    export * from 'socket.io-client'
}