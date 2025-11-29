const path = require('path');
const fs = require('fs');
const dashPackage = require('./apps/dash/package.json');

const platform = process.platform;

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 * 
 * IMPORTANT: This project uses pnpm workspaces with Vite bundling.
 * All dependencies are bundled by Vite, so we don't need node_modules collection.
 * We use beforeBuild hook to create a minimal package.json that bypasses dependency scanning.
 */
module.exports = {
  appId: 'com.kitchntab.app',
  productName: dashPackage.name,
  asar: false,
  npmRebuild: false, // Disable native dependency rebuild - not needed for this app
  nodeGypRebuild: false, // Disable node-gyp rebuild
  buildDependenciesFromSource: false, // Don't build dependencies from source
  detectUpdateChannel: false,
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
      main: 'apps/dash/dist-electron/main/index.js',
      dependencies: {}  // Empty - all bundled by Vite
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(minimalPackage, null, 2));
    console.log('✅ Created minimal package.json for electron-builder (pnpm workspace workaround)');
    
    return true;
  },
  
  // Restore original package.json after build
  afterPack: async (context) => {
    const tempPackagePath = path.join(context.appOutDir, '..', '..', 'package.json.backup');
    const packagePath = path.join(context.appOutDir, '..', '..', 'package.json');
    
    if (fs.existsSync(tempPackagePath)) {
      fs.copyFileSync(tempPackagePath, packagePath);
      fs.unlinkSync(tempPackagePath);
      console.log('✅ Restored original package.json');
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
  "apps/dash/dist/**",
  "apps/dash/dist-electron/**",
  "apps/dash/electron-config.prod.yaml",
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
    binaries: ['Contents/Resources/dash-python-service/kt_service']
  },
  linux: {
    icon: 'icons/png/',
    category: 'Office',
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
    priority: 'optional'
  },
 // Use asarUnpack for files that need to be accessed directly
 asarUnpack: [
    "sounds/**/*"
  ],
  
  extraResources: [
    // Python service executables - platform specific
    {
      from: path.resolve(__dirname, '../dash-python-service/kt_service'),
      to: 'python-service',
      filter: process.platform === 'win32' ? ['**/*.exe'] : ['**/kt_service']
    },
    // YAML configuration files
    {
      from: path.resolve(__dirname, '../dash-python-service'),
      to: 'python-service',
      filter: ['*.yaml']
    },
    // Icons for runtime use
    {
      from: path.resolve(__dirname, 'icons'),
      to: 'icons'
    },
    {
        from: path.resolve(__dirname, 'apps/dash/'),
        to: './',
        filter: ['*.yaml']
    },
  ],
  
};
