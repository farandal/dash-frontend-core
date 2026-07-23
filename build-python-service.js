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
      customMode: 'dash.prod',
      platform: process.platform
    };
  }

  try {
    const config = JSON.parse(fs.readFileSync(BUILD_CONFIG_PATH, 'utf8'));
    return {
      customMode: config.customMode || 'dash.prod',
      platform: config.platform || process.platform,
      mode: config.mode || 'production'
    };
  } catch (error) {
    console.error('❌ Error reading build_config.json:', error.message);
    return {
      customMode: 'dash.prod',
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

// Prepare Electron config file based on CUSTOM_MODE
// Uses the frontend config file (config.{CUSTOM_MODE}.yaml) as the source
// This ensures the Python service uses the correct API endpoints for the build
function prepareElectronConfigFiles(customMode) {
  console.log('\n📋 Preparing Electron config file...');

  // Check both dash and dash-app directories
  let appsDir = path.join(FRONTEND_DIR, 'apps', 'dash-app');
  if (!fs.existsSync(appsDir)) {
    appsDir = path.join(FRONTEND_DIR, 'apps', 'dash');
  }
  
  // Primary: Use frontend config file matching CUSTOM_MODE exactly
  // e.g., CUSTOM_MODE=dash.development → config.dash.development.yaml
  // e.g., CUSTOM_MODE=dash.production → config.dash.production.yaml
  let sourceConfigName = customMode ? `config.${customMode}.yaml` : null;
  let sourceConfig = sourceConfigName ? path.join(appsDir, sourceConfigName) : null;
  
  // Check if the exact CUSTOM_MODE config exists in frontend
  if (sourceConfig && fs.existsSync(sourceConfig)) {
    console.log(`   ✅ Found frontend config: ${sourceConfigName}`);
  } else {
    // Check if the exact CUSTOM_MODE config exists in python service (before legacy fallback)
    const pythonConfigDir = PYTHON_SERVICE_DIR;
    const exactPythonConfig = sourceConfigName ? path.join(pythonConfigDir, sourceConfigName) : null;

    if (exactPythonConfig && fs.existsSync(exactPythonConfig)) {
      console.log(`   ✅ Found config in Python service: ${sourceConfigName}`);
      sourceConfig = exactPythonConfig;
    } else {
      // Fallback: Try legacy naming from Python service for backwards compatibility
      console.log(`   ⚠️  Frontend config not found: ${sourceConfigName || 'undefined'}`);
      console.log(`   Trying legacy Python service configs...`);
      
      if (customMode && customMode.includes('dash')) {
        if (customMode.includes('development') || customMode.includes('ngrok')) {
          sourceConfigName = 'config.dash.ngrok.yaml';
        } else {
          sourceConfigName = 'config.dash.prod.yaml';
        }
      } else if (customMode && customMode.includes('pinoywok')) {
        if (customMode.includes('ngrok') || customMode.includes('development')) {
          sourceConfigName = 'config.dev.yaml';
        } else {
          sourceConfigName = 'config.prod.yaml';
        }
      } else {
        sourceConfigName = 'config.prod.yaml';
      }
      
      sourceConfig = path.join(pythonConfigDir, sourceConfigName);
      
      if (!fs.existsSync(sourceConfig)) {
        console.warn(`   ⚠️  Legacy config not found either: ${sourceConfigName}`);
        console.warn(`   Skipping config preparation.`);
        return;
      }
      
      console.log(`   📂 Using legacy config from Python service: ${sourceConfigName}`);
    }
  }
  
  // Copy to multiple targets:
  // 1. Electron packaging (apps/dash/config.yaml)
  // 2. Python service build (dash-python-service/config.{CUSTOM_MODE}.yaml)
  const electronTarget = path.join(appsDir, 'config.yaml');
  const pythonServiceTarget = path.join(PYTHON_SERVICE_DIR, sourceConfigName);

  console.log(`   Source: ${sourceConfigName}`);
  console.log(`   Electron Target: ${path.join(appsDir, 'config.yaml')}`);
  console.log(`   Python Service Target: ${pythonServiceTarget}`);

  // Copy the source config to both targets
  fs.copyFileSync(sourceConfig, electronTarget);
  fs.copyFileSync(sourceConfig, pythonServiceTarget);

  console.log(`   ✅ Copied ${sourceConfigName} → config.yaml (Electron)`);
  console.log(`   ✅ Copied ${sourceConfigName} → Python service`);
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

// Verify the built executable exists (all services)
function verifyBuild() {
  const exeExt = process.platform === 'win32' ? '.exe' : '';
  const requiredServices = ['kt_service', 'print_service', 'tts_service'];
  const serviceDir = path.join(PYTHON_SERVICE_DIR, 'kt_service');
  
  let allVerified = true;
  let totalSize = 0;
  const missingServices = [];
  
  for (const service of requiredServices) {
    const executablePath = path.join(serviceDir, service + exeExt);
    if (fs.existsSync(executablePath)) {
      const stats = fs.statSync(executablePath);
      totalSize += stats.size;
    } else {
      missingServices.push(service);
      allVerified = false;
    }
  }
  
  if (allVerified) {
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`✅ Native executables verified: ${serviceDir}`);
    console.log(`   All ${requiredServices.length} services present (Total: ${sizeMB} MB)`);
    return true;
  } else {
    console.warn('⚠️  Some native executables not found:');
    missingServices.forEach(s => console.warn(`     - ${s}`));
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



/**
 * Generate a hash of the Python service source files
 * @returns {string} SHA256 hash
 */
function generateSourceHash() {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  
  // Files and directories to include in the hash
  const includePaths = [
    'src',
    'service',
    'requirements.txt',
    'kt_service.spec',
    'print_service.spec',
    'tts_service.spec',
    'ws_service.spec',
    'build-service.js',
    'build-docker.js',
    'package.json'
  ];
  
  function processPath(relativePath) {
    const fullPath = path.join(PYTHON_SERVICE_DIR, relativePath);
    
    if (!fs.existsSync(fullPath)) return;
    
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(fullPath);
      // Sort to ensure consistent order
      files.sort().forEach(file => {
        // Skip hidden files and __pycache__
        if (file.startsWith('.') || file === '__pycache__' || file.endsWith('.pyc')) return;
        processPath(path.join(relativePath, file));
      });
    } else {
      // Update hash with file path and content
      hash.update(relativePath);
      hash.update(fs.readFileSync(fullPath));
    }
  }
  
  includePaths.forEach(p => processPath(p));
  
  return hash.digest('hex');
}

const HASH_FILE = path.join(PYTHON_SERVICE_DIR, '.build_hash');

function getStoredHash() {
  if (fs.existsSync(HASH_FILE)) {
    return fs.readFileSync(HASH_FILE, 'utf8').trim();
  }
  return null;
}

function saveHash(hash) {
  fs.writeFileSync(HASH_FILE, hash);
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
  
  // Only build Linux ARM if explicitly requested via args (not just because platform is 'electron')
  // Platform 'electron' is generic - actual Linux ARM builds need explicit --linux, --armv7l, --arm64, or deb flags
  const isLinuxBuild = config.platform === 'linux';
  
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

  // Check for changes
  const currentHash = generateSourceHash();
  const storedHash = getStoredHash();
  let skipBuild = false;

  if (!forceRebuild && currentHash === storedHash) {
    console.log('🔍 Checking source changes...');
    console.log('   ✅ No changes detected in Python service source.');
    
    // Verify artifacts exist before deciding to skip
    let artifactsExist = true;
    
    if (needsLinuxArm || isLinuxBuild) {
       if (!verifyDockerBuilds(LINUX_CROSS_COMPILE_ARCHS)) artifactsExist = false;
    }
    
    if (process.platform !== 'linux' || process.arch === 'x64') {
       if (!verifyBuild()) artifactsExist = false;
    }
    
    if (artifactsExist) {
        skipBuild = true;
        console.log('   ⏩ Skipping rebuild (artifacts verify successfully).');
    } else {
        console.log('   ⚠️  Artifacts missing, forcing rebuild despite no source changes.');
    }
  } else {
      if (forceRebuild) console.log('   🔄 Force rebuild enabled.');
      else console.log('   📝 Source changes detected (or first build). Rebuilding...');
  }
  
  // Prepare Electron config files based on CUSTOM_MODE
  // This ensures the packaged app uses the correct network settings
  // Always do this even if skipping python build, as frontend config might have changed
  prepareElectronConfigFiles(config.customMode);

  let success = true;

  if (!skipBuild) {
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
      
      // Save hash only if successful
      if (success) {
          saveHash(currentHash);
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

