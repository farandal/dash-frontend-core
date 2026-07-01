import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import pkg from './package.json'
// import basicSsl from '@vitejs/plugin-basic-ssl';

// Load build configuration to get APP_PATH
interface IBuildConfig {
  mode?: string;
  customMode?: string;
  targetType?: string;
  platform?: string;
  appPath?: string;
  buildId?: string;
}

const loadBuildConfig = (): IBuildConfig => {
  const configPath = path.resolve(__dirname, 'build_config.json');
  try {
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configContent);
    }
  } catch (error) {
    console.warn('⚠️ Could not load build_config.json, using defaults');
  }
  return {};
};

const buildConfig = loadBuildConfig();
const APP_PATH = buildConfig.appPath || process.env.APP_PATH || 'apps/dash';

console.log('📁 Electron build using APP_PATH:', APP_PATH);

// Modules that MUST remain external (native modules that can't be bundled)
// electron-updater and electron-log MUST be bundled (not external) for packaged apps
const nativeModules = ['electron'];

// Modules that should be bundled into the main process (not externalized)
// These are needed at runtime but won't be available in node_modules in packaged app
const bundledModules = [
  'electron-updater',
  'electron-log',
  'electron-store',
  'sound-play',
  'dotenv',
  'yaml'
];

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  fs.rmSync('dist-electron', { recursive: true, force: true })

  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const isProduction = process.env.NODE_ENV === 'production' || process.env.BUILD_ENV === 'prod'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG

  return {
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, `${APP_PATH}/src`),
        '@': path.join(__dirname, 'src')
      },
    },
    optimizeDeps: {
        include: [
          '@emotion/react', 
          '@emotion/styled', 
          '@mui/material/Tooltip'
        ],
      },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: `${APP_PATH}/electron/main/index.ts`,
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App')
            } else {
              args.startup()
            }
          },
          vite: {
            build: {
              //sourcemap,
              minify: isProduction ? 'esbuild' : false,
              outDir: `${APP_PATH}/dist-electron/main`,
              rollupOptions: {
                // Only externalize 'electron' - bundle everything else including electron-updater
                external: (id) => {
                  // Only externalize the 'electron' module itself
                  if (id === 'electron') return true;
                  // Explicitly bundle these modules (don't externalize)
                  if (bundledModules.some(mod => id === mod || id.startsWith(mod + '/'))) return false;
                  // Don't externalize other modules - let Vite bundle them
                  return false;
                },
                output: {
                  format: 'cjs', // Use CommonJS for better compatibility
                  entryFileNames: '[name].js'
                }
              }
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: `${APP_PATH}/electron/preload/index.ts`,
          vite: {
            build: {
              //sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isProduction ? 'esbuild' : false,
              outDir: `${APP_PATH}/dist-electron/preload`,
              rollupOptions: {
                // Only externalize native modules - bundle everything else
                external: nativeModules,
                output: {
                  format: 'cjs', // Use CommonJS for preload
                  entryFileNames: '[name].js'
                }
              },
            },
          },
        },
        // Polyfill the Electron and Node.js API for Renderer process.
        renderer: {},
      }),
    ],
    server: process.env.VSCODE_DEBUG && (() => {
      const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
      return {
        host: url.hostname,
        port: +url.port,
      }
    })(),
    clearScreen: false,
  }
})
