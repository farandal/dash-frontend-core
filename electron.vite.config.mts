import { rmSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import pkg from './package.json'
// import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  rmSync('dist-electron', { recursive: true, force: true })

  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG

  return {
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'apps/dash/src'),
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
          entry: 'apps/dash/electron/main/index.ts',
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
              minify: false, // Keep it false for better debugging
              outDir: 'apps/dash/dist-electron/main',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : []),
                output: {
                  format: 'esm', // Use ESM format instead of CommonJS
                  entryFileNames: '[name].js'
                }
              }
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: 'apps/dash/electron/preload/index.ts',
          vite: {
            build: {
              //sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: false, // Keep it false for easier debugging
              outDir: 'apps/dash/dist-electron/preload',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : []),
                output: {
                  format: 'esm', // Use ESM format instead of CommonJS
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
