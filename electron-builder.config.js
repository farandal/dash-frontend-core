const path = require('path');
const fs = require('fs');
const dashPackage = require('./apps/kitchntabs-app/package.json');

const platform = process.platform;

// Environment variable to use Buster-compatible binaries for Raspberry Pi
// Set USE_BUSTER_BINARIES=true when building for Debian Buster (GLIBC 2.28)
const useBusterBinaries = process.env.USE_BUSTER_BINARIES === 'true';

// Map electron-builder arch values to our build arch names
// electron-builder uses both string names AND numeric Arch enum values:
// Arch.ia32 = 0, Arch.x64 = 1, Arch.armv7l = 2, Arch.arm64 = 3, Arch.universal = 4
const ARCH_MAP = {
  // String names
  'x64': 'x64',
  'arm64': 'arm64',
  'armv7l': useBusterBinaries ? 'armv7l-buster' : 'armv7l',
  'ia32': 'x86',
  // Numeric Arch enum values from electron-builder
  0: 'x86',      // Arch.ia32
  1: 'x64',      // Arch.x64
  2: useBusterBinaries ? 'armv7l-buster' : 'armv7l',   // Arch.armv7l
  3: 'arm64',    // Arch.arm64
  4: 'universal' // Arch.universal (macOS only)
};

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 * 
 * IMPORTANT: This project uses pnpm workspaces with Vite bundling.
 * All dependencies are bundled by Vite, so we don't need node_modules collection.
 * We use beforeBuild hook to create a minimal package.json that bypasses dependency scanning.
 */
// -----------------------------------------------------------------------------
// Domain identity (env-overridable). Lets a different brand/domain rebrand the
// packaged app without editing this file (mirrors the de-branded core config),
// and keeps Linux window association consistent: the .desktop file name,
// StartupWMClass and the runtime WM_CLASS all derive from EXECUTABLE_NAME.
// -----------------------------------------------------------------------------
const APP_ID = process.env.APP_ID || 'com.kitchntab.app';
const PRODUCT_NAME = process.env.PRODUCT_NAME || 'kitchntabs';
const APP_NAME = process.env.APP_NAME || 'KitchenTabs';
// Linux binary name + WM_CLASS base — keep lowercase and space-free.
const EXECUTABLE_NAME = process.env.EXECUTABLE_NAME || PRODUCT_NAME;

