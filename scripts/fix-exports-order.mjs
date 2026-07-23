#!/usr/bin/env node
/**
 * Fix exports field ordering in all package.json files.
 * Ensures "types" condition comes first, followed by "import" and "require".
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const packagesDir = path.join(rootDir, 'packages')

function fixExportsOrder(obj) {
  if (!obj.exports || typeof obj.exports !== 'object') return

  const fixedExports = {}

  for (const [key, value] of Object.entries(obj.exports)) {
    if (typeof value !== 'object' || value === null) {
      fixedExports[key] = value
      continue
    }

    // For each export condition, reorder so "types" comes first
    const ordered = {}

    // Add types first if it exists
    if (value.types) ordered.types = value.types

    // Then add import
    if (value.import) ordered.import = value.import

    // Then require
    if (value.require) ordered.require = value.require

    // Then any other conditions
    for (const [k, v] of Object.entries(value)) {
      if (!['types', 'import', 'require'].includes(k)) {
        ordered[k] = v
      }
    }

    fixedExports[key] = ordered
  }

  obj.exports = fixedExports
}

const pkgNames = fs.readdirSync(packagesDir).filter(name =>
  fs.statSync(path.join(packagesDir, name)).isDirectory()
)

let fixed = 0
for (const pkgName of pkgNames) {
  const pkgDir = path.join(packagesDir, pkgName)
  const pkgJsonPath = path.join(pkgDir, 'package.json')

  if (!fs.existsSync(pkgJsonPath)) continue

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
  const before = JSON.stringify(pkg.exports)

  fixExportsOrder(pkg)

  const after = JSON.stringify(pkg.exports)

  if (before !== after) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, '\t') + '\n')
    console.log(`✓ Fixed ${pkgName}`)
    fixed++
  }
}

console.log(`\nDone: ${fixed} packages fixed`)
