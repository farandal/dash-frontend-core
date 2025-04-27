const path = require('path');
const dashPackage = require('./apps/dash/package.json');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'cl.pinoywok.app',
  productName: dashPackage.name,
  asar: false,
  directories: {
    output: 'release/'
  },
  files: [
    "electron/**/*",
    "electron-config.yaml",
    "resources/sounds",
    "apps/dash/dist/**",
    "apps/dash/dist-electron/**",
    "apps/dash/electron-config.prod.yaml"
  ],
  
  win: {
    icon: path.resolve(__dirname, './icons/win/icon.ico'),
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ]
  },
  
  // Move NSIS configuration to the root level
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: path.resolve(__dirname, './icons/win/icon.ico'),
    uninstallerIcon: path.resolve(__dirname, './icons/win/icon.ico'),
    installerHeaderIcon: path.resolve(__dirname, './icons/win/icon.ico'),

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
    icon: path.resolve(__dirname, './icons/mac/icon.icns'),
    category: 'public.app-category.business'
  },
  linux: {
    icon: path.resolve(__dirname, './icons/png/'),
    category: 'Office'
  },
  extraResources: [
    {
      from: path.resolve(__dirname, '../dash-python-service/service/'),
      to: 'python-service',
      filter: ['**/*.exe', '**/*.yaml']
    },
    {
        from: path.resolve(__dirname, 'apps/dash/electron-config.prod.yaml'),
        to: './',
      }
  ],
};
