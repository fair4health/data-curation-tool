import fs from 'fs'
import * as Excel from 'xlsx'
import ElectronStore from 'electron-store'
import generators from '@/common/model/resource-generators'
import log from 'electron-log'
import Status from '@/common/Status'
import { VNode, CreateElement } from 'vue'
import { remote, ipcRenderer, OpenDialogReturnValue, SaveDialogReturnValue } from 'electron'
import { workbookMap } from '@/common/model/workbook'
import { cellType } from '@/common/model/data-table'
import { FHIRUtil } from '@/common/utils/fhir-util'
import { Component, Vue } from 'vue-property-decorator'
import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
import { environment } from '@/common/environment'
import { Connection, ConnectionOptions, createConnection, getConnectionManager } from 'typeorm'
import { DataSourceType, DBConnectionOptions } from '@/common/model/data-source'
import { DbUtil } from '@/common/utils/db-util'

@Component
export default class BackgroundEngine extends Vue {
  // Chunk size of batch operations to be performed on FHIR repo (Validation and Transform)
  private FHIR_OP_CHUNK_SIZE: number = 1000
  // Chunk size of target resource references to be placed in one Provenance.
  // Each Provenance resource will store this maximum number of references
  private PROVENANCE_TARGET_CHUNK_SIZE: number = 5000
  private electronStore: ElectronStore
  private fhirBaseUrl: fhir.uri
  private terminologyBaseUrl: fhir.uri
  private dataSourceType: DataSourceType
  private dbConnection: Connection

  private abortValidation: AbortController

  private provenance: fhir.Provenance = {
    resourceType: 'Provenance',
    target: [],
    recorded: '',
    agent: [
      {
        who: {
          display: ''
        }
      }
    ],
    signature: [
      {
        type: [
          {
            system: 'urn:iso-astm:E1762-95:2013',
            code: '1.2.840.10065.1.12.1.1',
            display: 'Author\'s Signature'
          }
        ],
        when: '',
        who: {
          reference: `Device/${environment.toolID}`
        }
      }
    ]
  }
  private documentManifest: fhir.DocumentManifest = {
    resourceType: 'DocumentManifest',
    status: 'current',
    created: '',
    author: [
      {
        reference: `Device/${environment.toolID}`
      }
    ],
    content: [],
    related: [
      {
        identifier: {
          value: 'License'
        },
        ref: {
          display: ''
        }
      }
    ]
  }

  created () {

    // Logger settings
    log.transports.file.fileName = 'log.txt'
    log.transports.console.level = false

    // Initialize electron file store
    this.electronStore = new ElectronStore({
      serialize: value => JSON.stringify(value)
    })

    // Initialize IPC listeners
    this.initListeners()

    // Get ready - available thread window
    this.ready()
  }

  public initListeners () {
    this.setFhirBaseUrl()
    this.setTerminologyBaseUrl()
    this.setDataSourceType()

    // DB listeners
    this.onCreateDbConnection()
    this.onSelectDb()
    this.onCloseDbConnection()

    // File listeners
    this.onBrowseFile()
    this.onReadFile()
    this.onGetTableHeaders()
    this.onBrowseMapping()
    this.onExportFile()
    this.onPrepareSnapshotData()

    // Resource operation listeners (Validate - Transform)
    this.onValidate()
    this.onTransform()
    this.onAbortValidation()

    // Electron-store getter setter listeners
    this.getElectronStore()
    this.setElectronStore()

    // WorkbookMap setter
    this.setWorkbookMap()

  }

  /**
   * Informs main process that this thread is available/ready to perform
   */
  public ready () {
    ipcRenderer.send(ipcChannels.READY)
  }

  public setFhirBaseUrl () {
    ipcRenderer.on(ipcChannels.Fhir.SET_FHIR_BASE, (event, url) => {
      this.fhirBaseUrl = url
      this.$fhirService.setUrl(this.fhirBaseUrl)
    })
  }

  public setTerminologyBaseUrl () {
    ipcRenderer.on(ipcChannels.Terminology.SET_TERMINOLOGY_BASE_URL, (event, url) => {
      this.terminologyBaseUrl = url
      this.$terminologyService.setUrl(this.terminologyBaseUrl)
    })
  }

