#!/usr/bin/env node
/**
 * Electron Builder Wrapper for pnpm workspaces
 * 
 * This script works around electron-builder's node_modules collection issue
 * when using pnpm workspaces. 
 * 
 * Strategy: Vite bundles ALL dependencies into the main process JS, so we 
 * completely bypass node_modules by creating a package.json with ZERO deps.
 * 
 * IMPORTANT: This script backs up and restores the original package.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = __dirname;
const packageJsonPath = path.join(projectDir, 'package.json');
const packageJsonBackup = path.join(projectDir, 'package.json.original-backup');
const pnpmWorkspacePath = path.join(projectDir, 'pnpm-workspace.yaml');
const pnpmWorkspaceBackup = path.join(projectDir, 'pnpm-workspace.yaml.build-backup');
const pnpmLockPath = path.join(projectDir, 'pnpm-lock.yaml');
const pnpmLockBackup = path.join(projectDir, 'pnpm-lock.yaml.build-backup');
const yarnLockPath = path.join(projectDir, 'yarn.lock');
const nodeModulesPath = path.join(projectDir, 'node_modules');
const nodeModulesBackup = path.join(projectDir, 'node_modules_build_backup');
const dashPackagePath = path.join(projectDir, 'apps/dash/package.json');

// Read the dash app package.json for name/version
let dashPackage = { name: 'kitchntabs', version: '1.0.0' };
try {
  dashPackage = JSON.parse(fs.readFileSync(dashPackagePath, 'utf8'));
} catch (e) {
  console.warn('⚠️ Could not read apps/dash/package.json, using defaults');
}

// Cleanup function to ensure we always restore
function cleanup() {
  console.log('📦 Restoring original environment...');
  
  // Remove the fake yarn.lock
  if (fs.existsSync(yarnLockPath)) {
    try { fs.unlinkSync(yarnLockPath); } catch (e) {}
  }
  
  // Remove temporary node_modules
  if (fs.existsSync(nodeModulesPath) && fs.existsSync(nodeModulesBackup)) {
    console.log('  → Removing temporary node_modules...');
    try { fs.rmSync(nodeModulesPath, { recursive: true, force: true }); } catch (e) {}
  }
  
  // Restore original node_modules
  if (fs.existsSync(nodeModulesBackup)) {
    console.log('  → Restoring node_modules...');
    try { fs.renameSync(nodeModulesBackup, nodeModulesPath); } catch (e) {}
  }
  
  // Restore package.json - THIS IS CRITICAL
  if (fs.existsSync(packageJsonBackup)) {
    console.log('  → Restoring package.json...');
    try {
      fs.copyFileSync(packageJsonBackup, packageJsonPath);
      fs.unlinkSync(packageJsonBackup);
    } catch (e) {
      console.error('❌ CRITICAL: Failed to restore package.json!');
      console.error('   Run: git checkout package.json');
    }
  }
  
  // Restore pnpm-workspace.yaml
  if (fs.existsSync(pnpmWorkspaceBackup)) {
    console.log('  → Restoring pnpm-workspace.yaml...');
    try { fs.renameSync(pnpmWorkspaceBackup, pnpmWorkspacePath); } catch (e) {}
  }
  
  // Restore pnpm-lock.yaml
  if (fs.existsSync(pnpmLockBackup)) {
    console.log('  → Restoring pnpm-lock.yaml...');
    try { fs.renameSync(pnpmLockBackup, pnpmLockPath); } catch (e) {}
  }
  
  console.log('✅ Environment restored');
}

// Register cleanup handlers
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(1); });
process.on('SIGTERM', () => { cleanup(); process.exit(1); });
process.on('uncaughtException', (err) => { 
  console.error('Uncaught exception:', err);
  cleanup(); 
  process.exit(1); 
});

console.log('📦 Setting up clean build environment...');

// Backup original package.json FIRST
console.log('  → Backing up package.json...');
fs.copyFileSync(packageJsonPath, packageJsonBackup);

// Backup and hide pnpm-workspace.yaml
if (fs.existsSync(pnpmWorkspacePath)) {
  console.log('  → Hiding pnpm-workspace.yaml...');
  fs.renameSync(pnpmWorkspacePath, pnpmWorkspaceBackup);
}

// Backup and hide pnpm-lock.yaml
if (fs.existsSync(pnpmLockPath)) {
  console.log('  → Hiding pnpm-lock.yaml...');
  fs.renameSync(pnpmLockPath, pnpmLockBackup);
}

// Rename node_modules temporarily
if (fs.existsSync(nodeModulesPath)) {
  console.log('  → Temporarily renaming node_modules...');
  fs.renameSync(nodeModulesPath, nodeModulesBackup);
}

// Create completely empty node_modules directory
fs.mkdirSync(nodeModulesPath, { recursive: true });

// Create minimal package.json with ZERO dependencies
// This tells electron-builder there's nothing to collect
const minimalPackage = {
  name: dashPackage.name,
  version: dashPackage.version,
  description: 'KitchnTabs Desktop Application',
  author: {
    name: 'Dash Team',
    email: 'dev@kitchntabs.com'
  },
  main: 'apps/dash/dist-electron/main/index.js',
  private: true
  // NO dependencies or devDependencies - Vite bundles everything
};
fs.writeFileSync(packageJsonPath, JSON.stringify(minimalPackage, null, 2));

// Create empty yarn.lock to trick electron-builder into thinking this is a yarn project
fs.writeFileSync(yarnLockPath, '# THIS FILE IS AUTO-GENERATED FOR ELECTRON BUILD\n');

console.log('✅ Clean build environment ready');

// Get command line arguments
const args = process.argv.slice(2).join(' ');

console.log('🔧 Building Electron app...');
console.log(`📦 Running: electron-builder ${args}`);

let buildSuccess = true;

try {
  const electronBuilderPath = path.join(nodeModulesBackup, '.bin', 'electron-builder');
  
  execSync(`"${electronBuilderPath}" ${args}`, {
    cwd: projectDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      USE_HARD_LINKS: 'false',
      PATH: `${path.join(nodeModulesBackup, '.bin')}:${process.env.PATH}`
    }
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  buildSuccess = false;
}

// Cleanup is called automatically via process.on('exit')
process.exit(buildSuccess ? 0 : 1);
