'use strict'

import { app, protocol, BrowserWindow, dialog, ipcMain, webContents } from 'electron'
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import log from 'electron-log'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null
// Background threads / windows
const backgroundWindows: BrowserWindow[] = []

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'fair4health', privileges: { secure: true, standard: true } }])

// Change heap size
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8096')

// Logger settings
log.transports.file.fileName = 'log.txt'
log.transports.console.level = false

// Stack of available background threads
const availableThreads: webContents[] = []

// Queue of tasks to be done
const taskQueue: any[] = []

// Hand the tasks out to waiting threads
function doWork () {
  while (availableThreads.length > 0 && taskQueue.length > 0) {
    const task = taskQueue.shift()
    availableThreads.shift().send(task[0], task[1])
  }
  // win.webContents.send('status', availableThreads.length, taskQueue.length)
}

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600, show: false, frame: false, useContentSize: true, webPreferences: { nodeIntegration: true } })
  // Make window fullscreen
  win.maximize()
  win.show()

  log.info('Electron - Initializing Window...')

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('fair4health')
    // Load the index.html when not in development
    win.loadURL('fair4health://./index.html')
  }

  win.webContents.on('crashed', () => {
    const options = {
      type: 'info',
      title: 'Renderer Process Crashed',
      message: 'This process has crashed.',
      buttons: ['Reload', 'Close']
    }
    log.error('Renderer Process Crashed')
    dialog.showMessageBox(options, (index) => {
      if (index === 0) win?.reload()
      else win?.destroy()
    })
  })

  win.on('closed', () => {
    win = null
    backgroundWindows.map((background: BrowserWindow | null) => {
      try {
        if (background && !background.isDestroyed()) background.destroy()
      } catch (err) {
        log.error(err)
      }
    })
  })

}

function createBgWindow (): BrowserWindow {
  let background = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true } })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    background.loadURL((process.env.WEBPACK_DEV_SERVER_URL as string) + '#background-engine')
  } else {
    background.loadURL('fair4health://./index.html/#background-engine')
  }

  background.webContents.on('crashed', () => {
    const options = {
      type: 'info',
      title: 'Background Process Crashed',
      message: 'This process has crashed.',
      buttons: ['Close']
    }
    log.error('Background Process Crashed')
    dialog.showMessageBox(options, (index) => {
      if (index === 0) background?.destroy()
    })
  })

  background.on('closed', () => {
    background = null
    if (win && !win.isDestroyed()) win.destroy()
  })

  return background

}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  // Create Main renderer window
  createWindow()

  // Create background threads
  for (let i = 0; i < 2; i++) {
    backgroundWindows.push(createBgWindow())
  }

  // Windows can talk to each other via main
  ipcMain.on('to-renderer', (event, channel, arg) => {
    win.webContents.send(channel, arg)
  })

  // Heavy processing done in the background threads
  // So UI and main threads remain responsive
  ipcMain.on('to-background', (event, channel, arg) => {
    taskQueue.push([channel, arg])
    doWork()
  })

  ipcMain.on('to-all-background', (event, channel, arg) => {
    backgroundWindows.map((bg: BrowserWindow) => {
      bg.webContents.send(channel, arg)
    })
  })

  ipcMain.on('ready', (event, arg) => {
    availableThreads.push(event.sender)
    doWork()
  })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