  /**
   * Electron store GET by key operation
   */
  public getElectronStore () {
    ipcRenderer.on(ipcChannels.ElectronStore.GET_ELECTRON_STORE, (event, key) => {
      ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.ElectronStore.GOT_ELECTRON_STORE, this.electronStore.get(key))

      this.ready()
    })
  }

  /**
   * Electron store SET (key, value) pair operation
   */
  public setElectronStore () {
    ipcRenderer.on(ipcChannels.ElectronStore.SET_ELECTRON_STORE, (event, data) => {
      try {
        this.electronStore.set(data.key, data.value)
        this.ready()
      } catch (err) {
        log.error(err)
        this.ready()
      }
    })
  }

  /**
   * WorkbookMap SET operation
   * WorkbookMap stores the current tables with their contents
   */
  public setWorkbookMap () {
    ipcRenderer.on(ipcChannels.SET_WORKBOOK_MAP, (event, data) => {
      workbookMap.set(data.key, data.value)
    })
  }

  /**
   * Data source type SET operation.
   * The source type must be DB or FILE.
   */
  public setDataSourceType () {
    ipcRenderer.on(ipcChannels.SET_DATA_SOURCE_TYPE, (event, type: DataSourceType) => {
      this.dataSourceType = type
    })
  }

  /**
   * Establishes a database connection with the given connection options.
   */
  public onCreateDbConnection () {
    ipcRenderer.on(ipcChannels.Database.CREATE_CONNECTION, async (event, options: DBConnectionOptions) => {
      // Get Connection Manager
      const connectionManager = getConnectionManager()
      // If the connection has not been already established
      if (!this.dbConnection || !this.dbConnection.isConnected) {
        createConnection({
          name: 'f4h-curation-connection',
          type: options.dbType,
          host: options.host,
          port: options.port,
          database: options.database,
          username: options.username,
          password: options.password,
          synchronize: true,
          logging: false,
        } as ConnectionOptions)
          .then(connection => {
            this.dbConnection = connection
            log.info(`Database connection established host:${options.host} port:${options.port} database:${options.database} for thread: ${remote.getCurrentWindow().getTitle()}`)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Database.CONNECTION_ESTABLISHED, {status: Status.SUCCESS, message: 'Database connection established'})
            this.ready()
          })
          .catch(err => {
            log.error(`Database connection error. ${err.message}`)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Database.CONNECTION_ESTABLISHED, {status: Status.ERROR, message: `Database connection error. ${err.message}`})
            this.ready()
          })

      } else {
        log.info(`Already have a connection with host:${options.host} port:${options.port} database:${options.database} for thread: ${remote.getCurrentWindow().getTitle()}`)
        ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Database.CONNECTION_ESTABLISHED, {status: Status.SUCCESS, message: `Already have a connection with host:${options.host} port:${options.port} database:${options.database}`})
        this.ready()
      }
    })
  }

  /**
   * Closes the database connection
   */
  onCloseDbConnection () {
    ipcRenderer.on(ipcChannels.Database.CLOSE_CONNECTION, (event) => {
      if (this.dbConnection && this.dbConnection.isConnected) {
        this.dbConnection.close().then(res => {
          log.info(`Database connection has been closed for thread: ${remote.getCurrentWindow().getTitle()}`)
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Database.CLOSE_CONNECTION_RES, {status: Status.SUCCESS, message: 'Database connection has been closed.'})
        })
          .catch(err => {
            log.error(`Error occurred while trying to close database connection. ${err.message}`)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Database.CLOSE_CONNECTION_RES, {status: Status.ERROR, message: `${err.message}`})
          })
      } else {
        log.info(`No active connection found.`)
        ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Database.CLOSE_CONNECTION_RES, {status: Status.SUCCESS, message: 'No active connection found.'})
      }
    })
  }

  /**
   * Retrieves the Public tables in the selected DB.
   */
  public onSelectDb () {
    ipcRenderer.on(ipcChannels.Database.SELECT_DB, () => {
      if (this.dbConnection) {
        this.dbConnection.query(DbUtil.getTablesQuery())
          .then(tables => {
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_FILES, tables.map(_ => _.table_name))
            this.ready()
          })
          .catch(err => {
            log.error(`Get tables in db error: ${err.message}`)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_FILES, undefined)
            this.ready()
          })
      } else {
        log.error('Database connection is broken!')
        ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_FILES, undefined)
        this.ready()
      }
    })
  }

  /**
   * Browses files with extensions [xls, xlsx, csv] and sends back their paths as a list
   */
  public onBrowseFile () {
    ipcRenderer.on(ipcChannels.File.BROWSE_FILE, () => {
      remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), {
        properties: ['openFile', 'multiSelections'],
        filters: [{ extensions: ['xls', 'xlsx', 'csv'], name: 'Excel or CSV' }]
      })
        .then((openDialogReturnValue: OpenDialogReturnValue) => {
          const filePaths: string[] = openDialogReturnValue.filePaths
          if (filePaths && filePaths.length) {
            log.info('Browse file - ' + filePaths)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_FILES, filePaths)
          } else ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_FILES, undefined)

          this.ready()
        })
        .catch(err => {
          log.error(`Browse file error. ${err}`)
          this.ready()
        })
    })
  }

  /**
   * Reads file by path and sends back names of sheets in it
   */
  public onReadFile () {
    ipcRenderer.on(ipcChannels.File.READ_FILE, (event, path) => {
      if (path) {
        if (this.dataSourceType === DataSourceType.DB) {
          if (this.dbConnection) {
            log.info('Reading table: ' + path)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READ_DONE, [path])
            this.ready()
          } else {
            log.error('Database connection is broken!')
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READ_DONE, undefined)
            this.ready()
          }
        } else {
          try {
            // workbook = Excel.readFile(path, {type: 'binary', sheetRows: 1})
            const stream = fs.createReadStream(path)
            const buffers = []
            stream.on('error', () => {
              log.error(`Cannot read file ${path}`)
              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READ_DONE, undefined)
              this.ready()
              return
            })
            stream.on('data', (data) => { buffers.push(data) })
            stream.on('end', () => {
              const buffer = Buffer.concat(buffers)
              const workbook: Excel.WorkBook = Excel.read(buffer, {type: 'buffer', sheetRows: 11})

              // workbookMap.set(path, workbook)
              ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.SET_WORKBOOK_MAP, {key: path, value: workbook})
              log.info('Read file ' + path)
              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READ_DONE, workbook.SheetNames)
              this.ready()
            })
          } catch (err) {
            log.error(`Cannot read file ${path}`)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READ_DONE, undefined)
            this.ready()
            return
          }
        }
      } else {
        log.warn('Cannot read undefined path / table')
        ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READ_DONE, undefined)
        this.ready()
      }
    })
  }

  /**
   * Reads and parses table and sends back column headers as a list
   */
  public onGetTableHeaders () {
    ipcRenderer.on(ipcChannels.File.GET_TABLE_HEADERS, (event, data) => {
      const headers: object[] = []
      if (this.dataSourceType === DataSourceType.DB) {
        // TODO: DB
        if (!workbookMap.has(data.path) || data.noCache) {
          if (this.dbConnection) {
            this.dbConnection.query(DbUtil.getColumnNamesQuery(data.path))
              .then(columns => {
                columns.forEach(column => {
                  headers.push({type: cellType['s'], value: column.column_name})
                })
                ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_TABLE_HEADERS, headers)
                this.ready()
              })
              .catch(err => {
                log.error(`Get table column names error: ${err.message}`)
                ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_TABLE_HEADERS, [])
                this.ready()
              })
          } else {
            log.error('Database connection is broken!')
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_TABLE_HEADERS, [])
            this.ready()
          }
        }
      } else {
        if (!workbookMap.has(data.path) || data.noCache) {
          try {
            workbookMap.set(data.path, Excel.readFile(data.path, {type: 'binary', sheetRows: 11}))
            // ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.SET_WORKBOOK_MAP, {key: data.path, value: Excel.readFile(data.path, {type: 'binary', cellDates: true})})
          } catch (e) {
            log.error(`Cannot read file ${data.path}`)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_TABLE_HEADERS, [])
            this.ready()
            return
          }
        }
        const workbook = workbookMap.get(data.path)
        const sheet: Excel.WorkSheet | null = workbook ? workbook.Sheets[data.sheet] : null
        if (!(sheet && sheet['!ref'])) {
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_TABLE_HEADERS, [])
          log.warn(`No columns found in ${data.path} - ${data.sheet}`)
          this.ready()
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
        ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_TABLE_HEADERS, headers)
        this.ready()
      }
    })
  }

  /**
   * Prepares a snapshot of data with a few number of entries
   */
  public onPrepareSnapshotData () {
    ipcRenderer.on(ipcChannels.File.PREPARE_SNAPSHOT_DATA, (event, data) => {
      if (this.dataSourceType === DataSourceType.DB) {
        if (this.dbConnection) {
          this.dbConnection.query(DbUtil.getTop10EntriesQuery(data.path))
            .then(entries => {
              entries.forEach(entry => {
                Object.entries(entry).forEach(([key, value]) => {
                  if (value instanceof Date) {
                    entry[key] = value.toString()
                  }
                })
              })

              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_SNAPSHOT_DATA, entries)
              this.ready()
            })
            .catch(err => {
              log.error(`Prepare snapshot error: ${err.message}`)
              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_SNAPSHOT_DATA, [])
              this.ready()
            })
        } else {
          log.error('Database connection is broken!')
          this.ready()
        }
      } else {
        if (!workbookMap.has(data.path) || data.noCache) {
          try {
            workbookMap.set(data.path, Excel.readFile(data.path, {type: 'binary', sheetRows: 11}))
          } catch (e) {
            log.error(`Cannot read file ${data.path}`)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_SNAPSHOT_DATA, [])
            this.ready()
            return
          }
        }
        const workbook = workbookMap.get(data.path)
        const sheet: Excel.WorkSheet | null = workbook ? workbook.Sheets[data.sheet] : null
        if (!(sheet && sheet['!ref'])) {
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_SNAPSHOT_DATA, [])
          log.warn(`No columns found in ${data.path} - ${data.sheet}`)
          this.ready()
          return
        }
        const entries: any[] = Excel.utils.sheet_to_json(sheet, {raw: false, dateNF: 'mm/dd/yyyy'}) || []

        ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READY_SNAPSHOT_DATA, entries)
        this.ready()
      }
    })
  }

  /**
   * Browses files with .json extension and sends back parsed content
   */
  public onBrowseMapping () {
    ipcRenderer.on(ipcChannels.File.BROWSE_MAPPING, () => {
      remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), {
        properties: ['openFile'],
        filters: [{ extensions: ['json'], name: 'JSON (.json)' }]
      })
        .then((openDialogReturnValue: OpenDialogReturnValue) => {
          const filePaths: string[] = openDialogReturnValue.filePaths
          if (filePaths && filePaths.length) {
            fs.readFile(filePaths[0], (err, data) => {
              if (err) {
                log.error(`Cannot read mapping file ${filePaths[0]}`)
                ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_MAPPING, undefined)
                this.ready()
                return
              }
              log.info(`Mapping loaded from ${filePaths[0]}`)
              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_MAPPING, JSON.parse(data.toString()))
            })
          } else ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_MAPPING, undefined)

          this.ready()
        })
        .catch(err => {
          log.error(`Browse file error. ${err}`)
          this.ready()
        })
    })
  }

  /**
   * File export - opens SAVE dialog and saves file with json extension
   */
  public onExportFile () {
    ipcRenderer.on(ipcChannels.File.EXPORT_FILE, (event, content) => {
      remote.dialog.showSaveDialog(remote.BrowserWindow.getFocusedWindow(), {
        filters: [{ extensions: ['json'], name: 'JSON (.json)' }]
      })
        .then((saveDialogReturnValue: SaveDialogReturnValue) => {
          const filename: string = saveDialogReturnValue.filePath
          if (!filename) {
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.EXPORT_DONE, null)
            this.ready()
            return
          }
          fs.writeFile(filename, content, (err) => {
            if (err) {
              log.error(`Export file: ${err}`)
              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.EXPORT_DONE, null)
              this.ready()
              return
            }
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.EXPORT_DONE, true)
          })

          this.ready()
        })
        .catch(err => {
          log.error(`Save file error. ${err}`)
          this.ready()
        })
    })
  }

  public onAbortValidation () {
    ipcRenderer.on(ipcChannels.Fhir.ABORT_VALIDATION, () => {
      this.abortValidation.abort()
    })
  }

  public prepareDataFromDb (table: string, rowNumber?: number): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      if (this.dbConnection) {
        this.dbConnection.query(rowNumber ? DbUtil.getTop10EntriesQuery(table) : DbUtil.getEntriesQuery(table))
          .then(entries => {
            resolve(entries)
          })
          .catch(err => {
            log.error(`Prepare data from db error: ${err.message}`)
            reject(err.message)
          })
      } else {
        log.error('Database connection is broken!')
        reject('Database connection is broken!')
      }
    })
  }

  public prepareDataFromFile (filePath: string, rowNumber?: number): Promise<Excel.WorkBook> {
    return new Promise<Excel.WorkBook>((resolve, reject) => {
      try {
        const stream = fs.createReadStream(filePath)
        const buffers = []
        stream.on('error', (err) => { reject(err) })
        stream.on('data', (data) => { buffers.push(data) })
        stream.on('end', () => {
          const buffer = Buffer.concat(buffers)
          const workbook: Excel.WorkBook = Excel.read(buffer, {type: 'buffer', cellDates: true, cellText: false, sheetRows: rowNumber})

          // Save buffer workbook to map
          workbookMap.set(filePath, workbook)
          // ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.SET_WORKBOOK_MAP, {key: filePath, value: workbook})
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.VALIDATE_READ_FILE_X(filePath), [])
          resolve(workbook)
        })
      } catch (err) {
        reject(err)
      }
    })

  }

  /**
   * Create and validate resources
   */
  public onValidate () {
    ipcRenderer.on(ipcChannels.Fhir.VALIDATE, (event, validationReqBody: ValidationReqBody) => {
      this.abortValidation = new AbortController()

      this.validate(this.abortValidation.signal, validationReqBody.data, validationReqBody.chunkSize, validationReqBody.rowNumber)
        .then(() => {
          this.ready()
        })
        .catch(err => {
          // In case of cancellation
          log.info(err)
          this.ready()
        })
    })
  }

  public validate (abortSignal: AbortSignal, data: any, reqChunkSize: number, rowNumber?: number): Promise<any> {
    // Update chunk size
    this.FHIR_OP_CHUNK_SIZE = reqChunkSize
    // Is the data source database?
    const isDbSource = this.dataSourceType === DataSourceType.DB

    return new Promise((resolveValidation, rejectValidation) => {
      const filePath = data.filePath

      if (abortSignal.aborted) {
        rejectValidation('Validation has been aborted')
      }

      abortSignal.addEventListener( 'abort', () => {
        rejectValidation('Validation has been aborted')
      })

      const dataPromise: Promise<any> = isDbSource ? this.prepareDataFromDb(filePath, rowNumber) : this.prepareDataFromFile(filePath, rowNumber)

      dataPromise.then(workbook => {
        const conceptMap: Map<string, fhir.ConceptMap> = new Map<string, fhir.ConceptMap>()
        this.electronStore.get(`${this.terminologyBaseUrl}-ConceptMapList`)?.map(_ => {
          conceptMap.set(_.id, _)
        })
        data.sheets.reduce((promise: Promise<any>, sheet: store.Sheet) =>
            promise.then(() => new Promise((resolveSheet, rejectSheet) => {

              const entries: any[] = isDbSource ? workbook : Excel.utils.sheet_to_json(workbook.Sheets[sheet.sheetName], {raw: false, dateNF: 'mm/dd/yyyy'}) || []
              const sheetRecords: store.Record[] = sheet.records

              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.INFO_X(filePath, sheet.sheetName), {total: entries.length})
              log.info(`Creating resources in ${sheet.sheetName} in ${filePath}`)

              // Create resources row by row in entries
              // Start validation operation
              const resources: Map<string, fhir.Resource[]> = new Map<string, fhir.Resource[]>()
              const bufferResourceList: BufferResourceDefinition[] = []
              const conceptMapList: store.ConceptMap[] = []
              const recordIDsHavingConceptMap: string[] = []

              Promise.all(entries.map((entry) => {
                return new Promise((resolveOneRow, rejectOneRow) => {
                  // For each row create buffer resources

                  Promise.all(sheetRecords.map((record: store.Record) => {
                    return new Promise((resolveRecord, rejectRecord) => {
                      if (!resources.get(record.resource)) resources.set(record.resource, [])

                      const generator = generators.get(record.resource)!
                      const bufferResourceMap: Map<string, BufferResource> = new Map<string, BufferResource>()

                      if (generator) {
                        Promise.all(record.data.map((sourceData: store.SourceTargetGroup) => {
                          return new Promise((resolveTargets, rejectTargets) => {
                            const entryValue: any = entry[sourceData.value] || sourceData.defaultValue
                            if (entryValue !== undefined && entryValue !== null && entryValue !== '') {
                              let value = String(entryValue).trim()
                              if (sourceData.type === cellType.n) {
                                value = value.replace(',', '.')
                              }

                              const hasConceptMapping: boolean = !!(sourceData.conceptMap && sourceData.conceptMap.source)

                              Promise.all(sourceData.target.map((target: store.Target) => {
                                // Buffer Resource creation
                                // target.value.substr(target.value.length - 3) === '[x]'
                                const key = target.type ? `${target.value}.${target.type}` : target.value
                                bufferResourceMap.set(key, FHIRUtil.cleanJSON({
                                  value,
                                  sourceType: sourceData.type,
                                  targetType: target.type,
                                  fixedUri: target.fixedUri
                                }))

                                if (hasConceptMapping) {
                                  conceptMapList.push({relatedRecordID: record.recordId, value, resourceKey: key, ...sourceData.conceptMap})
                                }

                              }))
                                .then(() => resolveTargets(hasConceptMapping))
                                .catch(() => resolveTargets())
                            } else resolveTargets()
                          })
                        }))
                          .then(res => {
                            // End of one record
                            if (res.includes(true) && !recordIDsHavingConceptMap.includes(record.recordId)) {
                              recordIDsHavingConceptMap.push(record.recordId)
                            }
                            bufferResourceList.push({resourceType: record.resource, profile: record.profile, relatedRecordID: record.recordId, data: bufferResourceMap})
                            resolveRecord()

                          })
                          .catch(err => rejectRecord(err))
                      } else {
                        rejectRecord(`${record.resource} resource couldn't be generated. Generator doesn't exist.`)
                      }
                    })
                  }))
                    .then(() => resolveOneRow())
                    .catch(err => rejectOneRow(err))

                })
              }))
                .then(() => { // End of sheet

                  let chunkPromise = Promise.resolve()

                  if (conceptMapList.length) {
                    // If there is a concept mapping, filter buffer resources by ID numbers based on mapping record
                    // Buffer resources having concept mapping
                    for (const recordID of recordIDsHavingConceptMap) {
                      const bufferResourcesHavingConceptMap = bufferResourceList.filter(_ => _.relatedRecordID === recordID)
                      const currentConceptMapList = conceptMapList.filter(_ => _.relatedRecordID === recordID)

                      const conceptMappingCountPerResource: number = currentConceptMapList.length / bufferResourcesHavingConceptMap.length
                      const chunkedConceptMapList = this.$_.chunk(currentConceptMapList, conceptMappingCountPerResource * this.FHIR_OP_CHUNK_SIZE)

                      for (let i = 0; i < chunkedConceptMapList.length; i++) {
                        chunkPromise = chunkPromise.then(() => {
                          return new Promise((resolveChunk, rejectChunk) => {
                            const currentChunk = chunkedConceptMapList[i]

                            this.$terminologyService.translateBatch(currentChunk)
                              .then((bundle: fhir.Bundle) => {
                                const parametersEntry: fhir.BundleEntry[] = bundle.entry
                                const bundleEntrySize: number = bundle.entry.length

                                for (let j = 0; j < bundleEntrySize; j++) {
                                  const parametersParameters: fhir.ParametersParameter[] = (parametersEntry[j].resource as fhir.Parameters).parameter

                                  if (parametersParameters.find(_ => _.name === 'result')?.valueBoolean === true) {
                                    const matchConcept: fhir.ParametersParameter | undefined = parametersParameters.find(_ => _.name === 'match')?.part?.find(_ => _.name === 'concept')
                                    if (matchConcept) {

                                      const key: string = currentChunk[j].resourceKey
                                      const bufferResource: BufferResource = bufferResourcesHavingConceptMap[Math.floor((i * this.FHIR_OP_CHUNK_SIZE + j) / conceptMappingCountPerResource)].data.get(key)

                                      bufferResource.value = matchConcept.valueCoding.code
                                      bufferResource.fixedUri = matchConcept.valueCoding.system

                                    }
                                  }
                                }
                                resolveChunk()
                              })
                              .catch(err => {
                                log.error(`Batch translation error. ${err}`)
                                resolveChunk()
                              })

                          })
                        })
                      }
                    }
                  }

                  chunkPromise.then(() => {
                    // End of translation
                    // Generate resources
                    Promise.all(bufferResourceList.map((bufferResourceDefinition: BufferResourceDefinition) => {
                      return new Promise(resolve => {
                        const generator = generators.get(bufferResourceDefinition.resourceType)
                        const currResourceList: fhir.Resource[] = resources.get(bufferResourceDefinition.resourceType)

                        generator.generateResource(bufferResourceDefinition.data, bufferResourceDefinition.profile)
                          .then((res: fhir.Resource) => {

                            currResourceList.push(res)
                            setTimeout(() => { resolve() }, 0)

                          })
                          .catch(err => {

                            log.error(bufferResourceDefinition.resourceType + ' Resource generation error.', err)
                            setTimeout(() => { resolve() }, 0)

                          })
                      })
                    }))
                      .then(() => {
                        ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.GENERATED_RESOURCES_X(filePath, sheet.sheetName), {status: Status.VALIDATING})
                        if (entries.length) {

                          Promise.all(Array.from(resources.keys()).map(resourceType => {
                            const resourceList = resources.get(resourceType) || []

                            return new Promise((resolve, reject) => {
                              this.$store.dispatch(types.IDB.GET, resourceType)
                                .then(resourcesInDB => {
                                  this.$store.dispatch(types.IDB.SAVE, {resource: resourceType, data: (resourcesInDB?.data || []).concat(resourceList)})
                                    .then(() => {
                                      // Batch upload resources
                                      // Max capacity FHIR_OP_CHUNK_SIZE resources
                                      const len = Math.ceil(resourceList.length / this.FHIR_OP_CHUNK_SIZE)

                                      const batchPromiseList: Array<Promise<any>> = []

                                      for (let i = 0, p = Promise.resolve(); i < len; i++) {
                                        batchPromiseList.push(p.then(() => new Promise((resolveBatch, rejectBatch) => {
                                          this.$fhirService.validate(resourceList!.slice(i * this.FHIR_OP_CHUNK_SIZE, (i + 1) * this.FHIR_OP_CHUNK_SIZE))
                                            .then(res => {
                                              const bundle: fhir.Bundle = res.data as fhir.Bundle
                                              const outcomeDetails: OutcomeDetail[] = []

                                              // Check batch bundle response for errors
                                              Promise.all(bundle.entry?.map((entry: fhir.BundleEntry) => {
                                                let operationOutcome: fhir.OperationOutcome
                                                let isValidated: boolean = true
                                                if (!entry.resource) {
                                                  operationOutcome = entry.response.outcome as fhir.OperationOutcome
                                                } else {
                                                  operationOutcome = entry.resource as fhir.OperationOutcome
                                                }

                                                operationOutcome.issue.map(issue => {
                                                  if (issue.severity === 'error' || issue.severity === 'fatal') {
                                                    isValidated = false
                                                    outcomeDetails.push({status: Status.ERROR, resourceType, message: `${issue.location} : ${issue.diagnostics}`} as OutcomeDetail)
                                                  }
                                                })

                                                if (isValidated) {
                                                  outcomeDetails.push({status: Status.SUCCESS, resourceType, message: `Status: ${entry.response?.status}`} as OutcomeDetail)
                                                }

                                              }) || [])
                                                .then(() => resolveBatch(outcomeDetails))
                                                .catch(err => rejectBatch(err))
                                            })
                                            .catch(err => {
                                              log.error(`Batch process error. ${err}`)
                                              rejectBatch(err)
                                              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.VALIDATE_X(filePath, sheet.sheetName), {status: Status.ERROR, outcomeDetails: [{status: Status.ERROR, resourceType: 'OperationOutcome', message: err.message}]})
                                            })
                                        })))
                                      }

                                      Promise.all(batchPromiseList)
                                        .then(res => {
                                          if (res.length) {
                                            log.info(`Batch process completed for Resource: ${resourceType}`)
                                            resolve([].concat.apply([], res))
                                          } else {
                                            log.error(`Batch process error for Resource: ${resourceType}`)
                                            reject([{
                                              status: Status.ERROR,
                                              message: `There is no ${resourceType} Resource created. See the logs for detailed error information.`,
                                              resourceType: 'OperationOutcome'
                                            } as OutcomeDetail])
                                          }
                                        })
                                        .catch(err => {
                                          log.error(`Batch process error for Resource: ${resourceType}`)
                                          reject(err)
                                        })
                                    })
                                    .catch(err => {
                                      log.warn(`Couldn't store resources created: ${err}`)
                                      return reject([{
                                        status: Status.ERROR,
                                        message: `Couldn't store resources. Capacity exceeded.`,
                                        resourceType: 'OperationOutcome'
                                      } as OutcomeDetail])
                                    })
                                })
                                .catch(err => {
                                  log.warn(`Couldn't store resources created: ${err}`)
                                  return reject([{
                                    status: Status.ERROR,
                                    message: `${err}`,
                                    resourceType: 'OperationOutcome'
                                  } as OutcomeDetail])
                                })
                            }).catch(_ => _)

                          }))
                            .then((res: any[]) => {
                              resolveSheet()
                              const outcomeDetails: OutcomeDetail[] = [].concat.apply([], res)
                              const status = !outcomeDetails.length || !!outcomeDetails.find(_ => _.status === Status.ERROR) ? Status.ERROR : Status.SUCCESS
                              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.VALIDATE_X(filePath, sheet.sheetName), {status, outcomeDetails})
                              log.info(`Validation completed ${sheet.sheetName} in ${filePath}`)
                            })
                            .catch(err => {
                              resolveSheet()
                              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.VALIDATE_X(filePath, sheet.sheetName), {status: Status.ERROR, message: 'Batch process error', outcomeDetails: err})
                              log.error(`Batch process error ${filePath}-${sheet.sheetName}`)
                            })

                        } else {
                          resolveSheet()
                          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.VALIDATE_X(filePath, sheet.sheetName), {status: Status.ERROR, outcomeDetails: [{status: Status.ERROR, resourceType: 'OperationOutcome', message: 'Empty sheet'}]})
                          log.warn(`Empty sheet: ${sheet.sheetName} in ${filePath}`)
                        }
                      })
                      .catch(err => {
                        resolveSheet()
                        ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.VALIDATE_X(filePath, sheet.sheetName), {status: Status.ERROR, outcomeDetails: [{status: Status.ERROR, resourceType: 'OperationOutcome', message: `Translation Terminology Service error for sheet: ${sheet.sheetName}. ${err}`}]})
                        log.error(`Chunk promise error. ${err}`)
                      })

                  })
                })
                .catch(err => {
                  resolveSheet()
                  ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.VALIDATE_X(filePath, sheet.sheetName), {status: Status.ERROR, outcomeDetails: [{status: Status.ERROR, resourceType: 'OperationOutcome', message: `Validation error for sheet: ${sheet.sheetName}. ${err}`}]})
                  log.error(`Validation error for sheet: ${sheet.sheetName} in ${filePath}: ${err}`)
                })
            }))
          , Promise.resolve()
        )
          .then(() => {
            log.info('Validation completed')
            resolveValidation()
          })
          .catch(err => {
            log.error(`Error in Validation. ${err}`)
            resolveValidation()
          })
      })
        .catch(err => {
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.VALIDATE_ERROR_X(filePath), {status: Status.ERROR, outcomeDetails: [{status: Status.ERROR, message: `File/table not found : ${filePath}`, resourceType: 'OperationOutcome'}]})
          log.error(`File/table not found. ${err}`)
          resolveValidation()
        })
    })
  }

  /**
   * Puts resources into the FHIR Repository
   */
  public onTransform () {
    ipcRenderer.on(ipcChannels.Fhir.TRANSFORM, (event, transformRequest: TransformRequest) => {
      // Created resource references [resourceType]/[id]/_history/[version]
      const provenanceTargets: fhir.Reference[] = []
      // Created resource references [resourceType]/[id]
      const documentManifestContent: fhir.Reference[] = []
      this.$store.dispatch(types.IDB.GET_ALL)
        .then((resources: any[]) => {
          const map: Map<string, fhir.Resource[]> = new Map<string, fhir.Resource[]>()
          resources.forEach(obj => {
            map.set(obj.resource, obj.data)
          })
          Promise.all(resources.map(item => {
            const resourceType = item.resource
            const resourceList = item.data

            return new Promise((resolve, reject) => {

              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.TRANSFORM_X(resourceType), {status: Status.IN_PROGRESS} as OutcomeDetail)

              // Batch upload resources
              // Max capacity FHIR_OP_CHUNK_SIZE resources
              const len = Math.ceil(resourceList!.length / this.FHIR_OP_CHUNK_SIZE)

              const batchPromiseList: Array<Promise<any>> = []

              for (let i = 0, p = Promise.resolve(); i < len; i++) {
                batchPromiseList.push(p.then(() => new Promise((resolveBatch, rejectBatch) => {
                  this.$fhirService.postBatch(resourceList!.slice(i * this.FHIR_OP_CHUNK_SIZE, (i + 1) * this.FHIR_OP_CHUNK_SIZE), 'PUT')
                    .then(res => {
                      const bundle: fhir.Bundle = res.data as fhir.Bundle
                      const outcomeDetails: OutcomeDetail[] = []
                      let hasError: boolean = false

                      // Check batch bundle response for errors
                      Promise.all(bundle.entry?.map(_ => {
                        if (!_.resource) {
                          const operationOutcome: fhir.OperationOutcome = _.response!.outcome as fhir.OperationOutcome
                          operationOutcome.issue.map(issue => {
                            if (issue.severity === 'error' || issue.severity === 'fatal') {
                              hasError = true
                              outcomeDetails.push({status: Status.ERROR, resourceType, message: `${issue.location} : ${issue.diagnostics}`} as OutcomeDetail)
                            } else if (issue.severity === 'information') {
                              outcomeDetails.push({status: Status.SUCCESS, resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
                            }
                          })
                        } else {
                          outcomeDetails.push({status: Status.SUCCESS, resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
                          // Create Provenance resource for the current batch
                          const location: string = _.response?.location || ''
                          const splitted = location.split('/')
                          const referenceWithVersion: string = splitted.slice(splitted.length - 4).join('/')
                          const referenceWithoutVersion: string = splitted.slice(splitted.length - 4, splitted.length - 2).join('/')
                          provenanceTargets.push({ reference: referenceWithVersion })
                          documentManifestContent.push({ reference: referenceWithoutVersion })
                        }
                      }) || [])
                        .then(() => {
                          if (hasError) rejectBatch(outcomeDetails)
                          else resolveBatch(outcomeDetails)
                        })
                        .catch(err => rejectBatch(err))
                    })
                    .catch(err => {
                      log.error(`Batch process error. ${err}`)
                      rejectBatch(err)
                    })
                }).catch(_ => _)))
              }

              Promise.all(batchPromiseList)
                .then(res => {
                  const concatResult: OutcomeDetail[] = [].concat.apply([], res)
                  const status = !concatResult.length || !!concatResult.find(_ => _.status === Status.ERROR) ? Status.ERROR : Status.SUCCESS
                  log.info(`Batch process completed for Resource: ${resourceType}`)
                  ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.TRANSFORM_X(resourceType), {status, outcomeDetails: concatResult} as OutcomeDetail)
                  resolve(concatResult)
                })
                .catch(err => {
                  log.error(`Batch process error for Resource: ${resourceType}`)
                  ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.TRANSFORM_X(resourceType), {status: Status.ERROR} as OutcomeDetail)
                  reject(err)
                })

            }).catch(_ => _)

          }))
            .then((res: any[]) => {
              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.TRANSFORM_RESULT, {status: Status.SUCCESS, outcomeDetails: [].concat.apply([], res)})
              log.info(`Transform completed`)
              this.createProvenanceAndLicense(transformRequest.author, transformRequest.license, provenanceTargets, documentManifestContent)
                .then(() => {
                  this.ready()
                })
                .catch(err => {
                  this.ready()
                })
            })
            .catch(err => {
              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.TRANSFORM_RESULT, {status: Status.ERROR, message: 'Transform error', outcomeDetails: err})
              log.error(`Transform error. ${err}`)

              this.ready()
            })
        })
        .catch(err => {
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.TRANSFORM_RESULT, {status: Status.ERROR, message: 'Cannot get resources', outcomeDetails: err})
          log.error(`Transform error. ${err}`)
          this.ready()
        })
    })
  }

  /**
   * Creates Provenance and DocumentManifest resources
   *
   * @param author - The organization that makes the transformation. Provenance.agent.who
   * @param license - License information
   * @param provenanceTargets - List of references of created resources with their version numbers [resourceType]/[id]/_history/[version]
   * @param documentManifestContent - List of references of created resources without the version numbers [resourceType]/[id]
   */
  createProvenanceAndLicense (author: string, license: License, provenanceTargets: fhir.Reference[], documentManifestContent: fhir.Reference[]): Promise<void> {
    const currentDate: string = new Date().toISOString()
    const documentManifestExtension: fhir.Extension[] = this.createExtensionForResourceCounts(provenanceTargets)

    const chunkedReferences = this.$_.chunk(provenanceTargets, this.PROVENANCE_TARGET_CHUNK_SIZE)
    return Promise.all(chunkedReferences.map((chunkedProvenanceTargets: fhir.Reference[]) => {
      return new Promise((resolve, reject) => {
        // Modify provenance resource
        this.provenance.extension = this.createExtensionForResourceCounts(chunkedProvenanceTargets)
        this.provenance.target = chunkedProvenanceTargets
        this.provenance.recorded = currentDate
        this.provenance.signature[0].when = currentDate
        this.provenance.agent[0].who.display = author

        // Post the provenance resource
        this.$fhirService.postResource(this.provenance)
          .then(res => {
            const provenanceResource: fhir.Provenance = res.data
            log.info('Provenance resource has been created with ref: Provenance/' + provenanceResource.id)
            resolve({reference: 'Provenance/' + provenanceResource.id})
          }, err => {
            log.error(`Provenance resource could not be created. Error status: ${err.status}`)
            reject(err)
          })
      })
    }))
      .then((createdProvenanceReferences: fhir.Reference[]) => {
        // Modify documentManifest resource
        this.documentManifest.extension = documentManifestExtension
        this.documentManifest.content = createdProvenanceReferences
        this.documentManifest.created = currentDate
        this.documentManifest.related[0].ref.display = license.display
        this.documentManifest.related[0].ref.type = license.uri
        return new Promise((resolve, reject) => {
          this.createCurationToolDeviceRes().then(() => {
            // Post the documentManifest resource
            this.$fhirService.postResource(this.documentManifest)
              .then(res => {
                const documentManifest: fhir.DocumentManifest = res.data
                log.info('DocumentManifest resource has been created with ref: DocumentManifest/' + documentManifest.id)
                resolve()
              }, err => {
                log.error(`DocumentManifest resource could not be created. Error status: ${err.status}`)
                reject(err)
              })
          })
            .catch(err => {
              reject(err)
            })
        })
      })
  }

  /**
   * Returns an Extension array containing the generated resource numbers for each resource type, in the following format:
   *  {
   *    url: "http://hl7.org/fhir/f4h/resource-count/<ResourceType>"
   *    valueInteger: 10
   *  }
   * @param references
   */
  createExtensionForResourceCounts (references: fhir.Reference[]): fhir.Extension[] {
    const resourceCounts = references.reduce((acc, currReference) => {
      const reference = currReference.reference.split('/')[0]
      if (!acc.hasOwnProperty(reference)) {
        acc[reference] = 0
      }
      acc[reference]++
      return acc
    }, {})
    const extension: fhir.Extension[] = []
    Object.keys(resourceCounts).map((resourceType: string) => {
      extension.push({
        url: `${environment.numberOfResourcesUrlBase}/${resourceType}`,
        valueInteger: resourceCounts[resourceType]
      })
    })
    return extension
  }

  /**
   * Creates Device resource with id environment.toolID. This Device resource belongs to the Data Curation Tool itself.
   * If it already exists, it just continues.
   */
  createCurationToolDeviceRes (): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.$fhirService.search('Device', {_id: environment.toolID})
        .then(res => {
          const bundle: fhir.Bundle = res.data
          if (!bundle.entry?.length) {
            const device: fhir.Device = {
              id: environment.toolID,
              resourceType: 'Device',
              deviceName: [
                {
                  name: 'F4H Data Curation Tool',
                  type: 'udi-label-name'
                }
              ]
            }
            // Create device resource of the tool
            this.$fhirService.putResource(device)
              .then(() => {
                resolve()
              }, err => {
                log.error(`Error while creating the resource Device/${environment.toolID}. Error status: ${err.status}`)
                reject(err)
              })
          } else {
            // Data Curation Tool device resource already exists
            resolve()
          }
        }, err => {
          log.error(`Error while retrieving the resource Device/${environment.toolID}. Error status: ${err.status}`)
          reject(err)
        })
    })
  }

  render (createElement: CreateElement): VNode {
    return createElement('div', {}, 'This is the background process window.')
  }
}
