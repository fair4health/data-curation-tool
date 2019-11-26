import { ipcMain, dialog, FileFilter } from 'electron'
import * as Excel from 'xlsx'
import { cellType } from './common/data-table'

const workbookMap: Map<string, Excel.WorkBook> = new Map<string, Excel.WorkBook>()

/**
 * Browses files with extensions [xl*, csv] and sends back their paths as a list
 */
ipcMain.on('browse-file', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      new class implements FileFilter {
        extensions: string[] = ['xl*', 'csv']
        name: string = 'Excel or CSV'
      } ()
    ]
  }, (files) => {
    if (files) {
      event.sender.send('selected-directory', files)
    }
  })
})

/**
 * Reads file by path and sends back names of sheets in it
 */
ipcMain.on('read-file', (event, path) => {
  if (path) {
    const workbook: Excel.WorkBook = Excel.readFile(path, {type: 'binary', cellDates: true})
    workbookMap.set(path, workbook)
    event.sender.send('worksheets-ready', workbook.SheetNames)
  } else {
    event.sender.send('worksheets-ready', undefined)
  }
})

/**
 * Reads and parses sheet and sends back column headers as a list
 */
ipcMain.on('get-sheet-headers', (event, data) => {
  const headers: object[] = []
  if (workbookMap.has(data.path)) {
    const workbook = workbookMap.get(data.path)
    const sheet: Excel.WorkSheet | null = workbook ? workbook.Sheets[data.sheet] : null
    if (!sheet) {
      event.sender.send('ready-sheet-headers', null)
      return;
    }
    const range = Excel.utils.decode_range(sheet['!ref'] as string)
    const R = range.s.r

    for (let C = range.s.c; C <= range.e.c; C++) {
      // Cells in the first row
      const cell: Excel.CellObject = sheet[Excel.utils.encode_cell({c: C, r: R})]

      let header: any = {type: 's', value: `UNKNOWN ${C}`}
      if (cell && cell.t) header = {type: cellType[cell.t] || 'ErrorType', value: cell.v}

      headers.push(header);
    }
  }
  event.sender.send('ready-sheet-headers', headers)
})
