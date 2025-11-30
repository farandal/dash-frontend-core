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
 * 
 * For Linux ARM builds (armv7l, arm64), it uses Docker cross-compilation.
 * For native platform builds (macOS, Windows, Linux x64), it uses PyInstaller directly.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = __dirname;
const PYTHON_SERVICE_DIR = path.join(FRONTEND_DIR, '..', 'dash-python-service');
const BUILD_CONFIG_PATH = path.join(FRONTEND_DIR, 'build_config.json');
const DOCKER_BUILDS_DIR = path.join(PYTHON_SERVICE_DIR, 'kt_service_builds');

// Environment variable for Buster builds (Raspberry Pi with GLIBC 2.28)
const useBusterBinaries = process.env.USE_BUSTER_BINARIES === 'true';

// Linux architectures that require Docker cross-compilation
// When USE_BUSTER_BINARIES=true, use armv7l-buster instead of armv7l
const LINUX_CROSS_COMPILE_ARCHS = useBusterBinaries 
  ? ['armv7l-buster', 'arm64'] 
  : ['armv7l', 'arm64'];

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

// Map CUSTOM_MODE to Docker config argument
function getDockerConfigArg(customMode) {
  if (customMode && customMode.includes('ngrok')) {
    return 'ngrok';
  }
  return 'prod';
}

// Prepare Electron config files based on CUSTOM_MODE
// This copies the correct config to config.prod.mac.yaml (or config.prod.yaml)
// so the packaged app uses the right configuration
function prepareElectronConfigFiles(customMode) {
  console.log('\n📋 Preparing Electron config files...');
  
  const appsDir = path.join(FRONTEND_DIR, 'apps', 'dash');
  const pythonConfigDir = PYTHON_SERVICE_DIR;
  
  // Determine source config based on CUSTOM_MODE
  let sourceConfigName;
  if (customMode && customMode.includes('kitchntabs')) {
    if (customMode.includes('ngrok')) {
      sourceConfigName = 'config.kitchntabs.ngrok.yaml';
    } else {
      sourceConfigName = 'config.kitchntabs.prod.yaml';
    }
  } else if (customMode && customMode.includes('pinoywok')) {
    if (customMode.includes('ngrok')) {
      sourceConfigName = 'config.dev.yaml';  // pinoywok ngrok uses dev config
    } else {
      sourceConfigName = 'config.prod.yaml';
    }
  } else {
    sourceConfigName = 'config.prod.yaml';
  }
  
  // Source from dash-python-service (has correct network settings)
  const sourceConfig = path.join(pythonConfigDir, sourceConfigName);
  
  // Target filenames for the packaged app (what Electron main/index.ts looks for)
  const targetConfigs = [
    { name: 'config.prod.mac.yaml', platform: 'darwin' },
    { name: 'config.prod.yaml', platform: 'all' }
  ];
  
  if (!fs.existsSync(sourceConfig)) {
    console.warn(`   ⚠️  Source config not found: ${sourceConfigName}`);
    console.warn(`   Skipping config preparation.`);
    return;
  }
  
  console.log(`   Source: ${sourceConfigName}`);
  
  // Read source config
  const sourceContent = fs.readFileSync(sourceConfig, 'utf8');
  
  // Read and merge with frontend config (to get frontend-specific paths)
  for (const target of targetConfigs) {
    const targetPath = path.join(appsDir, target.name);
    
    // Read existing target config to preserve frontend-specific settings
    let targetContent = '';
    if (fs.existsSync(targetPath)) {
      targetContent = fs.readFileSync(targetPath, 'utf8');
    }
    
    // Parse both configs
    const yaml = require('js-yaml');
    let sourceData, targetData;
    
    try {
      sourceData = yaml.load(sourceContent) || {};
      targetData = yaml.load(targetContent) || {};
    } catch (e) {
      console.warn(`   ⚠️  Error parsing YAML: ${e.message}`);
      continue;
    }
    
    // Merge: source network settings + target path settings
    const mergedData = {
      ...targetData,  // Start with existing target (has paths)
      // Override network settings from source
      APP_NAME: sourceData.APP_NAME || targetData.APP_NAME,
      WS_HOST: sourceData.WS_HOST,
      WS_PORT: sourceData.WS_PORT,
      WS_SCHEME: sourceData.WS_SCHEME,
      API_HOST: sourceData.API_HOST,
      API_PORT: sourceData.API_PORT,
      API_SCHEME: sourceData.API_SCHEME,
      APP: sourceData.APP || targetData.APP,
      AUTH_ENDPOINT: sourceData.AUTH_ENDPOINT || targetData.AUTH_ENDPOINT,
      // Speech settings
      SPEECH_WELCOME_MESSAGE: sourceData.SPEECH_WELCOME_MESSAGE || targetData.SPEECH_WELCOME_MESSAGE,
      SPEECH_CONNECTED_MESSAGE: sourceData.SPEECH_CONNECTED_MESSAGE || targetData.SPEECH_CONNECTED_MESSAGE,
      SPEECH_DISCONNECTED_MESSAGE: sourceData.SPEECH_DISCONNECTED_MESSAGE || targetData.SPEECH_DISCONNECTED_MESSAGE,
      SPEECH_LANGUAGE: sourceData.SPEECH_LANGUAGE || targetData.SPEECH_LANGUAGE,
    };
    
    // Write merged config
    const outputContent = yaml.dump(mergedData, { 
      lineWidth: -1,  // Don't wrap lines
      quotingType: '"',
      forceQuotes: false
    });
    
    fs.writeFileSync(targetPath, outputContent);
    console.log(`   ✅ Updated: ${target.name}`);
  }
  
  console.log('   Config files prepared for Electron packaging.');
}

