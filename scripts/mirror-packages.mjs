#!/usr/bin/env node
/**
 * Configure packages for Verdaccio/npm publishing while preserving the app's
 * (and packages') deep subpath imports.
 *
 * Two package classes:
 *
 *  MIRROR  — packages that are deep-imported (pkg/src/foo/bar). Built with tsup
 *            bundle:false so dist/ mirrors the src/ tree file-for-file. exports
 *            expose:
 *              "."        -> dist/index.js
 *              "./*"      -> dist/*.js        (clean form: pkg/foo/bar)
 *              "./src/*"  -> dist/*.js        (compat: pkg/src/foo/bar still works,
 *                                              so the ~259 in-package deep imports
 *                                              resolve with no source edits)
 *            plus an explicit entry for every directory that has an index file
 *            (directory imports can't be served by a "*" pattern).
 *
 *  SINGLE  — packages only ever root-imported (and asset packages: less/mp3/icons).
 *            Kept as a single bundled entry; just point main/module at dist.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const packagesDir = path.join(rootDir, 'packages')

// Deep-imported packages (by the app and/or by sibling packages) -> mirror build
const MIRROR = new Set([
  'dash-admin', 'dash-admin-state', 'dash-app-common', 'dash-auto-admin',
  'dash-axios-hook', 'dash-utils', 'dash-constants', 'dash-dialog',
  'dash-components', 'kt-utils', 'kt-pages', 'kt-cashcount', 'kt-ecommerce',
])

// Buildable but root-imported only (incl. asset packages that must stay bundled)
const SINGLE = new Set([
  'dash-auth', 'dash-boilerplate', 'dash-info', 'dash-interfaces',
  'dash-icons', 'dash-modal', 'dash-styles', 'kt-kiosk',
])

// No build — published as-is
const CONFIG_ONLY = new Set(['dash-eslint', 'dash-prettier', 'dash-tsconfig'])
const SKIP = new Set(['react-18-beautiful-dnd-grid'])

// Has LESS files consumers import directly — ship src too
const INCLUDE_SRC = new Set(['dash-styles'])
// Root-level index.ts instead of src/index.ts
const ROOT_ENTRY = new Set(['dash-icons'])

const REGISTRY = 'http://localhost:4873'

/** Recursively collect, relative to baseDir: all source files and all dirs that have an index. */
function walkSrc(baseDir) {
  const files = []
  const indexDirs = []
  if (!fs.existsSync(baseDir)) return { files, indexDirs }

  const walk = (dir, rel) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const hasIndex = entries.some(
      e => e.isFile() && /^index\.(ts|tsx)$/.test(e.name)
    )
    if (rel && hasIndex) indexDirs.push(rel)

    for (const e of entries) {
      const abs = path.join(dir, e.name)
      const childRel = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) {
        walk(abs, childRel)
      } else if (/\.(ts|tsx)$/.test(e.name) && !/\.(test|spec|stories)\./.test(e.name) && !/\.d\.ts$/.test(e.name)) {
        files.push(childRel.replace(/\.(ts|tsx)$/, ''))
      }
    }
  }
  walk(baseDir, '')
  return { files, indexDirs }
}

function writeMirrorTsup(pkgDir) {
  const tsup = `import { defineConfig } from 'tsup'

// bundle:false => each source file is transpiled individually, so dist/ mirrors src/.
export default defineConfig({
  entry: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.*', '!src/**/*.spec.*', '!src/**/*.stories.*'],
  format: ['esm'],
  bundle: false,
  dts: false,        // types stripped at runtime; staging prioritises runtime resolution
  clean: true,
  sourcemap: false,
  splitting: false,
  treeshake: false,
  outDir: 'dist',
  esbuildOptions(options) {
    options.loader = { ...options.loader, '.less': 'empty' }
    // Automatic JSX runtime: emit react/jsx-runtime imports instead of bare
    // React.createElement — sources that use JSX without importing React still work.
    options.jsx = 'automatic'
    options.jsxImportSource = 'react'
  },
})
`
  fs.writeFileSync(path.join(pkgDir, 'tsup.config.ts'), tsup)
}

