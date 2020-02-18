import * as Excel from 'xlsx'
import fs from 'fs'
import log from 'electron-log'
import 'isomorphic-fetch'
import { ipcMain } from 'electron'
import { workbookMap } from '../model/workbook'
import { TargetResource } from './../model/file-source'
import { FhirService } from './../services/fhir.service'
import { Patient, Practitioner, Condition, Observation } from './../model/resources'
import { ResourceFactory } from './../model/factory/resource-factory'

/**
 * Start point of Transforming data to FHIR
 */
ipcMain.on('transform', (event, fhirBase: string, data: any) => {
  const fhirService: FhirService = new FhirService(fhirBase)
  const filePath = data.filePath

  const getWorkbooks = new Promise<Excel.WorkBook>(((resolve, reject) => {
    if (workbookMap.has(filePath)) {
      event.sender.send(`transforming-read-file-${filePath}`, [])
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
        event.sender.send(`transforming-read-file-${filePath}`, [])
        resolve(workbook)
      })
    }
  }))
  getWorkbooks.then(workbook => {
    for (const sheet of Object.keys(data.sheets)) {
      const entries: any[] = Excel.utils.sheet_to_json(workbook.Sheets[sheet]) || []
      const sheetTargets = data.sheets[sheet]

      event.sender.send(`info-${filePath}-${sheet}`, {total: entries.length})
      log.info(`Starting transform ${sheet} in ${filePath}`)

      // Start transform action
      // Create records row by row in entries
      const resources: Map<string, fhir.Resource[]> = new Map<string, fhir.Resource[]>()

      Promise.all(entries.map(entry => {

        // For each row create resource instances
        const resourceMap: Map<string, Map<string, fhir.Resource>> = new Map<string, Map<string, fhir.Resource>>()

        return new Promise((resolveOneRow, rejectOneRow) => {
          Promise.all(sheetTargets.map(attr => {
            return Promise.all(attr.target?.map((target: TargetResource) => {
              return new Promise((resolve, reject) => {
                if (entry[attr.value!] !== null && entry[attr.value!] !== undefined && entry[attr.value!] !== '') {
                  const [resourceType, field, ...subfields] = target.value.split('.')
                  const payload: ResourceGenerator.Payload = {
                    value: String(entry[attr.value!]),
                    sourceType: attr.type,
                    targetField: field,
                    targetSubFields: subfields,
                    fhirType: target.type
                  }
                  if (!resourceMap.get(resourceType)) {
                    resourceMap.set(resourceType, new Map<string, fhir.Resource>())
                  }
                  const curResourceGroup: Map<string, fhir.Resource> = resourceMap.get(resourceType)!
                  switch (resourceType) {
                    case 'Patient':
                      if (!curResourceGroup.has(attr.recordId)) {
                        const patientResource: fhir.Patient = {resourceType: 'Patient'}
                        curResourceGroup.set(attr.recordId, patientResource)
                      }
                      Patient.generate(curResourceGroup.get(attr.recordId)! as fhir.Patient, payload)
                        .then(_ => resolve(true))
                        .catch(err => reject(err))
                      break
                    case 'Practitioner':
                      if (!curResourceGroup.has(attr.recordId)) {
                        const practitionerResource: fhir.Practitioner = {resourceType: 'Practitioner'}
                        curResourceGroup.set(attr.recordId, practitionerResource)
                      }
                      Practitioner.generate(curResourceGroup.get(attr.recordId)! as fhir.Practitioner, payload)
                        .then(_ => resolve(true))
                        .catch(err => reject(err))
                      break
                    case 'Condition':
                      if (!curResourceGroup.has(attr.recordId)) {
                        const conditionResource: fhir.Condition = {resourceType: 'Condition', subject: {}} as fhir.Condition
                        curResourceGroup.set(attr.recordId, conditionResource)
                      }
                      Condition.generate(curResourceGroup.get(attr.recordId)! as fhir.Condition, payload)
                        .then(_ => resolve(true))
                        .catch(err => reject(err))
                      break
                    case 'Observation':
                      // TODO
                      break
                    default:
                      resolve(true)
                  }
                } else {
                  // log.warn(`${entry[attr.value!]} Empty field`)
                  resolve(true)
                }
              })
            }) || [])
          }))
            .then((res) => {
              // End of transforming for one row

              // Assign id to each resource and list them
              Promise.all(Array.from(resourceMap.keys()).map(resourceType => {
                if (!resources.get(resourceType)) resources.set(resourceType, [])
                const tmpList: fhir.Resource[] = []
                Promise.all(Array.from(Array.from(resourceMap.get(resourceType)!.values()).map((resource: fhir.Resource) => {
                  tmpList.push()
                  const id: string = ResourceFactory.generateID(resource)
                  if (id) {
                    resource.id = id
                    tmpList.push(resource)
                  }
                })))
                  .then(() => resources.set(resourceType, resources.get(resourceType)!.concat(tmpList)))
                  .catch(err => rejectOneRow(err))

              }))
                .then(() => resolveOneRow(true))
                .catch(err => rejectOneRow(err))

            })
            .catch(err => {
              // event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: `Transform error for sheet: ${sheet}`})
              log.error(`Transform error in one row for sheet: ${sheet} in ${filePath}: ${err.message}`)
              rejectOneRow(err)
            })
        })
      }))
        .then(() => { // End of sheet
          if (entries.length) {

            Promise.all(Array.from(resources.keys()).map(resourceType => {
              const resourceList = resources.get(resourceType)
              return new Promise((resolve, reject) => {
                // Batch upload resources
                // Max capacity 5000 resources
                const len = Math.ceil(resourceList!.length / 5000)

                const batchPromiseList: Array<Promise<any>> = []

                for (let i = 0, p = Promise.resolve(); i < len; i++) {
                  batchPromiseList.push(p.then(() => new Promise((resolveBatch, rejectBatch) => {
                    fhirService.postBatch(resourceList!.slice(i * 5000, (i + 1) * 5000), 'PUT')
                      .then(res => {
                        const bundle: fhir.Bundle = res.data as fhir.Bundle
                        const transformDetails: TransformDetail[] = []
                        let hasError: boolean = false

                        // Check batch bundle response for errors
                        Promise.all(bundle.entry?.map(_ => {
                          if (!_.resource) {
                            const operationOutcome: fhir.OperationOutcome = _.response!.outcome as fhir.OperationOutcome
                            operationOutcome.issue.map(issue => {
                              if (issue.severity === 'error') {
                                hasError = true
                                transformDetails.push({status: 'error', message: `${issue.location} : ${issue.diagnostics}`} as TransformDetail)
                              } else if (issue.severity === 'information') {
                                transformDetails.push({status: 'done', message: `${issue.diagnostics}`} as TransformDetail)
                              }
                            })
                          } else {
                            transformDetails.push({status: 'done', message: `${resourceType} resource created with id ${_.resource.id}`} as TransformDetail)
                          }
                        }) || []).then(() => {
                          if (hasError) rejectBatch(transformDetails)
                          else resolveBatch(transformDetails)
                        })
                          .catch(err => rejectBatch(err))
                      })
                      .catch(err => {
                        log.warn(`Batch upload error: ${err}`)
                        rejectBatch(err)
                      })
                  }).catch(_ => _)))
                }

                Promise.all(batchPromiseList)
                  .then(res => {
                    log.info(`Batch upload completed for Resource: ${resourceType}`)
                    resolve([].concat.apply([], res))
                  })
                  .catch(err => {
                    log.info(`Batch upload error for Resource: ${resourceType}`)
                    reject(err)
                  })

              }).catch(_ => _)

            }))
              .then((res: any[]) => {
                event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'done', transformDetails: [].concat.apply([], res)})
                log.info(`Transform done ${sheet} in ${filePath}`)
              })
              .catch(err => {
                event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: 'Batch upload error', transformDetails: err})
                log.error(`BATCH ERROR ${filePath}-${sheet}`)
              })

          } else {
            event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'warning', description: 'Empty sheet'})
            log.warn(`Empty sheet: ${sheet} in ${filePath}`)
          }
        })
        .catch(err => {
          event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: `Transform error for sheet: ${sheet}`})
          log.error(`Transform error for sheet: ${sheet} in ${filePath}: ${err}`)
        })
    }
  })
    .catch(err => {
      event.sender.send(`transforming-error-${filePath}`, {status: 'error', description: `File not found`})
      log.error(`File not found: ${err}`)
      return
    })
})

ipcMain.on('delete-resource', (event, fhirBase: string, resourceType: string) => {
  const fhirService: FhirService = new FhirService(fhirBase)
  fhirService.deleteAll(resourceType)
    .then(_ => event.sender.send(`delete-resource-result`, true))
    .catch(_ => event.sender.send(`delete-resource-result`, false))
})
