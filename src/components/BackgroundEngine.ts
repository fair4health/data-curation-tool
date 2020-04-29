import fs from 'fs'
import * as Excel from 'xlsx'
import ElectronStore from 'electron-store'
import generators from '@/common/model/resource-generators'
import log from 'electron-log'
import { VNode, CreateElement } from 'vue'
import { remote, ipcRenderer } from 'electron'
import { workbookMap } from '@/common/model/workbook'
import { cellType } from '@/common/model/data-table'
import { FhirService } from '@/common/services/fhir.service'
import { FHIRUtil } from '@/common/utils/fhir-util'
import { Component, Vue } from 'vue-property-decorator'
import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
import Status from '@/common/Status'

@Component
export default class BackgroundEngine extends Vue {
  private electronStore: ElectronStore
  private fhirBase: fhir.uri
  private fhirService: FhirService

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

    // File listeners
    this.onBrowseFile()
    this.onReadFile()
    this.onGetTableHeaders()
    this.onBrowseMapping()
    this.onExportFile()

    // Resource operation listeners (Validate - Transform - Delete)
    this.onValidate()
    this.onTransform()

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
      this.fhirBase = url
      this.fhirService = new FhirService(this.fhirBase)
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
   * Browses files with extensions [xl*, csv] and sends back their paths as a list
   */
  public onBrowseFile () {
    ipcRenderer.on(ipcChannels.File.BROWSE_FILE, (event) => {
      remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), {
        properties: ['openFile', 'multiSelections'],
        filters: [{ extensions: ['xl*', 'csv'], name: 'Excel or CSV' }]
      }, (files) => {
        if (files) {
          log.info('Browse file - ' + files)
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_FILES, files)
        } else ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_FILES, undefined)

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
            const workbook: Excel.WorkBook = Excel.read(buffer, {type: 'buffer', sheetRows: 1})

            // workbookMap.set(path, workbook)
            ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.SET_WORKBOOK_MAP, {key: path, value: workbook})
            log.info('Read file ' + path)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READ_DONE, workbook.SheetNames)
          })
        } catch (err) {
          log.error(`Cannot read file ${path}`)
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READ_DONE, undefined)
          this.ready()
          return
        }
      } else {
        log.warn('Cannot read undefined path')
        ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.READ_DONE, undefined)
      }

      this.ready()
    })
  }

  /**
   * Reads and parses table and sends back column headers as a list
   */
  public onGetTableHeaders () {
    ipcRenderer.on(ipcChannels.File.GET_TABLE_HEADERS, (event, data) => {
      const headers: object[] = []
      if (!workbookMap.has(data.path) || data.noCache) {
        try {
          workbookMap.set(data.path, Excel.readFile(data.path, {type: 'binary', sheetRows: 1}))
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
    })
  }

  /**
   * Browses files with .json extension and sends back parsed content
   */
  public onBrowseMapping () {
    ipcRenderer.on(ipcChannels.File.BROWSE_MAPPING, (event) => {
      remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), {
        properties: ['openFile'],
        filters: [{ extensions: ['json'], name: 'JSON (.json)' }]
      }, (files) => {
        if (files && files.length) {
          fs.readFile(files[0], (err, data) => {
            if (err) {
              log.error(`Cannot read mapping file ${files[0]}`)
              ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_MAPPING, undefined)
              this.ready()
              return
            }
            log.info(`Mapping loaded from ${files[0]}`)
            ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_MAPPING, JSON.parse(data.toString()))
          })
        } else ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.File.SELECTED_MAPPING, undefined)

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
      }, (filename) => {
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
    })
  }

  /**
   * Create and validate resources
   */
  public onValidate () {
    ipcRenderer.on(ipcChannels.Fhir.VALIDATE, (event, data: any) => {
      const filePath = data.filePath

      const getWorkbooks = new Promise<Excel.WorkBook>(((resolve, reject) => {
        try {
          const stream = fs.createReadStream(filePath)
          const buffers = []
          stream.on('error', (err) => { reject(err) })
          stream.on('data', (data) => { buffers.push(data) })
          stream.on('end', () => {
            const buffer = Buffer.concat(buffers)
            const workbook: Excel.WorkBook = Excel.read(buffer, {type: 'buffer', cellDates: true})

            // Save buffer workbook to map
            workbookMap.set(filePath, workbook)
            // ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.SET_WORKBOOK_MAP, {key: filePath, value: workbook})
            ipcRenderer.send(ipcChannels.TO_RENDERER, `validate-read-file-${filePath}`, [])
            resolve(workbook)
          })
        } catch (err) {
          reject(err)
        }
      }))
      getWorkbooks.then(workbook => {
        const conceptMap: Map<string, fhir.ConceptMap> = new Map<string, fhir.ConceptMap>()
        this.electronStore.get(`${this.fhirBase}-ConceptMapList`)?.map(_ => {
          conceptMap.set(_.id, _)
        })
        data.sheets.reduce((promise: Promise<any>, sheet: store.Sheet) =>
            promise.then(() => new Promise((resolveSheet, rejectSheet) => {

              const entries: any[] = Excel.utils.sheet_to_json(workbook.Sheets[sheet.sheetName]) || []
              const sheetRecords: store.Record[] = sheet.records

              ipcRenderer.send(ipcChannels.TO_RENDERER, `info-${filePath}-${sheet.sheetName}`, {total: entries.length})
              log.info(`Creating resources in ${sheet.sheetName} in ${filePath}`)

              // Create resources row by row in entries
              // Start validation operation
              const resources: Map<string, fhir.Resource[]> = new Map<string, fhir.Resource[]>()

              Promise.all(entries.map((entry) => {
                return new Promise((resolveOneRow, rejectOneRow) => {
                  // For each row create resource instances
                  // const resourceMap: Map<string, Map<string, fhir.Resource>> = new Map<string, Map<string, fhir.Resource>>()

                  Promise.all(sheetRecords.map((record: store.Record) => {
                    return new Promise((resolveRecord, rejectRecord) => {
                      if (!resources.get(record.resource)) resources.set(record.resource, [])

                      const generator = generators.get(record.resource)!
                      const currResourceList: fhir.Resource[] = resources.get(record.resource)!
                      const bufferResourceMap: Map<string, BufferResource> = new Map<string, BufferResource>()

                      if (generator) {
                        Promise.all(record.data.map((sourceData: store.SourceTargetGroup) => {
                          return new Promise((resolveTargets, rejectTargets) => {
                            const entryValue: any = entry[sourceData.value]
                            if (entryValue !== undefined && entryValue !== null && entryValue !== '') {
                              const value = String(entryValue)
                              Promise.all(sourceData.target.map((target: store.Target) => {

                                // Buffer Resource creation
                                // target.value.substr(target.value.length - 3) === '[x]'
                                if (target.type)
                                  bufferResourceMap.set(`${target.value}.${target.type}`, FHIRUtil.cleanJSON({
                                    value,
                                    sourceType: sourceData.type,
                                    targetType: target.type,
                                    conceptMap: conceptMap.get(sourceData.conceptMap?.id)
                                  }))
                                else
                                  bufferResourceMap.set(target.value, FHIRUtil.cleanJSON({
                                    value,
                                    sourceType: sourceData.type,
                                    targetType: target.type,
                                    conceptMap: conceptMap.get(sourceData.conceptMap?.id)
                                  }))

                              }))
                                .then(() => resolveTargets())
                                .catch(() => resolveTargets())
                            } else resolveTargets()
                          })
                        }))
                          .then(() => {
                            // End of one record
                            // Generate FHIR Resource from bufferResourceMap
                            generator.generateResource(bufferResourceMap, record.profile)
                              .then((res: fhir.Resource) => {

                                currResourceList.push(res)
                                setTimeout(() => { resolveRecord() }, 0)

                              })
                              .catch(err => {

                                log.error(record.resource + ' Resource generation error.', err)
                                setTimeout(() => { resolveRecord() }, 0)

                              })

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
                  ipcRenderer.send(ipcChannels.TO_RENDERER, `generated-resources-${filePath}-${sheet.sheetName}`, {status: Status.VALIDATING})
                  if (entries.length) {

                    Promise.all(Array.from(resources.keys()).map(resourceType => {
                      try {
                        this.electronStore.set(
                          `resources.${resourceType}`,
                          (this.electronStore.get(`resources.${resourceType}`) || []).concat(resources.get(resourceType))
                        )
                      } catch (err) {
                        log.warn(`Couldn't store resources created: ${err}`)
                      }
                      const resourceList = resources.get(resourceType) || []
                      return new Promise((resolve, reject) => {
                        // Batch upload resources
                        // Max capacity 1000 resources
                        const len = Math.ceil(resourceList.length / 1000)

                        const batchPromiseList: Array<Promise<any>> = []

                        for (let i = 0, p = Promise.resolve(); i < len; i++) {
                          batchPromiseList.push(p.then(() => new Promise((resolveBatch, rejectBatch) => {
                            this.fhirService.validate(resourceList!.slice(i * 1000, (i + 1) * 1000))
                              .then(res => {
                                const bundle: fhir.Bundle = res.data as fhir.Bundle
                                const outcomeDetails: OutcomeDetail[] = []
                                let hasError: boolean = false

                                // Check batch bundle response for errors
                                Promise.all(bundle.entry?.map(_ => {
                                  if (!_.resource) {
                                    const operationOutcome: fhir.OperationOutcome = _.response!.outcome as fhir.OperationOutcome
                                    operationOutcome.issue.map(issue => {
                                      if (issue.severity === 'error') {
                                        hasError = true
                                        outcomeDetails.push({status: Status.ERROR, resourceType, message: `${issue.location} : ${issue.diagnostics}`} as OutcomeDetail)
                                      }
                                      // else if (issue.severity === 'information') {
                                      // outcomeDetails.push({status: Status.SUCCESS, resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
                                      // }
                                    })
                                  } else {
                                    outcomeDetails.push({status: Status.SUCCESS, resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
                                  }
                                }) || [])
                                  .then(() => {
                                    if (hasError) resolveBatch(outcomeDetails)
                                    else resolveBatch(outcomeDetails)
                                  })
                                  .catch(err => rejectBatch(err))
                              })
                              .catch(err => {
                                log.error(`Batch process error. ${err}`)
                                rejectBatch(err)
                                ipcRenderer.send(ipcChannels.TO_RENDERER, `validate-${filePath}-${sheet.sheetName}`, {status: Status.ERROR, outcomeDetails: [{status: Status.ERROR, resourceType: 'OperationOutcome', message: 'CONNECTIN ERROR'}]})
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

                      }).catch(_ => _)

                    }))
                      .then((res: any[]) => {
                        resolveSheet()
                        const outcomeDetails: OutcomeDetail[] = [].concat.apply([], res)
                        const status = !outcomeDetails.length || !!outcomeDetails.find(_ => _.status === Status.ERROR) ? Status.ERROR : Status.SUCCESS
                        ipcRenderer.send(ipcChannels.TO_RENDERER, `validate-${filePath}-${sheet.sheetName}`, {status, outcomeDetails})
                        log.info(`Validation completed ${sheet.sheetName} in ${filePath}`)
                      })
                      .catch(err => {
                        resolveSheet()
                        ipcRenderer.send(ipcChannels.TO_RENDERER, `validate-${filePath}-${sheet.sheetName}`, {status: Status.ERROR, message: 'Batch process error', outcomeDetails: err})
                        log.error(`Batch process error ${filePath}-${sheet.sheetName}`)
                      })

                  } else {
                    resolveSheet()
                    ipcRenderer.send(ipcChannels.TO_RENDERER, `validate-${filePath}-${sheet.sheetName}`, {status: Status.ERROR, outcomeDetails: [{status: Status.ERROR, resourceType: 'OperationOutcome', message: 'Empty sheet'}]})
                    log.warn(`Empty sheet: ${sheet.sheetName} in ${filePath}`)
                  }
                })
                .catch(err => {
                  resolveSheet()
                  ipcRenderer.send(ipcChannels.TO_RENDERER, `validate-${filePath}-${sheet.sheetName}`, {status: Status.ERROR, outcomeDetails: [{status: Status.ERROR, resourceType: 'OperationOutcome', message: `Validation error for sheet: ${sheet.sheetName}. ${err}`}]})
                  log.error(`Validation error for sheet: ${sheet.sheetName} in ${filePath}: ${err}`)
                })
            }))
          , Promise.resolve()
        )
          .then(() => {
            log.info('Validation completed')
            this.ready()
          })
          .catch(err => {
            log.error(`Error in Validation. ${err}`)
            this.ready()
          })
      })
        .catch(err => {
          ipcRenderer.send(ipcChannels.TO_RENDERER, `validate-error-${filePath}`, {status: Status.ERROR, outcomeDetails: [{status: Status.ERROR, message: `File not found : ${filePath}`, resourceType: 'OperationOutcome'}]})
          log.error(`File not found. ${err}`)
          this.ready()
          return
        })
    })
  }

  /**
   * Puts resources into the FHIR Repository
   */
  public onTransform () {
    ipcRenderer.on(ipcChannels.Fhir.TRANSFORM, (event) => {
      let resources: Map<string, fhir.Resource[]> = new Map<string, fhir.Resource[]>()

      try {
        resources = new Map(Object.entries(this.electronStore.get('resources') || {}))
      } catch (e) {
        log.error('Electron store couldn\'t get the resources')
        this.ready()
        return
      }

      Promise.all(Array.from(resources.keys()).map(resourceType => {
        const resourceList = resources.get(resourceType)
        return new Promise((resolve, reject) => {

          ipcRenderer.send(ipcChannels.TO_RENDERER, `transform-${resourceType}`, {status: Status.IN_PROGRESS} as OutcomeDetail)

          // Batch upload resources
          // Max capacity 1000 resources
          const len = Math.ceil(resourceList!.length / 1000)

          const batchPromiseList: Array<Promise<any>> = []

          for (let i = 0, p = Promise.resolve(); i < len; i++) {
            batchPromiseList.push(p.then(() => new Promise((resolveBatch, rejectBatch) => {
              this.fhirService.postBatch(resourceList!.slice(i * 1000, (i + 1) * 1000), 'PUT')
                .then(res => {
                  const bundle: fhir.Bundle = res.data as fhir.Bundle
                  const outcomeDetails: OutcomeDetail[] = []
                  let hasError: boolean = false

                  // Check batch bundle response for errors
                  Promise.all(bundle.entry?.map(_ => {
                    if (!_.resource) {
                      const operationOutcome: fhir.OperationOutcome = _.response!.outcome as fhir.OperationOutcome
                      operationOutcome.issue.map(issue => {
                        if (issue.severity === 'error') {
                          hasError = true
                          outcomeDetails.push({status: Status.ERROR, resourceType, message: `${issue.location} : ${issue.diagnostics}`} as OutcomeDetail)
                        } else if (issue.severity === 'information') {
                          outcomeDetails.push({status: Status.SUCCESS, resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
                        }
                      })
                    } else {
                      outcomeDetails.push({status: Status.SUCCESS, resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
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
              log.info(`Batch process completed for Resource: ${resourceType}`)
              ipcRenderer.send(ipcChannels.TO_RENDERER, `transform-${resourceType}`, {status: Status.SUCCESS, outcomeDetails: concatResult} as OutcomeDetail)
              resolve(concatResult)
            })
            .catch(err => {
              log.error(`Batch process error for Resource: ${resourceType}`)
              ipcRenderer.send(ipcChannels.TO_RENDERER, `transform-${resourceType}`, {status: Status.ERROR} as OutcomeDetail)
              reject(err)
            })

        }).catch(_ => _)

      }))
        .then((res: any[]) => {
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.TRANSFORM_RESULT, {status: Status.SUCCESS, outcomeDetails: [].concat.apply([], res)})
          log.info(`Transform completed`)

          this.ready()
        })
        .catch(err => {
          ipcRenderer.send(ipcChannels.TO_RENDERER, ipcChannels.Fhir.TRANSFORM_RESULT, {status: Status.ERROR, message: 'Transform error', outcomeDetails: err})
          log.error(`Transform error. ${err}`)

          this.ready()
        })
    })
  }

  render (createElement: CreateElement): VNode {
    return createElement('div', {}, 'This is the background process window.')
  }
}
