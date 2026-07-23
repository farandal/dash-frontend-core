#!/usr/bin/env node
/**
 * Prepares all workspace packages for publishing to Verdaccio.
 * - Removes `private: true`
 * - Adds publishConfig pointing to localhost:4873
 * - Adds tsup build script (except config-only packages)
 * - Updates main/module/types/exports to dist/
 * - Sets files field
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const packagesDir = path.join(rootDir, 'packages')

// No TypeScript source — just config files to publish as-is
const CONFIG_ONLY = new Set(['dash-eslint', 'dash-prettier', 'dash-tsconfig'])

// Has LESS files consumers import directly — include src/ in published files
const INCLUDE_SRC = new Set(['dash-styles'])

// Uses root-level index.ts instead of src/index.ts
const ROOT_ENTRY = new Set(['dash-icons'])

// Already properly configured (private: false, has build)
const SKIP = new Set(['react-18-beautiful-dnd-grid'])

function detectEntry(pkgDir, pkgName) {
  if (ROOT_ENTRY.has(pkgName)) return 'index.ts'
  if (fs.existsSync(path.join(pkgDir, 'src', 'index.ts'))) return 'src/index.ts'
  if (fs.existsSync(path.join(pkgDir, 'src', 'index.tsx'))) return 'src/index.tsx'
  return null
}

const pkgNames = fs.readdirSync(packagesDir).filter(name =>
  fs.statSync(path.join(packagesDir, name)).isDirectory()
)

for (const pkgName of pkgNames) {
  if (SKIP.has(pkgName)) {
    console.log(`SKIP  ${pkgName} (already configured)`)
    continue
  }

  const pkgDir = path.join(packagesDir, pkgName)
  const pkgJsonPath = path.join(pkgDir, 'package.json')
  if (!fs.existsSync(pkgJsonPath)) continue

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))

  // Remove private flag
  delete pkg.private

  // Publish to local Verdaccio
  pkg.publishConfig = {
    access: 'public',
    registry: 'http://localhost:4873',
  }

  if (CONFIG_ONLY.has(pkgName)) {
    // Tooling packages: no build needed, just publish config files as-is
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, '\t') + '\n')
    console.log(`CONF  ${pkgName}`)
    continue
  }

  const entry = detectEntry(pkgDir, pkgName)
  if (!entry) {
    console.warn(`WARN  ${pkgName}: no entry file found, skipping build setup`)
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, '\t') + '\n')
    continue
  }

  // Add build script — just "tsup" picks up tsup.config.ts in the package dir
  if (!pkg.scripts) pkg.scripts = {}
  pkg.scripts.build = 'tsup'

  // Write per-package tsup.config.ts (self-contained, no shared imports needed)
  const external = [
    'react', 'react-dom', '@emotion/react', '@emotion/styled', '@mui/material',
    'react-router', 'react-router-dom', 'react-admin', 'react-redux',
  ]
  const tsupConfig = `import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['${entry}'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ${JSON.stringify(external, null, 2).replace(/\n/g, '\n  ')},
  esbuildOptions(options) {
    // treat .less imports as empty — LESS is handled by consumer's bundler
    options.loader = { ...options.loader, '.less': 'empty' }
  },
})
`
  fs.writeFileSync(path.join(pkgDir, 'tsup.config.ts'), tsupConfig)

  // Fix tsconfig: remove "incremental" from compilerOptions — tsup's DTS worker
  // errors when it sees incremental:true without a tsBuildInfoFile specified.
  const tsconfigPath = path.join(pkgDir, 'tsconfig.json')
  if (fs.existsSync(tsconfigPath)) {
    try {
      // Strip JS comments before parsing (tsconfig files allow them)
      const raw = fs.readFileSync(tsconfigPath, 'utf8').replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
      const tsconfig = JSON.parse(raw)
      if (tsconfig.compilerOptions && tsconfig.compilerOptions.incremental !== undefined) {
        delete tsconfig.compilerOptions.incremental
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, '\t') + '\n')
        console.log(`      patched tsconfig (removed incremental) in ${pkgName}`)
      }
    } catch (_) {
      // tsconfig parse failed — leave it alone
    }
  }

  // Update dist entry points
  pkg.main = 'dist/index.cjs'
  pkg.module = 'dist/index.js'
  pkg.types = 'dist/index.d.ts'

  // Preserve LESS sub-path exports for dash-styles, rebuild '.' export
  const existingExports = pkg.exports && typeof pkg.exports === 'object' ? { ...pkg.exports } : {}
  const distExport = {
    import: './dist/index.js',
    require: './dist/index.cjs',
    types: './dist/index.d.ts',
  }
  pkg.exports = { '.': distExport }

  // Re-attach any non-'.' sub-path exports (e.g. ./dash.less, ./styles/*)
  for (const [key, val] of Object.entries(existingExports)) {
    if (key !== '.') pkg.exports[key] = val
  }

  // Published files
  const files = ['dist']
  if (INCLUDE_SRC.has(pkgName)) files.push('src')
  pkg.files = files

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, '\t') + '\n')
  console.log(`PREP  ${pkgName} (entry: ${entry})`)
}

console.log('\nDone. Next steps:')
console.log('  1. pnpm install          # update lockfile')
console.log('  2. pnpm publish:local    # build + publish all packages')
