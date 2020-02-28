import * as Excel from 'xlsx'
import fs from 'fs'
import log from 'electron-log'
import electronStore from './../electron-store'
import { ipcMain } from 'electron'
import { workbookMap } from '../model/workbook'
import { TargetResource } from './../model/file-source'
import { FhirService } from './../services/fhir.service'
import { Patient, Practitioner, Condition, Observation, Medication, MedicationStatement } from './../model/resources'
import { ResourceFactory } from './../model/factory/resource-factory'
import { environment } from './../environment'

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
    Object.keys(data.sheets).reduce((promise: Promise<any>, sheet) =>
      promise.then(() => new Promise((resolveSheet, rejectSheet) => {
        const entries: any[] = Excel.utils.sheet_to_json(workbook.Sheets[sheet]) || []
        const sheetTargets = data.sheets[sheet]

        event.sender.send(`info-${filePath}-${sheet}`, {total: entries.length})
        log.info(`Creating resources in ${sheet} in ${filePath}`)

        // Create resources row by row in entries
        // Start validation operation
        const resources: Map<string, fhir.Resource[]> = new Map<string, fhir.Resource[]>()

        entries.reduce((promiseEntry, entry) =>
          promiseEntry.finally(() => new Promise((resolveOneRow, rejectOneRow) => {
            // For each row create resource instances
            const resourceMap: Map<string, Map<string, fhir.Resource>> = new Map<string, Map<string, fhir.Resource>>()

            // return new Promise((resolveOneRow, rejectOneRow) => {
              Promise.all(sheetTargets.map(attr => {
                return Promise.all(attr.target?.map((target: TargetResource) => {
                  return new Promise((resolve, reject) => {
                    if (entry[attr.value!] !== null && entry[attr.value!] !== undefined && entry[attr.value!] !== '') {
                      const [resourceType, field, ...subfields] = target.value.split('.')
                      const profile: string = target.profile
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
                            const patientResource: fhir.Patient = {resourceType: 'Patient', meta: {}}
                            patientResource.meta!.profile = [environment.profiles[profile]]
                            curResourceGroup.set(attr.recordId, patientResource)
                          }
                          Patient.generate(curResourceGroup.get(attr.recordId)! as fhir.Patient, payload)
                            .then(_ => resolve(true))
                            .catch(err => reject(err))
                          break
                        case 'Practitioner':
                          if (!curResourceGroup.has(attr.recordId)) {
                            const practitionerResource: fhir.Practitioner = {resourceType: 'Practitioner', meta: {}}
                            practitionerResource.meta!.profile = [environment.profiles[profile]]
                            curResourceGroup.set(attr.recordId, practitionerResource)
                          }
                          Practitioner.generate(curResourceGroup.get(attr.recordId)! as fhir.Practitioner, payload)
                            .then(_ => resolve(true))
                            .catch(err => reject(err))
                          break
                        case 'Condition':
                          if (!curResourceGroup.has(attr.recordId)) {
                            const conditionResource: fhir.Condition = {resourceType: 'Condition', subject: {}, meta: {}} as fhir.Condition
                            conditionResource.meta!.profile = [environment.profiles[profile]]
                            curResourceGroup.set(attr.recordId, conditionResource)
                          }
                          Condition.generate(curResourceGroup.get(attr.recordId)! as fhir.Condition, payload)
                            .then(_ => resolve(true))
                            .catch(err => reject(err))
                          break
                        case 'Observation':
                          // TODO
                          break
                        case 'Medication':
                          if (!curResourceGroup.has(attr.recordId)) {
                            const medicationResource: fhir.Medication = {resourceType: 'Medication', meta: {}} as fhir.Medication
                            medicationResource.meta!.profile = [environment.profiles[profile]]
                            curResourceGroup.set(attr.recordId, medicationResource)
                          }
                          Medication.generate(curResourceGroup.get(attr.recordId)! as fhir.Medication, payload)
                            .then(_ => resolve(true))
                            .catch(err => reject(err))
                          break
                        case 'MedicationStatement':
                          if (!curResourceGroup.has(attr.recordId)) {
                            const medicationStatement: fhir.MedicationStatement = {resourceType: 'MedicationStatement', meta: {}} as fhir.MedicationStatement
                            medicationStatement.meta!.profile = [environment.profiles[profile]]
                            curResourceGroup.set(attr.recordId, medicationStatement)
                          }
                          MedicationStatement.generate(curResourceGroup.get(attr.recordId)! as fhir.MedicationStatement, payload)
                            .then(_ => resolve(true))
                            .catch(err => reject(err))
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
                  // End of the row - resources are created for one row

                  // Assign id to each resource and list them
                  Promise.all(Array.from(resourceMap.keys()).map(resourceType => {
                    if (!resources.get(resourceType)) resources.set(resourceType, [])
                    const tmpList: fhir.Resource[] = []
                    Promise.all(Array.from(Array.from(resourceMap.get(resourceType)!.values()).map((resource: fhir.Resource) => {
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
                  // event.sender.send(`validate-${filePath}-${sheet}`, {status: 'error', description: `Resource creation error for sheet: ${sheet}`})
                  log.error(`Resource creation error in one row for sheet: ${sheet} in ${filePath}: ${err.message}`)
                  rejectOneRow(err)
                })
            // })
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
                                } else if (issue.severity === 'information') {
                                  outcomeDetails.push({status: 'success', resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
                                }
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
                  event.sender.send(`validate-${filePath}-${sheet}`, {status: 'done', outcomeDetails: [].concat.apply([], res)})
                  log.info(`Validation completed ${sheet} in ${filePath}`)
                })
                .catch(err => {
                  resolveSheet()
                  event.sender.send(`validate-${filePath}-${sheet}`, {status: 'error', description: 'Batch process error', outcomeDetails: err})
                  log.error(`Batch process error ${filePath}-${sheet}`)
                })

            } else {
              resolveSheet()
              event.sender.send(`validate-${filePath}-${sheet}`, {status: 'warning', description: 'Empty sheet'})
              log.warn(`Empty sheet: ${sheet} in ${filePath}`)
            }
          })
          .catch(err => {
            resolveSheet()
            event.sender.send(`validate-${filePath}-${sheet}`, {status: 'error', description: `Validation error for sheet: ${sheet}`})
            log.error(`Validation error for sheet: ${sheet} in ${filePath}: ${err}`)
          })
      }))
      , Promise.resolve()
    )
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