// Check if Python service directory exists
function checkPythonServiceDir() {
  if (!fs.existsSync(PYTHON_SERVICE_DIR)) {
    console.error('❌ Python service directory not found:', PYTHON_SERVICE_DIR);
    console.error('   Expected location: ../dash-python-service');
    process.exit(1);
  }
  
  console.log('✅ Python service directory found');
  return true;
}

// Check if Docker builds exist for required architectures
// Returns { arch: { complete: boolean, missing: string[] } }
function checkDockerBuilds(archs, configArg) {
  const results = {};
  const requiredServices = ['kt_service', 'print_service', 'tts_service'];
  
  for (const arch of archs) {
    const archDir = path.join(DOCKER_BUILDS_DIR, arch);
    const missingServices = [];
    let totalSize = 0;
    
    for (const service of requiredServices) {
      const binaryPath = path.join(archDir, service);
      if (fs.existsSync(binaryPath)) {
        const stats = fs.statSync(binaryPath);
        totalSize += stats.size;
      } else {
        missingServices.push(service);
      }
    }
    
    results[arch] = {
      complete: missingServices.length === 0,
      missing: missingServices,
      totalSize: totalSize
    };
    
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    if (results[arch].complete) {
      console.log(`   ✅ ${arch}: ${sizeMB} MB (all ${requiredServices.length} services)`);
    } else if (totalSize > 0) {
      console.log(`   ⚠️  ${arch}: ${sizeMB} MB (missing: ${missingServices.join(', ')})`);
    } else {
      console.log(`   ❌ ${arch}: Not found`);
    }
  }
  
  return results;
}

