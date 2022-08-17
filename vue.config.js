module.exports = {
  pluginOptions: {
    quasar: {
      treeShake: true
    },
    electronBuilder: {
      externals: ['typeorm', 'pg'],
      appId: 'fair4health-data-curation-tool',
      customFileProtocol: 'fair4health://./',
      mainProcessFile: 'src/electron-main.ts',
      nodeIntegration: true,
      builderOptions: {
        mac: {
          icon: './dist_electron/bundled/icons/icon.icns'
        },
        win: {
          icon: './dist_electron/bundled/icons/icon.ico'
        },
        linux: {
          icon: './dist_electron/bundled/icons',
          target: ['AppImage', 'deb'],
          category: 'Office'
        },
        nsis: {
          oneClick: false,
          perMachine: true,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true
        },
        extraFiles: {
          from: 'fhir-definitions',
          to: 'fhir-definitions',
          filter: ["**/*"]
        }
      }
    }
  },
  transpileDependencies: [
    /[\\\/]node_modules[\\\/]quasar[\\\/]/
  ]
}
