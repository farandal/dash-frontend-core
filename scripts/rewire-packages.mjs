#!/usr/bin/env node
/**
 * Rewire packages for proper workspace + publishing configuration.
 *
 * For monorepo development:
 * - main/module point to src/ for fast workspace resolution
 * - dist/ files are built and published to npm/Verdaccio
 * - files field includes both src and dist so npm gets everything needed
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const packagesDir = path.join(rootDir, 'packages')

// Packages that are config-only (no source to build)
const CONFIG_ONLY = new Set(['dash-eslint', 'dash-prettier', 'dash-tsconfig'])

// Packages that should include src/ in files (export LESS files, etc)
const INCLUDE_SRC = new Set(['dash-styles'])

function rewirePackage(pkg) {
  if (CONFIG_ONLY.has(pkg.name)) {
    // Config packages: no changes needed, already correct
    return false
  }

  let changed = false

  // For workspace development: point main/module to src
  // This allows pnpm's workspace:* to resolve quickly without needing a build
  const hasSourceFile =
    fs.existsSync(path.join(packagesDir, pkg.name, 'src/index.ts')) ||
    fs.existsSync(path.join(packagesDir, pkg.name, 'src/index.tsx')) ||
    fs.existsSync(path.join(packagesDir, pkg.name, 'index.ts'))

  if (hasSourceFile) {
    // Determine the source entry
    const sourceEntry = fs.existsSync(path.join(packagesDir, pkg.name, 'index.ts'))
      ? 'index.ts'
      : fs.existsSync(path.join(packagesDir, pkg.name, 'src/index.ts'))
        ? 'src/index.ts'
        : 'src/index.tsx'

    // For development (workspace:*), point to source
    if (pkg.main !== sourceEntry) {
      pkg.main = sourceEntry
      changed = true
    }
    if (pkg.module !== sourceEntry) {
      pkg.module = sourceEntry
      changed = true
    }
  }

  // types still points to dist (for published packages, or generated from source)
  if (pkg.types !== 'dist/index.d.ts') {
    pkg.types = 'dist/index.d.ts'
    changed = true
  }

  // files should include source (for workspace) and dist (for npm publishing)
  const expectedFiles = INCLUDE_SRC.has(pkg.name)
    ? ['dist', 'src']
    : ['dist']

  if (JSON.stringify(pkg.files) !== JSON.stringify(expectedFiles)) {
    pkg.files = expectedFiles
    changed = true
  }

  // Ensure exports still point to dist (for npm/Verdaccio consumers)
  if (pkg.exports && typeof pkg.exports === 'object') {
    const mainExport = pkg.exports['.']
    if (mainExport && typeof mainExport === 'object') {
      // Already has proper export structure from fix-exports-order.mjs
      // No changes needed
    }
  }

  return changed
}

const pkgNames = fs.readdirSync(packagesDir).filter(name =>
  fs.statSync(path.join(packagesDir, name)).isDirectory()
)

let rewired = 0
for (const pkgName of pkgNames) {
  const pkgDir = path.join(packagesDir, pkgName)
  const pkgJsonPath = path.join(pkgDir, 'package.json')

  if (!fs.existsSync(pkgJsonPath)) continue

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))

  if (rewirePackage(pkg)) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, '\t') + '\n')
    console.log(`✓ Rewired ${pkgName}`)
    rewired++
  }
}

console.log(`\nDone: ${rewired} packages rewired`)
console.log('\nConfiguration:')
console.log('- main/module: point to source for fast workspace:* resolution')
console.log('- types: point to dist/index.d.ts')
console.log('- exports: point to dist/ for npm/Verdaccio consumers')
console.log('- files: include dist/ for npm, src/ for LESS-dependent packages')