// Build Docker binaries for Linux ARM
function buildDockerBinaries(archs, configArg) {
  console.log('🐳 Building Docker binaries for Linux ARM...');
  console.log(`   Architectures: ${archs.join(', ')}`);
  console.log(`   Config: ${configArg}`);
  console.log('');
  
  const dockerBuildScript = path.join(PYTHON_SERVICE_DIR, 'build-docker.js');
  
  if (!fs.existsSync(dockerBuildScript)) {
    console.error('❌ Docker build script not found:', dockerBuildScript);
    console.error('   Run this from dash-python-service first:');
    console.error('   node build-docker.js --arch=armv7l --config=ngrok');
    return false;
  }
  
  try {
    // Build each architecture
    for (const arch of archs) {
      console.log(`\n🏗️  Building ${arch}...`);
      execSync(`node build-docker.js --arch=${arch} --config=${configArg}`, {
        cwd: PYTHON_SERVICE_DIR,
        stdio: 'inherit'
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Docker build failed:', error.message);
    return false;
  }
}

// Build the Python service natively (for current platform)
function buildNativePythonService(config) {
  console.log('🐍 Building Python Service (Native)');
  console.log('====================================');
  console.log(`   Custom Mode: ${config.customMode}`);
  console.log(`   Platform: ${config.platform}`);
  console.log(`   Mode: ${config.mode}`);
  console.log('');

  const buildScript = path.join(PYTHON_SERVICE_DIR, 'build-service.js');
  
  if (!fs.existsSync(buildScript)) {
    console.error('❌ Python service build script not found:', buildScript);
    return false;
  }

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

    console.log('✅ Native Python service build completed');
    return true;
  } catch (error) {
    console.error('❌ Native Python service build failed:', error.message);
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
    console.log(`✅ Native executable verified: ${executablePath}`);
    console.log(`   Size: ${sizeMB} MB`);
    return true;
  } else {
    console.warn('⚠️  Native executable not found:', executablePath);
    console.warn('   This is OK if only building for Linux ARM (Docker builds)');
    return false;
  }
}

// Verify Docker builds exist (all services)
function verifyDockerBuilds(archs) {
  let allComplete = true;
  const requiredServices = ['kt_service', 'print_service', 'tts_service'];
  
  for (const arch of archs) {
    const archDir = path.join(DOCKER_BUILDS_DIR, arch);
    let archComplete = true;
    let totalSize = 0;
    
    for (const service of requiredServices) {
      const binaryPath = path.join(archDir, service);
      if (fs.existsSync(binaryPath)) {
        const stats = fs.statSync(binaryPath);
        totalSize += stats.size;
      } else {
        archComplete = false;
      }
    }
    
    if (archComplete) {
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`✅ Docker build verified (${arch}): ${sizeMB} MB (${requiredServices.length} services)`);
    } else {
      console.error(`❌ Docker build incomplete: ${arch}`);
      allComplete = false;
    }
  }
  
  return allComplete;
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
  const configArg = getDockerConfigArg(config.customMode);

  // Detect if we need Linux ARM builds
  // Check command line args for --linux, --armv7l, --arm64, --force
  const args = process.argv.slice(2);
  const forceRebuild = args.includes('--force') || process.env.FORCE_PYTHON_REBUILD === 'true';
  const needsLinuxArm = args.some(arg => 
    arg.includes('--linux') || 
    arg.includes('--armv7l') || 
    arg.includes('--arm64') ||
    arg.includes('deb') ||
    arg.includes('AppImage')
  );
  
  // Also check if electron-builder will be called with linux targets
  const isLinuxBuild = config.platform === 'linux' || config.platform === 'electron';
  
  console.log(`📋 Configuration:`);
  console.log(`   Custom Mode: ${config.customMode}`);
  console.log(`   Config Arg: ${configArg}`);
  console.log(`   Platform: ${config.platform}`);
  console.log(`   Needs Linux ARM: ${needsLinuxArm || isLinuxBuild}`);
  console.log(`   Force Rebuild: ${forceRebuild}`);
  console.log(`   Use Buster Binaries: ${useBusterBinaries}`);
  if (useBusterBinaries) {
    console.log(`   🍇 Building for Debian Buster (GLIBC 2.28)`);
  }
  console.log('');

  // Prepare Electron config files based on CUSTOM_MODE
  // This ensures the packaged app uses the correct network settings
  prepareElectronConfigFiles(config.customMode);

  let success = true;

  // For Linux ARM builds, check/build Docker binaries
  if (needsLinuxArm || isLinuxBuild) {
    console.log('🐧 Linux ARM build detected - checking Docker builds...\n');
    
    const dockerBuildsStatus = checkDockerBuilds(LINUX_CROSS_COMPILE_ARCHS, configArg);
    
    // Find architectures that need rebuilding (missing, incomplete, or force rebuild)
    const archsNeedingBuild = forceRebuild 
      ? LINUX_CROSS_COMPILE_ARCHS 
      : LINUX_CROSS_COMPILE_ARCHS.filter(arch => !dockerBuildsStatus[arch].complete);
    
    if (archsNeedingBuild.length > 0) {
      if (forceRebuild) {
        console.log(`\n🔄 Force rebuild requested for: ${archsNeedingBuild.join(', ')}`);
      } else {
        console.log(`\n⚠️  Incomplete Docker builds for: ${archsNeedingBuild.join(', ')}`);
        archsNeedingBuild.forEach(arch => {
          const status = dockerBuildsStatus[arch];
          if (status.missing.length > 0) {
            console.log(`   ${arch} missing: ${status.missing.join(', ')}`);
          }
        });
      }
      console.log('   Building with Docker (this may take 10-15 minutes per architecture)...\n');
      
      const dockerSuccess = buildDockerBinaries(archsNeedingBuild, configArg);
      
      if (!dockerSuccess) {
        console.error('\n❌ Docker builds failed!');
        console.error('   You can build manually with:');
        archsNeedingBuild.forEach(arch => {
          console.error(`   cd ../dash-python-service && pnpm build:docker:${arch}:${configArg}`);
        });
        // Don't exit - continue with native build for current platform
        success = false;
      }
    } else {
      console.log('\n✅ All Docker builds are up to date!');
    }
    
    // Verify Docker builds
    const dockerVerified = verifyDockerBuilds(LINUX_CROSS_COMPILE_ARCHS);
    if (!dockerVerified) {
      console.warn('\n⚠️  Some Docker builds are missing. Linux ARM packages may fail.');
    }
    console.log('');
  }

  // Always build native binary for current platform (macOS, Windows, or Linux x64)
  // This is used for local development and native platform releases
  if (process.platform !== 'linux' || process.arch === 'x64') {
    console.log('🖥️  Building native binary for current platform...\n');
    
    const nativeSuccess = buildNativePythonService(config);

    if (!nativeSuccess) {
      console.error('\n💥 Native Python service build failed!');
      // Don't exit if we have Docker builds for Linux
      if (!needsLinuxArm && !isLinuxBuild) {
        process.exit(1);
      }
      success = false;
    } else {
      // Verify native build
      verifyBuild();
    }
  }

  // Check electron-builder config
  updateElectronBuilderConfig();

  if (success) {
    console.log('\n🎉 Python service ready for Electron packaging!');
  } else {
    console.log('\n⚠️  Some builds may have issues. Check logs above.');
  }
}

// Run
if (require.main === module) {
  main();
}

module.exports = {
  readBuildConfig,
  buildNativePythonService,
  buildDockerBinaries,
  verifyBuild,
  verifyDockerBuilds,
  checkDockerBuilds,
  getDockerConfigArg
};
