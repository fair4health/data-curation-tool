import * as Excel from 'xlsx'
import fs from 'fs'
import log from 'electron-log'
import electronStore from './../electron-store'
import { ipcMain } from 'electron'
import { workbookMap } from '../model/workbook'
import { FhirService } from './../services/fhir.service'
import generators from '../model/resource-generators'

/**
 * Create and validate resources
 */
ipcMain.on('validate', (event, fhirBase: string, data: any) => {
  const fhirService: FhirService = new FhirService(fhirBase)
  const filePath = data.filePath

  const getWorkbooks = new Promise<Excel.WorkBook>(((resolve, reject) => {
    if (workbookMap.has(filePath)) {
      event.sender.send(`validate-read-file-${filePath}`, [])
      resolve(workbookMap.get(filePath))
    } else {
      fs.readFile(filePath, (err, buffer) => {
        if (err) {
          reject(err)
          return
        }
        const workbook: Excel.WorkBook = Excel.read(buffer, {type: 'buffer', cellDates: true})
        // Save buffer workbook to map
        workbookMap.set(filePath, workbook)
        event.sender.send(`validate-read-file-${filePath}`, [])
        resolve(workbook)
      })
    }
  }))
  getWorkbooks.then(workbook => {
    data.sheets.reduce((promise: Promise<any>, sheet: store.Sheet) =>
      promise.then(() => new Promise((resolveSheet, rejectSheet) => {

        const entries: any[] = Excel.utils.sheet_to_json(workbook.Sheets[sheet.sheetName]) || []
        const sheetRecords: store.Record[] = sheet.records

        event.sender.send(`info-${filePath}-${sheet.sheetName}`, {total: entries.length})
        log.info(`Creating resources in ${sheet.sheetName} in ${filePath}`)

        // Create resources row by row in entries
        // Start validation operation
        const resources: Map<string, fhir.Resource[]> = new Map<string, fhir.Resource[]>()

        entries.reduce((promiseEntry: Promise<any>, entry) =>
          promiseEntry.finally(() => new Promise((resolveOneRow, rejectOneRow) => {
            // For each row create resource instances
            // const resourceMap: Map<string, Map<string, fhir.Resource>> = new Map<string, Map<string, fhir.Resource>>()

            sheetRecords.reduce((promiseRecord: Promise<any>, record: store.Record) =>
              promiseRecord.finally(() => new Promise((resolveRecord, rejectRecord) => {
                if (!resources.get(record.resource)) resources.set(record.resource, [])

                const generator = generators.get(record.resource)!
                const currResourceList: fhir.Resource[] = resources.get(record.resource)!
                const bufferResourceMap: Map<string, BufferResource> = new Map<string, BufferResource>()

                Promise.all(record.data.map((sourceData: store.SourceTargetGroup) => {
                  return new Promise((resolveTargets, rejectTargets) => {
                    const entryValue: any = entry[sourceData.value]
                    if (entryValue !== undefined && entryValue !== null && entryValue !== '') {
                      const value = String(entryValue)
                      Promise.all(sourceData.target.map((target: store.Target) => {

                        if (target.value.substr(target.value.length - 3) === '[x]' && target.type)
                          bufferResourceMap.set(`${target.value}.${target.type}`, {value, sourceType: sourceData.type, targetType: target.type})
                        else
                          bufferResourceMap.set(target.value, {value, sourceType: sourceData.type, targetType: target.type})

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

                        log.error('Record generation error.', err)
                        setTimeout(() => { resolveRecord() }, 0)

                      })

                  })
                  .catch(err => rejectRecord(err))
              }))
            , Promise.resolve())
              .then(() => resolveOneRow())
              .catch(() => resolveOneRow())

          }))
        , Promise.resolve())
          .then(() => { // End of sheet
            if (entries.length) {

              Promise.all(Array.from(resources.keys()).map(resourceType => {
                try {
                  electronStore.set(
                    `resources.${resourceType}`,
                    (electronStore.get(`resources.${resourceType}`) || []).concat(resources.get(resourceType))
                  )
                } catch (err) {
                  log.warn(`Couldn't store resources created: ${err}`)
                }
                const resourceList = resources.get(resourceType)
                return new Promise((resolve, reject) => {
                  // Batch upload resources
                  // Max capacity 1000 resources
                  const len = Math.ceil(resourceList!.length / 1000)

                  const batchPromiseList: Array<Promise<any>> = []

                  for (let i = 0, p = Promise.resolve(); i < len; i++) {
                    batchPromiseList.push(p.then(() => new Promise((resolveBatch, rejectBatch) => {
                      fhirService.validate(resourceList!.slice(i * 1000, (i + 1) * 1000))
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
                                  outcomeDetails.push({status: 'error', resourceType, message: `${issue.location} : ${issue.diagnostics}`} as OutcomeDetail)
                                }
                                // else if (issue.severity === 'information') {
                                  // outcomeDetails.push({status: 'success', resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
                                // }
                              })
                            } else {
                              outcomeDetails.push({status: 'success', resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
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
                      log.info(`Batch process completed for Resource: ${resourceType}`)
                      resolve([].concat.apply([], res))
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
                  const status = !!outcomeDetails.find(_ => _.status === 'error') ? 'warning' : 'done'
                  event.sender.send(`validate-${filePath}-${sheet.sheetName}`, {status, outcomeDetails})
                  log.info(`Validation completed ${sheet.sheetName} in ${filePath}`)
                })
                .catch(err => {
                  resolveSheet()
                  event.sender.send(`validate-${filePath}-${sheet.sheetName}`, {status: 'error', description: 'Batch process error', outcomeDetails: err})
                  log.error(`Batch process error ${filePath}-${sheet.sheetName}`)
                })

            } else {
              resolveSheet()
              event.sender.send(`validate-${filePath}-${sheet.sheetName}`, {status: 'warning', description: 'Empty sheet'})
              log.warn(`Empty sheet: ${sheet.sheetName} in ${filePath}`)
            }
          })
          .catch(err => {
            resolveSheet()
            event.sender.send(`validate-${filePath}-${sheet.sheetName}`, {status: 'error', description: `Validation error for sheet: ${sheet.sheetName}`})
            log.error(`Validation error for sheet: ${sheet.sheetName} in ${filePath}: ${err}`)
          })
      }))
      , Promise.resolve()
    )
      .then(() => log.info('Validation completed'))
      .catch(err => log.error(`Error in Validation. ${err}`))
  })
    .catch(err => {
      event.sender.send(`validate-error-${filePath}`, {status: 'error', description: `File not found : ${filePath}`})
      log.error(`File not found. ${err}`)
      return
    })
})

ipcMain.on('delete-resource', (event, fhirBase: string, resourceType: string) => {
  const fhirService: FhirService = new FhirService(fhirBase)
  fhirService.deleteAll(resourceType)
    .then(_ => event.sender.send(`delete-resource-result`, true))
    .catch(_ => event.sender.send(`delete-resource-result`, false))
})
