'use strict'

import { app, protocol, BrowserWindow, dialog, ipcMain, webContents, MessageBoxReturnValue } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import log, {error} from 'electron-log'
import { IpcChannelUtil as ipcChannels } from './common/utils/ipc-channel-util'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import fs from 'fs'
import extract from 'extract-zip'
import {environment} from '@/common/environment';

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
// log.transports.console.level = false

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

async function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  // Make window fullscreen
  win.maximize()
  win.show()

  log.info('Electron - Initializing Window...')

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
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
    dialog.showMessageBox(options)
      .then((messageBoxReturnValue: MessageBoxReturnValue) => {
        if (messageBoxReturnValue.response === 0) win?.reload()
        else win?.destroy()
      })
      .catch(err => {
        log.error(err)
        win?.destroy()
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

function createBgWindow (id: number): BrowserWindow {
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
    dialog.showMessageBox(options)
      .then((messageBoxReturnValue: MessageBoxReturnValue) => {
        if (messageBoxReturnValue.response === 0) {
          background?.destroy()
        }
      })
      .catch(err => {
        log.error(err)
        background?.destroy()
      })
  })

  background.webContents.on('did-finish-load', () => {
    background.setTitle(`bg-${id}`)
  })

  background.on('closed', () => {
    background = null
    if (win && !win.isDestroyed()) win.destroy()
  })

  return background

}

async function extractFHIRDefinitionZip () {
  const definitionsFilePath = path.resolve(environment.FHIRDefinitionsZipPath)
  const parsedPath = path.parse(definitionsFilePath)
  const extractionFolderPath = path.join(app.getPath('userData'), parsedPath.name)
  log.info('Location of definitions-r4.zip -> ' + definitionsFilePath)
  log.info('Extracted definitions folder -> ' + extractionFolderPath)

  if (fs.existsSync(path.join(extractionFolderPath, 'profiles-resources.json'))) {
    // ZIP was previously extracted. Do not extract it again.
    log.info('Definitions ZIP file already extracted, skipping...')
    return
  }

  try {
    await extract(definitionsFilePath, {dir: extractionFolderPath})
    log.info(`Extraction of ${definitionsFilePath} completed`)
  } catch (e) {
    log.error(`Extraction error: ${e}`)
    throw e
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS, quits the app as Cmd + Q does
  app.quit()
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
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  try {
    await extractFHIRDefinitionZip()
  } catch (e) {
    const options = {
      type: 'info',
      title: 'FHIR Definitions Zip extraction failed.',
      message: 'Please consult the project\'s GitHub page.',
      buttons: ['Close']
    }
    dialog.showMessageBox(options)
      .then((messageBoxReturnValue: MessageBoxReturnValue) => {
        if (messageBoxReturnValue.response === 0) win?.reload()
        else win?.destroy()
      })
      .catch(err => {
        log.error(err)
        win?.destroy()
      })
    return
  }

  // Create Main renderer window
  createWindow()

  // Create background threads
  for (let i = 0; i < 2; i++) {
    backgroundWindows.push(createBgWindow(i))
  }

  // Windows can talk to each other via main
  ipcMain.on(ipcChannels.TO_RENDERER, (event, channel, arg) => {
    win.webContents.send(channel, arg)
  })

  // Heavy processing done in the background threads
  // So UI and main threads remain responsive
  ipcMain.on(ipcChannels.TO_BACKGROUND, (event, channel, arg) => {
    taskQueue.push([channel, arg])
    doWork()
  })

  ipcMain.on(ipcChannels.TO_ALL_BACKGROUND, (event, channel, arg) => {
    backgroundWindows.map((bg: BrowserWindow) => {
      if (channel === ipcChannels.Fhir.ABORT_VALIDATION) {
        taskQueue.length = 0
      }
      bg.webContents.send(channel, arg)
    })
  })

  ipcMain.on(ipcChannels.READY, (event, arg) => {
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
