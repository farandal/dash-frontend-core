#!/usr/bin/env node

/**
 * Restore Build Files
 *
 * The electron-builder build process temporarily hides pnpm-lock.yaml and pnpm-workspace.yaml
 * to work around pnpm workspace parsing issues. If the build fails, these files may not be restored.
 *
 * This script safely restores them.
 *
 * Usage:
 *   npm run restore:build-files
 *   pnpm restore:build-files
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const pnpmLockPath = path.join(projectDir, 'pnpm-lock.yaml');
const pnpmLockBackup = path.join(projectDir, 'pnpm-lock.yaml.build-backup');
const pnpmWorkspacePath = path.join(projectDir, 'pnpm-workspace.yaml');
const pnpmWorkspaceBackup = path.join(projectDir, 'pnpm-workspace.yaml.build-backup');

let restored = false;

// Restore pnpm-lock.yaml
if (fs.existsSync(pnpmLockBackup) && !fs.existsSync(pnpmLockPath)) {
  try {
    fs.renameSync(pnpmLockBackup, pnpmLockPath);
    console.log('✅ Restored pnpm-lock.yaml');
    restored = true;
  } catch (error) {
    console.error('❌ Failed to restore pnpm-lock.yaml:', error.message);
    process.exit(1);
  }
}

// Restore pnpm-workspace.yaml
if (fs.existsSync(pnpmWorkspaceBackup) && !fs.existsSync(pnpmWorkspacePath)) {
  try {
    fs.renameSync(pnpmWorkspaceBackup, pnpmWorkspacePath);
    console.log('✅ Restored pnpm-workspace.yaml');
    restored = true;
  } catch (error) {
    console.error('❌ Failed to restore pnpm-workspace.yaml:', error.message);
    process.exit(1);
  }
}

if (restored) {
  console.log('\n✓ Build files restored successfully.');
  console.log('You can now run your build again.');
} else {
  console.log('ℹ️  No backup files found to restore.');
  console.log('This is normal if the build completed successfully.');
}
