/**
 * electron-builder configuration
 * Produces a Windows NSIS installer (.exe) and a portable .exe
 */
module.exports = {
  appId: 'com.windowcomputeruse.app',
  productName: 'WindowComputerUse',
  copyright: 'Copyright © 2025',
  directories: {
    output: 'release',
    buildResources: 'build',
  },
  files: [
    'dist/**',
    '!dist/**/*.map',
  ],
  win: {
    target: [
      { target: 'nsis', arch: ['x64'] },
      { target: 'portable', arch: ['x64'] },
    ],
    icon: 'build/icon.ico',
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'WindowComputerUse',
  },
  publish: null,
};
