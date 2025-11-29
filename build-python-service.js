#!/usr/bin/env node
/**
 * Build Python Service for Electron
 * 
 * This script builds the Python service (kt_service) with the correct configuration
 * based on the current build_config.json settings.
 * 
 * It should be called after build_config.js has generated the build configuration,
 * and before electron-builder packages the application.
 * 
 * Usage:
 *   node build-python-service.js
 * 
 * The script reads CUSTOM_MODE from build_config.json and calls the Python service
 * build script with the appropriate configuration.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = __dirname;
const PYTHON_SERVICE_DIR = path.join(FRONTEND_DIR, '..', 'dash-python-service');
const BUILD_CONFIG_PATH = path.join(FRONTEND_DIR, 'build_config.json');

// Read build configuration
function readBuildConfig() {
  if (!fs.existsSync(BUILD_CONFIG_PATH)) {
    console.warn('⚠️  build_config.json not found. Using defaults.');
    return {
      customMode: 'kitchntabs.prod',
      platform: process.platform
    };
  }

  try {
    const config = JSON.parse(fs.readFileSync(BUILD_CONFIG_PATH, 'utf8'));
    return {
      customMode: config.customMode || 'kitchntabs.prod',
      platform: config.platform || process.platform,
      mode: config.mode || 'production'
    };
  } catch (error) {
    console.error('❌ Error reading build_config.json:', error.message);
    return {
      customMode: 'kitchntabs.prod',
      platform: process.platform
    };
  }
}

// Check if Python service directory exists
function checkPythonServiceDir() {
  if (!fs.existsSync(PYTHON_SERVICE_DIR)) {
    console.error('❌ Python service directory not found:', PYTHON_SERVICE_DIR);
    console.error('   Expected location: ../dash-python-service');
    process.exit(1);
  }
  
  const buildScript = path.join(PYTHON_SERVICE_DIR, 'build-service.js');
  if (!fs.existsSync(buildScript)) {
    console.error('❌ Python service build script not found:', buildScript);
    process.exit(1);
  }
  
  console.log('✅ Python service directory found');
  return true;
}

// Build the Python service
function buildPythonService(config) {
  console.log('🐍 Building Python Service');
  console.log('===========================');
  console.log(`   Custom Mode: ${config.customMode}`);
  console.log(`   Platform: ${config.platform}`);
  console.log(`   Mode: ${config.mode}`);
  console.log('');

  const buildArgs = [
    'build-service.js',
    `--custom-mode=${config.customMode}`,
    `--platform=${config.platform}`
  ];

  try {
    execSync(`node ${buildArgs.join(' ')}`, {
      cwd: PYTHON_SERVICE_DIR,
      stdio: 'inherit',
      env: {
        ...process.env,
        CUSTOM_MODE: config.customMode,
        PLATFORM: config.platform
      }
    });

    console.log('✅ Python service build completed');
    return true;
  } catch (error) {
    console.error('❌ Python service build failed:', error.message);
    return false;
  }
}

// Verify the built executable exists
function verifyBuild() {
  const executableName = process.platform === 'win32' ? 'kt_service.exe' : 'kt_service';
  const executablePath = path.join(PYTHON_SERVICE_DIR, 'kt_service', executableName);

  if (fs.existsSync(executablePath)) {
    const stats = fs.statSync(executablePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Executable verified: ${executablePath}`);
    console.log(`   Size: ${sizeMB} MB`);
    return true;
  } else {
    console.error('❌ Executable not found:', executablePath);
    return false;
  }
}

// Update electron-builder.config.js extraResources path if needed
function updateElectronBuilderConfig() {
  // The electron-builder.config.js already references ../dash-python-service/kt_service
  // Just verify the path is correct
  const configPath = path.join(FRONTEND_DIR, 'electron-builder.config.js');
  
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    if (content.includes('dash-python-service')) {
      console.log('✅ electron-builder.config.js references Python service correctly');
    } else {
      console.warn('⚠️  electron-builder.config.js may need to be updated to include Python service');
    }
  }
}

// Main function
function main() {
  console.log('');
  console.log('🔧 Python Service Pre-Build Script');
  console.log('====================================\n');

  // Check Python service directory
  checkPythonServiceDir();

  // Read build configuration
  const config = readBuildConfig();

  // Build Python service
  const buildSuccess = buildPythonService(config);

  if (!buildSuccess) {
    console.error('\n💥 Python service build failed!');
    process.exit(1);
  }

  // Verify build
  const verifySuccess = verifyBuild();

  if (!verifySuccess) {
    console.error('\n💥 Build verification failed!');
    process.exit(1);
  }

  // Check electron-builder config
  updateElectronBuilderConfig();

  console.log('\n🎉 Python service ready for Electron packaging!');
}

// Run
if (require.main === module) {
  main();
}

module.exports = {
  readBuildConfig,
  buildPythonService,
  verifyBuild
};
