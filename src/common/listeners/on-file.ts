import * as Excel from 'xlsx'
import fs from 'fs'
import log from 'electron-log'
import { ipcMain, dialog, BrowserWindow } from 'electron'
import { cellType } from '../model/data-table'
import { workbookMap } from '../model/workbook'

/**
 * Browses files with extensions [xl*, csv] and sends back their paths as a list
 */
ipcMain.on('browse-file', (event) => {
  dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ extensions: ['xl*', 'csv'], name: 'Excel or CSV' }]
  }, (files) => {
    if (files) {
      log.info('Browse file - ' + files)
      event.sender.send('selected-directory', files)
    } else event.sender.send('selected-directory', undefined)
  })
})

/**
 * Reads file by path and sends back names of sheets in it
 */
ipcMain.on('read-file', (event, path) => {
  if (path) {
    let workbook: Excel.WorkBook
    try {
      workbook = Excel.readFile(path, {type: 'binary', cellDates: true})
    } catch (e) {
      log.error(`Cannot read file ${path}`)
      event.sender.send('worksheets-ready', undefined)
      return
    }
    workbookMap.set(path, workbook)
    log.info('Read file ' + path)
    event.sender.send('worksheets-ready', workbook.SheetNames)
  } else {
    log.warn('Cannot read undefined path')
    event.sender.send('worksheets-ready', undefined)
  }
})

/**
 * Reads and parses sheet and sends back column headers as a list
 */
ipcMain.on('get-sheet-headers', (event, data) => {
  const headers: object[] = []
  if (!workbookMap.has(data.path)) {
    try {
      workbookMap.set(data.path, Excel.readFile(data.path, {type: 'binary', cellDates: true}))
    } catch (e) {
      log.error(`Cannot read file ${data.path}`)
      event.sender.send('ready-sheet-headers', [])
      return
    }
  }
  const workbook = workbookMap.get(data.path)
  const sheet: Excel.WorkSheet | null = workbook ? workbook.Sheets[data.sheet] : null
  if (!(sheet && sheet['!ref'])) {
    event.sender.send('ready-sheet-headers', [])
    log.warn(`No columns found in ${data.path} - ${data.sheet}`)
    return
  }
  const range = Excel.utils.decode_range(sheet['!ref'] as string)
  const R = range.s.r

  for (let C = range.s.c; C <= range.e.c; C++) {
    // Cells in the first row
    const cell: Excel.CellObject = sheet[Excel.utils.encode_cell({c: C, r: R})]

    let header: any = {type: 's', value: `UNKNOWN ${C}`}
    if (cell && cell.t) header = {type: cellType[cell.t] || 'ErrorType', value: cell.v}

    headers.push(header)
  }
  event.sender.send('ready-sheet-headers', headers)
})

/**
 * Browses files with .json extension and return parsed content
 */
ipcMain.on('browse-mapping', (event) => {
  dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
    properties: ['openFile'],
    filters: [{ extensions: ['json'], name: 'JSON (.json)' }]
  }, (files) => {
    if (files && files.length) {
      fs.readFile(files[0], (err, data) => {
        if (err) {
          log.error(`Cannot read mapping file ${files[0]}`)
          event.sender.send('selected-mapping', undefined)
          return
        }
        log.info(`Mapping loaded from ${files[0]}`)
        event.sender.send('selected-mapping', JSON.parse(data.toString()))
      })
    } else event.sender.send('selected-mapping', undefined)
  })
})

/**
 * File export - opens SAVE dialog and saves file with json extension
 */
ipcMain.on('export-file', (event, content) => {
  dialog.showSaveDialog(BrowserWindow.getFocusedWindow()!, {
    filters: [{ extensions: ['json'], name: 'JSON (.json)' }]
  }, (filename) => {
    if (!filename) {
      event.sender.send('export-done', null)
      return
    }
    fs.writeFile(filename, content, (err) => {
      if (err) {
        log.error(`Export file: ${err}`)
        event.sender.send('export-done', null)
        return
      }
      event.sender.send('export-done', true)
    })
  })
})
