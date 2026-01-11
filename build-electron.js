#!/usr/bin/env node
/**
 * Electron Builder Wrapper for pnpm workspaces
 * 
 * This script works around electron-builder's node_modules collection issue
 * when using pnpm workspaces by temporarily hiding pnpm files.
 * Since Vite bundles everything, we don't need pnpm/node_modules collection.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = __dirname;

// Get command line arguments
const args = process.argv.slice(2).join(' ');

// Workaround for electron-builder 26.x pnpm workspace parsing bug
// Temporarily hide pnpm files so electron-builder doesn't try to parse pnpm dependencies
const pnpmLockPath = path.join(projectDir, 'pnpm-lock.yaml');
const pnpmLockBackup = path.join(projectDir, 'pnpm-lock.yaml.build-backup');
const pnpmWorkspacePath = path.join(projectDir, 'pnpm-workspace.yaml');
const pnpmWorkspaceBackup = path.join(projectDir, 'pnpm-workspace.yaml.build-backup');

let pnpmLockHidden = false;
let pnpmWorkspaceHidden = false;

// Hide pnpm files to bypass pnpm detection
if (fs.existsSync(pnpmLockPath)) {
  fs.renameSync(pnpmLockPath, pnpmLockBackup);
  pnpmLockHidden = true;
  console.log('🔧 Temporarily hiding pnpm-lock.yaml (electron-builder pnpm workaround)');
}
if (fs.existsSync(pnpmWorkspacePath)) {
  fs.renameSync(pnpmWorkspacePath, pnpmWorkspaceBackup);
  pnpmWorkspaceHidden = true;
  console.log('🔧 Temporarily hiding pnpm-workspace.yaml (electron-builder pnpm workaround)');
}

// Restore function
function restorePnpmFiles() {
  if (pnpmLockHidden && fs.existsSync(pnpmLockBackup)) {
    fs.renameSync(pnpmLockBackup, pnpmLockPath);
    console.log('✅ Restored pnpm-lock.yaml');
  }
  if (pnpmWorkspaceHidden && fs.existsSync(pnpmWorkspaceBackup)) {
    fs.renameSync(pnpmWorkspaceBackup, pnpmWorkspacePath);
    console.log('✅ Restored pnpm-workspace.yaml');
  }
}

console.log('🔧 Building Electron app...');
console.log(`📦 Running: electron-builder ${args}`);

let buildSuccess = true;

  // Check for AWS_PROFILE and inject credentials if needed
  const env = { ...process.env, USE_HARD_LINKS: 'false' };
  
  if (process.env.AWS_PROFILE) {
    try {
      console.log(`🔐 AWS_PROFILE '${process.env.AWS_PROFILE}' detected. Fetching credentials...`);
      
      const profile = process.env.AWS_PROFILE;
      const getVal = (key) => {
        try {
          return execSync(`aws configure get ${key} --profile ${profile}`, { encoding: 'utf8' }).trim();
        } catch (e) { return null; }
      };

      env.AWS_ACCESS_KEY_ID = getVal('aws_access_key_id');
      env.AWS_SECRET_ACCESS_KEY = getVal('aws_secret_access_key');
      const token = getVal('aws_session_token');
      if (token) env.AWS_SESSION_TOKEN = token;

      if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
        console.log('✅ AWS credentials successfully loaded from profile.');
      } else {
         console.warn('⚠️  Could not retrieve complete credentials from profile via CLI.');
      }
    } catch (error) {
      console.warn('⚠️  Failed to load AWS credentials from profile:', error.message);
    }
  }

  try {
    execSync(`npx electron-builder ${args}`, {
      cwd: projectDir,
      stdio: 'inherit',
      env: env
    });
    console.log('✅ Build completed successfully!');
    buildSuccess = true; // Use valid variable
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    buildSuccess = false; // Use valid variable
  } finally {
  // Always restore pnpm files
  restorePnpmFiles();
}

process.exit(buildSuccess ? 0 : 1);
