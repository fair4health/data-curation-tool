import * as Excel from 'xlsx'

/**
 * The map that contains Excel-CSV data that has been read and parsed from file locations
 */
export const workbookMap: Map<string, Excel.WorkBook> = new Map<string, Excel.WorkBook>()