/** Inject automatic JSX runtime into an existing single-entry tsup.config.ts. */
function patchSingleTsup(pkgDir) {
  const cfgPath = path.join(pkgDir, 'tsup.config.ts')
  if (!fs.existsSync(cfgPath)) return
  let cfg = fs.readFileSync(cfgPath, 'utf8')
  if (cfg.includes("options.jsx")) return
  if (cfg.includes("options.loader =")) {
    cfg = cfg.replace(
      /(options\.loader = \{[^\n]*\n)/,
      `$1    options.jsx = 'automatic'\n    options.jsxImportSource = 'react'\n`
    )
  } else if (cfg.includes('esbuildOptions(options) {')) {
    cfg = cfg.replace(
      /esbuildOptions\(options\) \{\n/,
      `esbuildOptions(options) {\n    options.jsx = 'automatic'\n    options.jsxImportSource = 'react'\n`
    )
  }
  fs.writeFileSync(cfgPath, cfg)
}

function buildMirrorExports(pkg, pkgDir) {
  const srcDir = path.join(pkgDir, 'src')
  const { indexDirs } = walkSrc(srcDir)

  const exp = {}
  // STRING targets (not condition objects): a string matches EVERY condition
  // (import / require / default), so both `import 'pkg'` and `require('pkg')`
  // resolve. Object exports with only `import` break CJS `require()` consumers
  // ("No known conditions for '.'"). Types are served by typesVersions, not here.
  // Root entry
  exp['.'] = './dist/index.js'

  // Explicit directory-with-index entries (exact keys win over patterns).
  // Both clean and /src compat forms.
  for (const dir of indexDirs.sort()) {
    exp[`./${dir}`] = `./dist/${dir}/index.js`
    exp[`./src/${dir}`] = `./dist/${dir}/index.js`
  }

  // Wildcards: clean + compat. "./src/*" is more specific than "./*" for src paths.
  exp['./*'] = './dist/*.js'
  exp['./src/*'] = './dist/*.js'

  // Preserve any pre-existing non-"." sub-path exports (e.g. dash-styles LESS)
  if (pkg.exports && typeof pkg.exports === 'object') {
    for (const [k, v] of Object.entries(pkg.exports)) {
      if (k !== '.' && !k.startsWith('./src/') && k !== './*' && !exp[k]) exp[k] = v
    }
  }
  return exp
}

let mirrored = 0
let singled = 0

for (const pkgName of fs.readdirSync(packagesDir)) {
  const pkgDir = path.join(packagesDir, pkgName)
  if (!fs.statSync(pkgDir).isDirectory()) continue
  const pkgJsonPath = path.join(pkgDir, 'package.json')
  if (!fs.existsSync(pkgJsonPath)) continue
  if (CONFIG_ONLY.has(pkgName) || SKIP.has(pkgName)) continue

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
  delete pkg.private
  pkg.publishConfig = { access: 'public', registry: REGISTRY }
  if (!pkg.scripts) pkg.scripts = {}
  pkg.scripts.build = 'tsup'

  if (MIRROR.has(pkgName)) {
    pkg.type = 'module'
    pkg.main = 'dist/index.js'
    pkg.module = 'dist/index.js'
    // Runtime resolves to dist via exports; types resolve to SOURCE (full fidelity,
    // no fragile d.ts generation). Under classic node resolution tsc ignores exports
    // and uses these `types` + `typesVersions` fields.
    const idxExt = fs.existsSync(path.join(pkgDir, 'src', 'index.tsx')) ? 'tsx' : 'ts'
    pkg.types = `./src/index.${idxExt}`
    // `src/*/index` fallback lets directory imports (e.g. redux/store) resolve to index.tsx
    pkg.typesVersions = { '*': { 'src/*': ['src/*', 'src/*/index'], '*': ['src/*', 'src/*/index'] } }
    pkg.exports = buildMirrorExports(pkg, pkgDir)
    pkg.files = ['dist', 'src'] // ship src so types resolve for published consumers too
    writeMirrorTsup(pkgDir)
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, '\t') + '\n')
    console.log(`MIRROR  ${pkgName}  (${Object.keys(pkg.exports).length} export keys)`)
    mirrored++
  } else if (SINGLE.has(pkgName)) {
    // Single bundled entry — keep existing tsup.config.ts (asset-aware) but ensure
    // automatic JSX runtime so JSX-without-React-import sources don't crash.
    patchSingleTsup(pkgDir)
    // type:module so tsup emits ESM=index.js, CJS=index.cjs (matches exports below).
    pkg.type = 'module'
    pkg.main = 'dist/index.cjs'
    pkg.module = 'dist/index.js'
    pkg.types = 'dist/index.d.ts'
    const existing = pkg.exports && typeof pkg.exports === 'object' ? pkg.exports : {}
    const dot = { types: './dist/index.d.ts', import: './dist/index.js', require: './dist/index.cjs' }
    pkg.exports = { '.': dot }
    for (const [k, v] of Object.entries(existing)) if (k !== '.') pkg.exports[k] = v
    pkg.files = INCLUDE_SRC.has(pkgName) ? ['dist', 'src'] : ['dist']
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, '\t') + '\n')
    console.log(`SINGLE  ${pkgName}`)
    singled++
  }
}

console.log(`\nDone: ${mirrored} mirror, ${singled} single-entry.`)
console.log('Next: pnpm install -w && turbo build, then rewrite app imports.')
