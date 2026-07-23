import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "@emotion/react",
    "@emotion/styled",
    "@mui/material",
    "react-router",
    "react-router-dom",
    "react-admin",
    "react-redux"
  ],
  esbuildOptions(options) {
    // treat .less imports as empty — LESS is handled by consumer's bundler
    options.loader = { ...options.loader, '.less': 'empty' }
    options.jsx = 'automatic'
    options.jsxImportSource = 'react'
  },
})