module.exports = {
  appId: APP_ID,
  productName: PRODUCT_NAME,
  executableName: EXECUTABLE_NAME,  // This sets the binary name on Linux
  asar: true,
  // NOTE: asarUnpack is defined once, lower in this config (near deb/extraResources).
  // Python binaries, config.yaml, sounds and icons are delivered to the `resources/`
  // dir via extraResources (Mac/Win) and the afterPack hook (Linux) — i.e. OUTSIDE
  // app.asar — and are accessed at runtime via process.resourcesPath, so they do not
  // need to be unpacked from the archive.
  npmRebuild: false, // Disable native dependency rebuild - not needed for this app
  nodeGypRebuild: false, // Disable node-gyp rebuild
  buildDependenciesFromSource: false, // Don't build dependencies from source
  detectUpdateChannel: false,
  publish: {
    provider: 's3',
    bucket: 'kitchntabs-releases',
    region: 'us-east-2',
    path: 'releases/',
    acl: 'private',
    timeout: 600000 // 10 minutes — needed for 235MB .deb file upload
  },
  // Explicit electron version - required when node_modules is hidden during build
  electronVersion: '36.7.4',
  
  // CRITICAL: Hook to bypass node_modules collection for pnpm workspaces
  // Since Vite bundles everything, we create a minimal package.json before packing
  beforeBuild: async (context) => {
    // Create a minimal package.json that tells electron-builder there are no dependencies
    const tempPackagePath = path.join(context.appDir, 'package.json.backup');
    const packagePath = path.join(context.appDir, 'package.json');
    
    // Backup original package.json
    if (fs.existsSync(packagePath)) {
      fs.copyFileSync(packagePath, tempPackagePath);
    }
    
    // Create minimal package.json with no dependencies (Vite bundles everything)
    const minimalPackage = {
      name: dashPackage.name,
      version: dashPackage.version,
      main: 'apps/kitchntabs-app/dist-electron/main/index.js',
      dependencies: {}  // Empty - all bundled by Vite
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(minimalPackage, null, 2));
    console.log('✅ Created minimal package.json for electron-builder (pnpm workspace workaround)');
    
    return true;
  },
  
  // Copy architecture-specific Python binary and restore package.json after build
  afterPack: async (context) => {
    const tempPackagePath = path.join(context.appOutDir, '..', '..', 'package.json.backup');
    const packagePath = path.join(context.appOutDir, '..', '..', 'package.json');
    
    // Restore original package.json
    if (fs.existsSync(tempPackagePath)) {
      fs.copyFileSync(tempPackagePath, packagePath);
      fs.unlinkSync(tempPackagePath);
      console.log('✅ Restored original package.json');
    }
    
    // For Linux builds, copy the architecture-specific Python binaries
    if (context.electronPlatformName === 'linux') {
      const arch = context.arch;
      const mappedArch = ARCH_MAP[arch];
      
      if (!mappedArch) {
        console.error(`   ❌ Unknown architecture: ${arch} (type: ${typeof arch})`);
        console.error(`   Known architectures: ${Object.keys(ARCH_MAP).join(', ')}`);
        return true;
      }
      
      console.log(`🐍 Setting up Python services for Linux ${mappedArch} (arch=${arch})...`);
      if (useBusterBinaries && mappedArch.includes('buster')) {
        console.log(`   🍇 Using Buster-compatible binaries (GLIBC 2.28)`);
      }
      
      // Destination in packaged app
      const destDir = path.join(context.appOutDir, 'resources', 'python-service');
      
      // Ensure destination directory exists
      fs.mkdirSync(destDir, { recursive: true });
      
      // Services to copy
      const services = ['kt_service', 'print_service', 'tts_service'];
      
      for (const service of services) {
        // Source: Docker-built binary for this architecture
        const dockerBuildPath = path.resolve(__dirname, `../dash-python-service/kt_service_builds/${mappedArch}/${service}`);
        // Fallback: Native build (only works if built on same arch)
        const nativeBuildPath = path.resolve(__dirname, `../dash-python-service/kt_service/${service}`);
        
        const destPath = path.join(destDir, service);
        
        // Try Docker build first, then fallback to native build
        let sourcePath = null;
        if (fs.existsSync(dockerBuildPath)) {
          sourcePath = dockerBuildPath;
          console.log(`   ✅ ${service}: Using Docker-built binary for ${mappedArch}`);
        } else if (fs.existsSync(nativeBuildPath)) {
          sourcePath = nativeBuildPath;
          console.log(`   ⚠️  ${service}: Using native build (may not work on ${mappedArch})`);
        } else {
          console.error(`   ❌ ${service}: No binary found for ${mappedArch}!`);
          console.error(`      💡 Run 'cd ../dash-python-service && npm run build:docker:${mappedArch}'`);
          continue;
        }
        
        if (sourcePath) {
          fs.copyFileSync(sourcePath, destPath);
          fs.chmodSync(destPath, '755');
          console.log(`   📦 ${service}: Copied to: ${destPath}`);
        }
      }
    }
    
    return true;
  },
  
  directories: {
    output: 'release/',
    buildResources: 'icons' 
  },
  // Tell electron-builder to not collect node_modules (we bundle everything with Vite)
  files: [
  "electron-config.yaml",
  "resources/sounds/**/*",
  "apps/kitchntabs-app/dist/**",
  "apps/kitchntabs-app/dist-electron/**",
  "apps/kitchntabs-app/electron-config.prod.yaml",
  // Exclude all node_modules since Vite bundles everything
  "!**/node_modules/**",
  "!**/node_modules",
  "!**/packages/**",
  "!**/node_modules/.pnpm/**",
  "!**/*.ts",
  "!**/*.map",
  "!package-lock.json",
  "!pnpm-lock.yaml",
  "!yarn.lock"
  ],
  
  win: {
    icon: path.resolve(__dirname, './icons/win/icon.ico'),
    target: [
      ...(platform === 'win32' ? [{
        target: 'nsis',
        arch: ['x64']
      }] : []),
      ...(platform === 'darwin' ? [{
        target: 'dmg',
        arch: ['x64', 'arm64']
      }] : []),
      /*{
        target: 'zip',
        arch: ['x64', 'arm64']
      }*/
    ]
  },
  
  // Move NSIS configuration to the root level
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
   //installerIcon: path.resolve(__dirname, './icons/win/icon.ico'),
    //uninstallerIcon: path.resolve(__dirname, './icons/win/icon.ico'),
    //installerHeaderIcon: path.resolve(__dirname, './icons/win/icon.ico'),
    installerIcon: 'icons/win/icon.ico', // Simplified path
    uninstallerIcon: 'icons/win/icon.ico', // Simplified path
    installerHeaderIcon: 'icons/win/icon.ico', // Simplified path
      // Add these properties for appearance customization
      differentialPackage: false,
      
      // Installer appearance
      artifactName: "${productName}-${version}.${ext}",
      shortcutName: "${productName}",
      uninstallDisplayName: "${productName} ${version}",
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      
      // Installation settings
      perMachine: true,          // Install for all users if set to true
      
    include: path.resolve(__dirname, './installer.nsh')
  },
  
  mac: {
    icon: 'icons/mac/icon.icns',
    category: 'public.app-category.business',
    target: [
      {
        target: 'zip',
        arch: ['arm64', 'x64']  // Support both architectures
      }
    ],
    // Enable hardened runtime (required for notarization)
    hardenedRuntime: true,
    // Disable Gatekeeper assessment (for development)
    gatekeeperAssess: false,
    // Add entitlements
    entitlements: 'entitlements.mac.plist',
    entitlementsInherit: 'entitlements.mac.plist',
    // Disable notarization for now (enable later with proper credentials)
    notarize: false,
    // Allow executing binaries from Resources folder
    binaries: [
      'Contents/Resources/python-service/kt_service',
      'Contents/Resources/python-service/print_service',
      'Contents/Resources/python-service/tts_service'
    ]
  },
  linux: {
    icon: path.resolve(__dirname, 'icons/png'),
    category: 'Office',
    executableName: EXECUTABLE_NAME,
    // Sync the generated .desktop file name + StartupWMClass with Electron's
    // runtime WM_CLASS so desktop environments associate the running window
    // with its launcher icon (taskbar grouping / dock icon).
    syncDesktopName: true,
    desktop: {
      entry: {
        Name: APP_NAME,
        Comment: `${APP_NAME} POS Terminal`,
        Categories: 'Office;Finance;',
        Keywords: 'pos;kitchen;restaurant;orders;',
        StartupWMClass: EXECUTABLE_NAME,
        Terminal: 'false'
      }
    },
    target: [
      {
        target: 'deb',
        arch: ['x64', 'armv7l', 'arm64']  // Support x64, Raspberry Pi 32-bit and 64-bit
      },
      {
        target: 'AppImage',
        arch: ['x64', 'armv7l', 'arm64']
      }
    ],
    // Debian package specific settings
    artifactName: '${productName}-${version}-${arch}.${ext}'
  },
  deb: {
    depends: ['libgtk-3-0', 'libnotify4', 'libnss3', 'libxss1', 'libxtst6', 'xdg-utils', 'libatspi2.0-0', 'libuuid1', 'libsecret-1-0'],
    category: 'Office',
    priority: 'optional',
    // Create symlink so 'kitchntabs' command works from terminal
    afterInstall: 'scripts/after-install.sh',
    afterRemove: 'scripts/after-remove.sh'
  },
 // Use asarUnpack for files that need to be accessed directly
 asarUnpack: [
    "sounds/**/*"
  ],
  
  extraResources: [
    // Python service executables - for macOS and Windows
    // Linux uses afterPack hook for architecture-specific binaries
    // All services: kt_service, print_service, tts_service
    ...(process.platform === 'win32' ? [
      {
        from: path.resolve(__dirname, '../dash-python-service/kt_service'),
        to: 'python-service',
        filter: ['**/*.exe']  // Copies kt_service.exe, print_service.exe, tts_service.exe
      }
    ] : process.platform === 'darwin' ? [
      {
        from: path.resolve(__dirname, '../dash-python-service/kt_service'),
        to: 'python-service',
        filter: ['**/kt_service', '**/print_service', '**/tts_service']  // All service binaries
      }
    ] : [
      // Linux: Placeholder - actual binary copied in afterPack hook
      // This ensures the directory structure is created
    ]),
    // YAML configuration file - single config.yaml for all platforms
    // The correct config is prepared by build-python-service.js based on CUSTOM_MODE
    // Source config (e.g., config.kitchntabs.ngrok.yaml) is copied to apps/kitchntabs-app/config.yaml
    {
      from: path.resolve(__dirname, 'apps/kitchntabs-app/config.yaml'),
      to: 'config.yaml'
    },
    // Icons for runtime use
    {
      from: path.resolve(__dirname, 'icons'),
      to: 'icons'
    },
    // Sound files for notifications and welcome messages
    {
      from: path.resolve(__dirname, 'apps/kitchntabs-app/electron/assets'),
      to: 'sounds',
      filter: ['*.mp3', '*.wav', '*.ogg']
    },
  ],
  
};
