const path = require('path');
const dashPackage = require('./apps/dash/package.json');

const platform = process.platform;

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'com.kitchntab.app',
  productName: dashPackage.name,
  asar: false,
  directories: {
    output: 'release/',
    buildResources: 'icons' 
  },
  files: [
   
  "electron-config.yaml",
  "resources/sounds/**/*",
  "apps/dash/dist/**",
  "apps/dash/dist-electron/**",
  "apps/dash/electron-config.prod.yaml"
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
   // icon: path.resolve(__dirname, './icons/png/'),
   icon: 'icons/png/',
    category: 'Office'
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
